import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';

const root = path.dirname(fileURLToPath(import.meta.url));
const output = path.join(root, 'release');
const site = path.join(output, 'site');
await fs.mkdir(output, { recursive: true });
await new Promise((resolve, reject) => {
  const child = spawn(process.execPath, [path.join(root, 'scripts', 'render-brand-png.mjs')], { stdio: 'inherit' });
  child.on('exit', code => code === 0 ? resolve() : reject(new Error(`brand images exited ${code}`)));
});

const read = file => fs.readFile(path.join(root, 'dist', file), 'utf8');
const [html, css, audio, brief, presets, library, app, icon] = await Promise.all(['index.html', 'style.css', 'audio.js', 'brief.js', 'presets.js', 'library.js', 'app.js', 'icon.svg'].map(read));
const moduleWrap = (source, names) => `const {${names.join(',')}} = (() => {\n${source.replace(/^export /gm, '')}\nreturn {${names.join(',')}};\n})();`;
const code = [
  moduleWrap(audio, ['compose', 'createPlayer', 'renderWav', 'createMidi']),
  moduleWrap(brief, ['createBrief', 'formatBrief']),
  moduleWrap(presets, ['GENRE_PRESETS', 'LAYER_HINTS', 'applyPresetToSettings', 'detailForGenre', 'presetById']),
  moduleWrap(library, ['migrateStorage', 'sortSketches', 'filterSketches', 'reorderIds', 'uniqueAppend', 'removeId', 'stepQueue', 'shuffleIds', 'nextRepeatMode', 'cleanName', 'normalizePlaylists']),
  app.replace(/^import .*;\n/gm, ''),
].join('\n');
const strictCsp = `<meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; img-src data: blob:; media-src blob: data:; connect-src 'none'; font-src 'none'; object-src 'none'; base-uri 'none'; form-action 'none'">`;
const pagesCsp = `<meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; img-src 'self' data: blob:; media-src blob: data:; connect-src 'self'; font-src 'none'; object-src 'none'; base-uri 'none'; form-action 'none'; manifest-src 'self'; worker-src 'self'">`;
const style = css.replace(/^@import[^\r\n]*[\r\n]*/, '');
const script = `<script>\n(()=>{\n${code.replace(/<\/script/gi, '<\\/script')}\n})();\n</script>`;

function assemble(csp, { pages }) {
  let doc = html
    .replace('<meta charset="utf-8">', `<meta charset="utf-8">${csp}${pages ? '<meta name="sonori-sw" content="on">' : ''}`)
    .replace('<link rel="stylesheet" href="style.css">', `<style>${style}</style>`)
    .replace('<script type="module" src="app.js"></script>', script);
  if (!pages) {
    doc = doc.replace(/<link\b[^>]*data-pages="1"[^>]*>\n?/g, '');
    doc = doc.replace('<link rel="icon" href="icon.svg" type="image/svg+xml">', `<link rel="icon" href="data:image/svg+xml,${encodeURIComponent(icon)}" type="image/svg+xml">`);
  }
  return doc;
}

const standalone = assemble(strictCsp, { pages: false });
const pagesHtml = assemble(pagesCsp, { pages: true });
await fs.writeFile(path.join(output, 'SONORI.html'), standalone);
await fs.rm(site, { recursive: true, force: true });
await fs.mkdir(site, { recursive: true });
await fs.writeFile(path.join(site, 'index.html'), pagesHtml);
const distFiles = ['manifest.webmanifest', 'sw.js', 'icon.svg', 'favicon-32.png', 'apple-touch-icon.png', 'icon-192.png', 'icon-512.png', 'og.png'];
const siteFiles = ['404.html', 'privacy.html', 'robots.txt', 'sitemap.xml'];
await Promise.all([
  ...distFiles.map(file => fs.copyFile(path.join(root, 'dist', file), path.join(site, file))),
  ...siteFiles.map(file => fs.copyFile(path.join(root, 'site', file), path.join(site, file))),
]);
console.log(`Built release/SONORI.html (${Buffer.byteLength(standalone).toLocaleString()} bytes) and release/site (${Buffer.byteLength(pagesHtml).toLocaleString()} byte index).`);
