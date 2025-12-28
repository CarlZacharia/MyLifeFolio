import { FormData } from './FormContext';

export interface CategorizedAsset {
  description: string;
  assetType: string;
  value: number;
  ownershipForm?: string;
}

export interface AssetCategories {
  clientProbate: CategorizedAsset[];
  clientNonProbate: CategorizedAsset[];
  spouseProbate: CategorizedAsset[];
  spouseNonProbate: CategorizedAsset[];
  jointNonProbate: CategorizedAsset[];
}

export interface AssetCategorySummary {
  categories: AssetCategories;
  totals: {
    clientProbate: number;
    clientNonProbate: number;
    spouseProbate: number;
    spouseNonProbate: number;
    jointNonProbate: number;
    totalEstateValue: number;
  };
}

/**
 * Parse a currency string to a number
 */
export const parseCurrencyValue = (value: string): number => {
  if (!value) return 0;
  const num = parseFloat(value.replace(/[^0-9.-]/g, ''));
  return isNaN(num) ? 0 : num;
};

/**
 * Format a number as currency
 */
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
};

/**
 * Determine if an ownership form is non-probate
 */
export const isNonProbateOwnership = (ownershipForm: string): boolean => {
  const nonProbateForms = [
    'Life Estate',
    'Lady Bird Deed',
    'Living Trust',
    'Irrevocable Trust',
    'JTWROS',
    'Tenants by Entirety',
  ];
  return nonProbateForms.includes(ownershipForm);
};

/**
 * Determine if owner includes Client
 */
export const ownerIncludesClient = (owner: string): boolean => {
  return owner === 'Client' || owner.includes('Client');
};

/**
 * Determine if owner includes Spouse
 */
export const ownerIncludesSpouse = (owner: string): boolean => {
  return owner === 'Spouse' || owner.includes('Spouse');
};

/**
 * Determine if it's a joint asset
 */
export const isJointOwnership = (owner: string): boolean => {
  return owner === 'Joint' || owner === 'Client and Spouse' || owner.includes('and');
};

/**
 * Calculate total value of categorized assets
 */
export const calculateCategoryTotal = (assets: CategorizedAsset[]): number => {
  return assets.reduce((sum, asset) => sum + asset.value, 0);
};

/**
 * Categorize all assets by ownership type (probate vs non-probate) and owner
 */
export const categorizeAssets = (formData: FormData): AssetCategorySummary => {
  const categories: AssetCategories = {
    clientProbate: [],
    clientNonProbate: [],
    spouseProbate: [],
    spouseNonProbate: [],
    jointNonProbate: [],
  };

  // Categorize Real Estate
  formData.realEstate.forEach((property) => {
    const asset: CategorizedAsset = {
      description: `${property.street}, ${property.city}, ${property.state}`,
      assetType: 'Real Estate',
      value: parseCurrencyValue(property.value),
      ownershipForm: property.ownershipForm,
    };

    const isNonProbate = isNonProbateOwnership(property.ownershipForm);
    const isJoint = isJointOwnership(property.owner);

    if (isJoint) {
      categories.jointNonProbate.push(asset);
    } else if (property.owner === 'Client') {
      if (isNonProbate) {
        categories.clientNonProbate.push(asset);
      } else {
        categories.clientProbate.push(asset);
      }
    } else if (property.owner === 'Spouse') {
      if (isNonProbate) {
        categories.spouseNonProbate.push(asset);
      } else {
        categories.spouseProbate.push(asset);
      }
    }
  });

  // Categorize Bank Accounts
  formData.bankAccounts.forEach((account) => {
    const asset: CategorizedAsset = {
      description: account.institution,
      assetType: 'Bank Account',
      value: parseCurrencyValue(account.amount),
    };

    const isJoint = isJointOwnership(account.owner);

    if (isJoint) {
      categories.jointNonProbate.push(asset);
    } else if (ownerIncludesClient(account.owner) && !ownerIncludesSpouse(account.owner)) {
      categories.clientProbate.push(asset);
    } else if (ownerIncludesSpouse(account.owner) && !ownerIncludesClient(account.owner)) {
      categories.spouseProbate.push(asset);
    }
  });

  // Categorize Retirement Accounts (always non-probate due to beneficiary designation)
  formData.retirementAccounts.forEach((account) => {
    const asset: CategorizedAsset = {
      description: `${account.institution} - ${account.accountType}`,
      assetType: 'Retirement Account',
      value: parseCurrencyValue(account.value),
    };

    if (ownerIncludesClient(account.owner) && !ownerIncludesSpouse(account.owner)) {
      categories.clientNonProbate.push(asset);
    } else if (ownerIncludesSpouse(account.owner) && !ownerIncludesClient(account.owner)) {
      categories.spouseNonProbate.push(asset);
    } else if (isJointOwnership(account.owner)) {
      categories.jointNonProbate.push(asset);
    }
  });

  // Categorize Life Insurance (always non-probate due to beneficiary designation)
  // Use deathBenefit as the value - this is the required field and represents the payout amount
  formData.lifeInsurance.forEach((policy) => {
    const asset: CategorizedAsset = {
      description: `${policy.company} - ${policy.insured}`,
      assetType: 'Life Insurance',
      value: parseCurrencyValue(policy.deathBenefit),
    };

    // Life insurance is owned by the insured
    if (policy.insured === 'Client' || policy.insured === formData.name) {
      categories.clientNonProbate.push(asset);
    } else if (policy.insured === 'Spouse' || policy.insured === formData.spouseName) {
      categories.spouseNonProbate.push(asset);
    } else {
      categories.jointNonProbate.push(asset);
    }
  });

  // Categorize Non-Qualified Investments
  formData.nonQualifiedInvestments.forEach((investment) => {
    const asset: CategorizedAsset = {
      description: investment.institution,
      assetType: 'Non-Qualified Investment',
      value: parseCurrencyValue(investment.value),
    };

    const isJoint = isJointOwnership(investment.owner);

    if (isJoint) {
      categories.jointNonProbate.push(asset);
    } else if (ownerIncludesClient(investment.owner) && !ownerIncludesSpouse(investment.owner)) {
      categories.clientProbate.push(asset);
    } else if (ownerIncludesSpouse(investment.owner) && !ownerIncludesClient(investment.owner)) {
      categories.spouseProbate.push(asset);
    }
  });

  // Categorize Vehicles
  formData.vehicles.forEach((vehicle) => {
    const asset: CategorizedAsset = {
      description: vehicle.yearMakeModel,
      assetType: 'Vehicle',
      value: parseCurrencyValue(vehicle.value),
    };

    const isJoint = isJointOwnership(vehicle.owner);

    if (isJoint) {
      categories.jointNonProbate.push(asset);
    } else if (ownerIncludesClient(vehicle.owner) && !ownerIncludesSpouse(vehicle.owner)) {
      categories.clientProbate.push(asset);
    } else if (ownerIncludesSpouse(vehicle.owner) && !ownerIncludesClient(vehicle.owner)) {
      categories.spouseProbate.push(asset);
    }
  });

  // Categorize Other Assets
  // Items marked for Personal Property Memorandum are non-probate (pass directly to named legatees)
  formData.otherAssets.forEach((otherAsset) => {
    const asset: CategorizedAsset = {
      description: otherAsset.description,
      assetType: otherAsset.addToPersonalPropertyMemo ? 'Other Asset (PPM)' : 'Other Asset',
      value: parseCurrencyValue(otherAsset.value),
    };

    const isJoint = isJointOwnership(otherAsset.owner);
    const isPersonalPropertyMemo = otherAsset.addToPersonalPropertyMemo;

    if (isJoint) {
      categories.jointNonProbate.push(asset);
    } else if (ownerIncludesClient(otherAsset.owner) && !ownerIncludesSpouse(otherAsset.owner)) {
      // PPM items are non-probate
      if (isPersonalPropertyMemo) {
        categories.clientNonProbate.push(asset);
      } else {
        categories.clientProbate.push(asset);
      }
    } else if (ownerIncludesSpouse(otherAsset.owner) && !ownerIncludesClient(otherAsset.owner)) {
      // PPM items are non-probate
      if (isPersonalPropertyMemo) {
        categories.spouseNonProbate.push(asset);
      } else {
        categories.spouseProbate.push(asset);
      }
    }
  });

  // Categorize Business Interests
  formData.businessInterests.forEach((business) => {
    const asset: CategorizedAsset = {
      description: business.businessName,
      assetType: 'Business Interest',
      value: parseCurrencyValue(business.value),
    };

    const isJoint = isJointOwnership(business.owner);

    if (isJoint) {
      categories.jointNonProbate.push(asset);
    } else if (ownerIncludesClient(business.owner) && !ownerIncludesSpouse(business.owner)) {
      categories.clientProbate.push(asset);
    } else if (ownerIncludesSpouse(business.owner) && !ownerIncludesClient(business.owner)) {
      categories.spouseProbate.push(asset);
    }
  });

  // Calculate totals
  const totals = {
    clientProbate: calculateCategoryTotal(categories.clientProbate),
    clientNonProbate: calculateCategoryTotal(categories.clientNonProbate),
    spouseProbate: calculateCategoryTotal(categories.spouseProbate),
    spouseNonProbate: calculateCategoryTotal(categories.spouseNonProbate),
    jointNonProbate: calculateCategoryTotal(categories.jointNonProbate),
    totalEstateValue: 0,
  };

  totals.totalEstateValue =
    totals.clientProbate +
    totals.clientNonProbate +
    totals.spouseProbate +
    totals.spouseNonProbate +
    totals.jointNonProbate;

  return { categories, totals };
};
