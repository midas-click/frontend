import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useStore } from "@/store";
import { ApplicationFilters } from "@/components/application/ApplicationFilters";
import { ApplicationCreateModal } from "@/components/application/ApplicationCreateModal";
import { ApplicationCard } from "@/components/application/ApplicationCard";

export function ApplicationsPage() {
  const { applications, fetchApplications, loading } = useStore();
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => { fetchApplications(); }, [fetchApplications]);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Applicants</h1>
      </div>

      <ApplicationFilters
        showCreateBtn
        onCreateClick={() => setShowCreate(true)}
      />

      <div className="mt-4">
        {loading ? (
          <p className="text-text-secondary">Loading…</p>
        ) : applications.length === 0 ? (
          <p className="text-text-secondary">
            No applications yet.{" "}
            <button onClick={() => setShowCreate(true)} className="text-brand-600 underline">
              Create one
            </button>
            {" "}or go to{" "}
            <Link to="/kanban" className="text-brand-600 underline">Kanban</Link>.
          </p>
        ) : (
          <div className="space-y-2">
            {applications.map((app) => (
              <ApplicationCard key={app.id} application={app} />
            ))}
          </div>
        )}
      </div>

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
