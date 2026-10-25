import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { compose, createAmbienceBuffers, normalizeAmbience, normalizeSettings } from '../dist/audio.js';
import { createBrief } from '../dist/brief.js';
import { SCENE_PRESETS, applyPresetToSettings, applySceneToSettings, presetById, sceneById } from '../dist/presets.js';

assert.deepEqual(normalizeAmbience(undefined), { rain: 0, vinyl: 0, wind: 0 });
assert.deepEqual(normalizeAmbience({ rain: 140, vinyl: -4, wind: '12.4' }), { rain: 100, vinyl: 0, wind: 12 });
assert.deepEqual(normalizeSettings({}).ambience, { rain: 0, vinyl: 0, wind: 0 });

const drySettings = { genre: 'lofi', mood: 'warm', key: 'C', bpm: 86, bars: 8, seed: 42 };
const dry = compose(drySettings);
const wet = compose({ ...drySettings, ambience: { rain: 80, vinyl: 35, wind: 20 } });
const quiet = compose({ ...drySettings, ambience: { rain: 0, vinyl: 0, wind: 0 } });
assert.deepEqual(dry.events, wet.events, 'Ambience levels must not change the pitched arrangement.');
assert.deepEqual(dry, quiet, 'A missing ambience block is the same sketch as all sliders at zero.');
assert.deepEqual(wet.settings.ambience, { rain: 80, vinyl: 35, wind: 20 });

const first = createAmbienceBuffers(16000, 2, 9);
const same = createAmbienceBuffers(16000, 2, 9);
const other = createAmbienceBuffers(16000, 2, 10);
assert.equal(first.rain[0].length, same.rain[0].length);
assert.equal(first.rain[0][400], same.rain[0][400]);
assert.equal(first.vinyl[1][800], same.vinyl[1][800]);
assert.equal(first.wind[0][200], same.wind[0][200]);
assert.notEqual(first.rain[0][400], other.rain[0][400]);
assert.notEqual(first.rain[0][500], first.rain[1][500]);
for (const name of ['rain', 'vinyl', 'wind']) {
  assert.ok(first[name][0].length > 1000, name);
  assert.ok([...first[name][0], ...first[name][1]].every(Number.isFinite), name);
  let peak = 0;
  for (const value of first[name][0]) peak = Math.max(peak, Math.abs(value));
  for (const value of first[name][1]) peak = Math.max(peak, Math.abs(value));
  assert.ok(peak <= 0.91, `${name} peak ${peak}`);
}

function zeroCrossings(data) {
  let count = 0;
  for (let index = 1; index < data.length; index++) if ((data[index] >= 0) !== (data[index - 1] >= 0)) count++;
  return count / data.length;
}
function crest(data) {
  let peak = 0;
  let sum = 0;
  for (const value of data) {
    peak = Math.max(peak, Math.abs(value));
    sum += value * value;
  }
  return peak / Math.sqrt(sum / data.length);
}
function highShare(data) {
  let low = 0;
  let lowEnergy = 0;
  let highEnergy = 0;
  for (const value of data) {
    low += (value - low) * 0.02;
    const high = value - low;
    lowEnergy += low * low;
    highEnergy += high * high;
  }
  return highEnergy / (lowEnergy + highEnergy);
}
assert.ok(zeroCrossings(first.rain[0]) > zeroCrossings(first.wind[0]) * 8, 'Rain stays brighter than the wind bed.');
assert.ok(highShare(first.rain[0]) > highShare(first.wind[0]), 'Rain keeps more high-frequency energy than wind.');
assert.ok(crest(first.vinyl[0]) > crest(first.wind[0]), 'Vinyl crackle is sparser than the wind bed.');
const windEnd = Math.abs(first.wind[0][0] - first.wind[0].at(-1));
assert.ok(windEnd < 0.08, `wind loop step ${windEnd}`);

assert.deepEqual(SCENE_PRESETS.map(scene => scene.id), ['dawn-study', 'rain-cafe', 'night-drive', 'focus', 'bedtime']);
const expectedGenre = { 'dawn-study': 'dawn', 'rain-cafe': 'lofi', 'night-drive': 'citypop', focus: 'ambient', bedtime: 'nitelofi' };
for (const scene of SCENE_PRESETS) {
  assert.equal(sceneById(scene.id)?.label, scene.label);
  assert.equal(presetById(scene.preset)?.genre, expectedGenre[scene.id]);
  assert.ok(scene.ambience.rain + scene.ambience.vinyl + scene.ambience.wind > 0, scene.id);
  for (const value of Object.values(scene.ambience)) assert.ok(value >= 0 && value <= 100);
  const next = applySceneToSettings({ title: '유지', topic: '이야기', notes: '메모', bars: 16, seed: 4, ambience: { rain: 1, vinyl: 1, wind: 1 } }, scene.id);
  assert.equal(next.title, '유지');
  assert.equal(next.topic, '이야기');
  assert.equal(next.notes, '메모');
  assert.equal(next.genre, expectedGenre[scene.id]);
  assert.deepEqual(next.ambience, scene.ambience);
  assert.equal(next.instruments.hum, presetById(scene.preset).hum === true);
}
assert.equal(applySceneToSettings({ title: '그대로' }, 'missing').title, '그대로');
const kept = applyPresetToSettings({ title: '창가', ambience: { rain: 10, vinyl: 0, wind: 3 } }, 'pop');
assert.equal(kept.ambience.rain, 10, 'A genre pick keeps the current ambience mix.');
assert.equal(kept.genre, 'pop');

const rainy = createBrief({ ...drySettings, title: '비', ambience: { rain: 40, vinyl: 0, wind: 0 } });
assert.match(rainy.summary, /합성 비/);
assert.match(rainy.prompt, /synthesized rather than sampled: soft rain/);
assert.equal(createBrief(drySettings).prompt, createBrief({ ...drySettings, ambience: { rain: 0, vinyl: 0, wind: 0 } }).prompt);

const studio = await readFile(new URL('../dist/index.html', import.meta.url), 'utf8');
const app = await readFile(new URL('../dist/app.js', import.meta.url), 'utf8');
assert.deepEqual([...studio.matchAll(/data-scene="([^"]+)"/g)].map(match => match[1]), SCENE_PRESETS.map(scene => scene.id));
assert.match(studio, /id="ambienceRain"/);
assert.match(studio, /id="ambienceVinyl"/);
assert.match(studio, /id="ambienceWind"/);
assert.match(studio, /id="creatorGuide"/);
assert.match(studio, /Music: SONORI by ChamomileGrey/);
assert.match(studio, /법률 자문은 아니에요/);
assert.match(studio, /음원 라이브러리/);
assert.match(app, /sonori\.studio\.v1/);
assert.match(app, /version:1/);
assert.match(app, /normalizeAmbience/);
assert.doesNotMatch(app, /sonori\.studio\.v2/);
console.log('ambience-check: synthesized beds, unchanged sketches, five scenes, and creator copy passed');
