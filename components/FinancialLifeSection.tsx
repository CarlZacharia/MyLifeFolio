'use client';

import React, { useState } from 'react';
import {
  Box,
  Tabs,
  Tab,
  Typography,
  ToggleButtonGroup,
  ToggleButton,
} from '@mui/material';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import IncomeSection from './IncomeSection';
import AssetsSection from './AssetsSection';
import FinancialAssetsTab from './FinancialAssetsTab';
import BusinessAssetsTab from './BusinessAssetsTab';
import DigitalAssetsTab from './DigitalAssetsTab';
import { AssetCategoryType } from './AssetsSummaryTable';

const PRIMARY_TABS = [
  { label: 'Assets', icon: <AccountBalanceWalletIcon /> },
  { label: 'Income', icon: <AttachMoneyIcon /> },
  { label: 'Expenses', icon: <ReceiptLongIcon /> },
  { label: 'Debts', icon: <CreditCardIcon /> },
] as const;

const ASSET_SUB_TABS: { label: string; categories: AssetCategoryType[] }[] = [
  { label: 'Financial', categories: ['bankAccount', 'nonQualifiedInvestment', 'retirementAccount'] },
  { label: 'Real Property', categories: ['realEstate'] },
  { label: 'Life Insurance', categories: ['lifeInsurance'] },
  { label: 'Vehicles', categories: ['vehicle'] },
  { label: 'Business', categories: ['businessInterest'] },
  { label: 'Digital', categories: ['digitalAsset'] },
  { label: 'Personal Property', categories: ['otherAsset'] },
  { label: 'Other', categories: [] },
];

const PlaceholderTab = ({ title }: { title: string }) => (
  <Box sx={{ py: 4, textAlign: 'center' }}>
    <Typography variant="h6" sx={{ color: 'text.secondary', mb: 1 }}>
      {title}
    </Typography>
    <Typography color="text.secondary">
      Coming soon — this section is under development.
    </Typography>
  </Box>
);

const FinancialLifeSection = () => {
  const [primaryTab, setPrimaryTab] = useState(0);
  const [assetSubTab, setAssetSubTab] = useState(0);

  return (
    <Box>
      {/* Primary tabs */}
      <Tabs
        value={primaryTab}
        onChange={(_, v) => setPrimaryTab(v)}
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
        {PRIMARY_TABS.map((tab) => (
          <Tab key={tab.label} label={tab.label} icon={tab.icon} iconPosition="start" />
        ))}
      </Tabs>

      {/* Assets tab — with secondary segmented control */}
      {primaryTab === 0 && (
        <Box>
          <ToggleButtonGroup
            value={assetSubTab}
            exclusive
            onChange={(_, v) => { if (v !== null) setAssetSubTab(v); }}
            size="small"
            sx={{
              mb: 3,
              flexWrap: 'wrap',
              gap: 0.5,
              '& .MuiToggleButton-root': {
                textTransform: 'none',
                fontWeight: 500,
                fontSize: '0.82rem',
                px: 2,
                py: 0.5,
                borderRadius: '20px !important',
                border: '1px solid',
                borderColor: 'divider',
                '&.Mui-selected': {
                  bgcolor: '#0a5c36',
                  color: 'white',
                  borderColor: '#0a5c36',
                  '&:hover': { bgcolor: '#084a2c' },
                },
              },
            }}
          >
            {ASSET_SUB_TABS.map((sub, i) => (
              <ToggleButton key={sub.label} value={i}>
                {sub.label}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>

          {assetSubTab === 0 ? (
            <FinancialAssetsTab />
          ) : assetSubTab === 4 ? (
            <BusinessAssetsTab />
          ) : assetSubTab === 5 ? (
            <DigitalAssetsTab />
          ) : ASSET_SUB_TABS[assetSubTab].categories.length > 0 ? (
            <AssetsSection
              visibleCategories={ASSET_SUB_TABS[assetSubTab].categories}
              hideHeader
            />
          ) : (
            <PlaceholderTab title={ASSET_SUB_TABS[assetSubTab].label} />
          )}
        </Box>
      )}

      {/* Income tab */}
      {primaryTab === 1 && <IncomeSection />}

      {/* Expenses tab */}
      {primaryTab === 2 && <PlaceholderTab title="Expenses" />}

      {/* Debts tab */}
      {primaryTab === 3 && <PlaceholderTab title="Debts" />}
    </Box>
  );
};

export default FinancialLifeSection;
