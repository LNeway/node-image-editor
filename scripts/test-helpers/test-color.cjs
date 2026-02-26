const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  // 监听控制台
  page.on('console', msg => {
    if (msg.text().includes('Execution') || msg.text().includes('params')) {
      console.log('CONSOLE:', msg.text());
    }
  });
  
  await page.goto('http://localhost:4174', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(2000);
  
  // 添加纯色填充
  await page.click('button:has-text("纯色填充")');
  await page.waitForTimeout(500);
  
  // 添加预览输出
  await page.click('button:has-text("预览输出")');
  await page.waitForTimeout(500);
  
  // 连接
  await page.waitForTimeout(1000);
  
  // 获取初始预览的像素
  const canvas = await page.locator('canvas').first();
  const initialColor = await canvas.evaluate((ctx) => {
    const ctx2d = ctx.getContext('2d');
    const pixel = ctx2d.getImageData(10, 10, 1, 1).data;
    return pixel;
  });
  console.log('初始颜色:', initialColor);
  
  // 选择纯色填充节点 - 找到它
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
    await page.waitForTimeout(1000);
  }
  
  // 设置颜色为绿色 - 点击颜色输入框
  const colorInput = await page.locator('input[type="color"]').first();
  if (colorInput) {
    await colorInput.fill('#00ff00');
    await page.waitForTimeout(1000);
    
    // 获取新颜色
    const newColor = await canvas.evaluate((ctx) => {
      const ctx2d = ctx.getContext('2d');
      const pixel = ctx2d.getImageData(10, 10, 1, 1).data;
      return pixel;
    });
    console.log('修改后的颜色:', newColor);
  }
  
  await browser.close();
})();
