import { useEffect } from "react";
import { useAuth } from "@clerk/clerk-react";
import { setTokenProvider } from "@/api/client";
import { useStore } from "@/store";

/** Injects Clerk's getToken into the API client's token provider. */
export function AuthTokenBridge({ children }: { children: React.ReactNode }) {
  const { getToken, isSignedIn } = useAuth();
  const clearProfileState = useStore((s) => s.clearProfileState);

  useEffect(() => {
    setTokenProvider(async () => {
      try {
        return await getToken();
      } catch {
        return null;
      }
    });
  }, [getToken]);

  useEffect(() => {
    if (isSignedIn === false) clearProfileState();
  }, [clearProfileState, isSignedIn]);

  return <>{children}</>;
}
