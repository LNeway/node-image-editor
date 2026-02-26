const { chromium } = require('@playwright/test');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  await page.goto('http://localhost:4177', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(3000);
  
  // 添加节点并连接
  await page.click('button:has-text("纯色填充")');
  await page.waitForTimeout(800);
  await page.click('button:has-text("预览输出")');
  await page.waitForTimeout(800);
  
  const sourceHandle = page.locator('.react-flow__handle-right').first();
  const targetHandle = page.locator('.react-flow__handle-left').first();
  const sourceBox = await sourceHandle.boundingBox();
  const targetBox = await targetHandle.boundingBox();
  
  await page.mouse.move(sourceBox.x + 3, sourceBox.y + 3);
  await page.mouse.down();
  await page.mouse.move(targetBox.x + 3, targetBox.y + 3, { steps: 20 });
  await page.mouse.up();
  await page.waitForTimeout(3000);
  
  // 不最小化，直接选择节点
  await page.locator('.react-flow__node-custom').first().click({ force: true });
  await page.waitForTimeout(1500);
  
  // 设置颜色为红色
  await page.locator('.w-72.bg-bg-secondary input[type="color"]').fill('#ff0000');
  await page.waitForTimeout(3000);
  
  // 采样多个像素
  const pixels = await page.evaluate(() => {
    const canvas = document.querySelector('canvas');
    if (!canvas) return { error: 'no canvas' };
    
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;
    
    // 采样多个位置
    const positions = [
      { x: w/2, y: h/2 },
      { x: 10, y: 10 },
      { x: w-10, y: h-10 },
      { x: w/4, y: h/4 },
      { x: 3*w/4, y: 3*h/4 },
    ];
    
    return positions.map(pos => {
      const data = ctx.getImageData(pos.x, pos.y, 1, 1).data;
      return { x: pos.x, y: pos.y, r: data[0], g: data[1], b: data[2] };
    });
  });
  
  console.log('Canvas pixels:', JSON.stringify(pixels, null, 2));
  
  // 检查 canvas 尺寸
  const canvasInfo = await page.evaluate(() => {
    const canvas = document.querySelector('canvas');
    return { width: canvas?.width, height: canvas?.height };
  });
  console.log('Canvas size:', canvasInfo);
  
  await browser.close();
})();
