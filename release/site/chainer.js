/**
 * Pure-JS user-supplied audio segment chainer (SONORI 1.8 additive tool).
 * Scores compatibility within strict tempo (±3%) and pitch (±2 st) caps,
 * plans segment order, aligns downbeats, blends with equal-power crossfades,
 * and measures seam/loop click metrics. Works in both Node and browsers.
 */
import { foldLoop, mixCrossfade } from './audio.js';

export const CHAINER_LIMITS = Object.freeze({
  maxTempoStretch: 0.03,
  minTempoScale: 0.97,
  maxTempoScale: 1.03,
  maxPitchSemitones: 2,
  adjacentToleranceS: 0.02,
});

const EPS = 1e-6;
const NOTE_TO_PC = {
  C: 0, 'B#': 0,
  'C#': 1, DB: 1,
  D: 2,
  'D#': 3, EB: 3,
  E: 4, FB: 4,
  F: 5, 'E#': 5,
  'F#': 6, GB: 6,
  G: 7,
  'G#': 8, AB: 8,
  A: 9,
  'A#': 10, BB: 10,
  B: 11, CB: 11,
};
const PC_NAMES = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'];

const ROLE_ALIAS = {
  intro: 'intro',
  verse: 'verse',
  verse2: 'verse',
  pre: 'pre',
  prechorus: 'pre',
  hook: 'hook',
  chorus: 'hook',
  chorus2: 'hook',
  bridge: 'bridge',
  break: 'break',
  breakdown: 'break',
  ending: 'ending',
  outro: 'ending',
};

const ROLE_START_PRIORITY = {
  intro: 0,
  verse: 1,
  pre: 2,
  hook: 3,
  bridge: 4,
  break: 5,
  ending: 6,
};

const ROLE_TRANSITIONS = {
  intro: { verse: 0.1, hook: 0.1, pre: 0.08, bridge: 0.02, break: 0, ending: -0.04, intro: -0.06 },
  verse: { pre: 0.1, hook: 0.1, bridge: 0.07, break: 0.06, verse: 0.05, ending: 0.02, intro: -0.06 },
  pre: { hook: 0.1, bridge: 0.04, break: 0.04, verse: 0, ending: -0.02, intro: -0.06, pre: -0.04 },
  hook: { hook: 0.08, bridge: 0.1, break: 0.09, verse: 0.06, ending: 0.1, pre: 0.02, intro: -0.06 },
  bridge: { hook: 0.1, break: 0.07, ending: 0.08, verse: 0.05, pre: 0.06, bridge: -0.02, intro: -0.06 },
  break: { hook: 0.1, verse: 0.07, bridge: 0.05, ending: 0.08, pre: 0.06, break: -0.04, intro: -0.06 },
  ending: { intro: -0.08, verse: -0.08, pre: -0.08, hook: -0.08, bridge: -0.08, break: -0.08, ending: -0.08 },
};

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const finite = (value, fallback) => (Number.isFinite(Number(value)) ? Number(value) : fallback);

function normalizeRole(role) {
  if (typeof role !== 'string') return '';
  const key = role.trim().toLowerCase().replace(/[\s_-]+/g, '');
  return ROLE_ALIAS[key] || '';
}

function signedSemitoneDiff(targetPc, sourcePc) {
  const diff = ((targetPc - sourcePc) % 12 + 12) % 12;
  return diff > 6 ? diff - 12 : diff;
}

/**
 * Parse a musical key string (e.g. 'F# major', 'D# minor', 'Eb minor', 'Am')
 * or object ({ tonic, mode }) into canonical pitch-class metadata.
 */
export function parseKey(key) {
  if (key == null) return null;
  let tonic = null;
  let mode = 'major';

  if (typeof key === 'object') {
    if (typeof key.tonic === 'number' && Number.isFinite(key.tonic)) {
      tonic = ((Math.round(key.tonic) % 12) + 12) % 12;
    } else if (typeof key.tonic === 'string') {
      const clean = key.tonic.trim().replace(/♯/g, '#').replace(/♭/g, 'b').toUpperCase();
      if (Object.hasOwn(NOTE_TO_PC, clean)) tonic = NOTE_TO_PC[clean];
    }
    const rawMode = String(key.mode || 'major').trim().toLowerCase();
    mode = rawMode.startsWith('min') || rawMode === 'm' ? 'minor' : 'major';
  } else if (typeof key === 'string') {
    const clean = key.trim().replace(/♯/g, '#').replace(/♭/g, 'b');
    if (!clean) return null;
    const match = /^([A-Ga-g])([#b]?)\s*(.*)$/.exec(clean);
    if (!match) return null;
    const note = (match[1] + match[2]).toUpperCase();
    if (!Object.hasOwn(NOTE_TO_PC, note)) return null;
    tonic = NOTE_TO_PC[note];
    const suffix = match[3].trim().toLowerCase();
    if (suffix === 'm' || suffix.startsWith('min')) mode = 'minor';
    else if (!suffix || suffix === 'maj' || suffix.startsWith('maj')) mode = 'major';
    else mode = suffix.includes('min') ? 'minor' : 'major';
  }

  if (tonic === null) return null;
  const majorFamily = mode === 'minor' ? (tonic + 3) % 12 : tonic;
  return {
    tonic,
    mode,
    majorFamily,
    label: `${PC_NAMES[tonic]} ${mode}`,
  };
}

function matchBpmFamily(targetBpm, srcBpm) {
  const candidates = [
    { bpm: srcBpm, relation: 'same', factor: 1 },
    { bpm: srcBpm * 2, relation: 'double', factor: 2 },
    { bpm: srcBpm * 0.5, relation: 'half', factor: 0.5 },
  ];
  let best = candidates[0];
  let bestErr = Math.abs(targetBpm / best.bpm - 1);
  for (let i = 1; i < candidates.length; i++) {
    const err = Math.abs(targetBpm / candidates[i].bpm - 1);
    if (err < bestErr - 1e-9) {
      best = candidates[i];
      bestErr = err;
    }
  }
  const rawTempoScale = targetBpm / best.bpm;
  return { ...best, rawTempoScale };
}

function evaluateKeyMatch(keyA, keyB) {
  const a = parseKey(keyA);
  const b = parseKey(keyB);
  if (!a || !b) {
    return { pitchSemitones: 0, keyScore: 0.6, keyRelation: 'unknown' };
  }
  if (a.tonic === b.tonic && a.mode === b.mode) {
    return { pitchSemitones: 0, keyScore: 1.0, keyRelation: 'same' };
  }
  if (a.mode !== b.mode && a.majorFamily === b.majorFamily) {
    return { pitchSemitones: 0, keyScore: 0.95, keyRelation: 'relative' };
  }
  if (a.mode !== b.mode && a.tonic === b.tonic) {
    return { pitchSemitones: 0, keyScore: 0.85, keyRelation: 'parallel' };
  }
  const tonicDiff = signedSemitoneDiff(a.tonic, b.tonic);
  // Pitch-shift only when tonic distance is within the cap. Relative/parallel
  // cases already returned 0 st above. Do not use "family" distance as a
  // shortcut for mixed-mode keys whose tonics are farther than ±2 st
  // (e.g. C major vs G minor is 7 st, not a +2 st family hop).
  if (Math.abs(tonicDiff) <= CHAINER_LIMITS.maxPitchSemitones) {
    return {
      pitchSemitones: tonicDiff,
      keyScore: (a.mode === b.mode ? 0.85 : 0.72) - 0.1 * Math.abs(tonicDiff),
      keyRelation: a.mode === b.mode ? 'nearby' : 'nearby_parallel',
    };
  }
  return { pitchSemitones: 0, keyScore: a.mode === b.mode ? 0.25 : 0.2, keyRelation: 'rhythm_only' };
}

/**
 * Resolve both buffer-local core bounds and source-track core bounds.
 * Supports either buffer-local coreStartS/coreEndS (+ optional startS)
 * or track-global coreStartS/coreEndS.
 */
function resolveSegmentBounds(seg) {
  const sampleRate = Math.max(1000, Math.round(finite(seg?.sampleRate, 44100)));
  const frames = seg?.channels?.[0]?.length || 0;
  const bufDur = frames > 0 ? frames / sampleRate : Math.max(0, finite(seg?.endS, 0) - finite(seg?.startS, 0));
  const hasStart = Number.isFinite(Number(seg?.startS));
  const startS = hasStart ? Number(seg.startS) : 0;
  const rawCoreStart = Number.isFinite(Number(seg?.coreStartS)) ? Number(seg.coreStartS) : 0;
  const rawCoreEnd = Number.isFinite(Number(seg?.coreEndS)) ? Number(seg.coreEndS) : (hasStart && bufDur === 0 ? startS : bufDur);

  let localCoreStartS;
  let localCoreEndS;
  let trackCoreStartS;
  let trackCoreEndS;

  if (frames > 0) {
    if (hasStart) {
      const fitsLocal = rawCoreStart >= -1e-3 && rawCoreEnd <= bufDur + 1e-3 && rawCoreEnd >= rawCoreStart;
      const fitsGlobal = rawCoreStart >= startS - 1e-3 && rawCoreEnd <= startS + bufDur + 1e-3 && rawCoreEnd >= rawCoreStart;
      if (fitsLocal && !(rawCoreStart >= startS - 1e-3 && startS > 1e-3 && rawCoreEnd > bufDur + 1e-3)) {
        localCoreStartS = clamp(rawCoreStart, 0, bufDur);
        localCoreEndS = clamp(rawCoreEnd, localCoreStartS, bufDur);
        trackCoreStartS = startS + localCoreStartS;
        trackCoreEndS = startS + localCoreEndS;
      } else if (fitsGlobal) {
        trackCoreStartS = rawCoreStart;
        trackCoreEndS = rawCoreEnd;
        localCoreStartS = clamp(rawCoreStart - startS, 0, bufDur);
        localCoreEndS = clamp(rawCoreEnd - startS, localCoreStartS, bufDur);
      } else {
        localCoreStartS = clamp(rawCoreStart, 0, bufDur);
        localCoreEndS = clamp(rawCoreEnd, localCoreStartS, bufDur);
        trackCoreStartS = startS + localCoreStartS;
        trackCoreEndS = startS + localCoreEndS;
      }
    } else if (rawCoreEnd > bufDur + 1e-3 || rawCoreStart > bufDur - 1e-3) {
      // Track-global coordinates provided without startS.
      trackCoreStartS = rawCoreStart;
      trackCoreEndS = Math.max(rawCoreStart, rawCoreEnd);
      localCoreStartS = 0;
      localCoreEndS = clamp(trackCoreEndS - trackCoreStartS, 0, bufDur);
    } else {
      localCoreStartS = clamp(rawCoreStart, 0, bufDur);
      localCoreEndS = clamp(rawCoreEnd, localCoreStartS, bufDur);
      trackCoreStartS = localCoreStartS;
      trackCoreEndS = localCoreEndS;
    }
  } else {
    localCoreStartS = Math.max(0, rawCoreStart);
    localCoreEndS = Math.max(localCoreStartS, rawCoreEnd);
    trackCoreStartS = hasStart && rawCoreEnd <= (finite(seg?.endS, startS + localCoreEndS) - startS + 1e-3)
      ? startS + localCoreStartS
      : localCoreStartS;
    trackCoreEndS = hasStart && rawCoreEnd <= (finite(seg?.endS, startS + localCoreEndS) - startS + 1e-3)
      ? startS + localCoreEndS
      : localCoreEndS;
  }

  return {
    sampleRate,
    frames,
    bufDur,
    localCoreStartS,
    localCoreEndS,
    trackCoreStartS,
    trackCoreEndS,
  };
}

/**
 * Score compatibility for joining segment `b` immediately after segment `a`.
 * Rejects pairs requiring > ±3% time-stretch. Never forces > ±2 st pitch shift.
 */
export function scoreCompatibility(a, b, options = {}) {
  const bpmA = finite(a?.bpm, 0);
  const bpmB = finite(b?.bpm, 0);
  const sameTrack = Boolean(a?.trackId && b?.trackId && a.trackId === b.trackId);
  const boundsA = resolveSegmentBounds(a);
  const boundsB = resolveSegmentBounds(b);
  const adjacentCores = sameTrack
    && Math.abs(boundsA.trackCoreEndS - boundsB.trackCoreStartS) <= CHAINER_LIMITS.adjacentToleranceS;

  if (bpmA <= 0 || bpmB <= 0) {
    return {
      ok: false,
      score: 0,
      reason: 'invalid_bpm',
      tempoScale: 1,
      rawTempoScale: 1,
      tempoClamped: false,
      bpmRelation: 'invalid',
      pitchSemitones: 0,
      keyRelation: 'unknown',
      sameTrack,
      adjacentCores,
      roleBonus: 0,
    };
  }

  const explicitTargetBpm = Number.isFinite(Number(options?.targetBpm)) && Number(options.targetBpm) > 0
    ? Number(options.targetBpm)
    : null;
  const targetBpm = explicitTargetBpm ?? bpmA;
  const matchA = explicitTargetBpm ? matchBpmFamily(targetBpm, bpmA) : { rawTempoScale: 1, relation: 'same' };
  const matchB = matchBpmFamily(targetBpm, bpmB);

  const withinCap = scale => scale >= CHAINER_LIMITS.minTempoScale - EPS && scale <= CHAINER_LIMITS.maxTempoScale + EPS;
  const tempoOk = withinCap(matchA.rawTempoScale) && withinCap(matchB.rawTempoScale);

  const roleA = normalizeRole(a?.role);
  const roleB = normalizeRole(b?.role);
  const roleBonus = roleA && roleB ? (ROLE_TRANSITIONS[roleA]?.[roleB] ?? 0) : 0;

  const keyTarget = options?.targetKey ?? a?.key;
  const keyMatch = evaluateKeyMatch(keyTarget, b?.key);

  if (!tempoOk) {
    return {
      ok: false,
      score: 0,
      reason: `tempo_out_of_range (${bpmA} vs ${bpmB} BPM)`,
      tempoScale: 1,
      rawTempoScale: matchB.rawTempoScale,
      tempoClamped: false,
      bpmRelation: matchB.relation,
      pitchSemitones: 0,
      keyRelation: keyMatch.keyRelation,
      sameTrack,
      adjacentCores,
      roleBonus,
    };
  }

  const tempoScale = Math.abs(matchB.rawTempoScale - 1) < EPS
    ? 1
    : clamp(matchB.rawTempoScale, CHAINER_LIMITS.minTempoScale, CHAINER_LIMITS.maxTempoScale);

  const stretchFrac = Math.abs(tempoScale - 1) / CHAINER_LIMITS.maxTempoStretch;
  const tempoScore = (1 - stretchFrac * 0.35) * (matchB.relation === 'same' ? 1 : 0.9);
  const tempoPart = 0.30 * tempoScore;
  const keyPart = 0.30 * keyMatch.keyScore;
  const sameTrackPart = sameTrack ? 0.15 : 0;
  const adjacentPart = adjacentCores ? 0.15 : 0;
  const rolePart = clamp(0.05 + 0.5 * roleBonus, 0, 0.10);
  const score = Math.round((tempoPart + keyPart + sameTrackPart + adjacentPart + rolePart) * 10000) / 10000;

  let reason = 'compatible';
  if (adjacentCores) reason = 'same_track_adjacent_cores';
  else if (sameTrack) reason = 'same_track';
  else if (keyMatch.keyRelation === 'relative') reason = 'relative_key';
  else if (keyMatch.keyRelation === 'rhythm_only') reason = 'rhythm_only_key_mismatch';
  else if (Math.abs(tempoScale - 1) > EPS) reason = 'tempo_stretched_within_cap';

  return {
    ok: true,
    score,
    reason,
    tempoScale,
    rawTempoScale: matchB.rawTempoScale,
    tempoClamped: false,
    bpmRelation: matchB.relation,
    pitchSemitones: keyMatch.pitchSemitones,
    keyRelation: keyMatch.keyRelation,
    sameTrack,
    adjacentCores,
    roleBonus,
  };
}

/**
 * Plan segment order preferring same-track adjacent cores first, then other
 * same-track joins, then compatible cross-track joins. Incompatible segments
 * are left out and reported in `notes` and `skipped`.
 */
export function planChain(segments, { targetBpm, targetKey } = {}) {
  const list = Array.isArray(segments) ? segments.filter(Boolean) : [];
  const notes = [];
  if (list.length <= 1) {
    if (list.length === 1) notes.push(`Single segment ${list[0].id ?? 0}.`);
    return { items: list.slice(), joins: [], skipped: [], notes };
  }

  const n = list.length;
  const bounds = list.map(resolveSegmentBounds);
  const compatMatrix = Array.from({ length: n }, (_, i) =>
    Array.from({ length: n }, (_, j) => (i === j ? null : scoreCompatibility(list[i], list[j], { targetBpm, targetKey }))));

  const hasAdjacentPred = idx => list.some((_, i) => i !== idx && compatMatrix[i][idx]?.ok && compatMatrix[i][idx].adjacentCores);

  const adjacentRunLength = startIdx => {
    let len = 1;
    let cur = startIdx;
    const seen = new Set([cur]);
    while (true) {
      let next = -1;
      for (let j = 0; j < n; j++) {
        if (!seen.has(j) && compatMatrix[cur][j]?.ok && compatMatrix[cur][j].adjacentCores) {
          next = j;
          break;
        }
      }
      if (next < 0) break;
      seen.add(next);
      cur = next;
      len += 1;
    }
    return len;
  };

  // Pick starting segment: prefer non-mid-run heads, intro role, longest adjacent run, earliest core.
  const indices = Array.from({ length: n }, (_, i) => i);
  const eligibleStart = targetBpm
    ? indices.filter(i => {
      const m = matchBpmFamily(targetBpm, finite(list[i].bpm, 0));
      return m.rawTempoScale >= CHAINER_LIMITS.minTempoScale - EPS && m.rawTempoScale <= CHAINER_LIMITS.maxTempoScale + EPS;
    })
    : indices;
  const startPool = eligibleStart.length ? eligibleStart : indices;

  startPool.sort((a, b) => {
    const predDiff = Number(hasAdjacentPred(a)) - Number(hasAdjacentPred(b));
    if (predDiff !== 0) return predDiff;
    const roleA = ROLE_START_PRIORITY[normalizeRole(list[a].role)] ?? 3;
    const roleB = ROLE_START_PRIORITY[normalizeRole(list[b].role)] ?? 3;
    if (roleA !== roleB) return roleA - roleB;
    const runDiff = adjacentRunLength(b) - adjacentRunLength(a);
    if (runDiff !== 0) return runDiff;
    if (bounds[a].trackCoreStartS !== bounds[b].trackCoreStartS) {
      return bounds[a].trackCoreStartS - bounds[b].trackCoreStartS;
    }
    return a - b;
  });

  const used = new Set([startPool[0]]);
  const order = [startPool[0]];
  const joins = [];

  while (used.size < n) {
    const cur = order[order.length - 1];
    const remaining = indices.filter(i => !used.has(i));
    const candidates = remaining
      .map(idx => ({ idx, compat: compatMatrix[cur][idx] }))
      .filter(entry => entry.compat?.ok);

    if (!candidates.length) break;

    const hasRemainingAdjacentPred = idx => remaining.some(i => i !== idx && compatMatrix[i][idx]?.ok && compatMatrix[i][idx].adjacentCores);

    candidates.sort((x, y) => {
      const tier = entry => (entry.compat.adjacentCores ? 0 : entry.compat.sameTrack ? 1 : 2);
      const tDiff = tier(x) - tier(y);
      if (tDiff !== 0) return tDiff;
      if (tier(x) > 0) {
        const headDiff = Number(hasRemainingAdjacentPred(x.idx)) - Number(hasRemainingAdjacentPred(y.idx));
        if (headDiff !== 0) return headDiff;
      }
      if (y.compat.score !== x.compat.score) return y.compat.score - x.compat.score;
      if (bounds[x.idx].trackCoreStartS !== bounds[y.idx].trackCoreStartS) {
        return bounds[x.idx].trackCoreStartS - bounds[y.idx].trackCoreStartS;
      }
      return x.idx - y.idx;
    });

    const chosen = candidates[0];
    used.add(chosen.idx);
    order.push(chosen.idx);
    joins.push({
      from: list[cur].id ?? cur,
      to: list[chosen.idx].id ?? chosen.idx,
      ...chosen.compat,
    });
    notes.push(
      `${list[cur].id ?? cur} -> ${list[chosen.idx].id ?? chosen.idx}: ${chosen.compat.reason} (score ${chosen.compat.score.toFixed(3)}, tempo ${chosen.compat.tempoScale.toFixed(4)}x, pitch ${chosen.compat.pitchSemitones >= 0 ? '+' : ''}${chosen.compat.pitchSemitones} st)`
    );
  }

  const skipped = indices.filter(i => !used.has(i)).map(i => list[i]);
  for (const seg of skipped) {
    const cur = list[order[order.length - 1]];
    const check = scoreCompatibility(cur, seg, { targetBpm, targetKey });
    notes.push(`Skipped ${seg.id ?? 'segment'}: ${check.reason}`);
  }

  return {
    items: order.map(i => list[i]),
    joins,
    skipped,
    notes,
  };
}

/** Catmull-Rom cubic resampling. `ratio > 1` raises pitch and shortens output. */
function resampleChannels(channels, ratio) {
  if (!channels.length || !channels[0].length) return channels.map(ch => ch.slice());
  if (Math.abs(ratio - 1) < EPS) return channels.map(ch => ch.slice());
  const inLen = channels[0].length;
  const outLen = Math.max(1, Math.round(inLen / ratio));
  return channels.map(ch => {
    const out = new Float32Array(outLen);
    const last = inLen - 1;
    for (let i = 0; i < outLen; i++) {
      const pos = i * ratio;
      const idx = Math.floor(pos);
      const t = pos - idx;
      const p0 = ch[Math.max(0, Math.min(last, idx - 1))];
      const p1 = ch[Math.max(0, Math.min(last, idx))];
      const p2 = ch[Math.max(0, Math.min(last, idx + 1))];
      const p3 = ch[Math.max(0, Math.min(last, idx + 2))];
      const a0 = -0.5 * p0 + 1.5 * p1 - 1.5 * p2 + 0.5 * p3;
      const a1 = p0 - 2.5 * p1 + 2 * p2 - 0.5 * p3;
      const a2 = -0.5 * p0 + 0.5 * p2;
      out[i] = ((a0 * t + a1) * t + a2) * t + p1;
    }
    return out;
  });
}

/**
 * Internal WSOLA (Waveform Similarity Overlap-Add) time-scale engine.
 * `rate = targetTempo / srcTempo`: `rate > 1` shortens duration, `rate < 1` lengthens.
 */
function wsolaStretch(channels, sampleRate, rate) {
  if (!channels.length || !channels[0].length || Math.abs(rate - 1) < EPS) {
    return channels.map(ch => ch.slice());
  }
  const inLen = channels[0].length;
  const outLen = Math.max(1, Math.round(inLen / rate));
  const winSize = Math.max(64, Math.round(sampleRate * 0.044) & ~1);
  if (inLen < winSize * 2 || outLen < winSize) {
    return resampleChannels(channels, rate);
  }
  const synHop = winSize >> 1;
  const searchRadius = Math.max(16, Math.min(synHop - 1, Math.round(sampleRate * 0.008)));
  const stride = sampleRate >= 22050 ? 4 : 2;

  const hann = new Float32Array(winSize);
  for (let i = 0; i < winSize; i++) {
    hann[i] = 0.5 * (1 - Math.cos((2 * Math.PI * i) / winSize));
  }

  // Mono guide track for stereo-coherent lag selection.
  const guide = channels.length === 1
    ? channels[0]
    : (() => {
      const mono = new Float32Array(inLen);
      const inv = 1 / channels.length;
      for (let i = 0; i < inLen; i++) {
        let sum = 0;
        for (let c = 0; c < channels.length; c++) sum += channels[c][i];
        mono[i] = sum * inv;
      }
      return mono;
    })();

  const out = channels.map(() => new Float32Array(outLen));
  const norm = new Float32Array(outLen);

  // Copy initial half-window cleanly at t = 0.
  for (let i = 0; i < winSize && i < outLen && i < inLen; i++) {
    const w = i < synHop ? 1 : hann[i];
    for (let c = 0; c < channels.length; c++) out[c][i] += channels[c][i] * w;
    norm[i] += w;
  }

  let prevInPos = 0;
  for (let outPos = synHop; outPos < outLen; outPos += synHop) {
    const targetIn = Math.round(outPos * rate);
    const refStart = prevInPos + synHop;
    const minLag = Math.max(0, targetIn - searchRadius);
    const maxLag = Math.min(Math.max(0, inLen - winSize), targetIn + searchRadius);

    let bestPos = clamp(targetIn, 0, Math.max(0, inLen - winSize));
    if (refStart + synHop <= inLen && maxLag > minLag) {
      let bestScore = -Infinity;
      const evalLag = (pos, step) => {
        let dot = 0;
        let eRef = 0;
        let eCand = 0;
        for (let k = 0; k < synHop; k += step) {
          const r = guide[refStart + k];
          const v = guide[pos + k];
          dot += r * v;
          eRef += r * r;
          eCand += v * v;
        }
        const denom = Math.sqrt(eRef * eCand);
        return denom > 1e-9 ? dot / denom : 0;
      };
      for (let pos = minLag; pos <= maxLag; pos += stride) {
        const s = evalLag(pos, stride);
        if (s > bestScore) {
          bestScore = s;
          bestPos = pos;
        }
      }
      const fineMin = Math.max(minLag, bestPos - stride);
      const fineMax = Math.min(maxLag, bestPos + stride);
      for (let pos = fineMin; pos <= fineMax; pos++) {
        const s = evalLag(pos, 1);
        if (s > bestScore) {
          bestScore = s;
          bestPos = pos;
        }
      }
    }

    const avail = Math.min(winSize, outLen - outPos, inLen - bestPos);
    for (let i = 0; i < avail; i++) {
      const w = hann[i];
      for (let c = 0; c < channels.length; c++) out[c][outPos + i] += channels[c][bestPos + i] * w;
      norm[outPos + i] += w;
    }
    prevInPos = bestPos;
  }

  for (let i = 0; i < outLen; i++) {
    if (norm[i] > 1e-6 && Math.abs(norm[i] - 1) > 1e-6) {
      const inv = 1 / norm[i];
      for (let c = 0; c < channels.length; c++) out[c][i] *= inv;
    }
  }
  return out;
}

/**
 * Pure-JS time-stretch clamped to ±3% (`0.97–1.03`).
 */
export function timeStretch(channels, sampleRate, requestedTempoScale) {
  const req = finite(requestedTempoScale, 1);
  const clampedScale = clamp(req, CHAINER_LIMITS.minTempoScale, CHAINER_LIMITS.maxTempoScale);
  const clamped = Math.abs(clampedScale - req) > EPS;
  const effectiveScale = Math.abs(clampedScale - 1) < EPS ? 1 : clampedScale;
  const out = wsolaStretch(channels, Math.max(1000, Math.round(finite(sampleRate, 44100))), effectiveScale);
  return {
    channels: out,
    tempoScale: effectiveScale,
    requestedTempoScale: req,
    clamped,
  };
}

/**
 * Pure-JS pitch-shift preserving duration, clamped to ±2 semitones.
 */
export function pitchShift(channels, sampleRate, requestedSemitones) {
  const req = finite(requestedSemitones, 0);
  const clampedSt = clamp(req, -CHAINER_LIMITS.maxPitchSemitones, CHAINER_LIMITS.maxPitchSemitones);
  const clamped = Math.abs(clampedSt - req) > EPS;
  const effectiveSt = Math.abs(clampedSt) < EPS ? 0 : clampedSt;
  if (effectiveSt === 0) {
    return {
      channels: channels.map(ch => ch.slice()),
      pitchSemitones: 0,
      requestedPitchSemitones: req,
      clamped,
    };
  }
  const pitchRatio = 2 ** (effectiveSt / 12);
  const stretched = wsolaStretch(channels, Math.max(1000, Math.round(finite(sampleRate, 44100))), 1 / pitchRatio);
  const shifted = resampleChannels(stretched, pitchRatio);
  // Match exact original frame count.
  const targetLen = channels[0]?.length || 0;
  const fitted = shifted.map(ch => {
    if (ch.length === targetLen) return ch;
    const out = new Float32Array(targetLen);
    out.set(ch.subarray(0, Math.min(targetLen, ch.length)));
    return out;
  });
  return {
    channels: fitted,
    pitchSemitones: effectiveSt,
    requestedPitchSemitones: req,
    clamped,
  };
}

function adaptSegmentAudio(channels, sampleRate, tempoScale, pitchSemitones) {
  const hasTempo = Math.abs(tempoScale - 1) >= EPS;
  const hasPitch = Math.abs(pitchSemitones) >= EPS;
  if (!hasTempo && !hasPitch) return channels.map(ch => ch.slice());
  if (!hasPitch) return wsolaStretch(channels, sampleRate, tempoScale);
  const pitchRatio = 2 ** (pitchSemitones / 12);
  const internalRate = tempoScale / pitchRatio;
  const stretched = wsolaStretch(channels, sampleRate, internalRate);
  const resampled = resampleChannels(stretched, pitchRatio);
  const targetLen = Math.max(1, Math.round((channels[0]?.length || 0) / tempoScale));
  return resampled.map(ch => {
    if (ch.length === targetLen) return ch;
    const out = new Float32Array(targetLen);
    out.set(ch.subarray(0, Math.min(targetLen, ch.length)));
    return out;
  });
}

function normalizeChannelCount(channels, targetChannels) {
  if (channels.length === targetChannels) return channels;
  const len = channels[0]?.length || 0;
  const out = [];
  for (let c = 0; c < targetChannels; c++) {
    out.push(c < channels.length ? channels[c] : (channels[0] ? channels[0].slice() : new Float32Array(len)));
  }
  return out;
}

function nearestDownbeat(downbeats, targetS, minS, maxS, maxDistS) {
  if (!Array.isArray(downbeats) || !downbeats.length) return targetS;
  let best = null;
  let bestDist = Infinity;
  for (const raw of downbeats) {
    const t = Number(raw);
    if (!Number.isFinite(t) || t < minS - EPS || t > maxS + EPS) continue;
    const dist = Math.abs(t - targetS);
    if (dist < bestDist) {
      bestDist = dist;
      best = t;
    }
  }
  if (best !== null && bestDist <= maxDistS + EPS) return clamp(best, minS, maxS);
  return targetS;
}

function percentile(values, p) {
  if (!values.length) return 0;
  const sorted = Float64Array.from(values).sort();
  const idx = Math.min(sorted.length - 1, Math.max(0, Math.floor(p * (sorted.length - 1))));
  return sorted[idx];
}

function collectFrameHops(channels, startFrame, endFrame, out) {
  const from = Math.max(1, startFrame);
  const to = Math.min(channels[0].length - 1, endFrame);
  const chCount = channels.length;
  for (let i = from; i <= to; i++) {
    let maxHop = 0;
    for (let c = 0; c < chCount; c++) {
      const h = Math.abs(channels[c][i] - channels[c][i - 1]);
      if (h > maxHop) maxHop = h;
    }
    out.push(maxHop);
  }
}

function windowRms(channels, startFrame, endFrame) {
  const from = Math.max(0, startFrame);
  const to = Math.min(channels[0].length, endFrame);
  if (to <= from) return 0;
  let sumSq = 0;
  let count = 0;
  for (let c = 0; c < channels.length; c++) {
    const ch = channels[c];
    for (let i = from; i < to; i++) {
      const v = ch[i];
      sumSq += v * v;
    }
    count += to - from;
  }
  return count > 0 ? Math.sqrt(sumSq / count) : 0;
}

/** Iterative radix-2 Cooley-Tukey FFT (in-place) for compact spectral comparison. */
function fftRadix2(re, im) {
  const n = re.length;
  for (let i = 1, j = 0; i < n; i++) {
    let bit = n >> 1;
    for (; j & bit; bit >>= 1) j ^= bit;
    j ^= bit;
    if (i < j) {
      const tr = re[i]; re[i] = re[j]; re[j] = tr;
      const ti = im[i]; im[i] = im[j]; im[j] = ti;
    }
  }
  for (let len = 2; len <= n; len <<= 1) {
    const ang = (-2 * Math.PI) / len;
    const wlenRe = Math.cos(ang);
    const wlenIm = Math.sin(ang);
    const half = len >> 1;
    for (let i = 0; i < n; i += len) {
      let wRe = 1;
      let wIm = 0;
      for (let j = 0; j < half; j++) {
        const uRe = re[i + j];
        const uIm = im[i + j];
        const vRe = re[i + j + half] * wRe - im[i + j + half] * wIm;
        const vIm = re[i + j + half] * wIm + im[i + j + half] * wRe;
        re[i + j] = uRe + vRe;
        im[i + j] = uIm + vIm;
        re[i + j + half] = uRe - vRe;
        im[i + j + half] = uIm - vIm;
        const nextRe = wRe * wlenRe - wIm * wlenIm;
        wIm = wRe * wlenIm + wIm * wlenRe;
        wRe = nextRe;
      }
    }
  }
}

function averageSpectrum(channels, startFrame, endFrame, fftSize = 512) {
  const len = channels[0].length;
  const from = Math.max(0, startFrame);
  const to = Math.min(len, endFrame);
  const bins = (fftSize >> 1) + 1;
  const mag = new Float64Array(bins);
  if (to - from < 8) return mag;

  const size = to - from >= fftSize ? fftSize : 1 << Math.floor(Math.log2(to - from));
  const usedBins = (size >> 1) + 1;
  const hop = Math.max(1, size >> 1);
  const maxFrames = 4;
  const starts = [];
  for (let pos = from; pos + size <= to && starts.length < maxFrames; pos += hop) starts.push(pos);
  if (!starts.length) starts.push(from);

  const re = new Float64Array(size);
  const im = new Float64Array(size);
  const chCount = channels.length;

  for (const pos of starts) {
    for (let i = 0; i < size; i++) {
      let sum = 0;
      for (let c = 0; c < chCount; c++) sum += channels[c][pos + i] || 0;
      const w = 0.5 * (1 - Math.cos((2 * Math.PI * i) / size));
      re[i] = (sum / chCount) * w;
      im[i] = 0;
    }
    fftRadix2(re, im);
    for (let b = 0; b < usedBins; b++) {
      mag[b] += Math.hypot(re[b], im[b]);
    }
  }
  return mag.subarray(0, usedBins);
}

function spectralJumpDistance(specL, specR) {
  const n = Math.min(specL.length, specR.length);
  let dot = 0;
  let normL = 0;
  let normR = 0;
  for (let i = 0; i < n; i++) {
    dot += specL[i] * specR[i];
    normL += specL[i] * specL[i];
    normR += specR[i] * specR[i];
  }
  if (normL < 1e-12 && normR < 1e-12) return 0;
  if (normL < 1e-12 || normR < 1e-12) return 1;
  const cos = clamp(dot / Math.sqrt(normL * normR), 0, 1);
  return 1 - cos;
}

function classifyClickRatio(clickRatio, energyContinuity = 1, spectralJump = 0) {
  if (clickRatio <= 0.08 && energyContinuity >= 0.8 && spectralJump <= 0.25) return 'good';
  if (clickRatio <= 0.15 && energyContinuity >= 0.6 && spectralJump <= 0.45) return 'ok';
  if (clickRatio <= 0.21 && energyContinuity >= 0.4 && spectralJump <= 0.65) return 'fair';
  return 'bad';
}

/**
 * Measure seam quality at `joinSample` in already-blended audio.
 * Computes join/p99 against clean side windows (never centered on the join),
 * plus energy continuity (1 = equal RMS) and spectral jump (0 = identical).
 */
export function seamMetrics(channels, sampleRate, joinSample, { windowS = 1.2, xfadeS = 0 } = {}) {
  const rate = Math.max(1000, Math.round(finite(sampleRate, 44100)));
  const len = channels?.[0]?.length || 0;
  const j = clamp(Math.round(finite(joinSample, 0)), 1, Math.max(1, len - 1));
  if (len < 4) {
    return {
      join_over_p99: 0,
      click_residual_over_p99: 0,
      energy_continuity: 1,
      spectral_jump: 0,
      verdict: 'good',
      joinHop: 0,
      p99: 0,
      rmsBefore: 0,
      rmsAfter: 0,
      joinSample: j,
      windowS,
    };
  }

  let joinHop = 0;
  let clickResidual = 0;
  for (let c = 0; c < channels.length; c++) {
    const ch = channels[c];
    const h = Math.abs(ch[j] - ch[j - 1]);
    if (h > joinHop) joinHop = h;
    const prevSlope = j >= 2 ? ch[j - 1] - ch[j - 2] : 0;
    const nextSlope = j + 1 < len ? ch[j + 1] - ch[j] : prevSlope;
    const expectedSlope = 0.5 * (prevSlope + nextSlope);
    const res = Math.abs((ch[j] - ch[j - 1]) - expectedSlope);
    if (res > clickResidual) clickResidual = res;
  }

  const winFrames = Math.max(32, Math.round(Math.max(0.05, finite(windowS, 1.2)) * rate));
  const halfWin = Math.max(16, winFrames >> 1);
  const halfXfade = Math.max(0, Math.round(Math.max(0, finite(xfadeS, 0)) * rate * 0.5));
  const guard = Math.max(4, Math.min(Math.round(rate * 0.01), Math.floor(len * 0.05)));
  const exclude = Math.max(guard, halfXfade);

  const hops = [];
  const leftEnd = j - exclude;
  const leftStart = Math.max(1, leftEnd - halfWin);
  if (leftEnd > leftStart) collectFrameHops(channels, leftStart, leftEnd, hops);

  const rightStart = j + exclude;
  const rightEnd = Math.min(len - 1, rightStart + halfWin);
  if (rightEnd > rightStart) collectFrameHops(channels, rightStart, rightEnd, hops);

  // Fallback for very short buffers where exclude eats the whole buffer.
  if (hops.length < 8) {
    if (j > 2) collectFrameHops(channels, 1, j - 1, hops);
    if (j + 1 < len) collectFrameHops(channels, j + 1, len - 1, hops);
  }

  const p99 = percentile(hops, 0.99);
  const join_over_p99 = p99 > 1e-9 ? joinHop / p99 : (joinHop > 1e-9 ? Infinity : 0);
  const click_residual_over_p99 = p99 > 1e-9 ? clickResidual / p99 : (clickResidual > 1e-9 ? Infinity : 0);

  const sideFrames = Math.max(16, Math.min(halfWin, Math.round(rate * 0.4)));
  const rmsLeftEnd = Math.max(1, j - halfXfade);
  const rmsLeftStart = Math.max(0, rmsLeftEnd - sideFrames);
  const rmsRightStart = Math.min(len - 1, j + halfXfade);
  const rmsRightEnd = Math.min(len, rmsRightStart + sideFrames);
  const rmsBefore = windowRms(channels, rmsLeftStart, rmsLeftEnd);
  const rmsAfter = windowRms(channels, rmsRightStart, rmsRightEnd);
  const maxRms = Math.max(rmsBefore, rmsAfter);
  const energy_continuity = maxRms < 1e-9 ? 1 : Math.min(rmsBefore, rmsAfter) / maxRms;

  const specL = averageSpectrum(channels, rmsLeftStart, rmsLeftEnd);
  const specR = averageSpectrum(channels, rmsRightStart, rmsRightEnd);
  const spectral_jump = spectralJumpDistance(specL, specR);

  // A smooth continuous waveform cut at a zero crossing can have join_over_p99 ≈ 1
  // while its second-difference click residual is near 0; an actual step click has both large.
  const effectiveClick = join_over_p99 <= 1.05
    ? Math.min(join_over_p99, click_residual_over_p99)
    : join_over_p99;
  const verdict = classifyClickRatio(effectiveClick, energy_continuity, spectral_jump);

  return {
    join_over_p99,
    click_residual_over_p99,
    energy_continuity,
    spectral_jump,
    verdict,
    joinHop,
    p99,
    rmsBefore,
    rmsAfter,
    joinSample: j,
    windowS,
  };
}

/**
 * Wrap-around click metric for looped output:
 * |end[-1] - start[0]| / p99 of mid-file hops (default 1.2 s window).
 */
export function wrapClickMetric(channels, sampleRate, { windowS = 1.2 } = {}) {
  const rate = Math.max(1000, Math.round(finite(sampleRate, 44100)));
  const len = channels?.[0]?.length || 0;
  if (len < 4) {
    return { ratio: 0, join_over_p99: 0, wrapHop: 0, p99: 0, windowS, verdict: 'good' };
  }
  let wrapHop = 0;
  for (let c = 0; c < channels.length; c++) {
    const ch = channels[c];
    const h = Math.abs(ch[len - 1] - ch[0]);
    if (h > wrapHop) wrapHop = h;
  }
  const winFrames = Math.max(16, Math.min(len - 2, Math.round(Math.max(0.05, finite(windowS, 1.2)) * rate)));
  const mid = len >> 1;
  const start = Math.max(1, mid - (winFrames >> 1));
  const end = Math.min(len - 1, start + winFrames);
  const hops = [];
  collectFrameHops(channels, start, end, hops);
  const p99 = percentile(hops, 0.99);
  const ratio = p99 > 1e-9 ? wrapHop / p99 : (wrapHop > 1e-9 ? Infinity : 0);
  return {
    ratio,
    join_over_p99: ratio,
    wrapHop,
    p99,
    windowS,
    verdict: classifyClickRatio(ratio, 1, 0),
  };
}

/**
 * Chain an ordered list of audio segments into one continuous stereo/multi-channel buffer.
 * - Downbeat-aligned equal-power crossfades via `mixCrossfade` (from `./audio.js`).
 * - Same-track adjacent cores concatenate as a continuous cut (no +3 dB handle bump).
 * - Clamps time-stretch to ±3% and pitch-shift to ±2 st.
 */
/** Bar-start grid in buffer-local seconds, used when the caller has BPM but no downbeats. */
export function deriveDownbeats(seg, sampleRate = 44100) {
  const bpm = finite(seg?.bpm, 0);
  if (bpm <= 0) return [];
  const bounds = resolveSegmentBounds(seg);
  const frames = seg?.channels?.[0]?.length || 0;
  const durS = frames > 0 ? frames / Math.max(1000, Math.round(finite(seg?.sampleRate, sampleRate))) : Math.max(bounds.localCoreEndS, 0);
  const barS = (60 / bpm) * 4;
  const start = Number.isFinite(bounds.localCoreStartS) ? bounds.localCoreStartS : 0;
  const origin = start;
  const times = [];
  // Include one bar of pre-roll so handle xfades can snap, then every bar through the end.
  let t = origin;
  while (t > barS) t -= barS;
  while (t < -EPS) t += barS;
  for (; t <= durS + EPS; t += barS) times.push(Math.max(0, t));
  return times;
}

export function chainSegments(segments, {
  xfadeBars = 0.75,
  targetBpm,
  targetKey,
  startAtCore = false,
  loop = false,
  allowIncompatible = false,
} = {}) {
  const list = Array.isArray(segments) ? segments.filter(Boolean) : [];
  if (!list.length) {
    throw new Error('chainSegments requires at least one segment.');
  }

  const sampleRate = Math.max(1000, Math.round(finite(list[0].sampleRate, 44100)));
  const channelCount = Math.max(1, ...list.map(seg => seg.channels?.length || 1));
  const baseBpm = finite(targetBpm, finite(list[0].bpm, 120));
  const safeTargetBpm = baseBpm > 0 ? baseBpm : 120;
  const safeXfadeBars = Math.max(0, finite(xfadeBars, 0.75));
  const barS = (60 / safeTargetBpm) * 4;

  // Prepare each segment: resample to common sampleRate, clamp stretch/pitch, scale markers.
  const prepared = list.map((seg, index) => {
    const segRate = Math.max(1000, Math.round(finite(seg.sampleRate, sampleRate)));
    let chs = normalizeChannelCount(seg.channels, channelCount);
    if (segRate !== sampleRate) {
      chs = resampleChannels(chs, segRate / sampleRate);
    }

    const bounds = resolveSegmentBounds({ ...seg, sampleRate, channels: chs });
    const segBpm = finite(seg.bpm, safeTargetBpm);
    const bpmMatch = matchBpmFamily(safeTargetBpm, segBpm > 0 ? segBpm : safeTargetBpm);
    const explicitTempo = Number.isFinite(Number(seg.tempoScale));
    const requestedTempoScale = explicitTempo
      ? Number(seg.tempoScale)
      : (index === 0 && !Number.isFinite(Number(targetBpm)) ? 1 : bpmMatch.rawTempoScale);
    // Reject only when consecutive segments cannot join each other (or cannot
    // both reach an in-cap target). An explicit out-of-cap targetBpm still
    // clamps + flags, matching the documented override path.
    if (index > 0 && !allowIncompatible) {
      const pairOk = scoreCompatibility(list[index - 1], seg, { targetKey }).ok;
      const withinCap = scale => scale >= CHAINER_LIMITS.minTempoScale - EPS && scale <= CHAINER_LIMITS.maxTempoScale + EPS;
      const explicitTargetInCap = Number.isFinite(Number(targetBpm))
        && withinCap(matchBpmFamily(safeTargetBpm, finite(list[index - 1].bpm, safeTargetBpm)).rawTempoScale)
        && withinCap(matchBpmFamily(safeTargetBpm, segBpm > 0 ? segBpm : safeTargetBpm).rawTempoScale);
      const vsTargetOk = explicitTargetInCap
        ? scoreCompatibility(list[index - 1], seg, { targetBpm: safeTargetBpm, targetKey }).ok
        : pairOk;
      if (!pairOk || !vsTargetOk) {
        const fromId = list[index - 1].id ?? (index - 1);
        const toId = seg.id ?? index;
        const why = scoreCompatibility(list[index - 1], seg, explicitTargetInCap ? { targetBpm: safeTargetBpm, targetKey } : { targetKey });
        throw new Error(`chainSegments: incompatible segments ${fromId} → ${toId}: ${why.reason}`);
      }
    }
    const clampedTempo = clamp(requestedTempoScale, CHAINER_LIMITS.minTempoScale, CHAINER_LIMITS.maxTempoScale);
    const tempoClamped = Math.abs(clampedTempo - requestedTempoScale) > EPS;
    const tempoScale = Math.abs(clampedTempo - 1) < EPS ? 1 : clampedTempo;

    const referenceKey = targetKey != null ? targetKey : list[0].key;
    let requestedPitch = 0;
    if (Number.isFinite(Number(seg.pitchSemitones))) {
      requestedPitch = Number(seg.pitchSemitones);
    } else if (index > 0 || targetKey != null) {
      requestedPitch = evaluateKeyMatch(referenceKey, seg.key).pitchSemitones;
    }
    const clampedPitch = clamp(requestedPitch, -CHAINER_LIMITS.maxPitchSemitones, CHAINER_LIMITS.maxPitchSemitones);
    const pitchClamped = Math.abs(clampedPitch - requestedPitch) > EPS;
    const pitchSemitones = Math.abs(clampedPitch) < EPS ? 0 : clampedPitch;

    const audio = adaptSegmentAudio(chs, sampleRate, tempoScale, pitchSemitones);
    const durS = audio[0].length / sampleRate;
    const invTempo = 1 / tempoScale;
    const localCoreStartS = clamp(bounds.localCoreStartS * invTempo, 0, durS);
    const localCoreEndS = clamp(bounds.localCoreEndS * invTempo, localCoreStartS, durS);
    const rawDownbeats = Array.isArray(seg.downbeats) && seg.downbeats.length
      ? seg.downbeats
      : deriveDownbeats({ ...seg, sampleRate, channels: chs }, sampleRate);
    const downbeats = rawDownbeats
      .map(t => Number(t) * invTempo)
      .filter(t => Number.isFinite(t) && t >= -EPS && t <= durS + EPS);

    return {
      seg,
      audio,
      durS,
      localCoreStartS,
      localCoreEndS,
      trackCoreStartS: bounds.trackCoreStartS,
      trackCoreEndS: bounds.trackCoreEndS,
      downbeats,
      tempoScale,
      requestedTempoScale,
      tempoClamped,
      pitchSemitones,
      requestedPitch,
      pitchClamped,
    };
  });

  // Build timeline incrementally using Float32 chunks to avoid quadratic reallocations.
  const first = prepared[0];
  const firstStartFrame = startAtCore ? Math.round(first.localCoreStartS * sampleRate) : 0;
  let timeline = first.audio.map(ch => ch.slice(firstStartFrame));
  let prevOffsetInTimeline = -firstStartFrame; // frame 0 of `prev` sits at this frame in `timeline`
  const joinRecords = [];

  for (let i = 1; i < prepared.length; i++) {
    const prev = prepared[i - 1];
    const curr = prepared[i];
    const compat = scoreCompatibility(prev.seg, curr.seg, { targetBpm: safeTargetBpm, targetKey });
    const adjacent = Boolean(
      compat.adjacentCores
      && prev.tempoScale === 1
      && curr.tempoScale === 1
      && prev.pitchSemitones === 0
      && curr.pitchSemitones === 0
    );

    const prevLen = prev.audio[0].length;
    const currLen = curr.audio[0].length;
    const maxSnap = barS * 0.5;
    const outJoinS = adjacent
      ? prev.localCoreEndS
      : nearestDownbeat(prev.downbeats, prev.localCoreEndS, prev.localCoreStartS, prev.durS, maxSnap);
    const inJoinS = adjacent
      ? curr.localCoreStartS
      : nearestDownbeat(curr.downbeats, curr.localCoreStartS, 0, curr.localCoreEndS, maxSnap);

    const outJoinInPrev = clamp(Math.round(outJoinS * sampleRate), 0, prevLen);
    const inJoinInCurr = clamp(Math.round(inJoinS * sampleRate), 0, currLen);
    const joinSample = clamp(prevOffsetInTimeline + outJoinInPrev, 0, timeline[0].length);

    let xfadeFrames = 0;
    let nextTimeline;
    let currOffsetInTimeline;

    if (adjacent || safeXfadeBars <= 0) {
      // Continuous cut: A runs cleanly to outJoin, B begins cleanly at inJoin.
      const headLen = joinSample;
      const tailLen = currLen - inJoinInCurr;
      nextTimeline = Array.from({ length: channelCount }, (_, c) => {
        const merged = new Float32Array(headLen + tailLen);
        merged.set(timeline[c].subarray(0, headLen), 0);
        merged.set(curr.audio[c].subarray(inJoinInCurr, currLen), headLen);
        return merged;
      });
      currOffsetInTimeline = headLen - inJoinInCurr;
    } else {
      const desiredFade = Math.max(1, Math.round(safeXfadeBars * barS * sampleRate));
      const preB = inJoinInCurr;
      const postA = timeline[0].length - joinSample;
      const bodyA = joinSample;
      const bodyB = currLen - inJoinInCurr;

      if (preB > 0 || postA > 0) {
        // Handle-based crossfade aligned onto the incoming downbeat at `joinSample`.
        const fadePre = Math.min(desiredFade, preB, bodyA);
        const fadePost = Math.min(desiredFade - fadePre, postA, bodyB);
        xfadeFrames = fadePre + fadePost;
        const fadeStart = joinSample - fadePre;
        const tailA = timeline.map(ch => ch.subarray(fadeStart, fadeStart + xfadeFrames));
        const headB = curr.audio.map(ch => ch.subarray(inJoinInCurr - fadePre, inJoinInCurr + fadePost));
        const blended = mixCrossfade(tailA, headB, xfadeFrames);

        const afterCurrStart = inJoinInCurr + fadePost;
        const afterCurrLen = currLen - afterCurrStart;
        const totalLen = fadeStart + xfadeFrames + afterCurrLen;
        nextTimeline = Array.from({ length: channelCount }, (_, c) => {
          const merged = new Float32Array(totalLen);
          merged.set(timeline[c].subarray(0, fadeStart), 0);
          merged.set(blended[c], fadeStart);
          merged.set(curr.audio[c].subarray(afterCurrStart, currLen), fadeStart + xfadeFrames);
          return merged;
        });
        currOffsetInTimeline = joinSample - inJoinInCurr;
      } else {
        // Fallback when neither segment supplies pre/post-roll handles: overlap A's tail with B's head.
        xfadeFrames = Math.min(desiredFade, Math.floor(bodyA * 0.5), Math.floor(bodyB * 0.5));
        if (xfadeFrames >= 2) {
          const fadeStart = joinSample - xfadeFrames;
          const tailA = timeline.map(ch => ch.subarray(fadeStart, joinSample));
          const headB = curr.audio.map(ch => ch.subarray(inJoinInCurr, inJoinInCurr + xfadeFrames));
          const blended = mixCrossfade(tailA, headB, xfadeFrames);
          const afterCurrStart = inJoinInCurr + xfadeFrames;
          const afterCurrLen = currLen - afterCurrStart;
          const totalLen = fadeStart + xfadeFrames + afterCurrLen;
          nextTimeline = Array.from({ length: channelCount }, (_, c) => {
            const merged = new Float32Array(totalLen);
            merged.set(timeline[c].subarray(0, fadeStart), 0);
            merged.set(blended[c], fadeStart);
            merged.set(curr.audio[c].subarray(afterCurrStart, currLen), fadeStart + xfadeFrames);
            return merged;
          });
          currOffsetInTimeline = fadeStart - inJoinInCurr;
        } else {
          const headLen = joinSample;
          const tailLen = currLen - inJoinInCurr;
          nextTimeline = Array.from({ length: channelCount }, (_, c) => {
            const merged = new Float32Array(headLen + tailLen);
            merged.set(timeline[c].subarray(0, headLen), 0);
            merged.set(curr.audio[c].subarray(inJoinInCurr, currLen), headLen);
            return merged;
          });
          currOffsetInTimeline = headLen - inJoinInCurr;
        }
      }
    }

    timeline = nextTimeline;
    prevOffsetInTimeline = currOffsetInTimeline;

    joinRecords.push({
      from: prev.seg.id ?? (i - 1),
      to: curr.seg.id ?? i,
      joinSample,
      joinS: joinSample / sampleRate,
      xfadeS: xfadeFrames / sampleRate,
      adjacent,
      tempoScale: curr.tempoScale,
      tempoClamped: curr.tempoClamped,
      pitchSemitones: curr.pitchSemitones,
      pitchClamped: curr.pitchClamped,
      compatibility: compat,
    });
  }

  let output = timeline;
  let wrapClick = null;
  if (loop && output[0].length > 8) {
    const fadeS = Math.min(safeXfadeBars * barS, (output[0].length / sampleRate) * 0.25);
    const loopDurationS = Math.max(0.05, output[0].length / sampleRate - fadeS);
    output = foldLoop(output, sampleRate, loopDurationS, fadeS);
    wrapClick = wrapClickMetric(output, sampleRate);
  }

  const loopFrames = output[0].length;
  const joins = joinRecords.map(rec => {
    const foldedAway = Boolean(loop && rec.joinSample >= loopFrames);
    const seam = foldedAway
      ? {
          unavailable: true,
          reason: 'join_folded_into_loop_seam',
          originalJoinSample: rec.joinSample,
          originalJoinS: rec.joinS,
          ...(wrapClick || {}),
        }
      : seamMetrics(output, sampleRate, rec.joinSample, { xfadeS: rec.xfadeS });
    return {
      from: rec.from,
      to: rec.to,
      joinSample: foldedAway ? 0 : rec.joinSample,
      joinS: foldedAway ? 0 : rec.joinS,
      xfadeS: rec.xfadeS,
      adjacent: rec.adjacent,
      tempoScale: rec.tempoScale,
      tempoClamped: rec.tempoClamped,
      pitchSemitones: rec.pitchSemitones,
      pitchClamped: rec.pitchClamped,
      seam,
    };
  });

  return {
    channels: output,
    sampleRate,
    durationS: output[0].length / sampleRate,
    targetBpm: safeTargetBpm,
    joins,
    ...(wrapClick ? { wrapClick } : {}),
  };
}
