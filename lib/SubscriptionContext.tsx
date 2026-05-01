'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from './supabase';
import {
  SubscriptionTier,
  FeatureKey,
  getRequiredTier,
} from './subscriptionConfig';

interface SubscriptionRow {
  tier: SubscriptionTier;
  status: string;
  trial_started_at: string | null;
  trial_ends_at: string | null;
  grace_period_ends_at: string | null;
  scheduled_deletion_at: string | null;
  decision: 'renew' | 'delete' | null;
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
  /** Whether the trial period itself has ended (i.e. user is past trial_ends_at) */
  isTrialExpired: boolean;
  /** Whether the user is in the 30-day grace period after trial. Can still
   *  log in but only to make a renew/delete decision. */
  isInGracePeriod: boolean;
  /** Days remaining in grace period (null if not in grace) */
  gracePeriodDaysRemaining: number | null;
  /** True once trial AND grace period have both ended — account should be
   *  treated as deleted/inaccessible (a daily cron actually wipes data). */
  isPastGracePeriod: boolean;
  /** Whether the user has affirmatively chosen to delete on cancel. */
  hasChosenToDelete: boolean;
  /** Whether the user has affirmatively chosen to renew. */
  hasChosenToRenew: boolean;
  /** Whether the account has been disabled by an admin */
  isDisabled: boolean;
  /** Check if the user can access a specific feature */
  canAccess: (feature: FeatureKey) => boolean;
  /** Get the minimum tier required for a feature */
  requiredTier: (feature: FeatureKey) => SubscriptionTier;
  /** Refresh subscription data (call after checkout / decision) */
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
  const [gracePeriodEndsAt, setGracePeriodEndsAt] = useState<Date | null>(null);
  const [decision, setDecision] = useState<'renew' | 'delete' | null>(null);
  const [isDisabled, setIsDisabled] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchSubscription = useCallback(async () => {
    if (!user) {
      setTier('trial');
      setStatus('active');
      setTrialEndsAt(null);
      setGracePeriodEndsAt(null);
      setDecision(null);
      setIsDisabled(false);
      setLoading(false);
      return;
    }

    try {
      const [subResult, profileResult] = await Promise.all([
        supabase
          .from('user_subscriptions')
          .select(
            'tier, status, trial_started_at, trial_ends_at, grace_period_ends_at, scheduled_deletion_at, decision, current_period_start, current_period_end',
          )
          .eq('user_id', user.id)
          .single(),
        supabase
          .from('profiles')
          .select('is_disabled')
          .eq('id', user.id)
          .single(),
      ]);

      setIsDisabled(profileResult.data?.is_disabled === true);

      if (subResult.error || !subResult.data) {
        // No subscription row yet — treat as trial.
        setTier('trial');
        setStatus('active');
        setTrialEndsAt(null);
        setGracePeriodEndsAt(null);
        setDecision(null);
        setLoading(false);
        return;
      }

      const row = subResult.data as SubscriptionRow;
      // Normalize any legacy 'standard'/'enhanced' values that might still
      // exist in stale local caches (the migration moves them to 'paid').
      const normalizedTier: SubscriptionTier =
        row.tier === 'paid' ? 'paid' : 'trial';
      setTier(normalizedTier);
      setStatus(row.status);
      setTrialEndsAt(row.trial_ends_at ? new Date(row.trial_ends_at) : null);
      setGracePeriodEndsAt(row.grace_period_ends_at ? new Date(row.grace_period_ends_at) : null);
      setDecision(row.decision);
    } catch {
      setTier('trial');
      setStatus('active');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchSubscription();
  }, [fetchSubscription]);

  const now = new Date();

  const isTrialExpired =
    tier === 'trial' && trialEndsAt !== null && trialEndsAt < now;

  const isInGracePeriod =
    tier === 'trial' &&
    isTrialExpired &&
    gracePeriodEndsAt !== null &&
    gracePeriodEndsAt > now;

  const isPastGracePeriod =
    tier === 'trial' &&
    gracePeriodEndsAt !== null &&
    gracePeriodEndsAt < now;

  const trialDaysRemaining =
    tier === 'trial' && trialEndsAt !== null
      ? Math.max(0, Math.ceil((trialEndsAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
      : null;

  const gracePeriodDaysRemaining =
    isInGracePeriod && gracePeriodEndsAt !== null
      ? Math.max(0, Math.ceil((gracePeriodEndsAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
      : null;

  const canAccess = useCallback(
    (_feature: FeatureKey): boolean => {
      // TEMPORARY: Grant full feature access to all users for beta testing.
      // TODO: Re-enable tier gating when going live with Stripe — at that
      // point, deny when isPastGracePeriod or isDisabled.
      if (isDisabled) return false;
      return true;
    },
    [isDisabled],
  );

  const value: SubscriptionContextType = {
    tier,
    status,
    loading,
    trialDaysRemaining,
    isTrialExpired,
    isInGracePeriod,
    gracePeriodDaysRemaining,
    isPastGracePeriod,
    hasChosenToDelete: decision === 'delete',
    hasChosenToRenew: decision === 'renew',
    isDisabled,
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
