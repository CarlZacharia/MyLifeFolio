'use client';

import React from 'react';
import { Box, Typography, Divider } from '@mui/material';
import { CATEGORY_TO_REPORT_IDS } from '../lib/reportBuilderConfig';
import { buildReportData } from '../lib/buildReportData';
import { useFormContext } from '../lib/FormContext';
import { renderReportById } from './ReportsSection';
import ReportLayout from '../src/features/family-access/reports/ReportLayout';
import { folioColors } from './FolioModal';

interface CustomReportPreviewProps {
  reportName: string;
  sections: Record<string, string[]>;
}

const CustomReportPreview: React.FC<CustomReportPreviewProps> = ({ reportName, sections }) => {
  const { formData } = useFormContext();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data = buildReportData(formData as unknown as Record<string, any>);
  const clientName = (formData as { name?: string }).name || 'Client';

  // Collect unique report IDs to render based on selected categories
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

  if (reportIdsToRender.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography
          sx={{
            fontFamily: '"Jost", sans-serif',
            fontSize: '15px',
            color: folioColors.inkFaint,
          }}
        >
          No reportable sections selected. Select categories with available report data to generate a preview.
        </Typography>
      </Box>
    );
  }

  return (
    <ReportLayout title={reportName || 'Custom Report'} ownerName={clientName}>
      {reportIdsToRender.map((reportId, idx) => (
        <React.Fragment key={reportId}>
          {idx > 0 && (
            <Divider
              sx={{
                my: 3,
                borderColor: folioColors.parchment,
                '@media print': { my: 2 },
              }}
            />
          )}
          {renderReportById(reportId, data, formData as unknown as Record<string, unknown>)}
        </React.Fragment>
      ))}
    </ReportLayout>
  );
};

export default CustomReportPreview;
