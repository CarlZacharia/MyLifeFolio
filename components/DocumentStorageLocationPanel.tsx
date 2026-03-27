'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Box, Typography, TextField, IconButton, Button, Chip, Collapse,
  Paper, Alert, Snackbar, Tooltip, CircularProgress,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import PlaceIcon from '@mui/icons-material/Place';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { folioColors } from './FolioModal';
import FolioHelpModal, { FolioHelpButton, useFolioHelp } from './FolioHelpModal';
import { documentStorageLocationHelp } from './folioHelpContent';
import { useFormContext } from '../lib/FormContext';
import { useAuth } from '../lib/AuthContext';
import { supabase } from '../lib/supabase';
import {
  PHYSICAL_DOC_CATEGORIES,
  PhysicalDocCategory,
  VAULT_CATEGORY_XREF,
  SUB_ITEM_KEYWORDS,
} from '../lib/physicalDocLocationCategories';
import { VaultDocumentRecord } from '../lib/documentVaultStorage';
import { VAULT_CATEGORY_MAP } from '../lib/documentVaultCategories';
import DocumentUploadModal, { DocumentUploadData } from './DocumentUploadModal';
import { uploadVaultDocument } from '../lib/documentVaultStorage';

// ── Types ─────────────────────────────────────────────────────────────────

interface LocationRow {
  id?: string;              // DB id (undefined for new unsaved rows)
  category: string;
  subItem: string;
  subItemRefTable?: string;
  subItemRefId?: string;
  location: string;
  notes?: string;
}

interface RealEstateRow {
  id?: string;  // folio_real_estate id (may not be stored if loaded from FormContext)
  street: string;
  city: string;
  state: string;
  category: string;
}

interface VehicleRow {
  id?: string;
  yearMakeModel: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────

function buildPropertyLabel(re: RealEstateRow): string {
  const parts = [re.street, re.city, re.state].filter(Boolean);
  return parts.length > 0 ? parts.join(', ') : 'Unnamed Property';
}

function matchesKeywords(docName: string, keywords: string[]): boolean {
  const lower = docName.toLowerCase();
  return keywords.some((kw) => lower.includes(kw.toLowerCase()));
}

// ── Category Accordion ────────────────────────────────────────────────────

interface CategoryAccordionProps {
  category: PhysicalDocCategory;
  rows: LocationRow[];
  expanded: boolean;
  onToggle: () => void;
  onChange: (rows: LocationRow[]) => void;
  onAddCustomRow?: () => void;
  vaultDocs: VaultDocumentRecord[];
  onViewVaultDoc: (doc: VaultDocumentRecord) => void;
  onUploadForSubItem: (category: string, subItem: string) => void;
  filledCount: number;
}

const CategoryAccordion: React.FC<CategoryAccordionProps> = ({
  category, rows, expanded, onToggle, onChange, onAddCustomRow,
  vaultDocs, onViewVaultDoc, onUploadForSubItem, filledCount,
}) => {
  const handleLocationChange = (index: number, value: string) => {
    const updated = [...rows];
    updated[index] = { ...updated[index], location: value };
    onChange(updated);
  };

  const handleDeleteCustomRow = (index: number) => {
    const updated = rows.filter((_, i) => i !== index);
    onChange(updated);
  };

  const handleSubItemLabelChange = (index: number, value: string) => {
    const updated = [...rows];
    updated[index] = { ...updated[index], subItem: value };
    onChange(updated);
  };

  // Find matching vault docs for a given sub-item
  const findVaultMatch = (subItem: string): VaultDocumentRecord | null => {
    const vaultCatId = VAULT_CATEGORY_XREF[category.id];
    if (!vaultCatId) return null;

    // Get keywords for this sub-item
    const catKeywords = SUB_ITEM_KEYWORDS[category.id];
    const keywords = catKeywords?.[subItem];
    if (!keywords || keywords.length === 0) return null;

    // Search vault docs in this category
    const catDocs = vaultDocs.filter((d) => d.category === vaultCatId);
    return catDocs.find((d) => matchesKeywords(d.document_name, keywords)) || null;
  };

  // For dynamic property/vehicle rows, try broader matching
  const findDynamicVaultMatch = (subItem: string): VaultDocumentRecord | null => {
    const vaultCatId = VAULT_CATEGORY_XREF[category.id];
    if (!vaultCatId) return null;
    const catDocs = vaultDocs.filter((d) => d.category === vaultCatId);
    // Match any word from the sub-item label (address or vehicle description)
    const words = subItem.toLowerCase().split(/[\s,]+/).filter((w) => w.length > 2);
    return catDocs.find((d) => {
      const dn = d.document_name.toLowerCase();
      return words.some((w) => dn.includes(w));
    }) || null;
  };

  return (
    <Paper
      variant="outlined"
      sx={{
        borderRadius: '8px',
        overflow: 'hidden',
        borderColor: expanded ? folioColors.inkLight : 'rgba(0,0,0,0.12)',
        transition: 'border-color 0.2s',
      }}
    >
      {/* Header */}
      <Box
        onClick={onToggle}
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          px: 2,
          py: 1.5,
          cursor: 'pointer',
          bgcolor: expanded ? folioColors.cream : 'transparent',
          '&:hover': { bgcolor: folioColors.cream },
          transition: 'background 0.15s',
        }}
      >
        <PlaceIcon sx={{ fontSize: 20, color: folioColors.inkLight }} />
        <Typography variant="subtitle2" sx={{ fontWeight: 600, color: folioColors.ink, flex: 1 }}>
          {category.label}
        </Typography>
        {filledCount > 0 && (
          <Chip
            label={`${filledCount} stored`}
            size="small"
            sx={{
              height: 20,
              fontSize: '0.7rem',
              fontWeight: 600,
              bgcolor: '#e8f5e9',
              color: '#2e7d32',
            }}
          />
        )}
        <IconButton size="small" sx={{ color: folioColors.inkFaint }}>
          {expanded ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
        </IconButton>
      </Box>

      {/* Rows */}
      <Collapse in={expanded}>
        <Box sx={{ px: 2, pb: 2, pt: 1, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {rows.length === 0 && !category.allowCustomRows && (
            <Typography variant="body2" sx={{ color: folioColors.inkFaint, fontStyle: 'italic', py: 1 }}>
              {category.dynamicSource === 'folio_real_estate'
                ? 'No properties entered yet — add them in the Assets section.'
                : category.dynamicSource === 'folio_vehicles'
                  ? 'No vehicles entered yet — add them in the Assets section.'
                  : 'No items in this category.'}
            </Typography>
          )}

          {rows.map((row, idx) => {
            const isDynamic = !!row.subItemRefTable;
            const isCustom = category.allowCustomRows && !row.subItemRefTable;
            const vaultMatch = isDynamic
              ? findDynamicVaultMatch(row.subItem)
              : findVaultMatch(row.subItem);

            return (
              <Box key={`${row.category}-${row.subItem}-${idx}`}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                  {/* Sub-item label or editable field for custom rows */}
                  {isCustom ? (
                    <TextField
                      size="small"
                      label="Document"
                      value={row.subItem}
                      onChange={(e) => handleSubItemLabelChange(idx, e.target.value)}
                      sx={{ width: 200, flexShrink: 0 }}
                      InputLabelProps={{ shrink: true }}
                    />
                  ) : (
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 500,
                        color: folioColors.ink,
                        minWidth: 200,
                        pt: 1,
                        flexShrink: 0,
                      }}
                    >
                      {row.subItem}
                    </Typography>
                  )}

                  {/* Location input */}
                  <TextField
                    size="small"
                    label="Where is this stored?"
                    placeholder="e.g., Home safe, attorney's office"
                    value={row.location}
                    onChange={(e) => handleLocationChange(idx, e.target.value)}
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                  />

                  {/* Vault cross-reference buttons */}
                  {vaultMatch ? (
                    <Tooltip title={`View: ${vaultMatch.document_name}`}>
                      <IconButton
                        size="small"
                        onClick={(e) => { e.stopPropagation(); onViewVaultDoc(vaultMatch); }}
                        sx={{ color: '#0077b6', flexShrink: 0, mt: 0.5 }}
                      >
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  ) : (
                    <Tooltip title="Upload digital copy">
                      <IconButton
                        size="small"
                        onClick={(e) => { e.stopPropagation(); onUploadForSubItem(category.id, row.subItem); }}
                        sx={{ color: folioColors.inkFaint, flexShrink: 0, mt: 0.5 }}
                      >
                        <CloudUploadIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}

                  {/* Delete button for custom rows */}
                  {isCustom && (
                    <IconButton
                      size="small"
                      onClick={() => handleDeleteCustomRow(idx)}
                      sx={{ color: '#c62828', flexShrink: 0, mt: 0.5 }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  )}
                </Box>

                {/* Uploaded indicator */}
                {vaultMatch && (
                  <Box sx={{ ml: '200px', pl: 1, mt: 0.25 }}>
                    <Chip
                      icon={<CheckCircleIcon sx={{ fontSize: 14 }} />}
                      label="Digital copy uploaded"
                      size="small"
                      sx={{
                        height: 20,
                        fontSize: '0.68rem',
                        bgcolor: '#e8f5e9',
                        color: '#2e7d32',
                        '& .MuiChip-icon': { color: '#2e7d32' },
                      }}
                    />
                  </Box>
                )}
              </Box>
            );
          })}

          {/* Add custom row button for "Other" category */}
          {category.allowCustomRows && (
            <Button
              size="small"
              startIcon={<AddIcon />}
              onClick={onAddCustomRow}
              sx={{ alignSelf: 'flex-start', textTransform: 'none', color: folioColors.inkLight }}
            >
              Add another document
            </Button>
          )}
        </Box>
      </Collapse>
    </Paper>
  );
};

// ── Main Panel ────────────────────────────────────────────────────────────

interface DocumentStorageLocationPanelProps {
  intakeId: string | null;
  onViewVaultDoc: (doc: VaultDocumentRecord) => void;
}

const DocumentStorageLocationPanel: React.FC<DocumentStorageLocationPanelProps> = ({
  intakeId, onViewVaultDoc,
}) => {
  const { formData } = useFormContext();
  const { user } = useAuth();
  const { showHelp, openHelp, closeHelp } = useFolioHelp();

  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [locationData, setLocationData] = useState<Record<string, LocationRow[]>>({});
  const [vaultDocs, setVaultDocs] = useState<VaultDocumentRecord[]>([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [dirty, setDirty] = useState(false);
  const [snack, setSnack] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false, message: '', severity: 'success',
  });

  // Upload modal state
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [uploadCategoryLabel, setUploadCategoryLabel] = useState('');
  const [uploadVaultCategoryId, setUploadVaultCategoryId] = useState('');

  // Auto-save timer
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Build initial rows from categories + dynamic assets ─────────────

  const buildRowsForCategory = useCallback((cat: PhysicalDocCategory, savedRows: LocationRow[]): LocationRow[] => {
    const rows: LocationRow[] = [];

    if (cat.dynamicSource === 'folio_real_estate') {
      // Add a row per property for "Deed" location
      for (const prop of formData.realEstate) {
        const label = `Deed — ${buildPropertyLabel(prop as unknown as RealEstateRow)}`;
        const existing = savedRows.find(
          (r) => r.category === cat.id && r.subItem === label
        );
        rows.push({
          id: existing?.id,
          category: cat.id,
          subItem: label,
          subItemRefTable: 'folio_real_estate',
          location: existing?.location || '',
        });
      }
      // Add static sub-items (Mortgage Documents)
      if (cat.staticSubItems) {
        for (const si of cat.staticSubItems) {
          const existing = savedRows.find(
            (r) => r.category === cat.id && r.subItem === si.label
          );
          rows.push({
            id: existing?.id,
            category: cat.id,
            subItem: si.label,
            location: existing?.location || '',
          });
        }
      }
    } else if (cat.dynamicSource === 'folio_vehicles') {
      for (const veh of formData.vehicles) {
        const label = `Title — ${veh.yearMakeModel || 'Unnamed Vehicle'}`;
        const existing = savedRows.find(
          (r) => r.category === cat.id && r.subItem === label
        );
        rows.push({
          id: existing?.id,
          category: cat.id,
          subItem: label,
          subItemRefTable: 'folio_vehicles',
          location: existing?.location || '',
        });
      }
    } else if (cat.allowCustomRows) {
      // "Other" category — show saved custom rows
      const customRows = savedRows.filter((r) => r.category === cat.id);
      rows.push(...customRows);
    } else {
      // Static sub-items
      for (const si of cat.subItems) {
        const existing = savedRows.find(
          (r) => r.category === cat.id && r.subItem === si.label
        );
        rows.push({
          id: existing?.id,
          category: cat.id,
          subItem: si.label,
          location: existing?.location || '',
        });
      }
    }

    return rows;
  }, [formData.realEstate, formData.vehicles]);

  // ── Load saved data from DB ─────────────────────────────────────────

  const loadData = useCallback(async () => {
    if (!intakeId || !user) { setLoading(false); return; }
    setLoading(true);

    try {
      // Load saved physical locations
      const { data: savedRows, error } = await supabase
        .from('physical_document_locations')
        .select('*')
        .eq('intake_id', intakeId)
        .eq('user_id', user.id);

      if (error) throw error;

      const mapped: LocationRow[] = (savedRows || []).map((r: any) => ({
        id: r.id,
        category: r.category,
        subItem: r.sub_item,
        subItemRefTable: r.sub_item_ref_table || undefined,
        subItemRefId: r.sub_item_ref_id || undefined,
        location: r.location || '',
        notes: r.notes || undefined,
      }));

      // Build rows for each category
      const allData: Record<string, LocationRow[]> = {};
      for (const cat of PHYSICAL_DOC_CATEGORIES) {
        allData[cat.id] = buildRowsForCategory(cat, mapped);
      }
      setLocationData(allData);

      // Load all vault documents for cross-referencing
      const { data: vDocs } = await supabase
        .from('vault_documents')
        .select('*')
        .eq('intake_id', intakeId);

      setVaultDocs((vDocs || []) as VaultDocumentRecord[]);
    } catch (err) {
      console.error('Failed to load physical document locations:', err);
    } finally {
      setLoading(false);
    }
  }, [intakeId, user, buildRowsForCategory]);

  useEffect(() => { loadData(); }, [loadData]);

  // ── Save to DB ──────────────────────────────────────────────────────

  const saveData = useCallback(async () => {
    if (!intakeId || !user) return;
    setSaving(true);

    try {
      // Collect all rows that have a location value
      const allRows: LocationRow[] = [];
      for (const cat of PHYSICAL_DOC_CATEGORIES) {
        const catRows = locationData[cat.id] || [];
        for (const row of catRows) {
          if (row.location.trim() || row.id) {
            allRows.push(row);
          }
        }
      }

      // Delete existing rows and re-insert (simpler than diffing)
      await supabase
        .from('physical_document_locations')
        .delete()
        .eq('intake_id', intakeId)
        .eq('user_id', user.id);

      const toInsert = allRows
        .filter((r) => r.location.trim())
        .map((r) => ({
          intake_id: intakeId,
          user_id: user.id,
          category: r.category,
          sub_item: r.subItem,
          sub_item_ref_table: r.subItemRefTable || null,
          sub_item_ref_id: r.subItemRefId || null,
          location: r.location.trim(),
          notes: r.notes || null,
        }));

      if (toInsert.length > 0) {
        const { error } = await supabase
          .from('physical_document_locations')
          .insert(toInsert);
        if (error) throw error;
      }

      setDirty(false);
      setSnack({ open: true, message: 'Document locations saved.', severity: 'success' });
    } catch (err) {
      console.error('Failed to save physical document locations:', err);
      setSnack({ open: true, message: 'Failed to save. Please try again.', severity: 'error' });
    } finally {
      setSaving(false);
    }
  }, [intakeId, user, locationData]);

  // ── Auto-save on changes (debounced) ────────────────────────────────

  useEffect(() => {
    if (!dirty) return;
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      saveData();
    }, 2000);
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [dirty, saveData]);

  // ── Handlers ────────────────────────────────────────────────────────

  const handleRowsChange = (categoryId: string, rows: LocationRow[]) => {
    setLocationData((prev) => ({ ...prev, [categoryId]: rows }));
    setDirty(true);
  };

  const handleAddCustomRow = (categoryId: string) => {
    setLocationData((prev) => ({
      ...prev,
      [categoryId]: [
        ...(prev[categoryId] || []),
        { category: categoryId, subItem: '', location: '' },
      ],
    }));
  };

  const handleUploadForSubItem = (categoryId: string, subItem: string) => {
    const vaultCatId = VAULT_CATEGORY_XREF[categoryId] || 'other';
    const vaultCat = VAULT_CATEGORY_MAP[vaultCatId];
    setUploadVaultCategoryId(vaultCatId);
    setUploadCategoryLabel(vaultCat?.label || 'Other');
    setUploadModalOpen(true);
  };

  const handleUpload = async (data: DocumentUploadData) => {
    if (!intakeId) throw new Error('No folio selected.');

    const result = await uploadVaultDocument({
      intakeId,
      category: uploadVaultCategoryId,
      documentName: data.documentName,
      description: data.description || undefined,
      documentDate: data.documentDate || undefined,
      expirationDate: data.expirationDate || undefined,
      sensitivity: data.sensitivity,
      file: data.file,
    });

    if (!result.success) throw new Error(result.error || 'Upload failed');

    // Refresh vault docs
    const { data: vDocs } = await supabase
      .from('vault_documents')
      .select('*')
      .eq('intake_id', intakeId);
    setVaultDocs((vDocs || []) as VaultDocumentRecord[]);

    setSnack({ open: true, message: 'Document uploaded successfully.', severity: 'success' });
  };

  // Count filled locations per category
  const getFilledCount = (categoryId: string): number => {
    return (locationData[categoryId] || []).filter((r) => r.location.trim()).length;
  };

  const totalFilled = PHYSICAL_DOC_CATEGORIES.reduce(
    (sum, cat) => sum + getFilledCount(cat.id), 0
  );

  // ── Render ──────────────────────────────────────────────────────────

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress size={28} sx={{ color: folioColors.inkLight }} />
      </Box>
    );
  }

  return (
    <Box>
      <FolioHelpModal open={showHelp} onClose={closeHelp} content={documentStorageLocationHelp} />
      {/* Header bar */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
        <PlaceIcon sx={{ color: '#7b2cbf', fontSize: 24 }} />
        <Typography variant="subtitle1" sx={{ fontWeight: 700, color: folioColors.ink }}>
          Document Storage Locations
        </Typography>
        <FolioHelpButton onClick={openHelp} accentColor="#7b2cbf" />
        {totalFilled > 0 && (
          <Chip
            label={`${totalFilled} location${totalFilled !== 1 ? 's' : ''} recorded`}
            size="small"
            sx={{ bgcolor: '#e8f5e9', color: '#2e7d32', fontWeight: 600, fontSize: '0.72rem', height: 22 }}
          />
        )}
        {dirty && (
          <Chip
            label="Unsaved"
            size="small"
            sx={{ bgcolor: '#fff3e0', color: '#e65100', fontWeight: 600, fontSize: '0.7rem', height: 20 }}
          />
        )}
        {saving && (
          <CircularProgress size={16} sx={{ color: folioColors.inkLight, ml: 0.5 }} />
        )}
      </Box>

      <Typography variant="body2" sx={{ color: folioColors.inkLight, mb: 2.5, maxWidth: 640 }}>
        Record where the physical copies of your important documents are stored. If you've uploaded
        a digital copy to the vault, you'll see a view button next to the item. Otherwise, you can
        upload one directly.
      </Typography>

      {/* Category accordions */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        {PHYSICAL_DOC_CATEGORIES.map((cat) => (
          <CategoryAccordion
            key={cat.id}
            category={cat}
            rows={locationData[cat.id] || []}
            expanded={expandedCategory === cat.id}
            onToggle={() => setExpandedCategory(expandedCategory === cat.id ? null : cat.id)}
            onChange={(rows) => handleRowsChange(cat.id, rows)}
            onAddCustomRow={cat.allowCustomRows ? () => handleAddCustomRow(cat.id) : undefined}
            vaultDocs={vaultDocs}
            onViewVaultDoc={onViewVaultDoc}
            onUploadForSubItem={handleUploadForSubItem}
            filledCount={getFilledCount(cat.id)}
          />
        ))}
      </Box>

      {/* Manual save button */}
      {dirty && (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
          <Button
            variant="contained"
            size="small"
            startIcon={saving ? <CircularProgress size={14} color="inherit" /> : <SaveIcon />}
            onClick={saveData}
            disabled={saving}
            sx={{ bgcolor: folioColors.ink, '&:hover': { bgcolor: '#3d3224' }, textTransform: 'none' }}
          >
            Save Locations
          </Button>
        </Box>
      )}

      {/* Upload modal */}
      <DocumentUploadModal
        open={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        onSave={handleUpload}
        categoryLabel={uploadCategoryLabel}
      />

      {/* Snackbar */}
      <Snackbar
        open={snack.open}
        autoHideDuration={3000}
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

export default DocumentStorageLocationPanel;
