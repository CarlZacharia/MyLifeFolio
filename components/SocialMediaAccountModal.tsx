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

export const SOCIAL_MEDIA_PLATFORMS = [
  'Facebook', 'Instagram', 'X (Twitter)', 'LinkedIn', 'TikTok', 'YouTube',
  'Pinterest', 'Snapchat', 'Threads', 'Reddit', 'Gmail', 'Yahoo Mail',
  'Outlook / Hotmail', 'iCloud Mail', 'ProtonMail', 'Other Email', 'Other',
] as const;

export const SOCIAL_MEDIA_ACCOUNT_TYPES = [
  'Social Media', 'Email', 'Forum / Community', 'Content Platform', 'Other',
] as const;

export const DEATH_WISHES = [
  'Memorialize the account', 'Permanently delete', 'Transfer to a trusted person',
  'Download data first, then delete', 'No preference',
] as const;

export interface SocialMediaAccountData {
  platform: string;
  accountType: string;
  usernameHandle: string;
  loginEmail: string;
  accountHolder: string;
  recoveryEmailPhone: string;
  wishesAtDeath: string;
  transferToName: string;
  hasMonetization: boolean;
  notes: string;
}

export const emptySocialMediaAccount = (): SocialMediaAccountData => ({
  platform: '',
  accountType: 'Social Media',
  usernameHandle: '',
  loginEmail: '',
  accountHolder: '',
  recoveryEmailPhone: '',
  wishesAtDeath: 'No preference',
  transferToName: '',
  hasMonetization: false,
  notes: '',
});

interface SocialMediaAccountModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: SocialMediaAccountData) => void;
  onDelete?: () => void;
  initialData?: SocialMediaAccountData;
  isEdit?: boolean;
}

const SocialMediaAccountModal: React.FC<SocialMediaAccountModalProps> = ({
  open,
  onClose,
  onSave,
  onDelete,
  initialData,
  isEdit = false,
}) => {
  const [data, setData] = useState<SocialMediaAccountData>(initialData || emptySocialMediaAccount());
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (open) {
      setData(isEdit && initialData ? initialData : emptySocialMediaAccount());
      setTouched({});
    }
  }, [open, isEdit, initialData]);

  const handleChange = (updates: Partial<SocialMediaAccountData>) => {
    setData((prev) => ({ ...prev, ...updates }));
  };

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const platformError = touched.platform && !data.platform.trim();
  const canSave = data.platform.trim().length > 0;

  const handleSave = () => {
    if (!canSave) {
      setTouched({ platform: true });
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
      title={isEdit ? 'Edit Account' : 'Add Account'}
      eyebrow="My Life Folio — Social Media & Email"
      maxWidth="sm"
      footer={
        <>
          <Box>
            {isEdit && onDelete && <FolioDeleteButton onClick={onDelete} />}
          </Box>
          <Box sx={{ display: 'flex', gap: 1.5 }}>
            <FolioCancelButton onClick={onClose} />
            <FolioSaveButton onClick={handleSave} disabled={!canSave}>
              {isEdit ? 'Save Changes' : 'Save'}
            </FolioSaveButton>
          </Box>
        </>
      }
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
        <FolioFieldFade visible={fieldsVisible} index={idx++}>
          <TextField
            select
            label="Platform"
            value={data.platform}
            onChange={(e) => handleChange({ platform: e.target.value })}
            onBlur={() => handleBlur('platform')}
            error={!!platformError}
            helperText={platformError ? 'Platform is required' : ''}
            required
            InputLabelProps={{ shrink: true }}
            fullWidth
            sx={{ ...folioTextFieldSx }}
          >
            <MenuItem value=""><em>Select platform</em></MenuItem>
            {SOCIAL_MEDIA_PLATFORMS.map((p) => (
              <MenuItem key={p} value={p}>{p}</MenuItem>
            ))}
          </TextField>
        </FolioFieldFade>

        <FolioFieldFade visible={fieldsVisible} index={idx++}>
          <TextField
            select
            label="Account Type"
            value={data.accountType}
            onChange={(e) => handleChange({ accountType: e.target.value })}
            InputLabelProps={{ shrink: true }}
            fullWidth
            sx={{ ...folioTextFieldSx }}
          >
            {SOCIAL_MEDIA_ACCOUNT_TYPES.map((t) => (
              <MenuItem key={t} value={t}>{t}</MenuItem>
            ))}
          </TextField>
        </FolioFieldFade>

        <FolioFieldFade visible={fieldsVisible} index={idx++}>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              label="Username / Handle"
              value={data.usernameHandle}
              onChange={(e) => handleChange({ usernameHandle: e.target.value })}
              InputLabelProps={{ shrink: true }}
              placeholder="@username or profile name"
              sx={{ flex: 1, ...folioTextFieldSx }}
            />
            <TextField
              label="Login Email"
              value={data.loginEmail}
              onChange={(e) => handleChange({ loginEmail: e.target.value })}
              InputLabelProps={{ shrink: true }}
              sx={{ flex: 1, ...folioTextFieldSx }}
            />
          </Box>
        </FolioFieldFade>

        <FolioFieldFade visible={fieldsVisible} index={idx++}>
          <Divider sx={{ my: 0.5 }} />
          <Typography variant="caption" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'text.secondary' }}>
            Account Holder
          </Typography>
        </FolioFieldFade>

        <FolioFieldFade visible={fieldsVisible} index={idx++}>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              label="Account Holder"
              value={data.accountHolder}
              onChange={(e) => handleChange({ accountHolder: e.target.value })}
              InputLabelProps={{ shrink: true }}
              sx={{ flex: 1, ...folioTextFieldSx }}
            />
            <TextField
              label="Recovery Email / Phone"
              value={data.recoveryEmailPhone}
              onChange={(e) => handleChange({ recoveryEmailPhone: e.target.value })}
              InputLabelProps={{ shrink: true }}
              placeholder="Backup contact for account recovery"
              sx={{ flex: 1, ...folioTextFieldSx }}
            />
          </Box>
        </FolioFieldFade>

        <FolioFieldFade visible={fieldsVisible} index={idx++}>
          <Divider sx={{ my: 0.5 }} />
          <Typography variant="caption" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'text.secondary' }}>
            End-of-Life Wishes
          </Typography>
        </FolioFieldFade>

        <FolioFieldFade visible={fieldsVisible} index={idx++}>
          <TextField
            select
            label="Wishes at Death"
            value={data.wishesAtDeath}
            onChange={(e) => handleChange({ wishesAtDeath: e.target.value })}
            InputLabelProps={{ shrink: true }}
            fullWidth
            sx={{ ...folioTextFieldSx }}
          >
            {DEATH_WISHES.map((w) => (
              <MenuItem key={w} value={w}>{w}</MenuItem>
            ))}
          </TextField>
        </FolioFieldFade>

        {data.wishesAtDeath === 'Transfer to a trusted person' && (
          <FolioFieldFade visible={fieldsVisible} index={idx++}>
            <TextField
              label="Transfer To"
              value={data.transferToName}
              onChange={(e) => handleChange({ transferToName: e.target.value })}
              InputLabelProps={{ shrink: true }}
              placeholder="Name of person to transfer account to"
              fullWidth
              sx={{ ...folioTextFieldSx }}
            />
          </FolioFieldFade>
        )}

        <FolioFieldFade visible={fieldsVisible} index={idx++}>
          <FormControlLabel
            control={<Checkbox checked={data.hasMonetization} onChange={(e) => handleChange({ hasMonetization: e.target.checked })} />}
            label="This account has monetization / earns income"
          />
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
            sx={{ ...folioTextFieldSx }}
          />
        </FolioFieldFade>
      </Box>
    </FolioModal>
  );
};

export default SocialMediaAccountModal;
