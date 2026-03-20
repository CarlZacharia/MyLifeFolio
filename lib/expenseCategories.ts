export interface ExpenseCategoryDef {
  label: string;
  types: string[];
}

export const EXPENSE_CATEGORIES: ExpenseCategoryDef[] = [
  {
    label: 'Housing',
    types: [
      'Mortgage payment (principal & interest)',
      'Rent',
      'Property taxes (paid directly)',
      'Homeowners / renters insurance (paid directly)',
      'HOA dues / condo fees',
      'HOA special assessments',
      'Home equity loan / HELOC payment',
      'Lawn / landscaping service',
      'Pool service',
      'Pest control',
      'House cleaning service',
      'Snow removal',
      'Trash / recycling collection',
      'Security / alarm monitoring',
      'Storage unit rental',
    ],
  },
  {
    label: 'Utilities',
    types: [
      'Electric',
      'Gas / propane',
      'Water / sewer',
      'Telephone (landline)',
      'Cell phone',
      'Internet / broadband',
      'Cable / satellite TV',
      'Streaming services',
    ],
  },
  {
    label: 'Food & Household',
    types: [
      'Groceries',
      'Dining out / restaurants',
      'Meal delivery services',
      'Alcohol / beverages',
      'Household supplies',
      'Cleaning supplies',
    ],
  },
  {
    label: 'Transportation',
    types: [
      'Car payment(s)',
      'Auto insurance',
      'Gasoline / fuel',
      'Parking fees / garage',
      'Tolls (SunPass, EZPass)',
      'Vehicle registration / tags',
      'Vehicle maintenance & repairs',
      'Car wash',
      'Uber / Lyft / rideshare',
      'Taxi',
      'Public transportation / bus / train',
      'AAA or roadside assistance',
    ],
  },
  {
    label: 'Health & Medical',
    types: [
      'Medicare Part B premium',
      'Medicare Part D premium',
      'Medicare supplement / Medigap premium',
      'Medicare Advantage premium',
      'Other health insurance premium',
      'Dental insurance premium',
      'Vision insurance premium',
      'Long-term care insurance premium',
      'Primary care / specialist copays',
      'Dental care',
      'Vision care / eyeglasses',
      'Prescription medications (out of pocket)',
      'Over-the-counter medications / supplements',
      'Home health aide / caregiver costs',
      'Adult day program costs',
      'Physical therapy / occupational therapy',
      'Mental health / counseling',
      'Hearing aids / batteries / maintenance',
      'Medical equipment / supplies',
      'Gym / fitness membership',
      'Personal trainer',
    ],
  },
  {
    label: 'Insurance (Non-Health)',
    types: [
      'Life insurance premium',
      'Umbrella insurance premium',
      'Disability insurance premium',
      'Annuity premium',
      'Flood insurance premium',
      'Other specialty insurance premiums',
    ],
  },
  {
    label: 'Financial & Professional Services',
    types: [
      'Financial advisor fee',
      'Accountant / tax preparation',
      'Attorney retainer or recurring legal fees',
      'Bank fees / account maintenance',
      'Safe deposit box rental',
      'Credit card annual fees',
      'Investment account fees',
    ],
  },
  {
    label: 'Debt Service',
    types: [
      'Credit card minimum / actual payments',
      'Personal loan payment',
      'Student loan payment',
      'Medical debt payment plan',
    ],
  },
  {
    label: 'Personal Care',
    types: [
      'Haircuts / salon',
      'Barber',
      'Nail care / manicure / pedicure',
      'Spa / massage',
      'Cosmetics / personal care products',
      'Dry cleaning / laundry service',
      'Clothing',
      'Shoe care / repair',
    ],
  },
  {
    label: 'Entertainment & Recreation',
    types: [
      'Club memberships (golf, country club, social)',
      'Hobbies (supplies, equipment, classes)',
      'Books / magazines / newspapers',
      'Theater / concerts / events',
      'Movies',
      'Sports / recreation fees',
      'Travel',
      'Vacation home expenses',
      'Lottery / gambling',
    ],
  },
  {
    label: 'Giving & Family Support',
    types: [
      'Charitable donations (regular / pledged)',
      'Church / religious organization',
      'Tithing',
      'Gifts to children / grandchildren',
      'Financial support to dependents',
      '529 contributions for grandchildren',
      'Annual exclusion gifts',
    ],
  },
  {
    label: 'Subscriptions & Memberships',
    types: [
      'Amazon Prime / wholesale club',
      'AARP membership',
      'AAA membership',
      'Professional association dues',
      'Software subscriptions',
      'Cloud storage',
      'Newspaper / magazine subscriptions',
      'Other recurring subscriptions',
    ],
  },
  {
    label: 'Home Maintenance Reserve',
    types: [
      'Monthly set-aside for home repairs',
      'Appliance replacement reserve',
      'Roof / HVAC / major system reserve',
    ],
  },
  {
    label: 'Taxes',
    types: [
      'Estimated federal income tax payments',
      'Estimated state income tax payments',
      'Real property taxes (not escrowed)',
      'Tangible personal property tax',
    ],
  },
  {
    label: 'Pet Expenses',
    types: [
      'Veterinary care (routine)',
      'Pet insurance premium',
      'Pet food',
      'Grooming',
      'Boarding / pet sitting',
      'Dog walking',
    ],
  },
];

export const EXPENSE_CATEGORY_LABELS = EXPENSE_CATEGORIES.map((c) => c.label);

export const EXPENSE_FREQUENCY_OPTIONS = [
  'Monthly',
  'Quarterly',
  'Semi-Annually',
  'Annually',
  'Weekly',
  'Bi-Weekly',
  'Irregular',
] as const;

export type ExpenseFrequency = typeof EXPENSE_FREQUENCY_OPTIONS[number] | '';
