'use client';

import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Typography,
  Box,
  Divider,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ShieldIcon from '@mui/icons-material/Shield';
import LockIcon from '@mui/icons-material/Lock';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

// ─── Styles ──────────────────────────────────────────────────────────────────

const sectionTitle = {
  fontFamily: '"Playfair Display", serif',
  fontWeight: 600,
  fontSize: '1.15rem',
  color: '#1e3a5f',
  display: 'flex',
  alignItems: 'center',
  gap: 1,
  mb: 1,
  mt: 2.5,
};

const bodyText = {
  fontFamily: '"Source Sans 3", sans-serif',
  fontSize: '0.92rem',
  lineHeight: 1.75,
  color: '#333',
};

const bulletItem = {
  fontFamily: '"Source Sans 3", sans-serif',
  fontSize: '0.9rem',
  lineHeight: 1.7,
  mb: 0.5,
  color: '#444',
};

const checkIcon = <CheckCircleIcon sx={{ fontSize: 15, color: '#2e7d32', mr: 0.75, flexShrink: 0, mt: '3px' }} />;

// ─── Component ───────────────────────────────────────────────────────────────

interface SecurityInfoModalProps {
  open: boolean;
  onClose: () => void;
}

const SecurityInfoModal: React.FC<SecurityInfoModalProps> = ({ open, onClose }) => (
  <Dialog
    open={open}
    onClose={onClose}
    maxWidth="md"
    fullWidth
    scroll="paper"
    PaperProps={{ sx: { borderRadius: 2 } }}
  >
    {/* ── Header ── */}
    <DialogTitle
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        bgcolor: '#1e3a5f',
        color: 'white',
        py: 2,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <ShieldIcon />
        <Typography variant="h6" component="span" sx={{ fontWeight: 600 }}>
          Security &amp; Data Protection
        </Typography>
      </Box>
      <IconButton onClick={onClose} sx={{ color: 'white' }} size="small">
        <CloseIcon />
      </IconButton>
    </DialogTitle>

    <DialogContent dividers sx={{ px: { xs: 2, sm: 4 }, py: 3 }}>
      {/* ── Overview ── */}
      <Typography sx={{ ...bodyText, mb: 2 }}>
        MyLifeFolio stores some of the most personal information you own &mdash; your
        family details, financial accounts, medical data, legal documents, and end-of-life
        wishes. We take that responsibility seriously, and we have built this platform
        with security at every level. There are very few items that are required in
        MyLifeFolio. If entering information makes you uneasy or concerned, chances
        are you will not have to enter anything in that field or fields.
      </Typography>

      <Divider sx={{ mb: 1 }} />

      {/* ─────────────────────────────────────────────────────────────────────── */}
      {/* 1. ENCRYPTION & DATA PROTECTION */}
      {/* ─────────────────────────────────────────────────────────────────────── */}
      <Typography sx={sectionTitle}>
        <LockIcon sx={{ color: '#1e3a5f' }} /> Multiple Layers of Encryption
      </Typography>
      <Typography sx={bodyText}>
        Your data is protected by multiple, independent layers of encryption:
      </Typography>
      <Box component="ul" sx={{ pl: 1, listStyle: 'none', mt: 1 }}>
        {[
          'All data is encrypted while traveling between your device and our servers using industry-standard secure protocols.',
          'All data stored in our systems is encrypted at rest &mdash; even if physical storage were somehow compromised, the data would be unreadable.',
          'Your most sensitive credentials (passwords, PINs, security questions) receive an additional layer of encryption that happens on your device before the data ever leaves your browser. We never see this data in readable form.',
          'Your Credential Vault is protected by a passphrase that only you know. Without it, the encrypted data is unreadable &mdash; even to us.',
          'Social Security numbers are encrypted separately and are never stored in readable form.',
        ].map((text, i) => (
          <Typography key={i} component="li" sx={{ ...bulletItem, display: 'flex', alignItems: 'flex-start' }}>
            {checkIcon} <span dangerouslySetInnerHTML={{ __html: text }} />
          </Typography>
        ))}
      </Box>

      <Divider sx={{ my: 2 }} />

      {/* ─────────────────────────────────────────────────────────────────────── */}
      {/* 2. ACCESS CONTROL & AUTHENTICATION */}
      {/* ─────────────────────────────────────────────────────────────────────── */}
      <Typography sx={sectionTitle}>
        <VpnKeyIcon sx={{ color: '#1e3a5f' }} /> Access Control &amp; Authentication
      </Typography>
      <Typography sx={bodyText}>
        We enforce strict controls over who can access your data and how:
      </Typography>
      <Box component="ul" sx={{ pl: 1, listStyle: 'none', mt: 1 }}>
        {[
          'Your identity is verified through email confirmation before you can access the platform.',
          'Choose between a secure one-time email code or a traditional password to log in.',
          'Accessing sensitive sections of the platform requires re-verifying your identity, protecting against unauthorized use of an unlocked device.',
          'Your data is isolated at the database level &mdash; the system enforces that you can only access your own information, independent of application logic.',
          'Sessions are managed securely with short-lived credentials that are automatically refreshed.',
        ].map((text, i) => (
          <Typography key={i} component="li" sx={{ ...bulletItem, display: 'flex', alignItems: 'flex-start' }}>
            {checkIcon} <span dangerouslySetInnerHTML={{ __html: text }} />
          </Typography>
        ))}
      </Box>

      <Divider sx={{ my: 2 }} />

      {/* ─────────────────────────────────────────────────────────────────────── */}
      {/* 3. FAMILY ACCESS */}
      {/* ─────────────────────────────────────────────────────────────────────── */}
      <Typography sx={sectionTitle}>
        <VisibilityOffIcon sx={{ color: '#1e3a5f' }} /> Family Access Controls
      </Typography>
      <Typography sx={bodyText}>
        When you choose to share information with family members, you remain in
        complete control:
      </Typography>
      <Box component="ul" sx={{ pl: 1, listStyle: 'none', mt: 1 }}>
        {[
          'You choose exactly which categories each family member can view. They see nothing beyond what you authorize.',
          'Highly sensitive information is automatically masked, even for authorized family members.',
          'Every access is logged &mdash; you can review who viewed what and when at any time.',
          'You can revoke access instantly with a single click.',
          'Family members must be explicitly authorized by you and cannot self-register.',
        ].map((text, i) => (
          <Typography key={i} component="li" sx={{ ...bulletItem, display: 'flex', alignItems: 'flex-start' }}>
            {checkIcon} <span dangerouslySetInnerHTML={{ __html: text }} />
          </Typography>
        ))}
      </Box>

      <Divider sx={{ my: 2 }} />

      {/* ─────────────────────────────────────────────────────────────────────── */}
      {/* 4. DOCUMENTS & PAYMENTS */}
      {/* ─────────────────────────────────────────────────────────────────────── */}
      <Typography sx={sectionTitle}>
        <VerifiedUserIcon sx={{ color: '#1e3a5f' }} /> Document Storage &amp; Payments
      </Typography>
      <Box component="ul" sx={{ pl: 1, listStyle: 'none', mt: 1 }}>
        {[
          'Uploaded documents are stored in private, encrypted storage with no publicly accessible links. Each user\'s files are completely isolated.',
          'All payment processing is handled by a PCI DSS Level 1 certified processor &mdash; the highest level of payment security certification in the industry. Your credit card numbers and billing details never touch our servers.',
        ].map((text, i) => (
          <Typography key={i} component="li" sx={{ ...bulletItem, display: 'flex', alignItems: 'flex-start' }}>
            {checkIcon} {text}
          </Typography>
        ))}
      </Box>

      <Divider sx={{ my: 2 }} />

      {/* ─────────────────────────────────────────────────────────────────────── */}
      {/* IMPORTANT NOTE */}
      {/* ─────────────────────────────────────────────────────────────────────── */}
      <Box
        sx={{
          bgcolor: '#f0f5fa',
          border: '1px solid #c8dae8',
          borderRadius: 2,
          p: 2.5,
          mt: 1,
        }}
      >
        <Typography
          sx={{
            fontFamily: '"Playfair Display", serif',
            fontWeight: 600,
            fontSize: '1.05rem',
            color: '#1e3a5f',
            mb: 1,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          }}
        >
          <ShieldIcon sx={{ fontSize: 20, color: '#2e7d32' }} />
          Important: Your Credential Vault Passphrase
        </Typography>
        <Typography sx={{ ...bodyText, fontSize: '0.88rem' }}>
          When you set up the Credential Vault, you create a passphrase and receive
          a one-time recovery key. <strong>If you lose both your passphrase and your
          recovery key, we cannot recover your encrypted vault data.</strong> This is
          by design &mdash; it ensures that no one, including our team, can ever read
          your stored passwords and credentials. Please store your recovery key in a
          safe place.
        </Typography>
      </Box>

      {/* ─── COMMITMENT ─── */}
      <Box
        sx={{
          bgcolor: '#fdf6ec',
          border: '1px solid #e8d5b0',
          borderRadius: 2,
          p: 2.5,
          mt: 3,
        }}
      >
        <Typography
          sx={{
            fontFamily: '"Playfair Display", serif',
            fontWeight: 600,
            fontSize: '1rem',
            color: '#7a5c1e',
            mb: 1,
          }}
        >
          Our Commitment to You
        </Typography>
        <Typography sx={{ ...bodyText, fontSize: '0.88rem', color: '#5a4a2e' }}>
          No platform can promise absolute security &mdash; anyone who makes that
          claim is not being truthful. What we <em>can</em> promise is that we have
          implemented industry-leading security practices at every layer of this
          platform, that we continuously monitor for emerging threats, and that we
          treat your data with the same care we would want for our own
          families&rsquo; most personal information. If you ever have questions or
          concerns, we welcome the conversation.
        </Typography>
      </Box>

      <Typography
        sx={{
          ...bodyText,
          fontSize: '0.82rem',
          color: '#888',
          mt: 2,
          textAlign: 'center',
        }}
      >
        Questions about our security practices? Contact us at carl@SeniorCareRes.com
      </Typography>
    </DialogContent>

    <DialogActions sx={{ px: 3, py: 1.5 }}>
      <Button
        onClick={onClose}
        variant="contained"
        sx={{ bgcolor: '#1e3a5f', '&:hover': { bgcolor: '#0f2744' } }}
      >
        Close
      </Button>
    </DialogActions>
  </Dialog>
);

export default SecurityInfoModal;
