import React from 'react';
import { Typography, Box } from '@mui/material';
import ReportLayout, { ReportSectionTitle } from './ReportLayout';
import { str, BaseReportProps } from './reportHelpers';

interface EndOfLifeWishesProps extends BaseReportProps {}

const body = { fontSize: '12px', fontFamily: '"Jost", sans-serif' } as const;

const EndOfLifeWishes: React.FC<EndOfLifeWishesProps> = ({ data, ownerName, embedded }) => {
  const endOfLife = (data.endOfLife || []) as Array<Record<string, string>>;

  const content = (
    <>
      <Box sx={{ mb: 3 }}>
        <ReportSectionTitle>Client Funeral Preferences</ReportSectionTitle>
        <Typography sx={body}><strong>Burial or Cremation:</strong> {str(data.clientBurialOrCremation, 'Not specified')}</Typography>
        <Typography sx={body}><strong>Preferred Funeral Home:</strong> {str(data.clientPreferredFuneralHome, 'Not specified')}</Typography>
        <Typography sx={body}><strong>Preferred Church:</strong> {str(data.clientPreferredChurch, 'Not specified')}</Typography>
        <Typography sx={body}><strong>Prepaid Funeral:</strong> {data.clientHasPrepaidFuneral ? 'Yes' : 'No'}</Typography>
        {!!data.clientPrepaidFuneralDetails && (
          <Typography sx={body}><strong>Details:</strong> {str(data.clientPrepaidFuneralDetails)}</Typography>
        )}
      </Box>

      {!!(data.spouseBurialOrCremation || data.spousePreferredFuneralHome) && (
        <Box sx={{ mb: 3 }}>
          <ReportSectionTitle>Spouse Funeral Preferences</ReportSectionTitle>
          <Typography sx={body}><strong>Burial or Cremation:</strong> {str(data.spouseBurialOrCremation, 'Not specified')}</Typography>
          <Typography sx={body}><strong>Preferred Funeral Home:</strong> {str(data.spousePreferredFuneralHome, 'Not specified')}</Typography>
          <Typography sx={body}><strong>Preferred Church:</strong> {str(data.spousePreferredChurch, 'Not specified')}</Typography>
          <Typography sx={body}><strong>Prepaid Funeral:</strong> {data.spouseHasPrepaidFuneral ? 'Yes' : 'No'}</Typography>
          {!!data.spousePrepaidFuneralDetails && (
            <Typography sx={body}><strong>Details:</strong> {str(data.spousePrepaidFuneralDetails)}</Typography>
          )}
        </Box>
      )}

      {endOfLife.length > 0 && (
        <Box>
          <ReportSectionTitle>End of Life Preferences</ReportSectionTitle>
          {endOfLife.map((item, i) => (
            <Box key={i} sx={{ mb: 2, p: 1.5, bgcolor: '#f9f5ef', borderRadius: 1, border: '1px solid #e8ddd0' }}>
              <Typography sx={{ fontFamily: '"Jost", sans-serif', fontSize: '13px', fontWeight: 600, color: '#8b6914' }}>
                {item.category || `Item ${i + 1}`}
              </Typography>
              {Object.entries(item)
                .filter(([key]) => key !== 'category')
                .map(([key, value]) => (
                  value ? <Typography key={key} sx={body}><strong>{key}:</strong> {value}</Typography> : null
                ))}
            </Box>
          ))}
        </Box>
      )}
    </>
  );

  if (embedded) return content;

  return (
    <ReportLayout title="End of Life Wishes" ownerName={ownerName}>
      {content}
    </ReportLayout>
  );
};

export default EndOfLifeWishes;
