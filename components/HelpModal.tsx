"use client";

import React from "react";
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
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import PlayCircleOutlineIcon from "@mui/icons-material/PlayCircleOutline";

// Help content types
export type HelpContentType = "Text" | "Video" | "Link";

// Video provider types
export type VideoProvider = "youtube" | "vimeo" | "mp4" | "other";

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
  if (url.includes("youtube.com") || url.includes("youtu.be")) {
    return "youtube";
  }
  if (url.includes("vimeo.com")) {
    return "vimeo";
  }
  if (url.endsWith(".mp4") || url.endsWith(".webm") || url.endsWith(".ogg")) {
    return "mp4";
  }
  return "other";
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
    type: "Text",
    title: "Full Legal Name",
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
    type: "Text",
    title: "Also Known As (AKA)",
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
    type: "Text",
    title: "Mailing Address",
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
    type: "Text",
    title: "Living Trust",
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
    type: "Text",
    title: "Irrevocable Trust",
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
    type: "Text",
    title: "Cell Phone",
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
    type: "Text",
    title: "Home Phone",
    text: `
      <p>Enter your <strong>home landline number</strong> if you have one.</p>
      <p>This provides an alternative contact method if your cell phone is unavailable.</p>
    `,
  },
  {
    id: 8,
    type: "Text",
    title: "Work Phone",
    text: `
      <p>Enter your <strong>work or business phone number</strong>.</p>
      <p>This can be useful for daytime contact during business hours.</p>
    `,
  },
  {
    id: 9,
    type: "Text",
    title: "Sex",
    text: `
      <p>Select your <strong>biological sex</strong> as recorded on legal documents.</p>
      <p>This information may be required for certain legal documents and identification purposes.</p>
    `,
  },
  {
    id: 10,
    type: "Text",
    title: "Email Address",
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
    type: "Text",
    title: "Birth Date",
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
    type: "Text",
    title: "Marital Status",
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
    type: "Text",
    title: "Number of Children",
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
    type: "Text",
    title: "Children from Prior Relationship",
    text: `
      <p>Indicate if you have <strong>children from a previous marriage or relationship</strong>.</p>
      <p>This is important because:</p>
      <ul>
        <li>There may be greater taxes owed</li>
        <li>It affects how assets may be distributed</li>
        <li>May require special provisions to protect their inheritance</li>
        <li>Could impact trust structures</li>
      </ul>
    `,
  },
  {
    id: 15,
    type: "Text",
    title: "Children Together",
    text: `
      <p>Enter the number of <strong>children you and your spouse/partner have together</strong>.</p>
      <p>This helps distinguish between joint children and children from prior relationships for planning purposes.</p>
    `,
  },
  {
    id: 16,
    type: "Text",
    title: "Prior Marriage",
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
    type: "Text",
    title: "Spouse Full Legal Name",
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
    type: "Text",
    title: "Spouse Also Known As (AKA)",
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
    type: "Text",
    title: "Spouse Mailing Address",
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
    type: "Text",
    title: "Spouse Cell Phone",
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
    type: "Text",
    title: "Spouse Home Phone",
    text: `
      <p>Enter your spouse's <strong>home landline number</strong> if they have one.</p>
      <p>This provides an alternative contact method if their cell phone is unavailable.</p>
    `,
  },
  {
    id: 22,
    type: "Text",
    title: "Spouse Work Phone",
    text: `
      <p>Enter your spouse's <strong>work or business phone number</strong>.</p>
      <p>This can be useful for daytime contact during business hours.</p>
    `,
  },
  {
    id: 23,
    type: "Text",
    title: "Spouse Sex",
    text: `
      <p>Select your spouse's <strong>biological sex</strong> as recorded on legal documents.</p>
      <p>This information may be required for certain legal documents and identification purposes.</p>
    `,
  },
  {
    id: 24,
    type: "Text",
    title: "Spouse Email Address",
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
    type: "Text",
    title: "Spouse Birth Date",
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
    type: "Text",
    title: "Spouse Children from Prior Relationship",
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
    type: "Text",
    title: "Spouse Living Trust",
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
    type: "Text",
    title: "Spouse Irrevocable Trust",
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
  {
    id: 29,
    type: "Text",
    title: "State of Domicile",
    text: `
      <p><strong>Domicile</strong> is the legal term for the state you consider to be your permanent home.</p>
      <p>Your domicile is where:</p>
      <ul>
        <li>You intend to remain indefinitely</li>
        <li>You return to after being away</li>
        <li>You are registered to vote</li>
        <li>Your driver's license is issued</li>
        <li>You file state income taxes (if applicable)</li>
      </ul>
      <p>Your state of domicile determines which state's laws govern your estate plan, including probate, inheritance taxes, and property rights.</p>
      <p><em>Note: You can only have one domicile at a time, even if you own homes in multiple states.</em></p>
    `,
  },
  // Children Section Fields (IDs 30-45)
  {
    id: 30,
    type: "Text",
    title: "Children in Good Health",
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
    type: "Text",
    title: "Children Under 21",
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
    type: "Text",
    title: "Children Disabled or Blind",
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
    type: "Text",
    title: "Children Education Complete",
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
    type: "Text",
    title: "Children Marital Problems",
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
    type: "Text",
    title: "Children Receiving SSI/Government Benefits",
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
    type: "Text",
    title: "Drug Addiction",
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
    type: "Text",
    title: "Alcoholism",
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
    type: "Text",
    title: "Financial Problems (Spendthrift)",
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
    type: "Text",
    title: "Other Concerns",
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
    type: "Video",
    title: "Existing Trusts",
    videoUrl: "https://www.youtube.com/watch?v=REPLACE_WITH_ACTUAL_VIDEO",
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
    type: "Video",
    title: "Spouse/Partner Information",
    videoUrl: "https://www.youtube.com/watch?v=REPLACE_WITH_ACTUAL_VIDEO",
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
    type: "Video",
    title: "Personal Data Overview",
    videoUrl: "https://www.youtube.com/watch?v=REPLACE_WITH_ACTUAL_VIDEO", // Replace with your actual video URL
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
    type: "Video",
    title: "Children Section Overview",
    videoUrl: "https://www.youtube.com/watch?v=REPLACE_WITH_ACTUAL_VIDEO", // Replace with your actual video URL
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
    type: "Video",
    title: "Other Beneficiaries Overview",
    videoUrl: "https://www.youtube.com/watch?v=REPLACE_WITH_ACTUAL_VIDEO", // Replace with your actual video URL
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
    type: "Video",
    title: "Charities Overview",
    videoUrl: "https://www.youtube.com/watch?v=REPLACE_WITH_ACTUAL_VIDEO", // Replace with your actual video URL
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
    type: "Video",
    title: "Fiduciaries Overview",
    videoUrl: "https://www.youtube.com/watch?v=REPLACE_WITH_ACTUAL_VIDEO", // Replace with your actual video URL
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
    type: "Video",
    title: "Dispositive Intentions Overview",
    videoUrl: "https://www.youtube.com/watch?v=REPLACE_WITH_ACTUAL_VIDEO", // Replace with your actual video URL
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
    type: "Video",
    title: "Assets Section Overview",
    videoUrl: "https://www.youtube.com/watch?v=REPLACE_WITH_ACTUAL_VIDEO", // Replace with your actual video URL
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
    type: "Video",
    title: "Real Estate",
    videoUrl: "https://www.youtube.com/watch?v=REPLACE_WITH_ACTUAL_VIDEO",
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
    type: "Video",
    title: "Cash, Bank Accounts and CDs",
    videoUrl: "https://www.youtube.com/watch?v=REPLACE_WITH_ACTUAL_VIDEO",
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
    type: "Video",
    title: "Non-Qualified Investment Accounts",
    videoUrl: "https://www.youtube.com/watch?v=REPLACE_WITH_ACTUAL_VIDEO",
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
    type: "Video",
    title: "IRAs and Retirement Accounts",
    videoUrl: "https://www.youtube.com/watch?v=REPLACE_WITH_ACTUAL_VIDEO",
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
    type: "Video",
    title: "Life Insurance",
    videoUrl: "https://www.youtube.com/watch?v=REPLACE_WITH_ACTUAL_VIDEO",
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
    type: "Video",
    title: "Vehicles",
    videoUrl: "https://www.youtube.com/watch?v=REPLACE_WITH_ACTUAL_VIDEO",
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
    type: "Video",
    title: "Other Assets",
    videoUrl: "https://www.youtube.com/watch?v=REPLACE_WITH_ACTUAL_VIDEO",
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
    type: "Video",
    title: "Business Interests",
    videoUrl: "https://www.youtube.com/watch?v=REPLACE_WITH_ACTUAL_VIDEO",
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
    type: "Video",
    title: "Digital Assets",
    videoUrl: "https://www.youtube.com/watch?v=REPLACE_WITH_ACTUAL_VIDEO",
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
    type: "Text",
    title: "Executor (Personal Representative)",
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
    type: "Text",
    title: "Financial Power of Attorney",
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
    type: "Text",
    title: "Health Care Agent",
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
    type: "Text",
    title: "Trustee",
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
    type: "Text",
    title: "Guardian",
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
    type: "Video",
    title: "Long-Term Care Planning",
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
  // Military Service Help (IDs 40, 42, 47)
  {
    id: 40,
    type: "Text",
    title: "Military Service",
    text: `
      <p><strong>Military Service</strong> information is important for estate planning because veterans may be entitled to various benefits.</p>
      <p>These benefits can include:</p>
      <ul>
        <li><strong>VA Pension:</strong> Non-service connected pension for wartime veterans</li>
        <li><strong>Aid & Attendance:</strong> Additional benefits for veterans needing assistance with daily activities</li>
        <li><strong>Burial Benefits:</strong> Cemetery plots, headstones, and burial allowances</li>
        <li><strong>Survivor Benefits:</strong> Benefits for surviving spouses and dependents</li>
        <li><strong>VA Health Care:</strong> Medical care through VA facilities</li>
      </ul>
      <p>Please provide accurate information about military service to help us identify all available benefits.</p>
    `,
  },
  {
    id: 42,
    type: "Text",
    title: "Armed Forces Service",
    text: `
      <p>Indicate whether you served in any branch of the <strong>United States Armed Forces</strong>.</p>
      <p>This includes active duty, reserve, or National Guard service in:</p>
      <ul>
        <li>Army</li>
        <li>Navy</li>
        <li>Air Force</li>
        <li>Marine Corps</li>
        <li>Coast Guard</li>
        <li>Space Force</li>
        <li>National Guard</li>
        <li>Reserves</li>
      </ul>
      <p><strong>Why we ask:</strong> Veterans and their surviving spouses may qualify for VA benefits that can help pay for long-term care and other expenses. This can be a valuable part of your estate plan.</p>
    `,
  },
  {
    id: 47,
    type: "Text",
    title: "Spouse Military Service",
    text: `
      <p>Indicate whether your spouse served in any branch of the <strong>United States Armed Forces</strong>.</p>
      <p><strong>Why this matters:</strong> If your spouse is a veteran, they may be entitled to VA benefits. Additionally, surviving spouses of veterans may qualify for benefits such as:</p>
      <ul>
        <li><strong>DIC (Dependency and Indemnity Compensation):</strong> Monthly payments to surviving spouses</li>
        <li><strong>Survivor's Pension:</strong> Income-based benefits for surviving spouses of wartime veterans</li>
        <li><strong>CHAMPVA:</strong> Health care benefits for dependents of disabled veterans</li>
        <li><strong>Burial Benefits:</strong> May be eligible for burial in VA cemeteries</li>
      </ul>
    `,
  },
  // Funeral Preferences Help (IDs 41, 43-46, 48-49, 52-53)
  {
    id: 41,
    type: "Text",
    title: "Funeral Preferences",
    text: `
      <p><strong>Funeral Preferences</strong> help ensure your wishes are known and followed after your passing.</p>
      <p>Documenting your preferences in advance:</p>
      <ul>
        <li>Relieves your family from making difficult decisions during grief</li>
        <li>Ensures your wishes are honored</li>
        <li>Can help with financial planning for final expenses</li>
        <li>Allows time to make arrangements that reflect your values</li>
      </ul>
      <p>The information you provide here will be included in your estate plan documents for your family's reference.</p>
    `,
  },
  {
    id: 43,
    type: "Text",
    title: "Prepaid Funeral Policy",
    text: `
      <p>A <strong>Prepaid Funeral Policy</strong> (also called pre-need or preneed funeral plan) is an arrangement made in advance to pay for funeral services.</p>
      <p><strong>Benefits of prepaid funeral plans:</strong></p>
      <ul>
        <li>Locks in current prices, protecting against inflation</li>
        <li>Reduces financial burden on family members</li>
        <li>May be exempt from Medicaid asset calculations</li>
        <li>Ensures your specific wishes are documented</li>
      </ul>
      <p>If you have a prepaid policy, please provide details including the funeral home name and policy information so this can be noted in your estate planning documents.</p>
    `,
  },
  {
    id: 44,
    type: "Text",
    title: "Burial or Cremation",
    text: `
      <p>This is your preference for the disposition of your remains.</p>
      <p><strong>Burial:</strong></p>
      <ul>
        <li>Traditional interment in a cemetery</li>
        <li>Requires a casket and burial plot</li>
        <li>May include above-ground options (mausoleum)</li>
      </ul>
      <p><strong>Cremation:</strong></p>
      <ul>
        <li>Remains are reduced to ashes</li>
        <li>Ashes can be kept, scattered, or interred</li>
        <li>Generally less expensive than traditional burial</li>
        <li>Memorial service can still be held</li>
      </ul>
      <p>If you're undecided, that's okay - you can update this preference later. What's important is documenting your current thinking.</p>
    `,
  },
  {
    id: 45,
    type: "Text",
    title: "Preferred Funeral Home",
    text: `
      <p>If you have a <strong>Preferred Funeral Home</strong>, please provide the name and location.</p>
      <p>Reasons you might have a preference:</p>
      <ul>
        <li>Family history with a particular funeral home</li>
        <li>Location convenient for family and friends</li>
        <li>Religious or cultural considerations</li>
        <li>Prepaid arrangements already in place</li>
        <li>Personal experience or recommendations</li>
      </ul>
      <p>If you don't have a preference, you can leave this blank. Your family can make this decision when the time comes.</p>
    `,
  },
  {
    id: 46,
    type: "Text",
    title: "Preferred Church for Service",
    text: `
      <p>If you would like your funeral or memorial service held at a <strong>specific church or place of worship</strong>, please provide the name and location.</p>
      <p>This might be:</p>
      <ul>
        <li>Your regular place of worship</li>
        <li>A church with family significance</li>
        <li>A chapel at a funeral home</li>
        <li>Any other meaningful location</li>
      </ul>
      <p>If you prefer a non-religious service or have no preference, you can leave this blank.</p>
    `,
  },
  {
    id: 48,
    type: "Text",
    title: "Spouse Prepaid Funeral Policy",
    text: `
      <p>Indicate whether your spouse has a <strong>Prepaid Funeral Policy</strong>.</p>
      <p>If yes, please provide details about the policy including:</p>
      <ul>
        <li>The funeral home where arrangements were made</li>
        <li>Policy or contract number</li>
        <li>What services are covered</li>
      </ul>
      <p>Having this information documented helps ensure these arrangements are known and can be carried out when needed.</p>
    `,
  },
  {
    id: 49,
    type: "Text",
    title: "Spouse Burial or Cremation Preference",
    text: `
      <p>Indicate your spouse's preference for <strong>burial or cremation</strong>.</p>
      <p>It's important to discuss these preferences together so each spouse's wishes are known and documented. Many couples choose the same option so they can be interred together.</p>
      <p>If your spouse hasn't expressed a preference, select "Undecided" and consider having this conversation.</p>
    `,
  },
  {
    id: 52,
    type: "Text",
    title: "Spouse Preferred Funeral Home",
    text: `
      <p>If your spouse has a <strong>Preferred Funeral Home</strong>, please provide the name and location.</p>
      <p>Many couples choose the same funeral home for convenience and so arrangements can be coordinated. However, each spouse may have their own preference based on:</p>
      <ul>
        <li>Family traditions</li>
        <li>Existing prepaid arrangements</li>
        <li>Personal preferences</li>
      </ul>
    `,
  },
  {
    id: 53,
    type: "Text",
    title: "Spouse Preferred Church for Service",
    text: `
      <p>If your spouse would like their funeral or memorial service held at a <strong>specific church or place of worship</strong>, please provide the name and location.</p>
      <p>This ensures your spouse's wishes are documented and can be honored. The preference may be:</p>
      <ul>
        <li>The same location as your preference</li>
        <li>A church from their family tradition</li>
        <li>A different place of worship</li>
      </ul>
    `,
  },
  // Long-Term Care Section Questions (IDs 131-168)
  {
    id: 131,
    type: "Text",
    title: "Concern About Paying for Long-Term Care",
    text: `
      <p>Rate your level of <strong>concern about paying for long-term care</strong> in the future.</p>
      <p>Long-term care can be expensive:</p>
      <ul>
        <li><strong>Nursing home care:</strong> $8,000 - $15,000+ per month</li>
        <li><strong>Assisted living:</strong> $4,000 - $7,000+ per month</li>
        <li><strong>Home health aides:</strong> $25 - $35+ per hour</li>
      </ul>
      <p>Your level of concern helps us prioritize asset protection strategies in your estate plan.</p>
    `,
  },
  {
    id: 132,
    type: "Text",
    title: "Previous Advisor Meeting",
    text: `
      <p>Indicate whether you have <strong>previously consulted</strong> with an attorney or financial advisor about long-term care or Medicaid planning.</p>
      <p>If yes, please provide details about:</p>
      <ul>
        <li>When the meeting took place</li>
        <li>Who you met with (name and firm)</li>
        <li>What recommendations were made</li>
        <li>Whether any documents were prepared</li>
      </ul>
      <p>This helps us understand your existing planning and avoid duplication of effort.</p>
    `,
  },
  {
    id: 133,
    type: "Text",
    title: "Overall Health Rating",
    text: `
      <p>Describe your <strong>overall health status</strong>.</p>
      <p>Consider factors such as:</p>
      <ul>
        <li>Chronic conditions you manage</li>
        <li>Energy levels and daily functioning</li>
        <li>Recent changes in health status</li>
        <li>How you compare to others your age</li>
      </ul>
      <p>This self-assessment helps us understand your current situation and potential future care needs.</p>
    `,
  },
  {
    id: 134,
    type: "Text",
    title: "Medical Diagnoses",
    text: `
      <p>Select any <strong>medical conditions</strong> you have been diagnosed with.</p>
      <p>These conditions are particularly relevant to long-term care planning because they may:</p>
      <ul>
        <li>Affect your future care needs</li>
        <li>Impact your ability to live independently</li>
        <li>Require specialized care settings</li>
        <li>Influence the urgency of planning</li>
      </ul>
      <p>Check all that apply. If you have a condition not listed, select "Other" and specify.</p>
    `,
  },
  {
    id: 135,
    type: "Text",
    title: "Recent Hospitalizations",
    text: `
      <p>Indicate any <strong>hospitalizations, surgeries, or rehab stays</strong> in the last 2 years.</p>
      <p>Recent medical events can be indicators of:</p>
      <ul>
        <li>Declining health requiring more care</li>
        <li>Conditions that may worsen over time</li>
        <li>Need for post-acute care services</li>
      </ul>
      <p>Please include dates, facilities, and reasons if applicable.</p>
    `,
  },
  {
    id: 136,
    type: "Text",
    title: "Mobility Limitations",
    text: `
      <p>Select any <strong>mobility limitations</strong> you experience.</p>
      <p>Mobility issues affect:</p>
      <ul>
        <li>What type of housing is appropriate</li>
        <li>Need for home modifications</li>
        <li>Level of assistance required</li>
        <li>Transportation needs</li>
      </ul>
      <p>History of falls is particularly important as it often predicts future care needs.</p>
    `,
  },
  {
    id: 137,
    type: "Text",
    title: "Activities of Daily Living (ADLs)",
    text: `
      <p><strong>Activities of Daily Living (ADLs)</strong> are basic self-care tasks.</p>
      <p>The six ADLs are:</p>
      <ul>
        <li><strong>Bathing:</strong> Washing yourself</li>
        <li><strong>Dressing:</strong> Putting on and taking off clothes</li>
        <li><strong>Toileting:</strong> Using the bathroom</li>
        <li><strong>Transferring:</strong> Moving from bed to chair</li>
        <li><strong>Continence:</strong> Controlling bladder and bowel</li>
        <li><strong>Eating:</strong> Feeding yourself</li>
      </ul>
      <p><strong>Important:</strong> Needing help with 2+ ADLs typically qualifies as needing long-term care for insurance and Medicaid purposes.</p>
    `,
  },
  {
    id: 138,
    type: "Text",
    title: "Instrumental Activities of Daily Living (IADLs)",
    text: `
      <p><strong>IADLs</strong> are more complex activities needed to live independently.</p>
      <p>The IADLs include:</p>
      <ul>
        <li><strong>Cooking:</strong> Preparing meals</li>
        <li><strong>Shopping:</strong> Grocery and household shopping</li>
        <li><strong>Managing medications:</strong> Taking correct doses on time</li>
        <li><strong>Driving/transportation:</strong> Getting to appointments and errands</li>
        <li><strong>Housekeeping:</strong> Cleaning and home maintenance</li>
        <li><strong>Managing finances:</strong> Paying bills, banking</li>
      </ul>
      <p>Difficulty with IADLs often precedes difficulty with ADLs and may indicate early cognitive decline.</p>
    `,
  },
  {
    id: 139,
    type: "Text",
    title: "Dementia or Memory Impairment",
    text: `
      <p>Indicate if you have been <strong>diagnosed with dementia or memory impairment</strong>.</p>
      <p>This includes:</p>
      <ul>
        <li>Alzheimer's disease</li>
        <li>Vascular dementia</li>
        <li>Lewy body dementia</li>
        <li>Frontotemporal dementia</li>
        <li>Mild cognitive impairment (MCI)</li>
      </ul>
      <p>A dementia diagnosis significantly impacts estate planning, including timing of document execution and capacity considerations.</p>
    `,
  },
  {
    id: 140,
    type: "Text",
    title: "Dementia Stage",
    text: `
      <p>Indicate the <strong>stage or severity</strong> of dementia.</p>
      <ul>
        <li><strong>Mild:</strong> Memory lapses, difficulty with complex tasks, but generally independent</li>
        <li><strong>Moderate:</strong> Increased confusion, need for help with daily activities, personality changes</li>
        <li><strong>Severe:</strong> Extensive memory loss, inability to recognize family, full dependence on caregivers</li>
      </ul>
      <p>The stage affects the urgency of planning and the type of care arrangements needed.</p>
    `,
  },
  {
    id: 141,
    type: "Text",
    title: "Family History of Conditions",
    text: `
      <p>Family history can indicate <strong>increased risk</strong> for certain conditions.</p>
      <p>Relevant family history includes:</p>
      <ul>
        <li>Parents or siblings with dementia</li>
        <li>Family history of stroke</li>
        <li>Parkinson's disease in the family</li>
        <li>Other neurological conditions</li>
      </ul>
      <p>This helps us assess future care needs and the importance of proactive planning.</p>
    `,
  },
  {
    id: 142,
    type: "Text",
    title: "Current Living Situation",
    text: `
      <p>Select where you <strong>currently live</strong>.</p>
      <p>Options include:</p>
      <ul>
        <li><strong>Own home:</strong> Single family home you own</li>
        <li><strong>Rented home/apartment:</strong> Rental property</li>
        <li><strong>Independent living:</strong> Senior community without daily care</li>
        <li><strong>Assisted living:</strong> Facility with help for daily activities</li>
        <li><strong>Memory care:</strong> Specialized dementia care</li>
        <li><strong>Skilled nursing:</strong> 24-hour medical care facility</li>
        <li><strong>Living with family:</strong> In a relative's home</li>
      </ul>
      <p>Your current situation affects planning strategies and timelines.</p>
    `,
  },
  {
    id: 143,
    type: "Text",
    title: "Currently in Long-Term Care Facility",
    text: `
      <p>Indicate if you are <strong>currently residing in a long-term care community or facility</strong>.</p>
      <p>If yes, this is important because:</p>
      <ul>
        <li>Different planning strategies apply</li>
        <li>Medicaid applications may be urgent</li>
        <li>Private pay vs. Medicaid timing matters</li>
        <li>Asset protection options may be more limited</li>
      </ul>
      <p>Please provide facility details so we can factor in current costs and care levels.</p>
    `,
  },
  {
    id: 144,
    type: "Text",
    title: "Level of Care",
    text: `
      <p>Select the <strong>level of care</strong> you are currently receiving.</p>
      <ul>
        <li><strong>Independent living:</strong> No daily care assistance</li>
        <li><strong>Assisted living:</strong> Help with some daily activities</li>
        <li><strong>Memory care:</strong> Specialized dementia care unit</li>
        <li><strong>Skilled nursing:</strong> 24-hour medical care</li>
        <li><strong>Rehabilitation:</strong> Short-term recovery care</li>
        <li><strong>At-home care:</strong> Aides coming to your home</li>
      </ul>
      <p>The level of care affects costs, Medicaid eligibility, and planning strategies.</p>
    `,
  },
  {
    id: 145,
    type: "Text",
    title: "Home Help",
    text: `
      <p>Indicate if you <strong>receive help at home</strong>, whether paid or unpaid.</p>
      <p>Home help includes:</p>
      <ul>
        <li>Paid home health aides</li>
        <li>Family members providing care</li>
        <li>Friends assisting with tasks</li>
        <li>Home care agency services</li>
      </ul>
      <p>Family caregiving can sometimes be formalized through caregiver agreements for Medicaid planning.</p>
    `,
  },
  {
    id: 146,
    type: "Text",
    title: "Home Help Providers",
    text: `
      <p>Select <strong>who provides help</strong> in your home.</p>
      <ul>
        <li><strong>Home health agency:</strong> Licensed agency with trained aides</li>
        <li><strong>Private aide:</strong> Individually hired caregiver</li>
        <li><strong>Family:</strong> Children, siblings, or other relatives</li>
        <li><strong>Friends:</strong> Non-family members helping out</li>
      </ul>
      <p>Family caregivers may be compensated through caregiver agreements as part of asset protection planning.</p>
    `,
  },
  {
    id: 147,
    type: "Text",
    title: "Hours of Help Per Week",
    text: `
      <p>Estimate the <strong>hours of help per week</strong> you receive.</p>
      <p>This helps assess:</p>
      <ul>
        <li>Current care costs</li>
        <li>Whether home care is sustainable</li>
        <li>Future care needs trajectory</li>
        <li>Potential for caregiver agreements</li>
      </ul>
      <p>Even informal family help should be counted as it reflects your actual care needs.</p>
    `,
  },
  {
    id: 148,
    type: "Text",
    title: "Expected Care Increase",
    text: `
      <p>Indicate if you <strong>expect your care needs to increase</strong> in the next 6-12 months.</p>
      <p>Consider:</p>
      <ul>
        <li>Progression of existing conditions</li>
        <li>Recent decline in functioning</li>
        <li>Doctor's recommendations</li>
        <li>Family observations</li>
      </ul>
      <p>If care needs are expected to increase, planning should be expedited.</p>
    `,
  },
  {
    id: 149,
    type: "Text",
    title: "Likelihood of Needing Long-Term Care",
    text: `
      <p>Assess the <strong>likelihood of needing long-term care</strong> (more than 90 consecutive days) within the next 5 years.</p>
      <p>Statistics show that:</p>
      <ul>
        <li>About 70% of people over 65 will need some form of long-term care</li>
        <li>Women typically need care for longer than men</li>
        <li>Average nursing home stay is 2-3 years</li>
      </ul>
      <p>Be realistic in your assessment - this guides the urgency and type of planning needed.</p>
    `,
  },
  {
    id: 150,
    type: "Text",
    title: "Care Preference",
    text: `
      <p>Select your <strong>preferred care setting</strong> if long-term care becomes necessary.</p>
      <ul>
        <li><strong>Age in place at home:</strong> Receive care in your own home</li>
        <li><strong>Live with family:</strong> Move in with children or relatives</li>
        <li><strong>Assisted living:</strong> Facility with help for daily activities</li>
        <li><strong>Memory care:</strong> Specialized dementia care facility</li>
        <li><strong>Skilled nursing:</strong> 24-hour medical care facility</li>
        <li><strong>CCRC:</strong> Continuing care retirement community</li>
      </ul>
      <p>Your preference helps us plan for appropriate costs and care arrangements.</p>
    `,
  },
  {
    id: 151,
    type: "Text",
    title: "Specific Provider in Mind",
    text: `
      <p>Indicate if you have a <strong>specific facility or provider</strong> in mind.</p>
      <p>If yes, please provide:</p>
      <ul>
        <li>Name of the facility</li>
        <li>City and state location</li>
        <li>Why you prefer this facility</li>
        <li>Current costs if known</li>
      </ul>
      <p>Having a specific facility in mind helps us plan for those particular costs and requirements.</p>
    `,
  },
  {
    id: 152,
    type: "Text",
    title: "Home Supports Needed",
    text: `
      <p>If you prefer to age in place, select the <strong>supports you think you would need</strong>.</p>
      <ul>
        <li><strong>Home health aides:</strong> Personal care assistance</li>
        <li><strong>Family caregivers:</strong> Relatives providing care</li>
        <li><strong>Adult day program:</strong> Daytime activities and supervision</li>
        <li><strong>Home modifications:</strong> Ramps, grab bars, etc.</li>
        <li><strong>Transportation:</strong> Help getting to appointments</li>
        <li><strong>Medication management:</strong> Help taking medications correctly</li>
      </ul>
      <p>These supports affect the feasibility and cost of aging in place.</p>
    `,
  },
  {
    id: 153,
    type: "Text",
    title: "Primary Caregivers",
    text: `
      <p>Select who <strong>currently provides care</strong> or who would likely step into that role.</p>
      <ul>
        <li><strong>Spouse/partner:</strong> Your husband, wife, or partner</li>
        <li><strong>Adult child:</strong> Your son or daughter</li>
        <li><strong>Other relative:</strong> Sibling, niece, nephew, etc.</li>
        <li><strong>Friend:</strong> Close friend willing to help</li>
        <li><strong>Hired help:</strong> Paid caregivers</li>
        <li><strong>None identified:</strong> No clear caregiver available</li>
      </ul>
      <p>Identifying caregivers is crucial for planning care coordination and potential caregiver agreements.</p>
    `,
  },
  {
    id: 154,
    type: "Text",
    title: "Caregivers Limited in Ability",
    text: `
      <p>Indicate if potential caregivers have <strong>limitations that affect their ability to assist</strong>.</p>
      <p>Consider whether caregivers have:</p>
      <ul>
        <li>Their own health problems</li>
        <li>Disabilities that limit caregiving</li>
        <li>Live far away</li>
        <li>Heavy work or family obligations</li>
        <li>Financial constraints</li>
      </ul>
      <p>This affects the feasibility of family caregiving and alternative care planning needs.</p>
    `,
  },
  {
    id: 155,
    type: "Text",
    title: "Medicare Coverage",
    text: `
      <p>Select which parts of <strong>Medicare</strong> you have.</p>
      <ul>
        <li><strong>Part A:</strong> Hospital insurance (usually premium-free)</li>
        <li><strong>Part B:</strong> Medical insurance (outpatient care)</li>
        <li><strong>Part C:</strong> Medicare Advantage (private plan combining A & B)</li>
        <li><strong>Part D:</strong> Prescription drug coverage</li>
      </ul>
      <p><strong>Important:</strong> Medicare does NOT pay for long-term custodial care. It only covers short-term skilled nursing after a hospital stay.</p>
    `,
  },
  {
    id: 156,
    type: "Text",
    title: "Medicare Supplement (Medigap)",
    text: `
      <p>Indicate if you have a <strong>Medicare supplement (Medigap)</strong> or other private health insurance.</p>
      <p>Medigap policies:</p>
      <ul>
        <li>Fill gaps in Original Medicare coverage</li>
        <li>Cover deductibles and copays</li>
        <li>May cover some services Medicare doesn't</li>
      </ul>
      <p>Note: Medigap does NOT cover long-term care costs.</p>
    `,
  },
  {
    id: 157,
    type: "Text",
    title: "Long-Term Care Insurance",
    text: `
      <p>Indicate if you have <strong>long-term care insurance</strong> or a hybrid policy.</p>
      <p>Types of coverage:</p>
      <ul>
        <li><strong>Traditional LTC insurance:</strong> Dedicated long-term care policy</li>
        <li><strong>Hybrid policies:</strong> Life insurance or annuity with LTC benefits</li>
      </ul>
      <p>If you have a policy, please provide:</p>
      <ul>
        <li>Insurance carrier name</li>
        <li>Daily/monthly benefit amount</li>
        <li>Elimination period (waiting period)</li>
        <li>Benefit period (how long benefits last)</li>
        <li>Inflation protection rider (if any)</li>
      </ul>
    `,
  },
  {
    id: 158,
    type: "Text",
    title: "Current Benefits",
    text: `
      <p>Select any <strong>public benefits</strong> you are currently receiving.</p>
      <ul>
        <li><strong>SSI:</strong> Supplemental Security Income for low-income individuals</li>
        <li><strong>SSDI:</strong> Social Security Disability Insurance</li>
        <li><strong>VA pension/Aid & Attendance:</strong> Veterans benefits for care needs</li>
        <li><strong>SNAP:</strong> Food assistance (food stamps)</li>
        <li><strong>Medicaid:</strong> Health coverage for low-income individuals</li>
        <li><strong>Medicaid HCBS waiver:</strong> Home and community-based services</li>
      </ul>
      <p>Existing benefits affect planning strategies and what additional benefits may be available.</p>
    `,
  },
  {
    id: 159,
    type: "Text",
    title: "Previous Medicaid Application",
    text: `
      <p>Indicate if you or your spouse have ever <strong>applied for Medicaid</strong> for long-term care.</p>
      <p>If yes, please provide:</p>
      <ul>
        <li>When the application was filed</li>
        <li>Whether it was approved or denied</li>
        <li>Reason for denial (if applicable)</li>
        <li>Whether you are currently on Medicaid</li>
      </ul>
      <p>Prior applications affect current planning and any penalty periods that may apply.</p>
    `,
  },
  {
    id: 160,
    type: "Text",
    title: "Gifts or Transfers in Last 5 Years",
    text: `
      <p>Indicate if you have made <strong>gifts or transfers of more than a modest amount</strong> in the last 5 years.</p>
      <p><strong>Why this matters:</strong> Medicaid has a <strong>5-year look-back period</strong>. Transfers made within 5 years of applying for Medicaid can result in a penalty period of ineligibility.</p>
      <p>Please disclose:</p>
      <ul>
        <li>Amounts transferred</li>
        <li>Who received the transfers</li>
        <li>Dates of transfers</li>
        <li>Purpose (gifts to family, charitable donations, etc.)</li>
      </ul>
    `,
  },
  {
    id: 161,
    type: "Text",
    title: "Expecting Windfall",
    text: `
      <p>Indicate if you are <strong>expecting a significant influx of money</strong>.</p>
      <p>Examples include:</p>
      <ul>
        <li>Inheritance from a family member</li>
        <li>Lawsuit settlement</li>
        <li>Sale of property or business</li>
        <li>Insurance proceeds</li>
        <li>Retirement account distributions</li>
      </ul>
      <p>Future windfalls can affect Medicaid eligibility and require proactive planning.</p>
    `,
  },
  {
    id: 162,
    type: "Text",
    title: "Staying with Spouse/Partner",
    text: `
      <p>Rate how important it is to <strong>stay with your spouse or partner</strong> if you need long-term care.</p>
      <p>Considerations:</p>
      <ul>
        <li>Some facilities can accommodate couples together</li>
        <li>Costs are typically higher for couple accommodations</li>
        <li>Different care needs may require different facilities</li>
      </ul>
      <p>This preference affects facility selection and planning for the community spouse.</p>
    `,
  },
  {
    id: 163,
    type: "Text",
    title: "Being Near Family",
    text: `
      <p>Rate how important it is to be <strong>near family members</strong>.</p>
      <p>Consider:</p>
      <ul>
        <li>Which family members would visit regularly</li>
        <li>Who would help coordinate care</li>
        <li>Geographic preferences</li>
      </ul>
      <p>Proximity to family affects facility selection and care coordination.</p>
    `,
  },
  {
    id: 164,
    type: "Text",
    title: "Religious or Cultural Environment",
    text: `
      <p>Rate how important a <strong>religious or cultural environment</strong> is in choosing a care setting.</p>
      <p>Some facilities offer:</p>
      <ul>
        <li>Religious services on-site</li>
        <li>Kosher or other dietary accommodations</li>
        <li>Cultural programming and activities</li>
        <li>Staff who speak your language</li>
      </ul>
      <p>Specialized facilities may be more or less available in different areas.</p>
    `,
  },
  {
    id: 165,
    type: "Text",
    title: "Pet-Friendly Policies",
    text: `
      <p>Rate how important <strong>pet-friendly policies</strong> are in choosing a care setting.</p>
      <p>Pet policies vary widely:</p>
      <ul>
        <li>Some facilities allow pets to live with residents</li>
        <li>Others have visiting pet programs</li>
        <li>Many do not allow pets at all</li>
      </ul>
      <p>If keeping a pet is important, facility options may be more limited.</p>
    `,
  },
  {
    id: 166,
    type: "Text",
    title: "Private Room",
    text: `
      <p>Rate how important a <strong>private room</strong> is in choosing a care setting.</p>
      <p>Consider:</p>
      <ul>
        <li>Private rooms cost significantly more than shared rooms</li>
        <li>Medicaid may only pay for a shared room</li>
        <li>Privacy may be important for your comfort</li>
      </ul>
      <p>This preference affects costs and may require supplemental private payment.</p>
    `,
  },
  {
    id: 167,
    type: "Text",
    title: "Social Activities",
    text: `
      <p>Rate how important <strong>social activities</strong> are in choosing a care setting.</p>
      <p>Facilities offer varying levels of activities:</p>
      <ul>
        <li>Group outings and events</li>
        <li>Exercise and wellness programs</li>
        <li>Arts and crafts, music programs</li>
        <li>Educational and cultural activities</li>
      </ul>
      <p>Active social engagement can improve quality of life and cognitive health.</p>
    `,
  },
  {
    id: 168,
    type: "Text",
    title: "On-Site Medical Staff",
    text: `
      <p>Rate how important <strong>on-site medical staff</strong> is in choosing a care setting.</p>
      <p>Staffing levels vary by facility type:</p>
      <ul>
        <li><strong>Skilled nursing:</strong> 24-hour nursing with physician oversight</li>
        <li><strong>Assisted living:</strong> Nursing staff available, but not 24/7 in all facilities</li>
        <li><strong>Independent living:</strong> Limited or no medical staff on-site</li>
      </ul>
      <p>Your medical needs determine the appropriate level of staffing.</p>
    `,
  },

  // Will/Trust Provisions Section (IDs 200-209)
  {
    id: 200,
    type: "Text",
    title: "Spouse and Children/Beneficiaries",
    text: `
      <p>This section establishes the <strong>primary structure</strong> of your estate plan - who receives your assets and in what order.</p>
      <p><strong>Key decisions in this section:</strong></p>
      <ul>
        <li><strong>Spouse First:</strong> Most married couples want everything to go to the surviving spouse, then to children after both pass</li>
        <li><strong>Equal Treatment:</strong> Decide if all children/beneficiaries should receive equal shares</li>
        <li><strong>Distribution Age:</strong> For children, you can delay distribution until they reach a certain age (e.g., 25, 30, 35)</li>
        <li><strong>Per Stirpes:</strong> If a child predeceases you, their share can pass to their children (your grandchildren)</li>
      </ul>
      <p><strong>Why these decisions matter:</strong></p>
      <ul>
        <li>Ensures your surviving spouse is financially secure</li>
        <li>Protects young beneficiaries from receiving large sums too early</li>
        <li>Prevents assets from passing outside your family if a child dies before you</li>
      </ul>
    `,
  },
  {
    id: 201,
    type: "Text",
    title: "Specific Gifts",
    text: `
      <p><strong>Specific Gifts</strong> (also called "specific bequests" or "specific devises") are provisions in your Will or Trust that leave particular, identified items to specific individuals.</p>
      <p><strong>Examples of Specific Gifts:</strong></p>
      <ul>
        <li>Grandmother's diamond ring to your daughter</li>
        <li>The grandfather clock to your nephew</li>
        <li>Your art collection to a specific museum</li>
        <li>A particular piece of real estate to one child</li>
        <li>Your vintage car to a friend or family member</li>
        <li>Family heirlooms with sentimental value</li>
      </ul>
      <p><strong>Why Specific Gifts matter:</strong></p>
      <ul>
        <li>Ensures meaningful items go to the people you intend</li>
        <li>Prevents family disputes over sentimental possessions</li>
        <li>Allows you to honor special relationships</li>
        <li>These gifts are distributed first, before the residuary estate</li>
      </ul>
      <p><strong>Note:</strong> If a specific gift item no longer exists at your death (sold, lost, or destroyed), the gift typically "lapses" and the recipient receives nothing in its place unless you specify otherwise.</p>
    `,
  },
  {
    id: 202,
    type: "Text",
    title: "Gifts of Cash",
    text: `
      <p><strong>Gifts of Cash</strong> (also called "general bequests" or "pecuniary gifts") are specific dollar amounts left to named individuals or organizations.</p>
      <p><strong>Examples of Cash Gifts:</strong></p>
      <ul>
        <li>$10,000 to a favorite nephew</li>
        <li>$5,000 to a longtime caregiver</li>
        <li>$25,000 to your church or a charity</li>
        <li>$50,000 to a grandchild for education</li>
      </ul>
      <p><strong>How Cash Gifts work:</strong></p>
      <ul>
        <li>Paid from your estate before the residuary is distributed</li>
        <li>Recipients receive the exact dollar amount specified</li>
        <li>If your estate doesn't have enough cash, other assets may need to be sold</li>
        <li>Cash gifts are typically paid before percentage-based distributions</li>
      </ul>
      <p><strong>Important consideration:</strong> If your estate shrinks significantly before death, large cash gifts could consume most of the estate, leaving little for residuary beneficiaries. Consider this when setting amounts.</p>
    `,
  },
  {
    id: 203,
    type: "Text",
    title: "Will/Trust Distribution Plans",
    text: `
      <p>This section defines <strong>how your probate and trust assets</strong> will be distributed after your death.</p>
      <p><strong>Three Distribution Options:</strong></p>
      <ul>
        <li><strong>Sweetheart Plan:</strong> Everything goes to your spouse first, then equally to children. This is the most common choice for married couples.</li>
        <li><strong>Spouse First, Differing Amounts:</strong> Spouse receives everything first, but if spouse predeceases you, beneficiaries receive different percentages (not equal shares).</li>
        <li><strong>Completely Custom:</strong> Full control over which specific assets go to which beneficiaries, with custom residuary distributions.</li>
      </ul>
      <p><strong>Understanding Probate vs. Non-Probate Assets:</strong></p>
      <ul>
        <li><strong>Probate assets:</strong> Pass through your Will/Trust (real estate, vehicles, bank accounts without beneficiaries)</li>
        <li><strong>Non-probate assets:</strong> Pass directly to named beneficiaries (retirement accounts, life insurance, accounts with POD/TOD designations)</li>
      </ul>
      <p><strong>Mirror Plans:</strong> If both spouses want identical plans, check the "Mirror Plans" box to avoid entering information twice.</p>
    `,
  },
  {
    id: 204,
    type: "Text",
    title: "Additional Comments",
    text: `
      <p>Use this section to share any <strong>additional information</strong> about your estate planning wishes that wasn't covered in the previous questions.</p>
      <p><strong>Topics you might address:</strong></p>
      <ul>
        <li>Special circumstances affecting your distribution wishes</li>
        <li>Concerns about specific beneficiaries</li>
        <li>Family dynamics that should be considered</li>
        <li>Reasons for unequal distributions</li>
        <li>Conditions you want placed on inheritances</li>
        <li>Wishes regarding family businesses</li>
        <li>Instructions for personal property not specifically listed</li>
      </ul>
      <p>This information helps your attorney understand the complete picture and draft documents that truly reflect your intentions.</p>
    `,
  },
  {
    id: 205,
    type: "Text",
    title: "First Alternate Personal Representative",
    text: `
      <p>The <strong>First Alternate</strong> Personal Representative serves if your first choice is unable or unwilling to serve.</p>
      <p>Common reasons an alternate may be needed:</p>
      <ul>
        <li>Primary choice has predeceased you</li>
        <li>Primary choice has become incapacitated</li>
        <li>Primary choice declines to serve</li>
        <li>Primary choice is unavailable or has moved away</li>
      </ul>
    `,
  },
  {
    id: 206,
    type: "Text",
    title: "Second Alternate Personal Representative",
    text: `
      <p>The <strong>Second Alternate</strong> serves if both your first choice and first alternate are unable to serve.</p>
      <p>Having multiple alternates provides backup planning and ensures your estate can be properly administered.</p>
    `,
  },
  {
    id: 207,
    type: "Text",
    title: "Primary Beneficiary (Will)",
    text: `
      <p>The <strong>Primary Beneficiary</strong> is the main person or entity who receives your assets under the Will.</p>
      <p>For married couples, this is typically the surviving spouse. For single individuals, it might be children equally or another chosen beneficiary.</p>
    `,
  },
  {
    id: 208,
    type: "Text",
    title: "Secondary Beneficiaries (Will)",
    text: `
      <p><strong>Secondary Beneficiaries</strong> receive your assets if the primary beneficiary predeceases you or is otherwise unable to inherit.</p>
      <p>This typically includes children, grandchildren, or other loved ones you wish to benefit.</p>
    `,
  },
  {
    id: 209,
    type: "Text",
    title: "Specific Gifts of Real Estate",
    text: `
      <p>A <strong>Specific Gift of Real Estate</strong> leaves a particular property to a named person.</p>
      <p>Examples:</p>
      <ul>
        <li>"I leave my home at 123 Main Street to my daughter Jane"</li>
        <li>"I leave the vacation home in Michigan to my son John"</li>
      </ul>
      <p>List any real estate that your Will specifically bequeaths to a particular person.</p>
    `,
  },
  {
    id: 210,
    type: "Text",
    title: "Existing Estate Planning Documents",
    text: `
      <p>Check each <strong>estate planning document</strong> you currently have in place.</p>
      <p><strong>Common documents include:</strong></p>
      <ul>
        <li><strong>Will:</strong> Specifies how your assets should be distributed after death and names a Personal Representative</li>
        <li><strong>Trust:</strong> A legal arrangement where a trustee holds and manages assets for beneficiaries. For married couples, this may be a joint trust.</li>
        <li><strong>Financial POA:</strong> Authorizes someone to handle financial matters on your behalf if you become incapacitated</li>
        <li><strong>Health Care POA:</strong> Authorizes someone to make medical decisions for you if you cannot</li>
        <li><strong>Living Will:</strong> Specifies your wishes regarding end-of-life medical treatment</li>
      </ul>
      <p><strong>Why we ask for date and state:</strong></p>
      <ul>
        <li>Laws vary by state - documents from other states may need updates</li>
        <li>Older documents may not reflect current law or your current wishes</li>
        <li>Florida has specific requirements that differ from other states</li>
      </ul>
    `,
  },
  {
    id: 211,
    type: "Text",
    title: "Additional Comments About Documents",
    text: `
      <p>Use this section to share any <strong>additional information</strong> about your existing estate planning documents.</p>
      <p><strong>Topics you might address:</strong></p>
      <ul>
        <li>Concerns about whether your documents are up to date</li>
        <li>Changes in your life since documents were signed (new children, divorce, etc.)</li>
        <li>Documents you know need to be updated</li>
        <li>Questions about whether your documents are still valid</li>
        <li>Any amendments or codicils that have been made</li>
      </ul>
      <p>This information helps us prepare for your consultation and identify what updates may be needed.</p>
    `,
  },
  {
    id: 212,
    type: "Text",
    title: "Trustee",
    text: `
      <p>The <strong>Trustee</strong> is the person or institution responsible for managing your Trust.</p>
      <p>Trustee responsibilities include:</p>
      <ul>
        <li>Managing and investing trust assets</li>
        <li>Making distributions to beneficiaries according to trust terms</li>
        <li>Keeping accurate records and accounts</li>
        <li>Filing trust tax returns</li>
        <li>Acting in the best interest of beneficiaries</li>
      </ul>
    `,
  },
  {
    id: 213,
    type: "Text",
    title: "First Alternate Trustee",
    text: `
      <p>The <strong>First Alternate Trustee</strong> (Successor Trustee) serves if the primary Trustee is unable or unwilling to serve.</p>
      <p>This ensures continuity of trust management without court intervention.</p>
    `,
  },
  {
    id: 214,
    type: "Text",
    title: "Second Alternate Trustee",
    text: `
      <p>The <strong>Second Alternate Trustee</strong> serves if both the primary Trustee and first alternate are unavailable.</p>
      <p>Having multiple successor trustees provides additional backup for trust administration.</p>
    `,
  },
  {
    id: 215,
    type: "Text",
    title: "Primary Beneficiary (Trust)",
    text: `
      <p>The <strong>Primary Beneficiary</strong> of your Trust is the main person who benefits from trust assets.</p>
      <p>During your lifetime, you are typically the primary beneficiary of your own revocable trust. After death, this typically becomes your spouse or other designated beneficiaries.</p>
    `,
  },
  {
    id: 216,
    type: "Text",
    title: "Secondary Beneficiaries (Trust)",
    text: `
      <p><strong>Secondary Beneficiaries</strong> (Remainder Beneficiaries) receive trust assets after the primary beneficiary.</p>
      <p>For married couples, secondary beneficiaries are often children who inherit after both spouses have passed.</p>
    `,
  },
  {
    id: 217,
    type: "Text",
    title: "Trust - Specific Gifts of Real Estate",
    text: `
      <p>List any <strong>real estate</strong> that your Trust specifically distributes to particular persons.</p>
      <p>This is similar to specific bequests in a Will, but for assets held in your Trust.</p>
    `,
  },
  {
    id: 218,
    type: "Text",
    title: "Trust - Specific Gifts of Other Assets",
    text: `
      <p>List any <strong>specific assets</strong> (other than real estate) that your Trust distributes to particular persons.</p>
      <p>Examples include jewelry, artwork, vehicles, or other valuable personal property.</p>
    `,
  },
  {
    id: 219,
    type: "Text",
    title: "Trust - General Gifts of Money",
    text: `
      <p>List any <strong>specific dollar amounts</strong> that your Trust distributes to particular persons or charities.</p>
    `,
  },
  {
    id: 220,
    type: "Text",
    title: "Financial POA - First Agent",
    text: `
      <p>The <strong>First Agent</strong> under your Financial Power of Attorney is the primary person authorized to handle your financial affairs.</p>
      <p>This person can:</p>
      <ul>
        <li>Access bank accounts</li>
        <li>Pay bills</li>
        <li>Manage investments</li>
        <li>File tax returns</li>
        <li>Handle real estate transactions</li>
      </ul>
    `,
  },
  {
    id: 221,
    type: "Text",
    title: "Financial POA - Second Agent",
    text: `
      <p>The <strong>Second Agent</strong> serves as backup if your first agent is unable or unwilling to act.</p>
      <p>This ensures someone is always available to manage your finances if needed.</p>
    `,
  },
  {
    id: 222,
    type: "Text",
    title: "Financial POA - Third Agent",
    text: `
      <p>The <strong>Third Agent</strong> provides an additional level of backup for financial management.</p>
    `,
  },
  {
    id: 223,
    type: "Text",
    title: "Health Care POA - First Agent",
    text: `
      <p>The <strong>First Agent</strong> (Health Care Surrogate) under your Health Care Power of Attorney is authorized to make medical decisions on your behalf.</p>
      <p>This person can:</p>
      <ul>
        <li>Consent to or refuse medical treatment</li>
        <li>Access your medical records</li>
        <li>Choose doctors and hospitals</li>
        <li>Make end-of-life care decisions</li>
      </ul>
    `,
  },
  {
    id: 224,
    type: "Text",
    title: "Health Care POA - Second Agent",
    text: `
      <p>The <strong>Second Agent</strong> serves if your first health care agent is unavailable or unable to act.</p>
    `,
  },
  {
    id: 225,
    type: "Text",
    title: "Health Care POA - Third Agent",
    text: `
      <p>The <strong>Third Agent</strong> provides additional backup for health care decision-making.</p>
    `,
  },
  {
    id: 226,
    type: "Text",
    title: "HIPAA Compliance",
    text: `
      <p><strong>HIPAA</strong> (Health Insurance Portability and Accountability Act) protects your medical information privacy.</p>
      <p>A HIPAA-compliant Health Care POA includes authorization for your agent to:</p>
      <ul>
        <li>Access your medical records</li>
        <li>Speak with doctors and other healthcare providers</li>
        <li>Receive information about your diagnosis, treatment, and prognosis</li>
      </ul>
      <p>Older documents may not include HIPAA authorization, which was required after 2003.</p>
    `,
  },
  {
    id: 227,
    type: "Text",
    title: "Do Not Resuscitate (DNR) Order",
    text: `
      <p>A <strong>Do Not Resuscitate (DNR)</strong> order is a medical order that tells healthcare providers not to perform CPR if your heart stops or you stop breathing.</p>
      <p>A DNR is different from a Living Will:</p>
      <ul>
        <li><strong>DNR:</strong> A specific medical order, usually signed by a physician</li>
        <li><strong>Living Will:</strong> A broader document expressing your wishes about life-sustaining treatment</li>
      </ul>
      <p>In Florida, the form is called a "Do Not Resuscitate Order" (DNRO) and must be signed by your physician.</p>
    `,
  },
  {
    id: 228,
    type: "Text",
    title: "Living Will",
    text: `
      <p>A <strong>Living Will</strong> (Advance Directive) is a legal document that specifies your wishes regarding end-of-life medical treatment.</p>
      <p>A Living Will typically addresses:</p>
      <ul>
        <li>Life-prolonging procedures when death is imminent</li>
        <li>Artificial nutrition and hydration</li>
        <li>Mechanical ventilation</li>
        <li>Comfort care and pain management</li>
      </ul>
      <p>This is separate from your Health Care POA, which names someone to make decisions for you.</p>
    `,
  },
  {
    id: 229,
    type: "Text",
    title: "Additional Comments - Current Estate Plan",
    text: `
      <p>Use this space to provide any <strong>additional information</strong> about your current estate planning documents.</p>
      <p>You might include:</p>
      <ul>
        <li>Concerns about your current documents</li>
        <li>Changes you're considering</li>
        <li>Questions for our team</li>
        <li>Information about other planning you've done</li>
        <li>Details about previous attorney relationships</li>
      </ul>
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
      case "Video":
        const videoUrl = helpContent.videoUrl || "";
        const provider =
          helpContent.videoProvider || detectVideoProvider(videoUrl);

        const renderVideoPlayer = () => {
          if (!videoUrl) {
            return (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  height: 200,
                  bgcolor: "#f5f5f5",
                  borderRadius: 1,
                }}
              >
                <Typography color="text.secondary">
                  No video URL provided
                </Typography>
              </Box>
            );
          }

          switch (provider) {
            case "youtube":
              const youtubeId = getYouTubeId(videoUrl);
              if (!youtubeId) return null;
              return (
                <Box
                  sx={{
                    position: "relative",
                    paddingBottom: "56.25%", // 16:9 aspect ratio
                    height: 0,
                    overflow: "hidden",
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
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      height: "100%",
                      border: "none",
                    }}
                  />
                </Box>
              );

            case "vimeo":
              const vimeoId = getVimeoId(videoUrl);
              if (!vimeoId) return null;
              return (
                <Box
                  sx={{
                    position: "relative",
                    paddingBottom: "56.25%",
                    height: 0,
                    overflow: "hidden",
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
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      height: "100%",
                      border: "none",
                    }}
                  />
                </Box>
              );

            case "mp4":
              return (
                <Box sx={{ mb: 2 }}>
                  <video
                    controls
                    style={{
                      width: "100%",
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
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    mb: 2,
                    p: 2,
                    bgcolor: "#f5f5f5",
                    borderRadius: 1,
                  }}
                >
                  <PlayCircleOutlineIcon
                    sx={{ color: "#1a237e", fontSize: 40 }}
                  />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Video Tutorial
                    </Typography>
                    <Link
                      href={videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{ color: "#1a237e" }}
                    >
                      Watch Video{" "}
                      <OpenInNewIcon
                        fontSize="small"
                        sx={{ ml: 0.5, verticalAlign: "middle" }}
                      />
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
                  "& p": { mb: 2, lineHeight: 1.7 },
                  "& ul": { pl: 3, mb: 2 },
                  "& li": { mb: 0.5, lineHeight: 1.6 },
                  "& strong": { color: "#1a237e" },
                }}
              />
            )}
          </Box>
        );

      case "Link":
        return (
          <Box>
            <Box
              dangerouslySetInnerHTML={{ __html: helpContent.text }}
              sx={{
                "& p": { mb: 2 },
                "& ul": { pl: 3, mb: 2 },
                "& li": { mb: 0.5 },
              }}
            />
            {helpContent.linkUrl && (
              <Box sx={{ mt: 2 }}>
                <Link
                  href={helpContent.linkUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 0.5,
                    color: "#1a237e",
                  }}
                >
                  {helpContent.linkText || "Learn More"}
                  <OpenInNewIcon fontSize="small" />
                </Link>
              </Box>
            )}
          </Box>
        );

      case "Text":
      default:
        return (
          <Box
            dangerouslySetInnerHTML={{ __html: helpContent.text }}
            sx={{
              "& p": { mb: 2, lineHeight: 1.7 },
              "& ul": { pl: 3, mb: 2 },
              "& li": { mb: 0.5, lineHeight: 1.6 },
              "& strong": { color: "#1a237e" },
              "& em": { color: "text.secondary", fontStyle: "italic" },
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
          boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
        },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          bgcolor: "#1a237e",
          color: "white",
          py: 1.5,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Box
            sx={{
              width: 28,
              height: 28,
              borderRadius: "50%",
              bgcolor: "#FFD700",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1rem",
              fontWeight: 700,
              color: "#1a237e",
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
          sx={{
            color: "white",
            "&:hover": { bgcolor: "rgba(255,255,255,0.1)" },
          }}
          size="small"
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ pt: 3 }}>{renderContent()}</DialogContent>
      <DialogActions sx={{ px: 3, pb: 2, justifyContent: "space-between" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <img
            src="/logo.jpg"
            alt="Company Logo"
            style={{ height: 32, width: "auto" }}
          />
          <Typography
            variant="caption"
            sx={{ color: "text.secondary", fontSize: "0.7rem" }}
          >
            Zaacharia Brown & Bratkovich &copy; 2026
          </Typography>
        </Box>
        <Button
          onClick={onClose}
          variant="contained"
          sx={{
            bgcolor: "#1a237e",
            "&:hover": { bgcolor: "#0d1642" },
          }}
        >
          Got It
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default HelpModal;
