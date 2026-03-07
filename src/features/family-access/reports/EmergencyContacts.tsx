import React from 'react';
import { Typography, Box, Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';
import ReportLayout from './ReportLayout';
import { str } from './reportHelpers';

interface EmergencyContactsProps {
  data: Record<string, unknown>;
  ownerName: string;
}

const EmergencyContacts: React.FC<EmergencyContactsProps> = ({ data, ownerName }) => {
  const providers = (data.medicalProviders || []) as Array<Record<string, string>>;
  const advisors = (data.advisors || []) as Array<Record<string, string>>;

  return (
    <ReportLayout title="Emergency Contacts" ownerName={ownerName}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 1, color: '#1a237e' }}>Primary Contact</Typography>
        <Typography><strong>Name:</strong> {str(data.name)}</Typography>
        <Typography><strong>Cell:</strong> {str(data.cellPhone)}</Typography>
        <Typography><strong>Home:</strong> {str(data.homePhone)}</Typography>
        <Typography><strong>Work:</strong> {str(data.workPhone)}</Typography>
        <Typography><strong>Email:</strong> {str(data.email)}</Typography>
        <Typography><strong>Address:</strong> {str(data.mailingAddress)}</Typography>
      </Box>

      {!!data.spouseName && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" sx={{ mb: 1, color: '#1a237e' }}>Spouse</Typography>
          <Typography><strong>Name:</strong> {str(data.spouseName)}</Typography>
          <Typography><strong>Cell:</strong> {str(data.spouseCellPhone)}</Typography>
          <Typography><strong>Email:</strong> {str(data.spouseEmail)}</Typography>
        </Box>
      )}

      {providers.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" sx={{ mb: 1, color: '#1a237e' }}>Medical Providers</Typography>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Phone</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {providers.map((p, i) => (
                <TableRow key={i}>
                  <TableCell>{p.specialistType || p.providerCategory || 'Provider'}</TableCell>
                  <TableCell>{p.name}{p.firmName ? ` (${p.firmName})` : ''}</TableCell>
                  <TableCell>{p.phone || 'N/A'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      )}

      {advisors.length > 0 && (
        <Box>
          <Typography variant="h6" sx={{ mb: 1, color: '#1a237e' }}>Key Advisors</Typography>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Phone</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {advisors.map((a, i) => (
                <TableRow key={i}>
                  <TableCell>{a.advisorType || 'Advisor'}</TableCell>
                  <TableCell>{a.name}{a.firmName ? ` (${a.firmName})` : ''}</TableCell>
                  <TableCell>{a.phone || 'N/A'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      )}
    </ReportLayout>
  );
};

export default EmergencyContacts;
