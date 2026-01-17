import { useEffect, useState, useCallback, useRef } from "react";
import { Link, useParams } from "react-router-dom";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import EntityFilters from "@/components/EntityFilters";
import { listEntities } from "@/features/entities/entityService";
import { getCategoryByType } from "@/data/seedCategories";
import type { Entity, EntityType, EntityFilters as Filters } from "@/types";

export default function Category() {
  const { type: rawType } = useParams<{ type: string }>();
  const type = rawType?.toUpperCase() as EntityType;
  const category = getCategoryByType(type);

  const [entities, setEntities] = useState<Entity[]>([]);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<Filters>({ sort: "TOP_RATED" });
  const [searchInput, setSearchInput] = useState("");
  const pageRef = useRef(1);

  const load = useCallback(async (pageNum: number, append: boolean = false) => {
    setLoading(true);
    try {
      const result = await listEntities({
        type,
        filters: { ...filters, search: searchInput || undefined },
        page: pageNum,
        pageSize: 12,
      });
      
      if (append) {
        setEntities((prev) => [...prev, ...result.items]);
      } else {
        setEntities(result.items);
      }
      setTotal(result.total);
      setHasMore(result.hasMore);
      pageRef.current = pageNum;
    } finally {
      setLoading(false);
    }
  }, [type, filters, searchInput]);

  // Reload when filters change
  useEffect(() => {
    load(1, false);
  }, [type, filters]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      load(1, false);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  function loadMore() {
    if (hasMore && !loading) {
      load(pageRef.current + 1, true);
    }
  }

  if (!category) {
    return (
      <div className="text-center">
        <h1 className="text-2xl font-bold">Category not found</h1>
        <Link to="/" className="mt-4 text-blue-600 hover:underline">
          Go back home
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <span className="text-4xl">{category.icon}</span>
        <div>
          <h1 className="text-2xl font-bold">{category.label}</h1>
          <p className="text-zinc-500">{category.desc}</p>
        </div>
      </div>

      {/* Search + Filters */}
      <div className="space-y-3">
        <Input
          type="text"
          placeholder={`Search ${category.label.toLowerCase()}...`}
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="max-w-md"
        />
        <EntityFilters type={type} filters={filters} onChange={setFilters} />
      </div>

      {/* Results Count */}
      {entities.length > 0 && (
        <div className="text-sm text-zinc-500">
          Showing {entities.length} of {total} results
        </div>
      )}

      {/* Entity Grid */}
      {loading && entities.length === 0 ? (
        <div className="text-zinc-500">Loading...</div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            {entities.map((entity) => (
              <Link key={entity.id} to={`/entity/${entity.id}`} className="flex">
                <Card className="group flex h-full w-full cursor-pointer flex-col transition hover:border-zinc-300 hover:shadow-sm" style={{ height: "220px" }}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1 pr-2">
                      <div className="font-semibold group-hover:text-zinc-700">
                        {entity.name}
                      </div>
                      <div className="line-clamp-4 text-sm text-zinc-500">
                        {entity.subtitle}
                      </div>
                    </div>
                    <div className="shrink-0 text-right">
                      {entity.avgRating ? (
                        <>
                          <div className="font-medium text-yellow-600">
                            {entity.avgRating.toFixed(1)} ★
                          </div>
                          <div className="text-xs text-zinc-400">
                            {entity.ratingCount} reviews
                          </div>
                        </>
                      ) : (
                        <div className="text-xs text-zinc-400">No ratings yet · 0 reviews</div>
                      )}
                    </div>
                  </div>

                  {/* Tags */}
                  {entity.tags && entity.tags.length > 0 && (
                    <div className="mt-auto flex flex-wrap gap-1 pt-3">
                      {entity.tags.slice(0, 4).map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Toilet-specific: shower badge */}
                  {entity.type === "TOILET" && entity.hasShower && (
                    <div className="mt-2">
                      <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-700">
                        🚿 Has shower
                      </span>
                    </div>
                  )}
                </Card>
              </Link>
            ))}
          </div>

          {/* Load More */}
          {hasMore && (
            <div className="flex justify-center pt-4">
              <Button variant="ghost" onClick={loadMore} disabled={loading}>
                {loading ? "Loading..." : "Load more"}
              </Button>
            </div>
          )}

          {/* Empty State */}
          {entities.length === 0 && !loading && (
            <div className="py-12 text-center text-zinc-500">
              No {category.label.toLowerCase()} found matching your filters.
            </div>
          )}
        </>
      )}
    </div>
  );
}
