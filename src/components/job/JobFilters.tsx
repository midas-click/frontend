import { useEffect, useRef, useState } from "react";
import { Search, X } from "lucide-react";
import { useStore } from "@/store";

interface Props {
  onSearch?: (params?: Record<string, string>) => void;
}

export function JobFilters({ onSearch }: Props) {
  const { fetchJobs } = useStore();
  const [search, setSearch] = useState("");
  const didMount = useRef(false);

  useEffect(() => {
    if (!didMount.current) {
      didMount.current = true;
      return;
    }

    const handle = window.setTimeout(() => {
      const keyword = search.trim();
      const params = keyword ? { search: keyword } : undefined;
      if (onSearch) {
        onSearch(params);
      } else {
        fetchJobs(params);
      }
    }, 350);

    return () => window.clearTimeout(handle);
  }, [fetchJobs, onSearch, search]);

  return (
    <div className="flex items-center gap-2 flex-1 min-w-[260px] max-w-2xl">
      <div className="relative flex-1 min-w-[260px]">
        <Search className="absolute left-3 top-2.5 w-4 h-4 text-text-muted" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by title, company or tags..."
          className="w-full border rounded-btn pl-9 pr-8 py-2 text-sm"
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            className="absolute right-2 top-2.5 text-text-muted hover:text-text-secondary"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
