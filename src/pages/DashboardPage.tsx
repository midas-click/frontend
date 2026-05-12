import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useStore } from "@/store";
import { analyticsApi } from "@/api/client";
import { getStageLabel, getStageStyle } from "@/lib/utils";
import type { AnalyticsOverview } from "@/types";
import { DEFAULT_KANBAN_COLUMNS } from "@/types";
import { Briefcase, FileText, TrendingUp, Info } from "lucide-react";

export function DashboardPage() {
  const [data, setData] = useState<AnalyticsOverview | null>(null);
  const activeProfileId = useStore((s) => s.activeProfileId);

  useEffect(() => {
    analyticsApi.overview().then(setData).catch(console.error);
  }, [activeProfileId]);

  const stageEntries = useMemo(() => {
    if (!data?.by_stage) return [];
    const columnOrder = DEFAULT_KANBAN_COLUMNS.map((c) => c.id);
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
      label: "Total Applications",
      value: data?.total_applications ?? 0,
      icon: Briefcase,
      color: "text-blue-600 bg-blue-50",
    },
    {
      label: "Interview Rate",
      value: `${data?.interview_rate ?? 0}%`,
      icon: TrendingUp,
      color: "text-green-600 bg-green-50",
      tooltip: "Applications that reached Phone Screen, Technical, Team Interview, or Offer stage.",
    },
    {
      label: "Offer Rate",
      value: `${data?.offer_rate ?? 0}%`,
      icon: FileText,
      color: "text-purple-600 bg-purple-50",
      tooltip: "Percentage of interviewed applications that received an offer.",
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
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

      {/* Stage distribution */}
      {stageEntries.length > 0 && (
        <div className="bg-white rounded-card border border-border shadow-card p-6">
          <h2 className="font-semibold mb-4">Applications by Stage</h2>
          <div className="flex gap-2 flex-wrap">
            {stageEntries.map(([stage, count]) => {
                const style = getStageStyle(stage);
                return (
                  <div
                    key={stage}
                    className="px-3 py-1.5 rounded-tag text-sm font-medium"
                    style={style}
                  >
                    {getStageLabel(stage)}: {count}
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Quick actions */}
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
    </div>
  );
}
