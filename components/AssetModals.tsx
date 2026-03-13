"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  FormGroup,
  FormLabel,
  Box,
  Autocomplete,
  Typography,
  Divider,
  Radio,
  RadioGroup,
  Alert,
  Button,
} from "@mui/material";
import { RealEstateOwner, OwnershipForm } from "../lib/FormContext";
import CurrencyInput from "./CurrencyInput";
import FolioModal, {
  folioTextFieldSx,
  FolioCancelButton,
  FolioSaveButton,
  FolioDeleteButton,
  FolioFieldFade,
  useFolioFieldAnimation,
} from "./FolioModal";

// Validation helpers
type TouchedFields<T> = Partial<Record<keyof T, boolean>>;

const isFieldTouched = <T,>(touched: TouchedFields<T>, field: keyof T): boolean => {
  return touched[field] === true;
};

const hasValue = (value: string | undefined | null): boolean => {
  return value !== undefined && value !== null && value.trim() !== "";
};

const hasCurrencyValue = (value: string | undefined | null): boolean => {
  if (!value) return false;
  const num = parseFloat(value.replace(/[^0-9.-]/g, ""));
  return !isNaN(num) && num > 0;
};

// Constants
const ALL_OWNER_OPTIONS: RealEstateOwner[] = [
  "Client",
  "Spouse",
  "Client and Spouse",
  "Client and Other",
  "Spouse and Other",
  "Client, Spouse and Other",
  "Living Trust",
];

const CLIENT_ONLY_OWNER_OPTIONS: RealEstateOwner[] = [
  "Client",
  "Client and Other",
  "Living Trust",
];

const OWNERS_WITH_OTHER: RealEstateOwner[] = [
  "Client and Other",
  "Spouse and Other",
  "Client, Spouse and Other",
];

const ALL_INDIVIDUAL_OWNER_OPTIONS = ["Client", "Spouse"] as const;
const CLIENT_ONLY_INDIVIDUAL_OPTIONS = ["Client"] as const;

// Helper to get owner options based on showSpouse
const getOwnerOptions = (showSpouse: boolean): RealEstateOwner[] =>
  showSpouse ? ALL_OWNER_OPTIONS : CLIENT_ONLY_OWNER_OPTIONS;

const getIndividualOwnerOptions = (showSpouse: boolean) =>
  showSpouse ? ALL_INDIVIDUAL_OWNER_OPTIONS : CLIENT_ONLY_INDIVIDUAL_OPTIONS;

// Joint ownership types where Client and Spouse should be excluded from beneficiary options
// For these ownership types, the surviving joint owner automatically inherits,
// so beneficiary designations only apply after both joint owners are deceased
const JOINT_OWNER_TYPES: RealEstateOwner[] = [
  "Client and Spouse",
  "Client and Other",
  "Spouse and Other",
  "Client, Spouse and Other",
];

// Filter beneficiary options based on owner type
// Excludes Client and Spouse options appropriately:
// - For "Client" ownership: exclude Client (can't leave to yourself)
// - For "Spouse" ownership: exclude Spouse (can't leave to yourself)
// - For joint ownership: exclude both Client and Spouse
const filterBeneficiaryOptions = (
  options: BeneficiaryOption[],
  owner: string
): BeneficiaryOption[] => {
  // For jointly owned assets, exclude both Client and Spouse
  if (JOINT_OWNER_TYPES.includes(owner as RealEstateOwner)) {
    return options.filter(
      (opt) => !opt.value.startsWith("client:") && !opt.value.startsWith("spouse:")
    );
  }

  // For Client-only ownership, exclude Client from beneficiary options
  if (owner === "Client") {
    return options.filter((opt) => !opt.value.startsWith("client:"));
  }

  // For Spouse-only ownership, exclude Spouse from beneficiary options
  if (owner === "Spouse") {
    return options.filter((opt) => !opt.value.startsWith("spouse:"));
  }

  return options;
};

export interface TrustFlags {
  clientHasLivingTrust: boolean;
  clientHasIrrevocableTrust: boolean;
  spouseHasLivingTrust: boolean;
  spouseHasIrrevocableTrust: boolean;
}

// Property Category Types
export type PropertyCategory =
  | "Primary residence"
  | "Vacation home"
  | "Rental property"
  | "Vacant land"
  | "Commercial property"
  | "Timeshare"
  | "";

export const PROPERTY_CATEGORIES: PropertyCategory[] = [
  "Primary residence",
  "Vacation home",
  "Rental property",
  "Vacant land",
  "Commercial property",
  "Timeshare",
];

const getOwnershipFormOptions = (
  owner: RealEstateOwner,
  trustFlags?: TrustFlags
): OwnershipForm[] => {
  // Build trust options based on owner and trust flags
  const trustOptions: OwnershipForm[] = [];

  if (trustFlags) {
    // Determine which trust options to show based on owner
    const showClientTrusts =
      owner === "Client" ||
      owner === "Client and Spouse" ||
      owner === "Client and Other" ||
      owner === "Client, Spouse and Other";
    const showSpouseTrusts =
      owner === "Spouse" ||
      owner === "Client and Spouse" ||
      owner === "Spouse and Other" ||
      owner === "Client, Spouse and Other";

    if (showClientTrusts && trustFlags.clientHasLivingTrust) {
      trustOptions.push("Living Trust");
    }
    if (
      showSpouseTrusts &&
      trustFlags.spouseHasLivingTrust &&
      !trustOptions.includes("Living Trust")
    ) {
      trustOptions.push("Living Trust");
    }
    if (showClientTrusts && trustFlags.clientHasIrrevocableTrust) {
      trustOptions.push("Irrevocable Trust");
    }
    if (
      showSpouseTrusts &&
      trustFlags.spouseHasIrrevocableTrust &&
      !trustOptions.includes("Irrevocable Trust")
    ) {
      trustOptions.push("Irrevocable Trust");
    }
  }

  const baseOptions: OwnershipForm[] = [
    "Life Estate",
    "Lady Bird Deed",
    ...trustOptions,
    "Trust",
    "Other",
  ];

  switch (owner) {
    case "Client":
    case "Spouse":
      return ["Sole", ...baseOptions];
    case "Client and Spouse":
      return [
        "Tenants by Entirety",
        "JTWROS",
        "Tenants in Common",
        ...baseOptions,
      ];
    case "Client and Other":
    case "Spouse and Other":
    case "Client, Spouse and Other":
      return ["JTWROS", "Tenants in Common", ...baseOptions];
    default:
      return baseOptions;
  }
};

export interface BeneficiaryOption {
  value: string;
  label: string;
}

interface BeneficiarySelectorProps {
  label: string;
  selectedBeneficiaries: string[];
  options: BeneficiaryOption[];
  onChange: (selected: string[]) => void;
  distributionType?: 'Per Stirpes' | 'Per Capita' | '';
  onDistributionTypeChange?: (type: 'Per Stirpes' | 'Per Capita' | '') => void;
  showDistributionType?: boolean;
}

const BeneficiarySelector: React.FC<BeneficiarySelectorProps> = ({
  label,
  selectedBeneficiaries,
  options,
  onChange,
  distributionType = '',
  onDistributionTypeChange,
  showDistributionType = false,
}) => {
  return (
    <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
      <Box sx={{ flex: 1 }}>
        <Autocomplete
          multiple
          size="small"
          options={options}
          getOptionLabel={(option) => option.label}
          value={options.filter((opt) => selectedBeneficiaries.includes(opt.value))}
          onChange={(_, newValue) => {
            onChange(newValue.map((v) => v.value));
          }}
          renderInput={(params) => (
            <TextField {...params} label={label} variant="outlined" sx={{ ...folioTextFieldSx }} />
          )}
          isOptionEqualToValue={(option, value) => option.value === value.value}
        />
      </Box>
      {showDistributionType && onDistributionTypeChange && (
        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel>Distribution</InputLabel>
          <Select
            value={distributionType}
            label="Distribution"
            onChange={(e) => onDistributionTypeChange(e.target.value as 'Per Stirpes' | 'Per Capita' | '')}
          >
            <MenuItem value="">Select...</MenuItem>
            <MenuItem value="Per Stirpes">Per Stirpes</MenuItem>
            <MenuItem value="Per Capita">Per Capita</MenuItem>
          </Select>
        </FormControl>
      )}
    </Box>
  );
};

interface JointOwnerSelectorProps {
  showBeneficiaries: boolean;
  showOther: boolean;
  jointOwnerBeneficiaries: string[];
  jointOwnerOther: string;
  beneficiaryOptions: BeneficiaryOption[];
  onChange: (updates: {
    showBeneficiaries?: boolean;
    showOther?: boolean;
    jointOwnerBeneficiaries?: string[];
    jointOwnerOther?: string;
  }) => void;
}

const JointOwnerSelector: React.FC<JointOwnerSelectorProps> = ({
  showBeneficiaries,
  showOther,
  jointOwnerBeneficiaries,
  jointOwnerOther,
  beneficiaryOptions,
  onChange,
}) => {
  const handleBeneficiaryTypeChange = (checked: boolean) => {
    onChange({ showBeneficiaries: checked });
    if (!checked) {
      onChange({ showBeneficiaries: false, jointOwnerBeneficiaries: [] });
    }
  };

  const handleOtherTypeChange = (checked: boolean) => {
    onChange({ showOther: checked });
    if (!checked) {
      onChange({ showOther: false, jointOwnerOther: "" });
    }
  };

  return (
    <Box sx={{ mt: 2, p: 2, bgcolor: "grey.50", borderRadius: 1 }}>
      <FormLabel component="legend" sx={{ mb: 1, fontWeight: 500 }}>
        Who is the &quot;Other&quot; owner?
      </FormLabel>
      <FormGroup row>
        <FormControlLabel
          control={
            <Checkbox
              checked={showBeneficiaries}
              onChange={(e) => handleBeneficiaryTypeChange(e.target.checked)}
            />
          }
          label="Current Beneficiaries"
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={showOther}
              onChange={(e) => handleOtherTypeChange(e.target.checked)}
            />
          }
          label="Non-Beneficiary"
        />
      </FormGroup>

      {showBeneficiaries && (
        <Box sx={{ mt: 2 }}>
          <FormGroup>
            {beneficiaryOptions.map((option) => (
              <FormControlLabel
                key={option.value}
                control={
                  <Checkbox
                    checked={jointOwnerBeneficiaries.includes(option.value)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        onChange({
                          jointOwnerBeneficiaries: [
                            ...jointOwnerBeneficiaries,
                            option.value,
                          ],
                        });
                      } else {
                        onChange({
                          jointOwnerBeneficiaries:
                            jointOwnerBeneficiaries.filter(
                              (b) => b !== option.value
                            ),
                        });
                      }
                    }}
                  />
                }
                label={option.label}
              />
            ))}
          </FormGroup>
        </Box>
      )}

      {showOther && (
        <Box sx={{ mt: 2 }}>
          <TextField
            fullWidth
            size="small"
            label="Name of Other Owner(s)"
            value={jointOwnerOther}
            onChange={(e) => onChange({ jointOwnerOther: e.target.value })}
            variant="outlined"
            placeholder="Enter name(s) of other owner(s)"
            sx={{ ...folioTextFieldSx }}
          />
        </Box>
      )}
    </Box>
  );
};

// Real Estate Types
export interface RealEstateData {
  owner: RealEstateOwner;
  ownershipForm: OwnershipForm;
  category: PropertyCategory;
  showBeneficiaries: boolean;
  showOther: boolean;
  jointOwnerBeneficiaries: string[];
  jointOwnerOther: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  value: string;
  mortgageBalance: string;
  costBasis: string;
  primaryBeneficiaries: string[]; // Used for Remainder Interest when Life Estate or Lady Bird Deed
  remainderInterestOther: string; // Name of non-beneficiary remainder interest holder
  clientOwnershipPercentage: string; // For Tenants in Common
  spouseOwnershipPercentage: string; // For Tenants in Common
  clientSpouseJointType: string; // For TIC with "Client, Spouse and Other" - how client/spouse own their share (TBE or JTWROS)
  clientSpouseCombinedPercentage: string; // For TIC with "Client, Spouse and Other" when owned as TBE/JTWROS - their combined share percentage
  notes: string;
}

const emptyRealEstate: RealEstateData = {
  owner: "" as RealEstateOwner,
  ownershipForm: "" as OwnershipForm,
  category: "" as PropertyCategory,
  showBeneficiaries: false,
  showOther: false,
  jointOwnerBeneficiaries: [],
  jointOwnerOther: "",
  street: "",
  city: "",
  state: "",
  zip: "",
  value: "",
  mortgageBalance: "",
  costBasis: "",
  primaryBeneficiaries: [],
  remainderInterestOther: "",
  clientOwnershipPercentage: "",
  spouseOwnershipPercentage: "",
  clientSpouseJointType: "",
  clientSpouseCombinedPercentage: "",
  notes: "",
};

interface RealEstateModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: RealEstateData) => void;
  onDelete?: () => void;
  initialData?: RealEstateData;
  beneficiaryOptions: BeneficiaryOption[];
  isEdit?: boolean;
  showSpouse?: boolean;
  trustFlags?: TrustFlags;
}

export const RealEstateModal: React.FC<RealEstateModalProps> = ({
  open,
  onClose,
  onSave,
  onDelete,
  initialData,
  beneficiaryOptions,
  isEdit = false,
  showSpouse = true,
  trustFlags,
}) => {
  const ownerOptions = getOwnerOptions(showSpouse);
  const [data, setData] = useState<RealEstateData>(
    initialData || emptyRealEstate
  );
  const [touched, setTouched] = useState<TouchedFields<RealEstateData>>({});

  useEffect(() => {
    if (open) {
      // Always reset to empty when adding new (isEdit false), otherwise use initialData
      setData(isEdit && initialData ? initialData : emptyRealEstate);
      setTouched({}); // Reset touched state when modal opens
    }
  }, [open, initialData, isEdit]);

  const handleChange = (updates: Partial<RealEstateData>) => {
    setData((prev) => ({ ...prev, ...updates }));
  };

  const handleBlur = (field: keyof RealEstateData) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const fieldsVisible = useFolioFieldAnimation(open);

  const handleOwnerChange = (newOwner: RealEstateOwner) => {
    const updates: Partial<RealEstateData> = {
      owner: newOwner,
      ownershipForm: "" as OwnershipForm,
      clientOwnershipPercentage: "",
      spouseOwnershipPercentage: "",
      clientSpouseJointType: "",
      clientSpouseCombinedPercentage: "",
    };
    if (!OWNERS_WITH_OTHER.includes(newOwner)) {
      updates.showBeneficiaries = false;
      updates.showOther = false;
      updates.jointOwnerBeneficiaries = [];
      updates.jointOwnerOther = "";
    }
    handleChange(updates);
    setTouched((prev) => ({ ...prev, owner: true }));
  };

  const handleOwnershipFormChange = (newForm: OwnershipForm) => {
    const updates: Partial<RealEstateData> = {
      ownershipForm: newForm,
    };
    if (newForm !== "Tenants in Common") {
      updates.clientOwnershipPercentage = "";
      updates.spouseOwnershipPercentage = "";
      updates.clientSpouseJointType = "";
      updates.clientSpouseCombinedPercentage = "";
    }
    handleChange(updates);
    setTouched((prev) => ({ ...prev, ownershipForm: true }));
  };

  // Validation
  const errors = {
    owner: !hasValue(data.owner),
    ownershipForm: !hasValue(data.ownershipForm),
    street: !hasValue(data.street),
    city: !hasValue(data.city),
    state: !hasValue(data.state),
    value: !hasCurrencyValue(data.value),
  };

  const isValid = !errors.owner && !errors.ownershipForm && !errors.street &&
                  !errors.city && !errors.state && !errors.value;

  const handleSave = () => {
    // Mark all required fields as touched to show errors
    setTouched({
      owner: true,
      ownershipForm: true,
      street: true,
      city: true,
      state: true,
      value: true,
    });

    if (isValid) {
      onSave(data);
      onClose();
    }
  };

  return (
    <FolioModal
      open={open}
      onClose={onClose}
      title={isEdit ? "Edit Property" : "Add Property"}
      eyebrow="My Life Folio — Assets"
      maxWidth="md"
      footer={
        <>
          <Box>
            {isEdit && onDelete && <FolioDeleteButton onClick={onDelete} />}
          </Box>
          <Box sx={{ display: 'flex', gap: 1.5 }}>
            <FolioCancelButton onClick={onClose} />
            <FolioSaveButton onClick={handleSave} disabled={!isValid}>
              {isEdit ? "Save Changes" : "Add Property"}
            </FolioSaveButton>
          </Box>
        </>
      }
    >
      <FolioFieldFade visible={fieldsVisible} index={0}>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12} md={6}>
            <FormControl
              fullWidth
              size="small"
              error={touched.owner && errors.owner}
            >
              <InputLabel>Owner *</InputLabel>
              <Select
                value={data.owner}
                label="Owner *"
                onChange={(e) =>
                  handleOwnerChange(e.target.value as RealEstateOwner)
                }
              >
                {ownerOptions.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl
              fullWidth
              size="small"
              disabled={!data.owner}
              error={touched.ownershipForm && errors.ownershipForm}
            >
              <InputLabel>Ownership Form *</InputLabel>
              <Select
                value={data.ownershipForm}
                label="Ownership Form *"
                onChange={(e) =>
                  handleOwnershipFormChange(e.target.value as OwnershipForm)
                }
              >
                {getOwnershipFormOptions(data.owner, trustFlags).map(
                  (option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  )
                )}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth size="small">
              <InputLabel>Property Category</InputLabel>
              <Select
                value={data.category}
                label="Property Category"
                onChange={(e) =>
                  handleChange({ category: e.target.value as PropertyCategory })
                }
              >
                {PROPERTY_CATEGORIES.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {OWNERS_WITH_OTHER.includes(data.owner) && (
            <Grid item xs={12}>
              <JointOwnerSelector
                showBeneficiaries={data.showBeneficiaries}
                showOther={data.showOther}
                jointOwnerBeneficiaries={data.jointOwnerBeneficiaries}
                jointOwnerOther={data.jointOwnerOther}
                beneficiaryOptions={beneficiaryOptions}
                onChange={(updates) =>
                  handleChange(updates as Partial<RealEstateData>)
                }
              />
            </Grid>
          )}

          {data.ownershipForm === "Tenants in Common" && (
            <Grid item xs={12}>
              <Box sx={{ p: 2, bgcolor: "grey.50", borderRadius: 1 }}>
                <Typography variant="subtitle2" sx={{ mb: 2 }}>
                  Ownership Percentages
                </Typography>
                <Grid container spacing={2}>
                  {data.owner === "Client, Spouse and Other" && (
                    <Grid item xs={12} md={4}>
                      <FormControl fullWidth size="small">
                        <InputLabel>
                          Client and Spouse combined share?
                        </InputLabel>
                        <Select
                          value={data.clientSpouseJointType}
                          label="Client and Spouse combined share?"
                          onChange={(e) => {
                            const newJointType = e.target.value;
                            // When joint type is selected (TBE/JTWROS), clear individual percentages
                            // When joint type is cleared, clear combined percentage
                            if (newJointType) {
                              handleChange({
                                clientSpouseJointType: newJointType,
                                clientOwnershipPercentage: "",
                                spouseOwnershipPercentage: "",
                              });
                            } else {
                              handleChange({
                                clientSpouseJointType: "",
                                clientSpouseCombinedPercentage: "",
                              });
                            }
                          }}
                        >
                          <MenuItem value="">Select...</MenuItem>
                          <MenuItem value="Tenants by Entirety">
                            Tenants by Entirety
                          </MenuItem>
                          <MenuItem value="JTWROS">
                            Joint Tenants with Rights of Survivorship
                          </MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                  )}
                  {/* Show combined % when Client+Spouse own as TBE/JTWROS */}
                  {data.owner === "Client, Spouse and Other" &&
                    data.clientSpouseJointType && (
                      <Grid item xs={12} md={4}>
                        <TextField
                          fullWidth
                          size="small"
                          label="Client & Spouse Combined %"
                          value={data.clientSpouseCombinedPercentage}
                          onChange={(e) =>
                            handleChange({
                              clientSpouseCombinedPercentage: e.target.value,
                            })
                          }
                          variant="outlined"
                          placeholder="e.g., 50"
                          sx={{ ...folioTextFieldSx }}
                        />
                      </Grid>
                    )}
                  {/* Show Client % when NOT using combined ownership for Client, Spouse and Other */}
                  {(data.owner === "Client" ||
                    data.owner === "Client and Spouse" ||
                    data.owner === "Client and Other" ||
                    (data.owner === "Client, Spouse and Other" &&
                      !data.clientSpouseJointType)) && (
                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Client's Ownership %"
                        value={data.clientOwnershipPercentage}
                        onChange={(e) =>
                          handleChange({
                            clientOwnershipPercentage: e.target.value,
                          })
                        }
                        variant="outlined"
                        placeholder="e.g., 50"
                        sx={{ ...folioTextFieldSx }}
                      />
                    </Grid>
                  )}
                  {/* Show Spouse % when NOT using combined ownership for Client, Spouse and Other */}
                  {(data.owner === "Spouse" ||
                    data.owner === "Client and Spouse" ||
                    data.owner === "Spouse and Other" ||
                    (data.owner === "Client, Spouse and Other" &&
                      !data.clientSpouseJointType)) && (
                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Spouse's Ownership %"
                        value={data.spouseOwnershipPercentage}
                        onChange={(e) =>
                          handleChange({
                            spouseOwnershipPercentage: e.target.value,
                          })
                        }
                        variant="outlined"
                        placeholder="e.g., 50"
                        sx={{ ...folioTextFieldSx }}
                      />
                    </Grid>
                  )}
                </Grid>
              </Box>
            </Grid>
          )}

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Street Address *"
              value={data.street}
              onChange={(e) => handleChange({ street: e.target.value })}
              onBlur={() => handleBlur("street")}
              variant="outlined"
              size="small"
              error={touched.street && errors.street}
              helperText={touched.street && errors.street ? "Required" : ""}
              sx={{ ...folioTextFieldSx }}
            />
          </Grid>
          <Grid item xs={12} md={5}>
            <TextField
              fullWidth
              label="City *"
              value={data.city}
              onChange={(e) => handleChange({ city: e.target.value })}
              onBlur={() => handleBlur("city")}
              variant="outlined"
              size="small"
              error={touched.city && errors.city}
              helperText={touched.city && errors.city ? "Required" : ""}
              sx={{ ...folioTextFieldSx }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              label="State *"
              value={data.state}
              onChange={(e) => handleChange({ state: e.target.value })}
              onBlur={() => handleBlur("state")}
              variant="outlined"
              size="small"
              error={touched.state && errors.state}
              helperText={touched.state && errors.state ? "Required" : ""}
              sx={{ ...folioTextFieldSx }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Zip Code"
              value={data.zip}
              onChange={(e) => handleChange({ zip: e.target.value })}
              variant="outlined"
              size="small"
              sx={{ ...folioTextFieldSx }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <CurrencyInput
              fullWidth
              label="Estimated Value *"
              value={data.value}
              onChange={(e) => handleChange({ value: e.target.value })}
              onBlur={() => handleBlur("value")}
              variant="outlined"
              size="small"
              name="realEstateValue"
              error={touched.value && errors.value}
              helperText={touched.value && errors.value ? "Required" : ""}
              sx={{ ...folioTextFieldSx }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <CurrencyInput
              fullWidth
              label="Mortgage Balance"
              value={data.mortgageBalance}
              onChange={(e) =>
                handleChange({ mortgageBalance: e.target.value })
              }
              variant="outlined"
              size="small"
              name="mortgageBalance"
              sx={{ ...folioTextFieldSx }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <CurrencyInput
              fullWidth
              label="Cost Basis"
              value={data.costBasis}
              onChange={(e) => handleChange({ costBasis: e.target.value })}
              variant="outlined"
              size="small"
              name="costBasis"
              sx={{ ...folioTextFieldSx }}
            />
          </Grid>

          {(data.ownershipForm === "Life Estate" ||
            data.ownershipForm === "Lady Bird Deed") && (
            <>
              <Grid item xs={12}>
                <BeneficiarySelector
                  label="Remainder Interest"
                  selectedBeneficiaries={data.primaryBeneficiaries}
                  options={filterBeneficiaryOptions(beneficiaryOptions, data.owner)}
                  onChange={(selected) =>
                    handleChange({ primaryBeneficiaries: selected })
                  }
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  size="small"
                  label="Other Remainder Interest Holder (non-beneficiary)"
                  value={data.remainderInterestOther || ""}
                  onChange={(e) =>
                    handleChange({ remainderInterestOther: e.target.value })
                  }
                  variant="outlined"
                  placeholder="Enter name if not listed above"
                  sx={{ ...folioTextFieldSx }}
                />
              </Grid>
            </>
          )}

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Notes"
              value={data.notes || ""}
              onChange={(e) => handleChange({ notes: e.target.value })}
              variant="outlined"
              multiline
              rows={4}
              sx={{ ...folioTextFieldSx }}
              placeholder="Enter any additional notes about this property..."
            />
          </Grid>
        </Grid>
      </FolioFieldFade>
    </FolioModal>
  );
};

// Bank Account Types
export type BankAccountType =
  | "Checking"
  | "Savings"
  | "Money Market"
  | "Certificate of Deposit"
  | "Christmas Club"
  | "Health Savings Account"
  | "Cash Management"
  | "Other"
  | "";

export const BANK_ACCOUNT_TYPES: BankAccountType[] = [
  "Checking",
  "Savings",
  "Money Market",
  "Certificate of Deposit",
  "Christmas Club",
  "Health Savings Account",
  "Cash Management",
  "Other",
];

// Distribution type for beneficiaries
export type DistributionType = 'Per Stirpes' | 'Per Capita' | '';

export const DISTRIBUTION_TYPES: DistributionType[] = ['Per Stirpes', 'Per Capita'];

// Disposition types for asset transfer
export type DispositionType =
  | 'beneficiary_designation' // Via existing beneficiary designation (POD/TOD)
  | 'specific_bequest' // Via specific bequest in will
  | 'residuary' // Through residuary of estate
  | '';

export type JointDispositionType =
  | 'existing_beneficiary' // Via existing beneficiary designation
  | 'specific_bequest' // Via specific bequest in surviving spouse's will
  | 'residuary' // Through residuary of surviving spouse's estate
  | '';

// Helper to determine if owner is an individual (sole owner)
const isIndividualOwner = (owner: string): boolean => {
  return owner === 'Client' || owner === 'Spouse';
};

// Helper to determine if owner is joint with spouse only
const isJointWithSpouseOnly = (owner: string): boolean => {
  return owner === 'Client and Spouse';
};

// Helper to determine if owner includes "Other" (non-spouse joint owner)
const hasOtherJointOwner = (owner: string): boolean => {
  return owner === 'Client and Other' ||
         owner === 'Spouse and Other' ||
         owner === 'Client, Spouse and Other';
};

// Disposition Section Component for assets with ownership-based disposition logic
interface DispositionSectionProps {
  owner: string;
  // Individual owner fields
  hasBeneficiaryDesignation?: boolean;
  onBeneficiaryDesignationChange?: (value: boolean) => void;
  wantsSpecificBequest?: boolean;
  onWantsSpecificBequestChange?: (value: boolean) => void;
  // Joint with spouse fields
  jointDisposition?: JointDispositionType;
  onJointDispositionChange?: (value: JointDispositionType) => void;
  // Joint with other fields
  jointOwnerIntentConfirmed?: boolean;
  onJointOwnerIntentChange?: (value: boolean) => void;
  // Beneficiary/Legatee selection
  primaryBeneficiaries: string[];
  secondaryBeneficiaries: string[];
  primaryLegatees: string[];
  secondaryLegatees: string[];
  onPrimaryBeneficiariesChange: (value: string[]) => void;
  onSecondaryBeneficiariesChange: (value: string[]) => void;
  onPrimaryLegateesChange: (value: string[]) => void;
  onSecondaryLegateesChange: (value: string[]) => void;
  primaryDistributionType: DistributionType;
  secondaryDistributionType: DistributionType;
  primaryLegateeDistributionType: DistributionType;
  secondaryLegateeDistributionType: DistributionType;
  onPrimaryDistributionTypeChange: (value: DistributionType) => void;
  onSecondaryDistributionTypeChange: (value: DistributionType) => void;
  onPrimaryLegateeDistributionTypeChange: (value: DistributionType) => void;
  onSecondaryLegateeDistributionTypeChange: (value: DistributionType) => void;
  beneficiaryOptions: BeneficiaryOption[];
}

const DispositionSection: React.FC<DispositionSectionProps> = ({
  owner,
  hasBeneficiaryDesignation,
  onBeneficiaryDesignationChange,
  wantsSpecificBequest,
  onWantsSpecificBequestChange,
  jointDisposition,
  onJointDispositionChange,
  jointOwnerIntentConfirmed,
  onJointOwnerIntentChange,
  primaryBeneficiaries,
  secondaryBeneficiaries,
  primaryLegatees,
  secondaryLegatees,
  onPrimaryBeneficiariesChange,
  onSecondaryBeneficiariesChange,
  onPrimaryLegateesChange,
  onSecondaryLegateesChange,
  primaryDistributionType,
  secondaryDistributionType,
  primaryLegateeDistributionType,
  secondaryLegateeDistributionType,
  onPrimaryDistributionTypeChange,
  onSecondaryDistributionTypeChange,
  onPrimaryLegateeDistributionTypeChange,
  onSecondaryLegateeDistributionTypeChange,
  beneficiaryOptions,
}) => {
  const filteredBeneficiaryOptions = filterBeneficiaryOptions(beneficiaryOptions, owner);

  // Individual owner (Client or Spouse in sole name)
  if (isIndividualOwner(owner)) {
    return (
      <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
        <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
          Disposition of the Asset
        </Typography>

        <FormControl component="fieldset" sx={{ mb: 2 }}>
          <FormLabel component="legend">
            Is there a beneficiary designation on record for this asset? (POD, TOD)
          </FormLabel>
          <RadioGroup
            row
            value={hasBeneficiaryDesignation === true ? 'yes' : hasBeneficiaryDesignation === false ? 'no' : ''}
            onChange={(e) => onBeneficiaryDesignationChange?.(e.target.value === 'yes')}
          >
            <FormControlLabel value="yes" control={<Radio size="small" />} label="Yes" />
            <FormControlLabel value="no" control={<Radio size="small" />} label="No" />
          </RadioGroup>
        </FormControl>

        {hasBeneficiaryDesignation === true && (
          <>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <BeneficiarySelector
                  label="Primary Beneficiaries"
                  selectedBeneficiaries={primaryBeneficiaries}
                  options={filteredBeneficiaryOptions}
                  onChange={onPrimaryBeneficiariesChange}
                  showDistributionType={true}
                  distributionType={primaryDistributionType}
                  onDistributionTypeChange={onPrimaryDistributionTypeChange}
                />
              </Grid>
              <Grid item xs={12}>
                <BeneficiarySelector
                  label="Secondary Beneficiaries"
                  selectedBeneficiaries={secondaryBeneficiaries}
                  options={filteredBeneficiaryOptions}
                  onChange={onSecondaryBeneficiariesChange}
                  showDistributionType={true}
                  distributionType={secondaryDistributionType}
                  onDistributionTypeChange={onSecondaryDistributionTypeChange}
                />
              </Grid>
            </Grid>
          </>
        )}

      </Box>
    );
  }

  // Joint with spouse only
  if (isJointWithSpouseOnly(owner)) {
    return (
      <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
        <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
          Disposition of the Asset
        </Typography>

        <Typography variant="body2" sx={{ mb: 2, fontStyle: 'italic' }}>
          At first death, this passes automatically to the surviving spouse. How should it pass when the second spouse dies?
        </Typography>

        <FormControl component="fieldset" sx={{ mb: 2 }}>
          <RadioGroup
            value={jointDisposition || ''}
            onChange={(e) => onJointDispositionChange?.(e.target.value as JointDispositionType)}
          >
            <FormControlLabel
              value="existing_beneficiary"
              control={<Radio size="small" />}
              label="Via existing beneficiary designation"
            />
            <FormControlLabel
              value="specific_bequest"
              control={<Radio size="small" />}
              label="Via a specific bequest in the surviving spouse's will"
            />
            <FormControlLabel
              value="residuary"
              control={<Radio size="small" />}
              label="Through the residuary of the surviving spouse's estate"
            />
          </RadioGroup>
        </FormControl>

        {jointDisposition === 'existing_beneficiary' && (
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <BeneficiarySelector
                label="Primary Beneficiaries"
                selectedBeneficiaries={primaryBeneficiaries}
                options={filteredBeneficiaryOptions}
                onChange={onPrimaryBeneficiariesChange}
                showDistributionType={true}
                distributionType={primaryDistributionType}
                onDistributionTypeChange={onPrimaryDistributionTypeChange}
              />
            </Grid>
            <Grid item xs={12}>
              <BeneficiarySelector
                label="Secondary Beneficiaries"
                selectedBeneficiaries={secondaryBeneficiaries}
                options={filteredBeneficiaryOptions}
                onChange={onSecondaryBeneficiariesChange}
                showDistributionType={true}
                distributionType={secondaryDistributionType}
                onDistributionTypeChange={onSecondaryDistributionTypeChange}
              />
            </Grid>
          </Grid>
        )}

        {jointDisposition === 'specific_bequest' && (
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <BeneficiarySelector
                label="Primary Legatees"
                selectedBeneficiaries={primaryLegatees}
                options={filteredBeneficiaryOptions}
                onChange={onPrimaryLegateesChange}
                showDistributionType={true}
                distributionType={primaryLegateeDistributionType}
                onDistributionTypeChange={onPrimaryLegateeDistributionTypeChange}
              />
            </Grid>
            <Grid item xs={12}>
              <BeneficiarySelector
                label="Secondary Legatees"
                selectedBeneficiaries={secondaryLegatees}
                options={filteredBeneficiaryOptions}
                onChange={onSecondaryLegateesChange}
                showDistributionType={true}
                distributionType={secondaryLegateeDistributionType}
                onDistributionTypeChange={onSecondaryLegateeDistributionTypeChange}
              />
            </Grid>
          </Grid>
        )}
      </Box>
    );
  }

  // Joint with other (Client and Other, Spouse and Other, or Client, Spouse and Other)
  if (hasOtherJointOwner(owner)) {
    return (
      <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
        <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
          Disposition of the Asset
        </Typography>

        <Typography variant="body2" sx={{ mb: 2 }}>
          This asset passes to the joint owner upon death. Is this your intent?
        </Typography>

        <FormControl component="fieldset" sx={{ mb: 2 }}>
          <RadioGroup
            row
            value={jointOwnerIntentConfirmed === true ? 'yes' : jointOwnerIntentConfirmed === false ? 'no' : ''}
            onChange={(e) => onJointOwnerIntentChange?.(e.target.value === 'yes')}
          >
            <FormControlLabel value="yes" control={<Radio size="small" />} label="Yes" />
            <FormControlLabel value="no" control={<Radio size="small" />} label="No" />
          </RadioGroup>
        </FormControl>

        {jointOwnerIntentConfirmed === false && (
          <Alert severity="warning" sx={{ mt: 1 }}>
            This asset should be reviewed, and retitling is possibly recommended.
          </Alert>
        )}
      </Box>
    );
  }

  return null;
};

export interface BankAccountData {
  owner: string;
  accountType: BankAccountType;
  institution: string;
  amount: string;
  // TOD (Transfer On Death) fields
  hasTOD?: boolean;
  todPrimaryBeneficiary?: string;
  todSecondaryBeneficiary?: string;
  // Disposition fields
  hasBeneficiaryDesignation?: boolean; // For sole owners: Is there a POD/TOD?
  wantsSpecificBequest?: boolean; // For sole owners without POD/TOD: Do they want specific bequest?
  jointDisposition?: JointDispositionType; // For joint with spouse: How should it pass at second death?
  jointOwnerIntentConfirmed?: boolean; // For joint with other: Is passing to joint owner intended?
  // Legacy field - kept for backward compatibility
  hasBeneficiaries: boolean;
  primaryBeneficiaries: string[];
  primaryDistributionType: DistributionType;
  secondaryBeneficiaries: string[];
  secondaryDistributionType: DistributionType;
  // Legatee fields for specific bequests
  primaryLegatees: string[];
  primaryLegateeDistributionType: DistributionType;
  secondaryLegatees: string[];
  secondaryLegateeDistributionType: DistributionType;
  notes: string;
}

const emptyBankAccount: BankAccountData = {
  owner: "",
  accountType: "",
  institution: "",
  amount: "",
  hasTOD: undefined,
  todPrimaryBeneficiary: "",
  todSecondaryBeneficiary: "",
  hasBeneficiaryDesignation: undefined,
  wantsSpecificBequest: undefined,
  jointDisposition: undefined,
  jointOwnerIntentConfirmed: undefined,
  hasBeneficiaries: false,
  primaryBeneficiaries: [],
  primaryDistributionType: "",
  secondaryBeneficiaries: [],
  secondaryDistributionType: "",
  primaryLegatees: [],
  primaryLegateeDistributionType: "",
  secondaryLegatees: [],
  secondaryLegateeDistributionType: "",
  notes: "",
};

interface BankAccountModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: BankAccountData) => void;
  onDelete?: () => void;
  initialData?: BankAccountData;
  beneficiaryOptions: BeneficiaryOption[];
  isEdit?: boolean;
  showSpouse?: boolean;
  trustFlags?: TrustFlags;
}

export const BankAccountModal: React.FC<BankAccountModalProps> = ({
  open,
  onClose,
  onSave,
  onDelete,
  initialData,
  beneficiaryOptions,
  isEdit = false,
  showSpouse = true,
  trustFlags,
}) => {
  const ownerOptions = getOwnerOptions(showSpouse);
  const [data, setData] = useState<BankAccountData>(
    initialData || emptyBankAccount
  );
  const [touched, setTouched] = useState<TouchedFields<BankAccountData>>({});

  // Build trust options based on flags
  const trustOwnerOptions: string[] = [];
  if (trustFlags) {
    if (trustFlags.clientHasLivingTrust) {
      trustOwnerOptions.push("Client's Living Trust");
    }
    if (trustFlags.clientHasIrrevocableTrust) {
      trustOwnerOptions.push("Client's Irrevocable Trust");
    }
    if (showSpouse && trustFlags.spouseHasLivingTrust) {
      trustOwnerOptions.push("Spouse's Living Trust");
    }
    if (showSpouse && trustFlags.spouseHasIrrevocableTrust) {
      trustOwnerOptions.push("Spouse's Irrevocable Trust");
    }
  }

  // Combine all owner options
  const allOwnerOptions = [...ownerOptions, ...trustOwnerOptions];
  const fieldsVisible = useFolioFieldAnimation(open);

  useEffect(() => {
    if (open) {
      // Always reset to empty when adding new (isEdit false), otherwise use initialData
      setData(isEdit && initialData ? initialData : emptyBankAccount);
      setTouched({});
    }
  }, [open, initialData, isEdit]);

  const handleChange = (updates: Partial<BankAccountData>) => {
    setData((prev) => ({ ...prev, ...updates }));
  };

  const handleBlur = (field: keyof BankAccountData) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  // Validation
  const errors = {
    owner: !hasValue(data.owner),
    accountType: !hasValue(data.accountType),
    institution: !hasValue(data.institution),
    amount: !hasCurrencyValue(data.amount),
  };

  const isValid = !errors.owner && !errors.accountType && !errors.institution && !errors.amount;

  const handleSave = () => {
    setTouched({ owner: true, accountType: true, institution: true, amount: true });
    if (isValid) {
      onSave(data);
      onClose();
    }
  };

  return (
    <FolioModal
      open={open}
      onClose={onClose}
      title={isEdit ? "Edit Bank Account" : "Add Bank Account"}
      eyebrow="My Life Folio — Assets"
      footer={
        <>
          <Box>
            {isEdit && onDelete && <FolioDeleteButton onClick={onDelete} />}
          </Box>
          <Box sx={{ display: 'flex', gap: 1.5 }}>
            <FolioCancelButton onClick={onClose} />
            <FolioSaveButton onClick={handleSave} disabled={!isValid}>
              {isEdit ? "Save Changes" : "Add Account"}
            </FolioSaveButton>
          </Box>
        </>
      }
    >
      <FolioFieldFade visible={fieldsVisible} index={0}>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12} md={6}>
            <FormControl
              fullWidth
              size="small"
              error={touched.owner && errors.owner}
            >
              <InputLabel>Owner *</InputLabel>
              <Select
                value={data.owner}
                label="Owner *"
                onChange={(e) => {
                  handleChange({ owner: e.target.value });
                  setTouched((prev) => ({ ...prev, owner: true }));
                }}
              >
                {allOwnerOptions.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl
              fullWidth
              size="small"
              error={touched.accountType && errors.accountType}
            >
              <InputLabel>Account Type *</InputLabel>
              <Select
                value={data.accountType}
                label="Account Type *"
                onChange={(e) => {
                  handleChange({ accountType: e.target.value as BankAccountType });
                  setTouched((prev) => ({ ...prev, accountType: true }));
                }}
              >
                {BANK_ACCOUNT_TYPES.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Name of Financial Institution *"
              value={data.institution}
              onChange={(e) => handleChange({ institution: e.target.value })}
              onBlur={() => handleBlur("institution")}
              variant="outlined"
              size="small"
              error={touched.institution && errors.institution}
              helperText={touched.institution && errors.institution ? "Required" : ""}
              sx={{ ...folioTextFieldSx }}
            />
          </Grid>
          <Grid item xs={12}>
            <CurrencyInput
              fullWidth
              label="Amount *"
              value={data.amount}
              onChange={(e) => handleChange({ amount: e.target.value })}
              onBlur={() => handleBlur("amount")}
              variant="outlined"
              size="small"
              name="bankAmount"
              error={touched.amount && errors.amount}
              helperText={touched.amount && errors.amount ? "Required" : ""}
              sx={{ ...folioTextFieldSx }}
            />
          </Grid>
          <Grid item xs={12}>
            <FormControl component="fieldset">
              <FormLabel component="legend">Transfer On Death (TOD)?</FormLabel>
              <RadioGroup
                row
                value={data.hasTOD === true ? 'yes' : data.hasTOD === false ? 'no' : ''}
                onChange={(e) => handleChange({
                  hasTOD: e.target.value === 'yes',
                  ...(e.target.value === 'no' ? { todPrimaryBeneficiary: '', todSecondaryBeneficiary: '' } : {}),
                })}
              >
                <FormControlLabel value="yes" control={<Radio size="small" />} label="Yes" />
                <FormControlLabel value="no" control={<Radio size="small" />} label="No" />
              </RadioGroup>
            </FormControl>
          </Grid>
          {data.hasTOD && (
            <>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="TOD Primary Beneficiary"
                  value={data.todPrimaryBeneficiary || ''}
                  onChange={(e) => handleChange({ todPrimaryBeneficiary: e.target.value })}
                  variant="outlined"
                  size="small"
                  sx={{ ...folioTextFieldSx }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="TOD Secondary Beneficiary"
                  value={data.todSecondaryBeneficiary || ''}
                  onChange={(e) => handleChange({ todSecondaryBeneficiary: e.target.value })}
                  variant="outlined"
                  size="small"
                  sx={{ ...folioTextFieldSx }}
                />
              </Grid>
            </>
          )}
          {data.owner && (
            <Grid item xs={12}>
              <DispositionSection
                owner={data.owner}
                hasBeneficiaryDesignation={data.hasBeneficiaryDesignation}
                onBeneficiaryDesignationChange={(value) =>
                  handleChange({ hasBeneficiaryDesignation: value, hasBeneficiaries: value })
                }
                wantsSpecificBequest={data.wantsSpecificBequest}
                onWantsSpecificBequestChange={(value) =>
                  handleChange({ wantsSpecificBequest: value })
                }
                jointDisposition={data.jointDisposition}
                onJointDispositionChange={(value) =>
                  handleChange({ jointDisposition: value })
                }
                jointOwnerIntentConfirmed={data.jointOwnerIntentConfirmed}
                onJointOwnerIntentChange={(value) =>
                  handleChange({ jointOwnerIntentConfirmed: value })
                }
                primaryBeneficiaries={data.primaryBeneficiaries}
                secondaryBeneficiaries={data.secondaryBeneficiaries}
                primaryLegatees={data.primaryLegatees || []}
                secondaryLegatees={data.secondaryLegatees || []}
                onPrimaryBeneficiariesChange={(value) =>
                  handleChange({ primaryBeneficiaries: value })
                }
                onSecondaryBeneficiariesChange={(value) =>
                  handleChange({ secondaryBeneficiaries: value })
                }
                onPrimaryLegateesChange={(value) =>
                  handleChange({ primaryLegatees: value })
                }
                onSecondaryLegateesChange={(value) =>
                  handleChange({ secondaryLegatees: value })
                }
                primaryDistributionType={data.primaryDistributionType}
                secondaryDistributionType={data.secondaryDistributionType}
                primaryLegateeDistributionType={data.primaryLegateeDistributionType || ''}
                secondaryLegateeDistributionType={data.secondaryLegateeDistributionType || ''}
                onPrimaryDistributionTypeChange={(value) =>
                  handleChange({ primaryDistributionType: value })
                }
                onSecondaryDistributionTypeChange={(value) =>
                  handleChange({ secondaryDistributionType: value })
                }
                onPrimaryLegateeDistributionTypeChange={(value) =>
                  handleChange({ primaryLegateeDistributionType: value })
                }
                onSecondaryLegateeDistributionTypeChange={(value) =>
                  handleChange({ secondaryLegateeDistributionType: value })
                }
                beneficiaryOptions={beneficiaryOptions}
              />
            </Grid>
          )}

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Notes"
              value={data.notes || ""}
              onChange={(e) => handleChange({ notes: e.target.value })}
              variant="outlined"
              multiline
              rows={4}
              sx={{ ...folioTextFieldSx }}
              placeholder="Enter any additional notes about this account..."
            />
          </Grid>
        </Grid>
      </FolioFieldFade>
    </FolioModal>
  );
};

// Non-Qualified Investment Types
export interface NonQualifiedInvestmentData {
  owner: string;
  institution: string;
  description: string;
  value: string;
  // TOD (Transfer On Death) fields
  hasTOD?: boolean;
  todPrimaryBeneficiary?: string;
  todSecondaryBeneficiary?: string;
  // Disposition fields
  hasBeneficiaryDesignation?: boolean;
  wantsSpecificBequest?: boolean;
  jointDisposition?: JointDispositionType;
  jointOwnerIntentConfirmed?: boolean;
  hasBeneficiaries: boolean;
  primaryBeneficiaries: string[];
  primaryDistributionType: DistributionType;
  secondaryBeneficiaries: string[];
  secondaryDistributionType: DistributionType;
  primaryLegatees: string[];
  primaryLegateeDistributionType: DistributionType;
  secondaryLegatees: string[];
  secondaryLegateeDistributionType: DistributionType;
  notes: string;
}

const emptyNonQualifiedInvestment: NonQualifiedInvestmentData = {
  owner: "",
  institution: "",
  description: "",
  value: "",
  hasTOD: undefined,
  todPrimaryBeneficiary: "",
  todSecondaryBeneficiary: "",
  hasBeneficiaryDesignation: undefined,
  wantsSpecificBequest: undefined,
  jointDisposition: undefined,
  jointOwnerIntentConfirmed: undefined,
  hasBeneficiaries: false,
  primaryBeneficiaries: [],
  primaryDistributionType: "",
  secondaryBeneficiaries: [],
  secondaryDistributionType: "",
  primaryLegatees: [],
  primaryLegateeDistributionType: "",
  secondaryLegatees: [],
  secondaryLegateeDistributionType: "",
  notes: "",
};

interface NonQualifiedInvestmentModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: NonQualifiedInvestmentData) => void;
  onDelete?: () => void;
  initialData?: NonQualifiedInvestmentData;
  beneficiaryOptions: BeneficiaryOption[];
  isEdit?: boolean;
  showSpouse?: boolean;
  trustFlags?: TrustFlags;
}

export const NonQualifiedInvestmentModal: React.FC<
  NonQualifiedInvestmentModalProps
> = ({
  open,
  onClose,
  onSave,
  onDelete,
  initialData,
  beneficiaryOptions,
  isEdit = false,
  showSpouse = true,
  trustFlags,
}) => {
  const ownerOptions = getOwnerOptions(showSpouse);
  const [data, setData] = useState<NonQualifiedInvestmentData>(
    initialData || emptyNonQualifiedInvestment
  );
  const [touched, setTouched] = useState<TouchedFields<NonQualifiedInvestmentData>>({});

  // Build trust options based on flags
  const trustOwnerOptions: string[] = [];
  if (trustFlags) {
    if (trustFlags.clientHasLivingTrust) {
      trustOwnerOptions.push("Client's Living Trust");
    }
    if (trustFlags.clientHasIrrevocableTrust) {
      trustOwnerOptions.push("Client's Irrevocable Trust");
    }
    if (showSpouse && trustFlags.spouseHasLivingTrust) {
      trustOwnerOptions.push("Spouse's Living Trust");
    }
    if (showSpouse && trustFlags.spouseHasIrrevocableTrust) {
      trustOwnerOptions.push("Spouse's Irrevocable Trust");
    }
  }

  // Combine all owner options
  const allOwnerOptions = [...ownerOptions, ...trustOwnerOptions];
  const fieldsVisible = useFolioFieldAnimation(open);

  useEffect(() => {
    if (open) {
      // Always reset to empty when adding new (isEdit false), otherwise use initialData
      setData(isEdit && initialData ? initialData : emptyNonQualifiedInvestment);
      setTouched({});
    }
  }, [open, initialData, isEdit]);

  const handleChange = (updates: Partial<NonQualifiedInvestmentData>) => {
    setData((prev) => ({ ...prev, ...updates }));
  };

  const handleBlur = (field: keyof NonQualifiedInvestmentData) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  // Validation
  const errors = {
    owner: !hasValue(data.owner),
    institution: !hasValue(data.institution),
    value: !hasCurrencyValue(data.value),
  };

  const isValid = !errors.owner && !errors.institution && !errors.value;

  const handleSave = () => {
    setTouched({ owner: true, institution: true, value: true });
    if (isValid) {
      onSave(data);
      onClose();
    }
  };

  return (
    <FolioModal
      open={open}
      onClose={onClose}
      title={isEdit ? "Edit Investment Account" : "Add Investment Account"}
      eyebrow="My Life Folio — Assets"
      footer={
        <>
          <Box>
            {isEdit && onDelete && <FolioDeleteButton onClick={onDelete} />}
          </Box>
          <Box sx={{ display: 'flex', gap: 1.5 }}>
            <FolioCancelButton onClick={onClose} />
            <FolioSaveButton onClick={handleSave} disabled={!isValid}>
              {isEdit ? "Save Changes" : "Add Account"}
            </FolioSaveButton>
          </Box>
        </>
      }
    >
      <FolioFieldFade visible={fieldsVisible} index={0}>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12}>
            <FormControl
              fullWidth
              size="small"
              error={touched.owner && errors.owner}
            >
              <InputLabel>Owner *</InputLabel>
              <Select
                value={data.owner}
                label="Owner *"
                onChange={(e) => {
                  handleChange({ owner: e.target.value });
                  setTouched((prev) => ({ ...prev, owner: true }));
                }}
              >
                {allOwnerOptions.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Institution *"
              value={data.institution}
              onChange={(e) => handleChange({ institution: e.target.value })}
              onBlur={() => handleBlur("institution")}
              variant="outlined"
              size="small"
              error={touched.institution && errors.institution}
              helperText={touched.institution && errors.institution ? "Required" : ""}
              sx={{ ...folioTextFieldSx }}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Description"
              value={data.description}
              onChange={(e) => handleChange({ description: e.target.value })}
              variant="outlined"
              size="small"
              placeholder="e.g., Brokerage, Stocks, Bonds, Mutual Funds"
              sx={{ ...folioTextFieldSx }}
            />
          </Grid>
          <Grid item xs={12}>
            <CurrencyInput
              fullWidth
              label="Value *"
              value={data.value}
              onChange={(e) => handleChange({ value: e.target.value })}
              onBlur={() => handleBlur("value")}
              variant="outlined"
              size="small"
              name="investmentValue"
              error={touched.value && errors.value}
              helperText={touched.value && errors.value ? "Required" : ""}
              sx={{ ...folioTextFieldSx }}
            />
          </Grid>
          <Grid item xs={12}>
            <FormControl component="fieldset">
              <FormLabel component="legend">Transfer On Death (TOD)?</FormLabel>
              <RadioGroup
                row
                value={data.hasTOD === true ? 'yes' : data.hasTOD === false ? 'no' : ''}
                onChange={(e) => handleChange({
                  hasTOD: e.target.value === 'yes',
                  ...(e.target.value === 'no' ? { todPrimaryBeneficiary: '', todSecondaryBeneficiary: '' } : {}),
                })}
              >
                <FormControlLabel value="yes" control={<Radio size="small" />} label="Yes" />
                <FormControlLabel value="no" control={<Radio size="small" />} label="No" />
              </RadioGroup>
            </FormControl>
          </Grid>
          {data.hasTOD && (
            <>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="TOD Primary Beneficiary"
                  value={data.todPrimaryBeneficiary || ''}
                  onChange={(e) => handleChange({ todPrimaryBeneficiary: e.target.value })}
                  variant="outlined"
                  size="small"
                  sx={{ ...folioTextFieldSx }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="TOD Secondary Beneficiary"
                  value={data.todSecondaryBeneficiary || ''}
                  onChange={(e) => handleChange({ todSecondaryBeneficiary: e.target.value })}
                  variant="outlined"
                  size="small"
                  sx={{ ...folioTextFieldSx }}
                />
              </Grid>
            </>
          )}
          {data.owner && (
            <Grid item xs={12}>
              <DispositionSection
                owner={data.owner}
                hasBeneficiaryDesignation={data.hasBeneficiaryDesignation}
                onBeneficiaryDesignationChange={(value) =>
                  handleChange({ hasBeneficiaryDesignation: value, hasBeneficiaries: value })
                }
                wantsSpecificBequest={data.wantsSpecificBequest}
                onWantsSpecificBequestChange={(value) =>
                  handleChange({ wantsSpecificBequest: value })
                }
                jointDisposition={data.jointDisposition}
                onJointDispositionChange={(value) =>
                  handleChange({ jointDisposition: value })
                }
                jointOwnerIntentConfirmed={data.jointOwnerIntentConfirmed}
                onJointOwnerIntentChange={(value) =>
                  handleChange({ jointOwnerIntentConfirmed: value })
                }
                primaryBeneficiaries={data.primaryBeneficiaries}
                secondaryBeneficiaries={data.secondaryBeneficiaries}
                primaryLegatees={data.primaryLegatees || []}
                secondaryLegatees={data.secondaryLegatees || []}
                onPrimaryBeneficiariesChange={(value) =>
                  handleChange({ primaryBeneficiaries: value })
                }
                onSecondaryBeneficiariesChange={(value) =>
                  handleChange({ secondaryBeneficiaries: value })
                }
                onPrimaryLegateesChange={(value) =>
                  handleChange({ primaryLegatees: value })
                }
                onSecondaryLegateesChange={(value) =>
                  handleChange({ secondaryLegatees: value })
                }
                primaryDistributionType={data.primaryDistributionType}
                secondaryDistributionType={data.secondaryDistributionType}
                primaryLegateeDistributionType={data.primaryLegateeDistributionType || ''}
                secondaryLegateeDistributionType={data.secondaryLegateeDistributionType || ''}
                onPrimaryDistributionTypeChange={(value) =>
                  handleChange({ primaryDistributionType: value })
                }
                onSecondaryDistributionTypeChange={(value) =>
                  handleChange({ secondaryDistributionType: value })
                }
                onPrimaryLegateeDistributionTypeChange={(value) =>
                  handleChange({ primaryLegateeDistributionType: value })
                }
                onSecondaryLegateeDistributionTypeChange={(value) =>
                  handleChange({ secondaryLegateeDistributionType: value })
                }
                beneficiaryOptions={beneficiaryOptions}
              />
            </Grid>
          )}

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Notes"
              value={data.notes || ""}
              onChange={(e) => handleChange({ notes: e.target.value })}
              variant="outlined"
              multiline
              rows={4}
              sx={{ ...folioTextFieldSx }}
              placeholder="Enter any additional notes about this investment..."
            />
          </Grid>
        </Grid>
      </FolioFieldFade>
    </FolioModal>
  );
};

// Retirement Account Types
export interface RetirementAccountData {
  owner: string;
  institution: string;
  accountType: string;
  value: string;
  // TOD (Transfer On Death) fields
  hasTOD?: boolean;
  todPrimaryBeneficiary?: string;
  todSecondaryBeneficiary?: string;
  // Disposition fields
  hasBeneficiaryDesignation?: boolean;
  wantsSpecificBequest?: boolean;
  jointDisposition?: JointDispositionType;
  jointOwnerIntentConfirmed?: boolean;
  hasBeneficiaries: boolean;
  primaryBeneficiaries: string[];
  primaryDistributionType: DistributionType;
  secondaryBeneficiaries: string[];
  secondaryDistributionType: DistributionType;
  primaryLegatees: string[];
  primaryLegateeDistributionType: DistributionType;
  secondaryLegatees: string[];
  secondaryLegateeDistributionType: DistributionType;
  notes: string;
}

const emptyRetirementAccount: RetirementAccountData = {
  owner: "",
  institution: "",
  accountType: "",
  value: "",
  hasTOD: undefined,
  todPrimaryBeneficiary: "",
  todSecondaryBeneficiary: "",
  hasBeneficiaryDesignation: undefined,
  wantsSpecificBequest: undefined,
  jointDisposition: undefined,
  jointOwnerIntentConfirmed: undefined,
  hasBeneficiaries: false,
  primaryBeneficiaries: [],
  primaryDistributionType: "",
  secondaryBeneficiaries: [],
  secondaryDistributionType: "",
  primaryLegatees: [],
  primaryLegateeDistributionType: "",
  secondaryLegatees: [],
  secondaryLegateeDistributionType: "",
  notes: "",
};

interface RetirementAccountModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: RetirementAccountData) => void;
  onDelete?: () => void;
  initialData?: RetirementAccountData;
  beneficiaryOptions: BeneficiaryOption[];
  isEdit?: boolean;
  showSpouse?: boolean;
}

export const RetirementAccountModal: React.FC<RetirementAccountModalProps> = ({
  open,
  onClose,
  onSave,
  onDelete,
  initialData,
  beneficiaryOptions,
  isEdit = false,
  showSpouse = true,
}) => {
  // Note: Retirement accounts (IRAs, 401ks, etc.) can only be owned by individuals, not trusts
  // A trust can be a beneficiary but not an owner
  const individualOwnerOptions = getIndividualOwnerOptions(showSpouse);
  const fieldsVisible = useFolioFieldAnimation(open);
  const [data, setData] = useState<RetirementAccountData>(
    initialData || emptyRetirementAccount
  );
  const [touched, setTouched] = useState<TouchedFields<RetirementAccountData>>({});

  useEffect(() => {
    if (open) {
      // Always reset to empty when adding new (isEdit false), otherwise use initialData
      setData(isEdit && initialData ? initialData : emptyRetirementAccount);
      setTouched({});
    }
  }, [open, initialData, isEdit]);

  const handleChange = (updates: Partial<RetirementAccountData>) => {
    setData((prev) => ({ ...prev, ...updates }));
  };

  const handleBlur = (field: keyof RetirementAccountData) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  // Validation
  const errors = {
    owner: !hasValue(data.owner),
    institution: !hasValue(data.institution),
    accountType: !hasValue(data.accountType),
    value: !hasCurrencyValue(data.value),
  };

  const isValid = !errors.owner && !errors.institution && !errors.accountType && !errors.value;

  const handleSave = () => {
    setTouched({ owner: true, institution: true, accountType: true, value: true });
    if (isValid) {
      onSave(data);
      onClose();
    }
  };

  return (
    <FolioModal
      open={open}
      onClose={onClose}
      title={isEdit ? "Edit Retirement Account" : "Add Retirement Account"}
      eyebrow="My Life Folio — Assets"
      footer={
        <>
          <Box>
            {isEdit && onDelete && <FolioDeleteButton onClick={onDelete} />}
          </Box>
          <Box sx={{ display: 'flex', gap: 1.5 }}>
            <FolioCancelButton onClick={onClose} />
            <FolioSaveButton onClick={handleSave} disabled={!isValid}>
              {isEdit ? "Save Changes" : "Add Account"}
            </FolioSaveButton>
          </Box>
        </>
      }
    >
      <FolioFieldFade visible={fieldsVisible} index={0}>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12}>
            <FormControl
              fullWidth
              size="small"
              error={touched.owner && errors.owner}
            >
              <InputLabel>Owner *</InputLabel>
              <Select
                value={data.owner}
                label="Owner *"
                onChange={(e) => {
                  handleChange({ owner: e.target.value });
                  setTouched((prev) => ({ ...prev, owner: true }));
                }}
              >
                {individualOwnerOptions.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Institution *"
              value={data.institution}
              onChange={(e) => handleChange({ institution: e.target.value })}
              onBlur={() => handleBlur("institution")}
              variant="outlined"
              size="small"
              error={touched.institution && errors.institution}
              helperText={touched.institution && errors.institution ? "Required" : ""}
              sx={{ ...folioTextFieldSx }}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Account Type *"
              value={data.accountType}
              onChange={(e) => handleChange({ accountType: e.target.value })}
              onBlur={() => handleBlur("accountType")}
              variant="outlined"
              size="small"
              placeholder="e.g., IRA, 401k, Pension"
              error={touched.accountType && errors.accountType}
              helperText={touched.accountType && errors.accountType ? "Required" : ""}
              sx={{ ...folioTextFieldSx }}
            />
          </Grid>
          <Grid item xs={12}>
            <CurrencyInput
              fullWidth
              label="Value *"
              value={data.value}
              onChange={(e) => handleChange({ value: e.target.value })}
              onBlur={() => handleBlur("value")}
              variant="outlined"
              size="small"
              name="retirementValue"
              error={touched.value && errors.value}
              helperText={touched.value && errors.value ? "Required" : ""}
              sx={{ ...folioTextFieldSx }}
            />
          </Grid>
          <Grid item xs={12}>
            <FormControl component="fieldset">
              <FormLabel component="legend">Transfer On Death (TOD)?</FormLabel>
              <RadioGroup
                row
                value={data.hasTOD === true ? 'yes' : data.hasTOD === false ? 'no' : ''}
                onChange={(e) => handleChange({
                  hasTOD: e.target.value === 'yes',
                  ...(e.target.value === 'no' ? { todPrimaryBeneficiary: '', todSecondaryBeneficiary: '' } : {}),
                })}
              >
                <FormControlLabel value="yes" control={<Radio size="small" />} label="Yes" />
                <FormControlLabel value="no" control={<Radio size="small" />} label="No" />
              </RadioGroup>
            </FormControl>
          </Grid>
          {data.hasTOD && (
            <>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="TOD Primary Beneficiary"
                  value={data.todPrimaryBeneficiary || ''}
                  onChange={(e) => handleChange({ todPrimaryBeneficiary: e.target.value })}
                  variant="outlined"
                  size="small"
                  sx={{ ...folioTextFieldSx }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="TOD Secondary Beneficiary"
                  value={data.todSecondaryBeneficiary || ''}
                  onChange={(e) => handleChange({ todSecondaryBeneficiary: e.target.value })}
                  variant="outlined"
                  size="small"
                  sx={{ ...folioTextFieldSx }}
                />
              </Grid>
            </>
          )}
          {data.owner && (
            <Grid item xs={12}>
              <DispositionSection
                owner={data.owner}
                hasBeneficiaryDesignation={data.hasBeneficiaryDesignation}
                onBeneficiaryDesignationChange={(value) =>
                  handleChange({ hasBeneficiaryDesignation: value, hasBeneficiaries: value })
                }
                wantsSpecificBequest={data.wantsSpecificBequest}
                onWantsSpecificBequestChange={(value) =>
                  handleChange({ wantsSpecificBequest: value })
                }
                jointDisposition={data.jointDisposition}
                onJointDispositionChange={(value) =>
                  handleChange({ jointDisposition: value })
                }
                jointOwnerIntentConfirmed={data.jointOwnerIntentConfirmed}
                onJointOwnerIntentChange={(value) =>
                  handleChange({ jointOwnerIntentConfirmed: value })
                }
                primaryBeneficiaries={data.primaryBeneficiaries}
                secondaryBeneficiaries={data.secondaryBeneficiaries}
                primaryLegatees={data.primaryLegatees || []}
                secondaryLegatees={data.secondaryLegatees || []}
                onPrimaryBeneficiariesChange={(value) =>
                  handleChange({ primaryBeneficiaries: value })
                }
                onSecondaryBeneficiariesChange={(value) =>
                  handleChange({ secondaryBeneficiaries: value })
                }
                onPrimaryLegateesChange={(value) =>
                  handleChange({ primaryLegatees: value })
                }
                onSecondaryLegateesChange={(value) =>
                  handleChange({ secondaryLegatees: value })
                }
                primaryDistributionType={data.primaryDistributionType}
                secondaryDistributionType={data.secondaryDistributionType}
                primaryLegateeDistributionType={data.primaryLegateeDistributionType || ''}
                secondaryLegateeDistributionType={data.secondaryLegateeDistributionType || ''}
                onPrimaryDistributionTypeChange={(value) =>
                  handleChange({ primaryDistributionType: value })
                }
                onSecondaryDistributionTypeChange={(value) =>
                  handleChange({ secondaryDistributionType: value })
                }
                onPrimaryLegateeDistributionTypeChange={(value) =>
                  handleChange({ primaryLegateeDistributionType: value })
                }
                onSecondaryLegateeDistributionTypeChange={(value) =>
                  handleChange({ secondaryLegateeDistributionType: value })
                }
                beneficiaryOptions={beneficiaryOptions}
              />
            </Grid>
          )}

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Notes"
              value={data.notes || ""}
              onChange={(e) => handleChange({ notes: e.target.value })}
              variant="outlined"
              multiline
              rows={4}
              sx={{ ...folioTextFieldSx }}
              placeholder="Enter any additional notes about this account..."
            />
          </Grid>
        </Grid>
      </FolioFieldFade>
    </FolioModal>
  );
};

// Life Insurance Types
export type LifeInsurancePolicyType =
  | "Term Life"
  | "Group Life"
  | "Whole Life"
  | "Universal"
  | "Other"
  | "";

const LIFE_INSURANCE_POLICY_TYPES: LifeInsurancePolicyType[] = [
  "Term Life",
  "Group Life",
  "Whole Life",
  "Universal",
  "Other",
];

export interface LifeInsuranceData {
  owner: string;
  company: string;
  policyType: LifeInsurancePolicyType;
  faceAmount: string;
  deathBenefit: string;
  cashValue: string;
  insured: string;
  // Disposition fields
  hasBeneficiaryDesignation?: boolean;
  wantsSpecificBequest?: boolean;
  jointDisposition?: JointDispositionType;
  jointOwnerIntentConfirmed?: boolean;
  hasBeneficiaries: boolean;
  primaryBeneficiaries: string[];
  primaryDistributionType: DistributionType;
  secondaryBeneficiaries: string[];
  secondaryDistributionType: DistributionType;
  primaryLegatees: string[];
  primaryLegateeDistributionType: DistributionType;
  secondaryLegatees: string[];
  secondaryLegateeDistributionType: DistributionType;
  notes: string;
}

const emptyLifeInsurance: LifeInsuranceData = {
  owner: "",
  company: "",
  policyType: "",
  faceAmount: "",
  deathBenefit: "",
  cashValue: "",
  insured: "",
  hasBeneficiaryDesignation: undefined,
  wantsSpecificBequest: undefined,
  jointDisposition: undefined,
  jointOwnerIntentConfirmed: undefined,
  hasBeneficiaries: false,
  primaryBeneficiaries: [],
  primaryDistributionType: "",
  secondaryBeneficiaries: [],
  secondaryDistributionType: "",
  primaryLegatees: [],
  primaryLegateeDistributionType: "",
  secondaryLegatees: [],
  secondaryLegateeDistributionType: "",
  notes: "",
};

interface LifeInsuranceModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: LifeInsuranceData) => void;
  onDelete?: () => void;
  initialData?: LifeInsuranceData;
  beneficiaryOptions: BeneficiaryOption[];
  isEdit?: boolean;
  showSpouse?: boolean;
  trustFlags?: TrustFlags;
}

export const LifeInsuranceModal: React.FC<LifeInsuranceModalProps> = ({
  open,
  onClose,
  onSave,
  onDelete,
  initialData,
  beneficiaryOptions,
  isEdit = false,
  showSpouse = true,
  trustFlags,
}) => {
  const individualOwnerOptions = getIndividualOwnerOptions(showSpouse);
  const insuredOptions = getIndividualOwnerOptions(showSpouse);

  // Build trust options based on flags (life insurance can be owned by trusts, especially ILITs)
  const trustOwnerOptions: string[] = [];
  if (trustFlags) {
    if (trustFlags.clientHasLivingTrust) {
      trustOwnerOptions.push("Client's Living Trust");
    }
    if (trustFlags.clientHasIrrevocableTrust) {
      trustOwnerOptions.push("Client's Irrevocable Trust");
    }
    if (showSpouse && trustFlags.spouseHasLivingTrust) {
      trustOwnerOptions.push("Spouse's Living Trust");
    }
    if (showSpouse && trustFlags.spouseHasIrrevocableTrust) {
      trustOwnerOptions.push("Spouse's Irrevocable Trust");
    }
  }

  // Combine all owner options
  const allOwnerOptions = [...individualOwnerOptions, ...trustOwnerOptions];
  const fieldsVisible = useFolioFieldAnimation(open);

  // For single clients, default insured to 'Client'
  const getInitialData = (): LifeInsuranceData => {
    const base = initialData || emptyLifeInsurance;
    if (!showSpouse && !base.insured) {
      return { ...base, insured: "Client" };
    }
    return base;
  };

  const [data, setData] = useState<LifeInsuranceData>(getInitialData());
  const [touched, setTouched] = useState<TouchedFields<LifeInsuranceData>>({});

  useEffect(() => {
    if (open) {
      // Always reset to empty when adding new (isEdit false), otherwise use initialData
      if (isEdit && initialData) {
        setData(initialData);
      } else {
        // For new entries, start with empty but set insured to 'Client' if single
        const empty = emptyLifeInsurance;
        setData(!showSpouse ? { ...empty, insured: "Client" } : empty);
      }
      setTouched({});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initialData, showSpouse, isEdit]);

  const handleChange = (updates: Partial<LifeInsuranceData>) => {
    setData((prev) => ({ ...prev, ...updates }));
  };

  const handleBlur = (field: keyof LifeInsuranceData) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  // Validation
  const errors = {
    owner: !hasValue(data.owner),
    company: !hasValue(data.company),
    policyType: !hasValue(data.policyType),
    deathBenefit: !hasCurrencyValue(data.deathBenefit),
  };

  const isValid = !errors.owner && !errors.company && !errors.policyType && !errors.deathBenefit;

  const handleSave = () => {
    setTouched({ owner: true, company: true, policyType: true, deathBenefit: true });
    if (isValid) {
      // Ensure insured is set to 'Client' for single clients
      const saveData = !showSpouse ? { ...data, insured: "Client" } : data;
      onSave(saveData);
      onClose();
    }
  };

  return (
    <FolioModal
      open={open}
      onClose={onClose}
      title={isEdit ? "Edit Life Insurance Policy" : "Add Life Insurance Policy"}
      eyebrow="My Life Folio — Assets"
      footer={
        <>
          <Box>
            {isEdit && onDelete && <FolioDeleteButton onClick={onDelete} />}
          </Box>
          <Box sx={{ display: 'flex', gap: 1.5 }}>
            <FolioCancelButton onClick={onClose} />
            <FolioSaveButton onClick={handleSave} disabled={!isValid}>
              {isEdit ? "Save Changes" : "Add Policy"}
            </FolioSaveButton>
          </Box>
        </>
      }
    >
      <FolioFieldFade visible={fieldsVisible} index={0}>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12} md={showSpouse ? 6 : 12}>
            <FormControl
              fullWidth
              size="small"
              error={touched.owner && errors.owner}
            >
              <InputLabel>Owner *</InputLabel>
              <Select
                value={data.owner}
                label="Owner *"
                onChange={(e) => {
                  handleChange({ owner: e.target.value });
                  setTouched((prev) => ({ ...prev, owner: true }));
                }}
              >
                {allOwnerOptions.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          {showSpouse && (
            <Grid item xs={12} md={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Insured</InputLabel>
                <Select
                  value={data.insured}
                  label="Insured"
                  onChange={(e) => handleChange({ insured: e.target.value })}
                >
                  {insuredOptions.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          )}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Company *"
              value={data.company}
              onChange={(e) => handleChange({ company: e.target.value })}
              onBlur={() => handleBlur("company")}
              variant="outlined"
              size="small"
              error={touched.company && errors.company}
              helperText={touched.company && errors.company ? "Required" : ""}
              sx={{ ...folioTextFieldSx }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl
              fullWidth
              size="small"
              error={touched.policyType && errors.policyType}
            >
              <InputLabel>Policy Type *</InputLabel>
              <Select
                value={data.policyType}
                label="Policy Type *"
                onChange={(e) => {
                  handleChange({
                    policyType: e.target.value as LifeInsurancePolicyType,
                  });
                  setTouched((prev) => ({ ...prev, policyType: true }));
                }}
              >
                {LIFE_INSURANCE_POLICY_TYPES.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid
            item
            xs={12}
            md={
              data.policyType === "Term Life" ||
              data.policyType === "Group Life"
                ? 6
                : 4
            }
          >
            <CurrencyInput
              fullWidth
              label="Face Amount"
              value={data.faceAmount}
              onChange={(e) => handleChange({ faceAmount: e.target.value })}
              variant="outlined"
              size="small"
              name="faceAmount"
              sx={{ ...folioTextFieldSx }}
            />
          </Grid>
          <Grid
            item
            xs={12}
            md={
              data.policyType === "Term Life" ||
              data.policyType === "Group Life"
                ? 6
                : 4
            }
          >
            <CurrencyInput
              fullWidth
              label="Death Benefit *"
              value={data.deathBenefit}
              onChange={(e) => handleChange({ deathBenefit: e.target.value })}
              onBlur={() => handleBlur("deathBenefit")}
              variant="outlined"
              size="small"
              name="deathBenefit"
              error={touched.deathBenefit && errors.deathBenefit}
              helperText={touched.deathBenefit && errors.deathBenefit ? "Required" : ""}
              sx={{ ...folioTextFieldSx }}
            />
          </Grid>
          {data.policyType !== "Term Life" &&
            data.policyType !== "Group Life" && (
              <Grid item xs={12} md={4}>
                <CurrencyInput
                  fullWidth
                  label="Cash Value"
                  value={data.cashValue}
                  onChange={(e) => handleChange({ cashValue: e.target.value })}
                  variant="outlined"
                  size="small"
                  name="cashValue"
                  sx={{ ...folioTextFieldSx }}
                />
              </Grid>
            )}
          {data.owner && (
            <Grid item xs={12}>
              <DispositionSection
                owner={data.owner}
                hasBeneficiaryDesignation={data.hasBeneficiaryDesignation}
                onBeneficiaryDesignationChange={(value) =>
                  handleChange({ hasBeneficiaryDesignation: value, hasBeneficiaries: value })
                }
                wantsSpecificBequest={data.wantsSpecificBequest}
                onWantsSpecificBequestChange={(value) =>
                  handleChange({ wantsSpecificBequest: value })
                }
                jointDisposition={data.jointDisposition}
                onJointDispositionChange={(value) =>
                  handleChange({ jointDisposition: value })
                }
                jointOwnerIntentConfirmed={data.jointOwnerIntentConfirmed}
                onJointOwnerIntentChange={(value) =>
                  handleChange({ jointOwnerIntentConfirmed: value })
                }
                primaryBeneficiaries={data.primaryBeneficiaries}
                secondaryBeneficiaries={data.secondaryBeneficiaries}
                primaryLegatees={data.primaryLegatees || []}
                secondaryLegatees={data.secondaryLegatees || []}
                onPrimaryBeneficiariesChange={(value) =>
                  handleChange({ primaryBeneficiaries: value })
                }
                onSecondaryBeneficiariesChange={(value) =>
                  handleChange({ secondaryBeneficiaries: value })
                }
                onPrimaryLegateesChange={(value) =>
                  handleChange({ primaryLegatees: value })
                }
                onSecondaryLegateesChange={(value) =>
                  handleChange({ secondaryLegatees: value })
                }
                primaryDistributionType={data.primaryDistributionType}
                secondaryDistributionType={data.secondaryDistributionType}
                primaryLegateeDistributionType={data.primaryLegateeDistributionType || ''}
                secondaryLegateeDistributionType={data.secondaryLegateeDistributionType || ''}
                onPrimaryDistributionTypeChange={(value) =>
                  handleChange({ primaryDistributionType: value })
                }
                onSecondaryDistributionTypeChange={(value) =>
                  handleChange({ secondaryDistributionType: value })
                }
                onPrimaryLegateeDistributionTypeChange={(value) =>
                  handleChange({ primaryLegateeDistributionType: value })
                }
                onSecondaryLegateeDistributionTypeChange={(value) =>
                  handleChange({ secondaryLegateeDistributionType: value })
                }
                beneficiaryOptions={beneficiaryOptions}
              />
            </Grid>
          )}

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Notes"
              value={data.notes || ""}
              onChange={(e) => handleChange({ notes: e.target.value })}
              variant="outlined"
              multiline
              rows={4}
              sx={{ ...folioTextFieldSx }}
              placeholder="Enter any additional notes about this policy..."
            />
          </Grid>
        </Grid>
      </FolioFieldFade>
    </FolioModal>
  );
};

// Vehicle Types
export interface VehicleData {
  owner: string;
  yearMakeModel: string;
  value: string;
  amountFinancedOwed: string;
  // Disposition fields
  hasBeneficiaryDesignation?: boolean;
  wantsSpecificBequest?: boolean;
  jointDisposition?: JointDispositionType;
  jointOwnerIntentConfirmed?: boolean;
  hasBeneficiaries: boolean;
  primaryBeneficiaries: string[];
  primaryDistributionType: DistributionType;
  secondaryBeneficiaries: string[];
  secondaryDistributionType: DistributionType;
  primaryLegatees: string[];
  primaryLegateeDistributionType: DistributionType;
  secondaryLegatees: string[];
  secondaryLegateeDistributionType: DistributionType;
  notes: string;
}

const emptyVehicle: VehicleData = {
  owner: "",
  yearMakeModel: "",
  value: "",
  amountFinancedOwed: "",
  hasBeneficiaryDesignation: undefined,
  wantsSpecificBequest: undefined,
  jointDisposition: undefined,
  jointOwnerIntentConfirmed: undefined,
  hasBeneficiaries: false,
  primaryBeneficiaries: [],
  primaryDistributionType: "",
  secondaryBeneficiaries: [],
  secondaryDistributionType: "",
  primaryLegatees: [],
  primaryLegateeDistributionType: "",
  secondaryLegatees: [],
  secondaryLegateeDistributionType: "",
  notes: "",
};

interface VehicleModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: VehicleData) => void;
  onDelete?: () => void;
  initialData?: VehicleData;
  beneficiaryOptions: BeneficiaryOption[];
  isEdit?: boolean;
  showSpouse?: boolean;
  trustFlags?: TrustFlags;
}

export const VehicleModal: React.FC<VehicleModalProps> = ({
  open,
  onClose,
  onSave,
  onDelete,
  initialData,
  beneficiaryOptions,
  isEdit = false,
  showSpouse = true,
  trustFlags,
}) => {
  const ownerOptions = getOwnerOptions(showSpouse);
  const [data, setData] = useState<VehicleData>(initialData || emptyVehicle);
  const [touched, setTouched] = useState<TouchedFields<VehicleData>>({});

  // Build trust options based on flags
  const trustOwnerOptions: string[] = [];
  if (trustFlags) {
    if (trustFlags.clientHasLivingTrust) {
      trustOwnerOptions.push("Client's Living Trust");
    }
    if (trustFlags.clientHasIrrevocableTrust) {
      trustOwnerOptions.push("Client's Irrevocable Trust");
    }
    if (showSpouse && trustFlags.spouseHasLivingTrust) {
      trustOwnerOptions.push("Spouse's Living Trust");
    }
    if (showSpouse && trustFlags.spouseHasIrrevocableTrust) {
      trustOwnerOptions.push("Spouse's Irrevocable Trust");
    }
  }

  // Combine all owner options
  const allOwnerOptions = [...ownerOptions, ...trustOwnerOptions];
  const fieldsVisible = useFolioFieldAnimation(open);

  useEffect(() => {
    if (open) {
      // Always reset to empty when adding new (isEdit false), otherwise use initialData
      setData(isEdit && initialData ? initialData : emptyVehicle);
      setTouched({});
    }
  }, [open, initialData, isEdit]);

  const handleChange = (updates: Partial<VehicleData>) => {
    setData((prev) => ({ ...prev, ...updates }));
  };

  const handleBlur = (field: keyof VehicleData) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  // Validation
  const errors = {
    owner: !hasValue(data.owner),
    yearMakeModel: !hasValue(data.yearMakeModel),
    value: !hasCurrencyValue(data.value),
  };

  const isValid = !errors.owner && !errors.yearMakeModel && !errors.value;

  const handleSave = () => {
    setTouched({ owner: true, yearMakeModel: true, value: true });
    if (isValid) {
      onSave(data);
      onClose();
    }
  };

  return (
    <FolioModal
      open={open}
      onClose={onClose}
      title={isEdit ? "Edit Vehicle" : "Add Vehicle"}
      eyebrow="My Life Folio — Assets"
      footer={
        <>
          <Box>
            {isEdit && onDelete && <FolioDeleteButton onClick={onDelete} />}
          </Box>
          <Box sx={{ display: 'flex', gap: 1.5 }}>
            <FolioCancelButton onClick={onClose} />
            <FolioSaveButton onClick={handleSave} disabled={!isValid}>
              {isEdit ? "Save Changes" : "Add Vehicle"}
            </FolioSaveButton>
          </Box>
        </>
      }
    >
      <FolioFieldFade visible={fieldsVisible} index={0}>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12}>
            <FormControl
              fullWidth
              size="small"
              error={touched.owner && errors.owner}
            >
              <InputLabel>Owner *</InputLabel>
              <Select
                value={data.owner}
                label="Owner *"
                onChange={(e) => {
                  handleChange({ owner: e.target.value });
                  setTouched((prev) => ({ ...prev, owner: true }));
                }}
              >
                {allOwnerOptions.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Year, Make, Model *"
              value={data.yearMakeModel}
              onChange={(e) => handleChange({ yearMakeModel: e.target.value })}
              onBlur={() => handleBlur("yearMakeModel")}
              variant="outlined"
              size="small"
              placeholder="e.g., 2020 Toyota Camry"
              error={touched.yearMakeModel && errors.yearMakeModel}
              helperText={touched.yearMakeModel && errors.yearMakeModel ? "Required" : ""}
              sx={{ ...folioTextFieldSx }}
            />
          </Grid>
          <Grid item xs={6}>
            <CurrencyInput
              fullWidth
              label="Value *"
              value={data.value}
              onChange={(e) => handleChange({ value: e.target.value })}
              onBlur={() => handleBlur("value")}
              variant="outlined"
              size="small"
              name="vehicleValue"
              error={touched.value && errors.value}
              helperText={touched.value && errors.value ? "Required" : ""}
              sx={{ ...folioTextFieldSx }}
            />
          </Grid>
          <Grid item xs={6}>
            <CurrencyInput
              fullWidth
              label="Amount Financed/Owed"
              value={data.amountFinancedOwed}
              onChange={(e) => handleChange({ amountFinancedOwed: e.target.value })}
              variant="outlined"
              size="small"
              name="vehicleAmountOwed"
              sx={{ ...folioTextFieldSx }}
            />
          </Grid>
          {data.owner && (
            <Grid item xs={12}>
              <DispositionSection
                owner={data.owner}
                hasBeneficiaryDesignation={data.hasBeneficiaryDesignation}
                onBeneficiaryDesignationChange={(value) =>
                  handleChange({ hasBeneficiaryDesignation: value, hasBeneficiaries: value })
                }
                wantsSpecificBequest={data.wantsSpecificBequest}
                onWantsSpecificBequestChange={(value) =>
                  handleChange({ wantsSpecificBequest: value })
                }
                jointDisposition={data.jointDisposition}
                onJointDispositionChange={(value) =>
                  handleChange({ jointDisposition: value })
                }
                jointOwnerIntentConfirmed={data.jointOwnerIntentConfirmed}
                onJointOwnerIntentChange={(value) =>
                  handleChange({ jointOwnerIntentConfirmed: value })
                }
                primaryBeneficiaries={data.primaryBeneficiaries}
                secondaryBeneficiaries={data.secondaryBeneficiaries}
                primaryLegatees={data.primaryLegatees || []}
                secondaryLegatees={data.secondaryLegatees || []}
                onPrimaryBeneficiariesChange={(value) =>
                  handleChange({ primaryBeneficiaries: value })
                }
                onSecondaryBeneficiariesChange={(value) =>
                  handleChange({ secondaryBeneficiaries: value })
                }
                onPrimaryLegateesChange={(value) =>
                  handleChange({ primaryLegatees: value })
                }
                onSecondaryLegateesChange={(value) =>
                  handleChange({ secondaryLegatees: value })
                }
                primaryDistributionType={data.primaryDistributionType}
                secondaryDistributionType={data.secondaryDistributionType}
                primaryLegateeDistributionType={data.primaryLegateeDistributionType || ''}
                secondaryLegateeDistributionType={data.secondaryLegateeDistributionType || ''}
                onPrimaryDistributionTypeChange={(value) =>
                  handleChange({ primaryDistributionType: value })
                }
                onSecondaryDistributionTypeChange={(value) =>
                  handleChange({ secondaryDistributionType: value })
                }
                onPrimaryLegateeDistributionTypeChange={(value) =>
                  handleChange({ primaryLegateeDistributionType: value })
                }
                onSecondaryLegateeDistributionTypeChange={(value) =>
                  handleChange({ secondaryLegateeDistributionType: value })
                }
                beneficiaryOptions={beneficiaryOptions}
              />
            </Grid>
          )}

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Notes"
              value={data.notes || ""}
              onChange={(e) => handleChange({ notes: e.target.value })}
              variant="outlined"
              multiline
              rows={4}
              sx={{ ...folioTextFieldSx }}
              placeholder="Enter any additional notes about this vehicle..."
            />
          </Grid>
        </Grid>
      </FolioFieldFade>
    </FolioModal>
  );
};

// Other Asset Types
export interface OtherAssetData {
  owner: string;
  description: string;
  value: string;
  // Disposition fields
  hasBeneficiaryDesignation?: boolean;
  wantsSpecificBequest?: boolean;
  jointDisposition?: JointDispositionType;
  jointOwnerIntentConfirmed?: boolean;
  hasBeneficiaries: boolean;
  primaryBeneficiaries: string[];
  primaryDistributionType: DistributionType;
  secondaryBeneficiaries: string[];
  secondaryDistributionType: DistributionType;
  primaryLegatees: string[];
  primaryLegateeDistributionType: DistributionType;
  secondaryLegatees: string[];
  secondaryLegateeDistributionType: DistributionType;
  addToPersonalPropertyMemo: boolean;
  donee: string;
  notes: string;
  photo: string;
}

const emptyOtherAsset: OtherAssetData = {
  owner: "",
  description: "",
  value: "",
  hasBeneficiaryDesignation: undefined,
  wantsSpecificBequest: undefined,
  jointDisposition: undefined,
  jointOwnerIntentConfirmed: undefined,
  hasBeneficiaries: false,
  primaryBeneficiaries: [],
  primaryDistributionType: "",
  secondaryBeneficiaries: [],
  secondaryDistributionType: "",
  primaryLegatees: [],
  primaryLegateeDistributionType: "",
  secondaryLegatees: [],
  secondaryLegateeDistributionType: "",
  addToPersonalPropertyMemo: false,
  donee: "",
  notes: "",
  photo: "",
};

interface OtherAssetModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: OtherAssetData) => void;
  onDelete?: () => void;
  initialData?: OtherAssetData;
  beneficiaryOptions: BeneficiaryOption[];
  isEdit?: boolean;
  showSpouse?: boolean;
  trustFlags?: TrustFlags;
}

export const OtherAssetModal: React.FC<OtherAssetModalProps> = ({
  open,
  onClose,
  onSave,
  onDelete,
  initialData,
  isEdit = false,
  showSpouse = true,
  trustFlags,
}) => {
  const ownerOptions = getOwnerOptions(showSpouse);
  const [data, setData] = useState<OtherAssetData>(
    initialData || emptyOtherAsset
  );
  const [touched, setTouched] = useState<TouchedFields<OtherAssetData>>({});

  // Camera / photo state
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraStreamRef = useRef<MediaStream | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const stopCamera = () => {
    if (cameraStreamRef.current) {
      cameraStreamRef.current.getTracks().forEach((t) => t.stop());
      cameraStreamRef.current = null;
    }
    setShowCamera(false);
  };

  const startCamera = async () => {
    setCameraError(null);
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError("Camera access is not supported in this browser. Please use Upload Photo instead.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      cameraStreamRef.current = stream;
      setShowCamera(true);
    } catch (err: unknown) {
      const name = err instanceof Error ? err.name : "";
      if (name === "NotAllowedError" || name === "PermissionDeniedError") {
        // Check whether the browser itself has granted permission —
        // if it has, the block is coming from the OS, not the browser.
        let permissionState: PermissionState | null = null;
        try {
          const result = await navigator.permissions.query({ name: "camera" as PermissionName });
          permissionState = result.state;
        } catch {
          // permissions API not supported
        }
        if (permissionState === "granted") {
          setCameraError("Your browser has camera access, but Windows is blocking it. Go to Windows Settings → Privacy & Security → Camera, make sure 'Camera access' is On, and that your browser (Chrome/Edge) is listed and allowed. Then try again.");
        } else {
          setCameraError("Camera access was blocked by your browser. Click the lock icon (🔒) to the left of the web address, choose 'Site settings', set Camera to 'Allow', then try again.");
        }
      } else if (name === "NotFoundError" || name === "DevicesNotFoundError") {
        setCameraError("No camera was detected on this device. Please use Upload Photo instead.");
      } else {
        setCameraError("Unable to start the camera. Please use Upload Photo instead.");
      }
    }
  };

  useEffect(() => {
    if (showCamera && videoRef.current && cameraStreamRef.current) {
      videoRef.current.srcObject = cameraStreamRef.current;
    }
  }, [showCamera]);

  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d")?.drawImage(video, 0, 0);
    handleChange({ photo: canvas.toDataURL("image/jpeg", 0.85) });
    stopCamera();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => handleChange({ photo: evt.target?.result as string });
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  // Build trust options based on flags
  const trustOwnerOptions: string[] = [];
  if (trustFlags) {
    if (trustFlags.clientHasLivingTrust) {
      trustOwnerOptions.push("Client's Living Trust");
    }
    if (trustFlags.clientHasIrrevocableTrust) {
      trustOwnerOptions.push("Client's Irrevocable Trust");
    }
    if (showSpouse && trustFlags.spouseHasLivingTrust) {
      trustOwnerOptions.push("Spouse's Living Trust");
    }
    if (showSpouse && trustFlags.spouseHasIrrevocableTrust) {
      trustOwnerOptions.push("Spouse's Irrevocable Trust");
    }
  }

  // Combine all owner options
  const allOwnerOptions = [...ownerOptions, ...trustOwnerOptions];
  const fieldsVisible = useFolioFieldAnimation(open);

  useEffect(() => {
    if (open) {
      // Always reset to empty when adding new (isEdit false), otherwise use initialData
      setData(isEdit && initialData ? initialData : emptyOtherAsset);
      setTouched({});
    } else {
      stopCamera();
      setCameraError(null);
    }
  }, [open, initialData, isEdit]);

  const handleChange = (updates: Partial<OtherAssetData>) => {
    setData((prev) => ({ ...prev, ...updates }));
  };

  const handleBlur = (field: keyof OtherAssetData) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  // Validation
  const errors = {
    owner: !hasValue(data.owner),
    description: !hasValue(data.description),
    value: !hasCurrencyValue(data.value),
  };

  const isValid = !errors.owner && !errors.description && !errors.value;

  const handleSave = () => {
    setTouched({ owner: true, description: true, value: true });
    if (isValid) {
      onSave(data);
      onClose();
    }
  };

  return (
    <FolioModal
      open={open}
      onClose={onClose}
      title={isEdit ? "Edit Asset" : "Add Asset"}
      eyebrow="My Life Folio — Assets"
      footer={
        <>
          <Box>
            {isEdit && onDelete && <FolioDeleteButton onClick={onDelete} />}
          </Box>
          <Box sx={{ display: 'flex', gap: 1.5 }}>
            <FolioCancelButton onClick={onClose} />
            <FolioSaveButton onClick={handleSave} disabled={!isValid}>
              {isEdit ? "Save Changes" : "Add Asset"}
            </FolioSaveButton>
          </Box>
        </>
      }
    >
      <FolioFieldFade visible={fieldsVisible} index={0}>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12}>
            <FormControl
              fullWidth
              size="small"
              error={touched.owner && errors.owner}
            >
              <InputLabel>Owner *</InputLabel>
              <Select
                value={data.owner}
                label="Owner *"
                onChange={(e) => {
                  handleChange({ owner: e.target.value });
                  setTouched((prev) => ({ ...prev, owner: true }));
                }}
              >
                {allOwnerOptions.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Description *"
              value={data.description}
              onChange={(e) => handleChange({ description: e.target.value })}
              onBlur={() => handleBlur("description")}
              variant="outlined"
              size="small"
              placeholder="e.g., Jewelry, Collectibles, Special items"
              error={touched.description && errors.description}
              helperText={touched.description && errors.description ? "Required" : ""}
              sx={{ ...folioTextFieldSx }}
            />
          </Grid>
          <Grid item xs={12}>
            <CurrencyInput
              fullWidth
              label="Value *"
              value={data.value}
              onChange={(e) => handleChange({ value: e.target.value })}
              onBlur={() => handleBlur("value")}
              variant="outlined"
              size="small"
              name="otherAssetValue"
              error={touched.value && errors.value}
              helperText={touched.value && errors.value ? "Required" : ""}
              sx={{ ...folioTextFieldSx }}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Donee"
              value={data.donee || ""}
              onChange={(e) => handleChange({ donee: e.target.value })}
              variant="outlined"
              size="small"
              placeholder="Person to receive this item at death"
              sx={{ ...folioTextFieldSx }}
              InputLabelProps={{ shrink: true }}
            />
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
              The person to whom this item should be given at the death of the client or spouse.
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Special information about this item"
              value={data.notes || ""}
              onChange={(e) => handleChange({ notes: e.target.value })}
              variant="outlined"
              multiline
              rows={4}
              sx={{ ...folioTextFieldSx }}
              placeholder="Enter any special information about this item..."
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          <Grid item xs={12}>
            <Typography variant="body2" sx={{ mb: 1, fontWeight: 500, color: 'text.primary' }}>
              Item Photo
            </Typography>
            {data.photo ? (
              <Box>
                <Box
                  component="img"
                  src={data.photo}
                  alt="Item"
                  sx={{ maxWidth: '100%', maxHeight: 220, borderRadius: 1, display: 'block', mb: 1, border: '1px solid', borderColor: 'divider' }}
                />
                <Button size="small" color="error" variant="outlined" onClick={() => handleChange({ photo: "" })}>
                  Remove Photo
                </Button>
              </Box>
            ) : showCamera ? (
              <Box>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  style={{ width: '100%', maxHeight: 220, borderRadius: 4, background: '#000', display: 'block' }}
                />
                <canvas ref={canvasRef} style={{ display: 'none' }} />
                <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                  <Button variant="contained" size="small" onClick={capturePhoto}>
                    Capture
                  </Button>
                  <Button size="small" variant="outlined" onClick={stopCamera}>
                    Cancel
                  </Button>
                </Box>
              </Box>
            ) : (
              <Box>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <Button variant="outlined" size="small" onClick={startCamera}>
                    Take Photo
                  </Button>
                  <Button variant="outlined" size="small" onClick={() => fileInputRef.current?.click()}>
                    Upload Photo
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={handleFileUpload}
                  />
                </Box>
                {cameraError && (
                  <Alert severity="warning" sx={{ mt: 1.5 }} onClose={() => setCameraError(null)}>
                    {cameraError}
                  </Alert>
                )}
              </Box>
            )}
          </Grid>
        </Grid>
      </FolioFieldFade>
    </FolioModal>
  );
};

// Business Interest Types
export type BusinessEntityType =
  | "Sole Proprietorship"
  | "LLC"
  | "Partnership"
  | "S-Corporation"
  | "C-Corporation"
  | "Professional Practice"
  | "Other"
  | "";

const BUSINESS_ENTITY_TYPES: BusinessEntityType[] = [
  "Sole Proprietorship",
  "LLC",
  "Partnership",
  "S-Corporation",
  "C-Corporation",
  "Professional Practice",
  "Other",
];

export interface BusinessInterestData {
  owner: string;
  businessName: string;
  entityType: BusinessEntityType;
  ownershipPercentage: string;
  fullValue: string; // Full estimated value of the business
  coOwners: string;
  hasBuySellAgreement: boolean;
  notes: string;
}

const emptyBusinessInterest: BusinessInterestData = {
  owner: "",
  businessName: "",
  entityType: "",
  ownershipPercentage: "",
  fullValue: "",
  coOwners: "",
  hasBuySellAgreement: false,
  notes: "",
};

interface BusinessInterestModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: BusinessInterestData) => void;
  onDelete?: () => void;
  initialData?: BusinessInterestData;
  isEdit?: boolean;
  showSpouse?: boolean;
  trustFlags?: TrustFlags;
}

// Helper to calculate estimated value based on full value and ownership percentage
const calculateEstimatedValue = (fullValue: string, ownershipPercentage: string): string => {
  if (!fullValue || !ownershipPercentage) return "";
  const fullVal = parseFloat(fullValue.replace(/[^0-9.-]/g, ""));
  const pct = parseFloat(ownershipPercentage.replace(/[^0-9.-]/g, ""));
  if (isNaN(fullVal) || isNaN(pct)) return "";
  const estimated = fullVal * (pct / 100);
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(estimated);
};

export const BusinessInterestModal: React.FC<BusinessInterestModalProps> = ({
  open,
  onClose,
  onSave,
  onDelete,
  initialData,
  isEdit = false,
  showSpouse = true,
  trustFlags,
}) => {
  const ownerOptions = getOwnerOptions(showSpouse);
  const [data, setData] = useState<BusinessInterestData>(
    initialData || emptyBusinessInterest
  );
  const [touched, setTouched] = useState<TouchedFields<BusinessInterestData>>({});

  // Build trust options based on flags
  const trustOwnerOptions: string[] = [];
  if (trustFlags) {
    if (trustFlags.clientHasLivingTrust) {
      trustOwnerOptions.push("Client's Living Trust");
    }
    if (trustFlags.clientHasIrrevocableTrust) {
      trustOwnerOptions.push("Client's Irrevocable Trust");
    }
    if (showSpouse && trustFlags.spouseHasLivingTrust) {
      trustOwnerOptions.push("Spouse's Living Trust");
    }
    if (showSpouse && trustFlags.spouseHasIrrevocableTrust) {
      trustOwnerOptions.push("Spouse's Irrevocable Trust");
    }
  }

  // Combine all owner options
  const allOwnerOptions = [...ownerOptions, ...trustOwnerOptions];
  const fieldsVisible = useFolioFieldAnimation(open);

  useEffect(() => {
    if (open) {
      // Always reset to empty when adding new (isEdit false), otherwise use initialData
      setData(isEdit && initialData ? initialData : emptyBusinessInterest);
      setTouched({});
    }
  }, [open, initialData, isEdit]);

  const handleChange = (updates: Partial<BusinessInterestData>) => {
    setData((prev) => ({ ...prev, ...updates }));
  };

  const handleBlur = (field: keyof BusinessInterestData) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  // Validation
  const errors = {
    owner: !hasValue(data.owner),
    entityType: !hasValue(data.entityType),
    businessName: !hasValue(data.businessName),
    fullValue: !hasCurrencyValue(data.fullValue),
  };

  const isValid = !errors.owner && !errors.entityType && !errors.businessName && !errors.fullValue;

  const handleSave = () => {
    setTouched({ owner: true, entityType: true, businessName: true, fullValue: true });
    if (isValid) {
      onSave(data);
      onClose();
    }
  };

  // Calculate estimated value based on ownership percentage
  const estimatedValue = calculateEstimatedValue(
    data.fullValue,
    data.ownershipPercentage
  );

  return (
    <FolioModal
      open={open}
      onClose={onClose}
      title={isEdit ? "Edit Business Interest" : "Add Business Interest"}
      eyebrow="My Life Folio — Assets"
      footer={
        <>
          <Box>
            {isEdit && onDelete && <FolioDeleteButton onClick={onDelete} />}
          </Box>
          <Box sx={{ display: 'flex', gap: 1.5 }}>
            <FolioCancelButton onClick={onClose} />
            <FolioSaveButton onClick={handleSave} disabled={!isValid}>
              {isEdit ? "Save Changes" : "Add Business"}
            </FolioSaveButton>
          </Box>
        </>
      }
    >
      <FolioFieldFade visible={fieldsVisible} index={0}>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12} md={6}>
            <FormControl
              fullWidth
              size="small"
              error={touched.owner && errors.owner}
            >
              <InputLabel>Owner *</InputLabel>
              <Select
                value={data.owner}
                label="Owner *"
                onChange={(e) => {
                  handleChange({ owner: e.target.value });
                  setTouched((prev) => ({ ...prev, owner: true }));
                }}
              >
                {allOwnerOptions.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl
              fullWidth
              size="small"
              error={touched.entityType && errors.entityType}
            >
              <InputLabel>Entity Type *</InputLabel>
              <Select
                value={data.entityType}
                label="Entity Type *"
                onChange={(e) => {
                  handleChange({
                    entityType: e.target.value as BusinessEntityType,
                  });
                  setTouched((prev) => ({ ...prev, entityType: true }));
                }}
              >
                {BUSINESS_ENTITY_TYPES.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Business Name *"
              value={data.businessName}
              onChange={(e) => handleChange({ businessName: e.target.value })}
              onBlur={() => handleBlur("businessName")}
              variant="outlined"
              size="small"
              error={touched.businessName && errors.businessName}
              helperText={touched.businessName && errors.businessName ? "Required" : ""}
              sx={{ ...folioTextFieldSx }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <CurrencyInput
              fullWidth
              label="Estimated Full Value *"
              value={data.fullValue}
              onChange={(e) => handleChange({ fullValue: e.target.value })}
              onBlur={() => handleBlur("fullValue")}
              variant="outlined"
              size="small"
              name="businessFullValue"
              error={touched.fullValue && errors.fullValue}
              helperText={touched.fullValue && errors.fullValue ? "Required" : ""}
              sx={{ ...folioTextFieldSx }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Ownership Percentage"
              value={data.ownershipPercentage}
              onChange={(e) =>
                handleChange({ ownershipPercentage: e.target.value })
              }
              variant="outlined"
              size="small"
              placeholder="e.g., 50"
              sx={{ ...folioTextFieldSx }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Estimated Value"
              value={estimatedValue}
              variant="outlined"
              size="small"
              InputProps={{
                readOnly: true,
              }}
              helperText="Auto-calculated"
              sx={{ ...folioTextFieldSx }}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Co-Owners (if any)"
              value={data.coOwners}
              onChange={(e) => handleChange({ coOwners: e.target.value })}
              variant="outlined"
              size="small"
              placeholder="Names of other owners"
              sx={{ ...folioTextFieldSx }}
            />
          </Grid>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={data.hasBuySellAgreement || false}
                  onChange={(e) =>
                    handleChange({ hasBuySellAgreement: e.target.checked })
                  }
                />
              }
              label="Has Buy-Sell Agreement?"
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Notes"
              value={data.notes || ""}
              onChange={(e) => handleChange({ notes: e.target.value })}
              variant="outlined"
              multiline
              rows={4}
              sx={{ ...folioTextFieldSx }}
              placeholder="Enter any additional notes about this business interest..."
            />
          </Grid>
        </Grid>
      </FolioFieldFade>
    </FolioModal>
  );
};

// Digital Asset Types
export type DigitalAssetType =
  | "Cryptocurrency"
  | "Domain Names"
  | "Digital Storefront"
  | "NFTs"
  | "Digital Content"
  | "Online Accounts"
  | "Other"
  | "";

const DIGITAL_ASSET_TYPES: DigitalAssetType[] = [
  "Cryptocurrency",
  "Domain Names",
  "Digital Storefront",
  "NFTs",
  "Digital Content",
  "Online Accounts",
  "Other",
];

export interface DigitalAssetData {
  owner: string;
  assetType: DigitalAssetType;
  platform: string;
  description: string;
  value: string;
  notes: string;
}

const emptyDigitalAsset: DigitalAssetData = {
  owner: "",
  assetType: "",
  platform: "",
  description: "",
  value: "",
  notes: "",
};

interface DigitalAssetModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: DigitalAssetData) => void;
  onDelete?: () => void;
  initialData?: DigitalAssetData;
  isEdit?: boolean;
  showSpouse?: boolean;
  trustFlags?: TrustFlags;
}

export const DigitalAssetModal: React.FC<DigitalAssetModalProps> = ({
  open,
  onClose,
  onSave,
  onDelete,
  initialData,
  isEdit = false,
  showSpouse = true,
  trustFlags,
}) => {
  const individualOwnerOptions = getIndividualOwnerOptions(showSpouse);
  const [data, setData] = useState<DigitalAssetData>(
    initialData || emptyDigitalAsset
  );
  const [touched, setTouched] = useState<TouchedFields<DigitalAssetData>>({});

  // Build trust options based on flags
  const trustOwnerOptions: string[] = [];
  if (trustFlags) {
    if (trustFlags.clientHasLivingTrust) {
      trustOwnerOptions.push("Client's Living Trust");
    }
    if (trustFlags.clientHasIrrevocableTrust) {
      trustOwnerOptions.push("Client's Irrevocable Trust");
    }
    if (showSpouse && trustFlags.spouseHasLivingTrust) {
      trustOwnerOptions.push("Spouse's Living Trust");
    }
    if (showSpouse && trustFlags.spouseHasIrrevocableTrust) {
      trustOwnerOptions.push("Spouse's Irrevocable Trust");
    }
  }

  // Combine all owner options
  const allOwnerOptions = [...individualOwnerOptions, ...trustOwnerOptions];
  const fieldsVisible = useFolioFieldAnimation(open);

  useEffect(() => {
    if (open) {
      // Always reset to empty when adding new (isEdit false), otherwise use initialData
      setData(isEdit && initialData ? initialData : emptyDigitalAsset);
      setTouched({});
    }
  }, [open, initialData, isEdit]);

  const handleChange = (updates: Partial<DigitalAssetData>) => {
    setData((prev) => ({ ...prev, ...updates }));
  };

  const handleBlur = (field: keyof DigitalAssetData) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  // Validation
  const errors = {
    owner: !hasValue(data.owner),
    assetType: !hasValue(data.assetType),
    description: !hasValue(data.description),
    value: !hasCurrencyValue(data.value),
  };

  const isValid = !errors.owner && !errors.assetType && !errors.description && !errors.value;

  const handleSave = () => {
    setTouched({ owner: true, assetType: true, description: true, value: true });
    if (isValid) {
      onSave(data);
      onClose();
    }
  };

  return (
    <FolioModal
      open={open}
      onClose={onClose}
      title={isEdit ? "Edit Digital Asset" : "Add Digital Asset"}
      eyebrow="My Life Folio — Assets"
      footer={
        <>
          <Box>
            {isEdit && onDelete && <FolioDeleteButton onClick={onDelete} />}
          </Box>
          <Box sx={{ display: 'flex', gap: 1.5 }}>
            <FolioCancelButton onClick={onClose} />
            <FolioSaveButton onClick={handleSave} disabled={!isValid}>
              {isEdit ? "Save Changes" : "Add Asset"}
            </FolioSaveButton>
          </Box>
        </>
      }
    >
      <FolioFieldFade visible={fieldsVisible} index={0}>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12} md={6}>
            <FormControl
              fullWidth
              size="small"
              error={touched.owner && errors.owner}
            >
              <InputLabel>Owner *</InputLabel>
              <Select
                value={data.owner}
                label="Owner *"
                onChange={(e) => {
                  handleChange({ owner: e.target.value });
                  setTouched((prev) => ({ ...prev, owner: true }));
                }}
              >
                {allOwnerOptions.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl
              fullWidth
              size="small"
              error={touched.assetType && errors.assetType}
            >
              <InputLabel>Asset Type *</InputLabel>
              <Select
                value={data.assetType}
                label="Asset Type *"
                onChange={(e) => {
                  handleChange({
                    assetType: e.target.value as DigitalAssetType,
                  });
                  setTouched((prev) => ({ ...prev, assetType: true }));
                }}
              >
                {DIGITAL_ASSET_TYPES.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Platform/Exchange"
              value={data.platform}
              onChange={(e) => handleChange({ platform: e.target.value })}
              variant="outlined"
              size="small"
              placeholder="e.g., Coinbase, GoDaddy, Etsy"
              sx={{ ...folioTextFieldSx }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <CurrencyInput
              fullWidth
              label="Estimated Value *"
              value={data.value}
              onChange={(e) => handleChange({ value: e.target.value })}
              onBlur={() => handleBlur("value")}
              variant="outlined"
              size="small"
              name="digitalAssetValue"
              error={touched.value && errors.value}
              helperText={touched.value && errors.value ? "Required" : ""}
              sx={{ ...folioTextFieldSx }}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Description *"
              value={data.description}
              onChange={(e) => handleChange({ description: e.target.value })}
              onBlur={() => handleBlur("description")}
              variant="outlined"
              size="small"
              placeholder="e.g., Bitcoin holdings, domain portfolio, Etsy store"
              error={touched.description && errors.description}
              helperText={touched.description && errors.description ? "Required" : ""}
              sx={{ ...folioTextFieldSx }}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Notes"
              value={data.notes || ""}
              onChange={(e) => handleChange({ notes: e.target.value })}
              variant="outlined"
              multiline
              rows={4}
              sx={{ ...folioTextFieldSx }}
              placeholder="Enter any additional notes about this digital asset..."
            />
          </Grid>
        </Grid>
      </FolioFieldFade>
    </FolioModal>
  );
};
