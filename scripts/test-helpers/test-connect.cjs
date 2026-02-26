const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  await page.goto('http://localhost:4174', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(3000);
  
  // 添加纯色填充
  await page.click('button:has-text("纯色填充")');
  await page.waitForTimeout(500);
  
  // 添加亮度/对比度
  await page.click('button:has-text("亮度/对比度")');
  await page.waitForTimeout(500);
  
  // 添加预览输出
  await page.click('button:has-text("预览输出")');
  await page.waitForTimeout(1000);
  
  // 关闭预览
  const closeBtn = page.locator('.fixed button').first();
  if (await closeBtn.isVisible()) {
    await closeBtn.click();
    await page.waitForTimeout(500);
  }
  
  // 获取所有 handles
  const rightHandles = await page.locator('.react-flow__handle-right').all();
  const leftHandles = await page.locator('.react-flow__handle-left').all();
  
  console.log('右侧handle数:', rightHandles.length);
  console.log('左侧handle数:', leftHandles.length);
  
  // 打印每个handle的信息
  for (let i = 0; i < rightHandles.length; i++) {
    const box = await rightHandles[i].boundingBox();
    console.log(`右侧handle[${i}]: x=${box?.x}, y=${box?.y}`);
  }
  for (let i = 0; i < leftHandles.length; i++) {
    const box = await leftHandles[i].boundingBox();
    console.log(`左侧handle[${i}]: x=${box?.x}, y=${box?.y}`);
  }
  
  // 尝试连接 - 从纯色(右侧)到亮度(左侧)
  if (rightHandles.length > 0 && leftHandles.length > 0) {
    // 使用 dragTo 方法
    console.log('尝试连接 handle[0] -> handle[0]...');
    await rightHandles[0].dragTo(leftHandles[0]);
    await page.waitForTimeout(1000);
  }
  
  // 再次获取 handles
  const rightHandles2 = await page.locator('.react-flow__handle-right').all();
  const leftHandles2 = await page.locator('.react-flow__handle-left').all();
  
  if (rightHandles2.length > 1 && leftHandles2.length > 1) {
    console.log('尝试连接 handle[1] -> handle[1]...');
    await rightHandles2[1].dragTo(leftHandles2[1]);
    await page.waitForTimeout(1000);
  }
  
  const edges = await page.locator('.react-flow__edge').count();
  console.log('连接数:', edges);
  
  await browser.close();
})();
