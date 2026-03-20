'use client';

import React from 'react';
import { Typography, Box, Divider } from '@mui/material';
import { folioColors } from './FolioModal';
import ResourceHelpModal, { HelpSection, helpBodySx } from './ResourceHelpModal';

interface FamilyLettersHelpModalProps {
  open: boolean;
  onClose: () => void;
}

const body = helpBodySx;

const FamilyLettersHelpModal: React.FC<FamilyLettersHelpModalProps> = ({ open, onClose }) => (
  <ResourceHelpModal
    open={open}
    onClose={onClose}
    title="How Letters to Family Works"
    audioSrc="/audio/resources/legacy-family-letters.mp3"
  >
    <Typography sx={{ ...body, mb: 2.5 }}>
      Letters to Family lets you write personal messages for the people who
      matter most — your spouse, children, grandchildren, friends, or even
      future descendants. These heartfelt messages will be treasured for
      generations.
    </Typography>

    <HelpSection title="Recipient">
      <Typography sx={body}>
        Start by choosing a <strong>recipient type</strong> (Spouse/Partner,
        Child, Grandchild, Sibling, Friend, Future Descendants, or Other) and
        entering the <strong>recipient&apos;s name</strong>. Both fields are
        required so your family knows exactly who each letter is meant for.
      </Typography>
    </HelpSection>

    <HelpSection title="Subject">
      <Typography sx={body}>
        Give your letter a <strong>subject or topic</strong> — a short title
        that captures what the letter is about. This helps your family find
        specific messages later, especially if you write more than one.
      </Typography>
    </HelpSection>

    <HelpSection title="Writing Prompts">
      <Typography sx={body}>
        Not sure where to start? The form includes conversation starters like{' '}
        <em>&quot;What I want you to know about our family,&quot;</em>{' '}
        <em>&quot;Lessons I learned in life,&quot;</em> and{' '}
        <em>&quot;My hopes for your future.&quot;</em> These are just
        suggestions — write whatever feels right.
      </Typography>
    </HelpSection>

    <Divider sx={{ borderColor: folioColors.parchment, my: 2 }} />

    <HelpSection title="Dictate to Text">
      <Typography sx={body}>
        Prefer to speak rather than type? Click the{' '}
        <strong>Dictate to Text</strong> button above the letter body and
        start talking. Your words are transcribed in real time directly into
        the text area. You can pause, edit what was typed, then resume
        dictating — mix typing and speaking as you like. This feature works
        in Chrome and Edge browsers.
      </Typography>
    </HelpSection>

    <HelpSection title="Your Letter">
      <Typography sx={body}>
        Type (or dictate) your message in the letter body. There is no length
        limit, so take as much space as you need. You can save a draft and
        come back to finish it later.
      </Typography>
    </HelpSection>

    <HelpSection title="Privacy">
      <Typography sx={body}>
        Mark any letter as <strong>Private</strong> if you want it visible
        only to you. Private letters will not appear in family access until
        you change the setting.
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
        <strong>Tip:</strong> You can create as many letters as you like — one
        for each person, or multiple letters for the same person on different
        topics. The subject line helps keep them organized.
      </Typography>
    </Box>
  </ResourceHelpModal>
);

export default FamilyLettersHelpModal;
