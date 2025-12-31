'use client';

import React from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
} from '@mui/material';
import { useFormContext, MaritalStatus, IncomeSource, IncomeFrequency, MedicalInsurance } from '../lib/FormContext';
import WarningIcon from '@mui/icons-material/Warning';
import { categorizeAssets, calculateCategoryTotal, CategorizedAsset } from '../lib/assetCategorization';

// Calculate monthly amount from income source
const calculateMonthlyAmount = (amount: string, frequency: IncomeFrequency): number => {
  const numAmount = parseFloat(amount.replace(/[^0-9.-]/g, ''));
  if (isNaN(numAmount) || !frequency) return 0;

  switch (frequency) {
    case 'Monthly':
      return numAmount;
    case 'Quarterly':
      return numAmount / 3;
    case 'Semi-Annually':
      return numAmount / 6;
    case 'Annually':
      return numAmount / 12;
    case 'Weekly':
      return numAmount * 52 / 12;
    case 'Bi-Weekly':
      return numAmount * 26 / 12;
    default:
      return 0;
  }
};

// Calculate total monthly income from income sources array
const calculateTotalMonthlyIncome = (incomeSources: IncomeSource[]): number => {
  return incomeSources.reduce((total, source) => {
    return total + calculateMonthlyAmount(source.amount, source.frequency);
  }, 0);
};

// Check if income sources have any data
const hasIncomeData = (incomeSources: IncomeSource[]): boolean => {
  return incomeSources.some(source => source.description || source.amount);
};

// Parse currency string to number
const parseCurrency = (value: string): number => {
  const num = parseFloat(value.replace(/[^0-9.-]/g, ''));
  return isNaN(num) ? 0 : num;
};

// Calculate total monthly insurance cost
const calculateTotalInsuranceCost = (insurance: MedicalInsurance): number => {
  return (
    parseCurrency(insurance.medicarePartBDeduction) +
    parseCurrency(insurance.medicareCoverageCost) +
    parseCurrency(insurance.privateInsuranceCost) +
    parseCurrency(insurance.otherInsuranceCost)
  );
};

// Check if medical insurance has any data
const hasMedicalInsuranceData = (insurance: MedicalInsurance): boolean => {
  return !!(
    insurance.medicarePartBDeduction ||
    insurance.medicareCoverageType ||
    insurance.privateInsuranceDescription ||
    insurance.otherInsuranceDescription
  );
};

const SHOW_SPOUSE_STATUSES: MaritalStatus[] = ['Married', 'Second Marriage', 'Domestic Partnership'];

const SectionHeader: React.FC<{ title: string }> = ({ title }) => (
  <Typography variant="h6" sx={{ fontWeight: 600, color: '#1a237e', mb: 1, mt: 2 }}>
    {title}
  </Typography>
);

const InfoRow: React.FC<{ label: string; value: string | number | boolean | Date | null | undefined }> = ({ label, value }) => {
  if (value === null || value === undefined || value === '') return null;

  let displayValue: string;
  if (typeof value === 'boolean') {
    displayValue = value ? 'Yes' : 'No';
  } else if (value instanceof Date) {
    displayValue = value.toLocaleDateString();
  } else {
    displayValue = String(value);
  }

  return (
    <Grid item xs={12} md={6}>
      <Box sx={{ display: 'flex', py: 0.25 }}>
        <Typography variant="body2" sx={{ fontWeight: 500, minWidth: 200, color: 'text.secondary' }}>
          {label}:
        </Typography>
        <Typography variant="body2">{displayValue}</Typography>
      </Box>
    </Grid>
  );
};

const SummarySection = () => {
  const { formData } = useFormContext();

  const showSpouseInfo = SHOW_SPOUSE_STATUSES.includes(formData.maritalStatus);

  // Count children by relationship type
  const childrenOfClient = formData.children.filter(
    (child) => child.relationship.includes('Client') && !child.relationship.includes('Both')
  ).length;
  const childrenOfSpouse = formData.children.filter(
    (child) => child.relationship.includes('Spouse') && !child.relationship.includes('Both')
  ).length;
  const childrenOfBoth = formData.children.filter(
    (child) => child.relationship.includes('Both')
  ).length;

  // Expected counts from personal data
  const expectedClientChildren = showSpouseInfo
    ? formData.clientChildrenFromPrior
    : formData.numberOfChildren;
  const expectedSpouseChildren = formData.spouseChildrenFromPrior;
  const expectedChildrenTogether = formData.childrenTogether;

  // Check if counts match
  const clientChildrenMatch = showSpouseInfo
    ? childrenOfClient === expectedClientChildren
    : (childrenOfClient + childrenOfBoth) === formData.numberOfChildren;
  const spouseChildrenMatch = childrenOfSpouse === expectedSpouseChildren;
  const childrenTogetherMatch = childrenOfBoth === expectedChildrenTogether;

  // Overall children incomplete check
  const childrenIncomplete = showSpouseInfo
    ? !clientChildrenMatch || !spouseChildrenMatch || !childrenTogetherMatch
    : !clientChildrenMatch;

  const formatDate = (date: Date | null | string) => {
    if (!date) return '-';
    if (typeof date === 'string') return date;
    return date.toLocaleDateString();
  };

  const formatCurrency = (value: string) => {
    if (!value) return '-';
    const num = parseFloat(value.replace(/[^0-9.-]/g, ''));
    if (isNaN(num)) return value;
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(num);
  };

  // Use the shared asset categorization utility
  const assetCategorySummary = categorizeAssets(formData);
  const assetCategories = assetCategorySummary.categories;

  // Helper to format fiduciary names - handles dropdown values and "Other" fields
  const formatFiduciaryName = (dropdownValue: string, otherValue: string): string | null => {
    // If "Other" was selected, use the other field value
    if (dropdownValue === '__OTHER__') {
      return otherValue || null;
    }
    // If dropdown has a value with prefix (e.g., "child:1:Betty", "spouse:Name", "client:Name", "beneficiary:0:Name")
    if (dropdownValue && dropdownValue.includes(':')) {
      const parts = dropdownValue.split(':');
      // The name is always the last part
      return parts[parts.length - 1] || null;
    }
    // Return dropdown value as-is if it exists
    return dropdownValue || null;
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, color: '#1a237e', mb: 3 }}>
        SUMMARY
      </Typography>

      {/* Personal Information */}
      <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
        <SectionHeader title="Personal Information" />
        <Grid container spacing={1}>
          <InfoRow label="Name" value={formData.name} />
          <InfoRow label="Also Known As" value={formData.aka} />
          <InfoRow label="Sex" value={formData.sex} />
          <InfoRow label="Date of Birth" value={formatDate(formData.birthDate)} />
          <InfoRow label="Marital Status" value={formData.maritalStatus} />
          <InfoRow label="Mailing Address" value={formData.mailingAddress} />
          <InfoRow label="Cell Phone" value={formData.cellPhone} />
          <InfoRow label="Home Phone" value={formData.homePhone} />
          <InfoRow label="Work Phone" value={formData.workPhone} />
          <InfoRow label="Email" value={formData.email} />
        </Grid>

        {showSpouseInfo && (
          <>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
              Spouse Information
            </Typography>
            <Grid container spacing={1}>
              <InfoRow label="Spouse Name" value={formData.spouseName} />
              <InfoRow label="Spouse AKA" value={formData.spouseAka} />
              <InfoRow label="Spouse Sex" value={formData.spouseSex} />
              <InfoRow label="Spouse Date of Birth" value={formatDate(formData.spouseBirthDate)} />
              <InfoRow label="Spouse Mailing Address" value={formData.spouseMailingAddress} />
              <InfoRow label="Spouse Cell Phone" value={formData.spouseCellPhone} />
              <InfoRow label="Spouse Email" value={formData.spouseEmail} />
              <InfoRow label="Date Married" value={formatDate(formData.dateMarried)} />
              <InfoRow label="Place of Marriage" value={formData.placeOfMarriage} />
              <InfoRow label="Children Together" value={formData.childrenTogether} />
            </Grid>
          </>
        )}
      </Paper>

      {/* Income Information */}
      {(hasIncomeData(formData.clientIncomeSources) || (showSpouseInfo && hasIncomeData(formData.spouseIncomeSources))) && (
        <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
          <SectionHeader title="Income Information" />

          {/* Client Income */}
          {hasIncomeData(formData.clientIncomeSources) && (
            <>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                {showSpouseInfo ? "Client's Income" : 'Income Sources'}
              </Typography>
              <TableContainer sx={{ mb: 2 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                      <TableCell sx={{ fontWeight: 600 }}>Description</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Amount</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Frequency</TableCell>
                      <TableCell sx={{ fontWeight: 600 }} align="right">Monthly Amount</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {formData.clientIncomeSources
                      .filter(source => source.description || source.amount)
                      .map((source, index) => (
                        <TableRow key={index}>
                          <TableCell>{source.description || '-'}</TableCell>
                          <TableCell>{formatCurrency(source.amount)}</TableCell>
                          <TableCell>{source.frequency || '-'}</TableCell>
                          <TableCell align="right">
                            {formatCurrency(calculateMonthlyAmount(source.amount, source.frequency).toFixed(2))}
                          </TableCell>
                        </TableRow>
                      ))}
                    <TableRow sx={{ bgcolor: '#e3f2fd' }}>
                      <TableCell colSpan={3} sx={{ fontWeight: 600 }}>Total Monthly Income</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>
                        {formatCurrency(calculateTotalMonthlyIncome(formData.clientIncomeSources).toFixed(2))}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </>
          )}

          {/* Spouse Income */}
          {showSpouseInfo && hasIncomeData(formData.spouseIncomeSources) && (
            <>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                Spouse's Income
              </Typography>
              <TableContainer sx={{ mb: 2 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                      <TableCell sx={{ fontWeight: 600 }}>Description</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Amount</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Frequency</TableCell>
                      <TableCell sx={{ fontWeight: 600 }} align="right">Monthly Amount</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {formData.spouseIncomeSources
                      .filter(source => source.description || source.amount)
                      .map((source, index) => (
                        <TableRow key={index}>
                          <TableCell>{source.description || '-'}</TableCell>
                          <TableCell>{formatCurrency(source.amount)}</TableCell>
                          <TableCell>{source.frequency || '-'}</TableCell>
                          <TableCell align="right">
                            {formatCurrency(calculateMonthlyAmount(source.amount, source.frequency).toFixed(2))}
                          </TableCell>
                        </TableRow>
                      ))}
                    <TableRow sx={{ bgcolor: '#e3f2fd' }}>
                      <TableCell colSpan={3} sx={{ fontWeight: 600 }}>Total Monthly Income</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>
                        {formatCurrency(calculateTotalMonthlyIncome(formData.spouseIncomeSources).toFixed(2))}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </>
          )}

          {/* Combined Household Income */}
          {showSpouseInfo && hasIncomeData(formData.clientIncomeSources) && hasIncomeData(formData.spouseIncomeSources) && (
            <>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: '#e8f5e9', p: 1.5, borderRadius: 1 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  Combined Household Monthly Income
                </Typography>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  {formatCurrency((calculateTotalMonthlyIncome(formData.clientIncomeSources) + calculateTotalMonthlyIncome(formData.spouseIncomeSources)).toFixed(2))}
                </Typography>
              </Box>
            </>
          )}
        </Paper>
      )}

      {/* Medical Insurance Information */}
      {(hasMedicalInsuranceData(formData.clientMedicalInsurance) || (showSpouseInfo && hasMedicalInsuranceData(formData.spouseMedicalInsurance))) && (
        <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
          <SectionHeader title="Medical Insurance" />

          {/* Medicare Advantage Warning for Multiple State Properties */}
          {(() => {
            const hasMedicareAdvantage = formData.clientMedicalInsurance.medicareCoverageType === 'Medicare Advantage' ||
              (showSpouseInfo && formData.spouseMedicalInsurance.medicareCoverageType === 'Medicare Advantage');
            const uniqueStates = new Set(formData.realEstate.map(p => p.state).filter(Boolean));
            const hasMultipleStateProperties = uniqueStates.size > 1;

            if (hasMedicareAdvantage && hasMultipleStateProperties) {
              return (
                <Box sx={{ display: 'flex', alignItems: 'flex-start', bgcolor: '#fff3e0', p: 2, borderRadius: 1, mb: 2, border: '1px solid #ff9800' }}>
                  <WarningIcon sx={{ color: '#ed6c02', mr: 1.5, mt: 0.25 }} />
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#e65100' }}>
                      Medicare Advantage Coverage Warning
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      You have real estate in multiple states ({Array.from(uniqueStates).join(', ')}) and Medicare Advantage coverage.
                      Medicare Advantage plans are typically network-based and may not provide full coverage when you are
                      outside the plan&apos;s service area. If you spend extended time at properties in other states, you may
                      encounter limited coverage for non-emergency care. Consider reviewing your plan&apos;s out-of-area coverage
                      or evaluating whether a Medicare Supplement (Medigap) plan might better suit your lifestyle.
                    </Typography>
                  </Box>
                </Box>
              );
            }
            return null;
          })()}

          {/* Client Insurance */}
          {hasMedicalInsuranceData(formData.clientMedicalInsurance) && (
            <>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                {showSpouseInfo ? "Client's Medical Insurance" : 'Medical Insurance'}
              </Typography>
              <TableContainer sx={{ mb: 2 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                      <TableCell sx={{ fontWeight: 600 }}>Coverage Type</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Description</TableCell>
                      <TableCell sx={{ fontWeight: 600 }} align="right">Monthly Cost</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {formData.clientMedicalInsurance.medicarePartBDeduction && (
                      <TableRow>
                        <TableCell>Medicare Part B</TableCell>
                        <TableCell>Standard deduction</TableCell>
                        <TableCell align="right">{formatCurrency(formData.clientMedicalInsurance.medicarePartBDeduction)}</TableCell>
                      </TableRow>
                    )}
                    {formData.clientMedicalInsurance.medicareCoverageType && formData.clientMedicalInsurance.medicareCoverageType !== 'Neither' && (
                      <TableRow>
                        <TableCell>{formData.clientMedicalInsurance.medicareCoverageType}</TableCell>
                        <TableCell>-</TableCell>
                        <TableCell align="right">{formatCurrency(formData.clientMedicalInsurance.medicareCoverageCost)}</TableCell>
                      </TableRow>
                    )}
                    {formData.clientMedicalInsurance.privateInsuranceDescription && (
                      <TableRow>
                        <TableCell>Private Insurance</TableCell>
                        <TableCell>{formData.clientMedicalInsurance.privateInsuranceDescription}</TableCell>
                        <TableCell align="right">{formatCurrency(formData.clientMedicalInsurance.privateInsuranceCost)}</TableCell>
                      </TableRow>
                    )}
                    {formData.clientMedicalInsurance.otherInsuranceDescription && (
                      <TableRow>
                        <TableCell>Other Insurance</TableCell>
                        <TableCell>{formData.clientMedicalInsurance.otherInsuranceDescription}</TableCell>
                        <TableCell align="right">{formatCurrency(formData.clientMedicalInsurance.otherInsuranceCost)}</TableCell>
                      </TableRow>
                    )}
                    <TableRow sx={{ bgcolor: '#ffebee' }}>
                      <TableCell colSpan={2} sx={{ fontWeight: 600 }}>Total Monthly Insurance Cost</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>
                        {formatCurrency(calculateTotalInsuranceCost(formData.clientMedicalInsurance).toFixed(2))}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </>
          )}

          {/* Spouse Insurance */}
          {showSpouseInfo && hasMedicalInsuranceData(formData.spouseMedicalInsurance) && (
            <>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                Spouse&apos;s Medical Insurance
              </Typography>
              <TableContainer sx={{ mb: 2 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                      <TableCell sx={{ fontWeight: 600 }}>Coverage Type</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Description</TableCell>
                      <TableCell sx={{ fontWeight: 600 }} align="right">Monthly Cost</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {formData.spouseMedicalInsurance.medicarePartBDeduction && (
                      <TableRow>
                        <TableCell>Medicare Part B</TableCell>
                        <TableCell>Standard deduction</TableCell>
                        <TableCell align="right">{formatCurrency(formData.spouseMedicalInsurance.medicarePartBDeduction)}</TableCell>
                      </TableRow>
                    )}
                    {formData.spouseMedicalInsurance.medicareCoverageType && formData.spouseMedicalInsurance.medicareCoverageType !== 'Neither' && (
                      <TableRow>
                        <TableCell>{formData.spouseMedicalInsurance.medicareCoverageType}</TableCell>
                        <TableCell>-</TableCell>
                        <TableCell align="right">{formatCurrency(formData.spouseMedicalInsurance.medicareCoverageCost)}</TableCell>
                      </TableRow>
                    )}
                    {formData.spouseMedicalInsurance.privateInsuranceDescription && (
                      <TableRow>
                        <TableCell>Private Insurance</TableCell>
                        <TableCell>{formData.spouseMedicalInsurance.privateInsuranceDescription}</TableCell>
                        <TableCell align="right">{formatCurrency(formData.spouseMedicalInsurance.privateInsuranceCost)}</TableCell>
                      </TableRow>
                    )}
                    {formData.spouseMedicalInsurance.otherInsuranceDescription && (
                      <TableRow>
                        <TableCell>Other Insurance</TableCell>
                        <TableCell>{formData.spouseMedicalInsurance.otherInsuranceDescription}</TableCell>
                        <TableCell align="right">{formatCurrency(formData.spouseMedicalInsurance.otherInsuranceCost)}</TableCell>
                      </TableRow>
                    )}
                    <TableRow sx={{ bgcolor: '#ffebee' }}>
                      <TableCell colSpan={2} sx={{ fontWeight: 600 }}>Total Monthly Insurance Cost</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>
                        {formatCurrency(calculateTotalInsuranceCost(formData.spouseMedicalInsurance).toFixed(2))}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </>
          )}

          {/* Combined Household Insurance Cost */}
          {showSpouseInfo && hasMedicalInsuranceData(formData.clientMedicalInsurance) && hasMedicalInsuranceData(formData.spouseMedicalInsurance) && (
            <>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: '#ffebee', p: 1.5, borderRadius: 1 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  Combined Household Monthly Insurance Cost
                </Typography>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  {formatCurrency((calculateTotalInsuranceCost(formData.clientMedicalInsurance) + calculateTotalInsuranceCost(formData.spouseMedicalInsurance)).toFixed(2))}
                </Typography>
              </Box>
            </>
          )}
        </Paper>
      )}

      {/* Children */}
      <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2, mt: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, color: '#1a237e' }}>
            Children
          </Typography>
          {childrenIncomplete && (
            <Typography variant="body1" sx={{ color: 'error.main', fontWeight: 600 }}>
              Children Incomplete
              {showSpouseInfo ? (
                <>
                  {!clientChildrenMatch && expectedClientChildren > 0 && (
                    <> (Client: Expected {expectedClientChildren}, {childrenOfClient} Entered)</>
                  )}
                  {!childrenTogetherMatch && expectedChildrenTogether > 0 && (
                    <> (Together: Expected {expectedChildrenTogether}, {childrenOfBoth} Entered)</>
                  )}
                  {!spouseChildrenMatch && expectedSpouseChildren > 0 && (
                    <> (Spouse: Expected {expectedSpouseChildren}, {childrenOfSpouse} Entered)</>
                  )}
                </>
              ) : (
                <> (Expected {formData.numberOfChildren}, {childrenOfClient + childrenOfBoth} Entered)</>
              )}
            </Typography>
          )}
        </Box>
        {formData.children.length > 0 ? (
          <>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                  <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Relationship</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Birth Date</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Marital Status</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Has Children</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Age</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {formData.children.map((child, index) => (
                  <TableRow key={index}>
                    <TableCell>{child.name}</TableCell>
                    <TableCell>{child.relationship}</TableCell>
                    <TableCell>{child.birthDate || '-'}</TableCell>
                    <TableCell>{child.maritalStatus || '-'}</TableCell>
                    <TableCell>{child.hasChildren && child.numberOfChildren > 0 ? `Yes (${child.numberOfChildren})` : 'No'}</TableCell>
                    <TableCell>{child.age || '-'}</TableCell>
                    <TableCell>
                      {child.disinherit ? (
                        <Chip label="Disinherited" color="error" size="small" />
                      ) : (
                        <Chip label="Active" color="success" size="small" />
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          </>
        ) : (
          <Typography variant="body2" color="text.secondary">
            No children entered yet.
          </Typography>
        )}
      </Paper>

      {/* Other Beneficiaries */}
      {formData.otherBeneficiaries.length > 0 && (
        <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
          <SectionHeader title="Other Beneficiaries" />
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                  <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Relationship</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Address</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Age</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Notes</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {formData.otherBeneficiaries.map((beneficiary, index) => (
                  <TableRow key={index}>
                    <TableCell>{beneficiary.name}</TableCell>
                    <TableCell>
                      {beneficiary.relationship === 'Other'
                        ? beneficiary.relationshipOther
                        : beneficiary.relationship}
                    </TableCell>
                    <TableCell>{beneficiary.address || '-'}</TableCell>
                    <TableCell>{beneficiary.age || '-'}</TableCell>
                    <TableCell>{beneficiary.notes || '-'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {/* Charities */}
      {formData.leaveToCharity && formData.charities.length > 0 && (
        <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
          <SectionHeader title="Charitable Bequests" />
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                  <TableCell sx={{ fontWeight: 600 }}>Charity Name</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Address</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Amount</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {formData.charities.map((charity, index) => (
                  <TableRow key={index}>
                    <TableCell>{charity.name}</TableCell>
                    <TableCell>{charity.address || '-'}</TableCell>
                    <TableCell>{formatCurrency(charity.amount)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {/* Beneficiary Concerns - show if any beneficiaries exist */}
      {(formData.children.length > 0 || formData.otherBeneficiaries.length > 0 || formData.charities.length > 0) && (
        <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
          <SectionHeader title="Beneficiary Concerns" />
          <Grid container spacing={1}>
            <InfoRow label="Any Beneficiaries Under 21" value={formData.anyBeneficiariesMinors} />
            {formData.anyBeneficiariesMinors && formData.beneficiaryMinorsExplanation && (
              <InfoRow label="Minors Explanation" value={formData.beneficiaryMinorsExplanation} />
            )}
            <InfoRow label="Any Beneficiaries Disabled" value={formData.anyBeneficiariesDisabled} />
            {formData.anyBeneficiariesDisabled && formData.beneficiaryDisabledExplanation && (
              <InfoRow label="Disabled Explanation" value={formData.beneficiaryDisabledExplanation} />
            )}
            <InfoRow label="Any Marital Problems" value={formData.anyBeneficiariesMaritalProblems} />
            {formData.anyBeneficiariesMaritalProblems && formData.beneficiaryMaritalProblemsExplanation && (
              <InfoRow label="Marital Problems Explanation" value={formData.beneficiaryMaritalProblemsExplanation} />
            )}
            <InfoRow label="Any Receiving SSI" value={formData.anyBeneficiariesReceivingSSI} />
            {formData.anyBeneficiariesReceivingSSI && formData.beneficiarySSIExplanation && (
              <InfoRow label="SSI Explanation" value={formData.beneficiarySSIExplanation} />
            )}
            <InfoRow label="Drug Addiction" value={formData.anyBeneficiaryDrugAddiction} />
            {formData.anyBeneficiaryDrugAddiction && formData.beneficiaryDrugAddictionExplanation && (
              <InfoRow label="Drug Addiction Explanation" value={formData.beneficiaryDrugAddictionExplanation} />
            )}
            <InfoRow label="Alcoholism" value={formData.anyBeneficiaryAlcoholism} />
            {formData.anyBeneficiaryAlcoholism && formData.beneficiaryAlcoholismExplanation && (
              <InfoRow label="Alcoholism Explanation" value={formData.beneficiaryAlcoholismExplanation} />
            )}
            <InfoRow label="Financial Problems" value={formData.anyBeneficiaryFinancialProblems} />
            {formData.anyBeneficiaryFinancialProblems && formData.beneficiaryFinancialProblemsExplanation && (
              <InfoRow label="Financial Problems Explanation" value={formData.beneficiaryFinancialProblemsExplanation} />
            )}
            <InfoRow label="Other Concerns" value={formData.hasOtherBeneficiaryConcerns} />
            {formData.hasOtherBeneficiaryConcerns && formData.beneficiaryOtherConcerns && (
              <InfoRow label="Other Concerns Details" value={formData.beneficiaryOtherConcerns} />
            )}
            {formData.beneficiaryNotes && (
              <InfoRow label="Notes" value={formData.beneficiaryNotes} />
            )}
          </Grid>
        </Paper>
      )}

      {/* Dispositive Intentions */}
      <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
        <SectionHeader title="Dispositive Intentions" />
        <Grid container spacing={1}>
          {showSpouseInfo && (
            <InfoRow label="Provide for Spouse then Children" value={formData.provideForSpouseThenChildren} />
          )}
          <InfoRow label="Treat All Children Equally" value={formData.treatAllChildrenEqually} />
          {!formData.treatAllChildrenEqually && (
            <InfoRow label="Equality Explanation" value={formData.childrenEqualityExplanation} />
          )}
          <InfoRow label="Distribution Age" value={formData.distributionAge} />
          <InfoRow label="Predeceased Children to Grandchildren" value={formData.childrenPredeceasedBeneficiaries} />
        </Grid>

        {/* Specific Gifts */}
        {formData.specificGifts.length > 0 && (
          <>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
              Specific Gifts ({formData.specificGifts.length})
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                    <TableCell sx={{ fontWeight: 600 }}>Recipient</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Relationship</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Item/Description</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Notes</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {formData.specificGifts.map((gift, index) => (
                    <TableRow key={index}>
                      <TableCell>{gift.recipientName}</TableCell>
                      <TableCell>{gift.relationship || '-'}</TableCell>
                      <TableCell>{gift.description}</TableCell>
                      <TableCell>{gift.notes || '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        )}

        {/* Cash Gifts to Beneficiaries */}
        {formData.cashGiftsToBeneficiaries.length > 0 && (
          <>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
              Cash Gifts ({formData.cashGiftsToBeneficiaries.length})
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                    <TableCell sx={{ fontWeight: 600 }}>Beneficiary</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Relationship</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Amount</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {formData.cashGiftsToBeneficiaries.map((gift, index) => (
                    <TableRow key={index}>
                      <TableCell>{gift.beneficiaryName}</TableCell>
                      <TableCell>{gift.relationship || '-'}</TableCell>
                      <TableCell>{formatCurrency(gift.amount)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        )}

        {/* Distribution Plan */}
        {(formData.clientDistributionPlan.distributionType !== 'sweetheart' ||
          (showSpouseInfo && formData.spouseDistributionPlan.distributionType !== 'sweetheart')) && (
          <>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
              Distribution Plan
            </Typography>
            <Grid container spacing={1}>
              <InfoRow
                label="Client Distribution Type"
                value={formData.clientDistributionPlan.distributionType === 'sweetheart'
                  ? 'Sweetheart (all to spouse, then children equally)'
                  : formData.clientDistributionPlan.distributionType === 'spouseFirstDiffering'
                    ? 'Spouse First with Different Secondary'
                    : 'Custom Distribution'}
              />
              {showSpouseInfo && (
                <InfoRow
                  label="Spouse Distribution Type"
                  value={formData.spouseDistributionPlan.distributionType === 'sweetheart'
                    ? 'Sweetheart (all to spouse, then children equally)'
                    : formData.spouseDistributionPlan.distributionType === 'spouseFirstDiffering'
                      ? 'Spouse First with Different Secondary'
                      : 'Custom Distribution'}
                />
              )}
            </Grid>
          </>
        )}

        {formData.dispositiveIntentionsComments && (
          <>
            <Divider sx={{ my: 2 }} />
            <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.secondary', mb: 0.5 }}>
              Comments:
            </Typography>
            <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
              {formData.dispositiveIntentionsComments}
            </Typography>
          </>
        )}
      </Paper>

      {/* Current Estate Plan */}
      <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
        <SectionHeader title="Current Estate Plan" />

        {/* Client's Current Estate Plan */}
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
          {showSpouseInfo ? "Client's Documents" : 'Existing Documents'}
        </Typography>

        {formData.clientCurrentEstatePlan.hasNone ? (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            No existing estate planning documents.
          </Typography>
        ) : (
          <Box sx={{ mb: 2 }}>
            {formData.clientCurrentEstatePlan.documentState && (
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Documents signed in:</strong> {formData.clientCurrentEstatePlan.documentState}
              </Typography>
            )}
            {formData.clientCurrentEstatePlan.hasWill && (
              <Box sx={{ mb: 1 }}>
                <Typography variant="body2">
                  <strong>Will:</strong> {formData.clientCurrentEstatePlan.willDateSigned ? `Signed ${formData.clientCurrentEstatePlan.willDateSigned}` : 'Date not specified'}
                  {formData.clientCurrentEstatePlan.willUploadedFiles.length > 0 && ` (${formData.clientCurrentEstatePlan.willUploadedFiles.length} file(s) uploaded)`}
                </Typography>
              </Box>
            )}
            {formData.clientCurrentEstatePlan.hasTrust && (
              <Box sx={{ mb: 1 }}>
                <Typography variant="body2">
                  <strong>Trust:</strong> {formData.clientCurrentEstatePlan.trustDateSigned ? `Signed ${formData.clientCurrentEstatePlan.trustDateSigned}` : 'Date not specified'}
                  {showSpouseInfo && formData.clientCurrentEstatePlan.isJointTrust && ' (Joint with Spouse)'}
                  {formData.clientCurrentEstatePlan.trustUploadedFiles.length > 0 && ` (${formData.clientCurrentEstatePlan.trustUploadedFiles.length} file(s) uploaded)`}
                </Typography>
              </Box>
            )}
            {formData.clientCurrentEstatePlan.hasFinancialPOA && (
              <Box sx={{ mb: 1 }}>
                <Typography variant="body2">
                  <strong>Financial Power of Attorney:</strong> {formData.clientCurrentEstatePlan.financialPOADateSigned ? `Signed ${formData.clientCurrentEstatePlan.financialPOADateSigned}` : 'Date not specified'}
                  {formData.clientCurrentEstatePlan.financialPOAUploadedFiles.length > 0 && ` (${formData.clientCurrentEstatePlan.financialPOAUploadedFiles.length} file(s) uploaded)`}
                </Typography>
              </Box>
            )}
            {formData.clientCurrentEstatePlan.hasHealthCarePOA && (
              <Box sx={{ mb: 1 }}>
                <Typography variant="body2">
                  <strong>Health Care Power of Attorney:</strong> {formData.clientCurrentEstatePlan.healthCarePOADateSigned ? `Signed ${formData.clientCurrentEstatePlan.healthCarePOADateSigned}` : 'Date not specified'}
                  {formData.clientCurrentEstatePlan.healthCarePOAUploadedFiles.length > 0 && ` (${formData.clientCurrentEstatePlan.healthCarePOAUploadedFiles.length} file(s) uploaded)`}
                </Typography>
              </Box>
            )}
            {formData.clientCurrentEstatePlan.hasLivingWill && (
              <Box sx={{ mb: 1 }}>
                <Typography variant="body2">
                  <strong>Living Will:</strong> {formData.clientCurrentEstatePlan.livingWillDateSigned ? `Signed ${formData.clientCurrentEstatePlan.livingWillDateSigned}` : 'Date not specified'}
                  {formData.clientCurrentEstatePlan.livingWillUploadedFiles.length > 0 && ` (${formData.clientCurrentEstatePlan.livingWillUploadedFiles.length} file(s) uploaded)`}
                </Typography>
              </Box>
            )}
            {!formData.clientCurrentEstatePlan.hasWill &&
              !formData.clientCurrentEstatePlan.hasTrust &&
              !formData.clientCurrentEstatePlan.hasFinancialPOA &&
              !formData.clientCurrentEstatePlan.hasHealthCarePOA &&
              !formData.clientCurrentEstatePlan.hasLivingWill && (
                <Typography variant="body2" color="text.secondary">
                  No documents selected.
                </Typography>
              )}
          </Box>
        )}

        {formData.clientCurrentEstatePlan.comments && (
          <Box sx={{ mt: 1 }}>
            <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.secondary' }}>
              Comments:
            </Typography>
            <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
              {formData.clientCurrentEstatePlan.comments}
            </Typography>
          </Box>
        )}

        {/* Spouse's Current Estate Plan */}
        {showSpouseInfo && (
          <>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
              Spouse's Documents
            </Typography>

            {formData.spouseCurrentEstatePlan.hasNone ? (
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                No existing estate planning documents.
              </Typography>
            ) : (
              <Box sx={{ mb: 2 }}>
                {formData.spouseCurrentEstatePlan.documentState && (
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Documents signed in:</strong> {formData.spouseCurrentEstatePlan.documentState}
                  </Typography>
                )}
                {formData.spouseCurrentEstatePlan.hasWill && (
                  <Box sx={{ mb: 1 }}>
                    <Typography variant="body2">
                      <strong>Will:</strong> {formData.spouseCurrentEstatePlan.willDateSigned ? `Signed ${formData.spouseCurrentEstatePlan.willDateSigned}` : 'Date not specified'}
                      {formData.spouseCurrentEstatePlan.willUploadedFiles.length > 0 && ` (${formData.spouseCurrentEstatePlan.willUploadedFiles.length} file(s) uploaded)`}
                    </Typography>
                  </Box>
                )}
                {formData.spouseCurrentEstatePlan.hasTrust && (
                  <Box sx={{ mb: 1 }}>
                    <Typography variant="body2">
                      <strong>Trust:</strong> {formData.spouseCurrentEstatePlan.trustDateSigned ? `Signed ${formData.spouseCurrentEstatePlan.trustDateSigned}` : 'Date not specified'}
                      {formData.spouseCurrentEstatePlan.isJointTrust && ' (Joint with Spouse)'}
                      {formData.spouseCurrentEstatePlan.trustUploadedFiles.length > 0 && ` (${formData.spouseCurrentEstatePlan.trustUploadedFiles.length} file(s) uploaded)`}
                    </Typography>
                  </Box>
                )}
                {formData.spouseCurrentEstatePlan.hasFinancialPOA && (
                  <Box sx={{ mb: 1 }}>
                    <Typography variant="body2">
                      <strong>Financial Power of Attorney:</strong> {formData.spouseCurrentEstatePlan.financialPOADateSigned ? `Signed ${formData.spouseCurrentEstatePlan.financialPOADateSigned}` : 'Date not specified'}
                      {formData.spouseCurrentEstatePlan.financialPOAUploadedFiles.length > 0 && ` (${formData.spouseCurrentEstatePlan.financialPOAUploadedFiles.length} file(s) uploaded)`}
                    </Typography>
                  </Box>
                )}
                {formData.spouseCurrentEstatePlan.hasHealthCarePOA && (
                  <Box sx={{ mb: 1 }}>
                    <Typography variant="body2">
                      <strong>Health Care Power of Attorney:</strong> {formData.spouseCurrentEstatePlan.healthCarePOADateSigned ? `Signed ${formData.spouseCurrentEstatePlan.healthCarePOADateSigned}` : 'Date not specified'}
                      {formData.spouseCurrentEstatePlan.healthCarePOAUploadedFiles.length > 0 && ` (${formData.spouseCurrentEstatePlan.healthCarePOAUploadedFiles.length} file(s) uploaded)`}
                    </Typography>
                  </Box>
                )}
                {formData.spouseCurrentEstatePlan.hasLivingWill && (
                  <Box sx={{ mb: 1 }}>
                    <Typography variant="body2">
                      <strong>Living Will:</strong> {formData.spouseCurrentEstatePlan.livingWillDateSigned ? `Signed ${formData.spouseCurrentEstatePlan.livingWillDateSigned}` : 'Date not specified'}
                      {formData.spouseCurrentEstatePlan.livingWillUploadedFiles.length > 0 && ` (${formData.spouseCurrentEstatePlan.livingWillUploadedFiles.length} file(s) uploaded)`}
                    </Typography>
                  </Box>
                )}
                {!formData.spouseCurrentEstatePlan.hasWill &&
                  !formData.spouseCurrentEstatePlan.hasTrust &&
                  !formData.spouseCurrentEstatePlan.hasFinancialPOA &&
                  !formData.spouseCurrentEstatePlan.hasHealthCarePOA &&
                  !formData.spouseCurrentEstatePlan.hasLivingWill && (
                    <Typography variant="body2" color="text.secondary">
                      No documents selected.
                    </Typography>
                  )}
              </Box>
            )}

            {formData.spouseCurrentEstatePlan.comments && (
              <Box sx={{ mt: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.secondary' }}>
                  Comments:
                </Typography>
                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                  {formData.spouseCurrentEstatePlan.comments}
                </Typography>
              </Box>
            )}
          </>
        )}
      </Paper>

      {/* Fiduciaries */}
      <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
        <SectionHeader title="Fiduciaries" />

        {/* Executors (Client) */}
        {(() => {
          const firstChoice = formatFiduciaryName(formData.executorFirst, formData.executorFirstOther);
          const alternate = formatFiduciaryName(formData.executorAlternate, formData.executorAlternateOther);
          const secondAlternate = formatFiduciaryName(formData.executorSecondAlternate, formData.executorSecondAlternateOther);
          const isIncomplete = !firstChoice || !alternate;
          return (
            <>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  Executors (Client)
                </Typography>
                {isIncomplete && (
                  <Typography variant="body2" sx={{ color: 'error.main', fontWeight: 600 }}>
                    INCOMPLETE
                  </Typography>
                )}
              </Box>
              <Grid container spacing={1}>
                <InfoRow label="First Choice" value={firstChoice} />
                <InfoRow label="Alternate" value={alternate} />
                <InfoRow label="Second Alternate" value={secondAlternate} />
              </Grid>
            </>
          );
        })()}

        {showSpouseInfo && (() => {
          const firstChoice = formatFiduciaryName(formData.spouseExecutorFirst, formData.spouseExecutorFirstOther);
          const alternate = formatFiduciaryName(formData.spouseExecutorAlternate, formData.spouseExecutorAlternateOther);
          const secondAlternate = formatFiduciaryName(formData.spouseExecutorSecondAlternate, formData.spouseExecutorSecondAlternateOther);
          const isIncomplete = !firstChoice || !alternate;
          return (
            <>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  Executors (Spouse)
                </Typography>
                {isIncomplete && (
                  <Typography variant="body2" sx={{ color: 'error.main', fontWeight: 600 }}>
                    INCOMPLETE
                  </Typography>
                )}
              </Box>
              <Grid container spacing={1}>
                <InfoRow label="First Choice" value={firstChoice} />
                <InfoRow label="Alternate" value={alternate} />
                <InfoRow label="Second Alternate" value={secondAlternate} />
              </Grid>
            </>
          );
        })()}

        {/* Trustees (Client) */}
        <Divider sx={{ my: 2 }} />
        {(() => {
          const firstChoice = formatFiduciaryName(formData.trusteeFirst, formData.trusteeFirstOther);
          const alternate = formatFiduciaryName(formData.trusteeAlternate, formData.trusteeAlternateOther);
          const isIncomplete = !firstChoice || !alternate;
          return (
            <>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  Trustees (Client)
                </Typography>
                {isIncomplete && (
                  <Typography variant="body2" sx={{ color: 'error.main', fontWeight: 600 }}>
                    INCOMPLETE
                  </Typography>
                )}
              </Box>
              <Grid container spacing={1}>
                <InfoRow label="First Choice" value={firstChoice} />
                <InfoRow label="Alternate" value={alternate} />
              </Grid>
            </>
          );
        })()}

        {showSpouseInfo && (() => {
          const firstChoice = formatFiduciaryName(formData.spouseTrusteeFirst, formData.spouseTrusteeFirstOther);
          const alternate = formatFiduciaryName(formData.spouseTrusteeAlternate, formData.spouseTrusteeAlternateOther);
          const isIncomplete = !firstChoice || !alternate;
          return (
            <>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  Trustees (Spouse)
                </Typography>
                {isIncomplete && (
                  <Typography variant="body2" sx={{ color: 'error.main', fontWeight: 600 }}>
                    INCOMPLETE
                  </Typography>
                )}
              </Box>
              <Grid container spacing={1}>
                <InfoRow label="First Choice" value={firstChoice} />
                <InfoRow label="Alternate" value={alternate} />
              </Grid>
            </>
          );
        })()}

        {/* Guardians (Client) - only show if there are minor beneficiaries */}
        {formData.anyBeneficiariesMinors && (
          <>
            <Divider sx={{ my: 2 }} />
            {(() => {
              const firstChoice = formatFiduciaryName(formData.guardianFirst, formData.guardianFirstOther);
              const alternate = formatFiduciaryName(formData.guardianAlternate, formData.guardianAlternateOther);
              const isIncomplete = !firstChoice || !alternate;
              return (
                <>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      Guardians (Client)
                    </Typography>
                    {isIncomplete && (
                      <Typography variant="body2" sx={{ color: 'error.main', fontWeight: 600 }}>
                        INCOMPLETE
                      </Typography>
                    )}
                  </Box>
                  <Grid container spacing={1}>
                    <InfoRow label="First Choice" value={firstChoice} />
                    <InfoRow label="Alternate" value={alternate} />
                  </Grid>
                </>
              );
            })()}

            {showSpouseInfo && (() => {
              const firstChoice = formatFiduciaryName(formData.spouseGuardianFirst, formData.spouseGuardianFirstOther);
              const alternate = formatFiduciaryName(formData.spouseGuardianAlternate, formData.spouseGuardianAlternateOther);
              const isIncomplete = !firstChoice || !alternate;
              return (
                <>
                  <Divider sx={{ my: 2 }} />
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      Guardians (Spouse)
                    </Typography>
                    {isIncomplete && (
                      <Typography variant="body2" sx={{ color: 'error.main', fontWeight: 600 }}>
                        INCOMPLETE
                      </Typography>
                    )}
                  </Box>
                  <Grid container spacing={1}>
                    <InfoRow label="First Choice" value={firstChoice} />
                    <InfoRow label="Alternate" value={alternate} />
                  </Grid>
                </>
              );
            })()}
          </>
        )}

        {/* Health Care Agents (Client) */}
        <Divider sx={{ my: 2 }} />
        {(() => {
          const primaryAgent = formatFiduciaryName(formData.healthCareAgentName, formData.healthCareAgentNameOther);
          const alternateAgent = formatFiduciaryName(formData.healthCareAlternateName, formData.healthCareAlternateNameOther);
          const isIncomplete = !primaryAgent || !alternateAgent;
          return (
            <>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  Health Care Agents (Client)
                </Typography>
                {isIncomplete && (
                  <Typography variant="body2" sx={{ color: 'error.main', fontWeight: 600 }}>
                    INCOMPLETE
                  </Typography>
                )}
              </Box>
              <Grid container spacing={1}>
                <InfoRow label="Primary Agent" value={primaryAgent} />
                <InfoRow label="Alternate Agent" value={alternateAgent} />
              </Grid>
            </>
          );
        })()}

        {showSpouseInfo && (() => {
          const primaryAgent = formatFiduciaryName(formData.spouseHealthCareAgentName, formData.spouseHealthCareAgentNameOther);
          const alternateAgent = formatFiduciaryName(formData.spouseHealthCareAlternateName, formData.spouseHealthCareAlternateNameOther);
          const isIncomplete = !primaryAgent || !alternateAgent;
          return (
            <>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  Health Care Agents (Spouse)
                </Typography>
                {isIncomplete && (
                  <Typography variant="body2" sx={{ color: 'error.main', fontWeight: 600 }}>
                    INCOMPLETE
                  </Typography>
                )}
              </Box>
              <Grid container spacing={1}>
                <InfoRow label="Primary Agent" value={primaryAgent} />
                <InfoRow label="Alternate Agent" value={alternateAgent} />
              </Grid>
            </>
          );
        })()}

        {/* Financial POA (Client) */}
        <Divider sx={{ my: 2 }} />
        {(() => {
          const primaryAgent = formatFiduciaryName(formData.financialAgentName, formData.financialAgentNameOther);
          const alternateAgent = formatFiduciaryName(formData.financialAlternateName, formData.financialAlternateNameOther);
          const isIncomplete = !primaryAgent || !alternateAgent;
          return (
            <>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  Financial POA (Client)
                </Typography>
                {isIncomplete && (
                  <Typography variant="body2" sx={{ color: 'error.main', fontWeight: 600 }}>
                    INCOMPLETE
                  </Typography>
                )}
              </Box>
              <Grid container spacing={1}>
                <InfoRow label="Primary Agent" value={primaryAgent} />
                <InfoRow label="Alternate Agent" value={alternateAgent} />
              </Grid>
            </>
          );
        })()}

        {showSpouseInfo && (() => {
          const primaryAgent = formatFiduciaryName(formData.spouseFinancialAgentName, formData.spouseFinancialAgentNameOther);
          const alternateAgent = formatFiduciaryName(formData.spouseFinancialAlternateName, formData.spouseFinancialAlternateNameOther);
          const isIncomplete = !primaryAgent || !alternateAgent;
          return (
            <>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  Financial POA (Spouse)
                </Typography>
                {isIncomplete && (
                  <Typography variant="body2" sx={{ color: 'error.main', fontWeight: 600 }}>
                    INCOMPLETE
                  </Typography>
                )}
              </Box>
              <Grid container spacing={1}>
                <InfoRow label="Primary Agent" value={primaryAgent} />
                <InfoRow label="Alternate Agent" value={alternateAgent} />
              </Grid>
            </>
          );
        })()}
      </Paper>

      {/* Assets Summary */}
      {(formData.realEstate.length > 0 ||
        formData.bankAccounts.length > 0 ||
        formData.retirementAccounts.length > 0 ||
        formData.lifeInsurance.length > 0 ||
        formData.vehicles.length > 0 ||
        formData.otherAssets.length > 0) && (
        <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
          <SectionHeader title="Assets Summary" />

          {formData.realEstate.length > 0 && (
            <>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                Real Estate ({formData.realEstate.length})
              </Typography>
              <TableContainer sx={{ mb: 2 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                      <TableCell sx={{ fontWeight: 600 }}>Address</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Owner</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Ownership Form</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Value</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Mortgage</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Remainder Interest</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {formData.realEstate.map((property, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          {property.street}, {property.city}, {property.state} {property.zip}
                        </TableCell>
                        <TableCell>{property.owner}</TableCell>
                        <TableCell>{property.ownershipForm}</TableCell>
                        <TableCell>{formatCurrency(property.value)}</TableCell>
                        <TableCell>{formatCurrency(property.mortgageBalance)}</TableCell>
                        <TableCell>
                          {(property.ownershipForm === 'Life Estate' || property.ownershipForm === 'Lady Bird Deed')
                            ? (() => {
                                const beneficiaryNames = (property.primaryBeneficiaries || []).map(b => {
                                  // Parse beneficiary value to get display name
                                  if (b.includes(':')) {
                                    const parts = b.split(':');
                                    return parts[parts.length - 1];
                                  }
                                  return b;
                                });
                                // Add "Other" name if specified
                                if (property.remainderInterestOther) {
                                  beneficiaryNames.push(property.remainderInterestOther);
                                }
                                return beneficiaryNames.length > 0 ? beneficiaryNames.join(', ') : '-';
                              })()
                            : '-'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </>
          )}

          {formData.bankAccounts.length > 0 && (
            <>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                Bank Accounts ({formData.bankAccounts.length})
              </Typography>
              <TableContainer sx={{ mb: 2 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                      <TableCell sx={{ fontWeight: 600 }}>Institution</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Owner</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Amount</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {formData.bankAccounts.map((account, index) => (
                      <TableRow key={index}>
                        <TableCell>{account.institution}</TableCell>
                        <TableCell>{account.owner}</TableCell>
                        <TableCell>{formatCurrency(account.amount)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </>
          )}

          {formData.retirementAccounts.length > 0 && (
            <>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                Retirement Accounts ({formData.retirementAccounts.length})
              </Typography>
              <TableContainer sx={{ mb: 2 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                      <TableCell sx={{ fontWeight: 600 }}>Institution</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Owner</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Value</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {formData.retirementAccounts.map((account, index) => (
                      <TableRow key={index}>
                        <TableCell>{account.institution}</TableCell>
                        <TableCell>{account.accountType}</TableCell>
                        <TableCell>{account.owner}</TableCell>
                        <TableCell>{formatCurrency(account.value)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </>
          )}

          {formData.lifeInsurance.length > 0 && (
            <>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                Life Insurance ({formData.lifeInsurance.length})
              </Typography>
              <TableContainer sx={{ mb: 2 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                      <TableCell sx={{ fontWeight: 600 }}>Company</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Insured</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Death Benefit</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Cash Value</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {formData.lifeInsurance.map((policy, index) => (
                      <TableRow key={index}>
                        <TableCell>{policy.company}</TableCell>
                        <TableCell>{policy.insured}</TableCell>
                        <TableCell>{formatCurrency(policy.deathBenefit)}</TableCell>
                        <TableCell>{formatCurrency(policy.cashValue)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </>
          )}

          {formData.vehicles.length > 0 && (
            <>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                Vehicles ({formData.vehicles.length})
              </Typography>
              <TableContainer sx={{ mb: 2 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                      <TableCell sx={{ fontWeight: 600 }}>Year/Make/Model</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Owner</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Value</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {formData.vehicles.map((vehicle, index) => (
                      <TableRow key={index}>
                        <TableCell>{vehicle.yearMakeModel}</TableCell>
                        <TableCell>{vehicle.owner}</TableCell>
                        <TableCell>{formatCurrency(vehicle.value)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </>
          )}

          {formData.otherAssets.length > 0 && (
            <>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                Other Assets ({formData.otherAssets.length})
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                      <TableCell sx={{ fontWeight: 600 }}>Description</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Owner</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Value</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {formData.otherAssets.map((asset, index) => (
                      <TableRow key={index}>
                        <TableCell>{asset.description}</TableCell>
                        <TableCell>{asset.owner}</TableCell>
                        <TableCell>{formatCurrency(asset.value)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </>
          )}

          {/* Assets by Ownership Category */}
          <Divider sx={{ my: 3 }} />
          <Typography variant="h6" sx={{ fontWeight: 600, color: '#1a237e', mb: 2 }}>
            Assets by Ownership Category
          </Typography>

          {/* Category Summary Table */}
          <TableContainer sx={{ mb: 3 }}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: '#e3f2fd' }}>
                  <TableCell sx={{ fontWeight: 600 }}>Category</TableCell>
                  <TableCell sx={{ fontWeight: 600 }} align="right">Total Value</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {assetCategories.clientProbate.length > 0 && (
                  <TableRow>
                    <TableCell>Client Probate Assets</TableCell>
                    <TableCell align="right">
                      {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(calculateCategoryTotal(assetCategories.clientProbate))}
                    </TableCell>
                  </TableRow>
                )}
                {assetCategories.clientNonProbate.length > 0 && (
                  <TableRow>
                    <TableCell>Client Non-Probate Assets</TableCell>
                    <TableCell align="right">
                      {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(calculateCategoryTotal(assetCategories.clientNonProbate))}
                    </TableCell>
                  </TableRow>
                )}
                {showSpouseInfo && assetCategories.spouseProbate.length > 0 && (
                  <TableRow>
                    <TableCell>Spouse Probate Assets</TableCell>
                    <TableCell align="right">
                      {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(calculateCategoryTotal(assetCategories.spouseProbate))}
                    </TableCell>
                  </TableRow>
                )}
                {showSpouseInfo && assetCategories.spouseNonProbate.length > 0 && (
                  <TableRow>
                    <TableCell>Spouse Non-Probate Assets</TableCell>
                    <TableCell align="right">
                      {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(calculateCategoryTotal(assetCategories.spouseNonProbate))}
                    </TableCell>
                  </TableRow>
                )}
                {assetCategories.jointNonProbate.length > 0 && (
                  <TableRow>
                    <TableCell>Joint Non-Probate Assets</TableCell>
                    <TableCell align="right">
                      {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(calculateCategoryTotal(assetCategories.jointNonProbate))}
                    </TableCell>
                  </TableRow>
                )}
                <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                  <TableCell sx={{ fontWeight: 600 }}>Total Estate Value</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>
                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(
                      calculateCategoryTotal(assetCategories.clientProbate) +
                      calculateCategoryTotal(assetCategories.clientNonProbate) +
                      calculateCategoryTotal(assetCategories.spouseProbate) +
                      calculateCategoryTotal(assetCategories.spouseNonProbate) +
                      calculateCategoryTotal(assetCategories.jointNonProbate)
                    )}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>

          {/* Detailed Category Listings */}
          {assetCategories.clientProbate.length > 0 && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#d32f2f', mb: 1 }}>
                Client Probate Assets ({assetCategories.clientProbate.length})
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: '#ffebee' }}>
                      <TableCell sx={{ fontWeight: 600 }}>Description</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
                      <TableCell sx={{ fontWeight: 600 }} align="right">Value</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {assetCategories.clientProbate.map((asset, index) => (
                      <TableRow key={index}>
                        <TableCell>{asset.description}</TableCell>
                        <TableCell>{asset.assetType}{asset.ownershipForm ? ` (${asset.ownershipForm})` : ''}</TableCell>
                        <TableCell align="right">
                          {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(asset.value)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}

          {assetCategories.clientNonProbate.length > 0 && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#2e7d32', mb: 1 }}>
                Client Non-Probate Assets ({assetCategories.clientNonProbate.length})
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: '#e8f5e9' }}>
                      <TableCell sx={{ fontWeight: 600 }}>Description</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
                      <TableCell sx={{ fontWeight: 600 }} align="right">Value</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {assetCategories.clientNonProbate.map((asset, index) => (
                      <TableRow key={index}>
                        <TableCell>{asset.description}</TableCell>
                        <TableCell>{asset.assetType}{asset.ownershipForm ? ` (${asset.ownershipForm})` : ''}</TableCell>
                        <TableCell align="right">
                          {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(asset.value)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}

          {showSpouseInfo && assetCategories.spouseProbate.length > 0 && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#d32f2f', mb: 1 }}>
                Spouse Probate Assets ({assetCategories.spouseProbate.length})
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: '#ffebee' }}>
                      <TableCell sx={{ fontWeight: 600 }}>Description</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
                      <TableCell sx={{ fontWeight: 600 }} align="right">Value</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {assetCategories.spouseProbate.map((asset, index) => (
                      <TableRow key={index}>
                        <TableCell>{asset.description}</TableCell>
                        <TableCell>{asset.assetType}{asset.ownershipForm ? ` (${asset.ownershipForm})` : ''}</TableCell>
                        <TableCell align="right">
                          {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(asset.value)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}

          {showSpouseInfo && assetCategories.spouseNonProbate.length > 0 && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#2e7d32', mb: 1 }}>
                Spouse Non-Probate Assets ({assetCategories.spouseNonProbate.length})
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: '#e8f5e9' }}>
                      <TableCell sx={{ fontWeight: 600 }}>Description</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
                      <TableCell sx={{ fontWeight: 600 }} align="right">Value</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {assetCategories.spouseNonProbate.map((asset, index) => (
                      <TableRow key={index}>
                        <TableCell>{asset.description}</TableCell>
                        <TableCell>{asset.assetType}{asset.ownershipForm ? ` (${asset.ownershipForm})` : ''}</TableCell>
                        <TableCell align="right">
                          {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(asset.value)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}

          {assetCategories.jointNonProbate.length > 0 && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#1565c0', mb: 1 }}>
                Joint Non-Probate Assets ({assetCategories.jointNonProbate.length})
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: '#e3f2fd' }}>
                      <TableCell sx={{ fontWeight: 600 }}>Description</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
                      <TableCell sx={{ fontWeight: 600 }} align="right">Value</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {assetCategories.jointNonProbate.map((asset, index) => (
                      <TableRow key={index}>
                        <TableCell>{asset.description}</TableCell>
                        <TableCell>{asset.assetType}{asset.ownershipForm ? ` (${asset.ownershipForm})` : ''}</TableCell>
                        <TableCell align="right">
                          {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(asset.value)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}
        </Paper>
      )}

      {/* Long-Term Care */}
      <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
        <SectionHeader title="Long-Term Care" />

        {/* Client's Long-Term Care */}
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
          {showSpouseInfo ? "Client's Information" : 'Long-Term Care Information'}
        </Typography>

        <Grid container spacing={1}>
          <InfoRow label="Overall Health" value={formData.clientLongTermCare.overallHealth} />
          <InfoRow label="LTC Concern Level" value={formData.clientLongTermCare.ltcConcernLevel} />
          <InfoRow label="Current Living Situation" value={formData.clientLongTermCare.currentLivingSituation} />
          {formData.clientLongTermCare.currentLivingSituation === 'Other' && (
            <InfoRow label="Living Situation Details" value={formData.clientLongTermCare.livingOther} />
          )}
          <InfoRow label="In LTC Facility" value={formData.clientLongTermCare.inLtcFacility} />
          {formData.clientLongTermCare.inLtcFacility && (
            <>
              <InfoRow label="Facility Name" value={formData.clientLongTermCare.facilityName} />
              <InfoRow label="Care Level" value={formData.clientLongTermCare.currentCareLevel} />
            </>
          )}
          <InfoRow label="Receives Home Help" value={formData.clientLongTermCare.receivesHomeHelp} />
          {formData.clientLongTermCare.receivesHomeHelp && (
            <InfoRow label="Hours Per Week" value={formData.clientLongTermCare.hoursOfHelpPerWeek} />
          )}
          <InfoRow label="Has LTC Insurance" value={formData.clientLongTermCare.hasLtcInsurance} />
          {formData.clientLongTermCare.hasLtcInsurance && (
            <>
              <InfoRow label="Insurance Company" value={formData.clientLongTermCare.ltcInsuranceCompany} />
              <InfoRow label="Daily Benefit" value={formData.clientLongTermCare.ltcInsuranceDailyBenefit} />
              <InfoRow label="Term of Coverage" value={formData.clientLongTermCare.ltcInsuranceTerm} />
              <InfoRow label="Maximum Benefit" value={formData.clientLongTermCare.ltcInsuranceMaximum} />
              <InfoRow label="Care Level Required" value={formData.clientLongTermCare.ltcInsuranceCareLevel} />
            </>
          )}
          <InfoRow label="Care Preference" value={formData.clientLongTermCare.carePreference} />
          <InfoRow label="Likelihood of LTC in 5 Years" value={formData.clientLongTermCare.likelihoodOfLtcIn5Years} />
        </Grid>

        {formData.clientLongTermCare.diagnoses.length > 0 && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.secondary' }}>
              Diagnoses:
            </Typography>
            <Typography variant="body2">
              {formData.clientLongTermCare.diagnoses.join(', ')}
              {formData.clientLongTermCare.diagnosesOther && `, ${formData.clientLongTermCare.diagnosesOther}`}
            </Typography>
          </Box>
        )}

        {formData.clientLongTermCare.primaryGoalsConcerns && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.secondary' }}>
              Primary Goals/Concerns:
            </Typography>
            <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
              {formData.clientLongTermCare.primaryGoalsConcerns}
            </Typography>
          </Box>
        )}

        {/* Spouse's Long-Term Care */}
        {showSpouseInfo && (
          <>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
              Spouse's Information
            </Typography>

            <Grid container spacing={1}>
              <InfoRow label="Overall Health" value={formData.spouseLongTermCare.overallHealth} />
              <InfoRow label="LTC Concern Level" value={formData.spouseLongTermCare.ltcConcernLevel} />
              <InfoRow label="Current Living Situation" value={formData.spouseLongTermCare.currentLivingSituation} />
              {formData.spouseLongTermCare.currentLivingSituation === 'Other' && (
                <InfoRow label="Living Situation Details" value={formData.spouseLongTermCare.livingOther} />
              )}
              <InfoRow label="In LTC Facility" value={formData.spouseLongTermCare.inLtcFacility} />
              {formData.spouseLongTermCare.inLtcFacility && (
                <>
                  <InfoRow label="Facility Name" value={formData.spouseLongTermCare.facilityName} />
                  <InfoRow label="Care Level" value={formData.spouseLongTermCare.currentCareLevel} />
                </>
              )}
              <InfoRow label="Receives Home Help" value={formData.spouseLongTermCare.receivesHomeHelp} />
              {formData.spouseLongTermCare.receivesHomeHelp && (
                <InfoRow label="Hours Per Week" value={formData.spouseLongTermCare.hoursOfHelpPerWeek} />
              )}
              <InfoRow label="Has LTC Insurance" value={formData.spouseLongTermCare.hasLtcInsurance} />
              {formData.spouseLongTermCare.hasLtcInsurance && (
                <>
                  <InfoRow label="Insurance Company" value={formData.spouseLongTermCare.ltcInsuranceCompany} />
                  <InfoRow label="Daily Benefit" value={formData.spouseLongTermCare.ltcInsuranceDailyBenefit} />
                  <InfoRow label="Term of Coverage" value={formData.spouseLongTermCare.ltcInsuranceTerm} />
                  <InfoRow label="Maximum Benefit" value={formData.spouseLongTermCare.ltcInsuranceMaximum} />
                  <InfoRow label="Care Level Required" value={formData.spouseLongTermCare.ltcInsuranceCareLevel} />
                </>
              )}
              <InfoRow label="Care Preference" value={formData.spouseLongTermCare.carePreference} />
              <InfoRow label="Likelihood of LTC in 5 Years" value={formData.spouseLongTermCare.likelihoodOfLtcIn5Years} />
            </Grid>

            {formData.spouseLongTermCare.diagnoses.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.secondary' }}>
                  Diagnoses:
                </Typography>
                <Typography variant="body2">
                  {formData.spouseLongTermCare.diagnoses.join(', ')}
                  {formData.spouseLongTermCare.diagnosesOther && `, ${formData.spouseLongTermCare.diagnosesOther}`}
                </Typography>
              </Box>
            )}

            {formData.spouseLongTermCare.primaryGoalsConcerns && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.secondary' }}>
                  Primary Goals/Concerns:
                </Typography>
                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                  {formData.spouseLongTermCare.primaryGoalsConcerns}
                </Typography>
              </Box>
            )}
          </>
        )}
      </Paper>

      {/* Miscellaneous */}
      <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
        <SectionHeader title="Miscellaneous" />
        <Grid container spacing={1}>
          <InfoRow label="Legal Issues (Client)" value={formData.legalIssues} />
          {showSpouseInfo && <InfoRow label="Legal Issues (Spouse)" value={formData.spouseLegalIssues} />}
          <InfoRow label="Important Papers Location" value={formData.importantPapersLocation} />
          <InfoRow
            label="Has Safe Deposit Box"
            value={formData.hasSafeDepositBox
              ? (formData.safeDepositBoxNumber
                  ? `Yes - Box #${formData.safeDepositBoxNumber}`
                  : 'Yes')
              : 'No'}
          />
          {formData.hasSafeDepositBox && formData.safeDepositBoxBank && (
            <InfoRow label="Safe Deposit Box Bank" value={formData.safeDepositBoxBank} />
          )}
          {formData.hasSafeDepositBox && formData.safeDepositBoxLocation && (
            <InfoRow label="Safe Deposit Box Location" value={formData.safeDepositBoxLocation} />
          )}
        </Grid>

        {formData.dependents.length > 0 && (
          <>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
              Dependents
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                    <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Relationship</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {formData.dependents.map((dependent, index) => (
                    <TableRow key={index}>
                      <TableCell>{dependent.name}</TableCell>
                      <TableCell>{dependent.relationship}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        )}
      </Paper>

      {/* Additional Comments */}
      {formData.additionalComments && (
        <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
          <SectionHeader title="Additional Comments" />
          <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
            {formData.additionalComments}
          </Typography>
        </Paper>
      )}
    </Box>
  );
};

export default SummarySection;
