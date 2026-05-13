import { Clock } from "lucide-react";
import { format } from "date-fns";
import { TimelineEvent } from "@/types";
import { STAGES } from "@/lib/utils";

interface Props {
  events: TimelineEvent[];
  className?: string;
}

export function Timeline({ events, className }: Props) {
  return (
    <div className={className}>
      <h2 className="font-semibold mb-4">Timeline ({events.length})</h2>
      {events.length === 0 ? (
        <p className="text-sm text-text-muted">No events yet.</p>
      ) : (
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {[...events].reverse().map((e, i) => {
            const parts = e.event.split(/([a-z0-9_-]+)/gi);
            return (
              <div key={i} className="flex gap-3">
                <Clock className="w-4 h-4 text-text-muted mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium">
                    {parts.map((part, j) => {
                      const s = STAGES[part];
                      return s ? (
                        <span
                          key={j}
                          className="inline-flex items-center px-1.5 py-0.5 mx-0.5 rounded-full text-xs font-medium"
                          style={{ backgroundColor: s.bg, color: s.text }}
                        >
                          {s.label}
                        </span>
                      ) : (
                        <span key={j}>{part}</span>
                      );
                    })}
                  </p>
                  <p className="text-xs text-text-muted">
                    {format(new Date(e.date), "MMM d, yyyy h:mm a")}
                  </p>
                  {e.detail && (
                    <p className="text-xs text-text-secondary mt-0.5">{e.detail}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
