import React from 'react';
import { Typography, Box, Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';
import ReportLayout from './ReportLayout';

interface InsuranceOverviewProps {
  data: Record<string, unknown>;
  ownerName: string;
}

const InsuranceOverview: React.FC<InsuranceOverviewProps> = ({ data, ownerName }) => {
  const medPolicies = (data.medicalInsurancePolicies || []) as Array<Record<string, string>>;
  const insPolicies = (data.insurancePolicies || []) as Array<Record<string, string>>;
  const lifeIns = (data.lifeInsurance || []) as Array<Record<string, string>>;

  return (
    <ReportLayout title="Insurance Overview" ownerName={ownerName}>
      {/* Life Insurance */}
      {lifeIns.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" sx={{ mb: 1, color: '#1a237e' }}>Life Insurance</Typography>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Company</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Insured</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Face Amount</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Cash Value</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {lifeIns.map((p, i) => (
                <TableRow key={i}>
                  <TableCell>{p.company || 'N/A'}</TableCell>
                  <TableCell>{p.policyType || 'N/A'}</TableCell>
                  <TableCell>{p.insured || 'N/A'}</TableCell>
                  <TableCell>{p.faceAmount || 'N/A'}</TableCell>
                  <TableCell>{p.cashValue || 'N/A'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      )}

      {/* Medical Insurance Policies */}
      {medPolicies.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" sx={{ mb: 1, color: '#1a237e' }}>Medical Insurance Policies</Typography>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Person</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Provider</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Policy #</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Contact</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {medPolicies.map((p, i) => (
                <TableRow key={i}>
                  <TableCell>{p.person === 'client' ? 'Client' : 'Spouse'}</TableCell>
                  <TableCell>{p.insuranceType || 'N/A'}</TableCell>
                  <TableCell>{p.provider || 'N/A'}</TableCell>
                  <TableCell>{p.policyNo || 'N/A'}</TableCell>
                  <TableCell>{p.contactName || 'N/A'}{p.contactPhone ? ` - ${p.contactPhone}` : ''}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      )}

      {/* Other Insurance Policies */}
      {insPolicies.length > 0 && (
        <Box>
          <Typography variant="h6" sx={{ mb: 1, color: '#1a237e' }}>Other Insurance Policies</Typography>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Coverage Type</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Provider</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Policy #</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Annual Cost</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Contact</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {insPolicies.map((p, i) => (
                <TableRow key={i}>
                  <TableCell>{p.coverageType || 'N/A'}</TableCell>
                  <TableCell>{p.provider || 'N/A'}</TableCell>
                  <TableCell>{p.policyNo || 'N/A'}</TableCell>
                  <TableCell>{p.annualCost || 'N/A'}</TableCell>
                  <TableCell>{p.contactName || 'N/A'}{p.contactPhone ? ` - ${p.contactPhone}` : ''}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      )}
    </ReportLayout>
  );
};

export default InsuranceOverview;
