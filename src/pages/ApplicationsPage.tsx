import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useStore } from "@/store";
import { Building2, MapPin, ChevronRight } from "lucide-react";
import clsx from "clsx";

function getStageLabel(stage: string): string {
  const fallbacks: Record<string, string> = {
    applied: "Applied", phone_screen: "Phone Screen", technical: "Technical",
    onsite: "Onsite", offer: "Offer", rejected: "Rejected", withdrawn: "Withdrawn",
  };
  if (fallbacks[stage]) return fallbacks[stage];
  try {
    const saved = localStorage.getItem("midas-kanban-columns");
    if (saved) {
      const cols = JSON.parse(saved);
      const col = cols.find((c: any) => c.id === stage);
      if (col) return col.label;
    }
  } catch {}
  return stage;
}

const STAGE_COLORS: Record<string, string> = {
  applied: "bg-blue-100 text-blue-700",
  phone_screen: "bg-yellow-100 text-yellow-700",
  technical: "bg-orange-100 text-orange-700",
  onsite: "bg-purple-100 text-purple-700",
  offer: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
  withdrawn: "bg-gray-100 text-gray-600",
};

export function ApplicationsPage() {
  const { applications, fetchApplications, loading } = useStore();

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Applications</h1>

      {loading ? (
        <p className="text-gray-500">Loading…</p>
      ) : applications.length === 0 ? (
        <p className="text-gray-500">No applications yet. <Link to="/kanban" className="text-brand-600 underline">Go to Kanban</Link> to create one.</p>
      ) : (
        <div className="space-y-2">
          {applications.map((app) => (
            <Link
              key={app.id}
              to={`/applications/${app.id}`}
              className="flex items-center justify-between bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold truncate">{app.job_title}</h3>
                <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                  <span className="flex items-center gap-1"><Building2 className="w-3.5 h-3.5" />{app.company}</span>
                  {app.location && <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{app.location}</span>}
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className={clsx("px-2.5 py-1 rounded-full text-xs font-medium capitalize", STAGE_COLORS[app.stage as string] || "bg-gray-100 text-gray-600")}>
                  {getStageLabel(app.stage as string)}
                </span>
                {app.match_score != null && (
                  <span className="text-xs text-gray-500 font-medium">Match {app.match_score}%</span>
                )}
                <ChevronRight className="w-4 h-4 text-gray-300" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
