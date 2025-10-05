# Docker Build Fix - Visual Flow

## 🔴 BEFORE (Broken Build)

```
┌─────────────────────────────────────────────────────────────────┐
│ STAGE 1: deps                                                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. COPY package.json files                                     │
│     ✓ packages/types/package.json                              │
│                                                                 │
│  2. RUN pnpm install --frozen-lockfile                         │
│     ✓ Creates: /app/node_modules/                             │
│     ✓ Creates: /app/packages/types/node_modules/              │
│        └── zod -> ../../../node_modules/.pnpm/zod@3.22.4/...  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ STAGE 2: build                                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. COPY --from=deps /app/node_modules                         │
│     ✓ Root node_modules copied                                 │
│                                                                 │
│  2. COPY --from=deps /app/package.json                         │
│     ✓ Root package.json copied                                 │
│                                                                 │
│  3. COPY packages ./packages                                    │
│     ⚠️  .dockerignore excludes **/node_modules                 │
│     ✓ Source files copied                                      │
│     ✗ packages/types/node_modules NOT copied                   │
│                                                                 │
│  4. COPY --from=deps package.json files                        │
│     ✓ Restores packages/types/package.json                     │
│     ✗ Still missing packages/types/node_modules/               │
│                                                                 │
│  5. RUN pnpm --filter ./packages/types build                   │
│     ✗ ERROR: Cannot find module 'zod'                          │
│     ✗ pnpm can't resolve workspace dependencies                │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## 🟢 AFTER (Fixed Build)

```
┌─────────────────────────────────────────────────────────────────┐
│ STAGE 1: deps                                                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. COPY package.json files                                     │
│     ✓ packages/types/package.json                              │
│                                                                 │
│  2. RUN pnpm install --frozen-lockfile                         │
│     ✓ Creates: /app/node_modules/                             │
│     ✓ Creates: /app/packages/types/node_modules/              │
│        └── zod -> ../../../node_modules/.pnpm/zod@3.22.4/...  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ STAGE 2: build                                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. COPY --from=deps /app/node_modules                         │
│     ✓ Root node_modules copied                                 │
│                                                                 │
│  2. COPY --from=deps /app/package.json                         │
│     ✓ Root package.json copied                                 │
│                                                                 │
│  3. COPY packages ./packages                                    │
│     ⚠️  .dockerignore excludes **/node_modules                 │
│     ✓ Source files copied                                      │
│     ✗ packages/types/node_modules NOT copied                   │
│                                                                 │
│  4. COPY --from=deps package.json files                        │
│     ✓ Restores packages/types/package.json                     │
│                                                                 │
│  5. COPY --from=deps node_modules directories  ← 🆕 FIX!       │
│     ✓ Restores packages/types/node_modules/                    │
│     ✓ Symlinks to zod preserved                                │
│                                                                 │
│  6. RUN pnpm --filter ./packages/types build                   │
│     ✓ SUCCESS: zod found via workspace symlinks                │
│     ✓ TypeScript compilation succeeds                          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## 📋 Key Changes

### Dockerfile Addition (After line 39)

```dockerfile
# Copy package-level node_modules with workspace symlinks
COPY --from=deps /app/packages/types/node_modules ./packages/types/node_modules
COPY --from=deps /app/packages/data/node_modules ./packages/data/node_modules
COPY --from=deps /app/packages/core/node_modules ./packages/core/node_modules
COPY --from=deps /app/packages/ui/node_modules ./packages/ui/node_modules
COPY --from=deps /app/packages/web-engine/node_modules ./packages/web-engine/node_modules
COPY --from=deps /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=deps /app/apps/web/node_modules ./apps/web/web/node_modules
```

## 🔍 Root Cause

### The Problem Chain

1. `.dockerignore` contains `**/node_modules` (line 2)
   - Prevents copying node_modules from source into build context
   - This is correct behavior for normal builds

2. `COPY packages ./packages` copies from **build context** (source code)
   - Build context has no node_modules (excluded by .dockerignore)
   - Only source files are copied

3. Previous fix restored `package.json` files from deps stage
   - But didn't restore the `node_modules` directories
   - Package.json without node_modules = broken workspace

4. pnpm workspace relies on package-level node_modules
   - These contain symlinks to actual packages
   - Without them, pnpm can't resolve dependencies

### Why Package-Level node_modules Matter

pnpm creates this structure:

```
packages/types/
├── package.json           # Declares: "zod": "^3.22.4"
├── node_modules/          # Created by pnpm install
│   ├── .bin/              # Binaries
│   ├── typescript -> ...  # Symlink to root node_modules
│   └── zod -> ...         # Symlink to root node_modules
└── src/
    └── *.ts               # Uses: import { z } from 'zod'
```

When TypeScript compiles, Node's module resolution:
1. Looks for `zod` in `packages/types/node_modules/`
2. Finds symlink → follows to actual package
3. Resolution succeeds

Without package-level `node_modules/`:
1. Looks for `zod` in `packages/types/node_modules/` → ❌ not found
2. Tries to resolve via workspace → ❌ no workspace metadata
3. Resolution fails → TypeScript error

## ✅ Verification

After the fix, verify symlinks are preserved:

```bash
# In Docker build stage
ls -la /app/packages/types/node_modules/zod
# Should show: zod -> ../../../node_modules/.pnpm/zod@3.22.4/node_modules/zod

# Test build
pnpm --filter ./packages/types build
# Should succeed
```

## 📚 Related Documentation

- `DOCKER_BUILD_FIX_NODE_MODULES.md` - Detailed technical explanation
- `Dockerfile` - Implementation with COPY commands
- `.dockerignore` - Shows `**/node_modules` exclusion
