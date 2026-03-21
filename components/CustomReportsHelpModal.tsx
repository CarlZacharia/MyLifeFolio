'use client';

import React from 'react';
import { Typography, Box, Divider } from '@mui/material';
import { folioColors } from './FolioModal';
import ResourceHelpModal, { HelpSection, helpBodySx } from './ResourceHelpModal';

interface CustomReportsHelpModalProps {
  open: boolean;
  onClose: () => void;
}

const body = helpBodySx;

const CustomReportsHelpModal: React.FC<CustomReportsHelpModalProps> = ({ open, onClose }) => (
  <ResourceHelpModal
    open={open}
    onClose={onClose}
    title="How Custom Reports Work"
    audioSrc="/audio/resources/custom-reports.mp3"
  >
    <Typography sx={{ ...body, mb: 2.5 }}>
      Custom Reports let you combine any sections of your folio into a single,
      focused document — tailored to a specific person, purpose, or conversation.
      Instead of handing someone your entire folio, you choose exactly what they
      need to see.
    </Typography>

    <HelpSection title="Standard Reports vs. Custom Reports">
      <Typography sx={body}>
        The <strong>Standard Reports</strong> tab contains 13 pre-built reports
        covering common needs — emergency medical information, asset inventories,
        estate planning overviews, and more. These are ready to view immediately
        based on the data you have entered across your folio.
      </Typography>
      <Typography sx={{ ...body, mt: 1 }}>
        The <strong>Custom Report Builder</strong> goes further: it lets you
        hand-pick individual sections from any category and combine them into a
        single report you can name, save, and return to later.
      </Typography>
    </HelpSection>

    <HelpSection title="Building a Custom Report">
      <Typography sx={body}>
        Open the <strong>Custom Report Builder</strong> tab and you will see
        expandable groups for every folio category — Personal &amp; Family,
        Financial &amp; Insurance, Medical &amp; Care, Legal &amp; Documents,
        and Legacy &amp; Digital. Expand any group and check the specific
        sections you want included. A counter next to each category shows how
        many items you have selected out of the total available.
      </Typography>
    </HelpSection>

    <HelpSection title="Preset Reports">
      <Typography sx={body}>
        Not sure where to start? Five <strong>preset templates</strong> are
        available — Complete Folio Report, Emergency &amp; Medical, Financial
        Overview, Estate Planning Summary, and End of Life &amp; Legacy. Clicking
        a preset automatically checks the relevant sections for you. You can then
        add or remove individual items before saving.
      </Typography>
    </HelpSection>

    <Divider sx={{ borderColor: folioColors.parchment, my: 2 }} />

    <HelpSection title="Saving & Managing Reports">
      <Typography sx={body}>
        Give your report a name and an optional description, then click{' '}
        <strong>Save</strong>. Saved reports appear in the left sidebar and can
        be loaded, edited, or deleted at any time. When your folio data changes,
        the report automatically reflects the latest information — there is no
        need to rebuild it.
      </Typography>
    </HelpSection>

    <HelpSection title="Previewing & Sharing">
      <Typography sx={body}>
        Click <strong>Preview</strong> to see exactly how your custom report
        will look. The preview renders each selected section in a clean,
        print-ready layout. You can print it directly or use your browser's
        print-to-PDF feature to create a shareable document.
      </Typography>
    </HelpSection>

    <HelpSection title="When to Use Custom Reports">
      <Typography sx={body}>
        Custom reports are ideal when you need to share specific information
        with a particular person — for example, a report for your attorney that
        includes only estate planning and legal documents, or a report for your
        adult children that combines emergency contacts, medical information,
        and care preferences. By selecting only what is relevant, you keep
        sensitive information private and make the document easier to read.
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
        <strong>Tip:</strong> Start by creating a report for the person most
        likely to need your information in an emergency. Select the sections
        they would need — medical data, emergency contacts, insurance, and
        care preferences — and save it with their name. You can always adjust
        it later as your folio grows.
      </Typography>
    </Box>
  </ResourceHelpModal>
);

export default CustomReportsHelpModal;
