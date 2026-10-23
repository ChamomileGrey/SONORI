import { compose, createPlayer, renderWav, createMidi } from './audio.js';
import { createBrief, formatBrief } from './brief.js';

const $ = id => document.getElementById(id);
const STORAGE = 'sonori.studio.v1';
const GENRES = {lofi:'Lo-fi',pop:'Pop',rnb:'R&B',ambient:'Ambient'};
const MOODS = {warm:'따뜻한',dreamy:'몽환적인',bright:'경쾌한',melancholy:'아련한'};
const DEFAULTS = {title:'오후의 작은 쉼표',topic:'창가에 앉아 잠시 쉬어 가는 오후',genre:'lofi',mood:'warm',bpm:84,key:'C',bars:16,seed:20261017,vocal:'female',notes:'',instruments:{melody:true,chords:true,bass:true,drums:true}};
const PRESETS = {
  warm:{...DEFAULTS},
  night:{...DEFAULTS,title:'잠들지 않은 도시',topic:'늦은 밤 도시를 걷다 떠오른 작은 그리움',genre:'rnb',mood:'dreamy',bpm:76,key:'F',seed:240921},
  day:{...DEFAULTS,title:'기분 좋은 첫걸음',topic:'새로운 하루를 시작하는 가벼운 용기',genre:'pop',mood:'bright',bpm:112,key:'G',seed:172832},
};
const clone = value => JSON.parse(JSON.stringify(value));
const cleanString = (value, max) => typeof value === 'string' ? value.slice(0,max) : '';
function normalize(value = {}) {
  const valid = (obj, key, fallback) => Object.hasOwn(obj, key) ? key : fallback;
  return {title:cleanString(value.title,70),topic:cleanString(value.topic,600),notes:cleanString(value.notes,2000),genre:valid(GENRES,value.genre,'lofi'),mood:valid(MOODS,value.mood,'warm'),bpm:Math.max(72,Math.min(140,Math.round(Number(value.bpm)||84))),key:['C','D','E','F','G','A'].includes(value.key)?value.key:'C',bars:[8,16,32].includes(Number(value.bars))?Number(value.bars):16,seed:(Number(value.seed)||20261017)>>>0,vocal:['female','male','duet','instrumental'].includes(value.vocal)?value.vocal:'female',instruments:Object.fromEntries(['melody','chords','bass','drums'].map(name=>[name,value.instruments?.[name]!==false]))};
}
let stored;
let storageWorks = true;
let storageNotified = false;
try {stored=JSON.parse(localStorage.getItem(STORAGE)||'null');} catch {storageWorks=false;stored=null;}
let projects = Array.isArray(stored?.projects) ? stored.projects.filter(p=>p&&typeof p.id==='string'&&p.settings).slice(0,30) : [];
let settings = normalize(stored?.settings || DEFAULTS);
let applied = normalize(stored?.applied || settings);
let customLyrics = typeof stored?.customLyrics==='string' ? stored.customLyrics.slice(0,16000) : null;
let example = stored ? Boolean(stored.example) : true;
let take = Math.max(1,Math.min(999,Number(stored?.take)||1));
let song, brief, progress = 0, toastTimer, persistTimer;
const player = createPlayer();
const dialog = $('appDialog');
const playIcon='<svg viewBox="0 0 24 24"><path d="m9 5 11 7-11 7z"/></svg>';
const pauseIcon='<svg viewBox="0 0 24 24"><path d="M7 5h4v14H7zm6 0h4v14h-4z"/></svg>';
function toast(message) {$('toast').textContent=message;$('toast').classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('toast').classList.remove('show'),3600);}
function persist() {
  clearTimeout(persistTimer);
  try {localStorage.setItem(STORAGE,JSON.stringify({settings,applied,customLyrics,example,take,projects}));storageWorks=true;} catch (error) {storageWorks=false;if(!storageNotified){storageNotified=true;toast(error?.name==='QuotaExceededError'?'브라우저 저장 공간이 가득 찼어요. 오래된 버전을 정리하거나 JSON으로 내보내 주세요.':'이 브라우저(개인정보 보호 모드 등)에서는 자동 저장을 쓸 수 없어요. JSON으로 보관해 주세요.');}}
  $('saveStatus').textContent=storageWorks?'이 브라우저에 자동 저장':'저장 불가 · JSON으로 보관해 주세요';
  $('storageWarning').hidden=storageWorks;
  $('projectCount').textContent=String(projects.length);
}
function scheduleSave() {clearTimeout(persistTimer);persistTimer=setTimeout(persist,300);}
function formatTime(seconds) {const s=Math.max(0,Math.floor(Number(seconds)||0));return `${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`;}
function updatePending() {$('pendingBadge').hidden=JSON.stringify(settings)===JSON.stringify(applied);}
function fillForm() {
  for(const id of ['title','topic','bpm','key','bars','vocal','notes']) $(id).value=settings[id];
  $('bpmOutput').innerHTML=`${settings.bpm} <span>BPM</span>`;
  for(const type of ['genre','mood']) document.querySelectorAll(`[data-${type}]`).forEach(button=>{const selected=button.dataset[type]===settings[type];button.classList.toggle('selected',selected);button.setAttribute('aria-pressed',String(selected));});
  updatePending();
}
function updatePlayUI() {
  const playing=player.getState().status==='playing';
  $('playBtn').innerHTML=playing?pauseIcon:playIcon;
  $('playBtn').setAttribute('aria-label',playing?'데모 일시정지':'데모 재생');
  $('waveform').classList.toggle('playing',playing);
}
function setProgress(value) {
  progress=Math.max(0,Math.min(1,value));
  $('currentTime').textContent=formatTime(song.duration*progress);
  $('progressLine').style.width=`${progress*100}%`;
  [...$('waveform').children].forEach((bar,index)=>bar.classList.toggle('played',index/72<progress));
  [...$('barTrack').children].forEach((bar,index)=>bar.classList.toggle('active',index/applied.bars<progress));
}
function renderSong() {
  song=compose(applied);
  brief=createBrief(applied);
  $('songTitle').textContent=brief.title;
  $('exampleBadge').hidden=!example;
  $('songTags').replaceChildren(...[GENRES[applied.genre],MOODS[applied.mood],`${applied.key} major`,`${applied.bars}마디`].map(text=>{const span=document.createElement('span');span.textContent=text;return span;}));
  $('variationLabel').textContent=`TAKE ${String(take).padStart(2,'0')}`;
  $('tempoDisplay').textContent=`${song.bpm} BPM`;
  $('totalTime').textContent=formatTime(song.duration);
  $('soundDescription').textContent=`${MOODS[applied.mood]} ${GENRES[applied.genre]} · ${applied.bars}마디 합성 연주 데모 · 보컬 미포함`;
  const wave=Array.from({length:72},(_,i)=>{
    const bar=document.createElement('i');bar.className='wave-bar';
    const notes=song.events.filter(e=>e.time>=i/72*song.duration&&e.time<(i+1)/72*song.duration);
    const strength=notes.reduce((sum,n)=>sum+n.velocity,0);
    const shape=(.55+.45*Math.sin(i*.43+applied.seed%12))*(1-Math.abs(i-35.5)/100);
    bar.style.height=`${song.events.length?Math.min(83,12+strength*6+shape*34):3}px`;bar.style.setProperty('--delay',`${-i*.08}s`);return bar;
  });
  $('waveform').replaceChildren(...wave);
  $('barTrack').replaceChildren(...Array.from({length:applied.bars},()=>document.createElement('i')));
  $('structure').replaceChildren(...brief.structure.map(part=>{const div=document.createElement('div');div.className='structure-part';div.style.flex=part.bars;div.title=part.description;const b=document.createElement('b');b.textContent=part.name;const span=document.createElement('span');span.textContent=`${part.bars} bars`;div.append(b,span);return div;}));
  $('structureMeta').textContent=`${applied.bars} BARS · 구성 제안`;
  $('chords').replaceChildren(...song.chordNames.map(name=>{const span=document.createElement('span');span.textContent=name;return span;}));
  document.querySelectorAll('[data-layer]').forEach(button=>{const enabled=applied.instruments[button.dataset.layer];button.classList.toggle('enabled',enabled);button.setAttribute('aria-pressed',String(enabled));});
  $('lyrics').value=customLyrics??brief.lyrics;
  $('promptText').textContent=brief.prompt;
  $('briefSummary').textContent=brief.summary;
  setProgress(0);updatePlayUI();updatePending();
}
function generate({newSeed=false,message='새로운 데모를 만들었어요. 재생해서 들어보세요.'}={}) {
  player.stop();
  if(newSeed) {settings.seed=(settings.seed+7919)>>>0;take++;} else take=1;
  applied=clone(settings);example=false;renderSong();persist();toast(message);
}
async function play() {
  if(!song.events.length) {toast('듣고 싶은 사운드 레이어를 하나 이상 켜 주세요.');return;}
  try {
    if(player.getState().status==='playing') player.pause();
    else await player.play(song,{onProgress:setProgress,onEnded:()=>{setProgress(1);updatePlayUI();}});
    updatePlayUI();
  } catch(error) {toast(error?.message||'이 브라우저에서 오디오를 시작하지 못했어요. 최신 Chrome 또는 Safari에서 다시 열어 주세요.');updatePlayUI();}
}
function currentBrief() {return {...brief,lyrics:customLyrics??brief.lyrics};}
function openDialog(title,content) {
  $('dialogTitle').textContent=title;$('dialogContent').replaceChildren();
  if(typeof content==='string') $('dialogContent').innerHTML=content; else $('dialogContent').append(content);
  if(!dialog.open) dialog.showModal();
}
function closeDialog() {dialog.close();}
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
  openDialog('이 곡, 다음 작업으로 가져가기','<p class="dialog-description">현재 들리는 데모와 적용된 설정을 내보냅니다. JSON에는 아직 적용하지 않은 설정도 함께 보관됩니다.</p><div class="download-grid"><button class="download-option" id="downloadWav"><b>WAV <span>↘</span></b><small>연주 데모 음원<br>44.1 kHz · Stereo</small></button><button class="download-option" id="downloadMidi"><b>MIDI <span>↘</span></b><small>멜로디·코드·베이스·드럼<br>DAW에서 계속 편집</small></button><button class="download-option" id="downloadBrief"><b>제작안 TXT <span>↘</span></b><small>가사·스타일 프롬프트<br>곡 구성과 상의할 내용</small></button><button class="download-option" id="downloadJson"><b>프로젝트 JSON <span>↘</span></b><small>현재 설정과 편집한 가사<br>다른 브라우저에서 불러오기</small></button></div><p class="dialog-description" style="margin:18px 0 0">WAV는 기기에 따라 생성에 잠시 시간이 걸릴 수 있어요. MIDI의 악기 음색은 사용하는 음악 프로그램에 따라 달라집니다.</p>');
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
  if(projects.length>=30){toast('최대 30개까지 보관할 수 있어요. 내 프로젝트에서 이전 버전을 정리해 주세요.');return;}
  const data=projectData();
  projects.unshift({...data,id:globalThis.crypto?.randomUUID?.()||`${Date.now()}-${Math.random()}`,savedAt:new Date().toISOString(),name:brief.title});
  persist();toast(storageWorks?'현재 버전을 내 프로젝트에 저장했어요.':'브라우저 저장이 막혀 있어요. 내보내기에서 JSON으로 보관해 주세요.');
}
function loadData(data) {
  player.stop();settings=normalize(data.settings);applied=normalize(data.applied||data.settings);customLyrics=typeof data.customLyrics==='string'?data.customLyrics.slice(0,16000):null;take=Math.max(1,Math.min(999,Number(data.take)||1));example=false;fillForm();renderSong();persist();
}
function library() {
  openDialog('내 프로젝트','<p class="dialog-description">이 브라우저에 저장한 작업 버전입니다. 다른 기기로 옮기거나 브라우저 데이터를 지우기 전에는 JSON으로 내보내 주세요.</p><div id="savedList"></div><div class="dialog-actions library-actions"><button class="button ghost" id="importJsonBtn">JSON 불러오기</button><input type="file" id="importJson" accept=".json,application/json" hidden><button class="button ghost" id="newFromLibrary">새 프로젝트 ＋</button><button class="button primary" id="saveHere">현재 버전 저장</button></div>');
  const list=$('savedList');
  if(!projects.length){const p=document.createElement('p');p.className='empty-projects';p.textContent='아직 저장한 프로젝트가 없어요.\n마음에 드는 데모를 첫 버전으로 남겨 보세요.';list.append(p);}
  projects.forEach(project=>{
    const row=document.createElement('div');row.className='saved-item';const load=document.createElement('button');load.className='project-load';
    const b=document.createElement('b');b.textContent=cleanString(project.name,80)||'이름 없는 프로젝트';
    const s=document.createElement('small');const date=new Date(project.savedAt);s.textContent=`${Number.isNaN(date.valueOf())?'':date.toLocaleString('ko-KR',{month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'})} · ${GENRES[project.applied?.genre]||'Lo-fi'} · ${project.applied?.bpm||84} BPM`;
    load.append(b,s);load.onclick=()=>{loadData(project);closeDialog();toast('저장한 프로젝트를 불러왔어요.');};
    const del=document.createElement('button');del.className='icon-button';del.textContent='×';del.setAttribute('aria-label',`${b.textContent} 저장 버전 삭제`);del.onclick=()=>{if(confirm(`“${b.textContent}” 저장 버전을 삭제할까요?`)){projects=projects.filter(p=>p.id!==project.id);persist();library();}};
    row.append(load,del);list.append(row);
  });
  $('saveHere').onclick=()=>{saveProject();library();};
  $('importJsonBtn').onclick=()=>$('importJson').click();
  $('newFromLibrary').onclick=startNewProject;
  $('importJson').onchange=async event=>{
    const file=event.target.files?.[0];if(!file)return;
    try {if(file.size>150000)throw new Error('파일이 너무 큽니다. 150 KB 이하의 프로젝트를 선택해 주세요.');const data=JSON.parse(await file.text());if(data?.format!=='sonori-project'||data.version!==1||!data.settings||typeof data.settings!=='object'||Array.isArray(data.settings))throw new Error('SONORI에서 내보낸 프로젝트 JSON을 선택해 주세요.');loadData(data);closeDialog();toast('프로젝트 파일을 불러왔어요.');} catch(error){toast(error?.message||'프로젝트를 불러오지 못했어요.');}
  };
}
function showGuide() {
  openDialog('취향에서 노래까지, 세 걸음','<ol class="guide-steps"><li><b>이야기하며 방향 정하기</b><span>장르·감정·주제를 고르세요. “함께 곡의 방향 정하기”에서 상담용 내용을 복사해 ChatGPT 등 AI 대화창에 붙여 넣어 상의해 보세요.</span></li><li><b>데모를 듣고 취향 찾기</b><span>설정 후 데모를 만들고 재생하세요. 다른 멜로디 버튼은 같은 설정으로 새로운 변주를 만들어요. 악기별로 켜고 끌 수도 있어요.</span></li><li><b>가사를 다듬고 다음 제작으로</b><span>템플릿 가사 초안을 직접 수정하거나 함께 쓴 가사를 붙여 넣으세요. WAV·MIDI·제작안으로 내보내 후속 작업을 이어갈 수 있어요.</span></li></ol><p class="dialog-description">현재 버전은 브라우저의 합성 악기로 연주합니다. AI 채팅·실제 보컬 생성 기능은 연결되어 있지 않으며, 프로젝트는 이 브라우저에 저장됩니다.</p><div class="dialog-actions"><button class="button primary" id="guideDone">좋아요, 시작할게요 →</button></div><p class="dialog-description">© 2026 캐모마일그레이 (ChamomileGrey)</p>');$('guideDone').onclick=closeDialog;
}

$('settingsForm').addEventListener('submit',event=>{event.preventDefault();generate();});
for(const id of ['title','topic','bpm','key','bars','vocal','notes']) $(id).addEventListener('input',()=>{settings[id]=['bpm','bars'].includes(id)?Number($(id).value):$(id).value;if(id==='bpm')$('bpmOutput').innerHTML=`${settings.bpm} <span>BPM</span>`;updatePending();scheduleSave();});
for(const type of ['genre','mood']) document.querySelectorAll(`[data-${type}]`).forEach(button=>button.onclick=()=>{settings[type]=button.dataset[type];fillForm();scheduleSave();});
$('playBtn').onclick=play;
$('restartBtn').onclick=async()=>{const wasPlaying=player.getState().status==='playing';player.stop();setProgress(0);updatePlayUI();if(wasPlaying)await play();};
$('variationBtn').onclick=()=>generate({newSeed:true,message:'같은 취향으로 새로운 멜로디를 만들었어요.'});
$('volume').oninput=()=>player.setVolume(Number($('volume').value)/100);
player.setVolume(.65);
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
$('libraryBtn').onclick=library;
$('saveBtn').onclick=saveProject;
$('saveProjectBtn').onclick=saveProject;
$('exportBtn').onclick=exportDialog;
$('closeDialog').onclick=closeDialog;
dialog.addEventListener('click',event=>{if(event.target===dialog){const rect=dialog.getBoundingClientRect();if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom)closeDialog();}});
$('studioNav').onclick=()=>document.querySelector('.workspace-heading').scrollIntoView({behavior:'smooth'});
function startNewProject() {if(!confirm('현재 작업은 JSON으로 내보내거나 프로젝트에 저장했나요? 새 작업을 시작하면 현재 작업 중인 내용이 바뀝니다.'))return;loadData({settings:{...DEFAULTS,title:'새로운 나의 노래',topic:'',notes:'',seed:Date.now()>>>0},customLyrics:null});if(dialog.open)closeDialog();$('title').focus();toast('새 작업실을 준비했어요. 함께 곡의 방향을 정해 보세요.');}
$('newBtn').onclick=startNewProject;
document.querySelectorAll('[data-preset]').forEach(button=>button.onclick=()=>{settings=normalize({...PRESETS[button.dataset.preset],instruments:{melody:true,chords:true,bass:true,drums:true}});fillForm();scheduleSave();toast('예시 설정을 넣었어요. 데모 만들기를 눌러 들어보세요.');document.querySelector('.workspace-heading').scrollIntoView({behavior:'smooth'});});
window.addEventListener('pagehide',()=>{persist();player.stop();});
fillForm();renderSong();persist();
