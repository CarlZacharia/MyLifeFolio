/**
 * TrustPlan Utility Functions
 *
 * These functions analyze FormData and generate trust planning recommendations.
 * They READ from FormData (never modify it) and produce analysis/recommendation objects.
 */

import {
  FormData,
  OwnershipForm,
  RealEstateOwner,
} from '../../lib/FormContext';

import {
  AssetAnalysis,
  AssetType,
  AssetPassageMethod,
  AssetRecommendation,
  BeneficiaryAnalysis,
  CurrentPlanAnalysis,
  PlanningIssue,
  TrustCenteredPlan,
  ProjectedBenefits,
  AssetRetitling,
  BeneficiaryChange,
  TrustPlanData,
} from './trustPlanTypes';

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Parse currency string to number
 */
export function parseValue(value: string | undefined): number {
  if (!value) return 0;
  const cleaned = value.replace(/[$,]/g, '');
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}

/**
 * Format number as currency
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

/**
 * Calculate age from birthdate string
 */
export function calculateAge(birthDateStr: string | Date | null): number | null {
  if (!birthDateStr) return null;
  const birthDate = typeof birthDateStr === 'string' ? new Date(birthDateStr) : birthDateStr;
  if (isNaN(birthDate.getTime())) return null;

  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

/**
 * Check if a beneficiary is a minor (under 18)
 */
export function isMinor(age: number | null): boolean {
  return age !== null && age < 18;
}

/**
 * Get client and spouse names for display
 */
export function getClientNames(formData: FormData): { client: string; spouse: string } {
  return {
    client: formData.name || 'Client',
    spouse: formData.spouseName || 'Spouse',
  };
}

/**
 * Check if married
 */
export function isMarried(formData: FormData): boolean {
  return ['Married', 'Second Marriage', 'Domestic Partnership'].includes(formData.maritalStatus);
}

// ============================================================================
// ASSET PASSAGE ANALYSIS
// ============================================================================

/**
 * Determine how a real estate asset passes at death based on ownership form
 */
function analyzeRealEstatePassage(
  ownershipForm: OwnershipForm,
  owner: RealEstateOwner,
  hasBeneficiaries: boolean,
  isMarried: boolean
): { firstDeath: AssetPassageMethod; secondDeath: AssetPassageMethod } {
  switch (ownershipForm) {
    case 'Tenants by Entirety':
    case 'JTWROS':
      return {
        firstDeath: 'joint_survivorship',
        secondDeath: hasBeneficiaries ? 'beneficiary_designation' : 'probate',
      };

    case 'Life Estate':
    case 'Lady Bird Deed':
      return {
        firstDeath: 'deed_remainder',
        secondDeath: 'deed_remainder', // Remainderman gets it directly
      };

    case 'Living Trust':
      return {
        firstDeath: 'trust',
        secondDeath: 'trust',
      };

    case 'Irrevocable Trust':
      return {
        firstDeath: 'trust',
        secondDeath: 'trust',
      };

    case 'Tenants in Common':
      return {
        firstDeath: 'probate',
        secondDeath: 'probate',
      };

    case 'Sole':
    default:
      return {
        firstDeath: 'probate',
        secondDeath: 'probate',
      };
  }
}

/**
 * Determine how a financial asset passes based on beneficiary designations
 */
function analyzeFinancialAssetPassage(
  owner: string,
  hasBeneficiaries: boolean,
  primaryBeneficiaries: string[],
  isMarried: boolean,
  clientName: string,
  spouseName: string
): { firstDeath: AssetPassageMethod; secondDeath: AssetPassageMethod } {
  // Check if spouse is primary beneficiary
  const spouseIsPrimary = primaryBeneficiaries.some(
    b => b.toLowerCase().includes('spouse') || b.includes(spouseName)
  );

  if (hasBeneficiaries && primaryBeneficiaries.length > 0) {
    if (isMarried && spouseIsPrimary) {
      return {
        firstDeath: 'beneficiary_designation',
        secondDeath: 'probate', // After spouse dies, what happens to their share?
      };
    }
    return {
      firstDeath: 'beneficiary_designation',
      secondDeath: 'beneficiary_designation',
    };
  }

  // Joint account without POD
  if (owner.includes('Joint') || owner.includes('and')) {
    return {
      firstDeath: 'joint_survivorship',
      secondDeath: 'probate',
    };
  }

  return {
    firstDeath: 'probate',
    secondDeath: 'probate',
  };
}

// ============================================================================
// ISSUE DETECTION
// ============================================================================

/**
 * Identify issues with a real estate asset
 */
function identifyRealEstateIssues(
  asset: FormData['realEstate'][0],
  index: number,
  formData: FormData,
  minorBeneficiaries: string[]
): PlanningIssue[] {
  const issues: PlanningIssue[] = [];

  // TBE/JTWROS: Good at first death, but problem at second death
  if (asset.ownershipForm === 'Tenants by Entirety' || asset.ownershipForm === 'JTWROS') {
    issues.push({
      severity: 'medium',
      title: 'Second Death Probate Risk',
      description: `This property avoids probate at first death, but after the surviving owner dies, it will require probate unless retitled or placed in a trust.`,
      affectedAssets: [`realEstate-${index}`],
    });
  }

  // Lady Bird Deed or Life Estate with minor remaindermen
  if ((asset.ownershipForm === 'Lady Bird Deed' || asset.ownershipForm === 'Life Estate') &&
      asset.primaryBeneficiaries?.length > 0) {
    const minorRemaindermen = asset.primaryBeneficiaries.filter(b =>
      minorBeneficiaries.some(minor => b.includes(minor))
    );
    if (minorRemaindermen.length > 0) {
      issues.push({
        severity: 'high',
        title: 'Minor Receives Real Estate Directly',
        description: `Property will pass directly to minor children (${minorRemaindermen.join(', ')}). Minors cannot hold title to real estate - a guardianship may be required.`,
        affectedBeneficiaries: minorRemaindermen,
        affectedAssets: [`realEstate-${index}`],
      });
    }
  }

  // Sole ownership always requires probate
  if (asset.ownershipForm === 'Sole') {
    issues.push({
      severity: 'medium',
      title: 'Probate Required',
      description: 'Property held in sole ownership will require probate to transfer.',
      affectedAssets: [`realEstate-${index}`],
    });
  }

  // Tenants in Common always requires probate
  if (asset.ownershipForm === 'Tenants in Common') {
    issues.push({
      severity: 'medium',
      title: 'Probate Required for TIC Share',
      description: 'Tenants in Common interest will require probate to transfer your share.',
      affectedAssets: [`realEstate-${index}`],
    });
  }

  return issues;
}

/**
 * Identify issues with financial assets
 */
function identifyFinancialAssetIssues(
  asset: { hasBeneficiaries: boolean; primaryBeneficiaries: string[]; owner: string },
  assetType: AssetType,
  assetId: string,
  description: string,
  minorBeneficiaries: string[]
): PlanningIssue[] {
  const issues: PlanningIssue[] = [];

  // No beneficiary designation
  if (!asset.hasBeneficiaries || asset.primaryBeneficiaries.length === 0) {
    // Joint accounts are less critical
    if (!asset.owner.includes('Joint') && !asset.owner.includes('and')) {
      issues.push({
        severity: 'medium',
        title: 'No Beneficiary Designation',
        description: `${description} has no named beneficiary and will require probate.`,
        affectedAssets: [assetId],
      });
    } else {
      issues.push({
        severity: 'low',
        title: 'No POD After Survivor',
        description: `Joint account will pass to survivor, but has no POD designation for after survivor's death.`,
        affectedAssets: [assetId],
      });
    }
  }

  // Minor named as direct beneficiary
  if (asset.hasBeneficiaries && asset.primaryBeneficiaries.length > 0) {
    const minorsAsBeneficiaries = asset.primaryBeneficiaries.filter(b =>
      minorBeneficiaries.some(minor => b.includes(minor))
    );
    if (minorsAsBeneficiaries.length > 0) {
      issues.push({
        severity: 'high',
        title: 'Minor Named as Direct Beneficiary',
        description: `Minor children (${minorsAsBeneficiaries.join(', ')}) are named as beneficiaries. They cannot directly receive funds - a custodian or guardianship will be required.`,
        affectedBeneficiaries: minorsAsBeneficiaries,
        affectedAssets: [assetId],
      });
    }
  }

  return issues;
}

// ============================================================================
// RECOMMENDATION GENERATION
// ============================================================================

/**
 * Generate recommendation for a real estate asset
 */
function generateRealEstateRecommendation(
  asset: FormData['realEstate'][0],
  formData: FormData
): AssetRecommendation {
  const { client, spouse } = getClientNames(formData);
  const married = isMarried(formData);

  // Already in trust - keep it
  if (asset.ownershipForm === 'Living Trust' || asset.ownershipForm === 'Irrevocable Trust') {
    return {
      action: 'keep_current',
      explanation: 'Property is already held in trust.',
      benefits: ['Avoids probate', 'Provides incapacity protection', 'Maintains privacy'],
      priority: 'low',
    };
  }

  // Lady Bird Deed - consider naming trust as remainderman
  if (asset.ownershipForm === 'Lady Bird Deed') {
    return {
      action: 'special_consideration',
      recommendedBeneficiary: 'Trust as remainderman',
      explanation: 'Lady Bird Deed is effective for probate avoidance. Consider naming the Trust as remainderman instead of individuals to enable age restrictions and coordinated distributions.',
      benefits: [
        'Maintains existing probate avoidance',
        'Adds protection for minor beneficiaries',
        'Coordinates with overall distribution plan',
      ],
      considerations: [
        'Requires new deed naming trust as remainderman',
        'Original Lady Bird benefits preserved',
      ],
      priority: 'medium',
    };
  }

  // Life Estate - similar to Lady Bird
  if (asset.ownershipForm === 'Life Estate') {
    return {
      action: 'special_consideration',
      recommendedBeneficiary: 'Trust as remainderman',
      explanation: 'Life Estate avoids probate but passes directly to remaindermen. Consider naming the Trust to provide more flexibility and protection.',
      benefits: ['Adds beneficiary protection', 'Enables distribution controls'],
      priority: 'medium',
    };
  }

  // TBE or JTWROS - recommend retitling to trust
  if (asset.ownershipForm === 'Tenants by Entirety' || asset.ownershipForm === 'JTWROS') {
    const trustName = married
      ? `${client} and ${spouse}, Trustees of the [Trust Name]`
      : `${client}, Trustee of the [Trust Name]`;

    return {
      action: 'retitle_to_trust',
      recommendedTitle: trustName,
      explanation: `${asset.ownershipForm} avoids probate at first death, but property becomes individual ownership of survivor. Retitling to trust ensures probate avoidance at both deaths and provides incapacity protection.`,
      benefits: [
        'Avoids probate at both deaths',
        'Provides incapacity protection',
        'Maintains privacy',
        'No step-up in basis impact',
      ],
      priority: 'high',
    };
  }

  // Sole ownership or Tenants in Common - definitely retitle
  const trustName = married
    ? `${client} and ${spouse}, Trustees of the [Trust Name]`
    : `${client}, Trustee of the [Trust Name]`;

  return {
    action: 'retitle_to_trust',
    recommendedTitle: trustName,
    explanation: 'Property in sole ownership or tenants in common requires probate. Retitling to trust eliminates probate and provides incapacity protection.',
    benefits: [
      'Eliminates probate requirement',
      'Provides incapacity protection',
      'Maintains privacy',
    ],
    priority: 'high',
  };
}

/**
 * Generate recommendation for bank accounts
 */
function generateBankAccountRecommendation(
  asset: FormData['bankAccounts'][0],
  formData: FormData
): AssetRecommendation {
  const { client, spouse } = getClientNames(formData);
  const married = isMarried(formData);

  // Has POD beneficiary
  if (asset.hasBeneficiaries && asset.primaryBeneficiaries.length > 0) {
    // Check if beneficiaries include minors
    const hasMinorBeneficiary = formData.children.some(child => {
      const age = calculateAge(child.birthDate);
      return isMinor(age) && asset.primaryBeneficiaries.some(b => b.includes(child.name));
    });

    if (hasMinorBeneficiary) {
      return {
        action: 'change_beneficiary',
        recommendedBeneficiary: 'Trust',
        explanation: 'Account has minor beneficiaries who cannot directly receive funds. Naming the Trust as beneficiary provides management and distribution controls.',
        benefits: [
          'Protects minor beneficiaries',
          'Enables age-based distribution',
          'Provides professional management',
        ],
        priority: 'high',
      };
    }

    return {
      action: 'keep_current',
      explanation: 'Account has beneficiary designation and avoids probate.',
      benefits: ['Avoids probate', 'Simple transfer at death'],
      priority: 'low',
    };
  }

  // No beneficiary - recommend retitling to trust
  const trustName = married
    ? `${client} and ${spouse}, Trustees of the [Trust Name]`
    : `${client}, Trustee of the [Trust Name]`;

  return {
    action: 'retitle_to_trust',
    recommendedTitle: trustName,
    explanation: 'Account has no beneficiary designation and will require probate. Retitling to trust or adding a POD to the trust avoids probate.',
    benefits: [
      'Avoids probate',
      'Provides incapacity protection',
      'Coordinates with distribution plan',
    ],
    priority: 'high',
  };
}

/**
 * Generate recommendation for retirement accounts
 */
function generateRetirementRecommendation(
  asset: FormData['retirementAccounts'][0],
  formData: FormData
): AssetRecommendation {
  // Retirement accounts have special tax considerations
  const spouseIsPrimary = asset.primaryBeneficiaries.some(
    b => b.toLowerCase().includes('spouse') || b.includes(formData.spouseName)
  );

  // Check for minor contingent beneficiaries
  const hasMinorBeneficiary = formData.children.some(child => {
    const age = calculateAge(child.birthDate);
    return isMinor(age) && (
      asset.primaryBeneficiaries.some(b => b.includes(child.name)) ||
      asset.secondaryBeneficiaries.some(b => b.includes(child.name))
    );
  });

  if (hasMinorBeneficiary) {
    return {
      action: 'special_consideration',
      explanation: 'Retirement account has minor beneficiaries. Consider a "see-through" or "conduit" trust as contingent beneficiary to protect minors while preserving tax benefits.',
      benefits: [
        'Protects minor beneficiaries',
        'Can preserve stretch IRA benefits if properly structured',
        'Professional management of funds',
      ],
      considerations: [
        'Trust must meet IRS requirements for designated beneficiary status',
        'Consult with tax advisor before making changes',
        'SECURE Act rules affect distribution timelines',
      ],
      priority: 'medium',
    };
  }

  if (spouseIsPrimary && isMarried(formData)) {
    return {
      action: 'keep_current',
      explanation: 'Spouse as primary beneficiary is typically optimal for retirement accounts, allowing spousal rollover and continued tax deferral.',
      benefits: [
        'Spouse can roll over to own IRA',
        'Continued tax deferral',
        'Avoids probate',
      ],
      priority: 'low',
    };
  }

  if (!asset.hasBeneficiaries || asset.primaryBeneficiaries.length === 0) {
    return {
      action: 'change_beneficiary',
      recommendedBeneficiary: isMarried(formData) ? 'Spouse primary, Trust contingent' : 'Trust',
      explanation: 'Retirement account needs beneficiary designation to avoid probate and potential tax complications.',
      benefits: [
        'Avoids probate',
        'Preserves tax advantages',
        'Clear succession plan',
      ],
      priority: 'high',
    };
  }

  return {
    action: 'keep_current',
    explanation: 'Retirement account has appropriate beneficiary designations.',
    benefits: ['Avoids probate', 'Tax-efficient transfer'],
    priority: 'low',
  };
}

/**
 * Generate recommendation for life insurance
 */
function generateLifeInsuranceRecommendation(
  asset: FormData['lifeInsurance'][0],
  formData: FormData
): AssetRecommendation {
  const hasMinorBeneficiary = formData.children.some(child => {
    const age = calculateAge(child.birthDate);
    return isMinor(age) && (
      asset.primaryBeneficiaries.some(b => b.includes(child.name)) ||
      asset.secondaryBeneficiaries.some(b => b.includes(child.name))
    );
  });

  if (hasMinorBeneficiary) {
    return {
      action: 'change_beneficiary',
      recommendedBeneficiary: 'Trust as contingent beneficiary',
      explanation: 'Life insurance proceeds would go to minor children who cannot manage large sums. Naming the Trust as beneficiary provides management and age-based distribution.',
      benefits: [
        'Professional management of proceeds',
        'Age-based distribution controls',
        'Creditor protection for beneficiaries',
      ],
      priority: 'high',
    };
  }

  if (!asset.hasBeneficiaries || asset.primaryBeneficiaries.length === 0) {
    return {
      action: 'change_beneficiary',
      recommendedBeneficiary: isMarried(formData) ? 'Spouse primary, Trust contingent' : 'Trust',
      explanation: 'Life insurance needs beneficiary designation to avoid probate.',
      benefits: ['Avoids probate', 'Quick distribution to beneficiaries'],
      priority: 'high',
    };
  }

  return {
    action: 'keep_current',
    explanation: 'Life insurance has appropriate beneficiary designations.',
    benefits: ['Avoids probate', 'Tax-free proceeds to beneficiaries'],
    priority: 'low',
  };
}

/**
 * Generate recommendation for other assets (tangible personal property)
 */
function generateOtherAssetRecommendation(
  asset: FormData['otherAssets'][0],
  formData: FormData
): AssetRecommendation {
  const { client, spouse } = getClientNames(formData);

  return {
    action: 'retitle_to_trust',
    recommendedTitle: 'Assignment of Personal Property to Trust',
    explanation: 'Personal property not assigned to trust requires probate. A blanket assignment document transfers ownership of tangible personal property to the trust.',
    benefits: [
      'Avoids probate for personal property',
      'Simple one-time document',
      'Covers future acquisitions',
    ],
    priority: 'medium',
  };
}

// ============================================================================
// MAIN ANALYSIS FUNCTIONS
// ============================================================================

/**
 * Analyze all assets in FormData and generate CurrentPlanAnalysis
 */
export function analyzeCurrentPlan(formData: FormData): CurrentPlanAnalysis {
  const assetAnalyses: AssetAnalysis[] = [];
  const allIssues: PlanningIssue[] = [];
  const { client, spouse } = getClientNames(formData);
  const married = isMarried(formData);

  // Identify minor beneficiaries
  const minorBeneficiaries = formData.children
    .filter(child => {
      const age = calculateAge(child.birthDate);
      return isMinor(age);
    })
    .map(child => child.name);

  let totalEstateValue = 0;
  let probateEstateFirstDeath = 0;
  let probateEstateSecondDeath = 0;

  // Analyze Real Estate
  formData.realEstate.forEach((asset, index) => {
    const grossValue = parseValue(asset.value);
    // Use gross value for both display and estate totals
    totalEstateValue += grossValue;

    const passage = analyzeRealEstatePassage(
      asset.ownershipForm,
      asset.owner,
      asset.primaryBeneficiaries?.length > 0,
      married
    );

    const issues = identifyRealEstateIssues(asset, index, formData, minorBeneficiaries);
    allIssues.push(...issues);

    const requiresProbateFirst = passage.firstDeath === 'probate';
    const requiresProbateSecond = passage.secondDeath === 'probate';

    // Use gross value for probate estate (mortgage doesn't avoid probate)
    if (requiresProbateFirst) probateEstateFirstDeath += grossValue;
    if (requiresProbateSecond) probateEstateSecondDeath += grossValue;

    const description = `${asset.street}, ${asset.city}, ${asset.state}`;

    assetAnalyses.push({
      assetType: 'realEstate',
      assetIndex: index,
      assetId: `realEstate-${index}`,
      description,
      value: grossValue, // Display gross value, not net
      currentOwner: asset.owner,
      currentOwnershipForm: asset.ownershipForm,
      currentBeneficiaries: asset.primaryBeneficiaries || [],
      passageMethodFirstDeath: passage.firstDeath,
      passageMethodSecondDeath: passage.secondDeath,
      requiresProbateFirstDeath: requiresProbateFirst,
      requiresProbateSecondDeath: requiresProbateSecond,
      protectsMinorBeneficiaries: asset.ownershipForm === 'Living Trust',
      alignsWithDistributionPlan: true, // Will be calculated separately
      issues,
      recommendation: generateRealEstateRecommendation(asset, formData),
    });
  });

  // Analyze Bank Accounts
  formData.bankAccounts.forEach((asset, index) => {
    const value = parseValue(asset.amount);
    totalEstateValue += value;

    const passage = analyzeFinancialAssetPassage(
      asset.owner,
      asset.hasBeneficiaries,
      asset.primaryBeneficiaries,
      married,
      client,
      spouse
    );

    const assetId = `bankAccount-${index}`;
    const description = `${asset.accountType} at ${asset.institution}`;
    const issues = identifyFinancialAssetIssues(
      asset,
      'bankAccount',
      assetId,
      description,
      minorBeneficiaries
    );
    allIssues.push(...issues);

    const requiresProbateFirst = passage.firstDeath === 'probate';
    const requiresProbateSecond = passage.secondDeath === 'probate';

    if (requiresProbateFirst) probateEstateFirstDeath += value;
    if (requiresProbateSecond) probateEstateSecondDeath += value;

    assetAnalyses.push({
      assetType: 'bankAccount',
      assetIndex: index,
      assetId,
      description,
      value,
      currentOwner: asset.owner,
      currentOwnershipForm: asset.owner.includes('Joint') ? 'JTWROS' : 'Sole',
      currentBeneficiaries: asset.primaryBeneficiaries || [],
      passageMethodFirstDeath: passage.firstDeath,
      passageMethodSecondDeath: passage.secondDeath,
      requiresProbateFirstDeath: requiresProbateFirst,
      requiresProbateSecondDeath: requiresProbateSecond,
      protectsMinorBeneficiaries: false,
      alignsWithDistributionPlan: true,
      issues,
      recommendation: generateBankAccountRecommendation(asset, formData),
    });
  });

  // Analyze Retirement Accounts
  formData.retirementAccounts.forEach((asset, index) => {
    const value = parseValue(asset.value);
    totalEstateValue += value;

    const passage = analyzeFinancialAssetPassage(
      asset.owner,
      asset.hasBeneficiaries,
      asset.primaryBeneficiaries,
      married,
      client,
      spouse
    );

    const assetId = `retirementAccount-${index}`;
    const description = `${asset.accountType} at ${asset.institution}`;
    const issues = identifyFinancialAssetIssues(
      asset,
      'retirementAccount',
      assetId,
      description,
      minorBeneficiaries
    );
    allIssues.push(...issues);

    // Retirement accounts rarely go through probate if properly designated
    const requiresProbateFirst = !asset.hasBeneficiaries;
    const requiresProbateSecond = !asset.hasBeneficiaries;

    if (requiresProbateFirst) probateEstateFirstDeath += value;
    if (requiresProbateSecond) probateEstateSecondDeath += value;

    assetAnalyses.push({
      assetType: 'retirementAccount',
      assetIndex: index,
      assetId,
      description,
      value,
      currentOwner: asset.owner,
      currentOwnershipForm: 'Beneficiary Designation',
      currentBeneficiaries: asset.primaryBeneficiaries || [],
      passageMethodFirstDeath: passage.firstDeath,
      passageMethodSecondDeath: passage.secondDeath,
      requiresProbateFirstDeath: requiresProbateFirst,
      requiresProbateSecondDeath: requiresProbateSecond,
      protectsMinorBeneficiaries: false,
      alignsWithDistributionPlan: true,
      issues,
      recommendation: generateRetirementRecommendation(asset, formData),
    });
  });

  // Analyze Life Insurance
  formData.lifeInsurance.forEach((asset, index) => {
    const value = parseValue(asset.deathBenefit || asset.faceAmount);
    // Include life insurance death benefit in total estate value
    totalEstateValue += value;

    const passage = analyzeFinancialAssetPassage(
      asset.owner,
      asset.hasBeneficiaries,
      asset.primaryBeneficiaries,
      married,
      client,
      spouse
    );

    const assetId = `lifeInsurance-${index}`;
    const description = `${asset.policyType} - ${asset.company}`;
    const issues = identifyFinancialAssetIssues(
      asset,
      'lifeInsurance',
      assetId,
      description,
      minorBeneficiaries
    );
    allIssues.push(...issues);

    assetAnalyses.push({
      assetType: 'lifeInsurance',
      assetIndex: index,
      assetId,
      description,
      value,
      currentOwner: asset.owner,
      currentOwnershipForm: 'Beneficiary Designation',
      currentBeneficiaries: asset.primaryBeneficiaries || [],
      passageMethodFirstDeath: passage.firstDeath,
      passageMethodSecondDeath: passage.secondDeath,
      requiresProbateFirstDeath: !asset.hasBeneficiaries,
      requiresProbateSecondDeath: !asset.hasBeneficiaries,
      protectsMinorBeneficiaries: false,
      alignsWithDistributionPlan: true,
      issues,
      recommendation: generateLifeInsuranceRecommendation(asset, formData),
    });
  });

  // Analyze Other Assets (tangible personal property)
  formData.otherAssets.forEach((asset, index) => {
    const value = parseValue(asset.value);
    totalEstateValue += value;

    const assetId = `otherAsset-${index}`;
    const issues: PlanningIssue[] = [];

    // Tangible personal property typically requires probate unless assigned to trust
    if (value > 10000) {
      issues.push({
        severity: 'low',
        title: 'Personal Property Requires Probate',
        description: `${asset.description} (${formatCurrency(value)}) will require probate unless assigned to trust.`,
        affectedAssets: [assetId],
      });
      probateEstateFirstDeath += value;
      probateEstateSecondDeath += value;
    }
    allIssues.push(...issues);

    assetAnalyses.push({
      assetType: 'otherAsset',
      assetIndex: index,
      assetId,
      description: asset.description,
      value,
      currentOwner: asset.owner,
      currentOwnershipForm: 'Sole',
      currentBeneficiaries: [],
      passageMethodFirstDeath: 'probate',
      passageMethodSecondDeath: 'probate',
      requiresProbateFirstDeath: true,
      requiresProbateSecondDeath: true,
      protectsMinorBeneficiaries: false,
      alignsWithDistributionPlan: true,
      issues,
      recommendation: generateOtherAssetRecommendation(asset, formData),
    });
  });

  // Analyze Non-Qualified Investments
  formData.nonQualifiedInvestments.forEach((asset, index) => {
    const value = parseValue(asset.value);
    totalEstateValue += value;

    const passage = analyzeFinancialAssetPassage(
      asset.owner,
      asset.hasBeneficiaries,
      asset.primaryBeneficiaries,
      married,
      client,
      spouse
    );

    const assetId = `nonQualifiedInvestment-${index}`;
    const description = `${asset.description} at ${asset.institution}`;
    const issues = identifyFinancialAssetIssues(
      asset,
      'nonQualifiedInvestment',
      assetId,
      description,
      minorBeneficiaries
    );
    allIssues.push(...issues);

    const requiresProbateFirst = passage.firstDeath === 'probate';
    const requiresProbateSecond = passage.secondDeath === 'probate';

    if (requiresProbateFirst) probateEstateFirstDeath += value;
    if (requiresProbateSecond) probateEstateSecondDeath += value;

    assetAnalyses.push({
      assetType: 'nonQualifiedInvestment',
      assetIndex: index,
      assetId,
      description,
      value,
      currentOwner: asset.owner,
      currentOwnershipForm: asset.owner.includes('Joint') ? 'JTWROS' : 'Sole',
      currentBeneficiaries: asset.primaryBeneficiaries || [],
      passageMethodFirstDeath: passage.firstDeath,
      passageMethodSecondDeath: passage.secondDeath,
      requiresProbateFirstDeath: requiresProbateFirst,
      requiresProbateSecondDeath: requiresProbateSecond,
      protectsMinorBeneficiaries: false,
      alignsWithDistributionPlan: true,
      issues,
      recommendation: generateBankAccountRecommendation(
        { ...asset, amount: asset.value, accountType: 'Investment' } as any,
        formData
      ),
    });
  });

  // Analyze Digital Assets
  formData.digitalAssets.forEach((asset, index) => {
    const value = parseValue(asset.value);
    totalEstateValue += value;

    const assetId = `digitalAsset-${index}`;
    const description = `${asset.assetType}${asset.platform ? ` - ${asset.platform}` : ''}${asset.description ? `: ${asset.description}` : ''}`;
    const issues: PlanningIssue[] = [];

    // Digital assets typically require probate unless properly planned for
    if (value > 0) {
      issues.push({
        severity: 'low',
        title: 'Digital Asset Requires Planning',
        description: `${description} (${formatCurrency(value)}) needs proper estate planning documentation for access and transfer.`,
        affectedAssets: [assetId],
      });
      probateEstateFirstDeath += value;
      probateEstateSecondDeath += value;
    }
    allIssues.push(...issues);

    assetAnalyses.push({
      assetType: 'digitalAsset',
      assetIndex: index,
      assetId,
      description,
      value,
      currentOwner: asset.owner,
      currentOwnershipForm: 'Sole',
      currentBeneficiaries: [],
      passageMethodFirstDeath: 'probate',
      passageMethodSecondDeath: 'probate',
      requiresProbateFirstDeath: true,
      requiresProbateSecondDeath: true,
      protectsMinorBeneficiaries: false,
      alignsWithDistributionPlan: true,
      issues,
      recommendation: {
        action: 'retitle_to_trust',
        recommendedTitle: 'Include in Trust with Digital Asset Instructions',
        explanation: 'Digital assets require special planning. The trust should include provisions for digital asset access, and a separate digital asset inventory should be maintained with login credentials stored securely.',
        benefits: [
          'Provides legal authority to access accounts',
          'Ensures digital assets are not lost',
          'Coordinates with overall estate plan',
        ],
        considerations: [
          'Maintain a secure digital asset inventory',
          'Review platform terms of service for transferability',
          'Consider naming a digital executor',
        ],
        priority: 'medium',
      },
    });
  });

  // Analyze Beneficiaries
  const beneficiaryAnalyses: BeneficiaryAnalysis[] = formData.children.map((child, index) => {
    const age = calculateAge(child.birthDate);
    const childIsMinor = isMinor(age);
    const childId = `child-${index}`;

    // Find assets where this child is a direct beneficiary
    const directAssets = assetAnalyses.filter(a =>
      a.currentBeneficiaries.some(b => b.includes(child.name))
    );

    const issues: PlanningIssue[] = [];
    if (childIsMinor && directAssets.length > 0) {
      issues.push({
        severity: 'high',
        title: 'Minor Receives Assets Directly',
        description: `${child.name} (age ${age}) will receive assets directly without trust protection.`,
        affectedBeneficiaries: [child.name],
        affectedAssets: directAssets.map(a => a.assetId),
      });
    }

    return {
      beneficiaryId: childId,
      name: child.name,
      relationship: child.relationship || 'Child',
      age,
      isMinor: childIsMinor,
      currentInheritanceMethod: directAssets.length > 0 ? 'outright' : 'mixed',
      assetsReceivingDirectly: directAssets.map(a => a.assetId),
      totalDirectInheritance: directAssets.reduce((sum, a) => sum + a.value, 0),
      issues,
      recommendTrustProtection: childIsMinor || (age !== null && age < 25),
      recommendedDistributionAge: childIsMinor ? 25 : undefined,
      trustBenefits: childIsMinor
        ? ['Professional management', 'Age-based distribution', 'Creditor protection']
        : undefined,
    };
  });

  // Add beneficiary issues to all issues
  beneficiaryAnalyses.forEach(b => allIssues.push(...b.issues));

  // Sort issues by severity
  const severityOrder = { high: 0, medium: 1, low: 2, info: 3 };
  allIssues.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

  // Calculate stats
  const stats = {
    assetsRequiringProbate: assetAnalyses.filter(a => a.requiresProbateSecondDeath).length,
    minorBeneficiariesUnprotected: beneficiaryAnalyses.filter(
      b => b.isMinor && b.assetsReceivingDirectly.length > 0
    ).length,
    beneficiaryDesignationConflicts: 0, // Would need more complex analysis
    assetsWithNoSuccessor: assetAnalyses.filter(
      a => a.passageMethodFirstDeath === 'joint_survivorship' &&
           a.passageMethodSecondDeath === 'probate'
    ).length,
  };

  return {
    totalEstateValue,
    probateEstateFirstDeath,
    probateEstateSecondDeath,
    assetAnalyses,
    beneficiaryAnalyses,
    allIssues,
    stats,
  };
}

/**
 * Generate initial TrustCenteredPlan from analysis
 */
export function generateTrustPlan(
  formData: FormData,
  analysis: CurrentPlanAnalysis
): TrustCenteredPlan {
  const { client, spouse } = getClientNames(formData);
  const married = isMarried(formData);

  // Generate trust name
  const trustName = married
    ? `${client} and ${spouse} Family Trust`
    : `${client} Living Trust`;

  // Get trustees from formData
  const initialTrustees = married ? [client, spouse] : [client];
  const successorTrustees: string[] = [];

  // Add successor trustees from fiduciaries
  if (formData.trusteeFirst) successorTrustees.push(formData.trusteeFirst);
  if (formData.trusteeAlternate) successorTrustees.push(formData.trusteeAlternate);

  // Generate retitling recommendations
  const assetsToRetitle: AssetRetitling[] = analysis.assetAnalyses
    .filter(a => a.recommendation.action === 'retitle_to_trust')
    .map(a => ({
      assetId: a.assetId,
      assetDescription: a.description,
      assetValue: a.value,
      currentTitle: `${a.currentOwner} - ${a.currentOwnershipForm}`,
      proposedTitle: a.recommendation.recommendedTitle || trustName,
      method: a.assetType === 'realEstate' ? 'deed' : 'account_retitle',
      accepted: true, // Default to accepted
    }));

  // Generate beneficiary change recommendations
  const beneficiaryChanges: BeneficiaryChange[] = analysis.assetAnalyses
    .filter(a => a.recommendation.action === 'change_beneficiary')
    .map(a => ({
      assetId: a.assetId,
      assetDescription: a.description,
      assetValue: a.value,
      currentBeneficiary: a.currentBeneficiaries.join(', ') || 'None',
      proposedBeneficiary: a.recommendation.recommendedBeneficiary || 'Trust',
      reason: a.recommendation.explanation,
      accepted: true,
    }));

  // Build distribution plan from existing formData
  const distributionAge = parseInt(formData.distributionAge) || 25;

  // Get residuary beneficiaries
  const residuaryBeneficiaries = formData.clientDistributionPlan.residuaryBeneficiaries.map(b => ({
    name: b.name,
    relationship: b.relationship,
    percentage: b.percentage,
  }));

  // Calculate projected benefits
  const projectedBenefits = calculateProjectedBenefits(analysis, {
    assetsToRetitle,
    beneficiaryChanges,
    distributionAge,
  });

  return {
    trustName,
    trustType: married ? 'joint_revocable' : 'individual_revocable',
    grantors: married ? [client, spouse] : [client],
    initialTrustees,
    successorTrustees,
    assetsToRetitle,
    beneficiaryChanges,
    distributionPlan: {
      distributionAge,
      perStirpes: true,
      residuaryBeneficiaries,
      specialProvisions: [],
    },
    projectedBenefits,
  };
}

/**
 * Calculate projected benefits based on accepted recommendations
 */
export function calculateProjectedBenefits(
  analysis: CurrentPlanAnalysis,
  plan: {
    assetsToRetitle: AssetRetitling[];
    beneficiaryChanges: BeneficiaryChange[];
    distributionAge: number;
  }
): ProjectedBenefits {
  // Calculate how much will be removed from probate by accepted retitlings
  const acceptedRetitlings = plan.assetsToRetitle.filter(a => a.accepted);
  const probateReduction = acceptedRetitlings.reduce((sum, a) => sum + a.assetValue, 0);

  // Count protected minors
  const minorsProtected = analysis.beneficiaryAnalyses.filter(
    b => b.isMinor && b.recommendTrustProtection
  ).length;

  return {
    probateAvoidance: {
      currentProbateEstate: analysis.probateEstateSecondDeath,
      projectedProbateEstate: Math.max(0, analysis.probateEstateSecondDeath - probateReduction),
      savings: probateReduction,
    },
    minorProtection: {
      minorsCurrentlyUnprotected: analysis.stats.minorBeneficiariesUnprotected,
      minorsProtectedByTrust: minorsProtected,
      protectedUntilAge: plan.distributionAge,
    },
    incapacityPlanning: {
      currentProtection: 'poa_only',
      proposedProtection: 'trust',
      benefit: 'Successor trustee can manage all trust assets without court involvement',
    },
    privacy: {
      assetsInProbate: analysis.stats.assetsRequiringProbate,
      assetsPrivate: analysis.assetAnalyses.length - analysis.stats.assetsRequiringProbate + acceptedRetitlings.length,
    },
    coordination: {
      conflictsResolved: analysis.stats.beneficiaryDesignationConflicts,
      consistentDistribution: true,
    },
  };
}

/**
 * Generate complete TrustPlanData from FormData
 */
export function generateTrustPlanData(formData: FormData): TrustPlanData {
  const analysis = analyzeCurrentPlan(formData);
  const plan = generateTrustPlan(formData, analysis);

  return {
    currentPlanAnalysis: analysis,
    trustCenteredPlan: plan,
    lastAnalyzedAt: new Date().toISOString(),
  };
}
