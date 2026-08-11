# release/ 산출물 보관·폐기 공통 로직.
# build-desktop.sh(데스크톱 패키징) · collect-mobile.sh(모바일 수집)가 공유한다.
#
# 실행 파일이 아니다 — `source` 로만 쓴다.
#
#   source "$(dirname "${BASH_SOURCE[0]}")/lib/release-store.sh"
#   release_store_init mac      # 경로·버전·시각·KEEP 확정
#   release_store_rotate        # 기존 산출물 아카이브 + 초과분 폐기
#
# 보관 구조:
#   release/<플랫폼>/                          최신 1벌
#   release/_archive/<플랫폼>/<버전>-<시각>/    직전 KEEP벌 (기본 2, KEEP 환경변수로 조정)

# source 시점에 이 파일의 위치를 잡아 둔다(scripts/lib → 저장소 루트는 두 단계 위).
RELEASE_STORE_LIB_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# release_store_init <플랫폼>
#   RELEASE_ROOT · RELEASE_PLATFORM · RELEASE_OUT · RELEASE_ARCHIVE
#   RELEASE_KEEP · RELEASE_VERSION · RELEASE_STAMP 를 설정한다.
release_store_init() {
  RELEASE_PLATFORM="$1"
  RELEASE_ROOT="$(cd "$RELEASE_STORE_LIB_DIR/../.." && pwd)"
  RELEASE_OUT="$RELEASE_ROOT/release/$RELEASE_PLATFORM"
  RELEASE_ARCHIVE="$RELEASE_ROOT/release/_archive/$RELEASE_PLATFORM"
  RELEASE_KEEP="${KEEP:-2}"
  RELEASE_VERSION="$(node -p "require('$RELEASE_ROOT/package.json').version")"
  # 초 단위까지 넣는다 — 같은 분에 두 번 빌드하면 아카이브 폴더가 겹쳐 앞선 것을 덮어쓴다.
  RELEASE_STAMP="$(date +%Y%m%d-%H%M%S)"
}

# 경로를 저장소 루트 기준 상대경로로 바꾼다 (출력용).
release_store_rel() {
  printf '%s' "${1#"$RELEASE_ROOT"/}"
}

# 기존 산출물을 _archive/<플랫폼>/<버전>-<시각>/ 로 옮기고, KEEP 개를 넘는 오래된 것을 지운다.
release_store_rotate() {
  local dest old

  if [ -d "$RELEASE_OUT" ] && [ -n "$(ls -A "$RELEASE_OUT" 2>/dev/null)" ]; then
    dest="$RELEASE_ARCHIVE/$RELEASE_VERSION-$RELEASE_STAMP"
    mkdir -p "$dest"
    ( shopt -s dotglob nullglob; mv "$RELEASE_OUT"/* "$dest"/ )
    echo "  아카이브 → $(release_store_rel "$dest")"
  fi

  [ -d "$RELEASE_ARCHIVE" ] || return 0
  # 최신순(-t)으로 나열해 KEEP 개 이후를 폐기. KEEP=0 이면 방금 만든 아카이브까지 지운다(보관 없음).
  while IFS= read -r old; do
    [ -n "$old" ] || continue
    rm -rf "${RELEASE_ARCHIVE:?}/$old"
    echo "  폐기 → $(release_store_rel "$RELEASE_ARCHIVE")/$old"
  done < <(ls -1t "$RELEASE_ARCHIVE" 2>/dev/null | tail -n +$((RELEASE_KEEP + 1)))
}
