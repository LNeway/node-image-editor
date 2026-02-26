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
  
  // 截图看看现在的状态
  await page.screenshot({ path: '/tmp/before-select.png', fullPage: true });
  
  // 获取第一个节点的位置
  const solidNode = page.locator('.react-flow__node-custom').first();
  const nodeBox = await solidNode.boundingBox();
  console.log('Node box:', nodeBox);
  
  // 在节点中心点击
  if (nodeBox) {
    await page.mouse.click(nodeBox.x + nodeBox.width / 2, nodeBox.y + nodeBox.height / 2);
    await page.waitForTimeout(1500);
  }
  
  // 再次截图
  await page.screenshot({ path: '/tmp/after-select.png', fullPage: true });
  
  // 检查属性面板
  const propsPanel = await page.locator('.w-72.bg-bg-secondary').textContent();
  console.log('Properties panel:', propsPanel?.substring(0, 500));
  
  await browser.close();
})();
