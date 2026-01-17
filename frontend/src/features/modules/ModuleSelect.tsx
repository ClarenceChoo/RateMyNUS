import { useState, useEffect, useRef, useMemo } from "react";
import { fetchAllModules, searchModules, getPopularModules, type NusModule } from "@/features/modules/nusMods";

type ModuleSelectProps = {
  value: string;
  onChange: (moduleCode: string) => void;
  placeholder?: string;
  className?: string;
};

export default function ModuleSelect({
  value,
  onChange,
  placeholder = "e.g. CS2030S",
  className = "",
}: ModuleSelectProps) {
  const [modules, setModules] = useState<NusModule[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState(value);
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch modules on mount
  useEffect(() => {
    fetchAllModules()
      .then(setModules)
      .finally(() => setLoading(false));
  }, []);

  // Sync query with value prop
  useEffect(() => {
    setQuery(value);
  }, [value]);

  // Filter modules based on query
  const filteredModules = useMemo(() => {
    if (!query.trim()) {
      // Show popular modules when no query
      return getPopularModules(modules);
    }
    return searchModules(modules, query, 30);
  }, [modules, query]);

  // Reset highlight when results change
  useEffect(() => {
    setHighlightedIndex(0);
  }, [filteredModules]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const newValue = e.target.value.toUpperCase();
    setQuery(newValue);
    setIsOpen(true);
  }

  function handleSelect(mod: NusModule) {
    setQuery(mod.moduleCode);
    onChange(mod.moduleCode);
    setIsOpen(false);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!isOpen) {
      if (e.key === "ArrowDown" || e.key === "Enter") {
        setIsOpen(true);
        e.preventDefault();
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < filteredModules.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : 0));
        break;
      case "Enter":
        e.preventDefault();
        if (filteredModules[highlightedIndex]) {
          handleSelect(filteredModules[highlightedIndex]);
        }
        break;
      case "Escape":
        setIsOpen(false);
        break;
    }
  }

  function handleBlur() {
    // If the current query matches a valid module code, use it
    const matchedModule = modules.find(
      (m) => m.moduleCode.toLowerCase() === query.toLowerCase()
    );
    if (matchedModule) {
      onChange(matchedModule.moduleCode);
      setQuery(matchedModule.moduleCode);
    } else if (query.trim()) {
      // Allow custom input if it looks like a module code
      onChange(query.trim());
    }
  }

  return (
    <div className={`relative ${className}`}>
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={handleInputChange}
        onFocus={() => setIsOpen(true)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        placeholder={loading ? "Loading modules..." : placeholder}
        disabled={loading}
        className="w-full rounded-lg border px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-purple-200 disabled:opacity-50"
        autoComplete="off"
      />

      {/* Dropdown */}
      {isOpen && filteredModules.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-lg border bg-white shadow-lg"
        >
          {!query.trim() && (
            <div className="px-3 py-2 text-xs text-zinc-400 border-b">
              Popular modules
            </div>
          )}
          {filteredModules.map((mod, idx) => (
            <button
              key={mod.moduleCode}
              type="button"
              onMouseDown={() => handleSelect(mod)}
              onMouseEnter={() => setHighlightedIndex(idx)}
              className={`w-full px-3 py-2 text-left text-sm hover:bg-zinc-50 ${
                idx === highlightedIndex ? "bg-purple-50" : ""
              }`}
            >
              <span className="font-medium text-purple-700">{mod.moduleCode}</span>
              <span className="ml-2 text-zinc-500 truncate">{mod.title}</span>
            </button>
          ))}
        </div>
      )}

      {/* No results message */}
      {isOpen && query.trim() && filteredModules.length === 0 && !loading && (
        <div
          ref={dropdownRef}
          className="absolute z-50 mt-1 w-full rounded-lg border bg-white p-3 shadow-lg"
        >
          <div className="text-sm text-zinc-500">
            No modules found for "{query}"
          </div>
          <div className="mt-1 text-xs text-zinc-400">
            You can still enter it manually
          </div>
        </div>
      )}
    </div>
  );
}
