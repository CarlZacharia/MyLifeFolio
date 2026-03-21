'use client';

import React, { useState } from 'react';
import {
  Box, Button, Card, CardContent, Chip, IconButton, Typography, Paper,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import { useFormContext } from '../lib/FormContext';
import { folioColors } from './FolioModal';
import LegacyStoryModal, { StoryData, emptyStory } from './LegacyStoryModal';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import LifeStoriesHelpModal from './LifeStoriesHelpModal';

const STORY_PROMPTS = [
  'A story about my parents',
  'My proudest moment',
  'The most difficult decision I ever made',
  'The happiest day of my life',
  'A mistake that taught me something important',
  'Something funny that happened that I\'ll never forget',
  'The moment I knew everything was going to be okay',
];

const LegacyLifeStoriesTab = () => {
  const { formData, updateFormData } = useFormContext();
  const stories = formData.legacyStories;

  const [modalOpen, setModalOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [prefillTitle, setPrefillTitle] = useState('');
  const [helpOpen, setHelpOpen] = useState(false);

  const openAdd = (title = '') => {
    setIsEdit(false); setEditIndex(null); setPrefillTitle(title); setModalOpen(true);
  };
  const openEdit = (i: number) => { setIsEdit(true); setEditIndex(i); setPrefillTitle(''); setModalOpen(true); };
  const closeModal = () => { setModalOpen(false); setIsEdit(false); setEditIndex(null); setPrefillTitle(''); };

  const handleSave = (data: StoryData) => {
    if (isEdit && editIndex !== null) {
      const updated = [...stories]; updated[editIndex] = data;
      updateFormData({ legacyStories: updated });
    } else {
      updateFormData({ legacyStories: [...stories, data] });
    }
  };

  const handleDelete = () => {
    if (editIndex !== null) {
      updateFormData({ legacyStories: stories.filter((_, i) => i !== editIndex) });
      closeModal();
    }
  };

  const getInitialData = (): StoryData | undefined => {
    if (isEdit && editIndex !== null) return stories[editIndex] as StoryData;
    if (prefillTitle) return { ...emptyStory(), storyTitle: prefillTitle };
    return undefined;
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
        <AutoStoriesIcon sx={{ color: '#c9a227', fontSize: 28 }} />
        <Typography variant="h6" sx={{ fontWeight: 600 }}>Important Life Stories</Typography>
        <IconButton onClick={() => setHelpOpen(true)} size="small" sx={{ ml: 0.5, bgcolor: '#1a1a1a', color: '#c9a227', width: 28, height: 28, '&:hover': { bgcolor: '#333' } }} title="Audio guide">
          <VolumeUpIcon sx={{ fontSize: 20 }} />
        </IconButton>
      </Box>
      <LifeStoriesHelpModal open={helpOpen} onClose={() => setHelpOpen(false)} />
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: 600 }}>
        The stories that shaped who you are. Each one is a gift to your family.
      </Typography>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => openAdd()} size="small"
          sx={{ bgcolor: folioColors.ink, '&:hover': { bgcolor: '#3d3224' } }}>
          Add a Story
        </Button>
      </Box>

      {stories.length > 0 ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {stories.map((story, i) => (
            <Card key={i} variant="outlined" sx={{ '&:hover': { borderColor: folioColors.accentWarm }, transition: 'border-color 0.2s' }}>
              <CardContent sx={{ py: 1.5, px: 2, '&:last-child': { pb: 1.5 } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flex: 1, minWidth: 0 }}>
                    <AutoStoriesIcon sx={{ color: folioColors.accent, fontSize: 24 }} />
                    <Box sx={{ minWidth: 0 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, lineHeight: 1.3 }}>
                        {story.storyTitle}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.4 }}>
                        {[story.approximateDate, story.location, story.peopleInvolved].filter(Boolean).join(' · ')}
                      </Typography>
                      {story.storyBody && (
                        <Typography variant="body2" color="text.secondary"
                          sx={{ fontSize: '0.8rem', fontStyle: 'italic', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 500 }}>
                          {story.storyBody.slice(0, 100)}{story.storyBody.length > 100 ? '...' : ''}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                  <IconButton size="small" onClick={() => openEdit(i)} sx={{ color: folioColors.inkLight }}>
                    <EditIcon fontSize="small" />
                  </IconButton>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      ) : (
        <Box>
          <Paper variant="outlined" sx={{ p: 4, textAlign: 'center', mb: 3 }}>
            <AutoStoriesIcon sx={{ fontSize: 48, color: folioColors.inkFaint, mb: 1 }} />
            <Typography color="text.secondary" sx={{ mb: 2 }}>
              No stories yet. Pick a prompt below to get started, or add your own.
            </Typography>
          </Paper>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5 }}>Story prompts for inspiration:</Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {STORY_PROMPTS.map((prompt) => (
              <Chip
                key={prompt}
                label={prompt}
                onClick={() => openAdd(prompt)}
                variant="outlined"
                sx={{ cursor: 'pointer', '&:hover': { bgcolor: 'rgba(201, 162, 39, 0.08)', borderColor: '#c9a227' } }}
              />
            ))}
          </Box>
        </Box>
      )}

      <LegacyStoryModal open={modalOpen} onClose={closeModal} onSave={handleSave}
        onDelete={isEdit ? handleDelete : undefined}
        initialData={getInitialData()}
        isEdit={isEdit} />
    </Box>
  );
};

export default LegacyLifeStoriesTab;
