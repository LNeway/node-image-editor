const { chromium } = require('@playwright/test');

const COLORS = [
  { name: '纯红色', r: 255, g: 0, b: 0 },
  { name: '纯绿色', r: 0, g: 255, b: 0 },
  { name: '纯蓝色', r: 0, g: 0, b: 255 },
  { name: '纯白色', r: 255, g: 255, b: 255 },
  { name: '纯黑色', r: 0, g: 0, b: 0 },
  { name: '黄色', r: 255, g: 255, b: 0 },
  { name: '青色', r: 0, g: 255, b: 255 },
  { name: '洋红色', r: 255, g: 0, b: 255 },
  { name: '橙色', r: 255, g: 128, b: 0 },
  { name: '粉色', r: 255, g: 192, b: 203 },
  { name: '紫色', r: 128, g: 0, b: 128 },
  { name: '棕色', r: 139, g: 69, b: 19 },
  { name: '灰色', r: 128, g: 128, b: 128 },
  { name: '浅蓝', r: 173, g: 216, b: 230 },
  { name: 'lime', r: 0, g: 255, b: 0 },
];

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

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  await page.goto('http://localhost:4177', { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);
  
  // Click on solid color node in node library
  await page.click('button:has-text("纯色填充")');
  await page.waitForTimeout(2000);
  
  // Click on the added node on canvas to select it
  const nodeButtons = page.locator('button:has-text("纯色填充")');
  const count = await nodeButtons.count();
  console.log(`Found ${count} buttons with 纯色填充`);
  
  // Click the last one (the one on canvas)
  if (count > 1) {
    await nodeButtons.last().click();
    await page.waitForTimeout(1000);
  }
  
  // Now check for inputs
  const allInputs = await page.locator('input').all();
  console.log(`Found ${allInputs.length} total inputs on page`);
  
  const results = [];
  
  for (const color of COLORS) {
    try {
      // Try to find color input - look for any text input
      const inputs = page.locator('input');
      const inputCount = await inputs.count();
      console.log(`Testing ${color.name}: ${inputCount} inputs found`);
      
      // Try the first input (should be hex color)
      if (inputCount > 0) {
        const hex = '#' + 
          color.r.toString(16).padStart(2, '0') + 
          color.g.toString(16).padStart(2, '0') + 
          color.b.toString(16).padStart(2, '0');
        
        await inputs.first().fill(hex);
        await page.waitForTimeout(800);
      }
      
      const pixel = await sampleCenterPixel(page);
      
      if (!pixel) {
        results.push({ name: color.name, r: color.r, g: color.g, b: color.b, status: 'FAIL', pixel: {} });
        continue;
      }
      
      const passed = isColorMatch(pixel, { r: color.r, g: color.g, b: color.b });
      results.push({ 
        name: color.name,
        r: color.r, g: color.g, b: color.b,
        pixel,
        status: passed ? 'PASS' : 'FAIL',
      });
    } catch (e) {
      console.log(`Error for ${color.name}: ${e.message}`);
      results.push({ name: color.name, r: color.r, g: color.g, b: color.b, status: 'FAIL', pixel: {} });
    }
  }
  
  console.log('\n=== 15 COLOR TEST RESULTS ===');
  let passCount = 0;
  let failCount = 0;
  
  for (const r of results) {
    console.log(`[${r.status}] ${r.name}: Expected RGB(${r.r},${r.g},${r.b}), Got RGB(${r.pixel.r},${r.pixel.g},${r.pixel.b})`);
    if (r.status === 'PASS') passCount++;
    else failCount++;
  }
  
  console.log(`\nPassed: ${passCount}/15, Failed: ${failCount}/15`);
  
  await browser.close();
})();
