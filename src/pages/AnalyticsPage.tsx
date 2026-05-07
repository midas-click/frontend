import { useEffect, useState } from "react";
import { analyticsApi } from "@/api/client";
import { getStageLabel, getStageStyle } from "@/lib/utils";
import type { AnalyticsOverview, ResumePerformance, IndustryTrend } from "@/types";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

export function AnalyticsPage() {
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [resumes, setResumes] = useState<ResumePerformance[]>([]);
  const [trends, setTrends] = useState<IndustryTrend[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      analyticsApi.overview(),
      analyticsApi.resumes(),
      analyticsApi.trends(),
    ]).then(([o, r, t]) => {
      setOverview(o);
      setResumes(r);
      setTrends(t);
    }).catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-gray-500">Loading analytics…</p>;

  const stageData = overview?.by_stage
    ? Object.entries(overview.by_stage).map(([id, value]) => ({ id, name: getStageLabel(id), value }))
    : [];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Analytics</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Stage Distribution Pie */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold mb-4">Applications by Stage</h2>
          {stageData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={stageData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                  {stageData.map((d, i) => {
                    const style = getStageStyle(d.id);
                    return <Cell key={i} fill={style.color} />;
                  })}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-400 text-sm">No data yet.</p>
          )}
        </div>

        {/* Conversion Funnel */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold mb-4">Conversion Rates</h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Interview Rate</span>
                <span className="font-semibold">{overview?.interview_rate ?? 0}%</span>
              </div>
              <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-yellow-400 rounded-full" style={{ width: `${overview?.interview_rate ?? 0}%` }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Offer Rate</span>
                <span className="font-semibold">{overview?.offer_rate ?? 0}%</span>
              </div>
              <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-green-500 rounded-full" style={{ width: `${overview?.offer_rate ?? 0}%` }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Rejection Rate</span>
                <span className="font-semibold">{overview?.rejection_rate ?? 0}%</span>
              </div>
              <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-red-400 rounded-full" style={{ width: `${overview?.rejection_rate ?? 0}%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* Resume Performance */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold mb-4">Resume Performance</h2>
          {resumes.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={resumes}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="filename" tick={{ fontSize: 11 }} angle={-20} textAnchor="end" height={60} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="applications" fill="#3b82f6" name="Applications" />
                <Bar dataKey="interviews" fill="#eab308" name="Interviews" />
                <Bar dataKey="offers" fill="#22c55e" name="Offers" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-400 text-sm">Upload resumes to see performance.</p>
          )}
        </div>

        {/* Industry Trends */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 overflow-x-auto">
          <h2 className="font-semibold mb-4">Tag / Industry Trends</h2>
          {trends.length > 0 ? (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b border-gray-100">
                  <th className="py-2 font-medium">Tag</th>
                  <th className="py-2 font-medium text-right">Apps</th>
                  <th className="py-2 font-medium text-right">Interview %</th>
                  <th className="py-2 font-medium text-right">Offer %</th>
                </tr>
              </thead>
              <tbody>
                {trends.map((t) => (
                  <tr key={t.tag} className="border-b border-gray-50">
                    <td className="py-2">{t.tag}</td>
                    <td className="py-2 text-right">{t.total}</td>
                    <td className="py-2 text-right">{t.interview_rate}%</td>
                    <td className="py-2 text-right">{t.offer_rate}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-gray-400 text-sm">Add tags to applications to see trends.</p>
          )}
        </div>
      </div>
    </div>
  );
}
