import { chromium } from '@playwright/test';

async function testDemo() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  // Set viewport
  await page.setViewportSize({ width: 1400, height: 900 });
  
  // Navigate to demo page
  console.log('Opening demo page...');
  await page.goto('http://localhost:3000/templates/demo-project/index.html');
  
  // Wait for page to load
  await page.waitForLoadState('networkidle');
  
  // Take screenshot
  console.log('Taking screenshot...');
  await page.screenshot({ 
    path: '/Users/liuwei11/github/node/tests/demo-screenshot.png',
    fullPage: true 
  });
  
  // Check WebGL status
  const webglStatus = await page.locator('#webglStatus').getAttribute('class');
  console.log('WebGL Status:', webglStatus);
  
  // Check for errors in console
  const errors: string[] = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });
  
  // Wait a bit for any console errors
  await page.waitForTimeout(2000);
  
  if (errors.length > 0) {
    console.log('Console errors:', errors);
  } else {
    console.log('No console errors detected');
  }
  
  await browser.close();
  console.log('Done! Screenshot saved to tests/demo-screenshot.png');
}

testDemo().catch(console.error);
