import { Link } from "react-router-dom";
import { Application } from "@/types";
import { Building2, MapPin, ChevronRight, FileText } from "lucide-react";
import { STAGES } from "@/lib/utils";

interface Props {
  application: Application;
  className?: string;
}

export function ApplicationCard({ application, className }: Props) {
  const stage = (application.stage as string) || "";
  const s = STAGES[stage] ?? { label: stage || "Unknown", bg: "#f3f4f6", text: "#6b7280" };

  return (
    <Link
      to={`/applications/${application.id}`}
      state={{ from: "applications" }}
      className={`flex items-center justify-between bg-white rounded-card border border-border shadow-card p-4 hover:shadow-md transition-shadow ${className ?? ""}`}
    >
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold truncate">{application.job_title}</h3>
        <div className="flex items-center gap-3 mt-1 text-sm text-text-secondary flex-wrap">
          <span className="flex items-center gap-1">
            <Building2 className="w-3.5 h-3.5" />
            {application.company}
          </span>
          {application.location && (
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" />
              {application.location}
            </span>
          )}
          {application.resume_filename && (
            <span className="flex items-center gap-1">
              <FileText className="w-3.5 h-3.5" />
              {application.resume_filename}
            </span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <span
          className="px-2.5 py-1 rounded-full text-xs font-medium capitalize"
          style={{ backgroundColor: s.bg, color: s.text }}
        >
          {s.label}
        </span>
        {application.match_score != null && (
          <span className="text-xs text-text-secondary font-medium">
            Match {application.match_score}%
          </span>
        )}
        <ChevronRight className="w-4 h-4 text-text-muted" />
      </div>
    </Link>
  );
}
