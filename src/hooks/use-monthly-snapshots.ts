import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase.ts";
import { useAuth } from "@/contexts/auth-context.tsx";
import { queryKeys } from "@/lib/query-keys.ts";
import { invokeSyncCryptoBalances, isLocalhost } from "@/lib/crypto.ts";
import { fetchMonthlySnapshots } from "@/lib/finance-queries.ts";

interface TxRow {
  type: string;
  amount: number;
}

export function useMonthlySnapshots() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const userId = user?.id;

  const snapshotsQuery = useQuery({
    queryKey: userId ? queryKeys.snapshots(userId) : ["monthly-snapshots", "none"],
    queryFn: () => fetchMonthlySnapshots(userId!),
    enabled: Boolean(userId),
  });

  const invalidateSnapshots = () => {
    if (userId) {
      void queryClient.invalidateQueries({ queryKey: queryKeys.snapshots(userId) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.accountsBundle(userId) });
    }
  };

  const closeMonth = useMutation({
    mutationFn: async ({ year, month }: { year: number; month: number }) => {
      if (!user) throw new Error("No autenticado");

      try {
        await invokeSyncCryptoBalances();
      } catch (err) {
        if (!isLocalhost()) throw err;
        console.warn("[personal-balance] Cerrar mes sin sync Edge en local:", err);
      }

      const { data: accountsData, error: accountsError } = await supabase
        .from("accounts")
        .select("*")
        .eq("user_id", user.id)
        .eq("is_active", true);

      if (accountsError) throw accountsError;

      const accounts = (accountsData as unknown as { id: string; current_balance: unknown }[]) ?? [];

      if (accounts.length === 0) {
        throw new Error("No hay cuentas activas");
      }

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
          { onConflict: "account_id,year,month" },
        );

        if (error) errors.push(error as unknown as Error);
      }

      if (errors.length > 0) throw errors[0];
    },
    onSuccess: invalidateSnapshots,
  });

  return {
    snapshots: snapshotsQuery.data ?? [],
    loading: snapshotsQuery.isPending,
    isError: snapshotsQuery.isError,
    error: snapshotsQuery.error,
    closeMonth: (year: number, month: number) =>
      closeMonth.mutateAsync({ year, month }),
    refetch: snapshotsQuery.refetch,
  };
}
