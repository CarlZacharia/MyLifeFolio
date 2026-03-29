import { app, BrowserWindow, ipcMain, shell } from 'electron';
import { join } from 'path';
import { is } from '@electron-toolkit/utils';
import { registerDbHandlers } from './handlers/db';
import { registerAuthHandlers } from './handlers/auth';
import { registerPdfHandlers } from './handlers/pdf';
import { registerUploadHandlers } from './handlers/upload';
import { registerWindowHandlers } from './handlers/window';
import { registerFileHandlers } from './handlers/files';

let mainWindow: BrowserWindow | null = null;

// Auto-lock timer
let lastActivityTime = Date.now();
const AUTO_LOCK_MS = 15 * 60 * 1000; // 15 minutes
let autoLockInterval: ReturnType<typeof setInterval> | null = null;

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 1024,
    minHeight: 680,
    title: 'MyLifeFolio',
    webPreferences: {
      preload: join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });

  // Open external links in browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  // Load the app
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL']);
  } else {
    mainWindow.loadFile(join(__dirname, '../dist/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Track activity for auto-lock
  mainWindow.on('focus', () => {
    lastActivityTime = Date.now();
  });
}

function startAutoLockTimer(): void {
  if (autoLockInterval) clearInterval(autoLockInterval);
  autoLockInterval = setInterval(() => {
    if (Date.now() - lastActivityTime > AUTO_LOCK_MS) {
      mainWindow?.webContents.send('auto-lock');
    }
  }, 30_000); // Check every 30 seconds
}

// IPC handler for activity tracking from renderer
ipcMain.on('user-activity', () => {
  lastActivityTime = Date.now();
});

// Register all IPC handlers
function registerAllHandlers(): void {
  registerDbHandlers();
  registerAuthHandlers();
  registerPdfHandlers();
  registerUploadHandlers();
  registerWindowHandlers();
  registerFileHandlers();
}

// App lifecycle
app.whenReady().then(() => {
  registerAllHandlers();
  createWindow();
  startAutoLockTimer();

  app.on('activate', () => {
    // macOS: re-create window when dock icon is clicked
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

app.on('before-quit', () => {
  if (autoLockInterval) clearInterval(autoLockInterval);
});
