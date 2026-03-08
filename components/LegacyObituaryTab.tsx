'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, TextField, Typography, MenuItem, Divider, Button, Alert, CircularProgress,
  LinearProgress, Accordion, AccordionSummary, AccordionDetails, Chip, Tabs, Tab,
} from '@mui/material';
import ArticleIcon from '@mui/icons-material/Article';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import HistoryIcon from '@mui/icons-material/History';
import { useFormContext } from '../lib/FormContext';
import { folioColors } from './FolioModal';
import { generateObituary } from '../lib/obituaryGenerator';
import { buildObituaryFromTemplate } from '../lib/obituaryTemplate';
import { saveDraft, loadDrafts, ObituaryDraft } from '../lib/obituaryDrafts';
import { generateClientFolderName } from '../lib/supabaseStorage';
import { supabase } from '../lib/supabase';
import ObituaryPreviewModal from './ObituaryPreviewModal';

const TONES = ['Formal', 'Warm & Personal', 'Lighthearted', 'Religious/Faith-Based', 'Brief'] as const;
const MAX_GENERATIONS = 5;

// Fields required before the user can generate
const REQUIRED_FIELDS: { key: string; label: string }[] = [
  { key: 'preferredName', label: 'Full Name' },
  { key: 'dateOfBirth', label: 'Date of Birth' },
  { key: 'placeOfBirth', label: 'Place of Birth' },
  { key: 'hometowns', label: 'Hometown(s)' },
  { key: 'tone', label: 'Tone & Style' },
];

// "Personality" fields used for the Lighthearted tone check
const PERSONALITY_FIELDS = [
  'quotesToInclude', 'whatToRemember', 'personalMessage',
  'communityInvolvement', 'awardsHonors', 'militaryService',
];

const tfSx = {
  '& .MuiOutlinedInput-root': {
    '&:hover fieldset': { borderColor: folioColors.accentWarm },
    '&.Mui-focused fieldset': { borderColor: folioColors.accent },
  },
  '& .MuiInputLabel-root.Mui-focused': { color: folioColors.accent },
};

const requiredErrorSx = {
  '& .MuiOutlinedInput-root': {
    '& fieldset': { borderColor: '#d32f2f' },
    '&:hover fieldset': { borderColor: '#d32f2f' },
    '&.Mui-focused fieldset': { borderColor: '#d32f2f' },
  },
  '& .MuiInputLabel-root': { color: '#d32f2f' },
  '& .MuiInputLabel-root.Mui-focused': { color: '#d32f2f' },
};

const SectionHeading = ({ children }: { children: React.ReactNode }) => (
  <>
    <Divider sx={{ my: 1.5 }} />
    <Typography variant="caption" sx={{
      fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: folioColors.accent,
    }}>
      {children}
    </Typography>
  </>
);

function formatDraftDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit',
  });
}

// ── Type for the obituary data shape ──
type ObituaryData = {
  preferredName: string; nicknames: string; dateOfBirth: string; placeOfBirth: string;
  dateOfDeath: string; placeOfDeath: string; hometowns: string; religiousAffiliation: string;
  militaryService: string; education: string; careerHighlights: string;
  communityInvolvement: string; awardsHonors: string; spouses: string; children: string;
  grandchildren: string; siblings: string; parents: string; othersToMention: string;
  precededInDeath: string; tone: string; quotesToInclude: string; whatToRemember: string;
  personalMessage: string; preferredFuneralHome: string; burialOrCremation: string;
  servicePreferences: string; charitableDonations: string; obituaryGenerationCount: number;
};

// ── Inner form for a single person (client or spouse) ──
interface ObituaryFormProps {
  obit: ObituaryData;
  formDataKey: 'legacyObituary' | 'legacyObituarySpouse';
  intakeId: string | null;
  clientFolderName: string | undefined;
}

const ObituaryForm: React.FC<ObituaryFormProps> = ({ obit, formDataKey, intakeId, clientFolderName }) => {
  const { updateFormData } = useFormContext();

  const [generating, setGenerating] = useState(false);
  const [progressMsg, setProgressMsg] = useState('');
  const [error, setError] = useState('');
  const [previewOpen, setPreviewOpen] = useState(false);
  const [generatedText, setGeneratedText] = useState('');
  const [showValidation, setShowValidation] = useState(false);
  const [drafts, setDrafts] = useState<ObituaryDraft[]>([]);
  const [draftsExpanded, setDraftsExpanded] = useState(false);

  const personType: 'client' | 'spouse' = formDataKey === 'legacyObituarySpouse' ? 'spouse' : 'client';
  const tableName = personType === 'spouse' ? 'legacy_obituary_spouse' : 'legacy_obituary';

  // Fetch generation_count from DB and sync to formData
  const refreshGenerationCount = useCallback(async () => {
    if (!intakeId) return;
    const { data, error: fetchErr } = await supabase
      .from(tableName)
      .select('generation_count')
      .eq('intake_id', intakeId)
      .maybeSingle();
    if (fetchErr) {
      console.error('Error fetching generation count:', fetchErr);
      return;
    }
    const dbCount = data?.generation_count ?? 0;
    if (dbCount !== obit.obituaryGenerationCount) {
      updateFormData({ [formDataKey]: { ...obit, obituaryGenerationCount: dbCount } });
    }
  }, [intakeId, tableName, formDataKey, obit, updateFormData]);

  // Load prior drafts when the tab mounts or intakeId changes
  const refreshDrafts = useCallback(async () => {
    if (!intakeId) return;
    const loaded = await loadDrafts(intakeId);
    // Filter drafts by person name to keep client/spouse drafts separate
    const personDrafts = obit.preferredName
      ? loaded.filter((d) => d.person_name === obit.preferredName)
      : loaded;
    setDrafts(personDrafts);
  }, [intakeId, obit.preferredName]);

  useEffect(() => {
    refreshDrafts();
    refreshGenerationCount();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [intakeId]);

  const handleChange = (field: string, value: string) => {
    updateFormData({ [formDataKey]: { ...obit, [field]: value } });
  };

  // ── Validation ──
  const missingFields = REQUIRED_FIELDS.filter(
    (f) => !(obit as Record<string, unknown>)[f.key] || String((obit as Record<string, unknown>)[f.key]).trim() === ''
  );
  const isFieldMissing = (key: string) => missingFields.some((f) => f.key === key);

  const fieldSx = (key: string, baseSx: Record<string, unknown> = {}) => {
    if (isFieldMissing(key)) return { ...baseSx, ...requiredErrorSx };
    return { ...baseSx, ...tfSx };
  };

  // ── Lighthearted tone warning ──
  const personalityCount = PERSONALITY_FIELDS.filter(
    (f) => {
      const v = (obit as Record<string, unknown>)[f];
      return typeof v === 'string' && v.trim().length > 0;
    }
  ).length;
  const showLightheartedWarning = obit.tone === 'Lighthearted' && personalityCount < 3;

  // ── Date logic validation ──
  const dateWarning = (() => {
    if (!obit.dateOfBirth) return '';
    const dob = new Date(obit.dateOfBirth);
    if (isNaN(dob.getTime())) return '';

    if (obit.dateOfDeath) {
      const dod = new Date(obit.dateOfDeath);
      if (!isNaN(dod.getTime())) {
        if (dod < dob) return 'Date of death is before date of birth. Please double-check.';
        const ageDiff = (dod.getTime() - dob.getTime()) / (365.25 * 24 * 60 * 60 * 1000);
        if (ageDiff > 120) return `These dates suggest an age of ${Math.round(ageDiff)} years. Please verify.`;
      }
    }

    if (obit.dateOfDeath) {
      const today = new Date();
      const dod = new Date(obit.dateOfDeath);
      if (!isNaN(dod.getTime()) && dod > today) {
        return 'The date of death is in the future. If this was entered by mistake, please clear it.';
      }
    }
    return '';
  })();

  // ── Generate handler with progress & timeout ──
  const handleGenerate = async () => {
    setShowValidation(true);
    setError('');

    if (missingFields.length > 0) return;
    if (obit.obituaryGenerationCount >= MAX_GENERATIONS) {
      setError(`You have reached the maximum of ${MAX_GENERATIONS} obituary generations.`);
      return;
    }

    setGenerating(true);
    setProgressMsg('Connecting to server...');

    const progressSteps = [
      { ms: 2000, msg: 'Analyzing your information...' },
      { ms: 5000, msg: 'Composing the obituary...' },
      { ms: 10000, msg: 'Still writing — Claude is crafting a thoughtful tribute...' },
      { ms: 18000, msg: 'Almost there — finalizing the draft...' },
    ];
    const timers: ReturnType<typeof setTimeout>[] = [];
    progressSteps.forEach(({ ms, msg }) => {
      timers.push(setTimeout(() => setProgressMsg(msg), ms));
    });

    try {
      const result = await generateObituary(obit, intakeId, personType);

      timers.forEach(clearTimeout);

      if (result.success && result.obituary) {
        setGeneratedText(result.obituary);
        setPreviewOpen(true);

        // Refresh count from DB (Edge Function owns the increment)
        await refreshGenerationCount();

        // Auto-save draft to Supabase
        if (intakeId) {
          const newCount = obit.obituaryGenerationCount + 1;
          await saveDraft(intakeId, result.obituary, obit.tone, obit.preferredName, newCount);
          refreshDrafts();
        }
      } else if (result.limitReached) {
        setError('You have reached the maximum of 5 AI-generated obituary drafts.');
      } else if (result.isTimeout) {
        setError('The request timed out. Claude may be under heavy load right now. Please wait a moment and try again.');
      } else {
        setError(result.error || 'Failed to generate obituary. Please try again.');
      }
    } catch {
      timers.forEach(clearTimeout);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setGenerating(false);
      setProgressMsg('');
    }
  };

  const handleExportAsEntered = () => {
    const text = buildObituaryFromTemplate(obit);
    setGeneratedText(text);
    setPreviewOpen(true);
  };

  const openDraft = (draft: ObituaryDraft) => {
    setGeneratedText(draft.draft_text);
    setPreviewOpen(true);
  };

  const remaining = MAX_GENERATIONS - obit.obituaryGenerationCount;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, maxWidth: 700 }}>

      {/* ── THE BASICS ── */}
      <Typography variant="caption" sx={{
        fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: folioColors.accent,
      }}>
        The Basics
      </Typography>

      <TextField label="Full Name (as you want it in the obituary) *" value={obit.preferredName}
        onChange={(e) => handleChange('preferredName', e.target.value)}
        error={isFieldMissing('preferredName')}
        helperText={isFieldMissing('preferredName') ? 'Full name is required to generate' : ''}
        InputLabelProps={{ shrink: true }} fullWidth sx={fieldSx('preferredName')} />

      <TextField label="Nicknames / Known As" value={obit.nicknames}
        onChange={(e) => handleChange('nicknames', e.target.value)}
        InputLabelProps={{ shrink: true }} fullWidth sx={tfSx} />

      <Box sx={{ display: 'flex', gap: 2 }}>
        <TextField label="Date of Birth *" value={obit.dateOfBirth}
          onChange={(e) => handleChange('dateOfBirth', e.target.value)}
          error={isFieldMissing('dateOfBirth')}
          helperText={isFieldMissing('dateOfBirth') ? 'Required' : ''}
          InputLabelProps={{ shrink: true }} type="date" sx={{ flex: 1, ...fieldSx('dateOfBirth') }} />
        <TextField label="Place of Birth *" value={obit.placeOfBirth}
          onChange={(e) => handleChange('placeOfBirth', e.target.value)}
          error={isFieldMissing('placeOfBirth')}
          helperText={isFieldMissing('placeOfBirth') ? 'Required' : ''}
          InputLabelProps={{ shrink: true }} placeholder="City, State"
          sx={{ flex: 1, ...fieldSx('placeOfBirth') }} />
      </Box>

      <Box sx={{ display: 'flex', gap: 2 }}>
        <TextField label="Date of Death" value={obit.dateOfDeath}
          onChange={(e) => handleChange('dateOfDeath', e.target.value)}
          InputLabelProps={{ shrink: true }} type="date"
          helperText="Leave blank — for family to complete"
          sx={{ flex: 1, ...tfSx }} />
        <TextField label="Place of Death" value={obit.placeOfDeath}
          onChange={(e) => handleChange('placeOfDeath', e.target.value)}
          InputLabelProps={{ shrink: true }}
          helperText="Leave blank — for family to complete"
          sx={{ flex: 1, ...tfSx }} />
      </Box>

      {dateWarning && <Alert severity="warning" sx={{ mt: -1 }}>{dateWarning}</Alert>}

      {/* ── LIFE STORY ── */}
      <SectionHeading>Life Story</SectionHeading>

      <TextField label="Hometown(s) *" value={obit.hometowns}
        onChange={(e) => handleChange('hometowns', e.target.value)}
        error={isFieldMissing('hometowns')}
        helperText={isFieldMissing('hometowns') ? 'Required' : ''}
        InputLabelProps={{ shrink: true }} fullWidth
        placeholder="Where you grew up, where you lived"
        sx={fieldSx('hometowns')} />

      <TextField label="Religious / Spiritual Affiliation" value={obit.religiousAffiliation}
        onChange={(e) => handleChange('religiousAffiliation', e.target.value)}
        InputLabelProps={{ shrink: true }} fullWidth sx={tfSx} />

      <TextField label="Military Service" value={obit.militaryService}
        onChange={(e) => handleChange('militaryService', e.target.value)}
        InputLabelProps={{ shrink: true }} placeholder="Branch, dates, rank, theater"
        multiline minRows={2} fullWidth sx={tfSx} />

      <TextField label="Education" value={obit.education}
        onChange={(e) => handleChange('education', e.target.value)}
        InputLabelProps={{ shrink: true }} placeholder="Schools, degrees"
        multiline minRows={2} fullWidth sx={tfSx} />

      <TextField label="Career Highlights" value={obit.careerHighlights}
        onChange={(e) => handleChange('careerHighlights', e.target.value)}
        InputLabelProps={{ shrink: true }} placeholder="Key roles, industries, accomplishments"
        multiline minRows={2} fullWidth sx={tfSx} />

      <TextField label="Community Involvement" value={obit.communityInvolvement}
        onChange={(e) => handleChange('communityInvolvement', e.target.value)}
        InputLabelProps={{ shrink: true }} placeholder="Clubs, boards, volunteer work"
        multiline minRows={2} fullWidth sx={tfSx} />

      <TextField label="Awards & Honors" value={obit.awardsHonors}
        onChange={(e) => handleChange('awardsHonors', e.target.value)}
        InputLabelProps={{ shrink: true }} multiline minRows={2} fullWidth sx={tfSx} />

      {/* ── FAMILY ── */}
      <SectionHeading>Family</SectionHeading>

      <TextField label="Spouse(s)" value={obit.spouses}
        onChange={(e) => handleChange('spouses', e.target.value)}
        InputLabelProps={{ shrink: true }} fullWidth sx={tfSx} />

      <TextField label="Children" value={obit.children}
        onChange={(e) => handleChange('children', e.target.value)}
        InputLabelProps={{ shrink: true }} multiline minRows={2} fullWidth
        placeholder="Names, and whether to include spouses/partners"
        sx={tfSx} />

      <TextField label="Grandchildren & Great-Grandchildren" value={obit.grandchildren}
        onChange={(e) => handleChange('grandchildren', e.target.value)}
        InputLabelProps={{ shrink: true }} multiline minRows={2} fullWidth sx={tfSx} />

      <TextField label="Siblings" value={obit.siblings}
        onChange={(e) => handleChange('siblings', e.target.value)}
        InputLabelProps={{ shrink: true }} fullWidth sx={tfSx} />

      <TextField label="Parents (if you wish to mention them)" value={obit.parents}
        onChange={(e) => handleChange('parents', e.target.value)}
        InputLabelProps={{ shrink: true }} fullWidth sx={tfSx} />

      <TextField label="Others to Mention" value={obit.othersToMention}
        onChange={(e) => handleChange('othersToMention', e.target.value)}
        InputLabelProps={{ shrink: true }} multiline minRows={2} fullWidth
        placeholder="Close friends, chosen family, caregivers"
        sx={tfSx} />

      <TextField label="Those Who Preceded in Death" value={obit.precededInDeath}
        onChange={(e) => handleChange('precededInDeath', e.target.value)}
        InputLabelProps={{ shrink: true }} multiline minRows={2} fullWidth sx={tfSx} />

      {/* ── YOUR VOICE ── */}
      <SectionHeading>Your Voice</SectionHeading>

      <TextField select label="Tone & Style *" value={obit.tone}
        onChange={(e) => handleChange('tone', e.target.value)}
        error={isFieldMissing('tone')}
        helperText={isFieldMissing('tone') ? 'Required — choose a tone for the obituary' : ''}
        InputLabelProps={{ shrink: true }} fullWidth sx={fieldSx('tone')}>
        <MenuItem value=""><em>Select tone</em></MenuItem>
        {TONES.map((t) => <MenuItem key={t} value={t}>{t}</MenuItem>)}
      </TextField>

      {showLightheartedWarning && (
        <Alert severity="info" sx={{ mt: -1 }}>
          You selected a lighthearted tone, but only {personalityCount} of the personality fields below are filled in.
          For a more vibrant result, consider adding quotes, things you want remembered, or a personal message.
        </Alert>
      )}

      <TextField label="Favorite Quotes or Sayings" value={obit.quotesToInclude}
        onChange={(e) => handleChange('quotesToInclude', e.target.value)}
        InputLabelProps={{ shrink: true }} multiline minRows={2} fullWidth sx={tfSx} />

      <TextField label="What You'd Want People to Remember About You" value={obit.whatToRemember}
        onChange={(e) => handleChange('whatToRemember', e.target.value)}
        InputLabelProps={{ shrink: true }} multiline minRows={3} fullWidth sx={tfSx} />

      <TextField label="A Personal Message to Leave Behind" value={obit.personalMessage}
        onChange={(e) => handleChange('personalMessage', e.target.value)}
        InputLabelProps={{ shrink: true }} multiline minRows={3} fullWidth sx={tfSx} />

      {/* ── FINAL ARRANGEMENTS ── */}
      <SectionHeading>Final Arrangements</SectionHeading>

      <TextField label="Preferred Funeral Home" value={obit.preferredFuneralHome}
        onChange={(e) => handleChange('preferredFuneralHome', e.target.value)}
        InputLabelProps={{ shrink: true }} fullWidth
        placeholder="Name and location, if known"
        sx={tfSx} />

      <TextField label="Burial or Cremation Preference" value={obit.burialOrCremation}
        onChange={(e) => handleChange('burialOrCremation', e.target.value)}
        InputLabelProps={{ shrink: true }} fullWidth sx={tfSx} />

      <TextField label="Service Preferences" value={obit.servicePreferences}
        onChange={(e) => handleChange('servicePreferences', e.target.value)}
        InputLabelProps={{ shrink: true }} multiline minRows={2} fullWidth
        placeholder="Public, private, celebration of life, etc."
        sx={tfSx} />

      <TextField label="Charitable Donations / In Lieu of Flowers" value={obit.charitableDonations}
        onChange={(e) => handleChange('charitableDonations', e.target.value)}
        InputLabelProps={{ shrink: true }} multiline minRows={2} fullWidth
        placeholder="Where should donations be directed?"
        sx={tfSx} />

      {/* ── GENERATE SECTION ── */}
      <Divider sx={{ my: 2 }} />

      {error && (
        <Alert severity="error" sx={{ mb: 1 }}>
          {error}
          {error.includes('timed out') && (
            <Button size="small" sx={{ ml: 1, textTransform: 'none' }} onClick={handleGenerate}>
              Retry
            </Button>
          )}
        </Alert>
      )}

      {showValidation && missingFields.length > 0 && (
        <Alert severity="warning" sx={{ mb: 1 }}>
          Please complete the required fields: {missingFields.map((f) => f.label).join(', ')}
        </Alert>
      )}

      {generating && (
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
            <CircularProgress size={18} sx={{ color: folioColors.accent }} />
            <Typography variant="body2" color="text.secondary">{progressMsg}</Typography>
          </Box>
          <LinearProgress sx={{
            height: 4, borderRadius: 2,
            '& .MuiLinearProgress-bar': { bgcolor: folioColors.accent },
          }} />
        </Box>
      )}

      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
        <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            size="large"
            startIcon={generating ? <CircularProgress size={20} color="inherit" /> : <AutoFixHighIcon />}
            onClick={handleGenerate}
            disabled={generating || remaining <= 0}
            sx={{
              bgcolor: folioColors.accent,
              '&:hover': { bgcolor: '#b8922a' },
              '&.Mui-disabled': { bgcolor: '#e0e0e0' },
              px: 4, py: 1.2, fontWeight: 700, fontSize: '1rem',
            }}
          >
            {generating ? 'Generating...' : 'Generate with AI'}
          </Button>
          <Button
            variant="outlined"
            size="large"
            startIcon={<FileDownloadIcon />}
            onClick={handleExportAsEntered}
            disabled={!obit.preferredName.trim()}
            sx={{
              borderColor: folioColors.inkLight,
              color: folioColors.ink,
              '&:hover': { borderColor: folioColors.ink, bgcolor: 'rgba(201,162,39,0.06)' },
              px: 3, py: 1.2, fontWeight: 600, fontSize: '1rem',
            }}
          >
            Export As Entered
          </Button>
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{
          ...(remaining <= 0 ? { color: '#d32f2f', fontWeight: 600 } : {}),
        }}>
          {remaining > 0
            ? `${obit.obituaryGenerationCount} of ${MAX_GENERATIONS} drafts used`
            : 'All 5 drafts used — generation limit reached'}
        </Typography>
      </Box>

      {/* ── PRIOR DRAFTS ── */}
      {drafts.length > 0 && (
        <Accordion
          expanded={draftsExpanded}
          onChange={(_, expanded) => setDraftsExpanded(expanded)}
          variant="outlined"
          sx={{ mt: 2, borderRadius: 2, '&:before': { display: 'none' } }}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <HistoryIcon sx={{ color: folioColors.inkLight, fontSize: 20 }} />
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                Prior Drafts ({drafts.length})
              </Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {drafts.map((draft) => (
                <Box key={draft.id}
                  onClick={() => openDraft(draft)}
                  sx={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    p: 1.5, borderRadius: 1, cursor: 'pointer',
                    '&:hover': { bgcolor: 'rgba(201,162,39,0.06)' },
                    border: '1px solid', borderColor: 'divider',
                  }}>
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      Draft #{draft.generation_number} — {draft.person_name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {formatDraftDate(draft.created_at)}
                    </Typography>
                  </Box>
                  <Chip label={draft.tone || 'Unknown tone'} size="small" variant="outlined" />
                </Box>
              ))}
            </Box>
          </AccordionDetails>
        </Accordion>
      )}

      <ObituaryPreviewModal
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        obituaryText={generatedText}
        personName={obit.preferredName}
        clientFolderName={clientFolderName}
      />
    </Box>
  );
};

// ── Main tab with client/spouse toggle ──

const LegacyObituaryTab = () => {
  const { formData, intakeId } = useFormContext();
  const [personTab, setPersonTab] = useState(0);

  const clientFolderName = formData.name ? generateClientFolderName(formData.name) : undefined;

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
        <ArticleIcon sx={{ color: '#c9a227', fontSize: 28 }} />
        <Typography variant="h6" sx={{ fontWeight: 600 }}>Obituary Information</Typography>
      </Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2, maxWidth: 650 }}>
        Gathering this information now makes it much easier for your family when the time comes.
        Fields marked with * are required to generate a professional obituary.
      </Typography>

      <Tabs
        value={personTab}
        onChange={(_, v) => setPersonTab(v)}
        sx={{
          mb: 3,
          '& .MuiTabs-indicator': { display: 'none' },
          '& .MuiTabs-flexContainer': { gap: 1 },
          '& .MuiTab-root': {
            textTransform: 'none',
            fontWeight: 600,
            fontSize: '0.95rem',
            fontFamily: '"Jost", sans-serif',
            borderRadius: '8px',
            minHeight: 44,
            px: 3,
            border: `2px solid ${folioColors.parchment}`,
            bgcolor: folioColors.cream,
            color: folioColors.inkLight,
            transition: 'all 0.2s',
            '&.Mui-selected': { bgcolor: folioColors.ink, color: '#fff', border: `2px solid ${folioColors.ink}` },
            '&:not(.Mui-selected):hover': { bgcolor: folioColors.creamDark, borderColor: folioColors.inkFaint },
          },
        }}
      >
        <Tab label="Client" />
        <Tab label="Spouse" />
      </Tabs>

      {personTab === 0 && (
        <ObituaryForm
          obit={formData.legacyObituary}
          formDataKey="legacyObituary"
          intakeId={intakeId}
          clientFolderName={clientFolderName}
        />
      )}

      {personTab === 1 && (
        <ObituaryForm
          obit={formData.legacyObituarySpouse}
          formDataKey="legacyObituarySpouse"
          intakeId={intakeId}
          clientFolderName={clientFolderName}
        />
      )}
    </Box>
  );
};

export default LegacyObituaryTab;
