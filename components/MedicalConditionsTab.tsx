'use client';

import React, { useState } from 'react';
import {
  Box,
  Tabs,
  Tab,
  Badge,
} from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import MonitorHeartIcon from '@mui/icons-material/MonitorHeart';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import { useFormContext } from '../lib/FormContext';
import BasicInfoTab from './BasicInfoTab';
import AllergiesTab from './AllergiesTab';
import ConditionsTab from './ConditionsTab';
import SurgeriesTab from './SurgeriesTab';

const MedicalConditionsTab = () => {
  const [activeSubTab, setActiveSubTab] = useState(0);
  const { formData } = useFormContext();

  const hasSevereAllergy = formData.allergies.some(
    (a) => a.severity === 'Severe / Anaphylactic'
  );
  const allergyCount = formData.allergies.length;

  const allergyLabel = allergyCount > 0 ? (
    <Badge
      badgeContent={allergyCount}
      color={hasSevereAllergy ? 'error' : 'default'}
      sx={{
        '& .MuiBadge-badge': {
          right: -12,
          top: 2,
          ...(hasSevereAllergy ? {} : { bgcolor: '#757575', color: '#fff' }),
        },
      }}
    >
      Allergies
    </Badge>
  ) : 'Allergies';

  const SUB_TABS = [
    { label: 'Basic Info', icon: <FavoriteIcon /> },
    { label: allergyLabel, icon: <WarningAmberIcon sx={hasSevereAllergy ? { color: '#c62828' } : {}} /> },
    { label: 'Conditions', icon: <MonitorHeartIcon /> },
    { label: 'Surgeries & Hospitalizations', icon: <LocalHospitalIcon /> },
  ];

  return (
    <Box>
      <Tabs
        value={activeSubTab}
        onChange={(_, v) => setActiveSubTab(v)}
        variant="scrollable"
        scrollButtons="auto"
        sx={{
          mb: 2,
          '& .MuiTab-root': {
            textTransform: 'none',
            fontWeight: 600,
            fontSize: '0.9rem',
            minHeight: 42,
          },
        }}
      >
        {SUB_TABS.map((tab, i) => (
          <Tab key={i} label={tab.label} icon={tab.icon} iconPosition="start" />
        ))}
      </Tabs>

      {activeSubTab === 0 && <BasicInfoTab />}
      {activeSubTab === 1 && <AllergiesTab />}
      {activeSubTab === 2 && <ConditionsTab />}
      {activeSubTab === 3 && <SurgeriesTab />}
    </Box>
  );
};

export default MedicalConditionsTab;
