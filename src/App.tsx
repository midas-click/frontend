import { Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { DashboardPage } from "@/pages/DashboardPage";
import { KanbanPage } from "@/pages/KanbanPage";
import { ApplicationsPage } from "@/pages/ApplicationsPage";
import { ApplicationDetailPage } from "@/pages/ApplicationDetailPage";
import { ResumesPage } from "@/pages/ResumesPage";
import { ResumeDetailPage } from "@/pages/ResumeDetailPage";
import { JobsPage } from "@/pages/JobsPage";
import { JobDetailPage } from "@/pages/JobDetailPage";
import { AnalyticsPage } from "@/pages/AnalyticsPage";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/kanban" element={<KanbanPage />} />
        <Route path="/applications" element={<ApplicationsPage />} />
        <Route path="/applications/:id" element={<ApplicationDetailPage />} />
        <Route path="/resumes" element={<ResumesPage />} />
        <Route path="/resumes/:id" element={<ResumeDetailPage />} />
        <Route path="/jobs" element={<JobsPage />} />
        <Route path="/jobs/:id" element={<JobDetailPage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
