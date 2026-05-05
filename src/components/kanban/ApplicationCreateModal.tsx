import { useState } from "react";
import { ApplicationCreate, ApplicationStage } from "@/types";
import { useStore } from "@/store";
import { X } from "lucide-react";

interface Props {
  onClose: () => void;
  onCreated: () => void;
}

export function ApplicationCreateModal({ onClose, onCreated }: Props) {
  const { createApplication, resumes } = useStore();
  const [form, setForm] = useState<ApplicationCreate>({
    job_title: "",
    company: "",
    role: "",
    location: "",
    salary_expectation: undefined,
    recruiter_name: "",
    tags: [],
    notes: "",
  });
  const [tagInput, setTagInput] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.job_title || !form.company) return;
    setSaving(true);
    try {
      await createApplication(form);
      onCreated();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  function addTag() {
    const t = tagInput.trim();
    if (t && !form.tags?.includes(t)) {
      setForm((f) => ({ ...f, tags: [...(f.tags || []), t] }));
    }
    setTagInput("");
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 relative max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
          <X className="w-5 h-5" />
        </button>
        <h2 className="text-lg font-bold mb-4">New Application</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">Job Title *</label>
              <input
                required
                value={form.job_title}
                onChange={(e) => setForm((f) => ({ ...f, job_title: e.target.value }))}
                className="w-full border rounded-lg px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Company *</label>
              <input
                required
                value={form.company}
                onChange={(e) => setForm((f) => ({ ...f, company: e.target.value }))}
                className="w-full border rounded-lg px-3 py-2 text-sm"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">Role</label>
              <input
                value={form.role || ""}
                onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
                className="w-full border rounded-lg px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Location</label>
              <input
                value={form.location || ""}
                onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
                className="w-full border rounded-lg px-3 py-2 text-sm"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Recruiter Name</label>
            <input
              value={form.recruiter_name || ""}
              onChange={(e) => setForm((f) => ({ ...f, recruiter_name: e.target.value }))}
              className="w-full border rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Salary Expectation (USD)</label>
            <input
              type="number"
              value={form.salary_expectation ?? ""}
              onChange={(e) =>
                setForm((f) => ({ ...f, salary_expectation: e.target.value ? Number(e.target.value) : undefined }))
              }
              className="w-full border rounded-lg px-3 py-2 text-sm"
            />
          </div>
          {/* Tags */}
          <div>
            <label className="block text-sm font-medium mb-1">Tags</label>
            <div className="flex gap-2">
              <input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                placeholder="e.g. react, healthtech"
                className="flex-1 border rounded-lg px-3 py-2 text-sm"
              />
              <button type="button" onClick={addTag} className="px-3 py-2 bg-gray-100 rounded-lg text-sm">
                Add
              </button>
            </div>
            {form.tags && form.tags.length > 0 && (
              <div className="flex gap-1 mt-2 flex-wrap">
                {form.tags.map((t) => (
                  <span key={t} className="flex items-center gap-1 px-2 py-0.5 bg-brand-50 text-brand-700 rounded text-xs">
                    {t}
                    <button type="button" onClick={() => setForm((f) => ({ ...f, tags: f.tags?.filter((x) => x !== t) }))}>
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Notes</label>
            <textarea
              value={form.notes || ""}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              rows={3}
              className="w-full border rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || !form.job_title || !form.company}
              className="px-4 py-2 bg-brand-600 text-white text-sm font-medium rounded-lg hover:bg-brand-700 disabled:opacity-50"
            >
              {saving ? "Saving…" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
