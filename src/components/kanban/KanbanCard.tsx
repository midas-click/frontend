import { useDraggable } from "@dnd-kit/core";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Link } from "react-router-dom";
import { Application } from "@/types";
import { Building2, MapPin, Tag } from "lucide-react";
import { format } from "date-fns";
import clsx from "clsx";

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
  } = useSortable({ id: application.id, data: { stage: application.stage } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <Link
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      to={`/applications/${application.id}`}
      style={style}
      className={clsx(
        "block bg-white rounded-lg border border-gray-200 p-3 shadow-sm hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing",
        isDragging && "opacity-50 z-50",
        isOverlay && "shadow-xl rotate-2",
      )}
    >
      <h4 className="font-semibold text-sm truncate">{application.job_title}</h4>
      <div className="flex items-center gap-1.5 mt-1 text-xs text-gray-500">
        <Building2 className="w-3 h-3" />
        <span className="truncate">{application.company}</span>
      </div>
      {application.location && (
        <div className="flex items-center gap-1.5 mt-0.5 text-xs text-gray-400">
          <MapPin className="w-3 h-3" />
          {application.location}
        </div>
      )}
      {application.match_score != null && (
        <div className="mt-2">
          <span
            className={clsx(
              "inline-block px-2 py-0.5 rounded text-xs font-medium",
              application.match_score >= 80
                ? "bg-green-100 text-green-700"
                : application.match_score >= 50
                  ? "bg-yellow-100 text-yellow-700"
                  : "bg-red-100 text-red-700",
            )}
          >
            Match: {application.match_score}%
          </span>
        </div>
      )}
      {application.tags.length > 0 && (
        <div className="flex gap-1 mt-2 flex-wrap">
          {application.tags.slice(0, 3).map((t) => (
            <span key={t} className="px-1.5 py-0.5 bg-gray-100 rounded text-xs text-gray-600">
              {t}
            </span>
          ))}
        </div>
      )}
    </Link>
  );
}
