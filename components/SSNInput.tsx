/**
 * SSNInput Component
 *
 * A secure input field for Social Security Numbers with:
 * - Automatic formatting (###-##-####)
 * - Input masking
 * - Security notice about server-side encryption
 */

import React, { ChangeEvent } from 'react';
import { TextField, Box, Typography } from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';

interface SSNInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: boolean;
  helperText?: string;
  required?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
}

export function SSNInput({
  label,
  value,
  onChange,
  error = false,
  helperText = '',
  required = false,
  disabled = false,
  fullWidth = true,
}: SSNInputProps) {
  /**
   * Format SSN with dashes: ###-##-####
   */
  const formatSSN = (input: string): string => {
    // Remove all non-digits
    const digits = input.replace(/\D/g, '');

    // Limit to 9 digits
    const limited = digits.slice(0, 9);

    // Apply formatting
    if (limited.length <= 3) {
      return limited;
    } else if (limited.length <= 5) {
      return `${limited.slice(0, 3)}-${limited.slice(3)}`;
    } else {
      return `${limited.slice(0, 3)}-${limited.slice(3, 5)}-${limited.slice(5)}`;
    }
  };

  /**
   * Handle input change with formatting
   */
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const formatted = formatSSN(e.target.value);
    onChange(formatted);
  };

  /**
   * Validate SSN format
   */
  const isValidSSN = (ssn: string): boolean => {
    const digits = ssn.replace(/\D/g, '');
    return digits.length === 0 || digits.length === 9;
  };

  const hasError = error || (!isValidSSN(value) && value.length > 0);
  const displayHelperText = helperText || (!isValidSSN(value) && value.length > 0
    ? 'SSN must be 9 digits (###-##-####)'
    : '');

  return (
    <Box>
      <TextField
        label={label}
        value={value}
        onChange={handleChange}
        error={hasError}
        helperText={displayHelperText}
        required={required}
        disabled={disabled}
        fullWidth={fullWidth}
        placeholder="###-##-####"
        inputProps={{
          maxLength: 11, // 9 digits + 2 dashes
          inputMode: 'numeric',
          autoComplete: 'off',
        }}
        InputProps={{
          startAdornment: (
            <LockIcon
              sx={{
                mr: 1,
                color: 'success.main',
                fontSize: 20
              }}
            />
          ),
        }}
      />
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          mt: 0.5,
          ml: 1.5
        }}
      >
        <LockIcon
          sx={{
            fontSize: 12,
            color: 'success.main',
            mr: 0.5
          }}
        />
        <Typography
          variant="caption"
          sx={{
            color: 'success.main',
            fontSize: '0.7rem',
            fontWeight: 500
          }}
        >
          Securely encrypted on server before storage
        </Typography>
      </Box>
    </Box>
  );
}
