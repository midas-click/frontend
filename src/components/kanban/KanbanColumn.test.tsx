import { fireEvent, render, screen } from "@testing-library/react";

import { KanbanColumn } from "./KanbanColumn";

vi.mock("@dnd-kit/core", () => ({
  useDroppable: () => ({ setNodeRef: vi.fn() }),
}));

function renderColumn(props: Partial<Parameters<typeof KanbanColumn>[0]> = {}) {
  const onLoadMore = vi.fn();
  const result = render(
    <KanbanColumn
      colId="applied"
      label="Applied"
      text="#55309E"
      count={2}
      hasMore
      onLoadMore={onLoadMore}
      {...props}
    >
      <div>Application card</div>
    </KanbanColumn>,
  );
  return { ...result, onLoadMore };
}

// Renders a neutral column shell while preserving the colored stage title.
test("KanbanColumn renders title color, count, and children", () => {
  const { container } = renderColumn();

  expect(screen.getByText("Applied")).toHaveStyle({ color: "#55309E" });
  expect(screen.getByText("2")).toBeInTheDocument();
  expect(screen.getByText("Application card")).toBeInTheDocument();
  expect(container.querySelector("[data-col-id='applied']")).toHaveClass("bg-surface-secondary");
});

// Calls onLoadMore when the scroll position is near the bottom and more items exist.
test("KanbanColumn loads more when scrolled near the bottom", () => {
  const { container, onLoadMore } = renderColumn();
  const scroller = container.querySelector(".overflow-y-auto") as HTMLDivElement;
  Object.defineProperties(scroller, {
    scrollHeight: { value: 1000, configurable: true },
    scrollTop: { value: 850, configurable: true },
    clientHeight: { value: 100, configurable: true },
  });

  fireEvent.scroll(scroller);

  expect(onLoadMore).toHaveBeenCalledTimes(1);
});

// Does not load more while another page is already loading.
test("KanbanColumn does not load more while loadingMore is true", () => {
  const { container, onLoadMore } = renderColumn({ loadingMore: true });
  const scroller = container.querySelector(".overflow-y-auto") as HTMLDivElement;
  Object.defineProperties(scroller, {
    scrollHeight: { value: 1000, configurable: true },
    scrollTop: { value: 850, configurable: true },
    clientHeight: { value: 100, configurable: true },
  });

  fireEvent.scroll(scroller);

  expect(onLoadMore).not.toHaveBeenCalled();
  expect(screen.getByText("Loading...")).toBeInTheDocument();
});
