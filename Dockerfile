# ---- Base with pnpm (Node 20) ----
FROM node:20-alpine AS base
ENV PNPM_HOME="/pnpm" PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@9.12.0 --activate
WORKDIR /app

# ---- Install dependencies with workspace support ----
FROM base AS deps
COPY pnpm-lock.yaml package.json pnpm-workspace.yaml ./
# Copy only manifests to maximize cache hits
COPY packages/types/package.json ./packages/types/package.json
COPY packages/data/package.json ./packages/data/package.json
COPY packages/core/package.json ./packages/core/package.json
COPY packages/ui/package.json ./packages/ui/package.json
COPY packages/web-engine/package.json ./packages/web-engine/package.json
COPY apps/api/package.json ./apps/api/package.json
COPY apps/web/package.json ./apps/web/package.json
RUN pnpm install --frozen-lockfile

# ---- Build (SPA + API) ----
FROM base AS build
# Copy dependencies
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/package.json ./package.json
COPY --from=deps /app/pnpm-workspace.yaml ./pnpm-workspace.yaml

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

# Copy package-level node_modules with workspace symlinks
COPY --from=deps /app/packages/types/node_modules ./packages/types/node_modules
COPY --from=deps /app/packages/data/node_modules ./packages/data/node_modules
COPY --from=deps /app/packages/core/node_modules ./packages/core/node_modules
COPY --from=deps /app/packages/ui/node_modules ./packages/ui/node_modules
COPY --from=deps /app/packages/web-engine/node_modules ./packages/web-engine/node_modules
COPY --from=deps /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=deps /app/apps/web/node_modules ./apps/web/node_modules

# Build packages in correct order
RUN pnpm --filter ./packages/data build
RUN pnpm --filter ./packages/types build
RUN pnpm --filter ./packages/core build
RUN pnpm --filter ./packages/ui build
RUN pnpm --filter ./packages/web-engine build

# Build frontend (use relative /api to avoid CORS)
ENV VITE_API_BASE_URL=/api
RUN pnpm --filter ./apps/web build

# Build API (TypeScript -> JS)
RUN pnpm --filter ./apps/api build

# ---- Production runtime ----
FROM node:20-alpine AS runner
WORKDIR /app

# Copy runtime deps (simple, reliable path for hackathon)
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/package.json ./package.json
COPY --from=deps /app/pnpm-workspace.yaml ./pnpm-workspace.yaml

# Compiled API
COPY --from=build /app/apps/api/dist ./apps/api/dist

# Built SPA
COPY --from=build /app/apps/web/dist ./apps/web/dist

# Copy package manifests for workspace resolution
COPY --from=deps /app/packages/types/package.json ./packages/types/package.json
COPY --from=deps /app/packages/data/package.json ./packages/data/package.json
COPY --from=deps /app/packages/core/package.json ./packages/core/package.json
COPY --from=deps /app/packages/ui/package.json ./packages/ui/package.json
COPY --from=deps /app/packages/web-engine/package.json ./packages/web-engine/package.json
COPY --from=deps /app/apps/api/package.json ./apps/api/package.json
COPY --from=deps /app/apps/web/package.json ./apps/web/package.json

# Copy built package outputs
COPY --from=build /app/packages/types/dist ./packages/types/dist
COPY --from=build /app/packages/data/dist ./packages/data/dist
COPY --from=build /app/packages/core/dist ./packages/core/dist
COPY --from=build /app/packages/ui/dist ./packages/ui/dist
COPY --from=build /app/packages/web-engine/dist ./packages/web-engine/dist

ENV NODE_ENV=production PORT=8080
EXPOSE 8080
CMD ["node", "apps/api/dist/apps/api/src/index.js"]
