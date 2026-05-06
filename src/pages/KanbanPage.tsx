import { useEffect } from "react";
import { useStore } from "@/store";
import { KanbanBoard } from "@/components/kanban/KanbanBoard";
import { ApplicationFilters } from "@/components/ApplicationFilters";

export function KanbanPage() {
  const { applications, fetchApplications, moveStage, loading } = useStore();

  useEffect(() => { fetchApplications(); }, [fetchApplications]);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Kanban Board</h1>
      </div>

      <ApplicationFilters />

      <div className="mt-4">
        {loading ? (
          <div className="text-center py-12 text-gray-500">Loading…</div>
        ) : (
          <KanbanBoard
            applications={applications}
            onStageChange={(id, stage) => moveStage(id, stage)}
          />
        )}
      </div>
    </div>
  );
}
