#!/usr/bin/env bash
#
# 모바일(android/ios) 산출물을 release/ 아래로 수집.
# gradle·Xcode 는 electron-builder 관할 밖이라 각자의 빌드 경로에 산출물을 만든다.
# 4플랫폼 배포물을 release/ 한곳에서 보게 하려고 여기로 복사한다(원본은 그대로 둔다).
#
# 사용법:
#   scripts/collect-mobile.sh android            # android/app/build/outputs 의 apk·aab 수집
#   scripts/collect-mobile.sh ios <ipa 경로>     # Xcode 로 export 한 ipa 를 지정해 수집
#   KEEP=3 scripts/collect-mobile.sh android     # 아카이브 보관 개수 (기본 2)
#
# 보관·폐기 정책은 scripts/lib/release-store.sh 가 담당한다(build-desktop.sh 와 공유).
#
# iOS 는 ios/ 플랫폼이 아직 추가되지 않아(`npm run add:ios` 미실행) Xcode export 경로가
# 확정되지 않았다. 그래서 경로를 추측하지 않고 인자로 받는다. 플랫폼 추가 후 경로가
# 고정되면 android 쪽처럼 자동 탐색으로 바꿀 것.

set -euo pipefail

PLATFORM="${1:-}"
case "$PLATFORM" in
  android|ios) ;;
  *)
    echo "사용법: $0 <android|ios [ipa 경로]>   (KEEP=<보관개수> 로 아카이브 개수 조정)" >&2
    exit 1
    ;;
esac

# shellcheck source=lib/release-store.sh
source "$(dirname "${BASH_SOURCE[0]}")/lib/release-store.sh"
release_store_init "$PLATFORM"

# 수집할 원본 목록을 SOURCES 에 채운다.
SOURCES=()

if [ "$PLATFORM" = android ]; then
  outputs="$RELEASE_ROOT/android/app/build/outputs"
  if [ ! -d "$outputs" ]; then
    echo "산출물이 없습니다: $(release_store_rel "$outputs")" >&2
    echo "먼저 빌드하세요:  cd android && ./gradlew assembleDebug" >&2
    exit 1
  fi
  while IFS= read -r f; do
    SOURCES+=("$f")
  done < <(find "$outputs" \( -name '*.apk' -o -name '*.aab' \) -type f)
else
  IPA="${2:-}"
  if [ -z "$IPA" ]; then
    echo "ios 는 ipa 경로가 필요합니다:  $0 ios <ipa 경로>" >&2
    echo "Xcode 에서 Archive → Distribute App 으로 export 한 .ipa 를 지정하세요." >&2
    exit 1
  fi
  if [ ! -f "$IPA" ]; then
    echo "파일이 없습니다: $IPA" >&2
    exit 1
  fi
  SOURCES+=("$IPA")
fi

if [ "${#SOURCES[@]}" -eq 0 ]; then
  echo "수집할 산출물이 없습니다 ($PLATFORM)." >&2
  exit 1
fi

echo "[1/2] 이전 산출물 정리 (KEEP=$RELEASE_KEEP)"
release_store_rotate

echo "[2/2] 수집 — ${#SOURCES[@]}개"
mkdir -p "$RELEASE_OUT"
for f in "${SOURCES[@]}"; do
  cp "$f" "$RELEASE_OUT/"
  echo "  $(basename "$f")  ←  $(release_store_rel "$f")"
done

echo
echo "완료 — $(release_store_rel "$RELEASE_OUT")"
ls -lh "$RELEASE_OUT"
