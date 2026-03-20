'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Box, Button, Typography, IconButton, Divider, Alert, CircularProgress,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DescriptionIcon from '@mui/icons-material/Description';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import TextSnippetIcon from '@mui/icons-material/TextSnippet';
import CloudDoneIcon from '@mui/icons-material/CloudDone';
import FamilyRestroomIcon from '@mui/icons-material/FamilyRestroom';
import { Document, Packer, Paragraph, TextRun, AlignmentType } from 'docx';
import { jsPDF } from 'jspdf';
import { folioColors } from './FolioModal';
import { uploadObituaryPdf } from '../lib/supabaseStorage';
import { supabase } from '../lib/supabase';

interface Props {
  open: boolean;
  onClose: () => void;
  obituaryText: string;
  personName: string;
  clientFolderName?: string;
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function sanitizeFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 40) || 'obituary';
}

function generatePdfBlob(text: string, personName: string): Blob {
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'letter' });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const margin = 25;
  const usableWidth = pageWidth - margin * 2;

  pdf.setFont('times', 'bold');
  pdf.setFontSize(16);
  pdf.text(`Obituary — ${personName}`, pageWidth / 2, 30, { align: 'center' });

  pdf.setFont('times', 'normal');
  pdf.setFontSize(12);

  const lines = pdf.splitTextToSize(text, usableWidth);
  let y = 45;
  const lineHeight = 6;
  const pageHeight = pdf.internal.pageSize.getHeight();

  for (const line of lines) {
    if (y + lineHeight > pageHeight - margin) {
      pdf.addPage();
      y = margin;
    }
    pdf.text(line, margin, y);
    y += lineHeight;
  }

  return pdf.output('blob');
}

async function downloadAsText(text: string, personName: string) {
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  downloadBlob(blob, `${sanitizeFilename(personName)}_obituary.txt`);
}

async function downloadAsDocx(text: string, personName: string) {
  const paragraphs = text.split('\n').filter((line) => line.trim() !== '').map((line) => (
    new Paragraph({
      children: [new TextRun({ text: line, font: 'Georgia', size: 24 })],
      spacing: { after: 200 },
      alignment: AlignmentType.LEFT,
    })
  ));

  const doc = new Document({
    sections: [{
      properties: {
        page: {
          margin: { top: 1440, bottom: 1440, left: 1440, right: 1440 },
        },
      },
      children: [
        new Paragraph({
          children: [new TextRun({
            text: `Obituary — ${personName}`,
            bold: true,
            font: 'Georgia',
            size: 32,
          })],
          spacing: { after: 400 },
          alignment: AlignmentType.CENTER,
        }),
        ...paragraphs,
      ],
    }],
  });

  const blob = await Packer.toBlob(doc);
  downloadBlob(blob, `${sanitizeFilename(personName)}_obituary.docx`);
}

function downloadAsPdf(text: string, personName: string) {
  const blob = generatePdfBlob(text, personName);
  downloadBlob(blob, `${sanitizeFilename(personName)}_obituary.pdf`);
}

const ObituaryPreviewModal: React.FC<Props> = ({
  open, onClose, obituaryText, personName, clientFolderName,
}) => {
  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [shareStatus, setShareStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [shareError, setShareError] = useState('');
  const lastSavedTextRef = useRef('');

  // Auto-save PDF to estate-planning-intakes when the modal opens with new text
  useEffect(() => {
    if (!open || !obituaryText || !clientFolderName) return;
    if (obituaryText === lastSavedTextRef.current) return;

    let cancelled = false;
    const autoSave = async () => {
      setAutoSaveStatus('saving');
      try {
        const pdfBlob = generatePdfBlob(obituaryText, personName);
        const result = await uploadObituaryPdf(pdfBlob, clientFolderName, personName);
        if (cancelled) return;
        if (result.success) {
          setAutoSaveStatus('saved');
          lastSavedTextRef.current = obituaryText;
        } else {
          console.error('Auto-save failed:', result.error);
          setAutoSaveStatus('error');
        }
      } catch (err) {
        if (cancelled) return;
        console.error('Auto-save error:', err);
        setAutoSaveStatus('error');
      }
    };

    autoSave();
    return () => { cancelled = true; };
  }, [open, obituaryText, personName, clientFolderName]);

  // Reset share status when modal closes
  useEffect(() => {
    if (!open) {
      setShareStatus('idle');
      setShareError('');
    }
  }, [open]);

  const handleShareWithFamily = async () => {
    setShareStatus('saving');
    setShareError('');
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setShareError('Not authenticated');
        setShareStatus('error');
        return;
      }

      const pdfBlob = generatePdfBlob(obituaryText, personName);
      const cleanName = sanitizeFilename(personName);
      const date = new Date().toISOString().split('T')[0];
      const storagePath = `${user.id}/${crypto.randomUUID()}.pdf`;
      const fileName = `${cleanName}_obituary_${date}.pdf`;

      // Upload to folio-documents bucket
      const { error: uploadError } = await supabase.storage
        .from('folio-documents')
        .upload(storagePath, pdfBlob, {
          contentType: 'application/pdf',
          upsert: false,
        });

      if (uploadError) throw uploadError;

      // Create metadata record (visible_to empty — owner configures access in Family Access Manager)
      const { error: insertError } = await supabase
        .from('folio_documents')
        .insert({
          owner_id: user.id,
          file_name: fileName,
          storage_path: storagePath,
          file_size: pdfBlob.size,
          mime_type: 'application/pdf',
          description: `Generated obituary for ${personName}`,
          visible_to: [],
        });

      if (insertError) throw insertError;

      setShareStatus('saved');
    } catch (err) {
      console.error('Share with family error:', err);
      setShareError('Failed to share. Please try again.');
      setShareStatus('error');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth
      PaperProps={{ sx: { borderRadius: 3, minHeight: '70vh' } }}>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <DescriptionIcon sx={{ color: folioColors.accent }} />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>Generated Obituary</Typography>
          {autoSaveStatus === 'saving' && (
            <CircularProgress size={16} sx={{ color: folioColors.inkLight, ml: 1 }} />
          )}
          {autoSaveStatus === 'saved' && (
            <CloudDoneIcon sx={{ color: '#4caf50', fontSize: 20, ml: 1 }} titleAccess="Saved to your folio" />
          )}
        </Box>
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <Divider />

      <DialogContent sx={{ py: 3, px: { xs: 3, md: 5 } }}>
        <Box sx={{
          fontFamily: 'Georgia, "Times New Roman", serif',
          fontSize: '1.05rem',
          lineHeight: 1.8,
          color: '#2c2c2c',
          whiteSpace: 'pre-wrap',
          maxWidth: 680,
          mx: 'auto',
        }}>
          {obituaryText}
        </Box>
      </DialogContent>

      <Divider />

      {shareError && (
        <Alert severity="error" sx={{ mx: 3, mt: 1 }}>{shareError}</Alert>
      )}

      <DialogActions sx={{ px: 3, py: 2, justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Typography variant="body2" color="text.secondary">
            Download as:
          </Typography>
          <Button variant="outlined" size="small" startIcon={<TextSnippetIcon />}
            onClick={() => downloadAsText(obituaryText, personName)}
            sx={{ textTransform: 'none', borderColor: folioColors.inkLight, color: folioColors.ink }}>
            Text (.txt)
          </Button>
          <Button variant="outlined" size="small" startIcon={<DescriptionIcon />}
            onClick={() => downloadAsDocx(obituaryText, personName)}
            sx={{ textTransform: 'none', borderColor: '#2b5797', color: '#2b5797' }}>
            Word (.docx)
          </Button>
          <Button variant="outlined" size="small" startIcon={<PictureAsPdfIcon />}
            onClick={() => downloadAsPdf(obituaryText, personName)}
            sx={{ textTransform: 'none', borderColor: '#d32f2f', color: '#d32f2f' }}>
            PDF (.pdf)
          </Button>
        </Box>
        <Button
          variant="outlined"
          size="small"
          startIcon={shareStatus === 'saving' ? <CircularProgress size={16} color="inherit" /> : shareStatus === 'saved' ? <CloudDoneIcon /> : <FamilyRestroomIcon />}
          onClick={handleShareWithFamily}
          disabled={shareStatus === 'saving' || shareStatus === 'saved'}
          sx={{
            textTransform: 'none',
            borderColor: shareStatus === 'saved' ? '#4caf50' : folioColors.accent,
            color: shareStatus === 'saved' ? '#4caf50' : folioColors.accent,
            '&:hover': { borderColor: shareStatus === 'saved' ? '#4caf50' : '#b8922a', bgcolor: 'rgba(201,162,39,0.06)' },
          }}
        >
          {shareStatus === 'saved' ? 'Added to Family Documents' : shareStatus === 'saving' ? 'Sharing...' : 'Share with Family'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ObituaryPreviewModal;
