'use client';

import React, { useEffect, useState, useMemo, useRef } from 'react';
import {
  Box, Container, Typography, Button, Card, CardContent,
  Grid, AppBar, Toolbar, Fade, Link, Dialog, DialogTitle,
  DialogContent, DialogActions, IconButton,
} from '@mui/material';
import { ThemeProvider, createTheme, alpha } from '@mui/material/styles';
import FavoriteIcon from '@mui/icons-material/Favorite';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import PeopleIcon from '@mui/icons-material/People';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import PhoneIcon from '@mui/icons-material/Phone';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import EmailIcon from '@mui/icons-material/Email';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import CloseIcon from '@mui/icons-material/Close';
import LogoutIcon from '@mui/icons-material/Logout';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import PersonIcon from '@mui/icons-material/Person';
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary';
import HistoryEduIcon from '@mui/icons-material/HistoryEdu';
import MedicalInformationIcon from '@mui/icons-material/MedicalInformation';
import ContactsIcon from '@mui/icons-material/Contacts';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import LockPersonIcon from '@mui/icons-material/LockPerson';
import { useAuth } from '../lib/AuthContext';

const isAdminUser = (email) => {
  if (!email) return false;
  return email.split('@')[1] === 'mylifefolio.com';
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
const ScrollFade = ({ children, delay = 0 }) => {
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
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0)' : 'translateY(28px)',
      transition: 'opacity 0.7s ease, transform 0.7s ease',
    }}>
      {children}
    </Box>
  );
};

// Chapter card for the "What's Inside" section
const ChapterCard = ({ icon, title, items, accentColor, delay = 0 }) => {
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

const LandingPage = ({ onNavigate, onLogin, onRegister, onAdmin, onProfile }) => {
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const { user, signOut } = useAuth();

  const handleLogout = async () => { await signOut(); onNavigate('landing'); };

  const primaryBtn = useMemo(() => user
    ? { text: 'Open My Folio', icon: <ArrowForwardIcon />, onClick: () => onNavigate('mylifefolio-home') }
    : { text: 'Create Your Folio', icon: <AutoStoriesIcon />, onClick: onRegister },
    [user, onNavigate, onRegister]);

  const chapters = [
    {
      icon: <MedicalInformationIcon sx={{ fontSize: 26 }} />,
      title: 'Health & Medical',
      accentColor: '#9b2226',
      items: [
        'Medical history & diagnoses',
        'Current medications & dosages',
        'Healthcare providers & specialists',
        'Insurance policies & ID numbers',
        'DNR & advance directive wishes',
        'Long-term care preferences',
      ],
    },
    {
      icon: <LocalHospitalIcon sx={{ fontSize: 26 }} />,
      title: 'Emergency & Care',
      accentColor: '#0077b6',
      items: [
        'Emergency contacts & priorities',
        'Trusted caregivers & aides',
        'Where I live & access details',
        'If I can\'t speak for myself…',
        'My daily routine & needs',
        'Dietary needs & allergies',
      ],
    },
    {
      icon: <AccountBalanceIcon sx={{ fontSize: 26 }} />,
      title: 'Financial Life',
      accentColor: '#1e3a5f',
      items: [
        'Bank & investment accounts',
        'Real estate & property',
        'Business interests',
        'Insurance policies',
        'Income sources & pensions',
        'Debts & obligations',
      ],
    },
    {
      icon: <ContactsIcon sx={{ fontSize: 26 }} />,
      title: 'My People & Advisors',
      accentColor: '#2d6a4f',
      items: [
        'Attorney & estate planner',
        'Financial advisor & CPA',
        'Insurance agents',
        'Close friends & neighbors',
        'Faith community contacts',
        'Professional relationships',
      ],
    },
    {
      icon: <HistoryEduIcon sx={{ fontSize: 26 }} />,
      title: 'Legal Documents',
      accentColor: '#7b2cbf',
      items: [
        'Will & trust documents',
        'Powers of attorney',
        'Deeds & titles',
        'Social Security & Medicare cards',
        'Birth & marriage certificates',
        'Location of important papers',
      ],
    },
    {
      icon: <VideoLibraryIcon sx={{ fontSize: 26 }} />,
      title: 'Legacy & Life Story',
      accentColor: '#c9a227',
      items: [
        'Video messages to loved ones',
        'Life lessons & wisdom',
        'Family history & memories',
        'Why I made the choices I did',
        'Photos & keepsakes index',
        'Messages for future milestones',
      ],
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
              <Box component="img" src="/logo.jpg" alt="MyLifeFolio" sx={{ height: { xs: 36, md: 40 }, width: { xs: 36, md: 40 }, borderRadius: '50%', border: '2px solid', borderColor: 'secondary.main', objectFit: 'cover' }} />
              <Typography sx={{ fontFamily: '"Playfair Display", serif', fontWeight: 600, fontSize: { xs: '1.1rem', md: '1.25rem' }, display: { xs: 'none', sm: 'block' } }}>
                MyLifeFolio
              </Typography>
            </Box>
            <Box sx={{ flexGrow: 1 }} />
            <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, md: 2 } }}>
              {user ? (
                <>
                  {onProfile && (
                    <Button variant="outlined" onClick={onProfile} startIcon={<PersonIcon />}
                      sx={{ borderColor: 'rgba(255,255,255,0.5)', color: 'white', '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.1)' } }}>
                      Profile
                    </Button>
                  )}
                  {isAdminUser(user.email) && onAdmin && (
                    <Button variant="outlined" onClick={onAdmin} startIcon={<AdminPanelSettingsIcon />}
                      sx={{ borderColor: 'rgba(255,255,255,0.5)', color: 'white', '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.1)' } }}>
                      Admin
                    </Button>
                  )}
                  <Button variant="contained" onClick={handleLogout} startIcon={<LogoutIcon />}
                    sx={{ bgcolor: '#d32f2f', color: 'white', '&:hover': { bgcolor: '#b71c1c' } }}>
                    Sign Out
                  </Button>
                </>
              ) : (
                <>
                  <Button color="inherit" onClick={onLogin} sx={{ opacity: 0.9, '&:hover': { opacity: 1, bgcolor: 'rgba(255,255,255,0.08)' } }}>
                    Sign In
                  </Button>
                  <Button variant="contained" onClick={onRegister}
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
                    Your life,
                    <Box component="span" sx={{ display: 'block', fontStyle: 'italic', color: 'secondary.main' }}>
                      documented with love.
                    </Box>
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
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 5, opacity: 0, animation: 'fadeUp 0.8s 0.55s ease forwards', '@keyframes fadeUp': { from: { opacity: 0, transform: 'translateY(20px)' }, to: { opacity: 1, transform: 'translateY(0)' } } }}>
                  <Button variant="contained" size="large" onClick={primaryBtn.onClick} endIcon={primaryBtn.icon}
                    sx={{ bgcolor: 'secondary.main', color: 'primary.dark', px: 4, py: 1.6, fontSize: '1rem', fontFamily: '"Source Sans 3", sans-serif', fontWeight: 700, '&:hover': { bgcolor: 'secondary.light', transform: 'translateY(-2px)', boxShadow: '0 8px 28px rgba(201,162,39,0.35)' }, transition: 'all 0.3s ease' }}>
                    {primaryBtn.text}
                  </Button>
                  <Button variant="outlined" size="large" onClick={() => setVideoModalOpen(true)} startIcon={<PlayCircleOutlineIcon />}
                    sx={{ borderColor: 'rgba(255,255,255,0.4)', color: 'white', px: 4, py: 1.6, fontFamily: '"Source Sans 3", sans-serif', '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.06)' } }}>
                    See How It Works
                  </Button>
                </Box>

                {/* Trust bar */}
                <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', opacity: 0, animation: 'fadeUp 0.8s 0.7s ease forwards', '@keyframes fadeUp': { from: { opacity: 0, transform: 'translateY(20px)' }, to: { opacity: 1, transform: 'translateY(0)' } } }}>
                  {[
                    <><LockPersonIcon sx={{ fontSize: 16 }} /> Bank-level encryption</>,
                    <><PeopleIcon sx={{ fontSize: 16 }} /> Share with trusted people</>,
                    <><AutoStoriesIcon sx={{ fontSize: 16 }} /> Your story, your way</>,
                  ].map((item, i) => (
                    <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 0.8, px: 2, py: 1, borderRadius: 1, bgcolor: alpha('#ffffff', 0.08), backdropFilter: 'blur(8px)' }}>
                      <Typography variant="body2" sx={{ color: alpha('#fff', 0.82), fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: 0.7, fontFamily: '"Source Sans 3", sans-serif' }}>{item}</Typography>
                    </Box>
                  ))}
                </Box>
              </Grid>

              {/* Hero right image */}
              <Grid item xs={12} md={5} sx={{ display: { xs: 'none', md: 'flex' }, justifyContent: 'center' }}>
                <Box sx={{ position: 'relative', opacity: 0, animation: 'fadeIn 1s 0.6s ease forwards', '@keyframes fadeIn': { from: { opacity: 0 }, to: { opacity: 1 } } }}>
                  <Box component="img" src="/mylifefolio.png" alt="MyLifeFolio" sx={{ width: 300, height: 300, borderRadius: '50%', objectFit: 'cover', border: '3px solid', borderColor: alpha('#c9a227', 0.4), boxShadow: `0 0 60px ${alpha('#c9a227', 0.15)}` }} />
                  <Box sx={{ position: 'absolute', bottom: 10, right: -30, bgcolor: 'white', color: 'primary.dark', px: 2.5, py: 1.5, borderRadius: 2, boxShadow: '0 12px 32px rgba(0,0,0,0.18)', minWidth: 160 }}>
                    <Typography sx={{ fontFamily: '"Source Sans 3", sans-serif', fontSize: '0.68rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'text.secondary', mb: 0.4 }}>Everything captured</Typography>
                    <Typography sx={{ fontFamily: '"Playfair Display", serif', fontSize: '1.9rem', fontWeight: 700, color: 'primary.main', lineHeight: 1 }}>100%</Typography>
                    <Typography sx={{ fontFamily: '"Source Sans 3", sans-serif', fontSize: '0.7rem', color: 'secondary.dark' }}>of what matters</Typography>
                  </Box>
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
                  The Six Chapters of Your Folio
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 560, mx: 'auto' }}>
                  Each chapter captures a different dimension of your life — so whoever opens your folio finds everything they need.
                </Typography>
              </Box>
            </ScrollFade>
            <Grid container spacing={3}>
              {chapters.map((ch, i) => (
                <Grid item xs={12} sm={6} lg={4} key={i}>
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
                <Button variant="contained" size="large" onClick={onRegister} endIcon={<AutoStoriesIcon />}
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

        {/* ── STATS BAND ── */}
        <Box sx={{ bgcolor: 'background.default', borderTop: '1px solid', borderBottom: '1px solid', borderColor: alpha('#1e3a5f', 0.08), py: { xs: 6, md: 8 } }}>
          <Container maxWidth="lg">
            <Grid container spacing={4} justifyContent="center">
              {[
                { number: '30+', label: 'Years of combined experience' },
                { number: '4', label: 'State licenses (FL, PA, OH, WV)' },
                { number: '1,000+', label: 'Families served' },
                { number: '100%', label: 'Personalized attention' },
              ].map((stat, i) => (
                <Grid item xs={6} md={3} key={i}>
                  <ScrollFade delay={i * 100}>
                    <Box sx={{ textAlign: 'center', p: 2 }}>
                      <Typography variant="h3" sx={{ color: 'secondary.dark', fontSize: { xs: '2rem', md: '2.5rem' }, mb: 0.5 }}>{stat.number}</Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ fontFamily: '"Source Sans 3", sans-serif', fontSize: '0.85rem' }}>{stat.label}</Typography>
                    </Box>
                  </ScrollFade>
                </Grid>
              ))}
            </Grid>
          </Container>
        </Box>

        {/* ── CONTACT ── */}
        <Box sx={{ background: 'linear-gradient(165deg, #1e3a5f 0%, #0f2744 100%)', color: 'white', py: { xs: 8, md: 10 } }}>
          <Container maxWidth="lg">
            <Grid container spacing={6}>
              <Grid item xs={12} md={6}>
                <ScrollFade>
                  <Typography component="span" sx={{ display: 'inline-block', color: 'secondary.main', fontFamily: '"Source Sans 3", sans-serif', fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', fontSize: '0.72rem', mb: 2 }}>
                    We're Here to Help
                  </Typography>
                  <Typography variant="h3" sx={{ fontSize: { xs: '1.8rem', md: '2.3rem' }, mb: 3 }}>
                    Questions? Talk to a real person.
                  </Typography>
                  <Typography variant="body1" sx={{ opacity: 0.85, mb: 4, maxWidth: 420, lineHeight: 1.85 }}>
                    Our team — including licensed estate planning attorneys in Florida and Pennsylvania —
                    is here to help you build your folio, answer questions, and make sure it truly covers everything.
                  </Typography>
                  <Button variant="contained" size="large" onClick={() => onNavigate('mylifefolio-home')}
                    sx={{ bgcolor: 'secondary.main', color: 'primary.dark', px: 4, py: 1.5, fontFamily: '"Source Sans 3", sans-serif', fontWeight: 700, '&:hover': { bgcolor: 'secondary.light' } }}>
                    Schedule a Consultation
                  </Button>
                </ScrollFade>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box sx={{ pl: { md: 4 } }}>
                  {[
                    { icon: <LocationOnIcon />, label: 'Office', lines: ['26811 South Bay Drive, Suite 270', 'Bonita Springs, Florida 34134'] },
                    { icon: <PhoneIcon />, label: 'Telephone', lines: ['(239) 345-4545'] },
                    { icon: <EmailIcon />, label: 'Email', lines: ['info@mylifefolio.com'] },
                  ].map((item, i) => (
                    <ScrollFade key={i} delay={i * 120}>
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 3.5 }}>
                        <Box sx={{ width: 44, height: 44, borderRadius: 1, bgcolor: alpha('#fff', 0.09), display: 'flex', justifyContent: 'center', alignItems: 'center', flexShrink: 0 }}>
                          <Box sx={{ color: 'secondary.main', display: 'flex' }}>{item.icon}</Box>
                        </Box>
                        <Box>
                          <Typography variant="h6" sx={{ fontSize: '0.9rem', mb: 0.4, fontFamily: '"Source Sans 3", sans-serif', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: alpha('#fff', 0.6) }}>
                            {item.label}
                          </Typography>
                          {item.lines.map((l, li) => (
                            <Typography key={li} variant="body2" sx={{ opacity: 0.85, fontFamily: '"Source Sans 3", sans-serif' }}>{l}</Typography>
                          ))}
                        </Box>
                      </Box>
                    </ScrollFade>
                  ))}
                </Box>
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
                © {new Date().getFullYear()} MyLifeFolio. All rights reserved.
              </Typography>
              <Box sx={{ display: 'flex', gap: 3 }}>
                {['Privacy Policy', 'Terms of Service'].map((t) => (
                  <Link key={t} href="#" underline="hover" sx={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', fontFamily: '"Source Sans 3", sans-serif' }}>{t}</Link>
                ))}
              </Box>
            </Box>
          </Container>
        </Box>

        {/* ── VIDEO MODAL ── */}
        <Dialog open={videoModalOpen} onClose={() => setVideoModalOpen(false)} maxWidth="md" fullWidth
          PaperProps={{ sx: { bgcolor: 'background.paper', borderRadius: 2 } }}>
          <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: 'primary.main', color: 'white', py: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <PlayCircleOutlineIcon />
              <Typography variant="h6" component="span">See How MyLifeFolio Works</Typography>
            </Box>
            <IconButton onClick={() => setVideoModalOpen(false)} sx={{ color: 'white' }} size="small"><CloseIcon /></IconButton>
          </DialogTitle>
          <DialogContent sx={{ p: 0 }}>
            <Box sx={{ position: 'relative', paddingTop: '56.25%', bgcolor: '#000' }}>
              <Box component="video" controls sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }} poster="/video-poster.jpg">
                <source src="/demo-video.mp4" type="video/mp4" />
              </Box>
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 2, justifyContent: 'space-between' }}>
            <Typography variant="body2" color="text.secondary">A short walkthrough of creating your folio</Typography>
            <Button onClick={() => setVideoModalOpen(false)} variant="outlined">Close</Button>
          </DialogActions>
        </Dialog>

      </Box>
    </ThemeProvider>
  );
};

export default LandingPage;
