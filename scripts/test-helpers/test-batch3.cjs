const { chromium } = require('@playwright/test');

// 5个基础颜色测试
const TESTS = [
  { id: 'TEST-11', name: '纯红色', hex: '#ff0000', expected: { r: 255, g: 0, b: 0 }, tolerance: 10 },
  { id: 'TEST-12', name: '纯绿色', hex: '#00ff00', expected: { r: 0, g: 255, b: 0 }, tolerance: 10 },
  { id: 'TEST-13', name: '纯蓝色', hex: '#0000ff', expected: { r: 0, g: 0, b: 255 }, tolerance: 10 },
  { id: 'TEST-14', name: '纯白色', hex: '#ffffff', expected: { r: 255, g: 255, b: 255 }, tolerance: 10 },
  { id: 'TEST-15', name: '纯黑色', hex: '#000000', expected: { r: 0, g: 0, b: 0 }, tolerance: 10 },
];

function colorMatch(pixel, expected, tolerance) {
  return Math.abs(pixel.r - expected.r) <= tolerance &&
         Math.abs(pixel.g - expected.g) <= tolerance &&
         Math.abs(pixel.b - expected.b) <= tolerance;
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  await page.goto('http://localhost:4174', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(3000);
  
  console.log('\n========== 第3批测试: 颜色测试 (5个) ==========\n');
  
  // 添加节点并连接
  await page.click('button:has-text("纯色填充")');
  await page.waitForTimeout(800);
  await page.click('button:has-text("预览输出")');
  await page.waitForTimeout(800);
  
  // 连接节点
  const sourceHandle = page.locator('.react-flow__handle-right').first();
  const targetHandle = page.locator('.react-flow__handle-left').first();
  const sourceBox = await sourceHandle.boundingBox();
  const targetBox = await targetHandle.boundingBox();
  
  await page.mouse.move(sourceBox.x + 3, sourceBox.y + 3);
  await page.mouse.down();
  await page.mouse.move(targetBox.x + 3, targetBox.y + 3, { steps: 20 });
  await page.mouse.up();
  await page.waitForTimeout(2000);
  
  // 选择节点
  await page.evaluate(() => {
    document.querySelector('.react-flow__node-custom')?.click();
  });
  await page.waitForTimeout(1000);
  
  const results = [];
  
  for (const test of TESTS) {
    try {
      // 使用 JavaScript 注入设置颜色
      await page.evaluate((hex) => {
        const input = document.querySelector('.w-72.bg-bg-secondary input[type="color"]');
        if (input) {
          input.value = hex;
          input.dispatchEvent(new Event('input', { bubbles: true }));
          input.dispatchEvent(new Event('change', { bubbles: true }));
        }
      }, test.hex);
      
      await page.waitForTimeout(1500);
      
      // 重新选择节点触发更新
      await page.evaluate(() => {
        document.querySelector('.react-flow__node-custom')?.click();
      });
      await page.waitForTimeout(500);
      
      // 采样像素
      const pixel = await page.evaluate(() => {
        const canvas = document.querySelector('canvas');
        if (!canvas) return null;
        const ctx = canvas.getContext('2d');
        const data = ctx.getImageData(canvas.width / 2, canvas.height / 2, 1, 1).data;
        return { r: data[0], g: data[1], b: data[2] };
      });
      
      if (!pixel) {
        results.push({ ...test, result: 'FAIL', reason: 'No canvas' });
        continue;
      }
      
      const passed = colorMatch(pixel, test.expected, test.tolerance);
      results.push({ 
        ...test, 
        actual: pixel,
        result: passed ? 'PASS' : 'FAIL' 
      });
      
      const icon = passed ? '✅' : '❌';
      console.log(`[${test.id}] ${test.name}`);
      console.log(`  期望: RGB(${test.expected.r}, ${test.expected.g}, ${test.expected.b})`);
      console.log(`  实际: RGB(${pixel.r}, ${pixel.g}, ${pixel.b})`);
      console.log(`  结果: ${passed ? 'PASS' : 'FAIL'} ${icon}\n`);
      
    } catch (e) {
      results.push({ ...test, result: 'FAIL', reason: e.message });
    }
  }
  
  const passCount = results.filter(r => r.result === 'PASS').length;
  console.log('============================================');
  console.log(`第3批测试结果: PASS ${passCount}/5, FAIL ${5 - passCount}/5`);
  console.log('============================================');
  
  await browser.close();
})();
