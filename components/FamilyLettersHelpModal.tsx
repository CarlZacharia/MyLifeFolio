'use client';

import React from 'react';
import { Typography, Box, Divider, Chip } from '@mui/material';
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
      Letters to Family lets you write or record personal messages for the
      people who matter most — your spouse, children, grandchildren, friends,
      or even future descendants. These heartfelt messages will be treasured
      for generations.
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

    <HelpSection title="Your Letter">
      <Typography sx={body}>
        Type your message in the letter body. There is no length limit, so
        take as much space as you need. You can save a draft and come back
        to finish it later.
      </Typography>
    </HelpSection>

    <Divider sx={{ borderColor: folioColors.parchment, my: 2 }} />

    <HelpSection title="Format Options">
      <Typography sx={{ ...body, mb: 1.5 }}>
        Choose how you want to deliver your message:
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
          <Chip
            label="Written"
            size="small"
            sx={{ bgcolor: folioColors.parchment, color: folioColors.ink, fontWeight: 600, mt: 0.25 }}
          />
          <Typography sx={body}>
            Type your letter directly. This is the default and simplest option.
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
          <Chip
            label="Audio"
            size="small"
            sx={{ bgcolor: '#e3f2fd', color: '#1565c0', fontWeight: 600, mt: 0.25 }}
          />
          <Typography sx={body}>
            Record your voice using your device&apos;s microphone. Hearing
            your actual voice can mean the world to loved ones. The recording
            is saved securely to your account.
          </Typography>
        </Box>
      </Box>
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
