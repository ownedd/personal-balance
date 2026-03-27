import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import { useAuth } from "@/contexts/auth-context.tsx";
import { AppLayout } from "@/components/layout/app-layout.tsx";
import type { PageId } from "@/lib/routes.ts";
import { PAGE_PATHS, PATH_TO_PAGE } from "@/lib/routes.ts";
import { LoginPage } from "@/pages/login.tsx";
import { RegisterPage } from "@/pages/register.tsx";
import { DashboardPage } from "@/pages/dashboard.tsx";
import { AccountsPage } from "@/pages/accounts.tsx";
import { HistoryPage } from "@/pages/history.tsx";
import { Loader2 } from "lucide-react";

type AuthPage = "login" | "register";

function usePathname() {
  return useSyncExternalStore(
    (cb) => {
      window.addEventListener("popstate", cb);
      return () => window.removeEventListener("popstate", cb);
    },
    () => window.location.pathname
  );
}

export default function App() {
  const { user, loading } = useAuth();
  const [authPage, setAuthPage] = useState<AuthPage>("login");
  const pathname = usePathname();
  const currentPage: PageId = PATH_TO_PAGE[pathname] ?? "dashboard";

  const setCurrentPage = useCallback((page: PageId) => {
    const path = PAGE_PATHS[page];
    if (window.location.pathname !== path) {
      window.history.pushState(null, "", path);
      window.dispatchEvent(new PopStateEvent("popstate"));
    }
  }, []);

  useEffect(() => {
    if (user && !PATH_TO_PAGE[pathname]) {
      window.history.replaceState(null, "", "/");
    }
  }, [user, pathname]);

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--color-background)",
        }}
      >
        <div className="animate-fade-in" style={{ textAlign: "center" }}>
          <Loader2
            className="animate-spin"
            style={{
              width: 32,
              height: 32,
              color: "var(--color-accent)",
              display: "block",
              margin: "0 auto 16px",
            }}
          />
          <p style={{ color: "var(--color-text-muted)", fontSize: 14 }}>
            Cargando...
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    if (authPage === "register") {
      return <RegisterPage onNavigateLogin={() => setAuthPage("login")} />;
    }
    return <LoginPage onNavigateRegister={() => setAuthPage("register")} />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case "dashboard":
        return <DashboardPage />;
      case "accounts":
        return <AccountsPage />;
      case "history":
        return <HistoryPage />;
    }
  };

  return (
    <AppLayout currentPage={currentPage} onNavigate={setCurrentPage}>
      {renderPage()}
    </AppLayout>
  );
}
