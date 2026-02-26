const { chromium } = require('@playwright/test');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  await page.goto('http://localhost:4177', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(2000);
  
  // 点击纯色填充节点
  const solidBtn = page.locator('button:has-text("纯色填充")').first();
  await solidBtn.click({ timeout: 10000 });
  await page.waitForTimeout(2000);
  
  // 获取所有输入框
  const inputs = await page.locator('input').all();
  console.log(`Found ${inputs.length} inputs`);
  
  for (let i = 0; i < inputs.length; i++) {
    const input = inputs[i];
    const type = await input.getAttribute('type');
    const placeholder = await input.getAttribute('placeholder');
    const value = await input.inputValue();
    console.log(`Input ${i}: type=${type}, placeholder=${placeholder}, value=${value}`);
  }
  
  // 获取属性面板内容
  const propsPanel = await page.locator('.w-72.bg-bg-secondary').textContent();
  console.log('\n--- Properties Panel ---');
  console.log(propsPanel.substring(0, 500));
  
  await browser.close();
})();
