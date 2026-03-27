import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import type { Account } from "@/lib/database.types.ts";
import { formatCurrency, getAccountTypeLabel } from "@/lib/utils.ts";
import { usePrivacy } from "@/contexts/privacy-context.tsx";

interface AccountSummaryProps {
  accounts: Account[];
}

interface ChartSlice {
  name: string;
  value: number;
  color: string;
}

export function AccountSummary({ accounts }: AccountSummaryProps) {
  const { mask } = usePrivacy();
  if (accounts.length === 0) {
    return (
      <div className="glass animate-fade-in stagger-3" style={{ borderRadius: "16px", padding: "28px" }}>
        <h3 style={{
          fontSize: "11px", fontWeight: 500, color: "var(--color-text-muted)",
          textTransform: "uppercase", letterSpacing: "0.2em", marginBottom: "16px"
        }}>
          Distribución por Tipo
        </h3>
        <div style={{ height: "200px", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <p style={{ color: "var(--color-text-muted)", fontSize: "14px" }}>Sin cuentas registradas</p>
        </div>
      </div>
    );
  }

  const typeMap = new Map<string, { value: number; color: string }>();
  const typeColors: Record<string, string> = {
    bank: "#60a5fa",
    cash: "#4ade80",
    savings: "#c9a84c",
    credit_card: "#f87171",
    crypto_wallet: "#f59e0b",
  };

  for (const acc of accounts) {
    const existing = typeMap.get(acc.type);
    typeMap.set(acc.type, {
      value: (existing?.value ?? 0) + Math.abs(Number(acc.current_balance)),
      color: typeColors[acc.type] ?? "#a78bfa",
    });
  }

  const data: ChartSlice[] = Array.from(typeMap.entries()).map(([key, val]) => ({
    name: getAccountTypeLabel(key), value: val.value, color: val.color,
  }));

  return (
    <div className="glass animate-fade-in stagger-3 card-premium" style={{ borderRadius: "16px", padding: "28px" }}>
      <h3 style={{
        fontSize: "11px", fontWeight: 500, color: "var(--color-text-muted)",
        textTransform: "uppercase", letterSpacing: "0.2em", marginBottom: "20px"
      }}>
        Distribución por Tipo
      </h3>
      <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
        <div style={{ width: "140px", height: "140px", flexShrink: 0 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={data} cx="50%" cy="50%" innerRadius={35} outerRadius={60}
                paddingAngle={3} dataKey="value" stroke="none">
                {data.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={{
                background: "#22253a", border: "1px solid #2a2d3e",
                borderRadius: "8px", fontSize: "12px", color: "#eae8e1",
              }} formatter={(value) => mask(formatCurrency(Number(value)))} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px", flex: 1, minWidth: 0 }}>
          {data.map((item) => (
            <div key={item.name} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{
                width: "10px", height: "10px", borderRadius: "50%",
                backgroundColor: item.color, flexShrink: 0
              }} />
              <span style={{ fontSize: "13px", color: "var(--color-text-secondary)", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {item.name}
              </span>
              <span style={{ fontSize: "13px", color: "var(--color-text-primary)", fontWeight: 500, fontVariantNumeric: "tabular-nums" }}>
                {mask(formatCurrency(item.value))}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
