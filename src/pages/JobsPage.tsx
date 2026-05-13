import { useEffect, useState } from "react";
import { useStore } from "@/store";
import { Briefcase, Plus } from "lucide-react";
import { JobCard } from "@/components/job/JobCard";
import { JobCreateModal } from "@/components/job/JobCreateModal";

export function JobsPage() {
  const { jobs, fetchJobs } = useStore();
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => { fetchJobs(); }, [fetchJobs]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Jobs</h1>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2 bg-brand-900 text-white text-sm font-medium rounded-btn hover:bg-brand-800"
        >
          <Plus className="w-4 h-4" /> Add Job
        </button>
      </div>

      {jobs.length === 0 && !showCreate ? (
        <div className="text-center py-16 bg-white rounded-card border-2 border-dashed border-border">
          <Briefcase className="w-12 h-12 text-text-muted mx-auto mb-3" />
          <p className="text-text-secondary">No saved jobs yet.</p>
          <p className="text-sm text-text-muted mt-1">Paste a job description and let AI extract the details.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {jobs.map((j) => (
            <JobCard key={j.id} job={j} />
          ))}
        </div>
      )}

      <JobCreateModal open={showCreate} onClose={() => setShowCreate(false)} />
    </div>
  );
}
