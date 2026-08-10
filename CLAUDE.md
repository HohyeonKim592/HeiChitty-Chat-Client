# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# 작업원칙 (heichitty-chat-client)

이 파일은 본 작업경로에서 일하는 Claude Code 인스턴스의 작업방식 규칙입니다.
**HeiChitty Chat(웹 서버)와는 별개의 독립 경로**이며, 작업방식 원칙만 승계하고 서버의 구조·코드는 가져오지 않습니다.

이 클라이언트는 웹 기반 HeiChitty Chat을 **데스크톱·모바일에서 띄우는 뷰어**(Capacitor 웹뷰 래퍼)입니다.

> **이 파일은 매 세션 자동 로드 → lean 유지.** *작업방식 규칙*만 둔다. 프로젝트 구조·빌드·결정 등 특정 컨텍스트는 `README.md`/`docs/`에 두고 여기선 가리키기만 한다(끝 §컨텍스트 맵).

## 0. 언어 / 인코딩
- **모든 응답·질의·확인은 한글로** 한다. 사용자에게 묻는 모든 사전 질의(승인·확인 요청 포함)도 한글.
- **인코딩은 UTF-8(LF).** 소스·설정·문서 전부 UTF-8 기본. EUC-KR/CP949/UTF-16 쓰지 않는다.

## 1. 착수는 항상 사용자 승인 이후
- 구현·파일변경은 **승인 이후에만**. 요청을 받으면 먼저 계획/설계를 제시하고 멈춘다.
- "설계해봐" 류 요청엔 **계획만** 내고 멈춘다 — 파일 수정·신규 생성 금지.
- 방향을 사용자가 고른 직후라도 곧바로 코딩하지 말고 "이 계획대로 착수할까요?"로 한 번 더 승인.
- 계획용 최소 읽기/grep은 가능하나, 광범위한 다단계 코드 탐색을 자동 연쇄하지 말 것.
- 예외: 명시적 구현 지시("X 만들어줘", "X 등록하고 정리해줘")는 그 자체가 착수 승인.

## 2. 컨벤션 안내 ≠ 기존 파일 일괄 적용
- 사용자가 규칙·컨벤션을 안내하는 발언은 **향후 작성/수정 시 적용할 룰**로만 해석한다.
- 기존 파일에 그 룰을 적용한 reformat·일괄 변경은 사용자가 **별도로 명시한 경우에만** 진행.
- 룰을 안 따르는 기존 코드를 발견해도 자체 판단으로 정정하지 말고 "기존 파일도 정리할까요?"로 질의.

## 3. 지시한 파일만 수정·분석
- "X 파일 작업해줘" → **X만** 수정·분석.
- 작업 중 다른 파일이 관련돼 보여도 손대지 말고 한글로 묻기:
  - 수정: `이 변경 때문에 Y 파일도 함께 수정 필요해 보이는데, 작업할까요?`
  - 분석: `이 부분 이해를 위해 Y 파일도 같이 봐야 할 것 같은데 분석해도 될까요?`
- 얕은 탐색(grep, ls, 파일 존재 확인)은 OK. 깊이 읽거나 여러 파일을 펼쳐 분석하는 건 사전 확인.
- **auto mode가 켜져 있어도 이 규칙이 우선.**
- 예외 — **임시 파일**(`/tmp/*`, `/private/tmp/*`)은 자유. 단 임시 파일을 통해 영구 소스를 수정할 땐 영구 파일 스코프 규칙 그대로 적용.
- **네이티브 플랫폼 폴더(`android/`, `ios/`, `electron/`)는 Capacitor가 생성한 산출물**이다. `npx cap add`/`cap sync`로 재생성·갱신되는 영역이므로 직접 수정은 최소화하고, 불가피하게 손댈 땐(예: 보안 핸들러 조정) 변경 의도를 주석으로 남긴다.

## 4. Git 규칙
- **모든 git 상태변경(commit / push / branch / merge / rebase / tag)은 사용자 명시 지시가 있을 때만** 수행. 지시 없이 자동 commit·push 금지.
- `git status` / `log` / `diff` 등 **읽기 전용 조회는 자유**.
- 커밋 시 무관한 변경 쓸어담지 말 것 — 지시된 파일만 `git add <명시 경로>` (`-A` / `.` 금지). 커밋 전 `git diff --cached --name-only`로 대상 확인.
- **main 직접 작업 금지** — 사용자가 "main 대상"이라 명시한 경우만.
- `push --force` / `reset --hard` / `clean -f` 등 destructive 작업은 main 아니어도 **한 번 더 확인**.
- **AI 저작 흔적 금지** — 커밋 메시지·파일 내용에 `Claude`/`Claude Code`/AI co-author 표기 쓰지 않는다. 중립/사람 값 사용하거나 비움.

## 5. 응답 규칙
- **사실은 추측 금지** — 단축키, 기본값, API/CLI 플래그명, 설정 키 등 구체적 사실은 코드/공식 문서로 확인 후 답한다. 검증 불가 시 명시(`정확한 값은 모르니 확인 필요`). 그럴듯한 specifics로 답을 채우지 말 것.

## 6. 임시 스크립트 재사용 보고
- 임시 스크립트 작업 후, 재사용 가치 있는 함수/패턴을 발견하면 작업 끝에 한글로 짧게 보고. 보고만 하고 사용자 결정 대기 — **자동 라이브러리화 금지**.

## 7. 진행 가시화 (Task 목록)
- **3단계 이상 멀티스텝 작업은 항상 Task 도구로 진행 상태를 표시**한다 — `TaskCreate`로 등록, 시작 시 `in_progress`, 끝나면 `completed`.
- **각 단계 완료마다 한 줄이라도 텍스트로 "X 완료" 보고** — 도구 출력만으로 끝내지 말 것.
- 단일·자명한 작업(1~2스텝)은 생략.

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
| 원격 서버(채팅 본체) | 별도 경로 `../heichitty-chat` (이 저장소 아님) |
