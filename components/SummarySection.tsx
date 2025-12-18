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
import { useFormContext, MaritalStatus } from '../lib/FormContext';

const SHOW_SPOUSE_STATUSES: MaritalStatus[] = ['Married', 'Second Marriage', 'Domestic Partnership'];

const SectionHeader: React.FC<{ title: string }> = ({ title }) => (
  <Typography variant="h6" sx={{ fontWeight: 600, color: '#1a237e', mb: 2, mt: 3 }}>
    {title}
  </Typography>
);

const InfoRow: React.FC<{ label: string; value: string | number | boolean | null | undefined }> = ({ label, value }) => {
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
      <Box sx={{ display: 'flex', py: 0.5 }}>
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
                  <TableCell sx={{ fontWeight: 600 }}>Distribution</TableCell>
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
                    <TableCell>{child.hasChildren ? `Yes (${child.numberOfChildren})` : 'No'}</TableCell>
                    <TableCell>{child.distributionType || '-'}</TableCell>
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

          <Box sx={{ mt: 2 }}>
            <Grid container spacing={1}>
              <InfoRow label="All Children Healthy" value={formData.allChildrenHealthy} />
              {!formData.allChildrenHealthy && (
                <InfoRow label="Health Explanation" value={formData.childrenHealthExplanation} />
              )}
              <InfoRow label="Any Children Under 21" value={formData.anyChildrenMinors} />
              <InfoRow label="Any Children Disabled" value={formData.anyChildrenDisabled} />
              <InfoRow label="All Children Educated" value={formData.allChildrenEducated} />
              <InfoRow label="Any Marital Problems" value={formData.anyChildrenMaritalProblems} />
              <InfoRow label="Any Receiving SSI" value={formData.anyChildrenReceivingSSI} />
              <InfoRow label="Drug Addiction" value={formData.drugAddiction} />
              <InfoRow label="Alcoholism" value={formData.alcoholism} />
              <InfoRow label="Financial Problems" value={formData.spendthrift} />
              <InfoRow label="Other Concerns" value={formData.childrenOtherConcerns} />
            </Grid>
          </Box>
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
                  <TableCell sx={{ fontWeight: 600 }}>Distribution</TableCell>
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
                    <TableCell>{beneficiary.distributionType || '-'}</TableCell>
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
          <InfoRow label="Has Specific Devises" value={formData.hasSpecificDevises} />
          {formData.hasSpecificDevises && (
            <InfoRow label="Specific Devises" value={formData.specificDevisesDescription} />
          )}
          <InfoRow label="Has General Bequests" value={formData.hasGeneralBequests} />
          {formData.hasGeneralBequests && (
            <InfoRow label="General Bequests" value={formData.generalBequestsDescription} />
          )}
          {formData.dispositiveIntentionsComments && (
            <Grid item xs={12}>
              <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.secondary', mb: 0.5 }}>
                Comments:
              </Typography>
              <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                {formData.dispositiveIntentionsComments}
              </Typography>
            </Grid>
          )}
        </Grid>
      </Paper>

      {/* Fiduciaries */}
      <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
        <SectionHeader title="Fiduciaries" />

        {/* Executors (Client) */}
        {(() => {
          const hasFirst = !!(formData.executorFirst || formData.executorFirstOther);
          const hasAlternate = !!(formData.executorAlternate || formData.executorAlternateOther);
          const isIncomplete = !hasFirst || !hasAlternate;
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
                <InfoRow label="First Choice" value={formData.executorFirst || formData.executorFirstOther} />
                <InfoRow label="Alternate" value={formData.executorAlternate || formData.executorAlternateOther} />
                <InfoRow label="Second Alternate" value={formData.executorSecondAlternate || formData.executorSecondAlternateOther} />
              </Grid>
            </>
          );
        })()}

        {showSpouseInfo && (() => {
          const hasFirst = !!(formData.spouseExecutorFirst || formData.spouseExecutorFirstOther);
          const hasAlternate = !!(formData.spouseExecutorAlternate || formData.spouseExecutorAlternateOther);
          const isIncomplete = !hasFirst || !hasAlternate;
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
                <InfoRow label="First Choice" value={formData.spouseExecutorFirst || formData.spouseExecutorFirstOther} />
                <InfoRow label="Alternate" value={formData.spouseExecutorAlternate || formData.spouseExecutorAlternateOther} />
                <InfoRow label="Second Alternate" value={formData.spouseExecutorSecondAlternate || formData.spouseExecutorSecondAlternateOther} />
              </Grid>
            </>
          );
        })()}

        {/* Trustees (Client) */}
        <Divider sx={{ my: 2 }} />
        {(() => {
          const hasFirst = !!(formData.trusteeFirst || formData.trusteeFirstOther);
          const hasAlternate = !!(formData.trusteeAlternate || formData.trusteeAlternateOther);
          const isIncomplete = !hasFirst || !hasAlternate;
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
                <InfoRow label="First Choice" value={formData.trusteeFirst || formData.trusteeFirstOther} />
                <InfoRow label="Alternate" value={formData.trusteeAlternate || formData.trusteeAlternateOther} />
              </Grid>
            </>
          );
        })()}

        {showSpouseInfo && (() => {
          const hasFirst = !!(formData.spouseTrusteeFirst || formData.spouseTrusteeFirstOther);
          const hasAlternate = !!(formData.spouseTrusteeAlternate || formData.spouseTrusteeAlternateOther);
          const isIncomplete = !hasFirst || !hasAlternate;
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
                <InfoRow label="First Choice" value={formData.spouseTrusteeFirst || formData.spouseTrusteeFirstOther} />
                <InfoRow label="Alternate" value={formData.spouseTrusteeAlternate || formData.spouseTrusteeAlternateOther} />
              </Grid>
            </>
          );
        })()}

        {/* Guardians (Client) - only show if there are minor children */}
        {formData.anyChildrenMinors && (
          <>
            <Divider sx={{ my: 2 }} />
            {(() => {
              const hasFirst = !!(formData.guardianFirst || formData.guardianFirstOther);
              const hasAlternate = !!(formData.guardianAlternate || formData.guardianAlternateOther);
              const isIncomplete = !hasFirst || !hasAlternate;
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
                    <InfoRow label="First Choice" value={formData.guardianFirst || formData.guardianFirstOther} />
                    <InfoRow label="Alternate" value={formData.guardianAlternate || formData.guardianAlternateOther} />
                  </Grid>
                </>
              );
            })()}

            {showSpouseInfo && (() => {
              const hasFirst = !!(formData.spouseGuardianFirst || formData.spouseGuardianFirstOther);
              const hasAlternate = !!(formData.spouseGuardianAlternate || formData.spouseGuardianAlternateOther);
              const isIncomplete = !hasFirst || !hasAlternate;
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
                    <InfoRow label="First Choice" value={formData.spouseGuardianFirst || formData.spouseGuardianFirstOther} />
                    <InfoRow label="Alternate" value={formData.spouseGuardianAlternate || formData.spouseGuardianAlternateOther} />
                  </Grid>
                </>
              );
            })()}
          </>
        )}

        {/* Health Care Agents (Client) */}
        <Divider sx={{ my: 2 }} />
        {(() => {
          const hasFirst = !!(formData.healthCareAgentName || formData.healthCareAgentNameOther);
          const hasAlternate = !!(formData.healthCareAlternateName || formData.healthCareAlternateNameOther);
          const isIncomplete = !hasFirst || !hasAlternate;
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
                <InfoRow label="Primary Agent" value={formData.healthCareAgentName || formData.healthCareAgentNameOther} />
                <InfoRow label="Alternate Agent" value={formData.healthCareAlternateName || formData.healthCareAlternateNameOther} />
                <InfoRow label="Withdraw Artificial Food/Fluid" value={formData.withdrawArtificialFoodFluid} />
              </Grid>
            </>
          );
        })()}

        {showSpouseInfo && (() => {
          const hasFirst = !!(formData.spouseHealthCareAgentName || formData.spouseHealthCareAgentNameOther);
          const hasAlternate = !!(formData.spouseHealthCareAlternateName || formData.spouseHealthCareAlternateNameOther);
          const isIncomplete = !hasFirst || !hasAlternate;
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
                <InfoRow label="Primary Agent" value={formData.spouseHealthCareAgentName || formData.spouseHealthCareAgentNameOther} />
                <InfoRow label="Alternate Agent" value={formData.spouseHealthCareAlternateName || formData.spouseHealthCareAlternateNameOther} />
                <InfoRow label="Withdraw Artificial Food/Fluid" value={formData.spouseWithdrawArtificialFoodFluid} />
              </Grid>
            </>
          );
        })()}

        {/* Financial POA (Client) */}
        <Divider sx={{ my: 2 }} />
        {(() => {
          const hasFirst = !!(formData.financialAgentName || formData.financialAgentNameOther);
          const hasAlternate = !!(formData.financialAlternateName || formData.financialAlternateNameOther);
          const isIncomplete = !hasFirst || !hasAlternate;
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
                <InfoRow label="Primary Agent" value={formData.financialAgentName || formData.financialAgentNameOther} />
                <InfoRow label="Alternate Agent" value={formData.financialAlternateName || formData.financialAlternateNameOther} />
              </Grid>
            </>
          );
        })()}

        {showSpouseInfo && (() => {
          const hasFirst = !!(formData.spouseFinancialAgentName || formData.spouseFinancialAgentNameOther);
          const hasAlternate = !!(formData.spouseFinancialAlternateName || formData.spouseFinancialAlternateNameOther);
          const isIncomplete = !hasFirst || !hasAlternate;
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
                <InfoRow label="Primary Agent" value={formData.spouseFinancialAgentName || formData.spouseFinancialAgentNameOther} />
                <InfoRow label="Alternate Agent" value={formData.spouseFinancialAlternateName || formData.spouseFinancialAlternateNameOther} />
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
                      <TableCell sx={{ fontWeight: 600 }}>Value</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Mortgage</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {formData.realEstate.map((property, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          {property.street}, {property.city}, {property.state} {property.zip}
                        </TableCell>
                        <TableCell>{property.owner}</TableCell>
                        <TableCell>{formatCurrency(property.value)}</TableCell>
                        <TableCell>{formatCurrency(property.mortgageBalance)}</TableCell>
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
                      <TableCell sx={{ fontWeight: 600 }}>Face Amount</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Cash Value</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {formData.lifeInsurance.map((policy, index) => (
                      <TableRow key={index}>
                        <TableCell>{policy.company}</TableCell>
                        <TableCell>{policy.insured}</TableCell>
                        <TableCell>{formatCurrency(policy.faceAmount)}</TableCell>
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
        </Paper>
      )}

      {/* Miscellaneous */}
      <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
        <SectionHeader title="Miscellaneous" />
        <Grid container spacing={1}>
          <InfoRow label="Legal Issues (Client)" value={formData.legalIssues} />
          {showSpouseInfo && <InfoRow label="Legal Issues (Spouse)" value={formData.spouseLegalIssues} />}
          <InfoRow label="Important Papers Location" value={formData.importantPapersLocation} />
          <InfoRow label="Has Safe Deposit Box" value={formData.hasSafeDepositBox} />
          {formData.hasSafeDepositBox && (
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
