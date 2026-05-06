import { useState, useEffect } from "react";
import { useStore } from "@/store";
import { jobsApi } from "@/api/client";
import type { Job } from "@/types";
import { X, Search, Briefcase, FileText } from "lucide-react";

function getFirstColumnId(): string {
  try {
    const raw = localStorage.getItem("midas-kanban-columns");
    if (raw) {
      const cols = JSON.parse(raw);
      if (cols.length > 0) return cols[0].id;
    }
  } catch {}
  return "applied";
}

interface Props {
  onClose: () => void;
  onCreated: () => void;
}

export function ApplicationCreateModal({ onClose, onCreated }: Props) {
  const { createApplication, resumes, fetchResumes } = useStore();
  const [saving, setSaving] = useState(false);

  // Job search
  const [jobSearch, setJobSearch] = useState("");
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [showJobDropdown, setShowJobDropdown] = useState(false);

  // Manual fields (only used when no job attached)
  const [manualTitle, setManualTitle] = useState("");
  const [manualCompany, setManualCompany] = useState("");

  // Common fields
  const [recruiterName, setRecruiterName] = useState("");
  const [salary, setSalary] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [notes, setNotes] = useState("");
  const [resumeIds, setResumeIds] = useState<string[]>([]);

  useEffect(() => {
    fetchResumes();
    jobsApi.list().then(setJobs);
  }, []);

  useEffect(() => {
    if (jobSearch.trim().length >= 2) {
      jobsApi.list({ search: jobSearch }).then(setJobs);
    }
    setShowJobDropdown(!!jobSearch.trim());
  }, [jobSearch]);

  function selectJob(job: Job) {
    setSelectedJob(job);
    setJobSearch("");
    setShowJobDropdown(false);
    setTags((prev) => [...new Set([...prev, ...job.tags])]);
    if (!notes) setNotes(job.description || "");
  }

  function clearJob() {
    setSelectedJob(null);
  }

  function toggleResume(id: string) {
    setResumeIds((prev) => prev.includes(id) ? [] : [id]);
  }

  function addTag() {
    const t = tagInput.trim();
    if (t && !tags.includes(t)) setTags((prev) => [...prev, t]);
    setTagInput("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const title = selectedJob?.title || manualTitle.trim();
    const company = selectedJob?.company || manualCompany.trim();
    if (!title || !company) return;
    setSaving(true);
    try {
      await createApplication({
        job_title: title,
        company,
        stage: getFirstColumnId(),
        role: selectedJob ? "" : "",
        location: selectedJob?.location || "",
        salary_expectation: salary ? Number(salary) : undefined,
        recruiter_name: recruiterName || undefined,
        tags,
        notes: notes || undefined,
        resume_ids: resumeIds.length > 0 ? resumeIds : undefined,
      });
      onCreated();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  const filteredJobs = jobSearch.trim()
    ? jobs.filter((j) =>
        j.title.toLowerCase().includes(jobSearch.toLowerCase()) ||
        j.company.toLowerCase().includes(jobSearch.toLowerCase()),
      )
    : jobs.slice(0, 10);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 relative max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
          <X className="w-5 h-5" />
        </button>
        <h2 className="text-lg font-bold mb-4">New Application</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Attach Job */}
          <div>
            <label className="block text-sm font-medium mb-1">
              <Briefcase className="w-3.5 h-3.5 inline mr-1" />Attach Job
            </label>
            {selectedJob ? (
              <div className="flex items-center justify-between p-3 bg-brand-50 border border-brand-200 rounded-lg">
                <div>
                  <p className="text-sm font-medium">{selectedJob.title}</p>
                  <p className="text-xs text-gray-500">{selectedJob.company}{selectedJob.location ? ` · ${selectedJob.location}` : ""}</p>
                </div>
                <button type="button" onClick={clearJob} className="text-gray-400 hover:text-red-500"><X className="w-4 h-4" /></button>
              </div>
            ) : (
              <div className="relative">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                <input
                  value={jobSearch}
                  onChange={(e) => setJobSearch(e.target.value)}
                  onFocus={() => setShowJobDropdown(true)}
                  onBlur={() => setTimeout(() => setShowJobDropdown(false), 200)}
                  placeholder="Search saved jobs…"
                  className="w-full border rounded-lg pl-9 pr-3 py-2 text-sm"
                />
                {showJobDropdown && filteredJobs.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-48 overflow-y-auto">
                    {filteredJobs.map((j) => (
                      <button
                        key={j.id}
                        type="button"
                        onMouseDown={() => selectJob(j)}
                        className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center justify-between"
                      >
                        <span>{j.title} <span className="text-gray-400">@ {j.company}</span></span>
                        <span className="text-xs text-gray-300">{j.location}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Manual entry (only if no job attached) */}
          {!selectedJob && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">Job Title *</label>
                <input required value={manualTitle} onChange={(e) => setManualTitle(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Company *</label>
                <input required value={manualCompany} onChange={(e) => setManualCompany(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-sm" />
              </div>
            </div>
          )}

          {/* Common fields */}
          <div>
            <label className="block text-sm font-medium mb-1">Recruiter Name</label>
            <input value={recruiterName} onChange={(e) => setRecruiterName(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Salary Expectation (USD)</label>
            <input type="number" value={salary} onChange={(e) => setSalary(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm" />
          </div>

          {/* Attach Resume */}
          {resumes.length > 0 && (
            <div>
              <label className="block text-sm font-medium mb-1">
                <FileText className="w-3.5 h-3.5 inline mr-1" />Attach Resume
              </label>
              <div className="flex gap-2 flex-wrap">
                {resumes.map((r) => (
                  <button key={r.id} type="button" onClick={() => toggleResume(r.id)}
                    className={`px-2.5 py-1 rounded-full text-xs border transition-colors ${
                      resumeIds.includes(r.id)
                        ? "bg-brand-50 border-brand-300 text-brand-700"
                        : "bg-white border-gray-200 text-gray-500 hover:border-gray-300"
                    }`}
                  >
                    {r.original_filename}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium mb-1">Tags</label>
            <div className="flex gap-2">
              <input value={tagInput} onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                placeholder="e.g. react, healthtech"
                className="flex-1 border rounded-lg px-3 py-2 text-sm" />
              <button type="button" onClick={addTag} className="px-3 py-2 bg-gray-100 rounded-lg text-sm">Add</button>
            </div>
            {tags.length > 0 && (
              <div className="flex gap-1 mt-2 flex-wrap">
                {tags.map((t) => (
                  <span key={t} className="flex items-center gap-1 px-2 py-0.5 bg-brand-50 text-brand-700 rounded text-xs">
                    {t}
                    <button type="button" onClick={() => setTags((prev) => prev.filter((x) => x !== t))}>×</button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium mb-1">Notes</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)}
              rows={3} className="w-full border rounded-lg px-3 py-2 text-sm" />
          </div>

          <div className="flex gap-3 justify-end pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
            <button type="submit" disabled={saving || (!selectedJob && (!manualTitle || !manualCompany))}
              className="px-4 py-2 bg-brand-600 text-white text-sm font-medium rounded-lg hover:bg-brand-700 disabled:opacity-50">
              {saving ? "Saving…" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
