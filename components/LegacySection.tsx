'use client';

import React, { useState, useEffect } from 'react';
import { Box, ButtonBase, Typography } from '@mui/material';
import DescriptionIcon from '@mui/icons-material/Description';
import VolunteerActivismIcon from '@mui/icons-material/VolunteerActivism';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import HistoryEduIcon from '@mui/icons-material/HistoryEdu';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import PsychologyIcon from '@mui/icons-material/Psychology';
import EmojiObjectsIcon from '@mui/icons-material/EmojiObjects';
import FavoriteIcon from '@mui/icons-material/Favorite';
import VideocamIcon from '@mui/icons-material/Videocam';
import PhotoLibraryIcon from '@mui/icons-material/PhotoLibrary';
import { folioColors } from './FolioModal';
import FolioHelpModal, { FolioHelpButton, useFolioHelp } from './FolioHelpModal';
import { legacyHelp } from './folioHelpContent';
import LegacyObituaryTab from './LegacyObituaryTab';
import LegacyCharitableWishesTab from './LegacyCharitableWishesTab';
import LegacyLettersTab from './LegacyLettersTab';
import LegacyPersonalHistoryTab from './LegacyPersonalHistoryTab';
import LegacyLifeStoriesTab from './LegacyLifeStoriesTab';
import LegacyReflectionsTab from './LegacyReflectionsTab';
import LegacySurprisesTab from './LegacySurprisesTab';
import LegacyFavoritesTab from './LegacyFavoritesTab';
import LegacyVideoLegacyTab from './LegacyVideoLegacyTab';
import LegacyMemoryVaultTab from './LegacyMemoryVaultTab';

const TABS = [
  { label: 'Obituary Info', icon: <DescriptionIcon sx={{ fontSize: 20 }} /> },
  { label: 'Charitable Wishes', icon: <VolunteerActivismIcon sx={{ fontSize: 20 }} /> },
  { label: 'Letters to Family', icon: <MailOutlineIcon sx={{ fontSize: 20 }} /> },
  { label: 'Personal History', icon: <HistoryEduIcon sx={{ fontSize: 20 }} /> },
  { label: 'Life Stories', icon: <AutoStoriesIcon sx={{ fontSize: 20 }} /> },
  { label: 'Reflections', icon: <PsychologyIcon sx={{ fontSize: 20 }} /> },
  { label: 'Surprises', icon: <EmojiObjectsIcon sx={{ fontSize: 20 }} /> },
  { label: 'Favorites', icon: <FavoriteIcon sx={{ fontSize: 20 }} /> },
  { label: 'Video Legacy', icon: <VideocamIcon sx={{ fontSize: 20 }} /> },
  { label: 'Memory Vault', icon: <PhotoLibraryIcon sx={{ fontSize: 20 }} /> },
] as const;

interface LegacySectionProps {
  initialTab?: number;
}

const LegacySection: React.FC<LegacySectionProps> = ({ initialTab }) => {
  const [activeTab, setActiveTab] = useState(initialTab ?? 0);
  const { showHelp, openHelp, closeHelp } = useFolioHelp();

  useEffect(() => {
    if (initialTab !== undefined) setActiveTab(initialTab);
  }, [initialTab]);

  return (
    <Box>
      <FolioHelpModal open={showHelp} onClose={closeHelp} content={legacyHelp} />
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
        <FolioHelpButton onClick={openHelp} accentColor="#c9a227" />
      </Box>
      <Box sx={{
        display: 'grid',
        gridTemplateColumns: 'repeat(5, 1fr)',
        gap: 0,
        borderBottom: 2,
        borderColor: 'divider',
        mb: 3,
      }}>
        {TABS.map((tab, i) => {
          const isActive = activeTab === i;
          return (
            <ButtonBase
              key={tab.label}
              onClick={() => setActiveTab(i)}
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 0.75,
                py: 1.25,
                px: 1,
                borderBottom: 2,
                borderColor: isActive ? folioColors.accent : 'transparent',
                color: isActive ? folioColors.accent : 'text.secondary',
                bgcolor: isActive ? 'rgba(201, 162, 39, 0.06)' : 'transparent',
                transition: 'all 0.2s',
                '&:hover': {
                  bgcolor: isActive ? 'rgba(201, 162, 39, 0.06)' : 'rgba(0,0,0,0.04)',
                  color: isActive ? folioColors.accent : 'text.primary',
                },
              }}
            >
              {tab.icon}
              <Typography variant="body2" sx={{
                fontWeight: isActive ? 700 : 600,
                fontSize: '0.82rem',
                lineHeight: 1.2,
                whiteSpace: 'nowrap',
              }}>
                {tab.label}
              </Typography>
            </ButtonBase>
          );
        })}
      </Box>

      {activeTab === 0 && <LegacyObituaryTab />}
      {activeTab === 1 && <LegacyCharitableWishesTab />}
      {activeTab === 2 && <LegacyLettersTab />}
      {activeTab === 3 && <LegacyPersonalHistoryTab />}
      {activeTab === 4 && <LegacyLifeStoriesTab />}
      {activeTab === 5 && <LegacyReflectionsTab />}
      {activeTab === 6 && <LegacySurprisesTab />}
      {activeTab === 7 && <LegacyFavoritesTab />}
      {activeTab === 8 && <LegacyVideoLegacyTab />}
      {activeTab === 9 && <LegacyMemoryVaultTab />}
    </Box>
  );
};

export default LegacySection;
