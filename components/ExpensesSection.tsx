'use client';

import React, { useState } from 'react';
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
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useFormContext } from '../lib/FormContext';
import { EXPENSE_CATEGORIES } from '../lib/expenseCategories';
import ExpenseModal, { ExpenseData } from './ExpenseModal';

const formatCurrency = (value: string): string => {
  if (!value) return '-';
  const cleaned = value.replace(/[$,\s]/g, '');
  const num = parseFloat(cleaned);
  if (isNaN(num)) return value;
  return `$${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const ExpensesSection = () => {
  const { formData, updateFormData } = useFormContext();

  const [modalOpen, setModalOpen] = useState(false);
  const [modalCategory, setModalCategory] = useState<string>('');
  const [isEdit, setIsEdit] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);

  const openAdd = (category: string) => {
    setModalCategory(category);
    setIsEdit(false);
    setEditIndex(null);
    setModalOpen(true);
  };

  const openEdit = (index: number) => {
    setIsEdit(true);
    setEditIndex(index);
    setModalCategory(formData.expenses[index].category);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setIsEdit(false);
    setEditIndex(null);
  };

  const handleSave = (data: ExpenseData) => {
    if (isEdit && editIndex !== null) {
      const updated = [...formData.expenses];
      updated[editIndex] = data;
      updateFormData({ expenses: updated });
    } else {
      updateFormData({ expenses: [...formData.expenses, data] });
    }
  };

  const handleDelete = () => {
    if (editIndex !== null) {
      updateFormData({
        expenses: formData.expenses.filter((_, i) => i !== editIndex),
      });
      closeModal();
    }
  };

  const getEditData = (): ExpenseData | undefined => {
    if (!isEdit || editIndex === null) return undefined;
    return formData.expenses[editIndex] as ExpenseData;
  };

  // Group expenses by category
  const getExpensesForCategory = (categoryLabel: string) =>
    formData.expenses
      .map((e, i) => ({ ...e, originalIndex: i }))
      .filter((e) => e.category === categoryLabel);

  const hasAnyExpenses = formData.expenses.length > 0;

  return (
    <Box>
      {/* Add buttons row — one per category */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
        {EXPENSE_CATEGORIES.map((cat) => (
          <Button
            key={cat.label}
            variant="outlined"
            size="small"
            startIcon={<AddIcon />}
            onClick={() => openAdd(cat.label)}
          >
            {cat.label}
          </Button>
        ))}
      </Box>

      {hasAnyExpenses ? (
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: 'grey.100' }}>
                <TableCell sx={{ fontWeight: 600 }}>Expense Type</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Paid To</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Frequency</TableCell>
                <TableCell sx={{ fontWeight: 600, textAlign: 'right' }}>Amount</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {EXPENSE_CATEGORIES.map((cat) => {
                const expenses = getExpensesForCategory(cat.label);
                if (expenses.length === 0) return null;
                return (
                  <React.Fragment key={cat.label}>
                    {/* Category header row */}
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        sx={{
                          bgcolor: 'primary.main',
                          color: 'white',
                          fontWeight: 700,
                          fontSize: '0.85rem',
                          py: 0.75,
                          letterSpacing: '0.03em',
                        }}
                      >
                        {cat.label}
                      </TableCell>
                    </TableRow>
                    {/* Expense rows */}
                    {expenses.map((expense) => (
                      <TableRow
                        key={expense.originalIndex}
                        hover
                        onClick={() => openEdit(expense.originalIndex)}
                        sx={{ cursor: 'pointer' }}
                      >
                        <TableCell>{expense.expenseType || '-'}</TableCell>
                        <TableCell>{expense.paidTo || '-'}</TableCell>
                        <TableCell>{expense.frequency || '-'}</TableCell>
                        <TableCell sx={{ textAlign: 'right' }}>
                          {formatCurrency(expense.amount)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </React.Fragment>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Paper variant="outlined" sx={{ p: 4, textAlign: 'center' }}>
          <Typography color="text.secondary">
            No expenses added yet. Use the buttons above to add expenses by category.
          </Typography>
        </Paper>
      )}

      <ExpenseModal
        open={modalOpen}
        onClose={closeModal}
        onSave={handleSave}
        onDelete={isEdit ? handleDelete : undefined}
        initialData={getEditData()}
        isEdit={isEdit}
        category={modalCategory}
      />
    </Box>
  );
};

export default ExpensesSection;
