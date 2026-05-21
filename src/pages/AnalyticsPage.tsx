import { useEffect } from "react";
import { LoadingIndicator } from "@/components/shared/LoadingIndicator";
import { useStore } from "@/store";
import { STAGES } from "@/lib/utils";
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
  const activeProfileId = useStore((s) => s.activeProfileId);
  const overview = useStore((s) => s.analyticsOverview);
  const resumes = useStore((s) => s.analyticsResumes);
  const trends = useStore((s) => s.analyticsTrends);
  const loading = useStore((s) => s.analyticsLoading);
  const refreshing = useStore((s) => s.analyticsRefreshing);
  const fetchAnalytics = useStore((s) => s.fetchAnalytics);

  useEffect(() => {
    fetchAnalytics({ force: true, background: Boolean(overview) });
    // The active profile controls the API scope; cached data stays visible during refresh.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeProfileId, fetchAnalytics]);

  if (loading && !overview) return <LoadingIndicator label="Loading analytics..." />;

  const stageData = overview?.by_stage
    ? Object.entries(overview.by_stage).map(([id, value]) => ({ id, name: STAGES[id]?.label || id, value }))
    : [];

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <h1 className="text-2xl font-bold">Analytics</h1>
        {refreshing && <LoadingIndicator compact label="Updating..." />}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-card border border-border shadow-card p-6">
          <h2 className="font-semibold mb-4">Applications by Stage</h2>
          {stageData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={stageData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                  {stageData.map((d, i) => {
                    const s = STAGES[d.id];
                    return <Cell key={i} fill={s.text} />;
                  })}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-text-muted text-sm">No data yet.</p>
          )}
        </div>

        <div className="bg-white rounded-card border border-border shadow-card p-6">
          <h2 className="font-semibold mb-4">Conversion Rates</h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Interview Rate</span>
                <span className="font-semibold">{overview?.interview_rate ?? 0}%</span>
              </div>
              <div className="h-3 bg-surface-secondary rounded-tag overflow-hidden">
                <div className="h-full bg-yellow-400 rounded-tag" style={{ width: `${overview?.interview_rate ?? 0}%` }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Offer Rate</span>
                <span className="font-semibold">{overview?.offer_rate ?? 0}%</span>
              </div>
              <div className="h-3 bg-surface-secondary rounded-tag overflow-hidden">
                <div className="h-full bg-green-500 rounded-tag" style={{ width: `${overview?.offer_rate ?? 0}%` }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Rejection Rate</span>
                <span className="font-semibold">{overview?.rejection_rate ?? 0}%</span>
              </div>
              <div className="h-3 bg-surface-secondary rounded-tag overflow-hidden">
                <div className="h-full bg-red-400 rounded-tag" style={{ width: `${overview?.rejection_rate ?? 0}%` }} />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-card border border-border shadow-card p-6">
          <h2 className="font-semibold mb-4">Resume Performance</h2>
          {resumes.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={resumes.map((r) => ({
                ...r,
                interviewRate: r.applications > 0 ? Math.round((r.interviews / r.applications) * 100) : 0,
                offerRate: r.applications > 0 ? Math.round((r.offers / r.applications) * 100) : 0,
              }))}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="filename" tick={{ fontSize: 11 }} angle={-20} textAnchor="end" height={60} />
                <YAxis unit="%" domain={[0, 100]} />
                <Tooltip formatter={(value: number) => `${value}%`} />
                <Legend />
                <Bar dataKey="interviewRate" fill="#eab308" name="Interview Rate" />
                <Bar dataKey="offerRate" fill="#22c55e" name="Offer Rate" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-text-muted text-sm">Upload resumes to see performance.</p>
          )}
        </div>

        <div className="bg-white rounded-card border border-border shadow-card p-6">
          <h2 className="font-semibold mb-4">Applications per Resume</h2>
          {resumes.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={resumes}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="filename" tick={{ fontSize: 11 }} angle={-20} textAnchor="end" height={60} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="applications" fill="#3b82f6" name="Applications" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-text-muted text-sm">Upload resumes to see data.</p>
          )}
        </div>

        <div className="bg-white rounded-card border border-border shadow-card p-6 overflow-x-auto">
          <h2 className="font-semibold mb-4">Tag / Industry Trends</h2>
          {trends.length > 0 ? (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b border-border">
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
            <p className="text-text-muted text-sm">Add tags to applications to see trends.</p>
          )}
        </div>
      </div>
    </div>
  );
}
