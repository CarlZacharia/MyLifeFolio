'use client';

import React from 'react';
import { Box, Paper, Typography } from '@mui/material';
import ConstructionIcon from '@mui/icons-material/Construction';

const ReportsSection = () => {
  return (
    <Box>
      <Paper variant="outlined" sx={{ p: 6, textAlign: 'center' }}>
        <ConstructionIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
        <Typography variant="h6" color="text.secondary" gutterBottom>
          Reports - Coming Soon
        </Typography>
        <Typography color="text.secondary">
          This section is not completed yet. Please come back later.
        </Typography>
      </Paper>
    </Box>
  );
};

export default ReportsSection;
