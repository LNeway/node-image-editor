const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  await page.goto('http://localhost:4174', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(3000);
  
  // 添加纯色填充
  await page.click('button:has-text("纯色填充")');
  await page.waitForTimeout(1000);
  
  // 添加预览输出
  await page.click('button:has-text("预览输出")');
  await page.waitForTimeout(2000);
  
  // 选择纯色填充节点 - 使用文本查找
  const nodes = await page.locator('.react-flow__node-custom').all();
  console.log('节点数:', nodes.length);
  
  for (const node of nodes) {
    const text = await node.textContent();
    console.log('  节点文本:', text?.substring(0, 30));
    if (text?.includes('纯色')) {
      console.log('  点击纯色节点...');
      await node.click({ force: true });
      await page.waitForTimeout(1000);
      break;
    }
  }
  
  // 检查属性面板内容
  const panel = await page.locator('.w-72.bg-bg-secondary').textContent();
  console.log('属性面板内容:', panel?.substring(0, 200));
  
  // 检查是否有颜色输入
  const inputs = await page.locator('.w-72.bg-bg-secondary input').all();
  console.log('属性面板中的输入框数量:', inputs.length);
  
  for (const input of inputs) {
    const type = await input.getAttribute('type');
    const visible = await input.isVisible();
    console.log('  输入框类型:', type, '可见:', visible);
  }
  
  await browser.close();
})();
