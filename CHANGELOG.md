# Changelog

## 1.6.0 — 2026-10-25

스케치마다 다른 곡 콘셉트.

1.4의 작곡은 무드당 예닐곱 개의 4마디 다이아토닉 루프, 벌스-후렴 형식 여덟 개, 코드톤에 붙인 윤곽 다섯 개, 곡 전체의 텍스처·베이스 하나, 그루브 네 개 안쪽으로 모여 있었다. 시드는 그 작은 풀 안의 자리와 한두 마디의 색채만 바꿨다. 코드 이름 문자열이 달라도 진행의 뼈대는 같은 경우가 많았다. 템포와 조성은 프리셋에 고정이다.

### 추가

- 곡 콘셉트. 시드가 형식(벌스-후렴, AABA, 통절, 빌드-드롭), 무드별 가중 코드 풀, 모티프와 그 전위·역행·리듬 이동·음정 도약, 그루브, 반주 질감, 베이스, 인트로·아웃트로, 다이내믹 호를 함께 고름
- 차용 코드와 관계조·딸림조·버금딸림조로의 브리지 전조. 스케일 검사가 고정된 시드 42와 99는 조 안의 음만 사용
- 화면의 곡 콘셉트 한 줄(형식, 진행, 그루브)과 **다른 느낌으로**. 템포와 조성은 두고 콘셉트만 다시 뽑음
- 다양성 검사가 1.4 작곡과 1.6 콘셉트의 수치를 나란히 출력

### 재생

- `planner`가 `"concept"`가 아닌 저장본은 1.4 작곡으로 다시 연주함. 저장 키는 `sonori.studio.v1`, 프로젝트 JSON은 버전 1
- 데모 만들기, 변주, 다른 느낌으로를 누르면 1.6 콘셉트로 다시 씀. 같은 시드라도 1.4.1의 연주와 같지 않음
- 변주는 예전처럼 장르 범위 안에서 조성과 템포를 조금 옮김

### 유지

- 같은 시드와 같은 설정, 같은 작곡 방식은 같은 스케치
- 단일 HTML, 엄격한 CSP(`connect-src 'none'`), 외부 의존성·샘플·네트워크 없음
- 브랜드 캐모마일그레이 (ChamomileGrey), Ko-fi https://ko-fi.com/chamomilegrey, 라이선스

## English

Sketches were clustering on a handful of four-bar diatonic loops, eight verse-chorus forms, five snapped contours, and one texture and bass line per song. 1.6 plans a song concept per seed: form, a larger mood-weighted progression, a motif developed by inversion, retrograde, displacement, and leap, plus groove, arrangement, intro, outro, and a dynamic arc. The stage shows that concept and can re-roll it with 다른 느낌으로 without moving tempo or key. Saved projects that do not set `planner` to `"concept"` still play through the 1.4 composer. Making a demo, a variation, or another feel writes the 1.6 concept and will not match the 1.4.1 performance of that seed. Storage stays `sonori.studio.v1` and project JSON stays version 1. Seeds 42 and 99 stay inside the preset scale.

## 1.4.1 — 2026-10-24

장르를 고르는 곳이 하나.

### 변경

- 장르 · 무드 프리셋 카드와 아래의 예전 장르 목록을 하나의 장르 · 무드 선택으로 합침
- 한 번 고르면 새 스케치의 장르와 함께 템포, 조성, 스케일, 보이싱, 음색이 맞춰짐
- 예전 목록에만 있던 Pop, R&B, Ambient를 같은 선택에 프리셋으로 넣음. 저장값의 장르 이름은 그대로
- 분위기는 고른 장르 안에서만 조정

### 유지

- 저장 키 `sonori.studio.v1`, 프로젝트 JSON 버전 1. 예전 장르 값도 불러옴
- 같은 시드와 같은 설정은 같은 스케치. 작곡 방식은 바꾸지 않음
- 단일 HTML, 엄격한 CSP, 외부 의존성과 네트워크 없음
- 브랜드 캐모마일그레이 (ChamomileGrey), Ko-fi, 라이선스

## English

The studio had two genre lists. There is now one genre and mood choice. Picking it sets the next sketch and that preset’s tempo, key, voicing, and timbre. Pop, R&B, and Ambient stay available. Saved projects still open as JSON version 1.

## 1.4.0 — 2026-10-24

따뜻하고 아련한 분위기, 더 넓은 공간, 가사 없는 허밍.

### 추가

- 감성 모던 록 프리셋. 78 BPM, I–V–vi–IV와 vi–IV–I–V 계열, sus4·add9 색채, 피아노와 클린 기타풍 아르페지오, 조용한 벌스에서 넓어지는 후렴, 여린 드럼
- 새벽 감성과 심야 로파이 프리셋
- 가사 없는 oo/ah 허밍 레이어. 포먼트 합성과 비브라토, 모음 글라이드. 레이어에서 켜고 끌 수 있음
- 생성된 임펄스를 쓰는 컨볼루션 리버브, 부드러운 컴프레서와 리미터, 더 따뜻한 신스
- 체크에 프리셋 진행·다이내믹, 허밍, 임펄스, 포먼트 검사

### 유지

- 템포 범위 72–140. 감성 모던 록은 그 안의 78 BPM
- 저장 키 `sonori.studio.v1`, 프로젝트 JSON 버전 1
- 같은 시드는 같은 스케치. 허밍을 꺼 두면 다른 레이어의 음은 그대로
- 단일 HTML, 엄격한 CSP, 외부 음원·네트워크 없음
- 브랜드 캐모마일그레이 (ChamomileGrey), Ko-fi, 라이선스
- 1.3의 시티팝·트랩·하우스·보사노바·레게톤과 공개 페이지(개인정보, 오프라인 앱, 404)는 그대로

## English

Atmospheric sketches: an original emotional modern-rock preset, two quieter night moods, a wordless formant hum, and a generated-impulse reverb with gentler dynamics. Saved projects stay on JSON version 1.
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
