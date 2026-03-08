import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";
const MODEL = "claude-sonnet-4-20250514";
const MAX_TOKENS = 1024;

// Section-to-field mappings — must match filterFolioByAccess.ts on the client
const SECTION_FIELD_MAP: Record<string, string[]> = {
  personal: [
    "name", "aka", "birthDate", "maritalStatus", "sex", "email",
    "cellPhone", "homePhone", "workPhone", "mailingAddress", "stateOfDomicile",
    "lookingToChangeDomicile", "newDomicileState",
    "spouseName", "spouseAka", "spouseBirthDate", "spouseSex",
    "spouseEmail", "spouseCellPhone", "spouseHomePhone", "spouseWorkPhone",
    "spouseMailingAddress",
    "clientServedMilitary", "clientMilitaryBranch", "clientMilitaryStartDate", "clientMilitaryEndDate",
    "spouseServedMilitary", "spouseMilitaryBranch", "spouseMilitaryStartDate", "spouseMilitaryEndDate",
    "hasSafeDepositBox", "safeDepositBoxBank", "safeDepositBoxNumber",
    "safeDepositBoxLocation", "safeDepositBoxAccess", "safeDepositBoxContents",
    "dateMarried", "placeOfMarriage", "numberOfChildren", "childrenTogether",
  ],
  medical: [
    "clientMedicalInsurance", "spouseMedicalInsurance",
    "medicalProviders", "medicalInsurancePolicies",
    "clientLongTermCare", "spouseLongTermCare",
    "carePreferences",
  ],
  financial: [
    "bankAccounts", "nonQualifiedInvestments", "retirementAccounts",
    "lifeInsurance", "realEstate", "vehicles", "otherAssets",
    "businessInterests", "digitalAssets",
    "clientIncomeSources", "spouseIncomeSources",
    "expenses", "royalties",
  ],
  legal: [
    "clientCurrentEstatePlan", "spouseCurrentEstatePlan",
    "executorFirst", "executorFirstOther", "executorAlternate", "executorAlternateOther",
    "executorSecondAlternate", "executorSecondAlternateOther",
    "spouseExecutorFirst", "spouseExecutorFirstOther",
    "spouseExecutorAlternate", "spouseExecutorAlternateOther",
    "spouseExecutorSecondAlternate", "spouseExecutorSecondAlternateOther",
    "trusteeFirst", "trusteeFirstOther", "trusteeAlternate", "trusteeAlternateOther",
    "trusteeSecondAlternate", "trusteeSecondAlternateOther",
    "spouseTrusteeFirst", "spouseTrusteeFirstOther",
    "spouseTrusteeAlternate", "spouseTrusteeAlternateOther",
    "spouseTrusteeSecondAlternate", "spouseTrusteeSecondAlternateOther",
    "irrevocableTrusteeFirst", "irrevocableTrusteeFirstOther",
    "irrevocableTrusteeAlternate", "irrevocableTrusteeAlternateOther",
    "irrevocableTrusteeSecondAlternate", "irrevocableTrusteeSecondAlternateOther",
    "spouseIrrevocableTrusteeFirst", "spouseIrrevocableTrusteeFirstOther",
    "spouseIrrevocableTrusteeAlternate", "spouseIrrevocableTrusteeAlternateOther",
    "spouseIrrevocableTrusteeSecondAlternate", "spouseIrrevocableTrusteeSecondAlternateOther",
    "guardianFirst", "guardianFirstOther", "guardianAlternate", "guardianAlternateOther",
    "spouseGuardianFirst", "spouseGuardianFirstOther",
    "spouseGuardianAlternate", "spouseGuardianAlternateOther",
    "healthCareAgentName", "healthCareAgentNameOther",
    "healthCareAlternateName", "healthCareAlternateNameOther",
    "healthCareSecondAlternateName", "healthCareSecondAlternateNameOther",
    "spouseHealthCareAgentName", "spouseHealthCareAgentNameOther",
    "spouseHealthCareAlternateName", "spouseHealthCareAlternateNameOther",
    "spouseHealthCareSecondAlternateName", "spouseHealthCareSecondAlternateNameOther",
    "financialAgentName", "financialAgentNameOther",
    "financialAlternateName", "financialAlternateNameOther",
    "financialSecondAlternateName", "financialSecondAlternateNameOther",
    "spouseFinancialAgentName", "spouseFinancialAgentNameOther",
    "spouseFinancialAlternateName", "spouseFinancialAlternateNameOther",
    "spouseFinancialSecondAlternateName", "spouseFinancialSecondAlternateNameOther",
    "withdrawArtificialFoodFluid", "spouseWithdrawArtificialFoodFluid",
    "clientDistributionPlan", "spouseDistributionPlan", "mirrorDistributionPlans",
    "clientHasLivingTrust", "clientLivingTrustName", "clientLivingTrustDate",
    "clientHasIrrevocableTrust", "clientIrrevocableTrustName", "clientIrrevocableTrustDate",
    "clientConsideringTrust", "spouseHasLivingTrust", "spouseHasIrrevocableTrust",
    "spouseLivingTrustName", "spouseLivingTrustDate",
    "spouseIrrevocableTrustName", "spouseIrrevocableTrustDate", "spouseConsideringTrust",
  ],
  advisors: [
    "advisors", "friendsNeighbors",
  ],
  end_of_life: [
    "endOfLife",
    "clientHasPrepaidFuneral", "clientPrepaidFuneralDetails",
    "clientPreferredFuneralHome", "clientBurialOrCremation", "clientPreferredChurch",
    "spouseHasPrepaidFuneral", "spousePrepaidFuneralDetails",
    "spousePreferredFuneralHome", "spouseBurialOrCremation", "spousePreferredChurch",
  ],
  insurance: [
    "medicalInsurancePolicies", "insurancePolicies",
  ],
  family: [
    "children", "otherBeneficiaries", "charities",
    "anyBeneficiariesMinors", "beneficiaryMinorsExplanation",
    "anyBeneficiariesDisabled", "beneficiaryDisabledExplanation",
    "anyBeneficiariesMaritalProblems", "beneficiaryMaritalProblemsExplanation",
    "anyBeneficiariesReceivingSSI", "beneficiarySSIExplanation",
    "anyBeneficiaryDrugAddiction", "beneficiaryDrugAddictionExplanation",
    "anyBeneficiaryAlcoholism", "beneficiaryAlcoholismExplanation",
    "anyBeneficiaryFinancialProblems", "beneficiaryFinancialProblemsExplanation",
    "hasOtherBeneficiaryConcerns", "beneficiaryOtherConcerns", "beneficiaryNotes",
    "provideForSpouseThenChildren", "treatAllChildrenEqually",
    "childrenEqualityExplanation", "distributionAge",
    "hasPetsForCare", "pets", "dependents",
    "numberOfChildren", "childrenTogether",
    "priorMarriage", "childrenFromPriorMarriage",
    "clientHasChildrenFromPrior", "clientChildrenFromPrior",
    "spouseHasChildrenFromPrior", "spouseChildrenFromPrior",
  ],
};

// Top-level fields that must always be removed unless full_sensitive is granted
const SENSITIVE_FIELDS = [
  "socialSecurityNumber",
  "spouseSocialSecurityNumber",
];

// Keys inside nested objects that should be masked (show last 4 only)
const SENSITIVE_NESTED_KEYS = [
  "policyNo",
  "safeDepositBoxNumber",
  "microchipNumber",
  "registrationNumber",
  "petInsurancePolicyNumber",
];

const SSN_REGEX = /\b\d{3}-?\d{2}-?\d{4}\b/g;

function maskLast4(value: string): string {
  if (!value || value.length <= 4) return "****";
  return "****" + value.slice(-4);
}

function maskSensitiveData(obj: unknown): unknown {
  if (Array.isArray(obj)) {
    return obj.map(maskSensitiveData);
  }
  if (obj && typeof obj === "object") {
    const result: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
      if (SENSITIVE_NESTED_KEYS.includes(k) && typeof v === "string") {
        result[k] = maskLast4(v);
      } else {
        result[k] = maskSensitiveData(v);
      }
    }
    // Second pass: mask SSN patterns in any string values
    for (const [k, v] of Object.entries(result)) {
      if (typeof v === "string") {
        result[k] = v.replace(SSN_REGEX, "***-**-****");
      }
    }
    return result;
  }
  // Mask SSN patterns in standalone string values
  if (typeof obj === "string") {
    return obj.replace(SSN_REGEX, "***-**-****");
  }
  return obj;
}

function filterFolio(
  folio: Record<string, unknown>,
  accessSections: string[],
  fullSensitive: boolean
): Record<string, unknown> {
  const allowedFields = new Set<string>();

  for (const section of accessSections) {
    const fields = SECTION_FIELD_MAP[section] ?? [];
    fields.forEach(f => allowedFields.add(f));
  }

  const filtered: Record<string, unknown> = {};
  for (const field of allowedFields) {
    if (field in folio) {
      filtered[field] = folio[field];
    }
  }

  if (!fullSensitive) {
    for (const sf of SENSITIVE_FIELDS) {
      delete filtered[sf];
    }
    return maskSensitiveData(filtered) as Record<string, unknown>;
  }

  return filtered;
}

function buildSystemPrompt(
  ownerName: string,
  filteredFolio: Record<string, unknown>,
  accessSections: string[]
): string {
  return `You are a helpful assistant for a family member who has been granted authorized access to a life documentation folio on MyLifeFolio.

The folio belongs to: ${ownerName}

You have been provided with the portions of this folio that this family member is authorized to view. The authorized sections are: ${accessSections.join(", ")}.

RULES YOU MUST FOLLOW:
1. Answer questions ONLY based on the data provided below.
2. If the information requested is not in the provided data, respond with: "That information is not available in the portions of the folio you are authorized to view."
3. Do not speculate, infer, or add any information not explicitly present in the data.
4. Do not reveal that you are filtering data or that other sections exist.
5. Be warm, clear, and helpful. Recognize this person is likely a family member trying to help a loved one.
6. Format responses clearly. Use bullet points or simple lists when presenting contact information or multiple items.
7. Never output raw JSON. Always present data in natural, readable language.

AUTHORIZED FOLIO DATA:
${JSON.stringify(filteredFolio, null, 2)}`;
}

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers":
          "authorization, x-client-info, apikey, content-type",
      },
    });
  }

  try {
    // --- 1. Authenticate the requesting user ---
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    // --- 2. Parse request body ---
    const { question, owner_id } = await req.json();
    if (!question || !owner_id) {
      return new Response(
        JSON.stringify({ error: "Missing question or owner_id" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    if (typeof question !== "string" || question.length > 2000) {
      return new Response(
        JSON.stringify({ error: "Invalid question" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // --- 3. Validate authorization record ---
    const adminClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: authRecord, error: authRecordError } = await adminClient
      .from("folio_authorized_users")
      .select("access_sections, display_name, is_active")
      .eq("owner_id", owner_id)
      .eq("authorized_email", user.email)
      .eq("is_active", true)
      .single();

    if (authRecordError || !authRecord) {
      return new Response(
        JSON.stringify({ error: "Access not authorized" }),
        { status: 403, headers: { "Content-Type": "application/json" } }
      );
    }

    const accessSections: string[] = authRecord.access_sections ?? [];
    const fullSensitive = accessSections.includes("full_sensitive");

    // --- 4. Fetch owner's folio data from intakes_raw ---
    const { data: folioRecord, error: folioError } = await adminClient
      .from("intakes_raw")
      .select("form_data")
      .eq("user_id", owner_id)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (folioError || !folioRecord) {
      return new Response(
        JSON.stringify({ error: "Folio not found" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    const folioData = folioRecord.form_data as Record<string, unknown>;
    const ownerName = (folioData.name as string) ?? "the account holder";

    // --- 5. Filter folio to authorized sections only ---
    const filteredFolio = filterFolio(folioData, accessSections, fullSensitive);

    // --- 6. Build system prompt ---
    const systemPrompt = buildSystemPrompt(ownerName, filteredFolio, accessSections);

    // --- 7. Call Claude API ---
    const anthropicKey = Deno.env.get("ANTHROPIC_API_KEY");
    if (!anthropicKey) {
      throw new Error("Anthropic API key not configured");
    }

    const claudeResponse = await fetch(ANTHROPIC_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": anthropicKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: MAX_TOKENS,
        system: systemPrompt,
        messages: [{ role: "user", content: question }],
      }),
    });

    if (!claudeResponse.ok) {
      const errText = await claudeResponse.text();
      console.error("Claude API error:", errText);
      throw new Error("Claude API call failed");
    }

    const claudeData = await claudeResponse.json();
    const answer =
      claudeData.content?.[0]?.text ??
      "I was unable to generate a response. Please try again.";

    // --- 8. Log the query ---
    await adminClient.from("folio_access_log").insert({
      owner_id,
      accessor_email: user.email,
      accessor_name: authRecord.display_name,
      access_type: "chat",
      query_text: question,
      sections_queried: accessSections,
    });

    // --- 9. Return answer to browser ---
    return new Response(JSON.stringify({ answer }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (err) {
    console.error("family-chat-proxy error:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
