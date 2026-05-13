import { useAuth } from "@clerk/clerk-react";
import { Layout } from "./Layout";
import { PublicLayout } from "./PublicLayout";

/** Renders the full sidebar layout for signed-in users, minimal public nav otherwise. */
export function JobsLayout() {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "linear-gradient(135deg, #F3EEFF 0%, #E0E7FF 100%)" }}>
        <div className="animate-spin h-8 w-8 border-4 border-brand-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  return isSignedIn ? <Layout /> : <PublicLayout />;
}
