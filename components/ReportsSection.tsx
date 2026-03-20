'use client';

import React, { useState } from 'react';
import {
  Box,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Paper,
  Typography,
  Tabs,
  Tab,
} from '@mui/material';
import BuildIcon from '@mui/icons-material/Build';
import SummarizeIcon from '@mui/icons-material/Summarize';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import ContactPhoneIcon from '@mui/icons-material/ContactPhone';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import SecurityIcon from '@mui/icons-material/Security';
import PeopleIcon from '@mui/icons-material/People';
import GavelIcon from '@mui/icons-material/Gavel';
import HealingIcon from '@mui/icons-material/Healing';
import VolunteerActivismIcon from '@mui/icons-material/VolunteerActivism';
import AssignmentIcon from '@mui/icons-material/Assignment';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import FingerprintIcon from '@mui/icons-material/Fingerprint';
import ArticleIcon from '@mui/icons-material/Article';
import { useFormContext } from '../lib/FormContext';
import { buildReportData } from '../lib/buildReportData';
import { folioColors } from './FolioModal';
import EmergencyMedicalSummary from '../src/features/family-access/reports/EmergencyMedicalSummary';
import FamilyContactSheet from '../src/features/family-access/reports/Familycontactsheet';
import AssetInventory from '../src/features/family-access/reports/Assetinventory';
import InsuranceSummary from '../src/features/family-access/reports/Insurancesummary';
import AdvisorDirectory from '../src/features/family-access/reports/Advisordirectory';
import EstatePlanningOverview from '../src/features/family-access/reports/EstatePlanningOverview';
import WhatToDoIfINeedCare from '../src/features/family-access/reports/Whattodoifineedcare';
import FuneralInstructions from '../src/features/family-access/reports/FuneralInstructions';
import WhatToDoIfIDie from '../src/features/family-access/reports/WhatToDoIfIDie';
import FamilyBriefingReport from '../src/features/family-access/reports/Familybriefingreport';
import DigitalLifeSummary from '../src/features/family-access/reports/DigitalLifeSummary';
import PersonalPropertyMemorandum from '../src/features/family-access/reports/PersonalPropertyMemorandum';
import FolioHelpModal, { FolioHelpButton, useFolioHelp } from './FolioHelpModal';
import { reportsHelp } from './folioHelpContent';
import CustomReportBuilder from './CustomReportBuilder';

// ─── Report definitions ──────────────────────────────────────────────────────

interface ReportDef {
  id: string;
  label: string;
  icon: React.ReactNode;
}

export const REPORTS: ReportDef[] = [
  { id: 'emergency-medical', label: 'Emergency Medical Summary', icon: <LocalHospitalIcon /> },
  { id: 'family-contact', label: 'Family Contact Sheet', icon: <ContactPhoneIcon /> },
  { id: 'asset-inventory', label: 'Asset Inventory', icon: <AccountBalanceIcon /> },
  { id: 'insurance-summary', label: 'Insurance Summary', icon: <SecurityIcon /> },
  { id: 'advisor-directory', label: 'Advisor Directory', icon: <PeopleIcon /> },
  { id: 'estate-planning', label: 'Estate Planning Overview', icon: <GavelIcon /> },
  { id: 'need-care', label: 'What To Do If I Need Care', icon: <HealingIcon /> },
  { id: 'funeral-instructions', label: 'Funeral Instructions', icon: <VolunteerActivismIcon /> },
  { id: 'what-to-do', label: 'What To Do If I Die', icon: <AssignmentIcon /> },
  { id: 'digital-life', label: 'Digital Life Summary', icon: <FingerprintIcon /> },
  { id: 'family-briefing', label: 'Family Briefing Report', icon: <MenuBookIcon /> },
  { id: 'ppm-client', label: 'Personal Property Memo — Client', icon: <ArticleIcon /> },
  { id: 'ppm-spouse', label: 'Personal Property Memo — Spouse', icon: <ArticleIcon /> },
];

// ─── Shared intake builder (delegates to buildReportData) ────────────────────

const useReportData = () => {
  const { formData } = useFormContext();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return buildReportData(formData as unknown as Record<string, any>);
};

// ─── Report renderer (shared between client & family views) ─────────────────

export const renderReportById = (reportId: string, data: ReturnType<typeof buildReportData>) => {
  switch (reportId) {
    case 'emergency-medical':
      return (
        <EmergencyMedicalSummary
          intake={data.emergencyIntake}
          vitals={data.vitals}
          allergies={data.allergies}
          medications={data.medications}
          conditions={data.conditions}
          providers={data.providers}
          equipment={data.equipment}
          pharmacies={data.pharmacies}
          surgeries={data.surgeries}
        />
      );
    case 'family-contact':
      return (
        <FamilyContactSheet
          intake={data.familyIntake}
          children={data.children}
          dependents={data.dependents}
          beneficiaries={data.beneficiaries}
          friendsNeighbors={data.friendsNeighbors}
          advisors={data.advisors}
        />
      );
    case 'asset-inventory':
      return (
        <AssetInventory
          intake={data.assetIntake}
          bankAccounts={data.bankAccounts}
          investments={data.investments}
          retirementAccounts={data.retirementAccounts}
          realEstate={data.realEstate}
          vehicles={data.vehicles}
          lifeInsurance={data.lifeInsurance}
          businessInterests={data.businessInterests}
          digitalAssets={data.digitalAssets}
          otherAssets={data.otherAssets}
        />
      );
    case 'insurance-summary':
      return (
        <InsuranceSummary
          intake={data.assetIntake}
          lifeInsurance={data.lifeInsurance}
          insuranceCoverage={data.insuranceCoverage}
          medicalInsurance={data.medicalInsurance}
          clientMedicalInsurance={data.clientMedicalInsurance}
          spouseMedicalInsurance={data.spouseMedicalInsurance}
          longTermCare={data.longTermCare}
        />
      );
    case 'advisor-directory':
      return (
        <AdvisorDirectory
          intake={data.familyIntake}
          advisors={data.advisors}
          medicalProviders={data.providers}
          pharmacies={data.pharmacies}
        />
      );
    case 'estate-planning':
      return (
        <EstatePlanningOverview
          intake={data.estateIntake}
          currentEstatePlans={data.currentEstatePlans}
          distributionPlans={data.distributionPlans}
          beneficiaries={data.estateBeneficiaries}
          children={data.estateChildren}
          specificGifts={data.estateSpecificGifts}
          cashGifts={data.estateCashGifts}
          lifetimeGifts={data.estateLifetimeGifts}
          charities={data.estateCharities}
        />
      );
    case 'need-care':
      return (
        <WhatToDoIfINeedCare
          intake={data.careIntake}
          longTermCare={data.detailedLongTermCare}
          carePreferences={data.carePreferences}
          currentEstatePlans={data.currentEstatePlans}
          medicalProviders={data.providers}
          medications={data.medications}
          medicalConditions={data.conditions}
          allergies={data.allergies}
          advisors={data.advisors}
          clientIncome={data.briefingClientIncome}
          spouseIncome={data.briefingSpouseIncome}
          clientMedicalInsurance={data.clientMedicalInsurance}
          spouseMedicalInsurance={data.spouseMedicalInsurance}
        />
      );
    case 'funeral-instructions':
      return (
        <FuneralInstructions
          intake={data.funeralIntake}
          endOfLife={data.funeralEndOfLife}
          legacyCharityPreferences={data.funeralLegacyCharityPreferences}
          legacyCharityOrganizations={data.funeralLegacyCharityOrganizations}
          legacyEntries={data.funeralLegacyEntries}
        />
      );
    case 'what-to-do':
      return (
        <WhatToDoIfIDie
          intake={data.whatToDoIntake}
          currentEstatePlans={data.currentEstatePlans}
          advisors={data.advisors}
          bankAccounts={data.bankAccounts}
          realEstate={data.realEstate}
          lifeInsurance={data.lifeInsurance}
          retirementAccounts={data.retirementAccounts}
          digitalAssets={data.digitalAssets}
          subscriptions={data.whatToDoSubscriptions}
        />
      );
    case 'digital-life':
      return (
        <DigitalLifeSummary
          intake={data.digitalLifeIntake}
          digitalAssets={data.digitalAssets}
          subscriptions={data.digitalLifeSubscriptions}
        />
      );
    case 'family-briefing':
      return (
        <FamilyBriefingReport
          intake={data.briefingIntake}
          currentEstatePlans={data.currentEstatePlans}
          children={data.estateChildren}
          beneficiaries={data.estateBeneficiaries}
          advisors={data.advisors}
          lifeInsurance={data.lifeInsurance}
          retirementAccounts={data.retirementAccounts}
          realEstate={data.realEstate}
          bankAccounts={data.bankAccounts}
          investments={data.investments}
          clientIncome={data.briefingClientIncome}
          spouseIncome={data.briefingSpouseIncome}
          clientMedicalInsurance={data.briefingClientMedIns}
          spouseMedicalInsurance={data.briefingSpouseMedIns}
          longTermCare={data.briefingLongTermCare}
        />
      );
    case 'ppm-client':
      return (
        <PersonalPropertyMemorandum
          intake={data.assetIntake}
          otherAssets={data.otherAssets}
          ownerType="client"
        />
      );
    case 'ppm-spouse':
      return (
        <PersonalPropertyMemorandum
          intake={data.assetIntake}
          otherAssets={data.otherAssets}
          ownerType="spouse"
        />
      );
    default:
      return null;
  }
};

// ─── Main Component ──────────────────────────────────────────────────────────

const ReportsSection = () => {
  const [activeReport, setActiveReport] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<0 | 1>(0);
  const data = useReportData();
  const { showHelp, openHelp, closeHelp } = useFolioHelp();

  const rendered = activeReport ? renderReportById(activeReport, data) : null;

  return (
    <Box sx={{ minHeight: 600 }}>
      <FolioHelpModal open={showHelp} onClose={closeHelp} content={reportsHelp} />

      {/* ── Tab toggle ── */}
      <Box
        sx={{
          borderBottom: `1px solid ${folioColors.parchment}`,
          mb: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Tabs
          value={activeTab}
          onChange={(_, v) => setActiveTab(v)}
          sx={{
            minHeight: 40,
            '& .MuiTab-root': {
              fontFamily: '"Jost", sans-serif',
              fontWeight: 500,
              fontSize: '13px',
              textTransform: 'none',
              minHeight: 40,
              letterSpacing: '0.02em',
              color: folioColors.inkLight,
              '&.Mui-selected': { color: folioColors.ink, fontWeight: 600 },
            },
            '& .MuiTabs-indicator': { bgcolor: folioColors.accent, height: 2.5 },
          }}
        >
          <Tab icon={<SummarizeIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Standard Reports" />
          <Tab icon={<BuildIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Custom Report Builder" />
        </Tabs>
        {activeTab === 0 && (
          <FolioHelpButton onClick={openHelp} accentColor={folioColors.accent} tooltip="Reports help" />
        )}
      </Box>

      {/* ── Tab content ── */}
      {activeTab === 0 ? (
        <Box sx={{ display: 'flex', gap: 2 }}>
          {/* ── Left sidebar: report list (20%) ── */}
          <Paper
            variant="outlined"
            sx={{
              width: '20%',
              minWidth: 200,
              flexShrink: 0,
              borderRadius: 2,
              overflow: 'hidden',
            }}
          >
            <Box
              sx={{
                bgcolor: folioColors.ink,
                color: '#fff',
                px: 2,
                py: 1.5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Typography
                sx={{
                  fontFamily: '"Jost", sans-serif',
                  fontWeight: 600,
                  fontSize: '14px',
                  letterSpacing: '0.03em',
                }}
              >
                Reports
              </Typography>
            </Box>

            <List disablePadding>
              {REPORTS.map((report) => (
                <ListItemButton
                  key={report.id}
                  selected={activeReport === report.id}
                  onClick={() => setActiveReport(report.id)}
                  sx={{
                    py: 1.5,
                    px: 2,
                    borderBottom: `1px solid ${folioColors.parchment}`,
                    '&.Mui-selected': {
                      bgcolor: folioColors.cream,
                      borderLeft: `3px solid ${folioColors.accent}`,
                      '&:hover': { bgcolor: folioColors.creamDark },
                    },
                    '&:hover': { bgcolor: folioColors.cream },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 36,
                      color: activeReport === report.id ? folioColors.accent : folioColors.inkLight,
                    }}
                  >
                    {report.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={report.label}
                    primaryTypographyProps={{
                      fontFamily: '"Jost", sans-serif',
                      fontSize: '13px',
                      fontWeight: activeReport === report.id ? 600 : 400,
                      color: activeReport === report.id ? folioColors.ink : folioColors.inkLight,
                    }}
                  />
                </ListItemButton>
              ))}
            </List>
          </Paper>

          {/* ── Right area: report display (80%) ── */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            {rendered || (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100%',
                  minHeight: 400,
                }}
              >
                <Typography
                  sx={{
                    fontFamily: '"Jost", sans-serif',
                    fontSize: '15px',
                    color: folioColors.inkFaint,
                  }}
                >
                  Select a report from the list to view it here.
                </Typography>
              </Box>
            )}
          </Box>
        </Box>
      ) : (
        <CustomReportBuilder />
      )}
    </Box>
  );
};

export default ReportsSection;
