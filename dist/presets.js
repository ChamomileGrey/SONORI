/** Original genre/mood presets. No samples, logos, or external audio. */

export const LAYER_HINTS = {
  lofi: { melody: 'Soft lead', chords: 'Warm keys', bass: 'Round bass', drums: 'Soft groove' },
  pop: { melody: 'Soft synth', chords: 'Bright keys', bass: 'Melodic bass', drums: 'Pop groove' },
  rnb: { melody: 'Smooth lead', chords: 'Soul keys', bass: 'Syncopated bass', drums: 'Laid-back kit' },
  ambient: { melody: 'Air lead', chords: 'Slow keys', bass: 'Soft foundation', drums: 'Minimal pulse' },
  ballad: { melody: 'Warm lead', chords: 'Long pads', bass: 'Slow bass', drums: 'Half-time' },
  edm: { melody: 'Supersaw lead', chords: 'Anthem triads', bass: 'Drop sub', drums: 'Build and drop' },
  acoustic: { melody: 'Pluck lead', chords: 'Strum keys', bass: 'Upright feel', drums: 'Brush kit' },
  cinematic: { melody: 'Wide lead', chords: 'Wide pads', bass: 'Low drone', drums: 'Sparse hits' },
  modernrock: { melody: 'Soft lead', chords: 'Piano · arp', bass: 'Warm bass', drums: 'Soft kit', hum: 'Oo · Ah' },
  dawn: { melody: 'Air lead', chords: 'Dawn piano', bass: 'Soft foundation', drums: 'Quiet pulse', hum: 'Oo · Ah' },
  nitelofi: { melody: 'Hushed lead', chords: 'Night keys', bass: 'Round bass', drums: 'Slow pocket', hum: 'Oo · Ah' },
  citypop: { melody: 'Keys lead', chords: 'Electric piano', bass: 'Octave bass', drums: 'Light swing kit' },
  trap: { melody: 'Sparse lead', chords: 'Dark stabs', bass: '808 bass', drums: 'Half-time hats' },
  house: { melody: 'Short motif', chords: 'Rhodes stabs', bass: 'Syncopated bass', drums: 'Offbeat hats' },
  bossa: { melody: 'Nylon lead', chords: 'Syncopated comps', bass: 'Bossa bass', drums: 'Soft rim pattern' },
  reggaeton: { melody: 'Hook lead', chords: 'Minor stabs', bass: 'Dembow bass', drums: 'Dembow kit' },
};

export const GENRE_PRESETS = [
  {
    id: 'lofi', label: 'Lo-fi', ko: '로파이', genre: 'lofi', mood: 'warm', bpm: 84, key: 'C', scale: 'major', scaleLabel: '메이저',
    drums: '스윙 킥과 부드러운 하이햇', voice: '둥근 벨 리드 · 따뜻한 일렉트릭 피아노', blurb: '느긋한 오후, 가까운 공간',
  },
  {
    id: 'pop', label: 'Pop', ko: '팝', genre: 'pop', mood: 'bright', bpm: 112, key: 'G', scale: 'major', scaleLabel: '메이저',
    drums: '고른 킥과 깔끔한 스네어', voice: '맑은 신스 리드 · 밝은 건반', blurb: '경쾌한 첫 후렴',
  },
  {
    id: 'rnb', label: 'R&B', ko: 'R&B', genre: 'rnb', mood: 'dreamy', bpm: 76, key: 'F', scale: 'major', scaleLabel: '메이저',
    drums: '뒤로 기대는 그루브', voice: '부드러운 리드 · 소울 건반', blurb: '늦은 밤의 부드러운 그루브',
  },
  {
    id: 'ambient', label: 'Ambient', ko: '앰비언트', genre: 'ambient', mood: 'dreamy', bpm: 72, key: 'C', scale: 'major', scaleLabel: '메이저',
    drums: '아주 성긴 펄스', voice: '공기감 있는 리드 · 느린 코드', blurb: '넓고 잔잔한 공간',
  },
  {
    id: 'ballad', label: 'Ballad', ko: '발라드', genre: 'ballad', mood: 'melancholy', bpm: 72, key: 'D', scale: 'dorian', scaleLabel: '도리안',
    drums: '하프타임 킥 · 여린 스네어', voice: '긴 패드 · 부드러운 리드', blurb: '천천히 말하는 마음',
  },
  {
    id: 'edm', label: 'EDM', ko: 'EDM', genre: 'edm', mood: 'bright', bpm: 128, key: 'A', scale: 'minor', scaleLabel: '마이너',
    drums: '빌드업 스네어 롤 · 드롭', voice: '슈퍼소 리드 · 서브 베이스', blurb: '128 BPM, 빌드와 드롭',
  },
  {
    id: 'acoustic', label: 'Acoustic', ko: '어쿠스틱', genre: 'acoustic', mood: 'warm', bpm: 96, key: 'G', scale: 'pentatonic', scaleLabel: '펜타토닉',
    drums: '브러시 킥과 성긴 햇', voice: '플럭 톤 · 기타 같은 코드', blurb: '가까이서 듣는 어쿠스틱',
  },
  {
    id: 'cinematic', label: 'Cinematic', ko: '시네마틱', genre: 'cinematic', mood: 'dreamy', bpm: 80, key: 'F', scale: 'minor', scaleLabel: '마이너',
    drums: '넓게 띄운 타격과 여백', voice: '와이드 패드 · 공기감 있는 리드', blurb: '장면이 열리는 넓은 공간',
  },
  {
    id: 'modernrock', label: 'Modern Rock', ko: '감성 모던 록', genre: 'modernrock', mood: 'melancholy', bpm: 78, key: 'A', scale: 'major', scaleLabel: '메이저', hum: true,
    drums: '여린 킥 · 부드러운 스네어', voice: '피아노 · 클린 기타 아르페지오 · 따뜻한 패드', blurb: '조용한 벌스에서 넓어지는 후렴',
  },
  {
    id: 'dawn', label: 'Dawn', ko: '새벽 감성', genre: 'dawn', mood: 'dreamy', bpm: 74, key: 'F', scale: 'minor', scaleLabel: '마이너', hum: true,
    drums: '아주 성긴 펄스', voice: '새벽 피아노 · 먼 패드', blurb: '해가 뜨기 전의 여백',
  },
  {
    id: 'nitelofi', label: 'Night', ko: '심야 로파이', genre: 'nitelofi', mood: 'melancholy', bpm: 80, key: 'D', scale: 'minor', scaleLabel: '마이너', hum: true,
    drums: '느린 스윙 킥과 여린 햇', voice: '낮은 건반 · 둥근 베이스', blurb: '잠들기 전 작은 방',
  },
  {
    id: 'citypop', label: 'City Pop', ko: '시티팝', genre: 'citypop', mood: 'warm', bpm: 104, key: 'F', scale: 'major', scaleLabel: '메이저',
    drums: '가벼운 스윙의 디스코 킥과 햇', voice: '일렉트릭 피아노 · 옥타브 베이스', blurb: '저녁 불빛의 드라이브',
  },
  {
    id: 'trap', label: 'Trap', ko: '트랩', genre: 'trap', mood: 'melancholy', bpm: 140, key: 'A', scale: 'minor', scaleLabel: '마이너',
    drums: '하프타임 808 · 하이햇 롤', voice: '서브 808 · 짧은 리드', blurb: '140 BPM의 느린 그루브',
  },
  {
    id: 'house', label: 'House', ko: '하우스', genre: 'house', mood: 'bright', bpm: 124, key: 'A', scale: 'dorian', scaleLabel: '도리안',
    drums: '포 온 더 플로어 · 오프비트 오픈햇 · 셔플 16분음', voice: '로즈 · 오르간 스탭 · 싱코페이션 베이스', blurb: '124 BPM의 따뜻한 하우스 루프',
  },
  {
    id: 'bossa', label: 'Bossa Nova', ko: '보사노바', genre: 'bossa', mood: 'warm', bpm: 130, key: 'C', scale: 'major', scaleLabel: '메이저',
    drums: '성긴 림 클릭과 싱코페이션', voice: '나일론풍 신스 · ii–V', blurb: '가벼운 130 전후의 보사',
  },
  {
    id: 'reggaeton', label: 'Reggaeton', ko: '레게톤', genre: 'reggaeton', mood: 'bright', bpm: 96, key: 'D', scale: 'minor', scaleLabel: '마이너',
    drums: '뎀보우 킥과 스네어', voice: '짧은 신스 베이스', blurb: '뎀보우 리듬의 훅',
  },
];

const FALLBACK = { ko: '스케치', scale: 'major', scaleLabel: '메이저', drums: '기본 그루브', voice: '신스 스케치' };

export function presetById(id) {
  return GENRE_PRESETS.find(preset => preset.id === id) || null;
}

/** One preset per sketch genre. Pop, R&B, and Ambient keep the ids saved projects already use. */
export function detailForGenre(genre) {
  return GENRE_PRESETS.find(preset => preset.genre === genre) || FALLBACK;
}

export function applyPresetToSettings(settings = {}, presetId) {
  const preset = presetById(presetId);
  if (!preset) return { ...settings };
  return {
    ...settings,
    genre: preset.genre,
    mood: preset.mood,
    bpm: preset.bpm,
    key: preset.key,
    scale: preset.scale,
    instruments: { melody: true, chords: true, bass: true, drums: true, hum: preset.hum === true },
  };
}
