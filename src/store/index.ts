import { create } from "zustand";
import { applicationsApi, jobsApi, resumesApi } from "@/api/client";
import { STAGES } from "@/lib/utils";
import {
  Application,
  ApplicationCreate,
  Job,
  Resume,
} from "@/types";

type ApplicationListParams = Record<string, string>;
type StagePagination = Record<string, { cursor: string | null; hasMore: boolean; loading: boolean }>;

interface ApplicationPage {
  items: Application[];
  next_cursor?: string | null;
  has_more: boolean;
}

const PAGE_SIZE = 50;
const KANBAN_PAGE_SIZE = 15;
const STAGE_IDS = Object.keys(STAGES);

function mergeApplications(current: Application[], incoming: Application[]) {
  const byId = new Map(current.map((app) => [app.id, app]));
  for (const app of incoming) byId.set(app.id, app);
  return Array.from(byId.values()).sort((a, b) => {
    const byDate = new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
    return byDate || b.id.localeCompare(a.id);
  });
}

function createStagePagination(): StagePagination {
  return Object.fromEntries(
    STAGE_IDS.map((stage) => [stage, { cursor: null, hasMore: true, loading: false }]),
  );
}

interface AppState {
  activeProfileId: string | null;
  setActiveProfileId: (id: string | null) => void;

  applications: Application[];
  applicationFilters: ApplicationListParams;
  loading: boolean;
  loadingMore: boolean;
  hasMoreApplications: boolean;
  nextApplicationsCursor: string | null;
  kanbanPagination: StagePagination;
  error: string | null;
  fetchApplications: (params?: ApplicationListParams) => Promise<void>;
  loadMoreApplications: () => Promise<void>;
  fetchKanbanApplications: (params?: ApplicationListParams) => Promise<void>;
  loadMoreKanbanStage: (stage: string) => Promise<void>;
  createApplication: (data: ApplicationCreate) => Promise<Application>;
  moveStage: (id: string, stage: string) => Promise<void>;

  resumes: Resume[];
  fetchResumes: () => Promise<void>;

  jobs: Job[];
  fetchJobs: () => Promise<void>;
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
  kanbanPagination: createStagePagination(),
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
      const page = await applicationsApi.list({ ...filters, limit: PAGE_SIZE }) as ApplicationPage;
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
      }) as ApplicationPage;
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
      kanbanPagination: createStagePagination(),
    });
    try {
      const pages = await Promise.all(
        STAGE_IDS.map(async (stage) => ({
          stage,
          page: await applicationsApi.list({
            ...filters,
            stage,
            limit: KANBAN_PAGE_SIZE,
          }) as ApplicationPage,
        })),
      );
      const kanbanPagination = createStagePagination();
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
      }) as ApplicationPage;
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
  fetchResumes: async () => {
    const list = await resumesApi.list();
    set({ resumes: list });
  },

  jobs: [],
  fetchJobs: async () => {
    const list = await jobsApi.list();
    set({ jobs: list });
  },
}));
