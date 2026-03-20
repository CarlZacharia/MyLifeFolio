'use client';

import React from 'react';
import { Typography, Box, Divider } from '@mui/material';
import { folioColors } from './FolioModal';
import ResourceHelpModal, { HelpSection, helpBodySx } from './ResourceHelpModal';

interface FavoritesHelpModalProps {
  open: boolean;
  onClose: () => void;
}

const body = helpBodySx;

const FavoritesHelpModal: React.FC<FavoritesHelpModalProps> = ({ open, onClose }) => (
  <ResourceHelpModal
    open={open}
    onClose={onClose}
    title="How My Favorites Works"
    audioSrc="/audio/resources/legacy-favorites.mp3"
  >
    <Typography sx={{ ...body, mb: 2.5 }}>
      My Favorites preserves the everyday joys and personal tastes that
      define who you are. From the songs that move you to the restaurants
      you always return to, these details paint an intimate portrait your
      family will treasure.
    </Typography>

    <HelpSection title="Eight Categories">
      <Typography sx={body}>
        The form is organized into eight easy-to-fill categories displayed
        in a two-column grid: <strong>Music</strong>, <strong>Books</strong>,{' '}
        <strong>Movies &amp; TV</strong>, <strong>Foods</strong>,{' '}
        <strong>Restaurants</strong>, <strong>Vacation Destinations</strong>,{' '}
        <strong>Quotes &amp; Sayings</strong>, and{' '}
        <strong>Other Favorites</strong>. Each field includes a placeholder
        hint to help you get started.
      </Typography>
    </HelpSection>

    <Divider sx={{ borderColor: folioColors.parchment, my: 2 }} />

    <HelpSection title="Music & Books">
      <Typography sx={body}>
        List the artists, albums, or songs that have been the soundtrack of
        your life, and the books or authors that shaped the way you think.
        Whether it is a classic novel or a guilty-pleasure playlist, your
        family will love stepping into your world through these choices.
      </Typography>
    </HelpSection>

    <HelpSection title="Movies, TV & Foods">
      <Typography sx={body}>
        The films you can watch over and over, the shows you never miss,
        and the comfort foods that feel like home — these small details
        reveal personality in a way that formal documents cannot. Do not
        hold back on the guilty pleasures.
      </Typography>
    </HelpSection>

    <HelpSection title="Restaurants & Destinations">
      <Typography sx={body}>
        That neighborhood spot with the perfect dish, or the vacation
        destination you have dreamed about returning to — share the places
        that hold a special place in your heart. Your family may even plan
        a visit in your honor someday.
      </Typography>
    </HelpSection>

    <HelpSection title="Quotes, Sayings & Everything Else">
      <Typography sx={body}>
        Record the words you live by — a favorite proverb, a line from a
        movie, or something your grandmother always said. The{' '}
        <strong>Other Favorites</strong> field is your catch-all for
        hobbies, sports teams, seasonal traditions, or anything else that
        brings you joy.
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
        <strong>Tip:</strong> There is no wrong answer here. A single
        favorite song or restaurant name is just as valuable as a detailed
        list. The goal is simply to capture the things that make you smile.
      </Typography>
    </Box>
  </ResourceHelpModal>
);

export default FavoritesHelpModal;
