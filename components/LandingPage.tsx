'use client';

import React, { useEffect, useState, useMemo } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  AppBar,
  Toolbar,
  Fade,
  Slide,
  useScrollTrigger,
  Divider,
  IconButton,
  Link,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { ThemeProvider, createTheme, alpha } from '@mui/material/styles';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import HealthAndSafetyIcon from '@mui/icons-material/HealthAndSafety';
import AssignmentIcon from '@mui/icons-material/Assignment';
import FamilyRestroomIcon from '@mui/icons-material/FamilyRestroom';
import LoginIcon from '@mui/icons-material/Login';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import PhoneIcon from '@mui/icons-material/Phone';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import EmailIcon from '@mui/icons-material/Email';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ShieldIcon from '@mui/icons-material/Shield';
import GavelIcon from '@mui/icons-material/Gavel';
import BalanceIcon from '@mui/icons-material/Balance';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import CloseIcon from '@mui/icons-material/Close';
import LogoutIcon from '@mui/icons-material/Logout';
import { useAuth } from '../lib/AuthContext';

// Custom theme with sophisticated typography and colors
const theme = createTheme({
  palette: {
    primary: {
      main: '#1e3a5f', // Deep sophisticated navy
      light: '#2d5a8e',
      dark: '#0f2744',
    },
    secondary: {
      main: '#c9a227', // Warm gold accent
      light: '#e8c547',
      dark: '#9a7b1a',
    },
    background: {
      default: '#faf9f7', // Warm off-white
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
      fontFamily: '"Source Sans 3", sans-serif',
      fontWeight: 600,
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

// Animated component wrapper
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
    <Fade in={visible} timeout={800}>
      <Box sx={{ transform: visible ? 'translateY(0)' : 'translateY(20px)', transition: 'transform 0.6s ease-out' }}>
        {children}
      </Box>
    </Fade>
  );
};

interface ServiceCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  accentColor: string;
  onClick?: () => void;
  disabled?: boolean;
  delay?: number;
}

const ServiceCard: React.FC<ServiceCardProps> = ({
  title,
  description,
  icon,
  accentColor,
  onClick,
  disabled = false,
  delay = 0,
}) => {
  const [visible, setVisible] = useState(false);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <Fade in={visible} timeout={600}>
      <Card
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          overflow: 'hidden',
          cursor: disabled ? 'default' : 'pointer',
          opacity: disabled ? 0.7 : 1,
          transition: 'all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)',
          border: '1px solid',
          borderColor: hovered && !disabled ? alpha(accentColor, 0.3) : 'transparent',
          transform: hovered && !disabled ? 'translateY(-8px)' : 'translateY(0)',
          boxShadow: hovered && !disabled
            ? `0 20px 40px ${alpha(accentColor, 0.15)}`
            : '0 4px 24px rgba(0,0,0,0.06)',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: `linear-gradient(90deg, ${accentColor}, ${alpha(accentColor, 0.6)})`,
            transform: hovered && !disabled ? 'scaleX(1)' : 'scaleX(0)',
            transformOrigin: 'left',
            transition: 'transform 0.4s ease',
          },
        }}
        onClick={disabled ? undefined : onClick}
      >
        <CardContent sx={{ p: 4, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
          <Box
            sx={{
              width: 64,
              height: 64,
              borderRadius: 2,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              mb: 3,
              background: `linear-gradient(135deg, ${alpha(accentColor, 0.1)}, ${alpha(accentColor, 0.05)})`,
              border: `1px solid ${alpha(accentColor, 0.15)}`,
              transition: 'all 0.3s ease',
              transform: hovered && !disabled ? 'scale(1.05)' : 'scale(1)',
            }}
          >
            <Box sx={{ color: accentColor, display: 'flex' }}>{icon}</Box>
          </Box>

          <Typography
            variant="h6"
            component="h3"
            gutterBottom
            sx={{
              color: 'text.primary',
              fontSize: '1.25rem',
              mb: 2,
            }}
          >
            {title}
          </Typography>

          <Typography
            variant="body2"
            sx={{
              color: 'text.secondary',
              flexGrow: 1,
              mb: 2,
            }}
          >
            {description}
          </Typography>

          {disabled ? (
            <Typography
              variant="caption"
              sx={{
                color: 'text.secondary',
                fontStyle: 'italic',
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
              }}
            >
              Coming Soon
            </Typography>
          ) : (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                color: accentColor,
                fontWeight: 600,
                fontSize: '0.875rem',
                transition: 'gap 0.3s ease',
                '&:hover': { gap: 1 },
              }}
            >
              Begin Intake
              <ArrowForwardIcon sx={{ fontSize: 18 }} />
            </Box>
          )}
        </CardContent>
      </Card>
    </Fade>
  );
};

// Trust indicator component
const TrustIndicator: React.FC<{ icon: React.ReactNode; text: string; delay: number }> = ({
  icon,
  text,
  delay,
}) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <Fade in={visible} timeout={500}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          px: 3,
          py: 1.5,
          borderRadius: 1,
          bgcolor: alpha('#ffffff', 0.1),
          backdropFilter: 'blur(10px)',
        }}
      >
        <Box sx={{ color: 'secondary.main', display: 'flex' }}>{icon}</Box>
        <Typography variant="body2" sx={{ color: 'white', fontWeight: 500 }}>
          {text}
        </Typography>
      </Box>
    </Fade>
  );
};

interface LandingPageProps {
  onNavigate: (page: string) => void;
  onLogin?: () => void;
  onRegister?: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onNavigate, onLogin, onRegister }) => {
  const [scrolled, setScrolled] = useState(false);
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const { user, signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
    onNavigate('landing');
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Check if user has existing estate planning data in localStorage
  const hasExistingData = useMemo(() => {
    if (typeof window === 'undefined') return false;
    try {
      const hasStep = localStorage.getItem('estate-planning-current-step') !== null;
      const hasData = localStorage.getItem('estate-planning-form-data') !== null;
      const hasVersion = localStorage.getItem('estate-planning-schema-version') !== null;
      return hasStep && hasData && hasVersion;
    } catch {
      return false;
    }
  }, []);

  // Determine button text and action based on auth state and localStorage
  const primaryButtonConfig = useMemo(() => {
    if (user) {
      // User is authenticated - go to estate planning overview
      return {
        text: 'Continue to Your Estate Plan',
        icon: <ArrowForwardIcon />,
        onClick: () => onNavigate('estate-planning-home'),
      };
    } else if (hasExistingData) {
      // Not logged in but has existing data - prompt to login
      return {
        text: 'Login to Your Account',
        icon: <LoginIcon />,
        onClick: onLogin,
      };
    } else {
      // No data and not logged in - prompt to register
      return {
        text: 'Signup for New Account',
        icon: <PersonAddIcon />,
        onClick: onRegister,
      };
    }
  }, [user, hasExistingData, onNavigate, onLogin, onRegister]);

  const services = [
    {
      title: 'Estate Planning',
      description:
        'Create a comprehensive estate plan including wills, trusts, powers of attorney, and advance directives to protect your family and preserve your legacy.',
      icon: <AccountBalanceIcon sx={{ fontSize: 32 }} />,
      accentColor: '#1e3a5f',
      onClick: () => onNavigate('estate-planning-home'),
      disabled: false,
    },
    {
      title: 'Long-Term Care Planning',
      description:
        'Develop strategies to protect your assets while ensuring access to quality care. Plan ahead for nursing home, assisted living, or in-home care needs.',
      icon: <HealthAndSafetyIcon sx={{ fontSize: 32 }} />,
      accentColor: '#2d6a4f',
      onClick: () => onNavigate('long-term-care'),
      disabled: true,
    },
    {
      title: 'Medicaid Applications',
      description:
        'Navigate the complex Medicaid application process with experienced guidance. We help you qualify for benefits while preserving assets for your family.',
      icon: <AssignmentIcon sx={{ fontSize: 32 }} />,
      accentColor: '#9b2226',
      onClick: () => onNavigate('medicaid'),
      disabled: true,
    },
    {
      title: 'Estate Administration',
      description:
        'Settle estates with confidence and care. We guide executors, personal representatives, and trustees through probate and trust administration.',
      icon: <FamilyRestroomIcon sx={{ fontSize: 32 }} />,
      accentColor: '#7b2cbf',
      onClick: () => onNavigate('estate-administration'),
      disabled: true,
    },
    {
      title: 'Guardianships',
      description:
        'Protect vulnerable loved ones through guardianship proceedings. We assist families in establishing guardianship for incapacitated adults or minor children.',
      icon: <ShieldIcon sx={{ fontSize: 32 }} />,
      accentColor: '#0077b6',
      onClick: () => onNavigate('guardianships'),
      disabled: true,
    },
  ];

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
          elevation={1}
          sx={{
            bgcolor: 'rgba(30, 58, 95, 0.98)',
            backdropFilter: 'blur(12px)',
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
              {/* Logo and Firm Name */}
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  cursor: 'pointer',
                }}
                onClick={() => onNavigate('home')}
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

              {/* Auth Buttons - Minimal and clean */}
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
        </AppBar>

        {/* Hero Section */}
        <Box
          sx={{
            background: 'linear-gradient(165deg, #1e3a5f 0%, #0f2744 50%, #1a3050 100%)',
            color: 'white',
            pt: { xs: 14, md: 18 },
            pb: { xs: 10, md: 14 },
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
              right: { xs: -150, md: -50 },
              top: { xs: -100, md: -80 },
              width: { xs: 300, md: 500 },
              height: { xs: 300, md: 500 },
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(201, 162, 39, 0.08) 0%, transparent 70%)',
            }}
          />
          <Box
            sx={{
              position: 'absolute',
              left: { xs: -100, md: -50 },
              bottom: { xs: -100, md: -100 },
              width: { xs: 250, md: 400 },
              height: { xs: 250, md: 400 },
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(255, 255, 255, 0.03) 0%, transparent 70%)',
            }}
          />

          <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
            <Grid container spacing={6} alignItems="center">
              <Grid item xs={12} md={7}>
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
                    Trusted Counsel Since 1990
                  </Typography>
                </AnimatedSection>

                <AnimatedSection delay={200}>
                  <Typography
                    variant="h1"
                    component="h1"
                    sx={{
                      fontSize: { xs: '2.5rem', md: '3.5rem', lg: '4rem' },
                      lineHeight: 1.1,
                      mb: 3,
                    }}
                  >
                    Protecting What
                    <Box
                      component="span"
                      sx={{
                        display: 'block',
                        color: 'secondary.main',
                      }}
                    >
                      Matters Most
                    </Box>
                  </Typography>
                </AnimatedSection>

                <AnimatedSection delay={300}>
                  <Typography
                    variant="body1"
                    sx={{
                      mb: 4,
                      maxWidth: 520,
                      opacity: 0.85,
                      fontSize: '1.15rem',
                      lineHeight: 1.8,
                    }}
                  >
                    At Zacharia Brown & Bratkovich, we understand that planning for the future
                    requires trust, expertise, and a personal approach. Our experienced attorneys
                    guide you through every step, ensuring your wishes are honored and your loved
                    ones protected.
                  </Typography>
                </AnimatedSection>

                <AnimatedSection delay={400}>
                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 5 }}>
                    <Button
                      variant="contained"
                      size="large"
                      onClick={primaryButtonConfig.onClick}
                      endIcon={primaryButtonConfig.icon}
                      sx={{
                        bgcolor: 'secondary.main',
                        color: 'primary.dark',
                        px: 4,
                        py: 1.5,
                        fontSize: '1rem',
                        '&:hover': {
                          bgcolor: 'secondary.light',
                          transform: 'translateY(-2px)',
                          boxShadow: '0 8px 24px rgba(201, 162, 39, 0.3)',
                        },
                        transition: 'all 0.3s ease',
                      }}
                    >
                      {primaryButtonConfig.text}
                    </Button>
                    <Button
                      variant="outlined"
                      size="large"
                      onClick={() => setVideoModalOpen(true)}
                      startIcon={<PlayCircleOutlineIcon />}
                      sx={{
                        borderColor: 'rgba(255,255,255,0.4)',
                        color: 'white',
                        px: 4,
                        py: 1.5,
                        '&:hover': {
                          borderColor: 'white',
                          bgcolor: 'rgba(255,255,255,0.05)',
                        },
                      }}
                    >
                      Show Demonstration
                    </Button>
                  </Box>
                </AnimatedSection>

                {/* Trust indicators */}
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <TrustIndicator
                    icon={<ShieldIcon sx={{ fontSize: 20 }} />}
                    text="30+ Years Experience"
                    delay={500}
                  />
                  <TrustIndicator
                    icon={<GavelIcon sx={{ fontSize: 20 }} />}
                    text="Florida & Pennsylvania Licensed"
                    delay={600}
                  />
                </Box>
              </Grid>

              <Grid item xs={12} md={5} sx={{ display: { xs: 'none', md: 'block' } }}>
                <AnimatedSection delay={500}>
                  <Box
                    sx={{
                      position: 'relative',
                      height: 400,
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  >
                    {/* Decorative legal imagery placeholder */}
                    <Box
                      sx={{
                        width: 280,
                        height: 280,
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, rgba(201, 162, 39, 0.15) 0%, rgba(201, 162, 39, 0.05) 100%)',
                        border: '2px solid rgba(201, 162, 39, 0.2)',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        position: 'relative',
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          inset: -20,
                          borderRadius: '50%',
                          border: '1px solid rgba(201, 162, 39, 0.1)',
                        },
                        '&::after': {
                          content: '""',
                          position: 'absolute',
                          inset: -40,
                          borderRadius: '50%',
                          border: '1px solid rgba(201, 162, 39, 0.05)',
                        },
                      }}
                    >
                      <BalanceIcon sx={{ fontSize: 100, color: 'secondary.main', opacity: 0.6 }} />
                    </Box>
                  </Box>
                </AnimatedSection>
              </Grid>
            </Grid>
          </Container>
        </Box>

        {/* Services Section */}
        <Container maxWidth="lg" sx={{ py: { xs: 8, md: 12 } }}>
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <AnimatedSection delay={100}>
              <Typography
                component="span"
                sx={{
                  display: 'inline-block',
                  color: 'secondary.dark',
                  fontWeight: 600,
                  letterSpacing: '0.2em',
                  textTransform: 'uppercase',
                  fontSize: '0.75rem',
                  mb: 2,
                }}
              >
                How We Can Help
              </Typography>
            </AnimatedSection>

            <AnimatedSection delay={200}>
              <Typography
                variant="h2"
                component="h2"
                sx={{
                  color: 'primary.main',
                  fontSize: { xs: '2rem', md: '2.75rem' },
                  mb: 2,
                }}
              >
                Our Practice Areas
              </Typography>
            </AnimatedSection>

            <AnimatedSection delay={300}>
              <Typography
                variant="body1"
                color="text.secondary"
                sx={{ maxWidth: 600, mx: 'auto' }}
              >
                Select a practice area below to begin your intake questionnaire. Your information
                helps us understand your unique situation before your consultation.
              </Typography>
            </AnimatedSection>
          </Box>

          <Grid container spacing={4}>
            {services.map((service, index) => (
              <Grid item xs={12} sm={6} lg={3} key={index}>
                <ServiceCard {...service} delay={400 + index * 100} />
              </Grid>
            ))}
          </Grid>
        </Container>

        {/* Why Choose Us Section */}
        <Box sx={{ bgcolor: 'white', py: { xs: 8, md: 10 } }}>
          <Container maxWidth="lg">
            <Grid container spacing={6} alignItems="center">
              <Grid item xs={12} md={5}>
                <AnimatedSection delay={100}>
                  <Typography
                    component="span"
                    sx={{
                      display: 'inline-block',
                      color: 'secondary.dark',
                      fontWeight: 600,
                      letterSpacing: '0.2em',
                      textTransform: 'uppercase',
                      fontSize: '0.75rem',
                      mb: 2,
                    }}
                  >
                    Why Choose Us
                  </Typography>
                </AnimatedSection>

                <AnimatedSection delay={200}>
                  <Typography
                    variant="h3"
                    sx={{
                      color: 'primary.main',
                      fontSize: { xs: '1.75rem', md: '2.25rem' },
                      mb: 3,
                    }}
                  >
                    Experience That Makes a Difference
                  </Typography>
                </AnimatedSection>

                <AnimatedSection delay={300}>
                  <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                    For over three decades, families throughout Southwest Florida have trusted
                    Zacharia Brown & Bratkovich to protect their legacies and plan for the future.
                    Our attorneys combine deep legal expertise with genuine compassion for every
                    client we serve.
                  </Typography>
                </AnimatedSection>
              </Grid>

              <Grid item xs={12} md={7}>
                <Grid container spacing={3}>
                  {[
                    {
                      number: '30+',
                      label: 'Years of Combined Experience',
                      delay: 400,
                    },
                    {
                      number: '4',
                      label: 'State Licenses (FL, PA, OH and WV)',
                      delay: 500,
                    },
                    {
                      number: '1000+',
                      label: 'Families Served',
                      delay: 600,
                    },
                    {
                      number: '100%',
                      label: 'Personalized Attention',
                      delay: 700,
                    },
                  ].map((stat, index) => (
                    <Grid item xs={6} key={index}>
                      <AnimatedSection delay={stat.delay}>
                        <Box
                          sx={{
                            p: 3,
                            borderRadius: 2,
                            bgcolor: 'background.default',
                            border: '1px solid',
                            borderColor: alpha('#1e3a5f', 0.08),
                            textAlign: 'center',
                          }}
                        >
                          <Typography
                            variant="h3"
                            sx={{
                              color: 'secondary.dark',
                              fontSize: { xs: '2rem', md: '2.5rem' },
                              mb: 0.5,
                            }}
                          >
                            {stat.number}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {stat.label}
                          </Typography>
                        </Box>
                      </AnimatedSection>
                    </Grid>
                  ))}
                </Grid>
              </Grid>
            </Grid>
          </Container>
        </Box>

        {/* Contact Section */}
        <Box
          sx={{
            background: 'linear-gradient(165deg, #1e3a5f 0%, #0f2744 100%)',
            color: 'white',
            py: { xs: 8, md: 10 },
          }}
        >
          <Container maxWidth="lg">
            <Grid container spacing={6}>
              <Grid item xs={12} md={6}>
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
                  Get In Touch
                </Typography>
                <Typography
                  variant="h3"
                  sx={{
                    fontSize: { xs: '1.75rem', md: '2.25rem' },
                    mb: 3,
                  }}
                >
                  Ready to Plan Your Future?
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.85, mb: 4, maxWidth: 450 }}>
                  Schedule your consultation today. We're here to answer your questions and help
                  you take the first step toward protecting your family.
                </Typography>
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => onNavigate('estate-planning-home')}
                  sx={{
                    bgcolor: 'secondary.main',
                    color: 'primary.dark',
                    px: 4,
                    py: 1.5,
                    '&:hover': {
                      bgcolor: 'secondary.light',
                    },
                  }}
                >
                  Begin Your Intake
                </Button>
              </Grid>

              <Grid item xs={12} md={6}>
                <Box sx={{ pl: { md: 4 } }}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 3 }}>
                    <Box
                      sx={{
                        width: 44,
                        height: 44,
                        borderRadius: 1,
                        bgcolor: alpha('#ffffff', 0.1),
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <LocationOnIcon sx={{ color: 'secondary.main' }} />
                    </Box>
                    <Box>
                      <Typography variant="h6" sx={{ fontSize: '1rem', mb: 0.5 }}>
                        Office Location
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.8 }}>
                        26811 South Bay Drive, Suite 260
                        <br />
                        Bonita Springs, Florida 34134
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 3 }}>
                    <Box
                      sx={{
                        width: 44,
                        height: 44,
                        borderRadius: 1,
                        bgcolor: alpha('#ffffff', 0.1),
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <PhoneIcon sx={{ color: 'secondary.main' }} />
                    </Box>
                    <Box>
                      <Typography variant="h6" sx={{ fontSize: '1rem', mb: 0.5 }}>
                        Telephone
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.8 }}>
                        (239) 345-4545
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                    <Box
                      sx={{
                        width: 44,
                        height: 44,
                        borderRadius: 1,
                        bgcolor: alpha('#ffffff', 0.1),
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <EmailIcon sx={{ color: 'secondary.main' }} />
                    </Box>
                    <Box>
                      <Typography variant="h6" sx={{ fontSize: '1rem', mb: 0.5 }}>
                        Email
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.8 }}>
                        info@zbblaw.com
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </Container>
        </Box>

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
                  Zacharia Brown & Bratkovich
                </Typography>
              </Box>

              <Typography variant="body2" sx={{ opacity: 0.6, textAlign: 'center' }}>
                © {new Date().getFullYear()} Zacharia Brown & Bratkovich. All rights reserved.
              </Typography>

              <Box sx={{ display: 'flex', gap: 3 }}>
                <Link
                  href="#"
                  underline="hover"
                  sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.875rem' }}
                >
                  Privacy Policy
                </Link>
                <Link
                  href="#"
                  underline="hover"
                  sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.875rem' }}
                >
                  Terms of Service
                </Link>
              </Box>
            </Box>
          </Container>
        </Box>

        {/* Video Demonstration Modal */}
        <Dialog
          open={videoModalOpen}
          onClose={() => setVideoModalOpen(false)}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: {
              bgcolor: 'background.paper',
              borderRadius: 2,
            },
          }}
        >
          <DialogTitle
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              bgcolor: 'primary.main',
              color: 'white',
              py: 2,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <PlayCircleOutlineIcon />
              <Typography variant="h6" component="span">
                Estate Planning Demonstration
              </Typography>
            </Box>
            <IconButton
              onClick={() => setVideoModalOpen(false)}
              sx={{ color: 'white' }}
              size="small"
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent sx={{ p: 0 }}>
            <Box
              sx={{
                position: 'relative',
                paddingTop: '56.25%', // 16:9 aspect ratio
                bgcolor: '#000',
              }}
            >
              {/* Video placeholder - replace src with actual video URL */}
              <Box
                component="video"
                controls
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                }}
                poster="/video-poster.jpg"
              >
                <source src="/demo-video.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </Box>
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 2, justifyContent: 'space-between' }}>
            <Typography variant="body2" color="text.secondary">
              Learn how our estate planning process works
            </Typography>
            <Button onClick={() => setVideoModalOpen(false)} variant="outlined">
              Close
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </ThemeProvider>
  );
};

export default LandingPage;