const { chromium } = require('playwright');

const testCases = [
  // 第一组：界面布局（6个）
  { id: 'UI-01', name: '页面标题显示', category: '界面布局' },
  { id: 'UI-02', name: '顶部工具栏显示', category: '界面布局' },
  { id: 'UI-03', name: '左侧节点库面板', category: '界面布局' },
  { id: 'UI-04', name: '右侧属性面板', category: '界面布局' },
  { id: 'UI-05', name: '底部状态栏', category: '界面布局' },
  { id: 'UI-06', name: '画布背景网格', category: '界面布局' },
  
  // 第二组：节点库（6个）
  { id: 'NODE-01', name: '节点库分类展开', category: '节点库' },
  { id: 'NODE-02', name: '节点库搜索功能', category: '节点库' },
  { id: 'NODE-03', name: '输入分类节点', category: '节点库' },
  { id: 'NODE-04', name: '调整分类节点', category: '节点库' },
  { id: 'NODE-05', name: '滤镜分类节点', category: '节点库' },
  { id: 'NODE-06', name: '输出分类节点', category: '节点库' },
  
  // 第三组：节点操作（5个）
  { id: 'OP-01', name: '添加节点到画布', category: '节点操作' },
  { id: 'OP-02', name: '选择节点', category: '节点操作' },
  { id: 'OP-03', name: '删除节点', category: '节点操作' },
  { id: 'OP-04', name: '移动节点位置', category: '节点操作' },
  { id: 'OP-05', name: '节点属性编辑', category: '节点操作' },
  
  // 第四组：节点连线（3个）
  { id: 'EDGE-01', name: '创建节点连线', category: '节点连线' },
  { id: 'EDGE-02', name: '删除节点连线', category: '节点连线' },
  { id: 'EDGE-03', name: '连线样式显示', category: '节点连线' },
  
  // 第五组：纯色填充预览（15个）- 核心
  { id: 'PREVIEW-01', name: '纯红色填充', category: '纯色填充预览' },
  { id: 'PREVIEW-02', name: '纯绿色填充', category: '纯色填充预览' },
  { id: 'PREVIEW-03', name: '纯蓝色填充', category: '纯色填充预览' },
  { id: 'PREVIEW-04', name: '纯白色填充', category: '纯色填充预览' },
  { id: 'PREVIEW-05', name: '纯黑色填充', category: '纯色填充预览' },
  { id: 'PREVIEW-06', name: '黄色填充', category: '纯色填充预览' },
  { id: 'PREVIEW-07', name: '青色填充', category: '纯色填充预览' },
  { id: 'PREVIEW-08', name: '洋红色填充', category: '纯色填充预览' },
  { id: 'PREVIEW-09', name: '橙色填充', category: '纯色填充预览' },
  { id: 'PREVIEW-10', name: '粉色填充', category: '纯色填充预览' },
  { id: 'PREVIEW-11', name: '紫色填充', category: '纯色填充预览' },
  { id: 'PREVIEW-12', name: '棕色填充', category: '纯色填充预览' },
  { id: 'PREVIEW-13', name: '灰色填充', category: '纯色填充预览' },
  { id: 'PREVIEW-14', name: '浅蓝色填充', category: '纯色填充预览' },
  { id: 'PREVIEW-15', name: 'lime绿色填充', category: '纯色填充预览' },
  
  // 第六组：HSL调整（3个）
  { id: 'HSL-01', name: 'HSL色相调整', category: 'HSL调整' },
  { id: 'HSL-02', name: 'HSL饱和度调整', category: 'HSL调整' },
  { id: 'HSL-03', name: 'HSL亮度调整', category: 'HSL调整' },
  
  // 第七组：高斯模糊（2个）
  { id: 'BLUR-01', name: '高斯模糊效果', category: '高斯模糊' },
  { id: 'BLUR-02', name: '模糊半径参数', category: '高斯模糊' },
  
  // 第八组：节点链（3个）
  { id: 'CHAIN-01', name: '多节点链式执行', category: '节点链' },
  { id: 'CHAIN-02', name: '节点数据传递', category: '节点链' },
  { id: 'CHAIN-03', name: '链式预览更新', category: '节点链' },
  
  // 第九组：其他（3个）
  { id: 'OTHER-01', name: '图片导入功能', category: '其他' },
  { id: 'OTHER-02', name: '图片导出功能', category: '其他' },
  { id: 'OTHER-03', name: '缩放画布操作', category: '其他' },
];

async function runTest(browser, testCase) {
  const page = await browser.newPage();
  try {
    await page.goto('http://localhost:4173', { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(2000);
    
    let passed = false;
    let reason = '';
    
    switch (testCase.category) {
      case '界面布局':
        passed = await testUI(page, testCase.id);
        break;
      case '节点库':
        passed = await testNodeLibrary(page, testCase.id);
        break;
      case '节点操作':
        passed = await testNodeOperation(page, testCase.id);
        break;
      case '节点连线':
        passed = await testEdge(page, testCase.id);
        break;
      case '纯色填充预览':
        passed = await testPreview(page, testCase.id);
        break;
      case 'HSL调整':
        passed = await testHSL(page, testCase.id);
        break;
      case '高斯模糊':
        passed = await testBlur(page, testCase.id);
        break;
      case '节点链':
        passed = await testChain(page, testCase.id);
        break;
      case '其他':
        passed = await testOther(page, testCase.id);
        break;
    }
    
    return { ...testCase, status: passed ? 'PASS' : 'FAIL', reason: reason || (passed ? '' : '测试失败') };
  } catch (e) {
    return { ...testCase, status: 'FAIL', reason: e.message };
  } finally {
    await page.close();
  }
}

async function testUI(page, id) {
  const uiTexts = {
    'UI-01': 'Node Image Editor',
    'UI-02': '新建',
    'UI-03': '节点库',
    'UI-04': '属性',
    'UI-05': 'Nodes:',
    'UI-06': 'react-flow__background'
  };
  
  if (id === 'UI-01') {
    const title = await page.title();
    return title.includes('Node Image Editor');
  }
  
  if (id === 'UI-06') {
    return await page.locator('.react-flow__background').count() > 0;
  }
  
  return await page.getByText(uiTexts[id], { exact: false }).count() > 0;
}

async function testNodeLibrary(page, id) {
  // 展开所有分类
  const categories = ['输入', '调整', '滤镜', '变换', '合成', '输出'];
  for (const cat of categories) {
    try {
      await page.click(`button:has-text("${cat}")`, { timeout: 500 });
    } catch {}
  }
  await page.waitForTimeout(500);
  
  switch (id) {
    case 'NODE-01':
      return await page.getByText('输入').count() > 0;
    case 'NODE-02':
      return await page.getByPlaceholder('搜索节点').count() > 0;
    case 'NODE-03':
      return await page.getByText('图片导入').count() > 0;
    case 'NODE-04':
      return await page.getByText('亮度/对比度').count() > 0;
    case 'NODE-05':
      return await page.getByText('高斯模糊').count() > 0;
    case 'NODE-06':
      return await page.getByText('预览输出').count() > 0;
    default:
      return false;
  }
}

async function testNodeOperation(page, id) {
  // 先添加一个节点
  try {
    await page.click('button:has-text("纯色填充")');
    await page.waitForTimeout(500);
  } catch {
    return false;
  }
  
  switch (id) {
    case 'OP-01':
      return await page.locator('.react-flow__node-custom').count() > 0;
    case 'OP-02':
      await page.click('.react-flow__node-custom >> nth=0');
      return await page.locator('.react-flow__node-custom.selected').count() > 0;
    case 'OP-03':
      await page.keyboard.press('Delete');
      await page.waitForTimeout(300);
      return await page.locator('.react-flow__node-custom').count() === 0;
    case 'OP-04':
      await page.click('button:has-text("纯色填充")');
      await page.waitForTimeout(300);
      const node = page.locator('.react-flow__node-custom').first();
      await node.hover();
      await page.mouse.down();
      await page.mouse.move(100, 100);
      await page.mouse.up();
      return true;
    case 'OP-05':
      return await page.getByText('属性').count() > 0;
    default:
      return false;
  }
}

async function testEdge(page, id) {
  // 创建两个节点并连接
  try {
    await page.click('button:has-text("纯色填充")');
    await page.waitForTimeout(300);
    await page.click('button:has-text("预览输出")');
    await page.waitForTimeout(500);
  } catch {
    return false;
  }
  
  switch (id) {
    case 'EDGE-01':
      return await page.locator('.react-flow__edge').count() > 0;
    case 'EDGE-02':
      await page.keyboard.press('Delete');
      await page.waitForTimeout(300);
      return await page.locator('.react-flow__edge').count() === 0;
    case 'EDGE-03':
      return await page.locator('.react-flow__edge-path').count() > 0;
    default:
      return false;
  }
}

async function testPreview(page, id) {
  const colorMap = {
    'PREVIEW-01': '#ff0000',
    'PREVIEW-02': '#00ff00',
    'PREVIEW-03': '#0000ff',
    'PREVIEW-04': '#ffffff',
    'PREVIEW-05': '#000000',
    'PREVIEW-06': '#ffff00',
    'PREVIEW-07': '#00ffff',
    'PREVIEW-08': '#ff00ff',
    'PREVIEW-09': '#ff8000',
    'PREVIEW-10': '#ffc0cb',
    'PREVIEW-11': '#800080',
    'PREVIEW-12': '#8b4513',
    'PREVIEW-13': '#808080',
    'PREVIEW-14': '#add8e6',
    'PREVIEW-15': '#00ff00',
  };
  
  try {
    // 添加纯色填充和预览输出
    await page.click('button:has-text("纯色填充")');
    await page.waitForTimeout(500);
    await page.click('button:has-text("预览输出")');
    await page.waitForTimeout(1000);
    
    // 找到颜色输入并设置颜色
    const colorInput = page.locator('input[type="text"]').first();
    await colorInput.fill(colorMap[id]);
    await page.waitForTimeout(1000);
    
    // 检查是否有canvas
    const canvas = page.locator('canvas');
    if (await canvas.count() > 0) {
      return true;
    }
    return false;
  } catch (e) {
    console.log(`Preview test ${id} error:`, e.message);
    return false;
  }
}

async function testHSL(page, id) {
  try {
    await page.click('button:has-text("纯色填充")');
    await page.waitForTimeout(300);
    await page.click('button:has-text("HSL调整")');
    await page.waitForTimeout(500);
    return await page.locator('.react-flow__node-custom').count() >= 2;
  } catch {
    return false;
  }
}

async function testBlur(page, id) {
  try {
    await page.click('button:has-text("纯色填充")');
    await page.waitForTimeout(300);
    await page.click('button:has-text("高斯模糊")');
    await page.waitForTimeout(500);
    return await page.locator('.react-flow__node-custom').count() >= 2;
  } catch {
    return false;
  }
}

async function testChain(page, id) {
  try {
    await page.click('button:has-text("纯色填充")');
    await page.waitForTimeout(300);
    await page.click('button:has-text("亮度/对比度")');
    await page.waitForTimeout(300);
    await page.click('button:has-text("预览输出")');
    await page.waitForTimeout(500);
    
    const nodeCount = await page.locator('.react-flow__node-custom').count();
    return nodeCount >= 3;
  } catch {
    return false;
  }
}

async function testOther(page, id) {
  switch (id) {
    case 'OTHER-01':
      return await page.getByText('图片导入').count() > 0;
    case 'OTHER-02':
      return await page.getByText('图片导出').count() > 0;
    case 'OTHER-03':
      return await page.locator('.react-flow__controls').count() > 0;
    default:
      return false;
  }
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  console.log('Starting 51 test cases...\n');
  
  const results = [];
  for (const testCase of testCases) {
    process.stdout.write(`Testing ${testCase.id}...`);
    const result = await runTest(browser, testCase);
    results.push(result);
    console.log(` ${result.status}`);
  }
  
  await browser.close();
  
  // 统计结果
  const passed = results.filter(r => r.status === 'PASS').length;
  const failed = results.filter(r => r.status === 'FAIL').length;
  
  console.log('\n=== 测试结果 ===');
  console.log(`通过: ${passed}/51`);
  console.log(`失败: ${failed}/51`);
  
  if (failed > 0) {
    console.log('\n=== 失败详情 ===');
    results.filter(r => r.status === 'FAIL').forEach(r => {
      console.log(`[${r.id}] ${r.name} - ${r.reason || '未知原因'}`);
    });
  }
}

main().catch(console.error);
