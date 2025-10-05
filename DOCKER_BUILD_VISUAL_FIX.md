# Docker Build Process: Before vs After Fix

## ❌ BEFORE (Broken)

```
┌─────────────────────────────────────────────────────────────┐
│ Stage 1: deps                                               │
│ ─────────────────────────────────────────────────────────  │
│ 1. COPY package.json files                                 │
│    → packages/types/package.json (with zod dependency)     │
│ 2. RUN pnpm install --frozen-lockfile                      │
│    → Creates node_modules with workspace links             │
│    → packages/types can access zod via workspace           │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ Stage 2: build                                              │
│ ─────────────────────────────────────────────────────────  │
│ 1. COPY --from=deps node_modules                           │
│    → ✅ Workspace-linked node_modules copied               │
│                                                             │
│ 2. COPY packages ./packages                                │
│    → ❌ OVERWRITES package.json files!                     │
│    → Workspace linkage BROKEN                              │
│                                                             │
│ 3. RUN pnpm --filter ./packages/types build                │
│    → ❌ Error: Cannot find module 'zod'                    │
│    → pnpm sees package.json but no workspace link          │
└─────────────────────────────────────────────────────────────┘
```

## ✅ AFTER (Fixed)

```
┌─────────────────────────────────────────────────────────────┐
│ Stage 1: deps                                               │
│ ─────────────────────────────────────────────────────────  │
│ 1. COPY package.json files                                 │
│    → packages/types/package.json (with zod dependency)     │
│ 2. RUN pnpm install --frozen-lockfile                      │
│    → Creates node_modules with workspace links             │
│    → packages/types can access zod via workspace           │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ Stage 2: build                                              │
│ ─────────────────────────────────────────────────────────  │
│ 1. COPY --from=deps node_modules                           │
│    → ✅ Workspace-linked node_modules copied               │
│                                                             │
│ 2. COPY packages ./packages                                │
│    → Copies source code (overwrites package.json)          │
│                                                             │
│ 3. COPY --from=deps package.json files                     │
│    → ✅ RESTORES workspace-linked package.json files       │
│    → Workspace linkage PRESERVED                           │
│                                                             │
│ 4. RUN pnpm --filter ./packages/types build                │
│    → ✅ Success! zod found via workspace                   │
│    → TypeScript compilation succeeds                       │
└─────────────────────────────────────────────────────────────┘
```

## Key Insight

The package.json files in the `deps` stage have **workspace metadata** that pnpm uses to resolve dependencies. When these files are overwritten by `COPY packages ./packages`, that metadata is lost.

**Solution:** Copy source code first, then restore the workspace-linked package.json files from deps.

## Impact

- ✅ Docker build now succeeds
- ✅ All workspace dependencies resolved correctly
- ✅ No changes to runtime behavior
- ✅ Build performance maintained (no extra `pnpm install`)
- ✅ Works for all packages with workspace dependencies

## Files Modified

```diff
# Dockerfile
+ # Restore package.json files from deps to maintain workspace linkage
+ COPY --from=deps /app/packages/types/package.json ./packages/types/package.json
+ COPY --from=deps /app/packages/data/package.json ./packages/data/package.json
+ COPY --from=deps /app/packages/core/package.json ./packages/core/package.json
+ COPY --from=deps /app/packages/ui/package.json ./packages/ui/package.json
+ COPY --from=deps /app/packages/web-engine/package.json ./packages/web-engine/package.json
+ COPY --from=deps /app/apps/api/package.json ./apps/api/package.json
+ COPY --from=deps /app/apps/web/package.json ./apps/web/package.json
```
