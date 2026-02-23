const { chromium } = require('playwright');

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('LOG:', msg.text()));
  page.on('pageerror', error => console.log('ERROR:', error.message));
  
  try {
    await page.goto('http://localhost:3000', { timeout: 60000 });
    
    // 等待至少有一些内容加载
    await page.waitForFunction(() => document.body.innerText.length > 0, { timeout: 30000 });
    console.log('Page has content');
    
    await page.waitForTimeout(3000);
    
    // 打印所有可见文本
    const text = await page.evaluate(() => document.body.innerText);
    console.log('Page text:', text.substring(0, 2000));
    
  } catch (e) {
    console.log('Error:', e.message);
  }
  
  await browser.close();
}

main().catch(console.error);
