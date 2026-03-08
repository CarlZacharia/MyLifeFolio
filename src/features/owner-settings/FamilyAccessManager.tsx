import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Box, Typography, Button, TextField, Paper, Table, TableBody, TableCell, TableHead, TableRow,
  IconButton, Chip, Switch,
  FormControlLabel, FormGroup, Checkbox, Alert, CircularProgress, Tabs, Tab, Tooltip,
  LinearProgress,
} from '@mui/material';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import HistoryIcon from '@mui/icons-material/History';
import PeopleIcon from '@mui/icons-material/People';
import FolderIcon from '@mui/icons-material/Folder';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import DownloadIcon from '@mui/icons-material/Download';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import ImageIcon from '@mui/icons-material/Image';
import TableChartIcon from '@mui/icons-material/TableChart';
import DescriptionIcon from '@mui/icons-material/Description';
import FolioModal, {
  folioTextFieldSx,
  FolioCancelButton,
  FolioSaveButton,
  FolioDeleteButton,
  FolioFieldFade,
  useFolioFieldAnimation,
} from '../../../components/FolioModal';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../lib/AuthContext';
import { useFormContext } from '../../../lib/FormContext';

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

const ACCEPTED_FILE_TYPES = [
  'application/pdf',
  'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/tiff',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-excel',
  'text/csv',
  'text/plain',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword',
].join(',');

const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25 MB

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

interface FolioDocument {
  id: string;
  owner_id: string;
  file_name: string;
  storage_path: string;
  file_size: number | null;
  mime_type: string | null;
  description: string;
  visible_to: string[];
  uploaded_at: string;
}

function getFileIcon(mimeType: string | null) {
  if (!mimeType) return <InsertDriveFileIcon />;
  if (mimeType === 'application/pdf') return <PictureAsPdfIcon />;
  if (mimeType.startsWith('image/')) return <ImageIcon />;
  if (mimeType.includes('spreadsheet') || mimeType.includes('excel') || mimeType === 'text/csv') return <TableChartIcon />;
  if (mimeType === 'text/plain') return <DescriptionIcon />;
  if (mimeType.includes('word')) return <DescriptionIcon />;
  return <InsertDriveFileIcon />;
}

function formatFileSize(bytes: number | null): string {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const FamilyAccessManager: React.FC = () => {
  const { user } = useAuth();
  const { formData } = useFormContext();
  const [tab, setTab] = useState(0);
  const [users, setUsers] = useState<AuthorizedUser[]>([]);
  const [logs, setLogs] = useState<AccessLogEntry[]>([]);
  const [documents, setDocuments] = useState<FolioDocument[]>([]);
  const [loading, setLoading] = useState(true);

  // User dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editUser, setEditUser] = useState<AuthorizedUser | null>(null);
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formSections, setFormSections] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const fieldsVisible = useFolioFieldAnimation(dialogOpen);

  // Document dialog state
  const [docDialogOpen, setDocDialogOpen] = useState(false);
  const [editDoc, setEditDoc] = useState<FolioDocument | null>(null);
  const [docDescription, setDocDescription] = useState('');
  const [docVisibleTo, setDocVisibleTo] = useState<string[]>([]);
  const [docFile, setDocFile] = useState<File | null>(null);
  const [docError, setDocError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const docFieldsVisible = useFolioFieldAnimation(docDialogOpen);

  const fetchData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [usersRes, logsRes, docsRes] = await Promise.all([
        supabase.from('folio_authorized_users').select('*').eq('owner_id', user.id).order('created_at', { ascending: false }),
        supabase.from('folio_access_log').select('*').eq('owner_id', user.id).order('created_at', { ascending: false }).limit(100),
        supabase.from('folio_documents').select('*').eq('owner_id', user.id).order('uploaded_at', { ascending: false }),
      ]);
      if (usersRes.data) setUsers(usersRes.data);
      if (logsRes.data) setLogs(logsRes.data);
      if (docsRes.data) setDocuments(docsRes.data);
    } catch (err) {
      console.error('Failed to fetch family access data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [user]);

  // Compute suggested family members from form data (spouse, children, other family members)
  const suggestedMembers = useMemo(() => {
    const suggestions: { name: string; email: string; relationship: string }[] = [];
    const existingEmails = new Set(users.map((u) => u.authorized_email.toLowerCase()));

    // Spouse
    if (formData.spouseName && formData.spouseEmail) {
      const email = formData.spouseEmail.trim().toLowerCase();
      if (!existingEmails.has(email)) {
        suggestions.push({ name: formData.spouseName, email, relationship: 'Spouse' });
      }
    }

    // Children
    formData.children.forEach((child) => {
      if (child.name && child.email) {
        const email = child.email.trim().toLowerCase();
        if (!existingEmails.has(email)) {
          suggestions.push({ name: child.name, email, relationship: child.relationship || 'Child' });
        }
      }
    });

    // Other family members
    formData.otherBeneficiaries.forEach((member) => {
      if (member.name && member.email) {
        const email = member.email.trim().toLowerCase();
        if (!existingEmails.has(email)) {
          const rel = member.relationship === 'Other' && member.relationshipOther
            ? member.relationshipOther
            : member.relationship || 'Other Family Member';
          suggestions.push({ name: member.name, email, relationship: rel });
        }
      }
    });

    return suggestions;
  }, [formData.spouseName, formData.spouseEmail, formData.children, formData.otherBeneficiaries, users]);

  const handleQuickAdd = (suggestion: { name: string; email: string; relationship: string }) => {
    setEditUser(null);
    setFormName(`${suggestion.name} (${suggestion.relationship})`);
    setFormEmail(suggestion.email);
    setFormSections([]);
    setError('');
    setDialogOpen(true);
  };

  // ---- User management ----
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

  const handleDeleteUser = async (u: AuthorizedUser) => {
    if (!window.confirm(`Remove ${u.display_name} (${u.authorized_email})?`)) return;
    await supabase.from('folio_authorized_users').delete().eq('id', u.id);
    fetchData();
  };

  const toggleSection = (section: string) => {
    setFormSections((prev) =>
      prev.includes(section) ? prev.filter((s) => s !== section) : [...prev, section]
    );
  };

  // ---- Document management ----
  const openDocUploadDialog = () => {
    setEditDoc(null);
    setDocDescription('');
    setDocVisibleTo([]);
    setDocFile(null);
    setDocError('');
    setUploadProgress(0);
    setDocDialogOpen(true);
  };

  const openDocEditDialog = (doc: FolioDocument) => {
    setEditDoc(doc);
    setDocDescription(doc.description);
    setDocVisibleTo(doc.visible_to);
    setDocFile(null);
    setDocError('');
    setDocDialogOpen(true);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_FILE_SIZE) {
      setDocError('File size must be under 25 MB.');
      return;
    }
    setDocFile(file);
    setDocError('');
    if (!docDescription.trim()) {
      setDocDescription(file.name.replace(/\.[^/.]+$/, ''));
    }
  };

  const handleDocSave = async () => {
    if (!editDoc && !docFile) {
      setDocError('Please select a file to upload.');
      return;
    }
    if (!docDescription.trim()) {
      setDocError('Please enter a description.');
      return;
    }
    if (docVisibleTo.length === 0) {
      setDocError('Select at least one family member who can view this document.');
      return;
    }

    setUploading(true);
    setDocError('');
    setUploadProgress(10);

    try {
      if (editDoc && !docFile) {
        // Just updating metadata, no new file
        const { error: updateError } = await supabase
          .from('folio_documents')
          .update({
            description: docDescription.trim(),
            visible_to: docVisibleTo,
          })
          .eq('id', editDoc.id);
        if (updateError) throw updateError;
      } else {
        const file = docFile!;
        const fileExt = file.name.split('.').pop() || 'bin';
        const storagePath = `${user!.id}/${crypto.randomUUID()}.${fileExt}`;

        setUploadProgress(30);

        // Upload file to storage
        const { error: uploadError } = await supabase.storage
          .from('folio-documents')
          .upload(storagePath, file, {
            contentType: file.type,
            upsert: false,
          });

        if (uploadError) throw uploadError;
        setUploadProgress(70);

        if (editDoc) {
          // Replace file: delete old one, update record
          await supabase.storage.from('folio-documents').remove([editDoc.storage_path]);
          const { error: updateError } = await supabase
            .from('folio_documents')
            .update({
              file_name: file.name,
              storage_path: storagePath,
              file_size: file.size,
              mime_type: file.type,
              description: docDescription.trim(),
              visible_to: docVisibleTo,
            })
            .eq('id', editDoc.id);
          if (updateError) throw updateError;
        } else {
          // Insert new document record
          const { error: insertError } = await supabase
            .from('folio_documents')
            .insert({
              owner_id: user!.id,
              file_name: file.name,
              storage_path: storagePath,
              file_size: file.size,
              mime_type: file.type,
              description: docDescription.trim(),
              visible_to: docVisibleTo,
            });
          if (insertError) throw insertError;
        }
      }

      setUploadProgress(100);
      setDocDialogOpen(false);
      fetchData();
    } catch (err) {
      console.error('Document save error:', err);
      setDocError('Failed to save document. Please try again.');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDeleteDoc = async (doc: FolioDocument) => {
    if (!window.confirm(`Delete "${doc.description || doc.file_name}"?`)) return;
    await supabase.storage.from('folio-documents').remove([doc.storage_path]);
    await supabase.from('folio_documents').delete().eq('id', doc.id);
    fetchData();
  };

  const handleDownloadDoc = async (doc: FolioDocument) => {
    const { data, error: dlError } = await supabase.storage
      .from('folio-documents')
      .download(doc.storage_path);
    if (dlError || !data) {
      console.error('Download error:', dlError);
      return;
    }
    const url = URL.createObjectURL(data);
    const a = document.createElement('a');
    a.href = url;
    a.download = doc.file_name;
    a.click();
    URL.revokeObjectURL(url);
  };

  const toggleDocVisibleTo = (userId: string) => {
    setDocVisibleTo((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const getUserName = (userId: string) => {
    const u = users.find((u) => u.id === userId);
    return u ? u.display_name : userId;
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
        <Box sx={{ display: 'flex', gap: 1 }}>
          {tab === 2 && (
            <Button
              variant="contained"
              startIcon={<UploadFileIcon />}
              onClick={openDocUploadDialog}
              sx={{ bgcolor: '#1a237e', '&:hover': { bgcolor: '#000051' } }}
            >
              Upload Document
            </Button>
          )}
          {tab === 0 && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={openAddDialog}
              sx={{ bgcolor: '#1a237e', '&:hover': { bgcolor: '#000051' } }}
            >
              Add Family Member
            </Button>
          )}
        </Box>
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
        <Tab icon={<FolderIcon />} label="Documents" iconPosition="start" />
      </Tabs>

      {/* Authorized Users Tab */}
      {tab === 0 && (
        <>
        {suggestedMembers.length > 0 && (
          <Box sx={{ mb: 2, p: 2, bgcolor: '#f5f5f0', borderRadius: 1, border: '1px solid #e0ddd5' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: '#1a237e' }}>
              Suggested Family Members
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 1.5 }}>
              These family members from your folio have email addresses on file. Click to add them.
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {suggestedMembers.map((s, i) => (
                <Chip
                  key={i}
                  icon={<PersonAddIcon />}
                  label={`${s.name} (${s.relationship})`}
                  onClick={() => handleQuickAdd(s)}
                  variant="outlined"
                  sx={{
                    cursor: 'pointer',
                    borderColor: '#1a237e',
                    color: '#1a237e',
                    '&:hover': { bgcolor: '#e8eaf6' },
                  }}
                />
              ))}
            </Box>
          </Box>
        )}
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
                    <IconButton size="small" onClick={() => handleDeleteUser(u)} color="error">
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        </>
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

      {/* Documents Tab */}
      {tab === 2 && (
        <>
          {users.length === 0 && (
            <Alert severity="info" sx={{ mb: 2 }}>
              Add family members first before uploading documents.
            </Alert>
          )}
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600, width: 40 }}></TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Document</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Description</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Visible To</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Size</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Uploaded</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {documents.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} sx={{ textAlign: 'center', py: 3, color: 'text.secondary' }}>
                    No documents uploaded yet. Click "Upload Document" to get started.
                  </TableCell>
                </TableRow>
              )}
              {documents.map((doc) => (
                <TableRow key={doc.id}>
                  <TableCell sx={{ color: '#1a237e' }}>
                    {getFileIcon(doc.mime_type)}
                  </TableCell>
                  <TableCell sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {doc.file_name}
                  </TableCell>
                  <TableCell sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {doc.description}
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                      {doc.visible_to.map((uid) => (
                        <Chip key={uid} label={getUserName(uid)} size="small" variant="outlined" />
                      ))}
                    </Box>
                  </TableCell>
                  <TableCell>{formatFileSize(doc.file_size)}</TableCell>
                  <TableCell>{new Date(doc.uploaded_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Tooltip title="Download">
                      <IconButton size="small" onClick={() => handleDownloadDoc(doc)} sx={{ color: '#1a237e' }}>
                        <DownloadIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Edit">
                      <IconButton size="small" onClick={() => openDocEditDialog(doc)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton size="small" onClick={() => handleDeleteDoc(doc)} color="error">
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </>
      )}

      {/* Add/Edit User Dialog */}
      <FolioModal
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        title={editUser ? 'Edit Authorized User' : 'Add Family Member'}
        eyebrow="My Life Folio — Family Access"
        footer={
          <>
            <Box>
              {editUser && (
                <FolioDeleteButton onClick={() => { setDialogOpen(false); handleDeleteUser(editUser); }} />
              )}
            </Box>
            <Box sx={{ display: 'flex', gap: 1.5 }}>
              <FolioCancelButton onClick={() => setDialogOpen(false)} />
              <FolioSaveButton onClick={handleSave} disabled={saving || (!formName.trim() || !formEmail.trim() || formSections.length === 0)}>
                {saving ? 'Saving...' : (editUser ? 'Save Changes' : 'Add Member')}
              </FolioSaveButton>
            </Box>
          </>
        }
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          {error && <Alert severity="error">{error}</Alert>}

          <FolioFieldFade visible={fieldsVisible} index={0}>
            <TextField
              fullWidth
              label="Display Name"
              placeholder='e.g., "Sarah (daughter)"'
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{ ...folioTextFieldSx }}
            />
          </FolioFieldFade>

          <FolioFieldFade visible={fieldsVisible} index={1}>
            <TextField
              fullWidth
              label="Email Address"
              type="email"
              value={formEmail}
              onChange={(e) => setFormEmail(e.target.value)}
              InputLabelProps={{ shrink: true }}
              disabled={!!editUser}
              sx={{ ...folioTextFieldSx }}
            />
          </FolioFieldFade>

          <FolioFieldFade visible={fieldsVisible} index={2}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                Access Sections
              </Typography>
              <Button
                size="small"
                onClick={() => setFormSections(ALL_SECTIONS.map((s) => s.key))}
                sx={{ textTransform: 'none', fontWeight: 500, color: '#8b6914' }}
              >
                Select All
              </Button>
            </Box>
            <FormGroup>
              {ALL_SECTIONS.map((section) => (
                <FormControlLabel
                  key={section.key}
                  control={
                    <Checkbox
                      checked={formSections.includes(section.key)}
                      onChange={() => toggleSection(section.key)}
                      sx={{ '&.Mui-checked': { color: '#8b6914' } }}
                    />
                  }
                  label={section.label}
                />
              ))}
            </FormGroup>
            <Button
              size="small"
              onClick={() => setFormSections([])}
              sx={{ textTransform: 'none', fontWeight: 500, color: '#6b5c47', mt: 0.5 }}
            >
              Clear All
            </Button>
          </FolioFieldFade>
        </Box>
      </FolioModal>

      {/* Upload/Edit Document Dialog */}
      <FolioModal
        open={docDialogOpen}
        onClose={() => setDocDialogOpen(false)}
        title={editDoc ? 'Edit Document' : 'Upload Document'}
        eyebrow="My Life Folio — Family Access"
        footer={
          <>
            <Box>
              {editDoc && (
                <FolioDeleteButton onClick={() => { setDocDialogOpen(false); handleDeleteDoc(editDoc); }} />
              )}
            </Box>
            <Box sx={{ display: 'flex', gap: 1.5 }}>
              <FolioCancelButton onClick={() => setDocDialogOpen(false)} />
              <FolioSaveButton
                onClick={handleDocSave}
                disabled={uploading || (!editDoc && !docFile) || !docDescription.trim() || docVisibleTo.length === 0}
              >
                {uploading ? 'Uploading...' : (editDoc ? 'Save Changes' : 'Upload')}
              </FolioSaveButton>
            </Box>
          </>
        }
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          {docError && <Alert severity="error">{docError}</Alert>}
          {uploading && <LinearProgress variant="determinate" value={uploadProgress} />}

          <FolioFieldFade visible={docFieldsVisible} index={0}>
            <Box>
              <input
                ref={fileInputRef}
                type="file"
                accept={ACCEPTED_FILE_TYPES}
                onChange={handleFileSelect}
                style={{ display: 'none' }}
              />
              <Button
                variant="outlined"
                startIcon={<UploadFileIcon />}
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                sx={{
                  width: '100%',
                  py: 2,
                  borderStyle: 'dashed',
                  borderColor: docFile ? '#8b6914' : undefined,
                  color: docFile ? '#8b6914' : undefined,
                }}
              >
                {docFile ? docFile.name : (editDoc ? `Current: ${editDoc.file_name} (click to replace)` : 'Select File')}
              </Button>
              <Typography variant="caption" sx={{ color: 'text.secondary', mt: 0.5, display: 'block' }}>
                PDF, images, Word, Excel, CSV. Max 25 MB.
              </Typography>
            </Box>
          </FolioFieldFade>

          <FolioFieldFade visible={docFieldsVisible} index={1}>
            <TextField
              fullWidth
              label="Description"
              placeholder="e.g., Power of Attorney - Client"
              value={docDescription}
              onChange={(e) => setDocDescription(e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{ ...folioTextFieldSx }}
            />
          </FolioFieldFade>

          <FolioFieldFade visible={docFieldsVisible} index={2}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                Who Can View This Document
              </Typography>
              <Button
                size="small"
                onClick={() => setDocVisibleTo(users.filter((u) => u.is_active).map((u) => u.id))}
                sx={{ textTransform: 'none', fontWeight: 500, color: '#8b6914' }}
              >
                Select All
              </Button>
            </Box>
            {users.filter((u) => u.is_active).length === 0 ? (
              <Alert severity="info">Add family members first before uploading documents.</Alert>
            ) : (
              <FormGroup>
                {users.filter((u) => u.is_active).map((u) => (
                  <FormControlLabel
                    key={u.id}
                    control={
                      <Checkbox
                        checked={docVisibleTo.includes(u.id)}
                        onChange={() => toggleDocVisibleTo(u.id)}
                        sx={{ '&.Mui-checked': { color: '#8b6914' } }}
                      />
                    }
                    label={`${u.display_name} (${u.authorized_email})`}
                  />
                ))}
              </FormGroup>
            )}
            <Button
              size="small"
              onClick={() => setDocVisibleTo([])}
              sx={{ textTransform: 'none', fontWeight: 500, color: '#6b5c47', mt: 0.5 }}
            >
              Clear All
            </Button>
          </FolioFieldFade>
        </Box>
      </FolioModal>
    </Paper>
  );
};

export default FamilyAccessManager;
