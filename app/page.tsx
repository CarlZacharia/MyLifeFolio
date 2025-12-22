'use client';

import React, { useState } from 'react';
import {
  Container,
  Paper,
  Box,
  Typography,
  Stepper,
  Step,
  StepLabel,
  Button,
  Alert,
  Snackbar,
  CircularProgress,
  AppBar,
  Toolbar,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useFormContext } from '../lib/FormContext';
import PersonalDataSection from '../components/PersonalDataSection';
import BeneficiariesSection from '../components/BeneficiariesSection';
import DispositiveIntentionsSection from '../components/DispositiveIntentionsSection';
import CurrentEstatePlanSection from '../components/CurrentEstatePlanSection';
import FiduciariesSection from '../components/FiduciariesSection';
import LongTermCareSection from '../components/LongTermCareSection';
import AssetsSection from '../components/AssetsSection';
import SummarySection from '../components/SummarySection';
import EstatePlanAnalysis from '../components/EstatePlanAnalysis';
import LandingPage from '../components/LandingPage';
import EstatePlanningHome from '../components/EstatePlanningHome';
import axios from 'axios';
import { MaritalStatus } from '../lib/FormContext';

const SHOW_SPOUSE_STATUSES: MaritalStatus[] = ['Married', 'Second Marriage', 'Domestic Partnership'];

const ALL_STEPS = [
  'Personal Data',
  'Beneficiaries',
  'Assets',
  'Will/Trust Provisions',
  'Current Estate Plan',
  'Fiduciaries',
  'Long-Term Care',
  'Summary',
  'Analysis',
  'Review & Submit'
];

// Page type for routing
type PageType = 'landing' | 'estate-planning-home' | 'estate-planning-questionnaire' | 'long-term-care' | 'medicaid' | 'estate-administration';

interface QuestionnaireContentProps {
  onNavigateBack: () => void;
}

const QuestionnaireContent: React.FC<QuestionnaireContentProps> = ({ onNavigateBack }) => {
  const { formData, currentStep, setCurrentStep, clearFormData } = useFormContext();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Debug function to log all form data
  const debugFormData = () => {
    console.log('=== FORM DATA DEBUG ===');
    console.log('Full formData object:', formData);
    console.log('--- Personal Data ---');
    console.log('Name:', formData.name);
    console.log('Spouse:', formData.spouseName);
    console.log('Marital Status:', formData.maritalStatus);
    console.log('--- Trusts ---');
    console.log('Client Living Trust:', formData.clientHasLivingTrust, formData.clientLivingTrustName);
    console.log('Client Irrevocable Trust:', formData.clientHasIrrevocableTrust, formData.clientIrrevocableTrustName);
    console.log('Spouse Living Trust:', formData.spouseHasLivingTrust, formData.spouseLivingTrustName);
    console.log('Spouse Irrevocable Trust:', formData.spouseHasIrrevocableTrust, formData.spouseIrrevocableTrustName);
    console.log('--- Children ---');
    console.log('Children:', formData.children);
    console.log('--- Other Beneficiaries ---');
    console.log('Other Beneficiaries:', formData.otherBeneficiaries);
    console.log('--- Assets ---');
    console.log('Real Estate:', formData.realEstate);
    console.log('Bank Accounts:', formData.bankAccounts);
    console.log('Non-Qualified Investments:', formData.nonQualifiedInvestments);
    console.log('Retirement Accounts:', formData.retirementAccounts);
    console.log('Life Insurance:', formData.lifeInsurance);
    console.log('Vehicles:', formData.vehicles);
    console.log('Other Assets:', formData.otherAssets);
    console.log('Business Interests:', formData.businessInterests);
    console.log('Digital Assets:', formData.digitalAssets);
    console.log('--- Current Estate Plan ---');
    console.log('Client Current Estate Plan:', formData.clientCurrentEstatePlan);
    console.log('Spouse Current Estate Plan:', formData.spouseCurrentEstatePlan);
    console.log('=== END DEBUG ===');
  };

  const steps = ALL_STEPS;
  const totalSteps = steps.length;

  // No steps are disabled - Beneficiaries section handles empty states
  const isStepDisabled = (_stepName: string) => {
    return false;
  };

  const handleNext = () => {
    let nextStep = currentStep + 1;
    // Skip disabled steps
    while (nextStep < totalSteps && isStepDisabled(steps[nextStep])) {
      nextStep++;
    }
    setCurrentStep(nextStep);
    window.scrollTo(0, 0);
  };

  const handleBack = () => {
    let prevStep = currentStep - 1;
    // Skip disabled steps
    while (prevStep >= 0 && isStepDisabled(steps[prevStep])) {
      prevStep--;
    }
    setCurrentStep(prevStep);
    window.scrollTo(0, 0);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmitError('');

    try {
      const webhookUrl = import.meta.env.VITE_N8N_WEBHOOK_URL;

      if (!webhookUrl) {
        throw new Error('n8n webhook URL not configured');
      }

      // Submit to n8n webhook
      const response = await axios.post(webhookUrl, {
        formData,
        submittedAt: new Date().toISOString(),
      });

      if (response.status === 200) {
        setSubmitSuccess(true);
        clearFormData(); // Clear localStorage after successful submission
        setCurrentStep(currentStep + 1);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      setSubmitError('Failed to submit form. Please try again or contact support.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepContent = () => {
    // Map step index to component based on whether marital info is shown
    const stepName = steps[currentStep];

    switch (stepName) {
      case 'Personal Data':
        return <PersonalDataSection />;
      case 'Beneficiaries':
        return <BeneficiariesSection />;
      case 'Will/Trust Provisions':
        return <DispositiveIntentionsSection />;
      case 'Current Estate Plan':
        return <CurrentEstatePlanSection />;
      case 'Fiduciaries':
        return <FiduciariesSection />;
      case 'Long-Term Care':
        return <LongTermCareSection />;
      case 'Assets':
        return <AssetsSection />;
      case 'Summary':
        return <SummarySection />;
      case 'Analysis':
        return <EstatePlanAnalysis />;
      case 'Review & Submit':
        return (
          <Box>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, color: '#1a237e', mb: 3 }}>
              Review & Submit
            </Typography>
            <Alert severity="info" sx={{ mb: 3 }}>
              Please review your information before submitting. You can go back to any section to make changes.
            </Alert>
            <Typography variant="body1" sx={{ mb: 2 }}>
              Thank you for completing the Estate Planning Questionnaire. By clicking "Submit",
              your information will be securely sent to Zacharia Brown & Bratkovich for review.
            </Typography>
            <Typography variant="body2" color="text.secondary">
              We will contact you shortly to schedule or confirm your consultation appointment.
            </Typography>
          </Box>
        );
      default:
        // Success page (after submit)
        if (currentStep === totalSteps) {
          return (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="h4" gutterBottom sx={{ color: '#1a237e' }}>
                Thank You!
              </Typography>
              <Typography variant="h6" sx={{ mb: 3 }}>
                Your estate planning questionnaire has been successfully submitted.
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Our team will review your information and contact you shortly.
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                Zacharia Brown & Bratkovich
                <br />
                26811 South Bay Dr. Ste 260
                <br />
                Bonita Springs, Florida 34134
                <br />
                Tel: (239) 345-4545
              </Typography>
            </Box>
          );
        }
        return null;
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f5f5' }}>
      {/* Navigation Bar */}
      <AppBar position="static" sx={{ bgcolor: '#1a237e' }}>
        <Toolbar>
          <Button
            color="inherit"
            startIcon={<ArrowBackIcon />}
            onClick={onNavigateBack}
            sx={{ mr: 2 }}
          >
            Back to Estate Planning
          </Button>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 600 }}>
            Estate Planning Questionnaire
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          {/* Header */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, color: '#1a237e' }} onClick={debugFormData}>
              Estate Planning Questionnaire
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Zacharia Brown & Bratkovich
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Estate Planning & Elder Law Attorneys
            </Typography>
          </Box>

          {/* Stepper */}
          {currentStep < totalSteps && (
            <Box sx={{ mb: 4 }}>
              <Stepper activeStep={currentStep} alternativeLabel>
                {steps.map((label, index) => {
                  const disabled = isStepDisabled(label);
                  return (
                    <Step
                      key={label}
                      disabled={disabled}
                      onClick={() => {
                        if (!disabled) {
                          setCurrentStep(index);
                          window.scrollTo(0, 0);
                        }
                      }}
                      sx={{
                        cursor: disabled ? 'not-allowed' : 'pointer',
                        opacity: disabled ? 0.5 : 1,
                        '& .MuiStepLabel-root': {
                          cursor: disabled ? 'not-allowed' : 'pointer',
                          transition: 'transform 0.2s ease-in-out',
                        },
                        '& .MuiStepLabel-label': {
                          cursor: disabled ? 'not-allowed' : 'pointer',
                          color: disabled ? 'text.disabled' : undefined,
                        },
                        '& .MuiStepIcon-root': {
                          cursor: disabled ? 'not-allowed' : 'pointer',
                        },
                        '&:hover .MuiStepLabel-root': {
                          transform: disabled ? 'none' : 'scale(1.1)',
                        },
                        '&:hover .MuiStepIcon-root': {
                          color: disabled ? undefined : '#1a237e',
                        },
                      }}
                    >
                      <StepLabel>{label}</StepLabel>
                    </Step>
                  );
                })}
              </Stepper>
            </Box>
          )}

          {/* Content */}
          <Box sx={{ mb: 4 }}>{renderStepContent()}</Box>

          {/* Navigation Buttons */}
          {currentStep < totalSteps && (
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
              <Button
                variant="outlined"
                onClick={handleBack}
                disabled={currentStep === 0 || isSubmitting}
              >
                Back
              </Button>
              <Box>
                {currentStep === totalSteps - 1 ? (
                  <Button
                    variant="contained"
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    sx={{ bgcolor: '#1a237e' }}
                    startIcon={isSubmitting && <CircularProgress size={20} color="inherit" />}
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Questionnaire'}
                  </Button>
                ) : (
                  <Button variant="contained" onClick={handleNext} sx={{ bgcolor: '#1a237e' }}>
                    Continue
                  </Button>
                )}
              </Box>
            </Box>
          )}
        </Paper>

        {/* Error Snackbar */}
        <Snackbar
          open={!!submitError}
          autoHideDuration={6000}
          onClose={() => setSubmitError('')}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert onClose={() => setSubmitError('')} severity="error" sx={{ width: '100%' }}>
            {submitError}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
};

export default function MainPage() {
  const [currentPage, setCurrentPage] = useState<PageType>('landing');

  const handleNavigate = (page: string) => {
    setCurrentPage(page as PageType);
    window.scrollTo(0, 0);
  };

  const handleLogin = () => {
    // TODO: Implement login functionality
    console.log('Login clicked');
  };

  const handleRegister = () => {
    // TODO: Implement register functionality
    console.log('Register clicked');
  };

  const handleEducationItemClick = (itemId: string) => {
    // TODO: Implement education item navigation
    console.log('Education item clicked:', itemId);
  };

  switch (currentPage) {
    case 'landing':
      return (
        <LandingPage
          onNavigate={handleNavigate}
          onLogin={handleLogin}
          onRegister={handleRegister}
        />
      );

    case 'estate-planning-home':
      return (
        <EstatePlanningHome
          onNavigateBack={() => handleNavigate('landing')}
          onStartQuestionnaire={() => handleNavigate('estate-planning-questionnaire')}
          onEducationItemClick={handleEducationItemClick}
          onLogin={handleLogin}
          onRegister={handleRegister}
        />
      );

    case 'estate-planning-questionnaire':
      return (
        <QuestionnaireContent
          onNavigateBack={() => handleNavigate('estate-planning-home')}
        />
      );

    // Placeholder pages for future services
    case 'long-term-care':
    case 'medicaid':
    case 'estate-administration':
      return (
        <Box sx={{ minHeight: '100vh', bgcolor: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h4" gutterBottom>Coming Soon</Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              This service is currently under development.
            </Typography>
            <Button variant="contained" onClick={() => handleNavigate('landing')}>
              Return to Home
            </Button>
          </Paper>
        </Box>
      );

    default:
      return (
        <LandingPage
          onNavigate={handleNavigate}
          onLogin={handleLogin}
          onRegister={handleRegister}
        />
      );
  }
}
