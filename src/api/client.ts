/// ─── API Client — typed fetch wrapper with Clerk auth ──────────

import type { Profile, ProfileCreate } from "@/types";

const BASE = import.meta.env.VITE_API_BASE_URL || "/api/v1";

// ── Token provider (set by Clerk auth context) ──
let _tokenProvider: (() => Promise<string | null>) | null = null;

export function setTokenProvider(provider: () => Promise<string | null>) {
  _tokenProvider = provider;
}

function getActiveProfileId(): string | null {
  return localStorage.getItem("midas-active-profile");
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options?.headers as Record<string, string>),
  };

  if (_tokenProvider) {
    const token = await _tokenProvider();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }

  const profileId = getActiveProfileId();
  if (profileId) {
    headers["X-Profile-Id"] = profileId;
  }

  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers,
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

// ── Profiles ─────────────────────────────────
export const profilesApi = {
  list: () => request<Profile[]>("/profiles"),
  get: (id: string) => request<Profile>(`/profiles/${id}`),
  create: (data: ProfileCreate) =>
    request<Profile>("/profiles", { method: "POST", body: JSON.stringify(data) }),
  update: (id: string, data: Partial<ProfileCreate>) =>
    request<Profile>(`/profiles/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  delete: (id: string) =>
    request<void>(`/profiles/${id}`, { method: "DELETE" }),
};

// ── Resumes ──────────────────────────────────
export const resumesApi = {
  list: () => request<any[]>("/resumes"),
  get: (id: string) => request<any>(`/resumes/${id}`),
  update: (id: string, data: any) =>
    request<any>(`/resumes/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  upload: async (file: File) => {
    const form = new FormData();
    form.append("file", file);

    const headers: Record<string, string> = {};
    if (_tokenProvider) {
      const token = await _tokenProvider();
      if (token) headers["Authorization"] = `Bearer ${token}`;
    }
    const profileId = getActiveProfileId();
    if (profileId) headers["X-Profile-Id"] = profileId;

    const res = await fetch(`${BASE}/resumes/upload`, {
      method: "POST",
      headers,
      body: form,
    });
    if (!res.ok) throw new Error("Upload failed");
    return res.json();
  },
  uploadUrl: (filename: string) =>
    request<{ upload_url: string; s3_key: string }>(
      `/resumes/upload-url?filename=${encodeURIComponent(filename)}`,
      { method: "POST" },
    ),
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
  analyze: (rawText: string, sourceUrl?: string) =>
    request<any>("/jobs/analyze", {
      method: "POST",
      body: JSON.stringify({ raw_text: rawText, source_url: sourceUrl || "" }),
    }),
  delete: (id: string) => request<void>(`/jobs/${id}`, { method: "DELETE" }),
};

// ── Analytics ───────────────────────────────
export const analyticsApi = {
  overview: () => request<any>("/analytics/overview"),
  resumes: () => request<any[]>("/analytics/resumes"),
  trends: () => request<any[]>("/analytics/trends"),
};

// ── Combined export for convenience ─────────
export const api = {
  applications: applicationsApi,
  profiles: profilesApi,
  resumes: resumesApi,
  jobs: jobsApi,
  analytics: analyticsApi,
};
