'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Card, CardContent, Chip, IconButton, Button, Badge,
  Paper, Dialog, DialogTitle, DialogContent, DialogActions, Collapse, Fade,
  Alert, Snackbar,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DownloadIcon from '@mui/icons-material/Download';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DeleteIcon from '@mui/icons-material/Delete';
import LockIcon from '@mui/icons-material/Lock';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import FolderIcon from '@mui/icons-material/Folder';
import ListAltIcon from '@mui/icons-material/ListAlt';
import { folioColors } from './FolioModal';
import FolioHelpModal, { FolioHelpButton, useFolioHelp } from './FolioHelpModal';
import { documentsVaultHelp } from './folioHelpContent';
import { useFormContext } from '../lib/FormContext';
import { useAuth } from '../lib/AuthContext';
import { supabase } from '../lib/supabase';
import {
  VAULT_CATEGORIES, VAULT_CATEGORY_MAP, VaultCategoryDef, SENSITIVITY_LABELS, SensitivityLevel,
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
                    ml: 1.5,
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

// ── All Documents Table ────────────────────────────────────────────────────

interface AllDocumentsTableProps {
  documents: VaultDocumentRecord[];
  onDownload: (doc: VaultDocumentRecord) => void;
  onViewInline: (doc: VaultDocumentRecord) => void;
}

const AllDocumentsTable: React.FC<AllDocumentsTableProps> = ({ documents, onDownload, onViewInline }) => {
  if (documents.length === 0) {
    return (
      <Typography variant="body2" sx={{ color: folioColors.inkFaint, textAlign: 'center', py: 3 }}>
        No documents have been uploaded yet. Use the category cards above to upload your first document.
      </Typography>
    );
  }

  // Group documents by category, preserving VAULT_CATEGORIES order
  const grouped: { category: VaultCategoryDef; docs: VaultDocumentRecord[] }[] = [];
  const docsByCategory: Record<string, VaultDocumentRecord[]> = {};
  for (const doc of documents) {
    if (!docsByCategory[doc.category]) docsByCategory[doc.category] = [];
    docsByCategory[doc.category].push(doc);
  }
  for (const cat of VAULT_CATEGORIES) {
    if (docsByCategory[cat.id]?.length) {
      grouped.push({ category: cat, docs: docsByCategory[cat.id] });
    }
  }

  return (
    <Box
      component="table"
      sx={{
        width: '100%',
        borderCollapse: 'collapse',
        fontSize: '0.875rem',
        '& th, & td': {
          px: 2,
          py: 1.25,
          textAlign: 'left',
          borderBottom: '1px solid #e0dcd5',
        },
      }}
    >
      <Box component="thead">
        <Box component="tr" sx={{ '& th': { fontWeight: 600, color: folioColors.inkLight, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.04em', borderBottom: `2px solid ${folioColors.parchment}` } }}>
          <Box component="th">Document</Box>
          <Box component="th" sx={{ display: { xs: 'none', sm: 'table-cell' } }}>Date</Box>
          <Box component="th" sx={{ display: { xs: 'none', md: 'table-cell' } }}>Size</Box>
          <Box component="th" sx={{ display: { xs: 'none', sm: 'table-cell' } }}>Sensitivity</Box>
          <Box component="th" sx={{ textAlign: 'center', width: 100 }}>Actions</Box>
        </Box>
      </Box>
      <Box component="tbody">
        {grouped.map(({ category, docs }) => {
          const CatIcon = category.icon;
          return (
            <React.Fragment key={category.id}>
              {/* Category header row */}
              <Box
                component="tr"
                sx={{
                  '& td': {
                    bgcolor: folioColors.ink,
                    color: '#fff',
                    fontWeight: 700,
                    fontSize: '0.82rem',
                    letterSpacing: '0.02em',
                    py: 1,
                    borderBottom: 'none',
                  },
                }}
              >
                <Box component="td" colSpan={5}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CatIcon sx={{ fontSize: 18, color: category.accentColor }} />
                    {category.label}
                    <Chip
                      label={docs.length}
                      size="small"
                      sx={{
                        height: 20,
                        minWidth: 20,
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        bgcolor: category.accentColor,
                        color: '#fff',
                        ml: 0.5,
                      }}
                    />
                  </Box>
                </Box>
              </Box>

              {/* Document rows */}
              {docs.map((doc) => {
                const expired = isExpired(doc.expiration_date);
                const expSoon = isExpiringSoon(doc.expiration_date);
                const isViewable = /\.(pdf|jpg|jpeg|png|webp)$/i.test(doc.file_name);
                return (
                  <Box
                    component="tr"
                    key={doc.id}
                    sx={{
                      '&:hover td': { bgcolor: 'rgba(0,0,0,0.02)' },
                      transition: 'background 0.15s',
                    }}
                  >
                    <Box component="td">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: folioColors.ink }}>
                          {doc.document_name}
                        </Typography>
                        {expired && (
                          <Chip icon={<WarningAmberIcon sx={{ fontSize: 13 }} />} label="Expired" size="small"
                            sx={{ height: 20, fontSize: '0.68rem', fontWeight: 600, bgcolor: '#ffebee', color: '#c62828', '& .MuiChip-icon': { color: '#c62828' } }}
                          />
                        )}
                        {expSoon && !expired && (
                          <Chip icon={<WarningAmberIcon sx={{ fontSize: 13 }} />} label="Expiring Soon" size="small"
                            sx={{ height: 20, fontSize: '0.68rem', fontWeight: 600, bgcolor: '#fff8e1', color: '#f57f17', '& .MuiChip-icon': { color: '#f57f17' } }}
                          />
                        )}
                      </Box>
                      {doc.description && (
                        <Typography variant="caption" sx={{ color: folioColors.inkFaint, display: 'block', mt: 0.25 }}>
                          {doc.description}
                        </Typography>
                      )}
                    </Box>
                    <Box component="td" sx={{ display: { xs: 'none', sm: 'table-cell' }, color: folioColors.inkLight, fontSize: '0.82rem' }}>
                      {doc.document_date ? formatDate(doc.document_date) : '—'}
                    </Box>
                    <Box component="td" sx={{ display: { xs: 'none', md: 'table-cell' }, color: folioColors.inkLight, fontSize: '0.82rem' }}>
                      {formatFileSize(doc.file_size)}
                    </Box>
                    <Box component="td" sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                      {doc.sensitivity === 'highly_sensitive' && (
                        <Chip icon={<LockIcon sx={{ fontSize: 12 }} />} label="Highly Sensitive" size="small" variant="outlined"
                          sx={{ height: 20, fontSize: '0.68rem', fontWeight: 600, bgcolor: '#ffebee', color: '#c62828', borderColor: '#ef9a9a', '& .MuiChip-icon': { color: '#c62828' } }}
                        />
                      )}
                      {doc.sensitivity === 'restricted' && (
                        <Chip label="Restricted" size="small" variant="outlined"
                          sx={{ height: 20, fontSize: '0.68rem', fontWeight: 600, bgcolor: '#fff3e0', color: '#e65100', borderColor: '#ffcc80' }}
                        />
                      )}
                      {doc.sensitivity === 'normal' && (
                        <Typography variant="caption" sx={{ color: folioColors.inkFaint }}>Normal</Typography>
                      )}
                    </Box>
                    <Box component="td" sx={{ textAlign: 'center' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.5 }}>
                        {isViewable && (
                          <IconButton size="small" onClick={() => onViewInline(doc)} title="View inline" sx={{ color: '#0077b6' }}>
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                        )}
                        <IconButton size="small" onClick={() => onDownload(doc)} title="Download" sx={{ color: folioColors.inkLight }}>
                          <DownloadIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </Box>
                  </Box>
                );
              })}
            </React.Fragment>
          );
        })}
      </Box>
    </Box>
  );
};

// ── Main Section ───────────────────────────────────────────────────────────

const DocumentsVaultSection: React.FC = () => {
  const { intakeId: contextIntakeId, setIntakeId: setContextIntakeId } = useFormContext();
  const { user } = useAuth();
  const { showHelp, openHelp, closeHelp } = useFolioHelp();

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
  const [allDocuments, setAllDocuments] = useState<VaultDocumentRecord[]>([]);
  const [uploadCategory, setUploadCategory] = useState<VaultCategoryDef | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<VaultDocumentRecord | null>(null);
  const [viewInlineUrl, setViewInlineUrl] = useState<{ url: string; name: string; type: string } | null>(null);
  const [snack, setSnack] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false, message: '', severity: 'success',
  });

  // Load counts and all documents on mount
  const refreshAllDocuments = useCallback(async () => {
    if (!intakeId) return;
    const result = await listVaultDocuments(intakeId);
    if (result.success && result.documents) setAllDocuments(result.documents);
  }, [intakeId]);

  const refreshCounts = useCallback(async () => {
    if (!intakeId) return;
    const result = await getVaultDocumentCounts(intakeId);
    if (result.success && result.counts) setCounts(result.counts);
  }, [intakeId]);

  useEffect(() => { refreshCounts(); refreshAllDocuments(); }, [refreshCounts, refreshAllDocuments]);

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
    await refreshAllDocuments();
    if (expandedCategory === uploadCategory.id) {
      await loadCategoryDocs(uploadCategory.id);
    }
  };

  // Download
  const handleDownload = async (doc: VaultDocumentRecord) => {
    const result = await getVaultDocumentUrl(doc.file_path);
    if (result.success && result.url) {
      // Create a temporary link to trigger a proper file download
      const a = document.createElement('a');
      a.href = result.url;
      a.download = doc.file_name || doc.document_name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      // Revoke the blob URL after a short delay to free memory
      setTimeout(() => URL.revokeObjectURL(result.url!), 5000);
    } else {
      setSnack({ open: true, message: `Failed to download: ${result.error || 'Unknown error'}`, severity: 'error' });
    }
  };

  // View inline
  const handleViewInline = async (doc: VaultDocumentRecord) => {
    console.log('View inline requested for:', doc.file_path);
    const result = await getVaultDocumentUrl(doc.file_path);
    if (result.success && result.url) {
      setViewInlineUrl({ url: result.url, name: doc.document_name, type: doc.file_type });
    } else {
      console.error('View inline failed for path:', doc.file_path, 'Error:', result.error);
      setSnack({ open: true, message: `Failed to load document preview: ${result.error || 'Unknown error'}`, severity: 'error' });
    }
  };

  // Delete
  const confirmDelete = async () => {
    if (!deleteTarget) return;
    const result = await deleteVaultDocument(deleteTarget.id, deleteTarget.file_path);
    if (result.success) {
      setSnack({ open: true, message: 'Document deleted.', severity: 'success' });
      await refreshCounts();
      await refreshAllDocuments();
      if (expandedCategory) await loadCategoryDocs(expandedCategory);
    } else {
      setSnack({ open: true, message: result.error || 'Delete failed.', severity: 'error' });
    }
    setDeleteTarget(null);
  };

  const totalDocuments = Object.values(counts).reduce((sum, n) => sum + n, 0);

  return (
    <Box>
      <FolioHelpModal open={showHelp} onClose={closeHelp} content={documentsVaultHelp} />
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
        <FolderIcon sx={{ color: '#e07a2f', fontSize: 28 }} />
        <Typography variant="h6" sx={{ fontWeight: 600 }}>Documents Vault</Typography>
        <FolioHelpButton onClick={openHelp} accentColor="#e07a2f" />
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

      {/* All Documents listing */}
      {intakeId && (
        <Paper
          variant="outlined"
          sx={{
            mt: 4,
            borderRadius: '10px',
            overflow: 'hidden',
            borderColor: folioColors.parchment,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 2.5, py: 2, bgcolor: folioColors.cream, borderBottom: `1px solid ${folioColors.parchment}` }}>
            <ListAltIcon sx={{ color: folioColors.ink, fontSize: 22 }} />
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: folioColors.ink }}>
              All Documents
            </Typography>
            {totalDocuments > 0 && (
              <Chip
                label={`${totalDocuments} total`}
                size="small"
                sx={{ bgcolor: folioColors.ink, color: '#fff', fontWeight: 600, fontSize: '0.75rem', height: 22 }}
              />
            )}
          </Box>
          <Box sx={{ overflowX: 'auto' }}>
            <AllDocumentsTable
              documents={allDocuments}
              onDownload={handleDownload}
              onViewInline={handleViewInline}
            />
          </Box>
        </Paper>
      )}

      {/* Inline document viewer dialog */}
      <Dialog
        open={!!viewInlineUrl}
        onClose={() => setViewInlineUrl(null)}
        maxWidth="lg"
        fullWidth
        PaperProps={{ sx: { height: '85vh' } }}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 1.5 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            {viewInlineUrl?.name}
          </Typography>
          <IconButton size="small" onClick={() => setViewInlineUrl(null)}>
            <ExpandLessIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#f5f5f5' }}>
          {viewInlineUrl && (
            viewInlineUrl.type.startsWith('image/') ? (
              <Box
                component="img"
                src={viewInlineUrl.url}
                alt={viewInlineUrl.name}
                sx={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
              />
            ) : (
              <Box
                component="iframe"
                src={viewInlineUrl.url}
                sx={{ width: '100%', height: '100%', border: 'none' }}
                title={viewInlineUrl.name}
              />
            )
          )}
        </DialogContent>
      </Dialog>

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
