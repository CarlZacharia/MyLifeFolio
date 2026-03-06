'use client';

import React, { useState } from 'react';
import {
  Box,
  Tabs,
  Tab,
  Typography,
} from '@mui/material';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import MedicationIcon from '@mui/icons-material/Medication';
import MonitorHeartIcon from '@mui/icons-material/MonitorHeart';
import HealthAndSafetyIcon from '@mui/icons-material/HealthAndSafety';
import { useFormContext, MaritalStatus } from '../lib/FormContext';
import MedicalProvidersTab from './MedicalProvidersTab';
import InsuranceCoverageTab from './InsuranceCoverageTab';

const SHOW_SPOUSE_STATUSES: MaritalStatus[] = ['Married', 'Second Marriage', 'Domestic Partnership'];

const TABS = [
  { label: 'Medical Providers', icon: <LocalHospitalIcon /> },
  { label: 'Medications & Equipment', icon: <MedicationIcon /> },
  { label: 'Medical Conditions', icon: <MonitorHeartIcon /> },
  { label: 'Insurance Coverage', icon: <HealthAndSafetyIcon /> },
] as const;

const PlaceholderTab = ({ title, showSpouse }: { title: string; showSpouse: boolean }) => {
  const [personTab, setPersonTab] = useState(0);

  return (
    <Box>
      {showSpouse && (
        <Tabs
          value={personTab}
          onChange={(_, v) => setPersonTab(v)}
          sx={{
            mb: 2,
            '& .MuiTab-root': { textTransform: 'none', fontWeight: 600, fontSize: '0.95rem' },
          }}
        >
          <Tab label="Client" />
          <Tab label="Spouse" />
        </Tabs>
      )}
      <Box sx={{ py: 4, textAlign: 'center' }}>
        <Typography variant="h6" sx={{ color: 'text.secondary', mb: 1 }}>
          {title} — {personTab === 0 ? 'Client' : 'Spouse'}
        </Typography>
        <Typography color="text.secondary">
          Coming soon — this section is under development.
        </Typography>
      </Box>
    </Box>
  );
};

const MedicalDataSection = () => {
  const [activeTab, setActiveTab] = useState(0);
  const { formData } = useFormContext();
  const showSpouse = SHOW_SPOUSE_STATUSES.includes(formData.maritalStatus);

  return (
    <Box>
      <Tabs
        value={activeTab}
        onChange={(_, v) => setActiveTab(v)}
        variant="scrollable"
        scrollButtons="auto"
        sx={{
          borderBottom: 1,
          borderColor: 'divider',
          mb: 2,
          '& .MuiTab-root': {
            textTransform: 'none',
            fontWeight: 600,
            fontSize: '0.95rem',
            minHeight: 48,
          },
        }}
      >
        {TABS.map((tab) => (
          <Tab key={tab.label} label={tab.label} icon={tab.icon} iconPosition="start" />
        ))}
      </Tabs>

      {activeTab === 0 && <MedicalProvidersTab />}
      {activeTab === 1 && <PlaceholderTab title="Medications & Equipment" showSpouse={showSpouse} />}
      {activeTab === 2 && <PlaceholderTab title="Medical Conditions" showSpouse={showSpouse} />}
      {activeTab === 3 && <InsuranceCoverageTab />}
    </Box>
  );
};

export default MedicalDataSection;
