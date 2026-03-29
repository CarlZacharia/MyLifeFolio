import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

interface ElectronAuthContextType {
  isUnlocked: boolean;
  isSetup: boolean;
  loading: boolean;
  /** Mimics the old user object shape for compatibility */
  user: { id: string; email: string } | null;
  unlock: (passphrase: string) => Promise<{ error: string | null }>;
  lock: () => Promise<void>;
  setup: (passphrase: string) => Promise<{ error: string | null }>;
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

export const ElectronAuthProvider: React.FC<ElectronAuthProviderProps> = ({ children }) => {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isSetup, setIsSetup] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check setup state on mount
  useEffect(() => {
    const checkSetup = async () => {
      try {
        const result = await window.electronAPI.auth.isSetup();
        setIsSetup(result.data === true);

        // Also check if already unlocked (e.g. dev reload)
        const unlocked = await window.electronAPI.auth.isUnlocked();
        setIsUnlocked(unlocked.data === true);
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
      window.electronAPI.auth.lock();
    });
    return cleanup;
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
    return { error: null };
  }, []);

  const lock = useCallback(async () => {
    await window.electronAPI.auth.lock();
    setIsUnlocked(false);
  }, []);

  const setup = useCallback(async (passphrase: string) => {
    const result = await window.electronAPI.auth.setup(passphrase);
    if (result.error) return { error: result.error.message };
    setIsSetup(true);
    setIsUnlocked(true);
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
