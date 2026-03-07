'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  Grid,
  AppBar,
  Toolbar,
  Button,
  Fade,
  Paper,
  Chip,
} from '@mui/material';
import { ThemeProvider, createTheme, alpha } from '@mui/material/styles';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ExploreIcon from '@mui/icons-material/Explore';
import QuizIcon from '@mui/icons-material/Quiz';
import CalculateIcon from '@mui/icons-material/Calculate';
import BalanceIcon from '@mui/icons-material/Balance';
import LogoutIcon from '@mui/icons-material/Logout';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import PeopleIcon from '@mui/icons-material/People';
import ConstructionIcon from '@mui/icons-material/Construction';
import { useAuth } from '../lib/AuthContext';
import IraRmdCalculator from './IraRmdCalculator';
import { TrustQuiz } from './TrustQuiz';

// Helper to check if user is an admin (email domain is mylifefolio.com)
const isAdminUser = (email: string | undefined): boolean => {
  if (!email) return false;
  const domain = email.split('@')[1];
  return domain === 'mylifefolio.com';
};

// Custom theme matching other pages
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
  },
});

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

interface PlanningPathfinderProps {
  onNavigateBack: () => void;
  onLogin?: () => void;
  onRegister?: () => void;
  onAdmin?: () => void;
  onProfile?: () => void;
}

const PlanningPathfinder: React.FC<PlanningPathfinderProps> = ({
  onNavigateBack,
  onLogin,
  onRegister,
  onAdmin,
  onProfile,
}) => {
  const [scrolled, setScrolled] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
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

  const tools = [
    {
      id: 'trust-quiz',
      title: 'Do I Need a Trust?',
      description: 'Answer a few questions to determine if a trust is right for your situation.',
      icon: <QuizIcon sx={{ fontSize: 28 }} />,
      color: '#7b2cbf',
      available: true,
    },
    {
      id: 'ira-rmd',
      title: 'IRA RMD Calculator',
      description: 'Calculate your Required Minimum Distribution based on IRS guidelines.',
      icon: <CalculateIcon sx={{ fontSize: 28 }} />,
      color: '#7b2cbf',
      available: true,
    },
  ];

  const handleScheduleConsultation = () => {
    // Open Calendly or contact page in new tab
    window.open('https://calendly.com/mylifefolio', '_blank');
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
                <>
                  {onProfile && (
                    <Button
                      variant="outlined"
                      onClick={onProfile}
                      startIcon={<PeopleIcon />}
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
                      Family Access
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
            background: 'linear-gradient(165deg, #7b2cbf 0%, #5a189a 50%, #3c096c 100%)',
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
              background: 'radial-gradient(circle, rgba(255, 255, 255, 0.08) 0%, transparent 70%)',
            }}
          />

          <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
            <AnimatedSection delay={100}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Box
                  sx={{
                    width: 56,
                    height: 56,
                    borderRadius: 2,
                    bgcolor: alpha('#ffffff', 0.15),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <ExploreIcon sx={{ fontSize: 32, color: 'white' }} />
                </Box>
                <Typography
                  component="span"
                  sx={{
                    color: alpha('#ffffff', 0.9),
                    fontWeight: 600,
                    letterSpacing: '0.2em',
                    textTransform: 'uppercase',
                    fontSize: '0.75rem',
                  }}
                >
                  Interactive Planning Tools
                </Typography>
              </Box>
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
                Planning Pathfinder
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
                Use our interactive tools to help guide your estate planning decisions.
                These calculators and questionnaires provide helpful starting points for your planning journey.
              </Typography>
            </AnimatedSection>
          </Container>
        </Box>

        {/* Main Content with Left Sidebar */}
        <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 }, mt: -3 }}>
          <Grid container spacing={3}>
            {/* Left Sidebar - Tools Navigation */}
            <Grid item xs={12} md={3}>
              <AnimatedSection delay={100}>
                <Paper
                  elevation={0}
                  sx={{
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: alpha('#7b2cbf', 0.15),
                    overflow: 'hidden',
                    position: { md: 'sticky' },
                    top: { md: 100 },
                  }}
                >
                  <Box
                    sx={{
                      p: 2,
                      bgcolor: alpha('#7b2cbf', 0.03),
                      borderBottom: '1px solid',
                      borderColor: alpha('#7b2cbf', 0.1),
                    }}
                  >
                    <Typography
                      variant="subtitle2"
                      sx={{
                        color: '#7b2cbf',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.1em',
                        fontSize: '0.7rem',
                      }}
                    >
                      Planning Tools
                    </Typography>
                  </Box>

                  {tools.map((tool, index) => {
                    const isSelected = activeTab === index;
                    return (
                      <Box
                        key={tool.id}
                        onClick={() => tool.available && setActiveTab(index)}
                        sx={{
                          p: 2,
                          cursor: tool.available ? 'pointer' : 'default',
                          opacity: tool.available ? 1 : 0.6,
                          bgcolor: isSelected ? alpha('#7b2cbf', 0.08) : 'transparent',
                          borderLeft: isSelected ? '3px solid #7b2cbf' : '3px solid transparent',
                          transition: 'all 0.2s ease',
                          '&:hover': tool.available ? {
                            bgcolor: alpha('#7b2cbf', 0.05),
                          } : {},
                          borderBottom: index < tools.length - 1 ? '1px solid' : 'none',
                          borderBottomColor: alpha('#7b2cbf', 0.08),
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                          <Box
                            sx={{
                              width: 40,
                              height: 40,
                              borderRadius: 1.5,
                              bgcolor: isSelected ? alpha('#7b2cbf', 0.15) : alpha('#7b2cbf', 0.08),
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: '#7b2cbf',
                              flexShrink: 0,
                              transition: 'all 0.2s ease',
                              '& svg': { fontSize: 22 },
                            }}
                          >
                            {tool.icon}
                          </Box>
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography
                              variant="body2"
                              sx={{
                                fontWeight: isSelected ? 700 : 600,
                                color: isSelected ? '#7b2cbf' : 'text.primary',
                                fontSize: '0.9rem',
                                lineHeight: 1.3,
                                mb: 0.5,
                              }}
                            >
                              {tool.title}
                            </Typography>
                            {!tool.available && (
                              <Chip
                                label="Coming Soon"
                                size="small"
                                sx={{
                                  height: 18,
                                  fontSize: '0.6rem',
                                  bgcolor: alpha('#7b2cbf', 0.1),
                                  color: '#7b2cbf',
                                }}
                              />
                            )}
                            {tool.available && (
                              <Typography
                                variant="caption"
                                sx={{
                                  color: 'text.secondary',
                                  fontSize: '0.75rem',
                                  lineHeight: 1.4,
                                  display: 'block',
                                }}
                              >
                                {tool.description}
                              </Typography>
                            )}
                          </Box>
                        </Box>
                      </Box>
                    );
                  })}
                </Paper>
              </AnimatedSection>
            </Grid>

            {/* Right Content Area */}
            <Grid item xs={12} md={9}>
              {/* Trust Quiz */}
              {activeTab === 0 && (
                <AnimatedSection delay={200}>
                  <TrustQuiz onScheduleConsultation={handleScheduleConsultation} />
                </AnimatedSection>
              )}

              {/* IRA RMD Calculator */}
              {activeTab === 1 && (
                <AnimatedSection delay={200}>
                  <IraRmdCalculator />
                </AnimatedSection>
              )}
            </Grid>
          </Grid>
        </Container>

        {/* Footer */}
        <Box sx={{ bgcolor: '#0a1929', color: 'white', py: 4 }}>
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
                26811 South Bay Dr. Ste 270, Bonita Springs, FL 34134 | (239) 345-4545
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

export default PlanningPathfinder;
