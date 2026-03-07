import React from 'react';
import { Typography, Box } from '@mui/material';
import ReportLayout from './ReportLayout';
import { str } from './reportHelpers';

interface EndOfLifeWishesProps {
  data: Record<string, unknown>;
  ownerName: string;
}

const EndOfLifeWishes: React.FC<EndOfLifeWishesProps> = ({ data, ownerName }) => {
  const endOfLife = (data.endOfLife || []) as Array<Record<string, string>>;

  return (
    <ReportLayout title="End of Life Wishes" ownerName={ownerName}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 1, color: '#1a237e' }}>Client Funeral Preferences</Typography>
        <Typography><strong>Burial or Cremation:</strong> {str(data.clientBurialOrCremation, 'Not specified')}</Typography>
        <Typography><strong>Preferred Funeral Home:</strong> {str(data.clientPreferredFuneralHome, 'Not specified')}</Typography>
        <Typography><strong>Preferred Church:</strong> {str(data.clientPreferredChurch, 'Not specified')}</Typography>
        <Typography><strong>Prepaid Funeral:</strong> {data.clientHasPrepaidFuneral ? 'Yes' : 'No'}</Typography>
        {!!data.clientPrepaidFuneralDetails && (
          <Typography><strong>Details:</strong> {str(data.clientPrepaidFuneralDetails)}</Typography>
        )}
      </Box>

      {!!(data.spouseBurialOrCremation || data.spousePreferredFuneralHome) && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" sx={{ mb: 1, color: '#1a237e' }}>Spouse Funeral Preferences</Typography>
          <Typography><strong>Burial or Cremation:</strong> {str(data.spouseBurialOrCremation, 'Not specified')}</Typography>
          <Typography><strong>Preferred Funeral Home:</strong> {str(data.spousePreferredFuneralHome, 'Not specified')}</Typography>
          <Typography><strong>Preferred Church:</strong> {str(data.spousePreferredChurch, 'Not specified')}</Typography>
          <Typography><strong>Prepaid Funeral:</strong> {data.spouseHasPrepaidFuneral ? 'Yes' : 'No'}</Typography>
          {!!data.spousePrepaidFuneralDetails && (
            <Typography><strong>Details:</strong> {str(data.spousePrepaidFuneralDetails)}</Typography>
          )}
        </Box>
      )}

      {endOfLife.length > 0 && (
        <Box>
          <Typography variant="h6" sx={{ mb: 1, color: '#1a237e' }}>End of Life Preferences</Typography>
          {endOfLife.map((item, i) => (
            <Box key={i} sx={{ mb: 2, p: 1.5, bgcolor: '#f5f5f5', borderRadius: 1 }}>
              <Typography variant="subtitle2" sx={{ color: '#1a237e', fontWeight: 600 }}>
                {item.category || `Item ${i + 1}`}
              </Typography>
              {Object.entries(item)
                .filter(([key]) => key !== 'category')
                .map(([key, value]) => (
                  value ? <Typography key={key} variant="body2"><strong>{key}:</strong> {value}</Typography> : null
                ))}
            </Box>
          ))}
        </Box>
      )}
    </ReportLayout>
  );
};

export default EndOfLifeWishes;
