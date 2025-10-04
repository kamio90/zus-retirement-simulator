# CI/CD Quick Reference

## 🚀 Quick Commands

```bash
# Check if CI will pass
pnpm lint && pnpm build && pnpm test

# Fix formatting
pnpm format

# Run in development
pnpm dev
```

## ✅ Workflow Status Checks

| Check | Workflow | Required | Description |
|-------|----------|----------|-------------|
| **Lint** | ci.yml | ✅ Yes | ESLint code quality |
| **Build** | ci.yml | ✅ Yes | TypeScript compilation |
| **Test** | ci.yml | ⏳ Soon | Jest unit tests |
| **Validate PR** | pr-checks.yml | ✅ Yes | Format & build check |
| **Dependency Review** | pr-checks.yml | ✅ Yes | Security scan |
| **CodeQL** | codeql.yml | ✅ Yes | Security analysis |

## 📊 Typical CI Run Times

```
┌─────────────────┬──────────┬────────────┐
│ Workflow        │ Cold     │ Cached     │
├─────────────────┼──────────┼────────────┤
│ Lint            │ ~2 min   │ ~1 min     │
│ Build           │ ~3 min   │ ~2 min     │
│ Test            │ ~2 min   │ ~1 min     │
│ CodeQL          │ ~5 min   │ ~3 min     │
│ Dependency Rev. │ ~30 sec  │ ~30 sec    │
└─────────────────┴──────────┴────────────┘

Total pipeline (parallel): ~5-7 min cold, ~2-3 min cached
```

## 🔧 Common Issues & Fixes

### ❌ Lint Failed
```bash
# Check errors
pnpm lint

# Auto-fix where possible
pnpm format
```

### ❌ Build Failed
```bash
# Clean build
rm -rf dist/ */dist/
pnpm build
```

### ❌ Test Failed
```bash
# Run tests locally
pnpm test

# Run specific package
pnpm --filter @zus/core test
```

### ❌ Cache Issues
- Workflows auto-invalidate cache on `pnpm-lock.yaml` change
- No manual action needed

## 📝 Before Pushing

```bash
# 1. Format code
pnpm format

# 2. Check linting
pnpm lint

# 3. Build project
pnpm build

# 4. Run tests
pnpm test

# 5. Review changes
git diff

# 6. Commit & push
git add .
git commit -m "feat: your message"
git push
```

## 🎯 PR Checklist

- [ ] Code formatted (`pnpm format`)
- [ ] No lint errors (`pnpm lint`)
- [ ] Build succeeds (`pnpm build`)
- [ ] Tests pass (`pnpm test`)
- [ ] Documentation updated
- [ ] Conventional commit messages
- [ ] PR description complete

## 🔗 Documentation Links

| Topic | Link |
|-------|------|
| Setup Guide | [SETUP.md](../SETUP.md) |
| CI/CD Setup | [CI_SETUP.md](./CI_SETUP.md) |
| Architecture | [PIPELINE_ARCHITECTURE.md](./PIPELINE_ARCHITECTURE.md) |
| Contributing | [CONTRIBUTING.md](../CONTRIBUTING.md) |

## 🆘 Need Help?

1. **CI failures:** Check [CI_SETUP.md](./CI_SETUP.md) troubleshooting
2. **Build issues:** See [SETUP.md](../SETUP.md) troubleshooting
3. **Questions:** Open a discussion
4. **Bugs:** Use [CI issue template](.github/ISSUE_TEMPLATE/ci_issue.md)

## 🔐 Branch Protection Settings

### Main Branch
```
✅ Require PR before merge (1+ approval)
✅ Require status checks:
   - Lint
   - Build
   - Dependency Review
   - CodeQL (JavaScript & TypeScript)
✅ Require conversation resolution
✅ Require branches up to date
```

## 📦 Workflow Files

```
.github/workflows/
├── ci.yml          # Main CI pipeline
├── codeql.yml      # Security scanning
└── pr-checks.yml   # PR validation
```

## 🎨 Badges

```markdown
[![CI](https://github.com/kamio90/zus-retirement-simulator/actions/workflows/ci.yml/badge.svg)](https://github.com/kamio90/zus-retirement-simulator/actions/workflows/ci.yml)
```

---

**Last Updated:** 2025-01  
**Version:** 1.0.0
