import { useDashboard } from "@/hooks/use-dashboard.ts";
import { BalanceOverview } from "@/components/dashboard/balance-overview.tsx";
import { MonthlyChart } from "@/components/dashboard/monthly-chart.tsx";
import { AccountSummary } from "@/components/dashboard/account-summary.tsx";
import { IncomeExpenses } from "@/components/dashboard/income-expenses.tsx";
import { RecentActivity } from "@/components/dashboard/recent-activity.tsx";
import { Loader2 } from "lucide-react";

export function DashboardPage() {
  const data = useDashboard();

  if (data.loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "300px" }}>
        <Loader2 style={{ width: 28, height: 28, color: "var(--color-accent)" }} className="animate-spin" />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "1100px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "28px" }}>
      <BalanceOverview
        totalBalance={data.totalBalance}
        balanceChange={data.balanceChange}
        balanceChangePercent={data.balanceChangePercent}
        previousMonthBalance={data.previousMonthBalance}
      />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "28px" }}>
        <MonthlyChart snapshots={data.monthlySnapshots} />
        <AccountSummary accounts={data.accounts} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "28px" }}>
        <IncomeExpenses
          income={data.currentMonthIncome}
          expenses={data.currentMonthExpenses}
        />
        <RecentActivity transactions={data.recentTransactions} />
      </div>
    </div>
  );
}
