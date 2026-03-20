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

// ─── Types ───────────────────────────────────────────────────────────────────

interface FolioIntake {
  client_name: string;
  spouse_name?: string;
  marital_status?: string;
}

interface DigitalAsset {
  id: string;
  owner?: string;
  asset_type?: string;
  platform?: string;
  description?: string;
  value?: number;
  notes?: string;
}

interface Subscription {
  id: string;
  service_name?: string;
  category?: string;
  frequency?: string;
  amount?: number;
  payment_method?: string;
  account_holder?: string;
  login_email?: string;
  auto_renew?: boolean;
  renewal_date?: string;
  is_active?: boolean;
  notes?: string;
}

interface DigitalLifeSummaryProps {
  intake: FolioIntake;
  digitalAssets?: DigitalAsset[];
  subscriptions?: Subscription[];
  dateCreated?: string;
  dateUpdated?: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const fmt = (n?: number | null) => {
  if (!n) return '';
  return new Intl.NumberFormat('en-US', {
    style: 'currency', currency: 'USD',
    minimumFractionDigits: 0, maximumFractionDigits: 0,
  }).format(n);
};

const fmtMonthly = (n?: number | null) => {
  if (!n) return '';
  return new Intl.NumberFormat('en-US', {
    style: 'currency', currency: 'USD',
    minimumFractionDigits: 2, maximumFractionDigits: 2,
  }).format(n);
};

const InfoRow: React.FC<{ label: string; value?: string | null }> = ({ label, value }) => {
  if (!value) return null;
  return (
    <Box sx={{ display: 'flex', gap: 1, mb: 0.4 }}>
      <Typography sx={{
        fontFamily: '"Jost", sans-serif', fontSize: '12px',
        fontWeight: 600, color: colors.inkLight,
        minWidth: 160, flexShrink: 0,
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

// ─── Table helpers ───────────────────────────────────────────────────────────

const thSx = {
  fontFamily: '"Jost", sans-serif',
  fontSize: '10px',
  fontWeight: 700,
  color: colors.inkLight,
  textTransform: 'uppercase' as const,
  letterSpacing: '0.06em',
  px: 1.5,
  py: 1,
  borderBottom: `2px solid ${colors.parchment}`,
  whiteSpace: 'nowrap' as const,
};

const tdSx = {
  fontFamily: '"Jost", sans-serif',
  fontSize: '12px',
  color: colors.ink,
  px: 1.5,
  py: 0.75,
  borderBottom: `1px solid ${colors.cream}`,
  verticalAlign: 'top' as const,
};

const totalRowSx = {
  ...tdSx,
  fontWeight: 700,
  borderTop: `2px solid ${colors.parchment}`,
  borderBottom: 'none',
  bgcolor: colors.cream,
};

// ─── Component ───────────────────────────────────────────────────────────────

const DigitalLifeSummary: React.FC<DigitalLifeSummaryProps> = ({
  intake,
  digitalAssets = [],
  subscriptions = [],
  dateCreated,
  dateUpdated,
}) => {
  const hasSpouse = intake.marital_status &&
    ['Married', 'Second Marriage', 'Domestic Partnership'].includes(intake.marital_status);

  // ── Totals ──
  const digitalAssetsTotal = digitalAssets.reduce((sum, a) => sum + (a.value || 0), 0);

  const activeSubscriptions = subscriptions.filter((s) => s.is_active !== false);
  const inactiveSubscriptions = subscriptions.filter((s) => s.is_active === false);

  const monthlyTotal = activeSubscriptions.reduce((sum, s) => {
    const amt = s.amount || 0;
    if (!amt) return sum;
    switch (s.frequency) {
      case 'Weekly': return sum + amt * 4.33;
      case 'Bi-weekly': return sum + amt * 2.17;
      case 'Monthly': return sum + amt;
      case 'Quarterly': return sum + amt / 3;
      case 'Semi-annually': return sum + amt / 6;
      case 'Annually': return sum + amt / 12;
      default: return sum + amt;
    }
  }, 0);

  const annualTotal = monthlyTotal * 12;

  // Group subscriptions by category
  const subsByCategory = activeSubscriptions.reduce<Record<string, Subscription[]>>((acc, s) => {
    const cat = s.category || 'Other';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(s);
    return acc;
  }, {});

  // Group digital assets by type
  const assetsByType = digitalAssets.reduce<Record<string, DigitalAsset[]>>((acc, a) => {
    const type = a.asset_type || 'Other';
    if (!acc[type]) acc[type] = [];
    acc[type].push(a);
    return acc;
  }, {});

  return (
    <ReportLayout
      title="Digital Life Summary"
      ownerName={intake.client_name}
      dateCreated={dateCreated}
      dateUpdated={dateUpdated}
    >
      {/* ── Section 1: Overview ── */}
      <ReportSectionTitle>Overview</ReportSectionTitle>
      <Box sx={{ mb: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={6}>
            <InfoRow label="Prepared For" value={intake.client_name} />
            {hasSpouse && <InfoRow label="Spouse" value={intake.spouse_name} />}
            <InfoRow label="Marital Status" value={intake.marital_status} />
          </Grid>
          <Grid item xs={6}>
            <InfoRow label="Digital Assets" value={`${digitalAssets.length} item${digitalAssets.length !== 1 ? 's' : ''}`} />
            <InfoRow label="Active Subscriptions" value={`${activeSubscriptions.length} service${activeSubscriptions.length !== 1 ? 's' : ''}`} />
            {inactiveSubscriptions.length > 0 && (
              <InfoRow label="Inactive Subscriptions" value={`${inactiveSubscriptions.length}`} />
            )}
          </Grid>
        </Grid>
      </Box>

      {/* ── Grand totals banner ── */}
      <Box sx={{
        display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap',
        '@media print': { breakInside: 'avoid' },
      }}>
        <Box sx={{
          flex: 1, minWidth: 180, bgcolor: colors.cream,
          border: `1px solid ${colors.parchment}`, borderRadius: 1,
          px: 2, py: 1.5, textAlign: 'center',
        }}>
          <Typography sx={{
            fontFamily: '"Jost", sans-serif', fontSize: '10px',
            fontWeight: 600, color: colors.inkLight, textTransform: 'uppercase',
            letterSpacing: '0.06em', mb: 0.25,
          }}>
            Total Digital Asset Value
          </Typography>
          <Typography sx={{
            fontFamily: '"Jost", sans-serif', fontSize: '20px',
            fontWeight: 700, color: colors.accent,
          }}>
            {fmt(digitalAssetsTotal) || '$0'}
          </Typography>
        </Box>
        <Box sx={{
          flex: 1, minWidth: 180, bgcolor: colors.cream,
          border: `1px solid ${colors.parchment}`, borderRadius: 1,
          px: 2, py: 1.5, textAlign: 'center',
        }}>
          <Typography sx={{
            fontFamily: '"Jost", sans-serif', fontSize: '10px',
            fontWeight: 600, color: colors.inkLight, textTransform: 'uppercase',
            letterSpacing: '0.06em', mb: 0.25,
          }}>
            Est. Monthly Subscriptions
          </Typography>
          <Typography sx={{
            fontFamily: '"Jost", sans-serif', fontSize: '20px',
            fontWeight: 700, color: colors.accent,
          }}>
            {fmtMonthly(monthlyTotal) || '$0.00'}
          </Typography>
        </Box>
        <Box sx={{
          flex: 1, minWidth: 180, bgcolor: colors.cream,
          border: `1px solid ${colors.parchment}`, borderRadius: 1,
          px: 2, py: 1.5, textAlign: 'center',
        }}>
          <Typography sx={{
            fontFamily: '"Jost", sans-serif', fontSize: '10px',
            fontWeight: 600, color: colors.inkLight, textTransform: 'uppercase',
            letterSpacing: '0.06em', mb: 0.25,
          }}>
            Est. Annual Subscriptions
          </Typography>
          <Typography sx={{
            fontFamily: '"Jost", sans-serif', fontSize: '20px',
            fontWeight: 700, color: colors.accent,
          }}>
            {fmtMonthly(annualTotal) || '$0.00'}
          </Typography>
        </Box>
      </Box>

      {/* ── Section 2: Digital Assets & Cryptocurrency ── */}
      <ReportSectionTitle>Digital Assets &amp; Cryptocurrency</ReportSectionTitle>
      {digitalAssets.length > 0 ? (
        <>
          {Object.entries(assetsByType).map(([type, assets]) => {
            const typeTotal = assets.reduce((s, a) => s + (a.value || 0), 0);
            return (
              <Box key={type} sx={{ mb: 2, '@media print': { breakInside: 'avoid' } }}>
                <Typography sx={{
                  fontFamily: '"Jost", sans-serif', fontSize: '12px',
                  fontWeight: 700, color: colors.accent, mb: 0.5,
                  textTransform: 'uppercase', letterSpacing: '0.04em',
                }}>
                  {type}
                </Typography>
                <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse' }}>
                  <Box component="thead">
                    <Box component="tr">
                      <Box component="th" sx={{ ...thSx, textAlign: 'left' }}>Platform</Box>
                      <Box component="th" sx={{ ...thSx, textAlign: 'left' }}>Description</Box>
                      <Box component="th" sx={{ ...thSx, textAlign: 'left' }}>Owner</Box>
                      <Box component="th" sx={{ ...thSx, textAlign: 'right' }}>Value</Box>
                    </Box>
                  </Box>
                  <Box component="tbody">
                    {assets.map((asset) => (
                      <Box component="tr" key={asset.id}>
                        <Box component="td" sx={tdSx}>{asset.platform || '-'}</Box>
                        <Box component="td" sx={tdSx}>
                          {asset.description || '-'}
                          {asset.notes && (
                            <Typography sx={{
                              fontFamily: '"Jost", sans-serif', fontSize: '10px',
                              color: colors.inkLight, fontStyle: 'italic',
                            }}>
                              {asset.notes}
                            </Typography>
                          )}
                        </Box>
                        <Box component="td" sx={tdSx}>{asset.owner || '-'}</Box>
                        <Box component="td" sx={{ ...tdSx, textAlign: 'right', whiteSpace: 'nowrap' }}>
                          {fmt(asset.value) || '-'}
                        </Box>
                      </Box>
                    ))}
                    <Box component="tr">
                      <Box component="td" sx={{ ...totalRowSx }} colSpan={3}>
                        {type} Subtotal
                      </Box>
                      <Box component="td" sx={{ ...totalRowSx, textAlign: 'right' }}>
                        {fmt(typeTotal)}
                      </Box>
                    </Box>
                  </Box>
                </Box>
              </Box>
            );
          })}

          {/* Grand total */}
          {Object.keys(assetsByType).length > 1 && (
            <Box sx={{
              display: 'flex', justifyContent: 'flex-end', mt: 1, mb: 3,
              '@media print': { breakInside: 'avoid' },
            }}>
              <Box sx={{
                bgcolor: colors.ink, color: '#fff',
                px: 3, py: 1, borderRadius: 1,
                display: 'flex', gap: 3, alignItems: 'center',
              }}>
                <Typography sx={{
                  fontFamily: '"Jost", sans-serif', fontSize: '11px',
                  fontWeight: 600, textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                }}>
                  Total Digital Assets
                </Typography>
                <Typography sx={{
                  fontFamily: '"Jost", sans-serif', fontSize: '16px',
                  fontWeight: 700,
                }}>
                  {fmt(digitalAssetsTotal)}
                </Typography>
              </Box>
            </Box>
          )}
        </>
      ) : (
        <Typography sx={{
          fontFamily: '"Jost", sans-serif', fontSize: '12px',
          color: colors.inkLight, fontStyle: 'italic', mb: 3,
        }}>
          No digital assets recorded.
        </Typography>
      )}

      {/* ── Section 3: Active Subscriptions & Recurring Services ── */}
      <ReportSectionTitle>Active Subscriptions &amp; Recurring Services</ReportSectionTitle>
      {activeSubscriptions.length > 0 ? (
        <>
          {Object.entries(subsByCategory).map(([category, subs]) => {
            const catTotal = subs.reduce((s, sub) => s + (sub.amount || 0), 0);
            return (
              <Box key={category} sx={{ mb: 2, '@media print': { breakInside: 'avoid' } }}>
                <Typography sx={{
                  fontFamily: '"Jost", sans-serif', fontSize: '12px',
                  fontWeight: 700, color: colors.accent, mb: 0.5,
                  textTransform: 'uppercase', letterSpacing: '0.04em',
                }}>
                  {category}
                </Typography>
                <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse' }}>
                  <Box component="thead">
                    <Box component="tr">
                      <Box component="th" sx={{ ...thSx, textAlign: 'left' }}>Service</Box>
                      <Box component="th" sx={{ ...thSx, textAlign: 'left' }}>Account Holder</Box>
                      <Box component="th" sx={{ ...thSx, textAlign: 'left' }}>Frequency</Box>
                      <Box component="th" sx={{ ...thSx, textAlign: 'left' }}>Payment</Box>
                      <Box component="th" sx={{ ...thSx, textAlign: 'center' }}>Auto-Renew</Box>
                      <Box component="th" sx={{ ...thSx, textAlign: 'right' }}>Amount</Box>
                    </Box>
                  </Box>
                  <Box component="tbody">
                    {subs.map((sub) => (
                      <Box component="tr" key={sub.id}>
                        <Box component="td" sx={tdSx}>
                          {sub.service_name || '-'}
                          {sub.login_email && (
                            <Typography sx={{
                              fontFamily: '"Jost", sans-serif', fontSize: '10px',
                              color: colors.inkLight,
                            }}>
                              {sub.login_email}
                            </Typography>
                          )}
                        </Box>
                        <Box component="td" sx={tdSx}>{sub.account_holder || '-'}</Box>
                        <Box component="td" sx={tdSx}>{sub.frequency || '-'}</Box>
                        <Box component="td" sx={tdSx}>{sub.payment_method || '-'}</Box>
                        <Box component="td" sx={{ ...tdSx, textAlign: 'center' }}>
                          {sub.auto_renew ? (
                            <Chip label="Yes" size="small" sx={{
                              fontSize: '9px', height: 18,
                              bgcolor: colors.cream, color: colors.ink,
                              border: `1px solid ${colors.parchment}`,
                            }} />
                          ) : (
                            <Chip label="No" size="small" variant="outlined" sx={{
                              fontSize: '9px', height: 18,
                              borderColor: colors.parchment, color: colors.inkLight,
                            }} />
                          )}
                        </Box>
                        <Box component="td" sx={{ ...tdSx, textAlign: 'right', whiteSpace: 'nowrap' }}>
                          {fmtMonthly(sub.amount) || '-'}
                        </Box>
                      </Box>
                    ))}
                    <Box component="tr">
                      <Box component="td" sx={totalRowSx} colSpan={5}>
                        {category} Subtotal
                      </Box>
                      <Box component="td" sx={{ ...totalRowSx, textAlign: 'right' }}>
                        {fmtMonthly(catTotal)}
                      </Box>
                    </Box>
                  </Box>
                </Box>
              </Box>
            );
          })}

          {/* Monthly / Annual summary */}
          <Box sx={{
            display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 1, mb: 3,
            flexWrap: 'wrap',
            '@media print': { breakInside: 'avoid' },
          }}>
            <Box sx={{
              bgcolor: colors.ink, color: '#fff',
              px: 3, py: 1, borderRadius: 1,
              display: 'flex', gap: 3, alignItems: 'center',
            }}>
              <Typography sx={{
                fontFamily: '"Jost", sans-serif', fontSize: '11px',
                fontWeight: 600, textTransform: 'uppercase',
                letterSpacing: '0.06em',
              }}>
                Est. Monthly
              </Typography>
              <Typography sx={{
                fontFamily: '"Jost", sans-serif', fontSize: '16px',
                fontWeight: 700,
              }}>
                {fmtMonthly(monthlyTotal)}
              </Typography>
            </Box>
            <Box sx={{
              bgcolor: colors.accent, color: '#fff',
              px: 3, py: 1, borderRadius: 1,
              display: 'flex', gap: 3, alignItems: 'center',
            }}>
              <Typography sx={{
                fontFamily: '"Jost", sans-serif', fontSize: '11px',
                fontWeight: 600, textTransform: 'uppercase',
                letterSpacing: '0.06em',
              }}>
                Est. Annual
              </Typography>
              <Typography sx={{
                fontFamily: '"Jost", sans-serif', fontSize: '16px',
                fontWeight: 700,
              }}>
                {fmtMonthly(annualTotal)}
              </Typography>
            </Box>
          </Box>
        </>
      ) : (
        <Typography sx={{
          fontFamily: '"Jost", sans-serif', fontSize: '12px',
          color: colors.inkLight, fontStyle: 'italic', mb: 3,
        }}>
          No active subscriptions recorded.
        </Typography>
      )}

      {/* ── Section 4: Inactive / Cancelled Subscriptions ── */}
      {inactiveSubscriptions.length > 0 && (
        <>
          <ReportSectionTitle>Inactive / Cancelled Subscriptions</ReportSectionTitle>
          <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse', mb: 3 }}>
            <Box component="thead">
              <Box component="tr">
                <Box component="th" sx={{ ...thSx, textAlign: 'left' }}>Service</Box>
                <Box component="th" sx={{ ...thSx, textAlign: 'left' }}>Category</Box>
                <Box component="th" sx={{ ...thSx, textAlign: 'left' }}>Account</Box>
                <Box component="th" sx={{ ...thSx, textAlign: 'left' }}>Notes</Box>
              </Box>
            </Box>
            <Box component="tbody">
              {inactiveSubscriptions.map((sub) => (
                <Box component="tr" key={sub.id} sx={{ opacity: 0.7 }}>
                  <Box component="td" sx={tdSx}>{sub.service_name || '-'}</Box>
                  <Box component="td" sx={tdSx}>{sub.category || '-'}</Box>
                  <Box component="td" sx={tdSx}>{sub.login_email || sub.account_holder || '-'}</Box>
                  <Box component="td" sx={tdSx}>{sub.notes || '-'}</Box>
                </Box>
              ))}
            </Box>
          </Box>
        </>
      )}

      {/* ── Section 5: Important Notes ── */}
      <ReportSectionTitle>Important Notes</ReportSectionTitle>
      <Box sx={{
        bgcolor: colors.cream, border: `1px solid ${colors.parchment}`,
        borderRadius: 1, px: 2.5, py: 2, mb: 3,
        '@media print': { breakInside: 'avoid' },
      }}>
        <Typography sx={{
          fontFamily: '"Jost", sans-serif', fontSize: '12px',
          color: colors.ink, lineHeight: 1.8,
        }}>
          &bull; Online account credentials are stored in an encrypted vault and are not included in this report for security reasons.
          <br />
          &bull; Digital asset values shown are approximate and may fluctuate significantly (especially cryptocurrency).
          <br />
          &bull; Subscription amounts reflect the most recent recorded cost; actual charges may vary.
          <br />
          &bull; Contact the designated Power of Attorney agent or Executor/Trustee for credential vault access instructions.
        </Typography>
      </Box>
    </ReportLayout>
  );
};

export default DigitalLifeSummary;
