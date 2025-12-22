'use client';

import React, { useMemo } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  CardMedia,
  CardActionArea,
  Grid,
  AppBar,
  Toolbar,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Paper,
  Button,
  Alert,
  Divider,
  Chip,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArticleIcon from '@mui/icons-material/Article';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import DescriptionIcon from '@mui/icons-material/Description';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import EditIcon from '@mui/icons-material/Edit';
import LockIcon from '@mui/icons-material/Lock';
import LoginIcon from '@mui/icons-material/Login';
import PersonAddIcon from '@mui/icons-material/PersonAdd';

// Education Center Items
const educationItems = [
  {
    id: 'what-is-estate-planning',
    title: 'What is Estate Planning?',
    type: 'article',
    description: 'Learn the basics of estate planning and why it matters.',
  },
  {
    id: 'wills-vs-trusts',
    title: 'Wills vs. Trusts: Understanding the Difference',
    type: 'article',
    description: 'Compare wills and trusts to determine which is right for you.',
  },
  {
    id: 'power-of-attorney',
    title: 'Power of Attorney Explained',
    type: 'video',
    description: 'A video guide to understanding powers of attorney.',
  },
  {
    id: 'healthcare-directives',
    title: 'Healthcare Directives & Living Wills',
    type: 'article',
    description: 'Ensure your healthcare wishes are honored.',
  },
  {
    id: 'probate-process',
    title: 'The Probate Process in Florida',
    type: 'article',
    description: 'What to expect during Florida probate.',
  },
  {
    id: 'avoiding-probate',
    title: 'Strategies to Avoid Probate',
    type: 'video',
    description: 'Learn how to structure your estate to avoid probate.',
  },
  {
    id: 'trust-administration',
    title: 'Trust Administration Guide',
    type: 'guide',
    description: 'A comprehensive guide for successor trustees.',
  },
  {
    id: 'beneficiary-designations',
    title: 'Beneficiary Designations: Common Mistakes',
    type: 'article',
    description: 'Avoid costly errors with beneficiary designations.',
  },
  {
    id: 'estate-tax-basics',
    title: 'Estate Tax Basics',
    type: 'article',
    description: 'Understanding federal and state estate taxes.',
  },
  {
    id: 'special-needs-planning',
    title: 'Special Needs Planning',
    type: 'guide',
    description: 'Protecting loved ones with disabilities.',
  },
];

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'video':
      return <PlayCircleOutlineIcon />;
    case 'guide':
      return <MenuBookIcon />;
    default:
      return <ArticleIcon />;
  }
};

const getTypeColor = (type: string) => {
  switch (type) {
    case 'video':
      return 'error';
    case 'guide':
      return 'success';
    default:
      return 'primary';
  }
};

interface EstatePlanningHomeProps {
  onNavigateBack: () => void;
  onStartQuestionnaire: () => void;
  onEducationItemClick?: (itemId: string) => void;
  onLogin?: () => void;
  onRegister?: () => void;
}

const EstatePlanningHome: React.FC<EstatePlanningHomeProps> = ({
  onNavigateBack,
  onStartQuestionnaire,
  onEducationItemClick,
  onLogin,
  onRegister,
}) => {
  // Check if there's existing questionnaire data in localStorage
  const hasExistingData = useMemo(() => {
    if (typeof window === 'undefined') return false;
    try {
      const stored = localStorage.getItem('estate-planning-questionnaire');
      if (!stored) return false;
      const data = JSON.parse(stored);
      // Check if there's meaningful data (e.g., name filled in)
      return data && (data.name || data.spouseName || data.children?.length > 0);
    } catch {
      return false;
    }
  }, []);

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f5f5' }}>
      {/* Navigation Bar */}
      <AppBar position="static" sx={{ bgcolor: '#1a237e' }}>
        <Toolbar>
          <Button
            color="inherit"
            startIcon={<ArrowBackIcon />}
            onClick={onNavigateBack}
            sx={{ mr: 2 }}
          >
            Back
          </Button>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 600 }}>
            Estate Planning
          </Typography>
          <Button
            color="inherit"
            startIcon={<LoginIcon />}
            onClick={onLogin}
            sx={{ mr: 1 }}
          >
            Login
          </Button>
          <Button
            variant="outlined"
            color="inherit"
            startIcon={<PersonAddIcon />}
            onClick={onRegister}
            sx={{ borderColor: 'white' }}
          >
            Register
          </Button>
        </Toolbar>
      </AppBar>

      {/* Page Header */}
      <Box sx={{ bgcolor: '#1a237e', color: 'white', py: 4 }}>
        <Container maxWidth="lg">
          <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
            Estate Planning Center
          </Typography>
          <Typography variant="body1" sx={{ mt: 1, opacity: 0.9 }}>
            Learn about estate planning and complete your intake questionnaire
          </Typography>
        </Container>
      </Box>

      {/* Main Content */}
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Grid container spacing={4}>
          {/* Left Column - Education Center */}
          <Grid item xs={12} md={7}>
            <Paper sx={{ p: 3, height: '100%' }}>
              <Typography variant="h5" sx={{ fontWeight: 600, color: '#1a237e', mb: 1 }}>
                Education Center
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Explore our resources to better understand estate planning concepts
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <List sx={{ maxHeight: 500, overflow: 'auto' }}>
                {educationItems.map((item, index) => (
                  <ListItem key={item.id} disablePadding>
                    <ListItemButton
                      onClick={() => onEducationItemClick?.(item.id)}
                      sx={{
                        borderRadius: 1,
                        mb: 0.5,
                        '&:hover': {
                          bgcolor: 'action.hover',
                        },
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: 40 }}>
                        {getTypeIcon(item.type)}
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="body1" sx={{ fontWeight: 500 }}>
                              {item.title}
                            </Typography>
                            <Chip
                              label={item.type}
                              size="small"
                              color={getTypeColor(item.type) as 'primary' | 'error' | 'success'}
                              variant="outlined"
                              sx={{ height: 20, fontSize: '0.7rem' }}
                            />
                          </Box>
                        }
                        secondary={item.description}
                      />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Grid>

          {/* Right Column - Intake Questionnaire Card */}
          <Grid item xs={12} md={5}>
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
              <CardActionArea onClick={onStartQuestionnaire} sx={{ flexGrow: 1 }}>
                <CardMedia
                  component="div"
                  sx={{
                    height: 200,
                    bgcolor: '#1a237e',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  {/* Decorative background pattern */}
                  <Box
                    sx={{
                      position: 'absolute',
                      top: -50,
                      right: -50,
                      width: 200,
                      height: 200,
                      borderRadius: '50%',
                      bgcolor: 'rgba(255,255,255,0.1)',
                    }}
                  />
                  <Box
                    sx={{
                      position: 'absolute',
                      bottom: -30,
                      left: -30,
                      width: 150,
                      height: 150,
                      borderRadius: '50%',
                      bgcolor: 'rgba(255,255,255,0.05)',
                    }}
                  />
                  <DescriptionIcon sx={{ fontSize: 80, color: 'white', zIndex: 1 }} />
                </CardMedia>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h5" component="h2" sx={{ fontWeight: 600, mb: 1 }}>
                    {hasExistingData ? 'Continue Your Intake' : 'Start New Intake'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {hasExistingData
                      ? 'Pick up where you left off on your estate planning questionnaire.'
                      : 'Begin your estate planning questionnaire to help us understand your needs.'}
                  </Typography>
                  <Button
                    variant="contained"
                    fullWidth
                    size="large"
                    startIcon={hasExistingData ? <EditIcon /> : <PlayArrowIcon />}
                    sx={{
                      bgcolor: '#1a237e',
                      py: 1.5,
                      '&:hover': { bgcolor: '#0d1642' },
                    }}
                  >
                    {hasExistingData ? 'Continue Questionnaire' : 'Start Questionnaire'}
                  </Button>
                </CardContent>
              </CardActionArea>
            </Card>

            {/* Data Privacy Notice */}
            <Alert
              severity="info"
              icon={<LockIcon />}
              sx={{ mt: 3 }}
            >
              <Typography variant="body2" sx={{ fontWeight: 500, mb: 0.5 }}>
                Your Data is Secure
              </Typography>
              <Typography variant="body2">
                The information you enter is stored locally on this device only. Your data will
                not be transmitted to our office until you complete and submit the questionnaire.
                You can safely close this page and return later to continue.
              </Typography>
            </Alert>
          </Grid>
        </Grid>
      </Container>

      {/* Footer */}
      <Box sx={{ bgcolor: '#1a237e', color: 'white', py: 3, mt: 4 }}>
        <Container maxWidth="lg">
          <Typography variant="body2" align="center" sx={{ opacity: 0.8 }}>
            Zacharia Brown & Bratkovich | 26811 South Bay Dr. Ste 260, Bonita Springs, FL 34134 |
            (239) 345-4545
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};

export default EstatePlanningHome;
