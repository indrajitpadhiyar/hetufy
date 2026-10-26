const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// CRC32 table for PNG chunk checksums
const crcTable = [];
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
  }
  crcTable[n] = c;
}

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

function createChunk(type, data) {
  const typeBuf = Buffer.from(type, 'ascii');
  const len = data.length;
  const lenBuf = Buffer.alloc(4);
  lenBuf.writeUInt32BE(len, 0);

  const crcData = Buffer.concat([typeBuf, data]);
  const crcVal = crc32(crcData);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crcVal, 0);

  return Buffer.concat([lenBuf, typeBuf, data, crcBuf]);
}

function createPNG(size) {
  // Generate a sleek Spotify / Hetufy desktop app icon
  // Dark squircle background with Spotify emerald gradient disc and sound arcs
  const rawScanlines = Buffer.alloc(size * (size * 4 + 1));
  const center = size / 2;
  const radius = size * 0.44;
  const innerRadius = size * 0.38;

  for (let y = 0; y < size; y++) {
    const rowOffset = y * (size * 4 + 1);
    rawScanlines[rowOffset] = 0; // Filter: None

    for (let x = 0; x < size; x++) {
      const pixelOffset = rowOffset + 1 + x * 4;
      const dx = x - center;
      const dy = y - center;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Squircle corner calculation for modern Windows app look
      const cornerRadius = size * 0.22;
      const clampedX = Math.max(Math.abs(dx) - (center - cornerRadius), 0);
      const clampedY = Math.max(Math.abs(dy) - (center - cornerRadius), 0);
      const cornerDist = Math.sqrt(clampedX * clampedX + clampedY * clampedY);

      if (cornerDist > cornerRadius) {
        // Outside squircle: transparent
        rawScanlines[pixelOffset] = 0;
        rawScanlines[pixelOffset + 1] = 0;
        rawScanlines[pixelOffset + 2] = 0;
        rawScanlines[pixelOffset + 3] = 0;
        continue;
      }

      // Inside squircle base: Deep sleek Spotify black-obsidian (#121212)
      let r = 18;
      let g = 18;
      let b = 18;
      let a = 255;

      // Inside circular music disc
      if (dist < innerRadius) {
        // Vibrant Spotify Green & Cyan Gradient (#1ed760 to #06b6d4)
        const t = (x + y) / (size * 2);
        r = Math.round(30 * (1 - t) + 6 * t);
        g = Math.round(215 * (1 - t) + 182 * t);
        b = Math.round(96 * (1 - t) + 212 * t);

        // Spotify sound wave arcs
        // Arc 1 (top):
        const arc1CenterY = center + size * 0.08;
        const dArc1 = Math.sqrt(dx * dx + (y - arc1CenterY) * (y - arc1CenterY));
        const arc1Dist = Math.abs(dArc1 - size * 0.26);
        if (arc1Dist < size * 0.038 && Math.abs(dx) < size * 0.22 && y < arc1CenterY) {
          r = 255; g = 255; b = 255;
        }

        // Arc 2 (middle):
        const arc2CenterY = center + size * 0.12;
        const dArc2 = Math.sqrt(dx * dx + (y - arc2CenterY) * (y - arc2CenterY));
        const arc2Dist = Math.abs(dArc2 - size * 0.19);
        if (arc2Dist < size * 0.034 && Math.abs(dx) < size * 0.18 && y < arc2CenterY) {
          r = 255; g = 255; b = 255;
        }

        // Arc 3 (bottom):
        const arc3CenterY = center + size * 0.16;
        const dArc3 = Math.sqrt(dx * dx + (y - arc3CenterY) * (y - arc3CenterY));
        const arc3Dist = Math.abs(dArc3 - size * 0.12);
        if (arc3Dist < size * 0.03 && Math.abs(dx) < size * 0.14 && y < arc3CenterY) {
          r = 255; g = 255; b = 255;
        }
      }

      // Smooth anti-aliasing near boundary
      if (cornerDist > cornerRadius - 1.5) {
        const edgeAlpha = Math.max(0, Math.min(1, (cornerRadius - cornerDist) / 1.5));
        a = Math.round(a * edgeAlpha);
      }

      rawScanlines[pixelOffset] = r;
      rawScanlines[pixelOffset + 1] = g;
      rawScanlines[pixelOffset + 2] = b;
      rawScanlines[pixelOffset + 3] = a;
    }
  }

  // PNG Header
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(size, 0);
  ihdrData.writeUInt32BE(size, 4);
  ihdrData[8] = 8; // Bit depth: 8
  ihdrData[9] = 6; // Color type: RGBA
  ihdrData[10] = 0; // Compression
  ihdrData[11] = 0; // Filter
  ihdrData[12] = 0; // Interlace
  const ihdrChunk = createChunk('IHDR', ihdrData);

  // IDAT (Deflated)
  const compressedData = zlib.deflateSync(rawScanlines, { level: 9 });
  const idatChunk = createChunk('IDAT', compressedData);

  // IEND
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function createICO(pngBuffers) {
  // ICONDIR header: 6 bytes
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // Reserved
  header.writeUInt16LE(1, 2); // Type 1 = ICO
  header.writeUInt16LE(pngBuffers.length, 4); // Number of images

  const entries = [];
  let currentOffset = 6 + pngBuffers.length * 16;

  for (const item of pngBuffers) {
    const entry = Buffer.alloc(16);
    entry.writeUInt8(item.size >= 256 ? 0 : item.size, 0); // Width (0 means 256)
    entry.writeUInt8(item.size >= 256 ? 0 : item.size, 1); // Height
    entry.writeUInt8(0, 2); // Colors
    entry.writeUInt8(0, 3); // Reserved
    entry.writeUInt16LE(1, 4); // Color planes
    entry.writeUInt16LE(32, 6); // Bits per pixel
    entry.writeUInt32LE(item.buffer.length, 8); // Size of image data
    entry.writeUInt32LE(currentOffset, 12); // Offset of image data
    entries.push(entry);
    currentOffset += item.buffer.length;
  }

  const allBuffers = [header, ...entries, ...pngBuffers.map(p => p.buffer)];
  return Buffer.concat(allBuffers);
}

// Generate icons
const outDir = path.join(__dirname, '../electron/resources');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

console.log('Generating 512x512 and 256x256 app icons...');
const png512 = createPNG(512);
const png256 = createPNG(256);
const png128 = createPNG(128);
const png64 = createPNG(64);
const png48 = createPNG(48);
const png32 = createPNG(32);
const png16 = createPNG(16);

fs.writeFileSync(path.join(outDir, 'icon.png'), png512);
console.log('Created icon.png (512x512)');

const icoBuffer = createICO([
  { size: 256, buffer: png256 },
  { size: 128, buffer: png128 },
  { size: 64, buffer: png64 },
  { size: 48, buffer: png48 },
  { size: 32, buffer: png32 },
  { size: 16, buffer: png16 }
]);

fs.writeFileSync(path.join(outDir, 'icon.ico'), icoBuffer);
console.log('Created icon.ico with multi-resolution embeds');
