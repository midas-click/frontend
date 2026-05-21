import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { useEffect, useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { jobsApi } from "@/api/client";
import type { Job } from "@/types";
import { Building2, MapPin, Globe, Banknote, ExternalLink, ArrowLeft, Trash2, Pencil, X, Save, Briefcase } from "lucide-react";
import { format } from "date-fns";
import { ApplicationCreateModal } from "@/components/application/ApplicationCreateModal";

export function JobDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { userId, orgId, orgRole } = useAuth();
  const [job, setJob] = useState<Job | null>(null);
  const [editing, setEditing] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [showCreateApp, setShowCreateApp] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: "", company: "", location: "", remote: false,
    salary_range: "", source_url: "",
    description: "", tags: "",
  });

  useEffect(() => {
    if (id) jobsApi.get(id).then(setJob).catch(() => {
      jobsApi.list().then((jobs) => setJob(jobs.find((j: Job) => j.id === id) || null));
    });
  }, [id]);

  function startEdit() {
    if (!job) return;
    setForm({
      title: job.title, company: job.company, location: job.location || "",
      remote: job.remote || false, salary_range: job.salary_range || "",
      source_url: job.source_url || "",
      description: job.description || "",
      tags: (job.tags || []).join(", "),
    });
    setEditing(true);
  }

  async function saveEdit() {
    if (!id) return;
    setSaving(true);
    try {
      const tg = form.tags ? form.tags.split(",").map((t: string) => t.trim()).filter(Boolean) : [];
      const updated = await jobsApi.update(id, {
        title: form.title, company: form.company,
        location: form.location || null, remote: form.remote,
        salary_range: form.salary_range || null, source_url: form.source_url || null,
        description: form.description || null,
        tags: tg,
      });
      setJob(updated);
      setEditing(false);
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  }

  async function handleDelete() {
    if (!id) return;
    await jobsApi.delete(id);
    navigate("/jobs");
  }

  if (!job) return <p className="text-text-secondary">Loading…</p>;

  // User can manage if they own the job, or are an admin in the job's organization
  const canManage =
    (userId && job.user_id === userId) ||
    (orgId && orgRole === "org:admin" && job.org_id === orgId);

  return (
    <div>
      <Link to="/jobs" className="inline-flex items-center gap-1 text-sm text-text-secondary hover:text-gray-700 mb-4">
        <ArrowLeft className="w-4 h-4" /> Back to Jobs
      </Link>

      <div className="bg-white rounded-card border border-border shadow-card p-6 mb-6">
        {editing ? (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">Title</label>
                <input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  className="w-full border rounded-btn px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">Company</label>
                <input value={form.company} onChange={(e) => setForm((f) => ({ ...f, company: e.target.value }))}
                  className="w-full border rounded-btn px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">Location</label>
                <input value={form.location} onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
                  className="w-full border rounded-btn px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">Salary Range</label>
                <input value={form.salary_range} onChange={(e) => setForm((f) => ({ ...f, salary_range: e.target.value }))}
                  className="w-full border rounded-btn px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">Source URL</label>
                <input value={form.source_url} onChange={(e) => setForm((f) => ({ ...f, source_url: e.target.value }))}
                  className="w-full border rounded-btn px-3 py-2 text-sm" />
              </div>
              <label className="flex justify-center items-center gap-2 text-sm mt-3">
                <input type="checkbox" checked={form.remote} onChange={(e) => setForm((f) => ({ ...f, remote: e.target.checked }))} />
                Remote
              </label>
            </div>
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Tags (comma-separated)</label>
              <input value={form.tags} onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))}
                className="w-full border rounded-btn px-3 py-2 text-sm" placeholder="Python, fintech, senior…" />
            </div>
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Description</label>
              <textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                rows={6} className="w-full border rounded-btn px-3 py-2 text-sm" />
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
          <>
            <div className="flex items-start justify-between">
              <h1 className="text-2xl font-bold">{job.title}</h1>
              <div className="flex items-center gap-1 shrink-0 ml-4">
                <button
                  onClick={() => setShowCreateApp(true)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs bg-brand-900 text-white font-medium rounded-btn hover:bg-brand-800"
                >
                  <Briefcase className="w-3 h-3" />Apply
                </button>
                {canManage && (
                  <>
                    <button onClick={startEdit}
                      className="flex items-center gap-1 px-2.5 py-1 text-xs text-text-secondary border border-border rounded-btn hover:bg-surface-secondary">
                      <Pencil className="w-3 h-3" />
                    </button>
                    <button onClick={() => setDeleteOpen(true)}
                      className="flex items-center gap-1 px-2.5 py-1 text-xs text-red-600 border border-red-200 rounded-btn hover:bg-red-50">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </>
                )}
              </div>
            </div>
            <div className="flex items-center gap-4 mt-2 text-text-secondary flex-wrap">
              <span className="flex items-center gap-1"><Building2 className="w-4 h-4" />{job.company}</span>
              {job.location && <span className="flex items-center gap-1"><MapPin className="w-4 h-4" />{job.location}</span>}
              {job.remote && <span className="flex items-center gap-1"><Globe className="w-4 h-4" />Remote</span>}
              {job.salary_range && <span className="flex items-center gap-1"><Banknote className="w-4 h-4" />{job.salary_range}</span>}
              {job.source_url && (
                <a href={job.source_url} target="_blank" rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-0 py-1 rounded-btn text-xs font-medium text-blue-600 hover:text-blue-700 hover:underline">
                  <ExternalLink className="w-3 h-3" />Job Posting
                </a>
              )}
            </div>
            {job.tags.length > 0 && (
              <div className="flex gap-2 mt-4 flex-wrap">
                {job.tags.map((t) => (
                  <span key={t} className="px-2.5 py-0.5 bg-brand-50 text-brand-600 rounded-tag text-xs font-medium">{t}</span>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {!editing && job.description && (
        <div className="bg-white rounded-card border border-border shadow-card p-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold">Raw Job Text</h2>
            <span className="text-xs text-text-muted">Reference only</span>
          </div>
          <div className="h-80 overflow-y-scroll rounded-btn border border-border bg-surface-secondary px-4 py-3 text-sm text-text-secondary whitespace-pre-wrap leading-relaxed">
            {job.description}
          </div>
        </div>
      )}

      <p className="text-xs text-text-muted mt-4">
        Added {format(new Date(job.created_at), "MMM d, yyyy")} · Author: {job.org_name}
      </p>
      <ConfirmDialog
        open={deleteOpen}
        title="Delete Job"
        message="Are you sure you want to delete this job? All tags and description will be permanently removed."
        onConfirm={handleDelete}
        onCancel={() => setDeleteOpen(false)}
      />

      {showCreateApp && (
        <ApplicationCreateModal
          preSelectedJob={job}
          onClose={() => setShowCreateApp(false)}
          onCreated={() => {
            setShowCreateApp(false);
            navigate("/kanban");
          }}
        />
      )}
    </div>
  );
}
