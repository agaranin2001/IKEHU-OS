import type { ModuleSlug } from "./navigation";

export interface SolutionContent {
  slug: ModuleSlug;
  eyebrow: string;
  headline: string;
  intro: string;
  primary: { href: string; label: string };
  secondary: { href: string; label: string };
  questions: string[];
  capabilities: { title: string; body: string; availability: "available" | "preview" | "planned" }[];
  dataBehind: string[];
  preview: "projects" | "economics" | "suppliers" | "radar" | "investment" | "delivery";
}

export const SOLUTIONS: Record<ModuleSlug, SolutionContent> = {
  "market-intelligence": {
    slug: "market-intelligence",
    eyebrow: "Market Intelligence",
    headline: "See the hydrogen market as it is — not as it was announced.",
    intro: "Track production projects, electricity markets and policy signals in one place, with status taxonomies that separate committed capacity from ambition.",
    primary: { href: "/app/projects", label: "Explore projects" },
    secondary: { href: "/atlas", label: "Open the Project Atlas" },
    questions: ["Which projects have actually reached FID?", "How much capacity is operating versus announced?", "Where is electricity cheap enough for electrolysis?"],
    capabilities: [
      { title: "Global project database", body: "Searchable records with developer, partners, technology, capacity, status, timeline and investment where disclosed.", availability: "available" },
      { title: "Map and table views", body: "Filter by country, technology, capacity, status and developer; open any project for its full record.", availability: "available" },
      { title: "Electricity market view", body: "Historical day-ahead prices for 18 European bidding zones and the electricity cost per kg they imply.", availability: "available" },
      { title: "Market insights", body: "Headline findings from IEA, European Hydrogen Observatory, ACER and EU auction results — dated and linked.", availability: "available" },
      { title: "Change history & alerts", body: "Notifications when a tracked project changes status or timeline.", availability: "planned" },
      { title: "Demand forecasts by segment", body: "Country and end-use demand outlooks.", availability: "planned" },
    ],
    dataBehind: ["Developer and government announcements", "European Hydrogen Observatory", "IEA Global Hydrogen Review", "Nord Pool via Elering; Fraunhofer ISE Energy-Charts"],
    preview: "projects",
  },
  "hydrogen-economics": {
    slug: "hydrogen-economics",
    eyebrow: "Hydrogen Economics",
    headline: "Know what your hydrogen costs — and why.",
    intro: "A transparent levelised-cost model that shows every assumption, compares scenarios and identifies the inputs that move the result most.",
    primary: { href: "/calculator", label: "Run a calculation" },
    secondary: { href: "/data#methodology", label: "Read the methodology" },
    questions: ["What LCOH can a 20 MW PEM plant reach in a given bidding zone?", "How much does utilisation matter versus CAPEX?", "How do conservative and optimistic cases compare?"],
    capabilities: [
      { title: "LCOH calculator", body: "Electricity, CAPEX, efficiency, hours, O&M, water, lifetime, WACC, stack replacement and degradation.", availability: "available" },
      { title: "Scenario comparison", body: "Conservative, base and optimistic presets with every assumption displayed.", availability: "available" },
      { title: "Sensitivity analysis", body: "Tornado and sweep charts across power price, hours, CAPEX, efficiency and WACC.", availability: "available" },
      { title: "Preliminary report export", body: "Print-ready report and CSV/JSON export of inputs, results and yearly profile.", availability: "available" },
      { title: "Project cash-flow model", body: "NPV, IRR and payback from revenue and financing assumptions.", availability: "planned" },
      { title: "Hourly dispatch optimisation", body: "Operating profile optimised against hourly prices.", availability: "planned" },
    ],
    dataBehind: ["European Hydrogen Observatory cost data", "IEA assumptions annex", "Clean Hydrogen Partnership KPIs", "IRENA water-use data"],
    preview: "economics",
  },
  "project-intelligence": {
    slug: "project-intelligence",
    eyebrow: "Project & Technology Intelligence",
    headline: "Choose technology and configuration with the evidence in front of you.",
    intro: "Compare electrolyser technologies and equipment on published specifications, and see which projects use them.",
    primary: { href: "/app/suppliers", label: "Compare equipment" },
    secondary: { href: "/app/projects", label: "See projects by technology" },
    questions: ["What specific energy consumption do manufacturers publish?", "Which suppliers offer pressurised output?", "Which projects use alkaline versus PEM?"],
    capabilities: [
      { title: "Equipment catalogue", body: "Electrolysers, fuel cells, compressors, storage, power electronics and safety equipment.", availability: "available" },
      { title: "Side-by-side comparison", body: "Up to four products across capacity, efficiency, pressure, standards and warranty.", availability: "available" },
      { title: "Manufacturer profiles", body: "Ownership, headquarters, manufacturing capacity and product lines.", availability: "available" },
      { title: "Total cost of ownership", body: "Compare lifetime cost, not purchase price.", availability: "planned" },
    ],
    dataBehind: ["Manufacturer datasheets and product pages (vendor claims)", "Project records linked to electrolyser suppliers"],
    preview: "suppliers",
  },
  procurement: {
    slug: "procurement",
    eyebrow: "Procurement & Tenders",
    headline: "Find the right call, tender or auction before the deadline.",
    intro: "EU programmes, national schemes and public procurement notices with eligibility, requirements and an application checklist.",
    primary: { href: "/app/opportunities", label: "Open the radar" },
    secondary: { href: "/app/suppliers", label: "Request quotations" },
    questions: ["Which calls are open for electrolysis projects?", "What documents does an application need?", "Which funding rounds have closed, and at what prices?"],
    capabilities: [
      { title: "Opportunity radar", body: "Filters for country, deadline, technology, type and budget, with status computed as of the dataset date.", availability: "available" },
      { title: "Requirements & checklist", body: "Eligibility, requirements and required documents per call, tracked in your browser.", availability: "available" },
      { title: "Tender review assistant", body: "Rule-based summary, compliance checklist and draft outline from the structured record.", availability: "preview" },
      { title: "Supplier RFQ", body: "Structured quotation requests from the equipment catalogue.", availability: "preview" },
      { title: "Automated tender monitoring", body: "New-notice alerts from procurement portals.", availability: "planned" },
    ],
    dataBehind: ["EU Funding & Tenders portal", "TED — Tenders Electronic Daily", "National agency programme pages"],
    preview: "radar",
  },
  investment: {
    slug: "investment",
    eyebrow: "Investment & M&A",
    headline: "Screen companies and capital with public facts, not guesswork.",
    intro: "Profiles of manufacturers, developers, EPCs, start-ups and funders — built only from publicly documented deals, partnerships and grants.",
    primary: { href: "/app/companies", label: "Screen companies" },
    secondary: { href: "/app/companies", label: "Browse investors" },
    questions: ["Who has financed electrolysis projects in Europe?", "Which manufacturers have signed large supply contracts?", "What does a preliminary due-diligence picture look like?"],
    capabilities: [
      { title: "Company profiles", body: "Ownership, geography, technology focus and documented deals with sources.", availability: "available" },
      { title: "Investor directory", body: "Infrastructure funds, venture investors, corporate venture arms and public funders.", availability: "available" },
      { title: "Preliminary due diligence", body: "Workstream checklist pre-filled from public records.", availability: "preview" },
      { title: "Target screening & valuation", body: "Acquisition screening, valuation and investment memos.", availability: "planned" },
      { title: "Patent & IP search", body: "Technology landscape by patent family.", availability: "planned" },
    ],
    dataBehind: ["Company press releases and filings", "Investor portfolio announcements", "EU and national grant decisions"],
    preview: "investment",
  },
  "project-delivery": {
    slug: "project-delivery",
    eyebrow: "Engineering & Project Delivery",
    headline: "Carry the feasibility case into engineering, procurement and construction.",
    intro: "A delivery workspace that keeps tasks, budget, milestones, risks, documents and suppliers connected to the assumptions they came from.",
    primary: { href: "/app/workspace", label: "Preview the workspace" },
    secondary: { href: "/demo", label: "Discuss your project" },
    questions: ["Is the permit critical path on track?", "Which risks threaten FID?", "How much budget is committed?"],
    capabilities: [
      { title: "Phase-gated plan", body: "Feasibility → Pre-FEED → FEED → Procurement → Construction → Commissioning.", availability: "preview" },
      { title: "Risk register", body: "Likelihood × impact matrix with owners and mitigations.", availability: "preview" },
      { title: "Budget & commitments", body: "Cost lines against committed spend.", availability: "preview" },
      { title: "Documents & standards", body: "Drawing and specification register with status.", availability: "preview" },
      { title: "Connected EPC/EPCM tooling", body: "Schedules, procurement and construction progress from project systems.", availability: "planned" },
    ],
    dataBehind: ["Preview uses clearly labelled demo data", "Future: project management and document systems via API"],
    preview: "delivery",
  },
};
