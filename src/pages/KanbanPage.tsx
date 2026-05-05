import { useEffect } from "react";
import { useStore } from "@/store";
import { KanbanBoard } from "@/components/kanban/KanbanBoard";
import { Plus } from "lucide-react";
import { useState } from "react";
import { ApplicationCreateModal } from "@/components/kanban/ApplicationCreateModal";
import { ApplicationStage } from "@/types";

export function KanbanPage() {
  const { applications, fetchApplications, moveStage, loading } = useStore();
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Kanban Board</h1>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white text-sm font-medium rounded-lg hover:bg-brand-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Application
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading…</div>
      ) : (
        <KanbanBoard
          applications={applications}
          onStageChange={(id, stage) => moveStage(id, stage)}
        />
      )}

      {showCreate && (
        <ApplicationCreateModal
          onClose={() => setShowCreate(false)}
          onCreated={() => {
            setShowCreate(false);
            fetchApplications();
          }}
        />
      )}
    </div>
  );
}
