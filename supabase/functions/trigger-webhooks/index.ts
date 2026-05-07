import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface WebhookPayload {
  event: string;
  merchant_id: string;
  data: any;
  timestamp: string;
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

    const payload: WebhookPayload = await req.json();
    console.log("Triggering webhooks for event:", payload.event);

    const { data: webhooks, error: webhooksError } = await supabase
      .from("merchant_webhooks")
      .select("*")
      .eq("merchant_id", payload.merchant_id)
      .eq("is_active", true)
      .contains("events", [payload.event]);

    if (webhooksError) {
      console.error("Error fetching webhooks:", webhooksError);
      throw webhooksError;
    }

    if (!webhooks || webhooks.length === 0) {
      console.log("No active webhooks found for this event");
      return new Response(
        JSON.stringify({ success: true, message: "No webhooks to trigger" }),
        {
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const results = await Promise.allSettled(
      webhooks.map(async (webhook) => {
        try {
          const webhookPayload = {
            event: payload.event,
            merchant_id: payload.merchant_id,
            data: payload.data,
            timestamp: payload.timestamp,
          };

          const signature = await generateSignature(
            JSON.stringify(webhookPayload),
            webhook.secret
          );

          const response = await fetch(webhook.url, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-Webhook-Signature": signature,
              "X-Webhook-Event": payload.event,
            },
            body: JSON.stringify(webhookPayload),
          });

          await supabase
            .from("merchant_webhooks")
            .update({
              last_triggered_at: new Date().toISOString(),
              last_response_status: response.status,
            })
            .eq("id", webhook.id);

          return {
            webhook_id: webhook.id,
            url: webhook.url,
            status: response.status,
            success: response.ok,
          };
        } catch (error) {
          console.error(`Error triggering webhook ${webhook.id}:`, error);

          await supabase
            .from("merchant_webhooks")
            .update({
              last_triggered_at: new Date().toISOString(),
              last_response_status: 0,
            })
            .eq("id", webhook.id);

          return {
            webhook_id: webhook.id,
            url: webhook.url,
            status: 0,
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
          };
        }
      })
    );

    console.log("Webhook trigger results:", results);

    return new Response(
      JSON.stringify({
        success: true,
        triggered: results.length,
        results: results.map((r) =>
          r.status === "fulfilled" ? r.value : { error: r.reason }
        ),
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Webhook trigger error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
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

async function generateSignature(payload: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(payload);
  const key = encoder.encode(secret);

  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    key,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign("HMAC", cryptoKey, data);

  return Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
