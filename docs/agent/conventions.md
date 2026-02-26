# Conventions

Code style, patterns, and conventions specific to this project.

## Import Organization

### Import Order

```typescript
// 1. React imports
import React, { useState, useEffect } from 'react';

// 2. External library imports (alphabetical)
import { useDispatch, useSelector } from 'react-redux';
import { Node, Edge } from 'reactflow';

// 3. Internal imports with @ alias (alphabetical)
import { ExecutionEngine } from '@/core/engine/ExecutionEngine';
import { GPUContext } from '@/core/gpu/GPUContext';
import { NodeRegistry } from '@/core/nodes/NodeRegistry';

// 4. Relative imports (if needed)
import { LocalComponent } from './LocalComponent';

// 5. Type imports (if separated)
import type { NodeTypeDefinition } from '@/core/nodes/types';

// 6. Style imports
import '@/styles/component.css';
```

### Path Alias Usage

**Always use `@/` alias** instead of relative paths:

✅ **Good**:
```typescript
import { ExecutionEngine } from '@/core/engine/ExecutionEngine';
import { useAppSelector } from '@/store/hooks';
```

❌ **Bad**:
```typescript
import { ExecutionEngine } from '../../../core/engine/ExecutionEngine';
import { useAppSelector } from '../../store/hooks';
```

**Exception**: Same-directory or child imports
```typescript
// In src/components/layout/AppLayout.tsx
import { TopToolbar } from './TopToolbar';  // OK (same directory)
```

### Import Grouping

Group related imports together:
```typescript
// Redux
import { useDispatch, useSelector } from 'react-redux';
import { addNode, removeNode } from '@/store/graphSlice';
import { setSelectedNode } from '@/store/uiSlice';

// Core engine
import { ExecutionEngine } from '@/core/engine/ExecutionEngine';
import { DirtyTracker } from '@/core/engine/DirtyTracker';

// GPU
import { GPUContext } from '@/core/gpu/GPUContext';
```

## File Naming Conventions

### Component Files

**PascalCase** for React components:
```
AppLayout.tsx
NodeLibrary.tsx
PropertiesPanel.tsx
CustomNode.tsx
```

### Non-Component Files

**camelCase** for utilities, hooks, types:
```
useEngine.ts
useExecutionManager.ts
debounce.ts
types.ts
```

### Test Files

**Same name + `.test.ts[x]`**:
```
DirtyTracker.ts       → DirtyTracker.test.ts
TopologySorter.ts     → TopologySorter.test.ts
NodeLibrary.tsx       → NodeLibrary.test.tsx
```

### Shader Files

**snake_case** for GLSL files:
```
brightness_contrast.frag
gaussian_blur.frag
fullscreen.vert
```

### Index Files

Use `index.ts` for barrel exports:
```typescript
// src/core/nodes/index.ts
export { NodeRegistry } from './NodeRegistry';
export * from './types';
export * from './input';
export * from './adjust';
```

## TypeScript Conventions

### Type Definitions

**Prefer `interface` for object shapes**:
```typescript
interface NodeTypeDefinition {
  type: string;
  label: string;
  category: string;
  // ...
}
```

**Use `type` for unions, intersections, primitives**:
```typescript
type DataType = 'image' | 'mask' | 'number' | 'color' | 'bbox';
type NodeOutput = ImageOutput | NumberOutput | ColorOutput;
```

### Function Types

**Use arrow function syntax for callbacks**:
```typescript
type OnExecuteCallback = (nodeId: string, result: NodeOutput) => void;
```

**Use function declaration for methods**:
```typescript
interface ShaderManager {
  compileShader(source: string, type: number): WebGLShader;
}
```

### Null vs Undefined

**Use `undefined` for missing values**:
```typescript
function getNode(id: string): Node | undefined {
  return nodes.find(n => n.id === id);
}
```

**Use `null` for intentional absence**:
```typescript
interface ExecutionResult {
  texture: WebGLTexture | null;  // null = intentionally no texture
}
```

### Optional Properties

**Use `?` for optional properties**:
```typescript
interface NodeParams {
  brightness?: number;  // Optional, defaults to 0
  contrast?: number;    // Optional, defaults to 1
}
```

**Use `| undefined` when distinction matters**:
```typescript
interface ExecutionContext {
  result: NodeOutput | undefined;  // Explicitly may be undefined
}
```

### Type Assertions

**Avoid `as` when possible**:

✅ **Good** (type guard):
```typescript
if (node.type === 'brightness_contrast') {
  // TypeScript knows node is BrightnessContrastNode
}
```

❌ **Bad**:
```typescript
const bcNode = node as BrightnessContrastNode;
```

**Use `as` only when TypeScript can't infer**:
```typescript
const canvas = document.getElementById('canvas') as HTMLCanvasElement;
```

## React Conventions

### Component Structure

```typescript
// 1. Imports
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

// 2. Type definitions
interface NodeLibraryProps {
  onNodeSelect: (nodeType: string) => void;
}

// 3. Component
export function NodeLibrary({ onNodeSelect }: NodeLibraryProps) {
  // 3a. Hooks (top of component)
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const dispatch = useDispatch();
  
  // 3b. Effects
  useEffect(() => {
    // ...
  }, [dependencies]);
  
  // 3c. Event handlers
  const handleSearch = (value: string) => {
    setSearch(value);
  };
  
  // 3d. Render
  return (
    <div className="node-library">
      {/* ... */}
    </div>
  );
}
```

### Hooks Order

Follow React's rules of hooks + consistent ordering:

```typescript
// 1. Context hooks
const { t } = useTranslation();

// 2. Redux hooks
const dispatch = useDispatch();
const nodes = useSelector(state => state.graph.nodes);

// 3. State hooks
const [search, setSearch] = useState('');
const [expanded, setExpanded] = useState(true);

// 4. Ref hooks
const canvasRef = useRef<HTMLCanvasElement>(null);

// 5. Effect hooks
useEffect(() => { /* ... */ }, []);

// 6. Custom hooks
const { execute } = useExecutionManager();

// 7. Callback/memo hooks
const handleClick = useCallback(() => { /* ... */ }, []);
const memoizedValue = useMemo(() => { /* ... */ }, []);
```

### Props Destructuring

**Destructure props in function signature**:

✅ **Good**:
```typescript
export function NodeItem({ type, label, onSelect }: NodeItemProps) {
  // ...
}
```

❌ **Bad**:
```typescript
export function NodeItem(props: NodeItemProps) {
  return <div onClick={() => props.onSelect(props.type)}>{props.label}</div>;
}
```

### Event Handlers

**Prefix with `handle`**:
```typescript
const handleClick = () => { /* ... */ };
const handleChange = (value: string) => { /* ... */ };
const handleSubmit = (event: FormEvent) => { /* ... */ };
```

**Use inline functions only for simple cases**:
```typescript
// OK for simple cases
<button onClick={() => setExpanded(!expanded)}>Toggle</button>

// Use useCallback for complex handlers
const handleComplexClick = useCallback(() => {
  // ... complex logic ...
}, [dependencies]);
```

### Conditional Rendering

**Use `&&` for simple conditionals**:
```typescript
{isVisible && <Component />}
```

**Use ternary for if-else**:
```typescript
{isLoading ? <Spinner /> : <Content />}
```

**Use variables for complex conditionals**:
```typescript
const content = (() => {
  if (isLoading) return <Spinner />;
  if (error) return <ErrorMessage error={error} />;
  if (!data) return <EmptyState />;
  return <DataView data={data} />;
})();

return <div>{content}</div>;
```

## Redux Conventions

### Action Naming

**Use present tense verbs**:
```typescript
// In slice
reducers: {
  addNode: (state, action) => { /* ... */ },
  removeNode: (state, action) => { /* ... */ },
  updateNodePosition: (state, action) => { /* ... */ },
}
```

### State Updates

**Use Immer (built into Redux Toolkit)**:
```typescript
// Mutate state directly (Immer handles immutability)
reducers: {
  updateNode: (state, action) => {
    const node = state.nodes.find(n => n.id === action.payload.id);
    if (node) {
      node.data = { ...node.data, ...action.payload.data };
    }
  },
}
```

### Selectors

**Colocate with slice**:
```typescript
// In graphSlice.ts
export const selectNodes = (state: RootState) => state.graph.nodes;
export const selectEdges = (state: RootState) => state.graph.edges;
export const selectNodeById = (state: RootState, id: string) =>
  state.graph.nodes.find(n => n.id === id);
```

**Use `createSelector` for derived data**:
```typescript
import { createSelector } from '@reduxjs/toolkit';

export const selectSelectedNodes = createSelector(
  [selectNodes, (state: RootState) => state.ui.selectedNodeIds],
  (nodes, selectedIds) => nodes.filter(n => selectedIds.includes(n.id))
);
```

## Styling Conventions

### TailwindCSS

**Order classes by category**:
```tsx
<div className={`
  // Layout
  flex flex-col items-center justify-between
  // Spacing
  p-4 m-2 gap-2
  // Sizing
  w-full h-auto
  // Typography
  text-sm font-medium
  // Colors
  bg-gray-100 text-gray-900
  // Borders
  border border-gray-300 rounded-lg
  // Effects
  shadow-md hover:shadow-lg
  // Transitions
  transition-all duration-200
`}>
  {/* ... */}
</div>
```

**Use custom classes sparingly**:
```typescript
// Only for complex styles not expressible in Tailwind
<div className="node-glow-effect">
```

### CSS Modules (if used)

**Not currently used** - project uses TailwindCSS only.

## Error Handling

### Throw Errors for Invalid State

```typescript
if (!inputTexture) {
  throw new Error('Input texture is required');
}

if (width <= 0 || height <= 0) {
  throw new Error(`Invalid dimensions: ${width}x${height}`);
}
```

### Try-Catch for Expected Failures

```typescript
try {
  const result = await loadImage(url);
  return result;
} catch (error) {
  console.error('Failed to load image:', error);
  return null;  // or default value
}
```

### Error Boundaries for React

```typescript
class ErrorBoundary extends React.Component {
  componentDidCatch(error, errorInfo) {
    console.error('Component error:', error, errorInfo);
  }
  
  render() {
    return this.state.hasError ? <ErrorFallback /> : this.props.children;
  }
}
```

## Git Conventions

### Commit Messages

**Use Conventional Commits format**:

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types**:
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style (formatting, semicolons)
- `refactor:` - Code refactoring
- `perf:` - Performance improvements
- `test:` - Test additions/corrections
- `build:` - Build system or dependency changes
- `ci:` - CI configuration changes
- `chore:` - Maintenance tasks

**Examples**:
```
feat(nodes): add gaussian blur node

fix(engine): prevent circular dependency crash

docs(readme): update installation instructions

refactor(gpu): extract texture pooling logic
```

### Branch Naming

**Feature branches**: `feat/feature-name`
```
feat/node-preview
feat/export-png
```

**Bug fix branches**: `fix/bug-description`
```
fix/edge-selection
fix/memory-leak
```

**Chore branches**: `chore/task-name`
```
chore/update-deps
chore/cleanup-tests
```

### Pre-commit Hooks

**Automatically runs** (via Husky):
1. `lint-staged` - Lints and formats staged files
2. `commitlint` - Validates commit message format

**Configuration** (`.husky/pre-commit`):
```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

npx lint-staged
```

**Configuration** (`lint-staged` in package.json):
```json
{
  "*.{ts,tsx}": ["eslint --fix", "prettier --write"],
  "*.{json,css,md}": ["prettier --write"]
}
```

## Code Quality

### Linting

**ESLint configuration** (`.eslintrc.cjs`):
- No warnings allowed (`--max-warnings 0`)
- TypeScript strict mode
- React hooks rules
- React Fast Refresh rules

**Disable rules sparingly**:
```typescript
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const data: any = unknownData;
```

**Better**: Fix the type instead
```typescript
const data: unknown = unknownData;
if (isExpectedType(data)) {
  // TypeScript knows data type here
}
```

### Prettier

**Configuration** (`.prettierrc.json`):
```json
{
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "semi": false,
  "singleQuote": true,
  "trailingComma": "all",
  "bracketSpacing": true,
  "arrowParens": "avoid"
}
```

**Auto-format on save** (recommended):
- VS Code: Install Prettier extension, enable "Format on Save"
- WebStorm: Enable Prettier integration

### TypeScript Strict Mode

**Enabled in `tsconfig.json`**:
```json
{
  "strict": true,
  "noUnusedLocals": true,
  "noUnusedParameters": true,
  "noFallthroughCasesInSwitch": true
}
```

**Follow strict mode rules**:
- No implicit `any`
- No unused variables
- No unused parameters (prefix with `_` if intentional)
- Always handle all switch cases

## Performance Best Practices

### React Performance

**Memoize expensive calculations**:
```typescript
const sortedNodes = useMemo(() => {
  return nodes.sort((a, b) => a.label.localeCompare(b.label));
}, [nodes]);
```

**Memoize callbacks passed to children**:
```typescript
const handleClick = useCallback((id: string) => {
  dispatch(selectNode(id));
}, [dispatch]);
```

**Memoize components**:
```typescript
export const NodeItem = React.memo(function NodeItem({ type, label, onSelect }: NodeItemProps) {
  // ...
});
```

### Redux Performance

**Use specific selectors**:

✅ **Good**:
```typescript
const selectedNode = useSelector(state => state.graph.nodes.find(n => n.selected));
```

❌ **Bad** (unnecessary re-renders):
```typescript
const allNodes = useSelector(state => state.graph.nodes);
const selectedNode = allNodes.find(n => n.selected);
```

**Use `shallowEqual` for object selectors**:
```typescript
import { shallowEqual } from 'react-redux';

const nodeData = useSelector(
  state => state.graph.nodes.find(n => n.id === id)?.data,
  shallowEqual
);
```

### GPU Performance

**Minimize texture uploads/downloads**:
```typescript
// ✅ Good: Keep data on GPU
const texture1 = gpu.uploadTexture(imageData);
const texture2 = gpu.renderShader({ ... });
const texture3 = gpu.renderShader({ ... });
const result = gpu.downloadTexture(texture3);  // Only final download

// ❌ Bad: Unnecessary downloads
const texture1 = gpu.uploadTexture(imageData);
const result1 = gpu.downloadTexture(texture1);  // Unnecessary
const texture2 = gpu.uploadTexture(result1);    // Unnecessary
```

**Reuse textures**:
```typescript
// Texture manager handles this automatically
const texture = textureManager.createTexture(512, 512);
// ... use texture ...
textureManager.releaseTexture(texture);  // Returns to pool
```

## Documentation

### JSDoc Comments

**Use JSDoc for public APIs**:
```typescript
/**
 * Renders a shader to a texture.
 * 
 * @param options - Shader rendering options
 * @returns Object containing the output texture
 * @throws Error if shader compilation fails
 */
renderShader(options: ShaderRenderOptions): { texture: WebGLTexture } {
  // ...
}
```

**Omit for obvious functions**:
```typescript
// No JSDoc needed (self-explanatory)
function getNodeById(id: string): Node | undefined {
  return nodes.find(n => n.id === id);
}
```

### README and Docs

**Keep AGENTS.md minimal** (<60 lines)
- Only essential information
- Link to detailed docs in `docs/agent/`

**Detailed docs in `docs/agent/`**:
- One file per major topic
- Include code examples
- Link to relevant files

**Update docs when code changes**:
- New feature → Update architecture.md
- New npm script → Update development_commands.md
- New test pattern → Update testing.md

## Anti-Patterns to Avoid

### 1. Prop Drilling

❌ **Bad**:
```typescript
<GrandParent nodeId={nodeId}>
  <Parent nodeId={nodeId}>
    <Child nodeId={nodeId} />
  </Parent>
</GrandParent>
```

✅ **Good**: Use Redux or Context
```typescript
// In Child component
const nodeId = useSelector(state => state.ui.selectedNodeId);
```

### 2. Large Components

❌ **Bad**: 500-line component with 10 responsibilities

✅ **Good**: Split into smaller components
```typescript
<NodeLibrary>
  <NodeSearch />
  <NodeCategories>
    <NodeCategory>
      <NodeItem />
    </NodeCategory>
  </NodeCategories>
</NodeLibrary>
```

### 3. Inline Object/Array Creation

❌ **Bad** (creates new object on every render):
```typescript
<Component style={{ margin: 10 }} />
```

✅ **Good**:
```typescript
const style = { margin: 10 };
<Component style={style} />
```

Or use Tailwind:
```typescript
<Component className="m-10" />
```

### 4. Excessive State

❌ **Bad**:
```typescript
const [nodes, setNodes] = useState([]);
const [selectedNode, setSelectedNode] = useState(null);
const [selectedNodeData, setSelectedNodeData] = useState(null);  // Derived!
```

✅ **Good**:
```typescript
const nodes = useSelector(state => state.graph.nodes);
const selectedNodeId = useSelector(state => state.ui.selectedNodeId);
const selectedNode = nodes.find(n => n.id === selectedNodeId);  // Derive
```

### 5. Ignoring TypeScript Errors

❌ **Bad**:
```typescript
// @ts-ignore
const result = someFunction(wrongType);
```

✅ **Good**: Fix the type error
```typescript
const result = someFunction(correctType);
```
