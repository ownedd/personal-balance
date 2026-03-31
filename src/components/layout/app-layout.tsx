import { useState, type ReactNode } from "react";
import { Sidebar, type PageId } from "./sidebar.tsx";
import { Header } from "./header.tsx";
import { useMediaQuery } from "@/hooks/use-media-query.ts";

const PAGE_TITLES: Record<PageId, string> = {
  dashboard: "Dashboard",
  accounts: "Mis Cuentas",
  history: "Historial Mensual",
};

interface AppLayoutProps {
  currentPage: PageId;
  children: ReactNode;
}

export function AppLayout({ currentPage, children }: AppLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isNarrow = useMediaQuery("(max-width: 767px)");

  return (
    <div style={{ minHeight: "100vh", background: "var(--color-background)" }}>
      <Sidebar
        isMobile={isNarrow}
        mobileOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <div
        style={{
          marginLeft: isNarrow ? 0 : "256px",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Header
          title={PAGE_TITLES[currentPage]}
          showMenuButton={isNarrow}
          onMenuToggle={() => setSidebarOpen(true)}
        />
        <main
          style={{
            flex: 1,
            padding: isNarrow ? "16px 16px 24px" : "32px",
            maxWidth: "100%",
            overflowX: "hidden",
          }}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
