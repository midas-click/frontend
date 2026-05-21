import clsx from "clsx";
import { Loader2 } from "lucide-react";

interface LoadingIndicatorProps {
  label?: string;
  compact?: boolean;
  className?: string;
}

export function LoadingIndicator({
  label = "Loading latest data...",
  compact = false,
  className,
}: LoadingIndicatorProps) {
  return (
    <div
      className={clsx(
        "flex items-center gap-2 text-text-secondary",
        compact ? "text-xs" : "justify-center py-10 text-sm",
        className,
      )}
      role="status"
      aria-live="polite"
    >
      <Loader2 className={clsx("animate-spin text-brand-600", compact ? "h-3.5 w-3.5" : "h-5 w-5")} />
      <span>{label}</span>
    </div>
  );
}

export function GlobalLoadingBar({ active }: { active: boolean }) {
  if (!active) return null;

  return (
    <div className="h-0.5 w-full overflow-hidden bg-brand-50">
      <div className="h-full w-1/3 animate-[loading-bar_1.15s_ease-in-out_infinite] rounded-full bg-brand-600" />
    </div>
  );
}
