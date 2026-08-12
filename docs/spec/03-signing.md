# 코드 서명 방침 (G-SIGN)

> **방침: 연 0원.** 유료 인증서·개발자 프로그램을 쓰지 않는다 (2026-08-12 결정).
> 게이트 표 정본은 `02-epic-story.md` 「결정 게이트」 — 이 문서는 그 G-SIGN 항목의 근거다.
> 조사일 **2026-08-12**. 가격·정책은 변한다. 유료 전환을 검토할 때는 맨 아래 「출처」를 다시 확인할 것.

## 결정 요약

| 플랫폼 | 방식 | 비용 | 대가 |
|---|---|---|---|
| **Windows** | 미서명 + GitHub Releases | **0원** | SmartScreen 경고 (사용자가 "추가 정보 → 실행") |
| **macOS** | 미서명(ad-hoc) dmg | **0원** | **자동업데이트 불가** · 첫 실행 시 사용자 개입 |
| **Android** | 자체 keystore | **0원** | 없음 (Android 서명은 원래 무료) |
| ~~iOS~~ | — | — | **범위 밖** — 무료 배포 경로가 없다 |

**총 연간 비용 0원.** Google Play 등록비 $25는 **최초 1회뿐**(연회비 없음)이라 이 방침과 충돌하지 않는다 — 사용 여부는 최종단계에 검토한다(`02-epic-story.md` 「Play 계정 — 최종단계 함정」).

## 왜 유료를 쓰지 않기로 했나

조사 결과 **돈을 내도 얻는 것이 생각보다 적었다.**

- **Windows**: OV 인증서(연 $150–300)를 사도 **초기 SmartScreen 경고는 그대로 뜬다.** 경고는 서명 유무가 아니라 파일 해시별 다운로드 평판이 쌓여야 사라진다. 즉 유료의 실익은 "경고 제거"가 아니라 발행자 표시에 그친다.
- **EV 인증서(연 $400+)는 의미가 없어졌다.** 2024년 Microsoft가 EV의 SmartScreen 즉시 통과를 제거했다. OV와 동일하게 평판을 쌓아야 한다.
- **Apple(연 $99)**: iOS를 범위에서 빼면 용도가 macOS 서명 하나로 줄어든다. 그 대가로 얻는 것은 macOS 자동업데이트와 설치 마찰 제거뿐이다.

## 플랫폼별 상세

### Windows — 미서명 + GitHub Releases

**자동업데이트는 미서명으로도 동작한다.** 단 설정 하나를 바꿔야 한다:

```jsonc
// electron/electron-builder.config.json
"win": {
  "verifyUpdateCodeSignature": false   // 기본값 true — 미서명이면 반드시 false
}
```

기본값이 `true`면 electron-updater가 다운로드한 설치파일의 Authenticode 서명 주체를 빌드 시 심어둔 publisher name과 대조하고, 불일치 시 설치를 거부한다. 미서명 빌드에서는 이 검증을 꺼야 한다. (실측: `app-builder-lib/out/options/winOptions.d.ts:74`, `@default true`)

**대안 — Microsoft Store (MSIX)**: 2026년 개발자 계정 등록비가 **개인·법인 모두 무료**가 됐고, Store에 MSIX로 올리면 **Microsoft가 재서명**해 SmartScreen 경고가 사라진다. 이것도 0원이다. 채택하지 않은 이유:
- 산출물을 `nsis` exe → `appx`/MSIX로 바꿔야 한다 (electron-builder 23.6.0에 `AppxTarget` 존재는 확인)
- 스토어 심사를 거쳐야 한다
- **`electron-updater` 자동업데이트를 포기해야 한다**(스토어가 업데이트 담당) → 확정된 데스크톱 채널(GitHub Releases + electron-updater)과 충돌

경고를 없애는 것보다 자동업데이트를 지키는 쪽이 낫다고 판단했다. 뒤집을 이유가 생기면 이 항목을 다시 볼 것.

### macOS — 미서명, 자동업데이트 포기

**서명 없이는 Squirrel.Mac 자동업데이트가 성립하지 않는다.** electron-builder 문서 원문: *"macOS 앱은 자동업데이트가 동작하려면 반드시 서명되어야 한다."*
→ **`CE5-S1`의 범위는 Windows 전용**이 된다. macOS 사용자는 새 dmg를 직접 받아 재설치한다.

**사용자 설치 경로** — 다운로드한 앱에는 quarantine 속성이 붙으므로 Gatekeeper가 막는다. 사용자는 **시스템 설정 → 개인정보 보호 및 보안 → 스크롤 → "확인 없이 열기" → 관리자 인증**을 거쳐야 한다.
⚠️ **macOS Sequoia(15)부터 control-click → 열기 우회가 막혔다.** 이전에 알려진 방법을 안내하면 동작하지 않는다.

Apple Silicon에서 모든 실행 바이너리는 서명을 요구하지만 **ad-hoc 서명으로 충분**하고, 이는 개발자 인증서 없이 가능하다(electron-builder가 identity 없을 때 ad-hoc 처리).

### Android — 원래 무료다

**$25는 Play Console 계정비이지 서명 비용이 아니다.** Android 앱 서명은 자체 keystore로 언제나 무료다.

- 키 유효기간은 **2033-10-22 이후**로 끝나야 한다(Play 배포 시 강제).
- **Play를 쓴다면** Play 앱 서명이 필수다(2021-08 이후 신규 앱). 업로드 키로 서명해 올리면 Google이 앱 서명 키로 재서명한다. 업로드 키는 분실·유출 시 재설정할 수 있다.
- ⚠️ **Play 개인 계정**(2023-11-13 이후 생성)은 프로덕션 전 **「테스터 12명 × 연속 14일」** 비공개 테스트가 의무다. **조직 계정은 면제.**
- **Play를 안 쓰는 무료 경로**: GitHub Releases에 APK 직접 배포(사용자가 "알 수 없는 앱 설치" 허용) · F-Droid 등재(오픈소스 — 리포 public 전환으로 후보, 요건 미확인). 대가는 도달성 저하와 자동 업데이트 부재.

### iOS — 범위 밖

무료 배포 경로가 **존재하지 않는다.** Apple Developer Program(연 $99) 없이는 배포가 불가능하고, 무료 계정으로는 Xcode를 통해 본인 기기에 7일 프로비저닝만 된다.
결정 경위와 재개 조건은 `02-epic-story.md` 「iOS — 범위 밖」.

## 부록 — 유료 전환을 검토할 때의 참고값

*(2026-08-12 조사 시점. 지금은 쓰지 않는다.)*

| 항목 | 비용 | 비고 |
|---|---|---|
| Apple Developer Program | USD 99/년 | iOS 배포 + macOS Developer ID·공증. 무료 티어로는 배포 불가 |
| Play Console | USD 25 / 1회 | 평생 |
| Windows OV 인증서 | USD 150–300/년 | **2023-06부터 하드웨어 토큰/HSM 필수**(CA/B Forum) → CI 서명이 번거로워진다. 2026-03-01 이후 발급분은 유효기간 460일 상한 |
| Windows EV 인증서 | USD 400+/년 | **권장하지 않음** — 2024년부터 SmartScreen 이점 소멸 |
| Azure Artifact Signing | ~USD 9.99/월 | ❌ **한국에서 사용 불가** — 조직은 미국·캐나다·EU·영국, 개인은 미국·캐나다 한정 |
| SignPath Foundation | 무료 | 오픈소스 대상. 자격 요건 **미확인** |

**macOS 공증을 하게 된다면** 현재 툴체인으로는 안 된다: `electron-builder 23.6.0`의 `macOptions.d.ts`에 `notarize` 필드가 **0건**(실측)이고 내장 옵션은 **24부터**다. 또한 Apple은 **2023-11-01부터 `altool` 업로드를 거부**한다(`notarytool` 필수). → electron-builder 24+ 업그레이드가 선행조건.

## ⚠️ 미확인 (추측하지 말 것)

- **미서명 dmg의 실제 사용자 경험** — Sequoia에서 「확인 없이 열기」 동선을 실기로 확인하지 않았다
- **미서명 exe의 `verifyUpdateCodeSignature: false` 자동업데이트** — 설정 존재는 실측했으나 실제 업데이트 성공은 미검증(`CE5-S1` 착수 시 확인)
- **F-Droid 등재 요건** · **SignPath Foundation 자격 요건**
- **Microsoft Store MSIX 경로** — electron-builder의 `appx` 산출물을 현재 Store가 그대로 받아주는지 미확인

## 출처

- [Apple Developer Program 멤버십 비교](https://developer.apple.com/support/compare-memberships/)
- [Apple notary service update — altool 중단 (2023-11-01)](https://developer.apple.com/news/upcoming-requirements/?id=11012023a)
- [Windows 코드서명 옵션 — Microsoft Learn](https://learn.microsoft.com/en-us/windows/apps/package-and-deploy/code-signing-options)
- [개인 개발자 무료 등록 — Microsoft Learn](https://learn.microsoft.com/en-us/windows/apps/publish/whats-new-individual-developer)
- [법인 등록비 폐지 (2026-05-07) — Windows Developer Blog](https://blogs.windows.com/windowsdeveloper/2026/05/07/publish-to-microsoft-store-as-a-company-now-with-free-registration-and-faster-onboarding/)
- [Android 앱 서명 — Play 앱 서명·업로드 키](https://developer.android.com/studio/publish/app-signing)
- [신규 개인 개발자 계정 테스트 요건 — Play Console 도움말](https://support.google.com/googleplay/android-developer/answer/14151465)
- [macOS Notarization — electron-builder](https://www.electron.build/docs/features/code-signing/notarization/)
