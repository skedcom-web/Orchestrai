import { test, expect } from '@playwright/test';

test('capstone_navigation_flow', async ({page}) => {
  await page.goto('/capstone');
  await expect(page.locator('body')).toBeVisible();
});
