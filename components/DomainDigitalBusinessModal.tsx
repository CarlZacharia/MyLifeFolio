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

export const DOMAIN_BUSINESS_TYPES = [
  'Domain Name', 'Website', 'E-Commerce / Online Store', 'Blog / Content Site',
  'Digital Product / Course', 'SaaS / Web Application', 'Social Media Business Page', 'Other',
] as const;

export const DOMAIN_REGISTRARS = [
  'GoDaddy', 'Namecheap', 'Google Domains / Squarespace', 'Cloudflare',
  'Network Solutions', 'Name.com', 'Hover', 'AWS Route 53', 'Other',
] as const;

export const DOMAIN_BUSINESS_FREQUENCIES = [
  'Monthly', 'Annual', 'Bi-Annual', 'Other',
] as const;

export interface DomainDigitalBusinessData {
  name: string;
  businessType: string;
  registrarHost: string;
  expirationDate: string;
  loginEmail: string;
  accountHolder: string;
  estimatedValue: string;
  monthlyRevenue: string;
  hostingCost: string;
  hostingFrequency: string;
  paymentMethod: string;
  autoRenew: boolean;
  isActive: boolean;
  notes: string;
}

export const emptyDomainDigitalBusiness = (): DomainDigitalBusinessData => ({
  name: '',
  businessType: 'Domain Name',
  registrarHost: '',
  expirationDate: '',
  loginEmail: '',
  accountHolder: '',
  estimatedValue: '',
  monthlyRevenue: '',
  hostingCost: '',
  hostingFrequency: 'Annual',
  paymentMethod: '',
  autoRenew: true,
  isActive: true,
  notes: '',
});

interface DomainDigitalBusinessModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: DomainDigitalBusinessData) => void;
  onDelete?: () => void;
  initialData?: DomainDigitalBusinessData;
  isEdit?: boolean;
}

const DomainDigitalBusinessModal: React.FC<DomainDigitalBusinessModalProps> = ({
  open,
  onClose,
  onSave,
  onDelete,
  initialData,
  isEdit = false,
}) => {
  const [data, setData] = useState<DomainDigitalBusinessData>(initialData || emptyDomainDigitalBusiness());
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (open) {
      setData(isEdit && initialData ? initialData : emptyDomainDigitalBusiness());
      setTouched({});
    }
  }, [open, isEdit, initialData]);

  const handleChange = (updates: Partial<DomainDigitalBusinessData>) => {
    setData((prev) => ({ ...prev, ...updates }));
  };

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const nameError = touched.name && !data.name.trim();
  const canSave = data.name.trim().length > 0;

  const handleSave = () => {
    if (!canSave) {
      setTouched({ name: true });
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
      title={isEdit ? 'Edit Domain / Business' : 'Add Domain / Business'}
      eyebrow="My Life Folio — Domains & Digital Business"
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
            label="Domain / Business Name"
            value={data.name}
            onChange={(e) => handleChange({ name: e.target.value })}
            onBlur={() => handleBlur('name')}
            error={!!nameError}
            helperText={nameError ? 'Domain / business name is required' : 'e.g. "mywebsite.com", "My Etsy Store", "SaaS App Name"'}
            required
            InputLabelProps={{ shrink: true }}
            fullWidth
            sx={{ ...folioTextFieldSx }}
          />
        </FolioFieldFade>

        <FolioFieldFade visible={fieldsVisible} index={idx++}>
          <TextField
            select
            label="Business Type"
            value={data.businessType}
            onChange={(e) => handleChange({ businessType: e.target.value })}
            InputLabelProps={{ shrink: true }}
            fullWidth
            sx={{ ...folioTextFieldSx }}
          >
            {DOMAIN_BUSINESS_TYPES.map((t) => (
              <MenuItem key={t} value={t}>{t}</MenuItem>
            ))}
          </TextField>
        </FolioFieldFade>

        <FolioFieldFade visible={fieldsVisible} index={idx++}>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              select
              label="Registrar / Host"
              value={data.registrarHost}
              onChange={(e) => handleChange({ registrarHost: e.target.value })}
              InputLabelProps={{ shrink: true }}
              sx={{ flex: 1, ...folioTextFieldSx }}
            >
              <MenuItem value=""><em>Select registrar</em></MenuItem>
              {DOMAIN_REGISTRARS.map((r) => (
                <MenuItem key={r} value={r}>{r}</MenuItem>
              ))}
            </TextField>
            <TextField
              label="Expiration Date"
              value={data.expirationDate}
              onChange={(e) => handleChange({ expirationDate: e.target.value })}
              InputLabelProps={{ shrink: true }}
              type="date"
              sx={{ flex: 1, ...folioTextFieldSx }}
            />
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
              label="Estimated Value"
              value={data.estimatedValue}
              onChange={(e) => handleChange({ estimatedValue: e.target.value })}
              InputLabelProps={{ shrink: true }}
              placeholder="e.g. $10,000"
              sx={{ flex: 1, ...folioTextFieldSx }}
            />
          </Box>
        </FolioFieldFade>

        <FolioFieldFade visible={fieldsVisible} index={idx++}>
          <Divider sx={{ my: 0.5 }} />
          <Typography variant="caption" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'text.secondary' }}>
            Hosting / Cost
          </Typography>
        </FolioFieldFade>

        <FolioFieldFade visible={fieldsVisible} index={idx++}>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              label="Hosting Cost"
              value={data.hostingCost}
              onChange={(e) => handleChange({ hostingCost: e.target.value })}
              InputLabelProps={{ shrink: true }}
              placeholder="e.g. $25.00"
              sx={{ flex: 1, ...folioTextFieldSx }}
            />
            <TextField
              select
              label="Frequency"
              value={data.hostingFrequency}
              onChange={(e) => handleChange({ hostingFrequency: e.target.value })}
              InputLabelProps={{ shrink: true }}
              sx={{ flex: 1, ...folioTextFieldSx }}
            >
              {DOMAIN_BUSINESS_FREQUENCIES.map((f) => (
                <MenuItem key={f} value={f}>{f}</MenuItem>
              ))}
            </TextField>
          </Box>
        </FolioFieldFade>

        <FolioFieldFade visible={fieldsVisible} index={idx++}>
          <TextField
            label="Monthly Revenue"
            value={data.monthlyRevenue}
            onChange={(e) => handleChange({ monthlyRevenue: e.target.value })}
            InputLabelProps={{ shrink: true }}
            placeholder="Average monthly revenue if applicable"
            fullWidth
            sx={{ ...folioTextFieldSx }}
          />
        </FolioFieldFade>

        <FolioFieldFade visible={fieldsVisible} index={idx++}>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <FormControlLabel
              control={<Checkbox checked={data.autoRenew} onChange={(e) => handleChange({ autoRenew: e.target.checked })} />}
              label="Auto-Renews"
            />
            <FormControlLabel
              control={<Checkbox checked={!data.isActive} onChange={(e) => handleChange({ isActive: !e.target.checked })} />}
              label="Inactive / Sold / Expired"
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
            placeholder="Transfer instructions, DNS details, linked services, etc."
            sx={{ ...folioTextFieldSx }}
          />
        </FolioFieldFade>
      </Box>
    </FolioModal>
  );
};

export default DomainDigitalBusinessModal;
