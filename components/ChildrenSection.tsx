'use client';

import React from 'react';
import {
  Box,
  TextField,
  Typography,
  Grid,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Button,
  IconButton,
  Paper,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { useFormContext } from '../lib/FormContext';

const ChildrenSection = () => {
  const { formData, updateFormData } = useFormContext();

  const handleRadioChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    updateFormData({ [field]: event.target.value === 'yes' });
  };

  const handleChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    updateFormData({ [field]: event.target.value });
  };

  const addChild = () => {
    const newChildren = [
      ...formData.children,
      { name: '', address: '', birthDate: '', relationship: '' },
    ];
    updateFormData({ children: newChildren });
  };

  const removeChild = (index: number) => {
    const newChildren = formData.children.filter((_, i) => i !== index);
    updateFormData({ children: newChildren });
  };

  const updateChild = (index: number, field: string, value: string) => {
    const newChildren = [...formData.children];
    newChildren[index] = { ...newChildren[index], [field]: value };
    updateFormData({ children: newChildren });
  };

  const addGrandchild = () => {
    const newGrandchildren = [
      ...formData.grandchildren,
      { name: '', address: '', age: '' },
    ];
    updateFormData({ grandchildren: newGrandchildren });
  };

  const removeGrandchild = (index: number) => {
    const newGrandchildren = formData.grandchildren.filter((_, i) => i !== index);
    updateFormData({ grandchildren: newGrandchildren });
  };

  const updateGrandchild = (index: number, field: string, value: string) => {
    const newGrandchildren = [...formData.grandchildren];
    newGrandchildren[index] = { ...newGrandchildren[index], [field]: value };
    updateFormData({ grandchildren: newGrandchildren });
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, color: '#1a237e', mb: 3 }}>
        CHILDREN
      </Typography>

      {/* Children List */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 500 }}>
            Children (if applicable)
          </Typography>
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={addChild}
          >
            Add Child
          </Button>
        </Box>

        {formData.children.map((child, index) => (
          <Paper key={index} sx={{ p: 2, mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="subtitle2">Child #{index + 1}</Typography>
              <IconButton size="small" onClick={() => removeChild(index)} color="error">
                <DeleteIcon />
              </IconButton>
            </Box>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Legal Name"
                  value={child.name}
                  onChange={(e) => updateChild(index, 'name', e.target.value)}
                  variant="outlined"
                  size="small"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Relationship"
                  value={child.relationship}
                  onChange={(e) => updateChild(index, 'relationship', e.target.value)}
                  variant="outlined"
                  size="small"
                  helperText="son/daughter"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Address"
                  value={child.address}
                  onChange={(e) => updateChild(index, 'address', e.target.value)}
                  variant="outlined"
                  size="small"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Date of Birth"
                  value={child.birthDate}
                  onChange={(e) => updateChild(index, 'birthDate', e.target.value)}
                  variant="outlined"
                  size="small"
                  type="date"
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            </Grid>
          </Paper>
        ))}
      </Box>

      {/* Children Health Questions */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <FormControl component="fieldset">
            <FormLabel component="legend">Are all of your children in good health?</FormLabel>
            <RadioGroup
              row
              value={formData.allChildrenHealthy ? 'yes' : 'no'}
              onChange={handleRadioChange('allChildrenHealthy')}
            >
              <FormControlLabel value="yes" control={<Radio />} label="Yes" />
              <FormControlLabel value="no" control={<Radio />} label="No" />
            </RadioGroup>
          </FormControl>
        </Grid>

        {!formData.allChildrenHealthy && (
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Please explain"
              value={formData.childrenHealthExplanation}
              onChange={handleChange('childrenHealthExplanation')}
              variant="outlined"
              multiline
              rows={2}
            />
          </Grid>
        )}

        <Grid item xs={12} md={6}>
          <FormControl component="fieldset">
            <FormLabel component="legend">Are any of your children blind?</FormLabel>
            <RadioGroup
              row
              value={formData.anyChildrenBlind ? 'yes' : 'no'}
              onChange={handleRadioChange('anyChildrenBlind')}
            >
              <FormControlLabel value="yes" control={<Radio />} label="Yes" />
              <FormControlLabel value="no" control={<Radio />} label="No" />
            </RadioGroup>
          </FormControl>
        </Grid>

        <Grid item xs={12} md={6}>
          <FormControl component="fieldset">
            <FormLabel component="legend">Are any of your children disabled?</FormLabel>
            <RadioGroup
              row
              value={formData.anyChildrenDisabled ? 'yes' : 'no'}
              onChange={handleRadioChange('anyChildrenDisabled')}
            >
              <FormControlLabel value="yes" control={<Radio />} label="Yes" />
              <FormControlLabel value="no" control={<Radio />} label="No" />
            </RadioGroup>
          </FormControl>
        </Grid>

        <Grid item xs={12} md={6}>
          <FormControl component="fieldset">
            <FormLabel component="legend">Have all of your children completed their education?</FormLabel>
            <RadioGroup
              row
              value={formData.allChildrenEducated ? 'yes' : 'no'}
              onChange={handleRadioChange('allChildrenEducated')}
            >
              <FormControlLabel value="yes" control={<Radio />} label="Yes" />
              <FormControlLabel value="no" control={<Radio />} label="No" />
            </RadioGroup>
          </FormControl>
        </Grid>

        <Grid item xs={12} md={6}>
          <FormControl component="fieldset">
            <FormLabel component="legend">
              Are any of your children receiving SSI or other government entitlement?
            </FormLabel>
            <RadioGroup
              row
              value={formData.anyChildrenReceivingSSI ? 'yes' : 'no'}
              onChange={handleRadioChange('anyChildrenReceivingSSI')}
            >
              <FormControlLabel value="yes" control={<Radio />} label="Yes" />
              <FormControlLabel value="no" control={<Radio />} label="No" />
            </RadioGroup>
          </FormControl>
        </Grid>

        <Grid item xs={12} md={4}>
          <FormControl component="fieldset">
            <FormLabel component="legend">Drug Addiction?</FormLabel>
            <RadioGroup
              row
              value={formData.drugAddiction ? 'yes' : 'no'}
              onChange={handleRadioChange('drugAddiction')}
            >
              <FormControlLabel value="yes" control={<Radio />} label="Yes" />
              <FormControlLabel value="no" control={<Radio />} label="No" />
            </RadioGroup>
          </FormControl>
        </Grid>

        <Grid item xs={12} md={4}>
          <FormControl component="fieldset">
            <FormLabel component="legend">Alcoholism?</FormLabel>
            <RadioGroup
              row
              value={formData.alcoholism ? 'yes' : 'no'}
              onChange={handleRadioChange('alcoholism')}
            >
              <FormControlLabel value="yes" control={<Radio />} label="Yes" />
              <FormControlLabel value="no" control={<Radio />} label="No" />
            </RadioGroup>
          </FormControl>
        </Grid>

        <Grid item xs={12} md={4}>
          <FormControl component="fieldset">
            <FormLabel component="legend">Spendthrift?</FormLabel>
            <RadioGroup
              row
              value={formData.spendthrift ? 'yes' : 'no'}
              onChange={handleRadioChange('spendthrift')}
            >
              <FormControlLabel value="yes" control={<Radio />} label="Yes" />
              <FormControlLabel value="no" control={<Radio />} label="No" />
            </RadioGroup>
          </FormControl>
        </Grid>
      </Grid>

      {/* Grandchildren List */}
      <Box sx={{ mt: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 500 }}>
            Grandchildren (if applicable)
          </Typography>
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={addGrandchild}
          >
            Add Grandchild
          </Button>
        </Box>

        {formData.grandchildren.map((grandchild, index) => (
          <Paper key={index} sx={{ p: 2, mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="subtitle2">Grandchild #{index + 1}</Typography>
              <IconButton size="small" onClick={() => removeGrandchild(index)} color="error">
                <DeleteIcon />
              </IconButton>
            </Box>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Name"
                  value={grandchild.name}
                  onChange={(e) => updateGrandchild(index, 'name', e.target.value)}
                  variant="outlined"
                  size="small"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Address"
                  value={grandchild.address}
                  onChange={(e) => updateGrandchild(index, 'address', e.target.value)}
                  variant="outlined"
                  size="small"
                />
              </Grid>
              <Grid item xs={12} md={2}>
                <TextField
                  fullWidth
                  label="Age"
                  value={grandchild.age}
                  onChange={(e) => updateGrandchild(index, 'age', e.target.value)}
                  variant="outlined"
                  size="small"
                  type="number"
                />
              </Grid>
            </Grid>
          </Paper>
        ))}
      </Box>
    </Box>
  );
};

export default ChildrenSection;
