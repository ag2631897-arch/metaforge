import { test, expect } from '@playwright/test';

test.describe('MetaForge Developer Studio', () => {
  test('shows the custom auth page at the root', async ({ page }) => {
    await page.goto('http://localhost:3000/');

    await expect(page).toHaveTitle(/MetaForge/i);
    await expect(page.getByRole('button', { name: 'Create account' })).toBeVisible();
    await expect(page.getByPlaceholder('At least 8 characters')).toBeVisible();
  });

  test('protects studio routes when signed out', async ({ page }) => {
    await page.goto('http://localhost:3000/studio/apps/test-app-123/config');

    await expect(page).toHaveURL(/\/auth/);
    await expect(page.getByRole('button', { name: 'Sign in', exact: true })).toBeVisible();
  });
});
