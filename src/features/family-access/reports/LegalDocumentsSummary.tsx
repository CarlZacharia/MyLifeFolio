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

    interface DocRow {
      key: string;
      label: string;
      date: unknown;
      state: unknown;
      storage: unknown;
      storageOther: unknown;
      storageNotes: unknown;
      atty: { name: unknown; firm: unknown; email: unknown; phone: unknown; address: unknown };
    }

    const docs: DocRow[] = [
      {
        key: 'hasWill', label: 'Last Will & Testament',
        date: plan.willDateSigned, state: plan.willStateSigned,
        storage: plan.willStorageLocation, storageOther: plan.willStorageLocationOther, storageNotes: plan.willStorageNotes,
        atty: { name: plan.willAttorneyName, firm: plan.willAttorneyFirm, email: plan.willAttorneyEmail, phone: plan.willAttorneyPhone, address: plan.willAttorneyAddress },
      },
      {
        key: 'hasTrust', label: 'Revocable Trust',
        date: plan.trustDateSigned, state: plan.trustStateSigned,
        storage: plan.trustStorageLocation, storageOther: plan.trustStorageLocationOther, storageNotes: plan.trustStorageNotes,
        atty: { name: plan.trustAttorneyName, firm: plan.trustAttorneyFirm, email: plan.trustAttorneyEmail, phone: plan.trustAttorneyPhone, address: plan.trustAttorneyAddress },
      },
      {
        key: 'hasIrrevocableTrust', label: 'Irrevocable Trust',
        date: plan.irrevocableTrustDateSigned, state: plan.irrevocableTrustStateResided,
        storage: plan.irrevocableTrustStorageLocation, storageOther: plan.irrevocableTrustStorageLocationOther, storageNotes: plan.irrevocableTrustStorageNotes,
        atty: { name: plan.irrevocableTrustAttorneyName, firm: plan.irrevocableTrustAttorneyFirm, email: plan.irrevocableTrustAttorneyEmail, phone: plan.irrevocableTrustAttorneyPhone, address: plan.irrevocableTrustAttorneyAddress },
      },
      {
        key: 'hasFinancialPOA', label: 'Financial Power of Attorney',
        date: plan.financialPOADateSigned, state: plan.financialPOAStateSigned,
        storage: plan.financialPOAStorageLocation, storageOther: plan.financialPOAStorageLocationOther, storageNotes: plan.financialPOAStorageNotes,
        atty: { name: plan.financialPOAAttorneyName, firm: plan.financialPOAAttorneyFirm, email: plan.financialPOAAttorneyEmail, phone: plan.financialPOAAttorneyPhone, address: plan.financialPOAAttorneyAddress },
      },
      {
        key: 'hasHealthCarePOA', label: 'Health Care Power of Attorney',
        date: plan.healthCarePOADateSigned, state: plan.healthCarePOAStateSigned,
        storage: plan.healthCarePOAStorageLocation, storageOther: plan.healthCarePOAStorageLocationOther, storageNotes: plan.healthCarePOAStorageNotes,
        atty: { name: plan.healthCarePOAAttorneyName, firm: plan.healthCarePOAAttorneyFirm, email: plan.healthCarePOAAttorneyEmail, phone: plan.healthCarePOAAttorneyPhone, address: plan.healthCarePOAAttorneyAddress },
      },
      {
        key: 'hasLivingWill', label: 'Living Will / Advance Directive',
        date: plan.livingWillDateSigned, state: plan.livingWillStateSigned,
        storage: plan.livingWillStorageLocation, storageOther: plan.livingWillStorageLocationOther, storageNotes: plan.livingWillStorageNotes,
        atty: { name: plan.livingWillAttorneyName, firm: plan.livingWillAttorneyFirm, email: plan.livingWillAttorneyEmail, phone: plan.livingWillAttorneyPhone, address: plan.livingWillAttorneyAddress },
      },
    ];

    const fmtStorage = (doc: DocRow): string => {
      const loc = str(doc.storage);
      if (!loc) return '';
      if (loc === 'Other') return str(doc.storageOther) || 'Other';
      const notes = str(doc.storageNotes);
      return notes ? `${loc} — ${notes}` : loc;
    };

    const renderAttorney = (doc: DocRow) => {
      const { name, firm, email, phone, address } = doc.atty;
      const has = !!(str(name) || str(firm) || str(email) || str(phone) || str(address));
      if (!has) return null;
      const headline = [str(name), str(firm)].filter(Boolean).join(' — ');
      const contact = [str(email), str(phone)].filter(Boolean).join(' • ');
      return (
        <Box sx={{ pl: 4, mt: 0.5 }}>
          {headline && <Typography sx={{ ...body }}><strong>Drafting Attorney:</strong> {headline}</Typography>}
          {contact && <Typography sx={{ ...body, color: 'text.secondary' }}>{contact}</Typography>}
          {!!str(address) && <Typography sx={{ ...body, color: 'text.secondary' }}>{str(address)}</Typography>}
        </Box>
      );
    };

    return (
      <Box sx={{ mb: 3 }}>
        <ReportSectionTitle>{label}</ReportSectionTitle>
        {docs.map((doc) => {
          const has = !!plan[doc.key];
          const storage = has ? fmtStorage(doc) : '';
          return (
            <Box key={doc.key} sx={{ mb: 1.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Chip
                  label={has ? 'Yes' : 'No'}
                  size="small"
                  color={has ? 'success' : 'default'}
                  sx={{ minWidth: 48 }}
                />
                <Typography sx={body}>{doc.label}</Typography>
                {has && !!doc.date && (
                  <Typography sx={{ ...body, color: 'text.secondary' }}>
                    (Signed: {str(doc.date)}{doc.state ? `, ${str(doc.state)}` : ''})
                  </Typography>
                )}
              </Box>
              {has && !!storage && (
                <Typography sx={{ ...body, pl: 4, mt: 0.5 }}>
                  <strong>Stored:</strong> {storage}
                </Typography>
              )}
              {has && renderAttorney(doc)}
            </Box>
          );
        })}
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
