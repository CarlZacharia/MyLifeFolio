import { test, expect } from '@playwright/test';

test.describe('Landing Page', () => {
  test('should load and display the MyLifeFolio landing page', async ({ page }) => {
    await page.goto('/');

    // Verify the app title / brand is visible
    await expect(page.getByText('MyLifeFolio').first()).toBeVisible();

    // Verify key navigation buttons exist
    await expect(page.getByText('Sign In')).toBeVisible();
    await expect(page.getByText('Get Started')).toBeVisible();
  });

  test('should show the "Why MyLifeFolio" section', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByText('Why MyLifeFolio')).toBeVisible();
  });

  test('clicking Sign In should open the login dialog', async ({ page }) => {
    await page.goto('/');

    // Click the Sign In button in the header area
    await page.getByRole('button', { name: /sign in/i }).first().click();

    // Verify the sign-in dialog appears (OTP mode by default)
    await expect(page.getByText('Sign In to MyLifeFolio')).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /send me a code/i })).toBeVisible();

    // Switch to password mode
    await page.getByText('Prefer a password? Sign in here').click();
    await expect(page.getByLabel(/password/i)).toBeVisible();
  });
});
