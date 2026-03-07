import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Button, TextField, Paper, Table, TableBody, TableCell, TableHead, TableRow,
  IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Chip, Switch,
  FormControlLabel, FormGroup, Checkbox, Alert, CircularProgress, Tabs, Tab, Tooltip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import HistoryIcon from '@mui/icons-material/History';
import PeopleIcon from '@mui/icons-material/People';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../lib/AuthContext';

const ALL_SECTIONS = [
  { key: 'personal', label: 'Personal Info' },
  { key: 'medical', label: 'Medical' },
  { key: 'financial', label: 'Financial' },
  { key: 'legal', label: 'Legal' },
  { key: 'advisors', label: 'Advisors' },
  { key: 'end_of_life', label: 'End of Life' },
  { key: 'insurance', label: 'Insurance' },
  { key: 'family', label: 'Family' },
  { key: 'full_sensitive', label: 'Full Sensitive Data (unmasked SSNs, account #s)' },
];

interface AuthorizedUser {
  id: string;
  owner_id: string;
  authorized_email: string;
  display_name: string;
  access_sections: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface AccessLogEntry {
  id: string;
  accessor_email: string;
  accessor_name: string;
  access_type: string;
  query_text: string | null;
  report_name: string | null;
  sections_queried: string[];
  created_at: string;
}

const FamilyAccessManager: React.FC = () => {
  const { user } = useAuth();
  const [tab, setTab] = useState(0);
  const [users, setUsers] = useState<AuthorizedUser[]>([]);
  const [logs, setLogs] = useState<AccessLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editUser, setEditUser] = useState<AuthorizedUser | null>(null);
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formSections, setFormSections] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const fetchData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [usersRes, logsRes] = await Promise.all([
        supabase.from('folio_authorized_users').select('*').eq('owner_id', user.id).order('created_at', { ascending: false }),
        supabase.from('folio_access_log').select('*').eq('owner_id', user.id).order('created_at', { ascending: false }).limit(100),
      ]);
      if (usersRes.data) setUsers(usersRes.data);
      if (logsRes.data) setLogs(logsRes.data);
    } catch (err) {
      console.error('Failed to fetch family access data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [user]);

  const openAddDialog = () => {
    setEditUser(null);
    setFormName('');
    setFormEmail('');
    setFormSections([]);
    setError('');
    setDialogOpen(true);
  };

  const openEditDialog = (u: AuthorizedUser) => {
    setEditUser(u);
    setFormName(u.display_name);
    setFormEmail(u.authorized_email);
    setFormSections(u.access_sections);
    setError('');
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formName.trim() || !formEmail.trim()) {
      setError('Name and email are required.');
      return;
    }
    if (formSections.length === 0) {
      setError('Select at least one section to grant access to.');
      return;
    }
    setSaving(true);
    setError('');

    try {
      if (editUser) {
        const { error: updateError } = await supabase
          .from('folio_authorized_users')
          .update({
            display_name: formName.trim(),
            authorized_email: formEmail.trim().toLowerCase(),
            access_sections: formSections,
          })
          .eq('id', editUser.id);
        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase
          .from('folio_authorized_users')
          .insert({
            owner_id: user!.id,
            display_name: formName.trim(),
            authorized_email: formEmail.trim().toLowerCase(),
            access_sections: formSections,
          });
        if (insertError) {
          if (insertError.message.includes('duplicate') || insertError.message.includes('unique')) {
            setError('This email is already authorized.');
            setSaving(false);
            return;
          }
          throw insertError;
        }
      }
      setDialogOpen(false);
      fetchData();
    } catch (err) {
      console.error('Save error:', err);
      setError('Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (u: AuthorizedUser) => {
    await supabase
      .from('folio_authorized_users')
      .update({ is_active: !u.is_active })
      .eq('id', u.id);
    fetchData();
  };

  const handleDelete = async (u: AuthorizedUser) => {
    if (!window.confirm(`Remove ${u.display_name} (${u.authorized_email})?`)) return;
    await supabase.from('folio_authorized_users').delete().eq('id', u.id);
    fetchData();
  };

  const toggleSection = (section: string) => {
    setFormSections((prev) =>
      prev.includes(section) ? prev.filter((s) => s !== section) : [...prev, section]
    );
  };

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress /></Box>;
  }

  return (
    <Paper sx={{ p: 3, borderRadius: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5" sx={{ color: '#1a237e', fontWeight: 600 }}>
          Family Access
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={openAddDialog}
          sx={{ bgcolor: '#1a237e', '&:hover': { bgcolor: '#000051' } }}
        >
          Add Family Member
        </Button>
      </Box>

      <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
        Grant family members limited access to view your folio data via a secure portal. They will receive a magic link via email to authenticate.
      </Typography>

      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v)}
        sx={{
          mb: 2, borderBottom: '1px solid #e0e0e0',
          '& .Mui-selected': { color: '#1a237e' },
          '& .MuiTabs-indicator': { backgroundColor: '#1a237e' },
        }}
      >
        <Tab icon={<PeopleIcon />} label="Authorized Users" iconPosition="start" />
        <Tab icon={<HistoryIcon />} label="Access Log" iconPosition="start" />
      </Tabs>

      {/* Authorized Users Tab */}
      {tab === 0 && (
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Sections</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Active</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} sx={{ textAlign: 'center', py: 3, color: 'text.secondary' }}>
                  No family members added yet.
                </TableCell>
              </TableRow>
            )}
            {users.map((u) => (
              <TableRow key={u.id} sx={{ opacity: u.is_active ? 1 : 0.5 }}>
                <TableCell>{u.display_name}</TableCell>
                <TableCell>{u.authorized_email}</TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                    {u.access_sections.filter((s) => s !== 'full_sensitive').map((s) => (
                      <Chip key={s} label={s} size="small" variant="outlined" />
                    ))}
                    {u.access_sections.includes('full_sensitive') && (
                      <Chip label="full sensitive" size="small" color="warning" />
                    )}
                  </Box>
                </TableCell>
                <TableCell>
                  <Switch
                    checked={u.is_active}
                    onChange={() => handleToggleActive(u)}
                    size="small"
                    sx={{ '& .Mui-checked': { color: '#1a237e' } }}
                  />
                </TableCell>
                <TableCell>
                  <Tooltip title="Edit">
                    <IconButton size="small" onClick={() => openEditDialog(u)}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Remove">
                    <IconButton size="small" onClick={() => handleDelete(u)} color="error">
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {/* Access Log Tab */}
      {tab === 1 && (
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Details</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Sections</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {logs.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} sx={{ textAlign: 'center', py: 3, color: 'text.secondary' }}>
                  No access activity yet.
                </TableCell>
              </TableRow>
            )}
            {logs.map((log) => (
              <TableRow key={log.id}>
                <TableCell>{new Date(log.created_at).toLocaleString()}</TableCell>
                <TableCell>{log.accessor_name} ({log.accessor_email})</TableCell>
                <TableCell>
                  <Chip
                    label={log.access_type}
                    size="small"
                    color={log.access_type === 'chat' ? 'primary' : 'secondary'}
                  />
                </TableCell>
                <TableCell sx={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {log.access_type === 'chat' ? log.query_text : log.report_name}
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                    {log.sections_queried.map((s) => (
                      <Chip key={s} label={s} size="small" variant="outlined" sx={{ fontSize: '0.7rem' }} />
                    ))}
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ color: '#1a237e' }}>
          {editUser ? 'Edit Authorized User' : 'Add Family Member'}
        </DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <TextField
            fullWidth
            label="Display Name"
            placeholder='e.g., "Sarah (daughter)"'
            value={formName}
            onChange={(e) => setFormName(e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{ mb: 2, mt: 1 }}
          />
          <TextField
            fullWidth
            label="Email Address"
            type="email"
            value={formEmail}
            onChange={(e) => setFormEmail(e.target.value)}
            InputLabelProps={{ shrink: true }}
            disabled={!!editUser}
            sx={{ mb: 2 }}
          />

          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
            Access Sections
          </Typography>
          <FormGroup>
            {ALL_SECTIONS.map((section) => (
              <FormControlLabel
                key={section.key}
                control={
                  <Checkbox
                    checked={formSections.includes(section.key)}
                    onChange={() => toggleSection(section.key)}
                    sx={{ '&.Mui-checked': { color: '#1a237e' } }}
                  />
                }
                label={section.label}
              />
            ))}
          </FormGroup>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleSave}
            variant="contained"
            disabled={saving}
            sx={{ bgcolor: '#1a237e', '&:hover': { bgcolor: '#000051' } }}
          >
            {saving ? <CircularProgress size={20} /> : (editUser ? 'Save Changes' : 'Add User')}
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default FamilyAccessManager;
