const { chromium } = require('@playwright/test');

// 输入节点测试
const TESTS = [
  // 纯色填充节点测试
  { id: 'INPUT-01', name: '添加纯色填充节点', category: 'input' },
  { id: 'INPUT-02', name: '添加预览输出节点', category: 'output' },
  { id: 'INPUT-03', name: '连接纯色到预览', category: 'connection' },
  { id: 'INPUT-04', name: '默认尺寸1920x1080', category: 'size' },
  { id: 'INPUT-05', name: '修改宽度为800', category: 'size', param: { width: 800 } },
  { id: 'INPUT-06', name: '修改高度为600', category: 'size', param: { height: 600 } },
  { id: 'INPUT-07', name: '设置颜色-红色', category: 'color', hex: '#ff0000', expected: { r: 255, g: 0, b: 0 } },
  { id: 'INPUT-08', name: '设置颜色-绿色', category: 'color', hex: '#00ff00', expected: { r: 0, g: 255, b: 0 } },
  { id: 'INPUT-09', name: '设置颜色-蓝色', category: 'color', hex: '#0000ff', expected: { r: 0, g: 0, b: 255 } },
  { id: 'INPUT-10', name: '设置颜色-白色', category: 'color', hex: '#ffffff', expected: { r: 255, g: 255, b: 255 } },
  { id: 'INPUT-11', name: '设置颜色-黑色', category: 'color', hex: '#000000', expected: { r: 0, g: 0, b: 0 } },
];

function colorMatch(pixel, expected, tolerance = 10) {
  return Math.abs(pixel.r - expected.r) <= tolerance &&
         Math.abs(pixel.g - expected.g) <= tolerance &&
         Math.abs(pixel.b - expected.b) <= tolerance;
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  await page.goto('http://localhost:4174', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(3000);
  
  console.log('\n========== 输入节点测试 ==========\n');
  
  const results = [];
  
  // INPUT-01: 添加纯色填充节点
  console.log('[INPUT-01] 添加纯色填充节点');
  await page.click('button:has-text("纯色填充")');
  await page.waitForTimeout(500);
  const nodes1 = await page.locator('.react-flow__node-custom').count();
  results.push({ id: 'INPUT-01', name: '添加纯色填充节点', result: nodes1 >= 1 ? 'PASS' : 'FAIL' });
  console.log(`  结果: ${results[results.length-1].result} ✅/❌\n`);
  
  // INPUT-02: 添加预览输出节点
  console.log('[INPUT-02] 添加预览输出节点');
  await page.click('button:has-text("预览输出")');
  await page.waitForTimeout(500);
  const nodes2 = await page.locator('.react-flow__node-custom').count();
  results.push({ id: 'INPUT-02', name: '添加预览输出节点', result: nodes2 >= 2 ? 'PASS' : 'FAIL' });
  console.log(`  结果: ${results[results.length-1].result} ✅/❌\n`);
  
  // INPUT-03: 连接纯色到预览
  console.log('[INPUT-03] 连接纯色到预览');
  const rightHandle = page.locator('.react-flow__handle-right').first();
  const leftHandle = page.locator('.react-flow__handle-left').first();
  const srcBox = await rightHandle.boundingBox();
  const tgtBox = await leftHandle.boundingBox();
  await page.mouse.move(srcBox.x + 3, srcBox.y + 3);
  await page.mouse.down();
  await page.mouse.move(tgtBox.x + 3, tgtBox.y + 3, { steps: 15 });
  await page.mouse.up();
  await page.waitForTimeout(1500);
  const edges = await page.locator('.react-flow__edge').count();
  results.push({ id: 'INPUT-03', name: '连接纯色到预览', result: edges >= 1 ? 'PASS' : 'FAIL' });
  console.log(`  结果: ${results[results.length-1].result} ✅/❌\n`);
  
  // 关闭预览面板
  const closeBtn = page.locator('.fixed.z-50 button').first();
  if (await closeBtn.isVisible()) {
    await closeBtn.click();
    await page.waitForTimeout(500);
  }
  
  // 选择纯色填充节点
  await page.locator('.react-flow__node-custom').first().click({ force: true });
  await page.waitForTimeout(1000);
  
  // INPUT-04: 默认尺寸
  console.log('[INPUT-04] 默认尺寸1920x1080');
  const defaultSize = await page.evaluate(() => {
    const canvas = document.querySelector('canvas');
    return canvas ? { w: canvas.width, h: canvas.height } : null;
  });
  results.push({ id: 'INPUT-04', name: '默认尺寸1920x1080', 
    result: defaultSize && defaultSize.w === 1920 && defaultSize.h === 1080 ? 'PASS' : 'FAIL',
    actual: defaultSize ? `${defaultSize.w}x${defaultSize.h}` : 'N/A' });
  console.log(`  期望: 1920x1080, 实际: ${defaultSize?.w}x${defaultSize?.h}, 结果: ${results[results.length-1].result}\n`);
  
  // INPUT-05: 修改宽度
  console.log('[INPUT-05] 修改宽度为800');
  const widthInputs = await page.locator('.w-72.bg-bg-secondary input[type="number"]').all();
  if (widthInputs.length > 0) {
    await widthInputs[0].fill('800');
    await page.waitForTimeout(1000);
    // 恢复预览查看
    await page.locator('.fixed.z-50 button').first().click();
    await page.waitForTimeout(1000);
    const newSize1 = await page.evaluate(() => {
      const canvas = document.querySelector('canvas');
      return canvas ? { w: canvas.width, h: canvas.height } : null;
    });
    results.push({ id: 'INPUT-05', name: '修改宽度为800', 
      result: newSize1 && newSize1.w === 800 ? 'PASS' : 'FAIL',
      actual: newSize1 ? `${newSize1.w}x${newSize1.h}` : 'N/A' });
    console.log(`  期望: 800, 实际: ${newSize1?.w}, 结果: ${results[results.length-1].result}\n`);
    await page.locator('.fixed.z-50 button').first().click();
    await page.waitForTimeout(500);
  } else {
    results.push({ id: 'INPUT-05', name: '修改宽度为800', result: 'FAIL', reason: 'No input found' });
  }
  
  // INPUT-06: 修改高度
  console.log('[INPUT-06] 修改高度为600');
  const heightInputs = await page.locator('.w-72.bg-bg-secondary input[type="number"]').all();
  if (heightInputs.length > 1) {
    await heightInputs[1].fill('600');
    await page.waitForTimeout(1000);
    await page.locator('.fixed.z-50 button').first().click();
    await page.waitForTimeout(1000);
    const newSize2 = await page.evaluate(() => {
      const canvas = document.querySelector('canvas');
      return canvas ? { w: canvas.width, h: canvas.height } : null;
    });
    results.push({ id: 'INPUT-06', name: '修改高度为600', 
      result: newSize2 && newSize2.h === 600 ? 'PASS' : 'FAIL',
      actual: newSize2 ? `${newSize2.w}x${newSize2.h}` : 'N/A' });
    console.log(`  期望: 600, 实际: ${newSize2?.h}, 结果: ${results[results.length-1].result}\n`);
  } else {
    results.push({ id: 'INPUT-06', name: '修改高度为600', result: 'FAIL', reason: 'No input found' });
  }
  
  // 颜色测试
  const colorTests = [
    { id: 'INPUT-07', name: '设置颜色-红色', hex: '#ff0000', expected: { r: 255, g: 0, b: 0 } },
    { id: 'INPUT-08', name: '设置颜色-绿色', hex: '#00ff00', expected: { r: 0, g: 255, b: 0 } },
    { id: 'INPUT-09', name: '设置颜色-蓝色', hex: '#0000ff', expected: { r: 0, g: 0, b: 255 } },
    { id: 'INPUT-10', name: '设置颜色-白色', hex: '#ffffff', expected: { r: 255, g: 255, b: 255 } },
    { id: 'INPUT-11', name: '设置颜色-黑色', hex: '#000000', expected: { r: 0, g: 0, b: 0 } },
  ];
  
  for (const test of colorTests) {
    console.log(`[${test.id}] ${test.name}`);
    
    await page.evaluate((hex) => {
      const input = document.querySelector('.w-72.bg-bg-secondary input[type="color"]');
      if (input) {
        input.value = hex;
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
      }
    }, test.hex);
    
    await page.waitForTimeout(1000);
    await page.locator('.fixed.z-50 button').first().click();
    await page.waitForTimeout(1000);
    
    const pixel = await page.evaluate(() => {
      const canvas = document.querySelector('canvas');
      if (!canvas) return null;
      const ctx = canvas.getContext('2d');
      const data = ctx.getImageData(canvas.width / 2, canvas.height / 2, 1, 1).data;
      return { r: data[0], g: data[1], b: data[2] };
    });
    
    const passed = pixel && colorMatch(pixel, test.expected);
    results.push({
      id: test.id,
      name: test.name,
      result: passed ? 'PASS' : 'FAIL',
      expected: `(${test.expected.r},${test.expected.g},${test.expected.b})`,
      actual: pixel ? `(${pixel.r},${pixel.g},${pixel.b})` : 'N/A'
    });
    console.log(`  期望: (${test.expected.r},${test.expected.g},${test.expected.b}), 实际: (${pixel?.r},${pixel?.g},${pixel?.b}), 结果: ${passed ? '✅' : '❌'}\n`);
    
    await page.locator('.fixed.z-50 button').first().click();
    await page.waitForTimeout(500);
  }
  
  // 统计
  const passCount = results.filter(r => r.result === 'PASS').length;
  console.log('============================================');
  console.log(`输入节点测试结果: PASS ${passCount}/${results.length}, FAIL ${results.length - passCount}/${results.length}`);
  console.log('============================================');
  
  // 输出结果
  console.log('\n详细结果:');
  results.forEach(r => {
    console.log(`  [${r.id}] ${r.name}: ${r.result}`);
  });
  
  await browser.close();
})();
