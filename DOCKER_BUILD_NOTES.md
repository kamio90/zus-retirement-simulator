# Docker Build Test Notes

## Build Status

The Docker configuration has been implemented according to the issue specifications:

### ✅ Completed
- [x] API server updated to serve SPA static files
- [x] SPA fallback route implemented (for deep linking)
- [x] `/api/health` endpoint added
- [x] All API routes mounted under `/api` prefix (with legacy routes for backward compatibility)
- [x] Dockerfile created with multi-stage build
- [x] .dockerignore created
- [x] docker-compose.yml created
- [x] GitHub Actions workflow for Docker build/push created
- [x] README updated with Docker instructions

### ⚠️ Known Limitation

**Docker build cannot be tested in this environment** due to SSL certificate issues when downloading pnpm:
```
Error: self-signed certificate in certificate chain
```

This is an environment-specific issue and will not occur in:
- GitHub Actions CI (with proper network access)
- Cloud build environments (Cloud Run, App Runner, etc.)
- Local development machines
- Any environment with proper SSL certificate chain

### 🧪 Manual Testing Required

The following smoke tests should be performed in a proper environment:

```bash
# Build
docker build -t zus-sim:local .

# Run
docker run --rm -p 8080:8080 zus-sim:local

# Verify
curl -s localhost:8080/api/health | jq .
# => {"status":"ok"}

curl -sI localhost:8080/result/anything | grep -i content-type
# => text/html; charset=UTF-8

# Open browser
# http://localhost:8080 (verify SPA loads)
# http://localhost:8080/api/health (verify API responds)
```

### 📋 Implementation Details

**File: apps/api/src/index.ts**
- Added `path` import for file serving
- Mounted all routes under `/api` prefix
- Kept legacy routes for backward compatibility with Render deployment
- Added static file serving for SPA: `express.static(DIST)`
- Added SPA fallback: regex route `/^(?!\/api\/).*/ `

**File: Dockerfile**
- Multi-stage build: base → deps → build → runner
- Node 20 Alpine
- pnpm via corepack
- Builds packages in correct order
- Sets VITE_API_BASE_URL=/api
- Exposes port 8080
- CMD: `node apps/api/dist/apps/api/src/index.js`

**File: apps/web/vite.config.ts**
- Removed rewrite for `/api` proxy (API now serves on `/api` directly)

## Next Steps

1. Push to GitHub and let CI build the Docker image
2. Verify the image works in GitHub Actions
3. Test deployment to a cloud provider (optional)
4. Update deployment documentation if needed
