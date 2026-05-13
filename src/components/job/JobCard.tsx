import { Link } from "react-router-dom";
import { Briefcase, MapPin, Globe, ChevronRight, Banknote } from "lucide-react";
import type { Job } from "@/types";

interface Props {
  job: Job;
}

export function JobCard({ job }: Props) {
  return (
    <Link
      to={`/jobs/${job.id}`}
      className="block bg-white rounded-card border border-border shadow-card p-4 hover:shadow-md transition-shadow"
    >
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold">{job.title}</h3>
          <p className="text-sm text-text-secondary flex items-center gap-3 mt-1">
            <span className="flex items-center gap-1"><Briefcase className="w-3.5 h-3.5" />{job.company}</span>
            {job.location && <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{job.location}</span>}
            {job.remote && <span className="flex items-center gap-1"><Globe className="w-3.5 h-3.5" />Remote</span>}
            {job.salary_range && <span className="flex items-center gap-1 text-xs text-text-secondary"><Banknote className="w-3.5 h-3.5" />{job.salary_range}</span>}
          </p>
          {job.tags && job.tags.length > 0 && (
            <div className="flex gap-1 mt-2 flex-wrap">
              {job.tags.slice(0, 8).map((tag) => (
                <span key={tag} className="px-1.5 py-0.5 bg-brand-50 text-brand-600 rounded text-xs">{tag}</span>
              ))}
            </div>
          )}
        </div>
        <ChevronRight className="w-4 h-4 text-text-muted shrink-0 ml-2" />
      </div>
    </Link>
  );
}
