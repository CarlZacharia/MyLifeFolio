import { ipcMain, app } from 'electron';

export function registerWindowHandlers(): void {
  ipcMain.handle('app:getVersion', () => {
    return app.getVersion();
  });

  ipcMain.handle('app:getPlatform', () => {
    return process.platform;
  });

  ipcMain.handle('app:getUserDataPath', () => {
    return app.getPath('userData');
  });
}
