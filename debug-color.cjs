const { chromium } = require('@playwright/test');

const COLORS = [
  { id: 'PREVIEW-01', name: '纯红色', r: 255, g: 0, b: 0, check: (p) => p.r > 245 && p.g < 10 && p.b < 10 },
];

function rgbToHex(r, g, b) {
  return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
}

async function sampleCenterPixel(page) {
  const result = await page.evaluate(() => {
    const canvas = document.querySelector('.fixed.z-50 canvas');
    console.log('Canvas found:', !!canvas);
    if (!canvas) return { error: 'No canvas' };
    const ctx = canvas.getContext('2d');
    const data = ctx.getImageData(canvas.width / 2, canvas.height / 2, 1, 1).data;
    console.log('Pixel data:', data);
    return { 
      r: Number(data[0]), 
      g: Number(data[1]), 
      b: Number(data[2]), 
      a: Number(data[3]) 
    };
  });
  return result;
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  await page.goto('http://localhost:4177', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(3000);
  
  // 关闭预览面板
  const closeBtn = page.locator('.fixed.z-50 button').first();
  if (await closeBtn.isVisible()) {
    await closeBtn.click();
    await page.waitForTimeout(500);
  }
  
  // 添加节点
  await page.click('button:has-text("纯色填充")');
  await page.waitForTimeout(800);
  await page.click('button:has-text("预览输出")');
  await page.waitForTimeout(800);
  
  // 连接节点
  const sourceHandle = page.locator('.react-flow__handle-right').first();
  const targetHandle = page.locator('.react-flow__handle-left').first();
  const sourceBox = await sourceHandle.boundingBox();
  const targetBox = await targetHandle.boundingBox();
  
  if (sourceBox && targetBox) {
    await page.mouse.move(sourceBox.x + 3, sourceBox.y + 3);
    await page.mouse.down();
    await page.mouse.move(targetBox.x + 3, targetBox.y + 3, { steps: 20 });
    await page.mouse.up();
    await page.waitForTimeout(1000);
  }
  
  // 选择纯色填充节点
  await page.locator('.react-flow__node-custom').first().click({ force: true });
  await page.waitForTimeout(1000);
  
  // 检查颜色输入
  const colorInput = page.locator('.w-72.bg-bg-secondary input[type="color"]').first();
  console.log('Color input visible:', await colorInput.isVisible());
  
  // 获取当前颜色值
  const currentColor = await colorInput.inputValue();
  console.log('Current color:', currentColor);
  
  // 设置红色
  const hex = rgbToHex(255, 0, 0);
  console.log('Setting color to:', hex);
  await colorInput.fill(hex);
  await page.waitForTimeout(2000);
  
  // 再次获取颜色值
  const newColor = await colorInput.inputValue();
  console.log('New color:', newColor);
  
  // 采样像素
  const pixel = await sampleCenterPixel(page);
  console.log('Pixel:', pixel);
  
  await browser.close();
})();
