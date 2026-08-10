# 할 일 (heichitty-chat-client)

> 진행 SSOT는 `spec/02-epic-story.md`(체크박스) + `git log`. 이 파일은 **다음에 손댈 것**을 위에서부터 모아둔 작업 큐다.

## 🔼 남은 검증 후보 (최우선 — 2026-06-22 config-only 재설계 반영)

> ⚠️ 2026-06-20 런처 기반 수동 검증은 config-only 전환으로 무효(런처·자동접속 토글·서버변경·`back_forward`/`#settings` 제거). 셸 스모크는 9/9 통과(`npm test`). 아래는 수동·실기 미검증분.

- [ ] **Desktop/Electron 재검증** — config 주소 자동접속 → 실 HeiChitty Chat 로드, 도달 실패 시 상태화면+재시도, 오프라인 배너, online 복귀 자동 재시도
- [ ] **접속→로그인→채팅 끝단 동선** — config-only 경로로 재확인 (세션 유지: `wc_token` HttpOnly 쿠키 + `GET /me` 복원)
- [ ] **Android 실기** — 첫 화면에서 원격으로 자동접속(`location.replace`로 셸 미잔류 확인). 하드웨어 뒤로가기 정책은 CE4-S1
- [ ] **iOS** — 자동접속 동선 (iOS 빌드환경 확보 후, CE0-S6/CE2-S3)
- [ ] **로그인 후 채팅 기능 전반** — 메시지 송수신·방 진입·DM 등 뷰어 통과 확인(기능 자체는 서버 책임)
- [ ] **Android/iOS 빌드 산출물 실행**(CE2) — http 서버 접속 시 cleartext/ATS 설정 필요(CE3)

## 최근 완료 (2026-06-22)

- **config-only 전환** — 서버 주소를 사용자에게 안 묻고 빌드 타임 config(`web/config.js`)로 고정. 런처 입력·자동접속 토글·서버변경(Desktop 메뉴·`#settings`/`back_forward` 바운스 로직) 제거. 접속은 `location.replace`(셸 미잔류). 도달 실패/오프라인 시 상태화면+재시도(online 복귀 자동 재시도). → `web/{config.js,index.html,app.js,style.css}`·`electron/src/setup.ts`
- **셸 폴더 리네임** `www/` → `web/` (`webDir`·lint·test 경로·문서 동기화)
- **스모크 재구성** 9/9 PASS (`test/ce1-shell.mjs`, config-only 시나리오)
- **문서 동기화** README·CLAUDE.md·`spec/02-epic-story.md`·본 파일 전부 config-only/web 기준으로 갱신
- ⚠️ **전부 git 미추적(미커밋)** — 커밋 지시 대기

## 다음 작업 (참고)

- **커밋 단위 결정 + 초기 git 커밋** (현재 커밋 0건, 오늘 작업 전부 미추적)
- 수동·실기 재검증 (위 검증 후보 — Desktop/Electron 우선)
- Wave 0 결정: appId 확정(G-ID)·운영 도메인(G-DOM)·배포 채널(G-DIST) — G-DOM 정해지면 `web/config.js`+`allowNavigation` 동시 교체
- CE6-S4: pre-push 훅(lint+smoke 자동화)
