import assert from 'node:assert/strict';
import { compose, foldLoop, mixCrossfade, planLongform, renderLongformWav, variationSeed, wavHeaderBytes } from '../dist/audio.js';

assert.equal(variationSeed(9, 0), 9);
assert.equal(variationSeed(9, 1), variationSeed(9, 1));
assert.notEqual(variationSeed(9, 1), variationSeed(9, 2));

const settings = { genre: 'lofi', mood: 'warm', key: 'C', bpm: 96, bars: 8, seed: 11, ambience: { rain: 20, vinyl: 0, wind: 30 } };
const probe = compose(settings);
for (const minutes of [30, 60]) {
  const plan = planLongform({ duration: probe.duration, totalSeconds: minutes * 60, fadeSeconds: 2.4, seed: probe.seed, sampleRate: 44100 });
  assert.equal(plan.coveredFrames, plan.totalFrames, minutes);
  assert.equal(plan.sections[0].seed, probe.seed);
  assert.ok(plan.sections.length > 8, `${minutes} min sections ${plan.sections.length}`);
  assert.equal(plan.sections.at(-1).overlapFrames, 0);
  assert.ok(plan.sections[0].overlapFrames > 0);
  assert.ok(plan.sections.every(section => section.frames > section.overlapFrames));
  let cursor = 0;
  plan.sections.forEach((section, index) => {
    assert.equal(section.startFrame, cursor);
    assert.equal(section.seed, variationSeed(probe.seed, index));
    cursor += section.frames - section.overlapFrames;
  });
  assert.equal(cursor, plan.totalFrames);
}

const varied = planLongform({ duration: probe.duration, totalSeconds: 90, fadeSeconds: 1, seed: probe.seed, sampleRate: 1000 });
const signatures = new Set(varied.sections.slice(0, 4).map(section => {
  const song = compose({ ...settings, seed: section.seed });
  assert.equal(song.bpm, probe.bpm);
  assert.equal(song.settings.key, probe.settings.key);
  return song.events.filter(event => event.instrument === 'melody').map(event => event.midi).join(',');
}));
assert.ok(signatures.size >= 2, 'Later sections must vary the motif instead of repeating one render.');

const rate = 1000;
const duration = 1;
const fade = 0.12;
const freq = 2.3;
const raw = new Float32Array(Math.ceil((duration + fade) * rate) + 8);
for (let index = 0; index < raw.length; index++) raw[index] = Math.sin(2 * Math.PI * freq * index / rate);
const looped = foldLoop([raw, raw.slice()], rate, duration, fade);
const frames = looped[0].length;
const naive = Math.abs(raw[0] - raw[frames - 1]);
const folded = Math.abs(looped[0][0] - looped[0][frames - 1]);
assert.equal(looped[0][0], raw[frames]);
assert.ok(folded < naive * 0.25, `folded ${folded} naive ${naive}`);
assert.equal(looped[0].length, Math.round(duration * rate));

const faded = mixCrossfade([Float32Array.from([1, 1, 1, 1])], [Float32Array.from([0, 0, 0, 0])], 4);
assert.equal(faded[0][0], 1);
assert.ok(Math.abs(faded[0][3]) < 1e-6);
assert.ok(faded[0][1] > faded[0][2]);

const sampleRate = 2000;
const totalSeconds = 40;
const plan = planLongform({ duration: probe.duration, totalSeconds, fadeSeconds: 0.5, seed: probe.seed, sampleRate });
const seen = [];
let renders = 0;
const blob = await renderLongformWav(settings, {
  totalSeconds,
  fadeSeconds: 0.5,
  sampleRate,
  probeSong: probe,
  onProgress(state) { seen.push(state.ratio); },
  async renderChannels(song, count) {
    renders += 1;
    assert.equal(song.ambienceSeed, probe.seed);
    const left = new Float32Array(count);
    const right = new Float32Array(count);
    const tone = (song.seed % 5) + 2;
    for (let index = 0; index < count; index++) {
      left[index] = Math.sin(index / (8 * tone)) * 1.4;
      right[index] = Math.cos(index / (9 * tone)) * 0.2;
    }
    return [left, right];
  },
});
assert.equal(renders, plan.sections.length);
assert.equal(seen.at(-1), 1);
assert.ok(seen[0] === 0);
const bytes = Buffer.from(await blob.arrayBuffer());
assert.equal(bytes.toString('ascii', 0, 4), 'RIFF');
assert.equal(bytes.toString('ascii', 8, 12), 'WAVE');
assert.equal(bytes.readUInt32LE(4), bytes.length - 8);
assert.equal(bytes.readUInt16LE(20), 1);
assert.equal(bytes.readUInt16LE(22), 2);
assert.equal(bytes.readUInt32LE(24), sampleRate);
assert.equal(bytes.readUInt16LE(34), 16);
assert.equal(bytes.readUInt32LE(40), plan.totalFrames * 4);
assert.equal(bytes.length, 44 + plan.totalFrames * 4);
let peak = 0;
for (let offset = 44; offset < bytes.length; offset += 2) peak = Math.max(peak, Math.abs(bytes.readInt16LE(offset)));
assert.ok(peak > 1000 && peak <= 32768);

const header = wavHeaderBytes(8, 44100, 2);
assert.equal(Buffer.from(header).readUInt32LE(40), 8);

let cancel = false;
await assert.rejects(() => renderLongformWav(settings, {
  totalSeconds: 80,
  fadeSeconds: 0.5,
  sampleRate,
  shouldCancel: () => cancel,
  async renderChannels(_song, count) {
    cancel = true;
    return [new Float32Array(count), new Float32Array(count)];
  },
}), error => error?.name === 'AbortError');

const app = await import('node:fs/promises').then(fs => fs.readFile(new URL('../dist/app.js', import.meta.url), 'utf8'));
assert.match(app, /renderLoopWav/);
assert.match(app, /renderLongformWav/);
assert.match(app, /minutes/);
assert.match(app, /취소/);
console.log(`export-check: ${plan.sections.length} chunked sections, seamless fold, cancel, and ${bytes.length} byte wav passed`);
