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
  
  // 选择节点
  await page.evaluate(() => {
    document.querySelector('.react-flow__node-custom')?.click();
  });
  await page.waitForTimeout(1000);
  
  console.log('\n========== 15 COLOR TEST RESULTS ==========\n');
  const results = [];
  
  for (const color of COLORS) {
    try {
      const hex = rgbToHex(color.r, color.g, color.b);
      
      // 使用 JavaScript 设置颜色
      await page.evaluate((h) => {
        const input = document.querySelector('.w-72.bg-bg-secondary input[type="color"]');
        if (input) {
          input.value = h;
          input.dispatchEvent(new Event('input', { bubbles: true }));
          input.dispatchEvent(new Event('change', { bubbles: true }));
        }
      }, hex);
      
      // 等待更长时间
      await page.waitForTimeout(2000);
      
      // 每次都重新选择节点触发更新
      await page.evaluate(() => {
        document.querySelector('.react-flow__node-custom')?.click();
      });
      await page.waitForTimeout(500);
      
      // 采样像素
      const pixel = await page.evaluate(() => {
        const canvas = document.querySelector('canvas');
        if (!canvas) return { error: 'no canvas' };
        const ctx = canvas.getContext('2d');
        const data = ctx.getImageData(canvas.width / 2, canvas.height / 2, 1, 1).data;
        return { r: data[0], g: data[1], b: data[2] };
      });
      
      if (pixel.error) {
        results.push({ id: color.id, name: color.name, status: 'FAIL', reason: pixel.error });
        continue;
      }
      
      const passed = color.check(pixel);
      results.push({ 
        id: color.id,
        name: color.name,
        input: `(${color.r}, ${color.g}, ${color.b})`,
        pixel: `[${pixel.r}, ${pixel.g}, ${pixel.b}]`,
        status: passed ? 'PASS' : 'FAIL'
      });
      
      const icon = passed ? '✅' : '❌';
      console.log(`[${color.id}] ${color.name}`);
      console.log(`  输入: (${color.r}, ${color.g}, ${color.b})`);
      console.log(`  采样: [${pixel.r}, ${pixel.g}, ${pixel.b}]`);
      console.log(`  结果: ${passed ? 'PASS' : 'FAIL'} ${icon}\n`);
    } catch (e) {
      results.push({ id: color.id, name: color.name, status: 'FAIL', reason: e.message });
    }
  }
  
  const passCount = results.filter(r => r.status === 'PASS').length;
  console.log('============================================');
  console.log(`总计: PASS ${passCount}/15, FAIL ${15 - passCount}/15`);
  console.log('============================================');
  
  await browser.close();
})();
