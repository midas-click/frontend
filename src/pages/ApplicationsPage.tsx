import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ApplicationCard } from "@/components/application/ApplicationCard";
import { ApplicationCreateModal } from "@/components/application/ApplicationCreateModal";
import { ApplicationFilters } from "@/components/application/ApplicationFilters";
import { useStore } from "@/store";

export function ApplicationsPage() {
  const {
    applications,
    fetchApplications,
    hasMoreApplications,
    loadMoreApplications,
    loading,
    loadingMore,
  } = useStore();
  const [showCreate, setShowCreate] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => { fetchApplications(); }, [fetchApplications]);

  useEffect(() => {
    const target = loadMoreRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasMoreApplications && !loading && !loadingMore) {
          loadMoreApplications();
        }
      },
      { rootMargin: "240px" },
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [hasMoreApplications, loadMoreApplications, loading, loadingMore]);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Applicants</h1>
        <ApplicationFilters
          showCreateBtn
          onCreateClick={() => setShowCreate(true)}
          onSearch={fetchApplications}
        />
      </div>

      <div className="mt-4">
        {loading && applications.length === 0 ? (
          <p className="text-text-secondary">Loading...</p>
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
            <div ref={loadMoreRef} className="h-8" />
            {loadingMore && (
              <p className="py-3 text-center text-sm text-text-secondary">Loading more...</p>
            )}
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
