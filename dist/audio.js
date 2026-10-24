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
  warm: [0, 5, 1, 4], dreamy: [3, 0, 5, 4],
  bright: [0, 4, 5, 3], melancholy: [5, 3, 0, 4],
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
};
export function genreProfile(genre) {
  return Object.hasOwn(PROFILES, genre) ? { ...PROFILES[genre] } : null;
}
const MIDI_TRACKS = [
  { name: 'Melody', instrument: 'melody', channel: 0, program: 4 },
  { name: 'Harmony', instrument: 'chords', channel: 1, program: 4 },
  { name: 'Bass', instrument: 'bass', channel: 2, program: 33 },
  { name: 'Drums', instrument: 'drums', channel: 9 },
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
    instruments: Object.fromEntries(['melody', 'chords', 'bass', 'drums'].map(key => [key, layers[key] !== false])),
  };
}

function chordForDegree(degree, key, closing) {
  const root = key + SCALE[degree];
  const minor = [1, 2, 5].includes(degree);
  let intervals = minor ? [0, 3, 7, 10] : degree === 4 ? [0, 4, 7, 9] : [0, 4, 7, 11];
  let suffix = minor ? 'm7' : degree === 4 ? '6' : 'maj7';
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
  return options.sort((a, b) => Math.abs(a - target) - Math.abs(b - target))[0];
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
  const progression = PROGRESSIONS[mood];
  const motif = Array.from({ length: 6 }, (_, index) => [2, 1, 3, 2, 0, 1][(index + Math.floor(random() * 2)) % 6]);
  const motifTranspose = random() > 0.5 ? 2 : -1;
  let previousVoicing;
  let lastMelody = 72 + key;

  function add(instrument, beat, length, midi, velocity, humanize = true) {
    const drift = humanize && genre !== 'ambient' ? (random() - 0.5) * 0.015 : 0;
    const time = Math.max(0, beat * beatSeconds + drift);
    const duration = Math.min(length * beatSeconds, bars * 4 * beatSeconds - time);
    if (duration <= 0) return;
    events.push({ instrument, time: round(time), duration: round(duration), midi, velocity: round(clamp(velocity * (0.94 + random() * 0.12), 0.1, 0.95)) });
  }

  for (let bar = 0; bar < bars; bar++) {
    const finalBar = bar === bars - 1;
    const degree = finalBar ? progression[0] : progression[bar % 4];
    const chord = scaleName === 'major' ? chordForDegree(degree, key, finalBar) : chordForDegreeScaled(degree, key, finalBar, activeScale);
    const voicing = voiceChord(chord, previousVoicing);
    previousVoicing = voicing;
    const beat = bar * 4;
    chords.push({ ...chord, bar, notes: voicing, time: round(beat * beatSeconds), duration: round(4 * beatSeconds) });
    const intro = bars > 8 && bar < 2;
    const energy = finalBar ? 0.7 : intro ? 0.76 : 0.92 + Math.sin(bar / bars * Math.PI) * 0.08;

    {
      const hits = genre === 'pop' && !finalBar ? [[0, 1.35], [1.5, 0.8], [2.5, 1.35]]
        : genre === 'rnb' && !finalBar ? [[0, 2.1], [2.5, 1.4]]
          : genre === 'edm' && !finalBar ? [[0, 0.42], [1, 0.42], [2, 0.42], [3, 0.42]]
            : genre === 'acoustic' && !finalBar ? [[0, 1.7], [2, 1.5]]
              : [[0, finalBar ? 3.8 : 3.9]];
      for (const [position, length] of hits) {
        voicing.forEach((midi, index) => add('chords', beat + position + index * 0.018, length - index * 0.018, midi, energy * (genre === 'ambient' ? 0.58 : 0.52)));
      }
    }

    {
      const bass = 36 + chord.root;
      if (genre === 'edm' && !finalBar) {
        [0, 0.75, 1.5, 2.5, 3.25].forEach((position, index) => add('bass', beat + position, index === 4 ? 0.5 : 0.42, bass + (index === 3 ? 12 : 0), energy * (index % 2 ? 0.62 : 0.74), false));
      } else if (genre === 'cinematic') {
        add('bass', beat, finalBar ? 3.8 : 3.6, bass, 0.62 * energy);
        if (!finalBar && bar % 2 === 1) add('bass', beat + 3, 0.7, bass + 12, 0.4 * energy);
      } else {
        add('bass', beat, finalBar || genre === 'ambient' ? 3.7 : 1.6, bass, 0.68 * energy);
        if (!finalBar && genre !== 'ambient') {
          add('bass', beat + (genre === 'rnb' ? 1.75 : 2), 1.2, bass, 0.57 * energy);
          if (!intro && bar % 2 === 1) add('bass', beat + 3.5, 0.42, bass + (random() > 0.5 ? 7 : 12), 0.46 * energy);
        }
      }
    }

    {
      if (finalBar) {
        const resolving = nearestPitch(chord.root, lastMelody, 67, 85);
        add('melody', beat + 0.05, 3.1, resolving, 0.68);
        lastMelody = resolving;
      } else {
        profile.melody.forEach((position, index) => {
          if (intro && position < 2) return;
          if (bar % 4 === 3 && position > 2.75) return; // Space to breathe at the end of a phrase.
          const target = 74 + key + (bar % 4 === 2 ? motifTranspose : 0);
          const chordTone = chord.intervals[motif[index % motif.length] % chord.intervals.length];
          let midi = nearestPitch(chord.root + chordTone, index === 0 ? lastMelody : target + (index % 3 - 1) * 2, 67, 85);
          // A short diatonic passing note, always resolving onto the next chord tone.
          if (index === 2 && bar % 4 === 1 && genre !== 'ambient' && genre !== 'cinematic') {
            const passing = Array.from({ length: 24 }, (_, i) => 64 + i).filter(note => activeScale.includes((note - key + 120) % 12));
            midi = passing.sort((a, b) => Math.abs(a - lastMelody + 2) - Math.abs(b - lastMelody + 2))[0];
          }
          const swing = position % 1 === 0.5 ? profile.swing : 0;
          const next = profile.melody[index + 1] ?? 4;
          const length = Math.min(profile.length * (index === 0 ? 1.2 : 1), next - position - 0.08);
          add('melody', beat + position + swing, Math.max(0.18, length), midi, energy * (index === 0 ? 0.7 : 0.58));
          lastMelody = midi;
        });
      }
    }

    if (!finalBar) {
      if (genre === 'ambient') {
        if (bar % 2 === 0) add('kick', beat, 0.3, 36, 0.27);
        [1.5, 3.5].forEach(position => add('hat', beat + position, 0.09, 42, 0.17));
      } else if (genre === 'ballad') {
        add('kick', beat, 0.32, 36, energy * 0.48);
        if (!intro) add('snare', beat + 2, 0.2, 38, energy * 0.32);
        [0, 2].forEach(position => add('hat', beat + position, 0.08, 42, energy * 0.16));
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
      } else {
        const kicks = genre === 'pop' ? [0, 1, 2, 3] : genre === 'rnb' ? [0, 1.75, 2.5] : [0, 2.25];
        kicks.forEach((position, index) => add('kick', beat + position, 0.29, 36, energy * (index === 0 ? 0.7 : 0.52)));
        if (!intro || bar > 0) [1, 3].forEach(position => add('snare', beat + position + (genre === 'lofi' ? 0.035 : 0), 0.18, 38, energy * 0.46));
        for (let index = 0; index < 8; index++) {
          if (intro && index % 2) continue;
          add('hat', beat + index * 0.5 + (index % 2 ? profile.swing : 0), 0.065, 42, energy * (index % 2 ? 0.21 : 0.31));
        }
        if (!intro && bar % 8 === 7) add('snare', beat + 3.75, 0.12, 38, 0.23);
      }
    }
  }

  events.sort((a, b) => a.time - b.time || a.midi - b.midi);
  return {
    events: events.filter(event => instruments[['kick', 'snare', 'hat'].includes(event.instrument) ? 'drums' : event.instrument]),
    duration: round(bars * 4 * beatSeconds), bpm, bars, totalBars: bars,
    chords, chordNames: chords.slice(0, 4).map(chord => chord.name), seed, settings,
    beatSeconds, timeSignature: [4, 4],
  };
}

function createGraph(context, song, destination, initialVolume = 0.8) {
  const active = new Set();
  const input = context.createGain();
  input.gain.value = 0.84;
  const filter = context.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = PROFILES[song.settings.genre].cutoff;
  filter.Q.value = 0.2;
  const compressor = context.createDynamicsCompressor();
  compressor.threshold.value = -17;
  compressor.knee.value = 13;
  compressor.ratio.value = 3;
  compressor.attack.value = 0.008;
  compressor.release.value = 0.18;
  const master = context.createGain();
  master.gain.value = initialVolume;
  input.connect(filter);
  filter.connect(compressor);
  compressor.connect(master);
  master.connect(destination);

  const delay = context.createDelay(1);
  delay.delayTime.value = Math.min(0.42, song.beatSeconds * 0.5);
  const feedback = context.createGain();
  const spacious = song.settings.genre === 'ambient' || song.settings.genre === 'cinematic';
  feedback.gain.value = spacious ? 0.28 : song.settings.genre === 'edm' ? 0.08 : 0.15;
  const wet = context.createGain();
  wet.gain.value = spacious ? 0.2 : song.settings.genre === 'edm' ? 0.06 : 0.09;
  const echoFilter = context.createBiquadFilter();
  echoFilter.type = 'lowpass';
  echoFilter.frequency.value = 1800;
  filter.connect(delay);
  delay.connect(echoFilter);
  echoFilter.connect(feedback);
  feedback.connect(delay);
  echoFilter.connect(wet);
  wet.connect(compressor);

  const random = seededRandom(song.seed);
  const noise = context.createBuffer(1, context.sampleRate, context.sampleRate);
  const noiseData = noise.getChannelData(0);
  for (let i = 0; i < noiseData.length; i++) noiseData[i] = random() * 2 - 1;
  const graphNodes = [input, filter, compressor, master, delay, feedback, wet, echoFilter];

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
    const attack = pad ? (kind === 'bass' ? 0.04 : 0.14)
      : voice === 'pluck' ? 0.008
        : voice === 'saw' ? 0.008
          : kind === 'chords' ? (ambient ? 0.19 : 0.035) : kind === 'bass' ? 0.012 : 0.012;
    const release = pad ? (kind === 'bass' ? 0.2 : 0.55)
      : voice === 'pluck' ? (kind === 'chords' ? 0.28 : 0.12)
        : voice === 'saw' ? 0.08
          : kind === 'chords' ? 0.33 : kind === 'bass' ? 0.12 : 0.23;
    const amplitude = (kind === 'chords' ? (voice === 'saw' ? 0.07 : 0.105) : kind === 'bass' ? (voice === 'saw' ? 0.22 : 0.3) : (voice === 'saw' ? 0.16 : 0.24)) * event.velocity;
    const gain = context.createGain();
    gain.gain.setValueAtTime(0.0001, time);
    gain.gain.exponentialRampToValueAtTime(Math.max(0.0002, amplitude), time + Math.min(attack, duration * 0.3));
    gain.gain.exponentialRampToValueAtTime(Math.max(0.0001, amplitude * (kind === 'bass' ? 0.7 : voice === 'pluck' ? 0.22 : 0.48)), time + duration);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + duration + release);
    gain.connect(input);
    const source = context.createOscillator();
    source.type = voice === 'saw' ? (kind === 'bass' ? 'square' : 'sawtooth')
      : voice === 'pluck' || voice === 'wide' ? 'triangle'
        : kind === 'chords' ? 'triangle' : 'sine';
    source.frequency.value = 440 * 2 ** ((event.midi - 69) / 12);
    source.connect(gain);
    source.start(time);
    track(source, [gain], time + duration + release + 0.02);
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
  }

  function percussion(event, time) {
    const gain = context.createGain();
    gain.connect(input);
    if (event.instrument === 'kick') {
      const source = context.createOscillator();
      const punchy = song.settings.genre === 'edm';
      source.frequency.setValueAtTime(punchy ? 156 : 105, time);
      source.frequency.exponentialRampToValueAtTime(punchy ? 46 : 44, time + (punchy ? 0.09 : 0.075));
      gain.gain.setValueAtTime(0.0001, time);
      gain.gain.exponentialRampToValueAtTime(event.velocity * 0.57, time + 0.004);
      gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.28);
      source.connect(gain);
      source.start(time);
      track(source, [gain], time + 0.3);
      return;
    }
    const hat = event.instrument === 'hat';
    const source = context.createBufferSource();
    source.buffer = noise;
    const band = context.createBiquadFilter();
    band.type = hat ? 'highpass' : 'bandpass';
    band.frequency.value = hat ? 6200 : 1600;
    band.Q.value = hat ? 0.45 : 0.65;
    const length = hat ? 0.065 : 0.17;
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

/** Standard MIDI format 1: tempo track and four independently editable layers. */
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
    if (layer.program !== undefined) messages.push({ tick: 0, bytes: [0xc0 | layer.channel, layer.program] });
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
