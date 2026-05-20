import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useStore } from "@/store";
import { jobsApi } from "@/api/client";
import type { Job, ResumeMatchScore } from "@/types";
import { STAGES } from "@/lib/utils";
import { X, Search, Briefcase, FileText, Upload, Loader2 } from "lucide-react";

interface Props {
  onClose: () => void;
  onCreated: () => void;
  preSelectedJob?: Job;
}

export function ApplicationCreateModal({ onClose, onCreated, preSelectedJob }: Props) {
  const navigate = useNavigate();
  const { createApplication, resumes, fetchResumes } = useStore();
  const [saving, setSaving] = useState(false);
  const [jobSearch, setJobSearch] = useState("");
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJob, setSelectedJob] = useState<Job | null>(preSelectedJob ?? null);
  const [showJobDropdown, setShowJobDropdown] = useState(false);
  const [resumeId, setResumeId] = useState<string | null>(null);
  const [matchScores, setMatchScores] = useState<Record<string, ResumeMatchScore>>({});
  const [loadingScores, setLoadingScores] = useState(false);

  useEffect(() => {
    fetchResumes();
    if (!preSelectedJob) jobsApi.list().then(setJobs);
  }, []);

  useEffect(() => {
    if (resumes.length > 0) {
      setResumeId(resumes[0].id);
    }
  }, [resumes]);

  useEffect(() => {
    if (jobSearch.trim().length >= 2) jobsApi.list({ search: jobSearch }).then(setJobs);
    setShowJobDropdown(!!jobSearch.trim());
  }, [jobSearch]);

  useEffect(() => {
    if (!selectedJob) {
      setMatchScores({});
      return;
    }
    setLoadingScores(true);
    jobsApi.resumeMatchScores(selectedJob.id)
      .then((scores) => {
        setMatchScores(Object.fromEntries(scores.map((score) => [score.resume_id, score])));
      })
      .catch((err) => {
        console.error(err);
        setMatchScores({});
      })
      .finally(() => setLoadingScores(false));
  }, [selectedJob]);

  useEffect(() => {
    const bestResume = resumes
      .map((resume) => ({
        id: resume.id,
        score: matchScores[resume.id]?.match_score,
      }))
      .filter((item): item is { id: string; score: number } => typeof item.score === "number")
      .sort((a, b) => b.score - a.score)[0];

    if (bestResume) {
      setResumeId(bestResume.id);
    }
  }, [matchScores, resumes]);

  function selectJob(job: Job) {
    setSelectedJob(job);
    setJobSearch("");
    setShowJobDropdown(false);
  }

  function toggleResume(id: string) {
    setResumeId((prev) => prev === id ? null : id);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedJob || !resumeId) return;
    setSaving(true);
    try {
      const selectedMatch = matchScores[resumeId];
      await createApplication({
        job_id: selectedJob.id,
        job_title: selectedJob.title,
        company: selectedJob.company,
        stage: Object.keys(STAGES)[0],
        location: selectedJob.location || "",
        source_url: selectedJob.source_url || undefined,
        salary_expectation: selectedJob.salary_range || undefined,
        tags: selectedJob.tags,
        notes: selectedJob.description || undefined,
        resume_id: resumeId,
        match_score: selectedMatch?.match_score ?? undefined,
        match_explanation: selectedMatch?.match_explanation ?? undefined,
      });
      onCreated();
    } catch (err) { console.error(err); }
    finally { setSaving(false); }
  }

  const filteredJobs = jobSearch.trim()
    ? jobs.filter((j) => j.title.toLowerCase().includes(jobSearch.toLowerCase()) || j.company.toLowerCase().includes(jobSearch.toLowerCase()))
    : jobs.slice(0, 10);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
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

          {/* Attach Resume (required) */}
          <div>
            <label className="flex items-center gap-1 text-sm font-medium mb-1">
              <FileText className="w-3.5 h-3.5" />
              <span>Attach Resume <span className="text-red-500">*</span></span>
              {loadingScores && (
                <span className="ml-auto inline-flex items-center gap-1 text-xs font-medium text-green-700">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Calculating
                </span>
              )}
            </label>
            {resumes.length > 0 ? (
              <div className="flex gap-2 flex-wrap">
                {resumes.map((r) => (
                  <button key={r.id} type="button" onClick={() => toggleResume(r.id)}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-tag text-xs border transition-colors text-left ${
                      resumeId === r.id ? "bg-brand-50 border-brand-300 text-brand-600" : "bg-white border-border text-text-secondary"
                    }`}>
                    <span>{r.original_filename}</span>
                    {selectedJob && loadingScores && (
                      <span className="h-4 w-12 rounded-tag bg-green-50 animate-pulse" />
                    )}
                    {selectedJob && !loadingScores && (
                      <span
                        className={`rounded-tag px-1.5 py-0.5 font-semibold ${
                          matchScores[r.id]?.match_score == null
                            ? "bg-surface-secondary text-text-muted"
                            : "bg-green-50 text-green-700"
                        }`}
                      >
                        {matchScores[r.id]?.match_score == null
                          ? "No score"
                          : `${matchScores[r.id]?.match_score}%`}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            ) : (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-btn">
                <p className="text-sm text-amber-700 mb-2">No resumes uploaded yet. A resume is required to create an application.</p>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    navigate("/resumes");
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 text-white text-sm font-medium rounded-btn hover:bg-amber-700 transition-colors"
                >
                  <Upload className="w-4 h-4" />
                  Upload a Resume
                </button>
              </div>
            )}
          </div>

          <div className="flex gap-3 justify-end pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-text-secondary hover:bg-surface-secondary rounded-btn">Cancel</button>
            <button type="submit" disabled={saving || !selectedJob || !resumeId}
              className="px-4 py-2 bg-brand-900 text-white text-sm font-medium rounded-btn hover:bg-brand-800 disabled:opacity-50">
              {saving ? "Creating…" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
