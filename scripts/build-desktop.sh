#!/usr/bin/env bash
#
# 데스크톱(mac/win) 배포 산출물 빌드.
#   이전 산출물 아카이브 → 오래된 아카이브 폐기 → sync → tsc → 패키징 → 중간산출물 삭제
#
# 사용법:
#   scripts/build-desktop.sh mac
#   scripts/build-desktop.sh win
#   KEEP=3 scripts/build-desktop.sh mac     # 아카이브 보관 개수 (기본 2)
#
# 산출물 경로는 electron-builder.config.json 의 directories.output = "../release/${os}".
# 보관·폐기 정책은 scripts/lib/release-store.sh 가 담당한다(collect-mobile.sh 와 공유).
#
# electron-builder 호출 함정 2가지를 이 스크립트가 구조적으로 막는다(2026-08-10 실측):
#   1) `--mac dmg` 처럼 타깃까지 CLI로 주면 config 의 arch:["universal"] 이 host arch 로 덮인다.
#      → `--mac`/`--win` 만 주고 arch 는 config 에 맡긴다.
#   2) `npm run electron:make` 는 -p always 라 GitHub 릴리스 업로드를 시도한다. → -p never 고정.

set -euo pipefail

OS="${1:-}"
case "$OS" in
  mac|win) ;;
  *)
    echo "사용법: $0 <mac|win>   (KEEP=<보관개수> 로 아카이브 개수 조정)" >&2
    exit 1
    ;;
esac

# shellcheck source=lib/release-store.sh
source "$(dirname "${BASH_SOURCE[0]}")/lib/release-store.sh"
release_store_init "$OS"

cd "$RELEASE_ROOT"

echo "[1/5] 이전 산출물 정리 (KEEP=$RELEASE_KEEP)"
release_store_rotate

echo "[2/5] 웹 자산 동기화 — web/ → electron/app/"
npx cap sync @capacitor-community/electron

echo "[3/5] Electron 빌드 — tsc → electron/build/"
( cd "$RELEASE_ROOT/electron" && npm run build )

echo "[4/5] 패키징 — electron-builder --$OS (미서명, 업로드 없음)"
( cd "$RELEASE_ROOT/electron" && npx electron-builder "--$OS" -c ./electron-builder.config.json -p never )

# 최종 배포물은 전부 파일(dmg/exe/blockmap/yml)이다. 디렉터리로 남는 것은
# 언팩 앱 번들(mac-arm64/, win-unpacked/)·아이콘 변환 캐시(.icon-icns/) 같은 중간산출물이라 지운다.
echo "[5/5] 중간산출물 삭제"
if [ -d "$RELEASE_OUT" ]; then
  find "$RELEASE_OUT" -mindepth 1 -maxdepth 1 -type d -exec rm -rf {} +
  rm -f "$RELEASE_OUT/builder-debug.yml"
fi

echo
echo "완료 — $(release_store_rel "$RELEASE_OUT")"
ls -lh "$RELEASE_OUT"
