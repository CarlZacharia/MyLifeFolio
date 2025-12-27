// Supabase Edge Function to proxy requests to Claude API
// This keeps the API key secure on the server side

// @ts-ignore - Deno imports work in Supabase Edge Functions runtime
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RequestBody {
  formData: Record<string, unknown>;
  prompt?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY');

    if (!ANTHROPIC_API_KEY) {
      throw new Error('ANTHROPIC_API_KEY is not configured');
    }

    const { formData, prompt } = (await req.json()) as RequestBody;

    if (!formData) {
      throw new Error('formData is required');
    }

    // Default analysis prompt if none provided
    const analysisPrompt = prompt || `You are an experienced estate planning attorney assistant. Analyze the following estate planning questionnaire data and provide:

1. A summary of the client's situation
2. Key estate planning considerations based on their family structure
3. Potential issues or concerns that should be addressed
4. Recommendations for estate planning documents they may need
5. Any red flags or special circumstances that require attention

Please be thorough but concise. Focus on actionable insights.`;

    // Construct the message for Claude
    const userMessage = `${analysisPrompt}

---

Estate Planning Questionnaire Data:
${JSON.stringify(formData, null, 2)}`;

    // Call Claude API
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4096,
        messages: [
          {
            role: 'user',
            content: userMessage,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Claude API error:', errorText);
      throw new Error(`Claude API error: ${response.status}`);
    }

    const claudeResponse = await response.json();

    return new Response(
      JSON.stringify({
        success: true,
        analysis: claudeResponse.content[0].text,
        usage: claudeResponse.usage,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in analyze-estate-plan function:', error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
