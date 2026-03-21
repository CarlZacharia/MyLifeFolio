'use client';

import React from 'react';
import { TextField, TextFieldProps } from '@mui/material';

/**
 * Format a string of digits into (XXX) XXX-XXXX phone format.
 * Accepts any input — non-digit characters are stripped automatically.
 */
function formatPhoneValue(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  if (digits.length === 0) return '';
  if (digits.length <= 3) return `(${digits}`;
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
}

interface PhoneInputProps extends Omit<TextFieldProps, 'onChange'> {
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  name?: string;
}

const PhoneInput: React.FC<PhoneInputProps> = ({
  value,
  onChange,
  name = 'phone',
  ...props
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneValue(e.target.value);
    // Create a synthetic event with the formatted value
    const syntheticEvent = {
      ...e,
      target: { ...e.target, name, value: formatted },
    } as React.ChangeEvent<HTMLInputElement>;
    onChange(syntheticEvent);
  };

  return (
    <TextField
      {...props}
      value={value}
      onChange={handleChange}
      name={name}
      inputProps={{ maxLength: 14 }}
      placeholder="(___) ___-____"
    />
  );
};

export default PhoneInput;
