# GitHub Actions CI/CD Setup

## Overview

This repository uses GitHub Actions for continuous integration and deployment. The CI/CD pipeline automatically runs on every push and pull request to ensure code quality and stability.

## Workflows

### 1. CI Workflow (`.github/workflows/ci.yml`)

**Triggers:**
- Push to `main` or `develop` branches
- Pull requests to `main` or `develop` branches

**Jobs:**

#### Lint Job
- Installs Node.js 18 and pnpm 8
- Caches pnpm dependencies for faster builds
- Runs ESLint across all packages
- **Status:** Required for merge

#### Build Job
- Installs dependencies with frozen lockfile
- Builds all packages in dependency order
- Uploads build artifacts for 7 days
- **Status:** Required for merge

#### Test Job
- Runs Jest tests across all packages
- **Status:** Currently non-blocking (continue-on-error)

### 2. PR Checks Workflow (`.github/workflows/pr-checks.yml`)

**Triggers:**
- Pull request opened, synchronized, or reopened

**Jobs:**

#### Validate PR
- Checks code formatting with Prettier
- Runs linting and build steps
- Runs tests (non-blocking)

#### Dependency Review
- Scans for vulnerable dependencies
- Fails on moderate or higher severity issues
- **Status:** Required for merge

### 3. CodeQL Workflow (`.github/workflows/codeql.yml`)

**Triggers:**
- Push to `main` or `develop` branches
- Pull requests to `main` or `develop` branches
- Weekly schedule (Monday at midnight UTC)

**Jobs:**
- Static code analysis for JavaScript/TypeScript
- Security vulnerability scanning
- Uploads results to GitHub Security tab

## Branch Protection Setup

To enable branch protection with CI checks:

### For `main` branch:

1. Go to **Repository Settings → Branches → Add branch protection rule**

2. **Branch name pattern:** `main`

3. **Protect matching branches:**
   - ✅ Require a pull request before merging
     - Require approvals: `1`
     - Dismiss stale pull request approvals when new commits are pushed
   
   - ✅ Require status checks to pass before merging
     - Require branches to be up to date before merging
     - **Required status checks:**
       - `Lint`
       - `Build`
       - `Dependency Review`
       - `Analyze (CodeQL)`
   
   - ✅ Require conversation resolution before merging
   
   - ✅ Do not allow bypassing the above settings

### For `develop` branch:

Same settings as `main`, but optionally:
- Reduce required approvals to `0` for faster iteration
- Make some checks advisory only

## CI Performance

### Caching Strategy
- **pnpm store cache:** Based on `pnpm-lock.yaml` hash
- **Cache location:** `~/.local/share/pnpm/store`
- **Typical build times:**
  - With cache hit: ~2-3 minutes
  - Cold start (no cache): ~5-7 minutes

### Optimization Tips
- Keep `pnpm-lock.yaml` committed and up to date
- Use `pnpm install --frozen-lockfile` to ensure reproducible builds
- Parallel jobs (lint, build, test) reduce total pipeline time

## Local Testing

Before pushing, run the same checks locally:

```bash
# Install dependencies
pnpm install

# Run all checks
pnpm lint && pnpm build && pnpm test

# Fix formatting issues
pnpm format
```

## Troubleshooting

### CI fails with dependency errors
- Ensure `pnpm-lock.yaml` is committed
- Run `pnpm install` locally and commit any changes
- Check for platform-specific dependencies

### Cache issues
- GitHub Actions will automatically invalidate cache when `pnpm-lock.yaml` changes
- Manual cache cleanup: not needed, automatic 7-day retention

### Status checks not appearing
- Ensure workflows are in `.github/workflows/` directory
- Check workflow syntax with GitHub's workflow validator
- Verify branch names match workflow triggers

## Required Secrets

Currently, no secrets are required for CI/CD workflows. All workflows use default GitHub token permissions.

If you add workflows that need external services:
1. Add secrets in **Repository Settings → Secrets and variables → Actions**
2. Reference them in workflows as `${{ secrets.SECRET_NAME }}`

## Badges

Add these badges to your README to show CI status:

```markdown
[![CI](https://github.com/kamio90/zus-retirement-simulator/actions/workflows/ci.yml/badge.svg)](https://github.com/kamio90/zus-retirement-simulator/actions/workflows/ci.yml)
[![CodeQL](https://github.com/kamio90/zus-retirement-simulator/actions/workflows/codeql.yml/badge.svg)](https://github.com/kamio90/zus-retirement-simulator/actions/workflows/codeql.yml)
```

## Next Steps

1. ✅ Workflows are configured and ready to use
2. ⏳ Enable branch protection rules (manual step in GitHub Settings)
3. ⏳ Configure team permissions for approvals
4. ⏳ Set up deployment workflows (if needed for hosting)
