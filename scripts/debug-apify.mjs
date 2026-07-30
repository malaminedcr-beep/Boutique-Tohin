const TOKEN = process.env.APIFY_TOKEN;

const debugPageFn = `
async function pageFunction(context) {
  const { log, request } = context;
  const keys = Object.keys(context);
  const types = {};
  for (const k of keys) {
    try { types[k] = typeof context[k]; } catch(e) { types[k] = 'error'; }
  }
  log.info('CONTEXT: ' + JSON.stringify(types));

  // Test $
  let dollarTest = 'not available';
  if (typeof context.$ !== 'undefined') {
    dollarTest = typeof context.$;
    try {
      const result = context.$('title').text();
      dollarTest = 'works: ' + result.slice(0, 30);
    } catch(e) {
      dollarTest = 'error: ' + e.message;
    }
  }

  // Test page
  let pageTest = 'not available';
  if (typeof context.page !== 'undefined') {
    pageTest = typeof context.page;
    try {
      const url = context.page.url();
      pageTest = 'works, url=' + url;
    } catch(e) {
      pageTest = 'error: ' + e.message;
    }
  }

  return { keys: types, dollarTest, pageTest, url: request.url };
}
`;

async function run() {
  const res = await fetch('https://api.apify.com/v2/acts/apify~web-scraper/runs', {
    method: 'POST',
    headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      startUrls: [{ url: 'https://www.amazon.fr/s?k=Vichy+Mineral+89', userData: { test: true } }],
      pageFunction: debugPageFn,
      maxPagesPerCrawl: 1,
      proxyConfiguration: { useApifyProxy: true }
    })
  });
  const run = await res.json();
  const runId = run.data.id;
  const datasetId = run.data.defaultDatasetId;
  console.log('RunId:', runId);

  let status = 'RUNNING';
  while (['RUNNING','READY'].includes(status)) {
    await new Promise(r => setTimeout(r, 8000));
    const s = await fetch(`https://api.apify.com/v2/actor-runs/${runId}`, {
      headers: { Authorization: `Bearer ${TOKEN}` }
    }).then(r => r.json());
    status = s.data.status;
    process.stdout.write(status + ' ');
  }
  console.log('');

  const data = await fetch(`https://api.apify.com/v2/datasets/${datasetId}/items?limit=5`, {
    headers: { Authorization: `Bearer ${TOKEN}` }
  }).then(r => r.json());
  console.log(JSON.stringify(data, null, 2));
}

run().catch(console.error);
