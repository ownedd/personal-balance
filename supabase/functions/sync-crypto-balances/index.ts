import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json",
  "Cache-Control": "no-store",
};

function getCoinGeckoHeaders() {
  const demoKey = Deno.env.get("COINGECKO_API_KEY");
  return demoKey ? { "x-cg-demo-api-key": demoKey } : {};
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers: corsHeaders },
    );
  }

  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: corsHeaders,
    });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: authHeader } },
  });

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: corsHeaders,
    });
  }

  try {
    const { data: assets, error: assetsError } = await supabase
      .from("account_assets")
      .select("account_id, coingecko_id, quantity")
      .eq("user_id", user.id);

    if (assetsError) {
      return new Response(
        JSON.stringify({ error: assetsError.message }),
        { status: 500, headers: corsHeaders },
      );
    }

    if (!assets?.length) {
      return new Response(JSON.stringify({ prices: {} }), {
        headers: corsHeaders,
      });
    }

    const uniqueIds = Array.from(
      new Set(
        assets
          .map((a) => a.coingecko_id)
          .filter(
            (id): id is string => typeof id === "string" && id.trim().length > 0,
          ),
      ),
    );

    if (uniqueIds.length === 0) {
      return new Response(JSON.stringify({ prices: {} }), {
        headers: corsHeaders,
      });
    }

    const params = new URLSearchParams({
      ids: uniqueIds.join(","),
      vs_currencies: "usd",
    });

    const cgResponse = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?${params.toString()}`,
      { headers: getCoinGeckoHeaders() },
    );

    if (!cgResponse.ok) {
      const details = await cgResponse.text();
      return new Response(
        JSON.stringify({
          error: "CoinGecko request failed",
          status: cgResponse.status,
          details,
        }),
        { status: 502, headers: corsHeaders },
      );
    }

    const rawPrices = (await cgResponse.json()) as Record<
      string,
      { usd?: number } | undefined
    >;

    const prices = uniqueIds.reduce<Record<string, number>>((acc, id) => {
      acc[id] = Number(rawPrices[id]?.usd ?? 0);
      return acc;
    }, {});

    const totalsByAccount = assets.reduce<Record<string, number>>(
      (acc, row) => {
        const id = row.account_id as string;
        const price = prices[row.coingecko_id as string] ?? 0;
        const qty = Number(row.quantity);
        acc[id] = (acc[id] ?? 0) + qty * price;
        return acc;
      },
      {},
    );

    const { data: cryptoAccounts, error: cryptoErr } = await supabase
      .from("accounts")
      .select("id")
      .eq("user_id", user.id)
      .eq("type", "crypto_wallet")
      .eq("is_active", true);

    if (cryptoErr) {
      return new Response(
        JSON.stringify({ error: cryptoErr.message }),
        { status: 500, headers: corsHeaders },
      );
    }

    for (const row of cryptoAccounts ?? []) {
      const id = row.id as string;
      const total = Number((totalsByAccount[id] ?? 0).toFixed(2));
      const { error: upErr } = await supabase
        .from("accounts")
        .update({
          current_balance: total,
          currency: "USD",
        } as Record<string, unknown>)
        .eq("id", id);

      if (upErr) {
        return new Response(JSON.stringify({ error: upErr.message }), {
          status: 500,
          headers: corsHeaders,
        });
      }
    }

    return new Response(JSON.stringify({ prices }), { headers: corsHeaders });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unexpected server error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: corsHeaders,
    });
  }
});
