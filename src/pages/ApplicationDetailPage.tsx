import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation, Link } from "react-router-dom";
import { applicationsApi, resumesApi } from "@/api/client";
import { Application } from "@/types";
import { Building2, MapPin, Banknote, Trash2, ArrowLeft, ExternalLink, FileText } from "lucide-react";
import { getMatchScoreBadgeClass, STAGES } from "@/lib/utils";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { LoadingIndicator } from "@/components/shared/LoadingIndicator";
import { Timeline } from "@/components/application/Timeline";
import { CommunicationLog } from "@/components/application/CommunicationLog";
import { useStore } from "@/store";
import clsx from "clsx";

export function ApplicationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const deleteApplication = useStore((state) => state.deleteApplication);
  const [app, setApp] = useState<Application | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [commSummary, setCommSummary] = useState("");
  const [commChannel, setCommChannel] = useState("email");
  const [resumeGone, setResumeGone] = useState(false);
  const location = useLocation();

  useEffect(() => {
    if (id) applicationsApi.get(id).then(setApp).catch(console.error);
  }, [id]);

  useEffect(() => {
    if (app?.resume_id) {
      setResumeGone(false);
      resumesApi.get(app.resume_id).catch(() => setResumeGone(true));
    }
  }, [app?.resume_id]);

  async function addCommunication() {
    if (!id || !commSummary.trim()) return;
    await applicationsApi.addCommunication(id, { channel: commChannel, summary: commSummary });
    setCommSummary("");
    const updated = await applicationsApi.get(id);
    setApp(updated);
  }

  async function handleDelete() {
    if (!id) return;
    setDeleting(true);
    try {
      await deleteApplication(id);
      navigate("/applications");
    } catch (err) {
      console.error(err);
      setDeleting(false);
    }
  }

  if (!app) return <LoadingIndicator label="Loading application..." />;

  const from = (location.state as any)?.from;
  const backTo = from === "kanban" ? "/kanban" : "/applications";
  const backLabel = backTo === "/kanban" ? "Back to Kanban" : "Back to Applicants";
  const resumeLink = app.resume_id && app.resume_filename
    ? resumeGone
      ? (
        <span className="inline-flex items-center gap-1.5 px-0 py-1 text-text-secondary text-xs font-medium">
          <FileText className="w-3 h-3" />{app.resume_filename}
        </span>
      )
      : (
        <Link to={`/resumes/${app.resume_id}`} className="inline-flex items-center gap-1.5 px-0 py-1 text-blue-600 rounded-btn text-xs font-medium hover:underline">
          <FileText className="w-3 h-3" />{app.resume_filename}
        </Link>
      )
    : null;

  return (
    <div className="w-full">
      <Link to={backTo} className="inline-flex items-center gap-1 text-sm text-text-secondary hover:text-text-primary mb-4">
        <ArrowLeft className="w-4 h-4" /> {backLabel}
      </Link>

      {/* Header */}
      <div className="bg-white rounded-card border border-border shadow-card p-6 mb-6">
        <div>
          <div className="flex items-start justify-between mb-3">
            {app.source_url ? (
              <a
                href={app.source_url}
                target="_blank"
                rel="noreferrer"
                className="group inline-flex min-w-0 flex-1 items-center gap-2"
              >
                <h2 className="truncate text-xl font-bold group-hover:text-brand-600">{app.job_title}</h2>
                <ExternalLink className="h-4 w-4 shrink-0 text-text-muted group-hover:text-brand-600" />
              </a>
            ) : (
              <h2 className="min-w-0 flex-1 truncate text-2xl font-bold">{app.job_title}</h2>
            )}
            <div className="flex items-center gap-2 shrink-0 ml-4">
              <span className="px-2.5 py-0.5 rounded-full text-sm font-medium capitalize" style={{ backgroundColor: STAGES[app.stage as string]?.bg, color: STAGES[app.stage as string]?.text }}>{STAGES[app.stage as string]?.label || app.stage}</span>
              <button onClick={() => setDeleteOpen(true)} className="p-1.5 text-text-muted hover:text-red-500 border border-border rounded-btn" title="Delete"><Trash2 className="w-3.5 h-3.5" /></button>
            </div>
          </div>
          <div className="flex items-center gap-4 text-text-secondary flex-wrap">
            <span className="flex items-center gap-1"><Building2 className="w-4 h-4" />{app.company}</span>
            {app.location && <span className="flex items-center gap-1"><MapPin className="w-4 h-4" />{app.location}</span>}
            {app.salary_expectation && <span className="flex items-center gap-1"><Banknote className="w-4 h-4" />{app.salary_expectation}</span>}
            {resumeLink}
          </div>
          <div className="flex gap-2 mt-3 flex-wrap">
            {app.match_score != null && (
              <span className={clsx("px-2.5 py-0.5 rounded-tag text-sm font-medium", getMatchScoreBadgeClass(app.match_score))}>
                Match: {app.match_score}%
              </span>
            )}
            {app.tags.map(t => <span key={t} className="px-2.5 py-0.5 bg-brand-50 text-brand-600 rounded-tag text-xs font-medium">{t}</span>)}
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="bg-white rounded-card border border-border shadow-card p-6 mb-6">
        <Timeline events={app.timeline} />
      </div>

      {/* Communication Log */}
      <div className="bg-white rounded-card border border-border shadow-card p-6 mb-6">
        <CommunicationLog logs={app.communication_log} />
        <div className="flex gap-2">
          <select value={commChannel} onChange={e => setCommChannel(e.target.value)} className="border rounded-btn px-2 text-sm">
            <option value="email">Email</option>
            <option value="phone">Phone</option>
            <option value="linkedin">LinkedIn</option>
            <option value="in_person">In Person</option>
          </select>
          <input value={commSummary} onChange={e => setCommSummary(e.target.value)} placeholder="Add a note…" className="flex-1 border rounded-btn px-3 py-2 text-sm" onKeyDown={e => e.key === "Enter" && addCommunication()} />
          <button onClick={addCommunication} className="px-4 py-2 bg-brand-900 text-white text-sm rounded-btn hover:bg-brand-800">Add</button>
        </div>
      </div>

      <ConfirmDialog
        open={deleteOpen}
        title="Delete Application"
        message="Are you sure you want to delete this application? All tracking data, timeline events, and communication logs will be permanently removed."
        loading={deleting}
        loadingLabel="Deleting..."
        onConfirm={handleDelete}
        onCancel={() => setDeleteOpen(false)}
      />
    </div>
  );
}
