import assert from 'node:assert/strict';
import { compose, createPlayer, genreProfile, SCALE_SETS } from '../dist/audio.js';
import { createBrief } from '../dist/brief.js';
import { GENRE_PRESETS, applyPresetToSettings, presetById } from '../dist/presets.js';

const ids = GENRE_PRESETS.map(preset => preset.id);
assert.deepEqual(ids, ['lofi', 'ballad', 'edm', 'acoustic', 'cinematic', 'citypop', 'trap', 'house', 'bossa', 'reggaeton']);
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
assert.equal(count(patterned.house, 'kick'), 4);
assert.equal(count(patterned.trap, 'kick'), 1);
assert.ok(count(patterned.trap, 'hat') >= 10);
assert.ok(count(patterned.ballad, 'hat') > count(patterned.cinematic, 'hat'));
assert.ok(count(patterned.edm, 'snare') >= 2);
assert.notDeepEqual(patterned.lofi.events, patterned.ballad.events);

function beatOf(song, event) {
  return event.time / song.beatSeconds;
}
function near(song, instrument, targets, midi) {
  const hits = song.events.filter(event => event.instrument === instrument && beatOf(song, event) < 4 && (midi == null || event.midi === midi));
  return targets.every(target => hits.some(event => Math.abs((beatOf(song, event) % 4) - target) < 0.08));
}
assert.ok(near(patterned.house, 'hat', [0.5, 1.5, 2.5, 3.5], 46), 'house keeps offbeat open hats');
assert.ok(near(patterned.trap, 'snare', [2]), 'trap snare sits on beat 3');
const trapHats = patterned.trap.events.filter(event => event.instrument === 'hat' && beatOf(patterned.trap, event) < 4).map(event => beatOf(patterned.trap, event)).sort((a, b) => a - b);
assert.ok(trapHats.some((beat, index) => index && beat - trapHats[index - 1] < 0.2), 'trap includes a hi-hat roll');
assert.ok(near(patterned.reggaeton, 'snare', [0.75, 1.75, 2.75, 3.5]), 'reggaeton keeps the dembow snare');
assert.ok(near(patterned.bossa, 'snare', [0.75, 1.5, 3.5]), 'bossa keeps syncopated rim clicks');
assert.ok(patterned.bossa.chordNames.some(name => name.endsWith('m7')));
assert.ok(patterned.bossa.chordNames.some(name => name.endsWith('7') && !name.endsWith('m7') && !name.endsWith('maj7')));
for (const id of ['citypop', 'trap', 'house', 'bossa', 'reggaeton']) {
  const range = genreProfile(id).swingRange;
  for (const seed of [1, 3, 8, 21]) {
    const swing = compose({ ...applyPresetToSettings({}, id), bars: 8, seed }).swing;
    assert.ok(swing >= range[0] - 1e-9 && swing <= range[1] + 1e-9, `${id} swing ${swing} left ${range}`);
  }
}

assert.equal(genreProfile('edm').voice, 'saw');
assert.equal(genreProfile('ballad').voice, 'pad');
assert.equal(genreProfile('acoustic').voice, 'pluck');
assert.equal(genreProfile('cinematic').voice, 'wide');
assert.equal(genreProfile('citypop').voice, 'keys');
assert.equal(genreProfile('trap').voice, '808');
assert.equal(genreProfile('house').voice, 'house');
assert.equal(genreProfile('bossa').voice, 'nylon');
assert.equal(genreProfile('reggaeton').voice, 'pulse');
assert.deepEqual(genreProfile('citypop').swingRange, [0.04, 0.1]);
assert.deepEqual(genreProfile('trap').swingRange, [0, 0.02]);
assert.deepEqual(genreProfile('house').swingRange, [0, 0]);
assert.deepEqual(genreProfile('bossa').swingRange, [0.01, 0.05]);
assert.deepEqual(genreProfile('reggaeton').swingRange, [0, 0.02]);
assert.equal(genreProfile('lofi').cutoff, 3400);
assert.equal(genreProfile('nope'), null);
assert.equal(presetById('missing'), null);
assert.equal(applyPresetToSettings({ title: '그대로' }, 'missing').title, '그대로');

const player = createPlayer();
assert.equal(player.seek(0.4), false);
assert.equal(player.getState().status, 'stopped');
player.stop();
await player.destroy();
console.log('preset-check: ten presets, scales, drum patterns, briefs, and seek guard passed');
