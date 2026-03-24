'use client';

import React, { useState } from 'react';
import {
  Box,
  Button,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useFormContext, MaritalStatus } from '../lib/FormContext';
import { folioColors } from './FolioModal';
import MedicalProviderModal, { MedicalProviderData, isFacilityCategory, getFacilityLabel } from './MedicalProviderModal';

const SHOW_SPOUSE_STATUSES: MaritalStatus[] = ['Married', 'Second Marriage', 'Domestic Partnership'];

const formatPhone = (phone: string): string => {
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  if (digits.length === 11 && digits[0] === '1') {
    return `(${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
  }
  return phone;
};

type ProviderCategory = MedicalProviderData['providerCategory'];

const MedicalProvidersTab = () => {
  const { formData, updateFormData } = useFormContext();
  const showSpouse = SHOW_SPOUSE_STATUSES.includes(formData.maritalStatus);

  const [personTab, setPersonTab] = useState(0); // 0 = Client, 1 = Spouse

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalCategory, setModalCategory] = useState<ProviderCategory>('clientPCP');
  const [isEdit, setIsEdit] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);

  const openAdd = (category: ProviderCategory) => {
    setModalCategory(category);
    setIsEdit(false);
    setEditIndex(null);
    setModalOpen(true);
  };

  const openEdit = (index: number) => {
    setIsEdit(true);
    setEditIndex(index);
    setModalCategory(formData.medicalProviders[index].providerCategory);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setIsEdit(false);
    setEditIndex(null);
  };

  const handleSave = (data: MedicalProviderData) => {
    if (isEdit && editIndex !== null) {
      const updated = [...formData.medicalProviders];
      updated[editIndex] = data;
      updateFormData({ medicalProviders: updated });
    } else {
      updateFormData({ medicalProviders: [...formData.medicalProviders, data] });
    }
  };

  const handleDelete = () => {
    if (editIndex !== null) {
      updateFormData({
        medicalProviders: formData.medicalProviders.filter((_, i) => i !== editIndex),
      });
      closeModal();
    }
  };

  const getEditData = (): MedicalProviderData | undefined => {
    if (!isEdit || editIndex === null) return undefined;
    return formData.medicalProviders[editIndex] as MedicalProviderData;
  };

  const getByCategory = (category: ProviderCategory) =>
    formData.medicalProviders
      .map((p, i) => ({ ...p, originalIndex: i }))
      .filter((p) => p.providerCategory === category);

  const isSpouseView = personTab === 1;
  const pcpCategory: ProviderCategory = isSpouseView ? 'spousePCP' : 'clientPCP';
  const specialistCategory: ProviderCategory = isSpouseView ? 'spouseSpecialist' : 'clientSpecialist';
  const hospitalCategory: ProviderCategory = isSpouseView ? 'spouseHospital' : 'clientHospital';
  const urgentCareCategory: ProviderCategory = isSpouseView ? 'spouseUrgentCare' : 'clientUrgentCare';
  const homeHealthCategory: ProviderCategory = isSpouseView ? 'spouseHomeHealth' : 'clientHomeHealth';
  const rehabCategory: ProviderCategory = isSpouseView ? 'spouseRehab' : 'clientRehab';
  const ptCategory: ProviderCategory = isSpouseView ? 'spousePhysicalTherapy' : 'clientPhysicalTherapy';
  const hospiceCategory: ProviderCategory = isSpouseView ? 'spouseHospice' : 'clientHospice';

  const pcps = getByCategory(pcpCategory);
  const specialists = getByCategory(specialistCategory);
  const hospitals = getByCategory(hospitalCategory);
  const urgentCare = getByCategory(urgentCareCategory);
  const homeHealth = getByCategory(homeHealthCategory);
  const rehab = getByCategory(rehabCategory);
  const physicalTherapy = getByCategory(ptCategory);
  const hospice = getByCategory(hospiceCategory);

  const facilitySections = [
    { label: 'Preferred Hospital', items: hospitals, category: hospitalCategory },
    { label: 'Preferred Urgent Care / ER', items: urgentCare, category: urgentCareCategory },
    { label: 'Preferred Home Health Agency', items: homeHealth, category: homeHealthCategory },
    { label: 'Preferred Rehabilitation Facility', items: rehab, category: rehabCategory },
    { label: 'Preferred Physical Therapy', items: physicalTherapy, category: ptCategory },
    { label: 'Preferred Hospice Provider', items: hospice, category: hospiceCategory },
  ];

  const hasEntries = pcps.length > 0 || specialists.length > 0 || facilitySections.some((s) => s.items.length > 0);

  return (
    <Box>
      {/* Client / Spouse tabs */}
      {showSpouse && (
        <Tabs
          value={personTab}
          onChange={(_, v) => setPersonTab(v)}
          sx={{
            mb: 2,
            '& .MuiTabs-indicator': { display: 'none' },
            '& .MuiTabs-flexContainer': { gap: 1 },
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '0.95rem',
              fontFamily: '"Jost", sans-serif',
              borderRadius: '8px',
              minHeight: 44,
              px: 3,
              border: `2px solid ${folioColors.parchment}`,
              bgcolor: folioColors.cream,
              color: folioColors.inkLight,
              transition: 'all 0.2s',
              '&.Mui-selected': { bgcolor: folioColors.ink, color: '#fff', border: `2px solid ${folioColors.ink}` },
              '&:not(.Mui-selected):hover': { bgcolor: folioColors.creamDark, borderColor: folioColors.inkFaint },
            },
          }}
        >
          <Tab label="Client" />
          <Tab label="Spouse" />
        </Tabs>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'flex-start', gap: 1, mb: 2, flexWrap: 'wrap' }}>
        <Button variant="outlined" startIcon={<AddIcon />} onClick={() => openAdd(pcpCategory)} size="small">
          PCP
        </Button>
        <Button variant="outlined" startIcon={<AddIcon />} onClick={() => openAdd(specialistCategory)} size="small">
          Specialist
        </Button>
        <Button variant="outlined" startIcon={<AddIcon />} onClick={() => openAdd(hospitalCategory)} size="small">
          Hospital
        </Button>
        <Button variant="outlined" startIcon={<AddIcon />} onClick={() => openAdd(urgentCareCategory)} size="small">
          Urgent Care
        </Button>
        <Button variant="outlined" startIcon={<AddIcon />} onClick={() => openAdd(homeHealthCategory)} size="small">
          Home Health
        </Button>
        <Button variant="outlined" startIcon={<AddIcon />} onClick={() => openAdd(rehabCategory)} size="small">
          Rehab
        </Button>
        <Button variant="outlined" startIcon={<AddIcon />} onClick={() => openAdd(ptCategory)} size="small">
          Physical Therapy
        </Button>
        <Button variant="outlined" startIcon={<AddIcon />} onClick={() => openAdd(hospiceCategory)} size="small">
          Hospice
        </Button>
      </Box>

      {hasEntries ? (
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: 'grey.100' }}>
                <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Firm/Practice</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Phone</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {pcps.length > 0 && (
                <>
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      sx={{
                        bgcolor: folioColors.ink,
                        color: 'white',
                        fontWeight: 700,
                        fontSize: '0.9rem',
                        py: 1,
                      }}
                    >
                      Primary Care Physician
                    </TableCell>
                  </TableRow>
                  {pcps.map((p) => (
                    <TableRow
                      key={p.originalIndex}
                      hover
                      onClick={() => openEdit(p.originalIndex)}
                      sx={{ cursor: 'pointer' }}
                    >
                      <TableCell>{p.name || '-'}</TableCell>
                      <TableCell>{p.firmName || '-'}</TableCell>
                      <TableCell>{p.phone ? formatPhone(p.phone) : '-'}</TableCell>
                      <TableCell>{p.email || '-'}</TableCell>
                    </TableRow>
                  ))}
                </>
              )}

              {specialists.length > 0 && (
                <>
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      sx={{
                        bgcolor: folioColors.ink,
                        color: 'white',
                        fontWeight: 700,
                        fontSize: '0.9rem',
                        py: 1,
                      }}
                    >
                      Specialists
                    </TableCell>
                  </TableRow>
                  {specialists.map((p) => (
                    <TableRow
                      key={p.originalIndex}
                      hover
                      onClick={() => openEdit(p.originalIndex)}
                      sx={{ cursor: 'pointer' }}
                    >
                      <TableCell>
                        {p.name || '-'}
                        {p.specialistType && (
                          <Typography component="span" sx={{ ml: 1, color: 'text.secondary', fontSize: '0.8rem' }}>
                            ({p.specialistType})
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>{p.firmName || '-'}</TableCell>
                      <TableCell>{p.phone ? formatPhone(p.phone) : '-'}</TableCell>
                      <TableCell>{p.email || '-'}</TableCell>
                    </TableRow>
                  ))}
                </>
              )}

              {facilitySections.map((section) =>
                section.items.length > 0 ? (
                  <React.Fragment key={section.category}>
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        sx={{
                          bgcolor: folioColors.ink,
                          color: 'white',
                          fontWeight: 700,
                          fontSize: '0.9rem',
                          py: 1,
                        }}
                      >
                        {section.label}
                      </TableCell>
                    </TableRow>
                    {section.items.map((p) => (
                      <TableRow
                        key={p.originalIndex}
                        hover
                        onClick={() => openEdit(p.originalIndex)}
                        sx={{ cursor: 'pointer' }}
                      >
                        <TableCell>{p.name || '-'}</TableCell>
                        <TableCell>{p.firmName || '-'}</TableCell>
                        <TableCell>{p.phone ? formatPhone(p.phone) : '-'}</TableCell>
                        <TableCell>{p.email || '-'}</TableCell>
                      </TableRow>
                    ))}
                  </React.Fragment>
                ) : null
              )}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Paper variant="outlined" sx={{ p: 4, textAlign: 'center' }}>
          <Typography color="text.secondary">
            No medical providers added yet. Use the buttons above to add a PCP or specialist.
          </Typography>
        </Paper>
      )}

      <MedicalProviderModal
        open={modalOpen}
        onClose={closeModal}
        onSave={handleSave}
        onDelete={isEdit ? handleDelete : undefined}
        initialData={getEditData()}
        isEdit={isEdit}
        providerCategory={modalCategory}
      />
    </Box>
  );
};

export default MedicalProvidersTab;
