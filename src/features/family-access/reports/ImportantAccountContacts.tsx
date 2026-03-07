import React from 'react';
import { Typography, Box, Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';
import ReportLayout from './ReportLayout';

interface ImportantAccountContactsProps {
  data: Record<string, unknown>;
  ownerName: string;
}

const ImportantAccountContacts: React.FC<ImportantAccountContactsProps> = ({ data, ownerName }) => {
  const bank = (data.bankAccounts || []) as Array<Record<string, string>>;
  const retirement = (data.retirementAccounts || []) as Array<Record<string, string>>;
  const investments = (data.nonQualifiedInvestments || []) as Array<Record<string, string>>;
  const lifeIns = (data.lifeInsurance || []) as Array<Record<string, string>>;
  const medPolicies = (data.medicalInsurancePolicies || []) as Array<Record<string, string>>;
  const insPolicies = (data.insurancePolicies || []) as Array<Record<string, string>>;

  const renderContactTable = (title: string, items: Array<Record<string, string>>, nameKey: string) => {
    if (items.length === 0) return null;
    return (
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#1a237e' }}>{title}</Typography>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>Institution</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Contact</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Phone</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((item, i) => (
              <TableRow key={i}>
                <TableCell>{item[nameKey] || item.institution || item.provider || 'N/A'}</TableCell>
                <TableCell>{item.contactName || 'N/A'}</TableCell>
                <TableCell>{item.contactPhone || item.phone || 'N/A'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>
    );
  };

  return (
    <ReportLayout title="Important Account Contacts" ownerName={ownerName}>
      {renderContactTable('Bank Accounts', bank, 'institution')}
      {renderContactTable('Retirement Accounts', retirement, 'institution')}
      {renderContactTable('Investment Accounts', investments, 'institution')}
      {renderContactTable('Life Insurance', lifeIns, 'company')}
      {renderContactTable('Medical Insurance', medPolicies, 'provider')}
      {renderContactTable('Other Insurance', insPolicies, 'provider')}
    </ReportLayout>
  );
};

export default ImportantAccountContacts;
