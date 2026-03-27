import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase.ts";
import type {
  Account,
  AccountAsset,
  MonthlySnapshot,
} from "@/lib/database.types.ts";
import { useAuth } from "@/contexts/auth-context.tsx";
import {
  applyCryptoBalancesToAccounts,
  buildCryptoTotalsByAccount,
  enrichAccountAssetsWithPrices,
  fetchCryptoPrices,
} from "@/lib/crypto.ts";

interface TxRow {
  type: string;
  amount: number;
}

export function useMonthlySnapshots() {
  const { user } = useAuth();
  const [snapshots, setSnapshots] = useState<MonthlySnapshot[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSnapshots = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from("monthly_snapshots")
      .select("*")
      .eq("user_id", user.id)
      .order("year", { ascending: false })
      .order("month", { ascending: false });
    setSnapshots((data as unknown as MonthlySnapshot[]) ?? []);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchSnapshots();
  }, [fetchSnapshots]);

  const closeMonth = async (year: number, month: number) => {
    if (!user) return { error: new Error("No autenticado") };

    const [{ data: accountsData }, { data: assetsData }] = await Promise.all([
      supabase
        .from("accounts")
        .select("*")
        .eq("user_id", user.id)
        .eq("is_active", true),
      supabase.from("account_assets").select("*").eq("user_id", user.id),
    ]);

    const baseAccounts = (accountsData as unknown as Account[]) ?? [];
    const assets = (assetsData as unknown as AccountAsset[]) ?? [];
    let accounts = baseAccounts;

    if (assets.length > 0) {
      try {
        const prices = await fetchCryptoPrices(
          assets.map((asset) => asset.coingecko_id)
        );
        const pricedAssets = enrichAccountAssetsWithPrices(assets, prices);
        const totalsByAccount = buildCryptoTotalsByAccount(pricedAssets);
        accounts = applyCryptoBalancesToAccounts(baseAccounts, totalsByAccount);

        await Promise.all(
          accounts
            .filter((account) => account.type === "crypto_wallet")
            .map((account) =>
              supabase
                .from("accounts")
                .update({
                  current_balance: Number(account.current_balance),
                  currency: "USD",
                } as Record<string, unknown>)
                .eq("id", account.id)
            )
        );
      } catch (error) {
        console.error(error);
      }
    }

    if (accounts.length === 0)
      return { error: new Error("No hay cuentas activas") };

    const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
    const endDate =
      month === 12
        ? `${year + 1}-01-01`
        : `${year}-${String(month + 1).padStart(2, "0")}-01`;

    const errors: Error[] = [];

    for (const account of accounts) {
      const { data: txData } = await supabase
        .from("transactions")
        .select("type, amount")
        .eq("account_id", account.id)
        .gte("transaction_date", startDate)
        .lt("transaction_date", endDate);

      const txRows = (txData as unknown as TxRow[]) ?? [];

      const totalIncome = txRows
        .filter((t) => t.type === "income")
        .reduce((sum, t) => sum + Number(t.amount), 0);

      const totalExpenses = txRows
        .filter((t) => t.type === "expense")
        .reduce((sum, t) => sum + Number(t.amount), 0);

      const closingBalance = Number(account.current_balance);
      const openingBalance = closingBalance - totalIncome + totalExpenses;

      const { error } = await supabase.from("monthly_snapshots").upsert(
        {
          account_id: account.id,
          user_id: user.id,
          year,
          month,
          opening_balance: openingBalance,
          closing_balance: closingBalance,
          total_income: totalIncome,
          total_expenses: totalExpenses,
          closed_at: new Date().toISOString(),
        } as Record<string, unknown>,
        { onConflict: "account_id,year,month" }
      );

      if (error) errors.push(error as unknown as Error);
    }

    if (errors.length === 0) await fetchSnapshots();
    return { error: errors.length > 0 ? errors[0] : null };
  };

  return {
    snapshots,
    loading,
    closeMonth,
    refetch: fetchSnapshots,
  };
}
