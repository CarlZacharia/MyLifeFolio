'use client';

import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, CircularProgress, Alert, Button, Grid,
} from '@mui/material';
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard';
import RefreshIcon from '@mui/icons-material/Refresh';
import {
  SubscriptionStats, fetchSubscriptionStats, fetchAllUsersWithSubscriptions, AdminUser,
} from '../../lib/adminService';
import AdminGrantCompModal from './AdminGrantCompModal';

const StatCard: React.FC<{ label: string; value: string | number; color?: string }> = ({
  label, value, color = '#1e3a5f',
}) => (
  <Paper sx={{ p: 2, textAlign: 'center', flex: 1, minWidth: 120 }}>
    <Typography variant="caption" color="text.secondary">{label}</Typography>
    <Typography variant="h4" sx={{ color, fontWeight: 600 }}>{value}</Typography>
  </Paper>
);

export default function AdminSubscriptionsTab() {
  const [stats, setStats] = useState<SubscriptionStats | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [compOpen, setCompOpen] = useState(false);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [s, u] = await Promise.all([
        fetchSubscriptionStats(),
        fetchAllUsersWithSubscriptions(),
      ]);
      setStats(s);
      setUsers(u);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!stats) {
    return <Alert severity="error">{error || 'No data'}</Alert>;
  }

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Stat Cards */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <StatCard label="Total Users" value={stats.total} />
        <StatCard label="Active Trials" value={stats.trial} color="#2196f3" />
        <StatCard label="Expired Trials" value={stats.trialExpired} color="#ff9800" />
        <StatCard label="Standard" value={stats.standard} color="#4caf50" />
        <StatCard label="Enhanced" value={stats.enhanced} color="#9c27b0" />
        <StatCard label="Cancelled" value={stats.cancelled} color="#f44336" />
        <StatCard label="Past Due" value={stats.pastDue} color="#ff5722" />
      </Box>

      {/* MRR */}
      <Paper sx={{ p: 3, mb: 3, bgcolor: '#f8f9fa' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="caption" color="text.secondary">Monthly Recurring Revenue (MRR)</Typography>
            <Typography variant="h3" sx={{ color: '#1e3a5f', fontWeight: 700 }}>
              ${stats.mrr.toFixed(2)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Based on {stats.standard} Standard + {stats.enhanced} Enhanced subscribers
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">Annual Run Rate</Typography>
            <Typography variant="h5" sx={{ color: '#1e3a5f', fontWeight: 600 }}>
              ${(stats.mrr * 12).toFixed(2)}
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* Tier Breakdown */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#1e3a5f', mb: 2 }}>
          Tier Distribution
        </Typography>
        {[
          { label: 'Trial (active)', count: stats.trial, color: '#2196f3' },
          { label: 'Trial (expired)', count: stats.trialExpired, color: '#ff9800' },
          { label: 'Standard', count: stats.standard, color: '#4caf50' },
          { label: 'Enhanced', count: stats.enhanced, color: '#9c27b0' },
          { label: 'Cancelled', count: stats.cancelled, color: '#f44336' },
          { label: 'Past Due', count: stats.pastDue, color: '#ff5722' },
        ].map((row) => {
          const pct = stats.total > 0 ? (row.count / stats.total) * 100 : 0;
          return (
            <Box key={row.label} sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
              <Typography variant="body2" sx={{ width: 130 }}>{row.label}</Typography>
              <Box sx={{ flex: 1, bgcolor: '#eee', borderRadius: 1, height: 16 }}>
                <Box
                  sx={{
                    width: `${pct}%`,
                    bgcolor: row.color,
                    borderRadius: 1,
                    height: '100%',
                    minWidth: row.count > 0 ? 8 : 0,
                    transition: 'width 0.3s',
                  }}
                />
              </Box>
              <Typography variant="body2" sx={{ width: 50, textAlign: 'right' }}>
                {row.count} ({pct.toFixed(0)}%)
              </Typography>
            </Box>
          );
        })}
      </Paper>

      {/* Actions */}
      <Box sx={{ display: 'flex', gap: 2 }}>
        <Button
          variant="contained"
          startIcon={<CardGiftcardIcon />}
          onClick={() => setCompOpen(true)}
          sx={{ bgcolor: '#1e3a5f', '&:hover': { bgcolor: '#0f2744' } }}
        >
          Grant Comp Subscription
        </Button>
        <Button variant="outlined" startIcon={<RefreshIcon />} onClick={load}>
          Refresh
        </Button>
      </Box>

      {/* Grant Comp Modal */}
      <AdminGrantCompModal
        open={compOpen}
        onClose={() => setCompOpen(false)}
        users={users}
        onGranted={load}
      />
    </Box>
  );
}
