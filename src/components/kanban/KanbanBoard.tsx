import { useMemo, useState } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { STAGES } from "@/lib/utils";
import { Application } from "@/types";
import { KanbanColumn } from "./KanbanColumn";
import { KanbanCard } from "./KanbanCard";

const STAGE_IDS = Object.keys(STAGES);

interface Props {
  applications: Application[];
  onStageChange: (id: string, stage: string) => void;
}

export function KanbanBoard({ applications, onStageChange }: Props) {
  const [activeApp, setActiveApp] = useState<Application | null>(null);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const columnsMap = useMemo(() => {
    const map = new Map<string, Application[]>();
    for (const id of STAGE_IDS) map.set(id, []);
    for (const app of applications) {
      const list = map.get((app.stage as string) || "");
      if (list) list.push(app);
    }
    return map;
  }, [applications]);

  const appStageMap = useMemo(() => {
    const m = new Map<string, string>();
    for (const app of applications) m.set(app.id, (app.stage as string) || "");
    return m;
  }, [applications]);

  function handleDragStart({ active }: DragStartEvent) {
    setActiveApp(applications.find((a) => a.id === active.id) || null);
  }

  function handleDragEnd({ active, over }: DragEndEvent) {
    setActiveApp(null);
    if (!over) return;

    const currentStage = appStageMap.get(String(active.id));
    const overId = String(over.id);
    const targetStage = STAGE_IDS.includes(overId) ? overId : appStageMap.get(overId);

    if (targetStage && currentStage && currentStage !== targetStage) {
      onStageChange(String(active.id), targetStage);
    }
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="flex gap-4 overflow-x-auto pb-4" style={{ height: "calc(100vh - 160px)" }}>
        {STAGE_IDS.map((id) => {
          const s = STAGES[id];
          const items = columnsMap.get(id) || [];
          return (
            <KanbanColumn
              key={id}
              colId={id}
              label={s.label}
              bg={s.bg}
              text={s.text}
              count={items.length}
            >
              <SortableContext items={items.map((a) => a.id)} strategy={verticalListSortingStrategy}>
                {items.map((app) => (<KanbanCard key={app.id} application={app} />))}
              </SortableContext>
            </KanbanColumn>
          );
        })}
      </div>
      <DragOverlay dropAnimation={null}>
        {activeApp ? <div className="w-72 opacity-90 rotate-2"><KanbanCard application={activeApp} isOverlay /></div> : null}
      </DragOverlay>
    </DndContext>
  );
}
