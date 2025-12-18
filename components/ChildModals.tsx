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
  FormControl,
  FormLabel,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Radio,
  RadioGroup,
  Box,
  Typography,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

export type ChildMaritalStatus = 'Single' | 'Married' | 'Divorced' | 'Widowed' | '';

export interface ChildData {
  name: string;
  address: string;
  birthDate: string;
  relationship: string;
  maritalStatus: ChildMaritalStatus;
  hasChildren: boolean;
  numberOfChildren: number;
  hasMinorChildren: boolean;
  distributionType: 'Per Stirpes' | 'Per Capita' | '';
  disinherit: boolean;
  comments: string;
}

const CHILD_MARITAL_STATUS_OPTIONS: ChildMaritalStatus[] = ['Single', 'Married', 'Divorced', 'Widowed'];

const RELATIONSHIP_OPTIONS = [
  'Son of Client',
  'Daughter of Client',
  'Son of Spouse',
  'Daughter of Spouse',
  'Son of Both',
  'Daughter of Both',
];

interface ChildModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: ChildData) => void;
  onDelete?: () => void;
  initialData?: ChildData;
  isEdit: boolean;
  showSpouse: boolean;
}

const getDefaultChildData = (): ChildData => ({
  name: '',
  address: '',
  birthDate: '',
  relationship: '',
  maritalStatus: '',
  hasChildren: false,
  numberOfChildren: 0,
  hasMinorChildren: false,
  distributionType: '',
  disinherit: false,
  comments: '',
});

export const ChildModal: React.FC<ChildModalProps> = ({
  open,
  onClose,
  onSave,
  onDelete,
  initialData,
  isEdit,
  showSpouse,
}) => {
  const [formData, setFormData] = useState<ChildData>(getDefaultChildData());

  useEffect(() => {
    if (open) {
      setFormData(initialData || getDefaultChildData());
    }
  }, [open, initialData]);

  const handleChange = (field: keyof ChildData) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | { target: { value: string } }
  ) => {
    setFormData((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleCheckboxChange = (field: keyof ChildData) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [field]: event.target.checked }));
  };

  const handleSave = () => {
    onSave(formData);
    onClose();
  };

  // Filter relationship options based on whether spouse info is shown
  const relationshipOptions = showSpouse
    ? RELATIONSHIP_OPTIONS
    : RELATIONSHIP_OPTIONS.filter(opt => opt.includes('Client') && !opt.includes('Spouse') && !opt.includes('Both'));

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{isEdit ? 'Edit Child' : 'Add Child'}</DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 1 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={5}>
              <TextField
                fullWidth
                label="Legal Name"
                value={formData.name}
                onChange={handleChange('name')}
                variant="outlined"
                size="small"
                required
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth size="small">
                <InputLabel>Relationship</InputLabel>
                <Select
                  value={formData.relationship}
                  label="Relationship"
                  onChange={(e) => setFormData((prev) => ({ ...prev, relationship: e.target.value }))}
                >
                  {relationshipOptions.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.disinherit || false}
                    onChange={handleCheckboxChange('disinherit')}
                    sx={{ color: 'error.main', '&.Mui-checked': { color: 'error.main' } }}
                  />
                }
                label="Disinherit this child"
                sx={{ color: 'error.main' }}
              />
            </Grid>
            <Grid item xs={12} md={8}>
              <TextField
                fullWidth
                label="Address"
                value={formData.address}
                onChange={handleChange('address')}
                variant="outlined"
                size="small"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Date of Birth"
                value={formData.birthDate}
                onChange={handleChange('birthDate')}
                variant="outlined"
                size="small"
                type="date"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth size="small">
                <InputLabel>Marital Status</InputLabel>
                <Select
                  value={formData.maritalStatus}
                  label="Marital Status"
                  onChange={(e) => setFormData((prev) => ({ ...prev, maritalStatus: e.target.value as ChildMaritalStatus }))}
                >
                  {CHILD_MARITAL_STATUS_OPTIONS.map((status) => (
                    <MenuItem key={status} value={status}>
                      {status}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box sx={{ display: 'flex', alignItems: 'center', height: '40px' }}>
                <Typography variant="body2" sx={{ mr: 2 }}>
                  Has Children?
                </Typography>
                <RadioGroup
                  row
                  value={formData.hasChildren ? 'yes' : 'no'}
                  onChange={(e) => setFormData((prev) => ({ ...prev, hasChildren: e.target.value === 'yes' }))}
                  sx={{ flexWrap: 'nowrap' }}
                >
                  <FormControlLabel value="yes" control={<Radio size="small" />} label="Yes" sx={{ mr: 1 }} />
                  <FormControlLabel value="no" control={<Radio size="small" />} label="No" />
                </RadioGroup>
              </Box>
            </Grid>
            {formData.hasChildren && (
              <>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="No. Children"
                    type="number"
                    value={formData.numberOfChildren || ''}
                    onChange={(e) => setFormData((prev) => ({ ...prev, numberOfChildren: parseInt(e.target.value) || 0 }))}
                    variant="outlined"
                    size="small"
                    inputProps={{ min: 0 }}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <Box sx={{ display: 'flex', alignItems: 'center', height: '40px' }}>
                    <Typography variant="body2" sx={{ mr: 2 }}>
                      Are any minors?
                    </Typography>
                    <RadioGroup
                      row
                      value={formData.hasMinorChildren ? 'yes' : 'no'}
                      onChange={(e) => setFormData((prev) => ({ ...prev, hasMinorChildren: e.target.value === 'yes' }))}
                      sx={{ flexWrap: 'nowrap' }}
                    >
                      <FormControlLabel value="yes" control={<Radio size="small" />} label="Yes" sx={{ mr: 1 }} />
                      <FormControlLabel value="no" control={<Radio size="small" />} label="No" />
                    </RadioGroup>
                  </Box>
                </Grid>
                <Grid item xs={12} md={8}>
                  <Box sx={{ display: 'flex', alignItems: 'center', height: '40px' }}>
                    <Typography variant="body2" sx={{ mr: 2 }}>
                      Distribution Type
                    </Typography>
                    <RadioGroup
                      row
                      value={formData.distributionType}
                      onChange={(e) => setFormData((prev) => ({ ...prev, distributionType: e.target.value as ChildData['distributionType'] }))}
                      sx={{ flexWrap: 'nowrap' }}
                    >
                      <FormControlLabel value="Per Stirpes" control={<Radio size="small" />} label="Per Stirpes" sx={{ mr: 1 }} />
                      <FormControlLabel value="Per Capita" control={<Radio size="small" />} label="Per Capita" />
                    </RadioGroup>
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    Per Stirpes: Share passes to descendants. Per Capita: Share divided among survivors only.
                  </Typography>
                </Grid>
              </>
            )}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Comments"
                value={formData.comments || ''}
                onChange={handleChange('comments')}
                variant="outlined"
                size="small"
                multiline
                rows={3}
                placeholder="Any additional notes about this child"
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
          <Button onClick={handleSave} variant="contained" disabled={!formData.name}>
            {isEdit ? 'Save Changes' : 'Add Child'}
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export default ChildModal;
