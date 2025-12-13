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
} from '@mui/material';
import { FormProvider, useFormContext } from '../lib/FormContext';
import PersonalDataSection from '../components/PersonalDataSection';
import MaritalInfoSection from '../components/MaritalInfoSection';
import ChildrenSection from '../components/ChildrenSection';
import OtherBeneficiariesSection from '../components/OtherBeneficiariesSection';
import DispositiveIntentionsSection from '../components/DispositiveIntentionsSection';
import FiduciariesSection from '../components/FiduciariesSection';
import AssetsSection from '../components/AssetsSection';
import axios from 'axios';
import { MaritalStatus } from '../lib/FormContext';

const SHOW_MARITAL_INFO_STATUSES: MaritalStatus[] = ['Married', 'Second Marriage', 'Domestic Partnership'];

const getSteps = (showMaritalInfo: boolean) => {
  if (showMaritalInfo) {
    return [
      'Personal Data',
      'Marital Information',
      'Children',
      'Other Beneficiaries',
      'Dispositive Intentions',
      'Fiduciaries',
      'Assets',
      'Review & Submit',
    ];
  }
  return [
    'Personal Data',
    'Children',
    'Other Beneficiaries',
    'Dispositive Intentions',
    'Fiduciaries',
    'Assets',
    'Review & Submit',
  ];
};

const QuestionnaireContent = () => {
  const { formData, currentStep, setCurrentStep } = useFormContext();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const showMaritalInfo = SHOW_MARITAL_INFO_STATUSES.includes(formData.maritalStatus);
  const steps = getSteps(showMaritalInfo);
  const totalSteps = steps.length;

  const handleNext = () => {
    setCurrentStep(currentStep + 1);
    window.scrollTo(0, 0);
  };

  const handleBack = () => {
    setCurrentStep(currentStep - 1);
    window.scrollTo(0, 0);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmitError('');

    try {
      const webhookUrl = process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL;

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
      case 'Marital Information':
        return <MaritalInfoSection />;
      case 'Children':
        return <ChildrenSection />;
      case 'Other Beneficiaries':
        return <OtherBeneficiariesSection />;
      case 'Dispositive Intentions':
        return <DispositiveIntentionsSection />;
      case 'Fiduciaries':
        return <FiduciariesSection />;
      case 'Assets':
        return <AssetsSection />;
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
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, color: '#1a237e' }}>
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
              {steps.map((label, index) => (
                <Step
                  key={label}
                  onClick={() => {
                    setCurrentStep(index);
                    window.scrollTo(0, 0);
                  }}
                  sx={{
                    cursor: 'pointer',
                    '& .MuiStepLabel-root': {
                      cursor: 'pointer',
                      transition: 'transform 0.2s ease-in-out',
                    },
                    '& .MuiStepLabel-label': {
                      cursor: 'pointer',
                    },
                    '& .MuiStepIcon-root': {
                      cursor: 'pointer',
                    },
                    '&:hover .MuiStepLabel-root': {
                      transform: 'scale(1.1)',
                    },
                    '&:hover .MuiStepIcon-root': {
                      color: '#1a237e',
                    },
                  }}
                >
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
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
  );
};

export default function QuestionnairePage() {
  return (
    <FormProvider>
      <QuestionnaireContent />
    </FormProvider>
  );
}
