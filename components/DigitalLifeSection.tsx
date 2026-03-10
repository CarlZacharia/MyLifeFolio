'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Paper,
  Chip,
  Alert,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Tooltip,
} from '@mui/material';
import FingerprintIcon from '@mui/icons-material/Fingerprint';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import CloseIcon from '@mui/icons-material/Close';
import LockIcon from '@mui/icons-material/Lock';
import DevicesIcon from '@mui/icons-material/Devices';
import SubscriptionsIcon from '@mui/icons-material/Subscriptions';
import ShareIcon from '@mui/icons-material/Share';
import LanguageIcon from '@mui/icons-material/Language';
import { useAuth } from '../lib/AuthContext';
import { supabase } from '../lib/supabase';
import VaultWarningModal from './VaultWarningModal';
import VaultSetup from './VaultSetup';
import VaultUnlock from './VaultUnlock';
import CredentialsList from './CredentialsList';

interface VaultSettings {
  salt: string;
  recovery_key_ciphertext: string;
  vault_enabled: boolean;
}

interface DigitalLifeSectionProps {
  initialTab?: number;
}

const DigitalLifeSection: React.FC<DigitalLifeSectionProps> = ({ initialTab }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState(initialTab ?? 0);

  useEffect(() => {
    if (initialTab !== undefined) setActiveTab(initialTab);
  }, [initialTab]);

  // Vault state
  const [vaultSettings, setVaultSettings] = useState<VaultSettings | null>(null);
  const [vaultKey, setVaultKey] = useState<CryptoKey | null>(null);
  const [loadingVault, setLoadingVault] = useState(true);

  // Warning modal
  const [showWarning, setShowWarning] = useState(false);
  const [warningDismissedThisSession, setWarningDismissedThisSession] = useState(false);
  const [warningAccepted, setWarningAccepted] = useState(false);

  // Setup flow
  const [showSetup, setShowSetup] = useState(false);

  // Help modal
  const [showHelp, setShowHelp] = useState(false);

  // Load vault settings
  const loadVaultSettings = useCallback(async () => {
    if (!user) return;
    setLoadingVault(true);
    try {
      const { data, error } = await supabase
        .from('credential_vault_settings')
        .select('salt, recovery_key_ciphertext, vault_enabled')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      setVaultSettings(data);
    } catch {
      // Table may not exist yet — that's OK
      setVaultSettings(null);
    } finally {
      setLoadingVault(false);
    }
  }, [user]);

  useEffect(() => {
    loadVaultSettings();
  }, [loadVaultSettings]);

  // When user clicks the Credentials tab, show warning (if not dismissed this session)
  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    if (newValue === 0 && !warningDismissedThisSession && !warningAccepted) {
      setShowWarning(true);
      return;
    }
    setActiveTab(newValue);
  };

  // Auto-show warning when landing on credentials tab for first time
  useEffect(() => {
    if (activeTab === 0 && !warningDismissedThisSession && !warningAccepted && !loadingVault) {
      setShowWarning(true);
    }
  }, [loadingVault]);

  const handleWarningAccept = () => {
    setShowWarning(false);
    setWarningAccepted(true);
    setWarningDismissedThisSession(true);

    // If vault not set up, show setup
    if (!vaultSettings?.vault_enabled) {
      setShowSetup(true);
    }
  };

  const handleSetupComplete = (key: CryptoKey) => {
    setVaultKey(key);
    setShowSetup(false);
    loadVaultSettings();
  };

  const handleUnlock = (key: CryptoKey) => {
    setVaultKey(key);
  };

  const handleLockVault = () => {
    setVaultKey(null);
  };

  // ─── Render ───────────────────────────────────────────────────────────────

  if (!user) {
    return (
      <Alert severity="info">Please log in to access your Digital Life section.</Alert>
    );
  }

  const renderCredentialsTab = () => {
    if (loadingVault) {
      return (
        <Box sx={{ textAlign: 'center', py: 6 }}>
          <Typography sx={{ color: 'text.secondary' }}>Loading vault...</Typography>
        </Box>
      );
    }

    // Warning not yet accepted this session
    if (!warningAccepted) {
      return (
        <Paper variant="outlined" sx={{ p: 4, textAlign: 'center' }}>
          <LockIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
            Credentials Vault
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2, maxWidth: 400, mx: 'auto' }}>
            Securely store and manage your online account credentials with client-side encryption.
          </Typography>
          <Typography
            variant="body2"
            onClick={() => setShowWarning(true)}
            sx={{ color: '#00695c', cursor: 'pointer', fontWeight: 600, '&:hover': { textDecoration: 'underline' } }}
          >
            Click here to access the Credentials Vault
          </Typography>
        </Paper>
      );
    }

    // Setup flow
    if (showSetup || !vaultSettings?.vault_enabled) {
      return (
        <VaultSetup
          onComplete={handleSetupComplete}
          onCancel={() => setShowSetup(false)}
        />
      );
    }

    // Vault is set up but locked
    if (!vaultKey) {
      return (
        <VaultUnlock
          salt={vaultSettings.salt}
          recoveryKeyCiphertext={vaultSettings.recovery_key_ciphertext}
          onUnlock={handleUnlock}
        />
      );
    }

    // Vault unlocked — show credentials list
    return (
      <CredentialsList vaultKey={vaultKey} onLockVault={handleLockVault} />
    );
  };

  const renderComingSoon = (title: string) => (
    <Paper variant="outlined" sx={{ p: 4, textAlign: 'center' }}>
      <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>{title}</Typography>
      <Chip label="Coming Soon" size="small" sx={{ bgcolor: '#e0f2f1', color: '#00695c' }} />
      <Typography variant="body2" sx={{ color: 'text.secondary', mt: 2 }}>
        This section is planned for a future release.
      </Typography>
    </Paper>
  );

  return (
    <Box>
      {/* Warning Modal */}
      <VaultWarningModal
        open={showWarning}
        onAccept={handleWarningAccept}
        onCancel={() => setShowWarning(false)}
      />

      {/* Help Modal */}
      <Dialog
        open={showHelp}
        onClose={() => setShowHelp(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: 2 } }}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <FingerprintIcon sx={{ color: '#00695c', fontSize: 26 }} />
            <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1.1rem' }}>
              How the Digital Life Section Works
            </Typography>
          </Box>
          <IconButton onClick={() => setShowHelp(false)} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {/* Overview */}
          <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1, color: '#00695c' }}>
            Overview
          </Typography>
          <Typography variant="body2" sx={{ mb: 2, lineHeight: 1.7 }}>
            The Digital Life section is your secure space for organizing everything related to your
            online presence. The centerpiece is the <strong>Credentials Vault</strong>, which lets you
            store online account logins and access information so that your trusted representatives
            (a Power of Attorney agent or an Executor / Trustee) can manage your digital affairs if
            you become incapacitated or after your passing.
          </Typography>

          {/* Credentials Vault */}
          <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1, color: '#00695c' }}>
            The Credentials Vault
          </Typography>
          <Typography variant="body2" sx={{ mb: 1, lineHeight: 1.7 }}>
            When you first open the Credentials tab, you will be asked to create a <strong>Vault
            Master Passphrase</strong>. This passphrase is used to encrypt your sensitive data
            (passwords, PINs, security answers, backup codes) directly in your browser before anything
            is sent to the server. MyLifeFolio never sees or stores your actual passwords in readable form.
          </Typography>
          <Typography variant="body2" sx={{ mb: 2, lineHeight: 1.7 }}>
            Each time you return to the Credentials tab in a new session, you will need to re-enter
            your passphrase to unlock the vault. You can lock the vault at any time using the
            "Lock Vault" button, which discards the encryption key from memory.
          </Typography>

          {/* Recovery Key */}
          <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1, color: '#00695c' }}>
            Recovery Key
          </Typography>
          <Typography variant="body2" sx={{ mb: 2, lineHeight: 1.7 }}>
            During setup, you will be given a one-time <strong>Recovery Key</strong> — a long,
            random code that can restore access to your vault if you forget your passphrase.
            This key is shown only once. Print it or write it down and store it in a safe place
            (e.g., a home safe or safe deposit box). If you lose both your passphrase and your
            recovery key, your encrypted data <strong>cannot be recovered by anyone</strong>,
            including MyLifeFolio support.
          </Typography>

          {/* How Encryption Works */}
          <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1, color: '#00695c' }}>
            How Encryption Works
          </Typography>
          <Box component="ul" sx={{ pl: 2.5, m: 0, mb: 2 }}>
            {[
              'Your passphrase is used to derive a 256-bit encryption key using PBKDF2 (100,000 iterations) — an industry-standard key stretching algorithm.',
              'Sensitive fields (password, PIN, security Q&A, backup codes, authenticator notes, recovery email) are encrypted with AES-GCM 256-bit encryption in your browser before being stored.',
              'Non-sensitive fields (account name, platform, URL, access control settings, notes) are stored as readable text so the system can display them without unlocking.',
              'The encryption key exists only in your browser\'s memory while the vault is unlocked and is never transmitted or stored on the server.',
            ].map((text, idx) => (
              <Typography key={idx} component="li" variant="body2" sx={{ mb: 0.75, lineHeight: 1.6 }}>
                {text}
              </Typography>
            ))}
          </Box>

          {/* Access Controls */}
          <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1, color: '#00695c' }}>
            Access Controls: POA Agent & Executor
          </Typography>
          <Typography variant="body2" sx={{ mb: 1, lineHeight: 1.7 }}>
            For each account you store, you can independently designate whether your <strong>Power of
            Attorney Agent</strong> or your <strong>Executor / Trustee</strong> should have access:
          </Typography>
          <Box component="ul" sx={{ pl: 2.5, m: 0, mb: 2 }}>
            <Typography component="li" variant="body2" sx={{ mb: 0.75, lineHeight: 1.6 }}>
              <strong>POA Agent</strong> — Someone who may need to manage your accounts while you are
              alive but incapacitated. You can provide specific instructions for what they should do.
            </Typography>
            <Typography component="li" variant="body2" sx={{ mb: 0.75, lineHeight: 1.6 }}>
              <strong>Executor / Trustee</strong> — Someone who handles your affairs after your death.
              You can specify an action for each account: memorialize, delete, transfer, or download
              data first.
            </Typography>
          </Box>

          {/* What to Store */}
          <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1, color: '#00695c' }}>
            What to Store Here
          </Typography>
          <Typography variant="body2" sx={{ mb: 1, lineHeight: 1.7 }}>
            This vault is designed as a <strong>legacy reference</strong> — a place where your
            executor, trustee, or POA agent can find the accounts and credentials they need to
            act on your behalf. It is not intended to replace a day-to-day password manager.
          </Typography>
          <Typography variant="body2" sx={{ mb: 2, lineHeight: 1.7 }}>
            We recommend storing credentials for accounts that matter most in an emergency or
            estate scenario: banking and financial accounts, email, utilities, insurance portals,
            government accounts (Social Security, VA), and any account with automatic billing or
            subscriptions that would need to be cancelled.
          </Typography>

          {/* Additional Tabs */}
          <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1, color: '#00695c' }}>
            Additional Sections (Coming Soon)
          </Typography>
          <Typography variant="body2" sx={{ lineHeight: 1.7 }}>
            Future releases will add tabs for Digital Assets & Cryptocurrency, Subscriptions &
            Recurring Services, Social Media & Email Accounts, and Domain Names & Digital Businesses.
            These sections will help you create a comprehensive inventory of your entire digital life.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 1.5 }}>
          <Button onClick={() => setShowHelp(false)} variant="contained" sx={{ bgcolor: '#00695c', '&:hover': { bgcolor: '#004d40' } }}>
            Got It
          </Button>
        </DialogActions>
      </Dialog>

      {/* Section Title with Help Icon */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1.1rem' }}>
          Digital Life
        </Typography>
        <Tooltip title="How does this work?">
          <IconButton
            size="small"
            onClick={() => setShowHelp(true)}
            sx={{
              color: '#00695c',
              bgcolor: 'rgba(0, 105, 92, 0.08)',
              width: 28,
              height: 28,
              '&:hover': { bgcolor: 'rgba(0, 105, 92, 0.15)' },
            }}
          >
            <HelpOutlineIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            '& .MuiTab-root': { textTransform: 'none', fontWeight: 500, minHeight: 48 },
            '& .Mui-selected': { color: '#00695c' },
            '& .MuiTabs-indicator': { bgcolor: '#00695c' },
          }}
        >
          <Tab icon={<LockIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Online Account Credentials" />
          <Tab icon={<DevicesIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Digital Assets" />
          <Tab icon={<SubscriptionsIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Subscriptions" />
          <Tab icon={<ShareIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Social Media & Email" />
          <Tab icon={<LanguageIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Domains & Digital Business" />
        </Tabs>
      </Box>

      {/* Tab content */}
      {activeTab === 0 && renderCredentialsTab()}
      {activeTab === 1 && renderComingSoon('Digital Assets & Cryptocurrency')}
      {activeTab === 2 && renderComingSoon('Subscriptions & Recurring Services')}
      {activeTab === 3 && renderComingSoon('Social Media & Email Accounts')}
      {activeTab === 4 && renderComingSoon('Domain Names & Digital Businesses')}
    </Box>
  );
};

export default DigitalLifeSection;
