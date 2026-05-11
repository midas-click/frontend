import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { ClerkProvider } from "@clerk/clerk-react";
import App from "./App";
import "./index.css";

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || "";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <ClerkProvider
    publishableKey={PUBLISHABLE_KEY}
    signInUrl="/sign-in"
    signUpUrl="/sign-up"
    signInFallbackRedirectUrl="/"
    signUpFallbackRedirectUrl="/"
    afterSignOutUrl="/sign-in"
  >
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </ClerkProvider>,
);
