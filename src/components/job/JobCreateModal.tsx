import { useState } from "react";
import { useStore } from "@/store";
import { jobsApi } from "@/api/client";
import { X, Sparkles, Loader2, LinkIcon } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
}

export function JobCreateModal({ open, onClose }: Props) {
  const { fetchJobs } = useStore();
  const [rawText, setRawText] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [analyzing, setAnalyzing] = useState(false);

  if (!open) return null;

  async function handleSubmit() {
    if (!rawText.trim() || !sourceUrl.trim()) return;
    setAnalyzing(true);
    try {
      await jobsApi.analyze(rawText.trim(), sourceUrl.trim());
      setRawText("");
      setSourceUrl("");
      fetchJobs();
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setAnalyzing(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => !analyzing && onClose()}>
      <div className="bg-white rounded-xl shadow-xl w-full max-w-xl p-6 relative max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <button onClick={() => !analyzing && onClose()} className="absolute top-4 right-4 text-text-muted hover:text-text-secondary" disabled={analyzing}>
          <X className="w-5 h-5" />
        </button>
        <h2 className="text-lg font-bold mb-1">Add Job</h2>
        <p className="text-sm text-text-secondary mb-4">Paste a job description and its URL. AI will extract everything.</p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              <LinkIcon className="w-3.5 h-3.5 inline mr-1" />Source URL *
            </label>
            <input
              value={sourceUrl}
              onChange={(e) => setSourceUrl(e.target.value)}
              placeholder="https://example.com/jobs/..."
              className="w-full border rounded-btn px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Job Description</label>
            <textarea
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              placeholder="Paste the full job description here..."
              rows={10}
              className="w-full border rounded-btn px-3 py-2 text-sm"
              autoFocus
            />
          </div>
          <div className="flex gap-3 justify-end">
            <button onClick={() => !analyzing && onClose()} className="px-4 py-2 text-sm text-text-secondary hover:bg-surface-secondary rounded-btn" disabled={analyzing}>
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={analyzing || !rawText.trim() || !sourceUrl.trim()}
              className="flex items-center gap-2 px-4 py-2 bg-brand-900 text-white text-sm font-medium rounded-btn hover:bg-brand-800 disabled:opacity-50"
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
  );
}
