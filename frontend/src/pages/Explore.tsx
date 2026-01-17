import { useMemo, useState } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { listEntitiesByType } from "@/features/entities/entityService";
import type { Entity, EntityType } from "@/types";
import { Link } from "react-router-dom";

const types: EntityType[] = ["DORM", "CLASSROOM", "PROFESSOR", "FOOD_PLACE", "TOILET"];

export default function Explore() {
  const [type, setType] = useState<EntityType>("DORM");
  const [items, setItems] = useState<Entity[]>([]);
  const [loading, setLoading] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const data = await listEntitiesByType(type, 30);
      setItems(data);
    } finally {
      setLoading(false);
    }
  }

  useMemo(() => { load(); }, [type]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        {types.map((t) => (
          <Button
            key={t}
            variant={t === type ? "solid" : "ghost"}
            onClick={() => setType(t)}
          >
            {t}
          </Button>
        ))}
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {items.map((e) => (
            <Link key={e.id} to={`/entity/${e.id}`}>
              <Card className="hover:bg-zinc-50">
                <div className="font-semibold">{e.name}</div>
                <div className="text-sm text-zinc-600">{e.subtitle ?? e.type}</div>
                <div className="mt-2 text-xs text-zinc-500">
                  {e.avgRating ? `${e.avgRating.toFixed(1)} ★` : "No ratings yet"} · {e.ratingCount ?? 0} reviews
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
