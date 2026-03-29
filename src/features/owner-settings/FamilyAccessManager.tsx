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
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import LinkIcon from '@mui/icons-material/Link';
import FamilyAccessHelpModal from '../../../components/FamilyAccessHelpModal';
import FolioModal, {
  folioTextFieldSx,
  FolioCancelButton,
  FolioSaveButton,
  FolioDeleteButton,
  FolioFieldFade,
  useFolioFieldAnimation,
} from '../../../components/FolioModal';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../lib/ElectronAuthContext';
import { useFormContext } from '../../../lib/FormContext';
import { REPORTS } from '../../../components/ReportsSection';
import { SavedReportConfig } from '../../../lib/savedReportService';

// Helper to delete storage files — uses local filesystem in Electron
async function deleteStorageFile(filePath: string, bucket: string): Promise<void> {
  await supabase.storage.from(bucket).remove([filePath]);
}

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
  allowed_reports: string[];
  allowed_custom_reports: string[];
  vault_instructions: string;
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
  storage_bucket: string;
  source_vault_document_id: string | null;
  file_size: number | null;
  mime_type: string | null;
  description: string;
  visible_to: string[];
  uploaded_at: string;
}

interface VaultDocument {
  id: string;
  document_name: string;
  description: string | null;
  category: string;
  file_name: string;
  file_path: string;
  file_size: number;
  file_type: string;
  sensitivity: string;
  created_at: string;
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
  const [helpOpen, setHelpOpen] = useState(false);
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
  const [formReports, setFormReports] = useState<string[]>([]);
  const [formCustomReports, setFormCustomReports] = useState<string[]>([]);
  const [formVaultInstructions, setFormVaultInstructions] = useState('');
  const [savedCustomReports, setSavedCustomReports] = useState<SavedReportConfig[]>([]);
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

  // Inline quick-add person from document dialog
  const [quickAddName, setQuickAddName] = useState('');
  const [quickAddEmail, setQuickAddEmail] = useState('');
  const [quickAddSaving, setQuickAddSaving] = useState(false);
  const [quickAddError, setQuickAddError] = useState('');

  // Share from Vault dialog state
  const [vaultDialogOpen, setVaultDialogOpen] = useState(false);
  const [vaultDocs, setVaultDocs] = useState<VaultDocument[]>([]);
  const [vaultLoading, setVaultLoading] = useState(false);
  const [selectedVaultDocs, setSelectedVaultDocs] = useState<string[]>([]);
  const [vaultVisibleTo, setVaultVisibleTo] = useState<string[]>([]);
  const [vaultSaving, setVaultSaving] = useState(false);
  const [vaultError, setVaultError] = useState('');

  const fetchData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [usersRes, logsRes, docsRes, customReportsRes] = await Promise.all([
        supabase.from('folio_authorized_users').select('*').eq('owner_id', user.id).order('created_at', { ascending: false }),
        supabase.from('folio_access_log').select('*').eq('owner_id', user.id).order('created_at', { ascending: false }).limit(100),
        supabase.from('folio_documents').select('*').eq('owner_id', user.id).order('uploaded_at', { ascending: false }),
        supabase.from('saved_report_configs').select('*').eq('user_id', user.id).order('name'),
      ]);
      if (usersRes.data) setUsers(usersRes.data);
      if (logsRes.data) setLogs(logsRes.data);
      if (docsRes.data) setDocuments(docsRes.data);
      if (customReportsRes.data) setSavedCustomReports(customReportsRes.data);
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
    setFormReports([]);
    setFormCustomReports([]);
    setFormVaultInstructions('');
    setError('');
    setDialogOpen(true);
  };

  // ---- User management ----
  const openAddDialog = () => {
    setEditUser(null);
    setFormName('');
    setFormEmail('');
    setFormSections([]);
    setFormReports([]);
    setFormCustomReports([]);
    setFormVaultInstructions('');
    setError('');
    setDialogOpen(true);
  };

  const openEditDialog = (u: AuthorizedUser) => {
    setEditUser(u);
    setFormName(u.display_name);
    setFormEmail(u.authorized_email);
    setFormSections(u.access_sections);
    setFormReports(u.allowed_reports || []);
    setFormCustomReports(u.allowed_custom_reports || []);
    setFormVaultInstructions(u.vault_instructions || '');
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
            allowed_reports: formReports,
            allowed_custom_reports: formCustomReports,
            vault_instructions: formVaultInstructions.trim(),
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
            allowed_reports: formReports,
            allowed_custom_reports: formCustomReports,
            vault_instructions: formVaultInstructions.trim(),
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

  const toggleReport = (reportId: string) => {
    setFormReports((prev) =>
      prev.includes(reportId) ? prev.filter((r) => r !== reportId) : [...prev, reportId]
    );
  };

  const toggleCustomReport = (configId: string) => {
    setFormCustomReports((prev) =>
      prev.includes(configId) ? prev.filter((r) => r !== configId) : [...prev, configId]
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
    setQuickAddName('');
    setQuickAddEmail('');
    setQuickAddError('');
    setDocDialogOpen(true);
  };

  const openDocEditDialog = (doc: FolioDocument) => {
    setEditDoc(doc);
    setDocDescription(doc.description);
    setDocVisibleTo(doc.visible_to);
    setDocFile(null);
    setDocError('');
    setQuickAddName('');
    setQuickAddEmail('');
    setQuickAddError('');
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
          await deleteStorageFile(editDoc.storage_path, 'folio-documents');
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
    const isVaultShared = !!doc.source_vault_document_id;
    const message = isVaultShared
      ? `Stop sharing "${doc.description || doc.file_name}" with family members? (The original vault document will not be deleted.)`
      : `Delete "${doc.description || doc.file_name}"?`;
    if (!window.confirm(message)) return;
    // Only delete the storage file if it was directly uploaded (not shared from vault)
    if (!isVaultShared) {
      await deleteStorageFile(doc.storage_path, 'folio-documents');
    }
    await supabase.from('folio_documents').delete().eq('id', doc.id);
    fetchData();
  };

  const handleDownloadDoc = async (doc: FolioDocument) => {
    const bucket = doc.storage_bucket || 'folio-documents';
    // Electron: get local file URL
    const result = await supabase.storage.from(bucket).createSignedUrl(doc.storage_path, 3600);
    if (result.error) {
      console.error('Download error:', result.error);
      return;
    }
    const url = (result.data as { signedUrl: string })?.signedUrl;
    if (url) {
      window.open(url, '_blank');
    }
  };

  // ── Share from Vault ──────────────────────────────────────────────────────
  const openVaultDialog = async () => {
    setVaultError('');
    setSelectedVaultDocs([]);
    setVaultVisibleTo([]);
    setVaultDialogOpen(true);
    setVaultLoading(true);
    try {
      const { data, error: vaultErr } = await supabase
        .from('vault_documents')
        .select('id, document_name, description, category, file_name, file_path, file_size, file_type, sensitivity, created_at')
        .eq('user_id', user!.id)
        .order('category')
        .order('document_name');
      if (vaultErr) throw vaultErr;
      // Filter out vault docs already shared
      const alreadySharedIds = new Set(documents.filter(d => d.source_vault_document_id).map(d => d.source_vault_document_id));
      setVaultDocs((data || []).filter(d => !alreadySharedIds.has(d.id)));
    } catch (err) {
      console.error('Failed to load vault documents:', err);
      setVaultError('Failed to load vault documents.');
    } finally {
      setVaultLoading(false);
    }
  };

  const handleVaultShare = async () => {
    if (selectedVaultDocs.length === 0) {
      setVaultError('Select at least one document to share.');
      return;
    }
    if (vaultVisibleTo.length === 0) {
      setVaultError('Select at least one family member who can view these documents.');
      return;
    }
    setVaultSaving(true);
    setVaultError('');
    try {
      const rows = selectedVaultDocs.map(vaultId => {
        const vDoc = vaultDocs.find(d => d.id === vaultId)!;
        return {
          owner_id: user!.id,
          file_name: vDoc.file_name,
          storage_path: vDoc.file_path,
          file_size: vDoc.file_size,
          mime_type: vDoc.file_type,
          description: vDoc.document_name,
          visible_to: vaultVisibleTo,
          storage_bucket: 'vault-documents',
          source_vault_document_id: vDoc.id,
        };
      });
      const { error: insertErr } = await supabase.from('folio_documents').insert(rows);
      if (insertErr) throw insertErr;
      setVaultDialogOpen(false);
      fetchData();
    } catch (err: unknown) {
      console.error('Share from vault error:', err);
      const msg = err instanceof Error ? err.message : 'Failed to share documents.';
      if (msg.includes('duplicate') || msg.includes('unique')) {
        setVaultError('One or more documents are already shared.');
      } else {
        setVaultError(msg);
      }
    } finally {
      setVaultSaving(false);
    }
  };

  const handleQuickAddPerson = async () => {
    if (!quickAddName.trim() || !quickAddEmail.trim()) {
      setQuickAddError('Name and email are required.');
      return;
    }
    const emailLower = quickAddEmail.trim().toLowerCase();
    if (users.some((u) => u.authorized_email.toLowerCase() === emailLower)) {
      setQuickAddError('This email is already an authorized user.');
      return;
    }
    setQuickAddSaving(true);
    setQuickAddError('');
    try {
      const { data: newUser, error: insertError } = await supabase
        .from('folio_authorized_users')
        .insert({
          owner_id: user!.id,
          display_name: quickAddName.trim(),
          authorized_email: emailLower,
          access_sections: ['personal'],
          allowed_reports: [],
          allowed_custom_reports: [],
          vault_instructions: '',
        })
        .select()
        .single();
      if (insertError) {
        if (insertError.message.includes('duplicate') || insertError.message.includes('unique')) {
          setQuickAddError('This email is already authorized.');
        } else {
          throw insertError;
        }
        return;
      }
      // Add the new user to local state and auto-check them for this document
      if (newUser) {
        setUsers((prev) => [newUser as AuthorizedUser, ...prev]);
        setDocVisibleTo((prev) => [...prev, (newUser as AuthorizedUser).id]);
      }
      setQuickAddName('');
      setQuickAddEmail('');
    } catch (err) {
      console.error('Quick add error:', err);
      setQuickAddError('Failed to add. Please try again.');
    } finally {
      setQuickAddSaving(false);
    }
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
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Typography variant="h5" sx={{ color: '#1a237e', fontWeight: 600 }}>
            Family Access
          </Typography>
          <IconButton
            onClick={() => setHelpOpen(true)}
            size="small"
            sx={{
              bgcolor: '#1a1a1a',
              color: '#c9a227',
              width: 28,
              height: 28,
              '&:hover': { bgcolor: '#333' },
            }}
            title="Audio guide"
          >
            <VolumeUpIcon sx={{ fontSize: 20 }} />
          </IconButton>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          {tab === 2 && (
            <>
              <Button
                variant="outlined"
                startIcon={<LinkIcon />}
                onClick={openVaultDialog}
                sx={{ borderColor: '#1a237e', color: '#1a237e' }}
              >
                Share from Vault
              </Button>
              <Button
                variant="contained"
                startIcon={<UploadFileIcon />}
                onClick={openDocUploadDialog}
                sx={{ bgcolor: '#1a237e', '&:hover': { bgcolor: '#000051' } }}
              >
                Upload Document
              </Button>
            </>
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
        Grant family members limited access to view your folio data via a secure portal. They will receive a 6-digit sign-in code via email to authenticate.
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
              <TableCell sx={{ fontWeight: 600 }}>Reports</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Active</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} sx={{ textAlign: 'center', py: 3, color: 'text.secondary' }}>
                  No family members added yet.
                </TableCell>
              </TableRow>
            )}
            {users.map((u) => (
              <TableRow key={u.id} sx={{ opacity: u.is_active ? 1 : 0.5 }}>
                <TableCell>
                  {u.display_name}
                  {u.vault_instructions && (
                    <Tooltip title={`Vault note: ${u.vault_instructions}`}>
                      <VpnKeyIcon sx={{ fontSize: 14, ml: 0.5, color: '#c9a227', verticalAlign: 'middle' }} />
                    </Tooltip>
                  )}
                </TableCell>
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
                  <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                    {(u.allowed_reports || []).length === 0 && (u.allowed_custom_reports || []).length === 0 ? (
                      <Typography variant="caption" color="text.secondary">None</Typography>
                    ) : (
                      <>
                        {(u.allowed_reports || []).map((rId) => {
                          const rDef = REPORTS.find((r) => r.id === rId);
                          return <Chip key={rId} label={rDef?.label || rId} size="small" variant="outlined" />;
                        })}
                        {(u.allowed_custom_reports || []).map((cId) => {
                          const cDef = savedCustomReports.find((r) => r.id === cId);
                          return <Chip key={cId} label={cDef?.name || 'Custom Report'} size="small" variant="outlined" color="info" />;
                        })}
                      </>
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
                    No documents shared yet. Upload a new document or share one from your vault.
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
                    {doc.source_vault_document_id && (
                      <Chip label="Vault" size="small" variant="outlined" sx={{ ml: 1, fontSize: '0.7rem', height: 20, color: '#6d4c41', borderColor: '#d7ccc8' }} />
                    )}
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

          <FolioFieldFade visible={fieldsVisible} index={3}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                Allowed Reports
              </Typography>
              <Button
                size="small"
                onClick={() => setFormReports(REPORTS.map((r) => r.id))}
                sx={{ textTransform: 'none', fontWeight: 500, color: '#8b6914' }}
              >
                Select All
              </Button>
            </Box>
            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 1 }}>
              Choose which reports this family member can view in the Family Portal.
            </Typography>
            <FormGroup>
              {REPORTS.map((report) => (
                <FormControlLabel
                  key={report.id}
                  control={
                    <Checkbox
                      checked={formReports.includes(report.id)}
                      onChange={() => toggleReport(report.id)}
                      sx={{ '&.Mui-checked': { color: '#8b6914' } }}
                    />
                  }
                  label={report.label}
                />
              ))}
            </FormGroup>
            <Button
              size="small"
              onClick={() => setFormReports([])}
              sx={{ textTransform: 'none', fontWeight: 500, color: '#6b5c47', mt: 0.5 }}
            >
              Clear All
            </Button>
          </FolioFieldFade>

          {savedCustomReports.length > 0 && (
            <FolioFieldFade visible={fieldsVisible} index={4}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  Custom Reports
                </Typography>
                <Button
                  size="small"
                  onClick={() => setFormCustomReports(savedCustomReports.map((r) => r.id))}
                  sx={{ textTransform: 'none', fontWeight: 500, color: '#8b6914' }}
                >
                  Select All
                </Button>
              </Box>
              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 1 }}>
                Share your custom reports with this family member. These are reports you built in the Custom Report Builder.
              </Typography>
              <FormGroup>
                {savedCustomReports.map((report) => (
                  <FormControlLabel
                    key={report.id}
                    control={
                      <Checkbox
                        checked={formCustomReports.includes(report.id)}
                        onChange={() => toggleCustomReport(report.id)}
                        sx={{ '&.Mui-checked': { color: '#8b6914' } }}
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="body2" component="span">{report.name}</Typography>
                        {report.description && (
                          <Typography variant="caption" sx={{ color: 'text.secondary', ml: 1 }}>
                            — {report.description}
                          </Typography>
                        )}
                      </Box>
                    }
                  />
                ))}
              </FormGroup>
              <Button
                size="small"
                onClick={() => setFormCustomReports([])}
                sx={{ textTransform: 'none', fontWeight: 500, color: '#6b5c47', mt: 0.5 }}
              >
                Clear All
              </Button>
            </FolioFieldFade>
          )}

          <FolioFieldFade visible={fieldsVisible} index={savedCustomReports.length > 0 ? 5 : 4}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
              Vault Access Instructions
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 1 }}>
              Leave a note for this family member about how to access your credential vault (e.g., where the recovery key is stored). This note will be visible to them in the Family Portal.
            </Typography>
            <TextField
              fullWidth
              multiline
              minRows={2}
              maxRows={4}
              label="Vault Instructions"
              placeholder='e.g., "The vault recovery key is in the safe deposit box at First National Bank, Box #247"'
              value={formVaultInstructions}
              onChange={(e) => setFormVaultInstructions(e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{ ...folioTextFieldSx }}
            />
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
              {users.filter((u) => u.is_active).length > 0 && (
                <Button
                  size="small"
                  onClick={() => setDocVisibleTo(users.filter((u) => u.is_active).map((u) => u.id))}
                  sx={{ textTransform: 'none', fontWeight: 500, color: '#8b6914' }}
                >
                  Select All
                </Button>
              )}
            </Box>
            {users.filter((u) => u.is_active).length > 0 && (
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

            {/* Inline quick-add person */}
            <Box sx={{ mt: 1.5, p: 2, bgcolor: '#f5f5f0', borderRadius: 1, border: '1px solid #e0ddd5' }}>
              <Typography variant="caption" sx={{ fontWeight: 600, color: '#1a237e', display: 'block', mb: 1 }}>
                Add a Person
              </Typography>
              {quickAddError && <Alert severity="error" sx={{ mb: 1, py: 0 }}>{quickAddError}</Alert>}
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'flex-start' }}>
                <TextField
                  size="small"
                  label="Name"
                  placeholder='e.g., "John Smith (Banker)"'
                  value={quickAddName}
                  onChange={(e) => setQuickAddName(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  sx={{ ...folioTextFieldSx, flex: 1, minWidth: 140 }}
                />
                <TextField
                  size="small"
                  label="Email"
                  type="email"
                  placeholder="john@example.com"
                  value={quickAddEmail}
                  onChange={(e) => setQuickAddEmail(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  sx={{ ...folioTextFieldSx, flex: 1, minWidth: 180 }}
                />
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<AddIcon />}
                  onClick={handleQuickAddPerson}
                  disabled={quickAddSaving || !quickAddName.trim() || !quickAddEmail.trim()}
                  sx={{
                    borderColor: '#8b6914',
                    color: '#8b6914',
                    mt: '2px',
                    '&:hover': { borderColor: '#6b5c47', bgcolor: '#f9f6f0' },
                  }}
                >
                  {quickAddSaving ? 'Adding...' : 'Add'}
                </Button>
              </Box>
              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.75 }}>
                This person will be added as an authorized user with basic access. You can edit their permissions later.
              </Typography>
            </Box>

            {users.filter((u) => u.is_active).length > 0 && (
              <Button
                size="small"
                onClick={() => setDocVisibleTo([])}
                sx={{ textTransform: 'none', fontWeight: 500, color: '#6b5c47', mt: 0.5 }}
              >
                Clear All
              </Button>
            )}
          </FolioFieldFade>
        </Box>
      </FolioModal>

      <FamilyAccessHelpModal open={helpOpen} onClose={() => setHelpOpen(false)} />

      {/* Share from Vault Dialog */}
      <FolioModal
        open={vaultDialogOpen}
        onClose={() => setVaultDialogOpen(false)}
        title="Share from Vault"
        eyebrow="My Life Folio — Family Access"
        footer={
          <>
            <Box />
            <Box sx={{ display: 'flex', gap: 1.5 }}>
              <FolioCancelButton onClick={() => setVaultDialogOpen(false)} />
              <FolioSaveButton
                onClick={handleVaultShare}
                disabled={vaultSaving || selectedVaultDocs.length === 0 || vaultVisibleTo.length === 0}
              >
                {vaultSaving ? 'Sharing...' : `Share ${selectedVaultDocs.length || ''} Document${selectedVaultDocs.length !== 1 ? 's' : ''}`}
              </FolioSaveButton>
            </Box>
          </>
        }
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          {vaultError && <Alert severity="error">{vaultError}</Alert>}

          {vaultLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
              <CircularProgress />
            </Box>
          ) : vaultDocs.length === 0 ? (
            <Alert severity="info">
              No vault documents available to share. All documents have either already been shared, or you haven't uploaded any to the vault yet.
            </Alert>
          ) : (
            <>
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                Select documents to share
              </Typography>
              <Box sx={{ maxHeight: 300, overflowY: 'auto', border: '1px solid #e0e0e0', borderRadius: 1 }}>
                {vaultDocs.map((vDoc) => (
                  <Box
                    key={vDoc.id}
                    sx={{
                      display: 'flex', alignItems: 'center', px: 2, py: 1,
                      borderBottom: '1px solid #f0f0f0',
                      bgcolor: selectedVaultDocs.includes(vDoc.id) ? '#e8eaf6' : 'transparent',
                      '&:hover': { bgcolor: selectedVaultDocs.includes(vDoc.id) ? '#e8eaf6' : '#fafafa' },
                      cursor: 'pointer',
                    }}
                    onClick={() => setSelectedVaultDocs(prev =>
                      prev.includes(vDoc.id) ? prev.filter(id => id !== vDoc.id) : [...prev, vDoc.id]
                    )}
                  >
                    <Checkbox
                      checked={selectedVaultDocs.includes(vDoc.id)}
                      size="small"
                      sx={{ mr: 1, color: '#1a237e', '&.Mui-checked': { color: '#1a237e' } }}
                    />
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {vDoc.document_name}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        {vDoc.category} &middot; {vDoc.file_name} &middot; {formatFileSize(vDoc.file_size)}
                      </Typography>
                    </Box>
                    {vDoc.sensitivity === 'highly_sensitive' && (
                      <Chip label="Sensitive" size="small" color="warning" variant="outlined" sx={{ ml: 1, fontSize: '0.65rem', height: 18 }} />
                    )}
                  </Box>
                ))}
              </Box>
            </>
          )}

          {vaultDocs.length > 0 && (
            <>
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                Who can view these documents?
              </Typography>
              <FormGroup>
                {users.filter(u => u.is_active).map((u) => (
                  <FormControlLabel
                    key={u.id}
                    control={
                      <Checkbox
                        checked={vaultVisibleTo.includes(u.id)}
                        onChange={() => setVaultVisibleTo(prev =>
                          prev.includes(u.id) ? prev.filter(id => id !== u.id) : [...prev, u.id]
                        )}
                        size="small"
                        sx={{ color: '#1a237e', '&.Mui-checked': { color: '#1a237e' } }}
                      />
                    }
                    label={`${u.display_name} (${u.authorized_email})`}
                  />
                ))}
              </FormGroup>
            </>
          )}
        </Box>
      </FolioModal>
    </Paper>
  );
};

export default FamilyAccessManager;
