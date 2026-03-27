import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase.ts";
import type {
  Account,
  AccountAsset,
  AccountAssetWithPrice,
  AccountType,
} from "@/lib/database.types.ts";
import { useAuth } from "@/contexts/auth-context.tsx";
import {
  applyCryptoBalancesToAccounts,
  buildCryptoTotalsByAccount,
  enrichAccountAssetsWithPrices,
  fetchCryptoPrices,
} from "@/lib/crypto.ts";

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
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [accountAssets, setAccountAssets] = useState<AccountAssetWithPrice[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAccounts = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    const [{ data: accountsData }, { data: assetsData }] = await Promise.all([
      supabase
        .from("accounts")
        .select("*")
        .eq("user_id", user.id)
        .eq("is_active", true)
        .order("created_at", { ascending: true }),
      supabase
        .from("account_assets")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: true }),
    ]);

    const rawAccounts = (accountsData as unknown as Account[]) ?? [];
    const rawAssets = (assetsData as unknown as AccountAsset[]) ?? [];

    let pricedAssets: AccountAssetWithPrice[] = [];
    let nextAccounts = rawAccounts;

    if (rawAssets.length > 0) {
      try {
        const prices = await fetchCryptoPrices(
          rawAssets.map((asset) => asset.coingecko_id)
        );
        pricedAssets = enrichAccountAssetsWithPrices(rawAssets, prices);
        const totalsByAccount = buildCryptoTotalsByAccount(pricedAssets);
        nextAccounts = applyCryptoBalancesToAccounts(rawAccounts, totalsByAccount);

        const cryptoAccountsToSync = rawAccounts.filter(
          (account) =>
            account.type === "crypto_wallet" &&
            Math.abs(
              Number(account.current_balance) -
                Number(totalsByAccount[account.id] ?? 0)
            ) >= 0.01
        );

        await Promise.all(
          cryptoAccountsToSync.map((account) =>
            supabase
              .from("accounts")
              .update({
                current_balance: Number(totalsByAccount[account.id] ?? 0),
                currency: "USD",
              } as Record<string, unknown>)
              .eq("id", account.id)
          )
        );
      } catch (error) {
        console.error(error);
        pricedAssets = rawAssets.map((asset) => ({
          ...asset,
          quantity: Number(asset.quantity),
          average_buy_price:
            asset.average_buy_price !== null
              ? Number(asset.average_buy_price)
              : null,
          current_price_usd: 0,
          current_value_usd: 0,
        }));
      }
    }

    setAccountAssets(pricedAssets);
    setAccounts(nextAccounts);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  const createAccount = async (data: CreateAccountData) => {
    if (!user) return { error: new Error("No autenticado") };
    const { error } = await supabase.from("accounts").insert({
      ...data,
      currency: data.type === "crypto_wallet" ? "USD" : data.currency,
      current_balance: data.type === "crypto_wallet" ? 0 : data.current_balance,
      user_id: user.id,
      is_active: true,
    } as Record<string, unknown>);
    if (!error) await fetchAccounts();
    return { error };
  };

  const updateAccount = async (
    id: string,
    data: Partial<CreateAccountData>
  ) => {
    const { error } = await supabase
      .from("accounts")
      .update(data as Record<string, unknown>)
      .eq("id", id);
    if (!error) await fetchAccounts();
    return { error };
  };

  const deactivateAccount = async (id: string) => {
    const { error } = await supabase
      .from("accounts")
      .update({ is_active: false } as Record<string, unknown>)
      .eq("id", id);
    if (!error) await fetchAccounts();
    return { error };
  };

  const totalBalance = accounts.reduce(
    (sum, acc) => sum + Number(acc.current_balance),
    0
  );

  const assetsByAccount = useMemo(
    () =>
      accountAssets.reduce<Record<string, AccountAssetWithPrice[]>>(
        (acc, asset) => {
          acc[asset.account_id] = [...(acc[asset.account_id] ?? []), asset];
          return acc;
        },
        {}
      ),
    [accountAssets]
  );

  const upsertAccountAsset = async (data: UpsertAccountAssetData) => {
    if (!user) return { error: new Error("No autenticado") };

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
      { onConflict: "account_id,asset_symbol" }
    );

    if (!error) await fetchAccounts();
    return { error };
  };

  const deleteAccountAsset = async (assetId: string) => {
    const { error } = await supabase
      .from("account_assets")
      .delete()
      .eq("id", assetId);

    if (!error) await fetchAccounts();
    return { error };
  };

  return {
    accounts,
    accountAssets,
    assetsByAccount,
    loading,
    totalBalance,
    createAccount,
    updateAccount,
    deactivateAccount,
    upsertAccountAsset,
    deleteAccountAsset,
    refetch: fetchAccounts,
  };
}
