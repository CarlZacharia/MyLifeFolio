'use client';

import React, { useState } from 'react';
import {
  Box, TextField, Typography, Accordion, AccordionSummary, AccordionDetails,
  Button, Snackbar, IconButton,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import HistoryEduIcon from '@mui/icons-material/HistoryEdu';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import { useFormContext } from '../lib/FormContext';
import { folioColors } from './FolioModal';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import PersonalHistoryHelpModal from './PersonalHistoryHelpModal';

const sections = [
  {
    title: 'Early Life',
    fields: [
      { key: 'birthplace', prompt: 'Where did you grow up?' },
      { key: 'childhoodMemories', prompt: 'What do you remember most about your childhood?' },
      { key: 'parentsBackground', prompt: 'Tell us about your parents and where they came from.' },
    ],
  },
  {
    title: 'Education',
    fields: [
      { key: 'schoolsAttended', prompt: 'Where did you go to school?' },
      { key: 'educationMemories', prompt: 'Who were the teachers or mentors who shaped you?' },
    ],
  },
  {
    title: 'Career',
    fields: [
      { key: 'firstJob', prompt: 'What was your first job?' },
      { key: 'careerMilestones', prompt: 'What were the most important moments in your career?' },
      { key: 'proudestProfessional', prompt: 'What are you most proud of professionally?' },
    ],
  },
  {
    title: 'Family',
    fields: [
      { key: 'howWeMet', prompt: 'How did you meet your spouse or partner?' },
      { key: 'weddingStory', prompt: 'Tell us about your wedding.' },
      { key: 'raisingChildren', prompt: 'What do you most want your children to know about raising them?' },
    ],
  },
  {
    title: 'Turning Points',
    fields: [
      { key: 'importantDecisions', prompt: 'What were the most important decisions of your life?' },
      { key: 'biggestChallenges', prompt: 'What was the hardest thing you ever went through?' },
      { key: 'risksTaken', prompt: 'What risks did you take that you\'re glad you took?' },
    ],
  },
];

const tfSx = {
  '& .MuiOutlinedInput-root': {
    '&:hover fieldset': { borderColor: folioColors.accentWarm },
    '&.Mui-focused fieldset': { borderColor: folioColors.accent },
  },
  '& .MuiInputLabel-root.Mui-focused': { color: folioColors.accent },
};

const LegacyPersonalHistoryTab = () => {
  const { formData, updateFormData } = useFormContext();
  const hist = formData.legacyPersonalHistory;
  const [snackOpen, setSnackOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);

  const handleChange = (field: string, value: string) => {
    updateFormData({ legacyPersonalHistory: { ...hist, [field]: value } });
  };

  const filledCount = Object.values(hist).filter((v) => typeof v === 'string' && v.trim()).length;
  const totalCount = 14;

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
        <HistoryEduIcon sx={{ color: '#c9a227', fontSize: 28 }} />
        <Typography variant="h6" sx={{ fontWeight: 600 }}>Personal History</Typography>
        <IconButton onClick={() => setHelpOpen(true)} size="small" sx={{ ml: 0.5, bgcolor: '#1a1a1a', color: '#c9a227', width: 28, height: 28, '&:hover': { bgcolor: '#333' } }} title="Audio guide">
          <VolumeUpIcon sx={{ fontSize: 20 }} />
        </IconButton>
      </Box>
      <PersonalHistoryHelpModal open={helpOpen} onClose={() => setHelpOpen(false)} />
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 550 }}>
          Your life story, in your own words. Take your time — you can always come back and add more.
        </Typography>
        {filledCount > 0 && (
          <Typography variant="caption" sx={{ color: folioColors.inkLight, fontWeight: 600 }}>
            {filledCount} of {totalCount} prompts answered
          </Typography>
        )}
      </Box>

      {sections.map((section) => (
        <Accordion
          key={section.title}
          defaultExpanded={section.title === 'Early Life'}
          sx={{
            mb: 1,
            '&:before': { display: 'none' },
            boxShadow: 'none',
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: '8px !important',
            '&.Mui-expanded': { mb: 1 },
          }}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography sx={{ fontWeight: 600 }}>{section.title}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {section.fields.map((f) => (
                <Box key={f.key}>
                  <Typography variant="body1" sx={{ fontStyle: 'italic', color: folioColors.ink, mb: 1, fontWeight: 500 }}>
                    "{f.prompt}"
                  </Typography>
                  <TextField
                    value={(hist as Record<string, string>)[f.key] || ''}
                    onChange={(e) => handleChange(f.key, e.target.value)}
                    multiline
                    minRows={4}
                    fullWidth
                    placeholder="Share your story..."
                    sx={tfSx}
                  />
                </Box>
              ))}
            </Box>
          </AccordionDetails>
        </Accordion>
      ))}

      <Box sx={{ mt: 3 }}>
        <Button
          variant="outlined"
          startIcon={<AutoFixHighIcon />}
          onClick={() => {
            console.log('memoir generation coming soon');
            setSnackOpen(true);
          }}
          sx={{
            borderColor: '#c9a227',
            color: '#c9a227',
            '&:hover': { borderColor: '#9a7b1a', bgcolor: 'rgba(201, 162, 39, 0.04)' },
          }}
        >
          Generate My Story
        </Button>
        <Snackbar
          open={snackOpen}
          autoHideDuration={3000}
          onClose={() => setSnackOpen(false)}
          message="This feature is coming soon."
        />
      </Box>
    </Box>
  );
};

export default LegacyPersonalHistoryTab;
