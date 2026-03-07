'use client';

import React, { useState } from 'react';
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
  Divider,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  IconButton,
  Select,
  MenuItem,
  InputLabel,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import PetsIcon from '@mui/icons-material/Pets';
import { PetData } from '../lib/FormContext';
import { folioColors } from './FolioModal';

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

interface PetCareSectionProps {
  pets: PetData[];
  onUpdatePets: (pets: PetData[]) => void;
}

export default function PetCareSection({ pets, onUpdatePets }: PetCareSectionProps) {
  const [expandedPet, setExpandedPet] = useState<number | false>(pets.length > 0 ? 0 : false);

  const handleAddPet = () => {
    const newPets = [...pets, createEmptyPet()];
    onUpdatePets(newPets);
    setExpandedPet(newPets.length - 1);
  };

  const handleDeletePet = (index: number) => {
    const newPets = pets.filter((_, i) => i !== index);
    onUpdatePets(newPets);
    if (expandedPet === index) {
      setExpandedPet(false);
    } else if (typeof expandedPet === 'number' && expandedPet > index) {
      setExpandedPet(expandedPet - 1);
    }
  };

  const updatePet = (index: number, field: keyof PetData, value: string | boolean) => {
    const newPets = [...pets];
    newPets[index] = { ...newPets[index], [field]: value };
    onUpdatePets(newPets);
  };

  const handleRadioChange = (index: number, field: keyof PetData) => (event: React.ChangeEvent<HTMLInputElement>) => {
    updatePet(index, field, event.target.value === 'yes');
  };

  return (
    <Box>
      {pets.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 3 }}>
          <PetsIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
          <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
            No pets added yet. Click below to add a pet.
          </Typography>
        </Box>
      )}

      {pets.map((pet, index) => (
        <Accordion
          key={index}
          expanded={expandedPet === index}
          onChange={(_, isExpanded) => setExpandedPet(isExpanded ? index : false)}
          sx={{ mb: 1 }}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PetsIcon sx={{ color: 'primary.main' }} />
                <Typography sx={{ fontWeight: 500 }}>
                  {pet.petName || `Pet ${index + 1}`}
                  {pet.petType && ` (${pet.petType === 'Other' ? pet.petTypeOther || 'Other' : pet.petType})`}
                </Typography>
              </Box>
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeletePet(index);
                }}
                sx={{ mr: 1 }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            {/* Section 1: Basic Pet Information */}
            <Typography variant="subtitle1" sx={{ fontWeight: 600, color: folioColors.ink, mb: 2 }}>
              Basic Pet Information
            </Typography>
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  size="small"
                  label="Pet Name"
                  InputLabelProps={{ shrink: true }}
                  value={pet.petName}
                  onChange={(e) => updatePet(index, 'petName', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel shrink>Type of Pet</InputLabel>
                  <Select
                    label="Type of Pet"
                    notched
                    value={pet.petType}
                    onChange={(e) => updatePet(index, 'petType', e.target.value)}
                    displayEmpty
                  >
                    <MenuItem value="">Select...</MenuItem>
                    {PET_TYPES.map((type) => (
                      <MenuItem key={type} value={type}>{type}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              {pet.petType === 'Other' && (
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Specify Type"
                    InputLabelProps={{ shrink: true }}
                    value={pet.petTypeOther}
                    onChange={(e) => updatePet(index, 'petTypeOther', e.target.value)}
                  />
                </Grid>
              )}
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  size="small"
                  label="Breed"
                  InputLabelProps={{ shrink: true }}
                  value={pet.breed}
                  onChange={(e) => updatePet(index, 'breed', e.target.value)}
                />
              </Grid>
              <Grid item xs={6} sm={3} md={2}>
                <TextField
                  fullWidth
                  size="small"
                  label="Age"
                  InputLabelProps={{ shrink: true }}
                  value={pet.age}
                  onChange={(e) => updatePet(index, 'age', e.target.value)}
                />
              </Grid>
              <Grid item xs={6} sm={3} md={2}>
                <TextField
                  fullWidth
                  size="small"
                  label="Weight"
                  InputLabelProps={{ shrink: true }}
                  value={pet.weight}
                  onChange={(e) => updatePet(index, 'weight', e.target.value)}
                />
              </Grid>
              <Grid item xs={6} sm={3} md={2}>
                <TextField
                  fullWidth
                  size="small"
                  label="Color/Markings"
                  InputLabelProps={{ shrink: true }}
                  value={pet.color}
                  onChange={(e) => updatePet(index, 'color', e.target.value)}
                />
              </Grid>
              <Grid item xs={6} sm={3} md={2}>
                <FormControl fullWidth size="small">
                  <InputLabel shrink>Sex</InputLabel>
                  <Select
                    label="Sex"
                    notched
                    value={pet.sex}
                    onChange={(e) => updatePet(index, 'sex', e.target.value)}
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
                  <FormLabel component="legend" sx={{ fontSize: '0.875rem' }}>Spayed/Neutered?</FormLabel>
                  <RadioGroup
                    row
                    value={pet.spayedNeutered ? 'yes' : 'no'}
                    onChange={handleRadioChange(index, 'spayedNeutered')}
                  >
                    <FormControlLabel value="yes" control={<Radio size="small" />} label="Yes" />
                    <FormControlLabel value="no" control={<Radio size="small" />} label="No" />
                  </RadioGroup>
                </FormControl>
              </Grid>
              <Grid item xs={6} sm={3}>
                <FormControl component="fieldset">
                  <FormLabel component="legend" sx={{ fontSize: '0.875rem' }}>Microchipped?</FormLabel>
                  <RadioGroup
                    row
                    value={pet.microchipped ? 'yes' : 'no'}
                    onChange={handleRadioChange(index, 'microchipped')}
                  >
                    <FormControlLabel value="yes" control={<Radio size="small" />} label="Yes" />
                    <FormControlLabel value="no" control={<Radio size="small" />} label="No" />
                  </RadioGroup>
                </FormControl>
              </Grid>
              {pet.microchipped && (
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Microchip Number"
                    InputLabelProps={{ shrink: true }}
                    value={pet.microchipNumber}
                    onChange={(e) => updatePet(index, 'microchipNumber', e.target.value)}
                  />
                </Grid>
              )}
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  size="small"
                  label="Registration Number"
                  InputLabelProps={{ shrink: true }}
                  value={pet.registrationNumber}
                  onChange={(e) => updatePet(index, 'registrationNumber', e.target.value)}
                />
              </Grid>
            </Grid>

            <Divider sx={{ my: 2 }} />

            {/* Section 2: Veterinary Care */}
            <Typography variant="subtitle1" sx={{ fontWeight: 600, color: folioColors.ink, mb: 2 }}>
              Veterinary Care
            </Typography>
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  size="small"
                  label="Veterinarian Name"
                  InputLabelProps={{ shrink: true }}
                  value={pet.vetName}
                  onChange={(e) => updatePet(index, 'vetName', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  size="small"
                  label="Clinic Name"
                  InputLabelProps={{ shrink: true }}
                  value={pet.vetClinic}
                  onChange={(e) => updatePet(index, 'vetClinic', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  size="small"
                  label="Vet Phone"
                  InputLabelProps={{ shrink: true }}
                  value={pet.vetPhone}
                  onChange={(e) => updatePet(index, 'vetPhone', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  size="small"
                  label="Vet Address"
                  InputLabelProps={{ shrink: true }}
                  value={pet.vetAddress}
                  onChange={(e) => updatePet(index, 'vetAddress', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Current Medications"
                  InputLabelProps={{ shrink: true }}
                  value={pet.medications}
                  onChange={(e) => updatePet(index, 'medications', e.target.value)}
                  multiline
                  rows={2}
                  placeholder="List medications, dosages, and frequency"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Allergies"
                  InputLabelProps={{ shrink: true }}
                  value={pet.allergies}
                  onChange={(e) => updatePet(index, 'allergies', e.target.value)}
                  multiline
                  rows={2}
                  placeholder="Food, medication, or environmental allergies"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Medical Conditions"
                  InputLabelProps={{ shrink: true }}
                  value={pet.medicalConditions}
                  onChange={(e) => updatePet(index, 'medicalConditions', e.target.value)}
                  multiline
                  rows={2}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Vaccines Due"
                  InputLabelProps={{ shrink: true }}
                  value={pet.vaccinesDue}
                  onChange={(e) => updatePet(index, 'vaccinesDue', e.target.value)}
                  placeholder="Upcoming vaccine schedule"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  size="small"
                  label="Special Medical Instructions"
                  InputLabelProps={{ shrink: true }}
                  value={pet.specialMedicalInstructions}
                  onChange={(e) => updatePet(index, 'specialMedicalInstructions', e.target.value)}
                  multiline
                  rows={2}
                />
              </Grid>
            </Grid>

            <Divider sx={{ my: 2 }} />

            {/* Section 3: Daily Care Instructions */}
            <Typography variant="subtitle1" sx={{ fontWeight: 600, color: folioColors.ink, mb: 2 }}>
              Daily Care Instructions
            </Typography>
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Feeding Schedule"
                  InputLabelProps={{ shrink: true }}
                  value={pet.feedingSchedule}
                  onChange={(e) => updatePet(index, 'feedingSchedule', e.target.value)}
                  placeholder="e.g., Twice daily - 7am and 5pm"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  size="small"
                  label="Food Brand/Type"
                  InputLabelProps={{ shrink: true }}
                  value={pet.foodBrand}
                  onChange={(e) => updatePet(index, 'foodBrand', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  size="small"
                  label="Food Amount"
                  InputLabelProps={{ shrink: true }}
                  value={pet.foodAmount}
                  onChange={(e) => updatePet(index, 'foodAmount', e.target.value)}
                  placeholder="e.g., 1 cup per meal"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Dietary Restrictions"
                  InputLabelProps={{ shrink: true }}
                  value={pet.dietaryRestrictions}
                  onChange={(e) => updatePet(index, 'dietaryRestrictions', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Exercise Needs"
                  InputLabelProps={{ shrink: true }}
                  value={pet.exerciseNeeds}
                  onChange={(e) => updatePet(index, 'exerciseNeeds', e.target.value)}
                  placeholder="e.g., 30 min walk twice daily"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Grooming Needs"
                  InputLabelProps={{ shrink: true }}
                  value={pet.groomingNeeds}
                  onChange={(e) => updatePet(index, 'groomingNeeds', e.target.value)}
                  placeholder="e.g., Brush weekly, professional grooming monthly"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Sleeping Arrangements"
                  InputLabelProps={{ shrink: true }}
                  value={pet.sleepingArrangements}
                  onChange={(e) => updatePet(index, 'sleepingArrangements', e.target.value)}
                  placeholder="e.g., Crate in bedroom, dog bed in living room"
                />
              </Grid>
            </Grid>

            <Divider sx={{ my: 2 }} />

            {/* Section 4: Behavioral Profile */}
            <Typography variant="subtitle1" sx={{ fontWeight: 600, color: folioColors.ink, mb: 2 }}>
              Behavioral Profile
            </Typography>
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Temperament"
                  InputLabelProps={{ shrink: true }}
                  value={pet.temperament}
                  onChange={(e) => updatePet(index, 'temperament', e.target.value)}
                  placeholder="e.g., Friendly, calm, energetic, anxious"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Fears"
                  InputLabelProps={{ shrink: true }}
                  value={pet.fears}
                  onChange={(e) => updatePet(index, 'fears', e.target.value)}
                  placeholder="e.g., Thunder, fireworks, strangers"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Triggers"
                  InputLabelProps={{ shrink: true }}
                  value={pet.triggers}
                  onChange={(e) => updatePet(index, 'triggers', e.target.value)}
                  placeholder="e.g., Loud noises, other dogs on leash"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Social with People"
                  InputLabelProps={{ shrink: true }}
                  value={pet.socialWithPeople}
                  onChange={(e) => updatePet(index, 'socialWithPeople', e.target.value)}
                  placeholder="e.g., Good with adults, shy with children"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Social with Animals"
                  InputLabelProps={{ shrink: true }}
                  value={pet.socialWithAnimals}
                  onChange={(e) => updatePet(index, 'socialWithAnimals', e.target.value)}
                  placeholder="e.g., Gets along with cats, reactive to dogs"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Training Level"
                  InputLabelProps={{ shrink: true }}
                  value={pet.trainingLevel}
                  onChange={(e) => updatePet(index, 'trainingLevel', e.target.value)}
                  placeholder="e.g., Basic obedience, advanced, none"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  size="small"
                  label="Special Commands or Signals"
                  InputLabelProps={{ shrink: true }}
                  value={pet.specialCommands}
                  onChange={(e) => updatePet(index, 'specialCommands', e.target.value)}
                  placeholder="e.g., Hand signals for sit, stay; responds to whistle"
                />
              </Grid>
            </Grid>

            <Divider sx={{ my: 2 }} />

            {/* Section 5: Care Preferences & Wishes */}
            <Typography variant="subtitle1" sx={{ fontWeight: 600, color: folioColors.ink, mb: 2 }}>
              Care Preferences & Wishes
            </Typography>
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Preferred Caretaker"
                  InputLabelProps={{ shrink: true }}
                  value={pet.preferredCaretaker}
                  onChange={(e) => updatePet(index, 'preferredCaretaker', e.target.value)}
                  placeholder="Name and relationship"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Alternate Caretaker"
                  InputLabelProps={{ shrink: true }}
                  value={pet.alternateCaretaker}
                  onChange={(e) => updatePet(index, 'alternateCaretaker', e.target.value)}
                  placeholder="Name and relationship"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  size="small"
                  label="Special Instructions for Caretaker"
                  InputLabelProps={{ shrink: true }}
                  value={pet.caretakerInstructions}
                  onChange={(e) => updatePet(index, 'caretakerInstructions', e.target.value)}
                  multiline
                  rows={2}
                />
              </Grid>
              <Grid item xs={6} sm={4}>
                <FormControl component="fieldset">
                  <FormLabel component="legend" sx={{ fontSize: '0.875rem' }}>Keep with other pets?</FormLabel>
                  <RadioGroup
                    row
                    value={pet.keepWithOtherPets ? 'yes' : 'no'}
                    onChange={handleRadioChange(index, 'keepWithOtherPets')}
                  >
                    <FormControlLabel value="yes" control={<Radio size="small" />} label="Yes" />
                    <FormControlLabel value="no" control={<Radio size="small" />} label="No" />
                  </RadioGroup>
                </FormControl>
              </Grid>
              {pet.keepWithOtherPets && (
                <Grid item xs={12} sm={8}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Which pets should stay together?"
                    InputLabelProps={{ shrink: true }}
                    value={pet.keepWithOtherPetsDetails}
                    onChange={(e) => updatePet(index, 'keepWithOtherPetsDetails', e.target.value)}
                  />
                </Grid>
              )}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Never Place With"
                  InputLabelProps={{ shrink: true }}
                  value={pet.neverPlaceWith}
                  onChange={(e) => updatePet(index, 'neverPlaceWith', e.target.value)}
                  placeholder="People or situations to avoid"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Rehoming Preferences"
                  InputLabelProps={{ shrink: true }}
                  value={pet.rehomingPreferences}
                  onChange={(e) => updatePet(index, 'rehomingPreferences', e.target.value)}
                  placeholder="e.g., Breed-specific rescue, no-kill shelter"
                />
              </Grid>
            </Grid>

            <Divider sx={{ my: 2 }} />

            {/* Section 6: Financial Provisions */}
            <Typography variant="subtitle1" sx={{ fontWeight: 600, color: folioColors.ink, mb: 2 }}>
              Financial Provisions
            </Typography>
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  size="small"
                  label="Monthly Care Budget"
                  InputLabelProps={{ shrink: true }}
                  value={pet.monthlyCareBudget}
                  onChange={(e) => updatePet(index, 'monthlyCareBudget', e.target.value)}
                  placeholder="$"
                />
              </Grid>
              <Grid item xs={6} sm={3}>
                <FormControl component="fieldset">
                  <FormLabel component="legend" sx={{ fontSize: '0.875rem' }}>Pet Insurance?</FormLabel>
                  <RadioGroup
                    row
                    value={pet.petInsurance ? 'yes' : 'no'}
                    onChange={handleRadioChange(index, 'petInsurance')}
                  >
                    <FormControlLabel value="yes" control={<Radio size="small" />} label="Yes" />
                    <FormControlLabel value="no" control={<Radio size="small" />} label="No" />
                  </RadioGroup>
                </FormControl>
              </Grid>
              {pet.petInsurance && (
                <>
                  <Grid item xs={12} sm={6} md={3}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Insurance Company"
                      InputLabelProps={{ shrink: true }}
                      value={pet.petInsuranceCompany}
                      onChange={(e) => updatePet(index, 'petInsuranceCompany', e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Policy Number"
                      InputLabelProps={{ shrink: true }}
                      value={pet.petInsurancePolicyNumber}
                      onChange={(e) => updatePet(index, 'petInsurancePolicyNumber', e.target.value)}
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
                  value={pet.petTrustFunding}
                  onChange={(e) => updatePet(index, 'petTrustFunding', e.target.value)}
                  placeholder="Amount to set aside for pet care"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Pet Trust Details"
                  InputLabelProps={{ shrink: true }}
                  value={pet.petTrustDetails}
                  onChange={(e) => updatePet(index, 'petTrustDetails', e.target.value)}
                  placeholder="Any specific trust provisions"
                />
              </Grid>
            </Grid>

            <Divider sx={{ my: 2 }} />

            {/* Section 7: Emergency Instructions */}
            <Typography variant="subtitle1" sx={{ fontWeight: 600, color: folioColors.ink, mb: 2 }}>
              Emergency Instructions
            </Typography>
            <Grid container spacing={2} sx={{ mb: 1 }}>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  size="small"
                  label="Emergency Contact"
                  InputLabelProps={{ shrink: true }}
                  value={pet.emergencyContact}
                  onChange={(e) => updatePet(index, 'emergencyContact', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  size="small"
                  label="Emergency Contact Phone"
                  InputLabelProps={{ shrink: true }}
                  value={pet.emergencyContactPhone}
                  onChange={(e) => updatePet(index, 'emergencyContactPhone', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  size="small"
                  label="Emergency Vet Clinic"
                  InputLabelProps={{ shrink: true }}
                  value={pet.emergencyVetClinic}
                  onChange={(e) => updatePet(index, 'emergencyVetClinic', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  size="small"
                  label="Emergency Vet Phone"
                  InputLabelProps={{ shrink: true }}
                  value={pet.emergencyVetPhone}
                  onChange={(e) => updatePet(index, 'emergencyVetPhone', e.target.value)}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  size="small"
                  label="Additional Notes"
                  InputLabelProps={{ shrink: true }}
                  value={pet.additionalNotes}
                  onChange={(e) => updatePet(index, 'additionalNotes', e.target.value)}
                  multiline
                  rows={3}
                  placeholder="Any other important information about this pet..."
                />
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>
      ))}

      <Box sx={{ mt: 2 }}>
        <Button
          variant="outlined"
          startIcon={<AddIcon />}
          onClick={handleAddPet}
        >
          Add Pet
        </Button>
      </Box>
    </Box>
  );
}
