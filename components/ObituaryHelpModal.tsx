'use client';

import React, { useRef, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  IconButton,
  Typography,
  Box,
  Divider,
  Chip,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import { folioColors } from './FolioModal';

interface ObituaryHelpModalProps {
  open: boolean;
  onClose: () => void;
}

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
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

const body = {
  fontFamily: '"Jost", sans-serif',
  fontSize: '13.5px',
  color: folioColors.inkLight,
  lineHeight: 1.6,
};

const ObituaryHelpModal: React.FC<ObituaryHelpModalProps> = ({ open, onClose }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (open) {
      // Small delay so the dialog renders before playback starts
      const timer = setTimeout(() => {
        audioRef.current?.play().catch(() => {});
      }, 300);
      return () => clearTimeout(timer);
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    }
  }, [open]);

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
        How Obituary Information Works
      </Typography>
      <IconButton onClick={handleClose} size="small" sx={{ color: folioColors.inkLight }}>
        <CloseIcon fontSize="small" />
      </IconButton>
    </Box>

    {/* Audio Narration */}
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
        <Typography sx={{ ...body, fontSize: '12px', color: '#2e7d32', fontWeight: 600, mb: 0.5 }}>
          Audio Guide
        </Typography>
        <audio
          ref={audioRef}
          controls
          controlsList="nodownload"
          style={{ width: '100%', height: 32 }}
          src="/audio/resources/Legacy-Obit.mp3"
        />
      </Box>
    </Box>

    <Divider sx={{ borderColor: folioColors.parchment }} />

    <DialogContent sx={{ px: 3, py: 2.5 }}>
      <Typography sx={{ ...body, mb: 2.5 }}>
        This section lets you prepare obituary information for yourself or your spouse
        ahead of time — so your family has everything they need, written in your own words.
      </Typography>

      <Section title="The Basics">
        <Typography sx={body}>
          Enter your <strong>full name</strong>, any <strong>nicknames</strong>, and your{' '}
          <strong>date and place of birth</strong>. The date and place of death fields can
          be left blank for your family to complete when the time comes.
        </Typography>
      </Section>

      <Section title="Life Story">
        <Typography sx={body}>
          Share the details that paint a picture of who you are:{' '}
          <strong>hometowns</strong> you have called home, <strong>education</strong>,{' '}
          <strong>career highlights</strong>, <strong>military service</strong>,{' '}
          <strong>community involvement</strong>, <strong>religious affiliation</strong>,
          and any <strong>awards or honors</strong>. Multi-line fields let you list as
          much or as little as you like.
        </Typography>
      </Section>

      <Section title="Family">
        <Typography sx={body}>
          List your <strong>spouse(s)</strong>, <strong>children</strong>,{' '}
          <strong>grandchildren</strong>, <strong>siblings</strong>, and{' '}
          <strong>parents</strong>. You can also mention close friends, caregivers, or
          chosen family, and note anyone who <strong>preceded you in death</strong>.
        </Typography>
      </Section>

      <Section title="Your Voice">
        <Typography sx={body}>
          Choose a <strong>tone</strong> that reflects how you want to be remembered —
          Formal, Warm &amp; Personal, Lighthearted, Religious/Faith-Based, or Brief.
          Then add <strong>favorite quotes</strong>, what you would{' '}
          <strong>want people to remember</strong> about you, and a{' '}
          <strong>personal message</strong> to leave behind. The more you share here,
          the more personal the result will feel.
        </Typography>
      </Section>

      <Section title="Final Arrangements">
        <Typography sx={body}>
          Record your <strong>preferred funeral home</strong>,{' '}
          <strong>burial or cremation</strong> preference, any{' '}
          <strong>service preferences</strong> (public, private, celebration of life),
          and where <strong>charitable donations</strong> should be directed in lieu of
          flowers.
        </Typography>
      </Section>

      <Divider sx={{ borderColor: folioColors.parchment, my: 2 }} />

      <Section title="What Happens Next">
        <Typography sx={body}>
          You have two ways to create a finished obituary from your entries:
        </Typography>

        <Box sx={{ mt: 1.5, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
            <Chip
              label="Export"
              size="small"
              sx={{ bgcolor: folioColors.parchment, color: folioColors.ink, fontWeight: 600, mt: 0.25 }}
            />
            <Typography sx={body}>
              <strong>Export As Entered</strong> assembles your information into a
              clean, readable format — no AI involved. Great as a starting draft
              your family can edit.
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
            <Chip
              label="AI"
              size="small"
              sx={{ bgcolor: '#e8f5e9', color: '#2e7d32', fontWeight: 600, mt: 0.25 }}
            />
            <Typography sx={body}>
              <strong>Generate with AI</strong>{' '}
              <em>(Enhanced plan)</em> takes everything you have entered and
              composes a polished, publication-ready obituary in your chosen tone.
              The AI only uses information you provide — it never fabricates
              details. You can generate up to <strong>5 drafts</strong> per
              person, each downloadable as Text, Word, or PDF.
            </Typography>
          </Box>
        </Box>
      </Section>

      <Box
        sx={{
          mt: 1,
          p: 1.5,
          bgcolor: '#fff8e1',
          borderRadius: '8px',
          border: '1px solid #ffe082',
        }}
      >
        <Typography sx={{ ...body, fontSize: '12.5px', color: '#6d4c00' }}>
          <strong>Tip:</strong> Fill in as many fields as you can — especially the
          &quot;Your Voice&quot; section. The richer the detail, the more meaningful
          the final obituary will be for your loved ones.
        </Typography>
      </Box>
    </DialogContent>
  </Dialog>
  );
};

export default ObituaryHelpModal;
