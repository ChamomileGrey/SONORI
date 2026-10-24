import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { cleanName, migrateStorage, sortSketches, filterSketches, reorderIds, uniqueAppend, removeId, stepQueue, shuffleIds, nextRepeatMode } from '../dist/library.js';

const legacy = {
  settings: { title: '오후의 작은 쉼표', genre: 'lofi' },
  projects: [{ id: 'keep', settings: { genre: 'lofi' }, name: '남김', savedAt: '2026-10-01T00:00:00.000Z' }],
};
const migrated = migrateStorage(legacy, ['keep']);
assert.deepEqual(migrated.playlists, []);
assert.equal(migrated.repeat, 'off');
assert.equal(migrated.shuffle, false);
assert.equal(migrated.librarySort, 'recent');
assert.equal(migrated.queuePlaylistId, null);

const rich = migrateStorage({
  playlists: [
    { id: 'pl', name: '  밤 산책 \u0000', sketchIds: ['keep', 'missing', 'keep', 3], createdAt: '2026-10-02T00:00:00.000Z' },
    { id: 'pl', name: '중복' },
    { name: '아이디 없음' },
    { id: 'blank', name: '   ' },
    { id: 'ok', name: '아침', sketchIds: ['nope'] },
  ],
  player: { repeat: 'one', shuffle: true, queuePlaylistId: 'pl' },
  librarySort: 'tempo',
}, ['keep']);
assert.equal(rich.playlists.length, 2);
assert.equal(rich.playlists[0].name, '밤 산책');
assert.deepEqual(rich.playlists[0].sketchIds, ['keep']);
assert.deepEqual(rich.playlists[1].sketchIds, []);
assert.equal(rich.repeat, 'one');
assert.equal(rich.shuffle, true);
assert.equal(rich.librarySort, 'tempo');
assert.equal(rich.queuePlaylistId, 'pl');
assert.equal(migrateStorage({ player: { repeat: 'nope', queuePlaylistId: 'gone' }, librarySort: 'nope' }, []).queuePlaylistId, null);
assert.deepEqual(migrateStorage(null, []), { playlists: [], repeat: 'off', shuffle: false, librarySort: 'recent', queuePlaylistId: null });

const sketches = [
  { id: 'a', name: '가나다', savedAt: '2026-10-03T00:00:00.000Z', applied: { bpm: 120, genre: 'edm' } },
  { id: 'b', name: '나들이', savedAt: '2026-10-01T00:00:00.000Z', applied: { bpm: 72, genre: 'ballad' } },
  { id: 'c', name: '다정', savedAt: '2026-10-02T00:00:00.000Z', settings: { bpm: 96, genre: 'acoustic' } },
];
assert.deepEqual(sortSketches(sketches, 'recent').map(item => item.id), ['a', 'c', 'b']);
assert.deepEqual(sortSketches(sketches, 'oldest').map(item => item.id), ['b', 'c', 'a']);
assert.deepEqual(sortSketches(sketches, 'title').map(item => item.id), ['a', 'b', 'c']);
assert.deepEqual(sortSketches(sketches, 'tempo').map(item => item.id), ['b', 'c', 'a']);
assert.deepEqual(sortSketches(sketches, 'genre', item => ({ edm: 'EDM', ballad: '발라드', acoustic: '어쿠스틱' }[(item.applied || item.settings).genre])).map(item => item.id), ['b', 'c', 'a']);
assert.deepEqual(filterSketches(sketches, ' 발라드 ', item => item.name + ({ edm: 'EDM', ballad: '발라드', acoustic: '어쿠스틱' }[(item.applied || item.settings).genre])).map(item => item.id), ['b']);
assert.deepEqual(filterSketches(sketches, '', item => item.name).map(item => item.id), ['a', 'b', 'c']);

assert.deepEqual(reorderIds(['a', 'b', 'c'], 2, -1), ['a', 'c', 'b']);
assert.deepEqual(reorderIds(['a', 'b', 'c'], 0, -1), ['a', 'b', 'c']);
assert.deepEqual(uniqueAppend(['a'], 'b'), ['a', 'b']);
assert.deepEqual(uniqueAppend(['a'], 'a'), ['a']);
assert.equal(uniqueAppend(Array.from({ length: 30 }, (_, index) => `s${index}`), 'extra').length, 30);
assert.deepEqual(removeId(['a', 'b', 'a'], 'a'), ['b']);

assert.deepEqual(stepQueue(1, 3, 1, 'off'), { action: 'move', index: 2 });
assert.deepEqual(stepQueue(2, 3, 1, 'off'), { action: 'stop', index: 2 });
assert.deepEqual(stepQueue(2, 3, 1, 'all'), { action: 'move', index: 0 });
assert.deepEqual(stepQueue(0, 3, -1, 'all'), { action: 'move', index: 2 });
assert.deepEqual(stepQueue(0, 3, -1, 'off'), { action: 'stop', index: 0 });
assert.deepEqual(stepQueue(-1, 3, 1, 'off'), { action: 'move', index: 0 });
assert.equal(stepQueue(0, 0, 1, 'all').action, 'stop');
assert.equal(nextRepeatMode('off'), 'all');
assert.equal(nextRepeatMode('all'), 'one');
assert.equal(nextRepeatMode('one'), 'off');

const once = shuffleIds(['a', 'b', 'c', 'd', 'e'], 7);
assert.deepEqual(once, shuffleIds(['a', 'b', 'c', 'd', 'e'], 7));
assert.notDeepEqual(once, shuffleIds(['a', 'b', 'c', 'd', 'e'], 8));
assert.deepEqual([...once].sort(), ['a', 'b', 'c', 'd', 'e']);
assert.equal(cleanName('  \u0007안녕  ', 3), '안녕');

const app = await readFile(new URL('../dist/app.js', import.meta.url), 'utf8');
assert.match(app, /localStorage\.getItem/);
assert.match(app, /localStorage\.setItem/);
assert.match(app, /catch \{storageWorks=false/);
assert.match(app, /catch \(error\)/);
assert.match(app, /migrateStorage/);
assert.match(app, /repeatMode/);
assert.match(app, /shuffleOn/);
console.log('library-check: migration, order, search, queue, and storage guards passed');
