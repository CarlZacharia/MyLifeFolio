import { ipcMain } from 'electron';
import { getDb } from '../db';

export function registerDbHandlers(): void {
  ipcMain.handle('db:query', async (_event, table: string, method: string, params: unknown) => {
    try {
      const db = getDb();
      if (!db) return { data: null, error: { message: 'Database not unlocked' } };

      // Dynamic query routing - implemented in Phase 4/6
      const handler = queryHandlers[table];
      if (!handler) return { data: null, error: { message: `Unknown table: ${table}` } };

      return await handler(db, method, params);
    } catch (err) {
      return { data: null, error: { message: (err as Error).message } };
    }
  });

  ipcMain.handle('db:execute', async (_event, sql: string, params?: unknown[]) => {
    try {
      const db = getDb();
      if (!db) return { data: null, error: { message: 'Database not unlocked' } };
      const result = db.prepare(sql).run(...(params || []));
      return { data: result, error: null };
    } catch (err) {
      return { data: null, error: { message: (err as Error).message } };
    }
  });

  ipcMain.handle('db:rpc', async (_event, functionName: string, params: unknown) => {
    try {
      const db = getDb();
      if (!db) return { data: null, error: { message: 'Database not unlocked' } };

      const rpcHandler = rpcHandlers[functionName];
      if (!rpcHandler) return { data: null, error: { message: `Unknown RPC: ${functionName}` } };

      return await rpcHandler(db, params);
    } catch (err) {
      return { data: null, error: { message: (err as Error).message } };
    }
  });
}

// Query handlers per table - populated in Phase 6
const queryHandlers: Record<string, (db: ReturnType<typeof getDb>, method: string, params: unknown) => Promise<{ data: unknown; error: unknown }>> = {};

// RPC handlers - populated in Phase 6
const rpcHandlers: Record<string, (db: ReturnType<typeof getDb>, params: unknown) => Promise<{ data: unknown; error: unknown }>> = {};

export { queryHandlers, rpcHandlers };
