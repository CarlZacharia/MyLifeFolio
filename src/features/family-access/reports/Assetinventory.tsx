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
}

interface BankAccount {
  id: string;
  owner?: string;
  account_type?: string;
  institution?: string;
  amount?: number;
  has_beneficiaries?: boolean;
  primary_beneficiaries?: string[];
  notes?: string;
  sort_order?: number;
}

interface Investment {
  id: string;
  owner?: string;
  institution?: string;
  description?: string;
  value?: number;
  has_beneficiaries?: boolean;
  primary_beneficiaries?: string[];
  notes?: string;
  sort_order?: number;
}

interface RetirementAccount {
  id: string;
  owner?: string;
  institution?: string;
  account_type?: string;
  value?: number;
  has_beneficiaries?: boolean;
  primary_beneficiaries?: string[];
  notes?: string;
  sort_order?: number;
}

interface RealEstate {
  id: string;
  owner?: string;
  ownership_form?: string;
  category?: string;
  street?: string;
  city?: string;
  state?: string;
  zip?: string;
  value?: number;
  mortgage_balance?: number;
  cost_basis?: number;
  notes?: string;
  sort_order?: number;
}

interface Vehicle {
  id: string;
  owner?: string;
  year_make_model?: string;
  value?: number;
  has_beneficiaries?: boolean;
  primary_beneficiaries?: string[];
  notes?: string;
  sort_order?: number;
}

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
  notes?: string;
  sort_order?: number;
}

interface BusinessInterest {
  id: string;
  owner?: string;
  business_name?: string;
  entity_type?: string;
  ownership_percentage?: string;
  full_value?: number;
  co_owners?: string;
  has_buy_sell_agreement?: boolean;
  notes?: string;
  sort_order?: number;
}

interface DigitalAsset {
  id: string;
  owner?: string;
  asset_type?: string;
  platform?: string;
  description?: string;
  value?: number;
  notes?: string;
  sort_order?: number;
}

interface OtherAsset {
  id: string;
  owner?: string;
  description?: string;
  value?: number;
  has_beneficiaries?: boolean;
  primary_beneficiaries?: string[];
  notes?: string;
  sort_order?: number;
}

interface AssetInventoryProps {
  intake: FolioIntake;
  bankAccounts?: BankAccount[];
  investments?: Investment[];
  retirementAccounts?: RetirementAccount[];
  realEstate?: RealEstate[];
  vehicles?: Vehicle[];
  lifeInsurance?: LifeInsurance[];
  businessInterests?: BusinessInterest[];
  digitalAssets?: DigitalAsset[];
  otherAssets?: OtherAsset[];
  dateCreated?: string;
  dateUpdated?: string;
}

// ─── Formatting helpers ───────────────────────────────────────────────────────

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
  bold?: boolean;
}> = ({ cols, widths, zebra, bold }) => (
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
          fontWeight: bold ? 700 : 400,
          color: colors.ink,
        }}
      >
        {col ?? '—'}
      </Typography>
    ))}
  </Box>
);

/** Subtotal row — gold background, right-aligned value */
const SubtotalRow: React.FC<{
  label: string;
  value: number;
  widths?: string[];
  colCount: number;
}> = ({ label, value, widths, colCount }) => (
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
          textAlign: i === colCount - 1 ? 'left' : 'left',
        }}
      >
        {i === 0
          ? label
          : i === colCount - 1
          ? fmt(value)
          : ''}
      </Typography>
    ))}
  </Box>
);

/** Grand total banner */
const GrandTotalBanner: React.FC<{ total: number; netTotal?: number; mortgageTotal?: number }> = ({
  total,
  netTotal,
  mortgageTotal,
}) => (
  <Box
    sx={{
      mt: 3,
      border: `2px solid ${colors.accentWarm}`,
      borderRadius: 2,
      overflow: 'hidden',
      '@media print': { breakInside: 'avoid' },
    }}
  >
    <Box
      sx={{
        bgcolor: colors.ink,
        px: 3,
        py: 1.25,
      }}
    >
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
        Total Asset Summary
      </Typography>
    </Box>
    <Box sx={{ bgcolor: colors.cream, px: 3, py: 2 }}>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={mortgageTotal ? 4 : 6}>
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
            Gross Asset Value
          </Typography>
          <Typography
            sx={{
              fontFamily: '"Jost", sans-serif',
              fontSize: '24px',
              fontWeight: 700,
              color: colors.ink,
            }}
          >
            {fmt(total)}
          </Typography>
        </Grid>
        {mortgageTotal !== undefined && mortgageTotal > 0 && (
          <Grid item xs={12} sm={4}>
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
              Total Mortgages / Liens
            </Typography>
            <Typography
              sx={{
                fontFamily: '"Jost", sans-serif',
                fontSize: '24px',
                fontWeight: 700,
                color: '#c0392b',
              }}
            >
              ({fmt(mortgageTotal)})
            </Typography>
          </Grid>
        )}
        {netTotal !== undefined && (
          <Grid item xs={12} sm={mortgageTotal && mortgageTotal > 0 ? 4 : 6}>
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
              Net Asset Value
            </Typography>
            <Typography
              sx={{
                fontFamily: '"Jost", sans-serif',
                fontSize: '24px',
                fontWeight: 700,
                color: colors.accent,
              }}
            >
              {fmt(netTotal)}
            </Typography>
          </Grid>
        )}
      </Grid>
    </Box>
  </Box>
);

/** Category summary table shown before grand total */
const CategorySummaryTable: React.FC<{
  rows: { label: string; value: number }[];
}> = ({ rows }) => {
  const filtered = rows.filter((r) => r.value > 0);
  if (filtered.length === 0) return null;
  return (
    <Box sx={{ mt: 3, '@media print': { breakInside: 'avoid' } }}>
      <ReportSectionTitle>Asset Summary by Category</ReportSectionTitle>
      <TableHeader cols={['Asset Category', 'Total Value']} widths={['3fr', '1fr']} />
      {filtered.map((row, i) => (
        <TableRow
          key={row.label}
          zebra={i % 2 === 1}
          widths={['3fr', '1fr']}
          cols={[row.label, fmt(row.value)]}
        />
      ))}
    </Box>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const AssetInventory: React.FC<AssetInventoryProps> = ({
  intake,
  bankAccounts = [],
  investments = [],
  retirementAccounts = [],
  realEstate = [],
  vehicles = [],
  lifeInsurance = [],
  businessInterests = [],
  digitalAssets = [],
  otherAssets = [],
  dateCreated,
  dateUpdated,
}) => {
  // ── Category totals ──
  const bankTotal        = sum(bankAccounts.map((a) => a.amount));
  const investmentTotal  = sum(investments.map((a) => a.value));
  const retirementTotal  = sum(retirementAccounts.map((a) => a.value));
  const realEstateTotal  = sum(realEstate.map((a) => a.value));
  const mortgageTotal    = sum(realEstate.map((a) => a.mortgage_balance));
  const vehicleTotal     = sum(vehicles.map((a) => a.value));
  const lifeInsuranceCashTotal = sum(lifeInsurance.map((a) => a.cash_value));
  const lifeInsuranceDeathTotal = sum(lifeInsurance.map((a) => a.death_benefit ?? a.face_amount));
  const businessTotal    = sum(businessInterests.map((a) => a.full_value));
  const digitalTotal     = sum(digitalAssets.map((a) => a.value));
  const otherTotal       = sum(otherAssets.map((a) => a.value));

  const grossTotal =
    bankTotal +
    investmentTotal +
    retirementTotal +
    realEstateTotal +
    vehicleTotal +
    lifeInsuranceCashTotal +
    businessTotal +
    digitalTotal +
    otherTotal;

  const netTotal = grossTotal - mortgageTotal;

  const categorySummary = [
    { label: 'Bank & Cash Accounts', value: bankTotal },
    { label: 'Investments & Brokerage', value: investmentTotal },
    { label: 'Retirement Accounts', value: retirementTotal },
    { label: 'Real Estate (Gross)', value: realEstateTotal },
    { label: 'Vehicles', value: vehicleTotal },
    { label: 'Life Insurance (Cash Value)', value: lifeInsuranceCashTotal },
    { label: 'Business Interests', value: businessTotal },
    { label: 'Digital Assets', value: digitalTotal },
    { label: 'Other Assets', value: otherTotal },
  ];

  const beneficiaryList = (arr?: string[]) =>
    arr && arr.length > 0 ? arr.join(', ') : '—';

  return (
    <ReportLayout
      title="Asset Inventory"
      ownerName={intake.client_name}
      dateCreated={dateCreated}
      dateUpdated={dateUpdated}
    >

      {/* ── 1. Bank & Cash Accounts ── */}
      <ReportSectionTitle>Bank &amp; Cash Accounts</ReportSectionTitle>
      {bankAccounts.length === 0 ? (
        <EmptyState message="No bank accounts on record." />
      ) : (
        <>
          <TableHeader
            cols={['Owner', 'Type', 'Institution', 'Beneficiaries', 'Balance']}
            widths={['1fr', '1fr', '1.5fr', '2fr', '1fr']}
          />
          {bankAccounts
            .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
            .map((a, i) => (
              <TableRow
                key={a.id}
                zebra={i % 2 === 1}
                widths={['1fr', '1fr', '1.5fr', '2fr', '1fr']}
                cols={[
                  a.owner || '—',
                  a.account_type || '—',
                  a.institution || '—',
                  a.has_beneficiaries ? beneficiaryList(a.primary_beneficiaries) : 'None',
                  fmt(a.amount),
                ]}
              />
            ))}
          <SubtotalRow
            label="Bank & Cash Subtotal"
            value={bankTotal}
            widths={['1fr', '1fr', '1.5fr', '2fr', '1fr']}
            colCount={5}
          />
        </>
      )}

      {/* ── 2. Investments ── */}
      <ReportSectionTitle>Investments &amp; Brokerage</ReportSectionTitle>
      {investments.length === 0 ? (
        <EmptyState message="No investment accounts on record." />
      ) : (
        <>
          <TableHeader
            cols={['Owner', 'Institution', 'Description', 'Beneficiaries', 'Value']}
            widths={['1fr', '1.5fr', '1.5fr', '2fr', '1fr']}
          />
          {investments
            .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
            .map((a, i) => (
              <TableRow
                key={a.id}
                zebra={i % 2 === 1}
                widths={['1fr', '1.5fr', '1.5fr', '2fr', '1fr']}
                cols={[
                  a.owner || '—',
                  a.institution || '—',
                  a.description || '—',
                  a.has_beneficiaries ? beneficiaryList(a.primary_beneficiaries) : 'None',
                  fmt(a.value),
                ]}
              />
            ))}
          <SubtotalRow
            label="Investments Subtotal"
            value={investmentTotal}
            widths={['1fr', '1.5fr', '1.5fr', '2fr', '1fr']}
            colCount={5}
          />
        </>
      )}

      {/* ── 3. Retirement Accounts ── */}
      <ReportSectionTitle>Retirement Accounts</ReportSectionTitle>
      {retirementAccounts.length === 0 ? (
        <EmptyState message="No retirement accounts on record." />
      ) : (
        <>
          <TableHeader
            cols={['Owner', 'Type', 'Institution', 'Beneficiaries', 'Value']}
            widths={['1fr', '1fr', '1.5fr', '2fr', '1fr']}
          />
          {retirementAccounts
            .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
            .map((a, i) => (
              <TableRow
                key={a.id}
                zebra={i % 2 === 1}
                widths={['1fr', '1fr', '1.5fr', '2fr', '1fr']}
                cols={[
                  a.owner || '—',
                  a.account_type || '—',
                  a.institution || '—',
                  a.has_beneficiaries ? beneficiaryList(a.primary_beneficiaries) : 'None',
                  fmt(a.value),
                ]}
              />
            ))}
          <SubtotalRow
            label="Retirement Subtotal"
            value={retirementTotal}
            widths={['1fr', '1fr', '1.5fr', '2fr', '1fr']}
            colCount={5}
          />
        </>
      )}

      {/* ── 4. Real Estate ── */}
      <ReportSectionTitle>Real Estate</ReportSectionTitle>
      {realEstate.length === 0 ? (
        <EmptyState message="No real estate on record." />
      ) : (
        <>
          <TableHeader
            cols={['Owner', 'Category', 'Address', 'Ownership Form', 'Value', 'Mortgage', 'Net']}
            widths={['1fr', '1fr', '2fr', '1fr', '1fr', '1fr', '1fr']}
          />
          {realEstate
            .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
            .map((a, i) => {
              const address = [a.street, a.city, a.state, a.zip].filter(Boolean).join(', ');
              const net = (a.value ?? 0) - (a.mortgage_balance ?? 0);
              return (
                <TableRow
                  key={a.id}
                  zebra={i % 2 === 1}
                  widths={['1fr', '1fr', '2fr', '1fr', '1fr', '1fr', '1fr']}
                  cols={[
                    a.owner || '—',
                    a.category || '—',
                    address || '—',
                    a.ownership_form || '—',
                    fmt(a.value),
                    a.mortgage_balance ? `(${fmt(a.mortgage_balance)})` : '—',
                    fmt(net),
                  ]}
                />
              );
            })}
          <SubtotalRow
            label="Real Estate Subtotal (Gross)"
            value={realEstateTotal}
            widths={['1fr', '1fr', '2fr', '1fr', '1fr', '1fr', '1fr']}
            colCount={7}
          />
        </>
      )}

      {/* ── 5. Vehicles ── */}
      <ReportSectionTitle>Vehicles</ReportSectionTitle>
      {vehicles.length === 0 ? (
        <EmptyState message="No vehicles on record." />
      ) : (
        <>
          <TableHeader
            cols={['Owner', 'Year / Make / Model', 'Beneficiaries', 'Value']}
            widths={['1fr', '2fr', '2fr', '1fr']}
          />
          {vehicles
            .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
            .map((a, i) => (
              <TableRow
                key={a.id}
                zebra={i % 2 === 1}
                widths={['1fr', '2fr', '2fr', '1fr']}
                cols={[
                  a.owner || '—',
                  a.year_make_model || '—',
                  a.has_beneficiaries ? beneficiaryList(a.primary_beneficiaries) : 'None',
                  fmt(a.value),
                ]}
              />
            ))}
          <SubtotalRow
            label="Vehicles Subtotal"
            value={vehicleTotal}
            widths={['1fr', '2fr', '2fr', '1fr']}
            colCount={4}
          />
        </>
      )}

      {/* ── 6. Life Insurance ── */}
      <ReportSectionTitle>Life Insurance</ReportSectionTitle>
      {lifeInsurance.length === 0 ? (
        <EmptyState message="No life insurance on record." />
      ) : (
        <>
          <TableHeader
            cols={['Owner', 'Company', 'Type', 'Insured', 'Face Amount', 'Death Benefit', 'Cash Value']}
            widths={['1fr', '1.5fr', '1fr', '1fr', '1fr', '1fr', '1fr']}
          />
          {lifeInsurance
            .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
            .map((a, i) => (
              <TableRow
                key={a.id}
                zebra={i % 2 === 1}
                widths={['1fr', '1.5fr', '1fr', '1fr', '1fr', '1fr', '1fr']}
                cols={[
                  a.owner || '—',
                  a.company || '—',
                  a.policy_type || '—',
                  a.insured || '—',
                  fmt(a.face_amount),
                  fmt(a.death_benefit),
                  fmt(a.cash_value),
                ]}
              />
            ))}
          <SubtotalRow
            label="Life Insurance Cash Value Subtotal"
            value={lifeInsuranceCashTotal}
            widths={['1fr', '1.5fr', '1fr', '1fr', '1fr', '1fr', '1fr']}
            colCount={7}
          />
          {/* Death benefit note */}
          <Box
            sx={{
              mt: 0.5,
              px: 1.5,
              py: 0.75,
              bgcolor: colors.cream,
              border: `1px solid ${colors.parchment}`,
              borderRadius: 1,
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
              Total Death Benefit (not included in gross asset value):{' '}
              <strong style={{ color: colors.ink }}>{fmt(lifeInsuranceDeathTotal)}</strong>
            </Typography>
          </Box>
        </>
      )}

      {/* ── 7. Business Interests ── */}
      <ReportSectionTitle>Business Interests</ReportSectionTitle>
      {businessInterests.length === 0 ? (
        <EmptyState message="No business interests on record." />
      ) : (
        <>
          <TableHeader
            cols={['Owner', 'Business Name', 'Entity Type', 'Ownership %', 'Co-Owners', 'Buy-Sell', 'Full Value']}
            widths={['1fr', '1.5fr', '1fr', '0.75fr', '1.5fr', '0.75fr', '1fr']}
          />
          {businessInterests
            .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
            .map((a, i) => (
              <TableRow
                key={a.id}
                zebra={i % 2 === 1}
                widths={['1fr', '1.5fr', '1fr', '0.75fr', '1.5fr', '0.75fr', '1fr']}
                cols={[
                  a.owner || '—',
                  a.business_name || '—',
                  a.entity_type || '—',
                  a.ownership_percentage || '—',
                  a.co_owners || '—',
                  a.has_buy_sell_agreement ? 'Yes' : 'No',
                  fmt(a.full_value),
                ]}
              />
            ))}
          <SubtotalRow
            label="Business Interests Subtotal"
            value={businessTotal}
            widths={['1fr', '1.5fr', '1fr', '0.75fr', '1.5fr', '0.75fr', '1fr']}
            colCount={7}
          />
        </>
      )}

      {/* ── 8. Digital Assets ── */}
      {digitalAssets.length > 0 && (
        <>
          <ReportSectionTitle>Digital Assets</ReportSectionTitle>
          <TableHeader
            cols={['Owner', 'Type', 'Platform', 'Description', 'Value']}
            widths={['1fr', '1fr', '1fr', '2fr', '1fr']}
          />
          {digitalAssets
            .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
            .map((a, i) => (
              <TableRow
                key={a.id}
                zebra={i % 2 === 1}
                widths={['1fr', '1fr', '1fr', '2fr', '1fr']}
                cols={[
                  a.owner || '—',
                  a.asset_type || '—',
                  a.platform || '—',
                  a.description || '—',
                  fmt(a.value),
                ]}
              />
            ))}
          <SubtotalRow
            label="Digital Assets Subtotal"
            value={digitalTotal}
            widths={['1fr', '1fr', '1fr', '2fr', '1fr']}
            colCount={5}
          />
        </>
      )}

      {/* ── 9. Other Assets ── */}
      {otherAssets.length > 0 && (
        <>
          <ReportSectionTitle>Other Assets</ReportSectionTitle>
          <TableHeader
            cols={['Owner', 'Description', 'Beneficiaries', 'Value']}
            widths={['1fr', '2fr', '2fr', '1fr']}
          />
          {otherAssets
            .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
            .map((a, i) => (
              <TableRow
                key={a.id}
                zebra={i % 2 === 1}
                widths={['1fr', '2fr', '2fr', '1fr']}
                cols={[
                  a.owner || '—',
                  a.description || '—',
                  a.has_beneficiaries ? beneficiaryList(a.primary_beneficiaries) : 'None',
                  fmt(a.value),
                ]}
              />
            ))}
          <SubtotalRow
            label="Other Assets Subtotal"
            value={otherTotal}
            widths={['1fr', '2fr', '2fr', '1fr']}
            colCount={4}
          />
        </>
      )}

      {/* ── Category Summary + Grand Total ── */}
      <CategorySummaryTable rows={categorySummary} />

      <GrandTotalBanner
        total={grossTotal}
        mortgageTotal={mortgageTotal}
        netTotal={netTotal}
      />

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
          Asset values are self-reported estimates and may not reflect current market values.
          Life insurance death benefits are not included in gross asset value totals.
          This report is confidential and intended for authorized recipients only.
        </Typography>
      </Box>
    </ReportLayout>
  );
};

export default AssetInventory;

/* ─────────────────────────────────────────────────────────────────────────────
 * USAGE EXAMPLE:
 *
 * import AssetInventory from './reports/AssetInventory';
 *
 * const { data: intake }            = await supabase.from('folio_intakes').select('*').eq('id', intakeId).single();
 * const { data: bankAccounts }      = await supabase.from('folio_bank_accounts').select('*').eq('intake_id', intakeId).order('sort_order');
 * const { data: investments }       = await supabase.from('folio_investments').select('*').eq('intake_id', intakeId).order('sort_order');
 * const { data: retirementAccounts }= await supabase.from('folio_retirement_accounts').select('*').eq('intake_id', intakeId).order('sort_order');
 * const { data: realEstate }        = await supabase.from('folio_real_estate').select('*').eq('intake_id', intakeId).order('sort_order');
 * const { data: vehicles }          = await supabase.from('folio_vehicles').select('*').eq('intake_id', intakeId).order('sort_order');
 * const { data: lifeInsurance }     = await supabase.from('folio_life_insurance').select('*').eq('intake_id', intakeId).order('sort_order');
 * const { data: businessInterests } = await supabase.from('folio_business_interests').select('*').eq('intake_id', intakeId).order('sort_order');
 * const { data: digitalAssets }     = await supabase.from('folio_digital_assets').select('*').eq('intake_id', intakeId).order('sort_order');
 * const { data: otherAssets }       = await supabase.from('folio_other_assets').select('*').eq('intake_id', intakeId).order('sort_order');
 *
 * <AssetInventory
 *   intake={intake}
 *   bankAccounts={bankAccounts}
 *   investments={investments}
 *   retirementAccounts={retirementAccounts}
 *   realEstate={realEstate}
 *   vehicles={vehicles}
 *   lifeInsurance={lifeInsurance}
 *   businessInterests={businessInterests}
 *   digitalAssets={digitalAssets}
 *   otherAssets={otherAssets}
 *   dateCreated={intake.created_at}
 *   dateUpdated={intake.updated_at}
 * />
 * ───────────────────────────────────────────────────────────────────────────── */