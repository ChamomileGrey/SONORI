/** Playlist and library helpers. Storage I/O stays in the app so failures can be caught there. */

const SORTS = ['recent', 'oldest', 'title', 'tempo', 'genre'];
const REPEATS = ['off', 'all', 'one'];

export function cleanName(value, max = 40) {
  const text = typeof value === 'string' ? value.replace(/[\u0000-\u001F\u007F]/g, '').trim() : '';
  return Array.from(text).slice(0, max).join('');
}

export function normalizePlaylists(list, validIds) {
  if (!Array.isArray(list)) return [];
  const seen = new Set();
  const allow = validIds ? new Set(validIds) : null;
  const playlists = [];
  for (const item of list) {
    if (!item || typeof item !== 'object' || typeof item.id !== 'string' || !item.id.trim() || seen.has(item.id)) continue;
    const name = cleanName(item.name, 40);
    if (!name) continue;
    seen.add(item.id);
    const sketchIds = [];
    const sketches = new Set();
    if (Array.isArray(item.sketchIds)) {
      for (const id of item.sketchIds) {
        if (typeof id !== 'string' || sketches.has(id)) continue;
        if (allow && !allow.has(id)) continue;
        sketches.add(id);
        sketchIds.push(id);
        if (sketchIds.length >= 30) break;
      }
    }
    playlists.push({
      id: item.id.slice(0, 80),
      name,
      createdAt: typeof item.createdAt === 'string' ? item.createdAt.slice(0, 40) : '',
      updatedAt: typeof item.updatedAt === 'string' ? item.updatedAt.slice(0, 40) : '',
      sketchIds,
    });
    if (playlists.length >= 20) break;
  }
  return playlists;
}

/** Read a v1 studio blob and any later playlist fields without dropping saved sketches. */
export function migrateStorage(stored, projectIds = []) {
  const source = stored && typeof stored === 'object' ? stored : {};
  const playlists = normalizePlaylists(source.playlists, projectIds);
  const player = source.player && typeof source.player === 'object' ? source.player : {};
  return {
    playlists,
    repeat: REPEATS.includes(player.repeat) ? player.repeat : 'off',
    shuffle: player.shuffle === true,
    librarySort: SORTS.includes(source.librarySort) ? source.librarySort : 'recent',
    queuePlaylistId: playlists.some(playlist => playlist.id === player.queuePlaylistId) ? player.queuePlaylistId : null,
  };
}

function savedTime(sketch) {
  const time = Date.parse(sketch?.savedAt || '');
  return Number.isNaN(time) ? 0 : time;
}

export function sortSketches(sketches, mode = 'recent', labelOf = () => '') {
  const list = [...sketches];
  if (mode === 'oldest') return list.sort((a, b) => savedTime(a) - savedTime(b) || String(a.id).localeCompare(String(b.id)));
  if (mode === 'title') return list.sort((a, b) => cleanName(a.name || a.title || '', 80).localeCompare(cleanName(b.name || b.title || '', 80), 'ko') || savedTime(b) - savedTime(a));
  if (mode === 'tempo') return list.sort((a, b) => (Number(a.applied?.bpm ?? a.settings?.bpm) || 0) - (Number(b.applied?.bpm ?? b.settings?.bpm) || 0) || savedTime(b) - savedTime(a));
  if (mode === 'genre') return list.sort((a, b) => String(labelOf(a)).localeCompare(String(labelOf(b)), 'ko') || savedTime(b) - savedTime(a));
  return list.sort((a, b) => savedTime(b) - savedTime(a) || String(a.id).localeCompare(String(b.id)));
}

export function filterSketches(sketches, query, describe = () => '') {
  const needle = cleanName(String(query || ''), 80).toLowerCase();
  if (!needle) return [...sketches];
  return sketches.filter(sketch => String(describe(sketch)).toLowerCase().includes(needle));
}

export function uniqueAppend(ids = [], id) {
  if (typeof id !== 'string' || !id || ids.includes(id) || ids.length >= 30) return [...ids];
  return [...ids, id];
}

export function removeId(ids = [], id) {
  return ids.filter(item => item !== id);
}

export function reorderIds(ids = [], index, delta) {
  const next = index + delta;
  if (index < 0 || index >= ids.length || next < 0 || next >= ids.length) return [...ids];
  const copy = [...ids];
  const [item] = copy.splice(index, 1);
  copy.splice(next, 0, item);
  return copy;
}

export function stepQueue(index, length, delta, repeat = 'off') {
  if (!length || !delta) return { action: 'stop', index: -1 };
  const next = index + delta;
  if (next >= 0 && next < length) return { action: 'move', index: next };
  if (repeat === 'all') return { action: 'move', index: ((next % length) + length) % length };
  return { action: 'stop', index };
}

export function shuffleIds(ids = [], seed = 1) {
  let state = (Number(seed) || 1) >>> 0;
  const random = () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 4294967296;
  };
  const copy = [...ids];
  for (let index = copy.length - 1; index > 0; index--) {
    const swap = Math.floor(random() * (index + 1));
    [copy[index], copy[swap]] = [copy[swap], copy[index]];
  }
  return copy;
}

export function nextRepeatMode(mode) {
  return mode === 'off' ? 'all' : mode === 'all' ? 'one' : 'off';
}
