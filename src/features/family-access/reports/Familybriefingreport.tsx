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
};

// ─── Types matching your Supabase schema ─────────────────────────────────────

interface FolioIntake {
  // Client
  client_name: string;
  client_aka?: string;
  client_birth_date?: string;
  client_sex?: string;
  client_cell_phone?: string;
  client_home_phone?: string;
  client_email?: string;
  client_mailing_address?: string;
  client_state_of_domicile?: string;
  client_served_military?: boolean;
  client_military_branch?: string;
  client_has_prepaid_funeral?: boolean;
  client_preferred_funeral_home?: string;
  client_burial_or_cremation?: string;
  client_has_living_trust?: boolean;
  client_living_trust_name?: string;
  client_has_irrevocable_trust?: boolean;
  // Spouse
  marital_status?: string;
  spouse_name?: string;
  spouse_aka?: string;
  spouse_birth_date?: string;
  spouse_cell_phone?: string;
  spouse_email?: string;
  spouse_mailing_address?: string;
  spouse_served_military?: boolean;
  spouse_military_branch?: string;
  spouse_has_prepaid_funeral?: boolean;
  spouse_preferred_funeral_home?: string;
  spouse_burial_or_cremation?: string;
  date_married?: string;
  place_of_marriage?: string;
  prior_marriage?: boolean;
  // Children / family
  number_of_children?: number;
  client_has_children_from_prior?: boolean;
  spouse_has_children_from_prior?: boolean;
  // Beneficiary flags
  any_beneficiaries_minors?: boolean;
  any_beneficiaries_disabled?: boolean;
  any_beneficiaries_receiving_ssi?: boolean;
  any_beneficiary_drug_addiction?: boolean;
  any_beneficiary_financial_problems?: boolean;
  beneficiary_notes?: string;
  // Distribution
  provide_for_spouse_then_children?: boolean;
  treat_all_children_equally?: boolean;
  distribution_age?: string;
}

interface CurrentEstatePlan {
  person_type?: string;
  has_will?: boolean;
  has_trust?: boolean;
  has_irrevocable_trust?: boolean;
  has_financial_poa?: boolean;
  has_health_care_poa?: boolean;
  has_living_will?: boolean;
  has_none?: boolean;
  will_personal_rep?: string;
  will_personal_rep_alternate1?: string;
  trust_name?: string;
  trust_trustee?: string;
  trust_trustee_alternate1?: string;
  financial_poa_agent1?: string;
  financial_poa_agent2?: string;
  health_care_poa_agent1?: string;
}

interface Child {
  id: string;
  name: string;
  age?: string;
  birth_date?: string;
  relationship?: string;
  marital_status?: string;
  address?: string;
  has_children?: boolean;
  number_of_children?: number;
  has_minor_children?: boolean;
  disinherit?: boolean;
  sort_order?: number;
}

interface Beneficiary {
  id: string;
  name: string;
  relationship?: string;
  relationship_other?: string;
  age?: string;
  distribution_type?: string;
  sort_order?: number;
}

interface Advisor {
  id: string;
  advisor_type?: string;
  name?: string;
  firm_name?: string;
  phone?: string;
  email?: string;
  sort_order?: number;
}

interface LifeInsurance {
  id: string;
  company?: string;
  policy_type?: string;
  death_benefit?: number;
  face_amount?: number;
  insured?: string;
  primary_beneficiaries?: string[];
  sort_order?: number;
}

interface RetirementAccount {
  id: string;
  institution?: string;
  account_type?: string;
  owner?: string;
  value?: number;
  primary_beneficiaries?: string[];
  sort_order?: number;
}

interface RealEstate {
  id: string;
  street?: string;
  city?: string;
  state?: string;
  zip?: string;
  category?: string;
  ownership_form?: string;
  value?: number;
  mortgage_balance?: number;
  sort_order?: number;
}

interface BankAccount {
  id: string;
  institution?: string;
  account_type?: string;
  owner?: string;
  amount?: number;
  sort_order?: number;
}

interface Investment {
  id: string;
  institution?: string;
  description?: string;
  owner?: string;
  value?: number;
  sort_order?: number;
}

interface ClientIncome {
  id: string;
  description?: string;
  amount?: string;
  frequency?: string;
  sort_order?: number;
}

interface SpouseIncome {
  id: string;
  description?: string;
  amount?: string;
  frequency?: string;
  sort_order?: number;
}

interface MedicalInsurance {
  person?: string;
  medicare_coverage_type?: string;
  medicare_plan_name?: string;
  private_insurance_description?: string;
}

interface LongTermCare {
  person_type?: string;
  has_ltc_insurance?: boolean;
  ltc_insurance_company?: string;
  ltc_insurance_daily_benefit?: string;
  overall_health?: string;
  current_living_situation?: string;
  in_ltc_facility?: boolean;
  facility_name?: string;
}

interface FamilyBriefingReportProps {
  intake: FolioIntake;
  currentEstatePlans?: CurrentEstatePlan[];
  children?: Child[];
  beneficiaries?: Beneficiary[];
  advisors?: Advisor[];
  lifeInsurance?: LifeInsurance[];
  retirementAccounts?: RetirementAccount[];
  realEstate?: RealEstate[];
  bankAccounts?: BankAccount[];
  investments?: Investment[];
  clientIncome?: ClientIncome[];
  spouseIncome?: SpouseIncome[];
  clientMedicalInsurance?: MedicalInsurance | null;
  spouseMedicalInsurance?: MedicalInsurance | null;
  longTermCare?: LongTermCare[];
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

const fmt = (n?: number | null): string => {
  if (n == null) return '';
  return new Intl.NumberFormat('en-US', {
    style: 'currency', currency: 'USD',
    minimumFractionDigits: 0, maximumFractionDigits: 0,
  }).format(n);
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
    <Box sx={{ display: 'flex', gap: 1, mb: 0.4 }}>
      <Typography sx={{
        fontFamily: '"Jost", sans-serif', fontSize: '12px',
        fontWeight: 600, color: colors.inkLight,
        minWidth: 170, flexShrink: 0,
      }}>
        {label}:
      </Typography>
      <Typography sx={{
        fontFamily: '"Jost", sans-serif', fontSize: '12px', color: colors.ink,
      }}>
        {value}
      </Typography>
    </Box>
  );
};

/** Two-column profile card for client / spouse */
const PersonCard: React.FC<{
  name: string;
  aka?: string;
  birthDate?: string;
  phone?: string;
  email?: string;
  address?: string;
  badge?: string;
  chips?: string[];
  children?: React.ReactNode;
}> = ({ name, aka, birthDate, phone, email, address, badge, chips = [], children }) => (
  <Box sx={{
    border: `1px solid ${colors.parchment}`,
    borderRadius: 1.5, overflow: 'hidden', mb: 2,
    '@media print': { breakInside: 'avoid' },
  }}>
    <Box sx={{
      bgcolor: colors.ink, px: 2, py: 1,
      display: 'flex', alignItems: 'center',
      justifyContent: 'space-between',
    }}>
      <Box>
        <Typography sx={{
          fontFamily: '"Jost", sans-serif', fontSize: '15px',
          fontWeight: 700, color: '#fff',
        }}>
          {name}
        </Typography>
        {aka && (
          <Typography sx={{
            fontFamily: '"Jost", sans-serif', fontSize: '11px', color: colors.parchment,
          }}>
            Also known as: {aka}
          </Typography>
        )}
      </Box>
      <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
        {badge && (
          <Chip label={badge} size="small" sx={{
            bgcolor: colors.accentWarm, color: '#fff',
            fontFamily: '"Jost", sans-serif', fontSize: '10px', fontWeight: 700, height: 20,
          }} />
        )}
        {chips.map((c) => (
          <Chip key={c} label={c} size="small" sx={{
            bgcolor: colors.inkLight, color: '#fff',
            fontFamily: '"Jost", sans-serif', fontSize: '10px', fontWeight: 600, height: 20,
          }} />
        ))}
      </Box>
    </Box>
    <Box sx={{ px: 2, py: 1.5, bgcolor: '#fff' }}>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <InfoRow label="Date of Birth" value={formatDate(birthDate)} />
          <InfoRow label="Phone"         value={phone} />
          <InfoRow label="Email"         value={email} />
          <InfoRow label="Address"       value={address} />
        </Grid>
        <Grid item xs={12} sm={6}>
          {children}
        </Grid>
      </Grid>
    </Box>
  </Box>
);

/** Compact summary row for financial overview */
const SummaryRow: React.FC<{
  label: string;
  value?: string;
  sublabel?: string;
  highlight?: boolean;
}> = ({ label, value, sublabel, highlight }) => (
  <Box sx={{
    display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
    py: 0.6, px: 1,
    bgcolor: highlight ? colors.creamDark : 'transparent',
    borderRadius: 0.5,
    borderBottom: highlight ? `1px solid ${colors.parchment}` : 'none',
  }}>
    <Box>
      <Typography sx={{
        fontFamily: '"Jost", sans-serif', fontSize: '12px',
        fontWeight: highlight ? 700 : 400, color: colors.ink,
      }}>
        {label}
      </Typography>
      {sublabel && (
        <Typography sx={{
          fontFamily: '"Jost", sans-serif', fontSize: '11px', color: colors.inkLight,
        }}>
          {sublabel}
        </Typography>
      )}
    </Box>
    {value && (
      <Typography sx={{
        fontFamily: '"Jost", sans-serif', fontSize: '12px',
        fontWeight: highlight ? 700 : 400,
        color: highlight ? colors.accent : colors.ink,
      }}>
        {value}
      </Typography>
    )}
  </Box>
);

/** Document status badge row */
const DocStatusRow: React.FC<{
  label: string;
  present?: boolean;
  detail?: string;
}> = ({ label, present, detail }) => (
  <Box sx={{
    display: 'flex', alignItems: 'flex-start', gap: 1, mb: 0.5,
  }}>
    <Box sx={{
      mt: '2px', width: 16, height: 16, borderRadius: '50%', flexShrink: 0,
      bgcolor: present ? colors.okGreen : colors.alertRed,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <Typography sx={{ fontSize: '10px', color: '#fff', fontWeight: 700, lineHeight: 1 }}>
        {present ? '✓' : '✗'}
      </Typography>
    </Box>
    <Box>
      <Typography sx={{
        fontFamily: '"Jost", sans-serif', fontSize: '12px',
        fontWeight: 600, color: present ? colors.ink : colors.alertRed,
      }}>
        {label}
      </Typography>
      {detail && (
        <Typography sx={{
          fontFamily: '"Jost", sans-serif', fontSize: '11px', color: colors.inkLight,
        }}>
          {detail}
        </Typography>
      )}
    </Box>
  </Box>
);

/** Flag pill for concern items */
const FlagPill: React.FC<{ label: string }> = ({ label }) => (
  <Box sx={{
    display: 'inline-flex', alignItems: 'center', gap: 0.5,
    bgcolor: colors.warningAmberLight,
    border: `1px solid ${colors.warningAmber}`,
    borderRadius: 1, px: 1.25, py: 0.4, mr: 0.75, mb: 0.75,
  }}>
    <Typography sx={{
      fontFamily: '"Jost", sans-serif', fontSize: '11px',
      fontWeight: 700, color: colors.warningAmber,
    }}>
      ⚑ {label}
    </Typography>
  </Box>
);

/** Divider with label */
const SubLabel: React.FC<{ label: string }> = ({ label }) => (
  <Typography sx={{
    fontFamily: '"Jost", sans-serif', fontSize: '11px',
    fontWeight: 700, color: colors.inkLight,
    textTransform: 'uppercase', letterSpacing: '0.05em',
    borderLeft: `3px solid ${colors.accentWarm}`,
    pl: 1, mb: 0.75, mt: 1.5,
  }}>
    {label}
  </Typography>
);

// ─── Main Component ───────────────────────────────────────────────────────────

const FamilyBriefingReport: React.FC<FamilyBriefingReportProps> = ({
  intake,
  currentEstatePlans = [],
  children = [],
  beneficiaries = [],
  advisors = [],
  lifeInsurance = [],
  retirementAccounts = [],
  realEstate = [],
  bankAccounts = [],
  investments = [],
  clientIncome = [],
  spouseIncome = [],
  clientMedicalInsurance,
  spouseMedicalInsurance,
  longTermCare = [],
  dateCreated,
  dateUpdated,
}) => {
  const hasSpouse = !!intake.spouse_name;

  const clientPlan = currentEstatePlans.find(
    (p) => p.person_type === 'client' || p.person_type === 'Client' || !p.person_type
  );
  const spousePlan = currentEstatePlans.find(
    (p) => p.person_type === 'spouse' || p.person_type === 'Spouse'
  );

  const clientLTC = longTermCare.find(
    (l) => l.person_type === 'client' || l.person_type === 'Client' || !l.person_type
  );
  const spouseLTC = longTermCare.find(
    (l) => l.person_type === 'spouse' || l.person_type === 'Spouse'
  );

  // Financial totals
  const totalBankValue   = bankAccounts.reduce((s, a) => s + (a.amount ?? 0), 0);
  const totalInvestValue = investments.reduce((s, a) => s + (a.value ?? 0), 0);
  const totalRetireValue = retirementAccounts.reduce((s, a) => s + (a.value ?? 0), 0);
  const totalREGross     = realEstate.reduce((s, r) => s + (r.value ?? 0), 0);
  const totalREMortgage  = realEstate.reduce((s, r) => s + (r.mortgage_balance ?? 0), 0);
  const totalLifeDeath   = lifeInsurance.reduce((s, p) => s + (p.death_benefit ?? p.face_amount ?? 0), 0);
  const financialTotal   = totalBankValue + totalInvestValue + totalRetireValue + (totalREGross - totalREMortgage);

  // Concern flags
  const concernFlags = [
    intake.any_beneficiaries_minors        && 'Minor Beneficiaries',
    intake.any_beneficiaries_disabled      && 'Disabled Beneficiaries',
    intake.any_beneficiaries_receiving_ssi && 'SSI Recipient',
    intake.any_beneficiary_drug_addiction  && 'Substance Abuse Concerns',
    intake.any_beneficiary_financial_problems && 'Financial Problems',
  ].filter(Boolean) as string[];

  // Key advisors
  const keyAdvisors = advisors
    .filter((a) => ['attorney', 'estate', 'elder', 'financial', 'accountant', 'cpa', 'tax']
      .some((kw) => a.advisor_type?.toLowerCase().includes(kw)))
    .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));

  return (
    <ReportLayout
      title="Family Briefing Report"
      ownerName={intake.client_name}
      dateCreated={dateCreated}
      dateUpdated={dateUpdated}
    >

      {/* ── Purpose banner ── */}
      <Box sx={{
        bgcolor: colors.creamDark,
        border: `1px solid ${colors.parchment}`,
        borderLeft: `5px solid ${colors.accentWarm}`,
        borderRadius: 1.5, px: 2.5, py: 1.5, mb: 2.5,
      }}>
        <Typography sx={{
          fontFamily: '"Jost", sans-serif', fontSize: '12px',
          color: colors.inkLight, lineHeight: 1.7,
        }}>
          This report provides a comprehensive summary of{' '}
          <strong style={{ color: colors.ink }}>{intake.client_name}</strong>
          {hasSpouse && intake.spouse_name ? `'s and ${intake.spouse_name}'s` : `'s`}{' '}
          personal, financial, legal, and care situation for the benefit of
          authorized family members, trustees, and advisors. It is intended
          to be read alongside the full Folio and does not substitute for
          consultation with the estate planning attorney.
        </Typography>
      </Box>

      {/* ══════════════════════════════════════════
          SECTION 1 — WHO WE ARE
      ══════════════════════════════════════════ */}
      <ReportSectionTitle>Who We Are</ReportSectionTitle>

      {/* Client card */}
      <PersonCard
        name={intake.client_name}
        aka={intake.client_aka}
        birthDate={intake.client_birth_date}
        phone={intake.client_cell_phone || intake.client_home_phone}
        email={intake.client_email}
        address={intake.client_mailing_address}
        badge="Folio Owner"
        chips={[
          ...(intake.client_served_military ? [`Veteran — ${intake.client_military_branch || 'Military'}`] : []),
          ...(intake.client_has_prepaid_funeral ? ['Prepaid Funeral'] : []),
        ]}
      >
        <InfoRow label="State of Domicile"  value={intake.client_state_of_domicile} />
        <InfoRow label="Marital Status"     value={intake.marital_status} />
        {intake.marital_status && intake.marital_status !== 'Single' && (
          <>
            <InfoRow label="Date Married"   value={formatDate(intake.date_married)} />
            <InfoRow label="Place Married"  value={intake.place_of_marriage} />
          </>
        )}
        <InfoRow label="Prior Marriage"     value={intake.prior_marriage ? 'Yes' : undefined} />
        <InfoRow label="Number of Children" value={intake.number_of_children?.toString()} />
        <InfoRow label="Burial Preference"  value={intake.client_burial_or_cremation} />
        <InfoRow label="Funeral Home"       value={intake.client_preferred_funeral_home} />
        {clientLTC?.overall_health && (
          <InfoRow label="Overall Health"   value={clientLTC.overall_health} />
        )}
        {clientLTC?.current_living_situation && (
          <InfoRow label="Living Situation" value={clientLTC.current_living_situation} />
        )}
        {clientLTC?.in_ltc_facility && (
          <InfoRow label="LTC Facility"     value={clientLTC.facility_name || 'Yes'} />
        )}
      </PersonCard>

      {/* Spouse card */}
      {hasSpouse && intake.spouse_name && (
        <PersonCard
          name={intake.spouse_name}
          aka={intake.spouse_aka}
          birthDate={intake.spouse_birth_date}
          phone={intake.spouse_cell_phone}
          email={intake.spouse_email}
          address={
            intake.spouse_mailing_address === intake.client_mailing_address
              ? '(Same as above)'
              : intake.spouse_mailing_address
          }
          badge="Spouse"
          chips={[
            ...(intake.spouse_served_military ? [`Veteran — ${intake.spouse_military_branch || 'Military'}`] : []),
            ...(intake.spouse_has_prepaid_funeral ? ['Prepaid Funeral'] : []),
          ]}
        >
          <InfoRow label="Burial Preference" value={intake.spouse_burial_or_cremation} />
          <InfoRow label="Funeral Home"      value={intake.spouse_preferred_funeral_home} />
          {spouseLTC?.overall_health && (
            <InfoRow label="Overall Health"  value={spouseLTC.overall_health} />
          )}
          {spouseLTC?.current_living_situation && (
            <InfoRow label="Living Situation" value={spouseLTC.current_living_situation} />
          )}
          {spouseLTC?.in_ltc_facility && (
            <InfoRow label="LTC Facility"    value={spouseLTC.facility_name || 'Yes'} />
          )}
        </PersonCard>
      )}

      {/* Children summary */}
      {children.length > 0 && (
        <>
          <SubLabel label="Children" />
          <Box sx={{
            border: `1px solid ${colors.parchment}`,
            borderRadius: 1.5, overflow: 'hidden', mb: 2,
          }}>
            {children
              .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
              .map((child, i) => (
                <Box key={child.id} sx={{
                  display: 'flex', alignItems: 'center',
                  justifyContent: 'space-between',
                  px: 2, py: 0.75,
                  bgcolor: i % 2 === 0 ? '#fff' : colors.cream,
                  borderBottom: i < children.length - 1
                    ? `1px solid ${colors.parchment}` : 'none',
                }}>
                  <Box>
                    <Typography sx={{
                      fontFamily: '"Jost", sans-serif', fontSize: '12px',
                      fontWeight: 600, color: child.disinherit ? colors.alertRed : colors.ink,
                    }}>
                      {child.name}
                      {child.disinherit && (
                        <Typography component="span" sx={{
                          fontFamily: '"Jost", sans-serif', fontSize: '10px',
                          color: colors.alertRed, fontWeight: 700, ml: 1,
                        }}>
                          (Disinherited)
                        </Typography>
                      )}
                    </Typography>
                    {child.address && (
                      <Typography sx={{
                        fontFamily: '"Jost", sans-serif', fontSize: '11px',
                        color: colors.inkLight,
                      }}>
                        {child.address}
                      </Typography>
                    )}
                  </Box>
                  <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                    {child.age && (
                      <Chip label={`Age ${child.age}`} size="small" sx={{
                        bgcolor: colors.parchment, color: colors.inkLight,
                        fontFamily: '"Jost", sans-serif', fontSize: '10px', height: 18,
                      }} />
                    )}
                    {child.relationship && child.relationship !== 'Child' && (
                      <Chip label={child.relationship} size="small" sx={{
                        bgcolor: colors.parchment, color: colors.inkLight,
                        fontFamily: '"Jost", sans-serif', fontSize: '10px', height: 18,
                      }} />
                    )}
                    {child.has_minor_children && (
                      <Chip label="Has Minor Children" size="small" sx={{
                        bgcolor: colors.warningAmberLight, color: colors.warningAmber,
                        border: `1px solid ${colors.warningAmber}`,
                        fontFamily: '"Jost", sans-serif', fontSize: '10px', height: 18,
                      }} />
                    )}
                  </Box>
                </Box>
              ))}
          </Box>
        </>
      )}

      {/* ══════════════════════════════════════════
          SECTION 2 — ESTATE PLAN SNAPSHOT
      ══════════════════════════════════════════ */}
      <ReportSectionTitle>Estate Plan Snapshot</ReportSectionTitle>

      <Grid container spacing={2} sx={{ mb: 2 }}>

        {/* Client documents */}
        <Grid item xs={12} sm={hasSpouse ? 6 : 12}>
          <Box sx={{
            border: `1px solid ${colors.parchment}`,
            borderRadius: 1.5, overflow: 'hidden',
            height: '100%',
          }}>
            <Box sx={{
              bgcolor: colors.creamDark, px: 2, py: 0.75,
              borderBottom: `1px solid ${colors.parchment}`,
            }}>
              <Typography sx={{
                fontFamily: '"Jost", sans-serif', fontSize: '12px',
                fontWeight: 700, color: colors.accent,
                textTransform: 'uppercase', letterSpacing: '0.04em',
              }}>
                {intake.client_name}
              </Typography>
            </Box>
            <Box sx={{ px: 2, py: 1.25, bgcolor: '#fff' }}>
              {clientPlan?.has_none ? (
                <Typography sx={{
                  fontFamily: '"Jost", sans-serif', fontSize: '12px',
                  color: colors.alertRed, fontWeight: 600,
                }}>
                  ⚠ No documents on record
                </Typography>
              ) : (
                <>
                  <DocStatusRow
                    label="Last Will & Testament"
                    present={clientPlan?.has_will}
                    detail={clientPlan?.has_will && clientPlan.will_personal_rep
                      ? `PR: ${clientPlan.will_personal_rep}`
                      : undefined}
                  />
                  <DocStatusRow
                    label="Revocable Living Trust"
                    present={clientPlan?.has_trust}
                    detail={clientPlan?.has_trust && clientPlan.trust_trustee
                      ? `Trustee: ${clientPlan.trust_trustee}`
                      : undefined}
                  />
                  <DocStatusRow
                    label="Irrevocable Trust"
                    present={clientPlan?.has_irrevocable_trust}
                  />
                  <DocStatusRow
                    label="Financial POA"
                    present={clientPlan?.has_financial_poa}
                    detail={clientPlan?.financial_poa_agent1
                      ? `Agent: ${clientPlan.financial_poa_agent1}`
                      : undefined}
                  />
                  <DocStatusRow
                    label="Health Care POA"
                    present={clientPlan?.has_health_care_poa}
                    detail={clientPlan?.health_care_poa_agent1
                      ? `Agent: ${clientPlan.health_care_poa_agent1}`
                      : undefined}
                  />
                  <DocStatusRow
                    label="Living Will"
                    present={clientPlan?.has_living_will}
                  />
                </>
              )}
            </Box>
          </Box>
        </Grid>

        {/* Spouse documents */}
        {hasSpouse && intake.spouse_name && (
          <Grid item xs={12} sm={6}>
            <Box sx={{
              border: `1px solid ${colors.parchment}`,
              borderRadius: 1.5, overflow: 'hidden',
              height: '100%',
            }}>
              <Box sx={{
                bgcolor: colors.creamDark, px: 2, py: 0.75,
                borderBottom: `1px solid ${colors.parchment}`,
              }}>
                <Typography sx={{
                  fontFamily: '"Jost", sans-serif', fontSize: '12px',
                  fontWeight: 700, color: colors.accent,
                  textTransform: 'uppercase', letterSpacing: '0.04em',
                }}>
                  {intake.spouse_name}
                </Typography>
              </Box>
              <Box sx={{ px: 2, py: 1.25, bgcolor: '#fff' }}>
                {spousePlan?.has_none ? (
                  <Typography sx={{
                    fontFamily: '"Jost", sans-serif', fontSize: '12px',
                    color: colors.alertRed, fontWeight: 600,
                  }}>
                    ⚠ No documents on record
                  </Typography>
                ) : (
                  <>
                    <DocStatusRow
                      label="Last Will & Testament"
                      present={spousePlan?.has_will}
                      detail={spousePlan?.has_will && spousePlan.will_personal_rep
                        ? `PR: ${spousePlan.will_personal_rep}`
                        : undefined}
                    />
                    <DocStatusRow
                      label="Revocable Living Trust"
                      present={spousePlan?.has_trust}
                      detail={spousePlan?.has_trust && spousePlan.trust_trustee
                        ? `Trustee: ${spousePlan.trust_trustee}`
                        : undefined}
                    />
                    <DocStatusRow
                      label="Irrevocable Trust"
                      present={spousePlan?.has_irrevocable_trust}
                    />
                    <DocStatusRow
                      label="Financial POA"
                      present={spousePlan?.has_financial_poa}
                      detail={spousePlan?.financial_poa_agent1
                        ? `Agent: ${spousePlan.financial_poa_agent1}`
                        : undefined}
                    />
                    <DocStatusRow
                      label="Health Care POA"
                      present={spousePlan?.has_health_care_poa}
                      detail={spousePlan?.health_care_poa_agent1
                        ? `Agent: ${spousePlan.health_care_poa_agent1}`
                        : undefined}
                    />
                    <DocStatusRow
                      label="Living Will"
                      present={spousePlan?.has_living_will}
                    />
                  </>
                )}
              </Box>
            </Box>
          </Grid>
        )}
      </Grid>

      {/* Distribution intent summary */}
      <Box sx={{
        border: `1px solid ${colors.parchment}`,
        borderRadius: 1.5, px: 2, py: 1.25, mb: 2, bgcolor: '#fff',
        '@media print': { breakInside: 'avoid' },
      }}>
        <Typography sx={{
          fontFamily: '"Jost", sans-serif', fontSize: '11px',
          fontWeight: 700, color: colors.inkLight,
          textTransform: 'uppercase', letterSpacing: '0.04em', mb: 0.75,
        }}>
          Distribution Intent
        </Typography>
        {intake.provide_for_spouse_then_children && (
          <InfoRow label="Primary approach" value="Provide for spouse first, then to children" />
        )}
        {intake.treat_all_children_equally !== undefined && (
          <InfoRow
            label="Children treated equally"
            value={intake.treat_all_children_equally ? 'Yes' : 'No — see Estate Planning Overview'}
          />
        )}
        {intake.distribution_age && (
          <InfoRow label="Distribution age for children" value={intake.distribution_age} />
        )}
        {beneficiaries.length > 0 && (
          <InfoRow
            label="Named beneficiaries"
            value={beneficiaries
              .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
              .map((b) => `${b.name}${b.relationship ? ' (' + b.relationship + ')' : ''}`)
              .join(', ')}
          />
        )}
        {concernFlags.length > 0 && (
          <Box sx={{ mt: 1 }}>
            <Typography sx={{
              fontFamily: '"Jost", sans-serif', fontSize: '11px',
              fontWeight: 700, color: colors.warningAmber, mb: 0.5,
            }}>
              Planning flags requiring special provisions:
            </Typography>
            <Box>
              {concernFlags.map((f) => <FlagPill key={f} label={f} />)}
            </Box>
          </Box>
        )}
        {intake.beneficiary_notes && (
          <Box sx={{ mt: 1 }}>
            <InfoRow label="Notes" value={intake.beneficiary_notes} />
          </Box>
        )}
      </Box>

      {/* ══════════════════════════════════════════
          SECTION 3 — FINANCIAL OVERVIEW
      ══════════════════════════════════════════ */}
      <ReportSectionTitle>Financial Overview</ReportSectionTitle>

      <Grid container spacing={2} sx={{ mb: 2 }}>
        {/* Asset summary */}
        <Grid item xs={12} sm={7}>
          <Box sx={{
            border: `1px solid ${colors.parchment}`,
            borderRadius: 1.5, overflow: 'hidden',
          }}>
            <Box sx={{
              bgcolor: colors.creamDark, px: 2, py: 0.75,
              borderBottom: `1px solid ${colors.parchment}`,
            }}>
              <Typography sx={{
                fontFamily: '"Jost", sans-serif', fontSize: '12px',
                fontWeight: 700, color: colors.accent,
                textTransform: 'uppercase', letterSpacing: '0.04em',
              }}>
                Asset Summary
              </Typography>
            </Box>
            <Box sx={{ px: 1, py: 1, bgcolor: '#fff' }}>
              {totalBankValue > 0 && (
                <SummaryRow
                  label="Bank & Savings Accounts"
                  sublabel={`${bankAccounts.length} account${bankAccounts.length !== 1 ? 's' : ''}`}
                  value={fmt(totalBankValue)}
                />
              )}
              {totalInvestValue > 0 && (
                <SummaryRow
                  label="Investments & Brokerage"
                  sublabel={`${investments.length} account${investments.length !== 1 ? 's' : ''}`}
                  value={fmt(totalInvestValue)}
                />
              )}
              {totalRetireValue > 0 && (
                <SummaryRow
                  label="Retirement Accounts"
                  sublabel={`${retirementAccounts.length} account${retirementAccounts.length !== 1 ? 's' : ''}`}
                  value={fmt(totalRetireValue)}
                />
              )}
              {totalREGross > 0 && (
                <SummaryRow
                  label="Real Estate (net of mortgage)"
                  sublabel={`${realEstate.length} propert${realEstate.length !== 1 ? 'ies' : 'y'}`}
                  value={fmt(totalREGross - totalREMortgage)}
                />
              )}
              {financialTotal > 0 && (
                <SummaryRow
                  label="Estimated Net Worth"
                  value={fmt(financialTotal)}
                  highlight
                />
              )}
              {totalLifeDeath > 0 && (
                <Box sx={{ mt: 1, px: 1 }}>
                  <Typography sx={{
                    fontFamily: '"Jost", sans-serif', fontSize: '11px',
                    color: colors.inkLight, fontStyle: 'italic',
                  }}>
                    + {fmt(totalLifeDeath)} life insurance death benefit
                    (paid directly to named beneficiaries, not included in net worth)
                  </Typography>
                </Box>
              )}
              {financialTotal === 0 && totalLifeDeath === 0 && (
                <EmptyState message="No financial data on record." />
              )}
            </Box>
          </Box>
        </Grid>

        {/* Income summary */}
        <Grid item xs={12} sm={5}>
          <Box sx={{
            border: `1px solid ${colors.parchment}`,
            borderRadius: 1.5, overflow: 'hidden', height: '100%',
          }}>
            <Box sx={{
              bgcolor: colors.creamDark, px: 2, py: 0.75,
              borderBottom: `1px solid ${colors.parchment}`,
            }}>
              <Typography sx={{
                fontFamily: '"Jost", sans-serif', fontSize: '12px',
                fontWeight: 700, color: colors.accent,
                textTransform: 'uppercase', letterSpacing: '0.04em',
              }}>
                Income Sources
              </Typography>
            </Box>
            <Box sx={{ px: 2, py: 1.25, bgcolor: '#fff' }}>
              {clientIncome.length === 0 && spouseIncome.length === 0 ? (
                <EmptyState message="No income data on record." />
              ) : (
                <>
                  {clientIncome.length > 0 && (
                    <>
                      <Typography sx={{
                        fontFamily: '"Jost", sans-serif', fontSize: '11px',
                        fontWeight: 700, color: colors.inkLight,
                        textTransform: 'uppercase', letterSpacing: '0.04em', mb: 0.5,
                      }}>
                        {intake.client_name}
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
                    <>
                      <Typography sx={{
                        fontFamily: '"Jost", sans-serif', fontSize: '11px',
                        fontWeight: 700, color: colors.inkLight,
                        textTransform: 'uppercase', letterSpacing: '0.04em',
                        mt: 1.25, mb: 0.5,
                      }}>
                        {intake.spouse_name}
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
                    </>
                  )}
                </>
              )}
            </Box>
          </Box>
        </Grid>
      </Grid>

      {/* Real estate properties */}
      {realEstate.length > 0 && (
        <>
          <SubLabel label="Real Estate" />
          <Box sx={{
            border: `1px solid ${colors.parchment}`,
            borderRadius: 1.5, overflow: 'hidden', mb: 2,
          }}>
            {realEstate
              .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
              .map((r, i) => (
                <Box key={r.id} sx={{
                  display: 'flex', justifyContent: 'space-between',
                  alignItems: 'center', gap: 2,
                  px: 2, py: 0.75,
                  bgcolor: i % 2 === 0 ? '#fff' : colors.cream,
                  borderBottom: i < realEstate.length - 1
                    ? `1px solid ${colors.parchment}` : 'none',
                }}>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography sx={{
                      fontFamily: '"Jost", sans-serif', fontSize: '12px',
                      fontWeight: 600, color: colors.ink,
                    }}>
                      {[r.street, r.city, r.state, r.zip].filter(Boolean).join(', ')}
                    </Typography>
                    {(r.category || r.ownership_form) && (
                      <Typography sx={{
                        fontFamily: '"Jost", sans-serif', fontSize: '11px',
                        color: colors.inkLight,
                      }}>
                        {[r.category, r.ownership_form].filter(Boolean).join(' · ')}
                      </Typography>
                    )}
                  </Box>
                  {r.value != null && (
                    <Typography sx={{
                      fontFamily: '"Jost", sans-serif', fontSize: '12px',
                      fontWeight: 600, color: colors.accent, flexShrink: 0,
                    }}>
                      {fmt(r.value)}
                      {r.mortgage_balance
                        ? ` (−${fmt(r.mortgage_balance)} mtg)`
                        : ''}
                    </Typography>
                  )}
                </Box>
              ))}
          </Box>
        </>
      )}

      {/* ══════════════════════════════════════════
          SECTION 4 — HEALTH & CARE
      ══════════════════════════════════════════ */}
      <ReportSectionTitle>Health & Care Overview</ReportSectionTitle>
      <Grid container spacing={2} sx={{ mb: 2 }}>
        {[
          {
            name: intake.client_name,
            ltc: clientLTC,
            medIns: clientMedicalInsurance,
          },
          ...(hasSpouse && intake.spouse_name
            ? [{ name: intake.spouse_name, ltc: spouseLTC, medIns: spouseMedicalInsurance }]
            : []),
        ].map(({ name, ltc, medIns }) => (
          <Grid item xs={12} sm={hasSpouse ? 6 : 12} key={name}>
            <Box sx={{
              border: `1px solid ${colors.parchment}`,
              borderRadius: 1.5, overflow: 'hidden', height: '100%',
            }}>
              <Box sx={{
                bgcolor: colors.creamDark, px: 2, py: 0.75,
                borderBottom: `1px solid ${colors.parchment}`,
              }}>
                <Typography sx={{
                  fontFamily: '"Jost", sans-serif', fontSize: '12px',
                  fontWeight: 700, color: colors.accent,
                  textTransform: 'uppercase', letterSpacing: '0.04em',
                }}>
                  {name}
                </Typography>
              </Box>
              <Box sx={{ px: 2, py: 1.25, bgcolor: '#fff' }}>
                {ltc ? (
                  <>
                    <InfoRow label="Overall Health"      value={ltc.overall_health} />
                    <InfoRow label="Living Situation"    value={ltc.current_living_situation} />
                    {ltc.in_ltc_facility && (
                      <InfoRow label="LTC Facility"      value={ltc.facility_name || 'Yes'} />
                    )}
                    <InfoRow
                      label="LTC Insurance"
                      value={ltc.has_ltc_insurance
                        ? `${ltc.ltc_insurance_company || 'Yes'}${ltc.ltc_insurance_daily_benefit ? ' — $' + ltc.ltc_insurance_daily_benefit + '/day' : ''}`
                        : 'None on record'}
                    />
                  </>
                ) : (
                  <EmptyState message="No care data on record." />
                )}
                {medIns && (
                  <>
                    <InfoRow
                      label="Medicare Coverage"
                      value={medIns.medicare_coverage_type || medIns.medicare_plan_name}
                    />
                    <InfoRow
                      label="Private Insurance"
                      value={medIns.private_insurance_description}
                    />
                  </>
                )}
              </Box>
            </Box>
          </Grid>
        ))}
      </Grid>

      {/* ══════════════════════════════════════════
          SECTION 5 — KEY ADVISORS
      ══════════════════════════════════════════ */}
      <ReportSectionTitle>Key Advisors</ReportSectionTitle>
      {keyAdvisors.length === 0 ? (
        <EmptyState message="No advisors on record. See Advisor Directory for complete contact list." />
      ) : (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
          {keyAdvisors.map((a) => (
            <Box key={a.id} sx={{
              border: `1px solid ${colors.parchment}`,
              borderRadius: 1.5, px: 2, py: 1.25,
              bgcolor: '#fff', minWidth: 200, flexGrow: 1,
              '@media print': { breakInside: 'avoid' },
            }}>
              <Typography sx={{
                fontFamily: '"Jost", sans-serif', fontSize: '10px',
                fontWeight: 700, color: colors.accentWarm,
                textTransform: 'uppercase', letterSpacing: '0.04em', mb: 0.25,
              }}>
                {a.advisor_type}
              </Typography>
              <Typography sx={{
                fontFamily: '"Jost", sans-serif', fontSize: '13px',
                fontWeight: 700, color: colors.ink,
              }}>
                {a.name}
              </Typography>
              {a.firm_name && (
                <Typography sx={{
                  fontFamily: '"Jost", sans-serif', fontSize: '11px', color: colors.inkLight,
                }}>
                  {a.firm_name}
                </Typography>
              )}
              {a.phone && (
                <Typography sx={{
                  fontFamily: '"Jost", sans-serif', fontSize: '11px', color: colors.ink, mt: 0.25,
                }}>
                  📞 {a.phone}
                </Typography>
              )}
              {a.email && (
                <Typography sx={{
                  fontFamily: '"Jost", sans-serif', fontSize: '11px', color: colors.inkLight,
                }}>
                  {a.email}
                </Typography>
              )}
            </Box>
          ))}
        </Box>
      )}

      {/* ── Companion reports reference ── */}
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
          'Emergency Medical Summary — medications, allergies, providers',
          'Asset Inventory — complete asset listing with values',
          'Insurance Summary — all coverage with costs and beneficiaries',
          'Estate Planning Overview — full document detail and distribution plan',
          'Advisor Directory — complete contact list for all advisors and providers',
          'Funeral Instructions — burial preferences and end-of-life wishes',
          'What To Do If I Die — step-by-step checklist for family',
          'Family Contact Sheet — complete family and friend contact list',
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
          This Family Briefing Report contains confidential personal, financial, and legal
          information. It is intended solely for authorized family members, trustees, and advisors.
          It does not constitute legal, financial, or medical advice. Please consult qualified
          professionals before making decisions based on this information.
        </Typography>
      </Box>
    </ReportLayout>
  );
};

export default FamilyBriefingReport;

/* ─────────────────────────────────────────────────────────────────────────────
 * USAGE EXAMPLE:
 *
 * import FamilyBriefingReport from './reports/FamilyBriefingReport';
 *
 * const { data: intake }             = await supabase.from('folio_intakes').select('*').eq('id', intakeId).single();
 * const { data: currentEstatePlans } = await supabase.from('folio_current_estate_plan').select('*').eq('intake_id', intakeId);
 * const { data: children }           = await supabase.from('folio_children').select('*').eq('intake_id', intakeId).order('sort_order');
 * const { data: beneficiaries }      = await supabase.from('folio_beneficiaries').select('*').eq('intake_id', intakeId).order('sort_order');
 * const { data: advisors }           = await supabase.from('folio_advisors').select('*').eq('intake_id', intakeId).order('sort_order');
 * const { data: lifeInsurance }      = await supabase.from('folio_life_insurance').select('*').eq('intake_id', intakeId).order('sort_order');
 * const { data: retirementAccounts } = await supabase.from('folio_retirement_accounts').select('*').eq('intake_id', intakeId).order('sort_order');
 * const { data: realEstate }         = await supabase.from('folio_real_estate').select('*').eq('intake_id', intakeId).order('sort_order');
 * const { data: bankAccounts }       = await supabase.from('folio_bank_accounts').select('*').eq('intake_id', intakeId).order('sort_order');
 * const { data: investments }        = await supabase.from('folio_investments').select('*').eq('intake_id', intakeId).order('sort_order');
 * const { data: clientIncome }       = await supabase.from('folio_client_income').select('*').eq('intake_id', intakeId).order('sort_order');
 * const { data: spouseIncome }       = await supabase.from('folio_spouse_income').select('*').eq('intake_id', intakeId).order('sort_order');
 * const { data: clientMedIns }       = await supabase.from('folio_client_medical_insurance').select('*').eq('intake_id', intakeId).single();
 * const { data: spouseMedIns }       = await supabase.from('folio_spouse_medical_insurance').select('*').eq('intake_id', intakeId).single();
 * const { data: longTermCare }       = await supabase.from('folio_long_term_care').select('*').eq('intake_id', intakeId);
 *
 * <FamilyBriefingReport
 *   intake={intake}
 *   currentEstatePlans={currentEstatePlans}
 *   children={children}
 *   beneficiaries={beneficiaries}
 *   advisors={advisors}
 *   lifeInsurance={lifeInsurance}
 *   retirementAccounts={retirementAccounts}
 *   realEstate={realEstate}
 *   bankAccounts={bankAccounts}
 *   investments={investments}
 *   clientIncome={clientIncome}
 *   spouseIncome={spouseIncome}
 *   clientMedicalInsurance={clientMedIns}
 *   spouseMedicalInsurance={spouseMedIns}
 *   longTermCare={longTermCare}
 *   dateCreated={intake.created_at}
 *   dateUpdated={intake.updated_at}
 * />
 * ───────────────────────────────────────────────────────────────────────────── */