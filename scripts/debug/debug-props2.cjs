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
  const targetHandle = page.locator('.react-flow__handle-left').last();
  const sourceBox = await sourceHandle.boundingBox();
  const targetBox = await targetHandle.boundingBox();
  
  if (sourceBox && targetBox) {
    await page.mouse.move(sourceBox.x + 5, sourceBox.y + 5);
    await page.mouse.down();
    await page.mouse.move(targetBox.x + 5, targetBox.y + 5, { steps: 10 });
    await page.mouse.up();
    await page.waitForTimeout(1000);
  }
  
  // 双击纯色填充节点
  console.log('Double-clicking solid color node...');
  const solidNode = page.locator('.react-flow__node-custom').first();
  await solidNode.dblclick({ force: true });
  await page.waitForTimeout(1500);
  
  // 获取属性面板内容
  const propsPanel = await page.locator('.w-72.bg-bg-secondary').textContent();
  console.log('Properties panel:', propsPanel?.substring(0, 500));
  
  // 查找 input 元素
  const inputs = await page.locator('.w-72.bg-bg-secondary input').all();
  console.log(`\nFound ${inputs.length} inputs in properties panel`);
  
  await browser.close();
})();
