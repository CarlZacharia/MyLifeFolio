import React, { useState, useMemo } from 'react';
import {
  Box, Typography, Card, CardContent, CardActionArea, Grid, IconButton,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { supabase } from '../../../lib/supabase';
import { buildReportData } from '../../../lib/buildReportData';
import { REPORTS, renderReportById } from '../../../components/ReportsSection';

interface ReportViewerProps {
  data: Record<string, unknown>;
  ownerName: string;
  ownerId: string;
  accessSections: string[];
  accessorEmail: string;
  accessorName: string;
  allowedReports?: string[];
}

const ReportViewer: React.FC<ReportViewerProps> = ({
  data, ownerName, ownerId, accessSections, accessorEmail, accessorName,
  allowedReports,
}) => {
  const [activeReport, setActiveReport] = useState<string | null>(null);

  // Build the same report data bundle from the raw folio JSON
  const reportData = useMemo(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    () => buildReportData(data as Record<string, any>),
    [data]
  );

  // Filter reports to only those the client has explicitly allowed
  const availableReports = useMemo(() => {
    if (!allowedReports || allowedReports.length === 0) return [];
    return REPORTS.filter((r) => allowedReports.includes(r.id));
  }, [allowedReports]);

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
    logAccess(report.label);
  };

  if (activeReport) {
    const rendered = renderReportById(activeReport, reportData);
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
        {rendered}
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2, color: '#1a237e' }}>Available Reports</Typography>
      {availableReports.length === 0 ? (
        <Typography color="text.secondary">No reports have been shared with you yet.</Typography>
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
                      {report.label}
                    </Typography>
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
