import type { Benchmark, SourceRef } from "@/domain/types";

/**
 * Sourced benchmark ranges for sanity-checking LCOH calculator inputs.
 *
 * Rules: low / central / high are copied exactly from the cited source (no
 * interpolation, no currency conversion). Where a source publishes a single
 * point estimate, low = central = high and the scope says so. Units are kept
 * as published (e.g. USD/kWe is NOT converted to EUR).
 * All sources checked on 2026-10-14.
 */

const IEA_GHR26_ANNEX: SourceRef = {
  url: "https://iea.blob.core.windows.net/assets/c32f2c59-38ce-40d4-a424-9b20c9d7a149/GlobalHydrogenReview2026_AssumptionsAnnex1.pdf",
  title: "Global Hydrogen Review 2026: Assumptions Annex",
  publisher: "International Energy Agency (IEA)",
  publishedAt: "2026-06-18",
};

const EHO_MARKET_2025: SourceRef = {
  url: "https://observatory.clean-hydrogen.europa.eu/sites/default/files/2025-11/The%20European%20hydrogen%20market%20landscape_November%202025.pdf",
  title: "The European hydrogen market landscape – November 2025",
  publisher: "European Hydrogen Observatory (Clean Hydrogen Partnership)",
  publishedAt: "2025-11",
};

const EHO_LCOH_MANUAL_2025: SourceRef = {
  url: "https://observatory.clean-hydrogen.europa.eu/sites/default/files/2025-05/Manual%20-%20LCOH%20calculator_Update%202025_v3_1.pdf",
  title: "Manual – Levelised Cost of Hydrogen (LCOH) Calculator – May 2025",
  publisher: "European Hydrogen Observatory (Clean Hydrogen Partnership)",
  publishedAt: "2025-05",
};

const CHJU_SRIA_KPIS: SourceRef = {
  url: "https://www.clean-hydrogen.europa.eu/knowledge-management/strategy-map-and-key-performance-indicators/clean-hydrogen-ju-sria-key-performance-indicators-kpis_en",
  title: "Clean Hydrogen JU SRIA Key Performance Indicators (KPIs)",
  publisher: "Clean Hydrogen Partnership (Clean Hydrogen JU)",
};

const IRENA_WATER_2023: SourceRef = {
  url: "https://www.irena.org/-/media/Files/IRENA/Agency/Publication/2023/Dec/IRENA_Bluerisk_Water_for_hydrogen_production_2023.pdf",
  title: "Water for hydrogen production (IRENA & Bluerisk), Table 2.1",
  publisher: "International Renewable Energy Agency (IRENA)",
  publishedAt: "2023-12",
};

const SRIA_SCOPE =
  "Clean Hydrogen JU SRIA KPI table, electricity consumption at nominal capacity. high = 2020 state of the art, central = 2024 target, low = 2030 target.";

export const BENCHMARKS: Benchmark[] = [
  /* CAPEX ----------------------------------------------------------- */
  {
    id: "bm-capex-electrolysis-global-iea",
    parameter: "Installed water-electrolysis system CAPEX (global average)",
    unit: "USD/kWe",
    low: 1920,
    high: 2500,
    scope:
      "IEA GHR 2026 assumptions, 2025 values, technology-agnostic. Includes electrolyser system, electrical equipment, gas treatment, plant balancing and EPC; excludes power generation assets. Kept in USD as published (not converted). Same table: China 550–1100 USD/kWe; STEPS 2030 global 1440–1870 USD/kWe.",
    year: 2025,
    source: IEA_GHR26_ANNEX,
  },
  {
    id: "bm-capex-alkaline-europe",
    parameter: "Installed alkaline electrolyser CAPEX (Europe)",
    unit: "€/kW",
    low: 2310,
    central: 2310,
    high: 2310,
    scope:
      "Single point estimate (no range published) for total alkaline CAPEX in Europe, 2024: stack 323, BoP 693, other utilities 693, other CAPEX 601 €/kW. Reported OPEX 46.2 €/kW/yr.",
    year: 2024,
    source: EHO_MARKET_2025,
  },
  {
    id: "bm-capex-pem-europe",
    parameter: "Installed PEM electrolyser CAPEX (Europe)",
    unit: "€/kW",
    low: 2503,
    central: 2503,
    high: 2503,
    scope:
      "Single point estimate (no range published) for total PEM CAPEX in Europe, 2024: stack 563, BoP 647, other utilities 693, other CAPEX 601 €/kW. Reported OPEX 50.1 €/kW/yr.",
    year: 2024,
    source: EHO_MARKET_2025,
  },

  /* Efficiency ------------------------------------------------------ */
  {
    id: "bm-efficiency-alkaline",
    parameter: "Electricity consumption – alkaline (AEL)",
    unit: "kWh/kg H₂",
    low: 48,
    central: 49,
    high: 50,
    scope: SRIA_SCOPE,
    year: 2024,
    source: CHJU_SRIA_KPIS,
  },
  {
    id: "bm-efficiency-pem",
    parameter: "Electricity consumption – PEM (PEMEL)",
    unit: "kWh/kg H₂",
    low: 48,
    central: 52,
    high: 55,
    scope: SRIA_SCOPE,
    year: 2024,
    source: CHJU_SRIA_KPIS,
  },
  {
    id: "bm-efficiency-soec",
    parameter: "Electricity consumption – solid oxide (SOEL)",
    unit: "kWh/kg H₂",
    low: 37,
    central: 39,
    high: 40,
    scope: `${SRIA_SCOPE} Excludes heat demand (9.9 / 9 / 8 kWh/kg for 2020 / 2024 / 2030).`,
    year: 2024,
    source: CHJU_SRIA_KPIS,
  },

  /* Durability & degradation --------------------------------------- */
  {
    id: "bm-stack-lifetime-iea",
    parameter: "Electrolyser stack lifetime",
    unit: "operating hours",
    low: 50000,
    central: 50000,
    high: 95000,
    scope:
      "IEA GHR 2026 modelling value of 50,000 h (economic optimum considering degradation) for 2025 and 2030; the annex notes stack lifetime can reach up to 95,000 h. Technology-agnostic.",
    year: 2025,
    source: IEA_GHR26_ANNEX,
  },
  {
    id: "bm-degradation-alkaline",
    parameter: "Stack degradation – alkaline (AEL)",
    unit: "% per 1,000 h",
    low: 0.1,
    central: 0.11,
    high: 0.12,
    scope:
      "Clean Hydrogen JU SRIA KPI, efficiency loss at nominal capacity. high = 2020 state of the art, central = 2024 target, low = 2030 target.",
    year: 2024,
    source: CHJU_SRIA_KPIS,
  },
  {
    id: "bm-degradation-pem",
    parameter: "Stack degradation – PEM (PEMEL)",
    unit: "% per 1,000 h",
    low: 0.12,
    central: 0.15,
    high: 0.19,
    scope:
      "Clean Hydrogen JU SRIA KPI, efficiency loss at nominal capacity. high = 2020 state of the art, central = 2024 target, low = 2030 target. (SOEL is reported on a different basis: 1.9 / 1 / 0.5 %/1,000 h as production-rate loss.)",
    year: 2024,
    source: CHJU_SRIA_KPIS,
  },

  /* O&M, water, finance -------------------------------------------- */
  {
    id: "bm-fixed-om-iea",
    parameter: "Fixed O&M (water electrolysis)",
    unit: "% of CAPEX per year",
    low: 3,
    central: 3,
    high: 3,
    scope:
      "IEA GHR 2026 single assumption for 2025 and 2030 (no range published). Excludes stack replacement. Water costs and oxygen revenues are not considered in IEA's electrolysis cost analysis.",
    year: 2025,
    source: IEA_GHR26_ANNEX,
  },
  {
    id: "bm-water-pem",
    parameter: "Water consumption – PEM electrolysis",
    unit: "L/kg H₂",
    low: 17.0,
    central: 17.52,
    high: 18.04,
    scope:
      "Consumption intensity (water not returned), min / average / max. Withdrawal intensity is higher: 24.94 / 25.70 / 26.46 L/kg. Includes treatment and cooling; limited data points for PEM.",
    year: 2023,
    source: IRENA_WATER_2023,
  },
  {
    id: "bm-water-alkaline",
    parameter: "Water consumption – alkaline electrolysis",
    unit: "L/kg H₂",
    low: 20.96,
    central: 22.28,
    high: 23.59,
    scope:
      "Consumption intensity (water not returned), min / average / max. Withdrawal intensity is higher: 29.88 / 32.24 / 34.61 L/kg.",
    year: 2023,
    source: IRENA_WATER_2023,
  },
  {
    id: "bm-wacc-eho",
    parameter: "Cost of capital (WACC)",
    unit: "% per year",
    low: 6,
    central: 6,
    high: 8,
    scope:
      "European Hydrogen Observatory LCOH calculator: default cost of capital 6% (with 25-year economic lifetime, per Hydrogen Europe); 8% (with 15-year lifetime) is the manual's higher-risk sensitivity case.",
    year: 2025,
    source: EHO_LCOH_MANUAL_2025,
  },

  /* Reported LCOH --------------------------------------------------- */
  {
    id: "bm-lcoh-renewable-europe",
    parameter: "LCOH – electrolysis directly connected to renewables (Europe)",
    unit: "€/kg H₂",
    low: 4.3,
    central: 6.7,
    high: 10.5,
    scope:
      "Range across European countries in 2024; central = all-country average (median 6.4 €/kg). Modelled estimate, not observed plant costs. Grid-connected electrolysis for comparison: 4.1–16.1 €/kg, average 7.4 €/kg.",
    year: 2024,
    source: EHO_MARKET_2025,
  },
  {
    id: "bm-lcoh-grey-smr-europe",
    parameter: "LCOH – grey hydrogen via SMR (Europe)",
    unit: "€/kg H₂",
    low: 3.33,
    central: 3.33,
    high: 3.33,
    scope:
      "European average for 2024 (no numeric country minimum published). Highest country: Luxembourg 4.59 €/kg; several countries below 3.00 €/kg. Marginal costs alone 3.07 €/kg. SMR with carbon capture averaged 4.12 €/kg (excl. CO₂ transport & storage).",
    year: 2024,
    source: EHO_MARKET_2025,
  },
];
