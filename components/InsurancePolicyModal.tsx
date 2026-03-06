'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  MenuItem,
  IconButton,
  FormControlLabel,
  Switch,
  Typography,
  Divider,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

export const COVERAGE_TYPES = [
  'Vehicle',
  'Homeowners',
  'Long-Term Care',
  'Disability',
  'Life',
  'Umbrella',
  'Other',
] as const;

export const LTC_POLICY_STATUSES = [
  'Active',
  'Lapsed',
  'Paid-Up',
  'Claim in Progress',
] as const;

export const LTC_BENEFIT_PERIODS = [
  '2 Years',
  '3 Years',
  '5 Years',
  'Unlimited',
] as const;

export const LTC_INFLATION_TYPES = [
  'None',
  'Simple 3%',
  'Compound 3%',
  'Compound 5%',
  'CPI-Linked',
  'Future Purchase Option',
] as const;

export const LTC_ELIMINATION_PERIODS = [
  '0 Days',
  '30 Days',
  '60 Days',
  '90 Days',
  '180 Days',
] as const;

export const UMBRELLA_POLICY_TYPES = [
  'Personal Umbrella',
  'Commercial Umbrella',
  'Excess Liability',
] as const;

export const UMBRELLA_LIMITS = [
  '$1,000,000',
  '$2,000,000',
  '$3,000,000',
  '$5,000,000',
  '$10,000,000',
  'Other',
] as const;

export const HOMEOWNER_POLICY_TYPES = [
  'HO-3',
  'HO-5',
  'HO-6 Condo',
  'HO-4 Renters',
  'HO-8 Older Home',
  'Dwelling Fire',
] as const;

export interface InsurancePolicyData {
  person: 'client' | 'spouse';
  coverageType: string;
  policyNo: string;
  provider: string;
  annualCost: string;
  contactName: string;
  contactAddress: string;
  contactPhone: string;
  contactEmail: string;
  notes: string;
  // Vehicle-specific fields
  liabilityLimits?: string;
  hasCollision?: boolean;
  hasComprehensive?: boolean;
  comprehensiveDeductible?: string;
  uninsuredAmount?: string;
  underinsuredAmount?: string;
  medicalPaymentsAmount?: string;
  hasRentalInsurance?: boolean;
  // Homeowner's-specific fields
  hoPolicyType?: string;
  effectiveDate?: string;
  expirationDate?: string;
  autoRenewal?: boolean;
  propertyCovered?: string;
  coverageAmounts?: string;
  deductibles?: string;
  hurricaneWindDeductible?: string;
  hasScheduledPersonalProperty?: boolean;
  scheduledPersonalPropertyLimit?: string;
  hasFineArtsRider?: boolean;
  hasHomeBusinessEndorsement?: boolean;
  hasWaterBackup?: boolean;
  waterBackupLimit?: string;
  hasServiceLineCoverage?: boolean;
  hasEquipmentBreakdown?: boolean;
  hasIdentityTheftCoverage?: boolean;
  // Long-Term Care-specific fields
  ltcInsuredName?: string;
  ltcIssueDate?: string;
  ltcPolicyStatus?: string;
  ltcDailyBenefitAmount?: string;
  ltcMonthlyBenefitAmount?: string;
  ltcBenefitPeriod?: string;
  ltcMaxLifetimeBenefitPool?: string;
  ltcInflationProtectionType?: string;
  ltcCurrentBenefitAfterInflation?: string;
  ltcSharedCareRider?: boolean;
  ltcEliminationPeriod?: string;
  ltcCoversNursingFacility?: boolean;
  ltcCoversAssistedLiving?: boolean;
  ltcCoversMemoryCare?: boolean;
  ltcCoversAdultDayCare?: boolean;
  ltcCoversHomeHealthCare?: boolean;
  ltcCoversHospice?: boolean;
  ltcCoversFamilyCaregiver?: boolean;
  ltcHasBedReservation?: boolean;
  ltcBedReservationDays?: string;
  ltcAnnualPremium?: string;
  // Umbrella-specific fields
  umbPolicyType?: string;
  umbEffectiveDate?: string;
  umbExpirationDate?: string;
  umbLimit?: string;
  umbLimitOther?: string;
  umbSelfInsuredRetention?: string;
  umbAutoLiabilityRequired?: string;
  umbHomeownersLiabilityRequired?: string;
  umbHasWatercraftRequired?: boolean;
  umbWatercraftLimit?: string;
  umbHasRentalPropertyRequired?: boolean;
  umbRentalPropertyLimit?: string;
  umbOtherUnderlyingPolicies?: string;
  umbAllSameCarrier?: boolean;
  umbNamedInsured?: string;
  umbAdditionalInsureds?: string;
  umbAnnualPremium?: string;
}

export const emptyInsurancePolicy = (
  person: 'client' | 'spouse',
  coverageType: string = ''
): InsurancePolicyData => ({
  person,
  coverageType,
  policyNo: '',
  provider: '',
  annualCost: '',
  contactName: '',
  contactAddress: '',
  contactPhone: '',
  contactEmail: '',
  notes: '',
  liabilityLimits: '',
  hasCollision: false,
  hasComprehensive: false,
  comprehensiveDeductible: '',
  uninsuredAmount: '',
  underinsuredAmount: '',
  medicalPaymentsAmount: '',
  hasRentalInsurance: false,
  hoPolicyType: '',
  effectiveDate: '',
  expirationDate: '',
  autoRenewal: false,
  propertyCovered: '',
  coverageAmounts: '',
  deductibles: '',
  hurricaneWindDeductible: '',
  hasScheduledPersonalProperty: false,
  scheduledPersonalPropertyLimit: '',
  hasFineArtsRider: false,
  hasHomeBusinessEndorsement: false,
  hasWaterBackup: false,
  waterBackupLimit: '',
  hasServiceLineCoverage: false,
  hasEquipmentBreakdown: false,
  hasIdentityTheftCoverage: false,
  ltcInsuredName: '',
  ltcIssueDate: '',
  ltcPolicyStatus: '',
  ltcDailyBenefitAmount: '',
  ltcMonthlyBenefitAmount: '',
  ltcBenefitPeriod: '',
  ltcMaxLifetimeBenefitPool: '',
  ltcInflationProtectionType: '',
  ltcCurrentBenefitAfterInflation: '',
  ltcSharedCareRider: false,
  ltcEliminationPeriod: '',
  ltcCoversNursingFacility: false,
  ltcCoversAssistedLiving: false,
  ltcCoversMemoryCare: false,
  ltcCoversAdultDayCare: false,
  ltcCoversHomeHealthCare: false,
  ltcCoversHospice: false,
  ltcCoversFamilyCaregiver: false,
  ltcHasBedReservation: false,
  ltcBedReservationDays: '',
  ltcAnnualPremium: '',
  umbPolicyType: '',
  umbEffectiveDate: '',
  umbExpirationDate: '',
  umbLimit: '',
  umbLimitOther: '',
  umbSelfInsuredRetention: '',
  umbAutoLiabilityRequired: '',
  umbHomeownersLiabilityRequired: '',
  umbHasWatercraftRequired: false,
  umbWatercraftLimit: '',
  umbHasRentalPropertyRequired: false,
  umbRentalPropertyLimit: '',
  umbOtherUnderlyingPolicies: '',
  umbAllSameCarrier: false,
  umbNamedInsured: '',
  umbAdditionalInsureds: '',
  umbAnnualPremium: '',
});

interface InsurancePolicyModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: InsurancePolicyData) => void;
  onDelete?: () => void;
  initialData?: InsurancePolicyData;
  isEdit?: boolean;
  person: 'client' | 'spouse';
  coverageType?: string;
}

const InsurancePolicyModal: React.FC<InsurancePolicyModalProps> = ({
  open,
  onClose,
  onSave,
  onDelete,
  initialData,
  isEdit = false,
  person,
  coverageType,
}) => {
  const [data, setData] = useState<InsurancePolicyData>(
    initialData || emptyInsurancePolicy(person, coverageType)
  );
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const personLabel = person === 'spouse' ? 'Spouse' : 'Client';
  const typeLabel = data.coverageType || coverageType || 'Insurance';

  useEffect(() => {
    if (open) {
      setData(
        isEdit && initialData
          ? initialData
          : emptyInsurancePolicy(person, coverageType)
      );
      setTouched({});
    }
  }, [open, isEdit, initialData, person, coverageType]);

  const handleChange = (updates: Partial<InsurancePolicyData>) => {
    setData((prev) => ({ ...prev, ...updates }));
  };

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const providerError = touched.provider && !data.provider;
  const canSave = data.provider.length > 0;

  const handleSave = () => {
    if (!canSave) {
      setTouched({ provider: true });
      return;
    }
    onSave(data);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontWeight: 600,
        }}
      >
        {isEdit
          ? `Edit ${personLabel} ${typeLabel} Insurance`
          : `Add ${personLabel} ${typeLabel} Insurance`}
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
          {!coverageType && (
            <TextField
              select
              label="Coverage Type"
              value={data.coverageType}
              onChange={(e) => handleChange({ coverageType: e.target.value })}
              InputLabelProps={{ shrink: true }}
              fullWidth
              required
            >
              {COVERAGE_TYPES.map((type) => (
                <MenuItem key={type} value={type}>
                  {type}
                </MenuItem>
              ))}
            </TextField>
          )}

          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              label="Provider / Company"
              value={data.provider}
              onChange={(e) => handleChange({ provider: e.target.value })}
              onBlur={() => handleBlur('provider')}
              error={!!providerError}
              helperText={providerError ? 'Provider is required' : ''}
              required
              InputLabelProps={{ shrink: true }}
              sx={{ flex: 1 }}
            />
            <TextField
              label="Policy No."
              value={data.policyNo}
              onChange={(e) => handleChange({ policyNo: e.target.value })}
              InputLabelProps={{ shrink: true }}
              sx={{ flex: 1 }}
            />
          </Box>

          <TextField
            label="Annual Cost"
            value={data.annualCost}
            onChange={(e) => handleChange({ annualCost: e.target.value })}
            InputLabelProps={{ shrink: true }}
            placeholder="$0.00"
            fullWidth
          />

          <TextField
            label="Contact Name"
            value={data.contactName}
            onChange={(e) => handleChange({ contactName: e.target.value })}
            InputLabelProps={{ shrink: true }}
            fullWidth
          />

          <TextField
            label="Contact Address"
            value={data.contactAddress}
            onChange={(e) => handleChange({ contactAddress: e.target.value })}
            InputLabelProps={{ shrink: true }}
            fullWidth
          />

          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              label="Contact Telephone"
              value={data.contactPhone}
              onChange={(e) => handleChange({ contactPhone: e.target.value })}
              InputLabelProps={{ shrink: true }}
              sx={{ flex: 1 }}
            />
            <TextField
              label="Contact Email"
              value={data.contactEmail}
              onChange={(e) => handleChange({ contactEmail: e.target.value })}
              InputLabelProps={{ shrink: true }}
              sx={{ flex: 1 }}
            />
          </Box>

          {/* Vehicle-specific fields */}
          {(data.coverageType === 'Vehicle' || coverageType === 'Vehicle') && (
            <>
              <Divider sx={{ my: 0.5 }} />
              <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                Vehicle Coverage Details
              </Typography>

              <TextField
                label="Limits of Liability"
                value={data.liabilityLimits || ''}
                onChange={(e) => handleChange({ liabilityLimits: e.target.value })}
                InputLabelProps={{ shrink: true }}
                placeholder="e.g., 100/300/100"
                fullWidth
              />

              <Box sx={{ display: 'flex', gap: 2 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={data.hasCollision || false}
                      onChange={(e) => handleChange({ hasCollision: e.target.checked })}
                    />
                  }
                  label="Collision Coverage"
                  sx={{ flex: 1 }}
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={data.hasRentalInsurance || false}
                      onChange={(e) => handleChange({ hasRentalInsurance: e.target.checked })}
                    />
                  }
                  label="Rental Insurance"
                  sx={{ flex: 1 }}
                />
              </Box>

              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={data.hasComprehensive || false}
                      onChange={(e) => handleChange({ hasComprehensive: e.target.checked })}
                    />
                  }
                  label="Comprehensive"
                />
                {data.hasComprehensive && (
                  <TextField
                    label="Deductible"
                    value={data.comprehensiveDeductible || ''}
                    onChange={(e) => handleChange({ comprehensiveDeductible: e.target.value })}
                    InputLabelProps={{ shrink: true }}
                    placeholder="$0.00"
                    sx={{ flex: 1 }}
                  />
                )}
              </Box>

              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  label="Uninsured Coverage Amount"
                  value={data.uninsuredAmount || ''}
                  onChange={(e) => handleChange({ uninsuredAmount: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                  placeholder="$0.00"
                  sx={{ flex: 1 }}
                />
                <TextField
                  label="Underinsured Coverage Amount"
                  value={data.underinsuredAmount || ''}
                  onChange={(e) => handleChange({ underinsuredAmount: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                  placeholder="$0.00"
                  sx={{ flex: 1 }}
                />
              </Box>

              <TextField
                label="Medical Payments Amount"
                value={data.medicalPaymentsAmount || ''}
                onChange={(e) => handleChange({ medicalPaymentsAmount: e.target.value })}
                InputLabelProps={{ shrink: true }}
                placeholder="$0.00"
                fullWidth
              />
            </>
          )}

          {/* Homeowner's-specific fields */}
          {(data.coverageType === 'Homeowners' || coverageType === 'Homeowners') && (
            <>
              <Divider sx={{ my: 0.5 }} />
              <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                Homeowner&apos;s Coverage Details
              </Typography>

              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  select
                  label="Policy Type"
                  value={data.hoPolicyType || ''}
                  onChange={(e) => handleChange({ hoPolicyType: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                  sx={{ flex: 1 }}
                >
                  {HOMEOWNER_POLICY_TYPES.map((type) => (
                    <MenuItem key={type} value={type}>
                      {type}
                    </MenuItem>
                  ))}
                </TextField>
                <FormControlLabel
                  control={
                    <Switch
                      checked={data.autoRenewal || false}
                      onChange={(e) => handleChange({ autoRenewal: e.target.checked })}
                    />
                  }
                  label="Auto-Renewal"
                  sx={{ flex: 1 }}
                />
              </Box>

              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  label="Effective Date"
                  type="date"
                  value={data.effectiveDate || ''}
                  onChange={(e) => handleChange({ effectiveDate: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                  sx={{ flex: 1 }}
                />
                <TextField
                  label="Expiration Date"
                  type="date"
                  value={data.expirationDate || ''}
                  onChange={(e) => handleChange({ expirationDate: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                  sx={{ flex: 1 }}
                />
              </Box>

              <TextField
                label="Property Covered"
                value={data.propertyCovered || ''}
                onChange={(e) => handleChange({ propertyCovered: e.target.value })}
                InputLabelProps={{ shrink: true }}
                placeholder="e.g., 123 Main St, Anytown, USA"
                fullWidth
              />

              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  label="Coverage Amounts"
                  value={data.coverageAmounts || ''}
                  onChange={(e) => handleChange({ coverageAmounts: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                  placeholder="$0.00"
                  sx={{ flex: 1 }}
                />
                <TextField
                  label="Deductibles"
                  value={data.deductibles || ''}
                  onChange={(e) => handleChange({ deductibles: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                  placeholder="$0.00"
                  sx={{ flex: 1 }}
                />
              </Box>

              <TextField
                label="Hurricane / Wind Deductible"
                value={data.hurricaneWindDeductible || ''}
                onChange={(e) => handleChange({ hurricaneWindDeductible: e.target.value })}
                InputLabelProps={{ shrink: true }}
                placeholder="$0.00 or percentage"
                fullWidth
              />

              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={data.hasScheduledPersonalProperty || false}
                      onChange={(e) => handleChange({ hasScheduledPersonalProperty: e.target.checked })}
                    />
                  }
                  label="Scheduled Personal Property / Jewelry Floater"
                />
                {data.hasScheduledPersonalProperty && (
                  <TextField
                    label="Limit"
                    value={data.scheduledPersonalPropertyLimit || ''}
                    onChange={(e) => handleChange({ scheduledPersonalPropertyLimit: e.target.value })}
                    InputLabelProps={{ shrink: true }}
                    placeholder="$0.00"
                    sx={{ flex: 1 }}
                  />
                )}
              </Box>

              <Box sx={{ display: 'flex', gap: 2 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={data.hasFineArtsRider || false}
                      onChange={(e) => handleChange({ hasFineArtsRider: e.target.checked })}
                    />
                  }
                  label="Fine Arts Rider"
                  sx={{ flex: 1 }}
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={data.hasHomeBusinessEndorsement || false}
                      onChange={(e) => handleChange({ hasHomeBusinessEndorsement: e.target.checked })}
                    />
                  }
                  label="Home Business Endorsement"
                  sx={{ flex: 1 }}
                />
              </Box>

              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={data.hasWaterBackup || false}
                      onChange={(e) => handleChange({ hasWaterBackup: e.target.checked })}
                    />
                  }
                  label="Water Backup / Sump Overflow"
                />
                {data.hasWaterBackup && (
                  <TextField
                    label="Limit"
                    value={data.waterBackupLimit || ''}
                    onChange={(e) => handleChange({ waterBackupLimit: e.target.value })}
                    InputLabelProps={{ shrink: true }}
                    placeholder="$0.00"
                    sx={{ flex: 1 }}
                  />
                )}
              </Box>

              <Box sx={{ display: 'flex', gap: 2 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={data.hasServiceLineCoverage || false}
                      onChange={(e) => handleChange({ hasServiceLineCoverage: e.target.checked })}
                    />
                  }
                  label="Service Line Coverage"
                  sx={{ flex: 1 }}
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={data.hasEquipmentBreakdown || false}
                      onChange={(e) => handleChange({ hasEquipmentBreakdown: e.target.checked })}
                    />
                  }
                  label="Equipment Breakdown"
                  sx={{ flex: 1 }}
                />
              </Box>

              <FormControlLabel
                control={
                  <Switch
                    checked={data.hasIdentityTheftCoverage || false}
                    onChange={(e) => handleChange({ hasIdentityTheftCoverage: e.target.checked })}
                  />
                }
                label="Identity Theft Coverage"
              />
            </>
          )}

          {/* Long-Term Care-specific fields */}
          {(data.coverageType === 'Long-Term Care' || coverageType === 'Long-Term Care') && (
            <>
              <Divider sx={{ my: 0.5 }} />
              <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                Long-Term Care Details
              </Typography>

              <TextField
                label="Insured Name"
                value={data.ltcInsuredName || ''}
                onChange={(e) => handleChange({ ltcInsuredName: e.target.value })}
                InputLabelProps={{ shrink: true }}
                fullWidth
              />

              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  label="Issue Date"
                  type="date"
                  value={data.ltcIssueDate || ''}
                  onChange={(e) => handleChange({ ltcIssueDate: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                  sx={{ flex: 1 }}
                />
                <TextField
                  select
                  label="Policy Status"
                  value={data.ltcPolicyStatus || ''}
                  onChange={(e) => handleChange({ ltcPolicyStatus: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                  sx={{ flex: 1 }}
                >
                  {LTC_POLICY_STATUSES.map((s) => (
                    <MenuItem key={s} value={s}>{s}</MenuItem>
                  ))}
                </TextField>
              </Box>

              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  label="Daily Benefit Amount"
                  value={data.ltcDailyBenefitAmount || ''}
                  onChange={(e) => handleChange({ ltcDailyBenefitAmount: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                  placeholder="$0.00"
                  sx={{ flex: 1 }}
                />
                <TextField
                  label="Monthly Benefit Amount"
                  value={data.ltcMonthlyBenefitAmount || ''}
                  onChange={(e) => handleChange({ ltcMonthlyBenefitAmount: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                  placeholder="$0.00"
                  sx={{ flex: 1 }}
                />
              </Box>

              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  select
                  label="Benefit Period"
                  value={data.ltcBenefitPeriod || ''}
                  onChange={(e) => handleChange({ ltcBenefitPeriod: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                  sx={{ flex: 1 }}
                >
                  {LTC_BENEFIT_PERIODS.map((p) => (
                    <MenuItem key={p} value={p}>{p}</MenuItem>
                  ))}
                </TextField>
                <TextField
                  label="Max Lifetime Benefit Pool"
                  value={data.ltcMaxLifetimeBenefitPool || ''}
                  onChange={(e) => handleChange({ ltcMaxLifetimeBenefitPool: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                  placeholder="$0.00"
                  sx={{ flex: 1 }}
                />
              </Box>

              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  select
                  label="Inflation Protection Type"
                  value={data.ltcInflationProtectionType || ''}
                  onChange={(e) => handleChange({ ltcInflationProtectionType: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                  sx={{ flex: 1 }}
                >
                  {LTC_INFLATION_TYPES.map((t) => (
                    <MenuItem key={t} value={t}>{t}</MenuItem>
                  ))}
                </TextField>
                <TextField
                  label="Current Benefit After Inflation"
                  value={data.ltcCurrentBenefitAfterInflation || ''}
                  onChange={(e) => handleChange({ ltcCurrentBenefitAfterInflation: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                  placeholder="$0.00 /day or /month"
                  sx={{ flex: 1 }}
                />
              </Box>

              <Box sx={{ display: 'flex', gap: 2 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={data.ltcSharedCareRider || false}
                      onChange={(e) => handleChange({ ltcSharedCareRider: e.target.checked })}
                    />
                  }
                  label="Shared Care Rider"
                  sx={{ flex: 1 }}
                />
                <TextField
                  select
                  label="Elimination Period"
                  value={data.ltcEliminationPeriod || ''}
                  onChange={(e) => handleChange({ ltcEliminationPeriod: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                  sx={{ flex: 1 }}
                >
                  {LTC_ELIMINATION_PERIODS.map((p) => (
                    <MenuItem key={p} value={p}>{p}</MenuItem>
                  ))}
                </TextField>
              </Box>

              <Divider sx={{ my: 0.5 }} />
              <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                Care Settings Covered
              </Typography>

              <Box sx={{ display: 'flex', gap: 2 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={data.ltcCoversNursingFacility || false}
                      onChange={(e) => handleChange({ ltcCoversNursingFacility: e.target.checked })}
                    />
                  }
                  label="Nursing Facility"
                  sx={{ flex: 1 }}
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={data.ltcCoversAssistedLiving || false}
                      onChange={(e) => handleChange({ ltcCoversAssistedLiving: e.target.checked })}
                    />
                  }
                  label="Assisted Living"
                  sx={{ flex: 1 }}
                />
              </Box>

              <Box sx={{ display: 'flex', gap: 2 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={data.ltcCoversMemoryCare || false}
                      onChange={(e) => handleChange({ ltcCoversMemoryCare: e.target.checked })}
                    />
                  }
                  label="Memory Care"
                  sx={{ flex: 1 }}
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={data.ltcCoversAdultDayCare || false}
                      onChange={(e) => handleChange({ ltcCoversAdultDayCare: e.target.checked })}
                    />
                  }
                  label="Adult Day Care"
                  sx={{ flex: 1 }}
                />
              </Box>

              <Box sx={{ display: 'flex', gap: 2 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={data.ltcCoversHomeHealthCare || false}
                      onChange={(e) => handleChange({ ltcCoversHomeHealthCare: e.target.checked })}
                    />
                  }
                  label="Home Health Care"
                  sx={{ flex: 1 }}
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={data.ltcCoversHospice || false}
                      onChange={(e) => handleChange({ ltcCoversHospice: e.target.checked })}
                    />
                  }
                  label="Hospice"
                  sx={{ flex: 1 }}
                />
              </Box>

              <FormControlLabel
                control={
                  <Switch
                    checked={data.ltcCoversFamilyCaregiver || false}
                    onChange={(e) => handleChange({ ltcCoversFamilyCaregiver: e.target.checked })}
                  />
                }
                label="Informal / Family Caregiver"
              />

              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={data.ltcHasBedReservation || false}
                      onChange={(e) => handleChange({ ltcHasBedReservation: e.target.checked })}
                    />
                  }
                  label="Bed Reservation Benefit"
                />
                {data.ltcHasBedReservation && (
                  <TextField
                    label="Number of Days"
                    value={data.ltcBedReservationDays || ''}
                    onChange={(e) => handleChange({ ltcBedReservationDays: e.target.value })}
                    InputLabelProps={{ shrink: true }}
                    placeholder="e.g., 30"
                    sx={{ flex: 1 }}
                  />
                )}
              </Box>

              <TextField
                label="Current Annual Premium"
                value={data.ltcAnnualPremium || ''}
                onChange={(e) => handleChange({ ltcAnnualPremium: e.target.value })}
                InputLabelProps={{ shrink: true }}
                placeholder="$0.00"
                fullWidth
              />
            </>
          )}

          {/* Umbrella-specific fields */}
          {(data.coverageType === 'Umbrella' || coverageType === 'Umbrella') && (
            <>
              <Divider sx={{ my: 0.5 }} />
              <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                Umbrella Coverage Details
              </Typography>

              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  select
                  label="Policy Type"
                  value={data.umbPolicyType || ''}
                  onChange={(e) => handleChange({ umbPolicyType: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                  sx={{ flex: 1 }}
                >
                  {UMBRELLA_POLICY_TYPES.map((type) => (
                    <MenuItem key={type} value={type}>
                      {type}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField
                  select
                  label="Umbrella Limit"
                  value={data.umbLimit || ''}
                  onChange={(e) => handleChange({ umbLimit: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                  sx={{ flex: 1 }}
                >
                  {UMBRELLA_LIMITS.map((lim) => (
                    <MenuItem key={lim} value={lim}>
                      {lim}
                    </MenuItem>
                  ))}
                </TextField>
              </Box>

              {data.umbLimit === 'Other' && (
                <TextField
                  label="Custom Umbrella Limit"
                  value={data.umbLimitOther || ''}
                  onChange={(e) => handleChange({ umbLimitOther: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                  placeholder="$0.00"
                  fullWidth
                />
              )}

              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  label="Effective Date"
                  type="date"
                  value={data.umbEffectiveDate || ''}
                  onChange={(e) => handleChange({ umbEffectiveDate: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                  sx={{ flex: 1 }}
                />
                <TextField
                  label="Expiration Date"
                  type="date"
                  value={data.umbExpirationDate || ''}
                  onChange={(e) => handleChange({ umbExpirationDate: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                  sx={{ flex: 1 }}
                />
              </Box>

              <TextField
                label="Self-Insured Retention (SIR)"
                value={data.umbSelfInsuredRetention || ''}
                onChange={(e) => handleChange({ umbSelfInsuredRetention: e.target.value })}
                InputLabelProps={{ shrink: true }}
                placeholder="$0.00"
                fullWidth
              />

              <Divider sx={{ my: 0.5 }} />
              <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                Underlying Policies Required
              </Typography>

              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  label="Auto Liability Underlying Limit"
                  value={data.umbAutoLiabilityRequired || ''}
                  onChange={(e) => handleChange({ umbAutoLiabilityRequired: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                  placeholder="e.g., 250/500/100"
                  sx={{ flex: 1 }}
                />
                <TextField
                  label="Homeowners Liability Underlying Limit"
                  value={data.umbHomeownersLiabilityRequired || ''}
                  onChange={(e) => handleChange({ umbHomeownersLiabilityRequired: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                  placeholder="e.g., $300,000"
                  sx={{ flex: 1 }}
                />
              </Box>

              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={data.umbHasWatercraftRequired || false}
                      onChange={(e) => handleChange({ umbHasWatercraftRequired: e.target.checked })}
                    />
                  }
                  label="Watercraft / Boat Policy Required"
                />
                {data.umbHasWatercraftRequired && (
                  <TextField
                    label="Limit"
                    value={data.umbWatercraftLimit || ''}
                    onChange={(e) => handleChange({ umbWatercraftLimit: e.target.value })}
                    InputLabelProps={{ shrink: true }}
                    placeholder="$0.00"
                    sx={{ flex: 1 }}
                  />
                )}
              </Box>

              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={data.umbHasRentalPropertyRequired || false}
                      onChange={(e) => handleChange({ umbHasRentalPropertyRequired: e.target.checked })}
                    />
                  }
                  label="Rental Property Policy Required"
                />
                {data.umbHasRentalPropertyRequired && (
                  <TextField
                    label="Limit"
                    value={data.umbRentalPropertyLimit || ''}
                    onChange={(e) => handleChange({ umbRentalPropertyLimit: e.target.value })}
                    InputLabelProps={{ shrink: true }}
                    placeholder="$0.00"
                    sx={{ flex: 1 }}
                  />
                )}
              </Box>

              <TextField
                label="Other Underlying Policies Required"
                value={data.umbOtherUnderlyingPolicies || ''}
                onChange={(e) => handleChange({ umbOtherUnderlyingPolicies: e.target.value })}
                InputLabelProps={{ shrink: true }}
                multiline
                minRows={2}
                fullWidth
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={data.umbAllSameCarrier || false}
                    onChange={(e) => handleChange({ umbAllSameCarrier: e.target.checked })}
                  />
                }
                label="All underlying policies with same carrier"
              />

              <Divider sx={{ my: 0.5 }} />
              <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                Insured Parties
              </Typography>

              <TextField
                label="Named Insured"
                value={data.umbNamedInsured || ''}
                onChange={(e) => handleChange({ umbNamedInsured: e.target.value })}
                InputLabelProps={{ shrink: true }}
                fullWidth
              />

              <TextField
                label="Additional Insureds"
                value={data.umbAdditionalInsureds || ''}
                onChange={(e) => handleChange({ umbAdditionalInsureds: e.target.value })}
                InputLabelProps={{ shrink: true }}
                placeholder="Spouse, resident relatives, household members"
                multiline
                minRows={2}
                fullWidth
              />

              <TextField
                label="Annual Premium"
                value={data.umbAnnualPremium || ''}
                onChange={(e) => handleChange({ umbAnnualPremium: e.target.value })}
                InputLabelProps={{ shrink: true }}
                placeholder="$0.00"
                fullWidth
              />
            </>
          )}

          <TextField
            label="Notes and Comments"
            value={data.notes}
            onChange={(e) => handleChange({ notes: e.target.value })}
            InputLabelProps={{ shrink: true }}
            multiline
            minRows={2}
            fullWidth
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        {isEdit && onDelete && (
          <Button onClick={onDelete} color="error" sx={{ mr: 'auto' }}>
            Delete
          </Button>
        )}
        <Button onClick={onClose} variant="outlined">
          Cancel
        </Button>
        <Button onClick={handleSave} variant="contained" disabled={!canSave}>
          {isEdit ? 'Save Changes' : 'Add Policy'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default InsurancePolicyModal;
