'use client';

import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Checkbox,
  Chip,
  Divider,
  Alert,
  AlertTitle,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Button,
} from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import SavingsIcon from '@mui/icons-material/Savings';
import SecurityIcon from '@mui/icons-material/Security';
import DescriptionIcon from '@mui/icons-material/Description';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import PrintIcon from '@mui/icons-material/Print';
import DownloadIcon from '@mui/icons-material/Download';

import { TrustCenteredPlan, AssetRetitling, BeneficiaryChange } from './trustPlanTypes';
import { formatCurrency } from './trustPlanUtils';

interface FundingChecklistProps {
  plan: TrustCenteredPlan;
  trustName: string;
}

interface ChecklistItem {
  id: string;
  category: 'deed' | 'bank' | 'investment' | 'retirement' | 'insurance' | 'other';
  action: string;
  details: string;
  institution?: string;
  value: number;
  completed: boolean;
}

const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'deed':
      return <HomeIcon />;
    case 'bank':
      return <AccountBalanceIcon />;
    case 'investment':
      return <AccountBalanceIcon />;
    case 'retirement':
      return <SavingsIcon />;
    case 'insurance':
      return <SecurityIcon />;
    default:
      return <DescriptionIcon />;
  }
};

const getCategoryColor = (category: string): 'primary' | 'success' | 'warning' | 'info' | 'secondary' => {
  switch (category) {
    case 'deed':
      return 'primary';
    case 'bank':
      return 'success';
    case 'investment':
      return 'info';
    case 'retirement':
      return 'warning';
    case 'insurance':
      return 'secondary';
    default:
      return 'primary';
  }
};

export const FundingChecklistComponent: React.FC<FundingChecklistProps> = ({ plan, trustName }) => {
  // Build checklist items from accepted recommendations
  const checklistItems: ChecklistItem[] = [];

  // Add retitling items
  plan.assetsToRetitle.filter(a => a.accepted).forEach((retitling) => {
    let category: ChecklistItem['category'] = 'other';
    if (retitling.assetId.startsWith('realEstate')) category = 'deed';
    else if (retitling.assetId.startsWith('bankAccount')) category = 'bank';
    else if (retitling.assetId.startsWith('nonQualified')) category = 'investment';

    checklistItems.push({
      id: retitling.assetId,
      category,
      action: retitling.method === 'deed' ? 'Record new deed' : 'Retitle account',
      details: retitling.assetDescription,
      value: retitling.assetValue,
      completed: false,
    });
  });

  // Add beneficiary change items
  plan.beneficiaryChanges.filter(a => a.accepted).forEach((change) => {
    let category: ChecklistItem['category'] = 'other';
    if (change.assetId.startsWith('retirement')) category = 'retirement';
    else if (change.assetId.startsWith('lifeInsurance')) category = 'insurance';
    else if (change.assetId.startsWith('bank')) category = 'bank';
    else if (change.assetId.startsWith('nonQualified')) category = 'investment';

    checklistItems.push({
      id: change.assetId,
      category,
      action: 'Update beneficiary designation',
      details: `${change.assetDescription} → ${change.proposedBeneficiary}`,
      value: change.assetValue,
      completed: false,
    });
  });

  // Group by category
  const itemsByCategory = checklistItems.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, ChecklistItem[]>);

  const categoryLabels: Record<string, string> = {
    deed: 'Real Estate - Deeds to Record',
    bank: 'Bank Accounts',
    investment: 'Investment Accounts',
    retirement: 'Retirement Accounts',
    insurance: 'Life Insurance Policies',
    other: 'Other Assets',
  };

  const categoryInstructions: Record<string, string> = {
    deed: 'Contact your attorney to prepare and record a new deed transferring the property to the trust. The deed must be recorded in the county where the property is located.',
    bank: 'Visit or contact your bank to retitle the account to the trust. You will need to provide a Certificate of Trust or the full trust document.',
    investment: 'Contact your financial advisor or brokerage to retitle the account to the trust. They will have specific forms to complete.',
    retirement: 'Complete a new beneficiary designation form with your plan administrator. Note: IRAs and 401(k)s should NOT be retitled to the trust - only the beneficiary designation should change.',
    insurance: 'Contact your insurance company to update the beneficiary designation. Request a change of beneficiary form.',
    other: 'Complete an Assignment of Personal Property to Trust form to transfer ownership of tangible personal property.',
  };

  return (
    <Box>
      {/* Header */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 3,
          background: 'linear-gradient(135deg, #fff8e1 0%, #ffecb3 100%)',
          borderRadius: 2,
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 600, color: '#f57c00', display: 'flex', alignItems: 'center', gap: 1 }}>
              <AssignmentTurnedInIcon /> Trust Funding Checklist
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Complete these tasks to properly fund the <strong>{trustName}</strong>
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              startIcon={<PrintIcon />}
              onClick={() => window.print()}
              size="small"
            >
              Print
            </Button>
          </Box>
        </Box>

        {/* Summary stats */}
        <Box sx={{ display: 'flex', gap: 4, mt: 3, flexWrap: 'wrap' }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#e65100' }}>
              {checklistItems.length}
            </Typography>
            <Typography variant="body2" color="text.secondary">Tasks to Complete</Typography>
          </Box>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#e65100' }}>
              {formatCurrency(checklistItems.reduce((sum, item) => sum + item.value, 0))}
            </Typography>
            <Typography variant="body2" color="text.secondary">Total Value to Transfer</Typography>
          </Box>
        </Box>
      </Paper>

      {/* Important Notes */}
      <Alert severity="info" sx={{ mb: 3 }}>
        <AlertTitle>Important Notes on Trust Funding</AlertTitle>
        <List dense sx={{ mt: 1 }}>
          <ListItem sx={{ py: 0 }}>
            <ListItemText
              primary="• The trust is only effective for assets that are properly transferred to it"
            />
          </ListItem>
          <ListItem sx={{ py: 0 }}>
            <ListItemText
              primary="• Retirement accounts (IRA, 401k) should NOT be retitled to the trust - only change the beneficiary"
            />
          </ListItem>
          <ListItem sx={{ py: 0 }}>
            <ListItemText
              primary="• You will need a Certificate of Trust or copy of the trust document for most institutions"
            />
          </ListItem>
          <ListItem sx={{ py: 0 }}>
            <ListItemText
              primary="• Some changes may require notarization or witness signatures"
            />
          </ListItem>
        </List>
      </Alert>

      {/* Checklist by Category */}
      {Object.entries(itemsByCategory).map(([category, items]) => (
        <Paper key={category} elevation={0} sx={{ mb: 3, border: '1px solid', borderColor: 'divider', borderRadius: 2, overflow: 'hidden' }}>
          {/* Category Header */}
          <Box
            sx={{
              p: 2,
              bgcolor: 'grey.100',
              display: 'flex',
              alignItems: 'center',
              gap: 2,
            }}
          >
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                bgcolor: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {getCategoryIcon(category)}
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                {categoryLabels[category]}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {items.length} item(s) • {formatCurrency(items.reduce((sum, i) => sum + i.value, 0))}
              </Typography>
            </Box>
          </Box>

          {/* Category Instructions */}
          <Box sx={{ px: 2, py: 1.5, bgcolor: 'grey.50' }}>
            <Typography variant="body2" color="text.secondary">
              {categoryInstructions[category]}
            </Typography>
          </Box>

          <Divider />

          {/* Items Table */}
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox" sx={{ width: 50 }}>Done</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Action</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Asset/Account</TableCell>
                  <TableCell sx={{ fontWeight: 600 }} align="right">Value</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id} hover>
                    <TableCell padding="checkbox">
                      <Checkbox size="small" />
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={item.action}
                        color={getCategoryColor(category)}
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{item.details}</Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2">{formatCurrency(item.value)}</Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      ))}

      {/* Personal Property Assignment */}
      <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
          <DescriptionIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
          Assignment of Personal Property
        </Typography>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Sign the Assignment of Personal Property to Trust document to transfer ownership of all
          tangible personal property (furniture, jewelry, artwork, collectibles, etc.) to the trust.
          This is a single document that covers all personal property.
        </Typography>

        <Box sx={{ display: 'flex', gap: 1 }}>
          <Chip label="One-time document" size="small" />
          <Chip label="Covers future acquisitions" size="small" />
          <Chip label="No recording required" size="small" />
        </Box>
      </Paper>

      {/* Print-friendly note */}
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 3, textAlign: 'center' }}>
        Print this checklist and check off items as you complete them.
        Keep a copy with your trust documents.
      </Typography>
    </Box>
  );
};

export default FundingChecklistComponent;
