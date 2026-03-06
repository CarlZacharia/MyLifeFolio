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
      'Proximity to family or specific locations',
      'Climate or geographic preferences',
      'Pet-friendly environment required',
      'Preferred facility or community name',
    ],
  },
  {
    label: 'Medical Care Preferences',
    items: [
      'Primary care physician preference',
      'Specialist preferences',
      'Preferred hospital or health system',
      'Attitudes toward aggressive vs. comfort-focused treatment',
      'Pain management preferences',
      'Medication preferences or concerns',
      'Alternative or complementary therapy interest',
      'Vaccination preferences',
      'Blood transfusion acceptance',
      'Organ donation wishes',
      'DNR / Do Not Resuscitate preference',
    ],
  },
  {
    label: 'Diet & Nutrition',
    items: [
      'Dietary restrictions (allergies, religious, medical)',
      'Preferred cuisine or foods',
      'Foods to avoid',
      'Meal timing preferences',
      'Snack preferences',
      'Beverage preferences',
      'Alcohol consumption preferences',
      'Texture-modified diet needs',
      'Nutritional supplement preferences',
      'Dining companion preferences (alone vs. group)',
    ],
  },
  {
    label: 'Personal Care & Hygiene',
    items: [
      'Bathing preferences (shower, bath, time of day)',
      'Hair care and grooming preferences',
      'Nail care preferences',
      'Oral hygiene routine',
      'Skin care routine',
      'Preferred personal care products or brands',
      'Clothing style preferences',
      'Dressing assistance comfort level',
      'Continence care preferences',
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
      'Exercise or physical activity preferences',
      'Music preferences',
      'Television or movie preferences',
      'Reading preferences',
      'Games or puzzles enjoyed',
      'Outdoor activity preferences',
      'Social activity preferences',
      'Creative activities (art, crafts, writing)',
      'Technology use (tablet, phone, computer)',
    ],
  },
  {
    label: 'Family & Social Preferences',
    items: [
      'Preferred visitors and frequency',
      'People to limit or exclude from visiting',
      'Phone or video call preferences',
      'Family involvement in care decisions',
      'Preferred decision-maker if incapacitated',
      'Grandchildren or children visit preferences',
      'Community or social group involvement',
      'Pet visitation preferences',
    ],
  },
  {
    label: 'Cognitive & Emotional Care',
    items: [
      'Preferred approach to memory support',
      'Response to confusion or agitation preferences',
      'Meaningful objects or comfort items',
      'Preferred calming techniques',
      'Music or sounds that are soothing',
      'Activities that cause distress or anxiety',
      'Mental health support preferences',
    ],
  },
  {
    label: 'Communication Preferences',
    items: [
      'Preferred name or nickname',
      'Language preferences',
      'Communication style (direct, gentle, humor)',
      'Hearing or vision accommodations needed',
      'Preferred method of receiving information',
      'Topics to avoid in conversation',
    ],
  },
  {
    label: 'Financial & Administrative',
    items: [
      'Preferred person to manage finances if unable',
      'Bill payment preferences',
      'Insurance and benefits management preferences',
      'Charitable giving preferences during incapacity',
      'Spending priorities for personal care',
      'Financial decision-making boundaries',
    ],
  },
  {
    label: 'Spiritual & Cultural Preferences',
    items: [
      'Religious or spiritual affiliation',
      'Religious service attendance preferences',
      'Clergy or spiritual advisor visits',
      'Prayer or meditation practices',
      'Cultural traditions to maintain',
      'Holiday celebration preferences',
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
