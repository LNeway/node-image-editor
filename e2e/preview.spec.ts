import { test, expect } from '@playwright/test';

test('preview image test', async ({ page }) => {
  await page.goto('http://localhost:4173', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  
  // 1. Add Image Import node
  console.log('1. Adding Image Import node...');
  await page.click('button:has-text("图片导入")');
  await page.waitForTimeout(500);
  
  // 2. Add Preview Output node  
  console.log('2. Adding Preview Output node...');
  await page.click('button:has-text("预览输出")');
  await page.waitForTimeout(500);
  
  // Take screenshot
  await page.screenshot({ path: '/tmp/preview-test.png', fullPage: true });
  
  console.log('Screenshot saved');
  
  // Check the preview panel
  const previewCanvas = page.locator('canvas').first();
  const isVisible = await previewCanvas.isVisible().catch(() => false);
  console.log('Preview canvas visible:', isVisible);
});
