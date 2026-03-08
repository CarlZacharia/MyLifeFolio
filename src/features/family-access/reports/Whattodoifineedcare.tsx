import React from 'react';
import { Box, Typography, Grid, Chip } from '@mui/material';
import ReportLayout, { ReportSectionTitle } from './ReportLayout';

// ─── Design tokens (mirrors ReportLayout.tsx) ────────────────────────────────
const colors = {
  ink: '#2c2416',
  inkLight: '#6b5c47',
  accent: '#8b6914',
  accentWarm: '#c49a3c',
  cream: '#f9f5ef',
  creamDark: '#f0e9dc',
  parchment: '#e8ddd0',
  alertRed: '#c0392b',
  alertRedLight: '#fdf0ee',
  warningAmber: '#b7770d',
  warningAmberLight: '#fdf8ee',
  okGreen: '#2e7d32',
  okGreenLight: '#f1f8f1',
  infoBlue: '#1a3a5c',
  infoBlueLiight: '#eaf0f8',
};

// ─── Types matching your Supabase schema ─────────────────────────────────────

interface FolioIntake {
  client_name: string;
  client_birth_date?: string;
  client_cell_phone?: string;
  client_home_phone?: string;
  client_email?: string;
  client_mailing_address?: string;
  client_state_of_domicile?: string;
  marital_status?: string;
  spouse_name?: string;
  spouse_cell_phone?: string;
  spouse_email?: string;
  client_served_military?: boolean;
  client_military_branch?: string;
  client_military_end_date?: string;
}

/** folio_long_term_care */
interface LongTermCare {
  person_type?: string;
  primary_goals_concerns?: string;
  ltc_concern_level?: string;
  overall_health?: string;
  diagnoses?: string[];
  diagnoses_other?: string;
  recent_hospitalizations?: boolean;
  hospitalization_details?: string;
  mobility_limitations?: string[];
  adl_help?: string[];
  adl_assistance?: string;
  iadl_help?: string[];
  has_dementia?: boolean;
  dementia_stage?: string;
  family_history_of_conditions?: string;
  family_history_details?: string;
  current_living_situation?: string;
  living_other?: string;
  in_ltc_facility?: boolean;
  current_care_level?: string;
  facility_name?: string;
  facility_address?: string;
  facility_start_date?: string;
  receives_home_help?: boolean;
  home_help_providers?: string[];
  hours_of_help_per_week?: string;
  expect_care_increase?: boolean;
  care_increase_explanation?: string;
  likelihood_of_ltc_in_5_years?: string;
  care_preference?: string;
  care_preference_other?: string;
  has_specific_provider?: boolean;
  preferred_provider_details?: string;
  home_supports_needed?: string[];
  geographic_preferences?: string;
  primary_caregivers?: string[];
  caregivers_limited_ability?: boolean;
  caregivers_limited_details?: string;
  family_conflicts?: string;
  medicare_types?: string[];
  has_medigap?: boolean;
  medigap_details?: string;
  has_ltc_insurance?: boolean;
  ltc_insurance_details?: string;
  ltc_insurance_company?: string;
  ltc_insurance_daily_benefit?: string;
  ltc_insurance_term?: string;
  ltc_insurance_maximum?: string;
  ltc_insurance_care_level?: string;
  current_benefits?: string[];
  previous_medicaid_application?: boolean;
  medicaid_application_details?: string;
  monthly_income?: string;
  made_gifts_over_5_years?: boolean;
  gifts_details?: string;
  expecting_windfall?: boolean;
  windfall_details?: string;
  care_setting_importance?: Record<string, any>;
  end_of_life_preferences?: string;
  important_therapies_activities?: string;
}

/** folio_care_preferences */
interface CarePreference {
  id: string;
  category?: string;
  preference_item?: string;
  response?: string;
  notes?: string;
  sort_order?: number;
}

/** folio_current_estate_plan */
interface CurrentEstatePlan {
  person_type?: string;
  has_financial_poa?: boolean;
  has_health_care_poa?: boolean;
  has_living_will?: boolean;
  financial_poa_agent1?: string;
  financial_poa_agent2?: string;
  financial_poa_agent3?: string;
  health_care_poa_agent1?: string;
  financial_poa_date_signed?: string;
  financial_poa_state_signed?: string;
  health_care_poa_date_signed?: string;
  health_care_poa_state_signed?: string;
  living_will_date_signed?: string;
}

/** folio_medical_providers */
interface MedicalProvider {
  id: string;
  provider_category?: string;
  specialist_type?: string;
  name?: string;
  firm_name?: string;
  phone?: string;
  email?: string;
  address?: string;
  sort_order?: number;
}

/** folio_medications */
interface Medication {
  id: string;
  medication_name?: string;
  dosage?: string;
  form?: string;
  frequency?: string;
  prescribing_physician?: string;
  condition_treated?: string;
  is_active?: boolean;
  controlled_substance?: boolean;
  requires_refrigeration?: boolean;
  sort_order?: number;
}

/** folio_medical_conditions */
interface MedicalCondition {
  id: string;
  condition_name?: string;
  diagnosed_date?: string;
  treating_physician?: string;
  status?: string;
  notes?: string;
  sort_order?: number;
}

/** folio_allergies */
interface Allergy {
  id: string;
  allergen?: string;
  allergy_type?: string;
  reaction?: string;
  severity?: string;
  sort_order?: number;
}

/** folio_advisors */
interface Advisor {
  id: string;
  advisor_type?: string;
  name?: string;
  firm_name?: string;
  phone?: string;
  email?: string;
  sort_order?: number;
}

/** folio_client_income / folio_spouse_income */
interface IncomeSource {
  id: string;
  description?: string;
  amount?: string;
  frequency?: string;
  sort_order?: number;
}

/** folio_client_medical_insurance / folio_spouse_medical_insurance */
interface MedicalInsurance {
  medicare_part_b_deduction?: string;
  medicare_coverage_type?: string;
  medicare_plan_name?: string;
  medicare_coverage_cost?: string;
  private_insurance_description?: string;
  private_insurance_cost?: string;
  other_insurance_description?: string;
  other_insurance_cost?: string;
}

interface WhatToDoIfINeedCareProps {
  intake: FolioIntake;
  longTermCare?: LongTermCare[];
  carePreferences?: CarePreference[];
  currentEstatePlans?: CurrentEstatePlan[];
  medicalProviders?: MedicalProvider[];
  medications?: Medication[];
  medicalConditions?: MedicalCondition[];
  allergies?: Allergy[];
  advisors?: Advisor[];
  clientIncome?: IncomeSource[];
  spouseIncome?: IncomeSource[];
  clientMedicalInsurance?: MedicalInsurance | null;
  spouseMedicalInsurance?: MedicalInsurance | null;
  dateCreated?: string;
  dateUpdated?: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const formatDate = (d?: string | null): string => {
  if (!d) return '';
  try {
    return new Date(d).toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric',
    });
  } catch { return d; }
};

// ─── Sub-components ───────────────────────────────────────────────────────────

const EmptyState: React.FC<{ message: string }> = ({ message }) => (
  <Typography sx={{
    fontFamily: '"Jost", sans-serif', fontSize: '12px',
    color: colors.inkLight, fontStyle: 'italic', py: 0.5,
  }}>
    {message}
  </Typography>
);

const InfoRow: React.FC<{ label: string; value?: string | null }> = ({ label, value }) => {
  if (!value) return null;
  return (
    <Box sx={{ display: 'flex', gap: 1, mb: 0.45 }}>
      <Typography sx={{
        fontFamily: '"Jost", sans-serif', fontSize: '12px',
        fontWeight: 600, color: colors.inkLight,
        minWidth: 185, flexShrink: 0,
      }}>
        {label}:
      </Typography>
      <Typography sx={{
        fontFamily: '"Jost", sans-serif', fontSize: '12px', color: colors.ink,
        lineHeight: 1.5,
      }}>
        {value}
      </Typography>
    </Box>
  );
};

/** Printable checkbox item */
const CheckItem: React.FC<{
  text: string;
  detail?: string;
  urgent?: boolean;
  note?: string;
}> = ({ text, detail, urgent, note }) => (
  <Box sx={{
    display: 'flex', gap: 1.5, mb: 0.85,
    alignItems: 'flex-start',
    '@media print': { breakInside: 'avoid' },
  }}>
    <Box sx={{
      width: 16, height: 16, mt: '2px',
      border: `2px solid ${urgent ? colors.alertRed : colors.parchment}`,
      borderRadius: '3px', flexShrink: 0, bgcolor: '#fff',
    }} />
    <Box sx={{ flexGrow: 1 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
        <Typography sx={{
          fontFamily: '"Jost", sans-serif', fontSize: '12px',
          fontWeight: 600,
          color: urgent ? colors.alertRed : colors.ink,
        }}>
          {text}
        </Typography>
        {urgent && (
          <Chip label="Urgent" size="small" sx={{
            bgcolor: colors.alertRed, color: '#fff',
            fontFamily: '"Jost", sans-serif',
            fontSize: '9px', fontWeight: 700, height: 16,
          }} />
        )}
      </Box>
      {detail && (
        <Typography sx={{
          fontFamily: '"Jost", sans-serif', fontSize: '11px',
          color: colors.inkLight, mt: 0.25, lineHeight: 1.5,
        }}>
          {detail}
        </Typography>
      )}
      {note && (
        <Box sx={{
          mt: 0.5, px: 1.25, py: 0.5,
          bgcolor: colors.cream,
          border: `1px solid ${colors.parchment}`,
          borderRadius: 1,
        }}>
          <Typography sx={{
            fontFamily: '"Jost", sans-serif', fontSize: '11px',
            color: colors.inkLight, fontStyle: 'italic',
          }}>
            {note}
          </Typography>
        </Box>
      )}
    </Box>
  </Box>
);

/** Numbered step section */
const StepSection: React.FC<{
  stepNumber: number;
  title: string;
  timeframe?: string;
  children: React.ReactNode;
}> = ({ stepNumber, title, timeframe, children }) => (
  <Box sx={{ mb: 2.5, '@media print': { breakInside: 'avoid' } }}>
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.25 }}>
      <Box sx={{
        width: 32, height: 32, borderRadius: '50%',
        bgcolor: colors.ink,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        <Typography sx={{
          fontFamily: '"Jost", sans-serif', fontSize: '13px',
          fontWeight: 700, color: '#fff',
        }}>
          {stepNumber}
        </Typography>
      </Box>
      <Box>
        <Typography sx={{
          fontFamily: '"Jost", sans-serif', fontSize: '14px',
          fontWeight: 700, color: colors.ink,
        }}>
          {title}
        </Typography>
        {timeframe && (
          <Typography sx={{
            fontFamily: '"Jost", sans-serif', fontSize: '11px',
            color: colors.accentWarm, fontWeight: 600,
          }}>
            {timeframe}
          </Typography>
        )}
      </Box>
    </Box>
    <Box sx={{ pl: '47px' }}>{children}</Box>
  </Box>
);

/** Info panel with colored left border */
const InfoPanel: React.FC<{
  title: string;
  color?: string;
  bgcolor?: string;
  children: React.ReactNode;
}> = ({ title, color = colors.accentWarm, bgcolor = '#fff', children }) => (
  <Box sx={{
    border: `1px solid ${colors.parchment}`,
    borderLeft: `4px solid ${color}`,
    borderRadius: 1.5, overflow: 'hidden', mb: 1.5,
    '@media print': { breakInside: 'avoid' },
  }}>
    <Box sx={{
      bgcolor: colors.creamDark, px: 2, py: 0.75,
      borderBottom: `1px solid ${colors.parchment}`,
    }}>
      <Typography sx={{
        fontFamily: '"Jost", sans-serif', fontSize: '12px',
        fontWeight: 700, color: color === colors.accentWarm ? colors.accent : color,
        textTransform: 'uppercase', letterSpacing: '0.04em',
      }}>
        {title}
      </Typography>
    </Box>
    <Box sx={{ px: 2, py: 1.25, bgcolor }}>{children}</Box>
  </Box>
);

/** Tag list */
const TagList: React.FC<{ items?: string[]; color?: string }> = ({
  items = [], color = colors.parchment,
}) => {
  if (!items?.length) return null;
  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
      {items.map((item) => (
        <Chip key={item} label={item} size="small" sx={{
          bgcolor: color, color: colors.ink,
          fontFamily: '"Jost", sans-serif', fontSize: '11px', height: 20,
        }} />
      ))}
    </Box>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const WhatToDoIfINeedCare: React.FC<WhatToDoIfINeedCareProps> = ({
  intake,
  longTermCare = [],
  carePreferences = [],
  currentEstatePlans = [],
  medicalProviders = [],
  medications = [],
  medicalConditions = [],
  allergies = [],
  advisors = [],
  clientIncome = [],
  spouseIncome = [],
  clientMedicalInsurance,
  spouseMedicalInsurance,
  dateCreated,
  dateUpdated,
}) => {
  const hasSpouse = !!intake.spouse_name;

  const clientLTC = longTermCare.find(
    (l) => l.person_type === 'client' || l.person_type === 'Client' || !l.person_type
  );
  const spouseLTC = longTermCare.find(
    (l) => l.person_type === 'spouse' || l.person_type === 'Spouse'
  );

  const clientPlan = currentEstatePlans.find(
    (p) => p.person_type === 'client' || p.person_type === 'Client' || !p.person_type
  );

  // Group care preferences by category
  const prefsByCategory: Record<string, CarePreference[]> = {};
  carePreferences.forEach((p) => {
    const cat = p.category || 'General';
    if (!prefsByCategory[cat]) prefsByCategory[cat] = [];
    prefsByCategory[cat].push(p);
  });

  // Key care contacts
  const primaryCareDoc = medicalProviders.find(
    (p) => p.provider_category?.toLowerCase().includes('primary')
  );
  const attorney = advisors.find(
    (a) => a.advisor_type?.toLowerCase().includes('attorney') ||
           a.advisor_type?.toLowerCase().includes('legal')
  );
  const financialAdvisor = advisors.find(
    (a) => a.advisor_type?.toLowerCase().includes('financial')
  );

  // Active medications
  const activeMeds = medications
    .filter((m) => m.is_active !== false)
    .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));

  // Severe allergies
  const severeAllergies = allergies.filter(
    (a) => a.severity?.toLowerCase() === 'severe' ||
           a.severity?.toLowerCase() === 'life-threatening'
  );

  // Active conditions
  const activeConditions = medicalConditions
    .filter((c) => c.status?.toLowerCase() !== 'resolved')
    .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));

  // Missing critical legal docs
  const missingFinancialPOA = !clientPlan?.has_financial_poa;
  const missingHealthCarePOA = !clientPlan?.has_health_care_poa;
  const missingLivingWill    = !clientPlan?.has_living_will;
  const hasCriticalGaps = missingFinancialPOA || missingHealthCarePOA || missingLivingWill;

  return (
    <ReportLayout
      title="What To Do If I Need Care"
      ownerName={intake.client_name}
      dateCreated={dateCreated}
      dateUpdated={dateUpdated}
    >

      {/* ── Opening message ── */}
      <Box sx={{
        bgcolor: colors.ink, borderRadius: 1.5,
        px: 2.5, py: 2, mb: 2.5,
        '@media print': { breakInside: 'avoid' },
      }}>
        <Typography sx={{
          fontFamily: '"Jost", sans-serif', fontSize: '13px',
          fontWeight: 600, color: colors.accentWarm,
          mb: 0.5, letterSpacing: '0.02em',
        }}>
          A Note from {intake.client_name}
        </Typography>
        <Typography sx={{
          fontFamily: '"Jost", sans-serif', fontSize: '12px',
          color: colors.parchment, lineHeight: 1.75,
        }}>
          If I am no longer able to manage my own affairs — whether due to illness,
          injury, cognitive decline, or another condition — this guide will help my
          family and trusted advisors understand my wishes, locate my important
          documents, and take the right steps to ensure I receive the care I want.
          Please read this alongside my Medical Summary and Estate Planning Overview.
        </Typography>
      </Box>

      {/* ── Critical legal document gaps warning ── */}
      {hasCriticalGaps && (
        <Box sx={{
          bgcolor: colors.alertRedLight,
          border: `1.5px solid ${colors.alertRed}`,
          borderRadius: 1.5, px: 2, py: 1.5, mb: 2.5,
          '@media print': { breakInside: 'avoid' },
        }}>
          <Typography sx={{
            fontFamily: '"Jost", sans-serif', fontSize: '12px',
            fontWeight: 700, color: colors.alertRed, mb: 0.75,
          }}>
            ⚠ Critical Planning Gap — Immediate Action Required
          </Typography>
          <Typography sx={{
            fontFamily: '"Jost", sans-serif', fontSize: '12px',
            color: colors.ink, mb: 0.75,
          }}>
            The following documents are not currently on record. Without them,
            family members may have no legal authority to act on your behalf
            during a medical or financial crisis:
          </Typography>
          {missingFinancialPOA && (
            <Typography sx={{
              fontFamily: '"Jost", sans-serif', fontSize: '12px',
              color: colors.alertRed, fontWeight: 600, mb: 0.25,
            }}>
              ✗ Financial (Durable) Power of Attorney — no one can manage
              your finances without court-ordered guardianship
            </Typography>
          )}
          {missingHealthCarePOA && (
            <Typography sx={{
              fontFamily: '"Jost", sans-serif', fontSize: '12px',
              color: colors.alertRed, fontWeight: 600, mb: 0.25,
            }}>
              ✗ Health Care Power of Attorney — no one can make medical
              decisions on your behalf
            </Typography>
          )}
          {missingLivingWill && (
            <Typography sx={{
              fontFamily: '"Jost", sans-serif', fontSize: '12px',
              color: colors.alertRed, fontWeight: 600,
            }}>
              ✗ Living Will / Advance Directive — your end-of-life care
              preferences are not legally documented
            </Typography>
          )}
          {attorney && (
            <Box sx={{ mt: 1 }}>
              <Typography sx={{
                fontFamily: '"Jost", sans-serif', fontSize: '11px',
                color: colors.inkLight, fontStyle: 'italic',
              }}>
                Contact your estate planning attorney to prepare these documents:
                {' '}{attorney.name}{attorney.firm_name ? ` — ${attorney.firm_name}` : ''}
                {attorney.phone ? ` — ${attorney.phone}` : ''}
              </Typography>
            </Box>
          )}
        </Box>
      )}

      {/* ══════════════════════════════════════════
          SECTION 1 — WHO CAN ACT FOR ME
      ══════════════════════════════════════════ */}
      <ReportSectionTitle>Who Can Act for Me</ReportSectionTitle>

      <Grid container spacing={2} sx={{ mb: 2 }}>
        {/* Financial POA */}
        <Grid item xs={12} sm={6}>
          <InfoPanel
            title="Financial Power of Attorney"
            color={clientPlan?.has_financial_poa ? colors.okGreen : colors.alertRed}
          >
            {clientPlan?.has_financial_poa ? (
              <>
                <InfoRow label="Agent #1"      value={clientPlan.financial_poa_agent1} />
                <InfoRow label="Agent #2"      value={clientPlan.financial_poa_agent2} />
                <InfoRow label="Agent #3"      value={clientPlan.financial_poa_agent3} />
                <InfoRow label="Date Signed"   value={formatDate(clientPlan.financial_poa_date_signed)} />
                <InfoRow label="State"         value={clientPlan.financial_poa_state_signed} />
                <Box sx={{ mt: 1, px: 1.25, py: 0.5, bgcolor: colors.cream, borderRadius: 1 }}>
                  <Typography sx={{
                    fontFamily: '"Jost", sans-serif', fontSize: '11px',
                    color: colors.inkLight, fontStyle: 'italic',
                  }}>
                    This person can manage bank accounts, pay bills, file taxes,
                    manage investments, and handle real estate on my behalf.
                  </Typography>
                </Box>
              </>
            ) : (
              <Typography sx={{
                fontFamily: '"Jost", sans-serif', fontSize: '12px',
                color: colors.alertRed, fontWeight: 600,
              }}>
                ✗ Not on record — court-ordered guardianship may be required
              </Typography>
            )}
          </InfoPanel>
        </Grid>

        {/* Health Care POA */}
        <Grid item xs={12} sm={6}>
          <InfoPanel
            title="Health Care Power of Attorney"
            color={clientPlan?.has_health_care_poa ? colors.okGreen : colors.alertRed}
          >
            {clientPlan?.has_health_care_poa ? (
              <>
                <InfoRow label="Agent"         value={clientPlan.health_care_poa_agent1} />
                <InfoRow label="Date Signed"   value={formatDate(clientPlan.health_care_poa_date_signed)} />
                <InfoRow label="State"         value={clientPlan.health_care_poa_state_signed} />
                <Box sx={{ mt: 1, px: 1.25, py: 0.5, bgcolor: colors.cream, borderRadius: 1 }}>
                  <Typography sx={{
                    fontFamily: '"Jost", sans-serif', fontSize: '11px',
                    color: colors.inkLight, fontStyle: 'italic',
                  }}>
                    This person can consent to or refuse medical treatment,
                    choose care facilities, and access my medical records.
                  </Typography>
                </Box>
              </>
            ) : (
              <Typography sx={{
                fontFamily: '"Jost", sans-serif', fontSize: '12px',
                color: colors.alertRed, fontWeight: 600,
              }}>
                ✗ Not on record — medical team may not be able to take
                direction from family without legal authority
              </Typography>
            )}
          </InfoPanel>
        </Grid>

        {/* Living Will */}
        <Grid item xs={12}>
          <InfoPanel
            title="Living Will / Advance Directive"
            color={clientPlan?.has_living_will ? colors.okGreen : colors.alertRed}
          >
            {clientPlan?.has_living_will ? (
              <>
                <InfoRow label="Date Signed"   value={formatDate(clientPlan.living_will_date_signed)} />
                <Typography sx={{
                  fontFamily: '"Jost", sans-serif', fontSize: '12px',
                  color: colors.inkLight, mt: 0.5,
                }}>
                  My advance directive is on file and specifies my wishes for
                  end-of-life care, life-sustaining treatment, and resuscitation.
                  Provide a copy to any hospital, nursing facility, or hospice provider.
                </Typography>
                {clientLTC?.end_of_life_preferences && (
                  <Box sx={{
                    mt: 1, px: 1.5, py: 0.75,
                    bgcolor: colors.cream, border: `1px solid ${colors.parchment}`,
                    borderRadius: 1,
                  }}>
                    <Typography sx={{
                      fontFamily: '"Jost", sans-serif', fontSize: '12px',
                      color: colors.ink, lineHeight: 1.6,
                    }}>
                      {clientLTC.end_of_life_preferences}
                    </Typography>
                  </Box>
                )}
              </>
            ) : (
              <Typography sx={{
                fontFamily: '"Jost", sans-serif', fontSize: '12px',
                color: colors.alertRed, fontWeight: 600,
              }}>
                ✗ Not on record — end-of-life care preferences are not legally documented
              </Typography>
            )}
          </InfoPanel>
        </Grid>
      </Grid>

      {/* ══════════════════════════════════════════
          SECTION 2 — MY HEALTH SNAPSHOT
      ══════════════════════════════════════════ */}
      <ReportSectionTitle>My Health Snapshot</ReportSectionTitle>

      <Grid container spacing={2} sx={{ mb: 2 }}>
        {/* Conditions */}
        <Grid item xs={12} sm={6}>
          <InfoPanel title="Active Medical Conditions">
            {activeConditions.length === 0 ? (
              <EmptyState message="No active conditions on record." />
            ) : (
              activeConditions.map((c) => (
                <Box key={c.id} sx={{ mb: 0.75 }}>
                  <Typography sx={{
                    fontFamily: '"Jost", sans-serif', fontSize: '12px',
                    fontWeight: 600, color: colors.ink,
                  }}>
                    {c.condition_name}
                  </Typography>
                  {c.treating_physician && (
                    <Typography sx={{
                      fontFamily: '"Jost", sans-serif', fontSize: '11px', color: colors.inkLight,
                    }}>
                      Dr. {c.treating_physician}
                    </Typography>
                  )}
                </Box>
              ))
            )}
            {clientLTC?.has_dementia && (
              <Box sx={{
                mt: 1, px: 1.25, py: 0.75,
                bgcolor: colors.warningAmberLight,
                border: `1px solid ${colors.warningAmber}`,
                borderRadius: 1,
              }}>
                <Typography sx={{
                  fontFamily: '"Jost", sans-serif', fontSize: '12px',
                  fontWeight: 700, color: colors.warningAmber,
                }}>
                  ⚑ Dementia / Cognitive Impairment
                  {clientLTC.dementia_stage
                    ? ` — ${clientLTC.dementia_stage}`
                    : ''}
                </Typography>
              </Box>
            )}
          </InfoPanel>
        </Grid>

        {/* Severe allergies + LTC overview */}
        <Grid item xs={12} sm={6}>
          {severeAllergies.length > 0 && (
            <InfoPanel title="Severe Allergies" color={colors.alertRed}>
              {severeAllergies.map((a) => (
                <Box key={a.id} sx={{
                  display: 'flex', gap: 1, mb: 0.5, alignItems: 'center',
                }}>
                  <Chip label={a.severity || 'Severe'} size="small" sx={{
                    bgcolor: colors.alertRed, color: '#fff',
                    fontFamily: '"Jost", sans-serif', fontSize: '10px', height: 18,
                  }} />
                  <Typography sx={{
                    fontFamily: '"Jost", sans-serif', fontSize: '12px',
                    fontWeight: 600, color: colors.ink,
                  }}>
                    {a.allergen}
                    {a.reaction ? ` — ${a.reaction}` : ''}
                  </Typography>
                </Box>
              ))}
            </InfoPanel>
          )}

          {clientLTC && (
            <InfoPanel title="Current Situation">
              <InfoRow label="Overall Health"       value={clientLTC.overall_health} />
              <InfoRow label="Living Situation"     value={clientLTC.current_living_situation} />
              {clientLTC.in_ltc_facility && (
                <InfoRow label="Current Facility"   value={clientLTC.facility_name} />
              )}
              <InfoRow label="Currently Receives Help" value={clientLTC.receives_home_help ? 'Yes' : undefined} />
              {clientLTC.receives_home_help && (
                <>
                  <InfoRow
                    label="Home Help Providers"
                    value={clientLTC.home_help_providers?.join(', ')}
                  />
                  <InfoRow label="Hours/Week"        value={clientLTC.hours_of_help_per_week} />
                </>
              )}
              <InfoRow label="Likelihood of LTC (5 yr)" value={clientLTC.likelihood_of_ltc_in_5_years} />
            </InfoPanel>
          )}
        </Grid>
      </Grid>

      {/* Functional limitations */}
      {clientLTC && (clientLTC.adl_help?.length || clientLTC.mobility_limitations?.length || clientLTC.iadl_help?.length) ? (
        <InfoPanel title="Functional Needs">
          <Grid container spacing={2}>
            {clientLTC.mobility_limitations?.length ? (
              <Grid item xs={12} sm={4}>
                <Typography sx={{
                  fontFamily: '"Jost", sans-serif', fontSize: '11px',
                  fontWeight: 700, color: colors.inkLight,
                  textTransform: 'uppercase', letterSpacing: '0.04em', mb: 0.5,
                }}>
                  Mobility
                </Typography>
                <TagList items={clientLTC.mobility_limitations} color={colors.creamDark} />
              </Grid>
            ) : null}
            {clientLTC.adl_help?.length ? (
              <Grid item xs={12} sm={4}>
                <Typography sx={{
                  fontFamily: '"Jost", sans-serif', fontSize: '11px',
                  fontWeight: 700, color: colors.inkLight,
                  textTransform: 'uppercase', letterSpacing: '0.04em', mb: 0.5,
                }}>
                  Daily Activities (ADLs)
                </Typography>
                <TagList items={clientLTC.adl_help} color={colors.creamDark} />
                {clientLTC.adl_assistance && (
                  <Typography sx={{
                    fontFamily: '"Jost", sans-serif', fontSize: '11px',
                    color: colors.inkLight, mt: 0.5, fontStyle: 'italic',
                  }}>
                    {clientLTC.adl_assistance}
                  </Typography>
                )}
              </Grid>
            ) : null}
            {clientLTC.iadl_help?.length ? (
              <Grid item xs={12} sm={4}>
                <Typography sx={{
                  fontFamily: '"Jost", sans-serif', fontSize: '11px',
                  fontWeight: 700, color: colors.inkLight,
                  textTransform: 'uppercase', letterSpacing: '0.04em', mb: 0.5,
                }}>
                  Instrumental Activities (IADLs)
                </Typography>
                <TagList items={clientLTC.iadl_help} color={colors.creamDark} />
              </Grid>
            ) : null}
          </Grid>
        </InfoPanel>
      ) : null}

      {/* Active medications summary */}
      {activeMeds.length > 0 && (
        <>
          <InfoPanel title="Current Medications">
            <Typography sx={{
              fontFamily: '"Jost", sans-serif', fontSize: '11px',
              color: colors.inkLight, fontStyle: 'italic', mb: 1,
            }}>
              Provide this list to any new care provider, hospital, or facility.
              See Emergency Medical Summary for full medication detail.
            </Typography>
            <Grid container spacing={0}>
              {activeMeds.map((m, i) => (
                <Grid item xs={12} sm={6} key={m.id}>
                  <Box sx={{
                    display: 'flex', alignItems: 'flex-start', gap: 1,
                    px: 1, py: 0.5,
                    bgcolor: i % 2 === 0 ? '#fff' : colors.cream,
                    borderRadius: 0.5,
                  }}>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography sx={{
                        fontFamily: '"Jost", sans-serif', fontSize: '12px',
                        fontWeight: 600, color: colors.ink,
                      }}>
                        {m.medication_name}
                        {m.dosage ? ` ${m.dosage}` : ''}
                      </Typography>
                      {m.frequency && (
                        <Typography sx={{
                          fontFamily: '"Jost", sans-serif', fontSize: '11px',
                          color: colors.inkLight,
                        }}>
                          {m.frequency}
                          {m.condition_treated ? ` · ${m.condition_treated}` : ''}
                        </Typography>
                      )}
                    </Box>
                    <Box sx={{ display: 'flex', gap: 0.5, flexShrink: 0 }}>
                      {m.controlled_substance && (
                        <Chip label="Controlled" size="small" sx={{
                          bgcolor: colors.warningAmber, color: '#fff',
                          fontFamily: '"Jost", sans-serif', fontSize: '9px', height: 16,
                        }} />
                      )}
                      {m.requires_refrigeration && (
                        <Chip label="❄ Refrigerate" size="small" sx={{
                          bgcolor: colors.infoBlue, color: '#fff',
                          fontFamily: '"Jost", sans-serif', fontSize: '9px', height: 16,
                        }} />
                      )}
                    </Box>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </InfoPanel>
        </>
      )}

      {/* ══════════════════════════════════════════
          SECTION 3 — MY CARE WISHES
      ══════════════════════════════════════════ */}
      <ReportSectionTitle>My Care Wishes</ReportSectionTitle>

      {clientLTC ? (
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} sm={6}>
            <InfoPanel title="Care Preferences">
              <InfoRow label="Care Setting Preference" value={clientLTC.care_preference === 'Other'
                ? clientLTC.care_preference_other
                : clientLTC.care_preference}
              />
              <InfoRow label="Specific Provider"       value={clientLTC.has_specific_provider
                ? (clientLTC.preferred_provider_details || 'Yes — see notes')
                : undefined}
              />
              <InfoRow label="Geographic Preferences"  value={clientLTC.geographic_preferences} />
              <InfoRow label="Primary Goals / Concerns" value={clientLTC.primary_goals_concerns} />
              {clientLTC.home_supports_needed?.length ? (
                <Box sx={{ mt: 0.75 }}>
                  <Typography sx={{
                    fontFamily: '"Jost", sans-serif', fontSize: '11px',
                    fontWeight: 700, color: colors.inkLight,
                    textTransform: 'uppercase', letterSpacing: '0.04em', mb: 0.4,
                  }}>
                    Home Supports Needed
                  </Typography>
                  <TagList items={clientLTC.home_supports_needed} />
                </Box>
              ) : null}
            </InfoPanel>
          </Grid>

          <Grid item xs={12} sm={6}>
            <InfoPanel title="Family & Caregiver Situation">
              {clientLTC.primary_caregivers?.length ? (
                <InfoRow
                  label="Primary Caregivers"
                  value={clientLTC.primary_caregivers.join(', ')}
                />
              ) : null}
              {clientLTC.caregivers_limited_ability && (
                <Box sx={{
                  px: 1.25, py: 0.75, mb: 0.75,
                  bgcolor: colors.warningAmberLight,
                  border: `1px solid ${colors.warningAmber}`,
                  borderRadius: 1,
                }}>
                  <Typography sx={{
                    fontFamily: '"Jost", sans-serif', fontSize: '12px',
                    fontWeight: 600, color: colors.warningAmber,
                  }}>
                    ⚑ Caregiver capacity is limited
                  </Typography>
                  {clientLTC.caregivers_limited_details && (
                    <Typography sx={{
                      fontFamily: '"Jost", sans-serif', fontSize: '11px',
                      color: colors.ink, mt: 0.25,
                    }}>
                      {clientLTC.caregivers_limited_details}
                    </Typography>
                  )}
                </Box>
              )}
              {clientLTC.family_conflicts && (
                <Box sx={{
                  px: 1.25, py: 0.75, mb: 0.75,
                  bgcolor: colors.warningAmberLight,
                  border: `1px solid ${colors.warningAmber}`,
                  borderRadius: 1,
                }}>
                  <Typography sx={{
                    fontFamily: '"Jost", sans-serif', fontSize: '12px',
                    fontWeight: 600, color: colors.warningAmber,
                  }}>
                    ⚑ Family conflict noted
                  </Typography>
                  <Typography sx={{
                    fontFamily: '"Jost", sans-serif', fontSize: '11px',
                    color: colors.ink, mt: 0.25,
                  }}>
                    {clientLTC.family_conflicts}
                  </Typography>
                </Box>
              )}
              <InfoRow
                label="Important Activities/Therapies"
                value={clientLTC.important_therapies_activities}
              />
            </InfoPanel>
          </Grid>
        </Grid>
      ) : (
        <EmptyState message="No care preference data on record." />
      )}

      {/* Structured care preferences from folio_care_preferences */}
      {carePreferences.length > 0 && (
        <Box sx={{ mb: 2 }}>
          {Object.entries(prefsByCategory).map(([category, prefs]) => (
            <InfoPanel key={category} title={category}>
              {prefs
                .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
                .map((pref) => (
                  <InfoRow
                    key={pref.id}
                    label={pref.preference_item || ''}
                    value={[pref.response, pref.notes].filter(Boolean).join(' — ')}
                  />
                ))}
            </InfoPanel>
          ))}
        </Box>
      )}

      {/* ══════════════════════════════════════════
          SECTION 4 — PAYING FOR CARE
      ══════════════════════════════════════════ */}
      <ReportSectionTitle>Paying for Care</ReportSectionTitle>

      <Grid container spacing={2} sx={{ mb: 2 }}>
        {/* Coverage */}
        <Grid item xs={12} sm={6}>
          <InfoPanel title="Insurance & Benefits Coverage">
            {/* Medicare */}
            {clientMedicalInsurance?.medicare_coverage_type && (
              <Box sx={{ mb: 1 }}>
                <Typography sx={{
                  fontFamily: '"Jost", sans-serif', fontSize: '11px',
                  fontWeight: 700, color: colors.inkLight,
                  textTransform: 'uppercase', letterSpacing: '0.04em', mb: 0.4,
                }}>
                  Medicare
                </Typography>
                <InfoRow label="Coverage Type"   value={clientMedicalInsurance.medicare_coverage_type} />
                <InfoRow label="Plan Name"        value={clientMedicalInsurance.medicare_plan_name} />
                <InfoRow label="Monthly Cost"     value={clientMedicalInsurance.medicare_coverage_cost} />
              </Box>
            )}
            {/* Medigap */}
            {clientLTC?.has_medigap && (
              <InfoRow label="Medigap / Supplement" value={clientLTC.medigap_details || 'Yes'} />
            )}
            {/* Private insurance */}
            {clientMedicalInsurance?.private_insurance_description && (
              <InfoRow
                label="Private Insurance"
                value={[
                  clientMedicalInsurance.private_insurance_description,
                  clientMedicalInsurance.private_insurance_cost,
                ].filter(Boolean).join(' — ')}
              />
            )}
            {/* LTC Insurance */}
            {clientLTC?.has_ltc_insurance ? (
              <Box sx={{ mt: 1 }}>
                <Typography sx={{
                  fontFamily: '"Jost", sans-serif', fontSize: '11px',
                  fontWeight: 700, color: colors.inkLight,
                  textTransform: 'uppercase', letterSpacing: '0.04em', mb: 0.4,
                }}>
                  Long-Term Care Insurance
                </Typography>
                <InfoRow label="Company"          value={clientLTC.ltc_insurance_company} />
                <InfoRow label="Daily Benefit"    value={clientLTC.ltc_insurance_daily_benefit
                  ? `$${clientLTC.ltc_insurance_daily_benefit}/day` : undefined}
                />
                <InfoRow label="Benefit Term"     value={clientLTC.ltc_insurance_term} />
                <InfoRow label="Maximum Benefit"  value={clientLTC.ltc_insurance_maximum} />
                <InfoRow label="Care Level"       value={clientLTC.ltc_insurance_care_level} />
                {clientLTC.ltc_insurance_details && (
                  <InfoRow label="Details"        value={clientLTC.ltc_insurance_details} />
                )}
              </Box>
            ) : (
              <Box sx={{
                mt: 1, px: 1.25, py: 0.75,
                bgcolor: colors.warningAmberLight,
                border: `1px solid ${colors.warningAmber}`,
                borderRadius: 1,
              }}>
                <Typography sx={{
                  fontFamily: '"Jost", sans-serif', fontSize: '12px',
                  fontWeight: 600, color: colors.warningAmber,
                }}>
                  ⚑ No long-term care insurance on record
                </Typography>
                <Typography sx={{
                  fontFamily: '"Jost", sans-serif', fontSize: '11px',
                  color: colors.ink, mt: 0.25,
                }}>
                  Care costs may need to be funded from personal assets.
                  Consult the financial advisor and estate planning attorney
                  about Medicaid planning if needed.
                </Typography>
              </Box>
            )}
            {/* VA benefits */}
            {intake.client_served_military && (
              <Box sx={{
                mt: 1, px: 1.25, py: 0.75,
                bgcolor: '#eaf0f8',
                border: '1px solid #90aec9',
                borderRadius: 1,
              }}>
                <Typography sx={{
                  fontFamily: '"Jost", sans-serif', fontSize: '12px',
                  fontWeight: 600, color: colors.infoBlue,
                }}>
                  ★ Veteran — may qualify for VA Aid & Attendance or
                  Housebound benefits for long-term care costs.
                  Contact the VA at 1-800-827-1000.
                </Typography>
              </Box>
            )}
            {/* Current benefits */}
            {clientLTC?.current_benefits?.length ? (
              <Box sx={{ mt: 1 }}>
                <Typography sx={{
                  fontFamily: '"Jost", sans-serif', fontSize: '11px',
                  fontWeight: 700, color: colors.inkLight,
                  textTransform: 'uppercase', letterSpacing: '0.04em', mb: 0.4,
                }}>
                  Currently Receiving
                </Typography>
                <TagList items={clientLTC.current_benefits} />
              </Box>
            ) : null}
          </InfoPanel>
        </Grid>

        {/* Income & Medicaid */}
        <Grid item xs={12} sm={6}>
          <InfoPanel title="Income & Medicaid Considerations">
            {clientIncome.length > 0 && (
              <>
                <Typography sx={{
                  fontFamily: '"Jost", sans-serif', fontSize: '11px',
                  fontWeight: 700, color: colors.inkLight,
                  textTransform: 'uppercase', letterSpacing: '0.04em', mb: 0.4,
                }}>
                  {intake.client_name}'s Income
                </Typography>
                {clientIncome
                  .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
                  .map((inc) => (
                    <InfoRow
                      key={inc.id}
                      label={inc.description || 'Income'}
                      value={[inc.amount, inc.frequency].filter(Boolean).join(' / ')}
                    />
                  ))}
              </>
            )}
            {hasSpouse && spouseIncome.length > 0 && (
              <Box sx={{ mt: 1 }}>
                <Typography sx={{
                  fontFamily: '"Jost", sans-serif', fontSize: '11px',
                  fontWeight: 700, color: colors.inkLight,
                  textTransform: 'uppercase', letterSpacing: '0.04em', mb: 0.4,
                }}>
                  {intake.spouse_name}'s Income
                </Typography>
                {spouseIncome
                  .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
                  .map((inc) => (
                    <InfoRow
                      key={inc.id}
                      label={inc.description || 'Income'}
                      value={[inc.amount, inc.frequency].filter(Boolean).join(' / ')}
                    />
                  ))}
              </Box>
            )}
            {/* Medicaid history */}
            {clientLTC?.previous_medicaid_application && (
              <Box sx={{ mt: 1 }}>
                <InfoRow
                  label="Prior Medicaid Application"
                  value={clientLTC.medicaid_application_details || 'Yes'}
                />
              </Box>
            )}
            {/* Gift history */}
            {clientLTC?.made_gifts_over_5_years && (
              <Box sx={{
                mt: 1, px: 1.25, py: 0.75,
                bgcolor: colors.warningAmberLight,
                border: `1px solid ${colors.warningAmber}`,
                borderRadius: 1,
              }}>
                <Typography sx={{
                  fontFamily: '"Jost", sans-serif', fontSize: '12px',
                  fontWeight: 600, color: colors.warningAmber,
                }}>
                  ⚑ Gifts made in the past 5 years
                </Typography>
                <Typography sx={{
                  fontFamily: '"Jost", sans-serif', fontSize: '11px',
                  color: colors.ink, mt: 0.25,
                }}>
                  {clientLTC.gifts_details || 'May affect Medicaid lookback period — consult elder law attorney.'}
                </Typography>
              </Box>
            )}
            {clientLTC?.expecting_windfall && (
              <Box sx={{ mt: 1 }}>
                <InfoRow label="Expecting Windfall / Inheritance" value={clientLTC.windfall_details || 'Yes'} />
              </Box>
            )}
          </InfoPanel>
        </Grid>
      </Grid>

      {/* ══════════════════════════════════════════
          SECTION 5 — STEP-BY-STEP CHECKLIST
      ══════════════════════════════════════════ */}
      <ReportSectionTitle>Step-by-Step Guide for Family</ReportSectionTitle>

      <StepSection stepNumber={1} title="Immediate Steps" timeframe="When a care crisis occurs">
        <CheckItem
          urgent
          text="Locate the Financial Power of Attorney and Health Care POA"
          detail={[
            clientPlan?.financial_poa_agent1 && `Financial POA Agent: ${clientPlan.financial_poa_agent1}`,
            clientPlan?.health_care_poa_agent1 && `Health Care POA Agent: ${clientPlan.health_care_poa_agent1}`,
          ].filter(Boolean).join(' | ') || 'Documents are in the Documents Vault in this Folio.'}
        />
        <CheckItem
          urgent
          text="Notify the Health Care POA agent"
          detail="They are legally authorized to make medical decisions and should be present or reachable at all hospital and care facility meetings."
        />
        <CheckItem
          text="Provide the Advance Directive / Living Will to medical staff"
          detail={clientPlan?.has_living_will
            ? 'Living Will is on record. Provide a copy to the hospital or care facility on admission.'
            : 'No Living Will on record — discuss care preferences with the treating physician.'}
        />
        <CheckItem
          text="Share the Emergency Medical Summary with care providers"
          detail="Includes diagnoses, medications, allergies, and primary care physician contact."
        />
        {severeAllergies.length > 0 && (
          <CheckItem
            urgent
            text="Alert care staff to severe allergies"
            detail={severeAllergies.map((a) => `${a.allergen} — ${a.reaction || 'severe reaction'}`).join('; ')}
          />
        )}
        <CheckItem
          text="Contact the primary care physician"
          detail={primaryCareDoc
            ? `${primaryCareDoc.name}${primaryCareDoc.firm_name ? ' — ' + primaryCareDoc.firm_name : ''}${primaryCareDoc.phone ? ' — ' + primaryCareDoc.phone : ''}`
            : 'See Advisor Directory for medical provider contacts.'}
        />
      </StepSection>

      <StepSection stepNumber={2} title="First Week" timeframe="While care needs are being assessed">
        <CheckItem
          text="Contact the estate planning attorney"
          detail={attorney
            ? `${attorney.name}${attorney.firm_name ? ' — ' + attorney.firm_name : ''}${attorney.phone ? ' — ' + attorney.phone : ''}`
            : 'See Advisor Directory.'}
          note="Review POA authority, guardianship options (if documents are missing), and any Medicaid planning considerations."
        />
        <CheckItem
          text="Contact the financial advisor to assess resources available for care"
          detail={financialAdvisor
            ? `${financialAdvisor.name}${financialAdvisor.phone ? ' — ' + financialAdvisor.phone : ''}`
            : 'See Advisor Directory.'}
        />
        {clientLTC?.has_ltc_insurance && (
          <CheckItem
            urgent
            text="File a long-term care insurance claim"
            detail={clientLTC.ltc_insurance_company
              ? `Insurer: ${clientLTC.ltc_insurance_company}${clientLTC.ltc_insurance_daily_benefit ? ' — $' + clientLTC.ltc_insurance_daily_benefit + '/day benefit' : ''}`
              : 'LTC insurance policy details are in the Insurance Summary report.'}
            note="Most LTC policies require an elimination (waiting) period before benefits begin. File the claim as early as possible."
          />
        )}
        {intake.client_served_military && (
          <CheckItem
            text="Contact the VA about Aid & Attendance benefits"
            detail={`${intake.client_name} is a veteran${intake.client_military_branch ? ' (' + intake.client_military_branch + ')' : ''}. Call the VA at 1-800-827-1000 or contact a VA-accredited claims agent.`}
          />
        )}
        <CheckItem
          text="Assess care needs and develop a care plan with the medical team"
          detail="Request a formal care assessment from the hospital discharge planner, social worker, or primary physician."
        />
        <CheckItem
          text="Research care options based on stated preferences"
          detail={clientLTC?.care_preference
            ? `Stated preference: ${clientLTC.care_preference === 'Other' ? clientLTC.care_preference_other : clientLTC.care_preference}`
            : 'See My Care Wishes section above.'}
        />
      </StepSection>

      <StepSection stepNumber={3} title="Arranging Long-Term Care" timeframe="As needs become ongoing">
        <CheckItem
          text="Contact Medicare to understand covered services"
          detail="Medicare covers short-term skilled nursing care (up to 100 days) after a qualifying hospital stay of 3+ days. It does not cover custodial care long-term."
          note="Call 1-800-MEDICARE (1-800-633-4227) or visit medicare.gov."
        />
        <CheckItem
          text="Evaluate home care, assisted living, and nursing facility options"
          detail={[
            clientLTC?.geographic_preferences && `Geographic preference: ${clientLTC.geographic_preferences}`,
            clientLTC?.has_specific_provider && clientLTC.preferred_provider_details
              ? `Preferred provider: ${clientLTC.preferred_provider_details}`
              : null,
          ].filter(Boolean).join(' | ') || undefined}
        />
        {clientLTC?.home_supports_needed?.length ? (
          <CheckItem
            text="Arrange home support services if remaining at home"
            detail={`Support needed: ${clientLTC.home_supports_needed.join(', ')}`}
          />
        ) : null}
        <CheckItem
          text="Consult elder law attorney about Medicaid planning if assets may be insufficient"
          note={clientLTC?.made_gifts_over_5_years
            ? 'Note: gifts were made in the past 5 years. A lookback period may apply — early planning is critical.'
            : 'Medicaid has a 5-year lookback period. Planning well in advance significantly improves options.'}
        />
        <CheckItem
          text="Notify relevant government agencies"
          detail="Notify Social Security if benefits change. If receiving Medicaid, notify the state agency of any change in living situation."
        />
        <CheckItem
          text="Review and update beneficiary designations and estate plan as needed"
          note="A move to a care facility may affect homestead exemptions, Medicaid eligibility, and distribution planning. Consult the estate attorney."
        />
      </StepSection>

      <StepSection stepNumber={4} title="Ongoing Care Management" timeframe="Continuing responsibilities">
        <CheckItem
          text="Ensure bills and financial obligations continue to be paid"
          detail={clientPlan?.financial_poa_agent1
            ? `Financial POA Agent: ${clientPlan.financial_poa_agent1} has authority to manage finances.`
            : undefined}
        />
        <CheckItem
          text="Keep medication list current and share with all providers"
          detail="Any new prescriptions should be added to this Folio and shared with all treating physicians."
        />
        <CheckItem
          text="Schedule regular care conferences with the facility or care team"
        />
        <CheckItem
          text="Monitor and manage Medicaid compliance if applicable"
          note="If receiving Medicaid, report any changes in income, assets, or living situation to the state agency promptly."
        />
        <CheckItem
          text="Revisit the estate plan annually or after any major change in condition"
        />
      </StepSection>

      {/* ── Companion reports box ── */}
      <Box sx={{
        bgcolor: colors.cream,
        border: `1px solid ${colors.parchment}`,
        borderRadius: 1.5, px: 2.5, py: 1.5, mb: 2,
      }}>
        <Typography sx={{
          fontFamily: '"Jost", sans-serif', fontSize: '11px',
          fontWeight: 700, color: colors.accent,
          textTransform: 'uppercase', letterSpacing: '0.04em', mb: 0.75,
        }}>
          Related Reports in This Folio
        </Typography>
        {[
          'Emergency Medical Summary — full medication, allergy, condition, and provider detail',
          'Insurance Summary — complete insurance coverage with costs and contacts',
          'Advisor Directory — all professional and medical advisor contact information',
          'Estate Planning Overview — full POA, trust, and Will document detail',
          'Family Briefing Report — overall situation summary for family members',
          'What To Do If I Die — checklist for family following a death',
        ].map((r) => (
          <Box key={r} sx={{ display: 'flex', gap: 1, mb: 0.4 }}>
            <Typography sx={{
              fontFamily: '"Jost", sans-serif', fontSize: '12px',
              color: colors.accentWarm, flexShrink: 0,
            }}>
              →
            </Typography>
            <Typography sx={{
              fontFamily: '"Jost", sans-serif', fontSize: '12px', color: colors.inkLight,
            }}>
              {r}
            </Typography>
          </Box>
        ))}
      </Box>

      {/* ── Confidentiality footer ── */}
      <Box sx={{
        mt: 3, pt: 1.5,
        borderTop: `1px dashed ${colors.parchment}`,
        textAlign: 'center',
      }}>
        <Typography sx={{
          fontFamily: '"Jost", sans-serif', fontSize: '10px',
          color: colors.inkLight, fontStyle: 'italic',
        }}>
          This report contains confidential personal, medical, financial, and legal information.
          It is intended solely for the folio owner, authorized family members, and designated
          advisors. It does not constitute legal, medical, or financial advice. Consult qualified
          professionals before making care and planning decisions.
        </Typography>
      </Box>
    </ReportLayout>
  );
};

export default WhatToDoIfINeedCare;

/* ─────────────────────────────────────────────────────────────────────────────
 * USAGE EXAMPLE:
 *
 * import WhatToDoIfINeedCare from './reports/WhatToDoIfINeedCare';
 *
 * const { data: intake }              = await supabase.from('folio_intakes').select('*').eq('id', intakeId).single();
 * const { data: longTermCare }        = await supabase.from('folio_long_term_care').select('*').eq('intake_id', intakeId);
 * const { data: carePreferences }     = await supabase.from('folio_care_preferences').select('*').eq('intake_id', intakeId).order('sort_order');
 * const { data: currentEstatePlans }  = await supabase.from('folio_current_estate_plan').select('*').eq('intake_id', intakeId);
 * const { data: medicalProviders }    = await supabase.from('folio_medical_providers').select('*').eq('intake_id', intakeId).order('sort_order');
 * const { data: medications }         = await supabase.from('folio_medications').select('*').eq('intake_id', intakeId).order('sort_order');
 * const { data: medicalConditions }   = await supabase.from('folio_medical_conditions').select('*').eq('intake_id', intakeId).order('sort_order');
 * const { data: allergies }           = await supabase.from('folio_allergies').select('*').eq('intake_id', intakeId).order('sort_order');
 * const { data: advisors }            = await supabase.from('folio_advisors').select('*').eq('intake_id', intakeId).order('sort_order');
 * const { data: clientIncome }        = await supabase.from('folio_client_income').select('*').eq('intake_id', intakeId).order('sort_order');
 * const { data: spouseIncome }        = await supabase.from('folio_spouse_income').select('*').eq('intake_id', intakeId).order('sort_order');
 * const { data: clientMedIns }        = await supabase.from('folio_client_medical_insurance').select('*').eq('intake_id', intakeId).single();
 * const { data: spouseMedIns }        = await supabase.from('folio_spouse_medical_insurance').select('*').eq('intake_id', intakeId).single();
 *
 * <WhatToDoIfINeedCare
 *   intake={intake}
 *   longTermCare={longTermCare}
 *   carePreferences={carePreferences}
 *   currentEstatePlans={currentEstatePlans}
 *   medicalProviders={medicalProviders}
 *   medications={medications}
 *   medicalConditions={medicalConditions}
 *   allergies={allergies}
 *   advisors={advisors}
 *   clientIncome={clientIncome}
 *   spouseIncome={spouseIncome}
 *   clientMedicalInsurance={clientMedIns}
 *   spouseMedicalInsurance={spouseMedIns}
 *   dateCreated={intake.created_at}
 *   dateUpdated={intake.updated_at}
 * />
 * ───────────────────────────────────────────────────────────────────────────── */