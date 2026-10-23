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
3. 연주 데모를 재생하고 멜로디·코드·베이스·드럼을 켜고 끄며 다듬으세요.
4. 가사 노트에 초안을 고치거나 함께 쓴 가사를 붙여 넣으세요.
5. 제작 프롬프트를 복사하거나 WAV·MIDI·TXT·프로젝트 JSON으로 내보내세요.

## 지원 기능

- Lo-fi, Pop, R&B, Ambient 및 네 가지 분위기
- 72~140 BPM, 6개 조성, 8/16/32마디 데모
- 재생·일시정지·처음부터·새 멜로디·음량·악기별 켜기/끄기
- 편집 가능한 템플릿 가사, 영어 음악 제작 프롬프트, 곡 구성 제안
- 최대 30개 프로젝트 버전의 브라우저 저장, JSON 내보내기/불러오기
- 44.1 kHz stereo PCM WAV 및 각 파트가 나뉜 MIDI 파일

## 범위와 보관

음악은 브라우저 합성 악기로 만든 작곡 스케치입니다. 샘플 기반 실제 악기나 보컬 음원은 아닙니다.
가사는 로컬 템플릿 초안이며, AI API를 호출하지 않습니다.
보컬 및 완성 음원을 만들려면 프롬프트와 가사를 별도의 음악 제작 서비스로 가져가세요.
이 도구 자체에는 ChatGPT 채팅이나 외부 음악 생성 서비스가 연결되어 있지 않습니다.
곡의 흐름은 제작 구성 제안이며, 오디오 엔진은 모티프 변주와 다이내믹으로 데모를 만듭니다.
프로젝트는 브라우저의 localStorage에 저장됩니다. 파일 주소, 브라우저, 기기가 바뀌면 보이지 않을 수 있습니다.
중요한 버전은 항상 JSON으로 보관하세요. 브라우저 데이터를 지우면 로컬 저장도 지워집니다.
브라우저가 로컬 파일 저장 또는 클립보드를 차단하면 JSON 내보내기와 수동 복사를 사용하세요.
단일 HTML 파일에는 외부 네트워크 요청이 없습니다.

## 개발

`dist/`에는 모듈 형태의 HTML, CSS, JavaScript 소스가 있습니다.

```bash
npm run build   # node build-standalone.mjs — release/SONORI.html 재생성
npm run check   # 작곡 이벤트, MIDI/WAV, 제작안·가사, 단독 번들 검사
```

개발 중 `dist/index.html`을 볼 때는 정적 HTTP 서버로 제공하세요. 단독 HTML로 묶을 때 외부 글꼴 불러오기는 제거됩니다.

## 배포

`main`에 반영되면 GitHub Actions가 `npm run build`와 `npm run check`를 실행한 뒤, `release/SONORI.html`을 `index.html`로 GitHub Pages에 배포합니다.

사이트가 열리려면 저장소에서 **Settings → Pages → Build and deployment → Source**를 **GitHub Actions**로 한 번 지정해야 합니다.

## 라이선스

Copyright © 2026 캐모마일그레이 (ChamomileGrey). All rights reserved.

앱은 개인적·상업적 목적으로 무료로 사용할 수 있습니다. 앱으로 만든 음악과 파일도 자유롭게 쓸 수 있습니다. 코드의 재배포·판매·수정은 저작권자의 사전 서면 허락이 필요합니다. 자세한 조건은 [LICENSE](LICENSE)를 보세요.

허락 문의: chamomilegrey.official@gmail.com

## English

SONORI is a single-file browser studio for sketching a song from a mood. Open the [live site](https://chamomilegrey.github.io/SONORI/) or `release/SONORI.html` in a current desktop browser. There is no install, account, API key, or server.

Choose a genre, mood, tempo, key, and topic, then generate an instrumental demo. Toggle melody, chords, bass, and drums, edit the lyric draft, copy an English production prompt, and export WAV, MIDI, text, or project JSON. Audio is synthesized in the browser. Lyrics are local templates. The app does not call an AI or music-generation API.

Projects are stored in this browser’s localStorage (up to 30 versions). Export JSON for any version you want to keep.

Copyright © 2026 ChamomileGrey. See [LICENSE](LICENSE). Permission requests: chamomilegrey.official@gmail.com.
