import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase.ts";
import type { AccountType } from "@/lib/database.types.ts";
import { useAuth } from "@/contexts/auth-context.tsx";
import { queryKeys } from "@/lib/query-keys.ts";
import { fetchAccountsBundle } from "@/lib/finance-queries.ts";

export interface CreateAccountData {
  name: string;
  type: AccountType;
  currency: string;
  current_balance: number;
  color: string;
  icon: string;
}

export interface UpsertAccountAssetData {
  account_id: string;
  asset_symbol: string;
  asset_name: string;
  coingecko_id: string;
  quantity: number;
  average_buy_price?: number | null;
  reference_currency?: string;
}

export function useAccounts() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const userId = user?.id;

  const accountsQuery = useQuery({
    queryKey: userId ? queryKeys.accountsBundle(userId) : ["accounts-bundle", "none"],
    queryFn: () => fetchAccountsBundle(userId!),
    enabled: Boolean(userId),
  });

  const invalidateAccounts = () => {
    if (userId) {
      void queryClient.invalidateQueries({ queryKey: queryKeys.accountsBundle(userId) });
    }
  };

  const createAccount = useMutation({
    mutationFn: async (data: CreateAccountData) => {
      if (!user) throw new Error("No autenticado");
      const { error } = await supabase.from("accounts").insert({
        ...data,
        currency: data.type === "crypto_wallet" ? "USD" : data.currency,
        current_balance: data.type === "crypto_wallet" ? 0 : data.current_balance,
        user_id: user.id,
        is_active: true,
      } as Record<string, unknown>);
      if (error) throw error;
    },
    onSuccess: invalidateAccounts,
  });

  const updateAccount = useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: Partial<CreateAccountData>;
    }) => {
      const { error } = await supabase
        .from("accounts")
        .update(data as Record<string, unknown>)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: invalidateAccounts,
  });

  const deactivateAccount = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("accounts")
        .update({ is_active: false } as Record<string, unknown>)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: invalidateAccounts,
  });

  const upsertAccountAsset = useMutation({
    mutationFn: async (data: UpsertAccountAssetData) => {
      if (!user) throw new Error("No autenticado");
      const { error } = await supabase.from("account_assets").upsert(
        {
          account_id: data.account_id,
          user_id: user.id,
          asset_symbol: data.asset_symbol.toUpperCase(),
          asset_name: data.asset_name,
          coingecko_id: data.coingecko_id,
          quantity: data.quantity,
          average_buy_price: data.average_buy_price ?? null,
          reference_currency: data.reference_currency ?? "USD",
        } as Record<string, unknown>,
        { onConflict: "account_id,asset_symbol" },
      );
      if (error) throw error;
    },
    onSuccess: invalidateAccounts,
  });

  const deleteAccountAsset = useMutation({
    mutationFn: async (assetId: string) => {
      const { error } = await supabase
        .from("account_assets")
        .delete()
        .eq("id", assetId);
      if (error) throw error;
    },
    onSuccess: invalidateAccounts,
  });

  const bundle = accountsQuery.data;

  return {
    accounts: bundle?.accounts ?? [],
    accountAssets: bundle?.accountAssets ?? [],
    assetsByAccount: bundle?.assetsByAccount ?? {},
    loading: accountsQuery.isPending,
    isError: accountsQuery.isError,
    error: accountsQuery.error,
    totalBalance: bundle?.totalBalance ?? 0,
    createAccount: (data: CreateAccountData) => createAccount.mutateAsync(data),
    updateAccount: (id: string, data: Partial<CreateAccountData>) =>
      updateAccount.mutateAsync({ id, data }),
    deactivateAccount: (id: string) => deactivateAccount.mutateAsync(id),
    upsertAccountAsset: (data: UpsertAccountAssetData) =>
      upsertAccountAsset.mutateAsync(data),
    deleteAccountAsset: (assetId: string) =>
      deleteAccountAsset.mutateAsync(assetId),
    refetch: accountsQuery.refetch,
  };
}
