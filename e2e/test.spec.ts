import { test } from '@playwright/test';

test('test nodes with preview', async ({ page }) => {
  await page.goto('http://localhost:4173', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  
  // Expand all categories
  ['输入', '调整', '滤镜', '变换', '合成', '输出'].forEach(async (c) => {
    try { await page.click(`button:has-text("${c}")`, { timeout: 500 }); } catch {}
  });
  await page.waitForTimeout(500);
  
  // Test: Image Import + Brightness + Preview
  await page.click('button:has-text("图片导入")');
  await page.waitForTimeout(300);
  await page.click('button:has-text("亮度/对比度")');
  await page.waitForTimeout(300);
  await page.click('button:has-text("预览输出")');
  await page.waitForTimeout(300);
  
  // Upload image
  await page.click('.react-flow__node-custom >> nth=0', { force: true });
  await page.waitForTimeout(300);
  try { await page.locator('input[type="file"]').last().setInputFiles('/tmp/test-image.png'); } catch {}
  await page.waitForTimeout(1500);
  
  await page.screenshot({ path: '/tmp/combo1.png', fullPage: true });
});
