# 边选中和删除功能测试说明

## 功能概述

节点之间的连线现在支持：
1. **选中状态**：点击连线可以选中，选中后连线颜色变为红色，线条变粗
2. **删除按钮**：选中后在连线中间显示删除按钮（红色圆形，× 符号）
3. **删除操作**：点击删除按钮或按 Delete/Backspace 键删除选中的连线

## 手动测试步骤

### 1. 启动开发服务器
```bash
npm run dev
```

### 2. 在浏览器中打开
访问 http://localhost:3000

### 3. 测试选中功能
1. 初始状态应该有一条从"纯色填充"到"预览输出"的绿色连线
2. **点击连线**：连线应该变成红色，线条变粗（从 2px 到 3px）
3. **删除按钮出现**：在连线中间应该出现一个红色圆形删除按钮，里面有 × 符号
4. **点击画布空白处**：连线恢复绿色，删除按钮消失

### 4. 测试删除功能（方法一：点击按钮）
1. 点击连线选中
2. 点击中间的删除按钮
3. 连线应该消失

### 5. 测试删除功能（方法二：键盘）
1. 点击连线选中
2. 按 Delete 或 Backspace 键
3. 连线应该消失

### 6. 测试多条连线
1. 在节点库中添加多个节点
2. 创建多条连线
3. 分别选中不同的连线，验证只有选中的连线显示删除按钮
4. 删除一条连线，其他连线不受影响

## 预期效果

### 未选中状态
- 连线颜色：绿色 (#00b894)
- 线条粗细：2px
- 无删除按钮

### 选中状态
- 连线颜色：红色 (#ff6b6b)
- 线条粗细：3px
- 显示红色圆形删除按钮（直径 24px）
- 删除按钮位于连线中点

### 删除按钮样式
- 背景色：红色 (#ef4444)
- 悬停时：深红色 (#dc2626)
- 大小：24x24px
- 圆形
- 白色 × 符号
- 有阴影效果

## 技术实现

### 修改的文件

1. **新建 CustomEdge.tsx**
   - 自定义边组件
   - 根据 selected 状态改变样式
   - 选中时显示删除按钮
   - 使用 EdgeLabelRenderer 渲染删除按钮

2. **更新 NodeCanvas.tsx**
   - 导入 CustomEdge 和 EdgeTypes
   - 注册 edgeTypes
   - 设置 defaultEdgeOptions type 为 'custom'

3. **更新 AppLayout.tsx**
   - 创建新边时使用 type: 'custom'
   - 边选中状态已经通过 edgesWithSelection 处理

4. **更新 graphSlice.ts**
   - 初始边的 type 改为 'custom'

5. **更新测试文件**
   - tests/edge-selection.test.ts：edge type 改为 'custom'

## 常见问题

### Q: 删除按钮不显示？
A: 确保点击了连线使其选中，只有选中状态才显示删除按钮

### Q: 连线颜色没变化？
A: 检查浏览器控制台是否有错误，刷新页面重试

### Q: 键盘删除不工作？
A: 确保焦点在画布上，不在其他输入框中

## 代码示例

### CustomEdge 组件核心代码
```typescript
<BaseEdge
  path={edgePath}
  markerEnd={markerEnd}
  style={{
    strokeWidth: selected ? 3 : 2,
    stroke: selected ? '#ff6b6b' : '#00b894',
  }}
/>
<EdgeLabelRenderer>
  {selected && (
    <button onClick={onEdgeDelete}>×</button>
  )}
</EdgeLabelRenderer>
```

### 注册自定义边类型
```typescript
const edgeTypes: EdgeTypes = {
  custom: CustomEdge,
};

<ReactFlow edgeTypes={edgeTypes} ... />
```
