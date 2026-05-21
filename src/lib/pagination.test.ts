import {
  buildQueryString,
  createCursorState,
  createStagePagination,
  mergeByIdSorted,
} from "./pagination";

// Omits empty query values while preserving meaningful numeric and string filters.
test("buildQueryString filters empty values and serializes params", () => {
  expect(buildQueryString({ search: "engineer", limit: 25, cursor: "", tag: undefined })).toBe(
    "?search=engineer&limit=25",
  );
});

// Returns an empty query string when no params are provided.
test("buildQueryString returns empty string without params", () => {
  expect(buildQueryString()).toBe("");
});

// Merges incoming items by id and keeps the newest item per id.
test("mergeByIdSorted replaces duplicate ids with incoming items", () => {
  const merged = mergeByIdSorted(
    [
      { id: "a", updated_at: "2026-01-01T00:00:00.000Z", title: "old" },
      { id: "b", updated_at: "2026-01-03T00:00:00.000Z", title: "middle" },
    ],
    [
      { id: "a", updated_at: "2026-01-04T00:00:00.000Z", title: "new" },
      { id: "c", updated_at: "2026-01-02T00:00:00.000Z", title: "older" },
    ],
    (item) => item.updated_at,
  );

  expect(merged.map((item) => item.id)).toEqual(["a", "b", "c"]);
  expect(merged[0].title).toBe("new");
});

// Breaks same-date ties by id so ordering remains deterministic.
test("mergeByIdSorted sorts matching dates by descending id", () => {
  const merged = mergeByIdSorted(
    [{ id: "a", created_at: "2026-01-01T00:00:00.000Z" }],
    [{ id: "b", created_at: "2026-01-01T00:00:00.000Z" }],
    (item) => item.created_at,
  );

  expect(merged.map((item) => item.id)).toEqual(["b", "a"]);
});

// Creates the default cursor state used before infinite loading starts.
test("createCursorState returns the default infinite loading state", () => {
  expect(createCursorState()).toEqual({ cursor: null, hasMore: true, loading: false });
});

// Creates an independent cursor loading state for every stage.
test("createStagePagination initializes every stage independently", () => {
  const pagination = createStagePagination(["applied", "offer"]);

  expect(pagination).toEqual({
    applied: { cursor: null, hasMore: true, loading: false },
    offer: { cursor: null, hasMore: true, loading: false },
  });
  expect(pagination.applied).not.toBe(pagination.offer);
});
