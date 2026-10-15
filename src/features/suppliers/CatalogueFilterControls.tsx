"use client";

import type { EquipmentCategory } from "@/domain/types";
import { Chip, SelectField } from "@/components/ui/Fields";
import { FilterSection } from "@/components/ui/FilterBar";
import { EQUIPMENT_CATEGORY } from "@/lib/labels";
import { type CatalogueFilters, PRICE_OPTIONS, type PriceFilter } from "./model";

export interface FilterControlProps {
  filters: CatalogueFilters;
  onChange: (next: CatalogueFilters) => void;
  /** Categories present in the dataset, in display order. */
  categories: EquipmentCategory[];
  categoryCounts: Partial<Record<EquipmentCategory, number>>;
  countries: { value: string; label: string }[];
  countLabel: string;
}

/** Country + price availability + category chips, rendered inside the FilterBar drawer. */
export function CatalogueFilterControls({ filters, onChange, categories, categoryCounts, countries, countLabel }: FilterControlProps) {
  const toggleCategory = (c: EquipmentCategory) =>
    onChange({ ...filters, categories: filters.categories.includes(c) ? filters.categories.filter((x) => x !== c) : [...filters.categories, c] });

  return (
    <div className="space-y-5">
      <SelectField
        label="Manufacturer country"
        value={filters.country}
        onChange={(e) => onChange({ ...filters, country: e.target.value })}
        options={[{ value: "", label: "All countries" }, ...countries]}
      />
      <SelectField
        label="Price availability"
        value={filters.price}
        onChange={(e) => onChange({ ...filters, price: e.target.value as PriceFilter })}
        options={PRICE_OPTIONS}
      />
      <FilterSection label="Category">
        <div role="group" aria-label={`Equipment category — counts show ${countLabel}`} className="flex flex-wrap gap-1.5">
          <Chip active={filters.categories.length === 0} onClick={() => onChange({ ...filters, categories: [] })}>
            All categories
          </Chip>
          {categories.map((c) => (
            <Chip key={c} active={filters.categories.includes(c)} onClick={() => toggleCategory(c)} count={categoryCounts[c] ?? 0}>
              {EQUIPMENT_CATEGORY[c]}
            </Chip>
          ))}
        </div>
      </FilterSection>
    </div>
  );
}
