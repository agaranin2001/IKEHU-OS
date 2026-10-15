import type { MarketInsight, SourceRef } from "@/domain/types";

/**
 * Sourced market insights. Every headline figure is quoted as published by the
 * named source; titles and summaries are paraphrased. Records were checked
 * against their sources on `verifiedAt`.
 */

const VERIFIED_AT = "2026-10-14";

/* Shared sources ---------------------------------------------------- */

const IEA_GHR26_EXEC: SourceRef = {
  url: "https://www.iea.org/reports/global-hydrogen-review-2026/executive-summary",
  title: "Global Hydrogen Review 2026 – Executive summary",
  publisher: "International Energy Agency (IEA)",
  publishedAt: "2026-06-18",
};

const IEA_GHR26_PRODUCTION: SourceRef = {
  url: "https://www.iea.org/reports/global-hydrogen-review-2026/production",
  title: "Global Hydrogen Review 2026 – Production",
  publisher: "International Energy Agency (IEA)",
  publishedAt: "2026-06-18",
};

const IEA_GHR26_INVESTMENT: SourceRef = {
  url: "https://www.iea.org/reports/global-hydrogen-review-2026/investment-and-innovation",
  title: "Global Hydrogen Review 2026 – Investment and innovation",
  publisher: "International Energy Agency (IEA)",
  publishedAt: "2026-06-18",
};

const IEA_GHR26_TRADE: SourceRef = {
  url: "https://www.iea.org/reports/global-hydrogen-review-2026/trade-and-infrastructure",
  title: "Global Hydrogen Review 2026 – Trade and infrastructure",
  publisher: "International Energy Agency (IEA)",
  publishedAt: "2026-06-18",
};

const EHO_HOME: SourceRef = {
  url: "https://observatory.clean-hydrogen.europa.eu/",
  title: "European Hydrogen Observatory – The hydrogen landscape at a glance",
  publisher: "European Hydrogen Observatory (Clean Hydrogen Partnership)",
};

const EHO_MARKET_2025: SourceRef = {
  url: "https://observatory.clean-hydrogen.europa.eu/sites/default/files/2025-11/The%20European%20hydrogen%20market%20landscape_November%202025.pdf",
  title: "The European hydrogen market landscape – November 2025",
  publisher: "European Hydrogen Observatory (Clean Hydrogen Partnership)",
  publishedAt: "2025-11",
};

/* Records ----------------------------------------------------------- */

export const INSIGHTS: MarketInsight[] = [
  {
    id: "ins-iea-electrolysis-capacity-2025",
    title: "Global electrolyser fleet doubled in 2025, led by China",
    category: "supply",
    region: "Global",
    summary:
      "The IEA reports that installed water-electrolysis capacity worldwide doubled during 2025, passing the 4 GW mark, with China responsible for close to three-quarters of the new additions. A further 2.5 GW or more was under construction and aiming to start operating in 2026.",
    metric: { value: "> 4 GW", label: "global installed electrolysis capacity, 2025 (doubled year-on-year)" },
    publishedAt: "2026-06-18",
    publisher: "International Energy Agency (IEA)",
    sources: [IEA_GHR26_EXEC, IEA_GHR26_PRODUCTION],
    verifiedAt: VERIFIED_AT,
    verification: "verified",
    confidence: "high",
    notes: "IEA gives no exact year-end figure, only that capacity exceeded 4 GW.",
  },
  {
    id: "ins-iea-demand-offtake-2025",
    title: "Hydrogen demand tops 100 Mt while firm low-emissions offtake stays thin",
    category: "demand",
    region: "Global",
    summary:
      "Global hydrogen use passed 100 million tonnes in 2025, and low-emissions production grew about 20% to almost 1 Mt, on track to exceed 1% of global production for the first time in 2026. Newly signed offtake agreements held at roughly 1.7 Mtpa, but the IEA counts only about a fifth of those volumes as firm commitments.",
    metric: { value: "100 Mt", label: "global hydrogen demand surpassed, 2025" },
    publishedAt: "2026-06-18",
    publisher: "International Energy Agency (IEA)",
    sources: [IEA_GHR26_EXEC],
    verifiedAt: VERIFIED_AT,
    verification: "verified",
    confidence: "high",
  },
  {
    id: "ins-iea-pipeline-2030",
    title: "Announced 2030 low-emissions pipeline shrinks to 27 Mt",
    category: "supply",
    region: "Global",
    summary:
      "The project pipeline for low-emissions hydrogen by 2030 has contracted to 27 Mt, and the volume backed by committed or high-likelihood projects fell from 10 Mt to just over 6 Mt. Around 22 Mt of potential output is at risk if investment decisions slip beyond early 2027, although roughly 300 ktpa of additional production reached FID since the previous edition.",
    metric: { value: "27 Mt", label: "announced low-emissions hydrogen production pipeline for 2030" },
    publishedAt: "2026-06-18",
    publisher: "International Energy Agency (IEA)",
    sources: [IEA_GHR26_EXEC],
    verifiedAt: VERIFIED_AT,
    verification: "verified",
    confidence: "high",
  },
  {
    id: "ins-iea-investment-2025",
    title: "Low-emissions hydrogen capex roughly doubled to about USD 7 billion",
    category: "investment",
    region: "Global",
    summary:
      "Capital spending on low-emissions hydrogen reached close to USD 7 billion in 2025, nearly double the 2024 level but still under 1% of global energy supply investment. Europe holds less than a fifth of committed electrolysis capacity yet about 45% of the spending, which the IEA links to higher capital cost per unit installed.",
    metric: { value: "nearly USD 7 billion", label: "low-emissions hydrogen investment spending, 2025" },
    publishedAt: "2026-06-18",
    publisher: "International Energy Agency (IEA)",
    sources: [IEA_GHR26_INVESTMENT],
    verifiedAt: VERIFIED_AT,
    verification: "verified",
    confidence: "high",
    notes: "IEA estimates 2026 investment at nearly USD 10 billion, with electrolysis around 70% of it (estimate).",
  },
  {
    id: "ins-iea-trade-2030",
    title: "Only a small slice of planned hydrogen trade is backed by committed projects",
    category: "trade",
    region: "Global",
    summary:
      "If every announced project went ahead, traded volumes would underpin more than 40% of 2030 low-emissions supply, but under 8% of that trade comes from projects that are operating, being built or committed. Where pure hydrogen is needed at the destination, the IEA puts the minimum shipping cost at around USD 2/kg and energy use at more than 10 kWh/kg.",
    metric: { value: "around 1 Mtpa H₂-eq", label: "2030 trade volumes from operational, under-construction or committed projects" },
    publishedAt: "2026-06-18",
    publisher: "International Energy Agency (IEA)",
    sources: [IEA_GHR26_TRADE],
    verifiedAt: VERIFIED_AT,
    verification: "verified",
    confidence: "high",
  },
  {
    id: "ins-ehb-pilot-auction-2024",
    title: "Hydrogen Bank pilot auction clears below €0.50/kg premium",
    category: "policy",
    region: "EEA",
    summary:
      "The first European Hydrogen Bank auction selected seven renewable hydrogen projects in four countries for nearly €720 million of Innovation Fund support. Six of them signed grant agreements in October 2024, worth about €695 million and expected to produce 1.52 Mt of hydrogen over ten years. The auction drew 132 bids from 17 countries, with all bids spanning €0.37–4.5/kg against a much tighter range for the winners.",
    metric: { value: "€0.37–0.48/kg", label: "winning fixed-premium bids, EHB pilot auction" },
    publishedAt: "2024-04-30",
    publisher: "European Commission",
    sources: [
      {
        url: "https://ec.europa.eu/commission/presscorner/detail/en/ip_24_2333",
        title: "European Hydrogen Bank auction provides €720 million for renewable hydrogen production in Europe (IP/24/2333)",
        publisher: "European Commission",
        publishedAt: "2024-04-30",
      },
      {
        url: "https://climate.ec.europa.eu/news-your-voice/news/winners-first-eu-wide-renewable-hydrogen-auction-sign-grant-agreements-paving-way-new-european-2024-10-07_en",
        title: "Winners of first EU-wide renewable hydrogen auction sign grant agreements, paving the way for new European production",
        publisher: "European Commission – DG CLIMA",
        publishedAt: "2024-10-07",
      },
      {
        url: "https://energy.ec.europa.eu/topics/eus-energy-system/hydrogen/european-hydrogen-bank_en",
        title: "European Hydrogen Bank",
        publisher: "European Commission – DG Energy",
      },
    ],
    verifiedAt: VERIFIED_AT,
    verification: "verified",
    confidence: "high",
    notes:
      "Signed totals: EUR 694,521,237 and 1,515 kt (DG CLIMA, 7 Oct 2024), given as 1.52 Mt on the Hydrogen Bank page. The original award to seven projects covered 1.58 Mt; one project withdrew before signing, and El Alamillo H2 does not appear among the six signatories. Germany added €350 million via Auctions-as-a-Service for highly ranked German projects not funded at EU level.",
  },
  {
    id: "ins-ehb-second-auction-attrition",
    title: "Second Hydrogen Bank round: low bids, but slow conversion into grants",
    category: "policy",
    region: "EEA",
    summary:
      "The second European Hydrogen Bank auction invited 15 renewable hydrogen projects to grant preparation, with winning premiums of roughly €0.2–0.6/kg according to the IEA policy database. By 20 January 2026 only six projects (Spain, Finland, Norway; 381.25 MW) had signed grant agreements, worth €270.6 million in total.",
    metric: { value: "€0.2–0.6/kg", label: "bid range of the 12 general-topic projects first selected, EHB second auction" },
    publishedAt: "2026-01-20",
    publisher: "European Commission",
    sources: [
      {
        url: "https://energy.ec.europa.eu/topics/eus-energy-system/hydrogen/european-hydrogen-bank_en",
        title: "European Hydrogen Bank",
        publisher: "European Commission – DG Energy",
      },
      {
        url: "https://www.iea.org/policies/27897-second-auction-of-european-hydrogen-bank-ehb",
        title: "Second auction of European Hydrogen Bank (EHB)",
        publisher: "International Energy Agency (IEA)",
        publishedAt: "2025-09-05",
      },
    ],
    verifiedAt: VERIFIED_AT,
    verification: "verified",
    confidence: "medium",
    notes:
      "Bid range taken from the IEA policy database (last updated 5 Sep 2025) and covers the general topic only; the three maritime projects bid €0.45–1.88/kg. Grant-signing figures from the Commission page. publishedAt is the grant-signing date stated by the Commission.",
  },
  {
    id: "ins-ehb-third-auction-2026",
    title: "Third Hydrogen Bank auction backs 13 projects with over €1.2 billion",
    category: "policy",
    region: "EEA",
    summary:
      "The IF25 hydrogen auction has now invited 13 production projects in eight EEA countries to grant preparation, worth over €1.2 billion and expected to produce over 1.4 Mt of hydrogen over ten years. Nine were selected in May 2026 from a field more than six times oversubscribed against a €1.3 billion budget, and four reserve-list projects followed in June. Germany and Spain added €1.7 billion through Auctions-as-a-Service.",
    metric: { value: "€0.44–3.49/kg", label: "winning fixed-premium bids across all baskets, IF25 auction" },
    publishedAt: "2026-05-07",
    publisher: "European Commission",
    sources: [
      {
        url: "https://ec.europa.eu/commission/presscorner/detail/en/ip_26_1004",
        title: "EU awards over €1 billion to European hydrogen projects to accelerate the clean transition (IP/26/1004)",
        publisher: "European Commission",
        publishedAt: "2026-05-07",
      },
      {
        url: "https://climate.ec.europa.eu/eu-action/eu-funding-climate-action/innovation-fund/calls-proposals/if25-hydrogen-auction_en",
        title: "IF25 Hydrogen Auction",
        publisher: "European Commission – DG CLIMA",
      },
      {
        url: "https://energy.ec.europa.eu/topics/eus-energy-system/hydrogen/european-hydrogen-bank_en",
        title: "European Hydrogen Bank",
        publisher: "European Commission – DG Energy",
      },
    ],
    verifiedAt: VERIFIED_AT,
    verification: "verified",
    confidence: "high",
    notes:
      "Totals from the Commission's Hydrogen Bank page. The 7 May 2026 results covered nine projects in seven countries (around €1.09 billion, almost 1.1 GW, over 1.3 Mt); the four June additions bring €147.73 million for 77 MW. Upper end of the bid range comes from the maritime/aviation topic (€3.48–3.49/kg). The RFNBO general-topic winners of 7 May bid €0.57–0.98/kg, rising to €1.48/kg with the June additions; the €0.44 and €1.10/kg bids were in the RFNBO and/or low-carbon topic.",
  },
  {
    id: "ins-eho-lcoh-2024",
    title: "Renewable hydrogen in Europe costs about twice grey hydrogen",
    category: "cost",
    region: "Europe",
    summary:
      "The European Hydrogen Observatory estimates the 2024 average levelised cost of electrolytic hydrogen with a direct renewable connection at 6.71 €/kg, versus 3.33 €/kg for steam methane reforming and 4.12 €/kg with carbon capture. Grid-connected electrolysis averaged 7.42 €/kg, down from 9.85 €/kg in 2022.",
    metric: { value: "6.71 EUR/kg", label: "European average LCOH, renewable-connected electrolysis, 2024" },
    publishedAt: "2025-11",
    publisher: "European Hydrogen Observatory",
    sources: [EHO_HOME, EHO_MARKET_2025],
    verifiedAt: VERIFIED_AT,
    verification: "verified",
    confidence: "high",
    notes: "Modelled LCOH, not observed plant costs. SMR+CC excludes CO₂ transport and storage.",
  },
  {
    id: "ins-eho-electrolyser-capex-2024",
    title: "European electrolyser CAPEX estimated at €2,310–2,503/kW",
    category: "cost",
    region: "Europe",
    summary:
      "The Observatory's 2024 cost assessment puts total installed alkaline electrolyser CAPEX at 2,310 €/kW and PEM at 2,503 €/kW, with annual OPEX of 46.2 and 50.1 €/kW respectively. PEM carries a costlier stack (563 vs 323 €/kW) but slightly cheaper balance of plant.",
    metric: { value: "2,310 €/kW (alkaline) / 2,503 €/kW (PEM)", label: "total electrolyser CAPEX in Europe, 2024" },
    publishedAt: "2025-11",
    publisher: "European Hydrogen Observatory",
    sources: [EHO_MARKET_2025],
    verifiedAt: VERIFIED_AT,
    verification: "verified",
    confidence: "high",
  },
  {
    id: "ins-eho-manufacturing-2025",
    title: "European electrolyser factories reach 10.6 GW/yr of capacity",
    category: "technology",
    region: "Europe",
    summary:
      "Operational water-electrolyser manufacturing capacity in Europe reached 10.6 GW per year by May 2025, up 5.2 GW/yr in twelve months, and was expected to reach 14.4 GW/yr by end-2025. Actual deployments by European manufacturers in the EU27, EFTA and UK were only about 142 MW in 2024, highlighting a large utilisation gap.",
    metric: { value: "10.6 GW/year", label: "operational electrolyser manufacturing capacity in Europe, May 2025" },
    publishedAt: "2025-11",
    publisher: "European Hydrogen Observatory",
    sources: [EHO_MARKET_2025, EHO_HOME],
    verifiedAt: VERIFIED_AT,
    verification: "verified",
    confidence: "high",
    notes: "The Observatory's manufacturing dataset has since been updated to May 2026; figures here are the May 2025 values from the November 2025 report.",
  },
  {
    id: "ins-acer-monitoring-2025",
    title: "ACER: renewable hydrogen around four times the cost of fossil hydrogen",
    category: "cost",
    region: "EU",
    summary:
      "ACER's 2025 hydrogen market monitoring report puts average renewable hydrogen production cost at about 8 EUR/kg, roughly four times fossil-based hydrogen, with electricity supply alone up to half of that cost. EU electrolyser capacity grew 51% to 308 MW in 2024, far short of the 6 GW 2024 and 40 GW 2030 targets.",
    metric: { value: "8 EUR/kg", label: "average renewable hydrogen production cost (ACER 2025 monitoring report)" },
    publishedAt: "2025-12-02",
    publisher: "European Union Agency for the Cooperation of Energy Regulators (ACER)",
    sources: [
      {
        url: "https://www.acer.europa.eu/monitoring/European-hydrogen-markets-2025",
        title: "European hydrogen markets – 2025 Monitoring Report",
        publisher: "ACER",
      },
      {
        url: "https://www.acer.europa.eu/news/hydrogen-progress-hampered-high-costs-and-slow-transposition",
        title: "Hydrogen progress hampered by high costs and slow transposition",
        publisher: "ACER",
        publishedAt: "2025-12-02",
      },
    ],
    verifiedAt: VERIFIED_AT,
    verification: "verified",
    confidence: "high",
    notes: "ACER's 308 MW figure uses a different perimeter from the Observatory's 142.85 MW (deployments by European manufacturers).",
  },
  {
    id: "ins-eca-sr-2024-11",
    title: "EU auditors call for a 'reality check' on renewable hydrogen targets",
    category: "policy",
    region: "EU",
    summary:
      "The European Court of Auditors concluded the Commission was only partly successful in creating conditions for a hydrogen market and judged the 2030 production and import targets (10 Mt + 10 Mt) unlikely to be met. It estimated EU funding for hydrogen-related projects in 2021–2027 at €18.8 billion, spread across programmes with differing rules.",
    metric: { value: "€18.8 billion", label: "estimated EU funding for hydrogen-related projects, 2021–2027" },
    publishedAt: "2024-07-17",
    publisher: "European Court of Auditors",
    sources: [
      {
        url: "https://www.eca.europa.eu/en/publications/SR-2024-11",
        title: "Special report 11/2024: The EU's industrial policy on renewable hydrogen",
        publisher: "European Court of Auditors",
        publishedAt: "2024-07-17",
      },
      {
        url: "https://www.eca.europa.eu/ECAPublications/SR-2024-11/SR-2024-11_EN.pdf",
        title: "Special report 11/2024 (PDF)",
        publisher: "European Court of Auditors",
        publishedAt: "2024-07-17",
      },
    ],
    verifiedAt: VERIFIED_AT,
    verification: "verified",
    confidence: "high",
    notes: "Adopted by Chamber II on 5 June 2024; 17 July 2024 is the publication date reported for the report.",
  },
  {
    id: "ins-bnef-clean-h2-cost-2025",
    title: "BNEF: clean hydrogen costs rose about 35% in two years",
    category: "cost",
    region: "Global",
    summary:
      "BloombergNEF's public commentary at the start of 2025 said its levelised cost estimates for clean hydrogen were on average 35% higher than two years earlier. Its range of $3.74–11.70/kg reflects location and other project factors.",
    metric: { value: "$3.74–11.70/kg", label: "BNEF levelised cost range for clean hydrogen, early 2025" },
    publishedAt: "2025-01-09",
    publisher: "BloombergNEF",
    sources: [
      {
        url: "https://about.bnef.com/blog/five-energy-transition-lessons-for-2025/",
        title: "Five Energy Transition Lessons for 2025",
        publisher: "BloombergNEF",
        publishedAt: "2025-01-09",
      },
    ],
    verifiedAt: VERIFIED_AT,
    verification: "verified",
    confidence: "medium",
    notes: "Public blog summary; full methodology sits behind BNEF's paywall. Values in USD.",
  },
];
