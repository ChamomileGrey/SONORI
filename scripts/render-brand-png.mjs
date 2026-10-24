/** Original SONORI marks. Pixel type and flat color only — no third-party artwork. */
import fs from 'node:fs/promises';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outDir = path.join(root, 'dist');

const PAPER = [0xf4, 0xf3, 0xee];
const INK = [0x25, 0x23, 0x38];
const LIME = [0xd5, 0xed, 0x88];

const FONT = {
  A: ['01110', '10001', '10001', '11111', '10001', '10001', '10001'],
  C: ['01111', '10000', '10000', '10000', '10000', '10000', '01111'],
  E: ['11111', '10000', '10000', '11110', '10000', '10000', '11111'],
  G: ['01110', '10001', '10000', '10111', '10001', '10001', '01110'],
  H: ['10001', '10001', '10001', '11111', '10001', '10001', '10001'],
  I: ['11111', '00100', '00100', '00100', '00100', '00100', '11111'],
  K: ['10001', '10010', '10100', '11000', '10100', '10010', '10001'],
  N: ['10001', '11001', '10101', '10011', '10001', '10001', '10001'],
  O: ['01110', '10001', '10001', '10001', '10001', '10001', '01110'],
  R: ['11110', '10001', '10001', '11110', '10100', '10010', '10001'],
  S: ['01111', '10000', '10000', '01110', '00001', '00001', '11110'],
  T: ['11111', '00100', '00100', '00100', '00100', '00100', '00100'],
  ' ': ['00000', '00000', '00000', '00000', '00000', '00000', '00000'],
};

function crc32(buffer) {
  let crc = ~0;
  for (const byte of buffer) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit++) crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
  }
  return ~crc >>> 0;
}

function chunk(type, data) {
  const body = Buffer.concat([Buffer.from(type), data]);
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([length, body, crc]);
}

function createCanvas(width, height, color) {
  const pixels = new Uint8Array(width * height * 3);
  for (let index = 0; index < width * height; index++) pixels.set(color, index * 3);
  return { width, height, pixels, set(x, y, color) {
    if (x < 0 || y < 0 || x >= width || y >= height) return;
    this.pixels.set(color, (y * width + x) * 3);
  } };
}

function fillRect(canvas, x, y, width, height, color) {
  for (let row = 0; row < height; row++) {
    for (let column = 0; column < width; column++) canvas.set(x + column, y + row, color);
  }
}

function fillRound(canvas, x, y, width, height, radius, color) {
  for (let row = 0; row < height; row++) {
    for (let column = 0; column < width; column++) {
      const dx = column < radius ? radius - column : column >= width - radius ? column - (width - radius - 1) : 0;
      const dy = row < radius ? radius - row : row >= height - radius ? row - (height - radius - 1) : 0;
      if (dx * dx + dy * dy <= radius * radius) canvas.set(x + column, y + row, color);
    }
  }
}

function textWidth(text, scale) {
  return text.length * 6 * scale - scale;
}

function drawText(canvas, text, x, y, scale, color) {
  let cursor = x;
  for (const character of text) {
    const rows = FONT[character] || FONT[' '];
    rows.forEach((row, rowIndex) => {
      [...row].forEach((cell, column) => {
        if (cell === '1') fillRect(canvas, cursor + column * scale, y + rowIndex * scale, scale, scale, color);
      });
    });
    cursor += 6 * scale;
  }
}

function drawBars(canvas, x, y, unit, color) {
  const heights = [10, 22, 16, 8];
  heights.forEach((height, index) => {
    const barHeight = height * unit;
    fillRound(canvas, x + index * 7 * unit, y + (22 * unit - barHeight), 4 * unit, barHeight, unit, color);
  });
}

function png(canvas) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(canvas.width, 0);
  ihdr.writeUInt32BE(canvas.height, 4);
  ihdr[8] = 8;
  ihdr[9] = 2;
  const raw = Buffer.alloc((canvas.width * 3 + 1) * canvas.height);
  for (let y = 0; y < canvas.height; y++) {
    const start = y * (canvas.width * 3 + 1);
    raw[start] = 0;
    canvas.pixels.subarray(y * canvas.width * 3, (y + 1) * canvas.width * 3).forEach((value, index) => { raw[start + 1 + index] = value; });
  }
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk('IHDR', ihdr),
    chunk('IDAT', zlib.deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

function icon(size, { padding = 0.18, ground = INK, mark = LIME } = {}) {
  const canvas = createCanvas(size, size, ground);
  const unit = Math.max(1, Math.round(size * (1 - padding * 2) / 34));
  const width = 4 * unit + 3 * 7 * unit;
  const height = 22 * unit;
  drawBars(canvas, Math.round((size - width) / 2), Math.round((size - height) / 2), unit, mark);
  return canvas;
}

function openGraph() {
  const canvas = createCanvas(1200, 630, PAPER);
  fillRound(canvas, 72, 96, 420, 438, 48, INK);
  drawBars(canvas, 168, 250, 14, LIME);
  const title = 'SONORI';
  const titleScale = 14;
  drawText(canvas, title, 560, 210, titleScale, INK);
  drawText(canvas, 'A SONG SKETCH', 560, 360, 6, INK);
  fillRect(canvas, 560, 450, textWidth('A SONG SKETCH', 6), 8, LIME);
  return canvas;
}

const files = {
  'og.png': openGraph(),
  'apple-touch-icon.png': icon(180, { padding: 0.22 }),
  'icon-192.png': icon(192, { padding: 0.24 }),
  'icon-512.png': icon(512, { padding: 0.26 }),
  'favicon-32.png': icon(32, { padding: 0.16 }),
};

await fs.mkdir(outDir, { recursive: true });
for (const [name, canvas] of Object.entries(files)) {
  const file = path.join(outDir, name);
  await fs.writeFile(file, png(canvas));
  console.log(`${name} ${canvas.width}x${canvas.height}`);
}
