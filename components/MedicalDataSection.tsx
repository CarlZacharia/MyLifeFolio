'use client';

import React, { useState } from 'react';
import {
  Box,
  Tabs,
  Tab,
} from '@mui/material';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import MedicationIcon from '@mui/icons-material/Medication';
import MonitorHeartIcon from '@mui/icons-material/MonitorHeart';
import DevicesOtherIcon from '@mui/icons-material/DevicesOther';
import LocalPharmacyIcon from '@mui/icons-material/LocalPharmacy';
import { useFormContext, MaritalStatus } from '../lib/FormContext';
import MedicalProvidersTab from './MedicalProvidersTab';
import MedicationsTab from './MedicationsTab';
import MedicalEquipmentTab from './MedicalEquipmentTab';
import PharmaciesTab from './PharmaciesTab';
import MedicalConditionsTab from './MedicalConditionsTab';

const SHOW_SPOUSE_STATUSES: MaritalStatus[] = ['Married', 'Second Marriage', 'Domestic Partnership'];

const TABS = [
  { label: 'Medical Providers', icon: <LocalHospitalIcon /> },
  { label: 'Medications', icon: <MedicationIcon /> },
  { label: 'Equipment & Devices', icon: <DevicesOtherIcon /> },
  { label: 'Pharmacies', icon: <LocalPharmacyIcon /> },
  { label: 'Medical Conditions', icon: <MonitorHeartIcon /> },
] as const;

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
      {activeTab === 1 && <MedicationsTab />}
      {activeTab === 2 && <MedicalEquipmentTab />}
      {activeTab === 3 && <PharmaciesTab />}
      {activeTab === 4 && <MedicalConditionsTab />}
    </Box>
  );
};

export default MedicalDataSection;
