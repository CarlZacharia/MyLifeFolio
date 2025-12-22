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

// Document type definitions
type DocumentType = 'will' | 'trust' | 'financialPOA' | 'healthCarePOA' | 'livingWill';

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
  { key: 'financialPOA', label: 'Financial Power of Attorney', uploadField: 'financialPOAUploadedFiles', dateField: 'financialPOADateSigned', stateField: 'financialPOAStateSigned', hasField: 'hasFinancialPOA' },
  { key: 'healthCarePOA', label: 'Health Care Power of Attorney', uploadField: 'healthCarePOAUploadedFiles', dateField: 'healthCarePOADateSigned', stateField: 'healthCarePOAStateSigned', hasField: 'hasHealthCarePOA' },
  { key: 'livingWill', label: 'Living Will (Advance Directive)', uploadField: 'livingWillUploadedFiles', dateField: 'livingWillDateSigned', stateField: 'livingWillStateSigned', hasField: 'hasLivingWill' },
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
  showSpouse: boolean;
}

const PersonCurrentEstatePlan: React.FC<PersonCurrentEstatePlanProps> = ({
  data,
  onChange,
  onChangeMultiple,
  personLabel,
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

  const getUploadedFiles = (field: keyof CurrentEstatePlanData): string[] => {
    const value = data[field];
    return Array.isArray(value) ? value as string[] : [];
  };

  const handleFilesChange = (files: string[]) => {
    if (activeDocumentType) {
      onChange(activeDocumentType.uploadField, files);
    }
  };

  // Check if any documents are selected
  const hasAnyDocuments = data.hasWill || data.hasTrust || data.hasFinancialPOA || data.hasHealthCarePOA || data.hasLivingWill;

  const renderDocumentSection = (docType: DocumentTypeConfig, index: number) => {
    const isChecked = data[docType.hasField] as boolean;
    const uploadedFiles = getUploadedFiles(docType.uploadField);
    const isTrust = docType.key === 'trust';

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
              {/* Joint Trust option for married couples */}
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
            </Grid>
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
  hasFinancialPOA: false,
  hasHealthCarePOA: false,
  hasLivingWill: false,
  hasNone: false,
  willDateSigned: '',
  willStateSigned: '',
  trustDateSigned: '',
  trustStateSigned: '',
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
