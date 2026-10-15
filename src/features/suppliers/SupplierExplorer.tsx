"use client";

import { Loader2 } from "lucide-react";
import { useCallback, useDeferredValue, useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { FilterBar } from "@/components/ui/FilterBar";
import { Segmented } from "@/components/ui/Fields";
import { EmptyState, ResourceView, Skeleton } from "@/components/ui/States";
import type { EquipmentCategory, TechnologySupplier } from "@/domain/types";
import { useResource } from "@/hooks/useResource";
import { filterProducts, filterSuppliers } from "@/lib/filters";
import { EQUIPMENT_CATEGORY } from "@/lib/labels";
import { services } from "@/services";
import { CatalogueFilterControls } from "./CatalogueFilterControls";
import { CompareDrawer, CompareTray } from "./Compare";
import { ManufacturerGrid, SupplierProfileDrawer } from "./Manufacturers";
import { ProductCards } from "./ProductList";
import { QuoteRequestDrawer } from "./QuoteRequestDrawer";
import { type CatalogueFilters, type CatalogueProduct, EMPTY_FILTERS, MAX_COMPARE, activeFilterCount, countBy, toQuery } from "./model";

type Tab = "catalogue" | "manufacturers";

const CATEGORY_ORDER = Object.keys(EQUIPMENT_CATEGORY) as EquipmentCategory[];

function GridSkeleton() {
  return (
    <div role="status" aria-label="Loading" className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }, (_, i) => (
        <Skeleton key={i} className="h-64 rounded-card" />
      ))}
    </div>
  );
}

export function SupplierExplorer({ initialSupplierId }: { initialSupplierId?: string } = {}) {
  const [tab, setTab] = useState<Tab>("catalogue");
  const [filters, setFilters] = useState<CatalogueFilters>(EMPTY_FILTERS);
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [compareOpen, setCompareOpen] = useState(false);
  const [profileId, setProfileId] = useState<string | null>(initialSupplierId ?? null);
  const [rfq, setRfq] = useState<{ key: number; productIds: string[] } | null>(null);

  const search = useDeferredValue(filters.search);
  const query = useMemo(() => toQuery(filters, search), [filters, search]);
  const qKey = JSON.stringify(query);

  // Full datasets back the facet counts, the compare tray and profiles.
  const allProducts = useResource("suppliers:products:all", () => services.suppliers.products());
  const allSuppliers = useResource("suppliers:list:all", () => services.suppliers.list());
  const products = useResource(`suppliers:products:${qKey}`, () => services.suppliers.products(query));
  const suppliers = useResource(`suppliers:list:${qKey}`, () => services.suppliers.list(query));

  const productById = useMemo(() => new Map((allProducts.data ?? []).map((p) => [p.id, p])), [allProducts.data]);
  const compareProducts = compareIds.map((id) => productById.get(id)).filter((p): p is CatalogueProduct => !!p);
  const canAddMore = compareIds.length < MAX_COMPARE;

  const countries = useMemo(() => {
    const m = new Map<string, string>();
    for (const s of allSuppliers.data ?? []) m.set(s.country, s.countryName);
    return [...m].map(([value, label]) => ({ value, label })).sort((a, b) => a.label.localeCompare(b.label));
  }, [allSuppliers.data]);

  // Counts reflect every active filter except category itself.
  const { categories, categoryCounts } = useMemo(() => {
    const withoutCategory = { ...query, categories: undefined };
    const present = new Set((allProducts.data ?? []).map((p) => p.category));
    for (const s of allSuppliers.data ?? []) s.categories.forEach((c) => present.add(c));
    const counts =
      tab === "catalogue"
        ? countBy(filterProducts(allProducts.data ?? [], withoutCategory), (p) => p.category)
        : countBy(filterSuppliers(allSuppliers.data ?? [], withoutCategory), (s) => s.categories);
    return { categories: CATEGORY_ORDER.filter((c) => present.has(c)), categoryCounts: counts };
  }, [allProducts.data, allSuppliers.data, query, tab]);

  // Stable close handlers: Drawer re-runs its focus effect when onClose changes.
  const closeCompare = useCallback(() => setCompareOpen(false), []);
  const closeProfile = useCallback(() => {
    setProfileId(null);
    // Drop the deep-link param so a reload doesn't reopen the profile.
    const url = new URL(window.location.href);
    if (url.searchParams.has("supplier")) {
      url.searchParams.delete("supplier");
      window.history.replaceState(null, "", url);
    }
  }, []);
  const closeRfq = useCallback(() => setRfq(null), []);

  const toggleCompare = useCallback((id: string, checked: boolean) => {
    setCompareIds((ids) => (checked ? (ids.includes(id) || ids.length >= MAX_COMPARE ? ids : [...ids, id]) : ids.filter((x) => x !== id)));
  }, []);
  const removeCompare = (id: string) => {
    const next = compareIds.filter((x) => x !== id);
    setCompareIds(next);
    if (next.length === 0) setCompareOpen(false);
  };

  const openQuote = (productIds: string[]) => {
    if (!productIds.length) return;
    // Close other overlays so only one dialog owns focus and scroll lock.
    setProfileId(null);
    setCompareOpen(false);
    setRfq({ key: Date.now(), productIds });
  };

  const rfqProducts = (rfq?.productIds ?? []).map((id) => productById.get(id)).filter((p): p is CatalogueProduct => !!p);
  const profile: TechnologySupplier | null = (profileId && allSuppliers.data?.find((s) => s.id === profileId)) || null;

  const active = activeFilterCount(filters);
  const resource = tab === "catalogue" ? products : suppliers;
  const resultCount = resource.data?.length;
  const reset = () => setFilters(EMPTY_FILTERS);
  const filtersDirty = active > 0 || filters.search.trim() !== "";


  const emptyState = (
    <EmptyState
      title={tab === "catalogue" ? "No products match these filters" : "No manufacturers match these filters"}
      body="Try a broader search, another country or clear the category filter."
      action={
        filtersDirty ? (
          <Button variant="secondary" size="sm" onClick={reset}>
            Clear all filters
          </Button>
        ) : undefined
      }
    />
  );

  return (
    <div>
      {/* Toolbar */}
      <Segmented<Tab>
        label="Explorer view"
        value={tab}
        onChange={setTab}
        options={[
          { value: "catalogue", label: "Equipment catalogue" },
          { value: "manufacturers", label: "Manufacturers" },
        ]}
      />

      <FilterBar
        className="mt-4"
        search={filters.search}
        onSearch={(v) => setFilters((f) => ({ ...f, search: v }))}
        placeholder={tab === "catalogue" ? "Search model, manufacturer…" : "Search manufacturer, product…"}
        searchLabel={tab === "catalogue" ? "Search products" : "Search manufacturers"}
        activeCount={active}
        onClear={reset}
        clearDisabled={!filtersDirty}
        showLabel={`Show ${resultCount ?? "…"} result${resultCount === 1 ? "" : "s"}`}
      >
        <CatalogueFilterControls
          filters={filters}
          onChange={setFilters}
          categories={categories}
          categoryCounts={categoryCounts}
          countries={countries}
          countLabel={tab === "catalogue" ? "matching products" : "matching manufacturers"}
        />
      </FilterBar>

      {/* Result meta */}
      <div className="mt-5 mb-3 flex flex-wrap items-center justify-between gap-3">
        <p className="flex items-center gap-2 text-sm text-muted" aria-live="polite">
          {resultCount == null ? (
            "Loading…"
          ) : (
            <>
              <span className="num font-medium text-ink">{resultCount}</span>
              {tab === "catalogue" ? `product${resultCount === 1 ? "" : "s"}` : `manufacturer${resultCount === 1 ? "" : "s"}`}
              {filtersDirty && (
                <button type="button" onClick={reset} className="text-forest underline-offset-2 hover:underline">
                  Clear filters
                </button>
              )}
            </>
          )}
          {resource.isFetching && resource.data && (
            <span className="inline-flex items-center gap-1 text-xs text-faint">
              <Loader2 className="size-3 animate-spin" aria-hidden /> Updating…
            </span>
          )}
        </p>
      </div>

      {tab === "catalogue" ? (
        <ResourceView resource={products} isEmpty={(d) => d.length === 0} empty={emptyState} loading={<GridSkeleton />}>
          {(list) => (
            <ProductCards
              products={list}
              compareIds={compareIds}
              canAddMore={canAddMore}
              onToggleCompare={toggleCompare}
              onRequestQuote={(p) => openQuote([p.id])}
              onOpenSupplier={setProfileId}
            />
          )}
        </ResourceView>
      ) : (
        <ResourceView resource={suppliers} isEmpty={(d) => d.length === 0} empty={emptyState} loading={<GridSkeleton />}>
          {(list) => <ManufacturerGrid suppliers={list} onOpen={setProfileId} />}
        </ResourceView>
      )}

      <p className="mt-4 text-[11px] text-faint">
        Specifications are manufacturer claims unless stated. Prices are shown only where a public source discloses them; all other products require a
        quotation.
      </p>

      <CompareTray
        products={compareProducts}
        onRemove={removeCompare}
        onClear={() => setCompareIds([])}
        onCompare={() => setCompareOpen(true)}
        onRequestQuote={() => openQuote(compareIds)}
      />

      <CompareDrawer
        open={compareOpen && compareProducts.length > 0}
        products={compareProducts}
        onClose={closeCompare}
        onRemove={removeCompare}
        onRequestQuote={() => openQuote(compareIds)}
      />

      <SupplierProfileDrawer
        supplier={profile}
        onClose={closeProfile}
        compareIds={compareIds}
        canAddMore={canAddMore}
        onToggleCompare={toggleCompare}
        onRequestQuote={openQuote}
      />

      {rfq && rfqProducts.length > 0 && <QuoteRequestDrawer key={rfq.key} products={rfqProducts} onClose={closeRfq} />}
    </div>
  );
}
