#!/bin/bash

# 项目结构快速查看工具

echo "📁 Node-Based 图像编辑器 - 项目结构"
echo "=" | awk '{printf "%"80"s\n", $0}' | tr ' ' '='
echo ""

echo "🏠 根目录 (配置文件)"
echo "├── package.json          项目依赖和脚本"
echo "├── tsconfig.json         TypeScript 配置"
echo "├── vite.config.ts        Vite 构建配置"
echo "├── playwright.config.ts  Playwright E2E 配置"
echo "├── index.html            HTML 入口"
echo "└── README.md             项目说明"
echo ""

echo "📚 docs/ (文档)"
echo "├── design/"
echo "│   └── node-base.md      产品设计文档 (1062 行)"
echo "├── test-reports/"
echo "│   ├── TEST_CASES.md     测试用例集合"
echo "│   ├── EDGE_SELECTION_TEST.md  边选中功能测试"
echo "│   └── ..."
echo "└── PROJECT_STRUCTURE.md  项目结构说明"
echo ""

echo "🔧 scripts/ (工具脚本)"
echo "├── debug/                调试脚本 (~40 个)"
echo "│   ├── debug-*.cjs      各种调试工具"
echo "│   └── color-test-*.cjs 颜色测试"
echo "├── test-helpers/         测试辅助 (~36 个)"
echo "│   ├── test-*.cjs       测试脚本"
echo "│   └── check-ui*.cjs    UI 检查"
echo "└── start-prod.sh         生产环境启动"
echo ""

echo "💻 src/ (源代码)"
echo "├── components/           React 组件"
echo "│   ├── canvas/          画布（节点编辑器）"
echo "│   ├── node-library/    节点库面板"
echo "│   ├── properties/      属性面板"
echo "│   ├── preview/         预览面板"
echo "│   └── layout/          布局组件"
echo "├── core/                 核心引擎 (无 UI 依赖)"
echo "│   ├── engine/          执行引擎"
echo "│   ├── gpu/             GPU 渲染 (WebGL 2.0)"
echo "│   ├── nodes/           节点定义 (87 种)"
echo "│   └── codec/           图像编解码"
echo "├── store/                Redux 状态管理"
echo "├── hooks/                React Hooks"
echo "├── shaders/              GLSL Shader 文件"
echo "├── i18n/                 国际化"
echo "└── utils/                工具函数"
echo ""

echo "🧪 tests/ (单元测试)"
echo "├── components/           组件测试"
echo "├── engine/               引擎测试"
echo "├── gpu/                  GPU 测试"
echo "└── ..."
echo ""

echo "🎭 e2e/ (E2E 测试)"
echo "├── comprehensive.spec.ts    综合测试"
echo "├── edge-replacement.spec.ts 边替换测试"
echo "└── ...                      (~18 个测试)"
echo ""

echo "📦 public/ (静态资源)"
echo "├── fonts/                字体文件"
echo "├── templates/            项目模板"
echo "└── test-image.jpg        测试图片"
echo ""

echo "=" | awk '{printf "%"80"s\n", $0}' | tr ' ' '='
echo "📊 统计信息"
echo "=" | awk '{printf "%"80"s\n", $0}' | tr ' ' '='

# 统计源代码文件
SRC_COUNT=$(find src -name "*.ts" -o -name "*.tsx" 2>/dev/null | wc -l | tr -d ' ')
TEST_COUNT=$(find tests -name "*.ts" -o -name "*.tsx" 2>/dev/null | wc -l | tr -d ' ')
E2E_COUNT=$(find e2e -name "*.ts" 2>/dev/null | wc -l | tr -d ' ')
SCRIPT_COUNT=$(find scripts -name "*.cjs" -o -name "*.sh" 2>/dev/null | wc -l | tr -d ' ')
DOC_COUNT=$(find docs -name "*.md" 2>/dev/null | wc -l | tr -d ' ')

echo "源代码文件: $SRC_COUNT 个"
echo "单元测试:   $TEST_COUNT 个"
echo "E2E 测试:   $E2E_COUNT 个"
echo "工具脚本:   $SCRIPT_COUNT 个"
echo "文档:       $DOC_COUNT 个"
echo ""

echo "✨ 整理效果"
echo "根目录文件: 仅配置文件 (整理前: 70+ 个脚本/文档)"
echo "文档分类:   design/ 和 test-reports/"
echo "脚本分类:   debug/ 和 test-helpers/"
echo ""

echo "🚀 快速命令"
echo "npm run dev         启动开发服务器"
echo "npm run test        运行单元测试"
echo "npm run e2e         运行 E2E 测试"
echo "npm run lint        代码检查"
echo "npm run build       构建生产版本"
