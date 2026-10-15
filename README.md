# IKEHU OS — Hydrogen Intelligence & Engineering OS (frontend)

Frontend-only first release of a hydrogen market-intelligence, economics and project-delivery platform: a marketing website plus an interactive application preview. All interactions run in the browser against versioned local datasets compiled from public sources. There is **no backend, authentication, live data feed or transaction** in this phase.

Product name: "IKEHU OS". Rebrand in `src/config/brand.ts` and `src/components/ui/Logo.tsx`.

## Run

```bash
npm install
npm run dev        # http://localhost:3100
npm test           # Vitest — calculation, aggregation and feature-model tests
npm run typecheck  # tsc --noEmit
npm run lint
npm run build
```

Node 20+ (developed on Node 22). Copy `.env.example` to `.env.local` to change providers.

## What's where

| Area | Route | Code |
|---|---|---|
| Homepage | `/` | `src/app/(site)/page.tsx`, `src/components/marketing/*` |
| Platform overview, data layer, roadmap | `/platform` | `src/app/(site)/platform` |
| Module pages (6) | `/solutions/[slug]` | content in `src/config/solutions.ts` |
| Public LCOH calculator | `/calculator` | `src/features/calculator` |
| Hydrogen Project Atlas | `/atlas` | `src/features/projects/ProjectAtlas.tsx` |
| Data & methodology | `/data` | `src/app/(site)/data` |
| Request a demo (validated form) | `/demo` | `src/features/leads` |
| **1 · Dashboard** | `/app` | `src/features/dashboard` |
| **2 · Project Intelligence** (table / map / detail) | `/app/projects`, `/app/projects/[id]` | `src/features/projects` |
| **3 · LCOH Calculator** | `/app/calculator` | `src/features/calculator` |
| **4 · Energy Markets** | `/app/markets` | `src/features/markets` |
| **5 · Technology & Suppliers** (catalogue, compare, RFQ) | `/app/suppliers` | `src/features/suppliers` |
| **6 · Opportunity Radar** (+ checklist, review assistant) | `/app/opportunities`, `/app/opportunities/[id]` | `src/features/opportunities` |
| **7 · Companies & Investors** (+ due diligence) | `/app/companies`, `/app/companies/[id]` | `src/features/companies` |
| Project Workspace (demo data) | `/app/workspace` | `src/features/workspace` |
| Sources & Methodology | `/app/sources` | `src/features/sources` |

Deep links between modules: `/app/calculator?price=&zone=&capacity=&technology=`, `/app/projects?project=<id>`.

## Architecture

```
src/
  domain/types.ts      Typed data contracts (projects, suppliers, investors, opportunities, prices, scenarios…)
  data/                Versioned datasets (sourced) + clearly labelled demo data
  services/
    contracts.ts       Repository interfaces — the only API the UI uses
    mock/              Implementation over src/data (async, simulated latency)
    http/              REST implementation for the future platform API (endpoint contract documented in the file)
    index.ts           Picks the provider from NEXT_PUBLIC_DATA_PROVIDER
  lib/
    economics/         LCOH model + sensitivity (pure, unit-tested)
    filters.ts, aggregate.ts, format.ts, labels.ts
  hooks/useResource.ts Loading / error / success state with stale-while-refetch
  components/
    ui/                Design-system primitives (Button, Badge, Panel, Fields, Drawer, States, Sources…)
    charts/ map/       Recharts wrappers, d3-geo world map
    app/ marketing/    Platform shell, site header/footer/sections
  features/<module>/   Screen-level components per module
  app/                 Next.js routes — thin; compose features
```

Rules for contributors are in [`docs/frontend-conventions.md`](docs/frontend-conventions.md). Research notes on the reference products are in [`docs/research/reference-notes.md`](docs/research/reference-notes.md).

### Design system

Tokens live in `src/app/globals.css` (`@theme`): warm stone page, white 16 px cards, deep-green dark sections, mint highlight, violet eyebrows, DM Sans light-weight display type, 8 px buttons. The categorical chart palette was validated for colour-blind separation and contrast; chart colours follow entities, never rank. Marketing and platform share every token and primitive.

## Data

All datasets are in `src/data`, compiled **14 Oct 2026**:

| File | Content |
|---|---|
| `projects.ts` | 30 real hydrogen projects (all regions; operational → cancelled), each with sources, verification status and last-verified date |
| `suppliers.ts` | 16 manufacturers, 29 products — specifications are vendor claims; one public price (ITM Power) |
| `companies.ts` / `investors.ts` | 15 companies and 13 investors with publicly documented deals only |
| `opportunities.ts` | 15 funding calls, auctions and TED tenders; status computed at snapshot date (several closed/historical by design) |
| `insights.ts` / `benchmarks.ts` | Headline findings and LCOH input benchmarks (IEA, European Hydrogen Observatory, Clean Hydrogen Partnership, IRENA, ACER, ECA, EU auctions) |
| `electricity-prices.ts` | Real day-ahead monthly averages Jan 2023 – Sep 2026 for 18 bidding zones + 3 hourly sample days (Elering/Nord Pool, Fraunhofer ISE Energy-Charts; gaps documented) |
| `scenarios.ts` | Conservative / base / optimistic LCOH presets with visible assumptions and benchmark references |
| `workspace-demo.ts` | **Demo data** for the delivery workspace preview — fictional, labelled as such in the UI |
| `manifest.ts` | Dataset versions, compile dates and scope |

Counts are research-sample sizes, not claims about market coverage. Aggregate figures on screen are always computed from these records.

## LCOH method

`src/lib/economics/lcoh.ts` — discounted levelised cost in real terms:

`LCOH = [CAPEX₀ + Σ (OPEXₜ + Stackₜ)(1+r)⁻ᵗ] / Σ H₂ₜ(1+r)⁻ᵗ`

Financing enters once via the discount rate (the CRF is reported, never added). Stack replacements follow cumulative hours; degradation raises SEC and lowers output at constant power. Plant-gate scope: excludes compression, storage, transport, taxes, subsidies and by-product revenue. Tests in `lcoh.test.ts` check the closed-form cases (CRF equivalence, unit conversions, replacements, breakdown sums). NPV/IRR are not inferred from LCOH; a cash-flow model is on the roadmap.

## Adding a real API

1. Set `NEXT_PUBLIC_DATA_PROVIDER=http` and `NEXT_PUBLIC_API_BASE_URL`.
2. Implement the endpoints listed at the top of `src/services/http/index.ts` returning the types in `src/domain/types.ts`.
3. Add auth headers in `request()` there once authentication exists.
4. For a hybrid setup, compose a `DataServices` object in `src/services/index.ts` that mixes mock and HTTP repositories per domain.

No component changes are needed: screens depend on `services` and the domain types only.

## Known limitations of this phase

- No live electricity, project or tender feeds; data is a dated snapshot.
- RFQs, demo requests and tender reviews are simulated client-side and explicitly not transmitted. The tender review assistant is rule-based, not an AI model.
- Checklist progress is stored only in the browser (localStorage).
- Workspace content is demo data.
