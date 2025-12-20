'use client';

import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  IconButton,
  Link,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';

// Help content types
export type HelpContentType = 'Text' | 'Video' | 'Link';

// Video provider types
export type VideoProvider = 'youtube' | 'vimeo' | 'mp4' | 'other';

export interface HelpAnswer {
  id: number;
  type: HelpContentType;
  title: string;
  text: string; // Can contain HTML - shown below video for Video type
  videoUrl?: string; // For Video type: YouTube, Vimeo, or direct MP4 URL
  videoProvider?: VideoProvider; // Optional: auto-detected if not provided
  linkUrl?: string;
  linkText?: string;
}

// Helper to detect video provider from URL
const detectVideoProvider = (url: string): VideoProvider => {
  if (url.includes('youtube.com') || url.includes('youtu.be')) {
    return 'youtube';
  }
  if (url.includes('vimeo.com')) {
    return 'vimeo';
  }
  if (url.endsWith('.mp4') || url.endsWith('.webm') || url.endsWith('.ogg')) {
    return 'mp4';
  }
  return 'other';
};

// Extract YouTube video ID from various URL formats
const getYouTubeId = (url: string): string | null => {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/v\/([^&\n?#]+)/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
};

// Extract Vimeo video ID
const getVimeoId = (url: string): string | null => {
  const match = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  return match ? match[1] : null;
};

// Help answers database - add your help content here
export const helpAnswers: HelpAnswer[] = [
  {
    id: 1,
    type: 'Text',
    title: 'Full Legal Name',
    text: `
      <p>Enter your <strong>complete legal name</strong> exactly as it appears on official documents such as:</p>
      <ul>
        <li>Driver's license or state ID</li>
        <li>Passport</li>
        <li>Social Security card</li>
        <li>Birth certificate</li>
      </ul>
      <p>This includes your first name, middle name(s), and last name. Do not use nicknames or abbreviations.</p>
      <p><em>Example: John Michael Smith Jr.</em></p>
    `,
  },
  {
    id: 2,
    type: 'Text',
    title: 'Also Known As (AKA)',
    text: `
      <p>List any <strong>other names</strong> you are known by or have used in the past, including:</p>
      <ul>
        <li><strong>Maiden name</strong> - Your family name before marriage</li>
        <li><strong>Previous married names</strong> - Names from prior marriages</li>
        <li><strong>Nicknames</strong> - Names commonly used by family and friends</li>
        <li><strong>Professional names</strong> - Names used in business or entertainment</li>
        <li><strong>Legal name changes</strong> - Any previous legal names</li>
      </ul>
      <p>This helps ensure all your assets can be properly identified and transferred.</p>
      <p><em>Example: Jane Doe (maiden), Jenny Smith (nickname)</em></p>
    `,
  },
  {
    id: 3,
    type: 'Text',
    title: 'Mailing Address',
    text: `
      <p>Enter your <strong>current mailing address</strong> where you receive official correspondence.</p>
      <p>Include:</p>
      <ul>
        <li>Street address or P.O. Box</li>
        <li>Apartment/Unit number (if applicable)</li>
        <li>City, State, and ZIP code</li>
      </ul>
      <p>This address will be used for all legal documents and correspondence related to your estate plan.</p>
    `,
  },
  {
    id: 4,
    type: 'Text',
    title: 'Living Trust',
    text: `
      <p>A <strong>Revocable Living Trust</strong> is a legal document that:</p>
      <ul>
        <li>Holds title to your assets during your lifetime</li>
        <li>Allows you to maintain full control as the trustee</li>
        <li>Can be modified or revoked at any time</li>
        <li>Avoids probate upon your death</li>
        <li>Provides for management of assets if you become incapacitated</li>
      </ul>
      <p>If you have an existing living trust, we need to know about it to properly coordinate your estate plan.</p>
    `,
  },
  {
    id: 5,
    type: 'Text',
    title: 'Irrevocable Trust',
    text: `
      <p>An <strong>Irrevocable Trust</strong> is a legal document that:</p>
      <ul>
        <li>Generally cannot be modified or revoked once created</li>
        <li>Removes assets from your taxable estate</li>
        <li>May provide asset protection benefits</li>
        <li>Is often used for life insurance, Medicaid planning, or tax planning</li>
      </ul>
      <p>Common types include:</p>
      <ul>
        <li>Irrevocable Life Insurance Trust (ILIT)</li>
        <li>Medicaid Asset Protection Trust</li>
        <li>Charitable Remainder Trust</li>
        <li>Special Needs Trust</li>
      </ul>
    `,
  },
  // Additional Personal Data field help (IDs 6-20)
  {
    id: 6,
    type: 'Text',
    title: 'Cell Phone',
    text: `
      <p>Enter your <strong>primary mobile phone number</strong>.</p>
      <p>This will be used for:</p>
      <ul>
        <li>Primary contact for urgent matters</li>
        <li>Text message notifications if applicable</li>
        <li>Two-factor authentication if needed</li>
      </ul>
    `,
  },
  {
    id: 7,
    type: 'Text',
    title: 'Home Phone',
    text: `
      <p>Enter your <strong>home landline number</strong> if you have one.</p>
      <p>This provides an alternative contact method if your cell phone is unavailable.</p>
    `,
  },
  {
    id: 8,
    type: 'Text',
    title: 'Work Phone',
    text: `
      <p>Enter your <strong>work or business phone number</strong>.</p>
      <p>This can be useful for daytime contact during business hours.</p>
    `,
  },
  {
    id: 9,
    type: 'Text',
    title: 'Sex',
    text: `
      <p>Select your <strong>biological sex</strong> as recorded on legal documents.</p>
      <p>This information may be required for certain legal documents and identification purposes.</p>
    `,
  },
  {
    id: 10,
    type: 'Text',
    title: 'Email Address',
    text: `
      <p>Enter your <strong>primary email address</strong>.</p>
      <p>This will be used for:</p>
      <ul>
        <li>Document delivery and correspondence</li>
        <li>Appointment reminders</li>
        <li>Important notifications about your estate plan</li>
      </ul>
      <p>Please ensure this email is checked regularly and is secure.</p>
    `,
  },
  {
    id: 11,
    type: 'Text',
    title: 'Birth Date',
    text: `
      <p>Enter your <strong>date of birth</strong> as shown on your birth certificate or other legal documents.</p>
      <p>Your birth date is important for:</p>
      <ul>
        <li>Determining eligibility for certain estate planning strategies</li>
        <li>Life expectancy calculations for retirement planning</li>
        <li>Legal document requirements</li>
      </ul>
    `,
  },
  {
    id: 12,
    type: 'Text',
    title: 'Marital Status',
    text: `
      <p>Select your <strong>current marital status</strong>.</p>
      <p>Your marital status affects:</p>
      <ul>
        <li>How assets are distributed</li>
        <li>Tax planning strategies</li>
        <li>Spousal rights and protections</li>
        <li>Beneficiary designations</li>
      </ul>
      <p>Choose the option that best describes your current legal relationship status.</p>
    `,
  },
  {
    id: 13,
    type: 'Text',
    title: 'Number of Children',
    text: `
      <p>Enter the <strong>total number of children</strong> you have, including:</p>
      <ul>
        <li>Biological children</li>
        <li>Legally adopted children</li>
        <li>Stepchildren you wish to include</li>
      </ul>
      <p>This helps us plan for guardianship provisions and inheritance distribution.</p>
    `,
  },
  {
    id: 14,
    type: 'Text',
    title: 'Children from Prior Relationship',
    text: `
      <p>Indicate if you have <strong>children from a previous marriage or relationship</strong>.</p>
      <p>This is important because:</p>
      <ul>
        <li>It affects how assets may be distributed</li>
        <li>May require special provisions to protect their inheritance</li>
        <li>Could impact trust structures</li>
      </ul>
    `,
  },
  {
    id: 15,
    type: 'Text',
    title: 'Children Together',
    text: `
      <p>Enter the number of <strong>children you and your spouse/partner have together</strong>.</p>
      <p>This helps distinguish between joint children and children from prior relationships for planning purposes.</p>
    `,
  },
  {
    id: 16,
    type: 'Text',
    title: 'Prior Marriage',
    text: `
      <p>Indicate if your <strong>spouse has been married before</strong>.</p>
      <p>Prior marriages may affect:</p>
      <ul>
        <li>Existing obligations (alimony, child support)</li>
        <li>Inheritance rights of children from prior marriages</li>
        <li>Asset protection strategies</li>
      </ul>
    `,
  },
  // Spouse/Partner Fields (IDs 17-30)
  {
    id: 17,
    type: 'Text',
    title: 'Spouse Full Legal Name',
    text: `
      <p>Enter your spouse's <strong>complete legal name</strong> exactly as it appears on official documents such as:</p>
      <ul>
        <li>Driver's license or state ID</li>
        <li>Passport</li>
        <li>Social Security card</li>
        <li>Marriage certificate</li>
      </ul>
      <p>This includes first name, middle name(s), and last name. Do not use nicknames or abbreviations.</p>
    `,
  },
  {
    id: 18,
    type: 'Text',
    title: 'Spouse Also Known As (AKA)',
    text: `
      <p>List any <strong>other names</strong> your spouse is known by or has used in the past, including:</p>
      <ul>
        <li><strong>Maiden name</strong> - Family name before marriage</li>
        <li><strong>Previous married names</strong> - Names from prior marriages</li>
        <li><strong>Nicknames</strong> - Names commonly used by family and friends</li>
        <li><strong>Professional names</strong> - Names used in business</li>
      </ul>
      <p>This helps ensure all assets in your spouse's name can be properly identified.</p>
    `,
  },
  {
    id: 19,
    type: 'Text',
    title: 'Spouse Mailing Address',
    text: `
      <p>Enter your spouse's <strong>mailing address</strong> if different from yours.</p>
      <p>Leave this blank if your spouse receives mail at the same address as you.</p>
      <p>A separate address may be needed if your spouse:</p>
      <ul>
        <li>Works in a different location</li>
        <li>Maintains a separate residence</li>
        <li>Prefers to receive correspondence elsewhere</li>
      </ul>
    `,
  },
  {
    id: 20,
    type: 'Text',
    title: 'Spouse Cell Phone',
    text: `
      <p>Enter your spouse's <strong>primary mobile phone number</strong>.</p>
      <p>This provides a direct contact for your spouse for:</p>
      <ul>
        <li>Document signing appointments</li>
        <li>Urgent matters requiring their input</li>
        <li>Coordination of estate planning activities</li>
      </ul>
    `,
  },
  {
    id: 21,
    type: 'Text',
    title: 'Spouse Home Phone',
    text: `
      <p>Enter your spouse's <strong>home landline number</strong> if they have one.</p>
      <p>This provides an alternative contact method if their cell phone is unavailable.</p>
    `,
  },
  {
    id: 22,
    type: 'Text',
    title: 'Spouse Work Phone',
    text: `
      <p>Enter your spouse's <strong>work or business phone number</strong>.</p>
      <p>This can be useful for daytime contact during business hours.</p>
    `,
  },
  {
    id: 23,
    type: 'Text',
    title: 'Spouse Sex',
    text: `
      <p>Select your spouse's <strong>biological sex</strong> as recorded on legal documents.</p>
      <p>This information may be required for certain legal documents and identification purposes.</p>
    `,
  },
  {
    id: 24,
    type: 'Text',
    title: 'Spouse Email Address',
    text: `
      <p>Enter your spouse's <strong>primary email address</strong>.</p>
      <p>This will be used for:</p>
      <ul>
        <li>Document delivery and correspondence</li>
        <li>Appointment reminders</li>
        <li>Important notifications about your joint estate plan</li>
      </ul>
    `,
  },
  {
    id: 25,
    type: 'Text',
    title: 'Spouse Birth Date',
    text: `
      <p>Enter your spouse's <strong>date of birth</strong> as shown on legal documents.</p>
      <p>Your spouse's birth date is important for:</p>
      <ul>
        <li>Joint estate planning strategies</li>
        <li>Life expectancy calculations</li>
        <li>Retirement and survivor benefit planning</li>
        <li>Legal document requirements</li>
      </ul>
    `,
  },
  {
    id: 26,
    type: 'Text',
    title: 'Spouse Children from Prior Relationship',
    text: `
      <p>Indicate if your spouse has <strong>children from a previous marriage or relationship</strong>.</p>
      <p>This is important because:</p>
      <ul>
        <li>May affect how assets are distributed</li>
        <li>Could require special provisions in your estate plan</li>
        <li>May impact inheritance rights and trust structures</li>
        <li>Important for blended family planning</li>
      </ul>
    `,
  },
  {
    id: 27,
    type: 'Text',
    title: 'Spouse Living Trust',
    text: `
      <p>Indicate if your spouse has an existing <strong>Revocable Living Trust</strong>.</p>
      <p>If your spouse has a separate trust, we need to know about it to:</p>
      <ul>
        <li>Coordinate both trusts for joint planning</li>
        <li>Ensure proper asset titling</li>
        <li>Avoid conflicts between trust provisions</li>
        <li>Consider whether to merge or keep trusts separate</li>
      </ul>
    `,
  },
  {
    id: 28,
    type: 'Text',
    title: 'Spouse Irrevocable Trust',
    text: `
      <p>Indicate if your spouse has an existing <strong>Irrevocable Trust</strong>.</p>
      <p>Irrevocable trusts your spouse may have include:</p>
      <ul>
        <li>Life Insurance Trust (ILIT)</li>
        <li>Medicaid Asset Protection Trust</li>
        <li>Special Needs Trust</li>
        <li>Charitable Trust</li>
      </ul>
      <p>Understanding existing irrevocable trusts helps us coordinate your overall estate plan.</p>
    `,
  },
  // Children Section Fields (IDs 30-45)
  {
    id: 30,
    type: 'Text',
    title: 'Children in Good Health',
    text: `
      <p>This question asks about the <strong>overall health status</strong> of your children.</p>
      <p>If any child has significant health issues, this may affect:</p>
      <ul>
        <li>Special needs trust planning</li>
        <li>Healthcare proxy designations</li>
        <li>Distribution timing and conditions</li>
        <li>Guardianship considerations for adult disabled children</li>
      </ul>
      <p>Please provide details if any child has chronic illness, disability, or other health concerns.</p>
    `,
  },
  {
    id: 31,
    type: 'Text',
    title: 'Children Under 21',
    text: `
      <p>This identifies whether you have any <strong>minor children</strong>.</p>
      <p>If you have children under 21, we need to address:</p>
      <ul>
        <li><strong>Guardianship</strong> - Who will care for them if you pass away</li>
        <li><strong>Trust provisions</strong> - How their inheritance should be managed</li>
        <li><strong>Age of distribution</strong> - When they should receive their inheritance</li>
        <li><strong>Education funding</strong> - Provisions for school expenses</li>
      </ul>
    `,
  },
  {
    id: 32,
    type: 'Text',
    title: 'Children Disabled or Blind',
    text: `
      <p>This question identifies children with <strong>disabilities</strong> that may require special planning.</p>
      <p>If a child is disabled or blind:</p>
      <ul>
        <li><strong>Special Needs Trust</strong> may be needed to preserve government benefits</li>
        <li>Direct inheritances could disqualify them from SSI or Medicaid</li>
        <li>Careful trust language is required to provide for them without affecting benefits</li>
        <li>A trustee with experience managing special needs trusts may be advisable</li>
      </ul>
    `,
  },
  {
    id: 33,
    type: 'Text',
    title: 'Children Education Complete',
    text: `
      <p>This helps us understand if <strong>education funding</strong> should be part of your plan.</p>
      <p>If children are still in school or planning higher education:</p>
      <ul>
        <li>We may recommend specific provisions for education expenses</li>
        <li>Trust distributions can be structured around educational milestones</li>
        <li>529 plans and education savings may be coordinated with your estate plan</li>
      </ul>
    `,
  },
  {
    id: 34,
    type: 'Text',
    title: 'Children Marital Problems',
    text: `
      <p>This question addresses whether any children are experiencing <strong>marital difficulties</strong>.</p>
      <p>If a child has marital problems or is going through divorce:</p>
      <ul>
        <li>Assets inherited outright could become marital property subject to division</li>
        <li>A <strong>spendthrift trust</strong> can protect inheritances from divorce claims</li>
        <li>Trust distributions can be structured to protect assets from spouses</li>
      </ul>
    `,
  },
  {
    id: 35,
    type: 'Text',
    title: 'Children Receiving SSI/Government Benefits',
    text: `
      <p>This identifies children receiving <strong>government assistance</strong> such as SSI or Medicaid.</p>
      <p><strong>Important:</strong> Direct inheritances can disqualify beneficiaries from:</p>
      <ul>
        <li>Supplemental Security Income (SSI)</li>
        <li>Medicaid</li>
        <li>Housing assistance</li>
        <li>Food assistance programs</li>
      </ul>
      <p>A <strong>Special Needs Trust</strong> can supplement government benefits without causing disqualification.</p>
    `,
  },
  {
    id: 36,
    type: 'Text',
    title: 'Drug Addiction',
    text: `
      <p>This question identifies children with <strong>substance abuse issues</strong>.</p>
      <p>If a child struggles with drug addiction:</p>
      <ul>
        <li>Direct cash inheritances may not be appropriate</li>
        <li>A <strong>discretionary trust</strong> allows a trustee to manage distributions</li>
        <li>Incentive provisions can encourage recovery and treatment</li>
        <li>The trustee can pay for necessities directly rather than providing cash</li>
      </ul>
    `,
  },
  {
    id: 37,
    type: 'Text',
    title: 'Alcoholism',
    text: `
      <p>This question identifies children with <strong>alcohol dependency issues</strong>.</p>
      <p>Similar to drug addiction, alcoholism may require:</p>
      <ul>
        <li>Structured trust distributions instead of lump sums</li>
        <li>A responsible trustee to manage funds</li>
        <li>Provisions for treatment and rehabilitation</li>
        <li>Delayed distributions tied to sobriety milestones</li>
      </ul>
    `,
  },
  {
    id: 38,
    type: 'Text',
    title: 'Financial Problems (Spendthrift)',
    text: `
      <p>This identifies children who may have <strong>difficulty managing money</strong>.</p>
      <p>If a child has financial problems or is a spendthrift:</p>
      <ul>
        <li>Lump sum inheritances may be quickly depleted</li>
        <li>A <strong>spendthrift trust</strong> protects assets from creditors and poor decisions</li>
        <li>Distributions can be staggered over time (e.g., at ages 25, 30, 35)</li>
        <li>A trustee can manage funds and make distributions for specific needs</li>
      </ul>
    `,
  },
  {
    id: 39,
    type: 'Text',
    title: 'Other Concerns',
    text: `
      <p>Use this field to note any <strong>other concerns</strong> about your children that may affect estate planning.</p>
      <p>Examples might include:</p>
      <ul>
        <li>Pending legal issues or lawsuits</li>
        <li>Career instability</li>
        <li>Relationship with specific family members</li>
        <li>Religious or lifestyle considerations</li>
        <li>Any unique circumstances we should be aware of</li>
      </ul>
    `,
  },
  // Section Sub-headers with Video (IDs 50-60)
  {
    id: 50,
    type: 'Video',
    title: 'Existing Trusts',
    videoUrl: 'https://www.youtube.com/watch?v=REPLACE_WITH_ACTUAL_VIDEO',
    text: `
      <p>This section asks about any <strong>existing trusts</strong> you may have.</p>
      <p>Understanding your current trust structure helps us:</p>
      <ul>
        <li>Coordinate with existing estate planning documents</li>
        <li>Avoid conflicts or redundancy</li>
        <li>Ensure proper asset titling</li>
        <li>Plan for trust amendments if needed</li>
      </ul>
    `,
  },
  {
    id: 51,
    type: 'Video',
    title: 'Spouse/Partner Information',
    videoUrl: 'https://www.youtube.com/watch?v=REPLACE_WITH_ACTUAL_VIDEO',
    text: `
      <p>This section collects information about your <strong>spouse or domestic partner</strong>.</p>
      <p>Your partner's information is essential for:</p>
      <ul>
        <li>Joint estate planning documents</li>
        <li>Survivor benefits and provisions</li>
        <li>Coordinated beneficiary designations</li>
        <li>Tax planning strategies for married couples</li>
      </ul>
    `,
  },
  // Section Overview Videos (IDs 100+)
  {
    id: 100,
    type: 'Video',
    title: 'Personal Data Overview',
    videoUrl: 'https://www.youtube.com/watch?v=REPLACE_WITH_ACTUAL_VIDEO', // Replace with your actual video URL
    text: `
      <p>This section collects your <strong>personal information</strong> and that of your spouse (if applicable).</p>
      <p>Information gathered includes:</p>
      <ul>
        <li>Full legal names and any aliases (AKA)</li>
        <li>Contact information and addresses</li>
        <li>Date of birth and citizenship</li>
        <li>Marital status and spouse information</li>
        <li>Existing trusts and estate planning documents</li>
      </ul>
      <p>This information is essential for creating accurate and legally valid estate planning documents.</p>
    `,
  },
  {
    id: 101,
    type: 'Video',
    title: 'Children Section Overview',
    videoUrl: 'https://www.youtube.com/watch?v=REPLACE_WITH_ACTUAL_VIDEO', // Replace with your actual video URL
    text: `
      <p>This section captures information about your <strong>children and dependents</strong>.</p>
      <p>We'll collect details about:</p>
      <ul>
        <li>Biological children</li>
        <li>Adopted children</li>
        <li>Stepchildren</li>
        <li>Minor children requiring guardianship provisions</li>
        <li>Children with special needs</li>
      </ul>
      <p>This helps us tailor your estate plan to protect and provide for your children appropriately.</p>
    `,
  },
  {
    id: 102,
    type: 'Video',
    title: 'Other Beneficiaries Overview',
    videoUrl: 'https://www.youtube.com/watch?v=REPLACE_WITH_ACTUAL_VIDEO', // Replace with your actual video URL
    text: `
      <p>This section covers <strong>additional beneficiaries</strong> beyond your immediate family.</p>
      <p>You can designate:</p>
      <ul>
        <li>Extended family members (siblings, parents, etc.)</li>
        <li>Friends and godchildren</li>
        <li>Charitable organizations</li>
        <li>Religious institutions</li>
        <li>Educational institutions</li>
      </ul>
      <p>Anyone you wish to include in your estate plan can be added here.</p>
    `,
  },
  {
    id: 103,
    type: 'Video',
    title: 'Charities Overview',
    videoUrl: 'https://www.youtube.com/watch?v=REPLACE_WITH_ACTUAL_VIDEO', // Replace with your actual video URL
    text: `
      <p>This section allows you to include <strong>charitable organizations</strong> in your estate plan.</p>
      <p>You can designate gifts to:</p>
      <ul>
        <li>Nonprofit organizations (501(c)(3))</li>
        <li>Religious institutions</li>
        <li>Educational institutions</li>
        <li>Hospitals and medical research foundations</li>
        <li>Community organizations</li>
        <li>Arts and cultural organizations</li>
      </ul>
      <p>Charitable giving can provide estate tax benefits while supporting causes you care about.</p>
    `,
  },
  {
    id: 104,
    type: 'Video',
    title: 'Fiduciaries Overview',
    videoUrl: 'https://www.youtube.com/watch?v=REPLACE_WITH_ACTUAL_VIDEO', // Replace with your actual video URL
    text: `
      <p>This section helps you designate <strong>trusted individuals</strong> to act on your behalf.</p>
      <p>Fiduciary roles include:</p>
      <ul>
        <li><strong>Personal Representative</strong> - Manages your estate after death</li>
        <li><strong>Financial Agent</strong> - Handles financial matters if incapacitated</li>
        <li><strong>Health Care Agent</strong> - Makes medical decisions if you cannot</li>
        <li><strong>Trustee</strong> - Manages trust assets</li>
        <li><strong>Guardian</strong> - Cares for minor children</li>
      </ul>
      <p>Choosing the right people for these roles is crucial to your estate plan.</p>
    `,
  },
  {
    id: 105,
    type: 'Video',
    title: 'Dispositive Intentions Overview',
    videoUrl: 'https://www.youtube.com/watch?v=REPLACE_WITH_ACTUAL_VIDEO', // Replace with your actual video URL
    text: `
      <p>This section captures your <strong>wishes for distributing your estate</strong>.</p>
      <p>You'll specify:</p>
      <ul>
        <li>How assets should be distributed among beneficiaries</li>
        <li>Whether to provide for your spouse first, then children</li>
        <li>Specific gifts or bequests</li>
        <li>Contingent beneficiaries</li>
        <li>Any conditions on distributions</li>
      </ul>
      <p>Your dispositive intentions form the core of your estate plan.</p>
    `,
  },
  {
    id: 106,
    type: 'Video',
    title: 'Assets Section Overview',
    videoUrl: 'https://www.youtube.com/watch?v=REPLACE_WITH_ACTUAL_VIDEO', // Replace with your actual video URL
    text: `
      <p>This section helps you <strong>inventory all your assets</strong>.</p>
      <p>Asset categories include:</p>
      <ul>
        <li>Real estate properties</li>
        <li>Bank accounts and investments</li>
        <li>Retirement accounts (401k, IRA, etc.)</li>
        <li>Life insurance policies</li>
        <li>Business interests</li>
        <li>Vehicles and personal property</li>
        <li>Digital assets</li>
      </ul>
      <p>A complete asset inventory ensures nothing is overlooked in your estate plan.</p>
    `,
  },
  // Asset Category Videos (IDs 110-118)
  {
    id: 110,
    type: 'Video',
    title: 'Real Estate',
    videoUrl: 'https://www.youtube.com/watch?v=REPLACE_WITH_ACTUAL_VIDEO',
    text: `
      <p>This category includes all <strong>real property</strong> you own.</p>
      <p>Types of real estate to include:</p>
      <ul>
        <li>Primary residence</li>
        <li>Vacation homes</li>
        <li>Rental properties</li>
        <li>Vacant land</li>
        <li>Commercial property</li>
        <li>Timeshares</li>
      </ul>
      <p>Be sure to include the ownership form (joint, tenants in common, etc.) as this affects how the property passes at death.</p>
    `,
  },
  {
    id: 111,
    type: 'Video',
    title: 'Cash, Bank Accounts and CDs',
    videoUrl: 'https://www.youtube.com/watch?v=REPLACE_WITH_ACTUAL_VIDEO',
    text: `
      <p>Include all <strong>liquid cash accounts</strong> in this category.</p>
      <p>Types of accounts:</p>
      <ul>
        <li>Checking accounts</li>
        <li>Savings accounts</li>
        <li>Money market accounts</li>
        <li>Certificates of Deposit (CDs)</li>
        <li>Cash on hand</li>
      </ul>
      <p>Consider adding POD (Payable on Death) beneficiaries to avoid probate on these accounts.</p>
    `,
  },
  {
    id: 112,
    type: 'Video',
    title: 'Non-Qualified Investment Accounts',
    videoUrl: 'https://www.youtube.com/watch?v=REPLACE_WITH_ACTUAL_VIDEO',
    text: `
      <p>These are <strong>taxable investment accounts</strong> that are not retirement accounts.</p>
      <p>Examples include:</p>
      <ul>
        <li>Brokerage accounts</li>
        <li>Individual stocks and bonds</li>
        <li>Mutual funds</li>
        <li>ETFs (Exchange Traded Funds)</li>
        <li>Annuities (non-qualified)</li>
      </ul>
      <p>These accounts can have TOD (Transfer on Death) beneficiaries designated to avoid probate.</p>
    `,
  },
  {
    id: 113,
    type: 'Video',
    title: 'IRAs and Retirement Accounts',
    videoUrl: 'https://www.youtube.com/watch?v=REPLACE_WITH_ACTUAL_VIDEO',
    text: `
      <p>Include all <strong>tax-advantaged retirement accounts</strong>.</p>
      <p>Types of retirement accounts:</p>
      <ul>
        <li>Traditional IRA</li>
        <li>Roth IRA</li>
        <li>401(k) and 403(b)</li>
        <li>SEP IRA and SIMPLE IRA</li>
        <li>Pension plans</li>
        <li>Profit sharing plans</li>
      </ul>
      <p><strong>Important:</strong> Beneficiary designations on these accounts override your will. Review and update beneficiaries regularly.</p>
    `,
  },
  {
    id: 114,
    type: 'Video',
    title: 'Life Insurance',
    videoUrl: 'https://www.youtube.com/watch?v=REPLACE_WITH_ACTUAL_VIDEO',
    text: `
      <p>Include all <strong>life insurance policies</strong> you own.</p>
      <p>Types of life insurance:</p>
      <ul>
        <li>Term life insurance</li>
        <li>Whole life insurance</li>
        <li>Universal life insurance</li>
        <li>Variable life insurance</li>
        <li>Group life insurance (through employer)</li>
      </ul>
      <p>The death benefit passes to named beneficiaries. The cash value (if any) is part of your estate.</p>
    `,
  },
  {
    id: 115,
    type: 'Video',
    title: 'Vehicles',
    videoUrl: 'https://www.youtube.com/watch?v=REPLACE_WITH_ACTUAL_VIDEO',
    text: `
      <p>Include all <strong>motor vehicles</strong> you own.</p>
      <p>Types of vehicles:</p>
      <ul>
        <li>Cars and trucks</li>
        <li>Motorcycles</li>
        <li>RVs and campers</li>
        <li>Boats and watercraft</li>
        <li>ATVs and recreational vehicles</li>
        <li>Trailers</li>
      </ul>
      <p>Title transfers at death depend on how the vehicle is titled and state law.</p>
    `,
  },
  {
    id: 116,
    type: 'Video',
    title: 'Other Assets',
    videoUrl: 'https://www.youtube.com/watch?v=REPLACE_WITH_ACTUAL_VIDEO',
    text: `
      <p>Include any <strong>other valuable assets</strong> not covered by other categories.</p>
      <p>Examples include:</p>
      <ul>
        <li>Jewelry and watches</li>
        <li>Art and collectibles</li>
        <li>Antiques and furniture</li>
        <li>Precious metals (gold, silver)</li>
        <li>Equipment and tools</li>
        <li>Intellectual property (patents, royalties)</li>
      </ul>
      <p>Consider whether these items have sentimental value and should be specifically bequeathed.</p>
    `,
  },
  {
    id: 117,
    type: 'Video',
    title: 'Business Interests',
    videoUrl: 'https://www.youtube.com/watch?v=REPLACE_WITH_ACTUAL_VIDEO',
    text: `
      <p>Include any <strong>ownership interests in businesses</strong>.</p>
      <p>Types of business interests:</p>
      <ul>
        <li>Sole proprietorships</li>
        <li>Partnership interests</li>
        <li>LLC membership interests</li>
        <li>S-Corporation stock</li>
        <li>C-Corporation stock (closely held)</li>
        <li>Professional practices</li>
      </ul>
      <p>Consider succession planning and buy-sell agreements for smooth business transition.</p>
    `,
  },
  {
    id: 118,
    type: 'Video',
    title: 'Digital Assets',
    videoUrl: 'https://www.youtube.com/watch?v=REPLACE_WITH_ACTUAL_VIDEO',
    text: `
      <p>Include <strong>digital and cryptocurrency assets</strong>.</p>
      <p>Types of digital assets:</p>
      <ul>
        <li>Cryptocurrency (Bitcoin, Ethereum, etc.)</li>
        <li>NFTs (Non-Fungible Tokens)</li>
        <li>Domain names</li>
        <li>Online businesses and stores</li>
        <li>Social media accounts with monetary value</li>
        <li>Digital media libraries</li>
      </ul>
      <p><strong>Important:</strong> Ensure your fiduciary has access credentials and knows how to handle these assets.</p>
    `,
  },
  // Fiduciary Type Help (IDs 120-124)
  {
    id: 120,
    type: 'Text',
    title: 'Executor (Personal Representative)',
    text: `
      <p>An <strong>Executor</strong> (also called Personal Representative) is the person responsible for administering your estate after your death.</p>
      <p>The Executor's duties include:</p>
      <ul>
        <li>Locating and managing estate assets</li>
        <li>Paying debts, taxes, and final expenses</li>
        <li>Distributing assets to beneficiaries according to your will</li>
        <li>Filing necessary court documents and tax returns</li>
        <li>Handling any disputes or challenges to the estate</li>
      </ul>
      <p><strong>Choose someone who is:</strong></p>
      <ul>
        <li>Trustworthy and organized</li>
        <li>Available and willing to serve</li>
        <li>Capable of handling financial matters</li>
        <li>Able to work with family members diplomatically</li>
      </ul>
      <p>Always name at least one alternate in case your first choice is unable or unwilling to serve.</p>
    `,
  },
  {
    id: 121,
    type: 'Text',
    title: 'Financial Power of Attorney',
    text: `
      <p>A <strong>Financial Power of Attorney</strong> designates someone to handle your financial affairs if you become incapacitated.</p>
      <p>Your Financial Agent can:</p>
      <ul>
        <li>Pay your bills and manage bank accounts</li>
        <li>File tax returns on your behalf</li>
        <li>Manage investments and retirement accounts</li>
        <li>Handle real estate transactions</li>
        <li>Apply for government benefits</li>
        <li>Make gifts (if authorized)</li>
      </ul>
      <p><strong>Important considerations:</strong></p>
      <ul>
        <li>This is effective only during your lifetime</li>
        <li>Choose someone you trust completely with your finances</li>
        <li>Consider naming someone local who can act quickly</li>
        <li>The agent has a fiduciary duty to act in your best interest</li>
      </ul>
    `,
  },
  {
    id: 122,
    type: 'Text',
    title: 'Health Care Agent',
    text: `
      <p>A <strong>Health Care Agent</strong> (also called Health Care Proxy or Medical Power of Attorney) makes medical decisions for you if you cannot make them yourself.</p>
      <p>Your Health Care Agent can:</p>
      <ul>
        <li>Consent to or refuse medical treatment</li>
        <li>Choose doctors and hospitals</li>
        <li>Access your medical records</li>
        <li>Make end-of-life care decisions</li>
        <li>Authorize organ donation</li>
      </ul>
      <p><strong>Choose someone who:</strong></p>
      <ul>
        <li>Knows and respects your wishes for medical care</li>
        <li>Can make difficult decisions under pressure</li>
        <li>Will advocate for your preferences with medical providers</li>
        <li>Is available to respond quickly in emergencies</li>
      </ul>
      <p>Discuss your health care preferences with your agent in advance.</p>
    `,
  },
  {
    id: 123,
    type: 'Text',
    title: 'Trustee',
    text: `
      <p>A <strong>Trustee</strong> is responsible for managing trust assets for the benefit of the beneficiaries.</p>
      <p>The Trustee's responsibilities include:</p>
      <ul>
        <li>Managing and investing trust assets prudently</li>
        <li>Making distributions according to trust terms</li>
        <li>Keeping accurate records and providing accountings</li>
        <li>Filing trust tax returns</li>
        <li>Acting impartially among beneficiaries</li>
      </ul>
      <p><strong>Consider choosing someone who:</strong></p>
      <ul>
        <li>Has financial knowledge or is willing to hire professionals</li>
        <li>Can remain objective when making distribution decisions</li>
        <li>Will follow the trust terms faithfully</li>
        <li>Can serve for the duration of the trust (possibly many years)</li>
      </ul>
      <p>You may also consider a professional trustee (bank or trust company) for complex trusts.</p>
    `,
  },
  {
    id: 124,
    type: 'Text',
    title: 'Guardian',
    text: `
      <p>A <strong>Guardian</strong> is the person who will raise your minor or disabled children if you cannot.</p>
      <p>The Guardian's role includes:</p>
      <ul>
        <li>Providing day-to-day care and supervision</li>
        <li>Making decisions about education and activities</li>
        <li>Ensuring the child's health care needs are met</li>
        <li>Providing a stable and loving home environment</li>
        <li>Raising the child according to your values and wishes</li>
      </ul>
      <p><strong>Important factors to consider:</strong></p>
      <ul>
        <li>Shared values and parenting philosophy</li>
        <li>Willingness and ability to take on the responsibility</li>
        <li>Location and stability of the potential guardian</li>
        <li>Relationship with your children</li>
        <li>Age and health of the potential guardian</li>
      </ul>
      <p>Discuss your wishes with the potential guardian before naming them in your estate plan.</p>
    `,
  },
  // Long-Term Care Section Help (ID 130)
  {
    id: 130,
    type: 'Video',
    title: 'Long-Term Care Planning',
    text: `
      <p><strong>Long-Term Care Planning</strong> helps protect your assets while ensuring you receive quality care as you age.</p>
      <p>This section covers several important areas:</p>
      <ul>
        <li><strong>Health Assessment:</strong> Understanding your current health conditions and potential future care needs</li>
        <li><strong>Living Situation:</strong> Where you currently live and what level of care you may need</li>
        <li><strong>Care Preferences:</strong> Where and how you would prefer to receive long-term care</li>
        <li><strong>Caregivers:</strong> Family members or others who can assist with your care</li>
        <li><strong>Insurance & Benefits:</strong> Medicare, Medicaid, and long-term care insurance coverage</li>
        <li><strong>Financial Planning:</strong> Income, assets, and gift history relevant to Medicaid eligibility</li>
        <li><strong>Quality of Life:</strong> Your preferences for daily living and end-of-life care</li>
      </ul>
      <p><strong>Why this matters:</strong> Medicaid has a 5-year look-back period for asset transfers. Proper planning can help preserve assets for your family while ensuring you qualify for benefits when needed.</p>
      <p>Be as thorough and honest as possible - this information is crucial for developing an effective long-term care and asset protection strategy.</p>
    `,
  },
];

interface HelpModalProps {
  open: boolean;
  onClose: () => void;
  helpId: number | null;
}

const HelpModal: React.FC<HelpModalProps> = ({ open, onClose, helpId }) => {
  // Find the help content for the given ID
  const helpContent = helpAnswers.find((h) => h.id === helpId);

  if (!helpContent) {
    return null;
  }

  const renderContent = () => {
    switch (helpContent.type) {
      case 'Video':
        const videoUrl = helpContent.videoUrl || '';
        const provider = helpContent.videoProvider || detectVideoProvider(videoUrl);

        const renderVideoPlayer = () => {
          if (!videoUrl) {
            return (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: 200,
                  bgcolor: '#f5f5f5',
                  borderRadius: 1,
                }}
              >
                <Typography color="text.secondary">No video URL provided</Typography>
              </Box>
            );
          }

          switch (provider) {
            case 'youtube':
              const youtubeId = getYouTubeId(videoUrl);
              if (!youtubeId) return null;
              return (
                <Box
                  sx={{
                    position: 'relative',
                    paddingBottom: '56.25%', // 16:9 aspect ratio
                    height: 0,
                    overflow: 'hidden',
                    borderRadius: 1,
                    mb: 2,
                  }}
                >
                  <iframe
                    src={`https://www.youtube.com/embed/${youtubeId}`}
                    title={helpContent.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      border: 'none',
                    }}
                  />
                </Box>
              );

            case 'vimeo':
              const vimeoId = getVimeoId(videoUrl);
              if (!vimeoId) return null;
              return (
                <Box
                  sx={{
                    position: 'relative',
                    paddingBottom: '56.25%',
                    height: 0,
                    overflow: 'hidden',
                    borderRadius: 1,
                    mb: 2,
                  }}
                >
                  <iframe
                    src={`https://player.vimeo.com/video/${vimeoId}`}
                    title={helpContent.title}
                    allow="autoplay; fullscreen; picture-in-picture"
                    allowFullScreen
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      border: 'none',
                    }}
                  />
                </Box>
              );

            case 'mp4':
              return (
                <Box sx={{ mb: 2 }}>
                  <video
                    controls
                    style={{
                      width: '100%',
                      borderRadius: 4,
                    }}
                  >
                    <source src={videoUrl} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                </Box>
              );

            default:
              // Fallback for other video sources - show link
              return (
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    mb: 2,
                    p: 2,
                    bgcolor: '#f5f5f5',
                    borderRadius: 1,
                  }}
                >
                  <PlayCircleOutlineIcon sx={{ color: '#1a237e', fontSize: 40 }} />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Video Tutorial
                    </Typography>
                    <Link
                      href={videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{ color: '#1a237e' }}
                    >
                      Watch Video <OpenInNewIcon fontSize="small" sx={{ ml: 0.5, verticalAlign: 'middle' }} />
                    </Link>
                  </Box>
                </Box>
              );
          }
        };

        return (
          <Box>
            {renderVideoPlayer()}
            {/* Show text description below video if provided */}
            {helpContent.text && (
              <Box
                dangerouslySetInnerHTML={{ __html: helpContent.text }}
                sx={{
                  '& p': { mb: 2, lineHeight: 1.7 },
                  '& ul': { pl: 3, mb: 2 },
                  '& li': { mb: 0.5, lineHeight: 1.6 },
                  '& strong': { color: '#1a237e' },
                }}
              />
            )}
          </Box>
        );

      case 'Link':
        return (
          <Box>
            <Box
              dangerouslySetInnerHTML={{ __html: helpContent.text }}
              sx={{
                '& p': { mb: 2 },
                '& ul': { pl: 3, mb: 2 },
                '& li': { mb: 0.5 },
              }}
            />
            {helpContent.linkUrl && (
              <Box sx={{ mt: 2 }}>
                <Link
                  href={helpContent.linkUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 0.5,
                    color: '#1a237e',
                  }}
                >
                  {helpContent.linkText || 'Learn More'}
                  <OpenInNewIcon fontSize="small" />
                </Link>
              </Box>
            )}
          </Box>
        );

      case 'Text':
      default:
        return (
          <Box
            dangerouslySetInnerHTML={{ __html: helpContent.text }}
            sx={{
              '& p': { mb: 2, lineHeight: 1.7 },
              '& ul': { pl: 3, mb: 2 },
              '& li': { mb: 0.5, lineHeight: 1.6 },
              '& strong': { color: '#1a237e' },
              '& em': { color: 'text.secondary', fontStyle: 'italic' },
            }}
          />
        );
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
        },
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          bgcolor: '#1a237e',
          color: 'white',
          py: 1.5,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box
            sx={{
              width: 28,
              height: 28,
              borderRadius: '50%',
              bgcolor: '#FFD700',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1rem',
              fontWeight: 700,
              color: '#1a237e',
            }}
          >
            ?
          </Box>
          <Typography variant="h6" component="span" sx={{ fontWeight: 600 }}>
            {helpContent.title}
          </Typography>
        </Box>
        <IconButton
          onClick={onClose}
          sx={{ color: 'white', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}
          size="small"
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ pt: 3 }}>{renderContent()}</DialogContent>
      <DialogActions sx={{ px: 3, pb: 2, justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <img
            src="/logo.jpg"
            alt="Company Logo"
            style={{ height: 32, width: 'auto' }}
          />
          <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem' }}>
            Zaacharia Brown & Bratkovich &copy; 2026
          </Typography>
        </Box>
        <Button
          onClick={onClose}
          variant="contained"
          sx={{
            bgcolor: '#1a237e',
            '&:hover': { bgcolor: '#0d1642' },
          }}
        >
          Got It
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default HelpModal;
