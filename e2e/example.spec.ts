import { test, expect } from '@playwright/test';

test.describe('Node Image Editor', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should load the application', async ({ page }) => {
    await expect(page).toHaveTitle(/Node Image Editor/);
    await expect(page.locator('text=Node Image Editor')).toBeVisible();
  });

  test('should show toolbar buttons', async ({ page }) => {
    await expect(page.locator('button:has-text("New")')).toBeVisible();
    await expect(page.locator('button:has-text("Open")')).toBeVisible();
    await expect(page.locator('button:has-text("Save")')).toBeVisible();
  });

  test('should show node library panel', async ({ page }) => {
    await expect(page.locator('text=Node Library')).toBeVisible();
  });

  test('should show properties panel', async ({ page }) => {
    await expect(page.locator('text=Properties')).toBeVisible();
  });
});
