'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from './supabase';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  hasRegistered: boolean;
  signOut: () => Promise<void>;
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

  useEffect(() => {
    // Only treat a user as authenticated if their email is confirmed
    const confirmedUser = (session: Session | null) => {
      const u = session?.user ?? null;
      if (u && !u.email_confirmed_at) return null;
      return u;
    };

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      const u = confirmedUser(session);
      setUser(u);
      if (u) {
        localStorage.setItem(HAS_REGISTERED_KEY, 'true');
        setHasRegistered(true);
      }
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      const u = confirmedUser(session);
      setUser(u);
      if (u) {
        localStorage.setItem(HAS_REGISTERED_KEY, 'true');
        setHasRegistered(true);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
  };

  const value = {
    user,
    session,
    loading,
    hasRegistered,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
