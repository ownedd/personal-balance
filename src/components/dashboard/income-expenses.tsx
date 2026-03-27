import { ArrowUpRight, ArrowDownRight, Scale } from "lucide-react";
import { formatCurrency } from "@/lib/utils.ts";
import { usePrivacy } from "@/contexts/privacy-context.tsx";

interface IncomeExpensesProps {
  income: number;
  expenses: number;
}

export function IncomeExpenses({ income, expenses }: IncomeExpensesProps) {
  const { mask } = usePrivacy();
  const net = income - expenses;

  return (
    <div className="glass animate-fade-in stagger-4 card-premium" style={{ borderRadius: "16px", padding: "28px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "24px" }}>
        <Scale style={{ width: 16, height: 16, color: "var(--color-accent)", opacity: 0.5 }} />
        <h3 style={{
          fontSize: "11px", fontWeight: 500, color: "var(--color-text-muted)",
          textTransform: "uppercase", letterSpacing: "0.2em"
        }}>
          Este Mes
        </h3>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        {/* Ingresos */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <div style={{
              width: "40px", height: "40px", borderRadius: "12px",
              background: "rgba(74,222,128,0.08)", border: "1px solid rgba(74,222,128,0.12)",
              display: "flex", alignItems: "center", justifyContent: "center"
            }}>
              <ArrowUpRight style={{ width: 18, height: 18, color: "var(--color-success)" }} />
            </div>
            <span style={{ fontSize: "15px", color: "var(--color-text-secondary)" }}>Ingresos</span>
          </div>
          <span style={{ fontSize: "15px", fontWeight: 600, color: "var(--color-success)", fontVariantNumeric: "tabular-nums" }}>
            +{mask(formatCurrency(income))}
          </span>
        </div>

        {/* Gastos */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <div style={{
              width: "40px", height: "40px", borderRadius: "12px",
              background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.12)",
              display: "flex", alignItems: "center", justifyContent: "center"
            }}>
              <ArrowDownRight style={{ width: 18, height: 18, color: "var(--color-danger)" }} />
            </div>
            <span style={{ fontSize: "15px", color: "var(--color-text-secondary)" }}>Gastos</span>
          </div>
          <span style={{ fontSize: "15px", fontWeight: 600, color: "var(--color-danger)", fontVariantNumeric: "tabular-nums" }}>
            -{mask(formatCurrency(expenses))}
          </span>
        </div>

        {/* Neto */}
        <div style={{ paddingTop: "20px", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: "15px", color: "var(--color-text-secondary)" }}>Balance neto</span>
            <span style={{
              fontFamily: "var(--font-display)", fontSize: "24px",
              fontVariantNumeric: "tabular-nums", letterSpacing: "-0.02em",
              color: net >= 0 ? "var(--color-success)" : "var(--color-danger)"
            }}>
              {net >= 0 ? "+" : ""}{mask(formatCurrency(net))}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
