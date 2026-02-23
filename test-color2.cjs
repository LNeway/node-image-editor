const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  await page.goto('http://localhost:4174', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(3000); // 等待更长时间确保图像加载
  
  // 添加纯色填充
  await page.click('button:has-text("纯色填充")');
  await page.waitForTimeout(1000);
  
  // 添加预览输出
  await page.click('button:has-text("预览输出")');
  await page.waitForTimeout(2000); // 等待执行完成
  
  // 获取预览 canvas
  const canvas = await page.locator('canvas').first();
  
  // 等待一小段时间确保图像绘制完成
  await page.waitForTimeout(500);
  
  // 获取颜色
  const initialColor = await canvas.evaluate((c) => {
    const ctx = c.getContext('2d');
    const pixel = ctx.getImageData(100, 100, 1, 1).data;
    return pixel;
  });
  console.log('初始颜色 (灰色):', Array.from(initialColor));
  
  // 选择纯色填充节点
  const nodes = await page.locator('.react-flow__node-custom').all();
  let solidNode = null;
  for (const node of nodes) {
    const text = await node.textContent();
    if (text?.includes('纯色')) {
      solidNode = node;
      break;
    }
  }
  
  if (solidNode) {
    await solidNode.click({ force: true });
    await page.waitForTimeout(500);
  }
  
  // 找到颜色输入并修改
  // 使用更通用的选择器
  const colorInput = await page.locator('input[type="color"]').first();
  if (await colorInput.isVisible()) {
    await colorInput.fill('#00ff00');
    await page.waitForTimeout(2000); // 等待重新执行
    
    // 获取新颜色
    const newColor = await canvas.evaluate((c) => {
      const ctx = c.getContext('2d');
      const pixel = ctx.getImageData(100, 100, 1, 1).data;
      return pixel;
    });
    console.log('修改后颜色 (绿色):', Array.from(newColor));
    
    // 检查是否变成绿色 (0, 255, 0)
    const isGreen = newColor[1] > 200 && newColor[0] < 50 && newColor[2] < 50;
    console.log('颜色变化成功:', isGreen ? 'YES' : 'NO');
  } else {
    console.log('颜色输入框不可见');
  }
  
  await browser.close();
})();
