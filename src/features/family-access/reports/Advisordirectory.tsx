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

// ─── Types matching your Supabase schema ─────────────────────────────────────

interface FolioIntake {
  client_name: string;
  spouse_name?: string;
  marital_status?: string;
  client_cell_phone?: string;
  client_email?: string;
  client_mailing_address?: string;
}

/** folio_advisors */
interface Advisor {
  id: string;
  advisor_type?: string;
  name?: string;
  firm_name?: string;
  phone?: string;
  email?: string;
  address?: string;
  notes?: string;
  sort_order?: number;
}

/** folio_medical_providers */
interface MedicalProvider {
  id: string;
  provider_category: string;
  specialist_type?: string;
  name?: string;
  firm_name?: string;
  phone?: string;
  email?: string;
  address?: string;
  notes?: string;
  sort_order?: number;
}

/** folio_pharmacies */
interface Pharmacy {
  id: string;
  pharmacy_name: string;
  pharmacy_chain?: string;
  phone?: string;
  fax?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  hours?: string;
  pharmacist_name?: string;
  account_number?: string;
  specialty?: boolean;
  mail_order?: boolean;
  is_primary?: boolean;
  is_active?: boolean;
  notes?: string;
  sort_order?: number;
}

interface AdvisorDirectoryProps {
  intake: FolioIntake;
  advisors?: Advisor[];
  medicalProviders?: MedicalProvider[];
  pharmacies?: Pharmacy[];
  dateCreated?: string;
  dateUpdated?: string;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

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
    <Box sx={{ display: 'flex', gap: 1, mb: 0.4 }}>
      <Typography
        sx={{
          fontFamily: '"Jost", sans-serif',
          fontSize: '12px',
          fontWeight: 600,
          color: colors.inkLight,
          minWidth: 100,
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
          wordBreak: 'break-word',
        }}
      >
        {value}
      </Typography>
    </Box>
  );
};

/** Individual directory card for one contact */
const DirectoryCard: React.FC<{
  name?: string;
  title?: string;
  firm?: string;
  badge?: string;
  badgeColor?: string;
  phone?: string;
  fax?: string;
  email?: string;
  address?: string;
  hours?: string;
  notes?: string;
  extraRows?: { label: string; value?: string | null }[];
  chips?: { label: string; color?: string }[];
}> = ({
  name,
  title,
  firm,
  badge,
  badgeColor = colors.accentWarm,
  phone,
  fax,
  email,
  address,
  hours,
  notes,
  extraRows = [],
  chips = [],
}) => (
  <Box
    sx={{
      border: `1px solid ${colors.parchment}`,
      borderRadius: 1.5,
      overflow: 'hidden',
      mb: 1.5,
      '@media print': { breakInside: 'avoid' },
    }}
  >
    {/* Card header */}
    <Box
      sx={{
        bgcolor: colors.creamDark,
        px: 2,
        py: 1,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: 1,
        borderBottom: `1px solid ${colors.parchment}`,
      }}
    >
      <Box sx={{ flexGrow: 1 }}>
        {/* Name */}
        <Typography
          sx={{
            fontFamily: '"Jost", sans-serif',
            fontSize: '14px',
            fontWeight: 700,
            color: colors.ink,
            lineHeight: 1.3,
          }}
        >
          {name || firm || 'Unknown'}
        </Typography>

        {/* Title / specialty */}
        {title && (
          <Typography
            sx={{
              fontFamily: '"Jost", sans-serif',
              fontSize: '11px',
              color: colors.inkLight,
              mt: 0.25,
            }}
          >
            {title}
          </Typography>
        )}

        {/* Firm (only show if different from name) */}
        {firm && firm !== name && (
          <Typography
            sx={{
              fontFamily: '"Jost", sans-serif',
              fontSize: '12px',
              fontWeight: 500,
              color: colors.accent,
              mt: 0.25,
            }}
          >
            {firm}
          </Typography>
        )}

        {/* Optional chips (e.g. Primary, Specialty, Mail Order) */}
        {chips.length > 0 && (
          <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mt: 0.5 }}>
            {chips.map((chip) => (
              <Chip
                key={chip.label}
                label={chip.label}
                size="small"
                sx={{
                  bgcolor: chip.color || colors.parchment,
                  color: chip.color ? '#fff' : colors.inkLight,
                  fontFamily: '"Jost", sans-serif',
                  fontSize: '10px',
                  fontWeight: 600,
                  height: 18,
                }}
              />
            ))}
          </Box>
        )}
      </Box>

      {/* Badge */}
      {badge && (
        <Chip
          label={badge}
          size="small"
          sx={{
            bgcolor: badgeColor,
            color: '#fff',
            fontFamily: '"Jost", sans-serif',
            fontSize: '10px',
            fontWeight: 600,
            height: 20,
            flexShrink: 0,
          }}
        />
      )}
    </Box>

    {/* Card body */}
    <Box sx={{ px: 2, py: 1.25, bgcolor: '#fff' }}>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <InfoRow label="Phone" value={phone} />
          <InfoRow label="Fax" value={fax} />
          <InfoRow label="Email" value={email} />
        </Grid>
        <Grid item xs={12} sm={6}>
          <InfoRow label="Address" value={address} />
          <InfoRow label="Hours" value={hours} />
        </Grid>
        {extraRows.map((r) => (
          <Grid item xs={12} key={r.label}>
            <InfoRow label={r.label} value={r.value} />
          </Grid>
        ))}
        {notes && (
          <Grid item xs={12}>
            <Box
              sx={{
                bgcolor: colors.cream,
                border: `1px solid ${colors.parchment}`,
                borderRadius: 1,
                px: 1.5,
                py: 0.75,
                mt: 0.5,
              }}
            >
              <Typography
                sx={{
                  fontFamily: '"Jost", sans-serif',
                  fontSize: '11px',
                  color: colors.inkLight,
                  fontStyle: 'italic',
                }}
              >
                {notes}
              </Typography>
            </Box>
          </Grid>
        )}
      </Grid>
    </Box>
  </Box>
);

/** Category section with a subtle label above the cards */
const CategorySection: React.FC<{
  label: string;
  children: React.ReactNode;
}> = ({ label, children }) => (
  <Box sx={{ mb: 1 }}>
    <Typography
      sx={{
        fontFamily: '"Jost", sans-serif',
        fontSize: '11px',
        fontWeight: 700,
        color: colors.inkLight,
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
        mb: 0.75,
        mt: 1.5,
        pl: 0.5,
        borderLeft: `3px solid ${colors.accentWarm}`,
        paddingLeft: 1,
      }}
    >
      {label}
    </Typography>
    {children}
  </Box>
);

// ─── Advisor type display order + friendly labels ─────────────────────────────
const ADVISOR_TYPE_ORDER = [
  'Attorney',
  'Estate Planning Attorney',
  'Elder Law Attorney',
  'Financial Advisor',
  'Accountant / CPA',
  'Tax Advisor',
  'Insurance Agent',
  'Real Estate Agent',
  'Business Advisor',
  'Banker',
  'Trust Officer',
  'Other',
];

const MEDICAL_CATEGORY_ORDER = [
  'Primary Care',
  'Specialist',
  'Dentist',
  'Mental Health',
  'Vision',
  'Physical Therapy',
  'Home Health',
  'Hospice',
  'Hospital',
  'Other',
];

// ─── Main Component ───────────────────────────────────────────────────────────

const AdvisorDirectory: React.FC<AdvisorDirectoryProps> = ({
  intake,
  advisors = [],
  medicalProviders = [],
  pharmacies = [],
  dateCreated,
  dateUpdated,
}) => {
  // Group advisors by type, preserving display order
  const advisorsByType: Record<string, Advisor[]> = {};
  advisors.forEach((a) => {
    const type = a.advisor_type || 'Other';
    if (!advisorsByType[type]) advisorsByType[type] = [];
    advisorsByType[type].push(a);
  });

  // Sort advisor types: known order first, then alphabetical for unknowns
  const sortedAdvisorTypes = [
    ...ADVISOR_TYPE_ORDER.filter((t) => advisorsByType[t]),
    ...Object.keys(advisorsByType)
      .filter((t) => !ADVISOR_TYPE_ORDER.includes(t))
      .sort(),
  ];

  // Group medical providers by category
  const providersByCategory: Record<string, MedicalProvider[]> = {};
  medicalProviders.forEach((p) => {
    const cat = p.provider_category || 'Other';
    if (!providersByCategory[cat]) providersByCategory[cat] = [];
    providersByCategory[cat].push(p);
  });

  // Sort medical categories: known order first
  const sortedMedicalCategories = [
    ...MEDICAL_CATEGORY_ORDER.filter((c) => providersByCategory[c]),
    ...Object.keys(providersByCategory)
      .filter((c) => !MEDICAL_CATEGORY_ORDER.includes(c))
      .sort(),
  ];

  const activePharmacies = pharmacies
    .filter((p) => p.is_active !== false)
    .sort((a, b) => {
      if (a.is_primary && !b.is_primary) return -1;
      if (!a.is_primary && b.is_primary) return 1;
      return (a.sort_order ?? 0) - (b.sort_order ?? 0);
    });

  return (
    <ReportLayout
      title="Advisor Directory"
      ownerName={intake.client_name}
      dateCreated={dateCreated}
      dateUpdated={dateUpdated}
    >

      {/* ── Quick-reference owner info ── */}
      <Box
        sx={{
          bgcolor: colors.cream,
          border: `1px solid ${colors.parchment}`,
          borderRadius: 1.5,
          px: 2.5,
          py: 1.5,
          mb: 2.5,
          display: 'flex',
          gap: 4,
          flexWrap: 'wrap',
          '@media print': { breakInside: 'avoid' },
        }}
      >
        <Box>
          <Typography
            sx={{
              fontFamily: '"Jost", sans-serif',
              fontSize: '11px',
              fontWeight: 700,
              color: colors.inkLight,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              mb: 0.25,
            }}
          >
            Folio Owner
          </Typography>
          <Typography
            sx={{
              fontFamily: '"Jost", sans-serif',
              fontSize: '15px',
              fontWeight: 700,
              color: colors.ink,
            }}
          >
            {intake.client_name}
          </Typography>
          {intake.spouse_name && (
            <Typography
              sx={{
                fontFamily: '"Jost", sans-serif',
                fontSize: '12px',
                color: colors.inkLight,
              }}
            >
              {intake.spouse_name} (Spouse)
            </Typography>
          )}
        </Box>
        {intake.client_cell_phone && (
          <Box>
            <Typography
              sx={{
                fontFamily: '"Jost", sans-serif',
                fontSize: '11px',
                fontWeight: 700,
                color: colors.inkLight,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                mb: 0.25,
              }}
            >
              Phone
            </Typography>
            <Typography
              sx={{
                fontFamily: '"Jost", sans-serif',
                fontSize: '13px',
                color: colors.ink,
              }}
            >
              {intake.client_cell_phone}
            </Typography>
          </Box>
        )}
        {intake.client_email && (
          <Box>
            <Typography
              sx={{
                fontFamily: '"Jost", sans-serif',
                fontSize: '11px',
                fontWeight: 700,
                color: colors.inkLight,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                mb: 0.25,
              }}
            >
              Email
            </Typography>
            <Typography
              sx={{
                fontFamily: '"Jost", sans-serif',
                fontSize: '13px',
                color: colors.ink,
              }}
            >
              {intake.client_email}
            </Typography>
          </Box>
        )}
        {intake.client_mailing_address && (
          <Box>
            <Typography
              sx={{
                fontFamily: '"Jost", sans-serif',
                fontSize: '11px',
                fontWeight: 700,
                color: colors.inkLight,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                mb: 0.25,
              }}
            >
              Address
            </Typography>
            <Typography
              sx={{
                fontFamily: '"Jost", sans-serif',
                fontSize: '13px',
                color: colors.ink,
              }}
            >
              {intake.client_mailing_address}
            </Typography>
          </Box>
        )}
      </Box>

      {/* ── 1. Professional Advisors ── */}
      <ReportSectionTitle>Professional Advisors</ReportSectionTitle>
      {advisors.length === 0 ? (
        <EmptyState message="No professional advisors on record." />
      ) : (
        sortedAdvisorTypes.map((type) => (
          <CategorySection key={type} label={type}>
            {advisorsByType[type]
              .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
              .map((advisor) => (
                <DirectoryCard
                  key={advisor.id}
                  name={advisor.name}
                  firm={advisor.firm_name}
                  badge={advisor.advisor_type}
                  phone={advisor.phone}
                  email={advisor.email}
                  address={advisor.address}
                  notes={advisor.notes}
                />
              ))}
          </CategorySection>
        ))
      )}

      {/* ── 2. Medical Providers ── */}
      <ReportSectionTitle>Medical Providers</ReportSectionTitle>
      {medicalProviders.length === 0 ? (
        <EmptyState message="No medical providers on record." />
      ) : (
        sortedMedicalCategories.map((category) => (
          <CategorySection key={category} label={category}>
            {providersByCategory[category]
              .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
              .map((provider) => (
                <DirectoryCard
                  key={provider.id}
                  name={provider.name}
                  title={provider.specialist_type}
                  firm={provider.firm_name}
                  badge={provider.provider_category}
                  badgeColor={colors.inkLight}
                  phone={provider.phone}
                  email={provider.email}
                  address={provider.address}
                  notes={provider.notes}
                />
              ))}
          </CategorySection>
        ))
      )}

      {/* ── 3. Pharmacies ── */}
      <ReportSectionTitle>Pharmacies</ReportSectionTitle>
      {activePharmacies.length === 0 ? (
        <EmptyState message="No pharmacies on record." />
      ) : (
        activePharmacies.map((pharmacy) => (
          <DirectoryCard
            key={pharmacy.id}
            name={pharmacy.pharmacy_name}
            firm={pharmacy.pharmacy_chain}
            badge={pharmacy.is_primary ? 'Primary' : undefined}
            phone={pharmacy.phone}
            fax={pharmacy.fax}
            address={
              [pharmacy.address, pharmacy.city, pharmacy.state, pharmacy.zip]
                .filter(Boolean)
                .join(', ') || undefined
            }
            hours={pharmacy.hours}
            notes={pharmacy.notes}
            chips={[
              ...(pharmacy.specialty ? [{ label: 'Specialty', color: colors.accent }] : []),
              ...(pharmacy.mail_order ? [{ label: 'Mail Order', color: colors.inkLight }] : []),
            ]}
            extraRows={[
              { label: 'Pharmacist', value: pharmacy.pharmacist_name },
              { label: 'Account #', value: pharmacy.account_number },
            ]}
          />
        ))
      )}

      {/* ── Confidentiality footer ── */}
      <Box
        sx={{
          mt: 4,
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
          This directory contains confidential personal and professional contact information.
          Distribute only to authorized individuals.
        </Typography>
      </Box>
    </ReportLayout>
  );
};

export default AdvisorDirectory;

/* ─────────────────────────────────────────────────────────────────────────────
 * USAGE EXAMPLE:
 *
 * import AdvisorDirectory from './reports/AdvisorDirectory';
 *
 * const { data: intake }          = await supabase.from('folio_intakes').select('*').eq('id', intakeId).single();
 * const { data: advisors }        = await supabase.from('folio_advisors').select('*').eq('intake_id', intakeId).order('sort_order');
 * const { data: medicalProviders }= await supabase.from('folio_medical_providers').select('*').eq('intake_id', intakeId).order('sort_order');
 * const { data: pharmacies }      = await supabase.from('folio_pharmacies').select('*').eq('intake_id', intakeId).order('sort_order');
 *
 * <AdvisorDirectory
 *   intake={intake}
 *   advisors={advisors}
 *   medicalProviders={medicalProviders}
 *   pharmacies={pharmacies}
 *   dateCreated={intake.created_at}
 *   dateUpdated={intake.updated_at}
 * />
 * ───────────────────────────────────────────────────────────────────────────── */