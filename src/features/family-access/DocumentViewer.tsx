import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Table, TableBody, TableCell, TableHead, TableRow,
  IconButton, CircularProgress, Tooltip,
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import ImageIcon from '@mui/icons-material/Image';
import TableChartIcon from '@mui/icons-material/TableChart';
import DescriptionIcon from '@mui/icons-material/Description';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import { supabase } from '../../../lib/supabase';

interface FolioDocument {
  id: string;
  file_name: string;
  storage_path: string;
  storage_bucket: string;
  file_size: number | null;
  mime_type: string | null;
  description: string;
  uploaded_at: string;
}

interface DocumentViewerProps {
  ownerId: string;
  accessorEmail: string;
  accessorName: string;
}

function getFileIcon(mimeType: string | null) {
  if (!mimeType) return <InsertDriveFileIcon />;
  if (mimeType === 'application/pdf') return <PictureAsPdfIcon />;
  if (mimeType.startsWith('image/')) return <ImageIcon />;
  if (mimeType.includes('spreadsheet') || mimeType.includes('excel') || mimeType === 'text/csv') return <TableChartIcon />;
  if (mimeType.includes('word')) return <DescriptionIcon />;
  return <InsertDriveFileIcon />;
}

function formatFileSize(bytes: number | null): string {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const DocumentViewer: React.FC<DocumentViewerProps> = ({
  ownerId, accessorEmail, accessorName,
}) => {
  const [documents, setDocuments] = useState<FolioDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState<string | null>(null);

  useEffect(() => {
    const fetchDocuments = async () => {
      setLoading(true);
      try {
        // RLS ensures only documents visible to this user are returned
        const { data, error } = await supabase
          .from('folio_documents')
          .select('id, file_name, storage_path, storage_bucket, file_size, mime_type, description, uploaded_at')
          .eq('owner_id', ownerId)
          .order('uploaded_at', { ascending: false });

        if (error) throw error;
        if (data) setDocuments(data);
      } catch (err) {
        console.error('Failed to fetch documents:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
  }, [ownerId]);

  const handleDownload = async (doc: FolioDocument) => {
    setDownloading(doc.id);
    try {
      // Get the current session token for the edge function call
      const { data: { session } } = await supabase.auth.getSession();
      const accessToken = session?.access_token;

      // Use the edge function for all downloads — it handles both buckets
      // and uses service role to bypass storage RLS
      const { data, error } = await supabase.functions.invoke('folio-document-download', {
        body: { documentId: doc.id },
        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
      });

      if (error) throw error;

      const signedUrl = data?.signedUrl;
      if (!signedUrl) throw new Error('No signed URL returned');

      // Log the access
      await supabase.from('folio_access_log').insert({
        owner_id: ownerId,
        accessor_email: accessorEmail,
        accessor_name: accessorName,
        access_type: 'document',
        report_name: doc.description || doc.file_name,
        sections_queried: [],
      });

      // Open in new tab for viewing, or download
      const a = document.createElement('a');
      a.href = signedUrl;
      a.target = '_blank';
      a.download = doc.file_name;
      a.click();
    } catch (err) {
      console.error('Download failed:', err);
    } finally {
      setDownloading(null);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2, color: '#1a237e' }}>Shared Documents</Typography>
      {documents.length === 0 ? (
        <Typography color="text.secondary">
          No documents have been shared with you yet.
        </Typography>
      ) : (
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 600, width: 40 }}></TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Description</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>File Name</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Size</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Uploaded</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Download</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {documents.map((doc) => (
              <TableRow key={doc.id} sx={{ '&:hover': { bgcolor: '#f5f5f5' } }}>
                <TableCell sx={{ color: '#1a237e' }}>
                  {getFileIcon(doc.mime_type)}
                </TableCell>
                <TableCell>{doc.description || doc.file_name}</TableCell>
                <TableCell sx={{ color: 'text.secondary', fontSize: '0.85rem' }}>
                  {doc.file_name}
                </TableCell>
                <TableCell>{formatFileSize(doc.file_size)}</TableCell>
                <TableCell>{new Date(doc.uploaded_at).toLocaleDateString()}</TableCell>
                <TableCell>
                  <Tooltip title="Download">
                    <IconButton
                      onClick={() => handleDownload(doc)}
                      disabled={downloading === doc.id}
                      sx={{ color: '#1a237e' }}
                    >
                      {downloading === doc.id ? <CircularProgress size={20} /> : <DownloadIcon />}
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </Box>
  );
};

export default DocumentViewer;
