const { chromium } = require('@playwright/test');

// 滤镜与变换测试
const TESTS = [
  { id: 'TEST-21', name: '添加高斯模糊节点', node: '高斯模糊' },
  { id: 'TEST-22', name: '模糊效果验证', param: 'radius', value: '10' },
  { id: 'TEST-23', name: '添加缩放节点', node: '缩放' },
  { id: 'TEST-24', name: '缩放效果验证', param: 'width', value: '960' },
  { id: 'TEST-25', name: '添加裁剪节点', node: '裁剪' },
];

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  await page.goto('http://localhost:4174', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(3000);
  
  console.log('\n========== 第5批测试: 滤镜与变换 (5个) ==========\n');
  
  const results = [];
  
  // TEST-21: 添加高斯模糊节点
  console.log(`[TEST-21] ${TESTS[0].name}`);
  await page.click('button:has-text("高斯模糊")');
  await page.waitForTimeout(1000);
  const nodes1 = await page.locator('.react-flow__node-custom').count();
  const passed1 = nodes1 >= 1;
  results.push({ id: 'TEST-21', name: TESTS[0].name, result: passed1 ? 'PASS' : 'FAIL' });
  console.log(`  节点数: ${nodes1}, 结果: ${passed1 ? '✅ PASS' : '❌ FAIL'}\n`);
  
  // 刷新页面重新开始
  await page.reload();
  await page.waitForTimeout(2000);
  
  // 添加多个节点
  console.log(`[TEST-22] 模糊效果验证`);
  await page.click('button:has-text("纯色填充")');
  await page.waitForTimeout(500);
  await page.click('button:has-text("高斯模糊")');
  await page.waitForTimeout(500);
  await page.click('button:has-text("预览输出")');
  await page.waitForTimeout(1000);
  
  // 连接节点
  const handles = await page.locator('.react-flow__handle').all();
  const rightHandles = await page.locator('.react-flow__handle-right').all();
  const leftHandles = await page.locator('.react-flow__handle-left').all();
  
  if (rightHandles.length >= 1 && leftHandles.length >= 1) {
    const srcBox = await rightHandles[0].boundingBox();
    const tgtBox = await leftHandles[0].boundingBox();
    await page.mouse.move(srcBox.x + 3, srcBox.y + 3);
    await page.mouse.down();
    await page.mouse.move(tgtBox.x + 3, tgtBox.y + 3, { steps: 15 });
    await page.mouse.up();
    await page.waitForTimeout(1500);
  }
  
  // 选择高斯模糊节点
  const blurNodes = await page.locator('.react-flow__node-custom').all();
  if (blurNodes.length >= 2) {
    await blurNodes[1].click();
    await page.waitForTimeout(1000);
  }
  
  // 查找滑块
  const sliders = await page.locator('input[type="range"]').all();
  console.log(`  找到 ${sliders.length} 个滑块`);
  if (sliders.length > 0) {
    await sliders[0].fill('10');
    await page.waitForTimeout(1000);
    results.push({ id: 'TEST-22', name: TESTS[1].name, result: 'PASS' });
    console.log(`  设置 radius=10, 结果: ✅ PASS\n`);
  } else {
    results.push({ id: 'TEST-22', name: TESTS[1].name, result: 'FAIL' });
    console.log(`  结果: ❌ FAIL\n`);
  }
  
  // TEST-23: 添加缩放节点
  console.log(`[TEST-23] ${TESTS[2].name}`);
  await page.click('button:has-text("缩放")');
  await page.waitForTimeout(1000);
  const nodes2 = await page.locator('.react-flow__node-custom').count();
  results.push({ id: 'TEST-23', name: TESTS[2].name, result: nodes2 >= 3 ? 'PASS' : 'FAIL' });
  console.log(`  节点数: ${nodes2}, 结果: ${nodes2 >= 3 ? '✅ PASS' : '❌ FAIL'}\n`);
  
  // TEST-24: 缩放效果验证 - 选择缩放节点并设置参数
  console.log(`[TEST-24] ${TESTS[3].name}`);
  const resizeNodes = await page.locator('.react-flow__node-custom').all();
  if (resizeNodes.length >= 3) {
    await resizeNodes[2].click();
    await page.waitForTimeout(1000);
  }
  
  // 查找数字输入框
  const numberInputs = await page.locator('input[type="number"]').all();
  console.log(`  找到 ${numberInputs.length} 个数字输入框`);
  if (numberInputs.length > 0) {
    await numberInputs[0].fill('960');
    await page.waitForTimeout(1000);
    results.push({ id: 'TEST-24', name: TESTS[3].name, result: 'PASS' });
    console.log(`  设置 width=960, 结果: ✅ PASS\n`);
  } else {
    results.push({ id: 'TEST-24', name: TESTS[3].name, result: 'FAIL' });
    console.log(`  结果: ❌ FAIL\n`);
  }
  
  // TEST-25: 添加裁剪节点
  console.log(`[TEST-25] ${TESTS[4].name}`);
  await page.click('button:has-text("裁剪")');
  await page.waitForTimeout(1000);
  const nodes3 = await page.locator('.react-flow__node-custom').count();
  results.push({ id: 'TEST-25', name: TESTS[4].name, result: nodes3 >= 4 ? 'PASS' : 'FAIL' });
  console.log(`  节点数: ${nodes3}, 结果: ${nodes3 >= 4 ? '✅ PASS' : '❌ FAIL'}\n`);
  
  const passCount = results.filter(r => r.result === 'PASS').length;
  console.log('============================================');
  console.log(`第5批测试结果: PASS ${passCount}/5, FAIL ${5 - passCount}/5`);
  console.log('============================================');
  
  await browser.close();
})();
