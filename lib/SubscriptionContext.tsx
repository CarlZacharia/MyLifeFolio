'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from './supabase';
import {
  SubscriptionTier,
  FeatureKey,
  TIER_ACCESS,
  getRequiredTier,
} from './subscriptionConfig';

interface SubscriptionRow {
  tier: SubscriptionTier;
  status: string;
  trial_started_at: string | null;
  trial_ends_at: string | null;
  current_period_start: string | null;
  current_period_end: string | null;
}

interface SubscriptionContextType {
  /** Current subscription tier */
  tier: SubscriptionTier;
  /** Subscription status (active, expired, cancelled, past_due) */
  status: string;
  /** Whether subscription data is still loading */
  loading: boolean;
  /** Days remaining in trial (null if not on trial) */
  trialDaysRemaining: number | null;
  /** Whether the trial has expired */
  isTrialExpired: boolean;
  /** Check if the user can access a specific feature */
  canAccess: (feature: FeatureKey) => boolean;
  /** Get the minimum tier required for a feature */
  requiredTier: (feature: FeatureKey) => SubscriptionTier;
  /** Refresh subscription data (call after checkout) */
  refresh: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
};

interface SubscriptionProviderProps {
  children: React.ReactNode;
}

export const SubscriptionProvider: React.FC<SubscriptionProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [tier, setTier] = useState<SubscriptionTier>('trial');
  const [status, setStatus] = useState<string>('active');
  const [trialEndsAt, setTrialEndsAt] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSubscription = useCallback(async () => {
    if (!user) {
      setTier('trial');
      setStatus('active');
      setTrialEndsAt(null);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('user_subscriptions')
        .select('tier, status, trial_started_at, trial_ends_at, current_period_start, current_period_end')
        .eq('user_id', user.id)
        .single();

      if (error || !data) {
        // No subscription row yet — treat as trial (row may not exist for existing users)
        setTier('trial');
        setStatus('active');
        setTrialEndsAt(null);
        setLoading(false);
        return;
      }

      const row = data as SubscriptionRow;
      setTier(row.tier as SubscriptionTier);
      setStatus(row.status);
      setTrialEndsAt(row.trial_ends_at ? new Date(row.trial_ends_at) : null);
    } catch {
      // On error, default to trial
      setTier('trial');
      setStatus('active');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchSubscription();
  }, [fetchSubscription]);

  // Compute trial state
  const now = new Date();
  const isTrialExpired =
    tier === 'trial' && trialEndsAt !== null && trialEndsAt < now;

  const trialDaysRemaining =
    tier === 'trial' && trialEndsAt !== null
      ? Math.max(0, Math.ceil((trialEndsAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
      : null;

  const canAccess = useCallback(
    (feature: FeatureKey): boolean => {
      // If subscription is not active (expired, cancelled, past_due), block everything
      if (status !== 'active') return false;

      // If trial has expired, block everything
      if (isTrialExpired) return false;

      return TIER_ACCESS[tier].has(feature);
    },
    [tier, status, isTrialExpired]
  );

  const value: SubscriptionContextType = {
    tier,
    status,
    loading,
    trialDaysRemaining,
    isTrialExpired,
    canAccess,
    requiredTier: getRequiredTier,
    refresh: fetchSubscription,
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
};

export default SubscriptionProvider;
