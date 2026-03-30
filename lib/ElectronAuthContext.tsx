import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import {
  deriveKey,
  generateSalt,
  generateRecoveryKey,
  saltToHex,
  hexToSalt,
  encryptKeyWithRecoveryKey,
} from './vaultCrypto';

interface ElectronAuthContextType {
  isUnlocked: boolean;
  isSetup: boolean;
  loading: boolean;
  /** Mimics the old user object shape for compatibility */
  user: { id: string; email: string } | null;
  /** In desktop app, user is reauthenticated whenever the app is unlocked */
  isReauthenticated: boolean;
  /** Auto-derived vault key when extra vault security is disabled */
  autoVaultKey: CryptoKey | null;
  /** Whether the vault uses a separate passphrase */
  vaultExtraSecurity: boolean;
  unlock: (passphrase: string) => Promise<{ error: string | null }>;
  lock: () => Promise<void>;
  setup: (passphrase: string, vaultExtraSecurity: boolean) => Promise<{ error: string | null }>;
  changePassphrase: (current: string, newPass: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

const ElectronAuthContext = createContext<ElectronAuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(ElectronAuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an ElectronAuthProvider');
  }
  return context;
};

// Local user ID — single user desktop app, stable across sessions
const LOCAL_USER_ID = 'local-user';
const LOCAL_USER_EMAIL = 'local@mylifefolio.desktop';

interface ElectronAuthProviderProps {
  children: React.ReactNode;
}

/**
 * Auto-setup the credentials vault using the app passphrase.
 * Creates vault settings in the DB so DigitalLifeSection sees it as already set up.
 */
async function autoSetupVault(passphrase: string, userId: string): Promise<CryptoKey> {
  const salt = generateSalt();
  const masterKey = await deriveKey(passphrase, salt);
  const recoveryKey = generateRecoveryKey();
  const recoveryKeyCiphertext = await encryptKeyWithRecoveryKey(masterKey, recoveryKey);

  // Save vault settings via the DB shim
  const { dbClient } = await import('../src/lib/db-client');
  const result = await dbClient.from('credential_vault_settings').upsert({
    user_id: userId,
    salt: saltToHex(salt),
    recovery_key_ciphertext: recoveryKeyCiphertext,
    vault_enabled: true,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'user_id' }).then();
  if (result.error) throw new Error(result.error.message);

  return masterKey;
}

/**
 * Auto-unlock the vault by deriving the key from the app passphrase + stored salt.
 */
async function autoUnlockVault(passphrase: string, userId: string): Promise<CryptoKey | null> {
  const { dbClient } = await import('../src/lib/db-client');
  const { data } = await dbClient.from<Record<string, unknown>>('credential_vault_settings')
    .select('salt, vault_enabled')
    .eq('user_id', userId)
    .maybeSingle() as { data: Record<string, unknown> | null; error: unknown };

  if (!data || !data.vault_enabled) return null;
  const salt = hexToSalt(data.salt as string);
  return deriveKey(passphrase, salt);
}

export const ElectronAuthProvider: React.FC<ElectronAuthProviderProps> = ({ children }) => {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isSetup, setIsSetup] = useState(false);
  const [loading, setLoading] = useState(true);
  const [autoVaultKey, setAutoVaultKey] = useState<CryptoKey | null>(null);
  const [vaultExtraSecurity, setVaultExtraSecurity] = useState(false);

  // Store passphrase temporarily for vault key derivation (cleared on lock)
  const passphraseRef = useRef<string | null>(null);

  // Check setup state on mount
  useEffect(() => {
    const checkSetup = async () => {
      try {
        const result = await window.electronAPI.auth.isSetup();
        setIsSetup(result.data === true);

        // Also check if already unlocked (e.g. dev reload)
        const unlocked = await window.electronAPI.auth.isUnlocked();
        setIsUnlocked(unlocked.data === true);

        // Load vault preference
        const pref = await window.electronAPI.auth.getVaultPref();
        setVaultExtraSecurity(pref.data === true);
      } catch {
        // Not in Electron context — silently handle
      }
      setLoading(false);
    };
    checkSetup();
  }, []);

  // Listen for auto-lock events from main process
  useEffect(() => {
    if (!window.electronAPI?.onAutoLock) return;
    const cleanup = window.electronAPI.onAutoLock(() => {
      setIsUnlocked(false);
      setAutoVaultKey(null);
      passphraseRef.current = null;
      window.electronAPI.auth.lock();
    });
    return () => { cleanup(); };
  }, []);

  // Track user activity for auto-lock
  useEffect(() => {
    if (!isUnlocked || !window.electronAPI?.reportActivity) return;

    const handleActivity = () => window.electronAPI.reportActivity();
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    events.forEach(e => document.addEventListener(e, handleActivity, { passive: true }));
    return () => {
      events.forEach(e => document.removeEventListener(e, handleActivity));
    };
  }, [isUnlocked]);

  const unlock = useCallback(async (passphrase: string) => {
    const result = await window.electronAPI.auth.unlock(passphrase);
    if (result.error) return { error: result.error.message };
    setIsUnlocked(true);

    // Auto-derive vault key if extra security is off
    const pref = await window.electronAPI.auth.getVaultPref();
    if (!pref.data) {
      try {
        const key = await autoUnlockVault(passphrase, LOCAL_USER_ID);
        if (key) setAutoVaultKey(key);
      } catch {
        // Vault not set up yet — that's fine
      }
    }

    return { error: null };
  }, []);

  const lock = useCallback(async () => {
    await window.electronAPI.auth.lock();
    setIsUnlocked(false);
    setAutoVaultKey(null);
    passphraseRef.current = null;
  }, []);

  const setup = useCallback(async (passphrase: string, extraSecurity: boolean) => {
    const result = await window.electronAPI.auth.setup(passphrase);
    if (result.error) return { error: result.error.message };

    // Save vault preference
    await window.electronAPI.auth.setVaultPref(extraSecurity);
    setVaultExtraSecurity(extraSecurity);

    setIsSetup(true);
    setIsUnlocked(true);

    // If no extra security, auto-setup the vault now
    if (!extraSecurity) {
      try {
        const key = await autoSetupVault(passphrase, LOCAL_USER_ID);
        setAutoVaultKey(key);
      } catch (err) {
        console.error('Auto vault setup failed:', err);
      }
    }

    return { error: null };
  }, []);

  const changePassphrase = useCallback(async (current: string, newPass: string) => {
    const result = await window.electronAPI.auth.changePassphrase(current, newPass);
    if (result.error) return { error: result.error.message };
    return { error: null };
  }, []);

  const signOut = useCallback(async () => {
    await lock();
  }, [lock]);

  const user = isUnlocked ? { id: LOCAL_USER_ID, email: LOCAL_USER_EMAIL } : null;

  const value: ElectronAuthContextType = {
    isUnlocked,
    isSetup,
    loading,
    user,
    isReauthenticated: isUnlocked,
    autoVaultKey,
    vaultExtraSecurity,
    unlock,
    lock,
    setup,
    changePassphrase,
    signOut,
  };

  return (
    <ElectronAuthContext.Provider value={value}>
      {children}
    </ElectronAuthContext.Provider>
  );
};

export default ElectronAuthProvider;
