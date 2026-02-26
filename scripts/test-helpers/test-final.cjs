const { chromium } = require('@playwright/test');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  await page.goto('http://localhost:4173', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(3000);
  
  console.log('\n========== 最终测试: 颜色验证 ==========\n');
  
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
  await page.waitForTimeout(3000);
  
  // 直接使用 JavaScript 选择节点并设置颜色
  await page.evaluate(() => {
    const node = document.querySelector('.react-flow__node-custom');
    if (node) node.click();
  });
  await page.waitForTimeout(1000);
  
  // 设置红色
  await page.evaluate(() => {
    const input = document.querySelector('.w-72.bg-bg-secondary input[type="color"]');
    if (input) {
      input.value = '#ff0000';
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.dispatchEvent(new Event('change', { bubbles: true }));
    }
  });
  await page.waitForTimeout(2000);
  
  // 采样
  let pixel = await page.evaluate(() => {
    const canvas = document.querySelector('canvas');
    if (!canvas) return null;
    const ctx = canvas.getContext('2d');
    const data = ctx.getImageData(canvas.width / 2, canvas.height / 2, 1, 1).data;
    return { r: data[0], g: data[1], b: data[2] };
  });
  
  console.log(`红色测试: 期望(255,0,0) 实际(${pixel.r},${pixel.g},${pixel.b})`);
  
  // 设置绿色
  await page.evaluate(() => {
    const input = document.querySelector('.w-72.bg-bg-secondary input[type="color"]');
    if (input) {
      input.value = '#00ff00';
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.dispatchEvent(new Event('change', { bubbles: true }));
    }
  });
  await page.waitForTimeout(2000);
  
  pixel = await page.evaluate(() => {
    const canvas = document.querySelector('canvas');
    if (!canvas) return null;
    const ctx = canvas.getContext('2d');
    const data = ctx.getImageData(canvas.width / 2, canvas.height / 2, 1, 1).data;
    return { r: data[0], g: data[1], b: data[2] };
  });
  
  console.log(`绿色测试: 期望(0,255,0) 实际(${pixel.r},${pixel.g},${pixel.b})`);
  
  // 设置蓝色
  await page.evaluate(() => {
    const input = document.querySelector('.w-72.bg-bg-secondary input[type="color"]');
    if (input) {
      input.value = '#0000ff';
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.dispatchEvent(new Event('change', { bubbles: true }));
    }
  });
  await page.waitForTimeout(2000);
  
  pixel = await page.evaluate(() => {
    const canvas = document.querySelector('canvas');
    if (!canvas) return null;
    const ctx = canvas.getContext('2d');
    const data = ctx.getImageData(canvas.width / 2, canvas.height / 2, 1, 1).data;
    return { r: data[0], g: data[1], b: data[2] };
  });
  
  console.log(`蓝色测试: 期望(0,0,255) 实际(${pixel.r},${pixel.g},${pixel.b})`);
  
  await browser.close();
})();
