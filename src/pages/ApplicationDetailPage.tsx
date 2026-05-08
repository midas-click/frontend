import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { applicationsApi } from "@/api/client";
import { Application } from "@/types";
import { Building2, MapPin, Clock, DollarSign, Pencil, Trash2, X, Save } from "lucide-react";
import { format } from "date-fns";
import { getStageLabel, getStageStyle, formatEvent } from "@/lib/utils";
import { ConfirmDialog } from "@/components/ConfirmDialog";


export function ApplicationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [app, setApp] = useState<Application | null>(null);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    job_title: "",
    company: "",
    role: "",
    location: "",
    salary_expectation: "",
    salary_currency: "USD",
    recruiter_name: "",
    notes: "",
    tags: "",
  });
  const [commSummary, setCommSummary] = useState("");
  const [commChannel, setCommChannel] = useState("email");

  useEffect(() => {
    if (id) applicationsApi.get(id).then(setApp).catch(console.error);
  }, [id]);

  function startEditing() {
    if (!app) return;
    setEditForm({
      job_title: app.job_title,
      company: app.company,
      role: app.role || "",
      location: app.location || "",
      salary_expectation: app.salary_expectation?.toString() || "",
      salary_currency: app.salary_currency || "USD",
      recruiter_name: app.recruiter_name || "",
      notes: app.notes || "",
      tags: app.tags.join(", "),
    });
    setEditing(true);
  }

  async function saveEdit() {
    if (!id || !app) return;
    setSaving(true);
    try {
      const updateData: any = {
        job_title: editForm.job_title,
        company: editForm.company,
        role: editForm.role || null,
        location: editForm.location || null,
        salary_expectation: editForm.salary_expectation ? Number(editForm.salary_expectation) : null,
        salary_currency: editForm.salary_currency,
        recruiter_name: editForm.recruiter_name || null,
        notes: editForm.notes || null,
        tags: editForm.tags ? editForm.tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
      };
      const updated = await applicationsApi.update(id, updateData);
      setApp(updated);
      setEditing(false);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

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

  async function handleDelete() {
    if (!id) return;
    await applicationsApi.delete(id);
    navigate("/applications");
  }

  if (!app) return <p className="text-text-secondary">Loading…</p>;

  return (
    <div className="max-w-3xl">
      {/* Header */}
      <div className="bg-white rounded-card border border-border shadow-card p-6 mb-6">
        {editing ? (
          <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1">Job Title</label>
                  <input value={editForm.job_title} onChange={(e) => setEditForm({ ...editForm, job_title: e.target.value })}
                    className="w-full border rounded-btn px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1">Company</label>
                  <input value={editForm.company} onChange={(e) => setEditForm({ ...editForm, company: e.target.value })}
                    className="w-full border rounded-btn px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1">Role</label>
                  <input value={editForm.role} onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                    className="w-full border rounded-btn px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1">Location</label>
                  <input value={editForm.location} onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                    className="w-full border rounded-btn px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1">Salary</label>
                  <input type="number" value={editForm.salary_expectation} onChange={(e) => setEditForm({ ...editForm, salary_expectation: e.target.value })}
                    className="w-full border rounded-btn px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1">Currency</label>
                  <select value={editForm.salary_currency} onChange={(e) => setEditForm({ ...editForm, salary_currency: e.target.value })}
                    className="w-full border rounded-btn px-3 py-2 text-sm">
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                    <option value="CAD">CAD</option>
                    <option value="INR">INR</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">Recruiter Name</label>
                <input value={editForm.recruiter_name} onChange={(e) => setEditForm({ ...editForm, recruiter_name: e.target.value })}
                  className="w-full border rounded-btn px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">Notes</label>
                <textarea value={editForm.notes} onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                  className="w-full border rounded-btn px-3 py-2 text-sm" rows={3} />
              </div>
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">Tags (comma-separated)</label>
                <input value={editForm.tags} onChange={(e) => setEditForm({ ...editForm, tags: e.target.value })}
                  className="w-full border rounded-btn px-3 py-2 text-sm" placeholder="react, remote, healthtech" />
              </div>
              <div className="flex gap-2 pt-2">
                <button onClick={saveEdit} disabled={saving}
                  className="flex items-center gap-1.5 px-4 py-2 bg-brand-900 text-white text-sm rounded-btn hover:bg-brand-800 disabled:opacity-50">
                  <Save className="w-4 h-4" />{saving ? "Saving…" : "Save"}
                </button>
                <button onClick={() => setEditing(false)}
                  className="flex items-center gap-1.5 px-4 py-2 border border-border text-text-secondary text-sm rounded-btn hover:bg-surface-secondary">
                  <X className="w-4 h-4" />Cancel
                </button>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex items-start justify-between">
                <h1 className="text-2xl font-bold">{app.job_title}</h1>
                <div className="flex items-center gap-1 shrink-0 ml-4">
                  <button onClick={startEditing}
                    className="flex items-center gap-1 px-2.5 py-1 text-xs text-text-secondary border border-border rounded-btn hover:bg-surface-secondary">
                    <Pencil className="w-3 h-3" />Edit
                  </button>
                  <button onClick={() => setDeleteOpen(true)}
                    className="flex items-center gap-1 px-2.5 py-1 text-xs text-red-600 border border-red-200 rounded-btn hover:bg-red-50">
                    <Trash2 className="w-3 h-3" />Delete
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-4 mt-2 text-text-secondary">
                <span className="flex items-center gap-1"><Building2 className="w-4 h-4" />{app.company}</span>
                {app.location && <span className="flex items-center gap-1"><MapPin className="w-4 h-4" />{app.location}</span>}
                {app.salary_expectation ? (
                  <span className="flex items-center gap-1"><DollarSign className="w-4 h-4" />{app.salary_expectation.toLocaleString()} {app.salary_currency}</span>
                ) : null}
              </div>
              <div className="flex gap-2 mt-3 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full text-sm font-medium capitalize" style={getStageStyle(app.stage as string)}>
                  {getStageLabel(app.stage as string)}
                </span>
                {app.match_score != null && (
                  <span className="px-2.5 py-0.5 bg-green-50 text-green-700 rounded-tag text-sm font-medium">
                    Match: {app.match_score}%
                  </span>
                )}
                {app.tags.map((t) => (
                  <span key={t} className="px-2.5 py-0.5 bg-surface-secondary text-text-secondary rounded-tag text-sm">{t}</span>
                ))}
              </div>
              {app.notes && <p className="mt-4 text-sm text-text-secondary p-3 bg-surface-secondary rounded-btn whitespace-pre-wrap">{app.notes}</p>}
            </div>
          )}
      </div>

      {/* Timeline */}
      <div className="bg-white rounded-card border border-border shadow-card p-6 mb-6">
        <h2 className="font-semibold mb-4">Timeline ({app.timeline.length})</h2>
        {app.timeline.length === 0 ? (
          <p className="text-sm text-text-muted">No events yet.</p>
        ) : (
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {[...app.timeline].reverse().map((e, i) => (
              <div key={i} className="flex gap-3">
                <Clock className="w-4 h-4 text-text-muted mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium">{formatEvent(e.event)}</p>
                  <p className="text-xs text-text-muted">{format(new Date(e.date), "MMM d, yyyy h:mm a")}</p>
                  {e.detail && <p className="text-xs text-text-secondary mt-0.5">{e.detail}</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Communication Log */}
      <div className="bg-white rounded-card border border-border shadow-card p-6 mb-6">
        <h2 className="font-semibold mb-4">Communication Log</h2>
        <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
          {app.communication_log.length === 0 && <p className="text-sm text-text-muted">No communications logged.</p>}
          {app.communication_log.map((c, i) => (
            <div key={i} className="p-3 bg-surface-secondary rounded-btn">
              <p className="text-xs text-text-muted mb-1">
                {format(new Date(c.date), "MMM d, yyyy")} · {c.raw_content ? "Email" : c.channel}
              </p>
              <p className="text-sm">{c.summary}</p>
            </div>
          ))}
        </div>
        {/* Add new log */}
        <div className="flex gap-2">
          <select value={commChannel} onChange={(e) => setCommChannel(e.target.value)} className="border rounded-btn px-2 text-sm">
            <option value="email">Email</option>
            <option value="phone">Phone</option>
            <option value="linkedin">LinkedIn</option>
            <option value="in_person">In Person</option>
          </select>
          <input
            value={commSummary}
            onChange={(e) => setCommSummary(e.target.value)}
            placeholder="Add a note…"
            className="flex-1 border rounded-btn px-3 py-2 text-sm"
            onKeyDown={(e) => e.key === "Enter" && addCommunication()}
          />
          <button onClick={addCommunication} className="px-4 py-2 bg-brand-900 text-white text-sm rounded-btn hover:bg-brand-800">
            Add
          </button>
        </div>
      </div>
      <ConfirmDialog
        open={deleteOpen}
        title="Delete Application"
        message="Are you sure you want to delete this application? All tracking data, timeline events, and communication logs will be permanently removed."
        onConfirm={handleDelete}
        onCancel={() => setDeleteOpen(false)}
      />
    </div>
  );
}
