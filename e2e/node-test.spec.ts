import { test, expect } from '@playwright/test';

test('test all nodes permutation', async ({ page }) => {
  await page.goto('http://localhost:4173', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  
  const results: string[] = [];
  
  // Test function to add a node
  const addNode = async (name: string) => {
    try {
      await page.click(`button:has-text("${name}")`, { timeout: 2000 });
      await page.waitForTimeout(300);
      results.push(`✓ ${name}`);
      return true;
    } catch (e) {
      results.push(`✗ ${name}`);
      return false;
    }
  };
  
  // Expand categories
  const expandCategory = async (cat: string) => {
    try {
      await page.click(`button:has-text("${cat}")`, { timeout: 500 });
      await page.waitForTimeout(200);
    } catch (e) {}
  };
  
  // Test all nodes
  const nodes = [
    // Input
    '图片导入', '纯色填充',
    // Adjust
    '亮度/对比度', '色阶', 'HSL调整', '色彩平衡',
    // Filter
    '高斯模糊',
    // Transform
    '缩放', '裁剪', '旋转', '翻转',
    // Composite
    '混合',
    // Output
    '图片导出', '预览输出'
  ];
  
  // Expand all categories first
  await expandCategory('输入');
  await expandCategory('调整');
  await expandCategory('滤镜');
  await expandCategory('变换');
  await expandCategory('合成');
  await expandCategory('输出');
  
  await page.waitForTimeout(500);
  
  // Try each node
  for (const node of nodes) {
    await addNode(node);
  }
  
  console.log('\n=== Test Results ===');
  results.forEach(r => console.log(r));
  
  const successCount = results.filter(r => r.startsWith('✓')).length;
  console.log(`\nSuccess: ${successCount}/${nodes.length}`);
  
  await page.screenshot({ path: '/tmp/node-test.png', fullPage: true });
});
