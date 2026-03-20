'use client';

import React from 'react';
import { Typography, Box, Divider } from '@mui/material';
import { folioColors } from './FolioModal';
import ResourceHelpModal, { HelpSection, helpBodySx } from './ResourceHelpModal';

interface ReflectionsHelpModalProps {
  open: boolean;
  onClose: () => void;
}

const body = helpBodySx;

const ReflectionsHelpModal: React.FC<ReflectionsHelpModalProps> = ({ open, onClose }) => (
  <ResourceHelpModal
    open={open}
    onClose={onClose}
    title="How Personal Reflections Works"
    audioSrc="/audio/resources/legacy-reflections.mp3"
  >
    <Typography sx={{ ...body, mb: 2.5 }}>
      Personal Reflections invites you to step back from the facts and dates
      of your life and share the wisdom, beliefs, and emotions behind them.
      These are the words your family will turn to when they want to
      understand not just what you did, but why it mattered to you.
    </Typography>

    <HelpSection title="Open-Ended Prompts">
      <Typography sx={body}>
        Six carefully chosen questions guide your thinking:{' '}
        <em>&quot;What matters most in life?&quot;</em>,{' '}
        <em>&quot;What advice would you give to younger generations?&quot;</em>,{' '}
        <em>&quot;What do you believe most strongly?&quot;</em>,{' '}
        <em>&quot;What are your greatest regrets?&quot;</em>,{' '}
        <em>&quot;What have been your greatest joys?&quot;</em>, and{' '}
        <em>&quot;How do you want to be remembered?&quot;</em> Each prompt
        opens a text area where you can write as much or as little as feels
        right.
      </Typography>
    </HelpSection>

    <Divider sx={{ borderColor: folioColors.parchment, my: 2 }} />

    <HelpSection title="Personal Values">
      <Typography sx={body}>
        Below the written prompts you will find a set of value chips —
        words like <strong>Faith / Religion</strong>,{' '}
        <strong>Family</strong>, <strong>Service to Others</strong>,{' '}
        <strong>Hard Work</strong>, and <strong>Adventure</strong>. Tap the
        values that resonate with you to build a snapshot of what drives
        your decisions and defines your character. Select as many as you
        like.
      </Typography>
    </HelpSection>

    <HelpSection title="No Right Answers">
      <Typography sx={body}>
        There is no scoring, no judgment, and no requirement to answer
        every question. Some people fill every prompt in one sitting; others
        return over weeks as new thoughts surface. The only goal is
        honesty — your family will value authenticity far more than
        perfection.
      </Typography>
    </HelpSection>

    <HelpSection title="Why This Matters">
      <Typography sx={body}>
        Reflections are among the most meaningful pieces of a legacy. Long
        after possessions are divided and documents are filed, the beliefs
        and life lessons you record here will continue to guide and comfort
        the people you love.
      </Typography>
    </HelpSection>

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
        <strong>Tip:</strong> If a prompt feels difficult, try answering it
        as though you are sitting across the table from someone you love.
        Speak from the heart — that is exactly what they will want to hear.
      </Typography>
    </Box>
  </ResourceHelpModal>
);

export default ReflectionsHelpModal;
