import { useState } from "react";
import { Search, X } from "lucide-react";
import { useStore } from "@/store";
import { DEFAULT_KANBAN_COLUMNS } from "@/types";

interface Props {
  showCreateBtn?: boolean;
  onCreateClick?: () => void;
}

export function ApplicationFilters({ showCreateBtn, onCreateClick }: Props) {
  const { fetchApplications } = useStore();
  const [search, setSearch] = useState("");
  const [stage, setStage] = useState("");
  const [tag, setTag] = useState("");

  function apply(opts?: { search?: string; stage?: string; tag?: string }) {
    const s = (opts?.search ?? search).trim();
    const st = opts?.stage ?? stage;
    const t = (opts?.tag ?? tag).trim();
    const params: Record<string, string> = {};
    if (s) params.search = s;
    if (st) params.stage = st;
    if (t) params.tag = t;
    fetchApplications(Object.keys(params).length > 0 ? params : undefined);
  }

  function clearAll() {
    setSearch("");
    setStage("");
    setTag("");
    // Fetch all immediately
    fetchApplications();
  }

  const hasFilters = search || stage || tag;

  return (
    <div className="flex items-center gap-3 flex-wrap">
      {/* Search */}
      <div className="relative flex-1 min-w-[200px] max-w-sm">
        <Search className="absolute left-3 top-2.5 w-4 h-4 text-text-muted" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search…"
          className="w-full border rounded-btn pl-9 pr-8 py-2 text-sm"
          onKeyDown={(e) => e.key === "Enter" && apply()}
        />
        {search && (
          <button onClick={() => { setSearch(""); apply({ search: "" }); }} className="absolute right-2 top-2.5 text-text-muted hover:text-text-secondary">
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Stage filter */}
      <select
        value={stage}
        onChange={(e) => { setStage(e.target.value); apply({ stage: e.target.value }); }}
        className="border rounded-btn px-3 py-2 text-sm"
      >
        <option value="">All Stages</option>
        {DEFAULT_KANBAN_COLUMNS.map((c) => (
          <option key={c.id} value={c.id}>{c.label}</option>
        ))}
      </select>

      {/* Tag filter */}
      <div className="relative">
        <input
          value={tag}
          onChange={(e) => setTag(e.target.value)}
          placeholder="Tag…"
          className="border rounded-btn px-3 py-2 text-sm w-28"
          onKeyDown={(e) => e.key === "Enter" && apply()}
        />
        {tag && (
          <button onClick={() => { setTag(""); apply({ tag: "" }); }} className="absolute right-2 top-2.5 text-text-muted hover:text-text-secondary">
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Clear */}
      {hasFilters && (
        <button onClick={clearAll} className="text-xs text-text-secondary hover:text-gray-700 underline">
          Clear filters
        </button>
      )}

      {/* Create button */}
      {showCreateBtn && (
        <button
          onClick={onCreateClick}
          className="ml-auto px-4 py-2 bg-brand-900 text-white text-sm font-medium rounded-btn hover:bg-brand-800 shrink-0"
        >
          + New Application
        </button>
      )}
    </div>
  );
}
