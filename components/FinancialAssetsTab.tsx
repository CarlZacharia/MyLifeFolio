'use client';

import React, { useMemo, useState } from 'react';
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
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import SavingsIcon from '@mui/icons-material/Savings';
import { useFormContext, MaritalStatus } from '../lib/FormContext';
import {
  BankAccountModal,
  NonQualifiedInvestmentModal,
  RetirementAccountModal,
  BankAccountData,
  NonQualifiedInvestmentData,
  RetirementAccountData,
  BeneficiaryOption,
  TrustFlags,
} from './AssetModals';

const SHOW_SPOUSE_STATUSES: MaritalStatus[] = ['Married', 'Second Marriage', 'Domestic Partnership'];

const formatCurrency = (value: string): string => {
  const num = parseFloat((value || '0').replace(/[^0-9.-]/g, ''));
  if (isNaN(num) || num === 0) return '-';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
};

type ModalType = 'bankAccount' | 'nonQualifiedInvestment' | 'retirementAccount' | null;

const FinancialAssetsTab = () => {
  const { formData, updateFormData } = useFormContext();
  const showSpouseInfo = SHOW_SPOUSE_STATUSES.includes(formData.maritalStatus);

  const [modalType, setModalType] = useState<ModalType>(null);
  const [isEdit, setIsEdit] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);

  const trustFlags: TrustFlags = useMemo(() => ({
    clientHasLivingTrust: formData.clientHasLivingTrust,
    clientHasIrrevocableTrust: formData.clientHasIrrevocableTrust,
    spouseHasLivingTrust: formData.spouseHasLivingTrust,
    spouseHasIrrevocableTrust: formData.spouseHasIrrevocableTrust,
  }), [formData.clientHasLivingTrust, formData.clientHasIrrevocableTrust, formData.spouseHasLivingTrust, formData.spouseHasIrrevocableTrust]);

  const beneficiaryOptions = useMemo((): BeneficiaryOption[] => {
    const options: BeneficiaryOption[] = [];
    if (showSpouseInfo && formData.spouseName) {
      options.push({ value: `spouse:${formData.spouseName}`, label: `${formData.spouseName} (Spouse)` });
    }
    if (formData.name) {
      options.push({ value: `client:${formData.name}`, label: `${formData.name} (Client)` });
    }
    formData.children.forEach((child, index) => {
      if (child.name) options.push({ value: `child:${index}:${child.name}`, label: `${child.name} (Child)` });
    });
    formData.otherBeneficiaries.forEach((b, index) => {
      if (b.name) {
        const label = b.relationship === 'Grandchild' ? `${b.name} (Grandchild)` : `${b.name} (${b.relationship || 'Other'})`;
        options.push({ value: `beneficiary:${index}:${b.name}`, label });
      }
    });
    if (formData.clientHasLivingTrust) options.push({ value: `trust:client-living:${formData.clientLivingTrustName || "Client's Living Trust"}`, label: `${formData.clientLivingTrustName || "Client's Living Trust"} (Living Trust)` });
    if (formData.clientHasIrrevocableTrust) options.push({ value: `trust:client-irrevocable:${formData.clientIrrevocableTrustName || "Client's Irrevocable Trust"}`, label: `${formData.clientIrrevocableTrustName || "Client's Irrevocable Trust"} (Irrevocable Trust)` });
    if (showSpouseInfo && formData.spouseHasLivingTrust) options.push({ value: `trust:spouse-living:${formData.spouseLivingTrustName || "Spouse's Living Trust"}`, label: `${formData.spouseLivingTrustName || "Spouse's Living Trust"} (Living Trust)` });
    if (showSpouseInfo && formData.spouseHasIrrevocableTrust) options.push({ value: `trust:spouse-irrevocable:${formData.spouseIrrevocableTrustName || "Spouse's Irrevocable Trust"}`, label: `${formData.spouseIrrevocableTrustName || "Spouse's Irrevocable Trust"} (Irrevocable Trust)` });
    return options;
  }, [showSpouseInfo, formData.spouseName, formData.name, formData.children, formData.otherBeneficiaries, formData.clientHasLivingTrust, formData.clientLivingTrustName, formData.clientHasIrrevocableTrust, formData.clientIrrevocableTrustName, formData.spouseHasLivingTrust, formData.spouseLivingTrustName, formData.spouseHasIrrevocableTrust, formData.spouseIrrevocableTrustName]);

  const openAdd = (type: ModalType) => { setModalType(type); setIsEdit(false); setEditIndex(null); };
  const openEdit = (type: ModalType, index: number) => { setModalType(type); setIsEdit(true); setEditIndex(index); };
  const closeModal = () => { setModalType(null); setIsEdit(false); setEditIndex(null); };

  // Save handlers
  const handleSaveBankAccount = (data: BankAccountData) => {
    if (isEdit && editIndex !== null) {
      const updated = [...formData.bankAccounts];
      updated[editIndex] = data;
      updateFormData({ bankAccounts: updated });
    } else {
      updateFormData({ bankAccounts: [...formData.bankAccounts, data] });
    }
  };
  const handleDeleteBankAccount = () => {
    if (editIndex !== null) {
      updateFormData({ bankAccounts: formData.bankAccounts.filter((_, i) => i !== editIndex) });
      closeModal();
    }
  };

  const handleSaveNonQualified = (data: NonQualifiedInvestmentData) => {
    if (isEdit && editIndex !== null) {
      const updated = [...formData.nonQualifiedInvestments];
      updated[editIndex] = data;
      updateFormData({ nonQualifiedInvestments: updated });
    } else {
      updateFormData({ nonQualifiedInvestments: [...formData.nonQualifiedInvestments, data] });
    }
  };
  const handleDeleteNonQualified = () => {
    if (editIndex !== null) {
      updateFormData({ nonQualifiedInvestments: formData.nonQualifiedInvestments.filter((_, i) => i !== editIndex) });
      closeModal();
    }
  };

  const handleSaveRetirement = (data: RetirementAccountData) => {
    if (isEdit && editIndex !== null) {
      const updated = [...formData.retirementAccounts];
      updated[editIndex] = data;
      updateFormData({ retirementAccounts: updated });
    } else {
      updateFormData({ retirementAccounts: [...formData.retirementAccounts, data] });
    }
  };
  const handleDeleteRetirement = () => {
    if (editIndex !== null) {
      updateFormData({ retirementAccounts: formData.retirementAccounts.filter((_, i) => i !== editIndex) });
      closeModal();
    }
  };

  const getEditData = () => {
    if (!isEdit || editIndex === null) return undefined;
    switch (modalType) {
      case 'bankAccount': return formData.bankAccounts[editIndex];
      case 'nonQualifiedInvestment': return formData.nonQualifiedInvestments[editIndex];
      case 'retirementAccount': return formData.retirementAccounts[editIndex];
      default: return undefined;
    }
  };

  // Compute totals
  const bankTotal = formData.bankAccounts.reduce((sum, a) => sum + (parseFloat((a.amount || '0').replace(/[^0-9.-]/g, '')) || 0), 0);
  const nqTotal = formData.nonQualifiedInvestments.reduce((sum, a) => sum + (parseFloat((a.value || '0').replace(/[^0-9.-]/g, '')) || 0), 0);
  const retTotal = formData.retirementAccounts.reduce((sum, a) => sum + (parseFloat((a.value || '0').replace(/[^0-9.-]/g, '')) || 0), 0);
  const grandTotal = bankTotal + nqTotal + retTotal;

  const fmtTotal = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n);

  const hasBankAccounts = formData.bankAccounts.length > 0;
  const hasNonQualified = formData.nonQualifiedInvestments.length > 0;
  const hasRetirement = formData.retirementAccounts.length > 0;
  const hasAny = hasBankAccounts || hasNonQualified || hasRetirement;

  return (
    <Box>
      {/* Add buttons row */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mb: 2, flexWrap: 'wrap' }}>
        <Button variant="outlined" startIcon={<AddIcon />} onClick={() => openAdd('bankAccount')} size="small">
          Add Bank Account
        </Button>
        <Button variant="outlined" startIcon={<AddIcon />} onClick={() => openAdd('nonQualifiedInvestment')} size="small">
          Add Non-Qualified Account
        </Button>
        <Button variant="outlined" startIcon={<AddIcon />} onClick={() => openAdd('retirementAccount')} size="small">
          Add Retirement Account
        </Button>
      </Box>

      {/* Unified table */}
      {hasAny ? (
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: 'grey.100' }}>
                <TableCell sx={{ fontWeight: 600 }}>Institution</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Type / Description</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Owner</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>Value</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {/* Bank Accounts section */}
              {hasBankAccounts && (
                <>
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      sx={{ bgcolor: '#e8f5e9', fontWeight: 700, fontSize: '0.9rem', py: 1.2, borderBottom: '2px solid #0a5c36' }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <AccountBalanceIcon sx={{ fontSize: 18, color: '#0a5c36' }} />
                        Bank Accounts
                        <Typography component="span" sx={{ ml: 'auto', fontWeight: 600, color: '#0a5c36', fontSize: '0.85rem' }}>
                          {fmtTotal(bankTotal)}
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                  {formData.bankAccounts.map((acct, i) => (
                    <TableRow
                      key={`bank-${i}`}
                      hover
                      onClick={() => openEdit('bankAccount', i)}
                      sx={{ cursor: 'pointer' }}
                    >
                      <TableCell>{acct.institution || '-'}</TableCell>
                      <TableCell>{acct.accountType || 'Bank Account'}</TableCell>
                      <TableCell>{acct.owner || '-'}</TableCell>
                      <TableCell align="right">{formatCurrency(acct.amount)}</TableCell>
                    </TableRow>
                  ))}
                </>
              )}

              {/* Non-Qualified Investments section */}
              {hasNonQualified && (
                <>
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      sx={{ bgcolor: '#e8f5e9', fontWeight: 700, fontSize: '0.9rem', py: 1.2, borderBottom: '2px solid #0a5c36' }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <TrendingUpIcon sx={{ fontSize: 18, color: '#0a5c36' }} />
                        Non-Qualified Investment Accounts
                        <Typography component="span" sx={{ ml: 'auto', fontWeight: 600, color: '#0a5c36', fontSize: '0.85rem' }}>
                          {fmtTotal(nqTotal)}
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                  {formData.nonQualifiedInvestments.map((inv, i) => (
                    <TableRow
                      key={`nq-${i}`}
                      hover
                      onClick={() => openEdit('nonQualifiedInvestment', i)}
                      sx={{ cursor: 'pointer' }}
                    >
                      <TableCell>{inv.institution || '-'}</TableCell>
                      <TableCell>{inv.description || '-'}</TableCell>
                      <TableCell>{inv.owner || '-'}</TableCell>
                      <TableCell align="right">{formatCurrency(inv.value)}</TableCell>
                    </TableRow>
                  ))}
                </>
              )}

              {/* Retirement Accounts section */}
              {hasRetirement && (
                <>
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      sx={{ bgcolor: '#e8f5e9', fontWeight: 700, fontSize: '0.9rem', py: 1.2, borderBottom: '2px solid #0a5c36' }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <SavingsIcon sx={{ fontSize: 18, color: '#0a5c36' }} />
                        IRAs &amp; Retirement Accounts
                        <Typography component="span" sx={{ ml: 'auto', fontWeight: 600, color: '#0a5c36', fontSize: '0.85rem' }}>
                          {fmtTotal(retTotal)}
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                  {formData.retirementAccounts.map((ret, i) => (
                    <TableRow
                      key={`ret-${i}`}
                      hover
                      onClick={() => openEdit('retirementAccount', i)}
                      sx={{ cursor: 'pointer' }}
                    >
                      <TableCell>{ret.institution || '-'}</TableCell>
                      <TableCell>{ret.accountType || '-'}</TableCell>
                      <TableCell>{ret.owner || '-'}</TableCell>
                      <TableCell align="right">{formatCurrency(ret.value)}</TableCell>
                    </TableRow>
                  ))}
                </>
              )}

              {/* Grand total */}
              <TableRow sx={{ bgcolor: '#0a5c36' }}>
                <TableCell colSpan={3} sx={{ fontWeight: 700, color: 'white', fontSize: '0.95rem' }}>
                  Total Financial Assets
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 700, color: 'white', fontSize: '0.95rem' }}>
                  {fmtTotal(grandTotal)}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Paper variant="outlined" sx={{ p: 4, textAlign: 'center' }}>
          <Typography color="text.secondary">
            No financial accounts added yet. Use the buttons above to add your first account.
          </Typography>
        </Paper>
      )}

      {/* Modals */}
      <BankAccountModal
        open={modalType === 'bankAccount'}
        onClose={closeModal}
        onSave={handleSaveBankAccount}
        onDelete={isEdit ? handleDeleteBankAccount : undefined}
        initialData={getEditData() as BankAccountData | undefined}
        beneficiaryOptions={beneficiaryOptions}
        isEdit={isEdit}
        showSpouse={showSpouseInfo}
        trustFlags={trustFlags}
      />
      <NonQualifiedInvestmentModal
        open={modalType === 'nonQualifiedInvestment'}
        onClose={closeModal}
        onSave={handleSaveNonQualified}
        onDelete={isEdit ? handleDeleteNonQualified : undefined}
        initialData={getEditData() as NonQualifiedInvestmentData | undefined}
        beneficiaryOptions={beneficiaryOptions}
        isEdit={isEdit}
        showSpouse={showSpouseInfo}
        trustFlags={trustFlags}
      />
      <RetirementAccountModal
        open={modalType === 'retirementAccount'}
        onClose={closeModal}
        onSave={handleSaveRetirement}
        onDelete={isEdit ? handleDeleteRetirement : undefined}
        initialData={getEditData() as RetirementAccountData | undefined}
        beneficiaryOptions={beneficiaryOptions}
        isEdit={isEdit}
        showSpouse={showSpouseInfo}
      />
    </Box>
  );
};

export default FinancialAssetsTab;
