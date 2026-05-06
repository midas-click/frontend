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

const NAV_ITEMS = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/jobs", icon: Briefcase, label: "Jobs" },
  { to: "/resumes", icon: FileText, label: "Resumes" },
  { to: "/applications", icon: List, label: "Applicants" },
  { to: "/kanban", icon: Kanban, label: "Kanban" },
  { to: "/analytics", icon: BarChart3, label: "Analytics" },
];

export function Layout() {
  const { pathname } = useLocation();

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside className="w-56 bg-white border-r border-gray-200 flex flex-col shrink-0">
        <div className="h-14 flex items-center px-4 border-b border-gray-100">
          <span className="font-bold text-lg text-brand-700">MidasClick</span>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              className={clsx(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                pathname === to || (to !== "/" && pathname.startsWith(to))
                  ? "bg-brand-50 text-brand-700"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
              )}
            >
              <Icon className="w-4 h-4" />
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <div className="p-6 max-w-[1600px] mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
