import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/contexts/auth-context.tsx";
import { PrivacyProvider } from "@/contexts/privacy-context.tsx";
import { createAppQueryClient } from "@/lib/query-client.ts";
import App from "@/App.tsx";
import { registerSW } from "virtual:pwa-register";
import "./index.css";

registerSW({ immediate: true });

const queryClient = createAppQueryClient();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <PrivacyProvider>
          <App />
        </PrivacyProvider>
      </AuthProvider>
    </QueryClientProvider>
  </StrictMode>,
);
