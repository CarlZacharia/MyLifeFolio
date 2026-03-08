'use client';

import React, { useState } from 'react';
import {
  Box, Button, Card, CardContent, Chip, IconButton, Typography, Paper,
  Dialog, DialogTitle, DialogContent,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import CloseIcon from '@mui/icons-material/Close';
import VideocamIcon from '@mui/icons-material/Videocam';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import LockIcon from '@mui/icons-material/Lock';
import { useFormContext } from '../lib/FormContext';
import { folioColors } from './FolioModal';
import LegacyVideoModal, { VideoData, emptyVideo } from './LegacyVideoModal';
import VideoRecorderModal from './VideoRecorderModal';

const MAX_VIDEOS = 5;

const VIDEO_PROMPTS = [
  'My life story — where I came from and what I\'ve done',
  'What I want my grandchildren to know',
  'Advice for my family',
  'What I hope my legacy will be',
  'A message to be opened on a special occasion',
];

const LegacyVideoLegacyTab = () => {
  const { formData, updateFormData } = useFormContext();
  const videos = formData.legacyVideos;
  const atLimit = videos.length >= MAX_VIDEOS;

  const [modalOpen, setModalOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [recorderOpen, setRecorderOpen] = useState(false);
  const [recorderTitle, setRecorderTitle] = useState('');
  const [playbackIndex, setPlaybackIndex] = useState<number | null>(null);

  const openAdd = () => { setIsEdit(false); setEditIndex(null); setModalOpen(true); };
  const openEdit = (i: number) => { setIsEdit(true); setEditIndex(i); setModalOpen(true); };
  const closeModal = () => { setModalOpen(false); setIsEdit(false); setEditIndex(null); };

  const openRecorder = () => {
    setRecorderTitle('');
    setRecorderOpen(true);
  };

  const handleRecordingComplete = (url: string) => {
    const today = new Date().toISOString().slice(0, 10);
    const newVideo: VideoData = {
      ...emptyVideo(),
      videoTitle: 'Recorded Video — ' + today,
      recordingDate: today,
      cloudLink: url,
      description: 'Recorded directly from My Life Folio',
    };
    updateFormData({ legacyVideos: [...videos, newVideo] });
  };

  const handleSave = (data: VideoData) => {
    if (isEdit && editIndex !== null) {
      const updated = [...videos]; updated[editIndex] = data;
      updateFormData({ legacyVideos: updated });
    } else {
      updateFormData({ legacyVideos: [...videos, data] });
    }
  };

  const handleDelete = () => {
    if (editIndex !== null) {
      updateFormData({ legacyVideos: videos.filter((_, i) => i !== editIndex) });
      closeModal();
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
        <VideocamIcon sx={{ color: '#c9a227', fontSize: 28 }} />
        <Typography variant="h6" sx={{ fontWeight: 600 }}>Video Legacy</Typography>
      </Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: 600 }}>
        Record or link video messages for your loved ones. Seeing and hearing you will mean the world.
      </Typography>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', mb: 2, gap: 1.5 }}>
        <Typography variant="body2" color="text.secondary" sx={{ mr: 'auto' }}>
          {videos.length} / {MAX_VIDEOS} videos
        </Typography>
        <Button variant="outlined" startIcon={<FiberManualRecordIcon sx={{ color: atLimit ? 'inherit' : '#d32f2f' }} />}
          onClick={openRecorder} size="small" disabled={atLimit}
          sx={{ borderColor: folioColors.inkLight, color: folioColors.ink,
            '&:hover': { borderColor: folioColors.ink, bgcolor: 'rgba(201,162,39,0.06)' } }}>
          Record Now
        </Button>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openAdd} size="small" disabled={atLimit}
          sx={{ bgcolor: folioColors.ink, '&:hover': { bgcolor: '#3d3224' } }}>
          Add Video
        </Button>
      </Box>

      {videos.length > 0 ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {videos.map((video, i) => (
            <Card key={i} variant="outlined" sx={{ '&:hover': { borderColor: folioColors.accentWarm }, transition: 'border-color 0.2s' }}>
              <CardContent sx={{ py: 1.5, px: 2, '&:last-child': { pb: 1.5 } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flex: 1, minWidth: 0 }}>
                    <VideocamIcon sx={{ color: folioColors.accent, fontSize: 24 }} />
                    <Box sx={{ minWidth: 0 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600, lineHeight: 1.3 }}>
                          {video.videoTitle}
                        </Typography>
                        {video.isPrivate && (
                          <Chip icon={<LockIcon sx={{ fontSize: 14 }} />} label="Private" size="small"
                            sx={{ bgcolor: '#fff3e0', color: '#e65100', fontWeight: 600, height: 22 }} />
                        )}
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        {[video.recordingDate, video.description?.slice(0, 80)].filter(Boolean).join(' · ')}
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                    {video.cloudLink && (
                      <IconButton size="small" onClick={() => setPlaybackIndex(i)}
                        sx={{ color: folioColors.accent, '&:hover': { bgcolor: 'rgba(139,105,20,0.08)' } }}>
                        <PlayArrowIcon fontSize="small" />
                      </IconButton>
                    )}
                    <IconButton size="small" onClick={() => openEdit(i)} sx={{ color: folioColors.inkLight }}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      ) : (
        <Box>
          <Paper variant="outlined" sx={{ p: 4, textAlign: 'center', mb: 3 }}>
            <VideocamIcon sx={{ fontSize: 48, color: folioColors.inkFaint, mb: 1 }} />
            <Typography color="text.secondary" sx={{ mb: 2 }}>
              No videos yet. Record a message with your camera or add a link to an existing video.
            </Typography>
          </Paper>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5 }}>Recording ideas:</Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {VIDEO_PROMPTS.map((prompt) => (
              <Chip key={prompt} label={prompt} variant="outlined"
                sx={{ cursor: 'default' }} />
            ))}
          </Box>
        </Box>
      )}

      <LegacyVideoModal open={modalOpen} onClose={closeModal} onSave={handleSave}
        onDelete={isEdit ? handleDelete : undefined}
        initialData={isEdit && editIndex !== null ? videos[editIndex] as VideoData : undefined}
        isEdit={isEdit} />

      <VideoRecorderModal open={recorderOpen} onClose={() => setRecorderOpen(false)}
        onRecordingComplete={handleRecordingComplete}
        videoTitle={recorderTitle || 'legacy-video'} />

      {/* Video Playback Dialog */}
      <Dialog open={playbackIndex !== null} onClose={() => setPlaybackIndex(null)}
        maxWidth="md" fullWidth
        PaperProps={{ sx: { borderRadius: 3, bgcolor: '#1a1a1a', color: 'white' } }}>
        {playbackIndex !== null && videos[playbackIndex] && (
          <>
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {videos[playbackIndex].videoTitle}
              </Typography>
              <IconButton onClick={() => setPlaybackIndex(null)} sx={{ color: 'white' }}>
                <CloseIcon />
              </IconButton>
            </DialogTitle>
            <DialogContent sx={{ p: 0, pb: 2 }}>
              {videos[playbackIndex].cloudLink && (() => {
                const link = videos[playbackIndex].cloudLink;
                const isYouTube = /youtu\.?be/.test(link);
                const isVimeo = /vimeo\.com/.test(link);
                if (isYouTube || isVimeo) {
                  let embedUrl = link;
                  if (isYouTube) {
                    const match = link.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
                    if (match) embedUrl = `https://www.youtube.com/embed/${match[1]}`;
                  } else if (isVimeo) {
                    const match = link.match(/vimeo\.com\/(\d+)/);
                    if (match) embedUrl = `https://player.vimeo.com/video/${match[1]}`;
                  }
                  return (
                    <Box sx={{ position: 'relative', pt: '56.25%' }}>
                      <iframe
                        src={embedUrl}
                        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
                        allow="autoplay; fullscreen; picture-in-picture"
                        allowFullScreen
                        title={videos[playbackIndex].videoTitle}
                      />
                    </Box>
                  );
                }
                // Direct video file (e.g. Supabase storage URL or .mp4/.webm)
                return (
                  <video
                    src={link}
                    controls
                    autoPlay
                    playsInline
                    style={{ width: '100%', maxHeight: 500, display: 'block', background: '#000' }}
                  />
                );
              })()}
            </DialogContent>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default LegacyVideoLegacyTab;
