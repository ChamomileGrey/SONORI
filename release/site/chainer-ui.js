/**
 * Lazy-loaded browser UI for SONORI's user-supplied audio segment chainer.
 * Kept out of the standalone single-file bundle to preserve the <500 KB budget.
 */
import { encodeWav } from './audio.js';
import { chainSegments, deriveDownbeats, planChain, scoreCompatibility } from './chainer.js';

const ROLES = ['intro', 'verse', 'pre', 'hook', 'bridge', 'break', 'ending'];
const KEYS = [
  'C major', 'C# major', 'D major', 'Eb major', 'E major', 'F major',
  'F# major', 'G major', 'Ab major', 'A major', 'Bb major', 'B major',
  'A minor', 'Bb minor', 'B minor', 'C minor', 'C# minor', 'D minor',
  'D# minor', 'E minor', 'F minor', 'F# minor', 'G minor', 'Ab minor',
];

async function decodeLocalFile(file) {
  const AudioCtx = globalThis.AudioContext || globalThis.webkitAudioContext;
  if (!AudioCtx) throw new Error('이 브라우저는 오디오 디코딩(AudioContext)을 지원하지 않아요.');
  const ctx = new AudioCtx();
  try {
    const raw = await file.arrayBuffer();
    const audio = await ctx.decodeAudioData(raw.slice(0));
    const left = new Float32Array(audio.length);
    left.set(audio.getChannelData(0));
    const right = new Float32Array(audio.length);
    right.set(audio.numberOfChannels > 1 ? audio.getChannelData(1) : left);
    return {
      sampleRate: audio.sampleRate,
      channels: [left, right],
      durationS: audio.duration,
    };
  } finally {
    await ctx.close().catch(() => {});
  }
}

export function openChainerDialog({ openDialog, toast, download }) {
  const segments = [];
  let nextId = 1;
  let lastResult = null;

  const wrap = document.createElement('div');
  wrap.style.cssText = 'display:grid;gap:12px;';

  const intro = document.createElement('p');
  intro.className = 'dialog-description';
  intro.textContent = '직접 가지고 있는 로컬 WAV/오디오 조각(intro·hook·bridge·ending 등)을 불러와 호환 점수를 확인하고 다운비트 크로스페이드로 이어 붙입니다. 템포 ±3%, 피치 ±2반음 안에서만 조정합니다.';

  const toolbar = document.createElement('div');
  toolbar.style.cssText = 'display:flex;flex-wrap:wrap;gap:8px;align-items:center;';

  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.accept = '.wav,audio/wav,audio/*';
  fileInput.multiple = true;
  fileInput.hidden = true;

  const addBtn = document.createElement('button');
  addBtn.type = 'button';
  addBtn.className = 'button small ghost';
  addBtn.textContent = '로컬 오디오 조각 추가';
  addBtn.onclick = () => fileInput.click();

  const xfadeLabel = document.createElement('label');
  xfadeLabel.style.cssText = 'display:inline-flex;align-items:center;gap:6px;font-size:13px;';
  xfadeLabel.textContent = '크로스페이드(마디)';
  const xfadeSelect = document.createElement('select');
  for (const bars of [0.5, 0.75, 1]) {
    const opt = document.createElement('option');
    opt.value = String(bars);
    opt.textContent = `${bars} 마디`;
    if (bars === 0.75) opt.selected = true;
    xfadeSelect.append(opt);
  }
  xfadeLabel.append(xfadeSelect);

  const loopLabel = document.createElement('label');
  loopLabel.style.cssText = 'display:inline-flex;align-items:center;gap:6px;font-size:13px;';
  const loopCheck = document.createElement('input');
  loopCheck.type = 'checkbox';
  loopLabel.append(loopCheck, document.createTextNode('반복 루프로 접기'));

  toolbar.append(addBtn, fileInput, xfadeLabel, loopLabel);

  const listBox = document.createElement('div');
  listBox.style.cssText = 'display:grid;gap:8px;max-height:240px;overflow:auto;';

  const reportBox = document.createElement('div');
  reportBox.style.cssText = 'font-size:12px;line-height:1.5;background:rgba(40,39,53,.05);padding:10px;border-radius:10px;';
  reportBox.textContent = 'WAV 파일을 2개 이상 추가하면 쌍별 호환 점수와 이음매 품질(join/p99)을 계산합니다.';

  const actions = document.createElement('div');
  actions.className = 'dialog-actions';

  const planBtn = document.createElement('button');
  planBtn.type = 'button';
  planBtn.className = 'button small ghost';
  planBtn.textContent = '호환 순서 정렬';

  const chainBtn = document.createElement('button');
  chainBtn.type = 'button';
  chainBtn.className = 'button small primary';
  chainBtn.textContent = '조각 연결 후 WAV 저장';

  actions.append(planBtn, chainBtn);
  wrap.append(intro, toolbar, listBox, reportBox, actions);

  function renderReport(extraLines = []) {
    const lines = [];
    for (let i = 0; i < segments.length - 1; i++) {
      const a = segments[i];
      const b = segments[i + 1];
      const c = scoreCompatibility(a, b);
      lines.push(
        `${a.name} → ${b.name}: ${c.ok ? `가능 (${c.score.toFixed(2)})` : `불가 (${c.reason})`} · 템포 ${c.tempoScale.toFixed(3)}x · 피치 ${c.pitchSemitones >= 0 ? '+' : ''}${c.pitchSemitones}st`
      );
    }
    if (!lines.length && !extraLines.length) {
      reportBox.textContent = segments.length
        ? '조각을 하나 더 추가하면 연결 호환 점수를 볼 수 있어요.'
        : 'WAV 파일을 2개 이상 추가하면 쌍별 호환 점수와 이음매 품질(join/p99)을 계산합니다.';
      return;
    }
    reportBox.replaceChildren();
    for (const text of [...lines, ...extraLines]) {
      const p = document.createElement('div');
      p.textContent = text;
      reportBox.append(p);
    }
  }

  function renderList() {
    listBox.replaceChildren();
    segments.forEach((seg, index) => {
      const row = document.createElement('div');
      row.style.cssText = 'display:grid;grid-template-columns:1.2fr 70px 108px 86px 76px 76px auto;gap:6px;align-items:center;padding:8px;border:1px solid rgba(40,39,53,.12);border-radius:10px;font-size:12px;'
        + (seg.skipped ? 'opacity:.62;' : '');

      const name = document.createElement('strong');
      name.textContent = `${index + 1}. ${seg.name} (${seg.durationS.toFixed(2)}s)${seg.skipped ? ' · 연결에서 제외' : ''}`;
      name.style.cssText = 'overflow:hidden;text-overflow:ellipsis;white-space:nowrap;';

      const bpm = document.createElement('input');
      bpm.type = 'number';
      bpm.min = '40';
      bpm.max = '240';
      bpm.step = '0.5';
      bpm.value = String(seg.bpm);
      bpm.title = 'BPM';
      bpm.setAttribute('aria-label', `${seg.name} BPM`);
      bpm.onchange = () => { seg.bpm = Math.max(40, Number(bpm.value) || 120); seg.downbeats = deriveDownbeats(seg); renderReport(); };

      const keySel = document.createElement('select');
      keySel.setAttribute('aria-label', `${seg.name} 조성`);
      for (const k of KEYS) {
        const opt = document.createElement('option');
        opt.value = k;
        opt.textContent = k;
        if (k === seg.key) opt.selected = true;
        keySel.append(opt);
      }
      keySel.onchange = () => { seg.key = keySel.value; renderReport(); };

      const roleSel = document.createElement('select');
      roleSel.setAttribute('aria-label', `${seg.name} 구간 역할`);
      for (const r of ROLES) {
        const opt = document.createElement('option');
        opt.value = r;
        opt.textContent = r;
        if (r === seg.role) opt.selected = true;
        roleSel.append(opt);
      }
      roleSel.onchange = () => { seg.role = roleSel.value; renderReport(); };

      const cStart = document.createElement('input');
      cStart.type = 'number';
      cStart.step = '0.1';
      cStart.min = '0';
      cStart.max = String(seg.durationS.toFixed(2));
      cStart.value = seg.coreStartS.toFixed(2);
      cStart.title = '코어 시작(초)';
      cStart.setAttribute('aria-label', `${seg.name} 코어 시작 초`);
      cStart.onchange = () => { seg.coreStartS = Math.max(0, Math.min(seg.coreEndS, Number(cStart.value) || 0)); seg.downbeats = deriveDownbeats(seg); renderReport(); };

      const cEnd = document.createElement('input');
      cEnd.type = 'number';
      cEnd.step = '0.1';
      cEnd.min = '0';
      cEnd.max = String(seg.durationS.toFixed(2));
      cEnd.value = seg.coreEndS.toFixed(2);
      cEnd.title = '코어 끝(초)';
      cEnd.setAttribute('aria-label', `${seg.name} 코어 끝 초`);
      cEnd.onchange = () => { seg.coreEndS = Math.max(seg.coreStartS, Math.min(seg.durationS, Number(cEnd.value) || seg.durationS)); seg.downbeats = deriveDownbeats(seg); renderReport(); };

      const remove = document.createElement('button');
      remove.type = 'button';
      remove.className = 'button small ghost';
      remove.textContent = '삭제';
      remove.onclick = () => { segments.splice(index, 1); renderList(); renderReport(); };

      row.append(name, bpm, keySel, roleSel, cStart, cEnd, remove);
      listBox.append(row);
    });
    planBtn.disabled = segments.length < 2;
    chainBtn.disabled = segments.length < 2;
    renderReport();
  }

  fileInput.onchange = async event => {
    const files = [...(event.target.files || [])];
    event.target.value = '';
    for (const file of files) {
      try {
        const decoded = await decodeLocalFile(file);
        segments.push({
          id: `seg-${nextId++}`,
          name: file.name.replace(/\.[^.]+$/, '').slice(0, 32),
          trackId: null,
          role: segments.length === 0 ? 'intro' : 'hook',
          bpm: 90,
          key: 'C major',
          sampleRate: decoded.sampleRate,
          channels: decoded.channels,
          durationS: decoded.durationS,
          coreStartS: 0,
          coreEndS: decoded.durationS,
          skipped: false,
        });
        const added = segments[segments.length - 1];
        added.downbeats = deriveDownbeats(added);
      } catch (error) {
        toast(error?.message || `${file.name} 파일을 읽지 못했어요.`);
      }
    }
    renderList();
  };

  planBtn.onclick = () => {
    const plan = planChain(segments);
    const kept = plan.items.map(seg => ({ ...seg, skipped: false }));
    const leftover = (plan.skipped || []).map(seg => ({ ...seg, skipped: true }));
    segments.splice(0, segments.length, ...kept, ...leftover);
    renderList();
    renderReport(plan.notes);
    toast(leftover.length ? `호환되는 ${kept.length}개 조각을 앞에 두고, ${leftover.length}개는 목록 아래에 제외 표시로 남겨 두었어요.` : '호환 점수가 높은 순서로 정렬했어요.');
  };

  chainBtn.onclick = () => {
    try {
      const active = segments.filter(seg => !seg.skipped);
      for (let i = 0; i < active.length - 1; i++) {
        const compat = scoreCompatibility(active[i], active[i + 1]);
        if (!compat.ok) {
          throw new Error(`${active[i].name} → ${active[i + 1].name} 은 호환되지 않아 저장할 수 없어요. (${compat.reason})`);
        }
      }
      const result = chainSegments(active, {
        xfadeBars: Number(xfadeSelect.value) || 0.75,
        loop: loopCheck.checked,
      });
      lastResult = result;
      const wav = encodeWav(result.channels, result.sampleRate);
      download(wav, `sonori-chain-${Date.now()}.wav`);
      const summary = result.joins.map(j =>
        `이음매 ${j.from}→${j.to}: join/p99=${j.seam.join_over_p99.toFixed(3)}, 에너지=${j.seam.energy_continuity.toFixed(2)}, 스펙트럼차=${j.seam.spectral_jump.toFixed(2)} (${j.seam.verdict})`
      );
      if (result.wrapClick) {
        summary.push(`루프 랩 클릭: ${result.wrapClick.ratio.toFixed(3)} (${result.wrapClick.verdict})`);
      }
      renderReport(summary);
      toast(`조각 ${segments.length}개를 이어 ${result.durationS.toFixed(1)}초 WAV를 저장했어요.`);
    } catch (error) {
      toast(error?.message || '조각 연결 중 오류가 생겼어요.');
    }
  };

  renderList();
  openDialog('조각 연결 (로컬 오디오)', wrap);
  return { getLastResult: () => lastResult };
}
