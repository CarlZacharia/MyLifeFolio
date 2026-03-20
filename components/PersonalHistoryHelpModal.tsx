'use client';

import React from 'react';
import { Typography, Box, Divider } from '@mui/material';
import { folioColors } from './FolioModal';
import ResourceHelpModal, { HelpSection, helpBodySx } from './ResourceHelpModal';

interface PersonalHistoryHelpModalProps {
  open: boolean;
  onClose: () => void;
}

const body = helpBodySx;

const PersonalHistoryHelpModal: React.FC<PersonalHistoryHelpModalProps> = ({ open, onClose }) => (
  <ResourceHelpModal
    open={open}
    onClose={onClose}
    title="How Personal History Works"
    audioSrc="/audio/resources/legacy-personal-history.mp3"
  >
    <Typography sx={{ ...body, mb: 2.5 }}>
      Personal History is where you tell the story of your life — in your own
      words, at your own pace. These entries become a lasting narrative that
      your family can return to for generations, offering a window into who
      you are and the experiences that shaped you.
    </Typography>

    <HelpSection title="Five Life Chapters">
      <Typography sx={body}>
        Your history is organized into five meaningful chapters:{' '}
        <strong>Early Life</strong>, <strong>Education</strong>,{' '}
        <strong>Career</strong>, <strong>Family</strong>, and{' '}
        <strong>Turning Points</strong>. Each chapter opens as an accordion
        section with guided prompts designed to spark reflection. You can
        expand any chapter and begin wherever inspiration strikes.
      </Typography>
    </HelpSection>

    <HelpSection title="Guided Prompts">
      <Typography sx={body}>
        Every chapter includes thoughtful questions such as{' '}
        <em>&quot;Where did you grow up?&quot;</em>,{' '}
        <em>&quot;Who were the teachers or mentors who shaped you?&quot;</em>,
        and <em>&quot;What risks did you take that you&apos;re glad you
        took?&quot;</em> These prompts are starting points — write as
        little or as much as you like, and feel free to go beyond the
        question.
      </Typography>
    </HelpSection>

    <Divider sx={{ borderColor: folioColors.parchment, my: 2 }} />

    <HelpSection title="Early Life">
      <Typography sx={body}>
        Recall the places, people, and moments that defined your earliest
        years. Where you grew up, your favorite childhood memories, and the
        heritage your parents carried forward all belong here. Even small
        details — a neighborhood, a family tradition, the smell of a
        holiday meal — can paint a vivid picture for those who come after
        you.
      </Typography>
    </HelpSection>

    <HelpSection title="Education">
      <Typography sx={body}>
        Capture the schools you attended and, more importantly, the people
        and experiences that shaped your thinking. A teacher who believed in
        you, a subject that opened new doors, or a lesson learned outside
        the classroom — these stories help your family understand the
        foundation of your values.
      </Typography>
    </HelpSection>

    <HelpSection title="Career">
      <Typography sx={body}>
        From your very first job to the milestones that defined your
        professional life, this section preserves the ambition, hard work,
        and accomplishments that fueled your journey. Share what you are
        most proud of and the moments that tested your resolve.
      </Typography>
    </HelpSection>

    <HelpSection title="Family">
      <Typography sx={body}>
        How you met your partner, the story of your wedding, the joys and
        challenges of raising children — these are the threads that weave
        your family together. Writing them down ensures that the love and
        laughter behind those moments are never forgotten.
      </Typography>
    </HelpSection>

    <HelpSection title="Turning Points">
      <Typography sx={body}>
        Every life has pivotal decisions, unexpected challenges, and bold
        risks that altered its course. Reflecting on these turning points
        offers your family wisdom they can draw upon in their own lives,
        and shows them the courage it took to become who you are today.
      </Typography>
    </HelpSection>

    <Divider sx={{ borderColor: folioColors.parchment, my: 2 }} />

    <HelpSection title="Generate My Story">
      <Typography sx={body}>
        Once you have answered several prompts, the{' '}
        <strong>Generate My Story</strong> button will use your entries to
        craft a polished, first-person narrative — a memoir-style summary
        that weaves your answers into a cohesive story. This feature is
        coming soon.
      </Typography>
    </HelpSection>

    <HelpSection title="Your Progress">
      <Typography sx={body}>
        A counter at the top of the page tracks how many prompts you have
        completed out of fourteen. There is no pressure to finish in one
        sitting — save your work and return whenever new memories surface
        or inspiration strikes.
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
        <strong>Tip:</strong> You do not need to answer every prompt to
        create something meaningful. Even a handful of heartfelt responses
        can become a treasured keepsake for your family.
      </Typography>
    </Box>
  </ResourceHelpModal>
);

export default PersonalHistoryHelpModal;
