#!/usr/bin/env bash
#
# 모바일(android) 산출물을 release/ 아래로 수집.
# gradle 은 electron-builder 관할 밖이라 자기 빌드 경로에 산출물을 만든다.
# 3플랫폼 배포물을 release/ 한곳에서 보게 하려고 여기로 복사한다(원본은 그대로 둔다).
#
# 사용법:
#   scripts/collect-mobile.sh android            # android/app/build/outputs 의 apk·aab 수집
#   KEEP=3 scripts/collect-mobile.sh android     # 아카이브 보관 개수 (기본 2)
#
# 보관·폐기 정책은 scripts/lib/release-store.sh 가 담당한다(build-desktop.sh 와 공유).
#
# iOS 는 범위 밖이다(2026-08-12 결정 — Apple Developer Program 연 99달러가 유일한
# 배포 경로라 비용 0 목표와 맞지 않는다). 종전의 ios 인자 분기는 제거했다.
# 재개하려면 docs/spec/02-epic-story.md 「iOS — 범위 밖」의 재개 조건을 볼 것.

set -euo pipefail

PLATFORM="${1:-}"
case "$PLATFORM" in
  android) ;;
  *)
    echo "사용법: $0 android   (KEEP=<보관개수> 로 아카이브 개수 조정)" >&2
    exit 1
    ;;
esac

# shellcheck source=lib/release-store.sh
source "$(dirname "${BASH_SOURCE[0]}")/lib/release-store.sh"
release_store_init "$PLATFORM"

# 수집할 원본 목록을 SOURCES 에 채운다.
SOURCES=()

outputs="$RELEASE_ROOT/android/app/build/outputs"
if [ ! -d "$outputs" ]; then
  echo "산출물이 없습니다: $(release_store_rel "$outputs")" >&2
  echo "먼저 빌드하세요:  cd android && ./gradlew assembleDebug" >&2
  exit 1
fi
while IFS= read -r f; do
  SOURCES+=("$f")
done < <(find "$outputs" \( -name '*.apk' -o -name '*.aab' \) -type f)

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
