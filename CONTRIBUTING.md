# Contributing to ZUS Retirement Simulator

Thank you for your interest in contributing to the ZUS Retirement Simulator! This guide will help you get started.

## Getting Started

### Prerequisites

- **Node.js** >= 20.x (see `.nvmrc` or `.node-version`)
- **pnpm** >= 9.x

```bash
# Install pnpm globally
npm install -g pnpm

# Or use corepack (recommended)
corepack enable
corepack prepare pnpm@9.12.0 --activate
```

### Initial Setup

1. **Fork and Clone**
   ```bash
   git clone https://github.com/YOUR_USERNAME/zus-retirement-simulator.git
   cd zus-retirement-simulator
   ```

2. **Install Dependencies**
   ```bash
   pnpm install
   ```

3. **Build All Packages**
   ```bash
   pnpm build
   ```

4. **Verify Setup**
   ```bash
   pnpm lint && pnpm build && pnpm test
   ```

## Development Workflow

### 1. Create a Branch

```bash
# Create a feature branch
git checkout -b feature/your-feature-name

# Or a bugfix branch
git checkout -b fix/bug-description
```

### 2. Make Your Changes

- Follow existing code style (TypeScript strict mode)
- Add tests for new features
- Update documentation as needed
- Keep changes focused and atomic

### 3. Test Your Changes

```bash
# Run linting
pnpm lint

# Fix formatting issues
pnpm format

# Build all packages
pnpm build

# Run tests
pnpm test
```

### 4. Commit Your Changes

We follow conventional commit messages:

```bash
# Feature
git commit -m "feat(core): add quarterly valorization logic"

# Bug fix
git commit -m "fix(api): correct pension calculation for edge case"

# Documentation
git commit -m "docs: update API endpoint documentation"

# Refactor
git commit -m "refactor(types): simplify SimulationResult interface"
```

**Commit Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks
- `perf`: Performance improvements

### 5. Push and Create Pull Request

```bash
# Push to your fork
git push origin feature/your-feature-name

# Create pull request on GitHub
```

## Pull Request Guidelines

### Before Submitting

- ✅ All tests pass locally
- ✅ Code is properly formatted (`pnpm format`)
- ✅ No linting errors (`pnpm lint`)
- ✅ Build succeeds (`pnpm build`)
- ✅ Documentation is updated
- ✅ Commits follow conventional format

### PR Description

Include:
1. **What** - What changes are being made?
2. **Why** - Why are these changes needed?
3. **How** - How were the changes implemented?
4. **Testing** - How were the changes tested?

Example:
```markdown
## What
Add support for delayed retirement calculations

## Why
Users need to simulate pension amounts when retiring later than standard age

## How
- Extended calculation engine to handle age delays
- Added new coefficient tables from ZUS data
- Updated API endpoint to accept optional delay parameter

## Testing
- Added unit tests for delay scenarios
- Tested with real ZUS data examples
- Verified against official ZUS calculator
```

### CI Checks

Your PR must pass all automated checks:

1. ✅ **Lint** - Code quality and style
2. ✅ **Build** - Successful compilation
3. ✅ **Test** - All tests passing (when available)
4. ✅ **Dependency Review** - No security vulnerabilities
5. ✅ **CodeQL** - Security analysis

See [.github/CI_SETUP.md](.github/CI_SETUP.md) for details.

## Code Standards

### TypeScript

- **Strict mode enabled** - No implicit `any`
- **Explicit return types** for functions
- **No unused variables** - ESLint will catch these
- **Consistent naming:**
  - `camelCase` for variables and functions
  - `PascalCase` for types and interfaces
  - `UPPER_CASE` for constants

### Project Structure

```
packages/
├── core/           # Pure calculation logic (no external deps)
├── data/           # Data layer (JSON snapshots)
├── types/          # Shared TypeScript definitions
└── ui/             # Shared React components

apps/
├── api/            # Express REST API
└── web/            # React frontend
```

### Path Aliases

Use configured path aliases:
```typescript
// ✅ Good
import { calculatePension } from '@core';
import { SimulateInput } from '@types';

// ❌ Avoid
import { calculatePension } from '../../packages/core/src';
```

### Data Sources

- **Never hardcode values** - Always import from `@data`
- All constants from `/data/*.xlsx` files
- Reference official ZUS documentation

## Testing

### Unit Tests

```bash
# Run all tests
pnpm test

# Run tests for specific package
pnpm --filter @zus/core test

# Watch mode
pnpm --filter @zus/core test -- --watch
```

### Test Standards

- Test edge cases
- Use real ZUS data examples
- Mock external dependencies
- Keep tests focused and readable

## Documentation

### Code Documentation

- **JSDoc comments** for public APIs
- **Inline comments** for complex logic (Polish allowed for domain concepts)
- **README files** in each package

### User Documentation

Update when you:
- Add new features
- Change APIs
- Modify calculation logic
- Update dependencies

## Monorepo Commands

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm build

# Build specific package
pnpm --filter @zus/core build

# Run all tests
pnpm test

# Lint all code
pnpm lint

# Format all code
pnpm format

# Run both API and web
pnpm dev
```

## Troubleshooting

### Build Issues

```bash
# Clean and rebuild
rm -rf node_modules packages/*/dist apps/*/dist
pnpm install
pnpm build
```

### Type Errors

```bash
# Rebuild types package first
pnpm --filter @zus/types build
pnpm build
```

### Path Alias Issues

Ensure your package's `tsconfig.json` extends `../../tsconfig.base.json`

## Getting Help

- 📖 Check [SETUP.md](SETUP.md) for detailed setup
- 🔧 Review [.github/CI_SETUP.md](.github/CI_SETUP.md) for CI/CD
- 🏗️ See [.github/PIPELINE_ARCHITECTURE.md](.github/PIPELINE_ARCHITECTURE.md) for architecture
- 📊 Read ZUS rules in `/data/RULES_ZUS_SymulatorEmerytalny.pdf`
- 💬 Open a discussion for questions
- 🐛 Report bugs via GitHub Issues

## Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Focus on the problem, not the person
- Help create a welcoming environment

## License

By contributing, you agree that your contributions will be licensed under the same license as the project.

---

**Thank you for contributing to ZUS Retirement Simulator! 🎉**

*For HackYeah 2025 - ZUS Challenge*
