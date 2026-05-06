import { useMemo, useState, useCallback } from "react";
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
import { SortableContext, verticalListSortingStrategy, horizontalListSortingStrategy, arrayMove } from "@dnd-kit/sortable";
import { Application, DEFAULT_KANBAN_COLUMNS } from "@/types";
import { KanbanColumn } from "./KanbanColumn";
import { KanbanCard } from "./KanbanCard";
import { Plus } from "lucide-react";

interface KanbanColumnDef { id: string; label: string; color: string }

interface Props {
  applications: Application[];
  onStageChange: (id: string, stage: string) => void;
}

export const COLORS = [
  "bg-blue-50 border-blue-200", "bg-yellow-50 border-yellow-200",
  "bg-orange-50 border-orange-200", "bg-purple-50 border-purple-200",
  "bg-green-50 border-green-200", "bg-red-50 border-red-200",
  "bg-gray-50 border-gray-200", "bg-pink-50 border-pink-200",
  "bg-teal-50 border-teal-200", "bg-indigo-50 border-indigo-200",
];

function loadColumns(): KanbanColumnDef[] {
  try {
    const saved = localStorage.getItem("midas-kanban-columns");
    if (saved) return JSON.parse(saved);
  } catch {}
  return [...DEFAULT_KANBAN_COLUMNS];
}

function saveColumns(cols: KanbanColumnDef[]) { localStorage.setItem("midas-kanban-columns", JSON.stringify(cols)); }

export function KanbanBoard({ applications, onStageChange }: Props) {
  const [columns, setColumns] = useState<KanbanColumnDef[]>(loadColumns);
  const [activeApp, setActiveApp] = useState<Application | null>(null);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const updateColumns = useCallback((cols: KanbanColumnDef[]) => { setColumns(cols); saveColumns(cols); }, []);
  const columnIds = useMemo(() => columns.map((c) => c.id), [columns]);

  function handleRename(colId: string, label: string) {
    updateColumns(columns.map((c) => (c.id === colId ? { ...c, label } : c)));
  }
  function handleChangeColor(colId: string, color: string) {
    updateColumns(columns.map((c) => (c.id === colId ? { ...c, color } : c)));
  }
  function handleAdd() {
    const idx = columns.length + 1;
    updateColumns([...columns, {
      id: `stage-${idx}-${Date.now()}`,
      label: `Stage ${idx}`,
      color: COLORS[(idx - 1) % COLORS.length],
    }]);
  }
  function handleDelete(colId: string) {
    if (columns.length <= 1) return;
    updateColumns(columns.filter((c) => c.id !== colId));
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

  function findColumnIndex(id: string): number {
    // Normalize: strip "col-" prefix from droppable IDs
    const clean = id.startsWith("col-") ? id.slice(4) : id;
    return columnIds.indexOf(clean);
  }

  function handleDragStart({ active }: DragStartEvent) {
    setActiveApp(applications.find((a) => a.id === active.id) || null);
  }

  function handleDragEnd({ active, over }: DragEndEvent) {
    setActiveApp(null);
    if (!over) return;

    const aIdx = findColumnIndex(String(active.id));
    const oIdx = findColumnIndex(String(over.id));

    // Column reorder
    if (aIdx !== -1 && oIdx !== -1 && aIdx !== oIdx) {
      updateColumns(arrayMove(columns, aIdx, oIdx));
      return;
    }

    // Card move
    const currentStage = appStageMap.get(String(active.id));
    const targetStage = findColumnIndex(String(over.id)) !== -1
      ? (String(over.id).startsWith("col-") ? String(over.id).slice(4) : String(over.id))
      : appStageMap.get(String(over.id));
    if (targetStage && currentStage && currentStage !== targetStage) {
      onStageChange(String(active.id), targetStage);
    }
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="flex gap-4 overflow-x-auto pb-4" style={{ minHeight: "calc(100vh - 200px)" }}>
        <SortableContext items={columnIds} strategy={horizontalListSortingStrategy}>
          {columns.map((col) => {
            const items = columnsMap.get(col.id) || [];
            return (
              <KanbanColumn
                key={col.id}
                colId={col.id}
                label={col.label}
                colorClass={col.color}
                count={items.length}
                onRename={handleRename}
                onChangeColor={handleChangeColor}
                onDelete={handleDelete}
                colors={COLORS}
              >
                <SortableContext items={items.map((a) => a.id)} strategy={verticalListSortingStrategy}>
                  {items.map((app) => (<KanbanCard key={app.id} application={app} />))}
                </SortableContext>
              </KanbanColumn>
            );
          })}
        </SortableContext>
        <button onClick={handleAdd}
          className="flex flex-col items-center justify-center w-72 shrink-0 rounded-xl border-2 border-dashed border-gray-300 text-gray-400 hover:border-gray-400 hover:text-gray-500 transition-colors p-6 gap-2 min-h-[120px]">
          <Plus className="w-5 h-5" /><span className="text-sm font-medium">Add Stage</span>
        </button>
      </div>
      <DragOverlay dropAnimation={null}>
        {activeApp ? <div className="w-72 opacity-90 rotate-2"><KanbanCard application={activeApp} isOverlay /></div> : null}
      </DragOverlay>
    </DndContext>
  );
}
