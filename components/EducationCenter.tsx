'use client';

import React, { useState } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  Card,
  CardContent,
  CardMedia,
  CardActionArea,
  Grid,
  IconButton,
  Breadcrumbs,
  Link,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary';
import ArticleIcon from '@mui/icons-material/Article';
import DescriptionIcon from '@mui/icons-material/Description';

type Section = 'main' | 'books' | 'videos' | 'blog' | 'forms';

interface CategoryCard {
  id: Section;
  title: string;
  description: string;
  icon: React.ReactNode;
  imageColor: string;
}

const categories: CategoryCard[] = [
  {
    id: 'books',
    title: 'Books',
    description: 'Explore our curated collection of estate planning books and resources to help you understand your options.',
    icon: <MenuBookIcon sx={{ fontSize: 80, color: 'white' }} />,
    imageColor: '#1a237e',
  },
  {
    id: 'videos',
    title: 'Videos',
    description: 'Watch educational videos explaining key estate planning concepts, strategies, and best practices.',
    icon: <VideoLibraryIcon sx={{ fontSize: 80, color: 'white' }} />,
    imageColor: '#2e7d32',
  },
  {
    id: 'blog',
    title: 'Blog Posts',
    description: 'Read our latest articles on estate planning topics, legal updates, and practical tips for families.',
    icon: <ArticleIcon sx={{ fontSize: 80, color: 'white' }} />,
    imageColor: '#c62828',
  },
  {
    id: 'forms',
    title: 'Forms',
    description: 'Access downloadable forms, checklists, and worksheets to help organize your estate planning documents.',
    icon: <DescriptionIcon sx={{ fontSize: 80, color: 'white' }} />,
    imageColor: '#f57c00',
  },
];

const EducationCenter: React.FC = () => {
  const [currentSection, setCurrentSection] = useState<Section>('main');

  const handleCardClick = (sectionId: Section) => {
    setCurrentSection(sectionId);
  };

  const handleBackToMain = () => {
    setCurrentSection('main');
  };

  const getCurrentCategory = () => {
    return categories.find((cat) => cat.id === currentSection);
  };

  // Sub-section view (Books, Videos, Blog Posts, Forms)
  if (currentSection !== 'main') {
    const category = getCurrentCategory();
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          {/* Back button and breadcrumbs */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <IconButton onClick={handleBackToMain} sx={{ mr: 2 }}>
              <ArrowBackIcon />
            </IconButton>
            <Breadcrumbs>
              <Link
                component="button"
                variant="body1"
                onClick={handleBackToMain}
                sx={{ cursor: 'pointer', textDecoration: 'none', color: '#1a237e' }}
              >
                Education Center
              </Link>
              <Typography color="text.primary">{category?.title}</Typography>
            </Breadcrumbs>
          </Box>

          {/* Section Header */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, color: '#1a237e' }}>
              {category?.title}
            </Typography>
          </Box>

          {/* Under Construction Message */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: 300,
              bgcolor: '#f5f5f5',
              borderRadius: 2,
              p: 4,
            }}
          >
            <Box sx={{ mb: 2 }}>{category?.icon && React.cloneElement(category.icon as React.ReactElement, { sx: { fontSize: 100, color: category.imageColor } })}</Box>
            <Typography variant="h5" sx={{ fontWeight: 500, color: 'text.secondary', mb: 2 }}>
              Under Construction
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', maxWidth: 500 }}>
              We're working hard to bring you valuable {category?.title.toLowerCase()} content.
              Please check back soon!
            </Typography>
          </Box>
        </Paper>
      </Container>
    );
  }

  // Main Education Center view with cards
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, color: '#1a237e' }}>
            Education Center
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            MyLifeFolio
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Explore our educational resources to help you better understand estate planning
          </Typography>
        </Box>

        {/* Category Cards */}
        <Grid container spacing={3}>
          {categories.map((category) => (
            <Grid item xs={12} sm={6} md={3} key={category.id}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 6,
                  },
                }}
              >
                <CardActionArea
                  onClick={() => handleCardClick(category.id)}
                  sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}
                >
                  <CardMedia
                    sx={{
                      height: 140,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: category.imageColor,
                    }}
                  >
                    {category.icon}
                  </CardMedia>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography gutterBottom variant="h6" component="div" sx={{ fontWeight: 600 }}>
                      {category.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {category.description}
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Paper>
    </Container>
  );
};

export default EducationCenter;
