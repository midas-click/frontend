/// ─── Shared Types ───────────────────────────────────────────────

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
  org_id: string;
  profile_id?: string;
  job_id?: string;
  job_title: string;
  company: string;
  location?: string;
  source_url?: string;
  salary_expectation?: string;
  stage: string;
  initial_contact_date?: string;
  resume_id?: string;
  resume_filename?: string;
  tags: string[];
  match_score?: number;
  match_explanation?: string;
  communication_log: CommunicationLog[];
  timeline: TimelineEvent[];
  follow_up_date?: string;
  created_at: string;
  updated_at: string;
}

export interface ApplicationCreate {
  job_id?: string;
  job_title: string;
  company: string;
  stage?: string;
  location?: string;
  source_url?: string;
  salary_expectation?: string;
  initial_contact_date?: string;
  resume_id?: string;
  tags?: string[];
  match_score?: number | null;
  match_explanation?: string | null;
}

export interface ApplicationBatchCreate {
  job_ids: string[];
}

export type ListParams = Record<string, string>;
export type QueryParams = Record<string, string | number | undefined>;

export interface PaginatedResponse<T> {
  items: T[];
  next_cursor?: string | null;
  has_more: boolean;
}

export interface CursorLoadingState {
  cursor: string | null;
  hasMore: boolean;
  loading: boolean;
}

export type StagePagination = Record<string, CursorLoadingState>;

export type EmbeddingStatus = "disabled" | "pending" | "processing" | "completed" | "failed";

// ── Profile ─────────────────────────────────────
export interface Profile {
  id: string;
  user_id: string;
  org_id: string;
  name: string;
  email?: string;
  headline?: string;
  is_active: boolean;
  created_at: string;
}

export interface ProfileCreate {
  name: string;
  email?: string;
  headline?: string;
}

// ── Resume ──────────────────────────────────────
export interface ResumeSection {
  title: string;
  content: string;
}

export interface Resume {
  id: string;
  user_id: string;
  org_id: string;
  profile_id?: string;
  original_filename: string;
  s3_key: string;
  s3_url?: string;
  raw_text?: string;
  sections: ResumeSection[];
  total_applications: number;
  interview_count: number;
  offer_count: number;
  tags: string[];
  embedding_status?: EmbeddingStatus;
  embedding_error?: string | null;
  embedded_at?: string | null;
  created_at: string;
}

export interface ResumeMatchScore {
  resume_id: string;
  resume_filename: string;
  match_score?: number | null;
  match_explanation?: string | null;
}

// ── Job ─────────────────────────────────────────
export interface Job {
  id: string;
  title: string;
  company: string;
  location?: string;
  remote?: boolean;
  salary_range?: string;
  source_url?: string;
  tags: string[];
  embedding_status?: EmbeddingStatus;
  embedding_error?: string | null;
  embedded_at?: string | null;
  vector_store?: string | null;
  vector_chunk_count?: number;
  created_at: string;
}

// ── Analytics ───────────────────────────────────
export interface AnalyticsOverview {
  total_applications: number;
  interview_rate: number;
  offer_rate: number;
  rejection_rate: number;
  by_stage: Record<string, number>;
  jobs_last_24h: number;
  jobs_this_month: number;
  applications_last_24h: number;
  applications_this_month: number;
}

export interface ResumePerformance {
  id: string;
  filename: string;
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
