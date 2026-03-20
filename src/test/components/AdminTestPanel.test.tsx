import React from 'react';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AdminTestPanel from '../../../components/AdminTestPanel';
import { supabase } from '../../../lib/supabase';
import { resetSupabaseMocks, mockSupabaseData } from '../mocks/supabase';
import { TEST_PERSONAS } from '../mocks/personas';

// Mock FolioModal is not needed for AdminTestPanel (it doesn't use it)

// ── Tests ─────────────────────────────────────────────────────────────────

describe('AdminTestPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetSupabaseMocks();

    // Default: no personas found in profiles
    mockSupabaseData('profiles', 'select', []);

    // Default: fetch (Edge Functions) returns success
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({
        success: true,
        personas: ['Margaret Thornton', 'James Wilson', 'David Chen', 'Rosa Martinez', 'Emily Blank'],
        message: 'Deleted 5 test users',
        deleted: ['margaret.thornton@mylifefolio.test'],
      }),
    });

    // Mock getSession for Edge Function calls
    (supabase.auth.getSession as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: {
        session: {
          access_token: 'mock-admin-token',
          user: { id: 'admin-id', email: 'admin@zacbrownlaw.com' },
        },
      },
      error: null,
    });
  });

  describe('Safety', () => {
    test('warning banner is always visible', async () => {
      render(React.createElement(AdminTestPanel));
      await waitFor(() => {
        expect(screen.getByText(/This panel is for development and testing only/)).toBeInTheDocument();
      });
    });

    test('warning banner cannot be dismissed', async () => {
      render(React.createElement(AdminTestPanel));
      await waitFor(() => {
        const alert = screen.getByText(/This panel is for development and testing only/).closest('[role="alert"]');
        expect(alert).toBeInTheDocument();
        // MUI Alert with no onClose prop won't show a close button
        const closeBtn = alert?.querySelector('[data-testid="CloseIcon"]')
          || alert?.querySelector('button[aria-label="Close"]');
        expect(closeBtn).toBeNull();
      });
    });
  });

  describe('Persona Status', () => {
    test('shows 5 persona rows in the table', async () => {
      render(React.createElement(AdminTestPanel));
      await waitFor(() => {
        expect(screen.getByText('Margaret Thornton')).toBeInTheDocument();
        expect(screen.getByText('James Wilson')).toBeInTheDocument();
        expect(screen.getByText('David Chen')).toBeInTheDocument();
        expect(screen.getByText('Rosa Martinez')).toBeInTheDocument();
        expect(screen.getByText('Emily Blank')).toBeInTheDocument();
      });
    });

    test('shows Found chip when persona email exists in profiles', async () => {
      // Mock profiles query to return found emails
      mockSupabaseData('profiles', 'select', [
        { email: 'margaret.thornton@mylifefolio.test' },
        { email: 'james.wilson@mylifefolio.test' },
      ]);

      render(React.createElement(AdminTestPanel));
      await waitFor(() => {
        const foundChips = screen.getAllByText('Found');
        expect(foundChips.length).toBeGreaterThanOrEqual(2);
      });
    });

    test('shows Not Found chip when persona email does not exist', async () => {
      // No personas in DB
      mockSupabaseData('profiles', 'select', []);

      render(React.createElement(AdminTestPanel));
      await waitFor(() => {
        const notFoundChips = screen.getAllByText('Not Found');
        expect(notFoundChips).toHaveLength(5);
      });
    });
  });

  describe('Actions', () => {
    test('Seed button is visible and clickable', async () => {
      render(React.createElement(AdminTestPanel));
      await waitFor(() => {
        const seedBtn = screen.getByText('Seed Test Data');
        expect(seedBtn).toBeInTheDocument();
        expect(seedBtn.closest('button')).not.toBeDisabled();
      });
    });

    test('Reset button opens confirmation dialog', async () => {
      const user = userEvent.setup();
      // Mock window.confirm
      const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);

      render(React.createElement(AdminTestPanel));
      await waitFor(() => {
        expect(screen.getByText('Reset Test Data')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Reset Test Data'));

      expect(confirmSpy).toHaveBeenCalledWith(
        expect.stringContaining('Delete ALL @mylifefolio.test users')
      );
      confirmSpy.mockRestore();
    });

    test('canceling confirmation does not trigger action', async () => {
      const user = userEvent.setup();
      const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);

      render(React.createElement(AdminTestPanel));
      await waitFor(() => {
        expect(screen.getByText('Reset Test Data')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Reset Test Data'));

      // fetch should NOT have been called for the reset
      expect(global.fetch).not.toHaveBeenCalled();
      confirmSpy.mockRestore();
    });

    test('confirming seed calls seed Edge Function', async () => {
      const user = userEvent.setup();

      render(React.createElement(AdminTestPanel));
      await waitFor(() => {
        expect(screen.getByText('Seed Test Data')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Seed Test Data'));

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/functions/v1/seed-test-data'),
          expect.objectContaining({ method: 'POST' })
        );
      });
    });

    test('confirming reset calls reset Edge Function', async () => {
      const user = userEvent.setup();
      const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);

      render(React.createElement(AdminTestPanel));
      await waitFor(() => {
        expect(screen.getByText('Reset Test Data')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Reset Test Data'));

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/functions/v1/reset-test-data'),
          expect.objectContaining({ method: 'POST' })
        );
      });
      confirmSpy.mockRestore();
    });

    test('success shows green success message', async () => {
      const user = userEvent.setup();

      render(React.createElement(AdminTestPanel));
      await waitFor(() => {
        expect(screen.getByText('Seed Test Data')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Seed Test Data'));

      await waitFor(() => {
        expect(screen.getByText(/Seeded 5 personas/)).toBeInTheDocument();
      });
    });

    test('failure shows red error message', async () => {
      const user = userEvent.setup();
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
        ok: false,
        json: vi.fn().mockResolvedValue({ success: false, error: 'Admin access required' }),
      });

      render(React.createElement(AdminTestPanel));
      await waitFor(() => {
        expect(screen.getByText('Seed Test Data')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Seed Test Data'));

      await waitFor(() => {
        expect(screen.getByText(/Seed failed/)).toBeInTheDocument();
      });
    });
  });

  describe('Quick Login', () => {
    test('shows 5 Quick Login buttons', async () => {
      // Make all personas found so buttons render
      mockSupabaseData('profiles', 'select', [
        { email: 'margaret.thornton@mylifefolio.test' },
        { email: 'james.wilson@mylifefolio.test' },
        { email: 'chen.family@mylifefolio.test' },
        { email: 'rosa.martinez@mylifefolio.test' },
        { email: 'empty.intake@mylifefolio.test' },
      ]);

      render(React.createElement(AdminTestPanel));
      await waitFor(() => {
        // Button text is first name only: Margaret, James, David, Rosa, Emily
        expect(screen.getByText('Margaret')).toBeInTheDocument();
        expect(screen.getByText('James')).toBeInTheDocument();
        expect(screen.getByText('David')).toBeInTheDocument();
        expect(screen.getByText('Rosa')).toBeInTheDocument();
        expect(screen.getByText('Emily')).toBeInTheDocument();
      });
    });

    test('Quick Login buttons are disabled for Not Found personas', async () => {
      // No personas in DB
      mockSupabaseData('profiles', 'select', []);

      render(React.createElement(AdminTestPanel));
      await waitFor(() => {
        // Wait for loading to complete (no more loading spinners)
        expect(screen.getAllByText('Not Found')).toHaveLength(5);
      });

      // All quick login buttons should be disabled
      const margaretBtn = screen.getByText('Margaret').closest('button');
      const jamesBtn = screen.getByText('James').closest('button');
      expect(margaretBtn).toBeDisabled();
      expect(jamesBtn).toBeDisabled();
    });

    test('clicking Quick Login calls supabase.auth.signInWithPassword with correct email and TestPass123!', async () => {
      const user = userEvent.setup();
      // Make Margaret found
      mockSupabaseData('profiles', 'select', [
        { email: 'margaret.thornton@mylifefolio.test' },
      ]);

      render(React.createElement(AdminTestPanel));
      await waitFor(() => {
        expect(screen.getByText('Found')).toBeInTheDocument();
      });

      // The Margaret button should be enabled
      const margaretBtn = screen.getByText('Margaret').closest('button');
      expect(margaretBtn).not.toBeDisabled();

      await user.click(margaretBtn!);

      await waitFor(() => {
        expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
          email: 'margaret.thornton@mylifefolio.test',
          password: 'TestPass123!',
        });
      });
    });
  });
});
