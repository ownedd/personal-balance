import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { AuthProvider } from "@/contexts/auth-context.tsx";
import { PrivacyProvider } from "@/contexts/privacy-context.tsx";
import App from "@/App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider>
      <PrivacyProvider>
        <App />
      </PrivacyProvider>
    </AuthProvider>
  </StrictMode>
);
