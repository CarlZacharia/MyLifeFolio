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
  client_aka?: string;
  client_birth_date?: string;
  client_cell_phone?: string;
  client_home_phone?: string;
  client_work_phone?: string;
  client_email?: string;
  client_mailing_address?: string;
  client_state_of_domicile?: string;
  marital_status?: string;
  spouse_name?: string;
  spouse_aka?: string;
  spouse_birth_date?: string;
  spouse_cell_phone?: string;
  spouse_home_phone?: string;
  spouse_work_phone?: string;
  spouse_email?: string;
  spouse_mailing_address?: string;
}

interface Child {
  id: string;
  name: string;
  address?: string;
  birth_date?: string;
  age?: string;
  relationship?: string;
  marital_status?: string;
  has_children?: boolean;
  number_of_children?: number;
  comments?: string;
  sort_order?: number;
}

interface Dependent {
  id: string;
  name: string;
  relationship?: string;
  sort_order?: number;
}

interface Beneficiary {
  id: string;
  name: string;
  address?: string;
  relationship?: string;
  relationship_other?: string;
  age?: string;
  distribution_type?: string;
  notes?: string;
  sort_order?: number;
}

interface FriendNeighbor {
  id: string;
  name: string;
  relationship?: string;
  address?: string;
  phone?: string;
  email?: string;
  notes?: string;
  sort_order?: number;
}

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

interface FamilyContactSheetProps {
  intake: FolioIntake;
  children?: Child[];
  dependents?: Dependent[];
  beneficiaries?: Beneficiary[];
  friendsNeighbors?: FriendNeighbor[];
  advisors?: Advisor[];
  dateCreated?: string;
  dateUpdated?: string;
}

// ─── Helper sub-components ───────────────────────────────────────────────────

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
          minWidth: 130,
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

const ContactCard: React.FC<{
  title: string;
  subtitle?: string;
  badge?: string;
  badgeColor?: string;
  children: React.ReactNode;
}> = ({ title, subtitle, badge, badgeColor = colors.accentWarm, children }) => (
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
            bgcolor: badgeColor,
            color: '#fff',
            fontFamily: '"Jost", sans-serif',
            fontSize: '10px',
            fontWeight: 600,
            height: 20,
          }}
        />
      )}
    </Box>
    {/* Card body */}
    <Box sx={{ px: 2, py: 1.25, bgcolor: '#fff' }}>{children}</Box>
  </Box>
);

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
        {col || '—'}
      </Typography>
    ))}
  </Box>
);

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

const CategoryLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Typography
    sx={{
      fontFamily: '"Jost", sans-serif',
      fontSize: '11px',
      fontWeight: 700,
      color: colors.inkLight,
      letterSpacing: '0.05em',
      textTransform: 'uppercase',
      mt: 1.5,
      mb: 0.5,
    }}
  >
    {children}
  </Typography>
);

// ─── Main Component ───────────────────────────────────────────────────────────

const FamilyContactSheet: React.FC<FamilyContactSheetProps> = ({
  intake,
  children = [],
  dependents = [],
  beneficiaries = [],
  friendsNeighbors = [],
  advisors = [],
  dateCreated,
  dateUpdated,
}) => {
  const formatDate = (d?: string) => {
    if (!d) return '';
    try {
      return new Date(d).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return d;
    }
  };

  const hasSpouse =
    intake.marital_status === 'Married' ||
    intake.marital_status === 'married' ||
    !!intake.spouse_name;

  // Group advisors by type
  const advisorsByType: Record<string, Advisor[]> = {};
  advisors.forEach((a) => {
    const type = a.advisor_type || 'Other';
    if (!advisorsByType[type]) advisorsByType[type] = [];
    advisorsByType[type].push(a);
  });

  return (
    <ReportLayout
      title="Family Contact Sheet"
      ownerName={intake.client_name}
      dateCreated={dateCreated}
      dateUpdated={dateUpdated}
    >
      {/* ── 1. Primary Contact (Client) ── */}
      <ReportSectionTitle>Primary Contact</ReportSectionTitle>
      <ContactCard
        title={intake.client_name}
        subtitle={intake.client_aka ? `Also known as: ${intake.client_aka}` : undefined}
        badge="Folio Owner"
      >
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <InfoRow
              label="Date of Birth"
              value={formatDate(intake.client_birth_date)}
            />
            <InfoRow label="Cell Phone" value={intake.client_cell_phone} />
            <InfoRow label="Home Phone" value={intake.client_home_phone} />
            <InfoRow label="Work Phone" value={intake.client_work_phone} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <InfoRow label="Email" value={intake.client_email} />
            <InfoRow label="Address" value={intake.client_mailing_address} />
            <InfoRow label="State of Domicile" value={intake.client_state_of_domicile} />
            <InfoRow label="Marital Status" value={intake.marital_status} />
          </Grid>
        </Grid>
      </ContactCard>

      {/* ── 2. Spouse / Partner ── */}
      {hasSpouse && intake.spouse_name && (
        <>
          <ReportSectionTitle>Spouse / Partner</ReportSectionTitle>
          <ContactCard
            title={intake.spouse_name}
            subtitle={intake.spouse_aka ? `Also known as: ${intake.spouse_aka}` : undefined}
            badge="Spouse"
            badgeColor={colors.inkLight}
          >
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <InfoRow
                  label="Date of Birth"
                  value={formatDate(intake.spouse_birth_date)}
                />
                <InfoRow label="Cell Phone" value={intake.spouse_cell_phone} />
                <InfoRow label="Home Phone" value={intake.spouse_home_phone} />
                <InfoRow label="Work Phone" value={intake.spouse_work_phone} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <InfoRow label="Email" value={intake.spouse_email} />
                <InfoRow
                  label="Address"
                  value={
                    intake.spouse_mailing_address !== intake.client_mailing_address
                      ? intake.spouse_mailing_address
                      : '(Same as above)'
                  }
                />
              </Grid>
            </Grid>
          </ContactCard>
        </>
      )}

      {/* ── 3. Children ── */}
      <ReportSectionTitle>Children</ReportSectionTitle>
      {children.length === 0 ? (
        <EmptyState message="No children on record." />
      ) : (
        children
          .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
          .map((child) => (
            <ContactCard
              key={child.id}
              title={child.name}
              subtitle={[child.relationship, child.age ? `Age ${child.age}` : child.birth_date ? formatDate(child.birth_date) : undefined]
                .filter(Boolean)
                .join(' · ')}
              badge={child.marital_status || undefined}
              badgeColor={colors.parchment.replace('#', '') ? colors.inkLight : colors.inkLight}
            >
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <InfoRow label="Address" value={child.address} />
                  <InfoRow
                    label="Has Children"
                    value={
                      child.has_children
                        ? `Yes${child.number_of_children ? ` (${child.number_of_children})` : ''}`
                        : child.has_children === false
                        ? 'No'
                        : undefined
                    }
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <InfoRow label="Notes" value={child.comments} />
                </Grid>
              </Grid>
            </ContactCard>
          ))
      )}

      {/* ── 4. Other Dependents ── */}
      {dependents.length > 0 && (
        <>
          <ReportSectionTitle>Other Dependents</ReportSectionTitle>
          <TableHeader cols={['Name', 'Relationship']} widths={['1fr', '1fr']} />
          {dependents
            .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
            .map((d, i) => (
              <TableRow
                key={d.id}
                zebra={i % 2 === 1}
                cols={[d.name, d.relationship || '—']}
                widths={['1fr', '1fr']}
              />
            ))}
        </>
      )}

      {/* ── 5. Beneficiaries ── */}
      <ReportSectionTitle>Beneficiaries</ReportSectionTitle>
      {beneficiaries.length === 0 ? (
        <EmptyState message="No beneficiaries on record." />
      ) : (
        <>
          <TableHeader
            cols={['Name', 'Relationship', 'Address', 'Distribution', 'Notes']}
            widths={['1.5fr', '1fr', '2fr', '1fr', '1.5fr']}
          />
          {beneficiaries
            .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
            .map((b, i) => (
              <TableRow
                key={b.id}
                zebra={i % 2 === 1}
                widths={['1.5fr', '1fr', '2fr', '1fr', '1.5fr']}
                cols={[
                  b.name,
                  b.relationship === 'Other' ? (b.relationship_other || 'Other') : (b.relationship || '—'),
                  b.address || '—',
                  b.distribution_type || '—',
                  b.notes || '—',
                ]}
              />
            ))}
        </>
      )}

      {/* ── 6. Friends & Neighbors ── */}
      {friendsNeighbors.length > 0 && (
        <>
          <ReportSectionTitle>Friends &amp; Neighbors</ReportSectionTitle>
          <TableHeader
            cols={['Name', 'Relationship', 'Phone', 'Email', 'Address']}
            widths={['1.5fr', '1fr', '1fr', '1.5fr', '2fr']}
          />
          {friendsNeighbors
            .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
            .map((f, i) => (
              <TableRow
                key={f.id}
                zebra={i % 2 === 1}
                widths={['1.5fr', '1fr', '1fr', '1.5fr', '2fr']}
                cols={[
                  f.name,
                  f.relationship || '—',
                  f.phone || '—',
                  f.email || '—',
                  f.address || '—',
                ]}
              />
            ))}
        </>
      )}

      {/* ── 7. Advisors ── */}
      <ReportSectionTitle>Advisors &amp; Professionals</ReportSectionTitle>
      {advisors.length === 0 ? (
        <EmptyState message="No advisors on record." />
      ) : (
        Object.entries(advisorsByType).map(([type, typeAdvisors]) => (
          <Box key={type}>
            <CategoryLabel>{type}</CategoryLabel>
            <TableHeader
              cols={['Name', 'Firm', 'Phone', 'Email', 'Notes']}
              widths={['1.5fr', '1.5fr', '1fr', '1.5fr', '1.5fr']}
            />
            {typeAdvisors
              .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
              .map((a, i) => (
                <TableRow
                  key={a.id}
                  zebra={i % 2 === 1}
                  widths={['1.5fr', '1.5fr', '1fr', '1.5fr', '1.5fr']}
                  cols={[
                    a.name || '—',
                    a.firm_name || '—',
                    a.phone || '—',
                    a.email || '—',
                    a.notes || '—',
                  ]}
                />
              ))}
          </Box>
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
          This report contains confidential personal information. Distribute only to authorized
          individuals.
        </Typography>
      </Box>
    </ReportLayout>
  );
};

export default FamilyContactSheet;

/* ─────────────────────────────────────────────────────────────────────────────
 * USAGE EXAMPLE:
 *
 * import FamilyContactSheet from './reports/FamilyContactSheet';
 *
 * const { data: intake }          = await supabase.from('folio_intakes').select('*').eq('id', intakeId).single();
 * const { data: children }        = await supabase.from('folio_children').select('*').eq('intake_id', intakeId).order('sort_order');
 * const { data: dependents }      = await supabase.from('folio_dependents').select('*').eq('intake_id', intakeId).order('sort_order');
 * const { data: beneficiaries }   = await supabase.from('folio_beneficiaries').select('*').eq('intake_id', intakeId).order('sort_order');
 * const { data: friendsNeighbors }= await supabase.from('folio_friends_neighbors').select('*').eq('intake_id', intakeId).order('sort_order');
 * const { data: advisors }        = await supabase.from('folio_advisors').select('*').eq('intake_id', intakeId).order('sort_order');
 *
 * <FamilyContactSheet
 *   intake={intake}
 *   children={children}
 *   dependents={dependents}
 *   beneficiaries={beneficiaries}
 *   friendsNeighbors={friendsNeighbors}
 *   advisors={advisors}
 *   dateCreated={intake.created_at}
 *   dateUpdated={intake.updated_at}
 * />
 * ───────────────────────────────────────────────────────────────────────────── */