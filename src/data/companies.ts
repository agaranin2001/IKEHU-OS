import type { Company, SourceRef } from "@/domain/types";

/**
 * Sourced company profiles for the Investment & Company Intelligence screen.
 *
 * Deals are limited to publicly documented partnerships, funding rounds,
 * JVs, acquisitions and supply contracts, each linked to a primary source
 * (company press release, regulator filing or lender announcement).
 * Amounts are only given where the source discloses them. No valuations,
 * revenue figures or financial-health speculation are included.
 */

const VERIFIED_AT = "2026-10-14";

/* ------------------------------------------------------------------ */
/* Deal sources                                                        */
/* ------------------------------------------------------------------ */

const NEL_SAMSUNG: SourceRef = {
  url: "https://nelhydrogen.com/press-release/nel-asa-signs-collaboration-agreement-and-conducts-private-placement-with-samsung-ea/",
  title: "Nel ASA: Signs collaboration agreement and conducts private placement with SAMSUNG E&A",
  publisher: "Nel ASA",
  publishedAt: "2025-03-11",
};
const ITM_REFHYNE2: SourceRef = {
  url: "https://itm-power.com/news/100mw-refhyne-ii-contract-signed",
  title: "100MW REFHYNE II Contract Signed",
  publisher: "ITM Power",
  publishedAt: "2024-08-13",
};
const STEGRA_TKN: SourceRef = {
  url: "https://stegra.com/news-and-stories/thyssenkrupp-nucera-and-h2-green-steel-partner-for-one-of-the-largest-electrolysis-plants-globally-",
  title: "thyssenkrupp nucera and H2 Green Steel partner for one of the largest electrolysis plants globally",
  publisher: "Stegra (formerly H2 Green Steel)",
  publishedAt: "2023-05-22",
};
const STEGRA_FINANCING_2026: SourceRef = {
  url: "https://news.cision.com/stegra/r/stegra-announces-closing-of--1-4-billion-financing-round,c4366881",
  title: "Stegra announces closing of €1.4 billion financing round",
  publisher: "Stegra",
  publishedAt: "2026-06-24",
};
const SUNFIRE_EIB: SourceRef = {
  url: "https://www.eib.org/press/all/2024-092-germany-based-sunfire-gets-up-to-eur100-million-in-eib-support-for-green-hydrogen",
  title: "Germany-based Sunfire gets up to €100 million in EIB support for green hydrogen",
  publisher: "European Investment Bank",
  publishedAt: "2024-03-05",
};
const SUNFIRE_SERIES_E: SourceRef = {
  url: "https://www.investegate.co.uk/announcement/rns/hydrogen-capital-growth--hgen/sunfire-gmbh-announces-signficant-new-funding/8070789",
  title: "Sunfire GmbH announces significant new funding (RNS)",
  publisher: "HydrogenOne Capital Growth plc",
  publishedAt: "2024-03-05",
};
const HEXPURUS_AIR_LIQUIDE: SourceRef = {
  url: "https://hexagonpurus.com/news/hexagon-purus-signs-multi-year-global-agreement-for-type-4-hydrogen-cylinders",
  title: "Hexagon Purus signs multi-year global agreement for Type 4 hydrogen cylinders",
  publisher: "Hexagon Purus",
  publishedAt: "2021-05-20",
};
const LHYFE_LOAN: SourceRef = {
  url: "https://www.lhyfe.com/press/lhyfe-successfully-closes-its-first-corporate-syndicated-loan-for-an-amount-of-e28m/",
  title: "Lhyfe successfully closes its first corporate syndicated loan for an amount of €28m",
  publisher: "Lhyfe",
  publishedAt: "2023-12-12",
};
const LHYFE_GRANT: SourceRef = {
  url: "https://www.lhyfe.com/press/lhyfe-confirms-record-e149-million-subsidy-from-the-french-government-for-one-of-its-largest-upcoming-production-sites/",
  title: "Lhyfe confirms record €149 million subsidy from the French government for one of its largest upcoming production sites",
  publisher: "Lhyfe",
  publishedAt: "2025-04-17",
};
const LHYFE_STRATEGY_2025: SourceRef = {
  url: "https://www.lhyfe.com/press/lhyfe-confirms-doubling-its-2025-revenues-year-on-year-focuses-its-development-strategy-and-targets-growth-in-new-end-markets/",
  title: "Lhyfe confirms doubling its 2025 revenues year on year, focuses its development strategy",
  publisher: "Lhyfe",
  publishedAt: "2025-12-19",
};
const NGHC_FINANCIAL_CLOSE: SourceRef = {
  url: "https://www.sec.gov/Archives/edgar/data/2969/000119312523149976/d431193dex991.htm",
  title: "NEOM Green Hydrogen Company completes financial close at a total investment value of USD 8.4 billion (Air Products 8-K, Exhibit 99.1)",
  publisher: "Air Products and Chemicals, Inc. (SEC filing)",
  publishedAt: "2023-05-22",
};
const AIR_PRODUCTS_EXIT_2025: SourceRef = {
  url: "https://www.sec.gov/Archives/edgar/data/2969/000119312525033509/d830166dex991.htm",
  title: "Air Products to Exit Three U.S.-Based Projects (8-K, Exhibit 99.1)",
  publisher: "Air Products and Chemicals, Inc. (SEC filing)",
  publishedAt: "2025-02-24",
};
const RELY_CLOSING: SourceRef = {
  url: "https://www.ten.com/en/media/press-releases/technip-energies-and-john-cockerill-reach-closing-rely-new-company-dedicated",
  title: "Technip Energies and John Cockerill reach closing of Rely, new company dedicated to green hydrogen",
  publisher: "Technip Energies",
  publishedAt: "2023-11-30",
};
const HYDROGENIOUS_50M: SourceRef = {
  url: "https://hydrogenious.net/50m-funding/",
  title: "Hydrogenious LOHC Technologies raises €50 million",
  publisher: "Hydrogenious LOHC Technologies",
  publishedAt: "2021-09-13",
};
const EH2_SERIES_C: SourceRef = {
  url: "https://eh2.com/electric-hydrogen-raises-380-million-to-transform-the-economics-of-green-hydrogen-production/",
  title: "Electric Hydrogen Raises $380 Million to Transform the Economics of Green Hydrogen Production",
  publisher: "Electric Hydrogen",
  publishedAt: "2023-10-03",
};
const EH2_INFINIUM: SourceRef = {
  url: "https://eh2.com/infinium-will-deploy-hyprplant-for-roadrunner/",
  title: "Infinium will deploy Electric Hydrogen's HYPRPlant at large-scale eFuels facility in Texas",
  publisher: "Electric Hydrogen",
  publishedAt: "2025-05-19",
};
const EH2_AMBIENT: SourceRef = {
  url: "https://eh2.com/electric-hydrogen-ambient-fuels-generate-capital/",
  title: "Electric Hydrogen acquires Ambient Fuels; establishes global project financing capability with Generate Capital",
  publisher: "Electric Hydrogen",
  publishedAt: "2025-09-08",
};
const HYSATA_SERIES_B: SourceRef = {
  url: "https://hysata.com/news/hysata-announces-111m-usd-series-b-investment-round/",
  title: "Hysata announces $111m USD Series B investment round",
  publisher: "Hysata",
  publishedAt: "2024-05-08",
};
const STARGATE_SEED: SourceRef = {
  url: "https://stargatehydrogen.com/news/stargate-hydrogen-raises-fund/",
  title: "Stargate Hydrogen raises 42 million Euros for scaling-up",
  publisher: "Stargate Hydrogen",
  publishedAt: "2024-05-02",
};
const STARGATE_SERIES_A: SourceRef = {
  url: "https://stargatehydrogen.com/news/stargate-hydrogen-raises-11-million-euro/",
  title: "Stargate Hydrogen raises 11 million Euro Series A for scaling up precious metal free electrolysers",
  publisher: "Stargate Hydrogen",
  publishedAt: "2025-03-03",
};
const ELCOGEN_HD_HYUNDAI: SourceRef = {
  url: "https://elcogen.com/hd-hyundai-makes-a-strategic-investment-in-elcogen/",
  title: "HD Hyundai makes a strategic investment in Elcogen",
  publisher: "Elcogen",
  publishedAt: "2023-10-11",
};
const ELCOGEN_BAKER_HUGHES: SourceRef = {
  url: "https://elcogen.com/with-a-strategic-investment-from-baker-hughes-elcogen-closes-its-current-funding-round-raising-overall-e140m",
  title: "With a strategic investment from Baker Hughes, Elcogen closes its current funding round, raising overall €140m",
  publisher: "Elcogen",
  publishedAt: "2024-04-03",
};
const ELCOGEN_EIB: SourceRef = {
  url: "https://www.eib.org/en/press/all/2019-041-innovfin-eur-12-million-loan-from-eu-to-estonian-clean-tech-company-elcogen",
  title: "InnovFin: €12 million loan from EU to Estonian clean tech company Elcogen",
  publisher: "European Investment Bank",
  publishedAt: "2019",
};

/* ------------------------------------------------------------------ */
/* Companies                                                           */
/* ------------------------------------------------------------------ */

export const COMPANIES: Company[] = [
  /* ---------------- Manufacturers (linked to supplier catalogue) ---------------- */
  {
    id: "co-nel",
    name: "Nel ASA",
    categories: ["electrolyser-manufacturer"],
    country: "NO",
    countryName: "Norway",
    headquarters: "Oslo",
    founded: 1927,
    ownership: "Listed (Oslo: NEL)",
    technologyFocus: ["Atmospheric alkaline electrolysis", "PEM electrolysis"],
    description:
      "Norwegian electrolyser manufacturer producing alkaline electrolysers at Herøya and PEM electrolysers in Wallingford, Connecticut.",
    website: "https://nelhydrogen.com/",
    supplierId: "sup-nel",
    deals: [
      {
        id: "deal-nel-samsung-ea-2025",
        counterparty: "SAMSUNG E&A",
        year: 2025,
        kind: "equity",
        description:
          "EPC collaboration agreement letting SAMSUNG E&A offer complete hydrogen plants based on Nel electrolysers, combined with a direct placement of 167,132,530 new shares at NOK 2.1125, giving SAMSUNG E&A about 9.1% and making it Nel's largest single shareholder.",
        amount: { amount: 353_000_000, currency: "NOK", scope: "Private placement proceeds (approx.)" },
        source: NEL_SAMSUNG,
      },
    ],
    sources: [NEL_SAMSUNG],
    verifiedAt: VERIFIED_AT,
    verification: "verified",
    confidence: "high",
  },
  {
    id: "co-itm-power",
    name: "ITM Power PLC",
    categories: ["electrolyser-manufacturer"],
    country: "GB",
    countryName: "United Kingdom",
    headquarters: "Sheffield",
    founded: 2001,
    ownership: "Listed (LSE AIM: ITM)",
    technologyFocus: ["PEM electrolysis"],
    description:
      "UK PEM electrolyser manufacturer supplying TRIDENT stacks, containerised NEPTUNE plants and 20 MW POSEIDON modules.",
    website: "https://itm-power.com/",
    supplierId: "sup-itm-power",
    deals: [
      {
        id: "deal-itm-shell-refhyne-ii-2024",
        counterparty: "Shell (REFHYNE II, Wesseling)",
        year: 2024,
        kind: "supply-contract",
        description:
          "Contract signed after Shell's FID to supply 100 MW of TRIDENT stacks and skids for the REFHYNE II electrolyser at Shell's Rheinland Energy and Chemicals Park, with Linde Engineering as EPC integrator; operation planned for 2027.",
        amount: null,
        source: ITM_REFHYNE2,
      },
    ],
    sources: [ITM_REFHYNE2],
    verifiedAt: VERIFIED_AT,
    verification: "verified",
    confidence: "high",
  },
  {
    id: "co-thyssenkrupp-nucera",
    name: "thyssenkrupp nucera AG & Co. KGaA",
    categories: ["electrolyser-manufacturer"],
    country: "DE",
    countryName: "Germany",
    headquarters: "Dortmund",
    founded: null,
    ownership: "Listed (Frankfurt: NCH2); thyssenkrupp AG majority shareholder",
    technologyFocus: ["Alkaline water electrolysis", "Chlor-alkali electrolysis", "SOEC (development)"],
    description:
      "German electrolysis technology company whose standardised 20 MW scalum® alkaline module is used in large green hydrogen and green steel projects.",
    website: "https://thyssenkrupp-nucera.com/",
    supplierId: "sup-thyssenkrupp-nucera",
    deals: [
      {
        id: "deal-tkn-stegra-boden-2023",
        counterparty: "Stegra (then H2 Green Steel)",
        year: 2023,
        kind: "supply-contract",
        description:
          "Agreement reserving more than 700 MW of alkaline water electrolysis production capacity and plant engineering for the Boden green steel plant in Sweden.",
        amount: null,
        source: STEGRA_TKN,
      },
    ],
    sources: [STEGRA_TKN],
    verifiedAt: VERIFIED_AT,
    verification: "verified",
    confidence: "high",
  },
  {
    id: "co-sunfire",
    name: "Sunfire GmbH",
    categories: ["electrolyser-manufacturer"],
    country: "DE",
    countryName: "Germany",
    headquarters: "Dresden",
    founded: 2010,
    ownership: "Private (venture-backed)",
    technologyFocus: ["Pressurised alkaline electrolysis", "Solid oxide electrolysis (SOEC)"],
    description:
      "German electrolyser company industrialising both pressurised alkaline and solid oxide electrolysers under the HyLink® brand.",
    website: "https://www.sunfire.de/en/",
    supplierId: "sup-sunfire",
    deals: [
      {
        id: "deal-sunfire-series-e-2024",
        counterparty: "LGT Private Banking, GIC, Ahren Innovation Capital, Carbon Equity and existing shareholders",
        year: 2024,
        kind: "equity",
        description:
          "Series E equity round of €215 million, announced as part of a wider funding package of more than €500 million including EIB venture debt and previously approved grants.",
        amount: { amount: 215_000_000, currency: "EUR", scope: "Series E equity" },
        source: SUNFIRE_SERIES_E,
      },
      {
        id: "deal-sunfire-eib-2024",
        counterparty: "European Investment Bank",
        year: 2024,
        kind: "debt",
        description:
          "Venture debt of up to €100 million (€70 million signed at announcement), backed by InvestEU, for R&D and early production capacity for Sunfire's solid oxide (SOEC) stacks and modules.",
        amount: { amount: 100_000_000, currency: "EUR", scope: "Facility size (up to)" },
        source: SUNFIRE_EIB,
      },
    ],
    sources: [SUNFIRE_SERIES_E, SUNFIRE_EIB],
    verifiedAt: VERIFIED_AT,
    verification: "verified",
    confidence: "high",
    notes: "Series E figures come from a listed investor's regulatory announcement (HydrogenOne Capital Growth).",
  },

  /* ---------------- Project developers / offtakers ---------------- */
  {
    id: "co-stegra",
    name: "Stegra",
    categories: ["project-developer", "industrial-offtaker"],
    country: "SE",
    countryName: "Sweden",
    headquarters: "Stockholm",
    founded: 2020,
    ownership: "Private",
    technologyFocus: ["Green steel (H₂-DRI)", "Large-scale alkaline electrolysis"],
    description:
      "Swedish company, formerly H2 Green Steel, building an integrated green hydrogen, iron reduction and steel plant in Boden.",
    website: "https://stegra.com/",
    deals: [
      {
        id: "deal-stegra-thyssenkrupp-nucera-2023",
        counterparty: "thyssenkrupp nucera",
        year: 2023,
        kind: "supply-contract",
        description:
          "Reserved more than 700 MW of alkaline electrolysis capacity from thyssenkrupp nucera for the Boden plant.",
        amount: null,
        source: STEGRA_TKN,
      },
      {
        id: "deal-stegra-financing-round-2026",
        counterparty: "Wallenberg Investments-led consortium (IMAS, Temasek, Bolero, SEB-Stiftelsen) and existing shareholders",
        year: 2026,
        kind: "equity",
        description:
          "Closed a €1.4 billion financing round with lender-group approval and continued access to undrawn debt facilities from its 2024 financing; the project timeline was stated to be under review.",
        amount: { amount: 1_400_000_000, currency: "EUR", scope: "Financing round" },
        source: STEGRA_FINANCING_2026,
      },
    ],
    sources: [STEGRA_TKN, STEGRA_FINANCING_2026],
    verifiedAt: VERIFIED_AT,
    verification: "verified",
    confidence: "high",
    notes: "Company stated in June 2026 that the Boden project timeline is under review.",
  },
  {
    id: "co-lhyfe",
    name: "Lhyfe",
    categories: ["project-developer"],
    country: "FR",
    countryName: "France",
    headquarters: "Nantes",
    founded: 2017,
    ownership: "Listed (Euronext Paris: LHYFE)",
    technologyFocus: ["Renewable hydrogen production", "Distributed production sites"],
    description:
      "French developer and operator of renewable hydrogen production sites in France and Germany, supplying industrial and mobility customers.",
    website: "https://www.lhyfe.com/",
    deals: [
      {
        id: "deal-lhyfe-syndicated-loan-2023",
        counterparty: "Crédit Agricole, BPCE, HSBC, Crédit Mutuel Océan; Bpifrance",
        year: 2023,
        kind: "debt",
        description:
          "First corporate financing package: a €22.2 million green syndicated bank loan plus two Bpifrance fixed-rate lines totalling €5.8 million.",
        amount: { amount: 28_000_000, currency: "EUR", scope: "Total package" },
        source: LHYFE_LOAN,
      },
      {
        id: "deal-lhyfe-french-state-grant-2025",
        counterparty: "French government",
        year: 2025,
        kind: "grant",
        description:
          "Confirmation of a subsidy of up to €149 million for one of Lhyfe's largest planned production sites (Green Horizon, near Le Havre).",
        amount: { amount: 149_000_000, currency: "EUR", scope: "Grant (up to)" },
        source: LHYFE_GRANT,
      },
    ],
    sources: [LHYFE_LOAN, LHYFE_GRANT, LHYFE_STRATEGY_2025],
    verifiedAt: VERIFIED_AT,
    verification: "verified",
    confidence: "high",
    notes:
      "In December 2025 the company announced it would prioritise European projects in mature markets, outsource EPC for its next industrial projects and cut costs by about 30% from 2026.",
  },
  {
    id: "co-acwa-power",
    name: "ACWA Power",
    categories: ["project-developer"],
    country: "SA",
    countryName: "Saudi Arabia",
    headquarters: "Riyadh",
    founded: 2004,
    ownership: "Listed (Tadawul: 2082)",
    technologyFocus: ["Renewable power", "Green hydrogen and ammonia", "Desalination"],
    description:
      "Saudi developer and operator of power, desalination and green hydrogen assets, and one of three equal partners in NEOM Green Hydrogen Company.",
    website: "https://www.acwapower.com/",
    deals: [
      {
        id: "deal-acwa-nghc-financial-close-2023",
        counterparty: "Air Products; NEOM (NEOM Green Hydrogen Company)",
        year: 2023,
        kind: "joint-venture",
        description:
          "Equal joint venture NEOM Green Hydrogen Company reached financial close with USD 6.1 billion of non-recourse debt from 23 lenders, for a plant producing up to 600 t/day of hydrogen as green ammonia.",
        amount: { amount: 8_400_000_000, currency: "USD", scope: "Total investment value of the NGHC project" },
        source: NGHC_FINANCIAL_CLOSE,
      },
    ],
    sources: [NGHC_FINANCIAL_CLOSE],
    verifiedAt: VERIFIED_AT,
    verification: "verified",
    confidence: "high",
  },
  {
    id: "co-air-products",
    name: "Air Products and Chemicals, Inc.",
    categories: ["project-developer", "industrial-offtaker"],
    country: "US",
    countryName: "United States",
    headquarters: "Allentown, Pennsylvania",
    founded: 1940,
    ownership: "Listed (NYSE: APD)",
    technologyFocus: ["Industrial gases", "Hydrogen production and distribution", "Green ammonia"],
    description:
      "US industrial gases company that is a one-third partner, EPC contractor and exclusive ammonia offtaker for NEOM Green Hydrogen Company.",
    website: "https://www.airproducts.com/",
    deals: [
      {
        id: "deal-air-products-nghc-2023",
        counterparty: "ACWA Power; NEOM (NEOM Green Hydrogen Company)",
        year: 2023,
        kind: "joint-venture",
        description:
          "At NGHC financial close, Air Products held a one-third stake, signed a USD 6.7 billion EPC agreement as nominated contractor and system integrator, and a 30-year exclusive offtake for the green ammonia.",
        amount: { amount: 6_700_000_000, currency: "USD", scope: "EPC agreement value" },
        source: NGHC_FINANCIAL_CLOSE,
      },
    ],
    sources: [NGHC_FINANCIAL_CLOSE, AIR_PRODUCTS_EXIT_2025],
    verifiedAt: VERIFIED_AT,
    verification: "verified",
    confidence: "high",
    notes:
      "In February 2025 the company announced its exit from three U.S. projects, including the Massena, NY green liquid hydrogen facility, with a pre-tax charge not to exceed USD 3.1 billion; it stated NEOM was approaching 80% completion with ammonia production expected at end-2026.",
  },

  /* ---------------- EPC ---------------- */
  {
    id: "co-technip-energies",
    name: "Technip Energies",
    categories: ["epc-contractor"],
    country: "FR",
    countryName: "France",
    headquarters: "Nanterre (Paris La Défense)",
    founded: 2021,
    ownership: "Listed (Euronext Paris: TE)",
    technologyFocus: ["Engineering & construction", "Hydrogen and ammonia plants", "Carbon capture"],
    description:
      "French engineering and technology company delivering energy and chemicals plants, active in green hydrogen through its Rely joint venture with John Cockerill.",
    website: "https://www.ten.com/",
    deals: [
      {
        id: "deal-technip-john-cockerill-rely-2023",
        counterparty: "John Cockerill",
        year: 2023,
        kind: "joint-venture",
        description:
          "Closed the creation of Rely, a Brussels-based green hydrogen company owned 60% by Technip Energies and 40% by John Cockerill, offering integrated solutions for projects of 100 MW and above.",
        amount: null,
        source: RELY_CLOSING,
      },
    ],
    sources: [RELY_CLOSING],
    verifiedAt: VERIFIED_AT,
    verification: "verified",
    confidence: "high",
    notes: "Founded year refers to its listing as an independent company following separation from TechnipFMC.",
  },

  /* ---------------- Storage & transport ---------------- */
  {
    id: "co-hexagon-purus",
    name: "Hexagon Purus ASA",
    categories: ["storage-transport"],
    country: "NO",
    countryName: "Norway",
    headquarters: "Oslo",
    founded: null,
    ownership: "Listed (Oslo: HPUR)",
    technologyFocus: ["Type 4 hydrogen cylinders", "Hydrogen distribution modules", "Fuel storage systems"],
    description:
      "Norwegian maker of composite Type 4 hydrogen cylinders and the transport, storage and vehicle fuel systems built from them.",
    website: "https://hexagonpurus.com/",
    supplierId: "sup-hexagon-purus",
    deals: [
      {
        id: "deal-hexagon-purus-air-liquide-2021",
        counterparty: "Air Liquide",
        year: 2021,
        kind: "supply-contract",
        description:
          "Multi-year global agreement to supply Type 4 hydrogen cylinders to Air Liquide and its affiliates for hydrogen transport in industry and mobility.",
        amount: null,
        source: HEXPURUS_AIR_LIQUIDE,
      },
    ],
    sources: [HEXPURUS_AIR_LIQUIDE],
    verifiedAt: VERIFIED_AT,
    verification: "verified",
    confidence: "medium",
    notes: "Publication date of the Air Liquide release taken from page metadata.",
  },
  {
    id: "co-hydrogenious",
    name: "Hydrogenious LOHC Technologies",
    categories: ["storage-transport", "technology-startup"],
    country: "DE",
    countryName: "Germany",
    headquarters: "Erlangen",
    founded: 2013,
    ownership: "Private (venture-backed)",
    technologyFocus: ["Liquid organic hydrogen carriers (LOHC)", "Hydrogen storage and transport"],
    description:
      "German developer of liquid organic hydrogen carrier (LOHC) technology for storing and transporting hydrogen in a liquid at ambient conditions.",
    website: "https://hydrogenious.net/",
    deals: [
      {
        id: "deal-hydrogenious-50m-2021",
        counterparty: "JERA Americas, Temasek, Chevron Technology Ventures, Pavilion Capital and existing investors",
        year: 2021,
        kind: "equity",
        description:
          "Oversubscribed €50 million funding round led by JERA Americas with Temasek, joined by existing investors AP Ventures, Royal Vopak and Winkelmann Group.",
        amount: { amount: 50_000_000, currency: "EUR" },
        source: HYDROGENIOUS_50M,
      },
    ],
    sources: [HYDROGENIOUS_50M],
    verifiedAt: VERIFIED_AT,
    verification: "verified",
    confidence: "medium",
    notes: "Founding year implied by the 2021 release (AP Ventures invested in 2014, one year after founding).",
  },

  /* ---------------- Startups ---------------- */
  {
    id: "co-electric-hydrogen",
    name: "Electric Hydrogen",
    categories: ["technology-startup", "electrolyser-manufacturer"],
    country: "US",
    countryName: "United States",
    headquarters: "Natick, Massachusetts",
    founded: 2020,
    ownership: "Private (venture-backed)",
    technologyFocus: ["High-power PEM electrolysis plants (HYPRPlant)"],
    description:
      "US manufacturer of 100 MW-class PEM electrolyser plants (HYPRPlant), with a factory in Devens, Massachusetts.",
    website: "https://eh2.com/",
    deals: [
      {
        id: "deal-eh2-series-c-2023",
        counterparty: "Fortescue, Fifth Wall, Energy Impact Partners (leads) and others",
        year: 2023,
        kind: "equity",
        description:
          "Oversubscribed Series C round to scale manufacturing and deployment, with new investors including bp Ventures, Temasek and Microsoft's Climate Innovation Fund.",
        amount: { amount: 380_000_000, currency: "USD", scope: "Series C" },
        source: EH2_SERIES_C,
      },
      {
        id: "deal-eh2-infinium-roadrunner-2025",
        counterparty: "Infinium (Project Roadrunner, Texas)",
        year: 2025,
        kind: "supply-contract",
        description: "Infinium selected a 100 MW HYPRPlant for its Project Roadrunner eFuels facility in Pecos, Texas.",
        amount: null,
        source: EH2_INFINIUM,
      },
      {
        id: "deal-eh2-ambient-fuels-2025",
        counterparty: "Ambient Fuels; Generate Capital",
        year: 2025,
        kind: "acquisition",
        description:
          "Acquired hydrogen project developer Ambient Fuels and set up a partnership with Generate Capital to offer up to USD 400 million of hydrogen project financing; acquisition terms not disclosed.",
        amount: null,
        source: EH2_AMBIENT,
      },
    ],
    sources: [EH2_SERIES_C, EH2_INFINIUM, EH2_AMBIENT],
    verifiedAt: VERIFIED_AT,
    verification: "verified",
    confidence: "high",
    notes: "Headquarters given as the press-release dateline (Natick, MA); the company lists offices in California and Massachusetts.",
  },
  {
    id: "co-hysata",
    name: "Hysata",
    categories: ["technology-startup", "electrolyser-manufacturer"],
    country: "AU",
    countryName: "Australia",
    headquarters: "Wollongong, New South Wales",
    founded: null,
    ownership: "Private (venture-backed)",
    technologyFocus: ["Capillary-fed alkaline electrolysis"],
    description:
      "Australian developer of a capillary-fed alkaline electrolyser, for which it claims 41.5 kWh/kg including balance of plant, manufactured in Wollongong.",
    website: "https://hysata.com/",
    deals: [
      {
        id: "deal-hysata-series-b-2024",
        counterparty: "bp Ventures and Templewater (co-leads), POSCO Holdings, POSCO E&C and others",
        year: 2024,
        kind: "equity",
        description:
          "Series B round co-led by bp Ventures and Templewater to expand production capacity and product development, with returning investors including IP Group Australia and Virescent Ventures (for CEFC).",
        amount: { amount: 111_300_000, currency: "USD", scope: "Series B" },
        source: HYSATA_SERIES_B,
      },
    ],
    sources: [HYSATA_SERIES_B],
    verifiedAt: VERIFIED_AT,
    verification: "verified",
    confidence: "high",
    notes: "41.5 kWh/kg efficiency is a company claim.",
  },
  {
    id: "co-stargate-hydrogen",
    name: "Stargate Hydrogen",
    categories: ["technology-startup", "electrolyser-manufacturer"],
    country: "EE",
    countryName: "Estonia",
    headquarters: "Tallinn",
    founded: null,
    ownership: "Private (venture-backed)",
    technologyFocus: ["Alkaline electrolysis with precious-metal-free ceramic-based catalysts"],
    description:
      "Estonian manufacturer of alkaline electrolyser stacks (stellar 0.5 MW, starbase 5 MW) and containerised systems (gateway 1 MW, aurora 10 MW) using precious-metal-free catalysts.",
    website: "https://stargatehydrogen.com/",
    deals: [
      {
        id: "deal-stargate-seed-2024",
        counterparty: "UG Investments (lead); IPCEI hydrogen grant framework",
        year: 2024,
        kind: "equity",
        description: "€42 million seed round comprising equity (led by UG Investments) and IPCEI grant funding.",
        amount: { amount: 42_000_000, currency: "EUR", scope: "Equity and grants combined" },
        source: STARGATE_SEED,
      },
      {
        id: "deal-stargate-series-a-2025",
        counterparty: "Giga, UG Investments, SmartCap Green Fund",
        year: 2025,
        kind: "equity",
        description:
          "€11 million Series A from strategic customers and financial investors to scale manufacturing and testing; total committed capital including grants reported at over €50 million.",
        amount: { amount: 11_000_000, currency: "EUR", scope: "Series A equity" },
        source: STARGATE_SERIES_A,
      },
    ],
    sources: [STARGATE_SEED, STARGATE_SERIES_A],
    verifiedAt: VERIFIED_AT,
    verification: "verified",
    confidence: "medium",
    notes: "Seed release date shown as 02.05.2024 (page metadata: 2024-05-02).",
  },
  {
    id: "co-elcogen",
    name: "Elcogen",
    categories: ["technology-startup", "fuel-cell-manufacturer", "electrolyser-manufacturer"],
    country: "EE",
    countryName: "Estonia",
    headquarters: "Tallinn",
    founded: 2001,
    ownership: "Private",
    technologyFocus: ["Solid oxide fuel cells (SOFC)", "Solid oxide electrolysis (SOEC)", "Cells and stacks"],
    description:
      "Estonian-Finnish maker of solid oxide cells and stacks for fuel cell and electrolysis applications, scaling its Tallinn factory from 10 MW to 360 MW of annual capacity.",
    website: "https://elcogen.com/",
    deals: [
      {
        id: "deal-elcogen-hd-hyundai-ksoe-2023",
        counterparty: "Korea Shipbuilding & Offshore Engineering (HD Hyundai)",
        year: 2023,
        kind: "equity",
        description:
          "Strategic investment to expand manufacturing capacity at the new Tallinn factory, subject to shareholder approval of the share issue; builds on a January 2023 R&D collaboration.",
        amount: { amount: 45_000_000, currency: "EUR" },
        source: ELCOGEN_HD_HYUNDAI,
      },
      {
        id: "deal-elcogen-baker-hughes-2024",
        counterparty: "Baker Hughes (with HydrogenOne Capital Growth, HD Hyundai, Mirae)",
        year: 2024,
        kind: "equity",
        description:
          "Strategic investment from Baker Hughes closing a funding round that the company says raised over €140 million overall across equity, grants and a proposed debt facility.",
        amount: { amount: 140_000_000, currency: "EUR", scope: "Overall round incl. equity, grants and proposed debt" },
        source: ELCOGEN_BAKER_HUGHES,
      },
      {
        id: "deal-elcogen-eib-innovfin-2019",
        counterparty: "European Investment Bank (InnovFin)",
        year: 2019,
        kind: "debt",
        description: "InnovFin loan to build a demonstration plant for manufacturing SOFC cells and stacks.",
        amount: { amount: 12_000_000, currency: "EUR" },
        source: ELCOGEN_EIB,
      },
    ],
    sources: [ELCOGEN_HD_HYUNDAI, ELCOGEN_BAKER_HUGHES, ELCOGEN_EIB],
    verifiedAt: VERIFIED_AT,
    verification: "verified",
    confidence: "high",
    notes: "Elcogen AS was established in Estonia in 2001 and Elcogen Oy in Finland in 2009; registered office stated as UK.",
  },
];
