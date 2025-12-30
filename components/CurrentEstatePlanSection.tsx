'use client';

import React, { useState } from 'react';
import {
  Box,
  TextField,
  Typography,
  Grid,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Tabs,
  Tab,
  Button,
  IconButton,
  Paper,
  Collapse,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  CircularProgress,
  Alert,
  Chip,
  Tooltip,
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import PeopleIcon from '@mui/icons-material/People';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import VisibilityIcon from '@mui/icons-material/Visibility';
import {
  useFormContext,
  MaritalStatus,
  CurrentEstatePlanData,
  UploadedDocumentInfo,
} from '../lib/FormContext';
import { VideoHelpIcon, HelpIcon } from './FieldWithHelp';
import HelpModal from './HelpModal';
import {
  uploadEstatePlanDocuments,
  deleteEstatePlanDocument,
  generateClientFolderName,
  getDownloadUrl,
  PersonType,
  DocumentType,
} from '../lib/supabaseStorage';

const SHOW_SPOUSE_STATUSES: MaritalStatus[] = ['Married', 'Second Marriage', 'Domestic Partnership'];

// US States for dropdown
const US_STATES = [
  'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut',
  'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa',
  'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan',
  'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire',
  'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio',
  'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota',
  'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia',
  'Wisconsin', 'Wyoming', 'District of Columbia'
];

// Document type config interface (uses DocumentType from supabaseStorage)
interface DocumentTypeConfig {
  key: DocumentType;
  label: string;
  uploadField: keyof CurrentEstatePlanData;
  dateField: keyof CurrentEstatePlanData;
  stateField: keyof CurrentEstatePlanData;
  hasField: keyof CurrentEstatePlanData;
}

const DOCUMENT_TYPES: DocumentTypeConfig[] = [
  { key: 'will', label: 'Will (Last Will and Testament)', uploadField: 'willUploadedFiles', dateField: 'willDateSigned', stateField: 'willStateSigned', hasField: 'hasWill' },
  { key: 'trust', label: 'Trust (Revocable Living Trust)', uploadField: 'trustUploadedFiles', dateField: 'trustDateSigned', stateField: 'trustStateSigned', hasField: 'hasTrust' },
  { key: 'irrevocableTrust', label: 'Irrevocable Trust', uploadField: 'irrevocableTrustUploadedFiles', dateField: 'irrevocableTrustDateSigned', stateField: 'trustStateSigned', hasField: 'hasIrrevocableTrust' },
  { key: 'financialPOA', label: 'Financial Power of Attorney', uploadField: 'financialPOAUploadedFiles', dateField: 'financialPOADateSigned', stateField: 'financialPOAStateSigned', hasField: 'hasFinancialPOA' },
  { key: 'healthCarePOA', label: 'Health Care Power of Attorney', uploadField: 'healthCarePOAUploadedFiles', dateField: 'healthCarePOADateSigned', stateField: 'healthCarePOAStateSigned', hasField: 'hasHealthCarePOA' },
  { key: 'livingWill', label: 'Living Will (Advance Directive)', uploadField: 'livingWillUploadedFiles', dateField: 'livingWillDateSigned', stateField: 'livingWillStateSigned', hasField: 'hasLivingWill' },
];

// Common reasons for irrevocable trusts
const IRREVOCABLE_TRUST_REASONS = [
  'Asset Protection',
  'Medicaid Planning',
  'Estate Tax Planning',
  'Special Needs Planning',
  'Life Insurance Trust (ILIT)',
  'Charitable Trust',
  'Generation-Skipping Trust',
  'Qualified Personal Residence Trust (QPRT)',
  'Other',
];

// Inline file chip component for displaying uploaded files
interface InlineFileChipProps {
  file: UploadedDocumentInfo;
  headerColor: string;
  onView: () => void;
  onDelete: () => void;
  isDeleting?: boolean;
}

const InlineFileChip: React.FC<InlineFileChipProps> = ({ file, headerColor, onView, onDelete, isDeleting }) => {
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const sizeText = formatFileSize(file.size);
  const label = sizeText ? `${file.originalName} (${sizeText})` : file.originalName;

  return (
    <Chip
      icon={<AttachFileIcon fontSize="small" />}
      label={label}
      size="small"
      sx={{
        bgcolor: 'white',
        border: '1px solid',
        borderColor: 'divider',
        '& .MuiChip-label': { maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' },
      }}
      onDelete={onDelete}
      deleteIcon={
        isDeleting ? (
          <CircularProgress size={16} />
        ) : (
          <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
            <Tooltip title="View document">
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  onView();
                }}
                sx={{ p: 0.25 }}
              >
                <VisibilityIcon fontSize="small" sx={{ color: headerColor }} />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete document">
              <IconButton size="small" sx={{ p: 0.25 }}>
                <DeleteIcon fontSize="small" color="error" />
              </IconButton>
            </Tooltip>
          </Box>
        )
      }
    />
  );
};

// Document Upload Modal
interface DocumentUploadModalProps {
  open: boolean;
  onClose: () => void;
  documentType: string;
  documentTypeKey: DocumentType;
  personType: PersonType;
  clientFolderName: string;
  uploadedFiles: UploadedDocumentInfo[];
  onFilesChange: (files: UploadedDocumentInfo[]) => void;
  headerColor: string;
}

const DocumentUploadModal: React.FC<DocumentUploadModalProps> = ({
  open,
  onClose,
  documentType,
  documentTypeKey,
  personType,
  clientFolderName,
  uploadedFiles,
  onFilesChange,
  headerColor,
}) => {
  const [dragOver, setDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [deletingFile, setDeletingFile] = useState<string | null>(null);

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setUploadError(null);

    try {
      const result = await uploadEstatePlanDocuments(
        Array.from(files),
        clientFolderName,
        personType,
        documentTypeKey
      );

      if (result.uploaded.length > 0) {
        // Convert UploadedDocumentMetadata to UploadedDocumentInfo
        const newFiles: UploadedDocumentInfo[] = result.uploaded.map((meta) => ({
          name: meta.name,
          originalName: meta.originalName,
          path: meta.path,
          type: meta.type,
          size: meta.size,
          uploadedAt: meta.uploadedAt,
        }));
        onFilesChange([...uploadedFiles, ...newFiles]);
      }

      if (result.errors.length > 0) {
        setUploadError(`Some files failed to upload: ${result.errors.join(', ')}`);
      }
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Failed to upload files');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleRemoveFile = async (index: number) => {
    const fileToRemove = uploadedFiles[index];
    setDeletingFile(fileToRemove.path);

    try {
      const success = await deleteEstatePlanDocument(fileToRemove.path);
      if (success) {
        const updated = uploadedFiles.filter((_, i) => i !== index);
        onFilesChange(updated);
      } else {
        setUploadError('Failed to delete file from storage');
      }
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Failed to delete file');
    } finally {
      setDeletingFile(null);
    }
  };

  const handleDownloadFile = async (file: UploadedDocumentInfo) => {
    try {
      const result = await getDownloadUrl(file.path);
      if (result.success && result.url) {
        window.open(result.url, '_blank');
      }
    } catch (err) {
      console.error('Failed to get download URL:', err);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          bgcolor: headerColor,
          color: 'white',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CloudUploadIcon />
          <Typography variant="h6" component="span">
            Upload {documentType}
          </Typography>
        </Box>
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{ color: 'white' }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ pt: 3 }}>
        {uploadError && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setUploadError(null)}>
            {uploadError}
          </Alert>
        )}

        <Box
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          sx={{
            border: dragOver ? `2px solid ${headerColor}` : '2px dashed #ccc',
            borderRadius: 2,
            p: 4,
            textAlign: 'center',
            bgcolor: dragOver ? 'action.hover' : 'grey.50',
            transition: 'all 0.2s ease',
            cursor: isUploading ? 'wait' : 'pointer',
            mt: 2,
            opacity: isUploading ? 0.7 : 1,
          }}
        >
          {isUploading ? (
            <>
              <CircularProgress size={48} sx={{ mb: 1, color: headerColor }} />
              <Typography variant="body1" color="text.secondary">
                Uploading files...
              </Typography>
            </>
          ) : (
            <>
              <CloudUploadIcon sx={{ fontSize: 48, color: dragOver ? headerColor : 'grey.500', mb: 1 }} />
              <Typography variant="body1" color="text.secondary" gutterBottom>
                Drag and drop your {documentType} document here
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                or
              </Typography>
              <Button
                variant="contained"
                component="label"
                startIcon={<AttachFileIcon />}
                sx={{ bgcolor: headerColor }}
                disabled={isUploading}
              >
                Browse Files
                <input
                  type="file"
                  hidden
                  multiple
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  onChange={(e) => handleFileSelect(e.target.files)}
                />
              </Button>
              <Typography variant="caption" display="block" sx={{ mt: 2, color: 'text.secondary' }}>
                Accepted formats: PDF, DOC, DOCX, JPG, PNG (max 50MB each)
              </Typography>
            </>
          )}
        </Box>

        {uploadedFiles.length > 0 && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 500 }}>
              Uploaded Files ({uploadedFiles.length}):
            </Typography>
            <Paper variant="outlined" sx={{ p: 1 }}>
              {uploadedFiles.map((file, index) => (
                <Box
                  key={file.path}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    py: 0.5,
                    px: 1,
                    borderBottom: index < uploadedFiles.length - 1 ? '1px solid' : 'none',
                    borderColor: 'divider',
                  }}
                >
                  <Box
                    sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1, cursor: 'pointer' }}
                    onClick={() => handleDownloadFile(file)}
                  >
                    <AttachFileIcon fontSize="small" color="action" />
                    <Box>
                      <Typography variant="body2" sx={{ '&:hover': { textDecoration: 'underline' } }}>
                        {file.originalName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {formatFileSize(file.size)}
                      </Typography>
                    </Box>
                  </Box>
                  <IconButton
                    size="small"
                    onClick={() => handleRemoveFile(index)}
                    color="error"
                    disabled={deletingFile === file.path}
                  >
                    {deletingFile === file.path ? (
                      <CircularProgress size={16} />
                    ) : (
                      <DeleteIcon fontSize="small" />
                    )}
                  </IconButton>
                </Box>
              ))}
            </Paper>
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} variant="contained" sx={{ bgcolor: headerColor }}>
          Done
        </Button>
      </DialogActions>
    </Dialog>
  );
};

interface PersonCurrentEstatePlanProps {
  data: CurrentEstatePlanData;
  onChange: (field: keyof CurrentEstatePlanData, value: CurrentEstatePlanData[keyof CurrentEstatePlanData]) => void;
  onChangeMultiple: (updates: Partial<CurrentEstatePlanData>) => void;
  personLabel: string;
  personType: PersonType;
  clientFolderName: string;
  headerColor?: string;
  openHelp: (helpId: number) => void;
  showSpouse: boolean;
}

const PersonCurrentEstatePlan: React.FC<PersonCurrentEstatePlanProps> = ({
  data,
  onChange,
  onChangeMultiple,
  personLabel,
  personType,
  clientFolderName,
  headerColor = '#1a237e',
  openHelp,
  showSpouse,
}) => {
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [activeDocumentType, setActiveDocumentType] = useState<DocumentTypeConfig | null>(null);

  const handleOpenUploadModal = (docType: DocumentTypeConfig) => {
    setActiveDocumentType(docType);
    setUploadModalOpen(true);
  };

  const handleCloseUploadModal = () => {
    setUploadModalOpen(false);
    setActiveDocumentType(null);
  };

  const getUploadedFiles = (field: keyof CurrentEstatePlanData): UploadedDocumentInfo[] => {
    const value = data[field];
    if (!Array.isArray(value)) return [];
    if (value.length === 0) return [];
    // Handle backwards compatibility - old data may have string arrays
    const firstItem = value[0];
    if (typeof firstItem === 'string') {
      // Convert old string format to new format (these won't have paths, just display names)
      return (value as unknown as string[]).map((name) => ({
        name,
        originalName: name,
        path: '',
        type: 'unknown',
        size: 0,
        uploadedAt: '',
      }));
    }
    // Check if it looks like UploadedDocumentInfo (has path property)
    if (typeof firstItem === 'object' && firstItem !== null && 'path' in firstItem) {
      return value as unknown as UploadedDocumentInfo[];
    }
    return [];
  };

  const handleFilesChange = (files: UploadedDocumentInfo[]) => {
    if (activeDocumentType) {
      onChange(activeDocumentType.uploadField, files);
    }
  };

  // State for tracking inline file deletion
  const [deletingFilePath, setDeletingFilePath] = useState<string | null>(null);

  // Handle viewing a file inline
  const handleViewFile = async (file: UploadedDocumentInfo) => {
    if (!file.path) return;
    try {
      const result = await getDownloadUrl(file.path);
      if (result.success && result.url) {
        window.open(result.url, '_blank');
      }
    } catch (err) {
      console.error('Failed to get download URL:', err);
    }
  };

  // Handle deleting a file inline
  const handleDeleteFile = async (docType: DocumentTypeConfig, file: UploadedDocumentInfo) => {
    if (!file.path) return;
    setDeletingFilePath(file.path);
    try {
      const success = await deleteEstatePlanDocument(file.path);
      if (success) {
        const currentFiles = getUploadedFiles(docType.uploadField);
        const updatedFiles = currentFiles.filter((f) => f.path !== file.path);
        onChange(docType.uploadField, updatedFiles);
      }
    } catch (err) {
      console.error('Failed to delete file:', err);
    } finally {
      setDeletingFilePath(null);
    }
  };

  // Check if any documents are selected
  const hasAnyDocuments = data.hasWill || data.hasTrust || data.hasFinancialPOA || data.hasHealthCarePOA || data.hasLivingWill;

  const renderDocumentSection = (docType: DocumentTypeConfig, index: number) => {
    const isChecked = data[docType.hasField] as boolean;
    const uploadedFiles = getUploadedFiles(docType.uploadField);
    const isTrust = docType.key === 'trust';
    const isIrrevocableTrust = docType.key === 'irrevocableTrust';

    return (
      <Box key={docType.key} sx={{ mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={isChecked}
                onChange={(e) => {
                  const updates: Partial<CurrentEstatePlanData> = { [docType.hasField]: e.target.checked };
                  if (e.target.checked) updates.hasNone = false;
                  onChangeMultiple(updates);
                }}
              />
            }
            label={docType.label}
          />
          {isChecked && (
            <Button
              size="small"
              variant="outlined"
              startIcon={<CloudUploadIcon />}
              onClick={() => handleOpenUploadModal(docType)}
              sx={{ borderColor: headerColor, color: headerColor }}
            >
              Upload{uploadedFiles.length > 0 && ` (${uploadedFiles.length})`}
            </Button>
          )}
        </Box>
        <Collapse in={isChecked}>
          <Box sx={{ ml: 4, mt: 1, p: 2, bgcolor: 'grey.50', borderRadius: 1, borderLeft: `3px solid ${headerColor}` }}>
            <Grid container spacing={2} alignItems="center">
              {/* Joint Trust option for married couples - Revocable Trust */}
              {isTrust && showSpouse && (
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={data.isJointTrust}
                        onChange={(e) => onChange('isJointTrust', e.target.checked)}
                      />
                    }
                    label="This is a joint trust with my spouse"
                  />
                </Grid>
              )}
              {/* Trust-specific fields: Name, Date, and State Resided */}
              {isTrust && (
                <>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Name of the Trust"
                      value={data.trustName || ''}
                      onChange={(e) => onChange('trustName', e.target.value)}
                      size="small"
                      placeholder="e.g., The John Smith Revocable Living Trust"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Approximate Date Signed"
                      value={data[docType.dateField] as string || ''}
                      onChange={(e) => onChange(docType.dateField, e.target.value)}
                      size="small"
                      placeholder="e.g., March 2020, 2019"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      select
                      fullWidth
                      label="State Where You Resided When Signed"
                      value={data.trustStateResided || ''}
                      onChange={(e) => onChange('trustStateResided', e.target.value)}
                      size="small"
                    >
                      <MenuItem value="">Select State</MenuItem>
                      {US_STATES.map((state) => (
                        <MenuItem key={state} value={state}>{state}</MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                </>
              )}
              {/* Irrevocable Trust-specific fields */}
              {isIrrevocableTrust && (
                <>
                  {/* Joint Irrevocable Trust option for married couples */}
                  {showSpouse && (
                    <Grid item xs={12}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={data.isJointIrrevocableTrust}
                            onChange={(e) => onChange('isJointIrrevocableTrust', e.target.checked)}
                          />
                        }
                        label="This is a joint irrevocable trust with my spouse"
                      />
                    </Grid>
                  )}
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Name of the Irrevocable Trust"
                      value={data.irrevocableTrustName || ''}
                      onChange={(e) => onChange('irrevocableTrustName', e.target.value)}
                      size="small"
                      placeholder="e.g., The Smith Family Irrevocable Trust"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      select
                      fullWidth
                      label="Reason for Irrevocable Trust"
                      value={data.irrevocableTrustReason || ''}
                      onChange={(e) => onChange('irrevocableTrustReason', e.target.value)}
                      size="small"
                    >
                      <MenuItem value="">Select Reason</MenuItem>
                      {IRREVOCABLE_TRUST_REASONS.map((reason) => (
                        <MenuItem key={reason} value={reason}>{reason}</MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Approximate Date Signed"
                      value={data.irrevocableTrustDateSigned || ''}
                      onChange={(e) => onChange('irrevocableTrustDateSigned', e.target.value)}
                      size="small"
                      placeholder="e.g., March 2020, 2019"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      select
                      fullWidth
                      label="State Where You Resided When Signed"
                      value={data.irrevocableTrustStateResided || ''}
                      onChange={(e) => onChange('irrevocableTrustStateResided', e.target.value)}
                      size="small"
                    >
                      <MenuItem value="">Select State</MenuItem>
                      {US_STATES.map((state) => (
                        <MenuItem key={state} value={state}>{state}</MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                </>
              )}
              {/* Date field for non-trust documents */}
              {!isTrust && !isIrrevocableTrust && (
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Approximate Date Signed"
                    value={data[docType.dateField] as string || ''}
                    onChange={(e) => onChange(docType.dateField, e.target.value)}
                    size="small"
                    placeholder="e.g., March 2020, 2019, 05/15/2018"
                  />
                </Grid>
              )}
            </Grid>

            {/* Inline uploaded files display */}
            {uploadedFiles.length > 0 && (
              <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                <Typography variant="caption" sx={{ fontWeight: 500, color: 'text.secondary', display: 'block', mb: 1 }}>
                  Uploaded Documents:
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {uploadedFiles.map((file) => (
                    <InlineFileChip
                      key={file.path || file.name}
                      file={file}
                      headerColor={headerColor}
                      onView={() => handleViewFile(file)}
                      onDelete={() => handleDeleteFile(docType, file)}
                      isDeleting={deletingFilePath === file.path}
                    />
                  ))}
                </Box>
              </Box>
            )}
          </Box>
        </Collapse>
      </Box>
    );
  };

  return (
    <Box>
      {/* Document Checkboxes with inline fields */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 500, color: headerColor }}>
            Existing Estate Planning Documents
          </Typography>
          <HelpIcon helpId={210} onClick={() => openHelp(210)} />
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Check each document you currently have. You can also upload copies of your documents for our review.
        </Typography>

        {/* Single State Selector for all documents */}
        <Box sx={{ mb: 3 }}>
          <TextField
            select
            label="State Where Documents Were Signed"
            value={data.documentState || ''}
            onChange={(e) => onChange('documentState', e.target.value)}
            size="small"
            sx={{ minWidth: 280 }}
          >
            <MenuItem value="">Select State</MenuItem>
            {US_STATES.map((state) => (
              <MenuItem key={state} value={state}>{state}</MenuItem>
            ))}
          </TextField>
        </Box>

        <FormGroup>
          {DOCUMENT_TYPES.map((docType, index) => renderDocumentSection(docType, index))}

          {/* None Checkbox */}
          <FormControlLabel
            control={
              <Checkbox
                checked={data.hasNone}
                onChange={(e) => {
                  if (e.target.checked) {
                    onChangeMultiple({
                      hasNone: true,
                      hasWill: false,
                      hasTrust: false,
                      isJointTrust: false,
                      hasIrrevocableTrust: false,
                      isJointIrrevocableTrust: false,
                      hasFinancialPOA: false,
                      hasHealthCarePOA: false,
                      hasLivingWill: false,
                    });
                  } else {
                    onChangeMultiple({ hasNone: false });
                  }
                }}
              />
            }
            label="I do not have any existing estate planning documents"
          />
        </FormGroup>
      </Paper>

      {/* Additional Comments */}
      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 500, color: headerColor }}>
            Additional Comments
          </Typography>
          <HelpIcon helpId={211} onClick={() => openHelp(211)} />
        </Box>
        <TextField
          fullWidth
          value={data.comments}
          onChange={(e) => onChange('comments', e.target.value)}
          multiline
          rows={4}
          variant="outlined"
          placeholder="Any additional information about your existing documents that would be helpful for us to know..."
        />
      </Paper>

      {/* Upload Modal */}
      {activeDocumentType && (
        <DocumentUploadModal
          open={uploadModalOpen}
          onClose={handleCloseUploadModal}
          documentType={activeDocumentType.label}
          documentTypeKey={activeDocumentType.key}
          personType={personType}
          clientFolderName={clientFolderName}
          uploadedFiles={getUploadedFiles(activeDocumentType.uploadField)}
          onFilesChange={handleFilesChange}
          headerColor={headerColor}
        />
      )}
    </Box>
  );
};

// Default empty estate plan data for initialization
const getDefaultEstatePlanData = (): CurrentEstatePlanData => ({
  hasWill: false,
  hasTrust: false,
  isJointTrust: false,
  hasIrrevocableTrust: false,
  isJointIrrevocableTrust: false,
  hasFinancialPOA: false,
  hasHealthCarePOA: false,
  hasLivingWill: false,
  hasNone: false,
  willDateSigned: '',
  willStateSigned: '',
  trustDateSigned: '',
  trustStateSigned: '',
  trustName: '',
  trustStateResided: '',
  irrevocableTrustName: '',
  irrevocableTrustDateSigned: '',
  irrevocableTrustStateResided: '',
  irrevocableTrustReason: '',
  financialPOADateSigned: '',
  financialPOAStateSigned: '',
  healthCarePOADateSigned: '',
  healthCarePOAStateSigned: '',
  livingWillDateSigned: '',
  livingWillStateSigned: '',
  documentState: '',
  documentDate: '',
  reviewOption: '',
  uploadedFiles: [],
  willUploadedFiles: [],
  trustUploadedFiles: [],
  irrevocableTrustUploadedFiles: [],
  financialPOAUploadedFiles: [],
  healthCarePOAUploadedFiles: [],
  livingWillUploadedFiles: [],
  willPersonalRep: '',
  willPersonalRepAlternate1: '',
  willPersonalRepAlternate2: '',
  willPrimaryBeneficiary: '',
  willSecondaryBeneficiaries: '',
  willSpecificRealEstateGifts: [],
  willSpecificAssetGifts: [],
  willGeneralMoneyGifts: [],
  trustTrustee: '',
  trustTrusteeAlternate1: '',
  trustTrusteeAlternate2: '',
  trustPrimaryBeneficiary: '',
  trustSecondaryBeneficiaries: '',
  trustSpecificRealEstateGifts: [],
  trustSpecificAssetGifts: [],
  trustGeneralMoneyGifts: [],
  financialPOAAgent1: '',
  financialPOAAgent2: '',
  financialPOAAgent3: '',
  healthCarePOAAgent1: '',
  healthCarePOAAgent2: '',
  healthCarePOAAgent3: '',
  isHIPAACompliant: false,
  hasDNROrder: false,
  hasLivingWillDocument: false,
  comments: '',
});

const CurrentEstatePlanSection: React.FC = () => {
  const { formData, updateFormData } = useFormContext();
  const [activeTab, setActiveTab] = useState(0);
  const [helpOpen, setHelpOpen] = useState(false);
  const [helpId, setHelpId] = useState<number | null>(null);

  const showSpouse = SHOW_SPOUSE_STATUSES.includes(formData.maritalStatus);

  // Ensure we have valid data objects (handles legacy localStorage without these fields)
  const clientData = formData.clientCurrentEstatePlan || getDefaultEstatePlanData();
  const spouseData = formData.spouseCurrentEstatePlan || getDefaultEstatePlanData();

  const openHelp = (id: number) => {
    setHelpId(id);
    setHelpOpen(true);
  };

  const handleClientChange = (field: keyof CurrentEstatePlanData, value: CurrentEstatePlanData[keyof CurrentEstatePlanData]) => {
    const newData = {
      ...getDefaultEstatePlanData(),
      ...formData.clientCurrentEstatePlan,
      [field]: value,
    };
    updateFormData({
      clientCurrentEstatePlan: newData,
    });
  };

  const handleClientChangeMultiple = (updates: Partial<CurrentEstatePlanData>) => {
    const newData = {
      ...getDefaultEstatePlanData(),
      ...formData.clientCurrentEstatePlan,
      ...updates,
    };
    updateFormData({
      clientCurrentEstatePlan: newData,
    });
  };

  const handleSpouseChange = (field: keyof CurrentEstatePlanData, value: CurrentEstatePlanData[keyof CurrentEstatePlanData]) => {
    updateFormData({
      spouseCurrentEstatePlan: {
        ...getDefaultEstatePlanData(),
        ...formData.spouseCurrentEstatePlan,
        [field]: value,
      },
    });
  };

  const handleSpouseChangeMultiple = (updates: Partial<CurrentEstatePlanData>) => {
    updateFormData({
      spouseCurrentEstatePlan: {
        ...getDefaultEstatePlanData(),
        ...formData.spouseCurrentEstatePlan,
        ...updates,
      },
    });
  };

  const clientName = formData.name || 'Client';
  const spouseName = formData.spouseName || 'Spouse';

  // Generate the client folder name for storage
  const clientFolderName = generateClientFolderName(clientName);

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 600, color: '#1a237e' }}>
          Current Estate Plan
        </Typography>
        <VideoHelpIcon helpId={209} onClick={() => openHelp(209)} />
      </Box>

      <Typography variant="body1" sx={{ mb: 3, color: 'text.secondary' }}>
        Tell us about any existing estate planning documents you may have. This helps us understand
        your current situation and identify any updates that may be needed.
      </Typography>

      {showSpouse ? (
        <>
          <Tabs
            value={activeTab}
            onChange={(_, newValue) => setActiveTab(newValue)}
            sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}
          >
            <Tab
              icon={<PersonIcon />}
              iconPosition="start"
              label={clientName}
              sx={{
                color: activeTab === 0 ? '#1a237e' : 'text.secondary',
                '&.Mui-selected': { color: '#1a237e' },
              }}
            />
            <Tab
              icon={<PeopleIcon />}
              iconPosition="start"
              label={spouseName}
              sx={{
                color: activeTab === 1 ? '#2e7d32' : 'text.secondary',
                '&.Mui-selected': { color: '#2e7d32' },
              }}
            />
          </Tabs>

          {activeTab === 0 && (
            <PersonCurrentEstatePlan
              data={clientData}
              onChange={handleClientChange}
              onChangeMultiple={handleClientChangeMultiple}
              personLabel={clientName}
              personType="client"
              clientFolderName={clientFolderName}
              headerColor="#1a237e"
              openHelp={openHelp}
              showSpouse={showSpouse}
            />
          )}

          {activeTab === 1 && (
            <PersonCurrentEstatePlan
              data={spouseData}
              onChange={handleSpouseChange}
              onChangeMultiple={handleSpouseChangeMultiple}
              personLabel={spouseName}
              personType="spouse"
              clientFolderName={clientFolderName}
              headerColor="#2e7d32"
              openHelp={openHelp}
              showSpouse={showSpouse}
            />
          )}
        </>
      ) : (
        <PersonCurrentEstatePlan
          data={clientData}
          onChange={handleClientChange}
          onChangeMultiple={handleClientChangeMultiple}
          personLabel={clientName}
          personType="client"
          clientFolderName={clientFolderName}
          headerColor="#1a237e"
          openHelp={openHelp}
          showSpouse={showSpouse}
        />
      )}

      <HelpModal open={helpOpen} onClose={() => setHelpOpen(false)} helpId={helpId} />
    </Box>
  );
};

export default CurrentEstatePlanSection;
