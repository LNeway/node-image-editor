const { chromium } = require('@playwright/test');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  await page.goto('http://localhost:4173', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(3000);
  
  console.log('\n========== 测试: 调整节点参数 ==========\n');
  
  // 添加节点
  await page.click('button:has-text("纯色填充")');
  await page.waitForTimeout(500);
  await page.click('button:has-text("亮度/对比度")');
  await page.waitForTimeout(500);
  await page.click('button:has-text("预览输出")');
  await page.waitForTimeout(1000);
  
  // 连接: 纯色 -> 亮度/对比度 -> 预览
  const rightHandles = await page.locator('.react-flow__handle-right').all();
  const leftHandles = await page.locator('.react-flow__handle-left').all();
  
  // 连接第1条: 纯色 -> 亮度
  if (rightHandles.length > 0 && leftHandles.length > 0) {
    const src1 = await rightHandles[0].boundingBox();
    const tgt1 = await leftHandles[0].boundingBox();
    await page.mouse.move(src1.x + 3, src1.y + 3);
    await page.mouse.down();
    await page.mouse.move(tgt1.x + 3, tgt1.y + 3, { steps: 15 });
    await page.mouse.up();
    await page.waitForTimeout(1000);
  }
  
  // 连接第2条: 亮度 -> 预览
  const rightHandles2 = await page.locator('.react-flow__handle-right').all();
  const leftHandles2 = await page.locator('.react-flow__handle-left').all();
  if (rightHandles2.length > 1 && leftHandles2.length > 1) {
    const src2 = await rightHandles2[1].boundingBox();
    const tgt2 = await leftHandles2[1].boundingBox();
    await page.mouse.move(src2.x + 3, src2.y + 3);
    await page.mouse.down();
    await page.mouse.move(tgt2.x + 3, tgt2.y + 3, { steps: 15 });
    await page.mouse.up();
    await page.waitForTimeout(1000);
  }
  
  console.log('连接完成');
  
  // 选择亮度/对比度节点
  const nodes = await page.locator('.react-flow__node-custom').all();
  console.log(`节点数: ${nodes.length}`);
  
  // 点击第2个节点（亮度/对比度）
  if (nodes.length >= 2) {
    await nodes[1].click();
    await page.waitForTimeout(1500);
  }
  
  // 检查属性面板
  const propsPanel = await page.locator('.w-72.bg-bg-secondary').textContent();
  console.log('属性面板内容:');
  console.log(propsPanel.substring(0, 300));
  
  // 查找所有输入
  const inputs = await page.locator('.w-72.bg-bg-secondary input').all();
  console.log(`\n找到 ${inputs.length} 个输入框`);
  
  for (let i = 0; i < inputs.length; i++) {
    const type = await inputs[i].getAttribute('type');
    const value = await inputs[i].inputValue();
    console.log(`  输入 ${i}: type=${type}, value=${value}`);
  }
  
  // 查找滑块
  const sliders = await page.locator('.w-72.bg-bg-secondary input[type="range"]').count();
  console.log(`\n滑块数量: ${sliders}`);
  
  await browser.close();
})();
