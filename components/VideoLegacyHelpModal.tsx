'use client';
import React from 'react';
import { Typography, Box, Divider } from '@mui/material';
import { folioColors } from './FolioModal';
import ResourceHelpModal, { HelpSection, helpBodySx } from './ResourceHelpModal';

interface VideoLegacyHelpModalProps {
  open: boolean;
  onClose: () => void;
}

const body = helpBodySx;

// ─── Prompt category display data ─────────────────────────────────────────────
const PROMPT_CATEGORIES = [
  {
    label: 'Your life story',
    color: '#0F6E56',
    bgColor: 'rgba(29,158,117,0.08)',
    borderColor: '#1D9E75',
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
    borderColor: '#378ADD',
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
    borderColor: '#D4537E',
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
    borderColor: '#BA7517',
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
    borderColor: '#7F77DD',
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
    borderColor: '#888780',
    prompts: [
      'The best advice I ever received',
      'What I would tell my younger self',
      'Funny stories and memories I do not want forgotten',
      'A message just to say: I love you',
    ],
  },
];

const VideoLegacyHelpModal: React.FC<VideoLegacyHelpModalProps> = ({ open, onClose }) => (
  <ResourceHelpModal
    open={open}
    onClose={onClose}
    title="How Video Legacy Works"
    audioSrc="/audio/resources/legacy-video-legacy.mp3"
  >
    {/* ── Intro ── */}
    <Typography sx={{ ...body, mb: 2.5 }}>
      Video Legacy lets you record or link personal video messages for the people
      you love. Nothing captures your personality — your voice, your expressions,
      your warmth — quite like video. These recordings become irreplaceable gifts
      your family will treasure forever. And when it matters most, your own words
      spoken on camera speak for themselves.
    </Typography>

    {/* ── Recording ── */}
    <HelpSection title="Recording a Video">
      <Typography sx={body}>
        Click <strong>Add Video</strong> to open the video editor. You can record
        directly from your device&apos;s camera or paste a link to a video you
        have already uploaded to a cloud service. Give each video a title and an
        optional description so your family knows the context.
      </Typography>
    </HelpSection>

    <Divider sx={{ borderColor: folioColors.parchment, my: 2 }} />

    {/* ── Prompt categories ── */}
    <HelpSection title="What to Record — Ideas by Category">
      <Typography sx={{ ...body, mb: 2 }}>
        Not sure where to start? Here are ideas organized by purpose. Use the{' '}
        <strong>Need an idea?</strong> button in the video editor to pick one as
        your starting point — or simply say whatever is in your heart.
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
        {PROMPT_CATEGORIES.map((cat) => (
          <Box
            key={cat.label}
            sx={{
              borderLeft: `3px solid ${cat.borderColor}`,
              borderRadius: '0 6px 6px 0',
              bgcolor: cat.bgColor,
              px: 1.75,
              py: 1.25,
            }}
          >
            <Typography
              sx={{
                fontSize: '11px',
                fontWeight: 700,
                color: cat.color,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                mb: 0.75,
              }}
            >
              {cat.label}
            </Typography>
            <Box component="ul" sx={{ m: 0, pl: 2.25, display: 'flex', flexDirection: 'column', gap: 0.25 }}>
              {cat.prompts.map((prompt) => (
                <Box component="li" key={prompt}>
                  <Typography sx={{ ...body, fontSize: '13px' }}>
                    {prompt}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>
        ))}
      </Box>
    </HelpSection>

    <Divider sx={{ borderColor: folioColors.parchment, my: 2 }} />

    {/* ── Capacity note ── */}
    <HelpSection title="A Note on Demonstrating Your Wishes">
      <Typography sx={body}>
        One of the most powerful uses of Video Legacy is to record a clear,
        calm statement of your estate planning intentions — in your own voice,
        on camera, with the date visible. If your will, trust, or other
        decisions are ever questioned, a video showing you speaking clearly,
        voluntarily, and in your own words can be compelling evidence of your
        state of mind. Consider recording the date, stating that no one is
        pressuring you, and explaining — in plain language — why you made the
        choices you did.
      </Typography>
    </HelpSection>

    <Divider sx={{ borderColor: folioColors.parchment, my: 2 }} />

    {/* ── Storage ── */}
    <HelpSection title="Storage & Limits">
      <Typography sx={body}>
        You can save up to <strong>five videos</strong> in your Video Legacy.
        Videos are stored securely and are only accessible to you and the
        family members you grant access to through the Family Access Portal.
        Set a video to <strong>Private</strong> to keep it visible only to you.
      </Typography>
    </HelpSection>

    {/* ── Why video matters ── */}
    <HelpSection title="Why Video Matters">
      <Typography sx={body}>
        Written words are powerful, but hearing your voice and seeing your face
        adds an emotional dimension that nothing else can match. A two-minute
        video of you laughing, sharing advice, or simply saying &quot;I love
        you&quot; will mean more to your family than you can imagine.
      </Typography>
    </HelpSection>

    {/* ── Tip ── */}
    <Box
      sx={{
        mt: 1,
        p: 1.5,
        bgcolor: '#fff8e1',
        borderRadius: '8px',
        border: '1px solid #ffe082',
      }}
    >
      <Typography sx={{ ...body, fontSize: '12.5px', color: '#6d4c00' }}>
        <strong>Tip:</strong> Do not worry about production quality. Your family
        does not need perfect lighting or a rehearsed script — they just want to
        see and hear you being you. Even a quiet two minutes at the kitchen table
        is a gift that will last forever.
      </Typography>
    </Box>
  </ResourceHelpModal>
);

export default VideoLegacyHelpModal;