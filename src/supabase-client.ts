import { createClient } from '@supabase/supabase-js';

// Custom storage adapter using sessionStorage
// This ensures sessions only persist while the browser tab/window is open
const sessionStorageAdapter = {
  getItem: (key: string) => {
    if (typeof window === 'undefined') return null;
    return sessionStorage.getItem(key);
  },
  setItem: (key: string, value: string) => {
    if (typeof window === 'undefined') return;
    sessionStorage.setItem(key, value);
  },
  removeItem: (key: string) => {
    if (typeof window === 'undefined') return;
    sessionStorage.removeItem(key);
  },
};

export const supabase = createClient(
  "https://umhkyuqgshdedhluedkg.supabase.co",
  "sb_publishable_ODiM-qBhG2jhnwJtzRMI7w_Ljt0YTYU",
  {
    auth: {
      storage: sessionStorageAdapter,
      persistSession: true, // Keep session during tab lifetime
      autoRefreshToken: true, // Refresh token while session is active
    },
  }
);