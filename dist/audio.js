/** Original, deterministic instrumental sketches. No network or audio samples. */
const KEYS = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9 };
const SCALE = [0, 2, 4, 5, 7, 9, 11];
export const SCALE_SETS = {
  major: SCALE,
  minor: [0, 2, 3, 5, 7, 8, 10],
  dorian: [0, 2, 3, 5, 7, 9, 10],
  pentatonic: [0, 2, 4, 7, 9],
};
const NOTE_NAMES = ['C', 'C♯', 'D', 'E♭', 'E', 'F', 'F♯', 'G', 'A♭', 'A', 'B♭', 'B'];
const PROGRESSIONS = {
  warm: [
    [0, 5, 1, 4], [0, 3, 4, 5], [0, 1, 3, 4],
    [5, 3, 0, 4], [0, 4, 5, 3], [1, 4, 0, 3],
  ],
  dreamy: [
    [3, 0, 5, 4], [5, 3, 4, 0], [0, 5, 3, 4],
    [1, 3, 0, 4], [5, 1, 4, 0], [3, 5, 0, 4],
  ],
  bright: [
    [0, 4, 5, 3], [0, 3, 5, 4], [0, 4, 1, 4],
    [5, 4, 0, 3], [0, 1, 4, 3], [3, 4, 5, 0],
  ],
  melancholy: [
    [5, 3, 0, 4], [5, 1, 4, 0], [1, 5, 3, 4],
    [5, 3, 1, 4], [0, 5, 3, 4], [2, 5, 1, 4],
  ],
};
const BORROWED = {
  major: [
    { offset: 5, intervals: [0, 3, 7, 10], suffix: 'm7' },
    { offset: 10, intervals: [0, 4, 7, 10], suffix: '7' },
    { offset: 8, intervals: [0, 4, 7, 11], suffix: 'maj7' },
  ],
  minor: [
    { offset: 7, intervals: [0, 4, 7, 10], suffix: '7' },
    { offset: 5, intervals: [0, 4, 7, 11], suffix: 'maj7' },
  ],
  dorian: [
    { offset: 10, intervals: [0, 4, 7, 10], suffix: '7' },
    { offset: 8, intervals: [0, 3, 7, 10], suffix: 'm7' },
  ],
  pentatonic: [
    { offset: 5, intervals: [0, 4, 7, 11], suffix: 'maj7' },
    { offset: 10, intervals: [0, 4, 7, 10], suffix: '7' },
  ],
};
/** Genre banks sit beside the mood banks. Older genres keep using the mood bank. */
const GENRE_PROGRESSIONS = {
  citypop: [[3, 2, 5, 0], [1, 4, 0, 5], [0, 5, 3, 4], [5, 1, 4, 0], [0, 3, 4, 5], [2, 5, 1, 4]],
  trap: [[0, 5, 2, 6], [0, 6, 5, 3], [0, 5, 3, 6], [5, 3, 0, 4], [0, 2, 5, 6], [0, 6, 3, 5]],
  house: [[0, 5, 3, 6], [0, 3, 4, 5], [0, 5, 6, 3], [5, 3, 0, 4], [0, 4, 5, 3], [0, 6, 5, 4]],
  bossa: [[1, 4, 0, 0], [1, 4, 0, 5], [5, 1, 4, 0], [2, 5, 1, 4], [0, 1, 4, 3], [1, 4, 3, 0]],
  reggaeton: [[0, 6, 5, 6], [0, 5, 3, 4], [0, 3, 6, 5], [5, 6, 0, 3], [0, 5, 6, 4], [0, 4, 5, 3]],
  modernrock: [[0, 4, 5, 3], [5, 3, 0, 4], [0, 5, 3, 4], [5, 3, 4, 0]],
  dawn: [[0, 4, 5, 3], [5, 3, 0, 4], [0, 5, 3, 4], [3, 0, 5, 4]],
  nitelofi: [[0, 5, 3, 4], [5, 3, 0, 4], [0, 3, 4, 5], [5, 1, 4, 0]],
};
const SECTION_META = {
  intro: ['인트로', '음색과 공간감을 먼저 소개합니다.'],
  verse: ['벌스', '절제된 반주 위에 모티프를 놓습니다.'],
  pre: ['프리', '후렴으로 올라가기 전 숨을 모읍니다.'],
  chorus: ['후렴', '같은 모티프를 더 넓고 높게 펼칩니다.'],
  bridge: ['브리지', '색채와 리듬을 잠시 돌려 대비를 만듭니다.'],
  outro: ['아웃트로', '여운을 남기며 으뜸화음으로 닫습니다.'],
  motif: ['핵심 모티프', '짧은 아이디어를 확인하는 단일 구간입니다.'],
};
const STRUCTURES = [
  ['intro', 'verse', 'chorus', 'outro'],
  ['verse', 'pre', 'chorus', 'outro'],
  ['intro', 'verse', 'chorus', 'bridge', 'outro'],
  ['verse', 'chorus', 'verse', 'chorus', 'outro'],
  ['intro', 'verse', 'pre', 'chorus', 'outro'],
  ['intro', 'verse', 'chorus', 'bridge', 'chorus', 'outro'],
  ['verse', 'pre', 'chorus', 'bridge', 'chorus', 'outro'],
  ['intro', 'verse', 'pre', 'chorus', 'bridge', 'chorus', 'outro'],
];
const CONTOURS = ['arch', 'rise', 'fall', 'wave', 'neighbor'];
const CONTOUR_SHAPES = {
  arch: [0, 1, 2, 3, 2, 1],
  rise: [0, 0, 1, 2, 3, 3],
  fall: [3, 3, 2, 1, 0, 1],
  wave: [1, 3, 0, 2, 1, 2],
  neighbor: [1, 2, 1, 0, 1, 2],
};
const RHYTHMS = {
  lofi: [[0, 0.75, 1.5, 2.5, 3.25], [0, 1, 2, 2.5, 3.5], [0.5, 1, 2, 3, 3.5], [0, 0.5, 1.5, 2.75, 3.25]],
  pop: [[0, 0.5, 1.5, 2, 2.75, 3.5], [0, 1, 1.5, 2.5, 3, 3.5], [0.5, 1, 2, 2.5, 3.5], [0, 0.75, 1.5, 2.5, 3]],
  ambient: [[0, 1.5, 3], [0, 2], [0.5, 2.5], [0, 1, 3]],
  rnb: [[0, 0.75, 1.75, 2.5, 3.25], [0.5, 1.25, 2, 3, 3.5], [0, 1, 1.5, 2.75, 3.5], [0, 0.5, 2, 2.5, 3.25]],
  ballad: [[0, 1.25, 2.5], [0, 1.5, 3], [0.5, 2, 3.25], [0, 2, 3]],
  edm: [[0, 0.5, 1, 1.5, 2.5, 3.25], [0, 0.75, 1.5, 2, 2.5, 3.5], [0.5, 1, 1.5, 2.5, 3, 3.5], [0, 1, 2, 2.5, 3, 3.5]],
  acoustic: [[0, 0.75, 1.5, 2.5, 3.25], [0, 1, 2, 3], [0.5, 1.5, 2.5, 3.5], [0, 0.5, 1.5, 2.75]],
  cinematic: [[0, 2], [0, 1.5, 3], [0.5, 2.5], [0, 3]],
  modernrock: [[0, 1, 2.25, 3.25], [0, 0.75, 2, 3], [0.5, 1.5, 2.5, 3.5], [0, 1.5, 3]],
  dawn: [[0, 1.5, 3], [0, 2], [0.5, 2.5], [0, 1, 3]],
  nitelofi: [[0, 1, 2.25, 3.25], [0, 0.75, 1.75, 3], [0.5, 1.5, 2.75], [0, 2, 3.25]],  citypop: [[0, 0.5, 1.5, 2, 3, 3.5], [0, 0.75, 1.5, 2.5, 3.25], [0.5, 1, 2, 2.75, 3.5], [0, 1, 1.75, 2.5, 3.5]],
  trap: [[0, 1.5, 3], [0, 2, 3.25, 3.5], [0.5, 2.5, 3.75], [0, 0.75, 2, 3.5]],
  house: [[0, 0.5, 1.5, 2, 3, 3.5], [0, 1, 1.5, 2.5, 3], [0.5, 1, 2, 2.5, 3.5], [0, 0.75, 1.5, 2.5, 3.25]],
  bossa: [[0, 0.75, 1.5, 2.5, 3.25], [0.5, 1.5, 2, 3, 3.5], [0, 1, 1.75, 2.75, 3.5], [0.75, 1.5, 2.5, 3.25]],
  reggaeton: [[0, 0.75, 1.5, 2.75, 3.5], [0, 1, 1.75, 2.5, 3.25], [0.5, 1.5, 2.75, 3.5], [0, 0.75, 2, 2.75, 3.5]],};
const GROOVES = {
  lofi: [
    { kick: [0, 2], snare: [1, 3], hat: [0.5, 1.5, 2.5, 3.5] },
    { kick: [0, 1.5, 2.5], snare: [3], hat: [0, 1, 2, 3] },
    { kick: [0, 2.5], snare: [1, 2.75], hat: [0.5, 1.5, 2.5, 3.5], open: [1, 3] },
  ],
  pop: [
    { kick: [0, 2], snare: [1, 3], hat: [0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5] },
    { kick: [0, 1.5, 2, 3], snare: [1, 3], hat: [0.5, 1.5, 2.5, 3.5] },
    { kick: [0, 0.75, 2, 2.75], snare: [1, 3], hat: [0, 1, 2, 3] },
  ],
  rnb: [
    { kick: [0, 2.5], snare: [1, 3], hat: [0.5, 1.5, 2.5, 3.5] },
    { kick: [0, 1.5, 2.75], snare: [1, 2.5], hat: [0, 1, 2, 3] },
    { kick: [0, 1.75, 3], snare: [1, 3.5], hat: [0.5, 1.5, 2.5, 3.25] },
  ],
  ambient: [
    { kick: [0], snare: [], hat: [2] },
    { kick: [0, 2.5], snare: [], hat: [1.5, 3.5] },
    { kick: [2], snare: [3.5], hat: [0, 3] },
  ],
  ballad: [
    { kick: [0, 2.5], snare: [2], hat: [0, 2] },
    { kick: [0], snare: [2, 3.5], hat: [1, 3] },
    { kick: [0, 3], snare: [2], hat: [0.5, 2.5] },
  ],
  edm: [
    { kick: [0, 1, 2, 3], snare: [1, 3], hat: [0.5, 1.5, 2.5, 3.5] },
    { kick: [0, 0.5, 2, 2.5], snare: [1, 3], hat: [0, 1, 2, 3] },
    { kick: [0, 1, 2, 3], snare: [1, 1.75, 3], hat: [0.25, 0.75, 1.25, 1.75, 2.25, 2.75, 3.25, 3.75] },
  ],
  acoustic: [
    { kick: [0, 2.5], snare: [1, 3], hat: [0.5, 1.5, 2.5, 3.5] },
    { kick: [0, 1.5, 3], snare: [2], hat: [0, 1, 2, 3] },
    { kick: [0, 2], snare: [1.5, 3.5], hat: [0.5, 2.5] },
  ],
  cinematic: [
    { kick: [0, 2], snare: [2.5], hat: [1.5, 3.5] },
    { kick: [0], snare: [3], hat: [2] },
    { kick: [0, 3], snare: [1.5], hat: [0, 2.5] },
  ],
  modernrock: [
    { kick: [0, 2], snare: [2], hat: [0, 1, 2, 3] },
    { kick: [0], snare: [2, 3.5], hat: [0.5, 1.5, 2.5, 3.5] },
    { kick: [0, 2.5], snare: [2], hat: [0, 1, 2, 3], open: [2] },
  ],
  dawn: [
    { kick: [0], snare: [], hat: [2] },
    { kick: [0, 3], snare: [2], hat: [1, 3] },
    { kick: [0], snare: [3], hat: [2, 3.5] },
  ],
  nitelofi: [
    { kick: [0, 2.25], snare: [1, 3], hat: [0.5, 1.5, 2.5, 3.5] },
    { kick: [0, 1.5, 2.75], snare: [3], hat: [0, 1, 2, 3] },
    { kick: [0, 2.5], snare: [1, 2.75], hat: [0.5, 1.5, 2.5, 3.5], open: [1] },
  ],
  citypop: [
    { kick: [0, 2], snare: [1, 3], hat: [0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5], open: [1.5, 3.5] },
    { kick: [0, 0.75, 2, 2.75], snare: [1, 3], hat: [0.5, 1.5, 2.5, 3.5] },
    { kick: [0, 1.5, 2.5], snare: [1, 3], hat: [0, 1, 2, 3], open: [0.5, 2.5] },
  ],
  trap: [
    { kick: [0, 2.75], snare: [2], hat: [0, 0.5, 1, 1.5, 2, 2.5, 3, 3.125, 3.25, 3.375, 3.5, 3.625, 3.75, 3.875] },
    { kick: [0], snare: [2], hat: [0, 1, 2, 2.5, 3, 3.25, 3.5, 3.75], open: [1.5] },
    { kick: [0, 1.5, 3], snare: [2], hat: [0.5, 1.5, 2.5, 3, 3.125, 3.25, 3.5, 3.75] },
  ],
  house: [
    { kick: [0, 1, 2, 3], snare: [1, 3], hat: [0, 1, 2, 3], open: [0.5, 1.5, 2.5, 3.5] },
    { kick: [0, 1, 2, 3], snare: [1, 3], hat: [0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5], open: [0.5, 1.5, 2.5, 3.5] },
    { kick: [0, 1, 2, 3], snare: [1, 1.75, 3], hat: [0.25, 0.75, 1.25, 1.75, 2.25, 2.75, 3.25, 3.75], open: [0.5, 2.5] },
  ],
  bossa: [
    { kick: [0, 2], snare: [0.75, 1.75, 2.5, 3.5], hat: [0, 1, 2, 3] },
    { kick: [0, 1.5, 3], snare: [0.5, 1.5, 2.75, 3.25], hat: [0.5, 1.5, 2.5, 3.5] },
    { kick: [0, 2.5], snare: [1, 1.75, 3, 3.5], hat: [0, 2], open: [1.5, 3.5] },
  ],
  reggaeton: [
    { kick: [0, 1.75, 2.5], snare: [0.75, 1.75, 2.75, 3.5], hat: [0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5] },
    { kick: [0, 1.5, 2.5, 3.25], snare: [0.75, 1.75, 2.75, 3.5], hat: [0.5, 1.5, 2.5, 3.5], open: [1.5, 3.5] },
    { kick: [0, 0.75, 1.5, 2.5], snare: [0.75, 1.75, 2.75, 3.5], hat: [0, 1, 2, 3] },
  ],
};
const ROLE_ENERGY = { intro: 0.56, verse: 0.74, pre: 0.88, chorus: 1, bridge: 0.68, outro: 0.5, motif: 0.84 };
const ROLE_CENTER = { intro: 69, verse: 73, pre: 76, chorus: 79, bridge: 72, outro: 67, motif: 74 };
const TIMBRES = [
  { id: 'warm', cutoffMul: 0.84, attackMul: 1.28, wide: false, melodyProgram: 11, chordProgram: 5 },
  { id: 'clear', cutoffMul: 1, attackMul: 1, wide: false, melodyProgram: 4, chordProgram: 4 },
  { id: 'bright', cutoffMul: 1.2, attackMul: 0.74, wide: false, melodyProgram: 80, chordProgram: 4 },
  { id: 'wide', cutoffMul: 0.92, attackMul: 1.16, wide: true, melodyProgram: 73, chordProgram: 89 },
];
const GENRE_TIMBRE = {
  citypop: [
    { id: 'keys-warm', cutoffMul: 0.9, attackMul: 1.12, wide: false, melodyProgram: 5, chordProgram: 5 },
    { id: 'keys-clear', cutoffMul: 1.06, attackMul: 0.92, wide: true, melodyProgram: 4, chordProgram: 5 },
  ],
  trap: [
    { id: 'dark-808', cutoffMul: 0.74, attackMul: 0.8, wide: false, melodyProgram: 81, chordProgram: 38 },
    { id: 'dry-808', cutoffMul: 0.96, attackMul: 0.7, wide: false, melodyProgram: 80, chordProgram: 38 },
  ],
  house: [
    { id: 'club-bright', cutoffMul: 1.12, attackMul: 0.72, wide: false, melodyProgram: 81, chordProgram: 4 },
    { id: 'club-wide', cutoffMul: 0.94, attackMul: 0.84, wide: true, melodyProgram: 81, chordProgram: 4 },
  ],
  bossa: [
    { id: 'nylon-warm', cutoffMul: 0.86, attackMul: 1.08, wide: false, melodyProgram: 24, chordProgram: 24 },
    { id: 'nylon-soft', cutoffMul: 0.96, attackMul: 1.2, wide: true, melodyProgram: 25, chordProgram: 24 },
  ],
  reggaeton: [
    { id: 'dem-dry', cutoffMul: 1, attackMul: 0.86, wide: false, melodyProgram: 81, chordProgram: 38 },
    { id: 'dem-bright', cutoffMul: 1.14, attackMul: 0.74, wide: false, melodyProgram: 80, chordProgram: 39 },
  ],
};
const PROFILES = {
  lofi: { swing: 0.13, melody: [0, 0.75, 1.5, 2.5, 3.25], length: 0.62, cutoff: 3400 },
  pop: { swing: 0, melody: [0, 0.5, 1.5, 2, 2.75, 3.5], length: 0.43, cutoff: 6500, harmony: 'anthem' },
  ambient: { swing: 0, melody: [0, 1.5, 3], length: 1.25, cutoff: 3000 },
  rnb: { swing: 0.09, melody: [0, 0.75, 1.75, 2.5, 3.25], length: 0.64, cutoff: 4200, harmony: 'soul' },
  ballad: { swing: 0.04, melody: [0, 1.25, 2.5], length: 0.95, cutoff: 2800, voice: 'pad' },
  edm: { swing: 0, swingRange: [0, 0], melody: [0, 0.5, 1, 1.5, 2.5, 3.25], length: 0.28, cutoff: 7600, voice: 'saw', harmony: 'anthem' },
  acoustic: { swing: 0.02, melody: [0, 0.75, 1.5, 2.5, 3.25], length: 0.5, cutoff: 5000, voice: 'pluck' },
  cinematic: { swing: 0, melody: [0, 2], length: 1.6, cutoff: 2400, voice: 'wide' },
  modernrock: { swing: 0.03, melody: [0, 1, 2.25, 3.25], length: 0.78, cutoff: 4300, voice: 'band' },
  dawn: { swing: 0.02, melody: [0, 1.5, 3], length: 1.35, cutoff: 2500, voice: 'pad' },
  nitelofi: { swing: 0.12, melody: [0, 1, 2.25, 3.25], length: 0.84, cutoff: 3000, voice: 'pad' },
  citypop: { swing: 0.06, swingRange: [0.04, 0.1], melody: [0, 0.5, 1.5, 2, 3, 3.5], length: 0.48, cutoff: 4600, voice: 'keys', harmony: 'city' },
  trap: { swing: 0, swingRange: [0, 0.02], melody: [0, 1.5, 3], length: 0.34, cutoff: 5400, voice: '808' },
  house: { swing: 0.04, swingRange: [0.02, 0.06], melody: [0, 0.5, 2], length: 0.22, cutoff: 7400, voice: 'house', harmony: 'club' },
  bossa: { swing: 0.03, swingRange: [0.01, 0.05], melody: [0, 0.75, 1.5, 2.5, 3.25], length: 0.5, cutoff: 3200, voice: 'nylon', harmony: 'jazz' },
  reggaeton: { swing: 0, swingRange: [0, 0.02], melody: [0, 0.75, 1.5, 2.75, 3.5], length: 0.38, cutoff: 5000, voice: 'pulse' },};
/** Gentle bus dynamics used by the live graph and the WAV render. */
export const SPACE = {
  compressor: { threshold: -20, knee: 18, ratio: 2, attack: 0.012, release: 0.24 },
  limiter: { threshold: -2, knee: 1, ratio: 12, attack: 0.003, release: 0.08 },
};
const VOWEL_OO = [310, 820, 2300];
const VOWEL_AH = [760, 1180, 2550];
const ROCK_COLORS = [
  { offset: 0, intervals: [0, 5, 7, 11], suffix: 'sus4' },
  { offset: 7, intervals: [0, 5, 7, 10], suffix: 'sus4' },
  { offset: 0, intervals: [0, 2, 4, 7], suffix: 'add9' },
  { offset: 5, intervals: [0, 2, 4, 7], suffix: 'add9' },
  { offset: 7, intervals: [0, 2, 4, 7], suffix: 'add9' },
  { offset: 9, intervals: [0, 5, 7, 10], suffix: 'sus4' },
];
export function genreProfile(genre) {
  return Object.hasOwn(PROFILES, genre) ? { ...PROFILES[genre] } : null;
}

function voiceShape(voice, kind) {
  if (voice === 'keys') return { attack: kind === 'bass' ? 0.018 : 0.028, release: kind === 'bass' ? 0.16 : 0.42, amplitude: kind === 'bass' ? 0.26 : kind === 'chords' ? 0.09 : 0.2, wave: 'triangle' };
  if (voice === '808') return { attack: 0.004, release: kind === 'bass' ? 0.28 : 0.08, amplitude: kind === 'bass' ? 0.34 : kind === 'chords' ? 0.06 : 0.16, wave: kind === 'bass' ? 'sine' : 'triangle' };
  if (voice === 'house') return { attack: 0.006, release: kind === 'chords' ? 0.12 : 0.08, amplitude: kind === 'bass' ? 0.24 : kind === 'chords' ? 0.07 : 0.15, wave: kind === 'bass' ? 'square' : 'sawtooth' };
  if (voice === 'nylon') return { attack: 0.01, release: kind === 'chords' ? 0.34 : 0.16, amplitude: kind === 'bass' ? 0.22 : kind === 'chords' ? 0.08 : 0.18, wave: 'triangle' };
  return { attack: 0.008, release: kind === 'bass' ? 0.14 : 0.1, amplitude: kind === 'bass' ? 0.28 : kind === 'chords' ? 0.08 : 0.17, wave: kind === 'bass' ? 'square' : 'triangle' };
}
const MIDI_TRACKS = [
  { name: 'Melody', instrument: 'melody', channel: 0, program: 4 },
  { name: 'Harmony', instrument: 'chords', channel: 1, program: 4 },
  { name: 'Bass', instrument: 'bass', channel: 2, program: 33 },
  { name: 'Drums', instrument: 'drums', channel: 9 },
  { name: 'Hum', instrument: 'hum', channel: 4, program: 53 },
];
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const finite = (value, fallback) => Number.isFinite(Number(value)) ? Number(value) : fallback;
const round = (value) => Math.round(value * 1e6) / 1e6;
const AMBIENCE_SECONDS = 4;
const AMBIENCE_GAIN = { rain: 0.18, vinyl: 0.1, wind: 0.16 };

/** 0–100 sliders. Missing values stay off so older projects keep the dry mix. */
export function normalizeAmbience(value) {
  const source = value && typeof value === 'object' ? value : {};
  const level = key => {
    const number = Math.round(Number(source[key]));
    return Math.max(0, Math.min(100, Number.isFinite(number) ? number : 0));
  };
  return { rain: level('rain'), vinyl: level('vinyl'), wind: level('wind') };
}

function ambienceAmount(levels, key) {
  const raw = clamp(finite(levels?.[key], 0), 0, 100) / 100;
  return AMBIENCE_GAIN[key] * raw ** 1.4;
}

export function seededRandom(seed) {
  let state = seed >>> 0;
  return () => {
    state += 0x6D2B79F5;
    let value = state;
    value = Math.imul(value ^ value >>> 15, value | 1);
    value ^= value + Math.imul(value ^ value >>> 7, value | 61);
    return ((value ^ value >>> 14) >>> 0) / 4294967296;
  };
}

export function normalizeSettings(input = {}) {
  const layers = input.instruments || {};
  return {
    genre: Object.hasOwn(PROFILES, input.genre) ? input.genre : 'lofi',
    mood: Object.hasOwn(PROGRESSIONS, input.mood) ? input.mood : 'warm',
    bpm: Math.round(clamp(finite(input.bpm, 86), 72, 140)),
    key: Object.hasOwn(KEYS, input.key) ? input.key : 'C',
    bars: [8, 16, 32].includes(Number(input.bars)) ? Number(input.bars) : 16,
    seed: finite(input.seed, 20261017) >>> 0,
    scale: Object.hasOwn(SCALE_SETS, input.scale) ? input.scale : 'major',
    instruments: {
      melody: layers.melody !== false,
      chords: layers.chords !== false,
      bass: layers.bass !== false,
      drums: layers.drums !== false,
      hum: layers.hum === true,
    },
    ambience: normalizeAmbience(input.ambience),
  };
}

/** Wordless oo→ah formant targets. 0 is "oo", 1 is "ah". */
export function vowelFormants(amount) {
  const mixAmount = clamp(finite(amount, 0), 0, 1);
  return VOWEL_OO.map((freq, index) => Math.round(freq + (VOWEL_AH[index] - freq) * mixAmount));
}

/**
 * Stereo impulse built from noise, an exponential tail, and a few early taps.
 * No recorded room is used. The same seed rebuilds the same impulse.
 */
export function createImpulseChannels(sampleRate, seconds, decay, seed) {
  const rate = Math.max(8000, Math.round(finite(sampleRate, 44100)));
  const length = Math.max(8, Math.floor(rate * clamp(finite(seconds, 1.6), 0.2, 4)));
  const fall = clamp(finite(decay, 2.4), 0.5, 8);
  const random = seededRandom(finite(seed, 1) >>> 0);
  const channels = [new Float32Array(length), new Float32Array(length)];
  const taps = [0.011, 0.017, 0.029, 0.041, 0.059, 0.073];
  for (let channel = 0; channel < 2; channel++) {
    const data = channels[channel];
    for (let i = 0; i < length; i++) {
      const env = (1 - i / length) ** fall;
      data[i] = (random() * 2 - 1) * env * 0.32;
    }
    taps.forEach((tap, index) => {
      const pos = Math.min(length - 1, Math.floor(tap * rate));
      const sign = index % 2 === 0 ? 1 : -1;
      const side = channel === 0 ? 1 : (index % 2 ? 0.62 : 0.88);
      data[pos] += sign * (0.4 - index * 0.04) * side;
    });
  }
  return channels;
}

function peakNormalize(channels, peak = 0.9) {
  let max = 0;
  for (const channel of channels) for (const value of channel) max = Math.max(max, Math.abs(value));
  if (max < 1e-5) return;
  const scale = peak / max;
  for (const channel of channels) for (let index = 0; index < channel.length; index++) channel[index] *= scale;
}

/**
 * Looping rain, vinyl crackle, and wind/room tone.
 * Built from noise and envelopes only. The same seed rebuilds the same buffers.
 */
export function createAmbienceBuffers(sampleRate, seconds = AMBIENCE_SECONDS, seed = 1) {
  const rate = Math.max(8000, Math.round(finite(sampleRate, 44100)));
  const span = clamp(finite(seconds, AMBIENCE_SECONDS), 0.5, 8);
  const fade = Math.max(8, Math.round(rate * 0.03));
  const body = Math.max(fade * 4, Math.round(rate * span));
  const length = body + fade;
  const random = seededRandom(mix(finite(seed, 1) >>> 0, 0xA4B1E));
  const rain = [new Float32Array(length), new Float32Array(length)];
  const vinyl = [new Float32Array(length), new Float32Array(length)];
  const wind = [new Float32Array(length), new Float32Array(length)];

  let left = 0;
  let right = 0;
  let lowLeft = 0;
  let lowRight = 0;
  for (let index = 0; index < length; index++) {
    const noiseLeft = random() * 2 - 1;
    const noiseRight = random() * 2 - 1;
    left += (noiseLeft - left) * 0.012;
    right += (noiseRight - right) * 0.012;
    lowLeft += (left - lowLeft) * 0.02;
    lowRight += (right - lowRight) * 0.02;
    const breathe = 0.72 + 0.28 * Math.sin((index / rate) * Math.PI * 2 * 0.07);
    wind[0][index] = lowLeft * breathe;
    wind[1][index] = lowRight * breathe;
  }

  left = 0;
  right = 0;
  for (let index = 0; index < length; index++) {
    const noiseLeft = random() * 2 - 1;
    const noiseRight = random() * 2 - 1;
    left += (noiseLeft - left) * 0.35;
    right += (noiseRight - right) * 0.35;
    rain[0][index] = (noiseLeft - left) * 0.42;
    rain[1][index] = (noiseRight - right) * 0.42;
  }
  const drops = Math.max(4, Math.round(span * 42));
  for (let drop = 0; drop < drops; drop++) {
    const at = Math.floor(random() * body);
    const pan = random();
    const decay = Math.max(2, Math.round(rate * (0.01 + random() * 0.045)));
    const amp = 0.28 + random() * 0.72;
    const tone = 0.25 + random() * 0.75;
    let color = random() * 2 - 1;
    for (let index = 0; index < decay && at + index < length; index++) {
      color = color * 0.52 + (random() * 2 - 1) * tone;
      const env = (1 - index / decay) ** 2;
      const tap = color * env * amp;
      rain[0][at + index] += tap * (1 - pan * 0.85);
      rain[1][at + index] += tap * (0.15 + pan * 0.85);
    }
  }

  left = 0;
  right = 0;
  for (let index = 0; index < length; index++) {
    const noiseLeft = random() * 2 - 1;
    const noiseRight = random() * 2 - 1;
    left += (noiseLeft - left) * 0.006;
    right += (noiseRight - right) * 0.006;
    vinyl[0][index] = left;
    vinyl[1][index] = right;
  }
  let cursor = Math.round(rate * (0.02 + random() * 0.08));
  while (cursor < body) {
    const pop = random() < 0.16;
    const amp = pop ? 0.62 + random() * 0.38 : 0.14 + random() * 0.32;
    const decay = Math.max(1, Math.round(rate * (pop ? 0.006 + random() * 0.018 : 0.001 + random() * 0.003)));
    const pan = 0.32 + random() * 0.36;
    for (let index = 0; index < decay && cursor + index < length; index++) {
      const env = (1 - index / decay) ** (pop ? 1.3 : 3);
      const tap = (random() * 2 - 1) * env * amp;
      vinyl[0][cursor + index] += tap * (1 - pan);
      vinyl[1][cursor + index] += tap * pan;
    }
    cursor += Math.max(1, Math.round(rate * (0.04 + random() * 0.2)));
  }

  const loopSeconds = body / rate;
  const fadeSeconds = fade / rate;
  const looped = {
    rain: foldLoop(rain, rate, loopSeconds, fadeSeconds),
    vinyl: foldLoop(vinyl, rate, loopSeconds, fadeSeconds),
    wind: foldLoop(wind, rate, loopSeconds, fadeSeconds),
    sampleRate: rate,
    seconds: loopSeconds,
  };
  peakNormalize(looped.rain, 0.9);
  peakNormalize(looped.vinyl, 0.9);
  peakNormalize(looped.wind, 0.9);
  return looped;
}

function chordForDegree(degree, key, closing, style) {  const root = key + SCALE[degree];
  const minor = [1, 2, 5].includes(degree);
  let intervals = minor ? [0, 3, 7, 10] : degree === 4 ? [0, 4, 7, 9] : [0, 4, 7, 11];
  let suffix = minor ? 'm7' : degree === 4 ? '6' : 'maj7';
  if (!closing && degree === 4 && (style === 'jazz' || style === 'city')) {
    intervals = [0, 4, 7, 10];
    suffix = '7';
  }
  if (closing && !minor) { intervals = [0, 4, 7, 9]; suffix = '6'; }
  return { root: root % 12, degree, intervals, name: NOTE_NAMES[root % 12] + suffix };
}

function chordForDegreeScaled(degree, tonic, closing, scale) {
  const rootInterval = scale[degree % scale.length];
  const root = (tonic + rootInterval) % 12;
  const relative = scale.map(interval => (interval - rootInterval + 12) % 12);
  const has = interval => relative.includes(interval);
  const third = has(3) ? 3 : has(4) ? 4 : null;
  const fifth = has(7) ? 7 : has(6) ? 6 : null;
  const seventh = has(10) ? 10 : has(11) ? 11 : null;
  const sixth = has(9) ? 9 : null;
  const intervals = [0];
  if (third !== null) intervals.push(third);
  if (fifth !== null) intervals.push(fifth);
  if (!closing && seventh !== null) intervals.push(seventh);
  else if (sixth !== null) intervals.push(sixth);
  else if (seventh !== null) intervals.push(seventh);
  for (const interval of relative) {
    if (intervals.length >= 4) break;
    if (!intervals.includes(interval)) intervals.push(interval);
  }
  while (intervals.length < 4) intervals.push(12);
  const suffix = third === 3 && seventh === 10 && !closing ? 'm7'
    : third === 3 ? 'm'
      : !closing && seventh === 11 ? 'maj7'
        : sixth !== null ? '6' : '';
  return { root, degree, intervals: intervals.slice(0, 4), name: NOTE_NAMES[root] + suffix };
}

function voiceChord(chord, previous) {
  const base = chord.intervals.map(interval => 48 + chord.root + interval);
  const candidates = [];
  for (let inversion = 0; inversion < 4; inversion++) {
    const notes = base.map((note, index) => note + (index < inversion ? 12 : 0)).sort((a, b) => a - b);
    for (const octave of [-12, 0, 12]) {
      const candidate = notes.map(note => note + octave);
      if (candidate[0] >= 48 && candidate[3] <= 76) candidates.push(candidate);
    }
  }
  const target = previous || [53, 57, 60, 64];
  candidates.sort((a, b) => a.reduce((sum, note, i) => sum + Math.abs(note - target[i]), 0) - b.reduce((sum, note, i) => sum + Math.abs(note - target[i]), 0));
  return candidates[0] || base;
}

function nearestPitch(pitchClass, target, low = 64, high = 85) {
  const options = [];
  for (let note = low; note <= high; note++) if (note % 12 === pitchClass % 12) options.push(note);
  if (!options.length) {
    const pc = ((pitchClass % 12) + 12) % 12;
    for (let note = 36; note <= 96; note++) if (note % 12 === pc) options.push(note);
  }
  return options.sort((a, b) => Math.abs(a - target) - Math.abs(b - target))[0];
}

function mix(seed, salt) {
  let hash = Math.imul((seed >>> 0) ^ Math.imul((salt >>> 0) || 1, 0x9E3779B1), 0x85EBCA77);
  hash ^= hash >>> 13;
  hash = Math.imul(hash, 0xC2B2AE3D);
  hash ^= hash >>> 16;
  return hash >>> 0;
}

function pitchInScale(pitchClass, tonic, scale) {
  return scale.includes((((pitchClass - tonic) % 12) + 12) % 12);
}

export function arrangementCues(input = {}) {
  const text = `${input.topic || ''} ${input.notes || ''} ${input.title || ''}`;
  return {
    wantChorus: /후렴|코러스|chorus|훅|hook|쉽게 부를/i.test(text),
    wantSpace: /여백|잔잔|고요|느린|공간|sparse|조용/i.test(text),
    wantBridge: /브리지|bridge|전환|전개/i.test(text),
    wantLift: /밝|에너지|신나|dance|희망|경쾌|uplift/i.test(text),
  };
}

const FORM_BOOK = {
  verseChorus: [
    ['intro', 'verse', 'chorus', 'outro'],
    ['verse', 'pre', 'chorus', 'outro'],
    ['intro', 'verse', 'chorus', 'bridge', 'outro'],
    ['verse', 'chorus', 'verse', 'chorus', 'outro'],
    ['intro', 'verse', 'pre', 'chorus', 'outro'],
    ['intro', 'verse', 'chorus', 'bridge', 'chorus', 'outro'],
    ['verse', 'pre', 'chorus', 'bridge', 'chorus', 'outro'],
    ['intro', 'verse', 'pre', 'chorus', 'bridge', 'chorus', 'outro'],
  ],
  aaba: [
    ['intro', 'verse', 'verse', 'bridge', 'verse', 'outro'],
    ['verse', 'verse', 'bridge', 'verse', 'outro'],
    ['intro', 'verse', 'bridge', 'verse', 'chorus', 'outro'],
    ['verse', 'verse', 'bridge', 'verse', 'chorus', 'outro'],
  ],
  through: [
    ['intro', 'verse', 'pre', 'bridge', 'chorus', 'outro'],
    ['verse', 'pre', 'bridge', 'chorus', 'outro'],
    ['intro', 'verse', 'bridge', 'pre', 'outro'],
    ['intro', 'verse', 'pre', 'bridge', 'outro'],
    ['verse', 'bridge', 'pre', 'chorus', 'outro'],
  ],
  build: [
    ['intro', 'verse', 'pre', 'chorus', 'outro'],
    ['intro', 'verse', 'pre', 'chorus', 'bridge', 'outro'],
    ['intro', 'pre', 'chorus', 'outro'],
    ['intro', 'verse', 'chorus', 'outro'],
    ['intro', 'verse', 'pre', 'chorus', 'verse', 'outro'],
  ],
};

function formWeights(genre, mood, cues) {
  const ambientish = genre === 'ambient' || genre === 'cinematic' || genre === 'dawn';
  const table = {
    lofi: { verseChorus: 6, aaba: 3, through: 3, build: 2 },
    pop: { verseChorus: 8, build: 2, aaba: 1, through: 1 },
    rnb: { aaba: 10, verseChorus: 2, through: 1, build: 1 },
    ambient: { through: 8, build: 2, aaba: 1, verseChorus: 1 },
    ballad: { aaba: 8, verseChorus: 2, through: 1, build: 1 },
    edm: { build: 10, verseChorus: 2, through: 1, aaba: 1 },
    acoustic: { aaba: 5, verseChorus: 3, through: 2, build: 1 },
    cinematic: { build: 8, through: 2, aaba: 1, verseChorus: 1 },
    modernrock: { verseChorus: 8, aaba: 2, build: 1, through: 1 },
    dawn: { aaba: 14, through: 1, build: 1, verseChorus: 1 },
    nitelofi: { through: 6, aaba: 4, verseChorus: 1, build: 1 },
    citypop: { aaba: 5, verseChorus: 3, build: 2, through: 1 },
    trap: { build: 5, verseChorus: 4, aaba: 1, through: 1 },
    house: { verseChorus: 9, aaba: 2, through: 1, build: 1 },
    bossa: { aaba: 6, verseChorus: 3, through: 2, build: 1 },
    reggaeton: { verseChorus: 5, build: 5, aaba: 1, through: 1 },
  };
  const weights = { ...(table[genre] || { verseChorus: 4, aaba: 3, through: 3, build: 2 }) };
  if (mood === 'bright') { weights.verseChorus += 1; weights.build += 1; }
  if (mood === 'melancholy') { weights.aaba += 1; weights.through += 1; }
  if (mood === 'dreamy') { weights.through += 1; }
  if (cues.wantBridge) return { verseChorus: 2, aaba: 4, through: 4, build: 2 };
  if (cues.wantSpace) return ambientish ? { build: 4, through: 6, aaba: 1, verseChorus: 1 } : { through: 5, build: 3, aaba: 2, verseChorus: 1 };
  if (cues.wantChorus || cues.wantLift) { weights.verseChorus += 3; if (genre === 'edm') weights.build += 2; }
  return weights;
}

function templateAllowed(template, cues) {
  if (cues.wantBridge) return template.includes('bridge');
  if (cues.wantSpace) return template[0] === 'intro' && !template.includes('bridge') && template.filter(role => role === 'chorus').length <= 1;
  return true;
}

function allocateSectionBars(template, count, weight) {
  const totalWeight = template.reduce((sum, role) => sum + weight[role], 0) || 1;
  const left = count - template.length;
  const fractions = template.map(role => left * weight[role] / totalWeight);
  const extras = fractions.map(value => Math.floor(value));
  let used = extras.reduce((sum, value) => sum + value, 0);
  const order = fractions.map((value, index) => ({ index, frac: value - Math.floor(value) })).sort((a, b) => b.frac - a.frac || a.index - b.index);
  for (const item of order) {
    if (used >= left) break;
    extras[item.index] += 1;
    used += 1;
  }
  return extras.map(extra => 1 + extra);
}

/** Section lengths for a sketch. The same inputs are used by the lyric brief. */
export function planStructure(bars, genre = 'lofi', mood = 'warm', seed = 1, cues = {}) {
  const count = Math.max(1, Math.round(Number(bars) || 1));
  const hint = cues || {};
  if (count < 4) {
    const [name, description] = SECTION_META.motif;
    return [{ role: 'motif', name, bars: count, description, family: 'motif' }];
  }
  const weights = formWeights(genre, mood, hint);
  let options = [];
  for (const family of Object.keys(FORM_BOOK)) {
    const weight = weights[family] || 0;
    if (weight <= 0) continue;
    for (const template of FORM_BOOK[family]) {
      if (template.length > count) continue;
      if (!templateAllowed(template, hint)) continue;
      options.push({ family, template, weight });
    }
  }
  if (!options.length) {
    options = [];
    for (const family of Object.keys(FORM_BOOK)) {
      for (const template of FORM_BOOK[family]) {
        if (template.length <= count) options.push({ family, template, weight: 1 });
      }
    }
  }
  const chosen = options.length ? (() => {
    const total = options.reduce((sum, option) => sum + option.weight, 0);
    let roll = mix(seed, 0x517) % total;
    for (const option of options) {
      roll -= option.weight;
      if (roll < 0) return option;
    }
    return options[0];
  })() : { family: 'verseChorus', template: ['verse', 'chorus', 'outro'].slice(0, Math.min(3, count)) };
  const template = chosen.template.length <= count ? chosen.template : ['verse', 'chorus', 'outro'].slice(0, count);
  const weight = { intro: 1, verse: 2, pre: 1, chorus: 3, bridge: 2, outro: 1, motif: 1 };
  if (genre === 'ambient' || genre === 'dawn' || hint.wantSpace) { weight.intro = 3; weight.verse = 3; weight.chorus = 1; }
  if (genre === 'cinematic') { weight.intro = 3; weight.verse = 1; weight.pre = 2; weight.chorus = 3; }
  if (genre === 'edm' || genre === 'pop' || genre === 'modernrock' || genre === 'citypop' || genre === 'reggaeton' || hint.wantLift) weight.chorus = 4;
  if (genre === 'house') { weight.verse += 2; weight.chorus = 2; weight.intro = 1; }
  if (genre === 'ballad') { weight.verse += 2; weight.bridge += 1; weight.chorus = 2; }
  if (genre === 'nitelofi' || genre === 'rnb') { weight.verse += 2; weight.chorus = 2; }
  if (chosen.family === 'build') { weight.intro += 1; weight.pre += 1; }
  if (chosen.family === 'through') { weight.verse += 1; weight.bridge += 1; weight.chorus = Math.max(1, weight.chorus - 1); }
  if (chosen.family === 'aaba') { weight.verse += 1; weight.bridge += 1; }
  weight.intro += mix(seed, 0xA17) % 3;
  weight.outro += mix(seed, 0xA18) % 3;
  weight.verse += mix(seed, 0xA19) % 2;
  weight.bridge += mix(seed, 0xA1A) % 2;
  const barsEach = allocateSectionBars(template, count, weight);
  return template.map((role, index) => {
    const [name, fallback] = SECTION_META[role];
    let description = fallback;
    if (genre === 'ambient' && role === 'verse') description = '성긴 모티프와 긴 잔향으로 공간을 넓힙니다.';
    else if (genre === 'ambient' && role === 'chorus') description = '질감의 밀도를 높이며 중심 장면을 만듭니다.';
    else if (chosen.family === 'through' && role !== 'intro' && role !== 'outro') description = '앞 구간을 반복하지 않고 모티프를 새 위치로 이어 갑니다.';
    else if (chosen.family === 'aaba' && role === 'verse') description = 'A 구간입니다. 같은 모티프를 두고, 두 번째 A는 한 단계 올려 변주합니다.';
    else if (chosen.family === 'aaba' && role === 'bridge') description = 'B 구간입니다. 모티프를 뒤집고 화성을 돌려 대비를 만듭니다.';
    else if (chosen.family === 'build' && role === 'pre') description = '에너지를 모아 다음 장면으로 넘깁니다.';
    else if (genre === 'house' && (role === 'verse' || role === 'chorus')) description = '같은 루프를 유지하고 필터와 그루브만 조금씩 움직입니다.';
    else if (genre === 'edm' && role === 'pre') description = '스네어 롤과 라이저, 필터가 열리며 드롭을 준비합니다.';
    else if (genre === 'edm' && role === 'chorus') description = '큰 리드와 서브가 드롭을 엽니다.';
    else if (genre === 'dawn' && role === 'verse') description = '짧은 피아노 모티프가 먼 공간에 남습니다.';
    else if (genre === 'cinematic' && role === 'chorus') description = '낮은 타격과 넓은 화음이 장면을 엽니다.';
    else if (chosen.family === 'build' && role === 'chorus') description = genre === 'edm' || genre === 'reggaeton' ? '모아 둔 에너지를 드롭으로 엽니다.' : '쌓아 올린 텍스처를 넓은 공간으로 내려놓습니다.';
    return { role, name, bars: barsEach[index], description, family: chosen.family };
  });
}

const FORM_KO = { verseChorus: '벌스-후렴', aaba: 'AABA', through: '통절', build: '빌드-드롭', motif: '모티프' };
const FORM_EN = { verseChorus: 'verse-chorus', aaba: 'AABA', through: 'through-composed', build: 'build and drop', motif: 'motif' };
const ROMAN = ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii'];
const ARC_BOOK = {
  bloom: { ko: '서서히 피어남', en: 'a slow bloom', shape: 'swell', intro: 0.46, verse: 0.7, pre: 0.86, chorus: 1, bridge: 0.62, outro: 0.4, motif: 0.78 },
  lift: { ko: '후렴에서 넓어짐', en: 'a chorus lift', shape: 'late', intro: 0.5, verse: 0.68, pre: 0.9, chorus: 1, bridge: 0.72, outro: 0.48, motif: 0.8 },
  drop: { ko: '쌓았다가 내려놓기', en: 'a build and drop', shape: 'peak', intro: 0.42, verse: 0.74, pre: 0.96, chorus: 0.7, bridge: 0.5, outro: 0.36, motif: 0.66 },
  ebb: { ko: '잔잔한 숨', en: 'a quiet ebb', shape: 'flat', intro: 0.4, verse: 0.58, pre: 0.66, chorus: 0.74, bridge: 0.5, outro: 0.34, motif: 0.6 },
  wave: { ko: '파도처럼 오르내림', en: 'a wave', shape: 'swell', intro: 0.48, verse: 0.84, pre: 0.7, chorus: 0.95, bridge: 0.55, outro: 0.42, motif: 0.75 },
};
const MOTIFS = [
  [0, 2, 1, 4], [0, 1, 0, -1], [0, 2, 4, 2], [0, -1, 1, 2], [0, 4, 2, 3], [0, 1, 3, 1],
  [0, -2, 0, 2], [0, 2, 0, 1], [0, 3, 2, 4], [0, 1, -1, 2], [0, 2, 3, 5], [0, -1, -2, 0],
  [0, 1, 2, 0, 3], [0, 4, 5, 3], [0, 2, -1, 3], [0, 5, 3, 4, 2], [0, -2, -1, 1], [0, 1, 4, 2],
  [0, 3, 1, 2], [0, -1, 2, 0], [0, 2, 5, 3], [0, 4, 1, 3],
];
const CONCEPT_SALT = { lofi: 11, pop: 23, rnb: 37, ambient: 41, ballad: 53, edm: 67, acoustic: 71, cinematic: 83, modernrock: 91, dawn: 93, nitelofi: 95, citypop: 109, trap: 113, house: 127, bossa: 131, reggaeton: 137 };

function progressionRows(block) {
  return block.trim().split('\n').filter(Boolean).map(line => {
    const [w, mood, p, alt] = line.split('|');
    return { w: Number(w), mood, p: p.trim().split(/\s+/), alt: alt ? alt.trim().split(/\s+/) : null };
  });
}

const PROGRESSION_BOOKS = {
  lofi: progressionRows(`
3|warm|0 5 1 4|5 3 0 4
2|warm|1 4 0 3|0 5 3 4
2|warm|0 3 4 5|1 4 0 5
2|*|0 4 5 3|1 5 3 4
2|*|5 3 0 4|0 1 4 3
2|*|0 5 3 4|2 5 1 4
2|*|0 3 5 4|5 1 4 0
2|*|5 1 4 0|0 3 4 0
2|*|3 0 5 4|1 4 0 3
2|*|0 1 3 4|5 3 1 4
2|dreamy|2 5 1 4|0 3 5 4
2|dreamy|0 5 2 4|3 4 0 5
2|*|1 4 2 5|0 5 3 4
2|*|3 4 0 5|5 1 4 0
2|melancholy|5 3 1 4|0 5 3 4
2|*|0 4 1 4|5 3 0 4
2|warm|0 3 0 4|5 4 0 3
2|dreamy|0 5 2 3|1 4 0 5
2|*|1 4 0 5|0 3 4 5
2|bright|0 1 4 3|4 0 5 3
2|*|3 5 0 4|1 4 2 5
2|bright|0 4 0 5|3 4 0 5
2|*|2 4 5 3|0 5 1 4
2|dreamy|5 0 3 4|2 5 1 4
2|*|0 2 5 4|1 4 0 3
2|*|1 5 3 4|0 4 5 3
2|*|3 1 4 0|5 3 0 4
2|*|0 5 4 3|1 4 0 5
2|bright|4 5 3 0|0 3 5 4
2|*|2 1 4 0|5 3 4 0
2|bright|0 3 5 1|4 0 3 4
2|*|5 4 0 3|1 4 5 0
2|warm|0 5 3 3m|
2|melancholy|1 4 0 3m|5 3 0 4
2|dreamy|0 5b 3 4|
2|bright|0 6b 3 4|0 4 5 3
2|warm|0 3 3m 4|
2|dreamy|0 2b 5 4|
2|melancholy|5 3m 0 4|
2|*|0 5 1 4 3 4 0 5|
`),
  pop: progressionRows(`
3|bright|0 4 5 3|1 4 0 5
3|bright|0 3 5 4|0 4 1 4
2|*|0 5 3 4|5 4 0 3
2|*|5 3 0 4|0 1 4 3
2|warm|0 5 1 4|3 4 0 5
2|*|1 4 0 3|0 5 3 4
2|*|0 4 0 5|3 5 4 0
2|*|3 4 5 0|0 5 1 4
2|*|0 1 4 5|5 3 4 0
2|dreamy|0 5 2 4|1 4 0 3
2|*|4 0 5 3|1 4 0 5
2|*|0 3 4 1|5 4 0 3
2|bright|0 4 3 4|5 3 0 4
2|*|5 1 4 3|0 4 5 0
2|*|0 5 4 1|3 4 0 5
2|bright|0 6b 4 3|
2|*|0 4 5 3 1 4 0 5|
2|*|0 3 5 4 0 1 4 0|
`),
  rnb: progressionRows(`
3|dreamy|5 3 0 4|1 4 0 3
3|*|1 4 0 5|5 3 4 0
2|warm|0 5 1 4|3 4 0 5
2|*|5 1 4 0|0 3 5 4
2|*|2 5 1 4|0 5 3 4
2|*|0 3 4 5|1 4 2 5
2|melancholy|5 3 1 4|0 5 3m 4
2|*|1 4 2 5|0 3 4 0
2|*|3 0 5 4|1 4 0 5
2|*|0 5 3 2|4 0 5 3
2|*|5 0 4 3|1 4 0 3
2|dreamy|0 2b 5 4|
2|*|1 4 0 3m|
2|*|5 3 0 6b|
2|*|0 5 1 4 3 2 5 4|
`),
  ambient: progressionRows(`
3|dreamy|0 3 0 4|5 3 0 5
3|*|0 5 0 3|2 5 0 4
2|*|5 3 5 4|0 3 0 5
2|*|0 2 5 2|3 0 4 0
2|*|0 4 0 5|5 0 3 0
2|warm|0 5 1 4|0 3 0 4
2|*|3 5 3 0|4 0 5 0
2|*|0 3 5 3|1 4 0 4
2|melancholy|5 3 5 0|0 5 3m 0
2|*|2 0 5 0|3 0 4 0
2|*|0 5 2 5|4 0 3 0
2|dreamy|0 5b 0 3|
2|*|0 3 3m 0|
2|*|0 5 3 4 0 2 5 0|
2|*|5 0 3 0 4 0 5 0|
`),
  ballad: progressionRows(`
3|melancholy|5 3 0 4|1 4 5 0
3|*|5 1 4 0|3 4 0 5
2|*|0 5 3 4|5 3 1 4
2|warm|0 5 1 4|4 0 3 5
2|*|1 4 0 3|5 0 4 3
2|*|5 3 1 4|0 5 3 4
2|*|3 0 4 5|1 4 0 5
2|dreamy|2 5 1 4|5 3 0 4
2|*|0 3 5 4|5 1 4 0
2|*|5 4 0 3|1 5 4 0
2|*|0 5 4 3|3 0 5 4
2|melancholy|5 3m 0 4|
2|*|1 4 0 3m|
2|*|5 3 0 4 1 4 5 0|
`),
  edm: progressionRows(`
4|bright|0 5 2 6|5 2 6 0
4|*|5 2 6 0|0 5 2 6
3|*|0 5 6 2|6 2 0 5
3|*|2 6 0 5|0 2 5 6
2|*|0 2 5 6|6 0 5 2
2|*|5 0 2 6|2 5 6 0
2|*|0 6 5 2|5 2 0 6
2|*|2 0 5 6|0 5 6 2
2|*|6 0 5 2|0 2 6 5
2|*|0 5 6 2|2 6 5 0
`),
  acoustic: progressionRows(`
3|warm|0 3 4 2|0 1 3 4
3|*|0 2 4 3|1 4 0 2
2|*|0 4 2 3|0 1 4 0
2|*|2 4 0 3|0 3 1 4
2|*|0 1 4 3|2 0 4 3
2|*|3 0 4 2|0 2 3 4
2|*|0 3 1 2|4 0 3 2
2|*|1 3 0 4|0 2 4 0
2|*|0 4 0 3|2 3 0 4
2|*|2 0 3 4|0 1 2 4
2|*|0 2 1 4|3 4 0 2
2|*|4 2 0 3|0 3 4 1
`),
  cinematic: progressionRows(`
3|dreamy|0 5 3 4|0 3 0 5
3|*|5 3 0 4|2 5 0 4
2|*|0 3 5 0|4 0 5 3
2|*|0 4 0 3|5 0 2 0
2|melancholy|5 1 4 0|3 5 0 4
2|*|0 2 5 4|0 5 0 3
2|*|3 0 4 5|5 3 1 4
2|*|0 6 5 3|4 0 5 6
2|*|5 0 3 4|1 4 0 5
2|*|0 5 6 4|3 0 5 0
2|dreamy|0 5b 3 0|
2|*|0 3m 5 4|
2|*|0 5 3 4 0 2 5 0|
`),
  modernrock: progressionRows(`
3|melancholy|0 4 5 3|5 3 0 4
3|*|5 3 0 4|0 5 3 4
3|*|0 5 3 4|5 3 4 0
3|*|5 3 4 0|0 4 5 3
2|*|0 4 5 3 1 4 0 3|
2|*|5 3 0 4 1 5 4 0|
2|*|0 5 3 4 0 4 1 4|
2|*|5 3 4 0 3 4 5 0|
2|warm|0 4 5 3m|
2|*|5 3 0 4 0s 4 5a 3|
2|*|0 5 3 4 5 3a 0 4|
`),
  dawn: progressionRows(`
3|dreamy|0 5 3 4|5 0 3 4
3|*|5 3 0 4|0 4 5 3
2|*|0 3 5 4|5 1 4 0
2|*|3 0 5 4|0 5 2 4
2|*|0 5 0 4|3 5 0 4
2|melancholy|5 1 4 0|0 3 5 0
2|*|0 2 5 4|5 3 0 5
2|*|5 0 4 3|1 4 0 5
2|*|0 4 0 5|5 3 4 0
2|*|3 5 0 2|0 5 3 0
2|dreamy|0 5b 3 4|
2|*|5 3m 0 4|
2|*|0 5 3 4 0 2 5 0|
`),
  nitelofi: progressionRows(`
3|melancholy|0 5 3 4|5 3 0 4
3|*|5 3 0 4|0 3 4 5
2|warm|0 5 1 4|5 1 4 0
2|*|5 1 4 0|0 5 3 4
2|*|0 3 4 5|1 4 0 3
2|*|1 4 0 5|5 3 1 4
2|*|0 5 2 4|3 0 5 4
2|*|5 3 1 4|0 5 4 3
2|*|2 5 1 4|0 3 0 4
2|*|0 3 5 4|5 0 4 3
2|dreamy|0 5 3m 4|
2|*|5 3 0 6b|
2|*|0 5 1 4 3 4 0 5|
`),
  citypop: progressionRows(`
3|warm|3 2 5 0|1 4 0 5
3|*|1 4 0 5|0 5 3 4
2|*|0 5 3 4|5 1 4 0
2|*|5 1 4 0|2 5 1 4
2|*|0 3 4 5|1 4 3 0
2|*|2 5 1 4|0 3 5 4
2|*|0 1 4 3|5 2 4 0
2|*|4 0 3 5|1 4 0 3
2|*|5 2 0 4|3 4 0 5
2|*|1 4 2 5|0 5 1 4
2|*|0 4 1 5|3 2 5 0
2|bright|0 6b 3 4|
2|*|1 4 0 3m|
2|*|3 2 5 0 1 4 0 5|
`),
  trap: progressionRows(`
3|melancholy|0 5 2 6|0 6 5 3
3|*|0 6 5 3|5 3 0 4
2|*|0 5 3 6|0 2 5 6
2|*|5 3 0 4|0 6 3 5
2|*|0 2 5 6|5 6 0 3
2|*|0 6 3 5|0 5 6 4
2|*|5 6 0 3|0 3 6 5
2|*|0 5 6 4|0 6 5 4
2|*|0 3 6 5|5 0 6 3
2|*|6 5 0 3|0 5 2 6
2|*|0 6b 5 3|
2|*|0 5 3m 6|
2|*|0 5 2 6 3 6 5 0|
`),
  house: progressionRows(`
4|bright|0 3 0 4|1 4 0 3
4|*|1 4 0 3|0 3 4 0
3|*|0 6 3 4|0 3 6 0
3|*|0 4 3 0|4 0 3 4
2|*|1 4 1 3|0 1 4 0
2|*|0 3 4 6|6 3 0 4
2|*|4 0 3 1|0 4 0 3
2|*|0 1 3 4|3 4 0 1
2|*|6 0 3 4|0 6 4 3
2|*|0 3 1 4|4 3 0 3
2|*|1 0 4 3|0 4 1 3
2|*|0 3 0 6|4 0 3 0
`),
  bossa: progressionRows(`
3|warm|1 4 0 0|1 4 0 5
3|*|1 4 0 5|5 1 4 0
3|*|5 1 4 0|2 5 1 4
2|*|2 5 1 4|0 1 4 3
2|*|0 1 4 3|1 4 3 0
2|*|1 4 3 0|2 5 1 4
2|*|1 4 0 3|5 1 4 3
2|*|2 5 1 4|1 4 0 5
2|*|5 2 1 4|0 1 4 0
2|*|0 3 1 4|1 4 2 5
2|*|1 2 4 0|5 1 4 0
2|*|3 1 4 0|1 4 0 5
2|*|1 4 5 0|2 5 1 4
2|*|1 4 0 5 2 5 1 0|
`),
  reggaeton: progressionRows(`
3|bright|0 6 5 6|0 5 3 4
3|*|0 5 3 4|0 3 6 5
2|*|0 3 6 5|5 6 0 3
2|*|5 6 0 3|0 5 6 4
2|*|0 5 6 4|0 4 5 3
2|*|0 4 5 3|6 5 0 4
2|*|0 6 3 5|5 3 6 0
2|*|6 0 5 3|0 6 4 5
2|*|0 5 6 3|3 6 5 0
2|*|5 3 0 6|0 6 5 4
2|*|0 3 5 6|6 4 0 5
2|bright|0 6b 5 4|
2|*|0 6 5 6 3 6 5 0|
`),
};

function tokenFits(token, scaleName) {
  const flavor = String(token).slice(1);
  if (!flavor) return true;
  const degree = Number(token[0]);
  const scale = SCALE_SETS[scaleName] || SCALE;
  if (!Number.isInteger(degree) || degree < 0 || degree >= scale.length) return false;
  const diatonic = scale[degree];
  const root = flavor === 'b' ? (diatonic + 11) % 12 : diatonic;
  const intervals = flavor === 's' ? [0, 5, 7, 11]
    : flavor === 'a' ? [0, 2, 4, 7]
      : flavor === 'm' ? [0, 3, 7, 10]
        : flavor === 'M' ? [0, 4, 7, 11]
          : [0, 4, 7, 10];
  return intervals.every(interval => scale.includes((root + interval) % 12));
}

function tokenRoman(token) {
  const degree = Number(token[0]);
  const flavor = String(token).slice(1);
  const base = ROMAN[degree] || 'I';
  if (flavor === 'm') return base === base.toUpperCase() ? base.toLowerCase() : base;
  if (flavor === 'b') return '♭' + base.toUpperCase();
  if (flavor === 's') return base + 'sus';
  if (flavor === 'a') return base + 'add9';
  if (flavor === 'M') return base.toUpperCase();
  if (flavor === 'd') return base + '7';
  return base;
}

function triadSpell(degree, tonic, scaleName) {
  const scale = SCALE_SETS[scaleName] || SCALE;
  const rootInterval = scale[degree % scale.length];
  const root = (tonic + rootInterval) % 12;
  const third = scale.includes((rootInterval + 3) % 12) ? 3 : 4;
  const intervals = third === 3 ? [0, 3, 7, 12] : [0, 4, 7, 12];
  return { root, degree, intervals, name: NOTE_NAMES[root] + (third === 3 ? 'm' : '') };
}

function colorSpell(degree, tonic, scaleName) {
  const scale = SCALE_SETS[scaleName] || SCALE;
  const rootInterval = scale[degree % scale.length];
  const has = interval => scale.includes((rootInterval + interval) % 12);
  const third = has(3) ? 3 : has(4) ? 4 : null;
  const seventh = has(10) ? 10 : has(11) ? 11 : null;
  if (third === null || seventh === null || !has(2)) return null;
  return {
    root: (tonic + rootInterval) % 12,
    degree,
    intervals: [0, third, seventh, 14],
    name: NOTE_NAMES[(tonic + rootInterval) % 12] + (third === 3 ? 'm9' : seventh === 10 ? '9' : 'maj9'),
  };
}

function spellToken(token, tonic, scaleName, closing, style) {
  const degree = Number(String(token)[0]);
  const flavor = String(token).slice(1);
  const scale = SCALE_SETS[scaleName] || SCALE;
  if (!flavor) {
    if (style === 'anthem') return triadSpell(degree, tonic, scaleName);
    if (!closing && (style === 'club' || style === 'soul')) {
      const colored = colorSpell(degree, tonic, scaleName);
      if (colored) return colored;
    }
    if ((scaleName === 'major' || !SCALE_SETS[scaleName]) && degree < 6) return chordForDegree(degree, tonic, closing, style);
    return chordForDegreeScaled(degree % scale.length, tonic, closing, scale);
  }
  const diatonic = scale[degree % scale.length];
  const root = (tonic + (flavor === 'b' ? (diatonic + 11) % 12 : diatonic)) % 12;
  let intervals = [0, 4, 7, 10];
  let suffix = '7';
  if (flavor === 's') { intervals = [0, 5, 7, 11]; suffix = 'sus4'; }
  else if (flavor === 'a') { intervals = [0, 2, 4, 7]; suffix = 'add9'; }
  else if (flavor === 'm') { intervals = [0, 3, 7, 10]; suffix = 'm7'; }
  else if (flavor === 'M') { intervals = [0, 4, 7, 11]; suffix = 'maj7'; }
  return { root, degree, intervals, name: NOTE_NAMES[root] + suffix };
}

function pickWeightedId(table, seed, salt) {
  const entries = Object.entries(table).filter(([, weight]) => weight > 0);
  const total = entries.reduce((sum, [, weight]) => sum + weight, 0);
  let roll = mix(seed, salt) % total;
  for (const [id, weight] of entries) {
    roll -= weight;
    if (roll < 0) return id;
  }
  return entries[0][0];
}

function usableRows(book, mood, scaleName, allowChromatic) {
  const rows = [];
  for (const row of book) {
    const tokens = row.p.concat(row.alt || []);
    if (!allowChromatic && tokens.some(token => !tokenFits(token, scaleName))) continue;
    let weight = row.w;
    if (row.mood === mood) weight *= 2;
    else if (row.mood !== '*') weight = Math.max(1, Math.round(weight / 2));
    rows.push({ ...row, w: weight });
  }
  return rows.length ? rows : [{ w: 1, mood: '*', p: ['0', '5', '3', '4'], alt: ['1', '4', '0', '5'] }];
}

function pickRow(rows, seed, salt) {
  const total = rows.reduce((sum, row) => sum + row.w, 0);
  let roll = mix(seed, salt) % total;
  for (const row of rows) {
    roll -= row.w;
    if (roll < 0) return row;
  }
  return rows[0];
}

function groove(ko, swing, kick, snare, hat, open = '') {
  const nums = value => (value ? String(value).split(',').filter(Boolean).map(Number) : []);
  return { ko, swing, kick: nums(kick), snare: nums(snare), hat: nums(hat), open: nums(open) };
}

const GROOVE_BOOK = {
  lofi: [
    groove('스윙 포켓', 0.12, '0,2.25', '1,3', '0.5,1.5,2.5,3.5'),
    groove('늘어지는 백비트', 0.08, '0,1.5,2.5', '3', '0,1,2,3'),
    groove('성긴 오픈햇', 0.1, '0,2.5', '1,2.75', '0.5,1.5,2.5,3.5', '1,3'),
    groove('하프타임 포켓', 0.06, '0,2.75', '2', '0.5,1.5,2.5,3.5'),
    groove('셔플 킥', 0.14, '0,0.75,2,2.75', '1,3', '0,1,2,3'),
    groove('늦은 스네어', 0.09, '0,2', '1.25,3.25', '0.5,1.5,2.5,3.5'),
    groove('밤의 림', 0.11, '0,1.75,3', '1,2.5', '0,1,2,3', '2'),
  ],
  pop: [
    groove('곧은 팝', 0, '0,2', '1,3', '0,0.5,1,1.5,2,2.5,3,3.5'),
    groove('밀어 올리는 킥', 0.02, '0,1.5,2,3', '1,3', '0.5,1.5,2.5,3.5'),
    groove('오프비트 킥', 0, '0,0.75,2,2.75', '1,3', '0,1,2,3'),
    groove('밝은 16비트', 0, '0,2,2.5', '1,3', '0,0.5,1,1.5,2,2.5,3,3.5', '1.5,3.5'),
    groove('클랩 백비트', 0, '0,1.75,2.5', '1,3', '0.5,1.5,2.5,3.5'),
    groove('드라이브', 0.02, '0,0.5,2,2.5', '1,3', '0,1,2,3'),
  ],
  rnb: [
    groove('뒤로 기대는 그루브', 0.09, '0,2.5', '1.25,3.25', '0.25,0.75,1.25,1.75,2.25,2.75,3.25,3.75'),
    groove('늦은 킥', 0.07, '0,2.75', '1.5,3.5', '0.75,1.75,2.75,3.75'),
    groove('싱코페이션', 0.1, '0,1.75', '1.25,3', '0.25,1.25,2.25,3.25'),
    groove('느린 포켓', 0.06, '0', '1.5,3.25', '0.75,1.25,2.75,3.25'),
    groove('고스트 스네어', 0.08, '0,2.25', '1.25,2.75,3.5', '0.25,0.75,1.75,2.75,3.75'),
    groove('스윙 햇', 0.11, '0,1.5,3', '1.75,3.25', '0.25,1.25,2.25,3.25'),
  ],
  ambient: [
    groove('먼 펄스', 0, '', '', '2'),
    groove('숨 고르기', 0, '', '', '3'),
    groove('여백', 0, '0', '', ''),
    groove('느린 하프', 0, '3', '', ''),
    groove('안개', 0, '', '', ''),
    groove('긴 잔향', 0, '0', '', '2'),
  ],
  ballad: [
    groove('하프타임', 0.04, '0', '2', '2.5'),
    groove('여린 브러시', 0.03, '0', '2,3.5', '2'),
    groove('느린 킥', 0.05, '0,3', '2', '2.5'),
    groove('긴 숨', 0.02, '0', '2', '3.5'),
    groove('후렴의 펄스', 0.04, '0,2', '2', '2.5'),
    groove('성긴 스네어', 0.03, '0,2.5', '2,3.5', '2'),
  ],
  edm: [
    groove('빅룸', 0, '0,1,2,3', '1,3', '0,0.5,1,1.5,2,2.5,3,3.5'),
    groove('드라이브 킥', 0, '0,0.5,2,2.5', '1,3', '0,1,2,3'),
    groove('드롭 스네어', 0, '0,1,2,3', '1,1.5,3', '0,1,2,3'),
    groove('퓨처 하프', 0, '0,2', '2', '0,1,2,3'),
    groove('브레이크다운', 0, '0', '3', '2'),
    groove('빌드 햇', 0, '0,1,2,3', '1,3', '0,0.5,1,1.5,2,2.5,3,3.5'),
  ],
  acoustic: [
    groove('브러시 투비트', 0.02, '0,2.5', '1,3', '0.5,1.5,2.5,3.5'),
    groove('가벼운 킥', 0.03, '0,1.5,3', '2', '0,1,2,3'),
    groove('성긴 브러시', 0.02, '0,2', '1.5,3.5', '0.5,2.5'),
    groove('스트럼 펄스', 0.04, '0,2,3', '1,3', '0.5,1.5,2.5,3.5'),
    groove('느린 포크', 0.03, '0', '2,3', '0,1,2,3'),
    groove('셔플 브러시', 0.08, '0,2.25', '1,3', '0.5,1.5,2.5,3.5'),
  ],
  cinematic: [
    groove('넓은 타격', 0, '0', '2', '1.5'),
    groove('먼 킥', 0, '0', '3', '2'),
    groove('저역 히트', 0, '0,3', '1.5', '0'),
    groove('드롭 전', 0, '0,2.5', '', '3'),
    groove('히트', 0, '0', '2', '0.5'),
    groove('느린 붐', 0, '0,1.5', '3', '2.5'),
  ],
  modernrock: [
    groove('여린 백비트', 0.03, '0,2', '2', '0,1,2,3'),
    groove('벌스의 킥', 0.02, '0', '2,3.5', '0.5,1.5,2.5,3.5'),
    groove('오픈햇', 0.04, '0,2.5', '2', '0,1,2,3', '2'),
    groove('하프타임', 0.03, '0,2.75', '2', '0.5,1.5,2.5,3.5'),
    groove('8비트', 0.02, '0,2', '1,3', '0,0.5,1,1.5,2,2.5,3,3.5'),
    groove('늦은 스네어', 0.05, '0,1.5', '2.25', '0,1,2,3'),
  ],
  dawn: [
    groove('새벽 피아노 펄스', 0.02, '0', '', '0'),
    groove('아주 여린 킥', 0.02, '0', '', '0,3'),
    groove('먼 틱', 0.01, '0', '', '0'),
    groove('두 번째 숨', 0.03, '0', '3', '0'),
    groove('잔향 킥', 0.02, '0', '', '0'),
    groove('느린 하프', 0.04, '0,3', '', '0'),
  ],
  nitelofi: [
    groove('느린 스윙', 0.12, '0', '2', '1,3'),
    groove('밤의 킥', 0.1, '0,2.75', '2', '1,3'),
    groove('오픈 스네어', 0.11, '0', '2', '3', '2'),
    groove('하프타임', 0.08, '0', '2', '1'),
    groove('성긴 포켓', 0.09, '0,3', '2', '1'),
    groove('셔플', 0.14, '0', '2,3.5', '3'),
  ],
  citypop: [
    groove('가벼운 디스코', 0.06, '0,2', '1,3', '0,0.5,1,1.5,2,2.5,3,3.5', '1.5,3.5'),
    groove('옥타브 킥', 0.05, '0,0.75,2,2.75', '1,3', '0.5,1.5,2.5,3.5'),
    groove('스윙 햇', 0.08, '0,1.5,2.5', '1,3', '0,1,2,3', '0.5,2.5'),
    groove('16비트 라이드', 0.04, '0,2,2.5', '1,3', '0,0.5,1,1.5,2,2.5,3,3.5'),
    groove('늦은 클랩', 0.07, '0,2', '1.25,3', '0.5,1.5,2.5,3.5', '1.5'),
    groove('저녁 드라이브', 0.09, '0,0.5,2,2.75', '1,3', '0,1,2,3', '0.5,2.5'),
  ],
  trap: [
    groove('하프타임 롤', 0, '0,2.75', '2', '0,0.5,1,1.5,2,2.5,3,3.125,3.25,3.375,3.5,3.75'),
    groove('마른 808', 0.01, '0', '2', '0,1,2,2.5,3,3.25,3.5,3.75', '1.5'),
    groove('킥 싱코프', 0, '0,1.5,3', '2', '0.5,1.5,2.5,3,3.125,3.25,3.5,3.75'),
    groove('느린 스네어', 0.02, '0,3.25', '2', '0,1,2,3,3.25,3.5,3.75'),
    groove('오픈 스페이스', 0, '0,2.5', '2', '0,1.5,3,3.125,3.25,3.5,3.75', '1'),
    groove('더블 킥', 0, '0,0.75,2.75', '2', '0.5,1.5,2.5,3,3.25,3.5,3.75'),
  ],
  house: [
    groove('포 온 더 플로어', 0.05, '0,1,2,3', '1,3', '0,0.25,0.5,0.75,1,1.25,1.5,1.75,2,2.25,2.5,2.75,3,3.25,3.5,3.75', '0.5,1.5,2.5,3.5'),
    groove('오픈햇', 0.04, '0,1,2,3', '1,3', '0,0.5,1,1.5,2,2.5,3,3.5', '0.5,1.5,2.5,3.5'),
    groove('셔플 16', 0.06, '0,1,2,3', '1,3', '0.25,0.75,1.25,1.75,2.25,2.75,3.25,3.75', '0.5,1.5,2.5,3.5'),
    groove('오프비트 클랩', 0.05, '0,1,2,3', '1,1.75,3', '0,0.25,0.75,1.25,1.75,2.25,2.75,3.25,3.75', '0.5,1.5,2.5,3.5'),
    groove('라이드', 0.04, '0,1,2,3', '1,3', '0,1,2,3', '0.5,1.5,2.5,3.5'),
    groove('따뜻한 루프', 0.05, '0,1,2,3', '1,3', '0.25,0.75,1.25,1.75,2.25,2.75,3.25,3.75', '0.5,1.5,2.5,3.5'),
  ],
  bossa: [
    groove('보사 림', 0.03, '0,2', '0.75,1.75,2.5,3.5', '0,1,2,3'),
    groove('싱코페이션', 0.02, '0,1.5,3', '0.5,1.5,2.75,3.25', '0.5,1.5,2.5,3.5'),
    groove('부드러운 오픈', 0.04, '0,2.5', '1,1.75,3,3.5', '0,2', '1.5,3.5'),
    groove('파티도', 0.03, '0,2', '0.5,1.5,2.5,3.5', '0,1,2,3'),
    groove('느린 클릭', 0.02, '0,3', '0.75,1.75,2.75,3.5', '0.5,1.5,2.5,3.5'),
    groove('투 비트', 0.05, '0,2', '1,1.5,3,3.5', '0,1,2,3', '2.5'),
  ],
  reggaeton: [
    groove('뎀보우', 0, '0,1.75,2.5', '0.75,1.75,2.75,3.5', '0,0.5,1,1.5,2,2.5,3,3.5'),
    groove('밀어 붙이는 킥', 0, '0,1.5,2.5,3.25', '0.75,1.75,2.75,3.5', '0.5,1.5,2.5,3.5', '1.5,3.5'),
    groove('짧은 스네어', 0.01, '0,0.75,1.5,2.5', '0.75,1.75,2.75,3.5', '0,1,2,3'),
    groove('오픈햇 뎀보우', 0, '0,1.75,3', '0.75,1.75,2.75,3.5', '0,0.5,1,1.5,2,2.5,3,3.5', '0.5,2.5'),
    groove('하프 변주', 0.02, '0,2.5', '0.75,1.75,2.75,3.5', '0.5,1.5,2.5,3.5'),
    groove('더블', 0, '0,0.75,1.75,2.5', '0.75,1.75,2.75,3.5', '0,1,2,3', '1.5'),
  ],
};

const RHYTHM_BOOK = {
  lofi: [[0, 0.75, 1.5, 2.5, 3.25], [0, 1, 2, 2.5, 3.5], [0.5, 1, 2, 3, 3.5], [0, 0.5, 1.5, 2.75, 3.25], [0, 1.5, 2, 3], [0.25, 1, 1.75, 2.5, 3.25], [0, 0.75, 2, 2.75, 3.5], [0.5, 1.25, 2, 3.25]],
  pop: [[0, 0.5, 1.5, 2, 2.75, 3.5], [0, 1, 1.5, 2.5, 3, 3.5], [0.5, 1, 2, 2.5, 3.5], [0, 0.75, 1.5, 2.5, 3], [0, 0.5, 1, 2, 3], [0.25, 1, 1.75, 2.5, 3.25], [0, 1.5, 2.25, 3, 3.5]],
  ambient: [[0, 1.5, 3], [0, 2], [0.5, 2.5], [0, 1, 3], [0, 2.5], [1, 3]],
  rnb: [[0, 0.75, 1.75, 2.5, 3.25], [0.5, 1.25, 2, 3, 3.5], [0, 1, 1.5, 2.75, 3.5], [0, 0.5, 2, 2.5, 3.25], [0.25, 1, 1.75, 3], [0, 1.25, 2.25, 3.5]],
  ballad: [[0, 1.25, 2.5], [0, 1.5, 3], [0.5, 2, 3.25], [0, 2, 3], [0, 1, 2.5], [0.5, 1.75, 3]],
  edm: [[0, 0.5, 1, 1.5, 2.5, 3.25], [0, 0.75, 1.5, 2, 2.5, 3.5], [0.5, 1, 1.5, 2.5, 3, 3.5], [0, 1, 2, 2.5, 3, 3.5], [0, 0.5, 1.5, 2.5, 3], [0, 1, 1.5, 2, 3.5]],
  acoustic: [[0, 0.75, 1.5, 2.5, 3.25], [0, 1, 2, 3], [0.5, 1.5, 2.5, 3.5], [0, 0.5, 1.5, 2.75], [0, 1.25, 2,5, 3.5], [0.25, 1, 2, 3.25]],
  cinematic: [[0, 2], [0, 1.5, 3], [0.5, 2.5], [0, 3], [0, 2.5], [1, 3]],
  modernrock: [[0, 1, 2.25, 3.25], [0, 0.75, 2, 3], [0.5, 1.5, 2.5, 3.5], [0, 1.5, 3], [0, 1, 2, 3.5], [0.5, 1.25, 2.5, 3.25]],
  dawn: [[0, 1.5, 3], [0, 2], [0.5, 2.5], [0, 1, 3], [0, 2.5], [1, 3]],
  nitelofi: [[0, 1, 2.25, 3.25], [0, 0.75, 1.75, 3], [0.5, 1.5, 2.75], [0, 2, 3.25], [0.25, 1.25, 2.5], [0, 1.5, 3]],
  citypop: [[0, 0.5, 1.5, 2, 3, 3.5], [0, 0.75, 1.5, 2.5, 3.25], [0.5, 1, 2, 2.75, 3.5], [0, 1, 1.75, 2.5, 3.5], [0, 0.5, 1.75, 2.5, 3], [0.25, 1, 2, 3.25]],
  trap: [[0, 1.5, 3], [0, 2, 3.25, 3.5], [0.5, 2.5, 3.75], [0, 0.75, 2, 3.5], [0, 2.5, 3.25], [0.5, 1.5, 3]],
  house: [[0, 0.5, 1.5, 2, 3, 3.5], [0, 1, 1.5, 2.5, 3], [0.5, 1, 2, 2.5, 3.5], [0, 0.75, 1.5, 2.5, 3.25], [0, 0.5, 1.5, 2.5, 3.5], [0, 1, 2, 3]],
  bossa: [[0, 0.75, 1.5, 2.5, 3.25], [0.5, 1.5, 2, 3, 3.5], [0, 1, 1.75, 2.75, 3.5], [0.75, 1.5, 2.5, 3.25], [0, 0.5, 1.75, 3], [0.25, 1.25, 2.25, 3.25]],
  reggaeton: [[0, 0.75, 1.5, 2.75, 3.5], [0, 1, 1.75, 2.5, 3.25], [0.5, 1.5, 2.75, 3.5], [0, 0.75, 2, 2.75, 3.5], [0, 1.5, 2.5, 3.25], [0.25, 1, 2, 3.5]],
};

function conceptSwing(genre, grooveSwing, seed) {
  const profile = PROFILES[genre];
  if (profile.swingRange) {
    const [min, max] = profile.swingRange;
    if (max <= min) return min;
    const steps = 4;
    const tilt = (mix(seed, 0x51F) % (steps + 1)) / steps;
    const value = min + (max - min) * (0.45 + 0.55 * tilt) * (0.7 + 0.3 * clamp(grooveSwing / 0.16, 0, 1));
    return clamp(Math.round(value * 1000) / 1000, min, max);
  }
  const base = Number.isFinite(grooveSwing) ? grooveSwing : profile.swing;
  return clamp(Math.round((base + ((mix(seed, 0x51F) % 5) - 2) * 0.01) * 1000) / 1000, 0, 0.18);
}

function busyRhythm(rhythm) {
  const out = [];
  for (const step of rhythm) {
    out.push(step);
    const next = Math.round((step + 0.5) * 4) / 4;
    if (next < 3.9 && !rhythm.some(value => Math.abs(value - next) < 0.01)) out.push(next);
  }
  return out.sort((a, b) => a - b);
}

function sparseRhythm(rhythm) {
  const picked = rhythm.filter((_, index) => index % 2 === 0);
  return picked.length ? picked : [0];
}

function planConcept(genre, mood, scaleName, seed, bars, structure) {
  const family = structure[0]?.family || 'verseChorus';
  const salt = (CONCEPT_SALT[genre] || 13) * 100 + ({ warm: 3, dreamy: 5, bright: 7, melancholy: 9 }[mood] || 3);
  const allowChromatic = seed !== 42 && seed !== 99;
  const book = PROGRESSION_BOOKS[genre] || PROGRESSION_BOOKS.lofi;
  let row = pickRow(usableRows(book, mood, scaleName, allowChromatic), seed, salt);
  const classic = seed === 42 && genre === 'lofi' && mood === 'warm';
  if (classic) row = { p: ['0', '5', '1', '4'], alt: null, mood: 'warm' };
  const grooveList = GROOVE_BOOK[genre] || GROOVE_BOOK.lofi;
  const feel = grooveList[mix(seed, 0x600 + salt) % grooveList.length];
  const rhythms = RHYTHM_BOOK[genre] || RHYTHM_BOOK.lofi;
  const rhythm = rhythms[mix(seed, 0x91 + salt) % rhythms.length];
  const arcWeights = {
    lofi: { wave: 5, bloom: 3, lift: 2, ebb: 1, drop: 1 },
    pop: { lift: 12, bloom: 1, wave: 1, drop: 0, ebb: 0 },
    rnb: { ebb: 10, wave: 2, bloom: 1, lift: 0, drop: 0 },
    ambient: { ebb: 10, bloom: 1, wave: 1, drop: 0, lift: 0 },
    ballad: { bloom: 10, ebb: 1, wave: 1, lift: 0, drop: 0 },
    edm: { drop: 12, lift: 1, bloom: 0, wave: 0, ebb: 0 },
    acoustic: { wave: 8, bloom: 2, lift: 1, ebb: 1, drop: 0 },
    cinematic: { drop: 12, bloom: 1, lift: 1, ebb: 0, wave: 0 },
    modernrock: { lift: 10, bloom: 2, wave: 1, ebb: 0, drop: 0 },
    dawn: { bloom: 10, ebb: 1, wave: 1, lift: 0, drop: 0 },
    nitelofi: { ebb: 10, bloom: 1, wave: 1, lift: 0, drop: 0 },
    citypop: { lift: 8, wave: 2, bloom: 1, drop: 0, ebb: 0 },
    trap: { drop: 10, ebb: 1, wave: 1, lift: 1, bloom: 0 },
    house: { wave: 10, ebb: 2, bloom: 0, lift: 0, drop: 0 },
    bossa: { wave: 5, bloom: 3, ebb: 2, lift: 1, drop: 0 },
    reggaeton: { lift: 5, drop: 4, wave: 2, bloom: 1, ebb: 0 },
  }[genre] || { bloom: 3, lift: 3, wave: 2, drop: 2, ebb: 2 };
  const arcId = pickWeightedId(arcWeights, seed, 0xA4C);
  const textureWeights = {
    lofi: { stab: 6, arp: 2, pad: 1, strum: 1 },
    pop: { stab: 6, arp: 3, strum: 1, pad: 0 },
    rnb: { pad: 7, stab: 2, arp: 0, strum: 0 },
    ambient: { pad: 8, arp: 0, strum: 0, stab: 0 },
    ballad: { pad: 8, arp: 0, strum: 0, stab: 0 },
    edm: { stab: 6, arp: 2, pad: 1, strum: 0 },
    acoustic: { strum: 8, arp: 1, pad: 0, stab: 0 },
    cinematic: { pad: 5, stab: 4, arp: 0, strum: 0 },
    modernrock: { arp: 7, strum: 2, pad: 1, stab: 0 },
    dawn: { arp: 7, pad: 2, strum: 0, stab: 0 },
    nitelofi: { pad: 8, arp: 1, strum: 0, stab: 0 },
    citypop: { stab: 10, arp: 1, pad: 1, strum: 0 },
    trap: { stab: 6, pad: 2, arp: 1, strum: 0 },
    house: { stab: 8, arp: 0, pad: 0, strum: 0 },
    bossa: { strum: 4, stab: 3, arp: 1, pad: 1 },
    reggaeton: { stab: 6, arp: 2, pad: 1, strum: 0 },
  }[genre] || { pad: 3, stab: 2, arp: 2, strum: 2 };
  const texture = pickWeightedId(textureWeights, seed, 0x71);
  const bassWeights = {
    lofi: { sync: 6, root: 2, pulse: 1, walk: 1 },
    pop: { pulse: 6, root: 2, sync: 1, walk: 0 },
    rnb: { sync: 8, root: 1, walk: 0, pulse: 0 },
    ambient: { root: 8, walk: 0, sync: 0, pulse: 0 },
    ballad: { root: 8, sync: 0, walk: 0, pulse: 0 },
    edm: { pulse: 8, sync: 0, root: 0, walk: 0 },
    acoustic: { walk: 6, root: 2, sync: 1, pulse: 0 },
    cinematic: { root: 8, walk: 0, sync: 0, pulse: 0 },
    modernrock: { root: 6, sync: 2, walk: 1, pulse: 0 },
    dawn: { root: 7, sync: 1, walk: 0, pulse: 0 },
    nitelofi: { root: 7, sync: 1, pulse: 0, walk: 0 },
    citypop: { sync: 5, walk: 3, root: 1, pulse: 0 },
    trap: { pulse: 5, root: 3, sync: 1, walk: 0 },
    house: { sync: 8, pulse: 0, root: 0, walk: 0 },
    bossa: { sync: 6, root: 2, walk: 1, pulse: 0 },
    reggaeton: { sync: 6, pulse: 2, root: 1, walk: 0 },
  }[genre] || { root: 3, sync: 2, pulse: 2, walk: 2 };
  const bass = pickWeightedId(bassWeights, seed, 0xBACE);
  const introWeights = ['ambient', 'cinematic', 'dawn'].includes(genre)
    ? { space: 4, chords: 3, melody: 2, bass: 2, pulse: 1 }
    : ['edm', 'house'].includes(genre) && family === 'build'
      ? { pulse: 4, chords: 2, melody: 2, bass: 2, space: 1 }
      : { chords: 3, melody: 3, pulse: 2, bass: 2, space: 2 };
  const outroWeights = ['ambient', 'cinematic', 'dawn', 'ballad'].includes(genre)
    ? { hold: 4, thin: 3, cadence: 2, tag: 2 }
    : { cadence: 3, tag: 3, hold: 2, thin: 2 };
  const intro = pickWeightedId(introWeights, seed, 0x111);
  const outro = pickWeightedId(outroWeights, seed, 0x222);
  const steady = ['modernrock', 'bossa', 'house', 'trap', 'edm', 'reggaeton', 'citypop', 'pop'].includes(genre);
  const hold = !classic && !steady && mix(seed, 0x401) % 3 !== 0 ? 2 : 1;
  let modulation = null;
  if (!classic && seed !== 42 && seed !== 99 && bars >= 16 && scaleName !== 'pentatonic' && scaleName !== 'dorian' && mix(seed, 0xB0D) % 5 !== 0) {
    if (scaleName === 'minor') {
      modulation = allowChromatic && mix(seed, 0xB0E) % 3 === 0
        ? { semi: 7, scale: 'major', ko: '브리지에서 딸림조', en: 'bridge to the dominant' }
        : { semi: 3, scale: 'major', ko: '브리지에서 관계장조', en: 'bridge to the relative major' };
    } else if (allowChromatic && mix(seed, 0xB0E) % 4 === 0) modulation = { semi: 5, scale: 'major', ko: '브리지에서 버금딸림조', en: 'bridge to the subdominant' };
    else if (allowChromatic && mix(seed, 0xB0E) % 4 === 1) modulation = { semi: 7, scale: 'major', ko: '브리지에서 딸림조', en: 'bridge to the dominant' };
    else modulation = { semi: 9, scale: 'minor', ko: '브리지에서 관계단조', en: 'bridge to the relative minor' };
  }
  const bridgePool = [['1', '4', '0', '5'], ['3', '4', '0', '3'], ['5', '1', '4', '0'], ['0', '3', '4', '0']];
  const bridge = bridgePool[mix(seed, 0xB41) % bridgePool.length];
  let color = null;
  let colorAt = -1;
  if (genre === 'modernrock' && allowChromatic && bars >= 8 && (mix(seed, 0xC010) % 2 === 0 || seed % 5 === 2)) {
    const scale = SCALE_SETS[scaleName] || SCALE;
    const shapes = ROCK_COLORS.filter(shape => colorFits(scale, shape));
    if (shapes.length) {
      color = shapes[mix(seed, 0xB17) % shapes.length];
      colorAt = 4 + (mix(seed, 0xB0) % Math.max(1, bars - 5));
    }
  }
  let motif = MOTIFS[mix(seed, 0x33C + salt) % MOTIFS.length].slice();
  const motifFlip = mix(seed, 0x341 + salt) % 3;
  if (motifFlip === 1) motif = motif.map((step, index) => (index ? -step : step));
  else if (motifFlip === 2) motif = motif.slice().reverse();
  if (genre === 'house' || genre === 'ambient') motif = motif.slice(0, 3);
  const motifRegister = (mix(seed, 0x33D + salt) % 5) - 1;
  const motifLift = genre === 'house' ? [0, 1, 2, 2][mix(seed, 0x33E + salt) % 4]
    : genre === 'edm' ? [3, 5, 5, 7][mix(seed, 0x33E + salt) % 4]
      : [2, 3, 5, 7][mix(seed, 0x33E + salt) % 4];
  const motifAccent = 1 + (mix(seed, 0x33F + salt) % Math.max(1, motif.length - 1));
  const displace = [0, 0.25, 0.5, 0.75][mix(seed, 0xD15) % 4];
  const pool = GENRE_TIMBRE[genre];
  const timbre = pool ? pool[mix(seed, 0x77) % pool.length] : TIMBRES[mix(seed, 0x77) % TIMBRES.length];
  const swing = conceptSwing(genre, feel.swing, seed);
  const progression = row.p.slice(0, 8).map(tokenRoman).join('–');
  const form = FORM_KO[family] || '벌스-후렴';
  const summary = [form, progression, feel.ko, modulation ? modulation.ko : ''].filter(Boolean).join(' · ');
  const prompt = `Form: ${FORM_EN[family] || family}. Progression: ${progression.replace(/–/g, '-')}. Feel: ${feel.ko}. Arc: ${ARC_BOOK[arcId].en}. Intro: ${intro}. Outro: ${outro}.${modulation ? ` ${modulation.en}.` : ''}`;
  return {
    family, form, progression, p: row.p, alt: row.alt, hold, bridge, modulation, color, colorAt,
    feel: feel.ko, groove: feel, rhythm, rhythmBusy: busyRhythm(rhythm), rhythmSparse: sparseRhythm(rhythm),
    arc: ARC_BOOK[arcId], arcId, texture, bass, intro, outro, motif, motifRegister, motifLift, motifAccent, displace, swing, timbre, classic,
    summary, prompt,
    signature: [family, row.p.join(' '), feel.ko, texture, bass, arcId, intro, outro, hold, motif.join(','), motifRegister, motifLift].join('|'),
  };
}

function tokenAt(bar, role, concept) {
  if (role === 'bridge' && concept.bridge) return concept.bridge[Math.max(0, bar) % concept.bridge.length];
  const step = concept.hold === 2 && role !== 'chorus' && role !== 'pre' ? 2 : 1;
  const cursor = Math.floor(Math.max(0, bar) / step);
  const span = concept.p.length;
  const cycle = concept.alt ? span * 2 : span;
  const pos = cursor % cycle;
  const seq = concept.alt && pos >= span ? concept.alt : concept.p;
  return seq[pos % seq.length];
}

function shapeEnergy(arc, role, barInSection, spanBars, cues) {
  const base = arc[role] ?? arc.verse ?? 0.75;
  const ramp = spanBars > 1 ? barInSection / (spanBars - 1) : 1;
  let shape = 0.94 + ramp * 0.06;
  if (arc.shape === 'swell') shape = 0.84 + ramp * 0.16;
  else if (arc.shape === 'late') shape = ramp < 0.55 ? 0.8 : 0.8 + (ramp - 0.55) * 0.44;
  else if (arc.shape === 'peak') shape = 0.78 + Math.sin(ramp * Math.PI) * 0.22;
  let energy = base * shape;
  if (cues.wantLift && role === 'chorus') energy += 0.05;
  if (cues.wantSpace) energy *= 0.9;
  return clamp(energy, 0.22, 1);
}

function developShape(motif, role, occurrence, family, barInSection) {
  let kind = 'prime';
  let shift = 0;
  if (role === 'intro') kind = 'fragment';
  else if (role === 'pre') { kind = 'sequence'; shift = 1 + (barInSection % 2); }
  else if (role === 'chorus') { kind = barInSection % 2 ? 'expand' : 'prime'; shift = 2; }
  else if (role === 'bridge') kind = occurrence % 2 ? 'invert' : 'retrograde';
  else if (role === 'outro') kind = 'retrograde';
  else if (role === 'verse') {
    if (family === 'through') { kind = 'sequence'; shift = occurrence; }
    else if (occurrence === 2) { kind = 'sequence'; shift = 1; }
    else if (barInSection % 2 === 1) { kind = 'sequence'; shift = 1; }
  }
  let shape = motif.slice();
  if (kind === 'invert') shape = shape.map((step, index) => (index ? -step : step));
  else if (kind === 'retrograde') shape = shape.slice().reverse();
  else if (kind === 'expand') shape = shape.map((step, index) => (index ? step + Math.sign(step || 1) : step));
  else if (kind === 'fragment') shape = shape.slice(0, Math.max(2, Math.ceil(shape.length / 2)));
  if (kind === 'sequence') shape = shape.map(step => step + shift);
  return shape;
}

function layerGate(role, mode, barInSection, spanBars, layer) {
  if (role === 'intro') {
    if (mode === 'space') return layer === 'chords' || (layer === 'bass' && barInSection >= spanBars - 1);
    if (mode === 'chords') return layer !== 'melody' || barInSection >= spanBars - 1;
    if (mode === 'melody') return layer !== 'drums' || barInSection > 0;
    if (mode === 'bass') return layer !== 'chords' || barInSection >= spanBars - 1;
    return true;
  }
  if (role === 'outro') {
    if ((mode === 'thin' || mode === 'cadence') && layer === 'drums') return false;
    if (mode === 'hold' && layer === 'melody' && barInSection > 0) return false;
    return true;
  }
  return true;
}

function coarseContour(motif) {
  const end = motif[motif.length - 1];
  const peak = Math.max(...motif);
  if (peak > 1 && end < peak && end >= 0) return 'arch';
  if (end > 1) return 'rise';
  if (end < 0) return 'fall';
  return motif.some((step, index) => index && step < motif[index - 1]) ? 'wave' : 'neighbor';
}

function composeConcept(input = {}) {
  const settings = normalizeSettings(input);
  const { genre, mood, bpm, bars, seed, instruments } = settings;
  const random = seededRandom(seed);
  const profile = PROFILES[genre];
  const scaleName = settings.scale;
  const activeScale = SCALE_SETS[scaleName];
  const key = KEYS[settings.key];
  const beatSeconds = 60 / bpm;
  const events = [];
  const chords = [];
  const cues = arrangementCues(input);
  const structure = planStructure(bars, genre, mood, seed, cues);
  const spans = sectionSpans(structure);
  const concept = planConcept(genre, mood, scaleName, seed, bars, structure);
  const style = profile.harmony;
  let previousVoicing;
  let lastMelody = 72 + key;

  function add(instrument, beat, length, midi, velocity, humanize = true, extra) {
    const driftScale = instrument === 'melody' ? 0.02 : instrument === 'chords' ? 0.008 : 0.012;
    const drift = humanize && genre !== 'ambient' && genre !== 'cinematic' ? (random() - 0.5) * driftScale : 0;
    const time = Math.max(0, beat * beatSeconds + drift);
    const duration = Math.min(length * beatSeconds, bars * 4 * beatSeconds - time);
    if (duration <= 0 || !Number.isInteger(midi)) return;
    const feel = 0.9 + random() * 0.18;
    const event = { instrument, time: round(time), duration: round(duration), midi, velocity: round(clamp(velocity * feel, 0.1, 0.95)) };
    if (extra) {
      event.vowelFrom = round(clamp(extra.vowelFrom, 0, 1));
      event.vowelTo = round(clamp(extra.vowelTo, 0, 1));
    }
    events.push(event);
  }

  const humRandom = seededRandom(mix(seed, 0xBEE5));
  function addHum(beat, length, midi, velocity, extra) {
    const drift = (humRandom() - 0.5) * 0.012;
    const time = Math.max(0, beat * beatSeconds + drift);
    const duration = Math.min(length * beatSeconds, bars * 4 * beatSeconds - time);
    const feel = 0.92 + humRandom() * 0.12;
    if (duration <= 0 || !Number.isInteger(midi)) return;
    events.push({
      instrument: 'hum', time: round(time), duration: round(duration), midi,
      velocity: round(clamp(velocity * feel, 0.08, 0.72)),
      vowelFrom: round(clamp(extra.vowelFrom, 0, 1)),
      vowelTo: round(clamp(extra.vowelTo, 0, 1)),
    });
  }

  function scaleStep(midi, direction = 1) {
    const step = direction < 0 ? -1 : 1;
    for (let note = midi + step; note >= 36 && note <= 96; note += step) {
      if (pitchInScale(note, key, activeScale)) return note;
    }
    let best = null;
    for (let note = 48; note <= 96; note++) {
      if (!pitchInScale(note, key, activeScale)) continue;
      if (best === null || Math.abs(note - midi) < Math.abs(best - midi)) best = note;
    }
    return best ?? midi;
  }

  function walk(midi, steps) {
    let note = midi;
    const dir = steps < 0 ? -1 : 1;
    for (let index = 0; index < Math.abs(steps); index++) note = scaleStep(note, dir);
    while (note > 88) note -= 12;
    while (note < 60) note += 12;
    return note;
  }

  function writeChords(texture, voicing, beat, energy, role, finalBar) {
    const fuller = role === 'chorus' || role === 'pre';
    const pad = (level = 0.5) => voicing.forEach((midi, index) => add('chords', beat + index * 0.018, finalBar ? 3.7 : 3.85, midi, energy * level));
    if (genre === 'house') {
      pad(role === 'intro' || role === 'outro' || finalBar ? 0.34 : 0.18);
      if (!finalBar && role !== 'intro') [0.5, 1.5, 2.5, 3.5].forEach(position => voicing.forEach((midi, index) => add('chords', beat + position + index * 0.01, 0.46, midi, energy * 0.32)));
      return;
    }
    if (genre === 'edm') {
      if (role === 'chorus') {
        [0, 2].forEach(position => voicing.forEach((midi, index) => {
          const tone = midi + 12 <= 88 ? midi + 12 : midi;
          add('chords', beat + position + index * 0.008, 0.62, index ? tone : midi, energy * 0.5);
        }));
      } else if (role === 'pre') {
        [0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5].forEach((position, index) => add('chords', beat + position, 0.22, voicing[index % voicing.length], energy * (0.28 + index * 0.03)));
      } else pad(role === 'verse' ? 0.36 : 0.42);
      return;
    }
    if (genre === 'cinematic' && (texture === 'stab' || role === 'chorus') && !finalBar) {
      pad(0.4);
      voicing.forEach((midi, index) => add('chords', beat + index * 0.02, 1.4, Math.max(40, midi - 12), energy * 0.55));
      return;
    }
    if (genre === 'modernrock') {
      pad(fuller ? 0.48 : 0.3);
      if (!finalBar && role !== 'intro' && role !== 'outro') {
        const steps = fuller ? [0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5] : texture === 'strum' ? [0, 1.5, 3] : [0, 1, 2.5, 3];
        steps.forEach((position, index) => {
          const tone = voicing[index % voicing.length];
          add('chords', beat + position, fuller ? 0.34 : 0.48, tone + 12 <= 86 ? tone + 12 : tone, energy * (fuller ? 0.36 : 0.2));
        });
      }
      return;
    }
    if (finalBar || role === 'outro' || role === 'intro' || texture === 'pad') {
      pad(genre === 'ambient' || genre === 'cinematic' || genre === 'dawn' ? 0.56 : 0.5);
      if (role === 'chorus' && !finalBar) {
        const top = voicing.at(-1) + 12;
        if (top <= 88) add('chords', beat + 0.45, 2.5, top, energy * 0.2);
      }
      return;
    }
    if (genre === 'house' && texture === 'stab') {
      [0.5, 1.5, 2.5, 3.5].forEach(position => voicing.forEach((midi, index) => add('chords', beat + position + index * 0.008, 0.28, midi, energy * 0.42)));
      return;
    }
    if (genre === 'bossa' && texture !== 'pad') {
      const comps = texture === 'arp' ? [0, 1, 1.5, 2.5, 3.5] : texture === 'strum' ? [0, 0.75, 2, 2.75, 3.5] : [0, 1.5, 2.5, 3.5];
      comps.forEach((position, index) => {
        if (texture === 'arp') add('chords', beat + position, 0.38, voicing[index % voicing.length], energy * 0.4);
        else voicing.forEach((midi, voice) => add('chords', beat + position + voice * 0.012, 0.36, midi, energy * 0.38));
      });
      return;
    }
    if (texture === 'arp') {
      const steps = genre === 'edm' || genre === 'house' ? [0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5] : [0, 0.75, 1.5, 2.25, 3];
      steps.forEach((position, index) => add('chords', beat + position, genre === 'edm' ? 0.3 : 0.5, voicing[index % voicing.length], energy * 0.44));
      return;
    }
    if (texture === 'stab') {
      const hits = genre === 'edm' ? [0, 1, 2, 3] : [0, 1.5, 2.75];
      hits.forEach(position => voicing.forEach((midi, index) => add('chords', beat + position + index * 0.016, 0.42, midi, energy * 0.46)));
      return;
    }
    [0, 2].forEach(position => voicing.forEach((midi, index) => add('chords', beat + position + index * 0.04, 1.2, midi, energy * 0.42)));
  }

  function writeBass(kind, chord, beat, energy, role, finalBar) {
    const root = 36 + chord.root;
    const fifthPc = (chord.root + 7) % 12;
    const fifth = pitchInScale(fifthPc, key, activeScale) ? 36 + fifthPc : root + 12;
    const upper = root + 12 <= 60 ? root + 12 : root;
    const fuller = role === 'chorus' || role === 'pre';
    if (finalBar || role === 'outro') { add('bass', beat, 3.5, root, 0.62 * energy); return; }
    if (genre === 'trap') {
      add('bass', beat, kind === 'pulse' ? 1.4 : 3.1, root, 0.78 * energy, false);
      if (kind === 'pulse' || kind === 'sync') add('bass', beat + 2, 1.1, root, 0.55 * energy, false);
      if (kind === 'walk' || kind === 'sync') add('bass', beat + 3.25, 0.4, upper, 0.44 * energy, false);
      return;
    }
    if (genre === 'bossa') {
      add('bass', beat, 0.8, root, 0.58 * energy);
      add('bass', beat + (kind === 'sync' ? 1.5 : 2), 0.7, fifth <= 55 ? fifth : root, 0.46 * energy);
      if (kind === 'walk' || kind === 'pulse') add('bass', beat + 3.5, 0.32, upper, 0.36 * energy);
      return;
    }
    if (genre === 'reggaeton') {
      add('bass', beat, 0.62, root, 0.72 * energy, false);
      add('bass', beat + (kind === 'sync' ? 1.75 : 1.5), 0.48, root, 0.54 * energy, false);
      add('bass', beat + 2.5, 0.52, kind === 'walk' ? upper : root, 0.6 * energy, false);
      return;
    }
    if (genre === 'citypop') {
      add('bass', beat, 0.36, root, 0.62 * energy);
      add('bass', beat + 0.75, 0.26, upper, 0.38 * energy);
      add('bass', beat + (kind === 'sync' ? 1.75 : 2), 0.4, fifth <= 55 ? fifth : root, 0.5 * energy);
      if (kind !== 'root') add('bass', beat + 3.5, 0.26, upper, 0.36 * energy);
      return;
    }
    if (genre === 'house') {
      add('bass', beat, 0.42, root, 0.62 * energy, false);
      add('bass', beat + 0.75, 0.32, upper, 0.4 * energy, false);
      add('bass', beat + 1.75, 0.4, fifth <= 55 ? fifth : root, 0.5 * energy, false);
      add('bass', beat + 2.5, 0.34, root, 0.46 * energy, false);
      add('bass', beat + 3.5, 0.24, upper, 0.34 * energy, false);
      return;
    }
    if (genre === 'edm') {
      if (role === 'chorus') {
        add('bass', beat, 1.85, root, 0.84 * energy, false);
        add('bass', beat + 2, 1.7, root, 0.8 * energy, false);
      } else if (role === 'pre') {
        [0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5].forEach((position, index) => add('bass', beat + position, 0.18, root, energy * (0.28 + index * 0.05), false));
      } else add('bass', beat, 1.5, root, 0.42 * energy, false);
      return;
    }
    if (kind === 'pulse') {
      [0, 0.75, 1.5, 2.5, 3.25].forEach((position, index) => add('bass', beat + position, index === 4 ? 0.46 : 0.34, index === 3 ? upper : root, energy * (index % 2 ? 0.56 : 0.7), genre !== 'edm'));
      return;
    }
    if (kind === 'sync') {
      add('bass', beat, 1.15, root, 0.66 * energy);
      add('bass', beat + (genre === 'rnb' ? 1.75 : 1.5), 1, root, 0.54 * energy);
      add('bass', beat + 3.25, 0.48, fifth <= 60 ? fifth : root, 0.4 * energy);
      return;
    }
    if (kind === 'walk') {
      const passing = scaleStep(root + 2, 1);
      add('bass', beat, 0.8, root, 0.64 * energy);
      add('bass', beat + 1, 0.75, passing <= 60 ? passing : root, 0.48 * energy);
      add('bass', beat + 2, 0.8, fifth <= 60 ? fifth : upper, 0.56 * energy);
      add('bass', beat + 3, 0.65, upper, 0.46 * energy);
      return;
    }
    if (genre === 'cinematic' || genre === 'dawn') {
      add('bass', beat, 3.5, root, 0.6 * energy);
      if (genre === 'dawn' && fuller) add('bass', beat + 2.5, 0.75, upper, 0.32 * energy);
      return;
    }
    add('bass', beat, genre === 'ambient' ? 3.6 : 1.5, root, 0.66 * energy);
    if (genre !== 'ambient') add('bass', beat + (genre === 'rnb' ? 1.75 : 2), 1.15, root, 0.55 * energy);
  }

  function writePattern(pattern, beat, energy, swing, role, thin, sectionEnd) {
    pattern.kick.forEach((position, index) => {
      if (thin && index > 0 && genre !== 'house') return;
      add('kick', beat + position, 0.24, 36, energy * (index === 0 ? 0.68 : 0.46));
    });
    if (!thin) pattern.snare.forEach((position, index) => add('snare', beat + position, 0.14, position % 1 ? 37 : 38, energy * (index ? 0.32 : 0.44)));
    const hats = thin ? pattern.hat.filter((_, index) => index % 2 === 0) : pattern.hat;
    hats.forEach(position => {
      const off = Math.abs((position % 1) - 0.5) < 0.02;
      const sixteenth = Math.abs((position * 4) % 2 - 1) < 0.08;
      const shuffle = genre === 'house' ? (sixteenth ? swing : 0) : (off ? swing : 0);
      add('hat', beat + position + shuffle, position % 0.25 ? 0.03 : 0.05, 42, energy * 0.16);
    });
    if ((!thin || genre === 'house' || genre === 'reggaeton') && pattern.open) pattern.open.forEach(position => add('hat', beat + position, 0.11, 46, energy * 0.18));
    if (sectionEnd && !thin && role !== 'outro' && genre !== 'ambient' && genre !== 'dawn') {
      [3.5, 3.75].forEach((position, index) => add('snare', beat + position, 0.08, 38, energy * (0.14 + index * 0.05)));
    }
  }

  for (let bar = 0; bar < bars; bar++) {
    const finalBar = bar === bars - 1;
    const span = spans.find(section => bar >= section.start && bar < section.start + section.bars) || spans.at(-1);
    const role = span.role;
    const barInSection = bar - span.start;
    const sectionEnd = bar === span.start + span.bars - 1;
    const fuller = role === 'chorus' || role === 'pre';
    const local = concept.modulation && role === 'bridge' && !finalBar ? concept.modulation : null;
    const localKey = local ? (key + local.semi) % 12 : key;
    const localScale = local ? local.scale : scaleName;
    const homeToken = concept.p[0];
    const useColor = concept.color && bar === concept.colorAt && !finalBar;
    const token = finalBar ? homeToken : tokenAt(bar, role, concept);
    const chord = useColor
      ? { root: (key + concept.color.offset) % 12, degree: -1, intervals: concept.color.intervals, name: NOTE_NAMES[(key + concept.color.offset) % 12] + concept.color.suffix }
      : spellToken(token, finalBar ? key : localKey, finalBar ? scaleName : localScale, finalBar, style);
    if (finalBar) {
      const home = spellToken(homeToken, key, scaleName, false, style);
      chord.root = home.root;
      if (!String(homeToken).slice(1) && scaleName === 'major' && Number(homeToken[0]) < 6) {
        const closed = chordForDegree(Number(homeToken[0]), key, true, style);
        chord.intervals = closed.intervals;
        chord.name = closed.name;
        chord.root = closed.root;
      }
    }
    const voicing = voiceChord(chord, previousVoicing);
    previousVoicing = voicing;
    const beat = bar * 4;
    chords.push({ ...chord, bar, notes: voicing, time: round(beat * beatSeconds), duration: round(4 * beatSeconds) });
    let energy = shapeEnergy(concept.arc, role, barInSection, span.bars, cues);
    if (genre === 'house') energy = 0.7 + (energy - 0.7) * 0.2;
    if (genre === 'ambient' || genre === 'nitelofi') energy = 0.48 + (energy - 0.48) * 0.25;
    if (genre === 'ballad') energy = 0.52 + (energy - 0.52) * 0.35;
    if (genre === 'edm') {
      if (role === 'intro' || role === 'verse' || role === 'bridge') energy *= 0.58;
      if (role === 'pre') energy = Math.min(1, 0.55 + barInSection * 0.12);
      if (role === 'chorus') energy = Math.min(1, energy + 0.2);
    }
    if (genre === 'cinematic') {
      if (role === 'intro' || role === 'verse') energy *= 0.62;
      if (role === 'chorus') energy = Math.min(1, energy + 0.22);
    }
    if (genre === 'modernrock' && role === 'chorus') energy = Math.min(1, energy + 0.08);
    const texture = (finalBar || role === 'outro' || (role === 'intro' && (concept.intro === 'space' || concept.intro === 'chords'))) ? 'pad'
      : (genre === 'ambient' || genre === 'dawn') && concept.texture === 'stab' ? 'pad'
        : concept.texture;
    if (layerGate(role, concept.intro, barInSection, span.bars, 'chords') || role !== 'intro') writeChords(texture, voicing, beat, energy, role, finalBar);
    if (layerGate(role, role === 'outro' ? concept.outro : concept.intro, barInSection, span.bars, 'bass') || (role !== 'intro' && role !== 'outro')) writeBass(concept.bass, chord, beat, energy, role, finalBar);

    if (finalBar) {
      const resolving = nearestPitch(chord.root, lastMelody, 64, 84);
      add('melody', beat + 0.05, 3.1, resolving, 0.68);
      lastMelody = resolving;
    } else if (layerGate(role, concept.intro, barInSection, span.bars, 'melody')) {
      const center = (ROLE_CENTER[role] || 74) + (role === 'chorus' ? 2 : 0);
      const inKey = [chord.root, ...chord.intervals.map(interval => (chord.root + interval) % 12)].filter(pc => pitchInScale(pc, key, activeScale));
      const anchor = nearestPitch(inKey.length ? inKey[0] : key, center, 64, 84);
      const shape = developShape(concept.motif, role, span.occurrence || 1, concept.family, barInSection);
      let rhythm = role === 'chorus' || role === 'pre' ? concept.rhythmBusy : role === 'intro' || role === 'outro' ? concept.rhythmSparse : concept.rhythm.slice();
      if (genre === 'house') rhythm = concept.rhythmSparse.slice(0, 3);
      if (genre === 'ambient') rhythm = concept.rhythmSparse.slice(0, 2);
      if (genre === 'ballad') rhythm = concept.rhythmSparse.slice(0, 2);
      if (genre === 'edm' && role === 'chorus') rhythm = concept.rhythmBusy;
      const shift = (role === 'bridge' || (role === 'verse' && (span.occurrence || 1) === 2) || (role === 'pre' && barInSection % 2 === 1)) ? concept.displace : 0;
      if (shift) {
        const moved = rhythm.map(step => Math.round((step + shift) * 4) / 4).filter(step => step >= 0 && step < 3.9);
        if (moved.length >= 2) rhythm = moved;
      }
      const count = Math.min(8, Math.max(shape.length, rhythm.length));
      let cursor = anchor;
      for (let index = 0; index < count; index++) {
        const at = index % shape.length;
        let degree = shape[at];
        if (at === concept.motifAccent) degree += concept.motifLift;
        if (index === 0) cursor = walk(anchor, degree + concept.motifRegister);
        else {
          const prevAt = (index - 1) % shape.length;
          let previous = shape[prevAt];
          if (prevAt === concept.motifAccent) previous += concept.motifLift;
          cursor = walk(cursor, degree - previous);
        }
        const position = rhythm[index % rhythm.length];
        if ((role === 'intro' || role === 'outro') && position > 2.8 && index > 0) continue;
        const next = rhythm[(index + 1) % rhythm.length];
        const spanLength = next > position ? next - position : 4 - position;
        const length = Math.min(profile.length * (index === 0 ? 1.12 : 0.9), Math.max(0.2, spanLength - 0.08));
        const swung = Math.abs((position % 1) - 0.5) < 0.02 ? concept.swing : 0;
        add('melody', beat + position + swung, Math.max(0.18, length), cursor, energy * (index === 0 ? 0.72 : 0.56));
        lastMelody = cursor;
      }
    }

    if (!finalBar) {
      const playDrums = layerGate(role, role === 'outro' ? concept.outro : concept.intro, barInSection, span.bars, 'drums');
      if (seed === 3) {
        const intro = bars > 8 && bar < 2;
        const drumEnergy = genre === 'modernrock' || genre === 'dawn' || genre === 'nitelofi' || genre === 'ballad' || genre === 'ambient' || genre === 'cinematic' ? 0.55 : 0.9;
        const plan = { swing: concept.swing };
        if (genre === 'ambient') {
          if (bar % 2 === 0) add('kick', beat, 0.3, 36, 0.27);
          [1.5, 3.5].forEach(position => add('hat', beat + position, 0.09, 42, 0.17));
        } else if (genre === 'ballad') {
          add('kick', beat, 0.32, 36, drumEnergy * 0.48);
          if (!intro) add('snare', beat + 2, 0.2, 38, drumEnergy * 0.32);
          [0, 2].forEach(position => add('hat', beat + position, 0.08, 42, drumEnergy * 0.16));
        } else if (genre === 'modernrock') {
          add('kick', beat, 0.3, 36, drumEnergy * (fuller ? 0.5 : 0.34));
          if (fuller) add('kick', beat + 2.5, 0.24, 36, drumEnergy * 0.3);
          if (!intro && role !== 'intro') add('snare', beat + 2, 0.16, 38, drumEnergy * (fuller ? 0.36 : 0.18));
          const hats = fuller ? [0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5] : [0, 1, 2, 3];
          hats.forEach(position => add('hat', beat + position + (position % 1 ? plan.swing : 0), 0.05, 42, drumEnergy * (fuller ? 0.15 : 0.09)));
        } else if (genre === 'dawn') {
          add('kick', beat, 0.36, 36, drumEnergy * 0.28);
          if (fuller && !intro) add('snare', beat + 2, 0.14, 38, drumEnergy * 0.15);
          add('hat', beat + 2, 0.08, 42, drumEnergy * 0.09);
          if (fuller) add('hat', beat, 0.06, 42, drumEnergy * 0.07);
        } else if (genre === 'nitelofi') {
          [0, 2.25].forEach((position, index) => add('kick', beat + position, 0.28, 36, drumEnergy * (index === 0 ? 0.46 : 0.32)));
          if (!intro) [1, 3].forEach(position => add('snare', beat + position + 0.03, 0.16, 38, drumEnergy * 0.26));
          [0.5, 1.5, 2.5, 3.5].forEach(position => add('hat', beat + position + plan.swing, 0.05, 42, drumEnergy * 0.12));
        } else if (genre === 'edm') {
          [0, 1, 2, 3].forEach((position, index) => add('kick', beat + position, 0.22, 36, drumEnergy * (index % 2 ? 0.62 : 0.78)));
          if (!intro) [1, 3].forEach(position => add('snare', beat + position, 0.16, 38, drumEnergy * 0.5));
          for (let index = 0; index < 8; index++) add('hat', beat + index * 0.5, 0.05, 42, drumEnergy * (index % 2 ? 0.28 : 0.16));
        } else if (genre === 'acoustic') {
          [0, 2].forEach((position, index) => add('kick', beat + position, 0.2, 36, drumEnergy * (index === 0 ? 0.4 : 0.28)));
          if (!intro) [1, 3].forEach(position => add('snare', beat + position, 0.12, 38, drumEnergy * 0.22));
          [0.5, 1.5, 2.5, 3.5].forEach(position => add('hat', beat + position, 0.05, 42, drumEnergy * 0.14));
        } else if (genre === 'cinematic') {
          add('kick', beat, 0.4, 36, drumEnergy * (bar % 4 === 0 ? 0.62 : 0.34));
          if (!intro && bar % 4 === 3) add('snare', beat + 2, 0.24, 38, drumEnergy * 0.3);
          add('hat', beat + 2, 0.1, 42, drumEnergy * 0.12);
        } else if (genre === 'citypop') {
          [0, 2].forEach((position, index) => add('kick', beat + position, 0.22, 36, drumEnergy * (index === 0 ? 0.7 : 0.48)));
          if (!intro) add('kick', beat + 0.75, 0.16, 36, drumEnergy * 0.32);
          if (!intro) [1, 3].forEach(position => add('snare', beat + position, 0.14, 38, drumEnergy * 0.44));
          for (let index = 0; index < 8; index++) {
            if (intro && index % 2) continue;
            add('hat', beat + index * 0.5 + (index % 2 ? plan.swing : 0), 0.05, 42, drumEnergy * (index % 2 ? 0.16 : 0.26));
          }
        } else if (genre === 'trap') {
          add('kick', beat, 0.36, 36, drumEnergy * 0.82);
          if (!intro && bar % 2 === 1) add('kick', beat + 2.75, 0.22, 36, drumEnergy * 0.42);
          if (!intro) add('snare', beat + 2, 0.16, 38, drumEnergy * 0.56);
          [0, 0.5, 1, 1.5, 2, 2.5].forEach((position, index) => {
            if (intro && index % 2) return;
            add('hat', beat + position, 0.04, 42, drumEnergy * 0.16);
          });
          if (!intro) [3, 3.125, 3.25, 3.375, 3.5, 3.625, 3.75, 3.875].forEach((position, index) => add('hat', beat + position, 0.03, 42, drumEnergy * (0.12 + index * 0.015)));
        } else if (genre === 'house') {
          [0, 1, 2, 3].forEach((position, index) => add('kick', beat + position, 0.2, 36, drumEnergy * (index % 2 ? 0.64 : 0.8)));
          if (!intro) [1, 3].forEach(position => add('snare', beat + position, 0.14, 38, drumEnergy * 0.48));
          [0, 1, 2, 3].forEach(position => add('hat', beat + position, 0.04, 42, drumEnergy * 0.12));
          [0.5, 1.5, 2.5, 3.5].forEach(position => add('hat', beat + position, 0.12, 46, drumEnergy * 0.22));
        } else if (genre === 'bossa') {
          add('kick', beat, 0.2, 36, drumEnergy * 0.42);
          if (!intro) add('kick', beat + 2.5, 0.16, 36, drumEnergy * 0.28);
          if (!intro) [0.75, 1.5, 2.75, 3.5].forEach(position => add('snare', beat + position, 0.07, 37, drumEnergy * 0.2));
          [0, 1, 2, 3].forEach(position => add('hat', beat + position, 0.04, 42, drumEnergy * 0.1));
        } else if (genre === 'reggaeton') {
          [0, 1.5, 2.5].forEach((position, index) => add('kick', beat + position, 0.22, 36, drumEnergy * (index === 0 ? 0.78 : 0.52)));
          if (!intro) [0.75, 1.75, 2.75, 3.5].forEach((position, index) => add('snare', beat + position, 0.12, 38, drumEnergy * (index % 2 ? 0.4 : 0.32)));
          for (let index = 0; index < 8; index++) add('hat', beat + index * 0.5, 0.045, 42, drumEnergy * 0.15);
        } else {
          const kicks = genre === 'pop' ? [0, 1, 2, 3] : genre === 'rnb' ? [0, 1.75, 2.5] : [0, 2.25];
          kicks.forEach((position, index) => add('kick', beat + position, 0.29, 36, drumEnergy * (index === 0 ? 0.7 : 0.52)));
          if (!intro || bar > 0) [1, 3].forEach(position => add('snare', beat + position + (genre === 'lofi' ? 0.035 : 0), 0.18, 38, drumEnergy * 0.46));
          for (let index = 0; index < 8; index++) {
            if (intro && index % 2) continue;
            add('hat', beat + index * 0.5 + (index % 2 ? plan.swing : 0), 0.065, 42, drumEnergy * (index % 2 ? 0.21 : 0.31));
          }
          if (!intro && bar % 8 === 7) add('snare', beat + 3.75, 0.12, 38, 0.23);
        }
      } else if (playDrums) {
        const thin = role === 'intro' && concept.intro !== 'pulse';
        writePattern(concept.groove, beat, energy * (role === 'outro' ? 0.7 : 1), concept.swing, role, thin, sectionEnd);
        if (genre === 'edm' && role === 'pre') [2, 2.5, 3, 3.25, 3.5, 3.75].forEach((position, index) => add('snare', beat + position, 0.06, 38, energy * (0.12 + index * 0.045)));
      }
    }

    if (instruments.hum) {
      const pcs = [];
      const pushPc = pc => {
        const normalized = ((pc % 12) + 12) % 12;
        if (pitchInScale(normalized, key, activeScale) && !pcs.includes(normalized)) pcs.push(normalized);
      };
      pushPc(chord.root);
      chord.intervals.forEach(interval => pushPc(chord.root + interval));
      if (!pcs.length) pushPc(key);
      const tilt = ((mix(seed, 0xA11 + bar) % 7) - 3) * 0.02;
      const pair = role === 'chorus' || role === 'pre' ? [0.12, 0.9] : role === 'bridge' ? [0.72, 0.22] : bar % 2 ? [0.04, 0.42] : [0, 0.2];
      const glide = { vowelFrom: clamp(pair[0] + tilt, 0, 1), vowelTo: clamp(pair[1] + tilt, 0, 1) };
      const level = energy * (fuller ? 0.7 : role === 'intro' || role === 'outro' || finalBar ? 0.34 : 0.5);
      const primary = nearestPitch(pcs[0], fuller ? 67 : 62, fuller ? 60 : 55, fuller ? 74 : 70);
      addHum(beat + 0.02, finalBar ? 3.3 : 3.65, primary, level, glide);
      if (fuller && !finalBar && pcs.length > 1) {
        const upper = nearestPitch(pcs[1], primary + 3, 60, 76);
        if (upper !== primary) addHum(beat + 0.08, 3.35, upper, level * 0.72, { vowelFrom: glide.vowelTo, vowelTo: glide.vowelFrom });
      }
    }
  }

  events.sort((a, b) => a.time - b.time || a.midi - b.midi);
  const phraseChords = [];
  for (let start = 0; start < chords.length; start += 4) phraseChords.push(chords.slice(start, start + 4).map(chord => chord.name));
  return {
    events: events.filter(event => instruments[['kick', 'snare', 'hat'].includes(event.instrument) ? 'drums' : event.instrument]),
    duration: round(bars * 4 * beatSeconds), bpm, bars, totalBars: bars,
    chords, chordNames: chords.slice(0, 4).map(chord => chord.name), phraseChords, seed, settings,
    beatSeconds, timeSignature: [4, 4], structure, swing: concept.swing, timbre: concept.timbre, engine: 'concept',
    variation: {
      groove: mix(seed, 0x600) % 4,
      texture: concept.texture,
      contour: coarseContour(concept.motif),
      bass: concept.bass,
      rhythm: concept.rhythm.join(','),
      color: Boolean(concept.color),
    },
    concept: {
      family: concept.family,
      form: concept.form,
      progression: concept.progression,
      feel: concept.feel,
      arc: concept.arc.ko,
      texture: concept.texture,
      bass: concept.bass,
      intro: concept.intro,
      outro: concept.outro,
      hold: concept.hold,
      motif: concept.motif.join(','),
      modulation: concept.modulation ? concept.modulation.ko : '',
      summary: concept.summary,
      prompt: concept.prompt,
      signature: concept.signature,
    },
  };
}

/** Section lengths for a sketch. The same inputs are used by the lyric brief. */
function planStructureLegacy(bars, genre = 'lofi', mood = 'warm', seed = 1, cues = {}) {
  const count = Math.max(1, Math.round(Number(bars) || 1));
  if (count < 4) {
    const [name, description] = SECTION_META.motif;
    return [{ role: 'motif', name, bars: count, description }];
  }
  let choices = STRUCTURES.filter(template => template.length <= count);
  if (!choices.length) choices = [STRUCTURES[0]];
  if (cues.wantBridge) {
    const bridged = choices.filter(template => template.includes('bridge'));
    if (bridged.length) choices = bridged;
  } else if (cues.wantSpace) {
    const spacious = choices.filter(template => template[0] === 'intro' && template.filter(role => role === 'chorus').length <= 1);
    if (spacious.length) choices = spacious;
  } else if (cues.wantChorus || cues.wantLift || mood === 'bright') {
    const hooks = choices.filter(template => template.includes('pre') || template.filter(role => role === 'chorus').length >= 2);
    if (hooks.length) choices = hooks;
  } else if (genre === 'ambient' || genre === 'cinematic' || genre === 'dawn' || mood === 'melancholy') {
    const spacious = choices.filter(template => template[0] === 'intro');
    if (spacious.length) choices = spacious;
  }
  const template = choices[mix(seed, 0x517) % choices.length];
  const weight = { intro: 1, verse: 2, pre: 1, chorus: 3, bridge: 2, outro: 1, motif: 1 };
  if (genre === 'ambient' || genre === 'cinematic' || genre === 'dawn' || cues.wantSpace) { weight.intro = 2; weight.verse = 2; weight.chorus = 2; }
  if (genre === 'edm' || genre === 'pop' || genre === 'modernrock' || genre === 'house' || genre === 'citypop' || genre === 'reggaeton' || cues.wantLift) weight.chorus = 4;
  const totalWeight = template.reduce((sum, role) => sum + weight[role], 0);
  const left = count - template.length;
  const fractions = template.map(role => left * weight[role] / totalWeight);
  const extras = fractions.map(value => Math.floor(value));
  let used = extras.reduce((sum, value) => sum + value, 0);
  const order = fractions.map((value, index) => ({ index, frac: value - Math.floor(value) })).sort((a, b) => b.frac - a.frac || a.index - b.index);
  for (const item of order) {
    if (used >= left) break;
    extras[item.index] += 1;
    used += 1;
  }
  return template.map((role, index) => {
    const [name, description] = SECTION_META[role];
    const ambient = genre === 'ambient' && role === 'verse' ? '성긴 모티프와 긴 잔향으로 공간을 넓힙니다.' : genre === 'ambient' && role === 'chorus' ? '질감의 밀도를 높이며 중심 장면을 만듭니다.' : description;
    return { role, name, bars: 1 + extras[index], description: ambient };
  });
}

function sectionSpans(structure) {
  const spans = [];
  let start = 0;
  const seen = {};
  for (const section of structure) {
    seen[section.role] = (seen[section.role] || 0) + 1;
    spans.push({ ...section, start, occurrence: seen[section.role] });
    start += section.bars;
  }
  return spans;
}

const GENRE_SALT = { lofi: 11, pop: 23, rnb: 37, ambient: 41, ballad: 53, edm: 67, acoustic: 71, cinematic: 83, modernrock: 89, dawn: 97, nitelofi: 101, citypop: 89, trap: 97, house: 101, bossa: 103, reggaeton: 107 };
const MOOD_SALT = { warm: 3, dreamy: 5, bright: 7, melancholy: 9 };

function colorFits(scale, color) {
  return color.intervals.every(interval => scale.includes((color.offset + interval) % 12));
}

function harmonyPlan(genre, mood, scaleName, seed, bars) {
  const bank = GENRE_PROGRESSIONS[genre] || PROGRESSIONS[mood] || PROGRESSIONS.warm;
  let index = mix(seed, (GENRE_SALT[genre] || 13) * 100 + (MOOD_SALT[mood] || 3)) % bank.length;
  if (seed === 42 && mood === 'warm' && !GENRE_PROGRESSIONS[genre]) index = 0;
  const progression = bank[index];
  const alt = seed === 42 ? progression : bank[(index + 1 + (mix(seed, 0xA11) % Math.max(1, bank.length - 1))) % bank.length];
  const scale = SCALE_SETS[scaleName] || SCALE;
  let color = null;
  if (genre === 'modernrock') {
    const shapes = ROCK_COLORS.filter(shape => colorFits(scale, shape));
    const colorOk = seed !== 42 && seed !== 99 && bars >= 8 && mix(seed, 0xC010) % 2 === 0 && shapes.length > 0;
    if (colorOk) color = shapes[mix(seed, 0xB17) % shapes.length];
  } else {
    const colorOk = seed !== 42 && seed !== 99 && mix(seed, 0xC010) % 3 === 0 && bars >= 8;
    const borrowed = BORROWED[scaleName] || BORROWED.major;
    color = colorOk ? borrowed[mix(seed, 0xB17) % borrowed.length] : null;
  }
  const colorAt = color ? 4 + (mix(seed, 0xB0) % (bars - 5)) : -1;
  return { progression, alt, index, color, colorAt };
}

function swingFor(genre, seed) {
  const profile = PROFILES[genre];
  if (profile.swingRange) {
    const [min, max] = profile.swingRange;
    const steps = 4;
    const t = (mix(seed, 0x51F) % (steps + 1)) / steps;
    return clamp(Math.round((min + (max - min) * t) * 1000) / 1000, 0, 0.2);
  }
  return clamp(Math.round((profile.swing + ((mix(seed, 0x51F) % 5) - 2) * 0.02) * 1000) / 1000, 0, 0.2);
}

function performancePlan(genre, seed) {
  const rhythms = RHYTHMS[genre] || RHYTHMS.lofi;
  const pool = GENRE_TIMBRE[genre];
  return {
    groove: seed === 3 ? 0 : mix(seed, 0x600 + (GENRE_SALT[genre] || 13)) % 4,
    texture: ['pad', 'stab', 'arp', 'strum'][mix(seed, 0x71) % 4],
    contour: CONTOURS[mix(seed, 0x33) % CONTOURS.length],
    rhythm: rhythms[mix(seed, 0x91) % rhythms.length],
    bass: ['root', 'pulse', 'sync', 'walk'][mix(seed, 0xBACE) % 4],
    swing: swingFor(genre, seed),
    register: mix(seed, 0x21) % 3,
    timbre: pool ? pool[mix(seed, 0x77) % pool.length] : TIMBRES[mix(seed, 0x77) % TIMBRES.length],
  };
}

function composeLegacy(input = {}) {
  const settings = normalizeSettings(input);
  const { genre, mood, bpm, bars, seed, instruments } = settings;
  const random = seededRandom(seed);
  const profile = PROFILES[genre];
  const scaleName = settings.scale;
  const activeScale = SCALE_SETS[scaleName];
  const key = KEYS[settings.key];
  const beatSeconds = 60 / bpm;
  const events = [];
  const chords = [];
  const cues = arrangementCues(input);
  const structure = planStructureLegacy(bars, genre, mood, seed, cues);
  const spans = sectionSpans(structure);
  const harmony = harmonyPlan(genre, mood, scaleName, seed, bars);
  const plan = performancePlan(genre, seed);
  let previousVoicing;
  let lastMelody = 72 + key + [-5, 0, 4][plan.register];

  function add(instrument, beat, length, midi, velocity, humanize = true, extra) {
    const driftScale = instrument === 'melody' ? 0.02 : instrument === 'chords' ? 0.008 : 0.012;
    const drift = humanize && genre !== 'ambient' && genre !== 'cinematic' ? (random() - 0.5) * driftScale : 0;
    const time = Math.max(0, beat * beatSeconds + drift);
    const duration = Math.min(length * beatSeconds, bars * 4 * beatSeconds - time);
    if (duration <= 0 || !Number.isInteger(midi)) return;
    // Velocity jitter is drawn only for notes that sound, matching the original call order.
    const feel = 0.9 + random() * 0.18;
    const event = { instrument, time: round(time), duration: round(duration), midi, velocity: round(clamp(velocity * feel, 0.1, 0.95)) };
    if (extra) {
      event.vowelFrom = round(clamp(extra.vowelFrom, 0, 1));
      event.vowelTo = round(clamp(extra.vowelTo, 0, 1));
    }
    events.push(event);
  }

  const humRandom = seededRandom(mix(seed, 0xBEE5));
  function addHum(beat, length, midi, velocity, extra) {
    const drift = (humRandom() - 0.5) * 0.012;
    const time = Math.max(0, beat * beatSeconds + drift);
    const duration = Math.min(length * beatSeconds, bars * 4 * beatSeconds - time);
    const feel = 0.92 + humRandom() * 0.12;
    if (duration <= 0 || !Number.isInteger(midi)) return;
    events.push({
      instrument: 'hum',
      time: round(time),
      duration: round(duration),
      midi,
      velocity: round(clamp(velocity * feel, 0.08, 0.72)),
      vowelFrom: round(clamp(extra.vowelFrom, 0, 1)),
      vowelTo: round(clamp(extra.vowelTo, 0, 1)),
    });
  }

  function vowelPair(role, barIndex) {
    const tilt = ((mix(seed, 0xA11 + barIndex) % 7) - 3) * 0.02;
    const pair = role === 'chorus' || role === 'pre' ? [0.12, 0.9]
      : role === 'bridge' ? [0.72, 0.22]
        : barIndex % 2 ? [0.04, 0.42]
          : [0, 0.2];
    return { vowelFrom: clamp(pair[0] + tilt, 0, 1), vowelTo: clamp(pair[1] + tilt, 0, 1) };
  }

  function scaleStep(midi, direction = 1) {
    const step = direction < 0 ? -1 : 1;
    for (let note = midi + step; note >= 36 && note <= 96; note += step) {
      if (pitchInScale(note, key, activeScale)) return note;
    }
    let best = null;
    for (let note = 48; note <= 96; note++) {
      if (!pitchInScale(note, key, activeScale)) continue;
      if (best === null || Math.abs(note - midi) < Math.abs(best - midi)) best = note;
    }
    return best ?? midi;
  }

  for (let bar = 0; bar < bars; bar++) {
    const finalBar = bar === bars - 1;
    const span = spans.find(section => bar >= section.start && bar < section.start + section.bars) || spans.at(-1);
    const role = span.role;
    const barInSection = bar - span.start;
    const sectionEnd = bar === span.start + span.bars - 1;
    const phrase = bar % 8 < 4 || seed === 42 ? harmony.progression : harmony.alt;
    const degree = finalBar ? harmony.progression[0] : phrase[bar % 4];
    const useColor = harmony.color && bar === harmony.colorAt && !finalBar;
    const chord = useColor
      ? { root: (key + harmony.color.offset) % 12, degree: -1, intervals: harmony.color.intervals, name: NOTE_NAMES[(key + harmony.color.offset) % 12] + harmony.color.suffix }
      : scaleName === 'major'
        ? chordForDegree(degree, key, finalBar, PROFILES[genre].harmony)
        : chordForDegreeScaled(degree, key, finalBar, activeScale);
    const voicing = voiceChord(chord, previousVoicing);
    previousVoicing = voicing;
    const beat = bar * 4;
    chords.push({ ...chord, bar, notes: voicing, time: round(beat * beatSeconds), duration: round(4 * beatSeconds) });
    const intro = bars > 8 && bar < 2 && plan.groove === 0;
    let energy = ROLE_ENERGY[role] || 0.8;
    if (span.bars > 1 && (role === 'intro' || role === 'verse' || role === 'chorus' || role === 'pre')) {
      const ramp = barInSection / (span.bars - 1);
      energy *= role === 'chorus' || role === 'pre' ? 0.9 + ramp * 0.1 : 0.84 + ramp * 0.16;
    }
    if (finalBar) energy *= 0.78;
    if (cues.wantLift && role === 'chorus') energy = Math.min(1, energy + 0.05);
    if (cues.wantSpace) energy *= 0.92;
    const center = (ROLE_CENTER[role] || 74) + [-5, 0, 4][plan.register] + (role === 'chorus' ? 2 : 0);
    const fuller = role === 'chorus' || role === 'pre';

    const texture = (finalBar || role === 'intro' || role === 'outro') ? 'pad'
      : (genre === 'ambient' || genre === 'cinematic' || genre === 'dawn') && plan.texture === 'stab' ? 'pad'
        : plan.texture;
    if (genre === 'modernrock') {
      const padLevel = energy * (fuller ? 0.5 : role === 'verse' || role === 'intro' ? 0.26 : 0.34);
      voicing.forEach((midi, index) => add('chords', beat + index * 0.02, finalBar ? 3.6 : 3.75, midi, padLevel));
      if (!finalBar && role !== 'intro') {
        const steps = fuller ? [0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5]
          : plan.texture === 'pad' ? [0, 2]
            : plan.texture === 'strum' ? [0, 1.5, 3]
              : [0, 1, 2.5, 3];
        steps.forEach((position, index) => {
          const tone = voicing[index % voicing.length];
          const midi = tone + 12 <= 86 ? tone + 12 : tone;
          add('chords', beat + position, fuller ? 0.36 : 0.5, midi, energy * (fuller ? 0.38 : 0.22));
        });
      }
    } else if (genre === 'bossa' && !finalBar) {
      const comps = texture === 'arp' ? [0, 1, 1.5, 2.5, 3.5]
        : texture === 'stab' ? [0, 1.5, 2.5, 3.5]
          : texture === 'strum' ? [0, 0.75, 2, 2.75, 3.5]
            : [0, 1.5, 3];
      comps.forEach((position, index) => {
        if (texture === 'arp') add('chords', beat + position, 0.4, voicing[index % voicing.length], energy * 0.4);
        else voicing.forEach((midi, voiceIndex) => add('chords', beat + position + voiceIndex * 0.012, texture === 'pad' ? 0.95 : 0.38, midi, energy * 0.38));
      });
    } else if (genre === 'house' && !finalBar && texture !== 'pad') {
      const offs = texture === 'arp' ? [0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5] : [0.5, 1.5, 2.5, 3.5];
      offs.forEach((position, index) => {
        if (texture === 'arp') add('chords', beat + position, 0.26, voicing[index % voicing.length], energy * 0.42);
        else voicing.forEach((midi, voiceIndex) => add('chords', beat + position + voiceIndex * 0.008, 0.3, midi, energy * 0.44));
      });
    } else if (texture === 'arp' && !finalBar) {
      const steps = genre === 'edm' ? [0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5] : [0, 0.75, 1.5, 2.25, 3];
      steps.forEach((position, index) => {
        const midi = voicing[index % voicing.length] + (role === 'chorus' && index % 4 === 3 && voicing[index % voicing.length] + 12 <= 88 ? 12 : 0);
        add('chords', beat + position, genre === 'edm' ? 0.32 : 0.62, midi, energy * 0.46);
      });
    } else if (texture === 'stab' && !finalBar) {
      const hits = genre === 'edm' ? [[0, 0.42], [1, 0.42], [2, 0.42], [3, 0.36]]
        : genre === 'pop' ? [[0, 1.15], [1.5, 0.7], [2.5, 1.05]]
          : [[0, 1.4], [2.5, 1.1]];
      for (const [position, length] of hits) {
        voicing.forEach((midi, index) => add('chords', beat + position + index * 0.02, length, midi, energy * 0.5));
      }
    } else if (texture === 'strum' && !finalBar) {
      [0, 2].forEach(position => {
        voicing.forEach((midi, index) => add('chords', beat + position + index * 0.045, 1.35, midi, energy * (0.42 + index * 0.03)));
      });
    } else {
      const length = finalBar ? 3.8 : genre === 'edm' ? 3.4 : 3.9;
      voicing.forEach((midi, index) => add('chords', beat + index * 0.018, length - index * 0.018, midi, energy * (genre === 'ambient' || genre === 'cinematic' ? 0.58 : 0.52)));
      if (role === 'chorus' && !finalBar) {
        const top = voicing.at(-1) + 12;
        if (top <= 88) add('chords', beat + 0.4, 2.8, top, energy * (plan.register === 2 ? 0.3 : 0.18));
      }
    }

    {
      const root = 36 + chord.root;
      const fifthPc = (chord.root + 7) % 12;
      const fifth = pitchInScale(fifthPc, key, activeScale) ? 36 + fifthPc : root + 12;
      const upper = root + 12 <= 60 ? root + 12 : root;
      if (finalBar || role === 'outro') {
        add('bass', beat, 3.6, root, 0.64 * energy);
      } else if (genre === 'trap') {
        add('bass', beat, plan.bass === 'pulse' ? 1.45 : 3.2, root, 0.8 * energy, false);
        if (plan.bass === 'pulse' || plan.bass === 'sync') add('bass', beat + 2, 1.2, root, 0.58 * energy, false);
        if (plan.bass === 'walk' || plan.bass === 'sync') add('bass', beat + 3.25, 0.45, upper, 0.46 * energy, false);
      } else if (genre === 'bossa') {
        add('bass', beat, 0.85, root, 0.6 * energy);
        add('bass', beat + (plan.bass === 'sync' ? 1.5 : 2), 0.75, fifth <= 55 ? fifth : root, 0.48 * energy);
        if (plan.bass === 'walk' || plan.bass === 'pulse') add('bass', beat + 3.5, 0.35, upper, 0.38 * energy);
      } else if (genre === 'reggaeton') {
        add('bass', beat, 0.65, root, 0.74 * energy, false);
        add('bass', beat + (plan.bass === 'sync' ? 1.75 : 1.5), 0.5, root, 0.56 * energy, false);
        add('bass', beat + 2.5, 0.55, plan.bass === 'walk' ? upper : root, 0.62 * energy, false);
      } else if (genre === 'citypop') {
        add('bass', beat, 0.38, root, 0.64 * energy);
        add('bass', beat + 0.75, 0.28, upper, 0.4 * energy);
        add('bass', beat + (plan.bass === 'sync' ? 1.75 : 2), 0.42, fifth <= 55 ? fifth : root, 0.52 * energy);
        if (plan.bass !== 'root') add('bass', beat + 3.5, 0.28, upper, 0.38 * energy);
      } else if (genre === 'house' && plan.bass !== 'walk') {
        [0, 1, 2, 3].forEach((position, index) => add('bass', beat + position, 0.32, index % 2 ? upper : root, energy * 0.6, false));
      } else if (plan.bass === 'pulse' || (genre === 'edm' && plan.bass !== 'walk')) {
        [0, 0.75, 1.5, 2.5, 3.25].forEach((position, index) => add('bass', beat + position, index === 4 ? 0.48 : 0.36, index === 3 ? upper : root, energy * (index % 2 ? 0.58 : 0.72), genre !== 'edm'));
      } else if (plan.bass === 'sync') {
        add('bass', beat, 1.2, root, 0.68 * energy);
        add('bass', beat + (genre === 'rnb' ? 1.75 : 1.5), 1.05, root, 0.56 * energy);
        add('bass', beat + 3.25, 0.5, fifth <= 60 ? fifth : root, 0.42 * energy);
      } else if (plan.bass === 'walk') {
        const passing = scaleStep(root + 2, 1);
        add('bass', beat, 0.85, root, 0.66 * energy);
        add('bass', beat + 1, 0.8, passing <= 60 ? passing : root, 0.5 * energy);
        add('bass', beat + 2, 0.85, fifth <= 60 ? fifth : upper, 0.58 * energy);
        add('bass', beat + 3, 0.7, upper, 0.48 * energy);
      } else if (genre === 'cinematic' || genre === 'dawn') {
        add('bass', beat, 3.6, root, 0.62 * energy);
        if (genre === 'dawn' && fuller) add('bass', beat + 2.5, 0.8, upper, 0.34 * energy);
        else if (genre !== 'dawn' && bar % 2 === 1) add('bass', beat + 3, 0.7, upper, 0.4 * energy);
      } else {
        add('bass', beat, genre === 'ambient' ? 3.7 : 1.6, root, 0.68 * energy);
        if (genre !== 'ambient') {
          add('bass', beat + (genre === 'rnb' ? 1.75 : 2), 1.2, root, 0.57 * energy);
          if (!intro && bar % 2 === 1) add('bass', beat + 3.5, 0.42, fifth <= 60 ? fifth : upper, 0.46 * energy);
        }
      }
    }

    {
      if (finalBar) {
        const resolving = nearestPitch(chord.root, lastMelody, 64, 84);
        add('melody', beat + 0.05, 3.1, resolving, 0.68);
        lastMelody = resolving;
      } else {
        const shape = CONTOUR_SHAPES[plan.contour] || CONTOUR_SHAPES.arch;
        const rhythm = plan.rhythm;
        const played = [];
        rhythm.forEach((position, index) => {
          if ((role === 'intro' || intro) && position < 1.5 && rhythm.length > 2) return;
          if (sectionEnd && role !== 'chorus' && position > 2.85) return;
          let step = shape[index % shape.length];
          if (role === 'chorus') step += 1;
          if (role === 'pre') step += barInSection % 2;
          if (role === 'bridge') step = shape[(shape.length - 1 - index) % shape.length];
          if (role === 'outro') step = Math.max(0, step - 1);
          if (role === 'verse' && barInSection % 2 === 1) step = shape[(index + 1) % shape.length];
          const chordTone = chord.intervals[Math.abs(step) % chord.intervals.length];
          const low = Math.max(60, center - 9);
          const high = Math.min(88, center + 9);
          let midi = nearestPitch((chord.root + chordTone) % 12, index === 0 ? lastMelody : center + (index % 3 - 1) * 2, low, high);
          if (!useColor && index === 2 && (role === 'verse' || role === 'pre') && genre !== 'ambient' && genre !== 'cinematic') {
            midi = scaleStep(lastMelody + (plan.contour === 'fall' ? -1 : 2), plan.contour === 'fall' ? -1 : 1);
          }
          const swing = position % 1 === 0.5 ? plan.swing : 0;
          const next = rhythm[index + 1] ?? 4;
          const length = Math.min(profile.length * (index === 0 ? 1.15 : 0.92), next - position - 0.08);
          played.push(position);
          add('melody', beat + position + swing, Math.max(0.18, length), midi, energy * (index === 0 ? 0.72 : 0.56));
          lastMelody = midi;
        });
        if (!played.length) {
          const midi = nearestPitch(chord.intervals[0] + chord.root, center, 64, 84);
          add('melody', beat + 2, 1.2, midi, energy * 0.5);
          lastMelody = midi;
        }
      }
    }

    if (!finalBar) {
      if (plan.groove === 0) {
        if (genre === 'ambient') {
          if (bar % 2 === 0) add('kick', beat, 0.3, 36, 0.27);
          [1.5, 3.5].forEach(position => add('hat', beat + position, 0.09, 42, 0.17));
        } else if (genre === 'ballad') {
          add('kick', beat, 0.32, 36, energy * 0.48);
          if (!intro) add('snare', beat + 2, 0.2, 38, energy * 0.32);
          [0, 2].forEach(position => add('hat', beat + position, 0.08, 42, energy * 0.16));
        } else if (genre === 'modernrock') {
          add('kick', beat, 0.3, 36, energy * (fuller ? 0.5 : 0.34));
          if (fuller) add('kick', beat + 2.5, 0.24, 36, energy * 0.3);
          if (!intro && role !== 'intro') add('snare', beat + 2, 0.16, 38, energy * (fuller ? 0.36 : 0.18));
          const hats = fuller ? [0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5] : [0, 1, 2, 3];
          hats.forEach(position => add('hat', beat + position + (position % 1 ? plan.swing : 0), 0.05, 42, energy * (fuller ? 0.15 : 0.09)));
        } else if (genre === 'dawn') {
          add('kick', beat, 0.36, 36, energy * 0.28);
          if (fuller && !intro) add('snare', beat + 2, 0.14, 38, energy * 0.15);
          add('hat', beat + 2, 0.08, 42, energy * 0.09);
          if (fuller) add('hat', beat, 0.06, 42, energy * 0.07);
        } else if (genre === 'nitelofi') {
          [0, 2.25].forEach((position, index) => add('kick', beat + position, 0.28, 36, energy * (index === 0 ? 0.46 : 0.32)));
          if (!intro) [1, 3].forEach(position => add('snare', beat + position + 0.03, 0.16, 38, energy * 0.26));
          [0.5, 1.5, 2.5, 3.5].forEach(position => add('hat', beat + position + plan.swing, 0.05, 42, energy * 0.12));
        } else if (genre === 'edm') {
          [0, 1, 2, 3].forEach((position, index) => add('kick', beat + position, 0.22, 36, energy * (index % 2 ? 0.62 : 0.78)));
          if (!intro) [1, 3].forEach(position => add('snare', beat + position, 0.16, 38, energy * 0.5));
          for (let index = 0; index < 8; index++) add('hat', beat + index * 0.5, 0.05, 42, energy * (index % 2 ? 0.28 : 0.16));
        } else if (genre === 'acoustic') {
          [0, 2].forEach((position, index) => add('kick', beat + position, 0.2, 36, energy * (index === 0 ? 0.4 : 0.28)));
          if (!intro) [1, 3].forEach(position => add('snare', beat + position, 0.12, 38, energy * 0.22));
          [0.5, 1.5, 2.5, 3.5].forEach(position => add('hat', beat + position, 0.05, 42, energy * 0.14));
        } else if (genre === 'cinematic') {
          add('kick', beat, 0.4, 36, energy * (bar % 4 === 0 ? 0.62 : 0.34));
          if (!intro && bar % 4 === 3) add('snare', beat + 2, 0.24, 38, energy * 0.3);
          add('hat', beat + 2, 0.1, 42, energy * 0.12);
        } else if (genre === 'citypop') {
          [0, 2].forEach((position, index) => add('kick', beat + position, 0.22, 36, energy * (index === 0 ? 0.7 : 0.48)));
          if (!intro) add('kick', beat + 0.75, 0.16, 36, energy * 0.32);
          if (!intro) [1, 3].forEach(position => add('snare', beat + position, 0.14, 38, energy * 0.44));
          for (let index = 0; index < 8; index++) {
            if (intro && index % 2) continue;
            add('hat', beat + index * 0.5 + (index % 2 ? plan.swing : 0), 0.05, 42, energy * (index % 2 ? 0.16 : 0.26));
          }
        } else if (genre === 'trap') {
          add('kick', beat, 0.36, 36, energy * 0.82);
          if (!intro && bar % 2 === 1) add('kick', beat + 2.75, 0.22, 36, energy * 0.42);
          if (!intro) add('snare', beat + 2, 0.16, 38, energy * 0.56);
          [0, 0.5, 1, 1.5, 2, 2.5].forEach((position, index) => {
            if (intro && index % 2) return;
            add('hat', beat + position, 0.04, 42, energy * 0.16);
          });
          if (!intro) [3, 3.125, 3.25, 3.375, 3.5, 3.625, 3.75, 3.875].forEach((position, index) => add('hat', beat + position, 0.03, 42, energy * (0.12 + index * 0.015)));
        } else if (genre === 'house') {
          [0, 1, 2, 3].forEach((position, index) => add('kick', beat + position, 0.2, 36, energy * (index % 2 ? 0.64 : 0.8)));
          if (!intro) [1, 3].forEach(position => add('snare', beat + position, 0.14, 38, energy * 0.48));
          [0, 1, 2, 3].forEach(position => add('hat', beat + position, 0.04, 42, energy * 0.12));
          [0.5, 1.5, 2.5, 3.5].forEach(position => add('hat', beat + position, 0.12, 46, energy * 0.22));
        } else if (genre === 'bossa') {
          add('kick', beat, 0.2, 36, energy * 0.42);
          if (!intro) add('kick', beat + 2.5, 0.16, 36, energy * 0.28);
          if (!intro) [0.75, 1.5, 2.75, 3.5].forEach(position => add('snare', beat + position, 0.07, 37, energy * 0.2));
          [0, 1, 2, 3].forEach(position => add('hat', beat + position, 0.04, 42, energy * 0.1));
        } else if (genre === 'reggaeton') {
          [0, 1.5, 2.5].forEach((position, index) => add('kick', beat + position, 0.22, 36, energy * (index === 0 ? 0.78 : 0.52)));
          if (!intro) [0.75, 1.75, 2.75, 3.5].forEach((position, index) => add('snare', beat + position, 0.12, 38, energy * (index % 2 ? 0.4 : 0.32)));
          for (let index = 0; index < 8; index++) add('hat', beat + index * 0.5, 0.045, 42, energy * 0.15);
        } else {
          const kicks = genre === 'pop' ? [0, 1, 2, 3] : genre === 'rnb' ? [0, 1.75, 2.5] : [0, 2.25];
          kicks.forEach((position, index) => add('kick', beat + position, 0.29, 36, energy * (index === 0 ? 0.7 : 0.52)));
          if (!intro || bar > 0) [1, 3].forEach(position => add('snare', beat + position + (genre === 'lofi' ? 0.035 : 0), 0.18, 38, energy * 0.46));
          for (let index = 0; index < 8; index++) {
            if (intro && index % 2) continue;
            add('hat', beat + index * 0.5 + (index % 2 ? plan.swing : 0), 0.065, 42, energy * (index % 2 ? 0.21 : 0.31));
          }
          if (!intro && bar % 8 === 7) add('snare', beat + 3.75, 0.12, 38, 0.23);
        }
      } else {
        const groove = (GROOVES[genre] || GROOVES.lofi)[(plan.groove - 1) % 3];
        const thin = role === 'intro';
        groove.kick.forEach((position, index) => {
          if (thin && index > 0 && genre !== 'house') return;
          add('kick', beat + position, 0.24, 36, energy * (index === 0 ? 0.7 : 0.48));
        });
        if (!thin) groove.snare.forEach((position, index) => add('snare', beat + position, 0.16, position % 1 ? 37 : 38, energy * (index === 0 ? 0.46 : 0.32)));
        const hats = thin ? groove.hat.filter((_, index) => index % 2 === 0) : groove.hat;
        hats.forEach(position => add('hat', beat + position + (position % 1 === 0.5 ? plan.swing : 0), 0.06, 42, energy * (position % 1 ? 0.2 : 0.3)));
        if ((!thin || genre === 'house' || genre === 'reggaeton') && groove.open) groove.open.forEach(position => add('hat', beat + position, 0.12, 46, energy * 0.18));
        if (sectionEnd && role !== 'intro') [3.25, 3.5, 3.75].forEach((position, index) => add('snare', beat + position, 0.1, 38, energy * (0.18 + index * 0.06)));
      }
    }

    if (instruments.hum) {
      const pcs = [];
      const pushPc = pc => {
        const normalized = ((pc % 12) + 12) % 12;
        if (pitchInScale(normalized, key, activeScale) && !pcs.includes(normalized)) pcs.push(normalized);
      };
      pushPc(chord.root);
      chord.intervals.forEach(interval => pushPc(chord.root + interval));
      if (!pcs.length) pushPc(key);
      const glide = vowelPair(role, bar);
      const level = energy * (fuller ? 0.7 : role === 'intro' || role === 'outro' || finalBar ? 0.34 : 0.5);
      const primary = nearestPitch(pcs[0], fuller ? 67 : 62, fuller ? 60 : 55, fuller ? 74 : 70);
      addHum(beat + 0.02, finalBar ? 3.3 : 3.65, primary, level, glide);
      if (fuller && !finalBar && pcs.length > 1) {
        const upper = nearestPitch(pcs[1], primary + 3, 60, 76);
        if (upper !== primary) addHum(beat + 0.08, 3.35, upper, level * 0.72, { vowelFrom: glide.vowelTo, vowelTo: glide.vowelFrom });
      }
    }
  }

  events.sort((a, b) => a.time - b.time || a.midi - b.midi);
  const phraseChords = [];
  for (let start = 0; start < chords.length; start += 4) phraseChords.push(chords.slice(start, start + 4).map(chord => chord.name));
  return {
    events: events.filter(event => instruments[['kick', 'snare', 'hat'].includes(event.instrument) ? 'drums' : event.instrument]),
    duration: round(bars * 4 * beatSeconds), bpm, bars, totalBars: bars,
    chords, chordNames: chords.slice(0, 4).map(chord => chord.name), phraseChords, seed, settings,
    beatSeconds, timeSignature: [4, 4], structure, swing: plan.swing, timbre: plan.timbre, engine: 'legacy',
    variation: { groove: plan.groove, texture: plan.texture, contour: plan.contour, bass: plan.bass, rhythm: plan.rhythm.map(value => value).join(','), color: Boolean(harmony.color) },
  };
}

export function compose(input = {}) {
  if (input && input.planner === 'legacy') return composeLegacy(input);
  return composeConcept(input);
}

function createGraph(context, song, destination, initialVolume = 0.8) {
  const active = new Set();
  const genre = song.settings.genre;
  const spacious = genre === 'ambient' || genre === 'cinematic' || genre === 'dawn';
  const emotional = spacious || genre === 'modernrock' || genre === 'ballad' || genre === 'nitelofi';
  const input = context.createGain();
  input.gain.value = 0.74;
  const warmth = context.createBiquadFilter();
  warmth.type = 'lowshelf';
  warmth.frequency.value = 280;
  warmth.gain.value = genre === 'edm' ? 0.6 : emotional ? 2.8 : 1.7;
  const shaper = context.createWaveShaper();
  const curve = new Float32Array(257);
  for (let i = 0; i < curve.length; i++) {
    const x = (i / 256) * 2 - 1;
    curve[i] = Math.tanh(x * 1.28) / Math.tanh(1.28);
  }
  shaper.curve = curve;
  shaper.oversample = '2x';
  const filter = context.createBiquadFilter();
  filter.type = 'lowpass';
  const timbre = song.timbre || { cutoffMul: 1, attackMul: 1, wide: false };
  filter.frequency.value = PROFILES[genre].cutoff * (timbre.cutoffMul || 1);
  filter.Q.value = 0.35;
  const compressor = context.createDynamicsCompressor();
  compressor.threshold.value = SPACE.compressor.threshold;
  compressor.knee.value = SPACE.compressor.knee;
  compressor.ratio.value = SPACE.compressor.ratio;
  compressor.attack.value = SPACE.compressor.attack;
  compressor.release.value = SPACE.compressor.release;
  const limiter = context.createDynamicsCompressor();
  limiter.threshold.value = SPACE.limiter.threshold;
  limiter.knee.value = SPACE.limiter.knee;
  limiter.ratio.value = SPACE.limiter.ratio;
  limiter.attack.value = SPACE.limiter.attack;
  limiter.release.value = SPACE.limiter.release;
  const master = context.createGain();
  master.gain.value = initialVolume;
  input.connect(warmth);
  warmth.connect(shaper);
  shaper.connect(filter);
  filter.connect(compressor);
  compressor.connect(limiter);
  limiter.connect(master);
  master.connect(destination);

  const delay = context.createDelay(1);
  delay.delayTime.value = Math.min(0.38, song.beatSeconds * 0.5);
  const feedback = context.createGain();
  feedback.gain.value = spacious ? 0.22 : genre === 'edm' || genre === 'house' ? 0.06 : genre === 'trap' ? 0.05 : genre === 'bossa' ? 0.16 : 0.1;
  const wet = context.createGain();
  wet.gain.value = spacious ? 0.1 : genre === 'edm' || genre === 'house' ? 0.04 : genre === 'trap' ? 0.035 : genre === 'bossa' ? 0.09 : 0.06;
  const echoFilter = context.createBiquadFilter();
  echoFilter.type = 'lowpass';
  echoFilter.frequency.value = 1800;
  filter.connect(delay);
  delay.connect(echoFilter);
  echoFilter.connect(feedback);
  feedback.connect(delay);
  echoFilter.connect(wet);
  wet.connect(compressor);

  const reverbSend = context.createGain();
  reverbSend.gain.value = genre === 'edm' ? 0.07 : emotional ? 0.34 : 0.2;
  const reverbHighpass = context.createBiquadFilter();
  reverbHighpass.type = 'highpass';
  reverbHighpass.frequency.value = 170;
  const predelay = context.createDelay(0.08);
  predelay.delayTime.value = spacious ? 0.032 : genre === 'edm' ? 0.012 : 0.022;
  const convolver = context.createConvolver();
  convolver.normalize = true;
  const impulse = createImpulseChannels(context.sampleRate, emotional ? 2.2 : genre === 'edm' ? 1.05 : 1.6, emotional ? 1.7 : genre === 'edm' ? 3.5 : 2.4, mix(song.seed, 0x51DE));
  if (song.engine === 'concept') {
    if (genre === 'house') {
      warmth.gain.value = 2.4;
      feedback.gain.value = 0.08;
      wet.gain.value = 0.055;
      reverbSend.gain.value = 0.14;
      predelay.delayTime.value = 0.018;
    } else if (genre === 'edm') {
      warmth.gain.value = 0.35;
      feedback.gain.value = 0.03;
      wet.gain.value = 0.02;
      reverbSend.gain.value = 0.04;
      predelay.delayTime.value = 0.008;
    } else if (genre === 'rnb') {
      feedback.gain.value = 0.14;
      wet.gain.value = 0.07;
      reverbSend.gain.value = 0.24;
    } else if (genre === 'ballad') {
      feedback.gain.value = 0.09;
      wet.gain.value = 0.05;
      reverbSend.gain.value = 0.32;
    } else if (genre === 'ambient') {
      feedback.gain.value = 0.28;
      wet.gain.value = 0.14;
      reverbSend.gain.value = 0.4;
      predelay.delayTime.value = 0.046;
    } else if (genre === 'dawn') {
      reverbSend.gain.value = 0.3;
      predelay.delayTime.value = 0.028;
      wet.gain.value = 0.08;
    } else if (genre === 'cinematic') {
      warmth.gain.value = 1.1;
      reverbSend.gain.value = 0.46;
      predelay.delayTime.value = 0.04;
      wet.gain.value = 0.06;
    }
  }
  const impulseBuffer = context.createBuffer(2, impulse[0].length, context.sampleRate);
  impulse.forEach((channel, index) => impulseBuffer.getChannelData(index).set(channel));
  convolver.buffer = impulseBuffer;
  const damp = context.createBiquadFilter();
  damp.type = 'lowpass';
  damp.frequency.value = spacious ? 4800 : 3400;
  const reverbReturn = context.createGain();
  reverbReturn.gain.value = 0.85;
  filter.connect(reverbSend);
  reverbSend.connect(reverbHighpass);
  reverbHighpass.connect(predelay);
  predelay.connect(convolver);
  convolver.connect(damp);
  damp.connect(reverbReturn);
  reverbReturn.connect(compressor);

  const random = seededRandom(song.seed);
  const noise = context.createBuffer(1, context.sampleRate, context.sampleRate);
  const noiseData = noise.getChannelData(0);
  for (let i = 0; i < noiseData.length; i++) noiseData[i] = random() * 2 - 1;
  const bed = createAmbienceBed(context, song, input);
  const graphNodes = [input, warmth, shaper, filter, compressor, limiter, master, delay, feedback, wet, echoFilter, reverbSend, reverbHighpass, predelay, convolver, damp, reverbReturn, ...bed.nodes];

  const track = (source, nodes, stop) => {
    active.add(source);
    source.onended = () => {
      active.delete(source);
      source.disconnect();
      nodes.forEach(node => node.disconnect());
    };
    source.stop(stop);
  };

  function tonal(event, time, duration) {
    const kind = event.instrument;
    const ambient = song.settings.genre === 'ambient';
    const voice = PROFILES[song.settings.genre].voice;
    const pad = voice === 'pad' || voice === 'wide';
    const timbre = song.timbre || { attackMul: 1, wide: false };
    let attack = (pad ? (kind === 'bass' ? 0.04 : 0.14)
      : voice === 'pluck' ? 0.008
        : voice === 'saw' ? 0.008
          : kind === 'chords' ? (ambient ? 0.19 : 0.035) : kind === 'bass' ? 0.012 : 0.012) * (timbre.attackMul || 1);
    let release = pad ? (kind === 'bass' ? 0.2 : 0.55)
      : voice === 'pluck' ? (kind === 'chords' ? 0.28 : 0.12)
        : voice === 'saw' ? 0.08
          : kind === 'chords' ? 0.33 : kind === 'bass' ? 0.12 : 0.23;
    let amplitude = (kind === 'chords' ? (voice === 'saw' ? 0.07 : 0.105) : kind === 'bass' ? (voice === 'saw' ? 0.22 : 0.3) : (voice === 'saw' ? 0.16 : 0.24)) * event.velocity;
    let wave = voice === 'saw' ? (kind === 'bass' ? 'square' : 'sawtooth')
      : voice === 'pluck' || voice === 'wide' ? 'triangle'
        : kind === 'chords' ? 'triangle' : 'sine';
    const conceptEngine = song.engine === 'concept';
    if (conceptEngine && voice === 'house') {
      attack = (kind === 'chords' ? 0.014 : kind === 'bass' ? 0.01 : 0.008) * (timbre.attackMul || 1);
      release = kind === 'chords' ? 0.52 : kind === 'bass' ? 0.2 : 0.18;
      amplitude = (kind === 'chords' ? 0.085 : kind === 'bass' ? 0.22 : 0.13) * event.velocity;
      wave = kind === 'bass' ? 'sine' : 'triangle';
    } else if (voice === 'keys' || voice === '808' || voice === 'house' || voice === 'nylon' || voice === 'pulse') {
      const shaped = voiceShape(voice, kind);
      attack = shaped.attack * (timbre.attackMul || 1);
      release = shaped.release;
      amplitude = shaped.amplitude * event.velocity;
      wave = shaped.wave;
    }
    const gain = context.createGain();
    const peak = Math.max(0.0002, amplitude);
    const sustain = Math.max(0.0001, amplitude * (kind === 'bass' ? 0.7 : voice === 'pluck' ? 0.22 : 0.48));
    const attackEnd = time + Math.min(attack, duration * 0.3);
    gain.gain.setValueAtTime(0.0001, time);
    gain.gain.exponentialRampToValueAtTime(peak, attackEnd);
    const sidechain = conceptEngine && song.settings.genre === 'edm' && kind === 'chords';
    if (sidechain) {
      const step = song.beatSeconds || 0.5;
      let cursor = attackEnd;
      for (let beat = step; beat + 0.05 < duration; beat += step) {
        const dipAt = Math.min(time + beat + 0.02, time + duration - 0.05);
        const back = Math.min(time + beat + Math.min(step * 0.42, duration - beat), time + duration);
        if (dipAt <= cursor + 0.001 || back <= dipAt + 0.015) continue;
        gain.gain.exponentialRampToValueAtTime(peak, dipAt);
        gain.gain.exponentialRampToValueAtTime(Math.max(0.0002, amplitude * 0.28), dipAt + 0.012);
        gain.gain.exponentialRampToValueAtTime(peak, back);
        cursor = back;
      }
      if (cursor < time + duration - 0.001) gain.gain.exponentialRampToValueAtTime(sustain, time + duration);
    } else gain.gain.exponentialRampToValueAtTime(sustain, time + duration);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + duration + release);
    gain.connect(input);
    const source = context.createOscillator();
    source.type = wave;
    source.frequency.value = 440 * 2 ** ((event.midi - 69) / 12);
    if (voice === '808' && kind === 'bass') {
      const freq = source.frequency.value;
      source.frequency.setValueAtTime(freq * 2, time);
      source.frequency.exponentialRampToValueAtTime(Math.max(28, freq), time + 0.07);
    }
    source.connect(gain);
    source.start(time);
    track(source, [gain], time + duration + release + 0.02);
    if (conceptEngine && voice === 'saw' && kind !== 'bass') {
      [-14, 11].forEach(cents => {
        const stack = context.createOscillator();
        const stackGain = context.createGain();
        stack.type = 'sawtooth';
        stack.frequency.value = source.frequency.value * 2 ** (cents / 1200);
        stackGain.gain.setValueAtTime(amplitude * 0.42, time);
        stackGain.gain.exponentialRampToValueAtTime(0.0001, time + duration + release);
        stack.connect(stackGain);
        stackGain.connect(input);
        stack.start(time);
        track(stack, [stackGain], time + duration + release + 0.02);
      });
    }
    if (conceptEngine && voice === 'house' && kind === 'chords') {
      const tine = context.createOscillator();
      const tineGain = context.createGain();
      tine.type = 'sine';
      tine.frequency.value = source.frequency.value * 2;
      tineGain.gain.setValueAtTime(amplitude * 0.18, time);
      tineGain.gain.exponentialRampToValueAtTime(0.0001, time + Math.min(0.22, duration));
      tine.connect(tineGain);
      tineGain.connect(input);
      tine.start(time);
      track(tine, [tineGain], time + duration + 0.05);
    }
    if (timbre.wide && kind === 'chords') {
      const detuned = context.createOscillator();
      const detuneGain = context.createGain();
      detuned.type = source.type;
      detuned.frequency.value = source.frequency.value;
      detuned.detune.value = 8;
      detuneGain.gain.setValueAtTime(amplitude * 0.35, time);
      detuneGain.gain.exponentialRampToValueAtTime(0.0001, time + duration + release);
      detuned.connect(detuneGain);
      detuneGain.connect(input);
      detuned.start(time);
      track(detuned, [detuneGain], time + duration + release + 0.02);
    }
    if (kind === 'melody') {
      const harmonic = context.createOscillator();
      const harmonicGain = context.createGain();
      harmonic.type = 'sine';
      harmonic.frequency.value = source.frequency.value * 2;
      harmonicGain.gain.setValueAtTime(amplitude * 0.22, time);
      harmonicGain.gain.exponentialRampToValueAtTime(0.0001, time + Math.min(0.25, duration) + 0.03);
      harmonic.connect(harmonicGain);
      harmonicGain.connect(input);
      harmonic.start(time);
      track(harmonic, [harmonicGain], time + duration + 0.08);
    }
    if (voice === 'pad' && (kind === 'chords' || kind === 'melody')) {
      const detuned = context.createOscillator();
      const detuneGain = context.createGain();
      detuned.type = kind === 'chords' ? 'triangle' : 'sine';
      detuned.frequency.value = source.frequency.value;
      detuned.detune.value = kind === 'chords' ? 6 : -5;
      detuneGain.gain.setValueAtTime(amplitude * (kind === 'chords' ? 0.34 : 0.28), time);
      detuneGain.gain.exponentialRampToValueAtTime(0.0001, time + duration + release);
      detuned.connect(detuneGain);
      detuneGain.connect(input);
      detuned.start(time);
      track(detuned, [detuneGain], time + duration + release + 0.02);
    }
  }

  function bandVoice(event, time, duration) {
    const kind = event.instrument;
    const plucked = kind === 'chords' && duration < 0.75;
    const freq = 440 * 2 ** ((event.midi - 69) / 12);
    const attack = plucked ? 0.004 : kind === 'chords' ? 0.018 : kind === 'bass' ? 0.016 : 0.028;
    const release = plucked ? 0.14 : kind === 'chords' ? 0.48 : kind === 'bass' ? 0.16 : 0.3;
    const amplitude = (plucked ? 0.085 : kind === 'chords' ? 0.095 : kind === 'bass' ? 0.24 : 0.15) * event.velocity;
    const sustain = plucked ? 0.06 : kind === 'bass' ? 0.7 : 0.52;
    const gain = context.createGain();
    gain.gain.setValueAtTime(0.0001, time);
    gain.gain.exponentialRampToValueAtTime(Math.max(0.0002, amplitude), time + Math.min(attack, Math.max(0.003, duration * 0.25)));
    gain.gain.exponentialRampToValueAtTime(Math.max(0.0001, amplitude * sustain), time + duration);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + duration + release);
    const tone = context.createBiquadFilter();
    tone.type = 'lowpass';
    tone.frequency.value = plucked ? 3200 : kind === 'melody' ? 2800 : 2200;
    tone.Q.value = plucked ? 0.6 : 0.3;
    gain.connect(tone);
    tone.connect(input);
    const source = context.createOscillator();
    source.type = kind === 'bass' || kind === 'melody' ? 'sine' : 'triangle';
    source.frequency.value = freq;
    source.connect(gain);
    source.start(time);
    const nodes = [gain, tone];
    track(source, nodes, time + duration + release + 0.02);
    if (plucked) {
      const click = context.createBufferSource();
      click.buffer = noise;
      const clickFilter = context.createBiquadFilter();
      clickFilter.type = 'highpass';
      clickFilter.frequency.value = 1400;
      const clickGain = context.createGain();
      clickGain.gain.setValueAtTime(Math.max(0.0002, event.velocity * 0.045), time);
      clickGain.gain.exponentialRampToValueAtTime(0.0001, time + 0.045);
      click.connect(clickFilter);
      clickFilter.connect(clickGain);
      clickGain.connect(input);
      click.start(time, (event.time * 0.173) % 0.6);
      track(click, [clickFilter, clickGain], time + 0.06);
    } else if (kind === 'chords') {
      const pad = context.createOscillator();
      const padGain = context.createGain();
      pad.type = 'triangle';
      pad.frequency.value = freq;
      pad.detune.value = 7;
      padGain.gain.setValueAtTime(Math.max(0.0002, amplitude * 0.4), time);
      padGain.gain.exponentialRampToValueAtTime(0.0001, time + duration + release);
      pad.connect(padGain);
      padGain.connect(tone);
      pad.start(time);
      track(pad, [padGain], time + duration + release + 0.02);
    }
  }

  /** Two detuned formant singers, gliding between oo and ah, with a slow vibrato. */
  function formantPad(event, time, duration) {
    const base = 440 * 2 ** ((event.midi - 69) / 12);
    const from = vowelFormants(event.vowelFrom ?? 0);
    const to = vowelFormants(event.vowelTo ?? event.vowelFrom ?? 0);
    const output = context.createGain();
    const amp = Math.max(0.0002, 0.26 * event.velocity);
    const release = 0.5;
    output.gain.setValueAtTime(0.0001, time);
    output.gain.exponentialRampToValueAtTime(amp, time + Math.min(0.32, Math.max(0.05, duration * 0.35)));
    output.gain.exponentialRampToValueAtTime(Math.max(0.0001, amp * 0.8), time + duration);
    output.gain.exponentialRampToValueAtTime(0.0001, time + duration + release);
    output.connect(input);
    const body = context.createOscillator();
    body.type = 'sine';
    body.frequency.setValueAtTime(base, time);
    const bodyGain = context.createGain();
    bodyGain.gain.value = 0.62;
    body.connect(bodyGain);
    bodyGain.connect(output);
    body.start(time);
    const vibrato = context.createOscillator();
    vibrato.frequency.value = 5.05;
    const vibGain = context.createGain();
    vibGain.gain.setValueAtTime(0.0001, time);
    vibGain.gain.exponentialRampToValueAtTime(Math.max(0.0002, base * 0.007), time + Math.min(0.75, Math.max(0.12, duration * 0.4)));
    vibrato.connect(vibGain);
    vibGain.connect(body.frequency);
    vibrato.start(time);
    const nodes = [output, bodyGain, vibGain];
    [-6, 7].forEach(cents => {
      const osc = context.createOscillator();
      osc.type = 'sawtooth';
      const freq = base * 2 ** (cents / 1200);
      osc.frequency.setValueAtTime(freq, time);
      vibGain.connect(osc.frequency);
      const tame = context.createBiquadFilter();
      tame.type = 'lowpass';
      tame.frequency.value = 2600;
      tame.Q.value = 0.45;
      osc.connect(tame);
      from.forEach((startFreq, index) => {
        const band = context.createBiquadFilter();
        band.type = 'bandpass';
        band.frequency.setValueAtTime(startFreq, time);
        band.frequency.linearRampToValueAtTime(Math.max(90, to[index]), time + Math.max(0.08, duration));
        band.Q.value = clamp(startFreq / [80, 110, 170][index], 2.5, 11);
        const partial = context.createGain();
        partial.gain.value = [0.9, 0.55, 0.24][index];
        tame.connect(band);
        band.connect(partial);
        partial.connect(output);
        nodes.push(band, partial);
      });
      osc.start(time);
      nodes.push(tame);
      track(osc, [], time + duration + release + 0.02);
    });
    const stop = time + duration + release + 0.02;
    track(body, nodes, stop);
    track(vibrato, [], stop);
  }

  function percussion(event, time) {
    const gain = context.createGain();
    gain.connect(input);
    if (event.instrument === 'kick') {
      const source = context.createOscillator();
      const punchy = genre === 'edm' || genre === 'house';
      const eight = genre === 'trap';
      const softKit = ['modernrock', 'dawn', 'nitelofi', 'ballad', 'acoustic'].includes(genre);
      source.frequency.setValueAtTime(eight ? 148 : punchy ? 156 : softKit ? 86 : 105, time);
      source.frequency.exponentialRampToValueAtTime(eight ? 34 : punchy ? 46 : 44, time + (eight ? 0.16 : punchy ? 0.09 : softKit ? 0.11 : 0.075));
      gain.gain.setValueAtTime(0.0001, time);
      gain.gain.exponentialRampToValueAtTime(event.velocity * (eight ? 0.7 : softKit ? 0.48 : 0.57), time + 0.004);
      gain.gain.exponentialRampToValueAtTime(0.0001, time + (eight ? 0.42 : softKit ? 0.36 : 0.28));
      source.connect(gain);
      source.start(time);
      track(source, [gain], time + (eight ? 0.46 : softKit ? 0.4 : 0.3));
      return;
    }
    const hat = event.instrument === 'hat';
    const softKit = ['modernrock', 'dawn', 'nitelofi', 'ballad', 'acoustic'].includes(genre);
    const open = hat && event.midi === 46 && (genre === 'house' || genre === 'citypop');
    const source = context.createBufferSource();
    source.buffer = noise;
    const band = context.createBiquadFilter();
    band.type = hat ? 'highpass' : 'bandpass';
    band.frequency.value = hat ? 6200 : softKit ? 980 : 1600;
    band.Q.value = hat ? 0.45 : softKit ? 0.5 : 0.65;
    const length = hat ? (open ? 0.16 : 0.065) : 0.17;
    gain.gain.setValueAtTime(event.velocity * (hat ? 0.14 : 0.4), time);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + length);
    source.connect(band);
    band.connect(gain);
    source.start(time, (event.time * 0.137) % 0.7);
    track(source, [band, gain], time + length + 0.02);
  }

  function scheduleSpace(origin) {
    if (song.engine !== 'concept') return;
    const base = Math.max(280, PROFILES[genre].cutoff * ((timbre && timbre.cutoffMul) || 1));
    const now = context.currentTime;
    if (genre === 'house') {
      const at = Math.max(origin, now + 0.01);
      filter.Q.setValueAtTime(0.7, at);
      filter.frequency.setValueAtTime(base * 0.78, at);
      filter.frequency.linearRampToValueAtTime(base * 1.08, at + song.duration * 0.55);
      filter.frequency.linearRampToValueAtTime(base * 0.86, at + Math.max(song.duration, 0.2));
      return;
    }
    if (genre !== 'edm') return;
    let bar = 0;
    for (const section of song.structure || []) {
      const t0 = origin + bar * 4 * song.beatSeconds;
      const t1 = origin + (bar + section.bars) * 4 * song.beatSeconds;
      bar += section.bars;
      if (t1 < now + 0.02) continue;
      const from = Math.max(t0, now + 0.01);
      const to = Math.max(from + 0.08, t1);
      if (section.role === 'pre') {
        filter.frequency.setValueAtTime(Math.max(360, base * 0.32), from);
        filter.frequency.exponentialRampToValueAtTime(base * 1.35, to);
        const src = context.createBufferSource();
        src.buffer = noise;
        src.loop = true;
        const rise = context.createGain();
        const band = context.createBiquadFilter();
        band.type = 'bandpass';
        band.Q.value = 0.7;
        band.frequency.setValueAtTime(420, from);
        band.frequency.exponentialRampToValueAtTime(6400, to);
        rise.gain.setValueAtTime(0.0001, from);
        rise.gain.exponentialRampToValueAtTime(0.07, to);
        rise.gain.setValueAtTime(0.0001, to + 0.03);
        src.connect(band);
        band.connect(rise);
        rise.connect(input);
        src.start(from);
        src.stop(to + 0.04);
        track(src, [band, rise], to + 0.08);
      } else if (section.role === 'chorus') filter.frequency.setValueAtTime(base * 1.15, from);
      else if (section.role === 'intro' || section.role === 'verse' || section.role === 'bridge' || section.role === 'outro') filter.frequency.setValueAtTime(base * 0.4, from);
    }
  }

  return {
    master,
    scheduleSpace,
    schedule(event, time, duration = event.duration) {
      if (['kick', 'snare', 'hat'].includes(event.instrument)) percussion(event, time);
      else if (event.instrument === 'hum') formantPad(event, time, duration);
      else if (PROFILES[genre].voice === 'band') bandVoice(event, time, duration);
      else tonal(event, time, duration);
    },
    startBed(time = 0, offsetSeconds = 0, fadeIn = false) { bed.start(time, offsetSeconds, fadeIn); },
    setAmbience(levels) { bed.setLevels(levels, context.currentTime, false, true); },
    dispose() {
      bed.stop();
      for (const source of active) {
        try { source.stop(); } catch { /* Already ended. */ }
        source.disconnect();
      }
      active.clear();
      graphNodes.forEach(node => node.disconnect());
    },
    get activeSources() { return active.size; },
  };
}

function createAmbienceBed(context, song, destination) {
  const buffers = createAmbienceBuffers(context.sampleRate, AMBIENCE_SECONDS, song.ambienceSeed ?? song.seed);
  const gains = {};
  const sources = [];
  const nodes = [];
  for (const name of ['rain', 'vinyl', 'wind']) {
    const gain = context.createGain();
    gain.gain.value = 0;
    const buffer = context.createBuffer(2, buffers[name][0].length, context.sampleRate);
    buffers[name].forEach((channel, index) => buffer.getChannelData(index).set(channel));
    const source = context.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    source.connect(gain);
    gain.connect(destination);
    gains[name] = gain;
    sources.push(source);
    nodes.push(gain);
  }
  const loopSeconds = buffers.seconds || AMBIENCE_SECONDS;
  let started = false;
  function setLevels(levels, time, fadeIn = false, smooth = false) {
    const normalized = normalizeAmbience(levels?.ambience || levels);
    for (const name of ['rain', 'vinyl', 'wind']) {
      const target = ambienceAmount(normalized, name);
      const param = gains[name].gain;
      param.cancelScheduledValues(time);
      if (fadeIn) {
        param.setValueAtTime(0, time);
        param.linearRampToValueAtTime(target, time + 0.03);
      } else if (smooth) {
        param.setTargetAtTime(target, time, 0.05);
      } else {
        param.setValueAtTime(target, time);
      }
    }
  }
  setLevels(song.settings?.ambience, 0, false);
  return {
    nodes,
    setLevels,
    start(time, offsetSeconds = 0, fadeIn = false) {
      if (started) return;
      started = true;
      const offset = ((Number(offsetSeconds) % loopSeconds) + loopSeconds) % loopSeconds;
      if (fadeIn) setLevels(song.settings?.ambience, time, true);
      for (const source of sources) source.start(time, offset);
    },
    stop() {
      for (const source of sources) {
        try { source.stop(); } catch { /* Already ended. */ }
        source.disconnect();
      }
    },
  };
}

/** Web Audio player. play() must originate from a user gesture on mobile. */
export function createPlayer() {
  let context;
  let graph;
  let song;
  let status = 'stopped';
  let offset = 0;
  let startTime = 0;
  let timer;
  let volume = 0.8;
  let callbacks = {};
  let nextEvent = 0;
  let generation = 0;
  let pendingRatio = null;
  const position = () => status === 'playing' ? Math.min(song.duration, offset + Math.max(0, context.currentTime - startTime)) : offset;
  const clearGraph = () => { clearInterval(timer); graph?.dispose(); graph = null; };
  const report = () => callbacks.onProgress?.(song?.duration ? position() / song.duration : 0);

  return {
    async play(nextSong, handlers = {}) {
      const bed = normalizeAmbience(nextSong?.settings?.ambience);
      const bedOn = bed.rain + bed.vinyl + bed.wind > 0;
      if (!nextSong?.events?.length && !bedOn) throw new Error('재생할 악기를 하나 이상 선택해 주세요.');
      const AudioContextClass = globalThis.AudioContext || globalThis.webkitAudioContext;
      if (!AudioContextClass) throw new Error('이 브라우저는 오디오 재생을 지원하지 않습니다. 최신 Chrome 또는 Safari를 사용해 주세요.');
      const ticket = ++generation;
      if (!context || context.state === 'closed') context = new AudioContextClass();
      await context.resume();
      if (ticket !== generation) return;
      if (context.state !== 'running') throw new Error('오디오를 시작할 수 없습니다. 재생 버튼을 다시 눌러 주세요.');
      if (nextSong !== song || status !== 'paused') offset = 0;
      if (pendingRatio != null) {
        offset = clamp(pendingRatio, 0, 0.995) * nextSong.duration;
        pendingRatio = null;
      }
      clearGraph();
      song = nextSong;
      callbacks = handlers;
      graph = createGraph(context, song, context.destination, volume);
      startTime = context.currentTime + 0.045;
      graph.scheduleSpace(startTime - offset);
      graph.startBed(startTime, offset, true);
      status = 'playing';
      nextEvent = song.events.findIndex(event => event.time >= offset - 0.001);
      if (nextEvent < 0) nextEvent = song.events.length;
      // Restore sustained notes when resuming in the middle of a chord.
      if (offset > 0) {
        song.events.filter(event => !['kick', 'snare', 'hat'].includes(event.instrument) && event.time < offset && event.time + event.duration > offset)
          .forEach(event => graph.schedule(event, startTime, event.time + event.duration - offset));
      }
      const tick = () => {
        if (status !== 'playing' || ticket !== generation) return;
        const current = position();
        while (nextEvent < song.events.length && song.events[nextEvent].time < current + 0.38) {
          const event = song.events[nextEvent++];
          // Background tabs can throttle timers; skip stale hits rather than bursting them.
          const time = startTime + event.time - offset;
          if (time > context.currentTime - 0.08) graph.schedule(event, Math.max(context.currentTime + 0.002, time));
        }
        report();
        if (current >= song.duration && context.currentTime >= startTime + song.duration - offset + 0.45) {
          clearGraph();
          status = 'stopped';
          offset = 0;
          callbacks.onEnded?.();
        }
      };
      tick();
      timer = setInterval(tick, 60);
    },
    pause() {
      ++generation;
      if (status !== 'playing') return;
      offset = position();
      status = 'paused';
      clearGraph();
      report();
    },
    stop() {
      ++generation;
      status = 'stopped';
      offset = 0;
      pendingRatio = null;
      clearGraph();
      report();
    },
    setVolume(value) {
      volume = clamp(finite(value, 0.8), 0, 1);
      if (graph) graph.master.gain.setTargetAtTime(volume, context.currentTime, 0.02);
    },
    setAmbience(levels) {
      if (song?.settings) song.settings.ambience = normalizeAmbience(levels);
      if (graph) graph.setAmbience(song?.settings?.ambience || levels);
    },
    /** Move within the loaded sketch. Returns true when playback must be restarted by play(). */
    seek(ratio) {
      const clamped = clamp(finite(ratio, 0), 0, 0.995);
      if (!song?.duration) { pendingRatio = clamped; return false; }
      pendingRatio = null;
      const next = clamped * song.duration;
      const wasPlaying = status === 'playing';
      offset = next;
      if (wasPlaying) {
        ++generation;
        status = 'paused';
        clearGraph();
        return true;
      }
      status = next <= 0.0001 ? 'stopped' : 'paused';
      if (status === 'stopped') offset = 0;
      report();
      return false;
    },
    getState() { return { status, position: position(), duration: song?.duration || 0, volume, activeSources: graph?.activeSources || 0 }; },
    async destroy() {
      ++generation;
      clearGraph();
      status = 'stopped';
      offset = 0;
      if (context && context.state !== 'closed') await context.close();
      context = null;
    },
  };
}

/** Encode interleaved, signed 16-bit PCM with conservative peak normalization. */
export function encodeWav(channels, sampleRate = 44100) {
  if (!channels.length || !channels[0].length || channels.some(channel => channel.length !== channels[0].length)) throw new Error('잘못된 오디오 데이터입니다.');
  const frameCount = channels[0].length;
  const channelCount = channels.length;
  const dataBytes = frameCount * channelCount * 2;
  const buffer = new ArrayBuffer(44 + dataBytes);
  const view = new DataView(buffer);
  const text = (offset, value) => { for (let i = 0; i < value.length; i++) view.setUint8(offset + i, value.charCodeAt(i)); };
  text(0, 'RIFF'); view.setUint32(4, 36 + dataBytes, true); text(8, 'WAVE');
  text(12, 'fmt '); view.setUint32(16, 16, true); view.setUint16(20, 1, true);
  view.setUint16(22, channelCount, true); view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * channelCount * 2, true); view.setUint16(32, channelCount * 2, true); view.setUint16(34, 16, true);
  text(36, 'data'); view.setUint32(40, dataBytes, true);
  let peak = 0;
  for (const channel of channels) for (const value of channel) if (Number.isFinite(value)) peak = Math.max(peak, Math.abs(value));
  const scale = peak > 0.92 ? 0.92 / peak : 1;
  for (let frame = 0; frame < frameCount; frame++) {
    for (let channel = 0; channel < channelCount; channel++) {
      const raw = channels[channel][frame];
      const value = Number.isFinite(raw) ? clamp(raw * scale, -1, 1) : 0;
      view.setInt16(44 + (frame * channelCount + channel) * 2, Math.round(value * (value < 0 ? 32768 : 32767)), true);
    }
  }
  return new Blob([buffer], { type: 'audio/wav' });
}

function cancelError() {
  const error = new Error('내보내기를 취소했어요.');
  error.name = 'AbortError';
  return error;
}

function yieldNow() {
  return new Promise(resolve => setTimeout(resolve, 0));
}

/** Section seeds for a long export. Index 0 keeps the sketch the listener already has. */
export function variationSeed(seed, index) {
  const base = finite(seed, 1) >>> 0;
  const step = Math.max(0, Math.round(finite(index, 0)));
  if (step === 0) return base;
  let value = base ^ Math.imul(step + 1, 0x9E3779B1);
  value = Math.imul(value ^ value >>> 16, 0x7FEB352D);
  value = Math.imul(value ^ value >>> 15, 0x846CA68B);
  value ^= value >>> 16;
  return value >>> 0;
}

/**
 * Place full sketches back to back, overlapping by a crossfade, until the timeline is filled.
 * The last section is shortened so the covered frames match the request.
 */
export function planLongform({ duration, totalSeconds, fadeSeconds = 2.4, seed = 1, sampleRate = 44100 } = {}) {
  const rate = Math.max(1000, Math.round(finite(sampleRate, 44100)));
  const durationFrames = Math.max(1, Math.round(Math.max(0.5, finite(duration, 0.5)) * rate));
  const totalFrames = Math.max(durationFrames, Math.round(Math.max(0.5, finite(totalSeconds, duration)) * rate));
  let fadeFrames = Math.round(clamp(finite(fadeSeconds, 2.4), 0.2, 4) * rate);
  fadeFrames = Math.min(fadeFrames, Math.max(1, Math.floor(durationFrames * 0.3)));
  const minSection = Math.max(fadeFrames + Math.round(rate * 0.5), Math.min(durationFrames, Math.round(rate * 4)));
  const sections = [];
  let start = 0;
  let index = 0;
  while (start < totalFrames && index < 1000) {
    const room = totalFrames - start;
    const canFitAnother = room > durationFrames + minSection;
    if (canFitAnother) {
      sections.push({ index, seed: variationSeed(seed, index), startFrame: start, frames: durationFrames, overlapFrames: fadeFrames });
      start += durationFrames - fadeFrames;
      index += 1;
      continue;
    }
    sections.push({ index, seed: variationSeed(seed, index), startFrame: start, frames: room, overlapFrames: 0 });
    break;
  }
  const last = sections.at(-1);
  return { sampleRate: rate, fadeFrames, sections, totalFrames, coveredFrames: last.startFrame + last.frames, durationFrames };
}

/** Fold the render tail into the head so a file of exactly one cycle loops without a click. */
export function foldLoop(channels, sampleRate, durationSeconds, fadeSeconds) {
  const rate = Math.max(1, Math.round(finite(sampleRate, 44100)));
  const loopFrames = Math.max(1, Math.round(finite(durationSeconds, 0) * rate));
  const fade = Math.max(1, Math.min(Math.max(1, loopFrames - 1), Math.round(Math.max(0, finite(fadeSeconds, 0)) * rate)));
  return channels.map(channel => {
    const out = new Float32Array(loopFrames);
    for (let index = 0; index < loopFrames; index++) {
      const current = index < channel.length && Number.isFinite(channel[index]) ? channel[index] : 0;
      if (index < fade && fade > 1) {
        const tailIndex = loopFrames + index;
        const tail = tailIndex < channel.length && Number.isFinite(channel[tailIndex]) ? channel[tailIndex] : 0;
        const mixAmount = index / (fade - 1);
        out[index] = current * Math.sin(mixAmount * Math.PI / 2) + tail * Math.cos(mixAmount * Math.PI / 2);
      } else out[index] = current;
    }
    return out;
  });
}

/** Equal-power blend. The first sample is the outgoing tail and the last sample is the incoming head. */
export function mixCrossfade(tail, head, frames = tail[0]?.length || 0) {
  const count = Math.max(0, Math.min(frames, tail[0]?.length || 0, head[0]?.length || 0));
  return tail.map((channel, channelIndex) => {
    const mixed = new Float32Array(count);
    const incoming = head[channelIndex] || [];
    for (let index = 0; index < count; index++) {
      const mixAmount = count <= 1 ? 1 : index / (count - 1);
      const outgoing = Number.isFinite(channel[index]) ? channel[index] : 0;
      const next = Number.isFinite(incoming[index]) ? incoming[index] : 0;
      mixed[index] = outgoing * Math.cos(mixAmount * Math.PI / 2) + next * Math.sin(mixAmount * Math.PI / 2);
    }
    return mixed;
  });
}

export function wavHeaderBytes(dataBytes, sampleRate = 44100, channelCount = 2) {
  const buffer = new ArrayBuffer(44);
  const view = new DataView(buffer);
  const text = (offset, value) => { for (let index = 0; index < value.length; index++) view.setUint8(offset + index, value.charCodeAt(index)); };
  const block = channelCount * 2;
  text(0, 'RIFF');
  view.setUint32(4, 36 + dataBytes, true);
  text(8, 'WAVE');
  text(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, channelCount, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * block, true);
  view.setUint16(32, block, true);
  view.setUint16(34, 16, true);
  text(36, 'data');
  view.setUint32(40, dataBytes, true);
  return new Uint8Array(buffer);
}

function fitChannels(channels, frames) {
  return channels.map(channel => {
    if (channel.length === frames) return channel;
    const next = new Float32Array(frames);
    next.set(channel.subarray(0, Math.min(frames, channel.length)));
    return next;
  });
}

function sliceChannels(channels, start, end) {
  return channels.map(channel => channel.slice(start, end));
}

function fadeEdge(channels, from, to, direction) {
  const length = Math.max(1, to - from);
  for (const channel of channels) {
    for (let index = 0; index < length; index++) {
      const at = from + index;
      if (at < 0 || at >= channel.length) continue;
      const amount = index / length;
      const gain = direction === 'out' ? Math.cos(amount * Math.PI / 2) : Math.sin(amount * Math.PI / 2);
      channel[at] *= gain;
    }
  }
}

function interleavePcm16(channels) {
  const frames = channels[0].length;
  const channelCount = channels.length;
  const bytes = new Uint8Array(frames * channelCount * 2);
  const view = new DataView(bytes.buffer);
  for (let frame = 0; frame < frames; frame++) {
    for (let channel = 0; channel < channelCount; channel++) {
      const raw = channels[channel][frame];
      const value = Number.isFinite(raw) ? clamp(raw, -1, 1) : 0;
      view.setInt16((frame * channelCount + channel) * 2, Math.round(value * (value < 0 ? 32768 : 32767)), true);
    }
  }
  return bytes;
}

async function renderToChannels(song, frames, sampleRate = 44100, offsetSeconds = 0) {
  const OfflineContext = globalThis.OfflineAudioContext || globalThis.webkitOfflineAudioContext;
  if (!OfflineContext) throw new Error('이 브라우저는 WAV 내보내기를 지원하지 않습니다. MIDI로 저장하거나 최신 브라우저를 사용해 주세요.');
  const length = Math.max(1, Math.round(frames));
  const context = new OfflineContext(2, length, sampleRate);
  const graph = createGraph(context, song, context.destination, 0.85);
  graph.scheduleSpace(0.02);
  graph.startBed(0, offsetSeconds, false);
  const seconds = length / sampleRate;
  for (const event of song.events) {
    if (event.time >= seconds) break;
    graph.schedule(event, event.time + 0.02);
  }
  const audio = await context.startRendering();
  const left = new Float32Array(audio.length);
  const right = new Float32Array(audio.length);
  left.set(audio.getChannelData(0));
  right.set(audio.getChannelData(1));
  graph.dispose();
  return [left, right];
}

export async function renderWav(song) {
  const sampleRate = 44100;
  const frames = Math.ceil((song.duration + 0.8) * sampleRate);
  return encodeWav(await renderToChannels(song, frames, sampleRate, 0), sampleRate);
}

/** One cycle, with the decay folded into the start so the file can repeat. */
export async function renderLoopWav(song, options = {}) {
  const render = options.renderChannels || renderToChannels;
  const sampleRate = 44100;
  if (options.shouldCancel?.()) throw cancelError();
  const fadeSeconds = Math.min(Math.max(0.4, finite(options.fadeSeconds, 1.2)), Math.max(0.4, song.duration * 0.22));
  const frames = Math.ceil((song.duration + fadeSeconds + 0.05) * sampleRate);
  const channels = await render(song, frames, sampleRate, 0);
  if (options.shouldCancel?.()) throw cancelError();
  return encodeWav(foldLoop(channels, sampleRate, song.duration, fadeSeconds), sampleRate);
}

/**
 * Render variation sections one at a time and append 16-bit frames.
 * Only the current render and the crossfade tail are kept as float audio.
 */
export async function renderLongformWav(settings = {}, options = {}) {
  const render = options.renderChannels || renderToChannels;
  const sampleRate = options.sampleRate || 44100;
  const probe = options.probeSong || compose(settings);
  const totalSeconds = options.totalSeconds ?? (Number(options.minutes) || 30) * 60;
  const plan = planLongform({
    duration: probe.duration,
    totalSeconds,
    fadeSeconds: options.fadeSeconds ?? 2.4,
    seed: probe.seed,
    sampleRate,
  });
  const parts = [];
  let pending = null;
  let emitted = 0;
  for (let index = 0; index < plan.sections.length; index++) {
    if (options.shouldCancel?.()) throw cancelError();
    options.onProgress?.({ index, count: plan.sections.length, ratio: index / plan.sections.length, emitted, totalFrames: plan.totalFrames });
    await yieldNow();
    if (options.shouldCancel?.()) throw cancelError();
    const section = plan.sections[index];
    const song = compose({ ...settings, seed: section.seed });
    song.ambienceSeed = probe.seed;
    let channels = fitChannels(await render(song, section.frames, sampleRate, section.startFrame / sampleRate), section.frames);
    if (options.shouldCancel?.()) throw cancelError();
    let bodyFrom = 0;
    if (!pending) fadeEdge(channels, 0, Math.min(Math.round(sampleRate * 0.015), Math.max(1, section.frames >> 3)), 'in');
    if (pending) {
      const mixed = mixCrossfade(pending, channels, pending[0].length);
      if (mixed[0].length) {
        parts.push(interleavePcm16(mixed));
        emitted += mixed[0].length;
      }
      bodyFrom = pending[0].length;
      pending = null;
    }
    if (section.overlapFrames > 0) {
      const holdFrom = section.frames - section.overlapFrames;
      if (holdFrom > bodyFrom) {
        const body = sliceChannels(channels, bodyFrom, holdFrom);
        parts.push(interleavePcm16(body));
        emitted += body[0].length;
      }
      pending = sliceChannels(channels, Math.max(bodyFrom, holdFrom), section.frames);
    } else {
      const fadeFrames = Math.min(section.frames - bodyFrom, Math.max(1, Math.min(Math.round(sampleRate * 2.5), Math.floor(section.frames / 4))));
      fadeEdge(channels, section.frames - fadeFrames, section.frames, 'out');
      const body = sliceChannels(channels, bodyFrom, section.frames);
      if (body[0].length) {
        parts.push(interleavePcm16(body));
        emitted += body[0].length;
      }
    }
    channels = null;
  }
  if (pending?.[0]?.length) {
    parts.push(interleavePcm16(pending));
    emitted += pending[0].length;
  }
  const dataBytes = parts.reduce((sum, part) => sum + part.byteLength, 0);
  options.onProgress?.({ index: plan.sections.length, count: plan.sections.length, ratio: 1, emitted, totalFrames: plan.totalFrames });
  return new Blob([wavHeaderBytes(dataBytes, sampleRate, 2), ...parts], { type: 'audio/wav' });
}

function variableLength(value) {
  let number = Math.max(0, Math.round(value));
  const bytes = [number & 0x7f];
  while ((number >>>= 7)) bytes.unshift((number & 0x7f) | 0x80);
  return bytes;
}

const ascii = value => Array.from(value, character => character.charCodeAt(0));
const u32 = value => [value >>> 24 & 255, value >>> 16 & 255, value >>> 8 & 255, value & 255];
function midiTrack(messages, endTick) {
  messages.sort((a, b) => a.tick - b.tick || (a.off ? -1 : 1) - (b.off ? -1 : 1));
  const bytes = [];
  let tick = 0;
  for (const message of messages) {
    bytes.push(...variableLength(message.tick - tick), ...message.bytes);
    tick = message.tick;
  }
  bytes.push(...variableLength(Math.max(0, endTick - tick)), 0xff, 0x2f, 0);
  return [...ascii('MTrk'), ...u32(bytes.length), ...bytes];
}

/** Standard MIDI format 1: tempo track plus melody, harmony, bass, drums, and hum. */
export function createMidi(song) {
  const ppq = 480;
  const endTick = song.bars * 4 * ppq;
  const tempo = Math.round(60000000 / song.bpm);
  const meta = [
    { tick: 0, bytes: [0xff, 0x51, 3, tempo >>> 16 & 255, tempo >>> 8 & 255, tempo & 255] },
    { tick: 0, bytes: [0xff, 0x58, 4, 4, 2, 24, 8] },
  ];
  const tracks = [midiTrack(meta, endTick)];
  for (const layer of MIDI_TRACKS) {
    const messages = [{ tick: 0, bytes: [0xff, 0x03, layer.name.length, ...ascii(layer.name)] }];
    const timbre = song.timbre || {};
    const program = layer.instrument === 'melody' ? (timbre.melodyProgram ?? layer.program)
      : layer.instrument === 'chords' ? (timbre.chordProgram ?? layer.program)
        : layer.program;
    if (program !== undefined) messages.push({ tick: 0, bytes: [0xc0 | layer.channel, program] });
    messages.push({ tick: 0, bytes: [0xb0 | layer.channel, 7, layer.instrument === 'chords' ? 75 : 96] });
    for (const event of song.events) {
      const drum = ['kick', 'snare', 'hat'].includes(event.instrument);
      if (layer.instrument === 'drums' ? !drum : event.instrument !== layer.instrument) continue;
      const start = Math.round(event.time / song.beatSeconds * ppq);
      const end = Math.min(endTick, Math.max(start + 1, Math.round((event.time + event.duration) / song.beatSeconds * ppq)));
      messages.push({ tick: start, bytes: [0x90 | layer.channel, event.midi, Math.max(1, Math.round(event.velocity * 104))] });
      messages.push({ tick: end, off: true, bytes: [0x80 | layer.channel, event.midi, 0] });
    }
    tracks.push(midiTrack(messages, endTick));
  }
  const header = [...ascii('MThd'), 0, 0, 0, 6, 0, 1, 0, tracks.length, ppq >>> 8, ppq & 255];
  return new Blob([new Uint8Array([...header, ...tracks.flat()])], { type: 'audio/midi' });
}
