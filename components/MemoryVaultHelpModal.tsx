'use client';

import React from 'react';
import { Typography, Box, Divider } from '@mui/material';
import { folioColors } from './FolioModal';
import ResourceHelpModal, { HelpSection, helpBodySx } from './ResourceHelpModal';

interface MemoryVaultHelpModalProps {
  open: boolean;
  onClose: () => void;
}

const body = helpBodySx;

const MemoryVaultHelpModal: React.FC<MemoryVaultHelpModalProps> = ({ open, onClose }) => (
  <ResourceHelpModal
    open={open}
    onClose={onClose}
    title="How Memory Vault Works"
    audioSrc="/audio/resources/legacy-memory-vault.mp3"
  >
    <Typography sx={{ ...body, mb: 2.5 }}>
      The Memory Vault is your personal archive of photographs, keepsakes,
      and cherished moments. It gives you a place to gather the memories
      that matter most and ensure they are preserved alongside the rest of
      your legacy.
    </Typography>

    <HelpSection title="Adding a Memory">
      <Typography sx={body}>
        Tap <strong>Add Memory</strong> to create a new entry. Give it a
        title, write a description of the moment, and include details like
        who was in the photo, the approximate year, and where it was taken.
        You can also add tags to help organize your memories by theme.
      </Typography>
    </HelpSection>

    <HelpSection title="Uploading Photos & Documents">
      <Typography sx={body}>
        Each memory supports file uploads — click{' '}
        <strong>Choose Files</strong> to attach photographs, scanned
        documents, or other keepsakes directly to the entry. Accepted
        formats include <strong>PDF, GIF, JPEG, PNG, WEBP, BMP,
        and TIFF</strong>, with a maximum size of{' '}
        <strong>10 MB per file</strong>. You can upload up to{' '}
        <strong>20 files total</strong> across all of your memories.
      </Typography>
    </HelpSection>

    <HelpSection title="External Links">
      <Typography sx={body}>
        Prefer to keep your photos in the cloud? Use the{' '}
        <strong>Photo / Media Link</strong> field to paste a URL to a
        Google Photos album, Dropbox folder, or any other cloud service.
        Uploads and links work side by side — use whichever is most
        convenient, or both.
      </Typography>
    </HelpSection>

    <Divider sx={{ borderColor: folioColors.parchment, my: 2 }} />

    <HelpSection title="Editing & Managing">
      <Typography sx={body}>
        Every memory appears as a card on the main page. Click the edit
        icon to update descriptions, add or remove files, swap links, or
        add new context as you remember more details. You can also delete
        entire entries you no longer want to include — any uploaded files
        will be cleaned up automatically.
      </Typography>
    </HelpSection>

    <HelpSection title="Why Memories Matter">
      <Typography sx={body}>
        Photos fade, albums get misplaced, and the stories behind keepsakes
        are often lost with time. By recording the context alongside the
        memory — who was there, why it mattered, what made you laugh — you
        give your family something far richer than an unlabeled photograph.
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
        <strong>Tip:</strong> Start with the memory you would most want your
        grandchildren to know about. That single entry often sparks a flood
        of others. Even one uploaded photo with a short description becomes
        a treasured keepsake.
      </Typography>
    </Box>
  </ResourceHelpModal>
);

export default MemoryVaultHelpModal;
