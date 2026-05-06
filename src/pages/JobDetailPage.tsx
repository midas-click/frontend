import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { jobsApi } from "@/api/client";
import type { Job } from "@/types";
import { Building2, MapPin, Globe, DollarSign, ExternalLink, ArrowLeft, Tag, Trash2 } from "lucide-react";
import { format } from "date-fns";

export function JobDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [job, setJob] = useState<Job | null>(null);

  useEffect(() => {
    if (id) jobsApi.list().then((jobs) => setJob(jobs.find((j: Job) => j.id === id) || null));
  }, [id]);

  async function handleDelete() {
    if (!id || !confirm("Delete this job?")) return;
    await jobsApi.delete(id);
    navigate("/jobs");
  }

  if (!job) return <p className="text-gray-500">Loading…</p>;

  return (
    <div className="max-w-3xl">
      <Link to="/jobs" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4">
        <ArrowLeft className="w-4 h-4" /> Back to Jobs
      </Link>

      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h1 className="text-2xl font-bold">{job.title}</h1>
            <div className="flex items-center gap-4 mt-2 text-gray-500 flex-wrap">
              <span className="flex items-center gap-1">
                <Building2 className="w-4 h-4" />{job.company}
              </span>
              {job.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />{job.location}
                </span>
              )}
              {job.remote && (
                <span className="flex items-center gap-1">
                  <Globe className="w-4 h-4" />Remote
                </span>
              )}
              {job.salary_range && (
                <span className="flex items-center gap-1">
                  <DollarSign className="w-4 h-4" />{job.salary_range}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0 ml-4">
            <span className="text-xs px-2.5 py-0.5 bg-gray-100 rounded-full capitalize">{job.status}</span>
            {job.source_url && (
              <a href={job.source_url} target="_blank" rel="noreferrer"
                className="inline-flex items-center gap-1 text-xs text-brand-600 hover:text-brand-700">
                <ExternalLink className="w-3.5 h-3.5" />Source
              </a>
            )}
            <button onClick={handleDelete}
              className="inline-flex items-center gap-1 px-2 py-1 text-xs text-red-600 border border-red-200 rounded-md hover:bg-red-50">
              <Trash2 className="w-3.5 h-3.5" />Delete
            </button>
          </div>
        </div>

        {(job.extracted_keywords.length > 0 || job.tags.length > 0) && (
          <div className="flex gap-2 mt-4 flex-wrap">
            {job.extracted_keywords.slice(0, 10).map((k) => (
              <span key={k} className="px-2.5 py-0.5 bg-brand-50 text-brand-700 rounded-full text-xs font-medium">{k}</span>
            ))}
            {job.tags.map((t) => (
              <span key={t} className="px-2.5 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs flex items-center gap-1">
                <Tag className="w-3 h-3" />{t}
              </span>
            ))}
          </div>
        )}
      </div>

      {job.description && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold mb-3">Job Description</h2>
          <div className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{job.description}</div>
        </div>
      )}

      <p className="text-xs text-gray-400 mt-4">
        Added {format(new Date(job.created_at), "MMM d, yyyy")} · Source: {job.source_name}
      </p>
    </div>
  );
}
