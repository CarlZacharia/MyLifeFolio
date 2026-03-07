import React from 'react';
import { Typography, Box, Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';
import ReportLayout from './ReportLayout';

interface FinancialSnapshotProps {
  data: Record<string, unknown>;
  ownerName: string;
}

const parseAmount = (val: string | undefined): number => {
  if (!val) return 0;
  return parseFloat(val.replace(/[^0-9.-]/g, '')) || 0;
};

const formatCurrency = (val: number): string => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
};

const FinancialSnapshot: React.FC<FinancialSnapshotProps> = ({ data, ownerName }) => {
  const bank = (data.bankAccounts || []) as Array<Record<string, string>>;
  const investments = (data.nonQualifiedInvestments || []) as Array<Record<string, string>>;
  const retirement = (data.retirementAccounts || []) as Array<Record<string, string>>;
  const realEstate = (data.realEstate || []) as Array<Record<string, string>>;
  const lifeIns = (data.lifeInsurance || []) as Array<Record<string, string>>;
  const vehicles = (data.vehicles || []) as Array<Record<string, string>>;
  const otherAssets = (data.otherAssets || []) as Array<Record<string, string>>;
  const business = (data.businessInterests || []) as Array<Record<string, string>>;

  const totals = {
    bank: bank.reduce((s, a) => s + parseAmount(a.amount), 0),
    investments: investments.reduce((s, a) => s + parseAmount(a.value), 0),
    retirement: retirement.reduce((s, a) => s + parseAmount(a.value), 0),
    realEstate: realEstate.reduce((s, a) => s + parseAmount(a.value), 0),
    lifeInsurance: lifeIns.reduce((s, a) => s + parseAmount(a.cashValue), 0),
    vehicles: vehicles.reduce((s, a) => s + parseAmount(a.value), 0),
    otherAssets: otherAssets.reduce((s, a) => s + parseAmount(a.value), 0),
    business: business.reduce((s, a) => s + parseAmount(a.fullValue), 0),
  };
  const grandTotal = Object.values(totals).reduce((s, v) => s + v, 0);

  const renderSection = (title: string, items: Array<Record<string, string>>, labelKey: string, valueKey: string) => {
    if (items.length === 0) return null;
    return (
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#1a237e' }}>{title}</Typography>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>Description</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Owner</TableCell>
              <TableCell sx={{ fontWeight: 600 }} align="right">Value</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((item, i) => (
              <TableRow key={i}>
                <TableCell>{item[labelKey] || item.description || item.institution || 'N/A'}</TableCell>
                <TableCell>{item.owner || 'N/A'}</TableCell>
                <TableCell align="right">{formatCurrency(parseAmount(item[valueKey]))}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>
    );
  };

  return (
    <ReportLayout title="Financial Snapshot" ownerName={ownerName}>
      {renderSection('Bank Accounts', bank, 'institution', 'amount')}
      {renderSection('Non-Qualified Investments', investments, 'institution', 'value')}
      {renderSection('Retirement Accounts', retirement, 'institution', 'value')}
      {renderSection('Real Estate', realEstate, 'street', 'value')}
      {renderSection('Life Insurance (Cash Value)', lifeIns, 'company', 'cashValue')}
      {renderSection('Vehicles', vehicles, 'yearMakeModel', 'value')}
      {renderSection('Other Assets', otherAssets, 'description', 'value')}
      {renderSection('Business Interests', business, 'businessName', 'fullValue')}

      <Box sx={{ mt: 3, p: 2, bgcolor: '#e8eaf6', borderRadius: 1 }}>
        <Typography variant="h6" sx={{ color: '#1a237e' }}>
          Estimated Total: {formatCurrency(grandTotal)}
        </Typography>
        <Box sx={{ mt: 1 }}>
          {Object.entries(totals).filter(([, v]) => v > 0).map(([key, val]) => (
            <Typography key={key} variant="body2">
              {key.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase())}: {formatCurrency(val)}
            </Typography>
          ))}
        </Box>
      </Box>
    </ReportLayout>
  );
};

export default FinancialSnapshot;
