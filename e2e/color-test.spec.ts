import { test, expect, chromium } from '@playwright/test';

const COLORS = [
  { name: '纯红色', hex: '#ff0000', r: 255, g: 0, b: 0, criteria: 'R>245,G<10,B<10' },
  { name: '纯绿色', hex: '#00ff00', r: 0, g: 255, b: 0, criteria: 'R<10,G>245,B<10' },
  { name: '纯蓝色', hex: '#0000ff', r: 0, g: 0, b: 255, criteria: 'R<10,G<10,B>245' },
  { name: '纯白色', hex: '#ffffff', r: 255, g: 255, b: 255, criteria: 'R>245,G>245,B>245' },
  { name: '纯黑色', hex: '#000000', r: 0, g: 0, b: 0, criteria: 'R<10,G<10,B<10' },
  { name: '黄色', hex: '#ffff00', r: 255, g: 255, b: 0, criteria: 'R>245,G>245,B<10' },
  { name: '青色', hex: '#00ffff', r: 0, g: 255, b: 255, criteria: 'R<10,G>245,B>245' },
  { name: '洋红色', hex: '#ff00ff', r: 255, g: 0, b: 255, criteria: 'R>245,G<10,B>245' },
  { name: '橙色', hex: '#ff8000', r: 255, g: 128, b: 0, criteria: 'R>245,G>118,B<10' },
  { name: '粉色', hex: '#ffc0cb', r: 255, g: 192, b: 203, criteria: 'R>245,G>182,B>193' },
  { name: '紫色', hex: '#800080', r: 128, g: 0, b: 128, criteria: 'R>118,G<10,B>118' },
  { name: '棕色', hex: '#8b4513', r: 139, g: 69, b: 19, criteria: 'R>129,G>59,B<29' },
  { name: '灰色50%', hex: '#808080', r: 128, g: 128, b: 128, criteria: 'R>118,G>118,B>118' },
  { name: '浅蓝色', hex: '#add8e6', r: 173, g: 216, b: 230, criteria: 'R>163,G>206,B>220' },
  { name: 'lime', hex: '#00ff00', r: 0, g: 255, b: 0, criteria: 'R<10,G>245,B<10' },
];

// Run only on chromium
test.use({ browserName: 'chromium' });

async function sampleCenterPixel(page) {
  return await page.evaluate(() => {
    const canvas = document.querySelector('canvas');
    if (!canvas) return null;
    const ctx = canvas.getContext('2d');
    const data = ctx.getImageData(canvas.width / 2, canvas.height / 2, 1, 1).data;
    return { r: data[0], g: data[1], b: data[2], a: data[3] };
  });
}

function isColorMatch(pixel, expected, tolerance = 10) {
  return Math.abs(pixel.r - expected.r) <= tolerance &&
         Math.abs(pixel.g - expected.g) <= tolerance &&
         Math.abs(pixel.b - expected.b) <= tolerance;
}

test('15 color preview tests', async ({ page }) => {
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);
  
  // Click on solid color node in the node library to add it
  await page.click('button:has-text("纯色填充")');
  await page.waitForTimeout(1000);
  
  const results = [];
  
  for (const color of COLORS) {
    // Find color input - look for textbox that contains hex color
    // The color input should be in the properties panel
    const colorInput = page.locator('div:has-text("颜色") input').first();
    
    try {
      await colorInput.fill(color.hex);
    } catch (e) {
      // Try alternative selector
      await page.locator('input[type="text"]').first().fill(color.hex);
    }
    
    await page.waitForTimeout(800);
    
    // Sample pixel
    const pixel = await sampleCenterPixel(page);
    
    if (!pixel) {
      results.push({ ...color, status: 'FAIL', reason: 'No canvas found', pixel: {} });
      continue;
    }
    
    const passed = isColorMatch(pixel, { r: color.r, g: color.g, b: color.b });
    results.push({ 
      ...color, 
      pixel,
      status: passed ? 'PASS' : 'FAIL',
      reason: passed ? '' : `Expected RGB(${color.r},${color.g},${color.b}), got RGB(${pixel.r},${pixel.g},${pixel.b})`
    });
  }
  
  // Print results
  console.log('\n=== TEST RESULTS ===');
  let passCount = 0;
  let failCount = 0;
  
  for (const r of results) {
    console.log(`[${r.status}] ${r.name}: Expected RGB(${r.r},${r.g},${r.b}), Got RGB(${r.pixel?.r},${r.pixel?.g},${r.pixel?.b})`);
    if (r.status === 'PASS') passCount++;
    else failCount++;
  }
  
  console.log(`\nPassed: ${passCount}/15, Failed: ${failCount}/15`);
  
  // Assert all pass
  expect(failCount).toBe(0);
});
