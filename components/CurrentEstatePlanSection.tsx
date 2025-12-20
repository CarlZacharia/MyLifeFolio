'use client';

import React, { useState } from 'react';
import {
  Box,
  TextField,
  Typography,
  Grid,
  FormControl,
  FormLabel,
  Select,
  MenuItem,
  RadioGroup,
  FormControlLabel,
  Radio,
  Checkbox,
  FormGroup,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Tabs,
  Tab,
  Button,
  IconButton,
  Paper,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import PersonIcon from '@mui/icons-material/Person';
import PeopleIcon from '@mui/icons-material/People';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import {
  useFormContext,
  MaritalStatus,
  CurrentEstatePlanData,
  SpecificGift,
  DocumentReviewOption,
} from '../lib/FormContext';
import { VideoHelpIcon, HelpIcon } from './FieldWithHelp';
import HelpModal from './HelpModal';

const SHOW_SPOUSE_STATUSES: MaritalStatus[] = ['Married', 'Second Marriage', 'Domestic Partnership'];

const US_STATES = [
  'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut',
  'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa',
  'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan',
  'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire',
  'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio',
  'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota',
  'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia',
  'Wisconsin', 'Wyoming', 'District of Columbia',
];

const RELATIONSHIP_OPTIONS = [
  'Spouse',
  'Child',
  'Grandchild',
  'Sibling',
  'Parent',
  'Friend',
  'Charity',
  'Other',
];

const emptySpecificGift: SpecificGift = {
  recipientName: '',
  relationship: '',
  description: '',
  notes: '',
};

interface PersonCurrentEstatePlanProps {
  data: CurrentEstatePlanData;
  onChange: (field: keyof CurrentEstatePlanData, value: CurrentEstatePlanData[keyof CurrentEstatePlanData]) => void;
  onChangeMultiple: (updates: Partial<CurrentEstatePlanData>) => void;
  personLabel: string;
  showSpouse: boolean;
  headerColor?: string;
  openHelp: (helpId: number) => void;
}

const PersonCurrentEstatePlan: React.FC<PersonCurrentEstatePlanProps> = ({
  data,
  onChange,
  onChangeMultiple,
  personLabel,
  showSpouse,
  headerColor = '#1a237e',
  openHelp,
}) => {
  const hasAnyDocument = data.hasWill || data.hasTrust || data.hasFinancialPOA || data.hasHealthCarePOA || data.hasLivingWill;

  const handleAddGift = (field: 'willSpecificRealEstateGifts' | 'willSpecificAssetGifts' | 'willGeneralMoneyGifts' | 'trustSpecificRealEstateGifts' | 'trustSpecificAssetGifts' | 'trustGeneralMoneyGifts') => {
    const currentGifts = data[field] as SpecificGift[];
    onChange(field, [...currentGifts, { ...emptySpecificGift }]);
  };

  const handleUpdateGift = (
    field: 'willSpecificRealEstateGifts' | 'willSpecificAssetGifts' | 'willGeneralMoneyGifts' | 'trustSpecificRealEstateGifts' | 'trustSpecificAssetGifts' | 'trustGeneralMoneyGifts',
    index: number,
    giftField: keyof SpecificGift,
    value: string
  ) => {
    const currentGifts = [...(data[field] as SpecificGift[])];
    currentGifts[index] = { ...currentGifts[index], [giftField]: value };
    onChange(field, currentGifts);
  };

  const handleRemoveGift = (
    field: 'willSpecificRealEstateGifts' | 'willSpecificAssetGifts' | 'willGeneralMoneyGifts' | 'trustSpecificRealEstateGifts' | 'trustSpecificAssetGifts' | 'trustGeneralMoneyGifts',
    index: number
  ) => {
    const currentGifts = [...(data[field] as SpecificGift[])];
    currentGifts.splice(index, 1);
    onChange(field, currentGifts);
  };

  const renderGiftSection = (
    title: string,
    field: 'willSpecificRealEstateGifts' | 'willSpecificAssetGifts' | 'willGeneralMoneyGifts' | 'trustSpecificRealEstateGifts' | 'trustSpecificAssetGifts' | 'trustGeneralMoneyGifts',
    descriptionLabel: string,
    helpId: number
  ) => {
    const gifts = data[field] as SpecificGift[];
    return (
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <FormLabel sx={{ fontWeight: 500, color: 'text.primary' }}>{title}</FormLabel>
          <HelpIcon helpId={helpId} onClick={() => openHelp(helpId)} />
        </Box>
        {gifts.map((gift, index) => (
          <Paper key={index} sx={{ p: 2, mb: 2, bgcolor: 'grey.50' }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  label="Recipient Name"
                  value={gift.recipientName}
                  onChange={(e) => handleUpdateGift(field, index, 'recipientName', e.target.value)}
                  size="small"
                />
              </Grid>
              <Grid item xs={12} md={2}>
                <FormControl fullWidth size="small">
                  <Select
                    value={gift.relationship}
                    onChange={(e) => handleUpdateGift(field, index, 'relationship', e.target.value)}
                    displayEmpty
                  >
                    <MenuItem value="">Relationship</MenuItem>
                    {RELATIONSHIP_OPTIONS.map((rel) => (
                      <MenuItem key={rel} value={rel}>{rel}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label={descriptionLabel}
                  value={gift.description}
                  onChange={(e) => handleUpdateGift(field, index, 'description', e.target.value)}
                  size="small"
                />
              </Grid>
              <Grid item xs={12} md={2}>
                <TextField
                  fullWidth
                  label="Notes"
                  value={gift.notes}
                  onChange={(e) => handleUpdateGift(field, index, 'notes', e.target.value)}
                  size="small"
                />
              </Grid>
              <Grid item xs={12} md={1}>
                <IconButton
                  onClick={() => handleRemoveGift(field, index)}
                  color="error"
                  size="small"
                >
                  <DeleteIcon />
                </IconButton>
              </Grid>
            </Grid>
          </Paper>
        ))}
        <Button
          startIcon={<AddIcon />}
          onClick={() => handleAddGift(field)}
          variant="outlined"
          size="small"
        >
          Add {title.replace('Specific Gifts of ', '').replace('General Gifts of ', '')}
        </Button>
      </Box>
    );
  };

  return (
    <Box>
      {/* Section 1: Document Types */}
      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6" sx={{ fontWeight: 500, color: headerColor }}>
            1. Existing Estate Planning Documents
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <FormLabel sx={{ fontWeight: 500, color: 'text.primary' }}>Which of the following documents do you currently have?</FormLabel>
                <HelpIcon helpId={200} onClick={() => openHelp(200)} />
              </Box>
              <FormGroup>
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
            </Grid>

            {hasAnyDocument && (
              <>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <FormLabel sx={{ fontWeight: 500, color: 'text.primary' }}>In which state were these documents prepared?</FormLabel>
                      <HelpIcon helpId={201} onClick={() => openHelp(201)} />
                    </Box>
                    <Select
                      value={data.documentState}
                      onChange={(e) => onChange('documentState', e.target.value)}
                      size="small"
                    >
                      <MenuItem value="">Select State...</MenuItem>
                      {US_STATES.map((state) => (
                        <MenuItem key={state} value={state}>{state}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <FormLabel sx={{ fontWeight: 500, color: 'text.primary' }}>When were these documents signed?</FormLabel>
                    <HelpIcon helpId={202} onClick={() => openHelp(202)} />
                  </Box>
                  <TextField
                    fullWidth
                    type="date"
                    value={data.documentDate}
                    onChange={(e) => onChange('documentDate', e.target.value)}
                    size="small"
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <FormControl component="fieldset">
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <FormLabel sx={{ fontWeight: 500, color: 'text.primary' }}>Would you like to upload your documents or answer questions about them?</FormLabel>
                      <HelpIcon helpId={203} onClick={() => openHelp(203)} />
                    </Box>
                    <RadioGroup
                      row
                      value={data.reviewOption}
                      onChange={(e) => onChange('reviewOption', e.target.value as DocumentReviewOption)}
                    >
                      <FormControlLabel value="Upload" control={<Radio size="small" />} label="Upload Documents" />
                      <FormControlLabel value="Answer Questions" control={<Radio size="small" />} label="Answer Questions" />
                    </RadioGroup>
                  </FormControl>
                </Grid>

                {data.reviewOption === 'Upload' && (
                  <Grid item xs={12}>
                    <Box
                      sx={{
                        border: '2px dashed #ccc',
                        borderRadius: 2,
                        p: 4,
                        textAlign: 'center',
                        bgcolor: 'grey.50',
                      }}
                    >
                      <CloudUploadIcon sx={{ fontSize: 48, color: 'grey.500', mb: 1 }} />
                      <Typography variant="body1" color="text.secondary" gutterBottom>
                        Drag and drop files here, or click to browse
                      </Typography>
                      <Button
                        variant="contained"
                        component="label"
                        startIcon={<CloudUploadIcon />}
                        sx={{ bgcolor: headerColor }}
                      >
                        Upload Documents
                        <input
                          type="file"
                          hidden
                          multiple
                          accept=".pdf,.doc,.docx"
                          onChange={(e) => {
                            const files = e.target.files;
                            if (files) {
                              const fileNames = Array.from(files).map((f) => f.name);
                              onChange('uploadedFiles', [...data.uploadedFiles, ...fileNames]);
                            }
                          }}
                        />
                      </Button>
                      {data.uploadedFiles.length > 0 && (
                        <Box sx={{ mt: 2 }}>
                          <Typography variant="subtitle2" gutterBottom>Uploaded Files:</Typography>
                          {data.uploadedFiles.map((file, index) => (
                            <Box key={index} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                              <Typography variant="body2">{file}</Typography>
                              <IconButton
                                size="small"
                                onClick={() => {
                                  const updated = data.uploadedFiles.filter((_, i) => i !== index);
                                  onChange('uploadedFiles', updated);
                                }}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Box>
                          ))}
                        </Box>
                      )}
                    </Box>
                  </Grid>
                )}
              </>
            )}
          </Grid>
        </AccordionDetails>
      </Accordion>

      {/* Section 2: Will Details */}
      {data.hasWill && data.reviewOption === 'Answer Questions' && (
        <Accordion defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6" sx={{ fontWeight: 500, color: headerColor }}>
              2. Will Details
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="subtitle1" sx={{ fontWeight: 500, mb: 2 }}>
                  Personal Representative (Executor)
                </Typography>
              </Grid>

              <Grid item xs={12} md={4}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <FormLabel sx={{ fontWeight: 500, color: 'text.primary' }}>First Choice Personal Representative</FormLabel>
                  <HelpIcon helpId={204} onClick={() => openHelp(204)} />
                </Box>
                <TextField
                  fullWidth
                  value={data.willPersonalRep}
                  onChange={(e) => onChange('willPersonalRep', e.target.value)}
                  size="small"
                  placeholder="Name of Personal Representative"
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <FormLabel sx={{ fontWeight: 500, color: 'text.primary' }}>First Alternate</FormLabel>
                  <HelpIcon helpId={205} onClick={() => openHelp(205)} />
                </Box>
                <TextField
                  fullWidth
                  value={data.willPersonalRepAlternate1}
                  onChange={(e) => onChange('willPersonalRepAlternate1', e.target.value)}
                  size="small"
                  placeholder="First Alternate"
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <FormLabel sx={{ fontWeight: 500, color: 'text.primary' }}>Second Alternate</FormLabel>
                  <HelpIcon helpId={206} onClick={() => openHelp(206)} />
                </Box>
                <TextField
                  fullWidth
                  value={data.willPersonalRepAlternate2}
                  onChange={(e) => onChange('willPersonalRepAlternate2', e.target.value)}
                  size="small"
                  placeholder="Second Alternate"
                />
              </Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle1" sx={{ fontWeight: 500, mb: 2, mt: 2 }}>
                  Beneficiaries
                </Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <FormLabel sx={{ fontWeight: 500, color: 'text.primary' }}>Primary Beneficiary</FormLabel>
                  <HelpIcon helpId={207} onClick={() => openHelp(207)} />
                </Box>
                <TextField
                  fullWidth
                  value={data.willPrimaryBeneficiary}
                  onChange={(e) => onChange('willPrimaryBeneficiary', e.target.value)}
                  size="small"
                  placeholder="Who is the primary beneficiary?"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <FormLabel sx={{ fontWeight: 500, color: 'text.primary' }}>Secondary Beneficiaries</FormLabel>
                  <HelpIcon helpId={208} onClick={() => openHelp(208)} />
                </Box>
                <TextField
                  fullWidth
                  value={data.willSecondaryBeneficiaries}
                  onChange={(e) => onChange('willSecondaryBeneficiaries', e.target.value)}
                  size="small"
                  placeholder="Who are the secondary beneficiaries?"
                  multiline
                  rows={2}
                />
              </Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle1" sx={{ fontWeight: 500, mb: 2, mt: 2 }}>
                  Specific Gifts
                </Typography>
              </Grid>

              <Grid item xs={12}>
                {renderGiftSection('Specific Gifts of Real Estate', 'willSpecificRealEstateGifts', 'Property Address/Description', 209)}
              </Grid>

              <Grid item xs={12}>
                {renderGiftSection('Specific Gifts of Other Assets', 'willSpecificAssetGifts', 'Asset Description', 210)}
              </Grid>

              <Grid item xs={12}>
                {renderGiftSection('General Gifts of Money', 'willGeneralMoneyGifts', 'Amount', 211)}
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>
      )}

      {/* Section 3: Trust Details */}
      {data.hasTrust && data.reviewOption === 'Answer Questions' && (
        <Accordion defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6" sx={{ fontWeight: 500, color: headerColor }}>
              3. Trust Details
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="subtitle1" sx={{ fontWeight: 500, mb: 2 }}>
                  Trustee
                </Typography>
              </Grid>

              <Grid item xs={12} md={4}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <FormLabel sx={{ fontWeight: 500, color: 'text.primary' }}>First Choice Trustee</FormLabel>
                  <HelpIcon helpId={212} onClick={() => openHelp(212)} />
                </Box>
                <TextField
                  fullWidth
                  value={data.trustTrustee}
                  onChange={(e) => onChange('trustTrustee', e.target.value)}
                  size="small"
                  placeholder="Name of Trustee"
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <FormLabel sx={{ fontWeight: 500, color: 'text.primary' }}>First Alternate Trustee</FormLabel>
                  <HelpIcon helpId={213} onClick={() => openHelp(213)} />
                </Box>
                <TextField
                  fullWidth
                  value={data.trustTrusteeAlternate1}
                  onChange={(e) => onChange('trustTrusteeAlternate1', e.target.value)}
                  size="small"
                  placeholder="First Alternate"
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <FormLabel sx={{ fontWeight: 500, color: 'text.primary' }}>Second Alternate Trustee</FormLabel>
                  <HelpIcon helpId={214} onClick={() => openHelp(214)} />
                </Box>
                <TextField
                  fullWidth
                  value={data.trustTrusteeAlternate2}
                  onChange={(e) => onChange('trustTrusteeAlternate2', e.target.value)}
                  size="small"
                  placeholder="Second Alternate"
                />
              </Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle1" sx={{ fontWeight: 500, mb: 2, mt: 2 }}>
                  Beneficiaries
                </Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <FormLabel sx={{ fontWeight: 500, color: 'text.primary' }}>Primary Beneficiary</FormLabel>
                  <HelpIcon helpId={215} onClick={() => openHelp(215)} />
                </Box>
                <TextField
                  fullWidth
                  value={data.trustPrimaryBeneficiary}
                  onChange={(e) => onChange('trustPrimaryBeneficiary', e.target.value)}
                  size="small"
                  placeholder="Who is the primary beneficiary?"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <FormLabel sx={{ fontWeight: 500, color: 'text.primary' }}>Secondary Beneficiaries</FormLabel>
                  <HelpIcon helpId={216} onClick={() => openHelp(216)} />
                </Box>
                <TextField
                  fullWidth
                  value={data.trustSecondaryBeneficiaries}
                  onChange={(e) => onChange('trustSecondaryBeneficiaries', e.target.value)}
                  size="small"
                  placeholder="Who are the secondary beneficiaries?"
                  multiline
                  rows={2}
                />
              </Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle1" sx={{ fontWeight: 500, mb: 2, mt: 2 }}>
                  Specific Gifts
                </Typography>
              </Grid>

              <Grid item xs={12}>
                {renderGiftSection('Specific Gifts of Real Estate', 'trustSpecificRealEstateGifts', 'Property Address/Description', 217)}
              </Grid>

              <Grid item xs={12}>
                {renderGiftSection('Specific Gifts of Other Assets', 'trustSpecificAssetGifts', 'Asset Description', 218)}
              </Grid>

              <Grid item xs={12}>
                {renderGiftSection('General Gifts of Money', 'trustGeneralMoneyGifts', 'Amount', 219)}
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>
      )}

      {/* Section 4: Financial POA Details */}
      {data.hasFinancialPOA && data.reviewOption === 'Answer Questions' && (
        <Accordion defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6" sx={{ fontWeight: 500, color: headerColor }}>
              4. Financial Power of Attorney Details
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <FormLabel sx={{ fontWeight: 500, color: 'text.primary' }}>First Agent</FormLabel>
                  <HelpIcon helpId={220} onClick={() => openHelp(220)} />
                </Box>
                <TextField
                  fullWidth
                  value={data.financialPOAAgent1}
                  onChange={(e) => onChange('financialPOAAgent1', e.target.value)}
                  size="small"
                  placeholder="Name of First Agent"
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <FormLabel sx={{ fontWeight: 500, color: 'text.primary' }}>Second Agent</FormLabel>
                  <HelpIcon helpId={221} onClick={() => openHelp(221)} />
                </Box>
                <TextField
                  fullWidth
                  value={data.financialPOAAgent2}
                  onChange={(e) => onChange('financialPOAAgent2', e.target.value)}
                  size="small"
                  placeholder="Name of Second Agent"
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <FormLabel sx={{ fontWeight: 500, color: 'text.primary' }}>Third Agent</FormLabel>
                  <HelpIcon helpId={222} onClick={() => openHelp(222)} />
                </Box>
                <TextField
                  fullWidth
                  value={data.financialPOAAgent3}
                  onChange={(e) => onChange('financialPOAAgent3', e.target.value)}
                  size="small"
                  placeholder="Name of Third Agent"
                />
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>
      )}

      {/* Section 5: Health Care POA Details */}
      {data.hasHealthCarePOA && data.reviewOption === 'Answer Questions' && (
        <Accordion defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6" sx={{ fontWeight: 500, color: headerColor }}>
              5. Health Care Power of Attorney Details
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <FormLabel sx={{ fontWeight: 500, color: 'text.primary' }}>First Agent</FormLabel>
                  <HelpIcon helpId={223} onClick={() => openHelp(223)} />
                </Box>
                <TextField
                  fullWidth
                  value={data.healthCarePOAAgent1}
                  onChange={(e) => onChange('healthCarePOAAgent1', e.target.value)}
                  size="small"
                  placeholder="Name of First Agent"
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <FormLabel sx={{ fontWeight: 500, color: 'text.primary' }}>Second Agent</FormLabel>
                  <HelpIcon helpId={224} onClick={() => openHelp(224)} />
                </Box>
                <TextField
                  fullWidth
                  value={data.healthCarePOAAgent2}
                  onChange={(e) => onChange('healthCarePOAAgent2', e.target.value)}
                  size="small"
                  placeholder="Name of Second Agent"
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <FormLabel sx={{ fontWeight: 500, color: 'text.primary' }}>Third Agent</FormLabel>
                  <HelpIcon helpId={225} onClick={() => openHelp(225)} />
                </Box>
                <TextField
                  fullWidth
                  value={data.healthCarePOAAgent3}
                  onChange={(e) => onChange('healthCarePOAAgent3', e.target.value)}
                  size="small"
                  placeholder="Name of Third Agent"
                />
              </Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle1" sx={{ fontWeight: 500, mb: 2, mt: 2 }}>
                  Additional Health Care Directives
                </Typography>
              </Grid>

              <Grid item xs={12} md={4}>
                <FormControl component="fieldset">
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <FormLabel sx={{ fontWeight: 500, color: 'text.primary' }}>Is the Health Care POA HIPAA compliant?</FormLabel>
                    <HelpIcon helpId={226} onClick={() => openHelp(226)} />
                  </Box>
                  <RadioGroup
                    row
                    value={data.isHIPAACompliant ? 'yes' : 'no'}
                    onChange={(e) => onChange('isHIPAACompliant', e.target.value === 'yes')}
                  >
                    <FormControlLabel value="yes" control={<Radio size="small" />} label="Yes" />
                    <FormControlLabel value="no" control={<Radio size="small" />} label="No" />
                  </RadioGroup>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={4}>
                <FormControl component="fieldset">
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <FormLabel sx={{ fontWeight: 500, color: 'text.primary' }}>Do you have a Do Not Resuscitate (DNR) Order?</FormLabel>
                    <HelpIcon helpId={227} onClick={() => openHelp(227)} />
                  </Box>
                  <RadioGroup
                    row
                    value={data.hasDNROrder ? 'yes' : 'no'}
                    onChange={(e) => onChange('hasDNROrder', e.target.value === 'yes')}
                  >
                    <FormControlLabel value="yes" control={<Radio size="small" />} label="Yes" />
                    <FormControlLabel value="no" control={<Radio size="small" />} label="No" />
                  </RadioGroup>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={4}>
                <FormControl component="fieldset">
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <FormLabel sx={{ fontWeight: 500, color: 'text.primary' }}>Do you have a Living Will?</FormLabel>
                    <HelpIcon helpId={228} onClick={() => openHelp(228)} />
                  </Box>
                  <RadioGroup
                    row
                    value={data.hasLivingWillDocument ? 'yes' : 'no'}
                    onChange={(e) => onChange('hasLivingWillDocument', e.target.value === 'yes')}
                  >
                    <FormControlLabel value="yes" control={<Radio size="small" />} label="Yes" />
                    <FormControlLabel value="no" control={<Radio size="small" />} label="No" />
                  </RadioGroup>
                </FormControl>
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>
      )}

      {/* Section 6: Comments */}
      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6" sx={{ fontWeight: 500, color: headerColor }}>
            {data.reviewOption === 'Answer Questions' ? '6. Additional Comments' : '2. Additional Comments'}
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <FormLabel sx={{ fontWeight: 500, color: 'text.primary' }}>
                  Any additional comments or concerns about your current estate plan?
                </FormLabel>
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
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>
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
              showSpouse={showSpouse}
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
              showSpouse={showSpouse}
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
          showSpouse={false}
          headerColor="#1a237e"
          openHelp={openHelp}
        />
      )}

      <HelpModal open={helpOpen} onClose={() => setHelpOpen(false)} helpId={helpId} />
    </Box>
  );
};

export default CurrentEstatePlanSection;
