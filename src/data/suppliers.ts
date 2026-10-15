import type { EquipmentProduct, SourceRef, TechnologySupplier } from "@/domain/types";

/**
 * Sourced hydrogen technology suppliers and products.
 *
 * - Model names and figures are taken from official product pages / datasheets.
 * - All performance figures are manufacturer claims (`basis: "vendor-claim"`)
 *   unless marked `"derived"`, in which case the derivation is stated in the
 *   label. Nm³ → kg conversions use 11.126 Nm³/kg H₂.
 * - `efficiencyKwhPerKg` is only populated where the vendor publishes a
 *   system-level kWh/kg figure. Stack-level or DC-only figures stay in `specs`.
 * - `publicPrice` is only populated where the vendor itself publishes a price.
 *
 * Excluded on purpose (see report): Cummins/Accelera (halted new electrolyser
 * commercial activity in Feb 2026), McPhy (judicial liquidation July 2025,
 * assets sold to John Cockerill Hydrogen), Topsoe (no public model-level
 * specifications for its SOEC product), Dräger (official product pages could
 * not be retrieved for verification).
 */

const VERIFIED_AT = "2026-10-14";

/** Helper to keep product records compact. */
function product(p: Omit<EquipmentProduct, "verifiedAt">): EquipmentProduct {
  return { ...p, verifiedAt: VERIFIED_AT };
}

/* ------------------------------------------------------------------ */
/* Shared sources                                                      */
/* ------------------------------------------------------------------ */

const SE_ELYZER_FACTSHEET: SourceRef = {
  url: "https://assets.siemens-energy.com/dam/ea4fa194-2ce8-4645-bdea-b35300798c29/Electrolyzer-Factsheet-Elyzer-plant-100MW-pdf_Original%20file.pdf",
  title: "Elyzer plant – Fact sheet: 100 MW electrolyzer reference plant",
  publisher: "Siemens Energy",
  publishedAt: "2025-09",
};
const SE_HYDROGEN_SOLUTIONS: SourceRef = {
  url: "https://www.siemens-energy.com/global/en/home/products-services/product-offerings/hydrogen-solutions.html",
  title: "Hydrogen solutions – Elyzer electrolyzers",
  publisher: "Siemens Energy",
};

const ITM_NEPTUNE_V_PAGE: SourceRef = {
  url: "https://itm-power.com/products/neptune-5",
  title: "NEPTUNE V – 5 MW Plug & Play green hydrogen plant",
  publisher: "ITM Power",
};
const ITM_NEPTUNE_V_SHEET: SourceRef = {
  url: "https://itm-power-assets.s3.eu-west-2.amazonaws.com/Neptune_V_Spec_Sheet_2_8_a3f68d4e43.pdf",
  title: "NEPTUNE V tech sheet – process flow & specifications",
  publisher: "ITM Power",
};
const ITM_POSEIDON: SourceRef = {
  url: "https://itm-power.com/products/poseidon",
  title: "POSEIDON – 20 MW electrolyser module",
  publisher: "ITM Power",
};

const NEL_A_SERIES: SourceRef = {
  url: "https://nelhydrogen.com/product/a-series-alkaline/",
  title: "A Series – atmospheric alkaline electrolyser",
  publisher: "Nel Hydrogen",
};
const NEL_MC_SERIES: SourceRef = {
  url: "https://nelhydrogen.com/product/mc-series-pem/",
  title: "MC Series – containerised PEM electrolyser",
  publisher: "Nel Hydrogen",
};

const PLUG_EX2125D: SourceRef = {
  url: "https://www.plugpower.com/wp-content/uploads/2021/10/EX-2125D_F041122.pdf",
  title: "The Plug EX-2125D – system specifications (datasheet)",
  publisher: "Plug Power",
  publishedAt: "2022-04",
};
const PLUG_PEM_PAGE: SourceRef = {
  url: "https://www.plugpower.com/technology-products/pem-electrolyzers/",
  title: "PEM electrolyzers – GenEco 5 MW and 10 MW",
  publisher: "Plug Power",
};

const TKN_AWE: SourceRef = {
  url: "https://thyssenkrupp-nucera.com/green-hydrogen-solutions/",
  title: "Industrial-scale alkaline water electrolysis – scalum®",
  publisher: "thyssenkrupp nucera",
};

const JC_ELECTROLYSERS: SourceRef = {
  url: "https://hydrogen.johncockerill.com/en/products/electrolysers/",
  title: "Electrolysers",
  publisher: "John Cockerill Hydrogen",
};
const MCPHY_LIQUIDATION: SourceRef = {
  url: "https://mfn.se/one/a/mcphy-energy-s-a/mcphy-energy-john-cockerill-hydrogen-appointed-as-the-buyer-of-the-majority-of-mcphys-activities-including-the-belfort-gigafactory-judicial-reorganization-proceedings-converted-into-judicial-liquidation-trading-suspension-51ab7cd4",
  title:
    "McPhy Energy: John Cockerill Hydrogen appointed as the buyer of the majority of McPhy's activities; proceedings converted into judicial liquidation",
  publisher: "McPhy Energy S.A.",
  publishedAt: "2025-07-08",
};

const LONGI_ALK_G: SourceRef = {
  url: "https://www.longi.com/en/products/hydrogen/alk-g/",
  title: "LONGi ALK G alkaline electrolyser",
  publisher: "LONGi Hydrogen",
};
const LONGI_ALK_HI1: SourceRef = {
  url: "https://www.longi.com/en/products/hydrogen/alk-hi-1/",
  title: "LONGi ALK Hi1 alkaline electrolyser",
  publisher: "LONGi Hydrogen",
};

const SUNGROW_ALK: SourceRef = {
  url: "https://www.sungrowpower.com/en/products/hydrogen/alk-water-electrolysis-equipment",
  title: "ALK water electrolysis equipment",
  publisher: "Sungrow Hydrogen",
};
const SUNGROW_PEM: SourceRef = {
  url: "https://www.sungrowpower.com/en/products/hydrogen/pem-water-electrolysis-equipment",
  title: "PEM water electrolysis equipment",
  publisher: "Sungrow Hydrogen",
};

const SUNFIRE_HYDROGEN: SourceRef = {
  url: "https://www.sunfire.de/en/hydrogen",
  title: "Sunfire hydrogen – HyLink® Alkaline and HyLink® SOEC",
  publisher: "Sunfire GmbH",
};
const SUNFIRE_SOEC: SourceRef = {
  url: "https://sunfire.de/en/products/sunfire-hylink-soec/",
  title: "Sunfire-HyLink® SOEC",
  publisher: "Sunfire GmbH",
};
const SUNFIRE_ALK23: SourceRef = {
  url: "https://sunfire.de/en/products/hylink-alkaline-23/",
  title: "Sunfire-HyLink® Alkaline 23",
  publisher: "Sunfire GmbH",
};

const BLOOM_ELECTROLYZER: SourceRef = {
  url: "https://www.bloomenergy.com/electrolyzer/",
  title: "Bloom Electrolyzer – solid oxide hydrogen production",
  publisher: "Bloom Energy",
};
const BLOOM_ES65: SourceRef = {
  url: "https://www.bloomenergy.com/wp-content/uploads/bloom-energy-server-datasheet-feb-2026.pdf",
  title: "The Bloom Energy Server® 6.5 – data sheet",
  publisher: "Bloom Energy",
  publishedAt: "2026-02",
};

const ENAPTER_NEXUS: SourceRef = {
  url: "https://enapter.com/en/product/aem-nexus/",
  title: "AEM Nexus – MW-scale AEM electrolyzer",
  publisher: "Enapter",
};
const ENAPTER_EL4: SourceRef = {
  url: "https://enapter.com/en/product/aem-electrolyzer-el-4/",
  title: "AEM Electrolyzer EL 4",
  publisher: "Enapter",
};

const BALLARD_FCMOVE: SourceRef = {
  url: "https://www.ballard.com/fcmove/",
  title: "FCmove® fuel cell modules",
  publisher: "Ballard Power Systems",
};
const BALLARD_FCWAVE: SourceRef = {
  url: "https://www.ballard.com/fcwave/",
  title: "FCwave™ marine & stationary fuel cell module",
  publisher: "Ballard Power Systems",
};

const BURCKHARDT_DIAPHRAGM: SourceRef = {
  url: "https://www.burckhardtcompression.com/products/diaphragm-compressors/",
  title: "Diaphragm compressors – MD10-L containerised hydrogen compressor",
  publisher: "Burckhardt Compression",
};
const BURCKHARDT_HYDS: SourceRef = {
  url: "https://www.mynewsdesk.com/burckhardtcompression/pressreleases/burckhardt-compression-selected-by-hyds-to-supply-high-pressure-hydrogen-compression-solutions-in-the-nordics-3458169",
  title: "Burckhardt Compression selected by HYDS to supply high-pressure hydrogen compression solutions in the Nordics",
  publisher: "Burckhardt Compression",
};

const HEXPURUS_DISTRIBUTION: SourceRef = {
  url: "https://hexagonpurus.com/our-solutions/infrastructure/hydrogen-distribution-systems",
  title: "Hydrogen distribution systems",
  publisher: "Hexagon Purus",
};
const HEXPURUS_TYPE4: SourceRef = {
  url: "https://hexagonpurus.com/our-solutions/hydrogen-type-4-cylinders",
  title: "Hydrogen high-pressure Type 4 cylinders",
  publisher: "Hexagon Purus",
};

const HEXPURUS_BVI_REVIEW: SourceRef = {
  url: "https://mfn.se/one/a/hexagon-purus/update-on-strategic-review-of-bvi-segment-and-trading-update-e225e9bd",
  title: "Update on strategic review of BVI segment and trading update",
  publisher: "Hexagon Purus ASA",
};

const INGETEAM_E_SERIES: SourceRef = {
  url: "https://www.ingeteam.com/sites/default/files/2026-04/INGECON-H2-E-Series.pdf",
  title: "INGECON® H2 E-Series – electrolyzer rectifier based on IGBT technology (datasheet Rv A5)",
  publisher: "Ingeteam",
  publishedAt: "2026-04",
};
const INGETEAM_H2: SourceRef = {
  url: "https://www.ingeteam.com/en/hydrogen",
  title: "Hydrogen – rectifiers and power supply units for electrolysis",
  publisher: "Ingeteam",
};

const MSA_X5000: SourceRef = {
  url: "https://cl.msasafety.com/p/000070001800001133?locale=en",
  title: "ULTIMA® X5000 Gas Monitor",
  publisher: "MSA Safety",
};

/* ------------------------------------------------------------------ */
/* Suppliers                                                           */
/* ------------------------------------------------------------------ */

export const SUPPLIERS: TechnologySupplier[] = [
  /* ---------------- PEM ---------------- */
  {
    id: "sup-siemens-energy",
    companyName: "Siemens Energy",
    country: "DE",
    countryName: "Germany",
    headquarters: "Munich",
    categories: ["pem-electrolyser"],
    description:
      "German energy-technology group that develops in-house PEM electrolyser stacks and sells them as Elyzer arrays and turnkey electrolysis plants, alongside compression and grid equipment.",
    website: "https://www.siemens-energy.com/",
    ownership: "Listed (XETRA: ENR)",
    founded: 2020,
    manufacturingCapacity: "Gigawatt-scale series production of electrolyzer stacks (vendor statement; no figure given)",
    products: [
      product({
        id: "prd-siemens-energy-elyzer-plant-100mw",
        supplierId: "sup-siemens-energy",
        model: "Elyzer plant (100 MW reference plant)",
        category: "pem-electrolyser",
        description:
          "Standardised ~100 MW-class PEM electrolysis plant design built from Elyzer arrays, offered from electrolyser system up to full turnkey scope and intended as a basis for customisation.",
        capacity: { value: 110, unit: "MW", note: "Approximate plant power (\"~110 MW\") per fact sheet" },
        efficiencyKwhPerKg: null,
        outputPressureBar: 30,
        specs: [
          { label: "Hydrogen production", value: "~2,000", unit: "kg/h", basis: "vendor-claim" },
          { label: "Dry gas quality", value: "99.9999", unit: "%", basis: "vendor-claim" },
          { label: "Demin water consumption", value: "~10", unit: "l/kg H₂", basis: "vendor-claim" },
          { label: "Plant area (thyristor rectifier)", value: "186 × 90", unit: "m", basis: "vendor-claim" },
          { label: "Plant area (IGBT rectifier)", value: "186 × 96", unit: "m", basis: "vendor-claim" },
          {
            label: "Implied specific consumption (~110 MW ÷ ~2,000 kg/h; rounded inputs, not a vendor figure)",
            value: "~55",
            unit: "kWh/kg",
            basis: "derived",
          },
        ],
        standards: [],
        warranty: null,
        publicPrice: null,
        quotationRequired: true,
        source: SE_ELYZER_FACTSHEET,
      }),
      product({
        id: "prd-siemens-energy-elyzer-p-300",
        supplierId: "sup-siemens-energy",
        model: "Elyzer P-300",
        category: "pem-electrolyser",
        description:
          "Siemens Energy's current PEM electrolyser product for large-scale hydrogen production. The product page lists reference projects but no module-level figures.",
        capacity: null,
        efficiencyKwhPerKg: null,
        outputPressureBar: null,
        specs: [
          { label: "Technology", value: "Proton exchange membrane (PEM)", basis: "vendor-claim" },
          { label: "Scalability", value: "Modular design for plants up to gigawatt capacity", basis: "vendor-claim" },
        ],
        standards: [],
        warranty: null,
        publicPrice: null,
        quotationRequired: true,
        source: SE_HYDROGEN_SOLUTIONS,
      }),
    ],
    sources: [SE_HYDROGEN_SOLUTIONS, SE_ELYZER_FACTSHEET],
    verifiedAt: VERIFIED_AT,
    verification: "vendor-claim",
    confidence: "high",
    notes:
      "The earlier Silyzer 300 name does not appear on the current product page, which markets the PEM line under the Elyzer name (Elyzer P-300). Reference projects listed by the vendor include OMV (140 MW), EWE (280 MW) and Air Liquide Normand'Hy (200 MW).",
  },
  {
    id: "sup-itm-power",
    companyName: "ITM Power",
    country: "GB",
    countryName: "United Kingdom",
    headquarters: "Sheffield",
    categories: ["pem-electrolyser"],
    description:
      "UK manufacturer of PEM electrolysers built on its TRIDENT stack platform, sold as containerised plants (NEPTUNE) and large skid-mounted modules (POSEIDON).",
    website: "https://itm-power.com/",
    ownership: "Listed (LSE AIM: ITM)",
    founded: 2001,
    products: [
      product({
        id: "prd-itm-power-neptune-v",
        supplierId: "sup-itm-power",
        model: "NEPTUNE V",
        category: "pem-electrolyser",
        description:
          "Full-scope 5 MW containerised PEM hydrogen plant with eight stacks, including water purification, hydrogen purification, power supply unit and controls, factory acceptance tested before shipment.",
        capacity: { value: 5, unit: "MW" },
        efficiencyKwhPerKg: 55.9,
        outputPressureBar: 30,
        specs: [
          {
            label: "AC power consumption (full system incl. water purification, stack and BoP, beginning of life)",
            value: "55.9",
            unit: "kWh/kg",
            basis: "vendor-claim",
          },
          { label: "H₂ production", value: "90", unit: "kg/h", basis: "vendor-claim" },
          { label: "Number of stacks", value: "8", basis: "vendor-claim" },
          { label: "Operating range", value: "12.5–100", unit: "%", basis: "vendor-claim" },
          { label: "H₂ output purity", value: "<5 ppm H₂O, <5 ppm O₂", basis: "vendor-claim" },
          { label: "System footprint", value: "~96 (excl. hazardous areas)", unit: "m²", basis: "vendor-claim" },
          { label: "Modulation", value: "10 %/s ramp-up, 50 %/s ramp-down", basis: "vendor-claim" },
          { label: "Input water", value: "Potable water", basis: "vendor-claim" },
          { label: "Ambient temperature range", value: "-20 to +45", unit: "°C", basis: "vendor-claim" },
        ],
        standards: ["CE", "EN 17124 (purity)", "ISO 14687 (purity)"],
        warranty: null,
        publicPrice: {
          amount: 5_000_000,
          currency: "EUR",
          unit: "per 5 MW NEPTUNE V plant, based on ITM's Standard T&Cs",
          source: ITM_NEPTUNE_V_PAGE,
        },
        quotationRequired: false,
        source: ITM_NEPTUNE_V_SHEET,
      }),
      product({
        id: "prd-itm-power-poseidon",
        supplierId: "sup-itm-power",
        model: "POSEIDON",
        category: "pem-electrolyser",
        description:
          "20 MW electrolyser module for large-scale projects, based on the TRIDENT stack platform and built from skid-mounted units that can be prefabricated and pretested.",
        capacity: { value: 20, unit: "MW" },
        efficiencyKwhPerKg: null,
        outputPressureBar: null,
        specs: [{ label: "Stack platform", value: "TRIDENT", basis: "vendor-claim" }],
        standards: [],
        warranty: null,
        publicPrice: null,
        quotationRequired: true,
        source: ITM_POSEIDON,
      }),
    ],
    sources: [ITM_NEPTUNE_V_PAGE, ITM_NEPTUNE_V_SHEET, ITM_POSEIDON],
    verifiedAt: VERIFIED_AT,
    verification: "vendor-claim",
    confidence: "high",
    notes:
      "NEPTUNE V is one of the few electrolysers with a vendor-published list price (EUR 5,000,000 under ITM's standard T&Cs). Product range also includes NEPTUNE II (2 MW) and the 50 MW ALPHA plant.",
  },
  {
    id: "sup-nel",
    companyName: "Nel Hydrogen",
    country: "NO",
    countryName: "Norway",
    headquarters: "Oslo",
    categories: ["alkaline-electrolyser", "pem-electrolyser"],
    description:
      "Norwegian electrolyser maker offering atmospheric alkaline electrolysers (A Series) and containerised PEM electrolysers (MC Series).",
    website: "https://nelhydrogen.com/",
    ownership: "Listed (Oslo: NEL)",
    founded: 1927,
    manufacturingCapacity: "Herøya, Norway (alkaline) and Wallingford, CT, USA (PEM)",
    products: [
      product({
        id: "prd-nel-a485",
        supplierId: "sup-nel",
        model: "A485 (A Series)",
        category: "alkaline-electrolyser",
        description:
          "2.5 MW-class atmospheric alkaline electrolyser module; identical modules are combined into larger plants such as the 100 MW-class AWE100 configuration.",
        capacity: { value: 2.5, unit: "MW", note: "\"2.5 MW class\" module" },
        efficiencyKwhPerKg: null,
        outputPressureBar: null,
        specs: [
          { label: "Production rate", value: "1,046", unit: "kg/24 h", basis: "vendor-claim" },
          { label: "Power consumption at stack", value: "4.5", unit: "kWh/Nm³", basis: "vendor-claim" },
          { label: "Power consumption at stack (4.5 × 11.126 Nm³/kg)", value: "≈50.1", unit: "kWh/kg", basis: "derived" },
          { label: "AWE100 (100 MW class) production rate", value: "41,840", unit: "kg/24 h", basis: "vendor-claim" },
          { label: "Operating pressure", value: "Low-pressure (atmospheric) operation; no figure given", basis: "vendor-claim" },
          { label: "Uptime", value: "90%+ proven in commercial operations", basis: "vendor-claim" },
        ],
        standards: [],
        warranty: null,
        publicPrice: null,
        quotationRequired: true,
        source: NEL_A_SERIES,
      }),
      product({
        id: "prd-nel-mc500",
        supplierId: "sup-nel",
        model: "MC500 (MC Series)",
        category: "pem-electrolyser",
        description:
          "Containerised 2.5 MW-class PEM electrolyser for outdoor installation; the MC Series spans MC250 (1.25 MW) to MC4000 (20 MW) classes.",
        capacity: { value: 2.5, unit: "MW", note: "\"2.5 MW\" class" },
        efficiencyKwhPerKg: null,
        outputPressureBar: null,
        specs: [
          {
            label: "Production rate",
            value: "1,062",
            unit: "kg",
            basis: "vendor-claim",
          },
          { label: "Purity (with integrated high-purity dryer)", value: "99.9995", unit: "%", basis: "vendor-claim" },
          { label: "Ramp rate", value: "≤10 %/s", basis: "vendor-claim" },
          { label: "Cold start", value: "<8", unit: "min", basis: "vendor-claim" },
        ],
        standards: ["ISO 14687:2019", "SAE J2719"],
        warranty: null,
        publicPrice: null,
        quotationRequired: true,
        source: NEL_MC_SERIES,
      }),
    ],
    sources: [NEL_A_SERIES, NEL_MC_SERIES],
    verifiedAt: VERIFIED_AT,
    verification: "vendor-claim",
    confidence: "high",
    notes:
      "The current MC Series page does not state the time basis of the 1,062 kg production figure (earlier Nel spec sheets gave it per 24 h). Stack-level consumption only; Nel does not publish a system kWh/kg on these pages.",
  },
  {
    id: "sup-plug-power",
    companyName: "Plug Power",
    country: "US",
    countryName: "United States",
    headquarters: "Slingerlands, New York",
    categories: ["pem-electrolyser", "fuel-cell"],
    description:
      "US hydrogen company that manufactures PEM electrolysers (marketed as GenEco) and PEM fuel cell systems, and operates hydrogen production and distribution assets.",
    website: "https://www.plugpower.com/",
    ownership: "Listed (NASDAQ: PLUG)",
    founded: 1997,
    manufacturingCapacity: "1 GW gigafactory (vendor statement in 2022 EX-2125D datasheet)",
    products: [
      product({
        id: "prd-plug-ex-2125d",
        supplierId: "sup-plug-power",
        model: "EX-2125D",
        category: "pem-electrolyser",
        description:
          "Containerised 5 MW PEM electrolyser system producing up to 2,125 kg/day, designed for instantaneous load following on grid or renewable power.",
        capacity: { value: 5, unit: "MW", note: "Stack power consumption up to 5 MW" },
        efficiencyKwhPerKg: null,
        outputPressureBar: 40,
        specs: [
          { label: "Average stack efficiency (stack-level, not system)", value: "49.9", unit: "kWh/kg", basis: "vendor-claim" },
          { label: "H₂ output (volume)", value: "1,000", unit: "Nm³/h", basis: "vendor-claim" },
          { label: "H₂ output (mass)", value: "2,125", unit: "kg/day", basis: "vendor-claim" },
          { label: "Purity", value: "Up to 99.999", unit: "%", basis: "vendor-claim" },
          { label: "Water consumption", value: "13", unit: "l/kg H₂", basis: "vendor-claim" },
          { label: "Start-up time", value: "30 s warm / <5 min cold", basis: "vendor-claim" },
          { label: "Installed footprint", value: "87.9", unit: "m²", basis: "vendor-claim" },
          { label: "Voltage & frequency", value: "4.1–34.5 kVAC 60 Hz (US); 11–33 kVAC 50 Hz (EU)", basis: "vendor-claim" },
        ],
        standards: ["ISO 22734", "NFPA 2", "CE"],
        warranty: null,
        publicPrice: null,
        quotationRequired: true,
        source: PLUG_EX2125D,
      }),
      product({
        id: "prd-plug-geneco-10mw",
        supplierId: "sup-plug-power",
        model: "GenEco 10 MW",
        category: "pem-electrolyser",
        description:
          "10 MW-input PEM electrolyser with scalable modular architecture, rated by Plug at up to 4 metric tons of hydrogen per day.",
        capacity: { value: 10, unit: "MW", note: "Input power" },
        efficiencyKwhPerKg: null,
        outputPressureBar: null,
        specs: [{ label: "Hydrogen output", value: "Up to 4", unit: "t/day", basis: "vendor-claim" }],
        standards: [],
        warranty: null,
        publicPrice: null,
        quotationRequired: true,
        source: PLUG_PEM_PAGE,
      }),
    ],
    sources: [PLUG_PEM_PAGE, PLUG_EX2125D],
    verifiedAt: VERIFIED_AT,
    verification: "vendor-claim",
    confidence: "medium",
    notes:
      "EX-2125D figures come from a 2022 datasheet still hosted on plugpower.com; the current product page markets GenEco 5 MW and 10 MW units and does not state whether GenEco 5 MW is the same product. The 49.9 kWh/kg figure is stack-level.",
  },

  /* ---------------- Alkaline ---------------- */
  {
    id: "sup-thyssenkrupp-nucera",
    companyName: "thyssenkrupp nucera",
    country: "DE",
    countryName: "Germany",
    headquarters: "Dortmund",
    categories: ["alkaline-electrolyser"],
    description:
      "German supplier of alkaline water electrolysis built around the standardised 20 MW scalum® module, and of chlor-alkali electrolysis plants; also developing SOEC technology.",
    website: "https://thyssenkrupp-nucera.com/",
    ownership: "Listed (Frankfurt: NCH2); thyssenkrupp AG majority shareholder (~50.2%), De Nora ~25.9%",
    founded: null,
    manufacturingCapacity: "Supply chain capacity 1.5 GW/yr (vendor statement)",
    products: [
      product({
        id: "prd-thyssenkrupp-nucera-scalum-20mw",
        supplierId: "sup-thyssenkrupp-nucera",
        model: "scalum® 20 MW electrolyzer unit",
        category: "alkaline-electrolyser",
        description:
          "Standardised 20 MW alkaline water electrolysis module based on a single-element cell design, interconnected unit by unit for gigawatt-scale plants.",
        capacity: { value: 20, unit: "MW" },
        efficiencyKwhPerKg: null,
        outputPressureBar: null,
        specs: [
          { label: "Operating range", value: "10–100", unit: "%", basis: "vendor-claim" },
          { label: "Installed electrolysis (all technologies)", value: ">10", unit: "GW", basis: "vendor-claim" },
          { label: "Delivered 2024–2025", value: "2.7", unit: "GW", basis: "vendor-claim" },
        ],
        standards: ["ISO 22734:2019 (Chapter 4, foundational design certified by TÜV Rheinland)"],
        warranty: null,
        publicPrice: null,
        quotationRequired: true,
        source: TKN_AWE,
      }),
    ],
    sources: [TKN_AWE],
    verifiedAt: VERIFIED_AT,
    verification: "vendor-claim",
    confidence: "high",
    notes:
      "The product page does not publish production rate, energy consumption, pressure or purity for scalum®. Reserved >700 MW of production capacity for Stegra's Boden plant in 2023 (see companies dataset).",
  },
  {
    id: "sup-john-cockerill",
    companyName: "John Cockerill Hydrogen",
    country: "BE",
    countryName: "Belgium",
    headquarters: "Seraing",
    categories: ["alkaline-electrolyser"],
    description:
      "Hydrogen division of the Belgian industrial group John Cockerill, supplying large single-stack pressurised alkaline electrolysers, refuelling stations and integrated hydrogen plants.",
    website: "https://hydrogen.johncockerill.com/en/",
    ownership: "Subsidiary of John Cockerill SA (private)",
    founded: 1817,
    products: [
      product({
        id: "prd-john-cockerill-5mw-pressurised-alkaline",
        supplierId: "sup-john-cockerill",
        model: "5 MW single-stack pressurised alkaline electrolyser",
        category: "alkaline-electrolyser",
        description:
          "Pressurised alkaline electrolyser built around a single 5 MW stack, producing up to 1,000 Nm³/h of hydrogen; the vendor cites 58 references for this unit.",
        capacity: { value: 5, unit: "MW", note: "Up to 1,000 Nm³/h per unit" },
        efficiencyKwhPerKg: null,
        outputPressureBar: null,
        specs: [
          { label: "Hydrogen production", value: "Up to 1,000", unit: "Nm³/h", basis: "vendor-claim" },
          { label: "Hydrogen production (1,000 ÷ 11.126)", value: "≈90", unit: "kg/h", basis: "derived" },
          { label: "Stack configuration", value: "Single 5 MW stack", basis: "vendor-claim" },
        ],
        standards: [],
        warranty: null,
        publicPrice: null,
        quotationRequired: true,
        source: JC_ELECTROLYSERS,
      }),
    ],
    sources: [JC_ELECTROLYSERS, MCPHY_LIQUIDATION],
    verifiedAt: VERIFIED_AT,
    verification: "partially-verified",
    confidence: "medium",
    notes:
      "Official model name and full datasheet could not be retrieved (former DQ1000 datasheet URL no longer resolves), so the product is listed generically. In July 2025 the Belfort Commercial Court appointed John Cockerill Hydrogen as buyer of most of McPhy's activities, including the Belfort gigafactory; McPhy itself entered judicial liquidation.",
  },
  {
    id: "sup-longi-hydrogen",
    companyName: "LONGi Hydrogen",
    country: "CN",
    countryName: "China",
    headquarters: "Xi'an",
    categories: ["alkaline-electrolyser"],
    description:
      "Hydrogen subsidiary of solar manufacturer LONGi, producing large pressurised alkaline electrolysers in standardised series.",
    website: "https://www.longi.com/en/",
    ownership: "Subsidiary of LONGi Green Energy Technology Co., Ltd. (Shanghai: 601012)",
    founded: 2021,
    products: [
      product({
        id: "prd-longi-alk-g",
        supplierId: "sup-longi-hydrogen",
        model: "LONGi ALK G",
        category: "alkaline-electrolyser",
        description:
          "Pressurised alkaline electrolyser offered as a standardised 1,200–3,000 Nm³/h series.",
        capacity: { value: 3000, unit: "Nm³/h", note: "Upper end of 1,200–3,000 Nm³/h standardised series" },
        efficiencyKwhPerKg: null,
        outputPressureBar: 16,
        specs: [
          { label: "DC power consumption", value: "4.3–4.5", unit: "kWh/Nm³", basis: "vendor-claim" },
          { label: "DC power consumption (× 11.126 Nm³/kg)", value: "≈47.8–50.1", unit: "kWh/kg", basis: "derived" },
          { label: "Operating pressure", value: "1.6 (adjustable)", unit: "MPa", basis: "vendor-claim" },
          { label: "Load range", value: "30–110", unit: "%", basis: "vendor-claim" },
          { label: "Service life", value: "200,000", unit: "h", basis: "vendor-claim" },
        ],
        standards: [],
        warranty: null,
        publicPrice: null,
        quotationRequired: true,
        source: LONGI_ALK_G,
      }),
      product({
        id: "prd-longi-alk-hi1",
        supplierId: "sup-longi-hydrogen",
        model: "LONGi ALK Hi1",
        category: "alkaline-electrolyser",
        description:
          "Higher-efficiency pressurised alkaline electrolyser in LONGi's range; the page cites a 4,000 Nm³/h gas-liquid separation module.",
        capacity: null,
        efficiencyKwhPerKg: null,
        outputPressureBar: 16,
        specs: [
          { label: "DC power consumption", value: "4.1–4.3", unit: "kWh/Nm³", basis: "vendor-claim" },
          { label: "DC power consumption (× 11.126 Nm³/kg)", value: "≈45.6–47.8", unit: "kWh/kg", basis: "derived" },
          { label: "Operating pressure", value: "1.6 (adjustable)", unit: "MPa", basis: "vendor-claim" },
          { label: "Load range", value: "30–110", unit: "%", basis: "vendor-claim" },
          { label: "Service life", value: "200,000", unit: "h", basis: "vendor-claim" },
        ],
        standards: [],
        warranty: null,
        publicPrice: null,
        quotationRequired: true,
        source: LONGI_ALK_HI1,
      }),
    ],
    sources: [LONGI_ALK_G, LONGI_ALK_HI1],
    verifiedAt: VERIFIED_AT,
    verification: "vendor-claim",
    confidence: "medium",
    notes: "Purity and certifications are not stated on the product pages (Hi1 page mentions \"more than 10 professional certifications\" without naming them).",
  },
  {
    id: "sup-sungrow-hydrogen",
    companyName: "Sungrow Hydrogen",
    country: "CN",
    countryName: "China",
    headquarters: "Hefei",
    categories: ["alkaline-electrolyser", "pem-electrolyser", "power-electronics"],
    description:
      "Hydrogen business of inverter maker Sungrow, supplying alkaline and PEM electrolysers together with PWM hydrogen-production power supplies (AC/DC rectifiers, DC/DC converters) and plant management software.",
    website: "https://www.sungrowpower.com/en/hydrogen",
    ownership: "Subsidiary of Sungrow Power Supply Co., Ltd. (Shenzhen: 300274)",
    founded: null,
    products: [
      product({
        id: "prd-sungrow-alk-electrolyser",
        supplierId: "sup-sungrow-hydrogen",
        model: "ALK water electrolysis equipment",
        category: "alkaline-electrolyser",
        description: "Alkaline water electrolyser line designed for fluctuating renewable power input.",
        capacity: null,
        efficiencyKwhPerKg: null,
        outputPressureBar: null,
        specs: [
          { label: "Min. DC power consumption", value: "4.5", unit: "kWh/Nm³", basis: "vendor-claim" },
          { label: "Min. DC power consumption (× 11.126 Nm³/kg)", value: "≈50.1", unit: "kWh/kg", basis: "derived" },
          { label: "Operating range", value: "25–110", unit: "%", basis: "vendor-claim" },
          { label: "Ramp rate", value: "5 %/s up/down", basis: "vendor-claim" },
          { label: "Cold start", value: "<30", unit: "min", basis: "vendor-claim" },
        ],
        standards: [],
        warranty: null,
        publicPrice: null,
        quotationRequired: true,
        source: SUNGROW_ALK,
      }),
      product({
        id: "prd-sungrow-pem-electrolyser",
        supplierId: "sup-sungrow-hydrogen",
        model: "PEM water electrolysis equipment",
        category: "pem-electrolyser",
        description:
          "PEM electrolyser line; the vendor's news lists the launch of a 300 Nm³/h PEM unit.",
        capacity: null,
        efficiencyKwhPerKg: null,
        outputPressureBar: null,
        specs: [
          { label: "Ramp rate", value: "10 %/s up/down", basis: "vendor-claim" },
          { label: "Cold start", value: "<10", unit: "min", basis: "vendor-claim" },
          {
            label: "DC power consumption",
            value: "Page states both \"<4.3\" and \"4.5\" (min.) — inconsistent",
            unit: "kWh/Nm³",
            basis: "vendor-claim",
          },
        ],
        standards: [],
        warranty: null,
        publicPrice: null,
        quotationRequired: true,
        source: SUNGROW_PEM,
      }),
    ],
    sources: [SUNGROW_ALK, SUNGROW_PEM],
    verifiedAt: VERIFIED_AT,
    verification: "vendor-claim",
    confidence: "medium",
    notes:
      "Product pages give no model numbers, nominal flow or pressure; datasheets are linked but were not machine-readable. The PEM page gives conflicting operating ranges (5–110% vs 25–110%) and consumption figures. Founding year of the hydrogen subsidiary not confirmed in an official source.",
  },
  {
    id: "sup-sunfire",
    companyName: "Sunfire",
    country: "DE",
    countryName: "Germany",
    headquarters: "Dresden",
    categories: ["alkaline-electrolyser", "soec-electrolyser"],
    description:
      "German electrolyser manufacturer offering both pressurised alkaline (HyLink® Alkaline) and solid oxide (HyLink® SOEC) electrolysis modules.",
    website: "https://www.sunfire.de/en/",
    ownership: "Private (venture-backed)",
    founded: 2010,
    products: [
      product({
        id: "prd-sunfire-hylink-alkaline-23",
        supplierId: "sup-sunfire",
        model: "Sunfire-HyLink® Alkaline 23",
        category: "alkaline-electrolyser",
        description:
          "50 MW pressurised alkaline electrolysis module built on 5 MW AEL stacks, producing up to 1,000 kg/h of hydrogen at 30 bar(g).",
        capacity: { value: 50, unit: "MW" },
        efficiencyKwhPerKg: null,
        outputPressureBar: 30,
        specs: [
          { label: "H₂ output", value: "1,000", unit: "kg/h", basis: "vendor-claim" },
          { label: "Efficiency", value: "67 (LHV, DC)", unit: "%", basis: "vendor-claim" },
          { label: "Implied DC consumption (33.33 kWh/kg LHV ÷ 0.67)", value: "≈49.7", unit: "kWh/kg", basis: "derived" },
          { label: "Stack", value: "5 MW AEL stack", basis: "vendor-claim" },
        ],
        standards: [],
        warranty: null,
        publicPrice: null,
        quotationRequired: true,
        source: SUNFIRE_ALK23,
      }),
      product({
        id: "prd-sunfire-hylink-soec",
        supplierId: "sup-sunfire",
        model: "Sunfire-HyLink® SOEC (GEN 3)",
        category: "soec-electrolyser",
        description:
          "Standardised 10 MW solid oxide electrolysis module operating at ~800 °C on low-pressure steam, aimed at sites with industrial waste heat.",
        capacity: { value: 10, unit: "MW" },
        efficiencyKwhPerKg: 37.5,
        outputPressureBar: null,
        specs: [
          {
            label: "Electrical consumption (GEN 3, assumes 100% external steam supply)",
            value: "37.5",
            unit: "kWh/kg",
            basis: "vendor-claim",
          },
          { label: "Efficiency", value: "89 (LHV, AC)", unit: "%", basis: "vendor-claim" },
          { label: "Efficiency proven with GEN 1 (GrInHy2.0, 2022)", value: "84 (LHV, AC)", unit: "%", basis: "vendor-claim" },
          { label: "Net production rate", value: "291", unit: "kg/h", basis: "vendor-claim" },
          { label: "Load flexibility", value: "50–100 %, 10 %/min", basis: "vendor-claim" },
          { label: "Steam input", value: "Low-pressure steam >150 °C", basis: "vendor-claim" },
          { label: "Net module footprint", value: "34 × 7.5", unit: "m", basis: "vendor-claim" },
        ],
        standards: ["ISO 14687 Grade B (product gas, water-saturated)"],
        warranty: "Efficiency and capacity guaranteed via full LTSA including all required stack replacements",
        publicPrice: null,
        quotationRequired: true,
        source: SUNFIRE_SOEC,
      }),
    ],
    sources: [SUNFIRE_HYDROGEN, SUNFIRE_ALK23, SUNFIRE_SOEC],
    verifiedAt: VERIFIED_AT,
    verification: "vendor-claim",
    confidence: "high",
    notes:
      "SOEC 37.5 kWh/kg is an electricity-only figure that assumes steam is supplied externally; it is not comparable with PEM/alkaline kWh/kg without accounting for heat. Also offers HyLink® Alkaline 22 (10 MW module).",
  },

  /* ---------------- SOEC / fuel cells ---------------- */
  {
    id: "sup-bloom-energy",
    companyName: "Bloom Energy",
    country: "US",
    countryName: "United States",
    headquarters: "San Jose, California",
    categories: ["soec-electrolyser", "fuel-cell"],
    description:
      "US manufacturer of solid oxide fuel cell power systems (Energy Server) and solid oxide electrolysers built on the same cell platform.",
    website: "https://www.bloomenergy.com/",
    ownership: "Listed (NYSE: BE)",
    founded: 2001,
    manufacturingCapacity: "Approaching 3 GW/yr of electrolysis manufacturing capacity, Fremont (vendor statement)",
    products: [
      product({
        id: "prd-bloom-electrolyzer",
        supplierId: "sup-bloom-energy",
        model: "Bloom Electrolyzer",
        category: "soec-electrolyser",
        description:
          "High-temperature solid oxide electrolyser derived from the Energy Server platform; the vendor reports system-level consumption from pilot testing at Idaho National Laboratory.",
        capacity: null,
        efficiencyKwhPerKg: 37.5,
        outputPressureBar: null,
        specs: [
          {
            label: "Electricity consumption at system level (INL pilot results; steam/heat basis not stated)",
            value: "37.5",
            unit: "kWh/kg",
            basis: "vendor-claim",
          },
          { label: "Availability", value: "99", unit: "%", basis: "vendor-claim" },
        ],
        standards: [],
        warranty: null,
        publicPrice: null,
        quotationRequired: true,
        source: BLOOM_ELECTROLYZER,
      }),
      product({
        id: "prd-bloom-energy-server-6-5",
        supplierId: "sup-bloom-energy",
        model: "Bloom Energy Server® 6.5",
        category: "fuel-cell",
        description:
          "325 kW solid oxide fuel cell power system for on-site generation; rated on natural gas, with biogas, blended hydrogen and hydrogen operation available on request.",
        capacity: { value: 325, unit: "kW", note: "Nameplate net AC output" },
        efficiencyKwhPerKg: null,
        outputPressureBar: null,
        specs: [
          { label: "Rated fuel", value: "Natural gas (contact Bloom for biogas, blended H₂ and H₂)", basis: "vendor-claim" },
          { label: "Cumulative electrical efficiency", value: "65–53 (LHV net AC)", unit: "%", basis: "vendor-claim" },
          { label: "Total efficiency (with heat recovery)", value: ">90", unit: "%", basis: "vendor-claim" },
          { label: "Water consumption", value: "None during normal operation", basis: "vendor-claim" },
          { label: "Weight (with skid)", value: "13", unit: "t", basis: "vendor-claim" },
          { label: "Dimensions (with skid)", value: "9 × 1.3 × 2.5", unit: "m", basis: "vendor-claim" },
        ],
        standards: ["ANSI/CSA FC1-2014 (UL listed)", "UL 1741", "UL 1998", "CE", "IEEE 1547-2018", "EN 61000-6-2", "EN 61000-6-4"],
        warranty: null,
        publicPrice: null,
        quotationRequired: true,
        source: BLOOM_ES65,
      }),
    ],
    sources: [BLOOM_ELECTROLYZER, BLOOM_ES65],
    verifiedAt: VERIFIED_AT,
    verification: "vendor-claim",
    confidence: "medium",
    notes:
      "Electrolyzer page gives no per-unit capacity or pressure; the 37.5 kWh/kg figure is a pilot result and excludes any external heat input. Energy Server efficiencies are stated for natural gas.",
  },
  {
    id: "sup-enapter",
    companyName: "Enapter",
    country: "DE",
    countryName: "Germany",
    headquarters: "Saerbeck",
    categories: ["aem-electrolyser"],
    description:
      "Manufacturer of anion exchange membrane (AEM) electrolysers, from stackable kW-scale EL 4 modules to the MW-scale AEM Nexus.",
    website: "https://enapter.com/",
    ownership: "Listed (Frankfurt/XETRA: H2O)",
    founded: 2017,
    products: [
      product({
        id: "prd-enapter-aem-nexus-2500",
        supplierId: "sup-enapter",
        model: "AEM Nexus 2500",
        category: "aem-electrolyser",
        description:
          "2.5 MW AEM electrolyser system for industrial and project-scale hydrogen production; smaller Nexus 1000 and 500 variants share the same system efficiency rating.",
        capacity: { value: 2.5, unit: "MW" },
        efficiencyKwhPerKg: 51.3,
        outputPressureBar: 31,
        specs: [
          { label: "System efficiency", value: "51.3", unit: "kWh/kg", basis: "vendor-claim" },
          { label: "Production rate", value: "491.6 Nm³/h (44.2 kg/h)", basis: "vendor-claim" },
          { label: "Operational flexibility", value: "3.5–100", unit: "%", basis: "vendor-claim" },
          { label: "Outlet pressure", value: "Up to 31", unit: "barg", basis: "vendor-claim" },
          { label: "Hydrogen purity", value: "Up to 99.999", unit: "%", basis: "vendor-claim" },
        ],
        standards: [],
        warranty: null,
        publicPrice: null,
        quotationRequired: true,
        source: ENAPTER_NEXUS,
      }),
      product({
        id: "prd-enapter-el-4",
        supplierId: "sup-enapter",
        model: "AEM Electrolyzer EL 4",
        category: "aem-electrolyser",
        description:
          "Compact kW-scale AEM electrolyser module that can run standalone or be stacked with other units; short lead times.",
        capacity: { value: 0.5, unit: "Nm³/h", note: "500 NL/h per module" },
        efficiencyKwhPerKg: null,
        outputPressureBar: 35,
        specs: [
          { label: "Production rate", value: "500 NL/h (1.0785 kg/24 h)", basis: "vendor-claim" },
          { label: "Outlet pressure", value: "Up to 35", unit: "barg", basis: "vendor-claim" },
          { label: "Hydrogen purity", value: "99.9 (>99.999 with optional dryer)", unit: "%", basis: "vendor-claim" },
        ],
        standards: [],
        warranty: null,
        publicPrice: null,
        quotationRequired: true,
        source: ENAPTER_EL4,
      }),
    ],
    sources: [ENAPTER_NEXUS, ENAPTER_EL4],
    verifiedAt: VERIFIED_AT,
    verification: "vendor-claim",
    confidence: "high",
    notes: "Range also includes AEM Flex 120 (70–450 kW) and AEM Rheos 20.",
  },
  {
    id: "sup-ballard",
    companyName: "Ballard Power Systems",
    country: "CA",
    countryName: "Canada",
    headquarters: "Burnaby, British Columbia",
    categories: ["fuel-cell"],
    description:
      "Canadian developer and manufacturer of PEM fuel cell stacks and modules for buses, trucks, rail, marine and stationary power.",
    website: "https://www.ballard.com/",
    ownership: "Listed (NASDAQ / TSX: BLDP)",
    founded: 1979,
    products: [
      product({
        id: "prd-ballard-fcmove-xd",
        supplierId: "sup-ballard",
        model: "FCmove®-XD",
        category: "fuel-cell",
        description:
          "135 kW liquid-cooled PEM fuel cell module for heavy-duty vehicles, based on the FCgen®-HPS stack and scalable by combining modules.",
        capacity: { value: 135, unit: "kW", note: "Rated power" },
        efficiencyKwhPerKg: null,
        outputPressureBar: null,
        specs: [
          { label: "Weight", value: "238", unit: "kg", basis: "vendor-claim" },
          { label: "Stack", value: "FCgen®-HPS", basis: "vendor-claim" },
          { label: "Freeze start", value: "-30", unit: "°C", basis: "vendor-claim" },
          { label: "Ingress protection", value: "IP6K9K", basis: "vendor-claim" },
        ],
        standards: [],
        warranty: null,
        publicPrice: null,
        quotationRequired: true,
        source: BALLARD_FCMOVE,
      }),
      product({
        id: "prd-ballard-fcwave",
        supplierId: "sup-ballard",
        model: "FCwave™",
        category: "fuel-cell",
        description:
          "200 kW cabinet-based PEM fuel cell module for marine and stationary applications, scalable from 200 kW to 1.2 MW.",
        capacity: { value: 200, unit: "kW", note: "Per module" },
        efficiencyKwhPerKg: null,
        outputPressureBar: null,
        specs: [
          { label: "Scalability", value: "200 kW – 1.2 MW", basis: "vendor-claim" },
          { label: "DC voltage", value: "350–720", unit: "V", basis: "vendor-claim" },
          { label: "Dimensions", value: "1,209 × 741 × 2,195", unit: "mm", basis: "vendor-claim" },
          { label: "Weight", value: "1,000", unit: "kg", basis: "vendor-claim" },
          { label: "Ingress protection", value: "IP44", basis: "vendor-claim" },
        ],
        standards: ["DNV type approval (marine)"],
        warranty: null,
        publicPrice: null,
        quotationRequired: true,
        source: BALLARD_FCWAVE,
      }),
    ],
    sources: [BALLARD_FCMOVE, BALLARD_FCWAVE],
    verifiedAt: VERIFIED_AT,
    verification: "vendor-claim",
    confidence: "high",
  },

  /* ---------------- Balance of plant ---------------- */
  {
    id: "sup-burckhardt-compression",
    companyName: "Burckhardt Compression",
    country: "CH",
    countryName: "Switzerland",
    headquarters: "Winterthur",
    categories: ["compressor"],
    description:
      "Swiss manufacturer of reciprocating and diaphragm compressors, supplying hydrogen compression for refuelling, trailer filling, pipeline injection and process applications.",
    website: "https://www.burckhardtcompression.com/",
    ownership: "Listed (SIX: BCHN)",
    founded: 1844,
    products: [
      product({
        id: "prd-burckhardt-md10-l",
        supplierId: "sup-burckhardt-compression",
        model: "MD10-L diaphragm compressor (containerised)",
        category: "compressor",
        description:
          "Containerised, oil-free diaphragm compressor package for hydrogen, sized to match roughly 2–5 MW of electrolysis, for fuel stations, trailer filling and pipeline injection.",
        capacity: { value: 1100, unit: "Nm³/h", note: "Flow range 350–1,100 Nm³/h" },
        efficiencyKwhPerKg: null,
        outputPressureBar: 550,
        specs: [
          { label: "Discharge pressure", value: "300–550 (body text says 350–550)", unit: "barg", basis: "vendor-claim" },
          { label: "Suction pressure", value: "13–40", unit: "barg", basis: "vendor-claim" },
          { label: "Flow", value: "350–1,100", unit: "Nm³/h", basis: "vendor-claim" },
          { label: "Matching electrolyser size", value: "2–5", unit: "MW", basis: "vendor-claim" },
          { label: "Compression", value: "Oil-free, leakage-free", basis: "vendor-claim" },
        ],
        standards: ["SAE J2719 (purity)"],
        warranty: null,
        publicPrice: null,
        quotationRequired: true,
        source: BURCKHARDT_DIAPHRAGM,
      }),
    ],
    sources: [BURCKHARDT_DIAPHRAGM, BURCKHARDT_HYDS],
    verifiedAt: VERIFIED_AT,
    verification: "vendor-claim",
    confidence: "high",
    notes:
      "Selected by HYDS (Norway) to supply reciprocating compressors up to 515 bar for trailer filling at Nordic sites, subject to finalisation of agreements.",
  },
  {
    id: "sup-hexagon-purus",
    companyName: "Hexagon Purus",
    country: "NO",
    countryName: "Norway",
    headquarters: "Oslo",
    categories: ["storage", "pipeline-distribution"],
    description:
      "Norwegian maker of Type 4 composite high-pressure hydrogen cylinders and the storage, distribution and refuelling systems built from them.",
    website: "https://hexagonpurus.com/",
    ownership: "Listed (Oslo: HPUR)",
    founded: null,
    products: [
      product({
        id: "prd-hexagon-purus-h2-distribution-modules",
        supplierId: "sup-hexagon-purus",
        model: "Hydrogen distribution system modules",
        category: "pipeline-distribution",
        description:
          "Lightweight containerised Type 4 cylinder modules for road transport of compressed hydrogen from production sites to filling stations and industrial users, also used for mobile refuelling with cascade technology.",
        capacity: { value: 1.1, unit: "t H₂", note: "Up to 1.1 tonnes per module (largest size)" },
        efficiencyKwhPerKg: null,
        outputPressureBar: null,
        specs: [
          { label: "Module sizes", value: "10 ft to 45 ft standard modules", basis: "vendor-claim" },
          { label: "Payload", value: "Up to 1.1", unit: "t H₂", basis: "vendor-claim" },
        ],
        standards: [],
        warranty: null,
        publicPrice: null,
        quotationRequired: true,
        source: HEXPURUS_DISTRIBUTION,
      }),
      product({
        id: "prd-hexagon-purus-type-4-cylinders",
        supplierId: "sup-hexagon-purus",
        model: "Hydrogen high-pressure Type 4 cylinders",
        category: "storage",
        description:
          "Composite (Type 4) high-pressure hydrogen cylinders for vehicle fuel systems, stationary storage and gas transport, tested in-house for burst, bonfire, permeation and related requirements.",
        capacity: null,
        efficiencyKwhPerKg: null,
        outputPressureBar: null,
        specs: [{ label: "Construction", value: "Composite Type 4", basis: "vendor-claim" }],
        standards: ["ISO 9001:2008 (manufacturing)", "IATF 16949:2016 (manufacturing)"],
        warranty: null,
        publicPrice: null,
        quotationRequired: true,
        source: HEXPURUS_TYPE4,
      }),
    ],
    sources: [HEXPURUS_DISTRIBUTION, HEXPURUS_TYPE4, HEXPURUS_BVI_REVIEW],
    verifiedAt: VERIFIED_AT,
    verification: "vendor-claim",
    confidence: "medium",
    notes:
      "Web pages do not list working pressures or water volumes (datasheets are PDF downloads). The company reported an operational restructuring and a strategic review of its battery systems & vehicle integration segment in 2025–2026 stock exchange releases.",
  },
  {
    id: "sup-ingeteam",
    companyName: "Ingeteam",
    country: "ES",
    countryName: "Spain",
    headquarters: "Zamudio (Bizkaia)",
    categories: ["power-electronics"],
    description:
      "Spanish power-electronics group supplying IGBT-based rectifiers and complete MV power stations for PEM, alkaline, SOEC and AEM electrolysers.",
    website: "https://www.ingeteam.com/",
    ownership: "Private",
    founded: 1972,
    products: [
      product({
        id: "prd-ingeteam-ingecon-h2-e-series",
        supplierId: "sup-ingeteam",
        model: "INGECON® H2 E-Series",
        category: "power-electronics",
        description:
          "Liquid-cooled IGBT electrolyser rectifier with two independent DC outputs and low harmonic distortion, designed for close coupling to an MV/LV transformer.",
        capacity: { value: 6000, unit: "A DC", note: "Rated current at 720–900 Vdc, 35 °C" },
        efficiencyKwhPerKg: null,
        outputPressureBar: null,
        specs: [
          { label: "DC voltage range", value: "330–1,300 (1,500 option)", unit: "V", basis: "vendor-claim" },
          { label: "Maximum DC current", value: "7,700", unit: "A", basis: "vendor-claim" },
          { label: "DC current ripple", value: "<3", unit: "%", basis: "vendor-claim" },
          { label: "THD", value: "<3", unit: "%", basis: "vendor-claim" },
          { label: "Maximum efficiency", value: "98.9", unit: "%", basis: "vendor-claim" },
          { label: "Euroefficiency", value: "98.5", unit: "%", basis: "vendor-claim" },
          { label: "AC rated voltage", value: "240–690 V IT system, 50/60 Hz", basis: "vendor-claim" },
          { label: "Protection class", value: "IP65 (LC filter and heat exchanger IP54)", basis: "vendor-claim" },
          { label: "Weight", value: "5,500", unit: "kg", basis: "vendor-claim" },
        ],
        standards: [
          "CE (UL option)",
          "IEC 62477-1",
          "UL 1741 Ed.3",
          "CSA C22.2 No 107.1",
          "IEC 60529",
          "NFPA 70",
          "CSA C22.1",
        ],
        warranty: "Standard 2-year warranty, extendable upon request",
        publicPrice: null,
        quotationRequired: true,
        source: INGETEAM_E_SERIES,
      }),
    ],
    sources: [INGETEAM_H2, INGETEAM_E_SERIES],
    verifiedAt: VERIFIED_AT,
    verification: "vendor-claim",
    confidence: "high",
    notes: "Range also includes INGECON H2 Megalyzer rectifiers and FSK E6000/E12000 power stations.",
  },
  {
    id: "sup-msa-safety",
    companyName: "MSA Safety",
    country: "US",
    countryName: "United States",
    headquarters: "Cranberry Township, Pennsylvania",
    categories: ["safety-monitoring"],
    description:
      "US safety-equipment manufacturer whose fixed gas detection portfolio includes monitors configurable for hydrogen and other combustible, toxic and oxygen measurements.",
    website: "https://www.msasafety.com/",
    ownership: "Listed (NYSE: MSA)",
    founded: 1914,
    products: [
      product({
        id: "prd-msa-ultima-x5000",
        supplierId: "sup-msa-safety",
        model: "ULTIMA® X5000 Gas Monitor",
        category: "safety-monitoring",
        description:
          "Fixed gas monitor using MSA XCell® digital sensors; hydrogen is among the gases listed in its specification.",
        capacity: null,
        efficiencyKwhPerKg: null,
        outputPressureBar: null,
        specs: [
          { label: "Sensor technology", value: "XCell® sensors (TruCal® on H₂S and CO sensors only)", basis: "vendor-claim" },
          { label: "Gases", value: "Oxygen, toxic and combustible gases incl. hydrogen", basis: "vendor-claim" },
        ],
        standards: [],
        warranty: null,
        publicPrice: null,
        quotationRequired: true,
        source: MSA_X5000,
      }),
    ],
    sources: [MSA_X5000],
    verifiedAt: VERIFIED_AT,
    verification: "partially-verified",
    confidence: "medium",
    notes:
      "Approvals (ATEX/IECEx/SIL) vary by configuration and country and are not listed on the official page used; hydrogen range and sensor part number must be confirmed with MSA.",
  },
];
