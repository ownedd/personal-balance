import type {
  Account,
  AccountAsset,
  AccountAssetWithPrice,
} from "@/lib/database.types.ts";
import { supabase } from "@/lib/supabase.ts";

export interface SupportedCryptoAsset {
  symbol: string;
  name: string;
  coingeckoId: string;
}

export const SUPPORTED_CRYPTO_ASSETS: SupportedCryptoAsset[] = [
  { symbol: "BTC", name: "Bitcoin", coingeckoId: "bitcoin" },
  { symbol: "USDT", name: "Tether", coingeckoId: "tether" },
  { symbol: "ETH", name: "Ethereum", coingeckoId: "ethereum" },
  { symbol: "USDC", name: "USD Coin", coingeckoId: "usd-coin" },
  { symbol: "SOL", name: "Solana", coingeckoId: "solana" },
  { symbol: "BNB", name: "BNB", coingeckoId: "binancecoin" },
];

let priceCache: { data: Record<string, number>; timestamp: number } | null =
  null;
const CACHE_TTL_MS = 60_000;
const CRYPTO_PRICES_FUNCTION = "crypto-prices";

function isLocalhost() {
  if (typeof window === "undefined") return false;
  return ["localhost", "127.0.0.1"].includes(window.location.hostname);
}

async function fetchDirectFromCoinGecko(
  uniqueIds: string[]
): Promise<Record<string, number>> {
  const params = new URLSearchParams({
    ids: uniqueIds.join(","),
    vs_currencies: "usd",
  });

  const response = await fetch(
    `https://api.coingecko.com/api/v3/simple/price?${params.toString()}`
  );

  if (!response.ok) {
    throw new Error("No se pudieron obtener precios desde CoinGecko");
  }

  const data = (await response.json()) as Record<
    string,
    { usd?: number } | undefined
  >;

  return uniqueIds.reduce<Record<string, number>>((acc, id) => {
    acc[id] = Number(data[id]?.usd ?? 0);
    return acc;
  }, {});
}

export async function fetchCryptoPrices(
  coingeckoIds: string[]
): Promise<Record<string, number>> {
  const uniqueIds = Array.from(
    new Set(coingeckoIds.filter((id) => id && id.trim().length > 0))
  );

  if (uniqueIds.length === 0) return {};

  if (
    priceCache &&
    Date.now() - priceCache.timestamp < CACHE_TTL_MS &&
    uniqueIds.every((id) => id in priceCache!.data)
  ) {
    return priceCache.data;
  }

  let prices: Record<string, number> | null = null;

  try {
    const { data, error } = await supabase.functions.invoke<Record<string, number>>(
      CRYPTO_PRICES_FUNCTION,
      {
        body: { ids: uniqueIds },
      }
    );

    if (error) {
      throw error;
    }

    prices = uniqueIds.reduce<Record<string, number>>((acc, id) => {
      acc[id] = Number(data?.[id] ?? 0);
      return acc;
    }, {});
  } catch (error) {
    if (isLocalhost()) {
      prices = await fetchDirectFromCoinGecko(uniqueIds);
    } else if (priceCache) {
      return priceCache.data;
    } else {
      throw error;
    }
  }

  priceCache = { data: prices, timestamp: Date.now() };

  return prices;
}

export function enrichAccountAssetsWithPrices(
  assets: AccountAsset[],
  prices: Record<string, number>
): AccountAssetWithPrice[] {
  return assets.map((asset) => {
    const currentPrice = Number(prices[asset.coingecko_id] ?? 0);
    const quantity = Number(asset.quantity);

    return {
      ...asset,
      quantity,
      average_buy_price:
        asset.average_buy_price !== null
          ? Number(asset.average_buy_price)
          : null,
      current_price_usd: currentPrice,
      current_value_usd: quantity * currentPrice,
    };
  });
}

export function buildCryptoTotalsByAccount(
  assets: AccountAssetWithPrice[]
): Record<string, number> {
  return assets.reduce<Record<string, number>>((acc, asset) => {
    acc[asset.account_id] =
      Number(acc[asset.account_id] ?? 0) + Number(asset.current_value_usd);
    return acc;
  }, {});
}

export function applyCryptoBalancesToAccounts(
  accounts: Account[],
  totalsByAccount: Record<string, number>
): Account[] {
  return accounts.map((account) =>
    account.type === "crypto_wallet"
      ? {
          ...account,
          currency: "USD",
          current_balance: Number(totalsByAccount[account.id] ?? 0),
        }
      : account
  );
}
