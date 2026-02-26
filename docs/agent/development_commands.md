# Development Commands

Complete reference for all available npm scripts and development workflows.

## Development Server

```bash
npm run dev              # Start Vite dev server on port 3000 with HMR
npm run preview          # Preview production build locally
```

## Build Commands

```bash
npm run build            # Compile TypeScript → Build production bundle to dist/
npm run structure        # Display project structure overview (bash scripts/show-structure.sh)
```

## Code Quality

### Type Checking

```bash
npm run typecheck        # TypeScript type check without emitting files (tsc --noEmit)
```

### Linting

```bash
npm run lint             # Check code quality (strict mode, 0 warnings allowed)
npm run lint:fix         # Auto-fix linting issues
```

**ESLint Configuration**:
- Max warnings: 0 (strict enforcement)
- Extensions checked: `.ts`, `.tsx`
- Flags: `--report-unused-disable-directives`

### Formatting

```bash
npm run format           # Auto-format code files with Prettier
npm run format:check     # Check formatting without making changes
```

**Prettier Configuration**:
- Line width: 100 characters
- Tabs: 2 spaces
- Semicolons: No
- Quotes: Single
- Targets: `src/**/*.{ts,tsx}`, `public/**/*`

### Complete Quality Check

```bash
npm run check            # Runs: typecheck + lint + test:run
```

**Use this before commits** to ensure all quality checks pass.

## Testing

### Unit Tests (Vitest)

```bash
npm run test             # Interactive watch mode with UI
npm run test:run         # Run once (CI mode)
npm run test:ui          # Open Vitest UI dashboard
npm run test:coverage    # Generate code coverage report (v8 provider)
```

**Test Configuration**:
- Framework: Vitest 1.1.0
- Environment: JSDOM (DOM simulation)
- Test files: `tests/**/*.test.ts[x]`
- Setup file: `src/test/setup.ts` (mocks WebGL, ImageData)
- Coverage: Reports in text, json, html formats

### End-to-End Tests (Playwright)

```bash
npm run e2e              # Run E2E tests (headless)
npm run e2e:ui           # Run E2E tests with interactive UI
```

**Playwright Configuration**:
- Browsers: Chrome, Firefox, Safari (all desktop engines)
- Test files: `e2e/**/*.spec.ts`
- Server: Auto-starts dev server on port 3000
- Reports: HTML report (generated automatically)

## Git Hooks (Husky)

The project uses Husky for automated quality checks:

```bash
npm run prepare          # Install git hooks (runs automatically on npm install)
```

### Pre-commit Hook

Runs `lint-staged` on staged files:
- `*.ts`, `*.tsx` → `eslint --fix` → `prettier --write`
- `*.json`, `*.css`, `*.md` → `prettier --write`

### Commit Message Hook

Validates commit messages using Conventional Commits format:
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, semicolons, etc.)
- `refactor:` - Code refactoring
- `perf:` - Performance improvements
- `test:` - Test additions or corrections
- `build:` - Build system or dependency changes
- `ci:` - CI configuration changes
- `chore:` - Other changes (maintenance tasks)

## Development Workflow

### Standard Workflow

```bash
# 1. Start development server
npm run dev

# 2. Make changes
# ... edit code ...

# 3. Run quality checks
npm run check            # typecheck + lint + test:run

# 4. Auto-fix issues (if needed)
npm run lint:fix
npm run format

# 5. Run E2E tests (if UI changes)
npm run e2e:ui

# 6. Commit (git hooks auto-run)
git add .
git commit -m "feat: add new feature"
```

### Quick Iteration Workflow

```bash
# Keep test watcher running
npm run test

# In another terminal, run dev server
npm run dev

# Make changes and tests auto-run
# ... edit code ...
```

## Debugging Scripts

The project includes 70+ debugging and testing helper scripts:

- `scripts/debug/` - 40 debug scripts for testing individual components
- `scripts/test-helpers/` - 36 test helper scripts

These are useful for isolated component testing during development.

## Port Configuration

- Development server: **3000** (configurable in vite.config.ts)
- Preview server: Uses Vite's default port
- Playwright tests: Auto-connects to port 3000

## Build Output

```bash
npm run build
# Output: dist/
# ├── index.html
# ├── assets/
# │   ├── index-[hash].js
# │   ├── index-[hash].css
# │   └── [shader files]
# └── [other static files]
```

Includes:
- Minified JavaScript bundles
- CSS bundles
- Source maps (for debugging)
- Shader files
- Static assets
