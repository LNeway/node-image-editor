#!/bin/bash

# 移动设计文档
mv node-base.md docs/design/ 2>/dev/null

# 移动测试报告
mv TEST_CASES.md docs/test-reports/ 2>/dev/null
mv TEST_RECORD.md docs/test-reports/ 2>/dev/null
mv TEST_RESULT_ADJUST.md docs/test-reports/ 2>/dev/null
mv TEST_RESULT_INPUT.md docs/test-reports/ 2>/dev/null
mv test-report.md docs/test-reports/ 2>/dev/null
mv EDGE_SELECTION_TEST.md docs/test-reports/ 2>/dev/null

# 移动调试脚本
mv debug-*.cjs scripts/debug/ 2>/dev/null
mv color-test-*.cjs scripts/debug/ 2>/dev/null

# 移动测试辅助脚本
mv check-ui*.cjs scripts/test-helpers/ 2>/dev/null
mv test-*.cjs scripts/test-helpers/ 2>/dev/null

# 移动生产启动脚本到 scripts
mv start-prod.sh scripts/ 2>/dev/null

echo "文件整理完成！"
echo ""
echo "目录结构："
echo "├── docs/"
echo "│   ├── design/          # 设计文档"
echo "│   └── test-reports/    # 测试报告"
echo "├── scripts/"
echo "│   ├── debug/           # 调试脚本"
echo "│   ├── test-helpers/    # 测试辅助脚本"
echo "│   └── start-prod.sh    # 生产环境启动脚本"
