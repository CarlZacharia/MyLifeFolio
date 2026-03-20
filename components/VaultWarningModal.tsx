'use client';

import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
} from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

interface VaultWarningModalProps {
  open: boolean;
  onAccept: () => void;
  onCancel: () => void;
}

const VaultWarningModal: React.FC<VaultWarningModalProps> = ({ open, onAccept, onCancel }) => {
  return (
    <Dialog
      open={open}
      onClose={onCancel}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderTop: '4px solid #e65100',
          borderRadius: 2,
        },
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          bgcolor: 'rgba(230, 81, 0, 0.06)',
          pb: 1.5,
        }}
      >
        <WarningAmberIcon sx={{ color: '#e65100', fontSize: 28 }} />
        <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1.1rem' }}>
          Important Notice — Sensitive Information
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ pt: 2.5 }}>
        <Typography variant="body2" sx={{ mb: 2, lineHeight: 1.7 }}>
          This section stores online account credentials that could provide access to your financial
          accounts, email, and other sensitive services.
        </Typography>

        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5 }}>
          Before proceeding, please understand:
        </Typography>

        <Box component="ul" sx={{ pl: 2.5, m: 0, mb: 2 }}>
          {[
            'MyLifeFolio uses strong encryption to protect this data, but no system is completely immune to breach.',
            'You are solely responsible for the security of your Vault Master Passphrase.',
            'If you forget your passphrase and lose your recovery key, this data cannot be recovered — by anyone.',
            'We strongly recommend using a dedicated password manager (such as Bitwarden or 1Password) as your primary credential store.',
            'This vault is best used as a legacy reference for your executor, trustee, or POA agent — not for day-to-day password retrieval.',
            'Never share your MyLifeFolio login or Vault Master Passphrase with anyone other than a trusted successor under documented legal authority.',
          ].map((text, idx) => (
            <Typography
              key={idx}
              component="li"
              variant="body2"
              sx={{ mb: 1, lineHeight: 1.6, color: 'text.secondary' }}
            >
              {text}
            </Typography>
          ))}
        </Box>

        <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.primary' }}>
          By continuing, you acknowledge that you understand and accept these risks.
        </Typography>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
        <Button onClick={onCancel} color="inherit" sx={{ color: 'text.secondary' }}>
          Cancel
        </Button>
        <Button
          onClick={onAccept}
          variant="contained"
          sx={{
            bgcolor: '#e65100',
            '&:hover': { bgcolor: '#bf360c' },
          }}
        >
          I Understand — Continue
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default VaultWarningModal;
