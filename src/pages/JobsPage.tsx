import { useEffect, useRef, useState } from "react";
import { Briefcase, Plus } from "lucide-react";
import { JobCard } from "@/components/job/JobCard";
import { JobCreateModal } from "@/components/job/JobCreateModal";
import { JobFilters } from "@/components/job/JobFilters";
import { useStore } from "@/store";

export function JobsPage() {
  const {
    fetchJobs,
    hasMoreJobs,
    jobs,
    jobsLoading,
    jobsLoadingMore,
    loadMoreJobs,
  } = useStore();
  const [showCreate, setShowCreate] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => { fetchJobs(); }, [fetchJobs]);

  useEffect(() => {
    const target = loadMoreRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasMoreJobs && !jobsLoading && !jobsLoadingMore) {
          loadMoreJobs();
        }
      },
      { rootMargin: "240px" },
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [hasMoreJobs, jobsLoading, jobsLoadingMore, loadMoreJobs]);

  return (
    <div>
      <div className="flex items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold">Jobs</h1>
        <div className="flex items-center gap-3 flex-1 justify-end">
          <JobFilters onSearch={fetchJobs} />
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-4 py-2 bg-brand-900 text-white text-sm font-medium rounded-btn hover:bg-brand-800 shrink-0"
          >
            <Plus className="w-4 h-4" /> Add Job
          </button>
        </div>
      </div>

      {jobsLoading && jobs.length === 0 ? (
        <p className="text-text-secondary">Loading...</p>
      ) : jobs.length === 0 && !showCreate ? (
        <div className="text-center py-16 bg-white rounded-card border-2 border-dashed border-border">
          <Briefcase className="w-12 h-12 text-text-muted mx-auto mb-3" />
          <p className="text-text-secondary">No saved jobs yet.</p>
          <p className="text-sm text-text-muted mt-1">Paste a job description and let AI extract the details.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {jobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
          <div ref={loadMoreRef} className="h-8" />
          {jobsLoadingMore && (
            <p className="py-3 text-center text-sm text-text-secondary">Loading more...</p>
          )}
        </div>
      )}

      <JobCreateModal open={showCreate} onClose={() => setShowCreate(false)} />
    </div>
  );
}
