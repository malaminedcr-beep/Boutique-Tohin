const fs = require('fs');
const path = require('path');

const imagesDir = path.join(__dirname, '..', 'public', 'images');
const productsFile = path.join(__dirname, '..', 'data', 'products.json');

// Manual translation mapping for French names to English
const translations = {
  'crme-hydratante-visage-spf50-3-bnfices': 'hydrating-face-cream-spf50-3-benefits',
  'crme-hydratante-visage-spf50-packshot-back-700x875': 'hydrating-face-cream-spf50-packshot-back',
  'gel-moussant-3-benefices': 'foaming-gel-3-benefits',
  'gel-moussant-473ml-packshot-back': 'foaming-gel-473ml-packshot-back',
  'gel-moussant-anti-imperfections-3-benefices': 'foaming-gel-anti-blemish-3-benefits',
  'gel-moussant-anti-imperfections-packshot-back': 'foaming-gel-anti-blemish-packshot-back',
  'gel-moussant-anti-imperfections-with-logo': 'foaming-gel-anti-blemish-with-logo',
  'gel-moussant-texture-bnfices700x785-1': 'foaming-gel-texture-benefits-700x785-1',
  'lait-hydratant-473ml-3-benefices': 'hydrating-milk-473ml-3-benefits',
  'lait-hydratant-473ml-packshot-back': 'hydrating-milk-473ml-packshot-back',
  'lait-hydratant-473ml-texture-benefices': 'hydrating-milk-473ml-texture-benefits',
  'oil-control-fr-3-lg': 'oil-control-3-lg',
  'serum-retinol-anti-marques-3-benefices': 'retinol-serum-anti-marks-3-benefits',
  'serum-retinol-anti-marques-application-visage-1': 'retinol-serum-anti-marks-application-face-1',
  'serum-retinol-anti-marques-packshot-back': 'retinol-serum-anti-marks-packshot-back',
  'soin-concentre-anti-imperfections-application-visage-1': 'concentrated-anti-blemish-care-application-face-1',
  'soin-concentre-anti-imperfections-packshot-back': 'concentrated-anti-blemish-care-packshot-back',
  'soin-concentre-anti-imperfections-with-logo-lg': 'concentrated-anti-blemish-care-with-logo-lg',
  'suncare-50-2-lg': 'sun-protection-50-2-lg',
  'frfluidesec3lg': 'dry-fluid-3-lg',
  'frfluidesec5lg': 'dry-fluid-5-lg',
};

async function renameImages() {
  const files = fs.readdirSync(imagesDir).filter(file => /\.(webp|jpg|jpeg|png)$/i.test(file));

  let products = JSON.parse(fs.readFileSync(productsFile, 'utf8'));
  let updatedCount = 0;

  for (const file of files) {
    const ext = path.extname(file);
    const baseName = path.basename(file, ext);

    // Check if this file needs renaming
    if (translations[baseName]) {
      const newBaseName = translations[baseName];
      const newFileName = `${newBaseName}${ext}`;

      const oldPath = path.join(imagesDir, file);
      const newPath = path.join(imagesDir, newFileName);

      try {
        fs.renameSync(oldPath, newPath);
        console.log(`✅ Renamed: ${file} → ${newFileName}`);

        // Update products.json
        const oldImagePath = `/images/${file}`;
        const newImagePath = `/images/${newFileName}`;

        products = products.map(product => {
          if (product.image === oldImagePath) {
            return { ...product, image: newImagePath };
          }
          return product;
        });
        updatedCount++;
      } catch (error) {
        console.error(`❌ Error renaming ${file}:`, error.message);
      }
    } else if (baseName.startsWith('temp')) {
      // Clean up temp files
      try {
        fs.unlinkSync(path.join(imagesDir, file));
        console.log(`🗑️  Deleted temp file: ${file}`);
      } catch (error) {
        console.error(`❌ Error deleting ${file}:`, error.message);
      }
    }
  }

  // Write updated products.json
  fs.writeFileSync(productsFile, JSON.stringify(products, null, 2));
  console.log(`\n✅ Updated ${updatedCount} product image paths in products.json`);
  console.log('Done!');
}

renameImages().catch(console.error);
