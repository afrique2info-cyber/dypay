import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface FastForexResponse {
  base: string;
  results: Record<string, number>;
  updated: string;
  ms: number;
}

const FASTFOREX_API_KEY = Deno.env.get("FASTFOREX_API_KEY");
const FASTFOREX_API_URL = "https://api.fastforex.io/fetch-multi";

async function fetchExchangeRatesFromAPI(baseCurrency: string, targetCurrencies: string[]): Promise<FastForexResponse | null> {
  try {
    if (!FASTFOREX_API_KEY) {
      console.error("FASTFOREX_API_KEY is not configured");
      return null;
    }

    const currencies = targetCurrencies.join(',');
    const url = `${FASTFOREX_API_URL}?from=${baseCurrency}&to=${currencies}&api_key=${FASTFOREX_API_KEY}`;

    const response = await fetch(url);

    if (!response.ok) {
      console.error(`FastForex API request failed with status ${response.status}`);
      const errorText = await response.text();
      console.error(`Error response: ${errorText}`);
      return null;
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching exchange rates from FastForex API:", error);
    return null;
  }
}

function calculateCrossRate(xafToUSD: number, usdToTarget: number): number {
  return xafToUSD * usdToTarget;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const targetCurrencies = ['XAF', 'XOF', 'NGN', 'GHS', 'KES', 'TZS', 'UGX', 'ZAR', 'MAD', 'EGP', 'EUR', 'GBP'];

    const usdRates = await fetchExchangeRatesFromAPI("USD", targetCurrencies);

    if (!usdRates || !usdRates.results) {
      throw new Error("Failed to fetch exchange rates from FastForex API");
    }

    const xafToUSD = 1 / (usdRates.results.XAF || 606);

    const currenciesToUpdate = [
      { code: 'XAF', rateFromUSD: usdRates.results.XAF || 606 },
      { code: 'XOF', rateFromUSD: usdRates.results.XOF || 606 },
      { code: 'NGN', rateFromUSD: usdRates.results.NGN || 820 },
      { code: 'GHS', rateFromUSD: usdRates.results.GHS || 12.1 },
      { code: 'KES', rateFromUSD: usdRates.results.KES || 129 },
      { code: 'TZS', rateFromUSD: usdRates.results.TZS || 2330 },
      { code: 'UGX', rateFromUSD: usdRates.results.UGX || 3715 },
      { code: 'ZAR', rateFromUSD: usdRates.results.ZAR || 18.2 },
      { code: 'MAD', rateFromUSD: usdRates.results.MAD || 10 },
      { code: 'EGP', rateFromUSD: usdRates.results.EGP || 30.9 },
      { code: 'USD', rateFromUSD: 1 },
      { code: 'EUR', rateFromUSD: usdRates.results.EUR || 0.92 },
      { code: 'GBP', rateFromUSD: usdRates.results.GBP || 0.79 },
    ];

    const updates = [];

    for (const currency of currenciesToUpdate) {
      const xafRate = calculateCrossRate(xafToUSD, currency.rateFromUSD);

      updates.push({
        base_currency: 'XAF',
        target_currency: currency.code,
        rate: xafRate,
        last_updated: new Date().toISOString(),
      });

      if (currency.code !== 'XAF') {
        updates.push({
          base_currency: currency.code,
          target_currency: 'XAF',
          rate: 1 / xafRate,
          last_updated: new Date().toISOString(),
        });
      }
    }

    const { error: upsertError } = await supabase
      .from('currency_exchange_rates')
      .upsert(updates, {
        onConflict: 'base_currency,target_currency',
      });

    if (upsertError) {
      throw upsertError;
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Updated ${updates.length} exchange rates using FastForex`,
        timestamp: new Date().toISOString(),
        rates_sample: {
          XAF_to_USD: xafToUSD,
          XAF_to_EUR: calculateCrossRate(xafToUSD, usdRates.results.EUR || 0.92),
          XAF_to_NGN: calculateCrossRate(xafToUSD, usdRates.results.NGN || 820),
        },
        api_updated: usdRates.updated,
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );

  } catch (error) {
    console.error("Error updating exchange rates:", error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});
