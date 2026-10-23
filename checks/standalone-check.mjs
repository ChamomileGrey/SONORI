import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import vm from 'node:vm';

const html = await fs.readFile(new URL('../release/SONORI.html', import.meta.url), 'utf8');
const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)];
assert.equal(scripts.length, 1, 'one self-contained script');
new vm.Script(scripts[0][1]);
const style = html.match(/<style>([\s\S]*?)<\/style>/)?.[1];
assert(style?.trim().startsWith(':root{'), 'font import removal must preserve the root CSS rule');
assert.match(style, /--ink:#282735/);
assert(!/@import/.test(style), 'standalone CSS must not load external fonts');
assert(!/<(?:script|link)[^>]+(?:src|href)="(?!data:)/.test(html), 'no external script or stylesheet');
assert(!/\bimport .* from /.test(scripts[0][1]), 'no file protocol module imports');
const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
const staticHtml = html.replace(/<script>[\s\S]*?<\/script>/g, '');
const staticIds = [...staticHtml.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
assert.equal(staticIds.length, new Set(staticIds).size, 'static IDs must be unique');
for (const [, ref] of staticHtml.matchAll(/\b(?:for|aria-controls|aria-labelledby)="([^"]+)"/g)) {
  for (const target of ref.split(' ')) assert(ids.includes(target), `reference ${target} exists`);
}
console.log('PASS: standalone bundle syntax, root styles, offline assets, static IDs, labels and ARIA references.');
