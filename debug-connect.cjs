const { chromium } = require('@playwright/test');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  await page.goto('http://localhost:4177', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(3000);
  
  // 添加纯色填充节点
  console.log('Adding solid color node...');
  await page.click('button:has-text("纯色填充")');
  await page.waitForTimeout(800);
  
  // 添加预览输出节点
  console.log('Adding preview node...');
  await page.click('button:has-text("预览输出")');
  await page.waitForTimeout(800);
  
  // 查找 handles
  const handles = await page.locator('.react-flow__handle').all();
  console.log(`Found ${handles.length} handles`);
  
  for (let i = 0; i < handles.length; i++) {
    const h = handles[i];
    const pos = await h.getAttribute('data-handlepos');
    console.log(`Handle ${i}: position=${pos}`);
  }
  
  // 尝试连接：从第一个节点的右边拖到第二个节点的左边
  console.log('\nAttempting to connect nodes...');
  
  const sourceHandle = page.locator('.react-flow__handle-right').first();
  const targetHandle = page.locator('.react-flow__handle-left').last();
  
  // 获取位置
  const sourceBox = await sourceHandle.boundingBox();
  const targetBox = await targetHandle.boundingBox();
  
  console.log(`Source: x=${sourceBox?.x}, y=${sourceBox?.y}`);
  console.log(`Target: x=${targetBox?.x}, y=${targetBox?.y}`);
  
  if (sourceBox && targetBox) {
    await page.mouse.move(sourceBox.x + 5, sourceBox.y + 5);
    await page.mouse.down();
    await page.mouse.move(targetBox.x + 5, targetBox.y + 5, { steps: 10 });
    await page.mouse.up();
    await page.waitForTimeout(1000);
  }
  
  // 截图
  await page.screenshot({ path: '/tmp/connected-state.png', fullPage: true });
  console.log('Screenshot saved');
  
  // 检查是否有边
  const edges = await page.locator('.react-flow__edge').count();
  console.log(`Edges count: ${edges}`);
  
  await browser.close();
})();
