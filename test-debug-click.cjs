const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  // 监听控制台日志
  page.on('console', msg => console.log('BROWSER:', msg.text()));
  
  await page.goto('http://localhost:4174', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(3000);
  
  // 添加纯色填充
  await page.click('button:has-text("纯色填充")');
  await page.waitForTimeout(1000);
  
  // 获取节点
  const nodes = await page.locator('.react-flow__node-custom').all();
  console.log('节点数:', nodes.length);
  
  // 点击第一个节点
  console.log('点击第一个节点...');
  await nodes[0].click();
  await page.waitForTimeout(2000);
  
  // 获取属性面板
  const panel = await page.locator('.w-72.bg-bg-secondary').textContent();
  console.log('属性面板:', panel?.substring(0, 100));
  
  await browser.close();
})();
