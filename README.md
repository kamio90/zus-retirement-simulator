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

# Build all packages (REQUIRED before running dev servers)
pnpm build

# Run development servers
pnpm dev
```

> **Note:** You must run `pnpm build` before `pnpm dev` to compile the workspace packages. The build step only needs to be run once after installing dependencies, unless you modify package source code.

### V2 Wizard API

The v2 API provides step-by-step pension calculation endpoints:

- **Base URL**: `http://localhost:4000/v2`
- **Endpoints**:
  - `POST /v2/wizard/init` - Gender & age validation
  - `POST /v2/wizard/contract` - Contract type validation
  - `POST /v2/wizard/jdg` - JDG quick result
  - `POST /v2/compare/higher-zus` - Higher ZUS comparison
  - `POST /v2/compare/as-uop` - UoP comparison
  - `POST /v2/compare/what-if` - What-if scenarios
  - `POST /v2/simulate` - Final simulation

See [V2_API_DOCUMENTATION.md](./V2_API_DOCUMENTATION.md) for detailed API documentation.

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

## 🚀 Deployment

### Deploy to Render

This project includes a `render.yaml` configuration for easy deployment to [Render](https://render.com):

1. **Fork/clone** this repository
2. **Sign up** at [dashboard.render.com](https://dashboard.render.com)
3. **Create Environment Groups** (see [docs/deploy-render.md](./docs/deploy-render.md))
4. **Deploy via Blueprint**:
   - Go to "Blueprint" → "New Blueprint Instance"
   - Connect your GitHub repository
   - Render will create both API and Web services automatically

The deployment includes:
- **API Service**: Node/Express with health checks and persistent disk for logs
- **Web Service**: Static Vite build with SPA routing and PR previews
- **Auto-deploy**: Enabled on `main` branch pushes

For detailed instructions, see [docs/deploy-render.md](./docs/deploy-render.md).

### Run with Docker

The project includes a single Docker image that serves both the SPA and API on one port:

```bash
# Build the image
docker build -t zus-sim:local .

# Run the container
docker run -p 8080:8080 zus-sim:local

# Access the application
# http://localhost:8080   (SPA)
# http://localhost:8080/api/health  (Health check)
```

The container serves **SPA + API** on one port. Frontend calls the backend via **`/api`** (no CORS issues).

**Features:**
- Single-port deployment (frontend + backend)
- SPA fallback routing (deep links work)
- Production-optimized build
- Compatible with any Docker host (Cloud Run, App Runner, Fly, Railway, Render)

**Docker Compose:**
```bash
docker-compose up
```

To deploy on any Docker host, point to port `8080` and set `PORT=8080` environment variable if needed.

### Environment Variables

Required environment variables are organized into groups:
- `zus-sim-shared`: Shared configuration (telemetry, PDF settings)
- `zus-sim-api`: API-specific (CORS origins)
- `zus-sim-public`: Frontend variables (`VITE_*` prefix required)

See the deployment guide for complete environment configuration.

## 🤝 Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for:
- Development workflow
- Code standards
- Pull request guidelines
- CI/CD requirements

## 📝 License

See LICENSE file in the repository root.

## 🏆 HackYeah 2025

This project is developed for the ZUS challenge at HackYeah 2025 hackathon.

**Author**: Kamil Musiał  
**Repository**: https://github.com/kamio90/zus-retirement-simulator  
**Version**: 1.0.0
