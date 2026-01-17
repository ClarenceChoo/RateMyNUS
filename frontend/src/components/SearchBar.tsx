import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Input from "@/components/ui/Input";
import { searchEntities } from "@/features/entities/entityService";
import type { Entity } from "@/types";

type Props = {
  placeholder?: string;
  onSelect?: (entity: Entity) => void;
  className?: string;
};

export default function SearchBar({ placeholder = "Search dorms, profs, food...", onSelect, className }: Props) {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Entity[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  async function handleSearch(value: string) {
    setQuery(value);
    if (value.length < 2) {
      setResults([]);
      setOpen(false);
      return;
    }

    setLoading(true);
    try {
      const data = await searchEntities(value, 8);
      setResults(data);
      setOpen(true);
    } finally {
      setLoading(false);
    }
  }

  function handleSelect(entity: Entity) {
    setQuery("");
    setResults([]);
    setOpen(false);
    if (onSelect) {
      onSelect(entity);
    } else {
      navigate(`/entity/${entity.id}`);
    }
  }

  return (
    <div className={`relative ${className ?? ""}`}>
      <Input
        type="text"
        placeholder={placeholder}
        value={query}
        onChange={(e) => handleSearch(e.target.value)}
        onFocus={() => results.length > 0 && setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 200)}
        className="w-full"
      />
      
      {loading && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">
          ...
        </div>
      )}

      {open && results.length > 0 && (
        <div className="absolute top-full z-50 mt-1 w-full rounded-xl border bg-white shadow-lg">
          {results.map((entity) => (
            <button
              key={entity.id}
              type="button"
              onClick={() => handleSelect(entity)}
              className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-zinc-50 first:rounded-t-xl last:rounded-b-xl"
            >
              <span className="text-lg">
                {entity.type === "DORM" && "🏠"}
                {entity.type === "CLASSROOM" && "🎓"}
                {entity.type === "PROFESSOR" && "👨‍🏫"}
                {entity.type === "FOOD_PLACE" && "🍜"}
                {entity.type === "TOILET" && "🚻"}
              </span>
              <div className="flex-1">
                <div className="font-medium">{entity.name}</div>
                <div className="text-xs text-zinc-500">{entity.subtitle}</div>
              </div>
              {entity.avgRating && (
                <div className="text-sm text-zinc-600">
                  {entity.avgRating.toFixed(1)} ★
                </div>
              )}
            </button>
          ))}
        </div>
      )}

      {open && query.length >= 2 && results.length === 0 && !loading && (
        <div className="absolute top-full z-50 mt-1 w-full rounded-xl border bg-white p-4 text-center text-sm text-zinc-500 shadow-lg">
          No results found
        </div>
      )}
    </div>
  );
}
