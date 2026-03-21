'use client';

import React, { useState, useEffect } from 'react';
import {
  TextField, Box, FormControlLabel, Checkbox, Typography,
  Chip, Collapse, Button,
} from '@mui/material';
import LightbulbOutlinedIcon from '@mui/icons-material/LightbulbOutlined';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import FolioModal, {
  folioTextFieldSx, FolioCancelButton, FolioSaveButton, FolioDeleteButton,
  FolioFieldFade, useFolioFieldAnimation,
} from './FolioModal';

export interface VideoData {
  videoTitle: string;
  recordingDate: string;
  description: string;
  cloudLink: string;
  isPrivate: boolean;
  transcript: string;
}

export const emptyVideo = (): VideoData => ({
  videoTitle: '', recordingDate: '', description: '', cloudLink: '', isPrivate: false, transcript: '',
});

// ─── Prompt picker data ────────────────────────────────────────────────────────
interface PromptCategory {
  label: string;
  color: string;
  bgColor: string;
  prompts: string[];
}

const PROMPT_CATEGORIES: PromptCategory[] = [
  {
    label: 'Your life story',
    color: '#0F6E56',
    bgColor: 'rgba(29,158,117,0.08)',
    prompts: [
      'Where I came from and what shaped me',
      'The hardest thing I ever got through',
      'The proudest moments of my life',
      'What I believe — my values and faith',
    ],
  },
  {
    label: 'Messages to family',
    color: '#185FA5',
    bgColor: 'rgba(55,138,221,0.08)',
    prompts: [
      'What I want my grandchildren to know',
      'Advice for my children as they grow older',
      'A message to be opened on a special occasion',
      'What I love most about each of you',
    ],
  },
  {
    label: 'Wishes & intentions',
    color: '#7a2a2a',
    bgColor: 'rgba(226,75,74,0.07)',
    prompts: [
      'My wishes for my funeral or memorial',
      'Why I made the choices I did in my estate plan',
      'Special items and who I want to have them',
      'Family traditions I hope you will carry on',
    ],
  },
  {
    label: 'Family harmony',
    color: '#854F0B',
    bgColor: 'rgba(186,117,23,0.08)',
    prompts: [
      'Explaining a difficult decision I made',
      'Addressing a longtime family misunderstanding',
      'Why I treated certain situations the way I did',
      'My hopes for peace and unity after I am gone',
    ],
  },
  {
    label: 'Demonstrating my wishes',
    color: '#534AB7',
    bgColor: 'rgba(127,119,221,0.08)',
    prompts: [
      "Today's date and why I am recording this",
      'A clear statement of my estate planning decisions',
      'Confirming these are my own wishes — no one is pressuring me',
      'My understanding of who will receive my assets and why',
    ],
  },
  {
    label: 'Wisdom & celebration',
    color: '#5F5E5A',
    bgColor: 'rgba(136,135,128,0.08)',
    prompts: [
      'The best advice I ever received',
      'What I would tell my younger self',
      'Funny stories and memories I do not want forgotten',
      'A message just to say: I love you',
    ],
  },
];

// ─── Prompt Picker sub-component ──────────────────────────────────────────────
interface PromptPickerProps {
  onSelect: (prompt: string) => void;
}

const PromptPicker: React.FC<PromptPickerProps> = ({ onSelect }) => {
  const [open, setOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  return (
    <Box>
      <Button
        size="small"
        startIcon={<LightbulbOutlinedIcon sx={{ fontSize: 16 }} />}
        endIcon={open ? <ExpandLessIcon sx={{ fontSize: 16 }} /> : <ExpandMoreIcon sx={{ fontSize: 16 }} />}
        onClick={() => setOpen((v) => !v)}
        sx={{
          color: '#c9a227',
          fontSize: '0.78rem',
          fontWeight: 500,
          textTransform: 'none',
          px: 1.25,
          py: 0.5,
          border: '1px solid rgba(201,162,39,0.35)',
          borderRadius: 1.5,
          '&:hover': { bgcolor: 'rgba(201,162,39,0.06)', borderColor: '#c9a227' },
        }}
      >
        Need an idea?
      </Button>

      <Collapse in={open}>
        <Box
          sx={{
            mt: 1.5,
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 2,
            overflow: 'hidden',
          }}
        >
          {/* Category tabs */}
          <Box
            sx={{
              display: 'flex',
              overflowX: 'auto',
              borderBottom: '1px solid',
              borderColor: 'divider',
              '&::-webkit-scrollbar': { display: 'none' },
            }}
          >
            {PROMPT_CATEGORIES.map((cat) => (
              <Box
                key={cat.label}
                onClick={() => setActiveCategory(activeCategory === cat.label ? null : cat.label)}
                sx={{
                  px: 1.5,
                  py: 1,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  color: activeCategory === cat.label ? cat.color : 'text.secondary',
                  bgcolor: activeCategory === cat.label ? cat.bgColor : 'transparent',
                  borderBottom: activeCategory === cat.label ? `2px solid ${cat.color}` : '2px solid transparent',
                  transition: 'all 0.15s',
                  userSelect: 'none',
                  '&:hover': { bgcolor: cat.bgColor, color: cat.color },
                }}
              >
                {cat.label}
              </Box>
            ))}
          </Box>

          {/* Prompts for active category */}
          {activeCategory && (() => {
            const cat = PROMPT_CATEGORIES.find((c) => c.label === activeCategory);
            if (!cat) return null;
            return (
              <Box sx={{ px: 2, py: 1.5, bgcolor: cat.bgColor, display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                <Typography variant="caption" sx={{ width: '100%', color: cat.color, fontWeight: 500, mb: 0.5 }}>
                  Click a prompt to use it as your title:
                </Typography>
                {cat.prompts.map((prompt) => (
                  <Chip
                    key={prompt}
                    label={prompt}
                    size="small"
                    onClick={() => {
                      onSelect(prompt);
                      setOpen(false);
                      setActiveCategory(null);
                    }}
                    sx={{
                      cursor: 'pointer',
                      fontSize: '0.75rem',
                      borderColor: cat.color,
                      color: cat.color,
                      border: '1px solid',
                      bgcolor: 'background.paper',
                      '&:hover': { bgcolor: cat.bgColor },
                    }}
                  />
                ))}
              </Box>
            );
          })()}

          {!activeCategory && (
            <Box sx={{ px: 2, py: 1.5 }}>
              <Typography variant="caption" color="text.secondary">
                Select a category above to see prompts.
              </Typography>
            </Box>
          )}
        </Box>
      </Collapse>
    </Box>
  );
};

// ─── Main modal ───────────────────────────────────────────────────────────────
interface Props {
  open: boolean;
  onClose: () => void;
  onSave: (data: VideoData) => void;
  onDelete?: () => void;
  initialData?: VideoData;
  isEdit?: boolean;
}

const LegacyVideoModal: React.FC<Props> = ({
  open, onClose, onSave, onDelete, initialData, isEdit = false,
}) => {
  const [data, setData] = useState<VideoData>(initialData || emptyVideo());
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (open) {
      setData(isEdit && initialData ? initialData : emptyVideo());
      setTouched({});
    }
  }, [open, isEdit, initialData]);

  const handleChange = (updates: Partial<VideoData>) =>
    setData((prev) => ({ ...prev, ...updates }));

  const nameError = touched.videoTitle && !data.videoTitle.trim();
  const canSave = data.videoTitle.trim().length > 0;

  const handleSave = () => {
    if (!canSave) { setTouched({ videoTitle: true }); return; }
    onSave(data);
    onClose();
  };

  const fieldsVisible = useFolioFieldAnimation(open);
  let idx = 0;

  return (
    <FolioModal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Edit Video' : 'Add Video'}
      eyebrow="My Life Folio — Video Legacy"
      maxWidth="sm"
      footer={
        <>
          <Box>
            {isEdit && onDelete && <FolioDeleteButton onClick={onDelete} />}
          </Box>
          <Box sx={{ display: 'flex', gap: 1.5 }}>
            <FolioCancelButton onClick={onClose} />
            <FolioSaveButton onClick={handleSave} disabled={!canSave}>
              {isEdit ? 'Save Changes' : 'Add Video'}
            </FolioSaveButton>
          </Box>
        </>
      }
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>

        {/* Prompt picker — only shown when adding a new video */}
        {!isEdit && (
          <FolioFieldFade visible={fieldsVisible} index={idx++}>
            <PromptPicker onSelect={(prompt) => handleChange({ videoTitle: prompt })} />
          </FolioFieldFade>
        )}

        <FolioFieldFade visible={fieldsVisible} index={idx++}>
          <TextField
            label="Video Title"
            value={data.videoTitle}
            onChange={(e) => handleChange({ videoTitle: e.target.value })}
            onBlur={() => setTouched((p) => ({ ...p, videoTitle: true }))}
            error={!!nameError}
            helperText={
              nameError
                ? 'Title is required'
                : 'e.g. "My life story", "A message to my grandchildren", "Why I made these choices"'
            }
            required
            InputLabelProps={{ shrink: true }}
            fullWidth
            sx={{ ...folioTextFieldSx }}
          />
        </FolioFieldFade>

        <FolioFieldFade visible={fieldsVisible} index={idx++}>
          <TextField
            label="Recording Date"
            value={data.recordingDate}
            onChange={(e) => handleChange({ recordingDate: e.target.value })}
            InputLabelProps={{ shrink: true }}
            type="date"
            helperText="Recording the date helps establish when this video was made"
            sx={{ ...folioTextFieldSx }}
          />
        </FolioFieldFade>

        <FolioFieldFade visible={fieldsVisible} index={idx++}>
          <TextField
            label="Description"
            value={data.description}
            onChange={(e) => handleChange({ description: e.target.value })}
            InputLabelProps={{ shrink: true }}
            multiline
            minRows={2}
            fullWidth
            placeholder="What does this video cover? Who is it for? Any context your family should know before watching."
            helperText="This note appears alongside the video in the Family Access Portal"
            sx={{ ...folioTextFieldSx }}
          />
        </FolioFieldFade>

        <FolioFieldFade visible={fieldsVisible} index={idx++}>
          <TextField
            label="Video Link"
            value={data.cloudLink}
            onChange={(e) => handleChange({ cloudLink: e.target.value })}
            InputLabelProps={{ shrink: true }}
            fullWidth
            placeholder="YouTube (unlisted), Vimeo, or Google Drive link"
            helperText="Tip: Set your YouTube or Vimeo video to 'Unlisted' so only people with the link can view it"
            sx={{ ...folioTextFieldSx }}
          />
        </FolioFieldFade>

        <FolioFieldFade visible={fieldsVisible} index={idx++}>
          <TextField
            label="Transcript"
            value={data.transcript}
            onChange={(e) => handleChange({ transcript: e.target.value })}
            InputLabelProps={{ shrink: true }}
            multiline
            minRows={3}
            fullWidth
            placeholder="Optional — paste or type a text transcript of what you said in the video. This helps preserve your words even if the video link ever changes."
            sx={{ ...folioTextFieldSx }}
          />
        </FolioFieldFade>

        <FolioFieldFade visible={fieldsVisible} index={idx++}>
          <FormControlLabel
            control={
              <Checkbox
                checked={data.isPrivate}
                onChange={(e) => handleChange({ isPrivate: e.target.checked })}
              />
            }
            label={
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  Private — only I can see this video
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Private videos are not visible to family members in the Family Access Portal
                </Typography>
              </Box>
            }
          />
        </FolioFieldFade>

      </Box>
    </FolioModal>
  );
};

export default LegacyVideoModal;