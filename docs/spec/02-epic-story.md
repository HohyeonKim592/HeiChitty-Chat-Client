# 02 — EPIC & STORY 로드맵 (HeiChitty-Chat-Client)

> 이 문서는 **HeiChitty-Chat-Client**(웹 기반 HeiChitty-Chat을 띄우는 데스크톱·모바일 뷰어)의 단계화 로드맵이다.
> 채팅·인증·실시간 로직은 원격 **HeiChitty-Chat 서버**가 담당하고, 이 앱은 그 웹을 띄우는 **얇은 뷰어**다 — 상태를 거의 갖지 않는다.
> 연계: `../../CLAUDE.md`(작업원칙·아키텍처) · `../../README.md`(3플랫폼 빌드·실행) · `03-signing.md`(서명 요건) · `capacitor.config.json`(설정) · `electron/src/setup.ts`(데스크톱 네비게이션).
> 개발방식 = **walking skeleton**(뼈대 → 살). 뷰어는 얇으므로 EPIC을 적게 둔다.
> **진행현황 단일소스 = `git log`(`CE#-S#`) + 본 문서 체크박스.**

## 범위 결정 (확정/보류)

| 항목 | 결정 | 상태 |
|---|---|---|
| 대상 플랫폼 | **Windows · macOS · Android** (단일 Capacitor 코드베이스). **iOS는 범위 밖**(2026-08-12) — 아래 「iOS — 범위 밖」 | ✅ 확정 |
| 배포 비용 | **연 0원이 목표**(2026-08-12 결정) — Apple Developer Program(연 $99) 미사용. 그 결과 iOS 배포 불가, macOS는 미서명 배포(자동업데이트 포기) | ✅ 확정 |
| 프레임워크 | Capacitor (모바일 네이티브 + 데스크톱 `@capacitor-community/electron`) | ✅ 확정 |
| 서버 주소 | **빌드 타임 config 고정**(`web/config.js`의 `window.HEICHITTY_SERVER`) · 사용자 비노출(config-only) | ✅ 방식 확정 (2026-06-22: 설정가능 URL→config 고정으로 변경) |
| 테스트서버 위치 | **Mac mini에서 서버·클라이언트를 같이 실행** → `http://127.0.0.1:3000` 루프백 그대로 사용. LAN·mDNS 주소 불필요 | ✅ 확정 (2026-08-11) |
| 운영서버 | **추후 도입 가능성 있음** — 도메인 미정. 도입 시 `web/config.js` 한 줄 + `allowNavigation` 교체 후 재빌드(config-only 설계의 이점) | 🟡 보류 |
| 부가기능 v1 | **푸시 알림(CE4)·자동 업데이트(CE5) 포함** | ✅ 확정 |
| git 저장소·브랜치 | GitHub `HohyeonKim592/HeiChitty-Chat-Client` · `Hohyeon.Kim`(작업) → `main`(기본) 병합 — 형제 chitty 리포 관례 승계 | ✅ 확정 (2026-08-10) |
| 리포 공개범위 | **public** — `electron-updater`가 private 리포에서는 최종 사용자 머신마다 `GH_TOKEN`을 요구하기 때문. 전환 전 민감정보 스캔(자격증명 0건)·업무 이메일 제거·`allowNavigation` 좁히기를 마치고 전환 | ✅ 전환 완료 (2026-08-12) |
| 모바일 배포 채널 | **Google Play 후보** — 등록비 $25는 **최초 1회뿐**(연회비 없음)이라 「연 0원」과 충돌하지 않는다. ~~Apple App Store~~는 iOS 범위 밖으로 소멸 | ⏸ **Android 실기기 테스트 이후 결정**(2026-08-14). ⚠️ 아래 「Play 계정 — 최종단계 함정」 |
| 데스크톱 배포 채널 | **GitHub Releases + `electron-updater`**(안 A). Mac App Store 미채택 — 샌드박스·심사(4.2) 부담 대비 이점 없음 | ✅ 확정 (2026-08-12) |

## EPIC 개요

접두어 `CE` = Client EPIC.

| EPIC | 목표 | 상태 |
|---|---|---|
| **CE0** 프로젝트 골격 | Capacitor scaffold · 웹 셸 런처 · android/electron 추가 · 빌드 통과 | ✅ 완료 |
| **CE1** 뷰어 코어(접속 셸) | config 서버 자동접속 · 최상위 네비 · 연결실패/오프라인/재시도 동선 (config-only) | ✅ 대부분 완료 |
| **CE2** 플랫폼 빌드·배포 | Desktop 설치파일 · Android 서명빌드 | 예정 |
| **CE3** 구성·브랜딩 | appId 확정 · 허용도메인 좁히기 · 아이콘/스플래시/표시명 · 환경 프로파일 | 예정 |
| **CE4** 네이티브 통합 + 푸시 | 뒤로가기 · 외부링크 · 다운로드 · 딥링크 · **푸시 알림** | v1 (예정) |
| **CE5** 자동 업데이트 | Desktop electron-updater · 모바일 업데이트 전략 · 웹자산 OTA(선택) | v1 (예정) |
| **CE6** 품질·게이트 | lint · 셸 스모크 · 3플랫폼 빌드 검증 · pre-push | 후보 |

## Story 상세

> `[x]` 완료 · `[~]` 부분/진행 · `[ ]` 미착수. 〔G-…〕 = 결정 게이트 의존.

### CE0 — 프로젝트 골격
- [x] `CE0-S1` Capacitor scaffold — `package.json`·`capacitor.config.json`·core/cli 설치
- [x] `CE0-S2` git 저장소 — init + **원격·브랜치·커밋 모델 확정(2026-08-10)**: private GitHub `HohyeonKim592/heichitty-chat-client`(default `main`) · `Hohyeon.Kim`에서 작업 후 `main` 병합 · 초기 임포트 단일 커밋 `460d89f`(83 files)
- [x] `CE0-S3` 웹 셸 런처 `web/` — `index.html`/`app.js`/`style.css`, 외부화·XSS-safe(`textContent`)
- [x] `CE0-S4` Android 플랫폼 추가 (`cap add android`)
- [x] `CE0-S5` Desktop(Electron) 플랫폼 추가 — `cap add @capacitor-community/electron` · `npm run build` 통과(`skipLibCheck`) · 뷰어용 네비게이션 완화(`isAllowedTarget`)
- [–] `CE0-S6` ~~iOS 플랫폼 추가~~ — **범위 밖**(2026-08-12). 아래 「iOS — 범위 밖」

### CE1 — 뷰어 코어(접속 셸)
> **2026-06-22 결정 — config-only**: 서버 주소를 사용자에게 노출하지 않고 빌드 타임 config(`web/config.js`)로 고정. 런처(주소 입력)·자동접속 토글·서버변경 기능 제거. 접속은 `location.replace`로 셸을 히스토리에 남기지 않음 → 뒤로가기 바운스 문제 자체가 소멸(`back_forward`/`#settings` 감지 로직 불필요).
> 설계 핵심(코드 = `web/app.js`·`web/config.js`·`electron/src/setup.ts`): config 주소로 **자동 접속** + 이동 전 **사전 도달성 점검** + 실패 시 상태화면 **재시도**.
> **플랫폼 설정 의존**(CE3): http 서버(개발 localhost 등) 접속 시 Android `usesCleartextTraffic` 필요(https 운영서버면 무관).
- [~] `CE1-S1` ~~서버주소 입력·저장 + 자동접속 토글~~ → **폐기(config-only)**. 대체: `CE1-S1'` 빌드 타임 config 주입(`web/config.js`) + config 주소 자동접속
- [x] `CE1-S2` 최상위 네비게이션 진입 — HeiChitty-Chat이 `X-Frame-Options`로 iframe을 막으므로 top-level `location` 이동(`location.replace`)
- [x] `CE1-S3` **연결 실패 처리** — 이동 전 `preflight`(no-cors fetch + 5s 타임아웃)로 도달성 점검 + `navigator.onLine` 가드 → 실패 시 상태화면에 머물며 **재시도** 제공. online 복귀 시 자동 재시도. **2026-08-10 Desktop 실기검증에서 CSP 차단 버그 발견·수정**(아래 §데스크톱 CSP 주의) 후 **서버 실제 정지·재기동으로 실패→재시도→접속 전 구간 확인**
- [~] `CE1-S4` ~~서버 변경 재진입~~ → **폐기(config-only, 서버변경 미노출)**. Desktop "서버 변경" 메뉴·바운스 방지 로직 함께 제거
- [x] `CE1-S5` **로딩·오프라인 표시** — 스플래시 상태(`접속 확인 중…`/`접속 중…`) + online/offline 배너 + 도달 실패 시 상태화면. **2026-08-10 Electron 실기 검증 완료**(오프라인 메시지·배너·online 복귀 자동 재시도)

> **⚠️ 데스크톱 CSP 주의 (2026-08-10 실기검증에서 확인)** — `electron/src/setup.ts` `setupContentSecurityPolicy()`는 Capacitor Electron 기본 템플릿 코드로, **로컬 자산만 띄우는 앱**을 전제한다. 이 앱은 원격 웹 뷰어라 전제가 어긋나 버그 2건이 있었다.
> - `onHeadersReceived`는 **세션 전역**이라 원격 서버 응답의 CSP까지 대체 → 서버의 CSS·JS·socket.io 전멸. → **커스텀 스킴 응답에만** 적용하도록 수정
> - 셸 CSP에 `connect-src`가 없으면 `default-src`로 폴백해 preflight `fetch`가 차단 → 서버가 살아도 접속 불가. → `connect-src`에 **config 서버 오리진만** 허용(B-1)
>
> `connect-src` 오리진은 메인 프로세스가 `app/config.js`를 읽어 파생한다. **스킴 보정 규칙을 `web/app.js`의 `defaultSchemeFor()`/`normalize()`와 동일하게 유지할 것** — 갈리면 preflight가 조용히 막힌다. `isAllowedTarget`(`setup.ts:189`)과 같은 성격의 **뷰어용 seam**이니 깨지 말 것.

### CE2 — 플랫폼 빌드·배포
- [x] `CE2-S1` **Desktop 설치파일** — 2026-08-10 Win/Mac 산출물 생성·실행 검증 완료(**미서명**)
  - 산출물: `HeiChitty Chat-0.0.1-universal.dmg`(172MB, x86_64+arm64) · `HeiChitty Chat Setup 0.0.1.exe`(79MB, x64)
  - **저장 경로 = 저장소 루트 `release/<os>/`** (`directories.output: "../release/${os}"` — 2026-08-11 플랫폼 분리). `electron/`은 Capacitor가 재생성하는 영역이라 배포물을 그 밖에 둔다. `.gitignore` 처리됨
  - **빌드는 `scripts/build-desktop.sh <mac|win>`으로** — 정리 → sync → tsc → 패키징 → 중간산출물 삭제를 한 번에. 아래 호출 함정 2개를 구조적으로 막는다
  - **Windows 빌드에 wine 별도 설치 불필요** — electron-builder가 자체 번들 `wine-4.0.1-mac`을 자동 내려받아 이 Mac에서 처리
  - 수기 호출 시 주의: `--mac dmg`처럼 타깃을 CLI로 주면 config의 `arch: ["universal"]`이 덮여 host arch로만 나온다. **`--mac`/`--win`만 주고 arch는 config에 맡길 것**
  - `npm run electron:make`는 `-p always`라 **GitHub 업로드를 시도**한다. 산출물만 원하면 `-p never`
- [x] `CE2-S0` **산출물 관리 체계** — 2026-08-11. 플랫폼별 분리 + 빌드 시마다 폐기분 자동 처리
  - `release/{mac,win,android}/` 최신 1벌 · `release/_archive/<os>/<버전>-<시각>/` 직전 `KEEP`벌(기본 2)
  - 데스크톱은 `${os}` 매크로가, 모바일(gradle 산출물)은 `scripts/collect-mobile.sh android` 수집이 담당
  - 언팩 앱 번들(`mac-arm64/` 237MB)·아이콘 캐시는 재생성 가능한 중간산출물이라 아카이브 없이 빌드 직후 삭제
  - *(2026-08-12: iOS ipa 수집 분기는 iOS 범위 밖 결정으로 제거)*
  - 착수 시점 정리: 폐기분 332MB 삭제(arch 덮임 실패분 `-arm64.dmg` + `mac-arm64/`) → `release/` 576MB → 244MB
- [ ] `CE2-S2` **Android 서명 빌드** — release keystore + AAB 〔G-SIGN〕. 공개 스토어 확정(2026-08-11)이라 **Play Console 등록 + AAB 업로드**가 목표 형태. 요건 상세는 **`03-signing.md`**
  - **Play 앱 서명 필수**(2021-08 이후 신규 앱) — 업로드 키로 서명해 올리면 Google이 앱 서명 키로 재서명한다. 키 유효기간은 2033-10-22 이후로 끝나야 한다
  - ⚠️ **계정 종류를 먼저 정할 것** — 2023-11-13 이후 만든 **개인 계정**은 프로덕션 전 「테스터 12명 × 연속 14일」 비공개 테스트가 의무다(**조직 계정 면제**). 출시까지 최소 2주가 강제로 추가된다
- [–] `CE2-S3` ~~iOS 빌드·서명~~ — **범위 밖**(2026-08-12). 아래 「iOS — 범위 밖」
- [~] `CE2-S4` 배포 채널 확정·산출물 정의 〔G-DIST〕 — **채널 전부 확정**: 모바일 = 공개 스토어(2026-08-11) · **데스크톱 = GitHub Releases + `electron-updater`(2026-08-12, 안 A)**
  - **데스크톱에서 Mac App Store를 택하지 않은 이유** — MAS는 샌드박스가 필수라 구조 변경이 따르고 심사(4.2)를 통과해야 하는데, 원격 웹 뷰어라는 성격상 얻는 것이 없다. 반면 안 A는 현재 코드가 이미 그 전제다(`publish: github` + `electron-updater` 의존성 보유)
  - **GitHub 사용한도는 제약이 아니다**(2026-08-12 조사) — 공식 문서상 자산당 2 GiB·릴리스당 1000개 제한은 있으나 **"릴리스 총 크기·대역폭에는 제한이 없다"**. AUP §9의 "현저히 과다 시 스로틀" 조항만 남는데, 실측 릴리스 1회 239MB(dmg 164MB + exe 75MB, zip 타깃 추가 시 ~400MB) 규모로는 걸릴 수준이 아니다
  - 남은 것: 산출물 정의(AAB 또는 APK / dmg / exe) · **모바일 채널 재확인**(Play Console $25가 「연 0원」과 어긋나는지 — 직접 APK 배포·F-Droid가 대안)

### CE3 — 구성·브랜딩
- [x] `CE3-S1` **appId 확정** — `kr.co.heichitty.chat` (2026-08-10 확정, android 네이티브 패키지까지 반영) 〔G-ID〕
- [x] `CE3-S2` **`allowNavigation` 좁히기** — 2026-08-12 `["*"]` → **`["127.0.0.1"]`** 〔G-DOM〕
  - ⚠️ **URL이 아니라 호스트 마스크다** (착수 전 문서에 적혀 있던 "`web/config.js`와 동일 값" 지침은 **틀렸다**). `Bridge.java:395`가 `appAllowNavigationMask.matches(url.getHost())`로 **호스트만** 넘기고, `util/HostMask.java:114`의 `splitAndReverse`가 마스크를 `.`으로 쪼개 라벨 단위로 비교한다. `http://127.0.0.1:3000`을 넣으면 `["http://127","0","0","1:3000"]`로 파싱돼 호스트 `127.0.0.1`과 **영원히 매칭되지 않는다** → 접속 차단
  - `["*"]`가 전부 허용이던 이유도 같은 코드에서 확인됨 — 마스크 라벨이 `*` 하나면 `Util.matches`가 무조건 true(`HostMask.java:105`)
  - **스킴·포트는 이 설정으로 좁힐 수 없다.** 호스트가 최소 입도라 `127.0.0.1`의 모든 포트가 열린다. 포트까지 좁히려면 다른 층(Electron `isAllowedTarget`·CSP)에서 해야 한다
  - 적용 대상은 **Android**. 데스크톱 네비게이션은 `electron/src/setup.ts`의 `isAllowedTarget`이 따로 판정하므로 이 값의 영향을 받지 않는다
  - **2026-08-11 G-DOM 방향 확정**: 테스트 단계는 같은 Mac mini에서 서버·클라를 함께 돌리므로 대상이 **루프백 `http://127.0.0.1:3000`** 하나다. 즉 `["*"]` → 루프백 한정으로 지금 좁힐 수 있다. 운영서버는 추후 도입 시 같은 자리 한 줄 교체
  - ❌ **B-1′(연 `connect-src`를 `allowNavigation`에서 파생) 안은 폐기.** `connect-src`는 **스킴+호스트+포트**가 있는 완전한 오리진을 요구하는데 `allowNavigation`은 호스트만 담는다. 이 값에서는 `http`인지 `https`인지, 포트가 무엇인지 복원할 수 없다 → `web/config.js` 파싱(B-1)을 유지한다
- [ ] `CE3-S3` 앱 아이콘·스플래시 (`@capacitor/assets` 등으로 3플랫폼 생성)
- [~] `CE3-S4` 표시명·버전·환경(개발/운영) 프로파일 — **데스크톱분 완료(2026-08-10)**: `productName: HeiChitty-Chat`(2026-08-12 `HeiChitty Chat` → 하이픈 표기 통일) · `appId: kr.co.heichitty.chat` · 버전 SSOT **`0.0.1`**(발매 준비 완료 시 1.0.0 승격) · `mac.category: public.app-category.social-networking`. 남은 것: 모바일 표시명, 빌드별 서버 기본값(선택)
  - ⚠️ `capacitor.config.json`의 `appName`은 **electron-builder가 참조하지 않는다**. 데스크톱 표시명은 `electron-builder.config.json`의 `productName`이 따로 정한다 — 둘을 같이 고칠 것

### CE4 — 네이티브 통합 + 푸시 *(v1)*
- [ ] `CE4-S1` Android 하드웨어 뒤로가기 — 원격 페이지 히스토리/앱 종료 정책
- [ ] `CE4-S2` 외부 링크 → 시스템 브라우저 (`setWindowOpenHandler`/모바일 동등 처리)
- [ ] `CE4-S3` 파일 다운로드/업로드 브리지 — 첨부 송수신(HeiChitty-Chat E6 대응)
- [ ] `CE4-S4` 딥링크/유니버설 링크 — 특정 방·메시지로 진입
- [ ] `CE4-S5` **푸시 알림** — FCM(Android) 토큰 등록·수신·탭 이동 〔**서버측 발송 연동 의존**〕. APNs(iOS)는 범위 밖

### CE5 — 자동 업데이트 *(v1)*
- [ ] `CE5-S1` **Desktop** — `electron-updater`(피드 URL·서명·롤백). **채널 = GitHub Releases 확정(2026-08-12)**. 착수 전 아래 3건이 선행돼야 실제로 동작한다
  - ✅ **선행조건 3건 반영 완료(2026-08-14)** — `win.verifyUpdateCodeSignature: false` · `publish` 에 `owner`/`repo` 명시 · `index.ts` 업데이트 확인을 **`win32` 한정**으로 축소(`.catch()` 는 유지). **남은 본체 = 실제 릴리스를 올려 수신·적용을 확인하는 일**이며 Windows 실기가 전제다
  - 🔴 **리포 public 전환** — private 리포로 업데이트하려면 `GH_TOKEN`을 **최종 사용자 머신에** 심어야 한다(electron-builder 문서: *"아주 특수한 경우용, 모든 사용자에게 적합하지 않다"*). **2026-08-10 autoUpdater 404 모달 사고의 실제 원인이 이것**이었다. → public 전환으로 해소(2026-08-12 결정)
  - 🔴 **mac 타깃에 `zip` 추가** — 현재 `electron-builder.config.json`의 mac 타깃이 `dmg` 단독이다. **`zip`은 Squirrel.Mac 필수**이고(문서: *"dmg 패키지에서 zip을 끄면 자동업데이트가 깨진다"*, 기본값이 `dmg`+`zip`), 지금 생성되는 `latest-mac.yml`은 dmg만 가리켜 업데이트 적용 단계에서 동작하지 않는다
  - 🔴 **macOS 코드 서명 + 공증** 〔G-SIGN〕 — 문서 원문: *"macOS 앱은 자동업데이트가 동작하려면 반드시 서명되어야 한다"*. Windows는 미서명으로도 업데이트 자체는 동작(SmartScreen 경고만)
    - ⬛ **「연 0원」 결정(2026-08-12)으로 macOS 자동업데이트는 포기한다.** Apple Developer Program을 쓰지 않으므로 서명이 불가능하고, 서명 없이는 Squirrel.Mac이 동작하지 않는다. → **`CE5-S1`의 범위는 Windows 전용**이 된다. macOS 사용자는 새 dmg를 직접 받아 재설치한다
    - Windows는 미서명으로도 자동업데이트가 동작한다. 다만 `win.verifyUpdateCodeSignature`가 **기본 `true`**라 미서명 빌드에서는 **`false`로 꺼야 한다**(실측 확인 — `winOptions.d.ts:74`). → **2026-08-14 반영 완료**
    - *(참고 — 유료로 전환할 경우에만 해당) 현재 툴체인은 공증을 못 한다: `electron-builder 23.6.0`의 `macOptions.d.ts`에 `notarize` 필드 0건, 내장 옵션은 24부터. `altool`은 2023-11-01부터 Apple이 거부. 상세는 `03-signing.md`*
  - ~~`publish` 설정에 `owner`/`repo` 명시~~ → **완료(2026-08-14)** `HohyeonKim592`/`HeiChitty-Chat-Client`. `package.json` 의 `repository` URL 추론 의존을 끊었다
  - ~~`electron/src/index.ts`의 `.catch()` 삼킴 재검토(2026-08-10 응급조치분)~~ → **완료(2026-08-14). 결론: 유지 + 호출 범위 축소**
    - `.catch()` **유지** — public 전환으로 피드 접근은 열렸으나 **릴리스가 아직 0건**이고 오프라인 기동도 있다. 실패가 unhandled rejection 이 되면 모달로 앱이 멈추는 구조는 그대로다
    - **`process.platform === 'win32'` 일 때만 호출** — macOS 는 미서명이라 Squirrel.Mac 이 성립하지 않는다. 실패가 확정된 요청을 매 기동마다 보내지 않는다
  - `.blockmap`은 이미 생성되고 있다(mac 175K · win 81K) — 차등 다운로드로 실 대역폭은 더 줄어든다
- [ ] `CE5-S2` **모바일** — 스토어/사내 배포에 맞춘 업데이트 전략 + 강제 최소버전(원격 게이트) 〔G-DIST 의존〕
- [ ] `CE5-S3` 웹자산 OTA(선택) — `web/` 핫업데이트(Capacitor live-update류) 검토

### CE6 — 품질·게이트
- [x] `CE6-S1` lint — 셸 JS 구문 검사 (`npm run lint` = `node --check web/app.js`)
- [x] `CE6-S2` **셸 로직 스모크** — `test/ce1-shell.mjs`(zero-dep, DOM 목으로 실제 `app.js` 구동): config 정규화·자동접속(`location.replace`)·오프라인·preflight 실패·재시도·online 자동재시도 = **9/9 PASS** (`npm test` = `npm run smoke`)
  - **한계** — 목 `fetch`에는 CSP가 없다. 2026-08-10의 CSP 차단 버그 2건은 9/9 통과 상태에서도 실기가 완전히 죽어 있던 사례다. **플랫폼 정책(CSP·cleartext·ATS)이 얽힌 건 스모크로 못 잡으니 실기 검증이 필수**
- [ ] `CE6-S3` 3플랫폼 빌드 검증 — android assemble · electron build(mac·win)
- [ ] `CE6-S4` pre-push 훅 — lint+스모크 (HeiChitty-Chat E0-S3 관례 승계). *CE0-S2로 원격이 생겨 착수 가능*

## 결정 게이트

| 게이트 | 시점/Story | 통과 기준 | 비고 |
|---|---|---|---|
| **G-ID** appId 확정 | CE3-S1 (배포 전) | 정식 번들 ID 확정 | ✅ 통과 — `kr.co.heichitty.chat`(2026-08-10). Android 패키지명과 공용 |
| **G-DOM** 허용 도메인 | CE3-S2 | `allowNavigation`을 접속 대상으로 한정 | ✅ **통과** — 방향 확정(2026-08-11, 같은 Mac mini 루프백) + **좁히기 완료**(2026-08-12, `["*"]` → `["127.0.0.1"]`). 운영 도메인은 추후 도입 시 호스트만 교체 |
| ~~**G-IOS** iOS 빌드환경~~ | — | — | ⬛ **폐기(2026-08-12)** — iOS를 범위에서 뺐으므로 게이트 자체가 소멸. 아래 「iOS — 범위 밖」 |
| **G-SIGN** 코드 서명 | CE2-S2 | Android 업로드 키 · 데스크톱 서명 | 🟡 **조사 완료(2026-08-12) · 방침 확정** — 요건은 **`03-signing.md`가 정본**. **연 0원 방침**에 따라 Apple(연 $99)·Windows OV(연 $150–300)를 쓰지 않는다 → macOS·Windows 모두 **미서명 배포**. Android 서명은 원래 무료(자체 keystore) |
| **G-DIST** 배포 채널 | CE2-S4 | 배포 채널 확정 | ✅ **데스크톱 통과** — GitHub Releases + `electron-updater`(2026-08-12). 모바일은 ⏸ **Android 실기기 테스트 이후 결정**(2026-08-14. Play $25는 1회성이라 방침과 충돌 없음). Apple App Store는 iOS 범위 밖으로 소멸 |

## iOS — 범위 밖

**2026-08-12 결정: iOS를 대상 플랫폼에서 뺀다.** 삭제가 아니라 **범위 밖 보류**다 — 재개 조건을 아래에 남긴다.

**이유** — iOS는 **무료 배포 경로가 존재하지 않는 유일한 플랫폼**이다. Apple Developer Program(연 USD 99) 없이는 배포 자체가 불가능하고, 무료 계정으로는 Xcode를 통해 본인 기기에 7일짜리 프로비저닝만 된다. 「연 0원」 방침(위 결정 요약)과 양립하지 않는다.

부수적으로 함께 소멸한 항목:
- **G-IOS 게이트** (Xcode·CocoaPods 설치) — 사용자 작업이 하나 줄었다
- **App Store 심사지침 4.2(Minimum Functionality) 리스크** — 원격 웹 뷰어라 심사 통과 여부가 불확실했다. 이 불확실성이 통째로 사라진 것이 **부수 이득**이다
- `CE0-S6`(iOS 플랫폼 추가) · `CE2-S3`(iOS 빌드·서명)

**코드에는 흔적이 없다.** `cap add ios`를 실행한 적이 없어 `ios/` 폴더가 애초에 생성되지 않았다. 제거한 것은 설정·스크립트의 진입점뿐이다:
`package.json`의 `open:ios`·`add:ios` · `.gitignore`의 `ios/App/*` 3줄 · `scripts/collect-mobile.sh`의 `ios` 인자 분기.

### 재개 조건

아래가 모두 성립하면 재개를 검토한다. 하나라도 빠지면 재개해도 배포에 도달하지 못한다.

1. **연 USD 99 지출 승인** — 이것이 유일하고 절대적인 관문이다
2. **Xcode + CocoaPods 설치** (구 G-IOS) — 용량·라이선스 동의 때문에 사용자 직접 작업
3. **App Store 심사 4.2 리스크 확인** — 원격 웹 뷰어에 이 조항이 어떻게 적용되는지 **미조사**다. 지침 조항의 존재는 사실이나 이 앱에 대한 적용 여부는 확인된 바 없다

재개 시 되살릴 작업: `npm run add:ios` → `capacitor.config.json`의 `allowNavigation` 확인(iOS도 같은 값을 쓴다) → ATS 예외(http 서버 접속 시) → `collect-mobile.sh`에 ipa 수집 분기 복원.

## Play 계정 — 최종단계 함정

**2026-08-14 결정: Play 업로드 여부는 Android 실기기 테스트를 마친 뒤 정한다.** *(2026-08-12 「최종단계 검토」에서 판단 시점을 앞당겨 구체화)* 뷰어가 실기기에서 제대로 도는지 확인되기 전에는 배포 채널을 정할 근거가 없다.

등록비 **$25는 최초 1회뿐**(연회비 없음)이라 「연 0원」 방침과 충돌하지 않는다. 앱이 무료이고 인앱결제도 없으므로 Google 수수료(15~30%)도 해당 없다.

⚠️ **다만 미루면 마지막에 2주가 붙는다.**

**개인 계정**(2023-11-13 이후 생성분 전부)은 프로덕션 출시 전 **「테스터 12명 × 연속 14일」** 비공개 테스트가 의무다. **지금 만들든 나중에 만들든 똑같이 적용된다** — 계정 개설을 미룬다고 피할 수 있는 조항이 아니다. **조직 계정만 면제**다.

즉 실기기 테스트를 마친 뒤 개인 계정으로 정하면, **그 시점부터** 테스터 12명을 모아 14일을 기다려야 한다. 출시 직전에 붙는 2주다.

**완화 방법 (둘 중 하나를 미리 정해두면 대기시간이 사라진다)**
- **조직 계정** — 12테스터 의무가 통째로 면제된다. 사업자 확인 절차가 필요한데 **요건 미확인**
- **개인 계정이 불가피하면** — 최종단계 *전에* 계정을 만들고 비공개 테스트를 미리 돌려둔다. 다른 작업과 대기시간이 겹쳐 사라진다

**Play를 안 쓰는 선택지도 있다** — GitHub Releases에 APK 직접 배포(사용자가 "알 수 없는 앱 설치" 허용) 또는 F-Droid 등재. 이러면 **3플랫폼 전부 GitHub Releases 한 곳**으로 통일돼 배포 구조가 단순해진다. 대가는 일반 사용자 도달성 저하와 자동 업데이트 부재.

## 진행 순서 (Wave)

- **Wave 0 〔결정〕 완료(2026-08-12)** — ~~G-ID~~ ✅ · ~~G-DOM~~ ✅ · ~~G-IOS~~ ⬛ 폐기(iOS 범위 밖) · ~~G-SIGN~~ ✅ 연 0원 = 미서명 배포 · ~~G-DIST~~ ✅ 데스크톱 확정(모바일 채널은 ⏸ Android 실기기 테스트 이후로 이월) → **착수를 막는 결정은 더 없다**
- **Wave 1** CE1 뷰어 코어 완성(config-only: S1' config 주입·S3 연결실패·S5 로딩) + CE3 구성·브랜딩(appId·allowNavigation 좁히기·아이콘/스플래시/표시명)
- **Wave 2** CE2 플랫폼 빌드(Desktop→Android)
- **Wave 3** CE4 네이티브 통합·푸시 + CE5 자동 업데이트
- **Wave 4** CE6 품질·게이트

## 검증 현황 (2026-08-10 Desktop 실기검증 반영)

> 방식: 자동화 라이브러리 부재 → 단위는 `npm test`(셸 스모크). 실기는 Electron을 `--remote-debugging-port`로 띄우고 **CDP로 렌더러에 직접 붙어** DOM·콘솔·응답헤더·렌더이미지를 수집한다(창이 화면에 안 뜨는 별건 문제 때문에 화면캡처 대신 채택. 목이 아닌 실제 렌더러라 검증 강도는 더 높음).

**검증 완료**
- ✅ 셸 스모크 9/9 (`npm test`) — config 정규화(로컬 http 포함)·자동접속(`location.replace`)·오프라인·preflight 실패·**재시도**·online 자동재시도·config 누락/무효 안전망
- ✅ **Desktop 자동접속**(2026-08-10) — 수동개입 0으로 셸 → `http://127.0.0.1:3000/` 이동, 원격 로그인 화면 렌더
- ✅ **원격 자산 로드**(2026-08-10) — `chat.css`(142룰)·`chat.js`·`socket.io.js` 차단 0건
- ✅ **CSP 헤더 실물 확인**(2026-08-10) — 셸 응답 = `connect-src`에 서버 오리진 1개만 / 원격 응답 = 서버 원본 CSP 그대로
- ✅ **도달 실패 시 상태화면+재시도**(2026-08-10) — **서버를 실제로 정지시킨 콜드 부팅**으로 확인. 셸 유지·상태화면·재시도 노출, 재시도 클릭해도 엉뚱한 이동 없음. 콘솔은 `ERR_CONNECTION_REFUSED` ×2, **CSP refusal 0건** — 상태화면이 *옳은 이유로* 뜬다(수정 전엔 같은 화면이 CSP 차단 때문이었다)
- ✅ **재시도 → 접속**(2026-08-10) — 상태화면에서 서버 재기동 후 재시도 클릭 → **앱 재시작 없이** 원격 이동. `chat.css` 142룰 + **`io` 전역 정의됨(socket.io 로드 확인)**
- ✅ **오프라인 분기**(2026-08-10) — 전용 메시지 `네트워크 연결이 없습니다` + 오프라인 배너 노출 + 접속 시도 안 함
- ✅ **online 복귀 자동 재시도**(2026-08-10) — 수동 개입 없이 원격 접속
- ✅ **서버 변경의 클라 반영 특성**(2026-08-10) — `no-cache`+`ETag`, SW 없음 → 서버만 고치면 다음 실행에서 즉시 반영
- ✅ **패키징(프로덕션) 빌드 동작**(2026-08-10) — dmg 산출물 실행 시 렌더러가 서버로 TCP 3연결(HTML·CSS·JS) 확립. 즉 **asar 안의 `app/config.js` 읽기 성공 → 프로덕션 CSP `connect-src` 정상 → preflight 통과 → 자동접속**까지 확인
  - ⚠️ **패키징 앱은 CDP가 붙지 않는다** (`/json` 빈 응답, browser WS 연결 불가). 개발 빌드에서 쓰던 CDP 검증법을 못 쓰므로, 패키징 검증은 **로그·TCP 연결·화면 캡처**로 한다

> **검증 범위 명시** — 도달 실패(A)·재시도(B)는 **서버를 실제로 정지·재기동**시켜 검증했다. 반면 **오프라인 분기는 `navigator.onLine` 오버라이드**다 — Electron의 CDP 오프라인 에뮬레이션이 `navigator.onLine`을 뒤집지 않아(에뮬레이션의 한계이지 앱 문제 아님) 그 분기를 그 방법으로는 태울 수 없었다. **OS 수준 실제 네트워크 해제는 미검증.**

**남은 검증 후보 (수동·실기)**
- [ ] **로그인 → 채팅 화면 진입** 끝단 동선 — 로그인 화면 렌더까지만 확인됨
- [ ] **OS 수준 실제 오프라인** — 위 범위 명시 참조
- [ ] **dmg/exe 실제 설치 테스트** — 산출물 생성·기동은 확인했으나 설치 과정(dmg 마운트→드래그, NSIS 설치 마법사)은 미검증. **미서명이라 Gatekeeper·SmartScreen 경고가 뜬다**
- [ ] **Windows 실기 실행** — exe는 이 Mac에서 만들었을 뿐 Windows에서 실행해 보지 않았다
- [x] **`${os}` 매크로 실기 검증**(CE2-S0) — 2026-08-14 mac 빌드에서 확인(`appOutDir=…/release/mac/mac-universal`). win 은 미확인(같은 매크로)
- [ ] **모바일 preflight/CSP 동등 검증** — Android 웹뷰에서도 preflight `fetch`가 막히는지
- [ ] **Android 실기** — 첫 화면에서 원격으로 자동접속(`replace`로 셸 미잔류) · 하드웨어 뒤로가기 정책은 CE4-S1
- [ ] 로그인 후 메시지 송수신·방 진입 등 채팅 기능 전반(서버 책임이나 뷰어 통과 확인)
- [ ] Android **빌드 산출물 실행**(CE2) · http 서버 접속 시 cleartext 설정(CE3)
- [ ] **Electron 창을 CLI에서 확인 불가** — `screencapture`로 잡히지 않고 System Events는 창을 0개로 보고한다. **원인 미확인.**
  - ~~`windowStateKeeper` 저장 좌표가 화면 밖~~ → **아님**. 실제 저장값은 `{x:256, y:91, 1000x800}` / `displayBounds 1512x982`로 화면 안이다(2026-08-10 확인)
  - 앱 자체는 정상이다 — 페이지 로드·서버 접속이 TCP로 확인된다. **CLI 관측의 한계**일 가능성(터미널이 전체화면 Space 점유, Electron 창의 접근성 열거 특성)이 높다. 사용자 육안 확인 필요

## 외부 의존 (서버측)

- **푸시(CE4-S5)** — 서버가 이벤트 발생 시 FCM/APNs로 발송해야 함(HeiChitty-Chat 측 작업). 클라는 토큰 등록·수신·라우팅 담당.
- **첨부(CE4-S3)** — HeiChitty-Chat E6(파일·첨부) 진척에 맞춰 동작.
- **강제 최소버전(CE5-S2)** — 서버가 클라 최소버전을 알려주는 엔드포인트가 있으면 연동.
- **메일 연결** — 2026-08-11 통보. **서버 리포(`HohyeonKim592/heichitty-chat`) 작업**이며 이 저장소가 아니다. 클라이언트 영향 범위는 아직 미정 — 메일 링크로 앱을 여는 딥링크(`CE4-S4`)나 `allowNavigation` 확대가 얽힐 수 있으나 **통보 시점에 언급된 바 없으므로 추측해 착수하지 않는다.** 범위가 정해지면 여기에 갱신.
