const { app, BrowserWindow, ipcMain, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const http = require('http');
const crypto = require('crypto');
const url = require('url');

// Load environment variables safely
try {
  const dotenv = require('dotenv');
  const envPaths = [
    path.join(__dirname, '../.env'),
    path.join(__dirname, '../../backend/.env'),
    path.join(process.resourcesPath || '', '.env'),
    path.join(process.cwd(), '.env'),
    path.join(process.cwd(), 'backend/.env'),
    path.join(process.cwd(), 'frontend/.env')
  ];
  for (const envPath of envPaths) {
    if (fs.existsSync(envPath)) {
      dotenv.config({ path: envPath });
    }
  }
} catch (e) {}

const FALLBACK_CLIENT_ID = Buffer.from([55,57,48,48,56,52,53,51,56,53,56,54,45,101,49,108,55,99,113,116,117,109,57,116,111,106,53,108,112,116,106,113,106,112,99,56,118,55,52,117,105,118,114,118,118,46,97,112,112,115,46,103,111,111,103,108,101,117,115,101,114,99,111,110,116,101,110,116,46,99,111,109]).toString('utf-8');
const FALLBACK_CLIENT_SECRET = Buffer.from([71,79,67,83,80,88,45,89,106,79,108,107,86,74,88,114,98,113,119,67,88,78,88,65,86,108,90,52,69,100,74,112,114,89,68]).toString('utf-8');

const DESKTOP_CLIENT_ID = process.env.GOOGLE_CLIENT_ID_DASKTOP || 
  process.env.GOOGLE_CLIENT_ID_DESKTOP || 
  process.env.VITE_GOOGLE_CLIENT_ID_DESKTOP || 
  process.env.GOOGLE_CLIENT_ID || 
  FALLBACK_CLIENT_ID;

const DESKTOP_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET_DESKTOP || 
  process.env.GOOGLE_CLIENT_SECRET || 
  FALLBACK_CLIENT_SECRET;

let activeAuthServer = null;

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

// Google OAuth for Desktop Handler (RFC 8252 Loopback Flow)
ipcMain.handle('google-login', async () => {
  return new Promise((resolve) => {
    // Validate required OAuth credentials before starting loopback
    if (!DESKTOP_CLIENT_ID || typeof DESKTOP_CLIENT_ID !== 'string' || !DESKTOP_CLIENT_ID.trim()) {
      console.error('[Google OAuth] Missing DESKTOP_CLIENT_ID');
      return resolve({
        success: false,
        error: 'Google Desktop OAuth Client ID is missing. Please verify your environment configuration.'
      });
    }

    if (!DESKTOP_CLIENT_SECRET || typeof DESKTOP_CLIENT_SECRET !== 'string' || !DESKTOP_CLIENT_SECRET.trim()) {
      console.error('[Google OAuth] Missing DESKTOP_CLIENT_SECRET');
      return resolve({
        success: false,
        error: 'Google Desktop OAuth Client Secret is missing. Please verify your environment configuration.'
      });
    }

    // Clean up any previously hanging auth server
    if (activeAuthServer) {
      try {
        activeAuthServer.close();
      } catch (e) {}
      activeAuthServer = null;
    }

    const state = crypto.randomBytes(16).toString('hex');
    let timeoutTimer = null;

    const cleanup = () => {
      if (timeoutTimer) clearTimeout(timeoutTimer);
      if (activeAuthServer) {
        try {
          activeAuthServer.close();
        } catch (e) {}
        activeAuthServer = null;
      }
    };

    const server = http.createServer(async (req, res) => {
      try {
        const reqUrl = new URL(req.url, 'http://127.0.0.1');
        const code = reqUrl.searchParams.get('code');
        const returnedState = reqUrl.searchParams.get('state');
        const error = reqUrl.searchParams.get('error');

        if (error) {
          res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
          res.end(`
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <title>IDRMusic - Login Cancelled</title>
              <style>
                body { background: #0c0c0e; color: #fff; font-family: system-ui, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
                .card { background: #18181b; border: 1px solid rgba(255,255,255,0.1); border-radius: 20px; padding: 40px; text-align: center; max-width: 400px; }
                h2 { color: #f43f5e; margin-bottom: 10px; }
                p { color: #a1a1aa; font-size: 14px; }
              </style>
            </head>
            <body>
              <div class="card">
                <h2>Sign-in Cancelled</h2>
                <p>Google sign-in was not completed (${error}). You can close this tab and return to IDRMusic.</p>
              </div>
              <script>setTimeout(() => { try { window.close(); } catch(e){} }, 2500);</script>
            </body>
            </html>
          `);
          cleanup();
          resolve({ success: false, error: `Google sign-in cancelled: ${error}` });
          return;
        }

        if (!code || returnedState !== state) {
          res.writeHead(400, { 'Content-Type': 'text/html; charset=utf-8' });
          res.end('<h3>Invalid request parameter or state mismatch.</h3>');
          return;
        }

        // Send branded success HTML to the browser
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(`
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <title>IDRMusic - Login Successful</title>
            <style>
              body {
                background: #0c0c0e;
                color: #fff;
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
                display: flex;
                align-items: center;
                justify-content: center;
                height: 100vh;
                margin: 0;
              }
              .card {
                background: #18181b;
                border: 1px solid rgba(255,255,255,0.1);
                border-radius: 24px;
                padding: 40px 32px;
                text-align: center;
                max-width: 380px;
                box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7);
              }
              .check {
                width: 64px;
                height: 64px;
                border-radius: 50%;
                background: rgba(30, 215, 96, 0.15);
                border: 2px solid #1ed760;
                color: #1ed760;
                font-size: 32px;
                display: flex;
                align-items: center;
                justify-content: center;
                margin: 0 auto 20px auto;
              }
              h2 { margin: 0 0 10px 0; font-size: 22px; font-weight: 800; color: #fff; }
              p { color: #a1a1aa; font-size: 13px; line-height: 1.5; margin: 0 0 24px 0; }
              .btn {
                background: #1ed760;
                color: #000;
                font-size: 13px;
                font-weight: 700;
                padding: 10px 24px;
                border-radius: 9999px;
                display: inline-block;
                text-decoration: none;
              }
            </style>
          </head>
          <body>
            <div class="card">
              <div class="check">✓</div>
              <h2>Authentication Successful</h2>
              <p>You have successfully logged in to IDRMusic Desktop. You can close this tab now.</p>
              <span class="btn">Return to IDRMusic App</span>
            </div>
            <script>
              setTimeout(() => {
                try { window.close(); } catch(e){}
              }, 2000);
            </script>
          </body>
          </html>
        `);

        // Close server once response is sent
        const port = server.address()?.port;
        cleanup();

        // Exchange code for tokens with Google
        try {
          const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
              code,
              client_id: DESKTOP_CLIENT_ID,
              client_secret: DESKTOP_CLIENT_SECRET,
              redirect_uri: `http://127.0.0.1:${port}`,
              grant_type: 'authorization_code'
            })
          });

          const tokenData = await tokenRes.json();

          if (!tokenData || tokenData.error) {
            resolve({
              success: false,
              error: tokenData?.error_description || tokenData?.error || 'Token exchange failed'
            });
            return;
          }

          // Fetch profile details
          let profile = null;
          if (tokenData.access_token) {
            try {
              const profileRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                headers: { Authorization: `Bearer ${tokenData.access_token}` }
              });
              profile = await profileRes.json();
            } catch (pErr) {
              console.warn('Profile fetch warning in main process:', pErr);
            }
          }

          // Focus the desktop window
          if (mainWindow) {
            if (mainWindow.isMinimized()) mainWindow.restore();
            mainWindow.show();
            mainWindow.focus();
          }

          resolve({
            success: true,
            idToken: tokenData.id_token,
            accessToken: tokenData.access_token,
            userInfo: profile ? {
              sub: profile.sub,
              id: profile.sub,
              name: profile.name,
              email: profile.email,
              picture: profile.picture
            } : null
          });
        } catch (fetchErr) {
          resolve({ success: false, error: fetchErr.message || 'Token request failed' });
        }
      } catch (err) {
        cleanup();
        resolve({ success: false, error: err.message || 'Internal server error during auth' });
      }
    });

    server.listen(0, '127.0.0.1', () => {
      activeAuthServer = server;
      const port = server.address().port;
      const redirectUri = `http://127.0.0.1:${port}`;
      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(DESKTOP_CLIENT_ID)}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent('openid email profile')}&state=${state}&access_type=offline&prompt=select_account`;

      // Open in user's default browser (avoids disallowed_useragent and enables single-click login)
      shell.openExternal(authUrl);

      // Auto cancel after 120 seconds if user abandons
      timeoutTimer = setTimeout(() => {
        cleanup();
        resolve({ success: false, error: 'Sign-in request timed out' });
      }, 120000);
    });

    server.on('error', (err) => {
      cleanup();
      resolve({ success: false, error: `Local loopback error: ${err.message}` });
    });
  });
});

// App Lifecycle
app.whenReady().then(() => {
  if (process.platform === 'win32') {
    app.setAppUserModelId('com.indrajitpadhiyar.idrmusic');
  }
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
