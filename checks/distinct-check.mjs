import assert from 'node:assert/strict';
import { compose, genreProfile } from '../dist/audio.js';
import { GENRE_PRESETS, applyPresetToSettings } from '../dist/presets.js';

const seeds = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
const MIN_DISTANCE = 3.15;

function mode(values) {
  const counts = new Map();
  for (const value of values) {
    if (value == null || value === '') continue;
    counts.set(value, (counts.get(value) || 0) + 1);
  }
  let best = '';
  let bestCount = 0;
  for (const [value, count] of counts) {
    if (count > bestCount) { best = value; bestCount = count; }
  }
  return best;
}

function mean(values) {
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function std(values) {
  const avg = mean(values);
  return Math.sqrt(mean(values.map(value => (value - avg) ** 2)));
}

function extended(name) {
  return /[0-9]|sus|add|dim|aug/.test(name);
}

function fingerprint(song) {
  const beat = song.beatSeconds;
  const bars = song.bars;
  const hats = song.events.filter(event => event.instrument === 'hat');
  const kicks = song.events.filter(event => event.instrument === 'kick');
  const snares = song.events.filter(event => event.instrument === 'snare');
  const melody = song.events.filter(event => event.instrument === 'melody');
  const bass = song.events.filter(event => event.instrument === 'bass');
  const chords = song.events.filter(event => event.instrument === 'chords');
  const open = hats.filter(event => event.midi === 46).length;
  const hatBins = new Map();
  for (const event of hats) {
    const position = ((event.time / beat) % 4 + 4) % 4;
    const bin = Math.round(position * 4) / 4;
    const key = (Math.round(bin * 100) / 100).toFixed(2);
    hatBins.set(key, (hatBins.get(key) || 0) + 1);
  }
  let hatKey = '';
  let hatBest = 0;
  for (const [key, count] of hatBins) {
    if (count > hatBest) { hatKey = key; hatBest = count; }
  }
  const barEnergy = [];
  for (let bar = 0; bar < bars; bar++) {
    const start = bar * 4 * beat;
    const end = start + 4 * beat;
    const notes = song.events.filter(event => event.time >= start - 1e-6 && event.time < end - 1e-6 && !['kick', 'snare', 'hat'].includes(event.instrument));
    if (notes.length) barEnergy.push(mean(notes.map(event => event.velocity)));
  }
  const snareOff = snares.length
    ? snares.filter(event => {
      const position = ((event.time / beat) % 1 + 1) % 1;
      return position > 0.12 && position < 0.88;
    }).length / snares.length
    : 0;
  const names = song.chords.map(chord => chord.name);
  return {
    bpm: song.settings.bpm,
    swing: song.swing,
    openRate: hats.length ? open / hats.length : 0,
    hatPer: hats.length / bars,
    kickPer: kicks.length / bars,
    snareOff,
    ext: names.length ? names.filter(extended).length / names.length : 0,
    energy: barEnergy.length > 1 ? std(barEnergy) : 0,
    melPer: melody.length / bars,
    bassPer: bass.length / bars,
    chordPer: chords.length / bars,
    hum: song.events.some(event => event.instrument === 'hum') ? 1 : 0,
    family: song.concept?.family || '',
    texture: song.concept?.texture || '',
    arc: song.concept?.arc || '',
    hatKey,
    voice: genreProfile(song.settings.genre)?.voice || 'default',
  };
}

const rows = {};
for (const preset of GENRE_PRESETS) {
  rows[preset.id] = seeds.map(seed => fingerprint(compose({ ...applyPresetToSettings({ planner: 'concept' }, preset.id), bars: 16, seed })));
}

const numeric = [
  ['bpm', 40], ['swing', 0.1], ['openRate', 1 / 1.4], ['hatPer', 6], ['kickPer', 3], ['snareOff', 1],
  ['ext', 1 / 1.6], ['energy', 0.08], ['melPer', 4], ['bassPer', 3], ['chordPer', 6], ['hum', 1 / 1.2],
];
const categorical = [['family', 0.7], ['texture', 0.45], ['voice', 0.55], ['arc', 0.35], ['hatKey', 0.4]];

function distance(a, b) {
  let total = 0;
  for (const [key, scale] of numeric) total += Math.abs(mean(a.map(row => row[key])) - mean(b.map(row => row[key]))) / scale;
  for (const [key, bonus] of categorical) {
    const left = mode(a.map(row => row[key]));
    const right = mode(b.map(row => row[key]));
    if (left && right && left !== right) total += bonus;
  }
  return total;
}

const ids = GENRE_PRESETS.map(preset => preset.id);
const pairs = [];
for (let i = 0; i < ids.length; i++) {
  for (let j = i + 1; j < ids.length; j++) {
    pairs.push({ pair: `${ids[i]}–${ids[j]}`, total: distance(rows[ids[i]], rows[ids[j]]) });
  }
}
pairs.sort((left, right) => left.total - right.total);
const minimum = pairs[0].total;
assert.ok(minimum >= MIN_DISTANCE, `closest presets ${pairs[0].pair} ${minimum.toFixed(3)} under ${MIN_DISTANCE}`);
assert.equal(pairs.length, (ids.length * (ids.length - 1)) / 2);

function pairOf(a, b) {
  return pairs.find(pair => pair.pair === `${a}–${b}` || pair.pair === `${b}–${a}`);
}
for (const [left, right] of [['edm', 'house'], ['lofi', 'nitelofi'], ['ambient', 'dawn'], ['ambient', 'cinematic'], ['ballad', 'modernrock'], ['pop', 'rnb']]) {
  const found = pairOf(left, right);
  assert.ok(found.total >= 4, `${found.pair} ${found.total.toFixed(3)} is still too close`);
}

const avg = (id, key) => mean(rows[id].map(row => row[key]));
const house = rows.house;
const edm = rows.edm;
assert.ok(house.every(row => row.bpm >= 120 && row.bpm <= 124));
assert.ok(edm.every(row => row.bpm >= 126 && row.bpm <= 128));
assert.ok(house.every(row => row.swing > 0 && row.swing <= 0.06), 'house shuffles 16ths');
assert.ok(edm.every(row => row.swing === 0), 'edm stays straight');
assert.ok(avg('house', 'openRate') > 0.25 && avg('edm', 'openRate') < 0.05);
assert.ok(avg('house', 'ext') > 0.7 && avg('edm', 'ext') < 0.15);
assert.ok(avg('edm', 'energy') > avg('house', 'energy') + 0.05);
assert.equal(mode(house.map(row => row.family)), 'verseChorus');
assert.equal(mode(edm.map(row => row.family)), 'build');
assert.notEqual(mode(house.map(row => row.voice)), mode(edm.map(row => row.voice)));
assert.equal(mode(rows.lofi.map(row => row.texture)), 'stab');
assert.equal(mode(rows.nitelofi.map(row => row.texture)), 'pad');
assert.equal(mode(rows.lofi.map(row => row.family)), 'verseChorus');
assert.equal(mode(rows.nitelofi.map(row => row.family)), 'through');
assert.ok(avg('nitelofi', 'hum') === 1 && avg('lofi', 'hum') === 0);
assert.equal(mode(rows.ambient.map(row => row.family)), 'through');
assert.equal(mode(rows.dawn.map(row => row.family)), 'aaba');
assert.equal(mode(rows.dawn.map(row => row.texture)), 'arp');
assert.ok(avg('dawn', 'hum') === 1 && avg('ambient', 'hum') === 0);
assert.equal(mode(rows.ballad.map(row => row.family)), 'aaba');
assert.equal(mode(rows.modernrock.map(row => row.family)), 'verseChorus');
assert.equal(mode(rows.modernrock.map(row => row.texture)), 'arp');
assert.ok(avg('modernrock', 'hum') === 1 && avg('ballad', 'hum') === 0);
assert.equal(mode(rows.rnb.map(row => row.family)), 'aaba');
assert.equal(mode(rows.pop.map(row => row.family)), 'verseChorus');
assert.ok(avg('pop', 'ext') < 0.25 && avg('rnb', 'ext') > 0.8);
assert.equal(mode(rows.cinematic.map(row => row.family)), 'build');
assert.ok(avg('cinematic', 'energy') > avg('ambient', 'energy') + 0.04);
assert.equal(mode(rows.acoustic.map(row => row.texture)), 'strum');
assert.equal(mode(rows.citypop.map(row => row.voice)), 'keys');
assert.ok(avg('citypop', 'swing') >= 0.04);
assert.equal(mode(rows.trap.map(row => row.voice)), '808');
assert.ok(rows.trap.every(row => row.bpm === 140) && avg('trap', 'hatPer') > 6);
assert.equal(mode(rows.bossa.map(row => row.voice)), 'nylon');
assert.ok(avg('reggaeton', 'snareOff') > 0.8);

console.log('distinct-closest:');
for (const pair of pairs.slice(0, 8)) console.log(`  ${pair.total.toFixed(3)} ${pair.pair}`);
console.log(`distinct-min ${minimum.toFixed(3)} distinct-max ${pairs.at(-1).total.toFixed(3)}`);
for (const [left, right] of [['edm', 'house'], ['lofi', 'nitelofi'], ['ambient', 'dawn'], ['ambient', 'cinematic'], ['ballad', 'modernrock'], ['pop', 'rnb']]) {
  const found = pairOf(left, right);
  console.log(`  ${found.total.toFixed(3)} ${found.pair}`);
}
console.log('distinct-check: pairwise preset distance passed');
