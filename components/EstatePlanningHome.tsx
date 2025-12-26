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
import { useAuth } from '../lib/AuthContext';

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
    id: 'what-is-estate-planning',
    title: 'What is Estate Planning?',
    type: 'article',
    description: 'Learn the basics of estate planning and why it matters.',
    readTime: '5 min read',
  },
  {
    id: 'how-assets-pass',
    title: 'How Assets Pass at Death',
    type: 'article',
    description: 'Understanding probate, joint ownership, beneficiary designations, and life estates.',
    readTime: '7 min read',
    pdfUrl: '/articles/HowAssetsPass.pdf',
  },
  {
    id: 'wills-vs-trusts',
    title: 'Wills vs. Trusts: Understanding the Difference',
    type: 'article',
    description: 'Compare wills and trusts to determine which is right for you.',
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
    description: 'Ensure your healthcare wishes are honored.',
    readTime: '6 min read',
  },
  {
    id: 'probate-process',
    title: 'The Probate Process in Florida',
    type: 'article',
    description: 'What to expect during Florida probate.',
    readTime: '10 min read',
  },
  {
    id: 'avoiding-probate',
    title: 'Strategies to Avoid Probate',
    type: 'video',
    description: 'Learn how to structure your estate to avoid probate.',
    readTime: '15 min watch',
  },
  {
    id: 'trust-administration',
    title: 'Trust Administration Guide',
    type: 'guide',
    description: 'A comprehensive guide for successor trustees.',
    readTime: '20 min read',
  },
  {
    id: 'beneficiary-designations',
    title: 'Beneficiary Designations: Common Mistakes',
    type: 'article',
    description: 'Avoid costly errors with beneficiary designations.',
    readTime: '7 min read',
  },
  {
    id: 'estate-tax-basics',
    title: 'Estate Tax Basics',
    type: 'article',
    description: 'Understanding federal and state estate taxes.',
    readTime: '9 min read',
    pdfUrl: '/articles/EstateTaxation.pdf',
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
  const [scrolled, setScrolled] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const { user, signOut } = useAuth();

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

  // Check if there's existing questionnaire data
  const { hasExistingData, createdAt } = useMemo(() => {
    if (typeof window === 'undefined') return { hasExistingData: false, createdAt: null };
    try {
      const stored = localStorage.getItem('estate-planning-form-data');
      if (!stored) return { hasExistingData: false, createdAt: null };
      const data = JSON.parse(stored);
      const hasData = data && (data.name || data.spouseName || data.children?.length > 0);
      return {
        hasExistingData: hasData,
        createdAt: data?.createdAt ? new Date(data.createdAt) : null,
      };
    } catch {
      return { hasExistingData: false, createdAt: null };
    }
  }, []);

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
          <Container maxWidth="lg">
            <Toolbar
              disableGutters
              sx={{
                py: { xs: 1, md: 1.5 },
                minHeight: { xs: 64, md: 72 },
              }}
            >
              {/* Back Button */}
              <Button
                color="inherit"
                startIcon={<ArrowBackIcon />}
                onClick={onNavigateBack}
                sx={{
                  mr: 3,
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

              {/* Logo and Firm Name */}
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                }}
              >
                <Box
                  component="img"
                  src="/logo.jpg"
                  alt="Zacharia Brown & Bratkovich"
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
                  Zacharia Brown & Bratkovich
                </Typography>
              </Box>

              {/* Spacer */}
              <Box sx={{ flexGrow: 1 }} />

              {/* Auth Buttons */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, md: 2 } }}>
                {user ? (
                  // User is logged in - show Logout button
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
          </Container>
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
                Estate Planning
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
                Estate Planning Center
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
                Explore our educational resources to better understand estate planning, then
                complete your intake questionnaire to get started.
              </Typography>
            </AnimatedSection>
          </Container>
        </Box>

        {/* Main Content */}
        <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 }, mt: -4 }}>
          <Grid container spacing={4}>
            {/* Left Column - Education Center */}
            <Grid item xs={12} md={7}>
              <AnimatedSection delay={400}>
                <Paper
                  elevation={0}
                  sx={{
                    p: { xs: 3, md: 4 },
                    height: '100%',
                    border: '1px solid',
                    borderColor: alpha('#1e3a5f', 0.08),
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: 2,
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        background: `linear-gradient(135deg, ${alpha('#1e3a5f', 0.1)}, ${alpha('#1e3a5f', 0.05)})`,
                        border: `1px solid ${alpha('#1e3a5f', 0.1)}`,
                      }}
                    >
                      <SchoolIcon sx={{ color: 'primary.main', fontSize: 24 }} />
                    </Box>
                    <Box>
                      <Typography
                        variant="h5"
                        sx={{
                          color: 'primary.main',
                          fontSize: '1.5rem',
                        }}
                      >
                        Education Center
                      </Typography>
                    </Box>
                  </Box>

                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3, ml: 8 }}>
                    Explore our resources to better understand estate planning concepts
                  </Typography>

                  <Divider sx={{ mb: 2 }} />

                  <List sx={{ maxHeight: 520, overflow: 'auto', mx: -1 }}>
                    {educationItems.map((item) => {
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
                              borderRadius: 2,
                              py: 2,
                              px: 2,
                              transition: 'all 0.2s ease',
                              border: '1px solid transparent',
                              '&:hover': {
                                bgcolor: alpha('#1e3a5f', 0.03),
                                borderColor: alpha('#1e3a5f', 0.08),
                              },
                            }}
                          >
                            <ListItemIcon sx={{ minWidth: 44 }}>
                              <Box
                                sx={{
                                  width: 36,
                                  height: 36,
                                  borderRadius: 1.5,
                                  display: 'flex',
                                  justifyContent: 'center',
                                  alignItems: 'center',
                                  bgcolor: typeConfig.bgColor,
                                  color: typeConfig.color,
                                  transition: 'transform 0.2s ease',
                                  transform: isHovered ? 'scale(1.1)' : 'scale(1)',
                                }}
                              >
                                {getTypeIcon(item.type)}
                              </Box>
                            </ListItemIcon>
                            <ListItemText
                              disableTypography
                              primary={
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
                                  <Typography
                                    variant="body1"
                                    component="span"
                                    sx={{
                                      fontWeight: 600,
                                      color: 'text.primary',
                                      fontSize: '0.95rem',
                                    }}
                                  >
                                    {item.title}
                                  </Typography>
                                  <Chip
                                    label={typeConfig.label}
                                    size="small"
                                    sx={{
                                      height: 22,
                                      fontSize: '0.7rem',
                                      fontWeight: 600,
                                      bgcolor: typeConfig.bgColor,
                                      color: typeConfig.color,
                                      border: 'none',
                                    }}
                                  />
                                </Box>
                              }
                              secondary={
                                <Box>
                                  <Typography
                                    variant="body2"
                                    component="span"
                                    sx={{ color: 'text.secondary', mb: 0.5, display: 'block' }}
                                  >
                                    {item.description}
                                  </Typography>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    <AccessTimeIcon sx={{ fontSize: 14, color: 'text.disabled' }} />
                                    <Typography
                                      variant="caption"
                                      component="span"
                                      sx={{ color: 'text.disabled' }}
                                    >
                                      {item.readTime}
                                    </Typography>
                                  </Box>
                                </Box>
                              }
                            />
                            <ArrowForwardIcon
                              sx={{
                                fontSize: 18,
                                color: 'text.disabled',
                                opacity: isHovered ? 1 : 0,
                                transform: isHovered ? 'translateX(0)' : 'translateX(-8px)',
                                transition: 'all 0.2s ease',
                              }}
                            />
                          </ListItemButton>
                        </ListItem>
                      );
                    })}
                  </List>
                </Paper>
              </AnimatedSection>
            </Grid>

            {/* Right Column - Intake Questionnaire Card */}
            <Grid item xs={12} md={5}>
              <AnimatedSection delay={500}>
                <Card
                  elevation={0}
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    border: '1px solid',
                    borderColor: alpha('#1e3a5f', 0.08),
                    overflow: 'hidden',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: `0 20px 40px ${alpha('#1e3a5f', 0.12)}`,
                      borderColor: alpha('#c9a227', 0.3),
                    },
                  }}
                >
                  <Box
                    sx={{
                      height: 180,
                      background: 'linear-gradient(135deg, #1e3a5f 0%, #0f2744 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative',
                      overflow: 'hidden',
                    }}
                  >
                    {/* Decorative circles */}
                    <Box
                      sx={{
                        position: 'absolute',
                        top: -60,
                        right: -60,
                        width: 180,
                        height: 180,
                        borderRadius: '50%',
                        background: 'radial-gradient(circle, rgba(201, 162, 39, 0.15) 0%, transparent 70%)',
                      }}
                    />
                    <Box
                      sx={{
                        position: 'absolute',
                        bottom: -40,
                        left: -40,
                        width: 140,
                        height: 140,
                        borderRadius: '50%',
                        background: 'radial-gradient(circle, rgba(255, 255, 255, 0.05) 0%, transparent 70%)',
                      }}
                    />

                    {/* Icon container */}
                    <Box
                      sx={{
                        width: 80,
                        height: 80,
                        borderRadius: '50%',
                        bgcolor: alpha('#ffffff', 0.1),
                        border: `2px solid ${alpha('#c9a227', 0.3)}`,
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        zIndex: 1,
                      }}
                    >
                      <DescriptionIcon sx={{ fontSize: 40, color: 'secondary.main' }} />
                    </Box>
                  </Box>

                  <CardContent sx={{ p: 4 }}>
                    <Typography
                      variant="h5"
                      component="h2"
                      sx={{
                        color: 'primary.main',
                        mb: 1.5,
                        fontSize: '1.4rem',
                      }}
                    >
                      {hasExistingData ? 'Continue Your Intake' : 'Start Your Intake'}
                    </Typography>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 2, lineHeight: 1.7 }}
                    >
                      {hasExistingData
                        ? 'Pick up where you left off on your estate planning questionnaire.'
                        : 'Begin your estate planning questionnaire to help us understand your needs and goals.'}
                    </Typography>

                    {hasExistingData && createdAt && (
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                          mb: 3,
                          p: 1.5,
                          borderRadius: 1,
                          bgcolor: alpha('#c9a227', 0.08),
                        }}
                      >
                        <AccessTimeIcon sx={{ fontSize: 18, color: 'secondary.dark' }} />
                        <Typography variant="body2" sx={{ color: 'secondary.dark', fontWeight: 500 }}>
                          Started on {formatDate(createdAt)}
                        </Typography>
                      </Box>
                    )}

                    <Button
                      variant="contained"
                      fullWidth
                      size="large"
                      onClick={onStartQuestionnaire}
                      endIcon={hasExistingData ? <EditIcon /> : <ArrowForwardIcon />}
                      sx={{
                        bgcolor: 'secondary.main',
                        color: 'primary.dark',
                        py: 1.5,
                        fontSize: '1rem',
                        fontWeight: 600,
                        boxShadow: 'none',
                        '&:hover': {
                          bgcolor: 'secondary.light',
                          boxShadow: '0 8px 24px rgba(201, 162, 39, 0.3)',
                        },
                      }}
                    >
                      {hasExistingData ? 'Continue Questionnaire' : 'Begin Questionnaire'}
                    </Button>
                  </CardContent>
                </Card>
              </AnimatedSection>

              {/* Data Privacy Notice */}
              <AnimatedSection delay={600}>
                <Alert
                  severity="info"
                  icon={<LockIcon sx={{ color: 'primary.main' }} />}
                  sx={{
                    mt: 3,
                    bgcolor: alpha('#1e3a5f', 0.04),
                    border: '1px solid',
                    borderColor: alpha('#1e3a5f', 0.1),
                    borderRadius: 2,
                    '& .MuiAlert-message': {
                      width: '100%',
                    },
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: 600, mb: 0.5, color: 'primary.main' }}
                  >
                    Your Data is Secure
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.6 }}>
                    Information is stored locally on this device only. Your data will not be
                    transmitted until you complete and submit the questionnaire.
                  </Typography>
                </Alert>
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
                  Zacharia Brown & Bratkovich
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

export default EstatePlanningHome;