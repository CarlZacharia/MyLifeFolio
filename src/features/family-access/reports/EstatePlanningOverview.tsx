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
  client_mailing_address?: string;
  client_state_of_domicile?: string;
  client_email?: string;
  client_cell_phone?: string;
  // Spouse
  marital_status?: string;
  spouse_name?: string;
  spouse_aka?: string;
  spouse_birth_date?: string;
  date_married?: string;
  place_of_marriage?: string;
  prior_marriage?: boolean;
  children_from_prior_marriage?: boolean;
  // Children
  number_of_children?: number;
  children_together?: number;
  client_has_children_from_prior?: boolean;
  client_children_from_prior?: number;
  spouse_has_children_from_prior?: boolean;
  spouse_children_from_prior?: number;
  // Beneficiary concerns
  any_beneficiaries_minors?: boolean;
  beneficiary_minors_explanation?: string;
  any_beneficiaries_disabled?: boolean;
  beneficiary_disabled_explanation?: string;
  any_beneficiaries_marital_problems?: boolean;
  beneficiary_marital_problems_explanation?: string;
  any_beneficiaries_receiving_ssi?: boolean;
  beneficiary_ssi_explanation?: string;
  any_beneficiary_drug_addiction?: boolean;
  beneficiary_drug_addiction_explanation?: string;
  any_beneficiary_alcoholism?: boolean;
  beneficiary_alcoholism_explanation?: string;
  any_beneficiary_financial_problems?: boolean;
  beneficiary_financial_problems_explanation?: string;
  has_other_beneficiary_concerns?: boolean;
  beneficiary_other_concerns?: string;
  beneficiary_notes?: string;
  // Distribution preferences
  provide_for_spouse_then_children?: boolean;
  treat_all_children_equally?: boolean;
  children_equality_explanation?: string;
  distribution_age?: string;
  children_predeceased_beneficiaries?: boolean;
  leave_to_grandchildren?: boolean;
  treat_all_grandchildren_equally?: boolean;
  grandchildren_equality_explanation?: string;
  grandchildren_amount?: string;
  grandchildren_distribution_age?: string;
  // Trust
  client_has_living_trust?: boolean;
  client_living_trust_name?: string;
  client_living_trust_date?: string;
  client_has_irrevocable_trust?: boolean;
  client_irrevocable_trust_name?: string;
  client_irrevocable_trust_date?: string;
  client_considering_trust?: boolean;
  // Military
  client_served_military?: boolean;
  client_military_branch?: string;
}

/** folio_current_estate_plan */
interface CurrentEstatePlan {
  person_type?: string;
  has_will?: boolean;
  has_trust?: boolean;
  is_joint_trust?: boolean;
  has_irrevocable_trust?: boolean;
  is_joint_irrevocable_trust?: boolean;
  has_financial_poa?: boolean;
  has_health_care_poa?: boolean;
  has_living_will?: boolean;
  has_none?: boolean;
  // Will
  will_date_signed?: string;
  will_state_signed?: string;
  will_personal_rep?: string;
  will_personal_rep_alternate1?: string;
  will_personal_rep_alternate2?: string;
  will_primary_beneficiary?: string;
  will_secondary_beneficiaries?: string;
  // Trust
  trust_name?: string;
  trust_date_signed?: string;
  trust_state_signed?: string;
  trust_trustee?: string;
  trust_trustee_alternate1?: string;
  trust_trustee_alternate2?: string;
  trust_primary_beneficiary?: string;
  trust_secondary_beneficiaries?: string;
  // Irrevocable trust
  irrevocable_trust_name?: string;
  irrevocable_trust_date_signed?: string;
  irrevocable_trust_reason?: string;
  // POA
  financial_poa_date_signed?: string;
  financial_poa_state_signed?: string;
  financial_poa_agent1?: string;
  financial_poa_agent2?: string;
  financial_poa_agent3?: string;
  // Health care
  health_care_poa_date_signed?: string;
  health_care_poa_state_signed?: string;
  health_care_poa_agent1?: string;
  // Living will
  living_will_date_signed?: string;
  living_will_state_signed?: string;
  // Review
  review_option?: string;
  document_state?: string;
  document_date?: string;
}

/** folio_distribution_plans */
interface DistributionPlan {
  person_type?: string;
  distribution_type?: string;
  is_sweetheart_plan?: boolean;
  has_specific_gifts?: boolean;
  specific_asset_gifts?: any;
  cash_gifts?: any;
  residuary_beneficiaries?: any;
  residuary_share_type?: string;
  notes?: string;
}

/** folio_beneficiaries */
interface Beneficiary {
  id: string;
  name: string;
  relationship?: string;
  relationship_other?: string;
  age?: string;
  distribution_type?: string;
  distribution_method?: string;
  notes?: string;
  sort_order?: number;
}

/** folio_children */
interface Child {
  id: string;
  name: string;
  age?: string;
  birth_date?: string;
  relationship?: string;
  marital_status?: string;
  has_children?: boolean;
  number_of_children?: number;
  has_minor_children?: boolean;
  distribution_type?: string;
  distribution_method?: string;
  disinherit?: boolean;
  comments?: string;
  sort_order?: number;
}

/** folio_specific_gifts */
interface SpecificGift {
  id: string;
  recipient_name?: string;
  relationship?: string;
  description?: string;
  notes?: string;
  sort_order?: number;
}

/** folio_cash_gifts */
interface CashGift {
  id: string;
  beneficiary_name?: string;
  relationship?: string;
  amount?: string;
  sort_order?: number;
}

/** folio_charities */
interface Charity {
  id: string;
  name?: string;
  address?: string;
  amount?: string;
  sort_order?: number;
}

interface EstatePlanningOverviewProps {
  intake: FolioIntake;
  // Arrays for client + spouse (person_type distinguishes them)
  currentEstatePlans?: CurrentEstatePlan[];
  distributionPlans?: DistributionPlan[];
  beneficiaries?: Beneficiary[];
  children?: Child[];
  specificGifts?: SpecificGift[];
  cashGifts?: CashGift[];
  charities?: Charity[];
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
    color: colors.inkLight, fontStyle: 'italic', py: 1,
  }}>
    {message}
  </Typography>
);

const InfoRow: React.FC<{ label: string; value?: string | null }> = ({ label, value }) => {
  if (!value) return null;
  return (
    <Box sx={{ display: 'flex', gap: 1, mb: 0.5 }}>
      <Typography sx={{
        fontFamily: '"Jost", sans-serif', fontSize: '12px',
        fontWeight: 600, color: colors.inkLight, minWidth: 170, flexShrink: 0,
      }}>
        {label}:
      </Typography>
      <Typography sx={{ fontFamily: '"Jost", sans-serif', fontSize: '12px', color: colors.ink }}>
        {value}
      </Typography>
    </Box>
  );
};

/** Status pill: green check / red X / amber question */
const StatusPill: React.FC<{
  label: string;
  status: 'yes' | 'no' | 'unknown';
  detail?: string;
}> = ({ label, status, detail }) => {
  const cfg = {
    yes:     { bg: colors.okGreenLight,      border: colors.okGreen,     color: colors.okGreen,     icon: '✓' },
    no:      { bg: colors.alertRedLight,     border: colors.alertRed,    color: colors.alertRed,    icon: '✗' },
    unknown: { bg: colors.warningAmberLight, border: colors.warningAmber, color: colors.warningAmber, icon: '?' },
  }[status];

  return (
    <Box sx={{
      display: 'flex', alignItems: 'center', gap: 1,
      border: `1px solid ${cfg.border}`, borderRadius: 1,
      px: 1.5, py: 0.6, bgcolor: cfg.bg, mb: 0.75,
      '@media print': { breakInside: 'avoid' },
    }}>
      <Typography sx={{
        fontFamily: '"Jost", sans-serif', fontSize: '13px',
        fontWeight: 700, color: cfg.color, lineHeight: 1,
      }}>
        {cfg.icon}
      </Typography>
      <Box sx={{ flexGrow: 1 }}>
        <Typography sx={{
          fontFamily: '"Jost", sans-serif', fontSize: '12px',
          fontWeight: 600, color: colors.ink,
        }}>
          {label}
        </Typography>
        {detail && (
          <Typography sx={{
            fontFamily: '"Jost", sans-serif', fontSize: '11px',
            color: colors.inkLight,
          }}>
            {detail}
          </Typography>
        )}
      </Box>
    </Box>
  );
};

/** Document detail block */
const DocumentBlock: React.FC<{
  title: string;
  children: React.ReactNode;
  missing?: boolean;
}> = ({ title, children, missing }) => (
  <Box sx={{
    border: `1px solid ${missing ? colors.alertRed : colors.parchment}`,
    borderLeft: `4px solid ${missing ? colors.alertRed : colors.accentWarm}`,
    borderRadius: 1.5, px: 2, py: 1.5, mb: 1.5, bgcolor: '#fff',
    '@media print': { breakInside: 'avoid' },
  }}>
    <Typography sx={{
      fontFamily: '"Jost", sans-serif', fontSize: '13px',
      fontWeight: 700, color: missing ? colors.alertRed : colors.ink, mb: 1,
    }}>
      {missing ? '⚠ ' : ''}{title}
    </Typography>
    {children}
  </Box>
);

/** Concern flag row */
const ConcernFlag: React.FC<{
  label: string;
  present?: boolean;
  explanation?: string;
}> = ({ label, present, explanation }) => {
  if (!present) return null;
  return (
    <Box sx={{
      display: 'flex', gap: 1, mb: 0.75,
      bgcolor: colors.warningAmberLight,
      border: `1px solid ${colors.warningAmber}`,
      borderRadius: 1, px: 1.5, py: 0.75,
    }}>
      <Typography sx={{
        fontFamily: '"Jost", sans-serif', fontSize: '12px',
        fontWeight: 700, color: colors.warningAmber, flexShrink: 0,
      }}>
        ⚑
      </Typography>
      <Box>
        <Typography sx={{
          fontFamily: '"Jost", sans-serif', fontSize: '12px',
          fontWeight: 600, color: colors.ink,
        }}>
          {label}
        </Typography>
        {explanation && (
          <Typography sx={{
            fontFamily: '"Jost", sans-serif', fontSize: '11px',
            color: colors.inkLight, mt: 0.25,
          }}>
            {explanation}
          </Typography>
        )}
      </Box>
    </Box>
  );
};

/** Table helpers */
const TableHeader: React.FC<{ cols: string[]; widths?: string[] }> = ({ cols, widths }) => (
  <Box sx={{
    display: 'grid',
    gridTemplateColumns: widths ? widths.join(' ') : `repeat(${cols.length}, 1fr)`,
    bgcolor: colors.creamDark, borderRadius: '4px 4px 0 0',
    px: 1.5, py: 0.75,
    border: `1px solid ${colors.parchment}`,
    borderBottom: `2px solid ${colors.accentWarm}`,
  }}>
    {cols.map((col) => (
      <Typography key={col} sx={{
        fontFamily: '"Jost", sans-serif', fontSize: '11px',
        fontWeight: 700, color: colors.accent,
        letterSpacing: '0.04em', textTransform: 'uppercase',
      }}>
        {col}
      </Typography>
    ))}
  </Box>
);

const TableRow: React.FC<{
  cols: (string | React.ReactNode)[];
  widths?: string[];
  zebra?: boolean;
}> = ({ cols, widths, zebra }) => (
  <Box sx={{
    display: 'grid',
    gridTemplateColumns: widths ? widths.join(' ') : `repeat(${cols.length}, 1fr)`,
    px: 1.5, py: 0.75,
    bgcolor: zebra ? colors.cream : '#fff',
    border: `1px solid ${colors.parchment}`,
    borderTop: 'none',
    '&:last-child': { borderRadius: '0 0 4px 4px' },
  }}>
    {cols.map((col, i) => (
      <Typography key={i} component="div" sx={{
        fontFamily: '"Jost", sans-serif', fontSize: '12px', color: colors.ink,
      }}>
        {col ?? '—'}
      </Typography>
    ))}
  </Box>
);

// ─── Main Component ───────────────────────────────────────────────────────────

const EstatePlanningOverview: React.FC<EstatePlanningOverviewProps> = ({
  intake,
  currentEstatePlans = [],
  distributionPlans = [],
  beneficiaries = [],
  children = [],
  specificGifts = [],
  cashGifts = [],
  charities = [],
  dateCreated,
  dateUpdated,
}) => {
  const hasSpouse = !!intake.spouse_name;

  // Split estate plans by person_type
  const clientPlan  = currentEstatePlans.find(
    (p) => p.person_type === 'client' || p.person_type === 'Client' || !p.person_type
  );
  const spousePlan  = currentEstatePlans.find(
    (p) => p.person_type === 'spouse' || p.person_type === 'Spouse'
  );

  const clientDistPlan = distributionPlans.find(
    (p) => p.person_type === 'client' || p.person_type === 'Client' || !p.person_type
  );
  const spouseDistPlan = distributionPlans.find(
    (p) => p.person_type === 'spouse' || p.person_type === 'Spouse'
  );

  // Beneficiary concern flags
  const concerns = [
    { label: 'Minor Beneficiaries',          present: intake.any_beneficiaries_minors,          explanation: intake.beneficiary_minors_explanation },
    { label: 'Disabled Beneficiaries',        present: intake.any_beneficiaries_disabled,         explanation: intake.beneficiary_disabled_explanation },
    { label: 'Marital Problems',              present: intake.any_beneficiaries_marital_problems, explanation: intake.beneficiary_marital_problems_explanation },
    { label: 'Beneficiary Receiving SSI',     present: intake.any_beneficiaries_receiving_ssi,    explanation: intake.beneficiary_ssi_explanation },
    { label: 'Drug Addiction Issues',         present: intake.any_beneficiary_drug_addiction,     explanation: intake.beneficiary_drug_addiction_explanation },
    { label: 'Alcoholism Issues',             present: intake.any_beneficiary_alcoholism,          explanation: intake.beneficiary_alcoholism_explanation },
    { label: 'Beneficiary Financial Problems',present: intake.any_beneficiary_financial_problems, explanation: intake.beneficiary_financial_problems_explanation },
    { label: 'Other Concerns',               present: intake.has_other_beneficiary_concerns,      explanation: intake.beneficiary_other_concerns },
  ].filter((c) => c.present);

  const renderEstatePlanStatus = (plan: CurrentEstatePlan | undefined, personName: string) => {
    if (!plan) return <EmptyState message={`No estate plan data on record for ${personName}.`} />;

    return (
      <>
        {/* Document status grid */}
        <Grid container spacing={1} sx={{ mb: 2 }}>
          {[
            { label: 'Last Will & Testament', has: plan.has_will },
            { label: 'Revocable Living Trust', has: plan.has_trust },
            { label: 'Irrevocable Trust', has: plan.has_irrevocable_trust },
            { label: 'Financial Power of Attorney', has: plan.has_financial_poa },
            { label: 'Health Care POA / Directive', has: plan.has_health_care_poa },
            { label: 'Living Will / Advance Directive', has: plan.has_living_will },
          ].map(({ label, has }) => (
            <Grid item xs={12} sm={6} key={label}>
              <StatusPill
                label={label}
                status={has === true ? 'yes' : has === false ? 'no' : 'unknown'}
              />
            </Grid>
          ))}
        </Grid>

        {/* Will detail */}
        {plan.has_will && (
          <DocumentBlock title="Last Will & Testament">
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <InfoRow label="Date Signed"         value={formatDate(plan.will_date_signed)} />
                <InfoRow label="State Signed"        value={plan.will_state_signed} />
                <InfoRow label="Personal Rep"        value={plan.will_personal_rep} />
                <InfoRow label="Alternate PR #1"     value={plan.will_personal_rep_alternate1} />
                <InfoRow label="Alternate PR #2"     value={plan.will_personal_rep_alternate2} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <InfoRow label="Primary Beneficiary"    value={plan.will_primary_beneficiary} />
                <InfoRow label="Secondary Beneficiaries" value={plan.will_secondary_beneficiaries} />
              </Grid>
            </Grid>
          </DocumentBlock>
        )}

        {/* Revocable Trust detail */}
        {plan.has_trust && (
          <DocumentBlock title={plan.trust_name || 'Revocable Living Trust'}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <InfoRow label="Trust Name"          value={plan.trust_name} />
                <InfoRow label="Date Signed"         value={formatDate(plan.trust_date_signed)} />
                <InfoRow label="State Signed"        value={plan.trust_state_signed} />
                <InfoRow label="Joint Trust"         value={plan.is_joint_trust ? 'Yes' : undefined} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <InfoRow label="Trustee"             value={plan.trust_trustee} />
                <InfoRow label="Alternate Trustee #1" value={plan.trust_trustee_alternate1} />
                <InfoRow label="Alternate Trustee #2" value={plan.trust_trustee_alternate2} />
                <InfoRow label="Primary Beneficiary"  value={plan.trust_primary_beneficiary} />
                <InfoRow label="Secondary Beneficiaries" value={plan.trust_secondary_beneficiaries} />
              </Grid>
            </Grid>
          </DocumentBlock>
        )}

        {/* Irrevocable Trust */}
        {plan.has_irrevocable_trust && (
          <DocumentBlock title={plan.irrevocable_trust_name || 'Irrevocable Trust'}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <InfoRow label="Trust Name"   value={plan.irrevocable_trust_name} />
                <InfoRow label="Date Signed"  value={formatDate(plan.irrevocable_trust_date_signed)} />
                <InfoRow label="Joint"        value={plan.is_joint_irrevocable_trust ? 'Yes' : undefined} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <InfoRow label="Purpose / Reason" value={plan.irrevocable_trust_reason} />
              </Grid>
            </Grid>
          </DocumentBlock>
        )}

        {/* Financial POA */}
        {plan.has_financial_poa && (
          <DocumentBlock title="Financial Power of Attorney">
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <InfoRow label="Date Signed"  value={formatDate(plan.financial_poa_date_signed)} />
                <InfoRow label="State Signed" value={plan.financial_poa_state_signed} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <InfoRow label="Agent #1"     value={plan.financial_poa_agent1} />
                <InfoRow label="Agent #2"     value={plan.financial_poa_agent2} />
                <InfoRow label="Agent #3"     value={plan.financial_poa_agent3} />
              </Grid>
            </Grid>
          </DocumentBlock>
        )}

        {/* Health Care POA */}
        {plan.has_health_care_poa && (
          <DocumentBlock title="Health Care Power of Attorney">
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <InfoRow label="Date Signed"  value={formatDate(plan.health_care_poa_date_signed)} />
                <InfoRow label="State Signed" value={plan.health_care_poa_state_signed} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <InfoRow label="Agent #1"     value={plan.health_care_poa_agent1} />
              </Grid>
            </Grid>
          </DocumentBlock>
        )}

        {/* Living Will */}
        {plan.has_living_will && (
          <DocumentBlock title="Living Will / Advance Directive">
            <InfoRow label="Date Signed"  value={formatDate(plan.living_will_date_signed)} />
            <InfoRow label="State Signed" value={plan.living_will_state_signed} />
          </DocumentBlock>
        )}

        {/* No documents */}
        {plan.has_none && (
          <Box sx={{
            bgcolor: colors.alertRedLight,
            border: `1.5px solid ${colors.alertRed}`,
            borderRadius: 1, px: 2, py: 1, mb: 1.5,
          }}>
            <Typography sx={{
              fontFamily: '"Jost", sans-serif', fontSize: '12px',
              color: colors.alertRed, fontWeight: 600,
            }}>
              ⚠ No estate planning documents currently on record for {personName}.
            </Typography>
          </Box>
        )}

        {/* Review option */}
        {plan.review_option && (
          <Box sx={{
            mt: 1, px: 2, py: 1,
            bgcolor: colors.cream,
            border: `1px solid ${colors.parchment}`,
            borderRadius: 1,
          }}>
            <InfoRow label="Review Status" value={plan.review_option} />
          </Box>
        )}
      </>
    );
  };

  const renderDistributionPlan = (plan: DistributionPlan | undefined, personName: string) => {
    if (!plan) return <EmptyState message={`No distribution plan on record for ${personName}.`} />;
    return (
      <Box sx={{ mb: 1 }}>
        <InfoRow label="Distribution Type"   value={plan.distribution_type} />
        <InfoRow label="Sweetheart Plan"      value={plan.is_sweetheart_plan ? 'Yes — all to spouse first' : undefined} />
        <InfoRow label="Residuary Share Type" value={plan.residuary_share_type} />
        <InfoRow label="Includes Specific Gifts" value={plan.has_specific_gifts ? 'Yes' : undefined} />
        <InfoRow label="Notes"                value={plan.notes} />
      </Box>
    );
  };

  return (
    <ReportLayout
      title="Estate Planning Overview"
      ownerName={intake.client_name}
      dateCreated={dateCreated}
      dateUpdated={dateUpdated}
    >

      {/* ── 1. Client Profile ── */}
      <ReportSectionTitle>Client Profile</ReportSectionTitle>
      <Box sx={{
        bgcolor: colors.cream,
        border: `1px solid ${colors.parchment}`,
        borderRadius: 1.5, px: 2.5, py: 1.5, mb: 2,
      }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <InfoRow label="Name"               value={intake.client_name} />
            {intake.client_aka && (
              <InfoRow label="Also Known As"    value={intake.client_aka} />
            )}
            <InfoRow label="Date of Birth"      value={formatDate(intake.client_birth_date)} />
            <InfoRow label="Address"            value={intake.client_mailing_address} />
            <InfoRow label="State of Domicile"  value={intake.client_state_of_domicile} />
            <InfoRow label="Marital Status"     value={intake.marital_status} />
            {intake.client_served_military && (
              <InfoRow label="Military Service" value={intake.client_military_branch || 'Yes'} />
            )}
          </Grid>
          <Grid item xs={12} sm={6}>
            {hasSpouse && (
              <>
                <InfoRow label="Spouse"             value={intake.spouse_name} />
                {intake.spouse_aka && (
                  <InfoRow label="Spouse AKA"       value={intake.spouse_aka} />
                )}
                <InfoRow label="Spouse DOB"         value={formatDate(intake.spouse_birth_date)} />
                <InfoRow label="Date Married"       value={formatDate(intake.date_married)} />
                <InfoRow label="Place of Marriage"  value={intake.place_of_marriage} />
                {intake.prior_marriage && (
                  <InfoRow label="Prior Marriage"   value="Yes" />
                )}
              </>
            )}
            <InfoRow label="Number of Children"     value={intake.number_of_children?.toString()} />
            {intake.client_has_children_from_prior && (
              <InfoRow label="Client Prior Children" value={intake.client_children_from_prior?.toString()} />
            )}
            {intake.spouse_has_children_from_prior && (
              <InfoRow label="Spouse Prior Children" value={intake.spouse_children_from_prior?.toString()} />
            )}
            {intake.client_considering_trust && (
              <Box sx={{ mt: 1 }}>
                <Chip
                  label="Considering a Trust"
                  size="small"
                  sx={{
                    bgcolor: colors.warningAmberLight,
                    color: colors.warningAmber,
                    border: `1px solid ${colors.warningAmber}`,
                    fontFamily: '"Jost", sans-serif',
                    fontSize: '11px', fontWeight: 600,
                  }}
                />
              </Box>
            )}
          </Grid>
        </Grid>
      </Box>

      {/* ── 2. Current Estate Plan — Client ── */}
      <ReportSectionTitle>
        Current Estate Plan — {intake.client_name}
      </ReportSectionTitle>
      {renderEstatePlanStatus(clientPlan, intake.client_name)}

      {/* ── 3. Current Estate Plan — Spouse ── */}
      {hasSpouse && intake.spouse_name && (
        <>
          <ReportSectionTitle>
            Current Estate Plan — {intake.spouse_name}
          </ReportSectionTitle>
          {renderEstatePlanStatus(spousePlan, intake.spouse_name)}
        </>
      )}

      {/* ── 4. Distribution Plan ── */}
      <ReportSectionTitle>Distribution Plan</ReportSectionTitle>

      {/* Distribution preferences from intake */}
      <Box sx={{
        bgcolor: colors.cream, border: `1px solid ${colors.parchment}`,
        borderRadius: 1.5, px: 2, py: 1.5, mb: 2,
      }}>
        <Typography sx={{
          fontFamily: '"Jost", sans-serif', fontSize: '12px',
          fontWeight: 700, color: colors.inkLight,
          textTransform: 'uppercase', letterSpacing: '0.04em', mb: 1,
        }}>
          Stated Preferences
        </Typography>
        <Grid container spacing={1}>
          {[
            { label: 'Provide for spouse, then children', val: intake.provide_for_spouse_then_children },
            { label: 'Treat all children equally',        val: intake.treat_all_children_equally },
            { label: 'Children as predeceased beneficiaries', val: intake.children_predeceased_beneficiaries },
            { label: 'Leave share to grandchildren',      val: intake.leave_to_grandchildren },
            { label: 'Treat all grandchildren equally',   val: intake.treat_all_grandchildren_equally },
          ].map(({ label, val }) => val !== undefined && (
            <Grid item xs={12} sm={6} key={label}>
              <StatusPill label={label} status={val ? 'yes' : 'no'} />
            </Grid>
          ))}
        </Grid>
        <InfoRow label="Distribution Age"       value={intake.distribution_age} />
        <InfoRow label="Children Equality Note" value={intake.children_equality_explanation} />
        <InfoRow label="Grandchildren Amount"   value={intake.grandchildren_amount} />
        <InfoRow label="Grandchildren Dist. Age" value={intake.grandchildren_distribution_age} />
      </Box>

      {/* Client distribution plan */}
      {clientDistPlan && (
        <Box sx={{ mb: 1.5 }}>
          <Typography sx={{
            fontFamily: '"Jost", sans-serif', fontSize: '12px',
            fontWeight: 700, color: colors.inkLight,
            textTransform: 'uppercase', letterSpacing: '0.04em', mb: 0.75,
            borderLeft: `3px solid ${colors.accentWarm}`, pl: 1,
          }}>
            {intake.client_name}
          </Typography>
          {renderDistributionPlan(clientDistPlan, intake.client_name)}
        </Box>
      )}

      {hasSpouse && spouseDistPlan && (
        <Box sx={{ mb: 1.5 }}>
          <Typography sx={{
            fontFamily: '"Jost", sans-serif', fontSize: '12px',
            fontWeight: 700, color: colors.inkLight,
            textTransform: 'uppercase', letterSpacing: '0.04em', mb: 0.75,
            borderLeft: `3px solid ${colors.accentWarm}`, pl: 1,
          }}>
            {intake.spouse_name}
          </Typography>
          {renderDistributionPlan(spouseDistPlan, intake.spouse_name || 'Spouse')}
        </Box>
      )}

      {/* ── 5. Beneficiaries ── */}
      <ReportSectionTitle>Beneficiaries</ReportSectionTitle>
      {beneficiaries.length === 0 ? (
        <EmptyState message="No beneficiaries on record." />
      ) : (
        <>
          <TableHeader
            cols={['Name', 'Relationship', 'Age', 'Distribution Type', 'Method']}
            widths={['2fr', '1.5fr', '0.75fr', '1.5fr', '1.5fr']}
          />
          {beneficiaries
            .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
            .map((b, i) => (
              <TableRow
                key={b.id} zebra={i % 2 === 1}
                widths={['2fr', '1.5fr', '0.75fr', '1.5fr', '1.5fr']}
                cols={[
                  b.name,
                  b.relationship === 'Other' ? (b.relationship_other || 'Other') : (b.relationship || '—'),
                  b.age || '—',
                  b.distribution_type || '—',
                  b.distribution_method || '—',
                ]}
              />
            ))}
        </>
      )}

      {/* ── 6. Children ── */}
      {children.length > 0 && (
        <>
          <ReportSectionTitle>Children</ReportSectionTitle>
          <TableHeader
            cols={['Name', 'Age', 'Relationship', 'Distribution', 'Disinherit', 'Notes']}
            widths={['2fr', '0.75fr', '1fr', '1.5fr', '0.75fr', '2fr']}
          />
          {children
            .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
            .map((c, i) => (
              <TableRow
                key={c.id} zebra={i % 2 === 1}
                widths={['2fr', '0.75fr', '1fr', '1.5fr', '0.75fr', '2fr']}
                cols={[
                  c.name,
                  c.age || (c.birth_date ? formatDate(c.birth_date) : '—'),
                  c.relationship || '—',
                  c.distribution_type || '—',
                  c.disinherit ? (
                    <Typography sx={{
                      fontFamily: '"Jost", sans-serif', fontSize: '12px',
                      color: colors.alertRed, fontWeight: 700,
                    }}>
                      Yes
                    </Typography>
                  ) : 'No',
                  c.comments || '—',
                ]}
              />
            ))}
        </>
      )}

      {/* ── 7. Specific Gifts ── */}
      {specificGifts.length > 0 && (
        <>
          <ReportSectionTitle>Specific Asset Gifts</ReportSectionTitle>
          <TableHeader
            cols={['Recipient', 'Relationship', 'Description', 'Notes']}
            widths={['1.5fr', '1fr', '2fr', '2fr']}
          />
          {specificGifts
            .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
            .map((g, i) => (
              <TableRow
                key={g.id} zebra={i % 2 === 1}
                widths={['1.5fr', '1fr', '2fr', '2fr']}
                cols={[
                  g.recipient_name || '—',
                  g.relationship || '—',
                  g.description || '—',
                  g.notes || '—',
                ]}
              />
            ))}
        </>
      )}

      {/* ── 8. Cash Gifts ── */}
      {cashGifts.length > 0 && (
        <>
          <ReportSectionTitle>Cash Gifts</ReportSectionTitle>
          <TableHeader
            cols={['Beneficiary', 'Relationship', 'Amount']}
            widths={['2fr', '2fr', '1fr']}
          />
          {cashGifts
            .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
            .map((g, i) => (
              <TableRow
                key={g.id} zebra={i % 2 === 1}
                widths={['2fr', '2fr', '1fr']}
                cols={[g.beneficiary_name || '—', g.relationship || '—', g.amount || '—']}
              />
            ))}
        </>
      )}

      {/* ── 9. Charitable Organizations ── */}
      {charities.length > 0 && (
        <>
          <ReportSectionTitle>Charitable Gifts</ReportSectionTitle>
          <TableHeader
            cols={['Organization', 'Address', 'Amount']}
            widths={['2fr', '3fr', '1fr']}
          />
          {charities
            .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
            .map((c, i) => (
              <TableRow
                key={c.id} zebra={i % 2 === 1}
                widths={['2fr', '3fr', '1fr']}
                cols={[c.name || '—', c.address || '—', c.amount || '—']}
              />
            ))}
        </>
      )}

      {/* ── 10. Beneficiary Concern Flags ── */}
      {concerns.length > 0 && (
        <>
          <ReportSectionTitle>Beneficiary Concern Flags</ReportSectionTitle>
          <Box sx={{
            bgcolor: colors.warningAmberLight,
            border: `1px solid ${colors.warningAmber}`,
            borderRadius: 1, px: 2, py: 1, mb: 1.5,
          }}>
            <Typography sx={{
              fontFamily: '"Jost", sans-serif', fontSize: '11px',
              color: colors.warningAmber, fontWeight: 600, mb: 1,
            }}>
              The following concerns were flagged during intake and may require
              special planning provisions such as supplemental needs trusts,
              spendthrift provisions, or incentive clauses.
            </Typography>
            {concerns.map((c) => (
              <ConcernFlag
                key={c.label}
                label={c.label}
                present={c.present}
                explanation={c.explanation}
              />
            ))}
            {intake.beneficiary_notes && (
              <Box sx={{ mt: 1 }}>
                <InfoRow label="Additional Notes" value={intake.beneficiary_notes} />
              </Box>
            )}
          </Box>
        </>
      )}

      {/* ── Disclaimer ── */}
      <Box sx={{
        mt: 4, pt: 1.5,
        borderTop: `1px dashed ${colors.parchment}`,
        textAlign: 'center',
      }}>
        <Typography sx={{
          fontFamily: '"Jost", sans-serif', fontSize: '10px',
          color: colors.inkLight, fontStyle: 'italic',
        }}>
          This report is a summary of self-reported estate planning information and does not
          constitute legal advice. Consult a qualified estate planning attorney regarding your
          specific circumstances. This document is confidential and intended for authorized
          recipients only.
        </Typography>
      </Box>
    </ReportLayout>
  );
};

export default EstatePlanningOverview;

/* ─────────────────────────────────────────────────────────────────────────────
 * USAGE EXAMPLE:
 *
 * import EstatePlanningOverview from './reports/EstatePlanningOverview';
 *
 * const { data: intake }           = await supabase.from('folio_intakes').select('*').eq('id', intakeId).single();
 * const { data: currentEstatePlans}= await supabase.from('folio_current_estate_plan').select('*').eq('intake_id', intakeId);
 * const { data: distributionPlans }= await supabase.from('folio_distribution_plans').select('*').eq('intake_id', intakeId);
 * const { data: beneficiaries }    = await supabase.from('folio_beneficiaries').select('*').eq('intake_id', intakeId).order('sort_order');
 * const { data: children }         = await supabase.from('folio_children').select('*').eq('intake_id', intakeId).order('sort_order');
 * const { data: specificGifts }    = await supabase.from('folio_specific_gifts').select('*').eq('intake_id', intakeId).order('sort_order');
 * const { data: cashGifts }        = await supabase.from('folio_cash_gifts').select('*').eq('intake_id', intakeId).order('sort_order');
 * const { data: charities }        = await supabase.from('folio_charities').select('*').eq('intake_id', intakeId).order('sort_order');
 *
 * <EstatePlanningOverview
 *   intake={intake}
 *   currentEstatePlans={currentEstatePlans}
 *   distributionPlans={distributionPlans}
 *   beneficiaries={beneficiaries}
 *   children={children}
 *   specificGifts={specificGifts}
 *   cashGifts={cashGifts}
 *   charities={charities}
 *   dateCreated={intake.created_at}
 *   dateUpdated={intake.updated_at}
 * />
 * ───────────────────────────────────────────────────────────────────────────── */