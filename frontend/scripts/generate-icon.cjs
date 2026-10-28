const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('Regenerating IDRMusic application icons...');

const pyScript = `
from PIL import Image
import os

src_path = r'${path.join(__dirname, '../public/idrmusic.png').replace(/\\/g, '/')}'
res_dir = r'${path.join(__dirname, '../electron/resources').replace(/\\/g, '/')}'

img = Image.open(src_path).convert('RGBA')

# 512x512 PNG
png_512 = img.resize((512, 512), Image.Resampling.LANCZOS)
png_512.save(os.path.join(res_dir, 'icon.png'), format='PNG')

# Multi-resolution Windows ICO
ico_sizes = [(256, 256), (128, 128), (64, 64), (48, 48), (32, 32), (16, 16)]
img.save(os.path.join(res_dir, 'icon.ico'), format='ICO', sizes=ico_sizes)

print('IDRMusic icon.png and icon.ico generated successfully.')
`;

try {
  execSync(`python -c "${pyScript.replace(/\n/g, ' ')}"`, { stdio: 'inherit' });
} catch (e) {
  console.warn('Python icon generation notice:', e.message);
}
