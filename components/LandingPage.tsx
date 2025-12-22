'use client';

import React from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  CardMedia,
  Grid,
  AppBar,
  Toolbar,
} from '@mui/material';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import HealthAndSafetyIcon from '@mui/icons-material/HealthAndSafety';
import AssignmentIcon from '@mui/icons-material/Assignment';
import FamilyRestroomIcon from '@mui/icons-material/FamilyRestroom';
import LoginIcon from '@mui/icons-material/Login';
import PersonAddIcon from '@mui/icons-material/PersonAdd';

interface ServiceCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  onClick?: () => void;
  disabled?: boolean;
}

const ServiceCard: React.FC<ServiceCardProps> = ({
  title,
  description,
  icon,
  color,
  onClick,
  disabled = false,
}) => (
  <Card
    sx={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      transition: 'transform 0.2s, box-shadow 0.2s',
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.6 : 1,
      '&:hover': {
        transform: disabled ? 'none' : 'translateY(-4px)',
        boxShadow: disabled ? undefined : 6,
      },
    }}
    onClick={disabled ? undefined : onClick}
  >
    <Box
      sx={{
        bgcolor: color,
        py: 4,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Box sx={{ color: 'white', fontSize: 64 }}>{icon}</Box>
    </Box>
    <CardContent sx={{ flexGrow: 1 }}>
      <Typography variant="h6" component="h3" gutterBottom sx={{ fontWeight: 600 }}>
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {description}
      </Typography>
      {disabled && (
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block', fontStyle: 'italic' }}>
          Coming Soon
        </Typography>
      )}
    </CardContent>
  </Card>
);

interface LandingPageProps {
  onNavigate: (page: string) => void;
  onLogin?: () => void;
  onRegister?: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onNavigate, onLogin, onRegister }) => {
  const services = [
    {
      title: 'Estate Planning',
      description:
        'Create a comprehensive estate plan including wills, trusts, powers of attorney, and advance directives to protect your family and assets.',
      icon: <AccountBalanceIcon sx={{ fontSize: 64 }} />,
      color: '#1a237e',
      onClick: () => onNavigate('estate-planning-home'),
      disabled: false,
    },
    {
      title: 'Long-Term Care Planning',
      description:
        'Plan for your future care needs with strategies to protect your assets while ensuring you receive the care you deserve.',
      icon: <HealthAndSafetyIcon sx={{ fontSize: 64 }} />,
      color: '#2e7d32',
      onClick: () => onNavigate('long-term-care'),
      disabled: true,
    },
    {
      title: 'Medicaid Applications',
      description:
        'Navigate the complex Medicaid application process with guidance to help you qualify for benefits while preserving your assets.',
      icon: <AssignmentIcon sx={{ fontSize: 64 }} />,
      color: '#c62828',
      onClick: () => onNavigate('medicaid'),
      disabled: true,
    },
    {
      title: 'Estate Administration',
      description:
        'Settle an estate with confidence. We guide executors and administrators through probate and trust administration.',
      icon: <FamilyRestroomIcon sx={{ fontSize: 64 }} />,
      color: '#6a1b9a',
      onClick: () => onNavigate('estate-administration'),
      disabled: true,
    },
  ];

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f5f5' }}>
      {/* Navigation Bar */}
      <AppBar position="static" sx={{ bgcolor: '#1a237e' }}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 600 }}>
            Zacharia Brown & Bratkovich
          </Typography>
          <Button
            color="inherit"
            startIcon={<LoginIcon />}
            onClick={onLogin}
            sx={{ mr: 1 }}
          >
            Login
          </Button>
          <Button
            variant="outlined"
            color="inherit"
            startIcon={<PersonAddIcon />}
            onClick={onRegister}
            sx={{ borderColor: 'white' }}
          >
            Register
          </Button>
        </Toolbar>
      </AppBar>

      {/* Hero Section */}
      <Box
        sx={{
          bgcolor: '#1a237e',
          color: 'white',
          py: { xs: 6, md: 10 },
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={8}>
              <Typography
                variant="h2"
                component="h1"
                gutterBottom
                sx={{
                  fontWeight: 700,
                  fontSize: { xs: '2rem', md: '3rem' },
                }}
              >
                Protecting Your Family's Future
              </Typography>
              <Typography
                variant="h5"
                sx={{
                  mb: 4,
                  opacity: 0.9,
                  fontSize: { xs: '1.1rem', md: '1.5rem' },
                }}
              >
                Estate Planning & Elder Law Attorneys serving Southwest Florida
              </Typography>
              <Typography variant="body1" sx={{ mb: 4, maxWidth: 600, opacity: 0.85 }}>
                At Zacharia Brown & Bratkovich, we understand that planning for the future can feel
                overwhelming. Our experienced attorneys are here to guide you through every step,
                ensuring your wishes are honored and your loved ones are protected.
              </Typography>
              <Button
                variant="contained"
                size="large"
                onClick={() => onNavigate('estate-planning-home')}
                sx={{
                  bgcolor: 'white',
                  color: '#1a237e',
                  px: 4,
                  py: 1.5,
                  fontWeight: 600,
                  '&:hover': {
                    bgcolor: '#e8eaf6',
                  },
                }}
              >
                Get Started
              </Button>
            </Grid>
          </Grid>
        </Container>
        {/* Decorative element */}
        <Box
          sx={{
            position: 'absolute',
            right: -100,
            top: -100,
            width: 400,
            height: 400,
            borderRadius: '50%',
            bgcolor: 'rgba(255,255,255,0.05)',
            display: { xs: 'none', md: 'block' },
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            right: 50,
            bottom: -150,
            width: 300,
            height: 300,
            borderRadius: '50%',
            bgcolor: 'rgba(255,255,255,0.03)',
            display: { xs: 'none', md: 'block' },
          }}
        />
      </Box>

      {/* Services Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography
          variant="h4"
          component="h2"
          align="center"
          gutterBottom
          sx={{ fontWeight: 600, color: '#1a237e', mb: 2 }}
        >
          Our Services
        </Typography>
        <Typography
          variant="body1"
          align="center"
          color="text.secondary"
          sx={{ mb: 6, maxWidth: 600, mx: 'auto' }}
        >
          Select a service below to begin your intake questionnaire. Your information helps us
          better understand your needs before your consultation.
        </Typography>

        <Grid container spacing={4}>
          {services.map((service, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <ServiceCard {...service} />
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Contact Section */}
      <Box sx={{ bgcolor: 'white', py: 6 }}>
        <Container maxWidth="lg">
          <Grid container spacing={4} justifyContent="center">
            <Grid item xs={12} md={6} textAlign="center">
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, color: '#1a237e' }}>
                Contact Us
              </Typography>
              <Typography variant="body1" color="text.secondary" gutterBottom>
                Zacharia Brown & Bratkovich
              </Typography>
              <Typography variant="body2" color="text.secondary">
                26811 South Bay Dr. Ste 260
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Bonita Springs, Florida 34134
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Tel: (239) 345-4545
              </Typography>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Footer */}
      <Box sx={{ bgcolor: '#1a237e', color: 'white', py: 3 }}>
        <Container maxWidth="lg">
          <Typography variant="body2" align="center" sx={{ opacity: 0.8 }}>
            &copy; {new Date().getFullYear()} Zacharia Brown & Bratkovich. All rights reserved.
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};

export default LandingPage;
