import { ReactNode } from "react";
import { useDroppable } from "@dnd-kit/core";
import { ApplicationStage } from "@/types";
import clsx from "clsx";

interface Props {
  stage: ApplicationStage;
  label: string;
  colorClass: string;
  count: number;
  children: ReactNode;
}

export function KanbanColumn({ stage, label, colorClass, count, children }: Props) {
  const { setNodeRef, isOver } = useDroppable({
    id: `column-${stage}`,
    data: { stage },
  });

  return (
    <div
      ref={setNodeRef}
      className={clsx(
        "flex flex-col w-72 shrink-0 rounded-xl border p-3 transition-colors",
        colorClass,
        isOver && "ring-2 ring-brand-400",
      )}
    >
      <div className="flex items-center justify-between mb-3 px-1">
        <h3 className="font-semibold text-sm">{label}</h3>
        <span className="text-xs bg-white/70 px-2 py-0.5 rounded-full">{count}</span>
      </div>
      <div className="flex flex-col gap-2 overflow-y-auto flex-1 min-h-0">{children}</div>
    </div>
  );
}
