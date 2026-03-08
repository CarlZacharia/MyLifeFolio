import React from 'react';
import { Typography, Box, Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';
import ReportLayout, { ReportSectionTitle } from './ReportLayout';
import { BaseReportProps } from './reportHelpers';

interface InsuranceOverviewProps extends BaseReportProps {}

const body = { fontSize: '12px', fontFamily: '"Jost", sans-serif' } as const;
const thCell = { fontWeight: 600, fontSize: '12px', fontFamily: '"Jost", sans-serif' } as const;

const InsuranceOverview: React.FC<InsuranceOverviewProps> = ({ data, ownerName, embedded }) => {
  const medPolicies = (data.medicalInsurancePolicies || []) as Array<Record<string, string>>;
  const insPolicies = (data.insurancePolicies || []) as Array<Record<string, string>>;
  const lifeIns = (data.lifeInsurance || []) as Array<Record<string, string>>;

  const content = (
    <>
      {lifeIns.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <ReportSectionTitle>Life Insurance</ReportSectionTitle>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={thCell}>Company</TableCell>
                <TableCell sx={thCell}>Type</TableCell>
                <TableCell sx={thCell}>Insured</TableCell>
                <TableCell sx={thCell}>Face Amount</TableCell>
                <TableCell sx={thCell}>Cash Value</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {lifeIns.map((p, i) => (
                <TableRow key={i}>
                  <TableCell sx={body}>{p.company || 'N/A'}</TableCell>
                  <TableCell sx={body}>{p.policyType || 'N/A'}</TableCell>
                  <TableCell sx={body}>{p.insured || 'N/A'}</TableCell>
                  <TableCell sx={body}>{p.faceAmount || 'N/A'}</TableCell>
                  <TableCell sx={body}>{p.cashValue || 'N/A'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      )}

      {medPolicies.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <ReportSectionTitle>Medical Insurance Policies</ReportSectionTitle>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={thCell}>Person</TableCell>
                <TableCell sx={thCell}>Type</TableCell>
                <TableCell sx={thCell}>Provider</TableCell>
                <TableCell sx={thCell}>Policy #</TableCell>
                <TableCell sx={thCell}>Contact</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {medPolicies.map((p, i) => (
                <TableRow key={i}>
                  <TableCell sx={body}>{p.person === 'client' ? 'Client' : 'Spouse'}</TableCell>
                  <TableCell sx={body}>{p.insuranceType || 'N/A'}</TableCell>
                  <TableCell sx={body}>{p.provider || 'N/A'}</TableCell>
                  <TableCell sx={body}>{p.policyNo || 'N/A'}</TableCell>
                  <TableCell sx={body}>{p.contactName || 'N/A'}{p.contactPhone ? ` - ${p.contactPhone}` : ''}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      )}

      {insPolicies.length > 0 && (
        <Box>
          <ReportSectionTitle>Other Insurance Policies</ReportSectionTitle>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={thCell}>Coverage Type</TableCell>
                <TableCell sx={thCell}>Provider</TableCell>
                <TableCell sx={thCell}>Policy #</TableCell>
                <TableCell sx={thCell}>Annual Cost</TableCell>
                <TableCell sx={thCell}>Contact</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {insPolicies.map((p, i) => (
                <TableRow key={i}>
                  <TableCell sx={body}>{p.coverageType || 'N/A'}</TableCell>
                  <TableCell sx={body}>{p.provider || 'N/A'}</TableCell>
                  <TableCell sx={body}>{p.policyNo || 'N/A'}</TableCell>
                  <TableCell sx={body}>{p.annualCost || 'N/A'}</TableCell>
                  <TableCell sx={body}>{p.contactName || 'N/A'}{p.contactPhone ? ` - ${p.contactPhone}` : ''}</TableCell>
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
    <ReportLayout title="Insurance Overview" ownerName={ownerName}>
      {content}
    </ReportLayout>
  );
};

export default InsuranceOverview;
