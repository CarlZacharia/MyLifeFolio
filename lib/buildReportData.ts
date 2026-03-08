/**
 * Shared report data builder.
 *
 * Transforms raw folio data (camelCase, same shape as FormData)
 * into the snake_case prop objects that report components expect.
 *
 * Used by both ReportsSection (client view) and ReportViewer (family portal).
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

const parseNum = (v: string | undefined | null): number | undefined => {
  if (!v) return undefined;
  const n = parseFloat(String(v).replace(/[^0-9.-]/g, ''));
  return isNaN(n) ? undefined : n;
};

const toISO = (v: any): string | undefined => {
  if (!v) return undefined;
  if (typeof v === 'string') return v;
  if (v instanceof Date) return v.toISOString();
  if (typeof v?.toISOString === 'function') return v.toISOString();
  return String(v);
};

const arr = (v: any): any[] => (Array.isArray(v) ? v : []);
const obj = (v: any): Record<string, any> => (v && typeof v === 'object' && !Array.isArray(v) ? v : {});

export interface ReportDataBundle {
  // Emergency Medical
  emergencyIntake: any;
  vitals: any;
  allergies: any[];
  medications: any[];
  conditions: any[];
  providers: any[];
  equipment: any[];
  pharmacies: any[];
  surgeries: any[];
  // Family Contact
  familyIntake: any;
  children: any[];
  dependents: any[];
  beneficiaries: any[];
  friendsNeighbors: any[];
  advisors: any[];
  // Asset Inventory
  assetIntake: any;
  bankAccounts: any[];
  investments: any[];
  retirementAccounts: any[];
  realEstate: any[];
  vehicles: any[];
  lifeInsurance: any[];
  businessInterests: any[];
  digitalAssets: any[];
  otherAssets: any[];
  // Insurance Summary
  insuranceCoverage: any[];
  medicalInsurance: any[];
  clientMedicalInsurance: any;
  spouseMedicalInsurance: any;
  longTermCare: any;
  // Estate Planning
  estateIntake: any;
  currentEstatePlans: any[];
  distributionPlans: any[];
  estateBeneficiaries: any[];
  estateChildren: any[];
  estateSpecificGifts: any[];
  estateCashGifts: any[];
  estateCharities: any[];
  // Funeral Instructions
  funeralIntake: any;
  funeralEndOfLife: any[];
  funeralLegacyCharityPreferences: any;
  funeralLegacyCharityOrganizations: any[];
  funeralLegacyEntries: any[];
  // What To Do If I Need Care
  careIntake: any;
  detailedLongTermCare: any[];
  carePreferences: any[];
  // What To Do If I Die
  whatToDoIntake: any;
  whatToDoSubscriptions: any[];
  // Family Briefing
  briefingIntake: any;
  briefingClientIncome: any[];
  briefingSpouseIncome: any[];
  briefingClientMedIns: any;
  briefingSpouseMedIns: any;
  briefingLongTermCare: any[];
}

export function buildReportData(fd: Record<string, any>): ReportDataBundle {
  const clientAddress = [
    fd.mailingAddress,
    fd.mailingCity,
    fd.mailingState,
    fd.mailingZip,
  ].filter(Boolean).join(', ') || undefined;

  const spouseAddress = [
    fd.spouseMailingAddress,
    fd.spouseMailingCity,
    fd.spouseMailingState,
    fd.spouseMailingZip,
  ].filter(Boolean).join(', ') || undefined;

  // ── Emergency Medical Summary ──
  const emergencyIntake = {
    client_name: fd.name || 'Client',
    client_birth_date: toISO(fd.birthDate),
    client_cell_phone: fd.cellPhone || undefined,
    client_home_phone: fd.homePhone || undefined,
    client_mailing_address: clientAddress,
    spouse_name: fd.spouseName || undefined,
    spouse_cell_phone: fd.spouseCellPhone || undefined,
    marital_status: fd.maritalStatus || undefined,
  };

  const bv = obj(fd.basicVitals);
  const vitals = {
    blood_type: bv.bloodType || undefined,
    height: bv.height || undefined,
    weight: bv.weight || undefined,
    as_of_date: bv.asOfDate || undefined,
  };

  const allergies = arr(fd.allergies).map((a: any, i: number) => ({
    id: String(i),
    allergen: a.allergen,
    allergy_type: a.allergyType || undefined,
    reaction: a.reaction || undefined,
    severity: a.severity || undefined,
  }));

  const medications = arr(fd.medications).map((m: any, i: number) => ({
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

  const conditions = arr(fd.medicalConditions).map((c: any, i: number) => ({
    id: String(i),
    condition_name: c.conditionName,
    diagnosed_date: c.diagnosedDate || undefined,
    treating_physician: c.treatingPhysician || undefined,
    status: c.status || undefined,
    notes: c.notes || undefined,
  }));

  const providers = arr(fd.medicalProviders).map((p: any, i: number) => ({
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

  const equipment = arr(fd.medicalEquipment).map((e: any, i: number) => ({
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

  const pharmacies = arr(fd.pharmacies).map((p: any, i: number) => ({
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

  const surgeries = arr(fd.surgeries).map((s: any, i: number) => ({
    id: String(i),
    procedure_name: s.procedureName,
    procedure_type: s.procedureType || undefined,
    procedure_date: s.procedureDate || undefined,
    facility: s.facility || undefined,
    surgeon_physician: s.surgeonPhysician || undefined,
    notes: s.notes || undefined,
  }));

  // ── Family Contact Sheet ──
  const familyIntake = {
    client_name: fd.name || 'Client',
    client_aka: fd.aka || undefined,
    client_birth_date: toISO(fd.birthDate),
    client_cell_phone: fd.cellPhone || undefined,
    client_home_phone: fd.homePhone || undefined,
    client_work_phone: fd.workPhone || undefined,
    client_email: fd.email || undefined,
    client_mailing_address: clientAddress,
    client_state_of_domicile: fd.stateOfDomicile || undefined,
    marital_status: fd.maritalStatus || undefined,
    spouse_name: fd.spouseName || undefined,
    spouse_aka: fd.spouseAka || undefined,
    spouse_birth_date: toISO(fd.spouseBirthDate),
    spouse_cell_phone: fd.spouseCellPhone || undefined,
    spouse_home_phone: fd.spouseHomePhone || undefined,
    spouse_work_phone: fd.spouseWorkPhone || undefined,
    spouse_email: fd.spouseEmail || undefined,
    spouse_mailing_address: spouseAddress,
  };

  const children = arr(fd.children).map((c: any, i: number) => ({
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

  const dependents = arr(fd.dependents).map((d: any, i: number) => ({
    id: String(i),
    name: d.name,
    relationship: d.relationship || undefined,
  }));

  const clientDistPlan = obj(fd.clientDistributionPlan);
  const beneficiaries = arr(clientDistPlan.residuaryBeneficiaries).map((b: any) => ({
    id: b.id,
    name: b.name,
    relationship: b.relationship || undefined,
  }));

  const friendsNeighbors = arr(fd.friendsNeighbors).map((f: any, i: number) => ({
    id: String(i),
    name: f.name,
    relationship: f.relationship || undefined,
    address: f.address || undefined,
    phone: f.phone || undefined,
    email: f.email || undefined,
    notes: f.notes || undefined,
  }));

  const advisors = arr(fd.advisors).map((a: any, i: number) => ({
    id: String(i),
    advisor_type: a.advisorType || undefined,
    name: a.name || undefined,
    firm_name: a.firmName || undefined,
    phone: a.phone || undefined,
    email: a.email || undefined,
    address: a.address || undefined,
    notes: a.notes || undefined,
  }));

  // ── Asset Inventory ──
  const assetIntake = {
    client_name: fd.name || 'Client',
    spouse_name: fd.spouseName || undefined,
    marital_status: fd.maritalStatus || undefined,
  };

  const bankAccounts = arr(fd.bankAccounts).map((b: any, i: number) => ({
    id: String(i),
    owner: b.owner || undefined,
    account_type: b.accountType || undefined,
    institution: b.institution || undefined,
    amount: parseNum(b.amount),
    has_beneficiaries: b.hasBeneficiaries,
    primary_beneficiaries: b.primaryBeneficiaries,
    notes: b.notes || undefined,
  }));

  const investments = arr(fd.nonQualifiedInvestments).map((inv: any, i: number) => ({
    id: String(i),
    owner: inv.owner || undefined,
    institution: inv.institution || undefined,
    description: inv.description || undefined,
    value: parseNum(inv.value),
    has_beneficiaries: inv.hasBeneficiaries,
    primary_beneficiaries: inv.primaryBeneficiaries,
    notes: inv.notes || undefined,
  }));

  const retirementAccounts = arr(fd.retirementAccounts).map((r: any, i: number) => ({
    id: String(i),
    owner: r.owner || undefined,
    institution: r.institution || undefined,
    account_type: r.accountType || undefined,
    value: parseNum(r.value),
    has_beneficiaries: r.hasBeneficiaries,
    primary_beneficiaries: r.primaryBeneficiaries,
    notes: r.notes || undefined,
  }));

  const realEstate = arr(fd.realEstate).map((re: any, i: number) => ({
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

  const vehicles = arr(fd.vehicles).map((v: any, i: number) => ({
    id: String(i),
    owner: v.owner || undefined,
    year_make_model: v.yearMakeModel || undefined,
    value: parseNum(v.value),
    has_beneficiaries: v.hasBeneficiaries,
    primary_beneficiaries: v.primaryBeneficiaries,
    notes: v.notes || undefined,
  }));

  const lifeInsurance = arr(fd.lifeInsurance).map((li: any, i: number) => ({
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

  const businessInterests = arr(fd.businessInterests).map((bi: any, i: number) => ({
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

  const digitalAssets = arr(fd.digitalAssets).map((da: any, i: number) => ({
    id: String(i),
    owner: da.owner || undefined,
    asset_type: da.assetType || undefined,
    platform: da.platform || undefined,
    description: da.description || undefined,
    value: parseNum(da.value),
    notes: da.notes || undefined,
  }));

  const otherAssets = arr(fd.otherAssets).map((oa: any, i: number) => ({
    id: String(i),
    owner: oa.owner || undefined,
    description: oa.description || undefined,
    value: parseNum(oa.value),
    has_beneficiaries: oa.hasBeneficiaries,
    primary_beneficiaries: oa.primaryBeneficiaries,
    notes: oa.notes || undefined,
  }));

  // ── Insurance Summary ──
  const insuranceCoverage = arr(fd.insurancePolicies).map((p: any, i: number) => ({
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

  const medicalInsurance = arr(fd.medicalInsurancePolicies).map((p: any, i: number) => ({
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

  const cmi = obj(fd.clientMedicalInsurance);
  const clientMedicalInsurance = {
    medicare_part_b_deduction: cmi.medicarePartBDeduction || undefined,
    medicare_coverage_type: cmi.medicareCoverageType || undefined,
    medicare_plan_name: cmi.medicarePlanName || undefined,
    medicare_coverage_cost: cmi.medicareCoverageCost || undefined,
    private_insurance_description: cmi.privateInsuranceDescription || undefined,
    private_insurance_cost: cmi.privateInsuranceCost || undefined,
    other_insurance_description: cmi.otherInsuranceDescription || undefined,
    other_insurance_cost: cmi.otherInsuranceCost || undefined,
  };

  const smi = obj(fd.spouseMedicalInsurance);
  const spouseMedicalInsurance = {
    medicare_part_b_deduction: smi.medicarePartBDeduction || undefined,
    medicare_coverage_type: smi.medicareCoverageType || undefined,
    medicare_plan_name: smi.medicarePlanName || undefined,
    medicare_coverage_cost: smi.medicareCoverageCost || undefined,
    private_insurance_description: smi.privateInsuranceDescription || undefined,
    private_insurance_cost: smi.privateInsuranceCost || undefined,
    other_insurance_description: smi.otherInsuranceDescription || undefined,
    other_insurance_cost: smi.otherInsuranceCost || undefined,
  };

  const cltc = obj(fd.clientLongTermCare);
  const longTermCare = {
    has_ltc_insurance: cltc.hasLtcInsurance,
    ltc_insurance_company: cltc.ltcInsuranceCompany || undefined,
    ltc_insurance_daily_benefit: cltc.ltcInsuranceDailyBenefit || undefined,
    ltc_insurance_term: cltc.ltcInsuranceTerm || undefined,
    ltc_insurance_maximum: cltc.ltcInsuranceMaximum || undefined,
    ltc_insurance_care_level: cltc.ltcInsuranceCareLevel || undefined,
    ltc_insurance_details: cltc.ltcInsuranceDetails || undefined,
    has_medigap: cltc.hasMedigap,
    medigap_details: cltc.medigapDetails || undefined,
  };

  // ── Estate Planning Overview ──
  const estateIntake = {
    client_name: fd.name || 'Client',
    client_aka: fd.aka || undefined,
    client_birth_date: toISO(fd.birthDate),
    client_mailing_address: clientAddress,
    client_state_of_domicile: fd.stateOfDomicile || undefined,
    client_email: fd.email || undefined,
    client_cell_phone: fd.cellPhone || undefined,
    marital_status: fd.maritalStatus || undefined,
    spouse_name: fd.spouseName || undefined,
    spouse_aka: fd.spouseAka || undefined,
    spouse_birth_date: toISO(fd.spouseBirthDate),
    date_married: toISO(fd.dateMarried),
    place_of_marriage: fd.placeOfMarriage || undefined,
    prior_marriage: fd.priorMarriage || undefined,
    children_from_prior_marriage: fd.childrenFromPriorMarriage || undefined,
    number_of_children: arr(fd.children).length || undefined,
    client_has_living_trust: fd.clientHasLivingTrust || undefined,
    client_living_trust_name: fd.clientLivingTrustName || undefined,
    client_living_trust_date: toISO(fd.clientLivingTrustDate),
    client_has_irrevocable_trust: fd.clientHasIrrevocableTrust || undefined,
    client_irrevocable_trust_name: fd.clientIrrevocableTrustName || undefined,
    client_irrevocable_trust_date: toISO(fd.clientIrrevocableTrustDate),
    client_considering_trust: fd.clientConsideringTrust || undefined,
    any_beneficiaries_minors: fd.anyBeneficiariesMinors || undefined,
    beneficiary_minors_explanation: fd.beneficiaryMinorsExplanation || undefined,
    any_beneficiaries_disabled: fd.anyBeneficiariesDisabled || undefined,
    beneficiary_disabled_explanation: fd.beneficiaryDisabledExplanation || undefined,
    any_beneficiaries_marital_problems: fd.anyBeneficiariesMaritalProblems || undefined,
    beneficiary_marital_problems_explanation: fd.beneficiaryMaritalProblemsExplanation || undefined,
    any_beneficiaries_receiving_ssi: fd.anyBeneficiariesReceivingSSI || undefined,
    beneficiary_ssi_explanation: fd.beneficiarySSIExplanation || undefined,
    any_beneficiary_drug_addiction: fd.anyBeneficiaryDrugAddiction || undefined,
    beneficiary_drug_addiction_explanation: fd.beneficiaryDrugAddictionExplanation || undefined,
    any_beneficiary_alcoholism: fd.anyBeneficiaryAlcoholism || undefined,
    beneficiary_alcoholism_explanation: fd.beneficiaryAlcoholismExplanation || undefined,
    any_beneficiary_financial_problems: fd.anyBeneficiaryFinancialProblems || undefined,
    beneficiary_financial_problems_explanation: fd.beneficiaryFinancialProblemsExplanation || undefined,
    has_other_beneficiary_concerns: fd.hasOtherBeneficiaryConcerns || undefined,
    beneficiary_other_concerns: fd.beneficiaryOtherConcerns || undefined,
    beneficiary_notes: fd.beneficiaryNotes || undefined,
    provide_for_spouse_then_children: fd.provideForSpouseThenChildren,
    treat_all_children_equally: fd.treatAllChildrenEqually,
    children_equality_explanation: fd.childrenEqualityExplanation || undefined,
    distribution_age: fd.distributionAge || undefined,
    children_predeceased_beneficiaries: fd.childrenPredeceasedBeneficiaries,
    leave_to_grandchildren: fd.leaveToGrandchildren,
    treat_all_grandchildren_equally: fd.treatAllGrandchildrenEqually,
    grandchildren_equality_explanation: fd.grandchildrenEqualityExplanation || undefined,
    grandchildren_amount: fd.grandchildrenAmount || undefined,
    grandchildren_distribution_age: fd.grandchildrenDistributionAge || undefined,
  };

  const mapEstatePlan = (plan: any, personType: string) => {
    const p = obj(plan);
    return {
      person_type: personType,
      has_will: p.hasWill,
      has_trust: p.hasTrust,
      is_joint_trust: p.isJointTrust,
      has_irrevocable_trust: p.hasIrrevocableTrust,
      is_joint_irrevocable_trust: p.isJointIrrevocableTrust,
      has_financial_poa: p.hasFinancialPOA,
      has_health_care_poa: p.hasHealthCarePOA,
      has_living_will: p.hasLivingWill,
      has_none: p.hasNone,
      will_date_signed: p.willDateSigned || undefined,
      will_state_signed: p.willStateSigned || undefined,
      will_personal_rep: p.willPersonalRep || undefined,
      will_personal_rep_alternate1: p.willPersonalRepAlternate1 || undefined,
      will_personal_rep_alternate2: p.willPersonalRepAlternate2 || undefined,
      will_primary_beneficiary: p.willPrimaryBeneficiary || undefined,
      will_secondary_beneficiaries: p.willSecondaryBeneficiaries || undefined,
      trust_name: p.trustName || undefined,
      trust_date_signed: p.trustDateSigned || undefined,
      trust_state_signed: p.trustStateSigned || undefined,
      trust_trustee: p.trustTrustee || undefined,
      trust_trustee_alternate1: p.trustTrusteeAlternate1 || undefined,
      trust_trustee_alternate2: p.trustTrusteeAlternate2 || undefined,
      trust_primary_beneficiary: p.trustPrimaryBeneficiary || undefined,
      trust_secondary_beneficiaries: p.trustSecondaryBeneficiaries || undefined,
      irrevocable_trust_name: p.irrevocableTrustName || undefined,
      irrevocable_trust_date_signed: p.irrevocableTrustDateSigned || undefined,
      irrevocable_trust_reason: p.irrevocableTrustReason || undefined,
      financial_poa_date_signed: p.financialPOADateSigned || undefined,
      financial_poa_state_signed: p.financialPOAStateSigned || undefined,
      financial_poa_agent1: p.financialPOAAgent1 || undefined,
      financial_poa_agent2: p.financialPOAAgent2 || undefined,
      financial_poa_agent3: p.financialPOAAgent3 || undefined,
      health_care_poa_date_signed: p.healthCarePOADateSigned || undefined,
      health_care_poa_state_signed: p.healthCarePOAStateSigned || undefined,
      health_care_poa_agent1: p.healthCarePOAAgent1 || undefined,
      living_will_date_signed: p.livingWillDateSigned || undefined,
      living_will_state_signed: p.livingWillStateSigned || undefined,
      review_option: p.reviewOption || undefined,
      document_state: p.documentState || undefined,
      document_date: p.documentDate || undefined,
    };
  };

  const currentEstatePlans = [
    mapEstatePlan(fd.clientCurrentEstatePlan, 'client'),
    mapEstatePlan(fd.spouseCurrentEstatePlan, 'spouse'),
  ];

  const mapDistPlan = (plan: any, personType: string) => {
    const p = obj(plan);
    return {
      person_type: personType,
      distribution_type: p.distributionType || undefined,
      is_sweetheart_plan: p.isSweetheartPlan,
      has_specific_gifts: p.hasSpecificGifts,
      residuary_share_type: p.residuaryShareType || undefined,
      notes: p.notes || undefined,
    };
  };

  const spouseDistPlan = obj(fd.spouseDistributionPlan);
  const distributionPlans = [
    mapDistPlan(fd.clientDistributionPlan, 'client'),
    mapDistPlan(spouseDistPlan, 'spouse'),
  ];

  const estateBeneficiaries = arr(fd.otherBeneficiaries).map((b: any, i: number) => ({
    id: String(i),
    name: b.name,
    relationship: b.relationship || undefined,
    relationship_other: b.relationshipOther || undefined,
    age: b.age || undefined,
  }));

  const estateChildren = arr(fd.children).map((c: any, i: number) => ({
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

  const estateSpecificGifts = arr(fd.specificGifts).map((g: any, i: number) => ({
    id: String(i),
    recipient_name: g.recipientName || undefined,
    relationship: g.relationship || undefined,
    description: g.description || undefined,
    notes: g.notes || undefined,
  }));

  const estateCashGifts = arr(clientDistPlan.cashGifts).map((g: any, i: number) => ({
    id: String(i),
    beneficiary_name: g.recipientName || undefined,
    relationship: g.relationship || undefined,
    amount: g.amount || undefined,
  }));

  const estateCharities = arr(fd.charities).map((c: any, i: number) => ({
    id: String(i),
    name: c.name || undefined,
    address: c.address || undefined,
    amount: c.amount || undefined,
  }));

  // ── Funeral Instructions ──
  const funeralIntake = {
    client_name: fd.name || 'Client',
    client_birth_date: toISO(fd.birthDate),
    client_mailing_address: clientAddress,
    client_cell_phone: fd.cellPhone || undefined,
    client_email: fd.email || undefined,
    marital_status: fd.maritalStatus || undefined,
    spouse_name: fd.spouseName || undefined,
    spouse_birth_date: toISO(fd.spouseBirthDate),
    client_served_military: fd.clientServedMilitary || undefined,
    client_military_branch: fd.clientMilitaryBranch || undefined,
    client_military_start_date: fd.clientMilitaryStartDate || undefined,
    client_military_end_date: fd.clientMilitaryEndDate || undefined,
    client_has_prepaid_funeral: fd.clientHasPrepaidFuneral || undefined,
    client_prepaid_funeral_details: fd.clientPrepaidFuneralDetails || undefined,
    client_preferred_funeral_home: fd.clientPreferredFuneralHome || undefined,
    client_burial_or_cremation: fd.clientBurialOrCremation || undefined,
    client_preferred_church: fd.clientPreferredChurch || undefined,
    spouse_served_military: fd.spouseServedMilitary || undefined,
    spouse_military_branch: fd.spouseMilitaryBranch || undefined,
    spouse_military_start_date: fd.spouseMilitaryStartDate || undefined,
    spouse_military_end_date: fd.spouseMilitaryEndDate || undefined,
    spouse_has_prepaid_funeral: fd.spouseHasPrepaidFuneral || undefined,
    spouse_prepaid_funeral_details: fd.spousePrepaidFuneralDetails || undefined,
    spouse_preferred_funeral_home: fd.spousePreferredFuneralHome || undefined,
    spouse_burial_or_cremation: fd.spouseBurialOrCremation || undefined,
    spouse_preferred_church: fd.spousePreferredChurch || undefined,
  };

  const funeralEndOfLife = arr(fd.endOfLife).map((item: any, i: number) => ({
    id: String(i),
    category: item.category,
    field_data: Object.fromEntries(
      Object.entries(item).filter(([k]) => k !== 'category')
    ),
  }));

  const lcp = obj(fd.legacyCharityPreferences);
  const funeralLegacyCharityPreferences = {
    donations_in_lieu_of_flowers: lcp.donationsInLieuOfFlowers,
    scholarship_fund: lcp.scholarshipFund || undefined,
    religious_donations: lcp.religiousDonations || undefined,
    legacy_giving_notes: lcp.legacyGivingNotes || undefined,
    why_these_causes: lcp.whyTheseCauses || undefined,
  };

  const funeralLegacyCharityOrganizations = arr(fd.legacyCharityOrganizations).map((o: any, i: number) => ({
    id: String(i),
    organization_name: o.organizationName || undefined,
    website: o.website || undefined,
    contact_info: o.contactInfo || undefined,
    notes: o.notes || undefined,
  }));

  // Build legacy entries from obituary + letters
  const funeralLegacyEntries: Array<{
    id: string;
    entry_type?: string;
    title?: string;
    body?: string;
  }> = [];

  const obit = obj(fd.legacyObituary);
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
      title: `Obituary Notes — ${fd.name || 'Client'}`,
      body: obitBody,
    });
  }

  arr(fd.legacyLetters).forEach((letter: any, i: number) => {
    if (letter.letterBody) {
      funeralLegacyEntries.push({
        id: `letter-${i}`,
        entry_type: 'letter',
        title: `Letter to ${letter.recipientName || letter.recipientType || 'Family'}`,
        body: letter.letterBody,
      });
    }
  });

  // ── What To Do If I Need Care ──
  const careIntake = {
    client_name: fd.name || 'Client',
    client_birth_date: toISO(fd.birthDate),
    client_cell_phone: fd.cellPhone || undefined,
    client_home_phone: fd.homePhone || undefined,
    client_email: fd.email || undefined,
    client_mailing_address: clientAddress,
    client_state_of_domicile: fd.stateOfDomicile || undefined,
    marital_status: fd.maritalStatus || undefined,
    spouse_name: fd.spouseName || undefined,
    spouse_cell_phone: fd.spouseCellPhone || undefined,
    spouse_email: fd.spouseEmail || undefined,
    client_served_military: fd.clientServedMilitary || undefined,
    client_military_branch: fd.clientMilitaryBranch || undefined,
    client_military_end_date: fd.clientMilitaryEndDate || undefined,
  };

  const mapDetailedLtc = (ltcRaw: any, personType: string) => {
    const l = obj(ltcRaw);
    return {
      person_type: personType,
      primary_goals_concerns: l.primaryGoalsConcerns || undefined,
      ltc_concern_level: l.ltcConcernLevel || undefined,
      overall_health: l.overallHealth || undefined,
      diagnoses: l.diagnoses || undefined,
      diagnoses_other: l.diagnosesOther || undefined,
      recent_hospitalizations: l.recentHospitalizations,
      hospitalization_details: l.hospitalizationDetails || undefined,
      mobility_limitations: l.mobilityLimitations || undefined,
      adl_help: l.adlHelp || undefined,
      adl_assistance: l.adlAssistance || undefined,
      iadl_help: l.iadlHelp || undefined,
      has_dementia: l.hasDementia,
      dementia_stage: l.dementiaStage || undefined,
      family_history_of_conditions: l.familyHistoryOfConditions || undefined,
      family_history_details: l.familyHistoryDetails || undefined,
      current_living_situation: l.currentLivingSituation || undefined,
      living_other: l.livingOther || undefined,
      in_ltc_facility: l.inLtcFacility,
      current_care_level: l.currentCareLevel || undefined,
      facility_name: l.facilityName || undefined,
      facility_address: l.facilityAddress || undefined,
      facility_start_date: l.facilityStartDate || undefined,
      receives_home_help: l.receivesHomeHelp,
      home_help_providers: l.homeHelpProviders || undefined,
      hours_of_help_per_week: l.hoursOfHelpPerWeek || undefined,
      expect_care_increase: l.expectCareIncrease || undefined,
      care_increase_explanation: l.careIncreaseExplanation || undefined,
      likelihood_of_ltc_in_5_years: l.likelihoodOfLtcIn5Years || undefined,
      care_preference: l.carePreference || undefined,
      care_preference_other: l.carePreferenceOther || undefined,
      has_specific_provider: l.hasSpecificProvider,
      preferred_provider_details: l.preferredProviderDetails || undefined,
      home_supports_needed: l.homeSupportsNeeded || undefined,
      geographic_preferences: l.geographicPreferences || undefined,
      primary_caregivers: l.primaryCaregivers || undefined,
      caregivers_limited_ability: l.caregiversLimitedAbility,
      caregivers_limited_details: l.caregiversLimitedDetails || undefined,
      family_conflicts: l.familyConflicts || undefined,
      medicare_types: l.medicareTypes || undefined,
      has_medigap: l.hasMedigap,
      medigap_details: l.medigapDetails || undefined,
      has_ltc_insurance: l.hasLtcInsurance,
      ltc_insurance_details: l.ltcInsuranceDetails || undefined,
      ltc_insurance_company: l.ltcInsuranceCompany || undefined,
      ltc_insurance_daily_benefit: l.ltcInsuranceDailyBenefit || undefined,
      ltc_insurance_term: l.ltcInsuranceTerm || undefined,
      ltc_insurance_maximum: l.ltcInsuranceMaximum || undefined,
      ltc_insurance_care_level: l.ltcInsuranceCareLevel || undefined,
      current_benefits: l.currentBenefits || undefined,
      previous_medicaid_application: l.previousMedicaidApplication,
      medicaid_application_details: l.medicaidApplicationDetails || undefined,
      monthly_income: l.monthlyIncome || undefined,
      made_gifts_over_5_years: l.madeGiftsOver5Years,
      gifts_details: l.giftsDetails || undefined,
      expecting_windfall: l.expectingWindfall,
      windfall_details: l.windfallDetails || undefined,
      care_setting_importance: l.careSettingImportance || undefined,
      end_of_life_preferences: l.endOfLifePreferences || undefined,
      important_therapies_activities: l.importantTherapiesActivities || undefined,
    };
  };

  const detailedLongTermCare = [
    mapDetailedLtc(fd.clientLongTermCare, 'client'),
    mapDetailedLtc(fd.spouseLongTermCare, 'spouse'),
  ];

  const carePreferences = arr(fd.carePreferences).map((cp: any, i: number) => ({
    id: String(i),
    category: cp.category || undefined,
    preference_item: cp.preferenceItem || undefined,
    response: cp.response || undefined,
    notes: cp.notes || undefined,
  }));

  // ── What To Do If I Die ──
  const whatToDoIntake = {
    client_name: fd.name || 'Client',
    client_cell_phone: fd.cellPhone || undefined,
    client_email: fd.email || undefined,
    client_mailing_address: clientAddress,
    client_state_of_domicile: fd.stateOfDomicile || undefined,
    marital_status: fd.maritalStatus || undefined,
    spouse_name: fd.spouseName || undefined,
    spouse_cell_phone: fd.spouseCellPhone || undefined,
    client_has_prepaid_funeral: fd.clientHasPrepaidFuneral || undefined,
    client_preferred_funeral_home: fd.clientPreferredFuneralHome || undefined,
    client_burial_or_cremation: fd.clientBurialOrCremation || undefined,
    client_has_living_trust: fd.clientHasLivingTrust || undefined,
    client_living_trust_name: fd.clientLivingTrustName || undefined,
    client_has_irrevocable_trust: fd.clientHasIrrevocableTrust || undefined,
    client_irrevocable_trust_name: fd.clientIrrevocableTrustName || undefined,
    client_served_military: fd.clientServedMilitary || undefined,
    client_military_branch: fd.clientMilitaryBranch || undefined,
    number_of_children: arr(fd.children).length || undefined,
  };

  const whatToDoSubscriptions = arr(fd.subscriptions).map((s: any, i: number) => ({
    id: String(i),
    service_name: s.serviceName || undefined,
    category: s.category || undefined,
    login_email: s.loginEmail || undefined,
    auto_renew: s.autoRenew,
    is_active: s.isActive,
  }));

  // ── Family Briefing Report ──
  const briefingIntake = {
    client_name: fd.name || 'Client',
    client_aka: fd.aka || undefined,
    client_birth_date: toISO(fd.birthDate),
    client_sex: fd.sex || undefined,
    client_cell_phone: fd.cellPhone || undefined,
    client_home_phone: fd.homePhone || undefined,
    client_email: fd.email || undefined,
    client_mailing_address: clientAddress,
    client_state_of_domicile: fd.stateOfDomicile || undefined,
    client_served_military: fd.clientServedMilitary || undefined,
    client_military_branch: fd.clientMilitaryBranch || undefined,
    client_has_prepaid_funeral: fd.clientHasPrepaidFuneral || undefined,
    client_preferred_funeral_home: fd.clientPreferredFuneralHome || undefined,
    client_burial_or_cremation: fd.clientBurialOrCremation || undefined,
    client_has_living_trust: fd.clientHasLivingTrust || undefined,
    client_living_trust_name: fd.clientLivingTrustName || undefined,
    client_has_irrevocable_trust: fd.clientHasIrrevocableTrust || undefined,
    marital_status: fd.maritalStatus || undefined,
    spouse_name: fd.spouseName || undefined,
    spouse_aka: fd.spouseAka || undefined,
    spouse_birth_date: toISO(fd.spouseBirthDate),
    spouse_cell_phone: fd.spouseCellPhone || undefined,
    spouse_email: fd.spouseEmail || undefined,
    spouse_mailing_address: spouseAddress,
    spouse_served_military: fd.spouseServedMilitary || undefined,
    spouse_military_branch: fd.spouseMilitaryBranch || undefined,
    spouse_has_prepaid_funeral: fd.spouseHasPrepaidFuneral || undefined,
    spouse_preferred_funeral_home: fd.spousePreferredFuneralHome || undefined,
    spouse_burial_or_cremation: fd.spouseBurialOrCremation || undefined,
    date_married: toISO(fd.dateMarried),
    place_of_marriage: fd.placeOfMarriage || undefined,
    prior_marriage: fd.priorMarriage || undefined,
    number_of_children: arr(fd.children).length || undefined,
    client_has_children_from_prior: fd.clientHasChildrenFromPrior || undefined,
    spouse_has_children_from_prior: fd.spouseHasChildrenFromPrior || undefined,
    any_beneficiaries_minors: fd.anyBeneficiariesMinors || undefined,
    any_beneficiaries_disabled: fd.anyBeneficiariesDisabled || undefined,
    any_beneficiaries_receiving_ssi: fd.anyBeneficiariesReceivingSSI || undefined,
    any_beneficiary_drug_addiction: fd.anyBeneficiaryDrugAddiction || undefined,
    any_beneficiary_financial_problems: fd.anyBeneficiaryFinancialProblems || undefined,
    beneficiary_notes: fd.beneficiaryNotes || undefined,
    provide_for_spouse_then_children: fd.provideForSpouseThenChildren,
    treat_all_children_equally: fd.treatAllChildrenEqually,
    distribution_age: fd.distributionAge || undefined,
  };

  const briefingClientIncome = arr(fd.clientIncomeSources).map((s: any, i: number) => ({
    id: String(i),
    description: s.description || undefined,
    amount: s.amount || undefined,
    frequency: s.frequency || undefined,
  }));

  const briefingSpouseIncome = arr(fd.spouseIncomeSources).map((s: any, i: number) => ({
    id: String(i),
    description: s.description || undefined,
    amount: s.amount || undefined,
    frequency: s.frequency || undefined,
  }));

  const briefingClientMedIns = {
    person: 'client',
    medicare_coverage_type: cmi.medicareCoverageType || undefined,
    medicare_plan_name: cmi.medicarePlanName || undefined,
    private_insurance_description: cmi.privateInsuranceDescription || undefined,
  };

  const briefingSpouseMedIns = {
    person: 'spouse',
    medicare_coverage_type: smi.medicareCoverageType || undefined,
    medicare_plan_name: smi.medicarePlanName || undefined,
    private_insurance_description: smi.privateInsuranceDescription || undefined,
  };

  const sltc = obj(fd.spouseLongTermCare);
  const briefingLongTermCare = [
    {
      person_type: 'client',
      has_ltc_insurance: cltc.hasLtcInsurance,
      ltc_insurance_company: cltc.ltcInsuranceCompany || undefined,
      ltc_insurance_daily_benefit: cltc.ltcInsuranceDailyBenefit || undefined,
      overall_health: cltc.overallHealth || undefined,
      current_living_situation: cltc.currentLivingSituation || undefined,
      in_ltc_facility: cltc.inLtcFacility,
      facility_name: cltc.facilityName || undefined,
    },
    {
      person_type: 'spouse',
      has_ltc_insurance: sltc.hasLtcInsurance,
      ltc_insurance_company: sltc.ltcInsuranceCompany || undefined,
      ltc_insurance_daily_benefit: sltc.ltcInsuranceDailyBenefit || undefined,
      overall_health: sltc.overallHealth || undefined,
      current_living_situation: sltc.currentLivingSituation || undefined,
      in_ltc_facility: sltc.inLtcFacility,
      facility_name: sltc.facilityName || undefined,
    },
  ];

  return {
    emergencyIntake,
    vitals,
    allergies,
    medications,
    conditions,
    providers,
    equipment,
    pharmacies,
    surgeries,
    familyIntake,
    children,
    dependents,
    beneficiaries,
    friendsNeighbors,
    advisors,
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
    insuranceCoverage,
    medicalInsurance,
    clientMedicalInsurance,
    spouseMedicalInsurance,
    longTermCare,
    estateIntake,
    currentEstatePlans,
    distributionPlans,
    estateBeneficiaries,
    estateChildren,
    estateSpecificGifts,
    estateCashGifts,
    estateCharities,
    funeralIntake,
    funeralEndOfLife,
    funeralLegacyCharityPreferences,
    funeralLegacyCharityOrganizations,
    funeralLegacyEntries,
    careIntake,
    detailedLongTermCare,
    carePreferences,
    whatToDoIntake,
    whatToDoSubscriptions,
    briefingIntake,
    briefingClientIncome,
    briefingSpouseIncome,
    briefingClientMedIns,
    briefingSpouseMedIns,
    briefingLongTermCare,
  };
}
