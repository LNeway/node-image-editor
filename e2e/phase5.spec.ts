import { test, expect } from '@playwright/test';

test('phase 5: upload and preview', async ({ page }) => {
  await page.goto('http://localhost:4173', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  
  // 1. Add Image Import node
  console.log('Adding Image Import node...');
  await page.click('button:has-text("图片导入")');
  await page.waitForTimeout(500);
  
  // 2. Add Preview Output node (optional for this simplified demo)
  console.log('Adding Preview Output node...');
  await page.click('button:has-text("预览输出")');
  await page.waitForTimeout(500);
  
  await page.screenshot({ path: '/tmp/p5-01-nodes.png', fullPage: true });
  
  // 3. Click on Image Import node to select it
  console.log('Selecting Image Import node...');
  await page.click('.react-flow__node-custom >> nth=0', { force: true });
  await page.waitForTimeout(500);
  
  // 4. Upload file
  console.log('Uploading file...');
  const fileInput = page.locator('input[type="file"]').last();
  await fileInput.setInputFiles('/tmp/test-image.png');
  await page.waitForTimeout(2000);
  
  await page.screenshot({ path: '/tmp/p5-02-after-upload.png', fullPage: true });
  
  console.log('Done!');
});
