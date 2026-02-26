const { chromium } = require('playwright');

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  await page.goto('http://localhost:4173', { timeout: 60000 });
  await page.waitForTimeout(5000);
  
  const buttons = await page.locator('button').allTextContents();
  console.log('=== Buttons ===');
  buttons.forEach((btn, i) => console.log(`${i}: "${btn.trim()}"`));
  
  await browser.close();
}

main().catch(console.error);
