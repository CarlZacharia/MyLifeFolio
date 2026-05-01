// Supabase Edge Function to handle Stripe webhook events
// Updates user_subscriptions based on payment events

// @ts-ignore - Deno imports work in Supabase Edge Functions runtime
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
// @ts-ignore - Deno imports work in Supabase Edge Functions runtime
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
// @ts-ignore - Deno imports work in Supabase Edge Functions runtime
import Stripe from 'https://esm.sh/stripe@14.14.0?target=deno';

// @ts-ignore - Deno global available in Edge Functions runtime
declare const Deno: { env: { get(key: string): string | undefined } };

// Stripe price ID for the single paid plan ($149/yr).
// Set STRIPE_PRICE_PAID in Supabase Edge Function secrets.

serve(async (req: Request) => {
  const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY')!;
  const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')!;
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  // Single paid price ID. Old STRIPE_PRICE_STANDARD / STRIPE_PRICE_ENHANCED
  // env vars are no longer consulted.
  const pricePaid = Deno.env.get('STRIPE_PRICE_PAID') || '';

  const stripe = new Stripe(stripeSecretKey, { apiVersion: '2023-10-16' });
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    // Verify Stripe signature
    const body = await req.text();
    const signature = req.headers.get('stripe-signature');
    if (!signature) {
      return new Response('Missing stripe-signature header', { status: 400 });
    }

    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);

    // Map price ID to tier. With only one paid plan, any matching price ID
    // (or any non-empty price ID, when env isn't yet configured) becomes 'paid'.
    const priceToTier = (priceId: string): 'paid' => {
      if (priceId && priceId === pricePaid) return 'paid';
      return 'paid'; // fall through — any active subscription is the paid tier
    };

    // Extract supabase_user_id from subscription metadata
    const getUserId = async (subscriptionId: string): Promise<string | null> => {
      const sub = await stripe.subscriptions.retrieve(subscriptionId);
      return (sub.metadata?.supabase_user_id as string) || null;
    };

    switch (event.type) {
      // Checkout completed — activate the subscription
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.supabase_user_id;
        if (!userId || !session.subscription) break;

        const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
        const priceId = subscription.items.data[0]?.price?.id || '';
        const tier = priceToTier(priceId);

        await supabase
          .from('user_subscriptions')
          .update({
            tier,
            status: 'active',
            stripe_customer_id: session.customer as string,
            stripe_subscription_id: subscription.id,
            stripe_price_id: priceId,
            current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          })
          .eq('user_id', userId);

        console.log(`Activated ${tier} for user ${userId}`);
        break;
      }

      // Subscription updated — handle plan changes, renewals
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata?.supabase_user_id;
        if (!userId) break;

        const priceId = subscription.items.data[0]?.price?.id || '';
        const tier = priceToTier(priceId);
        const status = subscription.status === 'active' ? 'active'
          : subscription.status === 'past_due' ? 'past_due'
          : subscription.status === 'canceled' ? 'cancelled'
          : 'active';

        await supabase
          .from('user_subscriptions')
          .update({
            tier,
            status,
            stripe_price_id: priceId,
            current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          })
          .eq('user_id', userId);

        console.log(`Updated subscription for user ${userId}: ${tier} (${status})`);
        break;
      }

      // Subscription deleted — revert to expired
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata?.supabase_user_id;
        if (!userId) break;

        await supabase
          .from('user_subscriptions')
          .update({
            tier: 'trial',
            status: 'cancelled',
            stripe_subscription_id: null,
            stripe_price_id: null,
            current_period_start: null,
            current_period_end: null,
          })
          .eq('user_id', userId);

        console.log(`Cancelled subscription for user ${userId}`);
        break;
      }

      // Invoice payment failed
      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        if (!invoice.subscription) break;
        const userId = await getUserId(invoice.subscription as string);
        if (!userId) break;

        await supabase
          .from('user_subscriptions')
          .update({ status: 'past_due' })
          .eq('user_id', userId);

        console.log(`Payment failed for user ${userId}`);
        break;
      }

      // Invoice paid — restore active status
      case 'invoice.paid': {
        const invoice = event.data.object as Stripe.Invoice;
        if (!invoice.subscription) break;
        const userId = await getUserId(invoice.subscription as string);
        if (!userId) break;

        await supabase
          .from('user_subscriptions')
          .update({ status: 'active' })
          .eq('user_id', userId);

        console.log(`Payment succeeded for user ${userId}`);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('stripe-webhook error:', message);
    return new Response(
      JSON.stringify({ error: message }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }
});
