import React from 'react';
import {
  Box,
  Typography,
  Grid,
  Chip,
} from '@mui/material';
import ReportLayout, { ReportSectionTitle } from './ReportLayout';

// ─── Design tokens (mirrors ReportLayout.tsx) ───────────────────────────────
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
};

// ─── Types matching your Supabase schema ────────────────────────────────────

interface FolioIntake {
  client_name: string;
  client_birth_date?: string;
  client_cell_phone?: string;
  client_home_phone?: string;
  client_mailing_address?: string;
  spouse_name?: string;
  spouse_cell_phone?: string;
  marital_status?: string;
}

interface BasicVital {
  blood_type?: string;
  height?: string;
  weight?: string;
  as_of_date?: string;
}

interface Allergy {
  id: string;
  allergen: string;
  allergy_type?: string;
  reaction?: string;
  severity?: string;
}

interface Medication {
  id: string;
  medication_name: string;
  dosage?: string;
  form?: string;
  frequency?: string;
  frequency_notes?: string;
  prescribing_physician?: string;
  condition_treated?: string;
  rx_number?: string;
  controlled_substance?: boolean;
  requires_refrigeration?: boolean;
  is_active?: boolean;
}

interface MedicalCondition {
  id: string;
  condition_name: string;
  diagnosed_date?: string;
  treating_physician?: string;
  status?: string;
  notes?: string;
}

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
}

interface MedicalEquipment {
  id: string;
  equipment_name: string;
  equipment_type?: string;
  make_model?: string;
  supplier_name?: string;
  supplier_phone?: string;
  battery_type?: string;
  is_active?: boolean;
  notes?: string;
}

interface Pharmacy {
  id: string;
  pharmacy_name: string;
  pharmacy_chain?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  hours?: string;
  is_primary?: boolean;
}

interface Surgery {
  id: string;
  procedure_name: string;
  procedure_type?: string;
  procedure_date?: string;
  facility?: string;
  surgeon_physician?: string;
  notes?: string;
}

interface EmergencyMedicalSummaryProps {
  intake: FolioIntake;
  vitals?: BasicVital;
  allergies?: Allergy[];
  medications?: Medication[];
  conditions?: MedicalCondition[];
  providers?: MedicalProvider[];
  equipment?: MedicalEquipment[];
  pharmacies?: Pharmacy[];
  surgeries?: Surgery[];
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
          minWidth: 140,
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

const SeverityChip: React.FC<{ severity?: string }> = ({ severity }) => {
  if (!severity) return null;
  const s = severity.toLowerCase();
  const bg =
    s === 'severe' || s === 'life-threatening'
      ? colors.alertRed
      : s === 'moderate'
      ? colors.warningAmber
      : colors.okGreen;
  return (
    <Chip
      label={severity}
      size="small"
      sx={{
        bgcolor: bg,
        color: '#fff',
        fontFamily: '"Jost", sans-serif',
        fontSize: '10px',
        fontWeight: 600,
        height: 18,
        ml: 1,
      }}
    />
  );
};

const AlertBanner: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Box
    sx={{
      bgcolor: colors.alertRedLight,
      border: `1.5px solid ${colors.alertRed}`,
      borderRadius: 1,
      px: 2,
      py: 1,
      mb: 2,
      display: 'flex',
      alignItems: 'center',
      gap: 1,
    }}
  >
    <Typography sx={{ fontSize: '16px' }}>⚠️</Typography>
    <Typography
      sx={{
        fontFamily: '"Jost", sans-serif',
        fontSize: '12px',
        color: colors.alertRed,
        fontWeight: 600,
      }}
    >
      {children}
    </Typography>
  </Box>
);

const TableHeader: React.FC<{ cols: string[] }> = ({ cols }) => (
  <Box
    sx={{
      display: 'grid',
      gridTemplateColumns: `repeat(${cols.length}, 1fr)`,
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

const TableRow: React.FC<{ cols: (string | React.ReactNode)[]; zebra?: boolean }> = ({
  cols,
  zebra,
}) => (
  <Box
    sx={{
      display: 'grid',
      gridTemplateColumns: `repeat(${cols.length}, 1fr)`,
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

// ─── Main Report Component ───────────────────────────────────────────────────

const EmergencyMedicalSummary: React.FC<EmergencyMedicalSummaryProps> = ({
  intake,
  vitals,
  allergies = [],
  medications = [],
  conditions = [],
  providers = [],
  equipment = [],
  pharmacies = [],
  surgeries = [],
  dateCreated,
  dateUpdated,
}) => {
  const activeMeds = medications.filter((m) => m.is_active !== false);
  const severeAllergies = allergies.filter(
    (a) => a.severity?.toLowerCase() === 'severe' || a.severity?.toLowerCase() === 'life-threatening'
  );
  const controlledMeds = activeMeds.filter((m) => m.controlled_substance);
  const refrigeratedMeds = activeMeds.filter((m) => m.requires_refrigeration);
  const primaryPharmacy = pharmacies.find((p) => p.is_primary) || pharmacies[0];

  // Group providers by category
  const providersByCategory: Record<string, MedicalProvider[]> = {};
  providers.forEach((p) => {
    const cat = p.provider_category || 'Other';
    if (!providersByCategory[cat]) providersByCategory[cat] = [];
    providersByCategory[cat].push(p);
  });

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

  const formatPhone = (p?: string) => p || '';

  return (
    <ReportLayout
      title="Emergency Medical Summary"
      ownerName={intake.client_name}
      dateCreated={dateCreated}
      dateUpdated={dateUpdated}
    >
      {/* ── Alert banners for critical flags ── */}
      {severeAllergies.length > 0 && (
        <AlertBanner>
          SEVERE ALLERGY ALERT:{' '}
          {severeAllergies.map((a) => a.allergen).join(', ')}
        </AlertBanner>
      )}
      {controlledMeds.length > 0 && (
        <AlertBanner>
          CONTROLLED SUBSTANCES:{' '}
          {controlledMeds.map((m) => m.medication_name).join(', ')}
        </AlertBanner>
      )}

      {/* ── 1. Patient Identity ── */}
      <ReportSectionTitle>Patient Information</ReportSectionTitle>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <InfoRow label="Full Name" value={intake.client_name} />
          <InfoRow label="Date of Birth" value={formatDate(intake.client_birth_date)} />
          <InfoRow label="Cell Phone" value={formatPhone(intake.client_cell_phone)} />
          <InfoRow label="Home Phone" value={formatPhone(intake.client_home_phone)} />
          <InfoRow label="Address" value={intake.client_mailing_address} />
        </Grid>
        <Grid item xs={12} sm={6}>
          {vitals && (
            <>
              <InfoRow label="Blood Type" value={vitals.blood_type} />
              <InfoRow label="Height" value={vitals.height} />
              <InfoRow label="Weight" value={vitals.weight} />
              <InfoRow
                label="Vitals As Of"
                value={vitals.as_of_date ? formatDate(vitals.as_of_date) : undefined}
              />
            </>
          )}
          {intake.spouse_name && (
            <InfoRow
              label="Emergency Contact"
              value={`${intake.spouse_name}${intake.spouse_cell_phone ? ' · ' + intake.spouse_cell_phone : ''}`}
            />
          )}
        </Grid>
      </Grid>

      {/* ── 2. Allergies ── */}
      <ReportSectionTitle>Allergies</ReportSectionTitle>
      {allergies.length === 0 ? (
        <EmptyState message="No allergies on record." />
      ) : (
        <>
          <TableHeader cols={['Allergen', 'Type', 'Reaction', 'Severity']} />
          {allergies.map((a, i) => (
            <TableRow
              key={a.id}
              zebra={i % 2 === 1}
              cols={[
                a.allergen,
                a.allergy_type || '—',
                a.reaction || '—',
                <Box key="sev" sx={{ display: 'flex', alignItems: 'center' }}>
                  <SeverityChip severity={a.severity} />
                </Box>,
              ]}
            />
          ))}
        </>
      )}

      {/* ── 3. Current Medications ── */}
      <ReportSectionTitle>Current Medications</ReportSectionTitle>
      {activeMeds.length === 0 ? (
        <EmptyState message="No active medications on record." />
      ) : (
        <>
          <TableHeader
            cols={['Medication', 'Dosage / Form', 'Frequency', 'Prescribing Physician', 'Condition Treated']}
          />
          {activeMeds.map((m, i) => (
            <TableRow
              key={m.id}
              zebra={i % 2 === 1}
              cols={[
                <Box key="name">
                  {m.medication_name}
                  {m.controlled_substance && (
                    <Chip
                      label="Controlled"
                      size="small"
                      sx={{
                        ml: 0.5,
                        bgcolor: colors.warningAmberLight,
                        color: colors.warningAmber,
                        fontFamily: '"Jost", sans-serif',
                        fontSize: '9px',
                        height: 16,
                        border: `1px solid ${colors.warningAmber}`,
                      }}
                    />
                  )}
                  {m.requires_refrigeration && (
                    <Chip
                      label="❄ Refrigerate"
                      size="small"
                      sx={{
                        ml: 0.5,
                        bgcolor: '#e3f2fd',
                        color: '#1565c0',
                        fontFamily: '"Jost", sans-serif',
                        fontSize: '9px',
                        height: 16,
                      }}
                    />
                  )}
                </Box>,
                [m.dosage, m.form].filter(Boolean).join(' ') || '—',
                [m.frequency, m.frequency_notes].filter(Boolean).join(' — ') || '—',
                m.prescribing_physician || '—',
                m.condition_treated || '—',
              ]}
            />
          ))}
        </>
      )}

      {/* Refrigeration note */}
      {refrigeratedMeds.length > 0 && (
        <Box
          sx={{
            mt: 1,
            px: 2,
            py: 0.75,
            bgcolor: '#e3f2fd',
            border: '1px solid #90caf9',
            borderRadius: 1,
          }}
        >
          <Typography
            sx={{
              fontFamily: '"Jost", sans-serif',
              fontSize: '11px',
              color: '#1565c0',
              fontWeight: 600,
            }}
          >
            ❄ Medications requiring refrigeration:{' '}
            {refrigeratedMeds.map((m) => m.medication_name).join(', ')}
          </Typography>
        </Box>
      )}

      {/* ── 4. Medical Conditions ── */}
      <ReportSectionTitle>Medical Conditions</ReportSectionTitle>
      {conditions.length === 0 ? (
        <EmptyState message="No medical conditions on record." />
      ) : (
        <>
          <TableHeader cols={['Condition', 'Diagnosed', 'Treating Physician', 'Status', 'Notes']} />
          {conditions.map((c, i) => (
            <TableRow
              key={c.id}
              zebra={i % 2 === 1}
              cols={[
                c.condition_name,
                c.diagnosed_date ? formatDate(c.diagnosed_date) : '—',
                c.treating_physician || '—',
                c.status || '—',
                c.notes || '—',
              ]}
            />
          ))}
        </>
      )}

      {/* ── 5. Surgical History ── */}
      {surgeries.length > 0 && (
        <>
          <ReportSectionTitle>Surgical History</ReportSectionTitle>
          <TableHeader cols={['Procedure', 'Type', 'Date', 'Facility', 'Surgeon']} />
          {surgeries.map((s, i) => (
            <TableRow
              key={s.id}
              zebra={i % 2 === 1}
              cols={[
                s.procedure_name,
                s.procedure_type || '—',
                s.procedure_date ? formatDate(s.procedure_date) : '—',
                s.facility || '—',
                s.surgeon_physician || '—',
              ]}
            />
          ))}
        </>
      )}

      {/* ── 6. Medical Providers ── */}
      <ReportSectionTitle>Medical Providers</ReportSectionTitle>
      {providers.length === 0 ? (
        <EmptyState message="No medical providers on record." />
      ) : (
        Object.entries(providersByCategory).map(([category, catProviders]) => (
          <Box key={category} sx={{ mb: 2 }}>
            <Typography
              sx={{
                fontFamily: '"Jost", sans-serif',
                fontSize: '12px',
                fontWeight: 700,
                color: colors.inkLight,
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                mb: 0.5,
              }}
            >
              {category}
            </Typography>
            <TableHeader cols={['Name', 'Practice / Firm', 'Phone', 'Address']} />
            {catProviders.map((p, i) => (
              <TableRow
                key={p.id}
                zebra={i % 2 === 1}
                cols={[
                  [p.name, p.specialist_type ? `(${p.specialist_type})` : ''].filter(Boolean).join(' '),
                  p.firm_name || '—',
                  p.phone || '—',
                  p.address || '—',
                ]}
              />
            ))}
          </Box>
        ))
      )}

      {/* ── 7. Primary Pharmacy ── */}
      <ReportSectionTitle>Pharmacy</ReportSectionTitle>
      {pharmacies.length === 0 ? (
        <EmptyState message="No pharmacy on record." />
      ) : (
        <>
          {primaryPharmacy && (
            <Box
              sx={{
                bgcolor: colors.cream,
                border: `1px solid ${colors.parchment}`,
                borderRadius: 1,
                px: 2,
                py: 1.5,
                mb: 1,
              }}
            >
              <Typography
                sx={{
                  fontFamily: '"Jost", sans-serif',
                  fontSize: '13px',
                  fontWeight: 700,
                  color: colors.ink,
                  mb: 0.5,
                }}
              >
                {primaryPharmacy.pharmacy_name}
                {primaryPharmacy.is_primary && (
                  <Chip
                    label="Primary"
                    size="small"
                    sx={{
                      ml: 1,
                      bgcolor: colors.accentWarm,
                      color: '#fff',
                      fontFamily: '"Jost", sans-serif',
                      fontSize: '10px',
                      height: 18,
                    }}
                  />
                )}
              </Typography>
              <Grid container spacing={1}>
                <Grid item xs={12} sm={6}>
                  <InfoRow
                    label="Address"
                    value={
                      [
                        primaryPharmacy.address,
                        primaryPharmacy.city,
                        primaryPharmacy.state,
                        primaryPharmacy.zip,
                      ]
                        .filter(Boolean)
                        .join(', ') || undefined
                    }
                  />
                  <InfoRow label="Phone" value={primaryPharmacy.phone} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <InfoRow label="Hours" value={primaryPharmacy.hours} />
                  <InfoRow label="Chain" value={primaryPharmacy.pharmacy_chain} />
                </Grid>
              </Grid>
            </Box>
          )}
          {pharmacies.length > 1 && (
            <>
              <TableHeader cols={['Pharmacy', 'Phone', 'Address']} />
              {pharmacies
                .filter((p) => p.id !== primaryPharmacy?.id)
                .map((p, i) => (
                  <TableRow
                    key={p.id}
                    zebra={i % 2 === 1}
                    cols={[
                      p.pharmacy_name,
                      p.phone || '—',
                      [p.address, p.city, p.state].filter(Boolean).join(', ') || '—',
                    ]}
                  />
                ))}
            </>
          )}
        </>
      )}

      {/* ── 8. Medical Equipment ── */}
      {equipment.filter((e) => e.is_active !== false).length > 0 && (
        <>
          <ReportSectionTitle>Medical Equipment</ReportSectionTitle>
          <TableHeader cols={['Equipment', 'Type', 'Make / Model', 'Supplier', 'Supplier Phone']} />
          {equipment
            .filter((e) => e.is_active !== false)
            .map((e, i) => (
              <TableRow
                key={e.id}
                zebra={i % 2 === 1}
                cols={[
                  <Box key="name">
                    {e.equipment_name}
                    {e.battery_type && (
                      <Typography
                        component="span"
                        sx={{
                          fontFamily: '"Jost", sans-serif',
                          fontSize: '10px',
                          color: colors.inkLight,
                          ml: 0.5,
                        }}
                      >
                        (Battery: {e.battery_type})
                      </Typography>
                    )}
                  </Box>,
                  e.equipment_type || '—',
                  e.make_model || '—',
                  e.supplier_name || '—',
                  e.supplier_phone || '—',
                ]}
              />
            ))}
        </>
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
          This report contains confidential personal health information. Handle in accordance with
          applicable privacy laws.
        </Typography>
      </Box>
    </ReportLayout>
  );
};

export default EmergencyMedicalSummary;

/* ─────────────────────────────────────────────────────────────────────────────
 * USAGE EXAMPLE (in your page/route component):
 *
 * import EmergencyMedicalSummary from './reports/EmergencyMedicalSummary';
 *
 * // Supabase query — fetch all data for intake_id:
 * const { data: intake }     = await supabase.from('folio_intakes').select('*').eq('id', intakeId).single();
 * const { data: vitals }     = await supabase.from('folio_basic_vitals').select('*').eq('intake_id', intakeId).single();
 * const { data: allergies }  = await supabase.from('folio_allergies').select('*').eq('intake_id', intakeId).order('sort_order');
 * const { data: medications }= await supabase.from('folio_medications').select('*').eq('intake_id', intakeId).order('sort_order');
 * const { data: conditions } = await supabase.from('folio_medical_conditions').select('*').eq('intake_id', intakeId).order('sort_order');
 * const { data: providers }  = await supabase.from('folio_medical_providers').select('*').eq('intake_id', intakeId).order('sort_order');
 * const { data: equipment }  = await supabase.from('folio_medical_equipment').select('*').eq('intake_id', intakeId).order('sort_order');
 * const { data: pharmacies } = await supabase.from('folio_pharmacies').select('*').eq('intake_id', intakeId).order('sort_order');
 * const { data: surgeries }  = await supabase.from('folio_surgeries').select('*').eq('intake_id', intakeId).order('sort_order');
 *
 * <EmergencyMedicalSummary
 *   intake={intake}
 *   vitals={vitals}
 *   allergies={allergies}
 *   medications={medications}
 *   conditions={conditions}
 *   providers={providers}
 *   equipment={equipment}
 *   pharmacies={pharmacies}
 *   surgeries={surgeries}
 *   dateCreated={intake.created_at}
 *   dateUpdated={intake.updated_at}
 * />
 * ───────────────────────────────────────────────────────────────────────────── */