import type { Transaction } from "@/lib/database.types.ts";
import { TransactionList } from "@/components/transactions/transaction-list.tsx";
import { Activity } from "lucide-react";

interface RecentActivityProps {
  transactions: Transaction[];
}

export function RecentActivity({ transactions }: RecentActivityProps) {
  return (
    <div className="glass animate-fade-in stagger-5 card-premium" style={{ borderRadius: "16px", padding: "28px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
        <Activity style={{ width: 16, height: 16, color: "var(--color-accent)", opacity: 0.5 }} />
        <h3 style={{
          fontSize: "11px", fontWeight: 500, color: "var(--color-text-muted)",
          textTransform: "uppercase", letterSpacing: "0.2em"
        }}>
          Últimos Movimientos
        </h3>
      </div>
      <TransactionList transactions={transactions.slice(0, 7)} compact />
    </div>
  );
}
