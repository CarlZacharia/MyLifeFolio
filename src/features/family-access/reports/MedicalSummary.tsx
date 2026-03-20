import React from 'react';
import { Typography, Box, Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';
import ReportLayout, { ReportSectionTitle } from './ReportLayout';
import { str, BaseReportProps } from './reportHelpers';

interface MedicalSummaryProps extends BaseReportProps {}

const body = { fontSize: '12px', fontFamily: '"Jost", sans-serif' } as const;
const thCell = { fontWeight: 600, fontSize: '12px', fontFamily: '"Jost", sans-serif' } as const;

const MedicalSummary: React.FC<MedicalSummaryProps> = ({ data, ownerName, embedded }) => {
  const providers = (data.medicalProviders || []) as Array<Record<string, string>>;
  const medPolicies = (data.medicalInsurancePolicies || []) as Array<Record<string, string>>;
  const clientInsurance = data.clientMedicalInsurance as Record<string, string> | undefined;
  const spouseInsurance = data.spouseMedicalInsurance as Record<string, string> | undefined;
  const clientLtc = data.clientLongTermCare as Record<string, unknown> | undefined;

  const content = (
    <>
      {clientInsurance && (
        <Box sx={{ mb: 3 }}>
          <ReportSectionTitle>Client Medical Insurance</ReportSectionTitle>
          <Typography sx={body}><strong>Medicare Coverage:</strong> {clientInsurance.medicareCoverageType || 'N/A'}</Typography>
          <Typography sx={body}><strong>Plan:</strong> {clientInsurance.medicarePlanName || 'N/A'}</Typography>
          <Typography sx={body}><strong>Monthly Cost:</strong> {clientInsurance.medicareCoverageCost || 'N/A'}</Typography>
          {clientInsurance.privateInsuranceDescription && (
            <Typography sx={body}><strong>Private Insurance:</strong> {clientInsurance.privateInsuranceDescription} ({clientInsurance.privateInsuranceCost}/mo)</Typography>
          )}
        </Box>
      )}

      {spouseInsurance && spouseInsurance.medicareCoverageType && (
        <Box sx={{ mb: 3 }}>
          <ReportSectionTitle>Spouse Medical Insurance</ReportSectionTitle>
          <Typography sx={body}><strong>Medicare Coverage:</strong> {spouseInsurance.medicareCoverageType}</Typography>
          <Typography sx={body}><strong>Plan:</strong> {spouseInsurance.medicarePlanName || 'N/A'}</Typography>
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
                <TableCell sx={thCell}>Monthly Cost</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {medPolicies.map((p, i) => (
                <TableRow key={i}>
                  <TableCell sx={body}>{p.person === 'client' ? 'Client' : 'Spouse'}</TableCell>
                  <TableCell sx={body}>{p.insuranceType || 'N/A'}</TableCell>
                  <TableCell sx={body}>{p.provider || 'N/A'}</TableCell>
                  <TableCell sx={body}>{p.monthlyCost || 'N/A'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      )}

      {providers.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <ReportSectionTitle>Medical Providers</ReportSectionTitle>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={thCell}>Category</TableCell>
                <TableCell sx={thCell}>Name / Firm</TableCell>
                <TableCell sx={thCell}>Phone</TableCell>
                <TableCell sx={thCell}>Notes</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {providers.map((p, i) => (
                <TableRow key={i}>
                  <TableCell sx={body}>{p.specialistType || p.providerCategory}</TableCell>
                  <TableCell sx={body}>{p.name}{p.firmName ? ` - ${p.firmName}` : ''}</TableCell>
                  <TableCell sx={body}>{p.phone || 'N/A'}</TableCell>
                  <TableCell sx={body}>{p.notes || ''}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      )}

      {clientLtc && (
        <Box>
          <ReportSectionTitle>Long-Term Care</ReportSectionTitle>
          <Typography sx={body}><strong>Overall Health:</strong> {str(clientLtc.overallHealth)}</Typography>
          <Typography sx={body}><strong>LTC Concern Level:</strong> {str(clientLtc.ltcConcernLevel)}</Typography>
          {!!clientLtc.hasLtcInsurance && (
            <Typography sx={body}><strong>LTC Insurance:</strong> {str(clientLtc.ltcInsuranceCompany, 'Yes')}</Typography>
          )}
          {!!clientLtc.currentLivingSituation && (
            <Typography sx={body}><strong>Living Situation:</strong> {str(clientLtc.currentLivingSituation)}</Typography>
          )}
        </Box>
      )}
    </>
  );

  if (embedded) return content;

  return (
    <ReportLayout title="Medical Summary" ownerName={ownerName}>
      {content}
    </ReportLayout>
  );
};

export default MedicalSummary;
