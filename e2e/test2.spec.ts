import { test } from '@playwright/test';

test('test multiple combos', async ({ page }) => {
  await page.goto('http://localhost:4173', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  
  // Expand categories
  ['输入', '调整', '滤镜', '变换', '合成', '输出'].forEach(async (c) => {
    try { await page.click(`button:has-text("${c}")`, { timeout: 500 }); } catch {}
  });
  await page.waitForTimeout(500);
  
  // Combo 1: Image Import -> Gaussian Blur -> Preview
  await page.click('button:has-text("图片导入")');
  await page.waitForTimeout(200);
  await page.click('button:has-text("高斯模糊")');
  await page.waitForTimeout(200);
  await page.click('button:has-text("预览输出")');
  await page.waitForTimeout(200);
  await page.click('.react-flow__node-custom >> nth=0', { force: true });
  await page.waitForTimeout(200);
  try { await page.locator('input[type="file"]').last().setInputFiles('/tmp/test-image.png'); } catch {}
  await page.waitForTimeout(1500);
  await page.screenshot({ path: '/tmp/combo2.png', fullPage: true });
});
