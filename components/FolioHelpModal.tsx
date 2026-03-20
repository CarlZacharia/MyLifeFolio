'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Typography,
  Box,
  Tooltip,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface HelpSection {
  title: string;
  body?: React.ReactNode;
  bullets?: string[];
}

export interface HelpContent {
  title: string;
  icon: React.ReactNode;
  accentColor: string;
  sections: HelpSection[];
}

// ─── FolioHelpButton ─────────────────────────────────────────────────────────

export const FolioHelpButton: React.FC<{
  onClick: () => void;
  accentColor?: string;
  tooltip?: string;
}> = ({ onClick, accentColor = '#8b6914', tooltip = 'How does this work?' }) => (
  <Tooltip title={tooltip}>
    <IconButton
      size="small"
      onClick={onClick}
      sx={{
        color: accentColor,
        bgcolor: `${accentColor}14`,
        width: 28,
        height: 28,
        '&:hover': { bgcolor: `${accentColor}26` },
      }}
    >
      <HelpOutlineIcon sx={{ fontSize: 18 }} />
    </IconButton>
  </Tooltip>
);

// ─── FolioHelpModal ──────────────────────────────────────────────────────────

const FolioHelpModal: React.FC<{
  open: boolean;
  onClose: () => void;
  content: HelpContent;
}> = ({ open, onClose, content }) => (
  <Dialog
    open={open}
    onClose={onClose}
    maxWidth="md"
    fullWidth
    PaperProps={{ sx: { borderRadius: 2 } }}
  >
    <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Box sx={{ color: content.accentColor, display: 'flex' }}>{content.icon}</Box>
        <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1.1rem' }}>
          {content.title}
        </Typography>
      </Box>
      <IconButton onClick={onClose} size="small">
        <CloseIcon />
      </IconButton>
    </DialogTitle>

    <DialogContent dividers>
      {content.sections.map((section, idx) => (
        <Box key={idx} sx={{ mb: idx < content.sections.length - 1 ? 2 : 0 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1, color: content.accentColor }}>
            {section.title}
          </Typography>
          {section.body && (
            <Typography variant="body2" sx={{ mb: section.bullets ? 1 : 0, lineHeight: 1.7 }}>
              {section.body}
            </Typography>
          )}
          {section.bullets && section.bullets.length > 0 && (
            <Box component="ul" sx={{ pl: 2.5, m: 0 }}>
              {section.bullets.map((bullet, bIdx) => (
                <Typography key={bIdx} component="li" variant="body2" sx={{ mb: 0.75, lineHeight: 1.6 }}>
                  {bullet}
                </Typography>
              ))}
            </Box>
          )}
        </Box>
      ))}
    </DialogContent>

    <DialogActions sx={{ px: 3, py: 1.5 }}>
      <Button
        onClick={onClose}
        variant="contained"
        sx={{ bgcolor: content.accentColor, '&:hover': { bgcolor: content.accentColor, filter: 'brightness(0.85)' } }}
      >
        Got It
      </Button>
    </DialogActions>
  </Dialog>
);

export default FolioHelpModal;

// ─── Convenience hook ────────────────────────────────────────────────────────

export const useFolioHelp = () => {
  const [showHelp, setShowHelp] = useState(false);
  return {
    showHelp,
    openHelp: () => setShowHelp(true),
    closeHelp: () => setShowHelp(false),
  };
};
