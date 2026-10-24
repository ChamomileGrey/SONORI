# 보안 · Security

SONORI는 브라우저 안에서만 동작합니다. 서버, 계정, 분석 도구, 쿠키가 없습니다.

## 보고

취약점을 찾으면 [chamomilegrey.official@gmail.com](mailto:chamomilegrey.official@gmail.com)으로 먼저 알려 주세요.
공개 이슈에 재현 방법을 올리기 전에 메일을 보내 주세요. 확인에 필요한 브라우저와 재현 절차만 적으면 됩니다. 곡 파일이나 개인 메모는 보내지 않아도 됩니다.

## 이 앱이 지키는 것

- 내려받는 단일 HTML(`release/SONORI.html`)의 CSP는 `connect-src 'none'`입니다. 스크립트와 스타일은 그 파일 안에만 있습니다.
- 공개 페이지의 CSP는 같은 출처의 앱 파일만 허용합니다. 서비스 워커는 그 파일만 기기에 저장합니다.
- 곡, 가사, 플레이리스트는 이 브라우저의 `localStorage`(`sonori.studio.v1`)에만 있습니다. 프로젝트 JSON 형식은 `sonori-project` 버전 1입니다.
- 외부 스크립트, 글꼴, 분석 도구를 넣지 않습니다. 후원 링크도 넣지 않습니다.

## 범위 밖

브라우저의 저장 공간과 오디오 API는 이 저장소가 통제하지 않습니다.
개인정보 보호 모드에서는 저장이 막힐 수 있습니다. 그때는 내보내기의 프로젝트 JSON으로 작업을 보관하세요.

## English

SONORI runs only in the browser. There is no server, account, analytics, or cookies.

Report a vulnerability to chamomilegrey.official@gmail.com before posting a public reproduction. Include the browser and the steps. Song files and private notes are not required.

The downloadable HTML uses `connect-src 'none'`. The public site allows only same-origin app files, and its service worker caches only those files. Songs and settings stay in `localStorage`. Third-party scripts, fonts, analytics, and donation links are out of scope for this app.
