const { chromium } = require('@playwright/test');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  await page.goto('http://localhost:4177', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(3000);
  
  // 点击 canvas 确保 React Flow 获得焦点
  await page.click('.react-flow__pane');
  await page.waitForTimeout(500);
  
  // 添加节点
  await page.click('button:has-text("纯色填充")');
  await page.waitForTimeout(800);
  await page.click('button:has-text("预览输出")');
  await page.waitForTimeout(800);
  
  // 连接节点
  const handles = await page.locator('.react-flow__handle').all();
  console.log(`Found ${handles.length} handles`);
  
  // 获取正确的前两个 handles（第一个节点的右边和第二个节点的左边）
  const sourceHandle = page.locator('.react-flow__handle-right').first();
  const targetHandle = page.locator('.react-flow__handle-left').first();
  
  const sourceBox = await sourceHandle.boundingBox();
  const targetBox = await targetHandle.boundingBox();
  console.log('Source handle:', sourceBox);
  console.log('Target handle:', targetBox);
  
  if (sourceBox && targetBox) {
    await page.mouse.move(sourceBox.x + 3, sourceBox.y + 3);
    await page.mouse.down();
    await page.mouse.move(targetBox.x + 3, targetBox.y + 3, { steps: 20 });
    await page.mouse.up();
    await page.waitForTimeout(1000);
  }
  
  // 现在尝试用键盘选择第一个节点
  // 先点击 canvas
  await page.click('.react-flow__pane');
  await page.waitForTimeout(300);
  
  // 使用箭头键选择
  await page.keyboard.press('ArrowRight');
  await page.waitForTimeout(500);
  await page.keyboard.press('ArrowRight');
  await page.waitForTimeout(500);
  
  // 截图
  await page.screenshot({ path: '/tmp/after-keyboard.png', fullPage: true });
  
  // 检查属性面板
  const propsPanel = await page.locator('.w-72.bg-bg-secondary').textContent();
  console.log('Properties panel:', propsPanel?.substring(0, 300));
  
  // 也检查节点是否有 selected class
  const selectedNodes = await page.locator('.react-flow__node-custom.selected').count();
  console.log('Selected nodes:', selectedNodes);
  
  await browser.close();
})();
