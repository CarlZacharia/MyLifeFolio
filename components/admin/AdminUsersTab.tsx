'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Box, Typography, TextField, Chip, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, IconButton, Collapse,
  Button, CircularProgress, Alert, Tooltip, InputAdornment,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import BlockIcon from '@mui/icons-material/Block';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import EditIcon from '@mui/icons-material/Edit';
import RefreshIcon from '@mui/icons-material/Refresh';
import {
  AdminUser, fetchAllUsersWithSubscriptions, toggleUserDisabled, updateUserTier, formatDate,
} from '../../lib/adminService';
import { SubscriptionTier, TIER_INFO } from '../../lib/subscriptionConfig';
import AdminChangeTierModal from './AdminChangeTierModal';

type FilterKey = 'all' | 'trial' | 'standard' | 'enhanced' | 'expired' | 'disabled';

const FILTER_CHIPS: { key: FilterKey; label: string }[] = [
  { key: 'all', label: 'All Users' },
  { key: 'trial', label: 'Trial' },
  { key: 'standard', label: 'Standard' },
  { key: 'enhanced', label: 'Enhanced' },
  { key: 'expired', label: 'Expired' },
  { key: 'disabled', label: 'Disabled' },
];

const tierColor = (tier: SubscriptionTier | null): 'default' | 'info' | 'primary' | 'secondary' => {
  if (tier === 'standard') return 'primary';
  if (tier === 'enhanced') return 'secondary';
  return 'default';
};

const statusColor = (status: string | null): 'success' | 'warning' | 'error' | 'default' => {
  if (status === 'active') return 'success';
  if (status === 'past_due') return 'warning';
  if (status === 'cancelled' || status === 'expired') return 'error';
  return 'default';
};

export default function AdminUsersTab() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FilterKey>('all');
  const [expandedUsers, setExpandedUsers] = useState<Set<string>>(new Set());
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Change tier modal
  const [tierModalUser, setTierModalUser] = useState<AdminUser | null>(null);

  const loadUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAllUsersWithSubscriptions();
      setUsers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadUsers(); }, []);

  const filteredUsers = useMemo(() => {
    let list = users;

    // Search
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (u) =>
          u.email.toLowerCase().includes(q) ||
          (u.name || '').toLowerCase().includes(q) ||
          (u.telephone || '').includes(q)
      );
    }

    // Filter
    const now = new Date();
    switch (filter) {
      case 'trial':
        list = list.filter((u) => u.tier === 'trial');
        break;
      case 'standard':
        list = list.filter((u) => u.tier === 'standard');
        break;
      case 'enhanced':
        list = list.filter((u) => u.tier === 'enhanced');
        break;
      case 'expired':
        list = list.filter(
          (u) =>
            u.sub_status === 'expired' ||
            u.sub_status === 'cancelled' ||
            (u.tier === 'trial' && u.trial_ends_at && new Date(u.trial_ends_at) < now)
        );
        break;
      case 'disabled':
        list = list.filter((u) => u.is_disabled);
        break;
    }

    return list;
  }, [users, search, filter]);

  const toggleExpand = (id: string) => {
    setExpandedUsers((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleToggleDisabled = async (user: AdminUser) => {
    const action = user.is_disabled ? 'enable' : 'disable';
    if (!window.confirm(`Are you sure you want to ${action} ${user.email}?`)) return;
    setActionLoading(user.id);
    try {
      await toggleUserDisabled(user.id, !user.is_disabled);
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, is_disabled: !u.is_disabled } : u))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Action failed');
    } finally {
      setActionLoading(null);
    }
  };

  const handleTierConfirm = async (tier: SubscriptionTier) => {
    if (!tierModalUser) return;
    await updateUserTier(tierModalUser.id, tier);
    setUsers((prev) =>
      prev.map((u) => (u.id === tierModalUser.id ? { ...u, tier, sub_status: 'active' } : u))
    );
  };

  const trialDaysLeft = (user: AdminUser): string | null => {
    if (user.tier !== 'trial' || !user.trial_ends_at) return null;
    const days = Math.ceil((new Date(user.trial_ends_at).getTime() - Date.now()) / 86400000);
    if (days <= 0) return 'Expired';
    return `${days}d left`;
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Search + Filters */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2, flexWrap: 'wrap' }}>
        <TextField
          size="small"
          placeholder="Search by name, email, or phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ minWidth: 300 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
        />
        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
          {FILTER_CHIPS.map((f) => (
            <Chip
              key={f.key}
              label={f.label}
              size="small"
              variant={filter === f.key ? 'filled' : 'outlined'}
              color={filter === f.key ? 'primary' : 'default'}
              onClick={() => setFilter(f.key)}
              sx={{ cursor: 'pointer' }}
            />
          ))}
        </Box>
        <Box sx={{ ml: 'auto' }}>
          <Tooltip title="Refresh">
            <IconButton onClick={loadUsers} size="small">
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
        Showing {filteredUsers.length} of {users.length} users
      </Typography>

      {/* Users Table */}
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: '#1e3a5f' }}>
              <TableCell sx={{ color: 'white', width: 40 }} />
              <TableCell sx={{ color: 'white', fontWeight: 600 }}>Name</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 600 }}>Email</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 600 }}>Tier</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 600 }}>Status</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 600 }}>Intakes</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 600 }}>Registered</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 600, width: 120 }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                  <Typography color="text.secondary">No users match your criteria</Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => {
                const expanded = expandedUsers.has(user.id);
                const trial = trialDaysLeft(user);
                return (
                  <React.Fragment key={user.id}>
                    <TableRow
                      hover
                      sx={{
                        cursor: 'pointer',
                        opacity: user.is_disabled ? 0.5 : 1,
                        '& > *': { borderBottom: expanded ? 0 : undefined },
                      }}
                      onClick={() => toggleExpand(user.id)}
                    >
                      <TableCell>
                        <IconButton size="small">
                          {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                        </IconButton>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Typography variant="body2" fontWeight={500}>
                            {user.name || '—'}
                          </Typography>
                          {user.is_admin && (
                            <Chip label="Admin" size="small" color="secondary" sx={{ height: 18, fontSize: '0.65rem' }} />
                          )}
                          {user.is_disabled && (
                            <Chip label="Disabled" size="small" color="error" sx={{ height: 18, fontSize: '0.65rem' }} />
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{user.email}</Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Chip
                            label={TIER_INFO[user.tier || 'trial']?.name || 'Trial'}
                            size="small"
                            color={tierColor(user.tier)}
                            variant="outlined"
                          />
                          {trial && (
                            <Typography variant="caption" color={trial === 'Expired' ? 'error' : 'text.secondary'}>
                              {trial}
                            </Typography>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={user.sub_status || 'none'}
                          size="small"
                          color={statusColor(user.sub_status)}
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={user.intake_count}
                          size="small"
                          color={user.intake_count > 0 ? 'primary' : 'default'}
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption">{formatDate(user.created_at)}</Typography>
                      </TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                          <Tooltip title="Change tier">
                            <IconButton
                              size="small"
                              onClick={() => setTierModalUser(user)}
                              disabled={actionLoading === user.id}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title={user.is_disabled ? 'Enable account' : 'Disable account'}>
                            <IconButton
                              size="small"
                              color={user.is_disabled ? 'success' : 'error'}
                              onClick={() => handleToggleDisabled(user)}
                              disabled={actionLoading === user.id}
                            >
                              {actionLoading === user.id ? (
                                <CircularProgress size={16} />
                              ) : user.is_disabled ? (
                                <CheckCircleOutlineIcon fontSize="small" />
                              ) : (
                                <BlockIcon fontSize="small" />
                              )}
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>

                    {/* Expanded detail row */}
                    <TableRow>
                      <TableCell colSpan={8} sx={{ py: 0, bgcolor: '#f8f9fa' }}>
                        <Collapse in={expanded} timeout="auto" unmountOnExit>
                          <Box sx={{ py: 2, px: 4 }}>
                            <Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                              <Box>
                                <Typography variant="caption" color="text.secondary">Phone</Typography>
                                <Typography variant="body2">{user.telephone || '—'}</Typography>
                              </Box>
                              <Box>
                                <Typography variant="caption" color="text.secondary">State</Typography>
                                <Typography variant="body2">{user.state_of_domicile || '—'}</Typography>
                              </Box>
                              <Box>
                                <Typography variant="caption" color="text.secondary">Address</Typography>
                                <Typography variant="body2">{user.address || '—'}</Typography>
                              </Box>
                              <Box>
                                <Typography variant="caption" color="text.secondary">Trial Ends</Typography>
                                <Typography variant="body2">
                                  {user.trial_ends_at ? formatDate(user.trial_ends_at) : '—'}
                                </Typography>
                              </Box>
                              <Box>
                                <Typography variant="caption" color="text.secondary">Subscription Ends</Typography>
                                <Typography variant="body2">
                                  {user.current_period_end ? formatDate(user.current_period_end) : '—'}
                                </Typography>
                              </Box>
                              <Box>
                                <Typography variant="caption" color="text.secondary">Stripe Customer</Typography>
                                <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
                                  {user.stripe_customer_id || '—'}
                                </Typography>
                              </Box>
                            </Box>
                          </Box>
                        </Collapse>
                      </TableCell>
                    </TableRow>
                  </React.Fragment>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Change Tier Modal */}
      {tierModalUser && (
        <AdminChangeTierModal
          open={!!tierModalUser}
          onClose={() => setTierModalUser(null)}
          onConfirm={handleTierConfirm}
          userName={tierModalUser.name || tierModalUser.email}
          currentTier={tierModalUser.tier}
        />
      )}
    </Box>
  );
}
