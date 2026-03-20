'use client';

import React, { useRef, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  IconButton,
  Typography,
  Box,
  Divider,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import { folioColors } from './FolioModal';

// ── Shared styles exported for content components ──

export const HelpSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <Box sx={{ mb: 2.5 }}>
    <Typography
      variant="subtitle1"
      sx={{
        fontFamily: '"Jost", sans-serif',
        fontWeight: 700,
        fontSize: '14px',
        color: folioColors.ink,
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
        mb: 0.75,
      }}
    >
      {title}
    </Typography>
    {children}
  </Box>
);

export const helpBodySx = {
  fontFamily: '"Jost", sans-serif',
  fontSize: '13.5px',
  color: folioColors.inkLight,
  lineHeight: 1.6,
};

// ── Modal shell ──

export interface ResourceHelpModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  audioSrc?: string;
  children: React.ReactNode;
}

const ResourceHelpModal: React.FC<ResourceHelpModalProps> = ({
  open,
  onClose,
  title,
  audioSrc,
  children,
}) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (open && audioSrc) {
      const timer = setTimeout(() => {
        audioRef.current?.play().catch(() => {});
      }, 300);
      return () => clearTimeout(timer);
    } else if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, [open, audioSrc]);

  const handleClose = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '12px',
          bgcolor: folioColors.cream,
          maxHeight: '80vh',
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 3,
          pt: 2.5,
          pb: 1.5,
        }}
      >
        <Typography
          variant="h6"
          sx={{
            fontFamily: '"Jost", sans-serif',
            fontWeight: 700,
            color: folioColors.ink,
            fontSize: '18px',
          }}
        >
          {title}
        </Typography>
        <IconButton onClick={handleClose} size="small" sx={{ color: folioColors.inkLight }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>

      {/* Audio Narration (optional) */}
      {audioSrc && (
        <Box
          sx={{
            mx: 3,
            mb: 1,
            p: 1.5,
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            bgcolor: '#e8f5e9',
            borderRadius: '8px',
            border: '1px solid #c8e6c9',
          }}
        >
          <VolumeUpIcon sx={{ color: '#2e7d32', fontSize: 20 }} />
          <Box sx={{ flex: 1 }}>
            <Typography
              sx={{
                fontFamily: '"Jost", sans-serif',
                fontSize: '12px',
                color: '#2e7d32',
                fontWeight: 600,
                mb: 0.5,
              }}
            >
              Audio Guide
            </Typography>
            <audio
              ref={audioRef}
              controls
              controlsList="nodownload"
              style={{ width: '100%', height: 32 }}
              src={audioSrc}
            />
          </Box>
        </Box>
      )}

      <Divider sx={{ borderColor: folioColors.parchment }} />

      <DialogContent sx={{ px: 3, py: 2.5 }}>
        {children}
      </DialogContent>
    </Dialog>
  );
};

export default ResourceHelpModal;
