import { compose, createPlayer, renderWav, createMidi } from './audio.js';
import { createBrief, formatBrief } from './brief.js';
import { LAYER_HINTS, applyPresetToSettings, detailForGenre, presetById } from './presets.js';
import { migrateStorage, sortSketches, filterSketches, reorderIds, uniqueAppend, removeId, stepQueue, shuffleIds, nextRepeatMode, cleanName, normalizePlaylists } from './library.js';

const $ = id => document.getElementById(id);
const STORAGE = 'sonori.studio.v1';
const GENRES = {lofi:'Lo-fi',pop:'Pop',rnb:'R&B',ambient:'Ambient',ballad:'Ballad',edm:'EDM',acoustic:'Acoustic',cinematic:'Cinematic',modernrock:'Modern Rock',dawn:'Dawn',nitelofi:'Night',citypop:'City Pop',trap:'Trap',house:'House',bossa:'Bossa Nova',reggaeton:'Reggaeton'};
const MOODS = {warm:'따뜻한',dreamy:'몽환적인',bright:'경쾌한',melancholy:'아련한'};
const SCALES = {major:'메이저',minor:'마이너',dorian:'도리안',pentatonic:'펜타토닉'};
const DEFAULTS = {title:'오후의 작은 쉼표',topic:'창가에 앉아 잠시 쉬어 가는 오후',genre:'lofi',mood:'warm',bpm:84,key:'C',scale:'major',bars:16,seed:20261017,vocal:'female',notes:'',instruments:{melody:true,chords:true,bass:true,drums:true,hum:false}};
const PRESETS = {
  warm:{...DEFAULTS},
  night:{...DEFAULTS,title:'잠들지 않은 도시',topic:'늦은 밤 도시를 걷다 떠오른 작은 그리움',genre:'rnb',mood:'dreamy',bpm:76,key:'F',scale:'major',seed:240921},
  day:{...DEFAULTS,title:'기분 좋은 첫걸음',topic:'새로운 하루를 시작하는 가벼운 용기',genre:'pop',mood:'bright',bpm:112,key:'G',scale:'major',seed:172832},
  rock:{...DEFAULTS,title:'창가의 노을',topic:'따뜻하고 아련한 저녁, 조용히 커지는 마음',genre:'modernrock',mood:'melancholy',bpm:78,key:'A',scale:'major',seed:781401,notes:'벌스는 여리게, 후렴에서 조금 더 넓게',instruments:{melody:true,chords:true,bass:true,drums:true,hum:true}},
};
const clone = value => JSON.parse(JSON.stringify(value));
const cleanString = (value, max) => typeof value === 'string' ? value.slice(0,max) : '';
const FEEL = {lofi:[76,98],pop:[96,126],rnb:[72,100],ambient:[72,92],ballad:[72,88],edm:[118,140],acoustic:[84,112],cinematic:[72,98],modernrock:[72,86],dawn:[72,84],nitelofi:[72,92],citypop:[96,116],trap:[132,140],house:[118,128],bossa:[116,136],reggaeton:[88,104]};
const KEYS = ['C','D','E','F','G','A'];
const CONTOUR_KO = {arch:'아치',rise:'상승',fall:'하강',wave:'물결',neighbor:'인접'};
const TEXTURE_KO = {pad:'지속음',stab:'스타브',arp:'분산',strum:'스트럼'};
function feelAnchorOf(value) {
  const anchor = value?.feelAnchor;
  if (!anchor || typeof anchor !== 'object') return null;
  const bpm = Math.round(Number(anchor.bpm));
  if (!Number.isFinite(bpm) || !KEYS.includes(anchor.key)) return null;
  return {bpm:Math.max(72,Math.min(140,bpm)),key:anchor.key};
}
function varyFeel(genre, seed, anchor) {
  const [lo, hi] = FEEL[genre] || [72, 140];
  const min = Math.max(72, lo);
  const max = Math.min(140, hi);
  const center = Math.max(min, Math.min(max, Math.round(Number(anchor?.bpm) || 84)));
  const bpm = Math.max(min, Math.min(max, center + ((seed % 11) - 5)));
  const index = Math.max(0, KEYS.indexOf(anchor?.key));
  const key = KEYS[(index + ((seed % 5) - 2) + KEYS.length) % KEYS.length];
  return {bpm, key};
}
function normalize(value = {}) {
  const valid = (obj, key, fallback) => Object.hasOwn(obj, key) ? key : fallback;
  return {title:cleanString(value.title,70),topic:cleanString(value.topic,600),notes:cleanString(value.notes,2000),genre:valid(GENRES,value.genre,'lofi'),mood:valid(MOODS,value.mood,'warm'),bpm:Math.max(72,Math.min(140,Math.round(Number(value.bpm)||84))),key:KEYS.includes(value.key)?value.key:'C',scale:valid(SCALES,value.scale,'major'),bars:[8,16,32].includes(Number(value.bars))?Number(value.bars):16,seed:(Number(value.seed)||20261017)>>>0,vocal:['female','male','duet','instrumental'].includes(value.vocal)?value.vocal:'female',instruments:{melody:value.instruments?.melody!==false,chords:value.instruments?.chords!==false,bass:value.instruments?.bass!==false,drums:value.instruments?.drums!==false,hum:value.instruments?.hum===true},feelAnchor:feelAnchorOf(value)};
}
let stored;
let storageWorks = true;
let storageNotified = false;
try {stored=JSON.parse(localStorage.getItem(STORAGE)||'null');} catch {storageWorks=false;stored=null;}
let projects = Array.isArray(stored?.projects) ? stored.projects.filter(p=>p&&typeof p.id==='string'&&p.settings).slice(0,30) : [];
let migrated = {playlists:[],repeat:'off',shuffle:false,librarySort:'recent',queuePlaylistId:null};
try {migrated=migrateStorage(stored,projects.map(project=>project.id));} catch {migrated={playlists:[],repeat:'off',shuffle:false,librarySort:'recent',queuePlaylistId:null};}
let playlists = migrated.playlists;
let repeatMode = migrated.repeat;
let shuffleOn = migrated.shuffle;
let librarySort = migrated.librarySort;
let activePlaylistId = migrated.queuePlaylistId;
let settings = normalize(stored?.settings || DEFAULTS);
let applied = normalize(stored?.applied || settings);
let customLyrics = typeof stored?.customLyrics==='string' ? stored.customLyrics.slice(0,16000) : null;
let example = stored ? Boolean(stored.example) : true;
let take = Math.max(1,Math.min(999,Number(stored?.take)||1));
let song, brief, progress = 0, toastTimer, persistTimer;
let currentProjectId = null;
let playContext = 'studio';
let libraryQuery = '';
let shuffleSeed = 1;
let shuffleOrder = [];
let seeking = false;
let seekWasPlaying = false;
const player = createPlayer();
const dialog = $('appDialog');
const playIcon='<svg viewBox="0 0 24 24"><path d="m9 5 11 7-11 7z"/></svg>';
const pauseIcon='<svg viewBox="0 0 24 24"><path d="M7 5h4v14H7zm6 0h4v14h-4z"/></svg>';
function toast(message) {$('toast').textContent=message;$('toast').classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('toast').classList.remove('show'),3600);}
function storageFailureMessage(error) {
  const quota = error?.name === 'QuotaExceededError' || error?.code === 22;
  return quota
    ? '저장 공간이 가득 찼어요. 오래된 스케치를 지우거나 내보내기에서 프로젝트 JSON으로 보관해 주세요.'
    : '개인정보 보호 모드이거나 이 브라우저가 저장을 막았어요. 내보내기 → 프로젝트 JSON으로 작업을 보관해 주세요.';
}
function reportAppError() {
  const node = $('appError');
  if (!node || !node.hidden) return;
  node.hidden = false;
}
function scrollToElement(node) {
  if (!node) return;
  const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  node.scrollIntoView({behavior: reduce ? 'auto' : 'smooth', block: 'start'});
}
function persist() {
  clearTimeout(persistTimer);
  playlists=normalizePlaylists(playlists,projects.map(project=>project.id));
  if(activePlaylistId&&!playlists.some(playlist=>playlist.id===activePlaylistId)) activePlaylistId=null;
  try {localStorage.setItem(STORAGE,JSON.stringify({settings,applied,customLyrics,example,take,projects,playlists,librarySort,player:{repeat:repeatMode,shuffle:shuffleOn,queuePlaylistId:activePlaylistId}}));storageWorks=true;} catch (error) {storageWorks=false;const message=storageFailureMessage(error);if($('storageWarning')) $('storageWarning').textContent=message;if(!storageNotified){storageNotified=true;toast(message);}}
  $('saveStatus').textContent=storageWorks?'이 브라우저에 자동 저장':'저장 불가 · JSON으로 보관해 주세요';
  $('storageWarning').hidden=storageWorks;
  $('projectCount').textContent=String(projects.length);
}
function scheduleSave() {clearTimeout(persistTimer);persistTimer=setTimeout(persist,300);}
function formatTime(seconds) {const s=Math.max(0,Math.floor(Number(seconds)||0));return `${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`;}
function updatePending() {$('pendingBadge').hidden=JSON.stringify(settings)===JSON.stringify(applied);}
function updatePresetHint() {
  const detail=detailForGenre(settings.genre);
  const mood=MOODS[settings.mood]||'';
  $('presetHint').textContent=`${detail.ko} · ${mood} · ${settings.key} ${SCALES[settings.scale]||'메이저'} · ${settings.bpm} BPM · ${detail.drums} · ${detail.voice}`;
}
function fillForm() {
  for(const id of ['title','topic','bpm','key','bars','vocal','notes']) $(id).value=settings[id];
  $('bpmOutput').innerHTML=`${settings.bpm} <span>BPM</span>`;
  document.querySelectorAll('[data-mood]').forEach(button=>{const selected=button.dataset.mood===settings.mood;button.classList.toggle('selected',selected);button.setAttribute('aria-pressed',String(selected));});
  document.querySelectorAll('[data-genre-preset]').forEach(button=>{const preset=presetById(button.dataset.genrePreset);const selected=preset?.genre===settings.genre;button.classList.toggle('selected',selected);button.setAttribute('aria-pressed',String(selected));});
  updatePresetHint();
  updatePending();
}
function queueIds() {
  if(activePlaylistId){const playlist=playlists.find(item=>item.id===activePlaylistId);return playlist?playlist.sketchIds.filter(id=>projects.some(project=>project.id===id)):[];}
  return sortSketches(projects,librarySort,sketchGenreLabel).map(project=>project.id);
}
function playbackOrder() {
  const ids=queueIds();
  if(!shuffleOn) return ids;
  const same=shuffleOrder.length===ids.length&&ids.every(id=>shuffleOrder.includes(id));
  if(!same){
    shuffleOrder=shuffleIds(ids,(shuffleSeed||1)>>>0);
    if(currentProjectId&&shuffleOrder.includes(currentProjectId)) shuffleOrder=[currentProjectId,...shuffleOrder.filter(id=>id!==currentProjectId)];
  }
  return shuffleOrder;
}
function updatePlayerMeta() {
  const title=brief?.title||settings.title||'SONORI';
  $('playerTitleBtn').textContent=title;
  $('playerTitleBtn').title=title;
  const playlist=playlists.find(item=>item.id===activePlaylistId);
  $('playerContext').textContent=playlist?playlist.name:'전체 스케치';
}
function updateTransportState() {
  const ids=queueIds();
  $('prevBtn').disabled=ids.length===0;
  $('nextBtn').disabled=ids.length===0;
  $('shuffleBtn').setAttribute('aria-pressed',String(shuffleOn));
  $('shuffleBtn').classList.toggle('is-on',shuffleOn);
  $('shuffleBtn').setAttribute('aria-label',shuffleOn?'셔플 켜짐. 누르면 끄기':'셔플 꺼짐. 누르면 켜기');
  $('repeatBtn').setAttribute('aria-pressed',String(repeatMode!=='off'));
  $('repeatBtn').dataset.mode=repeatMode;
  $('repeatBtn').classList.toggle('is-on',repeatMode!=='off');
  $('repeatLabel').textContent={off:'끔',all:'전체',one:'한 곡'}[repeatMode];
  $('repeatBtn').setAttribute('aria-label',{off:'반복 끄기. 누르면 전체 반복',all:'전체 반복. 누르면 한 곡 반복',one:'한 곡 반복. 누르면 반복 끄기'}[repeatMode]);
  updatePlayerMeta();
}
function updatePlayUI() {
  const playing=player.getState().status==='playing';
  $('playBtn').innerHTML=playing?pauseIcon:playIcon;
  $('barPlayBtn').innerHTML=playing?pauseIcon:playIcon;
  $('playBtn').setAttribute('aria-label',playing?'데모 일시정지':'데모 재생');
  $('barPlayBtn').setAttribute('aria-label',playing?'일시정지':'재생');
  $('waveform').classList.toggle('playing',playing);
  updateTransportState();
}
function setProgress(value) {
  const duration=song?.duration||0;
  progress=Math.max(0,Math.min(1,value));
  const label=formatTime(duration*progress);
  $('currentTime').textContent=label;
  $('barTime').textContent=label;
  $('barDuration').textContent=formatTime(duration);
  if(!seeking) $('seekBar').value=String(Math.round(progress*1000));
  $('seekBar').setAttribute('aria-valuetext',label);
  $('progressLine').style.width=`${progress*100}%`;
  [...$('waveform').children].forEach((bar,index)=>bar.classList.toggle('played',index/72<progress));
  [...$('barTrack').children].forEach((bar,index)=>bar.classList.toggle('active',index/applied.bars<progress));
}
function renderSong() {
  song=compose(applied);
  brief=createBrief(applied);
  $('songTitle').textContent=brief.title;
  $('exampleBadge').hidden=!example;
  $('songTags').replaceChildren(...[GENRES[applied.genre],MOODS[applied.mood],`${applied.key} ${SCALES[applied.scale]||'메이저'}`,`${applied.bars}마디`].map(text=>{const span=document.createElement('span');span.textContent=text;return span;}));
  $('variationLabel').textContent=`TAKE ${String(take).padStart(2,'0')}`;
  $('tempoDisplay').textContent=`${song.bpm} BPM`;
  $('totalTime').textContent=formatTime(song.duration);
  const contour = CONTOUR_KO[song.variation?.contour] || '모티프';
  const texture = TEXTURE_KO[song.variation?.texture] || '코드';
  const humText = applied.instruments.hum ? '가사 없는 허밍' : '보컬 미포함';
  $('stageKind').textContent = applied.instruments.hum ? 'WORDLESS HUM' : 'INSTRUMENTAL DEMO';
  $('soundDescription').textContent=`${MOODS[applied.mood]} ${GENRES[applied.genre]} · ${applied.key} ${SCALES[applied.scale]||'메이저'} · ${applied.bars}마디 · ${contour} 멜로디 · ${texture} · 스윙 ${Math.round((song.swing||0)*100)} · ${humText}`;
  const wave=Array.from({length:72},(_,i)=>{
    const bar=document.createElement('i');bar.className='wave-bar';
    const notes=song.events.filter(e=>e.time>=i/72*song.duration&&e.time<(i+1)/72*song.duration);
    const strength=notes.reduce((sum,n)=>sum+n.velocity,0);
    const shape=(.55+.45*Math.sin(i*.43+applied.seed%12))*(1-Math.abs(i-35.5)/100);
    bar.style.height=`${song.events.length?Math.min(83,12+strength*6+shape*34):3}px`;bar.style.setProperty('--delay',`${-i*.08}s`);return bar;
  });
  $('waveform').replaceChildren(...wave);
  $('barTrack').replaceChildren(...Array.from({length:applied.bars},()=>document.createElement('i')));
  const structure = song.structure?.length ? song.structure : brief.structure;
  if (song.structure?.length) {
    const line = song.structure.map(section => `${section.name} ${section.bars} bars`).join(' → ');
    brief = {...brief, structure: song.structure, prompt: brief.prompt.replace(/Suggested sketch structure:.*?\./, `Suggested sketch structure: ${line}.`)};
  }
  $('structure').replaceChildren(...structure.map(part=>{const div=document.createElement('div');div.className='structure-part';div.style.flex=part.bars;div.title=part.description;const b=document.createElement('b');b.textContent=part.name;const span=document.createElement('span');span.textContent=`${part.bars} bars`;div.append(b,span);return div;}));
  $('structureMeta').textContent=`${applied.bars} BARS · 이 데모의 구성`;
  const phrases = [];
  for (const group of song.phraseChords?.length ? song.phraseChords : [song.chordNames]) {
    if (!phrases.length || phrases.at(-1).join('-') !== group.join('-')) phrases.push(group);
  }
  $('chords').replaceChildren(...phrases.flatMap((group, index) => {
    const items = group.map(name => {const span=document.createElement('span');span.textContent=name;return span;});
    if (index) {const mark=document.createElement('span');mark.className='chord-break';mark.textContent='·';items.unshift(mark);}
    return items;
  }));
  const hints=LAYER_HINTS[applied.genre]||LAYER_HINTS.lofi;
  document.querySelectorAll('[data-layer]').forEach(button=>{const enabled=applied.instruments[button.dataset.layer];button.classList.toggle('enabled',enabled);button.setAttribute('aria-pressed',String(enabled));const small=button.querySelector('small');if(small&&hints[button.dataset.layer]) small.textContent=hints[button.dataset.layer];});
  $('lyrics').value=customLyrics??brief.lyrics;
  $('promptText').textContent=brief.prompt;
  $('briefSummary').textContent=brief.summary;
  setProgress(0);updatePlayUI();updatePending();
}
function playbackHandlers() {return {onProgress:setProgress,onEnded:()=>{handleEnded();}};}
function generate({newSeed=false,message='새로운 데모를 만들었어요. 재생해서 들어보세요.'}={}) {
  player.stop();
  if(newSeed) {
    settings.seed=(settings.seed+7919)>>>0;
    if(!settings.feelAnchor) settings.feelAnchor={bpm:settings.bpm,key:settings.key};
    const feel=varyFeel(settings.genre,settings.seed,settings.feelAnchor);
    settings.bpm=feel.bpm;
    settings.key=feel.key;
    take++;
    fillForm();
  } else {settings.feelAnchor={bpm:settings.bpm,key:settings.key};take=1;}
  applied=clone(settings);example=false;playContext='studio';renderSong();persist();toast(message);
}
async function play() {
  // play() is started from a click or key so iOS Safari can resume the audio context.
  if(!song.events.length) {toast('듣고 싶은 사운드 레이어를 하나 이상 켜 주세요.');return;}
  try {
    if(player.getState().status==='playing') player.pause();
    else await player.play(song,playbackHandlers());
    updatePlayUI();
  } catch(error) {toast(error?.message||'이 브라우저에서 오디오를 시작하지 못했어요. 최신 Chrome 또는 Safari에서 다시 열어 주세요.');updatePlayUI();}
}
async function replayCurrent() {
  player.stop();
  setProgress(0);
  try {await player.play(song,playbackHandlers());}
  catch(error) {toast(error?.message||'다시 재생하지 못했어요. 재생 버튼을 눌러 주세요.');}
  updatePlayUI();
}
async function goQueue(delta,{quietEnd=false}={}) {
  const ids=playbackOrder();
  if(!ids.length){
    if(!quietEnd) toast('저장된 스케치가 없어요. 프로젝트를 저장하면 이전·다음으로 오갈 수 있어요.');
    else {setProgress(1);updatePlayUI();}
    return false;
  }
  let index=ids.indexOf(currentProjectId);
  if(index<0) index=delta>0?-1:ids.length;
  const result=stepQueue(index,ids.length,delta,repeatMode);
  if(result.action!=='move'){
    if(!quietEnd) toast(delta>0?'재생목록의 마지막이에요.':'재생목록의 처음이에요.');
    else {setProgress(1);updatePlayUI();}
    return false;
  }
  const project=projects.find(item=>item.id===ids[result.index]);
  if(!project) return false;
  playContext='queue';
  loadData(project,{projectId:project.id});
  try {
    await player.play(song,playbackHandlers());
    updatePlayUI();
    if(document.body.classList.contains('view-library')) renderLibrary();
    return true;
  } catch(error) {
    toast(error?.message||'다음 스케치를 재생하지 못했어요. 재생 버튼을 다시 눌러 주세요.');
    updatePlayUI();
    return false;
  }
}
function handleEnded() {
  if(repeatMode==='one'||(playContext==='studio'&&repeatMode==='all')) {replayCurrent();return;}
  if(playContext==='queue') {goQueue(1,{quietEnd:true});return;}
  setProgress(1);updatePlayUI();
}
async function previousTrack() {
  const state=player.getState();
  if(state.position>3){
    const resume=state.status==='playing';
    player.stop();
    setProgress(0);
    if(resume) {try{await player.play(song,playbackHandlers());}catch(error){toast(error?.message||'처음부터 재생하지 못했어요.');}}
    updatePlayUI();
    return;
  }
  await goQueue(-1);
}
async function commitSeek() {
  if(!song) {seeking=false;return;}
  const ratio=Number($('seekBar').value)/1000;
  const resume=seekWasPlaying||player.getState().status==='playing';
  const restart=player.seek(ratio);
  seeking=false;
  if(resume||restart){
    try {await player.play(song,playbackHandlers());}
    catch(error) {toast(error?.message||'재생 위치를 옮기지 못했어요. 재생 버튼을 다시 눌러 주세요.');}
  } else setProgress(ratio);
  updatePlayUI();
}
function currentBrief() {return {...brief,lyrics:customLyrics??brief.lyrics};}
function openDialog(title,content) {
  $('dialogTitle').textContent=title;$('dialogContent').replaceChildren();
  if(typeof content==='string') $('dialogContent').innerHTML=content; else $('dialogContent').append(content);
  if(!dialog.open) dialog.showModal();
}
function closeDialog() {dialog.close();}
function nameDialog(title,initial,onSave) {
  const wrap=document.createElement('div');
  const note=document.createElement('p');note.className='dialog-description';note.textContent='플레이리스트 이름을 40자 안으로 적어 주세요.';
  const input=document.createElement('input');input.maxLength=40;input.value=initial||'';input.setAttribute('aria-label','플레이리스트 이름');
  const actions=document.createElement('div');actions.className='dialog-actions';
  const save=document.createElement('button');save.type='button';save.className='button primary';save.textContent='저장';
  const commit=()=>{const name=cleanName(input.value,40);if(!name){toast('이름을 입력해 주세요.');input.focus();return;}onSave(name);closeDialog();};
  save.onclick=commit;
  input.addEventListener('keydown',event=>{if(event.key==='Enter'){event.preventDefault();commit();}});
  actions.append(save);wrap.append(note,input,actions);openDialog(title,wrap);input.focus();input.select();
}
async function copy(text,label='내용') {
  try {await navigator.clipboard.writeText(text);toast(`${label}을 복사했어요.`);} catch {
    const field=document.createElement('textarea');field.value=text;field.className='dialog-textarea';field.readOnly=true;
    const container=document.createElement('div');const note=document.createElement('p');note.className='dialog-description';note.textContent='아래 내용을 선택해서 복사해 주세요. 브라우저가 자동 복사를 지원하지 않습니다.';container.append(note,field);openDialog('텍스트 복사',container);field.focus();field.select();
  }
}
function discussion() {
  const upcoming=createBrief(settings);
  openDialog('함께, 곡의 방향 정하기','<p class="dialog-description">아래 내용을 복사해 ChatGPT 등 AI 대화창에 붙여 넣어 상의해 보세요. 취향을 더 구체화하고 가사·구성을 함께 다듬는 데 도움이 됩니다. 합의한 내용은 왼쪽 설정과 가사 노트에 넣으면 됩니다.</p><label class="sr-only" for="discussionText">상의할 내용</label><textarea id="discussionText" class="dialog-textarea" readonly></textarea><div class="dialog-actions"><button class="button primary" id="copyDiscussion">대화에 가져갈 내용 복사 ↗</button></div>');
  $('discussionText').value=upcoming.discussion;
  $('copyDiscussion').onclick=()=>copy($('discussionText').value,'상의할 내용');
}
function download(blob,filename) {
  const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=filename;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);
}
function filename(ext) {return `${(brief.title||'sonori').replace(/[<>:"/\\|?*\u0000-\u001f]/g,'_').slice(0,65)}.${ext}`;}
function projectData() {return {format:'sonori-project',version:1,settings:clone(settings),applied:clone(applied),customLyrics,take};}
function exportDialog() {
  openDialog('이 곡, 다음 작업으로 가져가기','<p class="dialog-description">현재 들리는 데모와 적용된 설정을 내보냅니다. JSON에는 아직 적용하지 않은 설정도 함께 보관됩니다.</p><div class="download-grid"><button class="download-option" id="downloadWav"><b>WAV <span>↘</span></b><small>연주 데모 음원<br>44.1 kHz · Stereo</small></button><button class="download-option" id="downloadMidi"><b>MIDI <span>↘</span></b><small>멜로디·코드·베이스·드럼·허밍<br>DAW에서 계속 편집</small></button><button class="download-option" id="downloadBrief"><b>제작안 TXT <span>↘</span></b><small>가사·스타일 프롬프트<br>곡 구성과 상의할 내용</small></button><button class="download-option" id="downloadJson"><b>프로젝트 JSON <span>↘</span></b><small>현재 설정과 편집한 가사<br>다른 브라우저에서 불러오기</small></button></div><p class="dialog-description" style="margin:18px 0 0">WAV는 기기에 따라 생성에 잠시 시간이 걸릴 수 있어요. MIDI의 악기 음색은 사용하는 음악 프로그램에 따라 달라집니다.</p>');
  $('downloadWav').onclick=async()=>{
    const button=$('downloadWav');button.disabled=true;button.querySelector('b').textContent='음원 만드는 중…';
    const exportSong=song;const name=filename('wav');
    try {const blob=await renderWav(exportSong);download(blob,name);toast('WAV 음원을 저장했어요.');} catch(error) {toast(error?.message||'WAV 생성에 실패했어요. MIDI로 저장하거나 최신 브라우저에서 다시 시도해 주세요.');} finally {button.disabled=false;button.querySelector('b').textContent='WAV ↘';}
  };
  $('downloadMidi').onclick=()=>{try{download(createMidi(song),filename('mid'));toast('MIDI 파일을 저장했어요.');}catch{toast('MIDI 저장에 실패했어요. 다시 시도해 주세요.');}};
  $('downloadBrief').onclick=()=>{download(new Blob([formatBrief(applied,currentBrief())],{type:'text/plain;charset=utf-8'}),filename('txt'));toast('제작안을 저장했어요.');};
  $('downloadJson').onclick=()=>{download(new Blob([JSON.stringify(projectData(),null,2)],{type:'application/json'}),filename('json'));toast('프로젝트를 JSON으로 저장했어요.');};
}
function saveProject() {
  if(projects.length>=30){toast('최대 30개까지 보관할 수 있어요. 라이브러리에서 이전 버전을 정리해 주세요.');return;}
  const data=projectData();
  const id=globalThis.crypto?.randomUUID?.()||`${Date.now()}-${Math.random()}`;
  projects.unshift({...data,id,savedAt:new Date().toISOString(),name:brief.title});
  currentProjectId=id;
  shuffleOrder=[];
  persist();
  if(document.body.classList.contains('view-library')) renderLibrary();
  toast(storageWorks?'현재 버전을 라이브러리에 저장했어요.':'브라우저 저장이 막혀 있어요. 내보내기에서 JSON으로 보관해 주세요.');
}
function loadData(data,options={}) {
  player.stop();settings=normalize(data.settings);applied=normalize(data.applied||data.settings);customLyrics=typeof data.customLyrics==='string'?data.customLyrics.slice(0,16000):null;take=Math.max(1,Math.min(999,Number(data.take)||1));example=false;
  if('projectId' in options) currentProjectId=options.projectId;
  fillForm();renderSong();persist();
}
function sketchGenreLabel(project) {return detailForGenre(project?.applied?.genre||project?.settings?.genre).ko||'';}
function describeSketch(project) {
  const source=project.applied||project.settings||{};
  const detail=detailForGenre(source.genre);
  return [project.name,GENRES[source.genre],detail.ko,source.key,source.bpm,MOODS[source.mood],SCALES[source.scale],detail.voice].filter(Boolean).join(' ');
}
function showView(view,{focusSearch=false}={}) {
  const library=view==='library';
  document.body.classList.toggle('view-library',library);
  $('studioNav').classList.toggle('nav-active',!library);
  $('libraryBtn').classList.toggle('nav-active',library);
  $('studioNav').setAttribute('aria-current',library?'false':'page');
  $('libraryBtn').setAttribute('aria-current',library?'page':'false');
  if(library){renderLibrary();if(focusSearch) $('librarySearch').focus();}
}
function createPlaylist(name,sketchId=null) {
  if(playlists.length>=20){toast('플레이리스트는 20개까지 만들 수 있어요.');return null;}
  const playlist={id:globalThis.crypto?.randomUUID?.()||`${Date.now()}-${Math.random().toString(16).slice(2)}`,name,createdAt:new Date().toISOString(),updatedAt:new Date().toISOString(),sketchIds:sketchId?[sketchId]:[]};
  playlists=[...playlists,playlist];
  activePlaylistId=playlist.id;
  shuffleOrder=[];
  persist();updatePlayerMeta();updateTransportState();renderLibrary();
  return playlist;
}
function addSketchTo(playlistId,sketchId) {
  const playlist=playlists.find(item=>item.id===playlistId);
  if(!playlist) return;
  if(playlist.sketchIds.includes(sketchId)){toast('이미 담긴 스케치예요.');return;}
  if(playlist.sketchIds.length>=30){toast('한 플레이리스트에는 30곡까지 담을 수 있어요.');return;}
  playlist.sketchIds=uniqueAppend(playlist.sketchIds,sketchId);
  playlist.updatedAt=new Date().toISOString();
  shuffleOrder=[];
  persist();renderLibrary();updateTransportState();
  toast(`“${playlist.name}”에 담았어요.`);
}
function removeSketchFrom(playlistId,sketchId) {
  const playlist=playlists.find(item=>item.id===playlistId);
  if(!playlist) return;
  if(!confirm(`“${playlist.name}”에서 이 스케치를 뺄까요? 라이브러리의 원본은 남아요.`)) return;
  playlist.sketchIds=removeId(playlist.sketchIds,sketchId);
  playlist.updatedAt=new Date().toISOString();
  shuffleOrder=[];
  persist();renderLibrary();updateTransportState();
  toast(`“${playlist.name}”에서 뺐어요.`);
}
function openAddDialog(project) {
  const wrap=document.createElement('div');
  const note=document.createElement('p');note.className='dialog-description';note.textContent=playlists.length?'담을 플레이리스트를 고르세요. 이미 담긴 목록을 누르면 빼집니다.':'아직 플레이리스트가 없어요. 새로 만들어 이 스케치를 담을 수 있어요.';
  wrap.append(note);
  const list=document.createElement('div');list.className='playlist-dialog-list';
  playlists.forEach(playlist=>{
    const included=playlist.sketchIds.includes(project.id);
    const button=document.createElement('button');button.type='button';button.className='download-option';
    const title=document.createElement('b');title.textContent=playlist.name;
    const meta=document.createElement('small');meta.textContent=included?`이미 담김 · ${playlist.sketchIds.length}곡`:`${playlist.sketchIds.length}곡 · 눌러서 담기`;
    button.append(title,meta);
    button.onclick=()=>{if(included) removeSketchFrom(playlist.id,project.id); else addSketchTo(playlist.id,project.id); closeDialog();};
    list.append(button);
  });
  wrap.append(list);
  const actions=document.createElement('div');actions.className='dialog-actions';
  const create=document.createElement('button');create.type='button';create.className='button primary';create.textContent='새 플레이리스트에 담기';
  create.onclick=()=>nameDialog('새 플레이리스트','',name=>{if(createPlaylist(name,project.id)) toast(`“${name}”에 담았어요.`);});
  actions.append(create);wrap.append(actions);openDialog('플레이리스트에 담기',wrap);
}
function actionButton(label,onClick,aria,disabled=false,focusKey='') {
  const button=document.createElement('button');button.type='button';button.textContent=label;button.onclick=onClick;
  if(aria) button.setAttribute('aria-label',aria);
  if(focusKey) button.dataset.focus=focusKey;
  button.disabled=disabled;
  return button;
}
function renderLibrary({focusKey=''}={}) {
  const viewing=playlists.find(playlist=>playlist.id===activePlaylistId)||null;
  $('playlistAll').classList.toggle('selected',!viewing);
  $('playlistAll').setAttribute('aria-pressed',String(!viewing));
  $('playlistList').replaceChildren(...playlists.map(playlist=>{
    const button=document.createElement('button');button.type='button';button.className='playlist-chip';
    button.setAttribute('aria-pressed',String(playlist.id===activePlaylistId));
    if(playlist.id===activePlaylistId) button.classList.add('selected');
    const name=document.createElement('span');name.textContent=playlist.name;
    const count=document.createElement('small');count.textContent=String(playlist.sketchIds.length);
    button.append(name,count);
    button.onclick=()=>{activePlaylistId=playlist.id;shuffleOrder=[];persist();updateTransportState();renderLibrary();};
    return button;
  }));
  $('playlistTitle').textContent=viewing?viewing.name:'전체 스케치';
  $('renamePlaylistBtn').hidden=!viewing;
  $('deletePlaylistBtn').hidden=!viewing;
  $('playlistOrderNote').hidden=!viewing;
  $('librarySort').disabled=Boolean(viewing);
  $('librarySort').title=viewing?'플레이리스트는 담은 순서로 보여 줘요.':'정렬';
  if(!viewing&&$('librarySort').value!==librarySort) $('librarySort').value=librarySort;
  const sorted=sortSketches(projects,librarySort,sketchGenreLabel);
  const ordered=viewing?viewing.sketchIds.map(id=>projects.find(project=>project.id===id)).filter(Boolean):sorted;
  const visible=filterSketches(ordered,libraryQuery,describeSketch);
  const searching=cleanName(libraryQuery,80).length>0;
  $('playlistCount').textContent=searching?`${visible.length}곡 표시 · 전체 ${ordered.length}곡`:`${ordered.length}곡`;
  $('libraryStatus').textContent=viewing?`${viewing.name}, ${visible.length}곡`:`전체 스케치, ${visible.length}곡`;
  const grid=$('sketchGrid');
  grid.replaceChildren();
  if(!visible.length){
    const empty=document.createElement('p');empty.className='empty-projects';
    empty.textContent=!projects.length?'아직 저장한 스케치가 없어요. 마음에 드는 데모를 첫 버전으로 남겨 보세요.':viewing&&!viewing.sketchIds.length?'이 플레이리스트가 비어 있어요. 스케치의 담기로 추가해 보세요.':'검색과 맞는 스케치가 없어요.';
    grid.append(empty);
  }
  visible.forEach(project=>{
    const source=project.applied||project.settings||{};
    const title=cleanString(project.name,80)||'이름 없는 스케치';
    const date=new Date(project.savedAt);
    const when=Number.isNaN(date.valueOf())?'':date.toLocaleString('ko-KR',{month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'});
    const card=document.createElement('article');card.className='sketch-card';card.setAttribute('role','listitem');
    if(project.id===currentProjectId){card.classList.add('is-current');card.setAttribute('aria-current','true');}
    const top=document.createElement('div');top.className='sketch-top';
    const playCard=document.createElement('button');playCard.type='button';playCard.className='sketch-play';playCard.innerHTML=playIcon;playCard.setAttribute('aria-label',`${title} 재생`);
    playCard.onclick=()=>playProject(project);
    const meta=document.createElement('div');
    const heading=document.createElement('h3');heading.textContent=title;
    const line=document.createElement('p');line.textContent=[when,`${source.bpm||84} BPM`,source.key||'C',GENRES[source.genre]||'Lo-fi'].filter(Boolean).join(' · ');
    meta.append(heading,line);top.append(playCard,meta);
    const actions=document.createElement('div');actions.className='sketch-actions';
    actions.append(actionButton('열기',()=>openProject(project),`${title} 작업실에서 열기`));
    actions.append(actionButton('담기',()=>openAddDialog(project),`${title} 플레이리스트에 담기`));
    if(viewing&&!searching){
      const index=viewing.sketchIds.indexOf(project.id);
      actions.append(actionButton('위로',()=>moveSketch(index,-1),`${title} 위로`,index<=0,`up:${project.id}`));
      actions.append(actionButton('아래로',()=>moveSketch(index,1),`${title} 아래로`,index<0||index>=viewing.sketchIds.length-1,`down:${project.id}`));
      actions.append(actionButton('빼기',()=>removeSketchFrom(viewing.id,project.id),`${title} 플레이리스트에서 빼기`));
    }
    actions.append(actionButton('삭제',()=>deleteSketch(project),`${title} 저장 버전 삭제`));
    card.append(top,actions);grid.append(card);
  });
  if(focusKey) grid.querySelector(`[data-focus="${focusKey}"]`)?.focus();
  updatePlayerMeta();
}
function moveSketch(index,delta) {
  const playlist=playlists.find(item=>item.id===activePlaylistId);
  if(!playlist) return;
  const next=reorderIds(playlist.sketchIds,index,delta);
  if(next.join()===playlist.sketchIds.join()) return;
  const id=playlist.sketchIds[index];
  playlist.sketchIds=next;
  playlist.updatedAt=new Date().toISOString();
  shuffleOrder=[];
  persist();
  renderLibrary({focusKey:`${delta<0?'up':'down'}:${id}`});
  updateTransportState();
}
function deleteSketch(project) {
  const title=cleanString(project.name,80)||'이름 없는 스케치';
  if(!confirm(`“${title}” 저장 버전을 삭제할까요?`)) return;
  projects=projects.filter(item=>item.id!==project.id);
  playlists.forEach(playlist=>{playlist.sketchIds=removeId(playlist.sketchIds,project.id);});
  if(currentProjectId===project.id) currentProjectId=null;
  shuffleOrder=[];
  persist();updateTransportState();renderLibrary();
  toast('저장 버전을 삭제했어요.');
}
async function playProject(project) {
  playContext='queue';
  loadData(project,{projectId:project.id});
  try {await player.play(song,playbackHandlers());}
  catch(error) {toast(error?.message||'이 브라우저에서 오디오를 시작하지 못했어요. 최신 Chrome 또는 Safari에서 다시 열어 주세요.');}
  updatePlayUI();
  if(document.body.classList.contains('view-library')) renderLibrary();
}
function openProject(project) {
  playContext='studio';
  loadData(project,{projectId:project.id});
  showView('studio');
  toast('저장한 스케치를 불러왔어요.');
}
function showGuide() {
  openDialog('취향에서 노래까지, 세 걸음','<ol class="guide-steps"><li><b>이야기하며 방향 정하기</b><span>장르 프리셋이나 분위기, 주제를 고르세요. “함께 곡의 방향 정하기”에서 상담용 내용을 복사해 ChatGPT 등 AI 대화창에 붙여 넣어 상의해 보세요.</span></li><li><b>데모를 듣고 취향 찾기</b><span>데모를 만들고 아래 재생 바에서 재생하세요. 허밍은 가사 없는 oo/ah 패드입니다. 반복과 셔플, 이전·다음은 라이브러리나 플레이리스트 안에서 움직입니다. 변주 버튼은 같은 이야기에서 코드, 멜로디, 그루브, 구성, 조성과 템포를 다시 뽑아요.</span></li><li><b>가사를 다듬고 다음 제작으로</b><span>템플릿 가사 초안을 직접 수정하거나 함께 쓴 가사를 붙여 넣으세요. 저장한 스케치는 라이브러리에서 찾고, 플레이리스트로 순서를 정할 수 있어요. WAV·MIDI·제작안으로 내보내 후속 작업을 이어가세요.</span></li></ol><p class="dialog-description">연주는 브라우저의 합성 악기입니다. 외부 음원을 받지 않으며, 프로젝트와 플레이리스트는 이 브라우저에 저장됩니다.</p><div class="dialog-actions"><button class="button primary" id="guideDone">좋아요, 시작할게요 →</button></div><p class="dialog-description">© 2026 캐모마일그레이 (ChamomileGrey)</p>');$('guideDone').onclick=closeDialog;
}

$('settingsForm').addEventListener('submit',event=>{event.preventDefault();generate();});
for(const id of ['title','topic','bpm','key','bars','vocal','notes']) $(id).addEventListener('input',()=>{settings[id]=['bpm','bars'].includes(id)?Number($(id).value):$(id).value;if(id==='bpm'||id==='key'){settings.feelAnchor=null;updatePresetHint();}if(id==='bpm')$('bpmOutput').innerHTML=`${settings.bpm} <span>BPM</span>`;updatePending();scheduleSave();});
document.querySelectorAll('[data-mood]').forEach(button=>button.onclick=()=>{settings.mood=button.dataset.mood;fillForm();scheduleSave();});
document.querySelectorAll('[data-genre-preset]').forEach(button=>button.onclick=()=>{const preset=presetById(button.dataset.genrePreset);if(!preset) return;settings=normalize(applyPresetToSettings(settings,preset.id));settings.feelAnchor={bpm:settings.bpm,key:settings.key};fillForm();scheduleSave();});
$('playBtn').onclick=play;
$('barPlayBtn').onclick=play;
$('prevBtn').onclick=()=>{previousTrack();};
$('nextBtn').onclick=()=>{goQueue(1);};
$('shuffleBtn').onclick=()=>{shuffleOn=!shuffleOn;shuffleSeed=(shuffleSeed+Date.now())>>>0;shuffleOrder=[];persist();updateTransportState();};
$('repeatBtn').onclick=()=>{repeatMode=nextRepeatMode(repeatMode);persist();updateTransportState();};
$('restartBtn').onclick=async()=>{const wasPlaying=player.getState().status==='playing';player.stop();setProgress(0);updatePlayUI();if(wasPlaying)await play();};
$('variationBtn').onclick=()=>generate({newSeed:true,message:'변주를 다시 뽑았어요. 코드, 멜로디, 그루브, 구성이 바뀌고 조성과 템포는 장르 범위 안에서 조금 움직입니다.'});
function setVolume(value){const next=Math.max(0,Math.min(100,Number(value)||0));$('volume').value=String(next);$('playerVolume').value=String(next);player.setVolume(next/100);}
$('volume').oninput=()=>setVolume($('volume').value);
$('playerVolume').oninput=()=>setVolume($('playerVolume').value);
player.setVolume(.65);
$('seekBar').addEventListener('pointerdown',()=>{seeking=true;seekWasPlaying=player.getState().status==='playing';});
$('seekBar').addEventListener('keydown',event=>{if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home','End'].includes(event.key)) return;seeking=true;seekWasPlaying=player.getState().status==='playing';});
$('seekBar').addEventListener('input',()=>{if(!song) return;$('barTime').textContent=formatTime(song.duration*Number($('seekBar').value)/1000);});
$('seekBar').addEventListener('change',()=>{commitSeek();});
$('seekBar').addEventListener('pointerup',()=>{setTimeout(()=>{seeking=false;},400);});
document.querySelectorAll('[data-layer]').forEach(button=>button.onclick=()=>{const layer=button.dataset.layer;player.stop();applied.instruments[layer]=!applied.instruments[layer];settings.instruments[layer]=applied.instruments[layer];renderSong();persist();if(!Object.values(applied.instruments).some(Boolean))toast('모든 악기가 꺼져 있어요. 듣고 싶은 악기를 켜 주세요.');});
const tabs=[...document.querySelectorAll('[data-tab]')];
function setTab(button){tabs.forEach(tab=>{const selected=tab===button;tab.classList.toggle('active',selected);tab.setAttribute('aria-selected',String(selected));tab.tabIndex=selected?0:-1;$(`${tab.dataset.tab}Panel`).hidden=!selected;});}
tabs.forEach((button,index)=>{button.onclick=()=>setTab(button);button.onkeydown=event=>{let next;if(event.key==='ArrowRight')next=tabs[(index+1)%tabs.length];if(event.key==='ArrowLeft')next=tabs[(index+tabs.length-1)%tabs.length];if(event.key==='Home')next=tabs[0];if(event.key==='End')next=tabs.at(-1);if(next){event.preventDefault();setTab(next);next.focus();}};});
$('lyrics').oninput=()=>{customLyrics=$('lyrics').value;scheduleSave();};
$('newLyricsBtn').onclick=()=>{if(customLyrics!==null&&!confirm('직접 수정한 가사를 새 템플릿 초안으로 바꿀까요?'))return;const next=createBrief({...applied,seed:applied.seed+take+Math.floor(Math.random()*99999)});customLyrics=next.lyrics;$('lyrics').value=customLyrics;persist();toast('다른 가사 초안을 준비했어요.');};
$('copyLyricsBtn').onclick=()=>copy($('lyrics').value,'가사');
$('copyPromptBtn').onclick=()=>copy(brief.prompt,'프롬프트');
$('discussHero').onclick=discussion;
$('guideBtn').onclick=showGuide;
$('libraryBtn').onclick=()=>showView('library',{focusSearch:true});
$('saveBtn').onclick=saveProject;
$('saveProjectBtn').onclick=saveProject;
$('saveHere').onclick=saveProject;
$('exportBtn').onclick=exportDialog;
$('closeDialog').onclick=closeDialog;
dialog.addEventListener('click',event=>{if(event.target===dialog){const rect=dialog.getBoundingClientRect();if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom)closeDialog();}});
$('studioNav').onclick=()=>{showView('studio');scrollToElement(document.querySelector('.workspace-heading'));};
$('playerTitleBtn').onclick=()=>{showView('studio');scrollToElement(document.querySelector('.studio'));};
$('playerContext').onclick=()=>showView('library');
function startNewProject() {if(!confirm('현재 작업은 JSON으로 내보내거나 프로젝트에 저장했나요? 새 작업을 시작하면 현재 작업 중인 내용이 바뀝니다.'))return;showView('studio');playContext='studio';loadData({settings:{...DEFAULTS,title:'새로운 나의 노래',topic:'',notes:'',seed:Date.now()>>>0},customLyrics:null},{projectId:null});if(dialog.open)closeDialog();$('title').focus();toast('새 작업실을 준비했어요. 함께 곡의 방향을 정해 보세요.');}
$('newBtn').onclick=startNewProject;
$('libraryNewBtn').onclick=startNewProject;
$('playlistAll').onclick=()=>{activePlaylistId=null;shuffleOrder=[];persist();updateTransportState();renderLibrary();};
$('newPlaylistBtn').onclick=()=>nameDialog('새 플레이리스트','',name=>{if(createPlaylist(name)) toast(`“${name}” 플레이리스트를 만들었어요.`);});
$('renamePlaylistBtn').onclick=()=>{const playlist=playlists.find(item=>item.id===activePlaylistId);if(!playlist) return;nameDialog('플레이리스트 이름',playlist.name,name=>{playlist.name=name;playlist.updatedAt=new Date().toISOString();persist();updatePlayerMeta();renderLibrary();toast('이름을 바꿨어요.');});};
$('deletePlaylistBtn').onclick=()=>{const playlist=playlists.find(item=>item.id===activePlaylistId);if(!playlist) return;if(!confirm(`플레이리스트 “${playlist.name}”을 삭제할까요? 스케치 원본은 라이브러리에 남아요.`)) return;playlists=playlists.filter(item=>item.id!==playlist.id);activePlaylistId=null;shuffleOrder=[];persist();updateTransportState();renderLibrary();toast('플레이리스트를 삭제했어요.');};
$('librarySearch').addEventListener('input',()=>{libraryQuery=$('librarySearch').value;renderLibrary();});
$('librarySort').addEventListener('change',()=>{librarySort=$('librarySort').value;shuffleOrder=[];persist();renderLibrary();updateTransportState();});
$('importJsonBtn').onclick=()=>$('importJson').click();
$('importJson').onchange=async event=>{
  const file=event.target.files?.[0];event.target.value='';if(!file)return;
  try {if(file.size>150000)throw new Error('파일이 너무 큽니다. 150 KB 이하의 프로젝트를 선택해 주세요.');const data=JSON.parse(await file.text());if(data?.format!=='sonori-project'||data.version!==1||!data.settings||typeof data.settings!=='object'||Array.isArray(data.settings))throw new Error('SONORI에서 내보낸 프로젝트 JSON을 선택해 주세요.');playContext='studio';loadData(data,{projectId:null});showView('studio');toast('프로젝트 파일을 불러왔어요.');} catch(error){toast(error?.message||'프로젝트를 불러오지 못했어요.');}
};
document.querySelectorAll('[data-preset]').forEach(button=>button.onclick=()=>{settings=normalize({...PRESETS[button.dataset.preset]});fillForm();scheduleSave();toast('예시 설정을 넣었어요. 데모 만들기를 눌러 들어보세요.');scrollToElement(document.querySelector('.workspace-heading'));});
window.addEventListener('error', reportAppError);
window.addEventListener('unhandledrejection', reportAppError);
window.addEventListener('pagehide',()=>{persist();player.stop();});
if (!(globalThis.AudioContext || globalThis.webkitAudioContext)) {
  const note = $('audioFallback');
  if (note) note.hidden = false;
}
const privacyLink = $('privacyLink');
const privacyNote = $('privacy');
if (privacyLink && privacyNote) privacyLink.addEventListener('click', () => { privacyNote.open = true; });
if (location.hash === '#privacy' && privacyNote) privacyNote.open = true;
const reloadApp = $('reloadApp');
if (reloadApp) reloadApp.onclick = () => location.reload();
try {
  $('librarySort').value=librarySort;
  fillForm();renderSong();persist();
  if (document.querySelector('meta[name="sonori-sw"]') && navigator.serviceWorker) {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  }
} catch (error) {
  reportAppError();
}
