'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Chip,
  IconButton,
  MenuItem,
  Tooltip,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  InputAdornment,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import LockIcon from '@mui/icons-material/Lock';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import GavelIcon from '@mui/icons-material/Gavel';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import VerifiedIcon from '@mui/icons-material/Verified';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/AuthContext';
import { decryptField } from '../lib/vaultCrypto';
import CredentialForm, { type CredentialAccount, EMPTY_CREDENTIAL, ACCOUNT_TYPES } from './CredentialForm';
import VaultManagement from './VaultManagement';

// ─── Types ──────────────────────────────────────────────────────────────────

interface CredentialRow {
  id: string;
  account_nickname: string | null;
  account_type: string | null;
  platform_name: string;
  account_url: string | null;
  login_email: string | null;
  two_factor_enabled: boolean;
  two_factor_method: string | null;
  phone_on_account: string | null;
  on_death_action: string | null;
  on_incapacity_action: string | null;
  special_notes: string | null;
  poa_can_access: boolean;
  executor_can_access: boolean;
  importance_tier: string;
  linked_payment_method: string | null;
  last_verified_at: string | null;
  enc_password: string | null;
  enc_pin: string | null;
  enc_security_qa: string | null;
  enc_backup_codes: string | null;
  enc_authenticator_note: string | null;
  enc_recovery_email: string | null;
  created_at: string;
  updated_at: string;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

const importanceColors: Record<string, string> = {
  critical: '#d32f2f',
  moderate: '#ed6c02',
  low: '#757575',
};

const typeLabels: Record<string, string> = Object.fromEntries(
  ACCOUNT_TYPES.map((t) => [t.value, t.label])
);

// ─── Component ──────────────────────────────────────────────────────────────

interface CredentialsListProps {
  vaultKey: CryptoKey;
  onLockVault: () => void;
  onVaultKeyChanged: (newKey: CryptoKey) => void;
}

const CredentialsList: React.FC<CredentialsListProps> = ({ vaultKey, onLockVault, onVaultKeyChanged }) => {
  const { user } = useAuth();
  const [credentials, setCredentials] = useState<CredentialRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('');
  const [sortBy, setSortBy] = useState<'platform_name' | 'account_type' | 'importance_tier' | 'last_verified_at'>('platform_name');

  // Edit/Add state
  const [editing, setEditing] = useState<CredentialAccount | null>(null);
  const [showForm, setShowForm] = useState(false);

  // Delete confirmation
  const [deleteTarget, setDeleteTarget] = useState<CredentialRow | null>(null);

  // Revealed passwords (per credential id)
  const [revealed, setRevealed] = useState<Record<string, Record<string, string>>>({});

  const loadCredentials = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error: dbError } = await supabase
        .from('credential_accounts')
        .select('*')
        .eq('user_id', user.id)
        .order('platform_name');
      if (dbError) throw dbError;
      setCredentials(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load credentials');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCredentials();
  }, [user]);

  // Filter & sort
  const filtered = useMemo(() => {
    let list = [...credentials];

    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (c) =>
          c.platform_name.toLowerCase().includes(q) ||
          (c.account_nickname && c.account_nickname.toLowerCase().includes(q)) ||
          (c.login_email && c.login_email.toLowerCase().includes(q))
      );
    }

    if (filterType) {
      list = list.filter((c) => c.account_type === filterType);
    }

    list.sort((a, b) => {
      if (sortBy === 'importance_tier') {
        const order = { critical: 0, moderate: 1, low: 2 };
        return (order[a.importance_tier as keyof typeof order] ?? 1) - (order[b.importance_tier as keyof typeof order] ?? 1);
      }
      const aVal = (a[sortBy] || '').toString().toLowerCase();
      const bVal = (b[sortBy] || '').toString().toLowerCase();
      return aVal.localeCompare(bVal);
    });

    return list;
  }, [credentials, search, filterType, sortBy]);

  // Group by account type
  const grouped = useMemo(() => {
    const groups: Record<string, CredentialRow[]> = {};
    for (const cred of filtered) {
      const type = cred.account_type || 'other';
      if (!groups[type]) groups[type] = [];
      groups[type].push(cred);
    }
    return groups;
  }, [filtered]);

  const handleEdit = async (row: CredentialRow) => {
    // Decrypt encrypted fields for editing
    try {
      const password = row.enc_password ? await decryptField(row.enc_password, vaultKey) : '';
      const pin = row.enc_pin ? await decryptField(row.enc_pin, vaultKey) : '';
      const security_qa = row.enc_security_qa
        ? JSON.parse(await decryptField(row.enc_security_qa, vaultKey))
        : [];
      const backup_codes = row.enc_backup_codes ? await decryptField(row.enc_backup_codes, vaultKey) : '';
      const authenticator_note = row.enc_authenticator_note
        ? await decryptField(row.enc_authenticator_note, vaultKey)
        : '';
      const recovery_email = row.enc_recovery_email
        ? await decryptField(row.enc_recovery_email, vaultKey)
        : '';

      setEditing({
        id: row.id,
        account_nickname: row.account_nickname || '',
        account_type: row.account_type || '',
        platform_name: row.platform_name,
        account_url: row.account_url || '',
        login_email: row.login_email || '',
        two_factor_enabled: row.two_factor_enabled,
        two_factor_method: row.two_factor_method || '',
        phone_on_account: row.phone_on_account || '',
        on_death_action: row.on_death_action || '',
        on_incapacity_action: row.on_incapacity_action || '',
        special_notes: row.special_notes || '',
        poa_can_access: row.poa_can_access,
        executor_can_access: row.executor_can_access,
        importance_tier: row.importance_tier,
        linked_payment_method: row.linked_payment_method || '',
        last_verified_at: row.last_verified_at || '',
        password,
        pin,
        security_qa,
        backup_codes,
        authenticator_note,
        recovery_email,
      });
      setShowForm(true);
    } catch {
      setError('Failed to decrypt credential. Your vault key may have changed.');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      const { error: dbError } = await supabase
        .from('credential_accounts')
        .delete()
        .eq('id', deleteTarget.id);
      if (dbError) throw dbError;
      setDeleteTarget(null);
      loadCredentials();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete');
    }
  };

  const toggleReveal = async (credId: string, field: string, encValue: string | null) => {
    if (!encValue) return;
    const credRevealed = revealed[credId] || {};
    if (credRevealed[field]) {
      // Hide it
      setRevealed((prev) => {
        const copy = { ...prev };
        const inner = { ...copy[credId] };
        delete inner[field];
        copy[credId] = inner;
        return copy;
      });
    } else {
      // Decrypt and show
      try {
        const plaintext = await decryptField(encValue, vaultKey);
        setRevealed((prev) => ({
          ...prev,
          [credId]: { ...(prev[credId] || {}), [field]: plaintext },
        }));
      } catch {
        setError('Failed to decrypt field.');
      }
    }
  };

  // ─── Form View ────────────────────────────────────────────────────────────

  if (showForm) {
    return (
      <CredentialForm
        credential={editing || undefined}
        vaultKey={vaultKey}
        onSave={() => {
          setShowForm(false);
          setEditing(null);
          loadCredentials();
        }}
        onCancel={() => {
          setShowForm(false);
          setEditing(null);
        }}
      />
    );
  }

  // ─── List View ────────────────────────────────────────────────────────────

  return (
    <Box>
      {/* Header row */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, flexWrap: 'wrap', gap: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <LockOpenIcon sx={{ color: '#2e7d32', fontSize: 20 }} />
          <Typography variant="subtitle2" sx={{ color: '#2e7d32', fontWeight: 600 }}>
            Vault Unlocked
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Button
            size="small"
            startIcon={<AddIcon />}
            variant="contained"
            onClick={() => { setEditing(null); setShowForm(true); }}
            sx={{ bgcolor: '#00695c', '&:hover': { bgcolor: '#004d40' } }}
          >
            Add Credential
          </Button>
          <VaultManagement
            vaultKey={vaultKey}
            onVaultKeyChanged={onVaultKeyChanged}
          />
          <Button
            size="small"
            startIcon={<LockIcon />}
            variant="outlined"
            onClick={onLockVault}
            sx={{ borderColor: '#d32f2f', color: '#d32f2f' }}
          >
            Lock Vault
          </Button>
        </Box>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}

      {/* Search / filter bar */}
      <Box sx={{ display: 'flex', gap: 1.5, mb: 3, flexWrap: 'wrap' }}>
        <TextField
          size="small"
          placeholder="Search credentials..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start"><SearchIcon sx={{ fontSize: 18 }} /></InputAdornment>
            ),
          }}
          sx={{ flex: 1, minWidth: 200 }}
        />
        <TextField
          size="small"
          select
          label="Type"
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          InputLabelProps={{ shrink: true }}
          sx={{ minWidth: 140 }}
        >
          <MenuItem value="">All Types</MenuItem>
          {ACCOUNT_TYPES.map((t) => (
            <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>
          ))}
        </TextField>
        <TextField
          size="small"
          select
          label="Sort"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
          InputLabelProps={{ shrink: true }}
          sx={{ minWidth: 140 }}
        >
          <MenuItem value="platform_name">Platform Name</MenuItem>
          <MenuItem value="account_type">Account Type</MenuItem>
          <MenuItem value="importance_tier">Importance</MenuItem>
          <MenuItem value="last_verified_at">Last Verified</MenuItem>
        </TextField>
      </Box>

      {/* Credentials list */}
      {loading ? (
        <Typography sx={{ color: 'text.secondary', textAlign: 'center', py: 4 }}>Loading...</Typography>
      ) : credentials.length === 0 ? (
        <Paper variant="outlined" sx={{ p: 4, textAlign: 'center' }}>
          <LockIcon sx={{ fontSize: 40, color: 'text.disabled', mb: 1 }} />
          <Typography variant="body1" sx={{ fontWeight: 500, mb: 1 }}>No credentials stored yet</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
            Add your first account credential to get started.
          </Typography>
          <Button
            startIcon={<AddIcon />}
            variant="contained"
            onClick={() => { setEditing(null); setShowForm(true); }}
            sx={{ bgcolor: '#00695c', '&:hover': { bgcolor: '#004d40' } }}
          >
            Add Credential
          </Button>
        </Paper>
      ) : (
        Object.entries(grouped).map(([type, creds]) => (
          <Box key={type} sx={{ mb: 3 }}>
            <Typography
              variant="overline"
              sx={{ color: 'text.secondary', fontWeight: 600, letterSpacing: '0.08em', mb: 1, display: 'block' }}
            >
              {typeLabels[type] || type}
            </Typography>
            {creds.map((cred) => {
              const credRevealed = revealed[cred.id] || {};
              return (
                <Paper
                  key={cred.id}
                  variant="outlined"
                  sx={{
                    p: 2,
                    mb: 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    transition: 'all 0.2s',
                    '&:hover': { borderColor: '#00695c', bgcolor: 'rgba(0, 105, 92, 0.02)' },
                  }}
                >
                  {/* Main info */}
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                      <Typography sx={{ fontWeight: 600, fontSize: '0.95rem' }}>
                        {cred.platform_name}
                      </Typography>
                      {cred.account_nickname && (
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                          ({cred.account_nickname})
                        </Typography>
                      )}
                      <Chip
                        size="small"
                        label={cred.importance_tier}
                        sx={{
                          bgcolor: `${importanceColors[cred.importance_tier] || '#757575'}15`,
                          color: importanceColors[cred.importance_tier] || '#757575',
                          fontWeight: 600,
                          fontSize: '0.7rem',
                          height: 22,
                        }}
                      />
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
                      {cred.login_email && (
                        <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.85rem' }}>
                          {cred.login_email}
                        </Typography>
                      )}
                      {cred.enc_password && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.85rem', color: 'text.secondary' }}>
                            {credRevealed['password'] || '\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022'}
                          </Typography>
                          <IconButton
                            size="small"
                            onClick={() => toggleReveal(cred.id, 'password', cred.enc_password)}
                            sx={{ p: 0.25 }}
                          >
                            {credRevealed['password'] ? (
                              <VisibilityOffIcon sx={{ fontSize: 16 }} />
                            ) : (
                              <VisibilityIcon sx={{ fontSize: 16 }} />
                            )}
                          </IconButton>
                        </Box>
                      )}
                      {cred.two_factor_enabled && (
                        <Chip size="small" label="2FA" sx={{ height: 20, fontSize: '0.7rem', bgcolor: '#e3f2fd', color: '#1565c0' }} />
                      )}
                    </Box>
                  </Box>

                  {/* Access role chips */}
                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                    {cred.poa_can_access && (
                      <Tooltip title="POA Access">
                        <Chip
                          icon={<GavelIcon sx={{ fontSize: '14px !important' }} />}
                          size="small"
                          label="POA"
                          sx={{ bgcolor: '#e0f2f1', color: '#00695c', height: 24, fontSize: '0.7rem' }}
                        />
                      </Tooltip>
                    )}
                    {cred.executor_can_access && (
                      <Tooltip title="Executor Access">
                        <Chip
                          icon={<AccountBalanceIcon sx={{ fontSize: '14px !important' }} />}
                          size="small"
                          label="Executor"
                          sx={{ bgcolor: '#e8eaf6', color: '#283593', height: 24, fontSize: '0.7rem' }}
                        />
                      </Tooltip>
                    )}
                  </Box>

                  {/* Last verified */}
                  {cred.last_verified_at && (
                    <Tooltip title={`Verified ${new Date(cred.last_verified_at).toLocaleDateString()}`}>
                      <VerifiedIcon sx={{ fontSize: 18, color: '#2e7d32' }} />
                    </Tooltip>
                  )}

                  {/* Actions */}
                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                    <Tooltip title="Edit">
                      <IconButton size="small" onClick={() => handleEdit(cred)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton size="small" onClick={() => setDeleteTarget(cred)} sx={{ color: '#d32f2f' }}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Paper>
              );
            })}
          </Box>
        ))
      )}

      {/* Delete confirmation dialog */}
      <Dialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Delete Credential?</DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            Are you sure you want to delete <strong>{deleteTarget?.platform_name}</strong>? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteTarget(null)} color="inherit">Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained">Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CredentialsList;
