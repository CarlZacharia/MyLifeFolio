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
  Chip,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import { ChildData } from './ChildModals';

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
        <Typography variant="h4" sx={{ fontWeight: 600, color: '#1a237e' }}>
          Children ({children.length})
        </Typography>
        <Button
          variant="outlined"
          startIcon={<AddIcon />}
          onClick={onAdd}
          size="small"
        >
          Add Child
        </Button>
      </Box>

      <TableContainer component={Paper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: '#f5f5f5' }}>
              <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Relationship</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Birth Date</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
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
                <TableCell>{child.birthDate || '-'}</TableCell>
                <TableCell>
                  {child.disinherit && (
                    <Chip
                      label="Disinherited"
                      size="small"
                      color="error"
                      variant="outlined"
                    />
                  )}
                </TableCell>
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
