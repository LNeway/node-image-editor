const { chromium } = require('@playwright/test');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  await page.goto('http://localhost:4177', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(3000);
  
  // 获取节点面板所有按钮
  const buttons = await page.locator('nav button').all();
  console.log(`Found ${buttons.length} nav buttons`);
  
  for (let i = 0; i < buttons.length; i++) {
    const btn = buttons[i];
    const text = await btn.textContent();
    console.log(`Button ${i}: ${text?.trim()}`);
  }
  
  // 尝试展开输入分类
  console.log('\nClicking 输入 category...');
  const inputCat = page.locator('button:has-text("输入")').first();
  await inputCat.click();
  await page.waitForTimeout(1000);
  
  // 再获取一次按钮
  const buttons2 = await page.locator('nav button').all();
  console.log(`\nFound ${buttons2.length} nav buttons after expanding`);
  
  for (let i = 0; i < buttons2.length; i++) {
    const btn = buttons2[i];
    const text = await btn.textContent();
    console.log(`Button ${i}: ${text?.trim()}`);
  }
  
  await browser.close();
})();
