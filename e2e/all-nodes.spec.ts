import { test, expect } from '@playwright/test';

test('verify all nodes', async ({ page }) => {
  await page.goto('http://localhost:4173', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  
  // Expand all categories
  const categories = ['输入', '调整', '滤镜', '变换', '合成', '输出'];
  
  for (const cat of categories) {
    try {
      await page.click(`button:has-text("${cat}")`, { timeout: 1000 });
      await page.waitForTimeout(200);
    } catch (e) {
      // Category might already be expanded
    }
  }
  
  await page.waitForTimeout(500);
  
  // Get all node buttons
  const nodes = await page.locator('aside button').allTextContents();
  
  console.log('All nodes found:');
  nodes.forEach(n => console.log(' -', n));
  
  // Count nodes
  const nodeCount = nodes.filter(n => 
    n.includes('导入') || n.includes('纯色') || 
    n.includes('亮度') || n.includes('色阶') || n.includes('HSL') || n.includes('色彩') ||
    n.includes('模糊') || 
    n.includes('缩放') || n.includes('裁剪') || n.includes('旋转') || n.includes('翻转') ||
    n.includes('混合') ||
    n.includes('导出') || n.includes('预览')
  ).length;
  
  console.log('\nTotal filter nodes:', nodeCount);
  
  await page.screenshot({ path: '/tmp/all-nodes.png', fullPage: true });
});
