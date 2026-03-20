'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  AppBar,
  Toolbar,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Paper,
  Button,
  Fade,
  Collapse,
  Chip,
} from '@mui/material';
import { ThemeProvider, createTheme, alpha } from '@mui/material/styles';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LogoutIcon from '@mui/icons-material/Logout';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import PeopleIcon from '@mui/icons-material/People';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import BalanceIcon from '@mui/icons-material/Balance';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import PersonIcon from '@mui/icons-material/Person';
import FamilyRestroomIcon from '@mui/icons-material/FamilyRestroom';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import ContactsIcon from '@mui/icons-material/Contacts';
import HealthAndSafetyIcon from '@mui/icons-material/HealthAndSafety';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import VolunteerActivismIcon from '@mui/icons-material/VolunteerActivism';
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary';
import HistoryEduIcon from '@mui/icons-material/HistoryEdu';
import HomeIcon from '@mui/icons-material/Home';
import FingerprintIcon from '@mui/icons-material/Fingerprint';
import { useAuth } from '../lib/AuthContext';
import { isAdminUser } from '../lib/adminUtils';
import ObituaryHelpModal from './ObituaryHelpModal';
import FamilyLettersHelpModal from './FamilyLettersHelpModal';

const theme = createTheme({
  palette: {
    primary: { main: '#1e3a5f', light: '#2d5a8e', dark: '#0f2744' },
    secondary: { main: '#c9a227', light: '#e8c547', dark: '#9a7b1a' },
    background: { default: '#faf9f7', paper: '#ffffff' },
    text: { primary: '#1a1a1a', secondary: '#5a5a5a' },
  },
  typography: {
    fontFamily: '"Source Sans 3", "Georgia", serif',
    h1: { fontFamily: '"Playfair Display", Georgia, serif', fontWeight: 600, letterSpacing: '-0.02em' },
    h2: { fontFamily: '"Playfair Display", Georgia, serif', fontWeight: 600, letterSpacing: '-0.01em' },
    h3: { fontFamily: '"Playfair Display", Georgia, serif', fontWeight: 500 },
    h4: { fontFamily: '"Playfair Display", Georgia, serif', fontWeight: 500 },
    h5: { fontFamily: '"Playfair Display", Georgia, serif', fontWeight: 500 },
    h6: { fontFamily: '"Source Sans 3", sans-serif', fontWeight: 600 },
    body1: { fontFamily: '"Source Sans 3", sans-serif', fontSize: '1.05rem', lineHeight: 1.7 },
    body2: { fontFamily: '"Source Sans 3", sans-serif', lineHeight: 1.6 },
    button: { fontFamily: '"Source Sans 3", sans-serif', fontWeight: 600, textTransform: 'none', letterSpacing: '0.02em' },
  },
  shape: { borderRadius: 4 },
  components: {
    MuiButton: { styleOverrides: { root: { borderRadius: 2, padding: '10px 24px' } } },
    MuiCard: { styleOverrides: { root: { borderRadius: 3, boxShadow: '0 4px 24px rgba(0,0,0,0.06)' } } },
    MuiPaper: { styleOverrides: { root: { borderRadius: 3 } } },
  },
});

// ── Help topic type ──
interface HelpTopic {
  id: string;
  title: string;
  description: string;
}

// ── Folio categories with help topics ──
const folioGuideCategories: {
  id: string;
  title: string;
  icon: React.ReactNode;
  accentColor: string;
  topics: HelpTopic[];
}[] = [
  {
    id: 'personal-information', title: 'Personal Information',
    icon: <PersonIcon />, accentColor: '#1e3a5f',
    topics: [],
  },
  {
    id: 'family-dependents', title: 'Family & Dependents',
    icon: <FamilyRestroomIcon />, accentColor: '#d4497a',
    topics: [],
  },
  {
    id: 'financial-life', title: 'Financial Life',
    icon: <AccountBalanceIcon />, accentColor: '#0a5c36',
    topics: [],
  },
  {
    id: 'people-advisors', title: 'My People & Advisors',
    icon: <ContactsIcon />, accentColor: '#2d6a4f',
    topics: [],
  },
  {
    id: 'insurance-coverage', title: 'Insurance Coverage',
    icon: <HealthAndSafetyIcon />, accentColor: '#2e7d32',
    topics: [],
  },
  {
    id: 'emergency-care', title: 'Medical Data',
    icon: <LocalHospitalIcon />, accentColor: '#0077b6',
    topics: [],
  },
  {
    id: 'care-decisions', title: 'Care Decisions',
    icon: <FavoriteBorderIcon />, accentColor: '#00838f',
    topics: [],
  },
  {
    id: 'end-of-life', title: 'End of Life Issues',
    icon: <VolunteerActivismIcon />, accentColor: '#6a1b9a',
    topics: [],
  },
  {
    id: 'legacy-life-story', title: 'Legacy & Life Story',
    icon: <VideoLibraryIcon />, accentColor: '#c9a227',
    topics: [
      { id: 'obituary-info', title: 'Obituary Information', description: 'Learn what each field does and how the AI-enhanced obituary works.' },
      { id: 'family-letters', title: 'Letters to Family', description: 'How to write or record personal messages for loved ones.' },
    ],
  },
  {
    id: 'legal-documents', title: 'Legal Documents',
    icon: <HistoryEduIcon />, accentColor: '#7b2cbf',
    topics: [],
  },
  {
    id: 'document-uploads', title: 'Documents Vault',
    icon: <HomeIcon />, accentColor: '#e07a2f',
    topics: [],
  },
  {
    id: 'digital-life', title: 'Digital Life',
    icon: <FingerprintIcon />, accentColor: '#00695c',
    topics: [],
  },
  {
    id: 'reports', title: 'Reports',
    icon: <LibraryBooksIcon />, accentColor: '#455a64',
    topics: [],
  },
  {
    id: 'family-access', title: 'Family Access Portal',
    icon: <FamilyRestroomIcon />, accentColor: '#1a237e',
    topics: [],
  },
];

const AnimatedSection: React.FC<{ children: React.ReactNode; delay?: number }> = ({ children, delay = 0 }) => {
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

interface ResourcesPageProps {
  onNavigateBack: () => void;
  onNavigate?: (page: string) => void;
  onLogin?: () => void;
  onRegister?: () => void;
  onAdmin?: () => void;
  onProfile?: () => void;
}

const ResourcesPage: React.FC<ResourcesPageProps> = ({
  onNavigateBack,
  onNavigate,
  onLogin,
  onRegister,
  onAdmin,
  onProfile,
}) => {
  const [scrolled, setScrolled] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [helpModal, setHelpModal] = useState<string | null>(null);
  const { user, signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
    onNavigateBack();
  };

  const toggleCategory = (id: string) => {
    setExpandedCategory((prev) => (prev === id ? null : id));
  };

  const handleTopicClick = (topicId: string) => {
    setHelpModal(topicId);
  };

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <style>
        {`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=Source+Sans+3:wght@300;400;500;600;700&display=swap');`}
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
          <Toolbar sx={{ py: { xs: 1, md: 1.5 }, px: { xs: 2, md: 3 }, minHeight: { xs: 64, md: 72 } }}>
            <Button
              color="inherit"
              startIcon={<ArrowBackIcon />}
              onClick={onNavigateBack}
              sx={{
                position: 'absolute', left: 16, fontWeight: 500, opacity: 0.9,
                '&:hover': { opacity: 1, bgcolor: 'rgba(255,255,255,0.08)' },
              }}
            >
              Back
            </Button>

            <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1.5 }}>
              <Box
                component="img" src="/logo.svg" alt="MyLifeFolio"
                sx={{ height: { xs: 36, md: 40 }, width: { xs: 36, md: 40 }, borderRadius: '50%', border: '2px solid', borderColor: 'secondary.main', objectFit: 'cover' }}
              />
              <Typography sx={{ fontFamily: 'Georgia, "Times New Roman", serif', fontWeight: 600, fontSize: { xs: '1.1rem', md: '1.25rem' }, letterSpacing: '0.01em', display: { xs: 'none', sm: 'block' } }}>
                MyLifeFolio
              </Typography>
            </Box>

            <Box sx={{ position: 'absolute', right: 16, display: 'flex', alignItems: 'center', gap: { xs: 1, md: 2 } }}>
              {user ? (
                <>
                  {onProfile && (
                    <Button variant="outlined" onClick={onProfile} startIcon={<PeopleIcon />}
                      sx={{ borderColor: 'rgba(255,255,255,0.5)', color: 'white', fontWeight: 600, fontSize: '0.9rem', px: { xs: 2, md: 3 }, py: 1, '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.1)' } }}>
                      Family Access
                    </Button>
                  )}
                  {isAdminUser(user.email) && onAdmin && (
                    <Button variant="outlined" onClick={onAdmin} startIcon={<AdminPanelSettingsIcon />}
                      sx={{ borderColor: 'rgba(255,255,255,0.5)', color: 'white', fontWeight: 600, fontSize: '0.9rem', px: { xs: 2, md: 3 }, py: 1, '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.1)' } }}>
                      Admin
                    </Button>
                  )}
                  <Button variant="contained" onClick={handleLogout} startIcon={<LogoutIcon />}
                    sx={{ bgcolor: '#d32f2f', color: 'white', fontWeight: 600, fontSize: '0.9rem', px: { xs: 2, md: 3 }, py: 1, boxShadow: 'none', '&:hover': { bgcolor: '#b71c1c', boxShadow: '0 4px 12px rgba(211, 47, 47, 0.3)' } }}>
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Button color="inherit" onClick={onLogin}
                    sx={{ fontWeight: 500, fontSize: '0.9rem', px: { xs: 1.5, md: 2.5 }, py: 1, minWidth: 'auto', opacity: 0.9, '&:hover': { opacity: 1, bgcolor: 'rgba(255,255,255,0.08)' } }}>
                    Sign In
                  </Button>
                  <Button variant="contained" onClick={onRegister}
                    sx={{ bgcolor: 'secondary.main', color: 'primary.dark', fontWeight: 600, fontSize: '0.9rem', px: { xs: 2, md: 3 }, py: 1, boxShadow: 'none', '&:hover': { bgcolor: 'secondary.light', boxShadow: '0 4px 12px rgba(201, 162, 39, 0.3)' } }}>
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
          <Box sx={{ position: 'absolute', inset: 0, opacity: 0.03, backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }} />
          <Box sx={{ position: 'absolute', right: { xs: -100, md: 0 }, top: { xs: -50, md: -30 }, width: { xs: 200, md: 350 }, height: { xs: 200, md: 350 }, borderRadius: '50%', background: 'radial-gradient(circle, rgba(201, 162, 39, 0.08) 0%, transparent 70%)' }} />

          <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
            <AnimatedSection delay={100}>
              <Typography component="span" sx={{ display: 'inline-block', color: 'secondary.main', fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', fontSize: '0.75rem', mb: 2 }}>
                Resources
              </Typography>
            </AnimatedSection>
            <AnimatedSection delay={200}>
              <Typography variant="h2" component="h1" sx={{ fontSize: { xs: '2rem', md: '2.75rem' }, mb: 2 }}>
                Resources
              </Typography>
            </AnimatedSection>
            <AnimatedSection delay={300}>
              <Typography variant="body1" sx={{ opacity: 0.85, maxWidth: 600, fontSize: '1.1rem' }}>
                Step-by-step guidance for every section of your folio, plus educational articles and interactive planning tools.
              </Typography>
            </AnimatedSection>
          </Container>
        </Box>

        {/* Main Content */}
        <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 }, mt: -4 }}>
          {/* ── Folio Guide ── */}
          <AnimatedSection delay={350}>
            <Paper
              elevation={0}
              sx={{
                mb: 4,
                border: '1px solid',
                borderColor: alpha('#1e3a5f', 0.1),
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                  content: '""', position: 'absolute', top: 0, left: 0, right: 0, height: '4px',
                  background: `linear-gradient(90deg, #1e3a5f, ${alpha('#c9a227', 0.8)})`,
                },
              }}
            >
              <Box sx={{ p: 3, pb: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                  <Box sx={{ width: 48, height: 48, borderRadius: 2, display: 'flex', justifyContent: 'center', alignItems: 'center', background: `linear-gradient(135deg, ${alpha('#1e3a5f', 0.1)}, ${alpha('#1e3a5f', 0.05)})`, border: `1px solid ${alpha('#1e3a5f', 0.15)}` }}>
                    <HelpOutlineIcon sx={{ color: '#1e3a5f', fontSize: 26 }} />
                  </Box>
                  <Box>
                    <Typography variant="h6" sx={{ color: '#1e3a5f', fontSize: '1.15rem', lineHeight: 1.3 }}>
                      Folio Guide
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.82rem' }}>
                      Select a category to view help topics and instructions
                    </Typography>
                  </Box>
                </Box>
              </Box>

              <List disablePadding sx={{ px: 1, pb: 1 }}>
                {folioGuideCategories.map((cat) => {
                  const isExpanded = expandedCategory === cat.id;
                  const hasTopics = cat.topics.length > 0;

                  return (
                    <React.Fragment key={cat.id}>
                      <ListItem disablePadding sx={{ mb: 0.25 }}>
                        <ListItemButton
                          onClick={() => hasTopics ? toggleCategory(cat.id) : undefined}
                          sx={{
                            borderRadius: 1.5,
                            py: 1.25,
                            px: 2,
                            transition: 'all 0.2s ease',
                            cursor: hasTopics ? 'pointer' : 'default',
                            '&:hover': hasTopics
                              ? { bgcolor: alpha(cat.accentColor, 0.04), borderColor: alpha(cat.accentColor, 0.1) }
                              : { bgcolor: 'transparent' },
                          }}
                        >
                          <ListItemIcon sx={{ minWidth: 40 }}>
                            <Box
                              sx={{
                                width: 32,
                                height: 32,
                                borderRadius: 1,
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                bgcolor: alpha(cat.accentColor, 0.08),
                                color: cat.accentColor,
                                '& svg': { fontSize: 18 },
                              }}
                            >
                              {cat.icon}
                            </Box>
                          </ListItemIcon>
                          <ListItemText
                            disableTypography
                            primary={
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary', fontSize: '0.88rem' }}>
                                  {cat.title}
                                </Typography>
                                {hasTopics ? (
                                  <Chip
                                    label={`${cat.topics.length} topic${cat.topics.length > 1 ? 's' : ''}`}
                                    size="small"
                                    sx={{ height: 20, fontSize: '0.68rem', fontWeight: 600, bgcolor: alpha(cat.accentColor, 0.1), color: cat.accentColor }}
                                  />
                                ) : (
                                  <Typography variant="caption" sx={{ color: 'text.disabled', fontSize: '0.7rem', fontStyle: 'italic' }}>
                                    Coming soon
                                  </Typography>
                                )}
                              </Box>
                            }
                          />
                          {hasTopics && (
                            isExpanded ? <ExpandLessIcon sx={{ color: 'text.secondary', fontSize: 20 }} /> : <ExpandMoreIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                          )}
                        </ListItemButton>
                      </ListItem>

                      {hasTopics && (
                        <Collapse in={isExpanded} timeout="auto">
                          <List disablePadding sx={{ pl: 7, pr: 2, pb: 1 }}>
                            {cat.topics.map((topic) => (
                              <ListItem key={topic.id} disablePadding sx={{ mb: 0.25 }}>
                                <ListItemButton
                                  onClick={() => handleTopicClick(topic.id)}
                                  sx={{
                                    borderRadius: 1.5,
                                    py: 1,
                                    px: 1.5,
                                    border: '1px solid transparent',
                                    transition: 'all 0.2s ease',
                                    '&:hover': {
                                      bgcolor: alpha(cat.accentColor, 0.04),
                                      borderColor: alpha(cat.accentColor, 0.12),
                                    },
                                  }}
                                >
                                  <ListItemIcon sx={{ minWidth: 32 }}>
                                    <HelpOutlineIcon sx={{ fontSize: 18, color: cat.accentColor }} />
                                  </ListItemIcon>
                                  <ListItemText
                                    disableTypography
                                    primary={
                                      <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.84rem', color: 'text.primary' }}>
                                        {topic.title}
                                      </Typography>
                                    }
                                    secondary={
                                      <Typography variant="body2" sx={{ fontSize: '0.75rem', color: 'text.secondary', mt: 0.25 }}>
                                        {topic.description}
                                      </Typography>
                                    }
                                  />
                                  <ArrowForwardIcon sx={{ fontSize: 16, color: 'text.disabled' }} />
                                </ListItemButton>
                              </ListItem>
                            ))}
                          </List>
                        </Collapse>
                      )}
                    </React.Fragment>
                  );
                })}
              </List>
            </Paper>
          </AnimatedSection>

        </Container>

        {/* Footer */}
        <Box sx={{ bgcolor: '#0a1929', color: 'white', py: 4, mt: 6 }}>
          <Container maxWidth="lg">
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <BalanceIcon sx={{ fontSize: 24, color: 'secondary.main' }} />
                <Typography sx={{ fontFamily: '"Playfair Display", serif', fontWeight: 500, fontSize: '1rem' }}>MyLifeFolio</Typography>
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

      {/* ── Help Modals ── */}
      <ObituaryHelpModal
        open={helpModal === 'obituary-info'}
        onClose={() => setHelpModal(null)}
      />
      <FamilyLettersHelpModal
        open={helpModal === 'family-letters'}
        onClose={() => setHelpModal(null)}
      />
    </ThemeProvider>
  );
};

export default ResourcesPage;
