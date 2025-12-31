'use client';

import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  Grid,
  Alert,
  InputAdornment,
  Divider,
  Paper,
  CircularProgress,
  Fade,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import CalculateIcon from '@mui/icons-material/Calculate';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { supabase } from '../lib/supabase';

interface RmdResult {
  iraValue: number;
  age: number;
  distributionPeriod: number;
  annualRmd: number;
  monthlyRmd: number;
}

const IraRmdCalculator: React.FC = () => {
  const [iraValue, setIraValue] = useState<string>('');
  const [age, setAge] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<RmdResult | null>(null);

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const handleIraValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Remove non-numeric characters except decimal
    const value = e.target.value.replace(/[^0-9.]/g, '');
    setIraValue(value);
    setResult(null);
    setError(null);
  };

  const handleAgeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    setAge(value);
    setResult(null);
    setError(null);
  };

  const calculateRmd = async () => {
    setError(null);
    setResult(null);

    // Validate inputs
    const iraValueNum = parseFloat(iraValue);
    const ageNum = parseInt(age, 10);

    if (!iraValue || isNaN(iraValueNum) || iraValueNum <= 0) {
      setError('Please enter a valid IRA balance greater than $0.');
      return;
    }

    if (!age || isNaN(ageNum)) {
      setError('Please enter a valid age.');
      return;
    }

    if (ageNum < 73) {
      setError('RMDs are not required until age 73. You do not need to take a required minimum distribution yet.');
      return;
    }

    if (ageNum > 120) {
      setError('Please enter a valid age (120 or younger).');
      return;
    }

    setLoading(true);

    try {
      // Query Supabase for the distribution period
      // For ages 120+, we use age 120's factor
      const queryAge = ageNum > 120 ? 120 : ageNum;

      const { data, error: supabaseError } = await supabase
        .from('ira_rmds')
        .select('distribution_period')
        .eq('age', queryAge)
        .single();

      if (supabaseError) {
        console.error('Supabase error:', supabaseError);
        setError('Unable to retrieve distribution factor. Please try again later.');
        setLoading(false);
        return;
      }

      if (!data) {
        setError('Distribution factor not found for the specified age.');
        setLoading(false);
        return;
      }

      const distributionPeriod = parseFloat(data.distribution_period);
      const annualRmd = iraValueNum / distributionPeriod;
      const monthlyRmd = annualRmd / 12;

      setResult({
        iraValue: iraValueNum,
        age: ageNum,
        distributionPeriod,
        annualRmd,
        monthlyRmd,
      });
    } catch (err) {
      console.error('Error calculating RMD:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      calculateRmd();
    }
  };

  return (
    <Box>
      {/* Calculator Card */}
      <Card
        elevation={0}
        sx={{
          border: '1px solid',
          borderColor: alpha('#7b2cbf', 0.15),
          borderRadius: 3,
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <Box
          sx={{
            background: 'linear-gradient(135deg, #7b2cbf 0%, #5a189a 100%)',
            color: 'white',
            p: 3,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: 2,
                bgcolor: alpha('#ffffff', 0.15),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <CalculateIcon sx={{ fontSize: 28 }} />
            </Box>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 600, mb: 0.5 }}>
                IRA RMD Calculator
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Calculate your Required Minimum Distribution
              </Typography>
            </Box>
          </Box>
        </Box>

        <CardContent sx={{ p: 4 }}>
          {/* Input Fields */}
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="IRA Account Balance"
                value={iraValue}
                onChange={handleIraValueChange}
                onKeyPress={handleKeyPress}
                placeholder="Enter your IRA balance"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <AccountBalanceIcon sx={{ color: '#7b2cbf' }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: '#7b2cbf',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#7b2cbf',
                    },
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: '#7b2cbf',
                  },
                }}
              />
              <Typography variant="caption" sx={{ color: 'text.secondary', mt: 0.5, display: 'block' }}>
                Enter the total value as of December 31 of the prior year
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Your Age"
                value={age}
                onChange={handleAgeChange}
                onKeyPress={handleKeyPress}
                placeholder="Enter your current age"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <CalendarMonthIcon sx={{ color: '#7b2cbf' }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: '#7b2cbf',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#7b2cbf',
                    },
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: '#7b2cbf',
                  },
                }}
              />
              <Typography variant="caption" sx={{ color: 'text.secondary', mt: 0.5, display: 'block' }}>
                Your age as of December 31 of this year
              </Typography>
            </Grid>
          </Grid>

          {/* Calculate Button */}
          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
            <Button
              variant="contained"
              size="large"
              onClick={calculateRmd}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <CalculateIcon />}
              sx={{
                bgcolor: '#7b2cbf',
                px: 5,
                py: 1.5,
                fontSize: '1rem',
                fontWeight: 600,
                '&:hover': {
                  bgcolor: '#5a189a',
                },
                '&:disabled': {
                  bgcolor: alpha('#7b2cbf', 0.5),
                },
              }}
            >
              {loading ? 'Calculating...' : 'Calculate RMD'}
            </Button>
          </Box>

          {/* Error Display */}
          {error && (
            <Fade in={!!error}>
              <Alert
                severity="warning"
                sx={{
                  mt: 3,
                  borderRadius: 2,
                }}
              >
                {error}
              </Alert>
            </Fade>
          )}

          {/* Results Display */}
          {result && (
            <Fade in={!!result}>
              <Box sx={{ mt: 4 }}>
                <Divider sx={{ mb: 3 }} />

                <Typography variant="h6" sx={{ mb: 3, color: '#7b2cbf', fontWeight: 600 }}>
                  Your Required Minimum Distribution
                </Typography>

                <Grid container spacing={3}>
                  {/* Annual RMD */}
                  <Grid item xs={12} sm={6}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 3,
                        textAlign: 'center',
                        bgcolor: alpha('#7b2cbf', 0.04),
                        border: `1px solid ${alpha('#7b2cbf', 0.15)}`,
                        borderRadius: 2,
                      }}
                    >
                      <Typography variant="overline" sx={{ color: 'text.secondary', letterSpacing: 1 }}>
                        Annual RMD
                      </Typography>
                      <Typography
                        variant="h4"
                        sx={{
                          color: '#7b2cbf',
                          fontWeight: 700,
                          my: 1,
                        }}
                      >
                        {formatCurrency(result.annualRmd)}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        per year
                      </Typography>
                    </Paper>
                  </Grid>

                  {/* Monthly RMD */}
                  <Grid item xs={12} sm={6}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 3,
                        textAlign: 'center',
                        bgcolor: alpha('#2d6a4f', 0.04),
                        border: `1px solid ${alpha('#2d6a4f', 0.15)}`,
                        borderRadius: 2,
                      }}
                    >
                      <Typography variant="overline" sx={{ color: 'text.secondary', letterSpacing: 1 }}>
                        Monthly Equivalent
                      </Typography>
                      <Typography
                        variant="h4"
                        sx={{
                          color: '#2d6a4f',
                          fontWeight: 700,
                          my: 1,
                        }}
                      >
                        {formatCurrency(result.monthlyRmd)}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        per month
                      </Typography>
                    </Paper>
                  </Grid>
                </Grid>

                {/* Calculation Details */}
                <Paper
                  elevation={0}
                  sx={{
                    mt: 3,
                    p: 2.5,
                    bgcolor: alpha('#1e3a5f', 0.03),
                    border: `1px solid ${alpha('#1e3a5f', 0.1)}`,
                    borderRadius: 2,
                  }}
                >
                  <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600, color: 'text.primary' }}>
                    Calculation Details
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6} sm={3}>
                      <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                        IRA Balance
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {formatCurrency(result.iraValue)}
                      </Typography>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                        Your Age
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {result.age} years old
                      </Typography>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                        Distribution Period
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {result.distributionPeriod} years
                      </Typography>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                        Formula
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        Balance / Period
                      </Typography>
                    </Grid>
                  </Grid>
                </Paper>
              </Box>
            </Fade>
          )}
        </CardContent>
      </Card>

      {/* Disclaimer */}
      <Alert
        severity="info"
        icon={<InfoOutlinedIcon />}
        sx={{
          mt: 3,
          borderRadius: 2,
          bgcolor: alpha('#1e3a5f', 0.04),
          border: `1px solid ${alpha('#1e3a5f', 0.1)}`,
          '& .MuiAlert-icon': {
            color: '#1e3a5f',
          },
        }}
      >
        <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
          Important Disclaimer
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.6 }}>
          This calculator uses the IRS Uniform Lifetime Table and provides an estimate only. Your actual RMD may differ based on your specific circumstances, including if you have a spouse who is more than 10 years younger and is the sole beneficiary. Please consult with a qualified tax professional or financial advisor for personalized advice.
        </Typography>
      </Alert>
    </Box>
  );
};

export default IraRmdCalculator;
