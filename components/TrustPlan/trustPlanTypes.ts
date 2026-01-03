/**
 * TrustPlan Types
 *
 * These types define the data structures for trust-centered estate planning analysis.
 * They are DERIVED from the existing FormData - we read from FormData (source of truth)
 * and generate analysis/recommendations into these structures.
 */

import {
  FormData,
  OwnershipForm,
  RealEstateOwner,
  DistributionPlan
} from '../../lib/FormContext';

// ============================================================================
// ASSET ANALYSIS TYPES
// ============================================================================

/**
 * How an asset passes at death
 */
export type AssetPassageMethod =
  | 'probate'                    // Goes through probate court
  | 'joint_survivorship'         // JTWROS, TBE - passes to survivor
  | 'beneficiary_designation'    // POD/TOD, retirement accounts, life insurance
  | 'trust'                      // Already in a trust
  | 'deed_remainder'             // Lady Bird Deed, Life Estate - passes to remainderman
  | 'operation_of_law';          // Other automatic transfers

/**
 * Severity of an issue identified in the current plan
 */
export type IssueSeverity = 'high' | 'medium' | 'low' | 'info';

/**
 * Type of asset being analyzed
 */
export type AssetType =
  | 'realEstate'
  | 'bankAccount'
  | 'nonQualifiedInvestment'
  | 'retirementAccount'
  | 'lifeInsurance'
  | 'vehicle'
  | 'otherAsset'
  | 'businessInterest'
  | 'digitalAsset';

/**
 * Analysis of a single asset's current state and trust recommendation
 */
export interface AssetAnalysis {
  // Asset identification (references FormData)
  assetType: AssetType;
  assetIndex: number;                    // Index in the FormData array
  assetId: string;                       // e.g., "realEstate-0", "bankAccount-2"

  // Current state (read from FormData)
  description: string;                   // Human-readable description
  value: number;                         // Numeric value
  currentOwner: string;                  // Who owns it now
  currentOwnershipForm: OwnershipForm | string;  // How it's titled
  currentBeneficiaries: string[];        // Named beneficiaries (if any)

  // Analysis results
  passageMethodFirstDeath: AssetPassageMethod;
  passageMethodSecondDeath: AssetPassageMethod;
  requiresProbateFirstDeath: boolean;
  requiresProbateSecondDeath: boolean;
  protectsMinorBeneficiaries: boolean;
  alignsWithDistributionPlan: boolean;

  // Identified issues
  issues: PlanningIssue[];

  // Trust-centered recommendation
  recommendation: AssetRecommendation;
}

/**
 * A specific issue identified in the current plan
 */
export interface PlanningIssue {
  severity: IssueSeverity;
  title: string;
  description: string;
  affectedBeneficiaries?: string[];      // Names of beneficiaries affected
  affectedAssets?: string[];             // Asset IDs affected
}

/**
 * Recommendation for how to handle an asset in a trust-centered plan
 */
export interface AssetRecommendation {
  action: 'retitle_to_trust' | 'change_beneficiary' | 'keep_current' | 'special_consideration';
  recommendedTitle?: string;              // New title if retitling
  recommendedBeneficiary?: string;        // New beneficiary if changing
  explanation: string;                    // Why this recommendation
  benefits: string[];                     // List of benefits from this change
  considerations?: string[];              // Special considerations (e.g., tax implications)
  priority: 'high' | 'medium' | 'low';    // How important is this change
}

// ============================================================================
// BENEFICIARY ANALYSIS TYPES
// ============================================================================

/**
 * Analysis of a beneficiary's situation
 */
export interface BeneficiaryAnalysis {
  beneficiaryId: string;                 // e.g., "child-0", "beneficiary-1"
  name: string;
  relationship: string;
  age: number | null;
  isMinor: boolean;

  // Current plan analysis
  currentInheritanceMethod: 'outright' | 'trust' | 'mixed';
  assetsReceivingDirectly: string[];     // Asset IDs they receive outright
  totalDirectInheritance: number;        // Value of direct inheritance

  // Issues
  issues: PlanningIssue[];

  // Recommendations
  recommendTrustProtection: boolean;
  recommendedDistributionAge?: number;
  trustBenefits?: string[];
}

// ============================================================================
// CURRENT PLAN ANALYSIS (LEFT PANEL)
// ============================================================================

/**
 * Complete analysis of the client's current estate plan
 * This is derived from FormData and displayed in the "Current Plan" panel
 */
export interface CurrentPlanAnalysis {
  // Summary statistics
  totalEstateValue: number;
  probateEstateFirstDeath: number;       // Value subject to probate if client dies first
  probateEstateSecondDeath: number;      // Value subject to probate after both deaths

  // Asset-by-asset analysis
  assetAnalyses: AssetAnalysis[];

  // Beneficiary analysis
  beneficiaryAnalyses: BeneficiaryAnalysis[];

  // Aggregated issues (sorted by severity)
  allIssues: PlanningIssue[];

  // Quick stats for display
  stats: {
    assetsRequiringProbate: number;
    minorBeneficiariesUnprotected: number;
    beneficiaryDesignationConflicts: number;
    assetsWithNoSuccessor: number;        // Joint accounts with no POD after survivor
  };
}

// ============================================================================
// TRUST-CENTERED PLAN (RIGHT PANEL - EDITABLE)
// ============================================================================

/**
 * Proposed retitling action for an asset
 */
export interface AssetRetitling {
  assetId: string;
  assetDescription: string;
  assetValue: number;
  currentTitle: string;
  proposedTitle: string;
  method: 'deed' | 'assignment' | 'beneficiary_change' | 'account_retitle';
  accepted: boolean;                     // User can accept/reject
  notes?: string;
}

/**
 * Proposed beneficiary designation change
 */
export interface BeneficiaryChange {
  assetId: string;
  assetDescription: string;
  assetValue: number;
  currentBeneficiary: string;
  proposedBeneficiary: string;
  reason: string;
  accepted: boolean;
  notes?: string;
}

/**
 * The proposed trust-centered estate plan
 * This is the editable working copy that the user can modify
 */
export interface TrustCenteredPlan {
  // Trust details (editable)
  trustName: string;
  trustType: 'joint_revocable' | 'individual_revocable' | 'a_b_trust';
  grantors: string[];
  initialTrustees: string[];
  successorTrustees: string[];

  // Proposed changes (user can accept/reject each)
  assetsToRetitle: AssetRetitling[];
  beneficiaryChanges: BeneficiaryChange[];

  // Distribution provisions (copied from existing distribution plan, can be modified)
  distributionPlan: {
    distributionAge: number;
    perStirpes: boolean;
    residuaryBeneficiaries: Array<{
      name: string;
      relationship: string;
      percentage: number;
    }>;
    specialProvisions: string[];
  };

  // Calculated benefits (recalculated as user makes changes)
  projectedBenefits: ProjectedBenefits;
}

/**
 * Calculated benefits of the trust-centered plan
 */
export interface ProjectedBenefits {
  probateAvoidance: {
    currentProbateEstate: number;
    projectedProbateEstate: number;
    savings: number;
  };

  minorProtection: {
    minorsCurrentlyUnprotected: number;
    minorsProtectedByTrust: number;
    protectedUntilAge: number;
  };

  incapacityPlanning: {
    currentProtection: 'none' | 'poa_only' | 'trust';
    proposedProtection: 'trust';
    benefit: string;
  };

  privacy: {
    assetsInProbate: number;
    assetsPrivate: number;
  };

  coordination: {
    conflictsResolved: number;
    consistentDistribution: boolean;
  };
}

// ============================================================================
// COMPLETE TRUST PLAN DATA (STORED IN FORM CONTEXT)
// ============================================================================

/**
 * Complete TrustPlan data structure
 * This can be stored as formData.trustPlan if we want persistence
 */
export interface TrustPlanData {
  // Analysis (regenerated from FormData)
  currentPlanAnalysis: CurrentPlanAnalysis;

  // User's working plan (editable)
  trustCenteredPlan: TrustCenteredPlan;

  // Metadata
  lastAnalyzedAt: string;                // ISO timestamp
  formDataHash?: string;                 // Hash of FormData used for analysis (detect changes)
}

// ============================================================================
// HELPER TYPES FOR UI
// ============================================================================

/**
 * Tab/view options for the TrustPlan section
 */
export type TrustPlanView = 'comparison' | 'checklist' | 'benefits' | 'report';

/**
 * Filter options for asset recommendations
 */
export interface RecommendationFilters {
  showAccepted: boolean;
  showRejected: boolean;
  priorityFilter: 'all' | 'high' | 'medium' | 'low';
  assetTypeFilter: AssetType | 'all';
}

// ============================================================================
// MAPPING FUNCTIONS (TYPE SIGNATURES)
// ============================================================================

/**
 * Generate CurrentPlanAnalysis from FormData
 */
export type AnalyzeCurrentPlan = (formData: FormData) => CurrentPlanAnalysis;

/**
 * Generate initial TrustCenteredPlan recommendations from analysis
 */
export type GenerateTrustPlan = (
  formData: FormData,
  analysis: CurrentPlanAnalysis
) => TrustCenteredPlan;

/**
 * Recalculate benefits when user modifies the plan
 */
export type RecalculateBenefits = (
  analysis: CurrentPlanAnalysis,
  plan: TrustCenteredPlan
) => ProjectedBenefits;
