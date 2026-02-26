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
  
  // 获取所有节点并打印每个节点的文本
  const nodes = await page.locator('.react-flow__node-custom').all();
  console.log('节点数量:', nodes.length);
  
  for (let i = 0; i < nodes.length; i++) {
    const text = await nodes[i].textContent();
    console.log(`节点 ${i}: ${text?.substring(0, 50)}`);
  }
  
  // 点击第2个节点（索引1）
  console.log('\n点击节点1...');
  await nodes[1].click({ force: true });
  await page.waitForTimeout(1000);
  
  // 获取属性面板内容
  const panel = await page.locator('.w-72.bg-bg-secondary').textContent();
  console.log('\n属性面板内容:', panel?.substring(0, 300));
  
  await browser.close();
})();
