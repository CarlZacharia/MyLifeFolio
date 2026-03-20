'use client';

import React from 'react';
import { TextField, TextFieldProps } from '@mui/material';
import { IMaskInput } from 'react-imask';

interface PhoneMaskProps {
  onChange: (event: { target: { name: string; value: string } }) => void;
  name: string;
  value?: string;
}

const PhoneMaskCustom = React.forwardRef<HTMLInputElement, PhoneMaskProps>(
  function PhoneMaskCustom(props, ref) {
    const { onChange, name, value, ...other } = props;
    return (
      <IMaskInput
        {...other}
        value={value || ''}
        mask="(000) 000-0000"
        definitions={{
          '0': /[0-9]/,
        }}
        inputRef={ref}
        onAccept={(acceptedValue: string) =>
          onChange({ target: { name, value: acceptedValue } })
        }
        overwrite
      />
    );
  }
);

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
  return (
    <TextField
      {...props}
      value={value}
      onChange={onChange}
      name={name}
      InputProps={{
        /* eslint-disable @typescript-eslint/no-explicit-any */
        inputComponent: PhoneMaskCustom as any,
        /* eslint-enable @typescript-eslint/no-explicit-any */
        inputProps: {
          name,
        },
      }}
    />
  );
};

export default PhoneInput;
