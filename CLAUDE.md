# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# 작업원칙 (heichitty-chat-client)

이 파일은 본 작업경로에서 일하는 Claude Code 인스턴스의 작업방식 규칙입니다.
**HeiChitty Chat(웹 서버)와는 별개의 독립 경로**이며, 작업방식 원칙만 승계하고 서버의 구조·코드는 가져오지 않습니다.

이 클라이언트는 웹 기반 HeiChitty Chat을 **데스크톱·모바일에서 띄우는 뷰어**(Capacitor 웹뷰 래퍼)입니다.

> **이 파일은 매 세션 자동 로드 → lean 유지.** *작업방식 규칙*만 둔다. 프로젝트 구조·빌드·결정 등 특정 컨텍스트는 `README.md`/`docs/`에 두고 여기선 가리키기만 한다(끝 §컨텍스트 맵).

## 공통 작업원칙 승계 (원본 우선)

@../../claude작업원칙.md

> 위 공통 원칙(한글 응답·추측 금지·승인 우선·선언 영역제·스코프·Git·라이브러리 규칙)이 **모든 작업의 전제**다.
> 종전에 이 파일에 전문 복제해 두었던 §0~§6은 **원본이 단일 출처**이므로 제거했다(갱신 전파 누락 방지).
> 아래에는 원본에 없는 **이 프로젝트 고유 규칙과 강화 조항만** 남긴다. 원칙이 갱신되면 원본을 먼저 고친다.

## 0. 인코딩 (프로젝트 고유)
- **인코딩은 UTF-8(LF).** 소스·설정·문서 전부 UTF-8 기본. EUC-KR/CP949/UTF-16 쓰지 않는다.

## 1. 착수 승인 — 이 경로의 강화 조항
- 공통 원칙 §0(착수는 승인 이후)에 더해: **방향을 사용자가 고른 직후라도 곧바로 코딩하지 말고** "이 계획대로 착수할까요?"로 한 번 더 승인받는다.
- 계획용 최소 읽기/grep은 가능하나, **광범위한 다단계 코드 탐색을 자동 연쇄하지 말 것.**

## 3. 스코프 — 이 경로의 추가 조항
- **네이티브 플랫폼 폴더(`android/`, `ios/`, `electron/`)는 Capacitor가 생성한 산출물**이다. `npx cap add`/`cap sync`로 재생성·갱신되는 영역이므로 직접 수정은 최소화하고, 불가피하게 손댈 땐(예: 보안 핸들러 조정) 변경 의도를 주석으로 남긴다.

## 4. Git — 이 경로의 추가 조항
> 일반 Git 규칙(상태변경은 명시 지시 시에만 · `git add` 명시 경로 · main 직접 작업 금지 · destructive 재확인 · **AI 저작 흔적 금지**)은 **공통 원칙 §3**이 정본이다.

- **브랜치 모델** — 원격은 private `HohyeonKim592/heichitty-chat-client`(default `main`). 작업은 **`Hohyeon.Kim` 브랜치**에서 하고 완료분만 `main`에 병합한다(형제 chitty 리포 관례).

## 7. 진행 가시화 (Task 목록) → 공통 원칙 §8
> 이 경로에서 쓰던 조항이 2026-08-10 공통 원본 **§8**로 승격되어 전 프로젝트에 적용된다. 내용은 원본이 정본 — 여기서 중복 기술하지 않는다.

## 아키텍처 개요 (big picture)

뼈대는 얇게. 이 앱은 **상태를 거의 갖지 않는 뷰어**다 — 채팅 로직·인증·소켓은 전부 원격 HeiChitty Chat 웹이 담당하고, 클라이언트는 그 웹을 띄울 뿐이다.

- **진입 셸** `web/` — 바닐라 JS, 외부화(인라인 스크립트·스타일 금지), XSS-safe(`textContent`). `app.js`가 config 서버 주소로 **웹뷰 최상위를 이동**시킨다(`location.replace` — 셸을 히스토리에 안 남김). HeiChitty Chat은 `X-Frame-Options`로 iframe 임베드를 막으므로 iframe이 아닌 top-level navigation을 쓴다.
- **서버 주소 = 빌드 타임 config (config-only)** — `web/config.js`의 `window.HEICHITTY_SERVER` 단일값. 사용자에게 노출하지 않으며(런처·주소입력·자동접속 토글 없음), 앱은 그 주소로 **자동 접속**만 한다. 도달 불가/오프라인이면 상태화면에서 **재시도** 제공(online 복귀 시 자동 재시도). 운영/개발 전환은 `config.js` 한 줄 교체. `localStorage` 영속화·서버변경 기능은 없다(2026-06-22 결정).
- **Capacitor 설정** `capacitor.config.json` — `appId`(`kr.co.heichitty.chat` — 2026-08-10 확정. 변경 시 `android/` 네이티브 패키지도 수기 동기화 필요), `webDir: web`, `server.allowNavigation`(원격 도메인 허용 — 현재 `["*"]`, 운영 서버 도메인 확정 시 **좁혀야 함**).
- **데스크톱 네비게이션 seam** `electron/src/setup.ts` — 기본 템플릿은 커스텀 스킴 밖 이동을 막는다. 뷰어 동작을 위해 `isAllowedTarget`(자기 스킴 또는 http/https)로 완화함. 이 의도를 깨지 말 것.
- **플랫폼별 빌드 전제** — iOS=Mac+Xcode+CocoaPods, Android=Android SDK. 코드는 한 벌, 빌드는 플랫폼별 도구 필요. 절차는 `README.md`.

## 개발 명령 (dev-loop)

웹 자산(`web/`)만 고치는 일상 루프. 플랫폼 빌드·실행 절차는 `README.md` 참조.

| 목적 | 명령 |
|---|---|
| 구문 검사 (lint) | `npm run lint` — `node --check web/app.js` |
| 셸 스모크 테스트 | `npm test` (= `npm run smoke` = `node test/ce1-shell.mjs`) |
| 네이티브에 웹 자산 반영 | `npx cap sync` |

- 테스트는 **CE1 스모크 한 벌**(`test/ce1-shell.mjs`)이 전부다. zero-dep — 브라우저 전역(+ `window.HEICHITTY_SERVER`)을 목으로 깔고 `app.js`를 캐시버스트로 재로딩해 config 정규화·자동접속(`location.replace`)·도달성점검·오프라인·재시도를 직접 검증한다. 시나리오 추가는 이 파일에 함수로 붙인다.
- `app.js`는 import 즉시 top-level에서 `attemptConnect()`를 실행하므로, 테스트는 시나리오마다 전역을 새로 설치한 뒤 모듈을 재로딩한다 — 새 시나리오 작성 시 이 패턴을 따를 것.

## 컨텍스트 맵

| 무엇 | 어디 |
|---|---|
| 할 일·남은 검증 후보(작업 큐) | `docs/TODO.md` |
| 단계화 로드맵(EPIC·STORY·게이트) | `docs/spec/02-epic-story.md` |
| 4플랫폼 빌드·실행 절차 | `README.md` |
| 뷰어 진입 로직 | `web/app.js` |
| 서버 주소(빌드 타임 config) | `web/config.js` |
| Capacitor 설정(appId·webDir·허용도메인) | `capacitor.config.json` |
| 데스크톱 보안/네비게이션 | `electron/src/setup.ts` |
| 원격 서버(채팅 본체) | 별도 경로 `../heichitty-chat` · 리포 `HohyeonKim592/heichitty-chat` (이 저장소 아님 — 이름이 아닌 런타임 값으로만 연결되므로 서버측 개명은 여기 영향 없음) |
