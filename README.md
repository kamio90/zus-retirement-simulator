# ZUS Retirement Simulator

[![CI](https://github.com/kamio90/zus-retirement-simulator/actions/workflows/ci.yml/badge.svg)](https://github.com/kamio90/zus-retirement-simulator/actions/workflows/ci.yml)
[![CodeQL](https://github.com/kamio90/zus-retirement-simulator/actions/workflows/codeql.yml/badge.svg)](https://github.com/kamio90/zus-retirement-simulator/actions/workflows/codeql.yml)

Professional pension calculation simulator for the Polish Social Insurance Institution (ZUS), developed for HackYeah 2025 hackathon.

## 🎯 Project Overview

This simulator calculates future pension amounts based on:
- Official ZUS macroeconomic parameters
- Actuarial life expectancy tables
- Real valorization coefficients from XLSX data sources
- Polish pension system rules (annual + quarterly valorization)

## 🏗️ Architecture

This is a **TypeScript monorepo** managed with **pnpm workspaces**:

```
├── apps/
│   ├── api/          # Express backend (REST API)
│   └── web/          # React + Vite frontend
├── packages/
│   ├── core/         # Calculation engine (@zus/core)
│   ├── data/         # Data snapshots (@zus/data)
│   ├── types/        # Shared types (@zus/types)
│   └── ui/           # UI components (@zus/ui)
├── data/             # Source XLSX/PDF documents
└── tools/            # Build automation scripts
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** >= 18.x
- **pnpm** >= 8.x

```bash
npm install -g pnpm
```

### Installation

```bash
# Clone and install
git clone https://github.com/kamio90/zus-retirement-simulator.git
cd zus-retirement-simulator
pnpm install

# Build all packages
pnpm build

# Run development servers
pnpm dev
```

See [SETUP.md](./SETUP.md) for detailed setup instructions.

## 📦 Packages

| Package | Description | Technologies |
|---------|-------------|--------------|
| **@zus/core** | Pension calculation engine | TypeScript, Pure functions |
| **@zus/types** | Shared types and schemas | TypeScript, Zod |
| **@zus/data** | Data layer (JSON snapshots) | TypeScript |
| **@zus/ui** | Shared UI components | React, TypeScript |
| **api** | REST API server | Express, TypeScript |
| **web** | Frontend application | React, Vite, TailwindCSS |

## 🧮 Calculation Formula

The simulator implements the official ZUS pension calculation:

1. **Wage projection**: `baseSalary × wageGrowthPath`
2. **Annual contribution**: `wage × 19.52% × absenceFactor`
3. **Annual valorization**: `capital × (1 + valorizationRate)`
4. **Quarterly valorization**: Quarter-specific adjustment
5. **Initial capital**: Valorized using official coefficients
6. **Pension nominal**: `capital / (lifeExpectancy × 12)`
7. **Pension real**: `nominal / cumulativeCPI`
8. **Replacement rate**: `pensionReal / currentGross`

All parameters are loaded from official ZUS data sources (no hard-coded values).

## 🎨 Design Standards

- **Brand colors**: Primary `#007a33`, Secondary `#e5f3e8`
- **Accessibility**: WCAG 2.1 AA compliant
- **Typography**: Lato / Roboto
- **TypeScript**: Strict mode enabled

## 🛠️ Development

### Available Commands

```bash
# Build all packages
pnpm build

# Lint and format
pnpm lint
pnpm format

# Run tests
pnpm test

# Package-specific commands
pnpm --filter ./packages/core test
pnpm --filter ./apps/api build
```

### TypeScript Configuration

- Strict mode enabled
- CommonJS modules
- Path aliases: `@zus/core`, `@zus/types`, etc.

## 📊 Data Sources

Located in `/data`:
- `Parametry-III 2025.xlsx` - Macroeconomic indicators
- `Publikacja_Fundusz_Emerytalny_2023-2080.pdf` - Actuarial projections
- `RULES_ZUS_SymulatorEmerytalny.pdf` - Competition rules
- Various XLSX files for valorization, life expectancy, regional data

## 🧪 Testing

```bash
# Run all tests
pnpm test

# Run tests for specific package
pnpm --filter @zus/core test
```

## 📝 License

See LICENSE file in the repository root.

## 🏆 HackYeah 2025

This project is developed for the ZUS challenge at HackYeah 2025 hackathon.

**Author**: Kamil Musiał  
**Repository**: https://github.com/kamio90/zus-retirement-simulator  
**Version**: 1.0.0
