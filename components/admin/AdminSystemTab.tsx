'use client';

import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, CircularProgress, Alert, Button,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import StorageIcon from '@mui/icons-material/Storage';
import { StorageUser, fetchStorageStats, formatBytes } from '../../lib/adminService';
import AdminTestPanel from '../AdminTestPanel';

export default function AdminSystemTab() {
  const [storageUsers, setStorageUsers] = useState<StorageUser[]>([]);
  const [totalSize, setTotalSize] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const { users, totalSize: ts } = await fetchStorageStats();
      setStorageUsers(users);
      setTotalSize(ts);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Storage Stats */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" sx={{ color: '#1e3a5f', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
          <StorageIcon /> Vault Storage
        </Typography>
        <Button variant="outlined" size="small" startIcon={<RefreshIcon />} onClick={load}>
          Refresh
        </Button>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {/* Summary */}
          <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
            <Paper sx={{ p: 2, flex: 1, textAlign: 'center' }}>
              <Typography variant="caption" color="text.secondary">Total Storage Used</Typography>
              <Typography variant="h4" sx={{ color: '#1e3a5f', fontWeight: 600 }}>
                {formatBytes(totalSize)}
              </Typography>
            </Paper>
            <Paper sx={{ p: 2, flex: 1, textAlign: 'center' }}>
              <Typography variant="caption" color="text.secondary">Users with Documents</Typography>
              <Typography variant="h4" sx={{ color: '#1e3a5f', fontWeight: 600 }}>
                {storageUsers.length}
              </Typography>
            </Paper>
            <Paper sx={{ p: 2, flex: 1, textAlign: 'center' }}>
              <Typography variant="caption" color="text.secondary">Total Documents</Typography>
              <Typography variant="h4" sx={{ color: '#1e3a5f', fontWeight: 600 }}>
                {storageUsers.reduce((sum, u) => sum + u.doc_count, 0)}
              </Typography>
            </Paper>
          </Box>

          {/* Per-User Storage Table */}
          <TableContainer component={Paper} sx={{ mb: 4 }}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                  <TableCell sx={{ fontWeight: 600 }}>User</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
                  <TableCell sx={{ fontWeight: 600, textAlign: 'right' }}>Documents</TableCell>
                  <TableCell sx={{ fontWeight: 600, textAlign: 'right' }}>Storage Used</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {storageUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center" sx={{ py: 3 }}>
                      <Typography color="text.secondary">No vault documents found</Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  storageUsers.map((u) => (
                    <TableRow key={u.user_id} hover>
                      <TableCell>
                        <Typography variant="body2" fontWeight={500}>{u.name || '—'}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{u.email || u.user_id.slice(0, 8)}</Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2">{u.doc_count}</Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" fontWeight={500}>{formatBytes(u.total_size)}</Typography>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}

      {/* Test Data Panel */}
      <AdminTestPanel />
    </Box>
  );
}
