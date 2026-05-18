import { Link } from "react-router-dom";
import { Banknote, Briefcase, ChevronRight, ExternalLink, Globe, MapPin } from "lucide-react";
import type { Job } from "@/types";

interface Props {
  job: Job;
  selected?: boolean;
  onSelectedChange?: (jobId: string, selected: boolean) => void;
}

export function JobCard({ job, selected = false, onSelectedChange }: Props) {
  return (
    <div className="flex items-stretch gap-3 bg-white rounded-card border border-border shadow-card p-4 hover:shadow-md transition-shadow">
      <label className="flex items-start pt-1 shrink-0">
        <input
          type="checkbox"
          checked={selected}
          onChange={(e) => onSelectedChange?.(job.id, e.target.checked)}
          className="h-4 w-4 rounded border-border text-brand-600 focus:ring-brand-600"
          aria-label={`Select ${job.title}`}
        />
      </label>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <Link to={`/jobs/${job.id}`} className="block group">
              <h3 className="font-semibold truncate group-hover:text-brand-600">{job.title}</h3>
              <p className="text-sm text-text-secondary flex items-center gap-3 mt-1 flex-wrap">
                <span className="flex items-center gap-1"><Briefcase className="w-3.5 h-3.5" />{job.company}</span>
                {job.location && <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{job.location}</span>}
                {job.remote && <span className="flex items-center gap-1"><Globe className="w-3.5 h-3.5" />Remote</span>}
                {job.salary_range && <span className="flex items-center gap-1 text-xs text-text-secondary"><Banknote className="w-3.5 h-3.5" />{job.salary_range}</span>}
              </p>
            </Link>
            {job.source_url && (
              <a
                href={job.source_url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 mt-2 text-xs text-blue-600 hover:text-blue-700 hover:underline"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Job posting
              </a>
            )}
            {job.tags && job.tags.length > 0 && (
              <div className="flex gap-1 mt-2 flex-wrap">
                {job.tags.slice(0, 8).map((tag) => (
                  <span key={tag} className="px-1.5 py-0.5 bg-brand-50 text-brand-600 rounded text-xs">{tag}</span>
                ))}
              </div>
            )}
          </div>
          <Link to={`/jobs/${job.id}`} className="p-1 text-text-muted hover:text-text-secondary shrink-0">
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
