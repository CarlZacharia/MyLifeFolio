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
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { useFormContext } from '../lib/FormContext';
import { useSubscription } from '../lib/SubscriptionContext';
import { TIER_INFO } from '../lib/subscriptionConfig';
import { folioColors } from './FolioModal';
import LegacyVideoModal, { VideoData, emptyVideo } from './LegacyVideoModal';
import VideoRecorderModal from './VideoRecorderModal';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import VideoLegacyHelpModal from './VideoLegacyHelpModal';

const MAX_VIDEOS = 5;

// ─── Prompt categories shown on empty state ───────────────────────────────────
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

// Flat list of all prompts used for the chip display
const ALL_PROMPTS = PROMPT_CATEGORIES.flatMap((c) => c.prompts);

const LegacyVideoLegacyTab = () => {
  const { formData, updateFormData } = useFormContext();
  const { canAccess } = useSubscription();
  const hasVideoAccess = canAccess('legacy-video');
  const videos = formData.legacyVideos;
  const atLimit = videos.length >= MAX_VIDEOS;

  const [modalOpen, setModalOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [recorderOpen, setRecorderOpen] = useState(false);
  const [recorderTitle, setRecorderTitle] = useState('');
  const [playbackIndex, setPlaybackIndex] = useState<number | null>(null);
  const [helpOpen, setHelpOpen] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

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
      {/* ── Header ── */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
        <VideocamIcon sx={{ color: '#c9a227', fontSize: 28 }} />
        <Typography variant="h6" sx={{ fontWeight: 600 }}>Video Legacy</Typography>
        <IconButton
          onClick={() => setHelpOpen(true)}
          size="small"
          sx={{ ml: 0.5, bgcolor: '#1a1a1a', color: '#c9a227', width: 28, height: 28, '&:hover': { bgcolor: '#333' } }}
          title="How Video Legacy works"
        >
          <VolumeUpIcon sx={{ fontSize: 20 }} />
        </IconButton>
      </Box>

      <VideoLegacyHelpModal open={helpOpen} onClose={() => setHelpOpen(false)} />

      <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: 600 }}>
        Record or link video messages for your loved ones. Seeing and hearing you will mean the world — 
        and your own words, spoken on camera, speak for themselves.
      </Typography>

      {/* ── Locked state ── */}
      {!hasVideoAccess && (
        <Box
          sx={{
            bgcolor: 'rgba(30, 58, 95, 0.04)',
            border: '1px solid rgba(30, 58, 95, 0.15)',
            borderRadius: 2,
            px: 3,
            py: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2,
            textAlign: 'center',
          }}
        >
          <LockOutlinedIcon sx={{ fontSize: 40, color: '#1e3a5f', opacity: 0.5 }} />
          <Typography variant="h6" sx={{ fontWeight: 600, color: '#1e3a5f' }}>
            Video Legacy — {TIER_INFO.enhanced.name} Feature
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 440 }}>
            Upgrade to the {TIER_INFO.enhanced.name} plan ({TIER_INFO.enhanced.price}/{TIER_INFO.enhanced.priceDetail}) to record
            and store up to {MAX_VIDEOS} video messages for your loved ones.
          </Typography>
        </Box>
      )}

      {/* ── Accessible state ── */}
      {hasVideoAccess && (
        <>
          {/* Action bar */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', mb: 2, gap: 1.5 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mr: 'auto' }}>
              {videos.length} / {MAX_VIDEOS} videos
            </Typography>
            <Button
              variant="outlined"
              startIcon={<FiberManualRecordIcon sx={{ color: atLimit ? 'inherit' : '#d32f2f' }} />}
              onClick={openRecorder}
              size="small"
              disabled={atLimit}
              sx={{
                borderColor: folioColors.inkLight, color: folioColors.ink,
                '&:hover': { borderColor: folioColors.ink, bgcolor: 'rgba(201,162,39,0.06)' },
              }}
            >
              Record Now
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={openAdd}
              size="small"
              disabled={atLimit}
              sx={{ bgcolor: folioColors.ink, '&:hover': { bgcolor: '#3d3224' } }}
            >
              Add Video
            </Button>
          </Box>

          {/* Video list */}
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
                              <Chip
                                icon={<LockIcon sx={{ fontSize: 14 }} />}
                                label="Private"
                                size="small"
                                sx={{ bgcolor: '#fff3e0', color: '#e65100', fontWeight: 600, height: 22 }}
                              />
                            )}
                          </Box>
                          <Typography variant="body2" color="text.secondary">
                            {[video.recordingDate, video.description?.slice(0, 80)].filter(Boolean).join(' · ')}
                          </Typography>
                        </Box>
                      </Box>
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        {video.cloudLink && (
                          <IconButton
                            size="small"
                            onClick={() => setPlaybackIndex(i)}
                            sx={{ color: folioColors.accent, '&:hover': { bgcolor: 'rgba(139,105,20,0.08)' } }}
                          >
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
            /* ── Empty state with categorized prompts ── */
            <Box>
              <Paper variant="outlined" sx={{ p: 4, textAlign: 'center', mb: 3 }}>
                <VideocamIcon sx={{ fontSize: 48, color: folioColors.inkFaint, mb: 1 }} />
                <Typography color="text.secondary" sx={{ mb: 0.5 }}>
                  No videos yet. Record a message with your camera or add a link to an existing video.
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ opacity: 0.7 }}>
                  Up to {MAX_VIDEOS} videos · Visible only to people you grant access
                </Typography>
              </Paper>

              {/* Categorized prompt cards */}
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5 }}>
                Ideas for your videos:
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {PROMPT_CATEGORIES.map((cat) => (
                  <Box
                    key={cat.label}
                    sx={{
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 2,
                      overflow: 'hidden',
                    }}
                  >
                    {/* Category header — clickable to expand */}
                    <Box
                      onClick={() => setExpandedCategory(expandedCategory === cat.label ? null : cat.label)}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        px: 2,
                        py: 1.25,
                        bgcolor: cat.bgColor,
                        cursor: 'pointer',
                        userSelect: 'none',
                        '&:hover': { filter: 'brightness(0.97)' },
                      }}
                    >
                      <Typography variant="body2" sx={{ fontWeight: 600, color: cat.color, letterSpacing: '0.02em' }}>
                        {cat.label}
                      </Typography>
                      <Typography variant="body2" sx={{ color: cat.color, opacity: 0.7, fontSize: 18, lineHeight: 1 }}>
                        {expandedCategory === cat.label ? '−' : '+'}
                      </Typography>
                    </Box>

                    {/* Prompt chips — shown when expanded */}
                    {expandedCategory === cat.label && (
                      <Box sx={{ px: 2, py: 1.5, display: 'flex', flexWrap: 'wrap', gap: 1, bgcolor: 'background.paper' }}>
                        {cat.prompts.map((prompt) => (
                          <Chip
                            key={prompt}
                            label={prompt}
                            variant="outlined"
                            size="small"
                            sx={{
                              cursor: 'default',
                              borderColor: cat.color,
                              color: cat.color,
                              fontSize: '0.78rem',
                            }}
                          />
                        ))}
                      </Box>
                    )}
                  </Box>
                ))}
              </Box>

              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2, fontStyle: 'italic' }}>
                Tip: Don't worry about production quality — your family just wants to see and hear you being you.
              </Typography>
            </Box>
          )}

          {/* ── Modals ── */}
          <LegacyVideoModal
            open={modalOpen}
            onClose={closeModal}
            onSave={handleSave}
            onDelete={isEdit ? handleDelete : undefined}
            initialData={isEdit && editIndex !== null ? videos[editIndex] as VideoData : undefined}
            isEdit={isEdit}
          />

          <VideoRecorderModal
            open={recorderOpen}
            onClose={() => setRecorderOpen(false)}
            onRecordingComplete={handleRecordingComplete}
            videoTitle={recorderTitle || 'legacy-video'}
          />

          {/* ── Video Playback Dialog ── */}
          <Dialog
            open={playbackIndex !== null}
            onClose={() => setPlaybackIndex(null)}
            maxWidth="md"
            fullWidth
            PaperProps={{ sx: { borderRadius: 3, bgcolor: '#1a1a1a', color: 'white' } }}
          >
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
        </>
      )}
    </Box>
  );
};

export default LegacyVideoLegacyTab;