# Changelog

## 1.3.0 — 2026-10-24

다섯 장르와, 공개 사이트를 열 때 필요한 안내를 더함.

### 추가

- 시티팝, 트랩, 하우스, 보사노바, 레게톤 프리셋. 각각 코드 진행, 그루브 변주, 스윙 범위, 신스 음색을 가짐
- 트랩은 140 BPM의 하프타임 808과 하이햇 롤, 하우스는 124 BPM의 4/4와 오프비트 오픈햇, 보사노바는 싱코페이션과 ii–V, 레게톤은 뎀보우
- 공개 페이지의 제목, 한국어·영어 설명, Open Graph, Twitter 카드, 캐노니컬 주소, 파비콘, 홈 화면 아이콘
- 같은 출처만 허용하는 매니페스트와 버전 있는 서비스 워커. 단일 HTML은 이전과 같이 네트워크를 열지 않음
- 없는 주소의 404, robots.txt, sitemap.xml
- 오류 안내, 오디오를 지원하지 않는 브라우저 안내, 저장 공간이 가득 찼거나 개인정보 보호 모드일 때의 안내, 삭제 전 확인
- 한국어·영어 개인정보 안내. 데이터는 브라우저 안에만 있고 분석 도구, 쿠키, 네트워크 호출은 없음
- 바닥글의 v1.3.0과 새로운 점
- 확인된 후원 주소 https://ko-fi.com/chamomilegrey. 바닥글의 Support / 후원은 새 탭의 일반 링크이고, 위젯이나 외부 스크립트는 없음
- SECURITY.md, 실행 전 확인할 일을 적은 docs/LAUNCH_CHECKLIST.md

### 유지

- 저장한 프로젝트 JSON(`sonori-project` 버전 1)과 기존 스케치
- 같은 시드는 같은 스케치. 이전 장르의 시드 결과도 그대로
- 단일 HTML의 엄격한 CSP. 공개 페이지의 CSP는 같은 출처의 앱 파일만 허용

## English

Five genre presets — City Pop, Trap, House, Bossa Nova, and Reggaeton — each with its own progressions, groove variants, swing range, and synth voice. The public site now has share metadata, an offline app shell, a privacy note, and clearer failure messages. The footer Support / 후원 link opens https://ko-fi.com/chamomilegrey in a new tab. It is a plain link, with no widget or script. Saved projects and older seeds are unchanged. The downloadable HTML file still makes no network requests.

## 1.2.0 — 2026-10-24

같은 설정에서도 스케치가 서로 다르게 들리도록 작곡을 넓힘.

### 추가

- 스케치마다 시드로 고정되는 코드 진행 뱅크. 분위기별 여섯 가지 다이아토닉 진행과, 일부 시드의 빌린 코드
- 인트로·벌스·프리·후렴·브리지·아웃트로 길이. 주제와 메모의 후렴·여백·브리지·상승 표현이 구성을 바꿈
- 윤곽(아치·상승·하강·물결·인접)과 리듬 세포를 반복하고 변주하는 멜로디. 섹션마다 음역과 에너지가 달라짐
- 장르별 드럼 그루브 네 가지와 섹션 끝 필. 스윙은 장르의 범위 안에서 시드마다 움직임
- 코드 텍스처(지속음·스타브·분산·스트럼), 베이스 패턴, 필터·어택·넓은 보이싱
- 재생 줄의 **변주** 버튼. 같은 이야기에서 시드를 다시 뽑고, 조성과 템포를 장르 범위 안에서 조금 옮김
- `npm run check`의 다양성 검사. 같은 시드는 같은 스케치를 다시 만듦

### 유지

- 저장한 프로젝트 JSON(`sonori-project` 버전 1)과 기존 스케치 불러오기
- 고른 템포·조성으로 데모를 만들면 그 값이 유지됨. 변주 버튼만 장르 범위 안에서 조성과 템포를 옮김
- 단일 HTML, 엄격한 CSP, 외부 의존성 없음

## English

Sketches with the same genre and mood now pick different progressions, forms, motifs, grooves, swing, and synth color from the seed. A labeled re-roll button generates another variation. The same seed still repeats the same sketch, and saved projects still open.

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
