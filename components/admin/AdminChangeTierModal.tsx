'use client';

import React, { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, MenuItem, Typography, Alert, Box,
} from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { SubscriptionTier } from '../../lib/subscriptionConfig';

interface AdminChangeTierModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (tier: SubscriptionTier) => Promise<void>;
  userName: string;
  currentTier: SubscriptionTier | null;
}

const AdminChangeTierModal: React.FC<AdminChangeTierModalProps> = ({
  open, onClose, onConfirm, userName, currentTier,
}) => {
  const [tier, setTier] = useState<SubscriptionTier>(currentTier || 'trial');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async () => {
    setSaving(true);
    setError(null);
    try {
      await onConfirm(tier);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update tier');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ fontWeight: 600, color: '#1e3a5f' }}>
        Change Subscription Tier
      </DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Changing tier for <strong>{userName}</strong>
        </Typography>

        <TextField
          select
          label="Tier"
          value={tier}
          onChange={(e) => setTier(e.target.value as SubscriptionTier)}
          fullWidth
          sx={{ mb: 2 }}
        >
          <MenuItem value="trial">Trial (free 6 months)</MenuItem>
          <MenuItem value="paid">Paid ($149/yr)</MenuItem>
        </TextField>

        <Box sx={{ bgcolor: '#fff3e0', border: '1px solid #ff9800', borderRadius: 1, p: 1.5, display: 'flex', gap: 1, alignItems: 'flex-start' }}>
          <WarningAmberIcon sx={{ color: '#e65100', fontSize: 20, mt: 0.2 }} />
          <Typography variant="caption" sx={{ color: '#e65100' }}>
            This is a manual override and does NOT affect Stripe billing. To modify the Stripe subscription, use the Stripe Dashboard.
          </Typography>
        </Box>

        {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={saving}>Cancel</Button>
        <Button
          variant="contained"
          onClick={handleConfirm}
          disabled={saving || tier === currentTier}
          sx={{ bgcolor: '#1e3a5f', '&:hover': { bgcolor: '#0f2744' } }}
        >
          {saving ? 'Saving...' : 'Confirm'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AdminChangeTierModal;
