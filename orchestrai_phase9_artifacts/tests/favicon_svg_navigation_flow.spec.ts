import { test, expect } from '@playwright/test';

test('favicon_svg_navigation_flow', async ({page}) => {
  await page.goto('/favicon.svg');
  await expect(page.locator('body')).toBeVisible();
});
