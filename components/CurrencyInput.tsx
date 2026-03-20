'use client';

import React from 'react';
import { TextField, TextFieldProps } from '@mui/material';
import { IMaskInput } from 'react-imask';

interface CurrencyMaskProps {
  onChange: (event: { target: { name: string; value: string } }) => void;
  name: string;
  value?: string;
}

const CurrencyMaskCustom = React.forwardRef<HTMLInputElement, CurrencyMaskProps>(
  function CurrencyMaskCustom(props, ref) {
    const { onChange, name, value, ...other } = props;
    return (
      <IMaskInput
        {...other}
        value={value || ''}
        mask="$num"
        blocks={{
          num: {
            mask: Number,
            thousandsSeparator: ',',
            radix: '.',
            scale: 2,
            normalizeZeros: true,
            padFractionalZeros: false,
            min: 0,
            max: 999999999999,
          },
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

interface CurrencyInputProps extends Omit<TextFieldProps, 'onChange'> {
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  name?: string;
}

const CurrencyInput: React.FC<CurrencyInputProps> = ({
  value,
  onChange,
  name = 'currency',
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
        inputComponent: CurrencyMaskCustom as any,
        /* eslint-enable @typescript-eslint/no-explicit-any */
        inputProps: {
          name,
        },
      }}
    />
  );
};

export default CurrencyInput;
