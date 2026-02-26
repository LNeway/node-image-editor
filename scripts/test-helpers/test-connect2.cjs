const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  await page.goto('http://localhost:4174', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(3000);
  
  // 添加节点
  await page.click('button:has-text("纯色填充")');
  await page.waitForTimeout(500);
  await page.click('button:has-text("亮度/对比度")');
  await page.waitForTimeout(500);
  await page.click('button:has-text("预览输出")');
  await page.waitForTimeout(1000);
  
  // 关闭预览
  const closeBtn = page.locator('.fixed button').first();
  if (await closeBtn.isVisible()) {
    await closeBtn.click();
    await page.waitForTimeout(500);
  }
  
  // 获取 handles
  const rightHandles = await page.locator('.react-flow__handle-right').all();
  const leftHandles = await page.locator('.react-flow__handle-left').all();
  
  console.log('handle数:', rightHandles.length, '/', leftHandles.length);
  
  // 连接1: 纯色 -> 亮度 (右侧handle[0] -> 左侧handle[0])
  const src1 = await rightHandles[0].boundingBox();
  const tgt1 = await leftHandles[0].boundingBox();
  console.log('连接1:', src1, '->', tgt1);
  
  // 使用 mouse 拖拽
  await page.mouse.move(src1.x + 3, src1.y + 3);
  await page.mouse.down();
  await page.mouse.move(tgt1.x + 3, tgt1.y + 3, { steps: 20 });
  await page.mouse.up();
  await page.waitForTimeout(1000);
  
  // 连接2: 亮度 -> 预览 (右侧handle[1] -> 左侧handle[1])
  const rightHandles2 = await page.locator('.react-flow__handle-right').all();
  const leftHandles2 = await page.locator('.react-flow__handle-left').all();
  
  if (rightHandles2.length > 1 && leftHandles2.length > 1) {
    const src2 = await rightHandles2[1].boundingBox();
    const tgt2 = await leftHandles2[1].boundingBox();
    console.log('连接2:', src2, '->', tgt2);
    
    // 使用 force 拖拽
    await page.mouse.move(src2.x + 3, src2.y + 3);
    await page.mouse.down();
    await page.mouse.move(tgt2.x + 3, tgt2.y + 3, { steps: 20 });
    await page.mouse.up();
    await page.waitForTimeout(1000);
  }
  
  const edges = await page.locator('.react-flow__edge').count();
  console.log('连接数:', edges);
  
  await browser.close();
})();
