// CE1 뷰어 셸 스모크 — web/app.js를 가벼운 DOM/브라우저 목으로 구동해
// 실제 코드(config 정규화·자동접속·도달성점검·오프라인·재시도)를 검증한다. zero-dep.
//
// app.js는 import 시 top-level에서 attemptConnect()를 실행하므로, 시나리오마다
// 전역을 새로 설치한 뒤 캐시버스트 쿼리로 모듈을 재로딩해 다시 돌린다.
//
// config-only: 사용자 입력 없음. window.HEICHITTY_SERVER 값으로 자동 접속하고,
// 접속은 location.replace 로 한다(셸을 히스토리에 안 남김).

import assert from "node:assert/strict";
import { fileURLToPath, pathToFileURL } from "node:url";
import { dirname, join } from "node:path";

const APP_PATH = join(dirname(fileURLToPath(import.meta.url)), "..", "web", "app.js");

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

function makeEl(id) {
  return {
    id,
    hidden: true,
    textContent: "",
    _handlers: {},
    addEventListener(type, fn) {
      (this._handlers[type] ||= []).push(fn);
    },
    click() {
      for (const fn of this._handlers.click || []) fn({});
    },
  };
}

// 시나리오별 전역(브라우저 환경) 설치. 핸들·상태 참조를 돌려준다.
// server: window.HEICHITTY_SERVER 값(undefined 가능).
function installEnv({ server, online = true, fetchImpl } = {}) {
  const ids = ["status", "status-text", "retry", "splash", "splash-text", "offline-banner"];
  const els = {};
  for (const id of ids) els[id] = makeEl(id);

  // location.replace 호출을 기록(접속 여부·대상 확인용).
  const location = { replaced: "", replace(url) { this.replaced = url; } };

  globalThis.document = { getElementById: (id) => els[id] || null };
  globalThis.window = {
    HEICHITTY_SERVER: server,
    _handlers: {},
    addEventListener(type, fn) {
      (this._handlers[type] ||= []).push(fn);
    },
    location,
    dispatch(type) {
      for (const fn of this._handlers[type] || []) fn({});
    },
  };
  globalThis.location = location;
  globalThis.navigator = { onLine: online };
  globalThis.requestAnimationFrame = (cb) => setTimeout(cb, 0);
  globalThis.fetch = fetchImpl || (() => Promise.resolve({ ok: true }));

  return { els, location, window: globalThis.window };
}

let importCounter = 0;
async function loadApp() {
  importCounter += 1;
  await import(pathToFileURL(APP_PATH).href + "?t=" + importCounter);
}

// ── 시나리오 ──
const tests = [];
const test = (name, fn) => tests.push([name, fn]);

test("config 주소 + 온라인 + 도달가능 → location.replace로 접속", async () => {
  const env = installEnv({ server: "https://chat.example/", fetchImpl: () => Promise.resolve({}) });
  await loadApp();
  await delay(30);
  assert.equal(env.location.replaced, "https://chat.example/");
});

test("정규화: 스킴 없는 config 값 → https 보정 후 접속", async () => {
  const env = installEnv({ server: "chat.example.co.kr", fetchImpl: () => Promise.resolve({}) });
  await loadApp();
  await delay(30);
  assert.equal(env.location.replaced, "https://chat.example.co.kr/");
});

test("정규화: 로컬 127.0.0.1 config 값 → http 기본으로 접속", async () => {
  const env = installEnv({ server: "127.0.0.1:3000", fetchImpl: () => Promise.resolve({}) });
  await loadApp();
  await delay(30);
  assert.equal(env.location.replaced, "http://127.0.0.1:3000/");
});

test("오프라인 → 상태화면, 접속 안 함", async () => {
  const env = installEnv({ server: "https://chat.example/", online: false });
  await loadApp();
  await delay(20);
  assert.equal(env.els["status"].hidden, false);
  assert.equal(env.location.replaced, "");
});

test("도달 실패(preflight reject) → 상태화면 + 재시도 노출, 접속 안 함", async () => {
  const env = installEnv({ server: "https://chat.example/", fetchImpl: () => Promise.reject(new Error("net")) });
  await loadApp();
  await delay(30);
  assert.equal(env.els["status"].hidden, false);
  assert.ok(env.els["status-text"].textContent.length > 0);
  assert.equal(env.location.replaced, "");
});

test("재시도 클릭 → 재접속 시도(이번엔 도달 가능)", async () => {
  let reachable = false;
  const env = installEnv({
    server: "https://chat.example/",
    fetchImpl: () => (reachable ? Promise.resolve({}) : Promise.reject(new Error("net"))),
  });
  await loadApp();
  await delay(30);
  assert.equal(env.location.replaced, "", "처음엔 실패해 접속 안 함");
  reachable = true;
  env.els["retry"].click();
  await delay(30);
  assert.equal(env.location.replaced, "https://chat.example/");
});

test("config 주소 없음 → 상태화면(설정 안내), 접속 안 함", async () => {
  const env = installEnv({ server: undefined });
  await loadApp();
  await delay(20);
  assert.equal(env.els["status"].hidden, false);
  assert.ok(env.els["status-text"].textContent.length > 0);
  assert.equal(env.location.replaced, "");
});

test("config 주소 무효(파싱 불가) → 상태화면, 접속 안 함", async () => {
  // 스킴은 있으나 호스트가 없어 URL 파싱이 실패하는 값 → normalize null.
  const env = installEnv({ server: "https://" });
  await loadApp();
  await delay(20);
  assert.equal(env.els["status"].hidden, false);
  assert.equal(env.location.replaced, "");
});

test("오프라인 상태에서 online 이벤트 → 자동 재시도·접속", async () => {
  let online = false;
  const env = installEnv({ server: "https://chat.example/", online, fetchImpl: () => Promise.resolve({}) });
  await loadApp();
  await delay(20);
  assert.equal(env.location.replaced, "", "오프라인이라 접속 안 함");
  globalThis.navigator.onLine = true;
  env.window.dispatch("online");
  await delay(30);
  assert.equal(env.location.replaced, "https://chat.example/");
});

// ── 러너 ──
let pass = 0;
let fail = 0;
for (const [name, fn] of tests) {
  try {
    await fn();
    pass += 1;
    console.log(`  ✓ ${name}`);
  } catch (err) {
    fail += 1;
    console.error(`  ✗ ${name}\n      ${err.message}`);
  }
}
console.log(`\nCE1 셸 스모크: ${pass}/${tests.length} PASS`);
process.exit(fail === 0 ? 0 : 1);
