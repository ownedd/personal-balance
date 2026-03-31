import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase.ts";
import type { Transaction, TransactionType } from "@/lib/database.types.ts";
import { useAuth } from "@/contexts/auth-context.tsx";
import { queryKeys } from "@/lib/query-keys.ts";

export interface CreateTransactionData {
  account_id: string;
  type: TransactionType;
  amount: number;
  description: string;
  category?: string;
  transaction_date?: string;
}

async function fetchTransactionsList(userId: string, accountId?: string) {
  let query = supabase
    .from("transactions")
    .select("*")
    .eq("user_id", userId)
    .order("transaction_date", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(100);

  if (accountId) {
    query = query.eq("account_id", accountId);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data as unknown as Transaction[]) ?? [];
}

export function useTransactions(accountId?: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const userId = user?.id;

  const listQuery = useQuery({
    queryKey: userId
      ? queryKeys.transactions(userId, accountId)
      : ["transactions", "none"],
    queryFn: () => fetchTransactionsList(userId!, accountId),
    enabled: Boolean(userId),
  });

  const invalidateTx = () => {
    if (userId) {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.transactions(userId, accountId),
      });
      void queryClient.invalidateQueries({ queryKey: queryKeys.accountsBundle(userId) });
      void queryClient.invalidateQueries({
        predicate: (q) =>
          Array.isArray(q.queryKey) &&
          q.queryKey[0] === "transactions" &&
          q.queryKey[1] === userId,
      });
    }
  };

  const createTransaction = useMutation({
    mutationFn: async (data: CreateTransactionData) => {
      if (!user) throw new Error("No autenticado");

      const { data: accountData } = await supabase
        .from("accounts")
        .select("current_balance, type")
        .eq("id", data.account_id)
        .single();

      const account = accountData as unknown as {
        current_balance: number;
        type: string;
      } | null;
      if (!account) throw new Error("Cuenta no encontrada");
      if (account.type === "crypto_wallet") {
        throw new Error(
          "Las wallets cripto se gestionan por activos, no por movimientos de saldo.",
        );
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
        transaction_date:
          data.transaction_date ?? new Date().toISOString().split("T")[0],
      } as Record<string, unknown>);

      if (txError) throw txError;

      const { error: accError } = await supabase
        .from("accounts")
        .update({ current_balance: newBalance } as Record<string, unknown>)
        .eq("id", data.account_id);

      if (accError) throw accError;
    },
    onSuccess: invalidateTx,
  });

  return {
    transactions: listQuery.data ?? [],
    loading: listQuery.isPending,
    isError: listQuery.isError,
    error: listQuery.error,
    createTransaction: (data: CreateTransactionData) =>
      createTransaction.mutateAsync(data),
    refetch: listQuery.refetch,
  };
}
