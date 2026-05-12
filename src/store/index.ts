/// ─── Zustand Store — Global state for applications ────────────────

import { create } from "zustand";
import {
  Application,
  ApplicationCreate,
  Resume,
  Job,
} from "@/types";
import { applicationsApi, resumesApi, jobsApi } from "@/api/client";

interface AppState {
  // ── Auth / Profile ─────────────────────────
  activeProfileId: string | null;
  setActiveProfileId: (id: string | null) => void;

  // ── Applications ──────────────────────────
  applications: Application[];
  loading: boolean;
  error: string | null;
  fetchApplications: (params?: Record<string, string>) => Promise<void>;
  createApplication: (data: ApplicationCreate) => Promise<Application>;
  moveStage: (id: string, stage: string) => Promise<void>;

  // ── Resumes ───────────────────────────────
  resumes: Resume[];
  fetchResumes: () => Promise<void>;

  // ── Jobs ──────────────────────────────────
  jobs: Job[];
  fetchJobs: () => Promise<void>;
}

export const useStore = create<AppState>((set, get) => ({
  // ── Auth / Profile ─────────────────────────
  activeProfileId: localStorage.getItem("midas-active-profile"),
  setActiveProfileId: (id) => {
    if (id) {
      localStorage.setItem("midas-active-profile", id);
    } else {
      localStorage.removeItem("midas-active-profile");
    }
    set({ activeProfileId: id });
  },

  // ── Applications ──────────────────────────
  applications: [],
  loading: false,
  error: null,

  fetchApplications: async (params) => {
    set({ loading: true, error: null });
    try {
      const apps = await applicationsApi.list(params);
      set({ applications: apps, loading: false });
    } catch (e: any) {
      set({ error: e.message, loading: false });
    }
  },

  createApplication: async (data) => {
    const app = await applicationsApi.create(data);
    set((s) => ({ applications: [app, ...s.applications] }));
    return app;
  },

  moveStage: async (id, stage) => {
    // Optimistic update
    const prev = get().applications;
    set({
      applications: prev.map((a) => (a.id === id ? { ...a, stage } : a)),
    });
    try {
      await applicationsApi.moveStage(id, stage);
    } catch {
      set({ applications: prev }); // rollback
    }
  },

  // ── Resumes ─────────────────────────────
  resumes: [],
  fetchResumes: async () => {
    const list = await resumesApi.list();
    set({ resumes: list });
  },

  // ── Jobs ────────────────────────────────
  jobs: [],
  fetchJobs: async () => {
    const list = await jobsApi.list();
    set({ jobs: list });
  },
}));
