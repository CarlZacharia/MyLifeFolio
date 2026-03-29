import { ipcMain } from 'electron';
import { getDb } from '../db';
import { getPublishingConfig } from '../config';

/**
 * Report publishing handler.
 *
 * Uses Supabase ONLY for encrypted report storage and access control.
 * No plaintext data ever leaves the device.
 */

interface PublishParams {
  reportType: string;
  reportLabel: string;
  encryptedPdfBytes: Uint8Array;
  accessList: Array<{ email: string; name: string }>;
  expiresAt?: string;
}

export function registerUploadHandlers(): void {
  ipcMain.handle('upload:publishReport', async (_event, params: PublishParams) => {
    try {
      const config = getPublishingConfig();
      if (!config) {
        return { data: null, error: { message: 'Publishing not configured. Set up your publishing account first.' } };
      }

      // Dynamic import of Supabase client (only used here)
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(config.supabaseUrl, config.supabaseAnonKey);

      const storagePath = `${config.ownerId}/${params.reportType}/${Date.now()}.pdf`;

      // Upload encrypted PDF to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('encrypted-reports')
        .upload(storagePath, Buffer.from(params.encryptedPdfBytes), {
          contentType: 'application/pdf',
          upsert: true,
        });

      if (uploadError) {
        return { data: null, error: { message: `Upload failed: ${uploadError.message}` } };
      }

      // Upsert report manifest
      const { error: manifestError } = await supabase
        .from('report_manifest')
        .upsert({
          owner_id: config.ownerId,
          owner_email: config.ownerEmail,
          report_type: params.reportType,
          report_label: params.reportLabel,
          storage_path: storagePath,
          published_at: new Date().toISOString(),
          expires_at: params.expiresAt || null,
          version: Date.now(),
          is_active: true,
        }, { onConflict: 'owner_id,report_type' });

      if (manifestError) {
        return { data: null, error: { message: `Manifest update failed: ${manifestError.message}` } };
      }

      // Update family access records
      for (const access of params.accessList) {
        await supabase
          .from('family_access')
          .upsert({
            owner_id: config.ownerId,
            grantee_email: access.email,
            grantee_name: access.name,
            report_type: params.reportType,
            granted_at: new Date().toISOString(),
          }, { onConflict: 'owner_id,grantee_email,report_type' });
      }

      // Store locally for UI display
      const db = getDb();
      if (db) {
        db.prepare(`
          INSERT OR REPLACE INTO published_reports (id, report_type, report_label, storage_path, published_at, access_list)
          VALUES (?, ?, ?, ?, ?, ?)
        `).run(
          crypto.randomUUID(),
          params.reportType,
          params.reportLabel,
          storagePath,
          new Date().toISOString(),
          JSON.stringify(params.accessList),
        );
      }

      return { data: { success: true, storagePath }, error: null };
    } catch (err) {
      return { data: null, error: { message: (err as Error).message } };
    }
  });

  ipcMain.handle('upload:revokeReport', async (_event, reportType: string) => {
    try {
      const config = getPublishingConfig();
      if (!config) {
        return { data: null, error: { message: 'Publishing not configured' } };
      }

      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(config.supabaseUrl, config.supabaseAnonKey);

      // Deactivate in manifest
      await supabase
        .from('report_manifest')
        .update({ is_active: false })
        .eq('owner_id', config.ownerId)
        .eq('report_type', reportType);

      // Update local record
      const db = getDb();
      if (db) {
        db.prepare('DELETE FROM published_reports WHERE report_type = ?').run(reportType);
      }

      return { data: true, error: null };
    } catch (err) {
      return { data: null, error: { message: (err as Error).message } };
    }
  });

  ipcMain.handle('upload:getPublishedReports', async () => {
    try {
      const db = getDb();
      if (!db) return { data: [], error: null };

      const rows = db.prepare('SELECT * FROM published_reports ORDER BY published_at DESC').all();
      return { data: rows, error: null };
    } catch (err) {
      return { data: [], error: { message: (err as Error).message } };
    }
  });
}
