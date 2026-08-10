# 02 — EPIC & STORY 로드맵 (heichitty-chat-client)

> 이 문서는 **heichitty-chat-client**(웹 기반 HeiChitty Chat을 띄우는 데스크톱·모바일 뷰어)의 단계화 로드맵이다.
> 채팅·인증·실시간 로직은 원격 **HeiChitty Chat 서버**가 담당하고, 이 앱은 그 웹을 띄우는 **얇은 뷰어**다 — 상태를 거의 갖지 않는다.
> 연계: `../../CLAUDE.md`(작업원칙·아키텍처) · `../../README.md`(4플랫폼 빌드·실행) · `capacitor.config.json`(설정) · `electron/src/setup.ts`(데스크톱 네비게이션).
> 개발방식 = **walking skeleton**(뼈대 → 살). 뷰어는 얇으므로 EPIC을 적게 둔다.
> **진행현황 단일소스 = `git log`(`CE#-S#`) + 본 문서 체크박스.**

## 범위 결정 (확정/보류)

| 항목 | 결정 | 상태 |
|---|---|---|
| 대상 플랫폼 | Windows · macOS · Android · iOS (단일 Capacitor 코드베이스) | ✅ 확정 |
| 프레임워크 | Capacitor (모바일 네이티브 + 데스크톱 `@capacitor-community/electron`) | ✅ 확정 |
| 서버 주소 | **빌드 타임 config 고정**(`web/config.js`의 `window.HEICHITTY_SERVER`) · 사용자 비노출(config-only) · 임시 placeholder `http://127.0.0.1:3000` · 운영 도메인 미정 | ✅ 방식 확정 (2026-06-22: 설정가능 URL→config 고정으로 변경) |
| 부가기능 v1 | **푸시 알림(CE4)·자동 업데이트(CE5) 포함** | ✅ 확정 |
| git 저장소·브랜치 | private GitHub `HohyeonKim592/heichitty-chat-client` · `Hohyeon.Kim`(작업) → `main`(기본) 병합 — 형제 chitty 리포 관례 승계 | ✅ 확정 (2026-08-10) |
| 모바일 배포 채널 | 사내배포 vs 공개 스토어 — **미정** | 🔴 G-DIST 보류 |

## EPIC 개요

접두어 `CE` = Client EPIC.

| EPIC | 목표 | 상태 |
|---|---|---|
| **CE0** 프로젝트 골격 | Capacitor scaffold · 웹 셸 런처 · android/electron 추가 · 빌드 통과 | ✅ 대부분 완료 (iOS 보류) |
| **CE1** 뷰어 코어(접속 셸) | config 서버 자동접속 · 최상위 네비 · 연결실패/오프라인/재시도 동선 (config-only) | ✅ 대부분 완료 |
| **CE2** 플랫폼 빌드·배포 | Desktop 설치파일 · Android 서명빌드 · iOS 추가·서명 | 예정 |
| **CE3** 구성·브랜딩 | appId 확정 · 허용도메인 좁히기 · 아이콘/스플래시/표시명 · 환경 프로파일 | 예정 |
| **CE4** 네이티브 통합 + 푸시 | 뒤로가기 · 외부링크 · 다운로드 · 딥링크 · **푸시 알림** | v1 (예정) |
| **CE5** 자동 업데이트 | Desktop electron-updater · 모바일 업데이트 전략 · 웹자산 OTA(선택) | v1 (예정) |
| **CE6** 품질·게이트 | lint · 셸 스모크 · 4플랫폼 빌드 검증 · pre-push | 후보 |

## Story 상세

> `[x]` 완료 · `[~]` 부분/진행 · `[ ]` 미착수. 〔G-…〕 = 결정 게이트 의존.

### CE0 — 프로젝트 골격
- [x] `CE0-S1` Capacitor scaffold — `package.json`·`capacitor.config.json`·core/cli 설치
- [x] `CE0-S2` git 저장소 — init + **원격·브랜치·커밋 모델 확정(2026-08-10)**: private GitHub `HohyeonKim592/heichitty-chat-client`(default `main`) · `Hohyeon.Kim`에서 작업 후 `main` 병합 · 초기 임포트 단일 커밋 `460d89f`(83 files)
- [x] `CE0-S3` 웹 셸 런처 `web/` — `index.html`/`app.js`/`style.css`, 외부화·XSS-safe(`textContent`)
- [x] `CE0-S4` Android 플랫폼 추가 (`cap add android`)
- [x] `CE0-S5` Desktop(Electron) 플랫폼 추가 — `cap add @capacitor-community/electron` · `npm run build` 통과(`skipLibCheck`) · 뷰어용 네비게이션 완화(`isAllowedTarget`)
- [ ] `CE0-S6` iOS 플랫폼 추가 — `npm run add:ios` 〔G-IOS〕 *(현 머신에 Xcode·CocoaPods 부재로 보류)*

### CE1 — 뷰어 코어(접속 셸)
> **2026-06-22 결정 — config-only**: 서버 주소를 사용자에게 노출하지 않고 빌드 타임 config(`web/config.js`)로 고정. 런처(주소 입력)·자동접속 토글·서버변경 기능 제거. 접속은 `location.replace`로 셸을 히스토리에 남기지 않음 → 뒤로가기 바운스 문제 자체가 소멸(`back_forward`/`#settings` 감지 로직 불필요).
> 설계 핵심(코드 = `web/app.js`·`web/config.js`·`electron/src/setup.ts`): config 주소로 **자동 접속** + 이동 전 **사전 도달성 점검** + 실패 시 상태화면 **재시도**.
> **플랫폼 설정 의존**(CE3): http 서버(개발 localhost 등) 접속 시 Android `usesCleartextTraffic`·iOS ATS 예외 필요(https 운영서버면 무관).
- [~] `CE1-S1` ~~서버주소 입력·저장 + 자동접속 토글~~ → **폐기(config-only)**. 대체: `CE1-S1'` 빌드 타임 config 주입(`web/config.js`) + config 주소 자동접속
- [x] `CE1-S2` 최상위 네비게이션 진입 — HeiChitty Chat이 `X-Frame-Options`로 iframe을 막으므로 top-level `location` 이동(`location.replace`)
- [x] `CE1-S3` **연결 실패 처리** — 이동 전 `preflight`(no-cors fetch + 5s 타임아웃)로 도달성 점검 + `navigator.onLine` 가드 → 실패 시 상태화면에 머물며 **재시도** 제공. online 복귀 시 자동 재시도. 검증은 CE6
- [~] `CE1-S4` ~~서버 변경 재진입~~ → **폐기(config-only, 서버변경 미노출)**. Desktop "서버 변경" 메뉴·바운스 방지 로직 함께 제거
- [x] `CE1-S5` **로딩·오프라인 표시** — 스플래시 상태(`접속 확인 중…`/`접속 중…`) + online/offline 배너 + 도달 실패 시 상태화면. 검증은 CE6

### CE2 — 플랫폼 빌드·배포
- [ ] `CE2-S1` **Desktop 설치파일** — `electron:pack`/`electron:make`로 Win/Mac 산출물 생성·실행 검증 (`electron-builder.config.json`)
- [ ] `CE2-S2` **Android 서명 빌드** — release keystore + AAB/APK 〔G-SIGN〕
- [ ] `CE2-S3` **iOS 빌드·서명** — Xcode 프로젝트(CE0-S6 후) + Apple 개발자계정·프로비저닝 〔G-IOS·G-SIGN〕
- [ ] `CE2-S4` 배포 채널 확정·산출물 정의 〔G-DIST〕

### CE3 — 구성·브랜딩
- [x] `CE3-S1` **appId 확정** — `kr.co.heichitty.chat` (2026-08-10 확정, android 네이티브 패키지까지 반영) 〔G-ID〕
- [ ] `CE3-S2` **`allowNavigation` 좁히기** — 현재 `["*"]` → 운영 서버 도메인 한정 〔G-DOM〕. *config-only 결정으로 즉시 진행 가능 — `web/config.js` 도메인과 동일 값으로 좁힐 것*
- [ ] `CE3-S3` 앱 아이콘·스플래시 (`@capacitor/assets` 등으로 4플랫폼 생성)
- [ ] `CE3-S4` 표시명·버전·환경(개발/운영) 프로파일 — `appName`·버전 일원화, 빌드별 서버 기본값(선택)

### CE4 — 네이티브 통합 + 푸시 *(v1)*
- [ ] `CE4-S1` Android 하드웨어 뒤로가기 — 원격 페이지 히스토리/앱 종료 정책
- [ ] `CE4-S2` 외부 링크 → 시스템 브라우저 (`setWindowOpenHandler`/모바일 동등 처리)
- [ ] `CE4-S3` 파일 다운로드/업로드 브리지 — 첨부 송수신(HeiChitty Chat E6 대응)
- [ ] `CE4-S4` 딥링크/유니버설 링크 — 특정 방·메시지로 진입
- [ ] `CE4-S5` **푸시 알림** — FCM(Android)·APNs(iOS) 토큰 등록·수신·탭 이동 〔**서버측 발송 연동 의존**〕

### CE5 — 자동 업데이트 *(v1)*
- [ ] `CE5-S1` **Desktop** — `electron-updater`(피드 URL·서명·롤백)
- [ ] `CE5-S2` **모바일** — 스토어/사내 배포에 맞춘 업데이트 전략 + 강제 최소버전(원격 게이트) 〔G-DIST 의존〕
- [ ] `CE5-S3` 웹자산 OTA(선택) — `web/` 핫업데이트(Capacitor live-update류) 검토

### CE6 — 품질·게이트
- [x] `CE6-S1` lint — 셸 JS 구문 검사 (`npm run lint` = `node --check web/app.js`)
- [x] `CE6-S2` **셸 로직 스모크** — `test/ce1-shell.mjs`(zero-dep, DOM 목으로 실제 `app.js` 구동): config 정규화·자동접속(`location.replace`)·오프라인·preflight 실패·재시도·online 자동재시도 = **9/9 PASS** (`npm test` = `npm run smoke`)
- [ ] `CE6-S3` 4플랫폼 빌드 검증 — android assemble · electron build · (가능 시 iOS)
- [ ] `CE6-S4` pre-push 훅 — lint+스모크 (HeiChitty Chat E0-S3 관례 승계). *CE0-S2로 원격이 생겨 착수 가능*

## 결정 게이트

| 게이트 | 시점/Story | 통과 기준 | 비고 |
|---|---|---|---|
| **G-ID** appId 확정 | CE3-S1 (배포 전) | 정식 번들 ID 확정 | ✅ 통과 — `kr.co.heichitty.chat`(2026-08-10). Android 패키지명·iOS Bundle ID 공용 |
| **G-DOM** 허용 도메인 | CE3-S2 | `allowNavigation`을 운영 도메인으로 한정 | 현재 `["*"]` 광역 |
| **G-IOS** iOS 빌드환경 | CE0-S6/CE2-S3 | Mac+Xcode+CocoaPods 확보, `cap add ios` 성공 | 현 머신 부재 |
| **G-SIGN** 코드 서명 | CE2-S2/S3 | Android keystore · Apple 인증서 · 데스크톱 서명 | 배포 산출물 필수 |
| **G-DIST** 배포 채널 | CE2-S4 | 사내배포 / 공개 스토어 택일 | 🔴 미정 — CE2·CE5-S2 내용 좌우 |

## 진행 순서 (Wave)

- **Wave 0 〔결정〕** ~~G-ID(appId)~~ ✅ 통과(2026-08-10) · G-DOM(도메인)·G-DIST(배포채널) 방향 못 박기
- **Wave 1** CE1 뷰어 코어 완성(config-only: S1' config 주입·S3 연결실패·S5 로딩) + CE3 구성·브랜딩(appId·allowNavigation 좁히기·아이콘/스플래시/표시명)
- **Wave 2** CE0-S6 iOS 추가 + CE2 플랫폼 빌드·서명(Desktop→Android→iOS)
- **Wave 3** CE4 네이티브 통합·푸시 + CE5 자동 업데이트
- **Wave 4** CE6 품질·게이트

## 검증 현황 (2026-06-22 config-only 재설계 반영)

> 방식: 자동화 라이브러리 부재 → 단위는 `npm test`(셸 스모크). 수동은 실제 `web/` 셸을 Electron 창에 로드해 사용자처럼 동작 확인.
> ⚠️ **이전(2026-06-20) 런처 기반 수동 검증은 config-only 재설계로 무효** — 런처 입력·자동접속 토글·서버변경·`back_forward`/`#settings` 분기가 제거됨. 아래 수동 항목은 **재검증 대상**.

**검증 완료**
- ✅ 셸 스모크 9/9 (`npm test`) — config 정규화(로컬 http 포함)·자동접속(`location.replace`)·오프라인·preflight 실패·**재시도**·online 자동재시도·config 누락/무효 안전망

**남은 검증 후보 (수동·실기)**
- [ ] **Desktop/Electron 재검증** — config 주소 자동접속 → 실 HeiChitty Chat 로드, 도달 실패 시 상태화면+재시도, 오프라인 배너
- [ ] **실 HeiChitty Chat 접속 → 로그인 → 채팅 화면 진입** 끝단 동선(config-only 경로)
- [ ] **Android 실기** — 첫 화면에서 원격으로 자동접속(`replace`로 셸 미잔류) · 하드웨어 뒤로가기 정책은 CE4-S1
- [ ] **iOS** — 자동접속 동선 (iOS 빌드환경 확보 후, CE0-S6/CE2-S3)
- [ ] 로그인 후 메시지 송수신·방 진입 등 채팅 기능 전반(서버 책임이나 뷰어 통과 확인)
- [ ] Android/iOS **빌드 산출물 실행**(CE2) · http 서버 접속 시 cleartext/ATS 설정(CE3)

## 외부 의존 (서버측)

- **푸시(CE4-S5)** — 서버가 이벤트 발생 시 FCM/APNs로 발송해야 함(HeiChitty Chat 측 작업). 클라는 토큰 등록·수신·라우팅 담당.
- **첨부(CE4-S3)** — HeiChitty Chat E6(파일·첨부) 진척에 맞춰 동작.
- **강제 최소버전(CE5-S2)** — 서버가 클라 최소버전을 알려주는 엔드포인트가 있으면 연동.
