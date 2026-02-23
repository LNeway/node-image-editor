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
  
  const sourceHandle = page.locator('.react-flow__handle-right').first();
  const targetHandle = page.locator('.react-flow__handle-left').first();
  const sourceBox = await sourceHandle.boundingBox();
  const targetBox = await targetHandle.boundingBox();
  
  await page.mouse.move(sourceBox.x + 3, sourceBox.y + 3);
  await page.mouse.down();
  await page.mouse.move(targetBox.x + 3, targetBox.y + 3, { steps: 20 });
  await page.mouse.up();
  await page.waitForTimeout(2000);
  
  // 最小化预览
  await page.locator('.fixed.z-50 button').first().click();
  await page.waitForTimeout(1000);
  
  // 选择节点并设置颜色
  await page.locator('.react-flow__node-custom').first().click({ force: true });
  await page.waitForTimeout(1000);
  
  await page.locator('.w-72.bg-bg-secondary input[type="color"]').fill('#ff0000');
  await page.waitForTimeout(2000);
  
  // 获取所有 canvas 的调试信息
  const debug = await page.evaluate(() => {
    const canvases = Array.from(document.querySelectorAll('canvas')).map(c => ({
      width: c.width,
      height: c.height,
      className: c.className,
      parentClass: c.parentElement?.className
    }));
    
    // 检查预览面板
    const preview = document.querySelector('.fixed.z-50');
    const isMin = preview?.classList.contains('minimized') || preview?.querySelector('.minimized');
    
    return { canvases, isMinimized: !!isMin, previewHTML: preview?.innerHTML?.substring(0, 200) };
  });
  
  console.log('Debug:', JSON.stringify(debug, null, 2));
  
  await browser.close();
})();
