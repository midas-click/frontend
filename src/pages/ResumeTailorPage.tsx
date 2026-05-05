import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { resumesApi, tailoringApi } from "@/api/client";
import type { Resume, TailorResponse } from "@/types";
import { Wand2, AlertTriangle, CheckCircle, X } from "lucide-react";

export function ResumeTailorPage() {
  const { resumeId } = useParams<{ resumeId: string }>();
  const navigate = useNavigate();
  const [resume, setResume] = useState<Resume | null>(null);
  const [jobDescription, setJobDescription] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [company, setCompany] = useState("");
  const [result, setResult] = useState<TailorResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (resumeId) resumesApi.get(resumeId).then(setResume).catch(console.error);
  }, [resumeId]);

  async function handleTailor() {
    if (!resumeId || !jobDescription.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await tailoringApi.tailor({
        resume_id: resumeId,
        job_description: jobDescription,
        job_title: jobTitle || undefined,
        company: company || undefined,
      });
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
          <div>
            <label className="block text-sm font-medium mb-1">Job Description *</label>
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              rows={10}
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
          <button
            onClick={handleTailor}
            disabled={loading || !jobDescription.trim()}
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
              {/* Missing Keywords */}
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
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
