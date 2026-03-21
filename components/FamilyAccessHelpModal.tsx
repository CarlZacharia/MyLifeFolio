'use client';

import React from 'react';
import { Typography, Box, Divider } from '@mui/material';
import { folioColors } from './FolioModal';
import ResourceHelpModal, { HelpSection, helpBodySx } from './ResourceHelpModal';

interface FamilyAccessHelpModalProps {
  open: boolean;
  onClose: () => void;
}

const body = helpBodySx;

const FamilyAccessHelpModal: React.FC<FamilyAccessHelpModalProps> = ({ open, onClose }) => (
  <ResourceHelpModal
    open={open}
    onClose={onClose}
    title="How Family Access Works"
    audioSrc="/audio/resources/family-access.mp3"
  >
    <Typography sx={{ ...body, mb: 2.5 }}>
      Family Access gives you a secure way to share selected portions of your
      folio with trusted family members — without giving them your login
      credentials or exposing information they do not need to see. You stay in
      complete control of who can see what, and every interaction is logged.
    </Typography>

    <HelpSection title="Adding Family Members">
      <Typography sx={body}>
        Click <strong>Add Family Member</strong> to authorize someone by name
        and email address. If you have already entered family members in your
        folio (spouse, children, beneficiaries), they will appear as{' '}
        <strong>Quick-Add Suggestions</strong> so you can authorize them with
        one click. Each person receives their own separate access — you can
        add as many family members as you need.
      </Typography>
    </HelpSection>

    <HelpSection title="Section-Based Permissions">
      <Typography sx={body}>
        When you add or edit a family member, you choose exactly which folio
        sections they can view: Personal Info, Medical, Financial, Legal,
        Advisors, End of Life, Insurance, and Family. There is also a{' '}
        <strong>Full Sensitive Data</strong> option that, when enabled, shows
        unmasked SSNs, account numbers, and policy numbers. When this option
        is off, those values are automatically masked (e.g., "****1234").
      </Typography>
    </HelpSection>

    <HelpSection title="Report Access">
      <Typography sx={body}>
        Beyond raw folio sections, you can also grant access to specific{' '}
        <strong>reports</strong> — Emergency Medical Summary, Asset Inventory,
        Estate Planning Overview, and more. Only the reports you explicitly
        check will be visible in the family member's portal. This lets you
        give someone a polished, focused document without exposing the
        underlying data.
      </Typography>
    </HelpSection>

    <Divider sx={{ borderColor: folioColors.parchment, my: 2 }} />

    <HelpSection title="How Family Members Sign In">
      <Typography sx={body}>
        Family members do not need a MyLifeFolio account. When they visit the
        Family Access portal and enter their email, a <strong>6-digit
        one-time code</strong> is sent to their inbox. They enter the code to
        sign in, and their session lasts up to four hours. You can include
        optional <strong>Credential Vault Instructions</strong> for each
        person — for example, where to find a password manager entry — to
        help them locate the portal link.
      </Typography>
    </HelpSection>

    <HelpSection title="AI Chat">
      <Typography sx={body}>
        The family portal includes a <strong>Chat</strong> tab powered by AI.
        Family members can ask natural-language questions about the data you
        have shared with them — for example, "Who is Mom's primary care
        doctor?" or "What medications is Dad taking?" The AI only answers
        from the sections you have authorized, so restricted information
        remains private. Every question and response is recorded in your
        access log.
      </Typography>
    </HelpSection>

    <HelpSection title="Shared Documents">
      <Typography sx={body}>
        Use the <strong>Documents</strong> tab to upload files — PDFs, images,
        spreadsheets, or Word documents — and choose which family members can
        see each one. This is ideal for sharing scanned legal documents,
        insurance cards, or care instructions with specific people.
      </Typography>
    </HelpSection>

    <HelpSection title="Access Log">
      <Typography sx={body}>
        Every sign-in, chat question, report viewed, and document downloaded
        is recorded in the <strong>Access Log</strong>. You can review it at
        any time to see exactly who accessed your folio, when, and what they
        looked at. This gives you full visibility and peace of mind.
      </Typography>
    </HelpSection>

    <Box
      sx={{
        mt: 1,
        p: 1.5,
        bgcolor: '#fff8e1',
        borderRadius: '8px',
        border: '1px solid #ffe082',
      }}
    >
      <Typography sx={{ ...body, fontSize: '12.5px', color: '#6d4c00' }}>
        <strong>Tip:</strong> Start by adding the one person most likely to
        need your information in an emergency — typically a spouse or adult
        child. Give them access to Medical, Advisors, and Insurance sections
        along with the Emergency Medical Summary report. You can always
        expand their permissions or add more people later.
      </Typography>
    </Box>
  </ResourceHelpModal>
);

export default FamilyAccessHelpModal;
