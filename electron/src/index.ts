import type { CapacitorElectronConfig } from '@capacitor-community/electron';
import { getCapacitorElectronConfig, setupElectronDeepLinking } from '@capacitor-community/electron';
import type { MenuItemConstructorOptions } from 'electron';
import { app, MenuItem } from 'electron';
import electronIsDev from 'electron-is-dev';
import unhandled from 'electron-unhandled';
import { autoUpdater } from 'electron-updater';

import { ElectronCapacitorApp, setupContentSecurityPolicy, setupReloadWatcher } from './setup';

// Graceful handling of unhandled errors.
unhandled();

// Define our menu templates (these are optional)
const trayMenuTemplate: (MenuItemConstructorOptions | MenuItem)[] = [new MenuItem({ label: 'Quit App', role: 'quit' })];
const appMenuBarMenuTemplate: (MenuItemConstructorOptions | MenuItem)[] = [
  { role: process.platform === 'darwin' ? 'appMenu' : 'fileMenu' },
  { role: 'viewMenu' },
];

// Get Config options from capacitor.config
const capacitorFileConfig: CapacitorElectronConfig = getCapacitorElectronConfig();

// Initialize our app. You can pass menu templates into the app here.
// const myCapacitorApp = new ElectronCapacitorApp(capacitorFileConfig);
const myCapacitorApp = new ElectronCapacitorApp(capacitorFileConfig, trayMenuTemplate, appMenuBarMenuTemplate);

// If deeplinking is enabled then we will set it up here.
if (capacitorFileConfig.electron?.deepLinkingEnabled) {
  setupElectronDeepLinking(myCapacitorApp, {
    customProtocol: capacitorFileConfig.electron.deepLinkingCustomProtocol ?? 'mycapacitorapp',
  });
}

// If we are in Dev mode, use the file watcher components.
if (electronIsDev) {
  setupReloadWatcher(myCapacitorApp);
}

// Run Application
(async () => {
  // Wait for electron app to be ready.
  await app.whenReady();
  // Security - Set Content-Security-Policy based on whether or not we are in dev mode.
  setupContentSecurityPolicy(myCapacitorApp.getCustomURLScheme());
  // Initialize our app, build windows, and load content.
  await myCapacitorApp.init();
  // Check for updates if we are in a packaged app.
  //
  // 자동 업데이트(CE5-S1)의 범위는 Windows 전용이다. macOS 는 「연 0원」 방침으로 서명을
  // 하지 않는데, Squirrel.Mac 은 서명된 앱에서만 동작하므로 업데이트가 성립하지 않는다.
  // 매번 실패할 것이 확정된 요청을 보내지 않도록 호출 자체를 win32 로 좁힌다.
  // (macOS 사용자는 새 dmg 를 직접 받아 재설치한다.)
  //
  // .catch() 는 유지한다. 리포 public 전환(2026-08-12)으로 피드 접근 자체는 열렸으나,
  // 릴리스가 아직 없거나 오프라인이면 조회는 여전히 실패한다. 실패가 unhandled Promise
  // rejection 이 되면 electron-unhandled 이 프로덕션에서 모달 오류창을 띄워 앱이 그 상태로
  // 멈춘다(2026-08-10 패키징 빌드에서 실제 발생). 업데이트 확인 실패가 기동을 막아선 안 된다.
  if (process.platform === 'win32') {
    autoUpdater.checkForUpdatesAndNotify().catch((err) => {
      console.warn('[updater] 업데이트 확인 건너뜀:', err?.message ?? err);
    });
  }
})();

// Handle when all of our windows are close (platforms have their own expectations).
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// When the dock icon is clicked.
app.on('activate', async function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (myCapacitorApp.getMainWindow().isDestroyed()) {
    await myCapacitorApp.init();
  }
});

// Place all ipc or other electron api calls and custom functionality under this line
