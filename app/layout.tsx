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
          // Filled state - light gray background with green left accent
          '&:not(.Mui-focused)': {
            '& .MuiOutlinedInput-input:not(:placeholder-shown)': {
              fontWeight: 500,
            },
          },
        },
        input: {
          // When input has value, show visual indicator
          '&:not(:placeholder-shown)': {
            backgroundColor: '#f8f9fa',
            borderLeft: '3px solid #4caf50',
            marginLeft: -1,
            paddingLeft: 'calc(14px - 2px)',
          },
        },
        notchedOutline: {
          transition: 'all 0.2s ease-in-out',
        },
      },
    },
    // Select styling
    MuiSelect: {
      styleOverrides: {
        select: {
          transition: 'all 0.2s ease-in-out',
          // When select has a value
          '&[aria-expanded="false"]:not([data-value=""])': {
            backgroundColor: '#f8f9fa',
            borderLeft: '3px solid #4caf50',
            marginLeft: -1,
            paddingLeft: 'calc(14px - 2px)',
            fontWeight: 500,
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
