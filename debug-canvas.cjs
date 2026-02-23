const { chromium } = require('@playwright/test');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  await page.goto('http://localhost:4177', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(3000);
  
  // 添加节点并连接
  await page.click('button:has-text("纯色填充")');
  await page.waitForTimeout(800);
  await page.click('button:has-text("预览输出")');
  await page.waitForTimeout(800);
  
   const sourceHandle // 连接节点
 = page.locator('.react-flow__handle-right').first();
  const targetHandle = page.locator('.react-flow__handle-left').first();
  const sourceBox = await sourceHandle.boundingBox();
  const targetBox = await targetHandle.boundingBox();
  
  await page.mouse.move(sourceBox.x + 3, sourceBox.y + 3);
  await page.mouse.down();
  await page.mouse.move(targetBox.x + 3, targetBox.y + 3, { steps: 20 });
  await page.mouse.up();
  await page.waitForTimeout(2000);
  
  // 选择纯色填充节点
  await page.locator('.react-flow__node-custom').first().click({ force: true });
  await page.waitForTimeout(1000);
  
  // 设置红色
  const colorInput = page.locator('.w-72.bg-bg-secondary input[type="color"]').first();
  await colorInput.fill('#ff0000');
  await page.waitForTimeout(2000);
  
  // 调试 canvas
  const debugInfo = await page.evaluate(() => {
    const results = [];
    
    // 尝试所有 canvas
    const allCanvases = document.querySelectorAll('canvas');
    results.push(`Total canvases: ${allCanvases.length}`);
    
    allCanvases.forEach((c, i) => {
      results.push(`Canvas ${i}: ${c.width}x${c.height}, class=${c.className}`);
    });
    
    // 预览面板内的 canvas
    const previewCanvas = document.querySelector('.fixed.z-50 canvas');
    results.push(`Preview canvas: ${previewCanvas ? 'found' : 'not found'}`);
    
    if (previewCanvas) {
      const ctx = previewCanvas.getContext('2d');
      const data = ctx.getImageData(previewCanvas.width / 2, previewCanvas.height / 2, 1, 1).data;
      results.push(`Center pixel: [${data[0]}, ${data[1]}, ${data[2]}, ${data[3]}]`);
    }
    
    return results;
  });
  
  console.log('Debug info:');
  debugInfo.forEach(line => console.log(line));
  
  await browser.close();
})();
