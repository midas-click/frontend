/// ─── Shared Types ───────────────────────────────────────────────

export enum ApplicationStage {
  Applied = "applied",
  PhoneScreen = "phone_screen",
  Technical = "technical",
  TeamInterview = "team_interview",
  Offer = "offer",
  Rejected = "rejected",
}

export const KANBAN_STAGES: ApplicationStage[] = [
  ApplicationStage.Applied,
  ApplicationStage.PhoneScreen,
  ApplicationStage.Technical,
  ApplicationStage.TeamInterview,
  ApplicationStage.Offer,
  ApplicationStage.Rejected,
];

export const DEFAULT_KANBAN_COLUMNS: { id: string; label: string; color: string }[] = [
  { id: "applied", label: "Applied", color: "bg-purple-50 border-purple-200" },
  { id: "phone_screen", label: "Phone Screen", color: "bg-blue-50 border-blue-200" },
  { id: "technical", label: "Technical", color: "bg-orange-50 border-orange-200" },
  { id: "team_interview", label: "Team Interview", color: "bg-green-50 border-green-200" },
  { id: "offer", label: "Offer", color: "bg-yellow-50 border-yellow-200" },
  { id: "rejected", label: "Rejected", color: "bg-red-50 border-red-200" },
];

export interface CommunicationLog {
  date: string;
  channel: string;
  summary: string;
  raw_content?: string;
}

export interface TimelineEvent {
  date: string;
  event: string;
  detail?: string;
}

export interface Application {
  id: string;
  user_id: string;
  job_id?: string;
  job_title: string;
  company: string;
  location?: string;
  salary_expectation?: string;
  stage: ApplicationStage | string;
  initial_contact_date?: string;
  resume_ids: string[];
  tags: string[];
  match_score?: number;
  match_explanation?: string;
  communication_log: CommunicationLog[];
  timeline: TimelineEvent[];
  follow_up_date?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface ApplicationCreate {
  job_id?: string;
  job_title: string;
  company: string;
  stage?: string;
  location?: string;
  salary_expectation?: string;
  initial_contact_date?: string;
  resume_ids?: string[];
  tags?: string[];
  notes?: string;
}

export interface ApplicationUpdate {
  job_title?: string;
  company?: string;
  location?: string;
  salary_expectation?: string;
  initial_contact_date?: string;
  resume_ids?: string[];
  tags?: string[];
  match_score?: number;
  match_explanation?: string;
  follow_up_date?: string;
  notes?: string;
}

// ── Resume ──────────────────────────────────────
export interface ResumeSection {
  title: string;
  content: string;
}

export interface Resume {
  id: string;
  user_id: string;
  original_filename: string;
  s3_key: string;
  s3_url?: string;
  raw_text?: string;
  sections: ResumeSection[];
  total_applications: number;
  interview_count: number;
  offer_count: number;
  tags: string[];
  version: number;
  created_at: string;
}

// ── Job ─────────────────────────────────────────
export interface Job {
  id: string;
  user_id: string;
  title: string;
  company: string;
  description?: string;
  location?: string;
  remote?: boolean;
  salary_range?: string;
  source_url?: string;
  source_name: string;
  tags: string[];
  created_at: string;
}

export interface JobCreate {
  title: string;
  company: string;
  description?: string;
  location?: string;
  remote?: boolean;
  salary_range?: string;
  source_url?: string;
  tags?: string[];
}

// ── Analytics ───────────────────────────────────
export interface AnalyticsOverview {
  total_applications: number;
  interview_rate: number;
  offer_rate: number;
  rejection_rate: number;
  by_stage: Record<string, number>;
}

export interface ResumePerformance {
  id: string;
  filename: string;
  version: number;
  applications: number;
  interviews: number;
  offers: number;
}

export interface IndustryTrend {
  tag: string;
  total: number;
  interview_rate: number;
  offer_rate: number;
}
