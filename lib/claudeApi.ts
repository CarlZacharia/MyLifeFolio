import { supabase } from './supabase';

export interface ClaudeAnalysisRequest {
  formData: Record<string, unknown>;
  prompt?: string;
}

export interface ClaudeAnalysisResponse {
  success: boolean;
  analysis?: string;
  usage?: {
    input_tokens: number;
    output_tokens: number;
  };
  error?: string;
}

/**
 * Calls the Supabase Edge Function to analyze estate planning data using Claude
 * @param request The form data and optional custom prompt
 * @returns The analysis response from Claude
 */
export async function analyzeEstatePlan(
  request: ClaudeAnalysisRequest
): Promise<ClaudeAnalysisResponse> {
  try {
    const { data, error } = await supabase.functions.invoke('analyze-estate-plan', {
      body: request,
    });

    if (error) {
      console.error('Supabase function error:', error);
      return {
        success: false,
        error: error.message || 'Failed to call analysis function',
      };
    }

    return data as ClaudeAnalysisResponse;
  } catch (err) {
    console.error('Error calling Claude API:', err);
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Unknown error occurred',
    };
  }
}

/**
 * Pre-defined prompts for different analysis types
 */
export const ANALYSIS_PROMPTS = {
  comprehensive: `Please analyze this client intake data using the estate-plan-intake-advisor skill and generate a comprehensive estate planning analysis report.

Along with the other listings in this skill, identify whether or not this data shows a desire to change domicile, identify whether this is a blended family situation, flag any vulnerable account with beneficiary designations, and if Florida, check the Florida personal representative qualifications requirements.

Please be certain to include:
1. Family profile analysis
2. Asset inventory tables with ownership breakdown
3. Totals by ownership category (Client Only, Spouse Only, Joint, etc.)
4. Probate avoidance issues
5. Document gap analysis
6. Vulnerable assets identification
7. Prioritized recommendations
8. Next steps

Here is the Client Intake Data:`,

  assetSummary: `Analyze the assets in this estate planning questionnaire and provide:
1. Total estimated estate value
2. Asset allocation breakdown (real estate, financial accounts, retirement, etc.)
3. Ownership structure analysis (joint, sole, beneficiary designated)
4. Potential probate vs non-probate asset distribution
5. Recommendations for asset titling or beneficiary designation changes`,

  familyAnalysis: `Analyze the family structure in this estate planning questionnaire and provide:
1. Summary of family members and relationships
2. Blended family considerations if applicable
3. Minor children planning needs
4. Special needs or disability considerations
5. Potential family dynamics that may affect the estate plan`,

  distributionPlan: `Review the dispositive intentions in this questionnaire and provide:
1. Summary of the intended distribution plan
2. Analysis of whether the plan achieves the stated goals
3. Potential gaps or inconsistencies in the plan
4. Tax implications of the distribution strategy
5. Recommendations for optimizing the distribution plan`,
};
