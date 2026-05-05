import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { applicationsApi } from "@/api/client";
import { Application, ApplicationStage, CommunicationCreate } from "@/types";
import { Building2, MapPin, Clock, MessageSquare, DollarSign, Tag } from "lucide-react";
import { format } from "date-fns";

const STAGE_LABELS: Record<ApplicationStage, string> = {
  [ApplicationStage.Applied]: "Applied",
  [ApplicationStage.PhoneScreen]: "Phone Screen",
  [ApplicationStage.Technical]: "Technical",
  [ApplicationStage.Onsite]: "Onsite",
  [ApplicationStage.Offer]: "Offer",
  [ApplicationStage.Rejected]: "Rejected",
  [ApplicationStage.Withdrawn]: "Withdrawn",
};

export function ApplicationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [app, setApp] = useState<Application | null>(null);
  const [commSummary, setCommSummary] = useState("");
  const [commChannel, setCommChannel] = useState("email");

  useEffect(() => {
    if (id) applicationsApi.get(id).then(setApp).catch(console.error);
  }, [id]);

  async function addCommunication() {
    if (!id || !commSummary.trim()) return;
    await applicationsApi.addCommunication(id, {
      channel: commChannel,
      summary: commSummary,
    });
    setCommSummary("");
    const updated = await applicationsApi.get(id);
    setApp(updated);
  }

  if (!app) return <p className="text-gray-500">Loading…</p>;

  return (
    <div className="max-w-3xl">
      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h1 className="text-2xl font-bold">{app.job_title}</h1>
        <div className="flex items-center gap-4 mt-2 text-gray-500">
          <span className="flex items-center gap-1"><Building2 className="w-4 h-4" />{app.company}</span>
          {app.location && <span className="flex items-center gap-1"><MapPin className="w-4 h-4" />{app.location}</span>}
          {app.salary_expectation ? (
            <span className="flex items-center gap-1"><DollarSign className="w-4 h-4" />{app.salary_expectation.toLocaleString()} {app.salary_currency}</span>
          ) : null}
        </div>
        <div className="flex gap-2 mt-3 flex-wrap">
          <span className="px-2.5 py-0.5 bg-brand-50 text-brand-700 rounded-full text-sm font-medium capitalize">
            {STAGE_LABELS[app.stage]}
          </span>
          {app.match_score != null && (
            <span className="px-2.5 py-0.5 bg-green-50 text-green-700 rounded-full text-sm font-medium">
              Match: {app.match_score}%
            </span>
          )}
          {app.tags.map((t) => (
            <span key={t} className="px-2.5 py-0.5 bg-gray-100 text-gray-600 rounded-full text-sm">{t}</span>
          ))}
        </div>
        {app.notes && <p className="mt-4 text-sm text-gray-600 p-3 bg-gray-50 rounded-lg">{app.notes}</p>}
      </div>

      {/* Timeline */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h2 className="font-semibold mb-4">Timeline</h2>
        {app.timeline.length === 0 ? (
          <p className="text-sm text-gray-400">No events yet.</p>
        ) : (
          <div className="space-y-3">
            {app.timeline.map((e, i) => (
              <div key={i} className="flex gap-3">
                <Clock className="w-4 h-4 text-gray-300 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium">{e.event}</p>
                  <p className="text-xs text-gray-400">{format(new Date(e.date), "MMM d, yyyy h:mm a")}</p>
                  {e.detail && <p className="text-xs text-gray-500 mt-0.5">{e.detail}</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Communication Log */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h2 className="font-semibold mb-4">Communication Log</h2>
        <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
          {app.communication_log.length === 0 && <p className="text-sm text-gray-400">No communications logged.</p>}
          {app.communication_log.map((c, i) => (
            <div key={i} className="p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-400 mb-1">
                {format(new Date(c.date), "MMM d, yyyy")} · {c.raw_content ? "Email" : c.channel}
              </p>
              <p className="text-sm">{c.summary}</p>
            </div>
          ))}
        </div>
        {/* Add new log */}
        <div className="flex gap-2">
          <select value={commChannel} onChange={(e) => setCommChannel(e.target.value)} className="border rounded-lg px-2 text-sm">
            <option value="email">Email</option>
            <option value="phone">Phone</option>
            <option value="linkedin">LinkedIn</option>
            <option value="in_person">In Person</option>
          </select>
          <input
            value={commSummary}
            onChange={(e) => setCommSummary(e.target.value)}
            placeholder="Add a note…"
            className="flex-1 border rounded-lg px-3 py-2 text-sm"
            onKeyDown={(e) => e.key === "Enter" && addCommunication()}
          />
          <button onClick={addCommunication} className="px-4 py-2 bg-brand-600 text-white text-sm rounded-lg hover:bg-brand-700">
            Add
          </button>
        </div>
      </div>
    </div>
  );
}
