import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { resumesApi, tailoringApi, jobsApi } from "@/api/client";
import type { Resume, TailorResponse, Job } from "@/types";
import { Wand2, AlertTriangle, CheckCircle, Search, FileText, Code2, BookOpen } from "lucide-react";

type TailorMode = "job" | "description" | "keywords";

export function ResumeTailorPage() {
  const { resumeId } = useParams<{ resumeId: string }>();
  const navigate = useNavigate();
  const [resume, setResume] = useState<Resume | null>(null);
  const [mode, setMode] = useState<TailorMode>("description");

  // Mode: job
  const [jobSearch, setJobSearch] = useState("");
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [showJobDropdown, setShowJobDropdown] = useState(false);

  // Mode: description
  const [jobDescription, setJobDescription] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [company, setCompany] = useState("");

  // Mode: keywords
  const [keywords, setKeywords] = useState("");

  // Results
  const [result, setResult] = useState<TailorResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (resumeId) resumesApi.get(resumeId).then(setResume).catch(console.error);
  }, [resumeId]);

  useEffect(() => {
    if (jobSearch.trim().length >= 2) {
      jobsApi.list({ search: jobSearch }).then(setJobs);
      setShowJobDropdown(true);
    } else {
      setJobs([]);
      setShowJobDropdown(false);
    }
  }, [jobSearch]);

  function selectJob(job: Job) {
    setSelectedJob(job);
    setJobSearch(`${job.title} @ ${job.company}`);
    setShowJobDropdown(false);
  }

  async function handleTailor() {
    if (!resumeId) return;
    setLoading(true);
    setError("");
    try {
      const payload: any = { resume_id: resumeId, mode };

      if (mode === "job" && selectedJob) {
        payload.job_id = selectedJob.id;
      } else if (mode === "description") {
        payload.job_description = jobDescription;
        payload.job_title = jobTitle || undefined;
        payload.company = company || undefined;
      } else if (mode === "keywords") {
        payload.keywords = keywords;
        payload.job_title = jobTitle || undefined;
        payload.company = company || undefined;
      }

      const res = await tailoringApi.tailor(payload);
      setResult(res);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  if (!resume) return <p className="text-gray-500">Loading…</p>;

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold mb-2">Tailor Resume</h1>
      <p className="text-gray-500 text-sm mb-6">
        Tailoring <span className="font-medium">{resume.original_filename}</span> (v{resume.version})
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Inputs */}
        <div className="space-y-4">
          {/* Mode Tabs */}
          <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
            {([
              ["description", BookOpen, "Job Desc"],
              ["job", Search, "Saved Job"],
              ["keywords", Code2, "Tech Stack"],
            ] as const).map(([key, Icon, label]) => (
              <button
                key={key}
                onClick={() => setMode(key)}
                className={`flex items-center gap-1.5 flex-1 py-2 text-sm font-medium rounded-md transition-colors justify-center ${
                  mode === key ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />{label}
              </button>
            ))}
          </div>

          {mode === "job" && (
            <div className="space-y-4">
              <div className="relative">
                <label className="block text-sm font-medium mb-1">Search Saved Jobs</label>
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                  <input
                    value={jobSearch}
                    onChange={(e) => setJobSearch(e.target.value)}
                    onFocus={() => jobs.length > 0 && setShowJobDropdown(true)}
                    onBlur={() => setTimeout(() => setShowJobDropdown(false), 200)}
                    placeholder="Type to search jobs…"
                    className="w-full border rounded-lg pl-9 pr-3 py-2 text-sm"
                  />
                </div>
                {showJobDropdown && jobs.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-48 overflow-y-auto">
                    {jobs.map((j) => (
                      <button
                        key={j.id}
                        onMouseDown={() => selectJob(j)}
                        className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center justify-between"
                      >
                        <span>{j.title} <span className="text-gray-400">@ {j.company}</span></span>
                        <span className="text-xs text-gray-400">{j.location}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {selectedJob && (
                <div className="p-3 bg-gray-50 rounded-lg text-sm">
                  <p className="font-medium">{selectedJob.title} @ {selectedJob.company}</p>
                  {selectedJob.description && (
                    <p className="text-gray-500 mt-1 line-clamp-3">{selectedJob.description}</p>
                  )}
                </div>
              )}
            </div>
          )}

          {mode === "description" && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Job Description *</label>
                <textarea
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  rows={8}
                  placeholder="Paste the full job description here…"
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Job Title (optional)</label>
                  <input value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Company (optional)</label>
                  <input value={company} onChange={(e) => setCompany(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm" />
                </div>
              </div>
            </div>
          )}

          {mode === "keywords" && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Tech Stack / Skills</label>
                <textarea
                  value={keywords}
                  onChange={(e) => setKeywords(e.target.value)}
                  rows={4}
                  placeholder="Python, Go, AWS, Kubernetes, PostgreSQL, React, gRPC…"
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                />
                <p className="text-xs text-gray-400 mt-1">Comma-separated skills, tools, and technologies to emphasize.</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Target Role (optional)</label>
                  <input value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} placeholder="e.g. Backend Engineer" className="w-full border rounded-lg px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Target Company (optional)</label>
                  <input value={company} onChange={(e) => setCompany(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm" />
                </div>
              </div>
            </div>
          )}

          <button
            onClick={handleTailor}
            disabled={loading || (mode === "job" && !selectedJob) || (mode === "description" && !jobDescription.trim()) || (mode === "keywords" && !keywords.trim())}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 disabled:opacity-50 w-full justify-center"
          >
            <Wand2 className="w-4 h-4" />
            {loading ? "Generating…" : "Generate Tailored Resume"}
          </button>
          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>

        {/* Right: Results */}
        <div>
          {result ? (
            <div className="space-y-4">
              {/* Label */}
              <div className="bg-purple-50 border border-purple-200 rounded-xl p-3">
                <p className="text-sm text-purple-700">
                  <span className="font-medium">This resume is now:</span> {result.tailored_label}
                </p>
              </div>

              {/* Missing Keywords */}
              {result.missing_keywords.length > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                  <h3 className="flex items-center gap-2 font-semibold text-yellow-800 mb-2">
                    <AlertTriangle className="w-4 h-4" />
                    Missing Keywords ({result.missing_keywords.length})
                  </h3>
                  <div className="flex gap-1.5 flex-wrap">
                    {result.missing_keywords.map((kw) => (
                      <span key={kw} className="px-2 py-0.5 bg-white border border-yellow-300 rounded text-xs text-yellow-800">
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Improvements */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <h3 className="flex items-center gap-2 font-semibold text-blue-800 mb-2">
                  <CheckCircle className="w-4 h-4" />
                  Suggested Improvements
                </h3>
                <ul className="space-y-1 text-sm text-blue-800">
                  {result.improvements.map((imp, i) => (
                    <li key={i} className="flex gap-2">&bull; {imp}</li>
                  ))}
                </ul>
              </div>

              {/* Tailored Resume Text */}
              <div className="bg-white border border-gray-200 rounded-xl p-4 max-h-[400px] overflow-y-auto">
                <h3 className="font-semibold mb-2">Tailored Resume</h3>
                <pre className="text-sm whitespace-pre-wrap font-sans">{result.tailored_text}</pre>
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 border border-dashed border-gray-300 rounded-xl p-8 text-center text-gray-400">
              <Wand2 className="w-10 h-10 mx-auto mb-2" />
              <p>Your tailored resume will appear here.</p>
              <p className="text-xs mt-1">Choose a mode and generate.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
