'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Box, Button, Typography, IconButton, LinearProgress, Alert,
  Select, MenuItem, FormControl, InputLabel,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import StopIcon from '@mui/icons-material/Stop';
import ReplayIcon from '@mui/icons-material/Replay';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CameraswitchIcon from '@mui/icons-material/Cameraswitch';
import { folioColors } from './FolioModal';
import { uploadRecordedVideo } from '../lib/videoStorage';

const MAX_RECORDING_SECONDS = 300; // 5 minutes
const WARNING_SECONDS = 30; // warn when 30 seconds remain

interface Props {
  open: boolean;
  onClose: () => void;
  onRecordingComplete: (url: string) => void;
  videoTitle: string;
}

type RecorderState = 'idle' | 'previewing' | 'recording' | 'recorded' | 'uploading';

interface VideoDevice {
  deviceId: string;
  label: string;
}

const VideoRecorderModal: React.FC<Props> = ({ open, onClose, onRecordingComplete, videoTitle }) => {
  const [state, setState] = useState<RecorderState>('idle');
  const [error, setError] = useState('');
  const [elapsed, setElapsed] = useState(0);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [videoDevices, setVideoDevices] = useState<VideoDevice[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState('');

  const videoPreviewRef = useRef<HTMLVideoElement>(null);
  const videoPlaybackRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const blobRef = useRef<Blob | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const recordingStartTimeRef = useRef<string>('');

  const cleanup = useCallback(() => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    if (animFrameRef.current) { cancelAnimationFrame(animFrameRef.current); animFrameRef.current = null; }
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

  // Enumerate cameras when dialog opens
  useEffect(() => {
    if (!open) {
      cleanup();
      setState('idle');
      setError('');
      setElapsed(0);
      setUploadProgress(0);
      blobRef.current = null;
      return;
    }

    // Request a throwaway stream to trigger the permission prompt,
    // then enumerate the real device labels.
    const enumerateCameras = async () => {
      try {
        // A brief getUserMedia call unlocks device labels in most browsers
        const tempStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        tempStream.getTracks().forEach((t) => t.stop());
      } catch {
        // If denied, we'll still try to enumerate (labels may be empty)
      }

      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const cameras = devices
          .filter((d) => d.kind === 'videoinput')
          .map((d, i) => ({
            deviceId: d.deviceId,
            label: d.label || `Camera ${i + 1}`,
          }));
        setVideoDevices(cameras);

        // Auto-select: prefer a non-virtual camera if possible
        if (cameras.length > 0 && !selectedDeviceId) {
          const virtual = /virtual|prezi|obs|snap|manycam|xsplit|mmhmm/i;
          const real = cameras.find((c) => !virtual.test(c.label));
          setSelectedDeviceId(real ? real.deviceId : cameras[0].deviceId);
        }
      } catch (err) {
        console.error('Device enumeration error:', err);
      }
    };

    enumerateCameras();
  }, [open, cleanup, selectedDeviceId]);

  // Auto-stop recording at max duration
  useEffect(() => {
    if (state === 'recording' && elapsed >= MAX_RECORDING_SECONDS) {
      stopRecording();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [elapsed, state]);

  const drawTimestampOverlay = useCallback(() => {
    const video = videoPreviewRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.readyState < 2) {
      animFrameRef.current = requestAnimationFrame(drawTimestampOverlay);
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;

    // Draw the video frame
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Draw date/time stamp in bottom-right corner
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-US', {
      month: '2-digit', day: '2-digit', year: 'numeric',
    });
    const timeStr = now.toLocaleTimeString('en-US', {
      hour: '2-digit', minute: '2-digit', second: '2-digit',
    });
    const stamp = `${dateStr}  ${timeStr}`;

    const fontSize = Math.max(16, Math.round(canvas.height * 0.028));
    ctx.font = `${fontSize}px monospace`;
    ctx.textBaseline = 'bottom';
    ctx.textAlign = 'right';

    const padding = 12;
    const textMetrics = ctx.measureText(stamp);
    const textX = canvas.width - padding;
    const textY = canvas.height - padding;

    // Semi-transparent background for readability
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(
      textX - textMetrics.width - 8,
      textY - fontSize - 4,
      textMetrics.width + 16,
      fontSize + 10,
    );

    // White text
    ctx.fillStyle = '#ffffff';
    ctx.fillText(stamp, textX, textY);

    animFrameRef.current = requestAnimationFrame(drawTimestampOverlay);
  }, []);

  // Attach the stream to the video element once it renders (state → previewing)
  useEffect(() => {
    if (state === 'previewing' && streamRef.current && videoPreviewRef.current) {
      videoPreviewRef.current.srcObject = streamRef.current;
      videoPreviewRef.current.play().catch(() => { /* autoplay may be blocked */ });
    }
  }, [state]);

  const startCamera = async (deviceId?: string) => {
    setError('');

    // Stop any existing stream first
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }

    const useDeviceId = deviceId || selectedDeviceId;

    try {
      const videoConstraints: MediaTrackConstraints = {
        width: { ideal: 1280 },
        height: { ideal: 720 },
      };
      if (useDeviceId) {
        videoConstraints.deviceId = { exact: useDeviceId };
      } else {
        videoConstraints.facingMode = 'user';
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: videoConstraints,
        audio: true,
      });
      streamRef.current = stream;
      // State change will cause the <video> element to mount;
      // the useEffect above then wires up srcObject.
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

  const handleSwitchCamera = async (deviceId: string) => {
    setSelectedDeviceId(deviceId);
    if (state === 'previewing') {
      await startCamera(deviceId);
    }
  };

  const startRecording = () => {
    if (!streamRef.current) return;
    chunksRef.current = [];
    setElapsed(0);

    // Record the start time for the overlay
    recordingStartTimeRef.current = new Date().toISOString();

    // Start the canvas overlay loop
    drawTimestampOverlay();

    // Capture the canvas stream (video with timestamp) + original audio
    const canvas = canvasRef.current;
    if (!canvas) return;
    const canvasStream = canvas.captureStream(30);
    const audioTracks = streamRef.current.getAudioTracks();
    audioTracks.forEach((track) => canvasStream.addTrack(track));

    const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus')
      ? 'video/webm;codecs=vp9,opus'
      : MediaRecorder.isTypeSupported('video/webm;codecs=vp8,opus')
        ? 'video/webm;codecs=vp8,opus'
        : 'video/webm';

    const recorder = new MediaRecorder(canvasStream, { mimeType });
    recorderRef.current = recorder;

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };

    recorder.onstop = () => {
      if (animFrameRef.current) { cancelAnimationFrame(animFrameRef.current); animFrameRef.current = null; }
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
    if (animFrameRef.current) { cancelAnimationFrame(animFrameRef.current); animFrameRef.current = null; }
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

  const remaining = MAX_RECORDING_SECONDS - elapsed;

  // Camera selector dropdown (shown in idle + previewing states)
  const cameraSelector = videoDevices.length > 1 && (
    <FormControl size="small" sx={{ minWidth: 240, mb: 2 }}>
      <InputLabel sx={{ color: 'rgba(255,255,255,0.7)' }}>Camera</InputLabel>
      <Select
        value={selectedDeviceId}
        onChange={(e) => handleSwitchCamera(e.target.value)}
        label="Camera"
        sx={{
          color: 'white',
          '.MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.3)' },
          '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.5)' },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: folioColors.accentWarm },
          '.MuiSvgIcon-root': { color: 'rgba(255,255,255,0.7)' },
        }}
      >
        {videoDevices.map((d) => (
          <MenuItem key={d.deviceId} value={d.deviceId}>{d.label}</MenuItem>
        ))}
      </Select>
    </FormControl>
  );

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
              Record a video message using your camera (up to 5 minutes). The date and time will appear on the recording. You can review it before saving.
            </Typography>
            {cameraSelector}
            <Box>
              <Button variant="contained" size="large" onClick={() => startCamera()}
                sx={{ bgcolor: folioColors.accent, '&:hover': { bgcolor: '#b8922a' }, px: 4 }}>
                Open Camera
              </Button>
            </Box>
          </Box>
        )}

        {(state === 'previewing' || state === 'recording') && (
          <Box sx={{ position: 'relative' }}>
            {state === 'previewing' && cameraSelector && (
              <Box sx={{ position: 'absolute', top: 12, left: 12, zIndex: 2 }}>
                <Select
                  value={selectedDeviceId}
                  onChange={(e) => handleSwitchCamera(e.target.value)}
                  size="small"
                  startAdornment={<CameraswitchIcon sx={{ mr: 0.5, fontSize: 18 }} />}
                  sx={{
                    color: 'white',
                    bgcolor: 'rgba(0,0,0,0.6)',
                    borderRadius: 2,
                    fontSize: '0.8rem',
                    '.MuiOutlinedInput-notchedOutline': { border: 'none' },
                    '.MuiSvgIcon-root': { color: 'rgba(255,255,255,0.8)' },
                    maxWidth: 280,
                  }}
                >
                  {videoDevices.map((d) => (
                    <MenuItem key={d.deviceId} value={d.deviceId} sx={{ fontSize: '0.85rem' }}>{d.label}</MenuItem>
                  ))}
                </Select>
              </Box>
            )}
            <video ref={videoPreviewRef} autoPlay muted playsInline
              style={{
                width: '100%', maxHeight: 480, objectFit: 'cover', display: 'block', background: '#000',
                // Hide the raw video when recording — show the canvas with timestamp instead
                ...(state === 'recording' ? { position: 'absolute', opacity: 0, pointerEvents: 'none' } : {}),
              }} />
            <canvas ref={canvasRef}
              style={{
                width: '100%', maxHeight: 480, objectFit: 'cover', display: state === 'recording' ? 'block' : 'none',
                background: '#000',
              }} />
            {state === 'recording' && (
              <>
                <Box sx={{ position: 'absolute', top: 16, right: 16, display: 'flex', alignItems: 'center', gap: 1,
                  bgcolor: 'rgba(0,0,0,0.6)', borderRadius: 2, px: 1.5, py: 0.5 }}>
                  <FiberManualRecordIcon sx={{ color: '#f44336', fontSize: 16, animation: 'pulse 1.5s infinite' }} />
                  <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 700 }}>
                    {formatTime(elapsed)} / {formatTime(MAX_RECORDING_SECONDS)}
                  </Typography>
                </Box>
                {remaining <= WARNING_SECONDS && remaining > 0 && (
                  <Box sx={{ position: 'absolute', top: 16, left: 16,
                    bgcolor: 'rgba(211, 47, 47, 0.85)', borderRadius: 2, px: 1.5, py: 0.5 }}>
                    <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 700 }}>
                      {remaining}s remaining
                    </Typography>
                  </Box>
                )}
              </>
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
