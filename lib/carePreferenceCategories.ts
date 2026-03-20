export interface CarePreferenceCategoryDef {
  label: string;
  items: string[];
}

export const CARE_PREFERENCE_CATEGORIES: CarePreferenceCategoryDef[] = [
  {
    label: 'Care Setting Preferences',
    items: [
      'Preferred care setting (home, assisted living, nursing facility)',
      'Willingness to relocate for care',
      'Private room vs. shared room preference',
      'Preferred facility or community name',
    ],
  },
  {
    label: 'Medical Care Preferences',
    items: [
      'Primary care physician preference',
      'Preferred hospital or health system',
      'Attitudes toward aggressive vs. comfort-focused treatment',
      'Pain management preferences',
      'DNR / Do Not Resuscitate preference',
      'Organ donation wishes',
    ],
  },
  {
    label: 'Diet & Nutrition',
    items: [
      'Dietary restrictions (allergies, religious, medical)',
      'Foods to avoid',
      'Meal timing preferences',
      'Beverage preferences',
      'Texture-modified diet needs',
      'Alcohol consumption preferences',
    ],
  },
  {
    label: 'Personal Care & Hygiene',
    items: [
      'Bathing preferences (shower, bath, time of day)',
      'Hair care and grooming preferences',
      'Oral hygiene routine',
      'Clothing style preferences',
      'Gender preference for personal care aides',
    ],
  },
  {
    label: 'Daily Routine & Sleep',
    items: [
      'Preferred wake-up time',
      'Preferred bedtime',
      'Morning routine preferences',
      'Evening routine preferences',
      'Nap preferences',
      'Sleep environment preferences (light, noise, temperature)',
      'Sleep aids used',
    ],
  },
  {
    label: 'Activities & Engagement',
    items: [
      'Favorite hobbies and activities',
      'Music preferences',
      'Television or movie preferences',
      'Reading preferences',
      'Social activity preferences',
      'Technology use (tablet, phone, computer)',
    ],
  },
  {
    label: 'Family & Social Preferences',
    items: [
      'Preferred visitors and frequency',
      'People to limit or exclude from visiting',
      'Family involvement in care decisions',
      'Preferred decision-maker if incapacitated',
    ],
  },
  {
    label: 'Cognitive & Emotional Care',
    items: [
      'Meaningful objects or comfort items',
      'Preferred calming techniques',
      'Activities that cause distress or anxiety',
      'Music or sounds that are soothing',
    ],
  },
  {
    label: 'Communication Preferences',
    items: [
      'Preferred name or nickname',
      'Language preferences',
      'Hearing or vision accommodations needed',
      'Topics to avoid in conversation',
    ],
  },
  {
    label: 'Spiritual & Cultural Preferences',
    items: [
      'Religious or spiritual affiliation',
      'Religious service attendance preferences',
      'Prayer or meditation practices',
      'Cultural traditions to maintain',
    ],
  },
  {
    label: 'End-of-Life Preferences',
    items: [
      'Comfort care vs. life-prolonging treatment',
      'Hospice care preferences',
      'Preferred location for end of life (home, facility, hospice)',
      'People to be present at end of life',
      'Music or readings desired at end of life',
      'Spiritual or religious rites desired',
      'Body disposition preferences (burial, cremation, donation)',
      'Memorial or funeral service preferences',
    ],
  },
];

export const CARE_PREFERENCE_CATEGORY_LABELS = CARE_PREFERENCE_CATEGORIES.map(
  (c) => c.label
);
