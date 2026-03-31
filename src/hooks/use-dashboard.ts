import { useMemo } from "react";
import { useQueries } from "@tanstack/react-query";
import { useAuth } from "@/contexts/auth-context.tsx";
import { queryKeys } from "@/lib/query-keys.ts";
import {
  fetchAccountsBundle,
  fetchCurrentMonthTransactions,
  fetchMonthlySnapshots,
  fetchRecentTransactions,
} from "@/lib/finance-queries.ts";
import type {
  Account,
  MonthlySnapshot,
  Transaction,
} from "@/lib/database.types.ts";

interface TxSummaryRow {
  type: string;
  amount: number;
}

export interface DashboardData {
  totalBalance: number;
  accounts: Account[];
  recentTransactions: Transaction[];
  monthlySnapshots: MonthlySnapshot[];
  currentMonthIncome: number;
  currentMonthExpenses: number;
  previousMonthBalance: number | null;
  balanceChange: number;
  balanceChangePercent: number;
  loading: boolean;
}

export function useDashboard(): DashboardData {
  const { user } = useAuth();
  const userId = user?.id;

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
  const yearMonthKey = `${year}-${String(month).padStart(2, "0")}`;
  const prevMonth = month === 1 ? 12 : month - 1;
  const prevYear = month === 1 ? year - 1 : year;

  const [accountsQ, txQ, snapshotsQ, monthTxQ] = useQueries({
    queries: [
      {
        queryKey: userId ? queryKeys.accountsBundle(userId) : ["accounts-bundle", "none"],
        queryFn: () => fetchAccountsBundle(userId!),
        enabled: Boolean(userId),
      },
      {
        queryKey: userId ? queryKeys.dashboardRecentTx(userId) : ["dashboard-recent-tx", "none"],
        queryFn: () => fetchRecentTransactions(userId!),
        enabled: Boolean(userId),
      },
      {
        queryKey: userId ? queryKeys.snapshots(userId) : ["monthly-snapshots", "none"],
        queryFn: () => fetchMonthlySnapshots(userId!),
        enabled: Boolean(userId),
      },
      {
        queryKey: userId
          ? queryKeys.dashboardMonthTx(userId, yearMonthKey)
          : ["dashboard-month-tx", "none"],
        queryFn: () => fetchCurrentMonthTransactions(userId!, startDate),
        enabled: Boolean(userId),
      },
    ],
  });

  return useMemo(() => {
    const loading =
      accountsQ.isPending ||
      txQ.isPending ||
      snapshotsQ.isPending ||
      monthTxQ.isPending;

    const accounts = accountsQ.data?.accounts ?? [];
    const totalBalance = accountsQ.data?.totalBalance ?? 0;

    const recentTransactions = txQ.data ?? [];
    const allSnapshots = snapshotsQ.data ?? [];
    const currentTx = (monthTxQ.data ?? []) as TxSummaryRow[];

    const currentMonthIncome = currentTx
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + Number(t.amount), 0);
    const currentMonthExpenses = currentTx
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const prevSnapshots = allSnapshots.filter(
      (s) => s.year === prevYear && s.month === prevMonth,
    );
    const previousMonthBalance =
      prevSnapshots.length > 0
        ? prevSnapshots.reduce((sum, s) => sum + Number(s.closing_balance), 0)
        : null;

    const balanceChange =
      previousMonthBalance !== null ? totalBalance - previousMonthBalance : 0;
    const balanceChangePercent =
      previousMonthBalance && previousMonthBalance !== 0
        ? (balanceChange / Math.abs(previousMonthBalance)) * 100
        : 0;

    return {
      totalBalance,
      accounts,
      recentTransactions,
      monthlySnapshots: allSnapshots,
      currentMonthIncome,
      currentMonthExpenses,
      previousMonthBalance,
      balanceChange,
      balanceChangePercent,
      loading,
    };
  }, [
    accountsQ.isPending,
    accountsQ.data,
    txQ.isPending,
    txQ.data,
    snapshotsQ.isPending,
    snapshotsQ.data,
    monthTxQ.isPending,
    monthTxQ.data,
    prevYear,
    prevMonth,
  ]);
}
