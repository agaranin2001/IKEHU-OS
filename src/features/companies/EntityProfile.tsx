/** Company / investor profile body. Server-safe: no hooks, no client state. */
import { Estimate, isEstimated } from "@/components/ui/Estimate";
import { ArrowUpRight, Factory, Globe } from "lucide-react";
import Link from "next/link";
import { PageBody, PageHeader } from "@/components/app/AppShell";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { Panel } from "@/components/ui/Panel";
import { ProvenanceBlock, SourceLink } from "@/components/ui/Sources";
import { EmptyState } from "@/components/ui/States";
import { VerificationPill } from "@/components/ui/StatusPill";
import type { Company, Investor, PublicDeal } from "@/domain/types";
import { fmtDate, fmtMoney, hostOf } from "@/lib/format";
import { COMPANY_CATEGORY, INVESTOR_TYPE } from "@/lib/labels";
import { lookupName, sortByYear, type EntityRef } from "./model";
import { DealAmount, DealKindBadge, EntityLink, FactList, orMissing, TagList } from "./parts";

type Props =
  | { kind: "company"; record: Company; nameIndex: Map<string, EntityRef>; supplierHref?: string }
  | { kind: "investor"; record: Investor; nameIndex: Map<string, EntityRef>; supplierHref?: undefined };

export function EntityProfile(props: Props) {
  const { kind, record, nameIndex } = props;
  const isCompany = kind === "company";
  const deals = isCompany ? record.deals : record.publicInvestments;
  const website = isCompany ? record.website : record.officialUrl;

  return (
    <>
      <PageHeader
        title={record.name}
        description={record.headquarters}
        meta={
          <>
            {isCompany ? (
              record.categories.map((c) => (
                <Badge key={c} tone="violet">
                  {COMPANY_CATEGORY[c]}
                </Badge>
              ))
            ) : (
              <Badge tone="violet">{INVESTOR_TYPE[record.type]}</Badge>
            )}
            <VerificationPill status={record.verification} />
            <span className="text-xs text-muted">Last verified {fmtDate(record.verifiedAt)}</span>
          </>
        }
        actions={
          <>
            <ButtonLink href={isCompany ? "/app/companies" : "/app/companies?tab=investors"} variant="secondary" size="md">
              {isCompany ? "All companies" : "All investors"}
            </ButtonLink>
            {isCompany && (
              <ButtonLink href={`/app/companies?tab=diligence&company=${encodeURIComponent(record.id)}`} variant="secondary" size="md">
                Preliminary DD
              </ButtonLink>
            )}
          </>
        }
      />
      <PageBody>
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="min-w-0 space-y-5">
            <Panel title="Overview">
              <p className="text-[15px] leading-relaxed text-ink-2">{record.description}</p>
              {isCompany ? (
                <div className="mt-5">
                  <h3 className="mb-2 text-xs font-medium text-muted">Technology focus</h3>
                  <TagList tags={record.technologyFocus} />
                </div>
              ) : (
                <div className="mt-5 grid gap-5 sm:grid-cols-2">
                  <div>
                    <h3 className="mb-2 text-xs font-medium text-muted">Investment focus</h3>
                    <TagList tags={record.investmentFocus} />
                  </div>
                  <div>
                    <h3 className="mb-2 text-xs font-medium text-muted">Geography</h3>
                    <TagList tags={record.geography} />
                  </div>
                  <div className="sm:col-span-2">
                    <h3 className="mb-2 text-xs font-medium text-muted">Stages</h3>
                    <TagList tags={record.stages} />
                  </div>
                </div>
              )}
            </Panel>

            <Panel
              title={isCompany ? "Documented deals & partnerships" : "Documented hydrogen investments"}
              subtitle={`${deals.length} with a public source · newest first`}
            >
              {deals.length === 0 ? (
                <EmptyState title="No documented deals" body="No deal for this record has a public source yet. Undocumented deals are never inferred." />
              ) : (
                <DealTimeline deals={deals} self={record.id} nameIndex={nameIndex} />
              )}
            </Panel>
          </div>

          <aside className="min-w-0 space-y-4">
            <Panel title="Key facts">
              <FactList
                facts={
                  isCompany
                    ? [
                        { label: "Headquarters", value: `${record.headquarters}${record.countryName && record.headquarters !== record.countryName ? `, ${record.countryName}` : ""}` },
                        { label: "Ownership", value: orMissing(record.ownership) },
                        { label: "Founded", value: <Estimate on={isEstimated(record, "founded")}>{orMissing(record.founded)}</Estimate> },
                        { label: "Documented deals", value: <span className="num">{record.deals.length}</span> },
                        { label: "Website", value: <ExternalLink url={website} /> },
                      ]
                    : [
                        { label: "Type", value: INVESTOR_TYPE[record.type] },
                        { label: "Headquarters", value: record.headquarters },
                        ...(record.fundSize
                          ? [
                              {
                                label: "Fund / programme size",
                                value: (
                                  <span className="num">
                                    {fmtMoney(record.fundSize)}
                                    {record.fundSize.scope && <span className="block text-xs text-muted">{record.fundSize.scope}</span>}
                                  </span>
                                ),
                              },
                            ]
                          : []),
                        { label: "Documented investments", value: <span className="num">{record.publicInvestments.length}</span> },
                        { label: "Official site", value: <ExternalLink url={website} /> },
                      ]
                }
              />
            </Panel>

            {props.kind === "company" && props.record.supplierId && props.supplierHref && (
              <Link
                href={props.supplierHref}
                className="group flex items-start gap-3 rounded-card border border-line-2 bg-paper p-4 shadow-card transition-colors hover:border-sage"
              >
                <Factory className="mt-0.5 size-5 shrink-0 text-forest" aria-hidden />
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium text-ink group-hover:text-forest">View in supplier catalogue</span>
                  <span className="block text-xs text-muted">Products, vendor-claimed specifications and quotation options</span>
                </span>
                <ArrowUpRight className="size-4 shrink-0 text-faint group-hover:text-forest" aria-hidden />
              </Link>
            )}

            <ProvenanceBlock record={record} />
          </aside>
        </div>
      </PageBody>
    </>
  );
}

function ExternalLink({ url }: { url: string }) {
  if (!url) return <span className="text-faint">Not listed</span>;
  return (
    <a href={url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-forest hover:underline">
      <Globe className="size-3.5" aria-hidden /> {hostOf(url)}
    </a>
  );
}

export function DealTimeline({ deals, self, nameIndex }: { deals: PublicDeal[]; self: string; nameIndex: Map<string, EntityRef> }) {
  return (
    <ol className="relative ml-1 space-y-6 border-l border-line pl-6">
      {sortByYear(deals).map((d) => {
        const cp = lookupName(nameIndex, d.counterparty);
        return (
          <li key={d.id} className="relative">
            <span aria-hidden className="absolute top-1.5 -left-[29px] size-2.5 rounded-full border-2 border-paper bg-forest ring-1 ring-forest/30" />
            <div className="flex flex-wrap items-center gap-2">
              <span className="num text-sm font-semibold text-ink">{d.year}</span>
              <DealKindBadge kind={d.kind} />
              <span className="text-sm text-ink-2">
                with {cp && cp.id !== self ? <EntityLink entity={cp} /> : <span className="text-ink">{d.counterparty}</span>}
              </span>
            </div>
            <p className="mt-1.5 text-sm leading-relaxed text-ink-2">{d.description}</p>
            <div className="mt-2 flex flex-wrap items-start gap-x-6 gap-y-1">
              <div className="text-sm">
                <span className="mr-1.5 text-xs text-muted">Amount</span>
                <DealAmount amount={d.amount} estimated={isEstimated(d, "amount")} className="inline-block align-top" />
              </div>
            </div>
            <SourceLink source={d.source} className="mt-1" />
          </li>
        );
      })}
    </ol>
  );
}
