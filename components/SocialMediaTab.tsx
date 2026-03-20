'use client';

import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  IconButton,
  Typography,
  Paper,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import ShareIcon from '@mui/icons-material/Share';
import { useFormContext } from '../lib/FormContext';
import { folioColors } from './FolioModal';
import SocialMediaAccountModal, { SocialMediaAccountData } from './SocialMediaAccountModal';

const SocialMediaTab = () => {
  const { formData, updateFormData } = useFormContext();

  const [modalOpen, setModalOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);

  const openAdd = () => {
    setIsEdit(false);
    setEditIndex(null);
    setModalOpen(true);
  };

  const openEdit = (index: number) => {
    setIsEdit(true);
    setEditIndex(index);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setIsEdit(false);
    setEditIndex(null);
  };

  const handleSave = (data: SocialMediaAccountData) => {
    if (isEdit && editIndex !== null) {
      const updated = [...formData.socialMediaAccounts];
      updated[editIndex] = data;
      updateFormData({ socialMediaAccounts: updated });
    } else {
      updateFormData({ socialMediaAccounts: [...formData.socialMediaAccounts, data] });
    }
  };

  const handleDelete = () => {
    if (editIndex !== null) {
      updateFormData({
        socialMediaAccounts: formData.socialMediaAccounts.filter((_, i) => i !== editIndex),
      });
      closeModal();
    }
  };

  const getEditData = (): SocialMediaAccountData | undefined => {
    if (!isEdit || editIndex === null) return undefined;
    return formData.socialMediaAccounts[editIndex] as SocialMediaAccountData;
  };

  const sortedAccounts = formData.socialMediaAccounts
    .map((s, i) => ({ ...s, originalIndex: i }))
    .sort((a, b) => a.platform.localeCompare(b.platform) || a.usernameHandle.localeCompare(b.usernameHandle));

  const hasAny = formData.socialMediaAccounts.length > 0;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', mb: 2 }}>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openAdd} size="small"
          sx={{ bgcolor: '#00695c', '&:hover': { bgcolor: '#004d40' } }}>
          Add Account
        </Button>
      </Box>

      {hasAny ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {sortedAccounts.map((acct) => (
            <Card key={acct.originalIndex} variant="outlined" sx={{ '&:hover': { borderColor: '#00695c' }, transition: 'border-color 0.2s' }}>
              <CardContent sx={{ py: 1.5, px: 2, '&:last-child': { pb: 1.5 } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flex: 1, minWidth: 0 }}>
                    <ShareIcon sx={{ color: '#00695c', fontSize: 28 }} />
                    <Box sx={{ minWidth: 0 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600, lineHeight: 1.3 }}>
                          {acct.platform}
                        </Typography>
                        {acct.accountType && (
                          <Chip label={acct.accountType} size="small" variant="outlined" sx={{ height: 22 }} />
                        )}
                        {acct.hasMonetization && (
                          <Chip label="Monetized" size="small" sx={{ bgcolor: '#fff8e1', color: '#f57f17', fontWeight: 600, height: 22 }} />
                        )}
                      </Box>
                      <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.4 }}>
                        {[acct.accountType, acct.usernameHandle, acct.loginEmail].filter(Boolean).join(' · ')}
                      </Typography>
                      {acct.wishesAtDeath && acct.wishesAtDeath !== 'No preference' && (
                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                          {acct.wishesAtDeath}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                  <IconButton size="small" onClick={() => openEdit(acct.originalIndex)} sx={{ color: folioColors.inkLight }}>
                    <EditIcon fontSize="small" />
                  </IconButton>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      ) : (
        <Paper variant="outlined" sx={{ p: 4, textAlign: 'center' }}>
          <ShareIcon sx={{ fontSize: 48, color: folioColors.inkFaint, mb: 1 }} />
          <Typography color="text.secondary">
            No social media or email accounts recorded yet. Document your online presence so your family knows what accounts exist and what to do with them.
          </Typography>
        </Paper>
      )}

      <SocialMediaAccountModal
        open={modalOpen}
        onClose={closeModal}
        onSave={handleSave}
        onDelete={isEdit ? handleDelete : undefined}
        initialData={getEditData()}
        isEdit={isEdit}
      />
    </Box>
  );
};

export default SocialMediaTab;
