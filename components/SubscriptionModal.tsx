'use client';

import React, { useState, useEffect } from 'react';
import {
  TextField,
  Box,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Divider,
  Typography,
} from '@mui/material';
import FolioModal, {
  folioTextFieldSx,
  FolioCancelButton,
  FolioSaveButton,
  FolioDeleteButton,
  FolioFieldFade,
  useFolioFieldAnimation,
} from './FolioModal';

export const SUBSCRIPTION_CATEGORIES = [
  'Streaming / Entertainment',
  'Music',
  'News / Magazines',
  'Social Media',
  'Software / Apps',
  'Cloud Storage',
  'Fitness / Health',
  'Food / Meal Delivery',
  'Shopping / Membership',
  'Education / Learning',
  'Gaming',
  'Home / Utilities',
  'Financial / Banking',
  'Other',
] as const;

export const SUBSCRIPTION_FREQUENCIES = [
  'Monthly',
  'Annual',
  'Quarterly',
  'Weekly',
  'Other',
] as const;

export interface SubscriptionData {
  serviceName: string;
  category: string;
  frequency: string;
  amount: string;
  paymentMethod: string;
  accountHolder: string;
  loginEmail: string;
  autoRenew: boolean;
  renewalDate: string;
  isActive: boolean;
  notes: string;
}

export const emptySubscription = (): SubscriptionData => ({
  serviceName: '',
  category: '',
  frequency: 'Monthly',
  amount: '',
  paymentMethod: '',
  accountHolder: '',
  loginEmail: '',
  autoRenew: true,
  renewalDate: '',
  isActive: true,
  notes: '',
});

interface SubscriptionModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: SubscriptionData) => void;
  onDelete?: () => void;
  initialData?: SubscriptionData;
  isEdit?: boolean;
}

const SubscriptionModal: React.FC<SubscriptionModalProps> = ({
  open,
  onClose,
  onSave,
  onDelete,
  initialData,
  isEdit = false,
}) => {
  const [data, setData] = useState<SubscriptionData>(initialData || emptySubscription());
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (open) {
      setData(isEdit && initialData ? initialData : emptySubscription());
      setTouched({});
    }
  }, [open, isEdit, initialData]);

  const handleChange = (updates: Partial<SubscriptionData>) => {
    setData((prev) => ({ ...prev, ...updates }));
  };

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const nameError = touched.serviceName && !data.serviceName.trim();
  const canSave = data.serviceName.trim().length > 0;

  const handleSave = () => {
    if (!canSave) {
      setTouched({ serviceName: true });
      return;
    }
    onSave(data);
    onClose();
  };

  const fieldsVisible = useFolioFieldAnimation(open);
  let idx = 0;

  return (
    <FolioModal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Edit Subscription' : 'Add Subscription'}
      eyebrow="My Life Folio — Subscriptions"
      maxWidth="sm"
      footer={
        <>
          <Box>
            {isEdit && onDelete && <FolioDeleteButton onClick={onDelete} />}
          </Box>
          <Box sx={{ display: 'flex', gap: 1.5 }}>
            <FolioCancelButton onClick={onClose} />
            <FolioSaveButton onClick={handleSave} disabled={!canSave}>
              {isEdit ? 'Save Changes' : 'Add Subscription'}
            </FolioSaveButton>
          </Box>
        </>
      }
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
        <FolioFieldFade visible={fieldsVisible} index={idx++}>
          <TextField
            label="Service Name"
            value={data.serviceName}
            onChange={(e) => handleChange({ serviceName: e.target.value })}
            onBlur={() => handleBlur('serviceName')}
            error={!!nameError}
            helperText={nameError ? 'Service name is required' : 'e.g. "Netflix", "Spotify", "New York Times"'}
            required
            InputLabelProps={{ shrink: true }}
            fullWidth
            sx={{ ...folioTextFieldSx }}
          />
        </FolioFieldFade>

        <FolioFieldFade visible={fieldsVisible} index={idx++}>
          <TextField
            select
            label="Category"
            value={data.category}
            onChange={(e) => handleChange({ category: e.target.value })}
            InputLabelProps={{ shrink: true }}
            fullWidth
            sx={{ ...folioTextFieldSx }}
          >
            <MenuItem value=""><em>Select category</em></MenuItem>
            {SUBSCRIPTION_CATEGORIES.map((c) => (
              <MenuItem key={c} value={c}>{c}</MenuItem>
            ))}
          </TextField>
        </FolioFieldFade>

        <FolioFieldFade visible={fieldsVisible} index={idx++}>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              label="Amount"
              value={data.amount}
              onChange={(e) => handleChange({ amount: e.target.value })}
              InputLabelProps={{ shrink: true }}
              placeholder="e.g. $15.99"
              sx={{ flex: 1, ...folioTextFieldSx }}
            />
            <TextField
              select
              label="Frequency"
              value={data.frequency}
              onChange={(e) => handleChange({ frequency: e.target.value })}
              InputLabelProps={{ shrink: true }}
              sx={{ flex: 1, ...folioTextFieldSx }}
            >
              {SUBSCRIPTION_FREQUENCIES.map((f) => (
                <MenuItem key={f} value={f}>{f}</MenuItem>
              ))}
            </TextField>
          </Box>
        </FolioFieldFade>

        <FolioFieldFade visible={fieldsVisible} index={idx++}>
          <Divider sx={{ my: 0.5 }} />
          <Typography variant="caption" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'text.secondary' }}>
            Account Details
          </Typography>
        </FolioFieldFade>

        <FolioFieldFade visible={fieldsVisible} index={idx++}>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              label="Account Holder"
              value={data.accountHolder}
              onChange={(e) => handleChange({ accountHolder: e.target.value })}
              InputLabelProps={{ shrink: true }}
              placeholder="Who is on the account"
              sx={{ flex: 1, ...folioTextFieldSx }}
            />
            <TextField
              label="Login Email"
              value={data.loginEmail}
              onChange={(e) => handleChange({ loginEmail: e.target.value })}
              InputLabelProps={{ shrink: true }}
              placeholder="Email used to sign in"
              sx={{ flex: 1, ...folioTextFieldSx }}
            />
          </Box>
        </FolioFieldFade>

        <FolioFieldFade visible={fieldsVisible} index={idx++}>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              label="Payment Method"
              value={data.paymentMethod}
              onChange={(e) => handleChange({ paymentMethod: e.target.value })}
              InputLabelProps={{ shrink: true }}
              placeholder='e.g. "Visa ending 4242", "PayPal"'
              sx={{ flex: 1, ...folioTextFieldSx }}
            />
            <TextField
              label="Renewal Date"
              value={data.renewalDate}
              onChange={(e) => handleChange({ renewalDate: e.target.value })}
              InputLabelProps={{ shrink: true }}
              type="date"
              sx={{ flex: 1, ...folioTextFieldSx }}
            />
          </Box>
        </FolioFieldFade>

        <FolioFieldFade visible={fieldsVisible} index={idx++}>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <FormControlLabel
              control={<Checkbox checked={data.autoRenew} onChange={(e) => handleChange({ autoRenew: e.target.checked })} />}
              label="Auto-Renews"
            />
            <FormControlLabel
              control={<Checkbox checked={!data.isActive} onChange={(e) => handleChange({ isActive: !e.target.checked })} />}
              label="Cancelled (Inactive)"
            />
          </Box>
        </FolioFieldFade>

        <FolioFieldFade visible={fieldsVisible} index={idx++}>
          <TextField
            label="Notes"
            value={data.notes}
            onChange={(e) => handleChange({ notes: e.target.value })}
            InputLabelProps={{ shrink: true }}
            multiline
            minRows={2}
            fullWidth
            placeholder="Plan tier, shared with family, cancellation policy, etc."
            sx={{ ...folioTextFieldSx }}
          />
        </FolioFieldFade>
      </Box>
    </FolioModal>
  );
};

export default SubscriptionModal;
