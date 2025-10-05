# Deploying to Render

This guide explains how to deploy the ZUS Retirement Simulator monorepo to Render using the included `render.yaml` Infrastructure-as-Code configuration.

## Quick Start

1. **Fork or clone this repository** to your GitHub account

2. **Sign up for Render** at [dashboard.render.com](https://dashboard.render.com)

3. **Create Environment Groups** in Render Dashboard:

### Environment Groups

#### `zus-sim-shared` (used by API)

| Key | Value | Notes |
|-----|-------|-------|
| `NODE_ENV` | `production` | |
| `ENGINE_ANCHOR_YEAR` | `2025` | |
| `TELEMETRY_ENABLED` | `true` | |
| `LOG_PATH` | `/var/data/logs/telemetry.jsonl` | Persistent disk path |
| `TELEMETRY_ROTATE_AT_MB` | `5` | |
| `TELEMETRY_MAX_SIZE_MB` | `50` | |
| `PDF_RENDERER` | `puppeteer` | |
| `PDF_NO_SANDBOX` | `true` | Required for Render |
| `PDF_TIMEOUT_MS` | `10000` | |
| `PDF_IMAGE_MAX_B` | `600000` | |
| `PDF_PAYLOAD_MAX_B` | `1500000` | |

#### `zus-sim-api` (API-only variables)

| Key | Value | Notes |
|-----|-------|-------|
| `CORS_ORIGIN` | `https://zus-sim-web.onrender.com` | Replace with your actual web URL |

> **Note**: After deploying the web service, update `CORS_ORIGIN` with the actual web service URL.

#### `zus-sim-public` (public variables for web frontend)

| Key | Value | Notes |
|-----|-------|-------|
| `VITE_API_BASE_URL` | `https://zus-sim-api.onrender.com` | Replace with your actual API URL |

> **Note**: After deploying the API service, update `VITE_API_BASE_URL` with the actual API URL. These variables must start with `VITE_` to be embedded at build time.

4. **Deploy from Render Dashboard**:
   - Go to "Blueprint" → "New Blueprint Instance"
   - Connect your GitHub repository
   - Select the repository containing `render.yaml`
   - Render will automatically create both services

5. **Update Environment Variables**:
   - Once services are deployed, note their URLs
   - Update `CORS_ORIGIN` in `zus-sim-api` group with the web service URL
   - Update `VITE_API_BASE_URL` in `zus-sim-public` group with the API service URL
   - Redeploy both services for changes to take effect

## Services Created

### API Service (`zus-sim-api`)
- **Type**: Web Service
- **Runtime**: Node 20.12.2 with pnpm 9.12.0
- **Health Check**: `/health`
- **Persistent Disk**: 1GB mounted at `/var/data` for logs
- **Auto-deploy**: Enabled on `main` branch pushes

### Web Service (`zus-retirement-simulator-ui`)
- **Type**: Static Site
- **Build**: Vite production build via pnpm
- **Build Command**: `./render-build.sh` (uses pnpm 9.12.0)
- **SPA Rewrite**: All routes → `/index.html`
- **PR Previews**: Enabled
- **Auto-deploy**: Enabled on `main` branch pushes

## ⚠️ Important: Manual Configuration Required

If you have an existing service that was created manually (not via Blueprint), you must manually update the build settings:

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Select your service (`zus-retirement-simulator-ui`)
3. Navigate to **Settings**
4. Update **Build Command** to:
   ```bash
   ./render-build.sh
   ```
   Or use the inline command:
   ```bash
   corepack enable && corepack prepare pnpm@9.12.0 --activate && pnpm install --frozen-lockfile && pnpm -F web build
   ```
5. Add **Environment Variables** (if not present):
   - `NODE_VERSION` = `20.12.2`
   - `PNPM_VERSION` = `9.12.0`
6. Click **Save Changes**
7. Trigger a **Manual Deploy**

**Why is this needed?** Services created manually in Render Dashboard do not automatically use `render.yaml` settings. The build command must be manually configured to use pnpm instead of npm for monorepo workspace dependency resolution.

## Post-Deployment

### Smoke Tests

1. **Health Check**:
   ```bash
   curl https://your-api.onrender.com/health
   # Expected: {"status":"ok"}
   ```

2. **Wizard Endpoint**:
   ```bash
   curl -X POST https://your-api.onrender.com/v2/wizard/jdg \
     -H "Content-Type: application/json" \
     -d '{
       "gender":"M",
       "age":35,
       "contract":"JDG",
       "monthlyIncome":12000,
       "isRyczalt":false,
       "claimMonth":6
     }'
   ```

3. **Web Application**:
   - Visit `https://your-web.onrender.com`
   - Complete wizard flow
   - Verify API calls succeed (check browser console)

### PR Previews

Pull request previews are enabled for the web service:
- Each PR automatically gets a preview deployment
- Preview URL format: `https://zus-sim-web-pr-<NUMBER>.onrender.com`
- To allow preview to call API, add preview URL to `CORS_ORIGIN` (or create a `zus-sim-preview` env group with `CORS_ORIGIN=*.onrender.com` temporarily)

## Rollback

If a deployment fails:
1. Go to the service in Render Dashboard
2. Click "Revisions"
3. Select a previous successful deployment
4. Click "Rollback"

## Logs & Telemetry

- Application logs: View in Render Dashboard → Service → Logs
- Telemetry logs: Stored on persistent disk at `/var/data/logs/telemetry.jsonl`
- Automatic rotation when file exceeds `TELEMETRY_ROTATE_AT_MB`

## Custom Domain

To use a custom domain:
1. Go to web service settings
2. Add custom domain
3. Update DNS records as instructed
4. HTTPS is automatically provisioned
5. Update `CORS_ORIGIN` and `VITE_API_BASE_URL` accordingly

## Troubleshooting

### Build Failures

**pnpm not found**:
- Ensure `corepack` is enabled in build command
- Check Node version matches `NODE_VERSION` env var

**TypeScript errors**:
- Run `pnpm install` locally to check for dependency issues
- Verify all packages build successfully with `pnpm -r build`

### Runtime Issues

**CORS errors**:
- Verify `CORS_ORIGIN` matches the exact web service URL
- Check browser console for actual vs expected origins

**API 500 errors**:
- Check API logs in Render Dashboard
- Verify all environment groups are linked
- Ensure persistent disk is mounted

**Health check fails**:
- Verify API is listening on `process.env.PORT` (not hardcoded port)
- Check `/health` endpoint returns 200 status

## Additional Resources

- [Render Documentation](https://render.com/docs)
- [Blueprint Specification](https://render.com/docs/blueprint-spec)
- [Environment Groups](https://render.com/docs/environment-variables#environment-groups)
- [PR Previews](https://render.com/docs/preview-environments)
