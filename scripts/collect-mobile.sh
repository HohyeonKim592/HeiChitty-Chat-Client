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
# 아카이브·폐기 정책은 build-desktop.sh 와 동일:
#   release/android/ · release/ios/       최신 1벌
#   release/_archive/<platform>/<버전>-<시각>/   직전 KEEP벌
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

KEEP="${KEEP:-2}"

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUT="$ROOT/release/$PLATFORM"
ARCHIVE="$ROOT/release/_archive/$PLATFORM"

VERSION="$(node -p "require('$ROOT/package.json').version")"
STAMP="$(date +%Y%m%d-%H%M%S)"

# 기존 산출물을 _archive/<platform>/<버전>-<시각>/ 로 옮기고, KEEP 개를 넘는 오래된 것을 지운다.
archive_and_prune() {
  local out="$1" archive="$2" dest old

  if [ -d "$out" ] && [ -n "$(ls -A "$out" 2>/dev/null)" ]; then
    dest="$archive/$VERSION-$STAMP"
    mkdir -p "$dest"
    ( shopt -s dotglob nullglob; mv "$out"/* "$dest"/ )
    echo "  아카이브 → ${dest#"$ROOT"/}"
  fi

  [ -d "$archive" ] || return 0
  while IFS= read -r old; do
    [ -n "$old" ] || continue
    rm -rf "${archive:?}/$old"
    echo "  폐기 → ${archive#"$ROOT"/}/$old"
  done < <(ls -1t "$archive" 2>/dev/null | tail -n +$((KEEP + 1)))
}

# 수집할 원본 목록을 SOURCES 에 채운다.
SOURCES=()

if [ "$PLATFORM" = android ]; then
  outputs="$ROOT/android/app/build/outputs"
  if [ ! -d "$outputs" ]; then
    echo "산출물이 없습니다: ${outputs#"$ROOT"/}" >&2
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

echo "[1/2] 이전 산출물 정리 (KEEP=$KEEP)"
archive_and_prune "$OUT" "$ARCHIVE"

echo "[2/2] 수집 — ${#SOURCES[@]}개"
mkdir -p "$OUT"
for f in "${SOURCES[@]}"; do
  cp "$f" "$OUT/"
  echo "  $(basename "$f")  ←  ${f#"$ROOT"/}"
done

echo
echo "완료 — ${OUT#"$ROOT"/}"
ls -lh "$OUT"
