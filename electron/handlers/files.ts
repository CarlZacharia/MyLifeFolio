import { ipcMain, app } from 'electron';
import { readFileSync, writeFileSync, unlinkSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';

function getFilesDir(): string {
  return join(app.getPath('userData'), 'files');
}

function resolveFilePath(bucketName: string, filePath: string): string {
  return join(getFilesDir(), bucketName, filePath);
}

export function registerFileHandlers(): void {
  ipcMain.handle('files:save', async (_event, bucketName: string, filePath: string, data: Uint8Array, _contentType: string) => {
    try {
      const fullPath = resolveFilePath(bucketName, filePath);
      const dir = dirname(fullPath);
      if (!existsSync(dir)) {
        mkdirSync(dir, { recursive: true });
      }
      writeFileSync(fullPath, Buffer.from(data));
      return { data: { path: filePath }, error: null };
    } catch (err) {
      return { data: null, error: { message: (err as Error).message } };
    }
  });

  ipcMain.handle('files:read', async (_event, bucketName: string, filePath: string) => {
    try {
      const fullPath = resolveFilePath(bucketName, filePath);
      if (!existsSync(fullPath)) {
        return { data: null, error: { message: 'File not found' } };
      }
      const buffer = readFileSync(fullPath);
      return { data: new Uint8Array(buffer), error: null };
    } catch (err) {
      return { data: null, error: { message: (err as Error).message } };
    }
  });

  ipcMain.handle('files:remove', async (_event, bucketName: string, filePaths: string[]) => {
    try {
      for (const filePath of filePaths) {
        const fullPath = resolveFilePath(bucketName, filePath);
        if (existsSync(fullPath)) {
          unlinkSync(fullPath);
        }
      }
      return { data: true, error: null };
    } catch (err) {
      return { data: null, error: { message: (err as Error).message } };
    }
  });

  ipcMain.handle('files:getUrl', async (_event, bucketName: string, filePath: string) => {
    try {
      const fullPath = resolveFilePath(bucketName, filePath);
      if (!existsSync(fullPath)) {
        return { data: null, error: { message: 'File not found' } };
      }
      // Return a file:// URL for local display
      return { data: `file://${fullPath.replace(/\\/g, '/')}`, error: null };
    } catch (err) {
      return { data: null, error: { message: (err as Error).message } };
    }
  });
}
