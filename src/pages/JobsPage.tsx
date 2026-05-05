import { useEffect, useState } from "react";
import { useStore } from "@/store";
import { jobsApi } from "@/api/client";
import type { JobCreate } from "@/types";
import { Briefcase, MapPin, Globe, Plus, X } from "lucide-react";

export function JobsPage() {
  const { jobs, fetchJobs } = useStore();
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState<JobCreate>({
    title: "",
    company: "",
    description: "",
    location: "",
    remote: false,
    salary_range: "",
    source_url: "",
    tags: [],
  });
  const [tagInput, setTagInput] = useState("");

  useEffect(() => { fetchJobs(); }, [fetchJobs]);

  async function handleCreate() {
    if (!form.title || !form.company) return;
    await jobsApi.create(form);
    setShowCreate(false);
    setForm({ title: "", company: "", description: "", location: "", remote: false, salary_range: "", source_url: "", tags: [] });
    fetchJobs();
  }

  function addTag() {
    const t = tagInput.trim();
    if (t && !form.tags?.includes(t)) setForm((f) => ({ ...f, tags: [...(f.tags || []), t] }));
    setTagInput("");
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Jobs</h1>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white text-sm font-medium rounded-lg hover:bg-brand-700"
        >
          <Plus className="w-4 h-4" /> Add Job
        </button>
      </div>

      {jobs.length === 0 && !showCreate ? (
        <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-300">
          <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No saved jobs yet.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {jobs.map((j) => (
            <div key={j.id} className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">{j.title}</h3>
                  <p className="text-sm text-gray-500 flex items-center gap-3 mt-1">
                    <span className="flex items-center gap-1"><Briefcase className="w-3.5 h-3.5" />{j.company}</span>
                    {j.location && <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{j.location}</span>}
                    {j.remote && <span className="flex items-center gap-1"><Globe className="w-3.5 h-3.5" />Remote</span>}
                  </p>
                  {j.description && (
                    <p className="text-sm text-gray-400 mt-1 line-clamp-2">{j.description}</p>
                  )}
                </div>
                <span className="text-xs px-2.5 py-0.5 bg-gray-100 rounded-full capitalize">{j.status}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 relative max-h-[90vh] overflow-y-auto">
            <button onClick={() => setShowCreate(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-bold mb-4">Add Job</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Title *</label>
                  <input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} className="w-full border rounded-lg px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Company *</label>
                  <input value={form.company} onChange={(e) => setForm((f) => ({ ...f, company: e.target.value }))} className="w-full border rounded-lg px-3 py-2 text-sm" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Location</label>
                  <input value={form.location || ""} onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))} className="w-full border rounded-lg px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Salary Range</label>
                  <input value={form.salary_range || ""} onChange={(e) => setForm((f) => ({ ...f, salary_range: e.target.value }))} className="w-full border rounded-lg px-3 py-2 text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Source URL</label>
                <input value={form.source_url || ""} onChange={(e) => setForm((f) => ({ ...f, source_url: e.target.value }))} className="w-full border rounded-lg px-3 py-2 text-sm" />
              </div>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={form.remote || false} onChange={(e) => setForm((f) => ({ ...f, remote: e.target.checked }))} />
                <span className="text-sm">Remote</span>
              </label>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea value={form.description || ""} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} rows={4} className="w-full border rounded-lg px-3 py-2 text-sm" />
              </div>
              <div className="flex gap-2">
                <input value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())} placeholder="Add tag" className="flex-1 border rounded-lg px-3 py-2 text-sm" />
                <button type="button" onClick={addTag} className="px-3 py-2 bg-gray-100 rounded-lg text-sm">Add</button>
              </div>
              <div className="flex gap-3 justify-end">
                <button onClick={() => setShowCreate(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
                <button onClick={handleCreate} className="px-4 py-2 bg-brand-600 text-white text-sm font-medium rounded-lg hover:bg-brand-700">Add</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
