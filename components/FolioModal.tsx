'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  Box,
  IconButton,
  Slide,
  Fade,
} from '@mui/material';
import { TransitionProps } from '@mui/material/transitions';
import CloseIcon from '@mui/icons-material/Close';

// Slide-up transition
const SlideUp = React.forwardRef(function SlideUp(
  props: TransitionProps & { children: React.ReactElement },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

// Design system colors
export const folioColors = {
  cream: '#f9f5ef',
  creamDark: '#f0e9dc',
  parchment: '#e8ddd0',
  ink: '#2c2416',
  inkLight: '#6b5c47',
  inkFaint: '#a8977f',
  accent: '#8b6914',
  accentWarm: '#c49a3c',
};

// Shared style helpers
export const folioLabelSx = {
  fontFamily: '"Jost", sans-serif',
  fontWeight: 500,
  fontSize: '10.5px',
  letterSpacing: '0.14em',
  textTransform: 'uppercase' as const,
  color: folioColors.inkLight,
  mb: 0.5,
};

export const folioInputSx = {
  fontFamily: '"Jost", sans-serif',
  fontWeight: 700,
  fontSize: '15px',
  color: '#324B5C',
  bgcolor: '#ffffff',
  border: `1px solid ${folioColors.parchment}`,
  borderRadius: '6px',
  px: 1.5,
  py: 1,
  width: '100%',
  outline: 'none',
  transition: 'border-color 0.2s, box-shadow 0.2s',
  '&:focus': {
    borderColor: folioColors.accentWarm,
    boxShadow: `0 0 0 3px rgba(139,105,20,0.10)`,
  },
  '&::placeholder': {
    fontStyle: 'italic',
    color: folioColors.inkFaint,
    fontWeight: 300,
  },
};

// MUI TextField style overrides to match the design
export const folioTextFieldSx = {
  '& .MuiInputLabel-root': {
    fontFamily: '"Jost", sans-serif',
    fontWeight: 700,
    fontSize: '14px',
    letterSpacing: '0.1em',
    textTransform: 'uppercase' as const,
    color: folioColors.inkLight,
    '&.Mui-focused': {
      color: folioColors.accent,
    },
  },
  '& .MuiOutlinedInput-root': {
    fontFamily: '"Jost", sans-serif',
    fontWeight: 700,
    fontSize: '15px',
    color: '#324B5C',
    bgcolor: '#ffffff',
    borderRadius: '6px',
    '& fieldset': {
      borderColor: folioColors.parchment,
    },
    '&:hover fieldset': {
      borderColor: folioColors.inkFaint,
    },
    '&.Mui-focused fieldset': {
      borderColor: folioColors.accentWarm,
      borderWidth: '1px',
      boxShadow: `0 0 0 3px rgba(139,105,20,0.10)`,
    },
  },
  '& .MuiInputBase-input::placeholder': {
    fontStyle: 'italic',
    color: folioColors.inkFaint,
    opacity: 1,
  },
};

// Format title: word after "&" in italic gold
const FolioTitle: React.FC<{ label: string }> = ({ label }) => {
  const ampIdx = label.indexOf('&');
  if (ampIdx === -1) return <span>{label}</span>;
  const before = label.substring(0, ampIdx + 1);
  const after = label.substring(ampIdx + 1);
  return (
    <>
      {before}
      <span style={{ fontStyle: 'italic', color: folioColors.accentWarm }}>{after}</span>
    </>
  );
};

// Optional pill badge
export const FolioOptionalBadge: React.FC = () => (
  <Box
    component="span"
    sx={{
      fontFamily: '"Jost", sans-serif',
      fontSize: '9px',
      fontWeight: 500,
      letterSpacing: '0.1em',
      textTransform: 'uppercase',
      color: folioColors.inkFaint,
      bgcolor: folioColors.creamDark,
      border: `1px solid ${folioColors.parchment}`,
      borderRadius: '10px',
      px: 1,
      py: 0.15,
      lineHeight: 1.5,
      ml: 1,
    }}
  >
    Optional
  </Box>
);

// Cancel button
export const FolioCancelButton: React.FC<{ onClick: () => void }> = ({ onClick }) => (
  <Box
    component="button"
    onClick={onClick}
    sx={{
      fontFamily: '"Jost", sans-serif',
      fontWeight: 500,
      fontSize: '13.5px',
      letterSpacing: '0.05em',
      color: folioColors.inkLight,
      bgcolor: 'transparent',
      border: `1px solid ${folioColors.parchment}`,
      borderRadius: '6px',
      px: 2.5,
      py: 0.9,
      cursor: 'pointer',
      transition: 'all 0.2s',
      '&:hover': {
        borderColor: folioColors.inkFaint,
        color: folioColors.ink,
      },
    }}
  >
    Cancel
  </Box>
);

// Primary save button
export const FolioSaveButton: React.FC<{
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}> = ({ onClick, disabled, children }) => (
  <Box
    component="button"
    onClick={onClick}
    disabled={disabled}
    sx={{
      fontFamily: '"Jost", sans-serif',
      fontWeight: 500,
      fontSize: '13.5px',
      letterSpacing: '0.05em',
      color: '#ffffff',
      background: disabled
        ? folioColors.inkFaint
        : `linear-gradient(135deg, ${folioColors.ink} 0%, #3d3224 50%, ${folioColors.ink} 100%)`,
      border: '1px solid rgba(196,154,60,0.25)',
      borderRadius: '6px',
      px: 2.5,
      py: 0.9,
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.6 : 1,
      transition: 'all 0.2s',
      boxShadow: disabled
        ? 'none'
        : `inset 0 1px 0 rgba(196,154,60,0.15), 0 2px 8px rgba(44,36,22,0.15)`,
      '&:hover': disabled
        ? {}
        : {
            background: `linear-gradient(135deg, #3d3224 0%, #4a3d2e 50%, #3d3224 100%)`,
            boxShadow: `inset 0 1px 0 rgba(196,154,60,0.25), 0 4px 16px rgba(44,36,22,0.2)`,
          },
    }}
  >
    {children}
  </Box>
);

// Delete button
export const FolioDeleteButton: React.FC<{ onClick: () => void }> = ({ onClick }) => (
  <Box
    component="button"
    onClick={onClick}
    sx={{
      fontFamily: '"Jost", sans-serif',
      fontWeight: 500,
      fontSize: '13.5px',
      letterSpacing: '0.05em',
      color: '#c62828',
      bgcolor: 'transparent',
      border: `1px solid #e57373`,
      borderRadius: '6px',
      px: 2.5,
      py: 0.9,
      cursor: 'pointer',
      transition: 'all 0.2s',
      '&:hover': {
        bgcolor: '#ffebee',
        borderColor: '#c62828',
      },
    }}
  >
    Delete
  </Box>
);

// Google Fonts style tag
export const FolioFonts: React.FC = () => (
  <style>
    {`@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Jost:wght@300;400;500&display=swap');`}
  </style>
);

// Staggered fade-in field wrapper
export const FolioFieldFade: React.FC<{
  visible: boolean;
  index: number;
  children: React.ReactNode;
}> = ({ visible, index, children }) => (
  <Fade
    in={visible}
    timeout={400}
    style={{ transitionDelay: visible ? `${index * 50}ms` : '0ms' }}
  >
    <Box>{children}</Box>
  </Fade>
);

// Hook for managing field visibility animation
export const useFolioFieldAnimation = (open: boolean) => {
  const [fieldsVisible, setFieldsVisible] = useState(false);

  useEffect(() => {
    if (open) {
      setFieldsVisible(false);
      const timer = setTimeout(() => setFieldsVisible(true), 150);
      return () => clearTimeout(timer);
    } else {
      setFieldsVisible(false);
    }
  }, [open]);

  return fieldsVisible;
};

interface FolioModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  eyebrow?: string;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  footer?: React.ReactNode;
}

const FolioModal: React.FC<FolioModalProps> = ({
  open,
  onClose,
  title,
  eyebrow = 'My Life Folio',
  maxWidth = 'sm',
  children,
  footer,
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={maxWidth}
      fullWidth
      TransitionComponent={SlideUp}
      PaperProps={{
        sx: {
          borderRadius: '12px',
          overflow: 'hidden',
          boxShadow: '0 24px 80px rgba(44,36,22,0.18)',
          bgcolor: folioColors.cream,
        },
      }}
    >
      <FolioFonts />

      {/* Header */}
      <Box
        sx={{
          bgcolor: folioColors.ink,
          color: '#ffffff',
          px: 3.5,
          pt: 2.5,
          pb: 2,
          position: 'relative',
        }}
      >
        <Box
          sx={{
            fontFamily: '"Jost", sans-serif',
            fontWeight: 400,
            fontSize: '10px',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: folioColors.accentWarm,
            mb: 0.75,
          }}
        >
          {eyebrow}
        </Box>
        <Box
          sx={{
            fontFamily: '"Cormorant Garamond", Georgia, serif',
            fontWeight: 500,
            fontSize: '1.65rem',
            lineHeight: 1.2,
            pr: 5,
          }}
        >
          <FolioTitle label={title} />
        </Box>
        <IconButton
          onClick={onClose}
          size="small"
          sx={{
            position: 'absolute',
            top: 12,
            right: 12,
            color: folioColors.inkFaint,
            '&:hover': { color: '#ffffff' },
          }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>

      {/* Body */}
      <Box
        sx={{
          px: 3.5,
          py: 3,
          maxHeight: '60vh',
          overflowY: 'auto',
          '&::-webkit-scrollbar': { width: 6 },
          '&::-webkit-scrollbar-track': { bgcolor: 'transparent' },
          '&::-webkit-scrollbar-thumb': {
            bgcolor: folioColors.inkLight,
            borderRadius: 3,
          },
        }}
      >
        {children}
      </Box>

      {/* Footer */}
      {footer && (
        <Box
          sx={{
            bgcolor: folioColors.creamDark,
            borderTop: `1px solid ${folioColors.parchment}`,
            px: 3.5,
            py: 2,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          {footer}
        </Box>
      )}
    </Dialog>
  );
};

export default FolioModal;
