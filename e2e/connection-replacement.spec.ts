import { test, expect } from '@playwright/test';

test('connection replacement - new edge replaces existing connection to same target handle', async ({ page }) => {
  await page.goto('http://localhost:4173', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  
  // Expand all categories
  const categories = ['输入', '调整', '滤镜', '变换', '合成', '输出'];
  for (const cat of categories) {
    try { await page.click(`button:has-text("${cat}")`, { timeout: 500 }); } catch { /* category already expanded */ }
  }
  await page.waitForTimeout(500);
  
  // Add nodes: Image Import -> Brightness -> Preview
  await page.click('button:has-text("图片导入")');
  await page.waitForTimeout(200);
  await page.click('button:has-text("亮度/对比度")');
  await page.waitForTimeout(200);
  await page.click('button:has-text("高斯模糊")');
  await page.waitForTimeout(200);
  await page.click('button:has-text("预览输出")');
  await page.waitForTimeout(500);
  
  // Get all nodes
  const nodes = await page.locator('.react-flow__node-custom').all();
  expect(nodes.length).toBe(4);
  
  // Get initial edge count (should be 0)
  let edges = await page.locator('.react-flow__edge').count();
  expect(edges).toBe(0);
  
  // Connect Image Import to Brightness
  const imageImportOutput = page.locator('.react-flow__handle-source').first();
  const brightnessInput = page.locator('.react-flow__handle-target').first();
  await imageImportOutput.dragTo(brightnessInput);
  await page.waitForTimeout(300);
  
  edges = await page.locator('.react-flow__edge').count();
  expect(edges).toBe(1);
  
  // Connect Brightness to Preview
  const brightnessOutput = page.locator('.react-flow__handle-source').nth(1);
  const previewInput = page.locator('.react-flow__handle-target').nth(2);
  await brightnessOutput.dragTo(previewInput);
  await page.waitForTimeout(300);
  
  edges = await page.locator('.react-flow__edge').count();
  expect(edges).toBe(2);
  
  // Now connect Gaussian Blur to Preview (same target handle)
  // This should REPLACE the existing Brightness->Preview connection
  const gaussianOutput = page.locator('.react-flow__handle-source').nth(2);
  await gaussianOutput.dragTo(previewInput);
  await page.waitForTimeout(300);
  
  // Edge count should still be 2, not 3
  // Because the new connection replaced the old one
  edges = await page.locator('.react-flow__edge').count();
  expect(edges).toBe(2);
  
  // Take screenshot to verify
  await page.screenshot({ path: '/tmp/connection-replacement-test.png', fullPage: true });
  
  console.log('Connection replacement test passed: new edge replaced existing connection to same target handle');
});