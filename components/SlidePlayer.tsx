'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Box, IconButton, Typography, LinearProgress, Slider } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import ReplayIcon from '@mui/icons-material/Replay';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';

export interface Slide {
  image: string;  // Path to PNG image
  audio: string;  // Path to audio file (MP3 from ElevenLabs)
}

interface SlidePlayerProps {
  slides: Slide[];
  title: string;
  autoAdvance?: boolean;  // Auto-advance to next slide when audio ends
}

const SlidePlayer: React.FC<SlidePlayerProps> = ({ slides, title, autoAdvance = true }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioEnded, setAudioEnded] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  const slide = slides[currentSlide];
  const isLastSlide = currentSlide === slides.length - 1;
  const isFirstSlide = currentSlide === 0;

  // Reset audio state when slide changes
  useEffect(() => {
    setAudioEnded(false);
    setIsPlaying(false);
    setAudioProgress(0);

    // Auto-play when slide changes (except first load)
    if (audioRef.current && currentSlide > 0) {
      audioRef.current.load();
    }
  }, [currentSlide]);

  // Update volume when changed
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  const handlePlayPause = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
    setAudioEnded(true);

    // Auto-advance to next slide if enabled and not on last slide
    if (autoAdvance && !isLastSlide) {
      setTimeout(() => {
        setCurrentSlide((prev) => prev + 1);
      }, 500); // Small delay before advancing
    }
  };

  const handleNext = () => {
    if (!isLastSlide) {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      setCurrentSlide((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (!isFirstSlide) {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      setCurrentSlide((prev) => prev - 1);
    }
  };

  const handleReplay = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
      setIsPlaying(true);
      setAudioEnded(false);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setAudioProgress(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setAudioDuration(audioRef.current.duration);
    }
  };

  const handleProgressClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current || !audioDuration) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const clickPosition = (event.clientX - rect.left) / rect.width;
    const newTime = clickPosition * audioDuration;

    audioRef.current.currentTime = newTime;
    setAudioProgress(newTime);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleVolumeChange = (_: Event, newValue: number | number[]) => {
    const vol = newValue as number;
    setVolume(vol);
    if (vol > 0) {
      setIsMuted(false);
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  // Handle case where no slides are provided
  if (!slides || slides.length === 0) {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: 300,
          bgcolor: '#f5f5f5',
          borderRadius: 1,
        }}
      >
        <Typography color="text.secondary">No slides available</Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: '#1a1a1a',
        borderRadius: 2,
        overflow: 'hidden',
      }}
    >
      {/* Slide Image */}
      <Box
        sx={{
          position: 'relative',
          width: '100%',
          paddingTop: '56.25%', // 16:9 aspect ratio
          bgcolor: '#000',
        }}
      >
        <Box
          component="img"
          src={slide.image}
          alt={`${title} - Slide ${currentSlide + 1}`}
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'contain',
          }}
        />
      </Box>

      {/* Audio Element (hidden) */}
      <audio
        ref={audioRef}
        src={slide.audio}
        onEnded={handleAudioEnded}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        preload="metadata"
      />

      {/* Audio Progress Bar */}
      <Box
        onClick={handleProgressClick}
        sx={{
          width: '100%',
          height: 6,
          bgcolor: 'rgba(255,255,255,0.2)',
          cursor: 'pointer',
          '&:hover': {
            bgcolor: 'rgba(255,255,255,0.3)',
          },
        }}
      >
        <Box
          sx={{
            width: `${audioDuration ? (audioProgress / audioDuration) * 100 : 0}%`,
            height: '100%',
            bgcolor: 'primary.main',
            transition: 'width 0.1s linear',
          }}
        />
      </Box>

      {/* Controls */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 2,
          py: 1.5,
          bgcolor: 'rgba(0,0,0,0.9)',
        }}
      >
        {/* Left: Navigation and Play Controls */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {/* Previous Button */}
          <IconButton
            onClick={handlePrevious}
            disabled={isFirstSlide}
            size="small"
            sx={{
              color: isFirstSlide ? 'rgba(255,255,255,0.3)' : 'white',
            }}
          >
            <NavigateBeforeIcon />
          </IconButton>

          {/* Play/Pause Button */}
          <IconButton
            onClick={handlePlayPause}
            sx={{
              color: 'white',
              bgcolor: '#1a237e',
              '&:hover': { bgcolor: '#0d1642' },
              width: 40,
              height: 40,
            }}
          >
            {isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
          </IconButton>

          {/* Next Button */}
          <IconButton
            onClick={handleNext}
            disabled={isLastSlide}
            size="small"
            sx={{
              color: isLastSlide ? 'rgba(255,255,255,0.3)' : 'white',
            }}
          >
            <NavigateNextIcon />
          </IconButton>

          {/* Replay Button */}
          <IconButton
            onClick={handleReplay}
            size="small"
            sx={{ color: 'white' }}
            title="Replay current slide"
          >
            <ReplayIcon />
          </IconButton>
        </Box>

        {/* Center: Time and Slide Counter */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.75rem' }}>
            {formatTime(audioProgress)} / {formatTime(audioDuration)}
          </Typography>
          <Typography variant="body2" sx={{ color: 'white', fontWeight: 500 }}>
            Slide {currentSlide + 1} of {slides.length}
          </Typography>
        </Box>

        {/* Right: Volume Control */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 120 }}>
          <IconButton
            onClick={toggleMute}
            size="small"
            sx={{ color: 'white' }}
          >
            {isMuted || volume === 0 ? <VolumeOffIcon /> : <VolumeUpIcon />}
          </IconButton>
          <Slider
            value={isMuted ? 0 : volume}
            onChange={handleVolumeChange}
            min={0}
            max={1}
            step={0.1}
            sx={{
              width: 80,
              color: 'white',
              '& .MuiSlider-thumb': {
                width: 12,
                height: 12,
              },
              '& .MuiSlider-track': {
                height: 3,
              },
              '& .MuiSlider-rail': {
                height: 3,
                bgcolor: 'rgba(255,255,255,0.3)',
              },
            }}
          />
        </Box>
      </Box>

      {/* Slide Progress Indicator */}
      <LinearProgress
        variant="determinate"
        value={((currentSlide + 1) / slides.length) * 100}
        sx={{
          height: 3,
          bgcolor: 'rgba(255,255,255,0.1)',
          '& .MuiLinearProgress-bar': {
            bgcolor: '#FFD700',
          },
        }}
      />
    </Box>
  );
};

export default SlidePlayer;
