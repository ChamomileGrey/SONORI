# SONORI — 취향을 노래로

설치·가입·API 키·서버 없이 브라우저에서 열리는 독립형 음악 작업실입니다.
장르와 분위기를 고르면 연주 데모, 가사 초안, 제작 프롬프트를 한곳에서 만듭니다.

만든 이: **캐모마일그레이 (ChamomileGrey)** · [Ko-fi](https://ko-fi.com/chamomilegrey)

## 시작하기

공개 사이트: <https://chamomilegrey.github.io/SONORI/>

파일을 직접 쓸 때는 `release/SONORI.html`을 최신 Chrome, Edge, Firefox 또는 Safari에서 여세요.
데스크톱 브라우저를 권장합니다. 파일 미리보기 앱은 소리 재생을 막을 수 있습니다.

## 사용 흐름

1. “함께 곡의 방향 정하기”의 상담용 내용을 ChatGPT 대화에 붙여 넣고 상의하세요.
2. 정한 장르·분위기·템포·조성·주제를 입력하고 “데모 만들기”를 누르세요.
3. 연주 데모를 재생하고 멜로디·코드·베이스·드럼을 켜고 끄며 다듬으세요. 화면 아래 재생 바에서 일시정지, 이전·다음, 반복, 셔플을 쓸 수 있어요. 좁은 화면에서는 재생 바를 접어 폼이 가려지지 않게 할 수 있어요. 곡 콘셉트 줄에 형식, 코드, 그루브가 보입니다. **다른 느낌으로**는 템포와 조성을 두고 콘셉트만 다시 뽑고, 직전 곡과 비슷하면 코드나 그루브가 달라질 때까지 한 번 더 고릅니다. **변주 · 달라질 때까지**는 거기에 더해 장르 범위 안에서 조성과 템포도 조금 옮기며, 마찬가지로 직전 결과와 겹치면 다시 뽑습니다.
4. 가사 노트에 초안을 고치거나 함께 쓴 가사를 붙여 넣으세요.
5. 마음에 드는 버전은 라이브러리에 저장하고, 플레이리스트로 순서를 정하세요.
6. 제작 프롬프트를 복사하거나 WAV·MIDI·TXT·프로젝트 JSON으로 내보내세요. WAV는 짧은 데모, 끝과 시작을 겹친 반복 파일, 30분·60분 긴 음원 중에서 고를 수 있어요.

## 지원 기능

- Lo-fi, Pop, R&B, Ambient, Ballad, EDM, Acoustic, Cinematic, Modern Rock, Dawn, Night, City Pop, Trap, House, Bossa Nova, Reggaeton
- 장르 · 무드 선택 하나: Lo-fi, Pop, R&B, Ambient, Ballad, EDM, Acoustic, Cinematic, 감성 모던 록, 새벽 감성, 심야 로파이, City Pop, Trap, House, Bossa Nova, Reggaeton. 하나를 고르면 새 스케치의 장르와 함께 템포, 조성, 스케일 색채, 신스 보이싱, 드럼 패턴이 맞춰짐. 분위기는 그 장르 안에서 조정
- 감성 모던 록은 78 BPM 근처에서 피아노, 클린 기타풍 아르페지오, 따뜻한 패드, 여린 드럼으로 벌스에서 후렴으로 넓어짐
- 선택 레이어인 허밍은 가사 없는 oo/ah 포먼트 패드. 단어 보컬은 만들지 않음
- 트랩은 140 BPM의 하프타임 808과 하이햇 롤, 하우스는 124 BPM의 도리안 루프와 셔플 16분음·오프비트 오픈햇, EDM은 128 BPM의 빌드와 드롭, 보사노바는 싱코페이션과 ii–V, 레게톤은 뎀보우, 시티팝은 스윙 범위 안의 코드 텍스처
- 60~160 BPM, 6개 조성, 메이저·마이너·도리안·펜타토닉 색채, 8/16/24/32/48마디 데모
- 에너지 1–5와 곡선(점점 상승, 중간 피크, 잔잔). 같은 시드의 멜로디 음과 시간은 에너지가 달라도 같음
- 악기 계열(자동, 건반, 패드, 플럭, 리드)과 인트로 켜기/끄기. 24마디 이상에는 브레이크, 32마디 이상에는 벌스 2와 후렴 2
- 재생·일시정지·처음부터·변주 다시 뽑기·음량·악기별 켜기/끄기
- 시드로 고정되는 곡 콘셉트: 벌스-후렴, AABA, 통절, 빌드-드롭 형식, 무드별 코드 풀, 모티프의 전위·역행·리듬 이동, 그루브, 반주, 인트로·아웃트로, 다이내믹. 같은 시드와 같은 설정은 항상 같은 스케치
- 주제와 메모의 후렴·여백·브리지·상승 표현이 구성과 에너지에 반영됨
- 항상 보이는 하단 재생 바: 재생/일시정지, 이전·다음, 위치, 반복(끔/전체/한 곡), 셔플, 현재 제목
- 라이브러리: 저장한 스케치 카드(제목, 날짜, 템포, 조성, 장르), 검색, 정렬
- 플레이리스트 만들기·이름 바꾸기·삭제, 스케치 담기·빼기·순서 바꾸기
- 편집 가능한 템플릿 가사, 영어 음악 제작 프롬프트, 곡 구성 제안
- 최대 30개 프로젝트 버전과 플레이리스트의 브라우저 저장, JSON 내보내기/불러오기
- 이전 버전에서 저장한 `sonori.studio.v1` 스케치는 그대로 라이브러리에 나타남
- 장면: 새벽 공부→새벽 피아노, 비 오는 카페→스윙 로파이, 밤 드라이브→시티팝, 집중 작업→여백 앰비언트, 잠들기 전→하프타임 심야. 기존 장르 프리셋에 배경음을 더함
- 비, 바이닐 잡음, 부드러운 바람(룸톤). 각각 음량 슬라이더가 있고, 샘플 없이 합성함. 음량을 0으로 두면 예전과 같은 연주
- 44.1 kHz stereo PCM WAV 및 각 파트가 나뉜 MIDI 파일
- 반복 WAV: 한 사이클 길이로, 끝의 여운을 시작에 겹쳐 이어서 재생
- 30분·60분 WAV: OfflineAudioContext로 구간을 하나씩 만들고, 시드가 다른 변주를 크로스페이드로 겹침. 진행 표시와 취소. 구간은 WAV 조각으로 이어 붙여 전체를 한 번에 들고 있지 않음
- 크리에이터 이용 안내: 유튜브·방송·영상(수익이 생기는 영상 포함)에 사용 가능. 크레딧 예는 `Music: SONORI by ChamomileGrey`. 만든 곡 그대로를 음원 라이브러리로 되팔지 말아 달라는 짧은 안내이며, 법률 자문은 아님. 응원은 Ko-fi

## 조각 연결 (로컬 오디오 체이너 · 1.8 추가 도구)

사용자가 직접 가지고 있는 짧은 오디오 조각(예: intro, hook, bridge, break, ending WAV)을 로컬 브라우저나 Node에서 이어 붙여 긴 트랙을 만들 수 있는 `dist/chainer.js` 모듈을 제공합니다. 별도의 외부 음원 라이브러리나 데모 오디오는 포함하지 않습니다.

- **호환성 제한**: 템포 타임스트레치는 **±3% (`0.97–1.03`)** 안에서만 허용하며, 피치 시프트는 필요할 때 **±2 반음** 안에서만 적용합니다. 나란한조(예: `C major` ↔ `A minor`, `F# major` ↔ `D# minor`)는 피치 시프트 없이 호환으로 처리하고, 2반음을 초과하는 조성은 강제 피치 시프트 없이 리듬 연결로만 점수를 낮춰 평가합니다.
- **이음매 처리 및 품질 측정**: 같은 트랙의 인접 코어는 중복 +3 dB 상승 없이 연속 컷으로 잇고, 그 외 구간은 `mixCrossfade` 기반 다운비트 정렬 동일 파워 크로스페이드로 연결합니다. `seamMetrics`(join/p99, 에너지 연속성, 스펙트럼 변화)와 `wrapClickMetric`(반복 루프 끝–시작 클릭 비율)을 제공합니다.
- **사용 방법**: 공개 사이트(`release/site/`) 또는 로컬 HTTP 서버에서 **라이브러리 → 조각 연결** 버튼으로 로컬 WAV를 불러와 연결할 수 있습니다(모듈은 지연 로드되며, 500 KB 이하 용량을 지키기 위해 단일 HTML `release/SONORI.html`에는 포함하지 않습니다). 스크립트나 콘솔에서는 `dist/chainer.js`의 `scoreCompatibility`, `planChain`, `chainSegments`, `seamMetrics`, `wrapClickMetric`을 직접 호출할 수 있습니다.

## 범위와 보관

공개 사이트에서 만든 새 스케치(`engineVersion: "1.8.0"`)는 같은 주소에서 불러오는 소형 실제 악기 샘플(피아노·기타·현악·베이스·드럼)과 실제 스튜디오 임펄스 응답(Dixon Studio Theatre), 시드 기반 미세 휴머니제이션으로 재생합니다. 샘플 출처와 라이선스는 [LICENSES.md](LICENSES.md)에 있습니다.
단일 HTML 파일(`release/SONORI.html`)에는 샘플을 넣지 않으며, 오프라인이거나 샘플을 불러오지 못하면 기존 브라우저 합성 악기와 합성 리버브로 자동 대체합니다.
허밍을 켜면 단어 없이 oo/ah로 움직이는 합성 패드가 깔립니다. 가사 보컬은 포함되지 않습니다.
비·바이닐·바람 배경음은 녹음된 샘플이 아니라 시드로 합성합니다.
가사는 로컬 템플릿 초안이며, AI API를 호출하지 않습니다.
보컬 및 완성 음원을 만들려면 프롬프트와 가사를 별도의 음악 제작 서비스로 가져가세요.
이 도구 자체에는 ChatGPT 채팅이나 외부 음악 생성 서비스가 연결되어 있지 않습니다.
곡의 흐름은 그 데모가 실제로 연주하는 구성입니다. 시드가 곡 콘셉트(형식, 코드, 모티프, 그루브, 반주, 인트로·아웃트로)를 고르고, 다른 느낌으로는 그 콘셉트만 다시 뽑습니다. 변주 버튼은 장르 범위 안에서 조성과 템포도 조금 옮깁니다.
예전 버전에서 저장한 프로젝트는 당시 엔진을 유지합니다: 1.7.0 저장본은 기존 합성 악기·합성 리버브로, 1.6.0 및 버전 없는 콘셉트 저장본은 1.6 작곡·합성 악기로, 1.6 이전(`planner:"concept"` 없음)은 1.4 작곡으로 재생됩니다. 데모 만들기, 변주, 다른 느낌으로를 누르면 1.8.0으로 새로 만듭니다. 프로젝트 JSON 버전은 1입니다.
프로젝트와 플레이리스트는 브라우저의 localStorage에 저장됩니다. 파일 주소, 브라우저, 기기가 바뀌면 보이지 않을 수 있습니다.
중요한 버전은 항상 JSON으로 보관하세요. 브라우저 데이터를 지우면 로컬 저장도 지워집니다.
브라우저가 로컬 파일 저장 또는 클립보드를 차단하면 JSON 내보내기와 수동 복사를 사용하세요.
모든 곡과 설정은 이 브라우저 안에만 있습니다. 분석 도구와 쿠키는 없습니다.
공개 사이트에서는 같은 주소의 앱 파일과 악기 샘플만 불러오며, 그 파일은 기기에 저장해 오프라인으로 다시 열 수 있습니다. 곡과 설정은 전송되지 않습니다.
단일 HTML 파일로 쓸 때는 외부에 연결하지 않고, 서비스 워커도 등록하지 않으며, 샘플이 없으면 기존 합성 악기로 재생합니다.
바닥글에 버전과 개인정보 안내가 있습니다. 없는 주소는 `404.html`로 안내합니다.

## 개발

`dist/`에는 모듈 형태의 HTML, CSS, JavaScript 소스가 있습니다.

```bash
npm run build   # release/SONORI.html 과 release/site 재생성
npm run check   # 작곡, 제작안, 라이브러리, 프리셋, 다양성, 장르 거리, 배경음, 내보내기, 샘플 팩, 단독 번들, 공개 페이지 검사
```

개발 중 `dist/index.html`을 볼 때는 정적 HTTP 서버로 제공하세요. 단독 HTML로 묶을 때 외부 글꼴 불러오기는 제거됩니다.

## 배포

`main`에 반영되면 GitHub Actions가 `npm run build`와 `npm run check`를 실행한 뒤, `release/site`를 GitHub Pages에 배포합니다. 그 폴더에 앱, 매니페스트, 서비스 워커, 아이콘, `404.html`, `robots.txt`, `sitemap.xml`이 있습니다. `release/SONORI.html`은 네트워크를 열지 않는 단일 파일입니다.

사이트가 열리려면 저장소에서 **Settings → Pages → Build and deployment → Source**를 **GitHub Actions**로 한 번 지정해야 합니다.

## 후원 · Support

SONORI를 응원하고 싶다면 [Support ChamomileGrey](https://ko-fi.com/chamomilegrey)에서 후원할 수 있습니다. 바닥글의 Support / 후원도 같은 주소입니다. 이 링크는 앱 밖의 사이트를 새 탭으로 여는 일반 링크이며, Ko-fi 위젯이나 외부 스크립트는 없습니다. 곡과 설정은 전송되지 않습니다.

To support the project, use [Support ChamomileGrey](https://ko-fi.com/chamomilegrey). The footer link opens that external site in a new tab. There is no embedded widget or script, and songs and settings are not sent.

## 라이선스

Copyright © 2026 캐모마일그레이 (ChamomileGrey). All rights reserved.

앱은 개인적·상업적 목적으로 무료로 사용할 수 있습니다. 앱으로 만든 음악과 파일도 자유롭게 쓸 수 있습니다. 코드의 재배포·판매·수정은 저작권자의 사전 서면 허락이 필요합니다. 자세한 조건은 [LICENSE](LICENSE)를 보세요.

허락 문의: chamomilegrey.official@gmail.com

## English

SONORI is a single-file browser studio for sketching a song from a mood. Open the [live site](https://chamomilegrey.github.io/SONORI/) or `release/SONORI.html` in a current desktop browser. There is no install, account, API key, or server.

Choose one genre and mood — Lo-fi, Pop, R&B, Ambient, Ballad, EDM, Acoustic, Cinematic, Modern Rock, Dawn, Night, City Pop, Trap, House, Bossa Nova, or Reggaeton — and the next sketch uses that choice together with its tempo, key, scale color, voicing, and drum pattern. Mood can still be adjusted inside the chosen genre. Modern Rock sits near 78 BPM, with piano, clean-guitar arpeggios, warm pads, and a quiet verse that opens into a fuller chorus. Trap is a half-time 808 at 140 BPM with hi-hat rolls, House is a 124 BPM dorian loop with shuffled 16th hats and offbeat open hats, EDM is a straight 128 BPM build and drop, Bossa Nova is a light syncopated nylon voice with ii–V color near 130, and Reggaeton uses a dembow. Generate an instrumental demo, then use the bottom player for play/pause, previous/next, seek, repeat, and shuffle. Each new sketch gets a song concept: form (verse-chorus, AABA, through-composed, or build/drop), a mood-weighted progression, a motif developed by inversion, retrograde, and rhythmic displacement, a groove, and its own intro, outro, and dynamic arc. The stage summarizes that concept. **다른 느낌으로** re-rolls only the concept. **변주** also moves tempo and key a little inside that genre’s range. The same seed and planner always rebuild the same sketch. Saved 1.7.0, 1.6.0, unversioned concept, and pre-1.6 legacy projects keep playing on their original engines; making a demo creates a 1.8.0 sketch. Project JSON stays version 1. Words such as chorus, space, or bridge in the topic and notes steer the form. Toggle melody, chords, bass, drums, and an optional wordless oo/ah hum. The hum is formant synthesis, not sung lyrics. Edit the lyric draft, copy an English production prompt, and export WAV, MIDI, text, or project JSON. New 1.8.0 sketches play back using a compact same-origin 32 kHz MP3 sample pack (piano, guitar, strings, bass, drums), a recorded studio impulse response, and subtle seeded humanization; see [LICENSES.md](LICENSES.md) for sample credits. If samples are unavailable (such as in the offline single-file `release/SONORI.html`), playback falls back to the built-in oscillator voices and synthetic IR. The app does not call any third-party CDN, AI API, or external music-generation service.

All songs and settings stay in this browser. There are no analytics or cookies. On the public site, only this site’s own app files and instrument samples are fetched, and they may be saved on the device so the app can open offline. Songs and settings are never sent. The downloadable HTML file makes no network connections and does not register a service worker. The footer shows v1.8.0, a short what’s-new line, the privacy note, and a Support / 후원 link to the external Ko-fi page. Scene choices (dawn study, rainy café, night drive, focus, bedtime) map onto the now-distinct genre presets — dawn piano, swung lo-fi, city pop, spacious ambient, and half-time night — and add synthesized rain, vinyl crackle, and soft wind, each with its own slider. Export a seamless loop, or a 30- or 60-minute WAV rendered in crossfaded variations with progress and cancel. A short creator note says the music may be used in videos and streams, including monetized ones; attribution such as “Music: SONORI by ChamomileGrey” is appreciated; please don’t resell the raw tracks as a sample library. That note is not legal advice.

Projects and playlists are stored in this browser’s localStorage (up to 30 sketch versions). Sketches saved by version 1.0 stay in the library. Export JSON for any version you want to keep. A full storage quota or private mode shows a notice instead of failing silently, and destructive deletes ask for confirmation.

An additive 1.8 tool (`dist/chainer.js`, lazy-loaded on the Pages site via **Library → 조각 연결** and omitted from the single-file `release/SONORI.html` to keep it under 500 KB) lets you chain your own locally loaded audio segments (`intro`, `hook`, `bridge`, `break`, `ending`) with strict caps (±3% time-stretch, ±2 semitones pitch-shift; relative major/minor compatible at 0 st), downbeat-aligned equal-power crossfades, continuous cuts for same-track adjacent cores, and `seamMetrics` / `wrapClickMetric` (`join/p99`) checks. No third-party music library or demo audio is shipped.

Copyright © 2026 ChamomileGrey. See [LICENSE](LICENSE). Permission requests: chamomilegrey.official@gmail.com. Support: [ko-fi.com/chamomilegrey](https://ko-fi.com/chamomilegrey).
