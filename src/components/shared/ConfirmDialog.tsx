import { useState } from "react";
import { AlertTriangle, Loader2, X } from "lucide-react";

interface Props {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  loading?: boolean;
  loadingLabel?: string;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Delete",
  loading = false,
  loadingLabel,
  onConfirm,
  onCancel,
}: Props) {
  const [pending, setPending] = useState(false);
  const isLoading = loading || pending;

  if (!open) return null;

  async function handleConfirm() {
    if (isLoading) return;
    setPending(true);
    try {
      await onConfirm();
    } finally {
      setPending(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={() => {
        if (!isLoading) onCancel();
      }}
    >
      <div
        className="bg-white rounded-card shadow-xl w-full max-w-sm p-6 mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-500" />
            </div>
            <h3 className="font-semibold text-text-primary text-lg">{title}</h3>
          </div>
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="text-text-muted hover:text-text-secondary disabled:cursor-not-allowed disabled:opacity-50"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <p className="text-sm text-text-secondary ml-13 mb-6">{message}</p>
        <div className="flex gap-2 justify-end">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-text-secondary border border-border rounded-btn hover:bg-surface-secondary disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={isLoading}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-btn hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
            {isLoading ? loadingLabel || `${confirmLabel}...` : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
