import assert from 'node:assert/strict';
import { compose } from '../dist/audio.js';
import { createBrief } from '../dist/brief.js';

const seeds = Array.from({ length: 24 }, (_, index) => index + 1);
const base = { genre: 'lofi', mood: 'warm', key: 'C', bpm: 84, bars: 16, scale: 'major', topic: '창가의 오후', notes: '' };

function melody(song) {
  return song.events.filter(event => event.instrument === 'melody').map(event => event.midi);
}
function intervals(notes) {
  const out = [];
  for (let index = 1; index < notes.length; index++) out.push(notes[index] - notes[index - 1]);
  return out;
}
function contour(notes) {
  return intervals(notes).map(interval => (interval > 0 ? 1 : interval < 0 ? -1 : 0));
}
function distance(left, right) {
  const length = Math.max(left.length, right.length) || 1;
  let delta = 0;
  for (let index = 0; index < length; index++) if ((left[index] ?? 9) !== (right[index] ?? 9)) delta++;
  return delta / length;
}
function intervalDistance(left, right) {
  const length = Math.max(left.length, right.length) || 1;
  let delta = 0;
  for (let index = 0; index < length; index++) delta += Math.abs((left[index] ?? 0) - (right[index] ?? 0));
  return delta / length;
}
function groove(song) {
  const hits = [];
  for (const event of song.events) {
    if (!['kick', 'snare', 'hat'].includes(event.instrument)) continue;
    const step = Math.round(event.time / song.beatSeconds * 2) / 2;
    if (step >= 0 && step < 4) hits.push(`${event.instrument}@${step}`);
  }
  return [...new Set(hits)].sort().join('|');
}
function melodyRhythm(song) {
  return song.events.filter(event => event.instrument === 'melody' && event.time < song.beatSeconds * 4)
    .map(event => Math.round(event.time / song.beatSeconds * 2) / 2)
    .sort((a, b) => a - b)
    .join(',');
}
function structureKey(sections) {
  return sections.map(section => `${section.role}:${section.bars}`).join('|');
}

const songs = seeds.map(seed => compose({ ...base, seed }));
assert.deepEqual(songs[0], compose({ ...base, seed: seeds[0] }), 'One seed must reproduce the same sketch.');
assert.notDeepEqual(songs[0].events, songs[1].events, 'A different seed must change the performance.');
for (const song of songs) {
  assert.equal(song.structure.reduce((sum, section) => sum + section.bars, 0), song.bars);
  assert.ok(song.structure.every(section => section.bars > 0));
  assert.equal(createBrief({ ...base, seed: song.seed }).structure.map(section => `${section.role}:${section.bars}`).join('|'), structureKey(song.structure));
}

const progressions = new Set(songs.map(song => song.chords.map(chord => chord.name).join('-')));
const openings = new Set(songs.map(song => song.chordNames.join('-')));
const grooves = new Set(songs.map(groove));
const rhythms = new Set(songs.map(melodyRhythm));
const structures = new Set(songs.map(song => structureKey(song.structure)));
const contours = songs.map(song => contour(melody(song)));
let contourSum = 0;
let intervalSum = 0;
let pairs = 0;
for (let left = 0; left < songs.length; left++) {
  for (let right = left + 1; right < songs.length; right++) {
    contourSum += distance(contours[left], contours[right]);
    intervalSum += intervalDistance(intervals(melody(songs[left])), intervals(melody(songs[right])));
    pairs++;
  }
}
const contourDistance = contourSum / pairs;
const intervalDistanceMean = intervalSum / pairs;

assert.ok(progressions.size >= 8, `expected several full progressions, got ${progressions.size}`);
assert.ok(openings.size >= 4, `expected several opening progressions, got ${openings.size}`);
assert.ok(grooves.size >= 4, `expected several drum grooves, got ${grooves.size}`);
assert.ok(rhythms.size >= 4, `expected several melody rhythms, got ${rhythms.size}`);
assert.ok(structures.size >= 4, `expected several song forms, got ${structures.size}`);
assert.ok(contourDistance >= 0.5, `melodic contours are still too alike (${contourDistance.toFixed(3)})`);
assert.ok(intervalDistanceMean >= 4.5, `melodic intervals are still too alike (${intervalDistanceMean.toFixed(3)})`);

let progressionTotal = 0;
let grooveTotal = 0;
for (const genre of ['lofi', 'pop', 'rnb', 'ballad', 'edm', 'acoustic']) {
  const set = seeds.map(seed => compose({ ...base, genre, seed }));
  progressionTotal += new Set(set.map(song => song.chordNames.join('-'))).size;
  grooveTotal += new Set(set.map(groove)).size;
}
assert.ok(progressionTotal / 6 >= 4, 'each genre should offer more than one progression');
assert.ok(grooveTotal / 6 >= 4, 'each genre should offer more than one groove');

let moodProgressions = 0;
let moodGrooves = 0;
for (const genre of ['modernrock', 'dawn', 'nitelofi']) {
  const scale = genre === 'modernrock' ? 'major' : 'minor';
  const set = seeds.map(seed => compose({ ...base, genre, scale, seed, instruments: { melody: true, chords: true, bass: true, drums: true, hum: true } }));
  moodProgressions += new Set(set.map(song => song.chordNames.join('-'))).size;
  moodGrooves += new Set(set.map(groove)).size;
  assert.equal(set[0].events.some(event => event.instrument === 'hum'), true);
  assert.deepEqual(set[0], compose({ ...base, genre, scale, seed: seeds[0], instruments: { melody: true, chords: true, bass: true, drums: true, hum: true } }));
}
assert.ok(moodProgressions / 3 >= 2, `new moods need more than one progression (${moodProgressions})`);
assert.ok(moodGrooves / 3 >= 2, `new moods need more than one groove (${moodGrooves})`);
for (const genre of ['citypop', 'trap', 'house', 'bossa', 'reggaeton']) {
  const set = seeds.map(seed => compose({ ...base, genre, seed }));
  const genreProgressions = new Set(set.map(song => song.chordNames.join('-')));
  const genreGrooves = new Set(set.map(groove));
  const timbres = new Set(set.map(song => song.timbre?.id));
  assert.ok(genreProgressions.size >= 3, `${genre} progressions ${genreProgressions.size}`);
  assert.ok(genreGrooves.size >= 3, `${genre} grooves ${genreGrooves.size}`);
  assert.ok(timbres.size >= 2, `${genre} timbres ${timbres.size}`);
  const profileSwing = genre === 'house' ? [0, 0] : null;
  if (profileSwing) assert.ok(set.every(song => song.swing === 0), 'house stays straight');
}
const space = compose({ ...base, seed: 5, notes: '여백을 많이 두고 고요하게' });
const lift = compose({ ...base, seed: 5, notes: '후렴을 크게, 브리지에서 전환' });
assert.notEqual(structureKey(space.structure), structureKey(lift.structure), 'The brief should change the form.');
assert.equal(structureKey(space.structure), structureKey(createBrief({ ...base, seed: 5, notes: '여백을 많이 두고 고요하게' }).structure));
assert.notEqual(createBrief({ ...base, topic: '비 오는 골목', seed: 4 }).lyrics, createBrief({ ...base, topic: '햇살 가득한 운동장', seed: 4 }).lyrics);

const classicSettings = { genre: 'lofi', mood: 'warm', key: 'C', bpm: 86, bars: 16, seed: 42 };
const classic = compose(classicSettings);
assert.deepEqual(classic.chordNames, ['Cmaj7', 'Am7', 'Dm7', 'G6']);
assert.deepEqual(classic, compose(classicSettings));
assert.deepEqual(compose({ ...classicSettings, planner: 'legacy' }).chordNames, ['Cmaj7', 'Am7', 'Dm7', 'G6']);
assert.equal(compose({ ...base, seed: 1, planner: 'legacy' }).concept, undefined);
assert.ok(classic.concept?.summary);

function familyOf(song) {
  return song.concept?.family || 'verseChorus';
}
function edgeBars(song, role, end) {
  const section = end ? song.structure.at(-1) : song.structure[0];
  return section?.role === role ? section.bars : 0;
}
function motifId(song) {
  return song.concept?.motif || song.variation?.contour || '';
}
function rootDistance(left, right) {
  const length = Math.max(left.length, right.length) || 1;
  let delta = 0;
  for (let index = 0; index < length; index++) if ((left[index] ?? -1) !== (right[index] ?? -2)) delta++;
  return delta / length;
}
function snapshot(planner) {
  const flag = planner ? { planner } : {};
  const set = seeds.map(seed => compose({ ...base, ...flag, seed }));
  const contours = set.map(song => contour(melody(song)));
  const steps = set.map(song => intervals(melody(song)));
  const roots = set.map(song => song.chords.map(chord => chord.root));
  let contourSum = 0;
  let intervalSum = 0;
  let harmonySum = 0;
  let pairCount = 0;
  for (let left = 0; left < set.length; left++) {
    for (let right = left + 1; right < set.length; right++) {
      contourSum += distance(contours[left], contours[right]);
      intervalSum += intervalDistance(steps[left], steps[right]);
      harmonySum += rootDistance(roots[left], roots[right]);
      pairCount++;
    }
  }
  return {
    openings: new Set(set.map(song => song.chordNames.join('-'))).size,
    full: new Set(set.map(song => song.chords.map(chord => chord.name).join('-'))).size,
    degrees: new Set(set.map(song => song.chords.slice(0, 4).map(chord => chord.degree).join(','))).size,
    grooves: new Set(set.map(groove)).size,
    rhythms: new Set(set.map(melodyRhythm)).size,
    forms: new Set(set.map(song => structureKey(song.structure))).size,
    families: new Set(set.map(familyOf)).size,
    motifs: new Set(set.map(motifId)).size,
    intros: new Set(set.map(song => edgeBars(song, 'intro', false))).size,
    outros: new Set(set.map(song => edgeBars(song, 'outro', true))).size,
    signatures: new Set(set.map(song => song.concept?.signature || 'legacy')).size,
    contour: contourSum / pairCount,
    interval: intervalSum / pairCount,
    harmony: harmonySum / pairCount,
  };
}
const before = snapshot('legacy');
const after = snapshot();
assert.ok(after.openings >= 12 && after.openings > before.openings, `openings ${before.openings} -> ${after.openings}`);
assert.equal(before.families, 1, 'the 1.4 planner only writes verse-chorus forms');
assert.ok(after.families >= 4, `form families ${after.families}`);
assert.ok(after.grooves > before.grooves, `grooves ${before.grooves} -> ${after.grooves}`);
assert.ok(after.motifs >= 12 && after.motifs > before.motifs, `motifs ${before.motifs} -> ${after.motifs}`);
assert.ok(after.intros > before.intros && after.outros > before.outros, `edges ${before.intros}/${before.outros} -> ${after.intros}/${after.outros}`);
assert.ok(after.contour > before.contour, `contour ${before.contour} -> ${after.contour}`);
assert.ok(after.interval > before.interval, `interval ${before.interval} -> ${after.interval}`);
assert.ok(after.harmony > before.harmony, `harmony ${before.harmony} -> ${after.harmony}`);
assert.ok(after.degrees >= 12 && after.degrees > before.degrees, `degree families ${before.degrees} -> ${after.degrees}`);
assert.ok(after.signatures >= 20, `concept signatures ${after.signatures}`);
const genreIds = ['lofi', 'pop', 'rnb', 'ambient', 'ballad', 'edm', 'acoustic', 'cinematic', 'modernrock', 'dawn', 'nitelofi', 'citypop', 'trap', 'house', 'bossa', 'reggaeton'];
function grooveFloor(planner) {
  const flag = planner ? { planner } : {};
  let min = Infinity;
  for (const genre of genreIds) {
    const set = seeds.map(seed => compose({ ...base, genre, ...flag, seed }));
    min = Math.min(min, new Set(set.map(groove)).size);
  }
  return min;
}
const beforeFloor = grooveFloor('legacy');
const afterFloor = grooveFloor();
assert.ok(beforeFloor <= 3, `legacy groove floor ${beforeFloor}`);
assert.ok(afterFloor >= 5 && afterFloor > beforeFloor, `concept groove floor ${afterFloor} vs ${beforeFloor}`);

console.log(`diversity-before: openings ${before.openings}, full ${before.full}, degrees ${before.degrees}, grooves ${before.grooves}, rhythms ${before.rhythms}, forms ${before.forms}, families ${before.families}, motifs ${before.motifs}, intros ${before.intros}, outros ${before.outros}, contour ${before.contour.toFixed(3)}, interval ${before.interval.toFixed(3)}, harmony ${before.harmony.toFixed(3)}, grooveFloor ${beforeFloor}`);
console.log(`diversity-after: openings ${after.openings}, full ${after.full}, degrees ${after.degrees}, grooves ${after.grooves}, rhythms ${after.rhythms}, forms ${after.forms}, families ${after.families}, motifs ${after.motifs}, intros ${after.intros}, outros ${after.outros}, signatures ${after.signatures}, contour ${after.contour.toFixed(3)}, interval ${after.interval.toFixed(3)}, harmony ${after.harmony.toFixed(3)}, grooveFloor ${afterFloor}`);
console.log(`diversity-check: ${progressions.size} progressions, ${openings.size} openings, ${grooves.size} grooves, ${rhythms.size} rhythms, ${structures.size} forms, contour ${contourDistance.toFixed(3)}, interval ${intervalDistanceMean.toFixed(3)}`);
