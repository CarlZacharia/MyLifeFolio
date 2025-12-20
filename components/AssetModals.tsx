"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
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
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { RealEstateOwner, OwnershipForm } from "../lib/FormContext";
import CurrencyInput from "./CurrencyInput";

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
];

const CLIENT_ONLY_OWNER_OPTIONS: RealEstateOwner[] = [
  "Client",
  "Client and Other",
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

export interface TrustFlags {
  clientHasLivingTrust: boolean;
  clientHasIrrevocableTrust: boolean;
  spouseHasLivingTrust: boolean;
  spouseHasIrrevocableTrust: boolean;
}

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
}

const BeneficiarySelector: React.FC<BeneficiarySelectorProps> = ({
  label,
  selectedBeneficiaries,
  options,
  onChange,
}) => {
  return (
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
        <TextField {...params} label={label} variant="outlined" />
      )}
      isOptionEqualToValue={(option, value) => option.value === value.value}
    />
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
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{isEdit ? "Edit Property" : "Add Property"}</DialogTitle>
      <DialogContent>
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
            />
          </Grid>

          {(data.ownershipForm === "Life Estate" ||
            data.ownershipForm === "Lady Bird Deed") && (
            <>
              <Grid item xs={12}>
                <BeneficiarySelector
                  label="Remainder Interest"
                  selectedBeneficiaries={data.primaryBeneficiaries}
                  options={beneficiaryOptions}
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
              placeholder="Enter any additional notes about this property..."
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ justifyContent: "space-between", px: 3, pb: 2 }}>
        <Box>
          {isEdit && onDelete && (
            <Button onClick={onDelete} color="error" startIcon={<DeleteIcon />}>
              Delete
            </Button>
          )}
        </Box>
        <Box>
          <Button onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} variant="contained" sx={{ ml: 1 }}>
            {isEdit ? "Save Changes" : "Add Property"}
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
};

// Bank Account Types
export interface BankAccountData {
  owner: string;
  institution: string;
  amount: string;
  hasBeneficiaries: boolean;
  primaryBeneficiaries: string[];
  secondaryBeneficiaries: string[];
  notes: string;
}

const emptyBankAccount: BankAccountData = {
  owner: "",
  institution: "",
  amount: "",
  hasBeneficiaries: false,
  primaryBeneficiaries: [],
  secondaryBeneficiaries: [],
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
}) => {
  const ownerOptions = getOwnerOptions(showSpouse);
  const [data, setData] = useState<BankAccountData>(
    initialData || emptyBankAccount
  );
  const [touched, setTouched] = useState<TouchedFields<BankAccountData>>({});

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
    institution: !hasValue(data.institution),
    amount: !hasCurrencyValue(data.amount),
  };

  const isValid = !errors.owner && !errors.institution && !errors.amount;

  const handleSave = () => {
    setTouched({ owner: true, institution: true, amount: true });
    if (isValid) {
      onSave(data);
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {isEdit ? "Edit Bank Account" : "Add Bank Account"}
      </DialogTitle>
      <DialogContent>
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
                {ownerOptions.map((option) => (
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
            />
          </Grid>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={data.hasBeneficiaries || false}
                  onChange={(e) =>
                    handleChange({ hasBeneficiaries: e.target.checked })
                  }
                />
              }
              label="Has Beneficiaries?"
            />
          </Grid>
          {data.hasBeneficiaries && (
            <>
              <Grid item xs={12}>
                <BeneficiarySelector
                  label="Primary Beneficiaries"
                  selectedBeneficiaries={data.primaryBeneficiaries}
                  options={beneficiaryOptions}
                  onChange={(selected) =>
                    handleChange({ primaryBeneficiaries: selected })
                  }
                />
              </Grid>
              <Grid item xs={12}>
                <BeneficiarySelector
                  label="Secondary Beneficiaries"
                  selectedBeneficiaries={data.secondaryBeneficiaries}
                  options={beneficiaryOptions}
                  onChange={(selected) =>
                    handleChange({ secondaryBeneficiaries: selected })
                  }
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
              placeholder="Enter any additional notes about this account..."
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ justifyContent: "space-between", px: 3, pb: 2 }}>
        <Box>
          {isEdit && onDelete && (
            <Button onClick={onDelete} color="error" startIcon={<DeleteIcon />}>
              Delete
            </Button>
          )}
        </Box>
        <Box>
          <Button onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} variant="contained" sx={{ ml: 1 }}>
            {isEdit ? "Save Changes" : "Add Account"}
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
};

// Non-Qualified Investment Types
export interface NonQualifiedInvestmentData {
  owner: string;
  institution: string;
  description: string;
  value: string;
  hasBeneficiaries: boolean;
  primaryBeneficiaries: string[];
  secondaryBeneficiaries: string[];
  notes: string;
}

const emptyNonQualifiedInvestment: NonQualifiedInvestmentData = {
  owner: "",
  institution: "",
  description: "",
  value: "",
  hasBeneficiaries: false,
  primaryBeneficiaries: [],
  secondaryBeneficiaries: [],
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
}) => {
  const ownerOptions = getOwnerOptions(showSpouse);
  const [data, setData] = useState<NonQualifiedInvestmentData>(
    initialData || emptyNonQualifiedInvestment
  );
  const [touched, setTouched] = useState<TouchedFields<NonQualifiedInvestmentData>>({});

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
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {isEdit ? "Edit Investment Account" : "Add Investment Account"}
      </DialogTitle>
      <DialogContent>
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
                {ownerOptions.map((option) => (
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
            />
          </Grid>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={data.hasBeneficiaries || false}
                  onChange={(e) =>
                    handleChange({ hasBeneficiaries: e.target.checked })
                  }
                />
              }
              label="Has Beneficiaries?"
            />
          </Grid>
          {data.hasBeneficiaries && (
            <>
              <Grid item xs={12}>
                <BeneficiarySelector
                  label="Primary Beneficiaries"
                  selectedBeneficiaries={data.primaryBeneficiaries}
                  options={beneficiaryOptions}
                  onChange={(selected) =>
                    handleChange({ primaryBeneficiaries: selected })
                  }
                />
              </Grid>
              <Grid item xs={12}>
                <BeneficiarySelector
                  label="Secondary Beneficiaries"
                  selectedBeneficiaries={data.secondaryBeneficiaries}
                  options={beneficiaryOptions}
                  onChange={(selected) =>
                    handleChange({ secondaryBeneficiaries: selected })
                  }
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
              placeholder="Enter any additional notes about this investment..."
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ justifyContent: "space-between", px: 3, pb: 2 }}>
        <Box>
          {isEdit && onDelete && (
            <Button onClick={onDelete} color="error" startIcon={<DeleteIcon />}>
              Delete
            </Button>
          )}
        </Box>
        <Box>
          <Button onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} variant="contained" sx={{ ml: 1 }}>
            {isEdit ? "Save Changes" : "Add Account"}
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
};

// Retirement Account Types
export interface RetirementAccountData {
  owner: string;
  institution: string;
  accountType: string;
  value: string;
  hasBeneficiaries: boolean;
  primaryBeneficiaries: string[];
  secondaryBeneficiaries: string[];
  notes: string;
}

const emptyRetirementAccount: RetirementAccountData = {
  owner: "",
  institution: "",
  accountType: "",
  value: "",
  hasBeneficiaries: false,
  primaryBeneficiaries: [],
  secondaryBeneficiaries: [],
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
  const individualOwnerOptions = getIndividualOwnerOptions(showSpouse);
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
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {isEdit ? "Edit Retirement Account" : "Add Retirement Account"}
      </DialogTitle>
      <DialogContent>
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
            />
          </Grid>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={data.hasBeneficiaries || false}
                  onChange={(e) =>
                    handleChange({ hasBeneficiaries: e.target.checked })
                  }
                />
              }
              label="Has Beneficiaries?"
            />
          </Grid>
          {data.hasBeneficiaries && (
            <>
              <Grid item xs={12}>
                <BeneficiarySelector
                  label="Primary Beneficiaries"
                  selectedBeneficiaries={data.primaryBeneficiaries}
                  options={beneficiaryOptions}
                  onChange={(selected) =>
                    handleChange({ primaryBeneficiaries: selected })
                  }
                />
              </Grid>
              <Grid item xs={12}>
                <BeneficiarySelector
                  label="Secondary Beneficiaries"
                  selectedBeneficiaries={data.secondaryBeneficiaries}
                  options={beneficiaryOptions}
                  onChange={(selected) =>
                    handleChange({ secondaryBeneficiaries: selected })
                  }
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
              placeholder="Enter any additional notes about this account..."
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ justifyContent: "space-between", px: 3, pb: 2 }}>
        <Box>
          {isEdit && onDelete && (
            <Button onClick={onDelete} color="error" startIcon={<DeleteIcon />}>
              Delete
            </Button>
          )}
        </Box>
        <Box>
          <Button onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} variant="contained" sx={{ ml: 1 }}>
            {isEdit ? "Save Changes" : "Add Account"}
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
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
  hasBeneficiaries: boolean;
  primaryBeneficiaries: string[];
  secondaryBeneficiaries: string[];
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
  hasBeneficiaries: false,
  primaryBeneficiaries: [],
  secondaryBeneficiaries: [],
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
}) => {
  const individualOwnerOptions = getIndividualOwnerOptions(showSpouse);
  const insuredOptions = getIndividualOwnerOptions(showSpouse);

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
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {isEdit ? "Edit Life Insurance Policy" : "Add Life Insurance Policy"}
      </DialogTitle>
      <DialogContent>
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
                {individualOwnerOptions.map((option) => (
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
                />
              </Grid>
            )}
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={data.hasBeneficiaries || false}
                  onChange={(e) =>
                    handleChange({ hasBeneficiaries: e.target.checked })
                  }
                />
              }
              label="Has Beneficiaries?"
            />
          </Grid>
          {data.hasBeneficiaries && (
            <>
              <Grid item xs={12}>
                <BeneficiarySelector
                  label="Primary Beneficiaries"
                  selectedBeneficiaries={data.primaryBeneficiaries}
                  options={beneficiaryOptions}
                  onChange={(selected) =>
                    handleChange({ primaryBeneficiaries: selected })
                  }
                />
              </Grid>
              <Grid item xs={12}>
                <BeneficiarySelector
                  label="Secondary Beneficiaries"
                  selectedBeneficiaries={data.secondaryBeneficiaries}
                  options={beneficiaryOptions}
                  onChange={(selected) =>
                    handleChange({ secondaryBeneficiaries: selected })
                  }
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
              placeholder="Enter any additional notes about this policy..."
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ justifyContent: "space-between", px: 3, pb: 2 }}>
        <Box>
          {isEdit && onDelete && (
            <Button onClick={onDelete} color="error" startIcon={<DeleteIcon />}>
              Delete
            </Button>
          )}
        </Box>
        <Box>
          <Button onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} variant="contained" sx={{ ml: 1 }}>
            {isEdit ? "Save Changes" : "Add Policy"}
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
};

// Vehicle Types
export interface VehicleData {
  owner: string;
  yearMakeModel: string;
  value: string;
  hasBeneficiaries: boolean;
  primaryBeneficiaries: string[];
  secondaryBeneficiaries: string[];
  notes: string;
}

const emptyVehicle: VehicleData = {
  owner: "",
  yearMakeModel: "",
  value: "",
  hasBeneficiaries: false,
  primaryBeneficiaries: [],
  secondaryBeneficiaries: [],
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
}) => {
  const ownerOptions = getOwnerOptions(showSpouse);
  const [data, setData] = useState<VehicleData>(initialData || emptyVehicle);
  const [touched, setTouched] = useState<TouchedFields<VehicleData>>({});

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
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{isEdit ? "Edit Vehicle" : "Add Vehicle"}</DialogTitle>
      <DialogContent>
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
                {ownerOptions.map((option) => (
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
              name="vehicleValue"
              error={touched.value && errors.value}
              helperText={touched.value && errors.value ? "Required" : ""}
            />
          </Grid>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={data.hasBeneficiaries || false}
                  onChange={(e) =>
                    handleChange({ hasBeneficiaries: e.target.checked })
                  }
                />
              }
              label="Has Beneficiaries?"
            />
          </Grid>
          {data.hasBeneficiaries && (
            <>
              <Grid item xs={12}>
                <BeneficiarySelector
                  label="Primary Beneficiaries"
                  selectedBeneficiaries={data.primaryBeneficiaries}
                  options={beneficiaryOptions}
                  onChange={(selected) =>
                    handleChange({ primaryBeneficiaries: selected })
                  }
                />
              </Grid>
              <Grid item xs={12}>
                <BeneficiarySelector
                  label="Secondary Beneficiaries"
                  selectedBeneficiaries={data.secondaryBeneficiaries}
                  options={beneficiaryOptions}
                  onChange={(selected) =>
                    handleChange({ secondaryBeneficiaries: selected })
                  }
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
              placeholder="Enter any additional notes about this vehicle..."
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ justifyContent: "space-between", px: 3, pb: 2 }}>
        <Box>
          {isEdit && onDelete && (
            <Button onClick={onDelete} color="error" startIcon={<DeleteIcon />}>
              Delete
            </Button>
          )}
        </Box>
        <Box>
          <Button onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} variant="contained" sx={{ ml: 1 }}>
            {isEdit ? "Save Changes" : "Add Vehicle"}
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
};

// Other Asset Types
export interface OtherAssetData {
  owner: string;
  description: string;
  value: string;
  hasBeneficiaries: boolean;
  primaryBeneficiaries: string[];
  secondaryBeneficiaries: string[];
  notes: string;
}

const emptyOtherAsset: OtherAssetData = {
  owner: "",
  description: "",
  value: "",
  hasBeneficiaries: false,
  primaryBeneficiaries: [],
  secondaryBeneficiaries: [],
  notes: "",
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
}

export const OtherAssetModal: React.FC<OtherAssetModalProps> = ({
  open,
  onClose,
  onSave,
  onDelete,
  initialData,
  beneficiaryOptions,
  isEdit = false,
  showSpouse = true,
}) => {
  const ownerOptions = getOwnerOptions(showSpouse);
  const [data, setData] = useState<OtherAssetData>(
    initialData || emptyOtherAsset
  );
  const [touched, setTouched] = useState<TouchedFields<OtherAssetData>>({});

  useEffect(() => {
    if (open) {
      // Always reset to empty when adding new (isEdit false), otherwise use initialData
      setData(isEdit && initialData ? initialData : emptyOtherAsset);
      setTouched({});
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
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{isEdit ? "Edit Asset" : "Add Asset"}</DialogTitle>
      <DialogContent>
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
                {ownerOptions.map((option) => (
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
              placeholder="e.g., Business interest, collectibles, jewelry"
              error={touched.description && errors.description}
              helperText={touched.description && errors.description ? "Required" : ""}
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
            />
          </Grid>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={data.hasBeneficiaries || false}
                  onChange={(e) =>
                    handleChange({ hasBeneficiaries: e.target.checked })
                  }
                />
              }
              label="Has Beneficiaries?"
            />
          </Grid>
          {data.hasBeneficiaries && (
            <>
              <Grid item xs={12}>
                <BeneficiarySelector
                  label="Primary Beneficiaries"
                  selectedBeneficiaries={data.primaryBeneficiaries}
                  options={beneficiaryOptions}
                  onChange={(selected) =>
                    handleChange({ primaryBeneficiaries: selected })
                  }
                />
              </Grid>
              <Grid item xs={12}>
                <BeneficiarySelector
                  label="Secondary Beneficiaries"
                  selectedBeneficiaries={data.secondaryBeneficiaries}
                  options={beneficiaryOptions}
                  onChange={(selected) =>
                    handleChange({ secondaryBeneficiaries: selected })
                  }
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
              placeholder="Enter any additional notes about this asset..."
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ justifyContent: "space-between", px: 3, pb: 2 }}>
        <Box>
          {isEdit && onDelete && (
            <Button onClick={onDelete} color="error" startIcon={<DeleteIcon />}>
              Delete
            </Button>
          )}
        </Box>
        <Box>
          <Button onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} variant="contained" sx={{ ml: 1 }}>
            {isEdit ? "Save Changes" : "Add Asset"}
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
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
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {isEdit ? "Edit Business Interest" : "Add Business Interest"}
      </DialogTitle>
      <DialogContent>
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
              placeholder="Enter any additional notes about this business interest..."
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ justifyContent: "space-between", px: 3, pb: 2 }}>
        <Box>
          {isEdit && onDelete && (
            <Button onClick={onDelete} color="error" startIcon={<DeleteIcon />}>
              Delete
            </Button>
          )}
        </Box>
        <Box>
          <Button onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} variant="contained" sx={{ ml: 1 }}>
            {isEdit ? "Save Changes" : "Add Business"}
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
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
}

export const DigitalAssetModal: React.FC<DigitalAssetModalProps> = ({
  open,
  onClose,
  onSave,
  onDelete,
  initialData,
  isEdit = false,
  showSpouse = true,
}) => {
  const individualOwnerOptions = getIndividualOwnerOptions(showSpouse);
  const [data, setData] = useState<DigitalAssetData>(
    initialData || emptyDigitalAsset
  );
  const [touched, setTouched] = useState<TouchedFields<DigitalAssetData>>({});

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
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {isEdit ? "Edit Digital Asset" : "Add Digital Asset"}
      </DialogTitle>
      <DialogContent>
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
                {individualOwnerOptions.map((option) => (
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
              placeholder="Enter any additional notes about this digital asset..."
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ justifyContent: "space-between", px: 3, pb: 2 }}>
        <Box>
          {isEdit && onDelete && (
            <Button onClick={onDelete} color="error" startIcon={<DeleteIcon />}>
              Delete
            </Button>
          )}
        </Box>
        <Box>
          <Button onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} variant="contained" sx={{ ml: 1 }}>
            {isEdit ? "Save Changes" : "Add Asset"}
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
};
