import { ImageResponse } from 'next/og';

/**
 * Default Open Graph image (1200×630), used when a link is shared on
 * Facebook, WhatsApp or Messenger. No image file needs to be maintained by
 * hand: edit this layout and redeploy.
 *
 * Edge runtime: in Next 14.2, the Node build of @vercel/og fails on Windows
 * ("Invalid URL", path.join applied to a file:// URL). ImageResponse sends
 * `Cache-Control: public, immutable, max-age=31536000`, so the image is
 * generated once, then served from the Vercel CDN.
 */
export const runtime = 'edge';

const BG = '#FAF8F5';
const ACCENT = '#C9513A';
const INK = '#1A1A1A';
const MUTED = '#6B6B6B';
const BORDER = '#E8E2DA';

const PRODUCTS = [{ brand: 'CeraVe' }, { brand: 'La Roche-Posay' }, { brand: 'Vichy' }];

// Literal URLs (required for the files to be bundled into the edge function).
const IMAGE_URLS = [
  new URL('../../public/images/cerave-sa-smoothing-cream.jpg', import.meta.url),
  new URL('../../public/images/lrp-001-1.jpg', import.meta.url),
  new URL('../../public/images/vichy-mineral-89-packshot.jpg', import.meta.url),
];

export async function GET() {
  // Satori accepts an ArrayBuffer as an <img> src (the JSX types only declare string).
  const images = (await Promise.all(
    IMAGE_URLS.map((u) => fetch(u).then((r) => r.arrayBuffer())),
  )) as unknown as string[];

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          background: BG,
          padding: '56px 64px',
          fontFamily: 'sans-serif',
        }}
      >
        {/* Left column: message */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            width: 540,
          }}
        >
          <div style={{ display: 'flex', gap: 16, fontSize: 28, letterSpacing: 6, color: INK }}>
            <span>FRENCH</span>
            <span style={{ color: ACCENT }}>BEAUTY</span>
            <span>BD</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', width: 64, height: 4, background: ACCENT, marginBottom: 28 }} />
            <div style={{ display: 'flex', fontSize: 54, lineHeight: 1.12, color: INK }}>
              Authentic French skincare, delivered in Bangladesh
            </div>
            <div style={{ display: 'flex', fontSize: 22, color: MUTED, marginTop: 24 }}>
              CeraVe · La Roche-Posay · Vichy · Yves Rocher
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {['Bought in France', 'bKash & Nagad', 'Free delivery'].map((label) => (
              <div
                key={label}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  flexShrink: 0,
                  whiteSpace: 'nowrap',
                  height: 46,
                  fontSize: 18,
                  color: INK,
                  border: `2px solid ${BORDER}`,
                  borderRadius: 999,
                  padding: '0 18px',
                  background: '#FFFFFF',
                }}
              >
                {label}
              </div>
            ))}
          </div>
        </div>

        {/* Right column: three product cards */}
        <div
          style={{
            display: 'flex',
            flex: 1,
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: 14,
          }}
        >
          {PRODUCTS.map((p, i) => (
            <div
              key={p.brand}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                width: 160,
                height: i === 1 ? 420 : 360,
                background: '#FFFFFF',
                border: `2px solid ${BORDER}`,
                borderRadius: 90,
                overflow: 'hidden',
                paddingBottom: 22,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  flex: 1,
                  width: '100%',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                }}
              >
                {/* The packshots are square with a lot of white margin: zoom in on the product. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={images[i]} width={i === 1 ? 360 : 320} height={i === 1 ? 360 : 320} alt="" />
              </div>
              <div style={{ display: 'flex', fontSize: 14, color: MUTED }}>
                {p.brand}
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
