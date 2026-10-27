const { app, BrowserWindow, ipcMain, shell } = require('electron');
const path = require('path');
const fs = require('fs');

// Enforce single instance lock
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
  process.exit(0);
}

let mainWindow = null;

// Determine development vs production environment
const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;
const devServerUrl = process.env.VITE_DEV_SERVER_URL || 'http://localhost:5173';

function createWindow() {
  const customIcon = path.join(__dirname, '../public/idrmusic.png');
  const iconPath = fs.existsSync(customIcon)
    ? customIcon
    : (process.platform === 'win32'
        ? path.join(__dirname, 'resources/icon.ico')
        : path.join(__dirname, 'resources/icon.png'));

  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 960,
    minHeight: 600,
    backgroundColor: '#000000',
    title: 'IDRMusic',
    icon: fs.existsSync(iconPath) ? iconPath : undefined,
    show: false, // Show gracefully when ready-to-show
    autoHideMenuBar: true,
    frame: true, // Native Windows frame with title bar and OS window controls
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      webSecurity: true,
      allowRunningInsecureContent: false
    }
  });

  // Ensure standard Chrome User-Agent so Google OAuth does not block with disallowed_useragent
  const customUserAgent = mainWindow.webContents.getUserAgent().replace(/Electron\/[0-9.]+\s/i, '');
  mainWindow.webContents.setUserAgent(customUserAgent);

  // Graceful show on ready
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Handle new window creation & allow Google OAuth popup
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.includes('accounts.google.com') || url.includes('google.com/o/oauth2')) {
      return {
        action: 'allow',
        overrideBrowserWindowOptions: {
          width: 500,
          height: 650,
          autoHideMenuBar: true,
          webPreferences: {
            nodeIntegration: false,
            contextIsolation: true
          }
        }
      };
    }
    if (url.startsWith('https:') || url.startsWith('http:')) {
      shell.openExternal(url);
    }
    return { action: 'deny' };
  });

  // Security: Prevent navigating the main window away from app content
  mainWindow.webContents.on('will-navigate', (event, navigationUrl) => {
    const isAppOrigin = isDev 
      ? navigationUrl.startsWith(devServerUrl)
      : navigationUrl.startsWith('file:');

    if (!isAppOrigin) {
      event.preventDefault();
      shell.openExternal(navigationUrl);
    }
  });

  // Load appropriate URL / file
  if (isDev && process.env.ELECTRON_START_URL) {
    mainWindow.loadURL(process.env.ELECTRON_START_URL);
  } else if (isDev && !process.env.ELECTRON_FORCE_PACKAGED) {
    // Try to load Vite dev server
    mainWindow.loadURL(devServerUrl).catch(() => {
      // Fallback to built dist if dev server is not running
      loadProductionBuild(mainWindow);
    });
  } else {
    loadProductionBuild(mainWindow);
  }

  // Handle window close
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function loadProductionBuild(win) {
  const indexPath = path.join(__dirname, '../dist/index.html');
  if (fs.existsSync(indexPath)) {
    win.loadFile(indexPath);
  } else {
    win.loadURL(`data:text/html,<html><body style="background:#000;color:#fff;font-family:sans-serif;padding:40px;text-align:center;"><h2>Hetufy Production Bundle Not Found</h2><p>Please run <code>npm run build</code> first.</p></body></html>`);
  }
}

// When a second instance is launched, focus the existing main window
app.on('second-instance', () => {
  if (mainWindow) {
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.focus();
  }
});

// Setup IPC handlers for window controls
ipcMain.on('window-minimize', () => {
  if (mainWindow) mainWindow.minimize();
});

ipcMain.on('window-maximize', () => {
  if (mainWindow) {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow.maximize();
    }
  }
});

ipcMain.on('window-close', () => {
  if (mainWindow) mainWindow.close();
});

ipcMain.handle('window-is-maximized', () => {
  return mainWindow ? mainWindow.isMaximized() : false;
});

ipcMain.on('open-external', (event, url) => {
  if (url && (url.startsWith('https://') || url.startsWith('http://'))) {
    shell.openExternal(url);
  }
});

// App Lifecycle
app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
