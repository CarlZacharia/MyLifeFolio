import { ipcMain, dialog, app } from 'electron';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';
import { PDFDocument } from 'pdf-lib';

export function registerPdfHandlers(): void {
  ipcMain.handle('pdf:encrypt', async (_event, pdfBytes: Uint8Array, userPassword: string) => {
    try {
      // Load the PDF and re-save with encryption using pdf-lib
      const pdfDoc = await PDFDocument.load(pdfBytes);

      // pdf-lib supports PDF encryption with user/owner passwords
      const encrypted = await pdfDoc.save({
        userPassword,
        ownerPassword: crypto.randomUUID(),
        permissions: {
          printing: 'highResolution',
          modifying: false,
          copying: false,
          annotating: false,
          fillingForms: false,
          contentAccessibility: true,
          documentAssembly: false,
        },
      });

      return { data: Buffer.from(encrypted), error: null };
    } catch (err) {
      return { data: null, error: { message: (err as Error).message } };
    }
  });

  ipcMain.handle('pdf:saveToFile', async (_event, bytes: Uint8Array, suggestedName: string) => {
    try {
      const result = await dialog.showSaveDialog({
        title: 'Save PDF Report',
        defaultPath: suggestedName,
        filters: [{ name: 'PDF Files', extensions: ['pdf'] }],
      });

      if (result.canceled || !result.filePath) {
        return { data: null, error: null };
      }

      writeFileSync(result.filePath, Buffer.from(bytes));
      return { data: result.filePath, error: null };
    } catch (err) {
      return { data: null, error: { message: (err as Error).message } };
    }
  });

  ipcMain.handle('pdf:saveToUserData', async (_event, bytes: Uint8Array, fileName: string) => {
    try {
      const reportsDir = join(app.getPath('userData'), 'reports');
      if (!existsSync(reportsDir)) {
        mkdirSync(reportsDir, { recursive: true });
      }

      const filePath = join(reportsDir, fileName);
      writeFileSync(filePath, Buffer.from(bytes));
      return { data: filePath, error: null };
    } catch (err) {
      return { data: null, error: { message: (err as Error).message } };
    }
  });
}
