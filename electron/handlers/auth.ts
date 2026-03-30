import { ipcMain, app } from 'electron';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import bcrypt from 'bcryptjs';
import { openDatabase, closeDatabase } from '../db';

interface AppConfig {
  passphraseHash: string;
  setupComplete: boolean;
  setupDate: string;
  vaultExtraSecurity?: boolean;
}

let failedAttempts = 0;
let lockoutUntil = 0;
const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 30_000;

function getConfigPath(): string {
  return join(app.getPath('userData'), 'config.json');
}

function readConfig(): AppConfig | null {
  const configPath = getConfigPath();
  if (!existsSync(configPath)) return null;
  try {
    return JSON.parse(readFileSync(configPath, 'utf-8'));
  } catch {
    return null;
  }
}

function writeConfig(config: AppConfig): void {
  writeFileSync(getConfigPath(), JSON.stringify(config, null, 2), 'utf-8');
}

export function registerAuthHandlers(): void {
  ipcMain.handle('auth:isSetup', async () => {
    try {
      const config = readConfig();
      return { data: config?.setupComplete === true, error: null };
    } catch (err) {
      return { data: false, error: { message: (err as Error).message } };
    }
  });

  ipcMain.handle('auth:setup', async (_event, passphrase: string) => {
    try {
      if (passphrase.length < 12) {
        return { data: null, error: { message: 'Passphrase must be at least 12 characters' } };
      }

      const hash = await bcrypt.hash(passphrase, 12);
      const config: AppConfig = {
        passphraseHash: hash,
        setupComplete: true,
        setupDate: new Date().toISOString(),
      };
      writeConfig(config);

      // Open the database
      openDatabase();

      failedAttempts = 0;
      return { data: true, error: null };
    } catch (err) {
      return { data: null, error: { message: (err as Error).message } };
    }
  });

  ipcMain.handle('auth:unlock', async (_event, passphrase: string) => {
    try {
      // Check lockout
      if (Date.now() < lockoutUntil) {
        const remaining = Math.ceil((lockoutUntil - Date.now()) / 1000);
        return { data: null, error: { message: `Too many attempts. Try again in ${remaining} seconds.` } };
      }

      const config = readConfig();
      if (!config) {
        return { data: null, error: { message: 'App not set up yet' } };
      }

      const valid = await bcrypt.compare(passphrase, config.passphraseHash);
      if (!valid) {
        failedAttempts++;
        if (failedAttempts >= MAX_ATTEMPTS) {
          lockoutUntil = Date.now() + LOCKOUT_MS;
          failedAttempts = 0;
          return { data: null, error: { message: 'Too many failed attempts. Locked out for 30 seconds.' } };
        }
        return { data: null, error: { message: 'Incorrect passphrase' } };
      }

      // Open the database
      openDatabase();

      failedAttempts = 0;
      return { data: true, error: null };
    } catch (err) {
      return { data: null, error: { message: (err as Error).message } };
    }
  });

  ipcMain.handle('auth:lock', async () => {
    try {
      closeDatabase();
      return { data: true, error: null };
    } catch (err) {
      return { data: null, error: { message: (err as Error).message } };
    }
  });

  ipcMain.handle('auth:isUnlocked', async () => {
    try {
      const { getDb } = await import('../db');
      return { data: getDb() !== null, error: null };
    } catch {
      return { data: false, error: null };
    }
  });

  ipcMain.handle('auth:getVaultPref', async () => {
    try {
      const config = readConfig();
      return { data: config?.vaultExtraSecurity ?? false, error: null };
    } catch (err) {
      return { data: false, error: { message: (err as Error).message } };
    }
  });

  ipcMain.handle('auth:setVaultPref', async (_event, extraSecurity: boolean) => {
    try {
      const config = readConfig();
      if (!config) {
        return { data: null, error: { message: 'App not set up yet' } };
      }
      config.vaultExtraSecurity = extraSecurity;
      writeConfig(config);
      return { data: true, error: null };
    } catch (err) {
      return { data: null, error: { message: (err as Error).message } };
    }
  });

  ipcMain.handle('auth:changePassphrase', async (_event, current: string, newPassphrase: string) => {
    try {
      const config = readConfig();
      if (!config) {
        return { data: null, error: { message: 'App not set up yet' } };
      }

      const valid = await bcrypt.compare(current, config.passphraseHash);
      if (!valid) {
        return { data: null, error: { message: 'Current passphrase is incorrect' } };
      }

      if (newPassphrase.length < 12) {
        return { data: null, error: { message: 'New passphrase must be at least 12 characters' } };
      }

      const hash = await bcrypt.hash(newPassphrase, 12);
      config.passphraseHash = hash;
      writeConfig(config);

      return { data: true, error: null };
    } catch (err) {
      return { data: null, error: { message: (err as Error).message } };
    }
  });
}
