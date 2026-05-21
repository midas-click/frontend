import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";

import type { Job } from "@/types";
import { JobCard } from "./JobCard";

function renderCard(job: Partial<Job> = {}, onSelectedChange = vi.fn()) {
  const baseJob: Job = {
    id: "job_1",
    user_id: "user_1",
    org_id: "org_1",
    title: "Frontend Engineer",
    company: "Midas",
    location: "New York",
    remote: true,
    salary_range: "$120k",
    source_url: "https://jobs.example/frontend",
    org_name: "Midas Org",
    tags: ["react", "typescript", "frontend"],
    created_at: "2026-01-01T00:00:00.000Z",
    ...job,
  };

  render(
    <MemoryRouter>
      <JobCard job={baseJob} onSelectedChange={onSelectedChange} />
    </MemoryRouter>,
  );
  return { job: baseJob, onSelectedChange };
}

// Renders job metadata, tags, detail link, and external posting link.
test("JobCard renders job details and links", () => {
  renderCard();

  expect(screen.getByText("Frontend Engineer")).toBeInTheDocument();
  expect(screen.getByText("Midas")).toBeInTheDocument();
  expect(screen.getByText("New York")).toBeInTheDocument();
  expect(screen.getByText("Remote")).toBeInTheDocument();
  expect(screen.getByText("$120k")).toBeInTheDocument();
  expect(screen.getByRole("link", { name: /frontend engineer/i })).toHaveAttribute("href", "/jobs/job_1");
  expect(screen.getByRole("link", { name: /job posting/i })).toHaveAttribute(
    "href",
    "https://jobs.example/frontend",
  );
});

// Notifies callers when the selection checkbox changes.
test("JobCard calls onSelectedChange when selected", async () => {
  const user = userEvent.setup();
  const { onSelectedChange } = renderCard();

  await user.click(screen.getByRole("checkbox", { name: "Select Frontend Engineer" }));

  expect(onSelectedChange).toHaveBeenCalledWith("job_1", true);
});

// Limits rendered tags to the first eight tags to keep cards compact.
test("JobCard renders only the first eight tags", () => {
  renderCard({ tags: ["1", "2", "3", "4", "5", "6", "7", "8", "9"] });

  expect(screen.getByText("8")).toBeInTheDocument();
  expect(screen.queryByText("9")).not.toBeInTheDocument();
});
