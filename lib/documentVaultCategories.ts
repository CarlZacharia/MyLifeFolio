import React from 'react';
import GavelIcon from '@mui/icons-material/Gavel';
import HomeWorkIcon from '@mui/icons-material/HomeWork';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import ShieldIcon from '@mui/icons-material/Shield';
import BadgeIcon from '@mui/icons-material/Badge';
import MilitaryTechIcon from '@mui/icons-material/MilitaryTech';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import Diversity3Icon from '@mui/icons-material/Diversity3';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import DevicesIcon from '@mui/icons-material/Devices';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';

export interface VaultCategoryDef {
  id: string;
  label: string;
  icon: React.ElementType;
  examples: string[];
  accentColor: string;
  sensitive?: boolean;
  note?: string;
}

export const VAULT_CATEGORIES: VaultCategoryDef[] = [
  {
    id: 'estate-planning-legal',
    label: 'Estate Planning & Legal',
    icon: GavelIcon,
    examples: ['Will', 'Trust', 'Power of Attorney', 'Advance Directive', 'Personal Property Memorandum'],
    accentColor: '#7b2cbf',
    note: 'Personal Property Memorandum (PPM) is a signed printed document generated from within the system. Upload the signed copy here.',
  },
  {
    id: 'real-estate-property',
    label: 'Real Estate & Property',
    icon: HomeWorkIcon,
    examples: ['Deed', 'Mortgage', 'Title Insurance', 'Property Tax Records'],
    accentColor: '#e07a2f',
  },
  {
    id: 'financial-accounts',
    label: 'Financial & Accounts',
    icon: AccountBalanceWalletIcon,
    examples: ['Bank Statements', 'Investment Accounts', 'Retirement Documents', 'Savings Bonds'],
    accentColor: '#0a5c36',
  },
  {
    id: 'insurance',
    label: 'Insurance',
    icon: ShieldIcon,
    examples: ['Life Insurance', 'Long-Term Care', 'Health Insurance', 'Medicare'],
    accentColor: '#2e7d32',
  },
  {
    id: 'personal-identity',
    label: 'Personal Identity',
    icon: BadgeIcon,
    examples: ['Birth Certificate', 'Passport', 'Social Security Card', 'Marriage Certificate'],
    accentColor: '#c62828',
    sensitive: true,
  },
  {
    id: 'military-government',
    label: 'Military & Government',
    icon: MilitaryTechIcon,
    examples: ['DD-214', 'Service Records', 'Military Awards', 'Veterans Benefits'],
    accentColor: '#1e3a5f',
  },
  {
    id: 'medical-health',
    label: 'Medical & Health',
    icon: LocalHospitalIcon,
    examples: ['Medical Records', 'Medication List', 'Medicare Documents', 'Organ Donor Registration'],
    accentColor: '#0077b6',
  },
  {
    id: 'family-genealogy',
    label: 'Family & Genealogy',
    icon: Diversity3Icon,
    examples: ['Family Photos', 'Family Tree', 'Immigration Records', 'Personal Letters'],
    accentColor: '#d4497a',
  },
  {
    id: 'personal-legacy-memorabilia',
    label: 'Personal Legacy & Memorabilia',
    icon: EmojiEventsIcon,
    examples: ['Newspaper Articles', 'Awards', 'Published Works', 'Announcements'],
    accentColor: '#c9a227',
  },
  {
    id: 'digital-assets',
    label: 'Digital Assets',
    icon: DevicesIcon,
    examples: ['Password Instructions', 'Social Media Wishes', 'Online Accounts'],
    accentColor: '#455a64',
    note: 'Do not store actual passwords here — only instructions for your executor on how to access or close accounts.',
  },
  {
    id: 'other',
    label: 'Other',
    icon: FolderOpenIcon,
    examples: ['Miscellaneous documents not fitting other categories'],
    accentColor: '#6b5c47',
  },
];

export const VAULT_CATEGORY_MAP = Object.fromEntries(
  VAULT_CATEGORIES.map((c) => [c.id, c])
);

export type SensitivityLevel = 'normal' | 'restricted' | 'highly_sensitive';

export const SENSITIVITY_LABELS: Record<SensitivityLevel, string> = {
  normal: 'Normal',
  restricted: 'Restricted',
  highly_sensitive: 'Highly Sensitive',
};

export const ACCEPTED_FILE_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/heic',
  'image/webp',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
];

export const ACCEPTED_EXTENSIONS = '.pdf,.jpg,.jpeg,.png,.heic,.webp,.doc,.docx,.txt';

export const MAX_FILE_SIZE_MB = 25;
export const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
