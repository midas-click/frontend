import { Outlet, Link } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";

/** Minimal layout for public pages — brand logo + sign in/sign up. */
export function PublicLayout() {
  const { isSignedIn } = useAuth();

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(135deg, #F3EEFF 0%, #E0E7FF 100%)" }}>
      {/* Top nav */}
      <nav className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link to="/" className="text-xl font-bold text-brand-900 tracking-tight hover:opacity-80 transition-opacity">
          MidasClick
        </Link>
        <div className="flex items-center gap-3">
          {isSignedIn ? (
            <Link
              to="/dashboard"
              className="px-4 py-2 text-sm font-medium bg-brand-900 text-white rounded-btn hover:bg-brand-800 transition-colors"
            >
              Dashboard
            </Link>
          ) : (
            <>
              <Link
                to="/sign-in"
                className="px-4 py-2 text-sm font-medium text-brand-700 hover:text-brand-900 transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/sign-up"
                className="px-4 py-2 text-sm font-medium bg-brand-900 text-white rounded-btn hover:bg-brand-800 transition-colors"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Page content */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        <Outlet />
      </main>
    </div>
  );
}
