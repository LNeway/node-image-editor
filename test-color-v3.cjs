const { chromium } = require('@playwright/test');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  await page.goto('http://localhost:4173', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(3000);
  
  console.log('\n========== 重新测试: 纯色填充颜色 ==========\n');
  
  // 添加节点
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
  
  // 最小化预览面板
  const closeBtn = page.locator('.fixed.z-50 button').first();
  if (await closeBtn.isVisible()) {
    await closeBtn.click();
    await page.waitForTimeout(500);
  }
  console.log('预览面板已最小化');
  
  // 点击选择纯色填充节点
  await page.locator('.react-flow__node-custom').first().click({ force: true });
  await page.waitForTimeout(1500);
  
  // 检查属性面板
  const panelText = await page.locator('.w-72.bg-bg-secondary').textContent();
  console.log(`属性面板: ${panelText?.substring(0, 100)}`);
  
  // 测试颜色
  const colors = [
    { name: '红色', hex: '#ff0000', expected: { r: 255, g: 0, b: 0 } },
    { name: '绿色', hex: '#00ff00', expected: { r: 0, g: 255, b: 0 } },
    { name: '蓝色', hex: '#0000ff', expected: { r: 0, g: 0, b: 255 } },
  ];
  
  for (const c of colors) {
    console.log(`\n测试 ${c.name} (${c.hex})...`);
    
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
    
    // 恢复预览面板查看结果
    await page.locator('.fixed.z-50 button').first().click();
    await page.waitForTimeout(1500);
    
    // 采样
    const pixel = await page.evaluate(() => {
      const canvas = document.querySelector('canvas');
      if (!canvas) return null;
      const ctx = canvas.getContext('2d');
      const data = ctx.getImageData(canvas.width / 2, canvas.height / 2, 1, 1).data;
      return { r: data[0], g: data[1], b: data[2] };
    });
    
    console.log(`  期望: RGB(${c.expected.r}, ${c.expected.g}, ${c.expected.b})`);
    console.log(`  实际: RGB(${pixel?.r}, ${pixel?.g}, ${pixel?.b})`);
    
    // 再次最小化继续测试
    await page.locator('.fixed.z-50 button').first().click();
    await page.waitForTimeout(500);
  }
  
  await browser.close();
})();
