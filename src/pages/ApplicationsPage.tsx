import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { ApplicationCard } from "@/components/application/ApplicationCard";
import { ApplicationFilters } from "@/components/application/ApplicationFilters";
import { LoadingIndicator } from "@/components/shared/LoadingIndicator";
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
          onSearch={fetchApplications}
        />
      </div>

      <div className="mt-4">
        {loading && applications.length === 0 ? (
          <LoadingIndicator label="Loading applicants..." />
        ) : applications.length === 0 ? (
          <p className="text-text-secondary">
            No applications yet. Create applicants from the{" "}
            <Link to="/jobs" className="text-brand-600 underline">Jobs</Link>
            {" "}page.
          </p>
        ) : (
          <div className="space-y-2">
            {applications.map((app) => (
              <ApplicationCard key={app.id} application={app} />
            ))}
            <div ref={loadMoreRef} className="h-8" />
            {loadingMore && (
              <LoadingIndicator compact label="Loading more..." className="justify-center py-3" />
            )}
          </div>
        )}
      </div>

    </div>
  );
}
