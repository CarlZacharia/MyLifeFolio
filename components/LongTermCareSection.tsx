'use client';

import React, { useState } from 'react';
import {
  Box,
  TextField,
  Typography,
  Grid,
  Divider,
  FormControl,
  FormLabel,
  Select,
  MenuItem,
  RadioGroup,
  FormControlLabel,
  Radio,
  Checkbox,
  FormGroup,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Tabs,
  Tab,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import PersonIcon from '@mui/icons-material/Person';
import PeopleIcon from '@mui/icons-material/People';
import {
  useFormContext,
  MaritalStatus,
  LongTermCareData,
  ConcernLevel,
  HealthRating,
  DementiaStage,
  LivingSituation,
  CareLevel,
  HoursPerWeek,
  Likelihood,
  CarePreference,
} from '../lib/FormContext';
import { VideoHelpIcon, HelpIcon } from './FieldWithHelp';
import HelpModal from './HelpModal';

const SHOW_SPOUSE_STATUSES: MaritalStatus[] = ['Married', 'Second Marriage', 'Domestic Partnership'];

// Option constants
const CONCERN_LEVELS: ConcernLevel[] = ['Not at all', 'Slightly', 'Moderately', 'Very', 'Extremely'];
const HEALTH_RATINGS: HealthRating[] = ['Excellent', 'Good', 'Fair', 'Poor'];
const DEMENTIA_STAGES: DementiaStage[] = ['Mild', 'Moderate', 'Severe'];
const LIVING_SITUATIONS: LivingSituation[] = [
  'Own home',
  'Rented home/apartment',
  'Independent living in a senior community',
  'Assisted living',
  'Memory care',
  'Skilled nursing facility',
  'Living with family',
  'Other',
];
const CARE_LEVELS: CareLevel[] = [
  'Independent living',
  'Assisted living',
  'Memory care',
  'Skilled nursing',
  'Rehabilitation',
  'At-home care with agency',
  'At-home care with private aides',
];
const HOURS_OPTIONS: HoursPerWeek[] = ['0', '1-10', '11-20', '21-40', '40+'];
const LIKELIHOOD_OPTIONS: Likelihood[] = ['Very unlikely', 'Unlikely', 'Unsure', 'Likely', 'Very likely'];
const CARE_PREFERENCES: CarePreference[] = [
  'Age in place at home as long as possible',
  'Live with family',
  'Assisted living',
  'Memory care',
  'Skilled nursing',
  'Continuing care retirement community',
  'No preference',
  'Other',
];

const DIAGNOSES_OPTIONS = [
  'Dementia/Alzheimer\'s',
  'Parkinson\'s',
  'Stroke',
  'Heart disease',
  'COPD',
  'Diabetes',
  'Cancer',
  'Chronic kidney disease',
  'Psychiatric condition',
  'Other',
];

const MOBILITY_OPTIONS = [
  'Use of cane',
  'Use of walker',
  'Use of wheelchair',
  'History of falls',
  'Difficulty climbing stairs',
  'Unable to stand without assistance',
];

const ADL_OPTIONS = [
  'Bathing',
  'Dressing',
  'Toileting',
  'Transferring',
  'Continence',
  'Eating',
];

const IADL_OPTIONS = [
  'Cooking',
  'Shopping',
  'Managing medications',
  'Driving/transportation',
  'Housekeeping',
  'Managing finances',
];

const HOME_HELP_PROVIDERS = [
  'Home health agency',
  'Private aide',
  'Family',
  'Friends',
  'Other',
];

const HOME_SUPPORTS = [
  'Home health aides',
  'Family caregivers',
  'Adult day program',
  'Home modifications',
  'Transportation',
  'Medication management',
];

const CAREGIVER_OPTIONS = [
  'Spouse/partner',
  'Adult child',
  'Other relative',
  'Friend',
  'Hired help',
  'None identified',
];

const MEDICARE_OPTIONS = [
  'Part A',
  'Part B',
  'Part C (Advantage)',
  'Part D',
  'None',
];

const BENEFITS_OPTIONS = [
  'SSI',
  'SSDI',
  'VA pension/Aid & Attendance',
  'SNAP',
  'Medicaid',
  'Medicaid HCBS waiver',
  'Other',
];

const IMPORTANCE_OPTIONS = ['Not important', 'Somewhat important', 'Very important'] as const;

interface PersonLongTermCareProps {
  data: LongTermCareData;
  onChange: (field: keyof LongTermCareData, value: LongTermCareData[keyof LongTermCareData]) => void;
  personLabel: string;
  showSpouse: boolean;
  headerColor?: string;
  openHelp: (helpId: number) => void;
}

const PersonLongTermCare: React.FC<PersonLongTermCareProps> = ({
  data,
  onChange,
  personLabel,
  showSpouse,
  headerColor = '#1a237e',
  openHelp,
}) => {
  const handleCheckboxArray = (field: keyof LongTermCareData, value: string, checked: boolean) => {
    const currentArray = (data[field] as string[]) || [];
    if (checked) {
      onChange(field, [...currentArray, value]);
    } else {
      onChange(field, currentArray.filter((v) => v !== value));
    }
  };

  const handleImportanceChange = (
    field: keyof LongTermCareData['careSettingImportance'],
    value: string
  ) => {
    onChange('careSettingImportance', {
      ...data.careSettingImportance,
      [field]: value,
    });
  };

  return (
    <Box>
      {/* Section 1: General Framing Questions */}
      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6" sx={{ fontWeight: 500, color: headerColor }}>
            1. General Framing Questions
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="What are your primary goals or concerns regarding long-term care and asset protection?"
                value={data.primaryGoalsConcerns}
                onChange={(e) => onChange('primaryGoalsConcerns', e.target.value)}
                multiline
                rows={3}
                variant="outlined"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <FormLabel sx={{ fontWeight: 500, color: 'text.primary' }}>How concerned are you about paying for long-term care in the future?</FormLabel>
                  <HelpIcon helpId={131} onClick={() => openHelp(131)} />
                </Box>
                <Select
                  value={data.ltcConcernLevel}
                  onChange={(e) => onChange('ltcConcernLevel', e.target.value as ConcernLevel)}
                  size="small"
                >
                  <MenuItem value="">Select...</MenuItem>
                  {CONCERN_LEVELS.map((level) => (
                    <MenuItem key={level} value={level}>{level}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl component="fieldset">
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <FormLabel sx={{ fontWeight: 500, color: 'text.primary' }}>Have you previously met with an attorney or advisor about long-term care or Medicaid planning?</FormLabel>
                  <HelpIcon helpId={132} onClick={() => openHelp(132)} />
                </Box>
                <RadioGroup
                  row
                  value={data.previouslyMetWithAdvisor ? 'yes' : 'no'}
                  onChange={(e) => onChange('previouslyMetWithAdvisor', e.target.value === 'yes')}
                >
                  <FormControlLabel value="yes" control={<Radio size="small" />} label="Yes" />
                  <FormControlLabel value="no" control={<Radio size="small" />} label="No" />
                </RadioGroup>
              </FormControl>
            </Grid>

            {data.previouslyMetWithAdvisor && (
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="When and with whom?"
                  value={data.advisorMeetingDetails}
                  onChange={(e) => onChange('advisorMeetingDetails', e.target.value)}
                  variant="outlined"
                  size="small"
                />
              </Grid>
            )}
          </Grid>
        </AccordionDetails>
      </Accordion>

      {/* Section 2: Current Health and Diagnoses */}
      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6" sx={{ fontWeight: 500, color: headerColor }}>
            2. Current Health and Diagnoses
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <FormLabel sx={{ fontWeight: 500, color: 'text.primary' }}>How would you describe your overall health?</FormLabel>
                  <HelpIcon helpId={133} onClick={() => openHelp(133)} />
                </Box>
                <Select
                  value={data.overallHealth}
                  onChange={(e) => onChange('overallHealth', e.target.value as HealthRating)}
                  size="small"
                >
                  <MenuItem value="">Select...</MenuItem>
                  {HEALTH_RATINGS.map((rating) => (
                    <MenuItem key={rating} value={rating}>{rating}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <FormControl component="fieldset">
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <FormLabel sx={{ fontWeight: 500, color: 'text.primary' }}>Have you been diagnosed with any of the following? (Check all that apply)</FormLabel>
                  <HelpIcon helpId={134} onClick={() => openHelp(134)} />
                </Box>
                <FormGroup row>
                  {DIAGNOSES_OPTIONS.map((diagnosis) => (
                    <FormControlLabel
                      key={diagnosis}
                      control={
                        <Checkbox
                          size="small"
                          checked={data.diagnoses.includes(diagnosis)}
                          onChange={(e) => handleCheckboxArray('diagnoses', diagnosis, e.target.checked)}
                        />
                      }
                      label={diagnosis}
                    />
                  ))}
                </FormGroup>
              </FormControl>
            </Grid>

            {data.diagnoses.includes('Other') && (
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Please specify other diagnoses"
                  value={data.diagnosesOther}
                  onChange={(e) => onChange('diagnosesOther', e.target.value)}
                  variant="outlined"
                  size="small"
                />
              </Grid>
            )}

            <Grid item xs={12} md={6}>
              <FormControl component="fieldset">
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <FormLabel sx={{ fontWeight: 500, color: 'text.primary' }}>Have you experienced any recent hospitalizations, surgeries, or rehab stays in the last 2 years?</FormLabel>
                  <HelpIcon helpId={135} onClick={() => openHelp(135)} />
                </Box>
                <RadioGroup
                  row
                  value={data.recentHospitalizations ? 'yes' : 'no'}
                  onChange={(e) => onChange('recentHospitalizations', e.target.value === 'yes')}
                >
                  <FormControlLabel value="yes" control={<Radio size="small" />} label="Yes" />
                  <FormControlLabel value="no" control={<Radio size="small" />} label="No" />
                </RadioGroup>
              </FormControl>
            </Grid>

            {data.recentHospitalizations && (
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="List dates, facilities, and reasons"
                  value={data.hospitalizationDetails}
                  onChange={(e) => onChange('hospitalizationDetails', e.target.value)}
                  multiline
                  rows={2}
                  variant="outlined"
                />
              </Grid>
            )}

            <Grid item xs={12}>
              <FormControl component="fieldset">
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <FormLabel sx={{ fontWeight: 500, color: 'text.primary' }}>Do you have any mobility limitations? (Check all that apply)</FormLabel>
                  <HelpIcon helpId={136} onClick={() => openHelp(136)} />
                </Box>
                <FormGroup row>
                  {MOBILITY_OPTIONS.map((limitation) => (
                    <FormControlLabel
                      key={limitation}
                      control={
                        <Checkbox
                          size="small"
                          checked={data.mobilityLimitations.includes(limitation)}
                          onChange={(e) => handleCheckboxArray('mobilityLimitations', limitation, e.target.checked)}
                        />
                      }
                      label={limitation}
                    />
                  ))}
                </FormGroup>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <FormControl component="fieldset">
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <FormLabel sx={{ fontWeight: 500, color: 'text.primary' }}>Do you require help with any Activities of Daily Living (ADLs)? (Check all that apply)</FormLabel>
                  <HelpIcon helpId={137} onClick={() => openHelp(137)} />
                </Box>
                <FormGroup row>
                  {ADL_OPTIONS.map((adl) => (
                    <FormControlLabel
                      key={adl}
                      control={
                        <Checkbox
                          size="small"
                          checked={data.adlHelp.includes(adl)}
                          onChange={(e) => handleCheckboxArray('adlHelp', adl, e.target.checked)}
                        />
                      }
                      label={adl}
                    />
                  ))}
                </FormGroup>
              </FormControl>
            </Grid>

            {data.adlHelp.length > 0 && (
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Who assists with these activities?"
                  value={data.adlAssistance}
                  onChange={(e) => onChange('adlAssistance', e.target.value)}
                  variant="outlined"
                  size="small"
                />
              </Grid>
            )}

            <Grid item xs={12}>
              <FormControl component="fieldset">
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <FormLabel sx={{ fontWeight: 500, color: 'text.primary' }}>Do you require help with any Instrumental Activities of Daily Living (IADLs)? (Check all that apply)</FormLabel>
                  <HelpIcon helpId={138} onClick={() => openHelp(138)} />
                </Box>
                <FormGroup row>
                  {IADL_OPTIONS.map((iadl) => (
                    <FormControlLabel
                      key={iadl}
                      control={
                        <Checkbox
                          size="small"
                          checked={data.iadlHelp.includes(iadl)}
                          onChange={(e) => handleCheckboxArray('iadlHelp', iadl, e.target.checked)}
                        />
                      }
                      label={iadl}
                    />
                  ))}
                </FormGroup>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl component="fieldset">
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <FormLabel sx={{ fontWeight: 500, color: 'text.primary' }}>Have you been diagnosed with dementia or memory impairment?</FormLabel>
                  <HelpIcon helpId={139} onClick={() => openHelp(139)} />
                </Box>
                <RadioGroup
                  row
                  value={data.hasDementia ? 'yes' : 'no'}
                  onChange={(e) => onChange('hasDementia', e.target.value === 'yes')}
                >
                  <FormControlLabel value="yes" control={<Radio size="small" />} label="Yes" />
                  <FormControlLabel value="no" control={<Radio size="small" />} label="No" />
                </RadioGroup>
              </FormControl>
            </Grid>

            {data.hasDementia && (
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <FormLabel sx={{ fontWeight: 500, color: 'text.primary' }}>Stage or severity</FormLabel>
                    <HelpIcon helpId={140} onClick={() => openHelp(140)} />
                  </Box>
                  <Select
                    value={data.dementiaStage}
                    onChange={(e) => onChange('dementiaStage', e.target.value as DementiaStage)}
                    size="small"
                  >
                    <MenuItem value="">Select...</MenuItem>
                    {DEMENTIA_STAGES.map((stage) => (
                      <MenuItem key={stage} value={stage}>{stage}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            )}

            <Grid item xs={12} md={6}>
              <FormControl component="fieldset">
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <FormLabel sx={{ fontWeight: 500, color: 'text.primary' }}>Is there a family history of dementia, stroke, or other conditions that may affect long-term care needs?</FormLabel>
                  <HelpIcon helpId={141} onClick={() => openHelp(141)} />
                </Box>
                <RadioGroup
                  row
                  value={data.familyHistoryOfConditions ? 'yes' : 'no'}
                  onChange={(e) => onChange('familyHistoryOfConditions', e.target.value === 'yes')}
                >
                  <FormControlLabel value="yes" control={<Radio size="small" />} label="Yes" />
                  <FormControlLabel value="no" control={<Radio size="small" />} label="No" />
                </RadioGroup>
              </FormControl>
            </Grid>

            {data.familyHistoryOfConditions && (
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Please describe"
                  value={data.familyHistoryDetails}
                  onChange={(e) => onChange('familyHistoryDetails', e.target.value)}
                  variant="outlined"
                  size="small"
                />
              </Grid>
            )}
          </Grid>
        </AccordionDetails>
      </Accordion>

      {/* Section 3: Current Living Situation and Services */}
      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6" sx={{ fontWeight: 500, color: headerColor }}>
            3. Current Living Situation and Services
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <FormLabel sx={{ fontWeight: 500, color: 'text.primary' }}>Where do you currently live?</FormLabel>
                  <HelpIcon helpId={142} onClick={() => openHelp(142)} />
                </Box>
                <Select
                  value={data.currentLivingSituation}
                  onChange={(e) => onChange('currentLivingSituation', e.target.value as LivingSituation)}
                  size="small"
                >
                  <MenuItem value="">Select...</MenuItem>
                  {LIVING_SITUATIONS.map((situation) => (
                    <MenuItem key={situation} value={situation}>{situation}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {data.currentLivingSituation === 'Other' && (
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Please specify"
                  value={data.livingOther}
                  onChange={(e) => onChange('livingOther', e.target.value)}
                  variant="outlined"
                  size="small"
                />
              </Grid>
            )}

            <Grid item xs={12} md={6}>
              <FormControl component="fieldset">
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <FormLabel sx={{ fontWeight: 500, color: 'text.primary' }}>Are you currently residing in any long-term care community or facility?</FormLabel>
                  <HelpIcon helpId={143} onClick={() => openHelp(143)} />
                </Box>
                <RadioGroup
                  row
                  value={data.inLtcFacility ? 'yes' : 'no'}
                  onChange={(e) => onChange('inLtcFacility', e.target.value === 'yes')}
                >
                  <FormControlLabel value="yes" control={<Radio size="small" />} label="Yes" />
                  <FormControlLabel value="no" control={<Radio size="small" />} label="No" />
                </RadioGroup>
              </FormControl>
            </Grid>

            {data.inLtcFacility && (
              <>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <FormLabel sx={{ fontWeight: 500, color: 'text.primary' }}>Level of care</FormLabel>
                      <HelpIcon helpId={144} onClick={() => openHelp(144)} />
                    </Box>
                    <Select
                      value={data.currentCareLevel}
                      onChange={(e) => onChange('currentCareLevel', e.target.value as CareLevel)}
                      size="small"
                    >
                      <MenuItem value="">Select...</MenuItem>
                      {CARE_LEVELS.map((level) => (
                        <MenuItem key={level} value={level}>{level}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Facility Name"
                    value={data.facilityName}
                    onChange={(e) => onChange('facilityName', e.target.value)}
                    variant="outlined"
                    size="small"
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Facility Address"
                    value={data.facilityAddress}
                    onChange={(e) => onChange('facilityAddress', e.target.value)}
                    variant="outlined"
                    size="small"
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Start Date of Residence"
                    value={data.facilityStartDate}
                    onChange={(e) => onChange('facilityStartDate', e.target.value)}
                    variant="outlined"
                    size="small"
                    type="date"
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
              </>
            )}

            <Grid item xs={12} md={6}>
              <FormControl component="fieldset">
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <FormLabel sx={{ fontWeight: 500, color: 'text.primary' }}>Do you currently receive help at home (paid or unpaid)?</FormLabel>
                  <HelpIcon helpId={145} onClick={() => openHelp(145)} />
                </Box>
                <RadioGroup
                  row
                  value={data.receivesHomeHelp ? 'yes' : 'no'}
                  onChange={(e) => onChange('receivesHomeHelp', e.target.value === 'yes')}
                >
                  <FormControlLabel value="yes" control={<Radio size="small" />} label="Yes" />
                  <FormControlLabel value="no" control={<Radio size="small" />} label="No" />
                </RadioGroup>
              </FormControl>
            </Grid>

            {data.receivesHomeHelp && (
              <>
                <Grid item xs={12}>
                  <FormControl component="fieldset">
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <FormLabel sx={{ fontWeight: 500, color: 'text.primary' }}>Who provides help? (Check all that apply)</FormLabel>
                      <HelpIcon helpId={146} onClick={() => openHelp(146)} />
                    </Box>
                    <FormGroup row>
                      {HOME_HELP_PROVIDERS.map((provider) => (
                        <FormControlLabel
                          key={provider}
                          control={
                            <Checkbox
                              size="small"
                              checked={data.homeHelpProviders.includes(provider)}
                              onChange={(e) => handleCheckboxArray('homeHelpProviders', provider, e.target.checked)}
                            />
                          }
                          label={provider}
                        />
                      ))}
                    </FormGroup>
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <FormLabel sx={{ fontWeight: 500, color: 'text.primary' }}>How many hours per week of help do you receive?</FormLabel>
                      <HelpIcon helpId={147} onClick={() => openHelp(147)} />
                    </Box>
                    <Select
                      value={data.hoursOfHelpPerWeek}
                      onChange={(e) => onChange('hoursOfHelpPerWeek', e.target.value as HoursPerWeek)}
                      size="small"
                    >
                      <MenuItem value="">Select...</MenuItem>
                      {HOURS_OPTIONS.map((hours) => (
                        <MenuItem key={hours} value={hours}>{hours}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </>
            )}

            <Grid item xs={12} md={6}>
              <FormControl component="fieldset">
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <FormLabel sx={{ fontWeight: 500, color: 'text.primary' }}>Is there an expectation that your level of care will increase in the next 6-12 months?</FormLabel>
                  <HelpIcon helpId={148} onClick={() => openHelp(148)} />
                </Box>
                <RadioGroup
                  row
                  value={data.expectCareIncrease}
                  onChange={(e) => onChange('expectCareIncrease', e.target.value as '' | 'Yes' | 'No' | 'Unsure')}
                >
                  <FormControlLabel value="Yes" control={<Radio size="small" />} label="Yes" />
                  <FormControlLabel value="No" control={<Radio size="small" />} label="No" />
                  <FormControlLabel value="Unsure" control={<Radio size="small" />} label="Unsure" />
                </RadioGroup>
              </FormControl>
            </Grid>

            {data.expectCareIncrease === 'Yes' && (
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Please explain"
                  value={data.careIncreaseExplanation}
                  onChange={(e) => onChange('careIncreaseExplanation', e.target.value)}
                  variant="outlined"
                  size="small"
                />
              </Grid>
            )}
          </Grid>
        </AccordionDetails>
      </Accordion>

      {/* Section 4: Five-Year Care Foreseeability and Preferences */}
      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6" sx={{ fontWeight: 500, color: headerColor }}>
            4. Five-Year Care Foreseeability and Preferences
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <FormLabel sx={{ fontWeight: 500, color: 'text.primary' }}>How likely do you think it is that you will need long-term care (more than 90 consecutive days of help) within the next 5 years?</FormLabel>
                  <HelpIcon helpId={149} onClick={() => openHelp(149)} />
                </Box>
                <Select
                  value={data.likelihoodOfLtcIn5Years}
                  onChange={(e) => onChange('likelihoodOfLtcIn5Years', e.target.value as Likelihood)}
                  size="small"
                >
                  <MenuItem value="">Select...</MenuItem>
                  {LIKELIHOOD_OPTIONS.map((option) => (
                    <MenuItem key={option} value={option}>{option}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <FormLabel sx={{ fontWeight: 500, color: 'text.primary' }}>If long-term care becomes necessary, where would you prefer to receive that care?</FormLabel>
                  <HelpIcon helpId={150} onClick={() => openHelp(150)} />
                </Box>
                <Select
                  value={data.carePreference}
                  onChange={(e) => onChange('carePreference', e.target.value as CarePreference)}
                  size="small"
                >
                  <MenuItem value="">Select...</MenuItem>
                  {CARE_PREFERENCES.map((pref) => (
                    <MenuItem key={pref} value={pref}>{pref}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {data.carePreference === 'Other' && (
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Please specify"
                  value={data.carePreferenceOther}
                  onChange={(e) => onChange('carePreferenceOther', e.target.value)}
                  variant="outlined"
                  size="small"
                />
              </Grid>
            )}

            {(data.carePreference === 'Assisted living' ||
              data.carePreference === 'Memory care' ||
              data.carePreference === 'Skilled nursing' ||
              data.carePreference === 'Continuing care retirement community') && (
              <>
                <Grid item xs={12} md={6}>
                  <FormControl component="fieldset">
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <FormLabel sx={{ fontWeight: 500, color: 'text.primary' }}>Do you already have a specific provider or location in mind?</FormLabel>
                      <HelpIcon helpId={151} onClick={() => openHelp(151)} />
                    </Box>
                    <RadioGroup
                      row
                      value={data.hasSpecificProvider ? 'yes' : 'no'}
                      onChange={(e) => onChange('hasSpecificProvider', e.target.value === 'yes')}
                    >
                      <FormControlLabel value="yes" control={<Radio size="small" />} label="Yes" />
                      <FormControlLabel value="no" control={<Radio size="small" />} label="No" />
                    </RadioGroup>
                  </FormControl>
                </Grid>

                {data.hasSpecificProvider && (
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Name, city, state of preferred provider"
                      value={data.preferredProviderDetails}
                      onChange={(e) => onChange('preferredProviderDetails', e.target.value)}
                      variant="outlined"
                      size="small"
                    />
                  </Grid>
                )}
              </>
            )}

            {data.carePreference === 'Age in place at home as long as possible' && (
              <Grid item xs={12}>
                <FormControl component="fieldset">
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <FormLabel sx={{ fontWeight: 500, color: 'text.primary' }}>What supports do you think you would need? (Check all that apply)</FormLabel>
                    <HelpIcon helpId={152} onClick={() => openHelp(152)} />
                  </Box>
                  <FormGroup row>
                    {HOME_SUPPORTS.map((support) => (
                      <FormControlLabel
                        key={support}
                        control={
                          <Checkbox
                            size="small"
                            checked={data.homeSupportsNeeded.includes(support)}
                            onChange={(e) => handleCheckboxArray('homeSupportsNeeded', support, e.target.checked)}
                          />
                        }
                        label={support}
                      />
                    ))}
                  </FormGroup>
                </FormControl>
              </Grid>
            )}

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Are there geographic preferences or restrictions for your long-term care? (e.g., stay in current city, be near a particular child, stay in Pennsylvania/Florida)"
                value={data.geographicPreferences}
                onChange={(e) => onChange('geographicPreferences', e.target.value)}
                multiline
                rows={2}
                variant="outlined"
              />
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      {/* Section 5: Caregivers */}
      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6" sx={{ fontWeight: 500, color: headerColor }}>
            5. Caregivers
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <FormControl component="fieldset">
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <FormLabel sx={{ fontWeight: 500, color: 'text.primary' }}>Who are your primary caregivers now or who would likely step into that role? (Check all that apply)</FormLabel>
                  <HelpIcon helpId={153} onClick={() => openHelp(153)} />
                </Box>
                <FormGroup row>
                  {CAREGIVER_OPTIONS.map((caregiver) => (
                    <FormControlLabel
                      key={caregiver}
                      control={
                        <Checkbox
                          size="small"
                          checked={data.primaryCaregivers.includes(caregiver)}
                          onChange={(e) => handleCheckboxArray('primaryCaregivers', caregiver, e.target.checked)}
                        />
                      }
                      label={caregiver}
                    />
                  ))}
                </FormGroup>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl component="fieldset">
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <FormLabel sx={{ fontWeight: 500, color: 'text.primary' }}>Are any of your children or potential caregivers disabled, in poor health, or otherwise limited in their ability to assist?</FormLabel>
                  <HelpIcon helpId={154} onClick={() => openHelp(154)} />
                </Box>
                <RadioGroup
                  row
                  value={data.caregiversLimitedAbility ? 'yes' : 'no'}
                  onChange={(e) => onChange('caregiversLimitedAbility', e.target.value === 'yes')}
                >
                  <FormControlLabel value="yes" control={<Radio size="small" />} label="Yes" />
                  <FormControlLabel value="no" control={<Radio size="small" />} label="No" />
                </RadioGroup>
              </FormControl>
            </Grid>

            {data.caregiversLimitedAbility && (
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Please describe"
                  value={data.caregiversLimitedDetails}
                  onChange={(e) => onChange('caregiversLimitedDetails', e.target.value)}
                  variant="outlined"
                  size="small"
                />
              </Grid>
            )}

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Are there any significant family conflicts or dynamics that could affect long-term care decisions or asset transfers?"
                value={data.familyConflicts}
                onChange={(e) => onChange('familyConflicts', e.target.value)}
                multiline
                rows={2}
                variant="outlined"
              />
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      {/* Section 6: Insurance and Public Benefits */}
      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6" sx={{ fontWeight: 500, color: headerColor }}>
            6. Insurance and Public Benefits
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <FormControl component="fieldset">
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <FormLabel sx={{ fontWeight: 500, color: 'text.primary' }}>Do you have Medicare? (Check all that apply)</FormLabel>
                  <HelpIcon helpId={155} onClick={() => openHelp(155)} />
                </Box>
                <FormGroup row>
                  {MEDICARE_OPTIONS.map((part) => (
                    <FormControlLabel
                      key={part}
                      control={
                        <Checkbox
                          size="small"
                          checked={data.medicareTypes.includes(part)}
                          onChange={(e) => handleCheckboxArray('medicareTypes', part, e.target.checked)}
                        />
                      }
                      label={part}
                    />
                  ))}
                </FormGroup>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <FormControl component="fieldset">
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <FormLabel sx={{ fontWeight: 500, color: 'text.primary' }}>Do you have a Medicare supplement (Medigap) or other private health insurance?</FormLabel>
                  <HelpIcon helpId={156} onClick={() => openHelp(156)} />
                </Box>
                <RadioGroup
                  row
                  value={data.hasMedigap ? 'yes' : 'no'}
                  onChange={(e) => onChange('hasMedigap', e.target.value === 'yes')}
                >
                  <FormControlLabel value="yes" control={<Radio size="small" />} label="Yes" />
                  <FormControlLabel value="no" control={<Radio size="small" />} label="No" />
                </RadioGroup>
              </FormControl>
            </Grid>

            {data.hasMedigap && (
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Company name and monthly premium"
                  value={data.medigapDetails}
                  onChange={(e) => onChange('medigapDetails', e.target.value)}
                  variant="outlined"
                  size="small"
                />
              </Grid>
            )}

            <Grid item xs={12}>
              <FormControl component="fieldset">
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <FormLabel sx={{ fontWeight: 500, color: 'text.primary' }}>Do you have long-term care insurance or a life/annuity hybrid with long-term care benefits?</FormLabel>
                  <HelpIcon helpId={157} onClick={() => openHelp(157)} />
                </Box>
                <RadioGroup
                  row
                  value={data.hasLtcInsurance ? 'yes' : 'no'}
                  onChange={(e) => onChange('hasLtcInsurance', e.target.value === 'yes')}
                >
                  <FormControlLabel value="yes" control={<Radio size="small" />} label="Yes" />
                  <FormControlLabel value="no" control={<Radio size="small" />} label="No" />
                </RadioGroup>
              </FormControl>
            </Grid>

            {data.hasLtcInsurance && (
              <>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Insurance Company Name"
                    value={data.ltcInsuranceCompany}
                    onChange={(e) => onChange('ltcInsuranceCompany', e.target.value)}
                    variant="outlined"
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Daily Benefit Amount"
                    value={data.ltcInsuranceDailyBenefit}
                    onChange={(e) => onChange('ltcInsuranceDailyBenefit', e.target.value)}
                    variant="outlined"
                    size="small"
                    placeholder="e.g., $200/day"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Term of Coverage"
                    value={data.ltcInsuranceTerm}
                    onChange={(e) => onChange('ltcInsuranceTerm', e.target.value)}
                    variant="outlined"
                    size="small"
                    placeholder="e.g., 3 years, 5 years, Lifetime"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Maximum Benefit Amount"
                    value={data.ltcInsuranceMaximum}
                    onChange={(e) => onChange('ltcInsuranceMaximum', e.target.value)}
                    variant="outlined"
                    size="small"
                    placeholder="e.g., $250,000"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Level of Care Required to Trigger Benefits"
                    value={data.ltcInsuranceCareLevel}
                    onChange={(e) => onChange('ltcInsuranceCareLevel', e.target.value)}
                    variant="outlined"
                    size="small"
                    placeholder="e.g., Unable to perform 2 ADLs, Cognitive impairment"
                  />
                </Grid>
              </>
            )}

            <Grid item xs={12}>
              <FormControl component="fieldset">
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <FormLabel sx={{ fontWeight: 500, color: 'text.primary' }}>Are you currently receiving any of the following benefits? (Check all that apply)</FormLabel>
                  <HelpIcon helpId={158} onClick={() => openHelp(158)} />
                </Box>
                <FormGroup row>
                  {BENEFITS_OPTIONS.map((benefit) => (
                    <FormControlLabel
                      key={benefit}
                      control={
                        <Checkbox
                          size="small"
                          checked={data.currentBenefits.includes(benefit)}
                          onChange={(e) => handleCheckboxArray('currentBenefits', benefit, e.target.checked)}
                        />
                      }
                      label={benefit}
                    />
                  ))}
                </FormGroup>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl component="fieldset">
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <FormLabel sx={{ fontWeight: 500, color: 'text.primary' }}>Have you or your spouse ever applied for Medicaid for long-term care?</FormLabel>
                  <HelpIcon helpId={159} onClick={() => openHelp(159)} />
                </Box>
                <RadioGroup
                  row
                  value={data.previousMedicaidApplication ? 'yes' : 'no'}
                  onChange={(e) => onChange('previousMedicaidApplication', e.target.value === 'yes')}
                >
                  <FormControlLabel value="yes" control={<Radio size="small" />} label="Yes" />
                  <FormControlLabel value="no" control={<Radio size="small" />} label="No" />
                </RadioGroup>
              </FormControl>
            </Grid>

            {data.previousMedicaidApplication && (
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Dates and outcome"
                  value={data.medicaidApplicationDetails}
                  onChange={(e) => onChange('medicaidApplicationDetails', e.target.value)}
                  variant="outlined"
                  size="small"
                />
              </Grid>
            )}
          </Grid>
        </AccordionDetails>
      </Accordion>

      {/* Section 7: Finances Relevant to LTC / Medicaid */}
      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6" sx={{ fontWeight: 500, color: headerColor }}>
            7. Finances Relevant to LTC / Medicaid
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Approximate monthly income from all sources (Social Security, pensions, annuities, employment, rental, etc.)"
                value={data.monthlyIncome}
                onChange={(e) => onChange('monthlyIncome', e.target.value)}
                variant="outlined"
                size="small"
                placeholder="$"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl component="fieldset">
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <FormLabel sx={{ fontWeight: 500, color: 'text.primary' }}>Have you made gifts or transfers of more than a modest amount in the last 5 years?</FormLabel>
                  <HelpIcon helpId={160} onClick={() => openHelp(160)} />
                </Box>
                <RadioGroup
                  row
                  value={data.madeGiftsOver5Years ? 'yes' : 'no'}
                  onChange={(e) => onChange('madeGiftsOver5Years', e.target.value === 'yes')}
                >
                  <FormControlLabel value="yes" control={<Radio size="small" />} label="Yes" />
                  <FormControlLabel value="no" control={<Radio size="small" />} label="No" />
                </RadioGroup>
              </FormControl>
            </Grid>

            {data.madeGiftsOver5Years && (
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Amounts, recipients, dates, purpose"
                  value={data.giftsDetails}
                  onChange={(e) => onChange('giftsDetails', e.target.value)}
                  multiline
                  rows={2}
                  variant="outlined"
                />
              </Grid>
            )}

            <Grid item xs={12} md={6}>
              <FormControl component="fieldset">
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <FormLabel sx={{ fontWeight: 500, color: 'text.primary' }}>Are you expecting any large inheritance, lawsuit settlement, or other significant windfall?</FormLabel>
                  <HelpIcon helpId={161} onClick={() => openHelp(161)} />
                </Box>
                <RadioGroup
                  row
                  value={data.expectingWindfall ? 'yes' : 'no'}
                  onChange={(e) => onChange('expectingWindfall', e.target.value === 'yes')}
                >
                  <FormControlLabel value="yes" control={<Radio size="small" />} label="Yes" />
                  <FormControlLabel value="no" control={<Radio size="small" />} label="No" />
                </RadioGroup>
              </FormControl>
            </Grid>

            {data.expectingWindfall && (
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Please describe"
                  value={data.windfallDetails}
                  onChange={(e) => onChange('windfallDetails', e.target.value)}
                  variant="outlined"
                  size="small"
                />
              </Grid>
            )}
          </Grid>
        </AccordionDetails>
      </Accordion>

      {/* Section 8: Quality-of-Life and Care Preferences */}
      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6" sx={{ fontWeight: 500, color: headerColor }}>
            8. Quality-of-Life and Care Preferences
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 500 }}>
                How important are the following in choosing a long-term care setting?
              </Typography>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Grid container spacing={2}>
                  {showSpouse && (
                    <Grid item xs={12} md={4}>
                      <FormControl fullWidth size="small">
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <FormLabel sx={{ fontWeight: 500, color: 'text.primary' }}>Staying with spouse/partner</FormLabel>
                          <HelpIcon helpId={162} onClick={() => openHelp(162)} />
                        </Box>
                        <Select
                          value={data.careSettingImportance.stayWithSpouse}
                          onChange={(e) => handleImportanceChange('stayWithSpouse', e.target.value)}
                        >
                          <MenuItem value="">Select...</MenuItem>
                          {IMPORTANCE_OPTIONS.map((opt) => (
                            <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                  )}

                  <Grid item xs={12} md={4}>
                    <FormControl fullWidth size="small">
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <FormLabel sx={{ fontWeight: 500, color: 'text.primary' }}>Being near family</FormLabel>
                        <HelpIcon helpId={163} onClick={() => openHelp(163)} />
                      </Box>
                      <Select
                        value={data.careSettingImportance.nearFamily}
                        onChange={(e) => handleImportanceChange('nearFamily', e.target.value)}
                      >
                        <MenuItem value="">Select...</MenuItem>
                        {IMPORTANCE_OPTIONS.map((opt) => (
                          <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <FormControl fullWidth size="small">
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <FormLabel sx={{ fontWeight: 500, color: 'text.primary' }}>Religious or cultural environment</FormLabel>
                        <HelpIcon helpId={164} onClick={() => openHelp(164)} />
                      </Box>
                      <Select
                        value={data.careSettingImportance.religiousCultural}
                        onChange={(e) => handleImportanceChange('religiousCultural', e.target.value)}
                      >
                        <MenuItem value="">Select...</MenuItem>
                        {IMPORTANCE_OPTIONS.map((opt) => (
                          <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <FormControl fullWidth size="small">
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <FormLabel sx={{ fontWeight: 500, color: 'text.primary' }}>Pet-friendly policies</FormLabel>
                        <HelpIcon helpId={165} onClick={() => openHelp(165)} />
                      </Box>
                      <Select
                        value={data.careSettingImportance.petFriendly}
                        onChange={(e) => handleImportanceChange('petFriendly', e.target.value)}
                      >
                        <MenuItem value="">Select...</MenuItem>
                        {IMPORTANCE_OPTIONS.map((opt) => (
                          <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <FormControl fullWidth size="small">
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <FormLabel sx={{ fontWeight: 500, color: 'text.primary' }}>Private room</FormLabel>
                        <HelpIcon helpId={166} onClick={() => openHelp(166)} />
                      </Box>
                      <Select
                        value={data.careSettingImportance.privateRoom}
                        onChange={(e) => handleImportanceChange('privateRoom', e.target.value)}
                      >
                        <MenuItem value="">Select...</MenuItem>
                        {IMPORTANCE_OPTIONS.map((opt) => (
                          <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <FormControl fullWidth size="small">
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <FormLabel sx={{ fontWeight: 500, color: 'text.primary' }}>Social activities</FormLabel>
                        <HelpIcon helpId={167} onClick={() => openHelp(167)} />
                      </Box>
                      <Select
                        value={data.careSettingImportance.socialActivities}
                        onChange={(e) => handleImportanceChange('socialActivities', e.target.value)}
                      >
                        <MenuItem value="">Select...</MenuItem>
                        {IMPORTANCE_OPTIONS.map((opt) => (
                          <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <FormControl fullWidth size="small">
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <FormLabel sx={{ fontWeight: 500, color: 'text.primary' }}>On-site medical staff</FormLabel>
                        <HelpIcon helpId={168} onClick={() => openHelp(168)} />
                      </Box>
                      <Select
                        value={data.careSettingImportance.onSiteMedicalStaff}
                        onChange={(e) => handleImportanceChange('onSiteMedicalStaff', e.target.value)}
                      >
                        <MenuItem value="">Select...</MenuItem>
                        {IMPORTANCE_OPTIONS.map((opt) => (
                          <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Do you have strong preferences about end-of-life care? (e.g., avoid hospitalizations, focus on comfort, hospice at home vs. in facility)"
                value={data.endOfLifePreferences}
                onChange={(e) => onChange('endOfLifePreferences', e.target.value)}
                multiline
                rows={3}
                variant="outlined"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Are there any specific therapies, routines, or activities that are important to your daily well-being? (e.g., church attendance, exercise, hobbies)"
                value={data.importantTherapiesActivities}
                onChange={(e) => onChange('importantTherapiesActivities', e.target.value)}
                multiline
                rows={2}
                variant="outlined"
              />
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>
    </Box>
  );
};

const LongTermCareSection: React.FC = () => {
  const { formData, updateFormData } = useFormContext();
  const showSpouseInfo = SHOW_SPOUSE_STATUSES.includes(formData.maritalStatus);

  const [activeHelpId, setActiveHelpId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<number>(0);

  const openHelp = (helpId: number) => setActiveHelpId(helpId);
  const closeHelp = () => setActiveHelpId(null);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleClientChange = (
    field: keyof LongTermCareData,
    value: LongTermCareData[keyof LongTermCareData]
  ) => {
    updateFormData({
      clientLongTermCare: {
        ...formData.clientLongTermCare,
        [field]: value,
      },
    });
  };

  const handleSpouseChange = (
    field: keyof LongTermCareData,
    value: LongTermCareData[keyof LongTermCareData]
  ) => {
    updateFormData({
      spouseLongTermCare: {
        ...formData.spouseLongTermCare,
        [field]: value,
      },
    });
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 600, color: '#1a237e' }}>
          LONG-TERM CARE PLANNING
        </Typography>
        <VideoHelpIcon helpId={130} onClick={() => openHelp(130)} size="medium" />
      </Box>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        This section helps us understand your long-term care needs, preferences, and financial situation
        to develop an appropriate asset protection and care planning strategy.
      </Typography>

      {/* Show tabs for married couples, otherwise just show client section */}
      {showSpouseInfo ? (
        <>
          {/* Person Selection Tabs */}
          <Paper variant="outlined" sx={{ mb: 3 }}>
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              variant="fullWidth"
              TabIndicatorProps={{
                style: {
                  backgroundColor: activeTab === 0 ? '#1a237e' : '#2e7d32',
                  height: 3,
                },
              }}
              sx={{
                '& .MuiTab-root': {
                  py: 2,
                  fontSize: '1rem',
                  fontWeight: 500,
                },
              }}
            >
              <Tab
                icon={<PersonIcon />}
                iconPosition="start"
                label={formData.name || 'Client'}
                sx={{
                  gap: 1,
                  '&.Mui-selected': {
                    color: '#1a237e',
                    fontWeight: 600,
                  },
                }}
              />
              <Tab
                icon={<PeopleIcon />}
                iconPosition="start"
                label={formData.spouseName || 'Spouse'}
                sx={{
                  gap: 1,
                  '&.Mui-selected': {
                    color: '#2e7d32',
                    fontWeight: 600,
                  },
                }}
              />
            </Tabs>
          </Paper>

          {/* Client Tab Content */}
          {activeTab === 0 && (
            <Paper variant="outlined" sx={{ p: 3 }}>
              <PersonLongTermCare
                data={formData.clientLongTermCare}
                onChange={handleClientChange}
                personLabel="Client"
                showSpouse={showSpouseInfo}
                headerColor="#1a237e"
                openHelp={openHelp}
              />
            </Paper>
          )}

          {/* Spouse Tab Content */}
          {activeTab === 1 && (
            <Paper variant="outlined" sx={{ p: 3 }}>
              <PersonLongTermCare
                data={formData.spouseLongTermCare}
                onChange={handleSpouseChange}
                personLabel="Spouse"
                showSpouse={showSpouseInfo}
                headerColor="#2e7d32"
                openHelp={openHelp}
              />
            </Paper>
          )}
        </>
      ) : (
        /* Single person - no tabs needed */
        <Paper variant="outlined" sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, color: '#1a237e', mb: 2 }}>
            {formData.name || 'Client'} - Long-Term Care Information
          </Typography>
          <PersonLongTermCare
            data={formData.clientLongTermCare}
            onChange={handleClientChange}
            personLabel="Client"
            showSpouse={showSpouseInfo}
            openHelp={openHelp}
          />
        </Paper>
      )}

      <HelpModal
        open={activeHelpId !== null}
        onClose={closeHelp}
        helpId={activeHelpId}
      />
    </Box>
  );
};

export default LongTermCareSection;
