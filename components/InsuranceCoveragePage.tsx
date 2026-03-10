'use client';

import React, { useState, useMemo } from 'react';
import {
  Box,
  Button,
  Tabs,
  Tab,
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
import MedicalInsuranceModal, { MedicalInsurancePolicyData } from './MedicalInsuranceModal';
import InsurancePolicyModal, { InsurancePolicyData } from './InsurancePolicyModal';
import {
  LifeInsuranceModal,
  LifeInsuranceData,
  BeneficiaryOption,
  TrustFlags,
} from './AssetModals';
import FolioHelpModal, { FolioHelpButton, useFolioHelp } from './FolioHelpModal';
import { insuranceCoverageHelp } from './folioHelpContent';

const SHOW_SPOUSE_STATUSES: MaritalStatus[] = ['Married', 'Second Marriage', 'Domestic Partnership'];

const SECTION_TYPES = [
  'Medical',
  'Vehicle',
  'Homeowners',
  'Long-Term Care',
  'Disability',
  'Life',
  'Umbrella',
  'Other',
] as const;

const formatCurrency = (value: string): string => {
  if (!value) return '-';
  const cleaned = value.replace(/[$,\s]/g, '');
  const num = parseFloat(cleaned);
  if (isNaN(num)) return value;
  return `$${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const isClientOwner = (owner: string) =>
  owner === 'Client' || owner.startsWith("Client's");

const isSpouseOwner = (owner: string) =>
  owner === 'Spouse' || owner.startsWith("Spouse's");

const InsuranceCoveragePage = () => {
  const { formData, updateFormData } = useFormContext();
  const { showHelp, openHelp, closeHelp } = useFolioHelp();
  const showSpouse = SHOW_SPOUSE_STATUSES.includes(formData.maritalStatus);

  const [personTab, setPersonTab] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalCoverageType, setModalCoverageType] = useState<string>('');
  const [isEdit, setIsEdit] = useState(false);
  const [editSource, setEditSource] = useState<'medical' | 'general' | 'life' | null>(null);
  const [editIndex, setEditIndex] = useState<number | null>(null);

  const currentPerson: 'client' | 'spouse' = personTab === 1 ? 'spouse' : 'client';

  // Build trust flags and beneficiary options for LifeInsuranceModal
  const trustFlags: TrustFlags = useMemo(() => ({
    clientHasLivingTrust: formData.clientHasLivingTrust,
    clientHasIrrevocableTrust: formData.clientHasIrrevocableTrust,
    spouseHasLivingTrust: formData.spouseHasLivingTrust,
    spouseHasIrrevocableTrust: formData.spouseHasIrrevocableTrust,
  }), [
    formData.clientHasLivingTrust,
    formData.clientHasIrrevocableTrust,
    formData.spouseHasLivingTrust,
    formData.spouseHasIrrevocableTrust,
  ]);

  const beneficiaryOptions = useMemo((): BeneficiaryOption[] => {
    const options: BeneficiaryOption[] = [];
    if (showSpouse && formData.spouseName) {
      options.push({ value: `spouse:${formData.spouseName}`, label: `${formData.spouseName} (Spouse)` });
    }
    if (formData.name) {
      options.push({ value: `client:${formData.name}`, label: `${formData.name} (Client)` });
    }
    formData.children.forEach((child, index) => {
      if (child.name) {
        options.push({ value: `child:${index}:${child.name}`, label: `${child.name} (Child)` });
      }
    });
    formData.otherBeneficiaries.forEach((beneficiary, index) => {
      if (beneficiary.name) {
        const label = beneficiary.relationship === 'Grandchild'
          ? `${beneficiary.name} (Grandchild)`
          : `${beneficiary.name} (${beneficiary.relationship || 'Other'})`;
        options.push({ value: `beneficiary:${index}:${beneficiary.name}`, label });
      }
    });
    if (formData.clientHasLivingTrust) {
      const trustName = formData.clientLivingTrustName || "Client's Living Trust";
      options.push({ value: `trust:client-living:${trustName}`, label: `${trustName} (Living Trust)` });
    }
    if (formData.clientHasIrrevocableTrust) {
      const trustName = formData.clientIrrevocableTrustName || "Client's Irrevocable Trust";
      options.push({ value: `trust:client-irrevocable:${trustName}`, label: `${trustName} (Irrevocable Trust)` });
    }
    if (showSpouse && formData.spouseHasLivingTrust) {
      const trustName = formData.spouseLivingTrustName || "Spouse's Living Trust";
      options.push({ value: `trust:spouse-living:${trustName}`, label: `${trustName} (Living Trust)` });
    }
    if (showSpouse && formData.spouseHasIrrevocableTrust) {
      const trustName = formData.spouseIrrevocableTrustName || "Spouse's Irrevocable Trust";
      options.push({ value: `trust:spouse-irrevocable:${trustName}`, label: `${trustName} (Irrevocable Trust)` });
    }
    return options;
  }, [
    showSpouse,
    formData.spouseName,
    formData.name,
    formData.children,
    formData.otherBeneficiaries,
    formData.clientHasLivingTrust,
    formData.clientLivingTrustName,
    formData.clientHasIrrevocableTrust,
    formData.clientIrrevocableTrustName,
    formData.spouseHasLivingTrust,
    formData.spouseLivingTrustName,
    formData.spouseHasIrrevocableTrust,
    formData.spouseIrrevocableTrustName,
  ]);

  // Medical insurance policies
  const medicalPolicies = formData.medicalInsurancePolicies
    .map((p, i) => ({ ...p, originalIndex: i }))
    .filter((p) => p.person === currentPerson);

  // General insurance policies (non-life, non-medical)
  const generalPolicies = formData.insurancePolicies
    .map((p, i) => ({ ...p, originalIndex: i }))
    .filter((p) => p.person === currentPerson);

  // Life insurance policies (from formData.lifeInsurance, shared with Financial Life)
  const lifePolicies = formData.lifeInsurance
    .map((p, i) => ({ ...p, originalIndex: i }))
    .filter((p) =>
      currentPerson === 'client' ? isClientOwner(p.owner) : isSpouseOwner(p.owner)
    );

  const openAdd = (coverageType: string) => {
    setModalCoverageType(coverageType);
    setIsEdit(false);
    setEditIndex(null);
    if (coverageType === 'Medical') {
      setEditSource('medical');
    } else if (coverageType === 'Life') {
      setEditSource('life');
    } else {
      setEditSource('general');
    }
    setModalOpen(true);
  };

  const openEditMedical = (originalIndex: number) => {
    setIsEdit(true);
    setEditIndex(originalIndex);
    setEditSource('medical');
    setModalCoverageType('Medical');
    setModalOpen(true);
  };

  const openEditGeneral = (originalIndex: number) => {
    const policy = formData.insurancePolicies[originalIndex];
    setIsEdit(true);
    setEditIndex(originalIndex);
    setEditSource('general');
    setModalCoverageType(policy.coverageType);
    setModalOpen(true);
  };

  const openEditLife = (originalIndex: number) => {
    setIsEdit(true);
    setEditIndex(originalIndex);
    setEditSource('life');
    setModalCoverageType('Life');
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setIsEdit(false);
    setEditIndex(null);
    setEditSource(null);
  };

  // Save handler for medical insurance
  const handleSaveMedical = (data: MedicalInsurancePolicyData) => {
    if (isEdit && editIndex !== null) {
      const updated = [...formData.medicalInsurancePolicies];
      updated[editIndex] = data;
      updateFormData({ medicalInsurancePolicies: updated });
    } else {
      updateFormData({
        medicalInsurancePolicies: [...formData.medicalInsurancePolicies, data],
      });
    }
  };

  // Save handler for general insurance (non-life, non-medical)
  const handleSaveGeneral = (data: InsurancePolicyData) => {
    if (isEdit && editIndex !== null) {
      const updated = [...formData.insurancePolicies];
      updated[editIndex] = data;
      updateFormData({ insurancePolicies: updated });
    } else {
      updateFormData({
        insurancePolicies: [...formData.insurancePolicies, data],
      });
    }
  };

  // Save handler for life insurance (shared with Financial Life section)
  const handleSaveLife = (data: LifeInsuranceData) => {
    if (isEdit && editIndex !== null) {
      const updated = [...formData.lifeInsurance];
      updated[editIndex] = data;
      updateFormData({ lifeInsurance: updated });
    } else {
      updateFormData({
        lifeInsurance: [...formData.lifeInsurance, data],
      });
    }
  };

  const handleDelete = () => {
    if (editIndex !== null) {
      if (editSource === 'medical') {
        updateFormData({
          medicalInsurancePolicies: formData.medicalInsurancePolicies.filter((_, i) => i !== editIndex),
        });
      } else if (editSource === 'life') {
        updateFormData({
          lifeInsurance: formData.lifeInsurance.filter((_, i) => i !== editIndex),
        });
      } else {
        updateFormData({
          insurancePolicies: formData.insurancePolicies.filter((_, i) => i !== editIndex),
        });
      }
      closeModal();
    }
  };

  const getMedicalEditData = (): MedicalInsurancePolicyData | undefined => {
    if (!isEdit || editIndex === null || editSource !== 'medical') return undefined;
    return formData.medicalInsurancePolicies[editIndex] as MedicalInsurancePolicyData;
  };

  const getGeneralEditData = (): InsurancePolicyData | undefined => {
    if (!isEdit || editIndex === null || editSource !== 'general') return undefined;
    return formData.insurancePolicies[editIndex];
  };

  const getLifeEditData = (): LifeInsuranceData | undefined => {
    if (!isEdit || editIndex === null || editSource !== 'life') return undefined;
    return formData.lifeInsurance[editIndex] as LifeInsuranceData;
  };

  // Build table rows for each section type
  const getPoliciesForType = (type: string) => {
    if (type === 'Medical') {
      return medicalPolicies.map((p) => ({
        provider: p.provider || p.insuranceType || '-',
        policyNo: p.policyNo || '-',
        cost: p.monthlyCost,
        costLabel: 'Monthly',
        originalIndex: p.originalIndex,
        source: 'medical' as const,
      }));
    }
    if (type === 'Life') {
      return lifePolicies.map((p) => ({
        provider: p.company || '-',
        policyNo: p.policyType || '-',
        cost: p.deathBenefit,
        costLabel: 'Death Benefit',
        originalIndex: p.originalIndex,
        source: 'life' as const,
      }));
    }
    return generalPolicies
      .filter((p) => p.coverageType === type)
      .map((p) => ({
        provider: p.provider || '-',
        policyNo: p.policyNo || '-',
        cost: p.annualCost,
        costLabel: 'Annual',
        originalIndex: p.originalIndex,
        source: 'general' as const,
      }));
  };

  const hasAnyPolicies = SECTION_TYPES.some((type) => getPoliciesForType(type).length > 0);
  const isMedicalModal = editSource === 'medical';
  const isLifeModal = editSource === 'life';
  const isGeneralModal = editSource === 'general';

  return (
    <Box>
      <FolioHelpModal open={showHelp} onClose={closeHelp} content={insuranceCoverageHelp} />
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
        <FolioHelpButton onClick={openHelp} accentColor="#0d47a1" />
      </Box>
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
              border: '2px solid #e8ddd0',
              bgcolor: '#f9f5ef',
              color: '#6b5c47',
              transition: 'all 0.2s',
              '&.Mui-selected': { bgcolor: '#2c2416', color: '#fff', border: '2px solid #2c2416' },
              '&:not(.Mui-selected):hover': { bgcolor: '#f0e9dc', borderColor: '#a8977f' },
            },
          }}
        >
          <Tab label="Client" />
          <Tab label="Spouse" />
        </Tabs>
      )}

      {/* Add buttons row */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
        {SECTION_TYPES.map((type) => (
          <Button
            key={type}
            variant="outlined"
            size="small"
            startIcon={<AddIcon />}
            onClick={() => openAdd(type)}
          >
            {type}
          </Button>
        ))}
      </Box>

      {hasAnyPolicies ? (
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: 'grey.100' }}>
                <TableCell sx={{ fontWeight: 600 }}>Provider / Company</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Policy No. / Type</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Cost / Benefit</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {SECTION_TYPES.map((type) => {
                const policies = getPoliciesForType(type);
                if (policies.length === 0) return null;
                return (
                  <React.Fragment key={type}>
                    {/* Separator row */}
                    <TableRow>
                      <TableCell
                        colSpan={3}
                        sx={{
                          bgcolor: 'primary.main',
                          color: 'white',
                          fontWeight: 700,
                          fontSize: '0.85rem',
                          py: 0.75,
                          letterSpacing: '0.03em',
                        }}
                      >
                        {type} Insurance
                      </TableCell>
                    </TableRow>
                    {/* Policy rows */}
                    {policies.map((policy) => (
                      <TableRow
                        key={`${policy.source}-${policy.originalIndex}`}
                        hover
                        onClick={() => {
                          if (policy.source === 'medical') openEditMedical(policy.originalIndex);
                          else if (policy.source === 'life') openEditLife(policy.originalIndex);
                          else openEditGeneral(policy.originalIndex);
                        }}
                        sx={{ cursor: 'pointer' }}
                      >
                        <TableCell>{policy.provider}</TableCell>
                        <TableCell>{policy.policyNo}</TableCell>
                        <TableCell>
                          {formatCurrency(policy.cost)}
                          {policy.cost && (
                            <Typography component="span" variant="caption" color="text.secondary">
                              {' '}/{policy.costLabel === 'Monthly' ? 'mo' : policy.costLabel === 'Annual' ? 'yr' : 'benefit'}
                            </Typography>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </React.Fragment>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Paper variant="outlined" sx={{ p: 4, textAlign: 'center' }}>
          <Typography color="text.secondary">
            No insurance policies added yet. Use the buttons above to add coverage.
          </Typography>
        </Paper>
      )}

      {/* Medical insurance modal */}
      <MedicalInsuranceModal
        open={modalOpen && isMedicalModal}
        onClose={closeModal}
        onSave={handleSaveMedical}
        onDelete={isEdit ? handleDelete : undefined}
        initialData={getMedicalEditData()}
        isEdit={isEdit}
        person={currentPerson}
      />

      {/* General insurance modal (vehicle, homeowners, LTC, disability, umbrella, other) */}
      <InsurancePolicyModal
        open={modalOpen && isGeneralModal}
        onClose={closeModal}
        onSave={handleSaveGeneral}
        onDelete={isEdit ? handleDelete : undefined}
        initialData={getGeneralEditData()}
        isEdit={isEdit}
        person={currentPerson}
        coverageType={modalCoverageType}
      />

      {/* Life insurance modal (shared with Financial Life section) */}
      <LifeInsuranceModal
        open={modalOpen && isLifeModal}
        onClose={closeModal}
        onSave={handleSaveLife}
        onDelete={isEdit ? handleDelete : undefined}
        initialData={getLifeEditData()}
        beneficiaryOptions={beneficiaryOptions}
        isEdit={isEdit}
        showSpouse={showSpouse}
        trustFlags={trustFlags}
      />
    </Box>
  );
};

export default InsuranceCoveragePage;
