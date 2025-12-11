'use client';

import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1a237e', // Navy blue for legal professionalism
      light: '#534bae',
      dark: '#000051',
    },
    secondary: {
      main: '#c5cae9',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 500,
    },
  },
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <title>Estate Planning Questionnaire - Zacharia Brown & Bratkovich</title>
        <meta name="description" content="Estate Planning Questionnaire for Zacharia Brown & Bratkovich law firm" />
      </head>
      <body>
        <ThemeProvider theme={theme}>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <CssBaseline />
            {children}
          </LocalizationProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
