import { supabase } from './supabase';
import { AssetCategorySummary } from './assetCategorization';

export interface ClaudeAnalysisRequest {
  formData: Record<string, unknown>;
  assetCategorySummary?: AssetCategorySummary;
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

IMPORTANT - Florida Personal Representative Residency Rules (F.S. § 733.304):
When evaluating Personal Representative nominations for Florida clients, apply these rules:
- The spouse is ALWAYS qualified regardless of residency
- Anyone in the "children" array is ALWAYS qualified regardless of residency (lineal descendants are exempt)
- Siblings, parents, grandchildren, and other blood relatives are ALWAYS qualified regardless of residency
- For "otherBeneficiaries": Only check Florida residency if the relationship field is "Friend" or "Other"
- DO NOT flag residency issues for children, spouse, or blood relatives - they are exempt under Florida law

IMPORTANT - Pre-Computed Asset Categorization:
The data includes a pre-computed "assetCategorySummary" object with assets already categorized by ownership:
- categories.clientProbate: Client's assets that go through probate
- categories.clientNonProbate: Client's assets that avoid probate (retirement accounts, life insurance, Lady Bird Deed, Life Estate, trusts, Personal Property Memorandum items)
- categories.spouseProbate: Spouse's assets that go through probate
- categories.spouseNonProbate: Spouse's assets that avoid probate
- categories.jointNonProbate: Joint assets (always avoid probate with right of survivorship)

IMPORTANT - Personal Property Memorandum (PPM):
Items in "otherAssets" with "addToPersonalPropertyMemo: true" are NON-PROBATE assets. Tangible personal property designated for a PPM passes directly to named legatees without going through probate. These items are already categorized in the appropriate non-probate category.

IMPORTANT - Florida Probate Administration Types:
When analyzing Florida estates, determine the type of probate administration required:
- Summary Administration: Available when the total PROBATE estate is $75,000 or less
- Formal Administration: Required when the total PROBATE estate exceeds $75,000
Note: Only probate assets count toward this threshold. Non-probate assets (retirement accounts, life insurance, joint accounts, Lady Bird Deed, Life Estate, PPM items, etc.) are NOT included in this calculation.

IMPORTANT - Florida Homestead Rules (Article X, Section 4, Florida Constitution):
Florida homestead property receives SPECIAL TREATMENT and is NOT included in the probate estate calculation:
1. Homestead Exemption from Probate: Florida homestead real property does NOT pass through probate. It passes via a separate "Petition to Determine Homestead Status."
2. If Client is MARRIED and owns Florida homestead in SOLE name:
   - The surviving spouse receives an AUTOMATIC LIFE ESTATE in the homestead property
   - Alternatively, the surviving spouse may elect to take a 50% undivided interest as TENANTS IN COMMON (must exercise this election within 6 months of the decedent's death)
   - The remainder interest passes to the decedent's lineal descendants
3. If Client is UNMARRIED or surviving spouse has waived homestead rights:
   - Homestead passes to lineal descendants per stirpes
   - If no lineal descendants, it passes per the will or intestate succession
4. Homestead CANNOT be devised away from a surviving spouse or minor children - constitutional protection
5. When calculating whether Summary or Formal Administration applies, EXCLUDE Florida homestead from the probate estate value

In your analysis, specifically identify:
- Whether any Florida real property qualifies as homestead
- The surviving spouse's homestead rights and election options
- The correct probate administration type based on NON-HOMESTEAD probate assets only

The "totals" object contains pre-calculated totals for each category and the total estate value.
USE THESE PRE-COMPUTED VALUES in your analysis rather than recalculating. This ensures consistency with what the user sees on screen.

IMPORTANT - Cash Bequests and Insufficient Residuary Assets:
If the client has specified cash bequests (in "cashGiftsToBeneficiaries"), these are paid from the PROBATE estate BEFORE the residuary is distributed. You MUST check:
1. Calculate the total cash bequests requested
2. Compare against the total PROBATE assets (categories.clientProbate + categories.spouseProbate)
3. If the total cash bequests EXCEED the available probate assets, this is a CRITICAL ISSUE that must be flagged:
   - Identify the shortfall amount
   - Explain that cash bequest beneficiaries may receive reduced amounts or nothing
   - Explain that the residuary beneficiaries would receive nothing if cash bequests consume all probate assets
   - Recommend either: reducing cash bequests, increasing probate assets, or converting some non-probate assets to probate
4. Even if probate assets are sufficient, note if the cash bequests consume a significant portion (>50%) of probate assets, as this may leave little for residuary beneficiaries

Please be certain to include:
1. Family profile analysis
2. Asset inventory tables with ownership breakdown (use the pre-computed categories)
3. Totals by ownership category (use the pre-computed totals)
4. Probate avoidance issues
5. Document gap analysis
6. Vulnerable assets identification
7. Cash bequest funding analysis (if applicable)
8. Prioritized recommendations
9. Next steps

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
