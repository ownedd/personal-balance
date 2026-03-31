import { supabase } from "@/lib/supabase.ts";
import type {
  Account,
  AccountAsset,
  AccountAssetWithPrice,
  MonthlySnapshot,
  Transaction,
} from "@/lib/database.types.ts";
import {
  applyCryptoBalancesToAccounts,
  buildCryptoTotalsByAccount,
  enrichAccountAssetsWithPrices,
  fetchDirectFromCoinGecko,
  invokeSyncCryptoBalances,
  isLocalhost,
} from "@/lib/crypto.ts";

export interface AccountsBundle {
  accounts: Account[];
  accountAssets: AccountAssetWithPrice[];
  assetsByAccount: Record<string, AccountAssetWithPrice[]>;
  totalBalance: number;
}

async function selectAccounts(userId: string) {
  const { data, error } = await supabase
    .from("accounts")
    .select("*")
    .eq("user_id", userId)
    .eq("is_active", true)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return (data as unknown as Account[]) ?? [];
}

async function selectAccountAssets(userId: string) {
  const { data, error } = await supabase
    .from("account_assets")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return (data as unknown as AccountAsset[]) ?? [];
}

export async function fetchAccountsBundle(userId: string): Promise<AccountsBundle> {
  const rawAssets = await selectAccountAssets(userId);
  let rawAccounts = await selectAccounts(userId);

  let prices: Record<string, number> = {};
  let useLocalBalanceOverlay = false;

  if (rawAssets.length > 0) {
    try {
      prices = await invokeSyncCryptoBalances();
      rawAccounts = await selectAccounts(userId);
    } catch (err) {
      if (isLocalhost()) {
        console.warn(
          "[personal-balance] sync-crypto-balances no disponible; vista local sin persistir en BD:",
          err,
        );
        const ids = Array.from(
          new Set(
            rawAssets
              .map((a) => a.coingecko_id)
              .filter((id) => id && String(id).trim().length > 0),
          ),
        );
        prices = await fetchDirectFromCoinGecko(ids);
        useLocalBalanceOverlay = true;
      } else {
        throw err;
      }
    }
  }

  const pricedAssets = enrichAccountAssetsWithPrices(rawAssets, prices);
  let accounts = rawAccounts;

  if (useLocalBalanceOverlay) {
    accounts = applyCryptoBalancesToAccounts(
      rawAccounts,
      buildCryptoTotalsByAccount(pricedAssets),
    );
  }

  const assetsByAccount = pricedAssets.reduce<Record<string, AccountAssetWithPrice[]>>(
    (acc, asset) => {
      acc[asset.account_id] = [...(acc[asset.account_id] ?? []), asset];
      return acc;
    },
    {},
  );

  const totalBalance = accounts.reduce(
    (sum, acc) => sum + Number(acc.current_balance),
    0,
  );

  return {
    accounts,
    accountAssets: pricedAssets,
    assetsByAccount,
    totalBalance,
  };
}

export async function fetchMonthlySnapshots(userId: string) {
  const { data, error } = await supabase
    .from("monthly_snapshots")
    .select("*")
    .eq("user_id", userId)
    .order("year", { ascending: false })
    .order("month", { ascending: false });

  if (error) throw error;
  return (data as unknown as MonthlySnapshot[]) ?? [];
}

export async function fetchRecentTransactions(userId: string, limit = 10) {
  const { data, error } = await supabase
    .from("transactions")
    .select("*")
    .eq("user_id", userId)
    .order("transaction_date", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data as unknown as Transaction[]) ?? [];
}

interface TxSummaryRow {
  type: string;
  amount: number;
}

export async function fetchCurrentMonthTransactions(
  userId: string,
  startDate: string,
) {
  const { data, error } = await supabase
    .from("transactions")
    .select("type, amount")
    .eq("user_id", userId)
    .gte("transaction_date", startDate);

  if (error) throw error;
  return (data as unknown as TxSummaryRow[]) ?? [];
}
