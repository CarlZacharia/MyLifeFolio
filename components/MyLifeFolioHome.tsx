'use client';

import React, { useMemo, useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
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
  Fade,
} from '@mui/material';
import { ThemeProvider, createTheme, alpha } from '@mui/material/styles';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArticleIcon from '@mui/icons-material/Article';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import DescriptionIcon from '@mui/icons-material/Description';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import EditIcon from '@mui/icons-material/Edit';
import LockIcon from '@mui/icons-material/Lock';
import BalanceIcon from '@mui/icons-material/Balance';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import SchoolIcon from '@mui/icons-material/School';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LogoutIcon from '@mui/icons-material/Logout';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import PersonIcon from '@mui/icons-material/Person';
import ExploreIcon from '@mui/icons-material/Explore';
import QuizIcon from '@mui/icons-material/Quiz';
import CalculateIcon from '@mui/icons-material/Calculate';
import AssignmentIcon from '@mui/icons-material/Assignment';
import CloudDoneIcon from '@mui/icons-material/CloudDone';
import SaveIcon from '@mui/icons-material/Save';
import { useAuth } from '../lib/AuthContext';
import { useFormContext } from '../lib/FormContext';
import { listIntakesRaw, loadIntakeFromRaw } from '../lib/supabaseIntake';

// Helper to check if user is an admin (email domain is mylifefolio.com)
const isAdminUser = (email: string | undefined): boolean => {
  if (!email) return false;
  const domain = email.split('@')[1];
  return domain === 'mylifefolio.com';
};

// Custom theme matching LandingPage
const theme = createTheme({
  palette: {
    primary: {
      main: '#1e3a5f',
      light: '#2d5a8e',
      dark: '#0f2744',
    },
    secondary: {
      main: '#c9a227',
      light: '#e8c547',
      dark: '#9a7b1a',
    },
    background: {
      default: '#faf9f7',
      paper: '#ffffff',
    },
    text: {
      primary: '#1a1a1a',
      secondary: '#5a5a5a',
    },
  },
  typography: {
    fontFamily: '"Source Sans 3", "Georgia", serif',
    h1: {
      fontFamily: '"Playfair Display", Georgia, serif',
      fontWeight: 600,
      letterSpacing: '-0.02em',
    },
    h2: {
      fontFamily: '"Playfair Display", Georgia, serif',
      fontWeight: 600,
      letterSpacing: '-0.01em',
    },
    h3: {
      fontFamily: '"Playfair Display", Georgia, serif',
      fontWeight: 500,
    },
    h4: {
      fontFamily: '"Playfair Display", Georgia, serif',
      fontWeight: 500,
    },
    h5: {
      fontFamily: '"Playfair Display", Georgia, serif',
      fontWeight: 500,
    },
    h6: {
      fontFamily: '"Source Sans 3", sans-serif',
      fontWeight: 600,
    },
    body1: {
      fontFamily: '"Source Sans 3", sans-serif',
      fontSize: '1.05rem',
      lineHeight: 1.7,
    },
    body2: {
      fontFamily: '"Source Sans 3", sans-serif',
      lineHeight: 1.6,
    },
    button: {
      fontFamily: '"Source Sans 3", sans-serif',
      fontWeight: 600,
      textTransform: 'none',
      letterSpacing: '0.02em',
    },
  },
  shape: {
    borderRadius: 4,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 2,
          padding: '10px 24px',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 3,
          boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 3,
        },
      },
    },
  },
});

// Education Center Items
const educationItems = [
  {
    id: 'getting-started-folio',
    title: 'Getting Started with Your Folio',
    type: 'article',
    description: 'Learn how to set up and organize your personal life folio.',
    readTime: '5 min read',
  },
  {
    id: 'why-organize-documents',
    title: 'Why Organizing Your Documents Matters',
    type: 'article',
    description: 'How having everything in one place protects you and your family.',
    readTime: '6 min read',
  },
  {
    id: 'estate-planning-basics',
    title: 'Estate Planning Basics',
    type: 'article',
    description: 'An introduction to wills, trusts, and planning for the future.',
    readTime: '8 min read',
  },
  {
    id: 'power-of-attorney',
    title: 'Power of Attorney Explained',
    type: 'video',
    description: 'A video guide to understanding powers of attorney.',
    readTime: '12 min watch',
  },
  {
    id: 'healthcare-directives',
    title: 'Healthcare Directives & Living Wills',
    type: 'article',
    description: 'Ensure your healthcare wishes are documented and honored.',
    readTime: '6 min read',
  },
  {
    id: 'beneficiary-designations',
    title: 'Beneficiary Designations: Common Mistakes',
    type: 'article',
    description: 'Avoid costly errors with beneficiary designations.',
    readTime: '7 min read',
  },
  {
    id: 'digital-assets',
    title: 'Managing Your Digital Life',
    type: 'article',
    description: 'How to account for online accounts, passwords, and digital property.',
    readTime: '8 min read',
  },
  {
    id: 'family-communication',
    title: 'Talking to Family About Your Plans',
    type: 'video',
    description: 'Tips for having important conversations with loved ones.',
    readTime: '10 min watch',
  },
  {
    id: 'insurance-overview',
    title: 'Insurance: What You Need to Know',
    type: 'guide',
    description: 'Life, long-term care, and other coverage to consider.',
    readTime: '12 min read',
  },
  {
    id: 'financial-snapshot',
    title: 'Creating a Financial Snapshot',
    type: 'guide',
    description: 'How to compile a clear picture of your assets and liabilities.',
    readTime: '15 min read',
  },
  {
    id: 'special-needs-planning',
    title: 'Special Needs Planning',
    type: 'guide',
    description: 'Protecting loved ones with disabilities.',
    readTime: '15 min read',
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

const getTypeConfig = (type: string) => {
  switch (type) {
    case 'video':
      return { color: '#9b2226', bgColor: alpha('#9b2226', 0.08), label: 'Video' };
    case 'guide':
      return { color: '#2d6a4f', bgColor: alpha('#2d6a4f', 0.08), label: 'Guide' };
    default:
      return { color: '#1e3a5f', bgColor: alpha('#1e3a5f', 0.08), label: 'Article' };
  }
};

// Animated wrapper component
const AnimatedSection: React.FC<{ children: React.ReactNode; delay?: number }> = ({
  children,
  delay = 0,
}) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <Fade in={visible} timeout={600}>
      <Box>{children}</Box>
    </Fade>
  );
};

interface MyLifeFolioHomeProps {
  onNavigateBack: () => void;
  onStartQuestionnaire: () => void;
  onEducationItemClick?: (itemId: string) => void;
  onLogin?: () => void;
  onRegister?: () => void;
  onAdmin?: () => void;
  onProfile?: () => void;
  onNavigate?: (page: string) => void;
}

const MyLifeFolioHome: React.FC<MyLifeFolioHomeProps> = ({
  onNavigateBack,
  onStartQuestionnaire,
  onEducationItemClick,
  onLogin,
  onRegister,
  onAdmin,
  onProfile,
  onNavigate,
}) => {
  const [scrolled, setScrolled] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [hasExistingData, setHasExistingData] = useState(false);
  const [createdAt, setCreatedAt] = useState<Date | null>(null);
  const { user, signOut } = useAuth();
  const { formData, loadFormData } = useFormContext();

  const handleLogout = async () => {
    await signOut();
    onNavigateBack();
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Load existing data from Supabase when component mounts
  useEffect(() => {
    const loadData = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        // Get all estate planning intakes for this user
        const intakes = await listIntakesRaw('EstatePlanning');

        if (intakes && intakes.length > 0) {
          // Find the most recently updated intake
          const mostRecent = intakes.reduce((latest, current) => {
            return new Date(current.updated_at) > new Date(latest.updated_at)
              ? current
              : latest;
          });

          // Load the full form data
          const data = await loadIntakeFromRaw(mostRecent.id);
          if (data) {
            loadFormData(data, 0);
            setHasExistingData(true);
            setCreatedAt(data.createdAt ? new Date(data.createdAt) : null);
            setLastSaved(new Date(mostRecent.updated_at));
          }
        }
      } catch (error) {
        console.error('Error loading data from Supabase:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [user, loadFormData]);

  const formatDate = (date: Date | null) => {
    if (!date) return '';
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <ThemeProvider theme={theme}>
      {/* Google Fonts */}
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=Source+Sans+3:wght@300;400;500;600;700&display=swap');
        `}
      </style>

      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
        {/* Navigation Bar */}
        <AppBar
          position="fixed"
          elevation={scrolled ? 1 : 0}
          sx={{
            bgcolor: scrolled ? 'rgba(30, 58, 95, 0.98)' : 'primary.main',
            backdropFilter: scrolled ? 'blur(12px)' : 'none',
            transition: 'all 0.3s ease',
          }}
        >
          <Toolbar
            sx={{
              py: { xs: 1, md: 1.5 },
              px: { xs: 2, md: 3 },
              minHeight: { xs: 64, md: 72 },
            }}
          >
              {/* Back Button */}
              <Button
                color="inherit"
                startIcon={<ArrowBackIcon />}
                onClick={onNavigateBack}
                sx={{
                  position: 'absolute',
                  left: 16,
                  fontWeight: 500,
                  opacity: 0.9,
                  '&:hover': {
                    opacity: 1,
                    bgcolor: 'rgba(255,255,255,0.08)',
                  },
                }}
              >
                Back
              </Button>

              {/* Logo and Firm Name - Centered */}
              <Box
                sx={{
                  flexGrow: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 1.5,
                }}
              >
                <Box
                  component="img"
                  src="/logo.jpg"
                  alt="MyLifeFolio"
                  sx={{
                    height: { xs: 36, md: 40 },
                    width: { xs: 36, md: 40 },
                    borderRadius: '50%',
                    border: '2px solid',
                    borderColor: 'secondary.main',
                    objectFit: 'cover',
                  }}
                />
                <Typography
                  sx={{
                    fontFamily: 'Georgia, "Times New Roman", serif',
                    fontWeight: 600,
                    fontSize: { xs: '1.1rem', md: '1.25rem' },
                    letterSpacing: '0.01em',
                    display: { xs: 'none', sm: 'block' },
                  }}
                >
                  MyLifeFolio
                </Typography>
              </Box>

              {/* Auth Buttons */}
              <Box sx={{ position: 'absolute', right: 16, display: 'flex', alignItems: 'center', gap: { xs: 1, md: 2 } }}>
                {user ? (
                  // User is logged in - show Profile, Admin (if admin), and Logout buttons
                  <>
                    {onProfile && (
                      <Button
                        variant="outlined"
                        onClick={onProfile}
                        startIcon={<PersonIcon />}
                        sx={{
                          borderColor: 'rgba(255,255,255,0.5)',
                          color: 'white',
                          fontWeight: 600,
                          fontSize: '0.9rem',
                          px: { xs: 2, md: 3 },
                          py: 1,
                          '&:hover': {
                            borderColor: 'white',
                            bgcolor: 'rgba(255,255,255,0.1)',
                          },
                        }}
                      >
                        Profile
                      </Button>
                    )}
                    {isAdminUser(user.email) && onAdmin && (
                      <Button
                        variant="outlined"
                        onClick={onAdmin}
                        startIcon={<AdminPanelSettingsIcon />}
                        sx={{
                          borderColor: 'rgba(255,255,255,0.5)',
                          color: 'white',
                          fontWeight: 600,
                          fontSize: '0.9rem',
                          px: { xs: 2, md: 3 },
                          py: 1,
                          '&:hover': {
                            borderColor: 'white',
                            bgcolor: 'rgba(255,255,255,0.1)',
                          },
                        }}
                      >
                        Admin
                      </Button>
                    )}
                    <Button
                      variant="contained"
                      onClick={handleLogout}
                      startIcon={<LogoutIcon />}
                      sx={{
                        bgcolor: '#d32f2f',
                        color: 'white',
                        fontWeight: 600,
                        fontSize: '0.9rem',
                        px: { xs: 2, md: 3 },
                        py: 1,
                        boxShadow: 'none',
                        '&:hover': {
                          bgcolor: '#b71c1c',
                          boxShadow: '0 4px 12px rgba(211, 47, 47, 0.3)',
                        },
                      }}
                    >
                      Logout
                    </Button>
                  </>
                ) : (
                  // User is not logged in - show Sign In and Get Started
                  <>
                    <Button
                      color="inherit"
                      onClick={onLogin}
                      sx={{
                        fontWeight: 500,
                        fontSize: '0.9rem',
                        px: { xs: 1.5, md: 2.5 },
                        py: 1,
                        minWidth: 'auto',
                        opacity: 0.9,
                        '&:hover': {
                          opacity: 1,
                          bgcolor: 'rgba(255,255,255,0.08)',
                        },
                      }}
                    >
                      Sign In
                    </Button>
                    <Button
                      variant="contained"
                      onClick={onRegister}
                      sx={{
                        bgcolor: 'secondary.main',
                        color: 'primary.dark',
                        fontWeight: 600,
                        fontSize: '0.9rem',
                        px: { xs: 2, md: 3 },
                        py: 1,
                        boxShadow: 'none',
                        '&:hover': {
                          bgcolor: 'secondary.light',
                          boxShadow: '0 4px 12px rgba(201, 162, 39, 0.3)',
                        },
                      }}
                    >
                      Get Started
                    </Button>
                  </>
                )}
              </Box>
            </Toolbar>
        </AppBar>

        {/* Page Header */}
        <Box
          sx={{
            background: 'linear-gradient(165deg, #1e3a5f 0%, #0f2744 50%, #1a3050 100%)',
            color: 'white',
            pt: { xs: 14, md: 16 },
            pb: { xs: 6, md: 8 },
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Subtle texture overlay */}
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              opacity: 0.03,
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />

          {/* Decorative elements */}
          <Box
            sx={{
              position: 'absolute',
              right: { xs: -100, md: 0 },
              top: { xs: -50, md: -30 },
              width: { xs: 200, md: 350 },
              height: { xs: 200, md: 350 },
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(201, 162, 39, 0.08) 0%, transparent 70%)',
            }}
          />

          <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
            <AnimatedSection delay={100}>
              <Typography
                component="span"
                sx={{
                  display: 'inline-block',
                  color: 'secondary.main',
                  fontWeight: 600,
                  letterSpacing: '0.2em',
                  textTransform: 'uppercase',
                  fontSize: '0.75rem',
                  mb: 2,
                }}
              >
                My Life Folio
              </Typography>
            </AnimatedSection>

            <AnimatedSection delay={200}>
              <Typography
                variant="h2"
                component="h1"
                sx={{
                  fontSize: { xs: '2rem', md: '2.75rem' },
                  mb: 2,
                }}
              >
                My Life Folio Home
              </Typography>
            </AnimatedSection>

            <AnimatedSection delay={300}>
              <Typography
                variant="body1"
                sx={{
                  opacity: 0.85,
                  maxWidth: 600,
                  fontSize: '1.1rem',
                }}
              >
                Your personal folio for organizing the things that matter most — estate plans,
                important documents, family information, and life decisions all in one secure place.
              </Typography>
            </AnimatedSection>
          </Container>
        </Box>

        {/* Main Content - Three Column Layout */}
        <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 }, mt: -4 }}>
          <Grid container spacing={3}>
            {/* Column 1: Start or Continue Intake */}
            <Grid item xs={12} md={4}>
              <AnimatedSection delay={400}>
                <Card
                  elevation={0}
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    border: '1px solid',
                    borderColor: alpha('#1e3a5f', 0.08),
                    overflow: 'hidden',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    position: 'relative',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: `0 20px 40px ${alpha('#1e3a5f', 0.12)}`,
                      borderColor: alpha('#1e3a5f', 0.3),
                    },
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: '4px',
                      background: `linear-gradient(90deg, #1e3a5f, ${alpha('#1e3a5f', 0.6)})`,
                    },
                  }}
                  onClick={onStartQuestionnaire}
                >
                  <CardContent sx={{ p: 3, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                    <Box
                      sx={{
                        width: 56,
                        height: 56,
                        borderRadius: 2,
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        mb: 2,
                        background: `linear-gradient(135deg, ${alpha('#1e3a5f', 0.1)}, ${alpha('#1e3a5f', 0.05)})`,
                        border: `1px solid ${alpha('#1e3a5f', 0.15)}`,
                      }}
                    >
                      <AssignmentIcon sx={{ fontSize: 28, color: '#1e3a5f' }} />
                    </Box>

                    <Typography
                      variant="h6"
                      component="h3"
                      sx={{
                        color: 'primary.main',
                        fontSize: '1.2rem',
                        mb: 1,
                      }}
                    >
                      {hasExistingData ? 'Continue Your Folio' : 'Start Your Folio'}
                    </Typography>

                    <Typography
                      variant="body2"
                      sx={{
                        color: 'text.secondary',
                        flexGrow: 1,
                        mb: 2,
                        lineHeight: 1.6,
                      }}
                    >
                      {hasExistingData
                        ? 'Pick up where you left off building your personal life folio.'
                        : 'Start building your folio — we\'ll gather the information needed to organize your life\'s important details.'}
                    </Typography>

                    {hasExistingData && createdAt && (
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                          mb: 2,
                          p: 1.5,
                          borderRadius: 1,
                          bgcolor: alpha('#c9a227', 0.08),
                        }}
                      >
                        <AccessTimeIcon sx={{ fontSize: 16, color: 'secondary.dark' }} />
                        <Typography variant="body2" sx={{ color: 'secondary.dark', fontWeight: 500, fontSize: '0.8rem' }}>
                          Started {formatDate(createdAt)}
                        </Typography>
                      </Box>
                    )}

                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.5,
                        color: '#1e3a5f',
                        fontWeight: 600,
                        fontSize: '0.875rem',
                      }}
                    >
                      {hasExistingData ? 'Continue Folio' : 'Begin Folio'}
                      <ArrowForwardIcon sx={{ fontSize: 18 }} />
                    </Box>
                  </CardContent>
                </Card>
              </AnimatedSection>

              {/* Data Privacy Notice */}
              <AnimatedSection delay={450}>
                <Alert
                  severity="info"
                  icon={<LockIcon sx={{ color: 'primary.main', fontSize: 20 }} />}
                  sx={{
                    mt: 2,
                    bgcolor: alpha('#1e3a5f', 0.04),
                    border: '1px solid',
                    borderColor: alpha('#1e3a5f', 0.1),
                    borderRadius: 2,
                    py: 1,
                    '& .MuiAlert-message': {
                      width: '100%',
                    },
                  }}
                >
                  <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.8rem', lineHeight: 1.5 }}>
                    Your data is secure.
                  </Typography>
                </Alert>
              </AnimatedSection>
            </Grid>

            {/* Column 2: Education Center */}
            <Grid item xs={12} md={4}>
              <AnimatedSection delay={500}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    height: '100%',
                    border: '1px solid',
                    borderColor: alpha('#2d6a4f', 0.08),
                    position: 'relative',
                    overflow: 'hidden',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: '4px',
                      background: `linear-gradient(90deg, #2d6a4f, ${alpha('#2d6a4f', 0.6)})`,
                    },
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Box
                      sx={{
                        width: 56,
                        height: 56,
                        borderRadius: 2,
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        background: `linear-gradient(135deg, ${alpha('#2d6a4f', 0.1)}, ${alpha('#2d6a4f', 0.05)})`,
                        border: `1px solid ${alpha('#2d6a4f', 0.15)}`,
                      }}
                    >
                      <SchoolIcon sx={{ color: '#2d6a4f', fontSize: 28 }} />
                    </Box>
                    <Typography
                      variant="h6"
                      sx={{
                        color: '#2d6a4f',
                        fontSize: '1.2rem',
                      }}
                    >
                      Education Center
                    </Typography>
                  </Box>

                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontSize: '0.85rem' }}>
                    Articles, videos, and guides to help you make informed decisions
                  </Typography>

                  <Divider sx={{ mb: 1 }} />

                  <List sx={{ maxHeight: 380, overflow: 'auto', mx: -1 }}>
                    {educationItems.slice(0, 6).map((item) => {
                      const typeConfig = getTypeConfig(item.type);
                      const isHovered = hoveredItem === item.id;

                      return (
                        <ListItem key={item.id} disablePadding sx={{ mb: 0.5 }}>
                          <ListItemButton
                            onClick={() => {
                              if (item.pdfUrl) {
                                window.open(item.pdfUrl, '_blank', 'noopener,noreferrer');
                              } else {
                                onEducationItemClick?.(item.id);
                              }
                            }}
                            onMouseEnter={() => setHoveredItem(item.id)}
                            onMouseLeave={() => setHoveredItem(null)}
                            sx={{
                              borderRadius: 1.5,
                              py: 1.5,
                              px: 1.5,
                              transition: 'all 0.2s ease',
                              border: '1px solid transparent',
                              '&:hover': {
                                bgcolor: alpha('#2d6a4f', 0.03),
                                borderColor: alpha('#2d6a4f', 0.08),
                              },
                            }}
                          >
                            <ListItemIcon sx={{ minWidth: 36 }}>
                              <Box
                                sx={{
                                  width: 28,
                                  height: 28,
                                  borderRadius: 1,
                                  display: 'flex',
                                  justifyContent: 'center',
                                  alignItems: 'center',
                                  bgcolor: typeConfig.bgColor,
                                  color: typeConfig.color,
                                  transition: 'transform 0.2s ease',
                                  transform: isHovered ? 'scale(1.1)' : 'scale(1)',
                                  '& svg': { fontSize: 16 },
                                }}
                              >
                                {getTypeIcon(item.type)}
                              </Box>
                            </ListItemIcon>
                            <ListItemText
                              disableTypography
                              primary={
                                <Typography
                                  variant="body2"
                                  sx={{
                                    fontWeight: 600,
                                    color: 'text.primary',
                                    fontSize: '0.85rem',
                                    lineHeight: 1.3,
                                  }}
                                >
                                  {item.title}
                                </Typography>
                              }
                              secondary={
                                <Typography
                                  variant="caption"
                                  sx={{ color: 'text.disabled', fontSize: '0.7rem' }}
                                >
                                  {item.readTime}
                                </Typography>
                              }
                            />
                          </ListItemButton>
                        </ListItem>
                      );
                    })}
                  </List>

                  <Button
                    fullWidth
                    variant="text"
                    onClick={() => onNavigate?.('education-center')}
                    endIcon={<ArrowForwardIcon sx={{ fontSize: 16 }} />}
                    sx={{
                      mt: 1,
                      color: '#2d6a4f',
                      fontWeight: 600,
                      fontSize: '0.85rem',
                      '&:hover': {
                        bgcolor: alpha('#2d6a4f', 0.05),
                      },
                    }}
                  >
                    View All Resources
                  </Button>
                </Paper>
              </AnimatedSection>
            </Grid>

            {/* Column 3: Planning Pathfinder */}
            <Grid item xs={12} md={4}>
              <AnimatedSection delay={600}>
                <Card
                  elevation={0}
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    border: '1px solid',
                    borderColor: alpha('#7b2cbf', 0.08),
                    overflow: 'hidden',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    position: 'relative',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: `0 20px 40px ${alpha('#7b2cbf', 0.12)}`,
                      borderColor: alpha('#7b2cbf', 0.3),
                    },
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: '4px',
                      background: `linear-gradient(90deg, #7b2cbf, ${alpha('#7b2cbf', 0.6)})`,
                    },
                  }}
                  onClick={() => onNavigate?.('planning-pathfinder')}
                >
                  <CardContent sx={{ p: 3, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                    <Box
                      sx={{
                        width: 56,
                        height: 56,
                        borderRadius: 2,
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        mb: 2,
                        background: `linear-gradient(135deg, ${alpha('#7b2cbf', 0.1)}, ${alpha('#7b2cbf', 0.05)})`,
                        border: `1px solid ${alpha('#7b2cbf', 0.15)}`,
                      }}
                    >
                      <ExploreIcon sx={{ fontSize: 28, color: '#7b2cbf' }} />
                    </Box>

                    <Typography
                      variant="h6"
                      component="h3"
                      sx={{
                        color: '#7b2cbf',
                        fontSize: '1.2rem',
                        mb: 1,
                      }}
                    >
                      Planning Pathfinder
                    </Typography>

                    <Typography
                      variant="body2"
                      sx={{
                        color: 'text.secondary',
                        mb: 2,
                        lineHeight: 1.6,
                      }}
                    >
                      Interactive tools to help you understand your options:
                    </Typography>

                    <Box sx={{ flexGrow: 1 }}>
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1.5,
                          mb: 2,
                          p: 1.5,
                          borderRadius: 1.5,
                          bgcolor: alpha('#7b2cbf', 0.04),
                          border: `1px solid ${alpha('#7b2cbf', 0.1)}`,
                        }}
                      >
                        <QuizIcon sx={{ fontSize: 20, color: '#7b2cbf' }} />
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary', fontSize: '0.85rem' }}>
                            Do I Need a Trust?
                          </Typography>
                          <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem' }}>
                            5-7 questions to find out
                          </Typography>
                        </Box>
                      </Box>

                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1.5,
                          mb: 2,
                          p: 1.5,
                          borderRadius: 1.5,
                          bgcolor: alpha('#7b2cbf', 0.04),
                          border: `1px solid ${alpha('#7b2cbf', 0.1)}`,
                        }}
                      >
                        <CalculateIcon sx={{ fontSize: 20, color: '#7b2cbf' }} />
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary', fontSize: '0.85rem' }}>
                            IRA RMD Calculator
                          </Typography>
                          <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem' }}>
                            Required minimum distribution
                          </Typography>
                        </Box>
                      </Box>
                    </Box>

                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.5,
                        color: '#7b2cbf',
                        fontWeight: 600,
                        fontSize: '0.875rem',
                        mt: 'auto',
                      }}
                    >
                      Explore Tools
                      <ArrowForwardIcon sx={{ fontSize: 18 }} />
                    </Box>
                  </CardContent>
                </Card>
              </AnimatedSection>
            </Grid>
          </Grid>
        </Container>

        {/* Footer */}
        <Box sx={{ bgcolor: '#0a1929', color: 'white', py: 4, mt: 6 }}>
          <Container maxWidth="lg">
            <Box
              sx={{
                display: 'flex',
                flexDirection: { xs: 'column', md: 'row' },
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: 2,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <BalanceIcon sx={{ fontSize: 24, color: 'secondary.main' }} />
                <Typography
                  sx={{
                    fontFamily: '"Playfair Display", serif',
                    fontWeight: 500,
                    fontSize: '1rem',
                  }}
                >
                  MyLifeFolio
                </Typography>
              </Box>

              <Typography variant="body2" sx={{ opacity: 0.6, textAlign: 'center' }}>
                26811 South Bay Dr. Ste 260, Bonita Springs, FL 34134 | (239) 345-4545
              </Typography>

              <Typography variant="body2" sx={{ opacity: 0.5 }}>
                © {new Date().getFullYear()} All rights reserved.
              </Typography>
            </Box>
          </Container>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default MyLifeFolioHome;