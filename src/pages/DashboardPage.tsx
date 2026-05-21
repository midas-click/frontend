import { useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { LoadingIndicator } from "@/components/shared/LoadingIndicator";
import { useStore } from "@/store";
import { STAGES } from "@/lib/utils";
import { Briefcase, FileText, TrendingUp, Info, Clock, Calendar, Activity } from "lucide-react";

export function DashboardPage() {
  const activeProfileId = useStore((s) => s.activeProfileId);
  const data = useStore((s) => s.dashboardOverview);
  const loading = useStore((s) => s.dashboardLoading);
  const refreshing = useStore((s) => s.dashboardRefreshing);
  const fetchDashboardOverview = useStore((s) => s.fetchDashboardOverview);

  useEffect(() => {
    fetchDashboardOverview({ force: true, background: Boolean(data) });
    // The active profile controls the API scope; cached data stays visible during refresh.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeProfileId, fetchDashboardOverview]);

  const stageEntries = useMemo(() => {
    if (!data?.by_stage) return [];
    const columnOrder = Object.keys(STAGES);
    return Object.entries(data.by_stage).sort(([a], [b]) => {
      const ai = columnOrder.indexOf(a);
      const bi = columnOrder.indexOf(b);
      if (ai === -1 && bi === -1) return a.localeCompare(b);
      if (ai === -1) return 1;
      if (bi === -1) return -1;
      return ai - bi;
    });
  }, [data?.by_stage]);

  const cards = [
    {
      label: "New Jobs (24h)",
      value: data?.jobs_last_24h ?? 0,
      icon: Clock,
      color: "text-amber-600 bg-amber-50",
    },
    {
      label: "Total Jobs This Month",
      value: data?.jobs_this_month ?? 0,
      icon: Calendar,
      color: "text-indigo-600 bg-indigo-50",
    },
    {
      label: "Total Applications This Month",
      value: data?.applications_this_month ?? 0,
      icon: Briefcase,
      color: "text-blue-600 bg-blue-50",
    },
    {
      label: "Interview Rate",
      value: `${data?.interview_rate ?? 0}%`,
      icon: TrendingUp,
      color: "text-green-600 bg-green-50",
      tooltip: "This month — applications that reached Phone Screen, Technical, Team Interview, or Offer stage.",
    },
    {
      label: "Offer Rate",
      value: `${data?.offer_rate ?? 0}%`,
      icon: FileText,
      color: "text-purple-600 bg-purple-50",
      tooltip: "This month — percentage of interviewed applications that received an offer.",
    },
    {
      label: "New Applications (24h)",
      value: data?.applications_last_24h ?? 0,
      icon: Activity,
      color: "text-teal-600 bg-teal-50",
    },
  ];

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        {refreshing && <LoadingIndicator compact label="Updating..." />}
      </div>

      {loading && !data ? (
        <LoadingIndicator label="Loading dashboard..." />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {cards.map((c) => (
              <div key={c.label} className="relative bg-white rounded-card border border-border shadow-card p-5">
                {"tooltip" in c && (
                  <div className="absolute top-3 right-3 group">
                    <Info className="w-4 h-4 text-text-muted cursor-help" />
                    <div className="absolute right-0 top-full mt-1 w-56 p-2.5 bg-gray-800 text-white text-xs rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 leading-relaxed">
                      {c.tooltip}
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-3 mb-3">
                  <div className={`p-2 rounded-btn ${c.color}`}>
                    <c.icon className="w-5 h-5" />
                  </div>
                  <span className="text-sm text-text-secondary">{c.label}</span>
                </div>
                <p className="text-3xl font-bold">{c.value}</p>
              </div>
            ))}
          </div>

          {stageEntries.length > 0 && (
            <div className="bg-white rounded-card border border-border shadow-card p-6">
              <h2 className="font-semibold mb-4">Applications by Stage</h2>
              <div className="flex gap-2 flex-wrap">
                {stageEntries.map(([stage, count]) => {
                const s = STAGES[stage];
                return (
                  <div
                    key={stage}
                    className="px-3 py-1.5 rounded-tag text-sm font-medium"
                    style={{ backgroundColor: s.bg, color: s.text }}
                  >
                    {s.label}: {count}
                  </div>
                );
              })}
              </div>
            </div>
          )}

          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link
              to="/applications"
              className="p-4 bg-brand-50 text-brand-600 rounded-xl text-center font-medium hover:bg-brand-100 transition-colors"
            >
              + New Application
            </Link>
            <Link
              to="/resumes"
              className="p-4 bg-surface-secondary text-gray-700 rounded-xl text-center font-medium hover:bg-gray-200 transition-colors"
            >
              Upload Resume
            </Link>
            <Link
              to="/jobs"
              className="p-4 bg-surface-secondary text-gray-700 rounded-xl text-center font-medium hover:bg-gray-200 transition-colors"
            >
              Browse Jobs
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
