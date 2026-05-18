import { ReactNode, UIEvent } from "react";
import { useDroppable } from "@dnd-kit/core";
import clsx from "clsx";

interface Props {
  colId: string;
  label: string;
  bg: string;
  text: string;
  count: number;
  children: ReactNode;
  hasMore?: boolean;
  loadingMore?: boolean;
  onLoadMore?: () => void;
}

export function KanbanColumn({
  colId,
  label,
  bg,
  text,
  count,
  children,
  hasMore,
  loadingMore,
  onLoadMore,
}: Props) {
  const { setNodeRef } = useDroppable({ id: colId, data: { stage: colId } });

  function handleScroll(event: UIEvent<HTMLDivElement>) {
    const el = event.currentTarget;
    const distanceToBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    if (distanceToBottom < 160 && hasMore && !loadingMore) {
      onLoadMore?.();
    }
  }

  return (
    <div
      ref={setNodeRef}
      data-col-id={colId}
      className="flex flex-col w-72 shrink-0 rounded-xl border border-gray-200 p-3 pr-1"
      style={{ backgroundColor: bg }}
    >
      {/* Header */}
      <div className="flex items-center gap-1 mb-3">
        <h3 className="font-semibold text-sm truncate" style={{ color: text }}>{label}</h3>
        <span className={clsx("text-xs font-bold px-2 py-0.5 rounded-full shrink-0 ml-auto", count > 0 ? "bg-white/70 text-gray-700" : "bg-white/40 text-text-muted")}>
          {count}
        </span>
      </div>

      {/* Cards */}
      <div
        className="flex flex-col gap-2 overflow-y-auto flex-1 min-h-0 pr-2"
        onScroll={handleScroll}
      >
        {children}
        {loadingMore && (
          <div className="py-2 text-center text-xs text-text-secondary">Loading...</div>
        )}
      </div>
    </div>
  );
}
