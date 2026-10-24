import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = path.dirname(fileURLToPath(import.meta.url));
const output = path.join(root, 'release');
await fs.mkdir(output, { recursive: true });
const read = file => fs.readFile(path.join(root, 'dist', file), 'utf8');
const [html, css, audio, brief, presets, library, app, icon] = await Promise.all(['index.html','style.css','audio.js','brief.js','presets.js','library.js','app.js','icon.svg'].map(read));
const moduleWrap = (source, names) => `const {${names.join(',')}} = (() => {\n${source.replace(/^export /gm, '')}\nreturn {${names.join(',')}};\n})();`;
const code = [
  moduleWrap(audio, ['compose','createPlayer','renderWav','createMidi']),
  moduleWrap(brief, ['createBrief','formatBrief']),
  moduleWrap(presets, ['GENRE_PRESETS','LAYER_HINTS','applyPresetToSettings','detailForGenre','presetById']),
  moduleWrap(library, ['migrateStorage','sortSketches','filterSketches','reorderIds','uniqueAppend','removeId','stepQueue','shuffleIds','nextRepeatMode','cleanName','normalizePlaylists']),
  app.replace(/^import .*;\n/gm, ''),
].join('\n');
const csp = `<meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; img-src data: blob:; media-src blob: data:; connect-src 'none'; font-src 'none'; object-src 'none'; base-uri 'none'; form-action 'none'">`;
const standalone = html
  .replace('<meta charset="utf-8">', `<meta charset="utf-8">${csp}`)
  .replace('<link rel="icon" href="icon.svg" type="image/svg+xml">', `<link rel="icon" href="data:image/svg+xml,${encodeURIComponent(icon)}" type="image/svg+xml">`)
  .replace('<link rel="stylesheet" href="style.css">', `<style>${css.replace(/^@import[^\r\n]*[\r\n]*/, '')}</style>`)
  .replace('<script type="module" src="app.js"></script>', `<script>\n(()=>{\n${code.replace(/<\/script/gi,'<\\/script')}\n})();\n</script>`);
await fs.writeFile(path.join(output, 'SONORI.html'), standalone);
console.log(`Built release/SONORI.html (${Buffer.byteLength(standalone).toLocaleString()} bytes). No server, install, or network required.`);
