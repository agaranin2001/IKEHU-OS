import type { SourceRef } from "@/domain/types";

/**
 * Extended R&D Library article content, keyed by insight id. Every fact is
 * paraphrased from the cited source page and carries that page's URL; figures
 * are quoted as published. Researched against the sources on 15 Oct 2026.
 */
export interface LibraryContent {
  keyFacts: { value: string; label: string; sourceUrl: string }[];
  sections: { heading: string; paragraphs: { text: string; sourceUrls: string[] }[] }[];
  /** Pages read for this article beyond the insight record's own sources. */
  extraSources?: SourceRef[];
}

export const LIBRARY_CONTENT: Record<string, LibraryContent> = {
  "ins-iea-electrolysis-capacity-2025": {
    "keyFacts": [
      {
        "value": "nearly three-quarters",
        "label": "China's share of new electrolysis installations in 2025",
        "sourceUrl": "https://www.iea.org/reports/global-hydrogen-review-2026/executive-summary"
      },
      {
        "value": "2 GW",
        "label": "Expected European share of capacity under construction for 2026",
        "sourceUrl": "https://www.iea.org/reports/global-hydrogen-review-2026/production"
      },
      {
        "value": "> 60%",
        "label": "China's share of committed electrolysis capacity by 2026",
        "sourceUrl": "https://www.iea.org/reports/global-hydrogen-review-2026/investment-and-innovation"
      },
      {
        "value": "45%",
        "label": "Europe's share of electrolysis investment, despite under 20% of capacity",
        "sourceUrl": "https://www.iea.org/reports/global-hydrogen-review-2026/investment-and-innovation"
      },
      {
        "value": "47.2 kWh/kg",
        "label": "China's stack-level electrolyser efficiency standard for 2028",
        "sourceUrl": "https://www.iea.org/reports/global-hydrogen-review-2026/policy"
      }
    ],
    "sections": [
      {
        "heading": "Where the new capacity came from",
        "paragraphs": [
          {
            "text": "The IEA attributes the 2025 doubling of installed electrolysis capacity mainly to several large-scale projects commissioned in China. According to the agency, low technology costs and experience with large projects have allowed the country to grow faster than other markets.",
            "sourceUrls": [
              "https://www.iea.org/reports/global-hydrogen-review-2026/production",
              "https://www.iea.org/reports/global-hydrogen-review-2026/executive-summary"
            ]
          },
          {
            "text": "Growth in 2026 is expected to shift towards Europe, which accounts for 2 GW of the capacity under construction. The IEA notes that this European build-out is concentrated in a small number of big projects, with the region's first large-scale plants expected to come online in 2026.",
            "sourceUrls": [
              "https://www.iea.org/reports/global-hydrogen-review-2026/production",
              "https://www.iea.org/reports/global-hydrogen-review-2026/executive-summary"
            ]
          },
          {
            "text": "On committed electrolysis projects, China is expected to hold more than 60% of capacity by 2026 but only 25% of estimated investment. Europe represents less than 20% of that capacity yet 45% of investment, which the IEA links to higher capital expenditure per unit of capacity.",
            "sourceUrls": [
              "https://www.iea.org/reports/global-hydrogen-review-2026/investment-and-innovation"
            ]
          }
        ]
      },
      {
        "heading": "Signs of deceleration and consolidation in China",
        "paragraphs": [
          {
            "text": "Despite its lead, China is showing signs of slowing electrolysis deployment. The IEA describes unsustainable internal competition, driven by surplus manufacturing capacity and offers below manufacturing cost, which is pushing the market towards consolidation. In its discussion of China, the IEA also notes that new final investment decisions in production projects fell for the first time in 2025.",
            "sourceUrls": [
              "https://www.iea.org/reports/global-hydrogen-review-2026/executive-summary",
              "https://www.iea.org/reports/global-hydrogen-review-2026/production"
            ]
          },
          {
            "text": "In response, many electrolyser manufacturers are looking for markets outside China to secure business continuity. The IEA nonetheless considers China's short-term outlook positive, as support schemes announced since the second half of 2025 aim to extend hydrogen and hydrogen-based fuels to new sectors and cut reliance on fossil fuel imports.",
            "sourceUrls": [
              "https://www.iea.org/reports/global-hydrogen-review-2026/executive-summary",
              "https://www.iea.org/reports/global-hydrogen-review-2026/production"
            ]
          }
        ]
      },
      {
        "heading": "Investment and standards",
        "paragraphs": [
          {
            "text": "Investment in electrolysis overtook investment in CCUS-based hydrogen in 2025, helped by a stronger pipeline, higher capital intensity and faster project progress. The IEA expects electrolysis could make up around 70% of the nearly USD 10 billion of low-emissions hydrogen investment anticipated in 2026.",
            "sourceUrls": [
              "https://www.iea.org/reports/global-hydrogen-review-2026/investment-and-innovation"
            ]
          },
          {
            "text": "On standards, China has set an electrolyser efficiency requirement of 47.2 kWh/kg at stack level by 2028, which the IEA equates to about 71% on a lower heating value basis.",
            "sourceUrls": [
              "https://www.iea.org/reports/global-hydrogen-review-2026/policy"
            ]
          }
        ]
      }
    ],
    "extraSources": [
      {
        "url": "https://www.iea.org/reports/global-hydrogen-review-2026/investment-and-innovation",
        "title": "Global Hydrogen Review 2026 – Investment and innovation",
        "publisher": "International Energy Agency (IEA)"
      },
      {
        "url": "https://www.iea.org/reports/global-hydrogen-review-2026/policy",
        "title": "Global Hydrogen Review 2026 – Policy",
        "publisher": "International Energy Agency (IEA)"
      }
    ]
  },
  "ins-iea-demand-offtake-2025": {
    "keyFacts": [
      {
        "value": "almost 3%",
        "label": "Growth in global hydrogen demand in 2025",
        "sourceUrl": "https://www.iea.org/reports/global-hydrogen-review-2026/demand"
      },
      {
        "value": "more than 1 Mtpa",
        "label": "Low-emissions hydrogen volumes in procurement tenders, 2025",
        "sourceUrl": "https://www.iea.org/reports/global-hydrogen-review-2026/demand"
      },
      {
        "value": "more than 0.3 Mtpa",
        "label": "Tendered volumes contracted as of Q1 2026",
        "sourceUrl": "https://www.iea.org/reports/global-hydrogen-review-2026/demand"
      },
      {
        "value": "2.5 Mt",
        "label": "Committed low-emissions hydrogen for refineries and industry by 2030",
        "sourceUrl": "https://www.iea.org/reports/global-hydrogen-review-2026/executive-summary"
      },
      {
        "value": "almost 130 000",
        "label": "Global fuel cell electric vehicle stock in 2025, up 20%",
        "sourceUrl": "https://www.iea.org/reports/global-hydrogen-review-2026/demand"
      }
    ],
    "sections": [
      {
        "heading": "Demand still rests on traditional uses",
        "paragraphs": [
          {
            "text": "Global hydrogen demand rose by almost 3% in 2025, with growth coming from traditional sectors. Industry and refining accounted for almost all hydrogen use, while new applications are growing but remain a very small share of the total.",
            "sourceUrls": [
              "https://www.iea.org/reports/global-hydrogen-review-2026/demand",
              "https://www.iea.org/reports/global-hydrogen-review-2026/executive-summary"
            ]
          },
          {
            "text": "The IEA says the conflict in the Middle East makes the near-term outlook for existing applications uncertain, especially fertiliser production and trade. It also finds that slow and uncertain policy implementation is not tackling the main barriers to uptake: high costs, uncertain demand, unclear or complex regulation and missing infrastructure.",
            "sourceUrls": [
              "https://www.iea.org/reports/global-hydrogen-review-2026/demand",
              "https://www.iea.org/reports/global-hydrogen-review-2026/executive-summary"
            ]
          }
        ]
      },
      {
        "heading": "Offtake: volumes flat, few firm commitments",
        "paragraphs": [
          {
            "text": "New offtake agreements for low-emissions hydrogen were at the same level in 2025 as in 2024. The firm share was concentrated in refining, industry and power generation. In 2025, for the first time, agreements oriented towards trade exceeded those for domestic use, which the IEA credits to policies in Japan and Europe.",
            "sourceUrls": [
              "https://www.iea.org/reports/global-hydrogen-review-2026/demand",
              "https://www.iea.org/reports/global-hydrogen-review-2026/executive-summary"
            ]
          },
          {
            "text": "The IEA describes demand as the crucial missing piece and notes that project developers widely cite demand creation as a key barrier to investment. Procurement tenders grew only marginally in 2025 to more than 1 Mtpa, and more than 0.3 Mtpa had been contracted by Q1 2026, mostly in refining and fertilisers on the back of supportive rules in Europe and India.",
            "sourceUrls": [
              "https://www.iea.org/reports/global-hydrogen-review-2026/executive-summary",
              "https://www.iea.org/reports/global-hydrogen-review-2026/demand"
            ]
          }
        ]
      },
      {
        "heading": "Sector outlook to 2030",
        "paragraphs": [
          {
            "text": "Refining and chemicals lead adoption. Based on committed projects, 2.5 Mt of low-emissions hydrogen, equal to 60% of global committed production, is expected to be used in refineries and industrial facilities by 2030. Demand-creation measures are emerging for refining in Europe and for industry mainly in China, though implementation has often been slow.",
            "sourceUrls": [
              "https://www.iea.org/reports/global-hydrogen-review-2026/executive-summary"
            ]
          },
          {
            "text": "Fuel cell electric vehicle stock grew 20% in 2025 to almost 130 000, driven by truck sales in China and a rebound in car sales in Korea; policies in these two countries underpin a projected tripling of stock by 2030. In shipping and aviation, European regulation is the main near-term driver, and in power the IEA sees slow progress concentrated in Japan and Korea.",
            "sourceUrls": [
              "https://www.iea.org/reports/global-hydrogen-review-2026/demand"
            ]
          },
          {
            "text": "Policy signals cited by the IEA include EU Renewable Energy Directive transport targets transposed in 13 member states by early June 2026, creating demand for more than 575 ktpa of low-emissions hydrogen, and six winners selected under Japan's contracts-for-difference scheme by late May 2026, totalling nearly 130 kt.",
            "sourceUrls": [
              "https://www.iea.org/reports/global-hydrogen-review-2026/policy"
            ]
          }
        ]
      }
    ],
    "extraSources": [
      {
        "url": "https://www.iea.org/reports/global-hydrogen-review-2026/demand",
        "title": "Global Hydrogen Review 2026 – Demand",
        "publisher": "International Energy Agency (IEA)"
      },
      {
        "url": "https://www.iea.org/reports/global-hydrogen-review-2026/policy",
        "title": "Global Hydrogen Review 2026 – Policy",
        "publisher": "International Energy Agency (IEA)"
      }
    ]
  },
  "ins-iea-pipeline-2030": {
    "keyFacts": [
      {
        "value": "10 Mt",
        "label": "Reduction in the 2030 project pipeline versus GHR-25",
        "sourceUrl": "https://www.iea.org/reports/global-hydrogen-review-2026/production"
      },
      {
        "value": "4.3 Mt",
        "label": "Committed low-emissions production by 2030, up 3%",
        "sourceUrl": "https://www.iea.org/reports/global-hydrogen-review-2026/production"
      },
      {
        "value": "below 0.8 Mtpa",
        "label": "New FIDs in 2025, after two years near 1 Mtpa",
        "sourceUrl": "https://www.iea.org/reports/global-hydrogen-review-2026/production"
      },
      {
        "value": "> 100 GW",
        "label": "Announced electrolysis at risk without FID before end-2027",
        "sourceUrl": "https://www.iea.org/reports/global-hydrogen-review-2026/production"
      },
      {
        "value": "2 of 66",
        "label": "National strategies on track for 2030 targets (Netherlands, China)",
        "sourceUrl": "https://www.iea.org/reports/global-hydrogen-review-2026/policy"
      }
    ],
    "sections": [
      {
        "heading": "Why the pipeline shrank",
        "paragraphs": [
          {
            "text": "The announced pipeline fell by 10 Mt compared with the previous edition of the review. The IEA attributes the drop to projects now expected to start after 2030, projects temporarily paused and outright cancellations.",
            "sourceUrls": [
              "https://www.iea.org/reports/global-hydrogen-review-2026/production",
              "https://www.iea.org/reports/global-hydrogen-review-2026/executive-summary"
            ]
          },
          {
            "text": "Investment momentum slowed in 2025: new final investment decisions fell below 0.8 Mtpa, after two consecutive years at around 1 Mtpa. Recent Chinese policy could revive investment, but the IEA sees an uncertain outlook elsewhere because of weak demand and regulatory barriers.",
            "sourceUrls": [
              "https://www.iea.org/reports/global-hydrogen-review-2026/production"
            ]
          }
        ]
      },
      {
        "heading": "Committed production and projects at risk",
        "paragraphs": [
          {
            "text": "Committed production rose by 3% to 4.3 Mt by 2030. It could pass 6 Mt if projects with strong potential to operate by 2030 take final investment decisions in 2026 or 2027.",
            "sourceUrls": [
              "https://www.iea.org/reports/global-hydrogen-review-2026/production"
            ]
          },
          {
            "text": "Around 80% of the production with strong potential is aimed at chemicals, refining and low-emissions fuels, which the IEA sees as uses where hydrogen-based fuels could support diversification goals more quickly. Two-thirds of the 22 Mt at risk of missing 2030 is in Europe, North America and Latin America.",
            "sourceUrls": [
              "https://www.iea.org/reports/global-hydrogen-review-2026/executive-summary"
            ]
          },
          {
            "text": "Measured in electrolysis terms, the IEA estimates that more than 100 GW of announced capacity could lose any chance of operating by 2030 unless investment decisions are taken before the end of 2027.",
            "sourceUrls": [
              "https://www.iea.org/reports/global-hydrogen-review-2026/production"
            ]
          }
        ]
      },
      {
        "heading": "Targets and policy response",
        "paragraphs": [
          {
            "text": "The number of national hydrogen strategies has levelled off at 66, and most countries remain behind their targets even when projects with strong potential are counted. Only the Netherlands and China are on track for their 2030 targets, and Chile and the Netherlands have revised targets downwards.",
            "sourceUrls": [
              "https://www.iea.org/reports/global-hydrogen-review-2026/policy"
            ]
          },
          {
            "text": "The IEA recommends that governments review 2030 targets and set long-term ambitions reflecting market realities, keep production support focused on shovel-ready projects able to scale, and speed up demand-creation policy and infrastructure deployment.",
            "sourceUrls": [
              "https://www.iea.org/reports/global-hydrogen-review-2026/executive-summary"
            ]
          }
        ]
      }
    ],
    "extraSources": [
      {
        "url": "https://www.iea.org/reports/global-hydrogen-review-2026/production",
        "title": "Global Hydrogen Review 2026 – Production",
        "publisher": "International Energy Agency (IEA)"
      },
      {
        "url": "https://www.iea.org/reports/global-hydrogen-review-2026/policy",
        "title": "Global Hydrogen Review 2026 – Policy",
        "publisher": "International Energy Agency (IEA)"
      }
    ]
  },
  "ins-iea-investment-2025": {
    "keyFacts": [
      {
        "value": "over 85%",
        "label": "Share of investment aimed at existing uses or hydrogen-based fuels",
        "sourceUrl": "https://www.iea.org/reports/global-hydrogen-review-2026/investment-and-innovation"
      },
      {
        "value": "around USD 3.3 billion",
        "label": "Cumulative international public finance to emerging-economy governments, Q1 2026",
        "sourceUrl": "https://www.iea.org/reports/global-hydrogen-review-2026/investment-and-innovation"
      },
      {
        "value": "around USD 650 million",
        "label": "Cumulative project-level international public finance by Q1 2026",
        "sourceUrl": "https://www.iea.org/reports/global-hydrogen-review-2026/investment-and-innovation"
      },
      {
        "value": "4%",
        "label": "Hydrogen share of energy venture capital in 2025 (13% peak, 2023)",
        "sourceUrl": "https://www.iea.org/reports/global-hydrogen-review-2026/investment-and-innovation"
      },
      {
        "value": "almost USD 80 billion",
        "label": "Market capitalisation added by Bloom Energy over the past year",
        "sourceUrl": "https://www.iea.org/reports/global-hydrogen-review-2026/investment-and-innovation"
      }
    ],
    "sections": [
      {
        "heading": "Where the capital is flowing",
        "paragraphs": [
          {
            "text": "The IEA reports that spending on electrolysis has now overtaken spending on hydrogen produced with carbon capture, utilisation and storage (CCUS). It attributes this to a stronger electrolysis project pipeline, its higher capital intensity and quicker progress at project level.",
            "sourceUrls": [
              "https://www.iea.org/reports/global-hydrogen-review-2026/investment-and-innovation"
            ]
          },
          {
            "text": "China and Europe lead committed electrolysis projects. China is expected to hold more than 60% of committed capacity by 2026 while accounting for 25% of estimated investment, whereas the United States leads on CCUS-based hydrogen projects. Over 85% of investment is directed at existing hydrogen uses in industry and refineries, or at hydrogen-based fuels.",
            "sourceUrls": [
              "https://www.iea.org/reports/global-hydrogen-review-2026/investment-and-innovation"
            ]
          }
        ]
      },
      {
        "heading": "Public finance, venture capital and valuations",
        "paragraphs": [
          {
            "text": "International public finance for low-emissions hydrogen in emerging economies rose from a negligible level in 2022 to around USD 3.3 billion in cumulative commitments to governments by the first quarter of 2026. According to the IEA, this money supports technical assistance, wider policy frameworks and, more recently, enabling infrastructure.",
            "sourceUrls": [
              "https://www.iea.org/reports/global-hydrogen-review-2026/investment-and-innovation"
            ]
          },
          {
            "text": "As projects mature, finance directed at individual projects is becoming more important, reaching around USD 650 million cumulatively by Q1 2026. It is used mainly for project preparation and for lowering financing costs.",
            "sourceUrls": [
              "https://www.iea.org/reports/global-hydrogen-review-2026/investment-and-innovation"
            ]
          },
          {
            "text": "Hydrogen venture capital declined again in 2025, in absolute terms and as a share of energy venture capital, falling to 4% from a peak of 13% in 2023; aviation drew the largest portion, at almost 25%. Company valuations are being pushed to new highs largely by a single firm: Bloom Energy added almost USD 80 billion in market capitalisation over the past year, as AI data-centre power demand and long gas turbine backlogs lifted prospects for its fuel cells, which will initially run on natural gas. Returns more broadly show modest signs of stabilising and recovering.",
            "sourceUrls": [
              "https://www.iea.org/reports/global-hydrogen-review-2026/investment-and-innovation"
            ]
          }
        ]
      },
      {
        "heading": "Investment decisions and technology maturity",
        "paragraphs": [
          {
            "text": "Since the Global Hydrogen Review 2025, roughly 300 ktpa of additional low-emissions production has reached final investment decision, but the IEA notes that investment momentum slowed during 2025. It estimates that 22 Mt of potential production in announced projects could miss any chance of operating by 2030 unless investment decisions are made by early 2027, with two-thirds of it in Europe, North America and Latin America.",
            "sourceUrls": [
              "https://www.iea.org/reports/global-hydrogen-review-2026/executive-summary"
            ]
          },
          {
            "text": "Several hydrogen technologies have moved closer to commercial deployment since 2020, though progress is uneven. High-capture CCUS-based hydrogen production has not yet been demonstrated, and hydrogen use in industry and synthetic hydrocarbons is only now reaching first-of-a-kind projects, more slowly than modular end uses such as transport.",
            "sourceUrls": [
              "https://www.iea.org/reports/global-hydrogen-review-2026/investment-and-innovation"
            ]
          }
        ]
      }
    ],
    "extraSources": [
      {
        "url": "https://www.iea.org/reports/global-hydrogen-review-2026/executive-summary",
        "title": "Global Hydrogen Review 2026 – Executive summary",
        "publisher": "International Energy Agency (IEA)"
      }
    ]
  },
  "ins-iea-trade-2030": {
    "keyFacts": [
      {
        "value": "around 16%",
        "label": "Committed-or-better share across the overall project pipeline (vs <8% trade)",
        "sourceUrl": "https://www.iea.org/reports/global-hydrogen-review-2026/trade-and-infrastructure"
      },
      {
        "value": "over 40 000 km",
        "label": "Announced hydrogen pipelines by 2035; only 9% operational or committed",
        "sourceUrl": "https://www.iea.org/reports/global-hydrogen-review-2026/trade-and-infrastructure"
      },
      {
        "value": "70%",
        "label": "Rise in operational and committed pipeline length since GHR-25",
        "sourceUrl": "https://www.iea.org/reports/global-hydrogen-review-2026/trade-and-infrastructure"
      },
      {
        "value": "11 TWh (335 kt H₂)",
        "label": "Announced underground storage capacity by 2035; just over 7% at FID",
        "sourceUrl": "https://www.iea.org/reports/global-hydrogen-review-2026/trade-and-infrastructure"
      },
      {
        "value": "around 170 and 130",
        "label": "Ammonia and methanol port terminals currently in operation",
        "sourceUrl": "https://www.iea.org/reports/global-hydrogen-review-2026/trade-and-infrastructure"
      }
    ],
    "sections": [
      {
        "heading": "First shipments and contracts",
        "paragraphs": [
          {
            "text": "The share of trade-oriented volumes backed by operating, under-construction or committed projects (under 8%) compares with around 16% for the project pipeline as a whole. Even so, the first shipments of low-emissions hydrogen are under way, allowing logistics and certification approaches to be tested in practice.",
            "sourceUrls": [
              "https://www.iea.org/reports/global-hydrogen-review-2026/trade-and-infrastructure"
            ]
          },
          {
            "text": "Long-term bilateral contracts dominate early trade, especially for ammonia and ammonia-derived fertilisers, while hot briquetted iron (HBI) is becoming more prominent. In 2025, for the first time, trade-oriented offtake agreements outnumbered agreements for domestic use, which the IEA attributes to policies in Japan and Europe.",
            "sourceUrls": [
              "https://www.iea.org/reports/global-hydrogen-review-2026/trade-and-infrastructure",
              "https://www.iea.org/reports/global-hydrogen-review-2026/executive-summary"
            ]
          },
          {
            "text": "The IEA also highlights the exposure of existing trade in hydrogen-based products to the Middle East conflict. The region accounts for over a quarter of global ammonia trade, almost 40% of urea trade and almost 45% of methanol trade, and the closure of the Strait of Hormuz has severely disrupted supply of these products.",
            "sourceUrls": [
              "https://www.iea.org/reports/global-hydrogen-review-2026/executive-summary"
            ]
          }
        ]
      },
      {
        "heading": "Pipelines, storage and port terminals",
        "paragraphs": [
          {
            "text": "Announced hydrogen pipeline projects, counting both new lines and repurposed natural gas pipelines, exceed 40 000 km by 2035, yet only 9% of that length is operating or has committed investment. Activity is concentrated in Europe and China: in 2025 China started building the world's longest hydrogen pipeline and Germany finished the world's longest conversion of a natural gas pipeline to hydrogen.",
            "sourceUrls": [
              "https://www.iea.org/reports/global-hydrogen-review-2026/trade-and-infrastructure"
            ]
          },
          {
            "text": "Announced underground storage could offer 11 TWh (335 kt H₂) of capacity by 2035, but the just over 7% at FID or under construction equals only 0.6% of the estimated throughput of committed low-emissions hydrogen projects. Large-scale salt caverns are being built in the United States, Germany and China.",
            "sourceUrls": [
              "https://www.iea.org/reports/global-hydrogen-review-2026/trade-and-infrastructure"
            ]
          },
          {
            "text": "Around 170 ammonia and 130 methanol port terminals are operating. Ammonia leads among announced terminal projects, but more methanol infrastructure is actually under construction, mostly tied to bunkering, and Japan has begun building the first commercial-scale terminal for liquefied hydrogen imports.",
            "sourceUrls": [
              "https://www.iea.org/reports/global-hydrogen-review-2026/trade-and-infrastructure"
            ]
          }
        ]
      },
      {
        "heading": "Choosing a transport route",
        "paragraphs": [
          {
            "text": "Pipelines are frequently the cheapest way to move pure hydrogen where suitable routes exist and high utilisation can be achieved, while shipping offers flexibility in sourcing and can make use of some existing port infrastructure. Where pure hydrogen is needed at the destination, the IEA puts the energy penalty of shipping at above 10 kWh/kg H₂, equivalent to more than 30% of hydrogen's energy content, because of energy-intensive liquefaction or reconversion steps such as ammonia cracking.",
            "sourceUrls": [
              "https://www.iea.org/reports/global-hydrogen-review-2026/trade-and-infrastructure"
            ]
          }
        ]
      }
    ],
    "extraSources": [
      {
        "url": "https://www.iea.org/reports/global-hydrogen-review-2026/executive-summary",
        "title": "Global Hydrogen Review 2026 – Executive summary",
        "publisher": "International Energy Agency (IEA)"
      }
    ]
  },
  "ins-ehb-pilot-auction-2024": {
    "keyFacts": [
      {
        "value": "€800 million",
        "label": "pilot auction budget, requested more than 15 times over",
        "sourceUrl": "https://ec.europa.eu/commission/presscorner/detail/en/ip_24_2333"
      },
      {
        "value": "119",
        "label": "bids judged eligible and admissible, out of 132 received",
        "sourceUrl": "https://ec.europa.eu/commission/presscorner/detail/en/ip_24_2333"
      },
      {
        "value": "€8–245 million",
        "label": "range of subsidy per selected project",
        "sourceUrl": "https://ec.europa.eu/commission/presscorner/detail/en/ip_24_2333"
      },
      {
        "value": "6 of 7",
        "label": "winning projects that signed grant agreements by October 2024",
        "sourceUrl": "https://climate.ec.europa.eu/news-your-voice/news/winners-first-eu-wide-renewable-hydrogen-auction-sign-grant-agreements-paving-way-new-european-2024-10-07_en"
      },
      {
        "value": "1,442 MWe",
        "label": "combined bid capacity of the six signed projects",
        "sourceUrl": "https://climate.ec.europa.eu/news-your-voice/news/winners-first-eu-wide-renewable-hydrogen-auction-sign-grant-agreements-paving-way-new-european-2024-10-07_en"
      }
    ],
    "sections": [
      {
        "heading": "The seven winning bids",
        "paragraphs": [
          {
            "text": "The Commission's results table names seven winners. In Finland, eNRG Lahti (Nordic Ren-Gas Oy, 90 MWe) bid the lowest price at €0.37/kg. Spain's El Alamillo H2 (Benbros Energy S.L., 60 MWe) followed at €0.38/kg, and Portugal's Grey2Green-II (Petrogal S.A., 200 MWe) at €0.39/kg.",
            "sourceUrls": [
              "https://ec.europa.eu/commission/presscorner/detail/en/ip_24_2333"
            ]
          },
          {
            "text": "The other four winners all bid €0.48/kg: HYSENCIA (Angus, Spain, 35 MWe), SKIGA (Skiga, Norway, 117 MWe), Catalina (Renato Ptx Holdco, Spain, 500 MWe) and MP2X (Madoquapower 2x, Portugal, 500 MWe). MP2X and Catalina had the largest bid volumes, at 511 kt and 480 kt of hydrogen over ten years.",
            "sourceUrls": [
              "https://ec.europa.eu/commission/presscorner/detail/en/ip_24_2333"
            ]
          },
          {
            "text": "The auction was paid for from EU Emissions Trading System revenues. According to the Commission, the hydrogen is intended for sectors including steel, chemicals, maritime transport and fertilisers.",
            "sourceUrls": [
              "https://ec.europa.eu/commission/presscorner/detail/en/ip_24_2333"
            ]
          }
        ]
      },
      {
        "heading": "From award to grant signature",
        "paragraphs": [
          {
            "text": "Grant agreements with CINEA were expected to be signed by November 2024 at the latest. On 7 October 2024, six of the seven projects signed; one chose to withdraw from the grant agreement process. The six signatories listed by DG CLIMA are eNRG Lahti, Grey2Green-II, HYSENCIA, SKIGA, Catalina and MP2X, so El Alamillo H2 is not among them.",
            "sourceUrls": [
              "https://ec.europa.eu/commission/presscorner/detail/en/ip_24_2333",
              "https://climate.ec.europa.eu/news-your-voice/news/winners-first-eu-wide-renewable-hydrogen-auction-sign-grant-agreements-paving-way-new-european-2024-10-07_en"
            ]
          },
          {
            "text": "Total support for the six projects is EUR 694,521,237, paid out over ten years. Individual grants range from EUR 8 million to EUR 245 million, for installations of 35 to 500 MWe. Together, the six bid 1,515 kt of hydrogen and 10,365 kt of CO2 abatement over ten years.",
            "sourceUrls": [
              "https://climate.ec.europa.eu/news-your-voice/news/winners-first-eu-wide-renewable-hydrogen-auction-sign-grant-agreements-paving-way-new-european-2024-10-07_en"
            ]
          },
          {
            "text": "Support takes the form of a fixed premium per kilogram of certified and verified renewable hydrogen, so nothing is paid before production starts. Projects have up to five years from signing to begin producing. The Commission's Hydrogen Bank page now gives the potential output of the signed projects as 1.52 million tonnes over their first ten years.",
            "sourceUrls": [
              "https://climate.ec.europa.eu/news-your-voice/news/winners-first-eu-wide-renewable-hydrogen-auction-sign-grant-agreements-paving-way-new-european-2024-10-07_en",
              "https://energy.ec.europa.eu/topics/eus-energy-system/hydrogen/european-hydrogen-bank_en"
            ]
          }
        ]
      },
      {
        "heading": "National top-up and the next round",
        "paragraphs": [
          {
            "text": "Under the new Auctions-as-a-Service mechanism, Germany provided €350 million for its highest-ranked domestic projects that met the eligibility criteria but did not win EU funding. German authorities were to choose those projects. The Commission said the scheme is open to every Member State and invited others to join future auctions.",
            "sourceUrls": [
              "https://ec.europa.eu/commission/presscorner/detail/en/ip_24_2333"
            ]
          },
          {
            "text": "Learning from the pilot, the Commission planned to launch a second auction by the end of 2024 with a larger budget of EUR 1.2 billion. Its Terms and Conditions were published on 27 September 2024.",
            "sourceUrls": [
              "https://climate.ec.europa.eu/news-your-voice/news/winners-first-eu-wide-renewable-hydrogen-auction-sign-grant-agreements-paving-way-new-european-2024-10-07_en"
            ]
          }
        ]
      }
    ],
    "extraSources": [
      {
        "url": "https://climate.ec.europa.eu/news-your-voice/news/winners-first-eu-wide-renewable-hydrogen-auction-sign-grant-agreements-paving-way-new-european-2024-10-07_en",
        "title": "Winners of first EU-wide renewable hydrogen auction sign grant agreements, paving the way for new European production",
        "publisher": "European Commission – DG CLIMA",
        "publishedAt": "2024-10-07"
      },
      {
        "url": "https://energy.ec.europa.eu/topics/eus-energy-system/hydrogen/european-hydrogen-bank_en",
        "title": "European Hydrogen Bank",
        "publisher": "European Commission – DG Energy"
      }
    ]
  },
  "ins-ehb-second-auction-attrition": {
    "keyFacts": [
      {
        "value": "€1.2 billion",
        "label": "IF24 auction budget, including €200 million for maritime",
        "sourceUrl": "https://climate.ec.europa.eu/eu-action/eu-funding-climate-action/innovation-fund/calls-proposals/if24-auction_en"
      },
      {
        "value": "more than €4.8 billion",
        "label": "support requested by 61 bids from 11 countries",
        "sourceUrl": "https://climate.ec.europa.eu/news-your-voice/news/over-subscribed-european-hydrogen-bank-auction-receives-61-bids-innovation-fund-support-including-8-2025-03-07_en"
      },
      {
        "value": "€992 million",
        "label": "EU support for 15 projects initially selected, May 2025",
        "sourceUrl": "https://ec.europa.eu/commission/presscorner/detail/en/ip_25_1264"
      },
      {
        "value": "€0.33–1.88/kg",
        "label": "bid range of the six projects that signed grants",
        "sourceUrl": "https://climate.ec.europa.eu/eu-action/eu-funding-climate-action/innovation-fund/calls-proposals/if24-auction_en"
      },
      {
        "value": "around 500 kt",
        "label": "expected hydrogen output of signed projects over ten years",
        "sourceUrl": "https://energy.ec.europa.eu/topics/eus-energy-system/hydrogen/european-hydrogen-bank_en"
      }
    ],
    "sections": [
      {
        "heading": "Auction design and bidding",
        "paragraphs": [
          {
            "text": "The IF24 Auction ran from 3 December 2024 to 20 February 2025. It offered €1.2 billion to RFNBO hydrogen producers in the EEA, with a new €200 million pot reserved for projects whose off-takers are in the maritime sector. Bids were checked for admissibility, eligibility and maturity, then ranked purely by price, from lowest to highest.",
            "sourceUrls": [
              "https://climate.ec.europa.eu/eu-action/eu-funding-climate-action/innovation-fund/calls-proposals/if24-auction_en"
            ]
          },
          {
            "text": "The IEA policy database lists further terms: up to EUR 250 million per project, a ceiling of €4/kg, and a ten-year subsidy period. It also records a 25% cap on Chinese electrolyser stacks, 2.5 years to reach financial close and five years to start operating.",
            "sourceUrls": [
              "https://www.iea.org/policies/27897-second-auction-of-european-hydrogen-bank-ehb"
            ]
          },
          {
            "text": "The auction received 61 bids from 11 EEA countries, eight of them in the maritime topic. Together they asked for more than €4.8 billion, four times the budget. Combined, the bids represented around 6.3 GWe of electrolysers and more than 7.3 million tonnes of hydrogen over ten years.",
            "sourceUrls": [
              "https://climate.ec.europa.eu/news-your-voice/news/over-subscribed-european-hydrogen-bank-auction-receives-61-bids-innovation-fund-support-including-8-2025-03-07_en"
            ]
          }
        ]
      },
      {
        "heading": "Initial selection in May 2025",
        "paragraphs": [
          {
            "text": "On 20 May 2025, the Commission selected 15 projects in five countries. They were expected to produce nearly 2.2 million tonnes of renewable hydrogen over ten years and avoid more than 15 million tonnes of CO2. Twelve general-topic projects bid between €0.20 and €0.60/kg. Three maritime projects shared €96.7 million and bid between €0.45 and €1.88/kg.",
            "sourceUrls": [
              "https://ec.europa.eu/commission/presscorner/detail/en/ip_25_1264"
            ]
          },
          {
            "text": "The lowest general-topic bid was Villamartin H2 in Spain (Galena Renovables 6, 252 MWe, €0.20/kg). The largest project by capacity was the Zeevonk electrolyser in the Netherlands (560 MWe, €0.60/kg). Germany had two projects in the selection, KASKADE and H2-Hub Lubmin.",
            "sourceUrls": [
              "https://ec.europa.eu/commission/presscorner/detail/en/ip_25_1264",
              "https://climate.ec.europa.eu/eu-action/eu-funding-climate-action/innovation-fund/calls-proposals/if24-auction_en"
            ]
          },
          {
            "text": "Spain, Lithuania and Austria joined through Auctions-as-a-Service, allocating up to €836 million in national funding. In April 2025, the Commission approved a €400 million Spanish State aid scheme to provide Spain's share.",
            "sourceUrls": [
              "https://ec.europa.eu/commission/presscorner/detail/en/ip_25_1264",
              "https://energy.ec.europa.eu/topics/eus-energy-system/hydrogen/european-hydrogen-bank_en"
            ]
          }
        ]
      },
      {
        "heading": "Attrition during grant preparation",
        "paragraphs": [
          {
            "text": "Within two months of being invited, each project had to give CINEA a signed completion guarantee. Faced with this, several projects reviewed their bids and maturity and decided not to sign. CINEA then invited reserve-list projects, strictly in order of bid price.",
            "sourceUrls": [
              "https://climate.ec.europa.eu/eu-action/eu-funding-climate-action/innovation-fund/calls-proposals/if24-auction_en"
            ]
          },
          {
            "text": "By 16 September 2025, eight of the original 15 were still preparing grant agreements. Ten more general-topic projects had been invited from the reserve list, with bids of €0.33–1.22/kg. Projects that withdrew included Villamartin H2, KASKADE, H2-Hub Lubmin, Zeevonk and the maritime project Gen2-LH2.",
            "sourceUrls": [
              "https://climate.ec.europa.eu/eu-action/eu-funding-climate-action/innovation-fund/calls-proposals/if24-auction_en"
            ]
          },
          {
            "text": "The six that signed on 20 January 2026 were four general-topic projects and two maritime ones. The general-topic signatories are Kristinestad PtX (Koppö Energia Oy, Finland, 200 MWe, €0.33/kg), H2CRI (Spain, 30 MWe, €0.44/kg), NOON (Iberdrola Clientes, Spain, 120 MWe, €0.84/kg) and GH2Move-VLC (Spain, 5 MWe, €0.85/kg). The maritime signatories are RjukanH2 (Norwegian Hydrogen AS, 18.75 MWe, €0.45/kg) and HammerfestH2 (Green H AS, 7.5 MWe, €1.88/kg). Individual grants range from €1.8 million to €135.5 million.",
            "sourceUrls": [
              "https://climate.ec.europa.eu/eu-action/eu-funding-climate-action/innovation-fund/calls-proposals/if24-auction_en"
            ]
          }
        ]
      }
    ],
    "extraSources": [
      {
        "url": "https://ec.europa.eu/commission/presscorner/detail/en/ip_25_1264",
        "title": "Nearly €1 billion awarded to boost development of renewable hydrogen (IP/25/1264)",
        "publisher": "European Commission",
        "publishedAt": "2025-05-20"
      },
      {
        "url": "https://climate.ec.europa.eu/eu-action/eu-funding-climate-action/innovation-fund/calls-proposals/if24-auction_en",
        "title": "IF24 Auction",
        "publisher": "European Commission – DG CLIMA"
      },
      {
        "url": "https://climate.ec.europa.eu/news-your-voice/news/over-subscribed-european-hydrogen-bank-auction-receives-61-bids-innovation-fund-support-including-8-2025-03-07_en",
        "title": "Over-subscribed European Hydrogen Bank auction receives 61 bids for Innovation Fund support, including 8 maritime projects",
        "publisher": "European Commission – DG CLIMA",
        "publishedAt": "2025-03-07"
      }
    ]
  },
  "ins-ehb-third-auction-2026": {
    "keyFacts": [
      {
        "value": "€8.4 billion",
        "label": "Innovation Fund support requested by the 58 bids",
        "sourceUrl": "https://climate.ec.europa.eu/news-other-reads/news/innovation-fund-2025-auctions-attract-almost-eu10-billion-bids-european-industry-decarbonisation-2026-03-20_en"
      },
      {
        "value": "4.3 GWe",
        "label": "total electrolyser capacity across all submitted bids",
        "sourceUrl": "https://climate.ec.europa.eu/news-other-reads/news/innovation-fund-2025-auctions-attract-almost-eu10-billion-bids-european-industry-decarbonisation-2026-03-20_en"
      },
      {
        "value": "€600m / €400m / €300m",
        "label": "budgets for RFNBO, RFNBO/low-carbon and maritime-aviation topics",
        "sourceUrl": "https://climate.ec.europa.eu/eu-action/eu-funding-climate-action/innovation-fund/calls-proposals/if25-hydrogen-auction_en"
      },
      {
        "value": "13",
        "label": "projects invited to grant preparation after June 2026 additions",
        "sourceUrl": "https://climate.ec.europa.eu/eu-action/eu-funding-climate-action/innovation-fund/calls-proposals/if25-hydrogen-auction_en"
      },
      {
        "value": "€1.3 billion",
        "label": "German Auctions-as-a-Service funding for RFNBO hydrogen (up to)",
        "sourceUrl": "https://ec.europa.eu/commission/presscorner/detail/en/ip_26_1004"
      }
    ],
    "sections": [
      {
        "heading": "Design: three topics and low-carbon eligibility",
        "paragraphs": [
          {
            "text": "The IF25 Hydrogen Auction opened in December 2025 with €1.3 billion from EU ETS allowance auctioning. It was the first round to accept electrolytic low-carbon hydrogen, such as hydrogen made with nuclear power, as well as RFNBO hydrogen. It also added a topic for suppliers to maritime or aviation off-takers.",
            "sourceUrls": [
              "https://climate.ec.europa.eu/eu-action/eu-funding-climate-action/innovation-fund/calls-proposals/if25-hydrogen-auction_en",
              "https://climate.ec.europa.eu/news-other-reads/news/innovation-fund-2025-auctions-attract-almost-eu10-billion-bids-european-industry-decarbonisation-2026-03-20_en"
            ]
          },
          {
            "text": "The budget was divided into €600 million for RFNBO production, €400 million for RFNBO and/or electrolytic low-carbon production, and €300 million for supply to maritime or aviation users. Winners receive a fixed premium on certified, verified output for up to ten years.",
            "sourceUrls": [
              "https://climate.ec.europa.eu/eu-action/eu-funding-climate-action/innovation-fund/calls-proposals/if25-hydrogen-auction_en"
            ]
          },
          {
            "text": "Eligible bids that passed the quality checks were ranked by price and funded from the cheapest upwards until the budget was used up. Winners must reach financial close within two and a half years of signing and start operating within five years, backed by a completion guarantee.",
            "sourceUrls": [
              "https://ec.europa.eu/commission/presscorner/detail/en/ip_26_1004"
            ]
          }
        ]
      },
      {
        "heading": "Bids and the nine May 2026 winners",
        "paragraphs": [
          {
            "text": "Bidding closed on 19 February 2026 with 58 bids; one, from outside the EEA, was ruled inadmissible. The RFNBO topic attracted 50 bids requesting more than €7.3 billion. The RFNBO and low-carbon topic drew five bids for more than €800 million, and the maritime-aviation topic three bids for €163 million.",
            "sourceUrls": [
              "https://climate.ec.europa.eu/eu-action/eu-funding-climate-action/innovation-fund/calls-proposals/if25-hydrogen-auction_en",
              "https://climate.ec.europa.eu/news-other-reads/news/innovation-fund-2025-auctions-attract-almost-eu10-billion-bids-european-industry-decarbonisation-2026-03-20_en"
            ]
          },
          {
            "text": "The five RFNBO general-topic winners are AN-1-B (Hellenic Hydrogen, Greece, 25 MWe, €0.57/kg), T2X (Spain, 9 MWe, €0.62/kg), NJK (MorGen, Denmark, 300 MWe, €0.95/kg), ALBA (Hy2gen Nordic, Denmark, 100 MWe, €0.97/kg) and Hy4IND (Wiener Wasserstoff, Austria, 5 MWe, €0.98/kg).",
            "sourceUrls": [
              "https://ec.europa.eu/commission/presscorner/detail/en/ip_26_1004"
            ]
          },
          {
            "text": "Finland's Cloudberry (Vetyalfa Oy) was the largest winner, with 500 MWe at €0.44/kg in the low-carbon topic. Germany's Lotse won the same topic with 120 MWe at €1.10/kg. Both maritime-aviation winners are in Norway: Gen2-LH2 (Gen2 Energy, 12 MWe, €3.48/kg) and RogalandH2 (Green H, 12.5 MWe, €3.49/kg). The Commission estimates the nine projects will avoid 9 million tonnes of CO2 equivalent.",
            "sourceUrls": [
              "https://ec.europa.eu/commission/presscorner/detail/en/ip_26_1004"
            ]
          }
        ]
      },
      {
        "heading": "National funding, reserve list and next steps",
        "paragraphs": [
          {
            "text": "Under Auctions-as-a-Service, Germany will provide up to €1.3 billion for RFNBO hydrogen and Spain up to €440 million. Reserve-list projects within these national budgets can move to national authorities for grant preparation, and this option was to be offered to three projects in Spain and three in Denmark.",
            "sourceUrls": [
              "https://ec.europa.eu/commission/presscorner/detail/en/ip_26_1004"
            ]
          },
          {
            "text": "In June 2026, after eligible reserve projects had moved to Member States, the Innovation Fund used leftover money to invite four more reserve-list projects. They are H2Rheinfelden1 (RWE Generation, Germany, 30 MWe, €1.09/kg), NGHV (Reganazaré, Portugal, 5 MWe, €1.19/kg), and Cartagena H2Green and Villarnedo H2Green (Spain, 21 MWe each, €1.48/kg). Together they will receive €147.73 million for 77 MW and 111,000 tonnes of hydrogen over ten years. Grants for all 13 projects now cover more than 95% of the budget.",
            "sourceUrls": [
              "https://climate.ec.europa.eu/eu-action/eu-funding-climate-action/innovation-fund/calls-proposals/if25-hydrogen-auction_en"
            ]
          },
          {
            "text": "The Commission's Hydrogen Bank page now gives totals of 13 projects in 8 EEA countries, worth over €1.2 billion. These are expected to produce over 1.4 million tonnes of hydrogen and avoid about 11 million tonnes of CO2 equivalent. CINEA is expected to sign the grant agreements between September and November 2026.",
            "sourceUrls": [
              "https://energy.ec.europa.eu/topics/eus-energy-system/hydrogen/european-hydrogen-bank_en",
              "https://climate.ec.europa.eu/eu-action/eu-funding-climate-action/innovation-fund/calls-proposals/if25-hydrogen-auction_en"
            ]
          }
        ]
      }
    ],
    "extraSources": [
      {
        "url": "https://climate.ec.europa.eu/news-other-reads/news/innovation-fund-2025-auctions-attract-almost-eu10-billion-bids-european-industry-decarbonisation-2026-03-20_en",
        "title": "Innovation Fund 2025 auctions attract almost €10 billion of bids from European industry for decarbonisation support",
        "publisher": "European Commission – DG CLIMA",
        "publishedAt": "2026-03-20"
      },
      {
        "url": "https://energy.ec.europa.eu/topics/eus-energy-system/hydrogen/european-hydrogen-bank_en",
        "title": "European Hydrogen Bank",
        "publisher": "European Commission – DG Energy"
      }
    ]
  },
  "ins-eho-lcoh-2024": {
    "keyFacts": [
      {
        "value": "4.3–10.5 €/kg H2",
        "label": "Country range, renewable-connected electrolysis LCOH, 2024",
        "sourceUrl": "https://observatory.clean-hydrogen.europa.eu/sites/default/files/2025-11/The%20European%20hydrogen%20market%20landscape_November%202025.pdf"
      },
      {
        "value": "6.4 €/kg H2",
        "label": "Median renewable-connected LCOH across European countries, 2024",
        "sourceUrl": "https://observatory.clean-hydrogen.europa.eu/sites/default/files/2025-11/The%20European%20hydrogen%20market%20landscape_November%202025.pdf"
      },
      {
        "value": "57.4%",
        "label": "CAPEX share of average renewable hydrogen production cost",
        "sourceUrl": "https://observatory.clean-hydrogen.europa.eu/sites/default/files/2025-11/The%20European%20hydrogen%20market%20landscape_November%202025.pdf"
      },
      {
        "value": "4.1–16.1 €/kg H2",
        "label": "Country range, grid-connected electrolysis LCOH, 2024",
        "sourceUrl": "https://observatory.clean-hydrogen.europa.eu/sites/default/files/2025-11/The%20European%20hydrogen%20market%20landscape_November%202025.pdf"
      },
      {
        "value": "2.3–4.5 €/kg",
        "label": "Break-even clean hydrogen price for oil refining, 2024",
        "sourceUrl": "https://observatory.clean-hydrogen.europa.eu/sites/default/files/2025-11/The%20European%20hydrogen%20market%20landscape_November%202025.pdf"
      }
    ],
    "sections": [
      {
        "heading": "What drives each production route",
        "paragraphs": [
          {
            "text": "For renewable-connected electrolysis, capital costs are the biggest component at 57.4% of the 2024 average, with marginal costs making up the other 42.6%; electricity alone accounts for roughly 39.1%. The CAPEX share was described as nearly unchanged from 2023. The report attributes the renewable route's cost advantage over grid electrolysis to avoided grid fees and taxes, as the average electricity cost per kilogram (2.62 €/kg H2) was almost the same for both routes despite the lower capacity factor of a directly connected electrolyser.",
            "sourceUrls": [
              "https://observatory.clean-hydrogen.europa.eu/sites/default/files/2025-11/The%20European%20hydrogen%20market%20landscape_November%202025.pdf"
            ]
          },
          {
            "text": "For grid-connected electrolysis, marginal costs (wholesale electricity, other OPEX, grid fees and taxes) represented 62.8% of the total (4.65 €/kg H2) and CAPEX 37.2% (2.76 €/kg H2). For SMR, marginal costs made up 92.2% (3.07 €/kg H2), with natural gas at approximately 75% of the total, CO2 costs at 15%, CAPEX at 8% and other OPEX at 3%. Excluding amortisation and other fixed costs, SMR marginal production costs in 2024 were put at around 3.1 €/kg H2.",
            "sourceUrls": [
              "https://observatory.clean-hydrogen.europa.eu/sites/default/files/2025-11/The%20European%20hydrogen%20market%20landscape_November%202025.pdf"
            ]
          },
          {
            "text": "With carbon capture, marginal costs make up about 90% of the SMR+CC total, mostly natural gas (approximately 65%), while CAPEX accounts for 10%. Adding capture raised the average cost by 0.79 €/kg H2 across all countries. The analysis is based on Hydrogen Europe research reflecting the end of 2024, using assumptions updated annually and checked with industry stakeholders.",
            "sourceUrls": [
              "https://observatory.clean-hydrogen.europa.eu/sites/default/files/2025-11/The%20European%20hydrogen%20market%20landscape_November%202025.pdf"
            ]
          }
        ]
      },
      {
        "heading": "Spread between countries",
        "paragraphs": [
          {
            "text": "Renewable-connected electrolysis costs were highest in Luxembourg at 9.43 €/kg H2, followed by Hungary (9.06 €/kg) and Belgium (8.97 €/kg H2). Norway and Ireland were the cheapest, both at 4.33 €/kg H2. CAPEX was the largest cost item in every country.",
            "sourceUrls": [
              "https://observatory.clean-hydrogen.europa.eu/sites/default/files/2025-11/The%20European%20hydrogen%20market%20landscape_November%202025.pdf"
            ]
          },
          {
            "text": "Grid-connected electrolysis varied more widely: Cyprus was highest at 16.06 €/kg H2, ahead of Poland (11.24), Italy (9.77) and the United Kingdom (9.52), while Sweden (4.19) and Finland (4.10) were lowest; the median was 7.1 €/kg H2. For SMR, Luxembourg (4.59 €/kg H2), Sweden (4.50) and Slovakia (4.20) were the most expensive, and eight countries including Portugal, France, the Netherlands and Spain stayed below 3.00 €/kg H2.",
            "sourceUrls": [
              "https://observatory.clean-hydrogen.europa.eu/sites/default/files/2025-11/The%20European%20hydrogen%20market%20landscape_November%202025.pdf"
            ]
          },
          {
            "text": "The Observatory's cost-of-production data page publishes country-level LCOH split into CAPEX and OPEX for 2022, 2023 and 2024 as downloadable spreadsheets. Inputs cited include ENTSO-E wholesale power prices, JRC ENSPRESO capacity factors, IRENA renewable cost data, Clean Hydrogen JU electrolyser parameters, IEA and BloombergNEF electrolysis CAPEX estimates, and Eurostat 2024 energy prices; countries with short-term measures capping industrial power prices may show negative taxes.",
            "sourceUrls": [
              "https://observatory.clean-hydrogen.europa.eu/hydrogen-landscape/production-trade-and-cost/cost-hydrogen-production"
            ]
          }
        ]
      },
      {
        "heading": "Three-year trend and break-even prices",
        "paragraphs": [
          {
            "text": "The Observatory's headline series shows renewable-connected LCOH at 6.86 €/kg in 2022 and 6.61 €/kg in 2023, while SMR fell from 6.23 to 3.76 and then 3.33 €/kg, and SMR with capture from 6.38 to 4.41 and then 4.12 €/kg. Grid electrolysis was 7.94 €/kg in 2023. The report notes that in 2022, during the energy crisis, renewable hydrogen was nearly comparable in cost to SMR, but the gap has since widened as fossil hydrogen costs dropped sharply.",
            "sourceUrls": [
              "https://observatory.clean-hydrogen.europa.eu/",
              "https://observatory.clean-hydrogen.europa.eu/sites/default/files/2025-11/The%20European%20hydrogen%20market%20landscape_November%202025.pdf"
            ]
          },
          {
            "text": "Based on 2024 prices, clean hydrogen would compete with SMR-based hydrogen in oil refining at a delivered price of 2.3–4.5 €/kg depending on the country, down from 2.7–5.6 €/kg in 2023. Break-even levels were 1.1–2.2 €/kg for maritime uses and 2.4–4.4 €/kg for heavy-duty trucks, with updated 2025 truck estimates at 2.3–4.8 €/kg. The report links the lower thresholds to cheaper natural gas, coal and oil in 2024.",
            "sourceUrls": [
              "https://observatory.clean-hydrogen.europa.eu/sites/default/files/2025-11/The%20European%20hydrogen%20market%20landscape_November%202025.pdf"
            ]
          }
        ]
      }
    ],
    "extraSources": [
      {
        "url": "https://observatory.clean-hydrogen.europa.eu/hydrogen-landscape/production-trade-and-cost/cost-hydrogen-production",
        "title": "Cost of hydrogen production",
        "publisher": "European Hydrogen Observatory (Clean Hydrogen Partnership)"
      }
    ]
  },
  "ins-eho-electrolyser-capex-2024": {
    "keyFacts": [
      {
        "value": "693 €/kW",
        "label": "Other utilities CAPEX, same for alkaline and PEM, 2024",
        "sourceUrl": "https://observatory.clean-hydrogen.europa.eu/sites/default/files/2025-11/The%20European%20hydrogen%20market%20landscape_November%202025.pdf"
      },
      {
        "value": "601 €/kW",
        "label": "Other CAPEX (land, grid fees, permitting, etc.), both technologies, 2024",
        "sourceUrl": "https://observatory.clean-hydrogen.europa.eu/sites/default/files/2025-11/The%20European%20hydrogen%20market%20landscape_November%202025.pdf"
      },
      {
        "value": "100 MWel",
        "label": "Reference project size behind the cost estimates",
        "sourceUrl": "https://observatory.clean-hydrogen.europa.eu/sites/default/files/2025-11/The%20European%20hydrogen%20market%20landscape_November%202025.pdf"
      },
      {
        "value": "1,666 €/kW (alkaline) / 1,970 €/kW (PEM)",
        "label": "2023 total CAPEX in the previous (November 2024) edition",
        "sourceUrl": "https://observatory.clean-hydrogen.europa.eu/sites/default/files/2024-11/The%20European%20hydrogen%20market%20landscape_November%202024.pdf"
      },
      {
        "value": "43 / 64 €/kW/year",
        "label": "2023 OPEX, alkaline / PEM, previous edition",
        "sourceUrl": "https://observatory.clean-hydrogen.europa.eu/sites/default/files/2024-11/The%20European%20hydrogen%20market%20landscape_November%202024.pdf"
      }
    ],
    "sections": [
      {
        "heading": "How the estimates are built",
        "paragraphs": [
          {
            "text": "The electrolyser system costs were gathered through interviews with developers of electrolytic projects and from other industry sources. They are meant to represent a 100 MWel electrolyser facility that is under construction or otherwise at an advanced stage, located in Europe.",
            "sourceUrls": [
              "https://observatory.clean-hydrogen.europa.eu/sites/default/files/2025-11/The%20European%20hydrogen%20market%20landscape_November%202025.pdf"
            ]
          },
          {
            "text": "OPEX is reported as one annual figure that covers every expense except electricity, including water, insurance, maintenance and stack replacement. CAPEX is split into four blocks: stack, balance of plant, other utilities and other CAPEX.",
            "sourceUrls": [
              "https://observatory.clean-hydrogen.europa.eu/sites/default/files/2025-11/The%20European%20hydrogen%20market%20landscape_November%202025.pdf"
            ]
          }
        ]
      },
      {
        "heading": "Inside the CAPEX breakdown",
        "paragraphs": [
          {
            "text": "Alkaline systems break down into 323 €/kW for the stack, 693 €/kW for balance of plant, 693 €/kW for other utilities and 601 €/kW for other CAPEX. PEM systems comprise 563 €/kW for the stack, 647 €/kW for balance of plant, and the same 693 €/kW and 601 €/kW for other utilities and other CAPEX, so the two technologies differ only in stack and balance-of-plant costs.",
            "sourceUrls": [
              "https://observatory.clean-hydrogen.europa.eu/sites/default/files/2025-11/The%20European%20hydrogen%20market%20landscape_November%202025.pdf"
            ]
          },
          {
            "text": "The stack category covers the electrolysis cells and their components. Balance of plant includes the rectifier and its transformer, gas/liquid separation, water or lye feed, gas and water purification, cooling, control systems and equipment such as gas containers and compressors. Other utilities cover high-voltage transformers, water treatment, cooling, any hydrogen compression, control systems and related engineering and installation, while other CAPEX covers land and grid fees, insurance, permitting, feasibility studies, contingency and EPC management.",
            "sourceUrls": [
              "https://observatory.clean-hydrogen.europa.eu/sites/default/files/2025-11/The%20European%20hydrogen%20market%20landscape_November%202025.pdf"
            ]
          }
        ]
      },
      {
        "heading": "Comparison with the previous edition",
        "paragraphs": [
          {
            "text": "The Observatory's November 2024 report gave 2023 values of 1,666 €/kW CAPEX and 43 €/kW/year OPEX for alkaline electrolysers, and 1,970 €/kW CAPEX and 64 €/kW/year OPEX for PEM. That edition used three CAPEX categories instead of four: stack, balance of plant and other engineering, procurement and construction (EPC) costs.",
            "sourceUrls": [
              "https://observatory.clean-hydrogen.europa.eu/sites/default/files/2024-11/The%20European%20hydrogen%20market%20landscape_November%202024.pdf"
            ]
          },
          {
            "text": "In the 2023 split, alkaline systems were 408 €/kW for the stack, 686 €/kW for balance of plant and 572 €/kW for other EPC, while PEM systems were 732 €/kW, 464 €/kW and 774 €/kW respectively. Because the categories changed between editions, the component figures are not directly comparable year on year.",
            "sourceUrls": [
              "https://observatory.clean-hydrogen.europa.eu/sites/default/files/2024-11/The%20European%20hydrogen%20market%20landscape_November%202024.pdf"
            ]
          }
        ]
      }
    ],
    "extraSources": [
      {
        "url": "https://observatory.clean-hydrogen.europa.eu/sites/default/files/2024-11/The%20European%20hydrogen%20market%20landscape_November%202024.pdf",
        "title": "The European hydrogen market landscape – November 2024",
        "publisher": "European Hydrogen Observatory (Clean Hydrogen Partnership)",
        "publishedAt": "2024-11"
      }
    ]
  },
  "ins-eho-manufacturing-2025": {
    "keyFacts": [
      {
        "value": "15.2 GW/year",
        "label": "Expected capacity by 2026 from FID/under-construction projects",
        "sourceUrl": "https://observatory.clean-hydrogen.europa.eu/sites/default/files/2025-11/The%20European%20hydrogen%20market%20landscape_November%202025.pdf"
      },
      {
        "value": "7.52 GW/year (≈52%)",
        "label": "PEM share of operational manufacturing capacity, end-2025",
        "sourceUrl": "https://observatory.clean-hydrogen.europa.eu/sites/default/files/2025-11/The%20European%20hydrogen%20market%20landscape_November%202025.pdf"
      },
      {
        "value": "5.58 GW/year (39%)",
        "label": "Alkaline share of operational manufacturing capacity, end-2025",
        "sourceUrl": "https://observatory.clean-hydrogen.europa.eu/sites/default/files/2025-11/The%20European%20hydrogen%20market%20landscape_November%202025.pdf"
      },
      {
        "value": "93.2 MW (66%)",
        "label": "PEM share of 2024 European-manufacturer deployments",
        "sourceUrl": "https://observatory.clean-hydrogen.europa.eu/sites/default/files/2025-11/The%20European%20hydrogen%20market%20landscape_November%202025.pdf"
      },
      {
        "value": "3.11 GW",
        "label": "Electrolyser manufacturing capacity by May 2023",
        "sourceUrl": "https://observatory.clean-hydrogen.europa.eu/"
      }
    ],
    "sections": [
      {
        "heading": "Technology mix",
        "paragraphs": [
          {
            "text": "By the end of 2025, PEM is expected to account for roughly 52% of operational water-electrolyser manufacturing capacity in Europe (7.52 GW/year), alkaline for 39% (5.58 GW/year), and solid oxide and AEM together for a little over 9% (1.34 GW/year).",
            "sourceUrls": [
              "https://observatory.clean-hydrogen.europa.eu/sites/default/files/2025-11/The%20European%20hydrogen%20market%20landscape_November%202025.pdf"
            ]
          },
          {
            "text": "If all announced expansions materialise in 2026, PEM capacity would stay at 7.52 GW/year but fall to 49% of the total, alkaline would rise to 41% (6.18 GW/year), and solid oxide and AEM would reach 7% and 3% (1.01 and 0.53 GW/year). The report describes this as a significant gain for technologies that currently hold a marginal share.",
            "sourceUrls": [
              "https://observatory.clean-hydrogen.europa.eu/sites/default/files/2025-11/The%20European%20hydrogen%20market%20landscape_November%202025.pdf"
            ]
          }
        ]
      },
      {
        "heading": "Growth path and outlook",
        "paragraphs": [
          {
            "text": "The Observatory's headline series shows manufacturing capacity of 3.11 GW by May 2023, 5.40 GW by May 2024 and 10.60 GW by May 2025. Of the 14.4 GW/year expected for 2025, 3.8 GW was still planned rather than operational as of May 2025, and projects already under construction or with a final investment decision would lift the total to 15.2 GW/year in 2026.",
            "sourceUrls": [
              "https://observatory.clean-hydrogen.europa.eu/",
              "https://observatory.clean-hydrogen.europa.eu/sites/default/files/2025-11/The%20European%20hydrogen%20market%20landscape_November%202025.pdf"
            ]
          },
          {
            "text": "The figures cover factories in the EU27, EFTA and UK, were compiled by Hydrogen Europe from public sources and checked with companies where appropriate. They represent maximum annual manufacturing capacity, not actual or expected production. For comparison, the previous edition had expected 8.8 GW/year by end-2024 and 10.5 GW/year by 2026, with operational capacity up 2.29 GW/year in the year to May 2024.",
            "sourceUrls": [
              "https://observatory.clean-hydrogen.europa.eu/sites/default/files/2025-11/The%20European%20hydrogen%20market%20landscape_November%202025.pdf",
              "https://observatory.clean-hydrogen.europa.eu/sites/default/files/2024-11/The%20European%20hydrogen%20market%20landscape_November%202024.pdf"
            ]
          }
        ]
      },
      {
        "heading": "What was actually installed",
        "paragraphs": [
          {
            "text": "Deployments by European manufacturers in the EU27, EFTA and UK rose by 118% in 2024 compared with 2023. PEM made up 66% (93.2 MW) and alkaline roughly 24% (34.2 MW), with a further 14.6 MW from projects where the technology was not identified. The Observatory's headline series records 61.87 MW in 2022 and 64.97 MW in 2023.",
            "sourceUrls": [
              "https://observatory.clean-hydrogen.europa.eu/sites/default/files/2025-11/The%20European%20hydrogen%20market%20landscape_November%202025.pdf",
              "https://observatory.clean-hydrogen.europa.eu/"
            ]
          },
          {
            "text": "The report's conclusions set this against domestic demand for equipment: 94 electrolysis projects were under construction at end-2024, expected to add 2,840 MW once operational by 2028, a pipeline the report says European manufacturers could supply.",
            "sourceUrls": [
              "https://observatory.clean-hydrogen.europa.eu/sites/default/files/2025-11/The%20European%20hydrogen%20market%20landscape_November%202025.pdf"
            ]
          }
        ]
      }
    ],
    "extraSources": [
      {
        "url": "https://observatory.clean-hydrogen.europa.eu/sites/default/files/2024-11/The%20European%20hydrogen%20market%20landscape_November%202024.pdf",
        "title": "The European hydrogen market landscape – November 2024",
        "publisher": "European Hydrogen Observatory (Clean Hydrogen Partnership)",
        "publishedAt": "2024-11"
      },
      {
        "url": "https://observatory.clean-hydrogen.europa.eu/hydrogen-landscape/technology-manufacturing/electrolyser-manufacturing-capacity",
        "title": "Electrolyser manufacturing capacity",
        "publisher": "European Hydrogen Observatory (Clean Hydrogen Partnership)"
      }
    ]
  },
  "ins-acer-monitoring-2025": {
    "keyFacts": [
      {
        "value": "1.8 GW",
        "label": "EU electrolyser capacity under construction, due 2026–2027",
        "sourceUrl": "https://www.acer.europa.eu/sites/default/files/documents/Publications/ACER-2025-European-hydrogen-markets.pdf"
      },
      {
        "value": "just over 2 EUR/kg",
        "label": "average cost of conventional hydrogen from natural gas",
        "sourceUrl": "https://www.acer.europa.eu/sites/default/files/documents/Publications/ACER-2025-European-hydrogen-markets.pdf"
      },
      {
        "value": "7 GW",
        "label": "possible EU electrolyser capacity in 2030 at ~50% annual growth",
        "sourceUrl": "https://www.acer.europa.eu/sites/default/files/documents/Publications/ACER-2025-European-hydrogen-markets.pdf"
      },
      {
        "value": "2 Member States",
        "label": "had transposed the amended Renewable Energy Directive (Denmark, Ireland)",
        "sourceUrl": "https://www.acer.europa.eu/sites/default/files/documents/Publications/ACER-2025-European-hydrogen-markets.pdf"
      },
      {
        "value": "more than €20 billion",
        "label": "allocated by the European Commission to hydrogen",
        "sourceUrl": "https://www.acer.europa.eu/news/hydrogen-progress-hampered-high-costs-and-slow-transposition"
      }
    ],
    "sections": [
      {
        "heading": "Demand and deployment",
        "paragraphs": [
          {
            "text": "EU hydrogen consumption edged down to 7.4 million tonnes in 2024, mainly because demand from the chemicals sector has fallen 12% since 2022. Novel uses such as mobility, industrial heat and e-fuels remain very small at about 270,000 tonnes, although they grew 9% in 2024, with mobility up 35% year on year. Steam methane reforming still accounts for 89% of production capacity.",
            "sourceUrls": [
              "https://www.acer.europa.eu/sites/default/files/documents/Publications/ACER-2025-European-hydrogen-markets.pdf"
            ]
          },
          {
            "text": "Some 104 MW of new electrolyser capacity began operating in 2024, with more than 70% of it in Germany (46 MW), Denmark (18 MW) and Hungary (11 MW). Output of electrolytic hydrogen rose from 19,000 tonnes in 2023 to 29,000 tonnes in 2024. Most plants are small: only six exceed 10 MW, yet these represent around a third of installed capacity.",
            "sourceUrls": [
              "https://www.acer.europa.eu/sites/default/files/documents/Publications/ACER-2025-European-hydrogen-markets.pdf"
            ]
          },
          {
            "text": "Projects under construction for commissioning in 2026 and 2027 total 1.8 GW, led by Sweden (742 MW) and Germany (414 MW), while Spain has only 25 MW under construction. Operational plus under-construction capacity comes to just 2.3 GW by 2027; at the current growth rate of around 50% a year, ACER calculates about 7 GW by 2030, able to produce roughly 510,000 tonnes of renewable hydrogen. Counting every project with a planned start by 2030, the pipeline reaches 62 GW, in line with Member States' combined 48–54 GW targets.",
            "sourceUrls": [
              "https://www.acer.europa.eu/sites/default/files/documents/Publications/ACER-2025-European-hydrogen-markets.pdf"
            ]
          }
        ]
      },
      {
        "heading": "Cost benchmarks and drivers",
        "paragraphs": [
          {
            "text": "Using S&P Global estimates for January to October 2025, ACER puts conventional reformer hydrogen at a little above 2 EUR/kg and reformer hydrogen with carbon capture at 2.8 EUR/kg, before CO2 transport and storage. RFNBO-compliant hydrogen averaged around 8 EUR/kg but ranged from 7 to 10 EUR/kg depending on the country. The EEX HYDRIX index averaged approximately 8.2 EUR/kg in 2025, while the Iberian IBHYX index hovered around 6 EUR/kg.",
            "sourceUrls": [
              "https://www.acer.europa.eu/sites/default/files/documents/Publications/ACER-2025-European-hydrogen-markets.pdf"
            ]
          },
          {
            "text": "Carbon prices are unlikely to close the gap on their own: EU allowance prices moved between roughly 60 and 85 EUR per tonne of CO2 in 2025, while a cited Ariadne study puts parity at 300–500 EUR/tCO2. On nuclear-based hydrogen, electricity at 80 EUR/MWh would leave the cost slightly above 7 EUR/kg even at 8,000 operating hours, whereas 30 EUR/MWh from largely depreciated plants could bring it to around 4.5 EUR/kg.",
            "sourceUrls": [
              "https://www.acer.europa.eu/sites/default/files/documents/Publications/ACER-2025-European-hydrogen-markets.pdf"
            ]
          },
          {
            "text": "Early hydrogen network tariffs appear to be a fraction of the total delivered cost: Germany's core-network ramp-up tariff is 25 EUR/kWh/h/y, the Netherlands' uniform tariff is 21.13 EUR/kWh/h/y and Denmark expects around 22.5 EUR/kWh/h/y. ACER notes, however, that these sit at the lower end of literature transport-cost estimates, and the Dutch regulator has warned its tariff could rise more than tenfold without measures such as state-backed cost allocation.",
            "sourceUrls": [
              "https://www.acer.europa.eu/sites/default/files/documents/Publications/ACER-2025-European-hydrogen-markets.pdf"
            ]
          }
        ]
      },
      {
        "heading": "Funding and ACER's recommendations",
        "paragraphs": [
          {
            "text": "The European Hydrogen Bank's second auction, with a EUR 1.2 billion budget, drew 61 bids covering 6.3 GW and was more than four times oversubscribed; 36 bids came from Spain. Fifteen projects were initially chosen to receive EUR 992 million, but between August and September 2025 seven of them, totalling 1.8 GW, withdrew. Across all bids, the reported levelised cost averaged 7.1 EUR/kg, ranging from 3.1 EUR/kg in Spain to 19.8 EUR/kg in Austria.",
            "sourceUrls": [
              "https://www.acer.europa.eu/sites/default/files/documents/Publications/ACER-2025-European-hydrogen-markets.pdf"
            ]
          },
          {
            "text": "ACER urges faster transposition of the amended Renewable Energy Directive, prompt implementation of the 2024 hydrogen and gas decarbonisation package, and funding targeted at hard-to-abate sectors ready to switch. It also calls for quicker permitting and grid connection, faster power-sector decarbonisation, rethought grid tariffs and market flexibility, a careful risk assessment of methane-based low-carbon hydrogen, and network build-out matched to actual demand to avoid stranded assets.",
            "sourceUrls": [
              "https://www.acer.europa.eu/news/hydrogen-progress-hampered-high-costs-and-slow-transposition",
              "https://www.acer.europa.eu/monitoring/European-hydrogen-markets-2025"
            ]
          }
        ]
      }
    ],
    "extraSources": [
      {
        "url": "https://www.acer.europa.eu/sites/default/files/documents/Publications/ACER-2025-European-hydrogen-markets.pdf",
        "title": "European hydrogen markets – 2025 Monitoring Report (PDF)",
        "publisher": "ACER",
        "publishedAt": "2025-12-02"
      },
      {
        "url": "https://www.acer.europa.eu/sites/default/files/documents/Publications_annex/2025-Hydrogen-monitoring-Infographic.pdf",
        "title": "2025 Monitoring Report – European hydrogen markets: infographic (PDF)",
        "publisher": "ACER",
        "publishedAt": "2025-12-02"
      }
    ]
  },
  "ins-eca-sr-2024-11": {
    "keyFacts": [
      {
        "value": "up to 140 GW",
        "label": "electrolyser input capacity the 10 Mt target may require",
        "sourceUrl": "https://www.eca.europa.eu/ECAPublications/SR-2024-11/SR-2024-11_EN.pdf"
      },
      {
        "value": "around 2.7 Mt",
        "label": "2030 output of advanced-stage renewable hydrogen projects in Europe",
        "sourceUrl": "https://www.eca.europa.eu/ECAPublications/SR-2024-11/SR-2024-11_EN.pdf"
      },
      {
        "value": "46–50 GW",
        "label": "sum of electrolyser targets in draft national energy and climate plans",
        "sourceUrl": "https://www.eca.europa.eu/ECAPublications/SR-2024-11/SR-2024-11_EN.pdf"
      },
      {
        "value": "around 72%",
        "label": "share of EU hydrogen funding from the Recovery and Resilience Facility",
        "sourceUrl": "https://www.eca.europa.eu/ECAPublications/SR-2024-11/SR-2024-11_EN.pdf"
      },
      {
        "value": "close to 80%",
        "label": "of planned electrolyser capacity sits in five member states",
        "sourceUrl": "https://www.eca.europa.eu/ECAPublications/SR-2024-11/SR-2024-11_EN.pdf"
      }
    ],
    "sections": [
      {
        "heading": "How the targets were set",
        "paragraphs": [
          {
            "text": "The auditors found the Commission fixed its renewable hydrogen targets without robust prior analysis, and that the targets were neither split into binding national targets nor matched by aligned national goals. Definitions were unclear: it was not specified whether the GW figures refer to electricity input or hydrogen output, and different Commission documents estimated that 40 GW would yield anywhere from 4.4 Mt to 6.6 Mt of hydrogen.",
            "sourceUrls": [
              "https://www.eca.europa.eu/ECAPublications/SR-2024-11/SR-2024-11_EN.pdf"
            ]
          },
          {
            "text": "According to the report, the original 10 Mt production goal was largely derived from existing EU consumption of fossil-based hydrogen (8–10 Mt in 2020), and the 40 GW electrolyser figure had been promoted in an industry paper known as the '2x40 GW Initiative'. The auditors also noted that the demand expected from the 2023 laws setting renewable fuel quotas in industry and transport would not reach even 10 Mt by 2030, with cited estimates of 3.8 Mt (IEA) and 5.6 Mt (Commission).",
            "sourceUrls": [
              "https://www.eca.europa.eu/ECAPublications/SR-2024-11/SR-2024-11_EN.pdf"
            ]
          }
        ]
      },
      {
        "heading": "A slow start for projects",
        "paragraphs": [
          {
            "text": "Based on IEA project data as of October 2023, the ECA judged that the 10 Mt target, which may need up to 140 GW of electrolyser input capacity, is unlikely to be met. Hydrogen Europe data showed that all advanced-stage renewable hydrogen projects in Europe would produce around 2.7 Mt by 2030. Because final investment decisions take roughly 3–5 years and construction another 3–5 years, projects meant to run in 2030 would need to decide between 2025 and 2027 at the latest.",
            "sourceUrls": [
              "https://www.eca.europa.eu/ECAPublications/SR-2024-11/SR-2024-11_EN.pdf"
            ]
          },
          {
            "text": "Developers cited the late definition of renewable hydrogen (settled by the delegated act in June 2023), missing standards and certification, difficulty securing buyers, and inflation as reasons for deferring decisions. At national level, the electrolyser targets in hydrogen strategies summed to 34–39 GW across 13 member states, and those in draft national energy and climate plans to 46–50 GW across 16; only Germany set import targets. Close to 80% of planned capacity is concentrated in Denmark, Germany, Spain, France and the Netherlands.",
            "sourceUrls": [
              "https://www.eca.europa.eu/ECAPublications/SR-2024-11/SR-2024-11_EN.pdf"
            ]
          }
        ]
      },
      {
        "heading": "Funding picture and recommendations",
        "paragraphs": [
          {
            "text": "Of the estimated EU funding for hydrogen-related projects, around 72% comes from the Recovery and Resilience Facility (EUR 13,628 million allocated as at end-2023). Other sources listed include Innovation Fund projects (EUR 2,202 million committed), the Hydrogen Bank (EUR 800 million), the Clean Hydrogen Joint Undertaking under Horizon Europe (EUR 1,200 million), InvestEU (EUR 799 million) and the Connecting Europe Facility for transport (EUR 250 million). The auditors also found the Commission's investment-need estimates inconsistent, observing that estimates for Germany's core hydrogen network alone stand at EUR 19.8 billion.",
            "sourceUrls": [
              "https://www.eca.europa.eu/ECAPublications/SR-2024-11/SR-2024-11_EN.pdf"
            ]
          },
          {
            "text": "The ECA made five recommendations: after a reality check, update the Hydrogen Strategy and make the REPowerEU targets ambitious but realistic (by end-2025); publish an EU roadmap with a progress scoreboard (by mid-2026); gather reliable national funding data and assess EU funding arrangements (by end-2025); monitor national permitting (by end-2025); and set up a one-stop shop for project developers while deciding the future of the Clean Hydrogen Alliance (by mid-2025). The report was adopted by Chamber II in Luxembourg on 5 June 2024.",
            "sourceUrls": [
              "https://www.eca.europa.eu/ECAPublications/SR-2024-11/SR-2024-11_EN.pdf"
            ]
          }
        ]
      }
    ]
  },
  "ins-bnef-clean-h2-cost-2025": {
    "keyFacts": [
      {
        "value": "up to 16 million metric tons",
        "label": "annual clean hydrogen production capacity BNEF forecasts by 2030",
        "sourceUrl": "https://about.bnef.com/blog/five-energy-transition-lessons-for-2025/"
      },
      {
        "value": "double",
        "label": "H2Global green ammonia imports versus gray ammonia in western Europe",
        "sourceUrl": "https://about.bnef.com/blog/five-energy-transition-lessons-for-2025/"
      },
      {
        "value": "by 2050",
        "label": "very few places where clean hydrogen expected to match gray",
        "sourceUrl": "https://about.bnef.com/blog/five-energy-transition-lessons-for-2025/"
      },
      {
        "value": "around 200 million metric tons per annum",
        "label": "CCS capacity BNEF expects installed by 2030",
        "sourceUrl": "https://about.bnef.com/blog/five-energy-transition-lessons-for-2025/"
      }
    ],
    "sections": [
      {
        "heading": "Costs moving the wrong way",
        "paragraphs": [
          {
            "text": "The hydrogen figures appear under the piece's fourth lesson, which argues that the transition only succeeds if clean investments earn risk-adjusted returns that satisfy companies and investors, and that public or concessional money cannot carry the task alone. BNEF singles out hydrogen as a sector where costs are rising rather than falling.",
            "sourceUrls": [
              "https://about.bnef.com/blog/five-energy-transition-lessons-for-2025/"
            ]
          },
          {
            "text": "As further evidence, the article points to an ammonia auction held the previous year by Germany's H2Global Foundation, which priced imported green ammonia at double the price of gray ammonia in western Europe. BNEF adds that it now expects clean hydrogen to compete with gray hydrogen in very few places worldwide by 2050.",
            "sourceUrls": [
              "https://about.bnef.com/blog/five-energy-transition-lessons-for-2025/"
            ]
          }
        ]
      },
      {
        "heading": "What it means for policy",
        "paragraphs": [
          {
            "text": "Because industrial users and producers must commit to investments spanning decades, BNEF says their returns will depend for the foreseeable future on regulation such as carbon pricing and on subsidy. It argues that governments intent on expanding hydrogen use in fertilisers, chemicals and steel need long-term incentives, regulation and demand-side policy in place, citing benefits for both emissions and energy security.",
            "sourceUrls": [
              "https://about.bnef.com/blog/five-energy-transition-lessons-for-2025/"
            ]
          },
          {
            "text": "In its discussion of geo-economic competition, the article notes that several large Asian economies built their steel industries on cheap coal and may never become cost-competitive hydrogen producers. A move from coal-based to hydrogen-based steelmaking could therefore permanently shift their position in the global industry.",
            "sourceUrls": [
              "https://about.bnef.com/blog/five-energy-transition-lessons-for-2025/"
            ]
          }
        ]
      },
      {
        "heading": "Growth despite a tough year",
        "paragraphs": [
          {
            "text": "The author, BNEF Deputy CEO Albert Cheung, lists limited progress on hydrogen and industrial decarbonisation among the reasons for unease going into 2025. Even so, the piece says clean hydrogen and carbon capture and storage, though they had a harder year, are still set to grow: BNEF forecasts as much as 16 million metric tons of annual clean hydrogen production capacity by 2030, up from almost nothing, and around 200 million metric tons per annum of CCS capacity.",
            "sourceUrls": [
              "https://about.bnef.com/blog/five-energy-transition-lessons-for-2025/"
            ]
          }
        ]
      }
    ]
  }
};
