# 코드 서명 요건 (G-SIGN)

> 4플랫폼 서명 요건·비용·절차 조사 결과. **조사일 2026-08-12.**
> 게이트 표 정본은 `02-epic-story.md` 「결정 게이트」 — 이 문서는 그 G-SIGN 항목의 근거다.
> 가격·정책은 변한다. 착수 시점에 출처를 다시 확인할 것(맨 아래 「출처」).

## 요약 — 연간 고정비

| 플랫폼 | 필요한 것 | 비용 | 비고 |
|---|---|---|---|
| iOS + macOS | Apple Developer Program | **USD 99 / 년** | 하나로 양쪽 커버 |
| Android | Play Console 계정 | **USD 25 / 1회** | 평생 |
| Windows | OV 코드서명 인증서 | **USD 150–300 / 년** | SignPath 자격 성립 시 0원 |

**연간 고정비 = Apple $99 + (Windows $150–300 또는 0원)**

## Apple — iOS·macOS 공통

- **Apple Developer Program USD 99/년.** 무료 티어로는 **배포가 불가능**하다(무료 계정은 Xcode·실기 테스트·포럼·버그리포트까지).
- 멤버십에 **"Notarization & Developer ID for Mac apps"**가 포함된다 → iOS App Store 배포와 macOS 스토어 밖 배포를 **같은 99달러로** 처리한다.
- 비영리·교육기관·정부기관은 fee waiver 대상일 수 있다.

### macOS — Developer ID + 공증(notarization)

**`CE5-S1`을 지금 막고 있는 항목이다.** electron-builder 문서 원문: *"macOS 앱은 자동업데이트가 동작하려면 반드시 서명되어야 한다."* 서명 없이는 Squirrel.Mac 자동업데이트가 성립하지 않는다.

🔴 **현재 툴체인으로는 공증을 못 한다** (2026-08-12 실측):

```
electron-builder / app-builder-lib = 23.6.0
macOptions.d.ts 의 notarize 필드   = 0건    ← 내장 공증 옵션 없음
afterSign 훅                        = 지원함
@electron/notarize                  = 미설치
```

`notarize` 설정 옵션은 **electron-builder 24부터** 도입됐다. 또한 Apple은 **2023-11-01부터 `altool` 업로드를 받지 않는다**(`notarytool` 필수) — 옛 공증 스크립트를 그대로 가져오면 실패한다.

**선택지**
- **(가) electron-builder 24+ 업그레이드 후** `mac: { notarize: true, hardenedRuntime: true }` — **권장**
- (나) 23.6.0 유지 + `afterSign` 훅에 `@electron/notarize` 직접 연결

**자격증명** (셋 중 하나)
- `APPLE_ID` + `APPLE_APP_SPECIFIC_PASSWORD` + `APPLE_TEAM_ID`
- API 키: `APPLE_API_KEY` + `APPLE_API_KEY_ID` + `APPLE_API_ISSUER` + `APPLE_TEAM_ID` (CI 권장)
- 키체인 프로파일: `APPLE_KEYCHAIN` + `APPLE_KEYCHAIN_PROFILE` + `APPLE_TEAM_ID`

### iOS

Apple 인증서 + 프로비저닝 프로파일 + Xcode가 필요하다. **`G-IOS`(Xcode·CocoaPods 설치)가 선행**이며, 별개로 **App Store 심사지침 4.2(Minimum Functionality) 리스크**가 남아 있다(`02-epic-story.md` `CE2-S3` 참조 — 원격 웹 뷰어라는 성격 때문).

## Android

- **Play Console 등록비 USD 25 (1회, 평생).**
- **Play 앱 서명이 필수다** — 2021년 8월 이후 신규 앱. 문서 원문: *"Play 앱 서명 구성은 Google Play를 통한 배포를 위해 앱에 서명하는 데 필수다(2021년 8월 이전 생성 앱 제외)."*
- **키 두 종류를 구분할 것**
  - *업로드 키* — 우리가 AAB/APK에 서명해 올릴 때 쓰는 키
  - *앱 서명 키* — Google이 보관하며 사용자 기기에 설치될 APK에 서명하는 키. **앱 수명 동안 바뀌지 않는다**
  - 업로드 키가 유출·분실돼도 재설정할 수 있다 → 자체 keystore 단독보다 복구 여지가 크다
- 키 유효기간은 **2033-10-22 이후**로 끝나야 한다(Play가 강제).
- 산출물은 **AAB**(Android App Bundle).

🔴 **계정 종류가 일정을 좌우한다** — **2023-11-13 이후 생성한 개인 계정**은 프로덕션 출시 전 **「테스터 12명 × 연속 14일」 비공개 테스트**를 통과해야 한다. **조직 계정은 면제.**
→ 개인 계정을 택하면 출시까지 **최소 2주가 강제로 추가**된다. 계정을 만들기 전에 정할 것.

## Windows

🔴 **Microsoft 권장안(Azure Artifact Signing)은 한국에서 못 쓴다.** 문서에 지역 제한이 명시돼 있다 — 조직은 **미국·캐나다·EU·영국**, 개인 개발자는 **미국·캐나다**만.

| 선택지 | 비용 | SmartScreen | 우리 적용 여부 |
|---|---|---|---|
| Microsoft Store (MSIX) | 무료 (Store가 재서명) | 경고 없음 | ❌ 산출물이 NSIS exe · 데스크톱 채널은 GitHub Releases로 확정 |
| Azure Artifact Signing | ~$9.99/월 | 평판 축적 | ❌ **지역 제한으로 불가** |
| **OV 인증서** | **$150–300/년** | 평판 축적 | ✅ 현실적 선택지 |
| EV 인증서 | $400+/년 | **OV와 동일** | ❌ 프리미엄 정당성 없음 |
| SignPath Foundation | **무료** | OV 수준 | 🟡 **후보** — 자격 요건 미확인 |
| 자체 서명 / 미서명 | 무료 | 차단 | ❌ 공개 배포 부적합 |

**알아둘 것 3가지**
- **2023년 6월부터 OV도 하드웨어 토큰/HSM 필수**(CA/B Forum Baseline Requirements, FIPS 140-2 Level 2 이상, 키 비추출). 개인키를 파일로 들고 있을 수 없어 **CI 서명이 번거로워진다**(클라우드 HSM 옵션을 제공하는 CA도 있다).
- **EV는 더 이상 의미 없다.** 2024년 Microsoft가 EV의 SmartScreen 즉시 통과를 없앴다. $400+/년을 내도 OV와 똑같이 평판을 쌓아야 한다.
- **2026-03-01 이후 발급 인증서는 유효기간 460일 상한** → 갱신이 연 1회꼴로 잦아진다.

**서명해도 초기 SmartScreen 경고는 뜬다.** 파일 해시별로 다운로드 평판이 쌓여야 사라진다. 서명의 값어치는 "경고 제거"가 아니라 **차단 회피 + 발행자 표시**다.

### 🟢 SignPath Foundation — 리포 공개로 열린 선택지

Microsoft 문서가 명시한다: *"오픈소스 프로젝트라면 SignPath Foundation이 자격 요건을 갖춘 프로젝트에 무료 코드서명을 제공한다. OV 수준 인증서 서명을 관리형 파이프라인으로 제공."*

**2026-08-12 리포 public 전환으로 후보가 됐다.** 성립하면 Windows 연 $150–300이 **0원**이 된다. 자격 요건은 **미확인** — 착수 전 확인할 것.

## 착수 순서

의존관계상 순서가 정해진다.

1. **Apple Developer Program 가입 ($99/년)** — iOS·macOS 양쪽의 유일한 관문이자 **`CE5-S1`을 지금 막고 있는 항목**. 가장 먼저
2. **Google Play 계정 종류 결정** (개인 vs 조직) → 12테스터 의무 여부가 갈린다. 등록비 $25
3. **SignPath Foundation 자격 확인** → 성립하면 Windows 비용 0원, 아니면 OV 인증서 구매
4. **electron-builder 24+ 업그레이드** — macOS 공증의 전제

## ⚠️ 미확인 (추측하지 말 것)

- **SignPath Foundation의 구체적 자격 요건** — 이 프로젝트가 해당하는지 확인 안 됨
- **OV 인증서의 한국 발급 대행·실제 견적** — $150–300은 Microsoft 문서의 일반 범위이지 한국 실거래가가 아님
- **Apple Developer Program 조직 가입의 D-U-N-S 번호 요구 여부** — 이번 조사에서 확인하지 않음
- **Play Console 조직 계정의 사업자 확인 절차**

## 출처

- [Apple Developer Program 멤버십 비교](https://developer.apple.com/support/compare-memberships/)
- [Apple notary service update — altool 중단 (2023-11-01)](https://developer.apple.com/news/upcoming-requirements/?id=11012023a)
- [Windows 코드서명 옵션 — Microsoft Learn](https://learn.microsoft.com/en-us/windows/apps/package-and-deploy/code-signing-options)
- [Android 앱 서명 — Play 앱 서명·업로드 키](https://developer.android.com/studio/publish/app-signing)
- [신규 개인 개발자 계정 테스트 요건 — Play Console 도움말](https://support.google.com/googleplay/android-developer/answer/14151465)
- [macOS Notarization — electron-builder](https://www.electron.build/docs/features/code-signing/notarization/)
