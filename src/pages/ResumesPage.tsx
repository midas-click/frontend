import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useStore } from "@/store";
import { resumesApi } from "@/api/client";
import { FileText, Upload, Trash2 } from "lucide-react";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";

export function ResumesPage() {
  const { resumes, fetchResumes } = useStore();
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    fetchResumes();
  }, [fetchResumes]);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadError(null);
    try {
      await resumesApi.upload(file);
      fetchResumes();
    } catch (err) {
      console.error(err);
      setUploadError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function handleDeleteClick(id: string) {
    setDeleteId(id);
    setDeleteOpen(true);
  }

  async function handleDelete() {
    if (!deleteId) return;
    await resumesApi.delete(deleteId);
    setDeleteOpen(false);
    setDeleteId(null);
    fetchResumes();
  }

  return (
    <div>
      <div>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Resumes</h1>
          <button
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-2 px-4 py-2 bg-brand-900 text-white text-sm font-medium rounded-btn hover:bg-brand-800 disabled:opacity-50"
          >
            <Upload className="w-4 h-4" />
            {uploading ? "Uploading…" : "Upload Resume"}
          </button>
          <input ref={fileRef} type="file" accept=".pdf,.docx,.doc,.txt" onChange={handleUpload} className="hidden" />
        </div>
        {uploadError && (
          <div className="mb-4 rounded-card border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {uploadError}
          </div>
        )}

        {resumes.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-card border-2 border-dashed border-border">
            <FileText className="w-12 h-12 text-text-muted mx-auto mb-3" />
            <p className="text-text-secondary">No resumes uploaded yet.</p>
            <p className="text-sm text-text-muted mt-1">Upload a PDF or DOCX to get started.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {resumes.map((r) => (
              <div key={r.id} className="bg-white rounded-card border border-border shadow-card hover:shadow-md transition-shadow relative">
                <button
                  onClick={() => handleDeleteClick(r.id)}
                  className="absolute top-3 right-3 p-1 border border-border rounded-btn text-text-muted hover:text-red-500 hover:border-red-200"
                  title="Delete"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
                <Link to={`/resumes/${r.id}`} className="block p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2 min-w-0 pr-6">
                      <FileText className="w-5 h-5 text-brand-600 shrink-0" />
                      <span className="font-medium text-sm truncate">{r.original_filename}</span>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3 text-xs text-text-secondary">
                    <span>{r.sections.length} sections</span>
                    {r.raw_text && <><span>·</span><span>{(r.raw_text.length / 1000).toFixed(1)}k chars</span></>}
                  </div>
                  <div className="flex gap-3 mt-2 pt-2 border-t border-border text-xs">
                    <span className="font-medium text-gray-700">{r.total_applications || 0} <span className="text-text-muted font-normal">applicants</span></span>
                    <span className="font-medium text-gray-700">{r.interview_count || 0} <span className="text-text-muted font-normal">interviews</span></span>
                    <span className="font-medium text-gray-700">{r.offer_count || 0} <span className="text-text-muted font-normal">offers</span></span>
                  </div>
                  {r.tags.length > 0 && (
                    <div className="flex gap-1 mt-2 flex-wrap">
                      {r.tags.map((t) => (
                        <span key={t} className="px-1.5 py-0.5 bg-brand-50 text-brand-600 rounded text-xs">{t}</span>
                      ))}
                    </div>
                  )}
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
      <ConfirmDialog
        open={deleteOpen}
        title="Delete Resume"
        message="Are you sure you want to delete this resume? The file content and tags will be permanently removed."
        onConfirm={handleDelete}
        onCancel={() => { setDeleteOpen(false); setDeleteId(null); }}
      />
    </div>
  );
}
