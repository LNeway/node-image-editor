const { chromium } = require('playwright');

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
  
  try {
    await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded', timeout: 30000 });
    console.log('Page loaded');
    
    // 等待 React 应用渲染
    await page.waitForSelector('#root', { timeout: 10000 });
    console.log('Root element found');
    
    await page.waitForTimeout(5000);
    
    // 获取 body 的内容
    const bodyHTML = await page.evaluate(() => document.body.innerHTML.substring(0, 2000));
    console.log('Body HTML:', bodyHTML);
    
    // 检查是否有任何可见的元素
    const bodyChildren = await page.evaluate(() => document.body.querySelectorAll('*').length);
    console.log('Body children count:', bodyChildren);
    
  } catch (e) {
    console.log('Error:', e.message);
  }
  
  await browser.close();
}

main().catch(console.error);
