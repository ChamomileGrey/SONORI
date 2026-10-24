import assert from 'node:assert/strict';
import { compose, createPlayer, genreProfile, SCALE_SETS } from '../dist/audio.js';
import { createBrief } from '../dist/brief.js';
import { GENRE_PRESETS, applyPresetToSettings, presetById } from '../dist/presets.js';

const ids = GENRE_PRESETS.map(preset => preset.id);
assert.deepEqual(ids, ['lofi', 'ballad', 'edm', 'acoustic', 'cinematic']);
const base = { title: '창가', topic: '비 오는 골목', notes: '여백', bars: 16, seed: 11, vocal: 'female' };

for (const preset of GENRE_PRESETS) {
  assert.ok(preset.bpm >= 72 && preset.bpm <= 140, preset.id);
  assert.ok(['C', 'D', 'E', 'F', 'G', 'A'].includes(preset.key), preset.id);
  assert.ok(SCALE_SETS[preset.scale], preset.id);
  const settings = applyPresetToSettings({ ...base, instruments: { melody: false } }, preset.id);
  assert.equal(settings.title, '창가');
  assert.equal(settings.topic, '비 오는 골목');
  assert.equal(settings.notes, '여백');
  assert.equal(settings.genre, preset.genre);
  assert.equal(settings.mood, preset.mood);
  assert.equal(settings.bpm, preset.bpm);
  assert.equal(settings.key, preset.key);
  assert.equal(settings.scale, preset.scale);
  assert.deepEqual(settings.instruments, { melody: true, chords: true, bass: true, drums: true });

  const song = compose({ ...settings, bars: 8, seed: 99 });
  assert.equal(song.bpm, preset.bpm);
  assert.equal(song.settings.scale, preset.scale);
  assert.ok(song.events.length > 8 * 5, preset.id);
  const scale = SCALE_SETS[preset.scale];
  const root = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9 }[preset.key];
  for (const event of song.events) {
    if (['kick', 'snare', 'hat'].includes(event.instrument)) continue;
    assert.ok(scale.includes((event.midi - root + 120) % 12), `${preset.id} ${event.instrument} leaves the ${preset.scale} collection`);
  }
  const brief = createBrief(settings);
  assert.match(brief.prompt, new RegExp(`${preset.bpm} BPM`));
  assert.doesNotMatch(`${brief.summary}\n${brief.prompt}\n${brief.discussion}`, /undefined|NaN/);
  if (preset.scale !== 'major') assert.match(brief.prompt, /Pitch color:/);
  assert.equal(compose(settings).events.length > 0, true);
  assert.deepEqual(compose(settings), compose(settings));
}

function count(song, instrument, bar = 0) {
  return song.events.filter(event => {
    if (event.instrument !== instrument) return false;
    const beatIndex = Math.round(event.time / song.beatSeconds);
    return beatIndex >= bar * 4 && beatIndex < bar * 4 + 4;
  }).length;
}
const patterned = Object.fromEntries(GENRE_PRESETS.map(preset => [preset.id, compose({ ...applyPresetToSettings({}, preset.id), bars: 8, seed: 3 })]));
assert.equal(count(patterned.edm, 'kick'), 4);
assert.equal(count(patterned.ballad, 'kick'), 1);
assert.equal(count(patterned.acoustic, 'kick'), 2);
assert.equal(count(patterned.cinematic, 'kick'), 1);
assert.ok(count(patterned.ballad, 'hat') > count(patterned.cinematic, 'hat'));
assert.ok(count(patterned.edm, 'snare') >= 2);
assert.notDeepEqual(patterned.lofi.events, patterned.ballad.events);

assert.equal(genreProfile('edm').voice, 'saw');
assert.equal(genreProfile('ballad').voice, 'pad');
assert.equal(genreProfile('acoustic').voice, 'pluck');
assert.equal(genreProfile('cinematic').voice, 'wide');
assert.equal(genreProfile('lofi').cutoff, 3400);
assert.equal(genreProfile('nope'), null);
assert.equal(presetById('missing'), null);
assert.equal(applyPresetToSettings({ title: '그대로' }, 'missing').title, '그대로');

const player = createPlayer();
assert.equal(player.seek(0.4), false);
assert.equal(player.getState().status, 'stopped');
player.stop();
await player.destroy();
console.log('preset-check: five presets, scales, drum patterns, briefs, and seek guard passed');
