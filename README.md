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
3. 연주 데모를 재생하고 멜로디·코드·베이스·드럼을 켜고 끄며 다듬으세요. 화면 아래 재생 바에서 일시정지, 이전·다음, 반복, 셔플을 쓸 수 있어요. 곡 콘셉트 줄에 형식, 코드, 그루브가 보입니다. **다른 느낌으로**는 템포와 조성을 두고 콘셉트만 다시 뽑고, **변주**는 거기에 더해 장르 범위 안에서 조성과 템포도 조금 옮깁니다.
4. 가사 노트에 초안을 고치거나 함께 쓴 가사를 붙여 넣으세요.
5. 마음에 드는 버전은 라이브러리에 저장하고, 플레이리스트로 순서를 정하세요.
6. 제작 프롬프트를 복사하거나 WAV·MIDI·TXT·프로젝트 JSON으로 내보내세요.

## 지원 기능

- Lo-fi, Pop, R&B, Ambient, Ballad, EDM, Acoustic, Cinematic, Modern Rock, Dawn, Night, City Pop, Trap, House, Bossa Nova, Reggaeton
- 장르 · 무드 선택 하나: Lo-fi, Pop, R&B, Ambient, Ballad, EDM, Acoustic, Cinematic, 감성 모던 록, 새벽 감성, 심야 로파이, City Pop, Trap, House, Bossa Nova, Reggaeton. 하나를 고르면 새 스케치의 장르와 함께 템포, 조성, 스케일 색채, 신스 보이싱, 드럼 패턴이 맞춰짐. 분위기는 그 장르 안에서 조정
- 감성 모던 록은 78 BPM 근처에서 피아노, 클린 기타풍 아르페지오, 따뜻한 패드, 여린 드럼으로 벌스에서 후렴으로 넓어짐
- 선택 레이어인 허밍은 가사 없는 oo/ah 포먼트 패드. 단어 보컬은 만들지 않음
- 트랩은 140 BPM의 하프타임 808과 하이햇 롤, 하우스는 124 BPM의 도리안 루프와 셔플 16분음·오프비트 오픈햇, EDM은 128 BPM의 빌드와 드롭, 보사노바는 싱코페이션과 ii–V, 레게톤은 뎀보우, 시티팝은 스윙 범위 안의 코드 텍스처
- 72~140 BPM, 6개 조성, 메이저·마이너·도리안·펜타토닉 색채, 8/16/32마디 데모
- 재생·일시정지·처음부터·변주 다시 뽑기·음량·악기별 켜기/끄기
- 시드로 고정되는 곡 콘셉트: 벌스-후렴, AABA, 통절, 빌드-드롭 형식, 무드별 코드 풀, 모티프의 전위·역행·리듬 이동, 그루브, 반주, 인트로·아웃트로, 다이내믹. 같은 시드와 같은 설정은 항상 같은 스케치
- 주제와 메모의 후렴·여백·브리지·상승 표현이 구성과 에너지에 반영됨
- 항상 보이는 하단 재생 바: 재생/일시정지, 이전·다음, 위치, 반복(끔/전체/한 곡), 셔플, 현재 제목
- 라이브러리: 저장한 스케치 카드(제목, 날짜, 템포, 조성, 장르), 검색, 정렬
- 플레이리스트 만들기·이름 바꾸기·삭제, 스케치 담기·빼기·순서 바꾸기
- 편집 가능한 템플릿 가사, 영어 음악 제작 프롬프트, 곡 구성 제안
- 최대 30개 프로젝트 버전과 플레이리스트의 브라우저 저장, JSON 내보내기/불러오기
- 이전 버전에서 저장한 `sonori.studio.v1` 스케치는 그대로 라이브러리에 나타남
- 44.1 kHz stereo PCM WAV 및 각 파트가 나뉜 MIDI 파일

## 범위와 보관

음악은 브라우저 합성 악기로 만든 작곡 스케치입니다. 샘플 기반 실제 악기나 보컬 음원은 아닙니다.
허밍을 켜면 단어 없이 oo/ah로 움직이는 합성 패드가 깔립니다. 가사 보컬은 포함되지 않습니다.
공간감은 녹음된 룸이 아니라, 시드로 만든 임펄스를 컨볼루션한 리버브입니다.
가사는 로컬 템플릿 초안이며, AI API를 호출하지 않습니다.
보컬 및 완성 음원을 만들려면 프롬프트와 가사를 별도의 음악 제작 서비스로 가져가세요.
이 도구 자체에는 ChatGPT 채팅이나 외부 음악 생성 서비스가 연결되어 있지 않습니다.
곡의 흐름은 그 데모가 실제로 연주하는 구성입니다. 시드가 곡 콘셉트(형식, 코드, 모티프, 그루브, 반주, 인트로·아웃트로)를 고르고, 다른 느낌으로는 그 콘셉트만 다시 뽑습니다. 변주 버튼은 장르 범위 안에서 조성과 템포도 조금 옮깁니다.
1.6 이전에 저장한 프로젝트에는 `planner:"concept"`가 없습니다. 그 파일은 1.4 작곡으로 다시 연주되어 예전 소리에 가깝습니다. 데모 만들기, 변주, 다른 느낌으로를 누르면 1.6 콘셉트로 다시 쓰고, 그때는 같은 시드라도 1.4.1과 같지 않습니다. 프로젝트 JSON 버전은 1입니다.
프로젝트와 플레이리스트는 브라우저의 localStorage에 저장됩니다. 파일 주소, 브라우저, 기기가 바뀌면 보이지 않을 수 있습니다.
중요한 버전은 항상 JSON으로 보관하세요. 브라우저 데이터를 지우면 로컬 저장도 지워집니다.
브라우저가 로컬 파일 저장 또는 클립보드를 차단하면 JSON 내보내기와 수동 복사를 사용하세요.
모든 데이터는 이 브라우저 안에만 있습니다. 분석 도구, 쿠키, 네트워크 호출은 없습니다.
공개 사이트는 같은 주소의 앱 파일만 기기에 저장해 오프라인으로 다시 열 수 있습니다. 곡과 설정은 전송되지 않습니다.
단일 HTML 파일에는 외부 네트워크 요청이 없고, 서비스 워커도 등록하지 않습니다.
바닥글에 버전과 개인정보 안내가 있습니다. 없는 주소는 `404.html`로 안내합니다.

## 개발

`dist/`에는 모듈 형태의 HTML, CSS, JavaScript 소스가 있습니다.

```bash
npm run build   # release/SONORI.html 과 release/site 재생성
npm run check   # 작곡, 제작안, 라이브러리, 프리셋, 다양성, 단독 번들, 공개 페이지 검사
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

Choose one genre and mood — Lo-fi, Pop, R&B, Ambient, Ballad, EDM, Acoustic, Cinematic, Modern Rock, Dawn, Night, City Pop, Trap, House, Bossa Nova, or Reggaeton — and the next sketch uses that choice together with its tempo, key, scale color, synth voicing, and drum pattern. Mood can still be adjusted inside the chosen genre. Modern Rock sits near 78 BPM, with piano, clean-guitar-style arpeggios, warm pads, and a quiet verse that opens into a fuller chorus. Trap is a half-time 808 at 140 BPM with hi-hat rolls, House is a 124 BPM dorian loop with shuffled 16th hats and offbeat open hats, EDM is a straight 128 BPM build and drop, Bossa Nova is a light syncopated nylon voice with ii–V color near 130, and Reggaeton uses a dembow. Generate an instrumental demo, then use the bottom player for play/pause, previous/next, seek, repeat, and shuffle. Each new sketch gets a song concept: form (verse-chorus, AABA, through-composed, or build/drop), a mood-weighted progression, a motif developed by inversion, retrograde, and rhythmic displacement, a groove, and its own intro, outro, and dynamic arc. The stage summarizes that concept. **다른 느낌으로** re-rolls only the concept. **변주** also moves tempo and key a little inside that genre’s range. The same seed and planner always rebuild the same sketch. Projects saved before 1.6 omit `planner:"concept"` and play back on the 1.4 composer; making a demo upgrades them to the 1.6 concept, which will not match the 1.4.1 performance of that seed. Project JSON stays version 1. Words such as chorus, space, or bridge in the topic and notes steer the form. Toggle melody, chords, bass, drums, and an optional wordless oo/ah hum. The hum is formant synthesis, not sung lyrics. Edit the lyric draft, copy an English production prompt, and export WAV, MIDI, text, or project JSON. Audio is synthesized in the browser, including a convolution reverb from a generated impulse. Nothing is streamed, and the app does not call an AI or music-generation API.

All data stays in this browser. There are no analytics, cookies, or network calls. On the public site, only this site’s own files may be saved on the device so the app can open offline. Songs and settings are never sent. The downloadable HTML file does not register a service worker. The footer shows v1.6.0, a short what’s-new line, the privacy note, and a Support / 후원 link to the external Ko-fi page.

Projects and playlists are stored in this browser’s localStorage (up to 30 sketch versions). Sketches saved by version 1.0 stay in the library. Export JSON for any version you want to keep. A full storage quota or private mode shows a notice instead of failing silently, and destructive deletes ask for confirmation.

Copyright © 2026 ChamomileGrey. See [LICENSE](LICENSE). Permission requests: chamomilegrey.official@gmail.com. Support: [ko-fi.com/chamomilegrey](https://ko-fi.com/chamomilegrey).
