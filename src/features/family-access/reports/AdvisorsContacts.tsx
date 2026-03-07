import React from 'react';
import { Typography, Box, Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';
import ReportLayout from './ReportLayout';

interface AdvisorsContactsProps {
  data: Record<string, unknown>;
  ownerName: string;
}

const AdvisorsContacts: React.FC<AdvisorsContactsProps> = ({ data, ownerName }) => {
  const advisors = (data.advisors || []) as Array<Record<string, string>>;
  const friends = (data.friendsNeighbors || []) as Array<Record<string, string>>;

  return (
    <ReportLayout title="Advisors & Contacts" ownerName={ownerName}>
      {advisors.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" sx={{ mb: 1, color: '#1a237e' }}>Professional Advisors</Typography>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Firm</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Phone</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {advisors.map((a, i) => (
                <TableRow key={i}>
                  <TableCell>{a.advisorType || 'N/A'}</TableCell>
                  <TableCell>{a.name || 'N/A'}</TableCell>
                  <TableCell>{a.firmName || 'N/A'}</TableCell>
                  <TableCell>{a.phone || 'N/A'}</TableCell>
                  <TableCell>{a.email || 'N/A'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      )}

      {friends.length > 0 && (
        <Box>
          <Typography variant="h6" sx={{ mb: 1, color: '#1a237e' }}>Friends & Neighbors</Typography>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Relationship</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Phone</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {friends.map((f, i) => (
                <TableRow key={i}>
                  <TableCell>{f.name || 'N/A'}</TableCell>
                  <TableCell>{f.relationship || 'N/A'}</TableCell>
                  <TableCell>{f.phone || 'N/A'}</TableCell>
                  <TableCell>{f.email || 'N/A'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      )}
    </ReportLayout>
  );
};

export default AdvisorsContacts;
