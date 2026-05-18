import { useEffect, useRef, useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import { Briefcase, Plus } from "lucide-react";
import { JobCard } from "@/components/job/JobCard";
import { JobCreateModal } from "@/components/job/JobCreateModal";
import { JobFilters } from "@/components/job/JobFilters";
import { useStore } from "@/store";
import { STAGES } from "@/lib/utils";

type BatchAction = "open" | "make" | "open_make";
type ActionMessage = { text: string; tone: "info" | "error" };

export function JobsPage() {
  const { isSignedIn } = useAuth();
  const {
    createApplication,
    fetchJobs,
    fetchResumes,
    hasMoreJobs,
    jobs,
    jobsLoading,
    jobsLoadingMore,
    loadMoreJobs,
    resumes,
  } = useStore();
  const [showCreate, setShowCreate] = useState(false);
  const [selectedJobIds, setSelectedJobIds] = useState<Set<string>>(() => new Set());
  const [batchAction, setBatchAction] = useState<BatchAction>("open");
  const [batchActionOpen, setBatchActionOpen] = useState(false);
  const [batching, setBatching] = useState(false);
  const [actionMessage, setActionMessage] = useState<ActionMessage | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const selectAllRef = useRef<HTMLInputElement | null>(null);
  const selectedJobs = jobs.filter((job) => selectedJobIds.has(job.id));
  const selectedCount = selectedJobs.length;
  const allLoadedSelected = jobs.length > 0 && jobs.every((job) => selectedJobIds.has(job.id));
  const someLoadedSelected = jobs.some((job) => selectedJobIds.has(job.id));
  const canRunBatchAction = Boolean(isSignedIn) && selectedCount > 1 && !batching;
  const runActionDisabledReason = !isSignedIn
    ? "Need to login to run action"
    : selectedCount <= 1
      ? "Select at least 2 jobs"
      : "";
  const batchActionLabel = batchAction === "open"
    ? "Open jobs"
    : batchAction === "make"
      ? "Make applications"
      : "Open and make";

  useEffect(() => {
    fetchJobs();
    fetchResumes();
  }, [fetchJobs, fetchResumes]);

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

  function openSelectedJobs() {
    let openedCount = 0;
    for (const job of selectedJobs) {
      if (job.source_url) {
        window.open(job.source_url, `job-posting-${job.id}`, "noopener,noreferrer");
        openedCount += 1;
      }
    }
    return openedCount;
  }

  async function makeApplicationsForSelectedJobs() {
    const defaultResume = resumes[0];
    if (!defaultResume) {
      setActionMessage({
        text: "Upload at least one resume before creating applications.",
        tone: "error",
      });
      return false;
    }

    await Promise.all(
      selectedJobs.map((job) => createApplication({
        job_id: job.id,
        job_title: job.title,
        company: job.company,
        stage: Object.keys(STAGES)[0],
        location: job.location || "",
        source_url: job.source_url || undefined,
        salary_expectation: job.salary_range || undefined,
        tags: job.tags,
        notes: job.description || undefined,
        resume_id: defaultResume.id,
      })),
    );
    return true;
  }

  async function handleRunBatchAction() {
    if (!canRunBatchAction) return;

    setBatching(true);
    setActionMessage(null);
    try {
      const openedCount = batchAction === "open" || batchAction === "open_make"
        ? openSelectedJobs()
        : 0;

      const created = batchAction === "make" || batchAction === "open_make"
        ? await makeApplicationsForSelectedJobs()
        : false;

      if (batchAction === "open") {
        setActionMessage({ text: `Opened ${openedCount} job postings.`, tone: "info" });
      } else if (created) {
        setActionMessage({
          text: batchAction === "open_make"
            ? `Opened ${openedCount} job postings and created ${selectedJobs.length} applications.`
            : `Created ${selectedJobs.length} applications.`,
          tone: "info",
        });
        setSelectedJobIds(new Set());
        fetchJobs();
      }
    } catch (err) {
      console.error(err);
      setActionMessage({ text: "Could not complete the selected action.", tone: "error" });
    } finally {
      setBatching(false);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold">Jobs</h1>
        <div className="flex items-center gap-3 flex-1 justify-end">
          <JobFilters onSearch={fetchJobs} isSignedIn={Boolean(isSignedIn)} />
          {isSignedIn && (
            <button
              onClick={() => setShowCreate(true)}
              className="flex items-center gap-2 px-4 py-2 bg-brand-900 text-white text-sm font-medium rounded-btn hover:bg-brand-800 shrink-0"
            >
              <Plus className="w-4 h-4" /> Add Job
            </button>
          )}
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
              <span className="text-sm font-medium text-text-secondary">Action Type: </span>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setBatchActionOpen((open) => !open)}
                  onBlur={() => setTimeout(() => setBatchActionOpen(false), 120)}
                  className="border rounded-btn px-3 py-1.5 text-sm bg-white min-w-40 text-left"
                >
                  {batchActionLabel}
                </button>
                {batchActionOpen && (
                  <div className="absolute right-0 z-20 mt-1 w-48 bg-white border border-border rounded-btn shadow-lg py-1">
                    <button
                      type="button"
                      onMouseDown={() => { setBatchAction("open"); setBatchActionOpen(false); }}
                      className="block w-full px-3 py-2 text-left text-sm hover:bg-surface-secondary"
                    >
                      Open jobs
                    </button>
                    <button
                      type="button"
                      onMouseDown={() => { setBatchAction("make"); setBatchActionOpen(false); }}
                      className="block w-full px-3 py-2 text-left text-sm hover:bg-surface-secondary"
                    >
                      Make applications
                    </button>
                    <button
                      type="button"
                      onMouseDown={() => { setBatchAction("open_make"); setBatchActionOpen(false); }}
                      className="block w-full px-3 py-2 text-left text-sm hover:bg-surface-secondary"
                    >
                      Open and make
                    </button>
                  </div>
                )}
              </div>
              <span className="relative group inline-flex">
                <button
                  type="button"
                  onClick={handleRunBatchAction}
                  disabled={!canRunBatchAction}
                  className="px-3 py-1.5 bg-brand-900 text-white text-sm font-medium rounded-btn hover:bg-brand-800 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {batching ? "Running..." : "Run action"}
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
            />
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
