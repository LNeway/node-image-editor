# Testing

Complete guide to testing infrastructure, frameworks, and conventions.

## Test Strategy Overview

The project uses a two-tier testing approach:

1. **Unit Tests (Vitest)** - Fast, isolated component and logic tests
2. **End-to-End Tests (Playwright)** - Full user workflow validation

## Unit Testing (Vitest)

### Configuration

**Framework**: Vitest 1.1.0 (Vite-native test runner)

**Key settings** (in `vite.config.ts`):
```typescript
test: {
  globals: true,
  environment: 'jsdom',        // DOM simulation
  setupFiles: './src/test/setup.ts',
  coverage: {
    provider: 'v8',
    reporter: ['text', 'json', 'html']
  }
}
```

**Environment**: JSDOM (simulates browser DOM in Node.js)

### Test File Organization

```
tests/
├── basic.test.ts               # Sanity check (8 lines)
├── edge-selection.test.ts      # Edge selection features
├── edge-replacement.test.ts    # Connection replacement logic
├── engine/
│   ├── DirtyTracker.test.ts   # Dirty tracking algorithm
│   └── TopologySorter.test.ts # Dependency ordering
├── gpu/
│   └── gpu-pipeline.test.ts   # GPU rendering pipeline
├── hooks/
│   └── useExecutionManager.test.tsx  # React hooks
└── [other test files]
```

**Naming convention**: `*.test.ts` or `*.test.tsx`

### Test Setup File

**Location**: `src/test/setup.ts`

**Purpose**: Mock browser APIs not available in JSDOM

**Mocks**:
- WebGL context (`getContext('webgl2')`)
- ImageData constructor
- Canvas operations
- Other browser-specific APIs

Example:
```typescript
// Mock WebGL2 context
HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
  // ... WebGL methods
}));

// Mock ImageData
global.ImageData = class ImageData {
  // ... implementation
};
```

### Running Unit Tests

```bash
# Interactive watch mode with UI
npm run test

# Run once (CI mode)
npm run test:run

# Open Vitest UI dashboard
npm run test:ui

# Generate coverage report
npm run test:coverage
```

**Watch mode features**:
- Auto-runs tests on file changes
- Shows test results in terminal
- Press `h` for help menu
- Press `a` to run all tests
- Press `f` to run only failed tests

**Coverage reports**:
- Terminal: Text summary
- HTML: Opens in browser with line-by-line coverage
- JSON: Machine-readable format

### Writing Unit Tests

**Import test utilities**:
```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
```

**Example test structure**:
```typescript
describe('DirtyTracker', () => {
  it('should mark node as dirty', () => {
    const tracker = new DirtyTracker();
    tracker.markDirty('node1', 'param_changed');
    
    expect(tracker.isDirty('node1')).toBe(true);
  });

  it('should mark downstream nodes dirty', () => {
    const tracker = new DirtyTracker();
    const edges = [{ source: 'node1', target: 'node2' }];
    
    tracker.markDownstreamDirty('node1', edges);
    
    expect(tracker.isDirty('node2')).toBe(true);
  });
});
```

**React component testing**:
```typescript
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { store } from '@/store';

describe('NodeLibrary', () => {
  it('should render node categories', () => {
    render(
      <Provider store={store}>
        <NodeLibrary />
      </Provider>
    );
    
    expect(screen.getByText('Input')).toBeInTheDocument();
    expect(screen.getByText('Adjust')).toBeInTheDocument();
  });
});
```

### Testing Patterns

**1. Engine Tests** - Focus on execution logic
- Dirty tracking correctness
- Topological sort edge cases
- Execution order validation

**2. GPU Tests** - Mock WebGL calls
- Shader compilation success/failure
- Texture creation and disposal
- Framebuffer operations

**3. Component Tests** - User interaction
- Render without crashing
- Click handlers work
- Props update UI correctly

**4. Hook Tests** - React hook behavior
- State updates on graph changes
- Effect cleanup
- Execution triggers

### Mocking Strategies

**Mock Redux store**:
```typescript
import { configureStore } from '@reduxjs/toolkit';
import graphReducer from '@/store/graphSlice';

const mockStore = configureStore({
  reducer: {
    graph: graphReducer,
  },
});
```

**Mock WebGL context**:
```typescript
const mockGPUContext = {
  renderShader: vi.fn(),
  createTexture: vi.fn(),
  dispose: vi.fn(),
};
```

**Mock execution engine**:
```typescript
vi.mock('@/core/engine/ExecutionEngine', () => ({
  ExecutionEngine: {
    getInstance: vi.fn(() => ({
      execute: vi.fn(),
      onExecute: vi.fn(),
    })),
  },
}));
```

## End-to-End Testing (Playwright)

### Configuration

**Framework**: Playwright 1.40.1

**Key settings** (in `playwright.config.ts`):
```typescript
{
  testDir: './e2e',
  timeout: 30000,
  use: {
    baseURL: 'http://localhost:3000',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  webServer: {
    command: 'npm run dev',
    port: 3000,
    reuseExistingServer: !process.env.CI,
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
}
```

**Browsers**: Chrome, Firefox, Safari (all desktop engines)

### Test File Organization

```
e2e/
├── example.spec.ts             # Basic example (27 lines)
├── comprehensive.spec.ts       # Full workflow test
├── edge-replacement.spec.ts    # Connection features
├── [15 other test files]       # Specific feature tests
```

**Naming convention**: `*.spec.ts`

### Running E2E Tests

```bash
# Run all E2E tests (headless)
npm run e2e

# Interactive UI mode
npm run e2e:ui
```

**Headless mode**:
- Runs in background (no browser window)
- Outputs test results to terminal
- Generates HTML report on failure

**UI mode**:
- Opens Playwright inspector
- Step through tests visually
- Debug test failures
- Record new tests

### Writing E2E Tests

**Import Playwright utilities**:
```typescript
import { test, expect } from '@playwright/test';
```

**Example test structure**:
```typescript
test.describe('Node creation', () => {
  test('should create brightness/contrast node', async ({ page }) => {
    await page.goto('/');
    
    // Wait for app to load
    await page.waitForSelector('[data-testid="node-library"]');
    
    // Drag node from library to canvas
    const nodeItem = page.locator('text=Brightness/Contrast');
    await nodeItem.dragTo(page.locator('[data-testid="canvas"]'));
    
    // Verify node appears on canvas
    await expect(page.locator('.react-flow__node')).toBeVisible();
  });
});
```

**Common patterns**:

**1. Application loading**:
```typescript
test('should load application', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('[data-testid="app-layout"]')).toBeVisible();
});
```

**2. Node library interaction**:
```typescript
test('should filter nodes by search', async ({ page }) => {
  await page.goto('/');
  await page.fill('[data-testid="node-search"]', 'blur');
  
  await expect(page.locator('text=Gaussian Blur')).toBeVisible();
  await expect(page.locator('text=Brightness/Contrast')).not.toBeVisible();
});
```

**3. Parameter adjustment**:
```typescript
test('should adjust brightness parameter', async ({ page }) => {
  // Create node
  await createBrightnessNode(page);
  
  // Select node
  await page.click('.react-flow__node');
  
  // Adjust slider in properties panel
  await page.locator('[data-param="brightness"]').fill('0.5');
  
  // Verify preview updates
  await expect(page.locator('[data-testid="preview-canvas"]')).toHaveScreenshot();
});
```

**4. Edge creation**:
```typescript
test('should connect two nodes', async ({ page }) => {
  await createNode(page, 'Solid Color', 100, 100);
  await createNode(page, 'Brightness/Contrast', 300, 100);
  
  // Drag from output port to input port
  await page.dragAndDrop(
    '[data-handleid="color-output"]',
    '[data-handleid="brightness-input"]'
  );
  
  // Verify edge appears
  await expect(page.locator('.react-flow__edge')).toBeVisible();
});
```

**5. Export functionality**:
```typescript
test('should export image', async ({ page }) => {
  // Set up graph and execute
  await setupImageProcessingGraph(page);
  
  // Click export button
  const downloadPromise = page.waitForEvent('download');
  await page.click('[data-testid="export-button"]');
  const download = await downloadPromise;
  
  // Verify download occurred
  expect(download.suggestedFilename()).toMatch(/\.png$/);
});
```

### Visual Regression Testing

Playwright supports screenshot comparison:

```typescript
test('should render blur effect correctly', async ({ page }) => {
  await setupBlurTest(page);
  
  // Take screenshot and compare
  await expect(page.locator('[data-testid="preview"]')).toHaveScreenshot('blur-output.png', {
    maxDiffPixels: 100,  // Allow small differences
  });
});
```

**Screenshot storage**:
- Baseline: `e2e/[test-name]-snapshots/`
- Actual: Test artifacts directory
- Diff: Highlighted differences on mismatch

## Test Coverage Goals

**Unit test coverage targets**:
- Core engine: >90%
- GPU pipeline: >80%
- Redux slices: >85%
- UI components: >70%
- Hooks: >80%

**E2E test coverage**:
- Critical user workflows: 100%
- Node creation/deletion: All node types
- Parameter adjustment: Representative nodes
- Edge connection/deletion: All connection types
- Export functionality: All formats

## Continuous Integration

Tests run automatically in CI pipeline:

```bash
# CI test command
npm run check  # typecheck + lint + test:run
npm run e2e    # Playwright tests (headless)
```

**CI configuration** (e.g., GitHub Actions):
```yaml
- name: Run tests
  run: npm run check

- name: Run E2E tests
  run: npm run e2e

- name: Upload coverage
  uses: codecov/codecov-action@v3
```

## Debugging Tests

### Vitest Debugging

**Use `console.log`** in tests:
```typescript
it('should debug', () => {
  console.log('Value:', someValue);
  expect(someValue).toBe(expected);
});
```

**Use Vitest UI**:
```bash
npm run test:ui
```
- Click on test to see details
- View console output
- Inspect test results

**Use debugger**:
```typescript
it('should debug with breakpoint', () => {
  debugger;  // Breakpoint here
  expect(someValue).toBe(expected);
});
```

Then run: `node --inspect-brk node_modules/.bin/vitest`

### Playwright Debugging

**Use `page.pause()`**:
```typescript
test('debug test', async ({ page }) => {
  await page.goto('/');
  await page.pause();  // Opens inspector
});
```

**Use Playwright inspector**:
```bash
npm run e2e:ui
```
- Step through each action
- Inspect element selectors
- View screenshots/videos

**Use `trace: 'on'`** in config:
```typescript
use: {
  trace: 'on',  // Records trace for all tests
}
```

Then view trace: `npx playwright show-trace trace.zip`

## Test Data Management

**Test fixtures** (for E2E):
- Sample images: `e2e/fixtures/images/`
- Test graphs: `e2e/fixtures/graphs/`
- Expected outputs: `e2e/fixtures/expected/`

**Mock data** (for unit tests):
- Sample nodes: `tests/fixtures/nodes.ts`
- Sample edges: `tests/fixtures/edges.ts`
- Sample parameters: `tests/fixtures/params.ts`

## Common Test Failures

### Unit Tests

**1. WebGL context not available**
- Ensure `src/test/setup.ts` mocks WebGL properly
- Check JSDOM environment is set

**2. Redux store not initialized**
- Wrap component in `<Provider store={store}>`
- Use mock store for isolated tests

**3. Import path errors**
- Check `@/` alias is configured in `vite.config.ts`
- Verify `tsconfig.json` has correct path mapping

### E2E Tests

**1. Element not found**
- Use `page.waitForSelector()` before interacting
- Check `data-testid` attributes exist
- Verify selector specificity

**2. Timeout errors**
- Increase timeout: `test.setTimeout(60000)`
- Wait for network idle: `await page.waitForLoadState('networkidle')`
- Use explicit waits: `await page.waitForTimeout(1000)`

**3. Flaky tests**
- Avoid `page.waitForTimeout()` (use `waitForSelector` instead)
- Wait for animations to complete
- Use `expect.poll()` for eventual consistency

## Best Practices

### Unit Tests

1. **Test behavior, not implementation** - Focus on inputs/outputs
2. **Keep tests isolated** - No shared state between tests
3. **Use descriptive names** - `should update brightness when slider changes`
4. **Mock external dependencies** - Don't test WebGL, test your code
5. **Test edge cases** - Null values, empty arrays, boundary conditions

### E2E Tests

1. **Test user workflows** - Complete scenarios, not individual buttons
2. **Use data-testid** - Stable selectors that don't break on CSS changes
3. **Wait for stability** - Elements visible, network idle, animations done
4. **Keep tests independent** - Each test should work in isolation
5. **Use page objects** - Reusable functions for common actions

## Performance Optimization

### Unit Tests

- Run in parallel (Vitest default)
- Mock heavy operations (GPU, network)
- Use shallow rendering when possible
- Skip unnecessary setup

### E2E Tests

- Reuse browser context when safe
- Run in parallel across browsers
- Use `reuseExistingServer` in dev
- Skip visual tests for non-visual changes

## Test Maintenance

**When to update tests**:
- Feature changes → Update related tests
- Bug fixes → Add regression test
- Refactoring → Verify tests still pass
- API changes → Update mocks

**When to delete tests**:
- Feature removed → Delete related tests
- Test is redundant → Consolidate with other test
- Test is flaky and unfixable → Fix or delete

**When to skip tests**:
- Known bug → `test.skip('bug #123', ...)`
- Platform-specific → `test.skipIf(process.platform === 'win32', ...)`
- Work in progress → `test.todo('implement feature', ...)`
