# ZUS Retirement Simulator - Setup Guide

## Prerequisites

- **Node.js** >= 20.x
- **pnpm** >= 9.x (install with `npm install -g pnpm` or use `corepack enable`)

## Installation

```bash
# Clone the repository
git clone https://github.com/kamio90/zus-retirement-simulator.git
cd zus-retirement-simulator

# Install dependencies
pnpm install

# Build all packages (REQUIRED before running dev)
pnpm build
```

> **Important:** Always run `pnpm build` after installing dependencies and before running development servers. This compiles the workspace packages that are required by the applications.

## Project Structure

This is a pnpm workspace monorepo with the following structure:

```
/
├── apps/
│   ├── api/          # Express + TypeScript backend
│   └── web/          # React + Vite frontend
├── packages/
│   ├── core/         # Pension calculation engine
│   ├── data/         # JSON data snapshots from XLSX
│   ├── types/        # Shared TypeScript types and schemas (@zus/types)
│   └── ui/           # Shared React components
├── tools/
│   └── scripts/      # Build automation and data conversion
└── data/             # Source XLSX and PDF documents
```

## Available Commands

### Root Level Commands

```bash
# Build all packages
pnpm build

# Lint all packages
pnpm lint

# Format all packages
pnpm format

# Run tests across all packages
pnpm test

# Run both API and web in dev mode
pnpm dev
```

### Package-Specific Commands

```bash
# Build a specific package
pnpm --filter ./packages/core build
pnpm --filter ./apps/api build

# Run tests in a specific package
pnpm --filter ./packages/core test

# Run dev server for API
pnpm --filter ./apps/api dev

# Run dev server for web
pnpm --filter ./apps/web dev
```

## TypeScript Configuration

The project uses **strict TypeScript** with the following settings:
- `strict: true`
- `noImplicitAny: true`
- `strictNullChecks: true`
- `module: CommonJS`
- `moduleResolution: Node`

### Path Aliases

The following path aliases are configured:
- `@zus/core/*` → `packages/core/src/*`
- `@zus/data/*` → `packages/data/src/*`
- `@zus/types/*` → `packages/types/src/*`
- `@zus/ui/*` → `packages/ui/src/*`

**Note:** The types package is named `@zus/types` (not `@types`) to avoid conflicts with npm's `@types` scope for type definitions.

## Workspace Dependencies

Packages can depend on each other using `workspace:*`:

```json
{
  "dependencies": {
    "@zus/types": "workspace:*"
  }
}
```

## pnpm Configuration

The project uses a `.npmrc` file to configure pnpm hoisting:

```
shamefully-hoist=true
public-hoist-pattern[]=*@types*
```

This ensures that TypeScript type definitions from `@types/*` packages are properly available across all workspaces.

## ESLint & Prettier

All packages share the root ESLint and Prettier configuration:
- ESLint with TypeScript plugin and strict rules
- Prettier with consistent formatting
- Automatic import sorting and unused import removal

## Building for Production

```bash
# Build all packages in dependency order
pnpm build

# Build API only
pnpm --filter ./apps/api build

# Build web frontend only
pnpm --filter ./apps/web build
```

## Troubleshooting

### Error: Cannot find module '@zus/data' or '@zus/core'

This error occurs when you try to run `pnpm dev` without building the packages first. The workspace packages need to be compiled before the applications can use them.

**Solution:**
```bash
# Build all packages
pnpm build

# Then run dev servers
pnpm dev
```

The build step only needs to be run once after `pnpm install`, unless you modify source code in the packages.

### Type definitions not found

If you get errors about missing type definitions:
1. Make sure `pnpm install` completed successfully
2. Check that `.npmrc` exists with the hoisting configuration
3. Try removing `node_modules` and reinstalling: `rm -rf node_modules && pnpm install`

### Path aliases not resolving

Path aliases are configured in `tsconfig.base.json` and should work for all packages. If they don't:
1. Make sure your package's `tsconfig.json` extends `../../tsconfig.base.json`
2. Check that `baseUrl` is set to `.` (project root)
3. Restart your TypeScript language server

### Build fails with missing files

Make sure you've built dependencies first. For example, if `api` depends on `@zus/types`, build types first:
```bash
pnpm --filter ./packages/types build
pnpm --filter ./apps/api build
```

Or use the root build command which handles dependency order:
```bash
pnpm build
```

## CI/CD Pipeline

The project uses GitHub Actions for continuous integration and deployment:

### Workflows

#### CI Workflow (`ci.yml`)
Runs on every push and pull request to `main` and `develop` branches:
- **Lint**: Checks code quality with ESLint
- **Build**: Compiles all TypeScript packages
- **Test**: Runs Jest tests across packages

#### PR Checks Workflow (`pr-checks.yml`)
Additional validation for pull requests:
- **Formatting Check**: Verifies code formatting with Prettier
- **Dependency Review**: Scans for vulnerable dependencies

#### CodeQL Workflow (`codeql.yml`)
Security analysis:
- Runs on push, PR, and weekly schedule
- Scans JavaScript/TypeScript code for security vulnerabilities

### Branch Protection

For production-ready setup, configure branch protection rules on GitHub:

1. Navigate to **Settings → Branches → Branch protection rules**
2. Add rule for `main` branch:
   - ✅ Require status checks to pass before merging
   - ✅ Require branches to be up to date before merging
   - Select required checks: `Lint`, `Build`, `Test`
   - ✅ Require pull request reviews before merging (1 approval)
   - ✅ Dismiss stale pull request approvals when new commits are pushed

### CI Cache Strategy

The workflows use pnpm store caching to speed up builds:
- Cache key based on `pnpm-lock.yaml` hash
- Typical CI run time: 2-3 minutes with cache
- First run (no cache): 5-7 minutes

## Next Steps

1. Review the [architecture documentation](./docs/architecture.md)
2. Check the [ZUS pension calculation rules](./data/RULES_ZUS_SymulatorEmerytalny.pdf)
3. See the [API documentation](./apps/api/README.md)
4. Review the [development workflow](./docs/development.md)

## License

See LICENSE file in the repository root.
