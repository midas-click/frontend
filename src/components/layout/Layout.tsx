import { Outlet, NavLink, useLocation } from "react-router-dom";
import clsx from "clsx";
import {
  LayoutDashboard,
  Kanban,
  FileText,
  Briefcase,
  BarChart3,
  List,
} from "lucide-react";
import { AuthHeader } from "@/components/auth/AuthHeader";

const NAV_SECTIONS = [
  {
    label: "MAIN MENU",
    items: [
      { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
      { to: "/kanban", icon: Kanban, label: "Kanban" },
    ],
  },
  {
    label: "MANAGE",
    items: [
      { to: "/jobs", icon: Briefcase, label: "Jobs" },
      { to: "/applications", icon: List, label: "Applicants" },
      { to: "/resumes", icon: FileText, label: "Resumes" },
    ],
  },
  {
    label: "INSIGHTS",
    items: [
      { to: "/analytics", icon: BarChart3, label: "Analytics" },
    ],
  },
];

export function Layout() {
  const { pathname } = useLocation();

  const isActive = (to: string) =>
    to === "/" ? pathname === "/" : pathname.startsWith(to);

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside className="w-56 bg-white border-r border-border flex flex-col shrink-0">
        {/* Logo */}
        <div className="h-14 flex items-center px-4 border-b border-border">
          <span className="font-bold text-lg text-text-primary tracking-tight">MidasClick</span>
        </div>

        {/* Nav sections */}
        <nav className="flex-1 px-3 py-2 space-y-4 overflow-y-auto">
          {NAV_SECTIONS.map((section) => (
            <div key={section.label}>
              <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-text-muted mb-1 px-1">
                {section.label}
              </p>
              <div className="space-y-0.5">
                {section.items.map(({ to, icon: Icon, label }) => (
                  <NavLink
                    key={to}
                    to={to}
                    end={to === "/"}
                    className={clsx(
                      "flex items-center gap-3 px-3 py-2 rounded-btn text-sm font-medium transition-colors",
                      isActive(to)
                        ? "bg-surface-secondary text-text-primary font-semibold"
                        : "text-text-secondary hover:bg-surface-secondary hover:text-text-primary",
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    {label}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar with auth controls */}
        <header className="h-14 bg-white border-b border-border flex items-center justify-end px-4 shrink-0">
          <AuthHeader />
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto">
          <div className="p-6 max-w-[1600px] mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
