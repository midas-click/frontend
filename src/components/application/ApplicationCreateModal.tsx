import { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useStore } from "@/store";
import { jobsApi } from "@/api/client";
import type { Job, ResumeMatchScore } from "@/types";
import { getMatchScoreBadgeClass, STAGES } from "@/lib/utils";
import { X, Briefcase, FileText, Upload, Loader2 } from "lucide-react";
import clsx from "clsx";

const MATCH_SCORE_CACHE_TTL_MS = 1000;

type MatchScoreCacheEntry = {
  expiresAt: number;
  promise: Promise<ResumeMatchScore[]>;
};

const matchScoreRequests = new Map<string, MatchScoreCacheEntry>();
const matchScoreResults = new Map<string, ResumeMatchScore[]>();

function getMatchScoreCacheKey(jobId: string, resumeIdsKey: string) {
  return `${jobId}:${resumeIdsKey}`;
}

function fetchResumeMatchScoresOnce(jobId: string, resumeIdsKey: string) {
  const cacheKey = getMatchScoreCacheKey(jobId, resumeIdsKey);
  const cachedResult = matchScoreResults.get(cacheKey);
  if (cachedResult) return Promise.resolve(cachedResult);

  const now = Date.now();
  const cached = matchScoreRequests.get(cacheKey);
  if (cached && cached.expiresAt > now) return cached.promise;

  const promise = jobsApi.resumeMatchScores(jobId).then((scores) => {
    matchScoreResults.set(cacheKey, scores);
    return scores;
  });
  matchScoreRequests.set(cacheKey, {
    expiresAt: now + MATCH_SCORE_CACHE_TTL_MS,
    promise,
  });
  promise.catch(() => {
    const current = matchScoreRequests.get(cacheKey);
    if (current?.promise === promise) matchScoreRequests.delete(cacheKey);
  });
  return promise;
}

interface Props {
  onClose: () => void;
  onCreated: () => void;
  preSelectedJob: Job;
}

export function ApplicationCreateModal({ onClose, onCreated, preSelectedJob }: Props) {
  const navigate = useNavigate();
  const { createApplication, resumes, resumesLoaded, fetchResumes } = useStore();
  const [saving, setSaving] = useState(false);
  const [resumeId, setResumeId] = useState<string | null>(null);
  const [matchScores, setMatchScores] = useState<ResumeMatchScore[]>([]);
  const [loadingMatchScores, setLoadingMatchScores] = useState(false);
  const [matchScoreError, setMatchScoreError] = useState("");
  const resumeManuallySelectedRef = useRef(false);
  const resumeIdsKey = useMemo(() => resumes.map((resume) => resume.id).join("|"), [resumes]);

  useEffect(() => {
    if (!resumesLoaded) fetchResumes();
  }, [fetchResumes, resumesLoaded]);

  useEffect(() => {
    if (resumes.length > 0 && !resumeId) {
      setResumeId(resumes[0].id);
    }
  }, [resumes, resumeId]);

  useEffect(() => {
    if (!preSelectedJob.id || resumes.length === 0) {
      setMatchScores([]);
      setMatchScoreError("");
      return;
    }

    let cancelled = false;
    const selectedJobId = preSelectedJob.id;
    const cacheKey = getMatchScoreCacheKey(selectedJobId, resumeIdsKey);
    const cachedScores = matchScoreResults.get(cacheKey);

    if (cachedScores) {
      setMatchScores(cachedScores);
      setMatchScoreError("");
      setLoadingMatchScores(false);
      if (!resumeManuallySelectedRef.current) {
        const bestScore = cachedScores
          .filter((score) => score.match_score != null)
          .sort((a, b) => (b.match_score ?? -1) - (a.match_score ?? -1))[0];
        setResumeId(bestScore?.resume_id || resumes[0]?.id || null);
      }
      return;
    }

    setLoadingMatchScores(true);
    setMatchScoreError("");

    async function fetchMatchScores() {
      try {
        const scores = await fetchResumeMatchScoresOnce(selectedJobId, resumeIdsKey);
        if (cancelled) return;
        setMatchScores(scores);

        if (!resumeManuallySelectedRef.current) {
          const bestScore = scores
            .filter((score) => score.match_score != null)
            .sort((a, b) => (b.match_score ?? -1) - (a.match_score ?? -1))[0];
          setResumeId(bestScore?.resume_id || resumes[0]?.id || null);
        }
      } catch (error) {
        if (cancelled) return;
        setMatchScores([]);
        setMatchScoreError(error instanceof Error ? error.message : "Unable to calculate match scores");
        if (!resumeManuallySelectedRef.current) setResumeId(resumes[0]?.id || null);
      } finally {
        if (!cancelled) setLoadingMatchScores(false);
      }
    }

    fetchMatchScores();

    return () => {
      cancelled = true;
    };
  }, [preSelectedJob.id, resumeIdsKey]);

  function toggleResume(id: string) {
    resumeManuallySelectedRef.current = true;
    setResumeId((prev) => prev === id ? null : id);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!resumeId) return;
    setSaving(true);
    const selectedMatchScore = matchScores.find((score) => score.resume_id === resumeId);
    try {
      await createApplication({
        job_id: preSelectedJob.id,
        job_title: preSelectedJob.title,
        company: preSelectedJob.company,
        stage: Object.keys(STAGES)[0],
        location: preSelectedJob.location || "",
        source_url: preSelectedJob.source_url || undefined,
        salary_expectation: preSelectedJob.salary_range || undefined,
        tags: preSelectedJob.tags,
        resume_id: resumeId,
        match_score: selectedMatchScore?.match_score ?? undefined,
        match_explanation: selectedMatchScore?.match_explanation ?? undefined,
      });
      onCreated();
    } catch (err) { console.error(err); }
    finally { setSaving(false); }
  }

  const scoreByResumeId = new Map(matchScores.map((score) => [score.resume_id, score]));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div className="bg-white rounded-card shadow-xl w-full max-w-md p-6 relative" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-text-muted hover:text-text-secondary">
          <X className="w-5 h-5" />
        </button>
        <h2 className="text-lg font-bold mb-4">Apply to Job</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Attach Job */}
          <div>
            <label className="block text-sm font-medium mb-1">
              <Briefcase className="w-3.5 h-3.5 inline mr-1" />Attach Job
            </label>
            <div className="p-3 bg-brand-50 border border-brand-200 rounded-btn">
              <div>
                <p className="text-sm font-medium">{preSelectedJob.title}</p>
                <p className="text-xs text-text-secondary">
                  {preSelectedJob.company}
                  {preSelectedJob.location ? ` · ${preSelectedJob.location}` : ""}
                  {preSelectedJob.salary_range ? ` · ${preSelectedJob.salary_range}` : ""}
                </p>
              </div>
            </div>
          </div>

          {/* Attach Resume (required) */}
          <div>
            <div className="flex justify-between">
            <label className="flex items-center gap-1 text-sm font-medium mb-1">
              <FileText className="w-3.5 h-3.5" />
              <span>Attach Resume <span className="text-red-500">*</span></span>
            </label>
            {loadingMatchScores && (
              <div className="mb-2 flex items-center gap-2 text-xs text-green-700">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Calculating resume match scores...
              </div>
            )}
            {matchScoreError && (
              <p className="mb-2 text-xs text-amber-700">
                Match scores unavailable. You can still choose a resume manually.
              </p>
            )}
            </div>
            {resumes.length > 0 ? (
              <>
                
                <div className="flex flex-col gap-2">
                  {resumes.map((r) => {
                    const score = scoreByResumeId.get(r.id);
                    return (
                      <button key={r.id} type="button" onClick={() => toggleResume(r.id)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-tag text-xs border transition-colors text-left ${
                          resumeId === r.id ? "bg-brand-50 border-brand-300 text-brand-600" : "bg-white border-border text-text-secondary"
                        }`}>
                        <span>{r.original_filename}</span>
                        {score?.match_score != null && (
                          <span className={clsx("rounded-tag px-1.5 py-0.5 font-medium", getMatchScoreBadgeClass(score.match_score))}>
                            {score.match_score}%
                          </span>
                        )}
                        {score && score.match_score == null && (
                          <span className="rounded-tag bg-surface-secondary px-1.5 py-0.5 font-medium text-text-muted">
                            None
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </>
            ) : (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-btn">
                <p className="text-sm text-amber-700 mb-2">No resumes uploaded yet. A resume is required to create an application.</p>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    navigate("/resumes");
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 text-white text-sm font-medium rounded-btn hover:bg-amber-700 transition-colors"
                >
                  <Upload className="w-4 h-4" />
                  Upload a Resume
                </button>
              </div>
            )}
          </div>

          <div className="flex gap-3 justify-end pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-text-secondary hover:bg-surface-secondary rounded-btn">Cancel</button>
            <button type="submit" disabled={saving || !resumeId}
              className="px-4 py-2 bg-brand-900 text-white text-sm font-medium rounded-btn hover:bg-brand-800 disabled:opacity-50">
              {saving ? "Creating..." : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
