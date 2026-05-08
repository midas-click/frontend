import { useEffect, useState } from "react";
import { useStore } from "@/store";
import { jobsApi } from "@/api/client";
import { Briefcase, MapPin, Globe, Plus, X, Sparkles, Loader2, ChevronRight, DollarSign, LinkIcon } from "lucide-react";
import { Link } from "react-router-dom";

export function JobsPage() {
  const { jobs, fetchJobs } = useStore();
  const [showCreate, setShowCreate] = useState(false);
  const [rawText, setRawText] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => { fetchJobs(); }, [fetchJobs]);

  async function handleAnalyze() {
    if (!rawText.trim() || !sourceUrl.trim()) return;
    setAnalyzing(true);
    try {
      await jobsApi.analyze(rawText.trim(), sourceUrl.trim());
      setRawText("");
      setSourceUrl("");
      fetchJobs();
      setShowCreate(false);
    } catch (err) {
      console.error(err);
    } finally {
      setAnalyzing(false);
    }
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
          <p className="text-sm text-gray-400 mt-1">Paste a job description and let AI extract the details.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {jobs.map((j) => (
            <Link key={j.id} to={`/jobs/${j.id}`} className="block bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">{j.title}</h3>
                  <p className="text-sm text-gray-500 flex items-center gap-3 mt-1">
                    <span className="flex items-center gap-1"><Briefcase className="w-3.5 h-3.5" />{j.company}</span>
                    {j.location && <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{j.location}</span>}
                    {j.remote && <span className="flex items-center gap-1"><Globe className="w-3.5 h-3.5" />Remote</span>}
                    {j.salary_range && <span className="flex items-center gap-1 text-xs text-gray-500"><DollarSign className="w-3 h-3" />{j.salary_range}</span>}
                  </p>
                  {j.extracted_keywords && j.extracted_keywords.length > 0 && (
                    <div className="flex gap-1 mt-2 flex-wrap">
                      {j.extracted_keywords.slice(0, 8).map((k: string) => (
                        <span key={k} className="px-1.5 py-0.5 bg-brand-50 text-brand-700 rounded text-xs">{k}</span>
                      ))}
                    </div>
                  )}
                  {j.description && (
                    <p className="text-sm text-gray-400 mt-2 line-clamp-2">{j.description}</p>
                  )}
                </div>
                <ChevronRight className="w-4 h-4 text-gray-300 shrink-0 ml-2" />
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => !analyzing && setShowCreate(false)}>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-xl p-6 relative max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => !analyzing && setShowCreate(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600" disabled={analyzing}>
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-bold mb-1">Add Job</h2>
            <p className="text-sm text-gray-500 mb-4">Paste a job description and its URL. AI will extract everything.</p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  <LinkIcon className="w-3.5 h-3.5 inline mr-1" />Source URL *
                </label>
                <input
                  value={sourceUrl}
                  onChange={(e) => setSourceUrl(e.target.value)}
                  placeholder="https://example.com/jobs/..."
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Job Description</label>
                <textarea
                  value={rawText}
                  onChange={(e) => setRawText(e.target.value)}
                  placeholder="Paste the full job description here..."
                  rows={10}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                  autoFocus
                />
              </div>
              <div className="flex gap-3 justify-end">
                <button onClick={() => !analyzing && setShowCreate(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg" disabled={analyzing}>
                  Cancel
                </button>
                <button
                  onClick={handleAnalyze}
                  disabled={analyzing || !rawText.trim() || !sourceUrl.trim()}
                  className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white text-sm font-medium rounded-lg hover:bg-brand-700 disabled:opacity-50"
                >
                  {analyzing ? (
                    <><Loader2 className="w-4 h-4 animate-spin" />Analyzing...</>
                  ) : (
                    <><Sparkles className="w-4 h-4" />Analyze & Save</>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
