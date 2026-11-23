import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { compose, humanizeEvent } from '../dist/audio.js';
import {
  GENRE_PACKS,
  ensureSamples,
  instrumentsForSong,
  pickSampleNote,
  resolveSampleInstrument,
  setSampleBase,
} from '../dist/sampler.js';

const root = new URL('..', import.meta.url);
const sampleRoot = new URL('../dist/samples/', import.meta.url);

async function dirSize(dirPath) {
  let total = 0;
  for (const entry of await fs.readdir(dirPath, { withFileTypes: true })) {
    const full = path.join(dirPath, entry.name);
    if (entry.isDirectory()) total += await dirSize(full);
    else total += (await fs.stat(full)).size;
  }
  return total;
}

function isMp3(buffer) {
  if (buffer.length < 4) return false;
  if (buffer[0] === 0x49 && buffer[1] === 0x44 && buffer[2] === 0x33) return true; // ID3
  if (buffer[0] === 0xff && (buffer[1] & 0xe0) === 0xe0) return true; // MPEG frame sync
  return false;
}

const totalBytes = await dirSize(sampleRoot.pathname);
assert.ok(totalBytes > 0 && totalBytes <= 5 * 1024 * 1024, `sample pack size ${totalBytes} must be in (0, 5 MiB]`);

const manifest = JSON.parse(await fs.readFile(new URL('manifest.json', sampleRoot), 'utf8'));
for (const name of ['piano', 'guitar', 'strings', 'bass', 'drums']) {
  assert.ok(manifest.instruments?.[name], `manifest lists ${name}`);
}
assert.ok(manifest.ir?.file, 'manifest lists ir');

const listedFiles = [];
for (const name of ['piano', 'guitar', 'strings', 'bass']) {
  const notes = manifest.instruments[name].notes;
  assert.ok(Array.isArray(notes) && notes.length >= 4, `${name} has multisamples`);
  for (const entry of notes) listedFiles.push(entry.file);
}
const drumIds = manifest.instruments.drums.hits.map(hit => hit.id);
for (const id of ['kick', 'snare', 'hat', 'open', 'clap', 'shaker']) {
  assert.ok(drumIds.includes(id), `drum pack includes ${id}`);
}
for (const hit of manifest.instruments.drums.hits) listedFiles.push(hit.file);
listedFiles.push(manifest.ir.file);

for (const rel of listedFiles) {
  const buf = await fs.readFile(new URL(rel, sampleRoot));
  assert.ok(buf.length > 0, `${rel} is non-empty`);
  assert.ok(isMp3(buf), `${rel} is a valid MP3`);
}

// Verify release/site also received the sample pack when built.
const siteManifest = JSON.parse(await fs.readFile(new URL('release/site/samples/manifest.json', root), 'utf8'));
assert.ok((await fs.readFile(new URL('release/site/LICENSES.md', root), 'utf8')).includes('Alexander Holm'), 'Pages site ships LICENSES.md');

assert.equal(siteManifest.version, manifest.version);

const licenses = await fs.readFile(new URL('LICENSES.md', root), 'utf8');
assert.match(licenses, /Salamander/i);
assert.match(licenses, /CC BY 3\.0/);
assert.match(licenses, /FreePats[\s\S]*guitar/i);
assert.match(licenses, /FreePats[\s\S]*bass|bass[\s\S]*FreePats/i);
assert.match(licenses, /VSCO 2 CE/);
assert.match(licenses, /VCSL/);
assert.match(licenses, /CC0/);
assert.match(licenses, /OpenAIR[\s\S]*Dixon/i);
assert.match(licenses, /CC BY 4\.0/);

// 1.8.0 vs 1.7.0 compose parity and 1.6.0 distinctness.
const base = { genre: 'lofi', mood: 'warm', key: 'C', bpm: 84, bars: 16, seed: 42, planner: 'concept' };
const v18 = compose({ ...base, engineVersion: '1.8.0' });
const v17 = compose({ ...base, engineVersion: '1.7.0' });
const v16 = compose({ ...base, engineVersion: '1.6.0' });
assert.equal(v18.settings.engineVersion, '1.8.0');
assert.equal(v17.settings.engineVersion, '1.7.0');
assert.deepEqual(v18.events, v17.events, '1.8.0 and 1.7.0 produce identical note events');
assert.notDeepEqual(v18.events, v16.events, '1.8.0 stays distinct from 1.6.0');
assert.notEqual(v18.events.length, v16.events.length, '1.6.0 routes to composeV16');

// Closest-note selection & pitch shift bounds.
const pianoNotes = manifest.instruments.piano.notes;
for (let midi = 36; midi <= 84; midi++) {
  const picked = pickSampleNote(pianoNotes, midi);
  assert.ok(Math.abs(picked.semitones) <= 3, `piano midi ${midi} shifted ${picked.semitones}`);
  assert.ok(Math.abs(picked.playbackRate - 2 ** (picked.semitones / 12)) < 1e-9);
}
assert.ok(pickSampleNote(pianoNotes, 0).playbackRate >= 0.25);
assert.ok(pickSampleNote(pianoNotes, 127).playbackRate <= 4);

// Genre pack mapping & instrument resolution.
for (const genre of Object.keys(GENRE_PACKS)) {
  const song = compose({ genre, mood: 'warm', key: 'C', bpm: 96, bars: 8, seed: 11, engineVersion: '1.8.0' });
  const needed = instrumentsForSong(song);
  assert.ok(needed.includes('bass') && needed.includes('drums'), `${genre} includes bass and drums`);
  for (const kind of ['melody', 'chords']) {
    const inst = resolveSampleInstrument(genre, song.timbre, kind, 0.5);
    assert.ok(needed.includes(inst), `${genre} ${kind} -> ${inst} included in lazy pack`);
  }
}
assert.equal(resolveSampleInstrument('bossa', { id: 'nylon-warm', family: 'pluck' }, 'melody', 0.5), 'guitar');
assert.equal(resolveSampleInstrument('cinematic', { id: 'warm-pad', family: 'pad' }, 'chords', 2.0), 'strings');
assert.equal(resolveSampleInstrument('lofi', { id: 'felt-piano', family: 'keys' }, 'chords', 1.2), 'piano');
assert.equal(resolveSampleInstrument('lofi', null, 'hum', 2.0), null);

// Playback-time seeded humanization: deterministic, bounded, non-mutating, 1.8.0 only.
const snapshot = JSON.stringify(v18.events);
const h1 = humanizeEvent(v18, v18.events[0], 0);
const h1Repeat = humanizeEvent(v18, v18.events[0], 0);
assert.deepEqual(h1, h1Repeat, 'humanization is deterministic');
const hOld = humanizeEvent(v17, v17.events[0], 0);
assert.equal(hOld.dt, 0);
assert.equal(hOld.velocity, v17.events[0].velocity);
let moved = 0;
for (let i = 0; i < v18.events.length; i++) {
  const ev = v18.events[i];
  const h = humanizeEvent(v18, ev, i);
  const t = ev.time + h.dt;
  assert.ok(t >= 0 && t <= v18.duration, `humanized time ${t} stays within [0, ${v18.duration}]`);
  assert.ok(h.velocity >= 0.05 && h.velocity <= 0.98);
  if (Math.abs(h.dt) > 0.0001) moved++;
}
assert.ok(moved > v18.events.length * 0.5, 'humanization nudges note timings on 1.8.0');
assert.equal(JSON.stringify(v18.events), snapshot, 'humanization does not mutate song.events');

// Fallback when sample base fails.
setSampleBase('http://127.0.0.1:1/nonexistent/');
const fallback = await ensureSamples({ decodeAudioData() {} }, v18);
assert.equal(fallback.ready, false);
setSampleBase(null);

console.log(`samples-check: ${listedFiles.length} valid MP3s (${(totalBytes / 1024).toFixed(1)} KiB), licenses, v1.8/v1.7/v1.6 routing, humanization, and fallback passed`);
