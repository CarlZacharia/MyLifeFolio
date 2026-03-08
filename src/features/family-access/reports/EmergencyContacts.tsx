import React from 'react';
import { Typography, Box, Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';
import ReportLayout, { ReportSectionTitle } from './ReportLayout';
import { str, BaseReportProps } from './reportHelpers';

interface EmergencyContactsProps extends BaseReportProps {}

const body = { fontSize: '12px', fontFamily: '"Jost", sans-serif' } as const;
const thCell = { fontWeight: 600, fontSize: '12px', fontFamily: '"Jost", sans-serif' } as const;

const EmergencyContacts: React.FC<EmergencyContactsProps> = ({ data, ownerName, embedded }) => {
  const providers = (data.medicalProviders || []) as Array<Record<string, string>>;
  const advisors = (data.advisors || []) as Array<Record<string, string>>;

  const content = (
    <>
      <Box sx={{ mb: 3 }}>
        <ReportSectionTitle>Primary Contact</ReportSectionTitle>
        <Typography sx={body}><strong>Name:</strong> {str(data.name)}</Typography>
        <Typography sx={body}><strong>Cell:</strong> {str(data.cellPhone)}</Typography>
        <Typography sx={body}><strong>Home:</strong> {str(data.homePhone)}</Typography>
        <Typography sx={body}><strong>Work:</strong> {str(data.workPhone)}</Typography>
        <Typography sx={body}><strong>Email:</strong> {str(data.email)}</Typography>
        <Typography sx={body}><strong>Address:</strong> {str(data.mailingAddress)}</Typography>
      </Box>

      {!!data.spouseName && (
        <Box sx={{ mb: 3 }}>
          <ReportSectionTitle>Spouse</ReportSectionTitle>
          <Typography sx={body}><strong>Name:</strong> {str(data.spouseName)}</Typography>
          <Typography sx={body}><strong>Cell:</strong> {str(data.spouseCellPhone)}</Typography>
          <Typography sx={body}><strong>Email:</strong> {str(data.spouseEmail)}</Typography>
        </Box>
      )}

      {providers.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <ReportSectionTitle>Medical Providers</ReportSectionTitle>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={thCell}>Type</TableCell>
                <TableCell sx={thCell}>Name</TableCell>
                <TableCell sx={thCell}>Phone</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {providers.map((p, i) => (
                <TableRow key={i}>
                  <TableCell sx={body}>{p.specialistType || p.providerCategory || 'Provider'}</TableCell>
                  <TableCell sx={body}>{p.name}{p.firmName ? ` (${p.firmName})` : ''}</TableCell>
                  <TableCell sx={body}>{p.phone || 'N/A'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      )}

      {advisors.length > 0 && (
        <Box>
          <ReportSectionTitle>Key Advisors</ReportSectionTitle>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={thCell}>Type</TableCell>
                <TableCell sx={thCell}>Name</TableCell>
                <TableCell sx={thCell}>Phone</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {advisors.map((a, i) => (
                <TableRow key={i}>
                  <TableCell sx={body}>{a.advisorType || 'Advisor'}</TableCell>
                  <TableCell sx={body}>{a.name}{a.firmName ? ` (${a.firmName})` : ''}</TableCell>
                  <TableCell sx={body}>{a.phone || 'N/A'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      )}
    </>
  );

  if (embedded) return content;

  return (
    <ReportLayout title="Emergency Contacts" ownerName={ownerName}>
      {content}
    </ReportLayout>
  );
};

export default EmergencyContacts;
