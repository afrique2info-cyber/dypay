import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

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

    const payload = await req.json();
    
    console.log("Dypay webhook received:", payload);

    const paymentRef = payload.payment_ref || payload.paymentRef;
    const status = payload.status;
    const transactionId = payload.transaction_id || payload.transactionId;

    if (!paymentRef) {
      throw new Error("Missing payment_ref in webhook payload");
    }

    let paymentStatus = "pending";
    if (status === "success" || status === "completed") {
      paymentStatus = "completed";
    } else if (status === "failed" || status === "error") {
      paymentStatus = "failed";
    } else if (status === "cancelled" || status === "canceled") {
      paymentStatus = "cancelled";
    }

    let data = null;
    let error = null;

    if (paymentRef.startsWith("POS-")) {
      const posId = paymentRef.replace("POS-", "");
      const result = await supabase
        .from("pos_transactions")
        .update({
          status: paymentStatus,
          payment_ref: transactionId,
          completed_at: paymentStatus === "completed" ? new Date().toISOString() : null,
        })
        .eq("id", posId)
        .select()
        .maybeSingle();

      data = result.data;
      error = result.error;
    } else if (paymentRef.startsWith("ORD-")) {
      const result = await supabase
        .from("orders")
        .update({
          status: paymentStatus,
          payment_ref: transactionId,
          updated_at: new Date().toISOString(),
        })
        .eq("order_number", paymentRef)
        .select()
        .maybeSingle();

      data = result.data;
      error = result.error;
    } else {
      const result = await supabase
        .from("payments")
        .update({
          status: paymentStatus,
          monetbil_transaction_id: transactionId,
          metadata: payload,
          updated_at: new Date().toISOString(),
        })
        .eq("payment_ref", paymentRef)
        .select()
        .maybeSingle();

      data = result.data;
      error = result.error;
    }

    if (error) {
      console.error("Database update error:", error);
      throw error;
    }

    if (!data) {
      console.warn("Payment not found:", paymentRef);
      return new Response(
        JSON.stringify({ success: false, error: "Payment not found" }),
        {
          status: 404,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    console.log("Payment updated successfully:", data);

    // Create in-app notification for the merchant
    if (data.merchant_id) {
      try {
        const notificationType = paymentRef.startsWith("POS-")
          ? "pos_transaction"
          : paymentRef.startsWith("ORD-")
          ? "order"
          : "payment";

        let notificationTitle = "";
        let notificationMessage = "";
        const amount = data.total_amount || data.amount || 0;
        const currency = data.currency || "XAF";

        if (paymentStatus === "completed") {
          notificationTitle = notificationType === "order"
            ? "Commande payee"
            : notificationType === "pos_transaction"
            ? "Paiement POS recu"
            : "Paiement recu";
          notificationMessage = notificationType === "order"
            ? `Commande ${paymentRef} - ${amount} ${currency} payee avec succes`
            : notificationType === "pos_transaction"
            ? `Transaction POS de ${amount} ${currency} completee`
            : `Paiement de ${amount} ${currency} (${data.phone || data.customer_phone || ""}) confirme`;
        } else if (paymentStatus === "failed") {
          notificationTitle = notificationType === "order"
            ? "Commande echouee"
            : notificationType === "pos_transaction"
            ? "Paiement POS echoue"
            : "Paiement echoue";
          notificationMessage = notificationType === "order"
            ? `Le paiement pour la commande ${paymentRef} a echoue`
            : notificationType === "pos_transaction"
            ? `La transaction POS de ${amount} ${currency} a echoue`
            : `Le paiement de ${amount} ${currency} a echoue`;
        }

        if (notificationTitle) {
          await supabase.from("merchant_notifications").insert({
            merchant_id: data.merchant_id,
            type: notificationType,
            title: notificationTitle,
            message: notificationMessage,
            data: {
              payment_ref: paymentRef,
              amount,
              currency,
              status: paymentStatus,
              transaction_id: transactionId,
            },
            read: false,
          });
          console.log("Notification created for merchant:", data.merchant_id);
        }
      } catch (notifError) {
        console.error("Error creating notification:", notifError);
      }
    }

    let webhookEvent = "";
    if (paymentRef.startsWith("POS-")) {
      webhookEvent = "pos.transaction.completed";
    } else {
      webhookEvent = paymentStatus === "completed" ? "payment.completed" : "payment.failed";
    }

    if (webhookEvent) {
      try {
        await fetch(`${supabaseUrl}/functions/v1/trigger-webhooks`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${supabaseServiceKey}`,
          },
          body: JSON.stringify({
            event: webhookEvent,
            merchant_id: data.merchant_id,
            data: data,
            timestamp: new Date().toISOString(),
          }),
        });
      } catch (webhookError) {
        console.error("Error triggering merchant webhooks:", webhookError);
      }
    }

    return new Response(
      JSON.stringify({ success: true, payment: data }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Webhook error:", error);
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
