import { TrendingUp, TrendingDown, Minus, Sparkles } from "lucide-react";
import { formatCurrency } from "@/lib/utils.ts";
import { usePrivacy } from "@/contexts/privacy-context.tsx";

interface BalanceOverviewProps {
  totalBalance: number;
  balanceChange: number;
  balanceChangePercent: number;
  previousMonthBalance: number | null;
}

export function BalanceOverview({
  totalBalance,
  balanceChange,
  balanceChangePercent,
  previousMonthBalance,
}: BalanceOverviewProps) {
  const { mask } = usePrivacy();
  const isPositive = balanceChange >= 0;
  const hasHistory = previousMonthBalance !== null;

  return (
    <div className="animate-fade-in" style={{ position: "relative", borderRadius: "16px", overflow: "hidden" }}>
      <div style={{
        position: "absolute", inset: 0,
        background: "linear-gradient(135deg, rgba(201,168,76,0.07) 0%, transparent 50%, rgba(201,168,76,0.03) 100%)"
      }} />
      <div className="glass" style={{ borderRadius: "16px", padding: "32px 36px", position: "relative" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
          <Sparkles style={{ width: 16, height: 16, color: "var(--color-accent)", opacity: 0.5 }} />
          <p style={{
            fontSize: "11px", color: "var(--color-text-muted)",
            textTransform: "uppercase", letterSpacing: "0.2em", fontWeight: 500
          }}>
            Balance Total
          </p>
        </div>
        <p style={{
          fontFamily: "var(--font-display)", fontSize: "clamp(36px, 5vw, 56px)",
          color: "var(--color-text-primary)", letterSpacing: "-0.02em", lineHeight: 1
        }}>
          {mask(formatCurrency(totalBalance))}
        </p>

        {hasHistory && (
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "16px" }}>
            <div style={{
              display: "flex", alignItems: "center", gap: "6px",
              padding: "4px 10px", borderRadius: "8px", fontSize: "12px", fontWeight: 600,
              background: isPositive ? "rgba(74,222,128,0.1)" : "rgba(248,113,113,0.1)",
              color: isPositive ? "var(--color-success)" : "var(--color-danger)",
              border: `1px solid ${isPositive ? "rgba(74,222,128,0.15)" : "rgba(248,113,113,0.15)"}`,
              ...(balanceChange === 0 ? {
                background: "var(--color-surface-elevated)",
                color: "var(--color-text-muted)",
                border: "1px solid var(--color-border-subtle)"
              } : {})
            }}>
              {balanceChange === 0 ? (
                <Minus style={{ width: 12, height: 12 }} />
              ) : isPositive ? (
                <TrendingUp style={{ width: 12, height: 12 }} />
              ) : (
                <TrendingDown style={{ width: 12, height: 12 }} />
              )}
              {balanceChangePercent > 0 ? "+" : ""}
              {balanceChangePercent.toFixed(1)}%
            </div>
            <span style={{ fontSize: "12px", color: "var(--color-text-muted)" }}>vs. mes anterior</span>
          </div>
        )}
      </div>
    </div>
  );
}
