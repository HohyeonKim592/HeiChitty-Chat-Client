"use strict";

// HeiChitty-Chat 뷰어 셸 (config-only).
//
// 이 앱은 상태를 갖지 않는 얇은 뷰어다. 빌드 타임 config(config.js)의 서버 주소로
// 자동 접속하고, 사용자에게 주소를 묻지 않는다.
//
// 접속은 location.replace 로 한다 — 셸을 히스토리에 남기지 않으므로 원격에서
// 뒤로가기로 셸에 돌아오는 일이 없다(바운스 없음·서버변경 미노출). 이동하는 순간
// 이 셸의 JS 컨텍스트는 사라지므로, "연결 실패 감지"는 이동 전 사전 점검으로 푼다.
//
// 도달 불가·오프라인일 때만 상태화면에서 재시도를 제공한다.

const PREFLIGHT_TIMEOUT_MS = 5000;

// localhost·루프백 호스트는 http가 기본(개발 로컬 서버). 그 외는 https.
function defaultSchemeFor(s) {
  return /^(localhost|127\.\d+\.\d+\.\d+|0\.0\.0\.0|\[?::1\]?)(:|\/|$)/i.test(s)
    ? "http://"
    : "https://";
}

// config 주소를 정규화·검증한다. 유효하면 정규 URL 문자열, 아니면 null.
function normalize(raw) {
  let s = (raw || "").trim();
  if (!s) return null;
  if (!/^https?:\/\//i.test(s)) s = defaultSchemeFor(s) + s;
  try {
    const u = new URL(s);
    if (u.protocol !== "http:" && u.protocol !== "https:") return null;
    return u.toString();
  } catch {
    return null;
  }
}

const statusEl = document.getElementById("status");
const statusText = document.getElementById("status-text");
const retryBtn = document.getElementById("retry");
const splash = document.getElementById("splash");
const splashText = document.getElementById("splash-text");
const offlineBanner = document.getElementById("offline-banner");

// 빌드 타임 config 의 서버 주소(정규화). 누락·무효면 null.
const SERVER = normalize(window.HEICHITTY_SERVER);

// 온라인 상태를 상태화면 배너에 반영
function reflectOnline() {
  if (offlineBanner) offlineBanner.hidden = navigator.onLine;
}

function showSplash(text) {
  if (statusEl) statusEl.hidden = true;
  if (splashText) splashText.textContent = text;
  if (splash) splash.hidden = false;
}

// 상태화면 — 메시지 + 재시도. 서버 주소 입력은 없다(config-only).
function showStatus(msg) {
  if (splash) splash.hidden = true;
  if (statusText) statusText.textContent = msg;
  if (statusEl) statusEl.hidden = false;
  reflectOnline();
}

// 도달성 사전 점검: no-cors라 응답 본문은 못 읽지만(opaque) "도달 가능" 여부는 판별된다.
// DNS 실패·연결 거부·타임아웃이면 reject → false.
function preflight(url) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), PREFLIGHT_TIMEOUT_MS);
  return fetch(url, { mode: "no-cors", cache: "no-store", signal: ctrl.signal })
    .then(() => true)
    .catch(() => false)
    .finally(() => clearTimeout(timer));
}

// 서버로 최상위 이동 — replace로 셸을 히스토리에서 제거(뒤로가기로 셸 복귀 없음).
function connect(url) {
  showSplash("접속 중…");
  // 다음 프레임에서 이동 — 스플래시가 먼저 그려지도록.
  requestAnimationFrame(() => {
    window.location.replace(url);
  });
}

// config 서버로 접속 시도. 오프라인·불가 시 상태화면에 머물며 재시도 제공.
async function attemptConnect() {
  if (!SERVER) {
    // 빌드 설정 오류(개발 안전망). 고객 빌드에선 발생하지 않아야 한다.
    showStatus("서버 주소가 설정되지 않았습니다. (config.js 확인)");
    return;
  }
  if (!navigator.onLine) {
    showStatus("네트워크 연결이 없습니다. 연결 후 다시 시도하세요.");
    return;
  }
  showSplash("접속 확인 중…");
  const ok = await preflight(SERVER);
  if (ok) connect(SERVER);
  else showStatus("서버에 연결할 수 없습니다. 잠시 후 다시 시도하세요.");
}

if (retryBtn) retryBtn.addEventListener("click", () => attemptConnect());

window.addEventListener("online", () => {
  reflectOnline();
  // 상태화면(접속 실패/오프라인)에 머물러 있으면 온라인 복귀 시 자동 재시도.
  if (statusEl && !statusEl.hidden) attemptConnect();
});
window.addEventListener("offline", reflectOnline);

attemptConnect();
