const { chromium } = require('playwright');

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(5000);
  
  // 打印页面中所有的按钮文本
  const buttons = await page.locator('button').allTextContents();
  console.log('=== Buttons ===');
  buttons.forEach((btn, i) => console.log(`${i}: "${btn}"`));
  
  await browser.close();
}

main().catch(console.error);
