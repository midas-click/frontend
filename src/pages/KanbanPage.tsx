import { useEffect } from "react";
import { ApplicationFilters } from "@/components/application/ApplicationFilters";
import { KanbanBoard } from "@/components/kanban/KanbanBoard";
import { LoadingIndicator } from "@/components/shared/LoadingIndicator";
import { useStore } from "@/store";

export function KanbanPage() {
  const {
    applications,
    fetchKanbanApplications,
    kanbanPagination,
    loadMoreKanbanStage,
    loading,
    moveStage,
  } = useStore();

  useEffect(() => { fetchKanbanApplications(); }, [fetchKanbanApplications]);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Applicant Board</h1>
        <ApplicationFilters onSearch={fetchKanbanApplications} />
      </div>
      <div className="mt-4">
        {loading && applications.length === 0 ? (
          <LoadingIndicator label="Loading applicant board..." />
        ) : (
          <KanbanBoard
            applications={applications}
            kanbanPagination={kanbanPagination}
            onLoadMoreStage={loadMoreKanbanStage}
            onStageChange={(id, stage) => moveStage(id, stage)}
          />
        )}
      </div>
    </div>
  );
}
