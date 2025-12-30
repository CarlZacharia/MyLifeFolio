'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Snackbar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Chip,
  Grid,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';
import PersonIcon from '@mui/icons-material/Person';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PrintIcon from '@mui/icons-material/Print';
import EmailIcon from '@mui/icons-material/Email';
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer';
import CloseIcon from '@mui/icons-material/Close';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/AuthContext';

const US_STATES = [
  'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut',
  'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa',
  'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan',
  'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire',
  'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio',
  'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota',
  'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia',
  'Wisconsin', 'Wyoming', 'District of Columbia'
];

interface ProfileData {
  name: string;
  email: string;
  address: string;
  state_of_domicile: string;
  telephone: string;
}

interface Question {
  id: string;
  question: string;
  category: string;
  created_at: string;
  updated_at: string;
}

interface ProfileProps {
  onBack: () => void;
}

const QUESTION_CATEGORIES = [
  'Estate Planning',
  'Trusts',
  'Wills',
  'Power of Attorney',
  'Healthcare Directives',
  'Asset Protection',
  'Tax Planning',
  'Long-Term Care',
  'Beneficiaries',
  'Other',
];

const Profile: React.FC<ProfileProps> = ({ onBack }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [profileData, setProfileData] = useState<ProfileData>({
    name: '',
    email: '',
    address: '',
    state_of_domicile: '',
    telephone: '',
  });
  const [originalData, setOriginalData] = useState<ProfileData | null>(null);

  // Questions state
  const [questions, setQuestions] = useState<Question[]>([]);
  const [questionsLoading, setQuestionsLoading] = useState(false);
  const [questionModalOpen, setQuestionModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [questionForm, setQuestionForm] = useState({ question: '', category: 'Estate Planning' });
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [questionToDelete, setQuestionToDelete] = useState<Question | null>(null);
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [emailSending, setEmailSending] = useState(false);

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchQuestions();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select('name, email, address, state_of_domicile, telephone')
        .eq('id', user.id)
        .single();

      if (fetchError) {
        // If profile doesn't exist, use data from auth user
        if (fetchError.code === 'PGRST116') {
          const initialData: ProfileData = {
            name: user.user_metadata?.name || '',
            email: user.email || '',
            address: user.user_metadata?.address || '',
            state_of_domicile: user.user_metadata?.state_of_domicile || '',
            telephone: user.user_metadata?.telephone || '',
          };
          setProfileData(initialData);
          setOriginalData(initialData);
        } else {
          throw new Error(fetchError.message);
        }
      } else if (data) {
        const loadedData: ProfileData = {
          name: data.name || '',
          email: data.email || user.email || '',
          address: data.address || '',
          state_of_domicile: data.state_of_domicile || '',
          telephone: data.telephone || '',
        };
        setProfileData(loadedData);
        setOriginalData(loadedData);
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError(err instanceof Error ? err.message : 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const fetchQuestions = async () => {
    if (!user) return;

    setQuestionsLoading(true);
    try {
      const { data, error: fetchError } = await supabase
        .from('user_questions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (fetchError) {
        // Table might not exist yet - that's okay
        if (fetchError.code !== '42P01') {
          console.error('Error fetching questions:', fetchError);
        }
        setQuestions([]);
      } else {
        setQuestions(data || []);
      }
    } catch (err) {
      console.error('Error fetching questions:', err);
      setQuestions([]);
    } finally {
      setQuestionsLoading(false);
    }
  };

  const handleChange = (field: keyof ProfileData) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | { target: { value: string } }
  ) => {
    setProfileData((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const formatPhoneNumber = (value: string) => {
    const digits = value.replace(/\D/g, '');
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
  };

  const handlePhoneChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(event.target.value);
    setProfileData((prev) => ({ ...prev, telephone: formatted }));
  };

  const hasChanges = (): boolean => {
    if (!originalData) return false;
    return (
      profileData.name !== originalData.name ||
      profileData.address !== originalData.address ||
      profileData.state_of_domicile !== originalData.state_of_domicile ||
      profileData.telephone !== originalData.telephone
    );
  };

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);
    setError(null);

    try {
      // Check if profile exists
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .single();

      if (existingProfile) {
        // Update existing profile
        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            name: profileData.name,
            address: profileData.address,
            state_of_domicile: profileData.state_of_domicile,
            telephone: profileData.telephone,
            updated_at: new Date().toISOString(),
          })
          .eq('id', user.id);

        if (updateError) throw new Error(updateError.message);
      } else {
        // Insert new profile
        const { error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            email: user.email,
            name: profileData.name,
            address: profileData.address,
            state_of_domicile: profileData.state_of_domicile,
            telephone: profileData.telephone,
          });

        if (insertError) throw new Error(insertError.message);
      }

      // Also update auth user metadata
      await supabase.auth.updateUser({
        data: {
          name: profileData.name,
          address: profileData.address,
          state_of_domicile: profileData.state_of_domicile,
          telephone: profileData.telephone,
        },
      });

      setOriginalData({ ...profileData });
      setSuccessMessage('Profile updated successfully!');
    } catch (err) {
      console.error('Error saving profile:', err);
      setError(err instanceof Error ? err.message : 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  // Question management functions
  const openAddQuestion = () => {
    setEditingQuestion(null);
    setQuestionForm({ question: '', category: 'Estate Planning' });
    setQuestionModalOpen(true);
  };

  const openEditQuestion = (question: Question) => {
    setEditingQuestion(question);
    setQuestionForm({ question: question.question, category: question.category });
    setQuestionModalOpen(true);
  };

  const handleSaveQuestion = async () => {
    if (!user || !questionForm.question.trim()) return;

    try {
      if (editingQuestion) {
        // Update existing question
        const { error: updateError } = await supabase
          .from('user_questions')
          .update({
            question: questionForm.question.trim(),
            category: questionForm.category,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingQuestion.id);

        if (updateError) throw new Error(updateError.message);
        setSuccessMessage('Question updated successfully!');
      } else {
        // Insert new question
        const { error: insertError } = await supabase
          .from('user_questions')
          .insert({
            user_id: user.id,
            question: questionForm.question.trim(),
            category: questionForm.category,
          });

        if (insertError) throw new Error(insertError.message);
        setSuccessMessage('Question added successfully!');
      }

      setQuestionModalOpen(false);
      fetchQuestions();
    } catch (err) {
      console.error('Error saving question:', err);
      setError(err instanceof Error ? err.message : 'Failed to save question');
    }
  };

  const confirmDeleteQuestion = (question: Question) => {
    setQuestionToDelete(question);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteQuestion = async () => {
    if (!questionToDelete) return;

    try {
      const { error: deleteError } = await supabase
        .from('user_questions')
        .delete()
        .eq('id', questionToDelete.id);

      if (deleteError) throw new Error(deleteError.message);

      setSuccessMessage('Question deleted successfully!');
      setDeleteConfirmOpen(false);
      setQuestionToDelete(null);
      fetchQuestions();
    } catch (err) {
      console.error('Error deleting question:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete question');
    }
  };

  const handlePrintQuestions = () => {
    const printContent = `
      <html>
        <head>
          <title>Questions for Attorney - ${profileData.name}</title>
          <style>
            body { font-family: Georgia, serif; padding: 40px; max-width: 800px; margin: 0 auto; }
            h1 { color: #1e3a5f; border-bottom: 2px solid #1e3a5f; padding-bottom: 10px; }
            h2 { color: #1e3a5f; margin-top: 30px; }
            .client-info { background: #f5f5f5; padding: 15px; border-radius: 4px; margin-bottom: 20px; }
            .question { margin-bottom: 20px; padding: 15px; border-left: 3px solid #c9a227; background: #fafafa; }
            .category { color: #666; font-size: 0.85em; margin-bottom: 5px; }
            .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 0.9em; color: #666; }
          </style>
        </head>
        <body>
          <h1>Questions for Attorney Consultation</h1>
          <div class="client-info">
            <strong>Client:</strong> ${profileData.name}<br/>
            <strong>Email:</strong> ${profileData.email}<br/>
            ${profileData.telephone ? `<strong>Phone:</strong> ${profileData.telephone}<br/>` : ''}
            ${profileData.state_of_domicile ? `<strong>State:</strong> ${profileData.state_of_domicile}<br/>` : ''}
          </div>
          <h2>Questions (${questions.length})</h2>
          ${questions.map((q, index) => `
            <div class="question">
              <div class="category">${q.category}</div>
              <strong>${index + 1}.</strong> ${q.question}
            </div>
          `).join('')}
          <div class="footer">
            <p>Prepared for consultation with Zacharia Brown & Bratkovich</p>
            <p>26811 South Bay Dr. Ste 260, Bonita Springs, FL 34134 | (239) 345-4545</p>
            <p>Generated: ${new Date().toLocaleDateString()}</p>
          </div>
        </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const handleEmailQuestions = async () => {
    setEmailSending(true);
    try {
      // For now, open the user's email client with pre-filled content
      const subject = encodeURIComponent(`Questions for Consultation - ${profileData.name}`);
      const body = encodeURIComponent(`
Dear Zacharia Brown & Bratkovich Team,

I have the following questions I would like to discuss during my consultation:

${questions.map((q, index) => `${index + 1}. [${q.category}] ${q.question}`).join('\n\n')}

---
Client Information:
Name: ${profileData.name}
Email: ${profileData.email}
${profileData.telephone ? `Phone: ${profileData.telephone}` : ''}
${profileData.state_of_domicile ? `State: ${profileData.state_of_domicile}` : ''}

Thank you,
${profileData.name}
      `.trim());

      window.location.href = `mailto:info@zacbrownlaw.com?subject=${subject}&body=${body}`;
      setSuccessMessage('Email client opened. Please send the email to complete.');
    } catch (err) {
      setError('Failed to open email client. Please try again.');
    } finally {
      setEmailSending(false);
      setEmailDialogOpen(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: 1000, mx: 'auto' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={onBack}
          sx={{ mr: 2 }}
          variant="outlined"
        >
          Back
        </Button>
        <PersonIcon sx={{ mr: 1, color: '#1e3a5f', fontSize: 32 }} />
        <Typography variant="h4" sx={{ color: '#1e3a5f', fontWeight: 600 }}>
          My Profile
        </Typography>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Profile Form - Left Column */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 4, height: '100%' }}>
            <Typography variant="h6" sx={{ mb: 3, color: '#1e3a5f' }}>
              Personal Information
            </Typography>

            <TextField
              fullWidth
              label="Full Name"
              value={profileData.name}
              onChange={handleChange('name')}
              margin="normal"
              variant="outlined"
            />

            <TextField
              fullWidth
              label="Email"
              value={profileData.email}
              margin="normal"
              variant="outlined"
              disabled
              helperText="Email cannot be changed. Contact support if you need to update your email."
              sx={{
                '& .MuiInputBase-input.Mui-disabled': {
                  WebkitTextFillColor: '#666',
                },
              }}
            />

            <TextField
              fullWidth
              label="Address"
              value={profileData.address}
              onChange={handleChange('address')}
              margin="normal"
              variant="outlined"
              multiline
              rows={2}
              placeholder="Street address, City, ZIP"
            />

            <FormControl fullWidth margin="normal">
              <InputLabel>State of Domicile</InputLabel>
              <Select
                value={profileData.state_of_domicile}
                label="State of Domicile"
                onChange={(e) => setProfileData((prev) => ({ ...prev, state_of_domicile: e.target.value }))}
              >
                <MenuItem value="">
                  <em>Select a state...</em>
                </MenuItem>
                {US_STATES.map((state) => (
                  <MenuItem key={state} value={state}>
                    {state}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="Telephone"
              value={profileData.telephone}
              onChange={handlePhoneChange}
              margin="normal"
              variant="outlined"
              placeholder="(555) 555-5555"
            />

            <Divider sx={{ my: 3 }} />

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
              <Button
                variant="outlined"
                onClick={onBack}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                onClick={handleSave}
                disabled={saving || !hasChanges()}
                startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                sx={{ bgcolor: '#1e3a5f', '&:hover': { bgcolor: '#0f2744' } }}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </Box>
          </Paper>
        </Grid>

        {/* Questions & Notes - Right Column */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 4, height: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <QuestionAnswerIcon sx={{ color: '#1e3a5f' }} />
                <Typography variant="h6" sx={{ color: '#1e3a5f' }}>
                  Questions & Notes
                </Typography>
              </Box>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={openAddQuestion}
                size="small"
                sx={{ bgcolor: '#c9a227', '&:hover': { bgcolor: '#9a7b1a' } }}
              >
                Add Question
              </Button>
            </Box>

            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Save questions you want to ask during your consultation with an attorney.
            </Typography>

            <Divider sx={{ mb: 2 }} />

            {questionsLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress size={24} />
              </Box>
            ) : questions.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
                <QuestionAnswerIcon sx={{ fontSize: 48, opacity: 0.3, mb: 1 }} />
                <Typography variant="body2">
                  No questions yet. Click "Add Question" to get started.
                </Typography>
              </Box>
            ) : (
              <>
                <List sx={{ maxHeight: 350, overflow: 'auto' }}>
                  {questions.map((question) => (
                    <ListItem
                      key={question.id}
                      sx={{
                        borderLeft: '3px solid #c9a227',
                        bgcolor: '#fafafa',
                        mb: 1,
                        borderRadius: '0 4px 4px 0',
                      }}
                    >
                      <ListItemText
                        primary={question.question}
                        secondary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                            <Chip
                              label={question.category}
                              size="small"
                              sx={{ height: 20, fontSize: '0.7rem' }}
                            />
                            <Typography variant="caption" color="text.secondary">
                              {formatDate(question.created_at)}
                            </Typography>
                          </Box>
                        }
                      />
                      <ListItemSecondaryAction>
                        <IconButton
                          edge="end"
                          size="small"
                          onClick={() => openEditQuestion(question)}
                          sx={{ mr: 0.5 }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          edge="end"
                          size="small"
                          onClick={() => confirmDeleteQuestion(question)}
                          color="error"
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>

                <Divider sx={{ my: 2 }} />

                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                  <Button
                    variant="outlined"
                    startIcon={<PrintIcon />}
                    onClick={handlePrintQuestions}
                    disabled={questions.length === 0}
                  >
                    Print Questions
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<EmailIcon />}
                    onClick={() => setEmailDialogOpen(true)}
                    disabled={questions.length === 0}
                    sx={{ borderColor: '#1e3a5f', color: '#1e3a5f' }}
                  >
                    Email to Attorney
                  </Button>
                </Box>
              </>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Add/Edit Question Modal */}
      <Dialog
        open={questionModalOpen}
        onClose={() => setQuestionModalOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <QuestionAnswerIcon sx={{ color: '#1e3a5f' }} />
            {editingQuestion ? 'Edit Question' : 'Add New Question'}
          </Box>
          <IconButton onClick={() => setQuestionModalOpen(false)} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="normal">
            <InputLabel>Category</InputLabel>
            <Select
              value={questionForm.category}
              label="Category"
              onChange={(e) => setQuestionForm((prev) => ({ ...prev, category: e.target.value }))}
            >
              {QUESTION_CATEGORIES.map((cat) => (
                <MenuItem key={cat} value={cat}>
                  {cat}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            fullWidth
            label="Your Question"
            value={questionForm.question}
            onChange={(e) => setQuestionForm((prev) => ({ ...prev, question: e.target.value }))}
            margin="normal"
            variant="outlined"
            multiline
            rows={4}
            placeholder="Type your question here..."
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setQuestionModalOpen(false)} variant="outlined">
            Cancel
          </Button>
          <Button
            onClick={handleSaveQuestion}
            variant="contained"
            disabled={!questionForm.question.trim()}
            sx={{ bgcolor: '#1e3a5f', '&:hover': { bgcolor: '#0f2744' } }}
          >
            {editingQuestion ? 'Save Changes' : 'Add Question'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
        <DialogTitle>Delete Question?</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this question? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)} variant="outlined">
            Cancel
          </Button>
          <Button onClick={handleDeleteQuestion} variant="contained" color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Email Confirmation Dialog */}
      <Dialog open={emailDialogOpen} onClose={() => setEmailDialogOpen(false)}>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <EmailIcon sx={{ color: '#1e3a5f' }} />
          Email Questions to Attorney
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 2 }}>
            This will open your email client with a pre-filled message containing your {questions.length} question{questions.length !== 1 ? 's' : ''}.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            The email will be addressed to: <strong>info@zacbrownlaw.com</strong>
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setEmailDialogOpen(false)} variant="outlined">
            Cancel
          </Button>
          <Button
            onClick={handleEmailQuestions}
            variant="contained"
            startIcon={emailSending ? <CircularProgress size={16} color="inherit" /> : <EmailIcon />}
            disabled={emailSending}
            sx={{ bgcolor: '#1e3a5f', '&:hover': { bgcolor: '#0f2744' } }}
          >
            Open Email
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success Snackbar */}
      <Snackbar
        open={!!successMessage}
        autoHideDuration={4000}
        onClose={() => setSuccessMessage(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setSuccessMessage(null)} severity="success" sx={{ width: '100%' }}>
          {successMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Profile;
