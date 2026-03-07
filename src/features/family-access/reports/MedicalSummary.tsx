import React from 'react';
import { Typography, Box, Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';
import ReportLayout from './ReportLayout';
import { str } from './reportHelpers';

interface MedicalSummaryProps {
  data: Record<string, unknown>;
  ownerName: string;
}

const MedicalSummary: React.FC<MedicalSummaryProps> = ({ data, ownerName }) => {
  const providers = (data.medicalProviders || []) as Array<Record<string, string>>;
  const medPolicies = (data.medicalInsurancePolicies || []) as Array<Record<string, string>>;
  const clientInsurance = data.clientMedicalInsurance as Record<string, string> | undefined;
  const spouseInsurance = data.spouseMedicalInsurance as Record<string, string> | undefined;
  const clientLtc = data.clientLongTermCare as Record<string, unknown> | undefined;

  return (
    <ReportLayout title="Medical Summary" ownerName={ownerName}>
      {/* Medicare / Insurance */}
      {clientInsurance && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" sx={{ mb: 1, color: '#1a237e' }}>Client Medical Insurance</Typography>
          <Typography><strong>Medicare Coverage:</strong> {clientInsurance.medicareCoverageType || 'N/A'}</Typography>
          <Typography><strong>Plan:</strong> {clientInsurance.medicarePlanName || 'N/A'}</Typography>
          <Typography><strong>Monthly Cost:</strong> {clientInsurance.medicareCoverageCost || 'N/A'}</Typography>
          {clientInsurance.privateInsuranceDescription && (
            <Typography><strong>Private Insurance:</strong> {clientInsurance.privateInsuranceDescription} ({clientInsurance.privateInsuranceCost}/mo)</Typography>
          )}
        </Box>
      )}

      {spouseInsurance && spouseInsurance.medicareCoverageType && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" sx={{ mb: 1, color: '#1a237e' }}>Spouse Medical Insurance</Typography>
          <Typography><strong>Medicare Coverage:</strong> {spouseInsurance.medicareCoverageType}</Typography>
          <Typography><strong>Plan:</strong> {spouseInsurance.medicarePlanName || 'N/A'}</Typography>
        </Box>
      )}

      {/* Medical Policies */}
      {medPolicies.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" sx={{ mb: 1, color: '#1a237e' }}>Medical Insurance Policies</Typography>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Person</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Provider</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Monthly Cost</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {medPolicies.map((p, i) => (
                <TableRow key={i}>
                  <TableCell>{p.person === 'client' ? 'Client' : 'Spouse'}</TableCell>
                  <TableCell>{p.insuranceType || 'N/A'}</TableCell>
                  <TableCell>{p.provider || 'N/A'}</TableCell>
                  <TableCell>{p.monthlyCost || 'N/A'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      )}

      {/* Providers */}
      {providers.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" sx={{ mb: 1, color: '#1a237e' }}>Medical Providers</Typography>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Category</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Name / Firm</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Phone</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Notes</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {providers.map((p, i) => (
                <TableRow key={i}>
                  <TableCell>{p.specialistType || p.providerCategory}</TableCell>
                  <TableCell>{p.name}{p.firmName ? ` - ${p.firmName}` : ''}</TableCell>
                  <TableCell>{p.phone || 'N/A'}</TableCell>
                  <TableCell>{p.notes || ''}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      )}

      {/* Long-Term Care */}
      {clientLtc && (
        <Box>
          <Typography variant="h6" sx={{ mb: 1, color: '#1a237e' }}>Long-Term Care</Typography>
          <Typography><strong>Overall Health:</strong> {str(clientLtc.overallHealth)}</Typography>
          <Typography><strong>LTC Concern Level:</strong> {str(clientLtc.ltcConcernLevel)}</Typography>
          {!!clientLtc.hasLtcInsurance && (
            <Typography><strong>LTC Insurance:</strong> {str(clientLtc.ltcInsuranceCompany, 'Yes')}</Typography>
          )}
          {!!clientLtc.currentLivingSituation && (
            <Typography><strong>Living Situation:</strong> {str(clientLtc.currentLivingSituation)}</Typography>
          )}
        </Box>
      )}
    </ReportLayout>
  );
};

export default MedicalSummary;
