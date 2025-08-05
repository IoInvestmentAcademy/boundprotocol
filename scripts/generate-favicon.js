const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');

async function generateFavicons() {
  // Read the SVG file
  const svg = await fs.readFile(path.join(__dirname, '../src/components/icons/AppLogo.tsx'), 'utf8');
  
  // Extract the SVG content
  const svgContent = svg.match(/<svg[^>]*>([\s\S]*?)<\/svg>/)[0];
  
  // Define the sizes we need
  const sizes = {
    'favicon-16x16.png': 16,
    'favicon-32x32.png': 32,
    'apple-touch-icon.png': 180,
    'android-chrome-192x192.png': 192,
    'android-chrome-512x512.png': 512
  };

  // Generate each size
  for (const [filename, size] of Object.entries(sizes)) {
    await sharp(Buffer.from(svgContent))
      .resize(size, size)
      .png()
      .toFile(path.join(__dirname, '../public', filename));
  }

  // Generate favicon.ico (multi-size icon)
  await sharp(Buffer.from(svgContent))
    .resize(32, 32)
    .toFormat('ico')
    .toFile(path.join(__dirname, '../public/favicon.ico'));
}

generateFavicons().catch(console.error); 