import type { CursorLoadingState, QueryParams, StagePagination } from "@/types";

export function buildQueryString(params?: QueryParams) {
  if (!params) return "";
  const entries = Object.entries(params)
    .filter(([, value]) => value != null && value !== "")
    .map(([key, value]) => [key, String(value)]);
  return entries.length ? `?${new URLSearchParams(entries)}` : "";
}

export function mergeByIdSorted<T extends { id: string }>(
  current: T[],
  incoming: T[],
  getSortValue: (item: T) => string,
) {
  const byId = new Map(current.map((item) => [item.id, item]));
  for (const item of incoming) byId.set(item.id, item);
  return Array.from(byId.values()).sort((a, b) => {
    const byDate = new Date(getSortValue(b)).getTime() - new Date(getSortValue(a)).getTime();
    return byDate || b.id.localeCompare(a.id);
  });
}

export function createCursorState(): CursorLoadingState {
  return { cursor: null, hasMore: true, loading: false };
}

export function createStagePagination(stageIds: string[]): StagePagination {
  return Object.fromEntries(stageIds.map((stage) => [stage, createCursorState()]));
}
