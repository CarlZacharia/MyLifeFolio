'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from './supabase';

const REAUTH_WINDOW_MS = 10 * 60 * 1000; // 10 minutes

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  hasRegistered: boolean;
  signOut: () => Promise<void>;
  signInWithMagicLink: (email: string, captchaToken?: string) => Promise<{ error: string | null }>;
  signInWithPassword: (email: string, password: string, captchaToken?: string) => Promise<{ error: string | null }>;
  reauthenticate: () => Promise<{ error: string | null }>;
  verifyReauthOtp: (token: string) => Promise<{ error: string | null }>;
  isReauthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

const HAS_REGISTERED_KEY = 'mlf_has_account';

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasRegistered, setHasRegistered] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(HAS_REGISTERED_KEY) === 'true';
    }
    return false;
  });
  const [reauthTime, setReauthTime] = useState<number | null>(null);

  const isReauthenticated = reauthTime
    ? Date.now() - reauthTime < REAUTH_WINDOW_MS
    : false;

  useEffect(() => {
    // Only treat a user as authenticated if their email is confirmed
    const confirmedUser = (session: Session | null) => {
      const u = session?.user ?? null;
      if (u && !u.email_confirmed_at) return null;
      return u;
    };

    // Handle a session: if confirmed, set user; if unconfirmed, sign out to clear the JWT
    const handleSession = async (session: Session | null) => {
      const u = confirmedUser(session);
      if (session && !u) {
        // Unconfirmed user — sign out to clear the JWT from the Supabase client
        await supabase.auth.signOut();
        setSession(null);
        setUser(null);
      } else {
        setSession(session);
        setUser(u);
        if (u) {
          localStorage.setItem(HAS_REGISTERED_KEY, 'true');
          setHasRegistered(true);
        }
      }
      setLoading(false);
    };

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      handleSession(session);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      handleSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setReauthTime(null);
  };

  const signInWithMagicLink = useCallback(async (email: string, captchaToken?: string): Promise<{ error: string | null }> => {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        captchaToken,
      },
    });
    if (error) return { error: error.message };
    return { error: null };
  }, []);

  const signInWithPassword = useCallback(async (email: string, password: string, captchaToken?: string): Promise<{ error: string | null }> => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password, options: { captchaToken } });
    if (error) return { error: error.message };
    if (data.user && !data.user.email_confirmed_at) {
      await supabase.auth.signOut();
      return { error: 'Please confirm your email address before signing in. Check your inbox for a confirmation link.' };
    }
    return { error: null };
  }, []);

  const reauthenticate = useCallback(async (): Promise<{ error: string | null }> => {
    const { error } = await supabase.auth.reauthenticate();
    if (error) return { error: error.message };
    return { error: null };
  }, []);

  const verifyReauthOtp = useCallback(async (token: string): Promise<{ error: string | null }> => {
    const { error } = await supabase.auth.verifyOtp({
      type: 'email',
      token,
      email: user?.email || '',
    });
    if (error) return { error: error.message };
    setReauthTime(Date.now());
    return { error: null };
  }, [user?.email]);

  const value: AuthContextType = {
    user,
    session,
    loading,
    hasRegistered,
    signOut,
    signInWithMagicLink,
    signInWithPassword,
    reauthenticate,
    verifyReauthOtp,
    isReauthenticated,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
