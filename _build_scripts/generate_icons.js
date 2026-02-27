const { createCanvas, registerFont } = require('canvas');
const fs = require('fs');
const path = require('path');

// Register Hebrew font
registerFont('C:/Windows/Fonts/DavidLibre-Bold.ttf', { family: 'David Libre', weight: 'bold' });
registerFont('C:/Windows/Fonts/DavidLibre-Regular.ttf', { family: 'David Libre' });

function generateIcon(size, outputPath) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  // Background with rounded corners
  const r = size * 0.156;
  ctx.fillStyle = '#1e2233';
  ctx.beginPath();
  ctx.moveTo(r, 0);
  ctx.lineTo(size - r, 0);
  ctx.quadraticCurveTo(size, 0, size, r);
  ctx.lineTo(size, size - r);
  ctx.quadraticCurveTo(size, size, size - r, size);
  ctx.lineTo(r, size);
  ctx.quadraticCurveTo(0, size, 0, size - r);
  ctx.lineTo(0, r);
  ctx.quadraticCurveTo(0, 0, r, 0);
  ctx.closePath();
  ctx.fill();

  // Gold text
  ctx.fillStyle = '#d4af37';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // "ספר" (book) - top line
  ctx.font = `bold ${size * 0.28}px "David Libre"`;
  ctx.fillText('\u05E1\u05E4\u05E8', size / 2, size * 0.38);

  // "מורמון" (Mormon) - bottom line
  ctx.font = `bold ${size * 0.18}px "David Libre"`;
  ctx.fillText('\u05DE\u05D5\u05E8\u05DE\u05D5\u05DF', size / 2, size * 0.68);

  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(outputPath, buffer);
  console.log(`Generated ${outputPath} (${size}x${size})`);
}

const iconsDir = path.join(__dirname, '..', 'icons');
generateIcon(192, path.join(iconsDir, 'icon-192.png'));
generateIcon(512, path.join(iconsDir, 'icon-512.png'));
