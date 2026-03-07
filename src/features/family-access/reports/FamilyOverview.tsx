import React from 'react';
import { Typography, Box, Table, TableBody, TableCell, TableHead, TableRow, Chip } from '@mui/material';
import ReportLayout from './ReportLayout';
import { str } from './reportHelpers';

interface FamilyOverviewProps {
  data: Record<string, unknown>;
  ownerName: string;
}

const FamilyOverview: React.FC<FamilyOverviewProps> = ({ data, ownerName }) => {
  const children = (data.children || []) as Array<Record<string, unknown>>;
  const otherBeneficiaries = (data.otherBeneficiaries || []) as Array<Record<string, string>>;
  const pets = (data.pets || []) as Array<Record<string, unknown>>;
  const dependents = (data.dependents || []) as Array<Record<string, string>>;
  const charities = (data.charities || []) as Array<Record<string, string>>;

  return (
    <ReportLayout title="Family Overview" ownerName={ownerName}>
      {children.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" sx={{ mb: 1, color: '#1a237e' }}>Children</Typography>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Age</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Relationship</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Marital Status</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Has Children</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {children.map((c, i) => (
                <TableRow key={i}>
                  <TableCell>
                    {str(c.name)}
                    {!!c.isDeceased && <Chip label="Deceased" size="small" sx={{ ml: 1 }} />}
                  </TableCell>
                  <TableCell>{str(c.age)}</TableCell>
                  <TableCell>{str(c.relationship)}</TableCell>
                  <TableCell>{str(c.maritalStatus)}</TableCell>
                  <TableCell>{c.hasChildren ? `Yes (${c.numberOfChildren})` : 'No'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      )}

      {otherBeneficiaries.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" sx={{ mb: 1, color: '#1a237e' }}>Other Beneficiaries</Typography>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Relationship</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Notes</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {otherBeneficiaries.map((b, i) => (
                <TableRow key={i}>
                  <TableCell>{b.name || 'N/A'}</TableCell>
                  <TableCell>{b.relationship || b.relationshipOther || 'N/A'}</TableCell>
                  <TableCell>{b.notes || ''}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      )}

      {charities.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" sx={{ mb: 1, color: '#1a237e' }}>Charitable Beneficiaries</Typography>
          {charities.map((c, i) => (
            <Box key={i} sx={{ mb: 1 }}>
              <Typography><strong>{c.name}</strong>{c.amount ? ` - ${c.amount}` : ''}</Typography>
              {c.address && <Typography variant="body2" sx={{ color: 'text.secondary' }}>{c.address}</Typography>}
            </Box>
          ))}
        </Box>
      )}

      {dependents.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" sx={{ mb: 1, color: '#1a237e' }}>Dependents</Typography>
          {dependents.map((d, i) => (
            <Typography key={i}>{d.name} ({d.relationship})</Typography>
          ))}
        </Box>
      )}

      {pets.length > 0 && (
        <Box>
          <Typography variant="h6" sx={{ mb: 1, color: '#1a237e' }}>Pet Care Instructions</Typography>
          {pets.map((pet, i) => (
            <Box key={i} sx={{ mb: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                {str(pet.petName, `Pet ${i + 1}`)} ({str(pet.petType, 'Unknown')}{pet.breed ? ` - ${str(pet.breed)}` : ''})
              </Typography>
              {!!pet.vetName && <Typography variant="body2"><strong>Vet:</strong> {str(pet.vetName)} - {str(pet.vetPhone)}</Typography>}
              {!!pet.feedingSchedule && <Typography variant="body2"><strong>Feeding:</strong> {str(pet.feedingSchedule)}</Typography>}
              {!!pet.medications && <Typography variant="body2"><strong>Medications:</strong> {str(pet.medications)}</Typography>}
              {!!pet.preferredCaretaker && <Typography variant="body2"><strong>Preferred Caretaker:</strong> {str(pet.preferredCaretaker)}</Typography>}
              {!!pet.caretakerInstructions && <Typography variant="body2"><strong>Care Instructions:</strong> {str(pet.caretakerInstructions)}</Typography>}
              {!!pet.emergencyContact && <Typography variant="body2"><strong>Emergency Contact:</strong> {str(pet.emergencyContact)} - {str(pet.emergencyContactPhone)}</Typography>}
            </Box>
          ))}
        </Box>
      )}
    </ReportLayout>
  );
};

export default FamilyOverview;
