'use client';

import React from 'react';
import {
  Box,
  Container,
  Typography,
  AppBar,
  Toolbar,
  Button,
  Paper,
  Divider,
  Link,
} from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import GavelIcon from '@mui/icons-material/Gavel';
import CodeIcon from '@mui/icons-material/Code';
import FavoriteIcon from '@mui/icons-material/Favorite';
import LanguageIcon from '@mui/icons-material/Language';

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
  },
});

interface AboutPageProps {
  onNavigateBack: () => void;
}

const AboutPage: React.FC<AboutPageProps> = ({ onNavigateBack }) => (
  <ThemeProvider theme={theme}>
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* ── Top Bar ── */}
      <AppBar position="static" sx={{ bgcolor: 'primary.dark' }}>
        <Toolbar>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={onNavigateBack}
            sx={{ color: 'white', mr: 2 }}
          >
            Back
          </Button>
          <Typography variant="h6" sx={{ fontWeight: 600, fontFamily: '"Playfair Display", serif' }}>
            About Senior Care Resources
          </Typography>
        </Toolbar>
      </AppBar>

      {/* ── Hero Section ── */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #1e3a5f 0%, #0f2744 100%)',
          color: 'white',
          py: { xs: 6, md: 10 },
          textAlign: 'center',
        }}
      >
        <Container maxWidth="md">
          <Typography
            variant="h2"
            sx={{ fontSize: { xs: '2rem', md: '3rem' }, mb: 2 }}
          >
            Senior Care Resources
          </Typography>
          <Typography
            sx={{
              fontSize: { xs: '1.1rem', md: '1.3rem' },
              opacity: 0.85,
              fontFamily: '"Source Sans 3", sans-serif',
              lineHeight: 1.8,
              maxWidth: 600,
              mx: 'auto',
            }}
          >
            Helping families plan, protect, and preserve what matters most.
          </Typography>
          <Box sx={{ mt: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
            <LanguageIcon sx={{ color: 'secondary.main' }} />
            <Link
              href="https://www.SeniorCareRes.com"
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                color: 'secondary.main',
                fontFamily: '"Source Sans 3", sans-serif',
                fontSize: '1.1rem',
                fontWeight: 600,
                textDecoration: 'underline',
                '&:hover': { color: 'secondary.light' },
              }}
            >
              SeniorCareRes.com
            </Link>
          </Box>

          {/* Address Grid */}
          <Box
            sx={{
              mt: 4,
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
              gap: 4,
              maxWidth: 600,
              mx: 'auto',
            }}
          >
            {/* Pennsylvania */}
            <Box sx={{ textAlign: 'center' }}>
              <Typography
                sx={{
                  fontFamily: '"Playfair Display", serif',
                  fontWeight: 600,
                  fontSize: '1.05rem',
                  color: 'secondary.main',
                  mb: 1,
                }}
              >
                Pennsylvania Office
              </Typography>
              <Typography sx={{ fontFamily: '"Source Sans 3", sans-serif', fontSize: '0.95rem', opacity: 0.85, lineHeight: 1.8 }}>
                4500 Walnut Street<br />
                McKeesport, PA 15132<br />
                Tel: <Link href="tel:4127516101" sx={{ color: 'secondary.light', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>412-751-6101</Link>
              </Typography>
            </Box>

            {/* Florida */}
            <Box sx={{ textAlign: 'center' }}>
              <Typography
                sx={{
                  fontFamily: '"Playfair Display", serif',
                  fontWeight: 600,
                  fontSize: '1.05rem',
                  color: 'secondary.main',
                  mb: 1,
                }}
              >
                Florida Office
              </Typography>
              <Typography sx={{ fontFamily: '"Source Sans 3", sans-serif', fontSize: '0.95rem', opacity: 0.85, lineHeight: 1.8 }}>
                26811 South Bay Drive, Suite 270<br />
                Bonita Springs, FL 34134<br />
                Tel: <Link href="tel:2393454545" sx={{ color: 'secondary.light', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>239-345-4545</Link>
              </Typography>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* ── Main Content ── */}
      <Container maxWidth="md" sx={{ py: { xs: 4, md: 6 } }}>
        {/* About the Company */}
        <Paper elevation={0} sx={{ p: { xs: 3, md: 5 }, mb: 4, borderRadius: 3, border: '1px solid #e0d9cf' }}>
          <Typography variant="h4" sx={{ mb: 3, color: 'primary.main', fontSize: { xs: '1.5rem', md: '1.8rem' } }}>
            Who We Are
          </Typography>
          <Typography
            sx={{
              fontSize: '1.05rem',
              lineHeight: 1.9,
              color: 'text.secondary',
              fontFamily: '"Source Sans 3", sans-serif',
            }}
          >
            Senior Care Resources is dedicated to providing families with the tools, guidance, and
            expertise they need to navigate the complexities of elder care, estate planning, and
            life organization. We believe that every family deserves a clear, comprehensive plan —
            not just for the end of life, but for every stage along the way.
          </Typography>
          <Typography
            sx={{
              fontSize: '1.05rem',
              lineHeight: 1.9,
              color: 'text.secondary',
              fontFamily: '"Source Sans 3", sans-serif',
              mt: 2,
            }}
          >
            MyLifeFolio is our flagship product — a secure, all-in-one platform where you can
            document your health, finances, legal wishes, and personal story so the people who
            love you can find everything they need, when they need it most.
          </Typography>
        </Paper>

        <Divider sx={{ my: 4, borderColor: '#e0d9cf' }} />

        {/* About the Creator */}
        <Paper elevation={0} sx={{ p: { xs: 3, md: 5 }, mb: 4, borderRadius: 3, border: '1px solid #e0d9cf' }}>
          <Typography variant="h4" sx={{ mb: 3, color: 'primary.main', fontSize: { xs: '1.5rem', md: '1.8rem' } }}>
            About the Creator
          </Typography>

          <Typography
            variant="h5"
            sx={{
              mb: 2,
              color: 'secondary.dark',
              fontFamily: '"Playfair Display", serif',
              fontStyle: 'italic',
              fontSize: { xs: '1.3rem', md: '1.5rem' },
            }}
          >
            Carl Zacharia
          </Typography>

          {/* Elder Law */}
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 3 }}>
            <GavelIcon sx={{ color: 'primary.main', fontSize: 32, mt: 0.5, flexShrink: 0 }} />
            <Box>
              <Typography
                sx={{
                  fontWeight: 700,
                  fontSize: '1.05rem',
                  color: 'text.primary',
                  fontFamily: '"Source Sans 3", sans-serif',
                  mb: 0.5,
                }}
              >
                Elder Law Attorney — 30+ Years
              </Typography>
              <Typography
                sx={{
                  fontSize: '1.05rem',
                  lineHeight: 1.9,
                  color: 'text.secondary',
                  fontFamily: '"Source Sans 3", sans-serif',
                }}
              >
                Carl Zacharia has spent more than three decades practicing estate planning, estate administration and elder law in both
                Pennsylvania and Florida. Over those years, he has helped countless families
                navigate estate planning, Medicaid planning, long-term care decisions, asset
                protection, and guardianship matters. His deep experience with the real-world
                challenges families face when a loved one becomes ill, incapacitated, or passes
                away is the foundation upon which MyLifeFolio was built.
              </Typography>
            </Box>
          </Box>

          {/* Programming */}
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 3 }}>
            <CodeIcon sx={{ color: 'secondary.dark', fontSize: 32, mt: 0.5, flexShrink: 0 }} />
            <Box>
              <Typography
                sx={{
                  fontWeight: 700,
                  fontSize: '1.05rem',
                  color: 'text.primary',
                  fontFamily: '"Source Sans 3", sans-serif',
                  mb: 0.5,
                }}
              >
                Avid Programmer — 30+ Years
              </Typography>
              <Typography
                sx={{
                  fontSize: '1.05rem',
                  lineHeight: 1.9,
                  color: 'text.secondary',
                  fontFamily: '"Source Sans 3", sans-serif',
                }}
              >
                Before his career in law, Carl owned a computer business in Pittsburgh, worked for AT&T Data Systems Group and taught lawyers how to conduct legal research in the early days of computerized legal research.  This rare combination of legal expertise and technical skill gave him the ability to envision and build MyLifeFolio from the ground up: a platform designed by someone who truly understands both the legal complexities and real world problems families face.   
              </Typography>
              <Typography
                sx={{
                  fontSize: '1.05rem',
                  lineHeight: 1.9,
                  color: 'text.secondary',
                  fontFamily: '"Source Sans 3", sans-serif',
                  mt: 2,
                }}
              >
                Carl can be reached at{' '}
                <Link
                  href="mailto:carl@seniorcareres.com"
                  sx={{ color: 'primary.main', fontWeight: 600 }}
                >
                  carl@SeniorCareRes.com
                </Link>.
              </Typography>
            </Box>
          </Box>

          {/* Mission */}
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
            <FavoriteIcon sx={{ color: '#c62828', fontSize: 32, mt: 0.5, flexShrink: 0 }} />
            <Box>
              <Typography
                sx={{
                  fontWeight: 700,
                  fontSize: '1.05rem',
                  color: 'text.primary',
                  fontFamily: '"Source Sans 3", sans-serif',
                  mb: 0.5,
                }}
              >
                A Personal Mission
              </Typography>
              <Typography
                sx={{
                  fontSize: '1.05rem',
                  lineHeight: 1.9,
                  color: 'text.secondary',
                  fontFamily: '"Source Sans 3", sans-serif',
                }}
              >
                After decades of watching families struggle to locate critical documents,
                understand their loved one&apos;s wishes, or piece together financial and medical
                information during a crisis, Carl created MyLifeFolio to solve that problem
                once and for all. It is the guide your family wishes you had left behind.
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Container>

      {/* ── Footer ── */}
      <Box sx={{ bgcolor: '#0a1929', color: 'white', py: 4 }}>
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <FavoriteIcon sx={{ fontSize: 20, color: 'secondary.main' }} />
              <Typography sx={{ fontFamily: '"Playfair Display", serif', fontWeight: 500, fontSize: '1rem' }}>
                Senior Care Resources
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ opacity: 0.5, textAlign: 'center', fontFamily: '"Source Sans 3", sans-serif', fontSize: '0.8rem' }}>
              © {new Date().getFullYear()} Senior Care Resources. All rights reserved.
            </Typography>
            <Link
              href="https://www.SeniorCareRes.com"
              target="_blank"
              rel="noopener noreferrer"
              underline="hover"
              sx={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem', fontFamily: '"Source Sans 3", sans-serif' }}
            >
              SeniorCareRes.com
            </Link>
          </Box>
        </Container>
      </Box>
    </Box>
  </ThemeProvider>
);

export default AboutPage;
