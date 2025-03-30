import { test, expect } from '@playwright/test';

test('homepage has title and button', async ({ page }) => {

  // Check the title
  await expect(page).toHaveTitle('Hello, gooey-app');

});
