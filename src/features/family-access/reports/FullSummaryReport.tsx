import React from 'react';
import { Box, Divider } from '@mui/material';
import ReportLayout from './ReportLayout';
import EmergencyContacts from './EmergencyContacts';
import MedicalSummary from './MedicalSummary';
import FinancialSnapshot from './FinancialSnapshot';
import InsuranceOverview from './InsuranceOverview';
import LegalDocumentsSummary from './LegalDocumentsSummary';
import AdvisorsContacts from './AdvisorsContacts';
import EndOfLifeWishes from './EndOfLifeWishes';
import FamilyOverview from './FamilyOverview';

interface FullSummaryReportProps {
  data: Record<string, unknown>;
  ownerName: string;
  accessSections: string[];
}

const FullSummaryReport: React.FC<FullSummaryReportProps> = ({ data, ownerName, accessSections }) => {
  const has = (sections: string[]) => sections.every((s) => accessSections.includes(s));

  return (
    <ReportLayout title="Full Summary Report" ownerName={ownerName}>
      <Box sx={{ '& > *': { mb: 4, boxShadow: 'none', border: 'none' } }}>
        {has(['personal', 'medical', 'advisors']) && (
          <>
            <EmergencyContacts data={data} ownerName={ownerName} />
            <Divider sx={{ my: 3 }} />
          </>
        )}
        {has(['medical']) && (
          <>
            <MedicalSummary data={data} ownerName={ownerName} />
            <Divider sx={{ my: 3 }} />
          </>
        )}
        {has(['financial']) && (
          <>
            <FinancialSnapshot data={data} ownerName={ownerName} />
            <Divider sx={{ my: 3 }} />
          </>
        )}
        {has(['insurance', 'financial']) && (
          <>
            <InsuranceOverview data={data} ownerName={ownerName} />
            <Divider sx={{ my: 3 }} />
          </>
        )}
        {has(['legal']) && (
          <>
            <LegalDocumentsSummary data={data} ownerName={ownerName} />
            <Divider sx={{ my: 3 }} />
          </>
        )}
        {has(['advisors']) && (
          <>
            <AdvisorsContacts data={data} ownerName={ownerName} />
            <Divider sx={{ my: 3 }} />
          </>
        )}
        {has(['end_of_life']) && (
          <>
            <EndOfLifeWishes data={data} ownerName={ownerName} />
            <Divider sx={{ my: 3 }} />
          </>
        )}
        {has(['family']) && (
          <FamilyOverview data={data} ownerName={ownerName} />
        )}
      </Box>
    </ReportLayout>
  );
};

export default FullSummaryReport;
