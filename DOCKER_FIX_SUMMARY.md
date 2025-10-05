# Docker Build Fix Summary

## ⚠️ NOTE: This document describes an INCOMPLETE fix. See DOCKER_BUILD_FIX_NODE_MODULES.md for the complete solution.

## Issue
The Docker build was failing at the `packages/types` build stage with the following error:

```
error TS2307: Cannot find module 'zod' or its corresponding type declarations.
ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @zus/types@1.0.0 build: `tsc`
Exit status 2
WARN   Local package.json exists, but node_modules missing, did you mean to install?
```

## Root Cause (Incomplete Analysis)
The initial analysis identified that:

1. **deps stage**: Copies package.json files and runs `pnpm install`, which creates proper workspace linkage
2. **build stage**: Copies entire `packages/` and `apps/` directories, **overwriting** the package.json files
3. The overwritten package.json files no longer have the workspace linkage established by pnpm

**However, this analysis was incomplete.** The real issue is that package-level `node_modules` directories were also missing.

## Solution (Incomplete - See DOCKER_BUILD_FIX_NODE_MODULES.md)
The initial fix attempted to restore package.json files from deps stage:

```dockerfile
# Copy source code
COPY packages ./packages
COPY apps ./apps
COPY tsconfig.base.json ./tsconfig.base.json

# Restore package.json files from deps to maintain workspace linkage
COPY --from=deps /app/packages/types/package.json ./packages/types/package.json
COPY --from=deps /app/packages/data/package.json ./packages/data/package.json
COPY --from=deps /app/packages/core/package.json ./packages/core/package.json
COPY --from=deps /app/packages/ui/package.json ./packages/ui/package.json
COPY --from=deps /app/packages/web-engine/package.json ./packages/web-engine/package.json
COPY --from=deps /app/apps/api/package.json ./apps/api/package.json
COPY --from=deps /app/apps/web/package.json ./apps/web/package.json
```

**This was insufficient.** The package-level `node_modules` directories also need to be copied.

## Complete Solution
See **DOCKER_BUILD_FIX_NODE_MODULES.md** for the complete fix which includes:
1. Copying package.json files (above)
2. **Copying package-level node_modules directories** (the missing piece)

The complete fix adds:
```dockerfile
# Copy package-level node_modules with workspace symlinks
COPY --from=deps /app/packages/types/node_modules ./packages/types/node_modules
COPY --from=deps /app/packages/data/node_modules ./packages/data/node_modules
COPY --from=deps /app/packages/core/node_modules ./packages/core/node_modules
COPY --from=deps /app/packages/ui/node_modules ./packages/ui/node_modules
COPY --from=deps /app/packages/web-engine/node_modules ./packages/web-engine/node_modules
COPY --from=deps /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=deps /app/apps/web/node_modules ./apps/web/node_modules
```

## Key Points
- pnpm workspaces require **both** package.json files AND package-level node_modules to work correctly
- Copying source code directories in Docker can overwrite package.json files
- `.dockerignore` excludes `**/node_modules`, so source COPY doesn't include them
- **The complete fix requires restoring BOTH:**
  1. package.json files from deps stage
  2. package-level node_modules directories from deps stage
- This ensures workspace dependencies (like `zod` in `@zus/types`) are properly resolved via symlinks

## Updated Documentation
- **DOCKER_BUILD_FIX_NODE_MODULES.md** - Complete technical explanation
- **DOCKER_FIX_VISUAL.md** - Visual before/after diagrams

## Testing
The fix can be verified by building the Docker image:

```bash
docker build -t zus-sim:test .
```

Or using the provided test script:

```bash
./test-docker.sh zus-sim:test
```

## Alternative Solutions Considered
1. **Copy only src/ directories**: Would require restructuring COPY commands for each package
2. **Run pnpm install in build stage**: Would duplicate installation and slow down builds
3. **Use .dockerignore to exclude package.json**: Would break the initial deps stage

The current solution provides the best balance of clarity, performance, and maintainability.
