import { useEffect, useRef, useState } from "react";
import { Search, X } from "lucide-react";
import { useStore } from "@/store";

interface Props {
  onSearch?: (params?: Record<string, string>) => void;
  isSignedIn?: boolean;
}

type CreatorFilter = "all" | "me" | "org";

export function JobFilters({ onSearch, isSignedIn = false }: Props) {
  const { fetchJobs } = useStore();
  const [search, setSearch] = useState("");
  const [creator, setCreator] = useState<CreatorFilter>("all");
  const [creatorOpen, setCreatorOpen] = useState(false);
  const didMount = useRef(false);

  useEffect(() => {
    if (!didMount.current) {
      didMount.current = true;
      return;
    }

    const handle = window.setTimeout(() => {
      const keyword = search.trim();
      const nextParams: Record<string, string> = {};
      if (keyword) nextParams.search = keyword;
      if (creator !== "all") nextParams.creator = creator;
      const params = Object.keys(nextParams).length > 0 ? nextParams : undefined;
      if (onSearch) {
        onSearch(params);
      } else {
        fetchJobs(params);
      }
    }, 350);

    return () => window.clearTimeout(handle);
  }, [creator, fetchJobs, onSearch, search]);

  return (
    <div className="flex items-center gap-2 flex-1 min-w-[420px] max-w-2xl">
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
      <div className="relative shrink-0">
        <button
          type="button"
          onClick={() => setCreatorOpen((open) => !open)}
          onBlur={() => setTimeout(() => setCreatorOpen(false), 120)}
          className="border rounded-btn px-3 py-2 text-sm bg-white min-w-40 text-left"
        >
          {creator === "all" ? "All jobs" : creator === "me" ? "Created by me" : "Created by my org"}
        </button>
        {creatorOpen && (
          <div className="absolute right-0 z-20 mt-1 w-48 bg-white border border-border rounded-btn shadow-lg py-1">
            <button
              type="button"
              onMouseDown={() => { setCreator("all"); setCreatorOpen(false); }}
              className="block w-full px-3 py-2 text-left text-sm hover:bg-surface-secondary"
            >
              All jobs
            </button>
            <button
              type="button"
              disabled={!isSignedIn}
              onMouseDown={() => { if (isSignedIn) { setCreator("me"); setCreatorOpen(false); } }}
              className="block w-full px-3 py-2 text-left text-sm hover:bg-surface-secondary disabled:text-text-muted disabled:cursor-not-allowed disabled:hover:bg-white"
            >
              Created by me
            </button>
            <button
              type="button"
              disabled={!isSignedIn}
              onMouseDown={() => { if (isSignedIn) { setCreator("org"); setCreatorOpen(false); } }}
              className="block w-full px-3 py-2 text-left text-sm hover:bg-surface-secondary disabled:text-text-muted disabled:cursor-not-allowed disabled:hover:bg-white"
            >
              Created by my org
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
