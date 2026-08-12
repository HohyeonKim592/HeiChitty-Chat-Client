# 할 일 (HeiChitty-Chat-Client)

> 진행 SSOT는 `spec/02-epic-story.md`(체크박스) + `git log`. 이 파일은 **다음에 손댈 것**을 위에서부터 모아둔 작업 큐다.

## 🚧 데스크톱 배포 채널 확정 후속 (2026-08-12)

> **결정: 데스크톱 = GitHub Releases + `electron-updater`**(안 A). Mac App Store 미채택.
> 함께 결정: **소스 리포 public 전환**(private면 `electron-updater`가 사용자 머신마다 `GH_TOKEN`을 요구).
> 상세 근거·조사 결과는 `spec/02-epic-story.md`의 `CE2-S4`·`CE5-S1`.

- [x] **업무 이메일 제거** — `electron/package.json` 교체 + 커밋 이력 14건 재작성 + 로컬 `user.email` 설정 + **force push 반영 완료**(2026-08-12). GitHub API로 원격 커밋 author 교체 확인, `origin/main`·`origin/Hohyeon.Kim` 잔존 0건
  - 로컬에 `backup/pre-mail-main`·`backup/pre-mail-hohyeon`(구 이력, 업무 이메일 포함)이 남아 있다. **원격에 push하지 말 것** — 불필요해지면 삭제
- [x] **리포 public 전환 완료** (2026-08-12) — https://github.com/HohyeonKim592/HeiChitty-Chat-Client
  - 전환 전 민감정보 스캔: 자격증명 **0건** · 이력에서 삭제된 파일 **0건** · 사설 IP **0건**
  - 전환 직전 `Hohyeon.Kim` → `main` 병합(ff). **`main`이 뒤처진 채로 공개하면 업무 이메일·`["*"]`이 기본 브랜치에 노출**될 뻔했다 — 다음에도 공개 전 기본 브랜치 내용을 확인할 것
  - 사후 검증: GitHub API로 공개 커밋 17건 전수 author 확인 → 전부 `gimhyeon592@gmail.com`
  - **폴더 단위 공개/비공개는 불가능**(GitHub visibility는 리포 전체 단위 — git이 트리 전체를 해시로 묶기 때문). `docs/`는 그대로 공개하기로 함
  - ⚠️ 로컬 `backup/pre-mail-*` 브랜치에 구 이력(업무 이메일)이 남아 있다. **push 금지**
- [x] **G-SIGN 방침 확정** (2026-08-12) — **연 0원 = 미서명 배포.** 근거·상세는 **`spec/03-signing.md`**
- [–] ~~Xcode + CocoaPods 설치~~ · ~~App Store 심사 리스크 확인~~ · ~~Apple Developer Program 가입~~ — **iOS 범위 밖 결정으로 소멸**(2026-08-12)

### `CE5-S1` 선행 (자동 업데이트 — **Windows 전용**)

> macOS 자동업데이트는 서명이 전제라 「연 0원」 방침에서 포기했다. macOS 사용자는 새 dmg를 직접 받아 재설치한다.

- [ ] **① `win.verifyUpdateCodeSignature: false`** — 기본값이 `true`라 미서명 빌드에서는 업데이트 설치가 거부된다(실측: `winOptions.d.ts:74`)
- [ ] **② `publish`에 `owner`/`repo` 명시**
- [ ] **③ `electron/src/index.ts`의 `.catch()` 삼킴 재검토** — 2026-08-10 응급조치분. 피드가 정상화되면 다시 볼 것
- [–] ~~mac 타깃에 `zip` 추가~~ — macOS 자동업데이트를 포기했으므로 불필요해짐

### 모바일 채널 — ⏸ 최종단계 검토 (2026-08-12 결정)

> 등록비 **$25는 최초 1회뿐**(연회비 없음)이라 「연 0원」 방침과 충돌하지 않는다. 무료 앱이라 Google 수수료도 무관.
> 상세·완화책은 `spec/02-epic-story.md` 「Play 계정 — 최종단계 함정」.

- [ ] **⚠️ 최종단계 전에 Play 계정 종류만은 정해둘 것** — **개인 계정은 「테스터 12명 × 연속 14일」 의무**이고, **계정을 나중에 만들어도 피할 수 없다**(2023-11-13 이후 생성분 전부 적용). 조직 계정만 면제.
  최종단계에 가서 개인 계정으로 정하면 **그때부터 2주를 기다린다.** 미리 정해두면 대기시간이 다른 작업과 겹쳐 사라진다
- [x] **`CE3-S2` `allowNavigation` 좁히기** — 2026-08-12 완료. `["*"]` → **`["127.0.0.1"]`**. 종전 지침("`web/config.js`와 같은 값")은 **틀린 것으로 확인**돼 정정 — 이 설정은 URL이 아니라 호스트 마스크다(상세는 `spec/02-epic-story.md` `CE3-S2`)

## 🔼 남은 검증 후보 (최우선 — 2026-08-10 Desktop 실기검증 반영)

> 셸 스모크는 9/9 통과(`npm test`). 아래는 수동·실기 미검증분.

- [ ] **접속→로그인→채팅 끝단 동선** — 로그인 성공 이후 구간 미검증 (세션 유지: `wc_token` HttpOnly 쿠키 + `GET /me` 복원). *로그인 화면 렌더까지는 2026-08-10 확인*
- [ ] **OS 수준 실제 오프라인** — 2026-08-10 검증의 오프라인 분기는 `navigator.onLine` 오버라이드였다(CDP 오프라인 에뮬레이션이 `navigator.onLine`을 뒤집지 않아서). 실제 네트워크 해제 시 동작은 미확인
- [ ] **모바일 preflight/CSP 동등 검증** — Android 웹뷰에서도 preflight `fetch`가 막히는지. Electron에서 터진 문제라 웹뷰별 확인 필요
- [ ] **dmg/exe 실제 설치 테스트** — 산출물 생성·기동은 확인. 설치 과정(dmg 마운트→드래그, NSIS 마법사)은 미검증. 미서명이라 Gatekeeper·SmartScreen 경고 예상
- [ ] **Windows 실기 실행** — exe를 이 Mac에서 만들었을 뿐 Windows에서 실행해 보지 않았다
- [ ] **Electron 창을 CLI에서 확인 불가** — `screencapture` 미포착 + System Events 창 0개 보고. **원인 미확인**. ~~`windowStateKeeper` 좌표가 화면 밖~~ 가설은 **틀렸다**(실제 저장값 `{x:256,y:91,1000x800}` / `displayBounds 1512x982` = 화면 안). 앱 자체는 TCP 연결로 정상 확인됨 → **CLI 관측의 한계**로 보이며 육안 확인 필요
- [ ] **Android 실기** — 첫 화면에서 원격으로 자동접속(`location.replace`로 셸 미잔류 확인). 하드웨어 뒤로가기 정책은 CE4-S1
- [ ] **로그인 후 채팅 기능 전반** — 메시지 송수신·방 진입·DM 등 뷰어 통과 확인(기능 자체는 서버 책임)
- [ ] **Android 빌드 산출물 실행**(CE2) — http 서버 접속 시 cleartext 설정 필요(CE3)
- [ ] **미서명 배포의 실사용자 경험 확인** — macOS Sequoia의 「확인 없이 열기」 동선 · Windows SmartScreen 경고 화면. 사용자 안내문을 쓰려면 실기로 봐야 한다
- [ ] **`${os}` 매크로 실기 검증** — `directories.output: "../release/${os}"`가 실제로 `release/mac`·`release/win`을 만드는지는 **아직 빌드로 확인하지 않았다**. 근거는 electron-builder 소스·문서뿐(`packager.ts`의 `// support os and arch macro in output value`). 다음 데스크톱 빌드(`./scripts/build-desktop.sh mac`) 때 확인할 것

## 🔧 정리 후보 (기술부채 — 급하지 않음)

- (없음)

## 최근 완료 (2026-08-12)

- **iOS 범위 밖 + 연 0원 방침 확정** — 대상 플랫폼이 **Windows·macOS·Android 3종**이 됐다. 근거·재개 조건은 `spec/02-epic-story.md` 「iOS — 범위 밖」
  - **iOS는 무료 배포 경로가 없는 유일한 플랫폼** — Apple Developer Program(연 $99) 없이는 배포 불가. 「연 0원」과 양립하지 않는다
  - 함께 소멸: **G-IOS 게이트**(Xcode 설치 — 사용자 작업 하나 감소) · **App Store 심사 4.2 리스크**(불확실성 제거 = 부수 이득) · `CE0-S6` · `CE2-S3`
  - **코드에는 흔적이 없었다** — `cap add ios` 미실행이라 `ios/` 폴더가 애초에 없다. 제거한 건 진입점뿐(`package.json` 2줄 · `.gitignore` 3줄 · `collect-mobile.sh` 인자 분기)
  - **macOS 자동업데이트 포기** — 서명이 전제라서. `CE5-S1`은 **Windows 전용**이 됐다
  - 미서명 Windows 자동업데이트는 **`verifyUpdateCodeSignature: false`가 필요**하다(기본 `true` — 실측)
- **G-SIGN 서명 요건 조사** — `spec/03-signing.md`로 정리. 유료 전환 시 참고값은 같은 문서 부록에 보존
  - 🔴 **Microsoft 권장안이 한국에서 막힌다** — Azure Artifact Signing은 조직 미국·캐나다·EU·영국, 개인 미국·캐나다 한정
  - 🔴 **EV 인증서는 무의미해졌다** — 2024년 Microsoft가 EV의 SmartScreen 즉시 통과를 제거. $400+/년을 내도 OV와 동일
  - 🟢 **유료의 실익이 작다는 것이 0원 결정의 근거** — OV를 사도 초기 SmartScreen 경고는 그대로 뜬다(평판 기반). Microsoft Store MSIX는 계정비가 2026년 무료화돼 0원+경고없음이 가능하나 자동업데이트를 포기해야 해 미채택
- **리포 public 전환** — 데스크톱 배포 채널(A안)의 전제. 순서: 업무 이메일 제거 → `allowNavigation` 좁히기 → `main` 병합 → 전환. 사후 검증까지 완료
- **`CE3-S2` `allowNavigation` 좁히기 — `["*"]` → `["127.0.0.1"]`** (G-DOM 통과). 착수하며 **기존 지침이 틀렸음을 소스로 확인**: 이 설정은 URL이 아니라 **호스트 마스크**다(`Bridge.java:395`가 `HostMask.matches(url.getHost())`, `HostMask.java:114`가 `.` 단위 분리). 문서대로 `http://127.0.0.1:3000`을 넣었다면 **매칭 실패로 접속이 막혔을 것**
  - 파생 정정: **B-1′ 폐기** — 호스트만으로는 스킴·포트를 복원할 수 없어 `connect-src` 파생원이 될 수 없다
  - 한계 기록: 이 설정으로는 **포트를 좁힐 수 없다**(호스트가 최소 입도)
- **데스크톱 배포 채널 확정 — GitHub Releases + `electron-updater`** (G-DIST 완전 통과). Mac App Store는 샌드박스 구조 변경 + 심사 4.2 부담 대비 이점이 없어 미채택. 현재 코드가 이미 안 A 전제(`publish: github` + `electron-updater` 의존성)
  - **GitHub 사용한도 조사** — 자산당 2 GiB·릴리스당 1000개 제한은 있으나 **총 크기·대역폭 무제한**(공식 문서 명시). AUP §9 "현저히 과다 시 스로틀"만 남는데 실측 릴리스 1회 239MB 규모로는 무관
  - **자동업데이트가 지금 코드로는 동작하지 않음을 발견** — ① 리포 private(사용자 머신마다 `GH_TOKEN` 필요, 2026-08-10 404 사고의 원인) ② mac 타깃 `dmg` 단독(Squirrel.Mac은 `zip` 필수) ③ macOS 서명 필수. 셋 다 `CE5-S1` 선행조건으로 등록
- **업무 이메일 제거(public 전환 대비)** — `electron/package.json` author + 커밋 이력 14건 author/committer를 `gimhyeon592@gmail.com`으로 교체. 로컬 `user.email`을 이 리포에만 설정(전역 미변경). 검증: 트리 내용 diff 0 · 커밋 수 동일(12/14) · `main`·`Hohyeon.Kim`에 업무 이메일 0건. **원격 반영(force push)은 미실행**

## 최근 완료 (2026-08-11)

- **아카이브·폐기 로직 공통화** — `archive_and_prune()`가 두 스크립트에 중복돼 있던 것을 `scripts/lib/release-store.sh`로 분리(`release_store_init`/`release_store_rotate`/`release_store_rel`). 경로·버전·타임스탬프·`KEEP` 파생까지 lib이 맡아 중복이 더 줄었다. source 전용이라 실행권한 없음. 더미 apk로 1~3회차 + `KEEP=0` 회귀 검증
- **산출물 관리 체계 정비** — 플랫폼별 분리 + 빌드 시마다 폐기분 자동 처리. 상세는 `spec/02-epic-story.md` `CE2-S0`
  - `release/{mac,win,android}/` 최신 1벌 · `release/_archive/<os>/<버전>-<시각>/` 직전 `KEEP`벌(기본 2, 환경변수 조정)
  - `scripts/build-desktop.sh <mac|win>` — 정리 → sync → tsc → 패키징 → 중간산출물 삭제. electron-builder 호출 함정 2개를 구조적으로 차단
  - `scripts/collect-mobile.sh android` — gradle 산출물을 `release/` 아래로 수집 *(ios 인자 분기는 2026-08-12 제거)*
  - 폐기분 332MB 삭제 → `release/` 576MB → 244MB

## 최근 완료 (2026-08-10)

- **CE2-S1 데스크톱 설치파일 생성 완료(미서명)** — Mac universal dmg + Windows x64 NSIS exe. 결정 반영: 공개 배포 지향 · Intel Mac 포함 · 이 Mac에서 Windows까지 · 인증서 없음 · 버전 SSOT `0.0.1`(발매 시 1.0.0 승격)
  - **배포 산출물 경로 = 저장소 루트 `release/<os>/`** (`directories.output: "../release/${os}"`, 2026-08-11 분리). `electron/`은 Capacitor 재생성 영역이라 그 밖으로 뺐다. `.gitignore` 처리
  - **wine 별도 설치 불필요** — electron-builder가 자체 번들 `wine-4.0.1-mac`을 자동 내려받아 처리. Rosetta·Homebrew 개입 없었음
  - 템플릿 기본값이 전부 남아 있던 것을 정리: `appId com.yourdoamnin.yourapp` → `kr.co.heichitty.chat`, `productName` 신규(없으면 표시명이 패키지명으로 나옴), `mac.category`, 버전 `1.0.0` → `0.0.1`
  - **호출 함정 2개** — ① `--mac dmg`처럼 타깃을 CLI로 주면 config의 `arch:["universal"]`이 덮여 host arch로만 나온다(`--mac`만 줄 것) ② `npm run electron:make`는 `-p always`라 GitHub 업로드를 시도한다(`-p never` 쓸 것)
- **패키징 빌드 전용 버그 발견·수정 — autoUpdater 모달이 앱을 막던 문제** — `electron/src/index.ts`의 `autoUpdater.checkForUpdatesAndNotify()`가 private 리포 릴리스 피드 조회로 **404** → unhandled Promise rejection → `electron-unhandled`이 프로덕션에서 **모달 오류창**을 띄워 앱이 멈춤. `.catch()`로 삼키도록 수정(CE5-S1 착수 시 피드와 함께 재검토)
  - **개발 모드에선 재현되지 않는다.** CE1 동선 A~D가 전부 통과한 상태에서도 패키징 빌드는 기동조차 못 했다 — CSP 건에 이어 **패키징 검증이 따로 필요하다는 두 번째 사례**
  - 패키징 앱은 **CDP가 붙지 않아**(`/json` 빈 응답, browser WS 불가) 로그·TCP 연결·화면 캡처로 진단해야 한다

- **Desktop/Electron 실기 재검증 + CSP 버그 2건 발견·수정** — `electron/src/setup.ts` `setupContentSecurityPolicy()` 한 곳이 원인. 기본 템플릿이 "로컬 자산 전용 앱"을 전제로 쓴 코드라 **원격 웹을 띄우는 뷰어**라는 이 앱의 전제와 어긋나 있었다. → `CE1-S3`·`CE1-S5` 실기 근거 확보
  - **버그① 원격 자산 전멸** — `onHeadersReceived`가 세션 전역이라 원격 서버 응답의 CSP까지 커스텀 스킴 전용 정책으로 **대체**. 서버가 보낸 `default-src 'self' …`가 사라져 `chat.css`·`chat.js`·`socket.io.js`가 전부 차단 → 화면 무스타일·실시간 채팅 미동작. **수정**: 커스텀 스킴 응답에만 CSP 적용, 원격 응답은 서버 CSP 존중
  - **버그② preflight 차단** — 셸 CSP에 `connect-src`가 없어 `default-src`로 폴백 → `web/app.js`의 도달성 점검 `fetch`가 CSP에 막힘. **서버가 살아 있어도 항상 "연결할 수 없습니다"**. `preflight()`가 실패를 `.catch(() => false)`로 삼켜 CSP 차단과 서버 다운이 구분되지 않았다. **수정**: `connect-src`에 config 서버 오리진만 허용
  - **오리진 파생 방식(B-1 채택)** — 메인 프로세스가 `app/config.js`를 읽어 오리진 추출. ⚠️ **스킴 보정 규칙이 `web/app.js`의 `defaultSchemeFor()`/`normalize()`와 반드시 같아야 한다** — 갈리면 `connect-src`가 어긋나 preflight가 조용히 막힌다(`setup.ts`에 주석 명시)
  - **검증**: 자동접속 PASS(수동개입 0, 셸 → 원격 이동) · 원격 자산 로드 PASS(`chat.css` 142룰) · CSP 헤더 실물 확인(셸=서버 오리진 1개만, 원격=서버 원본 그대로) · `npm run lint` OK · 셸 스모크 9/9 PASS(회귀 없음)
  - **셸 스모크가 못 잡는 종류**였음 — 목 `fetch`에는 CSP가 없어 preflight가 항상 의도대로 동작한다. 실기에서만 드러남
- **CE1 데스크톱 동선 실기검증 완결**(2026-08-10) — 자동접속 · 도달실패(상태화면+재시도) · **재시도→접속** · 오프라인(전용 메시지+배너) · online 복귀 자동 재시도 **전 시나리오 PASS**. CSP 수정 후 기준
  - **도달실패·재시도는 서버를 실제로 정지·재기동시켜 검증**. 콜드 부팅 시 셸 유지+상태화면, 콘솔은 `ERR_CONNECTION_REFUSED`이고 **CSP refusal 0건** — 상태화면이 *옳은 이유로* 뜬다(수정 전엔 같은 화면이 CSP 차단 탓이었다). 서버 재기동 후 재시도 클릭 → **앱 재시작 없이** 원격 이동, `chat.css` 142룰 + `io` 전역 정의됨(**socket.io 로드 확인**)
  - 두 분기가 서로 다른 메시지를 정확히 냄을 확인: 도달 불가 → `서버에 연결할 수 없습니다`(배너 없음) / `navigator.onLine=false` → `네트워크 연결이 없습니다`(배너 노출)
  - **검증 범위 명시** — 오프라인 분기만 `navigator.onLine` 오버라이드로 검증했다. Electron의 CDP 오프라인 에뮬레이션이 `navigator.onLine`을 뒤집지 않아 그 방법으론 해당 분기를 못 태운다(에뮬레이션 한계이지 앱 문제 아님)
- **서버 변경의 클라 반영 특성 확인** — 서버만 고치면 **다음 실행에서 즉시 반영**된다(재빌드·재배포 불요). 근거: HTML·`chat.css`·`chat.js` 전부 `Cache-Control: no-cache` + `ETag`(매 로드 재검증), Service Worker·manifest **0건**. 예외 = 클라 재배포 필요: **주소/도메인 변경**(`web/config.js` — B-1 이후 Electron `connect-src`도 이 값에서 파생되므로 여기 한 곳만 고치면 따라옴) · `allowNavigation`(G-DOM 후) · 푸시(CE4-S5)·첨부(CE4-S3)·딥링크(CE4-S4) 등 네이티브 기능 · 셸 자체 UI(`web/`)
- **git 저장소 확정** — private GitHub `HohyeonKim592/heichitty-chat-client` 생성(default `main`) + 초기 임포트 단일 커밋 `460d89f`(83 files). 브랜치 모델 = `Hohyeon.Kim`에서 작업 → `main` 병합(형제 chitty 리포 관례 승계). → `CE0-S2` 완료
- **appId 확정** `kr.co.heichitty.chat` — android 네이티브 패키지까지 반영. → `CE3-S1` 완료 · **G-ID 통과**
- **`www` 잔재 정리** — `electron/src/setup.ts` 주석의 `www/config.js` → `web/config.js` (6/22 폴더 리네임 누락분, 동작 영향 없음)
- **서버측 개명 영향 점검 — 이 저장소는 수정 불요(재점검 불필요)** — 서버가 폴더 `chittyChat` → `heichitty-chat`(맥미니 반영·서비스 정상), GitHub 리포도 `ChittyChat` → `heichitty-chat`으로 개명됨. 이 저장소 전수 검색 결과 `ChittyChat`·서버 리포 URL 참조 **0건**. 두 리포의 접점은 이름이 아니라 **런타임 값 3개**(`web/config.js`의 주소 · `allowNavigation` · `appId`)뿐이라 서버 개명은 여기에 영향이 없다

## 최근 완료 (2026-06-22)

- **config-only 전환** — 서버 주소를 사용자에게 안 묻고 빌드 타임 config(`web/config.js`)로 고정. 런처 입력·자동접속 토글·서버변경(Desktop 메뉴·`#settings`/`back_forward` 바운스 로직) 제거. 접속은 `location.replace`(셸 미잔류). 도달 실패/오프라인 시 상태화면+재시도(online 복귀 자동 재시도). → `web/{config.js,index.html,app.js,style.css}`·`electron/src/setup.ts`
- **셸 폴더 리네임** `www/` → `web/` (`webDir`·lint·test 경로·문서 동기화)
- **스모크 재구성** 9/9 PASS (`test/ce1-shell.mjs`, config-only 시나리오)
- **문서 동기화** README·CLAUDE.md·`spec/02-epic-story.md`·본 파일 전부 config-only/web 기준으로 갱신
- *(당시 전부 git 미추적이었고, 2026-08-10 초기 임포트 커밋으로 편입됨)*

## 다음 작업 (참고)

- 수동·실기 재검증 (위 검증 후보 — 시나리오 A 재검증·오프라인 동선 우선)
- **Wave 0 결정 완료** — G-ID·G-DOM·G-SIGN·G-DIST(데스크톱) 확정, G-IOS 폐기, 모바일 채널은 최종단계 이월. **착수를 막는 결정은 더 없다**
- ~~**`connect-src` 파생원 격상 검토(B-1′)**~~ — **폐기(2026-08-12)**. `allowNavigation`은 호스트만 담아 스킴·포트를 복원할 수 없으므로 `connect-src`의 파생원이 될 수 없다. `web/config.js` 파싱(B-1) 유지 — 즉 `setup.ts`와 `app.js`의 **스킴 보정 규칙 동기화 의무는 계속 남는다**
- CE6-S4: pre-push 훅(lint+smoke 자동화) — 원격이 생겨 착수 가능
