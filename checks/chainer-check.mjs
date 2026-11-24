import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { compose, encodeWav, foldLoop } from '../dist/audio.js';
import {
  CHAINER_LIMITS,
  chainSegments,
  parseKey,
  pitchShift,
  deriveDownbeats,
  planChain,
  scoreCompatibility,
  seamMetrics,
  timeStretch,
  wrapClickMetric,
} from '../dist/chainer.js';

function makeSine(length, sampleRate, freq, { phase = 0, amp = 0.5 } = {}) {
  const buf = new Float32Array(length);
  for (let i = 0; i < length; i++) {
    buf[i] = amp * Math.sin(2 * Math.PI * freq * (i / sampleRate) + phase);
  }
  return [buf, buf.slice()];
}

function makePulseTrack(durationS, sampleRate, beatTimesS, { freq = 220, pulseDurS = 0.04 } = {}) {
  const len = Math.round(durationS * sampleRate);
  const ch = new Float32Array(len);
  const pulseLen = Math.max(8, Math.round(pulseDurS * sampleRate));
  for (const beatS of beatTimesS) {
    const start = Math.round(beatS * sampleRate);
    for (let k = 0; k < pulseLen && start + k < len; k++) {
      const env = Math.sin((Math.PI * k) / pulseLen);
      ch[start + k] += 0.6 * env * Math.sin(2 * Math.PI * freq * (k / sampleRate));
    }
  }
  return [ch, ch.slice()];
}

function renderSongQuick(song, sampleRate = 16000) {
  const frames = Math.ceil((song.duration + 0.5) * sampleRate);
  const left = new Float32Array(frames);
  const right = new Float32Array(frames);
  for (const ev of song.events) {
    if (!Number.isFinite(ev.midi) || ev.instrument === 'kick' || ev.instrument === 'snare' || ev.instrument === 'hat') continue;
    const freq = 440 * 2 ** ((ev.midi - 69) / 12);
    const start = Math.max(0, Math.round(ev.time * sampleRate));
    const dur = Math.max(16, Math.round(Math.min(ev.duration || 0.3, 1.2) * sampleRate));
    const amp = (ev.velocity || 0.5) * 0.14;
    const attack = Math.max(4, Math.round(sampleRate * 0.01));
    for (let k = 0; k < dur && start + k < frames; k++) {
      const env = k < attack ? k / attack : (1 - (k - attack) / Math.max(1, dur - attack)) ** 1.5;
      const sample = amp * env * Math.sin(2 * Math.PI * freq * (k / sampleRate));
      left[start + k] += sample;
      right[start + k] += sample;
    }
  }
  return [left, right];
}

// 1. Key parsing & compatibility scoring
assert.deepEqual(parseKey('F# major')?.tonic, 6);
assert.equal(parseKey('F# major')?.mode, 'major');
assert.deepEqual(parseKey('D# minor')?.tonic, 3);
assert.equal(parseKey('D# minor')?.mode, 'minor');
assert.equal(parseKey('F# major')?.majorFamily, parseKey('D# minor')?.majorFamily);
assert.equal(parseKey({ tonic: 'Eb', mode: 'minor' })?.tonic, 3);

const baseA = { id: 'a', bpm: 80, key: 'C major', role: 'intro', coreStartS: 0, coreEndS: 4 };
const exactB = { id: 'b', bpm: 80, key: 'C major', role: 'hook', coreStartS: 0, coreEndS: 4 };
const cExact = scoreCompatibility(baseA, exactB);
assert.equal(cExact.ok, true);
assert.equal(cExact.tempoScale, 1);
assert.equal(cExact.pitchSemitones, 0);

const nearB = { id: 'b-near', bpm: 82.4, key: 'C major', role: 'hook', coreStartS: 0, coreEndS: 4 };
const cNear = scoreCompatibility(baseA, nearB);
assert.equal(cNear.ok, true, '80 vs 82.4 BPM (~3%) should be compatible');
assert.ok(cNear.tempoScale >= CHAINER_LIMITS.minTempoScale && cNear.tempoScale <= CHAINER_LIMITS.maxTempoScale);

const farB = { id: 'b-far', bpm: 88, key: 'C major', role: 'hook', coreStartS: 0, coreEndS: 4 };
const cFar = scoreCompatibility(baseA, farB);
assert.equal(cFar.ok, false, '80 vs 88 BPM (10%) must be rejected');

// Relative major/minor (C major <-> A minor, F# major <-> D# minor) and parallel (A <-> A minor)
const cRelCM = scoreCompatibility(
  { id: 'cm', bpm: 90, key: 'C major' },
  { id: 'am', bpm: 90, key: 'A minor' },
);
assert.equal(cRelCM.ok, true);
assert.equal(cRelCM.pitchSemitones, 0);
assert.equal(cRelCM.keyRelation, 'relative');

const cRelFSharp = scoreCompatibility(
  { id: 'f#', bpm: 90, key: 'F# major' },
  { id: 'd#m', bpm: 90, key: 'D# minor' },
);
assert.equal(cRelFSharp.ok, true);
assert.equal(cRelFSharp.pitchSemitones, 0);
assert.equal(cRelFSharp.keyRelation, 'relative');

const cParallelA = scoreCompatibility(
  { id: 'amaj', bpm: 90, key: 'A' },
  { id: 'amin', bpm: 90, key: 'A minor' },
);
assert.equal(cParallelA.ok, true);
assert.equal(cParallelA.pitchSemitones, 0);

// 6 semitones apart, not relative: A minor vs Eb minor -> no forced pitch shift, lower score
const cDistant = scoreCompatibility(
  { id: 'amin', bpm: 90, key: 'A minor' },
  { id: 'ebmin', bpm: 90, key: 'Eb minor' },
);
assert.equal(cDistant.ok, true);
assert.equal(cDistant.pitchSemitones, 0, 'Must not force pitch shift beyond ±2 st');
assert.ok(cDistant.score < cRelCM.score, `Distant key score (${cDistant.score}) must be lower than relative (${cRelCM.score})`);

// Nearby key within ±2 st proposes signed pitch shift
const cNearbyKey = scoreCompatibility(
  { id: 'c', bpm: 90, key: 'C major' },
  { id: 'd', bpm: 90, key: 'D major' },
);
assert.equal(cNearbyKey.ok, true);
assert.equal(cNearbyKey.pitchSemitones, -2);

// Double/half-time BPM family
const cDouble = scoreCompatibility(
  { id: 'slow', bpm: 80, key: 'C major' },
  { id: 'fast', bpm: 160, key: 'C major' },
);
assert.equal(cDouble.ok, true);
assert.equal(cDouble.tempoScale, 1);

// Role order mild bonus without rejecting solely on role
const cGoodRole = scoreCompatibility(
  { id: 'i', bpm: 90, key: 'C major', role: 'intro' },
  { id: 'h', bpm: 90, key: 'C major', role: 'hook' },
);
const cOddRole = scoreCompatibility(
  { id: 'e', bpm: 90, key: 'C major', role: 'ending' },
  { id: 'i2', bpm: 90, key: 'C major', role: 'intro' },
);
assert.equal(cOddRole.ok, true, 'Must not reject solely on role');
assert.ok(cGoodRole.score > cOddRole.score, 'Good role order should score higher');

// 2. Equal-power crossfade continuity + wrapClickMetric (folded vs hard wrap)
const sr = 16000;
const slowA = {
  id: 'slow-a',
  bpm: 120,
  key: 'C major',
  sampleRate: sr,
  channels: makeSine(sr * 3, sr, 4, { amp: 0.4 }),
  coreStartS: 0,
  coreEndS: 2,
};
const slowB = {
  id: 'slow-b',
  bpm: 120,
  key: 'C major',
  sampleRate: sr,
  channels: makeSine(sr * 3, sr, 4, { amp: 0.4 }),
  coreStartS: 1,
  coreEndS: 3,
};
const slowChain = chainSegments([slowA, slowB], { xfadeBars: 0.5 });
assert.equal(slowChain.joins.length, 1);
let maxStepAroundJoin = 0;
const jCenter = slowChain.joins[0].joinSample;
for (let i = Math.max(1, jCenter - 400); i < Math.min(slowChain.channels[0].length, jCenter + 400); i++) {
  maxStepAroundJoin = Math.max(maxStepAroundJoin, Math.abs(slowChain.channels[0][i] - slowChain.channels[0][i - 1]));
}
assert.ok(maxStepAroundJoin < 0.01, `Equal-power xfade of slow sines must be continuous, got maxStep=${maxStepAroundJoin}`);

// Wrap click metric: hard wrap vs foldLoop on non-integer-cycle tone
const loopRate = 8000;
const loopDur = 2.0;
const loopFade = 0.15;
const rawLoop = makeSine(Math.ceil((loopDur + loopFade) * loopRate) + 16, loopRate, 55.3, { amp: 0.5 });
const hardTrim = rawLoop.map(ch => ch.slice(0, Math.round(loopDur * loopRate)));
const foldedLoop = foldLoop(rawLoop, loopRate, loopDur, loopFade);
const hardWrap = wrapClickMetric(hardTrim, loopRate, { windowS: 1.2 });
const foldedWrap = wrapClickMetric(foldedLoop, loopRate, { windowS: 1.2 });
assert.ok(
  foldedWrap.ratio < hardWrap.ratio * 0.2,
  `Folded wrapClick (${foldedWrap.ratio.toFixed(3)}) must be clearly smaller than hard wrap (${hardWrap.ratio.toFixed(3)})`,
);

// 3. Downbeat alignment (±1 frame)
const gridSr = 16000;
// 120 BPM => 1 bar = 2.0 s, 1 beat = 0.5 s
const segGridA = {
  id: 'grid-a',
  bpm: 120,
  key: 'C major',
  sampleRate: gridSr,
  channels: makePulseTrack(4.5, gridSr, [0, 0.5, 1.0, 1.5, 2.0, 2.5, 3.0, 3.5, 4.0]),
  coreStartS: 0,
  coreEndS: 4.0,
  downbeats: [0, 2.0, 4.0],
};
const segGridB = {
  id: 'grid-b',
  bpm: 120,
  key: 'C major',
  sampleRate: gridSr,
  channels: makePulseTrack(5.0, gridSr, [0.5, 1.0, 1.5, 2.0, 2.5, 3.0, 3.5, 4.0, 4.5]),
  coreStartS: 1.0,
  coreEndS: 5.0,
  downbeats: [1.0, 3.0, 5.0],
};
const gridOut = chainSegments([segGridA, segGridB], { xfadeBars: 0.5 });
const expectedJoinFrame = Math.round(4.0 * gridSr);
assert.ok(
  Math.abs(gridOut.joins[0].joinSample - expectedJoinFrame) <= 1,
  `Downbeat joinSample ${gridOut.joins[0].joinSample} must land on ${expectedJoinFrame} (±1)`,
);
assert.ok(gridOut.joins[0].xfadeS > 0.4, 'Handle crossfade should be applied onto incoming downbeat');

// 4. Same-track adjacent cores: continuous cut, no +3 dB bump, good join/p99
const adjSr = 16000;
// Cosine phase at integer Hz => peak at t=2.0 s so raw join_over_p99 is also tiny (0.00-0.06)
const fullSine = makeSine(adjSr * 5, adjSr, 110, { phase: Math.PI / 2, amp: 0.5 });
// Create two segments with overlapping handles from the same continuous track whose cores abut at t=2.0s.
const halfA = {
  id: 'trk-a',
  trackId: 'track-1',
  role: 'intro',
  bpm: 120,
  key: 'A minor',
  sampleRate: adjSr,
  startS: 0,
  endS: 2.5,
  coreStartS: 0,
  coreEndS: 2.0,
  channels: fullSine.map(ch => ch.slice(0, Math.round(2.5 * adjSr))),
};
const halfB = {
  id: 'trk-b',
  trackId: 'track-1',
  role: 'hook',
  bpm: 120,
  key: 'A minor',
  sampleRate: adjSr,
  startS: 1.5,
  endS: 4.5,
  coreStartS: 0.5, // track time 1.5 + 0.5 = 2.0 -> abuts halfA coreEndS=2.0
  coreEndS: 3.0,
  channels: fullSine.map(ch => ch.slice(Math.round(1.5 * adjSr), Math.round(4.5 * adjSr))),
};
const adjCompat = scoreCompatibility(halfA, halfB);
assert.equal(adjCompat.sameTrack, true);
assert.equal(adjCompat.adjacentCores, true);

const adjChain = chainSegments([halfA, halfB], { xfadeBars: 0.75 });
assert.equal(adjChain.joins[0].adjacent, true);
assert.equal(adjChain.joins[0].xfadeS, 0, 'Adjacent cores must concatenate without handle xfade');
assert.equal(adjChain.joins[0].joinSample, Math.round(2.0 * adjSr));
assert.equal(adjChain.joins[0].seam.verdict, 'good', `Adjacent cut verdict was ${adjChain.joins[0].seam.verdict}`);
assert.ok(
  adjChain.joins[0].seam.join_over_p99 < 0.06,
  `Adjacent cosine cut join/p99 (${adjChain.joins[0].seam.join_over_p99}) should sit in 0.00-0.06 good range`,
);
assert.ok(adjChain.joins[0].seam.energy_continuity > 0.98);
assert.ok(adjChain.joins[0].seam.spectral_jump < 0.02);
// Confirm no +3 dB (sqrt(2) ≈ 1.414x) bump around the join
let adjPeak = 0;
for (let i = 0; i < adjChain.channels[0].length; i++) adjPeak = Math.max(adjPeak, Math.abs(adjChain.channels[0][i]));
assert.ok(adjPeak <= 0.505, `No +3 dB bump on adjacent cores: peak=${adjPeak}`);

// Verify seamMetrics catches a bad step click vs good seam
const badBuf = fullSine.map(ch => ch.slice(0, adjSr * 4));
const clickAt = adjSr * 2;
for (let i = clickAt; i < badBuf[0].length; i++) {
  badBuf[0][i] *= -1;
  badBuf[1][i] *= -1;
}
const badSeam = seamMetrics(badBuf, adjSr, clickAt);
assert.equal(badSeam.verdict, 'bad', `Phase-inverted hard click must be rated bad, got ${badSeam.verdict}`);
assert.ok(badSeam.join_over_p99 > 0.221, `Bad click join/p99 (${badSeam.join_over_p99}) must exceed 0.221 baseline`);

// 5. Stretch and pitch clamps
const tone = makeSine(sr * 2, sr, 220, { amp: 0.4 });
const stretchedHi = timeStretch(tone, sr, 1.10);
assert.equal(stretchedHi.clamped, true);
assert.equal(stretchedHi.tempoScale, CHAINER_LIMITS.maxTempoScale);
assert.ok(Math.abs(stretchedHi.channels[0].length - Math.round(tone[0].length / 1.03)) <= 2);

const stretchedLo = timeStretch(tone, sr, 0.85);
assert.equal(stretchedLo.clamped, true);
assert.equal(stretchedLo.tempoScale, CHAINER_LIMITS.minTempoScale);

const pitchedHi = pitchShift(tone, sr, 5);
assert.equal(pitchedHi.clamped, true);
assert.equal(pitchedHi.pitchSemitones, CHAINER_LIMITS.maxPitchSemitones);
assert.equal(pitchedHi.channels[0].length, tone[0].length, 'pitchShift must preserve frame count');

const pitchedLo = pitchShift(tone, sr, -5);
assert.equal(pitchedLo.clamped, true);
assert.equal(pitchedLo.pitchSemitones, -CHAINER_LIMITS.maxPitchSemitones);

// Verify pitchShift (+2 st) actually raises frequency of 220 Hz sine toward 220 * 2^(2/12) ≈ 246.94 Hz
const shifted2 = pitchShift(tone, sr, 2);
assert.equal(shifted2.clamped, false);
assert.equal(shifted2.pitchSemitones, 2);
let zeroCrossings = 0;
const midStart = Math.round(sr * 0.3);
const midEnd = Math.round(sr * 1.7);
for (let i = midStart + 1; i < midEnd; i++) {
  if (shifted2.channels[0][i - 1] <= 0 && shifted2.channels[0][i] > 0) zeroCrossings++;
}
const estFreq = zeroCrossings / ((midEnd - midStart) / sr);
const targetFreq = 220 * 2 ** (2 / 12);
assert.ok(Math.abs(estFreq - targetFreq) / targetFreq < 0.03, `Expected ~${targetFreq.toFixed(1)} Hz after +2 st, got ${estFreq.toFixed(1)} Hz`);

// Verify 3-segment chain + startAtCore trims pre-roll and aligns both downbeat joins
const seg3A = { id: 's3-a', bpm: 120, key: 'C major', role: 'intro', sampleRate: gridSr, channels: makePulseTrack(3.0, gridSr, [0.5, 1.0, 2.5]), coreStartS: 0.5, coreEndS: 2.5, downbeats: [0.5, 2.5] };
const seg3B = { id: 's3-b', bpm: 120, key: 'C major', role: 'hook', sampleRate: gridSr, channels: makePulseTrack(3.0, gridSr, [0.5, 2.5]), coreStartS: 0.5, coreEndS: 2.5, downbeats: [0.5, 2.5] };
const seg3C = { id: 's3-c', bpm: 120, key: 'C major', role: 'ending', sampleRate: gridSr, channels: makePulseTrack(3.0, gridSr, [0.5, 2.5]), coreStartS: 0.5, coreEndS: 2.5, downbeats: [0.5, 2.5] };
const threeOut = chainSegments([seg3A, seg3B, seg3C], { xfadeBars: 0.25, startAtCore: true });
assert.equal(threeOut.joins.length, 2);
assert.ok(Math.abs(threeOut.joins[0].joinSample - Math.round(2.0 * gridSr)) <= 1);
assert.ok(Math.abs(threeOut.joins[1].joinSample - Math.round(4.0 * gridSr)) <= 1);

// Calling chainSegments with an explicit out-of-range targetBpm (10% off) and pitchSemitones (5 st) clamps and flags
const forcedOut = chainSegments([
  { id: 'f1', bpm: 80, key: 'C major', sampleRate: sr, channels: tone, coreStartS: 0, coreEndS: 2 },
  { id: 'f2', bpm: 80, key: 'C major', sampleRate: sr, channels: tone, coreStartS: 0, coreEndS: 2, pitchSemitones: 5 },
], { targetBpm: 88, xfadeBars: 0.25 });
assert.equal(forcedOut.joins[0].tempoScale, 1.03);
assert.equal(forcedOut.joins[0].tempoClamped, true);
assert.equal(forcedOut.joins[0].pitchSemitones, 2);
assert.equal(forcedOut.joins[0].pitchClamped, true);

// 6. planChain prefers same-track adjacent order, then same-track, then cross-track, skipping incompatible
const planInput = [
  { id: 'other-hook', trackId: 'track-2', role: 'hook', bpm: 90, key: 'C major', coreStartS: 0, coreEndS: 4 },
  { id: 't1-part2', trackId: 'track-1', role: 'hook', bpm: 90, key: 'C major', startS: 4, endS: 8, coreStartS: 0, coreEndS: 4 },
  { id: 'too-fast', trackId: 'track-3', role: 'bridge', bpm: 120, key: 'C major', coreStartS: 0, coreEndS: 4 },
  { id: 't1-part1', trackId: 'track-1', role: 'intro', bpm: 90, key: 'C major', startS: 0, endS: 4, coreStartS: 0, coreEndS: 4 },
  { id: 't1-ending', trackId: 'track-1', role: 'ending', bpm: 90, key: 'C major', startS: 12, endS: 16, coreStartS: 0, coreEndS: 4 },
];
const planned = planChain(planInput);
assert.deepEqual(
  planned.items.map(s => s.id),
  ['t1-part1', 't1-part2', 't1-ending', 'other-hook'],
  `Expected adjacent -> same-track -> cross-track order, got ${planned.items.map(s => s.id).join(', ')}`,
);
assert.deepEqual(planned.skipped.map(s => s.id), ['too-fast']);
assert.ok(planned.notes.length >= 3);

// 7. Integration with SONORI compose() rendered in-process + WAV encoding
const songA = compose({ genre: 'lofi', mood: 'warm', bpm: 84, key: 'C', bars: 8, seed: 101, engineVersion: '1.8.0' });
const songB = compose({ genre: 'lofi', mood: 'warm', bpm: 86, key: 'C', bars: 8, seed: 202, engineVersion: '1.8.0' });
const bufA = renderSongQuick(songA, 16000);
const bufB = renderSongQuick(songB, 16000);
const barS84 = (60 / 84) * 4;
const barS86 = (60 / 86) * 4;
const sonoriChain = chainSegments([
  { id: 'sonori-a', bpm: 84, key: 'C major', role: 'intro', sampleRate: 16000, channels: bufA, coreStartS: 0, coreEndS: barS84 * 2 },
  { id: 'sonori-b', bpm: 86, key: 'C major', role: 'hook', sampleRate: 16000, channels: bufB, coreStartS: barS86 * 0.75, coreEndS: barS86 * 2.75 },
], { xfadeBars: 0.75, loop: true });
assert.equal(sonoriChain.joins.length, 1);
assert.ok(sonoriChain.joins[0].tempoScale >= 0.97 && sonoriChain.joins[0].tempoScale <= 1.03);
assert.ok(sonoriChain.wrapClick && Number.isFinite(sonoriChain.wrapClick.ratio));
const wavBlob = encodeWav(sonoriChain.channels, sonoriChain.sampleRate);
assert.ok(wavBlob.size > 44);

// 8. Auto-path must reject tempo-incompatible pairs (120 vs 150 BPM) instead of silently clamping to 0.97x
const farBpmA = { id: 'bpm-a', bpm: 120, key: 'C major', sampleRate: sr, channels: tone, coreStartS: 0, coreEndS: 2, trackId: 'x' };
const farBpmB = { id: 'bpm-b', bpm: 150, key: 'C major', sampleRate: sr, channels: tone, coreStartS: 0, coreEndS: 2, trackId: 'y' };
assert.equal(scoreCompatibility(farBpmA, farBpmB).ok, false);
assert.throws(
  () => chainSegments([farBpmA, farBpmB]),
  /incompatible|tempo/i,
  'chainSegments must reject a 25% tempo gap on the auto path',
);

// 9. Mixed-mode distant tonics must not use a family-distance pitch shift (C major vs G minor is 7 st, not +2)
const cMaj = { id: 'c-maj', bpm: 100, key: 'C major', sampleRate: sr, channels: tone, coreStartS: 0, coreEndS: 2 };
const gMin = { id: 'g-min', bpm: 100, key: 'G minor', sampleRate: sr, channels: tone, coreStartS: 0, coreEndS: 2 };
const cVsGmin = scoreCompatibility(cMaj, gMin);
assert.equal(cVsGmin.pitchSemitones, 0, 'C major vs G minor must not pitch-shift');
assert.equal(cVsGmin.keyRelation, 'rhythm_only');

// 10. Three-segment pitch must follow a consistent target (first key / targetKey)
const cSeg = { id: 'k0', bpm: 100, key: 'C major', sampleRate: sr, channels: tone, coreStartS: 0, coreEndS: 2 };
const dSeg = { id: 'k1', bpm: 100, key: 'D major', sampleRate: sr, channels: tone, coreStartS: 0, coreEndS: 2 };
const dSeg2 = { id: 'k2', bpm: 100, key: 'D major', sampleRate: sr, channels: tone, coreStartS: 0, coreEndS: 2 };
const pitchedChain = chainSegments([cSeg, dSeg, dSeg2]);
assert.equal(pitchedChain.joins[0].pitchSemitones, -2);
assert.equal(pitchedChain.joins[1].pitchSemitones, -2, 'third segment must also shift toward C, not stay in D');

// 11. Default cores without supplied downbeats still snap to a BPM-derived bar grid
const gridBeats = deriveDownbeats({
  bpm: 120,
  sampleRate: sr,
  channels: makeSine(sr * 8, sr, 220, { amp: 0.2 }),
  coreStartS: 0,
  coreEndS: 4.3,
});
assert.ok(gridBeats.some(t => Math.abs(t - 0) < 1e-9));
assert.ok(gridBeats.some(t => Math.abs(t - 2) < 1e-9));
assert.ok(gridBeats.some(t => Math.abs(t - 4) < 1e-9));
const offGridA = {
  id: 'og-a',
  bpm: 120,
  key: 'C major',
  sampleRate: sr,
  channels: makeSine(sr * 6, sr, 220, { amp: 0.3 }),
  coreStartS: 0,
  coreEndS: 4.3,
};
const offGridB = {
  id: 'og-b',
  bpm: 120,
  key: 'C major',
  sampleRate: sr,
  channels: makeSine(sr * 6, sr, 220, { amp: 0.3 }),
  coreStartS: 0,
  coreEndS: 4,
};
const snapped = chainSegments([offGridA, offGridB], { xfadeBars: 0.5 });
assert.ok(Math.abs(snapped.joins[0].joinS - 4) < 0.02, `default-core path should snap 4.3s core end to the 4.0s downbeat, got ${snapped.joins[0].joinS}`);

// 12. Loop fold must mark a join that lands in the trimmed tail as unavailable
const longA = {
  id: 'lp0',
  bpm: 120,
  key: 'C major',
  sampleRate: sr,
  channels: makeSine(sr * 8, sr, 220, { amp: 0.3 }),
  coreStartS: 0,
  coreEndS: 8,
};
const longB = {
  id: 'lp1',
  bpm: 120,
  key: 'C major',
  sampleRate: sr,
  channels: makeSine(sr * 2, sr, 220, { amp: 0.3 }),
  coreStartS: 0,
  coreEndS: 2,
};
const looped = chainSegments([longA, longB], { loop: true, xfadeBars: 0.75 });
assert.ok(looped.wrapClick, 'looped chain should include wrapClick');
const foldedSeam = looped.joins.find(j => j.seam?.unavailable);
assert.ok(foldedSeam, 'join that fell into the folded loop tail must be marked unavailable');
assert.equal(foldedSeam.seam.reason, 'join_folded_into_loop_seam');
for (const j of looped.joins) {
  if (!j.seam?.unavailable) {
    assert.ok(j.joinSample < looped.channels[0].length);
  }
}

// 13. planChain skipped items remain available to the caller (UI keeps them)
const planSkip = planChain([
  { id: 'keep-a', role: 'intro', bpm: 90, key: 'C major', coreStartS: 0, coreEndS: 4 },
  { id: 'keep-b', role: 'hook', bpm: 90, key: 'C major', coreStartS: 0, coreEndS: 4 },
  { id: 'skip-fast', role: 'bridge', bpm: 140, key: 'C major', coreStartS: 0, coreEndS: 4 },
]);
assert.ok(planSkip.items.some(s => s.id === 'keep-a') && planSkip.items.some(s => s.id === 'keep-b'));
assert.equal(planSkip.skipped.length, 1);
assert.equal(planSkip.skipped[0].id, 'skip-fast');
assert.ok(!planSkip.items.some(s => s.id === 'skip-fast'));


// 14. Build output & repo hygiene checks
const chainerSrc = await fs.readFile(new URL('../dist/chainer.js', import.meta.url), 'utf8');
const chainerUiSrc = await fs.readFile(new URL('../dist/chainer-ui.js', import.meta.url), 'utf8');
const selfSrc = await fs.readFile(new URL('./chainer-check.mjs', import.meta.url), 'utf8');
const siteChainer = await fs.readFile(new URL('../release/site/chainer.js', import.meta.url), 'utf8');
const siteChainerUi = await fs.readFile(new URL('../release/site/chainer-ui.js', import.meta.url), 'utf8');
const standaloneHtml = await fs.readFile(new URL('../release/SONORI.html', import.meta.url), 'utf8');

assert.equal(siteChainer, chainerSrc, 'release/site/chainer.js must match dist/chainer.js');
assert.equal(siteChainerUi, chainerUiSrc, 'release/site/chainer-ui.js must match dist/chainer-ui.js');
assert.doesNotMatch(standaloneHtml, /wsolaStretch|scoreCompatibility/, 'chainer.js must NOT be inlined into release/SONORI.html');
assert.ok(Buffer.byteLength(standaloneHtml) < 500_000, `standalone size ${Buffer.byteLength(standaloneHtml)} must stay < 500,000 bytes`);

// Hygiene patterns constructed via char codes so forbidden tokens never appear in test source.
const forbidden = [
  [115, 111, 110, 111, 114, 105, 45, 108, 105, 98, 114, 97, 114, 121],
  [101, 108, 101, 118, 101, 110],
  [99, 111, 114, 97, 108, 100, 105, 99, 101, 45, 98, 103, 109],
  [47, 119, 111, 114, 107, 115, 112, 97, 99, 101, 47],
].map(codes => new RegExp(String.fromCharCode(...codes), 'i'));

for (const [label, text] of [['dist/chainer.js', chainerSrc], ['dist/chainer-ui.js', chainerUiSrc], ['checks/chainer-check.mjs', selfSrc]]) {
  for (const rx of forbidden) {
    assert.doesNotMatch(text, rx, `${label} failed repo hygiene check`);
  }
}

console.log(
  `chainer-check: compatibility, caps (±3%/±2st), equal-power xfade, downbeat alignment, adjacent cut (join/p99=${adjChain.joins[0].seam.join_over_p99.toFixed(4)}), wrap metric (${foldedWrap.ratio.toFixed(3)} vs ${hardWrap.ratio.toFixed(3)}), planChain, tempo reject, mixed-mode key, 3-segment pitch, loop-fold seams, and hygiene passed`,
);
