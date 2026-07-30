const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

const imagesDir = path.join(__dirname, '..', 'public', 'images');
const productsFile = path.join(__dirname, '..', 'data', 'products.json');

async function translateToEnglish(text) {
  try {
    const prompt = `Translate this French product name to English. Keep it concise and natural. Only return the English translation, nothing else: "${text}"`;
    const result = await model.generateContent(prompt);
    const translation = result.response.text().trim();
    return translation;
  } catch (error) {
    console.error('Error translating:', text, error);
    return text; // fallback to original
  }
}

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // remove special chars except spaces and hyphens
    .replace(/\s+/g, '-') // replace spaces with hyphens
    .replace(/-+/g, '-') // replace multiple hyphens with single
    .trim();
}

async function processImages() {
  const files = fs.readdirSync(imagesDir).filter(file => /\.(jpg|jpeg|png|webp)$/i.test(file));

  let products = JSON.parse(fs.readFileSync(productsFile, 'utf8'));

  for (const file of files) {
    const ext = path.extname(file);
    const baseName = path.basename(file, ext);

    // Translate
    const englishName = await translateToEnglish(baseName);
    console.log('Translating:', baseName, 'to', englishName);
    const newBaseName = slugify(englishName);
    const newFileName = `${newBaseName}${ext}`;

    const oldPath = path.join(imagesDir, file);
    const newPath = path.join(imagesDir, newFileName);

    // Rename
    fs.renameSync(oldPath, newPath);
    console.log(`Renamed: ${file} -> ${newFileName}`);

    // Optimize
    const optimizedPath = path.join(imagesDir, `${newBaseName}.webp`);
    if (newPath !== optimizedPath) {
      const tempPath = path.join(imagesDir, `temp_${Date.now()}.webp`);
      await sharp(newPath)
        .sharpen()
        .webp({ quality: 90 })
        .toFile(tempPath);

      try {
        fs.unlinkSync(newPath);
      } catch (e) {
        console.log('Could not delete', newPath);
      }
      fs.renameSync(tempPath, optimizedPath);
      console.log(`Optimized: ${newFileName} -> ${newBaseName}.webp`);
    } else {
      console.log(`Already optimized: ${newFileName}`);
    }

    // Update products.json
    const oldImagePath = `/images/${file}`;
    const newImagePath = `/images/${newBaseName}.webp`;

    products = products.map(product => {
      if (product.image === oldImagePath) {
        return { ...product, image: newImagePath };
      }
      return product;
    });
  }

  // Write updated products.json
  fs.writeFileSync(productsFile, JSON.stringify(products, null, 2));
  console.log('Updated products.json');
}

processImages().catch(console.error);