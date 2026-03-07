'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  AppBar,
  Toolbar,
  Button,
  Paper,
  Fade,
} from '@mui/material';
import { ThemeProvider, createTheme, alpha } from '@mui/material/styles';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import BalanceIcon from '@mui/icons-material/Balance';
import LogoutIcon from '@mui/icons-material/Logout';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import PersonIcon from '@mui/icons-material/Person';
import PeopleIcon from '@mui/icons-material/People';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import CloudDoneIcon from '@mui/icons-material/CloudDone';
import SaveIcon from '@mui/icons-material/Save';
import { useAuth } from '../lib/AuthContext';
import { useFormContext } from '../lib/FormContext';
import { saveIntakeFull } from '../lib/supabaseIntake';
import { supabase } from '../lib/supabase';

const isAdminUser = (email: string | undefined): boolean => {
  if (!email) return false;
  const domain = email.split('@')[1];
  return domain === 'mylifefolio.com';
};

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

interface FolioCategoryPageProps {
  title: string;
  icon: React.ReactNode;
  accentColor: string;
  children: React.ReactNode;
  onNavigateBack: () => void;
  onLogin?: () => void;
  onRegister?: () => void;
  onAdmin?: () => void;
  onProfile?: () => void;
  onResources?: () => void;
}

const FolioCategoryPage: React.FC<FolioCategoryPageProps> = ({
  title,
  icon,
  accentColor,
  children,
  onNavigateBack,
  onLogin,
  onRegister,
  onAdmin,
  onProfile,
  onResources,
}) => {
  const [scrolled, setScrolled] = useState(false);
  const { user, signOut } = useAuth();
  const { formData } = useFormContext();

  // Auto-save state
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const saveTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  const authErrorShownRef = React.useRef(false);
  const [existingRawId, setExistingRawId] = useState<string | null>(null);
  const [existingIntakeId, setExistingIntakeId] = useState<string | null>(null);

  const handleLogout = async () => {
    await signOut();
    onNavigateBack();
  };

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Load existing intake IDs
  useEffect(() => {
    const loadExistingIntakeIds = async () => {
      if (!user) {
        setExistingRawId(null);
        setExistingIntakeId(null);
        return;
      }
      try {
        const { data: rawData } = await supabase
          .from('intakes_raw')
          .select('id')
          .eq('user_id', user.id)
          .eq('intake_type', 'EstatePlanning')
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();
        if (rawData?.id) setExistingRawId(rawData.id);

        const { data: intakeData } = await supabase
          .from('folio_intakes')
          .select('id')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();
        if (intakeData?.id) setExistingIntakeId(intakeData.id);
      } catch {
        // No existing intake found
      }
    };
    loadExistingIntakeIds();
  }, [user]);

  // Auto-save with debouncing
  useEffect(() => {
    if (!user) {
      setSaveError(null);
      authErrorShownRef.current = false;
      return;
    }

    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);

    saveTimeoutRef.current = setTimeout(async () => {
      if (authErrorShownRef.current) return;
      try {
        setIsSaving(true);
        setSaveError(null);
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError || !session) {
          setSaveError('Session expired. Please log in again.');
          authErrorShownRef.current = true;
          return;
        }
        const result = await saveIntakeFull(
          formData,
          'EstatePlanning',
          existingRawId || undefined,
          existingIntakeId || undefined
        );
        if (result.success) {
          setLastSaved(new Date());
          authErrorShownRef.current = false;
          if (result.intakeRawId && !existingRawId) setExistingRawId(result.intakeRawId);
          if (result.intakeId && !existingIntakeId) setExistingIntakeId(result.intakeId);
        } else {
          setSaveError('Failed to save');
        }
      } catch {
        setSaveError('Failed to save');
      } finally {
        setIsSaving(false);
      }
    }, 3000);

    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, [formData, user, existingRawId, existingIntakeId]);

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
                component="img" src="/logo.jpg" alt="MyLifeFolio"
                sx={{ height: { xs: 36, md: 40 }, width: { xs: 36, md: 40 }, borderRadius: '50%', border: '2px solid', borderColor: 'secondary.main', objectFit: 'cover' }}
              />
              <Typography sx={{ fontFamily: 'Georgia, "Times New Roman", serif', fontWeight: 600, fontSize: { xs: '1.1rem', md: '1.25rem' }, letterSpacing: '0.01em', display: { xs: 'none', sm: 'block' } }}>
                MyLifeFolio
              </Typography>
            </Box>

            <Box sx={{ position: 'absolute', right: 16, display: 'flex', alignItems: 'center', gap: { xs: 1, md: 2 } }}>
              {user ? (
                <>
                  {/* Save status indicator */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mr: 1 }}>
                    {isSaving ? (
                      <SaveIcon sx={{ fontSize: 16, color: 'rgba(255,255,255,0.6)', animation: 'pulse 1s infinite' }} />
                    ) : lastSaved ? (
                      <CloudDoneIcon sx={{ fontSize: 16, color: 'rgba(255,255,255,0.7)' }} />
                    ) : null}
                    {lastSaved && !isSaving && (
                      <Typography sx={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.6)', display: { xs: 'none', md: 'block' } }}>
                        Saved
                      </Typography>
                    )}
                  </Box>
                  {onProfile && (
                    <Button variant="outlined" onClick={onProfile} startIcon={<PeopleIcon />}
                      sx={{ borderColor: 'rgba(255,255,255,0.5)', color: 'white', fontWeight: 600, fontSize: '0.9rem', px: { xs: 2, md: 3 }, py: 1, '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.1)' } }}>
                      Family Access
                    </Button>
                  )}
                  {onResources && (
                    <Button variant="outlined" onClick={onResources} startIcon={<LibraryBooksIcon />}
                      sx={{ borderColor: 'rgba(255,255,255,0.5)', color: 'white', fontWeight: 600, fontSize: '0.9rem', px: { xs: 2, md: 3 }, py: 1, '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.1)' } }}>
                      Resources
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
            background: `linear-gradient(165deg, ${accentColor} 0%, ${alpha(accentColor, 0.85)} 50%, ${alpha(accentColor, 0.95)} 100%)`,
            color: 'white',
            pt: { xs: 14, md: 16 },
            pb: { xs: 4, md: 5 },
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <Box sx={{ position: 'absolute', inset: 0, opacity: 0.03, backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }} />
          <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
            <Fade in timeout={600}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ width: 56, height: 56, borderRadius: 2, display: 'flex', justifyContent: 'center', alignItems: 'center', bgcolor: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)' }}>
                  <Box sx={{ color: 'white', display: 'flex' }}>{icon}</Box>
                </Box>
                <Typography variant="h2" component="h1" sx={{ fontSize: { xs: '1.75rem', md: '2.25rem' } }}>
                  {title}
                </Typography>
              </Box>
            </Fade>
          </Container>
        </Box>

        {/* Main Content */}
        <Container maxWidth="lg" sx={{ py: { xs: 3, md: 4 }, mt: -2 }}>
          <Paper elevation={0} sx={{ p: { xs: 2, md: 4 }, border: '1px solid', borderColor: alpha(accentColor, 0.1) }}>
            {children}
          </Paper>
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
    </ThemeProvider>
  );
};

export default FolioCategoryPage;
