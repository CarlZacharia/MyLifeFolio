'use client';

import React, { useState } from 'react';
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
import { ChildData } from './ChildModals';
import { VideoHelpIcon } from './FieldWithHelp';
import HelpModal from './HelpModal';

// Format date from yyyy-mm-dd to mm/dd/yyyy
const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString) return '-';
  // Handle both Date objects (from DatePicker) and strings
  const date = typeof dateString === 'string' ? dateString : String(dateString);
  // Check if it's in yyyy-mm-dd format
  const match = date.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (match) {
    return `${match[2]}/${match[3]}/${match[1]}`;
  }
  return date;
};

// Calculate age from birth date
const calculateAge = (dateString: string | null | undefined): string => {
  if (!dateString) return '-';

  // Parse the date string (handles yyyy-mm-dd format)
  const date = typeof dateString === 'string' ? dateString : String(dateString);
  const match = date.match(/^(\d{4})-(\d{2})-(\d{2})/);

  if (!match) return '-';

  const birthDate = new Date(parseInt(match[1]), parseInt(match[2]) - 1, parseInt(match[3]));
  const today = new Date();

  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  // Adjust age if birthday hasn't occurred yet this year
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  return age >= 0 ? String(age) : '-';
};

interface ChildrenSummaryTableProps {
  children: ChildData[];
  onEdit: (index: number) => void;
  onAdd: () => void;
}

const ChildrenSummaryTable: React.FC<ChildrenSummaryTableProps> = ({
  children,
  onEdit,
  onAdd,
}) => {
  const [helpOpen, setHelpOpen] = useState(false);

  if (children.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
          No children added yet.
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={onAdd}
          sx={{ bgcolor: '#1a237e' }}
        >
          Add Child
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography variant="h4" sx={{ fontWeight: 600, color: '#1a237e' }}>
            Children ({children.length})
          </Typography>
          <VideoHelpIcon helpId={101} onClick={() => setHelpOpen(true)} size="medium" />
        </Box>
        <Button
          variant="outlined"
          startIcon={<AddIcon />}
          onClick={onAdd}
          size="small"
        >
          Add Child
        </Button>
      </Box>

      <HelpModal
        open={helpOpen}
        onClose={() => setHelpOpen(false)}
        helpId={101}
      />

      <TableContainer component={Paper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: '#f5f5f5' }}>
              <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Relationship</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Birth Date</TableCell>
              <TableCell sx={{ fontWeight: 600, width: 60 }}>Age</TableCell>
              <TableCell sx={{ fontWeight: 600, width: 60 }}>Edit</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {children.map((child, index) => (
              <TableRow
                key={index}
                sx={{
                  '&:hover': { bgcolor: '#f5f5f5', cursor: 'pointer' },
                }}
                onClick={() => onEdit(index)}
              >
                <TableCell>{child.name}</TableCell>
                <TableCell>{child.relationship || '-'}</TableCell>
                <TableCell>{formatDate(child.birthDate)}</TableCell>
                <TableCell>{calculateAge(child.birthDate)}</TableCell>
                <TableCell>
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(index);
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

export default ChildrenSummaryTable;
