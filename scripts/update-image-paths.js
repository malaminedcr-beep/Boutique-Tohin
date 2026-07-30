const fs = require('fs');
const path = require('path');

const productsFile = path.join(__dirname, '..', 'data', 'products.json');

// Read current products
let products = JSON.parse(fs.readFileSync(productsFile, 'utf8'));

// Update image paths with new names
products = products.map(product => {
  // Map old image paths to new ones
  const imageMapping = {
    '/images/moisturising-lotion-icon-fr-lg.webp': '/images/moisturising-lotion-icon-fr-lg.webp', // Keep as is
    '/images/foaming-cleanser-icon-fr-lg.webp': '/images/foaming-cleanser-icon-fr-lg.webp', // Keep as is
    '/images/blemish-cleanser-473ml-lg.webp': '/images/blemish-cleanser-473ml-lg.webp', // Keep as is
    '/images/vitamin-c-1-lg.webp': '/images/vitamin-c-1-lg.webp', // Keep as is
    '/images/hydrating-face-cream-spf50-packshot-front.webp': '/images/hydrating-face-cream-spf50-packshot-front.webp', // Already correct
    '/images/retinol-serum-anti-marks-packshot-front.webp': '/images/retinol-serum-anti-marks-packshot-front.webp', // Already correct
    '/images/concentrated-anti-blemish-care-3-benefits.webp': '/images/concentrated-anti-blemish-care-3-benefits.webp', // Already correct
  };

  if (product.image && imageMapping[product.image]) {
    product.image = imageMapping[product.image];
  }
  return product;
});

// Write updated products
fs.writeFileSync(productsFile, JSON.stringify(products, null, 2));
console.log('✅ Products.json updated');
