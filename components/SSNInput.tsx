/**
 * SSNInput Component
 *
 * A secure input field for Social Security Numbers with:
 * - Automatic formatting (###-##-####)
 * - Input masking (shows •••-••-•••• when not revealed)
 * - Reauth-gated visibility toggle to reveal/edit
 */

import React, { useState, ChangeEvent } from 'react';
import { TextField, Box, IconButton, Tooltip } from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { useAuth } from '../lib/AuthContext';

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
  const { isReauthenticated } = useAuth();
  const [revealed, setRevealed] = useState(false);

  // SSN is visible when user has clicked reveal AND is reauthenticated
  const isVisible = revealed && isReauthenticated;
  const hasValue = value.length > 0;

  /**
   * Format SSN with dashes: ###-##-####
   */
  const formatSSN = (input: string): string => {
    const digits = input.replace(/\D/g, '');
    const limited = digits.slice(0, 9);

    if (limited.length <= 3) {
      return limited;
    } else if (limited.length <= 5) {
      return `${limited.slice(0, 3)}-${limited.slice(3)}`;
    } else {
      return `${limited.slice(0, 3)}-${limited.slice(3, 5)}-${limited.slice(5)}`;
    }
  };

  /**
   * Mask SSN: replace digits with bullets, keep dashes
   */
  const maskSSN = (ssn: string): string => {
    return ssn.replace(/\d/g, '•');
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const formatted = formatSSN(e.target.value);
    onChange(formatted);
  };

  const isValidSSN = (ssn: string): boolean => {
    const digits = ssn.replace(/\D/g, '');
    return digits.length === 0 || digits.length === 9;
  };

  const handleToggleVisibility = () => {
    if (!isReauthenticated) return;
    setRevealed(!revealed);
  };

  const hasError = error || (!isValidSSN(value) && value.length > 0);
  const displayHelperText = helperText || (!isValidSSN(value) && value.length > 0
    ? 'SSN must be 9 digits (###-##-####)'
    : '');

  // Field is read-only when there's a stored value and it's not revealed
  const isLocked = hasValue && !isVisible;

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
      <TextField
        label={label}
        value={isLocked ? maskSSN(value) : value}
        onChange={handleChange}
        error={hasError}
        helperText={displayHelperText}
        required={required}
        disabled={disabled}
        fullWidth={fullWidth}
        placeholder="###-##-####"
        size="small"
        InputLabelProps={{ shrink: true }}
        inputProps={{
          maxLength: 11,
          inputMode: 'numeric',
          autoComplete: 'off',
          readOnly: isLocked,
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
          endAdornment: hasValue ? (
            <Tooltip title={
              !isReauthenticated
                ? 'Verify your identity to reveal SSN'
                : isVisible ? 'Hide SSN' : 'Show SSN'
            }>
              <span>
                <IconButton
                  onClick={handleToggleVisibility}
                  disabled={!isReauthenticated}
                  size="small"
                  edge="end"
                  sx={{ color: isReauthenticated ? 'primary.main' : 'text.disabled' }}
                >
                  {isVisible ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                </IconButton>
              </span>
            </Tooltip>
          ) : undefined,
        }}
      />
    </Box>
  );
}
