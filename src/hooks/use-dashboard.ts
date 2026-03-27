import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase.ts";
import type {
  Account,
  AccountAsset,
  MonthlySnapshot,
  Transaction,
} from "@/lib/database.types.ts";
import { useAuth } from "@/contexts/auth-context.tsx";
import {
  applyCryptoBalancesToAccounts,
  buildCryptoTotalsByAccount,
  enrichAccountAssetsWithPrices,
  fetchCryptoPrices,
} from "@/lib/crypto.ts";

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
  const [data, setData] = useState<Omit<DashboardData, "loading">>({
    totalBalance: 0,
    accounts: [],
    recentTransactions: [],
    monthlySnapshots: [],
    currentMonthIncome: 0,
    currentMonthExpenses: 0,
    previousMonthBalance: null,
    balanceChange: 0,
    balanceChangePercent: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      setLoading(true);

      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth() + 1;
      const startDate = `${year}-${String(month).padStart(2, "0")}-01`;

      const [accountsRes, assetsRes, txRes, snapshotsRes, currentTxRes] =
        await Promise.all([
          supabase
            .from("accounts")
            .select("*")
            .eq("user_id", user.id)
            .eq("is_active", true)
            .order("created_at"),
          supabase
            .from("account_assets")
            .select("*")
            .eq("user_id", user.id)
            .order("created_at", { ascending: true }),
          supabase
            .from("transactions")
            .select("*")
            .eq("user_id", user.id)
            .order("transaction_date", { ascending: false })
            .order("created_at", { ascending: false })
            .limit(10),
          supabase
            .from("monthly_snapshots")
            .select("*")
            .eq("user_id", user.id)
            .order("year", { ascending: true })
            .order("month", { ascending: true }),
          supabase
            .from("transactions")
            .select("type, amount")
            .eq("user_id", user.id)
            .gte("transaction_date", startDate),
        ]);

      const baseAccounts = (accountsRes.data as unknown as Account[]) ?? [];
      const assets = (assetsRes.data as unknown as AccountAsset[]) ?? [];

      let accounts = baseAccounts;

      if (assets.length > 0) {
        try {
          const prices = await fetchCryptoPrices(
            assets.map((asset) => asset.coingecko_id)
          );
          const pricedAssets = enrichAccountAssetsWithPrices(assets, prices);
          accounts = applyCryptoBalancesToAccounts(
            baseAccounts,
            buildCryptoTotalsByAccount(pricedAssets)
          );
        } catch (error) {
          console.error(error);
        }
      }

      const totalBalance = accounts.reduce(
        (sum, a) => sum + Number(a.current_balance),
        0
      );

      const currentTx = (currentTxRes.data as unknown as TxSummaryRow[]) ?? [];
      const currentMonthIncome = currentTx
        .filter((t) => t.type === "income")
        .reduce((sum, t) => sum + Number(t.amount), 0);
      const currentMonthExpenses = currentTx
        .filter((t) => t.type === "expense")
        .reduce((sum, t) => sum + Number(t.amount), 0);

      const allSnapshots = (snapshotsRes.data as unknown as MonthlySnapshot[]) ?? [];

      const prevMonth = month === 1 ? 12 : month - 1;
      const prevYear = month === 1 ? year - 1 : year;
      const prevSnapshots = allSnapshots.filter(
        (s) => s.year === prevYear && s.month === prevMonth
      );
      const previousMonthBalance =
        prevSnapshots.length > 0
          ? prevSnapshots.reduce(
              (sum, s) => sum + Number(s.closing_balance),
              0
            )
          : null;

      const balanceChange =
        previousMonthBalance !== null
          ? totalBalance - previousMonthBalance
          : 0;
      const balanceChangePercent =
        previousMonthBalance && previousMonthBalance !== 0
          ? (balanceChange / Math.abs(previousMonthBalance)) * 100
          : 0;

      setData({
        totalBalance,
        accounts,
        recentTransactions: (txRes.data as unknown as Transaction[]) ?? [],
        monthlySnapshots: allSnapshots,
        currentMonthIncome,
        currentMonthExpenses,
        previousMonthBalance,
        balanceChange,
        balanceChangePercent,
      });
      setLoading(false);
    };

    fetchData();
  }, [user]);

  return { ...data, loading };
}
