'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  AppBar,
  Toolbar,
  Button,
  Fade,
} from '@mui/material';
import { ThemeProvider, createTheme, alpha } from '@mui/material/styles';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import BalanceIcon from '@mui/icons-material/Balance';
import LogoutIcon from '@mui/icons-material/Logout';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import PersonIcon from '@mui/icons-material/Person';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import PeopleIcon from '@mui/icons-material/People';
import MedicalInformationIcon from '@mui/icons-material/MedicalInformation';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import ContactsIcon from '@mui/icons-material/Contacts';
import HistoryEduIcon from '@mui/icons-material/HistoryEdu';
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary';
import HomeIcon from '@mui/icons-material/Home';
import FamilyRestroomIcon from '@mui/icons-material/FamilyRestroom';
import HealthAndSafetyIcon from '@mui/icons-material/HealthAndSafety';
import VolunteerActivismIcon from '@mui/icons-material/VolunteerActivism';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import { useAuth } from '../lib/AuthContext';

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

// Category blocks for the folio home
const folioCategories = [
  {
    id: 'personal-information', title: 'Personal Information', icon: <PeopleIcon sx={{ fontSize: 26 }} />, accentColor: '#1e3a5f',
    items: ['Client & spouse details', 'Contact info & identification', 'Domicile & marital status', 'Military service', 'Safe deposit box', 'Medicare & medical insurance'],
  },
  {
    id: 'family-dependents', title: 'Family & Dependents', icon: <FamilyRestroomIcon sx={{ fontSize: 26 }} />, accentColor: '#d4497a',
    items: ['Children & grandchildren', 'Other beneficiaries', 'Charitable organizations', 'Beneficiary concerns', 'Pet care'],
  },
  {
    id: 'financial-life', title: 'Financial Life', icon: <AccountBalanceIcon sx={{ fontSize: 26 }} />, accentColor: '#0a5c36',
    items: ['Assets: financial, real property, vehicles, business, digital, personal property', 'Income sources', 'Expenses', 'Debts'],
  },
  {
    id: 'people-advisors', title: 'My People & Advisors', icon: <ContactsIcon sx={{ fontSize: 26 }} />, accentColor: '#2d6a4f',
    items: ['Attorney, accountant, financial advisor', 'Insurance & real estate agents', 'Business advisor & other', 'Friends & neighbors'],
  },
  {
    id: 'legal-documents', title: 'Legal Documents', icon: <HistoryEduIcon sx={{ fontSize: 26 }} />, accentColor: '#7b2cbf',
    items: ['Will (Last Will & Testament)', 'Revocable living trust', 'Irrevocable trust', 'Financial power of attorney', 'Health care power of attorney'],
  },
  {
    id: 'emergency-care', title: 'Medical Data', icon: <LocalHospitalIcon sx={{ fontSize: 26 }} />, accentColor: '#0077b6',
    items: ['Medical providers', 'Medications & equipment', 'Medical conditions', 'Insurance coverage'],
  },
  {
    id: 'insurance-coverage', title: 'Insurance Coverage', icon: <HealthAndSafetyIcon sx={{ fontSize: 26 }} />, accentColor: '#2e7d32',
    items: ['Medical & vehicle insurance', 'Homeowners & umbrella', 'Long-term care & disability', 'Life insurance & other policies'],
  },
  {
    id: 'home-property', title: 'Home & Property', icon: <HomeIcon sx={{ fontSize: 26 }} />, accentColor: '#e07a2f',
    items: ['Coming soon'],
  },
  {
    id: 'end-of-life', title: 'End of Life Issues', icon: <VolunteerActivismIcon sx={{ fontSize: 26 }} />, accentColor: '#6a1b9a',
    items: ['Advance directives', 'Prepaid funeral & desires', 'Funeral home & burial', 'Religious preferences'],
  },
  {
    id: 'care-decisions', title: 'Care Decisions', icon: <FavoriteBorderIcon sx={{ fontSize: 26 }} />, accentColor: '#00838f',
    items: ['Care setting & medical preferences', 'Diet, hygiene & daily routine', 'Activities, family & social', 'Cognitive, communication & spiritual', 'Financial & end-of-life preferences'],
  },
  {
    id: 'legacy-life-story', title: 'Legacy & Life Story', icon: <VideoLibraryIcon sx={{ fontSize: 26 }} />, accentColor: '#c9a227',
    items: ['Coming soon'],
  },
  {
    id: 'reports', title: 'Reports', icon: <LibraryBooksIcon sx={{ fontSize: 26 }} />, accentColor: '#455a64',
    items: ['Emergency Medical Summary', 'Family Contact Sheet', 'Asset Inventory', 'Insurance Summary', 'Advisor Directory', 'Estate Planning Overview', 'Funeral Instructions', '"What To Do If I Die" Checklist', 'Family Briefing Report'],
  },
];

// Animated category card matching LandingPage ChapterCard style
const FolioCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  accentColor: string;
  items?: string[];
  delay?: number;
  onClick?: () => void;
}> = ({ icon, title, accentColor, items, delay = 0, onClick }) => {
  const [hovered, setHovered] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <Fade in={visible} timeout={600}>
      <Card
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={onClick}
        elevation={0}
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          overflow: 'hidden',
          cursor: 'pointer',
          border: '1px solid',
          borderColor: hovered ? alpha(accentColor, 0.35) : alpha(accentColor, 0.12),
          transform: hovered ? 'translateY(-6px)' : 'translateY(0)',
          boxShadow: hovered
            ? `0 20px 48px ${alpha(accentColor, 0.13)}`
            : '0 4px 24px rgba(0,0,0,0.06)',
          transition: 'all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)',
          '&::after': {
            content: '""',
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '3px',
            background: `linear-gradient(90deg, ${accentColor}, ${alpha(accentColor, 0.4)})`,
            transform: hovered ? 'scaleX(1)' : 'scaleX(0)',
            transformOrigin: 'left',
            transition: 'transform 0.4s ease',
          },
        }}
      >
        <CardContent sx={{ p: 3.5, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: items ? 2.5 : 0 }}>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: 1.5,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                flexShrink: 0,
                background: `linear-gradient(135deg, ${alpha(accentColor, 0.12)}, ${alpha(accentColor, 0.05)})`,
                border: `1px solid ${alpha(accentColor, 0.2)}`,
              }}
            >
              <Box sx={{ color: accentColor, display: 'flex' }}>{icon}</Box>
            </Box>
            <Typography
              variant="h6"
              sx={{
                color: 'text.primary',
                fontSize: '1.05rem',
                lineHeight: 1.3,
              }}
            >
              {title}
            </Typography>
          </Box>
          {items && items.length > 0 && (
            <Box component="ul" sx={{ pl: 2, m: 0, flexGrow: 1 }}>
              {items.map((item, idx) => (
                <Typography key={idx} component="li" variant="body2" sx={{ color: 'text.secondary', mb: 0.6, fontSize: '0.88rem' }}>
                  {item}
                </Typography>
              ))}
            </Box>
          )}
        </CardContent>
      </Card>
    </Fade>
  );
};

interface MyLifeFolioHomeProps {
  onNavigateBack: () => void;
  onLogin?: () => void;
  onRegister?: () => void;
  onAdmin?: () => void;
  onProfile?: () => void;
  onNavigate?: (page: string) => void;
}

const MyLifeFolioHome: React.FC<MyLifeFolioHomeProps> = ({
  onNavigateBack,
  onLogin,
  onRegister,
  onAdmin,
  onProfile,
  onNavigate,
}) => {
  const [scrolled, setScrolled] = useState(false);
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
                    <Button
                      variant="outlined"
                      onClick={() => onNavigate?.('resources')}
                      startIcon={<LibraryBooksIcon />}
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
                      Resources
                    </Button>
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

        {/* Main Content - Category Blocks */}
        <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 }, mt: -4 }}>
          <Grid container spacing={3}>
            {folioCategories.map((cat, i) => (
              <Grid item xs={12} sm={6} md={3} key={cat.id}>
                <FolioCard
                  icon={cat.icon}
                  title={cat.title}
                  accentColor={cat.accentColor}
                  items={cat.items}
                  delay={400 + i * 80}
                  onClick={() => onNavigate?.(`category-${cat.id}`)}
                />
              </Grid>
            ))}
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

export default MyLifeFolioHome;