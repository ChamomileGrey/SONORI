import { compose } from '../dist/audio.js';

const genres = ['lofi', 'pop', 'edm', 'ambient', 'trap', 'house', 'ballad'];
const drums = ['kick', 'snare', 'hat'];
const rows = [];
for (const genre of genres) {
  const songs = [];
  for (let seed = 1; seed <= 20; seed++) songs.push(compose({ genre, mood: 'warm', key: 'C', bpm: 100, bars: 16, scale: 'major', seed }));
  const prog = new Set(songs.map(song => song.chords.map(chord => chord.name).join('-')));
  const open = new Set(songs.map(song => song.chords.slice(0, 4).map(chord => chord.name).join('-')));
  const struct = new Set(songs.map(song => song.structure.map(section => `${section.role}:${section.bars}`).join('|')));
  const roles = new Set(songs.flatMap(song => song.structure.map(section => section.role)));
  const groove = songs.map(song => [...new Set(song.events.filter(event => drums.includes(event.instrument) && event.time < song.beatSeconds * 4).map(event => `${event.instrument}@${Math.round(event.time / song.beatSeconds * 4) / 4}`))].sort().join('|'));
  const unique = new Set(groove);
  const counts = {};
  groove.forEach(key => { counts[key] = (counts[key] || 0) + 1; });
  const dup = 1 - unique.size / 20;
  const inst = new Set(songs.map(song => [...new Set(song.events.map(event => event.instrument))].sort().join(',')));
  const intervals = {};
  songs.forEach(song => {
    const melody = song.events.filter(event => event.instrument === 'melody').map(event => event.midi);
    for (let index = 1; index < melody.length; index++) {
      const distance = Math.min(Math.abs(melody[index] - melody[index - 1]), 8);
      intervals[distance] = (intervals[distance] || 0) + 1;
    }
  });
  intervals[8] = intervals[8] || 0;
  const total = Object.values(intervals).reduce((sum, value) => sum + value, 0);
  const intervalText = Object.entries(intervals).sort((a, b) => Number(a[0]) - Number(b[0])).map(([key, value]) => `${key}:${Math.round(value * 100 / total)}%`).join(' ');
  const timbres = new Set(songs.map(song => song.timbre?.id));
  rows.push(`${genre}: prog ${prog.size}/20, open4 ${open.size}, struct ${struct.size} roles[${[...roles]}], drumgroove ${unique.size} (dup ${Math.round(dup * 100)}%, max same ${Math.max(...Object.values(counts))}), instSets ${inst.size}, timbres ${timbres.size}, interval ${intervalText}`);
}
console.log(rows.join('\n'));
const short = compose({ genre: 'lofi', mood: 'warm', seed: 1, bars: 8, bpm: 72 });
const medium = compose({ genre: 'lofi', mood: 'warm', seed: 1, bars: 24, bpm: 100 });
const long = compose({ genre: 'lofi', mood: 'warm', seed: 1, bars: 32, bpm: 140 });
console.log('bars8', short.structure.map(section => section.role).join(','), '| bars24', medium.structure.map(section => section.role).join(','), '| bars32', long.structure.map(section => section.role).join(','));
