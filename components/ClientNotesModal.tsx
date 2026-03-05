'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
  IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import NotesIcon from '@mui/icons-material/Notes';

interface ClientNotesModalProps {
  open: boolean;
  onClose: () => void;
  notes: string;
  onSave: (notes: string) => void;
}

const ClientNotesModal: React.FC<ClientNotesModalProps> = ({
  open,
  onClose,
  notes,
  onSave,
}) => {
  const [localNotes, setLocalNotes] = useState(notes);

  // Sync local state when notes prop changes or modal opens
  useEffect(() => {
    if (open) {
      setLocalNotes(notes);
    }
  }, [open, notes]);

  const handleSave = () => {
    onSave(localNotes);
    onClose();
  };

  const handleClose = () => {
    // Reset to original notes on close without saving
    setLocalNotes(notes);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          minHeight: '60vh',
        },
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          bgcolor: '#1a237e',
          color: 'white',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <NotesIcon />
          <Typography variant="h6" component="span">
            Client Notes
          </Typography>
        </Box>
        <IconButton
          aria-label="close"
          onClick={handleClose}
          sx={{ color: 'white' }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ pt: 3 }}>
        <Typography variant="body1" sx={{ mb: 3, mt: 2.5, fontWeight: 500, color: 'text.primary' }}>
          Save any questions or comments you want to ask or tell the attorneys at MyLifeFolio at your meeting.
        </Typography>
        <TextField
          fullWidth
          multiline
          rows={20}
          value={localNotes}
          onChange={(e) => setLocalNotes(e.target.value)}
          placeholder="Enter your questions and comments here..."
          variant="outlined"
          sx={{
            '& .MuiOutlinedInput-root': {
              fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
              fontSize: '1rem',
              lineHeight: 1.6,
            },
          }}
        />
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleClose} color="inherit">
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          sx={{ bgcolor: '#1a237e' }}
        >
          Save Notes
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ClientNotesModal;
