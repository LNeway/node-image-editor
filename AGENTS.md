# AGENTS.md

This file provides guidance to takumi when working with code in this repository.

## WHY: Purpose and Goals

**Node Image Editor** - 面向专业设计师和开发者的非破坏性图像编辑器。通过节点连线构建 GPU 加速的图像处理管线，所有操作可追溯、可调整、可复用。

## WHAT: Technical Stack

- **Runtime**: TypeScript 5.3.3 (ES2020, strict mode)
- **Framework**: React 18.2 + Redux Toolkit 2.0
- **Node Editor**: React Flow 11.10 for graph visualization
- **GPU Pipeline**: WebGL 2.0 (custom, no Three.js) + GLSL shaders
- **CSS Framework**: TailwindCSS 3.4
- **Build Tool**: Vite 5.0 with vite-plugin-glsl (port 3000)
- **Testing**: Vitest (unit) + Playwright (E2E)
- **I18n**: i18next (English + Chinese)

## HOW: Core Development Workflow

```bash
# Development
npm run dev              # Start Vite dev server (port 3000)

# Code Quality (ALWAYS RUN BEFORE COMMIT)
npm run check            # Runs: typecheck + lint + test:run
npm run lint:fix         # Auto-fix linting issues
npm run format           # Auto-format code with Prettier

# Testing
npm run test             # Interactive watch mode with UI
npm run test:run         # Run once (CI mode)
npm run e2e              # Run E2E tests (headless)

# Build
npm run build            # TypeScript compile + production bundle
```

## Key Concepts

**Data Types**: Image (🟢), Mask (⚪), Number (🔵), Color (🟡), BBox (🟠)  
**Execution**: Dirty-tracking + Topology sort + 100ms debounce + GPU offscreen rendering  
**Node Categories**: input, adjust, filter, transform, composite, channel, mask, text, output, utility

## Progressive Disclosure

For detailed information, consult these documents as needed:

- `docs/design/node-base.md` - **Product spec & technical design** (1062 lines)
- `docs/agent/development_commands.md` - All build, test, lint commands
- `docs/agent/architecture.md` - Module structure and execution engine design
- `docs/agent/testing.md` - Test setup, frameworks, and conventions
- `docs/agent/gpu_pipeline.md` - WebGL shader system and texture management
- `docs/agent/conventions.md` - Code style, import patterns, git hooks

**When working on a task, first determine which documentation is relevant, then read only those files.**
