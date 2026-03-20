'use client';

import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, CircularProgress, Alert, Chip, Button, Tooltip,
  IconButton, Divider,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import LinkOffIcon from '@mui/icons-material/LinkOff';
import {
  AccessLogEntry, FamilyAccessGrant,
  fetchAccessLog, fetchFamilyAccessGrants, revokeFamilyAccess, formatDate,
} from '../../lib/adminService';

export default function AdminAccessTab() {
  const [logs, setLogs] = useState<AccessLogEntry[]>([]);
  const [grants, setGrants] = useState<FamilyAccessGrant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [revoking, setRevoking] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [l, g] = await Promise.all([fetchAccessLog(), fetchFamilyAccessGrants()]);
      setLogs(l);
      setGrants(g);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleRevoke = async (grant: FamilyAccessGrant) => {
    if (!window.confirm(`Revoke access for ${grant.authorized_email} to ${grant.owner_name || grant.owner_email}'s folio?`)) return;
    setRevoking(grant.id);
    try {
      await revokeFamilyAccess(grant.id);
      setGrants((prev) =>
        prev.map((g) => (g.id === grant.id ? { ...g, is_active: false } : g))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Revoke failed');
    } finally {
      setRevoking(null);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  const activeGrants = grants.filter((g) => g.is_active);
  const revokedGrants = grants.filter((g) => !g.is_active);

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Active Family Access Grants */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" sx={{ color: '#1e3a5f', fontWeight: 600 }}>
          Active Family Access Grants ({activeGrants.length})
        </Typography>
        <Button variant="outlined" size="small" startIcon={<RefreshIcon />} onClick={load}>
          Refresh
        </Button>
      </Box>

      <TableContainer component={Paper} sx={{ mb: 4 }}>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: '#1e3a5f' }}>
              <TableCell sx={{ color: 'white', fontWeight: 600 }}>Folio Owner</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 600 }}>Authorized Person</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 600 }}>Sections</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 600 }}>Granted</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 600, width: 80 }}>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {activeGrants.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                  <Typography color="text.secondary">No active family access grants</Typography>
                </TableCell>
              </TableRow>
            ) : (
              activeGrants.map((g) => (
                <TableRow key={g.id} hover>
                  <TableCell>
                    <Typography variant="body2" fontWeight={500}>
                      {g.owner_name || g.owner_email || g.owner_id.slice(0, 8)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">{g.owner_email}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{g.display_name || '—'}</Typography>
                    <Typography variant="caption" color="text.secondary">{g.authorized_email}</Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                      {(g.access_sections || []).slice(0, 3).map((s) => (
                        <Chip key={s} label={s} size="small" variant="outlined" sx={{ fontSize: '0.65rem' }} />
                      ))}
                      {(g.access_sections || []).length > 3 && (
                        <Chip
                          label={`+${g.access_sections.length - 3}`}
                          size="small"
                          variant="outlined"
                          sx={{ fontSize: '0.65rem' }}
                        />
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption">{formatDate(g.created_at)}</Typography>
                  </TableCell>
                  <TableCell>
                    <Tooltip title="Revoke access">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleRevoke(g)}
                        disabled={revoking === g.id}
                      >
                        {revoking === g.id ? <CircularProgress size={16} /> : <LinkOffIcon fontSize="small" />}
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Revoked Grants */}
      {revokedGrants.length > 0 && (
        <>
          <Typography variant="subtitle2" sx={{ color: '#999', mb: 1 }}>
            Revoked Grants ({revokedGrants.length})
          </Typography>
          <TableContainer component={Paper} sx={{ mb: 4, opacity: 0.7 }}>
            <Table size="small">
              <TableBody>
                {revokedGrants.map((g) => (
                  <TableRow key={g.id}>
                    <TableCell>
                      <Typography variant="body2">{g.owner_name || g.owner_email}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{g.authorized_email}</Typography>
                    </TableCell>
                    <TableCell>
                      <Chip label="Revoked" size="small" color="error" variant="outlined" />
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption">{formatDate(g.created_at)}</Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}

      <Divider sx={{ my: 3 }} />

      {/* Access Audit Log */}
      <Typography variant="h6" sx={{ color: '#1e3a5f', fontWeight: 600, mb: 2 }}>
        Access Audit Log (last 100)
      </Typography>

      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: '#f5f5f5' }}>
              <TableCell sx={{ fontWeight: 600 }}>Time</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Folio Owner</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Accessor</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Section</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {logs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                  <Typography color="text.secondary">No access log entries</Typography>
                </TableCell>
              </TableRow>
            ) : (
              logs.map((log) => (
                <TableRow key={log.id} hover>
                  <TableCell>
                    <Typography variant="caption">{formatDate(log.created_at)}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{log.owner_name || log.owner_email || '—'}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{log.accessor_email}</Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={log.access_type}
                      size="small"
                      variant="outlined"
                      color={log.access_type === 'query' ? 'info' : 'default'}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{log.section_accessed || '—'}</Typography>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
