'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Box, Button, Typography, IconButton, LinearProgress, Alert,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import StopIcon from '@mui/icons-material/Stop';
import ReplayIcon from '@mui/icons-material/Replay';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { folioColors } from './FolioModal';
import { uploadRecordedVideo } from '../lib/videoStorage';

interface Props {
  open: boolean;
  onClose: () => void;
  onRecordingComplete: (url: string) => void;
  videoTitle: string;
}

type RecorderState = 'idle' | 'previewing' | 'recording' | 'recorded' | 'uploading';

const VideoRecorderModal: React.FC<Props> = ({ open, onClose, onRecordingComplete, videoTitle }) => {
  const [state, setState] = useState<RecorderState>('idle');
  const [error, setError] = useState('');
  const [elapsed, setElapsed] = useState(0);
  const [uploadProgress, setUploadProgress] = useState(0);

  const videoPreviewRef = useRef<HTMLVideoElement>(null);
  const videoPlaybackRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const blobRef = useRef<Blob | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const cleanup = useCallback(() => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    if (recorderRef.current && recorderRef.current.state !== 'inactive') {
      recorderRef.current.stop();
    }
    recorderRef.current = null;
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    chunksRef.current = [];
    if (videoPreviewRef.current) videoPreviewRef.current.srcObject = null;
    if (videoPlaybackRef.current) videoPlaybackRef.current.src = '';
  }, []);

  useEffect(() => {
    if (!open) {
      cleanup();
      setState('idle');
      setError('');
      setElapsed(0);
      setUploadProgress(0);
      blobRef.current = null;
    }
  }, [open, cleanup]);

  const startCamera = async () => {
    setError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: true,
      });
      streamRef.current = stream;
      if (videoPreviewRef.current) {
        videoPreviewRef.current.srcObject = stream;
      }
      setState('previewing');
    } catch (err) {
      console.error('Camera access error:', err);
      if (err instanceof DOMException && err.name === 'NotAllowedError') {
        setError('Camera access was denied. Please allow camera and microphone access in your browser settings.');
      } else if (err instanceof DOMException && err.name === 'NotFoundError') {
        setError('No camera found. Please connect a webcam and try again.');
      } else {
        setError('Could not access camera. Please check your device settings.');
      }
    }
  };

  const startRecording = () => {
    if (!streamRef.current) return;
    chunksRef.current = [];
    setElapsed(0);

    const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus')
      ? 'video/webm;codecs=vp9,opus'
      : MediaRecorder.isTypeSupported('video/webm;codecs=vp8,opus')
        ? 'video/webm;codecs=vp8,opus'
        : 'video/webm';

    const recorder = new MediaRecorder(streamRef.current, { mimeType });
    recorderRef.current = recorder;

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };

    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: 'video/webm' });
      blobRef.current = blob;
      const url = URL.createObjectURL(blob);
      if (videoPlaybackRef.current) {
        videoPlaybackRef.current.src = url;
      }
      setState('recorded');
    };

    recorder.start(1000);
    setState('recording');

    timerRef.current = setInterval(() => {
      setElapsed((prev) => prev + 1);
    }, 1000);
  };

  const stopRecording = () => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    if (recorderRef.current && recorderRef.current.state === 'recording') {
      recorderRef.current.stop();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoPreviewRef.current) videoPreviewRef.current.srcObject = null;
  };

  const retake = () => {
    blobRef.current = null;
    if (videoPlaybackRef.current) videoPlaybackRef.current.src = '';
    setElapsed(0);
    startCamera();
  };

  const handleUpload = async () => {
    if (!blobRef.current) return;
    setState('uploading');
    setUploadProgress(30);

    const result = await uploadRecordedVideo(blobRef.current, videoTitle || 'untitled');
    setUploadProgress(100);

    if (result.success && result.url) {
      onRecordingComplete(result.url);
      onClose();
    } else {
      setError(result.error || 'Upload failed. Please try again.');
      setState('recorded');
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <Dialog open={open} onClose={state === 'uploading' ? undefined : onClose}
      maxWidth="md" fullWidth
      PaperProps={{ sx: { borderRadius: 3, bgcolor: '#1a1a1a', color: 'white' } }}>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          {state === 'idle' ? 'Record a Video Message' :
            state === 'previewing' ? 'Camera Preview' :
              state === 'recording' ? 'Recording...' :
                state === 'recorded' ? 'Review Your Recording' :
                  'Uploading...'}
        </Typography>
        {state !== 'uploading' && (
          <IconButton onClick={onClose} sx={{ color: 'white' }}>
            <CloseIcon />
          </IconButton>
        )}
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        {error && (
          <Alert severity="error" sx={{ mx: 3, mt: 1 }}>{error}</Alert>
        )}

        {state === 'idle' && (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="body1" sx={{ mb: 3, color: 'rgba(255,255,255,0.7)' }}>
              Record a video message using your camera. You can review it before saving.
            </Typography>
            <Button variant="contained" size="large" onClick={startCamera}
              sx={{ bgcolor: folioColors.accent, '&:hover': { bgcolor: '#b8922a' }, px: 4 }}>
              Open Camera
            </Button>
          </Box>
        )}

        {(state === 'previewing' || state === 'recording') && (
          <Box sx={{ position: 'relative' }}>
            <video ref={videoPreviewRef} autoPlay muted playsInline
              style={{ width: '100%', maxHeight: 480, objectFit: 'cover', display: 'block', background: '#000' }} />
            {state === 'recording' && (
              <Box sx={{ position: 'absolute', top: 16, right: 16, display: 'flex', alignItems: 'center', gap: 1,
                bgcolor: 'rgba(0,0,0,0.6)', borderRadius: 2, px: 1.5, py: 0.5 }}>
                <FiberManualRecordIcon sx={{ color: '#f44336', fontSize: 16, animation: 'pulse 1.5s infinite' }} />
                <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 700 }}>
                  {formatTime(elapsed)}
                </Typography>
              </Box>
            )}
          </Box>
        )}

        {state === 'recorded' && (
          <Box>
            <video ref={videoPlaybackRef} controls playsInline
              style={{ width: '100%', maxHeight: 480, objectFit: 'cover', display: 'block', background: '#000' }} />
          </Box>
        )}

        {state === 'uploading' && (
          <Box sx={{ p: 4 }}>
            <Typography variant="body1" sx={{ mb: 2, textAlign: 'center', color: 'rgba(255,255,255,0.7)' }}>
              Saving your video...
            </Typography>
            <LinearProgress variant="determinate" value={uploadProgress}
              sx={{ height: 8, borderRadius: 4, '& .MuiLinearProgress-bar': { bgcolor: folioColors.accent } }} />
          </Box>
        )}

        <style>{`
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.3; }
          }
        `}</style>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, justifyContent: 'center', gap: 2 }}>
        {state === 'previewing' && (
          <Button variant="contained" startIcon={<FiberManualRecordIcon />} onClick={startRecording}
            sx={{ bgcolor: '#d32f2f', '&:hover': { bgcolor: '#b71c1c' }, px: 3 }}>
            Start Recording
          </Button>
        )}
        {state === 'recording' && (
          <Button variant="contained" startIcon={<StopIcon />} onClick={stopRecording}
            sx={{ bgcolor: '#d32f2f', '&:hover': { bgcolor: '#b71c1c' }, px: 3 }}>
            Stop Recording
          </Button>
        )}
        {state === 'recorded' && (
          <>
            <Button variant="outlined" startIcon={<ReplayIcon />} onClick={retake}
              sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.3)', '&:hover': { borderColor: 'white' } }}>
              Re-record
            </Button>
            <Button variant="contained" startIcon={<CloudUploadIcon />} onClick={handleUpload}
              sx={{ bgcolor: folioColors.accent, '&:hover': { bgcolor: '#b8922a' }, px: 3 }}>
              Save Video
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default VideoRecorderModal;
