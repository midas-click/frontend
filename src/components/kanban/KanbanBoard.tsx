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
import { Application, DEFAULT_KANBAN_COLUMNS } from "@/types";
import { COLORS, loadColumns, saveColumns } from "@/lib/utils";
import { KanbanColumn } from "./KanbanColumn";
import { KanbanCard } from "./KanbanCard";

interface KanbanColumnDef { id: string; label: string; color: string }

interface Props {
  applications: Application[];
  onStageChange: (id: string, stage: string) => void;
}

export function KanbanBoard({ applications, onStageChange }: Props) {
  const [columns, setColumns] = useState<KanbanColumnDef[]>(() => {
    const saved = loadColumns();
    return DEFAULT_KANBAN_COLUMNS.map((def) => {
      const savedCol = saved.find((c: { id: string }) => c.id === def.id);
      return savedCol ? { ...def, color: savedCol.color } : { ...def };
    });
  });
  const [activeApp, setActiveApp] = useState<Application | null>(null);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  function handleChangeColor(colId: string, color: string) {
    const next = columns.map((c) => (c.id === colId ? { ...c, color } : c));
    setColumns(next);
    saveColumns(next);
  }

  const columnsMap = useMemo(() => {
    const map = new Map<string, Application[]>();
    for (const col of columns) map.set(col.id, []);
    for (const app of applications) {
      const list = map.get((app.stage as string) || "");
      if (list) list.push(app);
    }
    return map;
  }, [applications, columns]);

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
    const targetStage =
      columns.find((c) => c.id === String(over.id))?.id ??
      appStageMap.get(String(over.id));

    if (targetStage && currentStage && currentStage !== targetStage) {
      onStageChange(String(active.id), targetStage);
    }
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="flex gap-4 overflow-x-auto pb-4" style={{ minHeight: "calc(100vh - 200px)" }}>
        {columns.map((col) => {
          const items = columnsMap.get(col.id) || [];
          return (
            <KanbanColumn
              key={col.id}
              colId={col.id}
              label={col.label}
              colorClass={col.color}
              count={items.length}
              onChangeColor={handleChangeColor}
              colors={COLORS}
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
