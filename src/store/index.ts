import { create } from "zustand";
import { applicationsApi, jobsApi, resumesApi } from "@/api/client";
import { createStagePagination, mergeByIdSorted } from "@/lib/pagination";
import { STAGES } from "@/lib/utils";
import {
  Application,
  ApplicationCreate,
  Job,
  ListParams,
  PaginatedResponse,
  Resume,
  StagePagination,
} from "@/types";

const PAGE_SIZE = 50;
const KANBAN_PAGE_SIZE = 15;
const JOB_PAGE_SIZE = 50;
const STAGE_IDS = Object.keys(STAGES);

function mergeApplications(current: Application[], incoming: Application[]) {
  return mergeByIdSorted(current, incoming, (app) => app.updated_at);
}

function mergeJobs(current: Job[], incoming: Job[]) {
  return mergeByIdSorted(current, incoming, (job) => job.created_at);
}

interface AppState {
  activeProfileId: string | null;
  setActiveProfileId: (id: string | null) => void;

  applications: Application[];
  applicationFilters: ListParams;
  loading: boolean;
  loadingMore: boolean;
  hasMoreApplications: boolean;
  nextApplicationsCursor: string | null;
  kanbanPagination: StagePagination;
  error: string | null;
  fetchApplications: (params?: ListParams) => Promise<void>;
  loadMoreApplications: () => Promise<void>;
  fetchKanbanApplications: (params?: ListParams) => Promise<void>;
  loadMoreKanbanStage: (stage: string) => Promise<void>;
  createApplication: (data: ApplicationCreate) => Promise<Application>;
  createApplicationsForJobs: (jobIds: string[]) => Promise<Application[]>;
  moveStage: (id: string, stage: string) => Promise<void>;

  resumes: Resume[];
  resumesLoaded: boolean;
  resumesLoading: boolean;
  fetchResumes: (options?: { force?: boolean }) => Promise<void>;

  jobs: Job[];
  jobFilters: ListParams;
  jobsLoading: boolean;
  jobsLoadingMore: boolean;
  hasMoreJobs: boolean;
  nextJobsCursor: string | null;
  fetchJobs: (params?: ListParams) => Promise<void>;
  loadMoreJobs: () => Promise<void>;
}

export const useStore = create<AppState>((set, get) => ({
  activeProfileId: localStorage.getItem("midas-active-profile"),
  setActiveProfileId: (id) => {
    if (id) {
      localStorage.setItem("midas-active-profile", id);
    } else {
      localStorage.removeItem("midas-active-profile");
    }
    set({ activeProfileId: id });
  },

  applications: [],
  applicationFilters: {},
  loading: false,
  loadingMore: false,
  hasMoreApplications: true,
  nextApplicationsCursor: null,
  kanbanPagination: createStagePagination(STAGE_IDS),
  error: null,

  fetchApplications: async (params) => {
    const filters = params || {};
    set({
      applicationFilters: filters,
      loading: true,
      error: null,
      hasMoreApplications: true,
      nextApplicationsCursor: null,
    });
    try {
      const page: PaginatedResponse<Application> = await applicationsApi.list({ ...filters, limit: PAGE_SIZE });
      set({
        applications: page.items,
        hasMoreApplications: page.has_more,
        nextApplicationsCursor: page.next_cursor || null,
        loading: false,
      });
    } catch (e: any) {
      set({ error: e.message, loading: false });
    }
  },

  loadMoreApplications: async () => {
    const {
      applicationFilters,
      hasMoreApplications,
      loadingMore,
      nextApplicationsCursor,
    } = get();
    if (!hasMoreApplications || loadingMore || !nextApplicationsCursor) return;

    set({ loadingMore: true, error: null });
    try {
      const page = await applicationsApi.list({
        ...applicationFilters,
        cursor: nextApplicationsCursor,
        limit: PAGE_SIZE,
      });
      set((state) => ({
        applications: mergeApplications(state.applications, page.items),
        hasMoreApplications: page.has_more,
        nextApplicationsCursor: page.next_cursor || null,
        loadingMore: false,
      }));
    } catch (e: any) {
      set({ error: e.message, loadingMore: false });
    }
  },

  fetchKanbanApplications: async (params) => {
    const filters = params || {};
    set({
      applicationFilters: filters,
      loading: true,
      error: null,
      kanbanPagination: createStagePagination(STAGE_IDS),
    });
    try {
      const pages = await Promise.all(
        STAGE_IDS.map(async (stage) => ({
          stage,
          page: await applicationsApi.list({
            ...filters,
            stage,
            limit: KANBAN_PAGE_SIZE,
          }),
        })),
      );
      const kanbanPagination = createStagePagination(STAGE_IDS);
      for (const { stage, page } of pages) {
        kanbanPagination[stage] = {
          cursor: page.next_cursor || null,
          hasMore: page.has_more,
          loading: false,
        };
      }
      set({
        applications: mergeApplications([], pages.flatMap(({ page }) => page.items)),
        kanbanPagination,
        loading: false,
      });
    } catch (e: any) {
      set({ error: e.message, loading: false });
    }
  },

  loadMoreKanbanStage: async (stage) => {
    const { applicationFilters, kanbanPagination } = get();
    const stageState = kanbanPagination[stage];
    if (!stageState?.hasMore || stageState.loading || !stageState.cursor) return;

    set((state) => ({
      kanbanPagination: {
        ...state.kanbanPagination,
        [stage]: { ...stageState, loading: true },
      },
    }));

    try {
      const page = await applicationsApi.list({
        ...applicationFilters,
        stage,
        cursor: stageState.cursor,
        limit: KANBAN_PAGE_SIZE,
      });
      set((state) => ({
        applications: mergeApplications(state.applications, page.items),
        kanbanPagination: {
          ...state.kanbanPagination,
          [stage]: {
            cursor: page.next_cursor || null,
            hasMore: page.has_more,
            loading: false,
          },
        },
      }));
    } catch (e: any) {
      set((state) => ({
        error: e.message,
        kanbanPagination: {
          ...state.kanbanPagination,
          [stage]: { ...stageState, loading: false },
        },
      }));
    }
  },

  createApplication: async (data) => {
    const app = await applicationsApi.create(data);
    set((state) => ({ applications: mergeApplications([app], state.applications) }));
    return app;
  },

  createApplicationsForJobs: async (jobIds) => {
    const apps = await applicationsApi.createBatch({ job_ids: jobIds });
    set((state) => ({ applications: mergeApplications(apps, state.applications) }));
    return apps;
  },

  moveStage: async (id, stage) => {
    const prev = get().applications;
    set({
      applications: prev.map((app) => (app.id === id ? { ...app, stage } : app)),
    });
    try {
      await applicationsApi.moveStage(id, stage);
    } catch {
      set({ applications: prev });
    }
  },

  resumes: [],
  resumesLoaded: false,
  resumesLoading: false,
  fetchResumes: async (options) => {
    const { resumesLoaded, resumesLoading } = get();
    if (!options?.force && (resumesLoaded || resumesLoading)) return;
    set({ resumesLoading: true });
    try {
      const list = await resumesApi.list();
      set({ resumes: list, resumesLoaded: true, resumesLoading: false });
    } catch (e: any) {
      set({ error: e.message, resumesLoading: false });
      throw e;
    }
  },

  jobs: [],
  jobFilters: {},
  jobsLoading: false,
  jobsLoadingMore: false,
  hasMoreJobs: true,
  nextJobsCursor: null,
  fetchJobs: async (params) => {
    const filters = params || {};
    set({
      jobFilters: filters,
      jobsLoading: true,
      error: null,
      hasMoreJobs: true,
      nextJobsCursor: null,
    });
    try {
      const page: PaginatedResponse<Job> = await jobsApi.listPage({ ...filters, limit: JOB_PAGE_SIZE });
      set({
        jobs: page.items,
        hasMoreJobs: page.has_more,
        nextJobsCursor: page.next_cursor || null,
        jobsLoading: false,
      });
    } catch (e: any) {
      set({ error: e.message, jobsLoading: false });
    }
  },

  loadMoreJobs: async () => {
    const { jobFilters, hasMoreJobs, jobsLoadingMore, nextJobsCursor } = get();
    if (!hasMoreJobs || jobsLoadingMore || !nextJobsCursor) return;

    set({ jobsLoadingMore: true, error: null });
    try {
      const page = await jobsApi.listPage({
        ...jobFilters,
        cursor: nextJobsCursor,
        limit: JOB_PAGE_SIZE,
      });
      set((state) => ({
        jobs: mergeJobs(state.jobs, page.items),
        hasMoreJobs: page.has_more,
        nextJobsCursor: page.next_cursor || null,
        jobsLoadingMore: false,
      }));
    } catch (e: any) {
      set({ error: e.message, jobsLoadingMore: false });
    }
  },
}));
