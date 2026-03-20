'use client';

import React, { useState } from 'react';
import {
  Box, Button, Card, CardContent, Chip, IconButton, Typography, Paper,
  TextField, FormControlLabel, Checkbox, Divider,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import VolunteerActivismIcon from '@mui/icons-material/VolunteerActivism';
import { useFormContext } from '../lib/FormContext';
import { folioColors } from './FolioModal';
import LegacyCharityModal, { CharityOrgData } from './LegacyCharityModal';

const tfSx = {
  '& .MuiOutlinedInput-root': {
    '&:hover fieldset': { borderColor: folioColors.accentWarm },
    '&.Mui-focused fieldset': { borderColor: folioColors.accent },
  },
  '& .MuiInputLabel-root.Mui-focused': { color: folioColors.accent },
};

const LegacyCharitableWishesTab = () => {
  const { formData, updateFormData } = useFormContext();
  const orgs = formData.legacyCharityOrganizations;
  const prefs = formData.legacyCharityPreferences;

  const [modalOpen, setModalOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);

  const openAdd = () => { setIsEdit(false); setEditIndex(null); setModalOpen(true); };
  const openEdit = (i: number) => { setIsEdit(true); setEditIndex(i); setModalOpen(true); };
  const closeModal = () => { setModalOpen(false); setIsEdit(false); setEditIndex(null); };

  const handleSave = (data: CharityOrgData) => {
    if (isEdit && editIndex !== null) {
      const updated = [...orgs]; updated[editIndex] = data;
      updateFormData({ legacyCharityOrganizations: updated });
    } else {
      updateFormData({ legacyCharityOrganizations: [...orgs, data] });
    }
  };

  const handleDelete = () => {
    if (editIndex !== null) {
      updateFormData({ legacyCharityOrganizations: orgs.filter((_, i) => i !== editIndex) });
      closeModal();
    }
  };

  const handlePrefChange = (field: string, value: string | boolean) => {
    updateFormData({ legacyCharityPreferences: { ...prefs, [field]: value } });
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
        <VolunteerActivismIcon sx={{ color: '#c9a227', fontSize: 28 }} />
        <Typography variant="h6" sx={{ fontWeight: 600 }}>Charitable & Legacy Wishes</Typography>
      </Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Organizations and causes that matter to you, and how you'd like to be remembered through giving.
      </Typography>

      {/* Organizations */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Organizations</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openAdd} size="small"
          sx={{ bgcolor: folioColors.ink, '&:hover': { bgcolor: '#3d3224' } }}>
          Add Organization
        </Button>
      </Box>

      {orgs.length > 0 ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 3 }}>
          {orgs.map((org, i) => (
            <Card key={i} variant="outlined" sx={{ '&:hover': { borderColor: folioColors.accentWarm }, transition: 'border-color 0.2s' }}>
              <CardContent sx={{ py: 1.5, px: 2, '&:last-child': { pb: 1.5 } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flex: 1, minWidth: 0 }}>
                    <VolunteerActivismIcon sx={{ color: folioColors.accent, fontSize: 24 }} />
                    <Box sx={{ minWidth: 0 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, lineHeight: 1.3 }}>
                        {org.organizationName}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {[org.website, org.notes].filter(Boolean).join(' · ')}
                      </Typography>
                    </Box>
                  </Box>
                  <IconButton size="small" onClick={() => openEdit(i)} sx={{ color: folioColors.inkLight }}>
                    <EditIcon fontSize="small" />
                  </IconButton>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      ) : (
        <Paper variant="outlined" sx={{ p: 3, textAlign: 'center', mb: 3 }}>
          <Typography color="text.secondary">No organizations added yet.</Typography>
        </Paper>
      )}

      {/* Preferences */}
      <Divider sx={{ my: 2 }} />
      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>Preferences</Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, maxWidth: 700 }}>
        <FormControlLabel
          control={<Checkbox checked={prefs.donationsInLieuOfFlowers}
            onChange={(e) => handlePrefChange('donationsInLieuOfFlowers', e.target.checked)} />}
          label="Donations in lieu of flowers"
        />
        <TextField label="Scholarship Fund" value={prefs.scholarshipFund}
          onChange={(e) => handlePrefChange('scholarshipFund', e.target.value)}
          InputLabelProps={{ shrink: true }} placeholder="Any scholarship you want established or supported"
          multiline minRows={2} fullWidth sx={tfSx} />
        <TextField label="Religious Donations" value={prefs.religiousDonations}
          onChange={(e) => handlePrefChange('religiousDonations', e.target.value)}
          InputLabelProps={{ shrink: true }} fullWidth sx={tfSx} />
        <TextField label="Legacy Giving Notes" value={prefs.legacyGivingNotes}
          onChange={(e) => handlePrefChange('legacyGivingNotes', e.target.value)}
          InputLabelProps={{ shrink: true }}
          placeholder="Donor-advised funds, private foundation, community foundation details"
          multiline minRows={2} fullWidth sx={tfSx} />
        <Box>
          <Typography variant="body1" sx={{ fontStyle: 'italic', color: folioColors.ink, mb: 1, fontWeight: 500 }}>
            "Why do these causes matter to you?"
          </Typography>
          <TextField value={prefs.whyTheseCauses}
            onChange={(e) => handlePrefChange('whyTheseCauses', e.target.value)}
            multiline minRows={3} fullWidth placeholder="Share your reasons..."
            sx={tfSx} />
        </Box>
      </Box>

      <LegacyCharityModal open={modalOpen} onClose={closeModal} onSave={handleSave}
        onDelete={isEdit ? handleDelete : undefined}
        initialData={isEdit && editIndex !== null ? orgs[editIndex] as CharityOrgData : undefined}
        isEdit={isEdit} />
    </Box>
  );
};

export default LegacyCharitableWishesTab;
