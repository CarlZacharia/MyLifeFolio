import React, { useState, useMemo } from 'react';
import {
  Box, Typography, Card, CardContent, CardActionArea, Grid, IconButton, Divider, Chip,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AssessmentIcon from '@mui/icons-material/Assessment';
import { supabase } from '../../../lib/supabase';
import { buildReportData } from '../../../lib/buildReportData';
import { REPORTS, renderReportById } from '../../../components/ReportsSection';
import { CATEGORY_TO_REPORT_IDS } from '../../../lib/reportBuilderConfig';
import { reportSectionsGranted } from '../../../lib/folioCategoryConfig';
import ReportLayout from './reports/ReportLayout';
import { SavedReportConfig } from '../../../lib/savedReportService';

interface ReportViewerProps {
  data: Record<string, unknown>;
  ownerName: string;
  ownerId: string;
  accessSections: string[];
  accessorEmail: string;
  accessorName: string;
  allowedReports?: string[];
  customReports?: SavedReportConfig[];
}

const ReportViewer: React.FC<ReportViewerProps> = ({
  data, ownerName, ownerId, accessSections, accessorEmail, accessorName,
  allowedReports, customReports,
}) => {
  const [activeReport, setActiveReport] = useState<string | null>(null);
  const [activeCustomReport, setActiveCustomReport] = useState<SavedReportConfig | null>(null);

  // Build the same report data bundle from the raw folio JSON
  const reportData = useMemo(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    () => buildReportData(data as Record<string, any>),
    [data]
  );

  // Filter reports to those the owner has explicitly allowed AND whose
  // underlying sections the family member also has access to. This second gate
  // catches stale grants made before report/section consistency was enforced —
  // e.g. an "Asset Inventory" report granted without "Financial" section access
  // is hidden silently rather than leaking financial data.
  const availableReports = useMemo(() => {
    if (!allowedReports || allowedReports.length === 0) return [];
    return REPORTS.filter(
      (r) => allowedReports.includes(r.id) && reportSectionsGranted(r.id, accessSections),
    );
  }, [allowedReports, accessSections]);

  const logAccess = async (reportName: string) => {
    await supabase.from('folio_access_log').insert({
      owner_id: ownerId,
      accessor_email: accessorEmail,
      accessor_name: accessorName,
      access_type: 'report',
      report_name: reportName,
      sections_queried: accessSections,
    });
  };

  const handleOpenReport = (report: typeof REPORTS[number]) => {
    setActiveReport(report.id);
    setActiveCustomReport(null);
    logAccess(report.label);
  };

  const handleOpenCustomReport = (report: SavedReportConfig) => {
    setActiveCustomReport(report);
    setActiveReport(null);
    logAccess(`Custom: ${report.name}`);
  };

  const handleBack = () => {
    setActiveReport(null);
    setActiveCustomReport(null);
  };

  // Render a custom report using the same report components
  const renderCustomReport = (config: SavedReportConfig) => {
    const sections = config.config.sections;
    const reportIdsToRender: string[] = [];
    for (const categoryId of Object.keys(sections)) {
      if (sections[categoryId].length === 0) continue;
      const mapped = CATEGORY_TO_REPORT_IDS[categoryId] || [];
      for (const rid of mapped) {
        if (!reportIdsToRender.includes(rid)) {
          reportIdsToRender.push(rid);
        }
      }
    }

    // Drop sub-reports whose underlying access sections aren't granted, so a
    // custom report can't smuggle past category-level restrictions.
    const gatedReportIds = reportIdsToRender.filter((rid) =>
      reportSectionsGranted(rid, accessSections),
    );

    if (gatedReportIds.length === 0) {
      return (
        <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
          This custom report has no renderable sections.
        </Typography>
      );
    }

    return (
      <ReportLayout title={config.name} ownerName={ownerName}>
        {gatedReportIds.map((reportId, idx) => (
          <React.Fragment key={reportId}>
            {idx > 0 && <Divider sx={{ my: 3 }} />}
            {renderReportById(reportId, reportData, data)}
          </React.Fragment>
        ))}
      </ReportLayout>
    );
  };

  // Active report view (standard or custom)
  if (activeReport) {
    const rendered = renderReportById(activeReport, reportData, data);
    return (
      <Box>
        <Box sx={{ mb: 2 }} className="no-print">
          <IconButton onClick={handleBack} sx={{ color: '#1a237e' }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography component="span" variant="body1" sx={{ ml: 1, color: '#1a237e', fontWeight: 500 }}>
            Back to Reports
          </Typography>
        </Box>
        {rendered}
      </Box>
    );
  }

  if (activeCustomReport) {
    return (
      <Box>
        <Box sx={{ mb: 2 }} className="no-print">
          <IconButton onClick={handleBack} sx={{ color: '#1a237e' }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography component="span" variant="body1" sx={{ ml: 1, color: '#1a237e', fontWeight: 500 }}>
            Back to Reports
          </Typography>
        </Box>
        {renderCustomReport(activeCustomReport)}
      </Box>
    );
  }

  const hasStandard = availableReports.length > 0;
  const hasCustom = customReports && customReports.length > 0;
  const hasAny = hasStandard || hasCustom;

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2, color: '#1a237e' }}>Available Reports</Typography>

      {!hasAny ? (
        <Typography color="text.secondary">No reports have been shared with you yet.</Typography>
      ) : (
        <>
          {/* Standard Reports */}
          {hasStandard && (
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
                          {report.label}
                        </Typography>
                      </CardContent>
                    </CardActionArea>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}

          {/* Custom Reports */}
          {hasCustom && (
            <>
              {hasStandard && (
                <Box sx={{ mt: 4, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AssessmentIcon sx={{ color: '#1a237e', fontSize: 20 }} />
                  <Typography variant="subtitle1" sx={{ color: '#1a237e', fontWeight: 600 }}>
                    Custom Reports
                  </Typography>
                </Box>
              )}
              <Grid container spacing={2}>
                {customReports!.map((report) => (
                  <Grid item xs={12} sm={6} md={4} key={report.id}>
                    <Card sx={{ height: '100%', '&:hover': { boxShadow: 4 }, transition: 'box-shadow 0.2s' }}>
                      <CardActionArea onClick={() => handleOpenCustomReport(report)} sx={{ height: '100%', p: 2 }}>
                        <CardContent sx={{ textAlign: 'center' }}>
                          <Box sx={{ color: '#1a237e', mb: 1 }}>
                            <AssessmentIcon sx={{ fontSize: 36 }} />
                          </Box>
                          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>
                            {report.name}
                          </Typography>
                          {report.description && (
                            <Typography variant="caption" color="text.secondary">
                              {report.description}
                            </Typography>
                          )}
                          <Box sx={{ mt: 1 }}>
                            <Chip label="Custom" size="small" color="info" variant="outlined" />
                          </Box>
                        </CardContent>
                      </CardActionArea>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </>
          )}
        </>
      )}
    </Box>
  );
};

export default ReportViewer;
