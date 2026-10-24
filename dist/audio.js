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
  pop: { swing: 0, melody: [0, 0.5, 1.5, 2, 2.75, 3.5], length: 0.43, cutoff: 6500 },
  ambient: { swing: 0, melody: [0, 1.5, 3], length: 1.25, cutoff: 3000 },
  rnb: { swing: 0.09, melody: [0, 0.75, 1.75, 2.5, 3.25], length: 0.64, cutoff: 4200 },
  ballad: { swing: 0.04, melody: [0, 1.25, 2.5], length: 0.95, cutoff: 2800, voice: 'pad' },
  edm: { swing: 0, melody: [0, 0.5, 1, 1.5, 2.5, 3.25], length: 0.32, cutoff: 7600, voice: 'saw' },
  acoustic: { swing: 0.02, melody: [0, 0.75, 1.5, 2.5, 3.25], length: 0.5, cutoff: 5000, voice: 'pluck' },
  cinematic: { swing: 0, melody: [0, 2], length: 1.6, cutoff: 2400, voice: 'wide' },
  modernrock: { swing: 0.03, melody: [0, 1, 2.25, 3.25], length: 0.78, cutoff: 4300, voice: 'band' },
  dawn: { swing: 0.02, melody: [0, 1.5, 3], length: 1.35, cutoff: 2500, voice: 'pad' },
  nitelofi: { swing: 0.12, melody: [0, 1, 2.25, 3.25], length: 0.84, cutoff: 3000, voice: 'pad' },
  citypop: { swing: 0.06, swingRange: [0.04, 0.1], melody: [0, 0.5, 1.5, 2, 3, 3.5], length: 0.48, cutoff: 4600, voice: 'keys', harmony: 'city' },
  trap: { swing: 0, swingRange: [0, 0.02], melody: [0, 1.5, 3], length: 0.34, cutoff: 5400, voice: '808' },
  house: { swing: 0, swingRange: [0, 0], melody: [0, 0.5, 1.5, 2, 3, 3.5], length: 0.3, cutoff: 7400, voice: 'house' },
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

/** Section lengths for a sketch. The same inputs are used by the lyric brief. */
export function planStructure(bars, genre = 'lofi', mood = 'warm', seed = 1, cues = {}) {
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
  for (const section of structure) {
    spans.push({ ...section, start });
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

export function compose(input = {}) {
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
    beatSeconds, timeSignature: [4, 4], structure, swing: plan.swing, timbre: plan.timbre,
    variation: { groove: plan.groove, texture: plan.texture, contour: plan.contour, bass: plan.bass, rhythm: plan.rhythm.map(value => value).join(','), color: Boolean(harmony.color) },
  };
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
  const graphNodes = [input, warmth, shaper, filter, compressor, limiter, master, delay, feedback, wet, echoFilter, reverbSend, reverbHighpass, predelay, convolver, damp, reverbReturn];

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
    if (voice === 'keys' || voice === '808' || voice === 'house' || voice === 'nylon' || voice === 'pulse') {
      const shaped = voiceShape(voice, kind);
      attack = shaped.attack * (timbre.attackMul || 1);
      release = shaped.release;
      amplitude = shaped.amplitude * event.velocity;
      wave = shaped.wave;
    }
    const gain = context.createGain();
    gain.gain.setValueAtTime(0.0001, time);
    gain.gain.exponentialRampToValueAtTime(Math.max(0.0002, amplitude), time + Math.min(attack, duration * 0.3));
    gain.gain.exponentialRampToValueAtTime(Math.max(0.0001, amplitude * (kind === 'bass' ? 0.7 : voice === 'pluck' ? 0.22 : 0.48)), time + duration);
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

  return {
    master,
    schedule(event, time, duration = event.duration) {
      if (['kick', 'snare', 'hat'].includes(event.instrument)) percussion(event, time);
      else if (event.instrument === 'hum') formantPad(event, time, duration);
      else if (PROFILES[genre].voice === 'band') bandVoice(event, time, duration);
      else tonal(event, time, duration);
    },
    dispose() {
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
      if (!nextSong?.events?.length) throw new Error('재생할 악기를 하나 이상 선택해 주세요.');
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

export async function renderWav(song) {
  const OfflineContext = globalThis.OfflineAudioContext || globalThis.webkitOfflineAudioContext;
  if (!OfflineContext) throw new Error('이 브라우저는 WAV 내보내기를 지원하지 않습니다. MIDI로 저장하거나 최신 브라우저를 사용해 주세요.');
  const sampleRate = 44100;
  const context = new OfflineContext(2, Math.ceil((song.duration + 0.8) * sampleRate), sampleRate);
  const graph = createGraph(context, song, context.destination, 0.85);
  for (const event of song.events) graph.schedule(event, event.time + 0.02);
  const audio = await context.startRendering();
  graph.dispose();
  return encodeWav([audio.getChannelData(0), audio.getChannelData(1)], sampleRate);
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
