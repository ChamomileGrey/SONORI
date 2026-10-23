import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const source = await readFile(new URL('../dist/audio.js', import.meta.url), 'utf8');
const { compose, normalizeSettings, createMidi, encodeWav, createPlayer } = await import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`);
const settings = { genre: 'lofi', mood: 'warm', key: 'C', bpm: 86, bars: 16, seed: 42 };
const song = compose(settings);
assert.deepEqual(song, compose(settings), 'The same brief and seed reproduce the same music.');
assert.notDeepEqual(song.events, compose({ ...settings, seed: 43 }).events, 'A new seed changes the performance.');
assert.equal(song.chords.length, 16);
assert.deepEqual(song.chordNames, ['Cmaj7', 'Am7', 'Dm7', 'G6']);
assert.equal(song.chords.at(-1).root, song.chords[0].root, 'The final bar resolves to the home chord.');
assert.equal(song.events.findLast(event => event.instrument === 'melody').midi % 12, song.chords[0].root);

for (const instrument of ['melody', 'chords', 'bass', 'drums']) {
  const muted = compose({ ...settings, instruments: { [instrument]: false } });
  const expected = song.events.filter(event => instrument === 'drums' ? !['kick', 'snare', 'hat'].includes(event.instrument) : event.instrument !== instrument);
  assert.deepEqual(muted.events, expected, 'Muting a layer must preserve the remaining arrangement.');
}
assert.equal(compose({ ...settings, instruments: { melody: false, chords: false, bass: false, drums: false } }).events.length, 0);

const keys = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9 };
let arrangements = 0;
for (const genre of ['lofi', 'pop', 'ambient', 'rnb']) {
  for (const mood of ['warm', 'dreamy', 'bright', 'melancholy']) {
    for (const key of Object.keys(keys)) {
      for (const bars of [8, 16, 32]) {
        for (const bpm of [72, 101, 140]) {
          const result = compose({ ...settings, genre, mood, key, bars, bpm });
          assert.equal(result.bars, bars);
          assert.ok(Math.abs(result.duration - bars * 4 * 60 / bpm) < 0.000001);
          assert.ok(result.events.length > bars * 5);
          let lastTime = -1;
          for (const event of result.events) {
            assert.ok(event.time >= 0 && event.time >= lastTime);
            assert.ok(event.duration > 0 && event.time + event.duration <= result.duration + 0.000002);
            assert.ok(Number.isInteger(event.midi) && event.midi >= 0 && event.midi < 128);
            assert.ok(event.velocity > 0 && event.velocity <= 1);
            if (['melody', 'chords', 'bass'].includes(event.instrument)) {
              assert.ok([0, 2, 4, 5, 7, 9, 11].includes((event.midi - keys[key] + 120) % 12), 'All pitched notes remain in the chosen major / relative minor scale.');
            }
            lastTime = event.time;
          }
          for (let index = 1; index < result.chords.length; index++) {
            const movement = result.chords[index].notes.reduce((sum, note, voice) => sum + Math.abs(note - result.chords[index - 1].notes[voice]), 0);
            assert.ok(movement <= 22, 'Chord inversions keep total voice movement bounded.');
          }
          arrangements++;
        }
      }
    }
  }
}
assert.deepEqual(normalizeSettings({ bpm: Infinity, bars: 3, genre: 'invalid', key: 'invalid', seed: -1 }).bpm, 86);
assert.equal(normalizeSettings({ bpm: 800 }).bpm, 140);
assert.equal(normalizeSettings({ bpm: 1 }).bpm, 72);

// Parse the MIDI independently: track chunk sizes, tempo, deltas, balanced note pairs.
const midi = Buffer.from(await createMidi(song).arrayBuffer());
assert.equal(midi.toString('ascii', 0, 4), 'MThd');
assert.equal(midi.readUInt32BE(4), 6);
assert.equal(midi.readUInt16BE(8), 1);
assert.equal(midi.readUInt16BE(10), 5);
assert.equal(midi.readUInt16BE(12), 480);
let offset = 14;
let noteCount = 0;
let tempoFound = false;
for (let track = 0; track < 5; track++) {
  assert.equal(midi.toString('ascii', offset, offset + 4), 'MTrk');
  const length = midi.readUInt32BE(offset + 4);
  offset += 8;
  const end = offset + length;
  let tick = 0;
  const active = new Map();
  let ended = false;
  const readVariable = () => {
    let value = 0;
    let byte;
    do { byte = midi[offset++]; assert.ok(offset <= end); value = value * 128 + (byte & 127); } while (byte & 128);
    return value;
  };
  while (offset < end) {
    tick += readVariable();
    const status = midi[offset++];
    if (status === 0xff) {
      const type = midi[offset++];
      const size = readVariable();
      if (type === 0x51) { assert.equal(midi.readUIntBE(offset, 3), Math.round(60000000 / song.bpm)); tempoFound = true; }
      if (type === 0x2f) { assert.equal(size, 0); ended = true; }
      offset += size;
    } else if ((status & 0xf0) === 0xc0) {
      offset++;
    } else {
      const note = midi[offset++];
      const velocity = midi[offset++];
      assert.ok(note < 128 && velocity < 128);
      const key = `${status & 0x0f}:${note}`;
      if ((status & 0xf0) === 0x90) { active.set(key, (active.get(key) || 0) + 1); noteCount++; }
      if ((status & 0xf0) === 0x80) { assert.ok(active.get(key) > 0); active.set(key, active.get(key) - 1); }
    }
  }
  assert.equal(offset, end);
  assert.equal(tick, song.bars * 4 * 480);
  assert.ok(ended);
  assert.ok([...active.values()].every(count => count === 0));
}
assert.equal(offset, midi.length);
assert.equal(noteCount, song.events.length);
assert.ok(tempoFound);

const wave = Buffer.from(await encodeWav([Float32Array.from([0, 2, -2, NaN]), Float32Array.from([0.5, -0.5, 0, 0])], 22050).arrayBuffer());
assert.equal(wave.toString('ascii', 0, 4), 'RIFF');
assert.equal(wave.toString('ascii', 8, 12), 'WAVE');
assert.equal(wave.readUInt32LE(4), wave.length - 8);
assert.equal(wave.readUInt16LE(22), 2);
assert.equal(wave.readUInt32LE(24), 22050);
assert.equal(wave.readUInt32LE(40), 16);
assert.equal(wave.readInt16LE(56), 0, 'Non-finite samples encode to silence.');
for (let position = 44; position < wave.length; position += 2) assert.ok(Math.abs(wave.readInt16LE(position)) <= 30147);

const player = createPlayer();
player.setVolume(2);
assert.equal(player.getState().volume, 1);
player.setVolume(-1);
assert.equal(player.getState().volume, 0);
player.stop();
assert.equal(player.getState().status, 'stopped');
await assert.rejects(player.play({ events: [] }), /악기/);
await player.destroy();
console.log(`PASS: ${arrangements} arrangements, deterministic composition, independent layers, scale / voice leading, MIDI round-trip (${noteCount} notes), WAV header / normalization, player guards.`);
