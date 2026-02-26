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
  
  // 连接节点
  const sourceHandle = page.locator('.react-flow__handle-right').first();
  const targetHandle = page.locator('.react-flow__handle-left').first();
  const sourceBox = await sourceHandle.boundingBox();
  const targetBox = await targetHandle.boundingBox();
  
  await page.mouse.move(sourceBox.x + 3, sourceBox.y + 3);
  await page.mouse.down();
  await page.mouse.move(targetBox.x + 3, targetBox.y + 3, { steps: 20 });
  await page.mouse.up();
  await page.waitForTimeout(1500);
  
  // 先关闭预览面板
  const closeBtn = page.locator('.fixed.z-50 button').first();
  if (await closeBtn.isVisible()) {
    await closeBtn.click();
    await page.waitForTimeout(500);
  }
  
  // 现在选择纯色填充节点
  console.log('Selecting solid color node...');
  await page.locator('.react-flow__node-custom').first().click({ force: true });
  await page.waitForTimeout(1500);
  
  // 检查属性面板
  const propsText = await page.locator('.w-72.bg-bg-secondary').textContent();
  console.log('Props panel:', propsText?.substring(0, 200));
  
  // 查找颜色输入
  const colorInput = page.locator('.w-72.bg-bg-secondary input[type="color"]');
  const count = await colorInput.count();
  console.log('Color inputs found:', count);
  
  if (count > 0) {
    console.log('Setting color to red...');
    await colorInput.first().fill('#ff0000');
    await page.waitForTimeout(2000);
    
    // 重新打开预览面板 - 通过双击预览输出节点
    console.log('Re-opening preview...');
    await page.locator('.react-flow__node-custom').last().dblclick({ force: true });
    await page.waitForTimeout(2000);
    
    // 采样像素
    const pixel = await page.evaluate(() => {
      const canvas = document.querySelector('.fixed.z-50 canvas');
      if (!canvas) return { error: 'No canvas' };
      const ctx = canvas.getContext('2d');
      const data = ctx.getImageData(canvas.width / 2, canvas.height / 2, 1, 1).data;
      return { r: data[0], g: data[1], b: data[2] };
    });
    console.log('Pixel:', pixel);
  }
  
  await browser.close();
})();
