import React, { useState } from 'react';
import {
  Box, Typography, Card, CardContent, CardActionArea, Grid, Chip, IconButton,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ContactPhoneIcon from '@mui/icons-material/ContactPhone';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import SecurityIcon from '@mui/icons-material/Security';
import GavelIcon from '@mui/icons-material/Gavel';
import PeopleIcon from '@mui/icons-material/People';
import VolunteerActivismIcon from '@mui/icons-material/VolunteerActivism';
import FamilyRestroomIcon from '@mui/icons-material/FamilyRestroom';
import ContactsIcon from '@mui/icons-material/Contacts';
import SummarizeIcon from '@mui/icons-material/Summarize';
import { supabase } from '../../../lib/supabase';
import EmergencyContacts from './reports/EmergencyContacts';
import MedicalSummary from './reports/MedicalSummary';
import FinancialSnapshot from './reports/FinancialSnapshot';
import InsuranceOverview from './reports/InsuranceOverview';
import LegalDocumentsSummary from './reports/LegalDocumentsSummary';
import AdvisorsContacts from './reports/AdvisorsContacts';
import EndOfLifeWishes from './reports/EndOfLifeWishes';
import FamilyOverview from './reports/FamilyOverview';
import ImportantAccountContacts from './reports/ImportantAccountContacts';
import FullSummaryReport from './reports/FullSummaryReport';

interface ReportDefinition {
  id: string;
  name: string;
  description: string;
  requiredSections: string[];
  icon: React.ReactNode;
}

const REPORT_DEFINITIONS: ReportDefinition[] = [
  { id: 'emergency', name: 'Emergency Contacts', description: 'Key contacts, medical providers, and advisors', requiredSections: ['personal', 'medical', 'advisors'], icon: <ContactPhoneIcon /> },
  { id: 'medical', name: 'Medical Summary', description: 'Insurance, providers, conditions, and medications', requiredSections: ['medical'], icon: <LocalHospitalIcon /> },
  { id: 'financial', name: 'Financial Snapshot', description: 'Accounts, real estate, and investment totals', requiredSections: ['financial'], icon: <AccountBalanceIcon /> },
  { id: 'insurance', name: 'Insurance Overview', description: 'All policies with contacts', requiredSections: ['insurance', 'financial'], icon: <SecurityIcon /> },
  { id: 'legal', name: 'Legal Documents Summary', description: 'Estate plan documents and fiduciaries', requiredSections: ['legal'], icon: <GavelIcon /> },
  { id: 'advisors', name: 'Advisors & Contacts', description: 'Professional advisors and friends', requiredSections: ['advisors'], icon: <PeopleIcon /> },
  { id: 'endoflife', name: 'End of Life Wishes', description: 'Funeral preferences and advance directives', requiredSections: ['end_of_life'], icon: <VolunteerActivismIcon /> },
  { id: 'family', name: 'Family Overview', description: 'Children, beneficiaries, and pet care', requiredSections: ['family'], icon: <FamilyRestroomIcon /> },
  { id: 'accounts', name: 'Important Account Contacts', description: 'Institution contact info (no account numbers)', requiredSections: ['financial', 'insurance'], icon: <ContactsIcon /> },
  { id: 'full', name: 'Full Summary Report', description: 'Comprehensive summary of all authorized data', requiredSections: ['personal', 'medical', 'financial', 'legal', 'advisors', 'end_of_life', 'insurance', 'family'], icon: <SummarizeIcon /> },
];

interface ReportViewerProps {
  data: Record<string, unknown>;
  ownerName: string;
  ownerId: string;
  accessSections: string[];
  accessorEmail: string;
  accessorName: string;
}

const ReportViewer: React.FC<ReportViewerProps> = ({
  data, ownerName, ownerId, accessSections, accessorEmail, accessorName,
}) => {
  const [activeReport, setActiveReport] = useState<string | null>(null);

  const availableReports = REPORT_DEFINITIONS.filter((r) =>
    r.requiredSections.every((s) => accessSections.includes(s))
  );

  const logAccess = async (reportName: string, sections: string[]) => {
    await supabase.from('folio_access_log').insert({
      owner_id: ownerId,
      accessor_email: accessorEmail,
      accessor_name: accessorName,
      access_type: 'report',
      report_name: reportName,
      sections_queried: sections,
    });
  };

  const handleOpenReport = (report: ReportDefinition) => {
    setActiveReport(report.id);
    logAccess(report.name, report.requiredSections);
  };

  const renderReport = () => {
    switch (activeReport) {
      case 'emergency': return <EmergencyContacts data={data} ownerName={ownerName} />;
      case 'medical': return <MedicalSummary data={data} ownerName={ownerName} />;
      case 'financial': return <FinancialSnapshot data={data} ownerName={ownerName} />;
      case 'insurance': return <InsuranceOverview data={data} ownerName={ownerName} />;
      case 'legal': return <LegalDocumentsSummary data={data} ownerName={ownerName} />;
      case 'advisors': return <AdvisorsContacts data={data} ownerName={ownerName} />;
      case 'endoflife': return <EndOfLifeWishes data={data} ownerName={ownerName} />;
      case 'family': return <FamilyOverview data={data} ownerName={ownerName} />;
      case 'accounts': return <ImportantAccountContacts data={data} ownerName={ownerName} />;
      case 'full': return <FullSummaryReport data={data} ownerName={ownerName} accessSections={accessSections} />;
      default: return null;
    }
  };

  if (activeReport) {
    return (
      <Box>
        <Box sx={{ mb: 2 }} className="no-print">
          <IconButton onClick={() => setActiveReport(null)} sx={{ color: '#1a237e' }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography component="span" variant="body1" sx={{ ml: 1, color: '#1a237e', fontWeight: 500 }}>
            Back to Reports
          </Typography>
        </Box>
        {renderReport()}
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2, color: '#1a237e' }}>Available Reports</Typography>
      {availableReports.length === 0 ? (
        <Typography color="text.secondary">No reports are available with your current access level.</Typography>
      ) : (
        <Grid container spacing={2}>
          {availableReports.map((report) => (
            <Grid item xs={12} sm={6} md={4} key={report.id}>
              <Card sx={{ height: '100%', '&:hover': { boxShadow: 4 }, transition: 'box-shadow 0.2s' }}>
                <CardActionArea onClick={() => handleOpenReport(report)} sx={{ height: '100%', p: 2 }}>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Box sx={{ color: '#1a237e', mb: 1, '& > svg': { fontSize: 36 } }}>
                      {report.icon}
                    </Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>
                      {report.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {report.description}
                    </Typography>
                    <Box sx={{ mt: 1, display: 'flex', gap: 0.5, flexWrap: 'wrap', justifyContent: 'center' }}>
                      {report.requiredSections.map((s) => (
                        <Chip key={s} label={s} size="small" variant="outlined" sx={{ fontSize: '0.7rem' }} />
                      ))}
                    </Box>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default ReportViewer;
