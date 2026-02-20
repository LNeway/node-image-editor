import { test, expect } from '@playwright/test';

test('demo: add nodes to canvas', async ({ page }) => {
  await page.goto('http://localhost:4173', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  
  console.log('1. Initial state - node library loaded');
  await page.screenshot({ path: '/tmp/demo/01-initial.png', fullPage: true });
  
  // Click on Image Import node
  await page.click('button:has-text("图片导入")');
  await page.waitForTimeout(800);
  
  console.log('2. Added Image Import node');
  await page.screenshot({ path: '/tmp/demo/02-image-import.png', fullPage: true });
  
  // Click on Brightness/Contrast node
  await page.click('button:has-text("亮度/对比度")');
  await page.waitForTimeout(800);
  
  console.log('3. Added Brightness/Contrast node');
  await page.screenshot({ path: '/tmp/demo/03-brightness.png', fullPage: true });
  
  // Click on Gaussian Blur node
  await page.click('button:has-text("高斯模糊")');
  await page.waitForTimeout(800);
  
  console.log('4. Added Gaussian Blur node');
  await page.screenshot({ path: '/tmp/demo/04-gaussian-blur.png', fullPage: true });
  
  // Click on Blend node
  await page.click('button:has-text("混合")');
  await page.waitForTimeout(800);
  
  console.log('5. Added Blend node');
  await page.screenshot({ path: '/tmp/demo/05-blend.png', fullPage: true });
  
  // Click on Preview Output node
  await page.click('button:has-text("预览输出")');
  await page.waitForTimeout(800);
  
  console.log('6. Added Preview Output node');
  await page.screenshot({ path: '/tmp/demo/06-preview-output.png', fullPage: true });
  
  console.log('Demo completed!');
});
