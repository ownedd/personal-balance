import { LayoutDashboard, Wallet, History, X } from "lucide-react";
import { Link, useRouterState } from "@tanstack/react-router";
import { PAGE_PATHS, type PageId } from "@/lib/routes.ts";

export type { PageId };

const NAV_ITEMS: { id: PageId; label: string; icon: typeof LayoutDashboard }[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "accounts", label: "Cuentas", icon: Wallet },
  { id: "history", label: "Historial", icon: History },
];

interface SidebarProps {
  isMobile: boolean;
  mobileOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isMobile, mobileOpen, onClose }: SidebarProps) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const sidebarTransform =
    isMobile && !mobileOpen ? "translateX(-100%)" : "translateX(0)";

  return (
    <>
      {isMobile && mobileOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.7)",
            backdropFilter: "blur(4px)",
            zIndex: 40,
          }}
          onClick={onClose}
          onKeyDown={(e) => {
            if (e.key === "Escape") onClose();
          }}
          role="presentation"
        />
      )}
      <aside
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          height: "100%",
          width: "256px",
          maxWidth: "min(256px, 88vw)",
          background: "var(--color-surface)",
          borderRight: "1px solid var(--color-border)",
          zIndex: 50,
          display: "flex",
          flexDirection: "column",
          transition: "transform 0.3s ease",
          transform: sidebarTransform,
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "2px",
            background:
              "linear-gradient(to right, transparent, rgba(201,168,76,0.4), transparent)",
          }}
        />

        <div
          style={{
            padding: "28px 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "12px",
                background: "rgba(201,168,76,0.1)",
                border: "1px solid rgba(201,168,76,0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
              }}
            >
              <Wallet style={{ width: 18, height: 18, color: "var(--color-accent)" }} />
            </div>
            <div>
              <span
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "20px",
                  color: "var(--color-text-primary)",
                  letterSpacing: "-0.01em",
                  display: "block",
                  lineHeight: 1,
                }}
              >
                Balance
              </span>
              <span
                style={{
                  fontSize: "9px",
                  color: "var(--color-text-muted)",
                  textTransform: "uppercase",
                  letterSpacing: "0.25em",
                }}
              >
                Personal
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              display: isMobile ? "flex" : "none",
              padding: "6px",
              borderRadius: "8px",
              border: "none",
              background: "transparent",
              color: "var(--color-text-muted)",
              cursor: "pointer",
              alignItems: "center",
              justifyContent: "center",
            }}
            aria-label="Cerrar menú"
          >
            <X style={{ width: 20, height: 20 }} />
          </button>
        </div>

        <nav style={{ flex: 1, padding: "8px 14px" }}>
          <p
            style={{
              fontSize: "9px",
              color: "var(--color-text-muted)",
              textTransform: "uppercase",
              letterSpacing: "0.25em",
              padding: "0 14px",
              marginBottom: "10px",
              fontWeight: 500,
            }}
          >
            Navegación
          </p>
          <ul
            style={{
              listStyle: "none",
              display: "flex",
              flexDirection: "column",
              gap: "4px",
            }}
          >
            {NAV_ITEMS.map((item) => {
              const to = PAGE_PATHS[item.id];
              const active =
                pathname === to || (item.id === "dashboard" && pathname === "/");
              return (
                <li key={item.id}>
                  <Link
                    to={to}
                    onClick={() => onClose()}
                    style={{
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      gap: "14px",
                      padding: "12px 14px",
                      borderRadius: "10px",
                      fontSize: "14px",
                      fontWeight: 500,
                      border: "none",
                      cursor: "pointer",
                      position: "relative",
                      transition: "all 0.2s",
                      textDecoration: "none",
                      background: active ? "rgba(201,168,76,0.1)" : "transparent",
                      color: active ? "var(--color-accent)" : "var(--color-text-secondary)",
                    }}
                    onMouseEnter={(e) => {
                      if (!active) {
                        e.currentTarget.style.background = "var(--color-surface-hover)";
                        e.currentTarget.style.color = "var(--color-text-primary)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!active) {
                        e.currentTarget.style.background = "transparent";
                        e.currentTarget.style.color = "var(--color-text-secondary)";
                      }
                    }}
                  >
                    {active && (
                      <div
                        style={{
                          position: "absolute",
                          left: 0,
                          top: "50%",
                          transform: "translateY(-50%)",
                          width: "3px",
                          height: "20px",
                          background: "var(--color-accent)",
                          borderRadius: "0 4px 4px 0",
                        }}
                      />
                    )}
                    <item.icon style={{ width: 18, height: 18 }} />
                    {item.label}
                    {active && (
                      <div
                        style={{
                          marginLeft: "auto",
                          width: "6px",
                          height: "6px",
                          borderRadius: "50%",
                          background: "var(--color-accent)",
                        }}
                      />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div
          style={{
            margin: "0 14px 20px",
            padding: "16px",
            borderRadius: "12px",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            className="dot-pattern"
            style={{ position: "absolute", inset: 0, borderRadius: "12px" }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: "12px",
              background:
                "linear-gradient(135deg, rgba(201,168,76,0.05), transparent)",
            }}
          />
          <div style={{ position: "relative" }}>
            <p
              style={{
                fontSize: "9px",
                textTransform: "uppercase",
                letterSpacing: "0.25em",
                color: "rgba(201,168,76,0.6)",
                marginBottom: "4px",
                fontWeight: 500,
              }}
            >
              Tu dinero
            </p>
            <p
              style={{
                fontSize: "13px",
                color: "var(--color-text-secondary)",
                lineHeight: 1.5,
              }}
            >
              Tus finanzas, tu control.
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
