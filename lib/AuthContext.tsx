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
