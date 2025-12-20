'use client';

import React, { useState } from 'react';
import {
  Box,
  TextField,
  Typography,
  Grid,
  FormLabel,
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
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import PeopleIcon from '@mui/icons-material/People';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import {
  useFormContext,
  MaritalStatus,
  CurrentEstatePlanData,
} from '../lib/FormContext';
import { VideoHelpIcon, HelpIcon } from './FieldWithHelp';
import HelpModal from './HelpModal';

const SHOW_SPOUSE_STATUSES: MaritalStatus[] = ['Married', 'Second Marriage', 'Domestic Partnership'];

// Document type definitions
type DocumentType = 'will' | 'trust' | 'financialPOA' | 'healthCarePOA' | 'livingWill';

interface DocumentTypeConfig {
  key: DocumentType;
  label: string;
  uploadField: keyof CurrentEstatePlanData;
}

const DOCUMENT_TYPES: DocumentTypeConfig[] = [
  { key: 'will', label: 'Will', uploadField: 'willUploadedFiles' },
  { key: 'trust', label: 'Trust', uploadField: 'trustUploadedFiles' },
  { key: 'financialPOA', label: 'Financial Power of Attorney', uploadField: 'financialPOAUploadedFiles' },
  { key: 'healthCarePOA', label: 'Health Care Power of Attorney', uploadField: 'healthCarePOAUploadedFiles' },
  { key: 'livingWill', label: 'Living Will', uploadField: 'livingWillUploadedFiles' },
];

// Document Upload Modal
interface DocumentUploadModalProps {
  open: boolean;
  onClose: () => void;
  documentType: string;
  uploadedFiles: string[];
  onFilesChange: (files: string[]) => void;
  headerColor: string;
}

const DocumentUploadModal: React.FC<DocumentUploadModalProps> = ({
  open,
  onClose,
  documentType,
  uploadedFiles,
  onFilesChange,
  headerColor,
}) => {
  const [dragOver, setDragOver] = useState(false);

  const handleFileSelect = (files: FileList | null) => {
    if (files) {
      const fileNames = Array.from(files).map((f) => f.name);
      onFilesChange([...uploadedFiles, ...fileNames]);
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

  const handleRemoveFile = (index: number) => {
    const updated = uploadedFiles.filter((_, i) => i !== index);
    onFilesChange(updated);
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
            cursor: 'pointer',
            mt: 2,
          }}
        >
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
            Accepted formats: PDF, DOC, DOCX, JPG, PNG
          </Typography>
        </Box>

        {uploadedFiles.length > 0 && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 500 }}>
              Uploaded Files ({uploadedFiles.length}):
            </Typography>
            <Paper variant="outlined" sx={{ p: 1 }}>
              {uploadedFiles.map((file, index) => (
                <Box
                  key={index}
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
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AttachFileIcon fontSize="small" color="action" />
                    <Typography variant="body2">{file}</Typography>
                  </Box>
                  <IconButton
                    size="small"
                    onClick={() => handleRemoveFile(index)}
                    color="error"
                  >
                    <DeleteIcon fontSize="small" />
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
  headerColor?: string;
  openHelp: (helpId: number) => void;
}

const PersonCurrentEstatePlan: React.FC<PersonCurrentEstatePlanProps> = ({
  data,
  onChange,
  onChangeMultiple,
  personLabel,
  headerColor = '#1a237e',
  openHelp,
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

  const getUploadedFiles = (field: keyof CurrentEstatePlanData): string[] => {
    const value = data[field];
    return Array.isArray(value) ? value as string[] : [];
  };

  const handleFilesChange = (files: string[]) => {
    if (activeDocumentType) {
      onChange(activeDocumentType.uploadField, files);
    }
  };

  return (
    <Box>
      {/* Document Checkboxes with inline fields */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 500, color: headerColor }}>
            Existing Estate Planning Documents
          </Typography>
          <HelpIcon helpId={200} onClick={() => openHelp(200)} />
        </Box>

        <FormGroup>
          {/* Will Checkbox */}
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={data.hasWill}
                    onChange={(e) => {
                      const updates: Partial<CurrentEstatePlanData> = { hasWill: e.target.checked };
                      if (e.target.checked) updates.hasNone = false;
                      onChangeMultiple(updates);
                    }}
                  />
                }
                label="Will (Last Will and Testament)"
              />
              {data.hasWill && (
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<CloudUploadIcon />}
                  onClick={() => handleOpenUploadModal(DOCUMENT_TYPES[0])}
                  sx={{ borderColor: headerColor, color: headerColor }}
                >
                  Upload{getUploadedFiles('willUploadedFiles').length > 0 && ` (${getUploadedFiles('willUploadedFiles').length})`}
                </Button>
              )}
            </Box>
            <Collapse in={data.hasWill}>
              <Box sx={{ ml: 4, mt: 1, p: 2, bgcolor: 'grey.50', borderRadius: 1, borderLeft: `3px solid ${headerColor}` }}>
                <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 500, color: headerColor }}>
                  Personal Representative (Executor)
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Primary Personal Representative"
                      value={data.willPersonalRep}
                      onChange={(e) => onChange('willPersonalRep', e.target.value)}
                      size="small"
                      placeholder="Name"
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="First Alternate"
                      value={data.willPersonalRepAlternate1}
                      onChange={(e) => onChange('willPersonalRepAlternate1', e.target.value)}
                      size="small"
                      placeholder="Name"
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Second Alternate"
                      value={data.willPersonalRepAlternate2}
                      onChange={(e) => onChange('willPersonalRepAlternate2', e.target.value)}
                      size="small"
                      placeholder="Name"
                    />
                  </Grid>
                </Grid>
              </Box>
            </Collapse>
          </Box>

          {/* Trust Checkbox */}
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={data.hasTrust}
                    onChange={(e) => {
                      const updates: Partial<CurrentEstatePlanData> = { hasTrust: e.target.checked };
                      if (e.target.checked) updates.hasNone = false;
                      onChangeMultiple(updates);
                    }}
                  />
                }
                label="Trust (Revocable Living Trust or Irrevocable Trust)"
              />
              {data.hasTrust && (
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<CloudUploadIcon />}
                  onClick={() => handleOpenUploadModal(DOCUMENT_TYPES[1])}
                  sx={{ borderColor: headerColor, color: headerColor }}
                >
                  Upload{getUploadedFiles('trustUploadedFiles').length > 0 && ` (${getUploadedFiles('trustUploadedFiles').length})`}
                </Button>
              )}
            </Box>
            <Collapse in={data.hasTrust}>
              <Box sx={{ ml: 4, mt: 1, p: 2, bgcolor: 'grey.50', borderRadius: 1, borderLeft: `3px solid ${headerColor}` }}>
                <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 500, color: headerColor }}>
                  Trustee
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Primary Trustee"
                      value={data.trustTrustee}
                      onChange={(e) => onChange('trustTrustee', e.target.value)}
                      size="small"
                      placeholder="Name"
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="First Alternate"
                      value={data.trustTrusteeAlternate1}
                      onChange={(e) => onChange('trustTrusteeAlternate1', e.target.value)}
                      size="small"
                      placeholder="Name"
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Second Alternate"
                      value={data.trustTrusteeAlternate2}
                      onChange={(e) => onChange('trustTrusteeAlternate2', e.target.value)}
                      size="small"
                      placeholder="Name"
                    />
                  </Grid>
                </Grid>
              </Box>
            </Collapse>
          </Box>

          {/* Financial POA Checkbox */}
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={data.hasFinancialPOA}
                    onChange={(e) => {
                      const updates: Partial<CurrentEstatePlanData> = { hasFinancialPOA: e.target.checked };
                      if (e.target.checked) updates.hasNone = false;
                      onChangeMultiple(updates);
                    }}
                  />
                }
                label="Financial Power of Attorney (Durable Power of Attorney)"
              />
              {data.hasFinancialPOA && (
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<CloudUploadIcon />}
                  onClick={() => handleOpenUploadModal(DOCUMENT_TYPES[2])}
                  sx={{ borderColor: headerColor, color: headerColor }}
                >
                  Upload{getUploadedFiles('financialPOAUploadedFiles').length > 0 && ` (${getUploadedFiles('financialPOAUploadedFiles').length})`}
                </Button>
              )}
            </Box>
            <Collapse in={data.hasFinancialPOA}>
              <Box sx={{ ml: 4, mt: 1, p: 2, bgcolor: 'grey.50', borderRadius: 1, borderLeft: `3px solid ${headerColor}` }}>
                <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 500, color: headerColor }}>
                  Financial Power of Attorney Agent
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Primary Agent"
                      value={data.financialPOAAgent1}
                      onChange={(e) => onChange('financialPOAAgent1', e.target.value)}
                      size="small"
                      placeholder="Name"
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="First Alternate"
                      value={data.financialPOAAgent2}
                      onChange={(e) => onChange('financialPOAAgent2', e.target.value)}
                      size="small"
                      placeholder="Name"
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Second Alternate"
                      value={data.financialPOAAgent3}
                      onChange={(e) => onChange('financialPOAAgent3', e.target.value)}
                      size="small"
                      placeholder="Name"
                    />
                  </Grid>
                </Grid>
              </Box>
            </Collapse>
          </Box>

          {/* Health Care POA Checkbox */}
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={data.hasHealthCarePOA}
                    onChange={(e) => {
                      const updates: Partial<CurrentEstatePlanData> = { hasHealthCarePOA: e.target.checked };
                      if (e.target.checked) updates.hasNone = false;
                      onChangeMultiple(updates);
                    }}
                  />
                }
                label="Health Care Power of Attorney (Health Care Surrogate)"
              />
              {data.hasHealthCarePOA && (
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<CloudUploadIcon />}
                  onClick={() => handleOpenUploadModal(DOCUMENT_TYPES[3])}
                  sx={{ borderColor: headerColor, color: headerColor }}
                >
                  Upload{getUploadedFiles('healthCarePOAUploadedFiles').length > 0 && ` (${getUploadedFiles('healthCarePOAUploadedFiles').length})`}
                </Button>
              )}
            </Box>
            <Collapse in={data.hasHealthCarePOA}>
              <Box sx={{ ml: 4, mt: 1, p: 2, bgcolor: 'grey.50', borderRadius: 1, borderLeft: `3px solid ${headerColor}` }}>
                <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 500, color: headerColor }}>
                  Health Care Power of Attorney Agent
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Primary Agent"
                      value={data.healthCarePOAAgent1}
                      onChange={(e) => onChange('healthCarePOAAgent1', e.target.value)}
                      size="small"
                      placeholder="Name"
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="First Alternate"
                      value={data.healthCarePOAAgent2}
                      onChange={(e) => onChange('healthCarePOAAgent2', e.target.value)}
                      size="small"
                      placeholder="Name"
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Second Alternate"
                      value={data.healthCarePOAAgent3}
                      onChange={(e) => onChange('healthCarePOAAgent3', e.target.value)}
                      size="small"
                      placeholder="Name"
                    />
                  </Grid>
                </Grid>
              </Box>
            </Collapse>
          </Box>

          {/* Living Will Checkbox */}
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={data.hasLivingWill}
                    onChange={(e) => {
                      const updates: Partial<CurrentEstatePlanData> = { hasLivingWill: e.target.checked };
                      if (e.target.checked) updates.hasNone = false;
                      onChangeMultiple(updates);
                    }}
                  />
                }
                label="Living Will (Advance Directive)"
              />
              {data.hasLivingWill && (
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<CloudUploadIcon />}
                  onClick={() => handleOpenUploadModal(DOCUMENT_TYPES[4])}
                  sx={{ borderColor: headerColor, color: headerColor }}
                >
                  Upload{getUploadedFiles('livingWillUploadedFiles').length > 0 && ` (${getUploadedFiles('livingWillUploadedFiles').length})`}
                </Button>
              )}
            </Box>
          </Box>

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
            label="None of the above"
          />
        </FormGroup>
      </Paper>

      {/* Additional Comments */}
      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 500, color: headerColor }}>
            Additional Comments
          </Typography>
          <HelpIcon helpId={229} onClick={() => openHelp(229)} />
        </Box>
        <TextField
          fullWidth
          value={data.comments}
          onChange={(e) => onChange('comments', e.target.value)}
          multiline
          rows={4}
          variant="outlined"
          placeholder="Enter any additional information about your existing estate planning documents..."
        />
      </Paper>

      {/* Upload Modal */}
      {activeDocumentType && (
        <DocumentUploadModal
          open={uploadModalOpen}
          onClose={handleCloseUploadModal}
          documentType={activeDocumentType.label}
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
  hasFinancialPOA: false,
  hasHealthCarePOA: false,
  hasLivingWill: false,
  hasNone: false,
  documentState: '',
  documentDate: '',
  reviewOption: '',
  uploadedFiles: [],
  willUploadedFiles: [],
  trustUploadedFiles: [],
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

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 600, color: '#1a237e' }}>
          Current Estate Plan
        </Typography>
        <VideoHelpIcon videoId="current-estate-plan" />
      </Box>

      <Typography variant="body1" sx={{ mb: 3, color: 'text.secondary' }}>
        Tell us about any existing estate planning documents you may have. This information helps us understand
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
              headerColor="#1a237e"
              openHelp={openHelp}
            />
          )}

          {activeTab === 1 && (
            <PersonCurrentEstatePlan
              data={spouseData}
              onChange={handleSpouseChange}
              onChangeMultiple={handleSpouseChangeMultiple}
              personLabel={spouseName}
              headerColor="#2e7d32"
              openHelp={openHelp}
            />
          )}
        </>
      ) : (
        <PersonCurrentEstatePlan
          data={clientData}
          onChange={handleClientChange}
          onChangeMultiple={handleClientChangeMultiple}
          personLabel={clientName}
          headerColor="#1a237e"
          openHelp={openHelp}
        />
      )}

      <HelpModal open={helpOpen} onClose={() => setHelpOpen(false)} helpId={helpId} />
    </Box>
  );
};

export default CurrentEstatePlanSection;
