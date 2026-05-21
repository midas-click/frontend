import { useEffect, useMemo, useState } from "react";
import { SignIn, useAuth, useUser } from "@clerk/clerk-react";
import { Link, useSearchParams } from "react-router-dom";
import { BrandLogo } from "@/components/shared/BrandLogo";

type BridgeStatus = "loading" | "sign-in" | "sending" | "success" | "error";
const EXTENSION_ID_STORAGE_KEY = "midas-extension-id";

export function ExtensionAuthPage() {
  const [searchParams] = useSearchParams();
  const extensionIdFromUrl = searchParams.get("extensionId") || "";
  const silent = searchParams.get("silent") === "true";
  const [savedExtensionId, setSavedExtensionId] = useState(() => {
    return sessionStorage.getItem(EXTENSION_ID_STORAGE_KEY) || "";
  });
  const extensionId = extensionIdFromUrl || savedExtensionId;
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();
  const [status, setStatus] = useState<BridgeStatus>("loading");
  const [message, setMessage] = useState("Checking sign-in status...");

  const currentPath = useMemo(() => {
    const params = new URLSearchParams();
    if (extensionId) params.set("extensionId", extensionId);
    if (silent) params.set("silent", "true");
    const query = params.toString();
    return `/extension-auth${query ? `?${query}` : ""}`;
  }, [extensionId, silent]);

  useEffect(() => {
    if (!extensionIdFromUrl) return;
    sessionStorage.setItem(EXTENSION_ID_STORAGE_KEY, extensionIdFromUrl);
    setSavedExtensionId(extensionIdFromUrl);
  }, [extensionIdFromUrl]);

  useEffect(() => {
    if (!isLoaded) return;
    if (!extensionId) {
      setStatus("error");
      setMessage("Missing extension ID. Open this page from the Midas Click extension.");
      return;
    }
    if (!isSignedIn) {
      setStatus("sign-in");
      setMessage(silent ? "Sign in again to refresh Midas Click." : "Sign in to connect Midas Click.");
      return;
    }

    let cancelled = false;
    async function sendTokenToExtension() {
      setStatus("sending");
      setMessage("Connecting extension...");

      try {
        const token = await getToken({ skipCache: true } as any);
        if (!token) throw new Error("Unable to get Clerk session token");

        const runtime = (globalThis as any).chrome?.runtime;
        if (!runtime?.sendMessage) {
          throw new Error("Chrome extension messaging is unavailable in this browser");
        }

        const profileId = localStorage.getItem("midas-active-profile");
        const payload = {
          type: "MIDAS_AUTH_TOKEN",
          token,
          profileId,
          user: {
            id: user?.id,
            email: user?.primaryEmailAddress?.emailAddress,
          },
        };

        await new Promise<void>((resolve, reject) => {
          runtime.sendMessage(extensionId, payload, (response: any) => {
            const lastError = runtime.lastError;
            if (lastError) {
              reject(new Error(lastError.message));
              return;
            }
            if (!response?.ok) {
              reject(new Error(response?.error || "Extension did not accept the token"));
              return;
            }
            resolve();
          });
        });

        if (!cancelled) {
          setStatus("success");
          setMessage(silent ? "Midas Click extension session refreshed." : "Midas Click extension is connected. You can close this tab.");
          if (silent) {
            window.setTimeout(() => window.close(), 500);
          }
        }
      } catch (error) {
        if (!cancelled) {
          setStatus("error");
          setMessage(error instanceof Error ? error.message : "Failed to connect extension");
        }
      }
    }

    sendTokenToExtension();
    return () => {
      cancelled = true;
    };
  }, [extensionId, getToken, isLoaded, isSignedIn, silent, user]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-secondary px-4">
      <div className="w-full max-w-md bg-white border border-border rounded-card shadow-card p-6">
        <Link to="/" className="inline-flex hover:opacity-80 transition-opacity">
          <BrandLogo />
        </Link>
        <h1 className="mt-5 text-lg font-semibold">Connect Chrome Extension</h1>
        <p className={`mt-2 text-sm ${status === "error" ? "text-red-600" : "text-text-secondary"}`}>
          {message}
        </p>

        {status === "sign-in" && (
          <div className="mt-5">
            <SignIn
              routing="path"
              path="/extension-auth"
              forceRedirectUrl={currentPath}
              signUpUrl={`/sign-up?redirect_url=${encodeURIComponent(currentPath)}`}
              appearance={{
                elements: {
                  card: "shadow-none border border-border rounded-card",
                },
              }}
            />
          </div>
        )}

        {status === "sending" && (
          <div className="mt-5 h-2 rounded-full bg-surface-secondary overflow-hidden">
            <div className="h-full w-1/2 rounded-full bg-brand-600 animate-pulse" />
          </div>
        )}

        {status === "success" && (
          <button
            type="button"
            onClick={() => window.close()}
            className="mt-5 px-4 py-2 bg-brand-900 text-white text-sm font-medium rounded-btn hover:bg-brand-800"
          >
            Close Tab
          </button>
        )}
      </div>
    </div>
  );
}
