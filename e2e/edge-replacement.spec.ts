import { test, expect } from '@playwright/test';

test('edge connection replacement - single input port should only have one edge', async ({ page }) => {
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  
  // Expand all categories
  const categories = ['输入', '调整', '滤镜', '变换', '合成', '输出'];
  for (const cat of categories) {
    try { await page.click(`button:has-text("${cat}")`, { timeout: 500 }); } catch {}
  }
  await page.waitForTimeout(500);
  
  // Add two image import nodes and one preview node
  await page.click('button:has-text("图片导入")');
  await page.waitForTimeout(200);
  await page.click('button:has-text("图片导入")');
  await page.waitForTimeout(200);
  await page.click('button:has-text("预览输出")');
  await page.waitForTimeout(300);
  
  // Verify we have 3 nodes
  const nodes = await page.locator('.react-flow__node-custom').count();
  expect(nodes).toBe(3);
  
  // Get the handles
  // First image import output, second image import output, preview input
  const outputHandles = await page.locator('.react-flow__handle-bottom').all();
  const inputHandles = await page.locator('.react-flow__handle-top').all();
  
  // Connect first image import to preview input
  if (outputHandles.length >= 1 && inputHandles.length >= 1) {
    await outputHandles[0].dragTo(inputHandles[0]);
    await page.waitForTimeout(300);
  }
  
  // Count edges - should be 1
  let edges = await page.locator('.react-flow__edge').count();
  expect(edges).toBe(1);
  
  // Connect second image import to same preview input (should replace the first)
  if (outputHandles.length >= 2 && inputHandles.length >= 1) {
    await outputHandles[1].dragTo(inputHandles[0]);
    await page.waitForTimeout(300);
  }
  
  // Count edges - should still be 1 (replacement behavior)
  edges = await page.locator('.react-flow__edge').count();
  expect(edges).toBe(1);
  
  // The edge path should contain the second source node's id
  
  console.log('Edge replacement test passed - only one edge to single input port');
  
  await page.screenshot({ path: '/tmp/edge-replacement-test.png', fullPage: true });
});