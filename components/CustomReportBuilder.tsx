'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Button,
  TextField,
  List,
  ListItemButton,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Divider,
  Chip,
  Tooltip,
  Snackbar,
  Alert,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete';
import PreviewIcon from '@mui/icons-material/Visibility';
import AddIcon from '@mui/icons-material/Add';
import SelectAllIcon from '@mui/icons-material/DoneAll';
import DeselectIcon from '@mui/icons-material/RemoveDone';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { folioColors } from './FolioModal';
import {
  REPORT_GROUPS,
  PRESET_REPORTS,
  countSelectedItems,
  countTotalItems,
} from '../lib/reportBuilderConfig';
import {
  SavedReportConfig,
  loadSavedReports,
  saveReportConfig,
  deleteReportConfig,
} from '../lib/savedReportService';
import CustomReportPreview from './CustomReportPreview';

// ─── Jost font style helper ──────────────────────────────────────────────────

const jost = (size: string, weight = 400) => ({
  fontFamily: '"Jost", sans-serif',
  fontSize: size,
  fontWeight: weight,
});

// ─── Main Component ──────────────────────────────────────────────────────────

const CustomReportBuilder: React.FC = () => {
  // Selection state: categoryId → selected item labels
  const [sections, setSections] = useState<Record<string, string[]>>({});
  const [reportName, setReportName] = useState('');
  const [reportDescription, setReportDescription] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  // Saved reports
  const [savedReports, setSavedReports] = useState<SavedReportConfig[]>([]);
  const [loadingReports, setLoadingReports] = useState(true);

  // Preview mode
  const [showPreview, setShowPreview] = useState(false);

  // Snackbar
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  // ── Load saved reports on mount ──
  const refreshSavedReports = useCallback(async () => {
    setLoadingReports(true);
    const reports = await loadSavedReports();
    setSavedReports(reports);
    setLoadingReports(false);
  }, []);

  useEffect(() => {
    refreshSavedReports();
  }, [refreshSavedReports]);

  // ── Selection helpers ──

  const toggleItem = (categoryId: string, item: string) => {
    setSections((prev) => {
      const current = prev[categoryId] || [];
      const next = current.includes(item)
        ? current.filter((i) => i !== item)
        : [...current, item];
      if (next.length === 0) {
        const { [categoryId]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [categoryId]: next };
    });
  };

  const toggleCategory = (categoryId: string, allItems: string[]) => {
    setSections((prev) => {
      const current = prev[categoryId] || [];
      if (current.length === allItems.length) {
        const { [categoryId]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [categoryId]: [...allItems] };
    });
  };

  const selectAll = () => {
    const all: Record<string, string[]> = {};
    for (const group of REPORT_GROUPS) {
      for (const cat of group.categories) {
        all[cat.id] = [...cat.items];
      }
    }
    setSections(all);
  };

  const deselectAll = () => {
    setSections({});
  };

  const clearForm = () => {
    setSections({});
    setReportName('');
    setReportDescription('');
    setEditingId(null);
    setShowPreview(false);
  };

  // ── Load a saved report ──
  const loadReport = (report: SavedReportConfig) => {
    setSections(report.config.sections || {});
    setReportName(report.name);
    setReportDescription(report.description || '');
    setEditingId(report.id);
    setShowPreview(false);
  };

  // ── Load a preset ──
  const loadPreset = (preset: typeof PRESET_REPORTS[number]) => {
    setSections({ ...preset.sections });
    setReportName(preset.name);
    setReportDescription(preset.description);
    setEditingId(null);
    setShowPreview(false);
  };

  // ── Save ──
  const handleSave = async () => {
    if (!reportName.trim()) {
      setSnackbar({ open: true, message: 'Please enter a report name.', severity: 'error' });
      return;
    }
    const result = await saveReportConfig(
      reportName.trim(),
      reportDescription.trim(),
      sections,
      editingId ?? undefined,
    );
    if (result) {
      setEditingId(result.id);
      setSnackbar({ open: true, message: 'Report configuration saved.', severity: 'success' });
      refreshSavedReports();
    } else {
      setSnackbar({ open: true, message: 'Failed to save. Please try again.', severity: 'error' });
    }
  };

  // ── Delete ──
  const handleDelete = async (id: string) => {
    const ok = await deleteReportConfig(id);
    if (ok) {
      if (editingId === id) clearForm();
      setSnackbar({ open: true, message: 'Report deleted.', severity: 'success' });
      refreshSavedReports();
    }
  };

  const selectedCount = countSelectedItems(sections);
  const totalCount = countTotalItems();

  // ── Preview mode ──
  if (showPreview) {
    return (
      <Box>
        <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => setShowPreview(false)}
            sx={{
              ...jost('13px', 500),
              color: folioColors.ink,
              textTransform: 'none',
            }}
          >
            Back to Builder
          </Button>
          <Chip
            label={`${selectedCount} items selected`}
            size="small"
            sx={{ ...jost('11px'), bgcolor: folioColors.cream }}
          />
        </Box>
        <CustomReportPreview reportName={reportName || 'Custom Report'} sections={sections} />
      </Box>
    );
  }

  // ── Builder UI ──
  return (
    <Box sx={{ display: 'flex', gap: 2, minHeight: 600 }}>
      {/* ── Left sidebar: Saved & Preset reports ── */}
      <Paper
        variant="outlined"
        sx={{
          width: '22%',
          minWidth: 200,
          maxWidth: 260,
          flexShrink: 0,
          borderRadius: 2,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Header */}
        <Box
          sx={{
            bgcolor: folioColors.ink,
            color: '#fff',
            px: 2,
            py: 1.5,
          }}
        >
          <Typography sx={{ ...jost('14px', 600), letterSpacing: '0.03em' }}>
            Saved Reports
          </Typography>
        </Box>

        {/* New report button */}
        <Box sx={{ px: 1, pt: 1 }}>
          <Button
            fullWidth
            startIcon={<AddIcon />}
            onClick={clearForm}
            variant="outlined"
            size="small"
            sx={{
              ...jost('12px', 500),
              textTransform: 'none',
              borderColor: folioColors.accent,
              color: folioColors.accent,
              '&:hover': { bgcolor: folioColors.cream, borderColor: folioColors.ink },
            }}
          >
            New Report
          </Button>
        </Box>

        {/* Presets */}
        <Box sx={{ px: 2, pt: 1.5, pb: 0.5 }}>
          <Typography sx={{ ...jost('10px', 600), letterSpacing: '0.12em', textTransform: 'uppercase', color: folioColors.inkFaint }}>
            Quick Start Presets
          </Typography>
        </Box>
        <List dense disablePadding>
          {PRESET_REPORTS.map((preset) => (
            <ListItemButton
              key={preset.id}
              onClick={() => loadPreset(preset)}
              sx={{
                py: 0.75,
                px: 2,
                '&:hover': { bgcolor: folioColors.cream },
              }}
            >
              <AutoAwesomeIcon sx={{ fontSize: 14, mr: 1, color: folioColors.accentWarm }} />
              <ListItemText
                primary={preset.name}
                primaryTypographyProps={{ ...jost('12px', 400), color: folioColors.ink }}
              />
            </ListItemButton>
          ))}
        </List>

        <Divider sx={{ mx: 1, borderColor: folioColors.parchment }} />

        {/* Saved configs */}
        <Box sx={{ px: 2, pt: 1.5, pb: 0.5 }}>
          <Typography sx={{ ...jost('10px', 600), letterSpacing: '0.12em', textTransform: 'uppercase', color: folioColors.inkFaint }}>
            My Saved Reports
          </Typography>
        </Box>
        <List dense disablePadding sx={{ flex: 1, overflowY: 'auto' }}>
          {loadingReports ? (
            <Typography sx={{ px: 2, py: 1, ...jost('12px'), color: folioColors.inkFaint }}>
              Loading...
            </Typography>
          ) : savedReports.length === 0 ? (
            <Typography sx={{ px: 2, py: 1, ...jost('12px'), color: folioColors.inkFaint }}>
              No saved reports yet.
            </Typography>
          ) : (
            savedReports.map((report) => (
              <ListItemButton
                key={report.id}
                selected={editingId === report.id}
                onClick={() => loadReport(report)}
                sx={{
                  py: 0.75,
                  px: 2,
                  '&.Mui-selected': {
                    bgcolor: folioColors.cream,
                    borderLeft: `3px solid ${folioColors.accent}`,
                  },
                  '&:hover': { bgcolor: folioColors.cream },
                }}
              >
                <ListItemText
                  primary={report.name}
                  secondary={report.description}
                  primaryTypographyProps={{ ...jost('12px', editingId === report.id ? 600 : 400) }}
                  secondaryTypographyProps={{ ...jost('10px'), color: folioColors.inkFaint }}
                />
                <ListItemSecondaryAction>
                  <Tooltip title="Delete">
                    <IconButton
                      edge="end"
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(report.id);
                      }}
                    >
                      <DeleteIcon sx={{ fontSize: 16, color: folioColors.inkFaint }} />
                    </IconButton>
                  </Tooltip>
                </ListItemSecondaryAction>
              </ListItemButton>
            ))
          )}
        </List>
      </Paper>

      {/* ── Center: Builder panel ── */}
      <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
        {/* Action bar */}
        <Paper
          variant="outlined"
          sx={{
            p: 2,
            borderRadius: 2,
            display: 'flex',
            gap: 2,
            alignItems: 'flex-end',
            flexWrap: 'wrap',
          }}
        >
          <TextField
            label="Report Name"
            value={reportName}
            onChange={(e) => setReportName(e.target.value)}
            size="small"
            sx={{ flex: 1, minWidth: 200 }}
            InputLabelProps={{ shrink: true }}
            InputProps={{ sx: { ...jost('13px') } }}
          />
          <TextField
            label="Description (optional)"
            value={reportDescription}
            onChange={(e) => setReportDescription(e.target.value)}
            size="small"
            sx={{ flex: 1, minWidth: 200 }}
            InputLabelProps={{ shrink: true }}
            InputProps={{ sx: { ...jost('13px') } }}
          />
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="Select all items">
              <IconButton size="small" onClick={selectAll} sx={{ color: folioColors.accent }}>
                <SelectAllIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Deselect all">
              <IconButton size="small" onClick={deselectAll} sx={{ color: folioColors.inkFaint }}>
                <DeselectIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Button
              variant="outlined"
              startIcon={<SaveIcon />}
              onClick={handleSave}
              size="small"
              sx={{
                ...jost('12px', 500),
                textTransform: 'none',
                borderColor: folioColors.accent,
                color: folioColors.accent,
                '&:hover': { bgcolor: folioColors.cream, borderColor: folioColors.ink },
              }}
            >
              {editingId ? 'Update' : 'Save'}
            </Button>
            <Button
              variant="contained"
              startIcon={<PreviewIcon />}
              onClick={() => setShowPreview(true)}
              disabled={selectedCount === 0}
              size="small"
              sx={{
                ...jost('12px', 600),
                textTransform: 'none',
                bgcolor: folioColors.ink,
                '&:hover': { bgcolor: '#1a1207' },
                '&.Mui-disabled': { bgcolor: folioColors.parchment },
              }}
            >
              Preview Report
            </Button>
          </Box>
        </Paper>

        {/* Selection count chip */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 0.5 }}>
          <Chip
            label={`${selectedCount} of ${totalCount} items selected`}
            size="small"
            sx={{
              ...jost('11px', 500),
              bgcolor: selectedCount > 0 ? folioColors.cream : 'transparent',
              border: `1px solid ${folioColors.parchment}`,
            }}
          />
          {selectedCount > 0 && (
            <Typography sx={{ ...jost('11px'), color: folioColors.inkFaint }}>
              across {Object.keys(sections).filter((k) => sections[k].length > 0).length} categories
            </Typography>
          )}
        </Box>

        {/* Accordion groups */}
        <Box sx={{ flex: 1, overflowY: 'auto' }}>
          {REPORT_GROUPS.map((group) => (
            <Accordion
              key={group.id}
              defaultExpanded={false}
              disableGutters
              sx={{
                border: `1px solid ${folioColors.parchment}`,
                borderRadius: '4px !important',
                mb: 1,
                '&:before': { display: 'none' },
                '&.Mui-expanded': { mb: 1 },
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon sx={{ color: folioColors.inkLight }} />}
                sx={{
                  bgcolor: folioColors.cream,
                  borderRadius: '4px',
                  minHeight: 44,
                  '&.Mui-expanded': {
                    minHeight: 44,
                    borderRadius: '4px 4px 0 0',
                  },
                  '& .MuiAccordionSummary-content': { my: 0.5, alignItems: 'center', gap: 1 },
                }}
              >
                <Typography sx={{ ...jost('14px', 600), color: folioColors.ink }}>
                  {group.label}
                </Typography>
                {(() => {
                  const groupSelected = group.categories.reduce(
                    (sum, c) => sum + (sections[c.id]?.length || 0),
                    0,
                  );
                  const groupTotal = group.categories.reduce(
                    (sum, c) => sum + c.items.length,
                    0,
                  );
                  if (groupSelected > 0) {
                    return (
                      <Chip
                        label={`${groupSelected}/${groupTotal}`}
                        size="small"
                        sx={{
                          ...jost('10px', 500),
                          height: 20,
                          bgcolor: folioColors.accentWarm,
                          color: '#fff',
                        }}
                      />
                    );
                  }
                  return null;
                })()}
              </AccordionSummary>
              <AccordionDetails sx={{ p: 2, pt: 1 }}>
                {group.categories.map((cat) => {
                  const catSelected = sections[cat.id] || [];
                  const allChecked = catSelected.length === cat.items.length;
                  const someChecked = catSelected.length > 0 && !allChecked;

                  return (
                    <Box key={cat.id} sx={{ mb: 2, '&:last-child': { mb: 0 } }}>
                      {/* Category header with select-all */}
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={allChecked}
                            indeterminate={someChecked}
                            onChange={() => toggleCategory(cat.id, cat.items)}
                            size="small"
                            sx={{
                              color: folioColors.accent,
                              '&.Mui-checked': { color: folioColors.accent },
                              '&.MuiCheckbox-indeterminate': { color: folioColors.accentWarm },
                            }}
                          />
                        }
                        label={
                          <Typography sx={{ ...jost('13px', 600), color: folioColors.ink }}>
                            {cat.label}
                            <Typography
                              component="span"
                              sx={{ ...jost('11px'), color: folioColors.inkFaint, ml: 1 }}
                            >
                              ({catSelected.length}/{cat.items.length})
                            </Typography>
                          </Typography>
                        }
                      />

                      {/* Individual items */}
                      <FormGroup sx={{ pl: 4 }}>
                        {cat.items.map((item) => (
                          <FormControlLabel
                            key={item}
                            control={
                              <Checkbox
                                checked={catSelected.includes(item)}
                                onChange={() => toggleItem(cat.id, item)}
                                size="small"
                                sx={{
                                  py: 0.25,
                                  color: folioColors.inkFaint,
                                  '&.Mui-checked': { color: folioColors.accent },
                                }}
                              />
                            }
                            label={
                              <Typography sx={{ ...jost('12px'), color: folioColors.inkLight }}>
                                {item}
                              </Typography>
                            }
                          />
                        ))}
                      </FormGroup>
                    </Box>
                  );
                })}
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>
      </Box>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
          sx={{ ...jost('13px') }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CustomReportBuilder;
