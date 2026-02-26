const { chromium } = require('@playwright/test');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  await page.goto('http://localhost:4177', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(3000);
  
  // 关闭预览面板 (点击关闭按钮)
  const closeBtn = page.locator('.fixed.z-50 button').first();
  if (await closeBtn.isVisible()) {
    await closeBtn.click();
    await page.waitForTimeout(500);
  }
  
  // 添加节点
  await page.click('button:has-text("纯色填充")');
  await page.waitForTimeout(800);
  await page.click('button:has-text("预览输出")');
  await page.waitForTimeout(800);
  
  // 点击第一个节点（纯色填充）
  const solidNode = page.locator('.react-flow__node-custom').first();
  await solidNode.click({ force: true });
  await page.waitForTimeout(1500);
  
  // 检查属性面板
  const propsPanel = await page.locator('.w-72.bg-bg-secondary').textContent();
  console.log('Properties panel:', propsPanel?.substring(0, 500));
  
  // 查找 input
  const inputs = await page.locator('.w-72.bg-bg-secondary input').all();
  console.log(`Found ${inputs.length} inputs in properties panel`);
  
  for (let i = 0; i < Math.min(inputs.length, 5); i++) {
    const input = inputs[i];
    const type = await input.getAttribute('type');
    console.log(`Input ${i}: type=${type}`);
  }
  
  await browser.close();
})();
