'use client';

import React, { useState, useMemo } from 'react';
import {
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Chip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useFormContext } from '../lib/FormContext';
import { folioColors } from './FolioModal';
import DebtModal, { DebtData } from './DebtModal';

const formatCurrency = (value: string): string => {
  if (!value) return '-';
  const cleaned = value.replace(/[$,\s]/g, '');
  const num = parseFloat(cleaned);
  if (isNaN(num)) return value;
  return `$${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

interface DerivedDebt {
  type: string;
  description: string;
  amount: string;
  source: 'mortgage' | 'vehicle';
  sourceIndex: number;
}

const DebtsTab = () => {
  const { formData, updateFormData } = useFormContext();

  const [modalOpen, setModalOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);

  // Derive mortgage debts from real estate entries with a mortgage balance
  const mortgageDebts = useMemo((): DerivedDebt[] => {
    return formData.realEstate
      .map((re, i) => ({ ...re, idx: i }))
      .filter((re) => {
        const cleaned = re.mortgageBalance?.replace(/[$,\s]/g, '') || '';
        const num = parseFloat(cleaned);
        return !isNaN(num) && num > 0;
      })
      .map((re) => {
        const address = [re.street, re.city, re.state].filter(Boolean).join(', ');
        return {
          type: 'Mortgage',
          description: address || `Property ${re.idx + 1}`,
          amount: re.mortgageBalance,
          source: 'mortgage' as const,
          sourceIndex: re.idx,
        };
      });
  }, [formData.realEstate]);

  // Derive vehicle loan debts from vehicles with an amount financed/owed
  const vehicleDebts = useMemo((): DerivedDebt[] => {
    return formData.vehicles
      .map((v, i) => ({ ...v, idx: i }))
      .filter((v) => {
        const cleaned = (v as any).amountFinancedOwed?.replace(/[$,\s]/g, '') || '';
        const num = parseFloat(cleaned);
        return !isNaN(num) && num > 0;
      })
      .map((v) => ({
        type: 'Vehicle Loan',
        description: (v as any).yearMakeModel || `Vehicle ${v.idx + 1}`,
        amount: (v as any).amountFinancedOwed,
        source: 'vehicle' as const,
        sourceIndex: v.idx,
      }));
  }, [formData.vehicles]);

  const derivedDebts = [...mortgageDebts, ...vehicleDebts];
  const manualDebts = formData.debts || [];

  const openAdd = () => {
    setIsEdit(false);
    setEditIndex(null);
    setModalOpen(true);
  };

  const openEdit = (index: number) => {
    setIsEdit(true);
    setEditIndex(index);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setIsEdit(false);
    setEditIndex(null);
  };

  const handleSave = (data: DebtData) => {
    if (isEdit && editIndex !== null) {
      const updated = [...manualDebts];
      updated[editIndex] = data;
      updateFormData({ debts: updated });
    } else {
      updateFormData({ debts: [...manualDebts, data] });
    }
  };

  const handleDelete = () => {
    if (editIndex !== null) {
      updateFormData({
        debts: manualDebts.filter((_, i) => i !== editIndex),
      });
      closeModal();
    }
  };

  const getEditData = (): DebtData | undefined => {
    if (!isEdit || editIndex === null) return undefined;
    return manualDebts[editIndex] as DebtData;
  };

  // Compute total
  const parseAmount = (val: string) => {
    const cleaned = val?.replace(/[$,\s]/g, '') || '';
    const num = parseFloat(cleaned);
    return isNaN(num) ? 0 : num;
  };

  const totalDerived = derivedDebts.reduce((sum, d) => sum + parseAmount(d.amount), 0);
  const totalManual = manualDebts.reduce((sum, d) => sum + parseAmount(d.amount), 0);
  const grandTotal = totalDerived + totalManual;

  const hasAny = derivedDebts.length > 0 || manualDebts.length > 0;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          Mortgages and vehicle loans are automatically pulled from your assets.
        </Typography>
        <Button
          variant="outlined"
          startIcon={<AddIcon />}
          onClick={openAdd}
          size="small"
        >
          Add Debt
        </Button>
      </Box>

      {hasAny ? (
        <>
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: 'grey.100' }}>
                  <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Description</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Date Incurred</TableCell>
                  <TableCell sx={{ fontWeight: 600 }} align="right">Amount</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {/* Derived debts (read-only) */}
                {derivedDebts.length > 0 && (
                  <>
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        sx={{
                          bgcolor: folioColors.ink,
                          color: 'white',
                          fontWeight: 700,
                          fontSize: '0.85rem',
                          py: 0.75,
                          letterSpacing: '0.03em',
                        }}
                      >
                        From Assets
                      </TableCell>
                    </TableRow>
                    {derivedDebts.map((debt, i) => (
                      <TableRow key={`derived-${debt.source}-${debt.sourceIndex}`}>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {debt.type}
                            <Chip label="Auto" size="small" sx={{ fontSize: '0.7rem', height: 20 }} />
                          </Box>
                        </TableCell>
                        <TableCell>{debt.description}</TableCell>
                        <TableCell>-</TableCell>
                        <TableCell align="right">{formatCurrency(debt.amount)}</TableCell>
                      </TableRow>
                    ))}
                  </>
                )}

                {/* Manual debts (editable) */}
                {manualDebts.length > 0 && (
                  <>
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        sx={{
                          bgcolor: folioColors.ink,
                          color: 'white',
                          fontWeight: 700,
                          fontSize: '0.85rem',
                          py: 0.75,
                          letterSpacing: '0.03em',
                        }}
                      >
                        Other Debts
                      </TableCell>
                    </TableRow>
                    {manualDebts.map((debt, i) => (
                      <TableRow
                        key={`manual-${i}`}
                        hover
                        onClick={() => openEdit(i)}
                        sx={{ cursor: 'pointer' }}
                      >
                        <TableCell>{debt.type || '-'}</TableCell>
                        <TableCell>{debt.description || '-'}</TableCell>
                        <TableCell>{debt.dateIncurred || '-'}</TableCell>
                        <TableCell align="right">{formatCurrency(debt.amount)}</TableCell>
                      </TableRow>
                    ))}
                  </>
                )}

                {/* Total row */}
                <TableRow>
                  <TableCell
                    colSpan={3}
                    sx={{ fontWeight: 700, borderTop: '2px solid', borderColor: 'divider' }}
                  >
                    Total Debts
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{ fontWeight: 700, borderTop: '2px solid', borderColor: 'divider' }}
                  >
                    {formatCurrency(`$${grandTotal.toFixed(2)}`)}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </>
      ) : (
        <Paper variant="outlined" sx={{ p: 4, textAlign: 'center' }}>
          <Typography color="text.secondary">
            No debts recorded yet. Mortgage balances and vehicle loans will appear automatically when entered on your assets. Use the button above to add other debts.
          </Typography>
        </Paper>
      )}

      <DebtModal
        open={modalOpen}
        onClose={closeModal}
        onSave={handleSave}
        onDelete={isEdit ? handleDelete : undefined}
        initialData={getEditData()}
        isEdit={isEdit}
      />
    </Box>
  );
};

export default DebtsTab;
