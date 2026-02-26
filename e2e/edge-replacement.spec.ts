import { test, expect } from '@playwright/test';

test.describe('Edge Connection Handler', () => {
  test('connecting second source to same input replaces first edge', async ({ page }) => {
    // 等待页面加载完成
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // 点击 "Add Node" 按钮添加第一个源节点 (Solid Color)
    const addSolidColorBtn = page.locator('button:has-text("Solid Color")').first();
    await addSolidColorBtn.click();
    await page.waitForTimeout(500);
    
    // 添加第二个源节点 (Solid Color)
    await addSolidColorBtn.click();
    await page.waitForTimeout(500);
    
    // 添加目标节点 (Preview Output)
    const addPreviewBtn = page.locator('button:has-text("Preview Output")').first();
    await addPreviewBtn.click();
    await page.waitForTimeout(500);
    
    // 获取所有节点的 handle
    // 查找所有源节点（输出 handle）和目标节点（输入 handle）
    const sourceHandles = page.locator('.react-flow__handle-source');
    const targetHandles = page.locator('.react-flow__handle-target');
    
    // 确保我们有足够的 handle 来进行连接
    const sourceCount = await sourceHandles.count();
    const targetCount = await targetHandles.count();
    
    console.log(`Source handles: ${sourceCount}, Target handles: ${targetCount}`);
    
    // 至少需要 2 个源 handle 和 1 个目标 handle
    if (sourceCount < 2 || targetCount < 1) {
      console.log('Not enough handles to test edge replacement');
      return;
    }
    
    // 连接第一个源节点到目标节点
    const firstSourceHandle = sourceHandles.nth(0);
    const targetHandle = targetHandles.nth(0);
    
    // 使用拖拽连接
    await firstSourceHandle.hover();
    await page.mouse.down();
    await targetHandle.hover();
    await page.mouse.up();
    
    await page.waitForTimeout(500);
    
    // 连接第二个源节点到同一个目标节点
    const secondSourceHandle = sourceHandles.nth(1);
    
    await secondSourceHandle.hover();
    await page.mouse.down();
    await targetHandle.hover();
    await page.mouse.up();
    
    await page.waitForTimeout(500);
    
    // 验证：只应该有一条边连接到目标节点
    // 通过检查边的数量来验证
    const edges = page.locator('.react-flow__edge');
    const edgeCount = await edges.count();
    
    // 预期：只有 1 条边（第二个源节点替换了第一个）
    expect(edgeCount).toBe(1);
  });
});
