'use client';

import React from 'react';
import { Box, TextField, Typography } from '@mui/material';
import EmojiObjectsIcon from '@mui/icons-material/EmojiObjects';
import { useFormContext } from '../lib/FormContext';
import { folioColors } from './FolioModal';

const prompts = [
  { key: 'hiddenTalents', prompt: 'What are your hidden talents?' },
  { key: 'unusualExperiences', prompt: 'What unusual experiences have you had?' },
  { key: 'funFacts', prompt: 'What are some fun facts about you?' },
  { key: 'adventures', prompt: 'What adventures have you had?' },
  { key: 'untoldStories', prompt: 'What have you never told many people?' },
] as const;

const tfSx = {
  '& .MuiOutlinedInput-root': {
    '&:hover fieldset': { borderColor: folioColors.accentWarm },
    '&.Mui-focused fieldset': { borderColor: folioColors.accent },
  },
  '& .MuiInputLabel-root.Mui-focused': { color: folioColors.accent },
};

const LegacySurprisesTab = () => {
  const { formData, updateFormData } = useFormContext();
  const surp = formData.legacySurprises;

  const handleChange = (field: string, value: string) => {
    updateFormData({ legacySurprises: { ...surp, [field]: value } });
  };

  return (
    <Box sx={{ bgcolor: '#fffcf5', borderRadius: 2, p: { xs: 2, md: 3 } }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
        <EmojiObjectsIcon sx={{ color: '#c9a227', fontSize: 28 }} />
        <Typography variant="h6" sx={{ fontWeight: 600 }}>Things People Might Be Surprised to Know</Typography>
      </Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: 600 }}>
        The fun stuff. The unexpected. The things that make you, you.
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {prompts.map((p) => (
          <Box key={p.key}>
            <Typography variant="body1" sx={{ fontStyle: 'italic', color: folioColors.ink, mb: 1, fontWeight: 500 }}>
              "{p.prompt}"
            </Typography>
            <TextField
              value={(surp as Record<string, string>)[p.key] || ''}
              onChange={(e) => handleChange(p.key, e.target.value)}
              multiline
              minRows={3}
              fullWidth
              placeholder="Share something surprising..."
              sx={{ ...tfSx, bgcolor: 'white' }}
            />
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default LegacySurprisesTab;
