'use client';

import React, { useState } from 'react';
import {
  Box,
  TextField,
  Typography,
  Grid,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Button,
  Paper,
  Chip,
} from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import {
  useFormContext,
  RoyaltyCategory,
  RoyaltyItem,
  PaymentFrequency,
  Transferability,
} from '../lib/FormContext';
import { HelpIcon, VideoHelpIcon } from './FieldWithHelp';
import HelpModal from './HelpModal';
import { folioColors } from './FolioModal';

// Category -> specific types mapping
const ROYALTY_TYPES: Record<string, string[]> = {
  'Intellectual Property Royalties': [
    'Book/written work royalties (traditional publishing)',
    'Music royalties (mechanical, performance, synchronization, print)',
    'Songwriter/composer royalties (PRO distributions — ASCAP, BMI, SESAC)',
    'Music master recording royalties',
    'Film/TV/screenplay royalties',
    'Software licensing royalties',
    'Patent royalties',
    'Trademark licensing fees',
    'Franchise royalties received',
    'Photography/stock image licensing',
    'Art reproduction licensing',
  ],
  'Digital & Online Income Streams': [
    'YouTube channel monetization',
    'Podcast sponsorship/ad revenue',
    'Online course platform royalties (Udemy, Coursera, etc.)',
    'App store revenue (Apple, Google Play)',
    'Ebook royalties (Amazon KDP, etc.)',
    'Stock video/audio licensing',
  ],
  'Natural Resource Rights': [
    'Oil and gas royalties (surface owner or mineral rights holder)',
    'Mineral rights royalties (coal, iron ore, copper, lithium, etc.)',
    'Timber/lumber royalties',
    'Water rights leases',
    'Gravel/quarry extraction rights',
    'Geothermal rights',
    'Wind energy lease payments (land leased to wind farm operators)',
    'Solar energy lease payments (land leased for solar arrays)',
    'Pipeline easement payments',
    'Subsurface rights payments',
  ],
  'Real Property & Land-Based Streams': [
    'Cell tower lease payments',
    'Billboard lease payments',
    'Agricultural land leases (cash rent or crop share)',
    'Grazing rights leases',
    'Hunting/fishing rights leases',
    'Riparian/water access leases',
    'Railroad easement payments',
    'Utility easement payments',
  ],
  'Financial & Investment Streams': [
    'Annuity payments (fixed, variable, indexed)',
    'Structured settlement payments',
    'Lottery/prize installment payments',
    'Bond interest (municipal, corporate, Treasury)',
    'Preferred stock dividends',
    'REIT distributions',
    'Private mortgage/seller-financed note payments received',
    'Trust distributions (income beneficiary)',
    'Inherited IRA required minimum distributions',
  ],
  'Business & Commercial Streams': [
    'Franchise fees received (if franchisor)',
    'Licensing fees for proprietary processes or trade secrets',
    'Non-compete/non-solicitation payment streams',
    'Earn-out payments from business sale',
    'Consulting retainer agreements',
    'Commission overrides (insurance, financial products)',
    'Insurance renewal commissions (book of business)',
  ],
  'Government & Settlement Streams': [
    'Tribal distribution payments',
    'Indian trust land income',
    'Tobacco settlement payments (MSA distributions)',
    'Class action settlement installments',
    'Eminent domain installment payments',
    'Crop insurance payments (recurring)',
    'Conservation/CRP (Conservation Reserve Program) payments',
  ],
};

const CATEGORY_OPTIONS: RoyaltyCategory[] = [
  'Intellectual Property Royalties',
  'Digital & Online Income Streams',
  'Natural Resource Rights',
  'Real Property & Land-Based Streams',
  'Financial & Investment Streams',
  'Business & Commercial Streams',
  'Government & Settlement Streams',
];

const FREQUENCY_OPTIONS: { value: PaymentFrequency; label: string }[] = [
  { value: 'Monthly', label: 'Monthly' },
  { value: 'Quarterly', label: 'Quarterly' },
  { value: 'Semi-Annually', label: 'Semi-Annually' },
  { value: 'Annually', label: 'Annually' },
  { value: 'Weekly', label: 'Weekly' },
  { value: 'Bi-Weekly', label: 'Bi-Weekly' },
  { value: 'Irregular', label: 'Irregular' },
];

const TRANSFERABILITY_OPTIONS: { value: Transferability; label: string }[] = [
  { value: 'Assignable', label: 'Assignable' },
  { value: 'Heritable', label: 'Heritable' },
  { value: 'Assignable & Heritable', label: 'Assignable & Heritable' },
  { value: 'Non-Transferable', label: 'Non-Transferable' },
  { value: 'Unknown', label: 'Unknown' },
];

const EMPTY_ROYALTY: RoyaltyItem = {
  category: '',
  type: '',
  payor: '',
  paymentFrequency: '',
  approximateAmount: '',
  amountPeriod: 'Monthly',
  contractExpirationDate: '',
  underlyingAssetOrRight: '',
  transferability: '',
  documentedInEstatePlan: '',
};

const RoyaltiesSection: React.FC = () => {
  const { formData, updateFormData } = useFormContext();
  const [activeHelpId, setActiveHelpId] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<RoyaltyCategory>('');
  const [selectedType, setSelectedType] = useState('');
  const [editIndex, setEditIndex] = useState<number | null>(null);

  const openHelp = (helpId: number) => setActiveHelpId(helpId);
  const closeHelp = () => setActiveHelpId(null);

  const handleAddRoyalty = () => {
    if (!selectedCategory || !selectedType) return;
    const newRoyalty: RoyaltyItem = {
      ...EMPTY_ROYALTY,
      category: selectedCategory,
      type: selectedType,
    };
    updateFormData({ royalties: [...formData.royalties, newRoyalty] });
    setEditIndex(formData.royalties.length); // Auto-open the new item for editing
    setSelectedType('');
  };

  const handleUpdateRoyalty = (index: number, updates: Partial<RoyaltyItem>) => {
    const newRoyalties = [...formData.royalties];
    newRoyalties[index] = { ...newRoyalties[index], ...updates };
    updateFormData({ royalties: newRoyalties });
  };

  const handleDeleteRoyalty = (index: number) => {
    const newRoyalties = formData.royalties.filter((_, i) => i !== index);
    updateFormData({ royalties: newRoyalties });
    if (editIndex === index) setEditIndex(null);
    else if (editIndex !== null && editIndex > index) setEditIndex(editIndex - 1);
  };

  const availableTypes = selectedCategory ? ROYALTY_TYPES[selectedCategory] || [] : [];

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 600, color: folioColors.ink }}>
          Royalties &amp; Income Streams
        </Typography>
        <VideoHelpIcon helpId={300} onClick={() => openHelp(300)} size="medium" />
      </Box>

      <Typography variant="body1" sx={{ mb: 3, color: 'text.secondary' }}>
        Document any royalties, licensing fees, or recurring income streams you receive. Select a category, then choose the specific type to add it.
      </Typography>

      {/* Category and Type Selection */}
      <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2} alignItems="flex-end">
          <Grid item xs={12} md={5}>
            <FormControl fullWidth variant="outlined" size="small">
              <InputLabel shrink>Category</InputLabel>
              <Select
                label="Category"
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value as RoyaltyCategory);
                  setSelectedType('');
                }}
                notched
                displayEmpty
              >
                <MenuItem value="" disabled>Select a category</MenuItem>
                {CATEGORY_OPTIONS.map((cat) => (
                  <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={5}>
            <FormControl fullWidth variant="outlined" size="small" disabled={!selectedCategory}>
              <InputLabel shrink>Type</InputLabel>
              <Select
                label="Type"
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                notched
                displayEmpty
              >
                <MenuItem value="" disabled>Select a type</MenuItem>
                {availableTypes.map((type) => (
                  <MenuItem key={type} value={type}>{type}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <Button
              variant="contained"
              startIcon={<AddCircleOutlineIcon />}
              onClick={handleAddRoyalty}
              disabled={!selectedCategory || !selectedType}
              fullWidth
              sx={{ height: 40 }}
            >
              Add
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Added Royalties List */}
      {formData.royalties.length === 0 && (
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
          No royalties or income streams added yet. Use the selectors above to add one.
        </Typography>
      )}

      {formData.royalties.map((royalty, index) => (
        <Paper
          key={`royalty-${index}`}
          variant="outlined"
          sx={{
            p: 3,
            mb: 2,
            borderColor: editIndex === index ? 'primary.main' : 'divider',
            borderWidth: editIndex === index ? 2 : 1,
          }}
        >
          {/* Header row */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: editIndex === index ? 2 : 0 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
              <Chip label={royalty.category} size="small" color="primary" variant="outlined" />
              <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                {royalty.type}
              </Typography>
              {royalty.approximateAmount && (
                <Chip
                  label={`${royalty.approximateAmount} / ${royalty.amountPeriod}`}
                  size="small"
                  color="success"
                  variant="outlined"
                />
              )}
            </Box>
            <Box>
              <IconButton
                size="small"
                onClick={() => setEditIndex(editIndex === index ? null : index)}
                color={editIndex === index ? 'primary' : 'default'}
              >
                <EditIcon fontSize="small" />
              </IconButton>
              <IconButton size="small" onClick={() => handleDeleteRoyalty(index)} color="error">
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Box>
          </Box>

          {/* Expanded edit form */}
          {editIndex === index && (
            <>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Payor"
                    value={royalty.payor}
                    onChange={(e) => handleUpdateRoyalty(index, { payor: e.target.value })}
                    variant="outlined"
                    size="small"
                    placeholder="e.g., Penguin Random House, ASCAP"
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={6} md={3}>
                  <FormControl fullWidth variant="outlined" size="small">
                    <InputLabel shrink>Payment Frequency</InputLabel>
                    <Select
                      label="Payment Frequency"
                      value={royalty.paymentFrequency}
                      onChange={(e) => handleUpdateRoyalty(index, { paymentFrequency: e.target.value as PaymentFrequency })}
                      notched
                      displayEmpty
                    >
                      <MenuItem value="" disabled>Select frequency</MenuItem>
                      {FREQUENCY_OPTIONS.map((opt) => (
                        <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={6} md={3}>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <TextField
                      fullWidth
                      label="Approximate Amount"
                      value={royalty.approximateAmount}
                      onChange={(e) => handleUpdateRoyalty(index, { approximateAmount: e.target.value })}
                      variant="outlined"
                      size="small"
                      placeholder="$0.00"
                      InputLabelProps={{ shrink: true }}
                    />
                    <FormControl variant="outlined" size="small" sx={{ minWidth: 110 }}>
                      <InputLabel shrink>Period</InputLabel>
                      <Select
                        label="Period"
                        value={royalty.amountPeriod}
                        onChange={(e) => handleUpdateRoyalty(index, { amountPeriod: e.target.value as 'Monthly' | 'Annually' })}
                        notched
                      >
                        <MenuItem value="Monthly">Monthly</MenuItem>
                        <MenuItem value="Annually">Annually</MenuItem>
                      </Select>
                    </FormControl>
                  </Box>
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Contract/Agreement Expiration Date"
                    value={royalty.contractExpirationDate}
                    onChange={(e) => handleUpdateRoyalty(index, { contractExpirationDate: e.target.value })}
                    variant="outlined"
                    size="small"
                    placeholder="e.g., 12/31/2030 or N/A"
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} md={8}>
                  <TextField
                    fullWidth
                    label="Underlying Asset or Right"
                    value={royalty.underlyingAssetOrRight}
                    onChange={(e) => handleUpdateRoyalty(index, { underlyingAssetOrRight: e.target.value })}
                    variant="outlined"
                    size="small"
                    placeholder="e.g., Patent #US1234567, mineral rights on 40 acres in TX"
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={6} md={4}>
                  <FormControl fullWidth variant="outlined" size="small">
                    <InputLabel shrink>Transferability</InputLabel>
                    <Select
                      label="Transferability"
                      value={royalty.transferability}
                      onChange={(e) => handleUpdateRoyalty(index, { transferability: e.target.value as Transferability })}
                      notched
                      displayEmpty
                    >
                      <MenuItem value="" disabled>Select</MenuItem>
                      {TRANSFERABILITY_OPTIONS.map((opt) => (
                        <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={6} md={4}>
                  <FormControl fullWidth variant="outlined" size="small">
                    <InputLabel shrink>Documented in Estate Plan?</InputLabel>
                    <Select
                      label="Documented in Estate Plan?"
                      value={royalty.documentedInEstatePlan}
                      onChange={(e) => handleUpdateRoyalty(index, { documentedInEstatePlan: e.target.value as 'Yes' | 'No' | 'Unsure' })}
                      notched
                      displayEmpty
                    >
                      <MenuItem value="" disabled>Select</MenuItem>
                      <MenuItem value="Yes">Yes</MenuItem>
                      <MenuItem value="No">No</MenuItem>
                      <MenuItem value="Unsure">Unsure</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </>
          )}
        </Paper>
      ))}

      <HelpModal
        open={activeHelpId !== null}
        onClose={closeHelp}
        helpId={activeHelpId}
      />
    </Box>
  );
};

export default RoyaltiesSection;
