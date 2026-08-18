const { app, BrowserWindow, Menu, ipcMain, dialog, session } = require('electron');
const path = require('path');

let mainWindow = null;

function installContentSecurityPolicy() {
  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    const csp = [
      "default-src 'self'",
      "script-src 'self'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob:",
      "font-src 'self' data:",
      "media-src 'self' blob:",
      "connect-src 'self'",
      "worker-src 'self' blob:",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join('; ');

    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [csp],
      },
    });
  });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1920,
    height: 1080,
    minWidth: 1024,
    minHeight: 768,
    frame: false,
    titleBarStyle: 'hidden',
    backgroundColor: '#070a12',
    show: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.cjs'),
      sandbox: true,
      devTools: !app.isPackaged,
    },
    icon: path.join(__dirname, process.platform === 'win32' ? 'icon.ico' : 'logo.png'),
  });

  mainWindow.once('ready-to-show', () => mainWindow?.show());

  const distPath = path.join(__dirname, '../dist/index.html');
  mainWindow.loadFile(distPath).catch((error) => {
    console.error('[Pampanaa] Failed to load renderer.', error);
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  installContentSecurityPolicy();
  Menu.setApplicationMenu(null);
  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (mainWindow === null) createWindow();
});

function requireWindow() {
  if (!mainWindow || mainWindow.isDestroyed()) throw new Error('Pampanaa window is unavailable.');
  return mainWindow;
}

ipcMain.handle('window-minimize', () => requireWindow().minimize());
ipcMain.handle('window-toggle-maximize', () => {
  const window = requireWindow();
  if (window.isMaximized()) window.unmaximize();
  else window.maximize();
});
ipcMain.handle('window-close', () => requireWindow().close());

ipcMain.handle('get-app-version', () => app.getVersion());

ipcMain.handle('get-app-path', (_event, name) => {
  const allowedPaths = new Set(['appData', 'userData', 'documents', 'downloads', 'desktop']);
  if (!allowedPaths.has(name)) throw new Error(`Unsupported app path: ${name}`);
  return app.getPath(name);
});

ipcMain.handle('show-save-dialog', async (_event, options = {}) => {
  const safeOptions = {
    ...options,
    properties: Array.isArray(options.properties) ? options.properties : ['createDirectory'],
  };
  return dialog.showSaveDialog(requireWindow(), safeOptions);
});

ipcMain.handle('show-open-dialog', async (_event, options = {}) => {
  const safeOptions = {
    ...options,
    properties: Array.isArray(options.properties) ? options.properties : ['openFile'],
  };
  return dialog.showOpenDialog(requireWindow(), safeOptions);
});
