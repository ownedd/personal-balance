import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase.ts";
import type { Transaction, TransactionType } from "@/lib/database.types.ts";
import { useAuth } from "@/contexts/auth-context.tsx";

export interface CreateTransactionData {
  account_id: string;
  type: TransactionType;
  amount: number;
  description: string;
  category?: string;
  transaction_date?: string;
}

export function useTransactions(accountId?: string) {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTransactions = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    let query = supabase
      .from("transactions")
      .select("*")
      .eq("user_id", user.id)
      .order("transaction_date", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(100);

    if (accountId) {
      query = query.eq("account_id", accountId);
    }

    const { data } = await query;
    setTransactions((data as unknown as Transaction[]) ?? []);
    setLoading(false);
  }, [user, accountId]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const createTransaction = async (data: CreateTransactionData) => {
    if (!user) return { error: new Error("No autenticado") };

    const { data: accountData } = await supabase
      .from("accounts")
      .select("current_balance, type")
      .eq("id", data.account_id)
      .single();

    const account = accountData as unknown as {
      current_balance: number;
      type: string;
    } | null;
    if (!account) return { error: new Error("Cuenta no encontrada") };
    if (account.type === "crypto_wallet") {
      return {
        error: new Error(
          "Las wallets cripto se gestionan por activos, no por movimientos de saldo."
        ),
      };
    }

    const currentBalance = Number(account.current_balance);
    let newBalance: number;

    switch (data.type) {
      case "income":
        newBalance = currentBalance + data.amount;
        break;
      case "expense":
        newBalance = currentBalance - data.amount;
        break;
      case "adjustment":
        newBalance = data.amount;
        break;
    }

    const { error: txError } = await supabase.from("transactions").insert({
      account_id: data.account_id,
      user_id: user.id,
      type: data.type,
      amount: data.amount,
      balance_after: newBalance,
      description: data.description,
      category: data.category ?? null,
      transaction_date: data.transaction_date ?? new Date().toISOString().split("T")[0],
    } as Record<string, unknown>);

    if (txError) return { error: txError };

    const { error: accError } = await supabase
      .from("accounts")
      .update({ current_balance: newBalance } as Record<string, unknown>)
      .eq("id", data.account_id);

    if (!accError) await fetchTransactions();
    return { error: accError };
  };

  return {
    transactions,
    loading,
    createTransaction,
    refetch: fetchTransactions,
  };
}
