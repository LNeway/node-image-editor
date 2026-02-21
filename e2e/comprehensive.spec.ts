import { test, expect } from '@playwright/test';

test('test key node combinations', async ({ page }) => {
  await page.goto('http://localhost:4173', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  
  // Expand all categories
  const categories = ['输入', '调整', '滤镜', '变换', '合成', '输出'];
  for (const cat of categories) {
    try { await page.click(`button:has-text("${cat}")`, { timeout: 500 }); } catch {}
  }
  await page.waitForTimeout(500);
  
  // Test 1: Image Import -> Preview
  console.log('Test 1: Image Import -> Preview');
  await page.click('button:has-text("图片导入")');
  await page.waitForTimeout(300);
  await page.click('button:has-text("预览输出")');
  await page.waitForTimeout(300);
  await page.click('.react-flow__node-custom >> nth=0', { force: true });
  await page.waitForTimeout(300);
  try { await page.locator('input[type="file"]').last().setInputFiles('/tmp/test-image.png'); } catch {}
  await page.waitForTimeout(1000);
  await page.screenshot({ path: '/tmp/01-image-import-preview.png', fullPage: true });
  
  // Test 2: Image Import -> Brightness -> Preview
  console.log('Test 2: Brightness/Contrast');
  await page.goto('http://localhost:4173', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  for (const cat of categories) { try { await page.click(`button:has-text("${cat}")`, { timeout: 500 }); } catch {} }
  await page.waitForTimeout(300);
  await page.click('button:has-text("图片导入")');
  await page.waitForTimeout(200);
  await page.click('button:has-text("亮度/对比度")');
  await page.waitForTimeout(200);
  await page.click('button:has-text("预览输出")');
  await page.waitForTimeout(200);
  await page.click('.react-flow__node-custom >> nth=0', { force: true });
  await page.waitForTimeout(200);
  try { await page.locator('input[type="file"]').last().setInputFiles('/tmp/test-image.png'); } catch {}
  await page.waitForTimeout(1000);
  await page.screenshot({ path: '/tmp/02-brightness.png', fullPage: true });
  
  // Test 3: Gaussian Blur
  console.log('Test 3: Gaussian Blur');
  await page.goto('http://localhost:4173', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  for (const cat of categories) { try { await page.click(`button:has-text("${cat}")`, { timeout: 500 }); } catch {} }
  await page.waitForTimeout(300);
  await page.click('button:has-text("图片导入")');
  await page.waitForTimeout(200);
  await page.click('button:has-text("高斯模糊")');
  await page.waitForTimeout(200);
  await page.click('button:has-text("预览输出")');
  await page.waitForTimeout(200);
  await page.click('.react-flow__node-custom >> nth=0', { force: true });
  await page.waitForTimeout(200);
  try { await page.locator('input[type="file"]').last().setInputFiles('/tmp/test-image.png'); } catch {}
  await page.waitForTimeout(1000);
  await page.screenshot({ path: '/tmp/03-gaussian-blur.png', fullPage: true });
  
  // Test 4: Resize
  console.log('Test 4: Resize');
  await page.goto('http://localhost:4173', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  for (const cat of categories) { try { await page.click(`button:has-text("${cat}")`, { timeout: 500 }); } catch {} }
  await page.waitForTimeout(300);
  await page.click('button:has-text("图片导入")');
  await page.waitForTimeout(200);
  await page.click('button:has-text("缩放")');
  await page.waitForTimeout(200);
  await page.click('button:has-text("预览输出")');
  await page.waitForTimeout(200);
  await page.click('.react-flow__node-custom >> nth=0', { force: true });
  await page.waitForTimeout(200);
  try { await page.locator('input[type="file"]').last().setInputFiles('/tmp/test-image.png'); } catch {}
  await page.waitForTimeout(1000);
  await page.screenshot({ path: '/tmp/04-resize.png', fullPage: true });
  
  // Test 5: Blend
  console.log('Test 5: Blend');
  await page.goto('http://localhost:4173', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  for (const cat of categories) { try { await page.click(`button:has-text("${cat}")`, { timeout: 500 }); } catch {} }
  await page.waitForTimeout(300);
  await page.click('button:has-text("图片导入")');
  await page.waitForTimeout(200);
  await page.click('button:has-text("混合")');
  await page.waitForTimeout(200);
  await page.click('button:has-text("预览输出")');
  await page.waitForTimeout(200);
  await page.click('.react-flow__node-custom >> nth=0', { force: true });
  await page.waitForTimeout(200);
  try { await page.locator('input[type="file"]').last().setInputFiles('/tmp/test-image.png'); } catch {}
  await page.waitForTimeout(1000);
  await page.screenshot({ path: '/tmp/05-blend.png', fullPage: true });
  
  // Test 6: Solid Color
  console.log('Test 6: Solid Color');
  await page.goto('http://localhost:4173', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  for (const cat of categories) { try { await page.click(`button:has-text("${cat}")`, { timeout: 500 }); } catch {} }
  await page.waitForTimeout(300);
  await page.click('button:has-text("纯色填充")');
  await page.waitForTimeout(200);
  await page.click('button:has-text("预览输出")');
  await page.waitForTimeout(200);
  await page.screenshot({ path: '/tmp/06-solid-color.png', fullPage: true });
  
  console.log('All tests completed!');
});
