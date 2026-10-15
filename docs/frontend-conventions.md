# Frontend conventions

Short rules every screen follows. Read before adding a page.

## Stack
- Next.js 16 App Router (`src/app`), React 19, TypeScript strict, Tailwind CSS v4 (tokens in `src/app/globals.css` `@theme`).
- Route params are Promises: `export default async function Page({ params }: { params: Promise<{ id: string }> }) { const { id } = await params; }`.
- Don't use `LayoutProps<...>`/`PageProps<...>` global helpers — type props explicitly.
- Charts: `recharts` via wrappers in `src/components/charts`. Map: `src/components/map/WorldMap.tsx` (d3-geo). Icons: `lucide-react`.

## Layers (never skip one)
1. `src/domain/types.ts` — data contracts. Don't change shapes casually.
2. `src/data/*` — versioned datasets (sourced) + clearly labelled demo data (`workspace-demo.ts`).
3. `src/services` — repositories. UI calls `services.<repo>.<method>()` from `@/services` — never imports `@/data/*` directly (exception: none).
4. `src/lib` — pure logic: `economics/` (LCOH), `filters.ts`, `aggregate.ts`, `format.ts`, `labels.ts`. Unit tested with Vitest (`*.test.ts`).
5. `src/components/ui` — primitives; `components/charts`, `components/map`, `components/app` (shell); feature components in `src/features/<feature>/`.
6. `src/app/...` — routes stay thin: compose feature components.

## Data fetching in client components
```tsx
"use client";
import { services } from "@/services";
import { useResource } from "@/hooks/useResource";
import { ResourceView, LoadingRows, EmptyState } from "@/components/ui/States";

const res = useResource(`projects:${JSON.stringify(query)}`, () => services.projects.list(query));
<ResourceView resource={res} isEmpty={(d) => d.length === 0} empty={<EmptyState title="No projects match" body="Clear a filter" />}>
  {(projects) => <Table rows={projects} />}
</ResourceView>
```
`useResource` keeps previous data while refetching (`res.isFetching`) — show a subtle "Updating…" indicator instead of a skeleton on filter changes.

## UI primitives (src/components/ui)
- `Button`, `ButtonLink`, `buttonClass()` — variants `primary | secondary | mint | ghost | outline-light | link`, sizes `sm | md | lg`.
- `Badge` (tones ok/warn/bad/info/violet/neutral), `OriginTag` (sourced / demo / preview / planned).
- `ProjectStatusPill`, `OpportunityStatusPill`, `VerificationPill`.
- `Panel` (card with title/subtitle/actions/footer), `Stat`.
- `Fields`: `TextField`, `TextArea`, `SelectField`, `SearchInput`, `Chip`, `Checkbox`, `Segmented` (tabs / view toggles).
- `Drawer` (side panel or centered modal: `side="center"`).
- `States`: `Skeleton`, `LoadingRows`, `EmptyState`, `ErrorState`, `ResourceView`.
- `Sources`: `SourceLink`, `ProvenanceBlock` (verification + sources + notes), `DatasetNote` (footnote under aggregate metrics).
- App shell: `PageHeader` (eyebrow/title/description/actions/meta) and `PageBody` from `@/components/app/AppShell`.

## Visual language (Arcadia-derived)
- Page `bg-page` (#f3f1ec); content cards `bg-paper` white, `rounded-card` (16px), `border border-line-2`, `shadow-card`.
- Headlines DM Sans **light (300)**; body 14–15px `text-ink-2`; labels 12px `text-muted`; numbers `num` class (tabular).
- Eyebrows: `className="eyebrow"` (violet uppercase).
- Primary action: forest green `Button`; on dark sections use `variant="mint"`.
- Status colours always paired with a text label. Chart colours from `components/charts/theme.ts` `SERIES` in fixed order; colour follows the entity.
- Dense tables: 13–14px text, `border-b border-line-2` rows, sticky header `bg-paper-2`, hover `bg-paper-2`.
- Mobile: everything must work at 375px (tables scroll horizontally inside their card; filters collapse into a Drawer).

## Data credibility rules
- Every aggregate shows a `DatasetNote` with dataset scope + compile date (`services.<repo>.info()`).
- Never present demo data as real: use `OriginTag origin="demo"` and say so in copy.
- Unknown values render as "Undisclosed" / "—", never 0.
- Vendor specs are labelled vendor claims. Prices only when `publicPrice` exists; otherwise "Quotation required".
- No button without an action. Unimplemented features: disabled button + `OriginTag origin="planned"` or a short explanation.
- Never claim an application was submitted, a quote was sent, or a live feed is connected.
