'use client';

import React, { useState, useEffect } from 'react';
import {
  TextField,
  Box,
} from '@mui/material';
import FolioModal, {
  folioTextFieldSx,
  FolioCancelButton,
  FolioSaveButton,
  FolioDeleteButton,
  FolioFieldFade,
  useFolioFieldAnimation,
} from './FolioModal';

export interface FriendNeighborData {
  name: string;
  relationship: string;
  address: string;
  phone: string;
  email: string;
  notes: string;
}

const emptyFriendNeighbor: FriendNeighborData = {
  name: '',
  relationship: '',
  address: '',
  phone: '',
  email: '',
  notes: '',
};

interface FriendNeighborModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: FriendNeighborData) => void;
  onDelete?: () => void;
  initialData?: FriendNeighborData;
  isEdit?: boolean;
}

const FriendNeighborModal: React.FC<FriendNeighborModalProps> = ({
  open,
  onClose,
  onSave,
  onDelete,
  initialData,
  isEdit = false,
}) => {
  const [data, setData] = useState<FriendNeighborData>(initialData || emptyFriendNeighbor);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const fieldsVisible = useFolioFieldAnimation(open);

  useEffect(() => {
    if (open) {
      setData(isEdit && initialData ? initialData : emptyFriendNeighbor);
      setTouched({});
    }
  }, [open, isEdit, initialData]);

  const handleChange = (updates: Partial<FriendNeighborData>) => {
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

  return (
    <FolioModal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Edit Friend or Neighbor' : 'Add Friend or Neighbor'}
      eyebrow="My Life Folio — Friends & Neighbors"
      footer={
        <>
          <Box>
            {isEdit && onDelete && <FolioDeleteButton onClick={onDelete} />}
          </Box>
          <Box sx={{ display: 'flex', gap: 1.5 }}>
            <FolioCancelButton onClick={onClose} />
            <FolioSaveButton onClick={handleSave} disabled={!canSave}>
              {isEdit ? 'Save Changes' : 'Add Entry'}
            </FolioSaveButton>
          </Box>
        </>
      }
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
        <FolioFieldFade visible={fieldsVisible} index={0}>
          <TextField
            label="Name"
            value={data.name}
            onChange={(e) => handleChange({ name: e.target.value })}
            onBlur={() => handleBlur('name')}
            error={!!nameError}
            helperText={nameError ? 'Name is required' : ''}
            required
            InputLabelProps={{ shrink: true }}
            fullWidth
            sx={{ ...folioTextFieldSx }}
          />
        </FolioFieldFade>

        <FolioFieldFade visible={fieldsVisible} index={1}>
          <TextField
            label="Relationship"
            value={data.relationship}
            onChange={(e) => handleChange({ relationship: e.target.value })}
            InputLabelProps={{ shrink: true }}
            fullWidth
            sx={{ ...folioTextFieldSx }}
          />
        </FolioFieldFade>

        <FolioFieldFade visible={fieldsVisible} index={2}>
          <TextField
            label="Address"
            value={data.address}
            onChange={(e) => handleChange({ address: e.target.value })}
            InputLabelProps={{ shrink: true }}
            fullWidth
            sx={{ ...folioTextFieldSx }}
          />
        </FolioFieldFade>

        <FolioFieldFade visible={fieldsVisible} index={3}>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              label="Phone"
              value={data.phone}
              onChange={(e) => handleChange({ phone: e.target.value })}
              InputLabelProps={{ shrink: true }}
              sx={{ flex: 1, ...folioTextFieldSx }}
            />
            <TextField
              label="Email"
              value={data.email}
              onChange={(e) => handleChange({ email: e.target.value })}
              InputLabelProps={{ shrink: true }}
              sx={{ flex: 1, ...folioTextFieldSx }}
            />
          </Box>
        </FolioFieldFade>

        <FolioFieldFade visible={fieldsVisible} index={4}>
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

export default FriendNeighborModal;
