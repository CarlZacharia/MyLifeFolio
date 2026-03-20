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
If the client has specified cash bequests (in "cashGiftsToBeneficiaries"), these are paid from the PROBATE estate BEFORE the residuary is distributed.

The field "cashBequestTiming" determines WHEN these bequests are paid:
- "atSurvivorDeath": Cash bequests are paid after BOTH spouses have died (from the combined estate)
- "atFirstDeath": Cash bequests are paid when the FIRST spouse dies (from that spouse's probate estate only)

For married couples with "provideForSpouseThenChildren: true" (sweetheart plan), the timing is typically "atSurvivorDeath".

You MUST check:
1. Calculate the total cash bequests requested
2. Based on timing, compare against the appropriate probate assets:
   - If "atSurvivorDeath" or single: Compare against combined probate (categories.clientProbate + categories.spouseProbate)
   - If "atFirstDeath": Compare against EACH spouse's probate separately (either could die first)
3. If the total cash bequests EXCEED the available probate assets, this is a CRITICAL ISSUE that must be flagged:
   - Identify the shortfall amount
   - Explain that cash bequest beneficiaries may receive reduced amounts or nothing
   - Explain that the residuary beneficiaries would receive nothing if cash bequests consume all probate assets
   - Recommend either: reducing cash bequests, increasing probate assets, or converting some non-probate assets to probate
4. Even if probate assets are sufficient, note if the cash bequests consume a significant portion (>50%) of probate assets, as this may leave little for residuary beneficiaries
5. Note the timing setting in your analysis and explain when cash bequests will be paid

IMPORTANT - Blended Family Analysis:
A blended family exists when "clientHasChildrenFromPrior: true" OR "spouseHasChildrenFromPrior: true".
Children with relationship "Son of Client" or "Daughter of Client" are Client's children from a prior relationship.
Children with relationship "Son of Spouse" or "Daughter of Spouse" are Spouse's children from a prior relationship.
Children with relationship "Son of Both" or "Daughter of Both" are children of both spouses together.

When a blended family is detected, you MUST analyze:

1. SWEETHEART PLAN VULNERABILITY:
   If "provideForSpouseThenChildren: true" (sweetheart plan) AND this is a blended family:
   - Flag this as a HIGH CONCERN
   - Explain that all assets pass to surviving spouse outright
   - The surviving spouse has full control with NO legal obligation to provide for the deceased spouse's children from prior marriage
   - Surviving spouse can spend, give away, or leave assets to their own family
   - Recommend discussing alternative structures: QTIP Trust, Disclaimer Trust, Hybrid approach, or Life Insurance offset

2. RETIREMENT ACCOUNT VULNERABILITY:
   If blended family AND total retirement accounts > $500,000 OR > 50% of total estate:
   - Flag as HIGH VULNERABILITY
   - Retirement accounts pass by beneficiary designation, NOT by Will/Trust
   - After first spouse's death, surviving spouse can change beneficiaries to exclude deceased spouse's children
   - Recommend reviewing beneficiary designations to protect children from prior marriage

3. PRIOR-MARRIAGE CHILD BENEFICIARY EXCLUSION:
   For each child from a prior marriage, check if they are named in their parent's:
   - Retirement account beneficiary designations (primary or secondary)
   - Life insurance beneficiary designations (primary or secondary)
   If a prior-marriage child is NOT named as a beneficiary on parent's accounts, flag this:
   - It may be intentional (document the reasoning)
   - If unintentional, recommend updating designations with financial institutions

4. STEPCHILD INCLUSION FLAGS:
   Check for consistency between the flags and actual distribution:
   - "includeClientStepchildrenInSpouseWill": Should Spouse's Will include Client's children from prior?
   - "includeSpouseStepchildrenInClientWill": Should Client's Will include Spouse's children from prior?
   If flag is true but stepchildren are not in the distribution plan, or vice versa, flag the inconsistency.

IMPORTANT - Domicile Change Document Review:
If "lookingToChangeDomicile: true" AND "newDomicileState" differs from "stateOfDomicile":

1. Check if existing documents need review:
   - If "clientCurrentEstatePlan.hasTrust: true", note the trust was executed under original state law
   - If "clientCurrentEstatePlan.hasWill: true", Will may need to be re-executed to comply with new state
   - Check POA and healthcare documents for state-specific language

2. For moves TO FLORIDA specifically, highlight:
   - Florida homestead restrictions on devise (married clients cannot devise away from spouse)
   - Florida Personal Representative residency requirements (F.S. § 733.304)
   - Two-witness requirement for Wills
   - Healthcare surrogate vs. healthcare POA terminology differences

3. Recommend executing new state-compliant documents after establishing domicile.

IMPORTANT - Minor Beneficiaries Without Trust Provisions:
Check "otherBeneficiaries" array for anyone with age < 18 (relationship often "Grandchild").
Also check if any children in the "children" array are minors.

If minor beneficiaries are named in:
- "cashGiftsToBeneficiaries" (cash bequests)
- Real estate remainder interests (Lady Bird Deed or Life Estate)
- Beneficiary designations on accounts

Flag this as an issue requiring trust provisions:
- Minors cannot legally receive or manage inherited assets
- Without trust provisions, court-supervised guardianship of property is required
- Recommend including trust provisions in Will/Trust for gifts to minors
- Suggest appropriate distribution age (e.g., 25 or 30, not 18)

IMPORTANT - Missing Incapacity Planning Designations (CRITICAL):
Check whether agents have been NAMED for incapacity planning - this is what matters, NOT whether existing documents exist.
The relevant fields are at the root level of the form data (NOT in clientCurrentEstatePlan):

For Client:
- "healthCareAgentName" - The designated healthcare agent. If empty string, flag as CRITICAL.
- "financialAgentName" - The designated financial POA agent. If empty string, flag as CRITICAL.

For Spouse (if married):
- "spouseHealthCareAgentName" - Spouse's designated healthcare agent. If empty string, flag as CRITICAL.
- "spouseFinancialAgentName" - Spouse's designated financial POA agent. If empty string, flag as CRITICAL.

ONLY flag as missing if the agent name field is EMPTY. If an agent has been designated (name field is not empty),
the client has made their incapacity planning decisions and new documents will be prepared as part of this engagement.

Do NOT check the "hasFinancialPOA", "hasHealthCarePOA", or "hasLivingWill" fields in clientCurrentEstatePlan -
those indicate whether EXISTING documents exist, which is irrelevant. What matters is whether agents have been NAMED for the NEW documents.

If agent names ARE missing, this is a CRITICAL gap:
- Without POA documents, court guardianship proceeding required if incapacitated
- Guardianship is expensive ($5,000-$15,000+), time-consuming, and public record
- Recommend that the client complete the fiduciary designations section

IMPORTANT - Guardian Nomination for Minor Children:
Check if any children in "children" array have age < 18.
If minor children exist, check if "guardianFirst" is set.
If no guardian is nominated when minor children are present, flag this as an issue requiring attention.

IMPORTANT - Mirror Distribution Plan Consistency:
If "mirrorDistributionPlans: true", verify that:
- clientDistributionPlan.distributionType matches spouseDistributionPlan.distributionType
If they differ but mirror is set to true, flag this as a data inconsistency that should be clarified.

IMPORTANT - Income Analysis:
The data includes income information for both client and spouse in the arrays:
- "clientIncomeSources": Array of income sources for the client
- "spouseIncomeSources": Array of income sources for the spouse (if married)

Each income source contains:
- "description": Source of income (e.g., "Social Security", "Pension", "Part-time work")
- "amount": Amount received per period
- "frequency": How often received ("Monthly", "Quarterly", "Semi-Annually", "Annually", "Weekly", "Bi-Weekly")

When analyzing income:
1. Calculate monthly income for each source by converting based on frequency:
   - Weekly: amount * 52 / 12
   - Bi-Weekly: amount * 26 / 12
   - Monthly: amount
   - Quarterly: amount / 3
   - Semi-Annually: amount / 6
   - Annually: amount / 12

2. Include income analysis in your report:
   - List each income source with monthly equivalent
   - Calculate total monthly income for client
   - Calculate total monthly income for spouse (if applicable)
   - Calculate combined household monthly income (if married)
   - Calculate annual household income

3. Consider income in context of:
   - Long-term care affordability: Compare monthly income to potential LTC costs (~$8,000-$12,000/month for nursing home care)
   - Estate sustainability: Is income sufficient to maintain lifestyle without depleting assets?
   - Medicaid planning: If income is low and LTC concern is high, Medicaid planning may be relevant
   - Dependency on Social Security vs. other sources: Diversification of income sources

4. Flag potential concerns:
   - If total monthly income is less than $3,000 for a single person or $5,000 for a couple, note potential financial vulnerability
   - If income sources are primarily Social Security without pension or investment income, note reliance on government benefits
   - If there's a significant income disparity between spouses, consider survivor income planning

IMPORTANT - Medical Insurance Analysis:
The data includes medical insurance information for both client and spouse:
- "clientMedicalInsurance": Medical insurance details for the client
- "spouseMedicalInsurance": Medical insurance details for the spouse (if married)

Each medical insurance object contains:
- "medicarePartBDeduction": Monthly Medicare Part B deduction amount
- "medicareCoverageType": Type of coverage ("Medicare Advantage", "Medicare Supplement", "Neither", or "")
- "medicareCoverageCost": Monthly cost for Medicare Advantage or Supplement plan
- "privateInsuranceDescription": Description of private insurance (e.g., employer-provided, Blue Cross)
- "privateInsuranceCost": Monthly cost for private insurance
- "otherInsuranceDescription": Description of other insurance (e.g., VA benefits, Medicaid)
- "otherInsuranceCost": Monthly cost for other insurance

When analyzing medical insurance:

1. Calculate total monthly insurance costs for each person and combined household.

2. CRITICAL - Medicare Advantage Multi-State Warning:
   If either client or spouse has "medicareCoverageType": "Medicare Advantage" AND
   the "realEstate" array contains properties in more than one state:
   - FLAG THIS AS A HIGH-PRIORITY CONCERN
   - Explain that Medicare Advantage plans are network-based and typically provide limited coverage outside the plan's service area
   - If the client spends extended time at out-of-state properties (vacation homes, etc.), they may face restricted access to non-emergency care
   - Recommend reviewing the plan's out-of-area coverage terms
   - Suggest evaluating whether Medicare Supplement (Medigap) might be more appropriate for their lifestyle

3. Include medical insurance in household budget analysis:
   - Compare total monthly insurance costs against total monthly income
   - Include insurance costs in net disposable income calculations
   - Factor insurance costs into long-term care affordability assessment

4. Flag additional concerns:
   - If no Medicare coverage type is selected for someone 65+, note potential gap in coverage
   - If total insurance costs exceed 15% of monthly income, flag as potentially burdensome
   - If client has LTC concerns and only has Medicare (no supplemental or LTC insurance), note coverage limitations

Please be certain to include:
1. Family profile analysis
2. Income analysis with monthly and annual totals
3. Medical insurance analysis with monthly costs and coverage assessment
4. Asset inventory tables with ownership breakdown (use the pre-computed categories)
5. Totals by ownership category (use the pre-computed totals)
6. Probate avoidance issues
7. Document gap analysis
8. Vulnerable assets identification
9. Cash bequest funding analysis (if applicable)
10. Long-term care affordability assessment (compare income minus insurance costs to potential LTC costs)
11. Medicare Advantage multi-state property warning (if applicable)
12. Prioritized recommendations
13. Next steps

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
