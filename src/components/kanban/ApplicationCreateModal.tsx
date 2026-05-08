import { useState, useEffect } from "react";
import { useStore } from "@/store";
import { jobsApi } from "@/api/client";
import type { Job } from "@/types";
import { X, Search, Briefcase, FileText } from "lucide-react";
import { loadColumns } from "@/lib/utils";

function getFirstColumnId(): string {
  const cols = loadColumns();
  return cols.length > 0 ? cols[0].id : "applied";
}

interface Props {
  onClose: () => void;
  onCreated: () => void;
}

export function ApplicationCreateModal({ onClose, onCreated }: Props) {
  const { createApplication, resumes, fetchResumes } = useStore();
  const [saving, setSaving] = useState(false);
  const [jobSearch, setJobSearch] = useState("");
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [showJobDropdown, setShowJobDropdown] = useState(false);
  const [resumeIds, setResumeIds] = useState<string[]>([]);

  useEffect(() => {
    fetchResumes();
    jobsApi.list().then(setJobs);
  }, []);

  useEffect(() => {
    if (jobSearch.trim().length >= 2) jobsApi.list({ search: jobSearch }).then(setJobs);
    setShowJobDropdown(!!jobSearch.trim());
  }, [jobSearch]);

  function selectJob(job: Job) {
    setSelectedJob(job);
    setJobSearch("");
    setShowJobDropdown(false);
  }

  function toggleResume(id: string) {
    setResumeIds((prev) => prev.includes(id) ? [] : [id]);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedJob) return;
    setSaving(true);
    try {
      await createApplication({
        job_id: selectedJob.id,
        job_title: selectedJob.title,
        company: selectedJob.company,
        stage: getFirstColumnId(),
        location: selectedJob.location || "",
        salary_expectation: selectedJob.salary_range || undefined,
        tags: selectedJob.tags,
        notes: selectedJob.description || undefined,
        resume_ids: resumeIds.length > 0 ? resumeIds : undefined,
      });
      onCreated();
    } catch (err) { console.error(err); }
    finally { setSaving(false); }
  }

  const filteredJobs = jobSearch.trim()
    ? jobs.filter((j) => j.title.toLowerCase().includes(jobSearch.toLowerCase()) || j.company.toLowerCase().includes(jobSearch.toLowerCase()))
    : jobs.slice(0, 10);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-card shadow-xl w-full max-w-md p-6 relative" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-text-muted hover:text-text-secondary">
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
              <div className="flex items-center justify-between p-3 bg-brand-50 border border-brand-200 rounded-btn">
                <div>
                  <p className="text-sm font-medium">{selectedJob.title}</p>
                  <p className="text-xs text-text-secondary">{selectedJob.company}{selectedJob.location ? ` · ${selectedJob.location}` : ""}{selectedJob.salary_range ? ` · ${selectedJob.salary_range}` : ""}</p>
                </div>
                <button type="button" onClick={() => setSelectedJob(null)} className="text-text-muted hover:text-red-500"><X className="w-4 h-4" /></button>
              </div>
            ) : (
              <div className="relative">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-text-muted" />
                <input value={jobSearch} onChange={e => setJobSearch(e.target.value)}
                  onFocus={() => setShowJobDropdown(true)} onBlur={() => setTimeout(() => setShowJobDropdown(false), 200)}
                  placeholder="Search saved jobs…" className="w-full border rounded-btn pl-9 pr-3 py-2 text-sm" />
                {showJobDropdown && filteredJobs.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border rounded-btn shadow-lg max-h-48 overflow-y-auto">
                    {filteredJobs.map((j) => (
                      <button key={j.id} type="button" onMouseDown={() => selectJob(j)}
                        className="w-full text-left px-3 py-2 text-sm hover:bg-surface-secondary flex items-center justify-between">
                        <span>{j.title} <span className="text-text-muted">@ {j.company}</span></span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
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
                    className={`px-2.5 py-1 rounded-tag text-xs border transition-colors ${
                      resumeIds.includes(r.id) ? "bg-brand-50 border-brand-300 text-brand-600" : "bg-white border-border text-text-secondary"
                    }`}>
                    {r.original_filename}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-3 justify-end pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-text-secondary hover:bg-surface-secondary rounded-btn">Cancel</button>
            <button type="submit" disabled={saving || !selectedJob}
              className="px-4 py-2 bg-brand-900 text-white text-sm font-medium rounded-btn hover:bg-brand-800 disabled:opacity-50">
              {saving ? "Creating…" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
