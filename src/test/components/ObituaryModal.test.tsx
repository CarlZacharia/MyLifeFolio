import React from 'react';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LegacyObituaryTab from '../../../components/LegacyObituaryTab';
import { generateObituary } from '../../../lib/obituaryGenerator';
import { resetSupabaseMocks, mockSupabaseData } from '../mocks/supabase';
import { MockFormContextProvider, MockFormContext } from '../mocks/formContext';
import { MockAuthContextProvider, MockAuthContext } from '../mocks/authContext';
import { MARGARET_THORNTON, ROSA_MARTINEZ, buildMockFormData } from '../mocks/personas';

// ── Mock the context hooks ────────────────────────────────────────────────

vi.mock('../../../lib/FormContext', async () => {
  const React = await import('react');
  const { MockFormContext } = await import('../mocks/formContext');
  return {
    useFormContext: () => {
      const ctx = React.useContext(MockFormContext);
      if (!ctx) throw new Error('useFormContext must be used within MockFormContextProvider');
      return ctx;
    },
    FormProvider: ({ children }: { children: React.ReactNode }) => children,
  };
});

vi.mock('../../../lib/AuthContext', async () => {
  const React = await import('react');
  const { MockAuthContext } = await import('../mocks/authContext');
  return {
    useAuth: () => {
      const ctx = React.useContext(MockAuthContext);
      if (!ctx) throw new Error('useAuth must be used within MockAuthContextProvider');
      return ctx;
    },
    AuthProvider: ({ children }: { children: React.ReactNode }) => children,
  };
});

// The obituaryGenerator is globally mocked in setup.ts, but we import it to control per-test
vi.mock('../../../lib/obituaryGenerator', () => ({
  generateObituary: vi.fn().mockResolvedValue({
    success: true,
    obituary: 'Mock generated obituary text for testing purposes.',
  }),
}));

// Mock obituary template builder
vi.mock('../../../lib/obituaryTemplate', () => ({
  buildObituaryFromTemplate: vi.fn(() => 'Template-based obituary text.'),
}));

// Mock obituary drafts
vi.mock('../../../lib/obituaryDrafts', () => ({
  saveDraft: vi.fn().mockResolvedValue({ success: true }),
  loadDrafts: vi.fn().mockResolvedValue([]),
}));

// Mock supabaseStorage for client folder name
vi.mock('../../../lib/supabaseStorage', () => ({
  generateClientFolderName: vi.fn((name: string) => name.toLowerCase().replace(/\s+/g, '_')),
  uploadObituaryPdf: vi.fn().mockResolvedValue({ success: true }),
}));

// Mock ObituaryPreviewModal
vi.mock('../../../components/ObituaryPreviewModal', () => ({
  __esModule: true,
  default: ({ open, onClose, obituaryText, personName }: {
    open: boolean; onClose: () => void; obituaryText: string; personName: string;
  }) => {
    if (!open) return null;
    return React.createElement('div', { 'data-testid': 'preview-modal' },
      React.createElement('div', { 'data-testid': 'preview-text' }, obituaryText),
      React.createElement('span', { 'data-testid': 'preview-person' }, personName),
      React.createElement('button', { 'data-testid': 'preview-download-txt', onClick: () => {} }, 'Text (.txt)'),
      React.createElement('button', { 'data-testid': 'preview-download-docx', onClick: () => {} }, 'Word (.docx)'),
      React.createElement('button', { 'data-testid': 'preview-download-pdf', onClick: () => {} }, 'PDF (.pdf)'),
      React.createElement('button', { 'data-testid': 'preview-copy', onClick: () => navigator.clipboard.writeText(obituaryText) }, 'Copy'),
      React.createElement('button', { 'data-testid': 'preview-close', onClick: onClose }, 'Close'),
    );
  },
}));

// Mock FolioModal colors
vi.mock('../../../components/FolioModal', () => ({
  folioColors: {
    ink: '#2c2318', inkLight: '#6b5c47', inkFaint: '#a89880',
    accent: '#c9a227', accentWarm: '#8b6914',
    cream: '#faf6ef', creamDark: '#e8e0d2',
    parchment: '#d4cec3',
  },
}));

// ── Render helper ─────────────────────────────────────────────────────────

function renderObituary(formDataOverride?: Partial<ReturnType<typeof buildMockFormData>>) {
  return render(
    React.createElement(MockAuthContextProvider, null,
      React.createElement(MockFormContextProvider, { formData: formDataOverride, intakeId: 'test-intake-id' },
        React.createElement(LegacyObituaryTab)
      )
    )
  );
}

// ── Tests ─────────────────────────────────────────────────────────────────

describe('Obituary Generation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetSupabaseMocks();
    // Mock the legacy_obituary table so refreshGenerationCount resolves correctly.
    // The component calls: supabase.from('legacy_obituary').select('generation_count').eq(...).maybeSingle()
    // Return generation_count matching Margaret's obituaryGenerationCount (2) to avoid state conflicts.
    mockSupabaseData('legacy_obituary', 'select', [{ generation_count: 2 }]);
    mockSupabaseData('legacy_obituary_spouse', 'select', [{ generation_count: 0 }]);
    (generateObituary as ReturnType<typeof vi.fn>).mockResolvedValue({
      success: true,
      obituary: 'Mock generated obituary text for testing purposes.',
    });
  });

  describe('Generation Button', () => {
    test('Generate with AI button is present', async () => {
      renderObituary(MARGARET_THORNTON as Partial<ReturnType<typeof buildMockFormData>>);
      await waitFor(() => {
        expect(screen.getByText('Generate with AI')).toBeInTheDocument();
      });
    });

    test('button shows generation count — X of 5 drafts used', async () => {
      renderObituary(MARGARET_THORNTON as Partial<ReturnType<typeof buildMockFormData>>);
      await waitFor(() => {
        // Margaret has obituaryGenerationCount: 2
        expect(screen.getByText('2 of 5 drafts used')).toBeInTheDocument();
      });
    });

    test('button is disabled when generation_count >= 5', async () => {
      const maxedOut = buildMockFormData({
        legacyObituary: {
          ...MARGARET_THORNTON.legacyObituary,
          obituaryGenerationCount: 5,
        },
      });
      renderObituary(maxedOut as Partial<ReturnType<typeof buildMockFormData>>);
      await waitFor(() => {
        expect(screen.getByText('All 5 drafts used — generation limit reached')).toBeInTheDocument();
        const btn = screen.getByText('Generate with AI').closest('button');
        expect(btn).toBeDisabled();
      });
    });

    test('button is enabled when generation_count < 5', async () => {
      renderObituary(ROSA_MARTINEZ as Partial<ReturnType<typeof buildMockFormData>>);
      await waitFor(() => {
        // Rosa has obituaryGenerationCount: 0
        const btn = screen.getByText('Generate with AI').closest('button');
        expect(btn).not.toBeDisabled();
      });
    });
  });

  describe('Modal Behavior', () => {
    test('modal opens when generate button clicked with valid data', async () => {
      const user = userEvent.setup();
      renderObituary(MARGARET_THORNTON as Partial<ReturnType<typeof buildMockFormData>>);

      await user.click(screen.getByText('Generate with AI'));

      await waitFor(() => {
        expect(screen.getByTestId('preview-modal')).toBeInTheDocument();
      });
    });

    test('modal shows loading spinner during generation', async () => {
      // Make generateObituary hang
      (generateObituary as ReturnType<typeof vi.fn>).mockImplementation(
        () => new Promise(() => {}) // never resolves
      );

      const user = userEvent.setup();
      renderObituary(MARGARET_THORNTON as Partial<ReturnType<typeof buildMockFormData>>);

      await user.click(screen.getByText('Generate with AI'));

      await waitFor(() => {
        expect(screen.getByText('Generating...')).toBeInTheDocument();
      });
    });

    test('modal shows generated text on success', async () => {
      const user = userEvent.setup();
      renderObituary(MARGARET_THORNTON as Partial<ReturnType<typeof buildMockFormData>>);

      await user.click(screen.getByText('Generate with AI'));

      await waitFor(() => {
        expect(screen.getByTestId('preview-text')).toHaveTextContent('Mock generated obituary text');
      });
    });

    test('modal shows error message on API failure', async () => {
      (generateObituary as ReturnType<typeof vi.fn>).mockResolvedValue({
        success: false,
        error: 'Server error: 500',
      });

      const user = userEvent.setup();
      renderObituary(MARGARET_THORNTON as Partial<ReturnType<typeof buildMockFormData>>);

      await user.click(screen.getByText('Generate with AI'));

      await waitFor(() => {
        expect(screen.getByText('Server error: 500')).toBeInTheDocument();
      });
    });

    test('modal shows rate limit message on 429 response', async () => {
      (generateObituary as ReturnType<typeof vi.fn>).mockResolvedValue({
        success: false,
        limitReached: true,
        error: 'You have reached the maximum of 5 AI-generated obituary drafts.',
      });

      const user = userEvent.setup();
      renderObituary(MARGARET_THORNTON as Partial<ReturnType<typeof buildMockFormData>>);

      await user.click(screen.getByText('Generate with AI'));

      await waitFor(() => {
        expect(screen.getByText(/maximum of 5 AI-generated obituary drafts/)).toBeInTheDocument();
      });
    });

    test('close button dismisses modal', async () => {
      const user = userEvent.setup();
      renderObituary(MARGARET_THORNTON as Partial<ReturnType<typeof buildMockFormData>>);

      await user.click(screen.getByText('Generate with AI'));
      await waitFor(() => {
        expect(screen.getByTestId('preview-modal')).toBeInTheDocument();
      });

      await user.click(screen.getByTestId('preview-close'));
      await waitFor(() => {
        expect(screen.queryByTestId('preview-modal')).not.toBeInTheDocument();
      });
    });
  });

  describe('Downloads', () => {
    test('Download TXT button is present after generation', async () => {
      const user = userEvent.setup();
      renderObituary(MARGARET_THORNTON as Partial<ReturnType<typeof buildMockFormData>>);

      await user.click(screen.getByText('Generate with AI'));
      await waitFor(() => {
        expect(screen.getByTestId('preview-download-txt')).toBeInTheDocument();
      });
    });

    test('Download Word button is present after generation', async () => {
      const user = userEvent.setup();
      renderObituary(MARGARET_THORNTON as Partial<ReturnType<typeof buildMockFormData>>);

      await user.click(screen.getByText('Generate with AI'));
      await waitFor(() => {
        expect(screen.getByTestId('preview-download-docx')).toBeInTheDocument();
      });
    });

    test('Download PDF button is present after generation', async () => {
      const user = userEvent.setup();
      renderObituary(MARGARET_THORNTON as Partial<ReturnType<typeof buildMockFormData>>);

      await user.click(screen.getByText('Generate with AI'));
      await waitFor(() => {
        expect(screen.getByTestId('preview-download-pdf')).toBeInTheDocument();
      });
    });

    test('Copy button copies text to clipboard', async () => {
      const user = userEvent.setup();
      renderObituary(MARGARET_THORNTON as Partial<ReturnType<typeof buildMockFormData>>);

      await user.click(screen.getByText('Generate with AI'));
      await waitFor(() => {
        expect(screen.getByTestId('preview-copy')).toBeInTheDocument();
      });

      await user.click(screen.getByTestId('preview-copy'));
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith('Mock generated obituary text for testing purposes.');
    });

    test('download buttons are not shown during loading', async () => {
      (generateObituary as ReturnType<typeof vi.fn>).mockImplementation(
        () => new Promise(() => {}) // never resolves
      );

      const user = userEvent.setup();
      renderObituary(MARGARET_THORNTON as Partial<ReturnType<typeof buildMockFormData>>);

      await user.click(screen.getByText('Generate with AI'));

      await waitFor(() => {
        expect(screen.getByText('Generating...')).toBeInTheDocument();
      });
      // Preview modal should not be open during loading
      expect(screen.queryByTestId('preview-modal')).not.toBeInTheDocument();
    });
  });

  describe('Rate Limiting', () => {
    test('after 5 generations button becomes disabled', async () => {
      const maxedOut = buildMockFormData({
        legacyObituary: {
          ...MARGARET_THORNTON.legacyObituary,
          obituaryGenerationCount: 5,
        },
      });
      renderObituary(maxedOut as Partial<ReturnType<typeof buildMockFormData>>);

      await waitFor(() => {
        const btn = screen.getByText('Generate with AI').closest('button');
        expect(btn).toBeDisabled();
      });
    });

    test('generation count display updates after each successful generation', async () => {
      // Start with 2 used
      renderObituary(MARGARET_THORNTON as Partial<ReturnType<typeof buildMockFormData>>);

      await waitFor(() => {
        expect(screen.getByText('2 of 5 drafts used')).toBeInTheDocument();
      });
    });

    test('failed generation does not increment count', async () => {
      (generateObituary as ReturnType<typeof vi.fn>).mockResolvedValue({
        success: false,
        error: 'Something went wrong',
      });

      const user = userEvent.setup();
      renderObituary(MARGARET_THORNTON as Partial<ReturnType<typeof buildMockFormData>>);

      await user.click(screen.getByText('Generate with AI'));

      await waitFor(() => {
        expect(screen.getByText('Something went wrong')).toBeInTheDocument();
        // Count should still show 2
        expect(screen.getByText('2 of 5 drafts used')).toBeInTheDocument();
      });
    });
  });
});
