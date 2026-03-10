import React, { useState } from 'react';
import { Box, TextField, MenuItem } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import FolioModal, {
  FolioSaveButton,
  FolioFonts,
  folioTextFieldSx,
  folioColors,
  FolioFieldFade,
  useFolioFieldAnimation,
} from './FolioModal';
import type { MaritalStatus, Sex } from '../lib/FormContext';

const US_STATES = [
  'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut',
  'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa',
  'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan',
  'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire',
  'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio',
  'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota',
  'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia',
  'Wisconsin', 'Wyoming',
];

interface WelcomeInitialData {
  name?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
}

interface WelcomeModalProps {
  open: boolean;
  initialData?: WelcomeInitialData;
  onSave: (data: {
    name: string;
    mailingAddress: string;
    mailingCity: string;
    mailingState: string;
    mailingZip: string;
    stateOfDomicile: string;
    sex: Sex;
    birthDate: Date | null;
    maritalStatus: MaritalStatus;
    numberOfChildren: number;
  }) => void;
}

const WelcomeModal: React.FC<WelcomeModalProps> = ({ open, initialData, onSave }) => {
  const [seeded, setSeeded] = useState(false);
  const [name, setName] = useState('');
  const [mailingAddress, setMailingAddress] = useState('');
  const [mailingCity, setMailingCity] = useState('');
  const [mailingState, setMailingState] = useState('');
  const [mailingZip, setMailingZip] = useState('');
  const [stateOfDomicile, setStateOfDomicile] = useState('');
  const [sex, setSex] = useState<Sex>('');
  const [birthDate, setBirthDate] = useState<Date | null>(null);
  const [maritalStatus, setMaritalStatus] = useState<MaritalStatus>('');
  const [numberOfChildren, setNumberOfChildren] = useState(0);

  // Pre-populate from registration data when modal opens
  React.useEffect(() => {
    if (open && initialData && !seeded) {
      if (initialData.name) setName(initialData.name);
      if (initialData.address) setMailingAddress(initialData.address);
      if (initialData.city) setMailingCity(initialData.city);
      if (initialData.state) {
        setMailingState(initialData.state);
        setStateOfDomicile(initialData.state);
      }
      if (initialData.zip) setMailingZip(initialData.zip);
      setSeeded(true);
    }
  }, [open, initialData, seeded]);

  const fieldsVisible = useFolioFieldAnimation(open);
  const canSave = name.trim().length > 0;

  const handleSave = () => {
    if (!canSave) return;
    onSave({
      name: name.trim(),
      mailingAddress,
      mailingCity,
      mailingState,
      mailingZip,
      stateOfDomicile,
      sex,
      birthDate,
      maritalStatus,
      numberOfChildren,
    });
  };

  return (
    <FolioModal
      open={open}
      onClose={() => {}} // Cannot close without saving
      title="Welcome & Getting Started"
      eyebrow="My Life Folio"
      maxWidth="sm"
      footer={
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', width: '100%' }}>
          <FolioSaveButton onClick={handleSave} disabled={!canSave}>
            Save & Continue
          </FolioSaveButton>
        </Box>
      }
    >
      <FolioFonts />
      <Box
        sx={{
          fontFamily: '"Jost", sans-serif',
          fontSize: '13px',
          color: folioColors.inkLight,
          mb: 3,
          lineHeight: 1.6,
        }}
      >
        Welcome to MyLifeFolio! To get started, please provide some basic
        information. You can always update these details later.
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <FolioFieldFade visible={fieldsVisible} index={0}>
          <TextField
            label="Client Full Legal Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            fullWidth
            required
            size="small"
            sx={folioTextFieldSx}
          />
        </FolioFieldFade>

        <FolioFieldFade visible={fieldsVisible} index={1}>
          <TextField
            label="Mailing Address"
            value={mailingAddress}
            onChange={(e) => setMailingAddress(e.target.value)}
            fullWidth
            size="small"
            sx={folioTextFieldSx}
          />
        </FolioFieldFade>

        <FolioFieldFade visible={fieldsVisible} index={2}>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              label="City"
              value={mailingCity}
              onChange={(e) => setMailingCity(e.target.value)}
              fullWidth
              size="small"
              sx={folioTextFieldSx}
            />
            <TextField
              label="State"
              value={mailingState}
              onChange={(e) => setMailingState(e.target.value)}
              select
              fullWidth
              size="small"
              sx={{ ...folioTextFieldSx, minWidth: 140 }}
            >
              <MenuItem value="">—</MenuItem>
              {US_STATES.map((s) => (
                <MenuItem key={s} value={s}>{s}</MenuItem>
              ))}
            </TextField>
            <TextField
              label="Zip"
              value={mailingZip}
              onChange={(e) => setMailingZip(e.target.value)}
              fullWidth
              size="small"
              sx={{ ...folioTextFieldSx, maxWidth: 120 }}
            />
          </Box>
        </FolioFieldFade>

        <FolioFieldFade visible={fieldsVisible} index={3}>
          <TextField
            label="State of Domicile"
            value={stateOfDomicile}
            onChange={(e) => setStateOfDomicile(e.target.value)}
            select
            fullWidth
            size="small"
            sx={folioTextFieldSx}
          >
            <MenuItem value="">—</MenuItem>
            {US_STATES.map((s) => (
              <MenuItem key={s} value={s}>{s}</MenuItem>
            ))}
          </TextField>
        </FolioFieldFade>

        <FolioFieldFade visible={fieldsVisible} index={4}>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              label="Sex"
              value={sex}
              onChange={(e) => setSex(e.target.value as Sex)}
              select
              fullWidth
              size="small"
              sx={folioTextFieldSx}
            >
              <MenuItem value="">—</MenuItem>
              <MenuItem value="Male">Male</MenuItem>
              <MenuItem value="Female">Female</MenuItem>
              <MenuItem value="Other">Other</MenuItem>
            </TextField>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Birth Date"
                value={birthDate}
                onChange={(d) => setBirthDate(d)}
                slotProps={{
                  textField: {
                    size: 'small',
                    fullWidth: true,
                    sx: folioTextFieldSx,
                  },
                }}
              />
            </LocalizationProvider>
          </Box>
        </FolioFieldFade>

        <FolioFieldFade visible={fieldsVisible} index={5}>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              label="Marital Status"
              value={maritalStatus}
              onChange={(e) => setMaritalStatus(e.target.value as MaritalStatus)}
              select
              fullWidth
              size="small"
              sx={folioTextFieldSx}
            >
              <MenuItem value="">—</MenuItem>
              <MenuItem value="Single">Single</MenuItem>
              <MenuItem value="Married">Married</MenuItem>
              <MenuItem value="Second Marriage">Second Marriage</MenuItem>
              <MenuItem value="Divorced">Divorced</MenuItem>
              <MenuItem value="Separated">Separated</MenuItem>
              <MenuItem value="Domestic Partnership">Domestic Partnership</MenuItem>
            </TextField>
            <TextField
              label="Number of Children"
              type="number"
              value={numberOfChildren}
              onChange={(e) => setNumberOfChildren(Math.max(0, parseInt(e.target.value) || 0))}
              fullWidth
              size="small"
              inputProps={{ min: 0 }}
              sx={{ ...folioTextFieldSx, maxWidth: 180 }}
            />
          </Box>
        </FolioFieldFade>
      </Box>
    </FolioModal>
  );
};

export default WelcomeModal;
