const { chromium } = require('@playwright/test');

// 调整节点测试
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  await page.goto('http://localhost:4174', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(3000);
  
  console.log('\n========== 调整节点测试 ==========\n');
  
  const results = [];
  
  // 添加基础节点
  console.log('[ADJ-01] 添加纯色填充节点');
  await page.click('button:has-text("纯色填充")');
  await page.waitForTimeout(500);
  
  console.log('[ADJ-02] 添加亮度/对比度节点');
  await page.click('button:has-text("亮度/对比度")');
  await page.waitForTimeout(500);
  
  console.log('[ADJ-03] 添加预览输出节点');
  await page.click('button:has-text("预览输出")');
  await page.waitForTimeout(500);
  
  // 连接节点 - 使用 mouse 直接拖拽
  console.log('[ADJ-04] 连接节点链');
  
  // 关闭预览以避免遮挡
  const previewClose = page.locator('.fixed button').first();
  if (await previewClose.isVisible()) {
    await previewClose.click();
    await page.waitForTimeout(500);
  }
  
  const rightHandles = await page.locator('.react-flow__handle-right').all();
  const leftHandles = await page.locator('.react-flow__handle-left').all();
  
  // 连接1: 纯色 -> 亮度
  if (rightHandles.length > 0 && leftHandles.length > 0) {
    const src1 = await rightHandles[0].boundingBox();
    const tgt1 = await leftHandles[0].boundingBox();
    await page.mouse.move(src1.x + 3, src1.y + 3);
    await page.mouse.down();
    await page.mouse.move(tgt1.x + 3, tgt1.y + 3, { steps: 20 });
    await page.mouse.up();
    await page.waitForTimeout(800);
  }
  
  // 连接2: 亮度 -> 预览
  const rightHandles2 = await page.locator('.react-flow__handle-right').all();
  const leftHandles2 = await page.locator('.react-flow__handle-left').all();
  
  if (rightHandles2.length > 1 && leftHandles2.length > 1) {
    const src2 = await rightHandles2[1].boundingBox();
    const tgt2 = await leftHandles2[1].boundingBox();
    await page.mouse.move(src2.x + 3, src2.y + 3);
    await page.mouse.down();
    await page.mouse.move(tgt2.x + 3, tgt2.y + 3, { steps: 20 });
    await page.mouse.up();
    await page.waitForTimeout(800);
  }
  
  const edges = await page.locator('.react-flow__edge').count();
  results.push({ id: 'ADJ-04', name: '连接节点链(纯色→亮度→预览)', result: edges >= 2 ? 'PASS' : 'FAIL' });
  console.log(`  连接数: ${edges}, 结果: ${results[results.length-1].result}\n`);
  
  // 选择亮度/对比度节点 - 通过文本查找
  console.log('[ADJ-05] 选择亮度/对比度节点');
  const nodes = await page.locator('.react-flow__node-custom').all();
  console.log(`  节点数: ${nodes.length}`);
  
  // 找到包含"亮度"的节点并点击
  let foundNode = null;
  for (const node of nodes) {
    const text = await node.textContent();
    if (text?.includes('亮度')) {
      foundNode = node;
      break;
    }
  }
  
  if (foundNode) {
    await foundNode.click({ force: true });
    await page.waitForTimeout(1500);
  }
  
  // 检查属性面板
  const panelText = await page.locator('.w-72.bg-bg-secondary').textContent();
  const hasBrightness = panelText?.includes('亮度') || panelText?.includes('brightness') || panelText?.includes('brightness');
  results.push({ id: 'ADJ-05', name: '选择亮度/对比度节点', result: hasBrightness ? 'PASS' : 'FAIL' });
  console.log(`  属性面板包含亮度: ${hasBrightness}, 结果: ${results[results.length-1].result}\n`);
  
  // 检查滑块
  console.log('[ADJ-06] 检查亮度滑块');
  const sliders = await page.locator('.w-72.bg-bg-secondary input[type="range"]').all();
  console.log(`  找到 ${sliders.length} 个滑块`);
  results.push({ id: 'ADJ-06', name: '亮度参数滑块显示', result: sliders.length >= 2 ? 'PASS' : 'FAIL' });
  console.log(`  结果: ${results[results.length-1].result}\n`);
  
  // 添加色阶节点测试
  console.log('[ADJ-07] 添加色阶节点');
  await page.reload();
  await page.waitForTimeout(2000);
  
  await page.click('button:has-text("纯色填充")');
  await page.waitForTimeout(500);
  await page.click('button:has-text("色阶")');
  await page.waitForTimeout(500);
  await page.click('button:has-text("预览输出")');
  await page.waitForTimeout(1000);
  
  // 连接
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
  
  // 选择色阶节点
  const nodes2 = await page.locator('.react-flow__node-custom').all();
  if (nodes2.length >= 2) {
    await nodes2[1].click({ force: true });
    await page.waitForTimeout(1000);
  }
  
  const panelText2 = await page.locator('.w-72.bg-bg-secondary').textContent();
  const hasLevels = panelText2?.includes('色阶') || panelText2?.includes('levels');
  results.push({ id: 'ADJ-07', name: '添加并选择色阶节点', result: hasLevels ? 'PASS' : 'FAIL' });
  console.log(`  结果: ${results[results.length-1].result}\n`);
  
  // 统计
  const passCount = results.filter(r => r.result === 'PASS').length;
  console.log('============================================');
  console.log(`调整节点测试结果: PASS ${passCount}/${results.length}, FAIL ${results.length - passCount}/${results.length}`);
  console.log('============================================');
  
  console.log('\n详细结果:');
  results.forEach(r => {
    console.log(`  [${r.id}] ${r.name}: ${r.result}`);
  });
  
  await browser.close();
})();
