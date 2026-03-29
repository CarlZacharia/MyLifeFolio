'use client';

import React, { createContext, useContext } from 'react';
import {
  SubscriptionTier,
  FeatureKey,
  getRequiredTier,
} from './subscriptionConfig';

/**
 * Desktop version: all features are unlocked.
 * No subscription checking needed — the user paid for the app.
 */

interface SubscriptionContextType {
  tier: SubscriptionTier;
  status: string;
  loading: boolean;
  trialDaysRemaining: number | null;
  isTrialExpired: boolean;
  isDisabled: boolean;
  canAccess: (feature: FeatureKey) => boolean;
  requiredTier: (feature: FeatureKey) => SubscriptionTier;
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
  // Desktop app: all features unlocked at "enhanced" tier
  const value: SubscriptionContextType = {
    tier: 'enhanced',
    status: 'active',
    loading: false,
    trialDaysRemaining: null,
    isTrialExpired: false,
    isDisabled: false,
    canAccess: () => true,
    requiredTier: (feature: FeatureKey) => getRequiredTier(feature),
    refresh: async () => {},
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
};
