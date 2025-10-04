# GitHub Copilot Instructions — ZUS Retirement Simulator (HackYeah 2025)

## 🧩 Project Context

You are assisting in the development of a professional **monorepo** project called **ZUS Retirement Simulator** for the **HackYeah 2025** hackathon challenge organized by **ZUS (Social Insurance Institution of Poland)**.

The project simulates future pensions based on real macroeconomic and actuarial parameters extracted from official XLSX and PDF data provided by ZUS and FUS (Fundusz Ubezpieczeń Społecznych) publications, located in the `/data` directory.

The entire solution must:
- strictly follow ZUS rules for pension calculation (annual + quarterly valorization, life expectancy division, and real vs nominal values),
- be accessible (WCAG 2.1 AA compliant),
- use official ZUS color branding (#007a33 and #e5f3e8),
- and be production-ready for demo during the Hackathon.

---

## 🏗️ Monorepo Structure

/zus-retirement-simulator
├─ apps/
│ ├─ api/ # Express + TypeScript backend (REST endpoints, PDF/XLS export)
│ └─ web/ # React + Vite + TypeScript frontend (form, charts, dashboard)
├─ packages/
│ ├─ core/ # Pension calculation engine (pure logic)
│ ├─ data/ # JSON parameter snapshots generated from /data/*.xlsx
│ ├─ types/ # Shared DTOs and Zod schemas
│ └─ ui/ # Shared UI components (optional)
├─ data/ # Source XLSX and PDF documents from ZUS
├─ tools/
│ └─ scripts/ # XLSX to JSON conversion, build automation
└─ .github/
└─ copilot-instructions.md

---

## ⚙️ Technical Stack & Standards

**Frontend**
- React + TypeScript + Vite
- TailwindCSS (custom ZUS theme)
- Recharts (charts)
- jsPDF + html2canvas (PDF export)
- ExcelJS (XLS export)

**Backend**
- Node.js + Express + TypeScript
- Zod for input validation
- ExcelJS + Puppeteer for reports
- Jest for unit testing

**Shared**
- pnpm workspaces
- ESLint + Prettier
- Environment variables via dotenv
- Strict TypeScript (noImplicitAny, strictNullChecks)
- Module path aliases: `@core`, `@data`, `@types`, `@ui`

---

## 📊 Data Sources

All input data and reference materials are located in the `/data` folder:

- `/data/Parametry-III 2025.xlsx` – macroeconomic indicators (CPI, wage growth)
- `/data/pkt 1_opóźnienie przejścia na emeryturę.xlsx` – delayed retirement effects
- `/data/pkt 3_kapitał początkowy.xlsx` – initial capital valuation
- `/data/pkt 4 i 5_absencja chorobowa.xlsx` – sickness absence correction
- `/data/pkt 6_emerytury_powiaty.xlsx` – regional pension averages
- `/data/pkt 7_emerytury_kod tytułu.xlsx` – title code segmentation
- `/data/Publikacja_Fundusz_Emerytalny_2023-2080.pdf` – actuarial and macro projections
- `/data/RULES_ZUS_SymulatorEmerytalny.pdf` – competition rules
- `/data/DETAILS_ZUS_SymulatorEmerytalny.pdf` – detailed technical task description
- `/data/prezentacja Hackathon 2025 - szablon ZUS.pptx` – official presentation template

Each `.xlsx` file will be parsed into standardized JSON files (e.g., `macro.json`, `waloryzacja.json`, `life_expectancy.json`) stored in `packages/data/json/`.

---

## 🧮 Pension Formula Overview

> Copilot must strictly follow these formulas when generating code for calculations.

1. **Working years** = `retirementYear - startWorkYear`
2. **Annual wage projection** = base salary × wage growth path (from macro.json)
3. **Annual contribution** = wage × 19.52% × absenceFactor
4. **Annual valorization** = accumulatedCapital × (1 + valorizationRate)
5. **Quarterly valorization** = apply quarterly correction depending on retirement quarter
6. **Initial capital** = valorized using coefficients from `/data/pkt 3_kapitał początkowy.xlsx`
7. **Pension nominal** = capital / (lifeExpectancyYears × 12)
8. **Pension real (today)** = nominal / cumulative CPI
9. **Replacement rate** = pensionReal / currentGrossMonthly

All constants and coefficients must be imported from the `@data` layer. Never hard-code numeric values.

---

## 🎨 UI & Accessibility Guidelines

- Follow **ZUS brand identity**:
  - Primary: `#007a33`
  - Secondary: `#e5f3e8`
  - Accent: `#004c1d`
- Typography: Lato or Roboto, sans-serif.
- Layout: clean, responsive, minimalistic.
- Accessibility: all inputs labeled, proper tab order, visible focus states, color contrast ≥ 4.5:1.

---

## 🔐 Quality & Testing

- 100% TypeScript typing coverage (no `any`)
- Jest unit tests for `packages/core`
- Manual tests for API and frontend
- Use sample JSON-based tests for pension computation validation
- Maintain consistent TypeScript strictness across workspaces

---

## 🧠 Copilot Behavior Guidelines

When completing code or responding to prompts:
1. Always use TypeScript with explicit types.
2. Write functional, composable, and modular code.
3. Never hard-code constants — always import them from `/packages/data/json`.
4. Follow clean architecture: Controller → Service → Core Logic.
5. Add JSDoc / TSDoc comments for all public functions.
6. Handle errors gracefully with clear messages.
7. Use English variable names, Polish comments allowed for domain concepts (e.g. `// waloryzacja = valorization`).

---

## 🧩 Example Prompts for Copilot

**Core logic example**

Implement a function calculatePension(input: SimulateInput): SimulationResult
inside packages/core. Use macroeconomic data from @data/macro.json and apply
ZUS rules for annual and quarterly valorization. Return both nominal and real
pension values and yearly capital trajectory.


**Frontend example**

Create a React form to collect user inputs (birthYear, gender, startWorkYear,
salary, absenceFactor). On submit, call POST /api/simulate and display results
on a ResultPage with chart and download buttons for PDF and XLS.
Follow the ZUS green color theme.


---

## 🏁 Deliverables Expected for HackYeah

Copilot should assist in generating:
- A fully working pension simulator (frontend + backend)
- Correct and verifiable pension calculation engine
- Accessible, visually consistent UI (ZUS brand)
- Exportable reports (PDF and XLS)
- README and demo-ready documentation

---

**Author:** HackYeah 2025 — ZUS Challenge  
**Maintainer:** Kamil Musiał  
**Repository:** https://github.com/kamilmusial/zus-retirement-simulator  
**Version:** 1.0.0
