import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { analyticsApi } from "@/api/client";
import { getStageLabel, getStageStyle } from "@/lib/utils";
import type { AnalyticsOverview } from "@/types";
import { BarChart3, Briefcase, FileText, TrendingUp } from "lucide-react";

export function DashboardPage() {
  const [data, setData] = useState<AnalyticsOverview | null>(null);

  useEffect(() => {
    analyticsApi.overview().then(setData).catch(console.error);
  }, []);

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
    },
    {
      label: "Offer Rate",
      value: `${data?.offer_rate ?? 0}%`,
      icon: FileText,
      color: "text-purple-600 bg-purple-50",
    },
    {
      label: "Avg. Salary (USD)",
      value: data?.average_salary_expectation
        ? `$${data.average_salary_expectation.toLocaleString()}`
        : "$0",
      icon: BarChart3,
      color: "text-orange-600 bg-orange-50",
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map((c) => (
          <div key={c.label} className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className={`p-2 rounded-lg ${c.color}`}>
                <c.icon className="w-5 h-5" />
              </div>
              <span className="text-sm text-gray-500">{c.label}</span>
            </div>
            <p className="text-3xl font-bold">{c.value}</p>
          </div>
        ))}
      </div>

      {/* Stage distribution */}
      {data?.by_stage && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold mb-4">Applications by Stage</h2>
          <div className="flex gap-2 flex-wrap">
            {Object.entries(data.by_stage).map(([stage, count]) => {
                const style = getStageStyle(stage);
                return (
                  <div
                    key={stage}
                    className="px-3 py-1.5 rounded-full text-sm font-medium"
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
          className="p-4 bg-brand-50 text-brand-700 rounded-xl text-center font-medium hover:bg-brand-100 transition-colors"
        >
          + New Application
        </Link>
        <Link
          to="/resumes"
          className="p-4 bg-gray-100 text-gray-700 rounded-xl text-center font-medium hover:bg-gray-200 transition-colors"
        >
          Upload Resume
        </Link>
        <Link
          to="/jobs"
          className="p-4 bg-gray-100 text-gray-700 rounded-xl text-center font-medium hover:bg-gray-200 transition-colors"
        >
          Browse Jobs
        </Link>
      </div>
    </div>
  );
}
