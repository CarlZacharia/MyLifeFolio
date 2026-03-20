-- Create user_subscriptions table for pricing tier management
-- Tiers: 'trial' (free 7-day), 'standard' ($139/yr), 'enhanced' ($159/yr)

CREATE TABLE IF NOT EXISTS public.user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Tier: 'trial', 'standard', 'enhanced'
  tier TEXT NOT NULL DEFAULT 'trial'
    CHECK (tier IN ('trial', 'standard', 'enhanced')),

  -- Status: 'active', 'expired', 'cancelled', 'past_due'
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'expired', 'cancelled', 'past_due')),

  -- Trial tracking
  trial_started_at TIMESTAMPTZ,
  trial_ends_at TIMESTAMPTZ,

  -- Stripe references
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  stripe_price_id TEXT,

  -- Billing period
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,

  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- One subscription row per user
  CONSTRAINT unique_user_subscription UNIQUE (user_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON public.user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_stripe_customer ON public.user_subscriptions(stripe_customer_id);

-- Enable RLS
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;

-- Users can read their own subscription
DROP POLICY IF EXISTS "Users can read own subscription" ON public.user_subscriptions;
CREATE POLICY "Users can read own subscription"
  ON public.user_subscriptions
  FOR SELECT
  USING (auth.uid() = user_id);

-- Only service_role (edge functions / webhooks) can insert/update subscriptions
-- Authenticated users should NOT be able to modify their own tier
DROP POLICY IF EXISTS "Service role manages subscriptions" ON public.user_subscriptions;
CREATE POLICY "Service role manages subscriptions"
  ON public.user_subscriptions
  FOR ALL
  USING (auth.role() = 'service_role');

-- Auto-update updated_at
DROP TRIGGER IF EXISTS on_user_subscriptions_updated ON public.user_subscriptions;
CREATE TRIGGER on_user_subscriptions_updated
  BEFORE UPDATE ON public.user_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Extend handle_new_user() to also create a trial subscription on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Create profile (existing logic)
  INSERT INTO public.profiles (
    id, email, name, address, state_of_domicile, telephone,
    agreed_to_terms, agreed_to_terms_at, agreed_to_terms_signature,
    is_admin, created_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'name',
    NEW.raw_user_meta_data->>'address',
    NEW.raw_user_meta_data->>'state_of_domicile',
    NEW.raw_user_meta_data->>'telephone',
    COALESCE((NEW.raw_user_meta_data->>'agreed_to_terms')::boolean, FALSE),
    CASE
      WHEN NEW.raw_user_meta_data->>'agreed_to_terms_at' IS NOT NULL
      THEN (NEW.raw_user_meta_data->>'agreed_to_terms_at')::timestamptz
      ELSE NULL
    END,
    NEW.raw_user_meta_data->>'agreed_to_terms_signature',
    CASE
      WHEN NEW.email LIKE '%@zacbrownlaw.com' THEN TRUE
      ELSE FALSE
    END,
    NOW()
  );

  -- Create trial subscription for the new user
  INSERT INTO public.user_subscriptions (
    user_id, tier, status, trial_started_at, trial_ends_at
  )
  VALUES (
    NEW.id, 'trial', 'active', NOW(), NOW() + INTERVAL '7 days'
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT SELECT ON public.user_subscriptions TO authenticated;
