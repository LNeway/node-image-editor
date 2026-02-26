const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  // 监听控制台消息
  page.on('console', msg => console.log('CONSOLE:', msg.text()));
  page.on('pageerror', err => console.log('ERROR:', err.message));
  
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
  
  // 获取所有节点
  const nodes = await page.locator('.react-flow__node-custom').all();
  console.log('节点数量:', nodes.length);
  
  // 点击第2个节点
  if (nodes.length >= 2) {
    console.log('点击节点1...');
    await nodes[1].click({ force: true });
    await page.waitForTimeout(1000);
  }
  
  // 获取属性面板内容
  const panel = await page.locator('.w-72.bg-bg-secondary').textContent();
  console.log('属性面板内容:', panel?.substring(0, 200));
  
  await browser.close();
})();
