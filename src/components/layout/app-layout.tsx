import { useState, type ReactNode } from "react";
import { Sidebar, type PageId } from "./sidebar.tsx";
import { Header } from "./header.tsx";

const PAGE_TITLES: Record<PageId, string> = {
  dashboard: "Dashboard",
  accounts: "Mis Cuentas",
  history: "Historial Mensual",
};

interface AppLayoutProps {
  currentPage: PageId;
  onNavigate: (page: PageId) => void;
  children: ReactNode;
}

export function AppLayout({ currentPage, onNavigate, children }: AppLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div style={{ minHeight: "100vh", background: "var(--color-background)" }}>
      <Sidebar
        currentPage={currentPage}
        onNavigate={onNavigate}
        mobileOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <div style={{ marginLeft: "256px", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
        <Header
          title={PAGE_TITLES[currentPage]}
          onMenuToggle={() => setSidebarOpen(true)}
        />
        <main style={{ flex: 1, padding: "32px" }}>{children}</main>
      </div>
    </div>
  );
}
