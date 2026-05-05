import { useMemo } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Application, ApplicationStage, KANBAN_STAGES } from "@/types";
import { KanbanColumn } from "./KanbanColumn";
import { KanbanCard } from "./KanbanCard";

interface Props {
  applications: Application[];
  onStageChange: (id: string, stage: ApplicationStage) => void;
}

const STAGE_LABELS: Record<ApplicationStage, string> = {
  [ApplicationStage.Applied]: "Applied",
  [ApplicationStage.PhoneScreen]: "Phone Screen",
  [ApplicationStage.Technical]: "Technical",
  [ApplicationStage.Onsite]: "Onsite",
  [ApplicationStage.Offer]: "Offer",
  [ApplicationStage.Rejected]: "Rejected",
  [ApplicationStage.Withdrawn]: "Withdrawn",
};

const STAGE_COLORS: Record<ApplicationStage, string> = {
  [ApplicationStage.Applied]: "bg-blue-50 border-blue-200",
  [ApplicationStage.PhoneScreen]: "bg-yellow-50 border-yellow-200",
  [ApplicationStage.Technical]: "bg-orange-50 border-orange-200",
  [ApplicationStage.Onsite]: "bg-purple-50 border-purple-200",
  [ApplicationStage.Offer]: "bg-green-50 border-green-200",
  [ApplicationStage.Rejected]: "bg-red-50 border-red-200",
  [ApplicationStage.Withdrawn]: "bg-gray-50 border-gray-200",
};

export function KanbanBoard({ applications, onStageChange }: Props) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const columns = useMemo(() => {
    const map = new Map<ApplicationStage, Application[]>();
    for (const stage of KANBAN_STAGES) map.set(stage, []);
    for (const app of applications) {
      const list = map.get(app.stage) || [];
      list.push(app);
      map.set(app.stage, list);
    }
    return map;
  }, [applications]);

  function handleDragEnd({ active, over }: DragEndEvent) {
    if (!over) return;
    const targetStage = over.data.current?.stage as ApplicationStage;
    if (targetStage && active.data.current?.stage !== targetStage) {
      onStageChange(String(active.id), targetStage);
    }
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
      <div className="flex gap-4 overflow-x-auto pb-4" style={{ minHeight: "calc(100vh - 200px)" }}>
        {KANBAN_STAGES.map((stage) => {
          const items = columns.get(stage) || [];
          return (
            <KanbanColumn
              key={stage}
              stage={stage}
              label={STAGE_LABELS[stage]}
              colorClass={STAGE_COLORS[stage]}
              count={items.length}
            >
              <SortableContext items={items.map((a) => a.id)} strategy={verticalListSortingStrategy}>
                {items.map((app) => (
                  <KanbanCard key={app.id} application={app} />
                ))}
              </SortableContext>
            </KanbanColumn>
          );
        })}
      </div>
    </DndContext>
  );
}
