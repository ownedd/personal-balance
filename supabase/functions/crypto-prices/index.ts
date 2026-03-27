import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json",
  "Cache-Control": "public, max-age=60",
};

function getApiHeaders() {
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
      { status: 405, headers: corsHeaders }
    );
  }

  try {
    const body = (await req.json()) as { ids?: unknown };
    const ids = Array.isArray(body?.ids)
      ? body.ids.filter(
          (value): value is string =>
            typeof value === "string" && value.trim().length > 0
        )
      : [];

    const uniqueIds = Array.from(new Set(ids));

    if (uniqueIds.length === 0) {
      return new Response(JSON.stringify({}), { headers: corsHeaders });
    }

    const params = new URLSearchParams({
      ids: uniqueIds.join(","),
      vs_currencies: "usd",
    });

    const response = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?${params.toString()}`,
      {
        headers: getApiHeaders(),
      }
    );

    if (!response.ok) {
      const details = await response.text();
      return new Response(
        JSON.stringify({
          error: "CoinGecko request failed",
          status: response.status,
          details,
        }),
        { status: 502, headers: corsHeaders }
      );
    }

    const data = (await response.json()) as Record<
      string,
      { usd?: number } | undefined
    >;

    const prices = uniqueIds.reduce<Record<string, number>>((acc, id) => {
      acc[id] = Number(data[id]?.usd ?? 0);
      return acc;
    }, {});

    return new Response(JSON.stringify(prices), { headers: corsHeaders });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unexpected server error";

    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: corsHeaders,
    });
  }
});
