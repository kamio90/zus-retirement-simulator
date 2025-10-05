# Docker Build Fix: Missing Zod Dependency

## Problem

The Docker build was failing during the API TypeScript compilation with the following errors:

```
src/controllers/scenariosController.ts(6,26): error TS2307: Cannot find module 'zod' or its corresponding type declarations.
src/controllers/simulateController.ts(4,26): error TS2307: Cannot find module 'zod' or its corresponding type declarations.
src/controllers/v2WizardController.ts(6,26): error TS2307: Cannot find module 'zod' or its corresponding type declarations.
```

## Root Cause

The API controllers (`scenariosController.ts`, `simulateController.ts`, `v2WizardController.ts`) were importing `ZodError` directly from the `zod` package:

```typescript
import { ZodError } from 'zod';
```

However, `zod` was NOT declared as a dependency in `apps/api/package.json`. It only existed as a dependency of `@zus/types`.

### Why It Worked Locally

In local development with pnpm workspaces:
- Dependencies are hoisted and shared across packages
- `zod` was accessible through the workspace structure
- TypeScript could resolve transitive dependencies

### Why It Failed in Docker

In the Docker multi-stage build:
- Dependencies are installed in isolation in the `deps` stage
- The `build` stage copies `node_modules` directories explicitly
- pnpm's strict dependency isolation means transitive dependencies aren't guaranteed to be accessible
- Without `zod` as a direct dependency, the API package couldn't find it during compilation

## Solution

Added `zod` as a direct dependency to `apps/api/package.json`:

```json
{
  "dependencies": {
    // ... other dependencies
    "uuid": "^9.0.0",
    "zod": "^3.22.4"  // ← Added
  }
}
```

## Why This Is The Correct Fix

1. **Follows Dependency Best Practices**: Packages should explicitly declare all direct dependencies
2. **Consistent with pnpm Philosophy**: pnpm enforces strict dependency boundaries
3. **Works in All Environments**: Local development, CI/CD, and Docker builds
4. **Minimal Change**: Only adds one dependency declaration

## Verification

- ✅ Local build works: `pnpm --filter ./apps/api build`
- ✅ All packages build: `pnpm build`
- ✅ Simulated Docker build succeeds
- ✅ `zod` now properly linked in `apps/api/node_modules/`

## Files Changed

1. `apps/api/package.json` - Added `zod` dependency
2. `pnpm-lock.yaml` - Updated lockfile

## Related Issues

This fix resolves the Docker build failure reported in issue #73 where the Render deployment was failing with TypeScript compilation errors.
