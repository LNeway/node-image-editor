const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  await page.goto('http://localhost:4174', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(3000);
  
  // 添加纯色填充
  console.log('[1] 添加纯色填充');
  await page.click('button:has-text("纯色填充")');
  await page.waitForTimeout(500);
  
  // 添加亮度/对比度
  console.log('[2] 添加亮度/对比度');
  await page.click('button:has-text("亮度/对比度")');
  await page.waitForTimeout(500);
  
  // 添加预览输出
  console.log('[3] 添加预览输出');
  await page.click('button:has-text("预览输出")');
  await page.waitForTimeout(1000);
  
  // 关闭预览面板（关键步骤！）
  console.log('[4] 关闭预览面板');
  const closeBtn = page.locator('.fixed button').first();
  if (await closeBtn.isVisible()) {
    await closeBtn.click();
    await page.waitForTimeout(500);
  }
  
  // 选择亮度/对比度节点
  console.log('[5] 选择亮度/对比度节点');
  const nodes = await page.locator('.react-flow__node-custom').all();
  for (const node of nodes) {
    const text = await node.textContent();
    if (text?.includes('亮度')) {
      await node.click({ force: true });
      await page.waitForTimeout(1000);
      break;
    }
  }
  
  // 检查属性面板
  const panelText = await page.locator('.w-72.bg-bg-secondary').textContent();
  const hasBrightness = panelText?.includes('亮度');
  console.log(`属性面板包含亮度: ${hasBrightness}`);
  
  // 检查滑块
  const sliders = await page.locator('.w-72.bg-bg-secondary input[type="range"]').count();
  console.log(`滑块数量: ${sliders}`);
  
  await browser.close();
})();
