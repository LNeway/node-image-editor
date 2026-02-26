const { chromium } = require('@playwright/test');

const COLORS = [
  { id: 'PREVIEW-01', name: '纯红色', r: 255, g: 0, b: 0, check: (p) => p.r > 245 && p.g < 10 && p.b < 10 },
  { id: 'PREVIEW-02', name: '纯绿色', r: 0, g: 255, b: 0, check: (p) => p.r < 10 && p.g > 245 && p.b < 10 },
  { id: 'PREVIEW-03', name: '纯蓝色', r: 0, g: 0, b: 255, check: (p) => p.r < 10 && p.g < 10 && p.b > 245 },
  { id: 'PREVIEW-04', name: '纯白色', r: 255, g: 255, b: 255, check: (p) => p.r > 245 && p.g > 245 && p.b > 245 },
  { id: 'PREVIEW-05', name: '纯黑色', r: 0, g: 0, b: 0, check: (p) => p.r < 10 && p.g < 10 && p.b < 10 },
  { id: 'PREVIEW-06', name: '黄色', r: 255, g: 255, b: 0, check: (p) => p.r > 245 && p.g > 245 && p.b < 10 },
  { id: 'PREVIEW-07', name: '青色', r: 0, g: 255, b: 255, check: (p) => p.r < 10 && p.g > 245 && p.b > 245 },
  { id: 'PREVIEW-08', name: '洋红色', r: 255, g: 0, b: 255, check: (p) => p.r > 245 && p.g < 10 && p.b > 245 },
  { id: 'PREVIEW-09', name: '橙色', r: 255, g: 128, b: 0, check: (p) => p.r > 245 && p.g > 118 && p.b < 10 },
  { id: 'PREVIEW-10', name: '粉色', r: 255, g: 192, b: 203, check: (p) => p.r > 245 && p.g > 182 && p.b > 193 },
  { id: 'PREVIEW-11', name: '紫色', r: 128, g: 0, b: 128, check: (p) => p.r > 118 && p.g < 10 && p.b > 118 },
  { id: 'PREVIEW-12', name: '棕色', r: 139, g: 69, b: 19, check: (p) => p.r > 129 && p.g > 59 && p.b < 29 },
  { id: 'PREVIEW-13', name: '灰色', r: 128, g: 128, b: 128, check: (p) => p.r > 118 && p.g > 118 && p.b > 118 },
  { id: 'PREVIEW-14', name: '浅蓝', r: 173, g: 216, b: 230, check: (p) => p.r > 163 && p.g > 206 && p.b > 220 },
  { id: 'PREVIEW-15', name: 'lime', r: 0, g: 255, b: 0, check: (p) => p.r < 10 && p.g > 245 && p.b < 10 },
];

function rgbToHex(r, g, b) {
  return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
}

async function sampleCenterPixel(page) {
  const result = await page.evaluate(() => {
    // 尝试多个选择器
    let canvas = document.querySelector('.fixed.z-50 canvas');
    if (!canvas) canvas = document.querySelector('canvas');
    if (!canvas) return { error: 'No canvas' };
    
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;
    const data = ctx.getImageData(w / 2, h / 2, 1, 1).data;
    return { r: data[0], g: data[1], b: data[2], w, h };
  });
  return result;
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  await page.goto('http://localhost:4177', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(3000);
  
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
  
  await page.mouse.move(sourceBox.x + 3, sourceBox.y + 3);
  await page.mouse.down();
  await page.mouse.move(targetBox.x + 3, targetBox.y + 3, { steps: 20 });
  await page.mouse.up();
  await page.waitForTimeout(2000);
  
  // 截图验证连接
  await page.screenshot({ path: '/tmp/test-connected.png', fullPage: true });
  console.log('Screenshot saved');
  
  // 验证预览打开了
  const previewVisible = await page.locator('.fixed.z-50').isVisible();
  console.log('Preview panel visible:', previewVisible);
  
  // 选择纯色填充节点并设置颜色
  await page.locator('.react-flow__node-custom').first().click({ force: true });
  await page.waitForTimeout(1000);
  
  // 设置颜色为红色
  const colorInput = page.locator('.w-72.bg-bg-secondary input[type="color"]').first();
  await colorInput.fill('#ff0000');
  await page.waitForTimeout(2000);
  
  // 再次截图
  await page.screenshot({ path: '/tmp/test-color-set.png', fullPage: true });
  
  // 采样像素
  const pixel = await sampleCenterPixel(page);
  console.log('Pixel sample:', pixel);
  
  await browser.close();
})();
