import React from 'react';
import { Typography, Box, Table, TableBody, TableCell, TableHead, TableRow, Chip } from '@mui/material';
import ReportLayout, { ReportSectionTitle } from './ReportLayout';
import { str, BaseReportProps } from './reportHelpers';

interface FamilyOverviewProps extends BaseReportProps {}

const body = { fontSize: '12px', fontFamily: '"Jost", sans-serif' } as const;
const thCell = { fontWeight: 600, fontSize: '12px', fontFamily: '"Jost", sans-serif' } as const;

const FamilyOverview: React.FC<FamilyOverviewProps> = ({ data, ownerName, embedded }) => {
  const children = (data.children || []) as Array<Record<string, unknown>>;
  const otherBeneficiaries = (data.otherBeneficiaries || []) as Array<Record<string, string>>;
  const pets = (data.pets || []) as Array<Record<string, unknown>>;
  const dependents = (data.dependents || []) as Array<Record<string, string>>;
  const charities = (data.charities || []) as Array<Record<string, string>>;

  const content = (
    <>
      {children.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <ReportSectionTitle>Children</ReportSectionTitle>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={thCell}>Name</TableCell>
                <TableCell sx={thCell}>Age</TableCell>
                <TableCell sx={thCell}>Relationship</TableCell>
                <TableCell sx={thCell}>Marital Status</TableCell>
                <TableCell sx={thCell}>Has Children</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {children.map((c, i) => (
                <TableRow key={i}>
                  <TableCell sx={body}>
                    {str(c.name)}
                    {!!c.isDeceased && <Chip label="Deceased" size="small" sx={{ ml: 1 }} />}
                  </TableCell>
                  <TableCell sx={body}>{str(c.age)}</TableCell>
                  <TableCell sx={body}>{str(c.relationship)}</TableCell>
                  <TableCell sx={body}>{str(c.maritalStatus)}</TableCell>
                  <TableCell sx={body}>{c.hasChildren ? `Yes (${c.numberOfChildren})` : 'No'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      )}

      {otherBeneficiaries.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <ReportSectionTitle>Other Beneficiaries</ReportSectionTitle>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={thCell}>Name</TableCell>
                <TableCell sx={thCell}>Relationship</TableCell>
                <TableCell sx={thCell}>Notes</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {otherBeneficiaries.map((b, i) => (
                <TableRow key={i}>
                  <TableCell sx={body}>{b.name || 'N/A'}</TableCell>
                  <TableCell sx={body}>{b.relationship || b.relationshipOther || 'N/A'}</TableCell>
                  <TableCell sx={body}>{b.notes || ''}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      )}

      {charities.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <ReportSectionTitle>Charitable Beneficiaries</ReportSectionTitle>
          {charities.map((c, i) => (
            <Box key={i} sx={{ mb: 1 }}>
              <Typography sx={body}><strong>{c.name}</strong>{c.amount ? ` - ${c.amount}` : ''}</Typography>
              {c.address && <Typography sx={{ ...body, color: 'text.secondary' }}>{c.address}</Typography>}
            </Box>
          ))}
        </Box>
      )}

      {dependents.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <ReportSectionTitle>Dependents</ReportSectionTitle>
          {dependents.map((d, i) => (
            <Typography key={i} sx={body}>{d.name} ({d.relationship})</Typography>
          ))}
        </Box>
      )}

      {pets.length > 0 && (
        <Box>
          <ReportSectionTitle>Pet Care Instructions</ReportSectionTitle>
          {pets.map((pet, i) => (
            <Box key={i} sx={{ mb: 2, p: 2, bgcolor: '#f9f5ef', borderRadius: 1, border: '1px solid #e8ddd0' }}>
              <Typography sx={{ fontFamily: '"Jost", sans-serif', fontSize: '13px', fontWeight: 600, color: '#8b6914' }}>
                {str(pet.petName, `Pet ${i + 1}`)} ({str(pet.petType, 'Unknown')}{pet.breed ? ` - ${str(pet.breed)}` : ''})
              </Typography>
              {!!pet.vetName && <Typography sx={body}><strong>Vet:</strong> {str(pet.vetName)} - {str(pet.vetPhone)}</Typography>}
              {!!pet.feedingSchedule && <Typography sx={body}><strong>Feeding:</strong> {str(pet.feedingSchedule)}</Typography>}
              {!!pet.medications && <Typography sx={body}><strong>Medications:</strong> {str(pet.medications)}</Typography>}
              {!!pet.preferredCaretaker && <Typography sx={body}><strong>Preferred Caretaker:</strong> {str(pet.preferredCaretaker)}</Typography>}
              {!!pet.caretakerInstructions && <Typography sx={body}><strong>Care Instructions:</strong> {str(pet.caretakerInstructions)}</Typography>}
              {!!pet.emergencyContact && <Typography sx={body}><strong>Emergency Contact:</strong> {str(pet.emergencyContact)} - {str(pet.emergencyContactPhone)}</Typography>}
            </Box>
          ))}
        </Box>
      )}
    </>
  );

  if (embedded) return content;

  return (
    <ReportLayout title="Family Overview" ownerName={ownerName}>
      {content}
    </ReportLayout>
  );
};

export default FamilyOverview;
