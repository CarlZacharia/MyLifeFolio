import React from 'react';
import { Box, Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';
import ReportLayout, { ReportSectionTitle } from './ReportLayout';
import { BaseReportProps } from './reportHelpers';

interface AdvisorsContactsProps extends BaseReportProps {}

const body = { fontSize: '12px', fontFamily: '"Jost", sans-serif' } as const;
const thCell = { fontWeight: 600, fontSize: '12px', fontFamily: '"Jost", sans-serif' } as const;

const AdvisorsContacts: React.FC<AdvisorsContactsProps> = ({ data, ownerName, embedded }) => {
  const advisors = (data.advisors || []) as Array<Record<string, string>>;
  const friends = (data.friendsNeighbors || []) as Array<Record<string, string>>;

  const content = (
    <>
      {advisors.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <ReportSectionTitle>Professional Advisors</ReportSectionTitle>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={thCell}>Type</TableCell>
                <TableCell sx={thCell}>Name</TableCell>
                <TableCell sx={thCell}>Firm</TableCell>
                <TableCell sx={thCell}>Phone</TableCell>
                <TableCell sx={thCell}>Email</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {advisors.map((a, i) => (
                <TableRow key={i}>
                  <TableCell sx={body}>{a.advisorType || 'N/A'}</TableCell>
                  <TableCell sx={body}>{a.name || 'N/A'}</TableCell>
                  <TableCell sx={body}>{a.firmName || 'N/A'}</TableCell>
                  <TableCell sx={body}>{a.phone || 'N/A'}</TableCell>
                  <TableCell sx={body}>{a.email || 'N/A'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      )}

      {friends.length > 0 && (
        <Box>
          <ReportSectionTitle>Friends & Neighbors</ReportSectionTitle>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={thCell}>Name</TableCell>
                <TableCell sx={thCell}>Relationship</TableCell>
                <TableCell sx={thCell}>Phone</TableCell>
                <TableCell sx={thCell}>Email</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {friends.map((f, i) => (
                <TableRow key={i}>
                  <TableCell sx={body}>{f.name || 'N/A'}</TableCell>
                  <TableCell sx={body}>{f.relationship || 'N/A'}</TableCell>
                  <TableCell sx={body}>{f.phone || 'N/A'}</TableCell>
                  <TableCell sx={body}>{f.email || 'N/A'}</TableCell>
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
    <ReportLayout title="Advisors & Contacts" ownerName={ownerName}>
      {content}
    </ReportLayout>
  );
};

export default AdvisorsContacts;
