import { ArrowUpRight, ArrowDownRight, RefreshCw } from "lucide-react";
import type { Transaction } from "@/lib/database.types.ts";
import {
  formatCurrency,
  formatDate,
  getTransactionTypeLabel,
} from "@/lib/utils.ts";
import { usePrivacy } from "@/contexts/privacy-context.tsx";

interface TransactionListProps {
  transactions: Transaction[];
  showAccount?: boolean;
  compact?: boolean;
}

const TYPE_CONFIG = {
  income: {
    icon: ArrowUpRight,
    color: "var(--color-success)",
    bg: "rgba(74,222,128,0.08)",
    border: "rgba(74,222,128,0.12)",
    sign: "+",
  },
  expense: {
    icon: ArrowDownRight,
    color: "var(--color-danger)",
    bg: "rgba(248,113,113,0.08)",
    border: "rgba(248,113,113,0.12)",
    sign: "-",
  },
  adjustment: {
    icon: RefreshCw,
    color: "var(--color-info)",
    bg: "rgba(96,165,250,0.08)",
    border: "rgba(96,165,250,0.12)",
    sign: "",
  },
};

export function TransactionList({
  transactions,
  compact = false,
}: TransactionListProps) {
  const { mask } = usePrivacy();
  if (transactions.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "40px 0" }}>
        <p style={{ color: "var(--color-text-muted)", fontSize: "14px" }}>Sin movimientos registrados</p>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
      {transactions.map((tx) => {
        const config = TYPE_CONFIG[tx.type as keyof typeof TYPE_CONFIG];
        const Icon = config.icon;

        return (
          <div
            key={tx.id}
            style={{
              display: "flex", alignItems: "center", gap: "14px",
              padding: "10px 12px", borderRadius: "12px",
              cursor: "default", transition: "background 0.2s",
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = "var(--color-surface-hover)"}
            onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
          >
            <div style={{
              width: "36px", height: "36px", borderRadius: "10px",
              background: config.bg, border: `1px solid ${config.border}`,
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
            }}>
              <Icon style={{ width: 16, height: 16, color: config.color }} />
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{
                fontSize: "14px", color: "var(--color-text-primary)",
                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap"
              }}>
                {tx.description}
              </p>
              {!compact && (
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "3px" }}>
                  <span style={{ fontSize: "11px", color: "var(--color-text-muted)" }}>
                    {formatDate(tx.transaction_date)}
                  </span>
                  {tx.category && (
                    <>
                      <span style={{ fontSize: "9px", color: "var(--color-text-muted)", opacity: 0.4 }}>|</span>
                      <span style={{ fontSize: "11px", color: "var(--color-text-muted)" }}>{tx.category}</span>
                    </>
                  )}
                  <span style={{ fontSize: "9px", color: "var(--color-text-muted)", opacity: 0.4 }}>|</span>
                  <span style={{ fontSize: "11px", color: "var(--color-text-muted)" }}>
                    {getTransactionTypeLabel(tx.type)}
                  </span>
                </div>
              )}
            </div>

            <span style={{
              fontSize: "14px", fontWeight: 600,
              fontVariantNumeric: "tabular-nums", color: config.color
            }}>
              {config.sign}{mask(formatCurrency(tx.amount))}
            </span>
          </div>
        );
      })}
    </div>
  );
}
