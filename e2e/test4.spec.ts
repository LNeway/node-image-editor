import { test } from '@playwright/test';

test('test blend combo', async ({ page }) => {
  await page.goto('http://localhost:4173', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  
  ['输入', '调整', '滤镜', '变换', '合成', '输出'].forEach(async (c) => {
    try { await page.click(`button:has-text("${c}")`, { timeout: 500 }); } catch {}
  });
  await page.waitForTimeout(500);
  
  // Combo: Image Import -> Blend -> Preview
  await page.click('button:has-text("图片导入")');
  await page.waitForTimeout(200);
  await page.click('button:has-text("混合")');
  await page.waitForTimeout(200);
  await page.click('button:has-text("预览输出")');
  await page.waitForTimeout(200);
  await page.click('.react-flow__node-custom >> nth=0', { force: true });
  await page.waitForTimeout(200);
  try { await page.locator('input[type="file"]').last().setInputFiles('/tmp/test-image.png'); } catch {}
  await page.waitForTimeout(1500);
  await page.screenshot({ path: '/tmp/combo4.png', fullPage: true });
});
