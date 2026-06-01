import { Routes, Route, Navigate } from "react-router-dom";
import { AuthTokenBridge } from "@/components/auth/AuthTokenBridge";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { Layout } from "@/components/layout/Layout";
import { JobsLayout } from "@/components/layout/JobsLayout";
import HomePage from "@/pages/HomePage";
import SignInPage from "@/pages/SignInPage";
import SignUpPage from "@/pages/SignUpPage";
import SetupPage from "@/pages/SetupPage";
import { DashboardPage } from "@/pages/DashboardPage";
import { KanbanPage } from "@/pages/KanbanPage";
import { ApplicationsPage } from "@/pages/ApplicationsPage";
import { ApplicationDetailPage } from "@/pages/ApplicationDetailPage";
import { ResumesPage } from "@/pages/ResumesPage";
import { ResumeDetailPage } from "@/pages/ResumeDetailPage";
import { JobsPage } from "@/pages/JobsPage";
import { AnalyticsPage } from "@/pages/AnalyticsPage";
import { ExtensionAuthPage } from "@/pages/ExtensionAuthPage";

export default function App() {
  return (
    <AuthTokenBridge>
      <Routes>
        {/* Public */}
        <Route path="/" element={<HomePage />} />
        <Route path="/sign-in/*" element={<SignInPage />} />
        <Route path="/sign-up/*" element={<SignUpPage />} />
        <Route path="/extension-auth/*" element={<ExtensionAuthPage />} />

        {/* Public — browse jobs without sign in */}
        <Route element={<JobsLayout />}>
          <Route path="/jobs" element={<JobsPage />} />
        </Route>

        {/* Protected */}
        <Route element={<ProtectedRoute />}>
          {/* Setup (post-signup, before org — has own layout) */}
          <Route path="/setup" element={<SetupPage />} />

          <Route element={<Layout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/kanban" element={<KanbanPage />} />
            <Route path="/applications" element={<ApplicationsPage />} />
            <Route path="/applications/:id" element={<ApplicationDetailPage />} />
            <Route path="/resumes" element={<ResumesPage />} />
            <Route path="/resumes/:id" element={<ResumeDetailPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthTokenBridge>
  );
}
