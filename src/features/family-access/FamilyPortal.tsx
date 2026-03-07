import React, { useState, useEffect } from 'react';
import {
  Container, Box, Typography, AppBar, Toolbar, Button, CircularProgress, Alert, Tabs, Tab, Paper,
} from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import ChatIcon from '@mui/icons-material/Chat';
import DescriptionIcon from '@mui/icons-material/Description';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../../lib/supabase';
import { filterFolioByAccess, FilteredFolio } from './utils/filterFolioByAccess';
import ChatInterface from './ChatInterface';
import ReportViewer from './ReportViewer';

interface AuthorizedAccess {
  id: string;
  owner_id: string;
  authorized_email: string;
  display_name: string;
  access_sections: string[];
  is_active: boolean;
}

const SESSION_MAX_AGE_MS = 4 * 60 * 60 * 1000; // 4 hours

const FamilyPortal: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [access, setAccess] = useState<AuthorizedAccess | null>(null);
  const [filteredFolio, setFilteredFolio] = useState<FilteredFolio | null>(null);
  const [tab, setTab] = useState(0);
  const [userEmail, setUserEmail] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const initialize = async () => {
      try {
        // Check session
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) {
          navigate('/family-access');
          return;
        }

        // Enforce 4-hour session expiry
        const sessionCreated = session.user.last_sign_in_at
          ? new Date(session.user.last_sign_in_at).getTime()
          : 0;
        if (Date.now() - sessionCreated > SESSION_MAX_AGE_MS) {
          await supabase.auth.signOut();
          navigate('/family-access');
          return;
        }

        const email = session.user.email || '';
        setUserEmail(email);

        // Look up authorization
        const { data: authRows, error: authError } = await supabase
          .from('folio_authorized_users')
          .select('*')
          .eq('is_active', true);

        if (authError) throw authError;

        if (!authRows || authRows.length === 0) {
          setError("You don't have access to any folios. Please contact your family member to add you.");
          setLoading(false);
          return;
        }

        // Use the first active authorization (could support multiple folios later)
        const auth = authRows[0] as AuthorizedAccess;
        setAccess(auth);

        // Fetch the owner's folio data from intakes_raw
        const { data: intakeRows, error: intakeError } = await supabase
          .from('intakes_raw')
          .select('form_data')
          .eq('user_id', auth.owner_id)
          .order('created_at', { ascending: false })
          .limit(1);

        if (intakeError) throw intakeError;

        if (!intakeRows || intakeRows.length === 0) {
          setError('No folio data found. The account holder may not have completed their folio yet.');
          setLoading(false);
          return;
        }

        const folioData = intakeRows[0].form_data as Record<string, unknown>;
        const filtered = filterFolioByAccess(folioData, auth.access_sections);
        setFilteredFolio(filtered);
      } catch (err) {
        console.error('Portal init error:', err);
        setError('An error occurred loading the folio. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    initialize();
  }, [navigate]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/family-access');
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', bgcolor: '#e8eaf6' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: '#e8eaf6', pt: 4 }}>
        <Container maxWidth="sm">
          <Alert severity="info" sx={{ mb: 2 }}>{error}</Alert>
          <Button variant="outlined" onClick={handleSignOut}>Sign Out</Button>
        </Container>
      </Box>
    );
  }

  if (!access || !filteredFolio) return null;

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#e8eaf6' }}>
      {/* AppBar */}
      <AppBar position="static" sx={{ bgcolor: '#1a237e' }} className="no-print">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            MyLifeFolio &mdash; Family Portal
          </Typography>
          <Typography variant="body2" sx={{ mr: 2, opacity: 0.8 }}>
            {access.display_name} ({userEmail})
          </Typography>
          <Button color="inherit" startIcon={<LogoutIcon />} onClick={handleSignOut}>
            Sign Out
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 3 }}>
        {/* Welcome */}
        <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }} className="no-print">
          <Typography variant="h5" sx={{ color: '#1a237e', fontWeight: 600 }}>
            Welcome, {access.display_name}
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary', mt: 0.5 }}>
            You are viewing {filteredFolio.ownerName}'s folio. You have access to: {filteredFolio.sectionsIncluded.join(', ')}.
          </Typography>
        </Paper>

        {/* Tabs */}
        <Paper sx={{ borderRadius: 2 }} className="no-print">
          <Tabs
            value={tab}
            onChange={(_, v) => setTab(v)}
            sx={{
              borderBottom: '1px solid #e0e0e0',
              '& .MuiTab-root': { color: '#666' },
              '& .Mui-selected': { color: '#1a237e' },
              '& .MuiTabs-indicator': { backgroundColor: '#1a237e' },
            }}
          >
            <Tab icon={<ChatIcon />} label="Chat" iconPosition="start" />
            <Tab icon={<DescriptionIcon />} label="Reports" iconPosition="start" />
          </Tabs>
        </Paper>

        <Box sx={{ mt: 3 }}>
          {tab === 0 && (
            <ChatInterface
              filteredFolio={filteredFolio}
              ownerId={access.owner_id}
            />
          )}
          {tab === 1 && (
            <ReportViewer
              data={filteredFolio.data}
              ownerName={filteredFolio.ownerName}
              ownerId={access.owner_id}
              accessSections={access.access_sections}
              accessorEmail={userEmail}
              accessorName={access.display_name}
            />
          )}
        </Box>
      </Container>
    </Box>
  );
};

export default FamilyPortal;
