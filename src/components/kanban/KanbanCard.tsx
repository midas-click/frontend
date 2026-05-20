import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Link } from "react-router-dom";
import { Application } from "@/types";
import { Building2, MapPin, FileText } from "lucide-react";
import clsx from "clsx";
import { getMatchScoreBadgeClass } from "@/lib/utils";

interface Props {
  application: Application;
  isOverlay?: boolean;
}

export function KanbanCard({ application, isOverlay }: Props) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: application.id,
    data: { stage: application.stage },
    disabled: isOverlay,
  });

  const style = isOverlay
    ? undefined
    : {
        transform: CSS.Translate.toString(transform),
        transition,
      };

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={style}
      className={clsx(
        "bg-white rounded-btn border border-border shadow-sm cursor-grab active:cursor-grabbing touch-none",
        isDragging && "opacity-30",
        isOverlay && "shadow-xl cursor-grabbing",
      )}
    >
      <Link
        to={`/applications/${application.id}`}
        state={{ from: "kanban" }}
        className="block p-3"
        onClick={(e) => { if (isDragging) e.preventDefault(); }}
        tabIndex={isDragging ? -1 : 0}
      >
        <h4 className="font-semibold text-sm truncate">{application.job_title}</h4>
        <div className="flex items-center gap-1.5 mt-1 text-xs text-text-secondary">
          <Building2 className="w-3 h-3 shrink-0" />
          <span className="truncate">{application.company}</span>
        </div>
        {application.location && (
          <div className="flex items-center gap-1.5 mt-0.5 text-xs text-text-muted">
            <MapPin className="w-3 h-3 shrink-0" />
            {application.location}
          </div>
        )}
        {application.resume_filename && (
          <div className="flex items-center gap-1.5 mt-0.5 text-xs text-text-muted">
            <FileText className="w-3 h-3 shrink-0" />
            <span className="truncate">{application.resume_filename}</span>
          </div>
        )}
        {application.tags.length > 0 && (
          <div className="flex gap-1 mt-2 flex-wrap">
            {application.tags.slice(0, 3).map((t) => (
              <span key={t} className="px-1.5 py-0.5 bg-brand-50 text-brand-600 rounded text-xs font-medium">
                {t}
              </span>
            ))}
          </div>
        )}
        {application.match_score != null && (
          <div className="mt-2">
            <span
              className={clsx(
                "inline-block px-2 py-0.5 rounded text-xs font-medium",
                getMatchScoreBadgeClass(application.match_score),
              )}
            >
              Match: {application.match_score}%
            </span>
          </div>
        )}
      </Link>
    </div>
  );
}
