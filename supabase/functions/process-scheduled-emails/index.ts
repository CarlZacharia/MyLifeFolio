// Supabase Edge Function to process scheduled trial reminder emails
// Intended to be called on a cron schedule (e.g. daily)

// @ts-ignore - Deno imports work in Supabase Edge Functions runtime
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
// @ts-ignore - Deno imports work in Supabase Edge Functions runtime
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// @ts-ignore - Deno global available in Edge Functions runtime
declare const Deno: { env: { get(key: string): string | undefined } };

// Allowed origins for CORS — production only
const ALLOWED_ORIGINS = new Set([
  'https://mylifefolio.com',
  'https://www.mylifefolio.com',

  ...(Deno.env.get('ALLOWED_ORIGIN') ? [Deno.env.get('ALLOWED_ORIGIN')!] : []),
]);

/** Return the request Origin if it's in the whitelist, otherwise the first allowed origin */
function getCorsOrigin(req: Request): string {
  const origin = req.headers.get('Origin') || '';
  return ALLOWED_ORIGINS.has(origin) ? origin : 'https://mylifefolio.com';
}

function corsHeaders(req: Request) {
  return {
    'Access-Control-Allow-Origin': getCorsOrigin(req),
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };
}

// ── Email templates ───────────────────────────────────────────────────

interface EmailTemplate {
  subject: string;
  html: string;
}

function getEmailTemplate(emailType: string, userName: string): EmailTemplate {
  const firstName = userName?.split(' ')[0] || 'there';
  const accountUrl = 'https://mylifefolio.com/account';
  const renewUrl = 'https://mylifefolio.com/pricing?offer=early-renewal';

  switch (emailType) {
    case 'trial_90day':
      return {
        subject: 'Your MyLifeFolio — 90 days remaining',
        html: `
          <div style="font-family: Georgia, 'Source Sans 3', sans-serif; max-width: 600px; margin: 0 auto; color: #1a1a1a;">
            <div style="background: #1e3a5f; padding: 24px; text-align: center;">
              <h1 style="color: white; font-size: 22px; margin: 0;">MyLifeFolio</h1>
            </div>
            <div style="padding: 32px 24px;">
              <p style="font-size: 16px;">Hi ${firstName},</p>
              <p style="font-size: 16px; line-height: 1.6;">
                You've been building something meaningful — a complete record of your life's most important details,
                all in one secure place. From personal information to legacy wishes, every entry you've made brings
                peace of mind to you and the people who matter most.
              </p>
              <p style="font-size: 16px; line-height: 1.6;">
                You still have <strong>90 days</strong> remaining on your trial. There's plenty of time to explore
                every section, upload documents, and make sure nothing important is left behind.
              </p>
              <p style="font-size: 16px; line-height: 1.6;">
                Keep going — your future self (and your family) will thank you.
              </p>
              <div style="text-align: center; margin: 32px 0;">
                <a href="${accountUrl}" style="background: #1e3a5f; color: white; padding: 12px 32px; text-decoration: none; border-radius: 4px; font-weight: 600;">
                  Continue Building Your Folio
                </a>
              </div>
            </div>
            <div style="background: #f5f3f0; padding: 16px 24px; text-align: center; font-size: 13px; color: #888;">
              &copy; ${new Date().getFullYear()} MyLifeFolio. All rights reserved.
            </div>
          </div>
        `,
      };

    case 'trial_30day':
      return {
        subject: 'Your MyLifeFolio trial ends in 30 days',
        html: `
          <div style="font-family: Georgia, 'Source Sans 3', sans-serif; max-width: 600px; margin: 0 auto; color: #1a1a1a;">
            <div style="background: #1e3a5f; padding: 24px; text-align: center;">
              <h1 style="color: white; font-size: 22px; margin: 0;">MyLifeFolio</h1>
            </div>
            <div style="padding: 32px 24px;">
              <p style="font-size: 16px;">Hi ${firstName},</p>
              <p style="font-size: 16px; line-height: 1.6;">
                Your MyLifeFolio trial ends in <strong>30 days</strong>. After that, you'll lose access to
                the information you've carefully organized — personal details, financial records, medical data,
                legacy wishes, uploaded documents, and saved credentials.
              </p>
              <p style="font-size: 16px; line-height: 1.6;">
                Everything you've built is still here, waiting for you. Renewing ensures your folio stays
                accessible and protected for you and the people you've chosen to share it with.
              </p>
              <div style="text-align: center; margin: 32px 0;">
                <a href="${accountUrl}" style="background: #c9a227; color: #0f2744; padding: 12px 32px; text-decoration: none; border-radius: 4px; font-weight: 600;">
                  Renew Your Subscription
                </a>
              </div>
              <p style="font-size: 14px; color: #5a5a5a; text-align: center;">
                Questions? Reply to this email or contact us at support@mylifefolio.com
              </p>
            </div>
            <div style="background: #f5f3f0; padding: 16px 24px; text-align: center; font-size: 13px; color: #888;">
              &copy; ${new Date().getFullYear()} MyLifeFolio. All rights reserved.
            </div>
          </div>
        `,
      };

    case 'trial_7day':
      return {
        subject: 'Last chance — your MyLifeFolio trial ends in 7 days',
        html: `
          <div style="font-family: Georgia, 'Source Sans 3', sans-serif; max-width: 600px; margin: 0 auto; color: #1a1a1a;">
            <div style="background: #1e3a5f; padding: 24px; text-align: center;">
              <h1 style="color: white; font-size: 22px; margin: 0;">MyLifeFolio</h1>
            </div>
            <div style="padding: 32px 24px;">
              <p style="font-size: 16px;">Hi ${firstName},</p>
              <p style="font-size: 16px; line-height: 1.6;">
                Your trial expires in just <strong>7 days</strong>. After that, your folio — including all your
                personal records, documents, and legacy information — will no longer be accessible.
              </p>
              <div style="background: #fff8e1; border: 1px solid #ffe082; border-radius: 8px; padding: 20px; margin: 24px 0; text-align: center;">
                <p style="font-size: 18px; font-weight: 600; color: #1e3a5f; margin: 0 0 8px 0;">
                  Special Early Renewal Offer
                </p>
                <p style="font-size: 16px; margin: 0 0 16px 0;">
                  Renew now for <strong style="color: #c9a227; font-size: 20px;">$99/year</strong>
                  <span style="text-decoration: line-through; color: #888;">$140/year</span>
                </p>
                <a href="${renewUrl}" style="background: #c9a227; color: #0f2744; padding: 12px 32px; text-decoration: none; border-radius: 4px; font-weight: 600; display: inline-block;">
                  Renew Now — Save $41
                </a>
              </div>
              <p style="font-size: 16px; line-height: 1.6;">
                Don't let the work you've done go to waste. Your family's peace of mind is worth it.
              </p>
              <p style="font-size: 14px; color: #5a5a5a; text-align: center;">
                Questions? Reply to this email or contact us at support@mylifefolio.com
              </p>
            </div>
            <div style="background: #f5f3f0; padding: 16px 24px; text-align: center; font-size: 13px; color: #888;">
              &copy; ${new Date().getFullYear()} MyLifeFolio. All rights reserved.
            </div>
          </div>
        `,
      };

    default:
      return { subject: '', html: '' };
  }
}

// ── Main handler ──────────────────────────────────────────────────────

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders(req) });
  }

  try {
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    if (!resendApiKey) {
      throw new Error('RESEND_API_KEY is not configured');
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Fetch pending emails that are due
    const { data: pendingEmails, error: fetchError } = await supabaseAdmin
      .from('scheduled_emails')
      .select('*')
      .eq('status', 'pending')
      .lte('scheduled_for', new Date().toISOString())
      .order('scheduled_for', { ascending: true });

    if (fetchError) {
      throw new Error(`Failed to fetch scheduled emails: ${fetchError.message}`);
    }

    const summary = { processed: 0, sent: 0, failed: 0 };

    for (const row of pendingEmails || []) {
      summary.processed++;

      try {
        // Look up user email and name from auth.users via profiles
        const { data: profile, error: profileError } = await supabaseAdmin
          .from('profiles')
          .select('email, name')
          .eq('id', row.user_id)
          .single();

        if (profileError || !profile?.email) {
          throw new Error(`Could not find email for user ${row.user_id}`);
        }

        const template = getEmailTemplate(row.email_type, profile.name || '');
        if (!template.subject) {
          throw new Error(`Unknown email_type: ${row.email_type}`);
        }

        // Send via Resend
        const resendRes = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${resendApiKey}`,
          },
          body: JSON.stringify({
            from: 'MyLifeFolio <noreply@mylifefolio.com>',
            to: [profile.email],
            subject: template.subject,
            html: template.html,
          }),
        });

        if (!resendRes.ok) {
          const errBody = await resendRes.text();
          throw new Error(`Resend API error ${resendRes.status}: ${errBody}`);
        }

        // Mark as sent
        await supabaseAdmin
          .from('scheduled_emails')
          .update({ status: 'sent', sent_at: new Date().toISOString() })
          .eq('id', row.id);

        summary.sent++;
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : 'Unknown error';
        console.error(`Failed to send email ${row.id} (${row.email_type}):`, errorMsg);

        // Mark as failed — do not throw, continue processing
        await supabaseAdmin
          .from('scheduled_emails')
          .update({ status: 'failed', error: errorMsg })
          .eq('id', row.id);

        summary.failed++;
      }
    }

    return new Response(
      JSON.stringify(summary),
      {
        status: 200,
        headers: { ...corsHeaders(req), 'Content-Type': 'application/json' },
      }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('process-scheduled-emails error:', message);
    return new Response(
      JSON.stringify({ error: message }),
      {
        status: 500,
        headers: { ...corsHeaders(req), 'Content-Type': 'application/json' },
      }
    );
  }
});
