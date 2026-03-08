'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Card, CardContent, Chip, IconButton, Button, Badge,
  Paper, Dialog, DialogTitle, DialogContent, DialogActions, Collapse, Fade,
  Alert, Snackbar,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DownloadIcon from '@mui/icons-material/Download';
import DeleteIcon from '@mui/icons-material/Delete';
import LockIcon from '@mui/icons-material/Lock';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import FolderIcon from '@mui/icons-material/Folder';
import { folioColors } from './FolioModal';
import { useFormContext } from '../lib/FormContext';
import { useAuth } from '../lib/AuthContext';
import { supabase } from '../lib/supabase';
import {
  VAULT_CATEGORIES, VaultCategoryDef, SENSITIVITY_LABELS, SensitivityLevel,
} from '../lib/documentVaultCategories';
import {
  VaultDocumentRecord,
  uploadVaultDocument,
  listVaultDocuments,
  getVaultDocumentUrl,
  deleteVaultDocument,
  getVaultDocumentCounts,
} from '../lib/documentVaultStorage';
import DocumentUploadModal, { DocumentUploadData } from './DocumentUploadModal';

// ── Helpers ────────────────────────────────────────────────────────────────

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function isExpired(dateStr: string | null): boolean {
  if (!dateStr) return false;
  return new Date(dateStr) < new Date();
}

function isExpiringSoon(dateStr: string | null): boolean {
  if (!dateStr) return false;
  const expDate = new Date(dateStr);
  const now = new Date();
  const ninetyDays = 90 * 24 * 60 * 60 * 1000;
  return expDate > now && expDate.getTime() - now.getTime() <= ninetyDays;
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '';
  try {
    return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  } catch {
    return dateStr;
  }
}

// ── Category Card ──────────────────────────────────────────────────────────

interface CategoryCardProps {
  category: VaultCategoryDef;
  count: number;
  expanded: boolean;
  onToggle: () => void;
  documents: VaultDocumentRecord[];
  onUpload: () => void;
  onDownload: (doc: VaultDocumentRecord) => void;
  onDelete: (doc: VaultDocumentRecord) => void;
}

const CategoryCard: React.FC<CategoryCardProps> = ({
  category, count, expanded, onToggle, documents, onUpload, onDownload, onDelete,
}) => {
  const Icon = category.icon;
  const maxExamples = 3;
  const shownExamples = category.examples.slice(0, maxExamples);
  const moreCount = category.examples.length - maxExamples;

  return (
    <Card
      variant="outlined"
      sx={{
        borderRadius: '10px',
        transition: 'all 0.2s',
        borderColor: expanded ? category.accentColor : 'rgba(0,0,0,0.12)',
        boxShadow: expanded ? `0 4px 20px rgba(0,0,0,0.08)` : 'none',
        '&:hover': {
          borderColor: category.accentColor,
          boxShadow: `0 2px 12px rgba(0,0,0,0.06)`,
        },
      }}
    >
      <CardContent
        sx={{
          cursor: 'pointer',
          py: 2,
          px: 2.5,
          '&:last-child': { pb: expanded ? 0 : 2 },
        }}
        onClick={onToggle}
      >
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
          {/* Icon */}
          <Box
            sx={{
              width: 42,
              height: 42,
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: `${category.accentColor}14`,
              flexShrink: 0,
            }}
          >
            <Icon sx={{ fontSize: 22, color: category.accentColor }} />
          </Box>

          {/* Content */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, lineHeight: 1.3, color: folioColors.ink }}>
                {category.label}
              </Typography>
              {count > 0 && (
                <Badge
                  badgeContent={count}
                  sx={{
                    '& .MuiBadge-badge': {
                      bgcolor: category.accentColor,
                      color: '#fff',
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      minWidth: 20,
                      height: 20,
                    },
                  }}
                />
              )}
            </Box>
            <Typography variant="body2" sx={{ color: folioColors.inkLight, fontSize: '0.82rem', lineHeight: 1.4 }}>
              {shownExamples.join(', ')}
              {moreCount > 0 && `, +${moreCount} more`}
            </Typography>
          </Box>

          {/* Expand icon */}
          <IconButton size="small" sx={{ color: folioColors.inkFaint, mt: 0.25 }}>
            {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        </Box>
      </CardContent>

      {/* Expanded documents list */}
      <Collapse in={expanded}>
        <Box
          sx={{
            px: 2.5,
            pb: 2,
            borderTop: `1px solid ${folioColors.parchment}`,
            pt: 1.5,
          }}
        >
          {/* Category note */}
          {category.note && (
            <Alert
              severity="info"
              sx={{
                mb: 1.5,
                py: 0.25,
                fontSize: '0.8rem',
                '& .MuiAlert-message': { fontSize: '0.8rem' },
              }}
            >
              {category.note}
            </Alert>
          )}

          {/* Upload button */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1.5 }}>
            <Button
              variant="contained" size="small" startIcon={<AddIcon />}
              onClick={(e) => { e.stopPropagation(); onUpload(); }}
              sx={{ bgcolor: folioColors.ink, '&:hover': { bgcolor: '#3d3224' }, textTransform: 'none' }}
            >
              Upload Document
            </Button>
          </Box>

          {/* Document list */}
          {documents.length > 0 ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {documents.map((doc) => (
                <DocumentRow
                  key={doc.id}
                  doc={doc}
                  accentColor={category.accentColor}
                  onDownload={() => onDownload(doc)}
                  onDelete={() => onDelete(doc)}
                />
              ))}
            </Box>
          ) : (
            <Typography variant="body2" sx={{ color: folioColors.inkFaint, textAlign: 'center', py: 1.5 }}>
              No documents uploaded yet.
            </Typography>
          )}
        </Box>
      </Collapse>
    </Card>
  );
};

// ── Document Row ───────────────────────────────────────────────────────────

interface DocumentRowProps {
  doc: VaultDocumentRecord;
  accentColor: string;
  onDownload: () => void;
  onDelete: () => void;
}

const DocumentRow: React.FC<DocumentRowProps> = ({ doc, accentColor, onDownload, onDelete }) => {
  const expired = isExpired(doc.expiration_date);
  const expiringSoon = isExpiringSoon(doc.expiration_date);

  return (
    <Paper
      variant="outlined"
      sx={{
        px: 2,
        py: 1.25,
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        borderRadius: '8px',
        '&:hover': { borderColor: accentColor, bgcolor: 'rgba(0,0,0,0.01)' },
        transition: 'all 0.15s',
      }}
    >
      {/* Icon */}
      <FolderIcon sx={{ fontSize: 20, color: accentColor, flexShrink: 0 }} />

      {/* Info */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
          <Typography variant="body2" sx={{ fontWeight: 600, color: folioColors.ink }}>
            {doc.document_name}
          </Typography>

          {/* Sensitivity chip */}
          {doc.sensitivity === 'highly_sensitive' && (
            <Chip
              icon={<LockIcon sx={{ fontSize: 12 }} />}
              label="Highly Sensitive"
              size="small"
              sx={{
                height: 20, fontSize: '0.68rem', fontWeight: 600,
                bgcolor: '#ffebee', color: '#c62828', borderColor: '#ef9a9a',
                '& .MuiChip-icon': { color: '#c62828' },
              }}
              variant="outlined"
            />
          )}
          {doc.sensitivity === 'restricted' && (
            <Chip
              label="Restricted"
              size="small"
              sx={{
                height: 20, fontSize: '0.68rem', fontWeight: 600,
                bgcolor: '#fff3e0', color: '#e65100', borderColor: '#ffcc80',
              }}
              variant="outlined"
            />
          )}

          {/* Expiration warnings */}
          {expired && (
            <Chip
              icon={<WarningAmberIcon sx={{ fontSize: 13 }} />}
              label="Expired"
              size="small"
              sx={{
                height: 20, fontSize: '0.68rem', fontWeight: 600,
                bgcolor: '#ffebee', color: '#c62828',
                '& .MuiChip-icon': { color: '#c62828' },
              }}
            />
          )}
          {expiringSoon && !expired && (
            <Chip
              icon={<WarningAmberIcon sx={{ fontSize: 13 }} />}
              label="Expiring Soon"
              size="small"
              sx={{
                height: 20, fontSize: '0.68rem', fontWeight: 600,
                bgcolor: '#fff8e1', color: '#f57f17',
                '& .MuiChip-icon': { color: '#f57f17' },
              }}
            />
          )}
        </Box>

        {/* Meta line */}
        <Typography variant="caption" sx={{ color: folioColors.inkFaint }}>
          {[
            doc.document_date ? formatDate(doc.document_date) : null,
            formatFileSize(doc.file_size),
            doc.expiration_date ? `Exp: ${formatDate(doc.expiration_date)}` : null,
          ].filter(Boolean).join(' · ')}
        </Typography>
      </Box>

      {/* Actions */}
      <Box sx={{ display: 'flex', gap: 0.5, flexShrink: 0 }}>
        <IconButton size="small" onClick={onDownload} title="Download" sx={{ color: folioColors.inkLight }}>
          <DownloadIcon fontSize="small" />
        </IconButton>
        <IconButton size="small" onClick={onDelete} title="Delete" sx={{ color: '#c62828' }}>
          <DeleteIcon fontSize="small" />
        </IconButton>
      </Box>
    </Paper>
  );
};

// ── Main Section ───────────────────────────────────────────────────────────

const DocumentsVaultSection: React.FC = () => {
  const { intakeId: contextIntakeId, setIntakeId: setContextIntakeId } = useFormContext();
  const { user } = useAuth();

  // Resolve intakeId: prefer context, fall back to DB lookup
  const [resolvedIntakeId, setResolvedIntakeId] = useState<string | null>(contextIntakeId);
  const [loadingIntake, setLoadingIntake] = useState(false);

  useEffect(() => {
    if (contextIntakeId) {
      setResolvedIntakeId(contextIntakeId);
      return;
    }
    // Look up the user's folio_intakes record if context doesn't have it
    const resolve = async () => {
      if (!user) return;
      setLoadingIntake(true);
      try {
        const { data } = await supabase
          .from('folio_intakes')
          .select('id')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();
        if (data?.id) {
          setResolvedIntakeId(data.id);
          setContextIntakeId(data.id); // populate context for other components
        }
      } catch {
        // no intake yet
      } finally {
        setLoadingIntake(false);
      }
    };
    resolve();
  }, [contextIntakeId, user, setContextIntakeId]);

  const intakeId = resolvedIntakeId;

  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [documents, setDocuments] = useState<Record<string, VaultDocumentRecord[]>>({});
  const [uploadCategory, setUploadCategory] = useState<VaultCategoryDef | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<VaultDocumentRecord | null>(null);
  const [snack, setSnack] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false, message: '', severity: 'success',
  });

  // Load counts on mount
  const refreshCounts = useCallback(async () => {
    if (!intakeId) return;
    const result = await getVaultDocumentCounts(intakeId);
    if (result.success && result.counts) setCounts(result.counts);
  }, [intakeId]);

  useEffect(() => { refreshCounts(); }, [refreshCounts]);

  // Load documents for a category when expanded
  const loadCategoryDocs = useCallback(async (categoryId: string) => {
    if (!intakeId) return;
    const result = await listVaultDocuments(intakeId, categoryId);
    if (result.success && result.documents) {
      setDocuments((prev) => ({ ...prev, [categoryId]: result.documents! }));
    }
  }, [intakeId]);

  const handleToggleCategory = (categoryId: string) => {
    if (expandedCategory === categoryId) {
      setExpandedCategory(null);
    } else {
      setExpandedCategory(categoryId);
      loadCategoryDocs(categoryId);
    }
  };

  // Upload
  const handleUpload = async (data: DocumentUploadData) => {
    if (!intakeId || !uploadCategory) throw new Error('No folio selected. Please save your folio from the Personal Information section first.');

    const result = await uploadVaultDocument({
      intakeId,
      category: uploadCategory.id,
      documentName: data.documentName,
      description: data.description || undefined,
      documentDate: data.documentDate || undefined,
      expirationDate: data.expirationDate || undefined,
      sensitivity: data.sensitivity,
      file: data.file,
    });

    if (!result.success) throw new Error(result.error || 'Upload failed');

    setSnack({ open: true, message: 'Document uploaded successfully.', severity: 'success' });
    // Refresh
    await refreshCounts();
    if (expandedCategory === uploadCategory.id) {
      await loadCategoryDocs(uploadCategory.id);
    }
  };

  // Download
  const handleDownload = async (doc: VaultDocumentRecord) => {
    const result = await getVaultDocumentUrl(doc.file_path);
    if (result.success && result.url) {
      window.open(result.url, '_blank');
    } else {
      setSnack({ open: true, message: 'Failed to generate download link.', severity: 'error' });
    }
  };

  // Delete
  const confirmDelete = async () => {
    if (!deleteTarget) return;
    const result = await deleteVaultDocument(deleteTarget.id, deleteTarget.file_path);
    if (result.success) {
      setSnack({ open: true, message: 'Document deleted.', severity: 'success' });
      await refreshCounts();
      if (expandedCategory) await loadCategoryDocs(expandedCategory);
    } else {
      setSnack({ open: true, message: result.error || 'Delete failed.', severity: 'error' });
    }
    setDeleteTarget(null);
  };

  const totalDocuments = Object.values(counts).reduce((sum, n) => sum + n, 0);

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
        <FolderIcon sx={{ color: '#e07a2f', fontSize: 28 }} />
        <Typography variant="h6" sx={{ fontWeight: 600 }}>Documents Vault</Typography>
        {totalDocuments > 0 && (
          <Chip
            label={`${totalDocuments} document${totalDocuments !== 1 ? 's' : ''}`}
            size="small"
            sx={{
              bgcolor: '#e07a2f',
              color: '#fff',
              fontWeight: 600,
              fontSize: '0.75rem',
              height: 24,
            }}
          />
        )}
      </Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: 640 }}>
        Organize and securely store your important documents. Click any category to view documents or upload new ones.
      </Typography>

      {loadingIntake && (
        <Alert severity="info" sx={{ mb: 3 }}>
          Loading your vault…
        </Alert>
      )}
      {!loadingIntake && !intakeId && (
        <Alert severity="info" sx={{ mb: 3 }}>
          Please save your folio at least once (from the Personal Information section) before uploading documents.
        </Alert>
      )}

      {/* Category grid */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, 1fr)',
            md: 'repeat(3, 1fr)',
          },
          gap: 2,
        }}
      >
        {VAULT_CATEGORIES.map((cat) => (
          <CategoryCard
            key={cat.id}
            category={cat}
            count={counts[cat.id] || 0}
            expanded={expandedCategory === cat.id}
            onToggle={() => handleToggleCategory(cat.id)}
            documents={documents[cat.id] || []}
            onUpload={() => setUploadCategory(cat)}
            onDownload={handleDownload}
            onDelete={(doc) => setDeleteTarget(doc)}
          />
        ))}
      </Box>

      {/* Upload modal */}
      <DocumentUploadModal
        open={!!uploadCategory}
        onClose={() => setUploadCategory(null)}
        onSave={handleUpload}
        categoryLabel={uploadCategory?.label || ''}
      />

      {/* Delete confirmation dialog */}
      <Dialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Delete Document</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to permanently delete <strong>{deleteTarget?.document_name}</strong>? This cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteTarget(null)}>Cancel</Button>
          <Button onClick={confirmDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snack.open}
        autoHideDuration={4000}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snack.severity} onClose={() => setSnack((s) => ({ ...s, open: false }))}>
          {snack.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default DocumentsVaultSection;
