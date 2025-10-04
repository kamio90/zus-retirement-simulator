# ZUS Retirement Simulator

Professional monorepo for simulating future pensions based on official ZUS/FUS macroeconomic and actuarial data.

## Structure
- apps/api: Express + TypeScript backend
- apps/web: React + Vite + TypeScript frontend
- packages/core: Pension calculation engine
- packages/data: JSON parameter snapshots
- packages/types: Shared DTOs and Zod schemas
- packages/ui: Shared UI components (optional)
- tools/scripts: XLSX to JSON conversion, build automation
- data: Source XLSX and PDF documents from ZUS

## Getting Started

```sh
pnpm install
pnpm run build # (if build scripts are present)
```

## Development
- Use strict TypeScript and Prettier/ESLint for code quality
- All constants from /data must be imported via @data
- See `.github/copilot-instructions.md` for AI agent guidelines
