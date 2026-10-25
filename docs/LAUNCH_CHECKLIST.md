# 공개 전 확인 · Launch checklist

버전 1.6.0. 공개 주소는 <https://chamomilegrey.github.io/SONORI/> 입니다.

## 저장소에서 끝난 일

- [x] 시티팝, 트랩, 하우스, 보사노바, 레게톤. 각각 코드 진행, 그루브 변주, 스윙 범위, 신스 음색
- [x] 트랩은 140 BPM의 하프타임 808과 하이햇 롤, 하우스는 124 BPM의 도리안 루프와 셔플 16분음·오프비트 오픈햇, EDM은 128 BPM의 빌드와 드롭, 보사노바는 싱코페이션과 ii–V, 레게톤은 뎀보우
- [x] 같은 시드는 같은 스케치. 이전 장르의 시드 결과와 저장한 `sonori.studio.v1` / `sonori-project` 버전 1은 유지
- [x] 제목, 한국어·영어 설명, Open Graph, Twitter 카드, 캐노니컬 주소, `theme-color`
- [x] 저장소 안에서 만든 `og.png`, 파비콘, iOS 홈 화면용 `apple-touch-icon.png`
- [x] 매니페스트와 캐시 이름 `sonori-v1.6.0`인 서비스 워커. 단일 HTML은 서비스 워커를 등록하지 않음
- [x] `404.html`, `robots.txt`, `sitemap.xml`
- [x] 전역 오류 안내, AudioContext 미지원 안내, 저장 공간·개인정보 보호 모드 안내, 삭제 전 확인
- [x] 바닥글의 개인정보 안내, v1.6.0, 새로운 점. 데이터는 브라우저 안에만 있고 분석 도구·쿠키·네트워크 호출은 없음
- [x] 곡 콘셉트와 다른 느낌으로. `planner:"concept"`가 없는 저장본은 1.4 작곡으로 재생. 프로젝트 JSON 버전 1
- [x] 장르 · 무드 선택 하나. Pop, R&B, Ambient를 포함한 예전 장르 값은 `sonori.studio.v1`과 프로젝트 JSON 버전 1에서 그대로 열림
- [x] 대비, 포커스, 접근 이름, `prefers-reduced-motion`
- [x] `SECURITY.md`와 문의 메일 chamomilegrey.official@gmail.com
- [x] 후원 링크 https://ko-fi.com/chamomilegrey. 바닥글과 README의 일반 링크이며, 위젯과 외부 스크립트는 없음. `.github/FUNDING.yml`의 `ko_fi`는 chamomilegrey
- [x] `npm run check`

## 사람이 확인해야 하는 일

- [ ] 실제 iPhone에서 홈 화면에 추가하고, 비행기 모드로 다시 연 뒤, 데모가 재생되는지
- [ ] 실제 Android에서 설치하고, 오프라인으로 다시 연 뒤, 데모가 재생되는지
- [ ] ‘SONORI’ 상표 검색. 앱 이름과 충돌하는 등록이 있는지는 이 저장소에서 판단하지 않음
- [ ] [LICENSE](../LICENSE)의 사용·재배포 문구를 법률 검토

## 배포 스위치

사이트가 갱신되려면 저장소에서 **Settings → Pages → Build and deployment → Source**를 **GitHub Actions**로 지정해야 합니다. `main`에 반영되면 워크플로가 `release/site`를 배포합니다.
