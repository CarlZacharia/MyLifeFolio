'use client';

import React from 'react';
import { Typography, Box, Divider } from '@mui/material';
import { folioColors } from './FolioModal';
import ResourceHelpModal, { HelpSection, helpBodySx } from './ResourceHelpModal';

interface CharitableWishesHelpModalProps {
  open: boolean;
  onClose: () => void;
}

const body = helpBodySx;

const CharitableWishesHelpModal: React.FC<CharitableWishesHelpModalProps> = ({ open, onClose }) => (
  <ResourceHelpModal
    open={open}
    onClose={onClose}
    title="How Charitable Wishes Works"
    audioSrc="/audio/resources/legacy-charitable-wishes.mp3"
  >
    <Typography sx={{ ...body, mb: 2.5 }}>
      Charitable &amp; Legacy Wishes lets you document the causes and
      organizations closest to your heart, so your family can honor your
      values through giving — both now and after you are gone.
    </Typography>

    <HelpSection title="Adding an Organization">
      <Typography sx={body}>
        Tap <strong>Add Organization</strong> to record a charity or cause
        you care about. Include the organization name, a description of why
        it matters to you, and any specific instructions — such as a
        preferred donation amount, a fund or program to direct gifts toward,
        or a contact person at the organization.
      </Typography>
    </HelpSection>

    <HelpSection title="Charitable Preferences">
      <Typography sx={body}>
        Below your list of organizations, you can set broader preferences
        for how charitable giving should be handled as part of your estate.
        Note whether you would like donations made in lieu of flowers,
        whether your estate plan includes charitable bequests, and any
        other wishes your family should know about.
      </Typography>
    </HelpSection>

    <Divider sx={{ borderColor: folioColors.parchment, my: 2 }} />

    <HelpSection title="Editing & Organizing">
      <Typography sx={body}>
        Each organization appears as a card you can edit or remove at any
        time. As your interests evolve, update your list so it always
        reflects your current priorities. There is no limit to the number
        of organizations you can add.
      </Typography>
    </HelpSection>

    <HelpSection title="Why This Matters">
      <Typography sx={body}>
        Charitable giving is one of the most personal expressions of your
        values. By documenting your wishes clearly, you spare your family
        from guessing and ensure the causes you championed in life continue
        to benefit from your generosity.
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
        <strong>Tip:</strong> Include a sentence about <em>why</em> each
        organization matters to you. Your family will find it deeply
        meaningful to understand the story behind each gift.
      </Typography>
    </Box>
  </ResourceHelpModal>
);

export default CharitableWishesHelpModal;
