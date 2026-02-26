const { chromium } = require('@playwright/test');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  await page.goto('http://localhost:4174', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(3000);
  
  // 获取所有节点库按钮文本
  const buttons = await page.locator('nav button').all();
  
  console.log('节点库按钮列表:');
  for (let i = 0; i < buttons.length; i++) {
    const text = await buttons[i].textContent();
    console.log(`  ${i}: ${text?.trim()}`);
  }
  
  await browser.close();
})();
