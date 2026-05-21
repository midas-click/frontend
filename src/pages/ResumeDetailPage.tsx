import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { resumesApi } from "@/api/client";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { LoadingIndicator } from "@/components/shared/LoadingIndicator";
import type { Resume } from "@/types";
import { FileText, ArrowLeft, Trash2, Hash, Clock } from "lucide-react";
import { format } from "date-fns";

export function ResumeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [resume, setResume] = useState<Resume | null>(null);
  const [tagInput, setTagInput] = useState("");
  const [savingTags, setSavingTags] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (id) resumesApi.get(id).then(setResume).catch(console.error);
  }, [id]);

  async function handleDelete() {
    if (!id) return;
    setDeleting(true);
    try {
      await resumesApi.delete(id);
      navigate("/resumes");
    } catch (err) {
      console.error(err);
      setDeleting(false);
    }
  }

  async function addTag(tag: string) {
    if (!id || !resume || !tag.trim()) return;
    const newTags = [...resume.tags, tag.trim()];
    setSavingTags(true);
    await resumesApi.update(id, { tags: newTags });
    setResume({ ...resume, tags: newTags });
    setSavingTags(false);
  }

  async function removeTag(tag: string) {
    if (!id || !resume) return;
    const newTags = resume.tags.filter((t) => t !== tag);
    setSavingTags(true);
    await resumesApi.update(id, { tags: newTags });
    setResume({ ...resume, tags: newTags });
    setSavingTags(false);
  }

  function handleTagKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag(tagInput);
      setTagInput("");
    }
  }

  if (!resume) return <LoadingIndicator label="Loading resume..." />;

  return (
    <div className="max-w-4xl">
      <Link to="/resumes" className="inline-flex items-center gap-1 text-sm text-text-secondary hover:text-gray-700 mb-4">
        <ArrowLeft className="w-4 h-4" /> Back to Resumes
      </Link>

      {/* Header */}
      <div className="bg-white rounded-card border border-border shadow-card p-6 mb-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2">
              <FileText className="w-5 h-5 text-brand-600" />
              {resume.original_filename}
            </h1>
            <div className="flex items-center gap-3 mt-2 text-sm text-text-secondary flex-wrap">
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
            <button onClick={() => setDeleteOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-red-600 border border-red-200 rounded-btn hover:bg-red-50">
              <Trash2 className="w-3.5 h-3.5" />Delete
            </button>
          </div>
        </div>

        {/* Performance stats */}
        <div className="grid grid-cols-3 gap-3 mt-4 p-3 bg-surface-secondary rounded-btn">
          <div className="text-center">
            <p className="text-lg font-bold text-brand-600">{resume.total_applications}</p>
            <p className="text-xs text-text-secondary">Applications</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-brand-600">{resume.interview_count}</p>
            <p className="text-xs text-text-secondary">Interviews</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-brand-600">{resume.offer_count}</p>
            <p className="text-xs text-text-secondary">Offers</p>
          </div>
        </div>

        {/* Tags */}
        <div className="mt-4 pt-4 border-t border-border">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-medium text-text-secondary uppercase tracking-wide">Tags</span>
            <span className="text-xs text-text-muted">({resume.tags.length})</span>
          </div>
          <div className="flex gap-1.5 flex-wrap mb-3">
            {resume.tags.length === 0 && <span className="text-xs text-text-muted">No tags yet</span>}
            {resume.tags.map((t) => (
              <span key={t} className="flex items-center gap-1 px-2 py-0.5 bg-brand-50 text-brand-600 rounded-tag text-xs font-medium">
                {t}
                <button onClick={() => removeTag(t)} className="hover:text-red-500 ml-0.5">&times;</button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleTagKeyDown}
              placeholder="python, backend..."
              className="border rounded-btn px-3 py-2 text-sm flex-1"
            />
            <button
              onClick={() => { addTag(tagInput); setTagInput(""); }}
              disabled={savingTags || !tagInput.trim()}
              className="px-4 py-2 bg-brand-900 text-white text-sm rounded-btn hover:bg-brand-800 disabled:opacity-50"
            >
              Add
            </button>
          </div>
        </div>

        {/* Resume Preview */}
      </div>

      <div className="bg-white rounded-card border border-border shadow-card p-6 mb-6">
        <h2 className="font-semibold mb-4">Resume Preview</h2>
        {resume.sections.length > 0 ? (
          <div className="space-y-4">
            {resume.sections.map((section, i) => (
              <div key={i}>
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-1">
                  {section.title}
                </h3>
                <pre className="text-sm text-text-secondary whitespace-pre-wrap font-sans leading-relaxed">
                  {section.content}
                </pre>
                {i < resume.sections.length - 1 && <hr className="mt-3 border-border" />}
              </div>
            ))}
          </div>
        ) : resume.raw_text ? (
          <pre className="text-sm text-text-secondary whitespace-pre-wrap font-sans leading-relaxed">
            {resume.raw_text}
          </pre>
        ) : (
          <p className="text-sm text-text-muted">No parsed content available.</p>
        )}
      </div>
      <ConfirmDialog
        open={deleteOpen}
        title="Delete Resume"
        message="Are you sure you want to delete this resume? The parsed content and all attached tags will be permanently removed."
        loading={deleting}
        loadingLabel="Deleting..."
        onConfirm={handleDelete}
        onCancel={() => setDeleteOpen(false)}
      />
    </div>
  );
}
