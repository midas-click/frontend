import { useEffect } from "react";
import { useAuth } from "@clerk/clerk-react";
import { setTokenProvider } from "@/api/client";

/** Injects Clerk's getToken into the API client's token provider. */
export function AuthTokenBridge({ children }: { children: React.ReactNode }) {
  const { getToken } = useAuth();

  useEffect(() => {
    setTokenProvider(async () => {
      try {
        return await getToken();
      } catch {
        return null;
      }
    });
  }, [getToken]);

  return <>{children}</>;
}
