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
};

// ─── Currency formatter ───────────────────────────────────────────────────────
const fmt = (n?: number | null): string => {
  if (n === null || n === undefined) return '—';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n);
};

const sum = (arr: (number | undefined | null)[]): number =>
  arr.reduce<number>((acc, v) => acc + (v ?? 0), 0);

// ─── Types matching your Supabase schema ─────────────────────────────────────

interface FolioIntake {
  client_name: string;
  spouse_name?: string;
  marital_status?: string;
}

/** folio_life_insurance */
interface LifeInsurance {
  id: string;
  owner?: string;
  company?: string;
  policy_type?: string;
  face_amount?: number;
  death_benefit?: number;
  cash_value?: number;
  insured?: string;
  has_beneficiaries?: boolean;
  primary_beneficiaries?: string[];
  primary_distribution_type?: string;
  secondary_beneficiaries?: string[];
  secondary_distribution_type?: string;
  notes?: string;
  sort_order?: number;
}

/** folio_insurance_coverage — home, auto, umbrella, etc. */
interface InsuranceCoverage {
  id: string;
  person?: string;
  coverage_type?: string;
  policy_no?: string;
  provider?: string;
  paid_by?: string;
  monthly_cost?: number;
  contact_name?: string;
  contact_address?: string;
  contact_phone?: string;
  contact_email?: string;
  contact_website?: string;
  liability_limits?: string;
  has_collision?: boolean;
  has_comprehensive?: boolean;
  comprehensive_deductible?: number;
  notes?: string;
  sort_order?: number;
}

/** folio_medical_insurance */
interface MedicalInsurance {
  id: string;
  person?: string;
  insurance_type?: string;
  provider?: string;
  policy_no?: string;
  paid_by?: string;
  monthly_cost?: number;
  contact_name?: string;
  contact_address?: string;
  contact_phone?: string;
  contact_email?: string;
  contact_website?: string;
  notes?: string;
  sort_order?: number;
}

/** folio_client_medical_insurance (single-row Medicare/supplement record) */
interface ClientMedicalInsurance {
  medicare_part_b_deduction?: string;
  medicare_coverage_type?: string;
  medicare_plan_name?: string;
  medicare_coverage_cost?: string;
  private_insurance_description?: string;
  private_insurance_cost?: string;
  other_insurance_description?: string;
  other_insurance_cost?: string;
}

/** folio_spouse_medical_insurance */
interface SpouseMedicalInsurance {
  medicare_part_b_deduction?: string;
  medicare_coverage_type?: string;
  medicare_plan_name?: string;
  medicare_coverage_cost?: string;
  private_insurance_description?: string;
  private_insurance_cost?: string;
  other_insurance_description?: string;
  other_insurance_cost?: string;
}

/** folio_long_term_care (insurance fields only) */
interface LongTermCare {
  has_ltc_insurance?: boolean;
  ltc_insurance_company?: string;
  ltc_insurance_daily_benefit?: string;
  ltc_insurance_term?: string;
  ltc_insurance_maximum?: string;
  ltc_insurance_care_level?: string;
  ltc_insurance_details?: string;
  has_medigap?: boolean;
  medigap_details?: string;
}

interface InsuranceSummaryProps {
  intake: FolioIntake;
  lifeInsurance?: LifeInsurance[];
  insuranceCoverage?: InsuranceCoverage[];
  medicalInsurance?: MedicalInsurance[];
  clientMedicalInsurance?: ClientMedicalInsurance | null;
  spouseMedicalInsurance?: SpouseMedicalInsurance | null;
  longTermCare?: LongTermCare | null;
  dateCreated?: string;
  dateUpdated?: string;
}

// ─── Reusable sub-components ─────────────────────────────────────────────────

const EmptyState: React.FC<{ message: string }> = ({ message }) => (
  <Typography
    sx={{
      fontFamily: '"Jost", sans-serif',
      fontSize: '12px',
      color: colors.inkLight,
      fontStyle: 'italic',
      py: 1,
    }}
  >
    {message}
  </Typography>
);

const InfoRow: React.FC<{ label: string; value?: string | null }> = ({ label, value }) => {
  if (!value) return null;
  return (
    <Box sx={{ display: 'flex', gap: 1, mb: 0.5 }}>
      <Typography
        sx={{
          fontFamily: '"Jost", sans-serif',
          fontSize: '12px',
          fontWeight: 600,
          color: colors.inkLight,
          minWidth: 160,
          flexShrink: 0,
        }}
      >
        {label}:
      </Typography>
      <Typography
        sx={{
          fontFamily: '"Jost", sans-serif',
          fontSize: '12px',
          color: colors.ink,
        }}
      >
        {value}
      </Typography>
    </Box>
  );
};

const TableHeader: React.FC<{ cols: string[]; widths?: string[] }> = ({ cols, widths }) => (
  <Box
    sx={{
      display: 'grid',
      gridTemplateColumns: widths ? widths.join(' ') : `repeat(${cols.length}, 1fr)`,
      bgcolor: colors.creamDark,
      borderRadius: '4px 4px 0 0',
      px: 1.5,
      py: 0.75,
      border: `1px solid ${colors.parchment}`,
      borderBottom: `2px solid ${colors.accentWarm}`,
    }}
  >
    {cols.map((col) => (
      <Typography
        key={col}
        sx={{
          fontFamily: '"Jost", sans-serif',
          fontSize: '11px',
          fontWeight: 700,
          color: colors.accent,
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
        }}
      >
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
  <Box
    sx={{
      display: 'grid',
      gridTemplateColumns: widths ? widths.join(' ') : `repeat(${cols.length}, 1fr)`,
      px: 1.5,
      py: 0.75,
      bgcolor: zebra ? colors.cream : '#fff',
      border: `1px solid ${colors.parchment}`,
      borderTop: 'none',
      '&:last-child': { borderRadius: '0 0 4px 4px' },
    }}
  >
    {cols.map((col, i) => (
      <Typography
        key={i}
        component="div"
        sx={{
          fontFamily: '"Jost", sans-serif',
          fontSize: '12px',
          color: colors.ink,
        }}
      >
        {col ?? '—'}
      </Typography>
    ))}
  </Box>
);

const SubtotalRow: React.FC<{
  label: string;
  value: number;
  widths?: string[];
  colCount: number;
  valueColIndex?: number;
}> = ({ label, value, widths, colCount, valueColIndex }) => {
  const valCol = valueColIndex ?? colCount - 1;
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: widths ? widths.join(' ') : `repeat(${colCount}, 1fr)`,
        px: 1.5,
        py: 0.75,
        bgcolor: colors.creamDark,
        border: `1px solid ${colors.parchment}`,
        borderTop: `2px solid ${colors.accentWarm}`,
        borderRadius: '0 0 4px 4px',
      }}
    >
      {Array.from({ length: colCount }).map((_, i) => (
        <Typography
          key={i}
          sx={{
            fontFamily: '"Jost", sans-serif',
            fontSize: '12px',
            fontWeight: 700,
            color: colors.accent,
          }}
        >
          {i === 0 ? label : i === valCol ? fmt(value) : ''}
        </Typography>
      ))}
    </Box>
  );
};

/** Policy detail card for richer display */
const PolicyCard: React.FC<{
  title: string;
  subtitle?: string;
  badge?: string;
  children: React.ReactNode;
}> = ({ title, subtitle, badge, children }) => (
  <Box
    sx={{
      border: `1px solid ${colors.parchment}`,
      borderRadius: 1.5,
      overflow: 'hidden',
      mb: 1.5,
      '@media print': { breakInside: 'avoid' },
    }}
  >
    <Box
      sx={{
        bgcolor: colors.creamDark,
        px: 2,
        py: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: `1px solid ${colors.parchment}`,
      }}
    >
      <Box>
        <Typography
          sx={{
            fontFamily: '"Jost", sans-serif',
            fontSize: '13px',
            fontWeight: 700,
            color: colors.ink,
          }}
        >
          {title}
        </Typography>
        {subtitle && (
          <Typography
            sx={{
              fontFamily: '"Jost", sans-serif',
              fontSize: '11px',
              color: colors.inkLight,
            }}
          >
            {subtitle}
          </Typography>
        )}
      </Box>
      {badge && (
        <Chip
          label={badge}
          size="small"
          sx={{
            bgcolor: colors.accentWarm,
            color: '#fff',
            fontFamily: '"Jost", sans-serif',
            fontSize: '10px',
            fontWeight: 600,
            height: 20,
          }}
        />
      )}
    </Box>
    <Box sx={{ px: 2, py: 1.25, bgcolor: '#fff' }}>{children}</Box>
  </Box>
);

/** Monthly cost totals banner */
const CostSummaryBanner: React.FC<{
  rows: { label: string; monthly: number }[];
}> = ({ rows }) => {
  const filtered = rows.filter((r) => r.monthly > 0);
  if (filtered.length === 0) return null;
  const grandMonthly = sum(filtered.map((r) => r.monthly));
  const grandAnnual = grandMonthly * 12;

  return (
    <Box
      sx={{
        mt: 3,
        border: `2px solid ${colors.accentWarm}`,
        borderRadius: 2,
        overflow: 'hidden',
        '@media print': { breakInside: 'avoid' },
      }}
    >
      <Box sx={{ bgcolor: colors.ink, px: 3, py: 1.25 }}>
        <Typography
          sx={{
            fontFamily: '"Jost", sans-serif',
            fontWeight: 700,
            fontSize: '13px',
            color: colors.accentWarm,
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
          }}
        >
          Insurance Cost Summary
        </Typography>
      </Box>
      <Box sx={{ bgcolor: colors.cream, px: 3, py: 2 }}>
        {/* Category breakdown */}
        <Box sx={{ mb: 2 }}>
          <TableHeader
            cols={['Coverage Category', 'Monthly Premium', 'Annual Premium']}
            widths={['3fr', '1fr', '1fr']}
          />
          {filtered.map((row, i) => (
            <TableRow
              key={row.label}
              zebra={i % 2 === 1}
              widths={['3fr', '1fr', '1fr']}
              cols={[row.label, fmt(row.monthly), fmt(row.monthly * 12)]}
            />
          ))}
          <SubtotalRow
            label="Total Insurance Costs"
            value={grandMonthly}
            widths={['3fr', '1fr', '1fr']}
            colCount={3}
            valueColIndex={1}
          />
        </Box>
        {/* Grand totals */}
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Typography
              sx={{
                fontFamily: '"Jost", sans-serif',
                fontSize: '11px',
                fontWeight: 600,
                color: colors.inkLight,
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                mb: 0.25,
              }}
            >
              Total Monthly Premiums
            </Typography>
            <Typography
              sx={{
                fontFamily: '"Jost", sans-serif',
                fontSize: '24px',
                fontWeight: 700,
                color: colors.ink,
              }}
            >
              {fmt(grandMonthly)}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography
              sx={{
                fontFamily: '"Jost", sans-serif',
                fontSize: '11px',
                fontWeight: 600,
                color: colors.inkLight,
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                mb: 0.25,
              }}
            >
              Total Annual Premiums
            </Typography>
            <Typography
              sx={{
                fontFamily: '"Jost", sans-serif',
                fontSize: '24px',
                fontWeight: 700,
                color: colors.accent,
              }}
            >
              {fmt(grandAnnual)}
            </Typography>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const InsuranceSummary: React.FC<InsuranceSummaryProps> = ({
  intake,
  lifeInsurance = [],
  insuranceCoverage = [],
  medicalInsurance = [],
  clientMedicalInsurance,
  spouseMedicalInsurance,
  longTermCare,
  dateCreated,
  dateUpdated,
}) => {
  const hasSpouse = !!intake.spouse_name;

  // Group insuranceCoverage by coverage_type
  const coverageByType: Record<string, InsuranceCoverage[]> = {};
  insuranceCoverage.forEach((c) => {
    const type = c.coverage_type || 'Other';
    if (!coverageByType[type]) coverageByType[type] = [];
    coverageByType[type].push(c);
  });

  // Monthly cost totals by category
  const lifeMonthly = 0; // life insurance premiums not stored; note below
  const medicalMonthly = sum(medicalInsurance.map((m) => m.monthly_cost));
  const coverageMonthly = sum(insuranceCoverage.map((c) => c.monthly_cost));

  const costRows = [
    { label: 'Medical / Health Insurance', monthly: medicalMonthly },
    { label: 'Home, Auto & Other Coverage', monthly: coverageMonthly },
  ];

  const beneficiaryList = (arr?: string[]) =>
    arr && arr.length > 0 ? arr.join(', ') : '—';

  return (
    <ReportLayout
      title="Insurance Summary"
      ownerName={intake.client_name}
      dateCreated={dateCreated}
      dateUpdated={dateUpdated}
    >

      {/* ── 1. Life Insurance ── */}
      <ReportSectionTitle>Life Insurance</ReportSectionTitle>
      {lifeInsurance.length === 0 ? (
        <EmptyState message="No life insurance policies on record." />
      ) : (
        lifeInsurance
          .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
          .map((policy) => (
            <PolicyCard
              key={policy.id}
              title={[policy.company, policy.policy_type].filter(Boolean).join(' — ')}
              subtitle={policy.insured ? `Insured: ${policy.insured}` : undefined}
              badge={policy.policy_type || undefined}
            >
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <InfoRow label="Owner" value={policy.owner} />
                  <InfoRow label="Company" value={policy.company} />
                  <InfoRow label="Policy Type" value={policy.policy_type} />
                  <InfoRow label="Insured" value={policy.insured} />
                  <InfoRow label="Face Amount" value={fmt(policy.face_amount)} />
                  <InfoRow label="Death Benefit" value={fmt(policy.death_benefit)} />
                  <InfoRow label="Cash Value" value={fmt(policy.cash_value)} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  {policy.has_beneficiaries && (
                    <>
                      <InfoRow
                        label="Primary Beneficiaries"
                        value={beneficiaryList(policy.primary_beneficiaries)}
                      />
                      <InfoRow
                        label="Primary Distribution"
                        value={policy.primary_distribution_type}
                      />
                      <InfoRow
                        label="Secondary Beneficiaries"
                        value={beneficiaryList(policy.secondary_beneficiaries)}
                      />
                      <InfoRow
                        label="Secondary Distribution"
                        value={policy.secondary_distribution_type}
                      />
                    </>
                  )}
                  <InfoRow label="Notes" value={policy.notes} />
                </Grid>
              </Grid>
            </PolicyCard>
          ))
      )}

      {/* ── 2. Medical / Health Insurance ── */}
      <ReportSectionTitle>Medical &amp; Health Insurance</ReportSectionTitle>

      {/* Medicare summary from folio_client_medical_insurance */}
      {clientMedicalInsurance && (
        <PolicyCard
          title={`${intake.client_name} — Medicare & Supplement`}
          badge="Client"
        >
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <InfoRow label="Medicare Coverage Type" value={clientMedicalInsurance.medicare_coverage_type} />
              <InfoRow label="Medicare Plan Name" value={clientMedicalInsurance.medicare_plan_name} />
              <InfoRow label="Medicare Coverage Cost" value={clientMedicalInsurance.medicare_coverage_cost} />
              <InfoRow label="Part B Deduction" value={clientMedicalInsurance.medicare_part_b_deduction} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <InfoRow label="Private Insurance" value={clientMedicalInsurance.private_insurance_description} />
              <InfoRow label="Private Insurance Cost" value={clientMedicalInsurance.private_insurance_cost} />
              <InfoRow label="Other Insurance" value={clientMedicalInsurance.other_insurance_description} />
              <InfoRow label="Other Insurance Cost" value={clientMedicalInsurance.other_insurance_cost} />
            </Grid>
          </Grid>
        </PolicyCard>
      )}

      {/* Spouse Medicare summary */}
      {hasSpouse && spouseMedicalInsurance && (
        <PolicyCard
          title={`${intake.spouse_name} — Medicare & Supplement`}
          badge="Spouse"
          subtitle="Spouse medical insurance"
        >
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <InfoRow label="Medicare Coverage Type" value={spouseMedicalInsurance.medicare_coverage_type} />
              <InfoRow label="Medicare Plan Name" value={spouseMedicalInsurance.medicare_plan_name} />
              <InfoRow label="Medicare Coverage Cost" value={spouseMedicalInsurance.medicare_coverage_cost} />
              <InfoRow label="Part B Deduction" value={spouseMedicalInsurance.medicare_part_b_deduction} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <InfoRow label="Private Insurance" value={spouseMedicalInsurance.private_insurance_description} />
              <InfoRow label="Private Insurance Cost" value={spouseMedicalInsurance.private_insurance_cost} />
              <InfoRow label="Other Insurance" value={spouseMedicalInsurance.other_insurance_description} />
              <InfoRow label="Other Insurance Cost" value={spouseMedicalInsurance.other_insurance_cost} />
            </Grid>
          </Grid>
        </PolicyCard>
      )}

      {/* Additional medical insurance from folio_medical_insurance */}
      {medicalInsurance.length > 0 && (
        <>
          <TableHeader
            cols={['Person', 'Type', 'Provider', 'Policy No.', 'Paid By', 'Monthly Cost', 'Contact Phone']}
            widths={['1fr', '1fr', '1.5fr', '1fr', '1fr', '1fr', '1fr']}
          />
          {medicalInsurance
            .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
            .map((m, i) => (
              <TableRow
                key={m.id}
                zebra={i % 2 === 1}
                widths={['1fr', '1fr', '1.5fr', '1fr', '1fr', '1fr', '1fr']}
                cols={[
                  m.person || '—',
                  m.insurance_type || '—',
                  m.provider || '—',
                  m.policy_no || '—',
                  m.paid_by || '—',
                  m.monthly_cost ? fmt(m.monthly_cost) : '—',
                  m.contact_phone || '—',
                ]}
              />
            ))}
          <SubtotalRow
            label="Medical Insurance Monthly Total"
            value={medicalMonthly}
            widths={['1fr', '1fr', '1.5fr', '1fr', '1fr', '1fr', '1fr']}
            colCount={7}
            valueColIndex={5}
          />
        </>
      )}

      {!clientMedicalInsurance && !spouseMedicalInsurance && medicalInsurance.length === 0 && (
        <EmptyState message="No medical insurance on record." />
      )}

      {/* ── 3. Long-Term Care Insurance ── */}
      <ReportSectionTitle>Long-Term Care Insurance</ReportSectionTitle>
      {!longTermCare?.has_ltc_insurance ? (
        <EmptyState message="No long-term care insurance on record." />
      ) : (
        <PolicyCard
          title={longTermCare.ltc_insurance_company || 'Long-Term Care Policy'}
          badge="LTC"
        >
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <InfoRow label="Company" value={longTermCare.ltc_insurance_company} />
              <InfoRow label="Daily Benefit" value={longTermCare.ltc_insurance_daily_benefit} />
              <InfoRow label="Benefit Term" value={longTermCare.ltc_insurance_term} />
              <InfoRow label="Maximum Benefit" value={longTermCare.ltc_insurance_maximum} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <InfoRow label="Care Level Covered" value={longTermCare.ltc_insurance_care_level} />
              <InfoRow label="Details" value={longTermCare.ltc_insurance_details} />
            </Grid>
          </Grid>
        </PolicyCard>
      )}

      {/* Medigap */}
      {longTermCare?.has_medigap && longTermCare.medigap_details && (
        <Box
          sx={{
            px: 2,
            py: 1.25,
            bgcolor: colors.cream,
            border: `1px solid ${colors.parchment}`,
            borderRadius: 1,
            mb: 1.5,
          }}
        >
          <Typography
            sx={{
              fontFamily: '"Jost", sans-serif',
              fontSize: '12px',
              fontWeight: 600,
              color: colors.ink,
              mb: 0.25,
            }}
          >
            Medigap / Medicare Supplement
          </Typography>
          <Typography
            sx={{
              fontFamily: '"Jost", sans-serif',
              fontSize: '12px',
              color: colors.inkLight,
            }}
          >
            {longTermCare.medigap_details}
          </Typography>
        </Box>
      )}

      {/* ── 4. Property, Auto & Other Coverage ── */}
      <ReportSectionTitle>Property, Auto &amp; Other Coverage</ReportSectionTitle>
      {insuranceCoverage.length === 0 ? (
        <EmptyState message="No property or other insurance coverage on record." />
      ) : (
        Object.entries(coverageByType).map(([type, policies]) => (
          <Box key={type} sx={{ mb: 2 }}>
            {/* Category label */}
            <Typography
              sx={{
                fontFamily: '"Jost", sans-serif',
                fontSize: '11px',
                fontWeight: 700,
                color: colors.inkLight,
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                mb: 0.5,
              }}
            >
              {type}
            </Typography>

            {policies.map((policy) => (
              <PolicyCard
                key={policy.id}
                title={policy.provider || type}
                subtitle={policy.person ? `Insured: ${policy.person}` : undefined}
                badge={policy.coverage_type || undefined}
              >
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <InfoRow label="Person / Property" value={policy.person} />
                    <InfoRow label="Provider" value={policy.provider} />
                    <InfoRow label="Policy Number" value={policy.policy_no} />
                    <InfoRow label="Paid By" value={policy.paid_by} />
                    <InfoRow
                      label="Monthly Cost"
                      value={policy.monthly_cost ? fmt(policy.monthly_cost) : undefined}
                    />
                    <InfoRow
                      label="Annual Cost"
                      value={policy.monthly_cost ? fmt(policy.monthly_cost * 12) : undefined}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <InfoRow label="Liability Limits" value={policy.liability_limits} />
                    {policy.has_collision !== undefined && (
                      <InfoRow
                        label="Collision Coverage"
                        value={policy.has_collision ? 'Yes' : 'No'}
                      />
                    )}
                    {policy.has_comprehensive !== undefined && (
                      <InfoRow
                        label="Comprehensive Coverage"
                        value={policy.has_comprehensive ? 'Yes' : 'No'}
                      />
                    )}
                    <InfoRow
                      label="Comprehensive Deductible"
                      value={
                        policy.comprehensive_deductible
                          ? fmt(policy.comprehensive_deductible)
                          : undefined
                      }
                    />
                    <InfoRow label="Contact Name" value={policy.contact_name} />
                    <InfoRow label="Contact Phone" value={policy.contact_phone} />
                    <InfoRow label="Contact Email" value={policy.contact_email} />
                    <InfoRow label="Website" value={policy.contact_website} />
                    <InfoRow label="Notes" value={policy.notes} />
                  </Grid>
                </Grid>
              </PolicyCard>
            ))}
          </Box>
        ))
      )}

      {/* ── Cost Summary Banner ── */}
      <CostSummaryBanner rows={costRows} />

      {/* ── Disclaimer ── */}
      <Box
        sx={{
          mt: 3,
          pt: 1.5,
          borderTop: `1px dashed ${colors.parchment}`,
          textAlign: 'center',
        }}
      >
        <Typography
          sx={{
            fontFamily: '"Jost", sans-serif',
            fontSize: '10px',
            color: colors.inkLight,
            fontStyle: 'italic',
          }}
        >
          Policy details are self-reported. Verify current coverage terms directly with your
          insurance providers. This report is confidential and intended for authorized recipients
          only.
        </Typography>
      </Box>
    </ReportLayout>
  );
};

export default InsuranceSummary;

/* ─────────────────────────────────────────────────────────────────────────────
 * USAGE EXAMPLE:
 *
 * import InsuranceSummary from './reports/InsuranceSummary';
 *
 * const { data: intake }                  = await supabase.from('folio_intakes').select('*').eq('id', intakeId).single();
 * const { data: lifeInsurance }           = await supabase.from('folio_life_insurance').select('*').eq('intake_id', intakeId).order('sort_order');
 * const { data: insuranceCoverage }       = await supabase.from('folio_insurance_coverage').select('*').eq('intake_id', intakeId).order('sort_order');
 * const { data: medicalInsurance }        = await supabase.from('folio_medical_insurance').select('*').eq('intake_id', intakeId).order('sort_order');
 * const { data: clientMedicalInsurance }  = await supabase.from('folio_client_medical_insurance').select('*').eq('intake_id', intakeId).single();
 * const { data: spouseMedicalInsurance }  = await supabase.from('folio_spouse_medical_insurance').select('*').eq('intake_id', intakeId).single();
 * const { data: longTermCare }            = await supabase.from('folio_long_term_care').select('*').eq('intake_id', intakeId).single();
 *
 * <InsuranceSummary
 *   intake={intake}
 *   lifeInsurance={lifeInsurance}
 *   insuranceCoverage={insuranceCoverage}
 *   medicalInsurance={medicalInsurance}
 *   clientMedicalInsurance={clientMedicalInsurance}
 *   spouseMedicalInsurance={spouseMedicalInsurance}
 *   longTermCare={longTermCare}
 *   dateCreated={intake.created_at}
 *   dateUpdated={intake.updated_at}
 * />
 * ───────────────────────────────────────────────────────────────────────────── */