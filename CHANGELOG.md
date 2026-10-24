# Changelog

## 1.1.0 — 2026-10-23

라이브러리, 하단 재생 바, 장르·무드 프리셋.

### 추가

- 저장한 스케치를 카드로 보는 라이브러리. 제목, 날짜, 템포, 조성, 장르를 보여주고 검색·정렬할 수 있음
- 플레이리스트 만들기, 이름 바꾸기, 삭제, 스케치 담기·빼기·순서 바꾸기
- 기존 `sonori.studio.v1` 저장분을 지우지 않고 플레이리스트 필드를 덧붙이는 이전
- 화면 아래에 남는 재생 바: 재생/일시정지, 이전·다음, 위치, 반복(끔/전체/한 곡), 셔플, 현재 제목
- Lo-fi, Ballad, EDM, Acoustic, Cinematic 프리셋. 템포, 조성, 스케일 색채, 신스 보이싱, 드럼 패턴을 새 스케치나 현재 곡에 적용
- Ballad, EDM, Acoustic, Cinematic 합성 보이싱과 드럼 패턴
- 라이브러리·프리셋·반복/셔플 큐 검사

### 유지

- 단일 HTML, 엄격한 CSP, 외부 음원·글꼴·스크립트 없음
- WAV, MIDI, TXT, JSON 내보내기와 기존 작업실 흐름

## English

Library and playlists, a persistent player bar with repeat and shuffle, and five original genre presets. Saved 1.0 sketches are kept.

## 1.0.0 — 2026-10-23

첫 공개.

### 추가

- 설치 없이 브라우저에서 열리는 단일 HTML 곡 스케치 작업실 (`release/SONORI.html`)
- Lo-fi, Pop, R&B, Ambient와 따뜻한·몽환적인·경쾌한·아련한 분위기
- 72–140 BPM, C·D·E·F·G·A 조성, 8·16·32마디 연주 데모
- 재생, 일시정지, 처음부터, 새 멜로디, 음량, 멜로디·코드·베이스·드럼 켜기/끄기
- 고칠 수 있는 템플릿 가사, 영어 제작 프롬프트, 곡 구성 제안
- 이 브라우저에 최대 30개 프로젝트 버전 저장, JSON 내보내기/불러오기
- 44.1 kHz 스테레오 PCM WAV와 파트가 나뉜 MIDI 내보내기
- GitHub Actions에서 `npm run build`와 `npm run check` 후 GitHub Pages로 배포

## English

First public release of the single-file SONORI song-sketch studio, with browser playback, lyric and prompt drafts, WAV/MIDI/JSON export, and GitHub Pages deployment.
