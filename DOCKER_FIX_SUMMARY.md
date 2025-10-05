# Docker Build Fix Summary

## Issue
The Docker build was failing at the `packages/types` build stage with the following error:

```
error TS2307: Cannot find module 'zod' or its corresponding type declarations.
ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @zus/types@1.0.0 build: `tsc`
Exit status 2
WARN   Local package.json exists, but node_modules missing, did you mean to install?
```

## Root Cause
The issue occurred because of the Docker multi-stage build process:

1. **deps stage**: Copies package.json files and runs `pnpm install`, which creates proper workspace linkage
2. **build stage**: Copies entire `packages/` and `apps/` directories, **overwriting** the package.json files
3. The overwritten package.json files no longer have the workspace linkage established by pnpm
4. When `pnpm --filter` tries to build, it can't find dependencies because workspace structure is broken

## Solution
After copying source code, restore the package.json files from the `deps` stage to maintain workspace linkage:

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

## Key Points
- pnpm workspaces require package.json files to maintain proper linkage with node_modules
- Copying source code directories in Docker can overwrite these critical files
- Always restore package.json files from the stage where `pnpm install` was run
- This ensures workspace dependencies (like `zod` in `@zus/types`) are properly resolved

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
