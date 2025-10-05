# Docker Build Fix: Package-Level node_modules

## Problem

The Docker build was failing at the `packages/types` build stage with:

```
error TS2307: Cannot find module 'zod' or its corresponding type declarations.
ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @zus/types@1.0.0 build: `tsc`
Exit status 2
WARN   Local package.json exists, but node_modules missing, did you mean to install?
```

## Root Cause Analysis

### pnpm Workspace Architecture

When `pnpm install` runs in a workspace, it creates:

1. **Root node_modules**: Contains all packages in `.pnpm` directory
2. **Package-level node_modules**: Contains symlinks to dependencies

Example structure after `pnpm install`:
```
/app/
├── node_modules/
│   └── .pnpm/
│       └── zod@3.22.4/
│           └── node_modules/
│               └── zod/
└── packages/
    └── types/
        ├── package.json         # Declares "zod": "^3.22.4"
        ├── node_modules/        # ← CRITICAL!
        │   └── zod -> ../../../node_modules/.pnpm/zod@3.22.4/node_modules/zod
        └── src/
```

### The Docker Build Problem

The Dockerfile had the following sequence:

```dockerfile
# deps stage - Creates workspace structure
RUN pnpm install --frozen-lockfile  # ✓ Creates package-level node_modules

# build stage
COPY --from=deps /app/node_modules ./node_modules        # ✓ Root node_modules copied
COPY --from=deps /app/package.json ./package.json        # ✓ Root package.json copied
COPY packages ./packages                                 # ✗ PROBLEM: .dockerignore excludes **/node_modules
COPY --from=deps /app/packages/types/package.json ./...  # ✓ Restores package.json
# ✗ Package-level node_modules are MISSING!
```

The issue is `.dockerignore` contains:
```
**/node_modules
```

So when `COPY packages ./packages` runs, it copies source code but **excludes all node_modules directories**.

Then even though we restore package.json files, the package-level node_modules directories with their critical symlinks are still missing!

### Why This Breaks pnpm

pnpm expects to find dependencies either:
1. In package-level node_modules (via symlinks) ← **MISSING**
2. Via workspace protocol resolution

When the package-level node_modules is missing, pnpm cannot resolve dependencies and TypeScript compilation fails.

## Solution

After copying source code and restoring package.json files, **also restore the package-level node_modules directories** from the deps stage:

```dockerfile
# Copy source code
COPY packages ./packages
COPY apps ./apps

# Restore package.json files from deps to maintain workspace linkage
COPY --from=deps /app/packages/types/package.json ./packages/types/package.json
# ... (all other package.json files)

# Copy package-level node_modules with workspace symlinks ← NEW!
COPY --from=deps /app/packages/types/node_modules ./packages/types/node_modules
COPY --from=deps /app/packages/data/node_modules ./packages/data/node_modules
COPY --from=deps /app/packages/core/node_modules ./packages/core/node_modules
COPY --from=deps /app/packages/ui/node_modules ./packages/ui/node_modules
COPY --from=deps /app/packages/web-engine/node_modules ./packages/web-engine/node_modules
COPY --from=deps /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=deps /app/apps/web/node_modules ./apps/web/node_modules
```

## Why This Works

1. **deps stage**: `pnpm install` creates complete workspace structure including package-level node_modules
2. **build stage**: Source code is copied (excluding node_modules via .dockerignore)
3. **Restoration**: Both package.json AND node_modules are copied from deps stage
4. **Result**: pnpm can resolve all workspace dependencies via the symlinks

## Verification

To verify the fix works, check that after copying node_modules, the symlinks are preserved:

```bash
# In the build stage, this should succeed:
ls -la packages/types/node_modules/zod
# Should show: zod -> ../../../node_modules/.pnpm/zod@3.22.4/node_modules/zod
```

## Alternative Solutions Considered

### 1. Copy only src/ directories
**Rejected**: Would require restructuring all COPY commands and is fragile

### 2. Run pnpm install in build stage
**Rejected**: Duplicates installation, wastes build time and cache

### 3. Modify .dockerignore to exclude only top-level node_modules
**Rejected**: Would copy unnecessary node_modules from source into build context, increasing build time

### 4. Use pnpm deploy or pnpm --prod
**Rejected**: Changes the deployment strategy significantly, requires more changes

## Impact

- ✅ Docker build now succeeds
- ✅ All workspace dependencies resolved correctly  
- ✅ No changes to runtime behavior
- ✅ Build performance maintained (no extra `pnpm install`)
- ✅ Works for all packages with dependencies

## Related Files

- `Dockerfile`: Updated with package-level node_modules COPY commands
- `.dockerignore`: Contains `**/node_modules` exclusion (unchanged)
- `DOCKER_FIX_SUMMARY.md`: Previous fix attempt (only restored package.json)
- `DOCKER_BUILD_VISUAL_FIX.md`: Visual explanation of previous fix attempt
