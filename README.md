# HeiChitty-Chat-Client

웹 기반 **HeiChitty-Chat**을 데스크톱·모바일에서 띄우는 뷰어 앱입니다.
Capacitor 웹뷰 래퍼 한 벌로 **Windows · macOS · Android**를 대상으로 합니다.
**iOS는 범위 밖입니다**(2026-08-12 — 무료 배포 경로가 없어 제외. 근거·재개 조건은 `docs/spec/02-epic-story.md` 「iOS — 범위 밖」).

채팅·인증·실시간 로직은 전부 원격 HeiChitty-Chat 서버가 담당하고, 이 앱은 그 웹 화면을 띄우는 얇은 뷰어입니다.

---

## 동작 방식

이 뷰어는 **사용자에게 서버 주소를 묻지 않습니다**(config-only). 서버 주소는 빌드 타임 설정값이며, 앱은 그 주소로 자동 접속만 합니다.

1. 실행하면 빌드에 박힌 서버 주소(`web/config.js`의 `window.HEICHITTY_SERVER`)로 접속을 시도합니다. 이동 전 도달성을 확인(preflight)합니다.
2. 도달 가능하면 웹뷰가 그 주소(HeiChitty-Chat 웹)로 이동합니다 — `location.replace`라 셸은 히스토리에 남지 않습니다(뒤로가기로 셸에 돌아오지 않음).
3. 도달 불가/오프라인이면 **상태 화면**에 머물며 "다시 시도" 버튼을 제공합니다. 네트워크가 온라인으로 복귀하면 자동 재시도합니다.

서버 주소(`web/config.js`)는 현재 `http://127.0.0.1:3000`입니다. **테스트 단계에서는 Mac mini 한 대에서 서버와 클라이언트를 함께 돌리므로 이 루프백 주소가 실제 접속 주소입니다**(2026-08-11 확정). 운영서버는 추후 도입 가능성이 있으며, 그때는 이 `config.js` 한 줄과 `capacitor.config.json`의 `allowNavigation`(**호스트만**)을 함께 교체해 재빌드합니다(G-DOM).
`localhost`·`127.x` 등 루프백은 스킴 생략 시 `http://`로 정규화됩니다(그 외는 `https://`).

---

## 사전 요구사항

| 대상 | 필요 도구 |
|---|---|
| 공통 | Node.js ≥ 20, npm |
| Android | Android Studio + Android SDK (`ANDROID_HOME` 설정) |
| Windows / macOS 데스크톱 | (Electron) 추가 도구 없음 — Windows 설치파일도 이 Mac에서 만듭니다 |

---

## 설치

```bash
npm install
```

웹 자산(`web/`)을 수정한 뒤에는 각 플랫폼에 반영하기 위해 동기화합니다.

```bash
npx cap sync
```

---

## 데스크톱 (Windows / macOS) — Electron

```bash
npx cap sync @capacitor-community/electron
cd electron

# 개발 실행 (창 띄우기 — 웹 자산 변경 자동 반영)
npm run electron:start-live
# 또는 디버거 포함 단발 실행
npm run electron:start

# 배포 패키지 빌드 — 저장소 루트에서
./scripts/build-desktop.sh mac    # macOS universal dmg
./scripts/build-desktop.sh win    # Windows x64 NSIS exe
```

빌드 스크립트가 **정리 → sync → tsc → 패키징 → 중간산출물 삭제**를 한 번에 처리합니다.
산출물은 `release/mac/`·`release/win/`에 생깁니다 — [산출물 관리](#산출물-관리-release) 참조.

> **수기로 `electron-builder`를 직접 부를 때의 함정 2가지 (2026-08-10 실측)** — 스크립트는 이 둘을 막아 둡니다.
> - `--mac dmg`처럼 **타깃까지 CLI로 주면** config의 `arch: ["universal"]`이 덮여 host 아키텍처로만 나옵니다. **`--mac`/`--win`만 주고 arch는 config에 맡기세요.**
> - `npm run electron:make`는 `-p always`라 **GitHub 릴리스 업로드를 시도**합니다. 로컬 산출물만 원하면 `-p never`를 쓰세요.

> **Windows 빌드는 이 Mac에서 됩니다** — electron-builder가 자체 번들 wine(`wine-4.0.1-mac`)을 자동으로 내려받아 처리하므로 wine을 따로 설치할 필요가 없습니다.

> **현재 산출물은 미서명입니다.** macOS는 Gatekeeper, Windows는 SmartScreen 경고가 뜹니다. 공개 배포 전 코드 서명이 필요합니다(G-SIGN).

---

## Android

```bash
npx cap sync android
npx cap open android     # Android Studio 열기 → Run/Build APK
```

CLI로 디버그 APK만 뽑으려면:

```bash
cd android
./gradlew assembleDebug
# gradle 산출물: android/app/build/outputs/apk/debug/app-debug.apk
```

빌드한 apk·aab를 `release/android/`로 모으려면:

```bash
./scripts/collect-mobile.sh android
```

---

## 코드 서명 — 하지 않습니다

**연 0원 방침**(2026-08-12)에 따라 유료 인증서·개발자 프로그램을 쓰지 않습니다. macOS·Windows 모두 **미서명 배포**입니다.

| 플랫폼 | 사용자가 겪는 것 |
|---|---|
| Windows | SmartScreen 경고 — "추가 정보 → 실행" 클릭 필요. 자동업데이트는 정상 동작 |
| macOS | 첫 실행 시 **시스템 설정 → 개인정보 보호 및 보안 → "확인 없이 열기"** + 관리자 인증 필요. **자동업데이트 불가**(서명이 전제라서) |
| Android | 없음 — Android 서명은 원래 무료입니다 |

> macOS Sequoia(15)부터 control-click → 열기 우회는 동작하지 않습니다. 시스템 설정 경로를 안내하세요.

근거·유료 전환 시 참고값은 `docs/spec/03-signing.md`.

---

## 산출물 관리 (`release/`)

배포 산출물은 **저장소 루트 `release/` 아래 플랫폼별로** 분리됩니다. `electron/`은 Capacitor가 재생성하는 영역이라 배포물을 그 밖에 둡니다. `release/` 전체가 `.gitignore` 처리돼 있습니다.

```
release/
├── mac/        HeiChitty-Chat-0.0.1-universal.dmg · blockmap · latest-mac.yml
├── win/        HeiChitty-Chat Setup 0.0.1.exe · blockmap · latest.yml
├── android/    app-debug.apk · app-release.aab      (collect-mobile.sh 로 수집)
└── _archive/
    ├── mac/0.0.1-20260810-220354/       직전 산출물
    └── win/…                            KEEP개까지 보관, 초과분 자동 폐기
```

데스크톱의 플랫폼 분리는 electron-builder 설정 한 줄이 담당합니다 — `directories.output: "../release/${os}"` (`${os}`는 `mac`/`win`/`linux`로 확장).

**폐기 정책** — 두 스크립트 모두 빌드/수집 시작 시 기존 산출물을 `_archive/<플랫폼>/<버전>-<시각>/`으로 옮기고, 보관 개수를 넘는 오래된 것을 지웁니다. 이 로직은 `scripts/lib/release-store.sh`에 한 벌로 두고 두 스크립트가 `source`해 씁니다. 기본 2벌이며 `KEEP`으로 조정합니다:

```bash
KEEP=3 ./scripts/build-desktop.sh mac     # 3벌 보관
KEEP=0 ./scripts/build-desktop.sh mac     # 보관 없이 매번 폐기
```

언팩 앱 번들(`mac-arm64/`, `win-unpacked/`)과 아이콘 변환 캐시(`.icon-icns/`)는 dmg/exe가 있으면 재생성 가능한 중간산출물이라 **아카이브하지 않고 빌드 직후 삭제**합니다. mac 언팩본만 237MB였습니다.

용량 기준: dmg 164MB + exe 80MB ≈ 1벌 244MB. 기본 `KEEP=2`면 최신 1벌 + 보관 2벌 = 최대 약 730MB.

---

## 설정값 (배포 전 확정 필요)

`web/config.js`:

- **`window.HEICHITTY_SERVER`** — 접속할 서버 주소. 현재 `http://127.0.0.1:3000`은 **테스트 단계의 실제 주소**입니다(Mac mini에서 서버·클라이언트 동시 실행, 2026-08-11 확정). 운영서버 도입 시 그 주소로 교체하고, 아래 `allowNavigation`에는 **그 주소의 호스트만** 맞춰 넣으세요.

`capacitor.config.json`:

- **`appId`** — `kr.co.heichitty.chat` (2026-08-10 확정). Android 패키지명으로 사용됩니다. 이후 변경할 땐 `android/app/build.gradle`의 `namespace`·`applicationId`, `android/app/src/main/java/` 패키지 디렉토리, `strings.xml`의 `package_name`·`custom_url_scheme`도 함께 고쳐야 합니다 — `cap sync`로는 갱신되지 않습니다.
- **`appName`** — 표시 이름. 현재 `HeiChitty-Chat`.
- **`server.allowNavigation`** — 현재 `["127.0.0.1"]` (2026-08-12 `["*"]`에서 좁힘, `CE3-S2` 완료).
  - ⚠️ **URL이 아니라 호스트 마스크입니다.** Capacitor는 `HostMask.matches(url.getHost())`로 판정하므로 `http://127.0.0.1:3000` 같은 전체 URL을 넣으면 **매칭되지 않아 접속이 막힙니다**. `config.js` 주소에서 **호스트만** 뽑아 적으세요(스킴·포트는 표현 불가 — 해당 호스트의 모든 포트가 열립니다).
  - 마스크는 `.`으로 쪼개 라벨 단위로 비교하며 `*` 와일드카드를 씁니다(예: `*.example.com`). 마스크가 `*` 하나면 전부 허용입니다.

---

## 프로젝트 구조

```
HeiChitty-Chat-Client/
├─ web/                 # 뷰어 진입 셸 (자동접속 + 상태/재시도 화면)
│  ├─ index.html
│  ├─ config.js        # 빌드 타임 서버 주소 (window.HEICHITTY_SERVER)
│  ├─ app.js            # config 주소 자동접속·도달성 점검·최상위 네비게이션
│  └─ style.css
├─ capacitor.config.json
├─ scripts/             # 빌드·산출물 관리
│  ├─ build-desktop.sh  # mac|win 배포 빌드 (정리→sync→tsc→패키징)
│  ├─ collect-mobile.sh # android 산출물을 release/ 로 수집
│  └─ lib/release-store.sh  # 아카이브·폐기 공통 로직 (source 전용, 위 둘이 공유)
├─ test/
│  └─ ce1-shell.mjs     # CE1 셸 스모크 (zero-dep, npm test)
├─ docs/
│  ├─ TODO.md           # 작업 큐·남은 검증 후보
│  └─ spec/02-epic-story.md  # 단계화 로드맵(EPIC·STORY·게이트)
├─ android/             # Capacitor 생성 (cap add android)
├─ electron/            # Capacitor 생성 (cap add @capacitor-community/electron)
│  └─ src/setup.ts      # 데스크톱 네비게이션 허용 정책 (뷰어용으로 완화됨)
├─ release/             # 배포 산출물 (gitignore — 위 「산출물 관리」 참조)
└─ CLAUDE.md            # 작업원칙
```

> `ios/`는 없습니다 — iOS는 범위 밖입니다(2026-08-12).
