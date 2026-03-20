  const debugFormData = () => {
    console.log('=== FORM DATA DEBUG ===');
    console.log('Full formData object:', formData);
    console.log('--- Personal Data ---');
    console.log('Name:', formData.name);
    console.log('Spouse:', formData.spouseName);
    console.log('Marital Status:', formData.maritalStatus);
    console.log('--- Trusts ---');
    console.log('Client Living Trust:', formData.clientHasLivingTrust, formData.clientLivingTrustName);
    console.log('Client Irrevocable Trust:', formData.clientHasIrrevocableTrust, formData.clientIrrevocableTrustName);
    console.log('Spouse Living Trust:', formData.spouseHasLivingTrust, formData.spouseLivingTrustName);
    console.log('Spouse Irrevocable Trust:', formData.spouseHasIrrevocableTrust, formData.spouseIrrevocableTrustName);
    console.log('--- Children ---');
    console.log('Children:', formData.children);
    console.log('--- Other Beneficiaries ---');
    console.log('Other Beneficiaries:', formData.otherBeneficiaries);
    console.log('--- Assets ---');
    console.log('Real Estate:', formData.realEstate);
    console.log('Bank Accounts:', formData.bankAccounts);
    console.log('Non-Qualified Investments:', formData.nonQualifiedInvestments);
    console.log('Retirement Accounts:', formData.retirementAccounts);
    console.log('Life Insurance:', formData.lifeInsurance);
    console.log('Vehicles:', formData.vehicles);
    console.log('Other Assets:', formData.otherAssets);
    console.log('Business Interests:', formData.businessInterests);
    console.log('Digital Assets:', formData.digitalAssets);
    console.log('=== END DEBUG ===');
  }