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
  okGreen: '#2e7d32',
  okGreenLight: '#f1f8f1',
};

// ─── Types matching your Supabase schema ─────────────────────────────────────

interface FolioIntake {
  // Client
  client_name: string;
  client_birth_date?: string;
  client_mailing_address?: string;
  client_cell_phone?: string;
  client_email?: string;
  client_served_military?: boolean;
  client_military_branch?: string;
  client_military_start_date?: string;
  client_military_end_date?: string;
  client_has_prepaid_funeral?: boolean;
  client_prepaid_funeral_details?: string;
  client_preferred_funeral_home?: string;
  client_burial_or_cremation?: string;
  client_preferred_church?: string;
  // Spouse
  marital_status?: string;
  spouse_name?: string;
  spouse_birth_date?: string;
  spouse_served_military?: boolean;
  spouse_military_branch?: string;
  spouse_military_start_date?: string;
  spouse_military_end_date?: string;
  spouse_has_prepaid_funeral?: boolean;
  spouse_prepaid_funeral_details?: string;
  spouse_preferred_funeral_home?: string;
  spouse_burial_or_cremation?: string;
  spouse_preferred_church?: string;
}

/** folio_end_of_life — category + jsonb field_data */
interface EndOfLife {
  id: string;
  category: string;
  field_data: Record<string, any>;
  sort_order?: number;
}

/** legacy_charity_preferences */
interface LegacyCharityPreferences {
  donations_in_lieu_of_flowers?: boolean;
  scholarship_fund?: string;
  religious_donations?: string;
  legacy_giving_notes?: string;
  why_these_causes?: string;
}

/** legacy_charity_organizations */
interface LegacyCharityOrganization {
  id: string;
  organization_name?: string;
  website?: string;
  contact_info?: string;
  notes?: string;
  sort_order?: number;
}

/** legacy_entries — obituary, letters, life story etc. */
interface LegacyEntry {
  id: string;
  entry_type?: string;
  title?: string;
  body?: string;
  created_at?: string;
}

interface FuneralInstructionsProps {
  intake: FolioIntake;
  endOfLife?: EndOfLife[];
  legacyCharityPreferences?: LegacyCharityPreferences | null;
  legacyCharityOrganizations?: LegacyCharityOrganization[];
  legacyEntries?: LegacyEntry[];
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
        fontWeight: 600, color: colors.inkLight,
        minWidth: 190, flexShrink: 0,
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

/** Prominent instruction card — used for burial/cremation preference */
const PreferenceCard: React.FC<{
  personName: string;
  preference?: string;
  funeralHome?: string;
  church?: string;
  prepaid?: boolean;
  prepaidDetails?: string;
  military?: boolean;
  militaryBranch?: string;
  militaryStart?: string;
  militaryEnd?: string;
  badge?: string;
}> = ({
  personName, preference, funeralHome, church,
  prepaid, prepaidDetails, military, militaryBranch,
  militaryStart, militaryEnd, badge,
}) => (
  <Box sx={{
    border: `1px solid ${colors.parchment}`,
    borderLeft: `5px solid ${colors.accentWarm}`,
    borderRadius: 1.5, overflow: 'hidden', mb: 2,
    '@media print': { breakInside: 'avoid' },
  }}>
    {/* Header */}
    <Box sx={{
      bgcolor: colors.creamDark, px: 2, py: 1,
      display: 'flex', alignItems: 'center',
      justifyContent: 'space-between',
      borderBottom: `1px solid ${colors.parchment}`,
    }}>
      <Typography sx={{
        fontFamily: '"Jost", sans-serif', fontSize: '14px',
        fontWeight: 700, color: colors.ink,
      }}>
        {personName}
      </Typography>
      <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap' }}>
        {preference && (
          <Chip
            label={preference}
            size="small"
            sx={{
              bgcolor: colors.ink, color: '#fff',
              fontFamily: '"Jost", sans-serif',
              fontSize: '11px', fontWeight: 600, height: 22,
            }}
          />
        )}
        {badge && (
          <Chip
            label={badge}
            size="small"
            sx={{
              bgcolor: colors.accentWarm, color: '#fff',
              fontFamily: '"Jost", sans-serif',
              fontSize: '11px', fontWeight: 600, height: 22,
            }}
          />
        )}
        {prepaid && (
          <Chip
            label="Prepaid"
            size="small"
            sx={{
              bgcolor: colors.okGreen, color: '#fff',
              fontFamily: '"Jost", sans-serif',
              fontSize: '11px', fontWeight: 600, height: 22,
            }}
          />
        )}
        {military && (
          <Chip
            label="Military Veteran"
            size="small"
            sx={{
              bgcolor: '#1a3a5c', color: '#fff',
              fontFamily: '"Jost", sans-serif',
              fontSize: '11px', fontWeight: 600, height: 22,
            }}
          />
        )}
      </Box>
    </Box>

    {/* Body */}
    <Box sx={{ px: 2, py: 1.5, bgcolor: '#fff' }}>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <InfoRow label="Burial / Cremation Preference" value={preference} />
          <InfoRow label="Preferred Funeral Home"        value={funeralHome} />
          <InfoRow label="Preferred Church / Venue"      value={church} />
        </Grid>
        <Grid item xs={12} sm={6}>
          {prepaid && (
            <>
              <InfoRow label="Prepaid Funeral"         value="Yes" />
              <InfoRow label="Prepaid Details"         value={prepaidDetails} />
            </>
          )}
          {military && (
            <>
              <InfoRow label="Military Branch"         value={militaryBranch} />
              <InfoRow label="Service Start"           value={militaryStart} />
              <InfoRow label="Service End"             value={militaryEnd} />
            </>
          )}
        </Grid>
      </Grid>

      {/* Military benefits note */}
      {military && (
        <Box sx={{
          mt: 1, px: 1.5, py: 0.75,
          bgcolor: '#eaf0f8',
          border: '1px solid #90aec9',
          borderRadius: 1,
        }}>
          <Typography sx={{
            fontFamily: '"Jost", sans-serif', fontSize: '11px',
            color: '#1a3a5c', fontWeight: 600,
          }}>
            ★ Veteran — may be eligible for burial benefits through the
            U.S. Department of Veterans Affairs including burial flag,
            Presidential Memorial Certificate, and cemetery benefits.
            Contact the VA at 1-800-827-1000.
          </Typography>
        </Box>
      )}
    </Box>
  </Box>
);

/** Renders a folio_end_of_life category block */
const EndOfLifeBlock: React.FC<{
  category: string;
  fieldData: Record<string, any>;
}> = ({ category, fieldData }) => {
  const entries = Object.entries(fieldData).filter(
    ([, v]) => v !== null && v !== undefined && v !== '' && v !== false
  );
  if (entries.length === 0) return null;

  return (
    <Box sx={{
      border: `1px solid ${colors.parchment}`,
      borderRadius: 1.5, mb: 1.5, overflow: 'hidden',
      '@media print': { breakInside: 'avoid' },
    }}>
      <Box sx={{
        bgcolor: colors.creamDark, px: 2, py: 0.75,
        borderBottom: `1px solid ${colors.parchment}`,
      }}>
        <Typography sx={{
          fontFamily: '"Jost", sans-serif', fontSize: '12px',
          fontWeight: 700, color: colors.accent,
          letterSpacing: '0.03em', textTransform: 'uppercase',
        }}>
          {category}
        </Typography>
      </Box>
      <Box sx={{ px: 2, py: 1.25, bgcolor: '#fff' }}>
        {entries.map(([key, value]) => {
          // Format key from snake_case to Title Case
          const label = key
            .replace(/_/g, ' ')
            .replace(/\b\w/g, (c) => c.toUpperCase());
          const displayValue =
            typeof value === 'boolean'
              ? value ? 'Yes' : 'No'
              : Array.isArray(value)
              ? value.join(', ')
              : String(value);
          return (
            <InfoRow key={key} label={label} value={displayValue} />
          );
        })}
      </Box>
    </Box>
  );
};

/** Narrative text block — for obituary, letters to family, etc. */
const NarrativeBlock: React.FC<{
  title: string;
  body?: string;
  entryType?: string;
}> = ({ title, body, entryType }) => {
  if (!body) return null;
  return (
    <Box sx={{
      border: `1px solid ${colors.parchment}`,
      borderRadius: 1.5, mb: 2, overflow: 'hidden',
      '@media print': { breakInside: 'avoid' },
    }}>
      <Box sx={{
        bgcolor: colors.creamDark, px: 2, py: 0.75,
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: `1px solid ${colors.parchment}`,
      }}>
        <Typography sx={{
          fontFamily: '"Jost", sans-serif', fontSize: '13px',
          fontWeight: 700, color: colors.ink,
        }}>
          {title}
        </Typography>
        {entryType && (
          <Chip
            label={entryType}
            size="small"
            sx={{
              bgcolor: colors.parchment, color: colors.inkLight,
              fontFamily: '"Jost", sans-serif',
              fontSize: '10px', fontWeight: 600, height: 18,
            }}
          />
        )}
      </Box>
      <Box sx={{ px: 2.5, py: 2, bgcolor: '#fff' }}>
        <Typography sx={{
          fontFamily: '"Jost", sans-serif', fontSize: '12px',
          color: colors.ink, lineHeight: 1.8,
          whiteSpace: 'pre-wrap',
        }}>
          {body}
        </Typography>
      </Box>
    </Box>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const FuneralInstructions: React.FC<FuneralInstructionsProps> = ({
  intake,
  endOfLife = [],
  legacyCharityPreferences,
  legacyCharityOrganizations = [],
  legacyEntries = [],
  dateCreated,
  dateUpdated,
}) => {
  const hasSpouse = !!intake.spouse_name;

  // Sort end-of-life categories
  const sortedEndOfLife = [...endOfLife].sort(
    (a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)
  );

  // Separate legacy entries by type
  const obituaryEntries = legacyEntries.filter(
    (e) => e.entry_type?.toLowerCase().includes('obituary')
  );
  const letterEntries = legacyEntries.filter(
    (e) => e.entry_type?.toLowerCase().includes('letter')
  );
  const otherLegacyEntries = legacyEntries.filter(
    (e) =>
      !e.entry_type?.toLowerCase().includes('obituary') &&
      !e.entry_type?.toLowerCase().includes('letter')
  );

  const hasCharitySection =
    legacyCharityPreferences ||
    legacyCharityOrganizations.length > 0;

  return (
    <ReportLayout
      title="Funeral Instructions"
      ownerName={intake.client_name}
      dateCreated={dateCreated}
      dateUpdated={dateUpdated}
    >

      {/* ── Important notice banner ── */}
      <Box sx={{
        bgcolor: colors.creamDark,
        border: `1px solid ${colors.parchment}`,
        borderRadius: 1.5, px: 2.5, py: 1.5, mb: 2.5,
        display: 'flex', gap: 1.5, alignItems: 'flex-start',
      }}>
        <Typography sx={{ fontSize: '20px', lineHeight: 1, mt: 0.25 }}>📋</Typography>
        <Typography sx={{
          fontFamily: '"Jost", sans-serif', fontSize: '12px',
          color: colors.inkLight, lineHeight: 1.6,
        }}>
          These instructions reflect the personal wishes of{' '}
          <strong style={{ color: colors.ink }}>{intake.client_name}</strong>
          {hasSpouse && intake.spouse_name
            ? ` and ${intake.spouse_name}`
            : ''}{' '}
          as recorded in their MyLifeFolio. Please share this document
          with family members, clergy, and the funeral home as soon as
          possible following the passing of the individual.
        </Typography>
      </Box>

      {/* ── 1. Burial & Funeral Preferences — Client ── */}
      <ReportSectionTitle>
        Funeral Preferences — {intake.client_name}
      </ReportSectionTitle>
      <PreferenceCard
        personName={intake.client_name}
        preference={intake.client_burial_or_cremation}
        funeralHome={intake.client_preferred_funeral_home}
        church={intake.client_preferred_church}
        prepaid={intake.client_has_prepaid_funeral}
        prepaidDetails={intake.client_prepaid_funeral_details}
        military={intake.client_served_military}
        militaryBranch={intake.client_military_branch}
        militaryStart={intake.client_military_start_date}
        militaryEnd={intake.client_military_end_date}
      />

      {/* ── 2. Burial & Funeral Preferences — Spouse ── */}
      {hasSpouse && intake.spouse_name && (
        <>
          <ReportSectionTitle>
            Funeral Preferences — {intake.spouse_name}
          </ReportSectionTitle>
          <PreferenceCard
            personName={intake.spouse_name}
            preference={intake.spouse_burial_or_cremation}
            funeralHome={intake.spouse_preferred_funeral_home}
            church={intake.spouse_preferred_church}
            prepaid={intake.spouse_has_prepaid_funeral}
            prepaidDetails={intake.spouse_prepaid_funeral_details}
            military={intake.spouse_served_military}
            militaryBranch={intake.spouse_military_branch}
            militaryStart={intake.spouse_military_start_date}
            militaryEnd={intake.spouse_military_end_date}
            badge="Spouse"
          />
        </>
      )}

      {/* ── 3. End of Life Wishes (folio_end_of_life categories) ── */}
      {sortedEndOfLife.length > 0 && (
        <>
          <ReportSectionTitle>End of Life Wishes</ReportSectionTitle>
          {sortedEndOfLife.map((item) => (
            <EndOfLifeBlock
              key={item.id}
              category={item.category}
              fieldData={item.field_data || {}}
            />
          ))}
        </>
      )}

      {/* ── 4. Obituary ── */}
      {obituaryEntries.length > 0 && (
        <>
          <ReportSectionTitle>Obituary</ReportSectionTitle>
          {obituaryEntries.map((entry) => (
            <NarrativeBlock
              key={entry.id}
              title={entry.title || 'Obituary'}
              body={entry.body}
              entryType={entry.entry_type}
            />
          ))}
        </>
      )}

      {/* ── 5. Letters to Family ── */}
      {letterEntries.length > 0 && (
        <>
          <ReportSectionTitle>Letters to Family</ReportSectionTitle>
          {letterEntries.map((entry) => (
            <NarrativeBlock
              key={entry.id}
              title={entry.title || 'Letter'}
              body={entry.body}
              entryType={entry.entry_type}
            />
          ))}
        </>
      )}

      {/* ── 6. Other Legacy Entries ── */}
      {otherLegacyEntries.length > 0 && (
        <>
          <ReportSectionTitle>Legacy Notes</ReportSectionTitle>
          {otherLegacyEntries.map((entry) => (
            <NarrativeBlock
              key={entry.id}
              title={entry.title || entry.entry_type || 'Note'}
              body={entry.body}
              entryType={entry.entry_type}
            />
          ))}
        </>
      )}

      {/* ── 7. Charitable Wishes ── */}
      {hasCharitySection && (
        <>
          <ReportSectionTitle>Charitable Wishes</ReportSectionTitle>

          {legacyCharityPreferences && (
            <Box sx={{
              border: `1px solid ${colors.parchment}`,
              borderRadius: 1.5, px: 2, py: 1.5, mb: 1.5, bgcolor: '#fff',
              '@media print': { breakInside: 'avoid' },
            }}>
              {legacyCharityPreferences.donations_in_lieu_of_flowers && (
                <Box sx={{
                  display: 'flex', alignItems: 'center', gap: 1,
                  bgcolor: colors.okGreenLight,
                  border: `1px solid ${colors.okGreen}`,
                  borderRadius: 1, px: 1.5, py: 0.75, mb: 1,
                }}>
                  <Typography sx={{
                    fontFamily: '"Jost", sans-serif', fontSize: '12px',
                    fontWeight: 700, color: colors.okGreen,
                  }}>
                    ✓ In lieu of flowers, please make donations to the
                    charitable organizations listed below.
                  </Typography>
                </Box>
              )}
              <InfoRow label="Scholarship Fund"     value={legacyCharityPreferences.scholarship_fund} />
              <InfoRow label="Religious Donations"  value={legacyCharityPreferences.religious_donations} />
              <InfoRow label="Legacy Giving Notes"  value={legacyCharityPreferences.legacy_giving_notes} />
              <InfoRow label="Why These Causes"     value={legacyCharityPreferences.why_these_causes} />
            </Box>
          )}

          {legacyCharityOrganizations.length > 0 && (
            <Box>
              {legacyCharityOrganizations
                .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
                .map((org) => (
                  <Box key={org.id} sx={{
                    border: `1px solid ${colors.parchment}`,
                    borderRadius: 1, px: 2, py: 1.25, mb: 1, bgcolor: '#fff',
                    '@media print': { breakInside: 'avoid' },
                  }}>
                    <Typography sx={{
                      fontFamily: '"Jost", sans-serif', fontSize: '13px',
                      fontWeight: 700, color: colors.ink, mb: 0.5,
                    }}>
                      {org.organization_name}
                    </Typography>
                    <InfoRow label="Website"      value={org.website} />
                    <InfoRow label="Contact Info" value={org.contact_info} />
                    <InfoRow label="Notes"        value={org.notes} />
                  </Box>
                ))}
            </Box>
          )}
        </>
      )}

      {/* ── Empty state if very little data ── */}
      {!intake.client_burial_or_cremation &&
        !intake.client_preferred_funeral_home &&
        sortedEndOfLife.length === 0 &&
        legacyEntries.length === 0 && (
          <Box sx={{
            bgcolor: colors.alertRedLight,
            border: `1.5px solid ${colors.alertRed}`,
            borderRadius: 1, px: 2, py: 1.5, mt: 2,
          }}>
            <Typography sx={{
              fontFamily: '"Jost", sans-serif', fontSize: '12px',
              color: colors.alertRed, fontWeight: 600,
            }}>
              ⚠ Funeral and end-of-life wishes have not yet been completed
              in this Folio. Please encourage the folio owner to complete
              this section.
            </Typography>
          </Box>
        )}

      {/* ── Confidentiality footer ── */}
      <Box sx={{
        mt: 4, pt: 1.5,
        borderTop: `1px dashed ${colors.parchment}`,
        textAlign: 'center',
      }}>
        <Typography sx={{
          fontFamily: '"Jost", sans-serif', fontSize: '10px',
          color: colors.inkLight, fontStyle: 'italic',
        }}>
          These instructions represent the personal wishes of the folio owner and are
          intended to guide family members and funeral providers. This document is
          confidential and should be distributed only to authorized individuals.
        </Typography>
      </Box>
    </ReportLayout>
  );
};

export default FuneralInstructions;

/* ─────────────────────────────────────────────────────────────────────────────
 * USAGE EXAMPLE:
 *
 * import FuneralInstructions from './reports/FuneralInstructions';
 *
 * const { data: intake }                   = await supabase.from('folio_intakes').select('*').eq('id', intakeId).single();
 * const { data: endOfLife }                = await supabase.from('folio_end_of_life').select('*').eq('intake_id', intakeId).order('sort_order');
 * const { data: legacyCharityPreferences } = await supabase.from('legacy_charity_preferences').select('*').eq('intake_id', intakeId).single();
 * const { data: legacyCharityOrganizations}= await supabase.from('legacy_charity_organizations').select('*').eq('intake_id', intakeId).order('sort_order');
 * const { data: legacyEntries }            = await supabase.from('legacy_entries').select('*').eq('folio_id', folioId);
 *
 * <FuneralInstructions
 *   intake={intake}
 *   endOfLife={endOfLife}
 *   legacyCharityPreferences={legacyCharityPreferences}
 *   legacyCharityOrganizations={legacyCharityOrganizations}
 *   legacyEntries={legacyEntries}
 *   dateCreated={intake.created_at}
 *   dateUpdated={intake.updated_at}
 * />
 *
 * NOTE: legacy_entries uses folio_id (not intake_id) — query accordingly.
 * ───────────────────────────────────────────────────────────────────────────── */