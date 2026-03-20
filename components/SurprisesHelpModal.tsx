'use client';

import React from 'react';
import { Typography, Box, Divider } from '@mui/material';
import { folioColors } from './FolioModal';
import ResourceHelpModal, { HelpSection, helpBodySx } from './ResourceHelpModal';

interface SurprisesHelpModalProps {
  open: boolean;
  onClose: () => void;
}

const body = helpBodySx;

const SurprisesHelpModal: React.FC<SurprisesHelpModalProps> = ({ open, onClose }) => (
  <ResourceHelpModal
    open={open}
    onClose={onClose}
    title="How Surprises Works"
    audioSrc="/audio/resources/legacy-surprises.mp3"
  >
    <Typography sx={{ ...body, mb: 2.5 }}>
      This is the fun side of your legacy. Surprises captures the hidden
      talents, unexpected adventures, and little-known facts that make you
      uniquely you. These are the stories that will make your family smile,
      laugh, and see you in a whole new light.
    </Typography>

    <HelpSection title="Five Discovery Prompts">
      <Typography sx={body}>
        Each prompt is designed to uncover something delightful:{' '}
        <em>&quot;What are your hidden talents?&quot;</em>,{' '}
        <em>&quot;What unusual experiences have you had?&quot;</em>,{' '}
        <em>&quot;What are some fun facts about you?&quot;</em>,{' '}
        <em>&quot;What adventures have you had?&quot;</em>, and{' '}
        <em>&quot;What have you never told many people?&quot;</em> Let your
        guard down and have some fun with these.
      </Typography>
    </HelpSection>

    <Divider sx={{ borderColor: folioColors.parchment, my: 2 }} />

    <HelpSection title="Hidden Talents">
      <Typography sx={body}>
        Can you juggle? Play the harmonica? Solve a Rubik&apos;s Cube in
        under a minute? Whether it is a party trick or a quiet skill you
        have never shown off, this is the place to share it. Your family
        will love discovering sides of you they never knew existed.
      </Typography>
    </HelpSection>

    <HelpSection title="Adventures & Experiences">
      <Typography sx={body}>
        Think about the moments that made your heart race — a spontaneous
        road trip, a chance encounter in a foreign country, or the time you
        tried something completely outside your comfort zone. These stories
        bring your personality to life in ways that traditional records
        never could.
      </Typography>
    </HelpSection>

    <HelpSection title="The Untold Stories">
      <Typography sx={body}>
        Everyone carries a few stories they have rarely shared — perhaps
        a quiet act of kindness, a funny mishap, or a moment of unexpected
        bravery. This prompt gives you a safe space to finally put those
        stories on the record for the people who matter most.
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
        <strong>Tip:</strong> Do not overthink this section. The best
        entries are the ones that make you grin while you are writing them.
        If it brings you joy, it will bring your family joy too.
      </Typography>
    </Box>
  </ResourceHelpModal>
);

export default SurprisesHelpModal;
