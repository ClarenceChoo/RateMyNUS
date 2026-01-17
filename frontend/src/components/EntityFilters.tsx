import Button from "@/components/ui/Button";
import type { EntityType, Zone, SortOption, EntityFilters as Filters } from "@/types";
import { zones, sortOptions } from "@/data/seedCategories";

type Props = {
  type: EntityType;
  filters: Filters;
  onChange: (filters: Filters) => void;
};

export default function EntityFilters({ type, filters, onChange }: Props) {
  const update = (partial: Partial<Filters>) => {
    onChange({ ...filters, ...partial });
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Sort Dropdown */}
      <select
        value={filters.sort ?? "TOP_RATED"}
        onChange={(e) => update({ sort: e.target.value as SortOption })}
        className="rounded-xl border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-200"
      >
        {sortOptions.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      {/* Zone Filter */}
      <select
        value={filters.zone ?? ""}
        onChange={(e) => update({ zone: (e.target.value || undefined) as Zone | undefined })}
        className="rounded-xl border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-200"
      >
        <option value="">All Zones</option>
        {zones.map((z) => (
          <option key={z.value} value={z.value}>
            {z.label}
          </option>
        ))}
      </select>

      {/* Toilet-specific: Has Shower */}
      {type === "TOILET" && (
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={filters.hasShower ?? false}
            onChange={(e) => update({ hasShower: e.target.checked || undefined })}
            className="rounded"
          />
          Has shower
        </label>
      )}

      {/* Clear Filters */}
      {(filters.zone || filters.hasShower || filters.search) && (
        <Button
          variant="ghost"
          onClick={() => onChange({ sort: filters.sort })}
          className="text-xs"
        >
          Clear filters
        </Button>
      )}
    </div>
  );
}
