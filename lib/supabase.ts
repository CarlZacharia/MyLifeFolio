/**
 * Supabase compatibility shim for the Electron desktop version.
 *
 * This module re-exports `dbClient` from src/lib/db-client.ts as `supabase`,
 * so all existing imports (`import { supabase } from '../lib/supabase'`)
 * continue to work without modification. Under the hood, all operations
 * route to the local SQLite database via IPC.
 *
 * The original Supabase client has been removed — all data is now stored
 * locally in SQLite.
 */

import { dbClient } from '../src/lib/db-client';

export const supabase = dbClient;
