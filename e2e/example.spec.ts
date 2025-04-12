import { test, expect } from '@playwright/test';

test('homepage has title', async ({ page }) => {
  await page.goto('/');

  // Check the title
  await expect(page).toHaveTitle("GooeyApp");

});
