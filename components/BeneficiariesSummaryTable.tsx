'use client';

import React from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Button,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import { BeneficiaryData, CharityData } from './BeneficiaryModals';
import { folioColors } from './FolioModal';

interface BeneficiariesSummaryTableProps {
  beneficiaries: BeneficiaryData[];
  onEditBeneficiary: (index: number) => void;
  onAddBeneficiary: () => void;
}

export const BeneficiariesSummaryTable: React.FC<BeneficiariesSummaryTableProps> = ({
  beneficiaries,
  onEditBeneficiary,
  onAddBeneficiary,
}) => {
  if (beneficiaries.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
          No other family members added yet.
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={onAddBeneficiary}
          sx={{ bgcolor: folioColors.ink }}
        >
          Add Other Family Member
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, color: folioColors.ink }}>
          Other Family Members ({beneficiaries.length})
        </Typography>
        <Button
          variant="outlined"
          startIcon={<AddIcon />}
          onClick={onAddBeneficiary}
          size="small"
        >
          Add Other Family Member
        </Button>
      </Box>

      <TableContainer component={Paper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: folioColors.cream }}>
              <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Relationship</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Age</TableCell>
              <TableCell sx={{ fontWeight: 600, width: 60 }}>Edit</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {beneficiaries.map((beneficiary, index) => (
              <TableRow
                key={index}
                sx={{
                  '&:hover': { bgcolor: folioColors.cream, cursor: 'pointer' },
                }}
                onClick={() => onEditBeneficiary(index)}
              >
                <TableCell>{beneficiary.name}</TableCell>
                <TableCell>
                  {beneficiary.relationship === 'Other' && beneficiary.relationshipOther
                    ? beneficiary.relationshipOther
                    : beneficiary.relationship || '-'}
                </TableCell>
                <TableCell>{beneficiary.age|| '-'}</TableCell>
                <TableCell>
                  <IconButton 
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditBeneficiary(index);
                    }}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

interface CharitiesSummaryTableProps {
  charities: CharityData[];
  onEditCharity: (index: number) => void;
  onAddCharity: () => void;
}

export const CharitiesSummaryTable: React.FC<CharitiesSummaryTableProps> = ({
  charities,
  onEditCharity,
  onAddCharity,
}) => {
  if (charities.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
          No charities added yet.
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={onAddCharity}
          sx={{ bgcolor: folioColors.ink }}
        >
          Add Charity
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, color: folioColors.ink }}>
          Charities ({charities.length})
        </Typography>
        <Button
          variant="outlined"
          startIcon={<AddIcon />}
          onClick={onAddCharity}
          size="small"
        >
          Add Charity
        </Button>
      </Box>

      <TableContainer component={Paper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: folioColors.cream }}>
              <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Amount</TableCell>
              <TableCell sx={{ fontWeight: 600, width: 60 }}>Edit</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {charities.map((charity, index) => (
              <TableRow
                key={index}
                sx={{
                  '&:hover': { bgcolor: folioColors.cream, cursor: 'pointer' },
                }}
                onClick={() => onEditCharity(index)}
              >
                <TableCell>{charity.name}</TableCell>
                <TableCell>{charity.amount || '-'}</TableCell>
                <TableCell>
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditCharity(index);
                    }}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default { BeneficiariesSummaryTable, CharitiesSummaryTable };
