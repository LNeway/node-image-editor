const { chromium } = require('playwright');

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(3000);
  
  // 打印页面中所有的按钮文本
  const buttons = await page.locator('button').allTextContents();
  console.log('=== Buttons ===');
  buttons.forEach((btn, i) => console.log(`${i}: "${btn}"`));
  
  // 打印所有包含"纯色"的文本
  const solidColorElements = await page.getByText(/纯色/).all();
  console.log('\n=== Elements with 纯色 ===');
  for (const el of solidColorElements) {
    const tag = await el.evaluate(e => e.tagName);
    const className = await el.evaluate(e => e.className);
    console.log(`Tag: ${tag}, Class: ${className}`);
  }
  
  await browser.close();
}

main().catch(console.error);
