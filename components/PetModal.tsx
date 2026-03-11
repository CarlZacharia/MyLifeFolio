'use client';

import React, { useState, useEffect } from 'react';
import {
  TextField,
  Grid,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Select,
  MenuItem,
  InputLabel,
  Box,
  Divider,
  Typography,
} from '@mui/material';
import FolioModal, {
  folioTextFieldSx,
  folioColors,
  FolioCancelButton,
  FolioSaveButton,
  FolioDeleteButton,
  FolioFieldFade,
  useFolioFieldAnimation,
} from './FolioModal';
import { PetData } from '../lib/FormContext';
import PhoneInput from './PhoneInput';

const PET_TYPES = ['Dog', 'Cat', 'Bird', 'Fish', 'Reptile', 'Horse', 'Rabbit', 'Other'];
const PET_SEX_OPTIONS = ['Male', 'Female', 'Unknown'];

const createEmptyPet = (): PetData => ({
  petName: '',
  petType: '',
  petTypeOther: '',
  breed: '',
  age: '',
  weight: '',
  color: '',
  sex: '',
  spayedNeutered: false,
  microchipped: false,
  microchipNumber: '',
  registrationNumber: '',
  vetName: '',
  vetClinic: '',
  vetPhone: '',
  vetAddress: '',
  medications: '',
  allergies: '',
  medicalConditions: '',
  vaccinesDue: '',
  specialMedicalInstructions: '',
  feedingSchedule: '',
  foodBrand: '',
  foodAmount: '',
  dietaryRestrictions: '',
  exerciseNeeds: '',
  groomingNeeds: '',
  sleepingArrangements: '',
  temperament: '',
  fears: '',
  triggers: '',
  socialWithPeople: '',
  socialWithAnimals: '',
  trainingLevel: '',
  specialCommands: '',
  preferredCaretaker: '',
  alternateCaretaker: '',
  caretakerInstructions: '',
  keepWithOtherPets: false,
  keepWithOtherPetsDetails: '',
  neverPlaceWith: '',
  rehomingPreferences: '',
  monthlyCareBudget: '',
  petInsurance: false,
  petInsuranceCompany: '',
  petInsurancePolicyNumber: '',
  petTrustFunding: '',
  petTrustDetails: '',
  emergencyContact: '',
  emergencyContactPhone: '',
  emergencyVetClinic: '',
  emergencyVetPhone: '',
  additionalNotes: '',
});

interface PetModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: PetData) => void;
  onDelete?: () => void;
  initialData?: PetData;
  isEdit: boolean;
}

const SectionHeader: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Typography
    variant="subtitle1"
    sx={{
      fontFamily: '"Jost", sans-serif',
      fontWeight: 600,
      fontSize: '14px',
      letterSpacing: '0.08em',
      textTransform: 'uppercase',
      color: folioColors.accent,
      mb: 1.5,
    }}
  >
    {children}
  </Typography>
);

const PetModal: React.FC<PetModalProps> = ({
  open,
  onClose,
  onSave,
  onDelete,
  initialData,
  isEdit,
}) => {
  const [formData, setFormData] = useState<PetData>(createEmptyPet());
  const fieldsVisible = useFolioFieldAnimation(open);

  useEffect(() => {
    if (open) {
      setFormData(initialData || createEmptyPet());
    }
  }, [open, initialData]);

  const handleChange = (field: keyof PetData) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | { target: { value: string } }
  ) => {
    setFormData((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleRadioChange = (field: keyof PetData) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [field]: event.target.value === 'yes' }));
  };

  const handleSave = () => {
    onSave(formData);
    onClose();
  };

  const radioSx = { color: folioColors.inkFaint, '&.Mui-checked': { color: folioColors.accent } };
  const radioLabelSx = { '& .MuiFormControlLabel-label': { fontFamily: '"Jost", sans-serif', fontSize: '14px', color: folioColors.ink } };
  const legendSx = { fontFamily: '"Jost", sans-serif', fontSize: '0.875rem', color: folioColors.inkLight };

  return (
    <FolioModal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Edit Pet' : 'Add Pet'}
      eyebrow="My Life Folio — Pet Care"
      maxWidth="lg"
      footer={
        <>
          <Box>
            {isEdit && onDelete && (
              <FolioDeleteButton onClick={onDelete} />
            )}
          </Box>
          <Box sx={{ display: 'flex', gap: 1.5 }}>
            <FolioCancelButton onClick={onClose} />
            <FolioSaveButton onClick={handleSave} disabled={!formData.petName}>
              {isEdit ? 'Save Changes' : 'Save'}
            </FolioSaveButton>
          </Box>
        </>
      }
    >
      {/* Section 1: Basic Pet Information */}
      <FolioFieldFade visible={fieldsVisible} index={0}>
        <SectionHeader>Basic Pet Information</SectionHeader>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              size="small"
              label="Pet Name"
              InputLabelProps={{ shrink: true }}
              value={formData.petName}
              onChange={handleChange('petName')}
              required
              sx={{ ...folioTextFieldSx }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small" sx={{ ...folioTextFieldSx }}>
              <InputLabel shrink>Type of Pet</InputLabel>
              <Select
                label="Type of Pet"
                notched
                value={formData.petType}
                onChange={(e) => setFormData((prev) => ({ ...prev, petType: e.target.value }))}
                displayEmpty
              >
                <MenuItem value="">Select...</MenuItem>
                {PET_TYPES.map((type) => (
                  <MenuItem key={type} value={type}>{type}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          {formData.petType === 'Other' && (
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                size="small"
                label="Specify Type"
                InputLabelProps={{ shrink: true }}
                value={formData.petTypeOther}
                onChange={handleChange('petTypeOther')}
                sx={{ ...folioTextFieldSx }}
              />
            </Grid>
          )}
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              size="small"
              label="Breed"
              InputLabelProps={{ shrink: true }}
              value={formData.breed}
              onChange={handleChange('breed')}
              sx={{ ...folioTextFieldSx }}
            />
          </Grid>
          <Grid item xs={6} sm={3} md={2}>
            <TextField
              fullWidth
              size="small"
              label="Age"
              InputLabelProps={{ shrink: true }}
              value={formData.age}
              onChange={handleChange('age')}
              sx={{ ...folioTextFieldSx }}
            />
          </Grid>
          <Grid item xs={6} sm={3} md={2}>
            <TextField
              fullWidth
              size="small"
              label="Weight"
              InputLabelProps={{ shrink: true }}
              value={formData.weight}
              onChange={handleChange('weight')}
              sx={{ ...folioTextFieldSx }}
            />
          </Grid>
          <Grid item xs={6} sm={3} md={2}>
            <TextField
              fullWidth
              size="small"
              label="Color/Markings"
              InputLabelProps={{ shrink: true }}
              value={formData.color}
              onChange={handleChange('color')}
              sx={{ ...folioTextFieldSx }}
            />
          </Grid>
          <Grid item xs={6} sm={3} md={2}>
            <FormControl fullWidth size="small" sx={{ ...folioTextFieldSx }}>
              <InputLabel shrink>Sex</InputLabel>
              <Select
                label="Sex"
                notched
                value={formData.sex}
                onChange={(e) => setFormData((prev) => ({ ...prev, sex: e.target.value }))}
                displayEmpty
              >
                <MenuItem value="">Select...</MenuItem>
                {PET_SEX_OPTIONS.map((opt) => (
                  <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6} sm={3}>
            <FormControl component="fieldset">
              <FormLabel component="legend" sx={legendSx}>Spayed/Neutered?</FormLabel>
              <RadioGroup
                row
                value={formData.spayedNeutered ? 'yes' : 'no'}
                onChange={handleRadioChange('spayedNeutered')}
              >
                <FormControlLabel value="yes" control={<Radio size="small" sx={radioSx} />} label="Yes" sx={radioLabelSx} />
                <FormControlLabel value="no" control={<Radio size="small" sx={radioSx} />} label="No" sx={radioLabelSx} />
              </RadioGroup>
            </FormControl>
          </Grid>
          <Grid item xs={6} sm={3}>
            <FormControl component="fieldset">
              <FormLabel component="legend" sx={legendSx}>Microchipped?</FormLabel>
              <RadioGroup
                row
                value={formData.microchipped ? 'yes' : 'no'}
                onChange={handleRadioChange('microchipped')}
              >
                <FormControlLabel value="yes" control={<Radio size="small" sx={radioSx} />} label="Yes" sx={radioLabelSx} />
                <FormControlLabel value="no" control={<Radio size="small" sx={radioSx} />} label="No" sx={radioLabelSx} />
              </RadioGroup>
            </FormControl>
          </Grid>
          {formData.microchipped && (
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                size="small"
                label="Microchip Number"
                InputLabelProps={{ shrink: true }}
                value={formData.microchipNumber}
                onChange={handleChange('microchipNumber')}
                sx={{ ...folioTextFieldSx }}
              />
            </Grid>
          )}
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              size="small"
              label="Registration Number"
              InputLabelProps={{ shrink: true }}
              value={formData.registrationNumber}
              onChange={handleChange('registrationNumber')}
              sx={{ ...folioTextFieldSx }}
            />
          </Grid>
        </Grid>
      </FolioFieldFade>

      <Divider sx={{ my: 2.5, borderColor: folioColors.parchment }} />

      {/* Section 2: Veterinary Care */}
      <FolioFieldFade visible={fieldsVisible} index={1}>
        <SectionHeader>Veterinary Care</SectionHeader>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              size="small"
              label="Veterinarian Name"
              InputLabelProps={{ shrink: true }}
              value={formData.vetName}
              onChange={handleChange('vetName')}
              sx={{ ...folioTextFieldSx }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              size="small"
              label="Clinic Name"
              InputLabelProps={{ shrink: true }}
              value={formData.vetClinic}
              onChange={handleChange('vetClinic')}
              sx={{ ...folioTextFieldSx }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <PhoneInput
              fullWidth
              size="small"
              label="Vet Phone"
              InputLabelProps={{ shrink: true }}
              value={formData.vetPhone}
              onChange={(e) => setFormData((prev) => ({ ...prev, vetPhone: e.target.value }))}
              name="vetPhone"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              size="small"
              label="Vet Address"
              InputLabelProps={{ shrink: true }}
              value={formData.vetAddress}
              onChange={handleChange('vetAddress')}
              sx={{ ...folioTextFieldSx }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              size="small"
              label="Current Medications"
              InputLabelProps={{ shrink: true }}
              value={formData.medications}
              onChange={handleChange('medications')}
              multiline
              rows={2}
              placeholder="List medications, dosages, and frequency"
              sx={{ ...folioTextFieldSx }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              size="small"
              label="Allergies"
              InputLabelProps={{ shrink: true }}
              value={formData.allergies}
              onChange={handleChange('allergies')}
              multiline
              rows={2}
              placeholder="Food, medication, or environmental allergies"
              sx={{ ...folioTextFieldSx }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              size="small"
              label="Medical Conditions"
              InputLabelProps={{ shrink: true }}
              value={formData.medicalConditions}
              onChange={handleChange('medicalConditions')}
              multiline
              rows={2}
              sx={{ ...folioTextFieldSx }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              size="small"
              label="Vaccines Due"
              InputLabelProps={{ shrink: true }}
              value={formData.vaccinesDue}
              onChange={handleChange('vaccinesDue')}
              placeholder="Upcoming vaccine schedule"
              sx={{ ...folioTextFieldSx }}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              size="small"
              label="Special Medical Instructions"
              InputLabelProps={{ shrink: true }}
              value={formData.specialMedicalInstructions}
              onChange={handleChange('specialMedicalInstructions')}
              multiline
              rows={2}
              sx={{ ...folioTextFieldSx }}
            />
          </Grid>
        </Grid>
      </FolioFieldFade>

      <Divider sx={{ my: 2.5, borderColor: folioColors.parchment }} />

      {/* Section 3: Daily Care Instructions */}
      <FolioFieldFade visible={fieldsVisible} index={2}>
        <SectionHeader>Daily Care Instructions</SectionHeader>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              size="small"
              label="Feeding Schedule"
              InputLabelProps={{ shrink: true }}
              value={formData.feedingSchedule}
              onChange={handleChange('feedingSchedule')}
              placeholder="e.g., Twice daily - 7am and 5pm"
              sx={{ ...folioTextFieldSx }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              size="small"
              label="Food Brand/Type"
              InputLabelProps={{ shrink: true }}
              value={formData.foodBrand}
              onChange={handleChange('foodBrand')}
              sx={{ ...folioTextFieldSx }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              size="small"
              label="Food Amount"
              InputLabelProps={{ shrink: true }}
              value={formData.foodAmount}
              onChange={handleChange('foodAmount')}
              placeholder="e.g., 1 cup per meal"
              sx={{ ...folioTextFieldSx }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              size="small"
              label="Dietary Restrictions"
              InputLabelProps={{ shrink: true }}
              value={formData.dietaryRestrictions}
              onChange={handleChange('dietaryRestrictions')}
              sx={{ ...folioTextFieldSx }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              size="small"
              label="Exercise Needs"
              InputLabelProps={{ shrink: true }}
              value={formData.exerciseNeeds}
              onChange={handleChange('exerciseNeeds')}
              placeholder="e.g., 30 min walk twice daily"
              sx={{ ...folioTextFieldSx }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              size="small"
              label="Grooming Needs"
              InputLabelProps={{ shrink: true }}
              value={formData.groomingNeeds}
              onChange={handleChange('groomingNeeds')}
              placeholder="e.g., Brush weekly, professional grooming monthly"
              sx={{ ...folioTextFieldSx }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              size="small"
              label="Sleeping Arrangements"
              InputLabelProps={{ shrink: true }}
              value={formData.sleepingArrangements}
              onChange={handleChange('sleepingArrangements')}
              placeholder="e.g., Crate in bedroom, dog bed in living room"
              sx={{ ...folioTextFieldSx }}
            />
          </Grid>
        </Grid>
      </FolioFieldFade>

      <Divider sx={{ my: 2.5, borderColor: folioColors.parchment }} />

      {/* Section 4: Behavioral Profile */}
      <FolioFieldFade visible={fieldsVisible} index={3}>
        <SectionHeader>Behavioral Profile</SectionHeader>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              size="small"
              label="Temperament"
              InputLabelProps={{ shrink: true }}
              value={formData.temperament}
              onChange={handleChange('temperament')}
              placeholder="e.g., Friendly, calm, energetic, anxious"
              sx={{ ...folioTextFieldSx }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              size="small"
              label="Fears"
              InputLabelProps={{ shrink: true }}
              value={formData.fears}
              onChange={handleChange('fears')}
              placeholder="e.g., Thunder, fireworks, strangers"
              sx={{ ...folioTextFieldSx }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              size="small"
              label="Triggers"
              InputLabelProps={{ shrink: true }}
              value={formData.triggers}
              onChange={handleChange('triggers')}
              placeholder="e.g., Loud noises, other dogs on leash"
              sx={{ ...folioTextFieldSx }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              size="small"
              label="Social with People"
              InputLabelProps={{ shrink: true }}
              value={formData.socialWithPeople}
              onChange={handleChange('socialWithPeople')}
              placeholder="e.g., Good with adults, shy with children"
              sx={{ ...folioTextFieldSx }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              size="small"
              label="Social with Animals"
              InputLabelProps={{ shrink: true }}
              value={formData.socialWithAnimals}
              onChange={handleChange('socialWithAnimals')}
              placeholder="e.g., Gets along with cats, reactive to dogs"
              sx={{ ...folioTextFieldSx }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              size="small"
              label="Training Level"
              InputLabelProps={{ shrink: true }}
              value={formData.trainingLevel}
              onChange={handleChange('trainingLevel')}
              placeholder="e.g., Basic obedience, advanced, none"
              sx={{ ...folioTextFieldSx }}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              size="small"
              label="Special Commands or Signals"
              InputLabelProps={{ shrink: true }}
              value={formData.specialCommands}
              onChange={handleChange('specialCommands')}
              placeholder="e.g., Hand signals for sit, stay; responds to whistle"
              sx={{ ...folioTextFieldSx }}
            />
          </Grid>
        </Grid>
      </FolioFieldFade>

      <Divider sx={{ my: 2.5, borderColor: folioColors.parchment }} />

      {/* Section 5: Care Preferences & Wishes */}
      <FolioFieldFade visible={fieldsVisible} index={4}>
        <SectionHeader>Care Preferences & Wishes</SectionHeader>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              size="small"
              label="Preferred Caretaker"
              InputLabelProps={{ shrink: true }}
              value={formData.preferredCaretaker}
              onChange={handleChange('preferredCaretaker')}
              placeholder="Name and relationship"
              sx={{ ...folioTextFieldSx }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              size="small"
              label="Alternate Caretaker"
              InputLabelProps={{ shrink: true }}
              value={formData.alternateCaretaker}
              onChange={handleChange('alternateCaretaker')}
              placeholder="Name and relationship"
              sx={{ ...folioTextFieldSx }}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              size="small"
              label="Special Instructions for Caretaker"
              InputLabelProps={{ shrink: true }}
              value={formData.caretakerInstructions}
              onChange={handleChange('caretakerInstructions')}
              multiline
              rows={2}
              sx={{ ...folioTextFieldSx }}
            />
          </Grid>
          <Grid item xs={6} sm={4}>
            <FormControl component="fieldset">
              <FormLabel component="legend" sx={legendSx}>Keep with other pets?</FormLabel>
              <RadioGroup
                row
                value={formData.keepWithOtherPets ? 'yes' : 'no'}
                onChange={handleRadioChange('keepWithOtherPets')}
              >
                <FormControlLabel value="yes" control={<Radio size="small" sx={radioSx} />} label="Yes" sx={radioLabelSx} />
                <FormControlLabel value="no" control={<Radio size="small" sx={radioSx} />} label="No" sx={radioLabelSx} />
              </RadioGroup>
            </FormControl>
          </Grid>
          {formData.keepWithOtherPets && (
            <Grid item xs={12} sm={8}>
              <TextField
                fullWidth
                size="small"
                label="Which pets should stay together?"
                InputLabelProps={{ shrink: true }}
                value={formData.keepWithOtherPetsDetails}
                onChange={handleChange('keepWithOtherPetsDetails')}
                sx={{ ...folioTextFieldSx }}
              />
            </Grid>
          )}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              size="small"
              label="Never Place With"
              InputLabelProps={{ shrink: true }}
              value={formData.neverPlaceWith}
              onChange={handleChange('neverPlaceWith')}
              placeholder="People or situations to avoid"
              sx={{ ...folioTextFieldSx }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              size="small"
              label="Rehoming Preferences"
              InputLabelProps={{ shrink: true }}
              value={formData.rehomingPreferences}
              onChange={handleChange('rehomingPreferences')}
              placeholder="e.g., Breed-specific rescue, no-kill shelter"
              sx={{ ...folioTextFieldSx }}
            />
          </Grid>
        </Grid>
      </FolioFieldFade>

      <Divider sx={{ my: 2.5, borderColor: folioColors.parchment }} />

      {/* Section 6: Financial Provisions */}
      <FolioFieldFade visible={fieldsVisible} index={5}>
        <SectionHeader>Financial Provisions</SectionHeader>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              size="small"
              label="Monthly Care Budget"
              InputLabelProps={{ shrink: true }}
              value={formData.monthlyCareBudget}
              onChange={handleChange('monthlyCareBudget')}
              placeholder="$"
              sx={{ ...folioTextFieldSx }}
            />
          </Grid>
          <Grid item xs={6} sm={3}>
            <FormControl component="fieldset">
              <FormLabel component="legend" sx={legendSx}>Pet Insurance?</FormLabel>
              <RadioGroup
                row
                value={formData.petInsurance ? 'yes' : 'no'}
                onChange={handleRadioChange('petInsurance')}
              >
                <FormControlLabel value="yes" control={<Radio size="small" sx={radioSx} />} label="Yes" sx={radioLabelSx} />
                <FormControlLabel value="no" control={<Radio size="small" sx={radioSx} />} label="No" sx={radioLabelSx} />
              </RadioGroup>
            </FormControl>
          </Grid>
          {formData.petInsurance && (
            <>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  size="small"
                  label="Insurance Company"
                  InputLabelProps={{ shrink: true }}
                  value={formData.petInsuranceCompany}
                  onChange={handleChange('petInsuranceCompany')}
                  sx={{ ...folioTextFieldSx }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  size="small"
                  label="Policy Number"
                  InputLabelProps={{ shrink: true }}
                  value={formData.petInsurancePolicyNumber}
                  onChange={handleChange('petInsurancePolicyNumber')}
                  sx={{ ...folioTextFieldSx }}
                />
              </Grid>
            </>
          )}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              size="small"
              label="Pet Trust Funding Amount"
              InputLabelProps={{ shrink: true }}
              value={formData.petTrustFunding}
              onChange={handleChange('petTrustFunding')}
              placeholder="Amount to set aside for pet care"
              sx={{ ...folioTextFieldSx }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              size="small"
              label="Pet Trust Details"
              InputLabelProps={{ shrink: true }}
              value={formData.petTrustDetails}
              onChange={handleChange('petTrustDetails')}
              placeholder="Any specific trust provisions"
              sx={{ ...folioTextFieldSx }}
            />
          </Grid>
        </Grid>
      </FolioFieldFade>

      <Divider sx={{ my: 2.5, borderColor: folioColors.parchment }} />

      {/* Section 7: Emergency Instructions */}
      <FolioFieldFade visible={fieldsVisible} index={6}>
        <SectionHeader>Emergency Instructions</SectionHeader>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              size="small"
              label="Emergency Contact"
              InputLabelProps={{ shrink: true }}
              value={formData.emergencyContact}
              onChange={handleChange('emergencyContact')}
              sx={{ ...folioTextFieldSx }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <PhoneInput
              fullWidth
              size="small"
              label="Emergency Contact Phone"
              InputLabelProps={{ shrink: true }}
              value={formData.emergencyContactPhone}
              onChange={(e) => setFormData((prev) => ({ ...prev, emergencyContactPhone: e.target.value }))}
              name="emergencyContactPhone"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              size="small"
              label="Emergency Vet Clinic"
              InputLabelProps={{ shrink: true }}
              value={formData.emergencyVetClinic}
              onChange={handleChange('emergencyVetClinic')}
              sx={{ ...folioTextFieldSx }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <PhoneInput
              fullWidth
              size="small"
              label="Emergency Vet Phone"
              InputLabelProps={{ shrink: true }}
              value={formData.emergencyVetPhone}
              onChange={(e) => setFormData((prev) => ({ ...prev, emergencyVetPhone: e.target.value }))}
              name="emergencyVetPhone"
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              size="small"
              label="Additional Notes"
              InputLabelProps={{ shrink: true }}
              value={formData.additionalNotes}
              onChange={handleChange('additionalNotes')}
              multiline
              rows={3}
              placeholder="Any other important information about this pet..."
              sx={{ ...folioTextFieldSx }}
            />
          </Grid>
        </Grid>
      </FolioFieldFade>
    </FolioModal>
  );
};

export default PetModal;
