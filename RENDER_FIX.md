# Render Deployment Fix - Manual Configuration Required

## Issue
The Render service `zus-retirement-simulator-ui` is still using npm for dependency installation, even though we've updated render.yaml to use pnpm. This is because the service was created manually and is not using the render.yaml blueprint configuration.

## Root Cause
The existing Render service was created through the Render Dashboard (not via Blueprint), so changes to render.yaml are not automatically applied to it.

## Solution Options

### Option 1: Update Existing Service (Recommended)
Manually update the build settings in Render Dashboard:

1. Go to https://dashboard.render.com
2. Select the `zus-retirement-simulator-ui` service
3. Go to "Settings"
4. Update the following settings:
   - **Build Command**: 
     ```bash
     corepack enable && corepack prepare pnpm@9.12.0 --activate && pnpm install --frozen-lockfile && pnpm -F web build
     ```
   - **Environment Variables**: Add if not present:
     - `NODE_VERSION` = `20.12.2`
     - `PNPM_VERSION` = `9.12.0`
5. Save changes and trigger a manual deploy

### Option 2: Recreate from Blueprint
Delete the existing service and create it from render.yaml:

1. Delete the `zus-retirement-simulator-ui` service from Render Dashboard
2. Go to "Blueprints" → "New Blueprint Instance"  
3. Connect your GitHub repository
4. Select this repository and branch
5. Render will create the service with name `zus-retirement-simulator-ui` using the render.yaml configuration

### Option 3: Use the Build Script
The repository now includes `render-build.sh` which you can use as the build command:

```bash
./render-build.sh
```

This script:
- Enables corepack
- Prepares pnpm 9.12.0
- Installs dependencies with pnpm
- Builds the web application

## Files Changed
- `render.yaml` - Updated service name to match existing service
- `render-build.sh` - New build script for easier configuration

## Next Steps
Choose one of the options above to fix the deployment. Option 1 is recommended for quickest resolution.
