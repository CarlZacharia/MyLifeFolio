'use client';

import React, { useState, useMemo } from 'react';
import {
  Box,
  TextField,
  Typography,
  Grid,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Checkbox,
  Divider,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import {
  useFormContext,
  MaritalStatus,
  SpecificGiftItem,
} from '../lib/FormContext';
import DistributionPlanSection from './DistributionPlanSection';
import { SpecificGiftModal } from './SpecificGiftModal';
import { HelpIcon, VideoHelpIcon } from './FieldWithHelp';
import HelpModal from './HelpModal';

const SHOW_SPOUSE_STATUSES: MaritalStatus[] = ['Married', 'Second Marriage', 'Domestic Partnership'];

// Interface for available beneficiaries
interface AvailableBeneficiary {
  id: string;
  name: string;
  relationship: string;
}

const DispositiveIntentionsSection = () => {
  const { formData, updateFormData } = useFormContext();
  const [specificGiftModalOpen, setSpecificGiftModalOpen] = useState(false);
  const [editingGiftIndex, setEditingGiftIndex] = useState<number | null>(null);
  const [activeHelpId, setActiveHelpId] = useState<number | null>(null);

  const showSpouseInfo = SHOW_SPOUSE_STATUSES.includes(formData.maritalStatus);

  // Check if there are any children from either spouse
  const hasChildren = formData.children.length > 0;

  const openHelp = (helpId: number) => setActiveHelpId(helpId);
  const closeHelp = () => setActiveHelpId(null);

  const handleRadioChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    updateFormData({ [field]: event.target.value === 'yes' });
  };

  const handleChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    updateFormData({ [field]: event.target.value });
  };

  // Get all available beneficiaries for cash gifts
  const availableBeneficiaries: AvailableBeneficiary[] = useMemo(() => {
    const beneficiaries: AvailableBeneficiary[] = [];

    // Add spouse if applicable
    if (showSpouseInfo && formData.spouseName) {
      beneficiaries.push({ id: 'spouse', name: formData.spouseName, relationship: 'Spouse' });
    }

    // Add children
    formData.children.forEach((child, index) => {
      beneficiaries.push({
        id: `child-${index}`,
        name: child.name,
        relationship: child.relationship || 'Child',
      });
    });

    // Add other beneficiaries
    formData.otherBeneficiaries.forEach((ben, index) => {
      beneficiaries.push({
        id: `beneficiary-${index}`,
        name: ben.name,
        relationship: ben.relationship || 'Other',
      });
    });

    // Add charities
    formData.charities.forEach((charity, index) => {
      beneficiaries.push({
        id: `charity-${index}`,
        name: charity.name,
        relationship: 'Charity',
      });
    });

    return beneficiaries;
  }, [formData.children, formData.otherBeneficiaries, formData.charities, formData.spouseName, showSpouseInfo]);

  // Specific Gift handlers
  const handleAddSpecificGift = () => {
    setEditingGiftIndex(null);
    setSpecificGiftModalOpen(true);
  };

  const handleEditSpecificGift = (index: number) => {
    setEditingGiftIndex(index);
    setSpecificGiftModalOpen(true);
  };

  const handleSaveSpecificGift = (gift: SpecificGiftItem) => {
    if (editingGiftIndex !== null) {
      const newGifts = [...formData.specificGifts];
      newGifts[editingGiftIndex] = gift;
      updateFormData({ specificGifts: newGifts });
    } else {
      updateFormData({ specificGifts: [...formData.specificGifts, gift] });
    }
    setSpecificGiftModalOpen(false);
    setEditingGiftIndex(null);
  };

  const handleDeleteSpecificGift = () => {
    if (editingGiftIndex !== null) {
      updateFormData({
        specificGifts: formData.specificGifts.filter((_, i) => i !== editingGiftIndex),
      });
      setSpecificGiftModalOpen(false);
      setEditingGiftIndex(null);
    }
  };

  // Cash Gift to Beneficiary handlers
  const isBeneficiarySelected = (beneficiaryId: string): boolean => {
    return formData.cashGiftsToBeneficiaries.some(g => g.beneficiaryId === beneficiaryId);
  };

  const getCashGiftAmount = (beneficiaryId: string): string => {
    const gift = formData.cashGiftsToBeneficiaries.find(g => g.beneficiaryId === beneficiaryId);
    return gift?.amount || '';
  };

  const handleBeneficiaryToggle = (beneficiary: AvailableBeneficiary) => {
    if (isBeneficiarySelected(beneficiary.id)) {
      // Remove the gift
      updateFormData({
        cashGiftsToBeneficiaries: formData.cashGiftsToBeneficiaries.filter(
          g => g.beneficiaryId !== beneficiary.id
        ),
      });
    } else {
      // Add a new gift with empty amount
      updateFormData({
        cashGiftsToBeneficiaries: [
          ...formData.cashGiftsToBeneficiaries,
          {
            beneficiaryId: beneficiary.id,
            beneficiaryName: beneficiary.name,
            relationship: beneficiary.relationship,
            amount: '',
          },
        ],
      });
    }
  };

  const handleCashGiftAmountChange = (beneficiaryId: string, amount: string) => {
    updateFormData({
      cashGiftsToBeneficiaries: formData.cashGiftsToBeneficiaries.map(g =>
        g.beneficiaryId === beneficiaryId ? { ...g, amount } : g
      ),
    });
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 600, color: '#1a237e' }}>
          NEW PLAN PROVISIONS
        </Typography>
        <VideoHelpIcon helpId={106} onClick={() => openHelp(106)} size="medium" />
      </Box>

      {/* 1. Children/Beneficiaries (or Spouse and Children/Beneficiaries) */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 500 }}>
          1. {showSpouseInfo
            ? (hasChildren ? 'Spouse and Children' : 'Spouse and Beneficiaries')
            : (hasChildren ? 'Children' : 'Beneficiaries')}
        </Typography>
        <HelpIcon helpId={200} onClick={() => openHelp(200)} />
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {showSpouseInfo && (
          <Grid item xs={12}>
            <FormControl component="fieldset">
              <FormLabel component="legend">
                Do you wish to provide primarily for your spouse and secondarily for your {hasChildren ? 'children' : 'beneficiaries'}?
              </FormLabel>
              <RadioGroup
                row
                value={formData.provideForSpouseThenChildren ? 'yes' : 'no'}
                onChange={handleRadioChange('provideForSpouseThenChildren')}
              >
                <FormControlLabel value="yes" control={<Radio />} label="Yes" />
                <FormControlLabel value="no" control={<Radio />} label="No" />
              </RadioGroup>
            </FormControl>
          </Grid>
        )}

        <Grid item xs={12}>
          <FormControl component="fieldset">
            <FormLabel component="legend">
              Do you wish to treat all of your {hasChildren ? 'children' : 'beneficiaries'} equally?
            </FormLabel>
            <RadioGroup
              row
              value={formData.treatAllChildrenEqually ? 'yes' : 'no'}
              onChange={handleRadioChange('treatAllChildrenEqually')}
            >
              <FormControlLabel value="yes" control={<Radio />} label="Yes" />
              <FormControlLabel value="no" control={<Radio />} label="No" />
            </RadioGroup>
          </FormControl>
        </Grid>

        {!formData.treatAllChildrenEqually && (
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="If not, why not?"
              value={formData.childrenEqualityExplanation}
              onChange={handleChange('childrenEqualityExplanation')}
              variant="outlined"
              multiline
              rows={2}
            />
          </Grid>
        )}

        {hasChildren && (
          <>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label={showSpouseInfo
                  ? "After your spouse's death, at what age do you want to distribute to your children?"
                  : "At what age do you want to distribute to your children?"}
                value={formData.distributionAge}
                onChange={handleChange('distributionAge')}
                variant="outlined"
                helperText="e.g., 1/3 at age 25, 1/3 at age 30 and 1/3 at age 35 or immediate"
              />
            </Grid>

            <Grid item xs={12}>
              <FormControl component="fieldset">
                <FormLabel component="legend">
                  If one of your children should predecease you, would you want the share of your deceased child(ren) to pass to their surviving children?
                </FormLabel>
                <RadioGroup
                  row
                  value={formData.childrenPredeceasedBeneficiaries ? 'yes' : 'no'}
                  onChange={handleRadioChange('childrenPredeceasedBeneficiaries')}
                >
                  <FormControlLabel value="yes" control={<Radio />} label="Yes" />
                  <FormControlLabel value="no" control={<Radio />} label="No" />
                </RadioGroup>
              </FormControl>
            </Grid>
          </>
        )}
      </Grid>

      <Divider sx={{ my: 3 }} />

      {/* 2. Specific Gifts */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 500 }}>
          2. Specific Gifts
        </Typography>
        <HelpIcon helpId={201} onClick={() => openHelp(201)} />
      </Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Use this section to leave specific, identified assets to specified individuals.
      </Typography>

      {formData.specificGifts.length > 0 && (
        <TableContainer component={Paper} variant="outlined" sx={{ mb: 2 }}>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                <TableCell sx={{ fontWeight: 600 }}>Recipient</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Relationship</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Item/Description</TableCell>
                <TableCell sx={{ fontWeight: 600, width: 60 }}>Edit</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {formData.specificGifts.map((gift, index) => (
                <TableRow key={index}>
                  <TableCell>{gift.recipientName}</TableCell>
                  <TableCell>{gift.relationship}</TableCell>
                  <TableCell>{gift.description}</TableCell>
                  <TableCell>
                    <IconButton size="small" onClick={() => handleEditSpecificGift(index)}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Button
        variant="outlined"
        startIcon={<AddIcon />}
        onClick={handleAddSpecificGift}
        size="small"
        sx={{ mb: 2 }}
      >
        Add Specific Gift
      </Button>

      <Divider sx={{ my: 3 }} />

      {/* 3. Gifts of Cash */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 500 }}>
          3. Gifts of Cash
        </Typography>
        <HelpIcon helpId={202} onClick={() => openHelp(202)} />
      </Box>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12}>
          <FormControl component="fieldset">
            <FormLabel component="legend">
              Do you desire to make any gifts of cash to anyone?
            </FormLabel>
            <RadioGroup
              row
              value={formData.hasGeneralBequests ? 'yes' : 'no'}
              onChange={handleRadioChange('hasGeneralBequests')}
            >
              <FormControlLabel value="yes" control={<Radio />} label="Yes" />
              <FormControlLabel value="no" control={<Radio />} label="No" />
            </RadioGroup>
          </FormControl>
        </Grid>
      </Grid>

      {formData.hasGeneralBequests && (
        <>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Select beneficiaries to receive cash gifts and enter the amount for each.
          </Typography>

          {availableBeneficiaries.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontStyle: 'italic' }}>
              No beneficiaries available. Please add children, other beneficiaries, or charities in the Beneficiaries section first.
            </Typography>
          ) : (
            <TableContainer component={Paper} variant="outlined" sx={{ mb: 3 }}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                    <TableCell sx={{ fontWeight: 600, width: 60 }}>Select</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Beneficiary</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Relationship</TableCell>
                    <TableCell sx={{ fontWeight: 600, width: 180 }}>Amount</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {availableBeneficiaries.map(ben => {
                    const isSelected = isBeneficiarySelected(ben.id);
                    return (
                      <TableRow key={ben.id}>
                        <TableCell>
                          <Checkbox
                            size="small"
                            checked={isSelected}
                            onChange={() => handleBeneficiaryToggle(ben)}
                          />
                        </TableCell>
                        <TableCell>{ben.name}</TableCell>
                        <TableCell>{ben.relationship}</TableCell>
                        <TableCell>
                          {isSelected && (
                            <TextField
                              size="small"
                              value={getCashGiftAmount(ben.id)}
                              onChange={(e) => handleCashGiftAmountChange(ben.id, e.target.value)}
                              placeholder="e.g., $10,000"
                              sx={{ width: '100%' }}
                            />
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </>
      )}

      <Divider sx={{ my: 4 }} />

      {/* 4. Will/Trust Distribution Plans */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 500 }}>
          4. Will/Trust Distribution Plans
        </Typography>
        <HelpIcon helpId={203} onClick={() => openHelp(203)} />
      </Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Define how your probate and trust assets should be distributed. Assets with designated beneficiaries
        (like retirement accounts and life insurance) pass outside of the Will/Trust.
      </Typography>

      {/* Mirror Plans Option */}
      {showSpouseInfo && (
        <Box sx={{ mb: 3, p: 2, bgcolor: '#e3f2fd', borderRadius: 1 }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={formData.mirrorDistributionPlans}
                onChange={(e) => updateFormData({ mirrorDistributionPlans: e.target.checked })}
              />
            }
            label={
              <Box>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  Mirror Plans
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Check this box if both spouses want identical distribution plans (each leaving to the other first,
                  then to children equally).
                </Typography>
              </Box>
            }
          />
        </Box>
      )}

      {/* Client's Distribution Plan */}
      <DistributionPlanSection
        personType="client"
        personName={formData.name || 'Client'}
        spouseName={showSpouseInfo ? formData.spouseName : undefined}
      />

      {/* Spouse's Distribution Plan */}
      {showSpouseInfo && !formData.mirrorDistributionPlans && (
        <>
          <Divider sx={{ my: 3 }} />
          <DistributionPlanSection
            personType="spouse"
            personName={formData.spouseName || 'Spouse'}
            spouseName={formData.name}
          />
        </>
      )}

      <Divider sx={{ my: 4 }} />

      {/* 5. Comments */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 500 }}>
          5. Comments
        </Typography>
        <HelpIcon helpId={204} onClick={() => openHelp(204)} />
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            value={formData.dispositiveIntentionsComments}
            onChange={handleChange('dispositiveIntentionsComments')}
            variant="outlined"
            multiline
            rows={4}
            placeholder="Any additional comments regarding will/trust provisions"
          />
        </Grid>
      </Grid>

      {/* Specific Gift Modal */}
      <SpecificGiftModal
        open={specificGiftModalOpen}
        onClose={() => {
          setSpecificGiftModalOpen(false);
          setEditingGiftIndex(null);
        }}
        onSave={handleSaveSpecificGift}
        onDelete={editingGiftIndex !== null ? handleDeleteSpecificGift : undefined}
        initialData={editingGiftIndex !== null ? formData.specificGifts[editingGiftIndex] : undefined}
        isEdit={editingGiftIndex !== null}
      />

      {/* Help Modal */}
      <HelpModal
        open={activeHelpId !== null}
        onClose={closeHelp}
        helpId={activeHelpId}
      />
    </Box>
  );
};

export default DispositiveIntentionsSection;
