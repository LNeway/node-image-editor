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
  await page.waitForTimeout(3000);
  
  // 使用 JS 直接注入颜色并触发更新
  const result = await page.evaluate(async () => {
    // 找到 Redux store
    const state = (window as any).__REDUX_DEVTOOLS_EXTENSION__ || 
                  document.querySelector('script')?.textContent?.includes('redux');
    
    // 直接触发一个自定义事件来更新颜色
    window.dispatchEvent(new CustomEvent('color-change', { detail: '#ff0000' }));
    
    // 等待一下
    await new Promise(r => setTimeout(r, 2000));
    
    // 获取 canvas 内容
    const canvas = document.querySelector('canvas');
    if (!canvas) return { error: 'no canvas' };
    
    const ctx = canvas.getContext('2d');
    const data = ctx.getImageData(canvas.width / 2, canvas.height / 2, 1, 1).data;
    return { r: data[0], g: data[1], b: data[2], w: canvas.width, h: canvas.height };
  });
  
  console.log('Result:', result);
  
  await browser.close();
})();
