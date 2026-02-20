import { test, expect } from '@playwright/test';

test('debug page load with network requests', async ({ page }) => {
  const errors: string[] = [];
  
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });
  
  page.on('pageerror', err => {
    errors.push(`Page error: ${err.message}`);
  });

  // Navigate and wait for network to be idle
  await page.goto('http://localhost:4173', { waitUntil: 'networkidle' });
  
  // Wait a bit more for React to render
  await page.waitForTimeout(2000);
  
  // Check if #root has content
  const rootContent = await page.evaluate(() => {
    const root = document.getElementById('root');
    return {
      innerHTML: root?.innerHTML || 'empty',
      childCount: root?.children.length || 0
    };
  });
  
  console.log('Root content:', JSON.stringify(rootContent));
  
  // Check all network requests
  const requests = await page.evaluate(() => {
    // @ts-ignore
    return window.performance.getEntriesByType('resource').map(r => ({
      name: r.name,
      type: r.type,
      status: 'duration' in r ? 'loaded' : 'pending'
    }));
  });
  
  console.log('Network requests:', JSON.stringify(requests, null, 2));
  
  // Print errors
  if (errors.length > 0) {
    console.log('Errors:', errors);
  }
  
  // Take screenshot
  await page.screenshot({ path: '/tmp/debug2.png', fullPage: true });
});
