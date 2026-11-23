/** Same-origin instrument sample and IR loader for SONORI 1.8.0+. */
const MODULE_BASE = new URL('samples/', import.meta.url).href;

export const GENRE_PACKS = {
  lofi: ['piano', 'bass', 'drums'],
  pop: ['piano', 'guitar', 'bass', 'drums'],
  rnb: ['piano', 'strings', 'bass', 'drums'],
  ambient: ['strings', 'piano', 'bass', 'drums'],
  ballad: ['strings', 'piano', 'bass', 'drums'],
  edm: ['piano', 'strings', 'bass', 'drums'],
  acoustic: ['guitar', 'bass', 'drums'],
  cinematic: ['strings', 'piano', 'bass', 'drums'],
  modernrock: ['piano', 'guitar', 'strings', 'bass', 'drums'],
  dawn: ['piano', 'strings', 'bass', 'drums'],
  nitelofi: ['piano', 'strings', 'bass', 'drums'],
  citypop: ['piano', 'bass', 'drums'],
  trap: ['piano', 'bass', 'drums'],
  house: ['piano', 'bass', 'drums'],
  bossa: ['guitar', 'piano', 'bass', 'drums'],
  reggaeton: ['guitar', 'piano', 'bass', 'drums'],
};

let customBase = null;
let manifestPromise = null;
const rawCache = new Map();
const decodedByContext = new WeakMap();
const statusState = { state: 'idle', loaded: new Set(), irReady: false, error: null };

export function resetSampleCache() {
  manifestPromise = null;
  rawCache.clear();
  statusState.state = 'idle';
  statusState.loaded = new Set();
  statusState.irReady = false;
  statusState.error = null;
}

export function setSampleBase(url) {
  customBase = url ? (url.endsWith('/') ? url : `${url}/`) : null;
  resetSampleCache();
}

export function sampleStatus() {
  return {
    state: statusState.state,
    loadedInstruments: [...statusState.loaded],
    irReady: statusState.irReady,
    error: statusState.error,
  };
}

function resolveBase() {
  if (customBase) return customBase;
  if (MODULE_BASE) return MODULE_BASE;
  if (typeof document !== 'undefined' && document.baseURI) {
    return new URL('samples/', document.baseURI).href;
  }
  return 'samples/';
}

function canFetch(url) {
  if (typeof fetch !== 'function') return false;
  if (!customBase && typeof location !== 'undefined' && location.protocol === 'file:') return false;
  if (typeof location !== 'undefined' && location.origin && location.origin !== 'null') {
    try {
      if (new URL(url, location.href).origin !== location.origin) return false;
    } catch {
      return false;
    }
  }
  return true;
}

export function resolveSampleInstrument(genre, timbre, kind, duration = 0.6) {
  if (kind === 'bass') return 'bass';
  if (kind === 'hum') return null;
  if (kind === 'kick' || kind === 'snare' || kind === 'hat' || kind === 'clap' || kind === 'shaker') return 'drums';
  const family = timbre?.family || '';
  const id = timbre?.id || '';
  if (genre === 'modernrock') {
    if (kind === 'chords' && duration < 0.75) return 'guitar';
    if (kind === 'chords') return family === 'pad' ? 'strings' : 'piano';
    return family === 'keys' ? 'piano' : family === 'pad' ? 'strings' : 'guitar';
  }
  if (family === 'pad' || /pad|wide|air|choir|cinematic/.test(id)) {
    if (genre === 'dawn' && kind === 'melody') return 'piano';
    return 'strings';
  }
  if (family === 'pluck' || /pluck|nylon|kalimba/.test(id)) return 'guitar';
  if (family === 'keys' || /keys|piano|felt|rhodes|ep|organ/.test(id)) return 'piano';
  if (family === 'lead') {
    if (genre === 'acoustic' || genre === 'bossa' || genre === 'reggaeton') return 'guitar';
    if (kind === 'chords' && (genre === 'cinematic' || genre === 'ambient' || genre === 'ballad')) return 'strings';
    return 'piano';
  }
  if (genre === 'acoustic' || genre === 'bossa' || genre === 'reggaeton') return 'guitar';
  if (genre === 'cinematic' || genre === 'ambient' || genre === 'ballad' || genre === 'dawn' || genre === 'nitelofi') {
    return kind === 'chords' ? 'strings' : 'piano';
  }
  return 'piano';
}

export function instrumentsForSong(song) {
  const genre = typeof song === 'string' ? song : (song?.settings?.genre || 'lofi');
  const timbre = typeof song === 'string' ? null : song?.timbre;
  const layers = typeof song === 'string' ? null : song?.settings?.instruments;
  const needed = new Set(GENRE_PACKS[genre] || ['piano', 'bass', 'drums']);
  for (const [kind, dur] of [['melody', 0.6], ['chords', 0.4], ['chords', 2.0]]) {
    const picked = resolveSampleInstrument(genre, timbre, kind, dur);
    if (picked) needed.add(picked);
  }
  if (layers) {
    if (layers.bass === false) needed.delete('bass');
    if (layers.drums === false) needed.delete('drums');
  }
  return [...needed];
}

export function pickSampleNote(notes, midi) {
  if (!Array.isArray(notes) || !notes.length) return null;
  let best = notes[0];
  let bestDist = Math.abs(midi - best.midi);
  for (let index = 1; index < notes.length; index++) {
    const candidate = notes[index];
    const dist = Math.abs(midi - candidate.midi);
    if (dist < bestDist || (dist === bestDist && candidate.midi < best.midi)) {
      best = candidate;
      bestDist = dist;
    }
  }
  const semitones = midi - best.midi;
  const rate = Math.max(0.25, Math.min(4, 2 ** (semitones / 12)));
  return { note: best, semitones, playbackRate: rate };
}

function fetchManifest() {
  if (manifestPromise) return manifestPromise;
  const url = new URL('manifest.json', resolveBase()).href;
  if (!canFetch(url)) return Promise.resolve(null);
  manifestPromise = fetch(url)
    .then(response => {
      if (!response.ok) throw new Error(`manifest ${response.status}`);
      return response.json();
    })
    .catch(error => {
      manifestPromise = null;
      statusState.error = error?.message || 'manifest failed';
      return null;
    });
  return manifestPromise;
}

function fetchBytes(relPath) {
  const url = new URL(relPath, resolveBase()).href;
  if (!canFetch(url)) return Promise.reject(new Error('blocked'));
  if (!rawCache.has(url)) {
    const pending = fetch(url)
      .then(response => {
        if (!response.ok) throw new Error(`sample ${response.status}`);
        return response.arrayBuffer();
      })
      .catch(error => {
        rawCache.delete(url);
        throw error;
      });
    rawCache.set(url, pending);
  }
  return rawCache.get(url);
}

function decodeAudio(context, arrayBuffer) {
  return new Promise((resolve, reject) => {
    try {
      const result = context.decodeAudioData(arrayBuffer.slice(0), resolve, reject);
      if (result && typeof result.then === 'function') result.then(resolve, reject);
    } catch (error) {
      reject(error);
    }
  });
}

function loadBuffer(context, relPath) {
  let ctxMap = decodedByContext.get(context);
  if (!ctxMap) {
    ctxMap = new Map();
    decodedByContext.set(context, ctxMap);
  }
  if (!ctxMap.has(relPath)) {
    const pending = fetchBytes(relPath)
      .then(bytes => decodeAudio(context, bytes))
      .catch(error => {
        ctxMap.delete(relPath);
        throw error;
      });
    ctxMap.set(relPath, pending);
  }
  return ctxMap.get(relPath);
}

async function loadInstrument(context, manifest, name) {
  const spec = manifest?.instruments?.[name];
  if (!spec) return null;
  if (Array.isArray(spec.notes)) {
    const notes = await Promise.all(spec.notes.map(async entry => ({
      midi: entry.midi,
      buffer: await loadBuffer(context, entry.file),
    })));
    statusState.loaded.add(name);
    return { kind: 'pitched', notes };
  }
  if (Array.isArray(spec.hits)) {
    const hits = {};
    await Promise.all(spec.hits.map(async entry => {
      hits[entry.id] = await loadBuffer(context, entry.file);
    }));
    statusState.loaded.add(name);
    return { kind: 'drums', hits };
  }
  return null;
}

export async function ensureSamples(context, song) {
  if (!context || typeof context.decodeAudioData !== 'function') {
    return { ready: false, instruments: {}, ir: null };
  }
  statusState.state = 'loading';
  const manifest = await fetchManifest();
  if (!manifest || !manifest.instruments) {
    statusState.state = 'fallback';
    return { ready: false, instruments: {}, ir: null };
  }
  const names = instrumentsForSong(song);
  const instruments = {};
  let ir = null;
  let failed = false;
  await Promise.all([
    ...names.map(async name => {
      try {
        const loaded = await loadInstrument(context, manifest, name);
        if (loaded) instruments[name] = loaded;
        else failed = true;
      } catch (error) {
        failed = true;
        statusState.error = error?.message || `failed ${name}`;
      }
    }),
    (async () => {
      if (!manifest.ir?.file) return;
      try {
        ir = await loadBuffer(context, manifest.ir.file);
        statusState.irReady = true;
      } catch (error) {
        statusState.error = error?.message || 'ir failed';
      }
    })(),
  ]);
  const ready = !failed && Object.keys(instruments).length > 0;
  statusState.state = ready ? 'ready' : 'fallback';
  return { ready, instruments, ir, manifest };
}
