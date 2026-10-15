# Reference notes: BuckleBridge and Rystad Hydrogen & Derivatives

Public pages reviewed 2026-10-14. This is our own summary. Provider figures are their claims and are not independently checked.

## (a) BuckleBridge (bucklebridge.com)

A UK/European energy-intelligence site covering renewables, storage, hydrogen and e-fuels. Core tools are free, detailed outputs are email-gated, and "Pro" tiers are announced but not yet active. The methodology page says all outputs are indicative screening estimates, not design, safety, regulatory or investment advice.

| Tool | Status shown | Purpose |
|---|---|---|
| LCOH Calculator `/lcoh` | Free, no beta label; details email-gated | Single-scenario annual LCOH |
| European Power Map `/power-price-forecast` | No status label | Day-ahead prices by bidding zone |
| Opportunity Radar | Free feed in beta; Radar Pro planned | Match a supplier's offering to tenders and projects |
| Energy Project Simulator | BETA; Pro planned (€49/month, activation pending) | Replay project operation against price series |
| H₂ Project Atlas `/project-map` | No status label; snapshot 19 Apr 2026 | Map of hydrogen project records |
| Standards Finder | No status label; 43 standards | Filterable hydrogen standards library |
| LCOH Benchmarking Guide | Sept 2026 PDF, email-gated | 16-page guide |

**LCOH calculator**
- **Inputs:** currency, plant capacity, CAPEX (€/kW), lifetime, discount rate, capacity factor, kWh/kg, electricity price, water use and price, fixed O&M (% of CAPEX), variable O&M (€/kg), stack replacement (% of CAPEX and interval in years), sell price.
- **Worked example:** 20 MW, €850/kW, 20 years, 8%, 85%, 52 kWh/kg, €0.045/kWh, 3% fixed O&M, €0.45/kg variable O&M, 18% stack replacement every 7 years. The page doesn't say whether these are also the form defaults.
- **Free output:** headline LCOH and annual production.
- **Gated output:** cost breakdown, NPV, one-way sensitivities, and Excel/CSV/PDF exports.
- **Method:** annual utilisation with no hourly profile, and capital annualised with a capital recovery factor.
- **Not modelled:** degradation.
- **Excluded:** generation and grid connection, compression and storage, development costs, taxes, subsidies, carbon value, and curtailment.

**European Power Map**
- **Coverage:** 29 countries and 42 zones. Data comes from OMIE, SMARD and Energinet.
- **Handling:** weighted daily averages, and correct handling of daylight-saving days.
- **Status labels:** "No source data", "Not connected" and "Partial". Missing prices are never shown as zero.
- **Limits:** wholesale prices only, with no network charges or taxes. They are not forecasts.

**Opportunity Radar**
- **Sources:** TED notices, project announcements and the UK planning database (REPD), refreshed weekly.
- **Match score:** a screening score, not a win probability. Evidence is tagged confirmed, partly confirmed, inferred or unpublished.
- **Exclusions:** stale and cancelled records. The free tier hides the top 80% of matches.

**Simulator**
- **Pathways:** electrolysis, e-methanol, several SAF routes, HVO, batteries, PV and wind.
- **Price input:** Power Map prices or an uploaded CSV, up to 366 days.
- **Limits:** dispatch follows fixed rules. Minimum load, ramps and outages are not modelled. Costs are illustrative.

**Atlas**
- **Filters:** status, technology and region.
- **Caveats:** records reflect what the sources say and are not re-verified. Phases may overlap, and locations are indicative.

**Standards Finder**
- **Filters:** technology, project stage, jurisdiction and focus area.
- **Caveats:** results don't certify compliance. Standards are bought through quote requests.

## (b) Rystad Energy – Hydrogen & Derivatives Solution

A subscription product on Rystad's Spektra platform, with three modules:

- **Market database:** asset-level data and short- and long-term outlooks.
- **Value chain:** technologies, competitive landscape and service-market size.
- **Economic analysis:** production cost and valuation for blue and green hydrogen, ammonia and methanol, through a scenario calculator.

**Terminology**
- Supply assets are tracked by **feedstock, technology and end product**.
- Each asset is scored against **risk categories** to judge its likelihood of success.
- Demand is split by country and **demand segment**.
- **Electrolyzer contract agreements** are tracked.

**Access:** web workspaces, an API, MCP, Excel/Python/Power BI connectors and an LLM front end ("AskRystad").

**Not stated:** a forecast horizon or e-fuels coverage.

**Provider claims:** 5,000+ assets, 17 risk categories, 15 demand segments and 120+ electrolyzer contracts.

## Implications for our MVP

1. **Inputs.** Our `LcohInputs` already goes further than BuckleBridge's calculator, with degradation, grid fees, variable O&M per MWh and stack life in hours. We shouldn't adopt their illustrative defaults (€850/kW). Instead, prefill from `src/data/benchmarks.ts`, for example the Observatory's 2,310–2,503 €/kW, and show the sourced range beside each field.
2. **Show exclusions next to the result.** The European Hydrogen Observatory calculator also separates grid fees and taxes, and uses the 4,000 cheapest wholesale hours. That makes a useful default for grid-connected cases.
3. **Free vs gated.** A free headline LCOH with a gated breakdown and exports is the norm. One-way sensitivities on power price, utilisation, kWh/kg, CAPEX and stack replacement are the expected minimum.
4. **Status vocabulary.** Adopt "not connected / no data / partial" labels, never show zero for missing data, and tag evidence as confirmed or inferred. This maps onto our `VerificationStatus` and `DataOrigin`.
5. **Atlas caveats.** Show the snapshot date, mark indicative locations (`GeoPoint.precision`) and warn about overlapping phases.
6. **Later differentiators.** Rystad-style risk scoring per asset, demand by segment and an electrolyser supply-contract tracker. These could extend `HydrogenProject` and `PublicDeal` (`kind: "supply-contract"`).
