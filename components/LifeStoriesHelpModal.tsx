'use client';

import React from 'react';
import { Typography, Box, Divider } from '@mui/material';
import { folioColors } from './FolioModal';
import ResourceHelpModal, { HelpSection, helpBodySx } from './ResourceHelpModal';

interface LifeStoriesHelpModalProps {
  open: boolean;
  onClose: () => void;
}

const body = helpBodySx;

const LifeStoriesHelpModal: React.FC<LifeStoriesHelpModalProps> = ({ open, onClose }) => (
  <ResourceHelpModal
    open={open}
    onClose={onClose}
    title="How Life Stories Works"
    audioSrc="/audio/resources/legacy-life-stories.mp3"
  >
    <Typography sx={{ ...body, mb: 2.5 }}>
      Life Stories is where you preserve the defining moments of your
      journey — the stories your family will retell at holiday dinners,
      share with grandchildren, and carry with them for the rest of their
      lives.
    </Typography>

    <HelpSection title="Adding a Story">
      <Typography sx={body}>
        Tap <strong>Add Story</strong> to open the editor. Give your story a
        title, then write it out in the body field. There is no length limit,
        so take all the space you need to do the moment justice. You can save
        a draft and come back to polish it later.
      </Typography>
    </HelpSection>

    <HelpSection title="Story Prompts">
      <Typography sx={body}>
        Not sure where to begin? The page offers conversation starters like{' '}
        <em>&quot;A story about my parents,&quot;</em>{' '}
        <em>&quot;My proudest moment,&quot;</em>{' '}
        <em>&quot;The most difficult decision I ever made,&quot;</em> and{' '}
        <em>&quot;Something funny I&apos;ll never forget.&quot;</em> Click any
        prompt to pre-fill the title and start writing right away.
      </Typography>
    </HelpSection>

    <Divider sx={{ borderColor: folioColors.parchment, my: 2 }} />

    <HelpSection title="Editing & Organizing">
      <Typography sx={body}>
        Every story you save appears as a card on the main page. Click the
        edit icon to revise, expand, or update a story at any time. You can
        create as many stories as you like — each one becomes its own
        entry in your legacy.
      </Typography>
    </HelpSection>

    <HelpSection title="Why Stories Matter">
      <Typography sx={body}>
        Facts and dates tell your family what happened. Stories tell them
        what it felt like. A single well-told story can capture your
        personality, humor, and values in a way no document ever could.
        These are the entries your family will read again and again.
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
        <strong>Tip:</strong> Start with the story you find yourself telling
        most often. If it comes naturally in conversation, it will come
        naturally on the page — and your family already loves hearing it.
      </Typography>
    </Box>
  </ResourceHelpModal>
);

export default LifeStoriesHelpModal;
