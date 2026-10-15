/**
 * DEMO DATA — a fictional project used to preview the Engineering & Project
 * Delivery workspace. Names, budgets and dates are invented for illustration
 * and must never be presented as a real project.
 */
import type { WorkspaceMilestone, WorkspaceRisk, WorkspaceTask } from "@/domain/types";

export const WORKSPACE_DEMO = {
  projectName: "Demo: 50 MW coastal electrolysis plant",
  tasks: [
    { id: "t1", title: "Grid connection capacity study", phase: "Feasibility", owner: "Grid & Power", due: "2026-06-30", status: "done" },
    { id: "t2", title: "Water source & treatment concept", phase: "Feasibility", owner: "Process", due: "2026-07-15", status: "done" },
    { id: "t3", title: "Technology selection: PEM vs alkaline", phase: "Pre-FEED", owner: "Process", due: "2026-09-30", status: "done" },
    { id: "t4", title: "Electrolyser RFQ package", phase: "Pre-FEED", owner: "Procurement", due: "2026-10-31", status: "in-progress" },
    { id: "t5", title: "Hazardous area classification (ATEX)", phase: "Pre-FEED", owner: "HSE", due: "2026-11-15", status: "in-progress" },
    { id: "t6", title: "Environmental permit application", phase: "Pre-FEED", owner: "Permitting", due: "2026-12-01", status: "blocked" },
    { id: "t7", title: "FEED contractor award", phase: "FEED", owner: "Project Director", due: "2027-01-15", status: "todo" },
    { id: "t8", title: "Offtake term sheet", phase: "FEED", owner: "Commercial", due: "2027-02-28", status: "todo" },
    { id: "t9", title: "Long-lead items: transformers & rectifiers", phase: "Procurement", owner: "Procurement", due: "2027-05-30", status: "todo" },
  ] satisfies WorkspaceTask[],
  milestones: [
    { id: "m1", title: "Feasibility study approved", date: "2026-07-31", status: "done" },
    { id: "m2", title: "Technology selected", date: "2026-09-30", status: "done" },
    { id: "m3", title: "Permit submission", date: "2026-12-01", status: "at-risk" },
    { id: "m4", title: "FEED complete", date: "2027-06-30", status: "upcoming" },
    { id: "m5", title: "Final investment decision", date: "2027-09-30", status: "upcoming" },
    { id: "m6", title: "Mechanical completion", date: "2029-03-31", status: "upcoming" },
    { id: "m7", title: "Commissioning & handover", date: "2029-09-30", status: "upcoming" },
  ] satisfies WorkspaceMilestone[],
  risks: [
    { id: "r1", title: "Grid connection date slips beyond COD", category: "Schedule", likelihood: 3, impact: 5, mitigation: "Early TSO agreement; phased energisation", owner: "Grid & Power" },
    { id: "r2", title: "Electrolyser delivery lead time > 18 months", category: "Supply chain", likelihood: 3, impact: 4, mitigation: "Reserve manufacturing slot with two bidders", owner: "Procurement" },
    { id: "r3", title: "Offtaker volume commitment below 70 %", category: "Commercial", likelihood: 2, impact: 5, mitigation: "Second offtaker; merchant ammonia option", owner: "Commercial" },
    { id: "r4", title: "Water permit conditions on discharge", category: "Permitting", likelihood: 3, impact: 3, mitigation: "Zero-liquid-discharge concept as alternative", owner: "Permitting" },
    { id: "r5", title: "Stack degradation above warranty", category: "Technical", likelihood: 2, impact: 3, mitigation: "Performance guarantee with LDs in supply contract", owner: "Process" },
    { id: "r6", title: "Power price volatility during ramp-up", category: "Market", likelihood: 4, impact: 3, mitigation: "Hedge 60 % of first-year volume", owner: "Commercial" },
  ] satisfies WorkspaceRisk[],
  budget: [
    {
      line: "Electrolyser system",
      budgetEur: 46_000_000,
      committedEur: 0,
      suppliers: [
        { name: "Siemens Energy", supplierId: "sup-siemens-energy" },
        { name: "John Cockerill Hydrogen", supplierId: "sup-john-cockerill" },
      ],
      deadline: { date: "2027-07-31", label: "Supply contract award" },
      items: [
        { item: "Stacks & cell modules", budgetEur: 24_000_000, committedEur: 0 },
        { item: "Gas separation & purification", budgetEur: 7_500_000, committedEur: 0 },
        { item: "Water circulation & cooling skids", budgetEur: 4_500_000, committedEur: 0 },
        { item: "Control system & instrumentation", budgetEur: 3_000_000, committedEur: 0 },
        { item: "Installation supervision & commissioning", budgetEur: 3_500_000, committedEur: 0 },
        { item: "Spares & first fill", budgetEur: 3_500_000, committedEur: 0 },
      ],
    },
    {
      line: "Power electronics & HV",
      budgetEur: 18_000_000,
      committedEur: 0,
      suppliers: [
        { name: "Ingeteam", supplierId: "sup-ingeteam" },
        { name: "Sungrow Hydrogen", supplierId: "sup-sungrow-hydrogen" },
      ],
      deadline: { date: "2027-05-30", label: "Long-lead purchase order" },
      items: [
        { item: "Rectifiers", budgetEur: 7_500_000, committedEur: 0 },
        { item: "Power transformers", budgetEur: 5_000_000, committedEur: 0 },
        { item: "HV substation & switchgear", budgetEur: 4_000_000, committedEur: 0 },
        { item: "MV distribution & cabling", budgetEur: 1_500_000, committedEur: 0 },
      ],
    },
    {
      line: "Balance of plant",
      budgetEur: 14_000_000,
      committedEur: 0,
      suppliers: [
        { name: "Burckhardt Compression", supplierId: "sup-burckhardt-compression" },
        { name: "MSA Safety", supplierId: "sup-msa-safety" },
      ],
      deadline: { date: "2027-08-31", label: "Package awards" },
      items: [
        { item: "Hydrogen compression", budgetEur: 5_200_000, committedEur: 0 },
        { item: "Water treatment (RO + EDI)", budgetEur: 2_600_000, committedEur: 0 },
        { item: "Cooling system", budgetEur: 2_400_000, committedEur: 0 },
        { item: "Instrument air & nitrogen", budgetEur: 1_100_000, committedEur: 0 },
        { item: "Piping & mechanical installation", budgetEur: 2_700_000, committedEur: 0 },
      ],
    },
    {
      line: "Civil & buildings",
      budgetEur: 9_000_000,
      committedEur: 0,
      suppliers: [],
      deadline: { date: "2027-10-31", label: "Civil contractor award" },
      items: [
        { item: "Electrolyser hall", budgetEur: 4_100_000, committedEur: 0 },
        { item: "Site preparation & foundations", budgetEur: 3_200_000, committedEur: 0 },
        { item: "Roads, drainage & fencing", budgetEur: 1_700_000, committedEur: 0 },
      ],
    },
    {
      line: "Engineering (FEED/EPCM)",
      budgetEur: 7_500_000,
      committedEur: 1_850_000,
      suppliers: [{ name: "Demo engineering consultancy" }],
      deadline: { date: "2027-01-15", label: "FEED contractor award" },
      items: [
        { item: "EPCM services", budgetEur: 3_250_000, committedEur: 0 },
        { item: "FEED", budgetEur: 2_400_000, committedEur: 0 },
        { item: "Pre-FEED", budgetEur: 1_200_000, committedEur: 1_200_000 },
        { item: "Feasibility & concept", budgetEur: 650_000, committedEur: 650_000 },
      ],
    },
    {
      line: "Owner's costs & permitting",
      budgetEur: 3_200_000,
      committedEur: 1_120_000,
      suppliers: [{ name: "Demo environmental consultancy" }, { name: "Transmission system operator (grid studies)" }],
      deadline: { date: "2026-12-01", label: "Permit submission" },
      items: [
        { item: "Owner's team", budgetEur: 1_400_000, committedEur: 0 },
        { item: "Permitting & environmental studies", budgetEur: 900_000, committedEur: 620_000 },
        { item: "Grid connection application & studies", budgetEur: 600_000, committedEur: 500_000 },
        { item: "Legal & insurance", budgetEur: 300_000, committedEur: 0 },
      ],
    },
    {
      line: "Contingency (10 %)",
      budgetEur: 9_770_000,
      committedEur: 0,
      suppliers: [],
      deadline: { date: "2027-09-30", label: "Released at FID" },
      items: [{ item: "Unallocated contingency (10 % of base cost)", budgetEur: 9_770_000, committedEur: 0 }],
    },
  ],
  documents: [
    { id: "d1", title: "Feasibility study v2.1", type: "Report", updated: "2026-07-28", status: "Approved" },
    { id: "d2", title: "Process flow diagram — electrolysis island", type: "Drawing", updated: "2026-09-12", status: "IFR" },
    { id: "d3", title: "Electrolyser technical specification", type: "Specification", updated: "2026-10-06", status: "Draft" },
    { id: "d4", title: "HAZID workshop minutes", type: "HSE", updated: "2026-09-25", status: "Issued" },
    { id: "d5", title: "Grid connection application", type: "Permit", updated: "2026-08-19", status: "Submitted" },
  ],
  suppliers: [
    { name: "Shortlisted electrolyser vendor A", scope: "PEM system, 50 MW", status: "RFQ issued" },
    { name: "Shortlisted electrolyser vendor B", scope: "Pressurised alkaline, 50 MW", status: "RFQ issued" },
    { name: "Rectifier & transformer package", scope: "HV/MV power supply", status: "Market sounding" },
    { name: "Water treatment package", scope: "RO + EDI, 30 m³/h", status: "Not started" },
  ],
};
