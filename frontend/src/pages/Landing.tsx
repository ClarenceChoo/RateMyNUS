import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import SearchBar from "@/components/SearchBar";
import CategoryGrid from "@/components/CategoryGrid";
import { getTopRated } from "@/features/entities/entityService";
import type { Entity } from "@/types";

export default function Landing() {
  const [topRated, setTopRated] = useState<Entity[]>([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  // Refetch every time user navigates to this page
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const data = await getTopRated(6);
        setTopRated(data);
      } finally {
        setLoading(false);
      }
    })();
  }, [location.key]);

  return (
    <div className="space-y-10">
      {/* Hero Section */}
      <section className="space-y-4 text-center">
        <h1 className="text-4xl font-bold tracking-tight md:text-5xl">RateMyNUS</h1>
        <p className="mx-auto max-w-2xl text-zinc-600">
          Rate dorms, LTs, profs, food places, and yes… toilets. Anonymous by default, useful by design.
        </p>
        
        {/* Search Bar */}
        <div className="mx-auto max-w-xl pt-2">
          <SearchBar placeholder="Search dorms, professors, food, toilets..." />
        </div>

        <div className="flex justify-center pt-2">
          <Link to="/explore"><Button className="cursor-pointer">Start exploring</Button></Link>
        </div>
      </section>

      {/* Category Grid */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Browse by Category</h2>
        <CategoryGrid />
      </section>

      {/* Top Rated This Week */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">🔥 Top Rated This Week</h2>
          <Link to="/explore" className="text-sm text-zinc-500 hover:underline">
            View all →
          </Link>
        </div>
        
        {loading ? (
          <div className="text-zinc-500">Loading...</div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {topRated.map((entity) => (
              <Link key={entity.id} to={`/entity/${entity.id}`}>
                <Card className="group cursor-pointer transition hover:border-zinc-300 hover:shadow-sm">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-semibold group-hover:text-zinc-700">
                        {entity.name}
                      </div>
                      <div className="text-sm text-zinc-500">
                        {entity.subtitle ?? entity.type}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-yellow-600">
                        {entity.avgRating?.toFixed(1)} ★
                      </div>
                      <div className="text-xs text-zinc-400">
                        {entity.ratingCount} reviews
                      </div>
                    </div>
                  </div>
                  {entity.tags && entity.tags.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {entity.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
