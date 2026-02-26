const { chromium } = require('@playwright/test');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  await page.goto('http://localhost:4173', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(3000);
  
  console.log('\n========== 详细调试: 节点选择 ==========\n');
  
  // 添加节点
  await page.click('button:has-text("纯色填充")');
  await page.waitForTimeout(500);
  await page.click('button:has-text("亮度/对比度")');
  await page.waitForTimeout(500);
  await page.click('button:has-text("预览输出")');
  await page.waitForTimeout(1000);
  
  // 获取所有节点
  const nodesInfo = await page.evaluate(() => {
    const nodes = document.querySelectorAll('.react-flow__node-custom');
    return Array.from(nodes).map((n, i) => ({
      index: i,
      text: n.textContent?.substring(0, 50),
      classList: n.classList.toString()
    }));
  });
  
  console.log('节点信息:');
  nodesInfo.forEach(n => console.log(`  ${n.index}: ${n.text} | classes: ${n.classList}`));
  
  // 点击第2个节点（亮度/对比度）
  console.log('\n点击第2个节点...');
  await page.evaluate(() => {
    const nodes = document.querySelectorAll('.react-flow__node-custom');
    if (nodes[1]) {
      nodes[1].click();
    }
  });
  await page.waitForTimeout(2000);
  
  // 检查属性面板
  const propsPanel = await page.locator('.w-72.bg-bg-secondary').textContent();
  console.log('\n属性面板:');
  console.log(propsPanel.substring(0, 300));
  
  await browser.close();
})();
