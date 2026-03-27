import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import type { MonthlySnapshot } from "@/lib/database.types.ts";
import { getMonthName, formatCurrency } from "@/lib/utils.ts";
import { usePrivacy } from "@/contexts/privacy-context.tsx";

interface MonthlyChartProps {
  snapshots: MonthlySnapshot[];
}

interface ChartPoint {
  label: string;
  balance: number;
}

export function MonthlyChart({ snapshots }: MonthlyChartProps) {
  const { mask, hidden } = usePrivacy();
  if (snapshots.length === 0) {
    return (
      <div className="glass animate-fade-in stagger-2" style={{ borderRadius: "16px", padding: "28px" }}>
        <h3 style={{
          fontSize: "11px", fontWeight: 500, color: "var(--color-text-muted)",
          textTransform: "uppercase", letterSpacing: "0.2em", marginBottom: "16px"
        }}>
          Evolución del Balance
        </h3>
        <div style={{ height: "200px", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <p style={{ color: "var(--color-text-muted)", fontSize: "14px" }}>
            Se mostrará al tener cierres mensuales
          </p>
        </div>
      </div>
    );
  }

  const periodMap = new Map<string, number>();
  for (const snap of snapshots) {
    const key = `${snap.year}-${snap.month}`;
    periodMap.set(key, (periodMap.get(key) ?? 0) + Number(snap.closing_balance));
  }

  const chartData: ChartPoint[] = Array.from(periodMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-12)
    .map(([key, balance]) => {
      const month = parseInt(key.split("-")[1]);
      return {
        label: getMonthName(month).slice(0, 3).toUpperCase(),
        balance,
      };
    });

  return (
    <div className="glass animate-fade-in stagger-2 card-premium" style={{ borderRadius: "16px", padding: "28px" }}>
      <h3 style={{
        fontSize: "11px", fontWeight: 500, color: "var(--color-text-muted)",
        textTransform: "uppercase", letterSpacing: "0.2em", marginBottom: "16px"
      }}>
        Evolución del Balance
      </h3>
      <div style={{ height: "200px" }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="balanceGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#c9a84c" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#c9a84c" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
            <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: "#5e5c56", fontSize: 10 }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: "#5e5c56", fontSize: 10 }}
              tickFormatter={(v) => mask(formatCurrency(Number(v)).replace(/,\d+$/, ""))} width={70} />
            <Tooltip contentStyle={{
              background: "#22253a", border: "1px solid #2a2d3e",
              borderRadius: "8px", fontSize: "12px", color: "#eae8e1",
            }} formatter={(value) => [mask(formatCurrency(Number(value))), "Balance"]}
            active={hidden ? false : undefined} />
            <Area type="monotone" dataKey="balance" stroke="#c9a84c" strokeWidth={2} fill="url(#balanceGrad)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
