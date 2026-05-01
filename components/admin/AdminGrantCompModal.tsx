'use client';

import React, { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, MenuItem, Typography, Alert, Box,
} from '@mui/material';
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard';
import { SubscriptionTier } from '../../lib/subscriptionConfig';
import { AdminUser, grantCompSubscription } from '../../lib/adminService';

interface AdminGrantCompModalProps {
  open: boolean;
  onClose: () => void;
  users: AdminUser[];
  onGranted: () => void;
}

const AdminGrantCompModal: React.FC<AdminGrantCompModalProps> = ({
  open, onClose, users, onGranted,
}) => {
  const [selectedUserId, setSelectedUserId] = useState('');
  const [tier, setTier] = useState<SubscriptionTier>('paid');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const eligibleUsers = users.filter(
    (u) => u.tier === 'trial' || u.tier === null || u.sub_status === 'cancelled' || u.sub_status === 'expired'
  );

  const handleGrant = async () => {
    if (!selectedUserId) return;
    setSaving(true);
    setError(null);
    try {
      await grantCompSubscription(selectedUserId, tier);
      onGranted();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to grant subscription');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 600, color: '#1e3a5f', display: 'flex', alignItems: 'center', gap: 1 }}>
        <CardGiftcardIcon /> Grant Complimentary Subscription
      </DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Grant a free subscription to a user. This does NOT create a Stripe subscription.
        </Typography>

        <TextField
          select
          label="User"
          value={selectedUserId}
          onChange={(e) => setSelectedUserId(e.target.value)}
          fullWidth
          sx={{ mb: 2 }}
        >
          {eligibleUsers.length === 0 ? (
            <MenuItem disabled>No eligible users</MenuItem>
          ) : (
            eligibleUsers.map((u) => (
              <MenuItem key={u.id} value={u.id}>
                {u.name || u.email} — {u.email} ({u.tier || 'no sub'})
              </MenuItem>
            ))
          )}
        </TextField>

        <TextField
          select
          label="Tier"
          value={tier}
          onChange={(e) => setTier(e.target.value as SubscriptionTier)}
          fullWidth
          sx={{ mb: 2 }}
        >
          <MenuItem value="paid">Paid ($149/yr value)</MenuItem>
        </TextField>

        <Box sx={{ bgcolor: '#e3f2fd', border: '1px solid #90caf9', borderRadius: 1, p: 1.5 }}>
          <Typography variant="caption" color="text.secondary">
            The user's subscription row will be set to the selected tier with status "active".
            No Stripe customer or payment method will be created.
          </Typography>
        </Box>

        {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={saving}>Cancel</Button>
        <Button
          variant="contained"
          onClick={handleGrant}
          disabled={saving || !selectedUserId}
          sx={{ bgcolor: '#1e3a5f', '&:hover': { bgcolor: '#0f2744' } }}
        >
          {saving ? 'Granting...' : 'Grant Subscription'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AdminGrantCompModal;
