import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { compose } from '../dist/audio.js';

const fixture = JSON.parse(await readFile(new URL('./fixtures/v16-concept.json', import.meta.url), 'utf8'));

function digestOf(events) {
  const packed = events.map(event => ({
    instrument: event.instrument,
    time: event.time,
    duration: event.duration,
    midi: event.midi,
    velocity: event.velocity,
  }));
  return createHash('sha256').update(JSON.stringify(packed)).digest('hex');
}

for (const saved of fixture) {
  const played = compose({ ...saved.settings, planner: 'concept', engineVersion: '1.6.0' });
  assert.equal(played.events.length, saved.eventCount, `seed ${saved.settings.seed} event count`);
  assert.deepEqual(played.chordNames, saved.chordNames, `seed ${saved.settings.seed} chords`);
  assert.equal(digestOf(played.events), saved.digest, `seed ${saved.settings.seed} v1.6 fixture`);
  const unnamed = compose({ ...saved.settings, planner: 'concept' });
  assert.notEqual(unnamed.events.length, played.events.length, `seed ${saved.settings.seed} v1.7 path stays distinct`);
}

const project = { format: 'sonori-project', version: 1, settings: { ...fixture[0].settings, planner: 'concept' } };
const fromJson = compose({ ...project.settings, engineVersion: project.engineVersion === '1.7.0' ? '1.7.0' : '1.6.0' });
assert.equal(digestOf(fromJson.events), fixture[0].digest, 'a project JSON with no engineVersion plays the v1.6 fixture');

console.log(`v16-fixture-check: ${fixture.map(item => `seed ${item.settings.seed} ${item.eventCount}`).join(', ')} matched the v1.6 output`);
