const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  await page.goto('http://localhost:4174', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(3000);
  
  // 添加纯色填充
  await page.click('button:has-text("纯色填充")');
  await page.waitForTimeout(1000);
  
  // 添加预览输出
  await page.click('button:has-text("预览输出")');
  await page.waitForTimeout(2000);
  
  // 关闭预览面板 - 点击关闭按钮
  const closeBtn = page.locator('.fixed button').first();
  if (await closeBtn.isVisible()) {
    await closeBtn.click();
    await page.waitForTimeout(500);
  }
  
  // 现在点击节点
  const nodes = await page.locator('.react-flow__node-custom').all();
  console.log('节点数:', nodes.length);
  
  // 找到纯色节点
  for (const node of nodes) {
    const text = await node.textContent();
    if (text?.includes('纯色')) {
      console.log('点击纯色节点...');
      await node.click({ force: true });
      await page.waitForTimeout(1000);
      break;
    }
  }
  
  // 检查属性面板
  const panel = await page.locator('.w-72.bg-bg-secondary').textContent();
  console.log('属性面板:', panel?.substring(0, 150));
  
  await browser.close();
})();
