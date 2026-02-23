const { chromium } = require('playwright');

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  page.on('console', msg => {
    if (msg.type() === 'error') console.log('CONSOLE ERROR:', msg.text());
  });
  
  try {
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle', timeout: 60000 });
    await page.waitForTimeout(5000);
    
    const buttons = await page.locator('button').allTextContents();
    console.log('=== Buttons ===');
    buttons.forEach((btn, i) => console.log(`${i}: "${btn.trim()}"`));
    
  } catch (e) {
    console.log('Error:', e.message);
  }
  
  await browser.close();
}

main().catch(console.error);
