import React from 'react';
import { Box, Typography } from '@mui/material';
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

const fmt = (n?: number | null): string => {
  if (n === null || n === undefined) return '—';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n);
};

// ─── Types ───────────────────────────────────────────────────────────────────

interface PPMItem {
  id: string;
  owner?: string;
  description?: string;
  value?: number;
  donee?: string;
  notes?: string;
  photo?: string;
  add_to_personal_property_memo?: boolean;
}

interface FolioIntake {
  client_name: string;
  spouse_name?: string;
}

interface PersonalPropertyMemorandumProps {
  intake: FolioIntake;
  otherAssets?: PPMItem[];
  ownerType: 'client' | 'spouse';
  dateCreated?: string;
  dateUpdated?: string;
  /** When true, renders without the ReportLayout wrapper (for inline embedding) */
  embedded?: boolean;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const isJoint = (owner?: string) =>
  !!owner && owner.includes('Client') && owner.includes('Spouse');

const belongsToClient = (owner?: string) =>
  !!owner && owner.includes('Client');

const belongsToSpouse = (owner?: string) =>
  !!owner && owner.includes('Spouse');

// ─── Signature Block ─────────────────────────────────────────────────────────

const SignatureLine: React.FC<{ label: string }> = ({ label }) => (
  <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 3, mb: 3 }}>
    <Box sx={{ flex: 1 }}>
      <Box sx={{ borderBottom: `1px solid ${colors.ink}`, mb: 0.5, minHeight: 32 }} />
      <Typography sx={{ fontFamily: '"Jost", sans-serif', fontSize: '11px', color: colors.inkLight }}>
        {label}
      </Typography>
    </Box>
    <Box sx={{ width: 160 }}>
      <Box sx={{ borderBottom: `1px solid ${colors.ink}`, mb: 0.5, minHeight: 32 }} />
      <Typography sx={{ fontFamily: '"Jost", sans-serif', fontSize: '11px', color: colors.inkLight }}>
        Date
      </Typography>
    </Box>
  </Box>
);

// ─── Item Card ────────────────────────────────────────────────────────────────

const ItemCard: React.FC<{ item: PPMItem; index: number }> = ({ item, index }) => (
  <Box
    sx={{
      border: `1px solid ${colors.parchment}`,
      borderRadius: 1,
      overflow: 'hidden',
      mb: 1.5,
      '@media print': { breakInside: 'avoid' },
    }}
  >
    {/* Header row */}
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: '2.5fr 1fr 1.5fr',
        bgcolor: colors.creamDark,
        px: 1.5,
        py: 0.75,
        borderBottom: `2px solid ${colors.accentWarm}`,
      }}
    >
      {['Description', 'Est. Value', 'Donee'].map((col) => (
        <Typography
          key={col}
          sx={{
            fontFamily: '"Jost", sans-serif',
            fontSize: '10px',
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

    {/* Data row */}
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: '2.5fr 1fr 1.5fr',
        px: 1.5,
        py: 1,
        bgcolor: index % 2 === 0 ? '#fff' : colors.cream,
        gap: 1,
      }}
    >
      <Box>
        <Typography sx={{ fontFamily: '"Jost", sans-serif', fontSize: '13px', fontWeight: 600, color: colors.ink }}>
          {index + 1}.&nbsp;{item.description || '—'}
        </Typography>
        {isJoint(item.owner) && (
          <Typography sx={{ fontFamily: '"Jost", sans-serif', fontSize: '10px', color: colors.accent, mt: 0.25 }}>
            Joint Ownership
          </Typography>
        )}
      </Box>
      <Typography sx={{ fontFamily: '"Jost", sans-serif', fontSize: '12px', color: colors.ink }}>
        {fmt(item.value)}
      </Typography>
      <Typography sx={{ fontFamily: '"Jost", sans-serif', fontSize: '12px', color: colors.ink }}>
        {item.donee || '—'}
      </Typography>
    </Box>

    {/* Special info + photo */}
    {(item.notes || item.photo) && (
      <Box
        sx={{
          px: 1.5,
          py: 1,
          bgcolor: colors.cream,
          borderTop: `1px solid ${colors.parchment}`,
          display: 'flex',
          gap: 2,
          alignItems: 'flex-start',
        }}
      >
        {item.notes && (
          <Box sx={{ flex: 1 }}>
            <Typography
              sx={{ fontFamily: '"Jost", sans-serif', fontSize: '10px', fontWeight: 700, color: colors.accent, mb: 0.25, textTransform: 'uppercase', letterSpacing: '0.04em' }}
            >
              Special Information
            </Typography>
            <Typography sx={{ fontFamily: '"Jost", sans-serif', fontSize: '11px', color: colors.inkLight }}>
              {item.notes}
            </Typography>
          </Box>
        )}
        {item.photo && (
          <Box
            component="img"
            src={item.photo}
            alt={item.description || 'Item photo'}
            sx={{ maxWidth: 100, maxHeight: 100, borderRadius: 1, border: `1px solid ${colors.parchment}`, flexShrink: 0 }}
          />
        )}
      </Box>
    )}
  </Box>
);

// ─── Document Body ────────────────────────────────────────────────────────────

const MemorandumBody: React.FC<{
  items: PPMItem[];
  ownerName: string;
  ownerType: 'client' | 'spouse';
}> = ({ items, ownerName, ownerType }) => {
  const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <Box>
      {/* Preamble */}
      <Box
        sx={{
          border: `1px solid ${colors.parchment}`,
          borderRadius: 1,
          p: 2,
          mb: 3,
          bgcolor: colors.cream,
          '@media print': { breakInside: 'avoid' },
        }}
      >
        <Typography
          sx={{
            fontFamily: '"Jost", sans-serif',
            fontSize: '12px',
            color: colors.ink,
            lineHeight: 1.7,
          }}
        >
          I, <strong>{ownerName}</strong>, being of sound mind, hereby execute this Personal Property
          Memorandum pursuant to my Last Will and Testament. The items listed below are items of tangible
          personal property that I wish to be distributed as indicated at my death. This memorandum may be
          amended or revoked by a subsequent writing signed and dated by me.
        </Typography>
        <Typography
          sx={{
            fontFamily: '"Jost", sans-serif',
            fontSize: '12px',
            color: colors.inkLight,
            mt: 1,
          }}
        >
          Prepared: {today}
        </Typography>
      </Box>

      {/* Items */}
      <ReportSectionTitle>Personal Property Designations</ReportSectionTitle>

      {items.length === 0 ? (
        <Typography
          sx={{
            fontFamily: '"Jost", sans-serif',
            fontSize: '12px',
            color: colors.inkLight,
            fontStyle: 'italic',
            py: 1,
          }}
        >
          No items have been designated for this memorandum.
        </Typography>
      ) : (
        items.map((item, i) => <ItemCard key={item.id} item={item} index={i} />)
      )}

      {/* Signature Block */}
      <Box
        sx={{
          mt: 4,
          pt: 3,
          borderTop: `2px solid ${colors.accentWarm}`,
          '@media print': { breakInside: 'avoid' },
        }}
      >
        <Typography
          sx={{
            fontFamily: '"Jost", sans-serif',
            fontSize: '13px',
            fontWeight: 700,
            color: colors.ink,
            mb: 2.5,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}
        >
          Signature
        </Typography>

        <SignatureLine label={`${ownerType === 'client' ? 'Client' : 'Spouse'} Signature — ${ownerName}`} />
        <SignatureLine label="Witness Signature" />
        <SignatureLine label="Witness Signature" />

        <Typography
          sx={{
            fontFamily: '"Jost", sans-serif',
            fontSize: '10px',
            color: colors.inkLight,
            fontStyle: 'italic',
            mt: 1,
          }}
        >
          This memorandum must be signed and dated to be effective. Keep the signed original with your
          estate planning documents and upload a copy to your MyLifeFolio document vault.
        </Typography>
      </Box>
    </Box>
  );
};

// ─── Main Export ─────────────────────────────────────────────────────────────

const PersonalPropertyMemorandum: React.FC<PersonalPropertyMemorandumProps> = ({
  intake,
  otherAssets = [],
  ownerType,
  dateCreated,
  dateUpdated,
  embedded = false,
}) => {
  const ownerName =
    ownerType === 'client'
      ? intake.client_name || 'Client'
      : intake.spouse_name || 'Spouse';

  const items = otherAssets.filter((oa) => {
    if (!oa.add_to_personal_property_memo) return false;
    if (ownerType === 'client') return belongsToClient(oa.owner);
    return belongsToSpouse(oa.owner);
  });

  if (embedded) {
    return (
      <MemorandumBody items={items} ownerName={ownerName} ownerType={ownerType} />
    );
  }

  const title =
    ownerType === 'client'
      ? 'Personal Property Memorandum — Client'
      : 'Personal Property Memorandum — Spouse';

  return (
    <ReportLayout
      title={title}
      ownerName={ownerName}
      dateCreated={dateCreated}
      dateUpdated={dateUpdated}
    >
      <MemorandumBody items={items} ownerName={ownerName} ownerType={ownerType} />
    </ReportLayout>
  );
};

export default PersonalPropertyMemorandum;
