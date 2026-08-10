# heichitty-chat-client

웹 기반 **HeiChitty Chat**을 데스크톱·모바일에서 띄우는 뷰어 앱입니다.
Capacitor 웹뷰 래퍼 한 벌로 **Windows · macOS · Android · iOS**를 모두 대상으로 합니다.

채팅·인증·실시간 로직은 전부 원격 HeiChitty Chat 서버가 담당하고, 이 앱은 그 웹 화면을 띄우는 얇은 뷰어입니다.

---

## 동작 방식

이 뷰어는 **사용자에게 서버 주소를 묻지 않습니다**(config-only). 서버 주소는 빌드 타임 설정값이며, 앱은 그 주소로 자동 접속만 합니다.

1. 실행하면 빌드에 박힌 서버 주소(`web/config.js`의 `window.HEICHITTY_SERVER`)로 접속을 시도합니다. 이동 전 도달성을 확인(preflight)합니다.
2. 도달 가능하면 웹뷰가 그 주소(HeiChitty Chat 웹)로 이동합니다 — `location.replace`라 셸은 히스토리에 남지 않습니다(뒤로가기로 셸에 돌아오지 않음).
3. 도달 불가/오프라인이면 **상태 화면**에 머물며 "다시 시도" 버튼을 제공합니다. 네트워크가 온라인으로 복귀하면 자동 재시도합니다.

서버 주소(`web/config.js`)는 임시 placeholder `http://127.0.0.1:3000`입니다 — 운영 도메인 확정 시 교체하고, `capacitor.config.json`의 `allowNavigation`도 같은 도메인으로 좁힙니다(G-DOM). 운영/개발 빌드는 이 `config.js` 한 줄만 교체해 전환합니다.
`localhost`·`127.x` 등 루프백은 스킴 생략 시 `http://`로 정규화됩니다(그 외는 `https://`).

---

## 사전 요구사항

| 대상 | 필요 도구 |
|---|---|
| 공통 | Node.js ≥ 20, npm |
| Android | Android Studio + Android SDK (`ANDROID_HOME` 설정) |
| iOS | **macOS** + Xcode + CocoaPods (`sudo gem install cocoapods`) |
| Windows / macOS 데스크톱 | (Electron) 추가 도구 없음 |

> iOS는 Apple 정책상 **macOS + Xcode에서만** 빌드됩니다.

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

# 배포 패키지 빌드 — 반드시 sync → build → builder 순서
npx cap sync @capacitor-community/electron    # web/ → electron/app/
cd electron && npm run build                   # tsc → electron/build/src/

npx electron-builder --mac -c ./electron-builder.config.json -p never   # macOS universal dmg
npx electron-builder --win -c ./electron-builder.config.json -p never   # Windows x64 NSIS exe
```

**산출물은 저장소 루트 `release/`에 생깁니다** (`directories.output: "../release"`).
`electron/`은 Capacitor가 재생성하는 영역이라 배포물을 그 밖에 둡니다. `.gitignore` 처리돼 있습니다.

> **호출 함정 2가지 (2026-08-10 실측)**
> - `--mac dmg`처럼 **타깃까지 CLI로 주면** config의 `arch: ["universal"]`이 덮여 host 아키텍처로만 나옵니다. **`--mac`/`--win`만 주고 arch는 config에 맡기세요.**
> - `npm run electron:make`는 `-p always`라 **GitHub 릴리스 업로드를 시도**합니다. 로컬 산출물만 원하면 위처럼 `-p never`를 쓰세요.

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
# 산출물: android/app/build/outputs/apk/debug/app-debug.apk
```

---

## iOS (macOS 전용)

iOS 플랫폼은 아직 추가돼 있지 않습니다(빌드 머신에 Xcode/CocoaPods가 있어야 추가됨). 준비가 되면:

```bash
npm run add:ios          # = npx cap add ios  (CocoaPods 필요)
npx cap sync ios
npx cap open ios         # Xcode 열기 → 서명 설정 후 Run/Archive
```

정식 배포 시 Apple 개발자 계정과 코드 서명이 별도로 필요합니다.

---

## 설정값 (배포 전 확정 필요)

`web/config.js`:

- **`window.HEICHITTY_SERVER`** — 접속할 서버 주소. 현재 `http://127.0.0.1:3000`은 **임시 placeholder**입니다. 운영 도메인으로 교체하세요(아래 `allowNavigation`과 동일 도메인으로).

`capacitor.config.json`:

- **`appId`** — `kr.co.heichitty.chat` (2026-08-10 확정). Android 패키지명·iOS Bundle ID로 사용됩니다. 이후 변경할 땐 `android/app/build.gradle`의 `namespace`·`applicationId`, `android/app/src/main/java/` 패키지 디렉토리, `strings.xml`의 `package_name`·`custom_url_scheme`도 함께 고쳐야 합니다 — `cap sync`로는 갱신되지 않습니다.
- **`appName`** — 표시 이름. 현재 `HeiChitty Chat`.
- **`server.allowNavigation`** — 현재 `["*"]`(모든 도메인 허용). 운영 서버 도메인이 확정되면 해당 도메인으로 **좁히는 것을 권장**합니다(`config.js` 주소와 동일 도메인).

---

## 프로젝트 구조

```
heichitty-chat-client/
├─ web/                 # 뷰어 진입 셸 (자동접속 + 상태/재시도 화면)
│  ├─ index.html
│  ├─ config.js        # 빌드 타임 서버 주소 (window.HEICHITTY_SERVER)
│  ├─ app.js            # config 주소 자동접속·도달성 점검·최상위 네비게이션
│  └─ style.css
├─ capacitor.config.json
├─ android/             # Capacitor 생성 (cap add android)
├─ electron/            # Capacitor 생성 (cap add @capacitor-community/electron)
│  └─ src/setup.ts      # 데스크톱 네비게이션 허용 정책 (뷰어용으로 완화됨)
└─ CLAUDE.md            # 작업원칙
```
