'use client';

import React, { useState, useEffect } from 'react';
import { TextField, Box } from '@mui/material';
import FolioModal, {
  folioTextFieldSx, FolioCancelButton, FolioSaveButton, FolioDeleteButton,
  FolioFieldFade, useFolioFieldAnimation,
} from './FolioModal';

export interface CharityOrgData {
  organizationName: string;
  website: string;
  contactInfo: string;
  notes: string;
}

export const emptyCharityOrg = (): CharityOrgData => ({
  organizationName: '', website: '', contactInfo: '', notes: '',
});

interface Props {
  open: boolean; onClose: () => void; onSave: (data: CharityOrgData) => void;
  onDelete?: () => void; initialData?: CharityOrgData; isEdit?: boolean;
}

const LegacyCharityModal: React.FC<Props> = ({ open, onClose, onSave, onDelete, initialData, isEdit = false }) => {
  const [data, setData] = useState<CharityOrgData>(initialData || emptyCharityOrg());
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (open) { setData(isEdit && initialData ? initialData : emptyCharityOrg()); setTouched({}); }
  }, [open, isEdit, initialData]);

  const handleChange = (updates: Partial<CharityOrgData>) => setData((prev) => ({ ...prev, ...updates }));
  const nameError = touched.organizationName && !data.organizationName.trim();
  const canSave = data.organizationName.trim().length > 0;

  const handleSave = () => {
    if (!canSave) { setTouched({ organizationName: true }); return; }
    onSave(data); onClose();
  };

  const fieldsVisible = useFolioFieldAnimation(open);
  let idx = 0;

  return (
    <FolioModal open={open} onClose={onClose}
      title={isEdit ? 'Edit Organization' : 'Add Organization'}
      eyebrow="My Life Folio — Charitable Wishes" maxWidth="sm"
      footer={<><Box>{isEdit && onDelete && <FolioDeleteButton onClick={onDelete} />}</Box>
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <FolioCancelButton onClick={onClose} />
          <FolioSaveButton onClick={handleSave} disabled={!canSave}>
            {isEdit ? 'Save Changes' : 'Add Organization'}
          </FolioSaveButton></Box></>}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
        <FolioFieldFade visible={fieldsVisible} index={idx++}>
          <TextField label="Organization Name" value={data.organizationName}
            onChange={(e) => handleChange({ organizationName: e.target.value })}
            onBlur={() => setTouched((p) => ({ ...p, organizationName: true }))}
            error={!!nameError} helperText={nameError ? 'Organization name is required' : ''}
            required InputLabelProps={{ shrink: true }} fullWidth sx={{ ...folioTextFieldSx }} />
        </FolioFieldFade>
        <FolioFieldFade visible={fieldsVisible} index={idx++}>
          <TextField label="Website" value={data.website}
            onChange={(e) => handleChange({ website: e.target.value })}
            InputLabelProps={{ shrink: true }} placeholder="https://" fullWidth sx={{ ...folioTextFieldSx }} />
        </FolioFieldFade>
        <FolioFieldFade visible={fieldsVisible} index={idx++}>
          <TextField label="Contact Info" value={data.contactInfo}
            onChange={(e) => handleChange({ contactInfo: e.target.value })}
            InputLabelProps={{ shrink: true }} fullWidth sx={{ ...folioTextFieldSx }} />
        </FolioFieldFade>
        <FolioFieldFade visible={fieldsVisible} index={idx++}>
          <TextField label="Notes" value={data.notes}
            onChange={(e) => handleChange({ notes: e.target.value })}
            InputLabelProps={{ shrink: true }} placeholder='e.g. "Donations in lieu of flowers"'
            multiline minRows={2} fullWidth sx={{ ...folioTextFieldSx }} />
        </FolioFieldFade>
      </Box>
    </FolioModal>
  );
};

export default LegacyCharityModal;
