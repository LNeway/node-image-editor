const { chromium } = require('@playwright/test');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  await page.goto('http://localhost:4177', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(3000);
  
  // 添加纯色填充节点
  console.log('Adding solid color node...');
  await page.click('button:has-text("纯色填充")');
  await page.waitForTimeout(1000);
  
  // 添加预览输出节点
  console.log('Adding preview node...');
  await page.click('button:has-text("预览输出")');
  await page.waitForTimeout(1000);
  
  // 截图
  await page.screenshot({ path: '/tmp/editor-state.png', fullPage: true });
  console.log('Screenshot saved to /tmp/editor-state.png');
  
  // 查看节点
  const nodes = await page.locator('.react-flow__node-custom').all();
  console.log(`Found ${nodes.length} nodes on canvas`);
  
  for (let i = 0; i < nodes.length; i++) {
    const text = await nodes[i].textContent();
    console.log(`Node ${i}: ${text?.trim().replace(/\s+/g, ' ')}`);
  }
  
  await browser.close();
})();
