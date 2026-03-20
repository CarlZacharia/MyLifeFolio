'use client';

import React, { useState, useEffect } from 'react';
import {
  TextField,
  Typography,
  Box,
} from '@mui/material';
import FolioModal, {
  folioTextFieldSx,
  FolioCancelButton,
  FolioSaveButton,
  FolioFieldFade,
  useFolioFieldAnimation,
} from './FolioModal';

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

  const fieldsVisible = useFolioFieldAnimation(open);

  return (
    <FolioModal
      open={open}
      onClose={handleClose}
      title="Client Notes"
      eyebrow="My Life Folio"
      maxWidth="md"
      footer={
        <>
          <Box />
          <Box sx={{ display: 'flex', gap: 1.5 }}>
            <FolioCancelButton onClick={handleClose} />
            <FolioSaveButton onClick={handleSave}>
              Save Notes
            </FolioSaveButton>
          </Box>
        </>
      }
    >
      <FolioFieldFade visible={fieldsVisible} index={0}>
        <Typography variant="body1" sx={{ mb: 3, fontWeight: 500, color: 'text.primary' }}>
          Save any questions or comments you want to ask or tell the attorneys at MyLifeFolio at your meeting.
        </Typography>
      </FolioFieldFade>
      <FolioFieldFade visible={fieldsVisible} index={1}>
        <TextField
          fullWidth
          multiline
          rows={20}
          value={localNotes}
          onChange={(e) => setLocalNotes(e.target.value)}
          placeholder="Enter your questions and comments here..."
          variant="outlined"
          sx={{ ...folioTextFieldSx }}
        />
      </FolioFieldFade>
    </FolioModal>
  );
};

export default ClientNotesModal;
