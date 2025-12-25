import React, { useMemo, useState } from 'react';
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
} from '@mui/material';
import { useFormContext, FormData, MaritalStatus } from '../lib/FormContext';
import { HelpIcon, VideoHelpIcon } from './FieldWithHelp';
import HelpModal from './HelpModal';

const OTHER_VALUE = '__OTHER__';

const SHOW_SPOUSE_STATUSES: MaritalStatus[] = ['Married', 'Second Marriage', 'Domestic Partnership'];

interface BeneficiaryOption {
  value: string;
  label: string;
}

interface FiduciarySelectProps {
  label: string;
  value: string;
  otherValue: string;
  onChange: (value: string) => void;
  onOtherChange: (value: string) => void;
  options: BeneficiaryOption[];
  excludeValues?: string[];
}

const FiduciarySelect: React.FC<FiduciarySelectProps> = ({
  label,
  value,
  otherValue,
  onChange,
  onOtherChange,
  options,
  excludeValues = [],
}) => {
  const filteredOptions = options.filter(
    (opt) => !excludeValues.includes(opt.value) || opt.value === value
  );

  return (
    <>
      <FormControl fullWidth>
        <InputLabel>{label}</InputLabel>
        <Select
          value={value}
          label={label}
          onChange={(e) => {
            onChange(e.target.value);
            if (e.target.value !== OTHER_VALUE) {
              onOtherChange('');
            }
          }}
        >
          {filteredOptions.map((opt) => (
            <MenuItem key={opt.value} value={opt.value}>
              {opt.label}
            </MenuItem>
          ))}
          <MenuItem value={OTHER_VALUE}>Other</MenuItem>
        </Select>
      </FormControl>
      {value === OTHER_VALUE && (
        <TextField
          fullWidth
          label={`${label} (specify)`}
          value={otherValue}
          onChange={(e) => onOtherChange(e.target.value)}
          variant="outlined"
          sx={{ mt: 1 }}
        />
      )}
    </>
  );
};

const FiduciariesSection = () => {
  const { formData, updateFormData } = useFormContext();

  const showSpouseInfo = SHOW_SPOUSE_STATUSES.includes(formData.maritalStatus);

  // Help modal state
  const [activeHelpId, setActiveHelpId] = useState<number | null>(null);
  const openHelp = (helpId: number) => setActiveHelpId(helpId);
  const closeHelp = () => setActiveHelpId(null);

  // Show Trustee section if client or spouse has a trust OR is considering one
  const clientHasTrust = formData.clientHasLivingTrust || formData.clientHasIrrevocableTrust;
  const clientConsideringTrust = formData.clientConsideringTrust;
  const showClientTrustee = clientHasTrust || clientConsideringTrust;

  const spouseHasTrust = formData.spouseHasLivingTrust || formData.spouseHasIrrevocableTrust;
  const spouseConsideringTrust = formData.spouseConsideringTrust;
  const showSpouseTrustee = spouseHasTrust || spouseConsideringTrust;

  const showTrusteeSection = showClientTrustee || showSpouseTrustee;

  const handleChange = (field: keyof FormData) => (value: string) => {
    updateFormData({ [field]: value });
  };

  // Build beneficiary options for Client (excludes client name, includes spouse if married)
  const clientBeneficiaryOptions = useMemo((): BeneficiaryOption[] => {
    const options: BeneficiaryOption[] = [];

    // Add spouse if available and married
    if (showSpouseInfo && formData.spouseName) {
      options.push({ value: `spouse:${formData.spouseName}`, label: formData.spouseName });
    }

    // Add all children
    formData.children.forEach((child, index) => {
      if (child.name) {
        options.push({ value: `child:${index}:${child.name}`, label: child.name });
      }
    });

    // Add other beneficiaries (includes grandchildren)
    formData.otherBeneficiaries.forEach((beneficiary, index) => {
      if (beneficiary.name) {
        options.push({ value: `beneficiary:${index}:${beneficiary.name}`, label: beneficiary.name });
      }
    });

    return options;
  }, [showSpouseInfo, formData.spouseName, formData.children, formData.otherBeneficiaries]);

  // Build beneficiary options for Spouse (excludes spouse name, includes client)
  const spouseBeneficiaryOptions = useMemo((): BeneficiaryOption[] => {
    const options: BeneficiaryOption[] = [];

    // Add client if available
    if (formData.name) {
      options.push({ value: `client:${formData.name}`, label: formData.name });
    }

    // Add all children
    formData.children.forEach((child, index) => {
      if (child.name) {
        options.push({ value: `child:${index}:${child.name}`, label: child.name });
      }
    });

    // Add other beneficiaries
    formData.otherBeneficiaries.forEach((beneficiary, index) => {
      if (beneficiary.name) {
        options.push({ value: `beneficiary:${index}:${beneficiary.name}`, label: beneficiary.name });
      }
    });

    return options;
  }, [formData.name, formData.children, formData.otherBeneficiaries]);

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 600, color: '#1a237e' }}>
          FIDUCIARIES
        </Typography>
        <VideoHelpIcon helpId={104} onClick={() => openHelp(104)} size="medium" />
      </Box>

      {/* Personal Representative */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 500 }}>
          1. Personal Representative
        </Typography>
        <HelpIcon helpId={120} onClick={() => openHelp(120)} />
      </Box>
      <Typography variant="body2" sx={{ mb: 2 }}>
        Whom do you want to serve as your Personal Representative (Executor)? List at least two names.
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>Client</Typography>
        </Grid>
        <Grid item xs={12} md={4}>
          <FiduciarySelect
            label="First Choice"
            value={formData.executorFirst}
            otherValue={formData.executorFirstOther}
            onChange={handleChange('executorFirst')}
            onOtherChange={handleChange('executorFirstOther')}
            options={clientBeneficiaryOptions}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <FiduciarySelect
            label="Alternate"
            value={formData.executorAlternate}
            otherValue={formData.executorAlternateOther}
            onChange={handleChange('executorAlternate')}
            onOtherChange={handleChange('executorAlternateOther')}
            options={clientBeneficiaryOptions}
            excludeValues={[formData.executorFirst]}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <FiduciarySelect
            label="Second Alternate (Optional)"
            value={formData.executorSecondAlternate}
            otherValue={formData.executorSecondAlternateOther}
            onChange={handleChange('executorSecondAlternate')}
            onOtherChange={handleChange('executorSecondAlternateOther')}
            options={clientBeneficiaryOptions}
            excludeValues={[formData.executorFirst, formData.executorAlternate]}
          />
        </Grid>

        {showSpouseInfo && (
          <>
            <Grid item xs={12}>
              <Divider sx={{ my: 1 }} />
              <Typography variant="subtitle2" sx={{ mb: 1 }}>Spouse</Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <FiduciarySelect
                label="First Choice"
                value={formData.spouseExecutorFirst}
                otherValue={formData.spouseExecutorFirstOther}
                onChange={handleChange('spouseExecutorFirst')}
                onOtherChange={handleChange('spouseExecutorFirstOther')}
                options={spouseBeneficiaryOptions}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <FiduciarySelect
                label="Alternate"
                value={formData.spouseExecutorAlternate}
                otherValue={formData.spouseExecutorAlternateOther}
                onChange={handleChange('spouseExecutorAlternate')}
                onOtherChange={handleChange('spouseExecutorAlternateOther')}
                options={spouseBeneficiaryOptions}
                excludeValues={[formData.spouseExecutorFirst]}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <FiduciarySelect
                label="Second Alternate (Optional)"
                value={formData.spouseExecutorSecondAlternate}
                otherValue={formData.spouseExecutorSecondAlternateOther}
                onChange={handleChange('spouseExecutorSecondAlternate')}
                onOtherChange={handleChange('spouseExecutorSecondAlternateOther')}
                options={spouseBeneficiaryOptions}
                excludeValues={[formData.spouseExecutorFirst, formData.spouseExecutorAlternate]}
              />
            </Grid>
          </>
        )}
      </Grid>

      {/* Financial Power of Attorney */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 500 }}>
          2. Financial Power of Attorney
        </Typography>
        <HelpIcon helpId={121} onClick={() => openHelp(121)} />
      </Box>
      <Typography variant="body2" sx={{ mb: 2 }}>
        Whom do you want to act as your agent for financial matters if you become incapacitated?
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>Client</Typography>
        </Grid>
        <Grid item xs={12} md={4}>
          <FiduciarySelect
            label="Primary Agent"
            value={formData.financialAgentName}
            otherValue={formData.financialAgentNameOther}
            onChange={handleChange('financialAgentName')}
            onOtherChange={handleChange('financialAgentNameOther')}
            options={clientBeneficiaryOptions}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <FiduciarySelect
            label="First Successor"
            value={formData.financialAlternateName}
            otherValue={formData.financialAlternateNameOther}
            onChange={handleChange('financialAlternateName')}
            onOtherChange={handleChange('financialAlternateNameOther')}
            options={clientBeneficiaryOptions}
            excludeValues={[formData.financialAgentName]}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <FiduciarySelect
            label="Second Successor"
            value={formData.financialSecondAlternateName}
            otherValue={formData.financialSecondAlternateNameOther}
            onChange={handleChange('financialSecondAlternateName')}
            onOtherChange={handleChange('financialSecondAlternateNameOther')}
            options={clientBeneficiaryOptions}
            excludeValues={[formData.financialAgentName, formData.financialAlternateName]}
          />
        </Grid>

        {showSpouseInfo && (
          <>
            <Grid item xs={12}>
              <Divider sx={{ my: 1 }} />
              <Typography variant="subtitle2" sx={{ mb: 1 }}>Spouse</Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <FiduciarySelect
                label="Primary Agent"
                value={formData.spouseFinancialAgentName}
                otherValue={formData.spouseFinancialAgentNameOther}
                onChange={handleChange('spouseFinancialAgentName')}
                onOtherChange={handleChange('spouseFinancialAgentNameOther')}
                options={spouseBeneficiaryOptions}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <FiduciarySelect
                label="First Successor"
                value={formData.spouseFinancialAlternateName}
                otherValue={formData.spouseFinancialAlternateNameOther}
                onChange={handleChange('spouseFinancialAlternateName')}
                onOtherChange={handleChange('spouseFinancialAlternateNameOther')}
                options={spouseBeneficiaryOptions}
                excludeValues={[formData.spouseFinancialAgentName]}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <FiduciarySelect
                label="Second Successor"
                value={formData.spouseFinancialSecondAlternateName}
                otherValue={formData.spouseFinancialSecondAlternateNameOther}
                onChange={handleChange('spouseFinancialSecondAlternateName')}
                onOtherChange={handleChange('spouseFinancialSecondAlternateNameOther')}
                options={spouseBeneficiaryOptions}
                excludeValues={[formData.spouseFinancialAgentName, formData.spouseFinancialAlternateName]}
              />
            </Grid>
          </>
        )}
      </Grid>

      {/* Health Care Agent */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 500 }}>
          3. Health Care Agent
        </Typography>
        <HelpIcon helpId={122} onClick={() => openHelp(122)} />
      </Box>
      <Typography variant="body2" sx={{ mb: 2 }}>
        Whom do you want to make health care decisions for you if you become incapacitated?
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>Client</Typography>
        </Grid>
        <Grid item xs={12} md={4}>
          <FiduciarySelect
            label="Primary Agent"
            value={formData.healthCareAgentName}
            otherValue={formData.healthCareAgentNameOther}
            onChange={handleChange('healthCareAgentName')}
            onOtherChange={handleChange('healthCareAgentNameOther')}
            options={clientBeneficiaryOptions}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <FiduciarySelect
            label="First Successor"
            value={formData.healthCareAlternateName}
            otherValue={formData.healthCareAlternateNameOther}
            onChange={handleChange('healthCareAlternateName')}
            onOtherChange={handleChange('healthCareAlternateNameOther')}
            options={clientBeneficiaryOptions}
            excludeValues={[formData.healthCareAgentName]}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <FiduciarySelect
            label="Second Successor"
            value={formData.healthCareSecondAlternateName}
            otherValue={formData.healthCareSecondAlternateNameOther}
            onChange={handleChange('healthCareSecondAlternateName')}
            onOtherChange={handleChange('healthCareSecondAlternateNameOther')}
            options={clientBeneficiaryOptions}
            excludeValues={[formData.healthCareAgentName, formData.healthCareAlternateName]}
          />
        </Grid>

        {showSpouseInfo && (
          <>
            <Grid item xs={12}>
              <Divider sx={{ my: 1 }} />
              <Typography variant="subtitle2" sx={{ mb: 1 }}>Spouse</Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <FiduciarySelect
                label="Primary Agent"
                value={formData.spouseHealthCareAgentName}
                otherValue={formData.spouseHealthCareAgentNameOther}
                onChange={handleChange('spouseHealthCareAgentName')}
                onOtherChange={handleChange('spouseHealthCareAgentNameOther')}
                options={spouseBeneficiaryOptions}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <FiduciarySelect
                label="First Successor"
                value={formData.spouseHealthCareAlternateName}
                otherValue={formData.spouseHealthCareAlternateNameOther}
                onChange={handleChange('spouseHealthCareAlternateName')}
                onOtherChange={handleChange('spouseHealthCareAlternateNameOther')}
                options={spouseBeneficiaryOptions}
                excludeValues={[formData.spouseHealthCareAgentName]}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <FiduciarySelect
                label="Second Successor"
                value={formData.spouseHealthCareSecondAlternateName}
                otherValue={formData.spouseHealthCareSecondAlternateNameOther}
                onChange={handleChange('spouseHealthCareSecondAlternateName')}
                onOtherChange={handleChange('spouseHealthCareSecondAlternateNameOther')}
                options={spouseBeneficiaryOptions}
                excludeValues={[formData.spouseHealthCareAgentName, formData.spouseHealthCareAlternateName]}
              />
            </Grid>
          </>
        )}
      </Grid>

      {/* Trustee - only show if client or spouse has a trust or is considering one */}
      {showTrusteeSection && (
        <>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 500 }}>
              4. Trustee
            </Typography>
            <HelpIcon helpId={123} onClick={() => openHelp(123)} />
          </Box>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Whom do you want to serve as your Trustee for any Trust created under your estate plan?
          </Typography>

          <Grid container spacing={3} sx={{ mb: 4 }}>
            {showClientTrustee && (
              <>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>Client</Typography>
                </Grid>
                <Grid item xs={12} md={4}>
                  <FiduciarySelect
                    label="First Choice"
                    value={formData.trusteeFirst}
                    otherValue={formData.trusteeFirstOther}
                    onChange={handleChange('trusteeFirst')}
                    onOtherChange={handleChange('trusteeFirstOther')}
                    options={clientBeneficiaryOptions}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <FiduciarySelect
                    label="Alternate"
                    value={formData.trusteeAlternate}
                    otherValue={formData.trusteeAlternateOther}
                    onChange={handleChange('trusteeAlternate')}
                    onOtherChange={handleChange('trusteeAlternateOther')}
                    options={clientBeneficiaryOptions}
                    excludeValues={[formData.trusteeFirst]}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <FiduciarySelect
                    label="Second Alternate (Optional)"
                    value={formData.trusteeSecondAlternate}
                    otherValue={formData.trusteeSecondAlternateOther}
                    onChange={handleChange('trusteeSecondAlternate')}
                    onOtherChange={handleChange('trusteeSecondAlternateOther')}
                    options={clientBeneficiaryOptions}
                    excludeValues={[formData.trusteeFirst, formData.trusteeAlternate]}
                  />
                </Grid>
              </>
            )}

            {showSpouseInfo && showSpouseTrustee && (
              <>
                <Grid item xs={12}>
                  <Divider sx={{ my: 1 }} />
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>Spouse</Typography>
                </Grid>
                <Grid item xs={12} md={4}>
                  <FiduciarySelect
                    label="First Choice"
                    value={formData.spouseTrusteeFirst}
                    otherValue={formData.spouseTrusteeFirstOther}
                    onChange={handleChange('spouseTrusteeFirst')}
                    onOtherChange={handleChange('spouseTrusteeFirstOther')}
                    options={spouseBeneficiaryOptions}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <FiduciarySelect
                    label="Alternate"
                    value={formData.spouseTrusteeAlternate}
                    otherValue={formData.spouseTrusteeAlternateOther}
                    onChange={handleChange('spouseTrusteeAlternate')}
                    onOtherChange={handleChange('spouseTrusteeAlternateOther')}
                    options={spouseBeneficiaryOptions}
                    excludeValues={[formData.spouseTrusteeFirst]}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <FiduciarySelect
                    label="Second Alternate (Optional)"
                    value={formData.spouseTrusteeSecondAlternate}
                    otherValue={formData.spouseTrusteeSecondAlternateOther}
                    onChange={handleChange('spouseTrusteeSecondAlternate')}
                    onOtherChange={handleChange('spouseTrusteeSecondAlternateOther')}
                    options={spouseBeneficiaryOptions}
                    excludeValues={[formData.spouseTrusteeFirst, formData.spouseTrusteeAlternate]}
                  />
                </Grid>
              </>
            )}
          </Grid>
        </>
      )}

      {/* Guardian - only show if there are minor beneficiaries */}
      {formData.anyBeneficiariesMinors && (
        <>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 500 }}>
              5. Guardian
            </Typography>
            <HelpIcon helpId={124} onClick={() => openHelp(124)} />
          </Box>
          <Typography variant="body2" sx={{ mb: 2 }}>
            If you have minor or disabled child/children, whom do you want to act as Guardian?
          </Typography>

          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>Client</Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <FiduciarySelect
                label="First Choice"
                value={formData.guardianFirst}
                otherValue={formData.guardianFirstOther}
                onChange={handleChange('guardianFirst')}
                onOtherChange={handleChange('guardianFirstOther')}
                options={clientBeneficiaryOptions}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FiduciarySelect
                label="Alternate"
                value={formData.guardianAlternate}
                otherValue={formData.guardianAlternateOther}
                onChange={handleChange('guardianAlternate')}
                onOtherChange={handleChange('guardianAlternateOther')}
                options={clientBeneficiaryOptions}
                excludeValues={[formData.guardianFirst]}
              />
            </Grid>

            {showSpouseInfo && (
              <>
                <Grid item xs={12}>
                  <Divider sx={{ my: 1 }} />
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>Spouse</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <FiduciarySelect
                    label="First Choice"
                    value={formData.spouseGuardianFirst}
                    otherValue={formData.spouseGuardianFirstOther}
                    onChange={handleChange('spouseGuardianFirst')}
                    onOtherChange={handleChange('spouseGuardianFirstOther')}
                    options={spouseBeneficiaryOptions}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FiduciarySelect
                    label="Alternate"
                    value={formData.spouseGuardianAlternate}
                    otherValue={formData.spouseGuardianAlternateOther}
                    onChange={handleChange('spouseGuardianAlternate')}
                    onOtherChange={handleChange('spouseGuardianAlternateOther')}
                    options={spouseBeneficiaryOptions}
                    excludeValues={[formData.spouseGuardianFirst]}
                  />
                </Grid>
              </>
            )}
          </Grid>
        </>
      )}

      {/* Help Modal */}
      <HelpModal
        open={activeHelpId !== null}
        onClose={closeHelp}
        helpId={activeHelpId}
      />
    </Box>
  );
};

export default FiduciariesSection;
