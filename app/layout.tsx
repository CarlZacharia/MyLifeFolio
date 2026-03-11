import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { AppBar, Toolbar, Typography, Box, Button } from '@mui/material';
import GavelIcon from '@mui/icons-material/Gavel';
import LogoutIcon from '@mui/icons-material/Logout';
import SchoolIcon from '@mui/icons-material/School';
import AssignmentIcon from '@mui/icons-material/Assignment';
import NotesIcon from '@mui/icons-material/Notes';

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
    background: {
      default: '#e8eaf6', // Light indigo background for contrast
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
  components: {
    // TextField input styling
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          transition: 'all 0.2s ease-in-out',
          // Hover state
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: '#1a237e',
          },
          // Focus state - light blue background
          '&.Mui-focused': {
            backgroundColor: '#e3f2fd',
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: '#1976d2',
              borderWidth: 2,
            },
          },
        },
        input: {
          // When text input has value, show visual indicator
          '&:not(:placeholder-shown)': {
            backgroundColor: '#f8f9fa',
            borderLeft: '3px solid #4caf50',
            marginLeft: -1,
            paddingLeft: 'calc(14px - 2px)',
            fontWeight: 500,
          },
        },
        notchedOutline: {
          transition: 'all 0.2s ease-in-out',
        },
      },
    },
    // Select styling - style the entire OutlinedInput when Select has value
    MuiSelect: {
      styleOverrides: {
        select: {
          transition: 'all 0.2s ease-in-out',
          // When select is closed and has a non-empty value
          '&.MuiSelect-outlined.MuiInputBase-input': {
            '&:not(:empty)': {
              backgroundColor: '#f8f9fa',
              borderLeft: '3px solid #4caf50',
              marginLeft: -1,
              paddingLeft: 'calc(14px - 2px)',
              fontWeight: 500,
            },
          },
        },
      },
    },
    // Autocomplete styling
    MuiAutocomplete: {
      styleOverrides: {
        inputRoot: {
          // When autocomplete has value(s)
          '&.MuiAutocomplete-hasPopupIcon.MuiAutocomplete-hasClearIcon .MuiOutlinedInput-root, &:has(.MuiChip-root)': {
            backgroundColor: '#f8f9fa',
          },
        },
      },
    },
    // FormControl label styling when filled
    MuiInputLabel: {
      styleOverrides: {
        root: {
          // Shrunk label (when field has value or is focused)
          '&.MuiInputLabel-shrink': {
            fontWeight: 600,
            color: '#1a237e',
          },
        },
      },
    },
    // Radio and Checkbox - highlight when selected
    MuiRadio: {
      styleOverrides: {
        root: {
          '&.Mui-checked': {
            color: '#1a237e',
          },
        },
      },
    },
    MuiCheckbox: {
      styleOverrides: {
        root: {
          '&.Mui-checked': {
            color: '#1a237e',
          },
        },
      },
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
        <title>MyLifeFolio</title>
        <meta name="description" content="MyLifeFolio" />
        <link rel="icon" type="image/png" href="/favicon.png" />
      </head>
      <body>
        <ThemeProvider theme={theme}>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <CssBaseline />
            <AppBar position="static" sx={{ bgcolor: '#1a237e' }}>
              <Toolbar>
                {/* Logo */}
                <Box
                  component="img"
                  src="/SCRlogo.jpg"
                  alt="MyLifeFolio"
                  sx={{
                    height: 40,
                    mr: 2,
                    display: { xs: 'none', sm: 'block' },
                  }}
                  onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
                {/* Fallback icon when logo not found */}
                <GavelIcon sx={{ mr: 2, display: { xs: 'block', sm: 'none' } }} />
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="h5" component="div" sx={{ fontWeight: 600 }}>
                    MyLifeFolio
                  </Typography>
                </Box>

                {/* Right-aligned navigation buttons */}
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    color="inherit"
                    startIcon={<AssignmentIcon />}
                    sx={{ display: { xs: 'none', md: 'flex' } }}
                  >
                    Questionnaire
                  </Button>
                  <Button
                    color="inherit"
                    startIcon={<SchoolIcon />}
                    sx={{ display: { xs: 'none', md: 'flex' } }}
                  >
                    Education Center
                  </Button>
                  <Button
                    color="inherit"
                    startIcon={<NotesIcon />}
                    sx={{ display: { xs: 'none', md: 'flex' } }}
                  >
                    Client Notes
                  </Button>
                  <Button
                    color="inherit"
                    startIcon={<LogoutIcon />}
                    sx={{ display: { xs: 'none', sm: 'flex' } }}
                  >
                    Log Out
                  </Button>
                </Box>
              </Toolbar>
            </AppBar>
            {children}
          </LocalizationProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
