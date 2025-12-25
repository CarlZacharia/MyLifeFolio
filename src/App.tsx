import { useState } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import QuestionnairePage from '../app/page';
import EducationCenter from '../components/EducationCenter';
import { FormProvider, useFormContext } from '../lib/FormContext';
import ClientNotesModal from '../components/ClientNotesModal';

type CurrentPage = 'questionnaire' | 'education';

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

// Inner component that uses the FormContext
const AppContent = () => {
  const { formData, updateFormData } = useFormContext();
  const [clientNotesOpen, setClientNotesOpen] = useState(false);
  const [currentPage] = useState<CurrentPage>('questionnaire');

  const handleSaveNotes = (notes: string) => {
    updateFormData({ clientNotes: notes });
  };

  return (
    <>
      {currentPage === 'questionnaire' ? <QuestionnairePage /> : <EducationCenter />}
      <ClientNotesModal
        open={clientNotesOpen}
        onClose={() => setClientNotesOpen(false)}
        notes={formData.clientNotes}
        onSave={handleSaveNotes}
      />
    </>
  );
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <CssBaseline />
        <FormProvider>
          <AppContent />
        </FormProvider>
      </LocalizationProvider>
    </ThemeProvider>
  );
}

export default App;
