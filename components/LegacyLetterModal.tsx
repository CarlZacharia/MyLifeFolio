'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  TextField, Box, MenuItem, FormControlLabel, Checkbox, Typography,
  Button, IconButton, LinearProgress, Alert,
} from '@mui/material';
import MicIcon from '@mui/icons-material/Mic';
import StopIcon from '@mui/icons-material/Stop';
import DeleteIcon from '@mui/icons-material/Delete';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import FolioModal, {
  folioTextFieldSx, FolioCancelButton, FolioSaveButton, FolioDeleteButton,
  FolioFieldFade, useFolioFieldAnimation,
} from './FolioModal';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/AuthContext';

const RECIPIENT_TYPES = [
  'Spouse/Partner', 'Child', 'Grandchild', 'Sibling', 'Friend', 'Future Descendants', 'Other',
] as const;

const FORMATS = ['Written', 'Audio Recording'] as const;

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
  const { user } = useAuth();
  const [data, setData] = useState<LetterData>(initialData || emptyLetter());
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Audio recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (open) {
      setData(isEdit && initialData ? initialData : emptyLetter());
      setTouched({});
      setAudioBlob(null);
      setAudioUrl(initialData?.mediaUrl || null);
      setIsRecording(false);
      setRecordingTime(0);
      setUploadError(null);
    } else {
      // Cleanup on close
      stopRecording();
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
      }
    }
  }, [open, isEdit, initialData]);

  // Cleanup audio URL on unmount
  useEffect(() => {
    return () => {
      if (audioUrl && audioUrl.startsWith('blob:')) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  const handleChange = (updates: Partial<LetterData>) => setData((prev) => ({ ...prev, ...updates }));
  const handleBlur = (field: string) => setTouched((prev) => ({ ...prev, [field]: true }));

  const canSave =
    data.recipientType.trim().length > 0 &&
    data.recipientName.trim().length > 0 &&
    !uploading;

  const startRecording = async () => {
    try {
      setUploadError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        stream.getTracks().forEach((t) => t.stop());
      };

      mediaRecorder.start(1000);
      setIsRecording(true);
      setRecordingTime(0);
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch {
      setUploadError('Microphone access denied. Please allow microphone access in your browser settings.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsRecording(false);
  };

  const deleteRecording = () => {
    if (audioUrl && audioUrl.startsWith('blob:')) {
      URL.revokeObjectURL(audioUrl);
    }
    setAudioBlob(null);
    setAudioUrl(null);
    handleChange({ mediaUrl: '' });
  };

  const togglePlayback = () => {
    if (!audioPlayerRef.current || !audioUrl) return;
    if (isPlaying) {
      audioPlayerRef.current.pause();
      setIsPlaying(false);
    } else {
      audioPlayerRef.current.src = audioUrl;
      audioPlayerRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  const uploadAudioToSupabase = async (blob: Blob): Promise<string | null> => {
    if (!user) return null;
    const timestamp = Date.now();
    const safeName = data.recipientName.replace(/[^a-zA-Z0-9]/g, '-') || 'letter';
    const path = `${user.id}/legacy/letters/${safeName}-${timestamp}.webm`;

    const { error } = await supabase.storage
      .from('estate-planning-intakes')
      .upload(path, blob, { contentType: 'audio/webm', upsert: false });

    if (error) {
      console.error('Upload error:', error);
      return null;
    }

    const { data: urlData } = supabase.storage
      .from('estate-planning-intakes')
      .getPublicUrl(path);

    return urlData?.publicUrl || path;
  };

  const handleSave = async () => {
    let finalData = { ...data };

    // If there's a new audio recording, upload it
    if (audioBlob && data.format === 'Audio Recording') {
      setUploading(true);
      setUploadError(null);
      const url = await uploadAudioToSupabase(audioBlob);
      if (url) {
        finalData = { ...finalData, mediaUrl: url };
      } else {
        setUploadError('Failed to upload audio. Please try again.');
        setUploading(false);
        return;
      }
      setUploading(false);
    }

    onSave(finalData);
    onClose();
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
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
            {uploading ? 'Uploading...' : isEdit ? 'Save Changes' : 'Save Letter'}
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

        {/* Letter Body */}
        <FolioFieldFade visible={fieldsVisible} index={idx++}>
          <TextField label="Your Letter" value={data.letterBody}
            onChange={(e) => handleChange({ letterBody: e.target.value })}
            InputLabelProps={{ shrink: true }}
            multiline minRows={12} fullWidth
            placeholder="Dear..."
            sx={{ ...folioTextFieldSx }} />
        </FolioFieldFade>

        {/* Format */}
        <FolioFieldFade visible={fieldsVisible} index={idx++}>
          <TextField select label="Format" value={data.format}
            onChange={(e) => handleChange({ format: e.target.value })}
            InputLabelProps={{ shrink: true }} fullWidth sx={{ ...folioTextFieldSx }}>
            {FORMATS.map((f) => <MenuItem key={f} value={f}>{f}</MenuItem>)}
          </TextField>
        </FolioFieldFade>

        {/* Audio Recording Controls */}
        {data.format === 'Audio Recording' && (
          <FolioFieldFade visible={fieldsVisible} index={idx++}>
            <Box sx={{
              p: 2, borderRadius: '8px', border: '1px solid #e0e0e0', bgcolor: '#fafafa',
              display: 'flex', flexDirection: 'column', gap: 1.5,
            }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#333' }}>
                Audio Recording
              </Typography>

              {uploadError && (
                <Alert severity="error" sx={{ py: 0.5 }}>{uploadError}</Alert>
              )}

              {/* Recording controls */}
              {!audioUrl && !isRecording && (
                <Button
                  variant="outlined"
                  startIcon={<MicIcon />}
                  onClick={startRecording}
                  sx={{ alignSelf: 'flex-start', borderColor: '#d32f2f', color: '#d32f2f',
                    '&:hover': { borderColor: '#b71c1c', bgcolor: 'rgba(211,47,47,0.04)' } }}
                >
                  Start Recording
                </Button>
              )}

              {isRecording && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{
                    width: 12, height: 12, borderRadius: '50%', bgcolor: '#d32f2f',
                    animation: 'pulse 1.5s infinite',
                    '@keyframes pulse': { '0%, 100%': { opacity: 1 }, '50%': { opacity: 0.3 } },
                  }} />
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#d32f2f', fontFamily: 'monospace' }}>
                    Recording {formatTime(recordingTime)}
                  </Typography>
                  <IconButton onClick={stopRecording} sx={{ color: '#d32f2f' }}>
                    <StopIcon />
                  </IconButton>
                </Box>
              )}

              {/* Playback controls */}
              {audioUrl && !isRecording && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <IconButton onClick={togglePlayback} size="small" sx={{ color: '#1e3a5f' }}>
                    {isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
                  </IconButton>
                  <audio
                    ref={audioPlayerRef}
                    onEnded={() => setIsPlaying(false)}
                    style={{ display: 'none' }}
                  />
                  <Typography variant="body2" sx={{ flex: 1, color: '#555' }}>
                    {audioBlob ? 'New recording ready' : 'Saved recording'}
                  </Typography>
                  <IconButton onClick={deleteRecording} size="small" sx={{ color: '#999' }}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              )}

              {uploading && (
                <Box sx={{ mt: 1 }}>
                  <Typography variant="caption" color="text.secondary">Uploading audio...</Typography>
                  <LinearProgress sx={{ mt: 0.5 }} />
                </Box>
              )}
            </Box>
          </FolioFieldFade>
        )}

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
