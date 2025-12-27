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
  Dialog,
  DialogContent,
  IconButton,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CloseIcon from '@mui/icons-material/Close';
import LogoutIcon from '@mui/icons-material/Logout';
import { useFormContext } from '../lib/FormContext';
import { useAuth } from '../lib/AuthContext';
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
import Login from '../components/Login';
import Register from '../components/Register';
import { VideoHelpIcon } from '../components/FieldWithHelp';
import HelpModal from '../components/HelpModal';
import { MaritalStatus } from '../lib/FormContext';
import { analyzeEstatePlan, ANALYSIS_PROMPTS } from '../lib/claudeApi';

const SHOW_SPOUSE_STATUSES: MaritalStatus[] = ['Married', 'Second Marriage', 'Domestic Partnership'];

const ALL_STEPS = [
  'Personal Data',
  'Beneficiaries',
  'Assets',
  'Current Estate Plan',
  'Fiduciaries',
  'New Plan Provisions',
  'Long-Term Care',
  'Summary',
  'Analysis',
  'Review & Submit'
];

// Page type for routing
type PageType = 'landing' | 'estate-planning-home' | 'estate-planning-questionnaire' | 'long-term-care' | 'medicaid' | 'estate-administration';

interface QuestionnaireContentProps {
  onNavigateBack: () => void;
  onLogout: () => void;
}

const QuestionnaireContent: React.FC<QuestionnaireContentProps> = ({ onNavigateBack, onLogout }) => {
  const { formData, currentStep, setCurrentStep, clearFormData } = useFormContext();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [activeHelpId, setActiveHelpId] = useState<number | null>(null);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);

  const openHelp = (helpId: number) => setActiveHelpId(helpId);
  const closeHelp = () => setActiveHelpId(null);

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
    setAnalysisResult(null);

    try {
      // Submit to Claude API for analysis
      const result = await analyzeEstatePlan({
        formData: formData as unknown as Record<string, unknown>,
        prompt: ANALYSIS_PROMPTS.comprehensive,
      });

      if (result.success && result.analysis) {
        setAnalysisResult(result.analysis);
        setSubmitSuccess(true);
        setCurrentStep(currentStep + 1); // Move to results page
      } else {
        throw new Error(result.error || 'Failed to analyze estate plan');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      setSubmitError('Failed to analyze your estate plan. Please try again or contact support.');
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
      case 'New Plan Provisions':
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
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, color: '#1e3a5f', mb: 3 }}>
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
        // Analysis Results page (after submit)
        if (currentStep === totalSteps && analysisResult) {
          return (
            <Box sx={{ py: 2 }}>
              <Typography variant="h4" gutterBottom sx={{ color: '#1e3a5f', fontWeight: 600, textAlign: 'center' }}>
                Estate Planning Analysis
              </Typography>
              <Alert severity="info" sx={{ mb: 3 }}>
                This AI-generated analysis is for informational purposes only and does not constitute legal advice.
                Please review this with an attorney from Zacharia Brown & Bratkovich.
              </Alert>
              <Paper
                variant="outlined"
                sx={{
                  p: 3,
                  mb: 3,
                  bgcolor: '#fafafa',
                  '& p': { mb: 2 },
                  '& h1, & h2, & h3, & h4, & h5, & h6': {
                    color: '#1e3a5f',
                    fontWeight: 600,
                    mt: 3,
                    mb: 1.5
                  },
                  '& ul, & ol': { pl: 3, mb: 2 },
                  '& li': { mb: 0.5 },
                }}
              >
                <Typography
                  component="div"
                  sx={{
                    whiteSpace: 'pre-wrap',
                    lineHeight: 1.7,
                    '& strong': { fontWeight: 600 }
                  }}
                >
                  {analysisResult}
                </Typography>
              </Paper>
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 4 }}>
                <Button
                  variant="outlined"
                  onClick={() => {
                    setCurrentStep(0);
                    setSubmitSuccess(false);
                    setAnalysisResult(null);
                  }}
                >
                  Start New Questionnaire
                </Button>
                <Button
                  variant="contained"
                  sx={{ bgcolor: '#1e3a5f' }}
                  onClick={() => window.print()}
                >
                  Print Analysis
                </Button>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 4, textAlign: 'center' }}>
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
    <Box sx={{ minHeight: '100vh', bgcolor: '#e8eef4' }}>
      {/* Navigation Bar */}
      <AppBar position="static" sx={{ bgcolor: '#1e3a5f' }}>
        <Toolbar>
          <Button
            color="inherit"
            startIcon={<ArrowBackIcon />}
            onClick={onNavigateBack}
            sx={{ position: 'absolute', left: 16 }}
          >
            Back to Main
          </Button>
          <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1.5 }}>
            <Box
              component="img"
              src="/logo.jpg"
              alt="Zacharia Brown & Bratkovich Logo"
              sx={{ height: 40, width: 'auto', borderRadius: 1 }}
            />
            <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
              Zacharia Brown &amp; Bratkovich
            </Typography>
          </Box>
          {user && (
            <Button
              variant="contained"
              onClick={onLogout}
              startIcon={<LogoutIcon />}
              sx={{
                position: 'absolute',
                right: 16,
                bgcolor: '#d32f2f',
                color: 'white',
                fontWeight: 600,
                fontSize: '0.9rem',
                boxShadow: 'none',
                '&:hover': {
                  bgcolor: '#b71c1c',
                  boxShadow: '0 4px 12px rgba(211, 47, 47, 0.3)',
                },
              }}
            >
              Logout
            </Button>
          )}
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          {/* Header */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
              <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, color: '#1e3a5f', mb: 0 }} onClick={debugFormData}>
                Estate Planning Questionnaire
              </Typography>
              <VideoHelpIcon helpId={0} onClick={() => openHelp(0)} size="large" />
            </Box>
            <Typography variant="subtitle1" color="text.secondary">
              Zacharia Brown & Bratkovich
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Estate Planning & Elder Law Attorneys
            </Typography>
          </Box>

          {/* Help Modal */}
          <HelpModal
            open={activeHelpId !== null}
            onClose={closeHelp}
            helpId={activeHelpId ?? 0}
          />

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
                          color: disabled ? undefined : '#1e3a5f',
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
                    sx={{ bgcolor: '#1e3a5f' }}
                    startIcon={isSubmitting && <CircularProgress size={20} color="inherit" />}
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Questionnaire'}
                  </Button>
                ) : (
                  <Button variant="contained" onClick={handleNext} sx={{ bgcolor: '#1e3a5f' }}>
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
  const [showAuthModal, setShowAuthModal] = useState<'login' | 'register' | null>(null);
  const { signOut } = useAuth();

  const handleNavigate = (page: string) => {
    setCurrentPage(page as PageType);
    window.scrollTo(0, 0);
  };

  const handleLogout = async () => {
    await signOut();
    handleNavigate('landing');
  };

  const handleLogin = () => {
    setShowAuthModal('login');
  };

  const handleRegister = () => {
    setShowAuthModal('register');
  };

  const handleAuthSuccess = () => {
    setShowAuthModal(null);
    // Navigate to estate planning home after successful authentication
    handleNavigate('estate-planning-home');
  };

  const handleSwitchToLogin = () => {
    setShowAuthModal('login');
  };

  const handleSwitchToRegister = () => {
    setShowAuthModal('register');
  };

  const handleEducationItemClick = (itemId: string) => {
    // TODO: Implement education item navigation
    console.log('Education item clicked:', itemId);
  };

  const renderPage = () => {
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
            onLogout={handleLogout}
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
  };

  return (
    <>
      {renderPage()}

      {/* Authentication Modal */}
      <Dialog
        open={showAuthModal !== null}
        onClose={() => setShowAuthModal(null)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            overflow: 'visible',
          },
        }}
      >
        <IconButton
          onClick={() => setShowAuthModal(null)}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            zIndex: 1,
            color: 'text.secondary',
          }}
        >
          <CloseIcon />
        </IconButton>
        <DialogContent sx={{ p: 0 }}>
          {showAuthModal === 'login' ? (
            <Login
              onSwitchToRegister={handleSwitchToRegister}
              onSuccess={handleAuthSuccess}
            />
          ) : showAuthModal === 'register' ? (
            <Register
              onSwitchToLogin={handleSwitchToLogin}
              onSuccess={handleAuthSuccess}
            />
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
}
