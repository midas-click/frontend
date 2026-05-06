import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { resumesApi } from "@/api/client";
import type { Resume } from "@/types";
import { FileText, ArrowLeft, Wand2, Trash2, Layers, Hash, Clock } from "lucide-react";
import { format } from "date-fns";
import clsx from "clsx";

export function ResumeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [resume, setResume] = useState<Resume | null>(null);
  const [versions, setVersions] = useState<Resume[]>([]);

  useEffect(() => {
    if (id) {
      resumesApi.get(id).then(setResume).catch(console.error);
      resumesApi.versions(id).then(setVersions).catch(() => {});
    }
  }, [id]);

  async function handleDelete() {
    if (!id || !confirm("Delete this resume?")) return;
    await resumesApi.delete(id);
    navigate("/resumes");
  }

  if (!resume) return <p className="text-gray-500">Loading…</p>;

  const allVersions = resume.parent_resume_id
    ? versions
    : [resume, ...versions.filter((v) => v.id !== resume.id)];
  const currentVersion = resume;

  return (
    <div className="max-w-4xl">
      <Link to="/resumes" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4">
        <ArrowLeft className="w-4 h-4" /> Back to Resumes
      </Link>

      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2">
              <FileText className="w-5 h-5 text-brand-600" />
              {resume.original_filename}
            </h1>
            <div className="flex items-center gap-3 mt-2 text-sm text-gray-500 flex-wrap">
              <span className="flex items-center gap-1">
                <Layers className="w-3.5 h-3.5" />v{resume.version}
              </span>
              <span className="flex items-center gap-1">
                <Hash className="w-3.5 h-3.5" />{resume.sections.length} sections
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {format(new Date(resume.created_at), "MMM d, yyyy")}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to={`/resumes/tailor/${resume.id}`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 text-purple-700 rounded-lg text-sm font-medium hover:bg-purple-100"
            >
              <Wand2 className="w-3.5 h-3.5" />Tailor
            </Link>
            <button onClick={handleDelete}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-red-600 border border-red-200 rounded-lg hover:bg-red-50">
              <Trash2 className="w-3.5 h-3.5" />Delete
            </button>
          </div>
        </div>

        {/* Performance stats */}
        <div className="grid grid-cols-3 gap-3 mt-4 p-3 bg-gray-50 rounded-lg">
          <div className="text-center">
            <p className="text-lg font-bold text-brand-700">{resume.total_applications}</p>
            <p className="text-xs text-gray-500">Applications</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-brand-700">{resume.interview_count}</p>
            <p className="text-xs text-gray-500">Interviews</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-brand-700">{resume.offer_count}</p>
            <p className="text-xs text-gray-500">Offers</p>
          </div>
        </div>

        {/* Tags */}
        {resume.tags.length > 0 && (
          <div className="flex gap-1.5 mt-4 flex-wrap">
            {resume.tags.map((t) => (
              <span key={t} className="px-2 py-0.5 bg-brand-50 text-brand-700 rounded-full text-xs font-medium">{t}</span>
            ))}
          </div>
        )}

        {/* Tailored info */}
        {resume.tailored_label && (
          <div className="mt-3 p-3 bg-purple-50 rounded-lg text-sm">
            <span className="font-medium text-purple-700">This resume is: </span>
            <span className="text-purple-600">{resume.tailored_label}</span>
            {resume.tailored_for_job_id && (
              <span className="text-purple-400 ml-1">(for job)</span>
            )}
          </div>
        )}
      </div>

      {/* Resume Preview */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h2 className="font-semibold mb-4">Resume Preview</h2>
        {resume.sections.length > 0 ? (
          <div className="space-y-4">
            {resume.sections.map((section, i) => (
              <div key={i}>
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-1">
                  {section.title}
                </h3>
                <pre className="text-sm text-gray-600 whitespace-pre-wrap font-sans leading-relaxed">
                  {section.content}
                </pre>
                {i < resume.sections.length - 1 && <hr className="mt-3 border-gray-100" />}
              </div>
            ))}
          </div>
        ) : resume.raw_text ? (
          <pre className="text-sm text-gray-600 whitespace-pre-wrap font-sans leading-relaxed">
            {resume.raw_text}
          </pre>
        ) : (
          <p className="text-sm text-gray-400">No parsed content available.</p>
        )}
      </div>

      {/* Version History */}
      {allVersions.length > 1 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold mb-4">Version History</h2>
          <div className="space-y-2">
            {allVersions.map((v) => (
              <Link
                key={v.id}
                to={`/resumes/${v.id}`}
                className={clsx(
                  "flex items-center justify-between p-3 rounded-lg border text-sm",
                  v.id === currentVersion.id
                    ? "border-brand-200 bg-brand-50"
                    : "border-gray-200 hover:bg-gray-50",
                )}
              >
                <div>
                  <span className="font-medium">v{v.version}</span>
                  <span className="text-gray-500 ml-3">{v.original_filename}</span>
                  {v.tailored_for_job_id && (
                    <span className="text-purple-500 ml-2">— tailored</span>
                  )}
                </div>
                <span className="text-xs text-gray-400">
                  {format(new Date(v.created_at), "MMM d, yyyy")}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
