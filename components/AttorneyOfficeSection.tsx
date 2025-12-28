'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  TextField,
  MenuItem,
  Paper,
  CircularProgress,
  Alert,
} from '@mui/material';
import BusinessIcon from '@mui/icons-material/Business';
import PersonIcon from '@mui/icons-material/Person';
import { useFormContext, OfficeInfo, AttorneyInfo } from '../lib/FormContext';
import { getActiveOffices, getActiveAttorneys } from '../lib/supabaseOfficesAttorneys';

const AttorneyOfficeSection: React.FC = () => {
  const { formData, updateFormData } = useFormContext();
  const [offices, setOffices] = useState<OfficeInfo[]>([]);
  const [attorneys, setAttorneys] = useState<AttorneyInfo[]>([]);
  const [filteredAttorneys, setFilteredAttorneys] = useState<AttorneyInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load offices and attorneys on mount
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);

      try {
        const [officesResult, attorneysResult] = await Promise.all([
          getActiveOffices(),
          getActiveAttorneys(),
        ]);

        if (!officesResult.success) {
          setError(officesResult.error || 'Failed to load offices');
          return;
        }

        if (!attorneysResult.success) {
          setError(attorneysResult.error || 'Failed to load attorneys');
          return;
        }

        setOffices(officesResult.offices);
        setAttorneys(attorneysResult.attorneys);
        setFilteredAttorneys(attorneysResult.attorneys);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Filter attorneys when office changes
  useEffect(() => {
    if (formData.officeId) {
      // Show attorneys from the selected office first, then others
      const officeAttorneys = attorneys.filter(
        (a) => a.primaryOfficeId === formData.officeId
      );
      const otherAttorneys = attorneys.filter(
        (a) => a.primaryOfficeId !== formData.officeId
      );
      setFilteredAttorneys([...officeAttorneys, ...otherAttorneys]);
    } else {
      setFilteredAttorneys(attorneys);
    }
  }, [formData.officeId, attorneys]);

  const handleOfficeChange = (officeId: string) => {
    const selectedOffice = offices.find((o) => o.id === officeId);
    updateFormData({
      officeId,
      officeName: selectedOffice?.name || '',
      // Clear attorney if they're not from this office
      ...(formData.attorneyId &&
        attorneys.find((a) => a.id === formData.attorneyId)?.primaryOfficeId !== officeId
          ? { attorneyId: '', attorneyName: '' }
          : {}),
    });
  };

  const handleAttorneyChange = (attorneyId: string) => {
    const selectedAttorney = attorneys.find((a) => a.id === attorneyId);
    updateFormData({
      attorneyId,
      attorneyName: selectedAttorney?.name || '',
      // If attorney has a primary office and no office is selected, auto-select it
      ...(selectedAttorney?.primaryOfficeId && !formData.officeId
        ? {
            officeId: selectedAttorney.primaryOfficeId,
            officeName: offices.find((o) => o.id === selectedAttorney.primaryOfficeId)?.name || '',
          }
        : {}),
    });
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
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 600, color: '#1a237e' }}>
          Office & Attorney Assignment
        </Typography>
      </Box>

      <Typography variant="body1" sx={{ mb: 3, color: 'text.secondary' }}>
        Select the office and attorney who will be handling this matter.
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ p: 3 }}>
        <Grid container spacing={3}>
          {/* Office Selection */}
          <Grid size={12}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <BusinessIcon color="primary" />
              <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                Office Location
              </Typography>
            </Box>
            <TextField
              select
              fullWidth
              label="Select Office"
              value={formData.officeId}
              onChange={(e) => handleOfficeChange(e.target.value)}
              disabled={offices.length === 0}
              helperText={offices.length === 0 ? 'No offices available' : ''}
            >
              <MenuItem value="">
                <em>Select an office...</em>
              </MenuItem>
              {offices.map((office) => (
                <MenuItem key={office.id} value={office.id}>
                  <Box>
                    <Typography variant="body1">{office.name}</Typography>
                    {office.city && office.state && (
                      <Typography variant="caption" color="text.secondary">
                        {office.city}, {office.state}
                      </Typography>
                    )}
                  </Box>
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          {/* Office Details (read-only display when selected) */}
          {formData.officeId && (() => {
            const selectedOffice = offices.find((o) => o.id === formData.officeId);
            if (!selectedOffice) return null;
            return (
              <Grid size={12}>
                <Paper variant="outlined" sx={{ p: 2, bgcolor: 'grey.50' }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Office Details
                  </Typography>
                  {selectedOffice.address && (
                    <Typography variant="body2">{selectedOffice.address}</Typography>
                  )}
                  {(selectedOffice.city || selectedOffice.state || selectedOffice.zip) && (
                    <Typography variant="body2">
                      {[selectedOffice.city, selectedOffice.state, selectedOffice.zip]
                        .filter(Boolean)
                        .join(', ')}
                    </Typography>
                  )}
                  {selectedOffice.telephone && (
                    <Typography variant="body2">Tel: {selectedOffice.telephone}</Typography>
                  )}
                  {selectedOffice.fax && (
                    <Typography variant="body2">Fax: {selectedOffice.fax}</Typography>
                  )}
                </Paper>
              </Grid>
            );
          })()}

          {/* Attorney Selection */}
          <Grid size={12}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, mt: 2 }}>
              <PersonIcon color="primary" />
              <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                Assigned Attorney
              </Typography>
            </Box>
            <TextField
              select
              fullWidth
              label="Select Attorney"
              value={formData.attorneyId}
              onChange={(e) => handleAttorneyChange(e.target.value)}
              disabled={attorneys.length === 0}
              helperText={attorneys.length === 0 ? 'No attorneys available' : ''}
            >
              <MenuItem value="">
                <em>Select an attorney...</em>
              </MenuItem>
              {filteredAttorneys.map((attorney) => {
                const isFromSelectedOffice = attorney.primaryOfficeId === formData.officeId;
                const officeName = offices.find((o) => o.id === attorney.primaryOfficeId)?.name;
                return (
                  <MenuItem key={attorney.id} value={attorney.id}>
                    <Box>
                      <Typography variant="body1">
                        {attorney.name}
                        {formData.officeId && isFromSelectedOffice && (
                          <Typography
                            component="span"
                            variant="caption"
                            sx={{ ml: 1, color: 'success.main' }}
                          >
                            (Primary)
                          </Typography>
                        )}
                      </Typography>
                      {officeName && !isFromSelectedOffice && (
                        <Typography variant="caption" color="text.secondary">
                          Primary office: {officeName}
                        </Typography>
                      )}
                    </Box>
                  </MenuItem>
                );
              })}
            </TextField>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default AttorneyOfficeSection;
