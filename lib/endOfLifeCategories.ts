export interface EndOfLifeCategoryDef {
  label: string;
  fields: { name: string; label: string; type: 'text' | 'select' | 'textarea'; options?: string[] }[];
}

export const END_OF_LIFE_CATEGORIES: EndOfLifeCategoryDef[] = [
  {
    label: 'Advance Directives',
    fields: [
      { name: 'lifeProlongingCare', label: 'If I am in the process of dying, my thoughts on life prolonging care are as follows', type: 'textarea' },
      { name: 'organDonation', label: 'With regard to Organ Donation, my thoughts are as follows', type: 'textarea' },
      { name: 'dnr', label: 'My thoughts on a Do Not Resuscitate Order are as follows', type: 'textarea' },
    ],
  },
  {
    label: 'Prepaid Funeral',
    fields: [
      { name: 'provider', label: 'Provider', type: 'text' },
      { name: 'account', label: 'Account', type: 'text' },
      { name: 'value', label: 'Value', type: 'text' },
      { name: 'contactName', label: 'Contact Name', type: 'text' },
      { name: 'contactPhone', label: 'Contact Phone', type: 'text' },
      { name: 'contactEmail', label: 'Contact Email', type: 'text' },
      { name: 'notes', label: 'Notes', type: 'text' },
    ],
  },
  {
    label: 'Desires',
    fields: [
      { name: 'burialOrCremation', label: 'Burial or Cremation', type: 'select', options: ['Burial', 'Cremation', 'Undecided'] },
      { name: 'viewingDays', label: 'Viewing Days', type: 'text' },
      { name: 'wakeLocation', label: 'Wake Location', type: 'text' },
      { name: 'notes', label: 'Notes', type: 'text' },
    ],
  },
  {
    label: 'Funeral Home',
    fields: [
      { name: 'funeralHome', label: 'Funeral Home', type: 'text' },
      { name: 'location', label: 'Location', type: 'text' },
      { name: 'contactName', label: 'Contact Name', type: 'text' },
      { name: 'phone', label: 'Phone', type: 'text' },
      { name: 'email', label: 'Email', type: 'text' },
      { name: 'completedRequestForServices', label: 'Completed Request for Services', type: 'select', options: ['Yes', 'No'] },
      { name: 'notes', label: 'Notes', type: 'text' },
    ],
  },
  {
    label: 'Burial',
    fields: [
      { name: 'cemetery', label: 'Cemetery', type: 'text' },
      { name: 'plotLocation', label: 'Plot Location', type: 'text' },
      { name: 'mausoleumCryptNumber', label: 'Mausoleum Crypt Number', type: 'text' },
      { name: 'contact', label: 'Contact', type: 'text' },
      { name: 'address', label: 'Address', type: 'text' },
      { name: 'phone', label: 'Phone', type: 'text' },
      { name: 'email', label: 'Email', type: 'text' },
      { name: 'notes', label: 'Notes', type: 'text' },
    ],
  },
  {
    label: 'Religious',
    fields: [
      { name: 'worshipSite', label: 'Worship Site', type: 'text' },
      { name: 'clergyContact', label: 'Clergy Contact', type: 'text' },
      { name: 'scriptureReadings', label: 'Scripture Readings', type: 'text' },
      { name: 'hymns', label: 'Hymns', type: 'text' },
      { name: 'notes', label: 'Notes', type: 'text' },
    ],
  },
];

export const END_OF_LIFE_CATEGORY_LABELS = END_OF_LIFE_CATEGORIES.map((c) => c.label);
