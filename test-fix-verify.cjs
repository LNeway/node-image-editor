const { chromium } = require('@playwright/test');

// 测试颜色变化和节点选择
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  await page.goto('http://localhost:4173', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(3000);
  
  console.log('\n========== 修复验证测试 ==========\n');
  
  // 1. 测试颜色变化
  console.log('【测试1: 颜色变化】');
  
  // 添加节点并连接
  await page.click('button:has-text("纯色填充")');
  await page.waitForTimeout(500);
  await page.click('button:has-text("预览输出")');
  await page.waitForTimeout(1000);
  
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
  
  // 关闭预览面板
  const closeBtn = page.locator('.fixed.z-50 button').first();
  if (await closeBtn.isVisible()) {
    await closeBtn.click();
    await page.waitForTimeout(500);
  }
  
  // 选择纯色填充节点
  await page.locator('.react-flow__node-custom').first().click({ force: true });
  await page.waitForTimeout(1000);
  
  // 测试颜色
  const colors = [
    { name: '红', hex: '#ff0000', expected: { r: 255, g: 0, b: 0 } },
    { name: '绿', hex: '#00ff00', expected: { r: 0, g: 255, b: 0 } },
    { name: '蓝', hex: '#0000ff', expected: { r: 0, g: 0, b: 255 } },
  ];
  
  let colorPass = 0;
  for (const c of colors) {
    // 设置颜色
    await page.evaluate((hex) => {
      const input = document.querySelector('.w-72.bg-bg-secondary input[type="color"]');
      if (input) {
        input.value = hex;
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
      }
    }, c.hex);
    
    await page.waitForTimeout(1500);
    
    // 恢复预览查看结果
    await page.locator('.fixed.z-50 button').first().click();
    await page.waitForTimeout(1000);
    
    // 采样
    const pixel = await page.evaluate(() => {
      const canvas = document.querySelector('canvas');
      if (!canvas) return null;
      const ctx = canvas.getContext('2d');
      const data = ctx.getImageData(canvas.width / 2, canvas.height / 2, 1, 1).data;
      return { r: data[0], g: data[1], b: data[2] };
    });
    
    const passed = pixel && 
      Math.abs(pixel.r - c.expected.r) <= 10 &&
      Math.abs(pixel.g - c.expected.g) <= 10 &&
      Math.abs(pixel.b - c.expected.b) <= 10;
    
    if (passed) colorPass++;
    console.log(`  ${c.name}: 期望(${c.expected.r},${c.expected.g},${c.expected.b}) 实际(${pixel?.r},${pixel?.g},${pixel?.b}) ${passed ? '✅' : '❌'}`);
    
    // 关闭预览继续
    await page.locator('.fixed.z-50 button').first().click();
    await page.waitForTimeout(500);
  }
  
  // 2. 测试节点选择
  console.log('\n【测试2: 节点选择】');
  
  // 添加亮度/对比度节点
  await page.click('button:has-text("亮度/对比度")');
  await page.waitForTimeout(500);
  
  // 连接亮度到预览
  const rightHandles = await page.locator('.react-flow__handle-right').all();
  const leftHandles = await page.locator('.react-flow__handle-left').all();
  
  if (rightHandles.length > 1 && leftHandles.length > 1) {
    const src2 = await rightHandles[1].boundingBox();
    const tgt2 = await leftHandles[1].boundingBox();
    await page.mouse.move(src2.x + 3, src2.y + 3);
    await page.mouse.down();
    await page.mouse.move(tgt2.x + 3, tgt2.y + 3, { steps: 15 });
    await page.mouse.up();
    await page.waitForTimeout(1000);
  }
  
  // 选择亮度/对比度节点（第二个）
  const nodes = await page.locator('.react-flow__node-custom').all();
  console.log(`  节点数: ${nodes.length}`);
  
  if (nodes.length >= 2) {
    await nodes[1].click({ force: true });
    await page.waitForTimeout(1500);
  }
  
  // 检查属性面板
  const panelText = await page.locator('.w-72.bg-bg-secondary').textContent();
  const hasBrightness = panelText?.includes('亮度') || panelText?.includes('brightness');
  console.log(`  属性面板: ${panelText?.substring(0, 80)}...`);
  console.log(`  包含亮度参数: ${hasBrightness ? '✅' : '❌'}`);
  
  // 检查滑块
  const sliders = await page.locator('.w-72.bg-bg-secondary input[type="range"]').count();
  console.log(`  滑块数量: ${sliders} ${sliders > 0 ? '✅' : '❌'}`);
  
  // 总结
  console.log('\n========== 测试结果 ==========');
  console.log(`颜色测试: ${colorPass}/3 通过 ${colorPass === 3 ? '✅' : '❌'}`);
  console.log(`节点选择: ${hasBrightness && sliders > 0 ? '✅ PASS' : '❌ FAIL'}`);
  
  await browser.close();
})();
