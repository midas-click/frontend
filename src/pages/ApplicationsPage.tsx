import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useStore } from "@/store";
import { Building2, MapPin, ChevronRight, FileText } from "lucide-react";
import clsx from "clsx";
import { getStageLabel, getStageStyle } from "@/lib/utils";
import { ApplicationFilters } from "@/components/ApplicationFilters";
import { ApplicationCreateModal } from "@/components/kanban/ApplicationCreateModal";

export function ApplicationsPage() {
  const { applications, fetchApplications, loading } = useStore();
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => { fetchApplications(); }, [fetchApplications]);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Applicants</h1>
      </div>

      <ApplicationFilters
        showCreateBtn
        onCreateClick={() => setShowCreate(true)}
      />

      <div className="mt-4">
        {loading ? (
          <p className="text-text-secondary">Loading…</p>
        ) : applications.length === 0 ? (
          <p className="text-text-secondary">
            No applications yet.{" "}
            <button onClick={() => setShowCreate(true)} className="text-brand-600 underline">
              Create one
            </button>
            {" "}or go to{" "}
            <Link to="/kanban" className="text-brand-600 underline">Kanban</Link>.
          </p>
        ) : (
          <div className="space-y-2">
            {applications.map((app) => (
              <Link
                key={app.id}
                to={`/applications/${app.id}`}
                state={{ from: "applications" }}
                className="flex items-center justify-between bg-white rounded-card border border-border shadow-card p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold truncate">{app.job_title}</h3>
                  <div className="flex items-center gap-3 mt-1 text-sm text-text-secondary flex-wrap">
                    <span className="flex items-center gap-1"><Building2 className="w-3.5 h-3.5" />{app.company}</span>
                    {app.location && <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{app.location}</span>}
                    {app.resume_filename && <span className="flex items-center gap-1"><FileText className="w-3.5 h-3.5" />{app.resume_filename}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="px-2.5 py-1 rounded-full text-xs font-medium capitalize" style={getStageStyle(app.stage as string)}>
                    {getStageLabel(app.stage as string)}
                  </span>
                  {app.match_score != null && (
                    <span className="text-xs text-text-secondary font-medium">Match {app.match_score}%</span>
                  )}
                  <ChevronRight className="w-4 h-4 text-text-muted" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {showCreate && (
        <ApplicationCreateModal
          onClose={() => setShowCreate(false)}
          onCreated={() => {
            setShowCreate(false);
            fetchApplications();
          }}
        />
      )}
    </div>
  );
}
