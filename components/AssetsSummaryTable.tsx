'use client';

import React from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

// Helper to parse currency values
const parseValue = (value: string): number => {
  if (!value) return 0;
  // Remove currency symbols, commas, and parse
  const cleaned = value.replace(/[$,]/g, '').trim();
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
};

// Format number as currency
const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

interface AssetRow {
  id: number;
  description: string;
  owner: string;
  value: number;
}

interface AssetCategoryProps {
  title: string;
  categoryNumber: number;
  rows: AssetRow[];
  onRowClick: (index: number) => void;
  onAddClick: () => void;
  addButtonLabel: string;
}

const AssetCategory: React.FC<AssetCategoryProps> = ({
  title,
  categoryNumber,
  rows,
  onRowClick,
  onAddClick,
  addButtonLabel,
}) => {
  const categoryTotal = rows.reduce((sum, row) => sum + row.value, 0);

  return (
    <Box sx={{ mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 500 }}>
          {categoryNumber}. {title}
        </Typography>
        <Button variant="outlined" startIcon={<AddIcon />} onClick={onAddClick} size="small">
          {addButtonLabel}
        </Button>
      </Box>

      <TableContainer component={Paper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: 'grey.100' }}>
              <TableCell sx={{ fontWeight: 600 }}>Description</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Owner</TableCell>
              <TableCell align="right" sx={{ fontWeight: 600 }}>Value</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                  No items added yet. Click "{addButtonLabel}" to add one.
                </TableCell>
              </TableRow>
            ) : (
              <>
                {rows.map((row) => (
                  <TableRow
                    key={row.id}
                    hover
                    onClick={() => onRowClick(row.id)}
                    sx={{ cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}
                  >
                    <TableCell>{row.description || '(No description)'}</TableCell>
                    <TableCell>{row.owner || '(No owner)'}</TableCell>
                    <TableCell align="right">{row.value > 0 ? formatCurrency(row.value) : '-'}</TableCell>
                  </TableRow>
                ))}
                <TableRow sx={{ bgcolor: 'grey.50' }}>
                  <TableCell colSpan={2} sx={{ fontWeight: 600 }}>
                    Subtotal - {title}
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>
                    {formatCurrency(categoryTotal)}
                  </TableCell>
                </TableRow>
              </>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

interface RealEstateRow {
  id: number;
  description: string;
  owner: string;
  ownershipForm: string;
  value: number;
}

interface RealEstateCategoryProps {
  rows: RealEstateRow[];
  onRowClick: (index: number) => void;
  onAddClick: () => void;
}

const RealEstateCategory: React.FC<RealEstateCategoryProps> = ({
  rows,
  onRowClick,
  onAddClick,
}) => {
  const categoryTotal = rows.reduce((sum, row) => sum + row.value, 0);

  return (
    <Box sx={{ mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 500 }}>
          1. Real Estate
        </Typography>
        <Button variant="outlined" startIcon={<AddIcon />} onClick={onAddClick} size="small">
          Add Property
        </Button>
      </Box>

      <TableContainer component={Paper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: 'grey.100' }}>
              <TableCell sx={{ fontWeight: 600 }}>Description</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Owner</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Form</TableCell>
              <TableCell align="right" sx={{ fontWeight: 600 }}>Value</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                  No items added yet. Click &quot;Add Property&quot; to add one.
                </TableCell>
              </TableRow>
            ) : (
              <>
                {rows.map((row) => (
                  <TableRow
                    key={row.id}
                    hover
                    onClick={() => onRowClick(row.id)}
                    sx={{ cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}
                  >
                    <TableCell>{row.description || '(No description)'}</TableCell>
                    <TableCell>{row.owner || '(No owner)'}</TableCell>
                    <TableCell>{row.ownershipForm || '-'}</TableCell>
                    <TableCell align="right">{row.value > 0 ? formatCurrency(row.value) : '-'}</TableCell>
                  </TableRow>
                ))}
                <TableRow sx={{ bgcolor: 'grey.50' }}>
                  <TableCell colSpan={3} sx={{ fontWeight: 600 }}>
                    Subtotal - Real Estate
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>
                    {formatCurrency(categoryTotal)}
                  </TableCell>
                </TableRow>
              </>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

interface RealEstateItem {
  owner: string;
  ownershipForm: string;
  street: string;
  city: string;
  state: string;
  value: string;
}

interface BankAccountItem {
  owner: string;
  institution: string;
  amount: string;
}

interface NonQualifiedInvestmentItem {
  owner: string;
  institution: string;
  description: string;
  value: string;
}

interface RetirementAccountItem {
  owner: string;
  institution: string;
  accountType: string;
  value: string;
}

interface LifeInsuranceItem {
  owner: string;
  company: string;
  faceAmount: string;
  cashValue: string;
}

interface VehicleItem {
  owner: string;
  yearMakeModel: string;
  value: string;
}

interface OtherAssetItem {
  owner: string;
  description: string;
  value: string;
}

interface AssetsSummaryTableProps {
  realEstate: RealEstateItem[];
  bankAccounts: BankAccountItem[];
  nonQualifiedInvestments: NonQualifiedInvestmentItem[];
  retirementAccounts: RetirementAccountItem[];
  lifeInsurance: LifeInsuranceItem[];
  vehicles: VehicleItem[];
  otherAssets: OtherAssetItem[];
  onEditRealEstate: (index: number) => void;
  onEditBankAccount: (index: number) => void;
  onEditNonQualifiedInvestment: (index: number) => void;
  onEditRetirementAccount: (index: number) => void;
  onEditLifeInsurance: (index: number) => void;
  onEditVehicle: (index: number) => void;
  onEditOtherAsset: (index: number) => void;
  onAddRealEstate: () => void;
  onAddBankAccount: () => void;
  onAddNonQualifiedInvestment: () => void;
  onAddRetirementAccount: () => void;
  onAddLifeInsurance: () => void;
  onAddVehicle: () => void;
  onAddOtherAsset: () => void;
}

const AssetsSummaryTable: React.FC<AssetsSummaryTableProps> = ({
  realEstate,
  bankAccounts,
  nonQualifiedInvestments,
  retirementAccounts,
  lifeInsurance,
  vehicles,
  otherAssets,
  onEditRealEstate,
  onEditBankAccount,
  onEditNonQualifiedInvestment,
  onEditRetirementAccount,
  onEditLifeInsurance,
  onEditVehicle,
  onEditOtherAsset,
  onAddRealEstate,
  onAddBankAccount,
  onAddNonQualifiedInvestment,
  onAddRetirementAccount,
  onAddLifeInsurance,
  onAddVehicle,
  onAddOtherAsset,
}) => {
  // Transform data for each category
  const realEstateRows: RealEstateRow[] = realEstate.map((item, index) => ({
    id: index,
    description: item.street
      ? `${item.street}${item.city ? `, ${item.city}` : ''}${item.state ? `, ${item.state}` : ''}`
      : 'Property',
    owner: item.owner,
    ownershipForm: item.ownershipForm,
    value: parseValue(item.value),
  }));

  const bankAccountRows: AssetRow[] = bankAccounts.map((item, index) => ({
    id: index,
    description: item.institution || 'Bank Account',
    owner: item.owner,
    value: parseValue(item.amount),
  }));

  const nonQualifiedInvestmentRows: AssetRow[] = nonQualifiedInvestments.map((item, index) => ({
    id: index,
    description: item.description || item.institution || 'Investment Account',
    owner: item.owner,
    value: parseValue(item.value),
  }));

  const retirementAccountRows: AssetRow[] = retirementAccounts.map((item, index) => ({
    id: index,
    description: `${item.accountType || 'Retirement'} - ${item.institution || 'Account'}`,
    owner: item.owner,
    value: parseValue(item.value),
  }));

  const lifeInsuranceRows: AssetRow[] = lifeInsurance.map((item, index) => ({
    id: index,
    description: `${item.company || 'Policy'} (Face: ${item.faceAmount || 'N/A'})`,
    owner: item.owner,
    value: parseValue(item.cashValue),
  }));

  const vehicleRows: AssetRow[] = vehicles.map((item, index) => ({
    id: index,
    description: item.yearMakeModel || 'Vehicle',
    owner: item.owner,
    value: parseValue(item.value),
  }));

  const otherAssetRows: AssetRow[] = otherAssets.map((item, index) => ({
    id: index,
    description: item.description || 'Other Asset',
    owner: item.owner,
    value: parseValue(item.value),
  }));

  // Calculate grand total
  const grandTotal =
    realEstateRows.reduce((sum, row) => sum + row.value, 0) +
    bankAccountRows.reduce((sum, row) => sum + row.value, 0) +
    nonQualifiedInvestmentRows.reduce((sum, row) => sum + row.value, 0) +
    retirementAccountRows.reduce((sum, row) => sum + row.value, 0) +
    lifeInsuranceRows.reduce((sum, row) => sum + row.value, 0) +
    vehicleRows.reduce((sum, row) => sum + row.value, 0) +
    otherAssetRows.reduce((sum, row) => sum + row.value, 0);

  return (
    <Box>
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, color: '#1a237e', mb: 3 }}>
        ASSETS
      </Typography>

      <RealEstateCategory
        rows={realEstateRows}
        onRowClick={onEditRealEstate}
        onAddClick={onAddRealEstate}
      />

      <AssetCategory
        title="Cash, Bank Accounts and CDs"
        categoryNumber={2}
        rows={bankAccountRows}
        onRowClick={onEditBankAccount}
        onAddClick={onAddBankAccount}
        addButtonLabel="Add Account"
      />

      <AssetCategory
        title="Non-Qualified Investment Accounts"
        categoryNumber={3}
        rows={nonQualifiedInvestmentRows}
        onRowClick={onEditNonQualifiedInvestment}
        onAddClick={onAddNonQualifiedInvestment}
        addButtonLabel="Add Account"
      />

      <AssetCategory
        title="IRAs and Retirement Accounts"
        categoryNumber={4}
        rows={retirementAccountRows}
        onRowClick={onEditRetirementAccount}
        onAddClick={onAddRetirementAccount}
        addButtonLabel="Add Account"
      />

      <AssetCategory
        title="Life Insurance (Cash Value)"
        categoryNumber={5}
        rows={lifeInsuranceRows}
        onRowClick={onEditLifeInsurance}
        onAddClick={onAddLifeInsurance}
        addButtonLabel="Add Policy"
      />

      <AssetCategory
        title="Vehicles"
        categoryNumber={6}
        rows={vehicleRows}
        onRowClick={onEditVehicle}
        onAddClick={onAddVehicle}
        addButtonLabel="Add Vehicle"
      />

      <AssetCategory
        title="Other Assets"
        categoryNumber={7}
        rows={otherAssetRows}
        onRowClick={onEditOtherAsset}
        onAddClick={onAddOtherAsset}
        addButtonLabel="Add Asset"
      />

      {/* Grand Total */}
      <Paper variant="outlined" sx={{ p: 2, bgcolor: '#1a237e', color: 'white', mt: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            TOTAL ASSETS
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {formatCurrency(grandTotal)}
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default AssetsSummaryTable;
