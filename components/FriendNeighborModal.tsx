'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import PeopleIcon from '@mui/icons-material/People';

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
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontWeight: 600,
          bgcolor: '#6a1b9a',
          color: 'white',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <PeopleIcon />
          {isEdit ? 'Edit Friend or Neighbor' : 'Add Friend or Neighbor'}
        </Box>
        <IconButton onClick={onClose} size="small" sx={{ color: 'white' }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
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
          />

          <TextField
            label="Relationship"
            value={data.relationship}
            onChange={(e) => handleChange({ relationship: e.target.value })}
            InputLabelProps={{ shrink: true }}
            fullWidth
          />

          <TextField
            label="Address"
            value={data.address}
            onChange={(e) => handleChange({ address: e.target.value })}
            InputLabelProps={{ shrink: true }}
            fullWidth
          />

          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              label="Phone"
              value={data.phone}
              onChange={(e) => handleChange({ phone: e.target.value })}
              InputLabelProps={{ shrink: true }}
              sx={{ flex: 1 }}
            />
            <TextField
              label="Email"
              value={data.email}
              onChange={(e) => handleChange({ email: e.target.value })}
              InputLabelProps={{ shrink: true }}
              sx={{ flex: 1 }}
            />
          </Box>

          <TextField
            label="Notes"
            value={data.notes}
            onChange={(e) => handleChange({ notes: e.target.value })}
            InputLabelProps={{ shrink: true }}
            multiline
            minRows={2}
            fullWidth
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        {isEdit && onDelete && (
          <Button onClick={onDelete} color="error" sx={{ mr: 'auto' }}>
            Delete
          </Button>
        )}
        <Button onClick={onClose} variant="outlined">Cancel</Button>
        <Button onClick={handleSave} variant="contained" disabled={!canSave}>
          {isEdit ? 'Save Changes' : 'Add Contact'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default FriendNeighborModal;
