/**
 * Supabase client compatibility shim for Electron.
 * Returns the local dbClient instead of a Supabase browser client.
 */
import { dbClient } from '../db-client';

export function createClient() {
  return dbClient;
}
