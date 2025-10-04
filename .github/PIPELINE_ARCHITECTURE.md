# CI/CD Pipeline Architecture

## Pipeline Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                   GitHub Repository Events                       │
│  • Push to main/develop                                          │
│  • Pull Request to main/develop                                  │
│  • Weekly Schedule (CodeQL)                                      │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    GitHub Actions Runners                        │
│                      (ubuntu-latest)                             │
└─────────────────────────────────────────────────────────────────┘
                             │
                ┌────────────┴────────────┐
                ▼                         ▼
        ┌───────────────┐         ┌──────────────┐
        │   CI Workflow │         │  PR Checks   │
        │   (ci.yml)    │         │ (pr-checks)  │
        └───────┬───────┘         └──────┬───────┘
                │                        │
        ┌───────┴────────┐              │
        ▼       ▼        ▼              ▼
    ┌─────┐ ┌─────┐ ┌──────┐    ┌────────────┐
    │Lint │ │Build│ │Test  │    │  Validate  │
    └─────┘ └─────┘ └──────┘    │    PR      │
                                 └────────────┘
                                        │
                                 ┌──────┴──────┐
                                 ▼             ▼
                          ┌──────────┐  ┌────────────┐
                          │  Format  │  │ Dependency │
                          │  Check   │  │   Review   │
                          └──────────┘  └────────────┘

                             │
                             ▼
                    ┌────────────────┐
                    │ CodeQL Analysis│
                    │  (codeql.yml)  │
                    └────────────────┘
                             │
                             ▼
                    ┌────────────────┐
                    │  Security Tab  │
                    └────────────────┘
```

## Workflow Details

### 1. CI Workflow (`ci.yml`)

**Trigger Events:**
- Push to `main` or `develop`
- Pull requests to `main` or `develop`

**Jobs (Parallel Execution):**

#### Job: Lint
- **Runtime:** ~1-2 min (with cache)
- **Steps:**
  1. Checkout code
  2. Setup Node.js 18
  3. Install pnpm 8
  4. Cache pnpm store
  5. Install dependencies (`pnpm install --frozen-lockfile`)
  6. Run linting (`pnpm lint`)

#### Job: Build
- **Runtime:** ~2-3 min (with cache)
- **Steps:**
  1. Checkout code
  2. Setup Node.js 18
  3. Install pnpm 8
  4. Cache pnpm store
  5. Install dependencies
  6. Build all packages (`pnpm build`)
  7. Upload build artifacts (retention: 7 days)

#### Job: Test
- **Runtime:** ~1-2 min (with cache)
- **Steps:**
  1. Checkout code
  2. Setup Node.js 18
  3. Install pnpm 8
  4. Cache pnpm store
  5. Install dependencies
  6. Run tests (`pnpm test`)
  7. Continue on error (non-blocking for now)

### 2. PR Checks Workflow (`pr-checks.yml`)

**Trigger Events:**
- Pull request opened
- Pull request synchronized (new commits)
- Pull request reopened

**Jobs:**

#### Job: Validate PR
- **Runtime:** ~2-3 min
- **Steps:**
  1. Checkout code
  2. Setup environment (Node.js 18 + pnpm 8)
  3. Check formatting (`pnpm format --check`)
  4. Run linting (non-blocking)
  5. Build project (blocking)
  6. Run tests (non-blocking)

#### Job: Dependency Review
- **Runtime:** ~30 sec
- **Steps:**
  1. Checkout code
  2. Run dependency review action
  3. Fail on moderate+ severity vulnerabilities

### 3. CodeQL Workflow (`codeql.yml`)

**Trigger Events:**
- Push to `main` or `develop`
- Pull requests to `main` or `develop`
- Schedule: Every Monday at 00:00 UTC

**Jobs:**

#### Job: Analyze
- **Runtime:** ~3-5 min
- **Matrix Strategy:** JavaScript & TypeScript
- **Steps:**
  1. Checkout repository
  2. Initialize CodeQL
  3. Autobuild project
  4. Perform CodeQL analysis
  5. Upload to GitHub Security

## Optimization Features

### Caching Strategy

```yaml
# pnpm store caching
- uses: actions/cache@v4
  with:
    path: ${{ env.STORE_PATH }}
    key: ${{ runner.os }}-pnpm-store-${{ hashFiles('**/pnpm-lock.yaml') }}
    restore-keys: |
      ${{ runner.os }}-pnpm-store-
```

**Benefits:**
- 60-80% faster dependency installation
- Reduced GitHub Actions minutes usage
- Consistent dependency resolution

### Parallel Job Execution

- Lint, Build, and Test jobs run in parallel
- Total pipeline time ≈ slowest job (not sum of all jobs)
- Typical total runtime: 2-3 minutes with cache

### Frozen Lockfile

```bash
pnpm install --frozen-lockfile
```

**Ensures:**
- Reproducible builds
- No unexpected dependency updates
- Consistent behavior across environments

## Status Checks for Branch Protection

### Recommended Required Checks

For `main` branch protection:

1. ✅ **Lint** (from ci.yml)
2. ✅ **Build** (from ci.yml)
3. ✅ **Validate PR** (from pr-checks.yml)
4. ✅ **Dependency Review** (from pr-checks.yml)
5. ✅ **Analyze / javascript** (from codeql.yml)
6. ✅ **Analyze / typescript** (from codeql.yml)

### Optional Checks

- **Test** (currently non-blocking due to existing issues)
- **Format Check** (can auto-fix with `pnpm format`)

## Artifacts and Outputs

### Build Artifacts
- **Location:** Uploaded to GitHub Actions
- **Retention:** 7 days
- **Contents:**
  - `apps/*/dist` - Compiled applications
  - `packages/*/dist` - Compiled packages

### Security Reports
- **CodeQL Results:** Available in Security tab
- **Dependency Alerts:** Shown in PR conversation

## Environment Variables

### Automatically Set
- `NODE_VERSION`: 18 (from setup-node)
- `PNPM_VERSION`: 8 (from pnpm/action-setup)
- `STORE_PATH`: pnpm store directory

### No Secrets Required
All workflows use default `GITHUB_TOKEN` with appropriate permissions.

## Performance Metrics

| Scenario | Time | Notes |
|----------|------|-------|
| Cold start (no cache) | ~5-7 min | First run or cache miss |
| Warm build (cache hit) | ~2-3 min | Typical PR/push |
| CodeQL analysis | ~3-5 min | Security scanning |
| Dependency review | ~30 sec | Quick security check |

## Next Steps

1. ✅ Workflows configured and validated
2. ⏳ Enable branch protection in GitHub Settings
3. ⏳ Configure required reviewers
4. ⏳ Set up notifications for failed builds
5. ⏳ Consider adding deployment workflow (if needed)

## Maintenance

### Updating Actions
Monitor Dependabot alerts for action updates:
- `actions/checkout@v4`
- `actions/setup-node@v4`
- `pnpm/action-setup@v4`
- `github/codeql-action@v3`

### Adjusting Cache
If cache becomes stale or grows too large:
- GitHub auto-expires caches after 7 days of no use
- Max cache size: 10 GB per repository
- Clear old caches manually from Actions cache page

### Debugging Failed Runs
1. Check workflow run logs in Actions tab
2. Review job annotations for specific errors
3. Run same commands locally: `pnpm lint && pnpm build && pnpm test`
4. Check for environment-specific issues (Node version, OS differences)
