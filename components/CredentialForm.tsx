'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  MenuItem,
  Switch,
  FormControlLabel,
  Divider,
  IconButton,
  Paper,
  Chip,
  Tooltip,
  Alert,
} from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import GavelIcon from '@mui/icons-material/Gavel';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { encryptField, decryptField } from '../lib/vaultCrypto';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/AuthContext';

// ─── Types ──────────────────────────────────────────────────────────────────

export interface CredentialAccount {
  id?: string;
  account_nickname: string;
  account_type: string;
  platform_name: string;
  account_url: string;
  login_email: string;
  two_factor_enabled: boolean;
  two_factor_method: string;
  phone_on_account: string;
  on_death_action: string;
  on_incapacity_action: string;
  special_notes: string;
  poa_can_access: boolean;
  executor_can_access: boolean;
  importance_tier: string;
  linked_payment_method: string;
  last_verified_at: string;
  // Encrypted fields (plaintext in form, encrypted on save)
  password: string;
  pin: string;
  security_qa: { question: string; answer: string }[];
  backup_codes: string;
  authenticator_note: string;
  recovery_email: string;
}

const EMPTY_CREDENTIAL: CredentialAccount = {
  account_nickname: '',
  account_type: '',
  platform_name: '',
  account_url: '',
  login_email: '',
  two_factor_enabled: false,
  two_factor_method: '',
  phone_on_account: '',
  on_death_action: '',
  on_incapacity_action: '',
  special_notes: '',
  poa_can_access: false,
  executor_can_access: false,
  importance_tier: 'moderate',
  linked_payment_method: '',
  last_verified_at: '',
  password: '',
  pin: '',
  security_qa: [],
  backup_codes: '',
  authenticator_note: '',
  recovery_email: '',
};

const ACCOUNT_TYPES = [
  { value: 'financial', label: 'Financial' },
  { value: 'email', label: 'Email' },
  { value: 'social_media', label: 'Social Media' },
  { value: 'subscription', label: 'Subscription' },
  { value: 'utility', label: 'Utility' },
  { value: 'government', label: 'Government' },
  { value: 'healthcare', label: 'Healthcare' },
  { value: 'crypto', label: 'Cryptocurrency' },
  { value: 'other', label: 'Other' },
];

const TWO_FACTOR_METHODS = [
  { value: 'sms', label: 'SMS' },
  { value: 'authenticator_app', label: 'Authenticator App' },
  { value: 'hardware_key', label: 'Hardware Key' },
  { value: 'email', label: 'Email' },
];

const DEATH_ACTIONS = [
  { value: 'memorialize', label: 'Memorialize' },
  { value: 'delete', label: 'Delete' },
  { value: 'transfer', label: 'Transfer to Designee' },
  { value: 'download_data_first', label: 'Download Data First' },
  { value: 'other', label: 'Other' },
];

const IMPORTANCE_TIERS = [
  { value: 'critical', label: 'Critical' },
  { value: 'moderate', label: 'Moderate' },
  { value: 'low', label: 'Low' },
];

// ─── Component ──────────────────────────────────────────────────────────────

interface CredentialFormProps {
  credential?: CredentialAccount;
  vaultKey: CryptoKey;
  onSave: () => void;
  onCancel: () => void;
}

const CredentialForm: React.FC<CredentialFormProps> = ({
  credential,
  vaultKey,
  onSave,
  onCancel,
}) => {
  const { user } = useAuth();
  const [form, setForm] = useState<CredentialAccount>(credential || { ...EMPTY_CREDENTIAL });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const isEdit = !!credential?.id;

  const updateField = <K extends keyof CredentialAccount>(field: K, value: CredentialAccount[K]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const addSecurityQuestion = () => {
    setForm((prev) => ({
      ...prev,
      security_qa: [...prev.security_qa, { question: '', answer: '' }],
    }));
  };

  const updateSecurityQuestion = (index: number, field: 'question' | 'answer', value: string) => {
    setForm((prev) => ({
      ...prev,
      security_qa: prev.security_qa.map((qa, i) =>
        i === index ? { ...qa, [field]: value } : qa
      ),
    }));
  };

  const removeSecurityQuestion = (index: number) => {
    setForm((prev) => ({
      ...prev,
      security_qa: prev.security_qa.filter((_, i) => i !== index),
    }));
  };

  const handleSave = async () => {
    if (!user) return;
    if (!form.platform_name.trim()) {
      setError('Platform / Service Name is required.');
      return;
    }

    setSaving(true);
    setError('');

    try {
      // Encrypt sensitive fields
      const encPassword = form.password ? await encryptField(form.password, vaultKey) : null;
      const encPin = form.pin ? await encryptField(form.pin, vaultKey) : null;
      const encSecurityQa = form.security_qa.length > 0
        ? await encryptField(JSON.stringify(form.security_qa), vaultKey)
        : null;
      const encBackupCodes = form.backup_codes ? await encryptField(form.backup_codes, vaultKey) : null;
      const encAuthenticatorNote = form.authenticator_note
        ? await encryptField(form.authenticator_note, vaultKey)
        : null;
      const encRecoveryEmail = form.recovery_email
        ? await encryptField(form.recovery_email, vaultKey)
        : null;

      const row = {
        user_id: user.id,
        account_nickname: form.account_nickname || null,
        account_type: form.account_type || null,
        platform_name: form.platform_name,
        account_url: form.account_url || null,
        login_email: form.login_email || null,
        two_factor_enabled: form.two_factor_enabled,
        two_factor_method: form.two_factor_enabled ? form.two_factor_method || null : null,
        phone_on_account: form.phone_on_account || null,
        on_death_action: form.on_death_action || null,
        on_incapacity_action: form.on_incapacity_action || null,
        special_notes: form.special_notes || null,
        poa_can_access: form.poa_can_access,
        executor_can_access: form.executor_can_access,
        importance_tier: form.importance_tier,
        linked_payment_method: form.linked_payment_method || null,
        last_verified_at: form.last_verified_at || null,
        enc_password: encPassword,
        enc_pin: encPin,
        enc_security_qa: encSecurityQa,
        enc_backup_codes: encBackupCodes,
        enc_authenticator_note: encAuthenticatorNote,
        enc_recovery_email: encRecoveryEmail,
        updated_at: new Date().toISOString(),
      };

      if (isEdit && credential?.id) {
        const { error: dbError } = await supabase
          .from('credential_accounts')
          .update(row)
          .eq('id', credential.id);
        if (dbError) throw dbError;
      } else {
        const { error: dbError } = await supabase
          .from('credential_accounts')
          .insert(row);
        if (dbError) throw dbError;
      }

      onSave();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save credential');
    } finally {
      setSaving(false);
    }
  };

  // ─── Section Header Helper ─────────────────────────────────────────────
  const SectionHeader: React.FC<{ title: string; icon?: React.ReactNode }> = ({ title, icon }) => (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 3, mb: 2 }}>
      {icon}
      <Typography variant="subtitle1" sx={{ fontWeight: 600, fontSize: '0.95rem' }}>
        {title}
      </Typography>
      <Divider sx={{ flex: 1 }} />
    </Box>
  );

  return (
    <Box>
      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
        {isEdit ? 'Edit Credential' : 'Add Credential'}
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {/* Account Identity */}
      <SectionHeader title="Account Identity" />
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
        <TextField
          label="Platform / Service Name"
          value={form.platform_name}
          onChange={(e) => updateField('platform_name', e.target.value)}
          required
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          label="Account Nickname"
          value={form.account_nickname}
          onChange={(e) => updateField('account_nickname', e.target.value)}
          placeholder="e.g., Personal checking"
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          select
          label="Account Type"
          value={form.account_type}
          onChange={(e) => updateField('account_type', e.target.value)}
          InputLabelProps={{ shrink: true }}
        >
          <MenuItem value="">— Select —</MenuItem>
          {ACCOUNT_TYPES.map((t) => (
            <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>
          ))}
        </TextField>
        <TextField
          label="Account URL"
          value={form.account_url}
          onChange={(e) => updateField('account_url', e.target.value)}
          placeholder="https://..."
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          label="Login Email / Username"
          value={form.login_email}
          onChange={(e) => updateField('login_email', e.target.value)}
          InputLabelProps={{ shrink: true }}
          sx={{ gridColumn: { md: '1 / -1' } }}
        />
      </Box>

      {/* Credentials (encrypted) */}
      <SectionHeader title="Credentials" icon={<LockIcon sx={{ fontSize: 18, color: '#00695c' }} />} />
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
        <TextField
          label="Password"
          type="password"
          value={form.password}
          onChange={(e) => updateField('password', e.target.value)}
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          label="PIN"
          type="password"
          value={form.pin}
          onChange={(e) => updateField('pin', e.target.value)}
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          label="Recovery Email"
          type="password"
          value={form.recovery_email}
          onChange={(e) => updateField('recovery_email', e.target.value)}
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          label="Authenticator App Note"
          type="password"
          value={form.authenticator_note}
          onChange={(e) => updateField('authenticator_note', e.target.value)}
          placeholder="e.g., Google Authenticator on iPhone"
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          label="Backup / Recovery Codes"
          type="password"
          value={form.backup_codes}
          onChange={(e) => updateField('backup_codes', e.target.value)}
          multiline
          rows={2}
          InputLabelProps={{ shrink: true }}
          sx={{ gridColumn: { md: '1 / -1' } }}
        />
      </Box>

      {/* Security Questions */}
      <Box sx={{ mt: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>Security Questions</Typography>
          <Button size="small" startIcon={<AddIcon />} onClick={addSecurityQuestion}>
            Add
          </Button>
        </Box>
        {form.security_qa.map((qa, idx) => (
          <Box key={idx} sx={{ display: 'flex', gap: 1.5, mb: 1.5, alignItems: 'flex-start' }}>
            <TextField
              size="small"
              label={`Question ${idx + 1}`}
              value={qa.question}
              onChange={(e) => updateSecurityQuestion(idx, 'question', e.target.value)}
              sx={{ flex: 1 }}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              size="small"
              label="Answer"
              type="password"
              value={qa.answer}
              onChange={(e) => updateSecurityQuestion(idx, 'answer', e.target.value)}
              sx={{ flex: 1 }}
              InputLabelProps={{ shrink: true }}
            />
            <IconButton size="small" onClick={() => removeSecurityQuestion(idx)} sx={{ mt: 0.5 }}>
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Box>
        ))}
      </Box>

      {/* Two-Factor Authentication */}
      <SectionHeader title="Two-Factor Authentication" />
      <FormControlLabel
        control={
          <Switch
            checked={form.two_factor_enabled}
            onChange={(e) => updateField('two_factor_enabled', e.target.checked)}
          />
        }
        label="2FA Enabled"
      />
      {form.two_factor_enabled && (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2, mt: 1 }}>
          <TextField
            select
            label="2FA Method"
            value={form.two_factor_method}
            onChange={(e) => updateField('two_factor_method', e.target.value)}
            InputLabelProps={{ shrink: true }}
          >
            <MenuItem value="">— Select —</MenuItem>
            {TWO_FACTOR_METHODS.map((m) => (
              <MenuItem key={m.value} value={m.value}>{m.label}</MenuItem>
            ))}
          </TextField>
          <TextField
            label="Phone Number on Account"
            value={form.phone_on_account}
            onChange={(e) => updateField('phone_on_account', e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
        </Box>
      )}

      {/* Access Controls */}
      <SectionHeader title="Access Controls" />
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
        <Paper variant="outlined" sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <GavelIcon sx={{ fontSize: 18, color: '#00838f' }} />
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>POA Agent Access</Typography>
          </Box>
          <FormControlLabel
            control={
              <Switch
                checked={form.poa_can_access}
                onChange={(e) => updateField('poa_can_access', e.target.checked)}
              />
            }
            label="POA Agent May Access This Account"
          />
          {form.poa_can_access && (
            <TextField
              fullWidth
              label="Instructions for POA Agent"
              value={form.on_incapacity_action}
              onChange={(e) => updateField('on_incapacity_action', e.target.value)}
              multiline
              rows={2}
              InputLabelProps={{ shrink: true }}
              sx={{ mt: 1 }}
            />
          )}
        </Paper>

        <Paper variant="outlined" sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <AccountBalanceIcon sx={{ fontSize: 18, color: '#283593' }} />
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Executor / Trustee Access</Typography>
          </Box>
          <FormControlLabel
            control={
              <Switch
                checked={form.executor_can_access}
                onChange={(e) => updateField('executor_can_access', e.target.checked)}
              />
            }
            label="Executor May Access This Account"
          />
          {form.executor_can_access && (
            <>
              <TextField
                fullWidth
                select
                label="Action on Death"
                value={form.on_death_action}
                onChange={(e) => updateField('on_death_action', e.target.value)}
                InputLabelProps={{ shrink: true }}
                sx={{ mt: 1, mb: 1 }}
              >
                <MenuItem value="">— Select —</MenuItem>
                {DEATH_ACTIONS.map((a) => (
                  <MenuItem key={a.value} value={a.value}>{a.label}</MenuItem>
                ))}
              </TextField>
              <TextField
                fullWidth
                label="Notes for Executor"
                value={form.special_notes}
                onChange={(e) => updateField('special_notes', e.target.value)}
                multiline
                rows={2}
                InputLabelProps={{ shrink: true }}
              />
            </>
          )}
        </Paper>
      </Box>

      {/* Metadata */}
      <SectionHeader title="Metadata" />
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' }, gap: 2 }}>
        <TextField
          select
          label="Importance Tier"
          value={form.importance_tier}
          onChange={(e) => updateField('importance_tier', e.target.value)}
          InputLabelProps={{ shrink: true }}
        >
          {IMPORTANCE_TIERS.map((t) => (
            <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>
          ))}
        </TextField>
        <TextField
          label="Linked Payment Method"
          value={form.linked_payment_method}
          onChange={(e) => updateField('linked_payment_method', e.target.value)}
          placeholder="e.g., Visa ending 4242"
          InputLabelProps={{ shrink: true }}
        />
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <TextField
            label="Last Verified"
            type="date"
            value={form.last_verified_at ? form.last_verified_at.split('T')[0] : ''}
            onChange={(e) => updateField('last_verified_at', e.target.value ? new Date(e.target.value).toISOString() : '')}
            InputLabelProps={{ shrink: true }}
            sx={{ flex: 1 }}
          />
          <Tooltip title="Mark as verified today">
            <IconButton
              size="small"
              onClick={() => updateField('last_verified_at', new Date().toISOString())}
              sx={{ color: '#2e7d32' }}
            >
              <CheckCircleIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Actions */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
        <Button onClick={onCancel} color="inherit">
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={saving}
          sx={{ bgcolor: '#00695c', '&:hover': { bgcolor: '#004d40' } }}
        >
          {saving ? 'Saving...' : isEdit ? 'Update Credential' : 'Save Credential'}
        </Button>
      </Box>
    </Box>
  );
};

export default CredentialForm;
export { EMPTY_CREDENTIAL, ACCOUNT_TYPES };
