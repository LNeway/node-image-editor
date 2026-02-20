import { test, expect } from '@playwright/test';

test('floating preview test', async ({ page }) => {
  await page.goto('http://localhost:4173', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  
  // Use force: true to bypass the canvas
  await page.click('button:has-text("图片导入")', { force: true });
  await page.waitForTimeout(500);
  
  // Select node
  await page.click('.react-flow__node-custom >> nth=0', { force: true });
  await page.waitForTimeout(500);
  
  // Upload file
  const fileInput = page.locator('input[type="file"]').last();
  await fileInput.setInputFiles('/tmp/test-image.png');
  await page.waitForTimeout(2000);
  
  await page.screenshot({ path: '/tmp/floating-preview.png', fullPage: true });
});
