'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  TextField, Box, MenuItem, FormControlLabel, Checkbox, Typography,
  Button,
} from '@mui/material';
import MicIcon from '@mui/icons-material/Mic';
import StopIcon from '@mui/icons-material/Stop';
import FolioModal, {
  folioTextFieldSx, FolioCancelButton, FolioSaveButton, FolioDeleteButton,
  FolioFieldFade, useFolioFieldAnimation,
} from './FolioModal';

// Browser Speech Recognition types
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionInstance extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: Event & { error: string }) => void) | null;
  onend: (() => void) | null;
}

declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRecognitionInstance;
    webkitSpeechRecognition?: new () => SpeechRecognitionInstance;
  }
}

const getSpeechRecognition = (): (new () => SpeechRecognitionInstance) | null => {
  if (typeof window === 'undefined') return null;
  return window.SpeechRecognition || window.webkitSpeechRecognition || null;
};

const RECIPIENT_TYPES = [
  'Spouse/Partner', 'Child', 'Grandchild', 'Sibling', 'Friend', 'Future Descendants', 'Other',
] as const;

const PROMPTS = [
  'What I want you to know about our family',
  'What I am most proud of',
  'Lessons I learned in life',
  'My hopes for your future',
  'Advice I wish someone had given me',
];

export interface LetterData {
  recipientType: string;
  recipientName: string;
  subject: string;
  letterBody: string;
  format: string;
  mediaUrl: string;
  isPrivate: boolean;
}

export const emptyLetter = (): LetterData => ({
  recipientType: '', recipientName: '', subject: '', letterBody: '', format: 'Written', mediaUrl: '', isPrivate: false,
});

interface Props {
  open: boolean; onClose: () => void; onSave: (data: LetterData) => void;
  onDelete?: () => void; initialData?: LetterData; isEdit?: boolean;
}

const LegacyLetterModal: React.FC<Props> = ({ open, onClose, onSave, onDelete, initialData, isEdit = false }) => {
  const [data, setData] = useState<LetterData>(initialData || emptyLetter());
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Dictate-to-text state
  const [liveTranscript, setLiveTranscript] = useState('');
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [speechSupported] = useState(() => !!getSpeechRecognition());
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);

  useEffect(() => {
    if (open) {
      setData(isEdit && initialData ? initialData : emptyLetter());
      setTouched({});
      setLiveTranscript('');
      setIsTranscribing(false);
    } else {
      stopDictation();
    }
  }, [open, isEdit, initialData]);

  const handleChange = (updates: Partial<LetterData>) => setData((prev) => ({ ...prev, ...updates }));
  const handleBlur = (field: string) => setTouched((prev) => ({ ...prev, [field]: true }));

  const canSave =
    data.recipientType.trim().length > 0 &&
    data.recipientName.trim().length > 0;

  // ── Dictate-to-Text (Speech Recognition) ──
  const startDictation = () => {
    const SpeechRec = getSpeechRecognition();
    if (!SpeechRec) return;

    const recognition = new SpeechRec();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interim = '';
      let finalText = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalText += transcript;
        } else {
          interim += transcript;
        }
      }

      if (finalText) {
        setData((prev) => ({
          ...prev,
          letterBody: prev.letterBody
            ? prev.letterBody + finalText
            : finalText,
        }));
      }

      setLiveTranscript(interim);
    };

    recognition.onerror = () => {};

    recognition.onend = () => {
      // Auto-restart if still dictating (browser cuts off after silence)
      if (recognitionRef.current) {
        try { recognition.start(); } catch { /* already started */ }
      } else {
        setIsTranscribing(false);
        setLiveTranscript('');
      }
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsTranscribing(true);
  };

  const stopDictation = () => {
    if (recognitionRef.current) {
      recognitionRef.current.onend = null;
      recognitionRef.current.abort();
      recognitionRef.current = null;
    }
    setIsTranscribing(false);
    setLiveTranscript('');
  };

  const handleSave = () => {
    stopDictation();
    onSave(data);
    onClose();
  };

  const fieldsVisible = useFolioFieldAnimation(open);
  let idx = 0;

  return (
    <FolioModal open={open} onClose={onClose}
      title={isEdit ? 'Edit Letter' : 'Write a Letter'}
      eyebrow="My Life Folio — Letters to Family" maxWidth="md"
      footer={<><Box>{isEdit && onDelete && <FolioDeleteButton onClick={onDelete} />}</Box>
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <FolioCancelButton onClick={onClose} />
          <FolioSaveButton onClick={handleSave} disabled={!canSave}>
            {isEdit ? 'Save Changes' : 'Save Letter'}
          </FolioSaveButton></Box></>}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>

        {/* Recipient Type & Name (both required) */}
        <FolioFieldFade visible={fieldsVisible} index={idx++}>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField select label="Recipient Type" value={data.recipientType}
              onChange={(e) => handleChange({ recipientType: e.target.value })}
              onBlur={() => handleBlur('recipientType')}
              error={touched.recipientType && !data.recipientType}
              helperText={touched.recipientType && !data.recipientType ? 'Required' : ''}
              required
              InputLabelProps={{ shrink: true }} sx={{ flex: 1, ...folioTextFieldSx }}>
              <MenuItem value=""><em>Select type</em></MenuItem>
              {RECIPIENT_TYPES.map((t) => <MenuItem key={t} value={t}>{t}</MenuItem>)}
            </TextField>
            <TextField label="Recipient Name" value={data.recipientName}
              onChange={(e) => handleChange({ recipientName: e.target.value })}
              onBlur={() => handleBlur('recipientName')}
              error={touched.recipientName && !data.recipientName.trim()}
              helperText={touched.recipientName && !data.recipientName.trim() ? 'Required' : ''}
              required
              InputLabelProps={{ shrink: true }} placeholder="Who is this letter for?"
              sx={{ flex: 1, ...folioTextFieldSx }} />
          </Box>
        </FolioFieldFade>

        {/* Subject */}
        <FolioFieldFade visible={fieldsVisible} index={idx++}>
          <TextField label="Subject" value={data.subject}
            onChange={(e) => handleChange({ subject: e.target.value })}
            InputLabelProps={{ shrink: true }} placeholder="Topic or title for this letter"
            fullWidth
            sx={{ ...folioTextFieldSx }} />
        </FolioFieldFade>

        {/* Prompts */}
        <FolioFieldFade visible={fieldsVisible} index={idx++}>
          <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', mb: 0.5 }}>
            Some ideas to get you started:
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem' }}>
            {PROMPTS.map((p, i) => <span key={i}>{i > 0 ? ' · ' : ''}<em>{p}</em></span>)}
          </Typography>
        </FolioFieldFade>

        {/* Dictate to Text */}
        <FolioFieldFade visible={fieldsVisible} index={idx++}>
          {speechSupported && !isTranscribing && (
            <Button
              size="small"
              startIcon={<MicIcon />}
              onClick={startDictation}
              sx={{ alignSelf: 'flex-start', textTransform: 'none', color: '#1565c0',
                '&:hover': { bgcolor: 'rgba(21,101,192,0.04)' } }}
            >
              Dictate to Text — speak and it will type into your letter
            </Button>
          )}
          {speechSupported && isTranscribing && (
            <Box sx={{ p: 1.5, bgcolor: '#e3f2fd', borderRadius: '6px', border: '1px solid #bbdefb' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box sx={{
                  width: 10, height: 10, borderRadius: '50%', bgcolor: '#d32f2f',
                  animation: 'pulse 1.5s infinite',
                  '@keyframes pulse': { '0%, 100%': { opacity: 1 }, '50%': { opacity: 0.3 } },
                }} />
                <Typography variant="body2" sx={{ color: '#1565c0', fontWeight: 600, flex: 1 }}>
                  Listening — speak now...
                </Typography>
                <Button
                  size="small"
                  startIcon={<StopIcon sx={{ fontSize: 16 }} />}
                  onClick={stopDictation}
                  sx={{ textTransform: 'none', color: '#d32f2f', minWidth: 'auto', fontSize: '0.8rem' }}
                >
                  Stop
                </Button>
              </Box>
              {liveTranscript && (
                <Typography variant="body2" sx={{ color: '#1565c0', fontStyle: 'italic', mt: 0.75, fontSize: '0.82rem' }}>
                  {liveTranscript}...
                </Typography>
              )}
            </Box>
          )}
        </FolioFieldFade>

        {/* Letter Body */}
        <FolioFieldFade visible={fieldsVisible} index={idx++}>
          <TextField label="Your Letter" value={data.letterBody}
            onChange={(e) => handleChange({ letterBody: e.target.value })}
            InputLabelProps={{ shrink: true }}
            multiline minRows={12} fullWidth
            placeholder="Dear..."
            sx={{ ...folioTextFieldSx }} />
        </FolioFieldFade>

        {/* Privacy */}
        <FolioFieldFade visible={fieldsVisible} index={idx++}>
          <FormControlLabel
            control={<Checkbox checked={data.isPrivate} onChange={(e) => handleChange({ isPrivate: e.target.checked })} />}
            label="Private — only I can see this letter"
          />
        </FolioFieldFade>
      </Box>
    </FolioModal>
  );
};

export default LegacyLetterModal;
