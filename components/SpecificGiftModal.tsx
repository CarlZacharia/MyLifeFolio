'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  Box,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { SpecificGiftItem } from '../lib/FormContext';

interface SpecificGiftModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: SpecificGiftItem) => void;
  onDelete?: () => void;
  initialData?: SpecificGiftItem;
  isEdit: boolean;
}

const getDefaultSpecificGiftData = (): SpecificGiftItem => ({
  recipientName: '',
  relationship: '',
  description: '',
  notes: '',
});

export const SpecificGiftModal: React.FC<SpecificGiftModalProps> = ({
  open,
  onClose,
  onSave,
  onDelete,
  initialData,
  isEdit,
}) => {
  const [formData, setFormData] = useState<SpecificGiftItem>(getDefaultSpecificGiftData());

  useEffect(() => {
    if (open) {
      setFormData(initialData || getDefaultSpecificGiftData());
    }
  }, [open, initialData]);

  const handleChange = (field: keyof SpecificGiftItem) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleSave = () => {
    onSave(formData);
  };

  const isValid = formData.recipientName.trim() !== '' && formData.description.trim() !== '';

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{isEdit ? 'Edit Specific Gift' : 'Add Specific Gift'}</DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 1 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Recipient Name"
                value={formData.recipientName}
                onChange={handleChange('recipientName')}
                variant="outlined"
                size="small"
                required
                placeholder="e.g., John Smith"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Relationship"
                value={formData.relationship}
                onChange={handleChange('relationship')}
                variant="outlined"
                size="small"
                placeholder="e.g., Nephew, Friend, Caregiver"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Item/Description"
                value={formData.description}
                onChange={handleChange('description')}
                variant="outlined"
                size="small"
                required
                multiline
                rows={2}
                placeholder="e.g., My grandmother's diamond ring, the antique grandfather clock in the living room"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notes"
                value={formData.notes}
                onChange={handleChange('notes')}
                variant="outlined"
                size="small"
                multiline
                rows={2}
                placeholder="Any additional notes about this gift..."
              />
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2, justifyContent: 'space-between' }}>
        <Box>
          {isEdit && onDelete && (
            <Button onClick={onDelete} color="error" startIcon={<DeleteIcon />}>
              Delete
            </Button>
          )}
        </Box>
        <Box>
          <Button onClick={onClose} sx={{ mr: 1 }}>
            Cancel
          </Button>
          <Button onClick={handleSave} variant="contained" disabled={!isValid}>
            {isEdit ? 'Save Changes' : 'Add Gift'}
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export default SpecificGiftModal;
