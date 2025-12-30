'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  CircularProgress,
  Alert,
  Chip,
  IconButton,
  Collapse,
  Tooltip,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import DescriptionIcon from '@mui/icons-material/Description';
import { supabase } from '../lib/supabase';

interface IntakeRecord {
  id: string;
  user_id: string;
  intake_type: string;
  created_at: string;
  updated_at: string;
  submission_comments: string | null;
  office_id: string | null;
  attorney_id: string | null;
  form_data: Record<string, unknown>;
}

interface ProfileRecord {
  id: string;
  email: string;
  name: string | null;
  address: string | null;
  state_of_domicile: string | null;
  telephone: string | null;
  is_admin: boolean;
  created_at: string;
}

interface UserWithIntakes {
  id: string;
  email: string;
  name: string | null;
  address: string | null;
  state_of_domicile: string | null;
  telephone: string | null;
  is_admin: boolean;
  created_at: string;
  intakes: IntakeRecord[];
}

interface AdminDashboardProps {
  onBack: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onBack }) => {
  const [usersWithIntakes, setUsersWithIntakes] = useState<UserWithIntakes[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedUsers, setExpandedUsers] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchUsersAndIntakes();
  }, []);

  const fetchUsersAndIntakes = async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch all profiles first
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) {
        // If profiles table doesn't exist yet, fall back to old behavior
        console.warn('Profiles table not available, falling back to intake-based data:', profilesError.message);
      }

      // Fetch all intakes
      const { data: intakes, error: intakesError } = await supabase
        .from('intakes_raw')
        .select('*')
        .order('created_at', { ascending: false });

      if (intakesError) {
        throw new Error(`Failed to fetch intakes: ${intakesError.message}`);
      }

      // Create a map of profiles by user ID
      const profileMap = new Map<string, ProfileRecord>();
      if (profiles) {
        for (const profile of profiles) {
          profileMap.set(profile.id, profile as ProfileRecord);
        }
      }

      // Group intakes by user_id and merge with profile data
      const userMap = new Map<string, UserWithIntakes>();

      // First, add all users from profiles (even those without intakes)
      if (profiles) {
        for (const profile of profiles) {
          userMap.set(profile.id, {
            id: profile.id,
            email: profile.email || 'Unknown',
            name: profile.name,
            address: profile.address,
            state_of_domicile: profile.state_of_domicile,
            telephone: profile.telephone,
            is_admin: profile.is_admin || false,
            created_at: profile.created_at,
            intakes: [],
          });
        }
      }

      // Then add intakes to their respective users
      for (const intake of intakes || []) {
        const userId = intake.user_id;

        if (!userMap.has(userId)) {
          // User not in profiles table, create from intake data
          const formData = intake.form_data as Record<string, unknown>;
          const clientEmail = formData?.clientEmail as string || 'Unknown';

          userMap.set(userId, {
            id: userId,
            email: clientEmail,
            name: formData?.name as string || null,
            address: null,
            state_of_domicile: formData?.stateOfDomicile as string || null,
            telephone: null,
            is_admin: false,
            created_at: intake.created_at,
            intakes: [],
          });
        }

        const user = userMap.get(userId)!;
        user.intakes.push(intake as IntakeRecord);
      }

      // Sort by created_at descending
      const sortedUsers = Array.from(userMap.values()).sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      setUsersWithIntakes(sortedUsers);
    } catch (err) {
      console.error('Error fetching admin data:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while fetching data');
    } finally {
      setLoading(false);
    }
  };

  const toggleUserExpanded = (userId: string) => {
    setExpandedUsers((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(userId)) {
        newSet.delete(userId);
      } else {
        newSet.add(userId);
      }
      return newSet;
    });
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getClientName = (formData: Record<string, unknown>): string => {
    // Check for 'name' field first (primary client name field)
    const name = formData?.name as string;
    if (name) {
      return name;
    }
    // Fallback to firstName/lastName if present
    const firstName = formData?.clientFirstName as string || '';
    const lastName = formData?.clientLastName as string || '';
    if (firstName || lastName) {
      return `${firstName} ${lastName}`.trim();
    }
    return 'Unknown Client';
  };

  const getIntakeStatus = (intake: IntakeRecord): { label: string; color: 'success' | 'warning' | 'default' } => {
    const formData = intake.form_data;
    // Check if the intake has been submitted (has Claude analysis or submission comments)
    if (formData && (formData as Record<string, unknown>).claudeAnalysis) {
      return { label: 'Analyzed', color: 'success' };
    }
    if (intake.submission_comments) {
      return { label: 'Submitted', color: 'success' };
    }
    return { label: 'In Progress', color: 'warning' };
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1400, mx: 'auto' }}>
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
        <Typography variant="h4" sx={{ color: '#1e3a5f', fontWeight: 600 }}>
          Admin Dashboard
        </Typography>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Loading State */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {/* Summary Stats */}
          <Box sx={{ display: 'flex', gap: 3, mb: 4 }}>
            <Paper sx={{ p: 3, flex: 1, bgcolor: '#f8f9fa' }}>
              <Typography variant="h6" color="text.secondary">
                Total Users
              </Typography>
              <Typography variant="h3" sx={{ color: '#1e3a5f', fontWeight: 600 }}>
                {usersWithIntakes.length}
              </Typography>
            </Paper>
            <Paper sx={{ p: 3, flex: 1, bgcolor: '#f8f9fa' }}>
              <Typography variant="h6" color="text.secondary">
                Total Intakes
              </Typography>
              <Typography variant="h3" sx={{ color: '#1e3a5f', fontWeight: 600 }}>
                {usersWithIntakes.reduce((sum, user) => sum + user.intakes.length, 0)}
              </Typography>
            </Paper>
          </Box>

          {/* Users Table */}
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#1e3a5f' }}>
                  <TableCell sx={{ color: 'white', fontWeight: 600, width: 50 }}></TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 600 }}>Name</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 600 }}>Email</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 600 }}>Phone</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 600 }}>State</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 600 }}>Intakes</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 600 }}>Registered</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {usersWithIntakes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                      <Typography color="text.secondary">No users or intakes found</Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  usersWithIntakes.map((user) => (
                    <React.Fragment key={user.id}>
                      {/* User Row */}
                      <TableRow
                        hover
                        sx={{ cursor: 'pointer', '& > *': { borderBottom: expandedUsers.has(user.id) ? 0 : undefined } }}
                        onClick={() => toggleUserExpanded(user.id)}
                      >
                        <TableCell>
                          <IconButton size="small">
                            {expandedUsers.has(user.id) ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                          </IconButton>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography fontWeight={500}>{user.name || '—'}</Typography>
                            {user.is_admin && (
                              <Chip label="Admin" size="small" color="secondary" sx={{ height: 20, fontSize: '0.7rem' }} />
                            )}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">{user.email}</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">{user.telephone || '—'}</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">{user.state_of_domicile || '—'}</Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={user.intakes.length}
                            size="small"
                            color={user.intakes.length > 0 ? 'primary' : 'default'}
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>{formatDate(user.created_at)}</TableCell>
                      </TableRow>

                      {/* Expanded Intakes */}
                      <TableRow>
                        <TableCell colSpan={7} sx={{ py: 0, bgcolor: '#f8f9fa' }}>
                          <Collapse in={expandedUsers.has(user.id)} timeout="auto" unmountOnExit>
                            <Box sx={{ py: 2, px: 4 }}>
                              <Typography variant="subtitle2" sx={{ mb: 2, color: '#1e3a5f' }}>
                                Estate Planning Intakes
                              </Typography>
                              <Table size="small">
                                <TableHead>
                                  <TableRow>
                                    <TableCell sx={{ fontWeight: 600 }}>Client Name</TableCell>
                                    <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
                                    <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                                    <TableCell sx={{ fontWeight: 600 }}>Created</TableCell>
                                    <TableCell sx={{ fontWeight: 600 }}>Updated</TableCell>
                                    <TableCell sx={{ fontWeight: 600 }}>Comments</TableCell>
                                  </TableRow>
                                </TableHead>
                                <TableBody>
                                  {user.intakes.map((intake) => {
                                    const status = getIntakeStatus(intake);
                                    return (
                                      <TableRow key={intake.id}>
                                        <TableCell>
                                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <DescriptionIcon fontSize="small" color="action" />
                                            {getClientName(intake.form_data)}
                                          </Box>
                                        </TableCell>
                                        <TableCell>
                                          <Chip
                                            label={intake.intake_type || 'estate-planning'}
                                            size="small"
                                            variant="outlined"
                                          />
                                        </TableCell>
                                        <TableCell>
                                          <Chip
                                            label={status.label}
                                            size="small"
                                            color={status.color}
                                          />
                                        </TableCell>
                                        <TableCell>{formatDate(intake.created_at)}</TableCell>
                                        <TableCell>{formatDate(intake.updated_at)}</TableCell>
                                        <TableCell>
                                          {intake.submission_comments ? (
                                            <Tooltip title={intake.submission_comments}>
                                              <Typography
                                                variant="body2"
                                                sx={{
                                                  maxWidth: 200,
                                                  overflow: 'hidden',
                                                  textOverflow: 'ellipsis',
                                                  whiteSpace: 'nowrap',
                                                }}
                                              >
                                                {intake.submission_comments}
                                              </Typography>
                                            </Tooltip>
                                          ) : (
                                            <Typography variant="body2" color="text.secondary">
                                              —
                                            </Typography>
                                          )}
                                        </TableCell>
                                      </TableRow>
                                    );
                                  })}
                                </TableBody>
                              </Table>
                            </Box>
                          </Collapse>
                        </TableCell>
                      </TableRow>
                    </React.Fragment>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}
    </Box>
  );
};

export default AdminDashboard;
