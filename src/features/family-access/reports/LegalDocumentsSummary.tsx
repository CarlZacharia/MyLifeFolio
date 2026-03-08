import React from 'react';
import { Typography, Box, Chip } from '@mui/material';
import ReportLayout, { ReportSectionTitle } from './ReportLayout';
import { str, BaseReportProps } from './reportHelpers';

interface LegalDocumentsSummaryProps extends BaseReportProps {}

const body = { fontSize: '12px', fontFamily: '"Jost", sans-serif' } as const;

const LegalDocumentsSummary: React.FC<LegalDocumentsSummaryProps> = ({ data, ownerName, embedded }) => {
  const clientPlan = data.clientCurrentEstatePlan as Record<string, unknown> | undefined;
  const spousePlan = data.spouseCurrentEstatePlan as Record<string, unknown> | undefined;

  const renderPlan = (plan: Record<string, unknown> | undefined, label: string) => {
    if (!plan) return null;

    const docs = [
      { key: 'hasWill', label: 'Last Will & Testament', date: plan.willDateSigned, state: plan.willStateSigned },
      { key: 'hasTrust', label: 'Revocable Trust', date: plan.trustDateSigned, state: plan.trustStateSigned },
      { key: 'hasIrrevocableTrust', label: 'Irrevocable Trust', date: plan.irrevocableTrustDateSigned, state: plan.irrevocableTrustStateResided },
      { key: 'hasFinancialPOA', label: 'Financial Power of Attorney', date: plan.financialPOADateSigned, state: plan.financialPOAStateSigned },
      { key: 'hasHealthCarePOA', label: 'Health Care Power of Attorney', date: plan.healthCarePOADateSigned, state: plan.healthCarePOAStateSigned },
      { key: 'hasLivingWill', label: 'Living Will / Advance Directive', date: plan.livingWillDateSigned, state: plan.livingWillStateSigned },
    ];

    return (
      <Box sx={{ mb: 3 }}>
        <ReportSectionTitle>{label}</ReportSectionTitle>
        {docs.map((doc) => (
          <Box key={doc.key} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <Chip
              label={plan[doc.key] ? 'Yes' : 'No'}
              size="small"
              color={plan[doc.key] ? 'success' : 'default'}
              sx={{ minWidth: 48 }}
            />
            <Typography sx={body}>{doc.label}</Typography>
            {!!plan[doc.key] && !!doc.date && (
              <Typography sx={{ ...body, color: 'text.secondary' }}>
                (Signed: {str(doc.date)}{doc.state ? `, ${str(doc.state)}` : ''})
              </Typography>
            )}
          </Box>
        ))}
        {!!plan.trustName && (
          <Typography sx={{ ...body, mt: 1 }}>
            <strong>Trust Name:</strong> {str(plan.trustName)}
          </Typography>
        )}
      </Box>
    );
  };

  const renderFiduciary = (label: string, primary: string, alt1: string, alt2: string) => {
    const p = data[primary] as string;
    const a1 = data[alt1] as string;
    const a2 = data[alt2] as string;
    if (!p && !a1 && !a2) return null;
    return (
      <Box sx={{ mb: 1 }}>
        <Typography sx={body}><strong>{label}:</strong> {p || 'Not designated'}</Typography>
        {a1 && <Typography sx={{ ...body, pl: 2 }}>1st Alternate: {a1}</Typography>}
        {a2 && <Typography sx={{ ...body, pl: 2 }}>2nd Alternate: {a2}</Typography>}
      </Box>
    );
  };

  const content = (
    <>
      {renderPlan(clientPlan, 'Client Estate Plan Documents')}
      {renderPlan(spousePlan, 'Spouse Estate Plan Documents')}

      <Box sx={{ mt: 2 }}>
        <ReportSectionTitle>Fiduciaries - Client</ReportSectionTitle>
        {renderFiduciary('Executor', 'executorFirst', 'executorAlternate', 'executorSecondAlternate')}
        {renderFiduciary('Trustee', 'trusteeFirst', 'trusteeAlternate', 'trusteeSecondAlternate')}
        {renderFiduciary('Guardian', 'guardianFirst', 'guardianAlternate', 'guardianAlternate')}
        {renderFiduciary('Health Care Agent', 'healthCareAgentName', 'healthCareAlternateName', 'healthCareSecondAlternateName')}
        {renderFiduciary('Financial Agent', 'financialAgentName', 'financialAlternateName', 'financialSecondAlternateName')}
      </Box>

      {!!(data.spouseExecutorFirst || data.spouseTrusteeFirst) && (
        <Box sx={{ mt: 2 }}>
          <ReportSectionTitle>Fiduciaries - Spouse</ReportSectionTitle>
          {renderFiduciary('Executor', 'spouseExecutorFirst', 'spouseExecutorAlternate', 'spouseExecutorSecondAlternate')}
          {renderFiduciary('Trustee', 'spouseTrusteeFirst', 'spouseTrusteeAlternate', 'spouseTrusteeSecondAlternate')}
          {renderFiduciary('Health Care Agent', 'spouseHealthCareAgentName', 'spouseHealthCareAlternateName', 'spouseHealthCareSecondAlternateName')}
          {renderFiduciary('Financial Agent', 'spouseFinancialAgentName', 'spouseFinancialAlternateName', 'spouseFinancialSecondAlternateName')}
        </Box>
      )}
    </>
  );

  if (embedded) return content;

  return (
    <ReportLayout title="Legal Documents Summary" ownerName={ownerName}>
      {content}
    </ReportLayout>
  );
};

export default LegalDocumentsSummary;
