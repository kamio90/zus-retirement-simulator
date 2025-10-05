# Docker Deployment Guide

## Overview

The ZUS Retirement Simulator is packaged as a **single Docker image** that serves both the frontend SPA (React + Vite) and the backend API (Express) from **one container on one port**. This design simplifies deployment and eliminates CORS issues.

## Quick Start

```bash
# Build the image
docker build -t zus-sim:local .

# Run the container
docker run -p 8080:8080 zus-sim:local

# Access the application
open http://localhost:8080
```

## Architecture

```
┌─────────────────────────────────────┐
│         Docker Container            │
│  ┌───────────────────────────────┐  │
│  │  Node.js Process (Port 8080)  │  │
│  │  ┌─────────────────────────┐  │  │
│  │  │  Express Server         │  │  │
│  │  │  ├─ /api/*  → API routes│  │  │
│  │  │  ├─ /*      → SPA files │  │  │
│  │  │  └─ fallback → index.html│  │  │
│  │  └─────────────────────────┘  │  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
```

## How It Works

### 1. API Routes (Priority)
All API endpoints are mounted under `/api/*`:
- `/api/health` - Health check
- `/api/v2/*` - V2 wizard endpoints
- `/api/simulate` - Simulation endpoint
- `/api/reports/*` - Report generation
- `/api/benchmarks` - Benchmark data
- `/api/telemetry` - Analytics
- `/api/scenarios` - Scenario management
- `/api/admin` - Admin endpoints
- `/api/content` - Content management

Legacy routes (without `/api` prefix) are also supported for backward compatibility with existing Render deployment.

### 2. Static Files
The Express server serves the built SPA from `apps/web/dist/`:
- `index.html` - Main HTML file
- `assets/*` - JS, CSS, images

### 3. SPA Fallback
Any non-API route (e.g., `/wizard`, `/result/123`) returns `index.html`, enabling client-side routing.

The regex `/^(?!\/api\/).*/ ` matches all paths that do NOT start with `/api/`.

## Dockerfile Breakdown

### Multi-Stage Build

**Stage 1: Base**
- Node 20 Alpine
- Corepack enabled for pnpm

**Stage 2: Dependencies**
- Installs all dependencies using `pnpm install --frozen-lockfile`
- Copies only `package.json` files first for optimal caching

**Stage 3: Build**
- Builds all packages in order: data → types → core → ui → web-engine
- Builds frontend with `VITE_API_BASE_URL=/api`
- Builds API TypeScript to JavaScript

**Stage 4: Runner (Production)**
- Copies compiled outputs and necessary files
- Minimal runtime image
- Exposes port 8080
- Runs: `node apps/api/dist/apps/api/src/index.js`

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `8080` | Server port (configurable for cloud providers) |
| `NODE_ENV` | `production` | Node environment |
| `VITE_API_BASE_URL` | `/api` | API base URL (set during build) |

## Testing

### Automated Test
```bash
./test-docker.sh
```

### Manual Tests
```bash
# 1. Health check
curl http://localhost:8080/api/health
# Expected: {"status":"ok"}

# 2. Root SPA
curl -I http://localhost:8080/
# Expected: Content-Type: text/html

# 3. Deep link (fallback)
curl -I http://localhost:8080/wizard
# Expected: Content-Type: text/html

# 4. API endpoint (example)
curl -I http://localhost:8080/api/v2/wizard/init
# Expected: HTTP response (may return 400/405 if POST required)
```

## Docker Compose

For local development:

```bash
docker-compose up
```

`docker-compose.yml`:
```yaml
version: "3.8"
services:
  app:
    build: .
    image: zus-sim:latest
    ports:
      - "8080:8080"
    environment:
      NODE_ENV: production
      PORT: 8080
```

## Cloud Deployment

### Google Cloud Run

```bash
# Build and push
gcloud builds submit --tag gcr.io/YOUR_PROJECT/zus-sim

# Deploy
gcloud run deploy zus-sim \
  --image gcr.io/YOUR_PROJECT/zus-sim \
  --platform managed \
  --port 8080 \
  --allow-unauthenticated
```

### AWS App Runner

1. Push to Amazon ECR:
```bash
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin YOUR_ACCOUNT.dkr.ecr.us-east-1.amazonaws.com
docker tag zus-sim:local YOUR_ACCOUNT.dkr.ecr.us-east-1.amazonaws.com/zus-sim:latest
docker push YOUR_ACCOUNT.dkr.ecr.us-east-1.amazonaws.com/zus-sim:latest
```

2. Create App Runner service in AWS Console:
   - Source: ECR
   - Port: 8080
   - CPU/Memory: 1 vCPU, 2 GB

### Fly.io

```bash
# Install flyctl
curl -L https://fly.io/install.sh | sh

# Launch app
fly launch

# Deploy
fly deploy
```

### Railway

1. Create new project
2. Add "Deploy from Dockerfile"
3. Set environment: `PORT=8080`
4. Deploy

### Render (Docker-based)

1. Create new "Web Service"
2. Select "Docker"
3. Set:
   - Docker Command: `node apps/api/dist/apps/api/src/index.js`
   - Port: 8080
4. Deploy

## CI/CD

The repository includes a GitHub Actions workflow (`.github/workflows/docker.yml`) that:
- Builds the Docker image on every PR and push to `main`
- Pushes to GitHub Container Registry (GHCR) on `main` branch
- Image: `ghcr.io/kamio90/zus-retirement-simulator:latest`

### Using the CI-Built Image

```bash
# Pull from GHCR
docker pull ghcr.io/kamio90/zus-retirement-simulator:latest

# Run
docker run -p 8080:8080 ghcr.io/kamio90/zus-retirement-simulator:latest
```

## Troubleshooting

### Container Exits Immediately
Check logs:
```bash
docker logs <container-id>
```

Common issues:
- Missing environment variables
- Port already in use
- Module resolution errors

### API 404 Errors
- Verify routes are prefixed with `/api`
- Check Vite build used correct `VITE_API_BASE_URL`
- Inspect network tab in browser DevTools

### SPA Routes Return 404
- Verify fallback regex is correct: `/^(?!\/api\/).*/ `
- Check static middleware is before fallback route
- Ensure `index.html` exists in `apps/web/dist/`

### Performance Issues
- Increase container resources
- Consider using a CDN for static assets
- Enable gzip compression (add middleware)

## Advanced: Slim Image

To reduce image size, modify the runner stage to use `pnpm prune --prod`:

```dockerfile
FROM node:20-alpine AS pruner
WORKDIR /app
COPY --from=deps /app ./
RUN pnpm -F api prune --prod

FROM node:20-alpine AS runner
WORKDIR /app
COPY --from=pruner /app/node_modules ./node_modules
# ... rest of runner stage
```

This removes development dependencies, reducing image size by ~30-40%.

## Security Considerations

- Run as non-root user (add `USER node` before CMD)
- Use specific Node version (not `latest`)
- Scan image for vulnerabilities: `docker scan zus-sim:local`
- Set resource limits in production
- Use secrets management for sensitive environment variables

## Performance Tips

1. **Multi-platform builds** (for ARM/AMD):
   ```bash
   docker buildx build --platform linux/amd64,linux/arm64 -t zus-sim:latest .
   ```

2. **BuildKit cache**:
   ```bash
   DOCKER_BUILDKIT=1 docker build --cache-from zus-sim:latest -t zus-sim:local .
   ```

3. **Health checks** (add to Dockerfile):
   ```dockerfile
   HEALTHCHECK --interval=30s --timeout=3s --start-period=40s \
     CMD node -e "require('http').get('http://localhost:8080/api/health', (r) => process.exit(r.statusCode === 200 ? 0 : 1))"
   ```

## Support

For issues or questions:
- Open an issue on GitHub
- Check DOCKER_BUILD_NOTES.md for build-specific notes
- Review container logs for debugging
