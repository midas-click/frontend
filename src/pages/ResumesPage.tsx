import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useStore } from "@/store";
import { resumesApi } from "@/api/client";
import { FileText, Upload, Wand2, Trash2, ChevronRight } from "lucide-react";
import type { Resume } from "@/types";

export function ResumesPage() {
  const { resumes, fetchResumes } = useStore();
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchResumes();
  }, [fetchResumes]);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      await resumesApi.upload(file);
      fetchResumes();
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this resume?")) return;
    await resumesApi.delete(id);
    fetchResumes();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Resumes</h1>
        <button
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white text-sm font-medium rounded-lg hover:bg-brand-700 disabled:opacity-50"
        >
          <Upload className="w-4 h-4" />
          {uploading ? "Uploading…" : "Upload Resume"}
        </button>
        <input ref={fileRef} type="file" accept=".pdf,.docx,.doc,.txt" onChange={handleUpload} className="hidden" />
      </div>

      {resumes.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-300">
          <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No resumes uploaded yet.</p>
          <p className="text-sm text-gray-400 mt-1">Upload a PDF or DOCX to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {resumes.map((r) => (
            <div key={r.id} className="bg-white rounded-xl border border-gray-200 hover:shadow-md transition-shadow">
              <Link to={`/resumes/${r.id}`} className="block p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <FileText className="w-5 h-5 text-brand-600 shrink-0" />
                    <span className="font-medium text-sm truncate">{r.original_filename}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-300 shrink-0 ml-2" />
                </div>
                <div className="flex gap-2 mt-3 text-xs text-gray-500">
                  <span>v{r.version}</span>
                  <span>·</span>
                  <span>{r.sections.length} sections</span>
                  {r.raw_text && <><span>·</span><span>{(r.raw_text.length / 1000).toFixed(1)}k chars</span></>}
                </div>
              </Link>
              <div className="flex gap-2 px-4 pb-4">
                <Link
                  to={`/resumes/tailor/${r.id}`}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 text-purple-700 rounded-lg text-xs font-medium hover:bg-purple-100"
                >
                  <Wand2 className="w-3.5 h-3.5" />
                  Tailor
                </Link>
                <button
                  onClick={() => handleDelete(r.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs font-medium hover:bg-red-100 ml-auto"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
