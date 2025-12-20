'use client';

import React, { useState } from 'react';
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
import { VideoHelpIcon } from './FieldWithHelp';
import HelpModal from './HelpModal';

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
  helpId: number;
  onHelpClick: (helpId: number) => void;
}

const AssetCategory: React.FC<AssetCategoryProps> = ({
  title,
  categoryNumber,
  rows,
  onRowClick,
  onAddClick,
  addButtonLabel,
  helpId,
  onHelpClick,
}) => {
  const categoryTotal = rows.reduce((sum, row) => sum + row.value, 0);

  return (
    <Box sx={{ mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 500 }}>
            {categoryNumber}. {title}
          </Typography>
          <VideoHelpIcon helpId={helpId} onClick={() => onHelpClick(helpId)} size="small" />
        </Box>
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

// Row type for accounts with Institution + Description
interface InstitutionAssetRow {
  id: number;
  institution: string;
  description: string;
  owner: string;
  value: number;
}

interface InstitutionAssetCategoryProps {
  title: string;
  categoryNumber: number;
  rows: InstitutionAssetRow[];
  onRowClick: (index: number) => void;
  onAddClick: () => void;
  addButtonLabel: string;
  helpId: number;
  onHelpClick: (helpId: number) => void;
}

const InstitutionAssetCategory: React.FC<InstitutionAssetCategoryProps> = ({
  title,
  categoryNumber,
  rows,
  onRowClick,
  onAddClick,
  addButtonLabel,
  helpId,
  onHelpClick,
}) => {
  const categoryTotal = rows.reduce((sum, row) => sum + row.value, 0);

  return (
    <Box sx={{ mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 500 }}>
            {categoryNumber}. {title}
          </Typography>
          <VideoHelpIcon helpId={helpId} onClick={() => onHelpClick(helpId)} size="small" />
        </Box>
        <Button variant="outlined" startIcon={<AddIcon />} onClick={onAddClick} size="small">
          {addButtonLabel}
        </Button>
      </Box>

      <TableContainer component={Paper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: 'grey.100' }}>
              <TableCell sx={{ fontWeight: 600 }}>Institution</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Description</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Owner</TableCell>
              <TableCell align="right" sx={{ fontWeight: 600 }}>Value</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                  No items added yet. Click &quot;{addButtonLabel}&quot; to add one.
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
                    <TableCell>{row.institution || '-'}</TableCell>
                    <TableCell>{row.description || '-'}</TableCell>
                    <TableCell>{row.owner || '(No owner)'}</TableCell>
                    <TableCell align="right">{row.value > 0 ? formatCurrency(row.value) : '-'}</TableCell>
                  </TableRow>
                ))}
                <TableRow sx={{ bgcolor: 'grey.50' }}>
                  <TableCell colSpan={3} sx={{ fontWeight: 600 }}>
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

// Row type for Life Insurance with Company + Description
interface CompanyAssetRow {
  id: number;
  company: string;
  description: string;
  owner: string;
  value: number;
}

interface CompanyAssetCategoryProps {
  title: string;
  categoryNumber: number;
  rows: CompanyAssetRow[];
  onRowClick: (index: number) => void;
  onAddClick: () => void;
  addButtonLabel: string;
  helpId: number;
  onHelpClick: (helpId: number) => void;
}

const CompanyAssetCategory: React.FC<CompanyAssetCategoryProps> = ({
  title,
  categoryNumber,
  rows,
  onRowClick,
  onAddClick,
  addButtonLabel,
  helpId,
  onHelpClick,
}) => {
  const categoryTotal = rows.reduce((sum, row) => sum + row.value, 0);

  return (
    <Box sx={{ mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 500 }}>
            {categoryNumber}. {title}
          </Typography>
          <VideoHelpIcon helpId={helpId} onClick={() => onHelpClick(helpId)} size="small" />
        </Box>
        <Button variant="outlined" startIcon={<AddIcon />} onClick={onAddClick} size="small">
          {addButtonLabel}
        </Button>
      </Box>

      <TableContainer component={Paper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: 'grey.100' }}>
              <TableCell sx={{ fontWeight: 600 }}>Company</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Description</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Owner</TableCell>
              <TableCell align="right" sx={{ fontWeight: 600 }}>Value</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                  No items added yet. Click &quot;{addButtonLabel}&quot; to add one.
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
                    <TableCell>{row.company || '-'}</TableCell>
                    <TableCell>{row.description || '-'}</TableCell>
                    <TableCell>{row.owner || '(No owner)'}</TableCell>
                    <TableCell align="right">{row.value > 0 ? formatCurrency(row.value) : '-'}</TableCell>
                  </TableRow>
                ))}
                <TableRow sx={{ bgcolor: 'grey.50' }}>
                  <TableCell colSpan={3} sx={{ fontWeight: 600 }}>
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
  helpId: number;
  onHelpClick: (helpId: number) => void;
}

const RealEstateCategory: React.FC<RealEstateCategoryProps> = ({
  rows,
  onRowClick,
  onAddClick,
  helpId,
  onHelpClick,
}) => {
  const categoryTotal = rows.reduce((sum, row) => sum + row.value, 0);

  return (
    <Box sx={{ mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 500 }}>
            1. Real Estate
          </Typography>
          <VideoHelpIcon helpId={helpId} onClick={() => onHelpClick(helpId)} size="small" />
        </Box>
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
  policyType: string;
  faceAmount: string;
  deathBenefit: string;
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

interface BusinessInterestItem {
  owner: string;
  businessName: string;
  entityType: string;
  ownershipPercentage: string;
  value: string;
}

interface DigitalAssetItem {
  owner: string;
  assetType: string;
  platform: string;
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
  businessInterests: BusinessInterestItem[];
  digitalAssets: DigitalAssetItem[];
  onEditRealEstate: (index: number) => void;
  onEditBankAccount: (index: number) => void;
  onEditNonQualifiedInvestment: (index: number) => void;
  onEditRetirementAccount: (index: number) => void;
  onEditLifeInsurance: (index: number) => void;
  onEditVehicle: (index: number) => void;
  onEditOtherAsset: (index: number) => void;
  onEditBusinessInterest: (index: number) => void;
  onEditDigitalAsset: (index: number) => void;
  onAddRealEstate: () => void;
  onAddBankAccount: () => void;
  onAddNonQualifiedInvestment: () => void;
  onAddRetirementAccount: () => void;
  onAddLifeInsurance: () => void;
  onAddVehicle: () => void;
  onAddOtherAsset: () => void;
  onAddBusinessInterest: () => void;
  onAddDigitalAsset: () => void;
}

const AssetsSummaryTable: React.FC<AssetsSummaryTableProps> = ({
  realEstate,
  bankAccounts,
  nonQualifiedInvestments,
  retirementAccounts,
  lifeInsurance,
  vehicles,
  otherAssets,
  businessInterests,
  digitalAssets,
  onEditRealEstate,
  onEditBankAccount,
  onEditNonQualifiedInvestment,
  onEditRetirementAccount,
  onEditLifeInsurance,
  onEditVehicle,
  onEditOtherAsset,
  onEditBusinessInterest,
  onEditDigitalAsset,
  onAddRealEstate,
  onAddBankAccount,
  onAddNonQualifiedInvestment,
  onAddRetirementAccount,
  onAddLifeInsurance,
  onAddVehicle,
  onAddOtherAsset,
  onAddBusinessInterest,
  onAddDigitalAsset,
}) => {
  // Help modal state
  const [activeHelpId, setActiveHelpId] = useState<number | null>(null);
  const openHelp = (helpId: number) => setActiveHelpId(helpId);
  const closeHelp = () => setActiveHelpId(null);
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

  const bankAccountRows: InstitutionAssetRow[] = bankAccounts.map((item, index) => ({
    id: index,
    institution: item.institution || '',
    description: 'Bank Account',
    owner: item.owner,
    value: parseValue(item.amount),
  }));

  const nonQualifiedInvestmentRows: InstitutionAssetRow[] = nonQualifiedInvestments.map((item, index) => ({
    id: index,
    institution: item.institution || '',
    description: item.description || '',
    owner: item.owner,
    value: parseValue(item.value),
  }));

  const retirementAccountRows: InstitutionAssetRow[] = retirementAccounts.map((item, index) => ({
    id: index,
    institution: item.institution || '',
    description: item.accountType || '',
    owner: item.owner,
    value: parseValue(item.value),
  }));

  const lifeInsuranceRows: CompanyAssetRow[] = lifeInsurance.map((item, index) => {
    // Build description from policy type and face amount
    const parts: string[] = [];
    if (item.policyType) parts.push(item.policyType);
    if (item.faceAmount) parts.push(`Face: ${item.faceAmount}`);
    return {
      id: index,
      company: item.company || '',
      description: parts.join(' - ') || '',
      owner: item.owner,
      value: parseValue(item.deathBenefit),
    };
  });

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

  const businessInterestRows: AssetRow[] = businessInterests.map((item, index) => {
    // Build description from business name, entity type, and ownership
    const parts: string[] = [];
    if (item.businessName) parts.push(item.businessName);
    if (item.entityType) parts.push(`(${item.entityType})`);
    if (item.ownershipPercentage) parts.push(`- ${item.ownershipPercentage}`);
    return {
      id: index,
      description: parts.join(' ') || 'Business Interest',
      owner: item.owner,
      value: parseValue(item.value),
    };
  });

  const digitalAssetRows: AssetRow[] = digitalAssets.map((item, index) => {
    // Build description from asset type and platform
    const parts: string[] = [];
    if (item.assetType) parts.push(item.assetType);
    if (item.platform) parts.push(`@ ${item.platform}`);
    if (item.description) parts.push(`- ${item.description}`);
    return {
      id: index,
      description: parts.join(' ') || 'Digital Asset',
      owner: item.owner,
      value: parseValue(item.value),
    };
  });

  // Calculate grand total
  const grandTotal =
    realEstateRows.reduce((sum, row) => sum + row.value, 0) +
    bankAccountRows.reduce((sum, row) => sum + row.value, 0) +
    nonQualifiedInvestmentRows.reduce((sum, row) => sum + row.value, 0) +
    retirementAccountRows.reduce((sum, row) => sum + row.value, 0) +
    lifeInsuranceRows.reduce((sum, row) => sum + row.value, 0) +
    vehicleRows.reduce((sum, row) => sum + row.value, 0) +
    otherAssetRows.reduce((sum, row) => sum + row.value, 0) +
    businessInterestRows.reduce((sum, row) => sum + row.value, 0) +
    digitalAssetRows.reduce((sum, row) => sum + row.value, 0);

  return (
    <Box>
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, color: '#1a237e', mb: 3 }}>
        ASSETS
      </Typography>

      <RealEstateCategory
        rows={realEstateRows}
        onRowClick={onEditRealEstate}
        onAddClick={onAddRealEstate}
        helpId={110}
        onHelpClick={openHelp}
      />

      <InstitutionAssetCategory
        title="Cash, Bank Accounts and CDs"
        categoryNumber={2}
        rows={bankAccountRows}
        onRowClick={onEditBankAccount}
        onAddClick={onAddBankAccount}
        addButtonLabel="Add Account"
        helpId={111}
        onHelpClick={openHelp}
      />

      <InstitutionAssetCategory
        title="Non-Qualified Investment Accounts"
        categoryNumber={3}
        rows={nonQualifiedInvestmentRows}
        onRowClick={onEditNonQualifiedInvestment}
        onAddClick={onAddNonQualifiedInvestment}
        addButtonLabel="Add Account"
        helpId={112}
        onHelpClick={openHelp}
      />

      <InstitutionAssetCategory
        title="IRAs and Retirement Accounts"
        categoryNumber={4}
        rows={retirementAccountRows}
        onRowClick={onEditRetirementAccount}
        onAddClick={onAddRetirementAccount}
        addButtonLabel="Add Account"
        helpId={113}
        onHelpClick={openHelp}
      />

      <CompanyAssetCategory
        title="Life Insurance (Death Benefit)"
        categoryNumber={5}
        rows={lifeInsuranceRows}
        onRowClick={onEditLifeInsurance}
        onAddClick={onAddLifeInsurance}
        addButtonLabel="Add Policy"
        helpId={114}
        onHelpClick={openHelp}
      />

      <AssetCategory
        title="Vehicles"
        categoryNumber={6}
        rows={vehicleRows}
        onRowClick={onEditVehicle}
        onAddClick={onAddVehicle}
        addButtonLabel="Add Vehicle"
        helpId={115}
        onHelpClick={openHelp}
      />

      <AssetCategory
        title="Other Assets"
        categoryNumber={7}
        rows={otherAssetRows}
        onRowClick={onEditOtherAsset}
        onAddClick={onAddOtherAsset}
        addButtonLabel="Add Asset"
        helpId={116}
        onHelpClick={openHelp}
      />

      <AssetCategory
        title="Business Interests"
        categoryNumber={8}
        rows={businessInterestRows}
        onRowClick={onEditBusinessInterest}
        onAddClick={onAddBusinessInterest}
        addButtonLabel="Add Business"
        helpId={117}
        onHelpClick={openHelp}
      />

      <AssetCategory
        title="Digital Assets"
        categoryNumber={9}
        rows={digitalAssetRows}
        onRowClick={onEditDigitalAsset}
        onAddClick={onAddDigitalAsset}
        addButtonLabel="Add Asset"
        helpId={118}
        onHelpClick={openHelp}
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

      {/* Help Modal */}
      <HelpModal
        open={activeHelpId !== null}
        onClose={closeHelp}
        helpId={activeHelpId}
      />
    </Box>
  );
};

export default AssetsSummaryTable;
