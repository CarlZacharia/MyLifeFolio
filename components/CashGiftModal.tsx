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
import { CashGift } from '../lib/FormContext';

interface CashGiftModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: CashGift) => void;
  onDelete?: () => void;
  initialData?: CashGift;
  isEdit: boolean;
}

const getDefaultCashGiftData = (): CashGift => ({
  recipientName: '',
  relationship: '',
  amount: '',
  notes: '',
});

export const CashGiftModal: React.FC<CashGiftModalProps> = ({
  open,
  onClose,
  onSave,
  onDelete,
  initialData,
  isEdit,
}) => {
  const [formData, setFormData] = useState<CashGift>(getDefaultCashGiftData());

  useEffect(() => {
    if (open) {
      setFormData(initialData || getDefaultCashGiftData());
    }
  }, [open, initialData]);

  const handleChange = (field: keyof CashGift) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleSave = () => {
    onSave(formData);
  };

  const isValid = formData.recipientName.trim() !== '' && formData.amount.trim() !== '';

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{isEdit ? 'Edit Cash Gift' : 'Add Cash Gift'}</DialogTitle>
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
                placeholder="e.g., Friend, Niece, Caregiver"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Amount"
                value={formData.amount}
                onChange={handleChange('amount')}
                variant="outlined"
                size="small"
                required
                helperText="e.g., $10,000 or 'My diamond ring'"
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

export default CashGiftModal;
