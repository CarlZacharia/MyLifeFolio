'use client';

import React from 'react';
import { Box, TextField, Typography, Chip } from '@mui/material';
import PsychologyIcon from '@mui/icons-material/Psychology';
import { useFormContext } from '../lib/FormContext';
import { folioColors } from './FolioModal';

const prompts = [
  { key: 'whatMattersMost', prompt: 'What matters most in life?' },
  { key: 'adviceToYounger', prompt: 'What advice would you give to younger generations?' },
  { key: 'coreBeliefs', prompt: 'What do you believe most strongly?' },
  { key: 'greatestRegrets', prompt: 'What are your greatest regrets?' },
  { key: 'greatestJoys', prompt: 'What have been your greatest joys?' },
  { key: 'howRemembered', prompt: 'How do you want to be remembered?' },
] as const;

const VALUES = [
  'Faith / Religion', 'Family', 'Service to Others', 'Education',
  'Hard Work', 'Loyalty', 'Creativity', 'Adventure',
  'Community', 'Financial Security',
];

const tfSx = {
  '& .MuiOutlinedInput-root': {
    '&:hover fieldset': { borderColor: folioColors.accentWarm },
    '&.Mui-focused fieldset': { borderColor: folioColors.accent },
  },
  '& .MuiInputLabel-root.Mui-focused': { color: folioColors.accent },
};

const LegacyReflectionsTab = () => {
  const { formData, updateFormData } = useFormContext();
  const refl = formData.legacyReflections;

  const handleChange = (field: string, value: string) => {
    updateFormData({ legacyReflections: { ...refl, [field]: value } });
  };

  const toggleValue = (val: string) => {
    const current = refl.personalValues || [];
    const updated = current.includes(val)
      ? current.filter((v) => v !== val)
      : [...current, val];
    updateFormData({ legacyReflections: { ...refl, personalValues: updated } });
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
        <PsychologyIcon sx={{ color: '#c9a227', fontSize: 28 }} />
        <Typography variant="h6" sx={{ fontWeight: 600 }}>Personal Reflections</Typography>
      </Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: 600 }}>
        Take your time with these. There are no right answers — just your honest thoughts.
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {prompts.map((p) => (
          <Box key={p.key}>
            <Typography variant="body1" sx={{ fontStyle: 'italic', color: folioColors.ink, mb: 1, fontWeight: 500 }}>
              "{p.prompt}"
            </Typography>
            <TextField
              value={(refl as Record<string, string | string[]>)[p.key] as string || ''}
              onChange={(e) => handleChange(p.key, e.target.value)}
              multiline
              minRows={3}
              fullWidth
              placeholder="Share your thoughts..."
              sx={tfSx}
            />
          </Box>
        ))}

        <Box>
          <Typography variant="body1" sx={{ fontWeight: 600, mb: 1.5 }}>
            Personal Values
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
            Select the values that are most important to you.
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {VALUES.map((val) => {
              const selected = (refl.personalValues || []).includes(val);
              return (
                <Chip
                  key={val}
                  label={val}
                  onClick={() => toggleValue(val)}
                  variant={selected ? 'filled' : 'outlined'}
                  sx={{
                    fontWeight: selected ? 600 : 400,
                    bgcolor: selected ? folioColors.ink : undefined,
                    color: selected ? 'white' : undefined,
                    borderColor: selected ? folioColors.ink : undefined,
                    '&:hover': { bgcolor: selected ? '#3d3224' : undefined },
                  }}
                />
              );
            })}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default LegacyReflectionsTab;
