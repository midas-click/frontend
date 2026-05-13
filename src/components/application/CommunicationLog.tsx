import { format } from "date-fns";
import { CommunicationLog as CommunicationLogEntry } from "@/types";

interface Props {
  logs: CommunicationLogEntry[];
  className?: string;
}

export function CommunicationLog({ logs, className }: Props) {
  return (
    <div className={className}>
      <h2 className="font-semibold mb-4">Communication Log</h2>
      <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
        {logs.length === 0 && (
          <p className="text-sm text-text-muted">No communications logged.</p>
        )}
        {logs.map((c, i) => (
          <div key={i} className="p-3 bg-surface-secondary rounded-btn">
            <p className="text-xs text-text-muted mb-1">
              {format(new Date(c.date), "MMM d, yyyy")} · {c.channel}
            </p>
            <p className="text-sm">{c.summary}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
