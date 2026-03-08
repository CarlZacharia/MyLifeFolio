import React from 'react';
import { Box, Typography, Button, Paper, Divider } from '@mui/material';
import PrintIcon from '@mui/icons-material/Print';

// Folio design-system palette (mirrors FolioModal.tsx)
const colors = {
  ink: '#2c2416',
  inkLight: '#6b5c47',
  accent: '#8b6914',
  accentWarm: '#c49a3c',
  cream: '#f9f5ef',
  creamDark: '#f0e9dc',
  parchment: '#e8ddd0',
};

interface ReportLayoutProps {
  title: string;
  ownerName: string;
  children: React.ReactNode;
  dateCreated?: string;
  dateUpdated?: string;
}

const ReportLayout: React.FC<ReportLayoutProps> = ({
  title,
  ownerName,
  children,
  dateCreated,
  dateUpdated,
}) => {
  const today = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const created = dateCreated || today;
  const updated = dateUpdated || today;

  const handlePrint = () => {
    window.print();
  };

  /* ─── Shared header bar (screen + print) ─── */
  const headerBar = (
    <Box
      className="report-header"
      sx={{
        bgcolor: colors.ink,
        color: '#fff',
        px: { xs: 2, sm: 4 },
        py: 1.5,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderRadius: '8px 8px 0 0',
        gap: 2,
        '@media print': {
          borderRadius: 0,
          px: '0.4in',
        },
      }}
    >
      {/* Left: logo + brand */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexShrink: 0 }}>
        <Box
          component="img"
          src="/logo.jpg"
          alt="MyLifeFolio"
          sx={{
            height: 40,
            width: 40,
            borderRadius: '6px',
            objectFit: 'cover',
            '@media print': { height: 32, width: 32 },
          }}
        />
        <Typography
          sx={{
            fontFamily: '"Jost", sans-serif',
            fontWeight: 400,
            fontSize: '14px',
            letterSpacing: '0.04em',
            color: colors.accentWarm,
            whiteSpace: 'nowrap',
          }}
        >
          myLifeFolio.com
        </Typography>
      </Box>

      {/* Center: report title */}
      <Typography
        sx={{
          fontFamily: '"Jost", sans-serif',
          fontWeight: 600,
          fontSize: { xs: '16px', sm: '20px' },
          textAlign: 'center',
          flexGrow: 1,
          letterSpacing: '0.02em',
          '@media print': { fontSize: '18px' },
        }}
      >
        {title}
      </Typography>

      {/* Right: dates */}
      <Box sx={{ textAlign: 'right', flexShrink: 0 }}>
        <Typography
          sx={{
            fontFamily: '"Jost", sans-serif',
            fontSize: '11px',
            fontWeight: 300,
            color: colors.parchment,
            whiteSpace: 'nowrap',
          }}
        >
          Created: {created}
        </Typography>
        <Typography
          sx={{
            fontFamily: '"Jost", sans-serif',
            fontSize: '11px',
            fontWeight: 300,
            color: colors.parchment,
            whiteSpace: 'nowrap',
          }}
        >
          Updated: {updated}
        </Typography>
      </Box>
    </Box>
  );

  /* ─── Footer bar (screen + print) ─── */
  const footerBar = (
    <Box
      className="report-footer"
      sx={{
        bgcolor: colors.ink,
        color: '#fff',
        px: { xs: 2, sm: 4 },
        py: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderRadius: '0 0 8px 8px',
        mt: 'auto',
        '@media print': {
          borderRadius: 0,
          px: '0.4in',
        },
      }}
    >
      {/* Left: person + report */}
      <Box>
        <Typography
          sx={{
            fontFamily: '"Jost", sans-serif',
            fontSize: '10px',
            fontWeight: 400,
            color: colors.parchment,
          }}
        >
          {ownerName} &mdash; {title}
        </Typography>
      </Box>

      {/* Center: brand */}
      <Typography
        sx={{
          fontFamily: '"Jost", sans-serif',
          fontSize: '10px',
          fontWeight: 400,
          color: colors.accentWarm,
          letterSpacing: '0.04em',
        }}
      >
        myLifeFolio.com
      </Typography>

      {/* Right: date + page (page number only visible in print) */}
      <Box sx={{ textAlign: 'right' }}>
        <Typography
          sx={{
            fontFamily: '"Jost", sans-serif',
            fontSize: '10px',
            fontWeight: 400,
            color: colors.parchment,
          }}
        >
          {today}
        </Typography>
      </Box>
    </Box>
  );

  return (
    <Paper
      elevation={2}
      sx={{
        borderRadius: 2,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        '@media print': {
          boxShadow: 'none',
          borderRadius: 0,
        },
      }}
    >
      {/* Screen-only action bar */}
      <Box
        className="no-print"
        sx={{
          display: 'flex',
          justifyContent: 'flex-end',
          px: 2,
          pt: 1.5,
          pb: 0,
          bgcolor: colors.cream,
        }}
      >
        <Button
          variant="outlined"
          size="small"
          startIcon={<PrintIcon />}
          onClick={handlePrint}
          sx={{
            borderColor: colors.accent,
            color: colors.accent,
            fontFamily: '"Jost", sans-serif',
            fontSize: '12px',
            textTransform: 'none',
            '&:hover': {
              borderColor: colors.ink,
              bgcolor: colors.creamDark,
            },
          }}
        >
          Print / Save as PDF
        </Button>
      </Box>

      {/* Report header */}
      {headerBar}

      {/* Decorative gold rule */}
      <Box sx={{ height: '3px', bgcolor: colors.accentWarm }} />

      {/* Report body */}
      <Box
        sx={{
          p: { xs: 2, sm: 4 },
          bgcolor: '#ffffff',
          flexGrow: 1,
          '@media print': { p: '0.3in 0.4in' },
        }}
      >
        {children}
      </Box>

      {/* Decorative gold rule */}
      <Box sx={{ height: '3px', bgcolor: colors.accentWarm }} />

      {/* Report footer */}
      {footerBar}
    </Paper>
  );
};

export default ReportLayout;

/* ─── Reusable section-title component for use in individual reports ─── */
export const ReportSectionTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Typography
    sx={{
      fontFamily: '"Jost", sans-serif',
      fontWeight: 600,
      fontSize: '15px',
      color: colors.accent,
      letterSpacing: '0.03em',
      mb: 1,
      mt: 2,
      pb: 0.5,
      borderBottom: `2px solid ${colors.parchment}`,
    }}
  >
    {children}
  </Typography>
);
