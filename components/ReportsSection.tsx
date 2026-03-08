'use client';

import React, { useState } from 'react';
import {
  Box,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Paper,
  Typography,
} from '@mui/material';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import ContactPhoneIcon from '@mui/icons-material/ContactPhone';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import SecurityIcon from '@mui/icons-material/Security';
import PeopleIcon from '@mui/icons-material/People';
import GavelIcon from '@mui/icons-material/Gavel';
import VolunteerActivismIcon from '@mui/icons-material/VolunteerActivism';
import AssignmentIcon from '@mui/icons-material/Assignment';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import { useFormContext } from '../lib/FormContext';
import { folioColors } from './FolioModal';
import EmergencyMedicalSummary from '../src/features/family-access/reports/EmergencyMedicalSummary';
import FamilyContactSheet from '../src/features/family-access/reports/Familycontactsheet';
import AssetInventory from '../src/features/family-access/reports/Assetinventory';
import InsuranceSummary from '../src/features/family-access/reports/Insurancesummary';
import AdvisorDirectory from '../src/features/family-access/reports/Advisordirectory';
import EstatePlanningOverview from '../src/features/family-access/reports/EstatePlanningOverview';
import FuneralInstructions from '../src/features/family-access/reports/FuneralInstructions';
import WhatToDoIfIDie from '../src/features/family-access/reports/WhatToDoIfIDie';
import FamilyBriefingReport from '../src/features/family-access/reports/Familybriefingreport';

// ─── Report definitions ──────────────────────────────────────────────────────

interface ReportDef {
  id: string;
  label: string;
  icon: React.ReactNode;
}

const REPORTS: ReportDef[] = [
  { id: 'emergency-medical', label: 'Emergency Medical Summary', icon: <LocalHospitalIcon /> },
  { id: 'family-contact', label: 'Family Contact Sheet', icon: <ContactPhoneIcon /> },
  { id: 'asset-inventory', label: 'Asset Inventory', icon: <AccountBalanceIcon /> },
  { id: 'insurance-summary', label: 'Insurance Summary', icon: <SecurityIcon /> },
  { id: 'advisor-directory', label: 'Advisor Directory', icon: <PeopleIcon /> },
  { id: 'estate-planning', label: 'Estate Planning Overview', icon: <GavelIcon /> },
  { id: 'funeral-instructions', label: 'Funeral Instructions', icon: <VolunteerActivismIcon /> },
  { id: 'what-to-do', label: 'What To Do If I Die', icon: <AssignmentIcon /> },
  { id: 'family-briefing', label: 'Family Briefing Report', icon: <MenuBookIcon /> },
];

// ─── Shared intake builder ───────────────────────────────────────────────────

const useReportData = () => {
  const { formData } = useFormContext();

  const clientAddress = [
    formData.mailingAddress,
    formData.mailingCity,
    formData.mailingState,
    formData.mailingZip,
  ]
    .filter(Boolean)
    .join(', ') || undefined;

  const spouseAddress = [
    formData.spouseMailingAddress,
    formData.spouseMailingCity,
    formData.spouseMailingState,
    formData.spouseMailingZip,
  ]
    .filter(Boolean)
    .join(', ') || undefined;

  // ── Emergency Medical Summary data ──
  const emergencyIntake = {
    client_name: formData.name || 'Client',
    client_birth_date: formData.birthDate ? formData.birthDate.toISOString() : undefined,
    client_cell_phone: formData.cellPhone || undefined,
    client_home_phone: formData.homePhone || undefined,
    client_mailing_address: clientAddress,
    spouse_name: formData.spouseName || undefined,
    spouse_cell_phone: formData.spouseCellPhone || undefined,
    marital_status: formData.maritalStatus || undefined,
  };

  const vitals = {
    blood_type: formData.basicVitals.bloodType || undefined,
    height: formData.basicVitals.height || undefined,
    weight: formData.basicVitals.weight || undefined,
    as_of_date: formData.basicVitals.asOfDate || undefined,
  };

  const allergies = formData.allergies.map((a, i) => ({
    id: String(i),
    allergen: a.allergen,
    allergy_type: a.allergyType || undefined,
    reaction: a.reaction || undefined,
    severity: a.severity || undefined,
  }));

  const medications = formData.medications.map((m, i) => ({
    id: String(i),
    medication_name: m.medicationName,
    dosage: m.dosage || undefined,
    form: m.form || undefined,
    frequency: m.frequency || undefined,
    frequency_notes: m.frequencyNotes || undefined,
    prescribing_physician: m.prescribingPhysician || undefined,
    condition_treated: m.conditionTreated || undefined,
    rx_number: m.rxNumber || undefined,
    controlled_substance: m.controlledSubstance || false,
    requires_refrigeration: m.requiresRefrigeration || false,
    is_active: m.isActive,
  }));

  const conditions = formData.medicalConditions.map((c, i) => ({
    id: String(i),
    condition_name: c.conditionName,
    diagnosed_date: c.diagnosedDate || undefined,
    treating_physician: c.treatingPhysician || undefined,
    status: c.status || undefined,
    notes: c.notes || undefined,
  }));

  const providers = formData.medicalProviders.map((p, i) => ({
    id: String(i),
    provider_category: p.providerCategory,
    specialist_type: p.specialistType || undefined,
    name: p.name || undefined,
    firm_name: p.firmName || undefined,
    phone: p.phone || undefined,
    email: p.email || undefined,
    address: p.address || undefined,
    notes: p.notes || undefined,
  }));

  const equipment = formData.medicalEquipment.map((e, i) => ({
    id: String(i),
    equipment_name: e.equipmentName,
    equipment_type: e.equipmentType || undefined,
    make_model: e.makeModel || undefined,
    supplier_name: e.supplierName || undefined,
    supplier_phone: e.supplierPhone || undefined,
    battery_type: e.batteryType || undefined,
    is_active: e.isActive,
    notes: e.notes || undefined,
  }));

  const pharmacies = formData.pharmacies.map((p, i) => ({
    id: String(i),
    pharmacy_name: p.pharmacyName,
    pharmacy_chain: p.pharmacyChain || undefined,
    phone: p.phone || undefined,
    address: p.address || undefined,
    city: p.city || undefined,
    state: p.state || undefined,
    zip: p.zip || undefined,
    hours: p.hours || undefined,
    is_primary: p.isPrimary || false,
  }));

  const surgeries = formData.surgeries.map((s, i) => ({
    id: String(i),
    procedure_name: s.procedureName,
    procedure_type: s.procedureType || undefined,
    procedure_date: s.procedureDate || undefined,
    facility: s.facility || undefined,
    surgeon_physician: s.surgeonPhysician || undefined,
    notes: s.notes || undefined,
  }));

  // ── Family Contact Sheet data ──
  const familyIntake = {
    client_name: formData.name || 'Client',
    client_aka: formData.aka || undefined,
    client_birth_date: formData.birthDate ? formData.birthDate.toISOString() : undefined,
    client_cell_phone: formData.cellPhone || undefined,
    client_home_phone: formData.homePhone || undefined,
    client_work_phone: formData.workPhone || undefined,
    client_email: formData.email || undefined,
    client_mailing_address: clientAddress,
    client_state_of_domicile: formData.stateOfDomicile || undefined,
    marital_status: formData.maritalStatus || undefined,
    spouse_name: formData.spouseName || undefined,
    spouse_aka: formData.spouseAka || undefined,
    spouse_birth_date: formData.spouseBirthDate ? formData.spouseBirthDate.toISOString() : undefined,
    spouse_cell_phone: formData.spouseCellPhone || undefined,
    spouse_home_phone: formData.spouseHomePhone || undefined,
    spouse_work_phone: formData.spouseWorkPhone || undefined,
    spouse_email: formData.spouseEmail || undefined,
    spouse_mailing_address: spouseAddress,
  };

  const children = formData.children.map((c, i) => ({
    id: String(i),
    name: c.name,
    address: c.address || undefined,
    birth_date: c.birthDate || undefined,
    age: c.age || undefined,
    relationship: c.relationship || undefined,
    marital_status: c.maritalStatus || undefined,
    has_children: c.hasChildren,
    number_of_children: c.numberOfChildren,
    comments: c.comments || undefined,
  }));

  const dependents = formData.dependents.map((d, i) => ({
    id: String(i),
    name: d.name,
    relationship: d.relationship || undefined,
  }));

  const beneficiaries = formData.clientDistributionPlan.residuaryBeneficiaries.map((b) => ({
    id: b.id,
    name: b.name,
    relationship: b.relationship || undefined,
  }));

  const friendsNeighbors = formData.friendsNeighbors.map((f, i) => ({
    id: String(i),
    name: f.name,
    relationship: f.relationship || undefined,
    address: f.address || undefined,
    phone: f.phone || undefined,
    email: f.email || undefined,
    notes: f.notes || undefined,
  }));

  const advisors = formData.advisors.map((a, i) => ({
    id: String(i),
    advisor_type: a.advisorType || undefined,
    name: a.name || undefined,
    firm_name: a.firmName || undefined,
    phone: a.phone || undefined,
    email: a.email || undefined,
    address: a.address || undefined,
    notes: a.notes || undefined,
  }));

  // ── Asset Inventory data ──
  const assetIntake = {
    client_name: formData.name || 'Client',
    spouse_name: formData.spouseName || undefined,
    marital_status: formData.maritalStatus || undefined,
  };

  const parseNum = (v: string): number | undefined => {
    const n = parseFloat(v.replace(/[^0-9.-]/g, ''));
    return isNaN(n) ? undefined : n;
  };

  const bankAccounts = formData.bankAccounts.map((b, i) => ({
    id: String(i),
    owner: b.owner || undefined,
    account_type: b.accountType || undefined,
    institution: b.institution || undefined,
    amount: parseNum(b.amount),
    has_beneficiaries: b.hasBeneficiaries,
    primary_beneficiaries: b.primaryBeneficiaries,
    notes: b.notes || undefined,
  }));

  const investments = formData.nonQualifiedInvestments.map((inv, i) => ({
    id: String(i),
    owner: inv.owner || undefined,
    institution: inv.institution || undefined,
    description: inv.description || undefined,
    value: parseNum(inv.value),
    has_beneficiaries: inv.hasBeneficiaries,
    primary_beneficiaries: inv.primaryBeneficiaries,
    notes: inv.notes || undefined,
  }));

  const retirementAccounts = formData.retirementAccounts.map((r, i) => ({
    id: String(i),
    owner: r.owner || undefined,
    institution: r.institution || undefined,
    account_type: r.accountType || undefined,
    value: parseNum(r.value),
    has_beneficiaries: r.hasBeneficiaries,
    primary_beneficiaries: r.primaryBeneficiaries,
    notes: r.notes || undefined,
  }));

  const realEstate = formData.realEstate.map((re, i) => ({
    id: String(i),
    owner: re.owner || undefined,
    ownership_form: re.ownershipForm || undefined,
    category: re.category || undefined,
    street: re.street || undefined,
    city: re.city || undefined,
    state: re.state || undefined,
    zip: re.zip || undefined,
    value: parseNum(re.value),
    mortgage_balance: parseNum(re.mortgageBalance),
    cost_basis: parseNum(re.costBasis),
    notes: re.notes || undefined,
  }));

  const vehicles = formData.vehicles.map((v, i) => ({
    id: String(i),
    owner: v.owner || undefined,
    year_make_model: v.yearMakeModel || undefined,
    value: parseNum(v.value),
    has_beneficiaries: v.hasBeneficiaries,
    primary_beneficiaries: v.primaryBeneficiaries,
    notes: v.notes || undefined,
  }));

  const lifeInsurance = formData.lifeInsurance.map((li, i) => ({
    id: String(i),
    owner: li.owner || undefined,
    company: li.company || undefined,
    policy_type: li.policyType || undefined,
    face_amount: parseNum(li.faceAmount),
    death_benefit: parseNum(li.deathBenefit),
    cash_value: parseNum(li.cashValue),
    insured: li.insured || undefined,
    has_beneficiaries: li.hasBeneficiaries,
    primary_beneficiaries: li.primaryBeneficiaries,
    notes: li.notes || undefined,
  }));

  const businessInterests = formData.businessInterests.map((bi, i) => ({
    id: String(i),
    owner: bi.owner || undefined,
    business_name: bi.businessName || undefined,
    entity_type: bi.entityType || undefined,
    ownership_percentage: bi.ownershipPercentage || undefined,
    full_value: parseNum(bi.fullValue),
    co_owners: bi.coOwners || undefined,
    has_buy_sell_agreement: bi.hasBuySellAgreement,
    notes: bi.notes || undefined,
  }));

  const digitalAssets = formData.digitalAssets.map((da, i) => ({
    id: String(i),
    owner: da.owner || undefined,
    asset_type: da.assetType || undefined,
    platform: da.platform || undefined,
    description: da.description || undefined,
    value: parseNum(da.value),
    notes: da.notes || undefined,
  }));

  const otherAssets = formData.otherAssets.map((oa, i) => ({
    id: String(i),
    owner: oa.owner || undefined,
    description: oa.description || undefined,
    value: parseNum(oa.value),
    has_beneficiaries: oa.hasBeneficiaries,
    primary_beneficiaries: oa.primaryBeneficiaries,
    notes: oa.notes || undefined,
  }));

  // ── Insurance Summary data ──
  const insuranceCoverage = formData.insurancePolicies.map((p, i) => ({
    id: String(i),
    person: p.person || undefined,
    coverage_type: p.coverageType || undefined,
    policy_no: p.policyNo || undefined,
    provider: p.provider || undefined,
    monthly_cost: parseNum(p.annualCost),
    contact_name: p.contactName || undefined,
    contact_address: p.contactAddress || undefined,
    contact_phone: p.contactPhone || undefined,
    contact_email: p.contactEmail || undefined,
    liability_limits: p.liabilityLimits || undefined,
    has_collision: p.hasCollision,
    has_comprehensive: p.hasComprehensive,
    comprehensive_deductible: p.comprehensiveDeductible ? parseNum(p.comprehensiveDeductible) : undefined,
    notes: p.notes || undefined,
  }));

  const medicalInsurance = formData.medicalInsurancePolicies.map((p, i) => ({
    id: String(i),
    person: p.person || undefined,
    insurance_type: p.insuranceType || undefined,
    provider: p.provider || undefined,
    policy_no: p.policyNo || undefined,
    paid_by: p.paidBy || undefined,
    monthly_cost: parseNum(p.monthlyCost),
    contact_name: p.contactName || undefined,
    contact_address: p.contactAddress || undefined,
    contact_phone: p.contactPhone || undefined,
    contact_email: p.contactEmail || undefined,
    notes: p.notes || undefined,
  }));

  const clientMedicalInsurance = {
    medicare_part_b_deduction: formData.clientMedicalInsurance.medicarePartBDeduction || undefined,
    medicare_coverage_type: formData.clientMedicalInsurance.medicareCoverageType || undefined,
    medicare_plan_name: formData.clientMedicalInsurance.medicarePlanName || undefined,
    medicare_coverage_cost: formData.clientMedicalInsurance.medicareCoverageCost || undefined,
    private_insurance_description: formData.clientMedicalInsurance.privateInsuranceDescription || undefined,
    private_insurance_cost: formData.clientMedicalInsurance.privateInsuranceCost || undefined,
    other_insurance_description: formData.clientMedicalInsurance.otherInsuranceDescription || undefined,
    other_insurance_cost: formData.clientMedicalInsurance.otherInsuranceCost || undefined,
  };

  const spouseMedicalInsurance = {
    medicare_part_b_deduction: formData.spouseMedicalInsurance.medicarePartBDeduction || undefined,
    medicare_coverage_type: formData.spouseMedicalInsurance.medicareCoverageType || undefined,
    medicare_plan_name: formData.spouseMedicalInsurance.medicarePlanName || undefined,
    medicare_coverage_cost: formData.spouseMedicalInsurance.medicareCoverageCost || undefined,
    private_insurance_description: formData.spouseMedicalInsurance.privateInsuranceDescription || undefined,
    private_insurance_cost: formData.spouseMedicalInsurance.privateInsuranceCost || undefined,
    other_insurance_description: formData.spouseMedicalInsurance.otherInsuranceDescription || undefined,
    other_insurance_cost: formData.spouseMedicalInsurance.otherInsuranceCost || undefined,
  };

  const ltc = formData.clientLongTermCare;
  const longTermCare = {
    has_ltc_insurance: ltc.hasLtcInsurance,
    ltc_insurance_company: ltc.ltcInsuranceCompany || undefined,
    ltc_insurance_daily_benefit: ltc.ltcInsuranceDailyBenefit || undefined,
    ltc_insurance_term: ltc.ltcInsuranceTerm || undefined,
    ltc_insurance_maximum: ltc.ltcInsuranceMaximum || undefined,
    ltc_insurance_care_level: ltc.ltcInsuranceCareLevel || undefined,
    ltc_insurance_details: ltc.ltcInsuranceDetails || undefined,
    has_medigap: ltc.hasMedigap,
    medigap_details: ltc.medigapDetails || undefined,
  };

  // ── Estate Planning Overview data ──
  const estateIntake = {
    client_name: formData.name || 'Client',
    client_aka: formData.aka || undefined,
    client_birth_date: formData.birthDate ? formData.birthDate.toISOString() : undefined,
    client_mailing_address: clientAddress,
    client_state_of_domicile: formData.stateOfDomicile || undefined,
    client_email: formData.email || undefined,
    client_cell_phone: formData.cellPhone || undefined,
    marital_status: formData.maritalStatus || undefined,
    spouse_name: formData.spouseName || undefined,
    spouse_aka: formData.spouseAka || undefined,
    spouse_birth_date: formData.spouseBirthDate ? formData.spouseBirthDate.toISOString() : undefined,
    date_married: formData.dateMarried ? formData.dateMarried.toISOString() : undefined,
    place_of_marriage: formData.placeOfMarriage || undefined,
    prior_marriage: formData.priorMarriage || undefined,
    children_from_prior_marriage: formData.childrenFromPriorMarriage || undefined,
    number_of_children: formData.children.length || undefined,
    client_has_living_trust: formData.clientHasLivingTrust || undefined,
    client_living_trust_name: formData.clientLivingTrustName || undefined,
    client_living_trust_date: formData.clientLivingTrustDate ? formData.clientLivingTrustDate.toISOString() : undefined,
    client_has_irrevocable_trust: formData.clientHasIrrevocableTrust || undefined,
    client_irrevocable_trust_name: formData.clientIrrevocableTrustName || undefined,
    client_irrevocable_trust_date: formData.clientIrrevocableTrustDate ? formData.clientIrrevocableTrustDate.toISOString() : undefined,
    client_considering_trust: formData.clientConsideringTrust || undefined,
    // Beneficiary concerns
    any_beneficiaries_minors: formData.anyBeneficiariesMinors || undefined,
    beneficiary_minors_explanation: formData.beneficiaryMinorsExplanation || undefined,
    any_beneficiaries_disabled: formData.anyBeneficiariesDisabled || undefined,
    beneficiary_disabled_explanation: formData.beneficiaryDisabledExplanation || undefined,
    any_beneficiaries_marital_problems: formData.anyBeneficiariesMaritalProblems || undefined,
    beneficiary_marital_problems_explanation: formData.beneficiaryMaritalProblemsExplanation || undefined,
    any_beneficiaries_receiving_ssi: formData.anyBeneficiariesReceivingSSI || undefined,
    beneficiary_ssi_explanation: formData.beneficiarySSIExplanation || undefined,
    any_beneficiary_drug_addiction: formData.anyBeneficiaryDrugAddiction || undefined,
    beneficiary_drug_addiction_explanation: formData.beneficiaryDrugAddictionExplanation || undefined,
    any_beneficiary_alcoholism: formData.anyBeneficiaryAlcoholism || undefined,
    beneficiary_alcoholism_explanation: formData.beneficiaryAlcoholismExplanation || undefined,
    any_beneficiary_financial_problems: formData.anyBeneficiaryFinancialProblems || undefined,
    beneficiary_financial_problems_explanation: formData.beneficiaryFinancialProblemsExplanation || undefined,
    has_other_beneficiary_concerns: formData.hasOtherBeneficiaryConcerns || undefined,
    beneficiary_other_concerns: formData.beneficiaryOtherConcerns || undefined,
    beneficiary_notes: formData.beneficiaryNotes || undefined,
    // Distribution preferences
    provide_for_spouse_then_children: formData.provideForSpouseThenChildren,
    treat_all_children_equally: formData.treatAllChildrenEqually,
    children_equality_explanation: formData.childrenEqualityExplanation || undefined,
    distribution_age: formData.distributionAge || undefined,
    children_predeceased_beneficiaries: formData.childrenPredeceasedBeneficiaries,
    leave_to_grandchildren: formData.leaveToGrandchildren,
    treat_all_grandchildren_equally: formData.treatAllGrandchildrenEqually,
    grandchildren_equality_explanation: formData.grandchildrenEqualityExplanation || undefined,
    grandchildren_amount: formData.grandchildrenAmount || undefined,
    grandchildren_distribution_age: formData.grandchildrenDistributionAge || undefined,
  };

  const mapEstatePlan = (plan: typeof formData.clientCurrentEstatePlan, personType: string) => ({
    person_type: personType,
    has_will: plan.hasWill,
    has_trust: plan.hasTrust,
    is_joint_trust: plan.isJointTrust,
    has_irrevocable_trust: plan.hasIrrevocableTrust,
    is_joint_irrevocable_trust: plan.isJointIrrevocableTrust,
    has_financial_poa: plan.hasFinancialPOA,
    has_health_care_poa: plan.hasHealthCarePOA,
    has_living_will: plan.hasLivingWill,
    has_none: plan.hasNone,
    will_date_signed: plan.willDateSigned || undefined,
    will_state_signed: plan.willStateSigned || undefined,
    will_personal_rep: plan.willPersonalRep || undefined,
    will_personal_rep_alternate1: plan.willPersonalRepAlternate1 || undefined,
    will_personal_rep_alternate2: plan.willPersonalRepAlternate2 || undefined,
    will_primary_beneficiary: plan.willPrimaryBeneficiary || undefined,
    will_secondary_beneficiaries: plan.willSecondaryBeneficiaries || undefined,
    trust_name: plan.trustName || undefined,
    trust_date_signed: plan.trustDateSigned || undefined,
    trust_state_signed: plan.trustStateSigned || undefined,
    trust_trustee: plan.trustTrustee || undefined,
    trust_trustee_alternate1: plan.trustTrusteeAlternate1 || undefined,
    trust_trustee_alternate2: plan.trustTrusteeAlternate2 || undefined,
    trust_primary_beneficiary: plan.trustPrimaryBeneficiary || undefined,
    trust_secondary_beneficiaries: plan.trustSecondaryBeneficiaries || undefined,
    irrevocable_trust_name: plan.irrevocableTrustName || undefined,
    irrevocable_trust_date_signed: plan.irrevocableTrustDateSigned || undefined,
    irrevocable_trust_reason: plan.irrevocableTrustReason || undefined,
    financial_poa_date_signed: plan.financialPOADateSigned || undefined,
    financial_poa_state_signed: plan.financialPOAStateSigned || undefined,
    financial_poa_agent1: plan.financialPOAAgent1 || undefined,
    financial_poa_agent2: plan.financialPOAAgent2 || undefined,
    financial_poa_agent3: plan.financialPOAAgent3 || undefined,
    health_care_poa_date_signed: plan.healthCarePOADateSigned || undefined,
    health_care_poa_state_signed: plan.healthCarePOAStateSigned || undefined,
    health_care_poa_agent1: plan.healthCarePOAAgent1 || undefined,
    living_will_date_signed: plan.livingWillDateSigned || undefined,
    living_will_state_signed: plan.livingWillStateSigned || undefined,
    review_option: plan.reviewOption || undefined,
    document_state: plan.documentState || undefined,
    document_date: plan.documentDate || undefined,
  });

  const currentEstatePlans = [
    mapEstatePlan(formData.clientCurrentEstatePlan, 'client'),
    mapEstatePlan(formData.spouseCurrentEstatePlan, 'spouse'),
  ];

  const mapDistPlan = (plan: typeof formData.clientDistributionPlan, personType: string) => ({
    person_type: personType,
    distribution_type: plan.distributionType || undefined,
    is_sweetheart_plan: plan.isSweetheartPlan,
    has_specific_gifts: plan.hasSpecificGifts,
    residuary_share_type: plan.residuaryShareType || undefined,
    notes: plan.notes || undefined,
  });

  const distributionPlans = [
    mapDistPlan(formData.clientDistributionPlan, 'client'),
    mapDistPlan(formData.spouseDistributionPlan, 'spouse'),
  ];

  const estateBeneficiaries = (formData.otherBeneficiaries || []).map((b, i) => ({
    id: String(i),
    name: b.name,
    relationship: b.relationship || undefined,
    relationship_other: b.relationshipOther || undefined,
    age: b.age || undefined,
  }));

  const estateChildren = formData.children.map((c, i) => ({
    id: String(i),
    name: c.name,
    age: c.age || undefined,
    birth_date: c.birthDate || undefined,
    relationship: c.relationship || undefined,
    marital_status: c.maritalStatus || undefined,
    has_children: c.hasChildren,
    number_of_children: c.numberOfChildren,
    has_minor_children: c.hasMinorChildren,
    disinherit: c.disinherit,
    comments: c.comments || undefined,
  }));

  const estateSpecificGifts = (formData.specificGifts || []).map((g, i) => ({
    id: String(i),
    recipient_name: g.recipientName || undefined,
    relationship: g.relationship || undefined,
    description: g.description || undefined,
    notes: g.notes || undefined,
  }));

  const estateCashGifts = (formData.clientDistributionPlan.cashGifts || []).map((g, i) => ({
    id: String(i),
    beneficiary_name: g.recipientName || undefined,
    relationship: g.relationship || undefined,
    amount: g.amount || undefined,
  }));

  const estateCharities = (formData.charities || []).map((c, i) => ({
    id: String(i),
    name: c.name || undefined,
    address: c.address || undefined,
    amount: c.amount || undefined,
  }));

  // ── Funeral Instructions data ──
  const funeralIntake = {
    client_name: formData.name || 'Client',
    client_birth_date: formData.birthDate ? formData.birthDate.toISOString() : undefined,
    client_mailing_address: clientAddress,
    client_cell_phone: formData.cellPhone || undefined,
    client_email: formData.email || undefined,
    marital_status: formData.maritalStatus || undefined,
    spouse_name: formData.spouseName || undefined,
    spouse_birth_date: formData.spouseBirthDate ? formData.spouseBirthDate.toISOString() : undefined,
    // Client funeral
    client_served_military: formData.clientServedMilitary || undefined,
    client_military_branch: formData.clientMilitaryBranch || undefined,
    client_military_start_date: formData.clientMilitaryStartDate || undefined,
    client_military_end_date: formData.clientMilitaryEndDate || undefined,
    client_has_prepaid_funeral: formData.clientHasPrepaidFuneral || undefined,
    client_prepaid_funeral_details: formData.clientPrepaidFuneralDetails || undefined,
    client_preferred_funeral_home: formData.clientPreferredFuneralHome || undefined,
    client_burial_or_cremation: formData.clientBurialOrCremation || undefined,
    client_preferred_church: formData.clientPreferredChurch || undefined,
    // Spouse funeral
    spouse_served_military: formData.spouseServedMilitary || undefined,
    spouse_military_branch: formData.spouseMilitaryBranch || undefined,
    spouse_military_start_date: formData.spouseMilitaryStartDate || undefined,
    spouse_military_end_date: formData.spouseMilitaryEndDate || undefined,
    spouse_has_prepaid_funeral: formData.spouseHasPrepaidFuneral || undefined,
    spouse_prepaid_funeral_details: formData.spousePrepaidFuneralDetails || undefined,
    spouse_preferred_funeral_home: formData.spousePreferredFuneralHome || undefined,
    spouse_burial_or_cremation: formData.spouseBurialOrCremation || undefined,
    spouse_preferred_church: formData.spousePreferredChurch || undefined,
  };

  const funeralEndOfLife = formData.endOfLife.map((item, i) => ({
    id: String(i),
    category: item.category,
    field_data: Object.fromEntries(
      Object.entries(item).filter(([k]) => k !== 'category')
    ),
  }));

  const funeralLegacyCharityPreferences = {
    donations_in_lieu_of_flowers: formData.legacyCharityPreferences.donationsInLieuOfFlowers,
    scholarship_fund: formData.legacyCharityPreferences.scholarshipFund || undefined,
    religious_donations: formData.legacyCharityPreferences.religiousDonations || undefined,
    legacy_giving_notes: formData.legacyCharityPreferences.legacyGivingNotes || undefined,
    why_these_causes: formData.legacyCharityPreferences.whyTheseCauses || undefined,
  };

  const funeralLegacyCharityOrganizations = formData.legacyCharityOrganizations.map((o, i) => ({
    id: String(i),
    organization_name: o.organizationName || undefined,
    website: o.website || undefined,
    contact_info: o.contactInfo || undefined,
    notes: o.notes || undefined,
  }));

  // ── What To Do If I Die data ──
  const whatToDoIntake = {
    client_name: formData.name || 'Client',
    client_cell_phone: formData.cellPhone || undefined,
    client_email: formData.email || undefined,
    client_mailing_address: clientAddress,
    client_state_of_domicile: formData.stateOfDomicile || undefined,
    marital_status: formData.maritalStatus || undefined,
    spouse_name: formData.spouseName || undefined,
    spouse_cell_phone: formData.spouseCellPhone || undefined,
    client_has_prepaid_funeral: formData.clientHasPrepaidFuneral || undefined,
    client_preferred_funeral_home: formData.clientPreferredFuneralHome || undefined,
    client_burial_or_cremation: formData.clientBurialOrCremation || undefined,
    client_has_living_trust: formData.clientHasLivingTrust || undefined,
    client_living_trust_name: formData.clientLivingTrustName || undefined,
    client_has_irrevocable_trust: formData.clientHasIrrevocableTrust || undefined,
    client_irrevocable_trust_name: formData.clientIrrevocableTrustName || undefined,
    client_served_military: formData.clientServedMilitary || undefined,
    client_military_branch: formData.clientMilitaryBranch || undefined,
    number_of_children: formData.children.length || undefined,
  };

  const whatToDoSubscriptions = formData.subscriptions.map((s, i) => ({
    id: String(i),
    service_name: s.serviceName || undefined,
    category: s.category || undefined,
    login_email: s.loginEmail || undefined,
    auto_renew: s.autoRenew,
    is_active: s.isActive,
  }));

  // ── Family Briefing Report data ──
  const briefingIntake = {
    client_name: formData.name || 'Client',
    client_aka: formData.aka || undefined,
    client_birth_date: formData.birthDate ? formData.birthDate.toISOString() : undefined,
    client_sex: formData.sex || undefined,
    client_cell_phone: formData.cellPhone || undefined,
    client_home_phone: formData.homePhone || undefined,
    client_email: formData.email || undefined,
    client_mailing_address: clientAddress,
    client_state_of_domicile: formData.stateOfDomicile || undefined,
    client_served_military: formData.clientServedMilitary || undefined,
    client_military_branch: formData.clientMilitaryBranch || undefined,
    client_has_prepaid_funeral: formData.clientHasPrepaidFuneral || undefined,
    client_preferred_funeral_home: formData.clientPreferredFuneralHome || undefined,
    client_burial_or_cremation: formData.clientBurialOrCremation || undefined,
    client_has_living_trust: formData.clientHasLivingTrust || undefined,
    client_living_trust_name: formData.clientLivingTrustName || undefined,
    client_has_irrevocable_trust: formData.clientHasIrrevocableTrust || undefined,
    marital_status: formData.maritalStatus || undefined,
    spouse_name: formData.spouseName || undefined,
    spouse_aka: formData.spouseAka || undefined,
    spouse_birth_date: formData.spouseBirthDate ? formData.spouseBirthDate.toISOString() : undefined,
    spouse_cell_phone: formData.spouseCellPhone || undefined,
    spouse_email: formData.spouseEmail || undefined,
    spouse_mailing_address: spouseAddress,
    spouse_served_military: formData.spouseServedMilitary || undefined,
    spouse_military_branch: formData.spouseMilitaryBranch || undefined,
    spouse_has_prepaid_funeral: formData.spouseHasPrepaidFuneral || undefined,
    spouse_preferred_funeral_home: formData.spousePreferredFuneralHome || undefined,
    spouse_burial_or_cremation: formData.spouseBurialOrCremation || undefined,
    date_married: formData.dateMarried ? formData.dateMarried.toISOString() : undefined,
    place_of_marriage: formData.placeOfMarriage || undefined,
    prior_marriage: formData.priorMarriage || undefined,
    number_of_children: formData.children.length || undefined,
    client_has_children_from_prior: formData.clientHasChildrenFromPrior || undefined,
    spouse_has_children_from_prior: formData.spouseHasChildrenFromPrior || undefined,
    any_beneficiaries_minors: formData.anyBeneficiariesMinors || undefined,
    any_beneficiaries_disabled: formData.anyBeneficiariesDisabled || undefined,
    any_beneficiaries_receiving_ssi: formData.anyBeneficiariesReceivingSSI || undefined,
    any_beneficiary_drug_addiction: formData.anyBeneficiaryDrugAddiction || undefined,
    any_beneficiary_financial_problems: formData.anyBeneficiaryFinancialProblems || undefined,
    beneficiary_notes: formData.beneficiaryNotes || undefined,
    provide_for_spouse_then_children: formData.provideForSpouseThenChildren,
    treat_all_children_equally: formData.treatAllChildrenEqually,
    distribution_age: formData.distributionAge || undefined,
  };

  const briefingClientIncome = formData.clientIncomeSources.map((s, i) => ({
    id: String(i),
    description: s.description || undefined,
    amount: s.amount || undefined,
    frequency: s.frequency || undefined,
  }));

  const briefingSpouseIncome = formData.spouseIncomeSources.map((s, i) => ({
    id: String(i),
    description: s.description || undefined,
    amount: s.amount || undefined,
    frequency: s.frequency || undefined,
  }));

  const briefingClientMedIns = {
    person: 'client',
    medicare_coverage_type: formData.clientMedicalInsurance.medicareCoverageType || undefined,
    medicare_plan_name: formData.clientMedicalInsurance.medicarePlanName || undefined,
    private_insurance_description: formData.clientMedicalInsurance.privateInsuranceDescription || undefined,
  };

  const briefingSpouseMedIns = {
    person: 'spouse',
    medicare_coverage_type: formData.spouseMedicalInsurance.medicareCoverageType || undefined,
    medicare_plan_name: formData.spouseMedicalInsurance.medicarePlanName || undefined,
    private_insurance_description: formData.spouseMedicalInsurance.privateInsuranceDescription || undefined,
  };

  const briefingLongTermCare = [
    {
      person_type: 'client',
      has_ltc_insurance: formData.clientLongTermCare.hasLtcInsurance,
      ltc_insurance_company: formData.clientLongTermCare.ltcInsuranceCompany || undefined,
      ltc_insurance_daily_benefit: formData.clientLongTermCare.ltcInsuranceDailyBenefit || undefined,
      overall_health: formData.clientLongTermCare.overallHealth || undefined,
      current_living_situation: formData.clientLongTermCare.currentLivingSituation || undefined,
      in_ltc_facility: formData.clientLongTermCare.inLtcFacility,
      facility_name: formData.clientLongTermCare.facilityName || undefined,
    },
    {
      person_type: 'spouse',
      has_ltc_insurance: formData.spouseLongTermCare.hasLtcInsurance,
      ltc_insurance_company: formData.spouseLongTermCare.ltcInsuranceCompany || undefined,
      ltc_insurance_daily_benefit: formData.spouseLongTermCare.ltcInsuranceDailyBenefit || undefined,
      overall_health: formData.spouseLongTermCare.overallHealth || undefined,
      current_living_situation: formData.spouseLongTermCare.currentLivingSituation || undefined,
      in_ltc_facility: formData.spouseLongTermCare.inLtcFacility,
      facility_name: formData.spouseLongTermCare.facilityName || undefined,
    },
  ];

  // Build legacy entries from obituary + letters
  const funeralLegacyEntries: Array<{
    id: string;
    entry_type?: string;
    title?: string;
    body?: string;
  }> = [];

  // Add client obituary if any content exists
  const obit = formData.legacyObituary;
  const obitBody = [
    obit.preferredName && `Preferred Name: ${obit.preferredName}`,
    obit.placeOfBirth && `Born: ${obit.placeOfBirth}`,
    obit.hometowns && `Hometowns: ${obit.hometowns}`,
    obit.religiousAffiliation && `Religious Affiliation: ${obit.religiousAffiliation}`,
    obit.education && `Education: ${obit.education}`,
    obit.careerHighlights && `Career: ${obit.careerHighlights}`,
    obit.communityInvolvement && `Community: ${obit.communityInvolvement}`,
    obit.awardsHonors && `Awards: ${obit.awardsHonors}`,
    obit.whatToRemember && `What to Remember: ${obit.whatToRemember}`,
    obit.personalMessage && `Personal Message: ${obit.personalMessage}`,
    obit.quotesToInclude && `Quotes: ${obit.quotesToInclude}`,
    obit.servicePreferences && `Service Preferences: ${obit.servicePreferences}`,
    obit.charitableDonations && `Charitable Donations: ${obit.charitableDonations}`,
  ].filter(Boolean).join('\n');
  if (obitBody) {
    funeralLegacyEntries.push({
      id: 'obit-client',
      entry_type: 'obituary',
      title: `Obituary Notes — ${formData.name || 'Client'}`,
      body: obitBody,
    });
  }

  // Add letters
  (formData.legacyLetters || []).forEach((letter, i) => {
    if (letter.letterBody) {
      funeralLegacyEntries.push({
        id: `letter-${i}`,
        entry_type: 'letter',
        title: `Letter to ${letter.recipientName || letter.recipientType || 'Family'}`,
        body: letter.letterBody,
      });
    }
  });

  return {
    // Emergency Medical
    emergencyIntake,
    vitals,
    allergies,
    medications,
    conditions,
    providers,
    equipment,
    pharmacies,
    surgeries,
    // Family Contact
    familyIntake,
    children,
    dependents,
    beneficiaries,
    friendsNeighbors,
    advisors,
    // Asset Inventory
    assetIntake,
    bankAccounts,
    investments,
    retirementAccounts,
    realEstate,
    vehicles,
    lifeInsurance,
    businessInterests,
    digitalAssets,
    otherAssets,
    // Insurance Summary
    insuranceCoverage,
    medicalInsurance,
    clientMedicalInsurance,
    spouseMedicalInsurance,
    longTermCare,
    // Estate Planning
    estateIntake,
    // Funeral Instructions
    funeralIntake,
    funeralEndOfLife,
    funeralLegacyCharityPreferences,
    funeralLegacyCharityOrganizations,
    funeralLegacyEntries,
    // What To Do If I Die
    whatToDoIntake,
    whatToDoSubscriptions,
    // Family Briefing Report
    briefingIntake,
    briefingClientIncome,
    briefingSpouseIncome,
    briefingClientMedIns,
    briefingSpouseMedIns,
    briefingLongTermCare,
    currentEstatePlans,
    distributionPlans,
    estateBeneficiaries,
    estateChildren,
    estateSpecificGifts,
    estateCashGifts,
    estateCharities,
  };
};

// ─── Main Component ──────────────────────────────────────────────────────────

const ReportsSection = () => {
  const [activeReport, setActiveReport] = useState<string | null>(null);
  const data = useReportData();

  const renderReport = () => {
    switch (activeReport) {
      case 'emergency-medical':
        return (
          <EmergencyMedicalSummary
            intake={data.emergencyIntake}
            vitals={data.vitals}
            allergies={data.allergies}
            medications={data.medications}
            conditions={data.conditions}
            providers={data.providers}
            equipment={data.equipment}
            pharmacies={data.pharmacies}
            surgeries={data.surgeries}
          />
        );
      case 'family-contact':
        return (
          <FamilyContactSheet
            intake={data.familyIntake}
            children={data.children}
            dependents={data.dependents}
            beneficiaries={data.beneficiaries}
            friendsNeighbors={data.friendsNeighbors}
            advisors={data.advisors}
          />
        );
      case 'asset-inventory':
        return (
          <AssetInventory
            intake={data.assetIntake}
            bankAccounts={data.bankAccounts}
            investments={data.investments}
            retirementAccounts={data.retirementAccounts}
            realEstate={data.realEstate}
            vehicles={data.vehicles}
            lifeInsurance={data.lifeInsurance}
            businessInterests={data.businessInterests}
            digitalAssets={data.digitalAssets}
            otherAssets={data.otherAssets}
          />
        );
      case 'insurance-summary':
        return (
          <InsuranceSummary
            intake={data.assetIntake}
            lifeInsurance={data.lifeInsurance}
            insuranceCoverage={data.insuranceCoverage}
            medicalInsurance={data.medicalInsurance}
            clientMedicalInsurance={data.clientMedicalInsurance}
            spouseMedicalInsurance={data.spouseMedicalInsurance}
            longTermCare={data.longTermCare}
          />
        );
      case 'advisor-directory':
        return (
          <AdvisorDirectory
            intake={data.familyIntake}
            advisors={data.advisors}
            medicalProviders={data.providers}
            pharmacies={data.pharmacies}
          />
        );
      case 'estate-planning':
        return (
          <EstatePlanningOverview
            intake={data.estateIntake}
            currentEstatePlans={data.currentEstatePlans}
            distributionPlans={data.distributionPlans}
            beneficiaries={data.estateBeneficiaries}
            children={data.estateChildren}
            specificGifts={data.estateSpecificGifts}
            cashGifts={data.estateCashGifts}
            charities={data.estateCharities}
          />
        );
      case 'funeral-instructions':
        return (
          <FuneralInstructions
            intake={data.funeralIntake}
            endOfLife={data.funeralEndOfLife}
            legacyCharityPreferences={data.funeralLegacyCharityPreferences}
            legacyCharityOrganizations={data.funeralLegacyCharityOrganizations}
            legacyEntries={data.funeralLegacyEntries}
          />
        );
      case 'what-to-do':
        return (
          <WhatToDoIfIDie
            intake={data.whatToDoIntake}
            currentEstatePlans={data.currentEstatePlans}
            advisors={data.advisors}
            bankAccounts={data.bankAccounts}
            realEstate={data.realEstate}
            lifeInsurance={data.lifeInsurance}
            retirementAccounts={data.retirementAccounts}
            digitalAssets={data.digitalAssets}
            subscriptions={data.whatToDoSubscriptions}
          />
        );
      case 'family-briefing':
        return (
          <FamilyBriefingReport
            intake={data.briefingIntake}
            currentEstatePlans={data.currentEstatePlans}
            children={data.estateChildren}
            beneficiaries={data.estateBeneficiaries}
            advisors={data.advisors}
            lifeInsurance={data.lifeInsurance}
            retirementAccounts={data.retirementAccounts}
            realEstate={data.realEstate}
            bankAccounts={data.bankAccounts}
            investments={data.investments}
            clientIncome={data.briefingClientIncome}
            spouseIncome={data.briefingSpouseIncome}
            clientMedicalInsurance={data.briefingClientMedIns}
            spouseMedicalInsurance={data.briefingSpouseMedIns}
            longTermCare={data.briefingLongTermCare}
          />
        );
      default:
        return (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              minHeight: 400,
            }}
          >
            <Typography
              sx={{
                fontFamily: '"Jost", sans-serif',
                fontSize: '15px',
                color: folioColors.inkFaint,
              }}
            >
              Select a report from the list to view it here.
            </Typography>
          </Box>
        );
    }
  };

  return (
    <Box sx={{ display: 'flex', gap: 2, minHeight: 600 }}>
      {/* ── Left sidebar: report list (20%) ── */}
      <Paper
        variant="outlined"
        sx={{
          width: '20%',
          minWidth: 200,
          flexShrink: 0,
          borderRadius: 2,
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            bgcolor: folioColors.ink,
            color: '#fff',
            px: 2,
            py: 1.5,
          }}
        >
          <Typography
            sx={{
              fontFamily: '"Jost", sans-serif',
              fontWeight: 600,
              fontSize: '14px',
              letterSpacing: '0.03em',
            }}
          >
            Reports
          </Typography>
        </Box>

        <List disablePadding>
          {REPORTS.map((report) => (
            <ListItemButton
              key={report.id}
              selected={activeReport === report.id}
              onClick={() => setActiveReport(report.id)}
              sx={{
                py: 1.5,
                px: 2,
                borderBottom: `1px solid ${folioColors.parchment}`,
                '&.Mui-selected': {
                  bgcolor: folioColors.cream,
                  borderLeft: `3px solid ${folioColors.accent}`,
                  '&:hover': { bgcolor: folioColors.creamDark },
                },
                '&:hover': { bgcolor: folioColors.cream },
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 36,
                  color: activeReport === report.id ? folioColors.accent : folioColors.inkLight,
                }}
              >
                {report.icon}
              </ListItemIcon>
              <ListItemText
                primary={report.label}
                primaryTypographyProps={{
                  fontFamily: '"Jost", sans-serif',
                  fontSize: '13px',
                  fontWeight: activeReport === report.id ? 600 : 400,
                  color: activeReport === report.id ? folioColors.ink : folioColors.inkLight,
                }}
              />
            </ListItemButton>
          ))}
        </List>
      </Paper>

      {/* ── Right area: report display (80%) ── */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        {renderReport()}
      </Box>
    </Box>
  );
};

export default ReportsSection;
