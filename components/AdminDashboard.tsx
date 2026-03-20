'use client';

import React, { useState } from 'react';
import {
  Box, Typography, Button, Tabs, Tab, Paper,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PeopleIcon from '@mui/icons-material/People';
import PaymentIcon from '@mui/icons-material/Payment';
import SecurityIcon from '@mui/icons-material/Security';
import SettingsIcon from '@mui/icons-material/Settings';
import AdminUsersTab from './admin/AdminUsersTab';
import AdminSubscriptionsTab from './admin/AdminSubscriptionsTab';
import AdminAccessTab from './admin/AdminAccessTab';
import AdminSystemTab from './admin/AdminSystemTab';

interface AdminDashboardProps {
  onBack: () => void;
}

interface TabPanelProps {
  children: React.ReactNode;
  value: number;
  index: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => (
  <Box role="tabpanel" hidden={value !== index} sx={{ pt: 3 }}>
    {value === index && children}
  </Box>
);

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onBack }) => {
  const [tab, setTab] = useState(0);

  return (
    <Box sx={{ p: 3, maxWidth: 1400, mx: 'auto' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={onBack}
          sx={{ mr: 2 }}
          variant="outlined"
        >
          Back
        </Button>
        <Typography variant="h4" sx={{ color: '#1e3a5f', fontWeight: 600 }}>
          Admin Dashboard
        </Typography>
      </Box>

      {/* Tabs */}
      <Paper sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          sx={{
            '& .MuiTab-root': { textTransform: 'none', fontWeight: 500, minHeight: 48 },
            '& .Mui-selected': { color: '#1e3a5f' },
            '& .MuiTabs-indicator': { backgroundColor: '#1e3a5f' },
          }}
        >
          <Tab icon={<PeopleIcon />} iconPosition="start" label="Users" />
          <Tab icon={<PaymentIcon />} iconPosition="start" label="Subscriptions" />
          <Tab icon={<SecurityIcon />} iconPosition="start" label="Access & Security" />
          <Tab icon={<SettingsIcon />} iconPosition="start" label="System" />
        </Tabs>
      </Paper>

      {/* Tab Panels */}
      <TabPanel value={tab} index={0}>
        <AdminUsersTab />
      </TabPanel>
      <TabPanel value={tab} index={1}>
        <AdminSubscriptionsTab />
      </TabPanel>
      <TabPanel value={tab} index={2}>
        <AdminAccessTab />
      </TabPanel>
      <TabPanel value={tab} index={3}>
        <AdminSystemTab />
      </TabPanel>
    </Box>
  );
};

export default AdminDashboard;
