'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  CircularProgress,
  Alert,
  Chip,
  Divider,
} from '@mui/material';
import ScienceIcon from '@mui/icons-material/Science';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import LoginIcon from '@mui/icons-material/Login';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import { supabase } from '../lib/supabase';

const TEST_PASSWORD = 'TestPass123!';

const TEST_PERSONAS = [
  { name: 'Margaret Thornton', email: 'margaret.thornton@mylifefolio.test', desc: 'Full data — married, 3 children, assets, legacy, LTC' },
  { name: 'James Wilson', email: 'james.wilson@mylifefolio.test', desc: 'Moderate — single widower, 2 children, basic assets' },
  { name: 'David Chen', email: 'chen.family@mylifefolio.test', desc: 'Heavy assets — business, crypto, investments' },
  { name: 'Rosa Martinez', email: 'rosa.martinez@mylifefolio.test', desc: 'Legacy-focused — obituary, letters, stories, charities' },
  { name: 'Emily Blank', email: 'empty.intake@mylifefolio.test', desc: 'Minimal — near-empty intake for empty state testing' },
];

export default function AdminTestPanel() {
  const [seeding, setSeeding] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [loggingIn, setLoggingIn] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [personaStatus, setPersonaStatus] = useState<Record<string, boolean>>({});
  const [statusLoading, setStatusLoading] = useState(true);

  const checkPersonaStatus = useCallback(async () => {
    setStatusLoading(true);
    try {
      // Query profiles table for test emails
      const { data: profiles } = await supabase
        .from('profiles')
        .select('email')
        .like('email', '%@mylifefolio.test');

      const foundEmails = new Set((profiles || []).map((p: { email: string }) => p.email));
      const status: Record<string, boolean> = {};
      for (const p of TEST_PERSONAS) {
        status[p.email] = foundEmails.has(p.email);
      }
      setPersonaStatus(status);
    } catch {
      // If query fails (e.g., RLS), mark all as unknown
      const status: Record<string, boolean> = {};
      for (const p of TEST_PERSONAS) {
        status[p.email] = false;
      }
      setPersonaStatus(status);
    } finally {
      setStatusLoading(false);
    }
  }, []);

  useEffect(() => {
    checkPersonaStatus();
  }, [checkPersonaStatus]);

  const anyPersonaFound = Object.values(personaStatus).some(Boolean);

  const callEdgeFunction = async (fnName: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('Not authenticated');

    const res = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/${fnName}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({}),
      }
    );

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || `Edge function ${fnName} failed`);
    }
    return data;
  };

  const handleSeed = async () => {
    setSeeding(true);
    setMessage(null);
    try {
      const result = await callEdgeFunction('seed-test-data');
      setMessage({
        type: 'success',
        text: `Seeded ${result.personas?.length || 5} personas: ${result.personas?.join(', ') || 'All'}`,
      });
      // Refresh status after seeding
      await checkPersonaStatus();
    } catch (err: any) {
      setMessage({ type: 'error', text: `Seed failed: ${err.message}` });
    } finally {
      setSeeding(false);
    }
  };

  const handleReset = async () => {
    if (!window.confirm('Delete ALL @mylifefolio.test users and their data? This cannot be undone.')) {
      return;
    }
    setResetting(true);
    setMessage(null);
    try {
      const result = await callEdgeFunction('reset-test-data');
      setMessage({
        type: 'success',
        text: result.message || `Deleted ${result.deleted?.length || 0} test users`,
      });
      // Refresh status after reset
      await checkPersonaStatus();
    } catch (err: any) {
      setMessage({ type: 'error', text: `Reset failed: ${err.message}` });
    } finally {
      setResetting(false);
    }
  };

  const handleQuickLogin = async (email: string) => {
    setLoggingIn(email);
    setMessage(null);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password: TEST_PASSWORD,
      });
      if (error) throw error;
      window.location.reload();
    } catch (err: any) {
      setMessage({ type: 'error', text: `Login failed for ${email}: ${err.message}` });
      setLoggingIn(null);
    }
  };

  return (
    <Paper
      elevation={2}
      sx={{
        p: 3,
        mt: 3,
        border: '2px dashed',
        borderColor: '#ff9800',
        backgroundColor: '#fff8e1',
      }}
    >
      {/* Warning Banner */}
      <Alert severity="warning" sx={{ mb: 3 }}>
        This panel is for development and testing only. Seed data is fictional.
        Never run seed operations on a production database.
      </Alert>

      <Typography variant="h6" sx={{ mb: 1, color: '#1e3a5f', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
        <ScienceIcon /> Test Data Management
      </Typography>

      <Typography variant="body2" sx={{ mb: 2, color: '#666' }}>
        Seed or reset test personas for QA. All test accounts use @mylifefolio.test emails
        and password <code>TestPass123!</code>.
      </Typography>

      {message && (
        <Alert severity={message.type} sx={{ mb: 2 }} onClose={() => setMessage(null)}>
          {message.text}
        </Alert>
      )}

      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <Button
          variant="contained"
          startIcon={seeding ? <CircularProgress size={18} color="inherit" /> : <ScienceIcon />}
          onClick={handleSeed}
          disabled={seeding || resetting}
          sx={{ backgroundColor: '#1e3a5f', '&:hover': { backgroundColor: '#2c5282' } }}
        >
          {seeding ? 'Seeding...' : 'Seed Test Data'}
        </Button>

        <Button
          variant="outlined"
          color="error"
          startIcon={resetting ? <CircularProgress size={18} color="error" /> : <DeleteSweepIcon />}
          onClick={handleReset}
          disabled={seeding || resetting}
        >
          {resetting ? 'Resetting...' : 'Reset Test Data'}
        </Button>
      </Box>

      <Divider sx={{ mb: 2 }} />

      {/* Test Personas with Status */}
      <Typography variant="subtitle2" sx={{ mb: 1, color: '#1e3a5f' }}>
        Test Personas
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 3 }}>
        {TEST_PERSONAS.map((p) => (
          <Box key={p.email} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {statusLoading ? (
              <CircularProgress size={16} sx={{ mr: 0.5 }} />
            ) : personaStatus[p.email] ? (
              <CheckCircleIcon sx={{ fontSize: 16, color: 'success.main' }} />
            ) : (
              <CancelIcon sx={{ fontSize: 16, color: 'text.disabled' }} />
            )}
            <Chip
              label={p.name}
              size="small"
              sx={{ minWidth: 150, backgroundColor: personaStatus[p.email] ? '#e3f2fd' : '#f5f5f5' }}
            />
            <Chip
              label={statusLoading ? '...' : personaStatus[p.email] ? 'Found' : 'Not Found'}
              size="small"
              variant="outlined"
              color={personaStatus[p.email] ? 'success' : 'default'}
              sx={{ minWidth: 80 }}
            />
            <Typography variant="caption" sx={{ color: '#666' }}>
              {p.email} — {p.desc}
            </Typography>
          </Box>
        ))}
      </Box>

      <Divider sx={{ mb: 2 }} />

      {/* Quick Login */}
      <Typography variant="subtitle2" sx={{ mb: 1, color: '#1e3a5f' }}>
        Quick Login
      </Typography>

      <Typography variant="caption" sx={{ display: 'block', mb: 1.5, color: '#666' }}>
        Sign in as a test persona in one click. This will sign you out of your current account.
      </Typography>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
        {TEST_PERSONAS.map((p) => (
          <Button
            key={p.email}
            variant="outlined"
            size="small"
            startIcon={loggingIn === p.email ? <CircularProgress size={14} /> : <LoginIcon />}
            onClick={() => handleQuickLogin(p.email)}
            disabled={loggingIn !== null || seeding || resetting || !personaStatus[p.email]}
            sx={{
              textTransform: 'none',
              borderColor: '#1e3a5f',
              color: '#1e3a5f',
              '&:hover': { borderColor: '#2c5282', backgroundColor: '#e3f2fd' },
              '&.Mui-disabled': { borderColor: '#ccc', color: '#999' },
            }}
          >
            {p.name.split(' ')[0]}
          </Button>
        ))}
        {!anyPersonaFound && !statusLoading && (
          <Typography variant="caption" sx={{ color: '#999', alignSelf: 'center', ml: 1 }}>
            Seed test data first to enable quick login
          </Typography>
        )}
      </Box>
    </Paper>
  );
}
