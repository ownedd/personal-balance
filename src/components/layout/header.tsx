import { Eye, EyeOff, LogOut, Menu, User } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/contexts/auth-context.tsx";
import { usePrivacy } from "@/contexts/privacy-context.tsx";

interface HeaderProps {
  title: string;
  showMenuButton: boolean;
  onMenuToggle: () => void;
}

export function Header({ title, showMenuButton, onMenuToggle }: HeaderProps) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { hidden, toggle } = usePrivacy();
  const displayName =
    user?.user_metadata?.full_name ?? user?.email?.split("@")[0] ?? "Usuario";
  const initials = displayName
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <header style={{
      height: "64px", borderBottom: "1px solid var(--color-border)",
      background: "rgba(24,26,35,0.5)", backdropFilter: "blur(16px)",
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: showMenuButton ? "0 16px" : "0 32px", position: "sticky", top: 0, zIndex: 30
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "14px", minWidth: 0 }}>
        <button
          type="button"
          onClick={onMenuToggle}
          style={{
            display: showMenuButton ? "flex" : "none",
            alignItems: "center",
            justifyContent: "center",
            padding: "8px",
            borderRadius: "8px",
            border: "none",
            background: "transparent",
            color: "var(--color-text-muted)",
            cursor: "pointer",
          }}
          aria-label="Abrir menú"
        >
          <Menu style={{ width: 20, height: 20 }} />
        </button>
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(18px, 4vw, 22px)",
            color: "var(--color-text-primary)",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {title}
        </h1>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          flexShrink: 0,
        }}
      >
        <button
          onClick={toggle}
          style={{
            padding: "8px", borderRadius: "8px", border: "none",
            background: hidden ? "rgba(201,168,76,0.1)" : "transparent",
            color: hidden ? "var(--color-accent)" : "var(--color-text-muted)",
            cursor: "pointer", transition: "all 0.2s",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
          title={hidden ? "Mostrar montos" : "Ocultar montos"}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(201,168,76,0.1)";
            e.currentTarget.style.color = "var(--color-accent)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = hidden ? "rgba(201,168,76,0.1)" : "transparent";
            e.currentTarget.style.color = hidden ? "var(--color-accent)" : "var(--color-text-muted)";
          }}
        >
          {hidden ? <EyeOff style={{ width: 16, height: 16 }} /> : <Eye style={{ width: 16, height: 16 }} />}
        </button>
        <div style={{
          display: "flex", alignItems: "center", gap: "10px",
          padding: "6px 14px", borderRadius: "12px",
          background: "rgba(34,37,58,0.6)", border: "1px solid var(--color-border-subtle)"
        }}>
          <div style={{
            width: "26px", height: "26px", borderRadius: "8px",
            background: "rgba(201,168,76,0.1)",
            display: "flex", alignItems: "center", justifyContent: "center"
          }}>
            {initials ? (
              <span style={{ fontSize: "9px", fontWeight: 700, color: "var(--color-accent)" }}>{initials}</span>
            ) : (
              <User style={{ width: 12, height: 12, color: "var(--color-accent)" }} />
            )}
          </div>
          <span style={{
            fontSize: "13px", color: "var(--color-text-secondary)", fontWeight: 500,
            maxWidth: "140px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap"
          }}>
            {displayName}
          </span>
        </div>
        <button
          type="button"
          onClick={async () => {
            await signOut();
            queryClient.clear();
            await navigate({ to: "/login" });
          }}
          style={{
            padding: "8px", borderRadius: "8px", border: "none",
            background: "transparent", color: "var(--color-text-muted)",
            cursor: "pointer", transition: "all 0.2s"
          }}
          title="Cerrar sesión"
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "var(--color-danger)";
            e.currentTarget.style.background = "rgba(248,113,113,0.08)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "var(--color-text-muted)";
            e.currentTarget.style.background = "transparent";
          }}
        >
          <LogOut style={{ width: 16, height: 16 }} />
        </button>
      </div>
    </header>
  );
}
