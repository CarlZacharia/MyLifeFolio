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
import FolioHelpModal, { FolioHelpButton, useFolioHelp } from './FolioHelpModal';
import { digitalLifeHelp } from './folioHelpContent';
import DigitalSubscriptionsTab from './DigitalSubscriptionsTab';
import DigitalAssetsTab from './DigitalAssetsTab';
import SocialMediaTab from './SocialMediaTab';
import DomainsDigitalBusinessTab from './DomainsDigitalBusinessTab';

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
  const { showHelp, openHelp, closeHelp } = useFolioHelp();

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
      <CredentialsList vaultKey={vaultKey} onLockVault={handleLockVault} onVaultKeyChanged={(newKey) => setVaultKey(newKey)} />
    );
  };


  return (
    <Box>
      {/* Warning Modal */}
      <VaultWarningModal
        open={showWarning}
        onAccept={handleWarningAccept}
        onCancel={() => setShowWarning(false)}
      />

      <FolioHelpModal open={showHelp} onClose={closeHelp} content={digitalLifeHelp} />

      {/* Section Title with Help Icon */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1.1rem' }}>
          Digital Life
        </Typography>
        <FolioHelpButton onClick={openHelp} accentColor="#00695c" />
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
      {activeTab === 1 && <DigitalAssetsTab />}
      {activeTab === 2 && <DigitalSubscriptionsTab />}
      {activeTab === 3 && <SocialMediaTab />}
      {activeTab === 4 && <DomainsDigitalBusinessTab />}
    </Box>
  );
};

export default DigitalLifeSection;
