import type { CapacitorElectronConfig } from '@capacitor-community/electron';
import {
  CapElectronEventEmitter,
  CapacitorSplashScreen,
  setupCapacitorElectronPlugins,
} from '@capacitor-community/electron';
import chokidar from 'chokidar';
import type { MenuItemConstructorOptions } from 'electron';
import { app, BrowserWindow, Menu, MenuItem, nativeImage, Tray, session } from 'electron';
import electronIsDev from 'electron-is-dev';
import electronServe from 'electron-serve';
import windowStateKeeper from 'electron-window-state';
import { readFileSync } from 'fs';
import { join } from 'path';

// Define components for a watcher to detect when the webapp is changed so we can reload in Dev mode.
const reloadWatcher = {
  debouncer: null,
  ready: false,
  watcher: null,
};
export function setupReloadWatcher(electronCapacitorApp: ElectronCapacitorApp): void {
  reloadWatcher.watcher = chokidar
    .watch(join(app.getAppPath(), 'app'), {
      ignored: /[/\\]\./,
      persistent: true,
    })
    .on('ready', () => {
      reloadWatcher.ready = true;
    })
    .on('all', (_event, _path) => {
      if (reloadWatcher.ready) {
        clearTimeout(reloadWatcher.debouncer);
        reloadWatcher.debouncer = setTimeout(async () => {
          electronCapacitorApp.getMainWindow().webContents.reload();
          reloadWatcher.ready = false;
          clearTimeout(reloadWatcher.debouncer);
          reloadWatcher.debouncer = null;
          reloadWatcher.watcher = null;
          setupReloadWatcher(electronCapacitorApp);
        }, 1500);
      }
    });
}

// Define our class to manage our app.
export class ElectronCapacitorApp {
  private MainWindow: BrowserWindow | null = null;
  private SplashScreen: CapacitorSplashScreen | null = null;
  private TrayIcon: Tray | null = null;
  private CapacitorFileConfig: CapacitorElectronConfig;
  private TrayMenuTemplate: (MenuItem | MenuItemConstructorOptions)[] = [
    new MenuItem({ label: 'Quit App', role: 'quit' }),
  ];
  private AppMenuBarMenuTemplate: (MenuItem | MenuItemConstructorOptions)[] = [
    { role: process.platform === 'darwin' ? 'appMenu' : 'fileMenu' },
    { role: 'viewMenu' },
  ];
  private mainWindowState;
  private loadWebApp;
  private customScheme: string;

  constructor(
    capacitorFileConfig: CapacitorElectronConfig,
    trayMenuTemplate?: (MenuItemConstructorOptions | MenuItem)[],
    appMenuBarMenuTemplate?: (MenuItemConstructorOptions | MenuItem)[]
  ) {
    this.CapacitorFileConfig = capacitorFileConfig;

    this.customScheme = this.CapacitorFileConfig.electron?.customUrlScheme ?? 'capacitor-electron';

    if (trayMenuTemplate) {
      this.TrayMenuTemplate = trayMenuTemplate;
    }

    if (appMenuBarMenuTemplate) {
      this.AppMenuBarMenuTemplate = appMenuBarMenuTemplate;
    }

    // Setup our web app loader, this lets us load apps like react, vue, and angular without changing their build chains.
    this.loadWebApp = electronServe({
      directory: join(app.getAppPath(), 'app'),
      scheme: this.customScheme,
    });
  }

  // Helper function to load in the app.
  private async loadMainWindow(thisRef: any) {
    await thisRef.loadWebApp(thisRef.MainWindow);
  }

  // Expose the mainWindow ref for use outside of the class.
  getMainWindow(): BrowserWindow {
    return this.MainWindow;
  }

  getCustomURLScheme(): string {
    return this.customScheme;
  }

  async init(): Promise<void> {
    const icon = nativeImage.createFromPath(
      join(app.getAppPath(), 'assets', process.platform === 'win32' ? 'appIcon.ico' : 'appIcon.png')
    );
    this.mainWindowState = windowStateKeeper({
      defaultWidth: 1000,
      defaultHeight: 800,
    });
    // Setup preload script path and construct our main window.
    const preloadPath = join(app.getAppPath(), 'build', 'src', 'preload.js');
    this.MainWindow = new BrowserWindow({
      icon,
      show: false,
      x: this.mainWindowState.x,
      y: this.mainWindowState.y,
      width: this.mainWindowState.width,
      height: this.mainWindowState.height,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: true,
        // Use preload to inject the electron varriant overrides for capacitor plugins.
        // preload: join(app.getAppPath(), "node_modules", "@capacitor-community", "electron", "dist", "runtime", "electron-rt.js"),
        preload: preloadPath,
      },
    });
    this.mainWindowState.manage(this.MainWindow);

    if (this.CapacitorFileConfig.backgroundColor) {
      this.MainWindow.setBackgroundColor(this.CapacitorFileConfig.electron.backgroundColor);
    }

    // If we close the main window with the splashscreen enabled we need to destory the ref.
    this.MainWindow.on('closed', () => {
      if (this.SplashScreen?.getSplashWindow() && !this.SplashScreen.getSplashWindow().isDestroyed()) {
        this.SplashScreen.getSplashWindow().close();
      }
    });

    // When the tray icon is enabled, setup the options.
    if (this.CapacitorFileConfig.electron?.trayIconAndMenuEnabled) {
      this.TrayIcon = new Tray(icon);
      this.TrayIcon.on('double-click', () => {
        if (this.MainWindow) {
          if (this.MainWindow.isVisible()) {
            this.MainWindow.hide();
          } else {
            this.MainWindow.show();
            this.MainWindow.focus();
          }
        }
      });
      this.TrayIcon.on('click', () => {
        if (this.MainWindow) {
          if (this.MainWindow.isVisible()) {
            this.MainWindow.hide();
          } else {
            this.MainWindow.show();
            this.MainWindow.focus();
          }
        }
      });
      this.TrayIcon.setToolTip(app.getName());
      this.TrayIcon.setContextMenu(Menu.buildFromTemplate(this.TrayMenuTemplate));
    }

    // 서버 변경 메뉴 없음 — 이 뷰어는 config-only다. 서버 주소는 빌드 타임
    // config(web/config.js)로 고정되며 사용자에게 노출하지 않는다.

    // Setup the main manu bar at the top of our window.
    Menu.setApplicationMenu(Menu.buildFromTemplate(this.AppMenuBarMenuTemplate));

    // If the splashscreen is enabled, show it first while the main window loads then switch it out for the main window, or just load the main window from the start.
    if (this.CapacitorFileConfig.electron?.splashScreenEnabled) {
      this.SplashScreen = new CapacitorSplashScreen({
        imageFilePath: join(
          app.getAppPath(),
          'assets',
          this.CapacitorFileConfig.electron?.splashScreenImageName ?? 'splash.png'
        ),
        windowWidth: 400,
        windowHeight: 400,
      });
      this.SplashScreen.init(this.loadMainWindow, this);
    } else {
      this.loadMainWindow(this);
    }

    // Security — 이 앱은 원격 HeiChitty Chat 웹을 띄우는 뷰어다.
    // 자기 스킴(로컬 셸) 또는 http/https(원격 서버)로의 이동만 허용한다.
    const isAllowedTarget = (url: string) =>
      url.includes(this.customScheme) ||
      url.startsWith('http://') ||
      url.startsWith('https://');

    this.MainWindow.webContents.setWindowOpenHandler((details) => {
      return isAllowedTarget(details.url) ? { action: 'allow' } : { action: 'deny' };
    });
    this.MainWindow.webContents.on('will-navigate', (event, newURL) => {
      if (!isAllowedTarget(newURL)) {
        event.preventDefault();
      }
    });

    // Link electron plugins into the system.
    setupCapacitorElectronPlugins();

    // When the web app is loaded we hide the splashscreen if needed and show the mainwindow.
    this.MainWindow.webContents.on('dom-ready', () => {
      if (this.CapacitorFileConfig.electron?.splashScreenEnabled) {
        this.SplashScreen.getSplashWindow().hide();
      }
      if (!this.CapacitorFileConfig.electron?.hideMainWindowOnLaunch) {
        this.MainWindow.show();
      }
      setTimeout(() => {
        if (electronIsDev) {
          this.MainWindow.webContents.openDevTools();
        }
        CapElectronEventEmitter.emit('CAPELECTRON_DeeplinkListenerInitialized', '');
      }, 400);
    });
  }
}

// Set a CSP up for our application based on the custom scheme
//
// 이 앱은 원격 HeiChitty Chat 웹을 띄우는 뷰어다 — 로컬 자산만 쓰는 기본 템플릿과 전제가 다르다.
// onHeadersReceived 는 세션 전역이라, 템플릿 그대로 두면 원격 서버 응답의 CSP 까지
// 커스텀 스킴 전용 정책으로 '대체'해 버린다. 그 결과 서버 자신의 CSS·JS·socket.io 가
// 전부 차단되어 화면이 무스타일로 깨지고 실시간 채팅이 동작하지 않는다(2026-08-10 실기 확인).
// → CSP 는 로컬 셸(커스텀 스킴) 응답에만 적용하고, 원격 응답은 서버가 보낸 CSP 를 존중한다.
//   (서버는 이미 default-src 'self' 등 엄격한 CSP 를 자체 전송한다)
export function setupContentSecurityPolicy(customScheme: string): void {
  // 셸의 preflight(도달성 사전 점검) fetch 대상 오리진. connect-src 는 default-src 로
  // 폴백되므로, 이 값을 명시하지 않으면 preflight 가 CSP 에 막혀 서버가 살아 있어도
  // 항상 "연결할 수 없습니다" 가 된다(2026-08-10 실기 확인).
  const serverOrigin = readShellServerOrigin();
  const connectSrc = [`${customScheme}://*`, serverOrigin].filter(Boolean).join(' ');

  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    if (!details.url.startsWith(`${customScheme}://`)) {
      callback({});
      return;
    }
    const defaultSrc = electronIsDev
      ? `default-src ${customScheme}://* 'unsafe-inline' devtools://* 'unsafe-eval' data:`
      : `default-src ${customScheme}://* 'unsafe-inline' data:`;
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [`${defaultSrc}; connect-src ${connectSrc}`],
      },
    });
  });
}

// 셸 config(app/config.js) 의 서버 주소를 메인 프로세스에서 읽어 오리진만 뽑는다.
//
// ⚠️ 스킴 보정 규칙은 web/app.js 의 defaultSchemeFor()/normalize() 와 **반드시 같아야** 한다.
//    (config.js 에 스킴 없이 호스트만 적을 수 있고, 그때 렌더러가 고르는 스킴과 여기서
//     고르는 스킴이 갈리면 connect-src 가 어긋나 preflight 가 조용히 막힌다)
//    web/app.js 의 해당 규칙을 고치면 이 함수도 함께 고칠 것. SSOT 는 web/config.js 한 줄.
function readShellServerOrigin(): string | null {
  try {
    const raw = readFileSync(join(app.getAppPath(), 'app', 'config.js'), 'utf8');
    const matched = raw.match(/HEICHITTY_SERVER\s*=\s*["']([^"']*)["']/);
    if (!matched) return null;

    let s = matched[1].trim();
    if (!s) return null;
    if (!/^https?:\/\//i.test(s)) {
      const isLoopback = /^(localhost|127\.\d+\.\d+\.\d+|0\.0\.0\.0|\[?::1\]?)(:|\/|$)/i.test(s);
      s = (isLoopback ? 'http://' : 'https://') + s;
    }
    const u = new URL(s);
    if (u.protocol !== 'http:' && u.protocol !== 'https:') return null;
    return u.origin;
  } catch {
    // config 누락·형식 변경 등. 셸이 상태화면에서 안내하므로 여기선 조용히 포기한다.
    return null;
  }
}
