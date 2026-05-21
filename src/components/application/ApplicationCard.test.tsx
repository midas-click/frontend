import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import type { Application } from "@/types";
import { ApplicationCard } from "./ApplicationCard";

function renderCard(application: Partial<Application> = {}) {
  const baseApplication: Application = {
    id: "app_1",
    user_id: "user_1",
    org_id: "org_1",
    job_title: "Backend Engineer",
    company: "Midas",
    location: "Remote",
    stage: "applied",
    resume_filename: "Resume.pdf",
    tags: [],
    communication_log: [],
    timeline: [],
    created_at: "2026-01-01T00:00:00.000Z",
    updated_at: "2026-01-02T00:00:00.000Z",
    ...application,
  };

  return render(
    <MemoryRouter>
      <ApplicationCard application={baseApplication} />
    </MemoryRouter>,
  );
}

// Shows core application metadata and links to the application detail page.
test("ApplicationCard renders metadata and detail link", () => {
  renderCard();

  expect(screen.getByRole("link")).toHaveAttribute("href", "/applications/app_1");
  expect(screen.getByText("Backend Engineer")).toBeInTheDocument();
  expect(screen.getByText("Midas")).toBeInTheDocument();
  expect(screen.getByText("Remote")).toBeInTheDocument();
  expect(screen.getByText("Resume.pdf")).toBeInTheDocument();
  expect(screen.getByText("Applied")).toBeInTheDocument();
});

// Displays match score text with the color class that matches the score threshold.
test("ApplicationCard displays colored match score when present", () => {
  renderCard({ match_score: 82 });

  expect(screen.getByText("Match 82%")).toHaveClass("text-green-700");
});

// Falls back to an Unknown stage label when the stage is missing from the stage map.
test("ApplicationCard renders unknown stages safely", () => {
  renderCard({ stage: "custom_stage" });

  expect(screen.getByText("custom_stage")).toBeInTheDocument();
});
