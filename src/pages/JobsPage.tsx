import { useEffect, useRef, useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import { Briefcase } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ApplicationCreateModal } from "@/components/application/ApplicationCreateModal";
import { JobCard } from "@/components/job/JobCard";
import { JobFilters } from "@/components/job/JobFilters";
import { LoadingIndicator } from "@/components/shared/LoadingIndicator";
import { useStore } from "@/store";
import type { Job } from "@/types";

type ActionMessage = { text: string; tone: "info" | "error" };

export function JobsPage() {
  const navigate = useNavigate();
  const { isSignedIn } = useAuth();
  const {
    createApplicationsForJobs,
    fetchJobs,
    hasMoreJobs,
    jobs,
    jobsLoading,
    jobsLoadingMore,
    loadMoreJobs,
  } = useStore();
  const [selectedJobIds, setSelectedJobIds] = useState<Set<string>>(() => new Set());
  const [batching, setBatching] = useState(false);
  const [actionMessage, setActionMessage] = useState<ActionMessage | null>(null);
  const [applyJob, setApplyJob] = useState<Job | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const selectAllRef = useRef<HTMLInputElement | null>(null);
  const selectedJobs = jobs.filter((job) => selectedJobIds.has(job.id));
  const selectedCount = selectedJobs.length;
  const allLoadedSelected = jobs.length > 0 && jobs.every((job) => selectedJobIds.has(job.id));
  const someLoadedSelected = jobs.some((job) => selectedJobIds.has(job.id));
  const canRunBatchAction = Boolean(isSignedIn) && selectedCount > 0 && !batching;
  const runActionDisabledReason = !isSignedIn
    ? "Need to login to run action"
    : selectedCount === 0
      ? "Select at least 1 job"
      : "";

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  useEffect(() => {
    if (selectAllRef.current) {
      selectAllRef.current.indeterminate = someLoadedSelected && !allLoadedSelected;
    }
  }, [allLoadedSelected, someLoadedSelected]);

  useEffect(() => {
    const loadedJobIds = new Set(jobs.map((job) => job.id));
    setSelectedJobIds((current) => {
      const next = new Set([...current].filter((id) => loadedJobIds.has(id)));
      return next.size === current.size ? current : next;
    });
  }, [jobs]);

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

  function handleSelectJob(jobId: string, selected: boolean) {
    setActionMessage(null);
    setSelectedJobIds((current) => {
      const next = new Set(current);
      if (selected) {
        next.add(jobId);
      } else {
        next.delete(jobId);
      }
      return next;
    });
  }

  function handleSelectAllLoaded(selected: boolean) {
    setActionMessage(null);
    setSelectedJobIds((current) => {
      const next = new Set(current);
      for (const job of jobs) {
        if (selected) {
          next.add(job.id);
        } else {
          next.delete(job.id);
        }
      }
      return next;
    });
  }

  async function makeApplicationsForSelectedJobs() {
    return createApplicationsForJobs(selectedJobs.map((job) => job.id));
  }

  async function handleRunBatchAction() {
    if (!canRunBatchAction) return;

    setBatching(true);
    setActionMessage(null);
    try {
      const created = await makeApplicationsForSelectedJobs();

      if (created.length > 0) {
        setActionMessage({
          text: `Created ${created.length} applications.`,
          tone: "info",
        });
        setSelectedJobIds(new Set());
        fetchJobs();
      }
    } catch (err) {
      console.error(err);
      setActionMessage({
        text: err instanceof Error ? err.message : "Could not complete the selected action.",
        tone: "error",
      });
    } finally {
      setBatching(false);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold">Jobs</h1>
        <div className="flex items-center gap-3 flex-1 justify-end">
          <JobFilters onSearch={fetchJobs} />
        </div>
      </div>

      {jobsLoading && jobs.length === 0 ? (
        <LoadingIndicator label="Loading latest jobs..." />
      ) : jobs.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-card border-2 border-dashed border-border">
          <Briefcase className="w-12 h-12 text-text-muted mx-auto mb-3" />
          <p className="text-text-secondary">No saved jobs yet.</p>
          <p className="text-sm text-text-muted mt-1">Use the Chrome extension to capture jobs from posting pages.</p>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex items-center gap-3 px-4 py-2 bg-white border border-border rounded-card">
            <input
              ref={selectAllRef}
              type="checkbox"
              checked={allLoadedSelected}
              onChange={(e) => handleSelectAllLoaded(e.target.checked)}
              className="h-4 w-4 rounded border-border text-brand-600 focus:ring-brand-600"
              aria-label="Select all loaded jobs"
            />
            <span className="text-sm text-text-secondary">
              Select all
              {selectedCount > 0 ? ` (${selectedCount} selected)` : ""}
            </span>
            <div className="ml-auto flex items-center gap-2">
              <span className="relative group inline-flex">
                <button
                  type="button"
                  onClick={handleRunBatchAction}
                  disabled={!canRunBatchAction}
                  className="px-3 py-1.5 bg-brand-900 text-white text-sm font-medium rounded-btn hover:bg-brand-800 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {batching ? "Creating..." : "Make applications"}
                </button>
                {!canRunBatchAction && runActionDisabledReason && (
                  <span className="pointer-events-none absolute right-0 top-full z-30 mt-2 hidden whitespace-nowrap rounded bg-gray-900 px-2 py-1 text-xs text-white shadow-lg group-hover:block">
                    {runActionDisabledReason}
                  </span>
                )}
              </span>
            </div>
          </div>
          {actionMessage && (
            <p className={`px-1 text-sm ${actionMessage.tone === "error" ? "text-red-600" : "text-text-secondary"}`}>
              {actionMessage.text}
            </p>
          )}
          {jobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              selected={selectedJobIds.has(job.id)}
              onSelectedChange={handleSelectJob}
              canApply={Boolean(isSignedIn)}
              onApply={setApplyJob}
            />
          ))}
          <div ref={loadMoreRef} className="h-8" />
          {jobsLoadingMore && (
            <LoadingIndicator compact label="Loading more..." className="justify-center py-3" />
          )}
        </div>
      )}
      {applyJob && (
        <ApplicationCreateModal
          preSelectedJob={applyJob}
          onClose={() => setApplyJob(null)}
          onCreated={() => {
            setApplyJob(null);
            navigate("/kanban");
          }}
        />
      )}
    </div>
  );
}
