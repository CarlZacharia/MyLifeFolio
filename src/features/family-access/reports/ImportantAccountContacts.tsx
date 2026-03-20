import React from 'react';
import { Box, Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';
import ReportLayout, { ReportSectionTitle } from './ReportLayout';

interface ImportantAccountContactsProps {
  data: Record<string, unknown>;
  ownerName: string;
}

const body = { fontSize: '12px', fontFamily: '"Jost", sans-serif' } as const;
const thCell = { fontWeight: 600, fontSize: '12px', fontFamily: '"Jost", sans-serif' } as const;

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
        <ReportSectionTitle>{title}</ReportSectionTitle>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={thCell}>Institution</TableCell>
              <TableCell sx={thCell}>Contact</TableCell>
              <TableCell sx={thCell}>Phone</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((item, i) => (
              <TableRow key={i}>
                <TableCell sx={body}>{item[nameKey] || item.institution || item.provider || 'N/A'}</TableCell>
                <TableCell sx={body}>{item.contactName || 'N/A'}</TableCell>
                <TableCell sx={body}>{item.contactPhone || item.phone || 'N/A'}</TableCell>
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
