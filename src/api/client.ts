/// ─── API Client — typed fetch wrapper ────────────────────────────

const BASE = import.meta.env.VITE_API_BASE_URL || "/api/v1";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json", ...options?.headers },
    ...options,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail || `HTTP ${res.status}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

// ── Applications ─────────────────────────────
export const applicationsApi = {
  list: (params?: Record<string, string>) => {
    const qs = params ? "?" + new URLSearchParams(params) : "";
    return request<any[]>(`/applications${qs}`);
  },
  get: (id: string) => request<any>(`/applications/${id}`),
  create: (data: any) =>
    request<any>("/applications", { method: "POST", body: JSON.stringify(data) }),
  update: (id: string, data: any) =>
    request<any>(`/applications/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  delete: (id: string) =>
    request<void>(`/applications/${id}`, { method: "DELETE" }),
  moveStage: (id: string, stage: string, detail?: string) =>
    request<any>(`/applications/${id}/stage`, {
      method: "PATCH",
      body: JSON.stringify({ stage, detail }),
    }),
  addCommunication: (id: string, data: any) =>
    request<any>(`/applications/${id}/communications`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
};

// ── Resumes ──────────────────────────────────
export const resumesApi = {
  list: () => request<any[]>("/resumes"),
  get: (id: string) => request<any>(`/resumes/${id}`),
  upload: async (file: File) => {
    const form = new FormData();
    form.append("file", file);
    const res = await fetch(`${BASE}/resumes/upload`, { method: "POST", body: form });
    if (!res.ok) throw new Error("Upload failed");
    return res.json();
  },
  uploadUrl: (filename: string) =>
    request<{ upload_url: string; s3_key: string }>(
      `/resumes/upload-url?filename=${encodeURIComponent(filename)}`,
      { method: "POST" },
    ),
  versions: (id: string) => request<any[]>(`/resumes/${id}/versions`),
  delete: (id: string) =>
    request<void>(`/resumes/${id}`, { method: "DELETE" }),
};

// ── Jobs ─────────────────────────────────────
export const jobsApi = {
  list: (params?: Record<string, string>) => {
    const qs = params ? "?" + new URLSearchParams(params) : "";
    return request<any[]>(`/jobs${qs}`);
  },
  get: (id: string) => request<any>(`/jobs/${id}`),
  create: (data: any) =>
    request<any>("/jobs", { method: "POST", body: JSON.stringify(data) }),
  update: (id: string, data: any) =>
    request<any>(`/jobs/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  analyze: (rawText: string) =>
    request<any>("/jobs/analyze", { method: "POST", body: JSON.stringify({ raw_text: rawText }) }),
  delete: (id: string) => request<void>(`/jobs/${id}`, { method: "DELETE" }),
};

// ── Tailoring ────────────────────────────────
export const tailoringApi = {
  tailor: (data: {
    resume_id: string;
    mode: string;
    job_id?: string;
    job_description?: string;
    job_title?: string;
    company?: string;
    keywords?: string;
  }) =>
    request<any>("/tailor", { method: "POST", body: JSON.stringify(data) }),
  matchScore: (data: { resume_id: string; job_description: string }) =>
    request<any>("/match-score", { method: "POST", body: JSON.stringify(data) }),
  interviewQuestions: (data: { job_description: string; role?: string }) =>
    request<any>("/interview-questions", { method: "POST", body: JSON.stringify(data) }),
};

// ── Analytics ───────────────────────────────
export const analyticsApi = {
  overview: () => request<any>("/analytics/overview"),
  resumes: () => request<any[]>("/analytics/resumes"),
  trends: () => request<any[]>("/analytics/trends"),
};
