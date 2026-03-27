import {
  Wallet,
  Landmark,
  PiggyBank,
  CreditCard,
  MoreVertical,
  Pencil,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import type { Account } from "@/lib/database.types.ts";
import { formatCurrency, getAccountTypeLabel } from "@/lib/utils.ts";
import { usePrivacy } from "@/contexts/privacy-context.tsx";

const ICON_MAP: Record<string, typeof Wallet> = {
  wallet: Wallet,
  landmark: Landmark,
  piggy: PiggyBank,
  credit: CreditCard,
};

interface AccountCardProps {
  account: Account;
  index: number;
  assetCount?: number;
  onEdit: (account: Account) => void;
  onDelete: (account: Account) => void;
  onClick: (account: Account) => void;
}

export function AccountCard({
  account,
  index,
  assetCount,
  onEdit,
  onDelete,
  onClick,
}: AccountCardProps) {
  const { mask } = usePrivacy();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [menuBtnHovered, setMenuBtnHovered] = useState(false);
  const [hoveredMenuItem, setHoveredMenuItem] = useState<"edit" | "delete" | null>(
    null
  );
  const Icon = ICON_MAP[account.icon] ?? Wallet;
  const balance = Number(account.current_balance);

  const last4 = account.id.slice(-4).toUpperCase();
  const staggerClass = `stagger-${Math.min(index + 1, 6)}`;

  return (
    <div
      className={`animate-fade-in card-premium ${staggerClass}`}
      style={{
        borderRadius: 16,
        cursor: "pointer",
        position: "relative",
        overflow: "hidden",
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setMenuBtnHovered(false);
      }}
      onClick={() => onClick(account)}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: 16,
          opacity: isHovered ? 0.14 : 0.08,
          transition: "opacity 500ms ease",
          background: `linear-gradient(145deg, ${account.color} 0%, transparent 50%, ${account.color}44 100%)`,
        }}
      />

      <div
        style={{
          position: "absolute",
          top: 16,
          right: 64,
          width: 32,
          height: 24,
          borderRadius: 4,
          opacity: isHovered ? 1 : 0,
          transform: isHovered ? "translateY(0)" : "translateY(4px)",
          transition: "opacity 500ms ease, transform 500ms ease",
          background: `linear-gradient(135deg, ${account.color}30 0%, ${account.color}10 100%)`,
          border: `1px solid ${account.color}20`,
        }}
      />

      <div
        className="glass"
        style={{
          padding: 20,
          borderRadius: 16,
          height: "100%",
          position: "relative",
          transition: "border-color 300ms ease, transform 300ms ease, box-shadow 300ms ease",
          borderWidth: 1,
          borderStyle: "solid",
          borderColor: isHovered
            ? "rgba(255, 255, 255, 0.1)"
            : "rgba(255, 255, 255, 0.07)",
          transform: isHovered ? "translateY(-2px)" : "translateY(0)",
          boxShadow: isHovered
            ? "0 10px 15px -3px rgba(0, 0, 0, 0.2), 0 4px 6px -2px rgba(0, 0, 0, 0.1)"
            : "none",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            marginBottom: 32,
          }}
        >
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: 12,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "transform 300ms ease",
              transform: isHovered ? "scale(1.1) rotate(3deg)" : "scale(1) rotate(0deg)",
              backgroundColor: `${account.color}18`,
              border: `1px solid ${account.color}15`,
            }}
          >
            <Icon
              style={{ width: 20, height: 20, color: account.color }}
            />
          </div>
          <div style={{ position: "relative" }}>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setMenuOpen(!menuOpen);
              }}
              onMouseEnter={() => setMenuBtnHovered(true)}
              onMouseLeave={() => setMenuBtnHovered(false)}
              style={{
                padding: 6,
                borderRadius: 6,
                border: "none",
                background: menuBtnHovered ? "var(--color-surface-hover)" : "transparent",
                color: menuBtnHovered
                  ? "var(--color-text-secondary)"
                  : "var(--color-text-muted)",
                cursor: "pointer",
                transition: "background-color 150ms ease, color 150ms ease, opacity 150ms ease",
                opacity: isHovered || menuOpen ? 1 : 0,
              }}
            >
              <MoreVertical style={{ width: 16, height: 16, display: "block" }} />
            </button>
            {menuOpen && (
              <>
                <div
                  style={{
                    position: "fixed",
                    inset: 0,
                    zIndex: 10,
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setMenuOpen(false);
                  }}
                />
                <div
                  className="animate-scale-in"
                  style={{
                    position: "absolute",
                    right: 0,
                    top: "100%",
                    marginTop: 4,
                    width: 144,
                    backgroundColor: "var(--color-surface-elevated)",
                    border: "1px solid var(--color-border)",
                    borderRadius: 8,
                    boxShadow:
                      "0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(0,0,0,0.05)",
                    zIndex: 20,
                    paddingTop: 4,
                    paddingBottom: 4,
                  }}
                >
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setMenuOpen(false);
                      onEdit(account);
                    }}
                    onMouseEnter={() => setHoveredMenuItem("edit")}
                    onMouseLeave={() => setHoveredMenuItem(null)}
                    style={{
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      paddingLeft: 12,
                      paddingRight: 12,
                      paddingTop: 8,
                      paddingBottom: 8,
                      fontSize: 14,
                      border: "none",
                      background:
                        hoveredMenuItem === "edit"
                          ? "var(--color-surface-hover)"
                          : "transparent",
                      color:
                        hoveredMenuItem === "edit"
                          ? "var(--color-text-primary)"
                          : "var(--color-text-secondary)",
                      cursor: "pointer",
                      transition: "background-color 150ms ease, color 150ms ease",
                    }}
                  >
                    <Pencil style={{ width: 14, height: 14, flexShrink: 0 }} />
                    Editar
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setMenuOpen(false);
                      onDelete(account);
                    }}
                    onMouseEnter={() => setHoveredMenuItem("delete")}
                    onMouseLeave={() => setHoveredMenuItem(null)}
                    style={{
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      paddingLeft: 12,
                      paddingRight: 12,
                      paddingTop: 8,
                      paddingBottom: 8,
                      fontSize: 14,
                      border: "none",
                      background:
                        hoveredMenuItem === "delete"
                          ? "rgba(248, 113, 113, 0.12)"
                          : "transparent",
                      color: "var(--color-danger)",
                      cursor: "pointer",
                      transition: "background-color 150ms ease",
                    }}
                  >
                    <Trash2 style={{ width: 14, height: 14, flexShrink: 0 }} />
                    Eliminar
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <p
            style={{
              fontSize: 10,
              textTransform: "uppercase",
              letterSpacing: "0.2em",
              fontWeight: 500,
              color: "var(--color-text-muted)",
              margin: 0,
            }}
          >
            {getAccountTypeLabel(account.type)}
          </p>
          {account.type === "crypto_wallet" && typeof assetCount === "number" && (
            <p
              style={{
                fontSize: 11,
                color: "var(--color-accent)",
                margin: 0,
                fontWeight: 500,
              }}
            >
              {assetCount} activo{assetCount === 1 ? "" : "s"}
            </p>
          )}
          <p
            style={{
              fontSize: 13,
              fontWeight: 500,
              color: "var(--color-text-secondary)",
              margin: 0,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {account.name}
          </p>
          <p
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 26,
              letterSpacing: "-0.025em",
              lineHeight: 1.25,
              paddingTop: 4,
              margin: 0,
              color:
                balance >= 0
                  ? "var(--color-text-primary)"
                  : "var(--color-danger)",
            }}
          >
            {mask(formatCurrency(balance, account.currency))}
          </p>
        </div>

        <div
          style={{
            marginTop: 20,
            paddingTop: 12,
            borderTop: "1px solid rgba(255, 255, 255, 0.04)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ display: "flex", gap: 2 }}>
              {[0, 1, 2].map((dot) => (
                <div
                  key={dot}
                  style={{
                    width: 4,
                    height: 4,
                    borderRadius: 9999,
                    backgroundColor: "rgba(94, 92, 86, 0.4)",
                  }}
                />
              ))}
            </div>
            <span
              style={{
                fontSize: 10,
                fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
                letterSpacing: "0.05em",
                marginLeft: 4,
                color: "var(--color-text-muted)",
              }}
            >
              {last4}
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span
              style={{
                fontSize: 9,
                textTransform: "uppercase",
                letterSpacing: "0.15em",
                fontWeight: 500,
                color: "var(--color-text-muted)",
              }}
            >
              {account.currency}
            </span>
            <div
              style={{
                width: 10,
                height: 10,
                borderRadius: 9999,
                backgroundColor: account.color,
                transition: "box-shadow 300ms ease",
                boxShadow: isHovered
                  ? `0 0 0 2px var(--color-surface-elevated), 0 0 0 4px ${account.color}, 0 0 8px ${account.color}40`
                  : `0 0 0 1px var(--color-surface-elevated), 0 0 0 3px ${account.color}, 0 0 8px ${account.color}40`,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
