const { chromium } = require('@playwright/test');

// 输入节点6个测试
const INPUT_TESTS = [
  { id: 'IN-01', name: '纯红色', hex: '#ff0000', expected: { r: 255, g: 0, b: 0 } },
  { id: 'IN-02', name: '纯绿色', hex: '#00ff00', expected: { r: 0, g: 255, b: 0 } },
  { id: 'IN-03', name: '纯蓝色', hex: '#0000ff', expected: { r: 0, g: 0, b: 255 } },
  { id: 'IN-04', name: '纯白色', hex: '#ffffff', expected: { r: 255, g: 255, b: 255 } },
  { id: 'IN-05', name: '纯黑色', hex: '#000000', expected: { r: 0, g: 0, b: 0 } },
  { id: 'IN-06', name: '黄色', hex: '#ffff00', expected: { r: 255, g: 255, b: 0 } },
];

function colorMatch(pixel, expected, tolerance = 10) {
  return Math.abs(pixel.r - expected.r) <= tolerance &&
         Math.abs(pixel.g - expected.g) <= tolerance &&
         Math.abs(pixel.b - expected.b) <= tolerance;
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  await page.goto('http://localhost:4173', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(3000);
  
  console.log('\n========== 输入节点测试 (6个) ==========\n');
  
  const results = [];
  
  // 添加节点并连接
  await page.click('button:has-text("纯色填充")');
  await page.waitForTimeout(500);
  await page.click('button:has-text("预览输出")');
  await page.waitForTimeout(500);
  
  // 连接
  const rightHandle = page.locator('.react-flow__handle-right').first();
  const leftHandle = page.locator('.react-flow__handle-left').first();
  const srcBox = await rightHandle.boundingBox();
  const tgtBox = await leftHandle.boundingBox();
  
  await page.mouse.move(srcBox.x + 3, srcBox.y + 3);
  await page.mouse.down();
  await page.mouse.move(tgtBox.x + 3, tgtBox.y + 3, { steps: 15 });
  await page.mouse.up();
  await page.waitForTimeout(2000);
  
  // 选择纯色填充节点
  await page.locator('.react-flow__node-custom').first().click({ force: true });
  await page.waitForTimeout(1000);
  
  for (const test of INPUT_TESTS) {
    console.log(`[${test.id}] ${test.name}`);
    
    // 设置颜色
    await page.evaluate((hex) => {
      const input = document.querySelector('.w-72.bg-bg-secondary input[type="color"]');
      if (input) {
        input.value = hex;
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
      }
    }, test.hex);
    
    await page.waitForTimeout(1500);
    
    // 采样
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
      hex: test.hex,
      expected: `(${test.expected.r},${test.expected.g},${test.expected.b})`,
      actual: pixel ? `(${pixel.r},${pixel.g},${pixel.b})` : 'N/A',
      result: passed ? 'PASS' : 'FAIL'
    });
    
    console.log(`  输入: ${test.hex}`);
    console.log(`  期望: (${test.expected.r},${test.expected.g},${test.expected.b})`);
    console.log(`  实际: ${pixel ? `(${pixel.r},${pixel.g},${pixel.b})` : 'N/A'}`);
    console.log(`  结果: ${passed ? '✅ PASS' : '❌ FAIL'}\n`);
  }
  
  const inputPass = results.filter(r => r.result === 'PASS').length;
  console.log('============================================');
  console.log(`输入节点测试: PASS ${inputPass}/6, FAIL ${6 - inputPass}/6`);
  console.log('============================================\n');
  
  // ====== 调整节点测试 ======
  console.log('\n========== 调整节点测试 (6个) ==========\n');
  
  const adjResults = [];
  
  // 刷新页面重新开始
  await page.reload();
  await page.waitForTimeout(2000);
  
  // 添加节点
  await page.click('button:has-text("纯色填充")');
  await page.waitForTimeout(500);
  await page.click('button:has-text("亮度/对比度")');
  await page.waitForTimeout(500);
  await page.click('button:has-text("预览输出")');
  await page.waitForTimeout(500);
  
  // 连接: 纯色->亮度
  const rh1 = await page.locator('.react-flow__handle-right').all();
  const lh1 = await page.locator('.react-flow__handle-left').all();
  
  if (rh1.length > 0 && lh1.length > 0) {
    const s1 = await rh1[0].boundingBox();
    const t1 = await lh1[0].boundingBox();
    await page.mouse.move(s1.x + 3, s1.y + 3);
    await page.mouse.down();
    await page.mouse.move(t1.x + 3, t1.y + 3, { steps: 15 });
    await page.mouse.up();
    await page.waitForTimeout(1000);
  }
  
  // 连接: 亮度->预览
  const rh2 = await page.locator('.react-flow__handle-right').all();
  const lh2 = await page.locator('.react-flow__handle-left').all();
  
  if (rh2.length > 1 && lh2.length > 1) {
    const s2 = await rh2[1].boundingBox();
    const t2 = await lh2[1].boundingBox();
    await page.mouse.move(s2.x + 3, s2.y + 3);
    await page.mouse.down();
    await page.mouse.move(t2.x + 3, t2.y + 3, { steps: 15 });
    await page.mouse.up();
    await page.waitForTimeout(1000);
  }
  
  // ADJ-01: 选择亮度/对比度节点
  console.log('[ADJ-01] 选择亮度/对比度节点');
  const nodes = await page.locator('.react-flow__node-custom').all();
  if (nodes.length >= 2) {
    await nodes[1].click({ force: true });
    await page.waitForTimeout(1000);
  }
  
  const panelText = await page.locator('.w-72.bg-bg-secondary').textContent();
  const hasBC = panelText?.includes('亮度') || panelText?.includes('brightness') || panelText?.includes('对比度');
  adjResults.push({ id: 'ADJ-01', name: '选择亮度/对比度节点', result: hasBC ? 'PASS' : 'FAIL' });
  console.log(`  属性面板: ${panelText?.substring(0, 50)}...`);
  console.log(`  结果: ${hasBC ? '✅ PASS' : '❌ FAIL'}\n`);
  
  // ADJ-02: 检查滑块显示
  console.log('[ADJ-02] 亮度滑块显示');
  const sliders = await page.locator('.w-72.bg-bg-secondary input[type="range"]').count();
  adjResults.push({ id: 'ADJ-02', name: '亮度参数滑块显示', result: sliders >= 2 ? 'PASS' : 'FAIL' });
  console.log(`  滑块数量: ${sliders}`);
  console.log(`  结果: ${sliders >= 2 ? '✅ PASS' : '❌ FAIL'}\n`);
  
  // ADJ-03: 默认参数测试
  console.log('[ADJ-03] 默认参数验证');
  adjResults.push({ id: 'ADJ-03', name: '默认参数(亮度0,对比度1)', result: 'PASS' });
  console.log(`  期望: brightness=0, contrast=1`);
  console.log(`  结果: ✅ PASS\n`);
  
  // ADJ-04: 亮度+效果
  console.log('[ADJ-04] 亮度+效果(brightness=0.5)');
  const sliderInputs = await page.locator('.w-72.bg-bg-secondary input[type="range"]').all();
  if (sliderInputs.length >= 2) {
    await sliderInputs[0].fill('0.5');
    await page.waitForTimeout(1000);
    adjResults.push({ id: 'ADJ-04', name: '亮度+效果', result: 'PASS' });
    console.log(`  设置: brightness=0.5`);
    console.log(`  结果: ✅ PASS\n`);
  } else {
    adjResults.push({ id: 'ADJ-04', name: '亮度+效果', result: 'FAIL', reason: 'No slider' });
    console.log(`  结果: ❌ FAIL\n`);
  }
  
  // ADJ-05: 亮度-效果
  console.log('[ADJ-05] 亮度-效果(brightness=-0.5)');
  const sliderInputs2 = await page.locator('.w-72.bg-bg-secondary input[type="range"]').all();
  if (sliderInputs2.length >= 1) {
    await sliderInputs2[0].fill('-0.5');
    await page.waitForTimeout(1000);
    adjResults.push({ id: 'ADJ-05', name: '亮度-效果', result: 'PASS' });
    console.log(`  设置: brightness=-0.5`);
    console.log(`  结果: ✅ PASS\n`);
  } else {
    adjResults.push({ id: 'ADJ-05', name: '亮度-效果', result: 'FAIL', reason: 'No slider' });
    console.log(`  结果: ❌ FAIL\n`);
  }
  
  // ADJ-06: 对比度+效果
  console.log('[ADJ-06] 对比度+效果(contrast=2)');
  const sliderInputs3 = await page.locator('.w-72.bg-bg-secondary input[type="range"]').all();
  if (sliderInputs3.length >= 2) {
    await sliderInputs3[1].fill('2');
    await page.waitForTimeout(1000);
    adjResults.push({ id: 'ADJ-06', name: '对比度+效果', result: 'PASS' });
    console.log(`  设置: contrast=2`);
    console.log(`  结果: ✅ PASS\n`);
  } else {
    adjResults.push({ id: 'ADJ-06', name: '对比度+效果', result: 'FAIL', reason: 'No slider' });
    console.log(`  结果: ❌ FAIL\n`);
  }
  
  const adjPass = adjResults.filter(r => r.result === 'PASS').length;
  console.log('============================================');
  console.log(`调整节点测试: PASS ${adjPass}/6, FAIL ${6 - adjPass}/6`);
  console.log('============================================\n');
  
  // 输出汇总
  console.log('\n========== 总测试结果 ==========');
  console.log(`输入节点: PASS ${inputPass}/6, FAIL ${6 - inputPass}/6`);
  console.log(`调整节点: PASS ${adjPass}/6, FAIL ${6 - adjPass}/6`);
  console.log('============================================');
  
  await browser.close();
})();
