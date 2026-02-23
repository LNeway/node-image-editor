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
  await page.waitForTimeout(2000);
  
  // 最小化预览
  await page.locator('.fixed.z-50 button').first().click();
  await page.waitForTimeout(1000);
  
  // 验证预览是否最小化
  const previewMin = await page.locator('.fixed.z-50').getAttribute('class');
  console.log('Preview class:', previewMin);
  
  // 选择纯色填充节点
  await page.locator('.react-flow__node-custom').first().click({ force: true });
  await page.waitForTimeout(1000);
  
  // 设置颜色
  await page.locator('.w-72.bg-bg-secondary input[type="color"]').fill('#ff0000');
  await page.waitForTimeout(2000);
  
  // 再次点击最小化按钮来恢复预览
  console.log('Restoring preview...');
  const buttons = await page.locator('.fixed.z-50 button').all();
  console.log('Buttons in preview:', buttons.length);
  
  // 点击第一个按钮
  if (buttons.length > 0) {
    await buttons[0].click();
    await page.waitForTimeout(2000);
  }
  
  // 检查 canvas
  const canvasCount = await page.locator('canvas').count();
  console.log('Canvas count:', canvasCount);
  
  // 采样
  const pixel = await page.evaluate(() => {
    const canvas = document.querySelector('canvas');
    if (!canvas) return { error: 'no canvas' };
    const ctx = canvas.getContext('2d');
    const data = ctx.getImageData(canvas.width / 2, canvas.height / 2, 1, 1).data;
    return { r: data[0], g: data[1], b: data[2] };
  });
  console.log('Pixel:', pixel);
  
  await browser.close();
})();
