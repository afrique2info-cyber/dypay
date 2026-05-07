import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface WithdrawalRequest {
  merchant_id: string;
  amount: number;
  currency: string;
  phone_number: string;
  pin: string;
}

interface MonetbilPayoutResponse {
  transaction_id?: string;
  status?: string;
  message?: string;
  success?: boolean;
}

async function hashPin(pin: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(pin);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}

async function verifyPin(supabase: any, merchantId: string, pin: string): Promise<{ valid: boolean; error?: string }> {
  const { data: pinData, error: pinError } = await supabase
    .from("withdrawal_pins")
    .select("*")
    .eq("merchant_id", merchantId)
    .maybeSingle();

  if (pinError || !pinData) {
    return { valid: false, error: "PIN not configured. Please set up your withdrawal PIN first." };
  }

  if (!pinData.is_active) {
    return { valid: false, error: "PIN is not active. Please contact support." };
  }

  if (pinData.locked_until && new Date(pinData.locked_until) > new Date()) {
    const lockMinutes = Math.ceil((new Date(pinData.locked_until).getTime() - Date.now()) / 60000);
    return { valid: false, error: `Account is locked. Try again in ${lockMinutes} minutes.` };
  }

  const hashedPin = await hashPin(pin);

  if (hashedPin !== pinData.pin_hash) {
    const newFailedAttempts = pinData.failed_attempts + 1;
    const lockUntil = newFailedAttempts >= 5 ? new Date(Date.now() + 30 * 60 * 1000) : null;

    await supabase
      .from("withdrawal_pins")
      .update({
        failed_attempts: newFailedAttempts,
        locked_until: lockUntil?.toISOString(),
      })
      .eq("merchant_id", merchantId);

    if (lockUntil) {
      return { valid: false, error: "Too many failed attempts. Account locked for 30 minutes." };
    }

    return { valid: false, error: `Incorrect PIN. ${5 - newFailedAttempts} attempts remaining.` };
  }

  await supabase
    .from("withdrawal_pins")
    .update({
      failed_attempts: 0,
      locked_until: null,
    })
    .eq("merchant_id", merchantId);

  return { valid: true };
}

async function processMonetbilPayout(
  amount: number,
  currency: string,
  phoneNumber: string,
  merchantId: string
): Promise<MonetbilPayoutResponse> {
  const MONETBIL_SERVICE_KEY = Deno.env.get("MONETBIL_SERVICE_KEY");

  if (!MONETBIL_SERVICE_KEY) {
    throw new Error("Monetbil service key not configured");
  }

  const monetbilPayoutUrl = "https://api.monetbil.com/payment/v1/payout";

  const payoutData = {
    service: MONETBIL_SERVICE_KEY,
    phonenumber: phoneNumber,
    amount: amount.toString(),
    currency: currency,
    item_ref: `WITHDRAWAL_${merchantId}_${Date.now()}`,
    payment_ref: `WD${Date.now()}${Math.random().toString(36).substring(7)}`,
  };

  try {
    const response = await fetch(monetbilPayoutUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payoutData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Monetbil payout failed:", errorText);
      return {
        success: false,
        message: `Monetbil API error: ${response.status}`,
      };
    }

    const result = await response.json();
    return {
      success: true,
      transaction_id: result.transaction_id || result.payment_ref,
      status: result.status || "processing",
      message: result.message || "Payout initiated successfully",
    };
  } catch (error) {
    console.error("Error processing Monetbil payout:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
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

    const requestData: WithdrawalRequest = await req.json();
    const { merchant_id, amount, currency, phone_number, pin } = requestData;

    if (!merchant_id || !amount || !currency || !phone_number || !pin) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Missing required fields: merchant_id, amount, currency, phone_number, pin",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (pin.length !== 4 || !/^\d{4}$/.test(pin)) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "PIN must be exactly 4 digits",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const pinVerification = await verifyPin(supabase, merchant_id, pin);
    if (!pinVerification.valid) {
      return new Response(
        JSON.stringify({
          success: false,
          error: pinVerification.error,
        }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const { data: balanceData, error: balanceError } = await supabase
      .from("merchant_balances")
      .select("*")
      .eq("merchant_id", merchant_id)
      .maybeSingle();

    if (balanceError || !balanceData) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Balance not found. Please contact support.",
        }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (balanceData.available_balance < amount) {
      return new Response(
        JSON.stringify({
          success: false,
          error: `Insufficient balance. Available: ${balanceData.available_balance} ${currency}`,
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const { data: configData } = await supabase
      .from("admin_config")
      .select("config_value")
      .eq("config_key", "withdrawal_fee_percentage")
      .eq("is_active", true)
      .maybeSingle();

    const feePercentage = configData?.config_value ? parseFloat(configData.config_value) : 1.5;
    const fees = (amount * feePercentage) / 100;
    const netAmount = amount - fees;

    const { data: withdrawalData, error: withdrawalError } = await supabase
      .from("withdrawals")
      .insert({
        merchant_id,
        amount,
        currency,
        phone_number,
        fees,
        net_amount: netAmount,
        status: "processing",
      })
      .select()
      .single();

    if (withdrawalError) {
      throw withdrawalError;
    }

    const payoutResult = await processMonetbilPayout(netAmount, currency, phone_number, merchant_id);

    if (!payoutResult.success) {
      await supabase
        .from("withdrawals")
        .update({
          status: "failed",
          error_message: payoutResult.message,
        })
        .eq("id", withdrawalData.id);

      return new Response(
        JSON.stringify({
          success: false,
          error: payoutResult.message || "Withdrawal processing failed",
          withdrawal_id: withdrawalData.id,
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    await supabase
      .from("withdrawals")
      .update({
        status: "completed",
        monetbil_transaction_id: payoutResult.transaction_id,
        completed_at: new Date().toISOString(),
      })
      .eq("id", withdrawalData.id);

    const newBalance = balanceData.available_balance - amount;
    const newTotalWithdrawn = balanceData.total_withdrawn + amount;

    await supabase
      .from("merchant_balances")
      .update({
        available_balance: newBalance,
        total_withdrawn: newTotalWithdrawn,
        last_withdrawal_at: new Date().toISOString(),
      })
      .eq("merchant_id", merchant_id);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Withdrawal processed successfully",
        withdrawal_id: withdrawalData.id,
        transaction_id: payoutResult.transaction_id,
        amount,
        fees,
        net_amount: netAmount,
        new_balance: newBalance,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );

  } catch (error) {
    console.error("Error processing withdrawal:", error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
