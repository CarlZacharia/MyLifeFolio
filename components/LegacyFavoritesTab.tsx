'use client';

import React, { useState } from 'react';
import { Box, TextField, Typography, Grid, IconButton } from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import { useFormContext } from '../lib/FormContext';
import { folioColors } from './FolioModal';
import FavoritesHelpModal from './FavoritesHelpModal';

const favFields = [
  { key: 'favoriteMusic', label: 'Music', placeholder: 'Artists, songs, genres you love' },
  { key: 'favoriteBooks', label: 'Books', placeholder: 'Titles, authors, or genres' },
  { key: 'favoriteMovies', label: 'Movies & TV', placeholder: 'Films, shows, documentaries' },
  { key: 'favoriteFoods', label: 'Foods', placeholder: 'Dishes, cuisines, comfort foods' },
  { key: 'favoriteRestaurants', label: 'Restaurants', placeholder: 'Favorite spots, local or far' },
  { key: 'favoriteVacationDestinations', label: 'Vacation Destinations', placeholder: 'Places you love to visit' },
  { key: 'favoriteQuotesSayings', label: 'Quotes & Sayings', placeholder: 'Words you live by' },
  { key: 'otherFavorites', label: 'Other Favorites', placeholder: 'Hobbies, sports teams, anything else' },
] as const;

const tfSx = {
  '& .MuiOutlinedInput-root': {
    '&:hover fieldset': { borderColor: folioColors.accentWarm },
    '&.Mui-focused fieldset': { borderColor: folioColors.accent },
  },
  '& .MuiInputLabel-root.Mui-focused': { color: folioColors.accent },
};

const LegacyFavoritesTab = () => {
  const { formData, updateFormData } = useFormContext();
  const favs = formData.legacyFavorites;
  const [helpOpen, setHelpOpen] = useState(false);

  const handleChange = (field: string, value: string) => {
    updateFormData({ legacyFavorites: { ...favs, [field]: value } });
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
        <StarIcon sx={{ color: '#c9a227', fontSize: 28 }} />
        <Typography variant="h6" sx={{ fontWeight: 600 }}>My Favorites</Typography>
        <IconButton onClick={() => setHelpOpen(true)} size="small" sx={{ ml: 0.5, bgcolor: '#1a1a1a', color: '#c9a227', width: 28, height: 28, '&:hover': { bgcolor: '#333' } }} title="Audio guide">
          <VolumeUpIcon sx={{ fontSize: 20 }} />
        </IconButton>
      </Box>
      <FavoritesHelpModal open={helpOpen} onClose={() => setHelpOpen(false)} />
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: 600 }}>
        The little things that bring you joy. Your family will treasure knowing these details about you.
      </Typography>

      <Grid container spacing={2.5}>
        {favFields.map((f) => (
          <Grid item xs={12} sm={6} key={f.key}>
            <TextField
              label={f.label}
              value={(favs as Record<string, string>)[f.key] || ''}
              onChange={(e) => handleChange(f.key, e.target.value)}
              InputLabelProps={{ shrink: true }}
              placeholder={f.placeholder}
              multiline
              minRows={3}
              fullWidth
              sx={tfSx}
            />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default LegacyFavoritesTab;
