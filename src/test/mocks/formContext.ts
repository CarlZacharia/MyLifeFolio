import React from 'react';
import { FormData } from '../../../lib/FormContext';
import { buildMockFormData } from './personas';

// We need to provide a minimal FormContext mock that components can consume
// via useFormContext() without hitting the real provider's Supabase calls.

const { createContext, useContext, useState } = React;

// This matches the FormContextType interface from lib/FormContext.tsx
interface MockFormContextType {
  formData: FormData;
  updateFormData: (data: Partial<FormData>) => void;
  loadFormData: (data: FormData, step?: number) => void;
  currentStep: number;
  setCurrentStep: (step: number) => void;
  clearFormData: () => void;
  intakeId: string | null;
  setIntakeId: (id: string | null) => void;
}

const MockFormContext = createContext<MockFormContextType | undefined>(undefined);

interface MockFormContextProviderProps {
  children: React.ReactNode;
  formData?: Partial<FormData>;
  intakeId?: string | null;
}

/**
 * A test wrapper that provides FormContext without any real Supabase calls.
 *
 * Usage:
 *   <MockFormContextProvider formData={{ name: 'Test' }}>
 *     <MyComponent />
 *   </MockFormContextProvider>
 */
export const MockFormContextProvider: React.FC<MockFormContextProviderProps> = ({
  children,
  formData: formDataOverride,
  intakeId: intakeIdOverride = 'test-intake-id',
}) => {
  const defaultData = buildMockFormData();
  const mergedData = formDataOverride ? { ...defaultData, ...formDataOverride } : defaultData;

  const [formData, setFormData] = useState<FormData>(mergedData as FormData);
  const [currentStep, setCurrentStep] = useState(0);
  const [intakeId, setIntakeId] = useState<string | null>(intakeIdOverride);

  const updateFormData = (data: Partial<FormData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  const loadFormData = (data: FormData) => {
    setFormData(data);
  };

  const clearFormData = () => {
    setFormData(defaultData as FormData);
  };

  const value: MockFormContextType = {
    formData,
    updateFormData,
    loadFormData,
    currentStep,
    setCurrentStep,
    clearFormData,
    intakeId,
    setIntakeId,
  };

  return React.createElement(MockFormContext.Provider, { value }, children);
};

// We also need to mock the useFormContext hook to read from our mock context.
// This is done by vi.mock('../lib/FormContext') in each test file that needs it.
export { MockFormContext };
