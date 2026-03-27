'use client';

import React, { useEffect, useState, useMemo, useRef } from 'react';
import {
  Box, Container, Typography, Button, Card, CardContent,
  Grid, AppBar, Toolbar, Fade, Link, Dialog, DialogTitle,
  DialogContent, DialogActions, IconButton, Menu, MenuItem,
  ListItemIcon, ListItemText, Divider,
} from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import PersonIcon from '@mui/icons-material/Person';
import { ThemeProvider, createTheme, alpha } from '@mui/material/styles';
import FavoriteIcon from '@mui/icons-material/Favorite';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import PeopleIcon from '@mui/icons-material/People';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import CloseIcon from '@mui/icons-material/Close';
import LogoutIcon from '@mui/icons-material/Logout';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary';
import HistoryEduIcon from '@mui/icons-material/HistoryEdu';
import MedicalInformationIcon from '@mui/icons-material/MedicalInformation';
import ContactsIcon from '@mui/icons-material/Contacts';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import LockPersonIcon from '@mui/icons-material/LockPerson';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import FamilyRestroomIcon from '@mui/icons-material/FamilyRestroom';
import HealthAndSafetyIcon from '@mui/icons-material/HealthAndSafety';
import VolunteerActivismIcon from '@mui/icons-material/VolunteerActivism';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import HomeIcon from '@mui/icons-material/Home';
import FingerprintIcon from '@mui/icons-material/Fingerprint';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import SettingsIcon from '@mui/icons-material/Settings';
import { useAuth } from '../lib/AuthContext';
import SecurityInfoModal from './SecurityInfoModal';

const isAdminUser = (email: string | undefined) => {
  if (!email) return false;
  return email.split('@')[1] === 'zacfreylaw.com';
};

const theme = createTheme({
  palette: {
    primary: { main: '#1e3a5f', light: '#2d5a8e', dark: '#0f2744' },
    secondary: { main: '#c9a227', light: '#e8c547', dark: '#9a7b1a' },
    background: { default: '#faf9f7', paper: '#ffffff' },
    text: { primary: '#1a1a1a', secondary: '#5a5a5a' },
  },
  typography: {
    fontFamily: '"Lora", Georgia, serif',
    h1: { fontFamily: '"Playfair Display", Georgia, serif', fontWeight: 700, letterSpacing: '-0.02em' },
    h2: { fontFamily: '"Playfair Display", Georgia, serif', fontWeight: 600, letterSpacing: '-0.01em' },
    h3: { fontFamily: '"Playfair Display", Georgia, serif', fontWeight: 500 },
    h4: { fontFamily: '"Playfair Display", Georgia, serif', fontWeight: 500 },
    h5: { fontFamily: '"Lora", serif', fontWeight: 600 },
    h6: { fontFamily: '"Lora", serif', fontWeight: 600 },
    body1: { fontFamily: '"Lora", serif', fontSize: '1.05rem', lineHeight: 1.8 },
    body2: { fontFamily: '"Lora", serif', lineHeight: 1.7 },
    button: { fontFamily: '"Source Sans 3", sans-serif', fontWeight: 600, textTransform: 'none', letterSpacing: '0.02em' },
  },
  shape: { borderRadius: 4 },
  components: {
    MuiButton: { styleOverrides: { root: { borderRadius: 2, padding: '10px 24px' } } },
    MuiCard: { styleOverrides: { root: { borderRadius: 3, boxShadow: '0 4px 24px rgba(0,0,0,0.06)' } } },
  },
});

// Fade-in on scroll using IntersectionObserver
const ScrollFade = ({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) => {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setTimeout(() => setVisible(true), delay); obs.disconnect(); } },
      { threshold: 0.12 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [delay]);
  return (
    <Box ref={ref} sx={{
      height: '100%',
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0)' : 'translateY(28px)',
      transition: 'opacity 0.7s ease, transform 0.7s ease',
    }}>
      {children}
    </Box>
  );
};

// Chapter card for the "What's Inside" section
const ChapterCard = ({ icon, title, items, accentColor, delay = 0 }: { icon: React.ReactNode; title: string; items: string[]; accentColor: string; delay?: number }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <ScrollFade delay={delay}>
      <Card
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        sx={{
          height: '100%', display: 'flex', flexDirection: 'column',
          position: 'relative', overflow: 'hidden', cursor: 'default',
          border: '1px solid', borderColor: hovered ? alpha(accentColor, 0.35) : alpha(accentColor, 0.12),
          transform: hovered ? 'translateY(-6px)' : 'translateY(0)',
          boxShadow: hovered ? `0 20px 48px ${alpha(accentColor, 0.13)}` : '0 4px 24px rgba(0,0,0,0.06)',
          transition: 'all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)',
          '&::after': {
            content: '""', position: 'absolute', bottom: 0, left: 0, right: 0, height: '3px',
            background: `linear-gradient(90deg, ${accentColor}, ${alpha(accentColor, 0.4)})`,
            transform: hovered ? 'scaleX(1)' : 'scaleX(0)',
            transformOrigin: 'left', transition: 'transform 0.4s ease',
          },
        }}
      >
        <CardContent sx={{ p: 3.5, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2.5 }}>
            <Box sx={{
              width: 48, height: 48, borderRadius: 1.5, display: 'flex', justifyContent: 'center',
              alignItems: 'center', flexShrink: 0,
              background: `linear-gradient(135deg, ${alpha(accentColor, 0.12)}, ${alpha(accentColor, 0.05)})`,
              border: `1px solid ${alpha(accentColor, 0.2)}`,
            }}>
              <Box sx={{ color: accentColor, display: 'flex' }}>{icon}</Box>
            </Box>
            <Typography variant="h6" sx={{ color: 'text.primary', fontSize: '1.05rem', lineHeight: 1.3 }}>{title}</Typography>
          </Box>
          <Box component="ul" sx={{ pl: 2, m: 0, flexGrow: 1 }}>
            {items.map((item, i) => (
              <Typography key={i} component="li" variant="body2" sx={{ color: 'text.secondary', mb: 0.6, fontSize: '0.88rem' }}>{item}</Typography>
            ))}
          </Box>
        </CardContent>
      </Card>
    </ScrollFade>
  );
};

const LandingPage = ({ onNavigate, onLogin, onRegister, onAdmin, onProfile }: { onNavigate: (page: string) => void; onLogin: () => void; onRegister: () => void; onAdmin?: () => void; onProfile?: () => void }) => {
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const [termsOpen, setTermsOpen] = useState(false);
  const [securityOpen, setSecurityOpen] = useState(false);
  const [trialModalOpen, setTrialModalOpen] = useState(false);
  const { user, signOut, hasRegistered } = useAuth();

  const handleLogout = async () => { await signOut(); onNavigate('landing'); };
  const [accountMenuAnchor, setAccountMenuAnchor] = useState<null | HTMLElement>(null);

  const handleGetStarted = () => setTrialModalOpen(true);

  const primaryBtn = useMemo(() => user
    ? { text: 'Open My Folio', icon: <ArrowForwardIcon />, onClick: () => onNavigate('mylifefolio-home') }
    : hasRegistered
      ? { text: 'Sign In', icon: <ArrowForwardIcon />, onClick: onLogin }
      : { text: 'Create Your Folio', icon: <AutoStoriesIcon />, onClick: handleGetStarted },
    [user, hasRegistered, onNavigate, onLogin]);

  const chapters = [
    {
      icon: <PeopleIcon sx={{ fontSize: 26 }} />,
      title: 'Personal Information',
      accentColor: '#1e3a5f',
      items: ['Client & spouse details', 'Contact info & identification', 'Domicile & marital status', 'Military service', 'Safe deposit box', 'Medicare & medical insurance'],
    },
    {
      icon: <FamilyRestroomIcon sx={{ fontSize: 26 }} />,
      title: 'Family & Dependents',
      accentColor: '#d4497a',
      items: ['Children & grandchildren', 'Other beneficiaries', 'Charitable organizations', 'Beneficiary concerns', 'Pet care'],
    },
    {
      icon: <AccountBalanceIcon sx={{ fontSize: 26 }} />,
      title: 'Financial Life',
      accentColor: '#0a5c36',
      items: ['Assets: financial, real property, vehicles, business, digital, personal property', 'Income sources', 'Expenses', 'Debts'],
    },
    {
      icon: <ContactsIcon sx={{ fontSize: 26 }} />,
      title: 'My People & Advisors',
      accentColor: '#2d6a4f',
      items: ['Attorney, accountant, financial advisor', 'Insurance & real estate agents', 'Business advisor & other', 'Friends & neighbors'],
    },
    {
      icon: <HistoryEduIcon sx={{ fontSize: 26 }} />,
      title: 'Legal Documents',
      accentColor: '#7b2cbf',
      items: ['Will (Last Will & Testament)', 'Revocable living trust', 'Irrevocable trust', 'Financial power of attorney', 'Health care power of attorney'],
    },
    {
      icon: <LocalHospitalIcon sx={{ fontSize: 26 }} />,
      title: 'Medical Data',
      accentColor: '#0077b6',
      items: ['Medical providers', 'Medications & equipment', 'Medical conditions', 'Insurance coverage'],
    },
    {
      icon: <HealthAndSafetyIcon sx={{ fontSize: 26 }} />,
      title: 'Insurance Coverage',
      accentColor: '#2e7d32',
      items: ['Medical & vehicle insurance', 'Homeowners & umbrella', 'Long-term care & disability', 'Life insurance & other policies'],
    },
    {
      icon: <FavoriteBorderIcon sx={{ fontSize: 26 }} />,
      title: 'Care Decisions',
      accentColor: '#00838f',
      items: ['Care setting & medical preferences', 'Diet, hygiene & daily routine', 'Activities, family & social', 'Cognitive, communication & spiritual', 'Financial & end-of-life preferences'],
    },
    {
      icon: <VolunteerActivismIcon sx={{ fontSize: 26 }} />,
      title: 'End of Life Issues',
      accentColor: '#6a1b9a',
      items: ['Advance directives', 'Prepaid funeral & desires', 'Funeral home & burial', 'Religious preferences'],
    },
    {
      icon: <VideoLibraryIcon sx={{ fontSize: 26 }} />,
      title: 'Legacy & Life Story',
      accentColor: '#c9a227',
      items: ['Obituary Info', 'Charitable Wishes', 'Letters to Family', 'Personal History', 'Life Stories', 'Reflections', 'Surprises', 'Favorites', 'Video Legacy', 'Memory Vault'],
    },
    {
      icon: <HomeIcon sx={{ fontSize: 26 }} />,
      title: 'Documents Vault',
      accentColor: '#e07a2f',
      items: ['Estate Planning & Legal', 'Real Estate & Property', 'Financial & Accounts', 'Insurance', 'Personal Identity', 'Military & Government', 'Medical & Health', 'Family & Genealogy', 'Personal Legacy & Memorabilia', 'Digital Assets', 'Other'],
    },
    {
      icon: <FingerprintIcon sx={{ fontSize: 26 }} />,
      title: 'Digital Life',
      accentColor: '#00695c',
      items: ['Online account credentials', 'Digital assets & cryptocurrency', 'Subscriptions & recurring services', 'Social media & email accounts', 'Domain names & digital businesses'],
    },
  ];

  const steps = [
    {
      num: '01',
      title: 'Create your private folio',
      body: 'Set up your secure, personal folio in minutes. Everything you share is encrypted and visible only to those you choose.',
    },
    {
      num: '02',
      title: 'Fill it in at your own pace',
      body: 'Add information chapter by chapter — health, finances, family, legacy. There\'s no rush. Come back anytime.',
    },
    {
      num: '03',
      title: 'Share with the people you trust',
      body: 'Grant secure access to family members, caregivers, or advisors. They\'ll have exactly what they need, when they need it.',
    },
  ];

  return (
    <ThemeProvider theme={theme}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&family=Lora:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Source+Sans+3:wght@300;400;500;600;700&display=swap');`}</style>

      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>

        {/* ── NAVIGATION ── */}
        <AppBar position="fixed" elevation={1} sx={{ bgcolor: 'rgba(30, 58, 95, 0.97)', backdropFilter: 'blur(12px)' }}>
          <Toolbar sx={{ py: { xs: 1, md: 1.5 }, px: { xs: 2, md: 3 }, minHeight: { xs: 64, md: 72 } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, cursor: 'pointer' }} onClick={() => onNavigate('home')}>
              <Box component="img" src="/logo.svg" alt="MyLifeFolio" sx={{ height: { xs: 36, md: 40 }, width: { xs: 36, md: 40 }, borderRadius: '50%', border: '2px solid', borderColor: 'secondary.main', objectFit: 'cover' }} />
              <Typography sx={{ fontFamily: '"Playfair Display", serif', fontWeight: 600, fontSize: { xs: '1.1rem', md: '1.25rem' }, display: { xs: 'none', sm: 'block' } }}>
                MyLifeFolio
              </Typography>
            </Box>
            <Box sx={{ flexGrow: 1 }} />
            <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, md: 2 } }}>
              {user ? (
                <>
                  <Button variant="outlined" onClick={() => onNavigate('about')} startIcon={<InfoOutlinedIcon />}
                    sx={{ borderColor: 'rgba(255,255,255,0.5)', color: 'white', '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.1)' } }}>
                    About
                  </Button>
                  {isAdminUser(user.email) && onAdmin && (
                    <Button variant="outlined" onClick={onAdmin} startIcon={<AdminPanelSettingsIcon />}
                      sx={{ borderColor: 'rgba(255,255,255,0.5)', color: 'white', '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.1)' } }}>
                      Admin
                    </Button>
                  )}
                  <Button variant="outlined" onClick={(e) => setAccountMenuAnchor(e.currentTarget)} startIcon={<PersonIcon />} endIcon={<KeyboardArrowDownIcon />}
                    sx={{ borderColor: 'rgba(255,255,255,0.5)', color: 'white', '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.1)' } }}>
                    Account
                  </Button>
                  <Menu
                    anchorEl={accountMenuAnchor}
                    open={Boolean(accountMenuAnchor)}
                    onClose={() => setAccountMenuAnchor(null)}
                    slotProps={{
                      paper: { sx: { borderRadius: 2, minWidth: 180, mt: 1 } },
                    }}
                  >
                    <MenuItem onClick={() => { setAccountMenuAnchor(null); onProfile?.(); }}>
                      <ListItemIcon><PeopleIcon fontSize="small" /></ListItemIcon>
                      <ListItemText>Family Access</ListItemText>
                    </MenuItem>
                    {/* <MenuItem onClick={() => { setAccountMenuAnchor(null); onNavigate('resources'); }}>
                      <ListItemIcon><LibraryBooksIcon fontSize="small" /></ListItemIcon>
                      <ListItemText>Resources</ListItemText>
                    </MenuItem> */}
                    <MenuItem onClick={() => { setAccountMenuAnchor(null); onNavigate('account-settings'); }}>
                      <ListItemIcon><SettingsIcon fontSize="small" /></ListItemIcon>
                      <ListItemText>Account Settings</ListItemText>
                    </MenuItem>
                    <Divider />
                    <MenuItem onClick={() => { setAccountMenuAnchor(null); handleLogout(); }}>
                      <ListItemIcon><LogoutIcon fontSize="small" sx={{ color: '#d32f2f' }} /></ListItemIcon>
                      <ListItemText sx={{ '& .MuiListItemText-primary': { color: '#d32f2f', fontWeight: 600 } }}>Logout</ListItemText>
                    </MenuItem>
                  </Menu>
                </>
              ) : (
                <>
                  {/* <Button variant="outlined" onClick={() => onNavigate('resources')} startIcon={<LibraryBooksIcon />}
                    sx={{ borderColor: 'rgba(255,255,255,0.5)', color: 'white', '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.1)' } }}>
                    Resources
                  </Button> */}
                  <Button variant="outlined" onClick={() => onNavigate('about')} startIcon={<InfoOutlinedIcon />}
                    sx={{ borderColor: 'rgba(255,255,255,0.5)', color: 'white', '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.1)' } }}>
                    About
                  </Button>
                  <Button color="inherit" onClick={onLogin} sx={{ opacity: 0.9, '&:hover': { opacity: 1, bgcolor: 'rgba(255,255,255,0.08)' } }}>
                    Sign In
                  </Button>
                  <Button variant="contained" onClick={handleGetStarted}
                    sx={{ bgcolor: 'secondary.main', color: 'primary.dark', boxShadow: 'none', '&:hover': { bgcolor: 'secondary.light', boxShadow: '0 4px 12px rgba(201,162,39,0.3)' } }}>
                    Get Started
                  </Button>
                </>
              )}
            </Box>
          </Toolbar>
        </AppBar>

        {/* ── HERO ── */}
        <Box sx={{
          background: 'linear-gradient(160deg, #1e3a5f 0%, #0f2744 55%, #162d4a 100%)',
          color: 'white',
          pt: { xs: 16, md: 20 }, pb: { xs: 12, md: 16 },
          position: 'relative', overflow: 'hidden',
        }}>
          <Box sx={{ position: 'absolute', right: { xs: -200, md: 0 }, top: -120, width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(201,162,39,0.09) 0%, transparent 65%)', pointerEvents: 'none' }} />
          <Box sx={{ position: 'absolute', left: -100, bottom: -150, width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.02) 0%, transparent 70%)', pointerEvents: 'none' }} />

          <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
            <Grid container spacing={6} alignItems="center">
              <Grid item xs={12} md={7}>

                {/* Eyebrow */}
                <Box sx={{ opacity: 0, animation: 'fadeUp 0.7s 0.1s ease forwards', '@keyframes fadeUp': { from: { opacity: 0, transform: 'translateY(20px)' }, to: { opacity: 1, transform: 'translateY(0)' } } }}>
                  <Typography component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: 1, color: 'secondary.main', fontFamily: '"Source Sans 3", sans-serif', fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase', fontSize: '0.72rem', mb: 2.5 }}>
                    <FavoriteIcon sx={{ fontSize: 14 }} /> Everything They Need to Know About You
                  </Typography>
                </Box>

                {/* Headline */}
                <Box sx={{ opacity: 0, animation: 'fadeUp 0.8s 0.25s ease forwards', '@keyframes fadeUp': { from: { opacity: 0, transform: 'translateY(20px)' }, to: { opacity: 1, transform: 'translateY(0)' } } }}>
                  <Typography variant="h1" sx={{ fontSize: { xs: '2.6rem', md: '3.6rem', lg: '4.2rem' }, lineHeight: 1.1, mb: 3 }}>
                    Your Life, Organized.
                    <Box component="span" sx={{ display: 'block', fontStyle: 'italic', color: 'secondary.main' }}>
                      Your Legacy, Protected.
                    </Box>
                  </Typography>
                </Box>

                {/* Tagline */}
                <Box sx={{ opacity: 0, animation: 'fadeUp 0.8s 0.33s ease forwards', '@keyframes fadeUp': { from: { opacity: 0, transform: 'translateY(20px)' }, to: { opacity: 1, transform: 'translateY(0)' } } }}>
                  <Typography sx={{ fontFamily: '"Jost", sans-serif', fontSize: { xs: '1.25rem', md: '1.5rem' }, fontWeight: 600, fontStyle: 'italic', letterSpacing: '0.02em', color: 'secondary.main', mb: 3, textShadow: '0 1px 8px rgba(0,0,0,0.25)' }}>
                    &ldquo;The Guide Your Family Wishes You Had Left Behind&rdquo;
                  </Typography>
                </Box>

                {/* Subheading */}
                <Box sx={{ opacity: 0, animation: 'fadeUp 0.8s 0.4s ease forwards', '@keyframes fadeUp': { from: { opacity: 0, transform: 'translateY(20px)' }, to: { opacity: 1, transform: 'translateY(0)' } } }}>
                  <Typography variant="body1" sx={{ mb: 4.5, maxWidth: 540, opacity: 0.88, fontSize: { xs: '1.05rem', md: '1.15rem' }, lineHeight: 1.85, fontWeight: 400 }}>
                    MyLifeFolio is the one place where the people who love you can find everything they
                    need — when you're sick, in an emergency, or when you're gone. Your health, your
                    finances, your wishes, your story.
                  </Typography>
                </Box>

                {/* CTAs */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 5, opacity: 0, animation: 'fadeUp 0.8s 0.55s ease forwards', '@keyframes fadeUp': { from: { opacity: 0, transform: 'translateY(20px)' }, to: { opacity: 1, transform: 'translateY(0)' } } }}>
                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    <Button variant="contained" size="large" onClick={primaryBtn.onClick} endIcon={primaryBtn.icon}
                      sx={{ bgcolor: 'secondary.main', color: 'primary.dark', px: 4, py: 1.6, fontSize: '1rem', fontFamily: '"Source Sans 3", sans-serif', fontWeight: 700, '&:hover': { bgcolor: 'secondary.light', transform: 'translateY(-2px)', boxShadow: '0 8px 28px rgba(201,162,39,0.35)' }, transition: 'all 0.3s ease' }}>
                      {primaryBtn.text}
                    </Button>
                    <Button variant="outlined" size="large" onClick={() => onNavigate('benefits')}
                      sx={{ borderColor: 'rgba(255,255,255,0.4)', color: 'white', px: 4, py: 1.6, fontFamily: '"Source Sans 3", sans-serif', '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.06)' } }}>
                      See What MyLifeFolio Does For You →
                    </Button>
                  </Box>
                  <Typography variant="body2" sx={{ color: alpha('#fff', 0.6), fontSize: '0.8rem', fontFamily: '"Source Sans 3", sans-serif' }}>
                    Not sure if it's right for you? Explore 24 real-life scenarios.
                  </Typography>
                </Box>

                {/* Trust bar */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, opacity: 0, animation: 'fadeUp 0.8s 0.7s ease forwards', '@keyframes fadeUp': { from: { opacity: 0, transform: 'translateY(20px)' }, to: { opacity: 1, transform: 'translateY(0)' } } }}>
                  <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
                    {[
                      <><LockPersonIcon sx={{ fontSize: 16 }} /> AES-256 encryption</>,
                      <><PeopleIcon sx={{ fontSize: 16 }} /> Share with trusted people</>,
                      <><AutoStoriesIcon sx={{ fontSize: 16 }} /> Your story, your way</>,
                    ].map((item, i) => (
                      <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 0.8, px: 2, py: 1, borderRadius: 1, bgcolor: alpha('#ffffff', 0.08), backdropFilter: 'blur(8px)' }}>
                        <Typography variant="body2" sx={{ color: alpha('#fff', 0.82), fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: 0.7, fontFamily: '"Source Sans 3", sans-serif' }}>{item}</Typography>
                      </Box>
                    ))}
                  </Box>
                  <Link component="button" onClick={() => setSecurityOpen(true)} underline="hover" sx={{ color: alpha('#fff', 0.6), fontSize: '0.78rem', fontFamily: '"Source Sans 3", sans-serif', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', width: 'fit-content' }}>
                    About MyLifeFolio Security →
                  </Link>
                </Box>
              </Grid>

              {/* Hero right image */}
              <Grid item xs={12} md={5} sx={{ display: { xs: 'none', md: 'flex' }, justifyContent: 'center' }}>
                <Box sx={{ position: 'relative', opacity: 0, animation: 'fadeIn 1s 0.6s ease forwards', '@keyframes fadeIn': { from: { opacity: 0 }, to: { opacity: 1 } } }}>
                  <Box component="img" src="/logo.svg" alt="MyLifeFolio" sx={{ width: 300, height: 300, borderRadius: '5%', objectFit: 'cover', border: '3px solid', borderColor: alpha('#c9a227', 0.4), boxShadow: `0 0 60px ${alpha('#c9a227', 0.15)}` }} />
  
                </Box>
              </Grid>
            </Grid>
          </Container>
        </Box>

        {/* ── WHY SECTION ── */}
        <Box sx={{ bgcolor: '#fff', py: { xs: 8, md: 11 } }}>
          <Container maxWidth="md">
            <ScrollFade>
              <Box sx={{ textAlign: 'center', mb: 2 }}>
                <Typography component="span" sx={{ display: 'inline-block', color: 'secondary.dark', fontFamily: '"Source Sans 3", sans-serif', fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', fontSize: '0.72rem', mb: 2 }}>
                  Why MyLifeFolio
                </Typography>
              </Box>
              <Typography variant="h2" sx={{ textAlign: 'center', fontSize: { xs: '1.9rem', md: '2.7rem' }, color: 'primary.main', mb: 3, lineHeight: 1.25 }}>
                When something happens, will your family know what to do?
              </Typography>
              <Typography variant="body1" sx={{ textAlign: 'center', color: 'text.secondary', maxWidth: 640, mx: 'auto', mb: 5, fontSize: '1.08rem', lineHeight: 1.85 }}>
                Most families discover too late that they don't know where the documents are, who the
                doctors are, what the passwords are, or what their loved one would have wanted.
                MyLifeFolio changes that — before it's too late.
              </Typography>
            </ScrollFade>

            {/* Pull quote */}
            <ScrollFade delay={200}>
              <Box sx={{ borderLeft: '4px solid', borderColor: 'secondary.main', pl: 4, py: 1, mx: { xs: 0, md: 6 }, my: 4 }}>
                <Typography variant="h5" sx={{ fontStyle: 'italic', fontWeight: 400, color: 'primary.dark', fontSize: { xs: '1.15rem', md: '1.4rem' }, lineHeight: 1.6, mb: 1 }}>
                  "This is the one document your family will thank you for creating —
                  and the one you'll wish someone had made for you."
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', fontFamily: '"Source Sans 3", sans-serif', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', fontSize: '0.72rem' }}>
                  The MyLifeFolio Promise
                </Typography>
              </Box>
            </ScrollFade>
          </Container>
        </Box>

        {/* ── CHAPTERS GRID ── */}
        <Box sx={{ bgcolor: 'background.default', py: { xs: 8, md: 12 } }}>
          <Container maxWidth="lg">
            <ScrollFade>
              <Box sx={{ textAlign: 'center', mb: 7 }}>
                <Typography component="span" sx={{ display: 'inline-block', color: 'secondary.dark', fontFamily: '"Source Sans 3", sans-serif', fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', fontSize: '0.72rem', mb: 2 }}>
                  What's Inside
                </Typography>
                <Typography variant="h2" sx={{ color: 'primary.main', fontSize: { xs: '2rem', md: '2.75rem' }, mb: 2 }}>
                  The Chapters of Your Folio
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 560, mx: 'auto' }}>
                  Each chapter captures a different dimension of your life — so whoever opens your folio finds everything they need.
                </Typography>
              </Box>
            </ScrollFade>
            <Grid container spacing={3}>
              {chapters.map((ch, i) => (
                <Grid item xs={12} sm={6} lg={3} key={i}>
                  <ChapterCard {...ch} delay={i * 80} />
                </Grid>
              ))}
            </Grid>
          </Container>
        </Box>

        {/* ── HOW IT WORKS ── */}
        <Box sx={{ background: 'linear-gradient(160deg, #1e3a5f 0%, #0f2744 100%)', color: 'white', py: { xs: 8, md: 12 }, position: 'relative', overflow: 'hidden' }}>
          <Box sx={{ position: 'absolute', right: -80, top: -80, width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(201,162,39,0.07) 0%, transparent 70%)', pointerEvents: 'none' }} />
          <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
            <ScrollFade>
              <Box sx={{ textAlign: 'center', mb: 8 }}>
                <Typography component="span" sx={{ display: 'inline-block', color: alpha('#c9a227', 0.9), fontFamily: '"Source Sans 3", sans-serif', fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', fontSize: '0.72rem', mb: 2 }}>
                  Getting Started
                </Typography>
                <Typography variant="h2" sx={{ fontSize: { xs: '2rem', md: '2.75rem' }, mb: 2 }}>
                  Simple as 1 — 2 — 3
                </Typography>
              </Box>
            </ScrollFade>

            <Grid container spacing={5}>
              {steps.map((step, i) => (
                <Grid item xs={12} md={4} key={i}>
                  <ScrollFade delay={i * 150}>
                    <Box sx={{ position: 'relative', pt: 2 }}>
                      <Box sx={{ position: 'absolute', top: 0, left: 0, width: '2rem', height: '2px', bgcolor: 'secondary.main' }} />
                      <Typography sx={{ fontFamily: '"Playfair Display", serif', fontSize: '3.5rem', fontWeight: 700, color: alpha('#c9a227', 0.18), lineHeight: 1, mb: 1.5 }}>{step.num}</Typography>
                      <Typography variant="h5" sx={{ color: 'white', fontSize: '1.2rem', mb: 1.5, fontFamily: '"Playfair Display", serif', fontWeight: 500 }}>{step.title}</Typography>
                      <Typography variant="body2" sx={{ color: alpha('#fff', 0.65), lineHeight: 1.8 }}>{step.body}</Typography>
                    </Box>
                  </ScrollFade>
                </Grid>
              ))}
            </Grid>

            <ScrollFade delay={400}>
              <Box sx={{ textAlign: 'center', mt: 8 }}>
                <Button variant="contained" size="large" onClick={handleGetStarted} endIcon={<AutoStoriesIcon />}
                  sx={{ bgcolor: 'secondary.main', color: 'primary.dark', px: 5, py: 1.7, fontSize: '1rem', fontFamily: '"Source Sans 3", sans-serif', fontWeight: 700, '&:hover': { bgcolor: 'secondary.light', transform: 'translateY(-2px)', boxShadow: '0 8px 28px rgba(201,162,39,0.35)' }, transition: 'all 0.3s ease' }}>
                  Start Your Folio — It's Free
                </Button>
                <Typography variant="body2" sx={{ color: alpha('#fff', 0.45), mt: 2, fontFamily: '"Source Sans 3", sans-serif', fontSize: '0.82rem' }}>
                  No credit card required. Your information is always private.
                </Typography>
              </Box>
            </ScrollFade>
          </Container>
        </Box>

        {/* ── LEGACY SECTION ── */}
        <Box sx={{ bgcolor: '#fff', py: { xs: 8, md: 12 } }}>
          <Container maxWidth="lg">
            <Grid container spacing={7} alignItems="center">
              <Grid item xs={12} md={6}>
                <ScrollFade>
                  <Typography component="span" sx={{ display: 'inline-block', color: 'secondary.dark', fontFamily: '"Source Sans 3", sans-serif', fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', fontSize: '0.72rem', mb: 2 }}>
                    Your Legacy
                  </Typography>
                  <Typography variant="h3" sx={{ color: 'primary.main', fontSize: { xs: '1.8rem', md: '2.4rem' }, mb: 3, lineHeight: 1.25 }}>
                    More than documents.<br />
                    <Box component="span" sx={{ fontStyle: 'italic', color: 'secondary.dark' }}>A gift to your family.</Box>
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ mb: 2.5, lineHeight: 1.9 }}>
                    MyLifeFolio includes a video legacy section — record messages to your children and grandchildren.
                    Tell them why you made the choices you did. Share the family stories you never got around to
                    telling. Leave the lessons only you can teach.
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.9 }}>
                    Future generations can add to the folio too, building a living record of your family's story
                    — for the people who come after.
                  </Typography>
                </ScrollFade>
              </Grid>
              <Grid item xs={12} md={6}>
                <Grid container spacing={2}>
                  {[
                    { label: 'Video messages', desc: 'Record personal messages to share with your family at the right moment.' },
                    { label: 'Life lessons', desc: 'Capture the wisdom you\'ve earned through decades of living.' },
                    { label: 'Family history', desc: 'Document your roots — names, places, and stories worth preserving.' },
                    { label: 'Keepsake index', desc: 'Note where treasured items are and who they should go to.' },
                  ].map((item, i) => (
                    <Grid item xs={12} sm={6} key={i}>
                      <ScrollFade delay={i * 100}>
                        <Box sx={{ p: 3, borderRadius: 2, bgcolor: 'background.default', border: '1px solid', borderColor: alpha('#c9a227', 0.15), height: '100%' }}>
                          <Typography variant="h6" sx={{ fontSize: '0.95rem', color: 'primary.main', mb: 1, fontFamily: '"Playfair Display", serif' }}>{item.label}</Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem', lineHeight: 1.7 }}>{item.desc}</Typography>
                        </Box>
                      </ScrollFade>
                    </Grid>
                  ))}
                </Grid>
              </Grid>
            </Grid>
          </Container>
        </Box>

        {/* ── FOOTER ── */}
        <Box sx={{ bgcolor: '#0a1929', color: 'white', py: 4 }}>
          <Container maxWidth="lg">
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <FavoriteIcon sx={{ fontSize: 20, color: 'secondary.main' }} />
                <Typography sx={{ fontFamily: '"Playfair Display", serif', fontWeight: 500, fontSize: '1rem' }}>MyLifeFolio</Typography>
              </Box>
              <Typography variant="body2" sx={{ opacity: 0.5, textAlign: 'center', fontFamily: '"Source Sans 3", sans-serif', fontSize: '0.8rem' }}>
                © {new Date().getFullYear()} Senior Care Resources LLC.  All rights reserved.
              </Typography>
              <Box sx={{ display: 'flex', gap: 3 }}>
                <Link component="button" onClick={() => setPrivacyOpen(true)} underline="hover" sx={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', fontFamily: '"Source Sans 3", sans-serif', background: 'none', border: 'none', cursor: 'pointer' }}>Privacy Policy</Link>
                <Link component="button" onClick={() => setTermsOpen(true)} underline="hover" sx={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', fontFamily: '"Source Sans 3", sans-serif', background: 'none', border: 'none', cursor: 'pointer' }}>Terms of Service</Link>
                <Link component="button" onClick={() => setSecurityOpen(true)} underline="hover" sx={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', fontFamily: '"Source Sans 3", sans-serif', background: 'none', border: 'none', cursor: 'pointer' }}>About Security</Link>
              </Box>
            </Box>
          </Container>
        </Box>

        {/* ── VIDEO MODAL ── */}
        <Dialog open={videoModalOpen} onClose={() => setVideoModalOpen(false)} maxWidth="sm" fullWidth
          PaperProps={{ sx: { bgcolor: 'background.paper', borderRadius: 3 } }}>
          <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: 'primary.main', color: 'white', py: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <PlayCircleOutlineIcon />
              <Typography variant="h6" component="span">See How MyLifeFolio Works</Typography>
            </Box>
            <IconButton onClick={() => setVideoModalOpen(false)} sx={{ color: 'white' }} size="small"><CloseIcon /></IconButton>
          </DialogTitle>
          <DialogContent sx={{ textAlign: 'center', py: 5, px: 4 }}>
            <VideoLibraryIcon sx={{ fontSize: 64, color: 'secondary.main', mb: 2 }} />
            <Typography variant="h5" sx={{ fontFamily: '"Playfair Display", serif', fontWeight: 600, color: 'primary.main', mb: 1.5 }}>
              Coming Soon
            </Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary', fontSize: '1rem', lineHeight: 1.7 }}>
              We're putting the finishing touches on a walkthrough video to show you everything MyLifeFolio can do. Please check back soon!
            </Typography>
          </DialogContent>
          <DialogActions sx={{ p: 2, justifyContent: 'center' }}>
            <Button onClick={() => setVideoModalOpen(false)} variant="contained"
              sx={{ bgcolor: 'primary.main', px: 4, textTransform: 'none', fontWeight: 600, '&:hover': { bgcolor: 'primary.dark' } }}>
              Got It
            </Button>
          </DialogActions>
        </Dialog>

        {/* ── PRIVACY POLICY MODAL ── */}
        <Dialog open={privacyOpen} onClose={() => setPrivacyOpen(false)} maxWidth="md" fullWidth scroll="paper"
          PaperProps={{ sx: { borderRadius: 2 } }}>
          <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: 'primary.main', color: 'white', py: 2 }}>
            <Typography variant="h6" component="span" sx={{ fontWeight: 600 }}>Privacy Policy</Typography>
            <IconButton onClick={() => setPrivacyOpen(false)} sx={{ color: 'white' }} size="small"><CloseIcon /></IconButton>
          </DialogTitle>
          <DialogContent dividers sx={{ py: 3, px: 4 }}>
            <Typography variant="body2" sx={{ mb: 2, fontStyle: 'italic', color: 'text.secondary' }}>
              Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </Typography>

            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>1. Introduction</Typography>
            <Typography variant="body2" sx={{ mb: 2, lineHeight: 1.8 }}>
              Senior Care Resources LLC (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) operates the MyLifeFolio platform. This Privacy Policy explains how we collect, use, disclose, and safeguard your personal information when you use our website and services. By accessing or using MyLifeFolio, you agree to the terms of this Privacy Policy.
            </Typography>

            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>2. Information We Collect</Typography>
            <Typography variant="body2" sx={{ mb: 1, lineHeight: 1.8 }}>We may collect the following types of information:</Typography>
            <Box component="ul" sx={{ pl: 2.5, mb: 2 }}>
              <Typography component="li" variant="body2" sx={{ mb: 0.5, lineHeight: 1.8 }}><strong>Account Information:</strong> Name, email address, and password when you create an account.</Typography>
              <Typography component="li" variant="body2" sx={{ mb: 0.5, lineHeight: 1.8 }}><strong>Personal &amp; Family Data:</strong> Health records, financial information, legal documents, family contacts, and other data you voluntarily enter into your folio.</Typography>
              <Typography component="li" variant="body2" sx={{ mb: 0.5, lineHeight: 1.8 }}><strong>Usage Data:</strong> Browser type, IP address, pages visited, and time spent on the platform.</Typography>
              <Typography component="li" variant="body2" sx={{ mb: 0.5, lineHeight: 1.8 }}><strong>Uploaded Documents:</strong> Any files you upload to the Documents Vault.</Typography>
            </Box>

            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>3. How We Use Your Information</Typography>
            <Box component="ul" sx={{ pl: 2.5, mb: 2 }}>
              <Typography component="li" variant="body2" sx={{ mb: 0.5, lineHeight: 1.8 }}>To provide and maintain the MyLifeFolio platform and its features.</Typography>
              <Typography component="li" variant="body2" sx={{ mb: 0.5, lineHeight: 1.8 }}>To generate reports and summaries based on data you have entered.</Typography>
              <Typography component="li" variant="body2" sx={{ mb: 0.5, lineHeight: 1.8 }}>To facilitate authorized family member access to your information.</Typography>
              <Typography component="li" variant="body2" sx={{ mb: 0.5, lineHeight: 1.8 }}>To communicate with you about your account, updates, or support inquiries.</Typography>
              <Typography component="li" variant="body2" sx={{ mb: 0.5, lineHeight: 1.8 }}>To improve our services and develop new features.</Typography>
            </Box>

            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>4. Data Security</Typography>
            <Typography variant="body2" sx={{ mb: 2, lineHeight: 1.8 }}>
              We implement industry-standard security measures to protect your personal information, including encryption in transit and at rest, secure authentication, and role-based access controls. However, no method of electronic storage or transmission is 100% secure, and we cannot guarantee absolute security.
            </Typography>

            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>5. Data Sharing &amp; Disclosure</Typography>
            <Typography variant="body2" sx={{ mb: 1, lineHeight: 1.8 }}>We do not sell your personal information. We may share your data only in the following circumstances:</Typography>
            <Box component="ul" sx={{ pl: 2.5, mb: 2 }}>
              <Typography component="li" variant="body2" sx={{ mb: 0.5, lineHeight: 1.8 }}>With family members or trusted contacts you have explicitly authorized through the Family Access feature.</Typography>
              <Typography component="li" variant="body2" sx={{ mb: 0.5, lineHeight: 1.8 }}>With service providers who assist in operating our platform (e.g., hosting, database services), under strict confidentiality agreements.</Typography>
              <Typography component="li" variant="body2" sx={{ mb: 0.5, lineHeight: 1.8 }}>When required by law, regulation, or legal process.</Typography>
            </Box>

            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>6. Data Retention</Typography>
            <Typography variant="body2" sx={{ mb: 2, lineHeight: 1.8 }}>
              We retain your personal information for as long as your account is active or as needed to provide you services. You may request deletion of your account and associated data at any time by contacting us at support@seniorCareRes.com.
            </Typography>

            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>7. Your Rights</Typography>
            <Typography variant="body2" sx={{ mb: 1, lineHeight: 1.8 }}>Depending on your jurisdiction, you may have the right to:</Typography>
            <Box component="ul" sx={{ pl: 2.5, mb: 2 }}>
              <Typography component="li" variant="body2" sx={{ mb: 0.5, lineHeight: 1.8 }}>Access, correct, or delete your personal data.</Typography>
              <Typography component="li" variant="body2" sx={{ mb: 0.5, lineHeight: 1.8 }}>Withdraw consent for data processing.</Typography>
              <Typography component="li" variant="body2" sx={{ mb: 0.5, lineHeight: 1.8 }}>Request a portable copy of your data.</Typography>
              <Typography component="li" variant="body2" sx={{ mb: 0.5, lineHeight: 1.8 }}>Lodge a complaint with a supervisory authority.</Typography>
            </Box>

            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>8. Cookies &amp; Tracking</Typography>
            <Typography variant="body2" sx={{ mb: 2, lineHeight: 1.8 }}>
              We use essential cookies to maintain your session and authentication state. We do not use third-party advertising or tracking cookies.
            </Typography>

            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>9. Contact Us</Typography>
            <Typography variant="body2" sx={{ lineHeight: 1.8 }}>
              If you have questions about this Privacy Policy, please contact us at support@seniorCareRes.com or write to Senior Care Resources LLC, 4500 Walnut Street, McKeesport, PA 15132.
            </Typography>
          </DialogContent>
          <DialogActions sx={{ px: 3, py: 1.5 }}>
            <Button onClick={() => setPrivacyOpen(false)} variant="contained" sx={{ bgcolor: 'primary.main' }}>Close</Button>
          </DialogActions>
        </Dialog>

        {/* ── TERMS OF SERVICE MODAL ── */}
        <Dialog open={termsOpen} onClose={() => setTermsOpen(false)} maxWidth="md" fullWidth scroll="paper"
          PaperProps={{ sx: { borderRadius: 2 } }}>
          <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: 'primary.main', color: 'white', py: 2 }}>
            <Typography variant="h6" component="span" sx={{ fontWeight: 600 }}>Terms of Service</Typography>
            <IconButton onClick={() => setTermsOpen(false)} sx={{ color: 'white' }} size="small"><CloseIcon /></IconButton>
          </DialogTitle>
          <DialogContent dividers sx={{ py: 3, px: 4 }}>
            <Typography variant="body2" sx={{ mb: 2, fontStyle: 'italic', color: 'text.secondary' }}>
              Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </Typography>

            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>1. Acceptance of Terms</Typography>
            <Typography variant="body2" sx={{ mb: 2, lineHeight: 1.8 }}>
              By accessing or using the MyLifeFolio platform operated by Senior Care Resources LLC (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;), you agree to be bound by these Terms of Service. If you do not agree, you may not use the platform.
            </Typography>

            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>2. Description of Service</Typography>
            <Typography variant="body2" sx={{ mb: 2, lineHeight: 1.8 }}>
              MyLifeFolio is a personal life-organization platform that allows users to securely document their health, financial, legal, and personal information for the benefit of themselves and their authorized family members. The platform is provided as-is for informational and organizational purposes only.
            </Typography>

            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>3. Not Legal or Financial Advice</Typography>
            <Typography variant="body2" sx={{ mb: 2, lineHeight: 1.8 }}>
              MyLifeFolio is a documentation and organizational tool. Nothing on this platform constitutes legal, financial, medical, or tax advice. You should consult qualified professionals for advice specific to your situation. Senior Care Resources LLC is not responsible for decisions made based on information stored in or generated by the platform.
            </Typography>

            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>4. User Accounts</Typography>
            <Box component="ul" sx={{ pl: 2.5, mb: 2 }}>
              <Typography component="li" variant="body2" sx={{ mb: 0.5, lineHeight: 1.8 }}>You must provide accurate and complete information when creating your account.</Typography>
              <Typography component="li" variant="body2" sx={{ mb: 0.5, lineHeight: 1.8 }}>You are responsible for maintaining the confidentiality of your login credentials.</Typography>
              <Typography component="li" variant="body2" sx={{ mb: 0.5, lineHeight: 1.8 }}>You are responsible for all activity that occurs under your account.</Typography>
              <Typography component="li" variant="body2" sx={{ mb: 0.5, lineHeight: 1.8 }}>You must be at least 18 years of age to use this service.</Typography>
            </Box>

            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>5. User Content &amp; Data</Typography>
            <Typography variant="body2" sx={{ mb: 2, lineHeight: 1.8 }}>
              You retain ownership of all data and content you enter into MyLifeFolio. By using the platform, you grant us a limited license to store, process, and display your data solely for the purpose of providing the service to you and your authorized contacts. We will not use your data for any other purpose without your explicit consent.
            </Typography>

            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>6. Family Access</Typography>
            <Typography variant="body2" sx={{ mb: 2, lineHeight: 1.8 }}>
              You may grant access to portions of your folio to designated family members or trusted contacts. You are solely responsible for managing who has access to your information. We are not liable for any consequences arising from access you have authorized.
            </Typography>

            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>7. Prohibited Uses</Typography>
            <Typography variant="body2" sx={{ mb: 1, lineHeight: 1.8 }}>You agree not to:</Typography>
            <Box component="ul" sx={{ pl: 2.5, mb: 2 }}>
              <Typography component="li" variant="body2" sx={{ mb: 0.5, lineHeight: 1.8 }}>Use the platform for any unlawful purpose.</Typography>
              <Typography component="li" variant="body2" sx={{ mb: 0.5, lineHeight: 1.8 }}>Attempt to gain unauthorized access to other users&apos; accounts or data.</Typography>
              <Typography component="li" variant="body2" sx={{ mb: 0.5, lineHeight: 1.8 }}>Interfere with or disrupt the platform&apos;s operation.</Typography>
              <Typography component="li" variant="body2" sx={{ mb: 0.5, lineHeight: 1.8 }}>Upload malicious code, viruses, or harmful content.</Typography>
            </Box>

            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>8. Limitation of Liability</Typography>
            <Typography variant="body2" sx={{ mb: 2, lineHeight: 1.8 }}>
              To the fullest extent permitted by law, Senior Care Resources LLC shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the platform. Our total liability shall not exceed the amount you have paid us in the twelve (12) months preceding the claim.
            </Typography>

            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>9. Disclaimer of Warranties</Typography>
            <Typography variant="body2" sx={{ mb: 2, lineHeight: 1.8 }}>
              The platform is provided &quot;as is&quot; and &quot;as available&quot; without warranties of any kind, whether express or implied, including but not limited to implied warranties of merchantability, fitness for a particular purpose, and non-infringement.
            </Typography>

            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>10. Termination</Typography>
            <Typography variant="body2" sx={{ mb: 2, lineHeight: 1.8 }}>
              We may suspend or terminate your access to the platform at any time for violation of these terms or for any other reason at our discretion. You may terminate your account at any time by contacting us. Upon termination, your right to use the platform ceases immediately.
            </Typography>

            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>11. Governing Law</Typography>
            <Typography variant="body2" sx={{ mb: 2, lineHeight: 1.8 }}>
              These Terms shall be governed by and construed in accordance with the laws of the Commonwealth of Pennsylvania, without regard to its conflict of law provisions.
            </Typography>

            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>12. Changes to Terms</Typography>
            <Typography variant="body2" sx={{ mb: 2, lineHeight: 1.8 }}>
              We reserve the right to modify these Terms at any time. We will notify registered users of material changes via email or through the platform. Continued use of the platform after changes constitutes acceptance of the revised terms.
            </Typography>

            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>13. Contact Us</Typography>
            <Typography variant="body2" sx={{ lineHeight: 1.8 }}>
              If you have questions about these Terms of Service, please contact us at support@seniorCareRes.com or write to Senior Care Resources LLC, 4500 Walnut Street, McKeesport, PA 15132.
            </Typography>
          </DialogContent>
          <DialogActions sx={{ px: 3, py: 1.5 }}>
            <Button onClick={() => setTermsOpen(false)} variant="contained" sx={{ bgcolor: 'primary.main' }}>Close</Button>
          </DialogActions>
        </Dialog>

        {/* ── SECURITY MODAL ── */}
        <SecurityInfoModal open={securityOpen} onClose={() => setSecurityOpen(false)} />

        {/* ── Free Trial Info Modal ── */}
        <Dialog
          open={trialModalOpen}
          onClose={() => setTrialModalOpen(false)}
          maxWidth="sm"
          fullWidth
          PaperProps={{ sx: { borderRadius: 3, overflow: 'hidden' } }}
        >
          <DialogTitle
            sx={{
              bgcolor: '#1e3a5f',
              color: 'white',
              fontFamily: '"Playfair Display", serif',
              fontWeight: 600,
              fontSize: '1.4rem',
              py: 2.5,
              px: 3,
            }}
          >
            12-Month Free Trial
          </DialogTitle>
          <DialogContent sx={{ px: 3, pt: 3, pb: 1 }}>
            <Typography sx={{ fontSize: '1rem', lineHeight: 1.8, color: '#1a1a1a', fontFamily: '"Source Sans 3", sans-serif' }}>
              MyLifeFolio is free for your first year — no credit card required. When you sign up,
              you get twelve months of full access to every feature on the platform, including
              document storage, asset tracking, legacy planning, and the Digital Credentials Vault.
            </Typography>
            <Typography sx={{ fontSize: '1rem', lineHeight: 1.8, color: '#1a1a1a', fontFamily: '"Source Sans 3", sans-serif', mt: 2 }}>
              If you were invited by your estate planning attorney, your account is set up as a
              complimentary client benefit and your access period may be adjusted accordingly.
            </Typography>
            <Typography sx={{ fontSize: '1rem', lineHeight: 1.8, color: '#1a1a1a', fontFamily: '"Source Sans 3", sans-serif', mt: 2 }}>
              As your trial period approaches its end, we'll send you a series of friendly reminders
              so you're never caught off guard. If you'd like to keep your MyLifeFolio after the free
              period, you can renew for <strong>$140 per year</strong> — everything you've built stays
              exactly as you left it.
            </Typography>
            <Typography sx={{ fontSize: '1rem', lineHeight: 1.8, color: '#1a1a1a', fontFamily: '"Source Sans 3", sans-serif', mt: 2 }}>
              If you choose not to renew, your data will remain on file for a grace period before
              being permanently deleted, giving you time to download and save anything you'd like to keep.
            </Typography>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3, pt: 2, gap: 1.5 }}>
            <Button
              onClick={() => setTrialModalOpen(false)}
              sx={{ color: 'text.secondary', textTransform: 'none', fontWeight: 600 }}
            >
              Close
            </Button>
            <Button
              variant="contained"
              onClick={() => {
                setTrialModalOpen(false);
                onRegister();
              }}
              sx={{
                bgcolor: '#c9a227',
                color: '#0f2744',
                fontWeight: 600,
                textTransform: 'none',
                px: 4,
                py: 1.2,
                fontSize: '1rem',
                '&:hover': { bgcolor: '#e8c547' },
              }}
            >
              Create Your Free Account
            </Button>
          </DialogActions>
        </Dialog>

      </Box>
    </ThemeProvider>
  );
};

export default LandingPage;
