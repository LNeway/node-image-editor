const { chromium } = require('@playwright/test');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  await page.goto('http://localhost:4177', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(3000);
  
  // 添加节点
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
  await page.waitForTimeout(2000);
  
  // 使用 JavaScript 直接触发节点选择
  const selectionResult = await page.evaluate(() => {
    // 找到第一个节点
    const node = document.querySelector('.react-flow__node-custom');
    if (!node) return { error: 'no node found' };
    
    // 模拟点击
    node.click();
    
    // 等待一下
    return { clicked: true };
  });
  
  console.log('Selection result:', selectionResult);
  await page.waitForTimeout(1500);
  
  // 检查属性面板
  const propsText = await page.locator('.w-72.bg-bg-secondary').textContent();
  console.log('Props panel:', propsText?.substring(0, 300));
  
  // 尝试用 JavaScript 设置颜色
  await page.evaluate(() => {
    const input = document.querySelector('.w-72.bg-bg-secondary input[type="color"]');
    if (input) {
      input.value = '#ff0000';
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.dispatchEvent(new Event('change', { bubbles: true }));
    }
  });
  
  await page.waitForTimeout(2000);
  
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
