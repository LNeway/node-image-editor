# Architecture

Comprehensive guide to the project's architecture, design patterns, and module organization.

## System Architecture (5-Layer Stack)

```
┌─────────────────────────────────────┐
│   UI Layer (React Components)       │  50+ components in src/components/
├─────────────────────────────────────┤
│   State Layer (Redux Store)         │  5 slices + middleware
├─────────────────────────────────────┤
│   Node System (12 registered types) │  Input/Adjust/Filter/Transform/Composite/Output
├─────────────────────────────────────┤
│   Execution Engine                  │  DirtyTracker + TopologySorter + Scheduler
│   - 100ms debounce on changes       │
│   - Topological sorting for deps    │
├─────────────────────────────────────┤
│   GPU Pipeline (WebGL 2.0)          │  ShaderManager + TextureManager + Framebuffer
└─────────────────────────────────────┘
```

## Data Flow

```
User Action (click, drag, type)
    ↓
Redux Action → Dispatch
    ↓
Reducer Updates State (nodes, edges, UI)
    ↓
ExecutionEngine Listener Triggered
    ↓
DirtyTracker marks affected nodes
    ↓
100ms Debounce (prevents excessive recalculation)
    ↓
TopologySorter orders nodes by dependencies
    ↓
For each dirty node (in sorted order):
  - Collect inputs from upstream nodes
  - Call NodeTypeDefinition.execute()
  - GPU renders shader to output texture
  - Store result in nodeResults map
    ↓
PreviewPanel updates with final result
PropertiesPanel updates node preview
```

## Design Patterns

| Pattern | Implementation | Location |
|---------|---|---|
| **Singleton** | ExecutionEngine (lazy initialized) | `src/core/engine/ExecutionEngine.ts` |
| **Registry Pattern** | NodeRegistry for type definitions | `src/core/nodes/NodeRegistry.ts` |
| **Middleware** | Redux history middleware | `src/store/middleware/historyMiddleware.ts` |
| **Factory** | createGPUContext | `src/core/gpu/GPUContext.ts` |
| **Observer** | Engine callbacks for execution results | ExecutionEngine.onExecute() |
| **Dependency Injection** | GPUContext injected to nodes | ExecutionContext.gpu |

## Module Organization

### Core Layer (`src/core/`)

Non-UI engine code that powers the node processing system.

#### Execution Engine (`src/core/engine/`)

- **ExecutionEngine.ts** (225 lines) - Orchestrates node execution
  - Singleton instance
  - Manages execution lifecycle
  - Triggers dirty tracking and topology sorting
  - 100ms debounce for performance
  
- **DirtyTracker.ts** - Tracks which nodes need re-execution
  - Marks individual nodes dirty
  - Marks downstream dependencies dirty
  - Prevents unnecessary recalculations
  
- **TopologySorter.ts** - Orders nodes by dependencies
  - Ensures upstream nodes execute first
  - Detects circular dependencies
  - Provides execution order array

#### GPU Pipeline (`src/core/gpu/`)

WebGL 2.0 rendering pipeline (no Three.js).

- **GPUContext.ts** (400 lines) - Main GPU API
  - WebGL context initialization
  - Canvas management
  - Cleanup and disposal
  
- **ShaderManager.ts** - Shader lifecycle
  - Compiles vertex/fragment shaders
  - Links programs
  - Manages uniform locations
  - Shader caching
  
- **TextureManager.ts** - Texture pooling
  - Texture creation and upload
  - Automatic reuse (limit: 30 textures)
  - Garbage collection
  - Download texture data to CPU
  
- **FramebufferManager.ts** - Offscreen rendering
  - Framebuffer creation
  - Render-to-texture
  - Multiple render targets

#### Node System (`src/core/nodes/`)

12+ node type definitions organized by category.

- **NodeRegistry.ts** (36 lines) - Central registration
  - Maps node type IDs to definitions
  - `registerNode()`, `getNodeDefinition()`, `getAllNodeTypes()`

- **types.ts** (50 lines) - Core interfaces
  ```typescript
  interface NodeTypeDefinition {
    type: string;                    // Unique ID
    label: string;                   // i18n key
    category: string;                // Category (input/adjust/filter/etc)
    inputs: PortDefinition[];        // Input ports
    outputs: PortDefinition[];       // Output ports
    params: ParamDefinition[];       // Parameters
    getOutputSize?: (inputs, params) => { width, height };
    execute: (context) => Record<string, NodeOutput>;
  }
  ```

**Node Categories**:
- `input/` - Image sources (import, solid color, noise)
- `adjust/` - Color/tone adjustments (brightness, contrast, hue, saturation)
- `filter/` - Visual effects (blur, sharpen, noise)
- `transform/` - Geometric transformations (rotate, scale, crop)
- `composite/` - Layer blending (normal, multiply, overlay)
- `channel/` - Color channel operations (split, merge)
- `mask/` - Mask generation (threshold, edge detection)
- `text/` - Text rendering
- `output/` - Export/preview
- `utility/` - Helper nodes

Example node: `adjust/BrightnessContrastNode.ts` (85 lines)
1. Defines inputs (image), outputs (image), params (brightness, contrast)
2. `execute()` calls `gpu.renderShader()` with GLSL shader
3. Returns output texture

#### Other Core Modules

- **codec/** - Image encode/decode abstraction
- **graph/** - Graph data structures

### State Layer (`src/store/`)

Redux Toolkit state management with 5 slices.

- **index.ts** (36 lines) - Store configuration
  ```typescript
  configureStore({
    reducer: {
      graph,      // nodes, edges
      ui,         // selected nodes, panel states
      history,    // undo/redo stacks
      project,    // current project metadata
      settings,   // user preferences
    },
    middleware: [historyMiddleware]
  })
  ```

- **graphSlice.ts** (100 lines) - Graph structure
  - Nodes (id, type, position, data)
  - Edges (id, source, target, sourceHandle, targetHandle)
  - Actions: addNode, removeNode, updateNode, addEdge, removeEdge

- **uiSlice.ts** - UI state
  - Selected nodes/edges
  - Panel visibility
  - Zoom/pan position

- **historySlice.ts** - Undo/redo
  - Past/future stacks
  - State snapshots
  
- **projectSlice.ts** - Project metadata
  - Project name
  - File path
  - Modification status

- **settingsSlice.ts** - User preferences
  - Language (en/zh)
  - Theme
  - Performance settings

- **middleware/historyMiddleware.ts** - Time-travel debugging
  - Captures state snapshots
  - Manages undo/redo stacks

All reducers use Immer (mutate inside, immutable outside).

### UI Layer (`src/components/`)

50+ React components organized by function.

```
components/
├── layout/
│   ├── AppLayout.tsx       # Main layout structure
│   └── TopToolbar.tsx      # Toolbar with controls (undo, redo, export)
├── canvas/
│   ├── NodeCanvas.tsx      # ReactFlow wrapper (drag, zoom, pan)
│   ├── CustomNode.tsx      # Node appearance
│   ├── CustomEdge.tsx      # Connection styling
│   └── ContextMenu.tsx     # Right-click menu (delete, duplicate)
├── node-library/
│   ├── NodeLibrary.tsx     # Left sidebar
│   ├── NodeCategory.tsx    # Category accordion
│   ├── NodeItem.tsx        # Draggable node item
│   └── NodeSearch.tsx      # Search/filter nodes
├── properties/
│   ├── PropertiesPanel.tsx # Right sidebar
│   └── params/             # Parameter UI components
│       ├── SliderParam.tsx
│       ├── ColorParam.tsx
│       ├── SelectParam.tsx
│       ├── CheckboxParam.tsx
│       ├── NumberParam.tsx
│       └── FileParam.tsx
├── preview/
│   └── PreviewPanel.tsx    # Canvas preview (final output)
├── history/                # Undo/redo panel
└── common/                 # Shared UI components
```

### Hooks Layer (`src/hooks/`)

Custom React hooks for engine integration.

- **useEngine.ts** - ExecutionEngine integration
  - Initializes engine singleton
  - Sets up GPU context
  - Subscribes to execution events
  
- **useExecutionManager.ts** - Execution state management
  - Triggers execution on graph changes
  - Handles execution results
  - Updates preview panel

### Shader Layer (`src/shaders/`)

GLSL shader files organized by category.

- **glsl.d.ts** - Type definitions for imported shaders
  ```typescript
  declare module '*.frag' {
    const shader: string;
    export default shader;
  }
  declare module '*.vert' {
    const shader: string;
    export default shader;
  }
  ```

- **common/** - Shared shaders
  - `fullscreen.vert` - Full-screen quad vertex shader
  - `copy_texture.frag` - Texture copy shader

- **adjust/** - Adjustment shaders
  - `brightness_contrast.frag`
  - `hue_saturation.frag`

- **filter/** - Effect shaders
  - `gaussian_blur.frag`
  - `sharpen.frag`

- **composite/** - Blending shaders
  - `blend.frag` (supports 10+ blend modes)

Shaders are imported as ES modules via `vite-plugin-glsl`:
```typescript
import fragmentShader from '@/shaders/adjust/brightness_contrast.frag';
```

## Port & Data Type System

Node ports support 5 data types with strict typing:

```typescript
type DataType = 'image' | 'mask' | 'number' | 'color' | 'bbox';
```

**Connection Rules**:
- One output can connect to many inputs (1:N)
- One input accepts only one connection (N:1 blocked)
- Type mismatches prevent connections
- Auto-type-conversion for compatible types

**Port Colors** (TailwindCSS custom theme):
- `image`: #00b894 (green)
- `mask`: #dfe6e9 (white)
- `number`: #0984e3 (blue)
- `color`: #fdcb6e (yellow)
- `bbox`: #e17055 (orange)

## Performance Optimizations

### 1. Dirty Tracking Strategy

Instead of re-executing all nodes on every change:
```typescript
markNodeDirty(nodeId, reason);           // Mark this node dirty
markDownstreamDirty(nodeId, edges);      // Mark dependent nodes
```

**Benefits**:
- Fast incremental updates
- Minimal GPU operations
- Prevents cascading calculations

### 2. Execution Debouncing

100ms debounce on graph changes prevents excessive re-execution during:
- Parameter dragging (slider adjustments)
- Rapid node creation/deletion
- Multiple connection changes

### 3. Texture Pooling

TextureManager reuses textures to avoid GPU allocation overhead:
- Default limit: 30 textures
- Automatic garbage collection
- LRU eviction policy

### 4. Shader Compilation Caching

ShaderManager compiles each shader only once:
- Programs cached by shader source hash
- Uniform locations cached
- Avoids redundant compilation

## Import Alias System

TypeScript path mapping configured in `tsconfig.json`:
```json
{
  "baseUrl": ".",
  "paths": {
    "@/*": ["src/*"]
  }
}
```

Vite resolves `@` to `src/`:
```typescript
import { NodeRegistry } from '@/core/nodes/NodeRegistry';
import fragmentShader from '@/shaders/adjust/brightness_contrast.frag';
```

## Internationalization (i18n)

Language support via i18next:

- **Supported languages**: English (`en`), Chinese (`zh`)
- **Translation files**: `src/i18n/en.json`, `src/i18n/zh.json`
- **Usage**:
  ```typescript
  const { t } = useTranslation();
  <label>{t('node.adjust.brightness')}</label>
  ```

Node labels use i18n keys:
```typescript
{
  type: 'brightness_contrast',
  label: 'node.adjust.brightness_contrast',  // i18n key
  // ...
}
```

## Configuration Files

- **tsconfig.json** - TypeScript configuration
  - Target: ES2020
  - Module: ESNext
  - Strict mode enabled
  - Path aliases: `@/*` → `src/*`

- **vite.config.ts** - Build configuration
  - Port: 3000
  - Plugins: React JSX (SWC), GLSL
  - Alias: `@` → `src/`

- **tailwind.config.js** - CSS framework
  - Dark theme
  - Custom port colors
  - Extended color palette

- **eslint.cjs** - Linting rules
  - ESLint recommended
  - TypeScript recommended
  - React Hooks rules
  - No warnings allowed

- **prettier.config.js** - Code formatting
  - 100 char line width
  - 2-space tabs
  - Single quotes
  - No semicolons

## Build Configuration

Vite build outputs to `dist/`:
- **ES modules** (not CommonJS)
- **Source maps** for debugging
- **Minified JavaScript**
- **CSS extraction**
- **Asset optimization**

Build target: Modern browsers (ES2020+)
- Chrome 87+
- Firefox 78+
- Safari 14+

## Existing Documentation

The project already has comprehensive documentation:

- **README.md** (303 lines) - Project overview, architecture, features
- **docs/design/node-base.md** (1062 lines) - Detailed product design specification
- **docs/PROJECT_STRUCTURE.md** (229 lines) - Directory organization, naming conventions
- **docs/ORGANIZE_SUMMARY.md** (355 lines) - Project reorganization history
- **docs/test-reports/** - Test cases, reports, and execution records

Refer to these documents for:
- Product requirements and features
- Detailed UI/UX specifications
- Historical context on code organization
- Test case specifications
