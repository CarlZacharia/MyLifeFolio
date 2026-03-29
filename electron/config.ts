/**
 * Electron app configuration.
 *
 * In development: reads from .env
 * In production: reads from bundled config or electron-store
 */

import { app } from 'electron';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

interface PublishingConfig {
  supabaseUrl: string;
  supabaseAnonKey: string;
  ownerId: string;
  ownerEmail: string;
}

let publishingConfig: PublishingConfig | null = null;

export function getPublishingConfig(): PublishingConfig | null {
  if (publishingConfig) return publishingConfig;

  // Try to read from the local config file
  const configPath = join(app.getPath('userData'), 'publishing-config.json');
  if (existsSync(configPath)) {
    try {
      publishingConfig = JSON.parse(readFileSync(configPath, 'utf-8'));
      return publishingConfig;
    } catch {
      return null;
    }
  }

  // Fallback: read from environment (development)
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

  if (url && key) {
    // No owner configured yet — publishing requires setup
    return null;
  }

  return null;
}

export function setPublishingConfig(config: PublishingConfig): void {
  const { writeFileSync } = require('fs');
  const configPath = join(app.getPath('userData'), 'publishing-config.json');
  writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf-8');
  publishingConfig = config;
}
