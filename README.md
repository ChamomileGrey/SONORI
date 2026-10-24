# SONORI — 취향을 노래로

설치·가입·API 키·서버 없이 브라우저에서 열리는 독립형 음악 작업실입니다.
장르와 분위기를 고르면 연주 데모, 가사 초안, 제작 프롬프트를 한곳에서 만듭니다.

만든 이: **캐모마일그레이 (ChamomileGrey)**

## 시작하기

공개 사이트: <https://chamomilegrey.github.io/SONORI/>

파일을 직접 쓸 때는 `release/SONORI.html`을 최신 Chrome, Edge, Firefox 또는 Safari에서 여세요.
데스크톱 브라우저를 권장합니다. 파일 미리보기 앱은 소리 재생을 막을 수 있습니다.

## 사용 흐름

1. “함께 곡의 방향 정하기”의 상담용 내용을 ChatGPT 대화에 붙여 넣고 상의하세요.
2. 정한 장르·분위기·템포·조성·주제를 입력하고 “데모 만들기”를 누르세요.
3. 연주 데모를 재생하고 멜로디·코드·베이스·드럼을 켜고 끄며 다듬으세요. 화면 아래 재생 바에서 일시정지, 이전·다음, 반복, 셔플을 쓸 수 있어요. 같은 이야기가 너무 비슷하면 **변주**를 눌러 코드·멜로디·그루브·구성을 다시 뽑으세요.
4. 가사 노트에 초안을 고치거나 함께 쓴 가사를 붙여 넣으세요.
5. 마음에 드는 버전은 라이브러리에 저장하고, 플레이리스트로 순서를 정하세요.
6. 제작 프롬프트를 복사하거나 WAV·MIDI·TXT·프로젝트 JSON으로 내보내세요.

## 지원 기능

- Lo-fi, Pop, R&B, Ambient, Ballad, EDM, Acoustic, Cinematic, City Pop, Trap, House, Bossa Nova, Reggaeton
- 장르·무드 프리셋 열 가지: Lo-fi, Ballad, EDM, Acoustic, Cinematic, City Pop, Trap, House, Bossa Nova, Reggaeton. 각각 템포, 조성, 스케일 색채, 신스 보이싱, 드럼 패턴을 제안하고 새 스케치나 현재 곡에 적용할 수 있음
- 트랩은 140 BPM의 하프타임 808과 하이햇 롤, 하우스는 124 BPM의 4/4와 오프비트 오픈햇, 보사노바는 싱코페이션과 ii–V, 레게톤은 뎀보우, 시티팝은 스윙 범위 안의 코드 텍스처
- 72~140 BPM, 6개 조성, 메이저·마이너·도리안·펜타토닉 색채, 8/16/32마디 데모
- 재생·일시정지·처음부터·변주 다시 뽑기·음량·악기별 켜기/끄기
- 시드로 고정되는 코드 진행, 곡 구성, 모티프 변주, 드럼 그루브, 스윙, 신스 색. 같은 시드는 항상 같은 스케치
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
가사는 로컬 템플릿 초안이며, AI API를 호출하지 않습니다.
보컬 및 완성 음원을 만들려면 프롬프트와 가사를 별도의 음악 제작 서비스로 가져가세요.
이 도구 자체에는 ChatGPT 채팅이나 외부 음악 생성 서비스가 연결되어 있지 않습니다.
곡의 흐름은 그 데모가 실제로 연주하는 구성입니다. 시드가 코드, 모티프, 그루브, 스윙, 음색을 고르고, 변주 버튼은 장르 범위 안에서 조성과 템포도 조금 옮깁니다.
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

Choose a genre, mood, tempo, key, and topic, or start from a Lo-fi, Ballad, EDM, Acoustic, Cinematic, City Pop, Trap, House, Bossa Nova, or Reggaeton preset. Each preset suggests a tempo, key, scale color, synth voicing, and drum pattern, and can be applied to the sketch you are already editing. Trap is a half-time 808 at 140 BPM with hi-hat rolls, House is 4/4 near 124 with offbeat open hats, Bossa Nova is a light syncopated nylon voice with ii–V color near 130, and Reggaeton uses a dembow. Generate an instrumental demo, then use the bottom player for play/pause, previous/next, seek, repeat, and shuffle. Press **변주** to re-roll the seed: harmony, motif, groove, form, swing, and synth color change, and tempo and key move a little inside that genre’s range. The same seed always rebuilds the same sketch, including seeds from earlier genres. Words such as chorus, space, or bridge in the topic and notes steer the form. Toggle melody, chords, bass, and drums, edit the lyric draft, copy an English production prompt, and export WAV, MIDI, text, or project JSON. Audio is synthesized in the browser. Nothing is streamed, and the app does not call an AI or music-generation API.

All data stays in this browser. There are no analytics, cookies, or network calls. On the public site, only this site’s own files may be saved on the device so the app can open offline. Songs and settings are never sent. The downloadable HTML file does not register a service worker. The footer shows v1.3.0, a short what’s-new line, the privacy note, and a Support / 후원 link to the external Ko-fi page.

Projects and playlists are stored in this browser’s localStorage (up to 30 sketch versions). Sketches saved by version 1.0 stay in the library. Export JSON for any version you want to keep. A full storage quota or private mode shows a notice instead of failing silently, and destructive deletes ask for confirmation.

Copyright © 2026 ChamomileGrey. See [LICENSE](LICENSE). Permission requests: chamomilegrey.official@gmail.com.
