import { test } from '@playwright/test';

test('add all 3 nodes', async ({ page }) => {
  await page.goto('http://localhost:4173', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  
  // Expand all categories
  ['输入', '滤镜', '输出'].forEach(c => {
    try { page.click(`button:has-text("${c}")`, { timeout: 500 }); } catch {}
  });
  await page.waitForTimeout(500);
  
  // Add 3 nodes: Image Import -> Gaussian Blur -> Preview Output
  await page.click('button:has-text("图片导入")');
  await page.waitForTimeout(300);
  await page.click('button:has-text("高斯模糊")');
  await page.waitForTimeout(300);
  await page.click('button:has-text("预览输出")');
  await page.waitForTimeout(300);
  
  // Upload image
  await page.click('.react-flow__node-custom >> nth=0', { force: true });
  await page.waitForTimeout(300);
  try { await page.locator('input[type="file"]').last().setInputFiles('/tmp/test-image.png'); } catch {}
  await page.waitForTimeout(1000);
  
  await page.screenshot({ path: '/tmp/filter-test.png', fullPage: true });
});
