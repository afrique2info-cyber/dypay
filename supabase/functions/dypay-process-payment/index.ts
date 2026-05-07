import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey, X-API-Key, X-Signature",
};

async function verifySignature(
  payload: string,
  signature: string,
  secret: string
): Promise<boolean> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signatureBuffer = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(payload)
  );

  const expectedSignature = Array.from(new Uint8Array(signatureBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  return signature === expectedSignature;
}

interface PaymentRequest {
  amount: number;
  phone?: string;
  operator?: string;
  country?: string;
  currency?: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  item_ref?: string;
  return_url?: string;
  notify_url?: string;
  metadata?: any;
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

    const apiKey = req.headers.get("X-API-Key");
    const signature = req.headers.get("X-Signature");
    const authHeader = req.headers.get("Authorization");

    const rawBody = await req.text();
    const paymentRequest: PaymentRequest & { merchant_id?: string; transaction_id?: string } = JSON.parse(rawBody);

    let merchantId: string;
    let apiSecret: string | null = null;

    if (apiKey) {
      const { data: apiKeyData, error: apiKeyError } = await supabase
        .from("api_keys")
        .select("merchant_id, is_live, api_secret")
        .eq("api_key", apiKey)
        .maybeSingle();

      if (apiKeyError || !apiKeyData) {
        return new Response(
          JSON.stringify({ success: false, error: "Invalid API key" }),
          {
            status: 401,
            headers: {
              ...corsHeaders,
              "Content-Type": "application/json",
            },
          }
        );
      }

      merchantId = apiKeyData.merchant_id;
      apiSecret = apiKeyData.api_secret;

      if (signature) {
        const isValid = await verifySignature(rawBody, signature, apiSecret);
        if (!isValid) {
          return new Response(
            JSON.stringify({ success: false, error: "Invalid signature" }),
            {
              status: 401,
              headers: {
                ...corsHeaders,
                "Content-Type": "application/json",
              },
            }
          );
        }
      }
    } else if (authHeader && paymentRequest.merchant_id) {
      const token = authHeader.replace("Bearer ", "");
      const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
      const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
        global: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      });
      const { data: { user }, error: authError } = await supabaseClient.auth.getUser();

      if (authError || !user) {
        return new Response(
          JSON.stringify({ success: false, error: "Unauthorized", details: authError?.message }),
          {
            status: 401,
            headers: {
              ...corsHeaders,
              "Content-Type": "application/json",
            },
          }
        );
      }

      const { data: merchant, error: merchantError } = await supabase
        .from("merchants")
        .select("id")
        .eq("id", paymentRequest.merchant_id)
        .eq("auth_id", user.id)
        .maybeSingle();

      if (merchantError || !merchant) {
        return new Response(
          JSON.stringify({ success: false, error: "Merchant not found" }),
          {
            status: 403,
            headers: {
              ...corsHeaders,
              "Content-Type": "application/json",
            },
          }
        );
      }

      merchantId = paymentRequest.merchant_id;
    } else {
      return new Response(
        JSON.stringify({ success: false, error: "Authentication required" }),
        {
          status: 401,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    if (!paymentRequest.amount || paymentRequest.amount <= 0) {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid amount" }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const paymentRef = `DYP-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    let paymentData;
    let paymentError;

    if (paymentRequest.transaction_id) {
      const result = await supabase
        .from("pos_transactions")
        .select("*")
        .eq("id", paymentRequest.transaction_id)
        .maybeSingle();

      paymentData = result.data;
      paymentError = result.error;
    } else {
      const result = await supabase
        .from("payments")
        .insert({
          merchant_id: merchantId,
          payment_ref: paymentRef,
          amount: paymentRequest.amount,
          currency: paymentRequest.currency || "XAF",
          status: "pending",
          phone: paymentRequest.phone,
          operator: paymentRequest.operator,
          country: paymentRequest.country,
          first_name: paymentRequest.first_name,
          last_name: paymentRequest.last_name,
          email: paymentRequest.email,
          item_ref: paymentRequest.item_ref,
          metadata: {
            ...paymentRequest.metadata,
            api_key_used: apiKey,
            created_via: apiKey ? "api" : "pos",
          },
        })
        .select()
        .single();

      paymentData = result.data;
      paymentError = result.error;
    }

    if (paymentError) {
      console.error("Payment creation error:", paymentError);
      return new Response(
        JSON.stringify({ success: false, error: "Failed to create payment" }),
        {
          status: 500,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const paymentServiceKey = Deno.env.get("MONETBIL_SERVICE_KEY") || "PZIpSweYdE4e8BjM9LFbiUsHf77aGWIp";

    if (!paymentServiceKey) {
      console.error("Monetbil service key not configured");
      return new Response(
        JSON.stringify({ success: false, error: "Payment service not configured" }),
        {
          status: 500,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const commissionRate = 2.50;

    const itemRef = paymentRequest.item_ref || paymentRef;
    let txRef;
    if (paymentRequest.transaction_id) {
      txRef = `POS-${paymentRequest.transaction_id}`;
    } else if (paymentRequest.item_ref && paymentRequest.item_ref.startsWith('ORD-')) {
      txRef = paymentRequest.item_ref;
    } else {
      txRef = paymentData.id;
    }

    const paymentPayload = {
      amount: paymentRequest.amount,
      currency: paymentRequest.currency || "XAF",
      phone: paymentRequest.phone,
      phone_lock: paymentRequest.phone ? true : false,
      operator: paymentRequest.operator,
      country: paymentRequest.country,
      first_name: paymentRequest.first_name,
      last_name: paymentRequest.last_name,
      email: paymentRequest.email,
      item_ref: itemRef,
      payment_ref: txRef,
      return_url: paymentRequest.return_url || `${supabaseUrl}/payment/success`,
      notify_url: paymentRequest.notify_url || `${supabaseUrl}/functions/v1/monetbil-webhook`,
      locale: "fr",
    };

    console.log("Sending payment request to Monetbil:", JSON.stringify(paymentPayload));

    const paymentResponse = await fetch(
      `https://api.monetbil.com/widget/v2.1/${paymentServiceKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(paymentPayload),
      }
    );

    console.log("Monetbil response status:", paymentResponse.status);

    if (!paymentResponse.ok) {
      const errorText = await paymentResponse.text();
      await supabase
        .from("payments")
        .update({ status: "failed" })
        .eq("id", paymentData.id);

      return new Response(
        JSON.stringify({
          success: false,
          error: `Monetbil API error: ${errorText}`,
          details: `HTTP ${paymentResponse.status}`,
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

    const paymentResult = await paymentResponse.json();

    if (!paymentResult.success || !paymentResult.payment_url) {
      await supabase
        .from("payments")
        .update({ status: "failed" })
        .eq("id", paymentData.id);

      return new Response(
        JSON.stringify({
          success: false,
          error: paymentResult.error || "Failed to create payment",
          details: JSON.stringify(paymentResult),
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

    await supabase
      .from("payments")
      .update({ payment_url: paymentResult.payment_url })
      .eq("id", paymentData.id);

    const commissionAmount = (paymentRequest.amount * commissionRate) / 100;

    await supabase
      .from("payment_commissions")
      .insert({
        payment_id: paymentData.id,
        merchant_id: merchantId,
        transaction_amount: paymentRequest.amount,
        commission_percentage: commissionRate,
        commission_amount: commissionAmount,
        currency: paymentRequest.currency || "XAF",
      });

    if (apiKey) {
      await supabase
        .from("api_keys")
        .update({ last_used_at: new Date().toISOString() })
        .eq("api_key", apiKey);
    }

    return new Response(
      JSON.stringify({
        success: true,
        payment_url: paymentResult.payment_url,
        payment_ref: paymentRef,
        payment_id: paymentData.id,
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error processing payment:", error);
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
