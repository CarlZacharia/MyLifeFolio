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
  Backdrop,
  TextField,
  MenuItem,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CloseIcon from '@mui/icons-material/Close';
import LogoutIcon from '@mui/icons-material/Logout';
import DownloadIcon from '@mui/icons-material/Download';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, Table, TableRow, TableCell, WidthType, BorderStyle } from 'docx';
import { saveAs } from 'file-saver';
import { useFormContext, OfficeInfo, AttorneyInfo } from '../lib/FormContext';
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
import { categorizeAssets } from '../lib/assetCategorization';
import { saveIntakeFull } from '../lib/supabaseIntake';
import {
  generateClientFolderName,
  saveAnalysisReports,
  updateIntakeAnalysis,
  updateIntakeStorageInfo,
} from '../lib/supabaseStorage';
import { getActiveOffices, getActiveAttorneys } from '../lib/supabaseOfficesAttorneys';

const SHOW_SPOUSE_STATUSES: MaritalStatus[] = ['Married', 'Second Marriage', 'Domestic Partnership'];

// Helper function to parse text with bold markdown into TextRuns
const parseTextWithBold = (text: string, baseBold = false): TextRun[] => {
  const parts: TextRun[] = [];
  const boldRegex = /\*\*(.*?)\*\*/g;
  let lastIndex = 0;
  let match;

  while ((match = boldRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(new TextRun({ text: text.slice(lastIndex, match.index), bold: baseBold }));
    }
    parts.push(new TextRun({ text: match[1], bold: true }));
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    parts.push(new TextRun({ text: text.slice(lastIndex), bold: baseBold }));
  }

  if (parts.length === 0) {
    parts.push(new TextRun({ text, bold: baseBold }));
  }

  return parts;
};

// Helper function to parse a markdown table row
const parseTableRow = (line: string): string[] => {
  return line
    .split('|')
    .map(cell => cell.trim())
    .filter((cell, index, arr) => index > 0 && index < arr.length - 1 || (index === 0 && cell) || (index === arr.length - 1 && cell));
};

// Helper function to check if a line is a table separator
const isTableSeparator = (line: string): boolean => {
  return /^\|?\s*[-:]+\s*\|/.test(line) && line.includes('-');
};

// Helper function to convert markdown to Word document
const markdownToDocx = (markdown: string, clientName: string): Document => {
  const lines = markdown.split('\n');
  const children: (Paragraph | Table)[] = [];

  // Add header
  children.push(
    new Paragraph({
      children: [
        new TextRun({
          text: 'ESTATE PLANNING ANALYSIS',
          bold: true,
          size: 32,
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
    })
  );

  children.push(
    new Paragraph({
      children: [
        new TextRun({
          text: `Prepared for: ${clientName}`,
          size: 24,
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
    })
  );

  children.push(
    new Paragraph({
      children: [
        new TextRun({
          text: `Date: ${new Date().toLocaleDateString()}`,
          size: 24,
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
    })
  );

  let inList = false;
  let i = 0;

  while (i < lines.length) {
    const trimmedLine = lines[i].trim();

    if (!trimmedLine) {
      children.push(new Paragraph({ text: '' }));
      i++;
      continue;
    }

    // Check if this is the start of a table
    if (trimmedLine.startsWith('|') && i + 1 < lines.length && isTableSeparator(lines[i + 1])) {
      const tableRows: TableRow[] = [];
      const headerCells = parseTableRow(trimmedLine);

      // Create header row with shading
      tableRows.push(
        new TableRow({
          children: headerCells.map(cell =>
            new TableCell({
              children: [new Paragraph({ children: parseTextWithBold(cell, true) })],
              shading: { fill: 'E8E8E8' },
            })
          ),
        })
      );

      i += 2; // Skip header and separator lines

      // Parse data rows
      while (i < lines.length && lines[i].trim().startsWith('|')) {
        const rowCells = parseTableRow(lines[i].trim());
        if (rowCells.length > 0) {
          tableRows.push(
            new TableRow({
              children: rowCells.map(cell =>
                new TableCell({
                  children: [new Paragraph({ children: parseTextWithBold(cell) })],
                })
              ),
            })
          );
        }
        i++;
      }

      // Create the table
      if (tableRows.length > 0) {
        children.push(
          new Table({
            rows: tableRows,
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: {
              top: { style: BorderStyle.SINGLE, size: 1, color: '999999' },
              bottom: { style: BorderStyle.SINGLE, size: 1, color: '999999' },
              left: { style: BorderStyle.SINGLE, size: 1, color: '999999' },
              right: { style: BorderStyle.SINGLE, size: 1, color: '999999' },
              insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: '999999' },
              insideVertical: { style: BorderStyle.SINGLE, size: 1, color: '999999' },
            },
          })
        );
        children.push(new Paragraph({ text: '' })); // Add spacing after table
      }
      continue;
    }

    // Handle headings
    if (trimmedLine.startsWith('### ')) {
      const headingText = trimmedLine.replace('### ', '').replace(/\*\*/g, '');
      children.push(
        new Paragraph({
          children: [new TextRun({ text: headingText, bold: true })],
          heading: HeadingLevel.HEADING_3,
          spacing: { before: 240, after: 120 },
        })
      );
    } else if (trimmedLine.startsWith('## ')) {
      const headingText = trimmedLine.replace('## ', '').replace(/\*\*/g, '');
      children.push(
        new Paragraph({
          children: [new TextRun({ text: headingText, bold: true })],
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 300, after: 150 },
        })
      );
    } else if (trimmedLine.startsWith('# ')) {
      const headingText = trimmedLine.replace('# ', '').replace(/\*\*/g, '');
      children.push(
        new Paragraph({
          children: [new TextRun({ text: headingText, bold: true })],
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 400, after: 200 },
        })
      );
    }
    // Handle bullet points
    else if (trimmedLine.startsWith('- ') || trimmedLine.startsWith('* ')) {
      const text = trimmedLine.replace(/^[-*]\s/, '');
      const bulletRuns = parseTextWithBold(text);
      children.push(
        new Paragraph({
          children: [new TextRun({ text: '• ' }), ...bulletRuns],
          indent: { left: 720 },
          spacing: { after: 60 },
        })
      );
      inList = true;
    }
    // Handle numbered lists
    else if (/^\d+\.\s/.test(trimmedLine)) {
      const text = trimmedLine.replace(/^\d+\.\s/, '');
      const num = trimmedLine.match(/^(\d+)\./)?.[1] || '1';
      const listRuns = parseTextWithBold(text);
      children.push(
        new Paragraph({
          children: [new TextRun({ text: `${num}. ` }), ...listRuns],
          indent: { left: 720 },
          spacing: { after: 60 },
        })
      );
      inList = true;
    }
    // Handle regular paragraphs with bold text
    else {
      children.push(
        new Paragraph({
          children: parseTextWithBold(trimmedLine),
          spacing: { after: inList ? 60 : 120 },
        })
      );
      inList = false;
    }

    i++;
  }

  // Add footer
  children.push(
    new Paragraph({
      text: '',
      spacing: { before: 400 },
    })
  );

  children.push(
    new Paragraph({
      children: [
        new TextRun({
          text: 'This analysis is for informational purposes only and does not constitute legal advice.',
          italics: true,
          size: 20,
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
    })
  );

  children.push(
    new Paragraph({
      children: [
        new TextRun({
          text: 'Zacharia Brown & Bratkovich',
          bold: true,
        }),
      ],
      alignment: AlignmentType.CENTER,
    })
  );

  children.push(
    new Paragraph({
      text: '26811 South Bay Dr. Ste 260',
      alignment: AlignmentType.CENTER,
    })
  );

  children.push(
    new Paragraph({
      text: 'Bonita Springs, Florida 34134',
      alignment: AlignmentType.CENTER,
    })
  );

  children.push(
    new Paragraph({
      text: 'Tel: (239) 345-4545',
      alignment: AlignmentType.CENTER,
    })
  );

  return new Document({
    sections: [
      {
        properties: {},
        children,
      },
    ],
  });
};

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
  const { formData, updateFormData, currentStep, setCurrentStep, clearFormData } = useFormContext();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [activeHelpId, setActiveHelpId] = useState<number | null>(null);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);

  // Office and Attorney state for Review & Submit page
  const [offices, setOffices] = useState<OfficeInfo[]>([]);
  const [attorneys, setAttorneys] = useState<AttorneyInfo[]>([]);
  const [loadingOfficesAttorneys, setLoadingOfficesAttorneys] = useState(false);

  // Load offices and attorneys when component mounts
  React.useEffect(() => {
    const loadOfficesAndAttorneys = async () => {
      setLoadingOfficesAttorneys(true);
      try {
        const [officesResult, attorneysResult] = await Promise.all([
          getActiveOffices(),
          getActiveAttorneys(),
        ]);
        if (officesResult.success) {
          setOffices(officesResult.offices);
        }
        if (attorneysResult.success) {
          setAttorneys(attorneysResult.attorneys);
        }
      } catch (err) {
        console.error('Failed to load offices/attorneys:', err);
      } finally {
        setLoadingOfficesAttorneys(false);
      }
    };
    loadOfficesAndAttorneys();
  }, []);

  const openHelp = (helpId: number) => setActiveHelpId(helpId);
  const closeHelp = () => setActiveHelpId(null);

  // Debug function to log all form data
  const debugFormData = () => {
    console.log('=== FORM DATA DEBUG ===');
    console.log('Full formData object:', JSON.stringify(formData));
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

  // Reset step if it's beyond valid range (e.g., after page reload when analysisResult is lost)
  React.useEffect(() => {
    if (currentStep >= totalSteps && !analysisResult) {
      // Reset to the last valid step (Review & Submit)
      setCurrentStep(totalSteps - 1);
    }
  }, [currentStep, totalSteps, analysisResult, setCurrentStep]);

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
      // Step 1: Generate client folder name for storage
      const clientName = formData.name || 'Unknown Client';
      const clientFolderName = generateClientFolderName(clientName);

      // Step 2: Save form data to Supabase (both raw JSON and normalized tables)
      const saveResult = await saveIntakeFull(formData, 'EstatePlanning');
      if (!saveResult.success) {
        console.error('Failed to save intake to Supabase:', saveResult.error);
        // Continue with analysis even if save fails - we don't want to block the user
      }

      const intakeId = saveResult.intakeRawId;

      // Step 3: Pre-compute asset categorization for consistency
      const assetCategorySummary = categorizeAssets(formData);

      // Step 4: Submit to Claude API for analysis with pre-computed categories
      const result = await analyzeEstatePlan({
        formData: formData as unknown as Record<string, unknown>,
        assetCategorySummary,
        prompt: ANALYSIS_PROMPTS.comprehensive,
      });

      if (result.success && result.analysis) {
        setAnalysisResult(result.analysis);
        setSubmitSuccess(true);

        // Step 5: If we have an intake ID, save the analysis and reports
        if (intakeId) {
          // Save Claude analysis to the intake record
          await updateIntakeAnalysis(
            intakeId,
            result.analysis,
            result.usage ? {
              input_tokens: result.usage.input_tokens,
              output_tokens: result.usage.output_tokens,
            } : undefined
          );

          // Save analysis reports to storage (both txt and docx)
          const reportsResult = await saveAnalysisReports(
            result.analysis,
            clientFolderName,
            clientName
          );

          if (reportsResult.success) {
            // Update intake with storage folder and report files
            await updateIntakeStorageInfo(
              intakeId,
              clientFolderName,
              undefined, // uploaded_files (handled elsewhere during document upload)
              reportsResult.reports
            );
          } else if (reportsResult.errors.length > 0) {
            console.warn('Some reports failed to save:', reportsResult.errors);
          }
        }

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
            <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
              We will contact you shortly to schedule or confirm your consultation appointment.
            </Typography>

            {/* Office Selection */}
            <Box sx={{ mb: 3 }}>
              <TextField
                select
                fullWidth
                label="Office *"
                value={formData.officeId}
                onChange={(e) => {
                  const selectedOffice = offices.find((o) => o.id === e.target.value);
                  updateFormData({
                    officeId: e.target.value,
                    officeName: selectedOffice?.name || '',
                  });
                }}
                disabled={loadingOfficesAttorneys}
                error={!formData.officeId}
                helperText={!formData.officeId ? 'Please select an office' : ''}
              >
                <MenuItem value="">
                  <em>Select an office...</em>
                </MenuItem>
                {offices.map((office) => (
                  <MenuItem key={office.id} value={office.id}>
                    {office.name}{office.city && office.state ? ` - ${office.city}, ${office.state}` : ''}
                  </MenuItem>
                ))}
              </TextField>
            </Box>

            {/* Attorney Selection */}
            <Box sx={{ mb: 3 }}>
              <TextField
                select
                fullWidth
                label="Attorney *"
                value={formData.attorneyId}
                onChange={(e) => {
                  const selectedAttorney = attorneys.find((a) => a.id === e.target.value);
                  updateFormData({
                    attorneyId: e.target.value,
                    attorneyName: selectedAttorney?.name || '',
                  });
                }}
                disabled={loadingOfficesAttorneys}
                error={!formData.attorneyId}
                helperText={!formData.attorneyId ? 'Please select an attorney' : ''}
              >
                <MenuItem value="">
                  <em>Select an attorney...</em>
                </MenuItem>
                {attorneys.map((attorney) => (
                  <MenuItem key={attorney.id} value={attorney.id}>
                    {attorney.name}
                  </MenuItem>
                ))}
              </TextField>
            </Box>

            {/* Comments Section */}
            <Box sx={{ mt: 4 }}>
              <Typography variant="h6" sx={{ mb: 2, color: '#1e3a5f' }}>
                Comments & Notes
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Additional Comments (Optional)"
                placeholder="Enter any additional comments, questions, or explanatory notes for the law firm..."
                value={formData.submissionComments}
                onChange={(e) => updateFormData({ submissionComments: e.target.value })}
                helperText="Use this space to provide any additional information or context that may be helpful for your estate planning consultation."
              />
            </Box>
          </Box>
        );
      default:
        // Analysis Results page (after submit)
        if (currentStep === totalSteps && analysisResult) {
          const handleDownloadWord = async () => {
            const clientName = formData.name || 'Client';
            const doc = markdownToDocx(analysisResult, clientName);
            const blob = await Packer.toBlob(doc);
            const fileName = `Estate_Planning_Analysis_${clientName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.docx`;
            saveAs(blob, fileName);
          };

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
                  '& h1': { fontSize: '1.8rem', color: '#1e3a5f', fontWeight: 600, mt: 3, mb: 1.5, borderBottom: '2px solid #1e3a5f', pb: 1 },
                  '& h2': { fontSize: '1.5rem', color: '#1e3a5f', fontWeight: 600, mt: 3, mb: 1.5 },
                  '& h3': { fontSize: '1.25rem', color: '#1e3a5f', fontWeight: 600, mt: 2, mb: 1 },
                  '& h4': { fontSize: '1.1rem', color: '#1e3a5f', fontWeight: 600, mt: 2, mb: 1 },
                  '& p': { mb: 2, lineHeight: 1.7 },
                  '& ul, & ol': { pl: 3, mb: 2 },
                  '& li': { mb: 0.5, lineHeight: 1.6 },
                  '& strong, & b': { fontWeight: 700, color: '#1e3a5f' },
                  '& p strong, & li strong, & td strong': { fontWeight: 700 },
                  '& table': { width: '100%', borderCollapse: 'collapse', mb: 2 },
                  '& th, & td': { border: '1px solid #ddd', p: 1, textAlign: 'left' },
                  '& th': { bgcolor: '#f5f5f5', fontWeight: 600 },
                  '& hr': { my: 3, borderColor: '#ddd' },
                }}
              >
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{analysisResult}</ReactMarkdown>
              </Paper>
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 4, flexWrap: 'wrap' }}>
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
                  sx={{ bgcolor: '#2e7d32', '&:hover': { bgcolor: '#1b5e20' } }}
                  onClick={handleDownloadWord}
                  startIcon={<DownloadIcon />}
                >
                  Download as Word
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
                    disabled={isSubmitting || !formData.officeId || !formData.attorneyId}
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

        {/* Loading Overlay */}
        <Backdrop
          sx={{
            color: '#fff',
            zIndex: (theme) => theme.zIndex.drawer + 1,
            backgroundColor: 'rgba(30, 58, 95, 0.85)',
            flexDirection: 'column',
            gap: 2,
          }}
          open={isSubmitting}
        >
          <CircularProgress color="inherit" size={80} thickness={4} />
          <Typography variant="h6" sx={{ mt: 2, fontWeight: 500 }}>
            Analyzing Your Estate Plan...
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.8 }}>
            This may take a moment
          </Typography>
        </Backdrop>
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
