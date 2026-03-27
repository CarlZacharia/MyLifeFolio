import React from 'react';
import PersonIcon from '@mui/icons-material/Person';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import PeopleIcon from '@mui/icons-material/People';
import HistoryEduIcon from '@mui/icons-material/HistoryEdu';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import HomeIcon from '@mui/icons-material/Home';
import FamilyRestroomIcon from '@mui/icons-material/FamilyRestroom';
import SecurityIcon from '@mui/icons-material/Security';
import PlaceIcon from '@mui/icons-material/Place';
import VolunteerActivismIcon from '@mui/icons-material/VolunteerActivism';
import HealingIcon from '@mui/icons-material/Healing';
import FingerprintIcon from '@mui/icons-material/Fingerprint';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import type { HelpContent } from './FolioHelpModal';

// ─── 1. Personal Information ─────────────────────────────────────────────────

export const personalInfoHelp: HelpContent = {
  title: 'Personal Information — Help',
  icon: <PersonIcon sx={{ fontSize: 26 }} />,
  accentColor: '#1565c0',
  sections: [
    {
      title: 'Overview',
      body: 'This section captures the foundational personal data for you (and your spouse or partner, if applicable). The information entered here is used throughout the entire Folio — it pre-populates names, contact info, and demographic details across reports, legal documents, and other sections.',
    },
    {
      title: 'Client Tab',
      body: 'Enter your core personal details:',
      bullets: [
        'Full legal name, any aliases or maiden names (AKA), and preferred name.',
        'Date of birth — your age is calculated automatically.',
        'Sex — used for certain legal and medical documents.',
        'Marital status — this controls whether a Spouse tab appears across the Folio.',
        'Social Security Number — stored securely; used for estate and legal references.',
        'Contact information: cell phone, home phone, work phone, and email address.',
        'Mailing address and state of domicile (the state you consider your primary legal residence).',
      ],
    },
    {
      title: 'Spouse / Partner Tab',
      body: 'If your marital status is Married, Second Marriage, or Domestic Partnership, a second tab appears with the same fields for your spouse or partner. This information feeds into reports, insurance records, estate plans, and beneficiary designations throughout the Folio.',
    },
    {
      title: 'Marriage Details',
      body: 'When married or partnered, additional fields appear for date of marriage, place of marriage, and prior marriage history. These details are important for estate planning and legal document preparation.',
    },
    {
      title: 'Tips',
      bullets: [
        'Use your full legal name as it appears on government-issued ID — this is what legal documents will reference.',
        'Keep your state of domicile accurate — it determines which state\'s laws govern your estate plan.',
        'All data is auto-saved as you type. There is no separate "Save" button needed.',
      ],
    },
  ],
};

// ─── 2. Medical Data (Emergency Care) ────────────────────────────────────────

export const medicalDataHelp: HelpContent = {
  title: 'Health & Medical Data — Help',
  icon: <LocalHospitalIcon sx={{ fontSize: 26 }} />,
  accentColor: '#c62828',
  sections: [
    {
      title: 'Overview',
      body: 'This section is your comprehensive medical profile. In an emergency, a family member or caregiver can access this information to quickly provide first responders, hospital staff, or care providers with critical health details. The data here feeds directly into the Emergency Medical Summary report.',
    },
    {
      title: 'Medical Providers Tab',
      body: 'Record all of your healthcare providers — primary care physician, specialists, dentist, therapists, and others. Each provider entry includes:',
      bullets: [
        'Provider category (Primary Care, Specialist, Dentist, Mental Health, etc.).',
        'Specialist type (Cardiologist, Orthopedic, etc.) when applicable.',
        'Name, firm/practice name, phone, email, and address.',
        'Notes for any special instructions or context.',
      ],
    },
    {
      title: 'Medications Tab',
      body: 'List all current and past medications. Each entry captures:',
      bullets: [
        'Medication name, dosage, and form (tablet, capsule, injection, etc.).',
        'Frequency and any special timing instructions.',
        'Prescribing physician and condition being treated.',
        'Rx number for refill reference.',
        'Flags for controlled substances and refrigeration requirements.',
        'Active/inactive status to maintain a complete medication history.',
      ],
    },
    {
      title: 'Equipment & Devices Tab',
      body: 'Document any medical equipment or assistive devices you use:',
      bullets: [
        'Equipment name and type (mobility aid, respiratory, monitoring, etc.).',
        'Make/model and supplier information.',
        'Battery type (if applicable) and active/inactive status.',
        'Supplier contact details for replacement or service.',
      ],
    },
    {
      title: 'Pharmacies Tab',
      body: 'Record your pharmacies for prescription management:',
      bullets: [
        'Pharmacy name, chain affiliation, phone, and full address.',
        'Hours of operation and primary pharmacy designation.',
        'Having this on file helps caregivers refill prescriptions quickly.',
      ],
    },
    {
      title: 'Medical Conditions Tab',
      body: 'Document your health conditions, allergies, surgeries, and basic vitals:',
      bullets: [
        'Medical conditions with diagnosis date, treating physician, and current status.',
        'Allergies with allergen type, reaction description, and severity level.',
        'Surgical history including procedure type, date, facility, and surgeon.',
        'Basic vitals: blood type, height, weight, and date of last measurement.',
        'This information is critical for emergency responders and new providers.',
      ],
    },
  ],
};

// ─── 3. Financial Life ───────────────────────────────────────────────────────

export const financialLifeHelp: HelpContent = {
  title: 'Financial Life — Help',
  icon: <AccountBalanceWalletIcon sx={{ fontSize: 26 }} />,
  accentColor: '#2e7d32',
  sections: [
    {
      title: 'Overview',
      body: 'The Financial Life section is your complete financial picture — assets, income, expenses, subscriptions, debts, and lifetime gifts. This information powers the Asset Inventory report, the Family Briefing Report, and provides essential data for estate planning and "What To Do If I Die" scenarios.',
    },
    {
      title: 'Assets Tab',
      body: 'Your assets are organized into sub-categories accessible via toggle buttons:',
      bullets: [
        'Financial — Bank accounts (checking, savings, CDs, money market), non-qualified investment accounts, and retirement accounts (401k, IRA, Roth IRA, pension, etc.).',
        'Real Property — Real estate holdings with address, ownership form, value, mortgage balance, and cost basis.',
        'Life Insurance — Policies with company, type (term, whole, universal), face amount, death benefit, cash value, and beneficiary designations.',
        'Vehicles — Cars, boats, RVs, etc. with year/make/model and estimated value.',
        'Business — Business interests with entity type, ownership percentage, full value, co-owners, and buy-sell agreement status.',
        'Digital — Cryptocurrency, domain names, digital storefronts, NFTs, and other digital assets.',
        'Personal Property — Jewelry, art, collections, furniture, and other tangible personal property.',
      ],
    },
    {
      title: 'Income Tab',
      body: 'Record all income sources for both you and your spouse. Each entry includes a description, amount, and frequency (monthly, annually, etc.). This feeds into care planning and family briefing reports.',
    },
    {
      title: 'Expenses Tab',
      body: 'Track recurring expenses and monthly obligations. This helps family members understand ongoing financial commitments that may need to be managed.',
    },
    {
      title: 'Subscriptions Tab',
      body: 'Document all recurring subscriptions and services:',
      bullets: [
        'Service name, category, frequency, and cost.',
        'Payment method and account holder.',
        'Login email, auto-renewal status, and renewal date.',
        'Active/inactive status — so family knows what needs to be cancelled.',
        'This data appears in the Digital Life Summary and "What To Do If I Die" reports.',
      ],
    },
    {
      title: 'Debts Tab',
      body: 'Record all outstanding debts and obligations:',
      bullets: [
        'Debt type (mortgage, auto loan, student loan, credit card, personal loan, medical debt, etc.).',
        'Creditor, account number, original amount, current balance, interest rate, and monthly payment.',
        'Maturity date and any notes about the obligation.',
        'Totals are calculated automatically at the bottom of the table.',
      ],
    },
    {
      title: 'Gifts & Advancements Tab',
      body: 'Track lifetime gifts made to family members or others:',
      bullets: [
        'Recipient name and relationship.',
        'Gift type (cash, real property, vehicle, stocks, education, loan forgiveness, etc.).',
        'Description, amount/value, and date given.',
        '"Count against inheritance share" checkbox — marks gifts that should reduce the recipient\'s estate share (advancements).',
        'Documentation reference and notes.',
        'This data feeds into the Estate Planning Overview report.',
      ],
    },
  ],
};

// ─── 4. People & Advisors ────────────────────────────────────────────────────

export const peopleAdvisorsHelp: HelpContent = {
  title: 'People & Advisors — Help',
  icon: <PeopleIcon sx={{ fontSize: 26 }} />,
  accentColor: '#4527a0',
  sections: [
    {
      title: 'Overview',
      body: 'This section is your directory of the important professional advisors and personal contacts in your life. The information here feeds into the Advisor Directory report and the Family Contact Sheet, giving your family a single place to find everyone they may need to reach.',
    },
    {
      title: 'Professional Advisors',
      body: 'Add entries for each type of professional advisor you work with:',
      bullets: [
        'Attorney — estate planning attorney, family law, real estate, business, or general practice.',
        'Accountant / CPA — tax preparation, bookkeeping, or financial advisory.',
        'Financial Advisor / Planner — investment management, retirement planning.',
        'Insurance Agent — life, health, property, or auto insurance.',
        'Banker — personal banker or private banking relationship.',
        'Stockbroker — securities and investment broker.',
        'Real Estate Agent — buying, selling, or managing property.',
        'Other — clergy, therapist, or any other important advisor.',
      ],
    },
    {
      title: 'Advisor Details',
      body: 'For each advisor, you can record:',
      bullets: [
        'Full name and firm/practice name.',
        'Phone number and email address.',
        'Physical address.',
        'Notes — specialization, how long you\'ve worked together, account numbers, etc.',
      ],
    },
    {
      title: 'Friends & Neighbors',
      body: 'A separate section for personal contacts who should be notified or who may be able to help in an emergency:',
      bullets: [
        'Name, relationship description, phone, email, and address.',
        'Notes about their role (e.g., "Has a spare key," "Watches our house when traveling").',
        'These contacts appear on the Family Contact Sheet report.',
      ],
    },
  ],
};

// ─── 5. Legal Documents (Current Estate Plan) ───────────────────────────────

export const legalDocumentsHelp: HelpContent = {
  title: 'Legal Documents — Help',
  icon: <HistoryEduIcon sx={{ fontSize: 26 }} />,
  accentColor: '#7b2cbf',
  sections: [
    {
      title: 'Overview',
      body: 'This section tracks your current estate planning documents — what you have in place, when they were signed, where they were executed, and who serves in each fiduciary role. This is one of the most important sections in the Folio because it tells your family exactly which legal documents exist and who has authority to act on your behalf.',
    },
    {
      title: 'Document Types',
      body: 'For each of the following document types, indicate whether you have one and provide the relevant details:',
      bullets: [
        'Will (Last Will & Testament) — Names your Personal Representative (Executor) and alternates. Specifies primary and secondary beneficiaries.',
        'Revocable Living Trust — Names the Trustee and alternates. Identifies primary and secondary beneficiaries. Includes trust name, date signed, and state.',
        'Irrevocable Trust — Similar to revocable trust but cannot be changed once created. Records the reason for the trust (asset protection, Medicaid planning, tax planning, special needs, ILIT, charitable, etc.).',
        'Financial Power of Attorney — Names up to three agents who can manage your finances if you become incapacitated.',
        'Health Care Power of Attorney — Names the agent authorized to make medical decisions on your behalf.',
      ],
    },
    {
      title: 'Client & Spouse Tabs',
      body: 'If married or partnered, separate tabs let you record each person\'s documents independently. Each spouse may have their own will, trust, and powers of attorney with different fiduciary appointments.',
    },
    {
      title: 'Key Details for Each Document',
      bullets: [
        'Date Signed — when the document was executed.',
        'State Signed — the state where the document was signed (important for jurisdictional validity).',
        'Fiduciary Appointments — who serves as executor, trustee, POA agent, or health care agent, plus first and second alternates.',
        'Review Option — whether documents need review or updating.',
        'This data powers the Estate Planning Overview report and the Family Briefing Report.',
      ],
    },
    {
      title: 'Tips',
      bullets: [
        'Keep this section updated whenever you sign new documents or change fiduciary appointments.',
        'If you don\'t have a particular document, simply leave its checkbox unchecked — the system will note it in reports.',
        'Upload copies of your actual documents in the Documents Vault section for safekeeping.',
      ],
    },
  ],
};

// ─── 6. Legacy & Life Story ──────────────────────────────────────────────────

export const legacyHelp: HelpContent = {
  title: 'Legacy & Life Story — Help',
  icon: <AutoStoriesIcon sx={{ fontSize: 26 }} />,
  accentColor: '#c9a227',
  sections: [
    {
      title: 'Overview',
      body: 'The Legacy & Life Story section is your personal time capsule. This is where you capture the stories, values, memories, and messages that make you uniquely you. Unlike the other sections which focus on practical and legal matters, this section is about preserving your legacy in your own words for the people who matter most.',
    },
    {
      title: 'Obituary Info',
      body: 'Prepare the information your family will need to write your obituary:',
      bullets: [
        'Preferred name, place of birth, and hometowns.',
        'Religious affiliation, education, and career highlights.',
        'Community involvement, awards, and honors.',
        'What you want to be remembered for.',
        'Personal message, quotes to include, and service preferences.',
        'Charitable donation preferences in lieu of flowers.',
      ],
    },
    {
      title: 'Charitable Wishes',
      body: 'Document your charitable giving preferences and the organizations that matter to you. Include organization names, websites, contact information, and why each cause is important to you.',
    },
    {
      title: 'Letters to Family',
      body: 'Write personal letters to individual family members or groups. These are private messages to be read after your passing — words of love, wisdom, gratitude, or guidance that you want to leave behind. You can write to specific people (spouse, children, grandchildren) or to groups (all my grandchildren).',
    },
    {
      title: 'Personal History',
      body: 'Record the facts and timeline of your life — where you grew up, schools attended, career path, places lived, and other biographical details that help tell your story.',
    },
    {
      title: 'Life Stories',
      body: 'Share the stories that defined your life — childhood memories, how you met your spouse, career adventures, travel experiences, funny moments, and lessons learned. These narratives are invaluable to future generations.',
    },
    {
      title: 'Reflections',
      body: 'Capture your personal philosophy, values, and wisdom. What have you learned? What do you wish you\'d known sooner? What advice would you give your grandchildren? These reflections become a treasure for your family.',
    },
    {
      title: 'Surprises',
      body: 'Leave special surprises or revelations for your loved ones — hidden messages, secret gifts, or things you always wanted them to know but never found the right moment to share.',
    },
    {
      title: 'Favorites',
      body: 'Record your favorite things so they\'re never forgotten — favorite books, movies, music, foods, places, recipes, quotes, and people. These details bring comfort and connection to the people who love you.',
    },
    {
      title: 'Video Legacy',
      body: 'Record or upload video messages for your family. A video message adds a deeply personal dimension that written words alone cannot capture — your voice, your expressions, your laughter.',
    },
    {
      title: 'Memory Vault',
      body: 'Upload and organize photos, scanned documents, and other memorabilia that tell the story of your life. Add captions and dates to preserve context for future generations.',
    },
  ],
};

// ─── 7. Documents Vault ──────────────────────────────────────────────────────

export const documentsVaultHelp: HelpContent = {
  title: 'Documents Vault — Help',
  icon: <HomeIcon sx={{ fontSize: 26 }} />,
  accentColor: '#e07a2f',
  sections: [
    {
      title: 'Overview',
      body: 'The Documents Vault is your secure digital filing cabinet. Upload and organize copies of important documents so your family, attorney, or executor can find them when needed. Documents are organized by category for easy browsing.',
    },
    {
      title: 'Document Categories',
      body: 'Documents are organized into the following categories:',
      bullets: [
        'Estate Planning & Legal — Wills, trusts, powers of attorney, deeds, and other legal documents.',
        'Real Estate & Property — Property deeds, mortgage statements, HOA documents, and home warranties.',
        'Financial & Accounts — Bank statements, investment summaries, tax returns, and account agreements.',
        'Insurance — Policy documents, declarations pages, and claims records.',
        'Personal Identity — Birth certificates, passports, driver\'s licenses, Social Security cards, and marriage certificates.',
        'Military & Government — DD-214, VA records, government benefit documents.',
        'Medical & Health — Living wills, DNR orders, medical records, insurance cards, and prescription lists.',
        'Family & Genealogy — Family trees, adoption records, and historical family documents.',
        'Personal Legacy & Memorabilia — Photos, letters, historical documents, and other keepsakes.',
        'Digital Assets — Cryptocurrency wallet information, domain registrations, and digital business records.',
        'Other — Any documents that don\'t fit the above categories.',
      ],
    },
    {
      title: 'Document Details',
      body: 'For each uploaded document, the system tracks:',
      bullets: [
        'File name, size, and upload date.',
        'Sensitivity level (Normal, Restricted, or Highly Sensitive) — controls visibility in family access.',
        'Expiration date (optional) — the system will warn when documents are nearing expiration.',
        'Notes — any context about the document.',
      ],
    },
    {
      title: 'Tips',
      bullets: [
        'Scan and upload the most current version of all important legal documents.',
        'Use the sensitivity level to control who can see each document through the Family Access Portal.',
        'Set expiration dates on documents like insurance policies, passports, and driver\'s licenses so you get reminders to renew.',
        'The "All Documents" table at the bottom provides a comprehensive view across all categories.',
      ],
    },
  ],
};

// ─── 7b. Document Storage Location ───────────────────────────────────────────

export const documentStorageLocationHelp: HelpContent = {
  title: 'Document Storage Location — Help',
  icon: <PlaceIcon sx={{ fontSize: 26 }} />,
  accentColor: '#7b2cbf',
  sections: [
    {
      title: 'Overview',
      body: 'This section tracks where the physical copies of your important documents are stored — at home, in a safe, at your attorney\'s office, in a safe deposit box, etc. When a crisis happens, your family needs to find these documents quickly.',
    },
    {
      title: 'Categories',
      body: 'Documents are organized into these groups:',
      bullets: [
        'Estate Planning — Will, Trust, Powers of Attorney, Living Will, Prenuptial Agreement.',
        'Insurance — Life, Homeowners, Auto, Umbrella, Long-Term Care, Medicare Supplement.',
        'Real Property — Deed locations are pulled automatically from properties you\'ve entered in Assets. Mortgage documents have their own entry.',
        'Financial Accounts — Brokerage statements and retirement account beneficiary designations.',
        'Tax Records — Prior returns and property tax records.',
        'Business Interests — Buy-sell agreements and operating agreements.',
        'Vehicle Titles — Pulled automatically from vehicles you\'ve entered in Assets.',
        'Safe Deposit Box — Box location and key location.',
        'Personal Identity & Vital Records — Birth certificates, marriage certificates, passports, Social Security cards, and more.',
        'Funeral & Cemetery — Pre-paid funeral contracts and burial/cremation instructions.',
        'Military — DD-214 and VA benefit letters.',
        'Other — A catch-all for any documents not listed above. You can add as many rows as needed.',
      ],
    },
    {
      title: 'Digital Copy Cross-Reference',
      body: 'If you\'ve already uploaded a digital copy of a document to the Documents Vault, you\'ll see a blue eye icon next to that item — click it to view the uploaded file. If no digital copy exists, you\'ll see a cloud-upload icon that lets you upload one directly from this screen.',
    },
    {
      title: 'Tips',
      bullets: [
        'Be specific about locations: "fireproof safe in master bedroom closet" is more useful than "at home".',
        'If you keep originals at your attorney\'s office, note which attorney and their contact info.',
        'Changes are auto-saved after you stop typing, or use the Save button.',
        'The Other category lets you add custom entries for documents unique to your situation.',
      ],
    },
  ],
};

// ─── 8. Family & Dependents (Beneficiaries) ──────────────────────────────────

export const familyDependentsHelp: HelpContent = {
  title: 'Family & Dependents — Help',
  icon: <FamilyRestroomIcon sx={{ fontSize: 26 }} />,
  accentColor: '#00695c',
  sections: [
    {
      title: 'Overview',
      body: 'This section records your children, other beneficiaries, charitable beneficiaries, and dependents (including pets). The data here is used extensively in estate planning — it feeds into beneficiary designations, distribution plans, the Estate Planning Overview report, and the Family Briefing Report.',
    },
    {
      title: 'Children',
      body: 'Add each of your children with the following details:',
      bullets: [
        'Full name, date of birth, and age.',
        'Relationship (biological, adopted, step-child, etc.).',
        'Marital status and whether they have children of their own.',
        'Address and contact information.',
        'Comments or special notes.',
        'The system automatically detects minors and flags them for guardianship planning.',
      ],
    },
    {
      title: 'Other Beneficiaries',
      body: 'Record any non-child beneficiaries you want to include in your estate plan:',
      bullets: [
        'Grandchildren, siblings, nieces/nephews, friends, or other individuals.',
        'Name, relationship, age, and contact information.',
        'These individuals can be referenced in distribution plans and specific gift designations.',
      ],
    },
    {
      title: 'Charities',
      body: 'If you plan to leave charitable gifts, record the organizations here:',
      bullets: [
        'Organization name and address.',
        'Gift amount or percentage.',
        'These feed into the Estate Planning Overview report under charitable giving.',
      ],
    },
    {
      title: 'Pet Care',
      body: 'If you have pets that need care planning:',
      bullets: [
        'Indicate whether you have pets that need continued care.',
        'Record each pet\'s name, species, breed, age, and special needs.',
        'Designate a preferred caretaker and alternate.',
        'Specify any funds set aside for pet care.',
        'This ensures your pets are cared for according to your wishes.',
      ],
    },
  ],
};

// ─── 9. Insurance Coverage ───────────────────────────────────────────────────

export const insuranceCoverageHelp: HelpContent = {
  title: 'Insurance Coverage — Help',
  icon: <SecurityIcon sx={{ fontSize: 26 }} />,
  accentColor: '#0d47a1',
  sections: [
    {
      title: 'Overview',
      body: 'This section captures all of your insurance policies in one place. Having a complete insurance inventory is critical — your family needs to know what coverage exists, who the providers are, and how to file claims. This data feeds directly into the Insurance Summary report.',
    },
    {
      title: 'Insurance Types',
      body: 'Add policies across the following categories:',
      bullets: [
        'Medical Insurance — Health insurance policies, Medicare, Medicaid, and supplemental coverage. Includes provider, policy number, monthly cost, and coverage details.',
        'Vehicle Insurance — Auto, motorcycle, boat, or RV coverage with liability limits, collision/comprehensive details, and deductibles.',
        'Homeowners / Renters Insurance — Property coverage with policy limits and contact information.',
        'Long-Term Care Insurance — LTC policies with daily benefit amount, benefit period, maximum coverage, and care level.',
        'Disability Insurance — Short-term and long-term disability coverage details.',
        'Life Insurance — Separate from the Financial Life section; focuses on the insurance coverage aspect rather than asset value.',
        'Umbrella Insurance — Excess liability coverage.',
        'Other — Any additional coverage types.',
      ],
    },
    {
      title: 'Client & Spouse',
      body: 'If married or partnered, you can toggle between Client and Spouse tabs to record policies for each person separately. Some policies may cover both — just record them under the primary policyholder.',
    },
    {
      title: 'Policy Details',
      body: 'For each policy, you can record:',
      bullets: [
        'Insurance provider/company and policy number.',
        'Coverage type and monthly or annual cost.',
        'Agent/contact name, address, phone, and email.',
        'Liability limits, deductibles, and special coverage details.',
        'Notes about the policy.',
      ],
    },
    {
      title: 'Medical Insurance Details',
      body: 'The medical insurance section includes additional fields:',
      bullets: [
        'Medicare Part B deduction amount and coverage type (Original Medicare, Medicare Advantage).',
        'Medicare plan name and supplemental (Medigap) coverage.',
        'Private insurance description and cost.',
        'Other insurance (VA, employer, marketplace) details.',
      ],
    },
  ],
};

// ─── 10. End of Life ─────────────────────────────────────────────────────────

export const endOfLifeHelp: HelpContent = {
  title: 'End of Life Preferences — Help',
  icon: <VolunteerActivismIcon sx={{ fontSize: 26 }} />,
  accentColor: '#6a1b9a',
  sections: [
    {
      title: 'Overview',
      body: 'This section captures your detailed end-of-life preferences and instructions. While the topic can be difficult, documenting these wishes is one of the most important gifts you can give your family — it removes the burden of guessing what you would have wanted and ensures your final arrangements reflect your true wishes.',
    },
    {
      title: 'Funeral Preferences',
      body: 'Specify your preferences for funeral services:',
      bullets: [
        'Type of service (traditional, celebration of life, memorial, graveside, etc.).',
        'Preferred funeral home.',
        'Whether you have prepaid arrangements.',
        'Music, readings, or speakers you\'d like included.',
        'Visitation/viewing preferences.',
        'Flower preferences or charitable donation alternatives.',
      ],
    },
    {
      title: 'Disposition Instructions',
      body: 'Document your wishes for final disposition:',
      bullets: [
        'Burial vs. cremation preference.',
        'Preferred cemetery or columbarium.',
        'Specific plot or niche if already purchased.',
        'Casket or urn preferences.',
        'Any special instructions (scatter ashes, specific location, etc.).',
      ],
    },
    {
      title: 'Memorial Preferences',
      body: 'Describe how you\'d like to be remembered:',
      bullets: [
        'Memorial donations in lieu of flowers.',
        'Scholarship funds or charitable gifts.',
        'Memorial markers, plaques, or dedications.',
        'Anniversary observances or traditions you\'d like continued.',
      ],
    },
    {
      title: 'Obituary Information',
      body: 'Provide details for your obituary — preferred name, biographical highlights, survivors to mention, and any specific wording or tone you\'d like. This supplements the Legacy section\'s obituary tab with specific factual details.',
    },
    {
      title: 'Final Wishes',
      body: 'Any other specific instructions or wishes:',
      bullets: [
        'Personal items to be given to specific people.',
        'Digital accounts to be deleted or memorialized.',
        'Messages to be delivered.',
        'Anything else your family should know.',
      ],
    },
  ],
};

// ─── 11. Care Decisions (Care Preferences) ───────────────────────────────────

export const careDecisionsHelp: HelpContent = {
  title: 'Care Decisions — Help',
  icon: <HealingIcon sx={{ fontSize: 26 }} />,
  accentColor: '#bf360c',
  sections: [
    {
      title: 'Overview',
      body: 'This section documents your preferences for how you want to be cared for if you become unable to make decisions for yourself. Your responses guide your health care agent, family members, and caregivers in honoring your wishes. This data feeds into the "What To Do If I Need Care" report.',
    },
    {
      title: 'Health & Wellness',
      body: 'Express your preferences for maintaining health and well-being:',
      bullets: [
        'Diet and nutrition preferences.',
        'Exercise and physical activity preferences.',
        'Sleep habits and routines.',
        'Alternative or complementary therapies you value.',
        'Daily routines that are important to you.',
      ],
    },
    {
      title: 'End-of-Life Care',
      body: 'Document your medical care preferences for serious illness:',
      bullets: [
        'Pain management preferences (aggressive treatment vs. comfort-focused).',
        'Artificial nutrition and hydration preferences.',
        'Resuscitation wishes (DNR status).',
        'Ventilator and life support preferences.',
        'Hospice care preferences.',
        'Organ and tissue donation wishes.',
      ],
    },
    {
      title: 'Personal Care',
      body: 'Specify how you want your day-to-day personal care handled:',
      bullets: [
        'Hygiene and grooming preferences.',
        'Clothing preferences and appearance.',
        'Social interaction preferences.',
        'Entertainment and activity preferences.',
        'Privacy and modesty preferences.',
      ],
    },
    {
      title: 'Spiritual & Emotional',
      body: 'Record your spiritual and emotional care wishes:',
      bullets: [
        'Religious or spiritual practices to be observed.',
        'Clergy or spiritual advisor to contact.',
        'Prayer, meditation, or reading preferences.',
        'Music or environmental preferences for comfort.',
        'Visitation preferences — who you want (and don\'t want) around you.',
      ],
    },
    {
      title: 'How It Works',
      body: 'Click each category button to open a form with specific questions. Your answers are saved and displayed in a table below. Each category shows your completion progress (e.g., "3/8 answered"). You can return to any category to update your responses at any time.',
    },
  ],
};

// ─── 12. Digital Life ────────────────────────────────────────────────────────

export const digitalLifeHelp: HelpContent = {
  title: 'How the Digital Life Section Works',
  icon: <FingerprintIcon sx={{ fontSize: 26 }} />,
  accentColor: '#00695c',
  sections: [
    {
      title: 'Overview',
      body: 'The Digital Life section is your secure space for organizing everything related to your online presence. The centerpiece is the Credentials Vault, which lets you store online account logins and access information so that your trusted representatives (a Power of Attorney agent or an Executor / Trustee) can manage your digital affairs if you become incapacitated or after your passing.',
    },
    {
      title: 'The Credentials Vault',
      body: 'When you first open the Credentials tab, you will be asked to create a Vault Master Passphrase. This passphrase is used to encrypt your sensitive data (passwords, PINs, security answers, backup codes) directly in your browser before anything is sent to the server. MyLifeFolio never sees or stores your actual passwords in readable form. Each time you return to the Credentials tab in a new session, you will need to re-enter your passphrase to unlock the vault. You can lock the vault at any time using the "Lock Vault" button.',
    },
    {
      title: 'Recovery Key',
      body: 'During setup, you will be given a one-time Recovery Key — a long, random code that can restore access to your vault if you forget your passphrase. This key is shown only once. Print it or write it down and store it in a safe place (e.g., a home safe or safe deposit box). If you lose both your passphrase and your recovery key, your encrypted data cannot be recovered by anyone, including MyLifeFolio support.',
    },
    {
      title: 'How Encryption Works',
      bullets: [
        'Your passphrase is used to derive a 256-bit encryption key using PBKDF2 (100,000 iterations) — an industry-standard key stretching algorithm.',
        'Sensitive fields (password, PIN, security Q&A, backup codes, authenticator notes, recovery email) are encrypted with AES-GCM 256-bit encryption in your browser before being stored.',
        'Non-sensitive fields (account name, platform, URL, access control settings, notes) are stored as readable text so the system can display them without unlocking.',
        'The encryption key exists only in your browser\'s memory while the vault is unlocked and is never transmitted or stored on the server.',
      ],
    },
    {
      title: 'Access Controls: POA Agent & Executor',
      body: 'For each account you store, you can independently designate whether your Power of Attorney Agent or your Executor / Trustee should have access:',
      bullets: [
        'POA Agent — Someone who may need to manage your accounts while you are alive but incapacitated. You can provide specific instructions for what they should do.',
        'Executor / Trustee — Someone who handles your affairs after your death. You can specify an action for each account: memorialize, delete, transfer, or download data first.',
      ],
    },
    {
      title: 'What to Store Here',
      body: 'This vault is designed as a legacy reference — a place where your executor, trustee, or POA agent can find the accounts and credentials they need to act on your behalf. It is not intended to replace a day-to-day password manager. We recommend storing credentials for accounts that matter most in an emergency or estate scenario: banking and financial accounts, email, utilities, insurance portals, government accounts (Social Security, VA), and any account with automatic billing or subscriptions that would need to be cancelled.',
    },
    {
      title: 'Additional Tabs',
      body: 'The Digital Life section also includes tabs for Digital Assets & Cryptocurrency (tracking crypto wallets, NFTs, domain names, and other digital property) and Subscriptions & Recurring Services (documenting ongoing charges that need to be managed or cancelled).',
    },
  ],
};

// ─── 13. Reports ─────────────────────────────────────────────────────────────

export const reportsHelp: HelpContent = {
  title: 'Reports — Help',
  icon: <LibraryBooksIcon sx={{ fontSize: 26 }} />,
  accentColor: '#455a64',
  sections: [
    {
      title: 'Overview',
      body: 'The Reports section generates comprehensive, print-ready reports from the data you\'ve entered across your entire Folio. These reports are designed to be shared with family members, advisors, and fiduciaries. Each report pulls its data in real time — as you update your Folio, the reports automatically reflect the latest information.',
    },
    {
      title: 'Available Reports',
      body: 'Click any report in the left sidebar to preview it. The following reports are available:',
      bullets: [
        'Emergency Medical Summary — Critical health information for first responders: medications, allergies, conditions, providers, medical equipment, and emergency contacts.',
        'Family Contact Sheet — Complete directory of family members, children, dependents, beneficiaries, advisors, and friends/neighbors with contact details.',
        'Asset Inventory — Full catalog of all assets: bank accounts, investments, retirement accounts, real estate, vehicles, life insurance, business interests, digital assets, and personal property with totals.',
        'Insurance Summary — All insurance policies: medical, property, auto, long-term care, disability, life, and umbrella coverage with provider contacts.',
        'Advisor Directory — Professional advisors (attorneys, accountants, financial planners, etc.), medical providers, and pharmacies with contact information.',
        'Estate Planning Overview — Current estate documents, fiduciary appointments, beneficiary designations, distribution plans, specific gifts, cash gifts, lifetime gifts, and charitable giving.',
        'What To Do If I Need Care — Comprehensive care guide: medical information, insurance coverage, income sources, care preferences, legal documents, and provider contacts.',
        'Funeral Instructions — End-of-life preferences, burial/cremation wishes, memorial preferences, obituary information, charitable wishes, and personal letters.',
        'What To Do If I Die — Step-by-step checklist for the family: immediate actions, legal contacts, financial accounts, insurance claims, subscription cancellations, and digital asset management.',
        'Digital Life Summary — Digital assets with values, active subscriptions with costs (monthly and annual estimates), and inactive subscriptions to cancel.',
        'Family Briefing Report — Comprehensive overview combining estate plans, financial picture, insurance coverage, income sources, beneficiaries, and key contacts into a single family reference document.',
      ],
    },
    {
      title: 'Printing & Sharing',
      body: 'Each report includes a Print button in the header. Reports are styled for clean printing with proper page breaks, headers, and formatting. You can also share reports through the Family Access Portal to give selected family members view-only access to specific reports.',
    },
    {
      title: 'Tips',
      bullets: [
        'Reports are only as complete as the data you\'ve entered — empty sections will show "No data recorded" messages.',
        'Review reports periodically to spot gaps in your Folio.',
        'The Family Briefing Report is the most comprehensive — it\'s a good starting point for ensuring your family has everything they need.',
        'Print or save key reports and store physical copies with your estate planning documents.',
      ],
    },
  ],
};
