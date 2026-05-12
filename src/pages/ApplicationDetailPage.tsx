import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation, Link } from "react-router-dom";
import { applicationsApi, resumesApi } from "@/api/client";
import { Application } from "@/types";
import { Building2, MapPin, Clock, DollarSign, Pencil, Trash2, X, Save, ArrowLeft, ExternalLink, FileText } from "lucide-react";
import { format } from "date-fns";
import { STAGES } from "@/lib/utils";
import { ConfirmDialog } from "@/components/ConfirmDialog";

export function ApplicationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [app, setApp] = useState<Application | null>(null);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editForm, setEditForm] = useState({ job_title: "", company: "", location: "", salary_expectation: "", notes: "", tags: "" });
  const [commSummary, setCommSummary] = useState("");
  const [commChannel, setCommChannel] = useState("email");
  const [resumeGone, setResumeGone] = useState(false);
  const location = useLocation();

  useEffect(() => {
    if (id) applicationsApi.get(id).then(setApp).catch(console.error);
  }, [id]);

  useEffect(() => {
    if (app?.resume_id) {
      setResumeGone(false);
      resumesApi.get(app.resume_id).catch(() => setResumeGone(true));
    }
  }, [app?.resume_id]);

  function startEditing() {
    if (!app) return;
    setEditForm({
      job_title: app.job_title, company: app.company,
      location: app.location || "", salary_expectation: app.salary_expectation || "",
      notes: app.notes || "", tags: app.tags.join(", "),
    });
    setEditing(true);
  }

  async function saveEdit() {
    if (!id || !app) return;
    setSaving(true);
    try {
      const updated = await applicationsApi.update(id, {
        job_title: editForm.job_title, company: editForm.company,
        location: editForm.location || null,
        salary_expectation: editForm.salary_expectation || null,
        notes: editForm.notes || null,
        tags: editForm.tags ? editForm.tags.split(",").map(t => t.trim()).filter(Boolean) : [],
      });
      setApp(updated); setEditing(false);
    } catch (err) { console.error(err); }
    finally { setSaving(false); }
  }

  async function addCommunication() {
    if (!id || !commSummary.trim()) return;
    await applicationsApi.addCommunication(id, { channel: commChannel, summary: commSummary });
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

  const from = (location.state as any)?.from;
  const backTo = from === "kanban" ? "/kanban" : "/applications";
  const backLabel = backTo === "/kanban" ? "Back to Kanban" : "Back to Applicants";

  return (
    <div className="max-w-3xl">
      <Link to={backTo} className="inline-flex items-center gap-1 text-sm text-text-secondary hover:text-text-primary mb-4">
        <ArrowLeft className="w-4 h-4" /> {backLabel}
      </Link>

      {/* Header */}
      <div className="bg-white rounded-card border border-border shadow-card p-6 mb-6">
        {editing ? (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">Job Title</label>
                <input value={editForm.job_title} onChange={e => setEditForm(f => ({ ...f, job_title: e.target.value }))} className="w-full border rounded-btn px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">Company</label>
                <input value={editForm.company} onChange={e => setEditForm(f => ({ ...f, company: e.target.value }))} className="w-full border rounded-btn px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">Location</label>
                <input value={editForm.location} onChange={e => setEditForm(f => ({ ...f, location: e.target.value }))} className="w-full border rounded-btn px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">Salary</label>
                <input type="text" value={editForm.salary_expectation} onChange={e => setEditForm(f => ({ ...f, salary_expectation: e.target.value }))} placeholder="e.g. $120k or Competitive" className="w-full border rounded-btn px-3 py-2 text-sm" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Notes</label>
              <textarea value={editForm.notes} onChange={e => setEditForm(f => ({ ...f, notes: e.target.value }))} className="w-full border rounded-btn px-3 py-2 text-sm" rows={3} />
            </div>
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Tags (comma-separated)</label>
              <input value={editForm.tags} onChange={e => setEditForm(f => ({ ...f, tags: e.target.value }))} className="w-full border rounded-btn px-3 py-2 text-sm" placeholder="react, remote, healthtech" />
            </div>
            <div className="flex gap-2 pt-2">
              <button onClick={saveEdit} disabled={saving} className="flex items-center gap-1.5 px-4 py-2 bg-brand-900 text-white text-sm rounded-btn hover:bg-brand-800 disabled:opacity-50">
                <Save className="w-4 h-4" />{saving ? "Saving…" : "Save"}
              </button>
              <button onClick={() => setEditing(false)} className="flex items-center gap-1.5 px-4 py-2 border border-border text-text-secondary text-sm rounded-btn hover:bg-surface-secondary">
                <X className="w-4 h-4" />Cancel
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex items-start justify-between mb-3">
              <h1 className="text-2xl font-bold flex-1">{app.job_title}</h1>
              <div className="flex items-center gap-2 shrink-0 ml-4">
                <span className="px-2.5 py-0.5 rounded-full text-sm font-medium capitalize" style={{ backgroundColor: STAGES[app.stage as string]?.bg, color: STAGES[app.stage as string]?.text }}>{STAGES[app.stage as string]?.label || app.stage}</span>
                <button onClick={startEditing} className="p-1.5 text-text-muted hover:text-text-primary border border-border rounded-btn" title="Edit"><Pencil className="w-3.5 h-3.5" /></button>
                <button onClick={() => setDeleteOpen(true)} className="p-1.5 text-text-muted hover:text-red-500 border border-border rounded-btn" title="Delete"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            </div>
            <div className="flex items-center gap-4 text-text-secondary flex-wrap">
              <span className="flex items-center gap-1"><Building2 className="w-4 h-4" />{app.company}</span>
              {app.location && <span className="flex items-center gap-1"><MapPin className="w-4 h-4" />{app.location}</span>}
              {app.salary_expectation && <span className="flex items-center gap-1"><DollarSign className="w-4 h-4" />{app.salary_expectation}</span>}
              {app.source_url && (
                <a href={app.source_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 px-0 py-1 text-blue-600 rounded-btn text-xs font-medium hover:underline">
                  <ExternalLink className="w-3 h-3" />Job Posting
                </a>
              )}
              {app.resume_id && app.resume_filename && (
                resumeGone ? (
                  <span className="inline-flex items-center gap-1.5 px-0 py-1 text-text-secondary text-xs font-medium">
                    <FileText className="w-3 h-3" />{app.resume_filename}
                  </span>
                ) : (
                  <Link to={`/resumes/${app.resume_id}`} className="inline-flex items-center gap-1.5 px-0 py-1 text-blue-600 rounded-btn text-xs font-medium hover:underline">
                    <FileText className="w-3 h-3" />{app.resume_filename}
                  </Link>
                )
              )}
            </div>
            <div className="flex gap-2 mt-3 flex-wrap">
              {app.match_score != null && <span className="px-2.5 py-0.5 bg-green-50 text-green-700 rounded-tag text-sm font-medium">Match: {app.match_score}%</span>}
              {app.tags.map(t => <span key={t} className="px-2.5 py-0.5 bg-brand-50 text-brand-600 rounded-tag text-xs font-medium">{t}</span>)}
            </div>
            {app.notes && <p className="mt-4 text-sm text-text-secondary p-3 bg-surface-secondary rounded-btn whitespace-pre-wrap">{app.notes}</p>}
          </div>
        )}
      </div>

      {/* Timeline */}
      <div className="bg-white rounded-card border border-border shadow-card p-6 mb-6">
        <h2 className="font-semibold mb-4">Timeline ({app.timeline.length})</h2>
        {app.timeline.length === 0 ? <p className="text-sm text-text-muted">No events yet.</p> : (
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {[...app.timeline].reverse().map((e, i) => {
              const parts = e.event.split(/([a-z0-9_-]+)/gi);
              return (
                <div key={i} className="flex gap-3">
                  <Clock className="w-4 h-4 text-text-muted mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium">
                      {parts.map((part, j) => {
                        const s = STAGES[part];
                        return s ? (
                          <span key={j} className="inline-flex items-center px-1.5 py-0.5 mx-0.5 rounded-full text-xs font-medium" style={{ backgroundColor: s.bg, color: s.text }}>{s.label}</span>
                        ) : (
                          <span key={j}>{part}</span>
                        );
                      })}
                    </p>
                    <p className="text-xs text-text-muted">{format(new Date(e.date), "MMM d, yyyy h:mm a")}</p>
                    {e.detail && <p className="text-xs text-text-secondary mt-0.5">{e.detail}</p>}
                  </div>
                </div>
              );
            })}
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
              <p className="text-xs text-text-muted mb-1">{format(new Date(c.date), "MMM d, yyyy")} · {c.channel}</p>
              <p className="text-sm">{c.summary}</p>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <select value={commChannel} onChange={e => setCommChannel(e.target.value)} className="border rounded-btn px-2 text-sm">
            <option value="email">Email</option>
            <option value="phone">Phone</option>
            <option value="linkedin">LinkedIn</option>
            <option value="in_person">In Person</option>
          </select>
          <input value={commSummary} onChange={e => setCommSummary(e.target.value)} placeholder="Add a note…" className="flex-1 border rounded-btn px-3 py-2 text-sm" onKeyDown={e => e.key === "Enter" && addCommunication()} />
          <button onClick={addCommunication} className="px-4 py-2 bg-brand-900 text-white text-sm rounded-btn hover:bg-brand-800">Add</button>
        </div>
      </div>

      <ConfirmDialog open={deleteOpen} title="Delete Application" message="Are you sure you want to delete this application? All tracking data, timeline events, and communication logs will be permanently removed." onConfirm={handleDelete} onCancel={() => setDeleteOpen(false)} />
    </div>
  );
}
