import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';

const root = new URL('..', import.meta.url);
const read = async file => fs.readFile(new URL(file, root), 'utf8');
const site = file => read(`release/site/${file}`);
const [index, sw, manifestText, privacy, robots, sitemap, missing, security, readme, pkgText] = await Promise.all([
  site('index.html'), site('sw.js'), site('manifest.webmanifest'), site('privacy.html'),
  site('robots.txt'), site('sitemap.xml'), site('404.html'),
  read('SECURITY.md'), read('README.md'), read('package.json'),
]);
const pkg = JSON.parse(pkgText);
const manifest = JSON.parse(manifestText);
const standalone = await read('release/SONORI.html');

assert.equal(pkg.version, '1.3.0');
assert.match(index, /name="sonori-sw" content="on"/);
assert.match(index, /worker-src 'self'/);
assert.match(index, /manifest-src 'self'/);
assert.match(index, /connect-src 'self'/);
assert.match(index, /rel="manifest" href="manifest.webmanifest"/);
assert.match(index, /rel="apple-touch-icon" href="apple-touch-icon.png"/);
assert.match(index, /rel="canonical" href="https:\/\/chamomilegrey\.github\.io\/SONORI\/"/);
assert.match(index, /property="og:image"/);
assert.match(index, /name="twitter:card" content="summary_large_image"/);
assert.match(index, /모든 데이터는 이 브라우저 안에만 있습니다/);
assert.match(index, /All data stays in this browser/);
assert.match(privacy, /분석 도구, 쿠키, 네트워크 호출은 없습니다/);
assert.match(privacy, /no analytics, cookies, or network calls/);
assert.match(sw, /sonori-v1\.3\.0/);
assert.match(sw, /skipWaiting/);
assert.equal(manifest.display, 'standalone');
assert.equal(manifest.theme_color, '#f4f3ee');
assert.ok(manifest.icons.some(icon => icon.sizes === '180x180'));
assert.ok(manifest.icons.some(icon => icon.purpose === 'maskable'));
assert.match(robots, /Sitemap: https:\/\/chamomilegrey\.github\.io\/SONORI\/sitemap\.xml/);
assert.match(sitemap, /https:\/\/chamomilegrey\.github\.io\/SONORI\/</);
assert.match(sitemap, /privacy\.html/);
assert.match(missing, /페이지를 찾을 수 없어요/);
assert.match(security, /chamomilegrey\.official@gmail\.com/);
assert.match(readme, /chamomilegrey\.official@gmail\.com/);
assert.match(standalone, /connect-src 'none'/);
assert.doesNotMatch(standalone, /<meta\b[^>]*name="sonori-sw"/);
assert.ok(Buffer.byteLength(standalone) < 500_000, `standalone is ${Buffer.byteLength(standalone)} bytes`);

function pngSize(buffer) {
  assert.equal(buffer.toString('ascii', 1, 4), 'PNG');
  return [buffer.readUInt32BE(16), buffer.readUInt32BE(20)];
}
const og = await fs.readFile(new URL('release/site/og.png', root));
const apple = await fs.readFile(new URL('release/site/apple-touch-icon.png', root));
assert.deepEqual(pngSize(og), [1200, 630]);
assert.deepEqual(pngSize(apple), [180, 180]);

const appSurface = [index, standalone, readme, security, await read('dist/app.js'), await read('dist/index.html')].join('\n');
assert.doesNotMatch(appSurface, /ko-fi\.com|knighft/i);
assert.match(index, /mailto:chamomilegrey\.official@gmail\.com/);
console.log(`launch-check: pages shell, privacy, icons, and ${Buffer.byteLength(standalone).toLocaleString()} byte standalone passed`);
