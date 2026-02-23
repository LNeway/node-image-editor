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

async function sampleCenterPixel(page) {
  const result = await page.evaluate(() => {
    const canvas = document.querySelector('canvas');
    if (!canvas) return { error: 'No canvas' };
    const ctx = canvas.getContext('2d');
    const data = ctx.getImageData(canvas.width / 2, canvas.height / 2, 1, 1).data;
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
  
  // 展开所有分类
  const cats = ['输入', '调整', '滤镜', '变换', '合成', '输出'];
  for (const c of cats) {
    try { 
      await page.click(`button:has-text("${c}")`, { timeout: 1000 }); 
    } catch {}
  }
  await page.waitForTimeout(500);
  
  // 添加纯色填充节点
  console.log('Adding solid color node...');
  await page.click('button:has-text("纯色填充")');
  await page.waitForTimeout(1000);
  
  // 添加预览输出节点
  console.log('Adding preview node...');
  await page.click('button:has-text("预览输出")');
  await page.waitForTimeout(1000);
  
  // 点击纯色填充节点打开属性面板
  console.log('Clicking solid color node...');
  const solidNode = page.locator('.react-flow__node-custom').first();
  await solidNode.click();
  await page.waitForTimeout(1000);
  
  // 检查属性面板
  const propsPanel = await page.locator('.w-72.bg-bg-secondary').textContent();
  console.log('Properties panel:', propsPanel.substring(0, 200));
  
  // 查找所有输入
  const inputs = await page.locator('input').all();
  console.log(`Found ${inputs.length} inputs`);
  
  for (let i = 0; i < inputs.length; i++) {
    const input = inputs[i];
    const type = await input.getAttribute('type');
    const placeholder = await input.getAttribute('placeholder');
    console.log(`Input ${i}: type=${type}, placeholder=${placeholder}`);
  }
  
  await browser.close();
})();
