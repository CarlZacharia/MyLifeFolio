'use client';

import React, { useState, useEffect } from 'react';
import {
  Box, Typography, TextField, Button, Paper, CircularProgress, Alert,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Chip, IconButton, Tooltip, MenuItem, Select, InputLabel, FormControl,
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import RefreshIcon from '@mui/icons-material/Refresh';
import { supabase } from '../../lib/supabase';

interface Invitation {
  id: string;
  code: string;
  invited_email: string | null;
  plan_type: string;
  trial_months: number;
  used_at: string | null;
  used_by: string | null;
  expires_at: string;
  created_at: string;
}

function deriveStatus(inv: Invitation): { label: string; color: 'success' | 'error' | 'warning' } {
  if (inv.used_at) return { label: 'Used', color: 'success' };
  if (new Date(inv.expires_at) < new Date()) return { label: 'Expired', color: 'error' };
  return { label: 'Pending', color: 'warning' };
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function AdminInvitationsTab() {
  // Form state
  const [invitedEmail, setInvitedEmail] = useState('');
  const [planType, setPlanType] = useState<'client' | 'public'>('client');
  const [trialMonths, setTrialMonths] = useState<6 | 12>(12);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Table state
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [tableError, setTableError] = useState<string | null>(null);

  const loadInvitations = async () => {
    setLoading(true);
    setTableError(null);
    try {
      const { data, error } = await supabase
        .from('invitations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw new Error(error.message);
      setInvitations(data || []);
    } catch (err) {
      setTableError(err instanceof Error ? err.message : 'Failed to load invitations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadInvitations(); }, []);

  const handleGenerate = async () => {
    setFormError(null);
    setGeneratedUrl(null);
    setCopied(false);

    if (planType === 'client' && !invitedEmail.trim()) {
      setFormError('Email is required for client invitations.');
      return;
    }

    setSubmitting(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-invitation', {
        body: {
          invited_email: invitedEmail.trim() || null,
          plan_type: planType,
          trial_months: trialMonths,
        },
      });

      if (error) throw new Error(error.message);
      if (data?.error) throw new Error(data.error);

      setGeneratedUrl(data.invitation_url);
      setInvitedEmail('');
      // Refresh the table
      await loadInvitations();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to generate invitation');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopy = async () => {
    if (!generatedUrl) return;
    await navigator.clipboard.writeText(generatedUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Box>
      {/* Create Invitation Form */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, color: '#1e3a5f', mb: 2 }}>
          Generate Invitation
        </Typography>

        {formError && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setFormError(null)}>
            {formError}
          </Alert>
        )}

        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'flex-start' }}>
          <TextField
            label="Email Address"
            value={invitedEmail}
            onChange={(e) => setInvitedEmail(e.target.value)}
            InputLabelProps={{ shrink: true }}
            size="small"
            placeholder={planType === 'client' ? 'Required' : 'Optional'}
            sx={{ minWidth: 260 }}
          />

          <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel shrink>Plan Type</InputLabel>
            <Select
              value={planType}
              label="Plan Type"
              notched
              onChange={(e) => setPlanType(e.target.value as 'client' | 'public')}
            >
              <MenuItem value="client">Client</MenuItem>
              <MenuItem value="public">Public</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel shrink>Trial Length</InputLabel>
            <Select
              value={trialMonths}
              label="Trial Length"
              notched
              onChange={(e) => setTrialMonths(Number(e.target.value) as 6 | 12)}
            >
              <MenuItem value={6}>6 Months</MenuItem>
              <MenuItem value={12}>12 Months</MenuItem>
            </Select>
          </FormControl>

          <Button
            variant="contained"
            onClick={handleGenerate}
            disabled={submitting}
            sx={{
              bgcolor: '#1e3a5f',
              textTransform: 'none',
              fontWeight: 600,
              height: 40,
              '&:hover': { bgcolor: '#0f2744' },
            }}
          >
            {submitting ? <CircularProgress size={20} sx={{ color: 'white' }} /> : 'Generate Invitation'}
          </Button>
        </Box>

        {/* Generated URL */}
        {generatedUrl && (
          <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <TextField
              value={generatedUrl}
              InputProps={{ readOnly: true }}
              size="small"
              fullWidth
              sx={{ '& .MuiInputBase-input': { fontFamily: 'monospace', fontSize: '0.85rem' } }}
            />
            <Tooltip title={copied ? 'Copied!' : 'Copy Link'}>
              <IconButton onClick={handleCopy} color={copied ? 'success' : 'default'}>
                <ContentCopyIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        )}
      </Paper>

      {/* Invitation History Table */}
      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, color: '#1e3a5f' }}>
            Invitation History
          </Typography>
          <Tooltip title="Refresh">
            <IconButton onClick={loadInvitations} size="small">
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>

        {tableError && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setTableError(null)}>
            {tableError}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: '#1e3a5f' }}>
                  <TableCell sx={{ color: 'white', fontWeight: 600 }}>Email</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 600 }}>Plan Type</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 600 }}>Trial</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 600 }}>Created</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 600 }}>Expires</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 600 }}>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {invitations.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                      <Typography color="text.secondary">No invitations yet</Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  invitations.map((inv) => {
                    const status = deriveStatus(inv);
                    return (
                      <TableRow key={inv.id} hover>
                        <TableCell>
                          <Typography variant="body2">{inv.invited_email || '—'}</Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={inv.plan_type === 'client' ? 'Client' : 'Public'}
                            size="small"
                            variant="outlined"
                            color={inv.plan_type === 'client' ? 'primary' : 'default'}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">{inv.trial_months} mo</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="caption">{formatDate(inv.created_at)}</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="caption">{formatDate(inv.expires_at)}</Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={status.label}
                            size="small"
                            color={status.color}
                            variant="outlined"
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
    </Box>
  );
}
