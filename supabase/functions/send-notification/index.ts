import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface SendNotificationRequest {
  merchant_id: string;
  title: string;
  message: string;
  type: string;
  data?: Record<string, unknown>;
  channels?: ("in_app" | "sms" | "whatsapp")[];
}

async function sendSMS(phone: string, message: string): Promise<{ success: boolean; error?: string }> {
  const twilioAccountSid = Deno.env.get("TWILIO_ACCOUNT_SID");
  const twilioAuthToken = Deno.env.get("TWILIO_AUTH_TOKEN");
  const twilioPhoneNumber = Deno.env.get("TWILIO_PHONE_NUMBER");

  if (!twilioAccountSid || !twilioAuthToken || !twilioPhoneNumber) {
    console.warn("Twilio credentials not configured - SMS not sent");
    return { success: false, error: "Twilio not configured" };
  }

  try {
    const url = `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`;
    const body = new URLSearchParams({
      To: phone,
      From: twilioPhoneNumber,
      Body: `Dypay: ${message}`,
    });

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${btoa(`${twilioAccountSid}:${twilioAuthToken}`)}`,
      },
      body: body.toString(),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Twilio error:", errorData);
      return { success: false, error: errorData.message || "Twilio API error" };
    }

    console.log("SMS sent successfully to:", phone);
    return { success: true };
  } catch (error) {
    console.error("SMS send error:", error);
    return { success: false, error: String(error) };
  }
}

async function sendWhatsApp(phone: string, message: string): Promise<{ success: boolean; error?: string }> {
  const whatsappApiToken = Deno.env.get("WHATSAPP_API_TOKEN");
  const whatsappPhoneNumberId = Deno.env.get("WHATSAPP_PHONE_NUMBER_ID");

  if (!whatsappApiToken || !whatsappPhoneNumberId) {
    console.warn("WhatsApp API credentials not configured - WhatsApp not sent");
    return { success: false, error: "WhatsApp not configured" };
  }

  try {
    const formattedPhone = phone.startsWith("+") ? phone.replace("+", "") : phone;
    const url = `https://graph.facebook.com/v21.0/${whatsappPhoneNumberId}/messages`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${whatsappApiToken}`,
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: formattedPhone,
        type: "text",
        text: { body: message },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("WhatsApp API error:", errorData);
      return { success: false, error: errorData.error?.message || "WhatsApp API error" };
    }

    console.log("WhatsApp message sent successfully to:", phone);
    return { success: true };
  } catch (error) {
    console.error("WhatsApp send error:", error);
    return { success: false, error: String(error) };
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body: SendNotificationRequest = await req.json();
    const { merchant_id, title, message, type, data, channels } = body;

    if (!merchant_id || !title || !message) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing required fields: merchant_id, title, message" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const defaultChannels = channels || ["in_app"];
    const results: Record<string, { success: boolean; error?: string }> = {};

    // Always create in-app notification
    if (defaultChannels.includes("in_app")) {
      const { error: notifError } = await supabase.from("merchant_notifications").insert({
        merchant_id,
        type: type || "payment",
        title,
        message,
        data: data || {},
        read: false,
      });

      results.in_app = notifError
        ? { success: false, error: notifError.message }
        : { success: true };
    }

    // Get merchant notification preferences
    const { data: merchant, error: merchantError } = await supabase
      .from("merchants")
      .select("notification_phone, sms_notifications_enabled, whatsapp_notifications_enabled, default_currency")
      .eq("id", merchant_id)
      .maybeSingle();

    if (merchantError || !merchant) {
      console.warn("Merchant not found for notification:", merchant_id);
      return new Response(
        JSON.stringify({ success: true, results, warning: "Merchant not found for SMS/WhatsApp" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const phone = merchant.notification_phone;

    // Send SMS if enabled
    if (defaultChannels.includes("sms") && merchant.sms_notifications_enabled && phone) {
      results.sms = await sendSMS(phone, message);
    } else if (defaultChannels.includes("sms") && !merchant.sms_notifications_enabled) {
      results.sms = { success: false, error: "SMS notifications disabled by merchant" };
    } else if (defaultChannels.includes("sms") && !phone) {
      results.sms = { success: false, error: "No phone number configured" };
    }

    // Send WhatsApp if enabled
    if (defaultChannels.includes("whatsapp") && merchant.whatsapp_notifications_enabled && phone) {
      results.whatsapp = await sendWhatsApp(phone, `Dypay - ${title}\n\n${message}`);
    } else if (defaultChannels.includes("whatsapp") && !merchant.whatsapp_notifications_enabled) {
      results.whatsapp = { success: false, error: "WhatsApp notifications disabled by merchant" };
    } else if (defaultChannels.includes("whatsapp") && !phone) {
      results.whatsapp = { success: false, error: "No phone number configured" };
    }

    return new Response(
      JSON.stringify({ success: true, results }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Send notification error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
