import { test, expect } from '@playwright/test';

test('homepage has title and button', async ({ page }) => {
  await page.goto('/');

  // Check the title
  await expect(page).toHaveTitle(/My Electron App/);

  // Check if a button exists
  const button = page.locator('button');
  await expect(button).toBeVisible();
});
