const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  await page.goto('http://localhost:4174', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(2000);
  
  // 点击添加纯色填充
  await page.click('button:has-text("纯色填充")');
  await page.waitForTimeout(500);
  
  // 点击添加亮度/对比度
  await page.click('button:has-text("亮度/对比度")');
  await page.waitForTimeout(500);
  
  // 点击添加预览输出
  await page.click('button:has-text("预览输出")');
  await page.waitForTimeout(500);
  
  // 检查所有 handle
  const rightHandles = await page.locator('.react-flow__handle-right').all();
  const leftHandles = await page.locator('.react-flow__handle-left').all();
  
  console.log('右侧 Handle 数量:', rightHandles.length);
  console.log('左侧 Handle 数量:', leftHandles.length);
  
  // 打印每个 handle 所属的节点
  for (let i = 0; i < rightHandles.length; i++) {
    const handle = rightHandles[i];
    const parent = await handle.locator('..').textContent();
    console.log(`右侧 Handle ${i}: ${parent?.substring(0, 30)}`);
  }
  
  for (let i = 0; i < leftHandles.length; i++) {
    const handle = leftHandles[i];
    const parent = await handle.locator('..').textContent();
    console.log(`左侧 Handle ${i}: ${parent?.substring(0, 30)}`);
  }
  
  await browser.close();
})();
