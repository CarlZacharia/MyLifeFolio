'use client';

import React, { useState } from 'react';
import { Box, Typography, SxProps, Theme } from '@mui/material';
import VideocamIcon from '@mui/icons-material/Videocam';
import HelpModal from './HelpModal';

interface HelpIconProps {
  helpId: number;
  onClick: () => void;
  size?: 'small' | 'medium';
}

// Standalone help icon component
export const HelpIcon: React.FC<HelpIconProps> = ({ onClick, size = 'small' }) => {
  const iconSize = size === 'small' ? 16 : 20;
  const fontSize = size === 'small' ? '0.65rem' : '0.75rem';

  return (
    <Box
      component="span"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onClick();
      }}
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: iconSize,
        height: iconSize,
        borderRadius: '50%',
        bgcolor: '#1a237e',
        color: '#FFD700',
        fontSize: fontSize,
        fontWeight: 700,
        cursor: 'pointer',
        ml: 0.5,
        flexShrink: 0,
        transition: 'all 0.2s ease',
        boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
        '&:hover': {
          transform: 'scale(1.15)',
          boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
        },
      }}
    >
      ?
    </Box>
  );
};

// Video help icon component - uses video camera icon instead of ?
export const VideoHelpIcon: React.FC<HelpIconProps> = ({ onClick, size = 'small' }) => {
  const iconSize = size === 'small' ? 20 : 24;
  const muiIconSize = size === 'small' ? 12 : 14;

  return (
    <Box
      component="span"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onClick();
      }}
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: iconSize,
        height: iconSize,
        borderRadius: '50%',
        bgcolor: '#c62828', // Dark red for video icons
        color: '#FFFFFF',
        cursor: 'pointer',
        ml: 0.5,
        flexShrink: 0,
        transition: 'all 0.2s ease',
        boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
        '&:hover': {
          transform: 'scale(1.15)',
          boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
          bgcolor: '#b71c1c',
        },
      }}
    >
      <VideocamIcon sx={{ fontSize: muiIconSize }} />
    </Box>
  );
};

interface FieldLabelWithHelpProps {
  label: string;
  helpId: number;
  required?: boolean;
  sx?: SxProps<Theme>;
}

// A label with help icon that can be placed above a field
export const FieldLabelWithHelp: React.FC<FieldLabelWithHelpProps> = ({
  label,
  helpId,
  required = false,
  sx,
}) => {
  const [helpOpen, setHelpOpen] = useState(false);

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          mb: 0.5,
          ...sx,
        }}
      >
        <Typography
          component="label"
          variant="body2"
          sx={{
            fontWeight: 500,
            color: 'text.primary',
          }}
        >
          {label}
          {required && (
            <Typography component="span" sx={{ color: 'error.main', ml: 0.5 }}>
              *
            </Typography>
          )}
        </Typography>
        <HelpIcon helpId={helpId} onClick={() => setHelpOpen(true)} />
      </Box>
      <HelpModal
        open={helpOpen}
        onClose={() => setHelpOpen(false)}
        helpId={helpId}
      />
    </>
  );
};

interface UseFieldHelpReturn {
  helpOpen: boolean;
  openHelp: () => void;
  closeHelp: () => void;
  HelpIconButton: React.FC;
  HelpModalComponent: React.FC;
}

// Hook for using help with any field - more flexible approach
export const useFieldHelp = (helpId: number): UseFieldHelpReturn => {
  const [helpOpen, setHelpOpen] = useState(false);

  const openHelp = () => setHelpOpen(true);
  const closeHelp = () => setHelpOpen(false);

  const HelpIconButton: React.FC = () => (
    <HelpIcon helpId={helpId} onClick={openHelp} />
  );

  const HelpModalComponent: React.FC = () => (
    <HelpModal open={helpOpen} onClose={closeHelp} helpId={helpId} />
  );

  return {
    helpOpen,
    openHelp,
    closeHelp,
    HelpIconButton,
    HelpModalComponent,
  };
};

export default FieldLabelWithHelp;
