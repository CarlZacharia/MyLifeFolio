import React from 'react';
import { Box, Typography, Button, Paper, Divider } from '@mui/material';
import PrintIcon from '@mui/icons-material/Print';

interface ReportLayoutProps {
  title: string;
  ownerName: string;
  children: React.ReactNode;
}

const ReportLayout: React.FC<ReportLayoutProps> = ({ title, ownerName, children }) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <Paper elevation={2} sx={{ p: 4, borderRadius: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }} className="no-print">
        <Box>
          <Typography variant="h5" sx={{ color: '#1a237e', fontWeight: 600 }}>
            {title}
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Folio of {ownerName} &mdash; Generated {new Date().toLocaleDateString()}
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<PrintIcon />}
          onClick={handlePrint}
          sx={{ borderColor: '#1a237e', color: '#1a237e' }}
        >
          Print / Save as PDF
        </Button>
      </Box>
      {/* Print-only header */}
      <Box sx={{ display: 'none' }} className="print-only-header">
        <Typography variant="h5" sx={{ fontWeight: 600, mb: 0.5 }}>{title}</Typography>
        <Typography variant="body2">Folio of {ownerName} &mdash; {new Date().toLocaleDateString()}</Typography>
      </Box>
      <Divider sx={{ mb: 3 }} />
      {children}
    </Paper>
  );
};

export default ReportLayout;
