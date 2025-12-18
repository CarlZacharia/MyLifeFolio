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
import { ChildData } from './ChildModals';

interface ChildrenSummaryTableProps {
  children: ChildData[];
  onEdit: (index: number) => void;
  onAdd: () => void;
  showSpouse: boolean;
}

type ChildGroup = 'client' | 'spouse' | 'both';

const GROUP_LABELS: Record<ChildGroup, string> = {
  client: 'Children of Client',
  spouse: 'Children of Spouse',
  both: 'Children of Both',
};

const getChildGroup = (relationship: string): ChildGroup => {
  if (relationship.includes('Both')) return 'both';
  if (relationship.includes('Spouse') && !relationship.includes('Client')) return 'spouse';
  return 'client';
};

interface GroupedChild {
  child: ChildData;
  originalIndex: number;
}

interface ChildTableProps {
  title: string;
  children: GroupedChild[];
  onEdit: (index: number) => void;
}

const ChildTable: React.FC<ChildTableProps> = ({ title, children, onEdit }) => {
  if (children.length === 0) return null;

  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#1a237e', mb: 1 }}>
        {title} ({children.length})
      </Typography>
      <TableContainer component={Paper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: '#f5f5f5' }}>
              <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Birth Date</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Marital Status</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Distribution</TableCell>
              <TableCell sx={{ fontWeight: 600, width: 60 }}>Edit</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {children.map(({ child, originalIndex }) => (
              <TableRow
                key={originalIndex}
                sx={{
                  '&:hover': { bgcolor: '#f5f5f5', cursor: 'pointer' },
                  ...(child.disinherit && { bgcolor: '#ffebee' }),
                }}
                onClick={() => onEdit(originalIndex)}
              >
                <TableCell>
                  {child.name}
                  {child.disinherit && (
                    <Typography component="span" sx={{ color: 'error.main', ml: 1, fontSize: '0.75rem' }}>
                      (Disinherited)
                    </Typography>
                  )}
                </TableCell>
                <TableCell>{child.birthDate || '-'}</TableCell>
                <TableCell>{child.maritalStatus || '-'}</TableCell>
                <TableCell>{child.distributionType || '-'}</TableCell>
                <TableCell>
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(originalIndex);
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

const ChildrenSummaryTable: React.FC<ChildrenSummaryTableProps> = ({
  children,
  onEdit,
  onAdd,
  showSpouse,
}) => {
  // Group children by relationship
  const groupedChildren: Record<ChildGroup, GroupedChild[]> = {
    client: [],
    spouse: [],
    both: [],
  };

  children.forEach((child, index) => {
    const group = getChildGroup(child.relationship);
    groupedChildren[group].push({ child, originalIndex: index });
  });

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
        <Typography variant="h6" sx={{ fontWeight: 600, color: '#1a237e' }}>
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

      {/* Children of Client - always shown */}
      <ChildTable
        title={GROUP_LABELS.client}
        children={groupedChildren.client}
        onEdit={onEdit}
      />

      {/* Children of Spouse - only shown if showSpouse is true */}
      {showSpouse && (
        <ChildTable
          title={GROUP_LABELS.spouse}
          children={groupedChildren.spouse}
          onEdit={onEdit}
        />
      )}

      {/* Children of Both - only shown if showSpouse is true */}
      {showSpouse && (
        <ChildTable
          title={GROUP_LABELS.both}
          children={groupedChildren.both}
          onEdit={onEdit}
        />
      )}
    </Box>
  );
};

export default ChildrenSummaryTable;
